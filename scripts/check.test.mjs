import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkMap, root } from './check.mjs';
const original = JSON.parse(fs.readFileSync(`${root}/data/map.json`, 'utf8'));
const rejects = (name, change, error) => test(name, () => {
  const data = structuredClone(original);
  change(data);
  assert.throws(() => checkMap(data), error);
});
test('当前数据契约可校验', () => assert.equal(checkMap(original).events, original.events.length));
rejects('系列引用必须存在', d => d.series[0].entries[0].event_id = 'missing', /Unknown series/);
rejects('系列内不能重复事件', d => d.series[0].entries.push(d.series[0].entries[0]), /Repeated series/);
rejects('系列须按日期排序', d => { const a = d.series[0].entries; [a[2], a[3]] = [a[3], a[2]]; }, /Series chronological order/);
rejects('系列必须说明每个条目的关联', d => d.series[0].entries[0].reason = ' ', /Series entry meaning/);
rejects('系列关键站需要转场', d => delete d.series[0].entries.find(e => e.level === 'key').transition_to_next, /Series transition/);
rejects('系列关键站需要解释变化与意义', d => delete d.events.find(e => e.id === 'gpt-oss-open-weights').change, /Series key change/);
rejects('系列末站不得有悬空转场', d => d.series[0].entries.filter(e => e.level === 'key').at(-1).transition_to_next = 'next', /Series transition/);
rejects('系列截止不能超出内容包', d => d.series[0].as_of = '2099-01-01', /Series cutoff/);
rejects('系列事件不能晚于核验截止', d => { d.series[0].as_of = '2023-01-01'; d.series[0].coverage_note = '截至2023-01-01'; }, /Series event exceeds cutoff/);
test('同一事件可被多个系列明确引用，不改变年度主次', () => {
  const d = structuredClone(original);
  const before = d.events.map(e => [e.id, e.tier]);
  const second = structuredClone(d.series[0]); second.id = 'comparison-context'; d.series.push(second);
  assert.equal(checkMap(d).series, original.series.length + 1);
  assert.deepEqual(d.events.map(e => [e.id, e.tier]), before);
});
rejects('精选出口必须已有关系', d => d.events.find(e => e.id === 'chatgpt-agent-release').reading_picks[0].event_id = 'alphafold-3', /Reading pick without relation/);
rejects('精选出口不能重复', d => { const e = d.events.find(e => e.id === 'chatgpt-agent-release'); e.reading_picks[1] = e.reading_picks[0]; }, /Repeated reading picks/);
rejects('精选出口必须解释阅读理由', d => d.events.find(e => e.id === 'chatgpt-agent-release').reading_picks[0].reason = '', /Reading pick reason/);
rejects('开场材料必须属于当前事件', d => d.events[0].scene_material_id = 'missing', /Scene material outside event/);
rejects('一个分支不能重复挂接', d => {
  const y = d.years[1]; y.display_groups[1].children.push(y.display_groups[0].children[0]);
}, /Repeated\/unlabelled display child/);
rejects('拒绝跨年子节点', d => {
  d.years[1].display_groups[0].children[0].event_id = 'stackoverflow-chatgpt-temporary-ban';
}, /Invalid display child/);
rejects('拒绝自指或主节点成为子节点', d => {
  const g = d.years[1].display_groups[0]; g.children[0].event_id = g.anchor_id;
}, /Invalid display child/);
rejects('拒绝重复分组锚点', d => d.years[1].display_groups.push(d.years[1].display_groups[0]), /Invalid display anchor/);
rejects('拒绝跨年的年度代表入口', d => d.years[0].featured_event_id = 'gpt4-release', /Annual featured event/);
rejects('拒绝无效路线引用', d => d.reading_routes[0].steps[0].event_id = 'missing', /Unknown route/);
rejects('拒绝重复路线站点', d => d.reading_routes[0].steps[1].event_id = d.reading_routes[0].steps[0].event_id, /Repeated route/);
rejects('拒绝缺少下一站理由', d => delete d.reading_routes[0].steps[0].transition_to_next, /Route transition/);
rejects('拒绝不存在的路线出口', d => d.reading_routes[0].exit_event_ids.push('missing'), /Unknown route exits/);
rejects('拒绝跨年入口指向不存在的路线', d => d.reading_routes[0].continuation.route_id = 'missing', /Route continuation/);
rejects('拒绝跨年入口形成回环', d => d.reading_routes[1].continuation.route_id = d.reading_routes[0].id, /Route continuation/);
rejects('拒绝跨年入口缺少阅读理由', d => d.reading_routes[0].continuation.reason = '', /Route continuation/);
rejects('拒绝有出口但无解释', d => delete d.reading_routes[0].exit_notes[d.reading_routes[0].exit_event_ids[0]], /Route exit notes/);
rejects('拒绝分支指向不存在的事件', d => d.reading_routes[3].steps[1].explore.event_id = 'missing', /Route branch/);
rejects('拒绝分支重复主路', d => d.reading_routes[3].steps[1].explore.event_id = d.reading_routes[3].steps[0].event_id, /Route branch/);
rejects('拒绝正文复制摘要', d => d.events[0].then.text = d.events[0].summary, /Repeated summary/);
rejects('拒绝无日期材料冒充同期', d => {
  const m = d.materials.find(m => !d.sources.find(s => s.id === m.source_id).published_at);
  m.temporal_context = 'contemporary';
}, /Undated contemporary material/);
test('并列分支允许不指定父节点', () => {
  const d = structuredClone(original); d.years.forEach(y => y.display_groups = []);
  assert.equal(checkMap(d).events, original.events.length);
});
