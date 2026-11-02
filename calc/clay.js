// Глина · calc/clay.js — количество глина и свиване в двете посоки (v1.45.0, фаза 3)
// Чисти функции, без DOM и без глобално състояние (tests/unit.test.js).
//
// Свиване. Сушенето се мери спрямо пластичната дължина, изпичането — спрямо сухата
// (както в calc/shrink.js). Затова не се събират: остава (1−d)·(1−f) от дължината,
// общото е 1 − (1−d)·(1−f). Обратната посока дели на същия множител.
//
// Количество глина. Обемът на стените и дъното по проста геометрия, после по
// плътност на пластичната глина, плюс загуби при обрязване. Всяко неизвестно
// влиза като граници, затова резултатът е диапазон, а допусканията се връщат с него.
// Размерите са в см, дебелините — в мм, количествата — в грамове.

// Число от поле: приема запетая; празно → null; невалидно → NaN.
export function _dec(v) {
  if (v === '' || v == null) return null;
  if (typeof v === 'number') return isFinite(v) ? v : NaN;
  var s = String(v).trim().replace(/\s+/g, '').replace(',', '.');
  if (s === '') return null;
  if (!/^[-+]?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

// Граници, извън които числото е по-скоро грешка при въвеждане.
export const CLAY_LIMITS = { size: [0.1, 200], wall: [1, 60], dens: [1.2, 2.6], dry: [0, 25], fire: [0, 30], total: [0, 40] };
function inR(n, k) { var r = CLAY_LIMITS[k]; return n != null && isFinite(n) && n >= r[0] && n <= r[1]; }

// {dry, fire, total} в % → {k, total, dry, fire, from} или {err}. Сушенето и
// изпичането имат предимство пред общото, когато са дадени.
export function _shrinkCombine(o) {
  o = o || {};
  var d = _dec(o.dry), f = _dec(o.fire), t = _dec(o.total);
  if ([d, f, t].some(function (x) { return x != null && isNaN(x); })) return { err: 'число' };
  if (d != null && !inR(d, 'dry')) return { err: 'сушене ' + CLAY_LIMITS.dry.join('–') + ' %' };
  if (f != null && !inR(f, 'fire')) return { err: 'изпичане ' + CLAY_LIMITS.fire.join('–') + ' %' };
  if (t != null && !inR(t, 'total')) return { err: 'общо ' + CLAY_LIMITS.total.join('–') + ' %' };
  if (d != null || f != null) {
    var k = (1 - (d || 0) / 100) * (1 - (f || 0) / 100);
    return { k: k, total: (1 - k) * 100, dry: d, fire: f, from: d != null && f != null ? 'parts' : (d != null ? 'dry' : 'fire') };
  }
  if (t != null) return { k: 1 - t / 100, total: t, dry: null, fire: null, from: 'total' };
  return null;
}

// Размер при изработване → сух → изпечен. При известни части — и междинният.
export function _shrinkForward(L, s) {
  L = _dec(L); if (L == null || isNaN(L) || !s || s.err) return null;
  var o = { wet: L, fired: L * s.k };
  if (s.dry != null) o.dry = L * (1 - s.dry / 100);
  return o;
}
// Желан краен размер → колко да е при изработване (и сух).
export function _shrinkBack(L, s) {
  L = _dec(L); if (L == null || isNaN(L) || !s || s.err) return null;
  var o = { fired: L, wet: L / s.k };
  if (s.fire != null && s.dry != null) o.dry = L / (1 - s.fire / 100);
  return o;
}
// v1.45.1: липсваща съставка не е нула. Ако е известно само сушенето или само
// изпичането, другата влиза като граници (CLAY_DEF.dry / .fire) и резултатът е
// диапазон, обозначен като ориентировъчен. → [sLo, sHi] (по-малко / повече свиване)
// или null, ако нищо не липсва (или е известно само общото).
export function _shrinkFill(s) {
  if (!s || s.err || (s.from !== 'dry' && s.from !== 'fire')) return null;
  var miss = s.from === 'dry' ? 'fire' : 'dry', R = CLAY_DEF[miss];
  return R.map(function (x) { var o = { dry: s.dry, fire: s.fire }; o[miss] = x; var c = _shrinkCombine(o); c.assumed = miss; return c; });
}
// Множителят „от етапа на измерване към пластично“: размер, измерен при stage, по
// колко се умножава, за да стане размерът при изработване. v1.45.1: връща
// {f:[lo,hi], exact, missing} — exact само когато нужните съставки са измерени;
// иначе липсващата влиза като граници. null — нищо не е известно за свиването.
export function _toWetFactor(stage, s) {
  if (!stage || stage === 'wet' || stage === 'leather-hard') return { f: [1, 1], exact: true };
  if (!s || s.err) return null;
  var inv = function (d, f) { return 1 / ((1 - d / 100) * (1 - f / 100)); };
  var DR = CLAY_DEF.dry, FR = CLAY_DEF.fire, BQ = CLAY_DEF.bisque;
  if (stage === 'bone-dry' || stage === 'bisque') {
    // бисквит: сухият размер плюс малко свиване при бисквитното изпичане (до BQ %, не повече от измереното изпичане)
    var bq = stage === 'bisque' ? (s.fire != null ? Math.min(BQ, s.fire) : BQ) : 0;
    if (s.dry != null) return { f: [inv(s.dry, 0), inv(s.dry, bq)], exact: !bq, missing: bq ? 'bisque' : null };
    if (s.from === 'total') return { f: [inv(Math.min(DR[0], s.total), 0), inv(Math.min(DR[1], s.total), bq)], exact: false, missing: 'split' };
    return { f: [inv(DR[0], 0), inv(DR[1], bq)], exact: false, missing: 'dry' };
  }
  if (s.from === 'parts' || s.from === 'total') return { f: [1 / s.k, 1 / s.k], exact: true };
  if (s.from === 'dry') return { f: [inv(s.dry, FR[0]), inv(s.dry, FR[1])], exact: false, missing: 'fire' };
  return { f: [inv(DR[0], s.fire), inv(DR[1], s.fire)], exact: false, missing: 'dry' };
}

// Формите. vol(dims) в см³; dims: {h, w, depth} в см, {t, b} в см.
export const CLAY_SHAPES = {
  cyl: { l: 'Цилиндър — чаша, ваза, буркан', need: ['h', 'w'], note: 'прави стени, плоско дъно с диаметъра на съда' },
  bowl: { l: 'Купа', need: ['h', 'w'], note: 'стена като сферичен сегмент (отвор Ø, височина); по-дебело дъно Ø ≈ ⅓ от отвора' },
  plate: { l: 'Чиния', need: ['h', 'w'], note: 'плоско дъно Ø ≈ 60 % от диаметъра, борд като пресечен конус' },
  box: { l: 'Правоъгълен съд', need: ['h', 'w', 'depth'], note: 'четири прави стени и плоско дъно' },
  slab: { l: 'Плоско — плочка, пано', need: ['w', 'depth'], note: 'плоча с дебелината на стената (или на дъното)' },
  manual: { l: 'Сложна форма — въвеждам ръчно', need: [], note: '' }
};
function capArea(a, h) { return Math.PI * (a * a + h * h); }
export function _clayVol(shape, d) {
  var h = d.h, w = d.w, L = d.depth, t = d.t, b = d.b, P = Math.PI;
  switch (shape) {
    case 'cyl':
      if (w <= 2 * t || h <= b) return null;
      return P / 4 * (w * w - (w - 2 * t) * (w - 2 * t)) * (h - b) + P / 4 * w * w * b;
    case 'box':
      if (w <= 2 * t || L <= 2 * t || h <= b) return null;
      return (w * L - (w - 2 * t) * (L - 2 * t)) * (h - b) + w * L * b;
    case 'bowl':
      if (w <= 2 * t || h <= t) return null;
      return capArea(w / 2, h) * t + P * (w / 6) * (w / 6) * Math.max(0, b - t);
    case 'plate': {
      var r1 = 0.3 * w, r2 = 0.5 * w; if (h <= b) return null;
      return P * r1 * r1 * b + P * (r1 + r2) * Math.sqrt((r2 - r1) * (r2 - r1) + h * h) * t;
    }
    case 'slab':
      return w * L * (t || b);
    default: return null;
  }
}

// Оценка. o: {shape, h, w, depth, wall, base, dens, at, shrink, count, manual}
// → {lo, hi, mid, per:{lo,hi}, total:{lo,hi}|null, vol:[lo,hi], assume:[], measured:{…}} или {err}.
export const CLAY_DEF = { wall: [5, 8], slab: [7, 10], baseAdd: 2, dens: [1.8, 2.0], loss: [5, 20], shrinkTotal: [10, 14], dry: [4, 8], fire: [4, 8], bisque: 2 };
function r10(n) { return Math.round(n / 10) * 10; }
export function _clayEstimate(o) {
  o = o || {};
  var count = _dec(o.count); if (count == null) count = 1;
  if (isNaN(count) || count < 1 || count > 10000 || Math.round(count) !== count) return { err: 'брой бройки' };
  var A = [];
  if (o.shape === 'manual') {
    var m = _dec(o.manual);
    if (m == null) return { err: 'количество' };
    if (isNaN(m) || m <= 0 || m > 100000) return { err: 'количество' };
    return { lo: m, hi: m, mid: m, manual: true, per: { lo: m, hi: m }, total: count > 1 ? { lo: m * count, hi: m * count } : null, count: count, assume: ['Въведено ръчно — без геометрична оценка.'] };
  }
  var S = CLAY_SHAPES[o.shape]; if (!S) return { err: 'форма' };
  var v = {}, bad = [];
  ['h', 'w', 'depth'].forEach(function (k) { var n = _dec(o[k]); if (n != null && (isNaN(n) || !inR(n, 'size'))) bad.push(k); v[k] = n; });
  if (bad.length) return { err: 'размер', bad: bad };
  var miss = S.need.filter(function (k) { return v[k] == null; });
  if (miss.length) return { err: 'липсва', miss: miss };
  var wall = _dec(o.wall), base = _dec(o.base), dens = _dec(o.dens);
  if (wall != null && (isNaN(wall) || !inR(wall, 'wall'))) return { err: 'стена', bad: ['wall'] };
  if (base != null && (isNaN(base) || !inR(base, 'wall'))) return { err: 'дъно', bad: ['base'] };
  if (dens != null && (isNaN(dens) || !inR(dens, 'dens'))) return { err: 'плътност', bad: ['dens'] };
  // дебелини: въведени или граници
  var W = wall != null ? [wall, wall] : (o.shape === 'slab' ? CLAY_DEF.slab : CLAY_DEF.wall);
  if (wall == null) A.push('Стена — не е въведена; допуснато ' + W.join('–') + ' мм.');
  var B = base != null ? [base, base] : (o.shape === 'slab' ? null : [W[0] + CLAY_DEF.baseAdd, W[1] + CLAY_DEF.baseAdd]);
  if (base == null && B) A.push('Дъно — не е въведено; допуснато ' + B.join('–') + ' мм (стената + ' + CLAY_DEF.baseAdd + ' мм).');
  if (o.shape === 'slab' && base != null && wall == null) { W = [base, base]; A.pop(); }
  // етап на размерите → пластични размери
  var sc = [1, 1], s = o.shrink && !o.shrink.err ? o.shrink : null, shrApprox = false;
  if (o.at && o.at !== 'wet' && o.at !== 'leather-hard') {
    var f = s ? _toWetFactor(o.at, s) : null, AL = '„' + (o.atLabel || o.at) + '“', F3 = function (x) { return x.toFixed(3); };
    if (f) {
      sc = f.f; shrApprox = !f.exact;
      var MS = { dry: 'Свиването при сушене не е измерено — допуснато ' + CLAY_DEF.dry.join('–') + ' %', fire: 'Свиването при изпичане не е измерено — допуснато ' + CLAY_DEF.fire.join('–') + ' %',
        split: 'Известно е само общото свиване (' + (s.total != null ? s.total.toFixed(1).replace('.', ',') : '') + ' %) — делът на сушенето е допуснат ' + CLAY_DEF.dry.join('–') + ' %', bisque: 'Свиване при бисквит — допуснато до ' + CLAY_DEF.bisque + ' % след сушенето' };
      if (f.exact) A.push('Размерите са при ' + AL + ' — увеличени ×' + F3(sc[0]) + ' до размера при изработване (измерено свиване).');
      else A.push('Размерите са при ' + AL + ' — увеличени ×' + F3(sc[0]) + '–' + F3(sc[1]) + ' до размера при изработване. ' + (MS[f.missing] || '') + (f.missing === 'bisque' ? '' : (o.at === 'bisque' ? '; ' + MS.bisque.toLowerCase() : '')) + ' — ориентировъчно.');
    } else {
      var T = CLAY_DEF.shrinkTotal, dry = o.at === 'bone-dry' || o.at === 'bisque';
      var lo = dry ? 1 / (1 - T[0] / 200) : 1 / (1 - T[0] / 100), hi = dry ? 1 / (1 - T[1] / 200) : 1 / (1 - T[1] / 100);
      sc = [lo, hi]; shrApprox = true; A.push('Свиването не е известно — допуснато общо ' + T.join('–') + ' %' + (dry ? ' (около половината — при сушене)' : '') + ' — ориентировъчно.');
    }
  }
  var D = dens != null ? [dens, dens] : CLAY_DEF.dens;
  if (dens == null) A.push('Плътност на пластичната глина — ' + D.join('–').replace(/\./g, ',') + ' г/см³ (обичайно; може да се въведе измерена).');
  var Ls = CLAY_DEF.loss; A.push('Загуби при обрязване и работа — ' + Ls.join('–') + ' %.');
  A.push('Геометрия: ' + S.note + '.');
  var V = [0, 1].map(function (i) {
    return _clayVol(o.shape, { h: v.h != null ? v.h * sc[i] : null, w: v.w * sc[i], depth: v.depth != null ? v.depth * sc[i] : null, t: W[i] / 10 * sc[i], b: B ? B[i] / 10 * sc[i] : 0 });
  });
  if (V[0] == null || V[1] == null || !(V[0] > 0)) return { err: 'геометрия', assume: A };
  var lo = r10(V[0] * D[0] * (1 + Ls[0] / 100)), hi = r10(V[1] * D[1] * (1 + Ls[1] / 100));
  if (hi < lo) { var x = lo; lo = hi; hi = x; }
  lo = Math.max(10, lo); hi = Math.max(lo, hi);
  return { lo: lo, hi: hi, mid: r10((lo + hi) / 2), shrinkApprox: shrApprox, per: { lo: lo, hi: hi }, total: count > 1 ? { lo: lo * count, hi: hi * count } : null, count: count, vol: [Math.round(V[0]), Math.round(V[1])], assume: A };
}

// Реално количество срещу прогнозата: разлика в г и % спрямо средата, в диапазона ли е.
export function _clayCompare(est, actual) {
  var a = _dec(actual);
  if (!est || est.lo == null || est.hi == null || a == null || isNaN(a) || a <= 0) return null;
  var mid = (est.lo + est.hi) / 2;
  return { diff: Math.round(a - mid), pct: Math.round((a - mid) / mid * 1000) / 10, inRange: a >= est.lo && a <= est.hi };
}
