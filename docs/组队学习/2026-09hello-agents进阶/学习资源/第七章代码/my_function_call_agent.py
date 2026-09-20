"""7.4.5：OpenAI 原生函数调用完整闭环，不依赖新版 FunctionCallAgent。"""
import json
from hello_agents import Message
from hello_agents.core.agent import Agent
from my_calculator_tool import my_calculate

TOOLS = [{
    "type": "function",
    "function": {
        "name": "my_calculator",
        "description": "计算数学表达式，支持 + - * /、括号、sqrt(x) 和 pi",
        "parameters": {
            "type": "object",
            "properties": {"expression": {"type": "string", "description": "纯数学表达式"}},
            "required": ["expression"],
            "additionalProperties": False,
        },
    },
}]

class MyFunctionCallAgent(Agent):
    def run(self, input_text, max_steps=5, **kwargs):
        messages = [{"role": "system", "content": self.system_prompt or "遇到计算请调用工具，拿到结果后用中文回答。"}]
        messages += [message.to_dict() for message in self.get_history()]
        messages.append({"role": "user", "content": input_text})
        for _ in range(max_steps):
            response = self.llm._client.chat.completions.create(
                model=self.llm.model, messages=messages, tools=TOOLS,
                tool_choice="auto", **kwargs)
            message = response.choices[0].message
            if not message.tool_calls:
                if not message.content:
                    raise RuntimeError("模型未返回文本或函数调用")
                self.add_message(Message(input_text, "user"))
                self.add_message(Message(message.content, "assistant"))
                return message.content
            # 必须保留 tool_call_id，下一轮才能关联工具返回值。
            messages.append({"role": "assistant", "content": message.content,
                             "tool_calls": [call.model_dump(exclude_none=True) for call in message.tool_calls]})
            for call in message.tool_calls:
                result = "错误：未知工具"
                if call.function.name == "my_calculator":
                    try:
                        parameters = json.loads(call.function.arguments)
                        if not isinstance(parameters, dict) or not isinstance(parameters.get("expression"), str):
                            raise ValueError("expression 必须为字符串")
                        result = my_calculate(parameters["expression"])
                    except (ValueError, TypeError):
                        result = "错误：参数必须是包含 expression 字符串的 JSON 对象"
                print(f"函数 {call.function.name} -> {result}")
                messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
        raise RuntimeError("Function Calling 达到步数上限，尚未完成")
