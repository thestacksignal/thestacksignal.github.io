# StackSignal — Tech & AI blog (SEO practice rig)

A dependency-free static blog generator + front end. One content file → HTML pages, search index, sitemap, RSS, schema.org markup.

```
stacksignal/
├── build.mjs                 # generator + ALL content (POSTS array) + config (SITE)
├── src/assets/
│   ├── css/style.css         # design system, both category themes
│   └── js/app.js             # nav, search, latest feed, scroll-top, logo, tilt, progress
│       hero3d.js             # canvas 3D engine (no WebGL library)
└── dist/                     # BUILD OUTPUT → deploy this folder
```

## Run it

```bash
node build.mjs            # build into /dist
npx serve dist            # or: python3 -m http.server -d dist 8080
```

No `npm install`. Node 18+ only.

## Before you deploy (2 minutes)

1. `build.mjs` → `SITE.url` = your real domain (used by canonical, OG, sitemap, RSS, schema).
2. `SITE.name`, `tagline`, `twitter`, `author` → yours.
3. Rebuild: `node build.mjs`.

## Deploy

| Host | Steps |
|---|---|
| **Netlify** | drag `dist/` into the dashboard, or connect the repo (`netlify.toml` included) |
| **Vercel** | import repo — `vercel.json` sets build + clean URLs |
| **Cloudflare Pages** | build `node build.mjs`, output dir `dist` |
| **GitHub Pages** | push `dist/` to `gh-pages` branch |

`_headers` ships long-lived caching for `/assets/*` and no-cache for HTML — that plus static output is what keeps Core Web Vitals green.

## Add a post (the only workflow you need)

Append an object to `POSTS` in `build.mjs`:

```js
{
  slug: 'my-post-url',            // becomes /blog/my-post-url.html
  category: 'tech',               // 'tech' | 'ai'
  title: 'Card + H1 title',
  seoTitle: 'Title tag ≤ 60 chars',
  description: '70–160 char meta description with the target keyword.',
  date: '2026-09-12', updated: '2026-09-12', read: 7,
  tags: ['Performance'], keywords: 'primary keyword, secondary keyword',
  hero: 'One-line lede under the H1.',
  body: `<h2>Section</h2><p>HTML body…</p>`,
  faq: [['Question?', 'Answer.']]   // optional → emits FAQPage schema
}
```

Rebuild and the post automatically appears in: its category page, `/blog/`, the **Latest updates** feed (max 4), search index, sitemap, RSS and internal-link graph.

## What is already SEO-complete

- Unique title + meta description + canonical on every page; `noindex` only on 404.
- Open Graph + Twitter cards with generated 1200×630 images per theme.
- Schema: `WebSite` + `SearchAction`, `Organization`, `BlogPosting`, `BreadcrumbList`, `CollectionPage`, `Blog`, `FAQPage`, `AboutPage`, `ItemList`.
- Semantic HTML, one H1/page, logical H2→H3, breadcrumbs, descriptive anchors, no orphan pages.
- `sitemap.xml` (lastmod/priority/changefreq), `robots.txt` (+ explicit AI-crawler rules), `rss.xml`.
- Performance: static HTML, one CSS file, ~8KB JS deferred, self-paced canvas that pauses off-screen, font preload with `media=print` swap trick, DPR capped at 2.
- Accessibility (an engagement/ranking co-factor): skip link, focus-visible rings, ARIA combobox search, `prefers-reduced-motion` support, keyboard nav in results.

## Your ranking playbook

1. **Instrument first** — Search Console + Bing Webmaster; submit `sitemap.xml` on day one.
2. **Cluster, don't scatter** — one narrow topic, a pillar page + 8–12 supporting posts, all interlinked. Two clusters already exist (`Core Web Vitals` / `RAG`); extend those before starting a third.
3. **Target long-tail first** — rank #1 for "run local llm 8gb vram" before chasing "local llm".
4. **Match intent in the first 60 words** of each section — this is what generative search engines quote.
5. **Refresh, don't republish** — bump `updated`, add a new section; freshness compounds.
6. **Measure per cluster** — impressions, average position, CTR by title variant. Rewrite titles that get impressions but no clicks.
7. **Earn one real link per post** — a benchmark, dataset or tool is linkable; an opinion is not.

## Customise fast

- **Themes**: `[data-theme="tech"]` / `[data-theme="ai"]` blocks at the top of `style.css` (accent, glow, background).
- **Hero visual**: `data-shape` on `.hero__canvas` → `grid`, `network`, `globe`.
- **Latest updates count**: `data-limit` on any `[data-feed]` grid (currently 4).
- **Add a category**: add an entry to `CATEGORIES` + point posts at it; nav, panels, sitemap and search scope update themselves.
