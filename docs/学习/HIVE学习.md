## 什么是HIVE?

**Hive 是一个基于 Hadoop 文件系统之上的数据仓库架构。**

- 为数据仓库的管理提供了许多功能：数据 ETL工具、数据存储管理和大型数据集的查询和分析能力
- 定义了类 SQL 的语言 -- Hive QL：允许用户进行和 SQL 相似的操作
- 允许开发人员方便地使用 Mapper 和 Reducer 操作：将 SQL 语句转换为 MapReduce 任务运行

## Hive 与关系数据库的区别?

- Hive 使用的是 Hadoop 的 HDFS（Hadoop 的分布式文件系统），关系数据库则是服务器本地的文件系统；
- Hive 使用的计算模型是 MapReduce，而关系数据库则是自己设计的计算模型；
- 关系数据库都是为实时查询的业务进行设计的，而 Hive 则是为海量数据做数据挖掘设计的，实时性很差；实时性的区别导致 Hive 的应用场景和关系数据库有很大的不同；
- Hive 很容易扩展自己的存储能力和计算能力，这个是继承 Hadoop 的，而关系数据库在这个方面要差很多。

## HiveQL 语句执行流程

- Hive 将用户的 HiveQL 语句通过解释器转换为 MapReduce 作业提交到 Hadoop 集群上
- Hadoop 监控作业执行过程，然后返回作业执行结果给用户

## Hive 应用场景?

**Hive 的最佳使用场合是大数据集的批处理作业，例如网络日志分析**。

Hive 构建在基于静态批处理的 Hadoop 之上，Hadoop 通常都有较高的延迟并且在作业提交和调度的时候需要大量的开销。 Hive 并非为联机事务处理而设计，Hive 并不提供实时的查询和基于行级的数据更新操作，如果要进行更新数据，一般可以通过分区或者表直接覆盖。

## Hive 的数据存储

**Hive 的存储是建立在 Hadoop 文件系统之上的。Hive 本身没有专门的数据存储格式，也不能为数据建立索引 。**

Hive 中主要包括 4 种数据模型：

- 表（Table）：Hive 中每个表都有一个对应的存储目录
- 外部表（External Table）：外部表指向已经在 HDFS 中存在的数据，也可以创建分区
- 分区（Partition）：每个分区都对应数据库中相应分区列的一个索引，但是其对分区的组织方式和传统关系数据库不同
- 桶（Bucket）：桶在指定列进行 Hash 计算时，会根据哈希值切分数据，使每个桶对应一个文件。

## 内部表和外部表的区别？

- 内部表其实就是管理表，当我们删除一个管理表时，Hive 也会删除这个表中数据。因此管理表不适合和 其他工具共享数据。
- 删除该外部表并不会删除掉原始数据，删除的是表的元数据。

## Hive 的元数据存储

由于 Hive 的元数据可能要面临不断地更新、修改和读取操作，所以它显然不适合使用 Hadoop 文件系统进行存储。目前 Hive 把元数据存储在 RDBMS 中，比如存储在 MySQL，Derby 中。

## 4个by的区别？

- `Sort By`：在同一个分区内排序

- `Order By`：全局排序，只有一个Reducer；

- `Distrbute By`：类似 MapReduce 中Partition，进行分区，一般结合sort by使用。

- `Cluster By`：当 Distribute by 和 Sort by 字段相同时，可以使用Cluster by方式。

  **Cluster by 除了具有 Distribute by 的功能外还兼具 Sort by 的功能。但是只能升序排序，不能指定排序规则为ASC或者DESC。**

## 介绍一下有哪些常用函数？

### 行转列函数

`CONCAT(string A/col, string B/col…)`：返回输入字符串连接后的结果

`CONCAT_WS(separator, str1, str2,…)`：第一个参数是其它参数的分隔符。分隔符的位置放在要连接的两个字符串之间

`COLLECT_SET(col)`：函数只接受基本数据类型，它的主要作用是将某字段的值进行**去重**汇总，产生array类型字段



参考资料：https://blog.csdn.net/qq_26803795/article/details/105141785