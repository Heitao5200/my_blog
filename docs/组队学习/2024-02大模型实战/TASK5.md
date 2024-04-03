# LMDeploy 的量化和部署

## 大模型部署背景

随着大模型参数规模的不断增长，在有限的算力资源下，提升模型的推理速度逐渐变为一个重要的研究方向。为了满足性能和效率的要求，常常对需要对模型进行优化，例如模型压缩和硬件加速。

常用的推理加速框架包含**lmdeploy、FasterTransformer和vLLM**等。

### 模型部署

lmdeploy由上海人工智能实验室开发，推理使用C++/CUDA，对外提供python/gRPC/http接口和WebUI界面

- 支持tensor parallel分布式推理、
- 支持fp16/weightint4/kv cache int8量化。
- lmdeploy支持transformer结构（例如LLaMA、LLaMa2、InternLM、Vicuna等）
- 支持fp16，int8和int4。

#### 产品形态

- 云端

- 边缘计算端

- 移动端

#### 计算设备

CPU、GPU、NPU、TPU等

#### 大模型特点

- 内存开销巨大
  - 庞大的参数量。7B模型仅权重就需要14+G内存
  - 采用自回归生成token，需要缓存Attention的k/v，带来巨大的内存开销
- 动态shape
  - 请求数不固定
  - Token逐个生成，且数量不定
- 相对视觉模型，LLM结构简单
  - Transformers结构，大部分使decoder-only 

### 大模型部署挑战

- 设备
  - 如何应对巨大的存储问题？低存储设备（消费级显卡、手机等）如何部署？

- 推理
  - 如何加速token的生成速度
  - 如何解决动态shape，让推理可以不间断
  - 如何有效管理和利用内存
- 服务
  - 如何提升系统整体吞吐量？
  - 对于个体用户，如何降低响应时间？

### 大模型部署方案

- 技术点
  - 模型并行
  - 低比特量化
  - Page Attention
  - transformer计算和访存优化
  - Continuous Batch
    ...
- 方案
  - huggingface transformers
  - 专门的推理加速框架
  - 云端
    - Imdeploy
    - vllm
    - tensorrt-llm
    - deepspeed
      ...
  - 移动端
    - llama.cpp
    - mlc-llm

### LMDeploy简介

LMDeploy 是 LLM 在**英伟达设备**上部署的全流程解决方案。包括模型轻量化、推理和服务。

![image-20240114101250248](img/TASK5//image-20240114101250248.png)

opencompass是测评工具

#### 推理性能

![image-20240114101932898](img/TASK5//image-20240114101932898.png)

#### 量化

**计算密集 (compute-bound)** : 推理的绝大部分时间消耗在**数值计算**上针对计算密集场景，可以通过使用更快的硬件计算单元来提升计算速度比如量化为 W8A8 使用 INT8 Tensor Core 来加速计算。
**访存密集 (memory-bound)** : 推理时，绝大部分时间消耗在**数据读取**上;针对访存密集型场景，一般是通过提高计算访存比来提升性能。

#### LLM 是典型的访存密集型任务

常见的 LLM 模型是 Decoder Only 架构。推理时**大部分时间消耗在逐Token 生成阶段** (Decoding 阶段) ，是典型的访存密集型场景如图，A100 的 FP16 峰值算力为 312 TFLOPS，只有在 Batch Size 达到128 这个量级时，计算才成为推理的瓶颈，但由于 LLM 模型本身就很**大推理时的 KV Cache 也会占用很多显存**，还有一些其他的因素影响 (如Persistent Batch) ，实际推理时很难做到 128 这么大的 Batch Size。

####  Weight Only 量化一举多得

- ﻿﻿4bit Weight Onily 量化，将FP16 的模型权重量化为INT4，访存量直接降为 FP16模型的 1/4，大幅降低了访
   存成本，提高了 Decoding 的速度。
- ﻿﻿加速的同时还节省了显存，同样的设备能够支持更大的模型以及更长的对话长度

![image-20240114104803913](img/TASK5//image-20240114104803913.png)



#### 如何做 Weight Only 的量化？

LMDeploy 使用 MIT HAN LAB 开源的**AWQ** 算法，量化为 4bit 模型

- ﻿推理时，先把 4bit 权重，反量化回 FP16（在Kernel 内部进行，从Global Memory 读取时仍是 4bit），依旧使用的是 FP16 计算
- ﻿相较于社区使用比较多的GPTQ 算法，AWQ 的推理速度更快，量化的时间更短

![image-20240114105205651](img/TASK5//image-20240114105205651.png)

#### 推理引擎TurboMind

![image-20240114105426994](img/TASK5//image-20240114105426994.png)



##### 持续批处理

**请求队列**

- 推理请求首先先加入到请求队列中

**Persistent线程**

- 若batch中有空闲槽位，从队列拉取请求，尽量填满空闲槽位。若无，继续对当前batch中的请求进行forward。
- Batch每forward完一次。
- 转步骤1。

![image-20240114110923997](img/TASK5//image-20240114110923997.png)

##### 有状态的推理

![image-20240114111011054](img/TASK5//image-20240114111011054.png)

##### Blocked k/v cache

支持Paged Attention、支撑有状态推理。

#### 

![image-20240114111057510](img/TASK5//image-20240114111057510.png)

##### 高性能的cuda kernel

![image-20240114111142156](img/TASK5//image-20240114111142156.png)

#### 核心功能-推理服务 api server

![image-20240114111250888](img/TASK5//image-20240114111250888.png)



## 动手实践

### 创建环境

````
conda create -n lmdeploy --clone /share/conda_envs/internlm-base
conda env list
conda activate lmdeploy
pip install packaging
# 使用 flash_attn 的预编译包解决安装过慢问题
pip install /root/share/wheels/flash_attn-2.4.2+cu118torch2.0cxx11abiTRUE-cp310-cp310-linux_x86_64.whl
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple 'lmdeploy[all]==v0.1.0'
````

### 服务部署

![image-20240114210001988](img/TASK5//image-20240114210001988.png)

我们把从架构上把整个服务流程分成下面几个模块。

- 模型推理/服务。主要提供模型本身的推理，一般来说可以和具体业务解耦，专注模型推理本身性能的优化。可以以模块、API等多种方式提供。
- Client。可以理解为前端，与用户交互的地方。
- API Server。一般作为前端的后端，提供与产品和服务相关的数据和功能支持。

值得说明的是，以上的划分是一个相对完整的模型，但在实际中这并不是绝对的。比如可以把“模型推理”和“API Server”合并，有的甚至是三个流程打包在一起提供服务。

### 模型转换

TurboMind 推理模型需要先将模型转化为 TurboMind 的格式，目前支持在线转换和离线转换两种形式。

- 在线转换可以直接加载 Huggingface 模型，

- 离线转换需需要先保存模型再加载。

#### 在线转换

lmdeploy 支持直接读取 Huggingface 模型权重，目前共支持三种类型：

- 在 huggingface.co 上面通过 lmdeploy 量化的模型，如 [llama2-70b-4bit](https://huggingface.co/lmdeploy/llama2-chat-70b-4bit), [internlm-chat-20b-4bit](https://huggingface.co/internlm/internlm-chat-20b-4bit)
- huggingface.co 上面其他 LM 模型，如 Qwen/Qwen-7B-Chat

````
# 需要能访问 Huggingface 的网络环境
lmdeploy chat turbomind internlm/internlm-chat-20b-4bit --model-name internlm-chat-20b
lmdeploy chat turbomind Qwen/Qwen-7B-Chat --model-name qwen-7b
````

直接启动本地的 Huggingface 模型，如下所示。

```bash
lmdeploy chat turbomind /share/temp/model_repos/internlm-chat-7b/  --model-name internlm-chat-7b
```

![image-20240114211611876](img/TASK5//image-20240114211611876.png)



#### 离线转换

离线转换需要在启动服务之前，将模型转为 lmdeploy TurboMind  的格式，如下所示。

```bash
# 转换模型（FastTransformer格式） TurboMind
lmdeploy convert internlm-chat-7b /path/to/internlm-chat-7b
```

这里我们使用官方提供的模型文件，就在用户根目录执行，如下所示。

```bash
lmdeploy convert internlm-chat-7b  /root/share/temp/model_repos/internlm-chat-7b/
```

![image-20240114212958089](img/TASK5//image-20240114212958089.png)

`weights` 和 `tokenizer` 目录分别放的是拆分后的参数和 Tokenizer。如果我们进一步查看 `weights` 的目录，就会发现参数是按层和模块拆开的，如下图所示。

<img src="img/TASK5//image-20240114213117891.png" alt="image-20240114213117891" style="zoom:25%;" />

每一份参数第一个 0 表示“层”的索引，后面的那个0表示 Tensor 并行的索引，因为我们只有一张卡，所以被拆分成 1 份。如果有两张卡可以用来推理，则会生成0和1两份，也就是说，会把同一个参数拆成两份。比如 `layers.0.attention.w_qkv.0.weight` 会变成 `layers.0.attention.w_qkv.0.weight` 和 `layers.0.attention.w_qkv.1.weight`。执行 `lmdeploy convert` 命令时，可以通过 `--tp` 指定（tp 表示 tensor parallel），该参数默认值为1（也就是一张卡）。

**关于Tensor并行**

Tensor并行一般分为行并行或列并行，原理如下图所示。

![](img/TASK5/6.png)

<p align="center">列并行<p>


![](img/TASK5/7.png)

<p align="center">行并行<p>


简单来说，就是把一个大的张量（参数）分到多张卡上，分别计算各部分的结果，然后再同步汇总。

#### TurboMind 推理+命令行本地对话

这里支持多种方式运行，比如Turbomind、PyTorch、DeepSpeed。但 PyTorch 和 DeepSpeed 调用的其实都是 Huggingface 的 Transformers 包，PyTorch表示原生的 Transformer 包，DeepSpeed 表示使用了 DeepSpeed 作为推理框架。Pytorch/DeepSpeed 目前功能都比较弱，不具备生产能力，不推荐使用。



````
lmdeploy chat turbomind ./workspace
````

![image-20240114221237188](img/TASK5//image-20240114221237188.png)



#### TurboMind推理+API服务

”模型推理/服务“目前提供了 Turbomind 和 TritonServer 两种服务化方式。此时，Server 是 TurboMind 或 TritonServer，API Server 可以提供对外的 API 服务。我们推荐使用 TurboMind，TritonServer 使用方式详见《附录1》。

````
lmdeploy serve api_server ./workspace \
	--server_name 0.0.0.0 \
	--server_port 23333 \
	--instance_num 64 \
	--tp 1
# server_name ——服务地址
# server_port——端口
# tp——Tensor 并行
# instance_num——实例数，可以理解成 Batch 的大小


````

![image-20240114222141173](img/TASK5//image-20240114222141173.png)

本地开启端口映射

````
ssh -CNg -L 23333:127.0.0.1:23333 root@ssh.intern-ai.org.cn -p  35155
````

![image-20240114222010069](img/TASK5//image-20240114222010069.png)

````
curl -X 'POST'  'http://localhost:23333/v1/chat/completions'   -H 'accept:application/json'  -H 'Content-Type:application/json' -d '{
  "model": "internlm-chat-7b",
  "messages": "写一首春天的诗",
  "temperature": 0.7,
  "top_p": 1,
  "n": 1,
  "max_tokens": 512,
  "stop": false,
  "stream": false,
  "presence_penalty": 0,
  "frequency_penalty": 0,
  "user": "string",
  "repetition_penalty": 1,
  "renew_session": false,
  "ignore_eos": false
}'
````

![image-20240114225511734](img/TASK5//image-20240114225511734.png)

### 网页 Demo 演示

这一部分主要是将 Gradio 作为前端 Demo 演示。在上一节的基础上，我们不执行后面的 `api_client` 或 `triton_client`，而是执行 `gradio`。

````
ssh -CNg -L 6006:127.0.0.1:6006 root@ssh.intern-ai.org.cn -p 35155

````

#### TurboMind 服务作为后端

API Server 的启动和上一节一样，这里直接启动作为前端的 Gradio。





#### TurboMind 服务作为后端

![image-20240114230817661](img/TASK5//image-20240114230817661.png)

![image-20240114231932600](img/TASK5//image-20240114231932600.png)

#### TurboMind 推理 + Python 代码集成



```python
from lmdeploy import turbomind as tm

# load model
model_path = "/root/share/temp/model_repos/internlm-chat-7b/"
tm_model = tm.TurboMind.from_pretrained(model_path, model_name='internlm-chat-20b')
generator = tm_model.create_instance()

# process query
query = "你好啊兄嘚"
prompt = tm_model.model.get_prompt(query)
input_ids = tm_model.tokenizer.encode(prompt)

# inference
for outputs in generator.stream_infer(
        session_id=0,
        input_ids=[input_ids]):
    res, tokens = outputs[0]

response = tm_model.tokenizer.decode(res.tolist())
print(response)
```

在上面的代码中，我们首先加载模型，然后构造输入，最后执行推理。

加载模型可以显式指定模型路径，也可以直接指定 Huggingface 的 repo_id，还可以使用上面生成过的 `workspace`。这里的 `tm.TurboMind` 其实是对 C++ TurboMind 的封装。



![image-20240114232617596](img/TASK5//image-20240114232617596.png)





参考资料：

 [Llama2-Chinese项目](https://www.cnblogs.com/shengshengwang/category/2349375.html)



## 作业

提交方式：在各个班级对应的 GitHub Discussion 帖子中进行提交。 

**基础作业：**

- 使用 LMDeploy 以本地对话、网页Gradio、API服务中的一种方式部署 InternLM-Chat-7B 模型，生成 300 字的小故事（需截图）

**进阶作业（可选做）**

- 将第四节课训练自我认知小助手模型使用 LMDeploy 量化部署到 OpenXLab 平台。
- 对internlm-chat-7b模型进行量化，并同时使用KV Cache量化，使用量化后的模型完成API服务的部署，分别对比模型量化前后和 KV Cache 量化前后的显存大小（将 bs设置为 1 和 max len 设置为512）。  
- 在自己的任务数据集上任取若干条进行Benchmark测试，测试方向包括：  
  （1）TurboMind推理+Python代码集成  
  （2）在（1）的基础上采用W4A16量化  
  （3）在（1）的基础上开启KV Cache量化  
  （4）在（2）的基础上开启KV Cache量化  
  （5）使用Huggingface推理

备注：**由于进阶作业较难，完成基础作业之后就可以先提交作业了，在后续的大作业项目中使用这些技术将作为重要的加分点！**

**整体实训营项目：**

时间周期：即日起致课程结束

即日开始可以在班级群中随机组队完成一个大作业项目，一些可提供的选题如下：

- 人情世故大模型：一个帮助用户撰写新年祝福文案的人情事故大模型
- 中小学数学大模型：一个拥有一定数学解题能力的大模型
- 心理大模型：一个治愈的心理大模型
- 工具调用类项目：结合 Lagent 构建数据集训练 InternLM 模型，支持对 MMYOLO 等工具的调用

其他基于书生·浦语工具链的小项目都在范围内，欢迎大家充分发挥想象力。







课程上新啦，今天带小伙伴们使用 LMDeploy 量化部署你的 InternLM 大模型，体验极致的推理速度和显存优化，作业在文档末尾~

文档：https://github.com/InternLM/tutorial/blob/vansin-patch-4/lmdeploy/lmdeploy.md
视频：https://www.bilibili.com/video/BV1iW4y1A77P

笔记提交链接：
https://github.com/InternLM/tutorial/discussions/149
作业提交链接：
https://github.com/InternLM/tutorial/discussions/153

算力中午时已经给大家补充到 56 点了，觉得不错欢迎 star

https://github.com/internLM/lmdeploy