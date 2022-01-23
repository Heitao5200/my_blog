### Task 05 优先队列（1 天）

- 第 14 天学习内容：
  - [优先队列](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/03.Priority-Queue/01.Priority-Queue.md)
  
- 第 14 天课程题目：
  - [0215. 数组中的第K个最大元素](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/)
  
    ```
    class Solution(object):
        def findKthLargest(self, nums, k):
            """
            :type nums: List[int]
            :type k: int
            :rtype: int
            """
    
            #   构造大小为 k 的小顶堆
            heap = [x for x in nums[:k]]
            heapq.heapify(heap)
            n = len(nums)
            for i in range(k, n):
                if nums[i] > heap[0]:
                    heapq.heappop(heap)
                    heapq.heappush(heap, nums[i])
            return heap[0]
    
    ```
  
    
  
  - [0347. 前 K 个高频元素](https://leetcode-cn.com/problems/top-k-frequent-elements/)
  
  - [0451. 根据字符出现频率排序](https://leetcode-cn.com/problems/sort-characters-by-frequency/)
  
- [更多优先队列题目](https://github.com/itcharge/LeetCode-Py/blob/main/Contents/04.Queue/03.Priority-Queue/10.Priority-Queue-List.md)