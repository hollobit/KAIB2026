/**
 * Cross-Compare Tab for 2026 AI Budget Analysis Platform
 * Provides cross-department comparison, efficiency metrics,
 * year-over-year trends, and AI domain mapping.
 */
function initCrossCompareTab(DATA) {
  const container = document.getElementById('tab-cross-compare');
  if (!container) return;

  // ── Helpers ──
  const B2026 = p => getBudget2026(p);
  const B2025 = p => getBudget2025(p);
  const B2024 = p => getBudget2024(p);

  const departments = [...new Set(DATA.projects.map(p => p.department))].filter(Boolean).sort();
  const deptProjects = {};
  departments.forEach(d => { deptProjects[d] = DATA.projects.filter(p => p.department === d); });

  const COLORS = [
    '#4a9eff','#a78bfa','#34d399','#fbbf24','#f87171',
    '#fb923c','#f472b6','#22d3ee','#818cf8','#a3e635',
    '#e879f9','#2dd4bf','#facc15','#38bdf8','#c084fc'
  ];

  const AI_DOMAINS = [
    '자연어처리/LLM', '컴퓨터비전', '로보틱스/자율주행',
    '데이터/빅데이터', '보안/사이버', '헬스케어/바이오',
    '제조/스마트팩토리', '교육/인재양성', '공공/행정',
    '국방/안보', '환경/기후', '금융/핀테크',
    '교통/물류', '농업/식품', '에너지', '기타AI'
  ];

  const DOMAIN_KEYWORDS = {
    '자연어처리/LLM': ['자연어','언어모델','LLM','GPT','챗봇','대화','번역','텍스트','생성형','초거대','파운데이션'],
    '컴퓨터비전': ['영상','이미지','비전','객체인식','얼굴','CCTV','위성영상','원격탐사','영상분석'],
    '로보틱스/자율주행': ['로봇','자율주행','드론','무인','모빌리티','자율운항','로보틱스'],
    '데이터/빅데이터': ['데이터','빅데이터','클라우드','컴퓨팅','GPU','반도체','인프라','플랫폼','학습데이터'],
    '보안/사이버': ['보안','사이버','해킹','암호','디지털포렌식','정보보호'],
    '헬스케어/바이오': ['의료','헬스','바이오','신약','진단','질환','건강','의약','임상','유전체'],
    '제조/스마트팩토리': ['제조','스마트공장','스마트팩토리','산업지능','품질','공정'],
    '교육/인재양성': ['교육','인재','양성','훈련','학습','SW인재','디지털인재','대학원'],
    '공공/행정': ['공공','행정','정부','전자정부','민원','복지','주민'],
    '국방/안보': ['국방','군사','방위','안보','전투','무기체계','감시정찰'],
    '환경/기후': ['환경','기후','탄소','에코','오염','재난','재해','기상'],
    '금융/핀테크': ['금융','핀테크','블록체인','결제','보험','은행'],
    '교통/물류': ['교통','물류','ITS','항공','항만','철도','도로'],
    '농업/식품': ['농업','축산','수산','식품','농촌','스마트팜'],
    '에너지': ['에너지','전력','원자력','신재생','배터리','수소','그리드']
  };

  function classifyDomains(p) {
    if (p.ai_domains && p.ai_domains.length > 0) return p.ai_domains;
    const text = [p.name, p.purpose, p.description, ...(p.keywords || [])].join(' ').toLowerCase();
    const found = [];
    for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
      if (kws.some(kw => text.includes(kw.toLowerCase()))) found.push(domain);
    }
    return found.length > 0 ? found : ['기타AI'];
  }

  function tokenize(name) {
    if (!name) return [];
    return name.replace(/[()[\]·\-_:,./\s]+/g, ' ').split(' ').filter(t => t.length >= 2);
  }

  function tokenSimilarity(a, b) {
    const tA = new Set(tokenize(a));
    const tB = new Set(tokenize(b));
    if (tA.size === 0 || tB.size === 0) return 0;
    let overlap = 0;
    tA.forEach(t => { if (tB.has(t)) overlap++; });
    return overlap / Math.min(tA.size, tB.size);
  }

  function calcHHI(budgets, total) {
    if (total === 0) return 0;
    return budgets.reduce((sum, b) => sum + Math.pow(b / total, 2), 0);
  }

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).substr(2, 8);
  }

  // ── Build DOM ──
  container.innerHTML = '';

  // Sub-tabs
  const subTabDefs = [
    { id: 'cc-cross', label: '부처간 크로스 비교' },
    { id: 'cc-efficiency', label: '예산 효율성 지표' },
    { id: 'cc-trend', label: '연도별 추이 비교' },
    { id: 'cc-domain', label: 'AI 기술 도메인 매핑' }
  ];

  const subTabNav = document.createElement('div');
  subTabNav.className = 'cc-sub-tabs';
  subTabDefs.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.className = 'cc-sub-tab' + (i === 0 ? ' active' : '');
    btn.textContent = t.label;
    btn.dataset.subtab = t.id;
    btn.addEventListener('click', () => switchCcSubTab(t.id));
    subTabNav.appendChild(btn);
  });
  container.appendChild(subTabNav);

  subTabDefs.forEach((t, i) => {
    const div = document.createElement('div');
    div.id = t.id;
    div.className = 'cc-sub-content' + (i === 0 ? ' active' : '');
    container.appendChild(div);
  });

  function switchCcSubTab(tabId) {
    subTabNav.querySelectorAll('.cc-sub-tab').forEach(b => b.classList.toggle('active', b.dataset.subtab === tabId));
    container.querySelectorAll('.cc-sub-content').forEach(c => c.classList.toggle('active', c.id === tabId));
    if (tabId === 'cc-cross') renderCrossSection();
    if (tabId === 'cc-efficiency') renderEfficiencySection();
    if (tabId === 'cc-trend') renderTrendSection();
    if (tabId === 'cc-domain') renderDomainSection();
    if (typeof updateTabHash === 'function') updateTabHash('cross-compare');
  }
  window.switchCcSubTab = switchCcSubTab;

  // ════════════════════════════════════════════════════
  // 1. 부처간 크로스 비교
  // ════════════════════════════════════════════════════
  let crossRendered = false;
  function renderCrossSection() {
    if (crossRendered) return;
    crossRendered = true;

    const sec = document.getElementById('cc-cross');
    sec.innerHTML = '';

    // Selectors
    const selRow = document.createElement('div');
    selRow.className = 'cc-selector-row';

    const selA = document.createElement('select');
    selA.className = 'cc-select';
    const selB = document.createElement('select');
    selB.className = 'cc-select';

    const topDepts = departments.slice().sort((a, b) =>
      deptProjects[b].reduce((s, p) => s + B2026(p), 0) - deptProjects[a].reduce((s, p) => s + B2026(p), 0)
    );

    [selA, selB].forEach((sel, idx) => {
      const opt0 = document.createElement('option');
      opt0.value = '';
      opt0.textContent = `부처 ${idx === 0 ? 'A' : 'B'} 선택`;
      sel.appendChild(opt0);
      topDepts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d} (${deptProjects[d].length}건)`;
        sel.appendChild(opt);
      });
    });

    if (topDepts.length >= 2) {
      selA.value = topDepts[0];
      selB.value = topDepts[1];
    }

    const lblA = document.createElement('label');
    lblA.textContent = '부처 A';
    const vs = document.createElement('span');
    vs.className = 'cc-vs-label';
    vs.textContent = 'VS';
    const lblB = document.createElement('label');
    lblB.textContent = '부처 B';

    selRow.append(lblA, selA, vs, lblB, selB);
    sec.appendChild(selRow);

    const resultDiv = document.createElement('div');
    sec.appendChild(resultDiv);

    function renderComparison() {
      const dA = selA.value;
      const dB = selB.value;
      resultDiv.innerHTML = '';

      if (!dA || !dB || dA === dB) {
        resultDiv.innerHTML = '<div class="cc-empty"><div class="cc-empty-icon">&#8644;</div>서로 다른 두 부처를 선택하세요</div>';
        return;
      }

      const pA = deptProjects[dA] || [];
      const pB = deptProjects[dB] || [];
      const budgetA = pA.reduce((s, p) => s + B2026(p), 0);
      const budgetB = pB.reduce((s, p) => s + B2026(p), 0);
      const avgA = pA.length ? budgetA / pA.length : 0;
      const avgB = pB.length ? budgetB / pB.length : 0;

      // KPI comparison cards
      const grid = document.createElement('div');
      grid.className = 'cc-compare-grid';

      function addMetricCard(label, valA, valB, fmt) {
        const card = document.createElement('div');
        card.className = 'cc-compare-card';
        const total = (valA || 0) + (valB || 0);
        const pctA = total > 0 ? (valA / total * 100) : 50;
        const pctB = total > 0 ? (valB / total * 100) : 50;
        card.innerHTML = `
          <div class="cc-metric-label">${label}</div>
          <div class="cc-metric-row">
            <div>
              <div class="cc-metric-dept">${dA}</div>
              <div class="cc-metric-value dept-a">${fmt(valA)}</div>
            </div>
            <div style="text-align:right">
              <div class="cc-metric-dept">${dB}</div>
              <div class="cc-metric-value dept-b">${fmt(valB)}</div>
            </div>
          </div>
          <div class="cc-bar-container">
            <div class="cc-bar-wrapper">
              <div class="cc-bar-a" style="width:${pctA}%"></div>
              <div class="cc-bar-b" style="width:${pctB}%"></div>
            </div>
          </div>
        `;
        grid.appendChild(card);
      }

      addMetricCard('총 예산 (2026)', budgetA, budgetB, v => formatBillion(v));
      addMetricCard('사업 수', pA.length, pB.length, v => v + '건');
      addMetricCard('사업당 평균 예산', avgA, avgB, v => formatBillion(v));

      const subA = pA.reduce((s, p) => s + (p.sub_projects?.length || 0), 0);
      const subB = pB.reduce((s, p) => s + (p.sub_projects?.length || 0), 0);
      addMetricCard('내역사업 수', subA, subB, v => v + '건');

      resultDiv.appendChild(grid);

      // Radar chart - field distribution
      const radarWrap = document.createElement('div');
      radarWrap.className = 'cc-chart-container';
      const radarTitle = document.createElement('div');
      radarTitle.className = 'cc-chart-title';
      radarTitle.textContent = '분야별 예산 분포 비교 (Radar)';
      radarWrap.appendChild(radarTitle);

      const radarCanvasWrap = document.createElement('div');
      radarCanvasWrap.className = 'cc-chart-canvas-wrap';
      radarCanvasWrap.style.height = '520px';
      radarCanvasWrap.style.maxHeight = '520px';
      const radarCanvas = document.createElement('canvas');
      const radarId = uid('cc-radar');
      radarCanvas.id = radarId;
      const dpr = window.devicePixelRatio || 1;
      radarCanvas.width = 800 * dpr;
      radarCanvas.height = 800 * dpr;
      radarCanvas.style.width = '100%';
      radarCanvas.style.height = '100%';
      radarCanvasWrap.appendChild(radarCanvas);
      radarWrap.appendChild(radarCanvasWrap);
      resultDiv.appendChild(radarWrap);

      const fieldsA = {};
      const fieldsB = {};
      pA.forEach(p => { const f = p.field || '기타'; fieldsA[f] = (fieldsA[f] || 0) + B2026(p); });
      pB.forEach(p => { const f = p.field || '기타'; fieldsB[f] = (fieldsB[f] || 0) + B2026(p); });
      const allFields = [...new Set([...Object.keys(fieldsA), ...Object.keys(fieldsB)])].sort();

      destroyChart(radarId);
      chartInstances[radarId] = new Chart(radarCanvas, {
        type: 'radar',
        data: {
          labels: allFields,
          datasets: [
            {
              label: dA,
              data: allFields.map(f => (fieldsA[f] || 0) / 100),
              borderColor: '#4a9eff',
              backgroundColor: 'rgba(74,158,255,0.15)',
              borderWidth: 2.5,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: dB,
              data: allFields.map(f => (fieldsB[f] || 0) / 100),
              borderColor: '#a78bfa',
              backgroundColor: 'rgba(167,139,250,0.15)',
              borderWidth: 2.5,
              pointRadius: 5,
              pointHoverRadius: 7
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          devicePixelRatio: window.devicePixelRatio || 2,
          scales: {
            r: {
              beginAtZero: true,
              ticks: { color: getChartLabelColor(), font: { size: 12 }, backdropColor: 'transparent' },
              grid: { color: getChartGridColor(), lineWidth: 1 },
              pointLabels: { color: getChartLabelColor(), font: { size: 13, weight: '500' }, padding: 12 },
              angleLines: { color: getChartGridColor() }
            }
          },
          plugins: {
            legend: { labels: { color: getChartLabelColor(), font: { size: 13 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${formatBillion(ctx.raw * 100)}`
              }
            }
          }
        }
      });

      // AI domain comparison
      const domainWrap = document.createElement('div');
      domainWrap.className = 'cc-chart-container';
      const domainTitle = document.createElement('div');
      domainTitle.className = 'cc-chart-title';
      domainTitle.textContent = 'AI 도메인 분포 비교';
      domainWrap.appendChild(domainTitle);

      const domCanvasWrap = document.createElement('div');
      domCanvasWrap.className = 'cc-chart-canvas-wrap';
      const domCanvas = document.createElement('canvas');
      const domId = uid('cc-domain-bar');
      domCanvas.id = domId;
      domCanvasWrap.appendChild(domCanvas);
      domainWrap.appendChild(domCanvasWrap);
      resultDiv.appendChild(domainWrap);

      const domA = {};
      const domB = {};
      pA.forEach(p => { classifyDomains(p).forEach(d => { domA[d] = (domA[d] || 0) + B2026(p); }); });
      pB.forEach(p => { classifyDomains(p).forEach(d => { domB[d] = (domB[d] || 0) + B2026(p); }); });
      const allDoms = [...new Set([...Object.keys(domA), ...Object.keys(domB)])].sort((a, b) =>
        ((domA[b] || 0) + (domB[b] || 0)) - ((domA[a] || 0) + (domB[a] || 0))
      ).slice(0, 12);

      destroyChart(domId);
      chartInstances[domId] = new Chart(domCanvas, {
        type: 'bar',
        data: {
          labels: allDoms,
          datasets: [
            {
              label: dA,
              data: allDoms.map(d => (domA[d] || 0) / 100),
              backgroundColor: 'rgba(74,158,255,0.7)',
              borderColor: '#4a9eff',
              borderWidth: 1
            },
            {
              label: dB,
              data: allDoms.map(d => (domB[d] || 0) / 100),
              backgroundColor: 'rgba(167,139,250,0.7)',
              borderColor: '#a78bfa',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              ticks: { color: getChartLabelColor(), callback: v => formatBillion(v * 100) },
              grid: { color: getChartGridColor() }
            },
            y: {
              ticks: { color: getChartLabelColor(), font: { size: 10 } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { labels: { color: getChartLabelColor() } },
            tooltip: {
              callbacks: { label: ctx => `${ctx.dataset.label}: ${formatBillion(ctx.raw * 100)}` }
            }
          }
        }
      });
      domCanvasWrap.style.height = Math.max(240, allDoms.length * 36) + 'px';

      // Matched projects
      const matchWrap = document.createElement('div');
      matchWrap.className = 'cc-chart-container';
      const matchTitle = document.createElement('div');
      matchTitle.className = 'cc-chart-title';
      matchTitle.textContent = '유사 사업 매칭 (이름 토큰 유사도)';
      matchWrap.appendChild(matchTitle);

      const matches = [];
      pA.forEach(a => {
        pB.forEach(b => {
          const sim = tokenSimilarity(a.name, b.name);
          if (sim >= 0.4) {
            matches.push({ projA: a, projB: b, similarity: sim });
          }
        });
      });
      matches.sort((a, b) => b.similarity - a.similarity);

      if (matches.length === 0) {
        matchWrap.innerHTML += '<div class="cc-empty">유사도 40% 이상 매칭 사업이 없습니다</div>';
      } else {
        const tbl = document.createElement('div');
        tbl.className = 'cc-table-wrap';
        let rows = matches.slice(0, 30).map(m => `
          <tr>
            <td>${m.projA.name}</td>
            <td class="num">${formatBillion(B2026(m.projA))}</td>
            <td>${m.projB.name}</td>
            <td class="num">${formatBillion(B2026(m.projB))}</td>
            <td class="num" style="color:var(--accent)">${(m.similarity * 100).toFixed(0)}%</td>
          </tr>
        `).join('');
        tbl.innerHTML = `
          <table class="cc-table">
            <thead>
              <tr>
                <th>${dA} 사업명</th><th class="num">예산</th>
                <th>${dB} 사업명</th><th class="num">예산</th>
                <th class="num">유사도</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `;
        matchWrap.appendChild(tbl);
      }
      resultDiv.appendChild(matchWrap);
    }

    selA.addEventListener('change', () => { crossRendered = true; renderComparison(); crossRendered = false; });
    selB.addEventListener('change', () => { crossRendered = true; renderComparison(); crossRendered = false; });

    // Fix: allow re-render on sub-tab click
    crossRendered = false;
    renderComparison();
    crossRendered = true;
  }

  // ════════════════════════════════════════════════════
  // 2. 예산 효율성 지표
  // ════════════════════════════════════════════════════
  let effRendered = false;
  function renderEfficiencySection() {
    if (effRendered) return;
    effRendered = true;

    const sec = document.getElementById('cc-efficiency');
    sec.innerHTML = '';

    // Calculate metrics per department
    const metrics = departments.map(dept => {
      const projs = deptProjects[dept];
      const total2026 = projs.reduce((s, p) => s + B2026(p), 0);
      const budgets = projs.map(p => B2026(p)).filter(b => b > 0);
      const hhi = calcHHI(budgets, total2026);
      const subCount = projs.reduce((s, p) => s + (p.sub_projects?.length || 0), 0);
      const subRatio = projs.length > 0 ? subCount / projs.length : 0;
      const newProjs = projs.filter(p => {
        const b25 = B2025(p);
        const b26 = B2026(p);
        return !b25 && b26 > 0;
      });
      const contProjs = projs.filter(p => B2025(p) > 0 && B2026(p) > 0);
      const newBudget = newProjs.reduce((s, p) => s + B2026(p), 0);
      const contBudget = contProjs.reduce((s, p) => s + B2026(p), 0);
      const avgBudget = projs.length > 0 ? total2026 / projs.length : 0;
      return {
        dept, total2026, count: projs.length, hhi,
        subCount, subRatio, newBudget, contBudget,
        newCount: newProjs.length, contCount: contProjs.length,
        avgBudget
      };
    }).filter(m => m.total2026 > 0);

    // KPI summary
    const totalAll = metrics.reduce((s, m) => s + m.total2026, 0);
    const avgHHI = metrics.length ? metrics.reduce((s, m) => s + m.hhi, 0) / metrics.length : 0;
    const totalNew = metrics.reduce((s, m) => s + m.newBudget, 0);
    const totalCont = metrics.reduce((s, m) => s + m.contBudget, 0);

    const kpiRow = document.createElement('div');
    kpiRow.className = 'cc-kpi-row';
    [
      { label: '평균 HHI (집중도)', value: avgHHI.toFixed(3), sub: '낮을수록 균등 분배' },
      { label: '신규사업 예산', value: formatBillion(totalNew), sub: `${metrics.reduce((s, m) => s + m.newCount, 0)}건` },
      { label: '계속사업 예산', value: formatBillion(totalCont), sub: `${metrics.reduce((s, m) => s + m.contCount, 0)}건` },
      { label: '신규/계속 비율', value: totalAll > 0 ? (totalNew / totalAll * 100).toFixed(1) + '%' : '-', sub: '신규사업 예산 비중' }
    ].forEach(k => {
      const card = document.createElement('div');
      card.className = 'cc-kpi-card';
      card.innerHTML = `
        <div class="cc-kpi-label">${k.label}</div>
        <div class="cc-kpi-value">${k.value}</div>
        <div class="cc-kpi-sub">${k.sub}</div>
      `;
      kpiRow.appendChild(card);
    });
    sec.appendChild(kpiRow);

    // New vs Continuing bar chart
    const nvWrap = document.createElement('div');
    nvWrap.className = 'cc-chart-container';
    nvWrap.innerHTML = '<div class="cc-chart-title">부처별 신규 vs 계속사업 예산</div>';
    const nvCanvasWrap = document.createElement('div');
    nvCanvasWrap.className = 'cc-chart-canvas-wrap';
    const topMetrics = metrics.slice().sort((a, b) => b.total2026 - a.total2026).slice(0, 15);
    nvCanvasWrap.style.height = Math.max(240, topMetrics.length * 32) + 'px';
    const nvCanvas = document.createElement('canvas');
    const nvId = uid('cc-nv');
    nvCanvas.id = nvId;
    nvCanvasWrap.appendChild(nvCanvas);
    nvWrap.appendChild(nvCanvasWrap);
    sec.appendChild(nvWrap);

    destroyChart(nvId);
    chartInstances[nvId] = new Chart(nvCanvas, {
      type: 'bar',
      data: {
        labels: topMetrics.map(m => m.dept),
        datasets: [
          {
            label: '계속사업',
            data: topMetrics.map(m => m.contBudget / 100),
            backgroundColor: 'rgba(74,158,255,0.7)',
            borderColor: '#4a9eff',
            borderWidth: 1
          },
          {
            label: '신규사업',
            data: topMetrics.map(m => m.newBudget / 100),
            backgroundColor: 'rgba(52,211,153,0.7)',
            borderColor: '#34d399',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: { color: getChartLabelColor(), callback: v => formatBillion(v * 100) },
            grid: { color: getChartGridColor() }
          },
          y: {
            stacked: true,
            ticks: { color: getChartLabelColor(), font: { size: 10 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { labels: { color: getChartLabelColor() } },
          tooltip: {
            callbacks: { label: ctx => `${ctx.dataset.label}: ${formatBillion(ctx.raw * 100)}` }
          }
        }
      }
    });

    // Efficiency ranking table
    const tblWrap = document.createElement('div');
    tblWrap.className = 'cc-chart-container';
    tblWrap.innerHTML = '<div class="cc-chart-title">효율성 지표 랭킹</div>';
    const tblDiv = document.createElement('div');
    tblDiv.className = 'cc-table-wrap';

    let sortCol = 'total2026';
    let sortDir = 'desc';

    function renderEffTable() {
      const sorted = metrics.slice().sort((a, b) => sortDir === 'desc' ? b[sortCol] - a[sortCol] : a[sortCol] - b[sortCol]);
      const cols = [
        { key: 'dept', label: '부처', fmt: v => v },
        { key: 'total2026', label: '총예산', fmt: v => formatBillion(v), cls: 'num' },
        { key: 'count', label: '사업수', fmt: v => v + '건', cls: 'num' },
        { key: 'avgBudget', label: '평균예산', fmt: v => formatBillion(v), cls: 'num' },
        { key: 'hhi', label: 'HHI', fmt: v => v.toFixed(3), cls: 'num' },
        { key: 'subRatio', label: '내역사업비율', fmt: v => v.toFixed(1), cls: 'num' },
        { key: 'newBudget', label: '신규예산', fmt: v => formatBillion(v), cls: 'num' },
        { key: 'contBudget', label: '계속예산', fmt: v => formatBillion(v), cls: 'num' }
      ];

      tblDiv.innerHTML = `
        <table class="cc-table">
          <thead><tr>${cols.map(c =>
            `<th class="${c.cls || ''} ${sortCol === c.key ? (sortDir === 'desc' ? 'sorted-desc' : 'sorted-asc') : ''}" data-col="${c.key}">${c.label}</th>`
          ).join('')}</tr></thead>
          <tbody>${sorted.map(m =>
            `<tr>${cols.map(c => `<td class="${c.cls || ''}">${c.fmt(m[c.key])}</td>`).join('')}</tr>`
          ).join('')}</tbody>
        </table>
      `;

      tblDiv.querySelectorAll('th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.col;
          if (col === 'dept') return;
          if (sortCol === col) sortDir = sortDir === 'desc' ? 'asc' : 'desc';
          else { sortCol = col; sortDir = 'desc'; }
          renderEffTable();
        });
      });
    }

    renderEffTable();
    tblWrap.appendChild(tblDiv);
    sec.appendChild(tblWrap);
  }

  // ════════════════════════════════════════════════════
  // 3. 연도별 추이 비교
  // ════════════════════════════════════════════════════
  let trendRendered = false;
  function renderTrendSection() {
    if (trendRendered) return;
    trendRendered = true;

    const sec = document.getElementById('cc-trend');
    sec.innerHTML = '';

    // Department-level 3-year data
    const deptTrend = departments.map(dept => {
      const projs = deptProjects[dept];
      const b24 = projs.reduce((s, p) => s + B2024(p), 0);
      const b25 = projs.reduce((s, p) => s + B2025(p), 0);
      const b26 = projs.reduce((s, p) => s + B2026(p), 0);
      return { dept, b24, b25, b26 };
    }).filter(d => d.b26 > 0).sort((a, b) => b.b26 - a.b26);

    // Alert badges: >50% increase, >30% decrease
    const alertProjs = DATA.projects.map(p => {
      const b25 = B2025(p);
      const b26 = B2026(p);
      const rate = b25 > 0 ? ((b26 - b25) / b25) : (b26 > 0 ? 999 : 0);
      return { ...p, rate, b25, b26 };
    }).filter(p => p.b26 > 0);

    const bigIncrease = alertProjs.filter(p => p.rate > 0.5 && p.rate < 999 && p.b25 > 0).sort((a, b) => b.rate - a.rate);
    const bigDecrease = alertProjs.filter(p => p.rate < -0.3).sort((a, b) => a.rate - b.rate);
    const brandNew = alertProjs.filter(p => p.rate === 999);

    // KPI
    const kpiRow = document.createElement('div');
    kpiRow.className = 'cc-kpi-row';
    [
      { label: '50% 이상 증가', value: bigIncrease.length + '건', sub: formatBillion(bigIncrease.reduce((s, p) => s + p.b26, 0)) },
      { label: '30% 이상 감소', value: bigDecrease.length + '건', sub: formatBillion(bigDecrease.reduce((s, p) => s + p.b26, 0)) },
      { label: '신규 (순증)', value: brandNew.length + '건', sub: formatBillion(brandNew.reduce((s, p) => s + p.b26, 0)) },
      { label: '전체 증감률', value: (() => {
        const t25 = DATA.projects.reduce((s, p) => s + B2025(p), 0);
        const t26 = DATA.projects.reduce((s, p) => s + B2026(p), 0);
        return t25 > 0 ? ((t26 - t25) / t25 * 100).toFixed(1) + '%' : '-';
      })(), sub: '2025 대비 2026' }
    ].forEach(k => {
      const card = document.createElement('div');
      card.className = 'cc-kpi-card';
      card.innerHTML = `
        <div class="cc-kpi-label">${k.label}</div>
        <div class="cc-kpi-value">${k.value}</div>
        <div class="cc-kpi-sub">${k.sub}</div>
      `;
      kpiRow.appendChild(card);
    });
    sec.appendChild(kpiRow);

    // Alert tables
    function makeAlertTable(title, data, badgeClass, badgeText) {
      const wrap = document.createElement('div');
      wrap.className = 'cc-chart-container';
      wrap.innerHTML = `<div class="cc-chart-title">${title} <span class="cc-alert-badge ${badgeClass}">${data.length}건</span></div>`;

      if (data.length === 0) {
        wrap.innerHTML += '<div class="cc-empty">해당 사업 없음</div>';
        return wrap;
      }

      const tbl = document.createElement('div');
      tbl.className = 'cc-table-wrap';
      const rows = data.slice(0, 30).map(p => `
        <tr>
          <td>${p.department}</td>
          <td>${p.name}</td>
          <td class="num">${formatBillion(p.b25)}</td>
          <td class="num">${formatBillion(p.b26)}</td>
          <td class="num">${p.rate === 999 ? '<span class="cc-alert-badge new">순증</span>' :
            `<span class="cc-alert-badge ${p.rate > 0 ? 'increase' : 'decrease'}">${(p.rate * 100).toFixed(1)}%</span>`
          }</td>
        </tr>
      `).join('');

      tbl.innerHTML = `
        <table class="cc-table">
          <thead><tr>
            <th>부처</th><th>사업명</th><th class="num">2025</th><th class="num">2026</th><th class="num">증감률</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      wrap.appendChild(tbl);
      return wrap;
    }

    const alertGrid = document.createElement('div');
    alertGrid.className = 'grid-2';
    const incWrap = makeAlertTable('50% 이상 증가 사업', bigIncrease, 'increase', '');
    const decWrap = makeAlertTable('30% 이상 감소 사업', bigDecrease, 'decrease', '');
    alertGrid.appendChild(incWrap);
    alertGrid.appendChild(decWrap);
    sec.appendChild(alertGrid);

    // Brand new projects
    sec.appendChild(makeAlertTable('신규 (순증) 사업', brandNew.sort((a, b) => b.b26 - a.b26), 'new', ''));
  }

  // ════════════════════════════════════════════════════
  // 4. AI 기술 도메인 매핑
  // ════════════════════════════════════════════════════
  let domainRendered = false;
  function renderDomainSection() {
    if (domainRendered) return;
    domainRendered = true;

    const sec = document.getElementById('cc-domain');
    sec.innerHTML = '';

    // Build domain data
    const domainBudget = {};
    const domainCount = {};
    const domainDept = {};

    DATA.projects.forEach(p => {
      const doms = classifyDomains(p);
      const b = B2026(p);
      doms.forEach(d => {
        domainBudget[d] = (domainBudget[d] || 0) + b;
        domainCount[d] = (domainCount[d] || 0) + 1;
        if (!domainDept[d]) domainDept[d] = {};
        domainDept[d][p.department] = (domainDept[d][p.department] || 0) + b;
      });
    });

    const allDomains = Object.keys(domainBudget).sort((a, b) => domainBudget[b] - domainBudget[a]);
    const totalBudget = Object.values(domainBudget).reduce((a, b) => a + b, 0);

    // KPI
    const kpiRow = document.createElement('div');
    kpiRow.className = 'cc-kpi-row';
    [
      { label: 'AI 도메인 수', value: allDomains.length + '개', sub: '식별된 기술 영역' },
      { label: '최대 투자 도메인', value: allDomains[0] || '-', sub: formatBillion(domainBudget[allDomains[0]] || 0) },
      { label: '도메인 당 평균', value: allDomains.length > 0 ? formatBillion(totalBudget / allDomains.length) : '-', sub: '평균 예산 투입' },
      { label: '다도메인 사업', value: DATA.projects.filter(p => classifyDomains(p).length > 1).length + '건', sub: '2개 이상 도메인' }
    ].forEach(k => {
      const card = document.createElement('div');
      card.className = 'cc-kpi-card';
      card.innerHTML = `
        <div class="cc-kpi-label">${k.label}</div>
        <div class="cc-kpi-value">${k.value}</div>
        <div class="cc-kpi-sub">${k.sub}</div>
      `;
      kpiRow.appendChild(card);
    });
    sec.appendChild(kpiRow);

    // Domain investment gap analysis vs global trends
    const gapWrap = document.createElement('div');
    gapWrap.className = 'cc-chart-container';
    gapWrap.innerHTML = '<div class="cc-chart-title">글로벌 트렌드 대비 투자 갭 분석</div>';
    const gapCanvasWrap = document.createElement('div');
    gapCanvasWrap.className = 'cc-chart-canvas-wrap';
    gapCanvasWrap.style.height = '320px';
    const gapCanvas = document.createElement('canvas');
    const gapId = uid('cc-gap');
    gapCanvas.id = gapId;
    gapCanvasWrap.appendChild(gapCanvas);
    gapWrap.appendChild(gapCanvasWrap);
    sec.appendChild(gapWrap);

    // Hardcoded global AI investment distribution (% reference, Stanford AI Index 2025 approximation)
    // Keys must match DOMAIN_KEYWORDS keys used by classifyDomains()
    const globalRef = {
      '자연어처리/LLM': 22,
      '컴퓨터비전': 14,
      '로보틱스/자율주행': 12,
      '데이터/빅데이터': 11,
      '보안/사이버': 8,
      '헬스케어/바이오': 10,
      '제조/스마트팩토리': 5,
      '교육/인재양성': 3,
      '공공/행정': 2,
      '국방/안보': 6,
      '환경/기후': 3,
      '금융/핀테크': 4
    };

    // Recompute domain budget using DOMAIN_KEYWORDS only (ignore ai_domains from build_db)
    // to ensure keys match globalRef
    const gapBudget = {};
    DATA.projects.forEach(p => {
      const text = [p.name, p.purpose, p.description, ...(p.keywords || [])].join(' ').toLowerCase();
      const b = B2026(p);
      for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
        if (kws.some(kw => text.includes(kw.toLowerCase()))) {
          gapBudget[domain] = (gapBudget[domain] || 0) + b;
        }
      }
    });

    const gapDomains = Object.keys(globalRef);
    const domesticTotal = gapDomains.reduce((s, d) => s + (gapBudget[d] || 0), 0);
    const domesticPct = gapDomains.map(d => domesticTotal > 0 ? (gapBudget[d] || 0) / domesticTotal * 100 : 0);
    const globalPct = gapDomains.map(d => globalRef[d]);

    destroyChart(gapId);
    chartInstances[gapId] = new Chart(gapCanvas, {
      type: 'bar',
      data: {
        labels: gapDomains.map(d => d.length > 8 ? d.slice(0, 8) + '..' : d),
        datasets: [
          {
            label: '국내 AI 예산 비중 (%)',
            data: domesticPct,
            backgroundColor: 'rgba(74,158,255,0.7)',
            borderColor: '#4a9eff',
            borderWidth: 1,
            borderRadius: 3
          },
          {
            label: '글로벌 투자 비중 (%) (참고)',
            data: globalPct,
            backgroundColor: 'rgba(251,191,36,0.5)',
            borderColor: '#fbbf24',
            borderWidth: 1,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: getChartLabelColor(), font: { size: 9 }, maxRotation: 45 },
            grid: { display: false }
          },
          y: {
            ticks: { color: getChartLabelColor(), callback: v => v + '%' },
            grid: { color: getChartGridColor() },
            title: { display: true, text: '비중 (%)', color: getChartLabelColor() }
          }
        },
        plugins: {
          legend: { labels: { color: getChartLabelColor(), font: { size: 10 } } },
          tooltip: {
            callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%` }
          }
        }
      }
    });

    // Gap analysis legend
    const gapNote = document.createElement('div');
    gapNote.style.cssText = 'font-size:11px;color:var(--text-muted);margin-top:8px;padding:8px 12px;background:var(--bg-secondary);border-radius:8px;border:1px solid var(--border);';
    const gapItems = gapDomains.map((d, i) => {
      const diff = domesticPct[i] - globalPct[i];
      const tag = diff > 2 ? '<span style="color:var(--green)">과잉</span>' :
                  diff < -2 ? '<span style="color:var(--red)">부족</span>' :
                  '<span style="color:var(--yellow)">적정</span>';
      return `${d}: ${tag} (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%p)`;
    });
    gapNote.innerHTML = '<strong>투자 갭 판정:</strong> ' + gapItems.join(' | ');
    gapWrap.appendChild(gapNote);
  }

  // ── Initial render ──
  renderCrossSection();
}
