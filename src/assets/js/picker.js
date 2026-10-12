/* =========================================================================
   StackSignal — "Which AI model should I use?" picker + cost estimator
   Used only by /blog/which-ai-model-should-i-use.html. No dependencies.
   Edit MODELS and PRICES below when prices or models change.
   ========================================================================= */
(function (root) {
  'use strict';

  var LAST_VERIFIED = 'Sep 26, 2026';
  var POST_URL = 'https://thestacksignal.github.io/blog/which-ai-model-should-i-use.html';

  /* cost: 1 (cheapest) to 5 (priciest). quality: 1 to 5. fit: editorial task-fit rating, 1 to 5. */
  var MODELS = [
    { id: 'luna', name: 'GPT-6 Luna', vendor: 'openai', cost: 1, quality: 2, price: '$0.10 / $0.50', context: '1.05M',
      access: 'ChatGPT app (including Free), API, GitHub Copilot',
      fit: { code: 2, agent: 1, write: 2, chat: 3, bulk: 5, sec: 2 },
      note: 'The budget tier, built for classification, extraction and short completions.' },
    { id: 'haiku', name: 'Claude Haiku 5.5', vendor: 'anthropic', cost: 2, quality: 3, price: 'See Anthropic pricing', context: 'See docs',
      access: 'Claude apps and API',
      fit: { code: 3, agent: 2, write: 3, chat: 4, bulk: 4, sec: 2 },
      note: 'The smallest, fastest Claude tier, suited to quick and high-volume work.' },
    { id: 'sol', name: 'GPT-6 Sol', vendor: 'openai', cost: 3, quality: 4, price: '$2 / $10', context: '1.05M',
      access: 'ChatGPT, Codex, API, GitHub Copilot',
      fit: { code: 5, agent: 4, write: 4, chat: 4, bulk: 3, sec: 4 },
      note: 'Near-Astra quality at about a fifth of the price, and close to Claude Fable on coding benchmarks.' },
    { id: 'sonnet', name: 'Claude Sonnet 5.5', vendor: 'anthropic', cost: 3, quality: 4, price: 'See Anthropic pricing', context: 'See docs',
      access: 'Claude apps and API',
      fit: { code: 4, agent: 4, write: 4, chat: 5, bulk: 3, sec: 3 },
      note: 'A smart, efficient model for everyday use.' },
    { id: 'opus', name: 'Claude Opus 5.5', vendor: 'anthropic', cost: 4, quality: 5, price: '$4 / $20', context: '1M',
      access: 'Claude apps, Claude Code, API, Bedrock, Vertex AI, Foundry',
      fit: { code: 5, agent: 5, write: 5, chat: 4, bulk: 2, sec: 4 },
      note: "Anthropic's default: close to Fable quality on most tasks at a lower price, and strong in long agentic sessions." },
    { id: 'astra', name: 'GPT-6 Astra', vendor: 'openai', cost: 5, quality: 5, price: '$10 / $50', context: '1.05M',
      access: 'ChatGPT, API (Enterprise preview first)',
      fit: { code: 4, agent: 5, write: 4, chat: 3, bulk: 1, sec: 4 },
      note: "OpenAI's most capable model, leading on computer-use and long-horizon agent work." },
    { id: 'fable', name: 'Claude Fable 5.1', vendor: 'anthropic', cost: 5, quality: 5, price: '$10 / $50', context: '1M',
      access: 'Paid Claude plans, API, Bedrock, Vertex AI, Foundry',
      fit: { code: 5, agent: 5, write: 5, chat: 3, bulk: 1, sec: 5 },
      note: "Anthropic's top publicly available model, ahead of Astra on independent indexes in our comparison." }
  ];

  /* name, input $ per 1M tokens, output $ per 1M tokens */
  var PRICES = [
    ['GPT-6 Luna', 0.10, 0.50], ['GPT-6 Sol', 2, 10], ['Claude Opus 5.5', 4, 20],
    ['GPT-6 Astra', 10, 50], ['Claude Fable 5.1', 10, 50]
  ];

  var TASK_LABEL = { code: 'coding', agent: 'agents and automation', write: 'writing and analysis', chat: 'everyday questions', bulk: 'high-volume jobs', sec: 'security and life-science research' };
  var BUDGET_LABEL = { cheap: 'low cost', balanced: 'a balanced budget', best: 'best quality' };

  function scoreModel(m, a) {
    var s = m.fit[a.task] * 3;
    if (a.budget === 'cheap') s += (m.cost <= 2 ? 4 : 0) - Math.max(0, m.cost - 2) * 4;
    else if (a.budget === 'balanced') s += (m.cost === 3 || m.cost === 4 ? 2 : 0) - Math.max(0, m.cost - 4) * 3;
    else s += m.quality * 1.5 + m.cost * 0.2; /* tiny tiebreak: when price is no object, prefer the higher tier */
    if (a.eco !== 'any' && m.vendor === a.eco) s += 6;
    if (a.stakes === 'high') s += m.quality * 2; else s -= m.cost;
    return s;
  }

  function recommend(a) {
    var ranked = MODELS.map(function (m) { return { m: m, s: scoreModel(m, a) }; })
      .sort(function (x, y) { return y.s - x.s; });
    var top = ranked[0].s, low = ranked[ranked.length - 1].s, span = Math.max(1, top - low);
    ranked.forEach(function (r) { r.pct = Math.round(55 + 45 * (r.s - low) / span); });
    return ranked;
  }

  function reasons(m, a) {
    var out = [], f = m.fit[a.task];
    out.push((f >= 5 ? 'Top-tier for ' : f === 4 ? 'Strong at ' : 'Adequate for ') + TASK_LABEL[a.task] + '.');
    if (a.budget === 'cheap' && m.cost <= 2) out.push('One of the lowest-cost options, which matches your goal of keeping costs down.');
    else if (a.budget === 'balanced' && (m.cost === 3 || m.cost === 4)) out.push('Priced in the middle of the range, a good balance of quality and cost.');
    else if (a.budget === 'best' && m.quality >= 5) out.push('Sits at the top end of quality, which is what you asked for.');
    if (a.eco !== 'any' && m.vendor === a.eco) out.push('Fits the ' + (a.eco === 'openai' ? 'OpenAI' : 'Anthropic') + ' ecosystem you already use.');
    if (a.stakes === 'high' && m.quality >= 4) out.push('High enough quality for work where mistakes are costly. Still verify important outputs.');
    out.push(m.note);
    return out;
  }

  function estimateCost(req, inTok, outTok, inPrice, outPrice) {
    return (req * inTok / 1e6) * inPrice + (req * outTok / 1e6) * outPrice;
  }
  function money(n) {
    if (n < 0.01) return '<$0.01';
    if (n >= 1000) return '$' + Math.round(n).toLocaleString('en-US');
    return '$' + n.toFixed(2);
  }

  var api = { MODELS: MODELS, PRICES: PRICES, recommend: recommend, reasons: reasons, estimateCost: estimateCost, money: money, scoreModel: scoreModel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  /* ---------------------------- DOM wiring ----------------------------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function vendorName(v) { return v === 'openai' ? 'OpenAI' : 'Anthropic'; }

  function initPicker() {
    var box = $('mp'); if (!box) return;
    var qs = Array.prototype.slice.call(box.querySelectorAll('.mp__q'));
    var ans = {}, idx = 0, lastText = '';

    function show(i) {
      qs.forEach(function (q, n) { q.classList.toggle('is-on', n === i); });
      $('mpStep').textContent = 'Question ' + (i + 1) + ' of 4';
      $('mpFill').style.width = (i / 4 * 100) + '%';
      $('mpBar').setAttribute('aria-valuenow', String(i));
      $('mpBack').hidden = (i === 0);
    }

    function finish() {
      var ranked = recommend(ans), best = ranked[0].m;
      $('mpQuiz').hidden = true;
      $('mpFill').style.width = '100%';
      $('mpBar').setAttribute('aria-valuenow', '4');
      $('mpStep').textContent = 'Your result';

      var p = $('mpPick'); p.textContent = '';
      p.appendChild(el('span', 'badge badge--ai', 'Best match'));
      p.appendChild(el('div', 'mp__name', best.name));
      p.appendChild(el('div', 'mp__by', vendorName(best.vendor) + ' · for ' + TASK_LABEL[ans.task] + ' with ' + BUDGET_LABEL[ans.budget]));
      var strip = el('div', 'stat-strip');
      [['Price per 1M tokens', best.price], ['Context window', best.context]].forEach(function (s) {
        var d = el('div'); d.appendChild(el('b', null, s[1])); d.appendChild(el('span', null, s[0])); strip.appendChild(d);
      });
      p.appendChild(strip);
      p.appendChild(el('div', 'mp__avail', 'Where to use it: ' + best.access));
      reasons(best, ans).forEach(function (r) {
        var row = el('div', 'mp__why'); row.appendChild(el('i', null, '✓')); row.appendChild(el('span', null, r)); p.appendChild(row);
      });

      var alts = $('mpAlts'); alts.textContent = '';
      ranked.slice(1, 3).forEach(function (r) {
        var c = el('article', 'card');
        c.appendChild(el('div', 'mp__cardname', r.m.name));
        c.appendChild(el('p', null, r.m.note));
        var bar = el('div', 'mp__fit'), fill = el('i'); fill.style.width = r.pct + '%'; bar.appendChild(fill); c.appendChild(bar);
        c.appendChild(el('div', 'card__meta', 'Relative fit ' + r.pct + '%  ·  ' + r.m.price));
        alts.appendChild(c);
      });

      var sec = $('mpSec');
      if (ans.task === 'sec') {
        sec.hidden = false;
        $('mpSecText').textContent = 'Claude Mythos 5.1 is built for this kind of work, but it is restricted to vetted cybersecurity and life-sciences organisations and is not self-serve. If your organisation is not approved, use the models above.';
      } else sec.hidden = true;

      $('mpFine').textContent = 'Prices last checked ' + LAST_VERIFIED + '. Confirm current rates on the provider’s pricing page.';
      $('mpResult').hidden = false;
      lastText = 'My AI model pick: ' + best.name + ' (' + best.price + ' per 1M tokens in/out) for ' + TASK_LABEL[ans.task] + '. Try the 60-second picker: ' + POST_URL;
      try { $('mpResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }

    qs.forEach(function (q) {
      q.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.mp__opt') : null; if (!b) return;
        ans[q.getAttribute('data-key')] = b.getAttribute('data-v');
        if (idx < qs.length - 1) { idx++; show(idx); } else finish();
      });
    });
    $('mpBack').addEventListener('click', function () { if (idx > 0) { idx--; show(idx); } });
    $('mpRetake').addEventListener('click', function () {
      ans = {}; idx = 0; $('mpResult').hidden = true; $('mpQuiz').hidden = false; show(0);
      try { box.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    });
    $('mpCopy').addEventListener('click', function () {
      var btn = $('mpCopy');
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = 'Copy my result'; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastText).then(function () { done('Copied!'); }, function () { done('Copy failed'); });
      } else done('Copy not supported');
    });
    show(0);
  }

  function initEstimator() {
    var rowsBox = $('estRows'); if (!rowsBox) return;
    function render() {
      var r = Math.max(0, +$('estReq').value || 0), i = Math.max(0, +$('estIn').value || 0), o = Math.max(0, +$('estOut').value || 0);
      var rows = PRICES.map(function (p) { return { name: p[0], cost: estimateCost(r, i, o, p[1], p[2]) }; })
        .sort(function (a, b) { return a.cost - b.cost; });
      var max = Math.max.apply(null, rows.map(function (x) { return x.cost; })) || 1;
      rowsBox.textContent = '';
      rows.forEach(function (x) {
        var row = el('div', 'mp__erow'); row.appendChild(el('span', null, x.name));
        var bar = el('div', 'mp__ebar'), fill = el('i'); fill.style.width = Math.max(1, x.cost / max * 100) + '%'; bar.appendChild(fill);
        row.appendChild(bar); row.appendChild(el('b', null, money(x.cost))); rowsBox.appendChild(row);
      });
    }
    ['estReq', 'estIn', 'estOut'].forEach(function (id) { $(id).addEventListener('input', render); });
    render();
  }

  function init() { initPicker(); initEstimator(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : this);
