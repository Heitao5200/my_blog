# RAG理论学习笔记

## 一、摄取阶段

### 1.1 数据清理
- 数据需干净且准确，避免信息冲突误导LLM。
- 应用基本数据清理技术，如特殊字符正确编码。

### 1.2 分块
- 将长文档分解成更小的部分或组合较小片段成段落。
- 块的理想长度取决于用例，如问答需短块，摘要需长块。
- 考虑块之间的“滚动窗口”以保证语义连贯性。

### 1.3 嵌入模型
- 嵌入模型质量影响检索结果。
- 维度越高，精度越高。
- 可微调嵌入模型以避免领域外问题。
- 注意：并非所有嵌入模型可微调。

### 1.4 元数据
- 存储矢量嵌入时，可与元数据一起存储。
- 元数据注释有助于搜索结果后处理。

### 1.5 多重索引
- 若元数据不足以分离上下文，可使用多个索引。

### 1.6 索引算法
- 使用近似最近邻（ANN）搜索而非k最近邻（kNN）。
- 参考ANN算法：Faiss、Annoy、ScaNN、HNSWLIB。
- 考虑矢量压缩，但会损失精度。

## 二、推理阶段（检索和生成）

### 2.1 查询转换
- 影响搜索结果。
- 技术包括：
  - 重新表述：使用LLM重新表述查询。
  - 假设文档嵌入（HyDE）：生成假设响应用于检索。
  - 子查询：分解长查询为短查询。

### 2.2 检索参数
- 考虑是否使用语义搜索或混合搜索。
- 调整参数alpha，控制语义和关键字搜索权重。
- 检索结果数量影响上下文窗口长度。

### 2.3 高级检索策略
- 检索块与生成块可不同。
- 策略包括：
  - 句子窗口检索：检索句子前后句子。
  - 自动合并检索：合并相关小块到大上下文。

### 2.4 重新排序模型
- 帮助消除不相关搜索结果。
- 计算查询相关性得分。
- 微调重新排序器。

### 2.5 LLM
- 生成响应的核心组件。
- 选择考虑因素：开源或专有模型、推理成本、上下文长度。

### 2.6 Prompt工程
- 提示设计影响LLM完成。
- 使用few-shot示例提高生成质量。
- 上下文数量是超参数，影响性能。

## 参考文献
0. https://mp.weixin.qq.com/s/inUs__3fGFkXPT-Ge5wSmw
1. [LangChain文档转换器](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
2. [MTEB排行榜](https://huggingface.co/spaces/mteb/leaderboard)
3. [Facebook Faiss](https://github.com/facebookresearch/faiss)
4. [Spotify Annoy](https://github.com/spotify/annoy)
5. [Google ScaNN](https://github.com/google-research/google-research/tree/master/scann)
6. [HNSWLIB](https://github.com/nmslib/hnswlib)
7. [Weaviate博客](https://weaviate.io/blog/rag-evaluation?source=post_page-----7ca646833439--------------------------------#indexing-knobs)
8. [GPT-Index查询转换](https://gpt-index.readthedocs.io/en/v0.6.9/how_to/query/query_transformations.html)
9. [混合搜索改进](https://towardsdatascience.com/improving-retrieval-performance-in-rag-pipelines-with-hybrid-search-c75203c2f2f5?source=post_page-----7ca646833439--------------------------------)
10. [Cohere重新排序模型](https://cohere.com/rerank?ref=txt.cohere.com&_hstc=14363112.8fc20f6b1a1ad8c0f80dcfed3741d271.1697800567394.1701091033915.1701173515537.7&_hssc=14363112.1.1701173515537&_hsfp=3638092843)