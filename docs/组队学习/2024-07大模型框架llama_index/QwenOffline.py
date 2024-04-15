import torch
from llama_index.legacy.llms.huggingface import HuggingFaceLLM
from llama_index.core import PromptTemplate
from llama_index.core import SimpleDirectoryReader
from llama_index.core import VectorStoreIndex
from llama_index.legacy.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from dotenv.main import load_dotenv
import os
load_dotenv()
class Message:
    # Message类用于创建包含角色和内容的消息对象

    def Role(self, name):
        # Role方法用于设定消息的角色
        # 参数name: 角色的名称
        # 返回值: 返回带有指定角色的Message对象
        self.value = name
        return self  # 返回包含指定角色的Message对象

    def __init__(self, content):
        # 初始化方法，用于创建Message对象
        # 参数content: 消息的内容，可以被序列化为JSON的类型
        self.role = self.Role(name="user")  # 假设角色默认为"user"
        self.content = content  # 存储消息的内容，可以被序列化为JSON的类型

    def to_dict(self):
        # 将Message对象转换为字典
        # 返回值: 包含角色和内容的字典
        return {"role": self.role, "content": self.content}
 
model_path =  os.environ['MODEL_PATH']
embedding_model_path = os.environ['EMBEDDING_MODEL_PATH']
data_path = os.environ['DATA_PATH']
 
 
SYSTEM_PROMPT = """You are an AI assistant that answers questions in a friendly manner, based on the given source documents. Here are some rules you always follow:
- Generate human readable output, avoid creating output with gibberish text.
- Generate only the requested output, don't include any other language before or after the requested output.
- Never say thank you, that you are happy to help, that you are an AI agent, etc. Just answer directly.
- Generate professional language typically used in business documents in North America.
- Never generate offensive or foul language.
"""
 
query_wrapper_prompt = PromptTemplate(
    "[INST]<<SYS>>\n" + SYSTEM_PROMPT + "<</SYS>>\n\n{query_str}[/INST] "
)

llm = HuggingFaceLLM(context_window=4096,
    max_new_tokens=512,
    generate_kwargs={"temperature": 0.01, "do_sample": True},
    query_wrapper_prompt='query_wrapper_prompt',
    tokenizer_name=model_path,
    model_name=model_path,
    device_map="auto",
    
)



embed_model = HuggingFaceEmbedding(model_name=embedding_model_path)
Settings.llm = llm
Settings.embed_model = embed_model

# load documents
documents = SimpleDirectoryReader(data_path).load_data()



index = VectorStoreIndex.from_documents(documents)

# set Logging to DEBUG for more detailed outputs
query_engine = index.as_query_engine()
# {"role": message.role.value, "content": message.content}
 

# 使用示例

response = query_engine.query("Transformer咋规定的?")
print(response.metadata)
print(response.source_nodes)
print(response.response)
# print(response.get_formatted_sources)
print(566)