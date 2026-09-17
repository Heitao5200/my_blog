#!/usr/bin/env python3
"""NotebookLM source-pinned generation; resumable per-chapter state, no credentials logged."""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, time
from pathlib import Path
from urllib.parse import quote

APP=Path(__file__).resolve().parents[1]
ORIGINAL=Path(os.environ.get('AGENT_QUIZ_REPO',str(APP.parents[1])))
SOURCE_ROOT=ORIGINAL/'docs/组队学习/2026-09hello-agents进阶/hello-agents/docs'
CLI=Path(os.environ.get('NOTEBOOKLM_BIN',str(ORIGINAL/'.venv/bin/notebooklm') if (ORIGINAL/'.venv/bin/notebooklm').exists() else (shutil.which('notebooklm') or 'notebooklm')))
STATE=APP/'.generation'
REV='4f7682ceafe573d07cd8a7d0b89908500e83227d'
NOTEBOOK=''

def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def call(*args):
    command=[str(CLI),*map(str,args)]
    p=subprocess.run(command,capture_output=True,text=True,timeout=1300)
    if p.returncode:
        raise RuntimeError(f'NotebookLM {args[0]} failed ({p.returncode}): {p.stdout[:700]} {p.stderr[:700]}')
    try:return json.loads(p.stdout)
    except json.JSONDecodeError:raise RuntimeError(f'Unexpected response to {args[0]}: {p.stdout[:300]}')

def blueprint(n):
    b=json.loads((APP/f'blueprints/chapter-{n}.json').read_text())
    from collections import Counter
    slots=b['slots']; assert len(slots)==20
    assert Counter(s['type'] for s in slots)=={'single':12,'multiple':6,'reflection':2}
    assert Counter(s['dimension'] for s in slots if s['type']!='reflection')=={'concept':4,'mechanism':4,'comparison':4,'application':3,'tradeoff':3}
    assert Counter(s['level'] for s in slots if s['type']!='reflection')=={'understand':6,'mechanism':6,'application':6}
    assert Counter(s['difficulty'] for s in slots)=={'easy':6,'medium':10,'hard':4}
    assert len({s['id'] for s in slots})==20
    assert all(s['objectiveId'] in {o['id'] for o in b['objectives']} for s in slots)
    return b

def prompt(b):
    return '''你是教材测评编辑。仅使用当前指定的Hello-Agents中文章节，严格依据下方已经制定的出题蓝图生成20道测试题。全部简体中文，代码名称保留。
必须逐个按slots的id和顺序出题，不改动题型、学习目标、考查层次。先12单选、再6多选、最后2思考。每道客观题4个选项，ID固定a,b,c,d；单选恰好1个正确，多选2-3个正确。思考题不要求写代码，给出多角度参考思路及3-5个可勾选自评要点。思考题 options/answerIds 都为空数组。
题目要有逻辑：围绕purpose与对应知识目标，考察理解、机制、辨析和场景，不要用明显荒谬的干扰项。每个错误选项针对一种可解释的混淆，使用“可能误以为”，不要声称已有用户犯错。不编造当前产品价格或新版本行为，不超出教材；背景情境可虚构但答案判断必须由教材支持。涉及提示词约束、AST安全、反思、工具注册和执行时，不把设计意图写成绝对保证。
每道题必须有1-2段 evidence：section为真实章节小节编号和标题；quote是直接从指定原文复制的连续短摘录（约50-180字），禁止改写或拼接，不添加省略号或引用序号；如果单一证据不足请给两段。explanation必须解释原文上下文与答案的联系，不只是复述选项。
请只输出一个合法JSON对象，不输出Markdown表格或围栏外说明，结构：
{"questions":[{"id":"ch07-q01","stem":"题干","options":[{"id":"a","text":"选项"},{"id":"b","text":"选项"},{"id":"c","text":"选项"},{"id":"d","text":"选项"}],"answerIds":["b"],"explanation":"结合课件的解释","optionExplanations":{"a":"为什么错","b":"为什么对","c":"为什么错","d":"为什么错"},"evidence":[{"section":"7.1.2 标题","quote":"原文连续摘录"}],"design":{"purpose":"本题的具体考查目的","misconception":"本题试图区分的可能混淆"},"referenceAnswer":"仅思考题需要的参考思路","rubric":["仅思考题需要的要点"]}]}
不要遗漏20道题。每道stem/option避免措辞透露答案，思考题不要强制唯一结论。
出题蓝图：
'''+json.dumps(b,ensure_ascii=False)

def generate(n,notebook):
    bp=blueprint(n); path=STATE/f'chapter-{n}/state.json'
    st=json.loads(path.read_text()) if path.exists() else {'chapter':n,'notebookId':notebook}
    if not notebook: raise ValueError('generate requires --notebook with a full notebook ID')
    if st.get('notebookId')!=notebook: raise ValueError('Existing generation belongs to a different notebook')
    source=next((SOURCE_ROOT/f'chapter{n}').glob('第*.md'))
    text=source.read_text(); digest=hashlib.sha256(source.read_bytes()).hexdigest()
    if st.get('sha256') and st['sha256']!=digest:raise RuntimeError('Source changed; start a new generation version.')
    st.update(sha256=digest,title=source.stem,path=f'docs/chapter{n}/{source.name}',version='2026-09-17.1')
    write(path,st)
    if not st.get('sourceId'):
        out=call('source','add',str(source),'--type','file','-n',notebook,'--json')
        st['sourceId']=out['source']['id'];write(path,st)
    wait=call('source','wait',st['sourceId'],'-n',notebook,'--timeout','600','--json')
    assert wait['status']=='ready'
    if not st.get('artifactId'):
        promptpath=path.parent/'prompt.txt'; promptpath.write_text(prompt(bp))
        out=call('generate','report','--format','custom','--prompt-file',promptpath,'--language','zh_Hans','-n',notebook,'-s',st['sourceId'],'--json')
        st['artifactId']=out['task_id'];st['generationStatus']=out['status'];write(path,st)
    print(f'CHAPTER {n}: source ready; artifact {st["artifactId"]}',flush=True)

def extract(text):
    # Known generator syntax defect: an option sometimes omits , "text".
    # This fixes structure only; raw report remains unchanged for provenance.
    text=re.sub(r'(\{\s*"id"\s*:\s*"[abcd]")\s*:\s*', r'\1, "text": ', text)
    text=text.replace('"id": "id":', '"id":')
    decoder=json.JSONDecoder()
    for m in re.finditer(r'\{',text):
        try:
            data,_=decoder.raw_decode(text[m.start():])
            if isinstance(data,dict) and isinstance(data.get('questions'),list):return data
        except json.JSONDecodeError:pass
    raise ValueError('Report does not contain a complete questions JSON object')

def collect(n):
    target=APP/f'public/data/chapter-{n}.json'
    if target.exists() and json.loads(target.read_text()).get('review',{}).get('status')=='reviewed':
        raise ValueError('Refusing to overwrite a reviewed bank. Preserve it and begin a new version explicitly.')
    path=STATE/f'chapter-{n}/state.json';st=json.loads(path.read_text())
    out=call('artifact','wait',st['artifactId'],'-n',st['notebookId'],'--timeout','1200','--interval','10','--json')
    assert out['status']=='completed';st['generationStatus']='completed';write(path,st)
    raw=path.parent/'report.md'
    if not raw.exists():call('download','report',raw,'-n',st['notebookId'],'-a',st['artifactId'],'--json')
    data=extract(raw.read_text());write(path.parent/'raw-questions.json',data)
    bp=blueprint(n);qs=data['questions'];assert len(qs)==20,f'Expected20 got{len(qs)}'
    byid={q['id']:q for q in qs};assert len(byid)==20
    normalized=[]
    for slot in bp['slots']:
        q=byid[slot['id']]
        if 'stem' not in q and isinstance(q.get('question'),str): q['stem']=q.pop('question')
        q.update({k:slot[k] for k in ['type','objectiveId','dimension','level','difficulty']})
        q.setdefault('evidence',[])
        if isinstance(q['evidence'],dict): q['evidence']=[q['evidence']]
        if not isinstance(q['evidence'],list): raise ValueError('Invalid evidence structure: '+q['id'])
        q.setdefault('optionExplanations',{})
        q.setdefault('options',[])
        if isinstance(q['options'],dict): q['options']=[{'id':k,'text':v} for k,v in q['options'].items()]
        if 'answerIds' not in q:
            a=q.get('answer',[])
            q['answerIds']=[a] if isinstance(a,str) else a
        if isinstance(q.get('design'),str):q['design']={'purpose':q['design'],'misconception':''}
        q.setdefault('design',{'purpose':slot['purpose'],'misconception':''})
        q['design'].setdefault('misconception','')
        if q['type']=='reflection':
            q.setdefault('explanation',q.get('referenceAnswer',''))
            q['rubric']=[r.get('criterion','') if isinstance(r,dict) else r for r in q.get('rubric',[])]
        for ev in q['evidence']:
            ev['url']='https://github.com/datawhalechina/hello-agents/blob/'+REV+'/'+quote(st['path'])
        normalized.append(q)
    chapter={'id':n,'title':st['title'],'version':st['version'],'source':{'title':st['title'],'path':st['path'],'url':'https://github.com/datawhalechina/hello-agents/blob/'+REV+'/'+quote(st['path']),'sha256':st['sha256'],'notebookId':st['notebookId'],'sourceId':st['sourceId'],'artifactId':st['artifactId']},'blueprint':bp,'review':{'status':'pending','checkedAt':'','notes':['NotebookLM已生成；尚待来源与语义核验。']},'questions':normalized}
    write(target,chapter)
    print(f'CHAPTER {n}: downloaded and normalized, awaiting review',flush=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('phase',choices=['generate','collect']);p.add_argument('--chapters',default=','.join(map(str,range(1,17))));p.add_argument('--notebook');a=p.parse_args()
    for n in map(int,a.chapters.split(',')):
        try:generate(n,a.notebook) if a.phase=='generate' else collect(n)
        except Exception as exc:
            print(f'CHAPTER {n}: ERROR {exc}',flush=True)
            # Preserve evidence; do not fabricate a successful run or endlessly retry quotas.
            raise
if __name__=='__main__':main()
