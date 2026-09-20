(() => {
  'use strict';
  const questions = window.QUIZ_QUESTIONS;
  const key = 'hello-agents-chapter7-quiz-v1';
  const root = document.getElementById('workspace');
  const saveLabel = document.getElementById('save-state');
  const dialog = document.getElementById('confirm-dialog');
  const chapters = {'7.1':'框架设计','7.2':'LLM 接口','7.3':'核心组件','7.4':'Agent 范式','7.5':'工具系统'};
  const confidenceNames = {sure:'确定', unsure:'犹豫', guess:'猜的'};
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const letter = n => String.fromCharCode(65 + n);
  const byId = id => questions.find(q => q.id === id);
  let filter = 'all';
  let confirmAction = null;
  function shuffled() {
    const values = [0,1,2,3];
    for (let i = 3; i > 0; i--) {const j = Math.floor(Math.random() * (i+1)); [values[i],values[j]]=[values[j],values[i]];}
    return values;
  }
  function fresh(ids = questions.map(q => q.id)) {
    return {version:1,ids,index:0,answers:{},confidence:{},orders:Object.fromEntries(ids.map(id => [id,shuffled()])),submitted:false};
  }
  function valid(s) {
    return s && s.version === 1 && Array.isArray(s.ids) && s.ids.length > 0 &&
      new Set(s.ids).size === s.ids.length && s.ids.every(id => byId(id)) &&
      Number.isInteger(s.index) && s.index >= 0 && s.index < s.ids.length &&
      typeof s.submitted === 'boolean' && s.answers && s.confidence && s.orders &&
      s.ids.every(id => Array.isArray(s.orders[id]) && s.orders[id].length === 4 && [...s.orders[id]].sort().join() === '0,1,2,3') &&
      Object.entries(s.answers).every(([id,v]) => s.ids.includes(Number(id)) && Number.isInteger(v) && v >= 0 && v < 4) &&
      Object.entries(s.confidence).every(([id,v]) => s.ids.includes(Number(id)) && Object.hasOwn(confidenceNames,v));
  }
  let state = fresh();
  try {const stored = JSON.parse(localStorage.getItem(key)); if (valid(stored)) state = stored;} catch {saveLabel.textContent = '当前浏览器无法保存进度，请勿关闭页面';}
  function persist() {
    try {localStorage.setItem(key,JSON.stringify(state));saveLabel.textContent = '进度已自动保存 · 仅本浏览器';}
    catch {saveLabel.textContent = '当前浏览器无法保存进度，请勿关闭页面';}
  }
  if (location.protocol !== 'file:') {
    const home = new URL('../../../../index.html',location.href);
    home.hash = '/组队学习/2026-09hello-agents进阶/README';
    document.getElementById('home-link').href = home.href;
  }
  const answered = () => state.ids.filter(id => state.answers[id] !== undefined).length;
  const correct = id => state.answers[id] === byId(id).answer;
  const wrongIds = () => state.ids.filter(id => !correct(id));
  const uncertainIds = () => state.ids.filter(id => !correct(id) || state.confidence[id] !== 'sure');
  function ask(title,text,accept,action) {
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-text').textContent = text;
    document.getElementById('accept-dialog').textContent = accept;
    document.getElementById('cancel-dialog').textContent = state.submitted ? '返回结果' : '继续答题';
    confirmAction = action;
    dialog.showModal();
  }
  document.getElementById('cancel-dialog').onclick = () => dialog.close();
  document.getElementById('accept-dialog').onclick = () => {dialog.close();const action = confirmAction;confirmAction=null;action?.();};
  function submit() {
    const remaining = state.ids.length - answered();
    ask('准备交卷了吗？',remaining ? `还有 ${remaining} 道题未作答，交卷后将按未答题计入错题。你也可以返回继续完成。` : '交卷后将显示得分、各章节表现和答案解析。', '确认交卷', () => {state.submitted=true;persist();render();root.scrollIntoView({block:'start'});});
  }
  function start(ids) {state=fresh(ids);filter='all';persist();render();root.scrollIntoView({block:'start'});}
  function go(index) {state.index=Math.max(0,Math.min(index,state.ids.length-1));persist();render();document.getElementById('question-title').focus({preventScroll:true});}
  function render() {state.submitted ? renderResult() : renderQuestion();}
  function renderQuestion() {
    const id=state.ids[state.index],q=byId(id),order=state.orders[id];
    root.innerHTML = `<div class="layout"><aside class="sidebar" aria-label="答题进度"><div class="small-label">${state.ids.length === 20 ? '本章自测' : '专项复测'} / PROGRESS</div><div class="progress-numbers"><strong>${String(answered()).padStart(2,'0')}</strong> / ${state.ids.length} 已完成</div><div class="progress" role="progressbar" aria-label="答题进度" aria-valuenow="${answered()}" aria-valuemin="0" aria-valuemax="${state.ids.length}"><i style="width:${answered()/state.ids.length*100}%"></i></div><nav class="question-grid" aria-label="选择题目">${state.ids.map((qid,i) => `<button data-go="${i}" class="${state.answers[qid] !== undefined ? 'answered' : ''} ${i === state.index ? 'current' : ''}" ${i===state.index?'aria-current="step"':''} aria-label="第 ${qid} 题，${state.answers[qid] !== undefined?'已作答':'未作答'}">${String(qid).padStart(2,'0')}</button>`).join('')}</nav><p class="legend">浅绿：已作答　描边：当前题目<br>点击题号，可随时回看和修改。</p><button class="primary full" data-action="submit">交卷并查看结果 ↗</button><button class="text-button" data-action="restart">重新开始</button><div class="sidebar-note"><strong>答对，不一定代表理解。</strong><br>记下你有多确定，复盘时关注猜对的题，也关注确信却答错的题。</div></aside><section class="question-card" aria-label="当前题目"><div class="question-top"><span>QUESTION ${String(state.index+1).padStart(2,'0')} / ${state.ids.length}</span><span class="tag">${escape(chapters[q.section.slice(0,3)])} · 单选</span></div><h2 id="question-title" tabindex="-1">${escape(q.question)}</h2><fieldset class="options" aria-labelledby="question-title">${order.map((original,i) => `<label class="option"><input type="radio" name="answer" value="${original}" ${state.answers[id]===original?'checked':''}><span class="letter">${letter(i)}</span><span>${escape(q.options[original])}</span></label>`).join('')}</fieldset><div class="confidence" role="group" aria-label="回答把握"><span>这道题，我觉得</span>${Object.entries(confidenceNames).map(([value,name]) => `<button data-confidence="${value}" aria-pressed="${state.confidence[id]===value}">${name}</button>`).join('')}<span>可选</span></div><div class="card-bottom"><span class="key-hint">按 A–D 选择答案</span><div class="actions"><button class="secondary" data-action="prev" ${state.index===0?'disabled':''}>← 上一题</button><button class="primary" data-action="next">${state.index===state.ids.length-1?'完成并交卷 ↗':'下一题 →'}</button></div></div></section></div>`;
    root.querySelectorAll('[name=answer]').forEach(input => input.onchange = () => {state.answers[id]=Number(input.value);persist();renderQuestion();root.querySelector(`[name=answer][value="${input.value}"]`).focus({preventScroll:true});});
    root.querySelectorAll('[data-confidence]').forEach(button => button.onclick = () => {state.confidence[id]=button.dataset.confidence;persist();renderQuestion();root.querySelector(`[data-confidence="${button.dataset.confidence}"]`).focus({preventScroll:true});});
    root.querySelectorAll('[data-go]').forEach(button => button.onclick = () => go(Number(button.dataset.go)));
    root.querySelector('[data-action=submit]').onclick = submit;
    root.querySelector('[data-action=restart]').onclick = () => ask('重新开始本章测试？','当前答题进度将清空，选项顺序会重新排列。','重新开始',() => start());
    root.querySelector('[data-action=prev]').onclick = () => go(state.index-1);
    root.querySelector('[data-action=next]').onclick = () => state.index===state.ids.length-1 ? submit() : go(state.index+1);
  }
  function renderResult() {
    const wrong=wrongIds(),uncertain=uncertainIds(),count=state.ids.length-wrong.length;
    const overconfident=wrong.filter(id => state.confidence[id]==='sure').length;
    root.innerHTML=`<section aria-label="测试结果"><div class="result-hero"><div class="score">${Math.round(count/state.ids.length*100)}<small> / 100</small></div><div><p>${state.ids.length===20?'本章自测':'专项复测'} · 已完成</p><h2>${wrong.length?'把薄弱处，变成下一步。':'答得不错，再试着讲清原理。'}</h2><p>答对 ${count} / ${state.ids.length} 题 · 未答 ${state.ids.length-answered()} 题 · 确信但答错 ${overconfident} 题<br>分数反映本次选择题表现，代码实践仍需单独验证。</p></div></div><div class="areas">${Object.entries(chapters).map(([section,title]) => {const ids=state.ids.filter(id => byId(id).section.startsWith(section));return `<div class="area">${section} · ${title}<strong>${ids.length?ids.filter(correct).length+' / '+ids.length:'未涉及'}</strong></div>`;}).join('')}</div><div class="result-tools"><button class="primary" data-action="retry-wrong" ${wrong.length?'':'disabled'}>重做错题（${wrong.length}）</button><button class="secondary" data-action="retry-uncertain" ${uncertain.length?'':'disabled'}>巩固不确定题（${uncertain.length}）</button><button class="secondary" data-action="export">导出本次复盘 ↓</button><button class="text-button" data-action="restart">重新测试全部</button></div><p class="small-label">巩固范围：错题、未答题，以及未标记“确定”的题目。建议先导出本次记录，再开始复测。</p><div class="filters" role="group" aria-label="筛选解析">${[['all','全部解析'],['wrong','只看错题'],['uncertain','待巩固']].map(([value,label])=>`<button data-filter="${value}" aria-pressed="${filter===value}">${label}</button>`).join('')}</div><div id="reviews"></div></section>`;
    root.querySelector('[data-action=retry-wrong]').onclick=()=>start(wrong);
    root.querySelector('[data-action=retry-uncertain]').onclick=()=>start(uncertain);
    root.querySelector('[data-action=restart]').onclick=()=>start();
    root.querySelector('[data-action=export]').onclick=exportReview;
    root.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;renderResult();root.querySelector(`[data-filter="${filter}"]`).focus({preventScroll:true});});
    const ids=filter==='wrong'?wrong:filter==='uncertain'?uncertain:state.ids;
    document.getElementById('reviews').innerHTML=ids.length?ids.map(id=>{
      const q=byId(id),a=state.answers[id],order=state.orders[id];
      return `<article class="review"><div class="review-top"><span class="badge ${correct(id)?'':'wrong'}">${correct(id)?'答对':a===undefined?'未作答':'答错'}</span><span>原题 ${String(id).padStart(2,'0')} · § ${escape(q.section)}</span><span>把握：${confidenceNames[state.confidence[id]]||'未标记'}</span></div><h3>${escape(q.question)}</h3><div class="review-answer">你的答案：${a===undefined?'未作答':letter(order.indexOf(a))+'. '+escape(q.options[a])}<br>正确答案：${letter(order.indexOf(q.answer))}. ${escape(q.options[q.answer])}</div><p class="review-answer">${escape(q.explanations[q.answer])}</p><details><summary>展开全部选项解析</summary>${order.map((original,i)=>`<p><strong>${letter(i)}. ${escape(q.options[original])}</strong><br>${escape(q.explanations[original])}</p>`).join('')}</details></article>`;
    }).join(''):'<p class="empty">这个分类里没有题目，做得不错。</p>';
  }
  function exportReview() {
    const total=state.ids.length,count=total-wrongIds().length;
    const lines=['# 第七章测试复盘','',`记录时间：${new Date().toLocaleString('zh-CN')}`,`答对：${count}/${total}；得分：${Math.round(count/total*100)}/100`,''];
    state.ids.forEach(id=>{const q=byId(id),a=state.answers[id];lines.push(`## 第 ${id} 题 · ${correct(id)?'答对':'待复习'}`,'',q.question,'',`- 我的答案：${a===undefined?'未作答':q.options[a]}`,`- 正确答案：${q.options[q.answer]}`,`- 把握：${confidenceNames[state.confidence[id]]||'未标记'}`,`- 对应小节：${q.section}`,'',q.explanations[q.answer],'');});
    const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='第七章-测试复盘.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('keydown',event=>{
    if(state.submitted || dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (/^[a-d]$/i.test(event.key)) {const pos=event.key.toUpperCase().charCodeAt(0)-65;const original=state.orders[state.ids[state.index]][pos];const input=root.querySelector(`[name=answer][value="${original}"]`);if(input){event.preventDefault();input.click();}}
  });
  render();
})();
