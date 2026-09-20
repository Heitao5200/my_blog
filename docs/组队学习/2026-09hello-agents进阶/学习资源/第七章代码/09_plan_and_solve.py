"""7.4.4 规划与执行，预期总数为70。"""
from common import run
from common import make_llm
from my_plan_solve_agent import MyPlanAndSolveAgent

def main():
    agent = MyPlanAndSolveAgent("规划助手", make_llm())
    print(agent.run("水果店周一卖15个苹果，周二是周一两倍，周三比周二少5个，三天总共卖多少个？"))
    print("历史消息数：", len(agent.get_history()))

if __name__ == "__main__":
    run(main)
