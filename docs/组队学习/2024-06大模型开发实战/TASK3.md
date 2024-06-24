## 词向量及向量知识库

### 什么是词向量？

词向量是一种在自然语言处理（NLP）中常用的技术，它将词汇映射到实数向量空间中。每个词被表示为一个固定维度的向量，这些向量能够捕捉词与词之间的语义关系。词向量模型的目的是使得在语义上相似或相关的词在向量空间中彼此接近。



### 词向量的优势



1. **语义信息的捕捉**：词向量能够捕捉词的语义信息，使得语义相近的词在向量空间中彼此接近。
2. **减少维度**：与one-hot编码相比，词向量通常具有更低的维度，这有助于减少模型的复杂性和计算成本。
3. **解决数据稀疏性**：传统的one-hot表示方法在词表很大时会导致数据稀疏问题，而词向量通过分布式表示减少了这种稀疏性。
4. **支持多种任务**：词向量不仅可以用于传统的NLP任务，还支持复杂的任务如问答系统、对话系统等。

## 向量数据库

### 什么是向量数据库

向量数据库是一种专门设计用于存储、索引和检索向量数据的数据库系统

### 向量数据库的优点

1. **快速检索**：向量数据库通常使用专门的数据结构（如KD树、R树或倒排索引）来加速向量搜索和检索操作。
2. **向量相似性搜索**：它们支持基于向量相似性的搜索，允许用户查询与给定向量相似的项。
3. **多模态数据**：向量数据库可以处理多种类型的数据，包括图像、文本、音频和视频数据，这些数据通常被转换成向量形式进行存储。
4. **并行处理**：向量数据库能够利用并行处理技术来加速向量计算和搜索任务。
5. **API和集成**：它们提供API接口，方便与其他软件和应用程序集成。

## 向量数据库的使用

### 使用智谱API

```
from zhipuai import ZhipuAI
def zhipu_embedding(text: str):

    api_key = os.environ['ZHIPUAI_API_KEY']
    client = ZhipuAI(api_key=api_key)
    response = client.embeddings.create(
        model="embedding-2",
        input=text,
    )
    return response

text = '要生成 embedding 的输入文本，字符串形式。'
response = zhipu_embedding(text=text)
```



### 使用千帆API

```
import requests
import json

def wenxin_embedding(text: str):
    # 获取环境变量 wenxin_api_key、wenxin_secret_key
    api_key = os.environ['QIANFAN_AK']
    secret_key = os.environ['QIANFAN_SK']

    # 使用API Key、Secret Key向https://aip.baidubce.com/oauth/2.0/token 获取Access token
    url = "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={0}&client_secret={1}".format(api_key, secret_key)
    payload = json.dumps("")
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    
    # 通过获取的Access token 来embedding text
    url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/embeddings/embedding-v1?access_token=" + str(response.json().get("access_token"))
    input = []
    input.append(text)
    payload = json.dumps({
        "input": input
    })
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    return json.loads(response.text)
# text应为List(string)
text = "要生成 embedding 的输入文本，字符串形式。"
response = wenxin_embedding(text=text)
```

## 文本解析

如何从格式丰富且结构复杂的文件中准确地提取信息，是提高大模型RAG效果的关键

### **如何解析PDF文档**

#### **常见解析PDF的三种方法**

- **基于规则的方法**：根据文档的组织特征确定每个部分的风格和内容。然而，这种方法不是很通用，因为PDF有很多类型和布局，不可能用预定义的规则覆盖所有类型和布局。
  - 使用**LangChain**和**LlamaIndex**中解析PDF文件的标准方法。
- **基于深度学习模型的方法**：例如将**目标检测**和**OCR模型**相结合的流行解决方案。
  - **Unstructured**：它已集成到langchain中。使用**hi_res**策略设置infer_table_structure=True可以很好的识别表格信息 
  - **PP-StructureV2[7]**：可以组合各种模型用于文档分析 
  - ChatDOC这样的付费工具，它们利用基于布局的识别+OCR方法来解析PDF文档。

- 基于多模态大模型对复杂结构进行Pasing或提取PDF中的关键信息。 

#### **常见的PDF解析问题**

- 多列布局导致的文本流读取错误。
- 公式和表格的解析效果差，难以正确提取信息。
- 解析过程中结构化信息（如标题和列表）的丢失。
- 影印版PDF的文本无法被标准OCR工具识别。

## 文本分割

### 基于规则的切分方法

- **基于字符分块** : 据固定字符数目以及特定的字符进行切分。
- **固定大小分块**：指定每个块的固定令牌数，通常会有一些重叠，以保持语义连贯性。
- **基于token的分块**：根据固定的token数进行切分，每个令牌代表一个词或语素，通常使用与目标语言模型相同的分词器。
- **内容感知分块**：使用 NLTK ，spaCy 等这工具来实现基于内容的切分，比如利用句子分割、识别段落、标题和标点符号。
- **根据规则递归分块**：递归分块首先尝试按照一定的标准（如段落或标题）分割文本，如果分割后的文本块仍然过大，就会在这些块上重复进行分割过程，直到所有块的大小都符合要求。这种方法适用于需要将长文本细分为较小片段的场景，同时尽量保持每个块的独立性和完整性。
- **针对特定数据的分块**：根据内容的结构和格式元素，保证语义连贯性。比如，Markdown文本可以根据标题、列表和代码块等元素进行分块，而LaTeX文本可以根据章节、小节和公式等逻辑单元进行分块。

### 基于语义聚类的切分方法

通过一个滑动窗口计算相似度。相邻并且满足阈值的句子会被归为一个分块。如LlamaIndex中的SemanticSplitterNodeParser方法，其主要步骤如下：

1. **文本嵌入**：首先，通过嵌入模型（如OpenAI的Embedding Model）计算文本的embedding，这些向量代表了文本的embedding语义特征。
2. **语义分析**：利用embedding语义特征，通过计算向量之间的相似度来评估句子或段落之间的语义关系。如通过余弦相似度等度量，来确定哪些文本部分在内容上是相似的。
3. **分块决策**：基于预设的相似度阈值或其他标准，语义相近的文本段落被分组为一个块（chunk）。这个过程本质上是确定“断点”的过程，即在哪里开始新的分块，保证每个块在语义上尽可能的独立和完整。

### **基于机器学习模型的方法**

利用自然语言模型，如BERT和其他Transformer模型，这些方法通过学习文本中的语言模式来预测最合适的分块点。这些模型通常被训练来识别文本中的结构和语义断点，能够自动适应各种语言和文本类型。

- **Naive BERT**
  使用BERT模型的下一句预测（NSP）功能来判断两个句子之间是否存在直接的连续关系，即通过分析相邻句子的语义关系来确定分块点。
- **Cross Segment Attention**
  采用跨片段的注意力机制来分析文本，如通过BERT和双向LSTM结合的方式，来更细致地理解和划分文本。不仅考虑单个句子，还考虑其周围的上下文，以确定分割点。
- **SeqModel**
  SeqModel 利用 BERT 同时编码多个句子，在进行句子向量计算之前，建模了更长上下文内的依赖关系。然后，预测每个句子之后是否会发生文本分割。并且，模型还采用了自适应性滑动窗口方法来提高推理速度，同时不牺牲准确性。







## 参考资料

[LLM之RAG实战（二十九）| 探索RAG PDF解析](https://zhuanlan.zhihu.com/p/686844517)

[检索增强大语言模型（RAG）中的文档切分方法](https://zhuanlan.zhihu.com/p/693204229)