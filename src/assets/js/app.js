/* =========================================================================
   StackSignal — UI behaviour (~5KB, no dependencies, deferred)
   Handles: nav, instant search, latest-updates feed, scroll-to-top,
            interactive logo, card tilt, reveal-on-scroll, read progress.
   ========================================================================= */
(function () {
  'use strict';
  var BASE = window.SITE_BASE || './';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. Header + mobile nav ------------------------------------ */
  var hdr = $('.hdr'), nav = $('.nav'), burger = $('.burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }
  var onScroll = function () {
    if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 8);
    var top = $('.to-top');
    if (top) top.classList.toggle('show', window.scrollY > 420);
    var bar = $('.progress');
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Scroll to top ------------------------------------------ */
  var toTop = $('.to-top');
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- 3. Interactive logo --------------------------------------- */
  $$('.logo').forEach(function (logo) {
    var cube = $('.logo__cube', logo);
    logo.addEventListener('click', function () {
      if (!cube || reduce) return;
      cube.classList.remove('spin');
      void cube.offsetWidth;              // restart animation
      cube.classList.add('spin');
    });
    if (!reduce) logo.addEventListener('pointermove', function (e) {
      if (!cube) return;
      var r = logo.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      cube.style.transform = 'rotateX(' + (-22 - y * 26) + 'deg) rotateY(' + (28 + x * 46) + 'deg)';
    });
    logo.addEventListener('pointerleave', function () { if (cube) cube.style.transform = ''; });
  });

  /* ---------- 4. Search index (shared, fetched once) -------------------- */
  var indexPromise = null;
  function getIndex() {
    if (!indexPromise) {
      if (window.SEARCH_INDEX) return (indexPromise = Promise.resolve(window.SEARCH_INDEX));
      if (location.protocol === 'file:') return (indexPromise = Promise.resolve(domIndex()));
      indexPromise = fetch(BASE + 'search-index.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { return (d && d.length) ? d : domIndex(); })
        .catch(function () { return domIndex(); });   // works on file:// too
    }
    return indexPromise;
  }
  // Fallback index built from cards already in the DOM (no fetch available)
  function domIndex() {
    return $('.card h3 a').map(function (a2) {
      var card = a2.closest('.card');
      var badge = card ? $('.badge', card) : null;
      var cat = badge ? badge.textContent.trim() : '';
      return {
        title: a2.textContent.trim(),
        description: card && $('p', card) ? $('p', card).textContent.trim() : '',
        url: a2.getAttribute('href').replace(BASE, ''),
        category: cat, categorySlug: cat.toLowerCase(), tags: [], keywords: '',
        date: '', dateLabel: '', read: ''
      };
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function hl(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0 || !q) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function score(item, terms) {
    var t = (item.title || '').toLowerCase(), d = (item.description || '').toLowerCase(),
        k = ((item.tags || []).join(' ') + ' ' + (item.keywords || '')).toLowerCase(), n = 0;
    terms.forEach(function (term) {
      if (t.indexOf(term) === 0) n += 12;
      else if (t.indexOf(term) > -1) n += 8;
      if (k.indexOf(term) > -1) n += 4;
      if (d.indexOf(term) > -1) n += 2;
    });
    return n;
  }

  /* ---------- 5. Instant search widgets --------------------------------- */
  $$('.search').forEach(function (box) {
    var input = $('input', box), list = $('.search__results', box);
    if (!input || !list) return;
    var scope = box.getAttribute('data-scope') || '';   // '', 'tech' or 'ai'
    var active = -1, items = [];

    function close() { list.classList.remove('open'); list.innerHTML = ''; active = -1; items = []; input.setAttribute('aria-expanded', 'false'); }

    function render(results, q) {
      if (!results.length) {
        list.innerHTML = '<li class="search__empty">No posts match \u201c' + esc(q) + '\u201d. Try “RAG”, “INP” or “SEO”.</li>';
        list.classList.add('open'); return;
      }
      list.innerHTML = results.map(function (p) {
        return '<li><a href="' + BASE + p.url + '"><em>' + esc(p.category) + '</em><strong>' + hl(p.title, q) + '</strong></a></li>';
      }).join('');
      items = $$('li a', list);
      list.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
    }

    var timer;
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 2) { close(); return; }
      timer = setTimeout(function () {
        getIndex().then(function (data) {
          var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
          var res = data
            .filter(function (p) { return !scope || p.categorySlug === scope; })
            .map(function (p) { return { p: p, s: score(p, terms) }; })
            .filter(function (x) { return x.s > 0; })
            .sort(function (a, b) { return b.s - a.s; })
            .slice(0, 6).map(function (x) { return x.p; });
          render(res, q);
        });
      }, 90);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); input.blur(); return; }
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.parentNode.classList.toggle('is-active', i === active); });
        items[active].focus();
      } else if (e.key === 'Enter' && active > -1) {
        e.preventDefault(); items[active].click();
      }
    });

    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
  });

  // "/" focuses the first search input
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      var el = $('.search input'); if (el) { e.preventDefault(); el.focus(); }
    }
  });

  /* ---------- 6. Latest updates feed (max 4) ---------------------------- */
  $$('[data-feed]').forEach(function (feed) {
    var limit = parseInt(feed.getAttribute('data-limit') || '4', 10);
    var fscope = feed.getAttribute('data-feed');           // '', 'tech', 'ai'
    var exclude = feed.getAttribute('data-exclude') || '';
    getIndex().then(function (data) {
      var posts = data
        .filter(function (p) { return (!fscope || p.categorySlug === fscope) && p.url !== exclude; })
        .sort(function (a, b) { return b.date.localeCompare(a.date); })
        .slice(0, limit);
      if (!posts.length) return;
      feed.innerHTML = posts.map(function (p, i) {
        return '<article class="card reveal" style="transition-delay:' + (i * 70) + 'ms">' +
          '<span class="badge badge--' + p.categorySlug + '">' + esc(p.category) + '</span>' +
          '<h3><a href="' + BASE + p.url + '">' + esc(p.title) + '</a></h3>' +
          '<p>' + esc(p.description) + '</p>' +
          '<div class="card__meta"><time datetime="' + p.date + '">' + p.dateLabel + '</time><span aria-hidden="true">\u2022</span><span>' + p.read + ' min read</span></div>' +
          '</article>';
      }).join('');
      enhance(feed);
    });
  });

  /* ---------- 7. Reveal + 3D card tilt ---------------------------------- */
  window.SS = window.SS || {};
  window.SS.enhance = function (r) { enhance(r); };
  function enhance(root) {
    var targets = $$('.reveal', root || document);
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      targets.forEach(function (el) { io.observe(el); });
    } else { targets.forEach(function (el) { el.classList.add('in'); }); }

    if (reduce || window.matchMedia('(hover: none)').matches) return;
    $$('.card', root || document).forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(760px) rotateY(' + x * 6 + 'deg) rotateX(' + -y * 6 + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
  enhance(document);
})();

/* =========================================================================
   ARTICLE ENHANCEMENTS — table of contents, scrollspy, reveal, tables
   ========================================================================= */
(function () {
  'use strict';

  var slugify = function (s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
  };

  function buildToc() {
    var prose = document.querySelector('.prose');
    var host = document.querySelector('[data-toc]');
    if (!prose || !host) return;

    var heads = Array.prototype.slice.call(prose.querySelectorAll('h2'));
    if (heads.length < 3) { host.remove(); return; }

    var used = {};
    var items = heads.map(function (h) {
      if (!h.id) {
        var base = slugify(h.textContent) || 'section';
        used[base] = (used[base] || 0) + 1;
        h.id = used[base] > 1 ? base + '-' + used[base] : base;
      }
      return h;
    });

    var ol = document.createElement('ol');
    items.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ol.appendChild(li);
    });

    var title = document.createElement('p');
    title.className = 'toc__title';
    title.textContent = 'On this page';

    var bar = document.createElement('div');
    bar.className = 'toc__progress';
    var fill = document.createElement('i');
    bar.appendChild(fill);

    host.appendChild(bar);
    host.appendChild(title);
    host.appendChild(ol);

    var links = Array.prototype.slice.call(ol.querySelectorAll('a'));

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var seen = new Map();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null); });
        var visible = items.filter(function (h) {
          var r = h.getBoundingClientRect();
          return r.top < window.innerHeight * 0.4;
        });
        if (visible.length) setActive(visible[visible.length - 1].id);
      }, { rootMargin: '-70px 0px -60% 0px', threshold: [0, 1] });
      items.forEach(function (h) { io.observe(h); });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = prose.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
        fill.style.width = (done * 100).toFixed(1) + '%';
        var visible = items.filter(function (h) { return h.getBoundingClientRect().top < window.innerHeight * 0.4; });
        if (visible.length) setActive(visible[visible.length - 1].id);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function wrapTables() {
    document.querySelectorAll('.prose table').forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains('table-wrap')) return;
      var w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function revealBlocks() {
    var els = document.querySelectorAll('.prose .callout, .prose .stat-strip, .prose blockquote, .takeaways');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) return;
    els.forEach(function (el) { el.classList.add('reveal'); });
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('in'); });
    }, 1500);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    buildToc();
    wrapTables();
    revealBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (window.SS) window.SS.article = init;
})();

/* =========================================================================
   PLATFORM ENHANCEMENTS — command palette + saved articles
   ========================================================================= */
(function(){
  'use strict';
  var root=document.querySelector('[data-palette]');
  if(!root) return;
  var input=root.querySelector('[data-command-input]'), list=root.querySelector('[data-command-list]');
  var BASE=window.SITE_BASE||'./', items=[
    {label:'Home',meta:'Page',icon:'⌂',url:BASE+'index.html'},
    {label:'Learning Paths',meta:'Learn',icon:'↗',url:BASE+'paths.html'},
    {label:'Topics',meta:'Explore',icon:'#',url:BASE+'topics.html'},
    {label:'All Posts',meta:'Library',icon:'▤',url:BASE+'blog/index.html'},
    {label:'Tech',meta:'Category',icon:'T',url:BASE+'tech.html'},
    {label:'AI',meta:'Category',icon:'A',url:BASE+'ai.html'},
    {label:'Saved articles',meta:'Local',icon:'☆',action:'saved'}
  ], active=0;
  function saved(){try{return JSON.parse(localStorage.getItem('ss-saved')||'[]')}catch(e){return[]}}
  function render(q){
    var term=(q||'').trim().toLowerCase(), all=items.slice();
    if(term==='saved' || term==='bookmarks') all=all.filter(function(x){return x.action==='saved'});
    else if(term) all=all.filter(function(x){return (x.label+' '+x.meta).toLowerCase().indexOf(term)>-1});
    if(!all.length){list.innerHTML='<div class="cmd-item"><span></span><span class="cmd-item__label">No command matches</span><span></span></div>';return;}
    active=0; list.innerHTML=all.map(function(x,i){return '<a class="cmd-item'+(i===0?' is-active':'')+'" href="'+(x.url||'#')+'" data-cmd-action="'+(x.action||'')+'"><span class="cmd-item__icon">'+x.icon+'</span><span class="cmd-item__label">'+x.label+'</span><span class="cmd-item__meta">'+x.meta+'</span></a>'}).join('');
  }
  function open(){root.hidden=false;document.body.classList.add('cmd-open');render(input.value);setTimeout(function(){input.focus();input.select()},0)}
  function close(){root.hidden=true;document.body.classList.remove('cmd-open')}
  document.querySelectorAll('[data-command]').forEach(function(b){b.addEventListener('click',open)});
  root.querySelectorAll('[data-command-close]').forEach(function(b){b.addEventListener('click',close)});
  input.addEventListener('input',function(){render(input.value)});
  document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();root.hidden?open():close();return}if(!root.hidden&&e.key==='Escape'){e.preventDefault();close();return}if(!root.hidden&&e.key==='ArrowDown'){e.preventDefault();var a=list.querySelectorAll('.cmd-item');active=Math.min(active+1,a.length-1);a.forEach(function(x,i){x.classList.toggle('is-active',i===active)})}if(!root.hidden&&e.key==='ArrowUp'){e.preventDefault();var b=list.querySelectorAll('.cmd-item');active=Math.max(active-1,0);b.forEach(function(x,i){x.classList.toggle('is-active',i===active)})}if(!root.hidden&&e.key==='Enter'){var c=list.querySelectorAll('.cmd-item')[active];if(c){e.preventDefault();var act=c.getAttribute('data-cmd-action');if(act==='saved'){var sv=saved();location.href=BASE+'blog/index.html#saved';close();}else if(c.getAttribute('href')) location.href=c.getAttribute('href')}}});

  var saveButtons=document.querySelectorAll('[data-save]');
  saveButtons.forEach(function(btn){
    var key=btn.getAttribute('data-save'), sv=saved(), on=sv.indexOf(key)>-1;
    function paint(){btn.classList.toggle('is-saved',on);btn.setAttribute('aria-pressed',String(on));btn.textContent=on?'★ Saved':'☆ Save'}
    paint();
    btn.addEventListener('click',function(){var arr=saved();if(arr.indexOf(key)>-1){arr=arr.filter(function(x){return x!==key});on=false}else{arr.push(key);on=true}localStorage.setItem('ss-saved',JSON.stringify(arr));paint()});
  });
})();
