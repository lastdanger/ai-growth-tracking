(() => {
  'use strict';

  const content = window.AI_MAP_CONTENT;
  const app = document.getElementById('app');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const announcer = document.getElementById('announcer');
  const entry = document.getElementById('reading-entry');
  const guideToggle = document.getElementById('guide-toggle');
  if (!content || !Array.isArray(content.years) || !Array.isArray(content.events)) return;

  const years = [...content.years].sort((a, b) => Number(a.year) - Number(b.year));
  const events = [...content.events].sort(compareEvents);
  const eventsById = new Map(events.map(event => [event.id, event]));
  const sourcesById = new Map((content.sources || []).map(source => [source.id, source]));
  const materialsById = new Map((content.materials || []).map(material => [material.id, material]));
  const relations = content.relations || [];
  const routesById = new Map((content.reading_routes || []).map(route => [route.id, route]));
  const seriesById = new Map((content.series || []).map(series => [series.id, series]));
  const seriesTimeline = content.series_timeline;
  const reviewMark = seriesTimeline?.legend?.review;
  if (reviewMark?.color) app.style.setProperty('--review-fill', reviewMark.color);
  const timelineStops = new Map();
  const observationDays = new Set();
  if (seriesTimeline) {
    observationDays.add(seriesTimeline.as_of);
    for (const row of seriesTimeline.rows) {
      for (const entry of row.entries) {
        const event = eventsById.get(entry.event_id);
        const title = entry.label.startsWith(row.name) ? entry.label : `${row.name} · ${entry.label}`;
        const reviews = [];
        for (const id of event.material_ids) {
          const material = materialsById.get(id);
          const date = sourcesById.get(material.source_id).published_at;
          if (material.temporal_context === 'retrospective' && date > event.date && date <= seriesTimeline.as_of) {
            reviews.push({as_of: date, text: material.text, source_ids: [material.source_id]});
          }
        }
        if (event.later?.as_of <= seriesTimeline.as_of) reviews.push(event.later);
        reviews.sort((a, b) => a.as_of.localeCompare(b.as_of));
        timelineStops.set(event.id, {label: entry.label, kind: entry.kind, title, reviews});
        observationDays.add(event.date);
        for (const note of reviews) observationDays.add(note.as_of);
      }
    }
  }
  const topicsById = new Map((content.topics || []).map(topic => [topic.id, topic]));
  const laneNames = { models: '模型与能力', products: '产品与入口', people: '人群与文化', ecosystem: '开发与产业', governance: '制度与规则' };
  const roleNames = { milestone: '重要转折', 'public-impact': '社会回响', 'early-signal': '后续影响线索' };
  const statusNames = { reviewed: '代表事件已整理', seed: '起步事件选读', partial: '阶段整理中' };
  const dateBasisNames = { announcement: '发布/公告', event: '事件', paper: '论文提交', 'paper-release': '论文公开', commit: '代码提交', report: '报道', period: '时期观察', 'announcement-and-effective': '公布与施行', agreement: '协议文本' };
  const sourceKindNames = { official: '官方记录', paper: '研究论文', media: '公开报道与自述' };
  const relationNames = { uses: '采用关系', extends: '扩展关系', context: '背景关联', 'follow-up': '后续关联' };
  const materialNames = { quote: '原话', report: '材料摘记', demo: '演示记录' };
  const temporalNames = { contemporary: '同期材料', retrospective: '后来回看', undated: '材料日期或版本未完全确认' };
  const fallbackYear = years.find(year => Number(year.year) === 2023) || years[0];
  const taskExamples = [...topicsById.values()].flatMap(topic => topic.items.map(item => item.history?.title)).filter(Boolean).slice(0, 2);
  let state = { year: Number(fallbackYear?.year), eventId: null, routeId: null, topicId: null, topicOverview: false, overview: false, prehistory: false, seriesOverview: false, seriesId: null, seriesOrigin: null, density: 'main', toggledGroups: new Set() };
  const readingWays = [
    { section: 'years', label: '按年份', question: 'AI 这几年怎么变了？', example: `从 ${fallbackYear?.year} 年「${fallbackYear?.keyword}」读起`, href: `#year=${fallbackYear?.year}`, available: !!fallbackYear,
      icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18m-14 4h2m3 0h2"/>' },
    { section: 'series', label: '模型系列', question: '我用的模型有哪些变化？', example: seriesById.has('gpt') && seriesById.has('deepseek') ? '找 GPT、DeepSeek 等系列' : '沿一个熟悉的系列跨年读', href: '#view=series', available: seriesById.size || seriesTimeline,
      icon: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 7v10m0-2c7 0 12-2 12-7"/>' },
    { section: 'topics', label: '按问题读', question: '哪一步能交给 AI？', example: taskExamples.length ? `从${taskExamples.join('、')}读起` : '选一个手头的问题', href: '#view=topics', available: topicsById.size,
      icon: '<path d="m3 6 2 2 3-4m3 3h10M3 15l2 2 3-4m3 3h10"/>' }
  ].filter(way => way.available);
  const guideKey = 'ai-growth-tracking.guide-seen';
  let guideSeen = false;
  // 部分离线环境禁用存储，此时仅在本次打开期间记录选择。
  try { guideSeen = localStorage.getItem(guideKey) === '1'; } catch {}
  let guideReturn = null;
  const arrivalHint = document.createElement('aside');
  arrivalHint.className = 'arrival-hint';
  arrivalHint.setAttribute('aria-label', '阅读提示');
  arrivalHint.innerHTML = '<span></span><button type="button" data-show-guide>地图指南</button><button type="button" data-dismiss-guide>继续读</button>';

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

  function eventRoles(roles) {
    return roles.map(role => `<span class="role-tag${role === 'early-signal' ? ' signal' : ''}">${escapeHTML(roleNames[role] || role)}</span>`).join('');
  }

  function eventMeta(event) {
    const lane = Object.hasOwn(laneNames, event.lane) ? event.lane : 'ecosystem';
    return `<div class="event-meta"><time${!event.date_precision || event.date_precision === 'day' ? ` datetime="${escapeHTML(event.date)}"` : ''}>${escapeHTML(event.date_label || event.date)}</time><span class="lane lane-${lane}">${escapeHTML(laneNames[event.lane] || event.lane)}</span></div>`;
  }

  // 主脉络默认收起，其余密度默认展开；只记录读者对个别组的覆盖。
  function isExpanded(id) {
    const defaultOpen = state.density !== 'main';
    return state.toggledGroups.has(id) ? !defaultOpen : defaultOpen;
  }

  function setGroupExpanded(id, open) {
    if (open === (state.density !== 'main')) state.toggledGroups.delete(id);
    else state.toggledGroups.add(id);
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

  function topicHref(topic, eventId) {
    const params = new URLSearchParams({ topic: topic.id });
    if (eventId) params.set('event', eventId);
    return '#' + escapeHTML(params.toString());
  }

  function recentEventList(ids) {
    return `<ul class="recent-events">${ids.map(id => {
      const event = eventsById.get(id);
      return `<li><time datetime="${escapeHTML(event.date)}">${escapeHTML(event.date.slice(5))}</time><button type="button" data-action="event" data-event="${escapeHTML(id)}">${escapeHTML(event.title)}</button></li>`;
    }).join('')}</ul>`;
  }

  function renderRecentUpdate() {
    const update = content.recent_update;
    if (!update) return '';
    const [first, ...rest] = new Set([...update.featured_event_ids, ...update.event_ids]);
    const event = eventsById.get(first);
    return `<section class="recent-update" aria-labelledby="recent-heading"><div class="issue-stamp"><small>选材截至</small><time datetime="${escapeHTML(update.as_of)}"><small>${escapeHTML(update.as_of.slice(0, 4))}</small>${escapeHTML(update.as_of.slice(5).replace('-', '.'))}</time></div>
      <div class="issue-body"><h2 id="recent-heading">最近一期</h2>
      ${event ? `<button type="button" class="issue-feature" data-action="event" data-event="${escapeHTML(first)}">${escapeHTML(event.title)} <span aria-hidden="true">→</span></button>` : ''}
      <details data-fold="recent-more"><summary>本期导读${rest.length ? `与其余 ${rest.length} 项` : ''}</summary><p>${escapeHTML(update.summary)}</p>${rest.length ? recentEventList(rest) : ''}</details></div></section>`;
  }

  function renderTopicDirectory() {
    const links = [...topicsById.values()].map(topic => {
      const tasks = topic.items.map(item => item.history?.title).filter(Boolean);
      return `<a href="${topicHref(topic)}"><span><strong>${escapeHTML(topic.title)}</strong><small>${escapeHTML(tasks.join(' · ') || topic.intro)}</small></span><span aria-hidden="true">→</span></a>`;
    });
    return `<section class="topic-page"><header class="overview-heading section-head"><h1 id="topic-title" tabindex="-1">按问题读</h1><p>选一个手头的问题，看看 AI 能交付什么，还有哪一步得自己来。</p></header>
      ${links.length ? `<nav class="topic-list" aria-label="选择问题专题">${links.join('')}</nav>` : '<p>这里还没有收录问题专题。</p>'}</section>`;
  }

  function renderTopicCase(topic, item) {
    const event = eventsById.get(item.event_id);
    const eventLink = `<a href="${topicHref(topic, event.id)}" data-topic-event="${escapeHTML(event.id)}">${escapeHTML(event.title)}</a>`;
    const date = `<small>事件日期 · <time datetime="${escapeHTML(event.date)}">${escapeHTML(event.date)}</time></small>`;
    let heading = `<header>${date}<h2>${eventLink}</h2></header>`;
    if (item.history) {
      const steps = item.history.steps.map(step => {
        const source = sourcesById.get(step.source_id);
        const month = source.published_at.slice(0, 7);
        return `<li><time datetime="${month}">${month}</time><p>${escapeHTML(step.text)} <span class="topic-source">${sourceLink(source, '出处')}</span></p></li>`;
      }).join('');
      heading = `<header><h2>${escapeHTML(item.history.title)}</h2><small class="topic-scope">${escapeHTML(item.history.scope)}</small></header>
        <ol class="topic-steps">${steps}</ol>${date}<h3>${eventLink}</h3>`;
    }
    return `<article class="topic-case">${heading}
      <dl><dt class="task-output">实际拿到什么</dt><dd>${escapeHTML(item.deliverable)}</dd><dt class="task-human-step">人接下来做什么</dt><dd>${escapeHTML(item.human_step)}</dd><dt>依据</dt><dd>${escapeHTML(item.evidence)} <span class="topic-source">${sourceLink(sourcesById.get(item.source_id), '原始材料')}</span></dd></dl></article>`;
  }

  function renderTopic(topic, selected) {
    if (selected) {
      return `<section class="topic-file" aria-label="专题事件"><h1 class="section-head">按问题读 · ${escapeHTML(topic.title)}</h1>${renderDetail(selected)}</section>`;
    }
    const followUp = eventsById.get(topic.follow_up.event_id);
    return `<section class="topic-page" aria-labelledby="topic-title"><header class="overview-heading section-head"><div class="eyebrow">按问题读</div><h1 id="topic-title" tabindex="-1">${escapeHTML(topic.title)}</h1><p>${escapeHTML(topic.intro)}</p></header>
      <div class="topic-comparison">${topic.items.map(item => renderTopicCase(topic, item)).join('')}</div>
      <footer class="topic-ending"><p>${escapeHTML(topic.outro)}</p><p>${escapeHTML(topic.follow_up.reason)}</p><a href="${topicHref(topic, followUp.id)}" data-topic-event="${escapeHTML(followUp.id)}">${escapeHTML(followUp.title)} ↗</a></footer></section>`;
  }

  function renderOverview() {
    return `${renderRecentUpdate()}
      <div class="atlas-caption"><h2>年度时间线</h2><small>年份 → 主线 → 事件与来源 · 各年持续补充</small></div>
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
    const cardRoles = event.roles.filter(role => event.tier !== 'branch' || role !== 'milestone');
    return `<article class="event-card${isBranch ? ' branch-card' : ''}${selected ? ' selected' : ''}"><button type="button" class="event-open" data-action="event" data-event="${escapeHTML(event.id)}" aria-label="查看${escapeHTML(event.title)}的详情"${selected ? ' aria-current="true"' : ''}>${eventMeta(event)}<h3>${escapeHTML(event.title)}</h3>${!isBranch || state.density === 'details' ? `<p class="event-summary">${escapeHTML(event.summary)}</p>` : ''}${state.density === 'details' && event.why_selected ? `<p class="event-why">入选原因 · ${escapeHTML(event.why_selected)}</p>` : ''}${cardRoles.length ? `<span class="role-labels">${eventRoles(cardRoles)}</span>` : ''}</button>${branches.length ? `<button type="button" class="branch-toggle" data-action="branch" data-event="${escapeHTML(event.id)}" aria-expanded="${open}" aria-controls="branches-${escapeHTML(event.id)}"><span>${open ? '收起' : '展开'} ${branches.length} 个细节与后续</span><span class="toggle-glyph" aria-hidden="true">${open ? '−' : '+'}</span></button>` : ''}</article>`;
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

  function returnRoute() {
    const origin = state.routeOrigin;
    const route = routesById.get(origin?.routeId);
    return route?.steps.some(step => step.event_id === origin.eventId) ? route : null;
  }

  function routeButton(route, index, label) {
    return `<button type="button" class="route-button" data-action="route" data-route="${escapeHTML(route.id)}" data-event="${escapeHTML(route.steps[index].event_id)}">${escapeHTML(label)} <span aria-hidden="true">↗</span></button>`;
  }

  function renderRouteEntry(year) {
    const route = routesById.get(year.reading_route_id);
    return route ? `<section class="route-entry"><div><div class="eyebrow">一条推荐路线 · ${route.steps.length} 站</div><h2>${escapeHTML(route.title)}</h2><p>${escapeHTML(route.intro)}</p><p class="route-focus">这条路线看的是：${escapeHTML(route.focus)}</p></div>${routeButton(route, 0, '从第一站开始')}</section>` : '';
  }

  function routeBranch(branch, label) {
    return `<div class="route-branch"><div class="eyebrow">${escapeHTML(label)}</div><p>${escapeHTML(branch.reason)}</p><button type="button" class="route-button" data-action="event" data-event="${escapeHTML(branch.event_id)}">${escapeHTML(eventsById.get(branch.event_id).title)} ↗</button></div>`;
  }

  function renderRouteExit(event) {
    if (state.topicId) {
      const topic = topicsById.get(state.topicId);
      return `<section class="route-next"><a href="${topicHref(topic)}">回到专题对照</a><button type="button" class="route-button secondary" data-action="event-year" data-event="${escapeHTML(event.id)}">查看 ${event.year} 年背景 ↗</button></section>`;
    }
    if (state.seriesId || state.seriesOrigin) return renderSeriesExit(event);
    const route = activeRoute();
    if (!route) {
      const recommended = [...routesById.values()].find(route => route.steps.some(step => step.event_id === event.id));
      const index = recommended?.steps.findIndex(step => step.event_id === event.id);
      return recommended ? `<section class="route-next"><p>这件事也在推荐路线「${escapeHTML(recommended.title)}」里。</p>${routeButton(recommended, index, '从这里跟着读')}</section>` : '';
    }
    const index = route.steps.findIndex(step => step.event_id === event.id);
    const previous = index > 0 ? routeButton(route, index - 1, '上一站') : '';
    const step = route.steps[index];
    if (index + 1 < route.steps.length) return `<section class="route-next"><div class="eyebrow">接下来 · ${index + 2} / ${route.steps.length}</div><p>${escapeHTML(step.transition_to_next)}</p>${routeButton(route, index + 1, eventsById.get(route.steps[index + 1].event_id).title)}${step.explore ? routeBranch(step.explore, '也可以沿效果问题看分支') : ''}<div class="route-previous">${previous}</div></section>`;
    const next = route.continuation && routesById.get(route.continuation.route_id);
    return `<section class="route-next"><div class="eyebrow">这条路线读到这里</div><p>${escapeHTML(route.outro)}</p>${next ? `<div class="route-continuation"><div class="eyebrow">沿这个问题，继续到下一年</div><p>${escapeHTML(route.continuation.reason)}</p>${routeButton(next, 0, next.title)}</div>` : ''}<div class="route-exits">${route.exit_event_ids.map(id => routeBranch({event_id: id, reason: route.exit_notes[id].reason}, route.exit_notes[id].label)).join('')}</div><div class="route-previous">${previous}</div></section>`;
  }

  function renderMaterial(material) {
    const source = sourcesById.get(material.source_id);
    return `<article class="material ${escapeHTML(material.kind)}"><span class="material-kind" data-context="${escapeHTML(material.temporal_context)}">${escapeHTML(temporalNames[material.temporal_context])} · ${escapeHTML(materialNames[material.kind])}${source.published_at ? ` · ${escapeHTML(source.published_at)}` : ''}</span><h4>${escapeHTML(material.title)}</h4><p>${escapeHTML(material.text)}</p>${sourceCues([material.source_id])}</article>`;
  }

  function renderDetail(event) {
    const materials = event.material_ids.map(id => materialsById.get(id));
    const scene = event.scene_material_id ? materialsById.get(event.scene_material_id) : materials.find(material => material.temporal_context === 'contemporary');
    const additional = materials.filter(material => material !== scene);
    const related = relations.filter(relation => relation.from === event.id || relation.to === event.id)
      .map(relation => ({ relation, target: eventsById.get(relation.from === event.id ? relation.to : relation.from) })).filter(item => item.target);
    const picks = event.reading_picks || [];
    const rank = id => { const i = picks.findIndex(pick => pick.event_id === id); return i < 0 ? picks.length : i; };
    related.sort((a, b) => rank(a.target.id) - rank(b.target.id));
    const ids = [...event.source_ids, ...materials.map(material => material.source_id), ...related.flatMap(item => item.relation.evidence_source_ids || [])];
    const route = activeRoute();
    const originRoute = returnRoute();
    const returnHeader = originRoute ? `<div class="route-return"><span>从「${escapeHTML(originRoute.title)}」展开的分支</span>${routeButton(originRoute, originRoute.steps.findIndex(step => step.event_id === state.routeOrigin.eventId), `回到原路线 · 第 ${originRoute.steps.findIndex(step => step.event_id === state.routeOrigin.eventId) + 1} 站`)}</div>` : '';
    const routeHeader = route ? `<div class="route-progress"><span>${escapeHTML(route.title)}<strong>第 ${route.steps.findIndex(step => step.event_id === event.id) + 1} / ${route.steps.length} 站 · ${event.year}</strong></span><button type="button" data-action="leave-route">自由浏览</button></div>` : '';
    const relatedCard = ({relation, target}) => {
      const pick = picks.find(pick => pick.event_id === target.id);
      const showNote = relation.note !== pick?.reason;
      return `<div><button type="button" class="related-event" data-action="event" data-event="${escapeHTML(target.id)}"><span class="related-type">${escapeHTML(pick?.label || (relation.type === 'follow-up' && relation.to === event.id ? '前序事件' : relationNames[relation.type]))} · ${escapeHTML(target.date_label || target.date)}</span><span class="related-title">${escapeHTML(target.title)} ↗</span>${pick ? `<span class="related-prompt">${escapeHTML(pick.reason)}</span>` : ''}${showNote ? `<span class="related-note">${escapeHTML(relation.note)}</span>` : ''}</button>${sourceCues(relation.evidence_source_ids)}</div>`;
    };
    return `<aside class="detail-panel" aria-labelledby="detail-title">${returnHeader}${routeHeader}<div class="detail-head"><div class="detail-top"><div class="eyebrow">Event file / 事件</div><button type="button" class="close-detail" data-action="close">${state.topicId ? '返回专题' : '返回脉络'} ×</button></div><h2 id="detail-title" tabindex="-1">${escapeHTML(event.title)}</h2>${eventMeta(event)}</div>
      <div class="detail-body">${scene ? `<section class="detail-section scene">${renderMaterial(scene)}</section>` : ''}
      ${!event.change ? `<section class="detail-section"><h3>发生了什么</h3><p>${escapeHTML(event.summary)}</p>${sourceCues(event.source_ids)}</section>` : ''}
      ${renderPerspective(!event.change || seriesTimeline?.focus_event_ids.includes(event.id) ? '放回当时' : '发生的变化', event.then)}
      ${event.change ? `<section class="detail-section"><h3>为什么重要</h3><p>${escapeHTML(event.change)}</p>${sourceCues(event.then.source_ids)}</section>` : ''}
      ${event.later ? renderPerspective(`后来再看 · 截至 ${event.later.as_of}`, event.later, true) : ''}
      ${renderRouteExit(event)}${renderSeriesMembership(event)}
      ${additional.length ? `<details class="reading-fold" data-fold="materials"><summary>更多声音与材料 · ${additional.length}</summary>${additional.map(renderMaterial).join('')}</details>` : ''}
      ${related.length ? `<section class="detail-section related-reading"><h3>相关探索</h3><div class="related-list">${related.slice(0, 3).map(relatedCard).join('')}${related.length > 3 ? `<details class="reading-fold" data-fold="relations"><summary>其他关联 · ${related.length - 3}</summary>${related.slice(3).map(relatedCard).join('')}</details>` : ''}</div></section>` : ''}
      <details class="reading-fold" data-fold="sources"><summary>完整来源与范围 · ${new Set(ids).size}</summary>${renderSources(ids)}</details>
      <details class="reading-fold" data-fold="editorial"><summary>选材说明与日期</summary><p>${escapeHTML(event.why_selected)}</p><p>${escapeHTML(dateBasisNames[event.date_basis] || event.date_basis)} · ${escapeHTML(event.date_label)}</p><div class="role-labels">${eventRoles(event.roles)}</div></details></div></aside>`;
  }

  function seriesButton(series, label, eventId = null) {
    return `<button type="button" class="route-button" data-action="series" data-series="${escapeHTML(series.id)}"${eventId ? ` data-event="${escapeHTML(eventId)}"` : ''}>${escapeHTML(label)} ↗</button>`;
  }

  function renderSeriesMembership(event) {
    const memberships = [...seriesById.values()].filter(s => s.id !== state.seriesId && s.entries.some(e => e.event_id === event.id));
    return memberships.length ? `<details class="reading-fold" data-fold="series-memberships"><summary>沿模型系列跨年阅读 · ${memberships.length}</summary>${memberships.map(s => `<p>${escapeHTML(s.question)}</p>${seriesButton(s, s.name, event.id)}`).join('')}</details>` : '';
  }

  function renderSeriesExit(event) {
    const series = seriesById.get(state.seriesId);
    const origin = seriesById.get(state.seriesOrigin?.seriesId);
    const yearLink = `<button type="button" class="route-button secondary" data-action="event-year" data-event="${escapeHTML(event.id)}">查看 ${event.year} 年背景 ↗</button>`;
    if (!series) {
      const originEvent = eventsById.get(state.seriesOrigin.eventId);
      const question = origin.exit?.event_id === event.id ? origin.exit.reason : originEvent.reading_picks?.find(pick => pick.event_id === event.id)?.reason;
      return `<section class="route-next"><div class="eyebrow">从 ${escapeHTML(origin.name)} 展开的相关事件</div>${question ? `<p>${escapeHTML(question)}</p>` : ''}<p>带着这条线索，回到「${escapeHTML(originEvent.title)}」接着读。</p>${seriesButton(origin, '返回系列原站', state.seriesOrigin.eventId)}${yearLink}</section>`;
    }
    const keys = series.entries.filter(e => e.level === 'key');
    const current = series.entries.find(e => e.event_id === event.id);
    const position = series.entries.indexOf(current);
    const next = series.entries.slice(position + 1).find(e => e.level === 'key');
    const previous = series.entries.slice(0, position).filter(e => e.level === 'key').at(-1);
    if (current.level === 'supporting') {
      const target = eventsById.get(current.return_to.event_id);
      return `<section class="route-next"><div class="eyebrow">${escapeHTML(series.name)} · 补充阅读之后</div><p>${escapeHTML(current.return_to.reason)}</p>${seriesButton(series, `回到关键站 · ${target.title}`, target.id)}${yearLink}</section>`;
    }
    const onward = next
      ? `<p>${escapeHTML(current.transition_to_next)}</p>${seriesButton(series, eventsById.get(next.event_id).title, next.event_id)}`
      : `<div class="series-ending"><h3>这条线读到这里</h3><p>${escapeHTML(series.outro)}</p>${routeBranch(series.exit, series.exit.label)}${seriesButton(series, '回到系列总览')}</div>`;
    return `<section class="route-next"><div class="eyebrow">${escapeHTML(series.name)} · 第 ${keys.indexOf(current) + 1} / ${keys.length} 个关键站</div>${onward}${previous ? `<div class="route-previous">${seriesButton(series, '上一关键站', previous.event_id)}</div>` : ''}${yearLink}</section>`;
  }

  function renderPerspective(title, note, later = false) {
    const paragraphs = note.text.split('\n\n').map(p => `<p>${escapeHTML(p)}</p>`).join('');
    const symbol = later && reviewMark ? `<span aria-hidden="true">${escapeHTML(reviewMark.symbol)}</span> ` : '';
    return `<section class="detail-section${later ? ' later-reading' : ''}"><h3>${symbol}${escapeHTML(title)}</h3>${paragraphs}${sourceCues(note.source_ids)}</section>`;
  }

  function timelineHref(day, eventId) {
    const params = new URLSearchParams({view: 'series'});
    if (day !== seriesTimeline.as_of) params.set('until', day);
    if (eventId) params.set('event', eventId);
    return '#' + params.toString();
  }

  function renderTimelineReading(event, day) {
    if (!event) return '';
    const stop = timelineStops.get(event.id);
    const review = stop.reviews.filter(note => note.as_of <= day).map(note =>
      renderPerspective(`后来再看 · 截至 ${note.as_of}`, note, true)).join('');
    const next = stop.reviews.find(note => note.as_of > day);
    return `<article class="calendar-reading" aria-labelledby="timeline-reading-title">
      <div class="calendar-head"><h2 id="timeline-reading-title" tabindex="-1">${escapeHTML(stop.title)}</h2>
      <a data-action="close" href="${escapeHTML(timelineHref(day))}">返回时间线 ×</a></div>
      ${renderPerspective(`放回当时 · ${event.date}`, event.then)}${review}
      ${next ? `<p><a href="${escapeHTML(timelineHref(next.as_of, event.id))}">读到 ${escapeHTML(next.as_of)}，看看后来有什么变化 →</a></p>` : ''}
      <button type="button" class="route-button secondary" data-action="event-year" data-event="${escapeHTML(event.id)}">在年度地图中读完整档案 ↗</button></article>`;
  }

  function timelineBadge(key, mark) {
    return `<span class="calendar-badge" data-mark="${escapeHTML(key)}" style="--mark-color:${escapeHTML(mark.color || 'var(--control-fill)')}"><span aria-hidden="true" class="calendar-symbol">${escapeHTML(mark.symbol)}</span> ${escapeHTML(mark.label)}</span>`;
  }

  function renderTimelineLegend(legend) {
    if (!legend) return '';
    return `<div class="calendar-legend" role="group" aria-label="时间线图例">
      <div><strong>事件类型</strong>${Object.entries(legend.kinds).map(([key, mark]) => timelineBadge(key, mark)).join('')}</div>
      <div><strong>阅读状态</strong>${timelineBadge('review', legend.review)}</div></div>`;
  }

  function renderSeriesTimeline() {
    if (!seriesTimeline) return '';
    const day = state.timelineDay || seriesTimeline.as_of;
    const months = seriesTimeline.months;
    const legend = seriesTimeline.legend;
    const selected = eventsById.get(state.eventId);
    const options = [...observationDays].sort().map(date =>
      `<option value="${date}"${date === day ? ' selected' : ''}>${date}</option>`).join('');
    const rows = seriesTimeline.rows.map(row => {
      const entries = row.entries.map(entry => eventsById.get(entry.event_id))
        .filter(event => event.date <= day).sort(compareEvents);
      const cells = months.map(month => {
        const stops = entries.filter(event => event.date.startsWith(month)).map(event => {
          const date = new Date(event.date + 'T00:00:00Z');
          const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
          const position = (date.getUTCDate() - 0.5) / daysInMonth * 100;
          const stop = timelineStops.get(event.id);
          const kind = legend?.kinds[stop.kind];
          const reviewed = legend && stop.reviews.some(note => note.as_of <= day);
          const name = [stop.title, event.date, kind?.label, reviewed && legend.review.label].filter(Boolean).join('，');
          return `<a class="calendar-stop" data-timeline-stop="${escapeHTML(event.id)}" aria-label="${escapeHTML(name)}" href="${escapeHTML(timelineHref(day, event.id))}"${selected?.id === event.id ? ' aria-current="true"' : ''} style="--day:${position.toFixed(2)}%;--mark-color:${escapeHTML(kind?.color || 'var(--control-fill)')}">
            ${kind ? timelineBadge(stop.kind, kind) : ''}<span class="calendar-label">${escapeHTML(stop.label)}</span>
            <span class="calendar-date"><time datetime="${event.date}">${event.date.slice(5).replace('-', '.')}</time>${reviewed ? timelineBadge('review', legend.review) : ''}</span>
            <span class="calendar-axis" aria-hidden="true"></span></a>`;
        }).join('');
        return `<td>${stops}</td>`;
      }).join('');
      return `<tr><th scope="row">${escapeHTML(row.name)}</th>${cells}</tr>`;
    }).join('');
    const trials = seriesTimeline.focus_event_ids.filter(id => eventsById.get(id).date <= day)
      .map(id => `<a href="${escapeHTML(timelineHref(day, id))}">${escapeHTML(timelineStops.get(id).title)}</a>`);
    return `<section class="series-calendar" aria-labelledby="calendar-title"><div class="calendar-head">
      <h2 id="calendar-title">跨系列大事时间线</h2><label>观察至 <select id="timeline-day">${options}</select></label></div>
      <p class="calendar-guide">横着看一家，按列比同月。每张卡片底部的点标出月内日期。${legend ? '日期旁标有“' + escapeHTML(legend.review.label) + '”时，点开可读后续。' : ''}空格表示截至观察日尚无入选事件。</p>
      ${renderTimelineLegend(legend)}
      <div class="calendar-scroll"><table class="calendar-grid" role="table" aria-labelledby="calendar-title" style="--months:${months.length}"><thead><tr><th scope="col">系列</th>${months.map(m => `<th scope="col">${escapeHTML(m.replace('-', '.'))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      ${trials.length ? `<p class="calendar-trials">首发与回看试读　${trials.join('　·　')}</p>` : ''}
      ${renderTimelineReading(selected, day)}</section>`;
  }

  function renderSeriesDirectory() {
    return `<section class="overview-heading section-head"><div class="eyebrow">模型系列</div><h1>模型怎样走到这一步？</h1><p>把几家的关键进展放在同一段日历上读，也可以沿一个系列跨年追踪。</p></section>${renderSeriesTimeline()}<h2 class="series-directory-title">沿一个系列跨年读</h2><div class="series-grid">${[...seriesById.values()].map(s => {
      const latest = eventsById.get(s.entries.at(-1).event_id);
      return `<article class="series-card"><div class="eyebrow">${escapeHTML(s.provider)}</div><h2>${escapeHTML(s.name)}</h2><p class="series-question">${escapeHTML(s.question)}</p><div class="series-latest"><small>最近收录 · ${escapeHTML(latest.date_label)}</small><p><a href="#series=${encodeURIComponent(s.id)}&amp;event=${encodeURIComponent(latest.id)}">${escapeHTML(latest.title)}</a></p></div><small>${s.entries.filter(e => e.level === 'key').length} 个关键站 · 核验截至 ${escapeHTML(s.as_of)}</small>${seriesButton(s, '沿系列阅读')}</article>`;
    }).join('')}</div>`;
  }

  function renderSeries(series) {
    const periods = new Map();
    for (const entry of series.entries) {
      const event = eventsById.get(entry.event_id);
      if (!periods.has(event.year)) periods.set(event.year, []);
      periods.get(event.year).push({entry, event});
    }
    const selected = eventsById.get(state.eventId);
    return `<nav class="year-strip" aria-label="选择模型系列">${[...seriesById.values()].map(s => `<button type="button" class="year-tab" data-action="series" data-series="${s.id}"${s.id === series.id ? ' aria-current="page"' : ''}><strong>${escapeHTML(s.name)}</strong><small>${escapeHTML(s.provider)}</small></button>`).join('')}</nav><section class="series-hero section-head"><div class="eyebrow">${escapeHTML(series.provider)} / 跨年脉络</div><h1>${escapeHTML(series.name)}</h1><p class="tagline">${escapeHTML(series.question)}</p><p>${escapeHTML(series.intro)}</p></section><div class="coverage"><span class="status partial">精选脉络</span><p>${escapeHTML(series.coverage_note)}</p></div><div class="workspace${selected ? ' has-detail' : ''}"><section class="map-board" aria-label="${escapeHTML(series.name)}跨年时间线"><div class="board-caption">关键站默认展开 · 补充事件按日期穿插 · 点击查看共用档案</div>${[...periods].map(([year, items]) => `<section class="series-period"><h2 class="series-year">${year}</h2><ol class="timeline">${items.map(({entry,event}) => `<li class="timeline-group${entry.level === 'supporting' ? ' series-supporting' : ''}">${entry.level === 'supporting' ? `<details class="series-fold" data-fold="series-${event.id}"${event.id === state.eventId ? ' open' : ''}><summary><span>${escapeHTML(event.date_label)} · 补充</span>${escapeHTML(event.title)}</summary>` : ''}<p class="series-reason">${escapeHTML(entry.reason)}</p>${renderEventCard(event, false)}${entry.level === 'supporting' ? '</details>' : ''}</li>`).join('')}</ol></section>`).join('')}</section>${selected ? renderDetail(selected) : ''}</div>`;
  }

  function guideIsOpen() {
    return !!guideReturn || (!guideSeen && state.overview);
  }

  function finishGuide() {
    guideReturn = null;
    if (guideSeen) return;
    guideSeen = true;
    try { localStorage.setItem(guideKey, '1'); } catch {}
  }

  function contextualHint(section) {
    if (state.eventId) {
      if (state.seriesOverview) return '你在跨系列时间线的一个节点。先读「放回当时」，再看截至观察日有哪些后续。';
      return '你打开了一条事件档案。往下读当时的材料，也可以展开「完整来源与范围」。';
    }
    if (section === 'topics') return state.topicId ? '你在一个问题专题。点案例里的事件标题，可以查到当时的记录和出处。' : '你在问题目录。选一个手头的问题，看 AI 能交付什么。';
    if (section === 'series') return state.seriesId ? `你在 ${seriesById.get(state.seriesId).name} 的发展脉络。点一个关键站，读当时的变化。` : '你在模型系列。可以先对照同月的进展，也可以选一家沿时间读。';
    return state.prehistory ? '你在前史线索。点开节点，看看它和后来的变化有什么联系。' : `你在 ${state.year} 年的时间线。点一条事件，看当时的记录和出处。`;
  }

  function renderReadingEntry() {
    const section = state.topicId || state.topicOverview ? 'topics' : state.seriesId || state.seriesOverview ? 'series' : state.overview ? '' : 'years';
    const open = guideIsOpen();
    app.dataset.section = section;
    entry.classList.toggle('guide-open', open);
    guideToggle.hidden = false;
    guideToggle.textContent = open ? (state.overview ? '先自己逛' : '收起指南') : '地图指南';
    guideToggle.setAttribute('aria-expanded', String(open));
    const heading = state.overview ? 'h1' : 'h2';
    const intro = content.site_intro || '沿着有日期和出处的事件，看 AI 怎样走进工作和生活。';
    const links = readingWays.map(way => {
      const active = section === way.section;
      const href = !open && active && section === 'years' ? (state.prehistory ? '#view=roots' : `#year=${state.year}`) : way.href;
      return `<a class="reading-way" href="${escapeHTML(href)}" data-section="${way.section}"${active ? ' aria-current="location"' : ''}><span class="way-label"><svg aria-hidden="true" focusable="false" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${way.icon}</svg>${way.label}</span>
        ${open ? `<strong>${escapeHTML(way.question)}</strong><span class="way-example">${escapeHTML(way.example)} <span aria-hidden="true">→</span></span>` : ''}</a>`;
    });
    entry.innerHTML = `${open ? `<${heading} id="guide-title" tabindex="-1">你想从哪里读起？</${heading}><p>${escapeHTML(intro)}</p>` : state.overview ? '<h1 class="sr-only">AI 时代探索地图</h1>' : ''}
      <nav class="reading-ways" aria-label="浏览方式">${links.join('')}</nav>`;
    // 事件深链会直接滚到档案，因此提示跟随读者实际落脚的位置。
    arrivalHint.hidden = open || guideSeen || state.overview;
    if (!arrivalHint.hidden) {
      const eventHead = state.eventId && app.querySelector('.detail-head, .calendar-reading .calendar-head');
      arrivalHint.dataset.section = section;
      arrivalHint.firstElementChild.textContent = contextualHint(section);
      arrivalHint.querySelector('[data-show-guide]').hidden = !eventHead;
      (eventHead || entry).after(arrivalHint);
    }
  }

  function toggleGuide(fromHint = false) {
    const returning = guideReturn;
    if (guideIsOpen()) {
      finishGuide();
      renderReadingEntry();
      if (returning) window.scrollTo({ top: returning.scrollY, behavior: 'instant' });
      if (returning?.fromHint) focusReadingTitle();
      else guideToggle.focus({ preventScroll: true });
    } else {
      guideReturn = { scrollY, fromHint };
      renderReadingEntry();
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('guide-title').focus({ preventScroll: true });
    }
  }

  function focusReadingTitle() {
    const title = app.querySelector('#detail-title, #timeline-reading-title') || app.querySelector('h1') || document.getElementById('main-content');
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }

  function renderYear(year) {
    const groups = eventGroups(year);
    const selected = eventsById.get(state.eventId);
    return `<header class="year-hero section-head"><div><div class="eyebrow">按年份 / 年度主线</div><h1><span class="hero-year">${escapeHTML(year.year)}</span> · ${escapeHTML(year.keyword)}</h1>${year.tagline ? `<p class="tagline">${escapeHTML(year.tagline)}</p>` : ''}</div><div class="hero-stats"><strong>${year.anchor_ids.length} / ${yearEvents(year.year).length}</strong><small>主节点 / 已收录事件</small></div></header>
      ${renderYearStrip()}<details class="year-context" data-fold="year-context-${year.year}"><summary><span class="status ${escapeHTML(year.status)}">${escapeHTML(statusNames[year.status] || year.status)}</span> 年度导读与收录范围${year.status === 'partial' ? ` · 截至 ${escapeHTML(year.as_of)}` : ''}</summary>
      ${year.lead || year.summary ? `<p>${escapeHTML(year.lead || year.summary)}</p>` : ''}<p>${escapeHTML(year.coverage_note || '本年度仍可继续补充，已收录不代表完整覆盖。')}</p></details>
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
    return `${renderYearStrip()}<section class="overview-heading roots-heading section-head"><div class="eyebrow">按年份 / 前史线索</div><h1>热潮之前，<br>一些方法已经开始生长。</h1><p>这里收录与后来事件有明确联系的早期节点。它们按发生时间展开，各自保留后续证据；这不是对早期每一个年份的完整总结。</p></section><div class="workspace${selected ? ' has-detail' : ''}"><section class="map-board" aria-label="前史时间脉络"><div class="board-caption">源头与方法 / 进入节点查看后续影响</div>${roots.length ? `<ol class="timeline">${roots.map(event => renderGroup({ event, branches: [] })).join('')}</ol>` : '<p class="empty-state">尚未收录前史节点。</p>'}</section>${selected ? renderDetail(selected) : ''}</div>`;
  }

  function render() {
    const year = years.find(item => Number(item.year) === state.year) || fallbackYear;
    if (!year && !state.prehistory) { app.innerHTML = '<p class="empty-state">尚未整理年度内容。</p>'; return; }
    const selected = eventsById.get(state.eventId);
    const series = seriesById.get(state.seriesId);
    const locationName = series?.name || (state.prehistory ? '前史线索' : `${year.year} · ${year.keyword}`);
    breadcrumbs.hidden = state.overview;
    breadcrumbs.innerHTML = `<a href="#view=years">地图首页</a>${!state.overview ? `<span aria-hidden="true">/</span><button type="button" data-action="${state.prehistory ? 'prehistory' : 'year'}"${state.prehistory ? '' : ` data-year="${escapeHTML(year.year)}"`}${!selected ? ' aria-current="page" class="current"' : ''}>${escapeHTML(locationName)}</button>` : ''}${!state.overview && selected ? `<span aria-hidden="true">/</span><span class="current" aria-current="page">${escapeHTML(selected.title)}</span>` : ''}`;
    const title = state.seriesOverview && selected ? timelineStops.get(selected.id).title : selected?.title;
    if (state.seriesOverview || series) breadcrumbs.innerHTML = `<button type="button" data-action="series-directory"${state.seriesOverview && !selected ? ' aria-current="page"' : ''}>模型系列</button>${series ? `<span>/</span><button type="button" data-action="series" data-series="${series.id}"${!selected ? ' aria-current="page"' : ''}>${escapeHTML(series.name)}</button>` : ''}${selected ? `<span>/</span><span class="current" aria-current="page">${escapeHTML(title)}</span>` : ''}`;
    const topic = topicsById.get(state.topicId);
    if (topic || state.topicOverview) {
      const trail = topic ? `<a href="#view=topics">按问题读</a><span>/</span>${selected ? `<a href="${topicHref(topic)}">${escapeHTML(topic.title)}</a><span>/</span>` : ''}<span class="current" aria-current="page">${escapeHTML(selected?.title || topic.title)}</span>` : '<span class="current" aria-current="page">按问题读</span>';
      breadcrumbs.innerHTML = `<a href="#view=years">地图首页</a><span>/</span>${trail}`;
    }
    app.innerHTML = topic ? renderTopic(topic, selected) : state.topicOverview ? renderTopicDirectory() : state.seriesOverview ? renderSeriesDirectory() : series ? renderSeries(series) : state.overview ? renderOverview() : state.prehistory ? renderPrehistory() : renderYear(year);
    renderReadingEntry();
    document.title = `${topic ? (title || topic.title) : state.topicOverview ? '按问题读' : state.seriesOverview ? (title || '模型系列') : state.overview ? 'AI 时代探索地图' : title || locationName} — 仍在生成`;
    document.getElementById('updated-at').textContent = content.updated_at ? `页面与文字更新 ${content.updated_at}` : '本地内容快照';
    document.getElementById('coverage-as-of').textContent = state.overview || state.prehistory ? '资料覆盖截止见各年，不代表已收齐最新事件' : `${year.year} 年资料覆盖核验截至 ${year.as_of} · 非全年穷尽`;
    if (series || state.seriesOverview) document.getElementById('coverage-as-of').textContent = series ? `${series.name} 选材核验截至 ${series.as_of} · 非完整版本目录` : '各系列分别标注核验截止与历史缺口';
    if (topic || state.topicOverview) document.getElementById('coverage-as-of').textContent = '事件日期与来源见各案例';
  }

  let restoring = false;
  let restoreFrame = 0;
  let renderedHash = location.hash;
  let scrollFrame = 0;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function rememberView() {
    if (restoring || renderedHash !== location.hash) return;
    const view = { hash: location.hash, density: state.density, toggledGroups: [...state.toggledGroups], scrollY: guideReturn?.scrollY ?? scrollY,
      detailScroll: document.querySelector('.detail-panel')?.scrollTop || 0,
      folds: [...document.querySelectorAll('[data-fold][open]')].map(item => item.dataset.fold) };
    try { history.replaceState({ mapView: view }, '', location.href); } catch { /* 部分离线环境禁用 History API。 */ }
  }

  function writeLocation() {
    const params = new URLSearchParams();
    if (state.topicId) {
      params.set('topic', state.topicId);
      if (state.eventId) params.set('event', state.eventId);
    } else if (state.topicOverview) params.set('view', 'topics');
    else if (state.seriesOverview) params.set('view', 'series');
    else if (state.seriesId) {
      params.set('series', state.seriesId);
      if (state.eventId) params.set('event', state.eventId);
    }
    else if (state.overview) params.set('view', 'years');
    else if (state.prehistory) {
      params.set('view', 'roots');
      if (state.eventId) params.set('event', state.eventId);
    } else {
      params.set('year', String(state.year));
      if (state.eventId) params.set('event', state.eventId);
    }
    if (activeRoute()) params.set('route', state.routeId);
    if (returnRoute() && state.eventId) {
      params.set('from_route', state.routeOrigin.routeId);
      params.set('from_event', state.routeOrigin.eventId);
    }
    if (state.seriesOrigin && state.eventId) {
      params.set('from_series', state.seriesOrigin.seriesId);
      params.set('from_event', state.seriesOrigin.eventId);
    }
    pushHash(`#${params.toString()}`);
    renderedHash = location.hash;
  }

  function pushHash(hash) {
    if (location.hash === hash) return;
    try { history.pushState(null, '', hash); } catch { location.hash = hash; }
  }

  function readLocation(focusTarget) {
    cancelAnimationFrame(restoreFrame);
    guideReturn = null;
    restoring = true;
    renderedHash = location.hash;
    const saved = history.state?.mapView;
    const view = saved?.hash === location.hash ? saved : null;
    const params = new URLSearchParams(location.hash.slice(1));
    const previousStop = state.seriesOverview ? state.eventId : null;
    const year = Number(params.get('year'));
    let event = eventsById.get(params.get('event'));
    const series = seriesById.get(params.get('series'));
    const topic = topicsById.get(params.get('topic'));
    state.topicOverview = params.get('view') === 'topics' && !params.has('series');
    if (state.topicOverview) event = null;
    state.topicId = !params.has('series') && !params.has('view') && topic ? topic.id : null;
    if (state.topicId && event && !topic.items.some(item => item.event_id === event.id) && topic.follow_up.event_id !== event.id) event = null;
    state.seriesOverview = params.get('view') === 'series' || (params.has('series') && !series);
    state.seriesId = !state.seriesOverview && series ? series.id : null;
    state.seriesOrigin = null;
    state.timelineDay = observationDays.has(params.get('until')) ? params.get('until') : seriesTimeline?.as_of;
    if (state.seriesOverview && (params.get('view') !== 'series' || !timelineStops.has(event?.id) || event.date > state.timelineDay)) event = null;
    // 非成员事件不能伪装为系列内节点；直接深链保留明确的返回来处。
    if (state.seriesId && event && !series.entries.some(e => e.event_id === event.id)) {
      state.seriesOrigin = {seriesId: series.id, eventId: series.entries.find(e => e.level === 'key').event_id};
      state.seriesId = null;
    }
    const originSeries = seriesById.get(params.get('from_series'));
    if (!state.seriesId && !state.seriesOverview && event && originSeries?.entries.some(e => e.event_id === params.get('from_event'))) {
      state.seriesOrigin = {seriesId: originSeries.id, eventId: params.get('from_event')};
    }
    state.overview = !state.topicId && !state.seriesOverview && !state.seriesId && !state.seriesOrigin && (params.get('view') === 'years' || (!params.has('year') && !params.has('event') && !params.has('view')));
    state.prehistory = !state.overview && (params.get('view') === 'roots' || event?.tier === 'root');
    state.eventId = event?.id || null;
    const route = routesById.get(params.get('route'));
    state.routeId = !state.seriesOverview && !state.seriesId && !state.seriesOrigin && !state.overview && route?.steps.some(step => step.event_id === event?.id) ? route.id : null;
    const origin = routesById.get(params.get('from_route'));
    const originId = params.get('from_event');
    state.routeOrigin = !state.seriesOverview && !state.seriesId && !state.seriesOrigin && !state.overview && event && !state.routeId && origin?.steps.some(step => step.event_id === originId) ? { routeId: origin.id, eventId: originId } : null;
    state.density = view?.density || 'main';
    const legacyExpanded = state.density === 'main' ? view?.expanded : [];
    state.toggledGroups = new Set(view?.toggledGroups || legacyExpanded || []);
    state.year = event ? Number(event.year) : years.some(item => Number(item.year) === year) ? year : Number(fallbackYear?.year);
    if (event && !view) expandEventGroup(event);
    render();
    for (const fold of document.querySelectorAll('[data-fold]')) fold.open = view?.folds?.includes(fold.dataset.fold) || fold.dataset.fold === `series-${state.eventId}`;
    restoreFrame = requestAnimationFrame(() => {
      restoreFrame = 0;
      const panel = document.querySelector('.detail-panel');
      if (focusTarget === 'timeline-day') {
        document.getElementById('timeline-day')?.focus();
      } else if (view) {
        window.scrollTo({ top: view.scrollY, behavior: 'instant' });
        if (panel) panel.scrollTop = view.detailScroll;
        if (state.seriesOverview && event) document.getElementById('timeline-reading-title')?.focus({ preventScroll: true });
        else if (state.seriesOverview && previousStop) app.querySelector(`[data-timeline-stop="${previousStop}"]`)?.focus({ preventScroll: true });
      } else if (state.seriesOverview && event) {
        document.getElementById('timeline-reading-title')?.focus();
      } else if (state.seriesOverview && previousStop) {
        const trigger = app.querySelector(`[data-timeline-stop="${previousStop}"]`) || document.getElementById('timeline-day');
        trigger?.focus();
      } else if (event && !state.overview) {
        if (state.topicId || state.seriesId) document.getElementById('detail-title')?.focus({ preventScroll: true });
        panel?.scrollIntoView({ block: 'start', behavior: 'instant' });
      } else {
        if (state.topicId || state.topicOverview || focusTarget === 'section') focusReadingTitle();
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      restoring = false;
      rememberView();
    });
  }

  function expandEventGroup(event) {
    const year = years.find(item => Number(item.year) === Number(event.year));
    if (!year) return;
    const parent = eventGroups(year).find(group => group.branches.some(branch => branch.id === event.id));
    if (parent) setGroupExpanded(parent.id, true);
  }

  function focusMatching(action, attribute, value) {
    const button = [...document.querySelectorAll(`[data-action="${action}"]`)].find(item => item.dataset[attribute] === value);
    button?.focus({ preventScroll: true });
  }

  function handleAction(event) {
    const button = event.target.closest('[data-action], a[href^="#topic="], a[href^="#series="], a[href^="#view="], a[href^="#year="]');
    if (!button) return;
    if (button.tagName === 'A') {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      cancelAnimationFrame(restoreFrame);
      restoring = false;
      rememberView();
      finishGuide();
      pushHash(button.getAttribute('href'));
      readLocation(button.closest('#reading-entry') ? 'section' : undefined);
      return;
    }
    const action = button.dataset.action;
    let previousId = state.eventId;
    // 快速导航取消上一页面尚未执行的滚动恢复，避免旧回调覆盖新视图。
    cancelAnimationFrame(restoreFrame);
    restoreFrame = 0;
    restoring = false;
    rememberView();
    const previousView = history.state?.mapView;
    const previousSeriesId = state.seriesId;
    const oldSeriesOrigin = state.seriesOrigin;
    const previousTopic = topicsById.get(state.topicId);
    if (!['density', 'branch'].includes(action)) finishGuide();
    state.topicOverview = false;
    if (action !== 'close') state.topicId = null;
    if (action === 'event' && state.seriesId) {
      const series = seriesById.get(state.seriesId);
      if (!series.entries.some(e => e.event_id === button.dataset.event)) {
        state.seriesOrigin = {seriesId: series.id, eventId: state.eventId || series.entries.find(e => e.level === 'key').event_id};
        state.seriesId = null;
      }
    } else if (!['event', 'density', 'branch', 'close'].includes(action)) {
      state.seriesId = null;
      state.seriesOrigin = null;
    }
    if (!['density', 'branch'].includes(action)) state.seriesOverview = false;
    if (action === 'event' && activeRoute()) state.routeOrigin = { routeId: state.routeId, eventId: state.eventId };
    else if (!['event', 'density', 'branch'].includes(action)) state.routeOrigin = null;
    if (!['route', 'density', 'branch'].includes(action)) state.routeId = null;
    let announcement = '';
    if (action === 'series-directory') {
      state.seriesOverview = true;
      state.timelineDay = seriesTimeline?.as_of;
      state.overview = false;
      state.prehistory = false;
      state.eventId = null;
      announcement = '已打开模型系列目录';
    } else if (action === 'series') {
      const series = seriesById.get(button.dataset.series);
      if (!series) return;
      state.seriesId = series.id;
      state.eventId = series.entries.some(e => e.event_id === button.dataset.event) ? button.dataset.event : null;
      state.overview = false;
      state.prehistory = false;
      announcement = `已打开 ${series.name} 跨年脉络`;
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
      state.toggledGroups.clear();
      announcement = `已切换到 ${state.year} 年`;
    } else if (action === 'event' || action === 'route' || action === 'event-year') {
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
      if (oldSeriesOrigin) {
        state.seriesId = oldSeriesOrigin.seriesId;
        state.seriesOrigin = null;
        state.prehistory = false;
        previousId = oldSeriesOrigin.eventId;
      }
      state.eventId = null;
      announcement = state.topicId ? '已返回专题对照' : state.seriesId ? '已返回系列脉络' : '已返回年度脉络';
    } else if (action === 'density') {
      state.density = button.dataset.density;
      state.toggledGroups.clear();
      announcement = `已切换显示密度：${button.textContent}`;
    } else if (action === 'branch') {
      const id = button.dataset.event;
      const currentlyOpen = isExpanded(id);
      setGroupExpanded(id, !currentlyOpen);
      announcement = currentlyOpen ? '已收起分支' : '已展开分支';
    } else return;

    render();
    // 返回补充节点时保留展开状态，确保关闭详情后的焦点仍落在可见卡片上。
    if (state.seriesId) {
      for (const fold of document.querySelectorAll('.series-fold[data-fold]')) {
        fold.open = (state.seriesId === previousSeriesId && previousView?.folds?.includes(fold.dataset.fold))
          || fold.dataset.fold === `series-${state.eventId}`
          || (action === 'close' && fold.dataset.fold === `series-${previousId}`);
      }
    }
    if (['density', 'branch'].includes(action)) {
      const panel = document.querySelector('.detail-panel');
      for (const fold of document.querySelectorAll('[data-fold]')) fold.open = previousView?.folds?.includes(fold.dataset.fold) || false;
      if (panel) panel.scrollTop = previousView?.detailScroll || 0;
    }
    if (!['density', 'branch'].includes(action)) writeLocation();
    announcer.textContent = announcement;
    if (action === 'event' || action === 'route' || action === 'event-year' || action === 'leave-route' || (action === 'series' && state.eventId)) {
      document.getElementById('detail-title')?.focus({ preventScroll: true });
      document.querySelector('.detail-panel')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (action === 'density') focusMatching('density', 'density', state.density);
    else if (action === 'branch') focusMatching('branch', 'event', button.dataset.event);
    else if (action === 'close' && previousId) {
      if (previousTopic) {
        const trigger = [...app.querySelectorAll('[data-topic-event]')].find(link => link.dataset.topicEvent === previousId);
        trigger?.focus({ preventScroll: true });
      } else focusMatching('event', 'event', previousId);
      document.activeElement?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    else document.getElementById('main-content').focus({ preventScroll: false });
    rememberView();
  }

  app.addEventListener('click', handleAction);
  entry.addEventListener('click', handleAction);
  document.querySelector('.brand').addEventListener('click', handleAction);
  guideToggle.addEventListener('click', () => toggleGuide());
  arrivalHint.addEventListener('click', event => {
    if (event.target.closest('[data-show-guide]')) toggleGuide(true);
    else if (event.target.closest('[data-dismiss-guide]')) {
      finishGuide();
      renderReadingEntry();
      focusReadingTitle();
    }
  });
  app.addEventListener('change', event => {
    if (event.target.id !== 'timeline-day') return;
    const day = event.target.value;
    const selected = eventsById.get(state.eventId);
    rememberView();
    finishGuide();
    pushHash(timelineHref(day, selected?.date <= day ? selected.id : null));
    readLocation('timeline-day');
    announcer.textContent = `时间线已显示至 ${day}`;
  });
  breadcrumbs.addEventListener('click', handleAction);
  document.querySelector('.skip-link')?.addEventListener('click', event => {
    // 地图用 hash 保存路线；跳过导航只移动焦点，不能覆盖阅读地址。
    event.preventDefault();
    document.getElementById('main-content').focus({ preventScroll: false });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.target instanceof HTMLSelectElement) return;
    if (guideIsOpen()) toggleGuide();
    else if (state.eventId) document.querySelector('[data-action="close"]')?.click();
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
