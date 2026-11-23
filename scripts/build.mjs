import fs from 'node:fs';
import path from 'node:path';
import { root, checkMap } from './check.mjs';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('data/map.json'));
const counts = checkMap(data);
const sources = new Map(data.sources.map(source => [source.id, source]));
let html = read('web/index.html');
const substitutions = {
  '<!-- APP_STYLES -->': `<style>\n${read('web/styles.css')}\n</style>`,
  '<!-- MAP_DATA -->': `<script>window.AI_MAP_CONTENT=${JSON.stringify(data).replaceAll('<', '\\u003c')};</script>`,
  '<!-- APP_SCRIPT -->': `<script>\n${read('web/app.js')}\n</script>`
};
for (const [marker, value] of Object.entries(substitutions)) {
  if (html.split(marker).length !== 2) throw new Error(`Expected exactly one marker: ${marker}`);
  html = html.replace(marker, () => value);
}
// Only explicit public data and application files are included, never research/library.
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html, 'utf8');
fs.mkdirSync(path.join(root, 'chronology'), { recursive: true });
const safe = value => String(value ?? '').replaceAll('|', '｜').replaceAll('\n', ' ');
const events = new Map(data.events.map(event => [event.id, event]));
const eventAnchor = id => `event-${id}`;
const anchorTag = id => `<a name="${eventAnchor(id)}" id="${eventAnchor(id)}"></a>`;
const annualLink = (id, prefix = '', label) => {
  const event = events.get(id);
  return `[${safe(label ?? event.title)}](${prefix}${event.tier === 'root' ? 'roots' : event.year}.md#${eventAnchor(id)})`;
};
const statusLabels = { reviewed: '本轮选材已复核', seed: '种子资料，待扩展', partial: '阶段观察，未完整覆盖' };
const roleLabels = { milestone: '重大转折', 'public-impact': '公众影响', 'early-signal': '早期伏笔' };
const table = events => '| 日期 | 事件 | 简述 | 来源 |\n|---|---|---|---|\n' + events.map(e => {
  const links = e.source_ids.map(id => `[${safe(sources.get(id).title)}](${sources.get(id).url})`).join('；');
  const roles = e.roles.filter(role => e.tier !== 'branch' || role !== 'milestone').map(role => roleLabels[role]);
  const tag = roles.length ? `（${roles.join('、')}）` : '';
  return `| ${safe(e.date_label)} | ${anchorTag(e.id)}${safe(e.title)}${tag} | ${safe(e.summary)} | ${links} |`;
}).join('\n') + '\n';
for (const y of data.years) {
  const items = data.events.filter(e => e.year === y.year && e.tier !== 'root').sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let md = `# ${y.year} · ${y.keyword}\n\n**${y.tagline}**\n\n${y.lead || y.summary}\n\n状态：${statusLabels[y.status]}。${y.coverage_note}\n\n> 本文件由 data/map.json 生成，不直接编辑。内容包更新 ${data.updated_at}；年度核验截止 ${y.as_of}。关键词和主次是编辑判断，日期按来源性质显示。\n\n`;
  const route = data.reading_routes.find(route => route.id === y.reading_route_id);
  if (route) {
    md += `## 推荐路线：${route.title}\n\n${route.intro}\n\n这条路线看的是：${route.focus}。\n\n`;
    route.steps.forEach((step, i) => {
      const event = data.events.find(event => event.id === step.event_id);
      md += `${i + 1}. ${annualLink(event.id)}（${event.year}）。${event.change}${step.transition_to_next ? ` ${step.transition_to_next}` : ''}\n`;
      if (step.explore) md += `   分支可读${annualLink(step.explore.event_id)}。${step.explore.reason}\n`;
    });
    md += `\n${route.outro}\n\n`;
    if (route.continuation) {
      const nextYear = data.years.find(y => y.reading_route_id === route.continuation.route_id);
      md += `沿这个问题继续：[${nextYear.year} 年路线](${nextYear.year}.md)。${route.continuation.reason}\n\n`;
    }
    for (const id of route.exit_event_ids) md += `- ${route.exit_notes[id].label} · ${annualLink(id)}。${route.exit_notes[id].reason}\n`;
    md += '\n';
  }
  md += '## 年度主线\n\n';
  md += table(items.filter(e => e.tier === 'main'));
  const branch = items.filter(e => e.tier === 'branch');
  if (branch.length) md += '\n## 可展开分支\n\n' + table(branch);
  md += '\n来源发表日、当时认识、后续证据与关系在离线地图中查看。\n';
  fs.writeFileSync(path.join(root, `chronology/${y.year}.md`), md, 'utf8');
}
fs.writeFileSync(path.join(root, 'chronology/roots.md'), '# 技术前史根节点\n\n少量与后续事件相关的方法起点，不代表这些年份的完整历史，不据此断言当时冷门。\n\n' + table(data.events.filter(e => e.tier === 'root')), 'utf8');
let index = '# 年度关键词与阅读入口\n\n';
if (data.recent_update) {
  const issue = data.recent_update;
  index += `## 最近一期（选材截至 ${issue.as_of}）\n\n${issue.summary}\n\n`;
  for (const id of issue.featured_event_ids) index += `- ${annualLink(id)}\n`;
  const rest = issue.event_ids.filter(id => !issue.featured_event_ids.includes(id));
  if (rest.length) index += '\n本期其余事件 · ' + rest.map(id => annualLink(id)).join(' · ') + '\n';
  index += '\n';
}
if (data.topics?.length) {
  fs.mkdirSync(path.join(root, 'chronology/topics'), { recursive: true });
  index += '## 按问题读\n\n';
  for (const topic of data.topics) {
    index += `- [${topic.title}](topics/${topic.id}.md)\n`;
    let md = `# ${topic.title}\n\n${topic.intro}\n\n`;
    for (const item of topic.items) {
      const event = events.get(item.event_id);
      const source = sources.get(item.source_id);
      md += `## ${event.title}\n\n**实际拿到什么**　${item.deliverable}\n\n**人接下来做什么**　${item.human_step}\n\n${item.evidence} [${safe(source.title)}](${source.url})\n\n回到当年的记录 · ${annualLink(event.id, '../')}\n\n`;
    }
    md += `${topic.outro}\n\n${topic.follow_up.reason} ${annualLink(topic.follow_up.event_id, '../')}\n\n[返回阅读入口](../README.md)\n`;
    fs.writeFileSync(path.join(root, `chronology/topics/${topic.id}.md`), md, 'utf8');
  }
  index += '\n';
}
index += '## 按年份读\n\n这些关键词和关键句是编辑概括。种子资料与进行中年份的覆盖范围见各年说明。\n\n| 年份 | 关键词 | 关键句 | 覆盖状态 |\n|---|---|---|---|\n' + data.years.map(y => `| [${y.year}](${y.year}.md) | ${y.keyword} | ${y.tagline} | ${statusLabels[y.status]} |`).join('\n') + '\n\n[技术前史根节点](roots.md)\n';
fs.writeFileSync(path.join(root, 'chronology/README.md'), index, 'utf8');
const seriesDir = path.join(root, 'chronology/series');
fs.mkdirSync(seriesDir, { recursive: true });
let seriesIndex = '# 模型系列 · 跨年阅读\n\n[返回年度总览](../README.md) · [沿一个系列跨年读](#沿一个系列跨年读)\n\n';
if (data.series_timeline) {
  const timeline = data.series_timeline;
  const legend = timeline.legend;
  const badges = new Map();
  if (legend) {
    for (const [kind, mark] of [...Object.entries(legend.kinds), ['review', legend.review]]) {
      const label = `${mark.symbol} ${mark.label}`;
      if (!mark.color) {
        badges.set(kind, `**${safe(label)}**`);
        continue;
      }
      // Markdown 阅读器可以直接显示本地图例，颜色与网页都取自同一条记录。
      const file = `legend-${encodeURIComponent(kind)}.svg`;
      const width = 30 + [...mark.label].reduce((w, ch) => w + (ch.codePointAt(0) > 255 ? 14 : 9), 0);
      const xml = label.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="24" role="img" aria-labelledby="title">
  <title id="title">${xml}</title>
  <rect width="100%" height="100%" rx="${kind === 'review' ? 12 : 4}" fill="${mark.color}"/>
  <text x="50%" y="16.5" text-anchor="middle" fill="#102029" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="13" font-weight="700">${xml}</text>
</svg>\n`;
      fs.writeFileSync(path.join(seriesDir, file), svg, 'utf8');
      badges.set(kind, `![${safe(label)}](${encodeURIComponent(file)})`);
    }
  }
  const reviewsAtCutoff = event => {
    const reviews = [];
    if (event.later?.as_of <= timeline.as_of) reviews.push(event.later);
    for (const materialId of event.material_ids) {
      const material = data.materials.find(m => m.id === materialId);
      const date = sources.get(material.source_id).published_at;
      if (material.temporal_context === 'retrospective' && date > event.date && date <= timeline.as_of) {
        reviews.push({as_of: date, text: material.text, source_ids: [material.source_id]});
      }
    }
    return reviews.sort((a, b) => a.as_of.localeCompare(b.as_of));
  };
  seriesIndex += `## 跨系列大事时间线\n\n选材截至 ${timeline.as_of}。横向读一个系列，按列对照同月的选择。空格表示本段未选节点。\n\n`;
  if (legend) {
    seriesIndex += '**事件类型**　' + Object.keys(legend.kinds).map(kind => badges.get(kind)).join(' ') + '　 **阅读状态**　' + badges.get('review') + '\n\n';
    seriesIndex += '日期旁的回看标签表示截至选材日已有后续材料。点开事件名称可读试读档案或年度记录里的来源。\n\n';
  }
  seriesIndex += '| 系列 | ' + timeline.months.join(' | ') + ' |\n|' + '---|'.repeat(timeline.months.length + 1) + '\n';
  for (const row of timeline.rows) {
    const cells = timeline.months.map(month => row.entries.filter(entry => events.get(entry.event_id).date.startsWith(month))
      .sort((a, b) => events.get(a.event_id).date.localeCompare(events.get(b.event_id).date))
      .map(entry => {
        const event = events.get(entry.event_id);
        const date = event.date.slice(5);
        const label = legend ? entry.label : `${date} ${entry.label}`;
        const link = timeline.focus_event_ids.includes(event.id) ? `[${safe(label)}](#${eventAnchor(event.id)})` : annualLink(event.id, '../', label);
        if (!legend) return link;
        const review = reviewsAtCutoff(event).length ? ' ' + badges.get('review') : '';
        return `${badges.get(entry.kind)}<br>${date}${review}<br>${link}`;
      }).join('<br>'));
    seriesIndex += `| ${safe(row.name)} | ${cells.join(' | ')} |\n`;
  }
  const passage = (title, note) => {
    const links = note.source_ids.map(id => sources.get(id)).map(s => `[${safe(s.title)}](${s.url})`);
    return `**${title}**\n\n${note.text}\n\n${links.join(' · ')}\n\n`;
  };
  for (const id of timeline.focus_event_ids) {
    const event = events.get(id);
    seriesIndex += `\n${anchorTag(id)}\n\n### ${safe(event.title)}\n\n`;
    seriesIndex += passage('放回当时 · ' + event.date, event.then);
    for (const note of reviewsAtCutoff(event)) {
      seriesIndex += passage('后来再看 · 截至 ' + note.as_of, note);
    }
    seriesIndex += annualLink(id, '../', '查看年度记录') + '\n\n';
  }
}
seriesIndex += '## 沿一个系列跨年读\n\n' + data.series.map(s => {
  const last = events.get(s.entries.at(-1).event_id);
  return `- [${s.name}](${s.id}.md) · ${s.question} 最近收录 [${last.title}](${s.id}.md#${eventAnchor(last.id)})。`;
}).join('\n') + '\n';
fs.writeFileSync(path.join(seriesDir, 'README.md'), seriesIndex, 'utf8');
fs.appendFileSync(path.join(root, 'chronology/README.md'), '\n[模型系列：跨年阅读](series/README.md)\n', 'utf8');
for (const series of data.series) {
  let md = `# ${series.name} · ${series.provider}\n\n**${series.question}**\n\n${series.intro}\n\n${series.coverage_note}\n\n> 由 data/map.json 生成，与年度视图共用事件，不直接编辑。\n\n`;
  let previousYear;
  for (const entry of series.entries) {
    const event = data.events.find(e => e.id === entry.event_id);
    if (event.year !== previousYear) md += `## ${event.year} 年\n\n`;
    previousYear = event.year;
    md += `${anchorTag(event.id)}\n\n### ${event.date_label} · ${event.title}${entry.level === 'supporting' ? '（补充）' : ''}\n\n${entry.reason}\n\n`;
    for (const id of event.material_ids) {
      const material = data.materials.find(m => m.id === id);
      const source = sources.get(material.source_id);
      const timing = { contemporary: '同期材料', retrospective: '后来材料', undated: '日期未定' }[material.temporal_context];
      md += `**${material.title}**（${timing}${source.published_at ? ` · ${source.published_at}` : ''}）\n\n${material.text}\n\n[${safe(source.title)}](${source.url})\n\n`;
    }
    md += `${event.then.text}\n\n`;
    if (event.change) md += `变化与意义：${event.change}\n\n`;
    if (event.later) md += `后来再看（截至${event.later.as_of}）：${event.later.text}\n\n`;
    md += event.source_ids.map(id => `[${safe(sources.get(id).title)}](${sources.get(id).url})`).join(' · ') + '\n\n';
    if (entry.transition_to_next) md += `接下来：${entry.transition_to_next}\n\n`;
    if (entry.return_to) md += `回到关键站 · [${safe(events.get(entry.return_to.event_id).title)}](#${eventAnchor(entry.return_to.event_id)})。${entry.return_to.reason}\n\n`;
    md += `[查看 ${event.year} 年的这条记录](../${event.tier === 'root' ? 'roots' : event.year}.md#${eventAnchor(event.id)})\n\n`;
  }
  const exit = data.events.find(e => e.id === series.exit.event_id);
  const exitLink = series.entries.some(entry => entry.event_id === exit.id)
    ? `[${safe(exit.title)}](#${eventAnchor(exit.id)})`
    : annualLink(exit.id, '../');
  md += `## 这条线读到这里\n\n${series.outro}\n\n${series.exit.label} · ${exitLink}。${series.exit.reason}\n\n`;
  fs.writeFileSync(path.join(seriesDir, `${series.id}.md`), md + '[返回系列目录](README.md)\n', 'utf8');
}
console.log('Built dist/index.html and chronology views:', JSON.stringify(counts));
