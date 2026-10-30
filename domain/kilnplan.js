// Глина · domain/kilnplan.js — подреждане на пещта (v1.33.0)
// Чисти функции, без DOM (tests/kilnplan.test.js). Пренесено от прототипа
// kiln-v0.html (KilnGeo) с една разлика: височината на изделието за проверките е
// h + s (s — подложка под изделието: стойка, бисквитен кръг; 0 ако няма).
//
// Единиците са сантиметри. Началото е центърът на камерата, x надясно, y към
// „12 ч“. Координатите не са задължителни: без тях се проверява само височината.
//
// S (оборудването) идва от пещ в Глина през _planSetup(kiln):
//   {kiln:{shape,d,w,depth,h}, shelves:[вид плоча], postSizes:[см], postD}
// r (планът) е изпичането: {floorH, gap, clear, levels:[{id, shelves:[{ref,x,y,rot}],
//   postH, posts}], pieces:[{id, no, name, h, s, shape, d, w, depth, level, x?, y?}]}

// Ефективна височина за проверките: изделие + подложка.
function effH(p) {
  var h = num(p && p.h);
  if (h == null) return null;
  return h + Math.max(0, num(p.s) || 0);
}
function num(v) {
  if (v === '' || v == null) return null;
  var n = parseFloat(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
}
function r1(v) { return Math.round(v * 10) / 10; }
function shelfType(S, ref) { return (S.shelves || []).find(function (s) { return s.id === ref; }) || null; }

// Контур на плоча в камерата. Видът дава формата и размера, екземплярът на
// нивото — мястото и завъртането. Половинката: дъгата е към „12 ч“ при 0°,
// правият ръб минава през точката на екземпляра.
function shelfShape(t, inst) {
  if (!t) return null;
  inst = inst || {};
  var x = num(inst.x) || 0, y = num(inst.y) || 0, a = (num(inst.rot) || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  function tr(q) { return [x + q[0] * c - q[1] * s, y + q[0] * s + q[1] * c]; }
  if (t.shape === 'rect') {
    var w = num(t.w), d = num(t.depth);
    if (!(w > 0 && d > 0)) return null;
    return { kind: 'poly', pts: [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(tr) };
  }
  var R = num(t.d) / 2;
  if (!(R > 0)) return null;
  if (t.shape === 'half') {
    var pts = [];
    for (var k = 0; k <= 32; k++) { var b = Math.PI * k / 32; pts.push(tr([R * Math.cos(b), R * Math.sin(b)])); }
    return { kind: 'poly', pts: pts };
  }
  return { kind: 'circle', x: x, y: y, r: R };
}
// Плочите на едно ниво. Запис от първия v0 (едно поле `shelf`) се чете като
// една плоча в центъра.
function levelShelves(S, L) {
  if (!L) return [];
  var list = Array.isArray(L.shelves) ? L.shelves : (L.shelf ? [{ ref: L.shelf, x: 0, y: 0, rot: 0 }] : []);
  return list.map(function (inst, i) { var t = shelfType(S, inst.ref); return { i: i, inst: inst, type: t, shape: shelfShape(t, inst) }; });
}
function chamberShape(K) {
  if (!K) return null;
  if (K.shape === 'rect') return shelfShape({ shape: 'rect', w: K.w, depth: K.depth }, {});
  return shelfShape({ shape: 'round', d: K.d }, {});
}

// Основата на изделието: кръг или завъртян правоъгълник. Без размер → null.
function shapeOf(p, x, y) {
  x = x != null ? x : (num(p.x) || 0); y = y != null ? y : (num(p.y) || 0);
  if (p.shape === 'rect') {
    var w = num(p.w), d = num(p.depth);
    if (!(w > 0 && d > 0)) return null;
    var a = (num(p.rot) || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return { kind: 'poly', pts: [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(function (q) {
      return [x + q[0] * c - q[1] * s, y + q[0] * s + q[1] * c];
    }) };
  }
  var dd = num(p.d);
  if (!(dd > 0)) return null;
  return { kind: 'circle', x: x, y: y, r: dd / 2 };
}
function toPoly(sh, n) {
  if (sh.kind === 'poly') return sh.pts;
  n = n || 64; var o = [];
  for (var i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; o.push([sh.x + sh.r * Math.cos(a), sh.y + sh.r * Math.sin(a)]); }
  return o;
}
// Точки по контура — за проверки „всяка точка трябва да е върху нещо“.
function samples(sh) {
  if (sh.kind === 'circle') return toPoly(sh, 48);
  var o = [], P = sh.pts;
  for (var i = 0; i < P.length; i++) {
    var a = P[i], b = P[(i + 1) % P.length];
    for (var k = 0; k < 4; k++) o.push([a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4]);
  }
  return o;
}
function bound(sh) {
  if (sh.kind === 'circle') return { x: sh.x, y: sh.y, r: sh.r };
  var cx = 0, cy = 0; sh.pts.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= sh.pts.length; cy /= sh.pts.length;
  return { x: cx, y: cy, r: Math.max.apply(null, sh.pts.map(function (q) { return Math.hypot(q[0] - cx, q[1] - cy); })) };
}
function xExtent(sh) {
  if (sh.kind === 'circle') return [sh.x - sh.r, sh.x + sh.r];
  var xs = sh.pts.map(function (q) { return q[0]; });
  return [Math.min.apply(null, xs), Math.max.apply(null, xs)];
}
// Колко е извън формата точката (≤ 0 = вътре). Многоъгълниците са изпъкнали
// и обходени обратно на часовника.
function pointOut(p, sh) {
  if (sh.kind === 'circle') return Math.hypot(p[0] - sh.x, p[1] - sh.y) - sh.r;
  var m = -Infinity, P = sh.pts;
  for (var i = 0; i < P.length; i++) {
    var a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (!L) continue;
    var v = ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L;
    if (v > m) m = v;
  }
  return m;
}
function hull(points) {
  var P = points.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  if (P.length < 3) return P;
  function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  var lo = [], up = [], i;
  for (i = 0; i < P.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
  for (i = P.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
// Основата върху плочите на нивото: over = с колко най-много стърчи извън
// всички плочи; bridge = стърчащото е само във фугата между плочите (лежи
// върху две плочи), не навън.
function overhangOn(sh, shapes) {
  shapes = (shapes || []).filter(Boolean);
  if (!sh || !shapes.length) return null;
  if (sh.kind === 'circle' && shapes.length === 1 && shapes[0].kind === 'circle')
    return { over: Math.hypot(sh.x - shapes[0].x, sh.y - shapes[0].y) + sh.r - shapes[0].r, bridge: false };
  var pts = samples(sh), outs = pts.map(function (p) { return Math.min.apply(null, shapes.map(function (s) { return pointOut(p, s); })); });
  var over = Math.max.apply(null, outs), bridge = false;
  if (over > 0.05 && shapes.length > 1) {
    var H = { kind: 'poly', pts: hull([].concat.apply([], shapes.map(samples))) };
    bridge = pts.every(function (p, i) { return outs[i] <= 0.05 || pointOut(p, H) <= 0.05; });
  }
  return { over: over, bridge: bridge };
}
// Съвместимост: колко излиза основата от плоча от този вид в центъра.
function overhang(sh, type) {
  var o = overhangOn(sh, [shelfShape(type, {})]);
  return o ? o.over : null;
}
function chamberOut(sh, K) {
  var C = chamberShape(K);
  if (!sh || !C) return null;
  if (sh.kind === 'circle' && C.kind === 'circle') return Math.hypot(sh.x, sh.y) + sh.r - C.r;
  return Math.max.apply(null, samples(sh).map(function (p) { return pointOut(p, C); }));
}
function axes(P) {
  var o = [];
  for (var i = 0; i < P.length; i++) {
    var a = P[i], b = P[(i + 1) % P.length], nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
    o.push([nx / l, ny / l]);
  }
  return o;
}
function proj(P, ax) {
  var mn = Infinity, mx = -Infinity;
  for (var i = 0; i < P.length; i++) { var v = P[i][0] * ax[0] + P[i][1] * ax[1]; if (v < mn) mn = v; if (v > mx) mx = v; }
  return [mn, mx];
}
function convexIntersect(A, B) {
  var all = axes(A).concat(axes(B));
  for (var i = 0; i < all.length; i++) {
    var a = proj(A, all[i]), b = proj(B, all[i]);
    if (a[1] <= b[0] + 1e-9 || b[1] <= a[0] + 1e-9) return false;
  }
  return true;
}
function segDist(p, a, b) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  var t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function polyDist(A, B) {
  var m = Infinity, i, j;
  for (i = 0; i < A.length; i++) for (j = 0; j < B.length; j++) m = Math.min(m, segDist(A[i], B[j], B[(j + 1) % B.length]));
  for (i = 0; i < B.length; i++) for (j = 0; j < A.length; j++) m = Math.min(m, segDist(B[i], A[j], A[(j + 1) % A.length]));
  return m;
}
// Отстояние между две основи в см; отрицателно = застъпват се. Далечните
// двойки се отсяват по описаните окръжности (долна граница — достатъчна за
// сравнение с отстояние до 10 см).
function gapBetween(a, b) {
  if (a.kind === 'circle' && b.kind === 'circle') return Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;
  var ba = bound(a), bb = bound(b), lo = Math.hypot(ba.x - bb.x, ba.y - bb.y) - ba.r - bb.r;
  if (lo > 10) return lo;
  var A = toPoly(a), B = toPoly(b);
  return convexIntersect(A, B) ? -1 : polyDist(A, B);
}

// Височините: плочите на ниво i лежат върху подпорите, които стоят на ниво
// i−1 (за най-долното — върху подпорите на дъното). Дебелината на нивото е
// на най-дебелата му плоча. Мястото над нивото е височината на подпорите над
// него; над най-горното — до тавана на камерата.
function stack(S, r) {
  var out = [], z = num(r.floorH) || 0, H = num(S.kiln && S.kiln.h);
  r.levels.forEach(function (L, i) {
    var shs = levelShelves(S, L), t = 0, last = i === r.levels.length - 1;
    shs.forEach(function (x) { if (x.type) t = Math.max(t, num(x.type.t) || 0); });
    var bottom = z, top = z + t;
    var space = last ? (H != null ? H - top : null) : num(L.postH);
    out.push({ id: L.id, i: i, bottom: bottom, top: top, space: space, shelves: shs, last: last });
    if (!last) z = top + (num(L.postH) || 0);
  });
  return out;
}

function positioned(p) { return !!p && num(p.x) != null && num(p.y) != null; }
// Зона вместо координати: център / среда / ръб + посока като на часовник.
function zone(x, y, R) {
  x = num(x); y = num(y);
  if (x == null || y == null) return '';
  var d = Math.hypot(x, y); R = num(R) || 25;
  if (d < R / 3) return 'център';
  var a = Math.atan2(x, y) * 180 / Math.PI; if (a < 0) a += 360;
  var h = Math.round(a / 30) % 12; if (h === 0) h = 12;
  return (d < 2 * R / 3 ? 'среда' : 'ръб') + ', ' + h + ' ч';
}
function label(p) { return '#' + p.no + (p.name ? ' ' + p.name : ''); }
function postShapes(S, L) {
  var pr = (num(S.postD) || 4) / 2;
  return (L.posts || []).map(function (q) { return { kind: 'circle', x: num(q.x) || 0, y: num(q.y) || 0, r: pr }; });
}

// Всички проблеми по изделия и по нива. err = не става така;
// warn = не може да се провери или трябва да се погледне.
function check(S, r) {
  var st = stack(S, r), byP = {}, byL = {};
  var gap = Math.max(0, num(r.gap) || 0), clear = Math.max(0, num(r.clear) || 0);
  var H = num(S.kiln && S.kiln.h);
  function add(m, id, x) { (m[id] = m[id] || []).push(x); }
  st.forEach(function (s) {
    var L = r.levels[s.i], shapes = [];
    if (!s.shelves.length) add(byL, L.id, { sev: 'err', kind: 'shelf', msg: 'Нивото няма плоча' });
    s.shelves.forEach(function (x, j) {
      var nm = s.shelves.length > 1 ? 'Плоча ' + (j + 1) : 'Плочата';
      if (!x.type) { add(byL, L.id, { sev: 'err', kind: 'shelf', msg: nm + ': видът е изтрит' }); return; }
      if (!x.shape) { add(byL, L.id, { sev: 'warn', kind: 'shelf', msg: nm + ' няма размер' }); return; }
      shapes.push(x.shape);
      var co = chamberOut(x.shape, S.kiln);
      if (co != null && co > 0.05) add(byL, L.id, { sev: 'err', kind: 'shelfbig', msg: nm + ' излиза от камерата с ' + r1(co) + ' см' });
      for (var k = j + 1; k < s.shelves.length; k++) {
        var y = s.shelves[k];
        if (y.shape && gapBetween(x.shape, y.shape) < -0.05) add(byL, L.id, { sev: 'err', kind: 'shelfhit', msg: 'Плочи ' + (j + 1) + ' и ' + (k + 1) + ' се застъпват' });
      }
    });
    if (s.space != null && s.space <= 0) add(byL, L.id, { sev: 'err', kind: 'nospace', msg: s.last ? 'Нивото стига до тавана на камерата' : 'Няма височина над нивото' });
    if (s.last && H == null) add(byL, L.id, { sev: 'warn', kind: 'noh', msg: 'Височината на камерата не е зададена' });
    if (!s.last && s.space == null) add(byL, L.id, { sev: 'warn', kind: 'noh', msg: 'Височината на подпорите не е зададена' });
    var posts = s.last ? [] : postShapes(S, L);
    if (!s.last && shapes.length) {
      var next = (st[s.i + 1].shelves || []).map(function (x) { return x.shape; }).filter(Boolean);
      posts.forEach(function (q, j) {
        var c = [q.x, q.y];
        if (Math.min.apply(null, shapes.map(function (sh) { return pointOut(c, sh); })) > 0) add(byL, L.id, { sev: 'err', kind: 'postoff', msg: 'Подпора ' + (j + 1) + ' не стои на плоча' });
        else if (next.length && Math.min.apply(null, next.map(function (sh) { return pointOut(c, sh); })) > 0) add(byL, L.id, { sev: 'warn', kind: 'postoff', msg: 'Подпора ' + (j + 1) + ' не е под плоча от горното ниво' });
      });
    }
    var ps = r.pieces.filter(function (p) { return p.level === L.id; });
    // Място на схемата не е задължително: без него се проверява само височината.
    var pieceShapes = ps.map(function (p) { return [p, positioned(p) ? shapeOf(p) : null]; });
    pieceShapes.forEach(function (pr, k) {
      var p = pr[0], sh = pr[1], h = effH(p);
      if (!sh) { if (positioned(p) && shapes.length) add(byP, p.id, { sev: 'warn', kind: 'size', msg: 'Няма размер на основата — мястото не може да се провери' }); }
      else {
        var o = overhangOn(sh, shapes);
        if (o && o.over > 0.05) {
          if (o.bridge) add(byP, p.id, { sev: 'warn', kind: 'bridge', msg: 'Лежи върху фугата между плочите (до ' + r1(o.over) + ' см без опора)' });
          else add(byP, p.id, { sev: 'err', kind: 'out', msg: 'Излиза от плочата с ' + r1(o.over) + ' см', v: o.over });
        }
        posts.forEach(function (q, j) {
          if (gapBetween(sh, q) < 0.3) add(byP, p.id, { sev: 'err', kind: 'post', msg: 'Опира в подпора ' + (j + 1) });
        });
        for (var m = k + 1; m < pieceShapes.length; m++) {
          var p2 = pieceShapes[m][0], sh2 = pieceShapes[m][1];
          if (!sh2) continue;
          var g = gapBetween(sh, sh2);
          if (g < -0.05 || g < gap - 0.05) {
            var w = g < -0.05 ? 'Застъпва се с ' : 'По-близо от ' + gap + ' см до ';
            add(byP, p.id, { sev: 'err', kind: 'hit', msg: w + label(p2), with: p2.id, v: g });
            add(byP, p2.id, { sev: 'err', kind: 'hit', msg: w + label(p), with: p.id, v: g });
          }
        }
      }
      if (h == null) add(byP, p.id, { sev: 'warn', kind: 'size', msg: 'Няма височина — не може да се провери' });
      else if (s.space != null && h + clear > s.space + 0.05)
        add(byP, p.id, { sev: 'err', kind: 'tall', msg: 'По-високо от мястото: ' + r1(h) + ' см, място ' + r1(s.space) + ' см' + (clear ? ' (с ' + clear + ' см отстояние)' : '') });
    });
  });
  return { stack: st, byP: byP, byL: byL };
}

// Подпори по подразбиране за плочите на нивото (за следващото ниво):
// кръгла — n равномерно, първата на 12 ч; половинка — две в краищата на
// правия ръб и една по средата на дъгата; правоъгълна — в ъглите.
function defaultPosts(shs, n, postD) {
  var pr = (num(postD) || 4) / 2, inset = pr + 1.5, o = [];
  (shs || []).forEach(function (x) {
    if (!x.type || !x.shape) return;
    var inst = x.inst || {}, cx = num(inst.x) || 0, cy = num(inst.y) || 0, a = (num(inst.rot) || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), loc;
    var t = x.type;
    if (t.shape === 'rect') {
      var W = num(t.w) / 2 - inset, D = num(t.depth) / 2 - inset;
      if (!(W > 0 && D > 0)) return;
      loc = [[-W, D], [W, D], [W, -D], [-W, -D]];
    } else {
      var R = num(t.d) / 2 - inset;
      if (!(R > 0)) return;
      if (t.shape === 'half') loc = [[-R, inset], [R, inset], [0, R]];
      else { loc = []; for (var i = 0; i < (n || 3); i++) { var b = 2 * Math.PI * i / (n || 3); loc.push([R * Math.sin(b), R * Math.cos(b)]); } }
    }
    loc.forEach(function (q) { o.push({ x: r1(cx + q[0] * c - q[1] * s), y: r1(cy + q[0] * s + q[1] * c) }); });
  });
  return o;
}

// Позиция като на часовник: „2 ч, 14 см от центъра“.
function clock(x, y) {
  x = num(x) || 0; y = num(y) || 0;
  var d = Math.hypot(x, y);
  if (d < 2) return 'в центъра';
  var a = Math.atan2(x, y) * 180 / Math.PI; if (a < 0) a += 360;
  var h = Math.round(a / 30) % 12; if (h === 0) h = 12;
  return h + ' ч, ' + Math.round(d) + ' см от центъра';
}

// Първото свободно място: от ръба на плочите към центъра, като в пещ — ръбът
// се запълва пръв. Фугата между плочи не се предлага (само на ръка).
function findSpot(S, r, L, p) {
  var shs = levelShelves(S, L), shapes = shs.map(function (x) { return x.shape; }).filter(Boolean);
  if (!shapes.length) return null;
  var idx = r.levels.findIndex(function (x) { return x.id === L.id; }), last = idx === r.levels.length - 1;
  var gap = Math.max(0, num(r.gap) || 0);
  var others = r.pieces.filter(function (q) { return q.level === L.id && q.id !== p.id && positioned(q); }).map(function (q) { return shapeOf(q); }).filter(Boolean);
  var posts = last ? [] : postShapes(S, L);
  var R = Math.max.apply(null, shapes.map(function (sh) { var b = bound(sh); return Math.hypot(b.x, b.y) + b.r; }));
  for (var rad = Math.floor(R); rad >= 0; rad -= 1) {
    var steps = rad === 0 ? 1 : Math.max(8, Math.ceil(2 * Math.PI * rad / 1.5));
    for (var k = 0; k < steps; k++) {
      var a = 2 * Math.PI * k / steps, x = r1(rad * Math.sin(a)), y = r1(rad * Math.cos(a));
      var sh = shapeOf(p, x, y);
      if (!sh) return null;
      var o = overhangOn(sh, shapes);
      if (!o || o.over > 0.05) continue;
      var ok = others.every(function (q) { var g = gapBetween(sh, q); return g >= gap - 0.05 && g >= -0.05; }) &&
               posts.every(function (q) { return gapBetween(sh, q) >= 0.3; });
      if (ok) return { x: x, y: y };
    }
  }
  return null;
}

// Защо изделието не може да отиде на това ниво (без търсене на място — то е
// скъпо). null = може да се опита.
function quickReason(S, r, L, p) {
  var s = stack(S, r).find(function (x) { return x.id === L.id; });
  if (!s) return null;
  if (!s.shelves.some(function (x) { return x.shape; })) return { kind: 'shelf', msg: 'нивото няма плоча' };
  if (!shapeOf(p)) return { kind: 'size', msg: 'няма размер на основата — постави на ръка' };
  var h = effH(p), clear = Math.max(0, num(r.clear) || 0);
  if (h == null) return { kind: 'noh', msg: 'няма височина — постави на ръка' };
  if (s.space != null && h + clear > s.space + 0.05) return { kind: 'tall', msg: 'по-високо от мястото на ниво ' + (s.i + 1) + ': ' + r1(h) + (clear ? ' + ' + clear : '') + ' см > ' + r1(s.space) + ' см' };
  return null;
}

// Автоматично подреждане на дадени изделия по дадени нива. Не променя r —
// връща къде да отиде всяко и защо останалите не са сложени. Най-големите
// основи първи; всяко отива на най-ниското място, което му стига по височина.
// order 'height': като planLevels (от най-високото), за да дава същите места,
// които предложението за нива е проверило.
function autoArrange(S, r, ids, levelIds, order) {
  var w = JSON.parse(JSON.stringify(r)), clear = Math.max(0, num(r.clear) || 0);
  var st = stack(S, w).filter(function (s) { return levelIds.indexOf(s.id) >= 0; });
  var res = { placed: [], failed: [] };
  var list = ids.map(function (id) { return w.pieces.find(function (p) { return p.id === id; }); }).filter(Boolean);
  function area(p) { var sh = shapeOf(p); return !sh ? 0 : sh.kind === 'circle' ? Math.PI * sh.r * sh.r : (num(p.w) || 0) * (num(p.depth) || 0); }
  if (order === 'height') list.sort(byHeight); else list.sort(function (a, b) { return area(b) - area(a) || (effH(b) || 0) - (effH(a) || 0); });
  list.forEach(function (p) {
    if (!shapeOf(p)) { res.failed.push({ id: p.id, kind: 'size', msg: 'няма размер на основата — постави на ръка' }); return; }
    var h = effH(p);
    if (h == null) { res.failed.push({ id: p.id, kind: 'noh', msg: 'няма височина — постави на ръка' }); return; }
    var withShelf = st.filter(function (s) { return s.shelves.some(function (x) { return x.shape; }); });
    var cands = withShelf.filter(function (s) { return s.space == null || h + clear <= s.space + 0.05; })
      .sort(function (a, b) { return (a.space == null ? 1e9 : a.space) - (b.space == null ? 1e9 : b.space) || a.i - b.i; });
    if (!cands.length) {
      var mx = Math.max.apply(null, withShelf.map(function (s) { return s.space || 0; }).concat([0]));
      res.failed.push({ id: p.id, kind: 'tall', msg: 'по-високо от мястото' + (withShelf.length > 1 ? ' на всички нива' : '') + ': ' + r1(h) + (clear ? ' + ' + clear : '') + ' см, най-много ' + r1(mx) + ' см' });
      return;
    }
    for (var i = 0; i < cands.length; i++) {
      var L = w.levels[cands[i].i];
      p.level = L.id;
      var spot = findSpot(S, w, L, p);
      if (spot) { p.x = spot.x; p.y = spot.y; res.placed.push({ id: p.id, level: L.id, x: spot.x, y: spot.y }); return; }
    }
    p.level = null;
    res.failed.push({ id: p.id, kind: 'room', msg: 'няма свободно място на ' + (cands.length > 1 ? 'нива ' : 'ниво ') + cands.map(function (c) { return c.i + 1; }).join(', ') });
  });
  return res;
}

// Предложение за нива: колко нива, на каква височина подпорите и кое изделие
// къде. Изделията се вземат от най-високото към най-ниското; всяко отива на
// първото ниво, на чиято плоча се събира (по основата), иначе отваря ново.
// Най-високата група отива горе (там мястото е до тавана, без подпори);
// за останалите подпорите са най-ниската сглобяема височина, която стига.
// Не променя r — връща чернова.
function fc(v) { return String(r1(v)).replace('.', ','); }
function byHeight(a, b) {
  var ha = a._h !== undefined ? num(a._h) : effH(a), hb = b._h !== undefined ? num(b._h) : effH(b);
  if ((ha == null) !== (hb == null)) return ha == null ? 1 : -1;
  return (hb || 0) - (ha || 0) || (num(b.d) || num(b.w) || 0) - (num(a.d) || num(a.w) || 0) || String(a.id).localeCompare(String(b.id));
}
function planLevels(S, r) {
  var clear = Math.max(0, num(r.clear) || 0), H = num(S.kiln && S.kiln.h), floorH = num(r.floorH) || 0;
  var types = (S.shelves || []).filter(function (t) { return t.shape !== 'half' && shelfShape(t, {}); });
  var type = types.slice().sort(function (a, b) { return (num(b.qty) || 0) - (num(a.qty) || 0) || (num(b.d) || 0) - (num(a.d) || 0); })[0];
  var out = { levels: [], problems: [], skipped: [], type: type || null };
  if (!type) { out.problems.push('Няма вид плоча с размер — задай го в „Пещ“.'); return out; }
  var shelves = types.reduce(function (a, t) { return a + (num(t.qty) || 0); }, 0);
  // Празно ниво най-отгоре, за да се броят подпорите на всяко предложено ниво.
  var sim = { floorH: floorH, gap: r.gap, clear: 0, levels: [{ id: 'plan-top', shelves: [], posts: [] }], pieces: [] };
  var groups = [];
  function newGroup() {
    var L = { id: 'plan' + groups.length, shelves: [{ ref: type.id, x: 0, y: 0, rot: 0 }], postH: 99 };
    L.posts = defaultPosts(levelShelves(S, L), 3, S.postD);
    sim.levels.splice(sim.levels.length - 1, 0, L);
    var g = { L: L, ids: [], tall: 0, noBase: 0 };
    groups.push(g); return g;
  }
  var list = r.pieces.slice().sort(byHeight);
  list.forEach(function (p) {
    var h = effH(p) || 0, base = shapeOf(p, 0, 0), q = JSON.parse(JSON.stringify(p));
    q.h = 0; q.x = null; q.y = null;
    if (!base) {
      var g0 = groups.find(function (g) { return g.tall >= h; }) || groups[0] || newGroup();
      g0.ids.push(p.id); g0.noBase++; g0.tall = Math.max(g0.tall, h); return;
    }
    for (var i = 0; i < groups.length; i++) {
      q.level = groups[i].L.id;
      var sp = findSpot(S, sim, groups[i].L, q);
      if (sp) { q.x = sp.x; q.y = sp.y; sim.pieces.push(q); groups[i].ids.push(p.id); groups[i].tall = Math.max(groups[i].tall, h); return; }
    }
    var g = newGroup(); q.level = g.L.id;
    var s2 = findSpot(S, sim, g.L, q);
    if (!s2) { groups.pop(); sim.levels.splice(sim.levels.length - 2, 1); out.skipped.push({ id: p.id, msg: 'основата е по-голяма от плочата' }); return; }
    q.x = s2.x; q.y = s2.y; sim.pieces.push(q); g.ids.push(p.id); g.tall = h;
  });
  if (!groups.length) return out;
  // Редът на нивата (v1.34.2): от всички подредби (до 5 групи) — първо тази, която
  // се събира, после с най-малко подпори една върху друга, после с най-много
  // място до капака. Горе височината не се закръгля до подпори. При повече групи —
  // старото правило: горе отива групата, при която закръгляването губи най-много.
  var combos = postCombos(S.postSizes, Math.max(H || 60, 20));
  var keys = Object.keys(combos).map(Number).sort(function (a, b) { return a - b; });
  function rounded(need) { var k = keys.find(function (v) { return v >= need - 1e-9; }); return k != null ? k : need; }
  var best = 0, bestLoss = -1;
  groups.forEach(function (g, i) { var need = g.tall + clear, loss = rounded(need) - need; if (loss > bestLoss + 1e-9) { best = i; bestLoss = loss; } });
  var ordered = groups.filter(function (g, i) { return i !== best; }).concat([groups[best]]);
  var pick = _planRestack(S, r, ordered, type);
  if (groups.length <= 5) {
    _perms(groups).forEach(function (o) {
      var c = _planRestack(S, r, o, type);
      if (_stackBetter(c, pick)) pick = c;
    });
  }
  out.levels = pick.levels; out.fits = pick.fits; out.problems = out.problems.concat(pick.problems);
  return out;
}
function _perms(a) {
  if (a.length <= 1) return [a.slice()];
  var o = [];
  a.forEach(function (x, i) { _perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(function (p) { o.push([x].concat(p)); }); });
  return o;
}
function _stackBetter(a, b) {
  if (a.fits !== b.fits) return a.fits;
  // Нито една не се събира: по-малкият недостиг е по-добрият.
  if (!a.fits && Math.abs((a.slack || 0) - (b.slack || 0)) > 1e-9) return (a.slack || 0) > (b.slack || 0);
  if (a.problems.length !== b.problems.length) return a.problems.length < b.problems.length;
  if (a.stacked !== b.stacked) return a.stacked < b.stacked;
  return (a.slack || 0) > (b.slack || 0) + 1e-9;
}
// Височините за дадена подредба на групите (отдолу нагоре): подпори под всяко
// ниво без горното, мястото до капака, проблемите. Ползва се и от „Размени“.
function _planRestack(S, r, ordered, type) {
  var clear = Math.max(0, num(r.clear) || 0), H = num(S.kiln && S.kiln.h), floorH = num(r.floorH) || 0;
  var combos = postCombos(S.postSizes, Math.max(H || 60, 20));
  var keys = Object.keys(combos).map(Number).sort(function (a, b) { return a - b; });
  var types = (S.shelves || []).filter(function (t) { return t.shape !== 'half' && shelfShape(t, {}); });
  var shelves = types.reduce(function (a, t) { return a + (num(t.qty) || 0); }, 0);
  var out = { levels: [], problems: [], fits: true, stacked: 0, slack: 0 };
  var t = num(type && type.t) || 0, z = floorH;
  ordered.forEach(function (g, i) {
    var last = i === ordered.length - 1, need = g.tall + clear, lv = { ids: g.ids, tall: g.tall, need: need, noBase: g.noBase, bottom: z, top: z + t };
    if (!last) {
      var k = keys.find(function (v) { return v >= need - 1e-9; });
      lv.postH = k != null ? k : r1(need); lv.combo = k != null ? combos[k] : null;
      out.stacked += k != null ? combos[k].length - 1 : 5;
      if (k == null) out.problems.push('Ниво ' + (i + 1) + ' иска подпори ' + fc(need) + ' см — няма такава комбинация от наличните.');
      z = lv.top + lv.postH;
      lv.space = lv.postH;
    } else lv.space = H != null ? H - lv.top : null;
    out.levels.push(lv);
  });
  var top = out.levels[out.levels.length - 1];
  if (top) {
    out.fits = top.space == null || top.space >= top.need - 0.05;
    out.slack = top.space == null ? 0 : top.space - top.need;
    if (!out.fits) out.problems.push('Не стига височина: горното ниво иска ' + fc(top.need) + ' см, до тавана остават ' + fc(top.space) + ' см (липсват ' + fc(top.need - top.space) + ' см).');
  }
  if (shelves && out.levels.length > shelves) out.problems.push('Нужни са ' + out.levels.length + ' плочи, а в „Пещ“ има ' + shelves + '.');
  return out;
}

// Височини, сглобими от наличните подпори, през 0,1 см:
// {15:[15], 20:[15,5], 12.5:[10,2.5], …}, с най-малко парчета.
function postCombos(sizes, max) {
  sizes = (sizes || []).map(num).filter(function (v) { return v > 0; });
  var U = 10, M = Math.round((num(max) || 60) * U), best = [[]], h;
  var su = sizes.map(function (s) { return Math.round(s * U); });
  for (h = 1; h <= M; h++) {
    best[h] = null;
    for (var k = 0; k < su.length; k++) {
      if (su[k] <= h && best[h - su[k]] && (!best[h] || best[h - su[k]].length + 1 < best[h].length)) best[h] = best[h - su[k]].concat([sizes[k]]);
    }
  }
  var out = {};
  for (h = 1; h <= M; h++) if (best[h]) out[h / U] = best[h].slice().sort(function (a, b) { return b - a; });
  return out;
}

// Размерите от свободния текст в Глина („в8 × ⌀6“, „⌀22“, „20×15×8“), в см.
function parseDims(s) {
  s = String(s || '').replace(/,/g, '.');
  var o = {}, m;
  m = s.match(/(?:⌀|Ø|ø|Ф|ф|D|d)\s*(\d+(?:\.\d+)?)/); if (m) o.d = +m[1];
  m = s.match(/(?:в|В|h|H)\s*(\d+(?:\.\d+)?)/); if (m) o.h = +m[1];
  if (o.d == null && o.h == null) {
    var ns = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    if (ns.length >= 3) { o.w = ns[0]; o.depth = ns[1]; o.h = ns[2]; }
    else if (ns.length === 2) { o.d = ns[0]; o.h = ns[1]; }
    else if (ns.length === 1) o.d = ns[0];
  }
  return o;
}


// ── Глина ↔ геометрията ──────────────────────────────────────────────────────
// Оборудването на пещ от регистъра (v1.32.0) във вида, който функциите очакват.
function _planSetup(k) {
  k = k || {};
  return { kiln: { shape: k.shape || 'round', d: k.d, w: k.w, depth: k.depth, h: k.h },
    shelves: (k.shelves || []).map(function (s) { return { id: s.id, name: s.name, shape: s.shape || 'round', d: s.d, w: s.w, depth: s.depth, t: s.t, qty: s.qty }; }),
    postSizes: ((k.posts && k.posts.sizes) || []).slice(), postD: (k.posts && k.posts.d) || 4 };
}
// Отстоянието по подразбиране според типа изпичане (purpose на изпичането).
function _planGap(k, purpose) {
  var g = (k && k.gaps) || {};
  var key = purpose === 'bisque' ? 'bisque' : purpose === 'glaze' ? 'glaze' : 'other';
  return g[key] != null ? g[key] : 0;
}
// Изпичане от Глина (config + plan.members) → r за функциите.
function _planRun(run) {
  var c = (run && run.config) || {}, m = (run && run.plan && run.plan.members) || [];
  return { floorH: c.floorH || 0, gap: c.gap || 0, clear: c.clear || 0,
    levels: (c.levels || []).map(function (L) { return { id: L.id, shelves: (L.shelves || []).map(function (x) { return Object.assign({}, x); }), postH: L.postH, posts: (L.posts || []).slice() }; }),
    pieces: m.map(function (x, i) { return Object.assign({ no: i + 1 }, x, { level: x.level || null }); }) };
}
// Мерките на всяко ниво като текст: „от дъното 6,6 · плоча 1,6 · място 8 см“.
function _planMeasures(S, r) {
  var st = stack(S, r), H = num(S.kiln && S.kiln.h);
  var top = st.length ? st[st.length - 1] : null;
  return { levels: st.map(function (s) { return { id: s.id, i: s.i, bottom: r1(s.bottom), t: r1(s.top - s.bottom), top: r1(s.top), space: s.space == null ? null : r1(s.space), last: s.last }; }),
    H: H, used: top ? r1(top.top) : 0 };
}
// Събират ли се изделията от едно ниво на плочата му (по реално място, с
// отстоянието и подпорите), без да се записват координати.
function _planRoom(S, r, levelId) {
  var ids = r.pieces.filter(function (p) { return p.level === levelId; }).map(function (p) { return p.id; });
  // Само мястото: височината се проверява отделно (check), затова тук не пречи.
  var w = JSON.parse(JSON.stringify(r));
  w.clear = 0;
  w.pieces.forEach(function (p) { if (p.level === levelId) { p.x = null; p.y = null; if (num(p.h) != null) { p.h = 0; p.s = 0; } } });
  var res = autoArrange(S, w, ids, [levelId]);
  return { ids: ids, placed: res.placed.map(function (x) { return x.id; }), failed: res.failed };
}

// v1.34.0: предложени места (пунктир) за изделията на ниво без записано място —
// около записаните, с отстоянието и подпорите. Височината не пречи (проверява се
// отделно). Не променя r. {placed, failed, map: {id: {x, y}}}
function _planSuggest(S, r, levelId) {
  var ids = r.pieces.filter(function (p) { return p.level === levelId && !positioned(p); }).map(function (p) { return p.id; });
  var out = { placed: [], failed: [], map: {} };
  if (!ids.length) return out;
  var flat = JSON.parse(JSON.stringify(r));
  flat.clear = 0;
  flat.pieces.forEach(function (p) { p._h = effH(p); if (num(p.h) != null) { p.h = 0; p.s = 0; } });
  var res = autoArrange(S, flat, ids, [levelId], 'height');
  res.map = {}; res.placed.forEach(function (x) { res.map[x.id] = x; });
  return res;
}

export { effH, num, r1, shelfType, shelfShape, levelShelves, chamberShape, shapeOf, toPoly, samples, bound, xExtent, pointOut, hull, overhangOn, overhang, chamberOut, axes, proj, convexIntersect, segDist, polyDist, gapBetween, stack, positioned, zone, label, postShapes, check, defaultPosts, clock, findSpot, quickReason, autoArrange, fc, byHeight, planLevels, _perms, _stackBetter, _planRestack, postCombos, parseDims, _planSetup, _planGap, _planRun, _planMeasures, _planRoom, _planSuggest };
