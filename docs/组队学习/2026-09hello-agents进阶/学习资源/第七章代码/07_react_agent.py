"""7.4.2 ReAct；仅使用本地计算器，无需搜索密钥。"""
from common import run
from common import make_llm
from my_react_agent import MyReActAgent
from my_calculator_tool import create_calculator_registry

def main():
    agent = MyReActAgent("推理行动助手", make_llm(), create_calculator_registry(), max_steps=5)
    print(agent.run("必须调用 my_calculator，计算 (25 + 15) * 3 - 8。"))
    print("历史消息数：", len(agent.get_history()))

if __name__ == "__main__":
    run(main)
