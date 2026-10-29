// Глина · domain/traits.js — основни характеристики на изделието (v1.31.1)
// Чисти функции, без DOM (tests/unit.test.js).
//
// Полетата са незадължителни и живеят до старите `dimensions` (свободен текст)
// и `weight` (текущо тегло), без да ги заменят:
//   size       {h, w, depth, at, approx} — височина, ширина/диаметър, дълбочина
//              в см; без дълбочина основата е кръгла (w е диаметърът); `at` е
//              етапът при измерването; `approx` — приблизително.
//   startMass  начално количество глина, г (за серия — на една бройка).
//   wall, base дебелина на стената и на дъното, мм.
//   categories списък от категории; `type` остава свободен текст.
// Пълната история на измерванията е за следваща версия: тогава тези полета
// стават „последното известно“ и първото измерване.

export const CATEGORIES = ['Чаши', 'Купи', 'Чинии', 'Вази', 'Съдове за храна', 'Музикални инструменти', 'Окарини', 'Свирки',
  'Декорация', 'Скулптура', 'Плочки', 'Тестови образци'];

export function _numPos(v) {
  if (v === '' || v == null) return null;
  var n = parseFloat(String(v).replace(',', '.'));
  return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

// От полетата на формуляра (низове) към записа. Нищо попълнено → null.
export function _readSize(h, w, depth, at, approx) {
  var s = { h: _numPos(h), w: _numPos(w), depth: _numPos(depth) };
  if (s.h == null && s.w == null && s.depth == null) return null;
  Object.keys(s).forEach(function (k) { if (s[k] == null) delete s[k]; });
  if (at) s.at = at;
  if (approx) s.approx = true;
  return s;
}

function fmt(n) { return String(n).replace('.', ','); }
// „в12 × Ø8 см“, „в2 × 20 × 15 см“, „Ø22 см“.
export function _sizeLabel(s) {
  if (!s || typeof s !== 'object') return '';
  var parts = [];
  if (s.h != null) parts.push('в' + fmt(s.h));
  if (s.w != null && s.depth != null) parts.push(fmt(s.w) + ' × ' + fmt(s.depth));
  else if (s.w != null) parts.push('Ø' + fmt(s.w));
  else if (s.depth != null) parts.push('д' + fmt(s.depth));
  return parts.length ? parts.join(' × ') + ' см' : '';
}

// Размерите от свободния текст („в8 × ⌀6“, „⌀22“, „20×15×8“), в см. Ползва се
// само по изричен бутон „Попълни от текста“ — не се гадае при отваряне.
export function _parseDims(text) {
  var t = String(text || '').replace(/,/g, '.'), o = {}, m;
  m = t.match(/(?:⌀|Ø|ø|Ф|ф|D|d)\s*(\d+(?:\.\d+)?)/); if (m) o.w = +m[1];
  m = t.match(/(?:в|В|h|H)\s*(\d+(?:\.\d+)?)/); if (m) o.h = +m[1];
  if (o.w == null && o.h == null) {
    var ns = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    if (ns.length >= 3) { o.w = ns[0]; o.depth = ns[1]; o.h = ns[2]; }
    else if (ns.length === 2) { o.w = ns[0]; o.h = ns[1]; }
    else if (ns.length === 1) o.w = ns[0];
  }
  return o;
}

// Категориите: подрязани, без празни и повторения, в реда на въвеждане.
export function _catsNorm(list) {
  var seen = {}, out = [];
  (list || []).forEach(function (c) {
    c = String(c == null ? '' : c).replace(/\s+/g, ' ').trim();
    var k = c.toLowerCase();
    if (c && !seen[k]) { seen[k] = 1; out.push(c); }
  });
  return out;
}

// Размер за подреждане в пещ: структурираният, ако го има, иначе от текста.
// {shape:'round'|'rect', d, w, depth, h, source:'size'|'text'} или null.
export function _kilnSize(rec) {
  if (!rec) return null;
  var s = rec.size && typeof rec.size === 'object' ? rec.size : null, src = 'size';
  if (!s || (s.h == null && s.w == null)) { s = _parseDims(rec.dimensions); src = 'text'; if (s.h == null && s.w == null) return null; }
  var out = { h: s.h != null ? s.h : null, source: src };
  if (s.w != null && s.depth != null) { out.shape = 'rect'; out.w = s.w; out.depth = s.depth; }
  else { out.shape = 'round'; out.d = s.w != null ? s.w : null; }
  return out;
}
