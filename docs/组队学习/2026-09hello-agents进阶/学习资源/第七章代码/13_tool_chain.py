"""7.5.4 顺序执行工具链；无需 API。"""
from common import run
from my_calculator_tool import create_calculator_registry
from tool_chain_manager import ToolChain, ToolChainManager

def main():
    manager = ToolChainManager(create_calculator_registry())
    chain = ToolChain("two_steps", "先加法，再把上一步结果乘3")
    chain.add_step("my_calculator", "{input} + 15", "subtotal")
    chain.add_step("my_calculator", "{subtotal} * 3", "total")
    manager.register_chain(chain)
    result = manager.execute_chain("two_steps", "25")
    assert result == "120", result
    print("最终结果：", result)

if __name__ == "__main__":
    run(main)
