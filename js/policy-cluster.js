// ============================================================
// Policy Cluster & Strategic Analysis Module
// Provides: initPolicyClusterTab(DATA)
// ============================================================

(function () {
  'use strict';

  // ── Theme definitions ──────────────────────────────────────
  const THEMES = [
    {
      id: 'digital', name: '디지털 전환', cssClass: 'pc-theme-digital',
      color: '#2563eb', darkColor: '#4a9eff',
      keywords: [
        { word: '디지털', weight: 3 }, { word: '전환', weight: 2 }, { word: '스마트', weight: 2 },
        { word: '클라우드', weight: 2 }, { word: '빅데이터', weight: 2 }, { word: '데이터', weight: 1.5 },
        { word: 'DX', weight: 3 }, { word: '플랫폼', weight: 1.5 }, { word: '전산', weight: 1 },
        { word: '정보화', weight: 1.5 }, { word: '전자정부', weight: 2 }, { word: '디지털화', weight: 3 },
        { word: '온라인', weight: 1 }, { word: 'ICT', weight: 1.5 }, { word: '정보시스템', weight: 1.5 },
        { word: '메타버스', weight: 2 }, { word: '블록체인', weight: 2 }, { word: '디지털트윈', weight: 2.5 }
      ]
    },
    {
      id: 'talent', name: '인재 양성', cssClass: 'pc-theme-talent',
      color: '#7c3aed', darkColor: '#a78bfa',
      keywords: [
        { word: '인재', weight: 3 }, { word: '양성', weight: 2.5 }, { word: '교육', weight: 2 },
        { word: '훈련', weight: 2 }, { word: '연수', weight: 2 }, { word: '인력', weight: 2 },
        { word: '전문가', weight: 1.5 }, { word: '역량', weight: 1.5 }, { word: '학습', weight: 1.5 },
        { word: '대학', weight: 1 }, { word: '대학원', weight: 1.5 }, { word: '석박사', weight: 2 },
        { word: '커리큘럼', weight: 2 }, { word: '부트캠프', weight: 2 }, { word: '취업', weight: 1 },
        { word: '인력양성', weight: 3 }, { word: '저변확대', weight: 1.5 }
      ]
    },
    {
      id: 'infra', name: '인프라 구축', cssClass: 'pc-theme-infra',
      color: '#ea580c', darkColor: '#fb923c',
      keywords: [
        { word: '인프라', weight: 3 }, { word: '구축', weight: 2 }, { word: '센터', weight: 1 },
        { word: '네트워크', weight: 1.5 }, { word: '통신', weight: 1 }, { word: '시설', weight: 1 },
        { word: '기반', weight: 1 }, { word: '데이터센터', weight: 2.5 }, { word: 'GPU', weight: 2 },
        { word: '컴퓨팅', weight: 2 }, { word: '고성능', weight: 1.5 }, { word: '슈퍼컴', weight: 2.5 },
        { word: '5G', weight: 2 }, { word: '6G', weight: 2 }, { word: '광통신', weight: 1.5 },
        { word: '클라우드인프라', weight: 3 }, { word: '전산장비', weight: 1.5 }
      ]
    },
    {
      id: 'rnd', name: 'R&D 연구개발', cssClass: 'pc-theme-rnd',
      color: '#16a34a', darkColor: '#34d399',
      keywords: [
        { word: 'R&D', weight: 3 }, { word: '연구', weight: 2 }, { word: '개발', weight: 1.5 },
        { word: '기술개발', weight: 2.5 }, { word: '원천기술', weight: 3 }, { word: '핵심기술', weight: 2.5 },
        { word: '기초연구', weight: 2.5 }, { word: '응용연구', weight: 2 }, { word: '실증', weight: 1.5 },
        { word: '연구개발', weight: 3 }, { word: '혁신', weight: 1.5 }, { word: '과제', weight: 1 },
        { word: '선도기술', weight: 2.5 }, { word: '차세대', weight: 2 }, { word: '미래', weight: 1 },
        { word: '알고리즘', weight: 2 }, { word: '특허', weight: 1.5 }
      ]
    },
    {
      id: 'industry', name: '산업 적용/상용화', cssClass: 'pc-theme-industry',
      color: '#ca8a04', darkColor: '#fbbf24',
      keywords: [
        { word: '상용화', weight: 3 }, { word: '산업', weight: 1.5 }, { word: '적용', weight: 1.5 },
        { word: '사업화', weight: 2.5 }, { word: '시장', weight: 1.5 }, { word: '기업', weight: 1 },
        { word: '지원', weight: 0.8 }, { word: '중소기업', weight: 1.5 }, { word: '스타트업', weight: 2 },
        { word: '제조', weight: 1.5 }, { word: '생산', weight: 1 }, { word: '수출', weight: 1.5 },
        { word: '융합', weight: 1 }, { word: '바우처', weight: 2 }, { word: '실증', weight: 1.5 },
        { word: '보급', weight: 1.5 }, { word: '확산', weight: 1.5 }, { word: '활용', weight: 1 },
        { word: '도입', weight: 1 }
      ]
    },
    {
      id: 'safety', name: '안전/보안', cssClass: 'pc-theme-safety',
      color: '#dc2626', darkColor: '#f87171',
      keywords: [
        { word: '안전', weight: 2.5 }, { word: '보안', weight: 2.5 }, { word: '사이버', weight: 2 },
        { word: '보호', weight: 1.5 }, { word: '방어', weight: 2 }, { word: '감시', weight: 1.5 },
        { word: '탐지', weight: 1.5 }, { word: '재난', weight: 2 }, { word: '방재', weight: 2 },
        { word: '국방', weight: 2 }, { word: '군', weight: 1.5 }, { word: '무기', weight: 2 },
        { word: '정보보호', weight: 2.5 }, { word: '개인정보', weight: 2 }, { word: '해킹', weight: 2 },
        { word: '위험', weight: 1 }, { word: '대응', weight: 1 }, { word: '경찰', weight: 1.5 },
        { word: '치안', weight: 2 }, { word: '민군', weight: 2 }
      ]
    },
    {
      id: 'public', name: '공공서비스', cssClass: 'pc-theme-public',
      color: '#0891b2', darkColor: '#22d3ee',
      keywords: [
        { word: '공공', weight: 2 }, { word: '행정', weight: 1.5 }, { word: '민원', weight: 2 },
        { word: '복지', weight: 2 }, { word: '의료', weight: 2 }, { word: '건강', weight: 1.5 },
        { word: '교통', weight: 1.5 }, { word: '환경', weight: 1 }, { word: '문화', weight: 1 },
        { word: '서비스', weight: 1 }, { word: '국민', weight: 1.5 }, { word: '시민', weight: 1.5 },
        { word: '농업', weight: 1.5 }, { word: '수산', weight: 1.5 }, { word: '기상', weight: 1.5 },
        { word: '관세', weight: 1.5 }, { word: '세무', weight: 1.5 }, { word: '조달', weight: 1.5 }
      ]
    },
    {
      id: 'intl', name: '국제협력', cssClass: 'pc-theme-intl',
      color: '#db2777', darkColor: '#f472b6',
      keywords: [
        { word: '국제', weight: 3 }, { word: '협력', weight: 2 }, { word: '글로벌', weight: 2.5 },
        { word: '해외', weight: 2 }, { word: '수출', weight: 1.5 }, { word: '진출', weight: 2 },
        { word: 'ODA', weight: 3 }, { word: '개도국', weight: 2 }, { word: '다국적', weight: 2 },
        { word: '표준', weight: 1.5 }, { word: '국제표준', weight: 2.5 }, { word: '외교', weight: 2 },
        { word: 'UN', weight: 2 }, { word: 'OECD', weight: 2 }, { word: '세계', weight: 1.5 },
        { word: '교류', weight: 1.5 }
      ]
    }
  ];

  const THEME_COLORS = THEMES.map(t => t.color);
  const THEME_NAMES = THEMES.map(t => t.name);

  // ── Helpers (reuse globals) ────────────────────────────────
  function _fmt(v) { return typeof formatBillion === 'function' ? formatBillion(v) : (v / 100).toFixed(1) + '억'; }
  function _fmtN(v) { return typeof formatNumber === 'function' ? formatNumber(v) : v.toLocaleString('ko-KR'); }
  function _lbl() { return typeof getChartLabelColor === 'function' ? getChartLabelColor() : '#8899aa'; }
  function _grid() { return typeof getChartGridColor === 'function' ? getChartGridColor() : '#2a3a4e33'; }
  function _destroy(id) { if (typeof destroyChart === 'function') destroyChart(id); }
  function _b26(p) { return p.budget?.budget_2026 ?? p.budget?.['2026_budget'] ?? 0; }

  // Budget weight for a project in a specific theme (proportional to score)
  // If a project belongs to 3 themes with scores [10, 5, 5], theme1 gets 50%, theme2/3 get 25% each
  let _classMap = null; // set during init
  function _weightedB26(p, themeId) {
    if (!_classMap || !_classMap[p.id]) return _b26(p);
    const themes = _classMap[p.id];
    if (themes.length <= 1) return _b26(p);
    const totalScore = themes.reduce((s, t) => s + t.score, 0);
    const thisTheme = themes.find(t => t.themeId === themeId);
    if (!thisTheme || totalScore <= 0) return 0;
    return _b26(p) * (thisTheme.score / totalScore);
  }
  function _weightedB25(p, themeId) {
    if (!_classMap || !_classMap[p.id]) return _b25(p);
    const themes = _classMap[p.id];
    if (themes.length <= 1) return _b25(p);
    const totalScore = themes.reduce((s, t) => s + t.score, 0);
    const thisTheme = themes.find(t => t.themeId === themeId);
    if (!thisTheme || totalScore <= 0) return 0;
    return _b25(p) * (thisTheme.score / totalScore);
  }
  function _weightedB24(p, themeId) {
    if (!_classMap || !_classMap[p.id]) return _b24(p);
    const themes = _classMap[p.id];
    if (themes.length <= 1) return _b24(p);
    const totalScore = themes.reduce((s, t) => s + t.score, 0);
    const thisTheme = themes.find(t => t.themeId === themeId);
    if (!thisTheme || totalScore <= 0) return 0;
    return _b24(p) * (thisTheme.score / totalScore);
  }
  function _b25(p) { return p.budget?.budget_2025 ?? p.budget?.['2025_original'] ?? 0; }
  function _b24(p) { return p.budget?.budget_2024 ?? p.budget?.['2024_settlement'] ?? 0; }
  function _rate(p) { return p.budget?.change_rate ?? 0; }

  function _themeColor(themeId) {
    const t = THEMES.find(t => t.id === themeId);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return t ? (isDark ? t.darkColor : t.color) : '#888';
  }

  // ── Classification engine ──────────────────────────────────
  function classifyProject(p) {
    const text = [p.name || '', p.project_name || '', p.purpose || '', p.description || '',
      (p.keywords || []).join(' '), (p.ai_domains || []).join(' ')].join(' ');
    const results = [];
    for (const theme of THEMES) {
      let score = 0;
      for (const kw of theme.keywords) {
        const regex = new RegExp(kw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = text.match(regex);
        if (matches) score += matches.length * kw.weight;
      }
      // Bonus for R&D flag
      if (theme.id === 'rnd' && p.is_rnd) score += 5;
      if (score >= 2.5) results.push({ themeId: theme.id, score });
    }
    // Sort by score desc
    results.sort((a, b) => b.score - a.score);
    // If no match, assign to closest
    if (results.length === 0) {
      let best = { themeId: 'public', score: 0.1 };
      for (const theme of THEMES) {
        let s = 0;
        for (const kw of theme.keywords) {
          if (text.includes(kw.word)) s += kw.weight * 0.5;
        }
        if (s > best.score) best = { themeId: theme.id, score: s };
      }
      results.push(best);
    }
    return results;
  }

  function buildClassification(projects) {
    const map = {}; // projectId -> [{themeId, score}]
    const themeMap = {}; // themeId -> [project]
    THEMES.forEach(t => { themeMap[t.id] = []; });

    projects.forEach(p => {
      const themes = classifyProject(p);
      map[p.id] = themes;
      themes.forEach(t => {
        if (themeMap[t.themeId]) themeMap[t.themeId].push(p);
      });
    });
    return { map, themeMap };
  }

  // ── Chart instance management ──────────────────────────────
  const pcCharts = {};
  function pcDestroy(id) {
    if (pcCharts[id]) { pcCharts[id].destroy(); delete pcCharts[id]; }
    _destroy('pc-' + id);
  }

  // ── Sub-tab switching ──────────────────────────────────────
  let currentSubTab = 'theme-analysis';

  let _pendingRenders = {};

  function switchPcSubTab(tabId) {
    currentSubTab = tabId;
    document.querySelectorAll('#tab-policy .pc-sub-tab').forEach(b => b.classList.toggle('active', b.dataset.subtab === tabId));
    document.querySelectorAll('#tab-policy .pc-sub-content').forEach(c => c.classList.toggle('active', c.id === 'pc-' + tabId));
    // Execute deferred renders after tab is visible
    if (_pendingRenders[tabId]) {
      requestAnimationFrame(() => {
        _pendingRenders[tabId]();
        delete _pendingRenders[tabId];
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  // MAIN ENTRY POINT
  // ══════════════════════════════════════════════════════════
  function initPolicyClusterTab(DATA) {
    const container = document.getElementById('tab-policy');
    if (!container) return;

    const projects = DATA.projects || [];
    const { map: classMap, themeMap } = buildClassification(projects);
    _classMap = classMap; // store for weighted budget calculations

    // ── Build shell HTML ───────────────────────────────────
    container.innerHTML = `
      <div class="pc-sub-tabs">
        <button class="pc-sub-tab active" data-subtab="theme-analysis">테마별 분석</button>
        <button class="pc-sub-tab" data-subtab="portfolio">전략 포트폴리오</button>
        <button class="pc-sub-tab" data-subtab="performance">성과 연계 분석</button>
        <button class="pc-sub-tab" data-subtab="recommendations">정책 제언</button>
        <button class="pc-sub-tab" data-subtab="ai-pure">AI 순예산</button>
      </div>

      <!-- KPI summary -->
      <div class="pc-kpi-row" id="pc-kpi-row"></div>

      <!-- Sub-tab contents -->
      <div class="pc-sub-content active" id="pc-theme-analysis"></div>
      <div class="pc-sub-content" id="pc-portfolio"></div>
      <div class="pc-sub-content" id="pc-performance"></div>
      <div class="pc-sub-content" id="pc-recommendations"></div>
      <div class="pc-sub-content" id="pc-ai-pure"></div>
    `;

    // Sub-tab click handlers
    container.querySelectorAll('.pc-sub-tab').forEach(btn => {
      btn.addEventListener('click', () => switchPcSubTab(btn.dataset.subtab));
    });

    // ── Render KPI row ─────────────────────────────────────
    renderKPI(projects, themeMap);

    // ── Render all sub-tabs (defer D3 charts until visible) ─
    renderThemeAnalysis(projects, themeMap, classMap);
    // Portfolio & Performance have D3 charts that need visible container for clientWidth
    _pendingRenders['portfolio'] = () => renderPortfolio(projects, themeMap, classMap);
    _pendingRenders['performance'] = () => renderPerformance(projects, themeMap, classMap);
    renderRecommendations(projects, themeMap, classMap);
    _pendingRenders['ai-pure'] = () => renderAiPureBudget(projects);
  }

  // ══════════════════════════════════════════════════════════
  // KPI ROW
  // ══════════════════════════════════════════════════════════
  function renderKPI(projects, themeMap) {
    const el = document.getElementById('pc-kpi-row');
    if (!el) return;
    const totalBudget = projects.reduce((s, p) => s + _b26(p), 0);
    const themeCount = THEMES.filter(t => themeMap[t.id].length > 0).length;
    const maxTheme = THEMES.reduce((best, t) => themeMap[t.id].length > (themeMap[best.id]?.length || 0) ? t : best, THEMES[0]);
    const maxBudgetTheme = THEMES.reduce((best, t) => {
      const b = themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0);
      return b > (themeMap[best.id]?.reduce((s2, p2) => s2 + _weightedB26(p2, best.id), 0) || 0) ? t : best;
    }, THEMES[0]);

    // Diversity index (Shannon entropy normalized)
    const budgets = THEMES.map(t => themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0));
    const bTotal = budgets.reduce((a, b) => a + b, 0) || 1;
    let entropy = 0;
    budgets.forEach(b => { if (b > 0) { const p = b / bTotal; entropy -= p * Math.log2(p); } });
    const maxEntropy = Math.log2(THEMES.length);
    const diversity = Math.round((entropy / maxEntropy) * 100);

    el.innerHTML = `
      <div class="pc-kpi-item"><div class="pc-kpi-value">${themeCount}</div><div class="pc-kpi-label">활성 테마 수</div></div>
      <div class="pc-kpi-item"><div class="pc-kpi-value">${_fmtN(projects.length)}</div><div class="pc-kpi-label">분류 사업 수</div></div>
      <div class="pc-kpi-item"><div class="pc-kpi-value">${_fmt(totalBudget)}</div><div class="pc-kpi-label">총 예산</div></div>
      <div class="pc-kpi-item"><div class="pc-kpi-value" style="font-size:16px">${maxTheme.name}</div><div class="pc-kpi-label">최다 사업 테마</div></div>
      <div class="pc-kpi-item"><div class="pc-kpi-value" style="font-size:16px">${maxBudgetTheme.name}</div><div class="pc-kpi-label">최대 예산 테마</div></div>
      <div class="pc-kpi-item"><div class="pc-kpi-value">${diversity}%</div><div class="pc-kpi-label">투자 다양성 지수</div></div>
    `;
  }

  // ══════════════════════════════════════════════════════════
  // 1. THEME ANALYSIS SUB-TAB
  // ══════════════════════════════════════════════════════════
  function renderThemeAnalysis(projects, themeMap, classMap) {
    const el = document.getElementById('pc-theme-analysis');
    if (!el) return;

    el.innerHTML = `
      <div class="pc-section">
        <div class="pc-section-title"><span class="pc-icon">T</span> 정책 테마 자동 분류</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">사업 수는 중복 허용 (다중 테마 배정), 예산은 테마별 점수 비중으로 비례 배분</div>
        <div id="pc-theme-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px"></div>
      </div>
      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">테마별 예산 비중</div>
          <div class="chart-container" style="height:320px"><canvas id="pc-chart-theme-donut"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">테마별 사업 수 및 예산</div>
          <div class="chart-container" style="height:320px"><canvas id="pc-chart-theme-bar"></canvas></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">테마 x 부처 히트맵</div>
        <div class="pc-heatmap-wrap" id="pc-heatmap-container"></div>
      </div>
      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">테마별 예산 트렌드 (2024-2026)</div>
          <div class="chart-container" style="height:300px"><canvas id="pc-chart-theme-trend"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">투자 균형 스코어카드</div>
          <div id="pc-balance-scorecard"></div>
        </div>
      </div>
      <div class="card" id="pc-theme-detail-card" style="display:none">
        <div class="card-title" id="pc-theme-detail-title"></div>
        <div id="pc-theme-detail-body"></div>
      </div>
    `;

    renderThemeTags(themeMap);
    renderThemeDonut(themeMap);
    renderThemeBar(themeMap);
    renderHeatmap(projects, themeMap, classMap);
    renderThemeTrend(themeMap);
    renderBalanceScorecard(themeMap);
  }

  function renderThemeTags(themeMap) {
    const el = document.getElementById('pc-theme-tags');
    if (!el) return;
    el.innerHTML = THEMES.map(t => {
      const count = themeMap[t.id].length;
      const budget = themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0);
      return `<span class="pc-theme-tag ${t.cssClass}" data-theme="${t.id}" title="${t.name}: ${count}개 사업, ${_fmt(budget)}">${t.name} <b>${count}</b></span>`;
    }).join('');
    el.querySelectorAll('.pc-theme-tag').forEach(tag => {
      tag.addEventListener('click', () => showThemeDetail(tag.dataset.theme, themeMap));
    });
  }

  function showThemeDetail(themeId, themeMap) {
    const card = document.getElementById('pc-theme-detail-card');
    const title = document.getElementById('pc-theme-detail-title');
    const body = document.getElementById('pc-theme-detail-body');
    if (!card || !title || !body) return;
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    const ps = (themeMap[themeId] || []).sort((a, b) => _weightedB26(b, themeId) - _weightedB26(a, themeId));
    title.textContent = `${theme.name} - ${ps.length}개 사업 (${_fmt(ps.reduce((s, p) => s + _weightedB26(p, themeId), 0))})`;
    body.innerHTML = `<div class="pc-project-list">${ps.map(p =>
      `<div class="pc-project-row" onclick="if(typeof showProjectModal==='function')showProjectModal(${p.id})">
        <span class="proj-name">${p.name || p.project_name || ''}</span>
        <span class="proj-dept">${(p.department || '').substring(0, 8)}</span>
        <span class="proj-budget">${_fmt(_weightedB26(p, themeId))}</span>
      </div>`
    ).join('')}</div>`;
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderThemeDonut(themeMap) {
    pcDestroy('theme-donut');
    const canvas = document.getElementById('pc-chart-theme-donut');
    if (!canvas) return;
    const budgets = THEMES.map(t => themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0));
    const total = budgets.reduce((a, b) => a + b, 0) || 1;
    pcCharts['theme-donut'] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: THEME_NAMES,
        datasets: [{ data: budgets, backgroundColor: THEMES.map(t => _themeColor(t.id)), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'right', labels: { color: _lbl(), font: { size: 11, family: 'Pretendard Variable' }, padding: 10 } },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${_fmt(ctx.raw)} (${(ctx.raw / total * 100).toFixed(1)}%)` } }
        }
      }
    });
  }

  function renderThemeBar(themeMap) {
    pcDestroy('theme-bar');
    const canvas = document.getElementById('pc-chart-theme-bar');
    if (!canvas) return;
    const counts = THEMES.map(t => themeMap[t.id].length);
    const budgets = THEMES.map(t => themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0));
    pcCharts['theme-bar'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: THEME_NAMES,
        datasets: [
          { label: '사업 수', data: counts, backgroundColor: THEMES.map(t => _themeColor(t.id) + '99'), yAxisID: 'y' },
          { label: '예산 (백만원)', data: budgets, type: 'line', borderColor: '#f87171', pointBackgroundColor: '#f87171', borderWidth: 2, yAxisID: 'y1', tension: 0.3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: _lbl(), font: { size: 11, family: 'Pretendard Variable' } } },
          tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 1 ? `예산: ${_fmt(ctx.raw)}` : `사업 수: ${ctx.raw}개` } }
        },
        scales: {
          x: { ticks: { color: _lbl(), font: { size: 10, family: 'Pretendard Variable' }, maxRotation: 45 }, grid: { display: false } },
          y: { position: 'left', ticks: { color: _lbl() }, grid: { color: _grid() }, title: { display: true, text: '사업 수', color: _lbl() } },
          y1: { position: 'right', ticks: { color: '#f87171', callback: v => _fmt(v) }, grid: { display: false }, title: { display: true, text: '예산', color: '#f87171' } }
        }
      }
    });
  }

  function renderHeatmap(projects, themeMap, classMap) {
    const wrap = document.getElementById('pc-heatmap-container');
    if (!wrap) return;

    // Get departments with most projects
    const deptBudgets = {};
    projects.forEach(p => {
      const d = p.department || '기타';
      deptBudgets[d] = (deptBudgets[d] || 0) + _b26(p);
    });
    const depts = Object.entries(deptBudgets).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);

    // Build matrix: dept x theme -> budget
    const matrix = {};
    let maxVal = 0;
    depts.forEach(d => {
      matrix[d] = {};
      THEMES.forEach(t => {
        const budget = themeMap[t.id].filter(p => p.department === d).reduce((s, p) => s + _weightedB26(p, t.id), 0);
        matrix[d][t.id] = budget;
        if (budget > maxVal) maxVal = budget;
      });
    });

    function heatClass(val) {
      if (val <= 0) return 'pc-heat-0';
      const ratio = val / (maxVal || 1);
      if (ratio < 0.05) return 'pc-heat-1';
      if (ratio < 0.15) return 'pc-heat-2';
      if (ratio < 0.35) return 'pc-heat-3';
      if (ratio < 0.6) return 'pc-heat-4';
      return 'pc-heat-5';
    }

    let html = '<table class="pc-heatmap"><thead><tr><th>부처</th>';
    THEMES.forEach(t => { html += `<th>${t.name}</th>`; });
    html += '<th>합계</th></tr></thead><tbody>';
    depts.forEach(d => {
      const rowTotal = THEMES.reduce((s, t) => s + (matrix[d][t.id] || 0), 0);
      html += `<tr><td>${d.substring(0, 10)}</td>`;
      THEMES.forEach(t => {
        const v = matrix[d][t.id] || 0;
        html += `<td class="${heatClass(v)}" title="${d} / ${t.name}: ${_fmt(v)}">${v > 0 ? _fmt(v) : '-'}</td>`;
      });
      html += `<td style="font-weight:700">${_fmt(rowTotal)}</td></tr>`;
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  function renderThemeTrend(themeMap) {
    pcDestroy('theme-trend');
    const canvas = document.getElementById('pc-chart-theme-trend');
    if (!canvas) return;
    const datasets = THEMES.map(t => {
      const b24 = themeMap[t.id].reduce((s, p) => s + _weightedB24(p, t.id), 0);
      const b25 = themeMap[t.id].reduce((s, p) => s + _weightedB25(p, t.id), 0);
      const b26 = themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0);
      return {
        label: t.name,
        data: [b24, b25, b26],
        borderColor: _themeColor(t.id),
        backgroundColor: _themeColor(t.id) + '22',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        fill: false
      };
    });

    pcCharts['theme-trend'] = new Chart(canvas, {
      type: 'line',
      data: { labels: ['2024 결산', '2025 본예산', '2026 예산(안)'], datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: _lbl(), font: { size: 10, family: 'Pretendard Variable' }, usePointStyle: true, pointStyle: 'circle', padding: 12 } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${_fmt(ctx.raw)}` } }
        },
        scales: {
          x: { ticks: { color: _lbl() }, grid: { display: false } },
          y: { ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() } }
        }
      }
    });
  }

  function renderBalanceScorecard(themeMap) {
    const el = document.getElementById('pc-balance-scorecard');
    if (!el) return;
    const budgets = THEMES.map(t => ({ name: t.name, id: t.id, budget: themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0) }));
    const maxBudget = Math.max(...budgets.map(b => b.budget), 1);
    budgets.sort((a, b) => b.budget - a.budget);

    el.innerHTML = budgets.map(b => {
      const pct = (b.budget / maxBudget * 100).toFixed(1);
      return `<div class="pc-balance-bar">
        <span class="pc-balance-label">${b.name}</span>
        <div class="pc-balance-track">
          <div class="pc-balance-fill" style="width:${pct}%;background:${_themeColor(b.id)}">${parseFloat(pct) > 15 ? pct + '%' : ''}</div>
        </div>
        <span class="pc-balance-value">${_fmt(b.budget)}</span>
      </div>`;
    }).join('');
  }

  // ══════════════════════════════════════════════════════════
  // 2. STRATEGIC PORTFOLIO SUB-TAB
  // ══════════════════════════════════════════════════════════
  function renderPortfolio(projects, themeMap, classMap) {
    const el = document.getElementById('pc-portfolio');
    if (!el) return;

    el.innerHTML = `
      <div class="pc-section">
        <div class="pc-section-title"><span class="pc-icon">P</span> 전략 포트폴리오</div>
      </div>
      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">혁신 수준 vs 예산 규모 (2x2 매트릭스)</div>
          <div id="pc-quadrant-chart" style="min-height:420px;position:relative"></div>
        </div>
        <div class="card">
          <div class="card-title">부처별 R&D 비율 vs 총 예산 (버블 차트)</div>
          <div class="chart-container" style="height:420px"><canvas id="pc-chart-bubble"></canvas></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">포트폴리오 다양성 지표</div>
        <div id="pc-portfolio-diversity"></div>
      </div>
    `;

    renderQuadrantChart(projects, classMap);
    renderBubbleChart(projects);
    renderPortfolioDiversity(projects, themeMap);
  }

  function renderQuadrantChart(projects, classMap) {
    const container = document.getElementById('pc-quadrant-chart');
    if (!container || typeof d3 === 'undefined') return;

    // Calculate innovation score per project
    const data = projects.map(p => {
      const themes = classMap[p.id] || [];
      const isRnd = (p.type || '').includes('R&D') || (p.type || '').includes('연구') ? 1 : 0;
      const rndTheme = themes.find(t => t.themeId === 'rnd');
      const rndScore = rndTheme ? Math.min(rndTheme.score / 15, 0.5) : 0;
      const themeBonus = themes.length > 2 ? 0.15 : themes.length > 1 ? 0.08 : 0;
      const changeBonus = Math.abs(_rate(p)) > 20 ? 0.1 : 0;
      const innovScore = rndScore + isRnd * 0.3 + themeBonus + changeBonus;
      const budget = _b26(p);
      return { id: p.id, name: (p.name || '').substring(0, 20), dept: p.department || '', budget, innovScore: Math.min(innovScore, 1), themes };
    }).filter(d => d.budget > 0);

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const containerWidth = container.clientWidth || container.parentElement?.clientWidth || 600;
    const width = containerWidth - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;

    container.innerHTML = '';
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxBudget = d3.max(data, d => d.budget) || 1;
    const x = d3.scaleLinear().domain([0, maxBudget * 1.1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    const labelColor = _lbl();

    // Quadrant backgrounds
    const midX = maxBudget * 0.4;
    const midY = 0.4;
    const quadLabels = [
      { x: midX / 2, y: 0.7, label: '혁신 탐색형', color: 'rgba(124,58,237,0.06)' },
      { x: midX + (maxBudget * 1.1 - midX) / 2, y: 0.7, label: '혁신 주력형', color: 'rgba(22,163,74,0.06)' },
      { x: midX / 2, y: 0.2, label: '기초 관리형', color: 'rgba(202,138,4,0.06)' },
      { x: midX + (maxBudget * 1.1 - midX) / 2, y: 0.2, label: '대형 운영형', color: 'rgba(37,99,235,0.06)' }
    ];

    // Draw quadrant rects
    svg.append('rect').attr('x', 0).attr('y', 0).attr('width', x(midX)).attr('height', y(midY)).attr('fill', quadLabels[0].color);
    svg.append('rect').attr('x', x(midX)).attr('y', 0).attr('width', width - x(midX)).attr('height', y(midY)).attr('fill', quadLabels[1].color);
    svg.append('rect').attr('x', 0).attr('y', y(midY)).attr('width', x(midX)).attr('height', height - y(midY)).attr('fill', quadLabels[2].color);
    svg.append('rect').attr('x', x(midX)).attr('y', y(midY)).attr('width', width - x(midX)).attr('height', height - y(midY)).attr('fill', quadLabels[3].color);

    // Quadrant dividers
    svg.append('line').attr('x1', x(midX)).attr('x2', x(midX)).attr('y1', 0).attr('y2', height)
      .attr('stroke', labelColor).attr('stroke-dasharray', '4,4').attr('opacity', 0.3);
    svg.append('line').attr('x1', 0).attr('x2', width).attr('y1', y(midY)).attr('y2', y(midY))
      .attr('stroke', labelColor).attr('stroke-dasharray', '4,4').attr('opacity', 0.3);

    // Quadrant labels
    quadLabels.forEach(ql => {
      svg.append('text').attr('x', x(ql.x)).attr('y', y(ql.y))
        .attr('text-anchor', 'middle').attr('fill', labelColor).attr('font-size', 11)
        .attr('font-weight', 600).attr('opacity', 0.5).text(ql.label);
    });

    // Axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickFormat(v => _fmt(v)))
      .selectAll('text').attr('fill', labelColor).attr('font-size', 10);
    svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(v => (v * 100).toFixed(0) + '%'))
      .selectAll('text').attr('fill', labelColor).attr('font-size', 10);

    // Axis labels
    svg.append('text').attr('x', width / 2).attr('y', height + 35).attr('text-anchor', 'middle')
      .attr('fill', labelColor).attr('font-size', 11).text('예산 규모');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -38)
      .attr('text-anchor', 'middle').attr('fill', labelColor).attr('font-size', 11).text('혁신 수준');

    // Style axis lines
    svg.selectAll('.domain').attr('stroke', labelColor).attr('opacity', 0.3);
    svg.selectAll('.tick line').attr('stroke', labelColor).attr('opacity', 0.2);

    // Tooltip
    const tooltip = d3.select(container).append('div').attr('class', 'pc-tooltip').style('display', 'none');

    // Dots
    const rScale = d3.scaleSqrt().domain([0, maxBudget]).range([3, 14]);
    svg.selectAll('circle').data(data).join('circle')
      .attr('cx', d => x(d.budget))
      .attr('cy', d => y(d.innovScore))
      .attr('r', d => rScale(d.budget))
      .attr('fill', d => {
        const primary = d.themes[0];
        return primary ? _themeColor(primary.themeId) : '#888';
      })
      .attr('opacity', 0.65)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 2);
        tooltip.style('display', 'block')
          .html(`<b>${d.name}</b><br>${d.dept}<br>예산: ${_fmt(d.budget)}<br>혁신지수: ${(d.innovScore * 100).toFixed(0)}%`)
          .style('left', (event.offsetX + 15) + 'px')
          .style('top', (event.offsetY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.65).attr('stroke-width', 0.5);
        tooltip.style('display', 'none');
      })
      .on('click', function (event, d) {
        if (typeof showProjectModal === 'function') showProjectModal(d.id);
      });
  }

  function renderBubbleChart(projects) {
    pcDestroy('bubble');
    const canvas = document.getElementById('pc-chart-bubble');
    if (!canvas) return;

    // Aggregate by department
    const deptData = {};
    projects.forEach(p => {
      const d = p.department || '기타';
      if (!deptData[d]) deptData[d] = { total: 0, rnd: 0, count: 0 };
      const b = _b26(p);
      deptData[d].total += b;
      if (p.is_rnd) deptData[d].rnd += b;
      deptData[d].count++;
    });

    const bubbles = Object.entries(deptData)
      .filter(([, v]) => v.total > 0)
      .map(([dept, v]) => ({
        label: dept.substring(0, 8),
        x: v.total,
        y: v.total > 0 ? (v.rnd / v.total * 100) : 0,
        r: Math.sqrt(v.count) * 4 + 3,
        fullDept: dept,
        count: v.count,
        total: v.total,
        rndRatio: v.total > 0 ? (v.rnd / v.total * 100) : 0
      }))
      .sort((a, b) => b.x - a.x)
      .slice(0, 25);

    pcCharts['bubble'] = new Chart(canvas, {
      type: 'bubble',
      data: {
        datasets: [{
          label: '부처',
          data: bubbles.map(b => ({ x: b.x, y: b.y, r: b.r, meta: b })),
          backgroundColor: bubbles.map((_, i) => (THEME_COLORS[i % THEME_COLORS.length]) + '88'),
          borderColor: bubbles.map((_, i) => THEME_COLORS[i % THEME_COLORS.length]),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const m = bubbles[ctx.dataIndex];
                return [`${m.fullDept}`, `총 예산: ${_fmt(m.total)}`, `R&D 비율: ${m.rndRatio.toFixed(1)}%`, `사업 수: ${m.count}개`];
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: '총 예산', color: _lbl() }, ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() } },
          y: { title: { display: true, text: 'R&D 비율 (%)', color: _lbl() }, ticks: { color: _lbl(), callback: v => v + '%' }, grid: { color: _grid() }, min: 0, max: 100 }
        }
      }
    });
  }

  function renderPortfolioDiversity(projects, themeMap) {
    const el = document.getElementById('pc-portfolio-diversity');
    if (!el) return;

    // HHI (Herfindahl-Hirschman Index) by department
    const depts = [...new Set(projects.map(p => p.department || '기타'))];
    const deptDiversity = depts.map(dept => {
      const deptProjects = projects.filter(p => p.department === dept);
      const total = deptProjects.reduce((s, p) => s + _b26(p), 0);
      if (total <= 0) return { dept, hhi: 10000, diversity: 0, themeCount: 0 };
      const themeShares = THEMES.map(t => {
        const b = themeMap[t.id].filter(p => p.department === dept).reduce((s, p) => s + _weightedB26(p, t.id), 0);
        return b / total;
      });
      const hhi = themeShares.reduce((s, sh) => s + sh * sh * 10000, 0);
      const themeCount = themeShares.filter(s => s > 0.01).length;
      return { dept, hhi: Math.round(hhi), diversity: Math.round(100 - hhi / 100), themeCount };
    }).filter(d => d.diversity > 0).sort((a, b) => b.diversity - a.diversity).slice(0, 15);

    el.innerHTML = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">
        부처별 투자 다양성 (테마 분산도, HHI 기반). 높을수록 다양한 테마에 투자.
      </div>
      ${deptDiversity.map(d => {
        const color = d.diversity >= 60 ? 'var(--green)' : d.diversity >= 35 ? 'var(--yellow)' : 'var(--red)';
        return `<div class="pc-align-row">
          <span class="pc-align-dept">${d.dept.substring(0, 10)}</span>
          <div class="pc-align-bar-wrap">
            <div class="pc-align-bar-fill" style="width:${d.diversity}%;background:${color}"></div>
          </div>
          <span class="pc-align-score" style="color:${color}">${d.diversity}</span>
        </div>`;
      }).join('')}
    `;
  }

  // ══════════════════════════════════════════════════════════
  // 3. PERFORMANCE LINKAGE SUB-TAB
  // ══════════════════════════════════════════════════════════
  function renderPerformance(projects, themeMap, classMap) {
    const el = document.getElementById('pc-performance');
    if (!el) return;

    el.innerHTML = `
      <div class="pc-section">
        <div class="pc-section-title"><span class="pc-icon">A</span> 사업 성과 연계 분석</div>
      </div>
      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">예산 규모 vs 증감률 (우선순위 매트릭스)</div>
          <div id="pc-priority-matrix" style="min-height:400px;position:relative"></div>
        </div>
        <div class="card">
          <div class="card-title">부처별 전략 정렬 점수</div>
          <div id="pc-alignment-scores"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">예산 효율성 분석 (사업당 평균 예산 vs 증감률)</div>
        <div class="chart-container" style="height:350px"><canvas id="pc-chart-efficiency"></canvas></div>
      </div>
    `;

    renderPriorityMatrix(projects, classMap);
    renderAlignmentScores(projects, themeMap);
    renderEfficiencyChart(projects, themeMap);
  }

  function renderPriorityMatrix(projects, classMap) {
    const container = document.getElementById('pc-priority-matrix');
    if (!container || typeof d3 === 'undefined') return;

    const data = projects.map(p => {
      const budget = _b26(p);
      const rate = _rate(p);
      return { id: p.id, name: (p.name || '').substring(0, 20), dept: (p.department || '').substring(0, 8), budget, rate, themes: classMap[p.id] || [] };
    }).filter(d => d.budget > 0);

    const margin = { top: 30, right: 20, bottom: 40, left: 55 };
    const containerWidth = container.clientWidth || container.parentElement?.clientWidth || 600;
    const width = containerWidth - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    container.innerHTML = '';
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxBudget = d3.max(data, d => d.budget) || 1;
    const rateExtent = d3.extent(data, d => d.rate);
    const rateMax = Math.max(Math.abs(rateExtent[0] || 50), Math.abs(rateExtent[1] || 50), 50);

    const x = d3.scaleLinear().domain([0, maxBudget * 1.1]).range([0, width]);
    const y = d3.scaleLinear().domain([-rateMax, rateMax]).range([height, 0]);
    const labelColor = _lbl();

    // Quadrant backgrounds
    svg.append('rect').attr('x', x(maxBudget * 0.3)).attr('y', 0).attr('width', width - x(maxBudget * 0.3)).attr('height', y(0))
      .attr('fill', 'rgba(22,163,74,0.05)');
    svg.append('rect').attr('x', 0).attr('y', y(0)).attr('width', x(maxBudget * 0.3)).attr('height', height - y(0))
      .attr('fill', 'rgba(220,38,38,0.05)');

    // Quadrant labels
    svg.append('text').attr('x', width - 5).attr('y', 15).attr('text-anchor', 'end')
      .attr('fill', 'var(--green)').attr('font-size', 10).attr('opacity', 0.6).text('핵심 성장 사업');
    svg.append('text').attr('x', 5).attr('y', height - 5).attr('text-anchor', 'start')
      .attr('fill', 'var(--red)').attr('font-size', 10).attr('opacity', 0.6).text('재검토 필요 사업');

    // Zero line
    svg.append('line').attr('x1', 0).attr('x2', width).attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', labelColor).attr('stroke-dasharray', '4,4').attr('opacity', 0.4);

    // Axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickFormat(v => _fmt(v)))
      .selectAll('text').attr('fill', labelColor).attr('font-size', 10);
    svg.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(v => v.toFixed(0) + '%'))
      .selectAll('text').attr('fill', labelColor).attr('font-size', 10);

    svg.append('text').attr('x', width / 2).attr('y', height + 35).attr('text-anchor', 'middle')
      .attr('fill', labelColor).attr('font-size', 11).text('2026 예산 규모');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', labelColor).attr('font-size', 11).text('전년 대비 증감률 (%)');

    svg.selectAll('.domain').attr('stroke', labelColor).attr('opacity', 0.3);
    svg.selectAll('.tick line').attr('stroke', labelColor).attr('opacity', 0.2);

    const tooltip = d3.select(container).append('div').attr('class', 'pc-tooltip').style('display', 'none');

    svg.selectAll('circle').data(data).join('circle')
      .attr('cx', d => x(d.budget))
      .attr('cy', d => y(Math.max(-rateMax, Math.min(rateMax, d.rate))))
      .attr('r', 4)
      .attr('fill', d => d.rate >= 0 ? 'var(--green)' : 'var(--red)')
      .attr('opacity', 0.5)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('r', 7);
        tooltip.style('display', 'block')
          .html(`<b>${d.name}</b><br>${d.dept}<br>예산: ${_fmt(d.budget)}<br>증감: ${d.rate >= 0 ? '+' : ''}${d.rate.toFixed(1)}%`)
          .style('left', (event.offsetX + 15) + 'px')
          .style('top', (event.offsetY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.5).attr('r', 4);
        tooltip.style('display', 'none');
      })
      .on('click', function (event, d) {
        if (typeof showProjectModal === 'function') showProjectModal(d.id);
      });
  }

  function renderAlignmentScores(projects, themeMap) {
    const el = document.getElementById('pc-alignment-scores');
    if (!el) return;

    const depts = [...new Set(projects.map(p => p.department || '기타'))];
    const scores = depts.map(dept => {
      const deptProjects = projects.filter(p => p.department === dept);
      const total = deptProjects.reduce((s, p) => s + _b26(p), 0);
      if (total <= 0 || deptProjects.length === 0) return null;

      // Score components:
      // 1. Theme coverage (how many themes)
      const themeCoverage = THEMES.filter(t => themeMap[t.id].some(p => p.department === dept)).length / THEMES.length;
      // 2. Budget consistency (low variance in change rates = more stable)
      const rates = deptProjects.map(p => _rate(p)).filter(r => r !== 0);
      const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
      const rateStability = rates.length > 0 ? Math.max(0, 1 - Math.sqrt(rates.reduce((s, r) => s + (r - avgRate) ** 2, 0) / rates.length) / 50) : 0.5;
      // 3. Growth indicator
      const growthBonus = avgRate > 0 ? Math.min(avgRate / 30, 0.3) : 0;

      const score = Math.round((themeCoverage * 40 + rateStability * 40 + growthBonus * 20) * 100) / 100;
      return { dept, score: Math.min(Math.round(score), 100), count: deptProjects.length, budget: total };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 15);

    el.innerHTML = `
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">
        전략 정렬도 = 테마 다양성(40%) + 예산 안정성(40%) + 성장성(20%)
      </div>
      ${scores.map(d => {
        const color = d.score >= 60 ? 'var(--green)' : d.score >= 35 ? 'var(--yellow)' : 'var(--red)';
        return `<div class="pc-align-row">
          <span class="pc-align-dept" title="${d.dept}">${d.dept.substring(0, 10)}</span>
          <div class="pc-align-bar-wrap">
            <div class="pc-align-bar-fill" style="width:${d.score}%;background:${color}"></div>
          </div>
          <span class="pc-align-score" style="color:${color}">${d.score}</span>
        </div>`;
      }).join('')}
    `;
  }

  function renderEfficiencyChart(projects, themeMap) {
    pcDestroy('efficiency');
    const canvas = document.getElementById('pc-chart-efficiency');
    if (!canvas) return;

    const themeData = THEMES.map(t => {
      const ps = themeMap[t.id];
      const total = ps.reduce((s, p) => s + _b26(p), 0);
      const avg = ps.length > 0 ? total / ps.length : 0;
      const rates = ps.map(p => _rate(p)).filter(r => r !== 0);
      const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
      return { name: t.name, avg, avgRate, count: ps.length, color: _themeColor(t.id) };
    });

    pcCharts['efficiency'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: themeData.map(d => d.name),
        datasets: [
          { label: '평균 예산', data: themeData.map(d => d.avg), backgroundColor: themeData.map(d => d.color + '88'), yAxisID: 'y' },
          { label: '평균 증감률 (%)', data: themeData.map(d => d.avgRate), type: 'line', borderColor: '#f87171', pointBackgroundColor: '#f87171', borderWidth: 2, yAxisID: 'y1', tension: 0.3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: _lbl(), font: { size: 11, family: 'Pretendard Variable' } } },
          tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? `평균 예산: ${_fmt(ctx.raw)}` : `평균 증감률: ${ctx.raw.toFixed(1)}%` } }
        },
        scales: {
          x: { ticks: { color: _lbl(), font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
          y: { position: 'left', ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() }, title: { display: true, text: '평균 예산', color: _lbl() } },
          y1: { position: 'right', ticks: { color: '#f87171', callback: v => v.toFixed(0) + '%' }, grid: { display: false }, title: { display: true, text: '증감률', color: '#f87171' } }
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // 4. POLICY RECOMMENDATIONS SUB-TAB
  // ══════════════════════════════════════════════════════════
  function renderRecommendations(projects, themeMap, classMap) {
    const el = document.getElementById('pc-recommendations');
    if (!el) return;

    const recommendations = generateRecommendations(projects, themeMap, classMap);

    el.innerHTML = `
      <div class="pc-section">
        <div class="pc-section-title"><span class="pc-icon">!</span> 정책 제언 카드</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px">
          데이터 기반 자동 분석 결과입니다. ${recommendations.length}건의 제언이 생성되었습니다.
        </div>
      </div>
      <div class="pc-rec-cards">
        ${recommendations.map(r => `
          <div class="pc-rec-card severity-${r.severity}">
            <div class="rec-severity">${r.severity === 'high' ? '높음' : r.severity === 'medium' ? '보통' : '낮음'}</div>
            <div class="rec-title">${r.title}</div>
            <div class="rec-body">${r.body}</div>
            <div class="rec-data">${r.data}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function generateRecommendations(projects, themeMap, classMap) {
    const recs = [];
    const totalBudget = projects.reduce((s, p) => s + _b26(p), 0) || 1;

    // 1. Investment gap analysis: themes with very low budget share
    const themeShares = THEMES.map(t => {
      const b = themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0);
      return { theme: t, budget: b, share: b / totalBudget * 100, count: themeMap[t.id].length };
    }).sort((a, b) => a.share - b.share);

    themeShares.filter(ts => ts.share < 5 && ts.count > 0).forEach(ts => {
      recs.push({
        severity: ts.share < 2 ? 'high' : 'medium',
        title: `"${ts.theme.name}" 분야 투자 공백 발견`,
        body: `전체 AI 예산 중 ${ts.theme.name} 분야는 ${ts.share.toFixed(1)}%만 차지하고 있어 상대적 투자 공백 우려가 있습니다. 해당 분야의 전략적 중요도를 재점검할 필요가 있습니다.`,
        data: `예산 비중: <span>${ts.share.toFixed(1)}%</span> | 사업 수: <span>${ts.count}개</span> | 투자액: <span>${_fmt(ts.budget)}</span>`
      });
    });

    // 2. Department concentration
    const deptBudgets = {};
    projects.forEach(p => {
      const d = p.department || '기타';
      deptBudgets[d] = (deptBudgets[d] || 0) + _b26(p);
    });
    const deptShares = Object.entries(deptBudgets).map(([d, b]) => ({ dept: d, budget: b, share: b / totalBudget * 100 }))
      .sort((a, b) => b.share - a.share);

    // Top 3 departments' combined share
    const top3Share = deptShares.slice(0, 3).reduce((s, d) => s + d.share, 0);
    if (top3Share > 60) {
      recs.push({
        severity: top3Share > 75 ? 'high' : 'medium',
        title: `상위 3개 부처 예산 집중도 과다`,
        body: `${deptShares.slice(0, 3).map(d => d.dept).join(', ')} 등 상위 3개 부처가 전체 AI 예산의 ${top3Share.toFixed(1)}%를 차지하고 있습니다. 다른 부처의 AI 역량 강화를 위한 예산 배분 검토가 필요합니다.`,
        data: deptShares.slice(0, 3).map(d => `${d.dept.substring(0, 6)}: <span>${d.share.toFixed(1)}%</span>`).join(' | ')
      });
    }

    // Individual department concentration
    deptShares.filter(d => d.share > 25).forEach(d => {
      recs.push({
        severity: d.share > 35 ? 'high' : 'medium',
        title: `${d.dept} 예산 집중도 과다`,
        body: `${d.dept}가 전체 AI 예산의 ${d.share.toFixed(1)}%를 차지하여 특정 부처에 대한 과도한 의존이 우려됩니다.`,
        data: `비중: <span>${d.share.toFixed(1)}%</span> | 금액: <span>${_fmt(d.budget)}</span>`
      });
    });

    // 3. Theme trend analysis (declining themes)
    THEMES.forEach(t => {
      const b25 = themeMap[t.id].reduce((s, p) => s + _weightedB25(p, t.id), 0);
      const b26 = themeMap[t.id].reduce((s, p) => s + _weightedB26(p, t.id), 0);
      if (b25 > 0) {
        const change = ((b26 - b25) / b25 * 100);
        if (change < -20 && themeMap[t.id].length >= 5) {
          recs.push({
            severity: change < -40 ? 'high' : 'medium',
            title: `"${t.name}" 테마 전년 대비 급감`,
            body: `${t.name} 분야 예산이 전년 대비 ${Math.abs(change).toFixed(1)}% 감소했습니다. 정책 우선순위 변화에 따른 전략적 판단인지 점검이 필요합니다.`,
            data: `2025: <span>${_fmt(b25)}</span> | 2026: <span>${_fmt(b26)}</span> | 변동: <span>${change.toFixed(1)}%</span>`
          });
        }
        if (change > 50 && themeMap[t.id].length >= 5) {
          recs.push({
            severity: 'low',
            title: `"${t.name}" 테마 전년 대비 급증`,
            body: `${t.name} 분야 예산이 전년 대비 ${change.toFixed(1)}% 증가했습니다. 급격한 예산 증가에 대한 집행 역량 확보 여부를 점검할 필요가 있습니다.`,
            data: `2025: <span>${_fmt(b25)}</span> | 2026: <span>${_fmt(b26)}</span> | 변동: <span>+${change.toFixed(1)}%</span>`
          });
        }
      }
    });

    // 4. New projects analysis
    const newProjects = projects.filter(p => p.status === '신규');
    if (newProjects.length > 0) {
      const newBudget = newProjects.reduce((s, p) => s + _b26(p), 0);
      recs.push({
        severity: 'low',
        title: `신규 사업 ${newProjects.length}건 편성`,
        body: `2026년 신규 AI 사업 ${newProjects.length}건이 편성되어 총 ${_fmt(newBudget)}이 배정되었습니다. 기존 사업과의 중복 여부 및 사전 타당성 검토가 중요합니다.`,
        data: `신규 사업 수: <span>${newProjects.length}건</span> | 총 예산: <span>${_fmt(newBudget)}</span>`
      });
    }

    // 5. Small project proliferation
    const smallProjects = projects.filter(p => _b26(p) > 0 && _b26(p) < 500);
    if (smallProjects.length > projects.length * 0.3) {
      recs.push({
        severity: 'medium',
        title: `소규모 사업 과다 편성 우려`,
        body: `5억 미만 소규모 사업이 ${smallProjects.length}건(${(smallProjects.length / projects.length * 100).toFixed(1)}%)으로, 사업 통폐합을 통한 효율화를 검토할 필요가 있습니다.`,
        data: `소규모 사업: <span>${smallProjects.length}건</span> | 비율: <span>${(smallProjects.length / projects.length * 100).toFixed(1)}%</span>`
      });
    }

    // 6. R&D vs non-R&D balance
    const rndBudget = projects.filter(p => p.is_rnd).reduce((s, p) => s + _b26(p), 0);
    const rndShare = rndBudget / totalBudget * 100;
    if (rndShare > 70) {
      recs.push({
        severity: 'medium',
        title: `R&D 편중 투자 구조`,
        body: `전체 AI 예산 중 R&D가 ${rndShare.toFixed(1)}%를 차지하고 있습니다. 상용화/산업적용 등 비R&D 분야로의 균형 있는 투자가 필요합니다.`,
        data: `R&D 비중: <span>${rndShare.toFixed(1)}%</span> | R&D 예산: <span>${_fmt(rndBudget)}</span>`
      });
    }

    // 7. Theme with no growth (flat or declining)
    const stagnantThemes = THEMES.filter(t => {
      const ps = themeMap[t.id];
      if (ps.length < 3) return false;
      const avgRate = ps.reduce((s, p) => s + _rate(p), 0) / ps.length;
      return avgRate < -5 && ps.length >= 10;
    });
    stagnantThemes.forEach(t => {
      const ps = themeMap[t.id];
      const avgRate = ps.reduce((s, p) => s + _rate(p), 0) / ps.length;
      recs.push({
        severity: 'medium',
        title: `"${t.name}" 분야 전반적 예산 감소 추세`,
        body: `${t.name} 분야 ${ps.length}개 사업의 평균 증감률이 ${avgRate.toFixed(1)}%로, 전반적인 예산 축소 추세를 보이고 있습니다.`,
        data: `사업 수: <span>${ps.length}개</span> | 평균 증감률: <span>${avgRate.toFixed(1)}%</span>`
      });
    });

    // Sort: high > medium > low
    const sevOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

    return recs;
  }

  // ══════════════════════════════════════════════════════════
  // 5. AI 순예산 SUB-TAB
  // ══════════════════════════════════════════════════════════
  const AI_KEYWORDS = ['AI', 'AX', '인공지능', '파운데이션', '데이터', '생성형', 'LLM', '초거대', '학습데이터', '클라우드', '딥러닝', '머신러닝', '자연어', 'GPT', '언어모델', 'sLM', 'AI안전', 'AI보안', 'NPU', '에이전트', 'Agent', '피지컬', '휴머노이드', '로봇', 'GPU', '온디바이스'];

  function isAiSubProject(name) {
    if (!name) return false;
    const upper = name.toUpperCase();
    return AI_KEYWORDS.some(kw => upper.includes(kw.toUpperCase()));
  }

  function matchedKeywords(name) {
    if (!name) return [];
    const upper = name.toUpperCase();
    return AI_KEYWORDS.filter(kw => upper.includes(kw.toUpperCase()));
  }

  function renderAiPureBudget(projects) {
    const el = document.getElementById('pc-ai-pure');
    if (!el) return;

    // ── 1. Build AI sub-project dataset ──
    const aiSubs = [];
    const aiProjects = new Set();
    const allSubs = [];

    projects.forEach(p => {
      const subs = p.sub_projects || [];
      const mgrs = p.project_managers || [];
      if (subs.length > 0) {
        subs.forEach(s => {
          const row = {
            projectId: p.id,
            projectName: p.project_name || p.name || '',
            department: p.department || '',
            subName: s.name || '',
            budget2024: s.budget_2024 || 0,
            budget2025: s.budget_2025 || 0,
            budget2026: s.budget_2026 || 0,
            isAi: isAiSubProject(s.name),
            matchedKw: matchedKeywords(s.name),
            field: p.field || '',
            type: p.type || ''
          };
          allSubs.push(row);
          if (row.isAi) { aiSubs.push(row); aiProjects.add(p.id); }
        });
      } else {
        // No sub_projects: check project name itself
        const pName = p.project_name || p.name || '';
        const row = {
          projectId: p.id,
          projectName: pName,
          department: p.department || '',
          subName: pName,
          budget2024: _b24(p),
          budget2025: _b25(p),
          budget2026: _b26(p),
          isAi: isAiSubProject(pName),
          matchedKw: matchedKeywords(pName),
          field: p.field || '',
          type: p.type || ''
        };
        allSubs.push(row);
        if (row.isAi) { aiSubs.push(row); aiProjects.add(p.id); }
      }
    });

    const totalAllBudget = projects.reduce((s, p) => s + _b26(p), 0);
    const aiBudget26 = aiSubs.reduce((s, r) => s + r.budget2026, 0);
    const aiBudget25 = aiSubs.reduce((s, r) => s + r.budget2025, 0);
    const aiBudget24 = aiSubs.reduce((s, r) => s + r.budget2024, 0);
    const aiPct = totalAllBudget > 0 ? (aiBudget26 / totalAllBudget * 100) : 0;
    const aiGrowth = aiBudget25 > 0 ? ((aiBudget26 - aiBudget25) / aiBudget25 * 100) : 0;

    // ── 2. Department aggregation ──
    const deptMap = {};
    aiSubs.forEach(r => {
      if (!deptMap[r.department]) deptMap[r.department] = { budget26: 0, budget25: 0, count: 0, subs: [] };
      deptMap[r.department].budget26 += r.budget2026;
      deptMap[r.department].budget25 += r.budget2025;
      deptMap[r.department].count += 1;
      deptMap[r.department].subs.push(r);
    });
    const deptRank = Object.entries(deptMap)
      .map(([dept, v]) => ({ dept, ...v }))
      .sort((a, b) => b.budget26 - a.budget26);

    // ── 3. Keyword frequency ──
    const kwFreq = {};
    const kwBudget = {};
    aiSubs.forEach(r => {
      r.matchedKw.forEach(kw => {
        kwFreq[kw] = (kwFreq[kw] || 0) + 1;
        kwBudget[kw] = (kwBudget[kw] || 0) + r.budget2026;
      });
    });
    const kwRank = Object.entries(kwFreq)
      .map(([kw, cnt]) => ({ kw, cnt, budget: kwBudget[kw] || 0 }))
      .sort((a, b) => b.budget - a.budget);

    // ── 4. Render HTML ──
    el.innerHTML = `
      <div class="pc-section">
        <div class="pc-section-title"><span class="pc-icon">*</span> AI 순예산 분석</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">
          세부사업명/과제명에 ${AI_KEYWORDS.slice(0, 8).join(', ')} 등 AI 키워드가 포함된 내역사업만 추출하여 분석한 순(純) AI 예산입니다.
        </div>
      </div>

      <!-- KPI -->
      <div class="pc-kpi-row" id="pc-ai-kpi"></div>

      <!-- Charts row -->
      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">부처별 AI 순예산 (상위 15)</div>
          <div class="chart-container" style="height:400px"><canvas id="pc-ai-dept-bar"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">AI 순예산 vs 전체 예산 비율</div>
          <div class="chart-container" style="height:400px"><canvas id="pc-ai-ratio-bar"></canvas></div>
        </div>
      </div>

      <div class="pc-grid-2">
        <div class="card">
          <div class="card-title">키워드별 예산 분포</div>
          <div class="chart-container" style="height:320px"><canvas id="pc-ai-kw-chart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title">연도별 AI 순예산 추이</div>
          <div class="chart-container" style="height:320px"><canvas id="pc-ai-trend-chart"></canvas></div>
        </div>
      </div>

      <!-- Detail table -->
      <div class="card">
        <div class="card-title" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span>AI 키워드 내역사업 목록 (${aiSubs.length}건)</span>
          <input type="text" id="pc-ai-search" placeholder="검색..." style="padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;width:200px">
          <select id="pc-ai-dept-filter" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px">
            <option value="">전체 부처</option>
            ${deptRank.map(d => `<option value="${d.dept}">${d.dept}</option>`).join('')}
          </select>
          <select id="pc-ai-kw-filter" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px">
            <option value="">전체 키워드</option>
            ${kwRank.map(k => `<option value="${k.kw}">${k.kw} (${k.cnt}건)</option>`).join('')}
          </select>
        </div>
        <div id="pc-ai-table-wrap" style="overflow-x:auto;margin-top:8px"></div>
        <div id="pc-ai-table-summary" style="font-size:12px;color:var(--text-secondary);margin-top:6px"></div>
      </div>
    `;

    // ── 5. Render KPI ──
    const kpiEl = document.getElementById('pc-ai-kpi');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="pc-kpi-item"><div class="pc-kpi-value">${aiSubs.length}건</div><div class="pc-kpi-label">AI 내역사업 수</div></div>
        <div class="pc-kpi-item"><div class="pc-kpi-value">${aiProjects.size}개</div><div class="pc-kpi-label">관련 사업 수</div></div>
        <div class="pc-kpi-item"><div class="pc-kpi-value">${_fmt(aiBudget26)}</div><div class="pc-kpi-label">AI 순예산 (2026)</div></div>
        <div class="pc-kpi-item"><div class="pc-kpi-value">${aiPct.toFixed(1)}%</div><div class="pc-kpi-label">전체 대비 비중</div></div>
        <div class="pc-kpi-item"><div class="pc-kpi-value" style="color:${aiGrowth >= 0 ? 'var(--green)' : 'var(--red)'}">${aiGrowth >= 0 ? '+' : ''}${aiGrowth.toFixed(1)}%</div><div class="pc-kpi-label">전년 대비 증감</div></div>
        <div class="pc-kpi-item"><div class="pc-kpi-value">${deptRank.length}개</div><div class="pc-kpi-label">관련 부처 수</div></div>
      `;
    }

    // ── 6. Department bar chart ──
    const top15 = deptRank.slice(0, 15);
    pcCharts['ai-dept'] = new Chart(document.getElementById('pc-ai-dept-bar'), {
      type: 'bar',
      data: {
        labels: top15.map(d => d.dept.length > 10 ? d.dept.substring(0, 10) + '..' : d.dept),
        datasets: [
          { label: '2026 AI 순예산', data: top15.map(d => d.budget26), backgroundColor: 'rgba(74,158,255,0.7)', borderRadius: 4 },
          { label: '2025 AI 예산', data: top15.map(d => d.budget25), backgroundColor: 'rgba(167,139,250,0.4)', borderRadius: 4 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() } },
          y: { ticks: { color: _lbl(), font: { size: 11 } }, grid: { display: false } }
        },
        plugins: {
          legend: { labels: { color: _lbl(), font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${_fmt(ctx.raw)}` } }
        }
      }
    });

    // ── 7. AI ratio per department ──
    const ratioData = deptRank.slice(0, 15).map(d => {
      const deptTotal = projects.filter(p => p.department === d.dept).reduce((s, p) => s + _b26(p), 0);
      return { dept: d.dept, ratio: deptTotal > 0 ? (d.budget26 / deptTotal * 100) : 0, aiBudget: d.budget26, totalBudget: deptTotal };
    }).sort((a, b) => b.ratio - a.ratio);

    pcCharts['ai-ratio'] = new Chart(document.getElementById('pc-ai-ratio-bar'), {
      type: 'bar',
      data: {
        labels: ratioData.map(d => d.dept.length > 10 ? d.dept.substring(0, 10) + '..' : d.dept),
        datasets: [{
          label: 'AI 예산 비율 (%)',
          data: ratioData.map(d => d.ratio),
          backgroundColor: ratioData.map(d => d.ratio > 50 ? 'rgba(52,211,153,0.7)' : d.ratio > 20 ? 'rgba(74,158,255,0.7)' : 'rgba(251,191,36,0.7)'),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { max: 100, ticks: { color: _lbl(), callback: v => v + '%' }, grid: { color: _grid() } },
          y: { ticks: { color: _lbl(), font: { size: 11 } }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `AI 비율: ${ctx.raw.toFixed(1)}% (${_fmt(ratioData[ctx.dataIndex].aiBudget)} / ${_fmt(ratioData[ctx.dataIndex].totalBudget)})` } }
        }
      }
    });

    // ── 8. Keyword chart ──
    pcCharts['ai-kw'] = new Chart(document.getElementById('pc-ai-kw-chart'), {
      type: 'bar',
      data: {
        labels: kwRank.map(k => k.kw),
        datasets: [
          { label: '예산 (백만원)', data: kwRank.map(k => k.budget), backgroundColor: 'rgba(74,158,255,0.7)', borderRadius: 4, yAxisID: 'y' },
          { label: '건수', data: kwRank.map(k => k.cnt), type: 'line', borderColor: '#f87171', pointBackgroundColor: '#f87171', borderWidth: 2, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: _lbl(), font: { size: 11 } }, grid: { display: false } },
          y: { position: 'left', ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() }, title: { display: true, text: '예산', color: _lbl() } },
          y1: { position: 'right', ticks: { color: '#f87171' }, grid: { display: false }, title: { display: true, text: '건수', color: '#f87171' } }
        },
        plugins: {
          legend: { labels: { color: _lbl(), font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? `예산: ${_fmt(ctx.raw)}` : `${ctx.raw}건` } }
        },
        onClick: (evt, elements) => {
          if (!elements || elements.length === 0) return;
          const idx = elements[0].index;
          const kw = kwRank[idx]?.kw;
          if (!kw) return;
          const sel = document.getElementById('pc-ai-kw-filter');
          if (sel) { sel.value = kw; renderAiTable(); }
          const tableWrap = document.getElementById('pc-ai-table-wrap');
          if (tableWrap) tableWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // ── 9. Year trend chart ──
    pcCharts['ai-trend'] = new Chart(document.getElementById('pc-ai-trend-chart'), {
      type: 'line',
      data: {
        labels: ['2024 결산', '2025 본예산', '2026 예산(안)'],
        datasets: [{
          label: 'AI 순예산',
          data: [aiBudget24, aiBudget25, aiBudget26],
          borderColor: '#4a9eff',
          backgroundColor: 'rgba(74,158,255,0.15)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3
        }, {
          label: '전체 예산',
          data: [
            projects.reduce((s, p) => s + _b24(p), 0),
            projects.reduce((s, p) => s + _b25(p), 0),
            totalAllBudget
          ],
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167,139,250,0.08)',
          borderWidth: 2,
          pointRadius: 5,
          borderDash: [6, 3],
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: _lbl() }, grid: { display: false } },
          y: { ticks: { color: _lbl(), callback: v => _fmt(v) }, grid: { color: _grid() } }
        },
        plugins: {
          legend: { labels: { color: _lbl(), font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${_fmt(ctx.raw)}` } }
        }
      }
    });

    // ── 10. Detail table ──
    let aiSortKey = 'budget2026';
    let aiSortDir = 'desc';

    function renderAiTable() {
      const search = (document.getElementById('pc-ai-search')?.value || '').toLowerCase();
      const deptFilter = document.getElementById('pc-ai-dept-filter')?.value || '';
      const kwFilter = document.getElementById('pc-ai-kw-filter')?.value || '';

      let filtered = aiSubs.filter(r => {
        if (deptFilter && r.department !== deptFilter) return false;
        if (kwFilter && !r.matchedKw.includes(kwFilter)) return false;
        if (search && !r.subName.toLowerCase().includes(search) && !r.projectName.toLowerCase().includes(search) && !r.department.toLowerCase().includes(search)) return false;
        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        const va = a[aiSortKey] || 0;
        const vb = b[aiSortKey] || 0;
        if (typeof va === 'string') return aiSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return aiSortDir === 'asc' ? va - vb : vb - va;
      });

      const sumB26 = filtered.reduce((s, r) => s + r.budget2026, 0);
      const sumB25 = filtered.reduce((s, r) => s + r.budget2025, 0);

      function si(key) {
        if (aiSortKey !== key) return '';
        return aiSortDir === 'asc' ? ' &#9650;' : ' &#9660;';
      }

      const wrap = document.getElementById('pc-ai-table-wrap');
      const showRows = filtered.slice(0, 100);
      wrap.innerHTML = `
        <table class="data-table" style="width:100%;font-size:12px">
          <thead><tr>
            <th class="sortable" data-key="department" style="cursor:pointer">부처${si('department')}</th>
            <th class="sortable" data-key="projectName" style="cursor:pointer">사업명${si('projectName')}</th>
            <th class="sortable" data-key="subName" style="cursor:pointer">내역사업명${si('subName')}</th>
            <th>매칭 키워드</th>
            <th class="sortable num" data-key="budget2024" style="cursor:pointer;text-align:right">2024${si('budget2024')}</th>
            <th class="sortable num" data-key="budget2025" style="cursor:pointer;text-align:right">2025${si('budget2025')}</th>
            <th class="sortable num" data-key="budget2026" style="cursor:pointer;text-align:right">2026${si('budget2026')}</th>
            <th style="text-align:right">증감</th>
          </tr></thead>
          <tbody>
            ${showRows.map(r => {
              const chg = r.budget2025 > 0 ? ((r.budget2026 - r.budget2025) / r.budget2025 * 100) : (r.budget2026 > 0 ? 999 : 0);
              const chgStr = chg === 999 ? '순증' : (chg >= 0 ? '+' : '') + chg.toFixed(1) + '%';
              const chgColor = chg > 0 ? 'var(--green)' : chg < 0 ? 'var(--red)' : 'var(--text-muted)';
              const kwTags = r.matchedKw.map(kw => `<span style="background:var(--accent-dim);color:var(--accent);padding:1px 6px;border-radius:4px;font-size:10px;margin-right:2px">${kw}</span>`).join('');
              return `<tr style="cursor:pointer" onclick="if(typeof showProjectModal==='function')showProjectModal(${r.projectId})">
                <td>${r.department.substring(0, 10)}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.projectName}">${r.projectName}</td>
                <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.subName}">${r.subName}</td>
                <td>${kwTags}</td>
                <td style="text-align:right">${_fmt(r.budget2024)}</td>
                <td style="text-align:right">${_fmt(r.budget2025)}</td>
                <td style="text-align:right;font-weight:600">${_fmt(r.budget2026)}</td>
                <td style="text-align:right;color:${chgColor};font-size:11px">${chgStr}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      `;

      const summaryEl = document.getElementById('pc-ai-table-summary');
      if (summaryEl) {
        summaryEl.innerHTML = `총 ${filtered.length}건 | 2026 합계: <strong>${_fmt(sumB26)}</strong> | 2025 합계: ${_fmt(sumB25)} | 증감: <span style="color:${sumB26 >= sumB25 ? 'var(--green)' : 'var(--red)'}">${sumB25 > 0 ? ((sumB26 - sumB25) / sumB25 * 100).toFixed(1) : '-'}%</span>${filtered.length > 100 ? ` (상위 100건 표시)` : ''}`;
      }

      // Attach sort handlers
      wrap.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.key;
          if (aiSortKey === key) aiSortDir = aiSortDir === 'asc' ? 'desc' : 'asc';
          else { aiSortKey = key; aiSortDir = 'desc'; }
          renderAiTable();
        });
      });
    }

    renderAiTable();

    // Attach filter/search handlers
    document.getElementById('pc-ai-search')?.addEventListener('input', () => { clearTimeout(window._aiSearchTimer); window._aiSearchTimer = setTimeout(renderAiTable, 300); });
    document.getElementById('pc-ai-dept-filter')?.addEventListener('change', renderAiTable);
    document.getElementById('pc-ai-kw-filter')?.addEventListener('change', renderAiTable);
  }

  // ── Export ──────────────────────────────────────────────────
  window.initPolicyClusterTab = initPolicyClusterTab;

})();
