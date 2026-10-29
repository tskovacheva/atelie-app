// Глина · domain/kiln.js — пещи и оборудване (v1.32.0)
// Чисти функции, без DOM (tests/unit.test.js).
//
// Пещ: {id, name, shape:'round'|'rect', d | w×depth, h (вътрешни, см), volume (л),
//   power (kW), maxTemp (°C), ref (какво е „12 ч“ за схемата), checked,
//   shelves:[{id, name, shape:'round'|'half'|'rect', d | w×depth, t, qty}],
//   posts:{sizes:[см…], d:см}, gaps:{bisque, glaze, other} (см), clear (см), notes}
// Подреждането (нива, места) идва в следващите версии; тук е само регистърът.

export const KILN_PRESETS = [
  { key: 'kittec-cb80-double', label: 'Kittec CB 80 Double — Ø51 × 38 см, 79 л, 3,6 kW',
    kiln: { name: 'Kittec CB 80 Double', shape: 'round', d: 51, h: 38, volume: 79, power: 3.6, maxTemp: 1320, checked: true,
      shelves: [{ name: 'Кръгла Ø47', shape: 'round', d: 47, t: 1.6, qty: 3 }],
      posts: { sizes: [5, 10, 15], d: 4 } } }
];

export const KILN_DEFAULTS = { gaps: { bisque: 0, glaze: 1, other: 0.5 }, clear: 0.5 };

export function _numOrNullPos(v) {
  if (v === '' || v == null) return null;
  var n = parseFloat(String(v).replace(',', '.'));
  return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

// Наличните височини на подпори: числа > 0, без повторения, възходящо.
export function _postSizesNorm(list) {
  var seen = {}, out = [];
  (list || []).forEach(function (v) { var n = _numOrNullPos(v); if (n > 0 && !seen[n]) { seen[n] = 1; out.push(n); } });
  return out.sort(function (a, b) { return a - b; });
}

// Нова пещ: празна или от готов модел. `newId` дава id-та (за пещта и плочите).
export function _kilnNew(presetKey, newId) {
  var p = KILN_PRESETS.find(function (x) { return x.key === presetKey; });
  var k = p ? JSON.parse(JSON.stringify(p.kiln)) : { name: '', shape: 'round', checked: false, shelves: [], posts: { sizes: [], d: 4 } };
  k.id = newId();
  (k.shelves || []).forEach(function (s) { s.id = newId(); });
  k.gaps = Object.assign({}, KILN_DEFAULTS.gaps, k.gaps || {});
  if (k.clear == null) k.clear = KILN_DEFAULTS.clear;
  if (p) k.preset = p.key;
  return k;
}

function f(n) { return String(n).replace('.', ','); }
// „Ø51 × 38 см · 79 л · 3,6 kW“
export function _kilnSummary(k) {
  if (!k) return '';
  var dims = k.shape === 'rect'
    ? (k.w != null && k.depth != null ? f(k.w) + ' × ' + f(k.depth) : '')
    : (k.d != null ? 'Ø' + f(k.d) : '');
  if (k.h != null) dims = (dims ? dims + ' × ' : 'в') + f(k.h);
  var out = [];
  if (dims) out.push(dims + ' см');
  if (k.volume != null) out.push(f(k.volume) + ' л');
  if (k.power != null) out.push(f(k.power) + ' kW');
  return out.join(' · ');
}

// Плочите като текст: „3× Кръгла Ø47 (1,6 см)“.
export function _shelvesSummary(k) {
  return ((k && k.shelves) || []).map(function (s) {
    var size = s.shape === 'rect' ? f(s.w || 0) + '×' + f(s.depth || 0) : 'Ø' + f(s.d || 0);
    return (s.qty ? s.qty + '× ' : '') + (s.name || size) + (s.t != null ? ' (' + f(s.t) + ' см)' : '');
  }).join(', ');
}

// Проверки за смисъл, не за забрана: връща списък с предупреждения.
export function _kilnWarnings(k) {
  var w = [];
  if (!k) return w;
  if (!k.name) w.push('Няма име.');
  var inner = k.shape === 'rect' ? null : k.d;
  if (k.h == null) w.push('Няма вътрешна височина — проверката по височина няма да работи.');
  if (k.shape !== 'rect' && k.d == null) w.push('Няма вътрешен диаметър.');
  if (k.shape === 'rect' && (k.w == null || k.depth == null)) w.push('Няма вътрешна ширина или дълбочина.');
  (k.shelves || []).forEach(function (s) {
    if (inner != null && s.shape !== 'rect' && s.d != null && s.d > inner) w.push('Плоча „' + (s.name || '') + '“ е по-голяма от камерата.');
    if (s.t == null) w.push('Плоча „' + (s.name || '') + '“ няма дебелина.');
  });
  return w;
}
