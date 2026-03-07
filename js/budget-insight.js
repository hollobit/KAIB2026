/**
 * Budget Insight Tab - 예산 인사이트
 * 서브탭: 이상치 탐지, 예산 집중도, 낭비 리스크, 국회 질의
 * Provides: initBudgetInsightTab(DATA)
 */

function initBudgetInsightTab(DATA) {
  'use strict';

  const container = document.getElementById('tab-insight');
  if (!container) return;

  // Prevent re-render if already built
  if (container.dataset.built === '1') return;
  container.dataset.built = '1';

  const projects = DATA.projects || [];
  const duplicates = DATA.analysis?.duplicates || [];

  // ── Helpers ──
  const B26 = p => getBudget2026(p);
  const B25 = p => getBudget2025(p);
  const CR = p => getChangeRate(p);

  const COLORS_PALETTE = [
    '#4a9eff', '#a78bfa', '#34d399', '#fbbf24', '#f87171',
    '#fb923c', '#f472b6', '#22d3ee', '#818cf8', '#a3e635',
    '#e879f9', '#2dd4bf', '#facc15', '#38bdf8', '#c084fc'
  ];

  // Chart instances for cleanup
  const charts = {};
  function destroyLocalChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  }

  function labelColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--chart-label').trim() || '#8899aa';
  }
  function gridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim() || '#2a3a4e33';
  }

  // Budget scale label
  function budgetScale(b26) {
    if (b26 >= 100000) return { label: '대규모', color: 'var(--red)', bg: 'var(--red-dim)' };
    if (b26 >= 10000) return { label: '중규모', color: 'var(--yellow)', bg: 'var(--yellow-dim)' };
    return { label: '소규모', color: 'var(--green)', bg: 'var(--green-dim)' };
  }

  // Variation type
  function variationType(p) {
    const b25 = B25(p), b26 = B26(p), cr = CR(p);
    if (b25 === 0 && b26 > 0) return { label: '신규사업', color: 'var(--accent)' };
    if (b26 === 0 && b25 > 0) return { label: '폐지사업', color: 'var(--red)' };
    if (cr >= 50) return { label: '급증', color: 'var(--green)' };
    if (cr <= -50) return { label: '급감', color: 'var(--red)' };
    return { label: '변동', color: 'var(--yellow)' };
  }

  // Duplicate group count for a project
  function getDupGroupCount(pid, pname) {
    let count = 0;
    duplicates.forEach(g => {
      const inGroup = (g.projects || []).some(gp => gp.id === pid || gp.name === pname);
      if (inGroup) count++;
    });
    return count;
  }

  // Project period duration
  function getDuration(p) {
    const pp = p.project_period;
    if (!pp) return null;
    if (pp.duration) return pp.duration;
    if (pp.start_year && pp.end_year) return pp.end_year - pp.start_year + 1;
    return null;
  }

  // ── Build Layout ──
  container.innerHTML = `
    <div style="padding:20px;max-width:1400px;margin:0 auto">
      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;border-bottom:2px solid var(--border);padding-bottom:12px">
        <button class="bi-sub-tab active" data-subtab="anomaly" onclick="switchBiSubTab('anomaly')">이상치 탐지</button>
        <button class="bi-sub-tab" data-subtab="concentration" onclick="switchBiSubTab('concentration')">예산 집중도</button>
        <button class="bi-sub-tab" data-subtab="waste" onclick="switchBiSubTab('waste')">낭비 리스크</button>
        <button class="bi-sub-tab" data-subtab="inquiry" onclick="switchBiSubTab('inquiry')">국회 질의</button>
      </div>
      <div id="bi-panel-anomaly" class="bi-panel active"></div>
      <div id="bi-panel-concentration" class="bi-panel" style="display:none"></div>
      <div id="bi-panel-waste" class="bi-panel" style="display:none"></div>
      <div id="bi-panel-inquiry" class="bi-panel" style="display:none"></div>
    </div>
    <style>
      .bi-sub-tab {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
        color: var(--text-secondary); padding: 8px 18px; cursor: pointer; font-size: 13px;
        font-weight: 500; transition: all .2s; font-family: inherit;
      }
      .bi-sub-tab:hover { background: var(--bg-card-hover); color: var(--text-primary); }
      .bi-sub-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
      .bi-panel { animation: biFadeIn .3s ease; }
      @keyframes biFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .bi-card {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow);
      }
      .bi-card-title {
        font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;
        display: flex; align-items: center; gap: 8px;
      }
      .bi-badge {
        display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px;
        font-weight: 600; line-height: 18px;
      }
      .bi-table-wrap { overflow-x: auto; }
      .bi-table {
        width: 100%; border-collapse: collapse; font-size: 13px;
      }
      .bi-table th {
        text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--border);
        color: var(--text-secondary); font-weight: 600; font-size: 12px; white-space: nowrap;
      }
      .bi-table td {
        padding: 7px 10px; border-bottom: 1px solid var(--border);
      }
      .bi-table tr:hover { background: var(--table-row-hover); }
      .bi-table tr[data-pid] { cursor: pointer; }
      .bi-table .num { text-align: right; font-variant-numeric: tabular-nums; }
      .bi-stat-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;
      }
      .bi-stat-card {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; text-align: center;
      }
      .bi-stat-value { font-size: 28px; font-weight: 800; }
      .bi-stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
      .bi-chart-wrap { position: relative; height: 350px; }
      .bi-btn {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px;
        color: var(--text-primary); padding: 6px 14px; cursor: pointer; font-size: 12px;
        font-family: inherit; transition: all .2s;
      }
      .bi-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    </style>
  `;

  // ── Sub-tab switching ──
  window.switchBiSubTab = function(sub) {
    container.querySelectorAll('.bi-sub-tab').forEach(b => b.classList.toggle('active', b.dataset.subtab === sub));
    container.querySelectorAll('.bi-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById('bi-panel-' + sub);
    if (panel) panel.style.display = '';

    if (sub === 'anomaly' && !panel.dataset.rendered) { renderAnomaly(); panel.dataset.rendered = '1'; }
    if (sub === 'concentration' && !panel.dataset.rendered) { renderConcentration(); panel.dataset.rendered = '1'; }
    if (sub === 'waste' && !panel.dataset.rendered) { renderWaste(); panel.dataset.rendered = '1'; }
    if (sub === 'inquiry' && !panel.dataset.rendered) { renderInquiry(); panel.dataset.rendered = '1'; }
  };

  // ══════════════════════════════════════════════
  //  서브탭 1: 이상치 탐지
  // ══════════════════════════════════════════════
  function renderAnomaly() {
    const panel = document.getElementById('bi-panel-anomaly');

    // Detect anomalies: +-50% or new/abolished
    const anomalies = projects.filter(p => {
      const cr = CR(p);
      const b25 = B25(p), b26 = B26(p);
      if (b25 === 0 && b26 > 0) return true; // new
      if (b26 === 0 && b25 > 0) return true; // abolished
      return Math.abs(cr) >= 50;
    }).sort((a, b) => Math.abs(CR(b)) - Math.abs(CR(a)));

    const newProjects = anomalies.filter(p => B25(p) === 0 && B26(p) > 0);
    const abolishedProjects = anomalies.filter(p => B26(p) === 0 && B25(p) > 0);
    const increaseProjects = anomalies.filter(p => CR(p) >= 50 && B25(p) > 0 && B26(p) > 0);
    const decreaseProjects = anomalies.filter(p => CR(p) <= -50 && B25(p) > 0 && B26(p) > 0);

    const large = anomalies.filter(p => B26(p) >= 100000 || B25(p) >= 100000);
    const medium = anomalies.filter(p => {
      const mx = Math.max(B26(p), B25(p));
      return mx >= 10000 && mx < 100000;
    });
    const small = anomalies.filter(p => Math.max(B26(p), B25(p)) < 10000);

    // Summary stats
    panel.innerHTML = `
      <div class="bi-stat-grid">
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--accent)">${anomalies.length}</div>
          <div class="bi-stat-label">이상 변동 사업</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--green)">${newProjects.length}</div>
          <div class="bi-stat-label">신규사업 (순증)</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--red)">${abolishedProjects.length}</div>
          <div class="bi-stat-label">폐지사업</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--yellow)">${formatBillion(anomalies.reduce((s, p) => s + Math.abs(B26(p) - B25(p)), 0))}</div>
          <div class="bi-stat-label">이상 변동 총액</div>
        </div>
      </div>

      <div class="bi-card">
        <div class="bi-card-title">
          예산 규모별 분포
          <span class="bi-badge" style="background:var(--red-dim);color:var(--red)">대규모 ${large.length}</span>
          <span class="bi-badge" style="background:var(--yellow-dim);color:var(--yellow)">중규모 ${medium.length}</span>
          <span class="bi-badge" style="background:var(--green-dim);color:var(--green)">소규모 ${small.length}</span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
          <button class="bi-btn bi-anom-filter active" data-filter="all" onclick="biFilterAnomaly('all',this)">전체 (${anomalies.length})</button>
          <button class="bi-btn bi-anom-filter" data-filter="new" onclick="biFilterAnomaly('new',this)">신규 (${newProjects.length})</button>
          <button class="bi-btn bi-anom-filter" data-filter="abolished" onclick="biFilterAnomaly('abolished',this)">폐지 (${abolishedProjects.length})</button>
          <button class="bi-btn bi-anom-filter" data-filter="increase" onclick="biFilterAnomaly('increase',this)">급증 (${increaseProjects.length})</button>
          <button class="bi-btn bi-anom-filter" data-filter="decrease" onclick="biFilterAnomaly('decrease',this)">급감 (${decreaseProjects.length})</button>
          <button class="bi-btn bi-anom-filter" data-filter="large" onclick="biFilterAnomaly('large',this)">대규모 (${large.length})</button>
        </div>
        <div class="bi-table-wrap">
          <table class="bi-table" id="bi-anomaly-table">
            <thead><tr>
              <th>사업명</th><th>부처</th><th class="num">2025 예산</th><th class="num">2026 예산</th>
              <th class="num">증감률</th><th>변동유형</th><th>규모</th>
            </tr></thead>
            <tbody id="bi-anomaly-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="bi-card">
        <div class="bi-card-title">변동률 분포 히스토그램</div>
        <div class="bi-chart-wrap"><canvas id="bi-chart-anomaly-hist"></canvas></div>
      </div>
    `;

    // Anomaly table rendering
    const allAnomalies = {
      all: anomalies, new: newProjects, abolished: abolishedProjects,
      increase: increaseProjects, decrease: decreaseProjects, large: large
    };
    let currentFilter = 'all';

    function renderAnomalyTable(items) {
      const tbody = document.getElementById('bi-anomaly-tbody');
      if (!tbody) return;
      tbody.innerHTML = items.map(p => {
        const vt = variationType(p);
        const sc = budgetScale(Math.max(B26(p), B25(p)));
        return `<tr data-pid="${p.id}" onclick="showProjectModal(${p.id})">
          <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(p.project_name || p.name || '').replace(/"/g, '&quot;')}">${p.project_name || p.name}</td>
          <td style="white-space:nowrap;color:var(--text-secondary)">${p.department}</td>
          <td class="num">${formatBillion(B25(p))}</td>
          <td class="num">${formatBillion(B26(p))}</td>
          <td class="num" style="font-weight:700;color:${CR(p) >= 0 ? 'var(--green)' : 'var(--red)'}">${formatRate(CR(p), p)}</td>
          <td><span class="bi-badge" style="color:${vt.color};border:1px solid ${vt.color}">${vt.label}</span></td>
          <td><span class="bi-badge" style="background:${sc.bg};color:${sc.color}">${sc.label}</span></td>
        </tr>`;
      }).join('');
    }

    renderAnomalyTable(anomalies);

    window.biFilterAnomaly = function(filter, btn) {
      currentFilter = filter;
      panel.querySelectorAll('.bi-anom-filter').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderAnomalyTable(allAnomalies[filter] || anomalies);
    };

    // Histogram
    const histCanvas = document.getElementById('bi-chart-anomaly-hist');
    if (histCanvas) {
      const bins = [
        { label: '-100%', min: -Infinity, max: -99.9 },
        { label: '-99~-80%', min: -99.9, max: -80 },
        { label: '-80~-50%', min: -80, max: -50 },
        { label: '-50~-30%', min: -50, max: -30 },
        { label: '-30~0%', min: -30, max: 0 },
        { label: '0~30%', min: 0, max: 30 },
        { label: '30~50%', min: 30, max: 50 },
        { label: '50~80%', min: 50, max: 80 },
        { label: '80~100%', min: 80, max: 100 },
        { label: '100%+', min: 100, max: Infinity }
      ];
      const counts = bins.map(b => {
        return projects.filter(p => {
          const cr = CR(p);
          if (B25(p) === 0 && B26(p) > 0) return b.label === '100%+';
          return cr > b.min && cr <= b.max;
        }).length;
      });
      const barColors = bins.map(b => {
        if (b.max <= -50) return 'rgba(248,113,113,0.7)';
        if (b.min >= 50) return 'rgba(52,211,153,0.7)';
        return 'rgba(74,158,255,0.5)';
      });

      destroyLocalChart('bi-chart-anomaly-hist');
      charts['bi-chart-anomaly-hist'] = new Chart(histCanvas, {
        type: 'bar',
        data: {
          labels: bins.map(b => b.label),
          datasets: [{ label: '사업 수', data: counts, backgroundColor: barColors, borderRadius: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.raw}개 사업` } }
          },
          scales: {
            x: { ticks: { color: labelColor() }, grid: { display: false } },
            y: { ticks: { color: labelColor() }, grid: { color: gridColor() }, title: { display: true, text: '사업 수', color: labelColor() } }
          }
        }
      });
    }
  }

  // ══════════════════════════════════════════════
  //  서브탭 2: 예산 집중도
  // ══════════════════════════════════════════════
  function renderConcentration() {
    const panel = document.getElementById('bi-panel-concentration');

    // Department budget map
    const deptBudget = {};
    projects.forEach(p => {
      const d = p.department;
      deptBudget[d] = (deptBudget[d] || 0) + B26(p);
    });
    const deptEntries = Object.entries(deptBudget).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const totalBudget = deptEntries.reduce((s, [, v]) => s + v, 0);

    // Field budget map
    const fieldBudget = {};
    projects.forEach(p => {
      const f = p.field || '미분류';
      fieldBudget[f] = (fieldBudget[f] || 0) + B26(p);
    });
    const fieldEntries = Object.entries(fieldBudget).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const totalFieldBudget = fieldEntries.reduce((s, [, v]) => s + v, 0);

    // HHI calculation
    function calcHHI(entries, total) {
      if (total === 0) return 0;
      return entries.reduce((s, [, v]) => s + Math.pow((v / total) * 100, 2), 0);
    }

    const hhiDept = calcHHI(deptEntries, totalBudget);
    const hhiField = calcHHI(fieldEntries, totalFieldBudget);

    function hhiLabel(hhi) {
      if (hhi < 1000) return { text: '분산', color: 'var(--green)' };
      if (hhi < 1800) return { text: '보통', color: 'var(--yellow)' };
      return { text: '집중', color: 'var(--red)' };
    }

    // Gini coefficient
    function calcGini(values) {
      const sorted = [...values].sort((a, b) => a - b);
      const n = sorted.length;
      if (n === 0) return 0;
      const mean = sorted.reduce((s, v) => s + v, 0) / n;
      if (mean === 0) return 0;
      let sumDiff = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          sumDiff += Math.abs(sorted[i] - sorted[j]);
        }
      }
      return sumDiff / (2 * n * n * mean);
    }

    const gini = calcGini(deptEntries.map(([, v]) => v));
    const hhiDeptLabel = hhiLabel(hhiDept);
    const hhiFieldLabel = hhiLabel(hhiField);

    // Top department share
    const top5Share = deptEntries.slice(0, 5).reduce((s, [, v]) => s + v, 0) / totalBudget * 100;

    panel.innerHTML = `
      <div class="bi-stat-grid">
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:${hhiDeptLabel.color}">${Math.round(hhiDept)}</div>
          <div class="bi-stat-label">HHI 부처별 <span class="bi-badge" style="background:${hhiDeptLabel.color};color:#fff">${hhiDeptLabel.text}</span></div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:${hhiFieldLabel.color}">${Math.round(hhiField)}</div>
          <div class="bi-stat-label">HHI 분야별 <span class="bi-badge" style="background:${hhiFieldLabel.color};color:#fff">${hhiFieldLabel.text}</span></div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--accent)">${gini.toFixed(3)}</div>
          <div class="bi-stat-label">지니계수 (부처별)</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--purple)">${top5Share.toFixed(1)}%</div>
          <div class="bi-stat-label">상위 5개 부처 점유율</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="bi-card">
          <div class="bi-card-title">HHI 해석 가이드</div>
          <div style="font-size:13px;line-height:1.8;color:var(--text-secondary)">
            <div><span class="bi-badge" style="background:var(--green-dim);color:var(--green)">1,000 미만</span> 분산 - 경쟁적 구조, 다수 부처에 균등 배분</div>
            <div><span class="bi-badge" style="background:var(--yellow-dim);color:var(--yellow)">1,000~1,800</span> 보통 - 일부 부처에 집중, 적정 수준</div>
            <div><span class="bi-badge" style="background:var(--red-dim);color:var(--red)">1,800 이상</span> 집중 - 소수 부처에 과도하게 집중</div>
            <div style="margin-top:8px"><strong>지니계수:</strong> 0에 가까울수록 균등, 1에 가까울수록 불균등</div>
          </div>
        </div>
        <div class="bi-card">
          <div class="bi-card-title">상위 10개 부처 예산 점유율</div>
          <div style="font-size:13px">
            ${deptEntries.slice(0, 10).map(([d, v], i) => {
              const pct = (v / totalBudget * 100).toFixed(1);
              return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="width:20px;text-align:right;color:var(--text-muted);font-size:11px">${i + 1}</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d}</span>
                <div style="width:120px;height:14px;background:var(--border);border-radius:3px;overflow:hidden">
                  <div style="width:${Math.min(pct, 100)}%;height:100%;background:${COLORS_PALETTE[i % COLORS_PALETTE.length]};border-radius:3px"></div>
                </div>
                <span style="width:60px;text-align:right;font-weight:600;font-size:12px">${pct}%</span>
                <span style="width:70px;text-align:right;color:var(--text-secondary);font-size:11px">${formatBillion(v)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="bi-card">
          <div class="bi-card-title">로렌츠 곡선 (부처별 예산)</div>
          <div class="bi-chart-wrap"><canvas id="bi-chart-lorenz"></canvas></div>
        </div>
        <div class="bi-card">
          <div class="bi-card-title">부처별 예산 점유율</div>
          <div class="bi-chart-wrap"><canvas id="bi-chart-dept-share"></canvas></div>
        </div>
      </div>
    `;

    // Lorenz curve
    const lorenzCanvas = document.getElementById('bi-chart-lorenz');
    if (lorenzCanvas) {
      const sorted = deptEntries.map(([, v]) => v).sort((a, b) => a - b);
      const cumPop = [];
      const cumBudget = [];
      let cumB = 0;
      for (let i = 0; i < sorted.length; i++) {
        cumB += sorted[i];
        cumPop.push(((i + 1) / sorted.length) * 100);
        cumBudget.push((cumB / totalBudget) * 100);
      }
      // Add origin
      const lorenzPop = [0, ...cumPop];
      const lorenzBudgetPct = [0, ...cumBudget];
      const equality = lorenzPop.map(v => v);

      destroyLocalChart('bi-chart-lorenz');
      charts['bi-chart-lorenz'] = new Chart(lorenzCanvas, {
        type: 'line',
        data: {
          labels: lorenzPop.map(v => v.toFixed(0) + '%'),
          datasets: [
            {
              label: '완전균등선',
              data: equality,
              borderColor: 'rgba(74,158,255,0.4)',
              borderDash: [6, 4],
              borderWidth: 2,
              pointRadius: 0,
              fill: false
            },
            {
              label: '로렌츠 곡선',
              data: lorenzBudgetPct,
              borderColor: '#f87171',
              borderWidth: 2.5,
              pointRadius: 0,
              fill: { target: 0, above: 'rgba(248,113,113,0.12)' }
            }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: labelColor(), font: { size: 11 } } },
            tooltip: {
              callbacks: {
                title: ctx => `누적 부처 비율: ${ctx[0].label}`,
                label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: '누적 부처 비율 (%)', color: labelColor() },
              ticks: { color: labelColor(), maxTicksLimit: 10 },
              grid: { color: gridColor() }
            },
            y: {
              title: { display: true, text: '누적 예산 비율 (%)', color: labelColor() },
              ticks: { color: labelColor() },
              grid: { color: gridColor() },
              min: 0, max: 100
            }
          }
        }
      });
    }

    // Department share bar chart
    const shareCanvas = document.getElementById('bi-chart-dept-share');
    if (shareCanvas) {
      const top15 = deptEntries.slice(0, 15);
      destroyLocalChart('bi-chart-dept-share');
      charts['bi-chart-dept-share'] = new Chart(shareCanvas, {
        type: 'bar',
        data: {
          labels: top15.map(([d]) => d.length > 8 ? d.slice(0, 7) + '..' : d),
          datasets: [{
            label: '2026 예산',
            data: top15.map(([, v]) => v),
            backgroundColor: top15.map((_, i) => COLORS_PALETTE[i % COLORS_PALETTE.length] + 'cc'),
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `${formatBillion(ctx.raw)} (${(ctx.raw / totalBudget * 100).toFixed(1)}%)`
              }
            }
          },
          scales: {
            x: { ticks: { color: labelColor(), callback: v => formatBillion(v) }, grid: { color: gridColor() } },
            y: { ticks: { color: labelColor(), font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }
  }

  // ══════════════════════════════════════════════
  //  서브탭 3: 낭비 리스크
  // ══════════════════════════════════════════════
  function renderWaste() {
    const panel = document.getElementById('bi-panel-waste');

    // Build duplicate project ID set
    const dupIds = new Set();
    duplicates.forEach(g => {
      (g.projects || []).forEach(gp => { if (gp.id != null) dupIds.add(gp.id); });
    });
    // Also match by name if IDs are missing
    if (dupIds.size === 0) {
      const dupNames = new Set();
      duplicates.forEach(g => (g.projects || []).forEach(gp => dupNames.add(gp.name)));
      projects.forEach(p => {
        if (dupNames.has(p.project_name || p.name)) dupIds.add(p.id);
      });
    }

    // Score calculation
    function calcScore(p) {
      let score = 0;

      // Overlap score (30 points)
      const groupCount = getDupGroupCount(p.id, p.project_name || p.name);
      score += Math.min(groupCount * 15, 30);

      // Budget increase rate (25 points)
      const cr = Math.abs(CR(p));
      if (cr >= 100) score += 25;
      else if (cr >= 80) score += 20;
      else if (cr >= 50) score += 15;
      else if (cr >= 30) score += 8;

      // Project duration (20 points)
      const dur = getDuration(p);
      if (dur !== null) {
        if (dur >= 15) score += 20;
        else if (dur >= 10) score += 15;
        else if (dur >= 7) score += 8;
      }

      // Zero budget (25 points)
      if (B26(p) === 0) score += 25;

      return Math.min(score, 100);
    }

    function getGrade(score) {
      if (score >= 70) return { label: '높음', color: 'var(--red)', bg: 'var(--red-dim)' };
      if (score >= 40) return { label: '보통', color: 'var(--yellow)', bg: 'var(--yellow-dim)' };
      return { label: '낮음', color: 'var(--green)', bg: 'var(--green-dim)' };
    }

    const scored = projects.map(p => {
      const score = calcScore(p);
      return { project: p, score, grade: getGrade(score) };
    }).sort((a, b) => b.score - a.score);

    const highRisk = scored.filter(s => s.score >= 70);
    const medRisk = scored.filter(s => s.score >= 40 && s.score < 70);
    const lowRisk = scored.filter(s => s.score < 40);
    const avgScore = (scored.reduce((s, r) => s + r.score, 0) / scored.length).toFixed(1);

    panel.innerHTML = `
      <div class="bi-stat-grid">
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--red)">${highRisk.length}</div>
          <div class="bi-stat-label">고위험 사업 (70+)</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--yellow)">${medRisk.length}</div>
          <div class="bi-stat-label">보통 위험 (40~70)</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--green)">${lowRisk.length}</div>
          <div class="bi-stat-label">저위험 (~40)</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--accent)">${avgScore}</div>
          <div class="bi-stat-label">평균 위험 점수</div>
        </div>
      </div>

      <div class="bi-card">
        <div class="bi-card-title">점수 산정 기준</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;font-size:13px;color:var(--text-secondary)">
          <div><strong style="color:var(--text-primary)">중복도 (30점)</strong><br>유사 그룹 수 x 15점</div>
          <div><strong style="color:var(--text-primary)">예산증가율 (25점)</strong><br>100%+: 25, 80%+: 20, 50%+: 15</div>
          <div><strong style="color:var(--text-primary)">사업기간 (20점)</strong><br>15년+: 20, 10년+: 15, 7년+: 8</div>
          <div><strong style="color:var(--text-primary)">0원예산 (25점)</strong><br>2026 예산 0원이면 25점</div>
        </div>
      </div>

      <div class="bi-card">
        <div class="bi-card-title">상위 30개 위험 사업</div>
        <div class="bi-table-wrap">
          <table class="bi-table">
            <thead><tr>
              <th>#</th><th>사업명</th><th>부처</th><th class="num">2026 예산</th>
              <th class="num">증감률</th><th class="num">위험점수</th><th>등급</th>
            </tr></thead>
            <tbody>
              ${scored.slice(0, 30).map((s, i) => {
                const p = s.project;
                return `<tr data-pid="${p.id}" onclick="showProjectModal(${p.id})">
                  <td style="color:var(--text-muted)">${i + 1}</td>
                  <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(p.project_name || p.name || '').replace(/"/g, '&quot;')}">${p.project_name || p.name}</td>
                  <td style="white-space:nowrap;color:var(--text-secondary)">${p.department}</td>
                  <td class="num">${formatBillion(B26(p))}</td>
                  <td class="num" style="color:${CR(p) >= 0 ? 'var(--green)' : 'var(--red)'}">${formatRate(CR(p), p)}</td>
                  <td class="num" style="font-weight:700">${s.score}</td>
                  <td><span class="bi-badge" style="background:${s.grade.bg};color:${s.grade.color}">${s.grade.label}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bi-card">
        <div class="bi-card-title">위험 점수 분포 히스토그램</div>
        <div class="bi-chart-wrap"><canvas id="bi-chart-waste-hist"></canvas></div>
      </div>
    `;

    // Histogram
    const histCanvas = document.getElementById('bi-chart-waste-hist');
    if (histCanvas) {
      const binSize = 10;
      const bins = [];
      for (let i = 0; i <= 90; i += binSize) {
        bins.push({ label: `${i}-${i + binSize}`, min: i, max: i + binSize });
      }
      const counts = bins.map(b => scored.filter(s => s.score >= b.min && s.score < b.max).length);
      // Last bin includes 100
      counts[counts.length - 1] += scored.filter(s => s.score >= 100).length;

      const barColors = bins.map(b => {
        if (b.min >= 70) return 'rgba(248,113,113,0.7)';
        if (b.min >= 40) return 'rgba(251,191,36,0.7)';
        return 'rgba(52,211,153,0.5)';
      });

      destroyLocalChart('bi-chart-waste-hist');
      charts['bi-chart-waste-hist'] = new Chart(histCanvas, {
        type: 'bar',
        data: {
          labels: bins.map(b => b.label),
          datasets: [{ label: '사업 수', data: counts, backgroundColor: barColors, borderRadius: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.raw}개 사업` } }
          },
          scales: {
            x: { ticks: { color: labelColor() }, grid: { display: false }, title: { display: true, text: '위험 점수', color: labelColor() } },
            y: { ticks: { color: labelColor() }, grid: { color: gridColor() }, title: { display: true, text: '사업 수', color: labelColor() } }
          }
        }
      });
    }
  }

  // ══════════════════════════════════════════════
  //  서브탭 4: 국회 질의
  // ══════════════════════════════════════════════
  function renderInquiry() {
    const panel = document.getElementById('bi-panel-inquiry');

    // Generate inquiry points per project
    function generateInquiryPoints(p) {
      const points = [];
      const cr = CR(p);
      const b25 = B25(p), b26 = B26(p);

      // 1. 50%+ increase
      if (cr >= 50 && b25 > 0) {
        points.push({
          type: 'budget-surge',
          icon: '1',
          label: '예산 급증 사유',
          detail: `전년(${formatBillion(b25)}) 대비 ${formatRate(cr, p)} 증가하여 ${formatBillion(b26)}으로 편성. 급증 사유 및 집행 계획 확인 필요.`,
          severity: 'high'
        });
      }

      // 2. Duplicate projects
      const dupCount = getDupGroupCount(p.id, p.project_name || p.name);
      if (dupCount > 0) {
        points.push({
          type: 'duplicate',
          icon: '2',
          label: '중복 사업 통합 검토',
          detail: `${dupCount}개 유사 사업 그룹에 포함. 유사 사업 간 통합 또는 조정 검토 필요.`,
          severity: 'high'
        });
      }

      // 3. Long-running project (10+)
      const dur = getDuration(p);
      if (dur !== null && dur >= 10) {
        points.push({
          type: 'long-term',
          icon: '3',
          label: '장기 사업 성과 평가',
          detail: `사업기간 ${dur}년으로 장기 사업. 중간 성과 평가 및 지속 사유 확인 필요.`,
          severity: 'medium'
        });
      }

      // 4. Zero budget
      if (b26 === 0) {
        points.push({
          type: 'zero-budget',
          icon: '4',
          label: '미집행/미편성 사유',
          detail: `2026년 예산이 0원으로 편성. 미편성 사유 및 사업 존속 여부 확인 필요.`,
          severity: 'high'
        });
      }

      // 5. Sub-budget mismatch
      const subValid = validateSubBudget(p);
      if (subValid && subValid.hasWarning) {
        points.push({
          type: 'sub-mismatch',
          icon: '5',
          label: '예산 편성 정확성',
          detail: `내역사업 합계(${formatBillion(subValid.subSum)})와 모사업 예산(${formatBillion(subValid.parentBudget)})이 ${subValid.diffPct}% 차이. 편성 정확성 확인 필요.`,
          severity: 'medium'
        });
      }

      return points;
    }

    // Collect all projects with inquiry points, grouped by department
    const allInquiries = [];
    projects.forEach(p => {
      const points = generateInquiryPoints(p);
      if (points.length > 0) {
        allInquiries.push({ project: p, points });
      }
    });

    // Group by department
    const byDept = {};
    allInquiries.forEach(item => {
      const d = item.project.department;
      if (!byDept[d]) byDept[d] = [];
      byDept[d].push(item);
    });
    const deptKeys = Object.keys(byDept).sort((a, b) => byDept[b].length - byDept[a].length);

    // Stats
    const totalPoints = allInquiries.reduce((s, item) => s + item.points.length, 0);
    const typeCount = {};
    allInquiries.forEach(item => item.points.forEach(pt => {
      typeCount[pt.type] = (typeCount[pt.type] || 0) + 1;
    }));

    panel.innerHTML = `
      <div class="bi-stat-grid">
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--accent)">${allInquiries.length}</div>
          <div class="bi-stat-label">질의 대상 사업</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--purple)">${totalPoints}</div>
          <div class="bi-stat-label">총 질의 포인트</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--red)">${typeCount['budget-surge'] || 0}</div>
          <div class="bi-stat-label">예산 급증 사유</div>
        </div>
        <div class="bi-stat-card">
          <div class="bi-stat-value" style="color:var(--yellow)">${typeCount['duplicate'] || 0}</div>
          <div class="bi-stat-label">중복 사업 검토</div>
        </div>
      </div>

      <div class="bi-card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div class="bi-card-title" style="margin-bottom:0">질의 유형별 현황</div>
          <div style="display:flex;gap:8px">
            <button class="bi-btn" onclick="biDownloadInquiryMd()">Markdown 다운로드</button>
            <button class="bi-btn" onclick="biDownloadInquiryTxt()">텍스트 다운로드</button>
          </div>
        </div>
        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;font-size:13px">
          <div style="padding:8px;background:var(--red-dim);border-radius:6px"><strong>${typeCount['budget-surge'] || 0}</strong> 예산 급증 사유</div>
          <div style="padding:8px;background:var(--yellow-dim);border-radius:6px"><strong>${typeCount['duplicate'] || 0}</strong> 중복 사업 통합</div>
          <div style="padding:8px;background:var(--purple-dim);border-radius:6px"><strong>${typeCount['long-term'] || 0}</strong> 장기 사업 평가</div>
          <div style="padding:8px;background:var(--accent-dim);border-radius:6px"><strong>${typeCount['zero-budget'] || 0}</strong> 미집행/미편성</div>
          <div style="padding:8px;background:var(--green-dim);border-radius:6px"><strong>${typeCount['sub-mismatch'] || 0}</strong> 편성 정확성</div>
        </div>
      </div>

      <div id="bi-inquiry-list"></div>
    `;

    // Render department groups
    const listEl = document.getElementById('bi-inquiry-list');
    let listHtml = '';
    deptKeys.forEach(dept => {
      const items = byDept[dept];
      const deptPointCount = items.reduce((s, it) => s + it.points.length, 0);
      listHtml += `
        <div class="bi-card">
          <div class="bi-card-title" style="cursor:pointer" onclick="this.parentElement.querySelector('.bi-inquiry-body').classList.toggle('bi-collapsed')">
            ${dept}
            <span class="bi-badge" style="background:var(--accent-dim);color:var(--accent)">${items.length}개 사업</span>
            <span class="bi-badge" style="background:var(--purple-dim);color:var(--purple)">${deptPointCount}개 질의</span>
            <span style="margin-left:auto;color:var(--text-muted);font-size:12px">클릭하여 접기/펼치기</span>
          </div>
          <div class="bi-inquiry-body">
            ${items.map(item => {
              const p = item.project;
              return `
                <div style="border-left:3px solid var(--accent);padding:10px 14px;margin-bottom:10px;background:var(--bg-card-hover);border-radius:0 8px 8px 0;cursor:pointer" onclick="showProjectModal(${p.id})">
                  <div style="font-weight:600;font-size:14px;margin-bottom:6px">
                    ${p.project_name || p.name}
                    <span style="font-weight:400;font-size:12px;color:var(--text-secondary);margin-left:8px">${formatBillion(B26(p))}</span>
                  </div>
                  ${item.points.map(pt => {
                    const sevColor = pt.severity === 'high' ? 'var(--red)' : 'var(--yellow)';
                    return `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px;font-size:13px">
                      <span class="bi-badge" style="color:${sevColor};border:1px solid ${sevColor};flex-shrink:0">${pt.label}</span>
                      <span style="color:var(--text-secondary)">${pt.detail}</span>
                    </div>`;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });
    listEl.innerHTML = listHtml;

    // Collapse style
    const style = document.createElement('style');
    style.textContent = '.bi-collapsed { display: none !important; }';
    panel.appendChild(style);

    // Download functions
    window.biDownloadInquiryMd = function() {
      let md = `# 2026 AI 재정사업 국회 질의 포인트\n\n`;
      md += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
      md += `- 질의 대상 사업: ${allInquiries.length}개\n`;
      md += `- 총 질의 포인트: ${totalPoints}개\n\n`;

      deptKeys.forEach(dept => {
        md += `## ${dept}\n\n`;
        byDept[dept].forEach(item => {
          const p = item.project;
          md += `### ${p.project_name || p.name} (${formatBillion(B26(p))})\n\n`;
          item.points.forEach(pt => {
            md += `- **[${pt.label}]** ${pt.detail}\n`;
          });
          md += '\n';
        });
      });

      downloadText(md, '국회질의포인트.md', 'text/markdown');
    };

    window.biDownloadInquiryTxt = function() {
      let txt = `2026 AI 재정사업 국회 질의 포인트\n`;
      txt += `${'='.repeat(50)}\n\n`;
      txt += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n`;
      txt += `질의 대상 사업: ${allInquiries.length}개 | 총 질의 포인트: ${totalPoints}개\n\n`;

      deptKeys.forEach(dept => {
        txt += `\n[${ dept }] (${byDept[dept].length}개 사업)\n`;
        txt += `${'-'.repeat(40)}\n`;
        byDept[dept].forEach(item => {
          const p = item.project;
          txt += `\n  ${p.project_name || p.name} (${formatBillion(B26(p))})\n`;
          item.points.forEach(pt => {
            txt += `    * [${pt.label}] ${pt.detail}\n`;
          });
        });
      });

      downloadText(txt, '국회질의포인트.txt', 'text/plain');
    };

    function downloadText(content, filename, mime) {
      const blob = new Blob([content], { type: mime + ';charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // ── Initial render ──
  renderAnomaly();
  document.getElementById('bi-panel-anomaly').dataset.rendered = '1';
}
