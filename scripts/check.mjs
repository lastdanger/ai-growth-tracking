import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function checkMap(data) {
  const fail = (condition, message) => { if (!condition) throw new Error(message); };
  const day = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  fail(data.schema_version === 3, 'Unsupported schema_version');
  fail(day(data.updated_at), 'Invalid updated_at');
  for (const key of ['years', 'events', 'sources', 'materials', 'relations', 'reading_routes', 'series']) fail(Array.isArray(data[key]), `Missing ${key}`);
  const index = (items, key, kind) => {
    const ids = new Set();
    for (const item of items) { fail(item[key] !== undefined && !ids.has(item[key]), `Missing/duplicate ${kind}: ${item[key]}`); ids.add(item[key]); }
    return new Map(items.map(item => [item[key], item]));
  };
  const years = index(data.years, 'year', 'year');
  const events = index(data.events, 'id', 'event');
  const sources = index(data.sources, 'id', 'source');
  const materials = index(data.materials, 'id', 'material');
  const routes = index(data.reading_routes, 'id', 'route');
  const series = index(data.series, 'id', 'series');
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
    if (e.scene_material_id !== undefined) fail(e.material_ids.includes(e.scene_material_id), `Scene material outside event: ${e.id}`);
    if (e.reading_picks !== undefined) {
      fail(Array.isArray(e.reading_picks) && e.reading_picks.length > 0 && e.reading_picks.length <= 3, `Reading picks count: ${e.id}`);
      refs(e.reading_picks.map(pick => pick.event_id), events, `reading picks ${e.id}`);
      for (const pick of e.reading_picks) {
        fail(typeof pick.label === 'string' && pick.label.trim() && typeof pick.reason === 'string' && pick.reason.trim(), `Reading pick reason: ${e.id}`);
        fail(data.relations.some(r => (r.from === e.id && r.to === pick.event_id) || (r.to === e.id && r.from === pick.event_id)), `Reading pick without relation: ${e.id}/${pick.event_id}`);
      }
    }
    fail(e.then && e.then.text, `Missing contemporary perspective: ${e.id}`);
    fail(e.summary.trim() !== e.then.text.trim(), `Repeated summary: ${e.id}`);
    fail(!e.why_selected.includes('的具体分支，补充同年主线'), `Generic selection reason: ${e.id}`);
    if (e.change !== undefined) fail(typeof e.change === 'string' && e.change.trim(), `Empty change: ${e.id}`);
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
    fail(events.get(y.featured_event_id)?.year === y.year && y.featured_reason, `Annual featured event: ${y.year}`);
    if (y.reading_route_id) fail(routes.has(y.reading_route_id), `Unknown annual route: ${y.year}`);
    if (y.lead !== undefined) fail(typeof y.lead === 'string' && y.lead.trim(), `Empty year lead: ${y.year}`);
    fail(Array.isArray(y.display_groups), `Missing display groups: ${y.year}`);
    const assigned = new Set();
    const anchors = new Set();
    for (const group of y.display_groups) {
      fail(y.anchor_ids.includes(group.anchor_id) && !anchors.has(group.anchor_id), `Invalid display anchor: ${group.anchor_id}`);
      anchors.add(group.anchor_id);
      fail(Array.isArray(group.children) && group.children.length > 0, `Empty display group: ${group.anchor_id}`);
      for (const child of group.children) {
        const event = events.get(child.event_id);
        fail(event?.tier === 'branch' && event.year === y.year, `Invalid display child: ${child.event_id}`);
        fail(child.label && !assigned.has(child.event_id), `Repeated/unlabelled display child: ${child.event_id}`);
        assigned.add(child.event_id);
      }
    }
    fail(day(y.as_of) && y.as_of <= data.updated_at, `Year cutoff date: ${y.year}`);
    // 历史年份的补充不应迫使进行中年份伪造新的核验截止日。
    if (y.year === Number(data.updated_at.slice(0, 4))) fail(y.status === 'partial' && y.coverage_note.includes(y.as_of), `Unfinished year not qualified: ${y.year}`);
  }
  for (const m of materials.values()) {
    fail(m.title && m.text && ['quote', 'report', 'demo'].includes(m.kind), `Material content: ${m.id}`);
    fail(sources.has(m.source_id), `Material source: ${m.id}`);
    fail(['contemporary', 'retrospective', 'undated'].includes(m.temporal_context), `Material temporal context: ${m.id}`);
    if (m.temporal_context === 'contemporary') fail(sources.get(m.source_id).published_at, `Undated contemporary material: ${m.id}`);
  }
  for (const route of routes.values()) {
    fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.id) && route.title && route.intro && route.outro, `Route description: ${route.id}`);
    fail(Array.isArray(route.steps) && route.steps.length >= 2, `Route steps: ${route.id}`);
    refs(route.steps.map(step => step.event_id), events, `route ${route.id}`);
    fail(typeof route.focus === 'string' && route.focus.trim(), `Route focus: ${route.id}`);
    route.steps.forEach((step, i) => {
      fail(events.get(step.event_id).change, `Route event lacks change: ${step.event_id}`);
      fail(i === route.steps.length - 1 ? !step.transition_to_next : !!step.transition_to_next, `Route transition: ${step.event_id}`);
      if (step.source_ids) refs(step.source_ids, sources, `transition ${step.event_id}`);
      if (step.explore) {
        fail(events.has(step.explore.event_id) && !route.steps.some(s => s.event_id === step.explore.event_id) && typeof step.explore.reason === 'string' && step.explore.reason.trim(), `Route branch: ${step.event_id}`);
        fail(i < route.steps.length - 1, `Final step branch belongs in exits: ${step.event_id}`);
      }
    });
    refs(route.exit_event_ids, events, `route exits ${route.id}`);
    fail(route.exit_notes && Object.keys(route.exit_notes).length === route.exit_event_ids.length, `Route exit notes: ${route.id}`);
    for (const id of route.exit_event_ids) {
      const note = route.exit_notes[id];
      fail(note && typeof note.label === 'string' && note.label.trim() && typeof note.reason === 'string' && note.reason.trim(), `Route exit reason: ${id}`);
    }
    if (route.continuation) {
      const next = routes.get(route.continuation.route_id);
      const owner = [...years.values()].find(y => y.reading_route_id === route.id);
      const nextOwner = [...years.values()].find(y => y.reading_route_id === next?.id);
      fail(next && owner && nextOwner && nextOwner.year === owner.year + 1 && typeof route.continuation.reason === 'string' && route.continuation.reason.trim(), `Route continuation: ${route.id}`);
    }
  }
  for (const item of series.values()) {
    fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) && ['name', 'provider', 'question', 'intro', 'coverage_note'].every(key => typeof item[key] === 'string' && item[key].trim()), `Series description: ${item.id}`);
    fail(day(item.as_of) && item.as_of <= data.updated_at && item.coverage_note.includes(item.as_of), `Series cutoff: ${item.id}`);
    fail(Array.isArray(item.entries), `Series entries: ${item.id}`);
    refs(item.entries.map(entry => entry.event_id), events, `series ${item.id}`);
    const keys = item.entries.filter(entry => entry.level === 'key');
    fail(keys.length >= 2, `Series key stops: ${item.id}`);
    fail(typeof item.outro === 'string' && item.outro.trim(), `Series ending: ${item.id}`);
    fail(item.exit && events.has(item.exit.event_id) && !keys.some(entry => entry.event_id === item.exit.event_id) && ['label', 'reason'].every(key => typeof item.exit[key] === 'string' && item.exit[key].trim()), `Series exit: ${item.id}`);
    fail(events.get(item.exit.event_id).date <= item.as_of, `Series exit exceeds cutoff: ${item.id}`);
    item.entries.forEach((entry, i) => {
      const event = events.get(entry.event_id);
      fail(['key', 'supporting'].includes(entry.level) && typeof entry.reason === 'string' && entry.reason.trim(), `Series entry meaning: ${entry.event_id}`);
      if (entry.level === 'key') fail(typeof event.change === 'string' && event.change.trim(), `Series key change: ${entry.event_id}`);
      if (entry.level === 'supporting') {
        fail(entry.return_to && keys.some(key => key.event_id === entry.return_to.event_id) && typeof entry.return_to.reason === 'string' && entry.return_to.reason.trim(), `Series branch return: ${entry.event_id}`);
      } else fail(!entry.return_to, `Series key has branch return: ${entry.event_id}`);
      fail(event.date <= item.as_of, `Series event exceeds cutoff: ${entry.event_id}`);
      if (i) {
        const previous = events.get(item.entries[i - 1].event_id);
        fail(previous.date < event.date || (previous.date === event.date && previous.id.localeCompare(event.id) < 0), `Series chronological order: ${item.id}`);
      }
      const needsTransition = entry.level === 'key' && entry !== keys.at(-1);
      fail(needsTransition ? typeof entry.transition_to_next === 'string' && !!entry.transition_to_next.trim() : !entry.transition_to_next, `Series transition: ${entry.event_id}`);
    });
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
  return { years: years.size, events: events.size, sources: sources.size, materials: materials.size, relations: data.relations.length, series: series.size };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/map.json'), 'utf8'));
  console.log('PASS', JSON.stringify(checkMap(data)));
}
