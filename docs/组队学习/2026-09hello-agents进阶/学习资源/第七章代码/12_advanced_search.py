"""7.5.3 多源搜索；至少需要一个搜索 API Key，不需要 LLM。"""
from common import run
from my_advanced_search import MyAdvancedSearchTool

def main():
    result = MyAdvancedSearchTool().search("Python programming language first release 1991")
    print(result)

if __name__ == "__main__":
    run(main)
