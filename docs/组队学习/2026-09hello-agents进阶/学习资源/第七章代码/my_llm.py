"""7.2：统一模型接口及自定义 Provider。调用失败会抛出异常。"""
from hello_agents import HelloAgentsLLM

class MyLLM(HelloAgentsLLM):
    def __init__(self, model=None, api_key=None, base_url=None, provider=None, **kwargs):
        super().__init__(model=model, api_key=api_key, base_url=base_url,
                         provider=provider, **kwargs)

    def invoke(self, messages, **kwargs):
        # 直接保留 SDK 异常类型，避免教材封装把错误变成普通回答。
        options = {"temperature": self.temperature}
        if self.max_tokens is not None:
            options["max_tokens"] = self.max_tokens
        options.update(kwargs)
        response = self._client.chat.completions.create(
            model=self.model, messages=messages, **options)
        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("模型没有返回文本，请检查模型是否支持 Chat Completions。")
        return content

    def stream_invoke(self, messages, **kwargs):
        options = {"temperature": self.temperature}
        if self.max_tokens is not None:
            options["max_tokens"] = self.max_tokens
        options.update(kwargs)
        options["stream"] = True
        received = False
        with self._client.chat.completions.create(
                model=self.model, messages=messages, **options) as stream:
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    received = True
                    yield chunk.choices[0].delta.content
        if not received:
            raise RuntimeError("流式调用未返回文本。")

    def think(self, messages, temperature=None):
        options = {} if temperature is None else {"temperature": temperature}
        yield from self.stream_invoke(messages, **options)
