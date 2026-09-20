"""环境检查，不发起 API 请求。"""
from common import run
import sys
import os
from importlib.metadata import version
from common import ROOT

def main():
    print("Python:", sys.version.split()[0])
    for name in ("hello-agents", "openai", "python-dotenv", "pydantic", "requests"):
        print(name, version(name))
    print("配置文件:", "已创建" if (ROOT / ".env").exists() else "未创建，请复制 .env.example 为 .env")
    for name in ("LLM_MODEL_ID", "LLM_API_KEY", "LLM_BASE_URL", "TAVILY_API_KEY", "SERPAPI_API_KEY"):
        print(name, "已填写" if os.getenv(name, "").strip() else "未填写")
    print("这只检查依赖和配置是否存在，不代表服务已连通。")

if __name__ == "__main__":
    run(main)
