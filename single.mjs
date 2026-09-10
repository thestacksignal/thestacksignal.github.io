// ---------------------------------------------------------------------------
// single.mjs — folds the whole site into ONE portable .html file.
// CSS + JS + search index + all 12 pages inlined; hash router swaps views
// and themes. Opens from file:// with no server and no internet.
// Run:  node build.mjs && node single.mjs   ->  StackSignal-website.html
// ---------------------------------------------------------------------------
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const D = 'dist';
const read = (p) => readFile(path.join(D, p), 'utf8');
const main = (s) => (s.match(/<main id="main">([\s\S]*?)<\/main>/) || [, ''])[1];
const title = (s) => (s.match(/<title>([\s\S]*?)<\/title>/) || [, 'StackSignal'])[1];

const css = await read('assets/css/style.css');
const appJs = await read('assets/js/app.js');
const heroJs = await read('assets/js/hero3d.js');
const index = JSON.parse(await read('search-index.json'));

/* ---- rewrite every internal link into a hash route --------------------- */
const slugs = new Set(index.map((p) => p.url.replace(/^blog\//, '').replace(/\.html$/, '')));
function rw(html) {
  return html
    .replace(/href="(?:\.\.?\/)*blog\/index\.html"/g, 'href="#all"')
    .replace(/href="(?:\.\.?\/)*blog\/([a-z0-9-]+)\.html"/g, 'href="#post-$1"')
    .replace(/href="(?:\.\.?\/)*index\.html"/g, 'href="#home"')
    .replace(/href="(?:\.\.?\/)*tech\.html"/g, 'href="#tech"')
    .replace(/href="(?:\.\.?\/)*ai\.html"/g, 'href="#ai"')
    .replace(/href="(?:\.\.?\/)*about\.html"/g, 'href="#about"')
    .replace(/href="(?:\.\.?\/)*(?:sitemap\.xml|rss\.xml)"/g, 'href="#home"')
    // sibling links inside article bodies, e.g. href="./rag-vs-fine-tuning.html"
    .replace(/href="\.\/([a-z0-9-]+)\.html"/g, (m, s) => (slugs.has(s) ? `href="#post-${s}"` : m));
}

/* ---- collect every page as a view ------------------------------------- */
const views = [];
const push = async (id, file, theme) => {
  const src = await read(file);
  views.push({ id, theme, title: title(src), html: rw(main(src)) });
};

await push('home', 'index.html', 'default');
await push('tech', 'tech.html', 'tech');
await push('ai', 'ai.html', 'ai');
await push('all', 'blog/index.html', 'default');
await push('about', 'about.html', 'default');
await push('404', '404.html', 'default');
for (const p of index) {
  await push('post-' + p.url.replace(/^blog\//, '').replace(/\.html$/, ''), p.url, p.categorySlug);
}

/* ---- search index: point results at hash routes ----------------------- */
const hashIndex = index.map((p) => ({ ...p, url: '#post-' + p.url.replace(/^blog\//, '').replace(/\.html$/, '') }));

const routeMeta = Object.fromEntries(views.map((v) => [v.id, { t: v.title, th: v.theme }]));

const logo = `<a class="logo" href="#home" aria-label="StackSignal home">
  <span class="logo__mark" aria-hidden="true"><span class="logo__cube"><span class="logo__face"></span><span class="logo__face"></span><span class="logo__face"></span></span></span>
  <span class="logo__txt">StackSignal<small>Tech &amp; AI</small></span>
</a>`;

const html = `<!DOCTYPE html>
<html lang="en" data-theme="default">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>StackSignal — Tech &amp; AI Blog (offline single-file build)</title>
<meta name="description" content="StackSignal: practical engineering and AI guides. Portable single-file build — runs from file:// with no server and no internet.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#07080d">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2307080d'/%3E%3Ccircle cx='32' cy='32' r='7' fill='%236ee7ff'/%3E%3C/svg%3E">
<style>
${css}
/* ---- single-file router additions ---- */
.view[hidden]{ display:none !important; }
.sf-note{ position:fixed; left:50%; bottom:1rem; transform:translateX(-50%); z-index:75;
  background:rgba(11,14,23,.94); border:1px solid var(--line); color:var(--muted);
  font-size:.76rem; padding:.45rem .8rem; border-radius:99px; display:flex; gap:.6rem; align-items:center; }
.sf-note b{ color:var(--accent); }
.sf-note button{ background:none; border:0; color:var(--muted-2); cursor:pointer; font:inherit; padding:0 .1rem; }
@media (max-width:560px){ .sf-note{ display:none; } }
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>

<header class="hdr">
  <div class="wrap hdr__in">
    ${logo}
    <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    <nav class="nav" id="nav" aria-label="Primary">
      <a href="#home" data-route="home">Home</a>
      <a href="#tech" data-route="tech">Tech</a>
      <a href="#ai" data-route="ai">AI</a>
      <a href="#all" data-route="all">All posts</a>
      <a href="#about" data-route="about">About</a>
    </nav>
  </div>
</header>

<main id="main">
${views.map((v) => `<div class="view" id="view-${v.id}" hidden>\n${v.html}\n</div>`).join('\n')}
</main>

<footer class="foot">
  <div class="wrap foot__grid">
    <div>${logo}<p style="margin-top:.8rem">Practical engineering and AI guides — performance, architecture, LLMs and applied machine learning.</p></div>
    <div><h4>Categories</h4><ul><li><a href="#tech">Tech</a></li><li><a href="#ai">AI</a></li><li><a href="#all">All posts</a></li></ul></div>
    <div><h4>Site</h4><ul><li><a href="#about">About</a></li><li><a href="#404">404 page</a></li></ul></div>
    <div><h4>Build</h4><ul><li>Single-file offline preview</li><li>No server · no internet</li></ul></div>
  </div>
  <div class="wrap" style="margin-top:2rem;font-size:.82rem">© ${new Date().getFullYear()} StackSignal — Tech &amp; AI, decoded.</div>
</footer>

<button class="to-top" type="button" aria-label="Scroll back to top" title="Back to top">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
</button>

<div class="sf-note" id="sfnote">Single-file offline build · <b>press /</b> to search <button type="button" aria-label="Dismiss" onclick="document.getElementById('sfnote').remove()">✕</button></div>

<script>
window.SITE_BASE = '';
window.SEARCH_INDEX = ${JSON.stringify(hashIndex)};
window.ROUTES = ${JSON.stringify(routeMeta)};
</script>
<script>
${appJs}
</script>
<script>
${heroJs}
</script>
<script>
/* ---- hash router: swaps view + theme, keeps 3D and reveals working ---- */
(function () {
  var views = {}, def = 'home';
  Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) {
    views[v.id.replace('view-', '')] = v;
  });

  function go() {
    var id = (location.hash || '#' + def).slice(1);
    if (!views[id]) id = '404';
    for (var k in views) views[k].hidden = (k !== id);

    var meta = window.ROUTES[id] || { t: 'StackSignal', th: 'default' };
    document.documentElement.setAttribute('data-theme', meta.th);
    document.title = meta.t;

    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
      var r = a.getAttribute('data-route');
      var on = r === id || (id.indexOf('post-') === 0 && r === meta.th);
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });

    if (window.HERO3D) window.HERO3D.refresh();
    if (window.SS && window.SS.enhance) window.SS.enhance(views[id]);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  window.addEventListener('hashchange', go);
  go();
})();
</script>
</body>
</html>`;

const OUTFILE = 'StackSignal-website.html';
await writeFile(OUTFILE, html);
const kb = ((await stat(OUTFILE)).size / 1024).toFixed(0);
console.log(`✓ ${OUTFILE} — ${kb}KB, ${views.length} views in one file`);
console.log('  Double-click it. No server, no internet, no other files needed.');
