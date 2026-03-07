/**
 * AI 기술 분석 탭 - AI 기술 세분화, R&D 단계 분류, 비용효과성 분석
 * 라이트/다크 테마 모두 지원 (CSS 변수 사용)
 */
(function() {
'use strict';

const TECH_COLORS = {
  '생성AI/LLM': '#7c3aed',
  '파운데이션모델': '#a855f7',
  'AGI/Agent': '#8b5cf6',
  '컴퓨터비전': '#2563eb',
  '자연어처리': '#0891b2',
  '강화학습/최적화': '#059669',
  '예측/분석AI': '#d97706',
  '로보틱스/자율시스템': '#dc2626',
  '피지컬/휴머노이드': '#e11d48',
  '신약/의료AI': '#14b8a6',
  'AI반도체/HW': '#db2777',
  'GPU/클라우드': '#f472b6',
  '데이터/MLOps': '#4f46e5',
  '제조/산업AI': '#ea580c',
  'AI안전/신뢰': '#0d9488',
  'AI보안': '#6366f1',
  '미분류': '#6b7280'
};

const STAGE_COLORS = {
  '기초연구': '#7c3aed',
  '응용연구': '#2563eb',
  '개발': '#059669',
  '실증/시범': '#d97706',
  '사업화/확산': '#dc2626',
  '미분류': '#6b7280'
};

const STAGE_ORDER = ['기초연구', '응용연구', '개발', '실증/시범', '사업화/확산'];

function getBudget2026(p) {
  return (p.budget && p.budget['2026_budget']) || 0;
}

function formatBillion(v) {
  const billion = v / 100; // 백만원 → 억원
  if (Math.abs(billion) >= 10000) return (billion / 10000).toFixed(1) + '조';
  if (Math.abs(billion) >= 1) return billion.toFixed(1) + '억';
  return v.toFixed(0) + '백만';
}

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

window.initAiTechTab = function(DATA) {
  const container = document.getElementById('tab-ai-tech');
  if (!container || container.dataset.rendered) return;
  container.dataset.rendered = '1';

  const projects = DATA.projects || [];

  container.innerHTML = `
    <div class="card" style="margin-bottom:0;padding-bottom:10px;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="ait-sub active" onclick="window.switchAiTechSub('tech-overview')">AI 기술 분포</button>
        <button class="ait-sub" onclick="window.switchAiTechSub('rnd-stage')">R&D 단계 분석</button>
        <button class="ait-sub" onclick="window.switchAiTechSub('tech-dept')">기술 × 부처 매트릭스</button>
        <button class="ait-sub" onclick="window.switchAiTechSub('effectiveness')">비용효과성 분석</button>
      </div>
    </div>
    <div id="ai-tech-content"></div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    /* ── Sub-tab buttons ── */
    .ait-sub {
      padding: 8px 20px; border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent; color: var(--text-secondary);
      cursor: pointer; font-size: 14px; font-weight: 500;
      transition: all 0.2s;
    }
    .ait-sub:hover {
      border-color: var(--accent); color: var(--accent);
      background: var(--accent-dim);
    }
    .ait-sub.active {
      background: var(--accent); color: #fff;
      border-color: var(--accent); font-weight: 600;
    }

    /* ── Chart container ── */
    .ait-chart-box {
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 24px; margin: 14px 0;
    }

    /* ── Horizontal bar chart ── */
    .ait-bar { display: flex; align-items: center; margin: 10px 0; gap: 12px; border-radius: 8px; padding: 2px 4px; transition: background 0.15s; }
    .ait-bar[style*="cursor:pointer"]:hover { background: var(--accent-dim); }
    .ait-bar-label {
      min-width: 160px; font-size: 14px; font-weight: 600;
      color: var(--text-primary); text-align: right;
    }
    .ait-bar-track {
      flex: 1; height: 36px; background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px; overflow: visible; position: relative;
    }
    .ait-bar-fill {
      height: 100%; border-radius: 8px; transition: width 0.5s;
      display: flex; align-items: center; padding: 0 12px;
      min-width: fit-content; position: relative;
    }
    .ait-bar-val {
      font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    .ait-bar-extra {
      font-size: 13px; font-weight: 600; color: var(--text-secondary);
      min-width: 70px;
    }
    .ait-bar-outside {
      position: absolute; top: 50%; transform: translateY(-50%);
      font-size: 13px; font-weight: 700; color: var(--text-primary);
      white-space: nowrap;
    }

    /* ── Tables ── */
    .ait-tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
    .ait-tbl th, .ait-tbl td {
      padding: 10px 12px; border: 1px solid var(--border); text-align: center;
    }
    .ait-tbl th {
      background: var(--bg-secondary); color: var(--accent);
      font-weight: 600; font-size: 13px; position: sticky; top: 0; z-index: 1;
    }
    .ait-tbl td { color: var(--text-primary); }
    .ait-tbl tbody tr:hover { background: var(--table-row-hover); }
    .ait-tbl tbody tr[style*="cursor:pointer"]:hover { background: var(--accent-dim); }
    .ait-tbl td.ait-has { cursor: pointer; }
    .ait-tbl td.ait-has:hover { outline: 2px solid var(--accent); }

    /* ── Cards grid ── */
    .ait-card {
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px;
    }
    .ait-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 14px; margin-top: 16px;
    }
    .ait-card-row {
      font-size: 13px; color: var(--text-primary); padding: 8px 4px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      border-radius: 4px; transition: background 0.15s;
    }
    .ait-card-row[style*="cursor:pointer"]:hover { background: var(--accent-dim); }

    /* ── Section heading ── */
    #tab-ai-tech .card > h3, #ai-tech-content .card > h3 {
      font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;
    }
    #ai-tech-content .card > p.ait-desc {
      color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin-bottom: 16px;
    }
  `;
  container.appendChild(style);

  window.switchAiTechSub = function(subId) {
    container.querySelectorAll('.ait-sub').forEach(b => b.classList.remove('active'));
    container.querySelector(`[onclick*="${subId}"]`).classList.add('active');
    renderSub(subId);
    if (typeof updateTabHash === 'function') updateTabHash('ai-tech');
  };

  function renderSub(subId) {
    const content = document.getElementById('ai-tech-content');
    if (subId === 'tech-overview') renderTechOverview(content, projects);
    else if (subId === 'rnd-stage') renderRndStage(content, projects);
    else if (subId === 'tech-dept') renderTechDept(content, projects);
    else if (subId === 'effectiveness') renderEffectiveness(content, projects);
  }

  renderTechOverview(document.getElementById('ai-tech-content'), projects);
};

/* ── Helper: bar with inside/outside value ── */
function barHtml(label, pct, color, valueText, extraText, onclick) {
  const inside = pct > 18;
  const w = Math.max(pct, 2).toFixed(1);
  const clickAttr = onclick ? ` onclick="${onclick}" style="cursor:pointer" title="클릭하여 사업 목록 보기"` : '';
  return `
    <div class="ait-bar"${clickAttr}>
      <div class="ait-bar-label">${esc(label)}</div>
      <div class="ait-bar-track">
        <div class="ait-bar-fill" style="width:${w}%;background:${color};">
          ${inside ? `<span class="ait-bar-val">${valueText}</span>` : ''}
        </div>
        ${!inside ? `<span class="ait-bar-outside" style="left:calc(${w}% + 8px);">${valueText}</span>` : ''}
      </div>
      <div class="ait-bar-extra">${extraText}</div>
    </div>`;
}

/* ══════════════════════════════════════════════
   1. AI 기술 분포
   ══════════════════════════════════════════════ */
function renderTechOverview(el, projects) {
  const techData = {};
  let noTech = { count: 0, budget: 0 };

  projects.forEach(p => {
    const b = getBudget2026(p);
    const techs = p.ai_tech;
    if (techs && techs.length) {
      techs.forEach(t => {
        if (!techData[t]) techData[t] = { count: 0, budget: 0, projects: [] };
        techData[t].count++;
        techData[t].budget += b;
        techData[t].projects.push(p);
      });
    } else {
      noTech.count++;
      noTech.budget += b;
    }
  });

  const sorted = Object.entries(techData).sort((a, b) => b[1].budget - a[1].budget);
  const maxBudget = Math.max(...sorted.map(([, d]) => d.budget), 1);

  let html = `
    <div class="card">
      <h3>AI 기술 유형별 투자 현황</h3>
      <p class="ait-desc">533개 AI 사업을 9개 기술 유형으로 세분화 분석 (1개 사업이 여러 기술에 해당 가능하여 예산 합계가 전체보다 클 수 있음)</p>
      <div class="ait-chart-box">
  `;

  sorted.forEach(([tech, data]) => {
    const pct = (data.budget / maxBudget * 100);
    html += barHtml(tech, pct, TECH_COLORS[tech], formatBillion(data.budget) + '원', data.count + '개',
      `navigateToAiTech('${tech}','','')`);
  });

  // 미분류
  html += `
    <div style="opacity:0.5;margin-top:16px;padding-top:12px;border-top:1px solid var(--border);">
      ${barHtml('미분류', noTech.budget / maxBudget * 100, '#9ca3af', formatBillion(noTech.budget) + '원', noTech.count + '개')}
    </div>
  </div></div>`;

  // Top 3 per tech
  html += `<div class="card"><h3>기술별 대표 사업 (예산 상위 3)</h3><div class="ait-grid">`;
  sorted.forEach(([tech, data]) => {
    const top3 = [...data.projects].sort((a, b) => getBudget2026(b) - getBudget2026(a)).slice(0, 3);
    const color = TECH_COLORS[tech];
    html += `<div class="ait-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:pointer;" onclick="navigateToAiTech('${tech}','','')">
        <span style="width:14px;height:14px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
        <strong style="font-size:15px;color:var(--text-primary);">${esc(tech)}</strong>
        <span style="color:var(--text-secondary);font-size:13px;margin-left:auto;">${data.count}개 · ${formatBillion(data.budget)}원</span>
      </div>`;
    top3.forEach((p, i) => {
      html += `<div class="ait-card-row" style="cursor:pointer;" onclick="showProjectModal(${p.id})" title="클릭하여 상세 보기">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i + 1}. ${esc(p.name || p.project_name)}</span>
        <span style="color:var(--accent);font-weight:600;white-space:nowrap;">${formatBillion(getBudget2026(p))}원</span>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;

  el.innerHTML = html;
}

/* ══════════════════════════════════════════════
   2. R&D 단계 분석
   ══════════════════════════════════════════════ */
function renderRndStage(el, projects) {
  const stageData = {};
  STAGE_ORDER.forEach(s => stageData[s] = { count: 0, budget: 0, projects: [] });
  let noStage = { count: 0, budget: 0 };

  projects.forEach(p => {
    const b = getBudget2026(p);
    const stages = p.rnd_stage;
    if (stages && stages.length) {
      stages.forEach(s => {
        if (!stageData[s]) stageData[s] = { count: 0, budget: 0, projects: [] };
        stageData[s].count++;
        stageData[s].budget += b;
        stageData[s].projects.push(p);
      });
    } else {
      noStage.count++;
      noStage.budget += b;
    }
  });

  const maxCount = Math.max(...STAGE_ORDER.map(s => stageData[s].count), 1);

  let html = `
    <div class="card">
      <h3>R&D 단계별 투자 파이프라인</h3>
      <p class="ait-desc">기초연구 → 응용연구 → 개발 → 실증/시범 → 사업화/확산 단계별 사업 분포 (사업당 대표 1단계 배정)</p>
      <div class="ait-chart-box">
        <div style="display:flex;gap:12px;align-items:flex-end;min-height:260px;padding:10px 20px 0;">
  `;

  STAGE_ORDER.forEach((stage, idx) => {
    const d = stageData[stage];
    const h = (d.count / maxCount * 200);
    const color = STAGE_COLORS[stage];
    const arrow = idx < STAGE_ORDER.length - 1
      ? `<div style="position:absolute;right:-12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:22px;font-weight:300;">›</div>`
      : '';
    html += `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative;cursor:pointer;" onclick="navigateToAiTech('','${stage}','')" title="클릭하여 사업 목록 보기">
        <div style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">${d.count}<span style="font-size:13px;font-weight:400;color:var(--text-secondary);">개</span></div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">${formatBillion(d.budget)}원</div>
        <div style="width:85%;height:${h}px;background:${color};border-radius:10px 10px 0 0;min-height:8px;opacity:0.85;"></div>
        <div style="font-size:14px;font-weight:700;color:${color};margin-top:10px;text-align:center;">${esc(stage)}</div>
        ${arrow}
      </div>
    `;
  });

  html += `</div>
    <div style="text-align:center;margin-top:16px;color:var(--text-muted);font-size:13px;border-top:1px solid var(--border);padding-top:12px;">
      미분류: ${noStage.count}개 (${formatBillion(noStage.budget)}원)
    </div>
  </div></div>`;

  // Table
  html += `<div class="card"><h3>단계별 예산 비중</h3>
    <div style="overflow-x:auto;margin-top:12px;"><table class="ait-tbl">
    <thead><tr><th>단계</th><th>사업수</th><th>예산 합계</th><th>평균 예산</th><th>비중</th></tr></thead><tbody>`;

  const totalBudget = STAGE_ORDER.reduce((s, st) => s + stageData[st].budget, 0);
  STAGE_ORDER.forEach(stage => {
    const d = stageData[stage];
    const avg = d.count ? d.budget / d.count : 0;
    const pct = totalBudget ? (d.budget / totalBudget * 100).toFixed(1) : 0;
    html += `<tr style="cursor:pointer;" onclick="navigateToAiTech('','${stage}','')" title="클릭하여 사업 목록 보기">
      <td style="color:${STAGE_COLORS[stage]};font-weight:700;">${esc(stage)}</td>
      <td style="font-weight:600;">${d.count}</td>
      <td style="font-weight:500;">${formatBillion(d.budget)}원</td>
      <td>${formatBillion(avg)}원</td>
      <td style="font-weight:600;">${pct}%</td>
    </tr>`;
  });
  html += `</tbody></table></div></div>`;

  // Stage × Tech matrix
  html += `<div class="card"><h3>R&D 단계 × AI 기술 교차 분석</h3>
    <p class="ait-desc">각 기술 유형이 어떤 R&D 단계에 주로 투자되는지 보여줍니다.</p>
    <div style="overflow-x:auto;"><table class="ait-tbl">
    <thead><tr><th style="min-width:150px;text-align:left;">기술 유형</th>`;
  STAGE_ORDER.forEach(s => html += `<th>${s}</th>`);
  html += `</tr></thead><tbody>`;

  const techList = Object.keys(TECH_COLORS).filter(t => t !== '미분류');
  techList.forEach(tech => {
    html += `<tr><td style="text-align:left;color:${TECH_COLORS[tech]};font-weight:600;cursor:pointer;" onclick="navigateToAiTech('${tech}','','')" title="클릭하여 사업 목록 보기">${esc(tech)}</td>`;
    STAGE_ORDER.forEach(stage => {
      let count = 0;
      projects.forEach(p => {
        if (p.ai_tech && p.ai_tech.includes(tech) && p.rnd_stage && p.rnd_stage.includes(stage)) count++;
      });
      if (count > 0) {
        const intensity = Math.min(count / 25, 0.85);
        const alpha = (intensity * 0.6 + 0.2).toFixed(2);
        html += `<td class="ait-has" style="background:rgba(37,99,235,${alpha});color:#fff;font-weight:600;" onclick="navigateToAiTech('${tech}','${stage}','')" title="${tech} + ${stage}: ${count}개 — 클릭하여 보기">${count}</td>`;
      } else {
        html += `<td style="color:var(--text-muted);">-</td>`;
      }
    });
    html += `</tr>`;
  });
  html += `</tbody></table></div></div>`;

  el.innerHTML = html;
}

/* ══════════════════════════════════════════════
   3. 기술 × 부처 매트릭스
   ══════════════════════════════════════════════ */
function renderTechDept(el, projects) {
  const depts = [...new Set(projects.map(p => p.department || p.dept))].sort();
  const techList = Object.keys(TECH_COLORS).filter(t => t !== '미분류');

  const matrix = {};
  techList.forEach(tech => {
    matrix[tech] = {};
    depts.forEach(d => matrix[tech][d] = { count: 0, budget: 0 });
  });

  projects.forEach(p => {
    const dept = p.department || p.dept;
    const b = getBudget2026(p);
    (p.ai_tech || []).forEach(tech => {
      if (matrix[tech] && matrix[tech][dept]) {
        matrix[tech][dept].count++;
        matrix[tech][dept].budget += b;
      }
    });
  });

  let maxVal = 0;
  techList.forEach(t => depts.forEach(d => {
    if (matrix[t][d].budget > maxVal) maxVal = matrix[t][d].budget;
  }));

  const activeDepts = depts.filter(d => techList.some(t => matrix[t][d].count > 0));

  let html = `
    <div class="card">
      <h3>AI 기술 × 부처 히트맵</h3>
      <p class="ait-desc">각 부처가 어떤 AI 기술에 투자하고 있는지 보여줍니다 (예산 기준, 단위: 억원)</p>
      <div style="overflow-x:auto;">
        <table class="ait-tbl" style="font-size:12px;">
          <thead><tr><th style="min-width:140px;text-align:left;">기술 유형</th>`;

  activeDepts.forEach(d => {
    const short = d.length > 6 ? d.substring(0, 6) + '..' : d;
    html += `<th title="${esc(d)}" style="writing-mode:vertical-lr;min-width:32px;padding:6px 3px;font-size:11px;">${esc(short)}</th>`;
  });
  html += `</tr></thead><tbody>`;

  techList.forEach(tech => {
    html += `<tr><td style="text-align:left;color:${TECH_COLORS[tech]};font-weight:600;font-size:13px;cursor:pointer;" onclick="navigateToAiTech('${tech}','','')" title="클릭하여 사업 목록 보기">${esc(tech)}</td>`;
    activeDepts.forEach(dept => {
      const cell = matrix[tech][dept];
      if (cell.count > 0) {
        const intensity = Math.min(cell.budget / (maxVal * 0.25), 1);
        const billions = (cell.budget / 100).toFixed(0);
        const alpha = (intensity * 0.55 + 0.25).toFixed(2);
        html += `<td class="ait-has" style="background:rgba(37,99,235,${alpha});color:#fff;font-weight:600;font-size:12px;"
                     onclick="navigateToAiTech('${tech}','','${dept}')"
                     title="${esc(tech)} × ${esc(dept)}: ${cell.count}개, ${billions}억원 — 클릭하여 보기">${billions}</td>`;
      } else {
        html += `<td style="color:var(--text-muted);">-</td>`;
      }
    });
    html += `</tr>`;
  });
  html += `</tbody></table></div></div>`;

  // Top departments per tech
  html += `<div class="card"><h3>기술별 최다 투자 부처 (상위 3)</h3><div class="ait-grid">`;
  techList.forEach(tech => {
    const deptList = activeDepts
      .map(d => ({ dept: d, ...matrix[tech][d] }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 3);
    if (!deptList.length) return;

    const color = TECH_COLORS[tech];
    html += `<div class="ait-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;cursor:pointer;" onclick="navigateToAiTech('${tech}','','')">
        <span style="width:14px;height:14px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
        <strong style="font-size:15px;color:var(--text-primary);">${esc(tech)}</strong>
      </div>`;
    deptList.forEach((d, i) => {
      html += `<div class="ait-card-row" style="cursor:pointer;" onclick="navigateToAiTech('${tech}','','${d.dept}')" title="클릭하여 사업 목록 보기">
        <span>${i + 1}. ${esc(d.dept)}</span>
        <span style="color:var(--accent);font-weight:600;">${d.count}개 · ${formatBillion(d.budget)}원</span>
      </div>`;
    });
    html += `</div>`;
  });
  html += `</div></div>`;

  el.innerHTML = html;
}

/* ══════════════════════════════════════════════
   4. 비용효과성 분석
   ══════════════════════════════════════════════ */
function renderEffectiveness(el, projects) {
  const techBudgets = {};
  projects.forEach(p => {
    const b = getBudget2026(p);
    (p.ai_tech || []).forEach(t => {
      if (!techBudgets[t]) techBudgets[t] = { total: 0, count: 0, projects: [] };
      techBudgets[t].total += b;
      techBudgets[t].count++;
      techBudgets[t].projects.push(p);
    });
  });

  const techEfficiency = Object.entries(techBudgets)
    .map(([tech, data]) => ({
      tech, total: data.total, count: data.count,
      avg: data.count ? data.total / data.count : 0,
      projects: data.projects
    }))
    .sort((a, b) => b.avg - a.avg);

  const maxAvg = Math.max(...techEfficiency.map(t => t.avg), 1);

  let html = `
    <div class="card">
      <h3>기술 유형별 평균 예산 규모</h3>
      <p class="ait-desc">기술 유형별 사업당 평균 예산을 비교합니다. 높은 평균은 대형 프로젝트 중심, 낮은 평균은 소규모 다수 사업 구조를 의미합니다.</p>
      <div class="ait-chart-box">
  `;

  techEfficiency.forEach(t => {
    const pct = (t.avg / maxAvg * 100);
    html += barHtml(t.tech, pct, TECH_COLORS[t.tech], '평균 ' + formatBillion(t.avg) + '원', t.count + '개',
      `navigateToAiTech('${t.tech}','','')`);
  });
  html += `</div></div>`;

  // Concentration table
  html += `<div class="card"><h3>기술별 예산 집중도</h3>
    <p class="ait-desc">상위 3개 사업이 해당 기술 전체 예산에서 차지하는 비중</p>
    <div style="overflow-x:auto;"><table class="ait-tbl">
    <thead><tr><th style="text-align:left;">기술 유형</th><th>총 예산</th><th>사업 수</th><th>상위3 비중</th><th style="text-align:left;">상위 1위 사업</th></tr></thead><tbody>`;

  techEfficiency.forEach(t => {
    const sorted = [...t.projects].sort((a, b) => getBudget2026(b) - getBudget2026(a));
    const top3Budget = sorted.slice(0, 3).reduce((s, p) => s + getBudget2026(p), 0);
    const top3Pct = t.total > 0 ? (top3Budget / t.total * 100).toFixed(1) : 0;
    const top1 = sorted[0];
    const top1Name = top1 ? (top1.name || top1.project_name || '') : '';
    const pctColor = top3Pct > 60 ? 'var(--red)' : top3Pct > 40 ? 'var(--yellow)' : 'var(--green)';

    html += `<tr style="cursor:pointer;" onclick="navigateToAiTech('${t.tech}','','')" title="클릭하여 사업 목록 보기">
      <td style="color:${TECH_COLORS[t.tech]};text-align:left;font-weight:600;">${esc(t.tech)}</td>
      <td style="font-weight:500;">${formatBillion(t.total)}원</td>
      <td style="font-weight:600;">${t.count}</td>
      <td><strong style="color:${pctColor};font-size:15px;">${top3Pct}%</strong></td>
      <td style="text-align:left;font-size:13px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          title="${esc(top1Name)}"
          onclick="event.stopPropagation();showProjectModal(${top1 ? top1.id : 0})">${esc(top1Name.substring(0, 40))}${top1Name.length > 40 ? '...' : ''}</td>
    </tr>`;
  });
  html += `</tbody></table></div></div>`;

  // R&D Stage avg budget
  html += `<div class="card"><h3>R&D 단계별 평균 예산 비교</h3>
    <p class="ait-desc">각 R&D 단계별 사업당 평균 예산과 예산 비중</p>
    <div class="ait-chart-box">`;

  const stageData = {};
  STAGE_ORDER.forEach(s => stageData[s] = { total: 0, count: 0 });
  projects.forEach(p => {
    const b = getBudget2026(p);
    (p.rnd_stage || []).forEach(s => {
      if (stageData[s]) { stageData[s].total += b; stageData[s].count++; }
    });
  });
  const maxStageAvg = Math.max(...STAGE_ORDER.map(s => stageData[s].count ? stageData[s].total / stageData[s].count : 0), 1);

  STAGE_ORDER.forEach(s => {
    const d = stageData[s];
    const avg = d.count ? d.total / d.count : 0;
    const pct = (avg / maxStageAvg * 100);
    html += barHtml(s, pct, STAGE_COLORS[s], '평균 ' + formatBillion(avg) + '원 (' + d.count + '개)', formatBillion(d.total) + '원',
      `navigateToAiTech('','${s}','')`);
  });
  html += `</div></div>`;

  // Budget size distribution
  const totalAll = projects.reduce((s, p) => s + getBudget2026(p), 0);
  const ranges = [
    { label: '1,000억 이상', min: 100000, color: '#dc2626' },
    { label: '500~1,000억', min: 50000, max: 100000, color: '#d97706' },
    { label: '100~500억', min: 10000, max: 50000, color: '#2563eb' },
    { label: '50~100억', min: 5000, max: 10000, color: '#0891b2' },
    { label: '10~50억', min: 1000, max: 5000, color: '#059669' },
    { label: '10억 미만', min: 0, max: 1000, color: '#6b7280' },
  ];

  const rangeData = ranges.map(r => {
    const matched = projects.filter(p => {
      const b = getBudget2026(p);
      return b >= r.min && (!r.max || b < r.max);
    });
    return { ...r, count: matched.length, budget: matched.reduce((s, p) => s + getBudget2026(p), 0) };
  });
  const maxRangeCount = Math.max(...rangeData.map(r => r.count), 1);

  html += `<div class="card"><h3>규모별 사업 분포</h3>
    <p class="ait-desc">AI 사업의 예산 규모별 분포</p>
    <div class="ait-chart-box">`;

  rangeData.forEach(r => {
    const pct = (r.count / maxRangeCount * 100);
    const budgetPct = totalAll > 0 ? (r.budget / totalAll * 100).toFixed(1) : '0';
    html += barHtml(r.label, pct, r.color, r.count + '개 · ' + formatBillion(r.budget) + '원', budgetPct + '%');
  });
  html += `</div></div>`;

  el.innerHTML = html;
}

})();
