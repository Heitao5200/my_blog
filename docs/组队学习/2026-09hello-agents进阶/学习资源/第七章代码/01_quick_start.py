"""7.1 最小 Agent 调用，需要 LLM 配置。"""
from common import run
from common import make_llm
from hello_agents import SimpleAgent

def main():
    agent = SimpleAgent(name="入门助手", llm=make_llm(), system_prompt="用简短中文回答。")
    print(agent.run("用一句话解释什么是智能体。"))
    print("历史消息数：", len(agent.get_history()))

if __name__ == "__main__":
    run(main)
