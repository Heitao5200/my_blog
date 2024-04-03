## 重新排序的重要性

- 重新排序可以检索大量上下文，但并非所有上下文都与问题相关
- 重新排序允许对文档进行重新排序和过滤，将相关文档放在最前面，从而提高RAG的有效性

## **重新排名介绍**

![Image](img/Task31探索RAG重排序/640-20240403164429328)

## 重新排序的方法

### 重新排序模型

- 这些模型考虑文档和查询之间的交互特征，直接输出相似性得分。
- 使用交叉熵损失进行优化，允许相关性得分不限于特定范围。
- 可用的模型包括Cohere在线模型和开源模型如bge-reranker-base。

### 使用LLM作为重新排序器
- 利用LLM的深入语义理解能力进行文档重新排序。
- 方法包括微调LLM进行重新排序、提示LLM进行重新排序和使用LLM进行数据扩充。
- RankGPT是一种使用LLM执行zero-shot段落重新排序的方法。

## 实际演示
- 使用bge-reranker-base模型和LlamaIndex构建简单的检索器并进行基本检索。
- 通过RankGPT使用LLM进行重新排序，展示了如何提高检索结果的相关性。

## 评估
- 使用智源的bge-reranker-base模型进行评估，比较了使用重新排序模型和LLM作为重新排序器的效果。

## 结论
- 文章介绍了重新排序的原则和两种主流方法。
- 使用重新排序模型的方法开销较小，而使用LLM的方法在多个基准测试上表现良好但更昂贵。
- 在实际项目中，需要根据需求进行特定的权衡。

## 参考文献
- [1] Cohere在线模型: https://txt.cohere.com/rerank/
- [2] TinyLlama论文: https://arxiv.org/pdf/2401.02385.pdf
- [3] LlamaIndex源代码: https://github.com/run-llama/llama_index/blob/v0.9.29/llama_index/response/notebook_utils.py
- [4] RankGPT论文: https://arxiv.org/pdf/2304.09542.pdf
- [5] LlamaIndex RankGPT代码: https://github.com/run-llama/llama_index/blob/v0.9.45.post1/llama_index/postprocessor/rankGPT_rerank.py
- [6] 重新排序方法论文: https://arxiv.org/pdf/2304.09542.pdf
- [7] 基准测试论文: https://arxiv.org/pdf/2304.09542.pdf