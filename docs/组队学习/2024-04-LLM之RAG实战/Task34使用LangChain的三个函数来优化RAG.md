## 检索增强生成（RAG）简介
- RAG是一种结合大型语言模型（LLM）的技术，用于利用外部知识并减少LLM产生的幻觉。
- **基本RAG可能存在问题**，如检索出与用户提示不相关的文档，导致LLM无法准确总结答案。

## LangChain优化RAG的三种方法
1. **多查询检索器（Multi Query Retriever）**
   - 适用场景：用户提示不具体，需要检索出更多相关文档。
   - 原理：使用LLM对原始查询生成更多问题，并检索相关文档。
   - 目的：解决用户提示不具体的情况，提高检索的相关性。

2. **长上下文重排序（Long Context Reorder）**
   - 适用场景：需要从向量数据库返回10个以上文档的情况(文本分块很短，向量数据库存储了很多块)。
   - 原理：使用LLM对文档进行排序，使得相关文档位于文档列表的开头和末尾。
   - 目的：避免LLM在处理大量文档时丢失上下文。

3. **上下文压缩（Contextual Compression）**
   - 适用场景：向量数据库中的块包含大量Token和不相关信息。
   - 原理：使用LLM对文档进行压缩，LLM删除检索到的文档中不相关的段落，只保留相关信息。
   - 目的：减少向量数据库的存储空间，提高检索速度。


## 实战：使用LangChain优化RAG
# TODO 添加实战代码
 
## 参考资料 
[https://mp.weixin.qq.com/s/AdntjtmkNB_AwgbyvM31ng](https://mp.weixin.qq.com/s/AdntjtmkNB_AwgbyvM31ng)