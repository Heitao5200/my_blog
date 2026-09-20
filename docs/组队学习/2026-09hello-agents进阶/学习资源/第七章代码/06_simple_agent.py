"""7.4.1 基础对话、工具调用、流式输出、动态工具管理。"""
from common import run
from common import make_llm
from my_simple_agent import MySimpleAgent
from my_calculator_tool import MyCalculatorTool

def main():
    agent = MySimpleAgent("对话助手", make_llm(), system_prompt="用简短中文回答。")
    print(agent.run("你好，我叫小明，请记住我的名字。"))
    print(agent.run("我叫什么名字？"))
    agent.add_tool(MyCalculatorTool())
    print("工具列表：", agent.list_tools())
    print(agent.run("必须调用 my_calculator 工具计算 15 * 8 + 32，再回答结果。"))
    for _ in agent.stream_run("一句话说明智能体与普通聊天机器人的区别，不需要工具。"):
        pass
    agent.remove_tool("my_calculator")
    print("剩余工具：", agent.list_tools())
    print("历史消息数：", len(agent.get_history()))

if __name__ == "__main__":
    run(main)
