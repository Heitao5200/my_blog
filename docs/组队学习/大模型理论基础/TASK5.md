# 模型训练

## 目标函数

1. 解码器（**Decoder-only**）的模型（例如，GPT-3）：计算单向上下文嵌入（contextual embeddings），一次生成一个token，目标函数是**负对数似然目标函数**
2. 编码器（**Encoder-only**）的模型（例如，BERT）：计算双向上下文嵌入
3. 编码器解码器（**Encoder-decoder**）模型（例如，T5）：编码输入，解码输出

### Decoder-only 模型

自回归语言模型定义了一个条件分布：

$$
p(x_i \mid x_{1:i-1}).
$$

我们将其定义如下：
- 将 $x_{1:i-1}$ 映射到上下文嵌入$\phi(x_{1:i-1})$。
- 应用嵌入矩阵 $E \in \R^{V \times d}$ 来获得每个token的得分 $E \phi(x_{1:i-1})_{i-1}$ 。
- 对其进行指数化和归一化，得到预测 $x_i$的 分布。

定义以下**负对数似然目标函数**：
$$
O(\theta) = \sum_{x \in D} - \log p_\theta(x) = \sum_{x \in D} \sum_{i=1}^L -\log p_\theta(x_i \mid x_{1:i-1}).
$$

### Encoder-only 模型

#### BERT

[BERT](https://arxiv.org/pdf/1810.04805.pdf)的目标函数，它包含以下两个部分：

- 掩码语言模型（Masked language modeling）
- 下一句预测（Next sentence prediction）

以自然语言推理（预测隐含、矛盾或中性）任务中的序列为例：

$$
x_{1:L} = [\text{[CLS]}, \text{all}, \text{animals}, \text{breathe}, \text{[SEP]}, \text{cats}, \text{breathe}].
$$

其中有两个特殊的token：
- $\text{[CLS]}$ ：包含用于驱动分类任务的嵌入
- $\text{[SEP]}$ ：用于告诉模型第一个序列（例如，前提）与第二个序列（例如，假设）的位置。

##### 掩码语言模型

掩码语言模型的基本思想是通过加噪然后预测来进行训练：

$$
[\text{the}, \text{[MASK]}, \text{ate}, \text{[MASK]}, \text{cheese}] \Rightarrow [\text{the}, \text{mouse}, \text{ate}, \text{the}, \text{cheese}].
$$

**建模**：给定输入 $\tilde x_{1:L}$ 及其上下文嵌入，模型独立地预测每个token：
$$
p(x_i \mid \tilde x_{1:L}) = \text{softmax}(E \phi(\tilde x_{1:L})_i).
$$

**掩码：** 定义了一个（随机）噪声函数 $A(\tilde x_{1:L} \mid x_{1:L})$ ：
$$
\underbrace{x_{1:L}}_\text{original} \stackrel{A}{\Rightarrow} \underbrace{\tilde x_{1:L}}_\text{noised}
$$

以下是 $A$ 的定义：
- 将15%的单词进行$\text{[MASK]}$

  - 80%的概率屏蔽掉

  - 10%的概率不变

  - 10%的概率随机生成



**减少分布偏移：** 如果我们总是使用 $\text{[MASK]}$ 来替换 15%中选定的token，则：

- 在训练期间，输入到BERT的都是带 $\text{[MASK]}$ 的序列。
- 而在测试时，输入没有 $\text{[MASK]}$ 的句子，这将导致分布发生变化。一种启发式的解决方法是在20%的时间内(此处指训练的时间)用真实单词替换。

##### 下一句预测

BERT是在拼接好的成对句子上训练的。下一句预测的目标是预测第二句是否跟随第一句。

$$
[\text{[CLS]}, \text{the}, \text{mouse}, \text{ate}, \text{the}, \text{cheese}, \text{[SEP]}, \text{it}, \text{was}, \text{full}] \Rightarrow 1.
$$

$$
[\text{[CLS]}, \text{the}, \text{mouse}, \text{ate}, \text{the}, \text{cheese}, \text{[SEP]}, \text{hello}, \text{world}] \Rightarrow 0.
$$

使用 $\text{[CLS]}$ 的嵌入来做二分类。

#### RoBERTa

[RoBERTa](https://arxiv.org/pdf/1907.11692.pdf)对BERT进行了以下改进：
- 删除了下一句预测这一目标函数（发现它没有帮助）。
- 使用更多数据训练（16GB文本  $\Rightarrow$ 160GB文本 ）。
- 训练时间更长。
- RoBERTa在各种基准上显著提高了BERT的准确性（例如，在SQuAD上由81.8到89.4）。

### Encoder-decoder 模型

编码器-解码器模型（例如，BART、T5）：
- 首先像BERT一样对输入进行双向编码。
- 然后像GPT-2一样对输出进行自回归解码。

#### BART (Bidirectional Auto-Regressive Transformers)

BART ([Lewis et al. 2019](https://arxiv.org/pdf/1910.13461.pdf))是基于Transformer的编码器-解码器模型。

- 使用与RoBERTa相同的编码器架构（12层，隐藏维度1024）。
- 使用与RoBERTa相同的数据进行训练（160GB文本）。

基于BERT的实验，最终模型进行以下了变换：
- 掩码文档中30%的token
- 将所有子句打乱

 

#### T5 (Text-to-Text Transfer Transformer)

Decoder中在自注意力层后还有一个标准的注意力层，这个标准的注意力层会将Encoder的输出参与到注意力的计算当中。

Decoder的自注意力机制采用了自回归的通用注意力，即每个元素在计算注意力时只能考虑其前面位置的输出。

Decoder 的最后一层，通过 Softmax 分类器输出每个元素属于每个词的概率

Softmax 分类器的权重与模型最前面的 Token Embedding 矩阵共享权重。

T5与原生的Transformer结构非常类似，区别在于：

1. 作者采用了一种简化版的Layer Normalization，去除了Layer Norm 的bias；将Layer Norm放在残差连接外面。

2. 位置编码：

3. T5每个位置编码都是一个标量，被加到 logits 上用于计算注意力权重。

4. 各层共享位置编码，但是在同一层内，不同的注意力头的位置编码都是独立学习的。

5. 每一个Embedding对应一个可能的 key-query 位置差。作者学习了32个Embedding，至多适用于长度为128的位置差，超过位置差的位置编码都使用相同的Embedding。

   



## 优化算法

将注意力转向如何优化目标函数。为了简单起见，让我们以自回归语言模型为例：

$$
O(\theta) = \sum_{x \in D} -\log p_\theta(x).
$$

### 随机梯度下降（SGD）

最简单的优化算法是用小批量进行随机梯度下降，该算法的步骤如下：
- 初始化参数 $\theta_0$ 
- 重复以下步骤：
    - 采样小批量 $B_t \subset D$ 
    - 根据梯度更新参数：
    
$$
\theta_t \leftarrow \theta_{t-1} - \eta \frac{1}{|B_t|} \sum_{x \in B_t} \nabla_\theta (-\log p_\theta(x)).
$$



缺点：

- 对于常出现的特征更新慢一些 
- SGD容易收敛到局部最优，并且在某些情况下可能被困在鞍点。



### Adam (adaptive moment estimation)

[Adam](https://arxiv.org/pdf/1412.6980.pdf)算法拥有以下两个创新：
1. 引入动量（继续朝同一方向移动）。
2. 参数 $\theta_0$ 的每个维度都有一个自适应（不同）的步长（受二阶方法启发）。

它的步骤如下：
- 初始化参数 $\theta_0$ 
- 初始化动量 $m_0, v_0 \leftarrow 0$ 
- 重复以下步骤：
    - 采样小批量 $B_t \subset D$ 
    - 按照如下步骤更新参数：
    - 计算梯度
    - 更新一阶、二阶动量
    - 对偏差进行修正
    - 更新参数
    

**优点：**

- 结合了Adagrad善于处理稀疏梯度和RMSprop善于处理非平稳目标的优点
- 对内存需求较小
- **为不同的参数计算不同的自适应学习率**
- 也适用于大多非凸优化 - 适用于大数据集和高维空间

### AdaFactor

[AdaFactor](https://arxiv.org/pdf/1804.04235.pdf)是一种为减少存储占用的优化算法。它有如下特点：
- 它不储存 $m_t,v_t$ 这样的 $O(m \times n)$ 矩阵，而是存储行和列的和 $O(m + n)$ 并重构矩阵
- 去除动量
- 它被用来训练T5
- AdaFactor可能使训练变得困难（见[Twitter thread](https://twitter.com/_arohan_/status/1468673364889726985?s=20&amp;t=i7E0NN5ytysukMGVWG7lfQ)和[blog post](https://blog.ceshine.net/post/adafactor/)）

### 混合精度训练

- 通常来说，默认的精度是：FP32（32位浮点）
- 其他可选精度：FP16（16位浮点），但问题是任何小于 $2^{-24}$ 的值都会变为0。
- 解决方案：将主权重存储在FP32中，并在FP16中执行其他所有操作。
- 损失缩放：按比例放大损失，以避免梯度数值太小。
- 结果：存储减少了一半。

### 学习率

- 学习率会随着时间的推移而衰减。

### 初始化

- 给定矩阵 $W \in \mathbb{R}^{m \times n}$ ，标准初始化（即，xavier初始化）为 $W_{ij} \sim N(0, 1/n)$ 。
- GPT-2和GPT-3通过额外的 $1/\sqrt{N}$ 缩放权重，其中 $N$ 是残差层的数量。
- T5将注意力矩阵增加一个 $1/\sqrt{d}$ ([代码](https://github.com/tensorflow/mesh/blob/master/mesh_tensorflow/transformer/attention.py#L459)）。

### GPT-3 参数 

- Adam参数： $\beta_1 = 0.9, \beta_2 = 0.95, \epsilon = 10^{-8}$ 
- 批量小：320万个token（约1500个序列）
- 使用梯度剪裁（ $g_t \leftarrow g_t / \min(1, \|g\|_2)$ ）
- 线性学习率预热（前3.75亿个token）
- [余弦学习率](https://arxiv.org/pdf/1608.03983v5.pdf)衰减到10%
- 逐渐增加批大小
- 权重衰减设为0.1

