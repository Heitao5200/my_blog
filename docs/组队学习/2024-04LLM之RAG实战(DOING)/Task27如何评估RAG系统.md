## 评估RAG系统的重要性

- 评估AI系统的目的在于确保其输出不仅准确，而且相关、有用，不会偏离正轨。
- 评估LLM具有挑战性，因为其输出多样化和创造性，难以通过传统定量指标全面评估。

## 开发阶段的评估
- 应遵循机器学习模型的标准评估流程，使用开发、训练和测试集，并采用定量指标衡量模型有效性。
- 学术界可能使用基准和分数对LLM进行排名，并结合人类专家评估。
- 生产环境中，需要调整评估策略以适应快速的开发速度和实际应用需求。

## 自动化评估与反馈循环
- 使用LLM提供的伪分数，结合自动化评估指标和人类判断。

- 开发人员、Prompt工程师和数据科学家合作，通过反馈循环持续改进AI系统。

- 利用主LLM作为自研LLM的评估基准，通过生成相关数据集、定义指标和自动化评估流程来评估。

  ![Image](img/Task27如何评估RAG系统/640-20240409235150658)

## 人类在流程中的反馈
- 人类测试人员提供关于AI输出的相关性、准确性和自然度的反馈。
- 主LLM根据反馈调整提示或模型参数，以提高后续输出的质量。

## 运营阶段的评估
- 运营阶段是真实世界场景中测试AI应用程序的阶段，使用A/B测试和连续反馈循环策略。
- 运营团队、产品团队和分析师团队协同工作，确保应用程序的有效性和持续发展。

## 结论

- 开发阶段强调定制评估和人在流程中的反馈
- 运营阶段使用A/B测试和连续反馈循环等策略来确保有效性和基于用户交互的持续发展。

## 参考文献

- [1] https://github.com/explodinggradients/ragas
- [2] https://github.com/jmorganca/ollama
- [3] https://blog.duy-huynh.com/build-your-own-rag-and-run-them-locally/
- [4] https://github.com/vndee/dev-notebooks/blob/main/Langchain_Evaluation_With_Dataset.ipynb
- [5] https://www.youtube.com/watch?v=gR__vhOVvy4
- [6] https://medium.com/@vndee.huynh/how-to-effectively-evaluate-your-rag-llm-applications-2139e2d2c7a4


https://mp.weixin.qq.com/s?__biz=Mzg3NDIyMzI0Mw==&mid=2247488675&idx=1&sn=c78e4f997f2706091432afd61aef316b&chksm=ced55747f9a2de51ef81e87249c067be62ad0f619b6ba6892eb3f3afca73383313f30d362c6e&cur_album_id=3377833073308024836&scene=189#wechat_redirect