# 内容维护

先检索原始来源、判断入选意义，再更新 `data/map.json`。来源直接登记，不强制研究简报或章节卡；需保留比较判断时放 `research/audits/`，未核线索留内部研究。

## 校验与生成

```powershell
node scripts/check.mjs
node --test scripts/check.test.mjs
node scripts/build.mjs
```

check 检查唯一 ID、时间、来源、年度锚点、关系与伏笔证据；build 生成离线网页 `dist/index.html` 和 `chronology/` 年表。生成文件不手改。

交互修改后检查年度选择、主次展开、详情、相关跳转、返回与窄屏。纯内容修改检查数据与对应页面，不机械写镜像实现的测试。

schema_version 2 增加年度代表入口、显式 display_groups、reading_routes、事件 change 和材料 temporal_context。分支未指定展示父节点时，自动进入平级的月份同期组；不能恢复按关系数组首项或邻近日期挂接。修改推荐路线时同步检查转场、跨年下一站与退出路线；路线引用现有事件，不复制正文。更新计数和本地/线上版本时同步 README 与公开说明。

`updated_at` 是整包内容更新日；各年 `as_of` 保留该年的核验截止日。只补历史年份时，不把进行中年份的截止日一起改成今天。

重要选材判断与事实更正进入 research/audits/ 的对应复核记录。

网页默认链接或必要短引，图片、音视频再发布另核权利。本地构建不等于发布授权，不自动采集或定时更新。
