(function () {
  'use strict';

  /* --- config: change these if needed --- */
  var BIND_SLASH = false;                 // true only if "/" is NOT already used by your header search
  var INDEX_URL  = '/search-index.json';
  var NAV = [                             // adjust paths to match your generated URLs
    { title: 'Home', url: '/' },
    { title: 'Tech', url: '/tech.html' },
    { title: 'AI', url: '/ai.html' },
    { title: 'All posts', url: '/blog.html' },
    { title: 'About', url: '/about.html' }
  ];

  function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var article = document.querySelector('article');

  function norm(p) {
    return {
      title: p.title || p.t || p.name || '',
      url: p.url || p.href || p.link || (p.slug ? '/' + p.slug + '.html' : ''),
      category: String(p.category || p.cat || p.theme || ''),
      desc: p.description || p.desc || p.excerpt || p.summary || ''
    };
  }

  var postsPromise = fetch(INDEX_URL).then(function (r) { return r.json(); }).then(function (d) {
    var arr = Array.isArray(d) ? d : (d.posts || d.items || d.entries || []);
    return arr.map(norm).filter(function (p) { return p.title && p.url; });
  }).catch(function () { return []; });

  /* ---------- 1. reading progress ---------- */
  if (article) {
    var bar = el('div'); bar.id = 'ss-progress'; document.body.appendChild(bar);
    var tick = function () {
      var r = article.getBoundingClientRect(), total = r.height - window.innerHeight;
      var done = total > 0 ? (-r.top) / total : 0;
      bar.style.width = Math.max(0, Math.min(1, done)) * 100 + '%';
    };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    tick();
  }

  /* ---------- 2. on this page ---------- */
  if (article) {
    var hs = [].slice.call(article.querySelectorAll('h2, h3'));
    if (hs.length >= 3) {
      var slug = function (t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); };
      var d = el('details', 'ss-toc'); d.open = window.innerWidth > 900;
      d.appendChild(el('summary', null, 'On this page'));
      var root = el('ol'), sub = null;
      hs.forEach(function (h) {
        if (!h.id) h.id = slug(h.textContent) || 'section';
        var li = el('li', null, '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>');
        if (h.tagName === 'H2') { root.appendChild(li); sub = null; }
        else {
          if (!sub) { sub = el('ol'); (root.lastElementChild || root).appendChild(sub); }
          sub.appendChild(li);
        }
      });
      d.appendChild(root);
      article.insertBefore(d, hs[0]);
    }
  }

  /* ---------- 3. copy buttons ---------- */
  [].slice.call(document.querySelectorAll('pre')).forEach(function (pre) {
    pre.classList.add('ss-pre');
    var b = el('button', 'ss-copy', 'Copy'); b.type = 'button';
    b.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      navigator.clipboard.writeText(code.innerText).then(function () {
        b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400);
      });
    });
    pre.appendChild(b);
  });

  /* ---------- 4. related posts ---------- */
  if (article) {
    postsPromise.then(function (posts) {
      var here = location.pathname.split('/').pop();
      var cur = posts.filter(function (p) { return p.url.split('/').pop() === here; })[0];
      var others = posts.filter(function (p) { return p.url.split('/').pop() !== here; });
      var pool = cur ? others.filter(function (p) { return p.category === cur.category; }) : others.slice();
      others.forEach(function (p) { if (pool.indexOf(p) < 0) pool.push(p); });
      pool = pool.slice(0, 3);
      if (!pool.length) return;
      var sec = el('section', 'ss-related', '<h2>Keep reading</h2>');
      var ul = el('ul');
      pool.forEach(function (p) {
        ul.appendChild(el('li', null,
          '<a href="' + esc(p.url) + '"><span class="ss-kicker">' + esc(p.category || 'Post') + '</span>' +
          '<strong>' + esc(p.title) + '</strong>' +
          '<span class="ss-desc">' + esc(p.desc) + '</span></a>'));
      });
      sec.appendChild(ul);
      article.appendChild(sec);
    });
  }

  /* ---------- 5. command palette ---------- */
  var pal = el('div', 'ss-pal');
  pal.innerHTML = '<div class="ss-pal-box" role="dialog" aria-label="Search StackSignal">' +
    '<input class="ss-pal-input" type="search" placeholder="Search posts and pages\u2026" autocomplete="off">' +
    '<ul class="ss-pal-list" role="listbox"></ul>' +
    '<div class="ss-pal-foot"><span>\u2191\u2193 navigate</span><span>\u21B5 open</span><span>esc close</span></div></div>';
  document.body.appendChild(pal);

  var input = pal.querySelector('.ss-pal-input');
  var list = pal.querySelector('.ss-pal-list');
  var rows = [], sel = 0;

  function render(items) {
    rows = items; sel = 0; list.innerHTML = '';
    items.forEach(function (p, i) {
      var li = el('li', null, '<span class="ss-kicker">' + esc(p.category || 'Page') + '</span> ' + esc(p.title));
      li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      li.addEventListener('mouseenter', function () { sel = i; paint(); });
      li.addEventListener('click', function () { location.href = p.url; });
      list.appendChild(li);
    });
  }
  function paint() {
    [].slice.call(list.children).forEach(function (li, i) {
      li.setAttribute('aria-selected', i === sel ? 'true' : 'false');
      if (i === sel) li.scrollIntoView({ block: 'nearest' });
    });
  }
  function search(q) {
    postsPromise.then(function (posts) {
      var all = posts.concat(NAV.map(norm));
      q = q.trim().toLowerCase();
      render(!q ? all.slice(0, 8) : all.filter(function (p) {
        return (p.title + ' ' + p.desc + ' ' + p.category).toLowerCase().indexOf(q) > -1;
      }).slice(0, 8));
    });
  }
  function open() { pal.dataset.open = '1'; input.value = ''; search(''); input.focus(); }
  function close() { pal.dataset.open = '0'; }

  input.addEventListener('input', function () { search(input.value); });
  pal.addEventListener('click', function (e) { if (e.target === pal) close(); });
  addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); return open(); }
    if (BIND_SLASH && e.key === '/' && !typing && pal.dataset.open !== '1') { e.preventDefault(); return open(); }
    if (pal.dataset.open !== '1') return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, rows.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (e.key === 'Enter' && rows[sel]) { location.href = rows[sel].url; }
  });
})();
