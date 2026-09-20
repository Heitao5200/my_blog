"""7.5.3：Tavily 优先、SerpAPI 回退；直接调用 HTTP API，无额外 SDK。"""
import os
import requests
from hello_agents import ToolRegistry

class MyAdvancedSearchTool:
    def __init__(self):
        self.sources = [name for name in ("TAVILY_API_KEY", "SERPAPI_API_KEY") if os.getenv(name)]

    def search(self, query):
        if not query.strip():
            raise ValueError("搜索词不能为空")
        if not self.sources:
            raise ValueError("请在 .env 填写 TAVILY_API_KEY 或 SERPAPI_API_KEY")
        for source in self.sources:
            try:
                if source == "TAVILY_API_KEY":
                    response = requests.post("https://api.tavily.com/search", json={
                        "api_key": os.environ[source], "query": query, "max_results": 3}, timeout=30)
                    response.raise_for_status()
                    items = response.json().get("results", [])
                    rows = [(x.get("title", ""), x.get("content", ""), x.get("url", "")) for x in items]
                else:
                    response = requests.get("https://serpapi.com/search.json", params={
                        "api_key": os.environ[source], "engine": "google", "q": query, "num": 3}, timeout=30)
                    response.raise_for_status()
                    payload = response.json()
                    if payload.get("error"):
                        raise ValueError("搜索服务返回错误")
                    rows = [(x.get("title", ""), x.get("snippet", ""), x.get("link", ""))
                            for x in payload.get("organic_results", [])[:3]]
                if rows:
                    return "\n\n".join(f"{title}\n{snippet}\n{url}" for title, snippet, url in rows)
                print(f"{source.removesuffix('_API_KEY')} 无结果，尝试下一个来源")
            except (requests.RequestException, ValueError, TypeError, KeyError) as exc:
                # 不打印带 api_key 查询参数的异常 URL。
                print(f"{source.removesuffix('_API_KEY')} 失败（{type(exc).__name__}），尝试下一个来源")
        raise RuntimeError("所有已配置搜索源均失败或没有结果")

def create_advanced_search_registry():
    registry = ToolRegistry()
    registry.register_function(name="advanced_search", description="搜索互联网并返回来源链接", func=MyAdvancedSearchTool().search)
    return registry
