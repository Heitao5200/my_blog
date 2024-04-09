## 重新排序的重要性

- 重新排序可以检索大量上下文，但并非所有上下文都与问题相关
- 重新排序允许对文档进行重新排序和过滤，将相关文档放在最前面，从而提高RAG的有效性

## **重新排名介绍**

重新排序的任务是评估这些上下文的相关性，并优先考虑最有可能提供准确和相关答案的上下文，让LLM在生成答案时优先考虑这些排名靠前的上下文，从而提高响应的准确性和质量。

重新排名就像在开卷考试中帮助你从一堆学习材料中选择最相关的参考文献，这样你就可以更高效、更准确地回答问题。

![Image](img/Task31探索RAG重排序/640-20240403164429328)

## 重新排序的方法

- 重新排序模型

  - 重新排序模型以**查询**和**上下文**为输入，直接输出相似性得分
  - 重新排序模型是使用交叉熵损失进行优化的，允许相关性得分不限于特定范围，甚至可能是负的

  - 可用的模型包括Cohere在线模型和开源模型如bge-reranker-base。


- 使用LLM作为重新排序器

  - 利用LLM的深入语义理解能力进行文档重新排序。

  - 方法包括微调LLM进行重新排序、提示LLM进行重新排序和使用LLM进行数据扩充。

  - RankGPT是一种使用LLM执行zero-shot段落重新排序的方法。


### **使用重新排序模型作为重新排序**

- **Cohere**在线模型，可以通过API访问

- 开源重排模型：**bge-reranker-base**和**bge-reanker-large**

- 命中率和平均倒数排名（MRR）指标的评估结果

  ![Image](img/Task31探索RAG重排序/640-20240403170822056)

​	- TODO 代码实战

### **使用LLM作为重新排序器**

- 使用重新排序任务对LLM进行微调；
  -  RankGPT的想法是使用LLM执行zero-shot 段落重新排序
  - 应用排列生成方法和滑动窗口策略来有效地对段落进行重新排序
  - 使用RankGPT，该演示已集成到LlamaIndex (# TODO)

- 提示LLM进行重新排序；

- 在训练过程中使用LLM进行数据扩充

- 主要思路

  - 引入了一种滑动窗口方法，它遵循了气泡排序的思想
  - 每次只对前4个文本进行排序，然后移动窗口，对随后的4个文本排序
  - 在对整个文本进行迭代后，我们可以获得性能最好的最优文本。

  <img src="img/Task31探索RAG重排序/640-20240403172756470" alt="Image" style="zoom:50%;" />



## 结论

- 使用重新排序模型的方法开销较小，使用LLM的方法在多个基准测试上表现良好但更昂贵。在实际项目中，需要根据需求进行特定的权衡。

## 参考文献
- [1] Cohere在线模型: https://txt.cohere.com/rerank/
- [2] TinyLlama论文: https://arxiv.org/pdf/2401.02385.pdf
- [3] LlamaIndex源代码: https://github.com/run-llama/llama_index/blob/v0.9.29/llama_index/response/notebook_utils.py
- [4] RankGPT论文: https://arxiv.org/pdf/2304.09542.pdf
- [5] LlamaIndex RankGPT代码: https://github.com/run-llama/llama_index/blob/v0.9.45.post1/llama_index/postprocessor/rankGPT_rerank.py
- [6] 重新排序方法论文: https://arxiv.org/pdf/2304.09542.pdf
- [7] 基准测试论文: https://arxiv.org/pdf/2304.09542.pdf
- https://mp.weixin.qq.com/s?__biz=Mzg3NDIyMzI0Mw==&mid=2247488788&idx=1&sn=a55da13994ba5d0b24d1ae28f7f79e5f&chksm=ced556f0f9a2dfe672095c076674990eb7b5e3c80ca87b092771def1c8112dc0efabd641f717&cur_album_id=3377833073308024836&scene=189#wechat_redirect