# 黑桃学习之路 · my_blog

我的学习笔记仓库。用 [docsify](https://docsify.js.org/) 构建（纯 CDN 加载，没有构建步骤），发布在 GitHub Pages。

**在线阅读：<https://heitao5200.github.io/my_blog/>**　·　笔记按左侧侧边栏组织，支持右上角搜索。

内容主要是 Datawhale 各期组队学习的整理，以及自己在机器学习 / 深度学习 / NLP / 大模型 / 数据库 / 算法上的专题总结。

---

## 仓库结构

```
my_blog/
├── README.md        本文件（GitHub 仓库页展示用）
├── pyproject.toml   跑 notebook 用的 Python 依赖，与博客本身无关
├── poetry.lock
└── docs/            ← 站点根目录，GitHub Pages 发布的就是这里的 index.html
    ├── index.html   docsify 入口（含公式渲染插件）
    ├── _sidebar.md  侧边栏     _coverpage.md  封面
    ├── README.md    站点首页
    ├── favicon.svg
    ├── 学习/         专题笔记
    ├── 数据库/       MySQL 笔记
    └── 组队学习/     Datawhale 各期
```

想舒服地看，打开上面的在线阅读地址；想在仓库里翻文件，用下面的索引。

---

## 内容进度

新增：[2026-09 Hello-Agents 进阶学习计划、思考笔记与题库](docs/组队学习/2026-09hello-agents进阶/README.md)（学习准备阶段）。

### 组队学习（Datawhale 各期）

| 期次 | 笔记 | Task 编号 | 备注 |
| --- | ---: | --- | --- |
| 2024-01大模型理论基础 | 5 | 1, 2, 3, 4, 5 | — |
| 2024-02大模型实战 | 7 | 0, 1, 2, 3, 4, 5 | — |
| 2024-03动手学RAG | 7 | 1, 2, 3, 4, 5, 6, 8 | 缺 Task7 |
| 2024-03多智能体实战 | 2 | 1, 2 | — |
| 2024-04LLM之RAG实战(DOING) | 15 | 0, 1, 11, 22, 23, 25, 27, 28, 29, 30, 31, 32, 33, 34, 37 | 目录名标 DOING |
| 2024-05多模态图文问答(TODO) | 1 | 1 | 目录名标 TODO |
| 2024-06向量数据库Milvus | 1 | — | — |
| 2024-06大模型开发实战 | 5 | 1, 2, 3, 5, 6 | 缺 Task4 |
| 2024-07大模型框架llama_index | 0 | — | 暂无 markdown 笔记（只有 notebook / 代码） |
| 2024-08Elasticsearch学习 | 0 | — | 暂无 markdown 笔记（只有 notebook / 代码） |
| 2024-12AI冬令营(第一期) | 1 | 1 | — |
| Open_Learning_Camp-动手学习深度学习 | 2 | 1, 2 | — |
| 第32期推荐系统 | 5 | 0, 2, 3, 4, 5 | 缺 Task1 |
| 第33期LeetCode | 5 | 1, 2, 3, 4, 5 | — |

### 其它板块

| 板块 | 笔记数 |
| --- | ---: |
| 学习（含子目录） | 27 |
| 数据库 | 2 |

> 说明：`2024-07大模型框架llama_index` 与 `2024-08Elasticsearch学习` 目前只有 notebook 和源码，
> 尚未整理成 markdown 笔记，所以站内没有条目。

---

## 目录索引

### 学习

- [BERT学习](docs/学习/BERT学习.md)
- [HIVE学习](docs/学习/HIVE学习.md)
- [LangGPT： 面向大语言模型的自然语言编程框架](docs/学习/LangGPT：%20面向大语言模型的自然语言编程框架.md)
- [MySQL学习](docs/学习/MySQL学习.md)
- [RNN学习](docs/学习/RNN学习.md)
- [Spark学习](docs/学习/Spark学习.md)
- [TabNet学习](docs/学习/TabNet学习.md)
- [Transformer学习](docs/学习/Transformer学习.md)
- [hyperopt超参数优化](docs/学习/hyperopt超参数优化.md)
- [优化器](docs/学习/优化器.md)
- [学习笔记-物体检测算法R-CNN与YOLO](docs/学习/学习笔记-物体检测算法R-CNN与YOLO.md)
- [损失函数](docs/学习/损失函数.md)
- [时间序列学习](docs/学习/时间序列学习.md)
- [模型调参优化](docs/学习/模型调参优化.md)
- [激活函数学习](docs/学习/激活函数学习.md)
- [软实力](docs/学习/软实力.md)
- [项目介绍](docs/学习/项目介绍.md)
- [风控相关学习](docs/学习/风控相关学习.md)

#### LeetCode

- [382. 链表随机节点](docs/学习/LeetCode/382.%20链表随机节点.md)
- [二叉树](docs/学习/LeetCode/二叉树.md)
- [动态规划](docs/学习/LeetCode/动态规划.md)
- [数组](docs/学习/LeetCode/数组.md)
- [栈](docs/学习/LeetCode/栈.md)
- [滑动窗口](docs/学习/LeetCode/滑动窗口.md)
- [背包](docs/学习/LeetCode/背包.md)
- [链表](docs/学习/LeetCode/链表.md)

#### 异步编程基础

- [Task1学习笔记：Agent异步编程基础](docs/学习/异步编程基础/Task1学习笔记：Agent异步编程基础.md)

### 数据库

- [MYSQL笔记](docs/数据库/MYSQL笔记.md)
- [安装mysql主从](docs/数据库/安装mysql主从.md)

### 组队学习

#### 2024-01大模型理论基础

- [TASK1](docs/组队学习/2024-01大模型理论基础/TASK1.md)
- [TASK2](docs/组队学习/2024-01大模型理论基础/TASK2.md)
- [TASK3](docs/组队学习/2024-01大模型理论基础/TASK3.md)
- [TASK4](docs/组队学习/2024-01大模型理论基础/TASK4.md)
- [TASK5](docs/组队学习/2024-01大模型理论基础/TASK5.md)

#### 2024-02大模型实战

- [FASTGPT](docs/组队学习/2024-02大模型实战/FASTGPT.md)
- [TASK0](docs/组队学习/2024-02大模型实战/TASK0.md)
- [TASK1](docs/组队学习/2024-02大模型实战/TASK1.md)
- [TASK2](docs/组队学习/2024-02大模型实战/TASK2.md)
- [TASK3](docs/组队学习/2024-02大模型实战/TASK3.md)
- [TASK4](docs/组队学习/2024-02大模型实战/TASK4.md)
- [TASK5](docs/组队学习/2024-02大模型实战/TASK5.md)

#### 2024-03动手学RAG

- [TASK1](docs/组队学习/2024-03动手学RAG/TASK1.md)

#### 2024-03多智能体实战

- [TASK1](docs/组队学习/2024-03多智能体实战/TASK1.md)
- [TASK2](docs/组队学习/2024-03多智能体实战/TASK2.md)

#### 2024-04LLM之RAG实战(DOING)

- [Task01RAG为什么需要重排序](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task01RAG为什么需要重排序.md)
- [Task0大模型「训练」与「微调」概念详解](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task0大模型「训练」与「微调」概念详解.md)
- [Task11面向生产的RAG应用程序的12种调整策略指南](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task11面向生产的RAG应用程序的12种调整策略指南.md)
- [Task22LlamaIndex高级检索1-构建完整基本RAG框架](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task22LlamaIndex高级检索1-构建完整基本RAG框架.md)
- [Task23LlamaIndex高级检索2-父文档检索](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task23LlamaIndex高级检索2-父文档检索.md)
- [Task25使用LlamaIndex和BM25重排序实践](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task25使用LlamaIndex和BM25重排序实践.md)
- [Task27如何评估RAG系统](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task27如何评估RAG系统.md)
- [Task28探索RAG query重写](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task28探索RAG%20query重写.md)
- [Task29探索RAG-PDF解析](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task29探索RAG-PDF解析.md)
- [Task30探索RAG语义分块策略](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task30探索RAG语义分块策略.md)
- [Task31探索RAG重排序](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task31探索RAG重排序.md)
- [Task32使用RAGAs和LlamaIndex评估RAG](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task32使用RAGAs和LlamaIndex评估RAG.md)
- [Task33探索RAG在Table的应用](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task33探索RAG在Table的应用.md)
- [Task34使用LangChain的三个函数来优化RAG](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task34使用LangChain的三个函数来优化RAG.md)
- [Task37高级RAG从理论到LlamaIndex实现](docs/组队学习/2024-04LLM之RAG实战%28DOING%29/Task37高级RAG从理论到LlamaIndex实现.md)

#### 2024-05多模态图文问答(TODO)

- [Task1读取数据集](docs/组队学习/2024-05多模态图文问答%28TODO%29/Task1读取数据集.md)

#### 2024-06向量数据库Milvus

- [milvus基本使用](docs/组队学习/2024-06向量数据库Milvus/milvus基本使用.md)

#### 2024-06大模型开发实战

- [Task1](docs/组队学习/2024-06大模型开发实战/Task1.md)
- [Task2](docs/组队学习/2024-06大模型开发实战/Task2.md)
- [TASK3](docs/组队学习/2024-06大模型开发实战/TASK3.md)
- [Task5](docs/组队学习/2024-06大模型开发实战/Task5.md)
- [Task6](docs/组队学习/2024-06大模型开发实战/Task6.md)

#### 2024-12AI冬令营(第一期)

- [Task1 零基础定制你的专属大模型](docs/组队学习/2024-12AI冬令营%28第一期%29/Task1%20零基础定制你的专属大模型.md)

#### Open_Learning_Camp-动手学习深度学习

- [Task1 初识深度学习](docs/组队学习/Open_Learning_Camp-动手学习深度学习/Task1%20初识深度学习.md)
- [Task2 预备知识](docs/组队学习/Open_Learning_Camp-动手学习深度学习/Task2%20预备知识.md)

#### 第32期推荐系统

- [Task0](docs/组队学习/第32期推荐系统/Task0.md)
- [Task2](docs/组队学习/第32期推荐系统/Task2.md)
- [Task3](docs/组队学习/第32期推荐系统/Task3.md)
- [Task4](docs/组队学习/第32期推荐系统/Task4.md)
- [Task5](docs/组队学习/第32期推荐系统/Task5.md)

#### 第33期LeetCode

- [Task1](docs/组队学习/第33期LeetCode/Task1.md)
- [Task2](docs/组队学习/第33期LeetCode/Task2.md)
- [Task3](docs/组队学习/第33期LeetCode/Task3.md)
- [Task4](docs/组队学习/第33期LeetCode/Task4.md)
- [Task5](docs/组队学习/第33期LeetCode/Task5.md)

#### 2024-03动手学RAG/drop

- [TASK2](docs/组队学习/2024-03动手学RAG/drop/TASK2.md)
- [TASK3](docs/组队学习/2024-03动手学RAG/drop/TASK3.md)
- [TASK4](docs/组队学习/2024-03动手学RAG/drop/TASK4.md)
- [TASK5](docs/组队学习/2024-03动手学RAG/drop/TASK5.md)
- [TASK6](docs/组队学习/2024-03动手学RAG/drop/TASK6.md)
- [TASK8](docs/组队学习/2024-03动手学RAG/drop/TASK8.md)
