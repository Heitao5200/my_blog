import asyncio
import aiohttp

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    urls = ['http://example.com', 'http://example.org', 'http://example.net']
    tasks = [fetch(url) for url in urls]
    pages = await asyncio.gather(*tasks)
    for page in pages:
        print(len(page))  #示例：打印每个页面的长度
# asyncio.run(main())



import requests

def fetch(url):
    response = requests.get(url)
    return response.text

def main():
    urls = ['http://example.com', 'http://example.org', 'http://example.net']
    pages = [fetch(url) for url in urls]
    for page in pages:print(len(page))  #示例：打印每个页面的长度
main()