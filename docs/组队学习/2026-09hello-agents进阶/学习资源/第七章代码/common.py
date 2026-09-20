"""所有入口共用配置；只加载本目录 .env，不向上查找其他项目凭据。"""
import os
from pathlib import Path
from dotenv import load_dotenv
from my_llm import MyLLM
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env", override=False)

def required(name):
    value = os.getenv(name, "").strip()
    if not value or value.startswith(("your-", "your_", "填写")):
        raise ValueError(f"请在 {ROOT / '.env'} 中填写 {name}")
    return value

def make_llm(kind="default"):
    # 所有学习入口统一使用 .env 的硅基流动 DeepSeek 配置。
    # 保留 kind 参数以兼容原入口，不再要求魔搭或本地模型密钥。
    return MyLLM(provider="auto", model=required("LLM_MODEL_ID"),
                 api_key=required("LLM_API_KEY"), base_url=required("LLM_BASE_URL"))

def run(main):
    try:
        main()
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as exc:
        # 不输出请求对象或凭据；原始错误可在调试器中查看。
        if isinstance(exc, (ValueError, RuntimeError)):
            print(f"运行失败：{exc}")
        else:
            print(f"运行失败（{type(exc).__name__}）。检查模型权限、服务地址、网络与超时配置。")
        raise SystemExit(1)
