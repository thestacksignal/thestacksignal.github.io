// ---------------------------------------------------------------------------
// offline.mjs — turns /dist into /dist-offline that runs from file:// with
// zero network: search index inlined as a script, web fonts dropped.
// Run:  node build.mjs && node offline.mjs
// ---------------------------------------------------------------------------
import { cp, rm, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'dist', OUT = 'dist-offline';

await rm(OUT, { recursive: true, force: true });
await cp(SRC, OUT, { recursive: true });

// 1. Inline the search index so no fetch() is needed on file://
const index = await readFile(path.join(SRC, 'search-index.json'), 'utf8');
await writeFile(path.join(OUT, 'assets/js/search-data.js'),
  `/* Offline build: search index inlined (no fetch needed on file://) */\nwindow.SEARCH_INDEX = ${index};\n`);

// 2. Walk every HTML file and strip network dependencies
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}

const files = (await walk(OUT)).filter((f) => f.endsWith('.html'));
let patched = 0;

for (const f of files) {
  let s = await readFile(f, 'utf8');
  const base = s.match(/window\.SITE_BASE="(.*?)"/)?.[1] || './';

  s = s
    // drop Google Fonts (preconnect + preload + stylesheet) -> system font stack takes over
    .replace(/<link rel="preconnect"[^>]*>\n?/g, '')
    .replace(/<link rel="preload" as="style" href="https:\/\/fonts[^>]*>\n?/g, '')
    .replace(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>\n?/g, '')
    // load the inlined index before app.js
    .replace(/<script src="([^"]*)assets\/js\/app\.js" defer><\/script>/,
      `<script src="$1assets/js/search-data.js" defer></script>\n<script src="$1assets/js/app.js" defer></script>`);

  if (!s.includes('search-data.js')) {
    s = s.replace('</body>', `<script src="${base}assets/js/search-data.js" defer></script>\n</body>`);
  }
  await writeFile(f, s);
  patched++;
}

const bytes = async (p) => (await stat(p)).size;
console.log(`✓ Offline build ready in /${OUT}`);
console.log(`  ${patched} pages de-networked · index inlined (${(await bytes(path.join(OUT, 'assets/js/search-data.js')) / 1024).toFixed(1)}KB)`);
console.log('  Open dist-offline/index.html directly — no server, no internet.');
