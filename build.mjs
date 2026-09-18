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
  },
  {
    slug: 'chatgpt-prompts-productivity',
    category: 'ai',
    title: '30 ChatGPT Prompts That Save an Hour a Day',
    seoTitle: '30 ChatGPT Prompts That Save an Hour a Day',
    description: '30 ChatGPT prompts I actually use for email, meetings, spreadsheets and writing - copy, paste, replace the brackets. Plus the three prompts I stopped using.',
    date: '2026-09-11',
    updated: '2026-09-11',
    read: 9,
    tags: ['ChatGPT', 'Productivity', 'AI Tools'],
    keywords: 'chatgpt prompts for productivity, best chatgpt prompts, chatgpt prompts for work, time saving chatgpt prompts, chatgpt productivity hacks',
    hero: 'Six of these do almost all the work. The other twenty-four are for the weeks they come up.',
    body: ``,
    faq: [
      ['What makes a ChatGPT prompt actually work?', 'Four things: state the length, say what not to do, name the audience instead of inflating the model\'s job title, and give it an escape hatch so it can leave a gap instead of inventing a value.'],
      ['Do I need ChatGPT Plus for these prompts?', 'No. Every prompt here works on the free tier. Longer documents and transcripts are where a paid plan helps, because of context limits rather than prompt quality.'],
      ['Why avoid "act as a world-class expert"?', 'It changes tone and little else. Describing who the answer is for gets you a measurably better result than describing who the model is pretending to be.']
    ]
  },
  {
    slug: 'browser-rendering-explained',
    category: 'tech',
    title: 'Browser Rendering Explained: From HTML to Pixels',
    seoTitle: 'Browser Rendering Explained: How HTML, CSS & JavaScript Become Pixels',
    description: 'Understand the browser rendering pipeline, critical rendering path, layout, paint and compositing — and where performance really gets lost.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['Web Performance','Browser','Rendering'],
    keywords: 'browser rendering pipeline, critical rendering path, layout paint composite, web performance',
    hero: 'Know the path from bytes to pixels, and you know where to look when a page feels slow.',
    body: '',
    faq: [
      ['Why is a transform animation cheaper than animating width?', 'Transform and opacity changes skip the layout and paint stages entirely and go straight to compositing, which the GPU handles efficiently. Changing width or top forces layout, paint and composite to all rerun.'],
      ['What counts as a long task?', 'Any main-thread task longer than 50 milliseconds. Long tasks block the browser from responding to input or updating the frame, which is the primary cause of poor INP scores.'],
      ['Does the pipeline explain Cumulative Layout Shift?', 'Yes — CLS happens when layout is recalculated unexpectedly after initial render, typically because space wasn\'t reserved for an image, ad or web font before it loaded in.']
    ]
  },
  {
    slug: 'image-optimization-for-web',
    category: 'tech',
    title: 'Image Optimization for the Modern Web',
    seoTitle: 'Image Optimization for Web Performance: WebP, AVIF, Sizes & Lazy Loading',
    description: 'A practical image optimization guide covering dimensions, modern formats, responsive images, loading priority and the mistakes that hurt LCP.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['Performance','Images','Core Web Vitals'],
    keywords: 'image optimization webp avif responsive images lcp, image performance',
    hero: 'Your image strategy should start with dimensions, not formats.',
    body: '',
    faq: [
      ['Should I always use AVIF?', 'AVIF gives the smallest files for photographic content, but serve it alongside a WebP and JPEG fallback via <picture> since encode time and support vary slightly by browser.'],
      ['Why is my hero image hurting my LCP score?', 'The most common cause is lazy-loading it or leaving out fetchpriority="high" — both delay the download of what is very likely your largest above-the-fold element.'],
      ['Do I need both srcset and sizes?', 'Yes. srcset lists the available resolutions; sizes tells the browser how large the image will actually render at different viewport widths so it can pick the right one before layout is known.']
    ]
  },
  {
    slug: 'caching-and-cdn-strategies',
    category: 'tech',
    title: 'Caching and CDN Strategies for Fast Static Sites',
    seoTitle: 'Caching and CDN Strategies for Fast Static Websites',
    description: 'Learn how browser caching, immutable assets, cache-control headers and CDNs work together to make static websites faster and cheaper.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['Performance','Caching','CDN'],
    keywords: 'browser caching, cache-control, cdn static site, immutable assets',
    hero: 'The best request is the request the browser does not need to make again.',
    body: '',
    faq: [
      ['Why can content-hashed assets be cached for a year?', 'Because the filename itself changes whenever the content changes, a cached copy of a hashed filename is never stale — it is simply the version that filename has always referred to.'],
      ['What does stale-while-revalidate actually do?', 'It serves the cached response instantly even after it is technically stale, while fetching a fresh copy in the background for the next visit — combining speed with eventual freshness.'],
      ['Will adding a CDN automatically make my site faster?', 'Only as much as your Cache-Control headers allow. A CDN in front of uncacheable or overly conservative headers provides little benefit beyond basic proxying.']
    ]
  },
  {
    slug: 'embeddings-explained',
    category: 'ai',
    title: 'Embeddings Explained: How AI Turns Text into Vectors',
    seoTitle: 'Embeddings Explained: How AI Turns Text into Vectors',
    description: 'A practical explanation of embeddings, similarity, vector dimensions, chunking and how embeddings power search, RAG and recommendations.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['LLM','Embeddings','RAG'],
    keywords: 'embeddings explained, text embeddings, vector similarity, rag embeddings',
    hero: 'Embeddings turn meaning into numbers that a system can compare.',
    body: '',
    faq: [
      ['What is an embedding in simple terms?', 'An embedding is a list of numbers that represents the meaning of a piece of text, positioned so that similar meanings end up close together in that numerical space.'],
      ['Is cosine similarity always the right metric?', 'It is the right default for most text embedding models, but check the model card — some models are trained specifically for dot-product retrieval instead.'],
      ['Do more dimensions mean a better embedding model?', 'No. Retrieval quality depends on training data and objective, not vector size. Benchmark recall on your own questions rather than choosing by dimension count.']
    ]
  },
  {
    slug: 'vector-databases-explained',
    category: 'ai',
    title: 'Vector Databases Explained: Indexes, Metadata and Retrieval',
    seoTitle: 'Vector Databases Explained: How Indexes, Metadata and Retrieval Work',
    description: 'Understand vector databases, approximate nearest-neighbour indexes, metadata filtering and the design decisions behind production retrieval systems.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['RAG','Vector Database','Architecture'],
    keywords: 'vector database explained, ann index, metadata filtering, rag retrieval',
    hero: 'A vector database is a retrieval engine, not a magical memory for an LLM.',
    body: '',
    faq: [
      ['Do I need a dedicated vector database?', 'Not always. If you already run Postgres and have under a few million vectors, pgvector is often enough. Move to a dedicated engine once you measure a real latency or recall ceiling.'],
      ['What does approximate nearest-neighbour search mean?', 'It means the index returns results that are very likely, but not mathematically guaranteed, to be the true closest matches — trading a small amount of recall for much faster queries at scale.'],
      ['Why does metadata filtering matter for RAG?', 'Without it, a similarity search can return outdated or permission-restricted content just because it is semantically close to the query. Filtering by date, source or access level is what makes results trustworthy.']
    ]
  },
  {
    slug: 'ai-agents-vs-rag',
    category: 'ai',
    title: 'AI Agents vs RAG: What Is the Real Difference?',
    seoTitle: 'AI Agents vs RAG: What Each System Actually Does',
    description: 'A practical comparison of AI agents and RAG: retrieval, tools, planning, memory, failure modes, costs and when to combine both.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['AI Agents','RAG','Architecture'],
    keywords: 'ai agents vs rag, agentic ai, rag vs agents, ai architecture',
    hero: 'RAG gives a model evidence. Agents give a model a way to act.',
    body: '',
    faq: [
      ['Is an AI agent just RAG with extra steps?', 'Often, in practice — many products marketed as agents are RAG with a single decision step added. A true agent re-plans after each action in a loop rather than executing one fixed sequence.'],
      ['Can RAG and agents be combined?', 'Yes, and it is the most common production pattern — retrieval becomes one tool an agent can call as part of a longer, adaptable plan.'],
      ['Why do agents fail more often than RAG systems?', 'Every additional tool call and planning step is another point where the system can choose the wrong action, misinterpret a result, or fail to terminate — failures compound across the loop.']
    ]
  },
  {
    slug: 'llm-inference-optimization',
    category: 'ai',
    title: 'LLM Inference Optimization: Latency, Throughput and Memory',
    seoTitle: 'LLM Inference Optimization: Reduce Latency and Memory',
    description: 'Learn the core levers for faster LLM inference: quantization, batching, KV cache, context length, speculative decoding and model choice.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['LLM','Inference','Performance'],
    keywords: 'llm inference optimization, kv cache, quantization, llm latency',
    hero: 'Inference performance is mostly memory movement, context management and careful batching.',
    body: '',
    faq: [
      ['Why is LLM inference considered a memory problem?', 'Generating each token requires moving model weights and the KV cache through memory bandwidth, which is typically the bottleneck rather than raw compute throughput.'],
      ['Does quantization hurt output quality?', 'Some, but modern INT4 methods keep the loss small enough that it is now a reasonable production default, not just a hobbyist compromise, for many use cases.'],
      ['Why does batching increase latency for individual requests?', 'A request inside a larger batch may wait longer for its turn to be processed, even though the batch as a whole completes more total work per unit of time.']
    ]
  },
  {
    slug: 'prompt-engineering-for-production',
    category: 'ai',
    title: 'Prompt Engineering for Production AI Systems',
    seoTitle: 'Prompt Engineering for Production AI: Patterns That Hold Up',
    description: 'Move beyond clever prompts with production patterns for instructions, structured outputs, examples, failure handling, evaluation and prompt versioning.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['Prompt Engineering','LLM','Evaluation'],
    keywords: 'prompt engineering production, structured output, llm prompts, prompt evaluation',
    hero: 'A production prompt is an interface contract, not a magic sentence.',
    body: '',
    faq: [
      ['Why use structured output instead of asking for JSON in the prompt text?', 'A native structured-output or function-calling mode is enforced at generation time, while asking for JSON in plain instructions is just a request the model can still deviate from under pressure.'],
      ['Do examples work better than detailed instructions?', 'For format and edge-case handling, usually yes — a well-chosen example demonstrates the desired pattern more reliably than prose instructions, especially for cases the instructions did not anticipate.'],
      ['How do I know if a prompt change is actually an improvement?', 'Run it against a fixed evaluation set of 20-50 representative cases and compare results to the previous version — a prompt that "feels better" on a few manual tests is not reliable evidence.']
    ]
  },
  {
    slug: 'technical-seo-for-ai-websites',
    category: 'ai',
    title: 'Technical SEO for AI Websites: Crawlability, Canonicals and Sitemaps',
    seoTitle: 'Technical SEO for AI Websites: Crawlability, Canonicals, Robots and Sitemaps',
    description: 'A developer-focused technical SEO checklist for AI and tech sites covering crawlability, canonical URLs, robots.txt, sitemaps, internal links and indexing diagnostics.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['SEO','Technical SEO','AI'],
    keywords: 'technical seo ai website, robots txt sitemap canonical, crawlability',
    hero: 'Good technical SEO makes it easy for search engines to understand what exists, what matters and which URL is canonical.',
    body: '',
    faq: [
      ['Does robots.txt block search engines from indexing a page?', 'Not directly — it discourages crawling, but a disallowed page can still be indexed if other sites link to it. Use a noindex meta tag to prevent indexing specifically.'],
      ['Should I list AI crawlers like GPTBot separately in robots.txt?', 'Yes — AI-search and answer-engine crawlers read robots.txt independently from traditional search engines, so a wildcard rule intended for Googlebot may not cover them as expected.'],
      ['Why would indexed pages suddenly drop?', 'The most common causes are an overly broad robots.txt disallow, an accidental sitewide noindex tag, or a canonical tag pointing away from the pages in question.']
    ]
  },
  {
    slug: 'internal-linking-for-topical-authority',
    category: 'ai',
    title: 'Internal Linking for Topical Authority',
    seoTitle: 'Internal Linking for Topical Authority: Build Better Content Clusters',
    description: 'A practical internal-linking framework for building topical authority: pillar pages, supporting articles, anchor text, click depth and link maintenance.',
    date: '2026-09-13',
    updated: '2026-09-18',
    read: 7,
    tags: ['SEO','Internal Linking','Content Strategy'],
    keywords: 'internal linking topical authority, content clusters, internal links seo',
    hero: 'Internal links turn individual articles into a topic system that crawlers and readers can navigate.',
    body: '',
    faq: [
      ['What is a pillar page?', 'A broad overview page for a topic that links out to every supporting article in that cluster, aggregating and distributing topical authority across the group.'],
      ['Why does anchor text matter for SEO?', 'Descriptive anchor text tells both readers and crawlers what the linked page is about, reinforcing the same topical signal as the destination page\'s own title and headings — generic anchors like "click here" carry none of that.'],
      ['What is click depth and why does it matter?', 'It is the number of clicks needed to reach a page from the homepage via internal links. Pages several clicks deep tend to be crawled less often and inherit less authority through the link graph.']
    ]
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
function head({ title, description, canonical, base, theme, keywords = '', jsonld = [], noindex = false, ogType = 'website', published = '', modified = '' }) {
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
<meta property="og:type" content="${ogType}">
${ogType === 'article' ? `<meta property="article:published_time" content="${published}">\n<meta property="article:modified_time" content="${modified || published}">\n<meta property="article:author" content="${esc(SITE.author)}">` : ''}
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
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE.url}/assets/img/og-${theme}.png">
<meta name="twitter:image:alt" content="${esc(SITE.name)} — ${esc(SITE.tagline)}">
<meta name="twitter:creator" content="${SITE.twitter}">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="${base}favicon.ico" sizes="any">
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="${base}assets/img/icon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${base}assets/img/icon-180.png">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${SITE.name} feed" href="${SITE.url}/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"></noscript>
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
      ${link('paths.html', 'Paths', 'paths')}
      ${link('topics.html', 'Topics', 'topics')}
      ${link('blog/index.html', 'Blog', 'blog')}
      ${link('about.html', 'About', 'about')}
      <button class="cmd-btn" type="button" data-command aria-label="Open command palette"><span>⌘</span>K</button>
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
    <div><h4>Explore</h4><ul>
      <li><a href="${base}paths.html">Learning paths</a></li>
      <li><a href="${base}topics.html">Topics</a></li>
    </ul></div>
    <div><h4>Library</h4><ul>
      <li><a href="${base}tech.html">Tech</a></li>
      <li><a href="${base}ai.html">AI</a></li>
      <li><a href="${base}blog/index.html">All posts</a></li>
      <li><a href="${base}about.html">About</a></li>
    </ul></div>
    <div><h4>Popular topics</h4><ul>
      ${[...new Set(POSTS.flatMap((p) => p.tags))].slice(0, 5).map((t) => `<li>${esc(t)}</li>`).join('')}
    </ul></div>
  </div>
  <div class="wrap" style="margin-top:2rem;font-size:.82rem">© ${new Date().getFullYear()} ${SITE.name}. Built as a static site — ${SITE.tagline}</div>
</footer>
<div class="cmd-palette" data-palette hidden>
  <div class="cmd-palette__backdrop" data-command-close></div>
  <div class="cmd-palette__dialog" role="dialog" aria-modal="true" aria-labelledby="cmd-title">
    <div class="cmd-palette__head"><div><b id="cmd-title">StackSignal command palette</b><span>Search pages, paths and actions</span></div><button type="button" data-command-close aria-label="Close">Esc</button></div>
    <div class="cmd-palette__search"><span>⌘K</span><input type="search" data-command-input placeholder="Try “RAG”, “paths” or “saved”" autocomplete="off"></div>
    <div class="cmd-palette__list" data-command-list></div>
  </div>
</div>
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
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE.url}/${c.slug}.html` },
        { '@type': 'ListItem', position: 3, name: p.title, item: url }
      ]
    }
  ];
  if (p.faq?.length) jsonld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  });

  // Paragraph cards are applied automatically by .prose > p in style.css, so every new post inherits the same treatment.
  const base = p.seoTitle || p.title;
  const titleTag = (base + ' | ' + SITE.name).length <= 60 ? base + ' | ' + SITE.name : base;
  return `${head({ title: titleTag, description: p.description, canonical: postUrl(p), base: '../', theme: c.theme, keywords: p.keywords, jsonld, ogType: 'article', published: p.date, modified: p.updated || p.date })}
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
        <button class="save-btn" type="button" data-save="${postUrl(p)}" aria-pressed="false">☆ Save</button>
      </div>
      <div class="article-path"><strong>Suggested path:</strong> ${c.name === 'AI' ? 'AI Systems' : 'Performance Engineering'} · <a href="../paths.html">View path →</a></div>
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

      return `${head({ title: `${SITE.name} — Practical Tech & AI Guides for Engineers`, description: SITE.description, canonical: '', base: './', theme: 'default', keywords: 'tech blog, ai blog, web performance, llm guides, seo, core web vitals', jsonld })}
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
      <div class="sec-head"><div><span class="eyebrow">05 — Fresh signals</span><h2>Latest updates</h2><p>The newest four posts, always — rendered from <code>search-index.json</code> at load.</p></div><a class="btn" href="./blog/index.html">All posts</a></div>
      <div class="grid" data-feed="" data-limit="4">${sorted.slice(0, 4).map((p) => cardOf(p, './')).join('')}</div>
    </div>
  </section>
  <section class="platform-band"><div class="wrap platform-band__grid"><div><span class="eyebrow">06 — Learn by system</span><h2>Turn reading into a connected learning path.</h2><p>Follow a useful sequence, explore connected topics, then save the guides you want to revisit.</p></div><div class="feature-links"><a href="./paths.html"><b>Learning paths</b><span>Read in a useful order →</span></a><a href="./topics.html"><b>Topic map</b><span>Find connected guides →</span></a><a href="./blog/index.html"><b>Article library</b><span>Browse every guide →</span></a></div></div></section>
  <section><div class="wrap"><div class="sec-head"><div><span class="eyebrow">07 — The StackSignal loop</span><h2>Learn → Build → Measure → Ship</h2><p>A compact workflow for turning one article into a working engineering habit.</p></div></div><div class="loop-grid"><div class="loop-card"><b>01</b><h3>Learn</h3><p>Understand the constraint and the failure mode.</p></div><div class="loop-card"><b>02</b><h3>Build</h3><p>Copy the pattern into a small test project.</p></div><div class="loop-card"><b>03</b><h3>Measure</h3><p>Use real numbers, not intuition, to validate it.</p></div><div class="loop-card"><b>04</b><h3>Ship</h3><p>Keep the trade-off that survives production.</p></div></div></div></section>
</main>
${footer('./')}`;
}

/* ===== 8.5. LEARNING PLATFORM PAGES ===================================== */
const PATHS = [
  { slug:'performance', level:'Intermediate', title:'Performance Engineering', description:'Diagnose slow pages, reduce main-thread work and make static sites fast on real devices.', steps:['core-web-vitals-checklist-2026','browser-rendering-explained','image-optimization-for-web','cut-javascript-bundle-size','caching-and-cdn-strategies'], skills:['Core Web Vitals','rendering','images','bundle budgets','caching','measurement'] },
  { slug:'ai-systems', level:'Intermediate', title:'AI Systems Engineering', description:'Move from model choice to retrieval architecture and local inference without skipping production constraints.', steps:['rag-vs-fine-tuning','embeddings-explained','vector-databases-explained','ai-agents-vs-rag','local-llm-8gb-vram-setup','llm-inference-optimization','prompt-engineering-for-production'], skills:['RAG','embeddings','agents','local LLMs','inference','prompt design'] },
  { slug:'search', level:'Foundations', title:'Search & AI Visibility', description:'Build topic authority, structure content for modern search and connect SEO work to technical execution.', steps:['ai-seo-topical-authority','technical-seo-for-ai-websites','internal-linking-for-topical-authority','core-web-vitals-checklist-2026'], skills:['topical authority','internal linking','technical SEO','AI search','performance'] }
];
const getPostsBySlugs = (slugs) => slugs.map((slug)=>sorted.find((p)=>p.slug===slug)).filter(Boolean);
const pathDuration = (slugs) => { const posts = getPostsBySlugs(slugs); const minutes = posts.reduce((sum,p)=>sum+p.read,0); const rounded = Math.max(10, Math.round((minutes*1.25)/5)*5); return `${posts.length} articles · ~${rounded}m`; };
function pathsPage(){ const jsonld=[{'@context':'https://schema.org','@type':'CollectionPage',name:'StackSignal Learning Paths',url:`${SITE.url}/paths.html`}]; return `${head({title:`Learning Paths — Tech, AI & Performance | ${SITE.name}`,description:'Structured learning paths across performance engineering, AI systems and search.',canonical:'paths.html',base:'./',theme:'default',jsonld})}${header('./','paths')}<main id="main"><section class="hero hero--platform"><canvas class="hero__canvas" data-shape="network" aria-hidden="true"></canvas><div class="wrap hero__in"><span class="kicker">LEARNING SYSTEM · 03 PATHS</span><h1>Pick a path. <span class="grad">Build real skill.</span></h1><p class="lede">StackSignal is evolving from a blog into a connected engineering library: focused guides and production-minded learning paths.</p><div class="cta-row"><a class="btn btn--primary" href="#paths">Explore paths</a></div></div></section><section id="paths"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">01 — Choose your route</span><h2>Three tracks, one engineering mindset</h2><p>Read the existing guides in a useful sequence instead of browsing randomly.</p></div></div><div class="path-grid">${PATHS.map((x,i)=>`<article class="path-card reveal path-card--${i+1}"><div class="path-card__top"><span class="path-num">0${i+1}</span><span class="badge">${x.level}</span><span class="path-time">${pathDuration(x.steps)}</span></div><h3>${x.title}</h3><p>${esc(x.description)}</p><div class="chip-row">${x.skills.map(t=>`<span>${esc(t)}</span>`).join('')}</div><ol class="path-steps">${getPostsBySlugs(x.steps).map((p,j)=>`<li><span>${j+1}</span><a href="./${postUrl(p)}">${esc(p.title)}</a></li>`).join('')}</ol><a class="btn btn--primary" href="./${postUrl(getPostsBySlugs(x.steps)[0])}">Start path →</a></article>`).join('')}</div></div></section><section class="platform-band"><div class="wrap platform-band__grid"><div><span class="eyebrow">02 — Learn → Build → Measure → Ship</span><h2>Every page should leave you with something you can test.</h2></div><div class="steps-row"><div><b>Learn</b><span>Understand the constraint</span></div><div><b>Build</b><span>Copy the pattern</span></div><div><b>Measure</b><span>Use real signals</span></div><div><b>Ship</b><span>Keep the trade-off</span></div></div></div></section></main>${footer('./')}`; }
function topicsPage(){ const groups=[['AI Systems',['RAG','LLM','Embeddings','Vector Database','AI Agents','Local LLM','Prompt Engineering']],['Web Engineering',['Performance','Core Web Vitals','JavaScript','Browser','Images','Caching']],['Search & Visibility',['SEO','Technical SEO','Internal Linking','AI','Content Strategy']]]; const cards=groups.map(([name,tags])=>`<section class="topic-group"><div class="topic-group__head"><span class="eyebrow">Topic hub</span><h2>${name}</h2><p>Follow the thread across related guides.</p></div><div class="topic-grid">${tags.map(tag=>{const matches=sorted.filter(p=>p.tags.some(t=>t.toLowerCase()===tag.toLowerCase()||t.toLowerCase().includes(tag.toLowerCase()))).slice(0,3);return `<article class="topic-card reveal"><div class="topic-card__icon">${tag.slice(0,1)}</div><h3>${esc(tag)}</h3><span>${matches.length} ${matches.length===1?'guide':'guides'}</span><div>${matches.map(p=>`<a href="./${postUrl(p)}">${esc(p.title)}</a>`).join('')}</div></article>`;}).join('')}</div></section>`).join(''); return `${head({title:`Topics — AI, Performance & Search | ${SITE.name}`,description:'Browse StackSignal topics by engineering theme.',canonical:'topics.html',base:'./',theme:'default',jsonld:[{'@context':'https://schema.org','@type':'CollectionPage',name:'StackSignal Topics',url:`${SITE.url}/topics.html`}]})}${header('./','topics')}<main id="main"><section class="hero hero--compact"><canvas class="hero__canvas" data-shape="grid" aria-hidden="true"></canvas><div class="wrap hero__in"><span class="kicker">TOPIC MAP</span><h1>Browse by <span class="grad">engineering problem.</span></h1><p class="lede">No giant taxonomy. Just the concepts that connect your current StackSignal guides.</p>${searchBox('','Search the topic library…')}</div></section><div class="wrap topics-wrap">${cards}</div></main>${footer('./')}`; }
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
  const newest = (list) => list.map((p) => p.updated || p.date).sort().pop() || new Date().toISOString().slice(0, 10);
  const hubDate = { '': newest(sorted), 'tech.html': newest(inCat('tech')), 'ai.html': newest(inCat('ai')), 'blog/index.html': newest(sorted), 'paths.html': newest(sorted), 'topics.html': newest(sorted) };
  const urls = [
    ['', '1.0', 'weekly'], ['tech.html', '0.9', 'weekly'], ['ai.html', '0.9', 'weekly'],
    ['paths.html', '0.7', 'monthly'], ['topics.html', '0.7', 'monthly'],
    ['blog/index.html', '0.8', 'weekly'], ['about.html', '0.4', 'yearly'],
    ...sorted.map((p) => [postUrl(p), '0.8', 'monthly'])
  ];
  const lastmod = (u) => (sorted.find((p) => postUrl(p) === u)?.updated) || hubDate[u] || new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr, cf]) => `  <url><loc>${SITE.url}/${u}</loc><lastmod>${lastmod(u)}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>`;
};

const robots = () => `User-agent: *
Allow: /
Disallow: /404.html

# Generative / AI search crawlers — explicitly welcomed for citation visibility
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
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
written.push(await w('paths.html', pathsPage()));
written.push(await w('topics.html', topicsPage()));
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
