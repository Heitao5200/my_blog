# 第七章：完整可运行代码

按本地《第七章 构建你的智能体框架》7.1—7.5 整理。每个编号文件都是独立入口，可以一个一个运行，不要求先运行上一份脚本。`my_*.py` 等文件是入口依赖的完整实现，放在同一目录即可导入。

这份整理保留教材 `hello-agents==0.1.1`，补齐缺失实现，并修正原示例的接口问题。原教材和原配套代码未改动。

## 1. 现在开始运行

本机已经创建了本目录的 `.venv` 并安装依赖。打开终端，执行：

```bash
cd /Users/heitao/Colab/my_blog/docs/组队学习/2026-09hello-agents进阶/学习资源/第七章代码
source .venv/bin/activate
python 00_check_environment.py
```

换电脑或删除环境后，重新安装（Python 3.10+，本次验证为 3.14.3）：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

`requirements.lock.txt` 记录本次测试环境的全部依赖版本，需要完全复现时可用它代替 `requirements.txt`。不需要安装博客根目录的 Poetry 环境。

本目录 `.env` 已配置你的硅基流动 DeepSeek 和 Tavily，可直接运行。新复制代码且没有 `.env` 时，执行一次 `cp -n .env.example .env`。

```dotenv
LLM_MODEL_ID=你的模型名称
LLM_API_KEY=你的密钥
LLM_BASE_URL=你的服务商提供的OpenAI兼容接口地址
LLM_TIMEOUT=60
```

这三个值必须来自同一服务。`LLM_BASE_URL` 通常以 `/v1` 结尾，但以服务商文档为准，不要填写网页聊天地址或完整的 `/chat/completions` 路径。`.env`、`.venv` 已加入本目录的 Git 忽略规则。脚本仅加载本目录 `.env`；同名终端环境变量优先。

先运行 `python 01_quick_start.py`，再按下表逐个运行。本次全部 15 个编号脚本已实际验证通过，详见 [验证记录.md](验证记录.md)。

## 2. 逐个运行顺序

所有模型练习（含 03、04）现在统一使用 `.env` 中的硅基流动 DeepSeek。03、04 保留旧文件名方便继续运行，但不再访问魔搭或本地模型服务。12 是独立搜索练习，不配置搜索密钥也能跑 07。

| 编号与命令 | 对应小节 | 需要什么 | 观察什么 |
| --- | --- | --- | --- |
| `python 00_check_environment.py` | 准备 | 无密钥 | 依赖版本、配置是否填写，不联网 |
| `python 01_quick_start.py` | 7.1 | LLM 三项配置 | 最小 SimpleAgent 调用、2 条历史消息 |
| `python 02_llm_and_stream.py` | 7.2 | LLM 三项配置 | Provider 检测、普通调用、逐段流式输出 |
| `python 03_modelscope_provider.py` | 7.2.1 | LLM 三项配置 | 使用同一 DeepSeek 验证 Provider 接口 |
| `python 04_local_model.py` | 7.2.2 | LLM 三项配置 | 同一兼容接口调用云端 DeepSeek |
| `python 05_message_config_agent.py` | 7.3 | 无密钥 | Message 转字典、Config、继承 Agent、历史清空 |
| `python 06_simple_agent.py` | 7.4.1 | LLM 三项配置 | 多轮对话、真实工具日志、结果 152、流式、工具增删 |
| `python 07_react_agent.py` | 7.4.2 | LLM 三项配置 | Action → Observation → Finish，计算结果 112 |
| `python 08_reflection_agent.py` | 7.4.3 | LLM 三项配置 | 初稿 → 反馈 → 改写；再跑自定义代码提示词 |
| `python 09_plan_and_solve.py` | 7.4.4 | LLM 三项配置 | 计划列表 → 每步结果 → 最终总数 70 |
| `python 10_function_calling.py` | 7.4.5 | LLM 配置，模型支持 `tools` | 原生工具调用、`tool_call_id` 回传、结果 10 |
| `python 11_calculator_and_registry.py` | 7.5.1—7.5.2 | 无密钥 | 函数注册、Tool 对象注册、计算、注销 |
| `python 12_advanced_search.py` | 7.5.3，选做 | Tavily / SerpAPI 至少一个 Key | 真实结果和来源 URL，搜索失败时回退 |
| `python 13_tool_chain.py` | 7.5.4 | 无密钥 | `(25+15)` 传给下一步 `*3`，结果 120 |
| `python 14_async_tools.py` | 7.5.4 | 无密钥 | 并发执行三个计算，输出 4、4.0、112 |

还没配 API 时，先跑下面四个练习：

```bash
python 05_message_config_agent.py
python 11_calculator_and_registry.py
python 13_tool_chain.py
python 14_async_tools.py
```

模型回答有随机性：06、07、10 要查看实际工具调用日志，不能仅凭最终答案正确认定调用了工具。08 的“无需改进”只是模型审查结论；生成代码不会自动执行。05 中 Config 的 `max_history_length` 只是配置字段，框架基类不会自动裁剪历史。

## 3. 实现文件怎么读

| 实现文件 | 负责什么 | 搭配入口 |
| --- | --- | --- |
| `common.py` | 定位 .env、检查必填项、构造客户端、失败退出 | 所有入口 |
| `my_llm.py` | Provider 扩展、普通与流式调用 | 02—04 |
| `my_simple_agent.py` | 历史消息、文本工具调用、流式对话 | 06 |
| `my_react_agent.py` | 行动解析、工具执行、观察回填、步数限制 | 07 |
| `my_reflection_agent.py` | 初稿、反馈、迭代改写 | 08 |
| `my_plan_solve_agent.py` | Planner、Executor、计划解析 | 09 |
| `my_function_call_agent.py` | JSON 参数、原生工具调用完整循环 | 10 |
| `my_calculator_tool.py` | AST 计算、函数和 Tool 类两种接口 | 06、07、10、11、13、14 |
| `my_advanced_search.py` | Tavily / SerpAPI 请求与回退 | 12 |
| `tool_chain_manager.py` | 前一步输出作为后一步输入 | 13 |
| `async_tool_executor.py` | 线程池与 asyncio 并发调度 | 14 |
| `verify_offline.py` | 固定响应测试 Agent 控制流、解析和错误分支 | 自检 |

## 4. 统一使用硅基流动 DeepSeek

全部模型入口读取 `LLM_MODEL_ID`、`LLM_API_KEY`、`LLM_BASE_URL`。
当前使用模型 `deepseek-ai/DeepSeek-V4-Flash`，地址 `https://api.siliconflow.cn/v1`。
03、04 的文件名为了兼容之前的命令予以保留；03 验证统一 Provider 调用，04 改为通过云端模型说明本地与云端部署的区别，不是本地部署实测。

**独立搜索练习 12**：仍需 Tavily 或 SerpAPI，模型 API 不等于互联网搜索 API。只需一个搜索源，SerpAPI 非必需。运行状态见 [验证记录.md](验证记录.md)。

## 5. 与原始示例的差异

- 补齐原目录缺失的 `my_reflection_agent.py` 和 `my_plan_solve_agent.py`，完整实现可直接阅读。
- 修正 ReAct 初始化与 `register_function(name, description, func)` 的参数对应；`Agent` 从 `hello_agents.core.agent` 导入。
- SimpleAgent 统一经过注册表分发工具，兼容函数注册与对象注册；不再调用缺失的参数解析方法。
- 原文 7.4.5 说明 FunctionCallAgent 在 0.2.8 之后才引入，与前文 0.1.1 不兼容。本目录用原生 OpenAI 协议实现完整循环，不导入不存在的类，也不只打印第一次 completion。
- 计算器拒绝任意代码、字符串、非法运算，补充负数支持；出错返回明确错误。
- 工具链使用能实际衔接的纯数学表达式，避免把“根据以下信息计算……”这样的自然语言交给 AST 计算器。
- 并发例子实际注册工具并显式关闭线程池；搜索返回来源 URL，空结果触发回退。
- 所有入口加 `main` 守卫；缺配置、API 异常、计划无效、步数超限均以非零退出，不打印虚假的成功。
- 规划解析使用 `ast.literal_eval`，支持裸列表和代码围栏；最多 10 步，避免异常输出导致无限调用。

## 6. 验证与排错

```bash
python verify_offline.py
python -m pip check
```

本次已验证的项目与限制记录在 [验证记录.md](验证记录.md)。离线测试采用固定模型响应，不会请求真实模型，也不证明账号权限或模型表现。日常运行编号脚本始终使用真实服务，没有偷偷回退到模拟结果。

- `ModuleNotFoundError`：确认已经 `source .venv/bin/activate`，再用同一个 `python -m pip install -r requirements.txt`。
- 缺少配置：检查本目录 `.env`；运行 00 看是否填写。不要把 Key 贴进笔记或截图。
- AuthenticationError / PermissionDeniedError：检查 Key 和模型访问权限；NotFoundError 常见于模型名或接口地址不匹配。
- ConnectionError / Timeout：检查硅基流动服务地址、网络及超时配置。
- 10 提示 BadRequestError：确认当前模型及接口支持 Chat Completions 的 `tools` 参数。
- ReAct 超出步数或计划格式无效：查看实现中的提示词，换支持指令遵循的模型或合理调整上限；错误不会被当成正常答案。
- 日志只有最终答案没有工具记录：说明模型未调用工具，应检查工具描述与提示词。

## 来源

- 本地教材：[第七章 构建你的Agent框架](../../hello-agents/docs/chapter7/第七章%20构建你的Agent框架.md)
- 本地配套源码：[code/chapter7](../../hello-agents/code/chapter7/)
- 上游项目：[Datawhale Hello-Agents](https://github.com/datawhalechina/hello-agents)

本目录为学习整理版，包含复制、改编的教材代码和补全实现；教材许可副本见 `LICENSE-source.txt`（CC BY-NC-SA 4.0）。Python 依赖各自遵循其包内许可。
