"""7.5：只允许数值 AST，不执行任意 Python 代码。"""
import ast
import math
import operator
from hello_agents import ToolRegistry
from hello_agents.tools.base import Tool, ToolParameter

OPERATORS = {ast.Add: operator.add, ast.Sub: operator.sub,
             ast.Mult: operator.mul, ast.Div: operator.truediv}

def _evaluate(node):
    if isinstance(node, ast.Constant) and type(node.value) in (int, float):
        if abs(node.value) > 1e100:
            raise ValueError("数值过大")
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPERATORS:
        value = OPERATORS[type(node.op)](_evaluate(node.left), _evaluate(node.right))
        if not math.isfinite(value) or abs(value) > 1e100:
            raise ValueError("结果超出范围")
        return value
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
        value = _evaluate(node.operand)
        return -value if isinstance(node.op, ast.USub) else value
    if isinstance(node, ast.Name) and node.id == "pi":
        return math.pi
    if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
            and node.func.id == "sqrt" and len(node.args) == 1 and not node.keywords):
        return math.sqrt(_evaluate(node.args[0]))
    raise ValueError("仅支持数字、+ - * /、括号、sqrt(x)、pi")

def my_calculate(expression):
    try:
        if not expression.strip() or len(expression) > 500:
            raise ValueError("表达式不能为空，且不能超过 500 字符")
        return str(_evaluate(ast.parse(expression, mode="eval").body))
    except (ValueError, SyntaxError, TypeError, ZeroDivisionError, OverflowError, RecursionError) as exc:
        return f"错误：{exc}"

class MyCalculatorTool(Tool):
    def __init__(self):
        super().__init__("my_calculator", "计算数学表达式，支持 + - * / sqrt(x) pi；输入纯表达式")

    def get_parameters(self):
        # 0.1.1 的 execute_tool 把字符串包装成 {"input": text}。
        return [ToolParameter(name="input", type="string", description="数学表达式")]

    def run(self, parameters):
        if not self.validate_parameters(parameters):
            return "错误：缺少 input 参数"
        return my_calculate(parameters["input"])

def create_calculator_registry():
    registry = ToolRegistry()
    registry.register_function(name="my_calculator", description="计算纯数学表达式，支持 + - * / sqrt(x) pi", func=my_calculate)
    return registry
