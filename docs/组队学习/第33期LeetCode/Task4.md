#### 04-01 队列基础知识（1 天）

- 第 11 天学习内容：
  - [队列基础知识](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/01.Queue-Basic/01.Queue-Basic.md)
  
- 第 11 天课程题目：
  - [0622. 设计循环队列](https://leetcode-cn.com/problems/design-circular-queue/)
  
    ```
    class MyCircularQueue:
    
        def __init__(self, k):
            """
            Initialize your data structure here. Set the size of the queue to be k.
            """
            self.queue = [0]*k
            self.headIndex = 0
            self.count = 0
            self.capacity = k
    
        def enQueue(self, value):
            """
            Insert an element into the circular queue. Return true if the operation is successful.
            """
            if self.count == self.capacity:
                return False
            self.queue[(self.headIndex + self.count) % self.capacity] = value
            self.count += 1
            return True
    
        def deQueue(self):
            """
            Delete an element from the circular queue. Return true if the operation is successful.
            """
            if self.count == 0:
                return False
            self.headIndex = (self.headIndex + 1) % self.capacity
            self.count -= 1
            return True
    
        def Front(self):
            """
            Get the front item from the queue.
            """
            if self.count == 0:
                return -1
            return self.queue[self.headIndex]
    
        def Rear(self):
            """
            Get the last item from the queue.
            """
            # empty queue
            if self.count == 0:
                return -1
            return self.queue[(self.headIndex + self.count - 1) % self.capacity]
    
        def isEmpty(self):
            """
            Checks whether the circular queue is empty or not.
            """
            return self.count == 0
    
        def isFull(self):
            """
            Checks whether the circular queue is full or not.
            """
            return self.count == self.capacity
    
    ```
  
    
  
  - [剑指 Offer II 041. 滑动窗口的平均值](https://leetcode-cn.com/problems/qIsx9U/)
  
  - [0225. 用队列实现栈](https://leetcode-cn.com/problems/implement-stack-using-queues/)
  
- [更多队列基础题目](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/01.Queue-Basic/10.Queue-Basic-List.md)

#### 04-02 队列与广度优先搜索（2 天）

- 第 12 天学习内容：
  - [队列与广度优先搜索](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/02.Queue-BFS/01.Queue-BFS.md)
  
- 第 12 天课程题目：
  - [0463. 岛屿的周长](https://leetcode-cn.com/problems/island-perimeter/)
  
  - [0752. 打开转盘锁](https://leetcode-cn.com/problems/open-the-lock/)
  
  - [0279. 完全平方数](https://leetcode-cn.com/problems/perfect-squares/)
  
    ```
    class Solution(object):
        def numSquares(self, n):
            """
            :type n: int
            :rtype: int
            """
            nums = [i*i for i in range(1, int(n**0.5)+1)]
            f = [0] + [float('inf')]*n
            for num in nums:
                for j in range(num, n+1):
                    f[j] = min(f[j], f[j-num]+1)
            return f[-1]
    ```
  
    
  
- 第 13 天课程题目：
  - [0542. 01 矩阵](https://leetcode-cn.com/problems/01-matrix/)
  
  - [0322. 零钱兑换](https://leetcode-cn.com/problems/coin-change/)
  
    ```
    class Solution(object):
        def coinChange(self, coins, amount):
            """
            :type coins: List[int]
            :type amount: int
            :rtype: int
            """
            memo = [float('inf')]*(amount +1)
            memo[0] = 0
            for coin in coins:
                for i in range(coin ,amount+1):
                    memo[i] = min(memo[i],memo[i- coin]+1)
            if memo[amount] != float('inf'):
                return memo[amount]
            else:
                return -1
    ```
  
    
  
  - [剑指 Offer 13. 机器人的运动范围](https://leetcode-cn.com/problems/ji-qi-ren-de-yun-dong-fan-wei-lcof/)
  
- [更多队列与广度优先搜索题目](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/02.Queue-BFS/10.Queue-BFS-List.md)