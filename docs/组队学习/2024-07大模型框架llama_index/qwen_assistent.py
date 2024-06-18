import os.path
import yaml
import openai
import warnings
from urllib3.exceptions import InsecureRequestWarning

warnings.simplefilter("ignore", category=InsecureRequestWarning)
# from  config_path import con_path

def load_prompts(file_path: str):
    with open(file_path, encoding="utf-8") as f:
        prompts = yaml.safe_load(f)
    return prompts


# cfg = load_prompts(os.path.join(con_path,"parse.yaml"))


def api_openai(
    user_message: str,
    model,
    url,
    temperature=0.01,
    max_tokens=500,
    stream=False,
    print_stream=True,
) -> dict:
    """test OpenAI API compatible LLM API, currently published by FastChat in GPU server"""
    openai.api_key = "EMPTY"
    openai.api_base = url
    model = model

    completion = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": user_message}],
        temperature=temperature,
        max_tokens=max_tokens,
        stream=stream,
    )
    if stream == False:
        return completion.choices[0].message.content
    elif stream == True:
        out = ""
        for i in completion:
            try:
                out += i["choices"][0]["delta"]["content"]
                if print_stream:
                    print(out)
            except:
                continue
        return out


if __name__ == "__main__":
    # 告诉大模型需要做什么
    instruction = """
    你是一个20年经验的保险行业的数据分析师，下面是保险的给付相关信息，请帮我使用Python脚本并结合正则表达式从中提取关键信息.（冒号后面是描述，供你参考）:
    """
    # 你需要的格式模板
    message =  """
    {
    '疾病种类':,
    '是否分组':分组/不分组,
    '是否等待期':
    }
    """

    content = """
    ['保障50种疾病，不分组，给付1次\n给付内容：\n等待期前：100%*累计保费\n等待期后：100%*保额',
       '保障30种疾病，分3组，给付3次，疾病间隔期180天\n给付内容：\n20%*保额']
    """
    
    

    print(message)
    prompt = instruction + "\n\n" + message + "\n\n" + content
    model = "qwen72chat"
    url = "http://220.250.27.14:8001/v1"
    response = api_openai(
        user_message=prompt,
        model=model,
        url=url,
        temperature=0.01,
        max_tokens=500,
        stream=False,
        print_stream=True,
    )

    print(response)
 