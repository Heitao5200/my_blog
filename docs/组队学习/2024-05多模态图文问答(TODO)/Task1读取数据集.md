## **任务**

- 任务说明：读取比赛数据数据，了解问答数据集

- 任务要求：

- - 了解数据集背景

    - 希望参赛者能够开发出**能够理解和处理实际场景中图像与文本信息的算法模型**

  - 读取比赛数据集

    - 训练集包含了原始的图片和文本描述

  - 阅读问答技术背景

  	- 模型可以学习如何从图像和文本中提取特征，并建立起图像内容与文本描述之间的关联

## 数据说明

多模态问答（Multimodal Question Answering, MQA）是一种人工智能任务

- 结合了来自不同模态的信息，如文本、图像、音频和视频，以提供更准确和全面的答案。
- 多模态问答系统通常具有交互性，允许用户通过不同的方式提问
  - 例如使用自然语言、点击图片中的具体区域或提供音频输入
- 多模态数据集是指包含多种不同类型数据的数据集合，


- 测试集的样例格式如下

  ```
  {
      "question": "请对给定的图片进行描述。",
      "related_image": "vwsscflkvakdictzacfx.jpg",
      "answer": ""
  }
  ```

  - 在提问中问题存在以下几种类型：
    - 通过提问(`question`)对提问图片(`related_image`)进行提问和描述
    - 通过提问(`question`)检索到最相关的图片(`related_image`)

### 多模态问答的挑战：

- **数据融合技术**
  - 如何有效地融合来自不同模态的数据是一个主要挑战。

- **特征提取**
  - 从多模态数据中提取相关特征需要特定的技术和方法。

- **语义理解**
  - 系统需要具备强大的语义理解能力，以便从文本、图像和其他模态中提取深层次的意义，并将其与问题相关联。

## 读取数据

```

import base64
from io import BytesIO
from PIL import Image
import os

jpg_path = "/Users/heitao/DataSet/doing/image/"
img_datas = {}
for root,_,files in os.walk(jpg_path):
    for file in files:
        if file.endswith(".jpg"):
            # img = cv2.imread(os.path.join(root,file))
            with open(os.path.join(root,file),"rb") as f:
                # b64encode是编码，b64decode是解码
                base64_data = base64.b64encode(f.read())
            img_data = BytesIO(base64.b64decode(base64_data))
            img_datas[file] = img_data
            # img = Image.open(img_data)
            # img.show()
            # break
def convert_to_jpg(img_data):
    img = Image.open(img_data)
    img.show()
convert_to_jpg(img_datas['fmwnwvuaxjsdoorrcrau.jpg'])
```

