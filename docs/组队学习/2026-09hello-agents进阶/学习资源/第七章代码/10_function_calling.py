"""7.4.5：原生 Function Calling；模型服务必须支持 tools 参数。"""
from common import make_llm, run
from my_function_call_agent import MyFunctionCallAgent

def main():
    agent = MyFunctionCallAgent("函数调用助手", make_llm())
    print(agent.run("请调用计算器计算 sqrt(16) + 2 * 3，然后告诉我结果。"))

if __name__ == "__main__":
    run(main)
