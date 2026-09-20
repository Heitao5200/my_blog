"""7.3 Message、Config、Agent 抽象类；无需 API。"""
from common import run
from hello_agents import Message, Config
from hello_agents.core.agent import Agent

def main():
    class EchoAgent(Agent):
        def run(self, input_text, **kwargs):
            result = f"Echo: {input_text}"
            self.add_message(Message(input_text, "user"))
            self.add_message(Message(result, "assistant"))
            return result

    message = Message("你好", "user")
    print("API 消息：", message.to_dict())
    config = Config(temperature=0.2, max_history_length=10)
    print("配置：", config.model_dump())
    # EchoAgent 不调用模型；llm=None 仅用于本离线接口示例。
    agent = EchoAgent("回声助手", llm=None, config=config)
    print(agent.run("认识抽象接口"))
    assert len(agent.get_history()) == 2
    agent.clear_history()
    assert len(agent.get_history()) == 0
    print("历史记录已清空；Config 的字段不会自动实现历史裁剪。")

if __name__ == "__main__":
    run(main)
