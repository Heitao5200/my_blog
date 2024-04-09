## 读取汽车问答数据

### 任务



- 任务说明：理解数据集背景和读取数据集
- 任务要求：
  - 下载数据集文件
  - 使用工具解析PDF内容
- 打卡要求：使用代码解析PDF文档内容，并能解析PDF内容

本次RAG学习使用了[天池2023全球智能汽车AI挑战赛——赛道一：AI大模型检索问答](https://tianchi.aliyun.com/competition/entrance/532154)的数据集，bing进行了重新标注。比赛要求参赛选手以大模型为中心制作一个问答系统，回答用户的汽车相关问题。参赛选手需要根据问题，在文档中定位相关信息的位置，并根据文档内容通过大模型生成相应的答案。本次比赛涉及的问题主要围绕汽车使用、维修、保养等方面。

在线评测地址：https://competition.coggle.club/

![img](img/TASK3/O1CN01Y8GZyc275GPXkHBxX_!!6000000007745-0-tps-311-386.jpg)

```
问题1：怎么打开危险警告灯？
答案1：危险警告灯开关在方向盘下方，按下开关即可打开危险警告灯。

问题2：车辆如何保养？
答案2：为了保持车辆处于最佳状态，建议您定期关注车辆状态，包括定期保养、洗车、内部清洁、外部清洁、轮胎的保养、低压蓄电池的保养等。

问题3：靠背太热怎么办？
答案3：您好，如果您的座椅靠背太热，可以尝试关闭座椅加热功能。在多媒体显示屏上依次点击空调开启按键→座椅→加热，在该界面下可以关闭座椅加热。
```

数据集下载地址：

- 数据（百度云盘）链接: https://pan.baidu.com/s/19_oqY4bC_lJa_7Mc6lxU7w?pwd=v4bi 提取码: v4bi
- 数据（谷歌云盘）链接：[https://drive.google.com/drive/folders/1rD52-7W5ypzLk9ZXOrMBYx8F8xHaAzlW?usp=sharing](https://pan.baidu.com/s/19_oqY4bC_lJa_7Mc6lxU7w?pwd=v4bi)

> 读取问答数据集

```
import json
import pdfplumber

questions = json.load(open("questions.json"))
print(questions[0])

pdf = pdfplumber.open("初赛训练数据集.pdf")
len(pdf.pages) # 页数
pdf.pages[0].extract_text() # 读取第一页内容
```

> 读取所有页内容

```
pdf_content = []
for page_idx in range(len(pdf.pages)):
    pdf_content.append({
        'page': 'page_' + str(page_idx + 1),
        'content': pdf.pages[page_idx].extract_text()
    })
```

