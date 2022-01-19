## MySQL面试题

## **逻辑查询处理阶段简介**

1. **FROM：**对FROM子句中的前两个表执行笛卡尔积（Cartesian product)(交叉联接），生成虚拟表VT1
2. **ON：**对VT1应用ON筛选器。只有那些使<join_condition>为真的行才被插入VT2。
3. **OUTER(JOIN)：**如 果指定了OUTER JOIN（相对于CROSS JOIN 或(INNER JOIN),保留表（preserved table：左外部联接把左表标记为保留表，右外部联接把右表标记为保留表，完全外部联接把两个表都标记为保留表）中未找到匹配的行将作为外部行添加到 VT2,生成VT3.如果FROM子句包含两个以上的表，则对上一个联接生成的结果表和下一个表重复执行步骤1到步骤3，直到处理完所有的表为止。
4. **WHERE：**对VT3应用WHERE筛选器。只有使<where_condition>为true的行才被插入VT4.
5. **GROUP BY：**按GROUP BY子句中的列列表对VT4中的行分组，生成VT5.
6. **CUBE|ROLLUP：**把超组(Suppergroups)插入VT5,生成VT6.
7. **HAVING：**对VT6应用HAVING筛选器。只有使<having_condition>为true的组才会被插入VT7.
8. **SELECT：**处理SELECT列表，产生VT8.
9. **DISTINCT：**将重复的行从VT8中移除，产生VT9.
10. **ORDER BY：**将VT9中的行按ORDER BY 子句中的列列表排序，生成游标（VC10).
11. **TOP：**从VC10的开始处选择指定数量或比例的行，生成表VT11,并返回调用者。



## MySQL 十大常用字符串函数

1. `CONCAT(str1,str2,…))`函数用于返回多个字符串连接之后的字符串：**CONCAT()**
2. `LOWER(str)和LCASE(str)`函数用于将字符串转换为小写形式
3. `UPPER(str)和UCASE(str)`函数用于将字符串转换为大写形式
4. `LENGTH(str)`和`OCTET_LENGTH(str)`函数用于返回字符串的字节长度
5. `SUBSTRING(str,pos)、SUBSTRING(str FROM pos)、SUBSTRING(str,pos,len)`以及`SUBSTRING(str FROM pos FOR len)`函数都可以用于返回从指定位置 pos 开始的子串，len 表示返回子串的长度；pos 为 0 表示返回空字符串
6. `TRIM([remstr FROM] str)`函数用于返回删除字符串 str 两侧所有 remstr 字符串之后的子串，remstr 默认为空格
7. `LPAD(str,len,padstr)`函数表示字符串 str 的左侧使用 padstr 进行填充，直到长度为 len；RPAD(str,len,padstr)函数表示在字符串 str 的右侧使用 padstr 进行填充，直到长度为 len
8. `INSTR(str,substr)`函数用于返回子串 substr 在字符串 str 中第一次出现的索引位置，没有找到子串时返回 0
9. `REPLACE(str,from_str,to_str)`函数用于将字符串 str 中所有的 from_str 替换为 to_str，返回替换后的字符串

参考资料：https://zhuanlan.zhihu.com/p/59838091

## 窗口函数使用

```
代码
SELECT
  *,
  RANK() over(ORDER BY 金额 DESC) as RANK排名,
  dense_rank() over(ORDER BY 金额 DESC) as dense_rank排名,
  row_number() over(ORDER BY 金额 DESC) as row_number排名
FROM
  测试表; 
```
