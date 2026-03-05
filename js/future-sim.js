/**
 * 미래 예산 시뮬레이터 (Future Budget Simulator)
 * 2027-2030 AI 재정사업 예측 및 시나리오 분석
 */

function initFutureSimTab(DATA) {
  'use strict';

  const container = document.getElementById('tab-future');
  if (!container) return;

  // ──────────────────────────────────────────────
  // 1. DATA PREPARATION
  // ──────────────────────────────────────────────

  const projects = DATA.projects || [];
  const YEARS_ACTUAL = [2024, 2025, 2026];
  const YEARS_FORECAST = [2027, 2028, 2029, 2030];
  const YEARS_ALL = [...YEARS_ACTUAL, ...YEARS_FORECAST];

  // Color palette
  const COLORS = [
    '#4a9eff', '#34d399', '#fbbf24', '#f87171', '#a78bfa',
    '#fb923c', '#f472b6', '#22d3ee', '#84cc16', '#e879f9',
    '#60a5fa', '#4ade80', '#facc15', '#ef4444', '#8b5cf6',
    '#f97316', '#ec4899', '#06b6d4', '#65a30d', '#d946ef'
  ];

  function getB24(p) { return p.budget?.budget_2024 ?? p.budget?.['2024_settlement'] ?? 0; }
  function getB25(p) { return p.budget?.budget_2025 ?? p.budget?.['2025_original'] ?? 0; }
  function getB26(p) { return p.budget?.budget_2026 ?? p.budget?.['2026_budget'] ?? 0; }

  // Get actual budgets as array [2024, 2025, 2026]
  function getActuals(p) {
    return [getB24(p), getB25(p), getB26(p)];
  }

  // Gather unique departments and domains
  const allDepts = [...new Set(projects.map(p => p.department))].sort();
  const allDomains = [...new Set(projects.flatMap(p => p.ai_domains || []))].sort();
  const allFields = [...new Set(projects.map(p => p.field).filter(Boolean))].sort();

  // Aggregate by department
  function aggregateByKey(keyFn) {
    const map = {};
    projects.forEach(p => {
      const key = keyFn(p);
      if (!key) return;
      if (!map[key]) map[key] = { b24: 0, b25: 0, b26: 0, count: 0 };
      map[key].b24 += getB24(p) || 0;
      map[key].b25 += getB25(p) || 0;
      map[key].b26 += getB26(p) || 0;
      map[key].count++;
    });
    return map;
  }

  const deptAgg = aggregateByKey(p => p.department);
  const fieldAgg = aggregateByKey(p => p.field);
  const domainAgg = {};
  projects.forEach(p => {
    (p.ai_domains || []).forEach(d => {
      if (!domainAgg[d]) domainAgg[d] = { b24: 0, b25: 0, b26: 0, count: 0 };
      domainAgg[d].b24 += getB24(p) || 0;
      domainAgg[d].b25 += getB25(p) || 0;
      domainAgg[d].b26 += getB26(p) || 0;
      domainAgg[d].count++;
    });
  });

  // Total budget
  const totalB24 = projects.reduce((s, p) => s + (getB24(p) || 0), 0);
  const totalB25 = projects.reduce((s, p) => s + (getB25(p) || 0), 0);
  const totalB26 = projects.reduce((s, p) => s + (getB26(p) || 0), 0);

  // ──────────────────────────────────────────────
  // 2. FORECASTING MODELS
  // ──────────────────────────────────────────────

  // Linear regression: y = a + b*x
  function linearRegression(xs, ys) {
    const n = xs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += xs[i]; sumY += ys[i];
      sumXY += xs[i] * ys[i]; sumX2 += xs[i] * xs[i];
    }
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return { a: sumY / n, b: 0, r2: 0 };
    const b = (n * sumXY - sumX * sumY) / denom;
    const a = (sumY - b * sumX) / n;
    // R-squared
    const mean = sumY / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      ssTot += (ys[i] - mean) ** 2;
      ssRes += (ys[i] - (a + b * xs[i])) ** 2;
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
    return { a, b, r2 };
  }

  // Exponential growth: y = a * (1+r)^(x-x0)
  function exponentialGrowth(vals) {
    if (vals.length < 2) return { rate: 0 };
    const rates = [];
    for (let i = 1; i < vals.length; i++) {
      if (vals[i - 1] > 0) rates.push((vals[i] - vals[i - 1]) / vals[i - 1]);
    }
    const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    return { rate: avgRate, base: vals[vals.length - 1] };
  }

  // Forecast with confidence intervals
  function forecast(actuals, model, years) {
    const xs = [0, 1, 2]; // 2024=0, 2025=1, 2026=2
    const validActuals = actuals.map(v => v || 0);

    if (model === 'exponential') {
      const eg = exponentialGrowth(validActuals);
      const base = eg.base || validActuals[2];
      const r = eg.rate;
      return years.map((_, i) => {
        const t = i + 1; // years ahead from 2026
        const point = base * Math.pow(1 + r, t);
        const uncertainty = Math.abs(point) * 0.05 * t;
        return { point: Math.max(0, point), lo: Math.max(0, point - uncertainty), hi: point + uncertainty };
      });
    }

    // Default: linear
    const lr = linearRegression(xs, validActuals);
    const residuals = xs.map((x, i) => validActuals[i] - (lr.a + lr.b * x));
    const rmse = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / xs.length);

    return years.map((_, i) => {
      const x = 3 + i; // 2027=3, 2028=4, ...
      const point = lr.a + lr.b * x;
      const uncertainty = rmse * (1 + 0.3 * (i + 1)); // wider CI further out
      return { point: Math.max(0, point), lo: Math.max(0, point - 1.96 * uncertainty), hi: point + 1.96 * uncertainty };
    });
  }

  // ──────────────────────────────────────────────
  // 3. SCENARIO DEFINITIONS
  // ──────────────────────────────────────────────

  const SCENARIOS = {
    current: {
      name: '현 추세 유지',
      desc: '2024-2026 추세를 선형 연장합니다.',
      getMultiplier: (domain, year) => 1.0
    },
    accelerate: {
      name: 'AI 투자 가속',
      desc: '연간 15% 성장률을 적용합니다.',
      getMultiplier: (domain, year) => Math.pow(1.15, year - 2026)
    },
    global: {
      name: '글로벌 경쟁 대응',
      desc: 'GDP 대비 미국/중국 수준으로 AI 투자를 확대합니다.',
      getMultiplier: (domain, year) => Math.pow(1.25, year - 2026)
    },
    austerity: {
      name: '보수적 긴축',
      desc: '연간 5% 감축을 적용합니다.',
      getMultiplier: (domain, year) => Math.pow(0.95, year - 2026)
    },
    custom: {
      name: '맞춤형',
      desc: '도메인별 성장률을 직접 조정합니다.',
      getMultiplier: null // handled by sliders
    }
  };

  // State
  let activeScenario = 'current';
  let forecastModel = 'linear'; // 'linear' or 'exponential'
  let customRates = {}; // domain -> annual growth rate (e.g., 0.10 = 10%)
  allDomains.forEach(d => { customRates[d] = 0; });
  let savedScenarios = loadSavedScenarios();
  let compareSlots = [null, null, null]; // up to 3 scenario names
  let activeInnerTab = 'forecast';

  function loadSavedScenarios() {
    try {
      return JSON.parse(localStorage.getItem('fs_scenarios') || '{}');
    } catch { return {}; }
  }

  function saveScenariosToStorage() {
    try {
      localStorage.setItem('fs_scenarios', JSON.stringify(savedScenarios));
    } catch {}
  }

  // Calculate scenario-adjusted forecast for total budget
  function calcScenarioForecast(scenarioKey, customRatesOverride) {
    const base26 = totalB26;
    const results = {};

    YEARS_FORECAST.forEach(year => {
      if (scenarioKey === 'custom') {
        // Weight by domain budget share
        const rates = customRatesOverride || customRates;
        let totalWeighted = 0;
        let totalWeight = 0;
        Object.entries(domainAgg).forEach(([domain, agg]) => {
          const w = agg.b26 || 0;
          const rate = rates[domain] || 0;
          totalWeighted += w * Math.pow(1 + rate / 100, year - 2026);
          totalWeight += w;
        });
        results[year] = totalWeight > 0 ? base26 * (totalWeighted / totalWeight) : base26;
      } else {
        const scenario = SCENARIOS[scenarioKey];
        if (!scenario) { results[year] = base26; return; }
        results[year] = base26 * scenario.getMultiplier('', year);
      }
    });

    return results;
  }

  // Calculate per-domain forecast
  function calcDomainForecast(scenarioKey, customRatesOverride) {
    const results = {};
    Object.entries(domainAgg).forEach(([domain, agg]) => {
      results[domain] = {};
      YEARS_FORECAST.forEach(year => {
        if (scenarioKey === 'custom') {
          const rates = customRatesOverride || customRates;
          const rate = rates[domain] || 0;
          results[domain][year] = agg.b26 * Math.pow(1 + rate / 100, year - 2026);
        } else if (SCENARIOS[scenarioKey]) {
          results[domain][year] = agg.b26 * SCENARIOS[scenarioKey].getMultiplier(domain, year);
        } else {
          results[domain][year] = agg.b26;
        }
      });
    });
    return results;
  }

  // Calculate per-department forecast using linear/exponential model + scenario multiplier
  function calcDeptForecast(scenarioKey) {
    const results = {};
    Object.entries(deptAgg).forEach(([dept, agg]) => {
      const actuals = [agg.b24, agg.b25, agg.b26];
      const baseForecast = forecast(actuals, forecastModel, YEARS_FORECAST);
      results[dept] = {};
      YEARS_FORECAST.forEach((year, i) => {
        let multiplier = 1;
        if (scenarioKey !== 'custom' && SCENARIOS[scenarioKey]) {
          multiplier = SCENARIOS[scenarioKey].getMultiplier('', year);
        }
        results[dept][year] = baseForecast[i].point * multiplier;
      });
    });
    return results;
  }

  // ──────────────────────────────────────────────
  // 4. INTERNATIONAL COMPARISON DATA
  // ──────────────────────────────────────────────

  // Hardcoded reasonable estimates (in billion USD)
  const intlData = [
    { country: '미국', flag: '\uD83C\uDDFA\uD83C\uDDF8', gdp: 28700, aiBudget2025: 32.0, aiBudget2026: 38.0, aiGdpRatio: 0.133, growth: 18.8 },
    { country: '중국', flag: '\uD83C\uDDE8\uD83C\uDDF3', gdp: 19400, aiBudget2025: 15.0, aiBudget2026: 19.5, aiGdpRatio: 0.101, growth: 30.0 },
    { country: 'EU',   flag: '\uD83C\uDDEA\uD83C\uDDFA', gdp: 18700, aiBudget2025: 8.5, aiBudget2026: 10.2, aiGdpRatio: 0.055, growth: 20.0 },
    { country: '일본', flag: '\uD83C\uDDEF\uD83C\uDDF5', gdp: 4400,  aiBudget2025: 3.2, aiBudget2026: 4.0,  aiGdpRatio: 0.091, growth: 25.0 },
    { country: '한국', flag: '\uD83C\uDDF0\uD83C\uDDF7', gdp: 1800,  aiBudget2025: 0, aiBudget2026: 0, aiGdpRatio: 0, growth: 0 }, // filled dynamically
  ];

  function updateKoreaIntl() {
    const korea = intlData.find(d => d.country === '한국');
    if (!korea) return;
    // Convert 백만원 to billion USD (approx 1300 KRW/USD)
    korea.aiBudget2025 = (totalB25 / 1000000) * 1.3; // rough: 백만원 -> 억원 -> billion USD
    korea.aiBudget2026 = (totalB26 / 1000000) * 1.3;
    korea.aiGdpRatio = (korea.aiBudget2026 / korea.gdp) * 100;
    korea.growth = totalB25 > 0 ? ((totalB26 - totalB25) / totalB25 * 100) : 0;
    // Correct: 백만원 to billion USD = millionKRW * 1e6 / 1e9 / 1300
    korea.aiBudget2025 = (totalB25 * 1e6) / 1e9 / 1300;
    korea.aiBudget2026 = (totalB26 * 1e6) / 1e9 / 1300;
    korea.aiGdpRatio = (korea.aiBudget2026 / korea.gdp) * 100;
  }
  updateKoreaIntl();

  // ──────────────────────────────────────────────
  // 5. RENDER HTML STRUCTURE
  // ──────────────────────────────────────────────

  function renderStructure() {
    container.innerHTML = `
      <div class="fs-container">
        <!-- Inner Tabs -->
        <div class="fs-inner-tabs">
          <button class="fs-inner-tab active" data-panel="forecast">2027-2030 예산 예측</button>
          <button class="fs-inner-tab" data-panel="scenario">AI 기술 동향 시뮬레이션</button>
          <button class="fs-inner-tab" data-panel="whatif">What-if 시나리오</button>
          <button class="fs-inner-tab" data-panel="intl">국제 비교</button>
        </div>

        <!-- Panel: Forecast -->
        <div class="fs-inner-panel active" id="fs-panel-forecast">
          <div class="fs-kpi-row" id="fs-kpi-row"></div>
          <div style="margin-top:20px">
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F4C8;</span> 예측 모델 선택
              </div>
              <div class="fs-model-group" id="fs-model-group">
                <button class="fs-model-option active" data-model="linear">선형 회귀</button>
                <button class="fs-model-option" data-model="exponential">지수 성장</button>
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-total-forecast"></canvas>
              </div>
              <div class="fs-legend" id="fs-forecast-legend"></div>
            </div>
          </div>
          <div class="fs-chart-grid" style="margin-top:20px">
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F3E2;</span> 부처별 예측 (상위 10)
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-dept-forecast"></canvas>
              </div>
            </div>
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F4CA;</span> 분야별 예측
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-field-forecast"></canvas>
              </div>
            </div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F4C9;</span> 연도별 변화 폭포 차트 (Waterfall)
            </div>
            <div id="fs-waterfall-container" style="overflow-x:auto; min-height:320px;"></div>
          </div>
        </div>

        <!-- Panel: Scenario -->
        <div class="fs-inner-panel" id="fs-panel-scenario">
          <div class="fs-card">
            <div class="fs-card-title">
              <span class="icon">&#x1F3AF;</span> 시나리오 선택
            </div>
            <div class="fs-scenario-bar" id="fs-scenario-bar"></div>
            <p id="fs-scenario-desc" style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;"></p>
            <div class="fs-chart-wrapper">
              <canvas id="fs-chart-scenario"></canvas>
            </div>
          </div>
          <div class="fs-chart-grid" style="margin-top:20px">
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F4C2;</span> 부처별 시나리오 비교
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-scenario-dept"></canvas>
              </div>
            </div>
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F310;</span> 도메인별 레이더 비교
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-radar"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel: What-if -->
        <div class="fs-inner-panel" id="fs-panel-whatif">
          <div class="fs-card">
            <div class="fs-card-title">
              <span class="icon">&#x1F39B;</span> 도메인별 예산 조정
            </div>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:14px;">
              각 AI 기술 도메인의 연간 성장률(%)을 조정하면 실시간으로 예측 차트가 업데이트됩니다.
            </p>
            <div class="fs-sliders-grid" id="fs-sliders"></div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F4C8;</span> 맞춤형 시나리오 예측
            </div>
            <div class="fs-chart-wrapper">
              <canvas id="fs-chart-whatif"></canvas>
            </div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F4BE;</span> 시나리오 저장 / 비교
            </div>
            <div class="fs-action-bar">
              <button class="fs-action-btn primary" id="fs-save-btn">시나리오 저장</button>
              <button class="fs-action-btn danger" id="fs-clear-btn">저장 목록 초기화</button>
            </div>
            <div class="fs-saved-list" id="fs-saved-list"></div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F50D;</span> 시나리오 비교 (최대 3개)
            </div>
            <div class="fs-compare-grid" id="fs-compare-grid"></div>
            <div class="fs-chart-wrapper" style="margin-top:16px">
              <canvas id="fs-chart-compare"></canvas>
            </div>
          </div>
        </div>

        <!-- Panel: International -->
        <div class="fs-inner-panel" id="fs-panel-intl">
          <div class="fs-kpi-row" id="fs-intl-kpi"></div>
          <div class="fs-chart-grid" style="margin-top:20px">
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F30D;</span> 국가별 AI 예산 비교 (2026)
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-intl-budget"></canvas>
              </div>
            </div>
            <div class="fs-card">
              <div class="fs-card-title">
                <span class="icon">&#x1F4B1;</span> GDP 대비 AI 투자 비율
              </div>
              <div class="fs-chart-wrapper">
                <canvas id="fs-chart-intl-gdp"></canvas>
              </div>
            </div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F4CB;</span> 국가별 AI 투자 현황
            </div>
            <div style="overflow-x:auto;">
              <table class="fs-intl-table" id="fs-intl-table"></table>
            </div>
          </div>
          <div class="fs-card" style="margin-top:20px">
            <div class="fs-card-title">
              <span class="icon">&#x1F4C8;</span> 시나리오별 한국 순위 전망 (2030)
            </div>
            <div class="fs-chart-wrapper">
              <canvas id="fs-chart-intl-projection"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event: Inner tabs
    container.querySelectorAll('.fs-inner-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.fs-inner-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.fs-inner-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panelId = 'fs-panel-' + tab.dataset.panel;
        document.getElementById(panelId)?.classList.add('active');
        activeInnerTab = tab.dataset.panel;
        renderActivePanel();
      });
    });
  }

  // ──────────────────────────────────────────────
  // 6. RENDER FUNCTIONS
  // ──────────────────────────────────────────────

  function destroyFsChart(id) {
    if (typeof destroyChart === 'function') {
      destroyChart(id);
    } else if (chartInstances && chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  }

  function createChart(id, config) {
    destroyFsChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, config);
    if (typeof chartInstances !== 'undefined') {
      chartInstances[id] = chart;
    }
    return chart;
  }

  function labelColor() {
    return typeof getChartLabelColor === 'function' ? getChartLabelColor() : '#8899aa';
  }

  function gridColor() {
    return typeof getChartGridColor === 'function' ? getChartGridColor() : '#2a3a4e33';
  }

  function fmtB(millionWon) {
    if (typeof formatBillion === 'function') return formatBillion(millionWon);
    if (millionWon == null || isNaN(millionWon)) return '-';
    const b = millionWon / 100;
    if (Math.abs(b) >= 10000) return (b / 10000).toFixed(1) + '\uC870';
    if (Math.abs(b) >= 1) return b.toFixed(1) + '\uC5B5';
    return millionWon.toFixed(0) + '\uBC31\uB9CC';
  }

  function fmtPct(v) {
    if (v == null || isNaN(v)) return '-';
    const sign = v > 0 ? '+' : '';
    return sign + v.toFixed(1) + '%';
  }

  function renderActivePanel() {
    switch (activeInnerTab) {
      case 'forecast': renderForecastPanel(); break;
      case 'scenario': renderScenarioPanel(); break;
      case 'whatif': renderWhatIfPanel(); break;
      case 'intl': renderIntlPanel(); break;
    }
  }

  // ──────────────────────────────────────────────
  // 6A. FORECAST PANEL
  // ──────────────────────────────────────────────

  function renderForecastPanel() {
    renderKPIs();
    renderModelButtons();
    renderTotalForecastChart();
    renderDeptForecastChart();
    renderFieldForecastChart();
    renderWaterfallChart();
  }

  function renderKPIs() {
    const fc = forecast([totalB24, totalB25, totalB26], forecastModel, YEARS_FORECAST);
    const fc2030 = fc[3]?.point || 0;
    const growthRate = totalB26 > 0 ? ((fc2030 - totalB26) / totalB26 * 100) : 0;
    const avgAnnualGrowth = totalB26 > 0 ? ((Math.pow(fc2030 / totalB26, 1 / 4) - 1) * 100) : 0;
    const changeYoY = totalB25 > 0 ? ((totalB26 - totalB25) / totalB25 * 100) : 0;

    document.getElementById('fs-kpi-row').innerHTML = `
      <div class="fs-kpi-card fs-animate">
        <div class="fs-kpi-icon blue">&#x1F4B0;</div>
        <div class="fs-kpi-label">2026 AI 총예산</div>
        <div class="fs-kpi-value">${fmtB(totalB26)}</div>
        <div class="fs-kpi-sub ${changeYoY >= 0 ? 'positive' : 'negative'}">${fmtPct(changeYoY)} vs 2025</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-1">
        <div class="fs-kpi-icon purple">&#x1F52E;</div>
        <div class="fs-kpi-label">2030 예측 (${forecastModel === 'linear' ? '선형' : '지수'})</div>
        <div class="fs-kpi-value">${fmtB(fc2030)}</div>
        <div class="fs-kpi-sub ${growthRate >= 0 ? 'positive' : 'negative'}">${fmtPct(growthRate)} vs 2026</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-2">
        <div class="fs-kpi-icon green">&#x1F4C8;</div>
        <div class="fs-kpi-label">연평균 성장률 (CAGR)</div>
        <div class="fs-kpi-value">${fmtPct(avgAnnualGrowth)}</div>
        <div class="fs-kpi-sub neutral">2026-2030 예측치</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-3">
        <div class="fs-kpi-icon yellow">&#x1F4CA;</div>
        <div class="fs-kpi-label">분석 대상 사업</div>
        <div class="fs-kpi-value">${projects.length}개</div>
        <div class="fs-kpi-sub neutral">${allDepts.length}개 부처</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-4">
        <div class="fs-kpi-icon red">&#x1F3AF;</div>
        <div class="fs-kpi-label">2030 신뢰구간</div>
        <div class="fs-kpi-value">${fmtB(fc[3]?.lo || 0)} ~ ${fmtB(fc[3]?.hi || 0)}</div>
        <div class="fs-kpi-sub neutral">95% 신뢰수준</div>
      </div>
    `;
  }

  function renderModelButtons() {
    document.getElementById('fs-model-group').querySelectorAll('.fs-model-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.model === forecastModel);
      btn.onclick = () => {
        forecastModel = btn.dataset.model;
        renderForecastPanel();
      };
    });
  }

  function renderTotalForecastChart() {
    const actuals = [totalB24, totalB25, totalB26];
    const fc = forecast(actuals, forecastModel, YEARS_FORECAST);

    const allValues = [...actuals, ...fc.map(f => f.point)];
    const loValues = [...actuals, ...fc.map(f => f.lo)];
    const hiValues = [...actuals, ...fc.map(f => f.hi)];

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff';

    createChart('fs-chart-total-forecast', {
      type: 'line',
      data: {
        labels: YEARS_ALL.map(String),
        datasets: [
          {
            label: '신뢰구간 상한',
            data: [null, null, null, ...fc.map(f => f.hi / 100)],
            borderColor: 'transparent',
            backgroundColor: 'rgba(74,158,255,0.1)',
            fill: '+1',
            pointRadius: 0,
            tension: 0.3,
            order: 3
          },
          {
            label: '예측치',
            data: allValues.map((v, i) => v / 100),
            borderColor: accentColor,
            backgroundColor: accentColor,
            borderWidth: 3,
            pointRadius: YEARS_ALL.map((_, i) => i < 3 ? 5 : 4),
            pointStyle: YEARS_ALL.map((_, i) => i < 3 ? 'circle' : 'rectRot'),
            borderDash: [0, 0, 0, 5, 5],
            segment: {
              borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
            },
            tension: 0.3,
            fill: false,
            order: 1
          },
          {
            label: '신뢰구간 하한',
            data: [null, null, null, ...fc.map(f => f.lo / 100)],
            borderColor: 'transparent',
            backgroundColor: 'rgba(74,158,255,0.1)',
            fill: false,
            pointRadius: 0,
            tension: 0.3,
            order: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.datasetIndex === 1) {
                  const idx = ctx.dataIndex;
                  const val = allValues[idx];
                  let label = `예산: ${fmtB(val)}`;
                  if (idx >= 3) {
                    const fi = idx - 3;
                    label += ` (${fmtB(fc[fi].lo)} ~ ${fmtB(fc[fi].hi)})`;
                  }
                  return label;
                }
                return null;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor() },
            grid: { color: gridColor() }
          },
          y: {
            ticks: {
              color: labelColor(),
              callback: v => fmtB(v * 100)
            },
            grid: { color: gridColor() },
            title: {
              display: true,
              text: '예산 규모',
              color: labelColor()
            }
          }
        }
      }
    });

    document.getElementById('fs-forecast-legend').innerHTML = `
      <div class="fs-legend-item">
        <div class="fs-legend-line" style="background:${accentColor}"></div>
        <span>실적/예측</span>
      </div>
      <div class="fs-legend-item">
        <div class="fs-legend-swatch" style="background:rgba(74,158,255,0.15)"></div>
        <span>95% 신뢰구간</span>
      </div>
      <div class="fs-legend-item">
        <div class="fs-legend-line" style="background:${accentColor};border-top:2px dashed ${accentColor};height:0;"></div>
        <span style="margin-left:2px;">--- 예측 구간</span>
      </div>
    `;
  }

  function renderDeptForecastChart() {
    // Top 10 departments by 2026 budget
    const topDepts = Object.entries(deptAgg)
      .sort((a, b) => b[1].b26 - a[1].b26)
      .slice(0, 10);

    const datasets = YEARS_ALL.map((year, yi) => {
      return {
        label: year + '년',
        data: topDepts.map(([dept, agg]) => {
          if (year <= 2026) {
            return (year === 2024 ? agg.b24 : year === 2025 ? agg.b25 : agg.b26) / 100;
          } else {
            const actuals = [agg.b24, agg.b25, agg.b26];
            const fc = forecast(actuals, forecastModel, YEARS_FORECAST);
            return fc[year - 2027].point / 100;
          }
        }),
        backgroundColor: COLORS[yi % COLORS.length] + (year <= 2026 ? 'cc' : '66'),
        borderColor: COLORS[yi % COLORS.length],
        borderWidth: 1
      };
    });

    createChart('fs-chart-dept-forecast', {
      type: 'bar',
      data: {
        labels: topDepts.map(([d]) => d.length > 8 ? d.slice(0, 8) + '..' : d),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor(), maxRotation: 45 },
            grid: { display: false }
          },
          y: {
            ticks: { color: labelColor(), callback: v => fmtB(v * 100) },
            grid: { color: gridColor() },
            stacked: false
          }
        }
      }
    });
  }

  function renderFieldForecastChart() {
    const topFields = Object.entries(fieldAgg)
      .sort((a, b) => b[1].b26 - a[1].b26)
      .slice(0, 8);

    const datasets = [];
    topFields.forEach(([field, agg], fi) => {
      const actuals = [agg.b24, agg.b25, agg.b26];
      const fc = forecast(actuals, forecastModel, YEARS_FORECAST);
      datasets.push({
        label: field.length > 12 ? field.slice(0, 12) + '..' : field,
        data: [...actuals.map(v => v / 100), ...fc.map(f => f.point / 100)],
        borderColor: COLORS[fi % COLORS.length],
        backgroundColor: COLORS[fi % COLORS.length] + '22',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        segment: {
          borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
        }
      });
    });

    createChart('fs-chart-field-forecast', {
      type: 'line',
      data: { labels: YEARS_ALL.map(String), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor() },
            grid: { color: gridColor() }
          },
          y: {
            ticks: { color: labelColor(), callback: v => fmtB(v * 100) },
            grid: { color: gridColor() }
          }
        }
      }
    });
  }

  function renderWaterfallChart() {
    const wfContainer = document.getElementById('fs-waterfall-container');
    if (!wfContainer) return;

    const fc = forecast([totalB24, totalB25, totalB26], forecastModel, YEARS_FORECAST);
    const allVals = [totalB24, totalB25, totalB26, ...fc.map(f => f.point)];
    const changes = [];
    for (let i = 1; i < allVals.length; i++) {
      changes.push({
        year: YEARS_ALL[i],
        change: allVals[i] - allVals[i - 1],
        total: allVals[i],
        isForecast: i >= 3
      });
    }

    const width = Math.max(wfContainer.clientWidth, 600);
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 40, left: 80 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    wfContainer.innerHTML = '';
    const svg = d3.select(wfContainer)
      .append('svg')
      .attr('class', 'fs-waterfall-svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const labels = ['2024\n(기준)', ...changes.map(c => c.year + (c.isForecast ? '*' : ''))];
    const x = d3.scaleBand().domain(labels).range([0, innerW]).padding(0.35);

    // Build waterfall values
    const bars = [{ label: labels[0], start: 0, end: allVals[0], isBase: true, isForecast: false }];
    let running = allVals[0];
    changes.forEach((c, i) => {
      const prev = running;
      running += c.change;
      bars.push({
        label: labels[i + 1],
        start: Math.min(prev, running),
        end: Math.max(prev, running),
        isPositive: c.change >= 0,
        change: c.change,
        total: c.total,
        isBase: false,
        isForecast: c.isForecast
      });
    });

    const maxVal = d3.max(bars, d => d.end) * 1.1;
    const y = d3.scaleLinear().domain([0, maxVal]).range([innerH, 0]);

    // Axes
    const textColor = labelColor();
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(v => fmtB(v)))
      .selectAll('text')
      .style('fill', textColor);

    // Grid lines
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(''))
      .selectAll('line')
      .style('stroke', gridColor())
      .style('stroke-dasharray', '3,3');
    g.selectAll('.domain').style('stroke', 'none');

    // Connector lines
    for (let i = 0; i < bars.length - 1; i++) {
      const curr = bars[i];
      const next = bars[i + 1];
      g.append('line')
        .attr('x1', x(curr.label) + x.bandwidth())
        .attr('x2', x(next.label))
        .attr('y1', y(curr.end))
        .attr('y2', y(curr.end))
        .style('stroke', textColor)
        .style('stroke-dasharray', '2,2')
        .style('stroke-width', 1)
        .style('opacity', 0.4);
    }

    // Bars
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff';
    const greenColor = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#34d399';
    const redColor = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#f87171';

    g.selectAll('.wf-bar')
      .data(bars)
      .join('rect')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.end))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.max(1, y(d.start) - y(d.end)))
      .attr('rx', 3)
      .attr('fill', d => {
        if (d.isBase) return accentColor;
        return d.isPositive ? greenColor : redColor;
      })
      .attr('opacity', d => d.isForecast ? 0.6 : 0.85);

    // Labels on bars
    g.selectAll('.wf-label')
      .data(bars)
      .join('text')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.end) - 6)
      .attr('text-anchor', 'middle')
      .style('fill', textColor)
      .style('font-size', '10px')
      .style('font-weight', '600')
      .text(d => {
        if (d.isBase) return fmtB(d.end);
        const sign = d.change >= 0 ? '+' : '';
        return sign + fmtB(d.change);
      });
  }

  // ──────────────────────────────────────────────
  // 6B. SCENARIO PANEL
  // ──────────────────────────────────────────────

  function renderScenarioPanel() {
    renderScenarioButtons();
    renderScenarioChart();
    renderScenarioDeptChart();
    renderRadarChart();
  }

  function renderScenarioButtons() {
    const bar = document.getElementById('fs-scenario-bar');
    bar.innerHTML = Object.entries(SCENARIOS).map(([key, sc]) =>
      `<button class="fs-scenario-btn ${activeScenario === key ? 'active' : ''}" data-scenario="${key}">${sc.name}</button>`
    ).join('');

    bar.querySelectorAll('.fs-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeScenario = btn.dataset.scenario;
        renderScenarioPanel();
      });
    });

    document.getElementById('fs-scenario-desc').textContent = SCENARIOS[activeScenario]?.desc || '';
  }

  function renderScenarioChart() {
    const datasets = [];
    const scenarioKeys = Object.keys(SCENARIOS);

    scenarioKeys.forEach((key, si) => {
      const sc = SCENARIOS[key];
      const scForecast = calcScenarioForecast(key);
      const vals = [totalB24, totalB25, totalB26, ...YEARS_FORECAST.map(y => scForecast[y])];

      datasets.push({
        label: sc.name,
        data: vals.map(v => v / 100),
        borderColor: COLORS[si],
        backgroundColor: COLORS[si] + '22',
        borderWidth: key === activeScenario ? 3 : 1.5,
        pointRadius: key === activeScenario ? 5 : 2,
        tension: 0.3,
        fill: key === activeScenario,
        segment: {
          borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
        },
        order: key === activeScenario ? 0 : 1
      });
    });

    createChart('fs-chart-scenario', {
      type: 'line',
      data: { labels: YEARS_ALL.map(String), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor() },
            grid: { color: gridColor() }
          },
          y: {
            ticks: { color: labelColor(), callback: v => fmtB(v * 100) },
            grid: { color: gridColor() }
          }
        }
      }
    });
  }

  function renderScenarioDeptChart() {
    const topDepts = Object.entries(deptAgg)
      .sort((a, b) => b[1].b26 - a[1].b26)
      .slice(0, 10);

    const deptForecast = calcDeptForecast(activeScenario);

    const datasets = [
      {
        label: '2026 (실제)',
        data: topDepts.map(([d, a]) => a.b26 / 100),
        backgroundColor: COLORS[0] + 'cc',
        borderColor: COLORS[0],
        borderWidth: 1
      },
      {
        label: '2028 (예측)',
        data: topDepts.map(([d]) => (deptForecast[d]?.[2028] || 0) / 100),
        backgroundColor: COLORS[2] + '88',
        borderColor: COLORS[2],
        borderWidth: 1
      },
      {
        label: '2030 (예측)',
        data: topDepts.map(([d]) => (deptForecast[d]?.[2030] || 0) / 100),
        backgroundColor: COLORS[3] + '66',
        borderColor: COLORS[3],
        borderWidth: 1
      }
    ];

    createChart('fs-chart-scenario-dept', {
      type: 'bar',
      data: {
        labels: topDepts.map(([d]) => d.length > 8 ? d.slice(0, 8) + '..' : d),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor(), maxRotation: 45 },
            grid: { display: false }
          },
          y: {
            ticks: { color: labelColor(), callback: v => fmtB(v * 100) },
            grid: { color: gridColor() }
          }
        }
      }
    });
  }

  function renderRadarChart() {
    const topDomains = Object.entries(domainAgg)
      .sort((a, b) => b[1].b26 - a[1].b26)
      .slice(0, 10);

    const labels = topDomains.map(([d]) => d.length > 10 ? d.slice(0, 10) + '..' : d);
    const maxBudget = Math.max(...topDomains.map(([, a]) => a.b26));

    const scenarioKeys = ['current', 'accelerate', 'global', 'austerity'];
    const datasets = scenarioKeys.map((key, si) => {
      const domForecast = calcDomainForecast(key);
      return {
        label: SCENARIOS[key].name,
        data: topDomains.map(([d]) => {
          const val2030 = domForecast[d]?.[2030] || 0;
          return maxBudget > 0 ? (val2030 / maxBudget * 100) : 0;
        }),
        borderColor: COLORS[si],
        backgroundColor: COLORS[si] + '22',
        borderWidth: key === activeScenario ? 3 : 1.5,
        pointRadius: key === activeScenario ? 4 : 2
      };
    });

    createChart('fs-chart-radar', {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          }
        },
        scales: {
          r: {
            ticks: { color: labelColor(), backdropColor: 'transparent' },
            grid: { color: gridColor() },
            pointLabels: { color: labelColor(), font: { size: 11 } },
            suggestedMin: 0
          }
        }
      }
    });
  }

  // ──────────────────────────────────────────────
  // 6C. WHAT-IF PANEL
  // ──────────────────────────────────────────────

  function renderWhatIfPanel() {
    renderSliders();
    renderWhatIfChart();
    renderSavedList();
    renderCompareGrid();
    renderCompareChart();
  }

  function renderSliders() {
    const slidersEl = document.getElementById('fs-sliders');
    const topDomains = Object.entries(domainAgg)
      .sort((a, b) => b[1].b26 - a[1].b26)
      .slice(0, 12);

    slidersEl.innerHTML = topDomains.map(([domain, agg]) => {
      const rate = customRates[domain] || 0;
      return `
        <div class="fs-slider-item">
          <div class="fs-slider-label">
            <span>${domain}</span>
            <span class="fs-slider-value" id="fs-sv-${cssId(domain)}">${rate >= 0 ? '+' : ''}${rate}%</span>
          </div>
          <input type="range" class="fs-slider-input" min="-30" max="50" value="${rate}" step="1"
            data-domain="${domain}" id="fs-si-${cssId(domain)}">
          <div class="fs-slider-budget">2026: ${fmtB(agg.b26)}</div>
        </div>
      `;
    }).join('');

    slidersEl.querySelectorAll('.fs-slider-input').forEach(slider => {
      slider.addEventListener('input', () => {
        const domain = slider.dataset.domain;
        const val = parseInt(slider.value);
        customRates[domain] = val;
        const valEl = document.getElementById('fs-sv-' + cssId(domain));
        if (valEl) valEl.textContent = (val >= 0 ? '+' : '') + val + '%';
        renderWhatIfChart();
      });
    });
  }

  function cssId(s) {
    return s.replace(/[^a-zA-Z0-9\uAC00-\uD7AF]/g, '_');
  }

  function renderWhatIfChart() {
    const customForecast = calcScenarioForecast('custom');
    const currentForecast = calcScenarioForecast('current');

    const customVals = [totalB24, totalB25, totalB26, ...YEARS_FORECAST.map(y => customForecast[y])];
    const currentVals = [totalB24, totalB25, totalB26, ...YEARS_FORECAST.map(y => currentForecast[y])];

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff';
    const greenColor = getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#34d399';

    createChart('fs-chart-whatif', {
      type: 'line',
      data: {
        labels: YEARS_ALL.map(String),
        datasets: [
          {
            label: '맞춤형 시나리오',
            data: customVals.map(v => v / 100),
            borderColor: accentColor,
            backgroundColor: accentColor + '22',
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.3,
            fill: true,
            segment: {
              borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
            }
          },
          {
            label: '현 추세 유지 (기준)',
            data: currentVals.map(v => v / 100),
            borderColor: greenColor,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.3,
            borderDash: [4, 4],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor() },
            grid: { color: gridColor() }
          },
          y: {
            ticks: { color: labelColor(), callback: v => fmtB(v * 100) },
            grid: { color: gridColor() }
          }
        }
      }
    });
  }

  function renderSavedList() {
    const listEl = document.getElementById('fs-saved-list');
    const saveBtn = document.getElementById('fs-save-btn');
    const clearBtn = document.getElementById('fs-clear-btn');

    const keys = Object.keys(savedScenarios);
    listEl.innerHTML = keys.length === 0
      ? '<span style="font-size:0.82rem;color:var(--text-muted)">저장된 시나리오가 없습니다.</span>'
      : keys.map(name => `
        <div class="fs-saved-chip" data-name="${name}">
          <span>${name}</span>
          <span class="remove" data-name="${name}">&times;</span>
        </div>
      `).join('');

    // Save button
    saveBtn.onclick = () => {
      const name = prompt('시나리오 이름을 입력하세요:');
      if (!name) return;
      savedScenarios[name] = { ...customRates };
      saveScenariosToStorage();
      renderSavedList();
    };

    // Clear button
    clearBtn.onclick = () => {
      if (!confirm('모든 저장된 시나리오를 삭제하시겠습니까?')) return;
      savedScenarios = {};
      saveScenariosToStorage();
      compareSlots = [null, null, null];
      renderSavedList();
      renderCompareGrid();
      renderCompareChart();
    };

    // Chip click: load scenario
    listEl.querySelectorAll('.fs-saved-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
          const n = e.target.dataset.name;
          delete savedScenarios[n];
          saveScenariosToStorage();
          // Remove from compare slots too
          compareSlots = compareSlots.map(s => s === n ? null : s);
          renderSavedList();
          renderCompareGrid();
          renderCompareChart();
          return;
        }
        const n = chip.dataset.name;
        const rates = savedScenarios[n];
        if (rates) {
          Object.assign(customRates, rates);
          renderSliders();
          renderWhatIfChart();
        }
      });
    });

    // Also add to compare on double click
    listEl.querySelectorAll('.fs-saved-chip').forEach(chip => {
      chip.addEventListener('dblclick', () => {
        const n = chip.dataset.name;
        const emptyIdx = compareSlots.indexOf(null);
        if (emptyIdx >= 0 && !compareSlots.includes(n)) {
          compareSlots[emptyIdx] = n;
          renderCompareGrid();
          renderCompareChart();
        }
      });
    });
  }

  function renderCompareGrid() {
    const gridEl = document.getElementById('fs-compare-grid');

    gridEl.innerHTML = compareSlots.map((name, i) => {
      if (!name || !savedScenarios[name]) {
        return `
          <div class="fs-compare-slot" data-idx="${i}">
            <div class="fs-compare-slot-empty">
              저장된 시나리오를 더블클릭하여 추가
            </div>
          </div>
        `;
      }

      const rates = savedScenarios[name];
      const fc = calcScenarioForecast('custom', rates);
      const total2030 = fc[2030] || 0;
      const growth = totalB26 > 0 ? ((total2030 - totalB26) / totalB26 * 100) : 0;

      const topDomainChanges = Object.entries(rates)
        .filter(([, v]) => v !== 0)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 5);

      return `
        <div class="fs-compare-slot filled" data-idx="${i}">
          <div class="fs-compare-slot-header">
            <div class="fs-compare-slot-title">${name}</div>
            <button class="fs-compare-slot-remove" data-idx="${i}">&times;</button>
          </div>
          <div class="fs-compare-item">
            <span class="fs-compare-item-label">2030 총예산</span>
            <span class="fs-compare-item-value">${fmtB(total2030)}</span>
          </div>
          <div class="fs-compare-item">
            <span class="fs-compare-item-label">성장률 (vs 2026)</span>
            <span class="fs-compare-item-value ${growth >= 0 ? 'fs-highlight-green' : 'fs-highlight-red'}">${fmtPct(growth)}</span>
          </div>
          ${topDomainChanges.map(([d, r]) => `
            <div class="fs-compare-item">
              <span class="fs-compare-item-label">${d}</span>
              <span class="fs-compare-item-value">${r >= 0 ? '+' : ''}${r}%/년</span>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('.fs-compare-slot-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        compareSlots[idx] = null;
        renderCompareGrid();
        renderCompareChart();
      });
    });
  }

  function renderCompareChart() {
    const filledSlots = compareSlots.filter(s => s && savedScenarios[s]);
    if (filledSlots.length === 0) {
      destroyFsChart('fs-chart-compare');
      const canvas = document.getElementById('fs-chart-compare');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const datasets = filledSlots.map((name, si) => {
      const rates = savedScenarios[name];
      const fc = calcScenarioForecast('custom', rates);
      const vals = [totalB24, totalB25, totalB26, ...YEARS_FORECAST.map(y => fc[y])];
      return {
        label: name,
        data: vals.map(v => v / 100),
        borderColor: COLORS[si * 3],
        backgroundColor: COLORS[si * 3] + '22',
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.3,
        fill: false,
        segment: {
          borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
        }
      };
    });

    createChart('fs-chart-compare', {
      type: 'line',
      data: { labels: YEARS_ALL.map(String), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${fmtB(ctx.raw * 100)}`
            }
          }
        },
        scales: {
          x: { ticks: { color: labelColor() }, grid: { color: gridColor() } },
          y: { ticks: { color: labelColor(), callback: v => fmtB(v * 100) }, grid: { color: gridColor() } }
        }
      }
    });
  }

  // ──────────────────────────────────────────────
  // 6D. INTERNATIONAL PANEL
  // ──────────────────────────────────────────────

  function renderIntlPanel() {
    renderIntlKPIs();
    renderIntlBudgetChart();
    renderIntlGdpChart();
    renderIntlTable();
    renderIntlProjectionChart();
  }

  function renderIntlKPIs() {
    const korea = intlData.find(d => d.country === '\uD55C\uAD6D');
    const us = intlData.find(d => d.country === '\uBBF8\uAD6D');

    const koreaRank = [...intlData].sort((a, b) => b.aiBudget2026 - a.aiBudget2026)
      .findIndex(d => d.country === '\uD55C\uAD6D') + 1;

    const gdpRatio = korea ? korea.aiGdpRatio : 0;
    const vsUS = us && korea ? (korea.aiBudget2026 / us.aiBudget2026 * 100) : 0;

    document.getElementById('fs-intl-kpi').innerHTML = `
      <div class="fs-kpi-card fs-animate">
        <div class="fs-kpi-icon blue">&#x1F30D;</div>
        <div class="fs-kpi-label">한국 AI 예산 순위</div>
        <div class="fs-kpi-value">${koreaRank}위</div>
        <div class="fs-kpi-sub neutral">${intlData.length}개국 중</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-1">
        <div class="fs-kpi-icon green">&#x1F4B1;</div>
        <div class="fs-kpi-label">GDP 대비 AI 투자</div>
        <div class="fs-kpi-value">${gdpRatio.toFixed(3)}%</div>
        <div class="fs-kpi-sub neutral">2026 기준</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-2">
        <div class="fs-kpi-icon purple">&#x1F1FA;&#x1F1F8;</div>
        <div class="fs-kpi-label">대미 AI 예산 비율</div>
        <div class="fs-kpi-value">${vsUS.toFixed(1)}%</div>
        <div class="fs-kpi-sub neutral">미국 대비</div>
      </div>
      <div class="fs-kpi-card fs-animate fs-animate-delay-3">
        <div class="fs-kpi-icon yellow">&#x1F4B0;</div>
        <div class="fs-kpi-label">한국 AI 예산 (USD)</div>
        <div class="fs-kpi-value">${korea ? korea.aiBudget2026.toFixed(1) : '-'}B</div>
        <div class="fs-kpi-sub neutral">billion USD</div>
      </div>
    `;
  }

  function renderIntlBudgetChart() {
    const sorted = [...intlData].sort((a, b) => b.aiBudget2026 - a.aiBudget2026);
    const koreaColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff';

    createChart('fs-chart-intl-budget', {
      type: 'bar',
      data: {
        labels: sorted.map(d => d.flag + ' ' + d.country),
        datasets: [{
          label: 'AI 예산 (billion USD)',
          data: sorted.map(d => d.aiBudget2026),
          backgroundColor: sorted.map(d =>
            d.country === '\uD55C\uAD6D' ? koreaColor : COLORS[3] + '66'
          ),
          borderColor: sorted.map(d =>
            d.country === '\uD55C\uAD6D' ? koreaColor : COLORS[3]
          ),
          borderWidth: sorted.map(d => d.country === '\uD55C\uAD6D' ? 2 : 1)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw.toFixed(1)} billion USD`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor(), callback: v => v + 'B' },
            grid: { color: gridColor() }
          },
          y: {
            ticks: { color: labelColor(), font: { size: 13 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  function renderIntlGdpChart() {
    const sorted = [...intlData].sort((a, b) => b.aiGdpRatio - a.aiGdpRatio);
    const koreaColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff';

    createChart('fs-chart-intl-gdp', {
      type: 'bar',
      data: {
        labels: sorted.map(d => d.flag + ' ' + d.country),
        datasets: [{
          label: 'GDP 대비 AI 투자 (%)',
          data: sorted.map(d => d.aiGdpRatio),
          backgroundColor: sorted.map(d =>
            d.country === '\uD55C\uAD6D' ? koreaColor : COLORS[1] + '66'
          ),
          borderColor: sorted.map(d =>
            d.country === '\uD55C\uAD6D' ? koreaColor : COLORS[1]
          ),
          borderWidth: sorted.map(d => d.country === '\uD55C\uAD6D' ? 2 : 1)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw.toFixed(3)}%`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: labelColor(), callback: v => v.toFixed(2) + '%' },
            grid: { color: gridColor() }
          },
          y: {
            ticks: { color: labelColor(), font: { size: 13 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  function renderIntlTable() {
    const sorted = [...intlData].sort((a, b) => b.aiBudget2026 - a.aiBudget2026);
    const maxBudget = sorted[0]?.aiBudget2026 || 1;

    const tableEl = document.getElementById('fs-intl-table');
    tableEl.innerHTML = `
      <thead>
        <tr>
          <th>순위</th>
          <th>국가</th>
          <th>AI 예산 (2026)</th>
          <th>GDP (B$)</th>
          <th>GDP 대비 비율</th>
          <th>전년대비 성장률</th>
          <th>예산 규모</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map((d, i) => {
          const barWidth = (d.aiBudget2026 / maxBudget * 100).toFixed(0);
          const barColor = d.country === '\uD55C\uAD6D'
            ? (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4a9eff')
            : COLORS[i + 1];
          return `
            <tr>
              <td style="font-weight:700">${i + 1}</td>
              <td><span class="fs-intl-flag">${d.flag}</span>${d.country}</td>
              <td style="font-weight:700">${d.aiBudget2026.toFixed(1)}B USD</td>
              <td>${d.gdp.toLocaleString()}B</td>
              <td>${d.aiGdpRatio.toFixed(3)}%</td>
              <td style="color:${d.growth >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:600">
                ${d.growth >= 0 ? '+' : ''}${d.growth.toFixed(1)}%
              </td>
              <td class="fs-intl-bar-cell">
                <div class="fs-intl-bar" style="width:${barWidth}%;background:${barColor}">${d.aiBudget2026.toFixed(1)}B</div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  function renderIntlProjectionChart() {
    // Project Korea's position under different scenarios
    const scenarioKeys = ['current', 'accelerate', 'global', 'austerity'];
    const korea = intlData.find(d => d.country === '\uD55C\uAD6D');
    if (!korea) return;

    const datasets = scenarioKeys.map((key, si) => {
      const sc = SCENARIOS[key];
      const vals = YEARS_ALL.map(year => {
        if (year <= 2026) return korea.aiBudget2026 * (year === 2024 ? 0.85 : year === 2025 ? 0.92 : 1);
        const mult = sc.getMultiplier('', year);
        return korea.aiBudget2026 * mult;
      });

      return {
        label: sc.name,
        data: vals,
        borderColor: COLORS[si],
        backgroundColor: COLORS[si] + '22',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        fill: false,
        segment: {
          borderDash: ctx => ctx.p0DataIndex >= 2 ? [6, 4] : undefined
        }
      };
    });

    // Add reference lines for other countries (projected at their growth rates)
    const otherCountries = intlData.filter(d => d.country !== '\uD55C\uAD6D');
    otherCountries.forEach((c, ci) => {
      const vals = YEARS_ALL.map(year => {
        const yearsFromBase = year - 2026;
        return c.aiBudget2026 * Math.pow(1 + c.growth / 100, yearsFromBase);
      });
      datasets.push({
        label: c.flag + ' ' + c.country,
        data: vals,
        borderColor: COLORS[10 + ci],
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        borderDash: [8, 4],
        fill: false
      });
    });

    createChart('fs-chart-intl-projection', {
      type: 'line',
      data: { labels: YEARS_ALL.map(String), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: labelColor(), boxWidth: 12, font: { size: 10 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}B USD`
            }
          }
        },
        scales: {
          x: { ticks: { color: labelColor() }, grid: { color: gridColor() } },
          y: {
            ticks: { color: labelColor(), callback: v => v.toFixed(0) + 'B' },
            grid: { color: gridColor() },
            title: { display: true, text: 'billion USD', color: labelColor() }
          }
        }
      }
    });
  }

  // ──────────────────────────────────────────────
  // 7. INITIALIZATION
  // ──────────────────────────────────────────────

  renderStructure();
  renderActivePanel();
}
