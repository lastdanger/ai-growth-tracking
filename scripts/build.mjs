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
const labels = { milestone: '重大转折', 'public-impact': '公众影响', 'early-signal': '早期伏笔' };
const statusLabels = { reviewed: '本轮选材已复核', seed: '种子资料，待扩展', partial: '阶段观察，未完整覆盖' };
const table = events => '| 日期 | 事件 | 简述 | 入选理由 | 来源 |\n|---|---|---|---|---|\n' + events.map(e => {
  const links = e.source_ids.map(id => `[${safe(sources.get(id).title)}](${sources.get(id).url})`).join('；');
  return `| ${safe(e.date_label)} | ${safe(e.title)} | ${safe(e.summary)} | ${e.roles.map(r => labels[r]).join('、')} | ${links} |`;
}).join('\n') + '\n';
for (const y of data.years) {
  const items = data.events.filter(e => e.year === y.year && e.tier !== 'root');
  let md = `# ${y.year} · ${y.keyword}\n\n**${y.tagline}**\n\n${y.summary}\n\n状态：${statusLabels[y.status]}。${y.coverage_note}\n\n> 本文件由 data/map.json 生成，不直接编辑。整理截止 ${data.updated_at}；关键词和主次是编辑判断，日期按来源性质显示。\n\n## 年度主线\n\n`;
  md += table(items.filter(e => e.tier === 'main'));
  const branch = items.filter(e => e.tier === 'branch');
  if (branch.length) md += '\n## 可展开分支\n\n' + table(branch);
  md += '\n来源发表日、当时认识、后续证据与关系在离线地图中查看。\n';
  fs.writeFileSync(path.join(root, `chronology/${y.year}.md`), md, 'utf8');
}
fs.writeFileSync(path.join(root, 'chronology/roots.md'), '# 技术前史根节点\n\n少量与后续事件相关的方法起点，不代表这些年份的完整历史，不据此断言当时冷门。\n\n' + table(data.events.filter(e => e.tier === 'root')), 'utf8');
const index = '# 年度关键词与阅读入口\n\n这些关键词和关键句是编辑概括；种子资料与未完年不能视为完整历史。\n\n| 年份 | 关键词 | 关键句 | 覆盖状态 |\n|---|---|---|---|\n' + data.years.map(y => `| [${y.year}](${y.year}.md) | ${y.keyword} | ${y.tagline} | ${statusLabels[y.status]} |`).join('\n') + '\n\n[技术前史根节点](roots.md)\n';
fs.writeFileSync(path.join(root, 'chronology/README.md'), index, 'utf8');
console.log('Built dist/index.html and chronology views:', JSON.stringify(counts));
