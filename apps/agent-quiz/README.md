# Hello-Agents 章节学习测评

纯静态学习工具：无需登录，无后台服务。章节练习、即时课件解析、思考题自评、五维诊断、出题逻辑和个人成绩榜。记录仅在当前浏览器；清理网站数据会清除记录，换设备不会自动同步。个人成绩可以被本地修改，不能当作认证考试成绩。

## 开发与构建

```sh
cd apps/agent-quiz
npm ci
npm test
npm run build
```

产物只写入 `docs/组队学习/2026-09hello-agents进阶/学习测评/`。保留仓库现有 master /docs GitHub Pages 发布方式，使用相对资源路径及 Hash 路由。

## 题库生成与核验

1. `blueprints/chapter-N.json` 是生成前的蓝图：学习目标、20个槽位、认知层次、五维标签、难度及具体考查目的。
2. 在本地安装并认证 `notebooklm-py`。NotebookLM 凭据不进入本项目或 Git。
3. `AGENT_QUIZ_REPO` 可指定包含 `.venv` 和本地教程源码的仓库；`NOTEBOOKLM_BIN` 可指定 CLI。默认使用本仓库及 PATH 中的 CLI。
4. `python scripts/generate_bank.py generate --chapters 7 --notebook <完整ID>`：严格选择本章来源，来源ready才生成自定义报告。批次保存在忽略的 `.generation/` 下，支持断点继续；不要覆盖已有版本重新生成。
5. `python scripts/generate_bank.py collect --chapters 7`：等待原产物completed，下载原产物，转换为待核验JSON。此步骤不会宣称题目已通过审核。
6. `python scripts/validate_bank.py --chapters 7`：核验配额、目标覆盖、选项、原文哈希及引用摘录。正常Markdown强调/空白差异可接受，但不接受改写拼接的“原文”；引文还必须位于标注的小节内。
7. 审查每题的正确性、上下文和干扰项，记录实际修改，再更新 `review.status=reviewed`。思考题补齐连续原文依据，清除生成器擅自加的自评分值。只有通过核验的章节可在manifest标记ready。
8. 发布前运行 `python scripts/validate_bank.py --publish`，核对全部16章的审核状态、manifest与题库版本一致，再运行测试与构建。

蓝图和生成记录是实际工具产物；预计难度不等同于经用户数据校准的难度。原始NotebookLM输出需要编辑核验，不能直接视作教材事实。

## 判分与诊断边界

每章12单选、6多选、2思考题。多选完全匹配才正确；思考题仅自评。五维按客观题正确率计算：概念4、机制4、辨析4、应用3、取舍3，每轴不足3个已答样本时标为证据不足且不绘制完整雷达面。速度和把握不改变维度分数。

诊断展示最近一次完整结果，可与同版本上次结果比较；个人成绩榜使用完整测评最佳结果。计时包括当前题离开页面的时间，排除阅读解析的时间。重复练习可能包含记忆效果，不代表对新情境的迁移能力。

## 内容来源

课程：Datawhale [Hello-Agents](https://github.com/datawhalechina/hello-agents)。本期课件锁定版本 `4f7682ceafe573d07cd8a7d0b89908500e83227d`，各章节源文件哈希和 NotebookLM 产物 ID 保存在章节数据中。

教材与本工具所使用的课件摘录、基于教材整理的题库，按 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 署名、非商业和相同方式共享。题库为 NotebookLM 生成后编辑核验的辅助学习材料，并非课程官方考试。课程完整源码仍留在本地，不随本工具提交。
