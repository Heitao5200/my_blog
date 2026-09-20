"""7.4.2：可直接阅读的 ReAct 循环，记录 Action / Observation。"""
import re
from hello_agents import Message
from hello_agents.core.agent import Agent

MY_REACT_PROMPT = """你是一个可调用工具的助手。
可用工具：
{tools}
每轮只选择一个行动，严格输出：
Thought: 一句简短行动说明
Action: 工具名[纯字符串参数]
拿到结果后用 Action: Finish[最终答案] 结束。
问题：{question}
执行历史：
{history}
"""

class MyReActAgent(Agent):
    def __init__(self, name, llm, tool_registry, system_prompt=None, config=None,
                 max_steps=5, custom_prompt=None):
        super().__init__(name, llm, system_prompt, config)
        self.tool_registry = tool_registry
        self.max_steps = max_steps
        self.prompt_template = custom_prompt or MY_REACT_PROMPT
        self.current_history = []

    def run(self, input_text, **kwargs):
        self.current_history = []
        for step in range(self.max_steps):
            prompt = self.prompt_template.format(tools=self.tool_registry.get_tools_description(),
                    question=input_text, history="\n".join(self.current_history))
            messages = []
            if self.system_prompt:
                messages.append({"role": "system", "content": self.system_prompt})
            messages.append({"role": "user", "content": prompt})
            text = self.llm.invoke(messages, **kwargs)
            match = re.search(r"(?:^|\n)\s*(?:\*\*)?Action\s*:(?:\*\*)?\s*`?(\w+)\[(.*)\]`?\s*$", text, re.S)
            if not match:
                self.current_history.extend([f"Assistant: {text}", "Observation: 格式错误，请使用 Action: 工具名[参数]"])
                continue
            name, value = match.groups()
            if name == "Finish":
                if not value.strip():
                    raise RuntimeError("Finish 内容为空")
                self.add_message(Message(input_text, "user"))
                self.add_message(Message(value, "assistant"))
                return value
            observation = self.tool_registry.execute_tool(name, value)
            record = f"Action: {name}[{value}]\nObservation: {observation}"
            print(f"第 {step + 1} 步\n{record}")
            self.current_history.append(record)
        raise RuntimeError("ReAct 达到最大步数，任务尚未完成")
