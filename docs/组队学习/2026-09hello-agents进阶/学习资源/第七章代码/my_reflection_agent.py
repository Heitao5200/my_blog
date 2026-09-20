"""7.4.3：补齐教材缺失文件；初稿 → 审查 → 改写。"""
from hello_agents import Message
from hello_agents.core.agent import Agent

DEFAULT_PROMPTS = {
    "initial": "根据任务给出完整回答：{task}",
    "reflect": "审查回答并给出具体修改意见。只有完全无需修改时才仅回复：无需改进。\n任务：{task}\n回答：{content}",
    "refine": "根据反馈改写，返回完整新版。\n任务：{task}\n上一版：{last_attempt}\n反馈：{feedback}",
}

class MyReflectionAgent(Agent):
    def __init__(self, name, llm, system_prompt=None, config=None, max_iterations=2, custom_prompts=None):
        super().__init__(name, llm, system_prompt, config)
        if max_iterations < 0:
            raise ValueError("max_iterations 不能为负数")
        self.max_iterations = max_iterations
        self.prompts = {**DEFAULT_PROMPTS, **(custom_prompts or {})}
        self.records = []

    def _ask(self, prompt, **kwargs):
        messages = []
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        return self.llm.invoke(messages + [{"role": "user", "content": prompt}], **kwargs)

    def run(self, input_text, **kwargs):
        self.records = []
        result = self._ask(self.prompts["initial"].format(task=input_text), **kwargs)
        self.records.append(("initial", result))
        print("初稿：", result)
        for index in range(self.max_iterations):
            feedback = self._ask(self.prompts["reflect"].format(task=input_text, content=result), **kwargs)
            self.records.append(("reflect", feedback))
            print(f"第 {index + 1} 轮审查：", feedback)
            if feedback.strip().rstrip("。.!！") == "无需改进":
                break
            result = self._ask(self.prompts["refine"].format(task=input_text,
                    last_attempt=result, content=result, feedback=feedback), **kwargs)
            self.records.append(("refine", result))
            print("改写：", result)
        self.add_message(Message(input_text, "user"))
        self.add_message(Message(result, "assistant"))
        return result
