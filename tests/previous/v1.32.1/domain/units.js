// Глина · domain/units.js — идентичност на изделията (v1.31.0)
// Чисти функции, без DOM и без глобално състояние (tests/unit.test.js).
//
// Код: GL-<година>-<номер>, напр. GL-2026-014. Латиница заради двуезичието
// (решение 3 от 28.10). Номерът расте в рамките на годината и не се
// преизползва. Отделените бройки нямат собствен код: техният е кодът на серията
// + номерата им (GL-2026-014/3, GL-2026-014/3–6) и се извежда при показване.
//
// Бройки: всяка физическа бройка в серия има номер 1, 2, 3… Номерът не се
// преизползва (FS 2.0 §3.3): серията пази следващия свободен (`nextUnitNo`) и
// отписаните номера (`retiredUnits`). Отделеното изделие носи своите номера в
// `units`. Неотделените бройки не са записи — техните номера са „останалите“.

export const CODE_PREFIX = 'GL';

export function _codeParse(code) {
  var m = /^([A-Z]{2,4})-(\d{4})-(\d{3,})$/.exec(String(code || ''));
  return m ? { prefix: m[1], year: +m[2], n: +m[3] } : null;
}
function pad(n) { return n < 1000 ? ('00' + n).slice(-3) : String(n); }
export function _codeFormat(year, n) { return CODE_PREFIX + '-' + year + '-' + pad(n); }

// Годината на запис: от датата на създаване, после от датата на изделието.
export function _codeYear(rec, fallbackYear) {
  var s = (rec && (rec.createdAt || rec.date)) || '';
  var m = /^(\d{4})/.exec(String(s));
  return m ? +m[1] : fallbackYear;
}

// Следващият код за годината, като се гледат всички вече раздадени.
export function _nextCode(codes, year) {
  var max = 0;
  (codes || []).forEach(function (c) { var p = _codeParse(c); if (p && p.year === year && p.n > max) max = p.n; });
  return _codeFormat(year, max + 1);
}

// Кодове за записи без код, по реда на създаване; съществуващите не се пипат.
// Връща {id: code}.
export function _assignCodes(records, existingCodes, fallbackYear) {
  var codes = (existingCodes || []).slice(), out = {};
  var todo = (records || []).filter(function (r) { return r && !r.code; }).slice().sort(function (a, b) {
    var ka = String(a.createdAt || a.date || ''), kb = String(b.createdAt || b.date || '');
    return ka < kb ? -1 : ka > kb ? 1 : String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0;
  });
  todo.forEach(function (r) { var c = _nextCode(codes, _codeYear(r, fallbackYear)); out[r.id] = c; codes.push(c); });
  return out;
}

function qtyOf(m) { var q = parseInt(m && m.qty, 10); return isNaN(q) || q < 1 ? 1 : q; }
function countOf(se) { var n = parseInt(se && se.count, 10); return isNaN(n) || n < 1 ? 1 : n; }

// Следващият номер: записан, или изведен за серия отпреди v1.31.0.
export function _seriesNextUnit(se, members) {
  var n = parseInt(se && se.nextUnitNo, 10);
  if (!isNaN(n) && n > 0) return n;
  var held = (members || []).reduce(function (a, m) { return a + qtyOf(m); }, 0);
  return Math.max(countOf(se), held) + 1;
}

// Номерата, които държат отделените изделия.
export function _seriesTakenUnits(members) {
  var out = [];
  (members || []).forEach(function (m) { (Array.isArray(m.units) ? m.units : []).forEach(function (u) { out.push(+u); }); });
  return out;
}

// Номерата на неотделените бройки, във възходящ ред.
export function _seriesFreeUnits(se, members) {
  var next = _seriesNextUnit(se, members), taken = {}, retired = {};
  _seriesTakenUnits(members).forEach(function (u) { taken[u] = 1; });
  (Array.isArray(se && se.retiredUnits) ? se.retiredUnits : []).forEach(function (r) { retired[+(r && r.no != null ? r.no : r)] = 1; });
  var out = [];
  for (var u = 1; u < next; u++) if (!taken[u] && !retired[u]) out.push(u);
  return out;
}

// Отделяне на n бройки: най-ниските свободни номера. null, ако не стигат.
export function _allocUnits(se, members, n) {
  var free = _seriesFreeUnits(se, members);
  return n > 0 && free.length >= n ? free.slice(0, n) : null;
}

// Смяна на броя. Увеличение: нови номера след последния. Намаление: отписват
// се най-високите неотделени номера — никога отделени. Връща промените, без да
// пипа серията: {nextUnitNo, retire:[номера], add:[номера]} или {error}.
export function _countChange(se, members, newCount) {
  newCount = parseInt(newCount, 10);
  if (isNaN(newCount) || newCount < 1) return { error: 'count' };
  var held = (members || []).reduce(function (a, m) { return a + qtyOf(m); }, 0);
  if (newCount < held) return { error: 'below-split', held: held };
  var next = _seriesNextUnit(se, members), cur = countOf(se), d = newCount - cur;
  if (d >= 0) {
    var add = []; for (var i = 0; i < d; i++) add.push(next + i);
    return { nextUnitNo: next + d, retire: [], add: add };
  }
  var free = _seriesFreeUnits(se, members);
  if (free.length < -d) return { error: 'below-split', held: held };
  return { nextUnitNo: next, retire: free.slice(free.length + d), add: [] };
}

// Номера за показване: /3, /3–6, /1, 4, 7.
export function _unitsLabel(units) {
  var u = (units || []).map(Number).filter(function (x) { return x > 0; }).sort(function (a, b) { return a - b; });
  if (!u.length) return '';
  var consecutive = u.every(function (x, i) { return i === 0 || x === u[i - 1] + 1; });
  if (u.length > 2 && consecutive) return '/' + u[0] + '–' + u[u.length - 1];
  return '/' + u.join(', ');
}

// Миграция на серия отпреди v1.31.0: номера на отделените по реда им (seriesNo,
// после създаване), без да се сменя брой или етап. Връща {nextUnitNo, units:{id:[…]}}.
export function _migrateSeriesUnits(se, members) {
  var list = (members || []).slice().sort(function (a, b) {
    var na = parseInt(a.seriesNo, 10), nb = parseInt(b.seriesNo, 10);
    if (isNaN(na)) na = 1e9; if (isNaN(nb)) nb = 1e9;
    return na - nb || String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || String(a.id).localeCompare(String(b.id));
  });
  var next = 1, units = {};
  list.forEach(function (m) {
    if (Array.isArray(m.units) && m.units.length) { units[m.id] = m.units.slice(); m.units.forEach(function (u) { if (u >= next) next = u + 1; }); return; }
    var q = qtyOf(m), mine = [];
    for (var i = 0; i < q; i++) mine.push(next++);
    units[m.id] = mine;
  });
  var held = next - 1;
  return { nextUnitNo: Math.max(countOf(se), held) + 1, units: units };
}
