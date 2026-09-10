/* =========================================================================
   StackSignal — hero 3D engine (~4KB, no WebGL library)
   Perspective-projected geometry on a 2D <canvas>:
     data-shape="grid"    -> rotating wireframe cube        (Tech theme)
     data-shape="network" -> neural sphere with links       (AI theme)
     data-shape="globe"   -> dual-layer linked globe        (Home / archive)
   Pauses off-screen and when the tab is hidden, honours
   prefers-reduced-motion (renders one static frame), DPR capped at 2.
   ========================================================================= */
(function () {
  'use strict';
  var instances = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(canvas) {
  var ctx = canvas.getContext('2d', { alpha: true });
  var shape = canvas.getAttribute('data-shape') || 'globe';
  var accent, accent2;
  function readTheme() {
    var css = getComputedStyle(document.documentElement);
    accent = (css.getPropertyValue('--accent') || '#6ee7ff').trim();
    accent2 = (css.getPropertyValue('--brand-2') || '#7c8cff').trim();
  }
  readTheme();

  var W = 0, H = 0, dpr = 1, pts = [], links = [], t = 0;
  var mx = 0, my = 0, tx = 0, ty = 0, running = false, raf = 0;

  /* ---------- geometry ------------------------------------------------- */
  function lerpEdge(a, b, steps, size) {
    var first = pts.length;
    for (var i = 0; i <= steps; i++) {
      var u = i / steps;
      if (i > 0) links.push([first + i - 1, first + i]);   // draw the edge itself
      pts.push({
        x: a[0] + (b[0] - a[0]) * u,
        y: a[1] + (b[1] - a[1]) * u,
        z: a[2] + (b[2] - a[2]) * u,
        s: (i === 0 || i === steps) ? 2.6 : 1.5   // brighter corners
      });
    }
  }

  function build() {
    pts = []; links = [];

    if (shape === 'grid') {
      // True cube wireframe: 8 vertices, 12 edges sampled into points.
      var r = 150;
      var v = [[-r,-r,-r],[r,-r,-r],[r,r,-r],[-r,r,-r],[-r,-r,r],[r,-r,r],[r,r,r],[-r,r,r]];
      var e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      for (var i = 0; i < e.length; i++) lerpEdge(v[e[i][0]], v[e[i][1]], 9, r);
      // inner counter-rotating core for depth
      var r2 = r * 0.42, v2 = v.map(function (p) { return [p[0] * 0.42, p[1] * 0.42, p[2] * 0.42]; });
      for (var j = 0; j < e.length; j++) lerpEdge(v2[e[j][0]], v2[e[j][1]], 3, r2);
      return;
    }

    // Fibonacci sphere (network / globe)
    var count = shape === 'network' ? 190 : 230;
    var R = 185;
    for (var a = 0; a < count; a++) {
      var phi = Math.acos(1 - 2 * (a + 0.5) / count);
      var th = Math.PI * (1 + Math.sqrt(5)) * a;
      var rr = (shape === 'globe' && a % 3 === 0) ? R * 0.58 : R;
      pts.push({
        x: rr * Math.sin(phi) * Math.cos(th),
        y: rr * Math.sin(phi) * Math.sin(th),
        z: rr * Math.cos(phi),
        s: (a % 7 === 0) ? 2.8 : 1.7
      });
    }
    // link nearby nodes once (cheap: O(n^2) at build time only)
    var maxD = shape === 'network' ? 3600 : 2600;
    for (var p = 0; p < pts.length; p++) {
      for (var q = p + 1; q < pts.length; q++) {
        var dx = pts[p].x - pts[q].x, dy = pts[p].y - pts[q].y, dz = pts[p].z - pts[q].z;
        if (dx * dx + dy * dy + dz * dz < maxD) links.push([p, q]);
      }
    }
  }

  /* ---------- rendering ------------------------------------------------ */
  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(p, ry, rx, scale, cxp, cyp) {
    var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    var x = p.x * cy - p.z * sy, z = p.x * sy + p.z * cy;
    var y = p.y * cx - z * sx; z = p.y * sx + z * cx;
    var f = 700 / (700 + z + 260);
    return { x: cxp + x * f * scale, y: cyp + y * f * scale, f: f };
  }

  function draw() {
    // Small screens: centre the visual and shrink it; desktop: offset right.
    var narrow = W < 820;
    var scale = Math.min(1, W / 1100) * (narrow ? 0.72 : 1);
    var cxp = narrow ? W * 0.5 : W * 0.7;
    var cyp = narrow ? H * 0.42 : H * 0.5;
    var ry = t + mx * 0.55, rx = -0.32 + my * 0.35;

    ctx.clearRect(0, 0, W, H);
    var proj = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) proj[i] = project(pts[i], ry, rx, scale, cxp, cyp);

    if (links.length) {
      ctx.lineWidth = 0.7; ctx.strokeStyle = accent2;
      for (var l = 0; l < links.length; l++) {
        var a = proj[links[l][0]], b = proj[links[l][1]];
        var al = (a.f + b.f - 1.2) * 0.55;
        if (al <= 0.02) continue;
        ctx.globalAlpha = Math.min(0.3, al);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    for (var k = 0; k < proj.length; k++) {
      var q = proj[k];
      ctx.globalAlpha = Math.max(0.12, Math.min(1, (q.f - 0.55) * 2.1));
      ctx.fillStyle = (k % 5 === 0) ? accent2 : accent;
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(0.6, pts[k].s * q.f), 0, 6.2832); ctx.fill();
    }

    // soft core glow
    var g = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, 190 * scale);
    g.addColorStop(0, accent); g.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.1; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cxp, cyp, 190 * scale, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function frame() {
    if (!running) return;
    t += 0.0034;
    mx += (tx - mx) * 0.055; my += (ty - my) * 0.055;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduce) { running = true; frame(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* ---------- interaction & lifecycle ---------------------------------- */
  if (!reduce) window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var redraw = function () { resize(); if (reduce || !running) draw(); };
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(canvas);
  else window.addEventListener('resize', redraw);

  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  build(); resize(); draw();          // paint immediately (no blank first frame)

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.01 })
      .observe(canvas);
  } else { start(); }

  return { refresh: function () { readTheme(); resize(); draw(); } };
  }

  function mountAll() {
    var list = document.querySelectorAll('.hero__canvas');
    for (var i = 0; i < list.length; i++) {
      if (!list[i].__ss && list[i].getContext) { list[i].__ss = 1; instances.push(mount(list[i])); }
    }
  }

  window.HERO3D = {
    mountAll: mountAll,
    refresh: function () { for (var i = 0; i < instances.length; i++) instances[i].refresh(); }
  };

  mountAll();
})();
