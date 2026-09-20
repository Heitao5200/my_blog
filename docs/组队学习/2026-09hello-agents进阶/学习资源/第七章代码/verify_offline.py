"""离线回归：固定模型响应只用来测控制流，不冒充真实模型成功。"""
import copy
import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
from openai.types.chat import ChatCompletionMessage
from my_simple_agent import MySimpleAgent
from my_react_agent import MyReActAgent
from my_reflection_agent import MyReflectionAgent
from my_plan_solve_agent import MyPlanAndSolveAgent
from my_function_call_agent import MyFunctionCallAgent
from my_calculator_tool import my_calculate, create_calculator_registry, MyCalculatorTool
from my_advanced_search import MyAdvancedSearchTool
from tool_chain_manager import ToolChain

class FakeLLM:
    provider = "offline-test-double"
    def __init__(self, responses):
        self.responses = iter(responses)
        self.calls = []
    def invoke(self, messages, **kwargs):
        self.calls.append(copy.deepcopy(messages))
        return next(self.responses)
    def stream_invoke(self, messages, **kwargs):
        yield "离线"
        yield "流式"

class OfflineTests(unittest.TestCase):
    def test_real_sdk_against_local_http_fixture(self):
        # 真正经过已安装的 SDK 和 HTTP 层，但响应为本地测试数据。
        import json
        import threading
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        from my_llm import MyLLM
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass
            def do_POST(self):
                request = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                self.send_response(200)
                if request.get('stream'):
                    self.send_header('Content-Type', 'text/event-stream')
                    self.end_headers()
                    for part in ('SDK', '通过'):
                        chunk = {'id': 'test', 'object': 'chat.completion.chunk', 'created': 0,
                                 'model': 'fixture', 'choices': [{'index': 0, 'delta': {'content': part}, 'finish_reason': None}]}
                        self.wfile.write(('data: ' + json.dumps(chunk) + '\n\n').encode())
                    self.wfile.write(b'data: [DONE]\n\n')
                else:
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'id': 'test', 'object': 'chat.completion',
                        'created': 0, 'model': 'fixture', 'choices': [{'index': 0,
                        'message': {'role': 'assistant', 'content': 'SDK通过'}, 'finish_reason': 'stop'}]}).encode())
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        llm = None
        try:
            llm = MyLLM(model='fixture', api_key='offline', provider='local',
                        base_url=f'http://127.0.0.1:{server.server_port}/v1')
            messages = [{'role': 'user', 'content': '本地测试'}]
            self.assertEqual(llm.invoke(messages), 'SDK通过')
            self.assertEqual(''.join(llm.stream_invoke(messages)), 'SDK通过')
        finally:
            if llm:
                llm._client.close()
            server.shutdown()
            server.server_close()
            thread.join()

    def test_import_all_entries(self):
        # 导入入口不应自动调用模型、搜索或执行实验。
        for path in sorted(Path(__file__).parent.glob('[0-9][0-9]_*.py')):
            spec = importlib.util.spec_from_file_location(path.stem, path)
            spec.loader.exec_module(importlib.util.module_from_spec(spec))

    def test_calculator_success_and_rejection(self):
        for expression, expected in [("sqrt(16)+2*3", "10.0"), ("-2+3", "1"), ("(25+15)*3-8", "112")]:
            self.assertEqual(my_calculate(expression), expected)
        for expression in ('__import__("os").system("echo bad")', '1/0', 'sqrt(-1)', 'unknown', '"abc"', '2**100', 'True', '', '1e200', '[1,2]'):
            self.assertTrue(my_calculate(expression).startswith("错误："), expression)

    def test_simple_function_and_object_tools(self):
        for object_tool in (False, True):
            registry = create_calculator_registry()
            if object_tool:
                registry.clear()
                registry.register_tool(MyCalculatorTool())
            llm = FakeLLM(["[TOOL_CALL:my_calculator:2+3]", "结果为5"])
            agent = MySimpleAgent("测试", llm, tool_registry=registry)
            self.assertEqual(agent.run("计算"), "结果为5")
            self.assertIn("5", llm.calls[1][-1]["content"])
            self.assertEqual(len(agent.get_history()), 2)

    def test_simple_limit(self):
        agent = MySimpleAgent("测试", FakeLLM(["[TOOL_CALL:my_calculator:2+3]"]), tool_registry=create_calculator_registry())
        with self.assertRaises(RuntimeError):
            agent.run("计算", max_tool_iterations=1)

    def test_stream_history(self):
        agent = MySimpleAgent("测试", FakeLLM([]))
        self.assertEqual(''.join(agent.stream_run("测试")), "离线流式")
        self.assertEqual(agent.get_history()[-1].content, "离线流式")

    def test_react_tool_feedback_and_finish(self):
        llm = FakeLLM(["Action: my_calculator[2+3]", "Action: Finish[5]"])
        agent = MyReActAgent("测试", llm, create_calculator_registry())
        self.assertEqual(agent.run("计算"), "5")
        self.assertIn("Observation: 5", llm.calls[1][-1]["content"])

    def test_react_malformed_recovery_and_limit(self):
        agent = MyReActAgent("测试", FakeLLM(["格式不对", "**Action:** Finish[完成]"]), create_calculator_registry())
        self.assertEqual(agent.run("测试"), "完成")
        agent = MyReActAgent("测试", FakeLLM(["格式不对"]), create_calculator_registry(), max_steps=1)
        with self.assertRaises(RuntimeError):
            agent.run("测试")

    def test_reflection_refine_and_stop(self):
        agent = MyReflectionAgent("测试", FakeLLM(["初稿", "请补充边界条件", "改进稿", "无需改进。"]), max_iterations=2)
        self.assertEqual(agent.run("写文章"), "改进稿")
        self.assertEqual(len(agent.records), 4)

    def test_plan_both_formats_and_context(self):
        for plan in ('["第一步", "汇总"]', '```python\n["第一步", "汇总"]\n```'):
            llm = FakeLLM([plan, "15", "70"])
            agent = MyPlanAndSolveAgent("测试", llm)
            self.assertEqual(agent.run("苹果"), "70")
            self.assertIn("15", llm.calls[-1][0]["content"])
        for bad_plan in ('[]', '[1]', '这不是列表', '__import__("os")'):
            with self.assertRaises(RuntimeError):
                MyPlanAndSolveAgent("测试", FakeLLM([bad_plan])).run("测试")

    def test_native_function_call_loop(self):
        initial = ChatCompletionMessage(role="assistant", content=None, tool_calls=[{
            "id": "call_test", "type": "function",
            "function": {"name": "my_calculator", "arguments": '{"expression":"2+3"}'}}])
        final = ChatCompletionMessage(role="assistant", content="结果为5")
        snapshots = []
        replies = iter([initial, final])
        def create(**kwargs):
            snapshots.append(copy.deepcopy(kwargs))
            return SimpleNamespace(choices=[SimpleNamespace(message=next(replies))])
        llm = SimpleNamespace(model="offline", _client=SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create))))
        self.assertEqual(MyFunctionCallAgent("测试", llm).run("计算"), "结果为5")
        self.assertEqual(snapshots[1]["messages"][-1], {"role": "tool", "tool_call_id": "call_test", "content": "5"})

    def test_search_fallback_without_network(self):
        import requests
        response = Mock()
        response.json.return_value = {"organic_results": [{"title": "标题", "snippet": "摘要", "link": "https://example.com"}]}
        with patch.dict('os.environ', {'TAVILY_API_KEY': 'test', 'SERPAPI_API_KEY': 'test'}, clear=True), \
             patch('my_advanced_search.requests.post', side_effect=requests.Timeout), \
             patch('my_advanced_search.requests.get', return_value=response):
            self.assertIn('https://example.com', MyAdvancedSearchTool().search("查询"))
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaises(ValueError):
                MyAdvancedSearchTool().search("查询")

    def test_chain_empty_missing_variable_and_tool_error(self):
        chain = ToolChain("测试", "测试")
        registry = create_calculator_registry()
        with self.assertRaises(ValueError):
            chain.execute(registry, "1")
        chain.add_step("my_calculator", "{missing}")
        with self.assertRaises(ValueError):
            chain.execute(registry, "1")
        chain.steps.clear()
        chain.add_step("my_calculator", "1/0")
        with self.assertRaises(RuntimeError):
            chain.execute(registry, "1")

if __name__ == "__main__":
    print("离线测试：不访问模型或搜索服务，不验证模型效果。")
    unittest.main(verbosity=2)
