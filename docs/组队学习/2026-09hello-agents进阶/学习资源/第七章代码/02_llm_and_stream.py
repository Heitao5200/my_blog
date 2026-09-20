"""7.2 普通调用与流式调用。"""
from common import run
from common import make_llm

def main():
    llm = make_llm()
    print("自动检测 Provider：", llm.provider)
    print(llm.invoke([{"role": "user", "content": "用一句话介绍 LLM。"}]))
    for chunk in llm.think([{"role": "user", "content": "用三句话介绍 Agent 的组成。"}]):
        print(chunk, end="", flush=True)
    print()

if __name__ == "__main__":
    run(main)
