import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function checkMap(data) {
  const fail = (condition, message) => { if (!condition) throw new Error(message); };
  const day = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  fail(data.schema_version === 1, 'Unsupported schema_version');
  fail(day(data.updated_at), 'Invalid updated_at');
  for (const key of ['years', 'events', 'sources', 'materials', 'relations']) fail(Array.isArray(data[key]), `Missing ${key}`);
  const index = (items, key, kind) => {
    const ids = new Set();
    for (const item of items) { fail(item[key] !== undefined && !ids.has(item[key]), `Missing/duplicate ${kind}: ${item[key]}`); ids.add(item[key]); }
    return new Map(items.map(item => [item[key], item]));
  };
  const years = index(data.years, 'year', 'year');
  const events = index(data.events, 'id', 'event');
  const sources = index(data.sources, 'id', 'source');
  const materials = index(data.materials, 'id', 'material');
  const refs = (ids, map, label, required = true) => {
    fail(Array.isArray(ids) && (!required || ids.length > 0), `Missing ${label}`);
    fail(new Set(ids).size === ids.length, `Repeated ${label}`);
    for (const id of ids) fail(map.has(id), `Unknown ${label}: ${id}`);
  };
  for (const s of sources.values()) {
    fail(s.title && s.scope, `Source lacks title/scope: ${s.id}`);
    fail(['official', 'paper', 'media'].includes(s.kind), `Source kind: ${s.id}`);
    let url; try { url = new URL(s.url); } catch { throw new Error(`Invalid source URL: ${s.id}`); }
    fail(url.protocol === 'https:' || url.protocol === 'http:', `Unsafe source URL: ${s.id}`);
    fail(day(s.accessed_at) && s.accessed_at <= data.updated_at, `Source access date: ${s.id}`);
    fail(s.published_at === null || (day(s.published_at) && s.published_at <= s.accessed_at), `Source publication date: ${s.id}`);
  }
  for (const e of events.values()) {
    fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id), `Event ID format: ${e.id}`);
    fail(day(e.date) && Number(e.date.slice(0, 4)) === e.year && e.date <= data.updated_at, `Event date/year: ${e.id}`);
    fail(e.date_label && e.date_basis && ['day', 'month', 'range'].includes(e.date_precision), `Date meaning: ${e.id}`);
    fail(e.title && e.summary && e.why_selected, `Editorial explanation: ${e.id}`);
    fail(['main', 'branch', 'root'].includes(e.tier), `Tier: ${e.id}`);
    fail(e.tier === 'root' || years.has(e.year), `Missing event year: ${e.id}`);
    fail(['models', 'products', 'people', 'ecosystem', 'governance'].includes(e.lane), `Lane: ${e.id}`);
    fail(Array.isArray(e.roles) && e.roles.length && e.roles.every(r => ['milestone', 'public-impact', 'early-signal'].includes(r)), `Selection roles: ${e.id}`);
    refs(e.source_ids, sources, `${e.id} sources`);
    refs(e.material_ids, materials, `${e.id} materials`, false);
    fail(e.then && e.then.text, `Missing contemporary perspective: ${e.id}`);
    refs(e.then.source_ids, sources, `${e.id} contemporary sources`);
    if (e.later) {
      fail(e.later.text && day(e.later.as_of) && e.later.as_of > e.date && e.later.as_of <= data.updated_at, `Retrospective date: ${e.id}`);
      refs(e.later.source_ids, sources, `${e.id} later sources`);
      fail(e.later.source_ids.every(id => sources.get(id).published_at === null || sources.get(id).published_at <= e.later.as_of), `Later evidence exceeds cutoff: ${e.id}`);
      fail(e.later.source_ids.some(id => !e.then.source_ids.includes(id)), `No distinct later evidence: ${e.id}`);
    }
    if (e.roles.includes('early-signal')) fail(e.later, `Early signal lacks later evidence: ${e.id}`);
    for (const id of [...e.then.source_ids, ...(e.later?.source_ids || [])]) fail(e.source_ids.includes(id), `Missing unified event source: ${e.id}/${id}`);
  }
  for (const y of years.values()) {
    fail(Number.isInteger(y.year) && y.keyword && y.tagline && y.summary && y.coverage_note, `Year explanation: ${y.year}`);
    fail(['reviewed', 'seed', 'partial'].includes(y.status), `Year status: ${y.year}`);
    refs(y.anchor_ids, events, `${y.year} anchors`);
    for (const id of y.anchor_ids) fail(events.get(id).year === y.year && events.get(id).tier === 'main', `Wrong annual anchor: ${id}`);
    const actual = data.events.filter(e => e.year === y.year && e.tier === 'main').map(e => e.id);
    fail(actual.length === y.anchor_ids.length, `Unlisted main event: ${y.year}`);
    fail(day(y.as_of) && y.as_of <= data.updated_at, `Year cutoff date: ${y.year}`);
    // 历史年份的补充不应迫使进行中年份伪造新的核验截止日。
    if (y.year === Number(data.updated_at.slice(0, 4))) fail(y.status === 'partial' && y.coverage_note.includes(y.as_of), `Unfinished year not qualified: ${y.year}`);
  }
  for (const m of materials.values()) {
    fail(m.title && m.text && ['quote', 'report', 'demo'].includes(m.kind), `Material content: ${m.id}`);
    fail(sources.has(m.source_id), `Material source: ${m.id}`);
  }
  const edgeIds = new Set();
  for (const r of data.relations) {
    fail(events.has(r.from) && events.has(r.to) && r.from !== r.to, `Dangling/self relation: ${r.from}/${r.to}`);
    fail(['uses', 'extends', 'context', 'follow-up'].includes(r.type) && r.note, `Relation meaning: ${r.from}/${r.to}`);
    refs(r.evidence_source_ids, sources, 'relation evidence');
    const key = `${r.from}/${r.to}/${r.type}`; fail(!edgeIds.has(key), `Duplicate relation: ${key}`); edgeIds.add(key);
  }
  const serialized = JSON.stringify(data);
  fail(!/EX-(?:\d{8}|TBD)-\d{3}|research\/library|internal-redacted/.test(serialized), 'Internal evidence leaked into public map');
  return { years: years.size, events: events.size, sources: sources.size, materials: materials.size, relations: data.relations.length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/map.json'), 'utf8'));
  console.log('PASS', JSON.stringify(checkMap(data)));
}
