
### Task 02：堆栈与深度优先搜索（5 天）

#### 02-01 堆栈基础知识（2 天）

- 第 05 ~ 06 天学习内容：
  - [堆栈基础知识](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/03.Stack/01.Stack-Basic/01.Stack-Basic.md)
  
- 第 05 天课程题目：
  - [0155. 最小栈](https://leetcode-cn.com/problems/min-stack/)
    * 代码
      ```python
      class MinStack(object):
            def __init__(self):
                """
                initialize your data structure here.
                """
                self.stack = []
            def push(self, x):
                """
                :type x: int
                :rtype: void
                """
                if not self.stack:
                    self.stack.append((x, x))
                else:
                    self.stack.append((x, min(x, self.stack[-1][1])))
            def pop(self):
                """
                :rtype: void
                """
                self.stack.pop()
            def top(self):
                """
                :rtype: int
                """
                return self.stack[-1][0]
            def getMin(self):
                """
                :rtype: int
                """
                return self.stack[-1][1]
      ```
      
      ![image-20220118201153168](img/Task2/image-20220118201153168-2507914.png)
  - [0020. 有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)
  - [0227. 基本计算器 II](https://leetcode-cn.com/problems/basic-calculator-ii/)
  
- 第 06 天课程题目：
  - [0150. 逆波兰表达式求值](https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/)
  
    - 代码
  
      ```python
      class Solution(object):
          def evalRPN(self, tokens):
              stack = []
              for token in tokens:
                  try:
                      stack.append(int(token))
                  except:
                      num2 = stack.pop()
                      num1 = stack.pop()
                      stack.append(self.evaluate(num1, num2, token))
              return stack[0]
      
          def evaluate(self, num1, num2, op):
              if op == "+":
                  return num1 + num2
              elif op == "-":
                  return num1 - num2
              elif op == "*":
                  return num1 * num2
              elif op == "/":
                  return int(num1 / float(num2))
      ```
  
      
  
  - [0394. 字符串解码](https://leetcode-cn.com/problems/decode-string/)
  
  - [0946. 验证栈序列](https://leetcode-cn.com/problems/validate-stack-sequences/)
  
- [更多堆栈基础知识相关题目](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/03.Stack/01.Stack-Basic/10.Stack-Basic-List.md)

#### 02-02 栈与深度优先搜索（3 天）

- 第 07 ~ 09 天学习内容：
  - [栈与深度优先搜索](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/03.Stack/02.Stack-DFS/01.Stack-DFS.md)
  
- 第 07 天课程题目：
  - [0200. 岛屿数量](https://leetcode-cn.com/problems/number-of-islands/)
  
    - 代码
  
      ```python
      class Solution(object):
          def numIslands(self, grid):
              def dfs(grid, i, j):
                  if not 0 <= i < len(grid) or not 0 <= j < len(grid[0]) or grid[i][j] == '0': return
                  grid[i][j] = '0'
                  dfs(grid, i + 1, j)
                  dfs(grid, i, j + 1)
                  dfs(grid, i - 1, j)
                  dfs(grid, i, j - 1)
              count = 0
              for i in range(len(grid)):
                  for j in range(len(grid[0])):
                      if grid[i][j] == '1':
                          dfs(grid, i, j)
                          count += 1
              return count
       
      ```
  
      
  
  - [0133. 克隆图](https://leetcode-cn.com/problems/clone-graph/)
  
  - [0494. 目标和](https://leetcode-cn.com/problems/target-sum/)
  
- 第 08 天课程题目：
  - [0841. 钥匙和房间](https://leetcode-cn.com/problems/keys-and-rooms/)
  
    - 代码
  
      ```python
      class Solution:
          def canVisitAllRooms(self, rooms):
              st = set()
      
              def dfs(n ):
                  if n in st:
                      return 
                  st.add(n)
                  for i in rooms[n]:
                      dfs(i)
      
              dfs(0)
              return len(rooms) == len(st)
       
      ```
  
      
  
  - [0695. 岛屿的最大面积](https://leetcode-cn.com/problems/max-area-of-island/)
  
  - [0130. 被围绕的区域](https://leetcode-cn.com/problems/surrounded-regions/)
  
- 第 09 天课程题目：
  - [0417. 太平洋大西洋水流问题](https://leetcode-cn.com/problems/pacific-atlantic-water-flow/)
  
  - [1020. 飞地的数量](https://leetcode-cn.com/problems/number-of-enclaves/)
  
  - [1254. 统计封闭岛屿的数目](https://leetcode-cn.com/problems/number-of-closed-islands/)
  
    - 代码
  
      ```python
      class Solution(object):
          def closedIsland(self, grid):
       
              m, n = len(grid), len(grid[0])
              def dfs(x, y):
                  if grid[x][y] == 1:
                      return
                  grid[x][y] = 1
                  for mx, my in [(x-1, y), (x+1, y), (x, y-1), (x, y+1)]:
                      if 0 <= mx < m and 0 <= my < n:
                          dfs(mx, my)
              for i in range(m):
                  dfs(i, 0)
                  dfs(i, n-1)
              for j in range(n):
                  dfs(0, j)
                  dfs(m-1, j)
              ans = 0
              for i in range(m):
                  for j in range(n):
                      if grid[i][j] == 0:
                          dfs(i, j)
                          ans += 1
              return ans
       
      ```
  
      
  
- [更多栈与深度优先搜索题目](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/03.Stack/02.Stack-DFS/10.Stack-DFS-List.md)
