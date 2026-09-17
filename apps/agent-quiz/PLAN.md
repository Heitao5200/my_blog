# Hello-Agents 学习测评实施说明

## 范围与部署

部署到 `docs/组队学习/2026-09hello-agents进阶/学习测评/`，沿用 GitHub Pages 的 master /docs。用户已确认取消登录，使用本浏览器个人成绩榜，无需云服务。原工作区已有第七章旧测验和 README 改动，不能覆盖或顺带提交。

16 章，每章 12 单选、6 多选、2 思考题。逐题提交后锁定并显示解析、逐项解释、对应课件连续摘录和固定版本来源。18 道客观题完成即可生成诊断并计入成绩榜，思考题可选、自评且不计分。不要求编写代码。

## 出题和审核

先依据课件制定每章 6 个目标及 20 个槽位，再使用 NotebookLM 自定义报告、仅选择对应章节来源生成题目。来源 ready 才开始生成，产物 completed 才下载；保存实际 notebook/source/artifact ID 和源码 SHA256。原稿须经过结构、原文及逐题语义审核，公开页展示蓝图、核验说明与来源。模型预计难度未经作答数据校准。

五维题量：concept 4、mechanism 4、comparison 4、application 3、tradeoff 3。客观题认知层次 understand/mechanism/application 各 6；难度 easy 6、medium 10、hard 4（含两道思考题）。多选完全匹配才正确。不得把提示约束、教学模拟或自我反思写成安全性、兼容性或正确性的保证。

## 本地记录和诊断

记录存在 localStorage；提供 JSON 备份导出和 Markdown 复盘。清理网站数据会清除记录，设备间不自动同步。成绩榜只纳入同章同版本完整客观题记录，按正确率降序、用时升序比较，并标记个人最佳；练习模式不参榜。

诊断使用最近完整测评，不以最好成绩代替当前表现。每维少于 3 个已答样本不形成完整雷达；≥80 为较强、60–79 待巩固、<60 优先复习。速度、把握和思考自评不改变能力分数。展示目标证据、同版本上次雷达对比，以及最多 3 条复习建议（有把握但答错优先，其次其他错题，再其次犹豫但答对）。计时包括答题中离开页面的时间，排除阅读解析时间。

## 数据契约

`public/data/manifest.json`：schemaVersion 和 chapters（id/title/version/status/file/questionCount）。只有 reviewed 且源文校验通过的章节标记 ready。

`public/data/chapter-N.json`：id/title/version/source/blueprint/review/questions。source 保存课件路径、固定版本 URL、SHA256、NotebookLM 来源与产物 ID。blueprint 保存 objectives 和 slots；review 保存核验状态、时间和修改说明。

每题包含 id/type/objectiveId/dimension/level/difficulty/stem/options/answerIds/explanation/optionExplanations/evidence/design；思考题另有 referenceAnswer/rubric。evidence 使用真实小节与连续原文，design 说明具体考查目的及可能混淆。单选和多选均 4 选项，选项 ID a–d 不变，显示顺序随机；思考题没有选项和正确答案 ID。

正式发布前：全部 320 题通过配额、字段、来源哈希、连续引文检查；前端测试及构建通过；实际浏览器验证完整答题、即时解析、计时、本地历史、成绩榜、雷达图、蓝图页和移动端；GitHub Pages 发布后读取线上页面与题库确认。
