# Claude · Anthropic

**从回答问题到共同做事，Claude怎样改变工作方式？**

先认识助手与型号分工，再沿Artifacts、电脑操作和Claude Code观察工作怎样交出去。Claude 4连接模型与开发流程，Cowork把视角扩展到文件工作；MCP说明工具背后的连接方式。

截至2026-11-17定向核验近期进展。八个关键站保持；新增Fable/Mythos 5.2与Meetings两项补充，包含一则个人alpha插件制作记录。此前历史版本、其他5.5型号和独立长期效率证据仍未完整整理。

> 由 data/map.json 生成，与年度视图共用事件，不直接编辑。

## 2023 年

<a name="event-claude-introduction" id="event-claude-introduction"></a>

### 03-14 · Anthropic 公布 Claude

聊天和API是最初的两种使用入口。

问答、摘要、写作和编程被放在同一个助手介绍中。聊天与接口两种形式，分别面向直接使用和开发接入。

变化与意义：另一种对话助手开始提供聊天与接口两个入口：人可以直接使用，开发者也可以将它接进应用。这是后续型号分工与工作工具展开的共同起点。

[Anthropic 公布 Claude · 原始来源](https://www.anthropic.com/news/introducing-claude)

接下来：同一个助手开始承担不同任务，速度、成本与能力就不能只看一个名字。Claude 3先把这组取舍做成不同型号。

[查看 2023 年的这条记录](../2023.md#event-claude-introduction)

## 2024 年

<a name="event-claude3-model-family" id="event-claude3-model-family"></a>

### 2024-03-04 · Claude 3：同一个家族，开始分工

解释Opus、Sonnet、Haiku这些名称背后的任务分工。

一个需要即时回复的对话窗口，与一份需要仔细分析的长材料，不一定适合交给同一型号。Claude 3把Opus、Sonnet、Haiku放在同一产品家族中，让使用者按能力、响应速度和成本选择。3月4日先开放Opus与Sonnet，Haiku还要等随后推出；三个名字同时公布，并不代表三个入口同日可用。

变化与意义：Claude从单一助手名称变成一组有分工的选择。后来看到Sonnet负责日常开发、Opus强调复杂工作时，读者有了理解这些名字的起点。

[Introducing the next generation of Claude](https://www.anthropic.com/news/claude-3-family)

接下来：选好型号后，回答还得变成可用成果。3.5与Artifacts把工作区放到对话旁边，让网页和文稿可以接着修改。

[查看 2024 年的这条记录](../2024.md#event-claude3-model-family)

<a name="event-claude-35-artifacts" id="event-claude-35-artifacts"></a>

### 06-20（首发） · Claude 3.5 与 Artifacts：答案旁边出现工作区

可继续加工的成果开始成为对话中心。

**把生成物留在对话旁**（同期材料 · 2024-06-21）

代码、文档和网页设计出现在对话旁的独立窗口。用户可以看着生成物继续提要求，让同一个成果逐步成形。

[Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet)

Claude 提供免费使用入口，付费档有更高限额；Artifacts 此时仍是预览。一个实用的变化是修改网页时能持续看着成果，而不必把每轮回答当成互不相连的文本。

变化与意义：答案可以留在旁边继续修改：网页、代码或文稿成为反复加工的对象。模型表现与工作区一起影响体验，读者开始能围绕成果而不是一串回复组织工作。

[Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet) · [Anthropic’s Claude 3.5 Sonnet model now available in Amazon Bedrock](https://aws.amazon.com/blogs/aws/anthropics-claude-3-5-sonnet-model-now-available-in-amazon-bedrock-the-most-intelligent-claude-model-yet/)

接下来：工作区能留下成果，现有软件里却还有许多步骤。电脑操作公测尝试让模型看屏幕、点击和输入，下一站看这种行动能力的边界。

[查看 2024 年的这条记录](../2024.md#event-claude-35-artifacts)

<a name="event-claude-computer-use" id="event-claude-computer-use"></a>

### 10-22 · Computer use：模型开始操作屏幕上的软件

从建议动作，转向尝试执行动作。

**从屏幕里找按钮，再尝试点下去**（同期材料 · 2024-10-22）

官方说明的操作包括看屏幕、移动光标、点击和输入；面向开发者的 API 公测把这些动作接进任务步骤。发布同时提醒能力仍处于实验阶段，不能把介绍中的流程当成每次都成功的结果。

[Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku](https://www.anthropic.com/news/3-5-models-and-computer-use)

10 月 22 日，Anthropic 向开发者提供 computer use 公测：模型通过屏幕信息定位，再移动光标、点击和输入。官方用查网页后填表等任务说明这条路线，同时承认它仍然笨拙、容易出错。这是 API 上的实验能力，不能等同于成熟、普遍可用的自主办公助手。

变化与意义：AI 开始从给出建议，走向尝试在软件里执行步骤。读者需要关心的也从“这句话对不对”，延伸到“这个动作做对了没有”；看懂屏幕和稳定完成整项工作之间，仍然有距离。

[Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku](https://www.anthropic.com/news/3-5-models-and-computer-use)

接下来：操作界面是一种执行方式；对开发者，终端和代码库是另一种。Claude Code把整项代码任务交接放到这个环境中。

[查看 2024 年的这条记录](../2024.md#event-claude-computer-use)

<a name="event-model-context-protocol-introduction" id="event-model-context-protocol-introduction"></a>

### 11-25 · MCP 开源（补充）

Claude Desktop怎样取得外部资料？MCP提供连接方法，不是又一个Claude型号。

助手要读取项目文件或业务工具中的资料，开发者常常得为每一种连接分别实现接口。Anthropic开源MCP时，同时提供协议与SDK、Claude Desktop本地服务器支持和示例服务器，让数据连接可以按共同方式组织。协议提供连接办法，权限设置与结果核对仍由应用负责。

变化与意义：模型能否帮上忙，不只取决于它知道多少，也取决于能否取得当前任务的资料。MCP把反复接数据和工具的问题单独拿出来处理，是Claude工作入口之外的一层基础。

后来再看（截至2026-09-14）：2025-12-09，MCP 成为新设 Agentic AI Foundation 的创始项目，提供影响扩大与中立治理的后续证据。

[Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) · [MCP joins the Agentic AI Foundation](https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/)

回到关键站 · [Claude Code 开始有限研究预览](#event-claude-code-research-preview)。MCP交代外部资料和工具怎样连接；回到Claude Code，看终端中的整项任务如何交接。

[查看 2024 年的这条记录](../2024.md#event-model-context-protocol-introduction)

## 2025 年

<a name="event-claude-code-research-preview" id="event-claude-code-research-preview"></a>

### 02-24 · Claude Code 开始有限研究预览

终端任务与3.7的思考模式同时进入视野。

开发者可以在终端交出代码任务，让Claude Code读取项目、编辑文件并运行命令。同日发布的Claude 3.7 Sonnet提供快速回答与延长思考，API可控制思考预算。模型怎样分析问题、工具怎样执行步骤，在这次发布中同时出现；Claude Code本身仍是有限研究预览。

变化与意义：开发者可以交出一项带有代码库上下文的任务，让工具读文件、修改并检查，而不必逐段搬运代码。模型的思考方式和工具的执行环境共同决定这件事能推进多远。

[Claude 3.7 Sonnet and Claude Code](https://www.anthropic.com/news/claude-3-7-sonnet)

接下来：有限预览让开发者尝试委托，接着要看怎样进入日常开发流程。Claude 4发布时，推理中的工具使用与Code正式可用一起推进。

[查看 2025 年的这条记录](../2025.md#event-claude-code-research-preview)

<a name="event-claude4-code-ga" id="event-claude4-code-ga"></a>

### 2025-05-22 · Claude 4：推理接上工具，Claude Code走出预览

模型推理、工具调用与开发工作流在此接合。

**从终端试用，走进编辑器与后台任务**（同期材料 · 2025-05-22）

Claude 4发布时，公告同时宣布Claude Code正式可用，提供VS Code与JetBrains集成，以及GitHub Actions后台任务。这几项入口把模型发布与开发者每天工作的地方接了起来。

[Introducing Claude 4](https://www.anthropic.com/news/claude-4)

修代码往往要读文件、运行测试，再根据报错继续改。Claude 4公告把这类往返过程放到中心：Opus 4与Sonnet 4支持快速回答和延长思考，推理中使用工具仍为beta。同日Claude Code正式可用，并提供编辑器集成与GitHub Actions后台任务入口。模型和工作工具在一次发布中会合，实际交付仍要经过开发者审查。

变化与意义：从终端里的有限试用，走向嵌入已有开发流程；衡量对象也从一段代码，扩展到反复检查和修改的任务过程。

[Introducing Claude 4](https://www.anthropic.com/news/claude-4)

接下来：代码里形成的任务交接方式，随后出现在普通文件工作中。Cowork让用户选择文件夹并说明成果要求，使用人群和授权范围也随之变化。

[查看 2025 年的这条记录](../2025.md#event-claude4-code-ga)

## 2026 年

<a name="event-cowork-research-preview" id="event-cowork-research-preview"></a>

### 01-12（研究预览） · Cowork 推出研究预览

文件夹成为交接材料的入口。

**从截图到表格，从笔记到初稿**（同期材料 · 2026-01-12）

官方首发给出的任务很日常：让一堆截图变成表格，让散落的笔记形成初稿。交给它的对象开始是一个文件夹，而不只是聊天框里的文字。

[Techmeme：2026-01-12 Claude官方Cowork发布串帖的同期存档](https://www.techmeme.com/260112/h1745)

1 月 12 日，Anthropic 推出 Cowork 研究预览，首发面向 macOS 应用中的 Max 用户。用户指定一个文件夹，Claude 就可以在其中读取、编辑和新建文件。给出任务后，用户继续看进度、纠正方向，重要动作前会被询问。

变化与意义：工作材料可以留在原来的文件夹里，交给工具接着处理。用户少了一些来回复制和整理的步骤，也要更具体地决定：哪些资料交给它，什么结果算完成，哪些动作需要先问。

[Introducing Labs](https://www.anthropic.com/news/introducing-anthropic-labs) · [Techmeme：2026-01-12 Claude官方Cowork发布串帖的同期存档](https://www.techmeme.com/260112/h1745)

接下来：任务变复杂后，模型升级是否真能支撑这些工作？Opus 5.5给出更高期待与发布评估，下一站同时看案例来源和仍需验证的部分。

[查看 2026 年的这条记录](../2026.md#event-cowork-research-preview)

<a name="event-anthropic-81k-user-interviews" id="event-anthropic-81k-user-interviews"></a>

### 3月18日公布；访谈采集于2025年12月 · 八万多份访谈：人们想把省下的时间用在哪里（补充）

用户希望省下时间，也担心失去哪些东西；补足厂商演示以外的声音。

**2025年12月自述，2026年3月公开**（同期材料 · 2026-03-18）

报告收录的一名墨西哥软件工程师说，AI 帮助自己按时下班，去学校接孩子、陪他们吃饭和玩耍。这里保留的是匿名受访者对自己生活的讲述，不是研究独立测量出的家庭收益。

[What 81,000 people want from AI](https://www.anthropic.com/features/81k-interviews)

3月18日，Anthropic 发布用户访谈报告。采访实际进行于2025年12月的一周：收到112,846份访谈，筛选保留80,508份。参与者来自 Claude.ai 自愿参与用户，访谈与内容分类使用 Claude。报告呈现了受访者希望 AI 帮助实现的事情与顾虑；这些回答既不是全球公众的代表性抽样，也不是已经独立验证的工作或生活改善。此节点记录的是2026年报告公开，不能把访谈经历改写成2026年刚刚发生。

[What 81,000 people want from AI](https://www.anthropic.com/features/81k-interviews) · [What 81,000 people want from AI — Methodological Appendix](https://cdn.sanity.io/files/4zrzovbb/website/99156863ed4a812569fe00a2adfb1c93f7e5a911.pdf)

回到关键站 · [Claude Opus 5.5：复杂工作的能力与评估一起发布](#event-claude-opus55-release)。访谈补上使用者的期待和顾虑；再读Opus 5.5，把能力宣称放回实际工作的要求中。

[查看 2026 年的这条记录](../2026.md#event-anthropic-81k-user-interviews)

<a name="event-claude-opus55-release" id="event-claude-opus55-release"></a>

### 2026-09-22 · Claude Opus 5.5：复杂工作的能力与评估一起发布

回到模型能力与发布评估，检验工作委托的期待。

**一份迁移经历，代表了怎样的期待？**（同期材料 · 2026-09-22）

发布文章转述早期测试者处理大型代码迁移的经历。它呈现了厂商希望模型承担的工作尺度；案例经厂商筛选，不能替代普遍生产率研究。

[Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)

Anthropic介绍Opus 5.5时，把复杂代码工作和发布前外部评估放在同一篇公告里。它还转述了早期用户处理大型代码迁移的经历。这种描述把期待从“回答对不对”推向“整项工作能不能交付”。但案例来自厂商选取与转述，不是所有工程团队都能获得相同收益的证据；外部测试的存在也不等于模型已经没有越界风险。

变化与意义：这次发布可同时接上Claude的工作工具路线与前沿发布讨论：能力、实际效果和授权边界需要一起看。

[Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)

[查看 2026 年的这条记录](../2026.md#event-claude-opus55-release)

<a name="event-claude-fable52-mythos52" id="event-claude-fable52-mythos52"></a>

### 11-09（公告） · Claude Fable与Mythos 5.2：同一底层模型，不同开放条件（补充）

新的技术工作型号，重点看同一底层模型的开放条件与一则后续使用记录。

**带着两个旧插件，做出一个新插件**（后来材料 · 2026-11-15）

11月15日，Simon Willison介绍自己的新地图插件：他让Claude Fable 5.2参考两个旧插件和一个本地示例，称一条提示完成了大部分实现，随后又请它制作浏览器演示。这是已发布alpha初版的个人制作记录，未提供工时对照；我们没有复现。

[Simon Willison：datasette-maplibre 0.1a0 制作记录](https://simonwillison.net/2026/Nov/15/datasette-maplibre/)

11月9日，Anthropic发布Claude Fable 5.2与Mythos 5.2。官方称两者使用同一底层模型；Fable配置了网络安全与生物用途限制，通过公开服务提供，Mythos则须经相应验证计划申请。面向大多数编程和知识工作，官方仍建议先从Opus 5.5开始，再按任务复杂度调整。

变化与意义：较强模型也有不同的使用条件。对使用者而言，先判断任务和可访问范围，再看具体成果，比只追一个新名称更有帮助。

后来再看（截至2026-11-15）：11月15日的GitHub发布页确认，datasette-maplibre 0.1a0是初始alpha版本。作者的制作记录因此有可查的发布产物；版本存在本身，仍不能证明模型完成了多少工作、软件质量如何或是否普遍省时。

[Anthropic：Claude Fable 5.2 and Mythos 5.2](https://www.anthropic.com/claude-fable-and-mythos-5-2) · [Simon Willison：datasette-maplibre 0.1a0 制作记录](https://simonwillison.net/2026/Nov/15/datasette-maplibre/) · [datasette-maplibre：0.1a0 初始 alpha 发布](https://github.com/datasette/datasette-maplibre/releases/tag/0.1a0)

回到关键站 · [Claude Opus 5.5：复杂工作的能力与评估一起发布](#event-claude-opus55-release)。Fable与Mythos补充更复杂任务的选择；回到Opus 5.5，把新型号放回日常工作、任务要求和评估范围中。

[查看 2026 年的这条记录](../2026.md#event-claude-fable52-mythos52)

<a name="event-claude-meetings-beta" id="event-claude-meetings-beta"></a>

### 11-12（Team与Enterprise逐步推出beta） · Claude Meetings：会议进行时，笔记和文档一起形成（补充）

会议中的可见参与和即时成果，是文件工作之外的产品分支。

11月12日的发布记录宣布，Claude Meetings在Claude与Claude Desktop的Team和Enterprise计划中逐步推出beta。用户可把Claude加入Google Meet，作为可见参会者做笔记、回答问题，并在会议中制作文档、白板和演示稿。

变化与意义：整理和制作可以发生在讨论进行时，参与者能围绕同一份材料继续工作。代理进入会议，也让谁能加入、何时转录和怎样管理权限成为实际使用条件。

后来再看（截至2026-11-17）：截至11月17日，使用说明要求加入前确认参会者接受转录，并区分Team与Enterprise的组织开关。部分采用特殊数据保留、医疗数据保护或客户管理加密密钥配置的组织暂不适用；这些是查阅时的条件，不能只凭计划名称判断已经可用。

[Claude发布记录：Meetings beta](https://support.claude.com/en/articles/12138966-release-notes) · [Claude帮助：Use Claude Meetings](https://support.claude.com/en/articles/18325154-use-claude-meetings)

回到关键站 · [Cowork 推出研究预览](#event-cowork-research-preview)。会议把材料生成推进到讨论现场；回到Cowork，看文件交接与使用授权这条共同问题。

[查看 2026 年的这条记录](../2026.md#event-claude-meetings-beta)

## 这条线读到这里

Claude的变化不只在型号：对话旁出现工作区，终端与文件夹成为交接任务的地方，工具连接也成了工作的一部分。任务越长，怎样检查成果、保留人的判断越重要。

听听使用者的期待 · [八万多份访谈：人们想把省下的时间用在哪里](#event-anthropic-81k-user-interviews)。从用户访谈看省下时间与保留判断之间的张力；厂商组织的访谈仍有样本边界。

[返回系列目录](README.md)
