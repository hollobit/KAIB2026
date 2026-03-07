// ==================== Memo / Notes ====================
let _memoDebounceTimer = null;

function hasMemo(projectId) {
  return !!localStorage.getItem('budget_note_' + projectId);
}

function memoBadgeHtml() {
  return ' <span title="메모 있음" style="font-size:11px;cursor:default">&#128221;</span>';
}

function debounceSaveMemo(projectId) {
  const indicator = document.getElementById('memo-save-indicator');
  if (indicator) indicator.textContent = '저장 중...';
  clearTimeout(_memoDebounceTimer);
  _memoDebounceTimer = setTimeout(() => saveMemo(projectId), 1000);
}

function saveMemo(projectId) {
  const ta = document.getElementById('modal-memo-textarea');
  if (!ta) return;
  const text = ta.value.trim();
  const indicator = document.getElementById('memo-save-indicator');
  if (text) {
    localStorage.setItem('budget_note_' + projectId, JSON.stringify({
      text: text,
      projectId: projectId,
      updatedAt: new Date().toISOString()
    }));
    if (indicator) indicator.textContent = '저장됨';
  } else {
    localStorage.removeItem('budget_note_' + projectId);
    if (indicator) indicator.textContent = '';
  }
}

function deleteMemo(projectId) {
  localStorage.removeItem('budget_note_' + projectId);
  const ta = document.getElementById('modal-memo-textarea');
  if (ta) ta.value = '';
  const indicator = document.getElementById('memo-save-indicator');
  if (indicator) indicator.textContent = '삭제됨';
  updateProjectList();
}

function getAllNotes() {
  const notes = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('budget_note_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const pid = parseInt(key.replace('budget_note_', ''));
        const p = DATA?.projects?.find(pp => pp.id === pid);
        notes.push({
          projectId: pid,
          projectName: p ? (p.project_name || p.name) : '(알 수 없음)',
          department: p ? p.department : '-',
          text: data.text || data,
          updatedAt: data.updatedAt || null
        });
      } catch(e) {
        const pid = parseInt(key.replace('budget_note_', ''));
        const val = localStorage.getItem(key);
        const p = DATA?.projects?.find(pp => pp.id === pid);
        notes.push({
          projectId: pid,
          projectName: p ? (p.project_name || p.name) : '(알 수 없음)',
          department: p ? p.department : '-',
          text: val,
          updatedAt: null
        });
      }
    }
  }
  return notes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

function openNotesManager() {
  const notes = getAllNotes();
  const container = document.getElementById('notes-manager-content');
  if (notes.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px">저장된 메모가 없습니다.</div>';
  } else {
    let html = '<div style="margin-bottom:8px;font-size:12px;color:var(--text-muted)">총 ' + notes.length + '개 메모</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    notes.forEach(n => {
      const preview = n.text.length > 80 ? n.text.substring(0, 80) + '...' : n.text;
      const dateStr = n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('ko-KR') : '-';
      html += '<div style="padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-primary);cursor:pointer" onclick="closeNotesManager();showProjectModal(' + n.projectId + ')">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-weight:600;font-size:13px;margin-bottom:2px">' + n.projectName + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">' + n.department + ' | ' + dateStr + '</div>' +
        '<div style="font-size:12px;color:var(--text-secondary);white-space:pre-wrap">' + preview + '</div>' +
        '</div>' +
        '<button onclick="event.stopPropagation();deleteNoteFromManager(' + n.projectId + ')" style="padding:4px 8px;background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:11px;color:var(--text-muted);flex-shrink:0;font-family:inherit">삭제</button>' +
        '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }
  document.getElementById('notes-manager-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeNotesManager() {
  document.getElementById('notes-manager-modal').classList.remove('active');
  document.body.style.overflow = '';
}

function deleteNoteFromManager(projectId) {
  localStorage.removeItem('budget_note_' + projectId);
  openNotesManager();
  updateProjectList();
}

function exportAllNotes() {
  const notes = getAllNotes();
  if (notes.length === 0) { alert('내보낼 메모가 없습니다.'); return; }
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'budget_notes_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importNotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const notes = JSON.parse(e.target.result);
      if (!Array.isArray(notes)) { alert('잘못된 형식입니다.'); return; }
      let count = 0;
      notes.forEach(n => {
        if (n.projectId && n.text) {
          localStorage.setItem('budget_note_' + n.projectId, JSON.stringify({
            text: n.text,
            projectId: n.projectId,
            updatedAt: n.updatedAt || new Date().toISOString()
          }));
          count++;
        }
      });
      alert(count + '개 메모를 가져왔습니다.');
      openNotesManager();
      updateProjectList();
    } catch(err) { alert('파일 파싱 오류: ' + err.message); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAllNotes() {
  if (!confirm('모든 메모를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('budget_note_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
  openNotesManager();
  updateProjectList();
}

// Close notes modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('notes-manager-modal');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeNotesManager();
    });
  }
});

// ==================== PDF Report ====================
function generatePDFReport() {
  if (!DATA) return;
  const win = window.open('', '_blank');
  const projects = DATA.projects, meta = DATA.metadata, analysis = DATA.analysis || {};
  const deptBudget = {};
  projects.forEach(p => { const d = p.department; if (!deptBudget[d]) deptBudget[d] = {count:0, budget:0}; deptBudget[d].count++; deptBudget[d].budget += getBudget2026(p); });
  const topDepts = Object.entries(deptBudget).sort((a,b) => b[1].budget - a[1].budget).slice(0, 10);
  const totalBudget = projects.reduce((s,p) => s + getBudget2026(p), 0);
  const totalBudget2025 = projects.reduce((s,p) => s + getBudget2025(p), 0);
  const totalSubs = projects.reduce((s,p) => s + (p.sub_projects||[]).length, 0);
  const fmtB = v => { if (!v) return '0'; const b = v/100; return b >= 10000 ? (b/10000).toFixed(1)+'조' : b >= 1 ? b.toFixed(1)+'억' : v.toFixed(0)+'백만'; };

  const anomalyProjects = projects
    .map(p => ({ p, rate: Math.abs(getChangeRate(p) || 0), change: getChangeAmount(p) || 0, budget: getBudget2026(p) }))
    .filter(x => x.rate > 50 || Math.abs(x.change) > 5000)
    .sort((a,b) => b.rate - a.rate)
    .slice(0, 20);

  const dupIds = getDuplicateProjectIds();
  const riskProjects = projects
    .map(p => ({ p, score: calcWasteRiskScore(p, dupIds) }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 20);

  const dups = analysis.duplicates || [];

  const ts = 'border-collapse:collapse;width:100%;font-size:11px;margin:8px 0 16px';
  const ths = 'border:1px solid #ccc;padding:6px 8px;background:#f5f5f5;font-weight:600;text-align:left;font-size:11px';
  const tds = 'border:1px solid #ddd;padding:5px 8px;font-size:11px';
  const tdR = tds + ';text-align:right';

  function mkT(headers, rows) {
    let h = '<table style="' + ts + '"><thead><tr>' + headers.map(x => '<th style="' + ths + '">' + x + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      h += '<tr style="background:' + (i % 2 === 0 ? '#fff' : '#fafafa') + '">' + r.map((c, j) => '<td style="' + (j >= headers.length - 3 && !isNaN(c) ? tdR : tds) + '">' + c + '</td>').join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }

  const reportHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>2026 AI 재정사업 PDF 보고서</title>' +
'<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">' +
'<style>' +
'@page { size: A4 portrait; margin: 18mm 15mm; }' +
'@media print { .no-print { display: none !important; } }' +
'body { font-family: "Pretendard Variable", sans-serif; color: #222; line-height: 1.5; max-width: 780px; margin: 0 auto; padding: 20px; font-size: 12px; }' +
'h1 { font-size: 22px; text-align: center; margin: 40px 0 5px; }' +
'h2 { font-size: 14px; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 20px 0 8px; page-break-after: avoid; }' +
'.subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }' +
'.cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; }' +
'.cover h1 { font-size: 28px; margin-bottom: 10px; }' +
'.kpi-row { display: flex; gap: 10px; margin: 14px 0; flex-wrap: wrap; }' +
'.kpi-box { flex: 1; min-width: 100px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; text-align: center; }' +
'.kpi-box .val { font-size: 18px; font-weight: 700; color: #1a56db; }' +
'.kpi-box .lbl { font-size: 10px; color: #666; margin-top: 2px; }' +
'.page-break { page-break-before: always; }' +
'table { page-break-inside: auto; } tr { page-break-inside: avoid; }' +
'</style></head><body>' +
'<button class="no-print" onclick="window.print()" style="position:fixed;top:10px;right:10px;padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;z-index:100">PDF 인쇄</button>' +

'<div class="cover"><h1>2026년 AI 재정사업 분석 보고서</h1>' +
'<div class="subtitle">' + (meta.source || '2026년 AI 재정사업 현황') + '</div>' +
'<div style="margin-top:20px;font-size:14px;color:#444">' +
'<p>분석일: ' + new Date().toLocaleDateString('ko-KR') + '</p>' +
'<p>총 예산: <strong>' + fmtB(totalBudget) + '</strong> | 사업 수: <strong>' + meta.total_projects + '</strong>개 | 참여 부처: <strong>' + meta.total_departments + '</strong>개</p>' +
'</div></div>' +

'<div class="page-break"></div>' +
'<h2>1. 주요 지표</h2>' +
'<div class="kpi-row">' +
'<div class="kpi-box"><div class="val">' + fmtB(totalBudget) + '</div><div class="lbl">2026 총 예산</div></div>' +
'<div class="kpi-box"><div class="val">' + fmtB(Math.abs(totalBudget - totalBudget2025)) + '</div><div class="lbl">전년 대비 ' + (totalBudget >= totalBudget2025 ? '증가' : '감소') + '</div></div>' +
'<div class="kpi-box"><div class="val">' + meta.total_projects + '</div><div class="lbl">총 사업 수</div></div>' +
'<div class="kpi-box"><div class="val">' + meta.total_departments + '</div><div class="lbl">참여 부처</div></div>' +
'<div class="kpi-box"><div class="val">' + totalSubs.toLocaleString() + '</div><div class="lbl">내역사업</div></div>' +
'</div>' +

'<h2>2. 부처별 예산 현황 (상위 10)</h2>' +
mkT(['순위','부처명','사업 수','2026 예산(백만원)','비중(%)'], topDepts.map(([d,v],i) => [i+1, d, v.count, v.budget.toLocaleString(), (v.budget/totalBudget*100).toFixed(1)])) +

'<div class="page-break"></div>' +
'<h2>3. 이상 징후 사업 (상위 20)</h2>' +
'<p style="font-size:11px;color:#666;margin-bottom:6px">예산 증감률이 극단적이거나 변동 금액이 큰 사업</p>' +
mkT(['사업명','부처','2026 예산','증감액','증감률(%)'], anomalyProjects.map(x => [
  (x.p.project_name||x.p.name).substring(0,30), x.p.department, fmtB(x.budget), fmtB(x.change), x.rate.toFixed(1)
])) +

'<div class="page-break"></div>' +
'<h2>4. 고위험 사업 (상위 20)</h2>' +
'<p style="font-size:11px;color:#666;margin-bottom:6px">중복 의심, 급격한 예산 변동, 신규 대형 사업 등을 종합한 위험도 점수</p>' +
mkT(['사업명','부처','2026 예산','위험점수','등급'], riskProjects.map(x => {
  const grade = getWasteRiskGrade(x.score);
  return [(x.p.project_name||x.p.name).substring(0,30), x.p.department, fmtB(getBudget2026(x.p)), x.score, grade.label];
})) +

'<div class="page-break"></div>' +
'<h2>5. 중복 의심 사업 그룹 (' + Math.min(dups.length, 16) + '개)</h2>' +
dups.slice(0, 16).map((g, i) => '<div style="margin-bottom:10px;page-break-inside:avoid"><strong>' + (i+1) + '. ' + g.group_name + '</strong> (' + (g.project_count || g.projects.length) + '개 사업, ' + fmtB(g.total_budget || 0) + ', 유사도: ' + (g.grade || '-') + ')<ul style="margin:2px 0 0;padding-left:20px;font-size:11px">' + g.projects.slice(0, 6).map(p => '<li>' + p.department + ': ' + p.name + ' (' + fmtB(p.budget_2026 || 0) + ')</li>').join('') + '</ul></div>').join('') +

'<div class="page-break"></div>' +
'<h2>6. 전체 사업 목록 (부록)</h2>' +
mkT(['번호','사업명','부처','2026 예산','증감률(%)','유형'], projects.slice().sort((a,b) => getBudget2026(b) - getBudget2026(a)).map((p, i) => [
  i+1,
  (p.project_name||p.name).substring(0, 35),
  p.department,
  fmtB(getBudget2026(p)),
  (getChangeRate(p) || 0).toFixed(1),
  getProjectType(p)
])) +

'<div style="text-align:center;margin-top:40px;color:#999;font-size:10px;border-top:1px solid #ddd;padding-top:10px">' +
'2026년 AI 재정사업 분석 플랫폼 자동 생성 PDF 보고서 | ' + new Date().toLocaleDateString('ko-KR') +
'</div></body></html>';

  win.document.write(reportHtml);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ==================== Markdown Report ====================
function generateMarkdownReport() {
  if (!DATA) return;
  const projects = DATA.projects, meta = DATA.metadata, analysis = DATA.analysis || {};
  const deptBudget = {};
  projects.forEach(p => { const d = p.department; if (!deptBudget[d]) deptBudget[d] = {count:0, budget:0}; deptBudget[d].count++; deptBudget[d].budget += getBudget2026(p); });
  const topDepts = Object.entries(deptBudget).sort((a,b) => b[1].budget - a[1].budget).slice(0, 10);
  const totalBudget = projects.reduce((s,p) => s + getBudget2026(p), 0);
  const totalBudget2025 = projects.reduce((s,p) => s + getBudget2025(p), 0);
  const totalSubs = projects.reduce((s,p) => s + (p.sub_projects||[]).length, 0);
  const fmtB = v => { if (!v) return '0'; const b = v/100; return b >= 10000 ? (b/10000).toFixed(1)+'조' : b >= 1 ? b.toFixed(1)+'억' : v.toFixed(0)+'백만'; };

  const anomalyProjects = projects
    .map(p => ({ p, rate: Math.abs(getChangeRate(p) || 0), change: getChangeAmount(p) || 0, budget: getBudget2026(p) }))
    .filter(x => x.rate > 50 || Math.abs(x.change) > 5000)
    .sort((a,b) => b.rate - a.rate)
    .slice(0, 20);

  const dupIds = getDuplicateProjectIds();
  const riskProjects = projects
    .map(p => ({ p, score: calcWasteRiskScore(p, dupIds) }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 20);

  const dups = analysis.duplicates || [];
  const date = new Date().toLocaleDateString('ko-KR');

  let md = '';
  md += '# 2026년 AI 재정사업 분석 보고서\n\n';
  md += '> ' + (meta.source || '2026년 AI 재정사업 현황') + '\n\n';
  md += '- **분석일**: ' + date + '\n';
  md += '- **총 예산**: ' + fmtB(totalBudget) + '\n';
  md += '- **사업 수**: ' + meta.total_projects + '개\n';
  md += '- **참여 부처**: ' + meta.total_departments + '개\n';
  md += '- **내역사업**: ' + totalSubs.toLocaleString() + '개\n\n';
  md += '---\n\n';

  md += '## 1. 주요 지표\n\n';
  md += '| 지표 | 값 |\n|------|----|\n';
  md += '| 2026 총 예산 | ' + fmtB(totalBudget) + ' |\n';
  md += '| 전년 대비 ' + (totalBudget >= totalBudget2025 ? '증가' : '감소') + ' | ' + fmtB(Math.abs(totalBudget - totalBudget2025)) + ' |\n';
  md += '| 총 사업 수 | ' + meta.total_projects + ' |\n';
  md += '| 참여 부처 | ' + meta.total_departments + ' |\n';
  md += '| 내역사업 | ' + totalSubs.toLocaleString() + ' |\n\n';

  md += '## 2. 부처별 예산 현황 (상위 10)\n\n';
  md += '| 순위 | 부처명 | 사업 수 | 2026 예산(백만원) | 비중(%) |\n';
  md += '|------|--------|---------|-------------------|--------|\n';
  topDepts.forEach(([d,v], i) => {
    md += '| ' + (i+1) + ' | ' + d + ' | ' + v.count + ' | ' + v.budget.toLocaleString() + ' | ' + (v.budget/totalBudget*100).toFixed(1) + ' |\n';
  });
  md += '\n';

  md += '## 3. 이상 징후 사업 (상위 20)\n\n';
  md += '> 예산 증감률이 극단적이거나 변동 금액이 큰 사업\n\n';
  md += '| 사업명 | 부처 | 2026 예산 | 증감액 | 증감률(%) |\n';
  md += '|--------|------|-----------|--------|----------|\n';
  anomalyProjects.forEach(x => {
    md += '| ' + (x.p.project_name||x.p.name).substring(0,30) + ' | ' + x.p.department + ' | ' + fmtB(x.budget) + ' | ' + fmtB(x.change) + ' | ' + x.rate.toFixed(1) + ' |\n';
  });
  md += '\n';

  md += '## 4. 고위험 사업 (상위 20)\n\n';
  md += '> 중복 의심, 급격한 예산 변동, 신규 대형 사업 등을 종합한 위험도 점수\n\n';
  md += '| 사업명 | 부처 | 2026 예산 | 위험점수 | 등급 |\n';
  md += '|--------|------|-----------|----------|------|\n';
  riskProjects.forEach(x => {
    const grade = getWasteRiskGrade(x.score);
    md += '| ' + (x.p.project_name||x.p.name).substring(0,30) + ' | ' + x.p.department + ' | ' + fmtB(getBudget2026(x.p)) + ' | ' + x.score + ' | ' + grade.label + ' |\n';
  });
  md += '\n';

  md += '## 5. 중복 의심 사업 그룹 (' + Math.min(dups.length, 16) + '개)\n\n';
  dups.slice(0, 16).forEach((g, i) => {
    md += '### ' + (i+1) + '. ' + g.group_name + '\n';
    md += '- 사업 수: ' + (g.project_count || g.projects.length) + '개, 예산: ' + fmtB(g.total_budget || 0) + ', 유사도: ' + (g.grade || '-') + '\n';
    g.projects.slice(0, 6).forEach(p => {
      md += '  - ' + p.department + ': ' + p.name + ' (' + fmtB(p.budget_2026 || 0) + ')\n';
    });
    md += '\n';
  });

  md += '---\n\n';
  md += '*2026년 AI 재정사업 분석 플랫폼 자동 생성 Markdown 보고서 | ' + date + '*\n';

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '2026_AI_재정사업_보고서_' + new Date().toISOString().slice(0,10) + '.md';
  a.click();
  URL.revokeObjectURL(a.href);
}
