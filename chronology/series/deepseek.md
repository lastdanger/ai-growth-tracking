# DeepSeek · DeepSeek

**从计算效率到个人试用，DeepSeek 的变化怎样积累？**

先看模型怎样少占显存、让每一步只动用部分计算模块，再看开放下载怎样让人动手试用。R1 的推理与手机上的热潮分别成站；后半段追踪工具、长资料和图片怎样进入使用过程。

截至2026-11-17定向核验近期进展。七个关键站保持，10月模型/搜索更新与11月应用API作为补充。V3.2等中间版本、更多独立部署与成本比较仍未完整整理；这次服务补项不代表全部旧节点已重新核验。

> 由 data/map.json 生成，与年度视图共用事件，不直接编辑。

## 2024 年

<a name="event-deepseek-v2-efficiency" id="event-deepseek-v2-efficiency"></a>

### 05-06 · DeepSeek-V2：把效率写进模型结构

生成一个回答，计算和显存花在哪里？

V2 同时处理两种开销：用 MLA 压缩生成时保留的注意力缓存，减少显存占用；用混合专家结构，让每个词元只调用模型中的部分计算模块。词元是模型处理文字的基本片段。开发者也能下载模型自行部署，具体能省多少仍取决于运行条件。

变化与意义：模型变大以后，每一步怎样计算、需要保存多少中间数据，也会影响使用成本。V2 把这两个问题放进结构设计；理解这一点，才能看清后面“总规模”和“每步动用规模”的区别。

后来再看（截至2024-12-27）：2024 年 12 月的 V3 技术报告说明，V3 沿用 V2 的 MLA 和 DeepSeekMoE，也就是压缩注意力缓存、按需分配部分计算的两条思路。下一代模型继续在这些方法上构建。

[DeepSeek-V2 官方仓库与发布记录](https://github.com/deepseek-ai/DeepSeek-V2) · [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/html/2405.04434v1) · [DeepSeek-V3 Technical Report, v1](https://arxiv.org/html/2412.19437v1)

接下来：下一站把模型总规模与每步动用的规模摆在一起，看 V3 怎样沿用这些效率思路。

[查看 2024 年的这条记录](../2024.md#event-deepseek-v2-efficiency)

<a name="event-deepseek-v3-release" id="event-deepseek-v3-release"></a>

### 12-26 · DeepSeek-V3 发布，接上次年的推理路线

模型更大，每一步要动用多少计算？

**6710 亿参数，不是每一步都一起计算**（同期材料 · 2024-12-27）

V3 首版技术报告并列给出两个数：模型共有 6710 亿参数，每处理一个 token 激活约 370 亿。token 是模型处理文字的基本片段。这组数字把“模型有多大”和“每一步动用多少”分开了。

[DeepSeek-V3 Technical Report, v1](https://arxiv.org/html/2412.19437v1)

2024 年 12 月 26 日，DeepSeek-V3 上线并开放权重，网页和 API 同步更新；首发版本处理文本。次日的技术报告说明，它沿用 V2 压缩注意力缓存、按需分配计算的思路，再扩大模型规模。

变化与意义：模型规模之外，还要看每次生成怎样使用计算资源。V3 提供了可以继续开发的基础模型，但“激活参数较少”不能直接等同于整套系统成本同比例下降；它与后来 R1 的具体关系，见下方后续记录。

后来再看（截至2025-01-20）：2025 年 1 月发布的 R1 与 R1-Zero 都以 V3-Base（V3 的基础模型）继续训练。V3 因而也是随后推理模型的训练起点。

[DeepSeek-V3 正式发布](https://www.deepseek.com/news/deepseek-v3/) · [DeepSeek-V3 Technical Report, v1](https://arxiv.org/html/2412.19437v1) · [DeepSeek-R1 官方仓库：基础模型与蒸馏模型](https://github.com/deepseek-ai/DeepSeek-R1) · [DeepSeek-R1 Release 2025/01/20](https://api-docs.deepseek.com/news/news250120/)

接下来：V3-Base 成了 R1 的训练起点。接下来，除了在线试用，个人还可以下载较小的蒸馏模型；一段实际试玩说明这些入口有什么区别。

[查看 2024 年的这条记录](../2024.md#event-deepseek-v3-release)

## 2025 年

<a name="event-deepseek-r1-release" id="event-deepseek-r1-release"></a>

### 01-20 · DeepSeek-R1 发布

从在线回答到本地试玩，使用者拿到了哪些选择？

**同一份公告，给了两种起点**（同期材料 · 2025-01-20）

官方公告邀请用户到网页开启“深度思考”，也向开发者提供模型下载和 API。可以先试一道问题，也可以把模型接进自己的程序；同一次发布，把使用和继续开发放在了相邻的入口。

[DeepSeek-R1 发布](https://deepseek.com/news/deepseek-r1/)

**在自己的电脑上，试一个并不好笑的笑话**（同期材料 · 2025-01-20）

1 月 20 日，Simon Willison 在 64GB 内存的 M2 电脑上，用本地运行工具 Ollama，试玩了一个下载约 8.5GB 的 R1 衍生小模型。他让模型编一个鹈鹕和海象开茶室的笑话：回答前输出长篇推演，最后却仍被他评为不好笑。这是一次个人试玩；运行的是基于 Llama 的较小蒸馏模型，并非 R1 主模型。

[Simon Willison：R1 发布当天的蒸馏模型本地试玩](https://simonwillison.net/2025/Jan/20/deepseek-r1/)

2025 年 1 月 20 日，DeepSeek 发布 R1，提供在线服务、API 和权重下载，也发布六个蒸馏模型。蒸馏在这里指用 R1 生成的推理数据继续训练较小的基础模型；这些模型基于 Qwen 和 Llama，不能与 R1 主模型混为一谈。

变化与意义：推理能力不只出现在一个在线入口里，也通过权重和不同规模的蒸馏模型成为开发材料。普通用户可以试用，开发者则可以比较部署与调整的可能性；R1 代码和权重采用 MIT 许可，蒸馏模型还需看各自基础许可，发布方的基准成绩不等于独立效果验证。

[DeepSeek-R1 发布](https://deepseek.com/news/deepseek-r1/) · [DeepSeek-R1 Release 2025/01/20](https://api-docs.deepseek.com/news/news250120/) · [DeepSeek-R1 官方仓库：基础模型与蒸馏模型](https://github.com/deepseek-ai/DeepSeek-R1) · [Simon Willison：R1 发布当天的蒸馏模型本地试玩](https://simonwillison.net/2025/Jan/20/deepseek-r1/)

接下来：一个人的试玩，和许多人的下载，是两种观察。下一站从模型转向手机应用，看公众热潮和注册阻力。

[查看 2025 年的这条记录](../2025.md#event-deepseek-r1-release)

<a name="event-deepseek-app-public-surge" id="event-deepseek-app-public-surge"></a>

### 1月27日（同期报道） · DeepSeek 登上免费应用榜首，热潮越出技术圈

技术圈之外，人们怎样遇到这款应用？

**榜单上的一个位置**（同期材料 · 2025-01-27）

报道记下了一个直观变化：在美国 iPhone 免费应用榜，DeepSeek 排在了 ChatGPT 前面。这个榜单位置成为当时公众试用热度的一张快照。

[TechCrunch：DeepSeek displaces ChatGPT as the App Store’s top app](https://techcrunch.com/2025/01/27/deepseek-displaces-chatgpt-as-the-app-stores-top-app/)

1 月 27 日，美联社报道 DeepSeek 的公众热潮，也记录了新用户注册受限。公司当时解释为大规模恶意攻击，称已有用户仍可登录。想试用新工具的人遇到的，既有新的选择，也有入口能否顺利使用的问题。

变化与意义：手机上的 AI 选择又多了一个受关注的名字。美国免费应用榜的变化，记录了这次试用热潮；它能说明当时的关注，却不能替用户回答工具是否适合自己的任务。

[TechCrunch：DeepSeek displaces ChatGPT as the App Store’s top app](https://techcrunch.com/2025/01/27/deepseek-displaces-chatgpt-as-the-app-stores-top-app/) · [美联社：DeepSeek称服务遭到恶意攻击](https://apnews.com/article/be414acadbf35070d7645fe9fbd8f464)

接下来：热潮之后，使用方式还在变。下一站看 V3.1 怎样把思考与直接回答放到同一个模型中，并连接工具。

[查看 2025 年的这条记录](../2025.md#event-deepseek-app-public-surge)

<a name="event-deepseek-v31-hybrid-release" id="event-deepseek-v31-hybrid-release"></a>

### 2025-08-21 · DeepSeek-V3.1：推理重新接回通用模型

同一模型能否既直接回答，也展开思考、连接工具？

用户在同一个对话里开关“深度思考”，开发者则继续通过API选择响应方式。V3.1把思考与非思考模式放进同一个模型，网页、应用和API同步更新，并开放基础与后训练模型。公告同时介绍工具使用改进，以及接入Claude Code框架的Anthropic API格式兼容；这是接口适配，不是Claude Code厂商对其效果的背书。

变化与意义：R1让推理成为显眼的新选择，V3.1进一步把它接回日常对话和工具流程。这补上了公众热潮与后来代理适配之间的一步，也避免把V系列与R系列看成互不相干的两条线。

[DeepSeek-V3.1 发布](https://deepseek.com/news/deepseek-v3-1/)

接下来：能调用工具以后，还需要把较长的资料放进任务。下一站看 V4 怎样扩大上下文，也就是一次处理任务时可纳入的材料范围。

[查看 2025 年的这条记录](../2025.md#event-deepseek-v31-hybrid-release)

## 2026 年

<a name="event-deepseek-v4-preview" id="event-deepseek-v4-preview"></a>

### 04-24（预览上线、开放权重与 API 同日公告） · DeepSeek-V4：开放模型瞄准长上下文与代理工作

资料变长、步骤变多，模型怎样接入工作工具？

这次预览把一次任务可纳入的材料范围扩大到 100 万词元，也就是百万上下文。用户当日可在网站和 App 试用，开发者可通过 API 调用 Pro 或 Flash。团队还介绍了压缩与计算效率设计，以及针对 Claude Code、OpenClaw 等代理工具的适配；发布身份仍是预览版，能放入更多资料并不等于每次都能处理好。

变化与意义：长资料、模型权重和代理适配被放到同一次发布中，开放模型的竞争因此延伸到工作环境。能否接上工具，开始和一次回答的表现一样值得追踪。

[DeepSeek-V4 预览版：迈入百万上下文普惠时代](https://www.deepseek.com/news/v4-preview/) · [DeepSeek-V4 Preview: Entering the Era of Affordable Million-Token Context](https://www.deepseek.com/en/news/v4-preview/)

接下来：资料也可能是图片。下一站看 V4.1 Flash 把视觉输入带入 API 后，任务的输入范围怎样变化。

[查看 2026 年的这条记录](../2026.md#event-deepseek-v4-preview)

<a name="event-deepseek-v41-flash-release" id="event-deepseek-v41-flash-release"></a>

### 2026-09-10 · DeepSeek V4.1 Flash：视觉理解进入新的API版本

图片进入模型接口，开发者能多交哪些材料？

DeepSeek把V4.1 Flash介绍为新结构系列中的较小型号，并将原生视觉理解接入API。对开发者而言，变化是图片与文字可以进入同一模型流程；与此同时，原有调用名存在迁移和路由兼容安排。发布页列出的测试成绩属于官方结果，本节点不据此推断它已经在所有工作中领先，也不将API上线视作权重同步开放。

变化与意义：从V4预览到V4.1，关注点进一步转向多模态输入、吞吐与实际调用，而不只是模型规模。

[DeepSeek：2026年9月10日V4.1 Flash发布](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-09-10)

[查看 2026 年的这条记录](../2026.md#event-deepseek-v41-flash-release)

<a name="event-deepseek-v41-flash-oct17" id="event-deepseek-v41-flash-oct17"></a>

### 2026-10-17 · DeepSeek更新Flash，也把搜索能力开放给开发者（补充）

同一调用名下的模型与搜索服务更新，作为后续运维和成本观察。

开发者继续使用deepseek-flash调用名，就会接到10月17日更新的模型；官方网页与应用也同步升级。DeepSeek同时开放自研搜索API，让外部程序可以获取网页信息。厂商称新模型缩短了输出和任务时间，并提醒用户升级配套框架。因此这里的“更能干”既涉及模型，也涉及搜索和执行环境，不能把一张测试表全归因于参数变化。

变化与意义：同样的单价未必意味着同样的任务成本；模型、工具和运行框架的共同变化，需要结合具体任务判断。

[DeepSeek：2026年10月17日模型与搜索API更新](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-10-17)

回到关键站 · [DeepSeek V4.1 Flash：视觉理解进入新的API版本](#event-deepseek-v41-flash-release)。10月更新说明发布后的服务仍在变；回到V4.1首发，分清新增视觉能力与后来的搜索、费用调整。

[查看 2026 年的这条记录](../2026.md#event-deepseek-v41-flash-oct17)

<a name="event-deepseek-application-apis" id="event-deepseek-application-apis"></a>

### 11-13（应用API开放公告） · DeepSeek：把搜索、文件与语音接成自己的聊天应用（补充）

模型之外，搜索、文件与语音怎样组成可接入的应用服务？

**把旧对话带进自己搭的界面**（日期未定）

截至11月17日，官方指南提供的开源演示客户端支持导入DeepSeek网页端导出的对话，继续聊天，并列出上传文件、搜索、语音输入与朗读等功能。这是一份应用组织方式的示例说明，本轮没有运行客户端。

[DeepSeek：构建 Chatbot 与演示客户端](https://api-docs.deepseek.com/zh-cn/guides/build_a_chatbot/)

11月13日，DeepSeek公告开放应用API。开发者可以给deepseek-flash开启搜索、文件输入和链接阅读，服务端负责相应调用及上下文拼接；图像中的文字识别（OCR）、语音识别和语音合成等另有独立接口。这次新增的是应用服务能力，并非新模型发布。

变化与意义：开发者获得的交接内容从一次回答扩展到带资料处理的对话流程，自行串接的环节随之改变。是否省下维护成本、能否稳定处理任务，仍需应用中的实际验证。

[DeepSeek更新日志：发布全家桶应用 API](https://api-docs.deepseek.com/zh-cn/updates/#时间-2026-11-13) · [DeepSeek：构建 Chatbot 与演示客户端](https://api-docs.deepseek.com/zh-cn/guides/build_a_chatbot/)

回到关键站 · [DeepSeek V4.1 Flash：视觉理解进入新的API版本](#event-deepseek-v41-flash-release)。应用API补充模型周围的服务；回到V4.1 Flash，分清模型的视觉输入与后来增加的搜索、文件和语音接口。

[查看 2026 年的这条记录](../2026.md#event-deepseek-application-apis)

## 这条线读到这里

这条线留下三个变化：计算与显存开销进入模型设计；开放模型让个人有机会自行试验；后续版本再把工具、长资料和图片接进任务。实际是否好用，仍取决于型号、运行条件和任务。沿服务分支，还能看到搜索、文件和语音怎样接成应用。

看看模型周围的应用服务 · [DeepSeek：把搜索、文件与语音接成自己的聊天应用](#event-deepseek-application-apis)。从图片输入继续看搜索、文件和语音怎样接入聊天应用；这些是后续服务能力，不能混同为新模型。

[返回系列目录](README.md)
