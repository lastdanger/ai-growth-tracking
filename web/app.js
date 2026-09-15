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
  const laneNames = { models: '模型与能力', products: '产品与入口', people: '人群与文化', ecosystem: '开发与产业', governance: '制度与规则' };
  const roleNames = { milestone: '重要转折', 'public-impact': '社会回响', 'early-signal': '后续影响线索' };
  const statusNames = { reviewed: '本轮选材已复核', seed: '待扩展的起点', partial: '阶段整理中' };
  const dateBasisNames = { announcement: '发布/公告', event: '事件', paper: '论文提交', 'paper-release': '论文公开', commit: '代码提交', report: '报道', period: '时期观察', 'announcement-and-effective': '公布与施行', agreement: '协议文本' };
  const sourceKindNames = { official: '官方记录', paper: '研究论文', media: '公开报道' };
  const relationNames = { uses: '采用关系', extends: '扩展关系', context: '背景关联', 'follow-up': '后续关联' };
  const materialNames = { quote: '同期原话', report: '报道片段', demo: '演示记录' };
  const fallbackYear = years.find(year => Number(year.year) === 2023) || years[0];
  let state = { year: Number(fallbackYear?.year), eventId: null, overview: false, prehistory: false, density: 'main', expanded: new Set() };

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
    return url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${title} ↗</a>` : title;
  }

  function sourceCues(ids) {
    const links = [...new Set(ids || [])].map(id => sourcesById.get(id)).filter(Boolean).map(source => sourceLink(source));
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

  // 浏览分组只是降低一次显示的内容密度，不能从位置推导事件因果。
  function eventGroups(year) {
    const all = yearEvents(year.year);
    const explicitAnchors = new Set(year.anchor_ids || []);
    let anchors = all.filter(event => explicitAnchors.has(event.id));
    if (!anchors.length) anchors = all.filter(event => event.tier === 'main');
    if (!anchors.length && all.length) anchors = [all[0]];
    const anchorSet = new Set(anchors.map(event => event.id));
    const groups = anchors.map(event => ({ event, branches: [] }));
    const groupById = new Map(groups.map(group => [group.event.id, group]));
    for (const event of all.filter(candidate => !anchorSet.has(candidate.id))) {
      const related = relations.find(relation =>
        (relation.from === event.id && anchorSet.has(relation.to)) ||
        (relation.to === event.id && anchorSet.has(relation.from))
      );
      let group;
      if (related) group = groupById.get(related.from === event.id ? related.to : related.from);
      if (!group) {
        group = [...groups].reverse().find(candidate => String(candidate.event.date) <= String(event.date)) || groups[0];
      }
      if (group) group.branches.push(event);
    }
    return groups;
  }

  function renderOverview() {
    return `<section class="overview-heading"><div class="eyebrow">A living atlas / 年度总览</div><h1>每一年的变化，<br>都有继续展开的地方。</h1><p>先看年度关键词，再沿重要事件进入分支。产品、能力与人的经历共同组成这张地图；后来的影响，在各自的时间里补充。</p></section>
      ${rootEntry()}<div class="year-overview">${years.map(year => {
        const count = yearEvents(year.year).length;
        return `<button type="button" class="year-card" data-action="year" data-year="${escapeHTML(year.year)}"><span class="year-number">${escapeHTML(year.year)}</span><h2>${escapeHTML(year.keyword)}</h2><p>${escapeHTML(year.tagline || year.summary)}</p><span class="year-card-bottom"><span><span class="status ${escapeHTML(year.status)}">${escapeHTML(statusNames[year.status] || year.status)}</span><span class="source-meta">${count} 个已收录事件</span></span><span class="arrow" aria-hidden="true">↗</span></span></button>`;
      }).join('')}</div>`;
  }

  function renderYearStrip() {
    return `<nav class="year-strip" aria-label="选择年份">${events.some(event => event.tier === 'root') ? `<button type="button" class="year-tab" data-action="prehistory"${state.prehistory ? ' aria-current="page"' : ''}><strong>前史</strong><small>源头与方法</small></button>` : ''}${years.map(year => `<button type="button" class="year-tab" data-action="year" data-year="${escapeHTML(year.year)}"${!state.prehistory && Number(year.year) === state.year ? ' aria-current="page"' : ''}><strong>${escapeHTML(year.year)}</strong><small>${escapeHTML(year.keyword)}</small></button>`).join('')}</nav>`;
  }

  function renderEventCard(event, isBranch, branches = []) {
    const selected = state.eventId === event.id;
    const open = isExpanded(event.id);
    return `<article class="event-card${isBranch ? ' branch-card' : ''}${selected ? ' selected' : ''}"><button type="button" class="event-open" data-action="event" data-event="${escapeHTML(event.id)}" aria-label="查看${escapeHTML(event.title)}的详情"${selected ? ' aria-current="true"' : ''}>${eventMeta(event)}<h3>${escapeHTML(event.title)}</h3>${!isBranch || state.density === 'details' ? `<p class="event-summary">${escapeHTML(event.summary)}</p>` : ''}${state.density === 'details' && event.why_selected ? `<p class="event-why">入选原因 · ${escapeHTML(event.why_selected)}</p>` : ''}${event.roles?.length ? `<span class="role-labels">${eventRoles(event)}</span>` : ''}</button>${branches.length ? `<button type="button" class="branch-toggle" data-action="branch" data-event="${escapeHTML(event.id)}" aria-expanded="${open}" aria-controls="branches-${escapeHTML(event.id)}"><span>${open ? '收起' : '展开'} ${branches.length} 个同期与相关分支</span><span class="toggle-glyph" aria-hidden="true">${open ? '−' : '+'}</span></button>` : ''}</article>`;
  }

  function renderGroup(group) {
    const open = isExpanded(group.event.id);
    return `<li class="timeline-group">${renderEventCard(group.event, false, group.branches)}${group.branches.length ? `<div id="branches-${escapeHTML(group.event.id)}"${open ? '' : ' hidden'}>${open ? `<ul class="branches">${group.branches.map(event => `<li>${renderEventCard(event, true)}</li>`).join('')}</ul><p class="branch-caption">按相关性或时间就近收拢；具体关系请进入事件查看。</p>` : ''}</div>` : ''}</li>`;
  }

  function renderSources(ids) {
    const sources = [...new Set(ids)].map(id => sourcesById.get(id)).filter(Boolean);
    if (!sources.length) return '<p class="muted">本节点尚未附可查看的来源，不能据此视为完成核验。</p>';
    return `<ul class="source-list">${sources.map(source => `<li>${sourceLink(source)}<span class="source-meta">${escapeHTML(sourceKindNames[source.kind] || '公开来源')} ${source.published_at ? ` · 发布 ${escapeHTML(source.published_at)}` : ''}${source.accessed_at ? `<br>查阅 ${escapeHTML(source.accessed_at)}` : ''}</span>${source.scope ? `<div class="source-scope">${escapeHTML(source.scope)}</div>` : ''}</li>`).join('')}</ul>`;
  }

  function renderDetail(event) {
    const materials = (event.material_ids || []).map(id => materialsById.get(id)).filter(Boolean);
    const related = relations.filter(relation => relation.from === event.id || relation.to === event.id)
      .map(relation => ({ relation, target: eventsById.get(relation.from === event.id ? relation.to : relation.from) })).filter(item => item.target);
    const ids = [...(event.source_ids || []), ...(event.then?.source_ids || []), ...(event.later?.source_ids || []), ...materials.map(material => material.source_id), ...related.flatMap(item => item.relation.evidence_source_ids || [])];
    const repeatsSummary = event.then?.text && String(event.then.text).trim() === String(event.summary || '').trim();
    const laterHasEvidence = event.later && event.later.source_ids?.some(id => sourcesById.has(id));
    return `<aside class="detail-panel" aria-labelledby="detail-title"><div class="detail-head"><div class="detail-top"><div class="eyebrow">Event file / 事件档案</div><button type="button" class="close-detail" data-action="close">返回脉络 ×</button></div><h2 id="detail-title" tabindex="-1">${escapeHTML(event.title)}</h2>${eventMeta(event)}${event.date_basis ? `<p class="date-basis">${escapeHTML(dateBasisNames[event.date_basis] ? `日期性质：${dateBasisNames[event.date_basis]}` : '日期性质由来源说明')}</p>` : ''}${event.roles?.length ? `<div class="role-labels">${eventRoles(event)}</div>` : ''}</div>
      <div class="detail-body">${repeatsSummary ? '' : `<section class="detail-section"><h3>发生了什么</h3><p>${escapeHTML(event.summary)}</p></section>`}${event.why_selected ? `<section class="detail-section"><h3>为什么入选</h3><p>${escapeHTML(event.why_selected)}</p></section>` : ''}
      ${event.then?.text || event.later || event.roles?.includes('early-signal') ? `<section class="detail-section then-later">${event.then?.text ? `<div class="time-perspective"><h3>放回当时</h3><p>${escapeHTML(event.then.text)}</p>${sourceCues(event.then.source_ids)}</div>` : ''}${event.later ? `<div class="time-perspective"><h3 class="later-title">后来再看${event.later.as_of ? ` · 截至 ${escapeHTML(event.later.as_of)}` : ''}</h3><p>${escapeHTML(event.later.text)}</p>${sourceCues(event.later.source_ids)}${!laterHasEvidence ? '<p class="muted">后续影响的来源尚未补齐，当前保留为待核判断。</p>' : ''}</div>` : event.roles?.includes('early-signal') ? '<div class="time-perspective"><h3 class="later-title">后续影响待补</h3><p class="muted">当前只是值得跟踪的线索，尚不能据此称为已经证实的重大影响。</p></div>' : ''}</section>` : ''}
      ${materials.length ? `<section class="detail-section"><h3>声音与现场</h3>${materials.map(material => `<article class="material ${escapeHTML(material.kind)}"><span class="material-kind">${escapeHTML(materialNames[material.kind] || material.kind)}</span><h4>${escapeHTML(material.title)}</h4><p>${escapeHTML(material.text)}</p>${sourceCues([material.source_id])}</article>`).join('')}</section>` : ''}
      ${related.length ? `<section class="detail-section"><h3>沿关系继续</h3><div class="related-list">${related.map(({ relation, target }) => `<div><button type="button" class="related-event" data-action="event" data-event="${escapeHTML(target.id)}"><span class="related-type">${escapeHTML(relationNames[relation.type] || relation.type)} · ${escapeHTML(target.date_label || target.date)}</span><span class="related-title">${escapeHTML(target.title)} ↗</span>${relation.note ? `<span class="related-note">${escapeHTML(relation.note)}</span>` : ''}</button>${sourceCues(relation.evidence_source_ids)}</div>`).join('')}</div></section>` : ''}
      <section class="detail-section"><h3>来源与范围</h3>${renderSources(ids)}</section></div></aside>`;
  }

  function renderYear(year) {
    const groups = eventGroups(year);
    const selected = eventsById.get(state.eventId);
    return `${renderYearStrip()}<section class="year-hero"><div class="hero-year">${escapeHTML(year.year)}</div><div><div class="eyebrow">Year in focus / 年度主线</div><h1>${escapeHTML(year.keyword)}</h1>${year.tagline ? `<p class="tagline">${escapeHTML(year.tagline)}</p>` : ''}${year.summary ? `<p class="summary">${escapeHTML(year.summary)}</p>` : ''}</div><div class="hero-stats"><strong>${groups.length} / ${yearEvents(year.year).length}</strong><small>主节点 / 已收录事件</small></div></section>
      <div class="coverage"><span class="status ${escapeHTML(year.status)}">${escapeHTML(statusNames[year.status] || year.status)}</span><p>${escapeHTML(year.coverage_note || '本年度仍可继续补充，已收录不代表完整覆盖。')}</p></div>
      <div class="toolbar"><div class="density-control" role="group" aria-label="地图显示密度">${[['main', '主脉络'], ['branches', '展开分支'], ['details', '细节索引']].map(([id, label]) => `<button type="button" data-action="density" data-density="${id}" aria-pressed="${state.density === id}">${label}</button>`).join('')}</div><span class="map-help">点节点进入档案 · 点分支展开更多事件</span></div>
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
    const hash = `#${params.toString()}`;
    if (location.hash !== hash) {
      try { history.pushState(null, '', hash); } catch { location.hash = hash; }
    }
  }

  function readLocation() {
    const params = new URLSearchParams(location.hash.slice(1));
    const year = Number(params.get('year'));
    const event = eventsById.get(params.get('event'));
    state.overview = params.get('view') === 'years';
    state.prehistory = !state.overview && (params.get('view') === 'roots' || event?.tier === 'root');
    state.eventId = event?.id || null;
    state.year = event ? Number(event.year) : years.some(item => Number(item.year) === year) ? year : Number(fallbackYear?.year);
    if (event) expandEventGroup(event);
    render();
  }

  function expandEventGroup(event) {
    const year = years.find(item => Number(item.year) === Number(event.year));
    if (!year) return;
    const parent = eventGroups(year).find(group => group.branches.some(branch => branch.id === event.id));
    if (parent) state.expanded.add(parent.event.id);
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
    } else if (action === 'event') {
      const selected = eventsById.get(button.dataset.event);
      if (!selected) return;
      state.eventId = selected.id;
      state.prehistory = selected.tier === 'root';
      state.year = Number(selected.year);
      state.overview = false;
      expandEventGroup(selected);
      announcement = `已打开事件档案：${selected.title}`;
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
        state.expanded = new Set(eventGroups(year).filter(group => group.branches.length).map(group => group.event.id));
        state.density = 'main';
      }
      if (currentlyOpen) state.expanded.delete(id);
      else state.expanded.add(id);
      announcement = currentlyOpen ? '已收起分支' : '已展开分支';
    } else return;

    render();
    if (!['density', 'branch'].includes(action)) writeLocation();
    announcer.textContent = announcement;
    if (action === 'event') {
      document.getElementById('detail-title')?.focus({ preventScroll: true });
      document.querySelector('.detail-panel')?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else if (action === 'density') focusMatching('density', 'density', state.density);
    else if (action === 'branch') focusMatching('branch', 'event', button.dataset.event);
    else if (action === 'close' && previousId) focusMatching('event', 'event', previousId);
    else document.getElementById('main-content').focus({ preventScroll: false });
  }

  app.addEventListener('click', handleAction);
  breadcrumbs.addEventListener('click', handleAction);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.eventId) {
      const id = state.eventId;
      state.eventId = null;
      render();
      writeLocation();
      focusMatching('event', 'event', id);
      announcer.textContent = '已关闭事件档案';
    }
  });
  window.addEventListener('popstate', readLocation);
  window.addEventListener('hashchange', readLocation);
  readLocation();
})();
