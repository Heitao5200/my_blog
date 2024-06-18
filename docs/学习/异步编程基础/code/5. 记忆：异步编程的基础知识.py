import asyncio
import time


async def call_api(message, result=1000, delay=3):
    print(message)
    start = time.perf_counter()
    await asyncio.sleep(delay)
    end = time.perf_counter()
    print(f'It took {round(end-start,0)} second(s) to complete.')
    return result


async def main():
    start = time.perf_counter()

    price = await call_api('Get stock price of GOOG...', 300)
    print(price)

    price = await call_api('Get stock price of APPL...', 400)
    print(price)

    end = time.perf_counter()
    print(f'It took {round(end-start,0)} second(s) to complete.')

asyncio.run(main())
 