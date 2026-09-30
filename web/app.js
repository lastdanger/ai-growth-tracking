(() => {
  'use strict';

  const content = window.AI_MAP_CONTENT;
  const app = document.getElementById('app');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const announcer = document.getElementById('announcer');
  if (!content || !Array.isArray(content.years) || !Array.isArray(content.events)) return;

  const years = [...content.years].sort((a, b) => Number(a.year) - Number(b.year));
  const events = [...content.events].sort(compareEvents);
  const eventsById = new Map(events.map(event => [event.id, event]));
  const sourcesById = new Map((content.sources || []).map(source => [source.id, source]));
  const materialsById = new Map((content.materials || []).map(material => [material.id, material]));
  const relations = content.relations || [];
  const routesById = new Map((content.reading_routes || []).map(route => [route.id, route]));
  const laneNames = { models: '模型与能力', products: '产品与入口', people: '人群与文化', ecosystem: '开发与产业', governance: '制度与规则' };
  const roleNames = { milestone: '重要转折', 'public-impact': '社会回响', 'early-signal': '后续影响线索' };
  const statusNames = { reviewed: '代表事件已整理', seed: '起步事件选读', partial: '阶段整理中' };
  const dateBasisNames = { announcement: '发布/公告', event: '事件', paper: '论文提交', 'paper-release': '论文公开', commit: '代码提交', report: '报道', period: '时期观察', 'announcement-and-effective': '公布与施行', agreement: '协议文本' };
  const sourceKindNames = { official: '官方记录', paper: '研究论文', media: '公开报道' };
  const relationNames = { uses: '采用关系', extends: '扩展关系', context: '背景关联', 'follow-up': '后续关联' };
  const materialNames = { quote: '原话', report: '报道片段', demo: '演示记录' };
  const temporalNames = { contemporary: '同期材料', retrospective: '后来回看', undated: '材料日期或版本未完全确认' };
  const fallbackYear = years.find(year => Number(year.year) === 2023) || years[0];
  let state = { year: Number(fallbackYear?.year), eventId: null, routeId: null, overview: false, prehistory: false, density: 'main', expanded: new Set() };

  function compareEvents(a, b) {
    return String(a.date || '').localeCompare(String(b.date || '')) || String(a.id).localeCompare(String(b.id));
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function safeURL(value) {
    try {
      const url = new URL(String(value));
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function sourceLink(source, label) {
    const url = safeURL(source?.url);
    const title = escapeHTML(label || source?.title || '来源');
    return url ? `<a href="${escapeHTML(url)}" aria-label="${escapeHTML(source?.title || label || '来源')}" target="_blank" rel="noopener noreferrer">${title} ↗</a>` : title;
  }

  function sourceCues(ids) {
    const links = [...new Set(ids || [])].map(id => sourcesById.get(id)).filter(Boolean).map((source, i) => `<span title="${escapeHTML(source.title)}">${sourceLink(source, `出处 ${i + 1}`)}</span>`);
    return links.length ? `<div class="source-cues">依据：${links.join(' · ')}</div>` : '';
  }

  function eventRoles(event) {
    return (event.roles || []).map(role => `<span class="role-tag${role === 'early-signal' ? ' signal' : ''}">${escapeHTML(roleNames[role] || role)}</span>`).join('');
  }

  function eventMeta(event) {
    const lane = Object.hasOwn(laneNames, event.lane) ? event.lane : 'ecosystem';
    return `<div class="event-meta"><time${!event.date_precision || event.date_precision === 'day' ? ` datetime="${escapeHTML(event.date)}"` : ''}>${escapeHTML(event.date_label || event.date)}</time><span class="lane lane-${lane}">${escapeHTML(laneNames[event.lane] || event.lane)}</span></div>`;
  }

  function isExpanded(id) {
    return state.density !== 'main' || state.expanded.has(id);
  }

  function yearEvents(year) {
    return events.filter(event => Number(event.year) === Number(year));
  }

  // 展示归属由编辑明确指定；关系顺序和时间邻近不能制造父子关系。
  function eventGroups(year) {
    const all = yearEvents(year.year);
    const assigned = new Set();
    const groups = all.filter(event => event.tier === 'main').map(event => {
      const children = year.display_groups.find(group => group.anchor_id === event.id)?.children || [];
      const branches = children.map(child => {
        assigned.add(child.event_id);
        return { ...eventsById.get(child.event_id), displayLabel: child.label };
      }).sort(compareEvents);
      return { id: event.id, date: event.date, event, branches };
    });
    const periods = new Map();
    for (const event of all.filter(event => event.tier === 'branch' && !assigned.has(event.id))) {
      const month = event.date.slice(0, 7);
      if (!periods.has(month)) periods.set(month, { id: `period-${month}`, date: event.date, month, branches: [] });
      periods.get(month).branches.push(event);
    }
    return [...groups, ...periods.values()].sort(compareEvents);
  }

  function renderOverview() {
    return `<section class="overview-heading atlas-intro"><div class="eyebrow">A living atlas / AI 时代探索地图</div><h1>从第一次惊讶，<br>到生活开始改变。</h1><p>沿时间看 AI 怎样进入创作、工作与公共生活。选一个年份，再从重要事件走向当时的声音与后来的影响。</p><button type="button" class="start-reading" data-action="year" data-year="${escapeHTML(fallbackYear.year)}">第一次来？从 ${escapeHTML(fallbackYear.year)} · ${escapeHTML(fallbackYear.keyword)} 开始 <span aria-hidden="true">↗</span></button></section>
      <div class="atlas-caption"><span>沿时间展开</span><small>年份 → 主线 → 事件与来源 · 各年持续补充</small></div>
      <ol class="year-journey" aria-label="年度时间主线">${years.map(year => {
        const all = yearEvents(year.year);
        const anchors = (year.anchor_ids || []).map(id => eventsById.get(id)).filter(Boolean);
        const featured = eventsById.get(year.featured_event_id);
        return `<li class="journey-year"><div class="journey-date">${escapeHTML(year.year)}<span class="status ${escapeHTML(year.status)}">${escapeHTML(statusNames[year.status] || year.status)}</span></div><article class="journey-card"><div class="journey-theme"><h2>${escapeHTML(year.keyword)}</h2><p>${escapeHTML(year.tagline || year.summary)}</p><button type="button" class="year-enter" data-action="year" data-year="${escapeHTML(year.year)}" aria-label="展开 ${escapeHTML(year.year)} 年主线">展开这一年 <span aria-hidden="true">↗</span></button><small>${anchors.length} 条主节点 · ${all.length} 个已收录事件${year.status === 'partial' ? ` · 截至 ${escapeHTML(year.as_of)}` : ''}</small></div>${featured ? `<button type="button" class="journey-preview" data-action="event" data-event="${escapeHTML(featured.id)}"><span class="eyebrow">从这件事走进去</span><h3>${escapeHTML(featured.title)}</h3><p>${escapeHTML(year.featured_reason)}</p><span class="preview-link">查看事件与现场 <span aria-hidden="true">↗</span></span></button>` : ''}</article></li>`;
      }).join('')}</ol><div class="atlas-roots">${rootEntry()}</div>`;
  }

  function renderYearStrip() {
    return `<nav class="year-strip" aria-label="选择年份">${events.some(event => event.tier === 'root') ? `<button type="button" class="year-tab" data-action="prehistory"${state.prehistory ? ' aria-current="page"' : ''}><strong>前史</strong><small>源头与方法</small></button>` : ''}${years.map(year => `<button type="button" class="year-tab" data-action="year" data-year="${escapeHTML(year.year)}"${!state.prehistory && Number(year.year) === state.year ? ' aria-current="page"' : ''}><strong>${escapeHTML(year.year)}</strong><small>${escapeHTML(year.keyword)}</small></button>`).join('')}</nav>`;
  }

  function renderEventCard(event, isBranch, branches = []) {
    const selected = state.eventId === event.id;
    const open = isExpanded(event.id);
    return `<article class="event-card${isBranch ? ' branch-card' : ''}${selected ? ' selected' : ''}"><button type="button" class="event-open" data-action="event" data-event="${escapeHTML(event.id)}" aria-label="查看${escapeHTML(event.title)}的详情"${selected ? ' aria-current="true"' : ''}>${eventMeta(event)}<h3>${escapeHTML(event.title)}</h3>${!isBranch || state.density === 'details' ? `<p class="event-summary">${escapeHTML(event.summary)}</p>` : ''}${state.density === 'details' && event.why_selected ? `<p class="event-why">入选原因 · ${escapeHTML(event.why_selected)}</p>` : ''}${event.roles?.length ? `<span class="role-labels">${eventRoles(event)}</span>` : ''}</button>${branches.length ? `<button type="button" class="branch-toggle" data-action="branch" data-event="${escapeHTML(event.id)}" aria-expanded="${open}" aria-controls="branches-${escapeHTML(event.id)}"><span>${open ? '收起' : '展开'} ${branches.length} 个细节与后续</span><span class="toggle-glyph" aria-hidden="true">${open ? '−' : '+'}</span></button>` : ''}</article>`;
  }

  function renderGroup(group) {
    const id = group.id || group.event.id;
    const open = isExpanded(id);
    if (!group.event) return `<li class="timeline-period"><button type="button" class="period-toggle" data-action="branch" data-event="${id}" aria-expanded="${open}" aria-controls="branches-${id}"><span>${escapeHTML(group.month)} · 同期其他事件</span><span>${group.branches.length} 件 ${open ? '−' : '+'}</span></button><div id="branches-${id}"${open ? '' : ' hidden'}>${open ? `<p class="branch-caption">这些事件按月份并列，不属于上方节点。</p><ul class="parallel-events">${group.branches.map(event => `<li>${renderEventCard(event, true)}</li>`).join('')}</ul>` : ''}</div></li>`;
    return `<li class="timeline-group">${renderEventCard(group.event, false, group.branches)}${group.branches.length ? `<div id="branches-${escapeHTML(id)}"${open ? '' : ' hidden'}>${open ? `<ul class="branches">${group.branches.map(event => `<li><span class="branch-label">${escapeHTML(event.displayLabel)}</span>${renderEventCard(event, true)}</li>`).join('')}</ul>` : ''}</div>` : ''}</li>`;
  }

  function renderSources(ids) {
    const sources = [...new Set(ids)].map(id => sourcesById.get(id)).filter(Boolean);
    if (!sources.length) return '<p class="muted">本节点尚未附可查看的来源，不能据此视为完成核验。</p>';
    return `<ul class="source-list">${sources.map(source => `<li>${sourceLink(source)}<span class="source-meta">${escapeHTML(sourceKindNames[source.kind] || '公开来源')} ${source.published_at ? ` · 发布 ${escapeHTML(source.published_at)}` : ''}${source.accessed_at ? `<br>查阅 ${escapeHTML(source.accessed_at)}` : ''}</span>${source.scope ? `<div class="source-scope">${escapeHTML(source.scope)}</div>` : ''}</li>`).join('')}</ul>`;
  }

  function activeRoute() {
    const route = routesById.get(state.routeId);
    return route?.steps.some(step => step.event_id === state.eventId) ? route : null;
  }

  function routeButton(route, index, label) {
    return `<button type="button" class="route-button" data-action="route" data-route="${escapeHTML(route.id)}" data-event="${escapeHTML(route.steps[index].event_id)}">${escapeHTML(label)} <span aria-hidden="true">↗</span></button>`;
  }

  function renderRouteEntry(year) {
    const route = routesById.get(year.reading_route_id);
    return route ? `<section class="route-entry"><div><div class="eyebrow">一条推荐路线 · ${route.steps.length} 站</div><h2>${escapeHTML(route.title)}</h2><p>${escapeHTML(route.intro)}</p></div>${routeButton(route, 0, '从第一站开始')}</section>` : '';
  }

  function renderRouteExit(event) {
    const route = activeRoute();
    if (!route) {
      const recommended = [...routesById.values()].find(route => route.steps.some(step => step.event_id === event.id));
      const index = recommended?.steps.findIndex(step => step.event_id === event.id);
      return recommended ? `<section class="route-next"><p>这件事也在推荐路线「${escapeHTML(recommended.title)}」里。</p>${routeButton(recommended, index, '从这里跟着读')}</section>` : '';
    }
    const index = route.steps.findIndex(step => step.event_id === event.id);
    const previous = index > 0 ? routeButton(route, index - 1, '上一站') : '';
    if (index + 1 < route.steps.length) return `<section class="route-next"><div class="eyebrow">接下来 · ${index + 2} / ${route.steps.length}</div><p>${escapeHTML(route.steps[index].transition_to_next)}</p>${routeButton(route, index + 1, eventsById.get(route.steps[index + 1].event_id).title)}<div class="route-previous">${previous}</div></section>`;
    return `<section class="route-next"><div class="eyebrow">这条路线读到这里</div><p>${escapeHTML(route.outro)}</p><p class="route-reflection">回想一下：哪个变化最具体？它改变了谁的工作或选择？</p><div class="route-exits">${route.exit_event_ids.map(id => `<button type="button" class="route-button" data-action="event" data-event="${escapeHTML(id)}">继续看 · ${escapeHTML(eventsById.get(id).title)} ↗</button>`).join('')}</div><div class="route-previous">${previous}</div></section>`;
  }

  function renderMaterial(material) {
    const source = sourcesById.get(material.source_id);
    return `<article class="material ${escapeHTML(material.kind)}"><span class="material-kind">${escapeHTML(temporalNames[material.temporal_context])} · ${escapeHTML(materialNames[material.kind])}${source.published_at ? ` · ${escapeHTML(source.published_at)}` : ''}</span><h4>${escapeHTML(material.title)}</h4><p>${escapeHTML(material.text)}</p>${sourceCues([material.source_id])}</article>`;
  }

  function renderDetail(event) {
    const materials = event.material_ids.map(id => materialsById.get(id));
    const scene = materials.find(material => material.temporal_context === 'contemporary');
    const additional = materials.filter(material => material !== scene);
    const related = relations.filter(relation => relation.from === event.id || relation.to === event.id)
      .map(relation => ({ relation, target: eventsById.get(relation.from === event.id ? relation.to : relation.from) })).filter(item => item.target);
    const ids = [...event.source_ids, ...materials.map(material => material.source_id), ...related.flatMap(item => item.relation.evidence_source_ids || [])];
    const route = activeRoute();
    const routeHeader = route ? `<div class="route-progress"><span>${escapeHTML(route.title)}<strong>第 ${route.steps.findIndex(step => step.event_id === event.id) + 1} / ${route.steps.length} 站 · ${event.year}</strong></span><button type="button" data-action="leave-route">自由浏览</button></div>` : '';
    const relatedCard = ({relation, target}) => `<div><button type="button" class="related-event" data-action="event" data-event="${escapeHTML(target.id)}"><span class="related-type">${escapeHTML(relation.type === 'follow-up' && relation.to === event.id ? '前序事件' : relationNames[relation.type])} · ${escapeHTML(target.date_label || target.date)}</span><span class="related-title">${escapeHTML(target.title)} ↗</span><span class="related-note">${escapeHTML(relation.note)}</span></button>${sourceCues(relation.evidence_source_ids)}</div>`;
    return `<aside class="detail-panel" aria-labelledby="detail-title">${routeHeader}<div class="detail-head"><div class="detail-top"><div class="eyebrow">Event file / 事件</div><button type="button" class="close-detail" data-action="close">返回脉络 ×</button></div><h2 id="detail-title" tabindex="-1">${escapeHTML(event.title)}</h2>${eventMeta(event)}</div>
      <div class="detail-body">${scene ? `<section class="detail-section scene">${renderMaterial(scene)}</section>` : ''}
      ${!event.change ? `<section class="detail-section"><h3>发生了什么</h3><p>${escapeHTML(event.summary)}</p>${sourceCues(event.source_ids)}</section>` : ''}
      <section class="detail-section"><h3>${event.change ? '发生的变化' : '放回当时'}</h3><p>${escapeHTML(event.then.text)}</p>${sourceCues(event.then.source_ids)}</section>
      ${event.change ? `<section class="detail-section"><h3>为什么重要</h3><p>${escapeHTML(event.change)}</p>${sourceCues(event.then.source_ids)}</section>` : ''}
      ${event.later ? `<section class="detail-section later-reading"><h3>后来再看 · 截至 ${escapeHTML(event.later.as_of)}</h3><p>${escapeHTML(event.later.text)}</p>${sourceCues(event.later.source_ids)}</section>` : ''}
      ${renderRouteExit(event)}
      ${additional.length ? `<details class="reading-fold" data-fold="materials"><summary>更多声音与材料 · ${additional.length}</summary>${additional.map(renderMaterial).join('')}</details>` : ''}
      ${related.length ? `<section class="detail-section related-reading"><h3>相关探索</h3><div class="related-list">${related.slice(0, 3).map(relatedCard).join('')}${related.length > 3 ? `<details class="reading-fold" data-fold="relations"><summary>其他关联 · ${related.length - 3}</summary>${related.slice(3).map(relatedCard).join('')}</details>` : ''}</div></section>` : ''}
      <details class="reading-fold" data-fold="sources"><summary>完整来源与范围 · ${new Set(ids).size}</summary>${renderSources(ids)}</details>
      <details class="reading-fold" data-fold="editorial"><summary>选材说明与日期</summary><p>${escapeHTML(event.why_selected)}</p><p>${escapeHTML(dateBasisNames[event.date_basis] || event.date_basis)} · ${escapeHTML(event.date_label)}</p><div class="role-labels">${eventRoles(event)}</div></details></div></aside>`;
  }


  function renderYear(year) {
    const groups = eventGroups(year);
    const selected = eventsById.get(state.eventId);
    return `${renderYearStrip()}<section class="year-hero"><div class="hero-year">${escapeHTML(year.year)}</div><div><div class="eyebrow">Year in focus / 年度主线</div><h1>${escapeHTML(year.keyword)}</h1>${year.tagline ? `<p class="tagline">${escapeHTML(year.tagline)}</p>` : ''}${year.lead || year.summary ? `<p class="summary">${escapeHTML(year.lead || year.summary)}</p>` : ''}</div><div class="hero-stats"><strong>${year.anchor_ids.length} / ${yearEvents(year.year).length}</strong><small>主节点 / 已收录事件</small></div></section>
      <div class="coverage"><span class="status ${escapeHTML(year.status)}">${escapeHTML(statusNames[year.status] || year.status)}</span><p>${escapeHTML(year.coverage_note || '本年度仍可继续补充，已收录不代表完整覆盖。')}</p></div>
      ${renderRouteEntry(year)}<div class="toolbar"><div class="density-control" role="group" aria-label="地图显示密度">${[['main', '主脉络'], ['branches', '展开分支'], ['details', '细节索引']].map(([id, label]) => `<button type="button" data-action="density" data-density="${id}" aria-pressed="${state.density === id}">${label}</button>`).join('')}</div><span class="map-help">点节点进入档案 · 点分支展开更多事件</span></div>
      <div class="workspace${selected ? ' has-detail' : ''}"><section class="map-board" aria-label="${escapeHTML(year.year)}年时间脉络"><div class="board-caption">${escapeHTML(year.year)} / 时间向下延伸 · 分支按需展开</div>${groups.length ? `<ol class="timeline">${groups.map(renderGroup).join('')}</ol>` : '<p class="empty-state">这一年尚未收录事件。</p>'}</section>${selected ? renderDetail(selected) : ''}</div>`;
  }

  function rootEntry() {
    const roots = events.filter(event => event.tier === 'root');
    if (!roots.length) return '';
    return `<button type="button" class="root-entry" data-action="prehistory"><span><strong>先看看，这些变化从哪里来</strong><small>前史线索 · ${roots.length} 个已收录节点，单独查看源头与方法</small></span><span class="arrow" aria-hidden="true">↗</span></button>`;
  }

  function renderPrehistory() {
    const roots = events.filter(event => event.tier === 'root');
    const selected = eventsById.get(state.eventId);
    return `${renderYearStrip()}<section class="overview-heading roots-heading"><div class="eyebrow">Before the wave / 前史线索</div><h1>热潮之前，<br>一些方法已经开始生长。</h1><p>这里收录与后来事件有明确联系的早期节点。它们按发生时间展开，各自保留后续证据；这不是对早期每一个年份的完整总结。</p></section><div class="workspace${selected ? ' has-detail' : ''}"><section class="map-board" aria-label="前史时间脉络"><div class="board-caption">源头与方法 / 进入节点查看后续影响</div>${roots.length ? `<ol class="timeline">${roots.map(event => renderGroup({ event, branches: [] })).join('')}</ol>` : '<p class="empty-state">尚未收录前史节点。</p>'}</section>${selected ? renderDetail(selected) : ''}</div>`;
  }

  function render() {
    const year = years.find(item => Number(item.year) === state.year) || fallbackYear;
    if (!year && !state.prehistory) { app.innerHTML = '<p class="empty-state">尚未整理年度内容。</p>'; return; }
    const selected = eventsById.get(state.eventId);
    const locationName = state.prehistory ? '前史线索' : `${year.year} · ${year.keyword}`;
    breadcrumbs.innerHTML = `<button type="button" data-action="overview"${state.overview ? ' aria-current="page" class="current"' : ''}>年度总览</button>${!state.overview ? `<span aria-hidden="true">/</span><button type="button" data-action="${state.prehistory ? 'prehistory' : 'year'}"${state.prehistory ? '' : ` data-year="${escapeHTML(year.year)}"`}${!selected ? ' aria-current="page" class="current"' : ''}>${escapeHTML(locationName)}</button>` : ''}${!state.overview && selected ? `<span aria-hidden="true">/</span><span class="current" aria-current="page">${escapeHTML(selected.title)}</span>` : ''}`;
    app.innerHTML = state.overview ? renderOverview() : state.prehistory ? renderPrehistory() : renderYear(year);
    document.title = `${state.overview ? '年度总览' : selected?.title || locationName} — 仍在生成`;
    document.getElementById('updated-at').textContent = content.updated_at ? `内容更新 ${content.updated_at}` : '本地内容快照';
  }

  let restoring = false;
  let scrollFrame = 0;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function rememberView() {
    if (restoring) return;
    const view = { hash: location.hash, density: state.density, expanded: [...state.expanded], scrollY,
      detailScroll: document.querySelector('.detail-panel')?.scrollTop || 0,
      folds: [...document.querySelectorAll('[data-fold][open]')].map(item => item.dataset.fold) };
    try { history.replaceState({ mapView: view }, '', location.href); } catch { /* 部分离线环境禁用 History API。 */ }
  }

  function writeLocation() {
    const params = new URLSearchParams();
    if (state.overview) params.set('view', 'years');
    else if (state.prehistory) {
      params.set('view', 'roots');
      if (state.eventId) params.set('event', state.eventId);
    } else {
      params.set('year', String(state.year));
      if (state.eventId) params.set('event', state.eventId);
    }
    if (activeRoute()) params.set('route', state.routeId);
    const hash = `#${params.toString()}`;
    if (location.hash !== hash) {
      try { history.pushState(null, '', hash); } catch { location.hash = hash; }
    }
  }

  function readLocation() {
    restoring = true;
    const saved = history.state?.mapView;
    const view = saved?.hash === location.hash ? saved : null;
    const params = new URLSearchParams(location.hash.slice(1));
    const year = Number(params.get('year'));
    const event = eventsById.get(params.get('event'));
    state.overview = params.get('view') === 'years' || (!params.has('year') && !params.has('event') && !params.has('view'));
    state.prehistory = !state.overview && (params.get('view') === 'roots' || event?.tier === 'root');
    state.eventId = event?.id || null;
    const route = routesById.get(params.get('route'));
    state.routeId = !state.overview && route?.steps.some(step => step.event_id === event?.id) ? route.id : null;
    state.density = view?.density || 'main';
    state.expanded = new Set(view?.expanded || []);
    state.year = event ? Number(event.year) : years.some(item => Number(item.year) === year) ? year : Number(fallbackYear?.year);
    if (event) expandEventGroup(event);
    render();
    requestAnimationFrame(() => {
      for (const fold of document.querySelectorAll('[data-fold]')) fold.open = view?.folds?.includes(fold.dataset.fold) || false;
      const panel = document.querySelector('.detail-panel');
      if (view) {
        window.scrollTo({ top: view.scrollY, behavior: 'instant' });
        if (panel) panel.scrollTop = view.detailScroll;
      } else if (event && !state.overview) {
        panel?.scrollIntoView({ block: 'start', behavior: 'instant' });
      } else window.scrollTo({ top: 0, behavior: 'instant' });
      restoring = false;
      rememberView();
    });
  }

  function expandEventGroup(event) {
    const year = years.find(item => Number(item.year) === Number(event.year));
    if (!year) return;
    const parent = eventGroups(year).find(group => group.branches.some(branch => branch.id === event.id));
    if (parent) state.expanded.add(parent.id);
  }

  function focusMatching(action, attribute, value) {
    const button = [...document.querySelectorAll(`[data-action="${action}"]`)].find(item => item.dataset[attribute] === value);
    button?.focus({ preventScroll: true });
  }

  function handleAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const previousId = state.eventId;
    rememberView();
    const previousView = history.state?.mapView;
    if (!['route', 'density', 'branch'].includes(action)) state.routeId = null;
    let announcement = '';
    if (action === 'overview') {
      state.overview = true;
      state.prehistory = false;
      state.eventId = null;
      announcement = '已返回年度总览';
    } else if (action === 'prehistory') {
      state.prehistory = true;
      state.overview = false;
      state.eventId = null;
      announcement = '已打开前史线索';
    } else if (action === 'year') {
      state.year = Number(button.dataset.year);
      state.prehistory = false;
      state.eventId = null;
      state.overview = false;
      state.expanded.clear();
      announcement = `已切换到 ${state.year} 年`;
    } else if (action === 'event' || action === 'route') {
      const selected = eventsById.get(button.dataset.event);
      if (!selected) return;
      if (action === 'route') {
        const route = routesById.get(button.dataset.route);
        if (!route?.steps.some(step => step.event_id === selected.id)) return;
        state.routeId = route.id;
      }
      state.eventId = selected.id;
      state.prehistory = selected.tier === 'root';
      state.year = Number(selected.year);
      state.overview = false;
      expandEventGroup(selected);
      announcement = `已打开事件档案：${selected.title}`;
    } else if (action === 'leave-route') {
      announcement = '已退出推荐路线，可以自由探索';
    } else if (action === 'close') {
      state.eventId = null;
      announcement = '已返回年度脉络';
    } else if (action === 'density') {
      state.density = button.dataset.density;
      if (state.density === 'main') state.expanded.clear();
      announcement = `已切换显示密度：${button.textContent}`;
    } else if (action === 'branch') {
      const id = button.dataset.event;
      const currentlyOpen = isExpanded(id);
      if (state.density !== 'main') {
        const year = years.find(item => Number(item.year) === state.year);
        state.expanded = new Set(eventGroups(year).filter(group => group.branches.length).map(group => group.id));
        state.density = 'main';
      }
      if (currentlyOpen) state.expanded.delete(id);
      else state.expanded.add(id);
      announcement = currentlyOpen ? '已收起分支' : '已展开分支';
    } else return;

    render();
    if (['density', 'branch'].includes(action)) {
      const panel = document.querySelector('.detail-panel');
      for (const fold of document.querySelectorAll('[data-fold]')) fold.open = previousView?.folds?.includes(fold.dataset.fold) || false;
      if (panel) panel.scrollTop = previousView?.detailScroll || 0;
    }
    if (!['density', 'branch'].includes(action)) writeLocation();
    announcer.textContent = announcement;
    if (action === 'event' || action === 'route' || action === 'leave-route') {
      document.getElementById('detail-title')?.focus({ preventScroll: true });
      document.querySelector('.detail-panel')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (action === 'density') focusMatching('density', 'density', state.density);
    else if (action === 'branch') focusMatching('branch', 'event', button.dataset.event);
    else if (action === 'close' && previousId) {
      focusMatching('event', 'event', previousId);
      document.activeElement?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    else document.getElementById('main-content').focus({ preventScroll: false });
    rememberView();
  }

  app.addEventListener('click', handleAction);
  breadcrumbs.addEventListener('click', handleAction);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.eventId) {
      rememberView();
      const id = state.eventId;
      state.eventId = null;
      state.routeId = null;
      render();
      writeLocation();
      focusMatching('event', 'event', id);
      document.activeElement?.scrollIntoView({ block: 'center', behavior: 'instant' });
      announcer.textContent = '已关闭事件档案';
      rememberView();
    }
  });
  window.addEventListener('popstate', readLocation);
  window.addEventListener('hashchange', readLocation);
  document.addEventListener('scroll', () => {
    if (restoring || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; rememberView(); });
  }, { capture: true, passive: true });
  app.addEventListener('toggle', rememberView, true);
  readLocation();
})();
