
# 在处理网络请求时，协程允许你并发地发送多个请求并等待它们的响应，而不会阻塞主线程。这对于开发高效的网络爬虫或处理大量并行API调用的服务尤为重要。
import asyncio
import aiohttp

async def fetch_url(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    urls = ["http://example.com", "http://example.org", "http://example.net"]
    tasks = [fetch_url(url) for url in urls]
    pages = await asyncio.gather(*tasks) #处理获取的页面数据
    print(pages)
asyncio.run(main())