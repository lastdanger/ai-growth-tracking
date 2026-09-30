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
rejects('拒绝正文复制摘要', d => d.events[0].then.text = d.events[0].summary, /Repeated summary/);
rejects('拒绝无日期材料冒充同期', d => {
  const m = d.materials.find(m => !d.sources.find(s => s.id === m.source_id).published_at);
  m.temporal_context = 'contemporary';
}, /Undated contemporary material/);
test('并列分支允许不指定父节点', () => {
  const d = structuredClone(original); d.years.forEach(y => y.display_groups = []);
  assert.equal(checkMap(d).events, original.events.length);
});
