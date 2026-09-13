# StackSignal enhancements

Four runtime-only features, borrowed from learnaiengineering.dev and trimmed to fit a blog:

1. Command palette search (Cmd/Ctrl + K) over your existing `search-index.json`
2. Reading progress bar on post pages
3. "On this page" table of contents auto-built from `<h2>` / `<h3>`
4. Copy button on code blocks + "Keep reading" related posts at the end of each article

No generator logic changes. `build.mjs` already copies `src/assets` -> `dist/assets`.

## Install (3 steps)

1. Copy `src/assets/enhance.css` and `src/assets/enhance.js` into your repo at the same path (`src/assets/`).

2. In `build.mjs`, inside the `head` helper, next to the existing stylesheet / manifest lines, add:

   <link rel="stylesheet" href="/assets/enhance.css">

3. In `build.mjs`, inside the `footer` helper, at the very end of its markup (so it lands on every page), add:

   <script src="/assets/enhance.js" defer></script>

Then run your normal build and commit.

## After the first build, check two things

- Open `dist/search-index.json` and confirm the field names are among the ones the
  normalizer understands: title | t | name, url | href | link | slug,
  category | cat | theme, description | desc | excerpt | summary.
  If your keys differ, edit the `norm()` function at the top of `enhance.js`.

- Confirm your category/archive URLs match the `NAV` array in `enhance.js`
  (`/tech.html` vs `/tech/`, etc.).

## Config flags (top of enhance.js)

- `BIND_SLASH` - default `false`. Set to `true` only if `/` is not already bound by your
  header search box, otherwise both will fire.
- `INDEX_URL` - default `/search-index.json`.
- `NAV` - static pages shown in the palette when the query is empty.

## Deliberately not copied

Learning paths, labs, localStorage progress tracking, the animated architecture diagram and
"01 -" section numbering. Those are course-site features and would look empty on a 7-post blog.

## Notes

- All CSS is scoped to `#ss-progress` and `.ss-*` classes, so it cannot collide with your
  existing styles.
- The palette uses `prefers-color-scheme` for light mode; everything else inherits
  `currentColor` and works on both themes.
- The TOC only renders when an article has 3 or more headings.
- Copy buttons use `navigator.clipboard`, which requires HTTPS (GitHub Pages is fine).
