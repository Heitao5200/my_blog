"""7.5.4 并发执行工具；无需 API，结果顺序与输入一致。"""
from common import run
import asyncio
from my_calculator_tool import create_calculator_registry
from async_tool_executor import AsyncToolExecutor

def main():
    async def execute():
        executor = AsyncToolExecutor(create_calculator_registry())
        try:
            expressions = ["2+2", "sqrt(16)", "(25+15)*3-8"]
            results = await executor.execute_tools_parallel([
                {"tool_name": "my_calculator", "input_data": expr} for expr in expressions])
            assert results == ["4", "4.0", "112"], results
            for expr, result in zip(expressions, results):
                print(expr, "=", result)
        finally:
            executor.close()
    asyncio.run(execute())

if __name__ == "__main__":
    run(main)
