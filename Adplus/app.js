const pageTitles = { overview: 'Overview', campaigns: 'Campaign intelligence', channels: 'Channel mix', funnel: 'Customer funnel', simulator: 'Budget simulator', analyst: 'AI analyst' };
const navItems = document.querySelectorAll('.nav-item[data-view]');
const overview = document.getElementById('view-overview');
const placeholder = document.getElementById('view-placeholder');
const moduleContent = document.getElementById('module-content');
const pageTitle = document.getElementById('page-title');
const settingsButton = document.getElementById('settings-button');
const settingsDrawer = document.getElementById('settings-drawer');
const settingsBackdrop = document.getElementById('settings-backdrop');

const formatLakhs = (value) => `₹${(value / 100000).toFixed(1)}L`;
const formatNumber = (value) => value.toLocaleString('en-IN');
const updateWorkspaceLabel = (name) => document.querySelectorAll('.workspace-switcher span').forEach((span) => { if (!span.classList.contains('workspace-dot')) span.textContent = name; });

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('adpulse-settings') || '{}');
  if (saved.name) { document.getElementById('workspace-name').value = saved.name; updateWorkspaceLabel(saved.name); }
  if (saved.currency) document.getElementById('workspace-currency').value = saved.currency;
  if (saved.attribution) document.getElementById('attribution-model').value = saved.attribution;
}

function toggleSettings(open) {
  settingsDrawer.hidden = !open;
  settingsBackdrop.hidden = !open;
  document.body.classList.toggle('settings-open', open);
  if (open && window.lucide) window.lucide.createIcons();
}

const demoIntelligence = {
  items: [
    { campaign: 'Campaign 03', platform: 'YouTube', severity: 'scale', title: 'High-conviction winner', detail: 'Conversion rate is 18% above account average while ROAS remains 3.50x.', metric: '4.1% CVR' },
    { campaign: 'Campaign 07', platform: 'LinkedIn', severity: 'watch', title: 'Efficiency drag', detail: 'CAC is ₹8,420, 52% above blended CAC.', metric: '1.40x ROAS' },
    { campaign: 'Campaign 02', platform: 'Google Ads', severity: 'stable', title: 'Consistent performer', detail: 'Performance is within the expected range with enough volume to keep testing.', metric: '2.75x ROAS' },
  ],
};
const demoFunnel = { stages: [{ stage: 'Impressions', value: 412092, rate: 100, drop_off: null }, { stage: 'Clicks', value: 13187, rate: 3.2, drop_off: 96.8 }, { stage: 'Leads', value: 954, rate: 7.2, drop_off: 92.8 }, { stage: 'Customers', value: 181, rate: 19, drop_off: 81 }], largest_drop: 'Impressions → Clicks', largest_drop_rate: 96.8 };

function renderIntelligence(data) {
  const items = data.items.map((item) => `<article class="insight-card ${item.severity}"><div class="insight-top"><span class="severity-label">${item.severity === 'scale' ? 'Scale' : item.severity === 'watch' ? 'Watch' : 'Stable'}</span><span class="insight-platform">${item.platform}</span></div><h3>${item.title}</h3><p>${item.detail}</p><strong>${item.metric}</strong><small>${item.campaign}</small></article>`).join('');
  moduleContent.innerHTML = `<section class="module-heading"><div><p class="eyebrow">Decision layer / 01</p><h1>Campaign intelligence<span class="accent">.</span></h1><p>Signals ranked by opportunity, efficiency, and confidence. Every recommendation includes the evidence behind it.</p></div><button class="primary-button" data-jump="simulator"><i data-lucide="sliders-horizontal"></i>Open simulator</button></section><section class="intelligence-summary"><div><span>12</span><small>campaigns scanned</small></div><div><span>${data.items.length}</span><small>signals detected</small></div><div><span class="lime-text">High</span><small>confidence on top signal</small></div></section><div class="module-section-header"><div><h2>Signals to act on</h2><p>Prioritized from the current 31-day dataset</p></div><button class="ghost-button"><i data-lucide="download"></i>Export signals</button></div><section class="insight-grid">${items}</section>`;
}

function renderFunnel(data) {
  const maxValue = data.stages[0].value;
  const stages = data.stages.map((stage) => `<div class="funnel-stage"><div class="funnel-label"><span>${stage.stage}</span><strong>${formatNumber(stage.value)}</strong></div><div class="funnel-track"><span style="width:${Math.max(stage.rate, 4)}%"></span></div><div class="funnel-meta"><span>${stage.rate}% of previous stage</span><span>${stage.drop_off === null ? 'Entry point' : `-${stage.drop_off}% drop-off`}</span></div></div>`).join('');
  moduleContent.innerHTML = `<section class="module-heading"><div><p class="eyebrow">Conversion path / 01</p><h1>Customer funnel<span class="accent">.</span></h1><p>See where paid attention becomes pipeline, and where the next optimization can recover volume.</p></div><button class="ghost-button" data-jump="analyst"><i data-lucide="sparkles"></i>Ask analyst</button></section><section class="funnel-layout"><article class="panel funnel-panel"><div class="panel-header"><div><h2>August conversion flow</h2><p>Aggregated across all paid channels</p></div><span class="signal-count">31 DAYS</span></div><div class="funnel-stages">${stages}</div></article><aside class="panel dropoff-panel"><span class="mini-label"><i data-lucide="scan-search"></i> Biggest opportunity</span><h2>${data.largest_drop}</h2><div class="big-stat">${data.largest_drop_rate}% <span>drop-off</span></div><p>Creative and landing page relevance are the first place to investigate before adding more budget.</p><button class="text-button" data-jump="analyst">Generate diagnosis <i data-lucide="arrow-up-right"></i></button></aside></section><section class="funnel-footnote"><i data-lucide="info"></i><span>Stages are calculated from campaign impressions, clicks, leads, and customer records. Attribution is modelled for this demo.</span></section>`;
}

function renderAnalyst(data = null) {
  const answer = data ? `<div class="analyst-answer"><span class="mini-label"><i data-lucide="sparkles"></i>Evidence-backed answer</span><p>${data.answer}</p><div class="evidence-list">${data.evidence.map((item) => `<span>${item}</span>`).join('')}</div><small>${data.disclaimer}</small></div>` : '';
  moduleContent.innerHTML = `<section class="module-heading analyst-heading"><div><p class="eyebrow">Decision copilot / 01</p><h1>AI marketing analyst<span class="accent">.</span></h1><p>Ask a business question. AdPulse calculates the relevant evidence first, then explains what it means.</p></div><span class="analyst-online"><i class="pulse-dot"></i>Analysis engine online</span></section><section class="analyst-layout"><article class="panel analyst-panel"><div class="question-header"><span class="mini-label"><i data-lucide="message-circle-question"></i>Ask about your data</span><span class="model-tag">RULES + METRICS</span></div><div class="question-chips"><button data-question="Which channels should we scale?">Which channels should we scale?</button><button data-question="Where is the biggest funnel drop?">Where is the biggest funnel drop?</button><button data-question="Why did ROI change?">Why did ROI change?</button></div><form class="analyst-form"><input id="analyst-question" value="Which channels should we scale?" aria-label="Ask a question"><button class="primary-button" type="submit"><i data-lucide="arrow-up"></i>Ask</button></form>${answer}</article><aside class="panel analyst-context"><span class="mini-label"><i data-lucide="database"></i>Context used</span><div><strong>31 days</strong><small>selected period</small></div><div><strong>4 channels</strong><small>paid media mix</small></div><div><strong>7 metrics</strong><small>calculated signals</small></div><p>No invented numbers. Answers are grounded in the current analytics dataset.</p></aside></section>`;
  moduleContent.querySelectorAll('[data-question]').forEach((chip) => chip.addEventListener('click', () => { document.getElementById('analyst-question').value = chip.dataset.question; }));
  moduleContent.querySelector('.analyst-form').addEventListener('submit', async (event) => { event.preventDefault(); const question = document.getElementById('analyst-question').value.trim(); if (!question) return; let result; if (window.location.protocol !== 'file:') { const response = await fetch(`/api/analyst?question=${encodeURIComponent(question)}`); result = await response.json(); } else { result = { answer: 'Scale YouTube first, then Google Ads. YouTube has the highest observed ROAS at 3.50x, while LinkedIn is the weakest at 1.40x.', evidence: ['YouTube ROAS: 3.50x', 'LinkedIn ROAS: 1.40x', 'Recommended shift: ₹60k'], disclaimer: 'Demo answer based on seeded data.' }; } renderAnalyst(result); });
}

function channelTone(channel) {
  return channel === 'Google Ads' ? 'google' : channel === 'Meta Ads' ? 'meta' : channel === 'YouTube' ? 'youtube' : 'linkedin';
}

function renderChannels(data) {
  const rows = data.channels.map((channel) => `<tr><td><span class="channel-icon ${channelTone(channel.channel)}">${channel.channel === 'LinkedIn' ? 'in' : channel.channel[0]}</span><strong>${channel.channel}</strong></td><td>${formatLakhs(channel.spend)}</td><td>${formatLakhs(channel.revenue)}</td><td><b>${channel.roas}x</b></td><td>${channel.ctr}%</td><td>₹${channel.cac.toLocaleString('en-IN')}</td><td><span class="channel-performance ${channel.roas >= 2.5 ? 'good' : channel.roas >= 2 ? 'mid' : 'low'}">${channel.roas >= 2.5 ? 'Scale' : channel.roas >= 2 ? 'Maintain' : 'Review'}</span></td></tr>`).join('');
  const best = [...data.channels].sort((left, right) => right.roas - left.roas)[0];
  moduleContent.innerHTML = `<section class="module-heading"><div><p class="eyebrow">Acquisition portfolio / 01</p><h1>Channel mix<span class="accent">.</span></h1><p>Compare the economics of every paid channel and see where incremental budget is most productive.</p></div><button class="primary-button" data-jump="simulator"><i data-lucide="sliders-horizontal"></i>Model allocation</button></section><section class="channel-summary"><div><span>₹${data.totals.profit.toLocaleString('en-IN')}</span><small>portfolio profit</small></div><div><span>${data.totals.roas}x</span><small>blended ROAS</small></div><div><span>${best.channel}</span><small>top return channel</small></div></section><article class="panel channel-mix-panel"><div class="panel-header"><div><h2>Channel economics</h2><p>Calculated from spend, revenue, and customer outcomes</p></div><span class="signal-count">${data.channels.length} CHANNELS</span></div><div class="table-wrap"><table class="channel-table"><thead><tr><th>Channel</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>CTR</th><th>CAC</th><th>Decision</th></tr></thead><tbody>${rows}</tbody></table></div></article><section class="channel-note"><i data-lucide="lightbulb"></i><span><strong>Readout:</strong> ${best.channel} returns ${best.roas}x for every rupee invested. LinkedIn is currently below the portfolio average and should be tested with tighter audience constraints before scaling.</span></section>`;
}

function renderSimulator(result = null) {
  const output = result ? `<div class="simulation-result"><div class="result-heading"><span class="mini-label"><i data-lucide="sparkles"></i>Model estimate</span><span class="estimated-tag">NOT A GUARANTEE</span></div><div class="result-metrics"><div><small>Expected revenue</small><strong>${formatLakhs(result.revenue)}</strong></div><div><small>Expected profit</small><strong>${formatLakhs(result.profit)}</strong></div><div><small>Expected ROAS</small><strong>${result.roas}x</strong></div><div><small>Expected CAC</small><strong>₹${result.cac.toLocaleString('en-IN')}</strong></div></div><p>${result.disclaimer}</p></div>` : '';
  moduleContent.innerHTML = `<section class="module-heading"><div><p class="eyebrow">Decision layer / 02</p><h1>Budget simulator<span class="accent">.</span></h1><p>Move budget between channels and model expected revenue before you commit the next rupee.</p></div><span class="analyst-online"><i class="pulse-dot"></i>Historical model ready</span></section><section class="simulator-layout"><article class="panel simulator-panel"><div class="panel-header"><div><h2>Build a scenario</h2><p>Allocation must equal the total budget</p></div><span class="signal-count">WHAT-IF</span></div><form class="simulator-form"><label>Total budget <div class="money-input"><span>₹</span><input id="sim-budget" type="number" min="10000" step="10000" value="1000000"></div></label><div class="allocation-inputs"><label>Google Ads<input data-channel-input="Google Ads" type="number" min="0" step="10000" value="350000"></label><label>Meta Ads<input data-channel-input="Meta Ads" type="number" min="0" step="10000" value="250000"></label><label>YouTube<input data-channel-input="YouTube" type="number" min="0" step="10000" value="300000"></label><label>LinkedIn<input data-channel-input="LinkedIn" type="number" min="0" step="10000" value="100000"></label></div><div class="allocation-total"><span>Allocated</span><strong id="allocation-total">₹10.0L</strong><small id="allocation-status">Balanced</small></div><button class="primary-button simulate-button" type="submit"><i data-lucide="wand-sparkles"></i>Run simulation</button></form>${output}</article><aside class="panel simulator-aside"><span class="mini-label"><i data-lucide="info"></i>How it works</span><h2>Estimate, inspect, decide.</h2><p>AdPulse applies each channel's observed ROAS and conversion efficiency to your proposed allocation.</p><div class="simulator-rules"><div><strong>1</strong><span>Set the total budget</span></div><div><strong>2</strong><span>Shift money across channels</span></div><div><strong>3</strong><span>Compare expected return</span></div></div><p class="muted-note">This is a decision-support model based on historical data, not a forecast guarantee.</p></aside></section>`;
  const updateAllocation = () => { const total = [...moduleContent.querySelectorAll('[data-channel-input]')].reduce((sum, input) => sum + Number(input.value || 0), 0); const budget = Number(document.getElementById('sim-budget').value || 0); document.getElementById('allocation-total').textContent = formatLakhs(total); const status = document.getElementById('allocation-status'); status.textContent = Math.abs(total - budget) <= 1 ? 'Balanced' : `Needs ${formatLakhs(Math.abs(total - budget))}`; status.className = Math.abs(total - budget) <= 1 ? 'balanced' : 'unbalanced'; };
  moduleContent.querySelectorAll('[data-channel-input], #sim-budget').forEach((input) => input.addEventListener('input', updateAllocation));
  moduleContent.querySelector('.simulator-form').addEventListener('submit', async (event) => { event.preventDefault(); const budget = Number(document.getElementById('sim-budget').value); const allocation = Object.fromEntries([...moduleContent.querySelectorAll('[data-channel-input]')].map((input) => [input.dataset.channelInput, Number(input.value || 0)])); if (Math.abs(Object.values(allocation).reduce((sum, value) => sum + value, 0) - budget) > 1) { document.getElementById('allocation-status').textContent = 'Balance allocation first'; document.getElementById('allocation-status').className = 'unbalanced'; return; } let simulation; if (window.location.protocol !== 'file:') simulation = await fetch('/api/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budget, allocation }) }).then((response) => response.json()); else simulation = { revenue: 2652500, profit: 1652500, roas: 2.65, cac: 4878, disclaimer: 'Demo estimate based on seeded channel data.' }; renderSimulator(simulation); if (window.lucide) window.lucide.createIcons(); });
  updateAllocation();
}

async function renderModule(view) {
  if (view === 'analyst') { renderAnalyst(); return; }
  if (view === 'funnel') { let data = demoFunnel; if (window.location.protocol !== 'file:') data = await fetch('/api/funnel').then((response) => response.json()); renderFunnel(data); return; }
  if (view === 'campaigns') { let data = demoIntelligence; if (window.location.protocol !== 'file:') data = await fetch('/api/intelligence').then((response) => response.json()); renderIntelligence(data); return; }
  if (view === 'channels') { let data = { totals: { profit: 1330000, roas: 2.33 }, channels: [{ channel: 'Google Ads', spend: 400000, revenue: 1100000, roas: 2.75, ctr: 3.2, cac: 5042 }, { channel: 'Meta Ads', spend: 300000, revenue: 600000, roas: 2, ctr: 3.2, cac: 5255 }, { channel: 'YouTube', spend: 100000, revenue: 350000, roas: 3.5, ctr: 3.2, cac: 4065 }, { channel: 'LinkedIn', spend: 200000, revenue: 280000, roas: 1.4, ctr: 3.2, cac: 4786 }] }; if (window.location.protocol !== 'file:') data = await fetch('/api/summary').then((response) => response.json()); renderChannels(data); return; }
  if (view === 'simulator') { renderSimulator(); return; }
  moduleContent.innerHTML = `<div class="placeholder-view"><div class="placeholder-icon"><i data-lucide="construction"></i></div><p class="eyebrow">Module preview</p><h1>${pageTitles[view] || 'Overview'}</h1><p>This module is next in the build sequence. The core data and decision APIs are already available.</p><button class="primary-button" data-jump="overview"><i data-lucide="arrow-left"></i>Back to overview</button></div>`;
}

async function loadApiSummary() {
  if (window.location.protocol === 'file:') return;
  const status = document.getElementById('api-status');
  try {
    const response = await fetch('/api/summary');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    document.getElementById('metric-spend').textContent = formatLakhs(data.totals.spend);
    document.getElementById('metric-revenue').textContent = formatLakhs(data.totals.revenue);
    document.getElementById('metric-roas').innerHTML = `${data.totals.roas}<span class="unit">x</span>`;
    document.getElementById('metric-customers').textContent = data.totals.customers.toLocaleString('en-IN');
    data.channels.forEach((channel) => {
      const row = document.querySelector(`[data-channel="${channel.channel}"]`);
      if (!row) return;
      row.querySelector('.channel-spend').textContent = formatLakhs(channel.spend);
      row.querySelector('.channel-revenue').textContent = formatLakhs(channel.revenue);
      row.querySelector('.channel-roas').textContent = `${channel.roas}x`;
    });
    status.textContent = 'Models online';
  } catch (error) {
    status.textContent = 'Demo data mode';
    console.warn('AdPulse API unavailable; using seeded UI values.', error);
  }
}

function goToView(view) {
  const isOverview = view === 'overview';
  overview.hidden = !isOverview;
  placeholder.hidden = isOverview;
  pageTitle.textContent = pageTitles[view] || 'Overview';
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  if (!isOverview) renderModule(view).then(() => { if (window.lucide) window.lucide.createIcons(); document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.jump))); });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.jump)));
navItems.forEach((item) => item.addEventListener('click', () => goToView(item.dataset.view)));

document.querySelectorAll('.segmented button').forEach((button) => button.addEventListener('click', () => {
  button.parentElement.querySelectorAll('button').forEach((option) => option.classList.remove('active'));
  button.classList.add('active');
}));

settingsButton.addEventListener('click', () => toggleSettings(true));
document.getElementById('settings-close').addEventListener('click', () => toggleSettings(false));
settingsBackdrop.addEventListener('click', () => toggleSettings(false));
document.getElementById('settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const settings = { name: document.getElementById('workspace-name').value.trim() || 'Northstar Labs', currency: document.getElementById('workspace-currency').value, attribution: document.getElementById('attribution-model').value };
  localStorage.setItem('adpulse-settings', JSON.stringify(settings));
  updateWorkspaceLabel(settings.name);
  const saved = document.getElementById('settings-saved'); saved.hidden = false; window.setTimeout(() => window.location.reload(), 350);
});

if (window.lucide) window.lucide.createIcons();
loadApiSummary();
loadSettings();
