# 模型系列 · 跨年阅读

[返回年度总览](../README.md) · [沿一个系列跨年读](#沿一个系列跨年读)

## 跨系列大事时间线

选材截至 2026-11-23。横向读一个系列，按列对照同月的选择。空格表示本段未选节点。

**事件类型**　![● 新型号发布](legend-release.svg) ![◆ 同型号更新](legend-revision.svg) ![▲ 工具接入](legend-tools.svg)　 **阅读状态**　![↺ 已有回看](legend-review.svg)

日期旁的回看标签表示截至选材日已有后续材料。点开事件名称可读试读档案或年度记录里的来源。

| 系列 | 2026-09 | 2026-10 | 2026-11 |
|---|---|---|---|
| DeepSeek | ![● 新型号发布](legend-release.svg)<br>09-10 ![↺ 已有回看](legend-review.svg)<br>[V4.1 Flash 识图](#event-deepseek-v41-flash-release) | ![◆ 同型号更新](legend-revision.svg)<br>10-17<br>[Flash 换版](../2026.md#event-deepseek-v41-flash-oct17) | ![▲ 工具接入](legend-tools.svg)<br>11-13<br>[文件与搜索 API](../2026.md#event-deepseek-application-apis) |
| Kimi |  | ![● 新型号发布](legend-release.svg)<br>10-23 ![↺ 已有回看](legend-review.svg)<br>[K3.1 Pro](#event-kimi-k31-pro-release) |  |
| GPT | ![● 新型号发布](legend-release.svg)<br>09-03 ![↺ 已有回看](legend-review.svg)<br>[GPT-6 Astra 限量开放](../2026.md#event-gpt6-astra-release) |  | ![● 新型号发布](legend-release.svg)<br>11-17<br>[GPT-6.2 Astra / Sol](../2026.md#event-gpt62-astra-sol-release) |
| Gemini |  | ![● 新型号发布](legend-release.svg)<br>10-28 ![↺ 已有回看](legend-review.svg)<br>[Carbon 邀请试用](../2026.md#event-gemini4-carbon-release) | ![● 新型号发布](legend-release.svg)<br>11-18<br>[Neon](../2026.md#event-gemini4-neon-release) |
| 腾讯混元 |  |  | ![● 新型号发布](legend-release.svg)<br>11-16 ![↺ 已有回看](legend-review.svg)<br>[Hy4 flash](../2026.md#event-tencent-hy4-flash) |

<a name="event-deepseek-v41-flash-release" id="event-deepseek-v41-flash-release"></a>

### DeepSeek V4.1 Flash：视觉理解进入新的API版本

**放回当时 · 2026-09-10**

9 月 10 日，DeepSeek 把原生视觉接进 V4.1 Flash。开发者可以把一张图和一个问题交给同一个模型，API 单价也在当天调低。旧的 Flash 调用名会暂时转到新版，因此比较两次输出时，得先看各自的调用日期。首发页给出的识图成绩来自 DeepSeek 自测。

[DeepSeek：2026年9月10日V4.1 Flash发布](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-09-10)

**后来再看 · 截至 2026-11-23**

10 月 17 日，原来的 deepseek-flash 调用名已指向 1017 版，调用价格保持不变。11 月 13 日，同一接口又能接收文件、读取链接和联网搜索。前一次换了模型，后一次增加的是服务端工具。

11 月多了一种做办公任务的选择。腾讯在自家的 WorkIndex 上测得，Hy4 flash 平均完成一项任务的费用约为 DeepSeek V4.1 Flash-1017 的八分之一。比的是做文稿、修表格等一组任务，DeepSeek 用 Max 档、按峰时价格计费。要批量处理类似文档，这个结果值得拿自己的样稿复测。两款在日常问答或低峰时段谁更划算，仍要另测。

[DeepSeek：2026年10月17日模型与搜索API更新](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-10-17) · [DeepSeek更新日志：发布全家桶应用 API](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-11-13) · [腾讯混元 · 权重文件与 WorkIndex 任务成本对照](https://github.com/Tencent-Hunyuan/Hy4-flash)

[查看年度记录](../2026.md#event-deepseek-v41-flash-release)


<a name="event-kimi-k31-pro-release" id="event-kimi-k31-pro-release"></a>

### Kimi K3.1 Pro 先开放服务，随后提供完整权重

**放回当时 · 2026-10-23**

10 月 23 日，Kimi 开放 K3.1 Pro 的 API 和更快的 Highspeed 版，完整权重当时还在预告中。Artificial Analysis 的首发评测里，K3.1 Pro 的综合指数是 55 分，高于上一代 K3 的 44 分，在当天排第四。让模型连续操作工具的任务进步尤其明显。按词元算的单价降了，跑完这组任务的平均账单仍接近前代，因为新版写出了更多词元。

[Kimi K3.1 Pro：发布与开放计划](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart) · [Kimi论坛：K3.1 Pro发布公告](https://forum.moonshot.ai/t/kimi-k3-1-pro-has-launched-start-exploring-now/629) · [Artificial Analysis：Kimi K3.1 Pro发布评测](https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks)

**后来再看 · 截至 2026-11-18**

11 月 18 日，Artificial Analysis 把 Gemini 4 Neon（xhigh）列为综合指数第三名，排在 Claude Fable 5.2 和 GPT-6.2 Astra（max）之后。Kimi 首发以后，这张榜的前三里出现了两个新对手。要量出 Kimi 与领先者的差距变了多少，还需要两期同题、同设置的对照。

[Artificial Analysis · 11 月 18 日 Gemini 4 Neon 发布评测](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

**后来再看 · 截至 2026-11-20**

选 API 时，11 月 17 日多了一个同价位的参照。GPT-6.2 Sol 发布时，每百万输入、输出词元分别报 2 和 10 美元，和 K3.1 Pro 的 10 月首发报价相同。要算哪款读完一份文档更划算，还得看它为这项任务实际生成了多少词元。

对准备自己部署的人，变化更直接。截至 11 月 20 日，月之暗面的仓库已能取得 K3.1 Pro 的完整权重和许可证。首发时要等的文件现在拿得到，这给 Kimi 留下了一个与云端榜单名次不同的选择理由。

[Artificial Analysis · 11 月 17 日 GPT-6.2 发布评测](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Artificial Analysis：Kimi K3.1 Pro发布评测](https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks) · [Kimi K3.1 Pro 产品说明与权重 FAQ](https://www.kimi.com/ai-models/kimi-k3-1-pro) · [Moonshot AI 在 Hugging Face 发布的 Kimi-K3.1-Pro 权重文件](https://huggingface.co/moonshotai/Kimi-K3.1-Pro/tree/main)

[查看年度记录](../2026.md#event-kimi-k31-pro-release)

## 沿一个系列跨年读

- [GPT](gpt.md) · 从人人能用，到怎样选择和托付，GPT改变了什么？ 最近收录 [ChatGPT Space：做好的学习指南，谁能一起改？](gpt.md#event-chatgpt-space-plus)。
- [Claude](claude.md) · 从回答问题到共同做事，Claude怎样改变工作方式？ 最近收录 [Claude Meetings：会议进行时，笔记和文档一起形成](claude.md#event-claude-meetings-beta)。
- [Gemini](gemini.md) · 从看懂多种材料，到改图和用工具，Gemini怎样落地？ 最近收录 [Gemini 4 Neon：读完资料，还能听懂你为什么要它重写](gemini.md#event-gemini4-neon-release)。
- [DeepSeek](deepseek.md) · 从计算效率到个人试用，DeepSeek 的变化怎样积累？ 最近收录 [DeepSeek：把搜索、文件与语音接成自己的聊天应用](deepseek.md#event-deepseek-application-apis)。
- [Qwen](qwen.md) · 从通义服务到可加工的模型家族，Qwen怎样形成生态？ 最近收录 [Qwen4-Max：视觉、推理与长任务进入同一服务](qwen.md#event-qwen4-max-release)。
- [GLM](glm.md) · 本地中文对话，怎样发展成能接工具的工作基础？ 最近收录 [GLM-5.3：后训练提升与开放节奏同时受到关注](glm.md#event-glm53-release)。
