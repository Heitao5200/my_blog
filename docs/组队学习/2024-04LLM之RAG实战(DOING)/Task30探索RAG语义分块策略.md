## RAG语义分块

解析文档后，我们可以获得结构化或半结构化的数据。现在的主要任务是将它们分解成更小的块来提取详细的特征。由于严格的预定义规则（块大小或重叠部分的大小），**基于规则的分块**很容易导致检索上下文不完整或包含噪声的块大小过大等问题。**语义分块**旨在确保每个分块包含尽可能多的语义独立信息。

![Image](img/Task30探索RAG语义分块策略/640-20240403174249911)

## 语义分块的重要性

- 分块策略旨在确保每个分块包含尽可能多的语义独立信息。
- 有助于提高RAG过程中的检索质量和生成答案的准确性。

## 语义分块的方法

### 基于Embedding的方法

splitter.get_nodes_from_documents函数的主要过程

<img src="img/Task30探索RAG语义分块策略/640-20240404130729688" alt="Image" style="zoom:25%;" />

- 使用LlamaIndex和Langchain提供的语义分块器，基于滑动窗口计算句子之间的相似度。
- 通过安装特定版本的LlamaIndex来访问语义分块器。

### 基于Model的方法
- **NaiveBERT**: 利用BERT的预训练过程，通过二元分类任务来预测句子间的关系。
- **CrossSegmentAttention**: 提出了三种跨段注意力模型，用于文本分割。
- **SeqModel**: 使用BERT同时对多个句子进行编码，预测文本分割点。

### 基于LLM的方法
- 通过构建提示和与LLM的交互来提取所谓的命题。
- LlamaIndex和Langchain实现了相关的算法，用于从文档中提取命题。

## 实际演示
- 使用BERT论文作为测试文档，展示了基于Embedding的方法和基于LLM的方法的运行结果。
- 通过安装和使用LlamaIndex的DenseXRetrievalPack，初步学习了如何使用该类。

## 结论
- 文章讨论了三种类型的语义分块方法的原理和实现方法，并提供了一些综述。
- 语义分块是一种更优雅的方式，也是优化RAG的关键。
- 基于LLM的方法虽然依赖于LLM，但实现了更精细的分块，为语义分块提供了新的思路。

## 参考文献
- [1] Langchain文本分割器: https://github.com/langchain-ai/langchain/blob/v0.1.9/libs/langchain/langchain/text_splitter.py#L851C1-L851C6
- [2] BERT论文: https://arxiv.org/pdf/1810.04805.pdf
- [3] CrossSegmentAttention论文: https://arxiv.org/abs/2004.14535
- [4] CrossSegmentAttention训练代码: https://github.com/aakash222/text-segmentation-NLP/
- [5] SeqModel论文: https://arxiv.org/pdf/2107.09278.pdf
- [6] SeqModel代码: https://github.com/alibaba-damo-academy/SpokenNLP
- [7] ModelScope框架: https://github.com/modelscope/modelscope/
- [8] DenseXRetrieval论文: https://arxiv.org/pdf/2312.06648.pdf
- [9] 事实文本生成模型: https://github.com/chentong0/factoid-wiki