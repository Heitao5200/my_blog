import asyncio
import time

async def my_coroutine(id):
    print(f"Coroutine {id} is starting")
    # 模拟异步操作，例如网络请求或IO操作
    await asyncio.sleep(1)
    print(f"Coroutine {id} is finishing")
    return f"Result from coroutine {id}"

async def main():
    # 记录开始时间
    start_time = time.time()
    
    # 创建多个任务
    tasks = [asyncio.create_task(my_coroutine(i)) for i in range(3)]
    # 等待所有任务完成
    results = await asyncio.gather(*tasks)
    
    # 记录结束时间
    end_time = time.time()
    
    # 计算并打印耗时
    elapsed_time = end_time - start_time
    print(f"Total time taken: {elapsed_time} seconds")
    
    # 打印结果
    print(results)

# 运行主协程
asyncio.run(main())