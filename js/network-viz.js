// Network Visualization - D3 Force-Directed Graph with Auto-Clustering
(function() {
  'use strict';

  let _networkInitialized = false;
  let _simulation = null;
  let _networkData = null;

  function getBudget(p) {
    return p.budget?.budget_2026 ?? p.budget?.['2026_budget'] ?? 0;
  }

  function tokenize(text) {
    return (text || '').replace(/\([^)]*\)/g, '').replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .split(/\s+/).filter(w => w.length > 1);
  }

  function jaccardSim(a, b) {
    const setA = new Set(a), setB = new Set(b);
    const inter = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : inter / union;
  }

  function fullText(p) {
    const parts = [p.project_name || p.name || '', p.purpose || '', p.description || ''];
    if (p.keywords) parts.push(Array.isArray(p.keywords) ? p.keywords.join(' ') : p.keywords);
    if (p.sub_projects) parts.push(p.sub_projects.map(s => s.name || '').join(' '));
    return parts.join(' ').toLowerCase();
  }

  // Union-Find for clustering
  class UnionFind {
    constructor(n) { this.parent = Array.from({length: n}, (_, i) => i); this.rank = new Array(n).fill(0); }
    find(x) { if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); return this.parent[x]; }
    union(x, y) {
      const rx = this.find(x), ry = this.find(y);
      if (rx === ry) return;
      if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
      else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
      else { this.parent[ry] = rx; this.rank[rx]++; }
    }
  }

  function computeNetwork(projects, threshold, nodeLimit) {
    // Sort by budget, take top N
    const sorted = projects.slice().sort((a, b) => getBudget(b) - getBudget(a));
    const topProjects = sorted.slice(0, nodeLimit);

    // Tokenize
    const tokenized = topProjects.map(p => ({
      project: p,
      tokens: tokenize(fullText(p))
    }));

    // Compute pairwise similarity
    const edges = [];
    const thresholdVal = threshold / 100;
    for (let i = 0; i < tokenized.length; i++) {
      for (let j = i + 1; j < tokenized.length; j++) {
        const sim = jaccardSim(tokenized[i].tokens, tokenized[j].tokens);
        if (sim >= thresholdVal) {
          edges.push({ source: i, target: j, similarity: sim });
        }
      }
    }

    // Clustering with Union-Find (at 40% threshold for clusters)
    const clusterThreshold = Math.max(thresholdVal, 0.4);
    const uf = new UnionFind(topProjects.length);
    edges.forEach(e => {
      if (e.similarity >= clusterThreshold) uf.union(e.source, e.target);
    });

    // Assign cluster IDs
    const clusterMap = {};
    let clusterId = 0;
    const nodeCluster = topProjects.map((_, i) => {
      const root = uf.find(i);
      if (!(root in clusterMap)) clusterMap[root] = clusterId++;
      return clusterMap[root];
    });

    // Build cluster info
    const clusters = {};
    topProjects.forEach((p, i) => {
      const cid = nodeCluster[i];
      if (!clusters[cid]) clusters[cid] = { id: cid, members: [], totalBudget: 0 };
      clusters[cid].members.push(i);
      clusters[cid].totalBudget += getBudget(p);
    });

    // Nodes
    const nodes = topProjects.map((p, i) => ({
      id: i,
      projectId: p.id,
      name: p.project_name || p.name || '',
      department: p.department || '',
      budget: getBudget(p),
      cluster: nodeCluster[i]
    }));

    return { nodes, edges, clusters: Object.values(clusters) };
  }

  function renderNetwork(container) {
    const svg = d3.select('#network-svg');
    svg.selectAll('*').remove();

    const data = _networkData;
    if (!data || data.nodes.length === 0) {
      svg.append('text').attr('x', '50%').attr('y', '50%')
        .attr('text-anchor', 'middle').attr('fill', 'var(--text-muted)')
        .attr('font-size', '14px').text('표시할 데이터가 없습니다');
      return;
    }

    const rect = document.getElementById('network-svg').getBoundingClientRect();
    const width = rect.width || 900;
    const height = 600;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Department color scale
    const departments = [...new Set(data.nodes.map(n => n.department))];
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(departments);

    // Cluster color scale (for hull backgrounds)
    const clusterColor = d3.scaleOrdinal(d3.schemeSet3).domain(data.clusters.map(c => c.id));

    // Budget radius scale
    const maxBudget = d3.max(data.nodes, n => n.budget) || 1;
    const rScale = d3.scaleSqrt().domain([0, maxBudget]).range([4, 28]);

    // Build D3 data
    const nodes = data.nodes.map(n => ({ ...n }));
    const links = data.edges.map(e => ({ source: e.source, target: e.target, similarity: e.similarity }));

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.3, 5]).on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(zoom);

    // Convex hull for clusters with > 1 member
    const hullGroup = g.append('g').attr('class', 'hulls');

    // Links
    const link = g.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', 'var(--text-muted)')
      .attr('stroke-opacity', d => 0.15 + d.similarity * 0.5)
      .attr('stroke-width', d => 0.5 + d.similarity * 3);

    // Nodes
    const node = g.append('g').selectAll('circle')
      .data(nodes).join('circle')
      .attr('r', d => rScale(d.budget))
      .attr('fill', d => colorScale(d.department))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        if (typeof showProjectModal === 'function') showProjectModal(d.projectId);
      });

    // Tooltip
    const tooltip = d3.select('body').selectAll('.network-tooltip').data([0]).join('div')
      .attr('class', 'network-tooltip')
      .style('position', 'fixed').style('pointer-events', 'none')
      .style('background', 'var(--bg-card)').style('border', '1px solid var(--border)')
      .style('border-radius', '8px').style('padding', '10px 14px')
      .style('font-size', '12px').style('color', 'var(--text)')
      .style('box-shadow', '0 4px 16px rgba(0,0,0,0.18)').style('z-index', '9999')
      .style('display', 'none').style('max-width', '280px');

    node.on('mouseover', (event, d) => {
      tooltip.style('display', 'block').html(
        `<div style="font-weight:700;margin-bottom:4px">${d.name}</div>` +
        `<div style="color:var(--text-secondary)">${d.department}</div>` +
        `<div style="margin-top:4px;color:var(--accent);font-weight:600">${(d.budget / 100).toFixed(0)}억원</div>`
      );
    }).on('mousemove', (event) => {
      tooltip.style('left', (event.clientX + 14) + 'px').style('top', (event.clientY - 10) + 'px');
    }).on('mouseout', () => { tooltip.style('display', 'none'); });

    // Node labels for large nodes
    const labels = g.append('g').selectAll('text')
      .data(nodes.filter(n => rScale(n.budget) > 12)).join('text')
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('font-size', '9px').attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => d.name.length > 8 ? d.name.substring(0, 7) + '..' : d.name);

    // Layout mode
    const layoutMode = document.getElementById('network-layout')?.value || 'force';

    // Simulation
    if (_simulation) _simulation.stop();

    _simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => 120 - d.similarity * 60))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(d => rScale(d.budget) + 4));

    if (layoutMode === 'radial') {
      _simulation.force('r', d3.forceRadial(Math.min(width, height) / 3, width / 2, height / 2).strength(0.3));
    }

    // Drag
    const drag = d3.drag()
      .on('start', (event, d) => { if (!event.active) _simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => { if (!event.active) _simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    node.call(drag);

    function drawHulls() {
      hullGroup.selectAll('path').remove();
      const multiClusters = data.clusters.filter(c => c.members.length > 1);
      multiClusters.forEach(cluster => {
        const points = cluster.members.map(i => [nodes[i].x, nodes[i].y]).filter(p => !isNaN(p[0]));
        if (points.length < 3) return;
        const hull = d3.polygonHull(points);
        if (!hull) return;
        const padded = hull.map(p => {
          const cx = d3.mean(points, pt => pt[0]);
          const cy = d3.mean(points, pt => pt[1]);
          const dx = p[0] - cx, dy = p[1] - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pad = 25;
          return [p[0] + (dx / dist) * pad, p[1] + (dy / dist) * pad];
        });
        hullGroup.append('path')
          .attr('d', 'M' + padded.join('L') + 'Z')
          .attr('fill', clusterColor(cluster.id))
          .attr('fill-opacity', 0.08)
          .attr('stroke', clusterColor(cluster.id))
          .attr('stroke-opacity', 0.25)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3');
      });
    }

    _simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
      labels.attr('x', d => d.x).attr('y', d => d.y);
      drawHulls();
    });

    // Department legend
    renderLegend(departments, colorScale);

    // Cluster info
    renderClusterInfo(data.clusters, data.nodes, colorScale);
  }

  function renderLegend(departments, colorScale) {
    const legendDiv = document.getElementById('network-legend');
    if (!legendDiv) return;
    const topDepts = departments.slice(0, 15);
    legendDiv.innerHTML = topDepts.map(d =>
      `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px;font-size:11px;cursor:pointer;white-space:nowrap" data-dept="${d}" onclick="filterNetworkDept(this)">` +
      `<span style="width:10px;height:10px;border-radius:50%;background:${colorScale(d)};flex-shrink:0"></span>${d}</span>`
    ).join('');
    if (departments.length > 15) legendDiv.innerHTML += `<span style="font-size:11px;color:var(--text-muted)">+${departments.length - 15}개</span>`;
  }

  function renderClusterInfo(clusters, nodes, colorScale) {
    const infoDiv = document.getElementById('network-cluster-info');
    if (!infoDiv) return;
    const multiClusters = clusters.filter(c => c.members.length > 1).sort((a, b) => b.totalBudget - a.totalBudget);
    if (multiClusters.length === 0) {
      infoDiv.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px">유사도 기준에 해당하는 클러스터가 없습니다. 임계값을 낮춰보세요.</div>';
      return;
    }
    infoDiv.innerHTML = '<div style="font-weight:700;font-size:13px;margin-bottom:8px">클러스터 목록 (' + multiClusters.length + '개)</div>' +
      multiClusters.map((c, idx) => {
        const memberNames = c.members.map(i => nodes[i].name);
        const depts = [...new Set(c.members.map(i => nodes[i].department))];
        return `<div style="padding:8px 10px;border-radius:6px;background:var(--bg-main);margin-bottom:6px;font-size:12px;cursor:pointer" onclick="highlightCluster(${c.id})">` +
          `<div style="display:flex;justify-content:space-between;align-items:center">` +
          `<span style="font-weight:600">클러스터 ${idx + 1}</span>` +
          `<span style="color:var(--accent);font-weight:600">${(c.totalBudget / 100).toFixed(0)}억원</span></div>` +
          `<div style="color:var(--text-secondary);margin-top:3px">${c.members.length}개 사업 | ${depts.join(', ')}</div>` +
          `<div style="color:var(--text-muted);margin-top:2px;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${memberNames.join(', ')}</div>` +
          `</div>`;
      }).join('');
  }

  // Public API
  window.initNetworkViz = function(data) {
    if (!data || !data.projects) return;
    _networkInitialized = true;

    const threshold = parseInt(document.getElementById('network-threshold')?.value || '30');
    const nodeLimit = parseInt(document.getElementById('network-node-limit')?.value || '100');

    _networkData = computeNetwork(data.projects, threshold, nodeLimit);
    renderNetwork();

    // Update stats
    const statsEl = document.getElementById('network-stats');
    if (statsEl) {
      statsEl.innerHTML =
        `<span>노드 ${_networkData.nodes.length}</span>` +
        `<span>엣지 ${_networkData.edges.length}</span>` +
        `<span>클러스터 ${_networkData.clusters.filter(c => c.members.length > 1).length}</span>`;
    }
  };

  window.recomputeNetwork = function() {
    if (!_networkInitialized || typeof DATA === 'undefined') return;
    window.initNetworkViz(DATA);
  };

  window.highlightCluster = function(clusterId) {
    const svg = d3.select('#network-svg');
    svg.selectAll('circle').attr('opacity', d => d.cluster === clusterId ? 1 : 0.15);
    svg.selectAll('line').attr('opacity', 0.05);
    // Reset on double click
    svg.on('dblclick.reset', () => {
      svg.selectAll('circle').attr('opacity', 1);
      svg.selectAll('line').attr('stroke-opacity', d => 0.15 + d.similarity * 0.5);
      svg.on('dblclick.reset', null);
    });
  };

  window.filterNetworkDept = function(el) {
    const dept = el.dataset.dept;
    const svg = d3.select('#network-svg');
    const isActive = el.classList.toggle('dept-active');

    const activeEls = document.querySelectorAll('#network-legend [data-dept].dept-active');
    if (activeEls.length === 0) {
      svg.selectAll('circle').attr('opacity', 1);
      svg.selectAll('line').attr('stroke-opacity', d => 0.15 + d.similarity * 0.5);
      return;
    }

    const activeDepts = new Set([...activeEls].map(e => e.dataset.dept));
    svg.selectAll('circle').attr('opacity', d => activeDepts.has(d.department) ? 1 : 0.1);
    svg.selectAll('line').attr('stroke-opacity', d => {
      const sD = _networkData.nodes[typeof d.source === 'object' ? d.source.id : d.source]?.department;
      const tD = _networkData.nodes[typeof d.target === 'object' ? d.target.id : d.target]?.department;
      return (activeDepts.has(sD) && activeDepts.has(tD)) ? 0.15 + d.similarity * 0.5 : 0.02;
    });
  };
})();
