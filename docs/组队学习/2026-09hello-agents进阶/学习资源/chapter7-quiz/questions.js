window.QUIZ_QUESTIONS = [
  {
    "id": 1,
    "question": "在 HelloAgents 框架的设计理念中，为了简化学习曲线，开发者将 Memory、RAG 和 MCP 等模块统一抽象为什么？",
    "options": [
      "智能体插件 (Plugins)",
      "工具 (Tools)",
      "知识库 (Knowledge Bases)",
      "中间件 (Middleware)"
    ],
    "answer": 1,
    "explanations": [
      "插件通常指外部扩展，而框架选择了一种更核心的逻辑进行抽象。",
      "第 7.1.2 节提到，为了消除不必要的抽象层，除了核心 Agent 类，一切皆为工具，这能让学习者回归到“智能体调用工具”的核心逻辑。",
      "知识库仅覆盖了 RAG 的部分属性，不足以涵盖 Memory 或协议等动态功能。",
      "中间件多见于传统后端框架，HelloAgents 强调教学友好性，采用了更直观的抽象方式。"
    ],
    "section": "7.1.2"
  },
  {
    "id": 2,
    "question": "HelloAgentsLLM 在自动检测模型提供商 (Provider) 时，下列哪项具有最高的判断优先级？",
    "options": [
      "检查通用环境变量 LLM_API_KEY 的格式",
      "解析 base_url 中的域名特征字符串",
      "检查特定服务商的环境变量（如 MODELSCOPE_API_KEY）",
      "通过 base_url 的端口号判断本地服务"
    ],
    "answer": 2,
    "explanations": [
      "API 密钥格式分析被视为辅助手段，优先级较低。",
      "根据 URL 匹配属于次高优先级，是在未发现特定环境变量时的选择。",
      "第 7.2.3 节明确指出，检查特定服务商的环境变量是最直接、可靠的判断依据，拥有最高优先级。",
      "端口匹配属于根据 URL 判断的一部分，其优先级低于直接检测环境变量。"
    ],
    "section": "7.2.3"
  },
  {
    "id": 3,
    "question": "在没有设置特定服务商密钥环境变量、也没有显式指定 provider 的前提下，若 LLM_BASE_URL=\"http://localhost:11434/v1\"，按第 7.2.3 节示例会识别为哪种提供商？",
    "options": [
      "VLLM",
      "Ollama",
      "OpenAI",
      "ModelScope"
    ],
    "answer": 1,
    "explanations": [
      "VLLM 的标准默认端口通常是 8000 而非 11434。",
      "第 7.2.3 节提到，端口 :11434 是 Ollama 服务的标准端口，框架据此进行识别。",
      "OpenAI 是在线云服务，其 URL 通常包含官方域名而非 localhost。",
      "ModelScope 的在线推理地址通常包含特定的云端 API 域名。"
    ],
    "section": "7.2.3"
  },
  {
    "id": 4,
    "question": "在 HelloAgents 的核心接口设计中，Message 类的 role 字段被严格限制在哪些取值范围内？",
    "options": [
      "user, assistant, system, tool",
      "human, ai, system, tool",
      "user, bot, admin, tool",
      "input, output, context, observation"
    ],
    "answer": 0,
    "explanations": [
      "第 7.3.1 节通过 typing.Literal 规定了这四种角色，直接对应 OpenAI API 的规范。",
      "虽然 human/ai 在某些框架中使用，但 HelloAgents 为了兼容 OpenAI 标准使用了 user/assistant。",
      "bot 和 admin 并非大模型 API 交互中的标准角色定义。",
      "这些词描述了数据的性质，但不是消息传递系统中的法定角色身份。"
    ],
    "section": "7.3.1"
  },
  {
    "id": 5,
    "question": "关于 Agent 抽象基类的设计，以下叙述正确的是：",
    "options": [
      "Agent 类可以直接实例化使用",
      "可实例化的具体子类必须实现或继承 run 的具体实现",
      "历史记录管理由每个具体的 Agent 子类独立实现",
      "Agent 基类内部不包含 LLM 实例"
    ],
    "answer": 1,
    "explanations": [
      "Agent 继承自 ABC (Abstract Base Class)，是一个抽象类，不能直接实例化。",
      "第 7.3.3 节使用 @abstractmethod 定义 run；未提供具体实现的子类仍是抽象类，不能实例化。实现也可以继承自中间父类。",
      "基类 Agent 已经提供了通用的历史记录管理方法，如 add_message 和 get_history。",
      "Agent 的构造函数中明确接收并持有一个 HelloAgentsLLM 实例。"
    ],
    "section": "7.3.3"
  },
  {
    "id": 6,
    "question": "在 7.4.1 节实现的 MySimpleAgent 中，若启用了工具调用，其默认识别工具调用的格式是什么？",
    "options": [
      "{ \"tool\": \"name\", \"args\": \"...\" }",
      "Call: tool_name(parameters)",
      "[TOOL_CALL:tool_name:parameters]",
      "Step: Action = tool_name, Input = parameters"
    ],
    "answer": 2,
    "explanations": [
      "这是常见的 JSON 格式，但 MySimpleAgent 示例中采用了基于正则解析的自定义标记格式。",
      "这种格式接近函数调用，但与代码中定义的正则表达式模式不匹配。",
      "根据 7.4.1 节代码中的正则表达式 `r'\\[TOOL_CALL:([^:]+):([^\\]]+)\\]'`，这是预设的工具触发格式。",
      "这种格式更接近 ReAct 范式的描述方式，而非 SimpleAgent 的轻量级实现。"
    ],
    "section": "7.4.1"
  },
  {
    "id": 7,
    "question": "ReActAgent 在单步运行过程中，提示词模板要求 LLM 输出的结构包含哪两部分？",
    "options": [
      "Plan (计划) 和 Execute (执行)",
      "Thought (思考) 和 Action (行动)",
      "Analysis (分析) 和 Result (结果)",
      "Observation (观察) 和 Final Answer (最终答案)"
    ],
    "answer": 1,
    "explanations": [
      "这是 Plan-and-Solve 范式的特点，ReAct 强调即时的思考与行动。",
      "第 7.4.2 节的提示词模板要求严格按照 Thought 和 Action 的格式进行回应，以实现推理与行动的结合。",
      "Result 通常是 Action 的执行结果，而不是模型主动生成的指令。",
      "Observation 是由工具反馈的，不是模型输出的必备结构。"
    ],
    "section": "7.4.2"
  },
  {
    "id": 8,
    "question": "与第四章的初版实现相比，第七章框架化的 ReflectionAgent 在设计上最显著的通用化改进是什么？",
    "options": [
      "仅支持 Python 代码的自我修正",
      "支持通过 custom_prompts 参数注入自定义任务提示词",
      "移除了反思环节，直接进行二次生成",
      "不再记录历史对话以节省 Token"
    ],
    "answer": 1,
    "explanations": [
      "第四章更偏重代码，第七章则通过通用 Prompt 扩展了应用场景。",
      "第 7.4.3 节提到，框架版本采用了通用化设计，并允许用户通过 custom_prompts 进行深度定制。",
      "Reflection 范式的核心正是反思，移除它将违背该范式的定义。",
      "为了进行优化（Refine），Agent 必须参考之前的尝试和反馈，历史记录是必要的。"
    ],
    "section": "7.4.3"
  },
  {
    "id": 9,
    "question": "在 PlanAndSolveAgent 的执行流程中，Planner（规划器）在提示词中被要求以何种数据格式输出计划？",
    "options": [
      "有序的 Markdown 列表",
      "单一的长字符串",
      "Python 列表字符串",
      "JSON 格式的键值对"
    ],
    "answer": 2,
    "explanations": [
      "Markdown 列表虽然人类易读，但不如编程语言内置格式便于程序后续精确处理。",
      "长字符串难以分割成独立的子任务，不利于 Executor 逐步执行。",
      "第 7.4.4 节提示词要求输出 Python 列表字符串，便于解析成步骤；提示词约束不能保证模型始终遵守格式，程序仍需处理解析失败。",
      "虽然 JSON 可选，但原文示例中明确使用了 `[\"步骤1\", \"步骤2\", ...]` 形式的 Python 列表。"
    ],
    "section": "7.4.4"
  },
  {
    "id": 10,
    "question": "FunctionCallAgent 在 hello-agents 的哪个版本系列中被正式引入？",
    "options": [
      "0.1.x 版本",
      "0.2.8 之后版本",
      "1.0.0 正式版",
      "所有版本均内置支持"
    ],
    "answer": 1,
    "explanations": [
      "0.1.1 版本是本章起步的基础版本，主要聚焦于手动解析的提示词 Agent。",
      "第 7.4.5 节明确说明，FunctionCallAgent 是在 0.2.8 之后引入的，基于 OpenAI 原生函数调用机制。",
      "根据原文描述，该功能在 0.2.x 迭代中就已经出现。",
      "早期版本主要依赖提示词（Prompt）约束来实现工具调用，而非原生 API。"
    ],
    "section": "7.4.5"
  },
  {
    "id": 11,
    "question": "根据 7.5.1 节，Tool 基类中哪个抽象方法用于定义工具的具体执行逻辑？",
    "options": [
      "execute",
      "run",
      "call",
      "apply"
    ],
    "answer": 1,
    "explanations": [
      "虽然名字相似，但代码示例中定义的标准抽象方法名为 run。",
      "Tool 基类要求子类实现抽象方法 run(self, parameters)，以统一工具的调用行为。",
      "call 不是定义的抽象方法名称。",
      "apply 并非 Tool 类的核心接口方法。"
    ],
    "section": "7.5.1"
  },
  {
    "id": 12,
    "question": "ToolRegistry 除了支持完整的 Tool 对象注册外，还提供了一种什么便捷方式来集成现有功能？",
    "options": [
      "自动扫描当前目录下的所有脚本",
      "通过装饰器自动注册所有全局变量",
      "直接注册 Python 函数作为工具 (register_function)",
      "使用外部 API 文档链接进行动态解析"
    ],
    "answer": 2,
    "explanations": [
      "这种方式风险较高且过于隐式，框架未采用。",
      "全局变量并非函数，无法直接作为工具执行。",
      "第 7.5.1 节提到，register_function 适合简单工具，可以快速集成现有函数而无需编写类。",
      "动态解析外部文档超出了本章自建框架的基础功能范围。"
    ],
    "section": "7.5.1"
  },
  {
    "id": 13,
    "question": "第 7.5.2 节的自定义数学计算器示例使用哪个 Python 标准库模块解析表达式的语法结构？",
    "options": [
      "eval",
      "ast (Abstract Syntax Trees)",
      "math",
      "re (Regular Expressions)"
    ],
    "answer": 1,
    "explanations": [
      "eval 直接执行字符串代码，存在严重的安全漏洞（如注入攻击）。",
      "第 7.5.2 节使用 ast.parse 解析表达式，再按节点类型及运算符、函数表求值。使用 ast 本身不保证安全；示例仍需完善节点、类型和资源限制。",
      "math 库提供了数学函数，但不提供安全解析表达式字符串的机制。",
      "正则可以提取数值，但处理带有优先级和嵌套函数的数学表达式非常困难且不稳健。"
    ],
    "section": "7.5.2"
  },
  {
    "id": 14,
    "question": "SearchTool 的“混合搜索 (hybrid)”模式展现了何种设计思想？",
    "options": [
      "性能至上：同时并发请求所有后端并取最快的一个",
      "降级机制：优先尝试 Tavily，失败时在 SerpApi 可用的条件下切换",
      "成本控制：总是选择最便宜的后端而忽略结果质量",
      "数据隔离：不同类型的查询必须分发到不同的专用搜索源"
    ],
    "answer": 1,
    "explanations": [
      "虽然并发也是一种策略，但原文描述的是基于优先级和可用性的降级逻辑。",
      "第 7.5.3 节详细说明了混合搜索如何智能选择后端并处理失败情况，以保证工具的高可用性。",
      "设计初衷是提供最佳搜索结果，而非单一的成本考量。",
      "混合模式倾向于在通用查询上寻找成功率最高的方式，而非强制类型隔离。"
    ],
    "section": "7.5.3"
  },
  {
    "id": 15,
    "question": "ToolChain（工具链）允许 Agent 顺序执行多个步骤。如果中间步骤需要引用前面步骤的输出，框架通过什么机制实现？",
    "options": [
      "共享全局变量",
      "上下文 context 字典与 output_key 引用",
      "将结果临时写入本地文件",
      "依靠 LLM 的记忆自动感知"
    ],
    "answer": 1,
    "explanations": [
      "全局变量容易产生冲突且不利于并发执行。",
      "根据 7.5.4 节代码，通过 add_step 指定 output_key，后续步骤在 input_template 中使用变量占位符引用该键值。",
      "文件 I/O 效率较低且增加了系统依赖性。",
      "工具链执行通常是确定性的程序逻辑，需要显式的数据传递而非依赖模型推理。"
    ],
    "section": "7.5.4"
  },
  {
    "id": 16,
    "question": "AsyncToolExecutor（异步工具执行器）在执行耗时工具任务时，底层主要利用了什么技术？",
    "options": [
      "多进程池 (ProcessPoolExecutor)",
      "线程池 (ThreadPoolExecutor) 与 asyncio 结合",
      "分布式消息队列",
      "GPU 硬件加速推理"
    ],
    "answer": 1,
    "explanations": [
      "通常网络请求等 IO 密集型任务使用线程池已足够，多进程更适合 CPU 密集型任务。",
      "第 7.5.4 节展示了通过 run_in_executor 将同步工具函数包装进异步循环中并行执行。",
      "HelloAgents 作为一个轻量级学习框架，暂未引入复杂的消息队列依赖。",
      "这是 LLM 运行层面的技术，而不是工具系统执行外部请求的技术。"
    ],
    "section": "7.5.4"
  },
  {
    "id": 17,
    "question": "根据第 7.2.3 节的代码 for chunk in llm.think(messages): print(chunk, end=\"\")，该示例如何使用 think 的返回值？",
    "options": [
      "将返回值视为已经拼接完成的单一答案字符串",
      "遍历返回的流式片段并逐段输出",
      "将返回值解析为工具注册表",
      "将返回值直接作为异步任务交给 asyncio.gather"
    ],
    "answer": 1,
    "explanations": [
      "示例逐个遍历 chunk，并非直接打印一个完整答案。",
      "第 7.2.1 节将返回值命名为 response_stream，第 7.2.3 节通过 for chunk 遍历它；不能据此声称 think 总是返回完整文本。",
      "代码是在输出模型响应，不涉及注册工具。",
      "该示例使用普通 for 循环，没有此异步调用。"
    ],
    "section": "7.2.1、7.2.3"
  },
  {
    "id": 18,
    "question": "在 Config 类中，from_env 方法的主要作用是：",
    "options": [
      "自动将当前代码上传到云端环境",
      "从操作系统环境变量中读取配置以覆盖默认值",
      "加密存储敏感的 API 密钥",
      "验证本地硬件是否满足运行要求"
    ],
    "answer": 1,
    "explanations": [
      "框架并不涉及自动部署功能。",
      "第 7.3.2 节提到，该方法允许用户通过设置环境变量调整框架行为，而无需修改核心代码。",
      "Config 类负责管理和读取配置，但不直接提供加密存储功能。",
      "硬件验证通常由 LLM 推理引擎处理，而非框架配置类。"
    ],
    "section": "7.3.2"
  },
  {
    "id": 19,
    "question": "ReActAgent 的 run 方法中，如果 LLM 输出的结果解析后 Action 为 `Finish[答案]`，意味着：",
    "options": [
      "Agent 崩溃了，需要重启",
      "Agent 认为信息已足够，给出最终结论并结束循环",
      "Agent 强制要求用户输入更多信息",
      "当前步数已达到 max_steps 阈值"
    ],
    "answer": 1,
    "explanations": [
      "这是正常的程序逻辑，并非异常中断。",
      "第 7.4.2 节代码逻辑显示，当解析出 Finish 时，Agent 将提取括号内容作为结果并返回。",
      "Finish 代表 Agent 自己完成了任务，而不是向用户提问。",
      "步数超限通常返回预设的错误提示，而不是带结果的 Finish 指令。"
    ],
    "section": "7.4.2"
  },
  {
    "id": 20,
    "question": "关于 7.1.1 节中提到的自建框架必要性，以下哪项不属于对市面现有框架（如 LangChain）局限性的分析？",
    "options": [
      "过度抽象带来的学习曲线陡峭",
      "快速迭代导致 API 接口不稳性",
      "框架的代码实现过于黑盒，缺乏定制能力",
      "商业化框架普遍不支持中文提示词"
    ],
    "answer": 3,
    "explanations": [
      "原文明确指出了 LangChain 链式调用机制对初学者来说理解成本很高。",
      "这是原文中提到的维护成本居高不下的主因之一。",
      "原文提到由于封装过严，开发者难以理解 Agent 内部工作机制。",
      "第 7.1.1 节列出的局限包括抽象复杂、迭代不稳定、实现黑盒和依赖复杂，没有列出不支持中文提示词。"
    ],
    "section": "7.1.1"
  }
];
