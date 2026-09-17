#!/usr/bin/env python3
"""Validate real published question banks against locked local course sources."""
import argparse, collections, hashlib, json, os, re, sys
from pathlib import Path
APP=Path(__file__).resolve().parents[1]
DEFAULT_SOURCE=Path(os.environ.get('AGENT_QUIZ_REPO',str(APP.parents[1])))/'docs/组队学习/2026-09hello-agents进阶/hello-agents'

def norm(s):
    # Formatting characters and whitespace do not change the quoted passage.
    return re.sub(r'[\s*`]+','',s)

def source_sections(text):
    headers=[]; offset=0; fence=None
    for line in text.splitlines(keepends=True):
        marker=re.match(r'^\s*(`{3,}|~{3,})',line)
        if marker:
            token=marker[1]
            if fence is None: fence=token
            elif token[0]==fence[0] and len(token)>=len(fence): fence=None
        header=re.match(r'^(#{1,6})\s+(\d+(?:\.\d+)+)\b',line)
        if header and fence is None: headers.append((header[2],len(header[1]),offset))
        offset+=len(line)
    sections={}
    for i,(number,level,start) in enumerate(headers):
        end=next((h[2] for h in headers[i+1:] if h[1]<=level),len(text))
        sections.setdefault(number,[]).append(norm(text[start:end]))
    return sections

def check(chapter,source_root):
    errors=[]
    def need(ok,msg):
        if not ok:errors.append(msg)
    n=chapter['id']; qs=chapter['questions']; bp=chapter['blueprint']
    src=source_root/chapter['source']['path']; text=src.read_text()
    need(hashlib.sha256(src.read_bytes()).hexdigest()==chapter['source']['sha256'],'Source SHA256 mismatch')
    need(len(qs)==20,'Expected20questions')
    need(collections.Counter(q['type'] for q in qs)=={'single':12,'multiple':6,'reflection':2},'Type counts')
    need(collections.Counter(q['dimension'] for q in qs if q['type']!='reflection')=={'concept':4,'mechanism':4,'comparison':4,'application':3,'tradeoff':3},'Dimension counts')
    need(collections.Counter(q['level'] for q in qs if q['type']!='reflection')=={'understand':6,'mechanism':6,'application':6},'Level counts')
    need(collections.Counter(q['difficulty'] for q in qs)=={'easy':6,'medium':10,'hard':4},'Difficulty counts')
    need(4<=len(bp['objectives'])<=8,'Objective count')
    slots={s['id']:s for s in bp['slots']}; objective_ids={o['id'] for o in bp['objectives']}
    need(len({q['id'] for q in qs})==len(qs),'Duplicate question IDs')
    need(len({norm(q['stem']) for q in qs})==len(qs),'Duplicate question stems')
    need(objective_ids<=set(q['objectiveId'] for q in qs if q['type']!='reflection'),'Objective coverage missing')
    sections=source_sections(text)
    sectionnums=set(sections)
    normalized_source=norm(text)
    for q in qs:
        prefix=q['id']+': '
        need(q['id'] in slots,prefix+'Not in blueprint')
        for key in ['type','objectiveId','dimension','level','difficulty']:
            need(q[key]==slots.get(q['id'],{}).get(key),prefix+key+' differs from blueprint')
        options=q['options']; aids=q['answerIds']
        need(bool(q['stem'].strip()) and bool(q['explanation'].strip()),prefix+'Empty stem/explanation')
        need(bool(q['design']['purpose']),prefix+'Missing design purpose')
        if q['type']=='reflection':
            need(not options and not aids,prefix+'Reflection has options/answers')
            need(bool(q.get('referenceAnswer')) and 3<=len(q.get('rubric',[]))<=5,prefix+'Reflection rubric invalid')
        else:
            need(len(options)==4 and {o['id'] for o in options}=={'a','b','c','d'},prefix+'Option count/id invalid')
            need(len(set(norm(o['text']) for o in options))==4,prefix+'Duplicate options')
            need(set(aids)<={'a','b','c','d'} and len(set(aids))==len(aids),prefix+'Invalid correct IDs')
            need(len(aids)==1 if q['type']=='single' else 2<=len(aids)<=3,prefix+'Correct count invalid')
            need(set(q['optionExplanations'])=={'a','b','c','d'} and all(q['optionExplanations'].values()),prefix+'Missing option explanations')
        need(bool(q['evidence']),prefix+'Missing evidence')
        for i,ev in enumerate(q['evidence']):
            quote=norm(ev['quote'])
            need(len(quote)>=12 and quote in normalized_source,prefix+f'Evidence {i} not verbatim in source: '+ev['quote'][:90])
            m=re.match(r'(\d+(?:\.\d+)+)',ev['section'])
            need(bool(m) and m[1] in sectionnums,prefix+f'Unknown section: '+ev['section'])
            if m and m[1] in sections:
                need(any(quote in part for part in sections[m[1]]),prefix+f'Evidence {i} outside named section: '+ev['section'])
            need(ev['url']==chapter['source']['url'],prefix+'Evidence URL differs from pinned source')
    return errors

def main():
    p=argparse.ArgumentParser();p.add_argument('--source-root',type=Path,default=DEFAULT_SOURCE);p.add_argument('--chapters',default='');p.add_argument('--publish',action='store_true',help='Require all 16 reviewed chapters and a matching ready manifest');a=p.parse_args()
    files=[APP/f'public/data/chapter-{n}.json' for n in a.chapters.split(',')] if a.chapters else sorted((APP/'public/data').glob('chapter-*.json'))
    total=0;result=[]
    for file in files:
        d=json.loads(file.read_text());errors=check(d,a.source_root);total+=len(errors)
        result.append({'chapter':d['id'],'questions':len(d['questions']),'errors':errors})
    if a.publish:
        manifest=json.loads((APP/'public/data/manifest.json').read_text())
        ids={entry['id'] for entry in manifest['chapters']}
        if ids!=set(range(1,17)) or len(manifest['chapters'])!=16:
            result.append({'errors':['Publish requires exactly 16 unique manifest chapters']});total+=1
        for entry in manifest['chapters']:
            d=json.loads((APP/'public/data'/entry['file']).read_text())
            if not (entry['status']=='ready' and d['review']['status']=='reviewed' and d['review']['checkedAt'] and entry['id']==d['id'] and entry['version']==d['version'] and entry['questionCount']==len(d['questions'])==20):
                result.append({'chapter':entry['id'],'errors':['Publish metadata incomplete or mismatched']});total+=1
        if a.chapters:
            result.append({'errors':['--publish must validate all chapters, omit --chapters']});total+=1
    print(json.dumps({'validated_chapters':len(files),'errors':total,'results':result},ensure_ascii=False,indent=2))
    sys.exit(bool(total) or not files)
if __name__=='__main__':main()
