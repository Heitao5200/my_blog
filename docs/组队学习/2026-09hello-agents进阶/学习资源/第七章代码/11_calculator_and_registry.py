"""7.5.1—7.5.2 函数工具与 Tool 对象注册；无需 API。"""
from common import run
from hello_agents import ToolRegistry
from my_calculator_tool import create_calculator_registry, MyCalculatorTool

def main():
    registry = create_calculator_registry()
    for expression, expected in [("2+3", "5"), ("10-4", "6"), ("5*6", "30"), ("15/3", "5.0"), ("sqrt(16)+2*3", "10.0"), ("-3+5", "2")]:
        result = registry.execute_tool("my_calculator", expression)
        assert result == expected, (expression, result)
        print(expression, "=", result)
    object_registry = ToolRegistry()
    object_registry.register_tool(MyCalculatorTool())
    assert object_registry.execute_tool("my_calculator", "sqrt(16)") == "4.0"
    print("Tool 对象调用：", object_registry.execute_tool("my_calculator", "sqrt(16)"))
    print("描述：", registry.get_tools_description())
    registry.unregister("my_calculator")
    assert registry.list_tools() == []

if __name__ == "__main__":
    run(main)
