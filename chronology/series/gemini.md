# Gemini · Google

**从看懂多种材料，到改图和用工具，Gemini怎样落地？**

Gemini的特点先是多模态，再是长上下文；2025补上推理、对话改图和工具整合这几步。模型走进搜索或工作软件后，也会遇到错误反馈与实际开放条件。Bard和PaLM仅作为前身背景。

截至2026-10-28核验本系列选材。六个关键站；图像编辑补入Gemini应用入口、Arena回顾与个人玩法讨论。平台自述和个案不代表全民热度；AI Overviews、Spark及Antigravity仍为产品分支，未完整覆盖全部版本及独立效果。

> 由 data/map.json 生成，与年度视图共用事件，不直接编辑。

## 02-06 · Google 公布 Bard（补充）

前身产品背景，Bard不是Gemini版本。

这是实验性服务的介绍，先由受信任测试者使用；看到发布消息与自己已经能够进入产品，是两回事。

[Google 公布 Bard · 原始来源](https://blog.google/innovation-and-ai/technology/ai/bard-google-ai-search-updates/)

回到关键站：**Google 发布 Gemini**。Bard是面向用户的前身背景；从Gemini正式公布开始，看新的多模态模型家族。

[查看2023年背景](../2023.md)

## 05-10 · Google 发布 PaLM 2（补充）

前序模型背景，不用旧型号填充Gemini主线。

多语言、推理和编程是这次发布强调的方向。这里记录厂商给出的能力定位，不据此认定独立性能排名。

[Google 发布 PaLM 2 · 原始来源](https://blog.google/innovation-and-ai/products/google-palm-2-ai-large-language-model/)

回到关键站：**Google 发布 Gemini**。PaLM 2交代前一阶段的语言模型路线；接着读Gemini，避免把前身混成同一个版本序列。

[查看2023年背景](../2023.md)

## 12-06 · Google 发布 Gemini

先确立多模态家族，而不是从某个应用按钮开始。

Gemini从文字、图像、声音和视频等多种信息的共同处理出发，介绍Ultra、Pro、Nano三种规模。不同型号有不同开放安排，Ultra当时尚未普遍提供。读者首先看到的是一个多模态家族的方向，随后才是哪些能力真正进入产品。

变化与意义：多模态被放到整个模型家族的起点，而不只是给文字助手增加一个附件按钮；不同规模对应不同运行位置，各自开放安排仍需分开看。

[Google 发布 Gemini · 原始来源](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/)

接下来：输入种类变多之后，一次能交多少材料成为下一道限制。1.5让长文档、音视频和代码更完整地进入上下文。

[查看2023年背景](../2023.md)

## 02-15 · Gemini 1.5：把整份长资料放进上下文

材料规模发生变化，读者可以带入整份资料。

**一份 402 页的登月任务记录**（同期材料 · 2024-02-15）

Google 用一份 402 页的 Apollo 11 任务记录展示长上下文：把整份资料交给模型，再询问其中跨页的对话与事件。这是厂商发布时的演示案例。

[Our next-generation model: Gemini 1.5](https://blog.google/innovation-and-ai/products/google-gemini-next-generation-model-february-2024/)

预览仍需申请，100 万 token 属实验性能力。Google 用 402 页 Apollo 11 任务记录解释其用途：可以就跨页的对话和事件提问。普通用户当日并非人人都能使用。

变化与意义：长文档、视频与代码可以更完整地作为同一次提问的材料，减少人工先切碎再拼接的步骤。能装下更多内容仍不等于能准确处理每个细节，下一阶段要看读完之后的推理。

[Our next-generation model: Gemini 1.5](https://blog.google/innovation-and-ai/products/google-gemini-next-generation-model-february-2024/)

接下来：能读进长材料，还得会从中解决问题。2.5把推理作为重点，接上复杂分析与代码工作。

[查看2024年背景](../2024.md)

## 5月30日（Google 回应） · AI 搜索摘要铺开，错误也来到用户面前（补充）

多模态能力进入搜索并不自动保证答案可靠；这是应用反馈分支。

**披萨上的奶酪为什么会滑下来？**（同期材料 · 2024-05-30）

Google 的回应承认，系统曾把论坛中用胶水固定披萨奶酪的恶作剧内容放进答案。问题在于它把什么当成了可靠材料。

[Google：AI Overviews: About last week](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/)

AI Overviews 在美国扩大开放后，搜索摘要中的错误成为公共话题。5 月 30 日，Google 承认系统在部分查询中误用了讽刺和论坛恶作剧内容，同时指出流传截图中也有伪造。公司宣布调整触发条件和内容使用方式；这些说明来自产品方的回应。

变化与意义：当生成式回答来到日常搜索入口，错误就不再只发生在主动试用聊天工具的人面前。用户需要判断答案及其来源，产品也要决定什么时候不该给出摘要；公开反馈成为使用过程的一部分。

[Google：AI Overviews: About last week](https://blog.google/products-and-platforms/products/search/ai-overviews-update-may-2024/) · [Google I/O：AI Overviews 向美国用户推出](https://blog.google/products-and-platforms/products/search/generative-ai-google-search-may-2024/)

回到关键站：**Gemini 2.5：读进材料之后，还要推理**。搜索中的错误提醒我们，读到资料不等于正确使用资料；回到2.5推理，但不把发布写成这些错误已被解决。

[查看2024年背景](../2024.md)

## 2025-03-25 · Gemini 2.5：读进材料之后，还要推理

从输入容量转向处理问题的过程。

把整份代码库放进去之后，接下来的难题是找出哪里有问题、怎样修改。Google发布2.5 Pro实验版时，将回答前推理、代码修改和复杂问题处理列为重点，延续长上下文与多模态输入。首发可在AI Studio及Gemini Advanced中尝试，Vertex AI仍在后续安排中。这一站记录推理方向进入2.5，不把它说成Gemini第一次探索思考模型。

变化与意义：1.5突出一次能读多少，2.5进一步追问读完后能怎样分析和行动。材料容量与处理问题的能力，终于可以分开观察。

[Gemini 2.5: Our most intelligent AI model](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/)

接下来：推理是一条变化，直接修改视觉内容是另一条。接下来用Nano Banana看多模态怎样成为围绕一张图反复沟通的工具。

[查看2025年背景](../2025.md)

## 2025-08-26 · Nano Banana：一张图可以接着改

把多模态落到可反复修改的视觉成果。

**想改的是同一张图，而不是重新抽一张**（同期材料 · 2025-08-26）

Google在发布说明中举出保留主体、换场景和改小细节等用法，还转述合作方对连续编辑的期待。它提供了理解产品目标的具体场景；这里未将这些表态当成独立实测或公众热度。

[Use Gemini 2.5 Flash Image (nano banana) on Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/gemini-2-5-flash-image-on-vertex-ai)

**“这是图片，还是已经能用的网站？”**（同期材料 · 2025-08-27）

8月27日，一位Reddit用户分享用Nano Banana重设计网站视觉的尝试，并公开了改版提示词。评论有人挑选喜欢的方案，也有人追问：这是图片，还是网站？另一条评论直接指出只是图片。新鲜感已经从“能改图”走到“拿它做设计”，成果与可运行产品之间却还有一步。这里只记录原帖文字和讨论，不据此认定设计质量。

[Reddit原帖：Nano Banana is a great web designer](https://www.reddit.com/r/Bard/comments/1n1o4eo/nano_banana_is_a_great_web_designer/)

**先记住昵称，再知道它是谁**（后来材料 · 2025-08-27）

Arena在8月27日发表、9月2日更新的文章里回顾，Nano Banana是发布前测试的匿名代号。参与者用同一提示比较结果，社区讨论集中在复杂指令和人物一致性。这个昵称比正式型号更容易进入谈话，但平台中的偏好与讨论不能直接换算成全民热度。

[Arena：Nano Banana匿名试用与社区反应](https://arena.ai/blog/nano-banana)

先给空房间换墙色，再添书架和家具，不必每轮从头描述整张图。2025年8月26日，Google把这种连续修改作为Gemini应用新图像模型的用法；同日Vertex AI提供预览。模型正式名称是Gemini 2.5 Flash Image，发布前在Arena试用时叫Nano Banana。变化在于围绕已有画面继续沟通，而不是每次重新抽取一张图；细节是否保住，仍需逐张检查。

变化与意义：多模态开始从理解图片走向直接修改图片。用户可以围绕同一份视觉成果反复沟通，变化落在创作过程，而不只是一张生成结果。

后来再看（截至2025-09-02）：Arena在9月2日更新的回顾把匿名代号与Gemini 2.5 Flash Image对应起来，并记录社区对指令遵循和主体一致性的关注。这提供了发布公告之外的参与证据；现存页面经过更新，不能用其中票数或排名回填发布首日。

[Use Gemini 2.5 Flash Image (nano banana) on Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/gemini-2-5-flash-image-on-vertex-ai) · [Google：Gemini应用中的连续改图](https://blog.google/products-and-platforms/products/gemini/updated-image-editing-model/) · [Reddit原帖：Nano Banana is a great web designer](https://www.reddit.com/r/Bard/comments/1n1o4eo/nano_banana_is_a_great_web_designer/) · [Arena：Nano Banana匿名试用与社区反应](https://arena.ai/blog/nano-banana)

接下来：改图提供了一种可见的用法，但Gemini的范围不止图像。Gemini 3把多种材料的理解与规划、工具调用放到同一工作过程中。

[查看2025年背景](../2025.md)

## 2025-11-18 · Gemini 3：多模态与工具进入同一工作过程

模型与开发工具开始围绕同一项工作组织。

同一项工作可能同时带着代码、截图和说明文件。Gemini 3发布介绍把综合理解这些输入、规划步骤和调用工具放在一起，3 Pro在Vertex AI与Gemini Enterprise以预览形式提供，也进入Antigravity、Gemini CLI等入口。模型能力与工作界面是两层变化；发布中的客户效率案例仍是厂商挑选的材料。

变化与意义：Gemini的多模态特色开始落到跨工具工作中：读材料、作判断和执行步骤可以被组织起来。接着看Antigravity，才能知道开发者怎样查看和检查这个过程。

[Bringing Gemini 3 to Enterprise](https://cloud.google.com/blog/products/ai-machine-learning/gemini-3-is-available-for-enterprise)

接下来：Antigravity分支能看到具体工作界面；沿主线则继续追踪Argon的API正式可用与产品开放，区分新能力和真正能使用它的入口。

[查看2025年背景](../2025.md)

## 11-18（公开预览） · Antigravity：编辑器里有了代理管理界面（补充）

与Gemini 3同日的工作界面：开发者怎样管理代理、查看产物和反馈。

**交上来的不只是代码**（同期材料 · 2025-11-18）

官方展示的工作记录包括任务清单、实施计划、操作说明、截图与浏览器录屏：用户可以围绕一项成果查看代理做到了哪一步。

[Introducing Google Antigravity, a New Era in AI-Assisted Software Development](https://www.antigravity.google/blog/introducing-google-antigravity)

首发预览面向个人免费，受模型用量限制。代理会交付任务清单、实施计划、截图或验证记录，开发者可以围绕这些产物反馈；公开预览不代表可以数天无人看管地可靠运行。

[Introducing Google Antigravity, a New Era in AI-Assisted Software Development](https://www.antigravity.google/blog/introducing-google-antigravity)

回到关键站：**Gemini 3：多模态与工具进入同一工作过程**。工作界面把计划、产物和反馈摆到一起；回到同日的Gemini 3，区分界面工作流与模型能力。

[查看2025年背景](../2025.md)

## 05-19 · Google 介绍 Gemini Spark（补充）

持续任务的产品方向，保留预告与受限测试身份。

官方举例是整理会议资料、生成文档、跟进重复事项。公告安排当周先给受信任测试者，下一周向美国Ultra用户推出Beta；这些是当日的测试计划，不能据此认定已按期开放。

[The Gemini app becomes more agentic, delivering proactive, 24/7 help](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)

回到关键站：**Gemini 4 Argon：从发布期待走到实际入口**。Spark是持续任务方向的受限预览；回到Argon，核对真正可用的模型和产品入口。

[查看2026年背景](../2026.md)

## 2026-10-13 · Gemini 4 Argon：从发布期待走到实际入口

以实际入口和开放条件收束近期演进。

10月13日，Google的API日志把Gemini 4 Argon标为正式可用；产品更新则说明它开始向Pro和Ultra订阅用户推出。同日，Gemini的macOS应用加入Antigravity入口，让用户在聊天之后交出编程计划，等待代理构建和测试。模型的开放与工具的整合在这里相遇，但两者不是同一种能力，账户、地区和语言限制也仍然存在。

变化与意义：模型进步要经过实际可访问的产品入口才会改变用法；正式可用、滚动开放与此前预告必须分开记录。

[Gemini API release notes：Gemini 4 Argon GA](https://ai.google.dev/gemini-api/docs/changelog) · [Gemini Apps：2026年10月13日更新](https://gemini.google/sc/release-notes/?hl=en-GB)

[查看2026年背景](../2026.md)

## 这条线读到这里

Gemini从理解多种材料、容纳长上下文，走到推理、连续改图与工具工作。能力进入日常产品后，读者既会看到具体玩法，也会碰到错误；演示中的可能性还需要使用反馈来补全。

换到真实产品的反馈：**AI 搜索摘要铺开，错误也来到用户面前**。看搜索摘要怎样暴露应用中的可靠性问题，不把改图体验或模型成绩当作所有产品的保证。

[查看这件事所在的2024年](../2024.md)

[返回系列目录](README.md)
