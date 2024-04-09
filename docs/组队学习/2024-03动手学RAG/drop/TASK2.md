## ChatGPT/GLM API使用

### 任务

- 任务说明：了解ChatGPT/GLM API使用方法和逻辑
- 任务要求：
  - 能使用API进行对话
  - 能使用API进行文本嵌入
  - 能使用API进行function call
- 打卡要求：使用ChatGLM API分别完成对话和嵌入。

### 两个大模型介绍

#### ChatGPT

- OpenAI开发的聊天生成预训练转换器
- 基于GPT-3.5和GPT-4架构
- 该模型通过强化学习训练，具有出色的语言生成能力
- 支持文字方式的交互，用户可以使用自然语言对话的方式与ChatGPT进行通信
- API的引入使得开发者能够将ChatGPT整合到自己的应用中，实现自动文本生成、自动问答等功能。

#### GLM

- 智谱AI推出的新一代基座大模型，性能逼近GPT-4
- GLM支持更长的上下文（128k），具备强大的多模态能力
- 推理速度更快，支持更高的并发。
- GLM的API接口为开发者提供了在自己应用中利用GLM进行语言生成的机会，为多种领域的任务提供了新的解决方案。

#### 对话 API

对话API是所有大模型的最常见的API，可以完成通用对话，也可以完成很多功能。但在进行调用时需要注意如下入参和参数返回结果。

请求参数说明

| 参数                | 类型                 | 必填 | 描述                                                         |
| :------------------ | :------------------- | :--- | :----------------------------------------------------------- |
| `messages`          | Array                | 必填 | 包含对话的消息列表。                                         |
| `model`             | String               | 必填 | 要使用的模型的ID。                                           |
| `frequency_penalty` | Number 或 null       | 可选 | 根据文本中已有令牌的频率对新令牌进行惩罚。取值范围在-2.0到2.0之间。 |
| `logit_bias`        | Map                  | 可选 | 修改指定令牌在完成中出现的可能性。接受一个将令牌映射到偏置值（-100到100）的JSON对象。 |
| `logprobs`          | Boolean 或 null      | 可选 | 是否返回输出令牌的对数概率。                                 |
| `top_logprobs`      | Integer 或 null      | 可选 | 如果 `logprobs` 设置为 `true`，则返回每个令牌位置上最有可能的令牌数，每个都带有关联的对数概率。 |
| `max_tokens`        | Integer 或 null      | 可选 | 可以在聊天完成中生成的最大 [令牌数](https://platform.openai.com/tokenizer)。 |
| `n`                 | Integer 或 null      | 可选 | 为每个输入消息生成的聊天完成选择的数量。                     |
| `presence_penalty`  | Number 或 null       | 可选 | 根据新令牌是否出现在到目前为止的文本中对其进行惩罚，增加模型谈论新主题的可能性。 |
| `seed`              | Integer 或 null      | 可选 | 如果指定，系统将尽力进行确定性采样，以使具有相同 `seed` 和参数的重复请求应返回相同的结果。 |
| `stop`              | String/Array 或 null | 可选 | API 将停止生成进一步的令牌的序列，最多可设置为 4 个。        |
| `stream`            | Boolean 或 null      | 可选 | 如果设置，将发送部分消息增量，就像在 ChatGPT 中一样。令牌将作为数据仅 [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) 发送，一旦可用，流将以 `data: [DONE]` 消息终止。参考 [Example Python code](https://cookbook.openai.com/examples/how_to_stream_completions)。 |
| `temperature`       | Number 或 null       | 可选 | 使用的采样温度，介于 0 和 2 之间。较高的值（如 0.8）会使输出更随机，而较低的值（如 0.2）会使其更集中和确定性。 |
| `top_p`             | Number 或 null       | 可选 | 与温度采样的替代方法，称为核采样，其中模型考虑具有 top_p 概率质量的令牌的结果。因此，0.1 表示仅考虑构成前 10% 概率质量的令牌。 |

- 返回结果字段

| 参数               | 类型   | 描述                                                         |
| :----------------- | :----- | :----------------------------------------------------------- |
| id                 | 字符串 | 用于唯一标识聊天完成的标识符。                               |
| choices            | 数组   | 聊天完成选择的列表。如果`n`大于1，则可以有多个选择。         |
| created            | 整数   | 聊天完成创建的Unix时间戳（以秒为单位）。                     |
| model              | 字符串 | 用于聊天完成的模型。                                         |
| system_fingerprint | 字符串 | 此指纹表示模型运行时的后端配置。可与seed请求参数一起使用，了解可能影响确定性的后端更改。 |
| usage              | 对象   | 完成请求的使用统计信息。                                     |
| finish_reason      | 字符串 | 表示聊天完成的原因。可能的值包括"stop"（API返回了完整的聊天完成而没有受到任何限制），"length"（生成超过了max_tokens或对话超过了max context length），等等。 |



### 使用ChatGLM进行对话

```

import time
import jwt
import requests
import json

# 实际KEY，过期时间
def generate_token(apikey: str, exp_seconds: int):
    try:
        id, secret = apikey.split(".")
    except Exception as e:
        raise Exception("invalid apikey", e)

    payload = {
        "api_key": id,
        "exp": int(round(time.time() * 1000)) + exp_seconds * 1000,
        "timestamp": int(round(time.time() * 1000)),
    }
    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
        headers={"alg": "HS256", "sign_type": "SIGN"},
    )
token = "f1a0b6c3d36d46d3eed74a6c7de3e9exxxxx"

url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
headers = {
  'Content-Type': 'application/json',
  'Authorization': generate_token(token, 1000)
}


messages = """你好"""
role = "user"
data = {
    "model": "glm-3-turbo",
    "messages": [{"role": role, "content": messages}]
}


response = requests.post(url, headers=headers, json=data)
print("Status Code", response.status_code)
print("JSON Response: ", response.json()['choices'][0]['message']['content'])
```

### 使用GLM进行mbedding-1

```
import requests
url = "https://open.bigmodel.cn/api/paas/v4/embeddings"

headers = {
  'Content-Type': 'application/json',
  'Authorization': generate_token(token, 1000)
}

data = {
  "model": "embedding-2",
  "input": "测试文本，今天很开心。"
}

response = requests.post(url, headers=headers, json=data)

print("Status Code", response.status_code)
print("embedding ", response.json()['data'][0]['embedding'])
```

#### 使用GLM进行embedding-2

```
from zhipuai import ZhipuAI

client = ZhipuAI(api_key=token) 
response = client.embeddings.create(
    model="embedding-2", #填写需要调用的模型名称
    input="你好",
)
def get_embedding(response):
    result = json.loads(response.json())['data'][0]['embedding']
    return result
embedding = get_embedding(response)
print(embedding)
```



### ChatGPT-Function call API

```
from zhipuai import ZhipuAI

client = ZhipuAI(api_key=token) # 请填写您自己的APIKey

response = client.chat.completions.create(
    model="glm-4", # 填写需要调用的模型名称
    messages = [
        {
            "role": "user",
            "content": "你能帮我查询2024年1月1日从北京南站到上海的火车票吗？"
        }
    ],
    tools = [
        {
            "type": "function", 
            "function": {
                "name": "query_train_info",
                "description": "根据用户提供的信息，查询对应的车次",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "departure": {
                            "type": "string",
                            "description": "出发城市或车站",
                        },
                        "destination": {
                            "type": "string",
                            "description": "目的地城市或车站",
                        },
                        "date": {
                            "type": "string",
                            "description": "要查询的车次日期",
                        },
                    },
                    "required": ["departure", "destination", "date"],
                },
            }
        }
    ],
    tool_choice="auto",
)
print(response.choices[0].message)

->CompletionMessage(content=None, role='assistant', tool_calls=[CompletionMessageToolCall(id='call_8367740471975519927', function=Function(arguments='{"date":"2024-01-01","departure":"北京南站","destination":"上海"}', name='query_train_info'), type='function')])
```







使用ChatGLM进行embedding

![image-20240130222715164](img/TASK2//image-20240130222715164.png)