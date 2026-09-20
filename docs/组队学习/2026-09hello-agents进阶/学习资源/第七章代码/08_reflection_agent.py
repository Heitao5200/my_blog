"""7.4.3 Reflection 默认提示词及代码提示词；生成的代码只展示，不执行。"""
from common import run
from common import make_llm
from my_reflection_agent import MyReflectionAgent

def main():
    llm = make_llm()
    agent = MyReflectionAgent("反思助手", llm, max_iterations=1)
    print(agent.run("写一段不超过100字的人工智能简介，避免夸大能力。"))
    code_agent = MyReflectionAgent("代码审查助手", llm, max_iterations=1, custom_prompts={
        "initial": "编写 Python 函数并解释边界条件：{task}",
        "reflect": "审查代码正确性、效率与边界条件。若完全无需修改，只回复无需改进。任务：{task}\n代码：{content}",
        "refine": "按反馈给出完整改进代码。任务：{task}\n上一版：{last_attempt}\n反馈：{feedback}",
    })
    print(code_agent.run("计算非负整数 n 的阶乘，拒绝负数与非整数。"))

if __name__ == "__main__":
    run(main)
