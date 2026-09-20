"""7.2.2：统一 OpenAI 兼容接口；本练习实际调用云端 DeepSeek，不启动本地模型。"""
from common import run, make_llm

def main():
    llm = make_llm()
    print("实际模型：", llm.model)
    print("使用 .env 中的云端服务配置；旧文件名仅保留编号兼容。")
    print(llm.invoke([{"role": "user", "content": "用一句话解释云端模型和本地模型部署的区别。"}]))

if __name__ == "__main__":
    run(main)
