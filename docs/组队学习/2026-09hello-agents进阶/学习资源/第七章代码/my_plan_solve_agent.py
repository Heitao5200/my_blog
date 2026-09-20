"""7.4.4：补齐规划器与执行器，解析计划时不用 eval。"""
import ast
import re
from hello_agents import Message
from hello_agents.core.agent import Agent

class Planner:
    def __init__(self, llm, prompt=None):
        self.llm = llm
        self.prompt = prompt or '把问题分成按顺序执行的步骤，最后一步必须回答原问题。只输出非空字符串列表，例如 ["计算第一项", "计算总数"]。问题：{question}'

    def plan(self, question, **kwargs):
        text = self.llm.invoke([{"role": "user", "content": self.prompt.format(question=question)}], **kwargs)
        block = re.search(r"```(?:python|json)?\s*(.*?)```", text, re.S)
        try:
            plan = ast.literal_eval(block.group(1).strip() if block else text.strip())
        except (ValueError, SyntaxError):
            raise RuntimeError("规划输出不是有效列表，请调整 planner 提示词后重试") from None
        if not isinstance(plan, list) or not 1 <= len(plan) <= 10 or not all(isinstance(x, str) and x.strip() for x in plan):
            raise RuntimeError("计划必须包含 1—10 条非空字符串步骤")
        return plan

class Executor:
    def __init__(self, llm, prompt=None):
        self.llm = llm
        self.prompt = prompt or '按计划只完成当前步骤并给出结果。\n原问题：{question}\n完整计划：{plan}\n已完成：{history}\n当前步骤：{current_step}'
        self.results = []

    def execute(self, question, plan, **kwargs):
        self.results = []
        for step in plan:
            prompt = self.prompt.format(question=question, plan=plan,
                     history="\n".join(self.results) or "无", current_step=step)
            result = self.llm.invoke([{"role": "user", "content": prompt}], **kwargs)
            self.results.append(f"{step}: {result}")
            print(self.results[-1])
        return result

class MyPlanAndSolveAgent(Agent):
    def __init__(self, name, llm, system_prompt=None, config=None, custom_prompts=None):
        super().__init__(name, llm, system_prompt, config)
        prompts = custom_prompts or {}
        self.planner = Planner(llm, prompts.get("planner"))
        self.executor = Executor(llm, prompts.get("executor"))

    def run(self, input_text, **kwargs):
        plan = self.planner.plan(input_text, **kwargs)
        print("计划：", plan)
        result = self.executor.execute(input_text, plan, **kwargs)
        self.add_message(Message(input_text, "user"))
        self.add_message(Message(result, "assistant"))
        return result
