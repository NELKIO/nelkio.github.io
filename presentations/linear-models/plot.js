// Небольшой помощник для SVG-графиков и элементов управления сцен.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SVG_TAGS = new Set(['svg', 'g', 'line', 'path', 'circle', 'rect', 'text', 'clipPath', 'defs', 'polygon']);
  const C = { ink: '#1a1c1f', muted: '#66707c', blue: '#267fd0', orange: '#d5673d', green: '#217d68', violet: '#7b5ea7', gold: '#b8901a', gray: '#9aa3ad', line: '#dfe3e8', panel: '#f6f7f9' };
  let uid = 0;

  const fmt = (v, k = 2) => (+v).toFixed(k).replace('.', ',').replace('-', '−');

  function h(tag, attrs, parent, text) {
    const e = SVG_TAGS.has(tag) ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function niceTicks(a, b, n = 5) {
    const raw = (b - a) / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 5, 10].map(m => m * p).find(s => s >= raw);
    const out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  // o: {w,h,x:[a,b],y:[a,b],xl,yl,title,xt,yt,xf,yf,m,grid}
  function plot(parent, o) {
    const m = Object.assign({ l: 58, r: 14, t: o.title ? 34 : (o.yl ? 30 : 12), b: o.xl ? 50 : 30 }, o.m || {});
    const svg = h('svg', { viewBox: `0 0 ${o.w} ${o.h}`, class: 'plot' }, parent);
    const pw = o.w - m.l - m.r, ph = o.h - m.t - m.b;
    const P = { svg, x: o.x.slice(), y: o.y.slice(), m, pw, ph };
    P.sx = v => m.l + (v - P.x[0]) / (P.x[1] - P.x[0]) * pw;
    P.sy = v => m.t + ph - (v - P.y[0]) / (P.y[1] - P.y[0]) * ph;
    const id = 'clip' + (++uid);
    h('rect', { x: m.l, y: m.t, width: pw, height: ph }, h('clipPath', { id }, h('defs', {}, svg)));
    const ax = h('g', {}, svg);
    const tk = { 'font-size': 14, fill: C.muted };
    const xt = o.xt || niceTicks(P.x[0], P.x[1], o.xn || 6).map(v => ({ v, label: (o.xf || (t => fmt(t, 0)))(v) }));
    const yt = o.yt || niceTicks(P.y[0], P.y[1], o.yn || 5).map(v => ({ v, label: (o.yf || (t => fmt(t, 0)))(v) }));
    yt.forEach(t => {
      h('line', { x1: m.l, x2: m.l + pw, y1: P.sy(t.v), y2: P.sy(t.v), stroke: o.grid === false ? 'none' : '#eef0f3' }, ax);
      h('text', { x: m.l - 9, y: P.sy(t.v) + 5, 'text-anchor': 'end', ...tk }, ax, t.label);
    });
    xt.forEach(t => {
      h('line', { x1: P.sx(t.v), x2: P.sx(t.v), y1: m.t + ph, y2: m.t + ph + 5, stroke: '#c5ccd4' }, ax);
      h('text', { x: P.sx(t.v), y: m.t + ph + 21, 'text-anchor': 'middle', ...tk }, ax, t.label);
    });
    h('line', { x1: m.l, x2: m.l + pw, y1: m.t + ph, y2: m.t + ph, stroke: '#c5ccd4' }, ax);
    if (o.xl) h('text', { x: m.l + pw, y: o.h - 6, 'text-anchor': 'end', 'font-size': 15, fill: C.muted }, ax, o.xl);
    if (o.yl) h('text', { x: m.l, y: m.t - 12, 'font-size': 15, fill: C.muted }, ax, o.yl);
    if (o.title) h('text', { x: o.yl ? m.l + pw : m.l, y: 18, 'text-anchor': o.yl ? 'end' : 'start', 'font-size': 17, 'font-weight': 600, fill: C.ink }, ax, o.title);
    P.back = h('g', { 'clip-path': `url(#${id})` }, svg);
    P.g = h('g', { 'clip-path': `url(#${id})` }, svg);
    P.top = h('g', {}, svg);
    P.clear = () => { P.g.replaceChildren(); P.top.replaceChildren(); };
    P.line = (xs, ys, a = {}) => {
      let d = '';
      for (let i = 0; i < xs.length; i++) d += (i ? 'L' : 'M') + P.sx(xs[i]).toFixed(1) + ' ' + P.sy(ys[i]).toFixed(1);
      return h('path', Object.assign({ d, fill: 'none', stroke: C.blue, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, a), a.layer || P.g);
    };
    P.dots = (xs, ys, a = {}) => {
      const g = h('g', {}, a.layer || P.g), r = a.r || 3.5;
      for (let i = 0; i < xs.length; i++) h('circle', { cx: P.sx(xs[i]).toFixed(1), cy: P.sy(ys[i]).toFixed(1), r, fill: a.fill || C.gray, 'fill-opacity': a.opacity == null ? 0.75 : a.opacity, stroke: a.stroke || 'none' }, g);
      return g;
    };
    P.seg = (x1, y1, x2, y2, a = {}) => h('line', Object.assign({ x1: P.sx(x1), y1: P.sy(y1), x2: P.sx(x2), y2: P.sy(y2), stroke: C.muted, 'stroke-width': 1.5 }, a), a.layer || P.g);
    P.text = (x, y, s, a = {}) => h('text', Object.assign({ x: P.sx(x) + (a.dx || 0), y: P.sy(y) + (a.dy || 0), 'font-size': 15, fill: C.ink }, a), a.layer || P.top, s);
    P.rect = (x1, y1, x2, y2, a = {}) => h('rect', Object.assign({ x: P.sx(Math.min(x1, x2)), y: P.sy(Math.max(y1, y2)), width: Math.abs(P.sx(x2) - P.sx(x1)), height: Math.abs(P.sy(y2) - P.sy(y1)), fill: C.panel }, a), a.layer || P.back);
    P.mark = (x, y, a = {}) => h('circle', Object.assign({ cx: P.sx(x), cy: P.sy(y), r: 7, fill: C.orange, stroke: '#fff', 'stroke-width': 2 }, a), a.layer || P.top);
    return P;
  }

  function controls(root) { return h('div', { class: 'scene-controls' }, root); }

  function slider(bar, o) {
    const lab = h('label', {}, bar);
    h('span', {}, lab, o.label);
    const inp = h('input', { type: 'range', min: o.min, max: o.max, step: o.step, value: o.value }, lab);
    // o.num: вместо подписи — поле, куда можно вписать точное число
    const out = h(o.num ? 'input' : 'output', o.num ? { type: 'number', step: 'any', min: o.min, max: o.max, class: 'num-in' } : {}, lab);
    const show = v => { const s = (o.fmt || (x => fmt(x, 2)))(v); if (o.num) out.value = +(+v).toFixed(4); else out.textContent = s; };
    inp.addEventListener('input', () => { show(+inp.value); o.on(+inp.value); });
    if (o.num) out.addEventListener('change', () => {
      const raw = String(out.value).trim().replace(',', '.');
      if (raw === '' || !isFinite(+raw)) return show(+inp.value);
      const v = Math.min(o.max, Math.max(o.min, +raw));
      inp.value = v; show(v); o.on(v);
    });
    show(+o.value);
    return { get: () => +inp.value, set: v => { inp.value = v; show(v); } };
  }

  function seg(bar, label, items, value, on) {
    const lab = h('label', {}, bar);
    if (label) h('span', {}, lab, label);
    const box = h('span', { class: 'seg' }, lab);
    const bs = items.map(it => {
      const b = h('button', { type: 'button' }, box, it.label);
      b.addEventListener('click', () => { set(it.value); on(it.value); });
      return b;
    });
    function set(v) { bs.forEach((b, i) => b.classList.toggle('on', items[i].value === v)); }
    set(value);
    return { set };
  }

  function button(bar, label, on, primary) {
    const b = h('button', { type: 'button', class: 'btn' + (primary ? ' primary' : '') }, bar, label);
    b.addEventListener('click', on);
    return b;
  }

  function legend(root, items) {
    const l = h('div', { class: 'legend' }, root);
    items.forEach(it => h('span', { html: `<i class="${it.dot ? 'dot' : ''}" style="background:${it.color}"></i>${it.label}` }, l));
    return l;
  }

  window.LMP = { C, fmt, h, plot, controls, slider, seg, button, legend, niceTicks };
})();
