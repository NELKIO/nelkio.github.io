// Сцены лекции. Все числа берутся из data.js (lecture/build/compute.py).
(function () {
  const D = window.LM, { C, fmt, h, plot, controls, slider, seg, button, legend } = window.LMP;
  const S = {};
  const note = root => h('p', { class: 'scene-note' }, root);
  const caption = (root, s) => h('p', { class: 'scene-caption' }, root, s);
  const panels = (root, cls) => h('div', { class: 'scene-panels ' + (cls || '') }, root);
  const range = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sigmoid = z => 1 / (1 + Math.exp(-z));
  const sm = D.simple;

  // ---------- обложка ----------
  S.cover = root => {
    const W = 600, H = 560, svg = h('svg', { viewBox: `0 0 ${W} ${H}` }, root);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2832 * rnd());
    for (let i = 0; i <= 6; i++) {
      h('line', { x1: 40 + i * 86, x2: 40 + i * 86, y1: 30, y2: H - 30, stroke: '#eef0f3' }, svg);
      h('line', { x1: 40, x2: W - 44, y1: 30 + i * 83.3, y2: 30 + i * 83.3, stroke: '#eef0f3' }, svg);
    }
    const pts = [];
    for (let i = 0; i < 90; i++) {
      const x = 70 + rnd() * 460, y = Math.min(500, Math.max(50, 470 - (x - 70) * 0.78 + gauss() * 42));
      pts.push([x, y]);
    }
    pts.forEach(([x, y]) => {
      const yl = 470 - (x - 70) * 0.78;
      h('line', { x1: x, x2: x, y1: y, y2: yl, stroke: y < yl ? C.blue : C.orange, 'stroke-width': 1, 'stroke-opacity': .35 }, svg);
    });
    h('line', { x1: 52, y1: 484, x2: 552, y2: 94, stroke: C.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, svg);
    pts.forEach(([x, y]) => h('circle', { cx: x, cy: y, r: 6.5, fill: y < 470 - (x - 70) * 0.78 ? C.blue : C.orange, 'fill-opacity': .9, stroke: '#fff', 'stroke-width': 1.5 }, svg));
  };

  // ---------- финальный слайд: сигмоида над двумя классами ----------
  S.coverlogit = root => {
    const W = 600, H = 560, svg = h('svg', { viewBox: `0 0 ${W} ${H}` }, root);
    let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i <= 6; i++) {
      h('line', { x1: 40 + i * 86, x2: 40 + i * 86, y1: 30, y2: H - 30, stroke: '#eef0f3' }, svg);
      h('line', { x1: 40, x2: W - 44, y1: 30 + i * 83.3, y2: 30 + i * 83.3, stroke: '#eef0f3' }, svg);
    }
    const sx = z => 300 + z * 42, top = 110, bot = 450, sy = p => bot - p * (bot - top);
    const pts = [];
    for (let i = 0; i < 70; i++) {
      const z = -6 + rnd() * 12, y = rnd() < 1 / (1 + Math.exp(-1.3 * z)) ? 1 : 0;
      pts.push([z, y, (rnd() - 0.5) * 46]);
    }
    let d = '';
    for (let k = 0; k <= 120; k++) { const z = -6.4 + k * 12.8 / 120; d += (k ? 'L' : 'M') + sx(z).toFixed(1) + ' ' + sy(1 / (1 + Math.exp(-1.3 * z))).toFixed(1); }
    h('line', { x1: 300, x2: 300, y1: 60, y2: 500, stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', 'stroke-opacity': .5 }, svg);
    h('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, svg);
    pts.forEach(([z, y, j]) => h('circle', { cx: sx(z), cy: (y ? top - 40 : bot + 40) + j * 0.5, r: 6.5, fill: y ? C.orange : C.blue, 'fill-opacity': .9, stroke: '#fff', 'stroke-width': 1.5 }, svg));
  };

  // ---------- мини-картинки: одна прямая против прямоугольников дерева ----------
  S.minisplit = root => {
    const b = D.blobs, tree = root.dataset.kind === 'tree';
    const P = plot(root, { w: 300, h: 190, x: [-4, 4.5], y: [-3.6, 4], xt: [], yt: [], grid: false, m: { l: 4, r: 4, t: 4, b: 4 } });
    P.svg.querySelectorAll('line').forEach(l => l.remove());
    h('rect', { x: 4, y: 4, width: 292, height: 182, fill: 'none', stroke: '#c5ccd4', rx: 6 }, P.svg);
    if (tree) {
      const nx = b.gx.length, ny = b.gy.length, dx = b.gx[1] - b.gx[0], dy = b.gy[1] - b.gy[0];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const p = b.tree[j * nx + i];
        P.rect(b.gx[i] - dx / 2, b.gy[j] - dy / 2, b.gx[i] + dx / 2, b.gy[j] + dy / 2, { fill: p >= 0.5 ? 'rgba(213,103,61,.2)' : 'rgba(38,127,208,.14)', 'shape-rendering': 'crispEdges' });
      }
    } else {
      const yAt = x => (-b.b - b.w[0] * x) / b.w[1];
      P.line([-4, 4.5], [yAt(-4), yAt(4.5)], { stroke: C.ink, 'stroke-width': 3 });
    }
    b.label.forEach((v, i) => P.dots([b.x[i]], [b.y[i]], { fill: v ? C.orange : C.blue, r: 2.6, opacity: .85, layer: P.back }));
  };

  // ---------- два признака: плоскость в пространстве ----------
  S.plane = root => {
    const d = D.plane, bar = controls(root), W = +root.dataset.w || 620, H = +root.dataset.h || 430;
    const svg = h('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot' }, root);
    const U = [1.5, 5.2], V = [0, 12], T = [0, 48];
    const f = (x1, x2) => d.b + d.coef[0] * x1 + d.coef[1] * x2;
    const S0 = W * 0.62, el = 0.4, cx = W / 2 + 14, cy = H * 0.5, sz = H * 0.6;
    let a = 0.6;
    const pr = (x1, x2, y) => {
      const u = (x1 - U[0]) / (U[1] - U[0]) - 0.5, v = (x2 - V[0]) / (V[1] - V[0]) - 0.5, t = (y - T[0]) / (T[1] - T[0]) - 0.5;
      const px = u * Math.cos(a) - v * Math.sin(a), dp = u * Math.sin(a) + v * Math.cos(a);
      return [cx + S0 * px, cy - sz * t - S0 * el * dp, dp];
    };
    const pts = d.x1.map((x1, i) => ({ x1, x2: d.x2[i], y: d.y[i] }));
    function draw() {
      svg.replaceChildren();
      const g = (tag, at) => h(tag, at, svg);
      const P = (x1, x2, y) => pr(x1, x2, y).slice(0, 2).map(v => v.toFixed(1)).join(' ');
      // пол и оси
      g('path', { d: `M${P(U[0], V[0], T[0])}L${P(U[1], V[0], T[0])}L${P(U[1], V[1], T[0])}L${P(U[0], V[1], T[0])}Z`, fill: '#f6f7f9', stroke: '#dfe3e8' });
      const line = (a1, a2, st) => g('line', Object.assign({ x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1], stroke: '#9aa3ad', 'stroke-width': 1.5 }, st || {}));
      const lab = (pt, s, dx, dy, an) => { g('text', { x: pt[0] + dx, y: pt[1] + dy, 'text-anchor': an, 'font-size': 15, fill: C.muted }).textContent = s; };
      // передний угол пола — откуда идут оси массы и года; ось mpg — в самом левом углу
      const corners = [[U[0], V[0]], [U[1], V[0]], [U[1], V[1]], [U[0], V[1]]];
      const front = corners.reduce((m, c) => pr(c[0], c[1], 0)[2] < pr(m[0], m[1], 0)[2] ? c : m);
      const left = corners.reduce((m, c) => pr(c[0], c[1], 0)[0] < pr(m[0], m[1], 0)[0] ? c : m);
      const fu = [front[0] === U[0] ? U[1] : U[0], front[1]], fv = [front[0], front[1] === V[0] ? V[1] : V[0]];
      line(pr(front[0], front[1], 0), pr(fu[0], fu[1], 0)); line(pr(front[0], front[1], 0), pr(fv[0], fv[1], 0));
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const pm = mid(pr(front[0], front[1], 0), pr(fu[0], fu[1], 0)), pv = mid(pr(front[0], front[1], 0), pr(fv[0], fv[1], 0));
      lab(pm, 'масса →', pm[0] > cx ? 10 : -10, 22, pm[0] > cx ? 'start' : 'end');
      lab(pv, 'год →', pv[0] > cx ? 10 : -10, 22, pv[0] > cx ? 'start' : 'end');
      line(pr(left[0], left[1], 0), pr(left[0], left[1], T[1]));
      [10, 20, 30, 40].forEach(t => { const q = pr(left[0], left[1], t); line(q, [q[0] - 6, q[1]]); lab(q, String(t), -10, 5, 'end'); });
      lab(pr(left[0], left[1], T[1]), 'mpg', 0, -10, 'middle');
      const res = pts.map(p => ({ ...p, f: f(p.x1, p.x2), dp: pr(p.x1, p.x2, p.y)[2] })).sort((p, q) => q.dp - p.dp);
      const dot = p => {
        const [x, y] = pr(p.x1, p.x2, p.y), [xf, yf] = pr(p.x1, p.x2, p.f), up = p.y > p.f;
        g('line', { x1: x, y1: y, x2: xf, y2: yf, stroke: up ? C.green : C.orange, 'stroke-width': 1, 'stroke-opacity': .45 });
        g('circle', { cx: x, cy: y, r: 3.4, fill: up ? C.green : C.orange, 'fill-opacity': up ? .9 : .55, stroke: '#fff', 'stroke-width': .8 });
      };
      res.filter(p => p.y <= p.f).forEach(dot);
      const c = [[U[0], V[0]], [U[1], V[0]], [U[1], V[1]], [U[0], V[1]]].map(([x1, x2]) => P(x1, x2, f(x1, x2)));
      g('path', { d: `M${c.join('L')}Z`, fill: 'rgba(38,127,208,.2)', stroke: C.blue, 'stroke-width': 2 });
      for (let k = 1; k < 4; k++) {
        const x1 = U[0] + (U[1] - U[0]) * k / 4, x2 = V[0] + (V[1] - V[0]) * k / 4;
        g('path', { d: `M${P(x1, V[0], f(x1, V[0]))}L${P(x1, V[1], f(x1, V[1]))}`, stroke: C.blue, 'stroke-opacity': .35 });
        g('path', { d: `M${P(U[0], x2, f(U[0], x2))}L${P(U[1], x2, f(U[1], x2))}`, stroke: C.blue, 'stroke-opacity': .35 });
      }
      res.filter(p => p.y > p.f).forEach(dot);
    }
    slider(bar, { label: 'Повернуть', min: 0.1, max: 1.45, step: 0.01, value: a, fmt: v => Math.round(v * 180 / Math.PI) + '°', on: v => { a = v; draw(); } });
    draw();
    legend(bar, [{ color: C.green, label: 'над плоскостью', dot: 1 }, { color: C.orange, label: 'под ней', dot: 1 }]);
  };

  // ---------- Auto MPG: точки, прямая, остатки, парабола ----------
  function mpgPlot(root, o = {}) {
    const P = plot(root, Object.assign({ w: 1240, h: 430, x: [1.4, 5.4], y: [5, 50], xl: 'Масса, тыс. фунтов', yl: 'Экономичность, миль на галлон (mpg)', xf: v => fmt(v, 1) }, o));
    return P;
  }
  const lineY = x => sm.b + sm.w * x;

  S.mpgline = root => {
    const P = mpgPlot(root, { w: +root.dataset.w || 1240, h: +root.dataset.h || 430 });
    P.dots(sm.train[0], sm.train[1], { fill: C.gray, opacity: .55 });
    P.dots(sm.val[0], sm.val[1], { fill: C.orange, opacity: .8 });
    P.line([1.4, 5.4], [lineY(1.4), lineY(5.4)]);
    if (root.dataset.mark) {
      [3, 4].forEach(x => { P.seg(x, 5, x, lineY(x), { 'stroke-dasharray': '4 4' }); P.mark(x, lineY(x), { fill: C.blue }); P.text(x, lineY(x), fmt(lineY(x), 2) + ' mpg', { dx: 12, dy: -10, 'font-weight': 600 }); });
    }
    legend(root, [{ color: C.gray, label: `train · ${sm.train[0].length}`, dot: 1 }, { color: C.orange, label: `validation · ${sm.val[0].length}`, dot: 1 }, { color: C.blue, label: 'прямая, обученная на train' }]);
  };

  S.residuals = root => {
    const P = mpgPlot(root, { w: +root.dataset.w || 700, h: 440, x: [1.5, 4.7], y: [8, 40] });
    P.line([1.5, 4.7], [lineY(1.5), lineY(4.7)]);
    sm.examples.forEach(e => {
      P.seg(e.x, e.y, e.x, e.pred, { stroke: e.pred > e.y ? C.orange : C.green, 'stroke-width': 3 });
      P.mark(e.x, e.y, { fill: C.ink, r: 6 });
    });
    const e = sm.examples[3];
    P.text(e.x, (e.y + e.pred) / 2, 'r = +' + fmt(e.pred - e.y, 2), { dx: 10, dy: 5, fill: C.orange, 'font-weight': 600 });
    const e0 = sm.examples[0];
    P.text(e0.x, (e0.y + e0.pred) / 2, 'r = ' + fmt(e0.pred - e0.y, 2), { dx: 10, dy: 5, fill: C.green, 'font-weight': 600 });
    legend(root, [{ color: C.ink, label: 'ответ y', dot: 1 }, { color: C.orange, label: 'прогноз выше ответа' }, { color: C.green, label: 'прогноз ниже ответа' }]);
  };

  S.mpgpoly = root => {
    const P = mpgPlot(root, { w: +root.dataset.w || 700, h: 440 });
    P.dots(sm.train[0], sm.train[1], { fill: C.gray, opacity: .5 });
    const xs = range(1.4, 5.4, 80), q = D.poly_mpg_2;
    P.line([1.4, 5.4], [lineY(1.4), lineY(5.4)], { stroke: C.gray, 'stroke-dasharray': '6 5' });
    P.line(xs, xs.map(x => q.b + q.coef[0] * x + q.coef[1] * x * x), { stroke: C.blue });
    legend(root, [{ color: C.gray, label: `степень 1 · validation RMSE ${fmt(D.poly_mpg_1.val_rmse)}` }, { color: C.blue, label: `степень 2 · validation RMSE ${fmt(q.val_rmse)}` }]);
  };

  // ---------- лучшая константа ----------
  S.constant = root => {
    const ys = [1, 2, 3, 4, 20], bar = controls(root), ps = panels(root);
    const cs = range(0, 21, 211);
    const mse = c => mean(ys.map(y => (y - c) ** 2)), mae = c => mean(ys.map(y => Math.abs(y - c)));
    const PH = +root.dataset.h || 330, P1 = plot(ps, { w: 608, h: PH, x: [0, 21], y: [0, 160], title: 'Средний квадрат ошибки', xl: 'константа c' });
    const P2 = plot(ps, { w: 608, h: PH, x: [0, 21], y: [0, 12], title: 'Средний модуль ошибки', xl: 'константа c' });
    const n = note(root);
    function draw(c) {
      [[P1, mse, C.blue, 6], [P2, mae, C.green, 3]].forEach(([P, f, col, best]) => {
        P.clear();
        ys.forEach(y => P.seg(y, P.y[0], y, P.y[1] * 0.06, { stroke: C.ink, 'stroke-width': 3 }));
        P.line(cs, cs.map(f), { stroke: col });
        P.seg(best, 0, best, f(best), { 'stroke-dasharray': '4 4', stroke: col });
        P.mark(c, f(c));
      });
      n.innerHTML = `c = <b>${fmt(c, 1)}</b> · средний квадрат ошибки <b>${fmt(mse(c), 1)}</b> (минимум ${fmt(mse(6), 1)} при c = 6, это среднее) · средний модуль <b>${fmt(mae(c), 1)}</b> (минимум ${fmt(mae(3), 1)} при c = 3, это медиана)`;
    }
    slider(bar, { label: 'Ответы: 1, 2, 3, 4, 20. Константа c', min: 0, max: 21, step: 0.5, value: 10, fmt: v => fmt(v, 1), on: draw });
    draw(10);
  };

  // ---------- производная ошибки по наклону ----------
  S.tangent = root => {
    const bar = controls(root), ps = panels(root), n = note(root);
    const xs = sm.train[0], ys = sm.train[1], b = sm.b;
    const J = w => 0.5 * mean(xs.map((x, i) => (w * x + b - ys[i]) ** 2));
    const dJ = w => mean(xs.map((x, i) => (w * x + b - ys[i]) * x));
    const P = mpgPlot(ps, { w: 608, h: 315, title: 'Прямая на данных train' });
    P.dots(xs, ys, { fill: C.gray, opacity: .5, layer: P.back });
    const ws = range(-11, -4.9, 120), jmax = Math.max(J(-11), J(-4.9));
    const Q = plot(ps, { w: 608, h: 315, x: [-11, -4.9], y: [0, jmax * 1.05], title: 'Ошибка J при разных w', xl: 'наклон w', yl: 'J', xf: v => fmt(v, 0) });
    Q.line(ws, ws.map(J), { stroke: C.ink, layer: Q.back });
    Q.mark(sm.w, J(sm.w), { fill: C.green, r: 6, layer: Q.back });
    function draw(w) {
      P.clear(); Q.clear();
      P.line([1.4, 5.4], [b + w * 1.4, b + w * 5.4], { stroke: C.orange, 'stroke-width': 3 });
      const k = dJ(w), j = J(w), dw = 0.9;
      Q.line([w - dw, w + dw], [j - k * dw, j + k * dw], { stroke: C.orange, 'stroke-width': 2.5 });
      Q.mark(w, j);
      const dir = Math.abs(k) < 0.05 ? 'почти ноль: мы у минимума' : k < 0 ? 'меньше нуля: J уменьшится, если увеличить w' : 'больше нуля: J уменьшится, если уменьшить w';
      n.innerHTML = `w = <b>${fmt(w, 2)}</b> · J = <b>${fmt(j, 2)}</b> · производная dJ/dw = <b>${fmt(k, 2)}</b> — ${dir}. Минимум: w = ${fmt(sm.w)}`;
    }
    const sl = slider(bar, { label: 'Наклон w', min: -11, max: -5, step: 0.01, value: -10, num: true, on: draw });
    button(bar, 'В минимум', () => { const v = +sm.w.toFixed(2); sl.set(v); draw(v); });
    legend(bar, [{ color: C.orange, label: 'касательная: её наклон — производная' }, { color: C.green, label: 'минимум', dot: 1 }]);
    draw(-10);
  };

  // ---------- шаги спуска по параболе ошибки ----------
  S.gdsteps = root => {
    const bar = controls(root), n = note(root);
    const xs = sm.train[0], ys = sm.train[1], b = sm.b;
    const J = w => 0.5 * mean(xs.map((x, i) => (w * x + b - ys[i]) ** 2));
    const dJ = w => mean(xs.map((x, i) => (w * x + b - ys[i]) * x));
    const ws = range(-11, -4.9, 120);
    const P = plot(root, { w: 700, h: 360, x: [-11, -4.9], y: [0, Math.max(J(-11), J(-4.9)) * 1.05], xl: 'наклон w', yl: 'ошибка J', xf: v => fmt(v, 0) });
    root.insertBefore(P.svg, n);
    P.line(ws, ws.map(J), { stroke: C.ink, layer: P.back });
    P.mark(sm.w, J(sm.w), { fill: C.green, r: 6, layer: P.back });
    let eta = 0.05, steps = 5;
    function draw() {
      P.clear();
      let w = -10.5; const path = [w];
      for (let i = 0; i < steps; i++) { w = w - eta * dJ(w); path.push(w); }
      const vis = path.filter(v => v > -11.5 && v < -4.4);
      for (let i = 1; i < vis.length; i++) P.seg(vis[i - 1], J(vis[i - 1]), vis[i], J(vis[i]), { stroke: C.orange, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      vis.forEach((v, i) => P.mark(v, J(v), { r: i === vis.length - 1 ? 7 : 4.5, fill: C.orange }));
      const last = path[path.length - 1], gone = !isFinite(J(last)) || J(last) > 1e3 || last < -11.5 || last > -4.4;
      n.innerHTML = `Старт w = −10,5 · после ${steps} шагов w = <b>${gone ? 'улетел' : fmt(last, 2)}</b>, J = <b>${gone ? 'растёт' : fmt(J(last), 2)}</b> · минимум: w = ${fmt(sm.w)}, J = ${fmt(J(sm.w), 2)}`;
    }
    seg(bar, 'Шаг η', [0.02, 0.05, 0.15, 0.21].map(v => ({ label: fmt(v, 2), value: v })), eta, v => { eta = v; draw(); });
    slider(bar, { label: 'Шагов', min: 0, max: 15, step: 1, value: steps, fmt: v => v, on: v => { steps = v; draw(); } });
    draw();
  };

  // ---------- градиентный спуск ----------
  S.gd = root => {
    const bar = controls(root), ps = panels(root), n = note(root);
    const cfg = [
      { key: 'raw', title: 'Исходные единицы: тыс. фунтов и годы', etas: [0.02, 0.08, 0.15, 0.17], eta: 0.15 },
      { key: 'std', title: 'После стандартизации', etas: [0.1, 0.5, 1, 1.6], eta: 1 },
    ];
    let steps = 25;
    cfg.forEach(c => {
      const g = D.gd[c.key], A = g.A, o = g.opt;
      const [l1, l2] = g.eig;
      const th = Math.atan2(l1 - A[0][0], A[0][1]);
      const v1 = [Math.cos(th), Math.sin(th)], v2 = [-v1[1], v1[0]];
      const d0 = 0.5 * (g.c[0] * o[0] + g.c[1] * o[1]);
      c.J = w => g.J0 + 0.5 * (A[0][0] * w[0] * w[0] + 2 * A[0][1] * w[0] * w[1] + A[1][1] * w[1] * w[1]) - g.c[0] * w[0] - g.c[1] * w[1];
      c.Jmin = g.J0 - d0;
      const R = 1.3 * Math.sqrt(2 * d0 / l1), box = h('div', {}, ps);
      const cb = controls(box);
      c.segc = seg(cb, 'Шаг η', c.etas.map(v => ({ label: fmt(v, 2), value: v })), c.eta, v => { c.eta = v; draw(); });
      const pw = 608 - 72, ph = 400 - 84;
      c.P = plot(box, { w: 608, h: 400, x: [o[0] - R, o[0] + R], y: [o[1] - R * ph / pw, o[1] + R * ph / pw], title: c.title, xl: 'коэффициент при массе', yl: 'коэффициент при годе', xf: v => fmt(v, 0), grid: false });
      [1, 0.55, 0.25, 0.08, 0.015].forEach(k => {
        const a = Math.sqrt(2 * d0 * k / l1), b = Math.sqrt(2 * d0 * k / l2), ts = range(0, 6.2832, 90);
        c.P.line(ts.map(t => o[0] + a * Math.cos(t) * v1[0] + b * Math.sin(t) * v2[0]), ts.map(t => o[1] + a * Math.cos(t) * v1[1] + b * Math.sin(t) * v2[1]), { stroke: '#cfd6de', 'stroke-width': 1.3, layer: c.P.back });
      });
      c.traj = () => {
        const w = [0, 0], xs = [0], ys = [0];
        for (let i = 0; i < steps; i++) {
          const g0 = A[0][0] * w[0] + A[0][1] * w[1] - g.c[0], g1 = A[0][1] * w[0] + A[1][1] * w[1] - g.c[1];
          w[0] -= c.eta * g0; w[1] -= c.eta * g1; xs.push(w[0]); ys.push(w[1]);
        }
        return [xs, ys, w];
      };
    });
    function draw() {
      const parts = cfg.map(c => {
        const [xs, ys, w] = c.traj();
        c.P.clear();
        c.P.line(xs, ys, { stroke: C.blue, 'stroke-width': 1.8 });
        c.P.dots(xs, ys, { fill: C.blue, r: 3, opacity: 1 });
        c.P.mark(D.gd[c.key].opt[0], D.gd[c.key].opt[1], { fill: C.green, layer: c.P.g });
        const J = c.J(w);
        return `${c.key === 'raw' ? 'исходные' : 'стандартизованные'}: J = <b>${J > 1e4 ? 'расходится' : fmt(J, 2)}</b>`;
      });
      n.innerHTML = `После ${steps} шагов · ${parts.join(' · ')} · минимум J = ${fmt(cfg[0].Jmin, 2)} в обоих случаях`;
    }
    slider(bar, { label: 'Число шагов', min: 0, max: 80, step: 1, value: steps, fmt: v => v, on: v => { steps = v; draw(); } });
    legend(bar, [{ color: C.blue, label: 'шаги спуска из w = (0, 0)' }, { color: C.green, label: 'минимум', dot: 1 }, { color: '#cfd6de', label: 'линии уровня J' }]);
    draw();
  };

  // ---------- степень полинома ----------
  S.poly = root => {
    const p = D.poly, bar = controls(root), ps = panels(root, 'p32'), n = note(root);
    const P = plot(ps, { w: 740, h: 400, x: [-1.12, 1.12], y: [-5.6, 2.8], xl: 'x', xf: v => fmt(v, 1), title: 'Данные и модель' });
    const Q = plot(ps, { w: 480, h: 400, x: [0.5, 12.5], y: [0.25, 1.2], xl: 'степень полинома', title: 'RMSE', xt: [1, 2, 4, 6, 8, 10, 12].map(v => ({ v, label: v })), yf: v => fmt(v, 1) });
    P.line(p.grid, p.truth, { stroke: C.gray, 'stroke-dasharray': '6 5', 'stroke-width': 1.6, layer: P.back });
    P.dots(p.train[0], p.train[1], { fill: C.ink, opacity: .8, r: 4, layer: P.back });
    P.dots(p.val[0], p.val[1], { fill: C.orange, opacity: .8, r: 4, layer: P.back });
    const ds = p.fits.map(f => f.deg);
    Q.line(ds, p.fits.map(f => f.train), { stroke: C.ink, layer: Q.back });
    Q.line(ds, p.fits.map(f => f.val), { stroke: C.orange, layer: Q.back });
    const best = p.fits.reduce((a, f) => f.val < a.val ? f : a);
    function draw(d) {
      const f = p.fits[d - 1];
      P.clear(); Q.clear();
      P.line(p.grid, f.curve, { stroke: C.blue, 'stroke-width': 3 });
      Q.seg(d, 0.25, d, 1.2, { 'stroke-dasharray': '4 4' });
      Q.mark(d, f.train, { fill: C.ink, r: 6 }); Q.mark(d, f.val, { r: 6 });
      n.innerHTML = `Степень <b>${d}</b> · признаков: ${d} · RMSE train <b>${fmt(f.train, 3)}</b> · RMSE validation <b>${fmt(f.val, 3)}</b> · минимум validation: степень ${best.deg} (${fmt(best.val, 3)}), у степени 2 — ${fmt(p.fits[1].val, 3)}`;
    }
    slider(bar, { label: 'Степень полинома', min: 1, max: 12, step: 1, value: 1, fmt: v => v, on: draw });
    legend(bar, [{ color: C.ink, label: 'train · 30', dot: 1 }, { color: C.orange, label: 'validation · 30', dot: 1 }, { color: C.blue, label: 'модель' }, { color: C.gray, label: 'зависимость без шума' }]);
    draw(1);
    caption(root, 'Учебная синтетика: y = 1 + 2x − 3x² + шум N(0; 0,4²), x ∼ U(−1; 1), генератор NumPy с seed = 0. Модель обучается только на train.');
  };

  // ---------- масштабы признаков ----------
  S.scaling = root => {
    const d = D.scaling, cols = [C.blue, C.orange, C.green];
    const box = h('div', { class: 'scene-panels', style: 'grid-template-columns:1.35fr 1fr 1fr;gap:18px' }, root);
    let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const jit = d.raw[0].map(() => (rnd() - 0.5) * 0.5);
    [['raw', 'Исходные единицы', [0, 5500], v => v === 0 ? '0' : fmt(v / 1000, 0) + ' тыс.'],
     ['minmax', 'Нормализация', [-0.1, 1.1], v => fmt(v, 1)],
     ['std', 'Стандартизация', [-3, 4], v => fmt(v, 0)]].forEach(([k, title, xr, xf], pi) => {
      const P = plot(box, { w: pi ? 330 : 446, h: 250, x: xr, y: [-0.6, 2.6], title, xf, xn: pi === 2 ? 7 : 5, yt: [], grid: false, m: { l: pi ? 10 : 126, r: 10, b: 30 } });
      if (k === 'std') P.seg(0, -0.6, 0, 2.6, { stroke: '#c5ccd4', 'stroke-dasharray': '4 4', layer: P.back });
      if (k === 'minmax') [0, 1].forEach(v => P.seg(v, -0.6, v, 2.6, { stroke: '#c5ccd4', 'stroke-dasharray': '4 4', layer: P.back }));
      d[k].forEach((col, j) => {
        const row = 2 - j;
        P.dots(col, col.map((_, i) => row + jit[i]), { fill: cols[j], r: 3, opacity: .55 });
        if (!pi) h('text', { x: P.m.l - 10, y: P.sy(row) + 5, 'text-anchor': 'end', 'font-size': 15, fill: C.ink }, P.svg, d.names[j]);
      });
    });
  };

  // ---------- регуляризация полинома степени 12 ----------
  S.ridgepoly = root => {
    const p = D.poly, rp = D.ridge_poly, box = h('div', { class: 'scene-panels', style: 'grid-template-columns:repeat(3,1fr);gap:22px' }, root);
    const meta = { none: ['Без штрафа', C.orange], best: [`Подобранный штраф, alpha = ${fmt(rp.fits[1].alpha, 2)}`, C.blue], strong: ['Сильный штраф, alpha = 100', C.violet] };
    rp.fits.forEach(f => {
      const cell = h('div', {}, box);
      const P = plot(cell, { w: 400, h: 260, x: [-1.12, 1.12], y: [-5.6, 2.8], title: meta[f.label][0], xf: v => fmt(v, 1), xn: 4, yn: 4, m: { l: 34, r: 8 } });
      P.line(p.grid, p.truth, { stroke: C.gray, 'stroke-dasharray': '6 5', 'stroke-width': 1.5, layer: P.back });
      P.dots(p.train[0], p.train[1], { fill: C.ink, opacity: .7, r: 3.5, layer: P.back });
      P.line(p.grid, f.curve, { stroke: meta[f.label][1], 'stroke-width': 3.2 });
      h('p', { class: 'scene-note', html: `‖w‖ = <b>${fmt(f.norm, f.norm > 10 ? 0 : 1)}</b> · RMSE validation <b>${fmt(f.val)}</b>` }, cell);
    });
  };

  // ---------- веса МНК, Ridge и Lasso ----------
  S.weightbars = root => {
    const b = D.paths.bars, names = D.paths.features;
    const models = [['ols', 'МНК без штрафа', C.gray], ['ridge', `Ridge, alpha = ${fmt(b.ridge.alpha, 0)}`, C.blue], ['lasso', `Lasso, alpha = ${fmt(b.lasso.alpha, 2)}`, C.orange]];
    legend(root, models.map(([, l, c]) => ({ color: c, label: l })));
    const P = plot(root, { w: +root.dataset.w || 720, h: 530, x: [-6.8, 3.6], y: [0, 6], yt: [], xl: 'вес стандартизованного признака, mpg', xn: 9, m: { l: 100, t: 8 } });
    P.seg(0, 0, 0, 6, { stroke: C.ink, 'stroke-width': 1.2, layer: P.back });
    names.forEach((n, j) => {
      const yc = 5.5 - j;
      h('text', { x: P.m.l - 12, y: P.sy(yc) + 5, 'text-anchor': 'end', 'font-size': 16, fill: C.ink }, P.svg, n);
      models.forEach(([k, , col], i) => {
        const v = b[k].coef[j], y0 = yc + 0.27 - i * 0.27, hh = 0.2;
        if (b[k].zero[j]) {
          P.text(0, y0 - hh / 2, '0', { dx: 8, dy: 5, fill: col, 'font-weight': 700, 'font-size': 14 });
          P.mark(0, y0 - hh / 2, { r: 4, fill: col, stroke: 'none' });
        } else {
          P.rect(0, y0, v, y0 - hh, { fill: col, layer: P.g });
          const lab = Math.abs(v) < 0.005 ? '≈0' : fmt(v, 2);
          P.text(v, y0 - hh / 2, lab, { dx: v < 0 ? -6 : 6, dy: 5, 'text-anchor': v < 0 ? 'end' : 'start', fill: C.muted, 'font-size': 13 });
        }
      });
    });
  };

  // ---------- RMSE на validation в зависимости от alpha ----------
  S.alphacurve = root => {
    const q = D.paths.ridge, lx = q.alpha.map(Math.log10), xt = [-1, 0, 1, 2, 3, 4].map(v => ({ v, label: v < 0 ? '0,1' : String(10 ** v) }));
    const P = plot(root, { w: +root.dataset.w || 560, h: 220, x: [lx[0], lx[lx.length - 1]], y: [2, 7.5], xt, xl: 'alpha у Ridge (логарифмическая шкала)', yl: 'RMSE на validation, mpg', yn: 4 });
    P.line(lx, q.val_rmse, { stroke: C.blue });
    P.mark(lx[q.best], q.val_rmse[q.best]);
    caption(root, `При маленьком alpha штраф почти не действует: RMSE как у МНК без штрафа (${fmt(D.paths.ols.val_rmse)}). Auto MPG, 6 признаков.`);
    P.text(lx[q.best], q.val_rmse[q.best], `лучший: alpha = ${fmt(q.alpha[q.best], 0)}`, { dy: -14, 'text-anchor': 'middle', fill: C.orange, 'font-weight': 600 });
    P.text(lx[lx.length - 1], q.val_rmse[q.val_rmse.length - 1], 'слишком сильный штраф', { dx: -14, dy: 6, 'text-anchor': 'end', fill: C.muted });
  };

  // ---------- sigmoid ----------
  S.sigmoid = root => {
    const bar = controls(root), P = plot(root, { w: +root.dataset.w || 640, h: 380, x: [-6, 6], y: [0, 1], xl: 'score z = w·x + b', yl: 'вероятность p = σ(z)', yf: v => fmt(v, 1), xn: 6 });
    const zs = range(-6, 6, 121), n = note(root);
    P.line(zs, zs.map(sigmoid), { layer: P.back, 'stroke-width': 3 });
    P.seg(-6, 0.5, 6, 0.5, { stroke: '#c5ccd4', 'stroke-dasharray': '4 4', layer: P.back });
    function draw(z) {
      const p = sigmoid(z);
      P.clear(); P.seg(z, 0, z, p, { 'stroke-dasharray': '4 4' }); P.seg(-6, p, z, p, { 'stroke-dasharray': '4 4' }); P.mark(z, p);
      n.innerHTML = `z = <b>${fmt(z, 1)}</b> → p = <b>${fmt(p, 3)}</b> · шансы p/(1−p) = <b>${fmt(p / (1 - p), 2)}</b>`;
    }
    slider(bar, { label: 'Score z', min: -6, max: 6, step: 0.1, value: 2, fmt: v => fmt(v, 1), on: draw });
    draw(2);
  };

  // ---------- граница и порог ----------
  S.boundary = root => {
    const b = D.blobs, bar = controls(root), P = plot(root, { w: +root.dataset.w || 700, h: 390, x: [-4, 4.5], y: [-3.6, 4], xl: 'признак x₁', yl: 'признак x₂' });
    const n = note(root);
    const i0 = b.label.map((v, i) => v ? -1 : i).filter(i => i >= 0), i1 = b.label.map((v, i) => v ? i : -1).filter(i => i >= 0);
    P.dots(i0.map(i => b.x[i]), i0.map(i => b.y[i]), { fill: C.blue, r: 4, layer: P.back });
    P.dots(i1.map(i => b.x[i]), i1.map(i => b.y[i]), { fill: C.orange, r: 4, layer: P.back });
    const yAt = (x, t) => (Math.log(t / (1 - t)) - b.b - b.w[0] * x) / b.w[1];
    function draw(t) {
      P.clear();
      [0.1, 0.5, 0.9].forEach(q => P.line([-4, 4.5], [yAt(-4, q), yAt(4.5, q)], { stroke: '#c5ccd4', 'stroke-width': 1.3, 'stroke-dasharray': '5 5' }));
      P.line([-4, 4.5], [yAt(-4, t), yAt(4.5, t)], { stroke: C.ink, 'stroke-width': 3 });
      let fp = 0, fn = 0;
      b.label.forEach((y, i) => { const pr = sigmoid(b.w[0] * b.x[i] + b.w[1] * b.y[i] + b.b) >= t ? 1 : 0; if (pr && !y) fp++; if (!pr && y) fn++; });
      n.innerHTML = `Порог t = <b>${fmt(t)}</b> · граница: w·x + b = ln(t/(1−t)) = <b>${fmt(Math.log(t / (1 - t)))}</b> · синих в классе 1: <b>${fp}</b> · оранжевых в классе 0: <b>${fn}</b>`;
    }
    slider(bar, { label: 'Порог t', min: 0.05, max: 0.95, step: 0.01, value: 0.5, on: draw });
    legend(bar, [{ color: C.blue, label: 'класс 0', dot: 1 }, { color: C.orange, label: 'класс 1', dot: 1 }, { color: '#c5ccd4', label: 'p = 0,1 · 0,5 · 0,9' }]);
    draw(0.5);
  };

  // ---------- log loss ----------
  S.logloss = root => {
    const bar = controls(root), P = plot(root, { w: +root.dataset.w || 640, h: 380, x: [0, 1], y: [0, 5], xl: 'предсказанная вероятность класса 1', yl: 'штраф за объект', xf: v => fmt(v, 1) });
    const ps = range(0.005, 0.995, 199), n = note(root);
    P.line(ps, ps.map(p => -Math.log(p)), { stroke: C.orange, layer: P.back, 'stroke-width': 3 });
    P.line(ps, ps.map(p => -Math.log(1 - p)), { stroke: C.blue, layer: P.back, 'stroke-width': 3 });
    P.text(0.07, 3.3, 'y = 1: −ln p', { fill: C.orange, 'font-weight': 600, layer: P.back });
    P.text(0.9, 3.3, 'y = 0: −ln(1 − p)', { fill: C.blue, 'font-weight': 600, 'text-anchor': 'end', layer: P.back });
    function draw(p) {
      P.clear(); P.mark(p, -Math.log(p)); P.mark(p, -Math.log(1 - p), { fill: C.blue });
      n.innerHTML = `p = <b>${fmt(p)}</b> · если на самом деле y = 1, штраф <b>${fmt(-Math.log(p), 3)}</b> · если y = 0, штраф <b>${fmt(-Math.log(1 - p), 3)}</b>`;
    }
    slider(bar, { label: 'Модель сказала p', min: 0.01, max: 0.99, step: 0.01, value: 0.9, on: draw });
    draw(0.9);
  };

  // ---------- Digits ----------
  function digitSvg(parent, vals, color) {
    const svg = h('svg', { viewBox: '0 0 8 8' }, parent);
    vals.forEach((v, i) => h('rect', { x: i % 8, y: Math.floor(i / 8), width: 1.02, height: 1.02, fill: color(v) }, svg));
    return svg;
  }
  S.digits = root => {
    const box = h('div', { class: 'digits' }, root);
    D.digits.examples.forEach(e => {
      const fig = h('figure', {}, box);
      digitSvg(fig, e.img, v => { const g = Math.round(255 - v / 16 * 235); return `rgb(${g},${g},${g})`; });
      const pred = e.p >= 0.5 ? 8 : 3, truth = e.y ? 8 : 3;
      h('figcaption', { html: `ответ: <b>${truth}</b><br>z = ${fmt(e.z, 1)}<br>p(8) = <b>${fmt(e.p, 3)}</b><br><span style="color:${pred === truth ? C.green : C.orange}">${pred === truth ? 'верно' : 'ошибка'}</span>` }, fig);
    });
  };
  S.digitweights = root => {
    const w = D.digits.weights, mx = Math.max(...w.map(Math.abs));
    const wrap = h('div', { style: 'max-width:430px' }, root);
    digitSvg(wrap, w, v => { const a = Math.abs(v) / mx; return v >= 0 ? `rgba(213,103,61,${a})` : `rgba(38,127,208,${a})`; }).setAttribute('style', 'width:100%;display:block;border:1px solid #dfe3e8;border-radius:8px');
    legend(root, [{ color: C.orange, label: 'вес > 0: яркий пиксель повышает score «8»', dot: 1 }, { color: C.blue, label: 'вес < 0: повышает score «3»', dot: 1 }]).setAttribute('style', 'margin-top:10px;flex-direction:column;gap:4px');
  };

  // ---------- порог и цена ошибок ----------
  S.threshold = root => {
    const d = D.threshold, bar = controls(root), ps = panels(root, 'p32');
    const left = h('div', {}, ps), right = h('div', {}, ps);
    const P = plot(left, { w: 740, h: 300, x: [0, 1], y: [-0.6, 1.9], xl: 'предсказанная вероятность класса 1', xf: v => fmt(v, 1), yt: [{ v: 0, label: 'ответ: 0' }, { v: 1, label: 'ответ: 1' }], grid: false, m: { l: 78 } });
    const shade = h('g', {}); P.back.insertBefore(shade, P.back.firstChild);
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const jit = d.y.map(() => (rnd() - 0.5) * 0.7);
    d.y.forEach((y, i) => P.dots([d.p[i]], [y + jit[i]], { fill: y ? C.orange : C.blue, r: 4, opacity: .65, layer: P.back }));
    const stat = t => {
      let tp = 0, fp = 0, fn = 0, tn = 0;
      d.y.forEach((y, i) => { const pr = d.p[i] >= t; if (pr && y) tp++; else if (pr) fp++; else if (y) fn++; else tn++; });
      const prec = tp + fp ? tp / (tp + fp) : 0, rec = tp / (tp + fn), f1 = prec + rec ? 2 * prec * rec / (prec + rec) : 0;
      return { tp, fp, fn, tn, prec, rec, f1, cost: fp + 5 * fn };
    };
    const grid = range(0.01, 0.99, 99).map(t => +t.toFixed(2));
    let bestCost = grid[0], bestF1 = grid[0];
    grid.forEach(t => { if (stat(t).cost <= stat(bestCost).cost) bestCost = t; if (stat(t).f1 > stat(bestF1).f1) bestF1 = t; });
    const Q = plot(left, { w: 740, h: 190, x: [0, 1], y: [0, 210], xl: 'порог t', xf: v => fmt(v, 1), title: 'Стоимость ошибок: FP + 5·FN', yn: 3 });
    Q.line(grid, grid.map(t => stat(t).cost), { stroke: C.ink, layer: Q.back });
    const cm = h('div', { class: 'cm' }, right), rows = h('div', {}, right);
    function draw(t) {
      const m = stat(t);
      P.clear(); Q.clear();
      shade.replaceChildren();
      P.rect(0, -0.6, t, 1.9, { fill: 'rgba(38,127,208,.07)', layer: shade });
      P.rect(t, -0.6, 1, 1.9, { fill: 'rgba(213,103,61,.08)', layer: shade });
      P.seg(t, -0.6, t, 1.9, { stroke: C.ink, 'stroke-width': 2.5 });
      P.text(t, 1.9, '← модель: класс 0', { dx: -8, dy: 18, 'text-anchor': 'end', fill: C.blue, 'font-weight': 600 });
      P.text(t, 1.9, 'модель: класс 1 →', { dx: 8, dy: 18, fill: C.orange, 'font-weight': 600 });
      Q.seg(t, 0, t, 210, { 'stroke-dasharray': '4 4' }); Q.mark(t, m.cost, { r: 6 });
      cm.innerHTML = `<div class="h"></div><div class="h">модель: 1</div><div class="h">модель: 0</div>
        <div class="h">ответ: 1</div><div class="ok">TP<b>${m.tp}</b></div><div class="bad">FN<b>${m.fn}</b></div>
        <div class="h">ответ: 0</div><div class="bad">FP<b>${m.fp}</b></div><div class="ok">TN<b>${m.tn}</b></div>`;
      rows.innerHTML = [['Precision', fmt(m.prec, 3)], ['Recall', fmt(m.rec, 3)], ['F1', fmt(m.f1, 3)], ['Стоимость FP + 5·FN', m.cost]].map(r => `<p class="metric-row"><span>${r[0]}</span><b>${r[1]}</b></p>`).join('');
    }
    const sl = slider(bar, { label: 'Порог t: класс 1, если p ≥ t', min: 0.01, max: 0.99, step: 0.01, value: 0.5, on: draw });
    [['t = 0,5', 0.5], [`минимум стоимости: ${fmt(bestCost)}`, bestCost], [`максимум F1: ${fmt(bestF1)}`, bestF1]].forEach(([l, t]) => button(bar, l, () => { sl.set(t); draw(t); }));
    draw(0.5);
    caption(root, `Учебная синтетика: два нормальных облака, доля класса 1 около ${fmt(d.pos_share * 100, 0)}%, логрег обучен на ${d.n_train} объектах, показаны ${d.y.length} объектов validation. При равной стоимости выбираем больший порог.`);
  };

  // ---------- дерево, бустинг и прямая ----------
  S.treeline = root => {
    const t = D.tree_vs_line, bar = controls(root);
    const P = plot(root, { w: 1240, h: 410, x: [1.3, 6.6], y: [-8, 50], xl: 'Масса, тыс. фунтов', yl: 'Экономичность, mpg', xf: v => fmt(v, 1) });
    P.rect(sm.xmax, -8, 6.6, 50, { fill: '#f6f7f9' });
    P.text(sm.xmax, 50, 'таких тяжёлых машин в train нет', { dx: 10, dy: 20, fill: C.muted, layer: P.back });
    P.seg(1.3, 0, 6.6, 0, { stroke: '#c5ccd4', layer: P.back });
    P.dots(sm.train[0], sm.train[1], { fill: C.gray, opacity: .5, layer: P.back });
    const items = [['line', 'Линейная регрессия', C.blue], ['tree', 'Дерево глубины 3', C.orange], ['boost', 'Бустинг: 100 деревьев глубины 2', C.green]];
    const on = { line: true, tree: true, boost: false };
    function draw() {
      P.clear();
      items.forEach(([k, , col]) => { if (on[k]) P.line(t.grid, t[k].pred, { stroke: col, 'stroke-width': 3 }); });
    }
    items.forEach(([k, label, col]) => {
      const lab = h('label', {}, bar), cb = h('input', { type: 'checkbox' }, lab);
      cb.checked = on[k];
      h('span', { html: `<i style="display:inline-block;width:18px;height:4px;border-radius:2px;background:${col};vertical-align:middle;margin-right:6px"></i>${label} · RMSE validation ${fmt(t[k].val_rmse)}` }, lab);
      cb.addEventListener('change', () => { on[k] = cb.checked; draw(); });
    });
    draw();
  };

  // ---------- граница: логрег и дерево ----------
  S.treeboundary = root => {
    const b = D.blobs, ps = panels(root);
    const nx = b.gx.length, ny = b.gy.length, dx = b.gx[1] - b.gx[0], dy = b.gy[1] - b.gy[0];
    const col = p => p >= 0.5 ? `rgba(213,103,61,${0.08 + (p - 0.5) * 0.5})` : `rgba(38,127,208,${0.08 + (0.5 - p) * 0.5})`;
    [['Логистическая регрессия', (i, j) => sigmoid(b.w[0] * b.gx[i] + b.w[1] * b.gy[j] + b.b), b.acc_lr], ['Дерево глубины 3', (i, j) => b.tree[j * nx + i], b.acc_tree]].forEach(([title, f, acc]) => {
      const P = plot(ps, { w: 608, h: 400, x: [-4, 4.5], y: [-3.6, 4], title: `${title} · доля верных на этих точках ${fmt(acc, 3)}`, xl: 'признак x₁', grid: false });
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) P.rect(b.gx[i] - dx / 2, b.gy[j] - dy / 2, b.gx[i] + dx / 2, b.gy[j] + dy / 2, { fill: col(f(i, j)), 'shape-rendering': 'crispEdges' });
      const i0 = [], i1 = []; b.label.forEach((v, i) => (v ? i1 : i0).push(i));
      P.dots(i0.map(i => b.x[i]), i0.map(i => b.y[i]), { fill: C.blue, r: 3.5, opacity: .9 });
      P.dots(i1.map(i => b.x[i]), i1.map(i => b.y[i]), { fill: C.orange, r: 3.5, opacity: .9 });
    });
    caption(root, 'Учебная синтетика: два нормальных облака по 120 точек, seed = 1. Цвет фона — предсказанная вероятность класса 1; обе модели обучены на показанных точках.');
  };

  document.querySelectorAll('[data-scene]').forEach(el => {
    try { S[el.dataset.scene](el); } catch (e) { console.error('scene', el.dataset.scene, e); el.textContent = 'Ошибка сцены: ' + e.message; }
  });
})();
