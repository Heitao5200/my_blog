from typing import Any

import requests
from llama_index.core import ServiceContext, SimpleDirectoryReader, SummaryIndex
from llama_index.legacy.llms import CustomLLM, CompletionResponse, CompletionResponseGen, LLMMetadata
from llama_index.legacy.llms.base import llm_completion_callback


class QwenCustomLLM(CustomLLM):
    context_window: int = 8192
    num_output: int = 128
    model_name: str = "qwen72chat1.5"
    base_url: str = "http://220.250.27.14:8001/v1"
    tokenizer: object = None
    model: object = None

    def __init__(self):
        super().__init__()

    @property
    def metadata(self) -> LLMMetadata:
        return LLMMetadata(
            context_window=self.context_window,
            num_output=self.num_output,
            model_name=self.model_name,
        )

    @llm_completion_callback()
    def complete(self, prompt: str, **kwargs: Any) -> CompletionResponse:
        data = {'prompt': prompt}
        response = requests.post(f'{self.base_url}/complete', json=data)
        result = response.json()
        return CompletionResponse(text=result['detail'])

    @llm_completion_callback()
    def stream_complete(self, prompt: str, **kwargs: Any) -> CompletionResponseGen:
        data = {'prompt': prompt}
        response = requests.post(f'{self.base_url}/stream_complete', json=data)
        result = response.json()
        for token in result:
            yield CompletionResponse(text=token, delta=token)


if __name__ == "__main__":
    llm = QwenCustomLLM()
    # 方式1：本地加载模型方式进行调用
    service_context = ServiceContext.from_defaults(llm=llm, embed_model="local:/Users/heitao/my_blog/models/AI-ModelScope/bge-base-zh-v1___5")

    # TODO 方式2：调整embed_model为在线模型
    # 思路：继承BaseEmbedding类，将加载Embedding模型部分封装为REST接口。可重点参考下OpenAIEmbedding类的实现。
    # service_context = ServiceContext.from_defaults(llm=llm, embed_model=BgeLargeZhEmbedding())

    documents = SimpleDirectoryReader("data").load_data()
    index = SummaryIndex.from_documents(documents, service_context=service_context)
    query_engine = index.as_query_engine()

    # 你能够像以前一样使用llm.complete和llm.stream_complete
    response_complete = llm.complete("您好")
    print(response_complete)
    response_stream_complete = list(llm.stream_complete("您好"))
    print(response_stream_complete)

    response = query_engine.query("花未眠")
    print(response)