"""7.2.1：统一 Provider 调用；保留旧文件名，实际使用配置的 DeepSeek。"""
from common import run, make_llm

def main():
    llm = make_llm()
    print("实际模型：", llm.model)
    print("使用 .env 中的云端服务配置；旧文件名仅保留编号兼容。")
    print(llm.invoke([{"role": "user", "content": "你好，请用一句话介绍自己。"}]))

if __name__ == "__main__":
    run(main)
