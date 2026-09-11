// ---------------------------------------------------------------------------
// StackSignal — static site generator (zero dependencies, Node 18+)
// Run:  node build.mjs      Output: /dist  (deploy that folder anywhere)
// ---------------------------------------------------------------------------
import { mkdir, writeFile, cp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'dist';

/* ===== 1. GLOBAL SITE CONFIG — edit these before deploying ================ */
const SITE = {
  url: 'https://thestacksignal.github.io',            // <-- REPLACE with your real domain
  name: 'StackSignal',
  tagline: 'Tech & AI, decoded.',
  description: 'StackSignal publishes deeply practical engineering and AI guides: performance, architecture, LLMs and applied machine learning.',
  twitter: '@stacksignal',
  author: 'Shaurya',
  locale: 'en_US',
  lang: 'en'
};

const CATEGORIES = {
  tech: {
    slug: 'tech',
    theme: 'tech',
    name: 'Tech',
    h1: 'Engineering that ships',
    title: 'Tech Blog — Web Performance & Architecture',
    description: 'Hands-on tech guides on web performance, Core Web Vitals, architecture trade-offs, DevOps and shipping fast software.',
    kicker: 'Tech',
    blurb: 'Benchmarks, architecture trade-offs and performance work you can copy into production today.',
    shape: 'grid',
    stats: [['12ms', 'median INP target'], ['60%', 'avg bundle cut'], ['100', 'Lighthouse goal']]
  },
  ai: {
    slug: 'ai',
    theme: 'ai',
    name: 'AI',
    h1: 'Applied intelligence',
    title: 'AI Blog — LLMs, RAG & Applied ML',
    description: 'Practical AI guides: RAG vs fine-tuning, local LLM setups, evaluation, prompt architecture and AI-era SEO.',
    kicker: 'AI',
    blurb: 'LLM systems, retrieval, evaluation and the workflows that make models useful instead of impressive.',
    shape: 'network',
    stats: [['8GB', 'VRAM local LLM'], ['3x', 'retrieval accuracy'], ['0', 'hype tolerated']]
  }
};

/* ===== 2. CONTENT — add a new object here and the whole site updates ====== */
const POSTS = [
  {
    slug: 'core-web-vitals-checklist-2026',
    category: 'tech',
    title: 'Core Web Vitals Checklist for 2026 (INP, LCP, CLS)',
    seoTitle: 'Core Web Vitals Checklist 2026: Pass INP, LCP & CLS',
    description: 'A field-tested Core Web Vitals checklist for 2026: how to pass INP, LCP and CLS on real devices, with the exact fixes that move the numbers.',
    date: '2026-09-08',
    updated: '2026-09-08',
    read: 8,
    tags: ['Core Web Vitals', 'Performance', 'SEO'],
    keywords: 'core web vitals checklist, INP optimization, LCP fix, CLS fix, page speed 2026',
    hero: 'Ship a page that feels instant on a mid-range Android, and desktop takes care of itself.',
    body: `
<h2>Why Core Web Vitals still decide rankings</h2>
<p>Core Web Vitals are not a ranking silver bullet, but they are a tie-breaker — and in competitive tech queries, almost everything is a tie-breaker. The metrics that matter in 2026 are <strong>LCP</strong> (how fast the main content paints), <strong>INP</strong> (how fast the page responds to input) and <strong>CLS</strong> (how much the layout jumps). Field data from real users decides your score, not your laptop.</p>
<h2>The checklist</h2>
<h3>1. Fix LCP at the source</h3>
<ul>
<li>Serve the hero image as AVIF/WebP, sized to the container, with <code>fetchpriority="high"</code>.</li>
<li>Preconnect to any third-party origin that blocks first paint.</li>
<li>Inline critical CSS; defer everything else. A single blocking stylesheet is usually the real LCP culprit.</li>
<li>Never lazy-load the hero. Lazy-load everything below the fold.</li>
</ul>
<h3>2. Protect INP with a thin main thread</h3>
<ul>
<li>Break long tasks above 50ms; yield with <code>scheduler.yield()</code> or <code>setTimeout(…, 0)</code>.</li>
<li>Attach listeners passively, and debounce scroll/resize handlers.</li>
<li>Hydrate on interaction instead of on load where the framework allows it.</li>
<li>Audit third-party tags — analytics and chat widgets cause most INP regressions.</li>
</ul>
<h3>3. Make CLS structurally impossible</h3>
<ul>
<li>Set explicit <code>width</code>/<code>height</code> or <code>aspect-ratio</code> on every image, video and embed.</li>
<li>Reserve space for banners and ads with a fixed min-height.</li>
<li>Self-host fonts, preload the primary weight, and use <code>font-display: swap</code> with a matched fallback metric.</li>
</ul>
<h2>Measure like a skeptic</h2>
<p>Lab tools tell you what to fix; field tools tell you whether it worked. Run Lighthouse for diagnostics, then confirm with the Chrome UX Report or your own <code>web-vitals</code> beacon over a 28-day window. Throttle to Slow 4G and a 4x CPU slowdown — that is the device most of your organic traffic actually uses.</p>
<h2>What to do this week</h2>
<p>Pick your highest-traffic template, fix its LCP element, remove one third-party script, and lock every image dimension. That single pass usually moves a failing page into the green. Next, cut the JavaScript that got you here — see <a href="./cut-javascript-bundle-size.html">how to cut bundle size by 60%</a>.</p>`,
    faq: [
      ['What is a good INP score in 2026?', 'Under 200ms at the 75th percentile of real users is a pass; under 100ms is where a page starts to feel genuinely instant.'],
      ['Do Core Web Vitals directly increase rankings?', 'They are a lightweight ranking signal and a strong conversion signal. They rarely beat better content, but they win close races.']
    ]
  },
  {
    slug: 'cut-javascript-bundle-size',
    category: 'tech',
    title: 'How to Cut JavaScript Bundle Size by 60%',
    seoTitle: 'Cut JavaScript Bundle Size by 60% Without Breaking Features',
    description: 'A repeatable process to cut JavaScript bundle size by 60%: measure, split, replace heavy dependencies and delete dead code — without losing features.',
    date: '2026-09-05',
    updated: '2026-09-05',
    read: 7,
    tags: ['JavaScript', 'Performance', 'Bundling'],
    keywords: 'reduce javascript bundle size, code splitting, tree shaking, web performance',
    hero: 'Every kilobyte you ship is a kilobyte a phone has to parse, compile and execute.',
    body: `
<h2>Start with an honest measurement</h2>
<p>You cannot cut what you cannot see. Generate a bundle report (<code>rollup-plugin-visualizer</code>, <code>webpack-bundle-analyzer</code> or your framework's built-in analyzer) and sort by <em>parsed</em> size, not gzipped size. Parse and compile cost is what stalls a mid-range phone.</p>
<h2>The four cuts that actually work</h2>
<h3>1. Replace heavyweight dependencies</h3>
<p>Date libraries, lodash, icon packs and animation frameworks are the usual top four. Native <code>Intl</code> handles most formatting, a handful of utility functions replace lodash, and inline SVG replaces an entire icon package.</p>
<h3>2. Split by route, then by interaction</h3>
<p>Route-level code splitting is table stakes. The bigger win is interaction-level: load the editor, chart, modal or map only when the user asks for it via dynamic <code>import()</code>.</p>
<h3>3. Make tree-shaking possible</h3>
<p>Ship ESM, mark the package <code>"sideEffects": false</code> when true, and avoid barrel files that re-export a whole directory — they quietly defeat dead-code elimination.</p>
<h3>4. Delete, then guard</h3>
<p>Remove polyfills for browsers you no longer support, drop unused feature flags, and add a CI size budget so the win does not regress next sprint.</p>
<h2>Ship less JavaScript by design</h2>
<p>Static HTML with a small hydration island beats a 300KB framework for a content site. This blog renders every page as plain HTML and loads roughly 12KB of JavaScript for search, the 3D canvas and UI behaviour — which is why its <a href="./core-web-vitals-checklist-2026.html">Core Web Vitals</a> stay green on mobile.</p>`,
    faq: [['How small should a bundle be?', 'Aim for under 100KB of compressed JavaScript on a content page and treat anything above 170KB as a budget breach.']]
  },
  {
    slug: 'self-hosting-vs-serverless',
    category: 'tech',
    title: 'Self-Hosting vs Serverless: The Real Cost Breakdown',
    seoTitle: 'Self-Hosting vs Serverless in 2026: Real Cost Breakdown',
    description: 'Serverless or a $12 VPS? A concrete cost and operations comparison across traffic tiers, cold starts, egress fees and engineering time.',
    date: '2026-09-02',
    updated: '2026-09-02',
    read: 9,
    tags: ['Architecture', 'DevOps', 'Cloud'],
    keywords: 'serverless vs vps cost, self hosting comparison, cloud cost optimization',
    hero: 'Serverless is cheap until it is not, and a VPS is simple until 3 a.m.',
    body: `
<h2>The comparison nobody publishes</h2>
<p>Serverless pricing looks free at low traffic and gets loud at scale; a VPS looks cheap forever until you price your own on-call hours. The honest answer depends on three numbers: requests per month, egress in gigabytes, and how much your time is worth.</p>
<h2>Cost by traffic tier</h2>
<ul>
<li><strong>Under 100k requests/month:</strong> serverless is effectively free and a VPS is wasted spend. Ship serverless.</li>
<li><strong>1–10M requests/month:</strong> costs converge. Egress and function duration start to dominate; a $20–40 VPS plus a CDN often wins.</li>
<li><strong>Above 50M requests/month:</strong> owned compute is dramatically cheaper — if you already have the operational maturity to run it.</li>
</ul>
<h2>The hidden line items</h2>
<p>Egress fees, log ingestion, per-invocation database connections and managed add-ons routinely double a serverless bill. On a VPS the hidden costs are patching, backups, monitoring and the incident that lands during your holiday.</p>
<h2>Cold starts and latency</h2>
<p>Modern runtimes have shrunk cold starts to tens of milliseconds for lightweight functions, but a heavy dependency tree still pushes them past a second. A long-lived process has no cold start at all, which is why latency-sensitive APIs still favour containers.</p>
<h2>A pragmatic default</h2>
<p>Static assets on a CDN, dynamic endpoints on serverless, and stateful or latency-critical workloads on owned compute. Keep the boundary at the HTTP layer so you can move a service without rewriting it.</p>`
  },
  {
    slug: 'rag-vs-fine-tuning',
    category: 'ai',
    title: 'RAG vs Fine-Tuning: How to Choose',
    seoTitle: 'RAG vs Fine-Tuning in 2026: How to Choose (Decision Guide)',
    description: 'RAG vs fine-tuning explained with a clear decision framework: cost, freshness, accuracy, latency and when to combine both approaches.',
    date: '2026-09-09',
    updated: '2026-09-09',
    read: 8,
    tags: ['LLM', 'RAG', 'Fine-Tuning'],
    keywords: 'rag vs fine tuning, retrieval augmented generation, llm architecture decision',
    hero: 'Retrieval changes what the model knows. Fine-tuning changes how it behaves.',
    body: `
<h2>The one-line rule</h2>
<p>Use <strong>RAG</strong> when the model needs facts it does not have. Use <strong>fine-tuning</strong> when the model needs a behaviour, format or tone it will not follow reliably. Most teams reach for fine-tuning when their real problem is retrieval quality.</p>
<h2>Choose RAG when…</h2>
<ul>
<li>Your knowledge changes weekly or faster.</li>
<li>You need citations and auditability.</li>
<li>Access control matters — retrieval can be filtered per user, weights cannot.</li>
<li>You want to ship this week instead of collecting a dataset.</li>
</ul>
<h2>Choose fine-tuning when…</h2>
<ul>
<li>You need a strict output schema or a domain-specific style, every time.</li>
<li>You want to distil a big model into a smaller, cheaper one at fixed quality.</li>
<li>Prompt length is your cost bottleneck — tuning moves instructions into weights.</li>
</ul>
<h2>The combination that wins</h2>
<p>In production the strong pattern is a small fine-tuned model for behaviour plus retrieval for facts: tune the format, retrieve the truth. Add a reranker before you add parameters — reranking a top-50 candidate set into a top-5 context usually beats any tuning run for factual accuracy.</p>
<h2>Evaluate before you commit</h2>
<p>Build a 100-example golden set from real user questions and score groundedness, correctness and format compliance. Ninety percent of "we need fine-tuning" conclusions dissolve once chunking, embeddings and reranking are fixed. If you are running locally, see the <a href="./local-llm-8gb-vram-setup.html">8GB VRAM setup guide</a>.</p>`,
    faq: [
      ['Is RAG cheaper than fine-tuning?', 'Usually yes to build, sometimes no to run: retrieval adds tokens to every request, while tuning front-loads cost and shortens prompts.'],
      ['Can I use RAG and fine-tuning together?', 'Yes — this is the standard production pattern. Fine-tune for output behaviour and retrieve for current facts.']
    ]
  },
  {
    slug: 'ai-seo-topical-authority',
    category: 'ai',
    title: 'AI SEO: Building Topical Authority That Ranks #1',
    seoTitle: 'AI SEO in 2026: Build Topical Authority and Rank #1',
    description: 'How to build topical authority with AI-assisted workflows: entity coverage, internal linking clusters, structured data and content that survives AI search.',
    date: '2026-09-06',
    updated: '2026-09-06',
    read: 10,
    tags: ['SEO', 'AI', 'Content Strategy'],
    keywords: 'ai seo, topical authority, content clusters, structured data, generative engine optimization',
    hero: 'Search engines rank sites that own a subject, not pages that mention a keyword.',
    body: `
<h2>Authority is a graph, not a page</h2>
<p>Ranking first for a competitive query is rarely about one perfect article. It is about covering a topic so completely — and linking it so clearly — that a crawler can model you as the authority on that subject. Practically, that means clusters: one pillar page per topic, six to twelve supporting pages, all interlinked with descriptive anchors.</p>
<h2>The cluster blueprint</h2>
<ol>
<li><strong>Pick a narrow topic</strong> you can genuinely own — "Core Web Vitals for content sites", not "web performance".</li>
<li><strong>Map intent tiers:</strong> informational (what/why), comparative (X vs Y), and transactional (tools, checklists, templates).</li>
<li><strong>Write the pillar</strong> as a complete overview that links out to every supporting page.</li>
<li><strong>Link back</strong> from each supporting page to the pillar and to two siblings. No orphan pages, ever.</li>
</ol>
<h2>Where AI helps — and where it hurts</h2>
<p>Use AI for entity extraction from top-ranking results, gap analysis against your outline, schema generation, internal-link suggestions and metadata variants. Do not use it to generate the substance: undifferentiated text is exactly what current quality systems demote. First-hand benchmarks, screenshots and numbers are the moat.</p>
<h2>Optimise for AI answers too</h2>
<p>Generative search engines quote extractable, well-structured content. Answer the question in the first 60 words of a section, keep one idea per paragraph, use descriptive H2/H3s phrased as questions, and mark up Article and FAQ schema. Add a dated "last updated" line — freshness signals matter for both crawlers and readers.</p>
<h2>Measure the right things</h2>
<p>Track impressions per topic cluster, average position for the head term, click-through rate by title variant, and internal link depth. If a page sits deeper than three clicks from the homepage, it is not getting the crawl budget it needs.</p>`,
    faq: [
      ['How many posts do I need for topical authority?', 'A tight cluster of 8–12 interlinked pages on one narrow subject usually outperforms 50 scattered posts.'],
      ['Does AI-written content rank?', 'AI-assisted content ranks; AI-generated filler does not. Original data, examples and experience are the differentiator.']
    ]
  },
  {
    slug: 'local-llm-8gb-vram-setup',
    category: 'ai',
    title: 'Run a Local LLM on 8GB VRAM: Practical Setup',
    seoTitle: 'Run a Local LLM on 8GB VRAM: Practical 2026 Setup Guide',
    description: 'A practical guide to running a local LLM on 8GB VRAM: model choices, quantisation levels, context limits, throughput expectations and tuning tips.',
    date: '2026-09-03',
    updated: '2026-09-03',
    read: 7,
    tags: ['Local LLM', 'Quantisation', 'Hardware'],
    keywords: 'local llm 8gb vram, quantization guide, run llm locally, gguf models',
    hero: 'A mid-range GPU runs a genuinely useful assistant — if you respect the memory maths.',
    body: `
<h2>The memory maths</h2>
<p>Rough rule: weight memory ≈ parameters × bits ÷ 8. A 7–8B model at 4-bit quantisation needs about 4.5GB, leaving room for the KV cache and your desktop. That is why 7B-class models at Q4 are the sweet spot on 8GB cards, and 13B is realistic only with aggressive quantisation and short context.</p>
<h2>Pick quantisation deliberately</h2>
<ul>
<li><strong>Q8:</strong> near-lossless, but only fits small models on 8GB.</li>
<li><strong>Q5_K_M:</strong> best quality-per-gigabyte for reasoning-heavy work.</li>
<li><strong>Q4_K_M:</strong> the default choice — small quality loss, big speed win.</li>
<li><strong>Q3 and below:</strong> noticeable degradation; use only when nothing else fits.</li>
</ul>
<h2>Context is the hidden memory hog</h2>
<p>The KV cache grows linearly with context length. Jumping from 4k to 32k context can cost more memory than the weights themselves. Keep context at what you actually use, enable KV-cache quantisation if your runtime supports it, and lean on retrieval instead of stuffing long documents into the prompt.</p>
<h2>Throughput you should expect</h2>
<p>On a typical 8GB consumer GPU, a Q4 7B model delivers roughly 30–60 tokens per second for single-stream chat — comfortably faster than reading speed. Batch requests only if you have memory headroom; batching multiplies KV cache use.</p>
<h2>Make it useful, not just local</h2>
<p>Wrap the model in retrieval over your own notes, expose an OpenAI-compatible endpoint so existing tools work unchanged, and keep a cloud model as a fallback for hard queries. For the retrieval side, read <a href="./rag-vs-fine-tuning.html">RAG vs fine-tuning</a>.</p>`
  }
];

/* ===== 3. HELPERS ========================================================= */
const fmt = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byDate = (a, b) => b.date.localeCompare(a.date);
const postUrl = (p) => `blog/${p.slug}.html`;
/* Post bodies live in src/content/<slug>.html when that file exists. */
for (const p of POSTS) {
  try { p.body = await readFile(path.join('src', 'content', p.slug + '.html'), 'utf8'); } catch {}
  p.read = Math.max(1, Math.round(p.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 225));
}

const sorted = [...POSTS].sort(byDate);
const inCat = (c) => sorted.filter((p) => p.category === c);

/* ===== 4. SHARED MARKUP =================================================== */
function head({ title, description, canonical, base, theme, keywords = '', jsonld = [], noindex = false }) {
  return `<!DOCTYPE html>
<html lang="${SITE.lang}" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="google-site-verification" content="FiMCatCEiTf1EalryWxrZlbAbu8dzmmsaXsjYCkXz0Y" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}
<link rel="canonical" href="${SITE.url}/${canonical}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta name="author" content="${SITE.author}">
<meta name="theme-color" content="#07080d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.url}/${canonical}">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:image" content="${SITE.url}/assets/img/og-${theme}.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(SITE.name)} — ${esc(SITE.tagline)}">
<meta name="twitter:image" content="${SITE.url}/assets/img/og-${theme}.png">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.url}/assets/img/og-${theme}.svg">
<link rel="icon" href="${base}favicon.ico" sizes="any">
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="${base}assets/img/icon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${base}assets/img/icon-180.png">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${SITE.name} feed" href="${SITE.url}/rss.xml">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="${base}assets/css/style.css">
<script>window.SITE_BASE=${JSON.stringify(base)};</script>
${jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

const logo = (base) => `<a class="logo" href="${base}index.html" aria-label="${SITE.name} home">
  <img src="${base}assets/img/logo.png" alt="StackSignal" width="34" height="34" style="width:34px;height:34px;flex:none;display:block">
  <span class="logo__txt">${SITE.name}<small>Tech &amp; AI</small></span>
</a>`;

function header(base, current) {
  const link = (href, label, key) =>
    `<a href="${base}${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="hdr">
  <div class="wrap hdr__in">
    ${logo(base)}
    <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    <nav class="nav" id="nav" aria-label="Primary">
      ${link('index.html', 'Home', 'home')}
      ${link('tech.html', 'Tech', 'tech')}
      ${link('ai.html', 'AI', 'ai')}
      ${link('blog/index.html', 'All posts', 'blog')}
      ${link('about.html', 'About', 'about')}
    </nav>
  </div>
</header>`;
}

function searchBox(scope = '', placeholder = 'Search articles…') {
  return `<div class="search" data-scope="${scope}" role="search">
  <label class="sr" for="q-${scope || 'all'}">Search articles</label>
  <div class="search__box">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input id="q-${scope || 'all'}" type="search" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="res-${scope || 'all'}" placeholder="${esc(placeholder)}">
    <kbd>/</kbd>
  </div>
  <ul class="search__results" id="res-${scope || 'all'}" role="listbox"></ul>
</div>`;
}

const footer = (base) => `<footer class="foot">
  <div class="wrap foot__grid">
    <div>
      ${logo(base)}
      <p style="margin-top:.8rem">${SITE.description}</p>
    </div>
    <div><h4>Categories</h4><ul>
      <li><a href="${base}tech.html">Tech</a></li>
      <li><a href="${base}ai.html">AI</a></li>
      <li><a href="${base}blog/index.html">All posts</a></li>
    </ul></div>
    <div><h4>Site</h4><ul>
      <li><a href="${base}about.html">About</a></li>    </ul></div>
    <div><h4>Popular topics</h4><ul>
      ${[...new Set(POSTS.flatMap((p) => p.tags))].slice(0, 5).map((t) => `<li>${esc(t)}</li>`).join('')}
    </ul></div>
  </div>
  <div class="wrap" style="margin-top:2rem;font-size:.82rem">© ${new Date().getFullYear()} ${SITE.name}. Built as a static site — ${SITE.tagline}</div>
</footer>
<button class="to-top" type="button" aria-label="Scroll back to top" title="Back to top">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
</button>
<script src="${base}assets/js/hero3d.js" defer></script>
<script src="${base}assets/js/app.js" defer></script>
</body>
</html>`;

const cardOf = (p, base) => `<article class="card reveal">
  <span class="badge badge--${p.category}">${CATEGORIES[p.category].name}</span>
  <h3><a href="${base}${postUrl(p)}">${esc(p.title)}</a></h3>
  <p>${esc(p.description)}</p>
  <div class="card__meta"><time datetime="${p.date}">${fmt(p.date)}</time><span aria-hidden="true">•</span><span>${p.read} min read</span></div>
</article>`;

/* ===== 5. PAGE: article =================================================== */
function postPage(p) {
  const c = CATEGORIES[p.category];
  const url = `${SITE.url}/${postUrl(p)}`;
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.title, description: p.description, datePublished: p.date, dateModified: p.updated || p.date,
      author: { '@type': 'Person', name: SITE.author },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/assets/img/favicon.svg` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: c.name, keywords: p.tags.join(', '), wordCount: p.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
      inLanguage: SITE.lang, image: `${SITE.url}/assets/img/og-${c.theme}.png`
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/index.html` },
        { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE.url}/${c.slug}.html` },
        { '@type': 'ListItem', position: 3, name: p.title, item: url }
      ]
    }
  ];
  if (p.faq?.length) jsonld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  });

  const base = p.seoTitle || p.title;
  const titleTag = (base + ' | ' + SITE.name).length <= 60 ? base + ' | ' + SITE.name : base;
  return `${head({ title: titleTag, description: p.description, canonical: postUrl(p), base: '../', theme: c.theme, keywords: p.keywords, jsonld })}
<div class="progress" aria-hidden="true"></div>
${header('../', p.category)}
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="../${c.slug}.html">${c.name}</a> / <span>${esc(p.title)}</span></nav>
    <div class="article-grid">
    <article class="article">
      <span class="badge badge--${p.category}">${c.name}</span>
      <h1>${esc(p.title)}</h1>
      <div class="article__meta">
        <span>By ${SITE.author}</span><span aria-hidden="true">•</span>
        <time datetime="${p.date}">${fmt(p.date)}</time><span aria-hidden="true">•</span>
        <span>${p.read} min read</span><span aria-hidden="true">•</span>
        <span>Updated ${fmt(p.updated || p.date)}</span>
      </div>
      <p class="article__lede">${esc(p.hero)}</p>
      <div class="prose">${p.body}
      ${p.faq?.length ? `<h2 id="faq">Frequently asked questions</h2><div class="faq">${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}
      </div>
      <ul class="tags" style="margin-top:2rem">${p.tags.map((t) => `<li>#${esc(t)}</li>`).join('')}</ul>
    </article>
    <aside class="toc" data-toc aria-label="Table of contents"></aside>
    </div>
  </div>
  <section>
    <div class="wrap">
      <div class="sec-head"><div><h2>Latest updates</h2><p>The four most recent posts across ${SITE.name}.</p></div><a class="btn" href="../blog/index.html">All posts</a></div>
      <div class="grid" data-feed="" data-limit="4" data-exclude="${postUrl(p)}">${sorted.filter((x) => x.slug !== p.slug).slice(0, 4).map((x) => cardOf(x, '../')).join('')}</div>
    </div>
  </section>
</main>
${footer('../')}`;
}

/* ===== 6. PAGE: category ================================================== */
function categoryPage(c) {
  const posts = inCat(c.slug);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: c.title, description: c.description, url: `${SITE.url}/${c.slug}.html`,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/${postUrl(p)}`, name: p.title }))
    }
  }];
  return `${head({ title: `${c.title} | ${SITE.name}`, description: c.description, canonical: `${c.slug}.html`, base: './', theme: c.theme, keywords: `${c.slug} blog, ${posts.flatMap((p) => p.tags).join(', ')}`, jsonld })}
${header('./', c.slug)}
<main id="main">
  <section class="hero">
    <canvas class="hero__canvas" data-shape="${c.shape}" aria-hidden="true"></canvas>
    <div class="wrap hero__in">
      <span class="kicker">${c.kicker} category</span>
      <h1><span class="grad">${c.h1}</span></h1>
      <p class="lede">${esc(c.blurb)}</p>
      ${searchBox(c.slug, `Search ${c.name} articles…`)}
      <ul class="hero__stats">${c.stats.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join('')}</ul>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="sec-head"><div><h2>All ${c.name} articles</h2><p>${posts.length} in-depth ${c.name} guides, newest first.</p></div><a class="btn" href="./blog/index.html">All posts →</a></div>
      <div class="grid">${posts.map((p) => cardOf(p, './')).join('')}</div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="sec-head"><div><h2>Latest updates in ${c.name}</h2><p>Maximum four newest ${c.name} posts, generated automatically.</p></div></div>
      <div class="grid" data-feed="${c.slug}" data-limit="4">${posts.slice(0, 4).map((p) => cardOf(p, './')).join('')}</div>
      <p style="margin-top:1.6rem">Looking for the other side of the site? Read the <a href="./${c.slug === 'tech' ? 'ai' : 'tech'}.html">${c.slug === 'tech' ? 'AI' : 'Tech'} category</a>.</p>
    </div>
  </section>
</main>
${footer('./')}`;
}

/* ===== 7. PAGE: home ===================================================== */
function homePage() {
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, alternateName: 'StackSignal Tech & AI Blog',
      url: SITE.url + '/', description: SITE.description, inLanguage: SITE.lang,
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url + '/', logo: { '@type': 'ImageObject', url: `${SITE.url}/assets/img/favicon.svg` } },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/blog/index.html?q={search_term_string}` },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Latest posts',
      itemListElement: sorted.slice(0, 4).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/${postUrl(p)}`, name: p.title }))
    }
  ];
  const panel = (c) => `<a class="panel panel--${c.slug}" href="./${c.slug}.html" aria-label="Open the ${c.name} category">
    <span class="panel__orb" aria-hidden="true"></span>
    <span class="badge badge--${c.slug}">${c.name}</span>
    <h3 style="font-size:1.6rem;margin:.7rem 0 .3rem">${c.h1}</h3>
    <p style="color:var(--muted)">${esc(c.blurb)}</p>
    <ul>${inCat(c.slug).slice(0, 3).map((p) => `<li>${esc(p.title)}</li>`).join('')}</ul>
    <span class="btn btn--primary">Explore ${c.name} →</span>
  </a>`;

  return `${head({ title: `${SITE.name} — Practical Tech & AI Guides for Engineers`, description: SITE.description, canonical: 'index.html', base: './', theme: 'default', keywords: 'tech blog, ai blog, web performance, llm guides, seo, core web vitals', jsonld })}
${header('./', 'home')}
<main id="main">
  <section class="hero">
    <canvas class="hero__canvas" data-shape="globe" aria-hidden="true"></canvas>
    <div class="wrap hero__in">
      <span class="kicker">${POSTS.length} deep-dive guides · updated weekly</span>
      <h1>Two disciplines. <span class="grad">One signal.</span></h1>
      <p class="lede">${esc(SITE.description)} Pick a lane below — each category has its own theme, its own search and its own feed.</p>
      ${searchBox('', 'Search tech & AI articles…  (press /)')}
      <div class="cta-row">
        <a class="btn btn--primary" href="./tech.html">Tech articles</a>
        <a class="btn" href="./ai.html">AI articles</a>
        <a class="btn" href="./blog/index.html">Browse all</a>
      </div>
    </div>
  </section>

  <section id="categories">
    <div class="wrap">
      <div class="sec-head"><div><h2>Choose your category</h2><p>Tech runs on a green circuit theme with a rotating lattice; AI runs on a violet neural theme. Same engine, different atmosphere.</p></div></div>
      <div class="split">${panel(CATEGORIES.tech)}${panel(CATEGORIES.ai)}</div>
    </div>
  </section>

  <section id="latest">
    <div class="wrap">
      <div class="sec-head"><div><h2>Latest updates</h2><p>The newest four posts, always — rendered from <code>search-index.json</code> at load.</p></div><a class="btn" href="./blog/index.html">All posts</a></div>
      <div class="grid" data-feed="" data-limit="4">${sorted.slice(0, 4).map((p) => cardOf(p, './')).join('')}</div>
    </div>
  </section>
</main>
${footer('./')}`;
}

/* ===== 8. PAGE: all posts + about + 404 =================================== */
function blogIndexPage() {
  return `${head({ title: `All Articles — Tech & AI Guides | ${SITE.name}`, description: `Browse all ${POSTS.length} ${SITE.name} articles on web performance, architecture, LLMs and AI-era SEO.`, canonical: 'blog/index.html', base: '../', theme: 'default', keywords: 'tech and ai articles, engineering blog archive', jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: SITE.name, url: `${SITE.url}/blog/index.html`, blogPost: sorted.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE.url}/${postUrl(p)}`, datePublished: p.date })) }] })}
${header('../', 'blog')}
<main id="main">
  <section class="hero" style="padding-bottom:1rem">
    <canvas class="hero__canvas" data-shape="network" aria-hidden="true"></canvas>
    <div class="wrap hero__in">
      <span class="kicker">Archive</span>
      <h1>Every <span class="grad">article</span></h1>
      <p class="lede">All ${POSTS.length} posts across Tech and AI, newest first. Search filters the whole archive instantly.</p>
      ${searchBox('', 'Search all articles…')}
    </div>
  </section>
  <section><div class="wrap"><div class="grid">${sorted.map((p) => cardOf(p, '../')).join('')}</div></div></section>
  <section><div class="wrap">
    <div class="sec-head"><div><h2>Latest updates</h2><p>Newest four, auto-generated.</p></div></div>
    <div class="grid" data-feed="" data-limit="4">${sorted.slice(0, 4).map((p) => cardOf(p, '../')).join('')}</div>
  </div></section>
</main>
${footer('../')}`;
}

function aboutPage() {
  return `${head({ title: `About ${SITE.name} — Editorial Standards & SEO Method`, description: `Who writes ${SITE.name}, how articles are researched and updated, and the SEO methodology behind the site.`, canonical: 'about.html', base: './', theme: 'default', jsonld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE.url}/about.html`, mainEntity: { '@type': 'Person', name: SITE.author, jobTitle: 'Full-stack developer', knowsAbout: ['Web performance', 'SEO', 'LLM applications'] } }] })}
${header('./', 'about')}
<main id="main"><div class="wrap"><article class="article" style="padding-top:3rem">
  <h1>About ${SITE.name}</h1>
  <p class="article__lede">${SITE.tagline} Written and maintained by ${SITE.author}.</p>
  <div class="prose">
    <h2>Editorial standards</h2>
    <p>Every article is written from hands-on work: benchmarks are run locally, configurations are tested, and numbers are quoted from measurements rather than marketing pages. Posts carry a visible publish and updated date, and are revised when the underlying tooling changes.</p>
    <h2>How this site is built</h2>
    <p>A dependency-free Node generator turns a single content file into static HTML, a JSON search index, an RSS feed and a sitemap. There is no CMS, no tracking bloat and no client-side rendering — which keeps Core Web Vitals green and makes SEO experiments clean.</p>
    <h2>Experience, expertise, authority, trust</h2>
    <p>Author attribution, topic clustering, transparent update dates and cited first-hand testing are deliberate E-E-A-T choices. If you spot an error, corrections are published inline with a note.</p>
    
    <h2>Who writes this</h2>
    <p>${SITE.name} is written and maintained by ${SITE.author}. It is a single-author site, which is deliberate: the recommendations here come from one person's experience shipping and maintaining real projects, so you always know whose judgement you are reading rather than an anonymous editorial voice.</p>
    <p>That also sets the boundaries. Topics that fall outside hands-on experience are either skipped or clearly labelled as an outsider's reading of the situation, with links to people who know the area better. Nothing is padded out to look authoritative when the honest answer is that it has not been tested here.</p>

    <h2>What gets published, and what does not</h2>
    <p>An article is published when it answers a question that came up in real work, and the answer took long enough to find that writing it down saves someone else the same search. Every guide carries the working configuration or command, the version it was tested against, and the failure mode that led there in the first place.</p>
    <p>What does not get published: press-release rewrites, roundups of tools nobody has actually run, and posts written purely to fill a keyword gap. Sponsored placements are not accepted, so nothing on this site appears because someone paid for it.</p>

    <h2>How articles are kept current</h2>
    <p>Published posts are reviewed when a major version of the tool they cover lands, when a recommended service changes its free tier or pricing, or when a reader reports that a step no longer works. Updates are applied to the original page so existing links keep working, and material changes are noted in the text rather than made silently.</p>
    <p>If an approach stops being the right recommendation entirely, the post says so at the top and points to the current one, instead of being quietly deleted and leaving a dead URL behind.</p>

    <h2>How the site is measured</h2>
    <p>Success here is not pageviews. The measures that matter are whether a reader finds the specific fix they came for, whether the code still runs a year later, and whether people come back for the next problem. That is why posts stay short, reading times are calculated from actual length, and the archive stays small rather than being inflated with filler.</p>

    <h2>Corrections and contact</h2>
    <p>Corrections are welcome and applied quickly — a wrong command is worse than no article at all. If you find an error, a broken sample, or a step that fails on your setup, open an issue on the site's repository with the post URL and what you ran, and it will be looked at.</p>
  </div>
</article></div></main>
${footer('./')}`;
}

function notFoundPage() {
  return `${head({ title: `Page not found | ${SITE.name}`, description: 'That page could not be found on StackSignal. Search the Tech and AI archive or jump back to the homepage to keep reading.', canonical: '404.html', base: './', theme: 'default', noindex: true })}
${header('./', '')}
<main id="main"><section class="hero"><canvas class="hero__canvas" data-shape="grid" aria-hidden="true"></canvas>
  <div class="wrap hero__in">
    <span class="kicker">Error 404</span>
    <h1>This page <span class="grad">drifted off</span></h1>
    <p class="lede">The URL is wrong or the post moved. Try the search box or head back home.</p>
    ${searchBox('', 'Search articles…')}
    <div class="cta-row"><a class="btn btn--primary" href="./index.html">Back home</a><a class="btn" href="./blog/index.html">All posts</a></div>
  </div></section></main>
${footer('./')}`;
}

/* ===== 9. FEEDS, INDEX, ASSETS =========================================== */
const searchIndex = sorted.map((p) => ({
  title: p.title, description: p.description, url: postUrl(p),
  category: CATEGORIES[p.category].name, categorySlug: p.category,
  tags: p.tags, keywords: p.keywords || '', date: p.date, dateLabel: fmt(p.date), read: p.read
}));

const sitemap = () => {
  const urls = [
    ['index.html', '1.0', 'daily'], ['tech.html', '0.9', 'daily'], ['ai.html', '0.9', 'daily'],
    ['blog/index.html', '0.8', 'daily'], ['about.html', '0.4', 'monthly'],
    ...sorted.map((p) => [postUrl(p), '0.8', 'weekly'])
  ];
  const lastmod = (u) => (sorted.find((p) => postUrl(p) === u)?.updated) || new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr, cf]) => `  <url><loc>${SITE.url}/${u}</loc><lastmod>${lastmod(u)}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>`;
};

const robots = () => `User-agent: *
Allow: /
Disallow: /404.html

# AI crawlers — allow (remove a line to block that bot)
User-agent: GPTBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${SITE.url}/sitemap.xml`;

const rss = () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.name + " — " + SITE.tagline)}</title>
  <link>${SITE.url}/</link>
  <description>${esc(SITE.description)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date(sorted[0].date + 'T00:00:00Z').toUTCString()}</lastBuildDate>
  <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>
${sorted.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE.url}/${postUrl(p)}</link>
    <guid isPermaLink="true">${SITE.url}/${postUrl(p)}</guid>
    <category>${CATEGORIES[p.category].name}</category>
    <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`).join('\n')}
</channel>
</rss>`;

const manifest = () => JSON.stringify({
  name: `${SITE.name} — ${SITE.tagline}`, short_name: SITE.name, start_url: './index.html',
  display: 'standalone', background_color: '#07080d', theme_color: '#07080d',
  description: SITE.description,
  icons: [
    { src: 'assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2);

const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ee7ff"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#07080d"/><path d="M32 8 54 20v24L32 56 10 44V20z" fill="none" stroke="url(#g)" stroke-width="3"/><path d="M32 8v48M10 20l44 24M54 20 10 44" stroke="url(#g)" stroke-width="1.4" opacity=".6"/><circle cx="32" cy="32" r="6" fill="url(#g)"/></svg>`;

const ogCard = (label, c1, c2) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="1200" height="630" fill="#07080d"/><circle cx="980" cy="120" r="300" fill="url(#b)" opacity=".22"/><text x="80" y="300" font-family="Inter,Arial" font-size="84" font-weight="800" fill="#eef1f8">${SITE.name}</text><text x="80" y="375" font-family="Inter,Arial" font-size="38" fill="#a2aac0">${label}</text><rect x="80" y="430" width="210" height="56" rx="28" fill="url(#b)"/><text x="110" y="468" font-family="Inter,Arial" font-size="26" font-weight="700" fill="#05070c">Read now →</text></svg>`;

/* ===== 10. WRITE ========================================================= */
const w = async (rel, data) => {
  const file = path.join(OUT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return rel;
};

await rm(OUT, { recursive: true, force: true });
await cp('src/assets', path.join(OUT, 'assets'), { recursive: true });

const written = [];
written.push(await w('index.html', homePage()));
for (const c of Object.values(CATEGORIES)) written.push(await w(`${c.slug}.html`, categoryPage(c)));
written.push(await w('blog/index.html', blogIndexPage()));
for (const p of sorted) written.push(await w(postUrl(p), postPage(p)));
written.push(await w('about.html', aboutPage()));
written.push(await w('404.html', notFoundPage()));
written.push(await w('search-index.json', JSON.stringify(searchIndex)));
written.push(await w('sitemap.xml', sitemap()));
written.push(await w('robots.txt', robots()));
written.push(await w('rss.xml', rss()));
written.push(await w('manifest.webmanifest', manifest()));
written.push(await w('favicon.ico', await readFile('src/assets/img/favicon.ico')));
written.push(await w('assets/img/og-default.svg', ogCard(SITE.tagline, '#6ee7ff', '#7c8cff')));
written.push(await w('assets/img/og-tech.svg', ogCard('Tech — performance & architecture', '#3ddc97', '#2dd4bf')));
written.push(await w('assets/img/og-ai.svg', ogCard('AI — LLMs & applied ML', '#c084fc', '#f472b6')));

// _headers must sit at the site ROOT for Cloudflare Pages / Netlify to read it
written.push(await w('_headers', await readFile('src/assets/_headers', 'utf8')));
await rm(path.join(OUT, 'assets/_headers'), { force: true });
written.push(await w('.nojekyll', ''));   // harmless on CF, required by GitHub Pages

console.log(`✓ Built ${written.length} files into /${OUT}`);
console.log(`  ${POSTS.length} posts · ${Object.keys(CATEGORIES).length} categories · domain: ${SITE.url}`);
