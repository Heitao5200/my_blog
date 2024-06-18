 

### **RAG系统的核心**：

- RAG系统依赖于高质量的文本检索来提高语言模型生成响应的准确性和相关性。
- 通过避免LLM产生的错误或非事实性答案，确保了回答的质量和可靠性。

### **从小到大”检索技术**：

#### 背景

- 假设一个用户问了一个问题，而这个问题只能用你200个单词中的一行句子来回答，而块中的其余文本可能会使检索器很难找到与回答用户问题最相关的一句话。

#### **父文档检索**

 首先检索与查询最相关的较小数据段，然后将相关的较大的父数据块作为上下文传递给LLM（大型语言模型）	<img src="img/Task22LlamaIndex高级检索1-构建完整基本RAG框架/640" alt="Image" style="zoom:50%;" />

#### **句子窗口检索**

句子窗口检索首先检索与回答查询最相关的特定句子，然后返回该句子上下文几个句子来为LLM提供更多的上下文作为其响应的基础。

<img src="img/Task22LlamaIndex高级检索1-构建完整基本RAG框架/640-20240416075934887" alt="Image" style="zoom:44%;" />

<img src="img/Task22LlamaIndex高级检索1-构建完整基本RAG框架/640-20240416075942812" alt="Image" style="zoom:70%;" />



### **构建RAG框架的步骤**：

- 文章详细阐述了使用LlamaIndex构建RAG框架的各个步骤，包括项目设置、数据准备、环境配置、库安装、文档处理、模型集成和索引创建等。
- 通过这些步骤，可以建立一个完整的RAG系统，用于生成基于检索到的文本的响应。

### **RAG性能评估**：

![Image](img/Task22LlamaIndex高级检索1-构建完整基本RAG框架/640-20240416080938076)

**Answer Relevance**：答案与查询或用户问题的相关性如何？

**Context Relevance**：检索到的上下文与回答用户问题的相关性如何？

**Groundedness**：检索到的上下文在多大程度上支持响应？

**TruEra**：通过TruEra工具，可以对RAG系统的性能进行量化分析，并提供可视化的评估结果。

### **评估结果的解读与改进**：

- 根据评估结果，文章指出了RAG系统在上下文相关性方面的不足，并提出了改进的建议。
- 同时，文章也强调了系统在Groundedness和Answer相关性方面的积极表现，并探讨了进一步提升性能的可能途径。

### 参考资料

1. https://medium.com/aimonks/chatting-with-your-data-ultimate-guide-a4e909591436
2. https://medium.com/aimonks/chatting-with-your-data-ultimate-guide-a4e909591436
3. https://github.com/Princekrampah/AdvancedRAGTechniques_LlamaIndex
4. https://platform.openai.com/api-keys
5. https://docs.python.org/3/library/venv.html
6. https://truera.com/
7. https://ai.gopubby.com/advance-retrieval-techniques-in-rag-5fdda9cc304b
8. https://mp.weixin.qq.com/s?__biz=Mzg3NDIyMzI0Mw==&mid=2247488645&idx=1&sn=5a64a46a33b5ba03af1855640cee1e75&chksm=ced55761f9a2de77d7bfe77d68dddffa463df28ce51fbd9054381ffc1c601f37c40a814fd8c9&cur_album_id=3377833073308024836&scene=190#rd