# View the site without internet

## Fastest: just double-click

```
stacksignal/dist-offline/index.html
```

Open that file in Chrome, Edge, Firefox or Safari. **No server, no internet, no install.**
Everything works: both category themes, the 3D visuals, the interactive logo, search,
Latest updates, scroll-to-top, and all 6 articles.

Address bar will read something like:
`file:///C:/Users/Shaurya/Downloads/stacksignal/dist-offline/index.html`

### What the offline build changes
- Google Fonts request removed → falls back to your system UI font (Segoe UI / SF / Roboto).
- Search index inlined into `assets/js/search-data.js` → no `fetch()` needed.
- Nothing else differs; `dist/` remains the build you deploy to a real domain.

## Better preview: local server (identical to production)

`file://` blocks `fetch()`, so use a server if you want to preview the exact
production build in `dist/` (Inter font + fetched JSON index):

```bash
cd stacksignal

# any ONE of these:
python3 -m http.server 8080 -d dist      # Python (preinstalled on mac/Linux)
npx --yes serve dist                     # Node (needs internet once)
php -S localhost:8080 -t dist            # PHP
```

Then open <http://localhost:8080>. A local server needs **no internet** — it only
serves files from your own disk. This is the recommended way to test SEO/Lighthouse.

## Regenerate after editing content

```bash
node build.mjs      # rebuild dist/
node offline.mjs    # refresh dist-offline/ from dist/
```

## Mobile check without a phone

Open the site, press <kbd>F12</kbd> → the device-toolbar icon (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>),
pick iPhone or Pixel. The burger nav, centred 3D visual and stacked cards all switch over at 820px.

## Test it on your real phone (still no public internet)

With the laptop and phone on the same Wi-Fi:

1. Find your laptop IP — `ipconfig` (Windows) or `ifconfig | grep inet` (mac/Linux), e.g. `192.168.1.7`.
2. Run `python3 -m http.server 8080 -d dist`.
3. On the phone browse to `http://192.168.1.7:8080`.
