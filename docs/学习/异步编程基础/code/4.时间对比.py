import requests
import asyncio
import aiohttp
import time


async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()


async def main():

    start = time.time()
    # 中间写上代码块
    urls = ['http://example.com', 'http://example.org', 'http://example.net']
    tasks = [fetch(url) for url in urls]
    pages = await asyncio.gather(*tasks)
    for page in pages:
        print(len(page))
    end = time.time()
    print('Running time: %s Seconds' % (end-start))

asyncio.run(main())
print("====================================================================")


def fetch(url):
    response = requests.get(url)
    return response.text


def main():
    start = time.time()
    urls = ['http://example.com', 'http://example.org', 'http://example.net']
    pages = [fetch(url) for url in urls]
    for page in pages:
        print(len(page))
    end = time.time()
    print('Running time: %s Seconds' % (end-start))


main()