// ==================== 이상치 탐지 ====================
function renderAnomalyDetection(projects) {
  const anomalies = projects.filter(p => {
    const cr = getChangeRate(p);
    return cr !== 0 && Math.abs(cr) >= 50;
  }).sort((a, b) => Math.abs(getChangeRate(b)) - Math.abs(getChangeRate(a)));

  const container = document.getElementById('anomaly-list-container');
  if (!container) return;

  const showCount = 20;
  const renderList = (items) => {
    let html = `<table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:2px solid var(--border)">
        <th style="text-align:left;padding:6px 8px">사업명</th>
        <th style="text-align:left;padding:6px 4px">부처</th>
        <th style="text-align:right;padding:6px 4px">2025</th>
        <th style="text-align:right;padding:6px 4px">2026</th>
        <th style="text-align:right;padding:6px 8px">증감률</th>
      </tr></thead><tbody>`;
    items.forEach(p => {
      const cr = getChangeRate(p);
      const color = cr > 0 ? 'var(--green)' : 'var(--red)';
      html += `<tr style="border-bottom:1px solid var(--border)">
        <td style="padding:5px 8px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(p.name||'').replace(/"/g,'&quot;')}">${p.name || p.project_name}</td>
        <td style="padding:5px 4px;white-space:nowrap;color:var(--text-secondary)">${p.department}</td>
        <td style="padding:5px 4px;text-align:right">${formatBillion(getBudget2025(p))}</td>
        <td style="padding:5px 4px;text-align:right">${formatBillion(getBudget2026(p))}</td>
        <td style="padding:5px 8px;text-align:right;font-weight:700;color:${color}">${formatRate(cr, p)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  let expanded = false;
  container.innerHTML = renderList(anomalies.slice(0, showCount));
  if (anomalies.length > showCount) {
    const btnDiv = document.createElement('div');
    btnDiv.style.cssText = 'text-align:center;padding:8px';
    const btn = document.createElement('button');
    btn.textContent = `더보기 (${anomalies.length - showCount}개 더)`;
    btn.style.cssText = 'background:var(--bg-tertiary);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);padding:6px 16px;cursor:pointer;font-size:12px';
    btn.addEventListener('click', () => {
      expanded = !expanded;
      container.innerHTML = renderList(expanded ? anomalies : anomalies.slice(0, showCount));
      btn.textContent = expanded ? '접기' : `더보기 (${anomalies.length - showCount}개 더)`;
      container.appendChild(btnDiv);
    });
    btnDiv.appendChild(btn);
    container.appendChild(btnDiv);
  }

  // Anomaly histogram
  const canvas = document.getElementById('chart-anomaly-hist');
  if (!canvas) return;
  if (chartInstances['chart-anomaly-hist']) chartInstances['chart-anomaly-hist'].destroy();

  const bins = [
    { label: '-100~-80%', min: -Infinity, max: -80 },
    { label: '-80~-50%', min: -80, max: -50 },
    { label: '-50~-20%', min: -50, max: -20 },
    { label: '-20~0%', min: -20, max: 0 },
    { label: '0~20%', min: 0, max: 20 },
    { label: '20~50%', min: 20, max: 50 },
    { label: '50~80%', min: 50, max: 80 },
    { label: '80~100%', min: 80, max: 100 },
    { label: '100%+', min: 100, max: Infinity }
  ];
  const counts = bins.map(b => projects.filter(p => {
    const cr = getChangeRate(p);
    return cr > b.min && cr <= b.max;
  }).length);
  const bgColors = bins.map(b => {
    if (b.max <= -50) return '#ef4444';
    if (b.max <= 0) return '#f87171';
    if (b.max <= 50) return '#60a5fa';
    return '#f59e0b';
  });

  chartInstances['chart-anomaly-hist'] = new Chart(canvas, {
    type: 'bar',
    data: { labels: bins.map(b => b.label), datasets: [{ data: counts, backgroundColor: bgColors, borderRadius: 3 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + '개 사업' } } },
      scales: {
        x: { ticks: { color: getChartLabelColor(), font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: getChartLabelColor() }, grid: { color: 'var(--chart-grid)' }, title: { display: true, text: '사업 수', color: getChartLabelColor() } }
      }
    }
  });
}

// ==================== 예산 집중도 (HHI) ====================
function renderHHIAnalysis(projects) {
  const totalBudget = projects.reduce((s, p) => s + getBudget2026(p), 0);
  if (totalBudget <= 0) return;

  const deptBudget = {};
  projects.forEach(p => { deptBudget[p.department] = (deptBudget[p.department] || 0) + getBudget2026(p); });
  const deptShares = Object.values(deptBudget).map(v => v / totalBudget);
  const deptHHI = Math.round(deptShares.reduce((s, sh) => s + sh * sh, 0) * 10000);

  const fieldBudget = {};
  projects.forEach(p => { const f = p.field || '미분류'; fieldBudget[f] = (fieldBudget[f] || 0) + getBudget2026(p); });
  const fieldShares = Object.values(fieldBudget).map(v => v / totalBudget);
  const fieldHHI = Math.round(fieldShares.reduce((s, sh) => s + sh * sh, 0) * 10000);

  function hhiLabel(hhi) {
    if (hhi < 1500) return { text: '분산형', color: 'var(--green)' };
    if (hhi <= 2500) return { text: '중간집중', color: 'var(--yellow)' };
    return { text: '고집중', color: 'var(--red)' };
  }

  const deptInfo = hhiLabel(deptHHI);
  const hhiContainer = document.getElementById('hhi-container');
  if (hhiContainer) {
    hhiContainer.innerHTML = `<div style="text-align:center;padding:12px 0 8px">
      <div style="font-size:28px;font-weight:800;color:${deptInfo.color}">${formatNumber(deptHHI)}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">HHI (부처별) &mdash; <span style="color:${deptInfo.color};font-weight:600">${deptInfo.text}</span></div>
    </div>`;
  }

  const fieldInfo = hhiLabel(fieldHHI);
  const hhiFieldContainer = document.getElementById('hhi-field-container');
  if (hhiFieldContainer) {
    hhiFieldContainer.innerHTML = `<div style="text-align:center;padding:12px 0 8px">
      <div style="font-size:28px;font-weight:800;color:${fieldInfo.color}">${formatNumber(fieldHHI)}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">HHI (분야별) &mdash; <span style="color:${fieldInfo.color};font-weight:600">${fieldInfo.text}</span></div>
    </div>`;
  }

  // Top 5 departments horizontal bar
  const deptSorted = Object.entries(deptBudget).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const canvas1 = document.getElementById('chart-hhi-dept');
  if (canvas1) {
    if (chartInstances['chart-hhi-dept']) chartInstances['chart-hhi-dept'].destroy();
    chartInstances['chart-hhi-dept'] = new Chart(canvas1, {
      type: 'bar',
      data: {
        labels: deptSorted.map(d => d[0].length > 8 ? d[0].slice(0, 8) + '..' : d[0]),
        datasets: [{ data: deptSorted.map(d => +(d[1] / totalBudget * 100).toFixed(1)), backgroundColor: COLORS.slice(0, 5), borderRadius: 3 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + '% (' + formatBillion(deptSorted[ctx.dataIndex][1]) + ')' } } },
        scales: {
          x: { ticks: { color: getChartLabelColor(), callback: v => v + '%' }, grid: { color: 'var(--chart-grid)' } },
          y: { ticks: { color: getChartLabelColor(), font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // Top 5 fields horizontal bar
  const fieldSorted = Object.entries(fieldBudget).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const canvas2 = document.getElementById('chart-hhi-field');
  if (canvas2) {
    if (chartInstances['chart-hhi-field']) chartInstances['chart-hhi-field'].destroy();
    chartInstances['chart-hhi-field'] = new Chart(canvas2, {
      type: 'bar',
      data: {
        labels: fieldSorted.map(d => d[0].length > 10 ? d[0].slice(0, 10) + '..' : d[0]),
        datasets: [{ data: fieldSorted.map(d => +(d[1] / totalBudget * 100).toFixed(1)), backgroundColor: COLORS.slice(0, 5), borderRadius: 3 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw + '% (' + formatBillion(fieldSorted[ctx.dataIndex][1]) + ')' } } },
        scales: {
          x: { ticks: { color: getChartLabelColor(), callback: v => v + '%' }, grid: { color: 'var(--chart-grid)' } },
          y: { ticks: { color: getChartLabelColor(), font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }
}

// ==================== 사업 규모 분포 분석 ====================
function renderBudgetDistDetail(projects) {
  const budgets = projects.map(p => getBudget2026(p)).filter(b => b > 0);
  if (budgets.length === 0) return;

  const sorted = [...budgets].sort((a, b) => a - b);
  const mean = budgets.reduce((s, v) => s + v, 0) / budgets.length;
  const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
  const variance = budgets.reduce((s, v) => s + (v - mean) ** 2, 0) / budgets.length;
  const stddev = Math.sqrt(variance);

  const statsEl = document.getElementById('budget-dist-stats');
  if (statsEl) {
    statsEl.innerHTML = `<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);padding:4px 0">
      <span>평균: <strong style="color:var(--text-primary)">${formatBillion(mean)}</strong></span>
      <span>중앙값: <strong style="color:var(--text-primary)">${formatBillion(median)}</strong></span>
      <span>표준편차: <strong style="color:var(--text-primary)">${formatBillion(stddev)}</strong></span>
    </div>`;
  }

  // Bins in 백만원: 10억=1000, 50억=5000, 100억=10000, 500억=50000, 1000억=100000
  const bins = [
    { label: '0~10억', min: 0, max: 1000 },
    { label: '10~50억', min: 1000, max: 5000 },
    { label: '50~100억', min: 5000, max: 10000 },
    { label: '100~500억', min: 10000, max: 50000 },
    { label: '500~1000억', min: 50000, max: 100000 },
    { label: '1000억+', min: 100000, max: Infinity }
  ];

  const binData = bins.map(b => {
    const items = budgets.filter(v => v >= b.min && v < b.max);
    return { count: items.length, total: items.reduce((s, v) => s + v, 0) };
  });

  const canvas = document.getElementById('chart-budget-dist-detail');
  if (!canvas) return;
  if (chartInstances['chart-budget-dist-detail']) chartInstances['chart-budget-dist-detail'].destroy();

  chartInstances['chart-budget-dist-detail'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: bins.map(b => b.label),
      datasets: [
        { label: '사업 수', data: binData.map(d => d.count), backgroundColor: '#60a5fa', borderRadius: 3, yAxisID: 'y' },
        { label: '총 예산', data: binData.map(d => d.total / 100), backgroundColor: '#f59e0b44', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 3, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getChartLabelColor(), font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + (ctx.datasetIndex === 0 ? ctx.raw + '개' : formatBillion(ctx.raw * 100)) } }
      },
      scales: {
        x: { ticks: { color: getChartLabelColor(), font: { size: 10 } }, grid: { display: false } },
        y: { position: 'left', ticks: { color: getChartLabelColor() }, grid: { color: 'var(--chart-grid)' }, title: { display: true, text: '사업 수', color: getChartLabelColor() } },
        y1: { position: 'right', ticks: { color: '#f59e0b', callback: v => formatBillion(v * 100) }, grid: { display: false }, title: { display: true, text: '총 예산', color: '#f59e0b' } }
      }
    }
  });
}
