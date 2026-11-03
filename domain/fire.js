// Глина · domain/fire.js — Огнена скала и съвместимост на зареждането (v1.46.0)
// Чисти функции, без DOM и без глобално състояние (tests/fire.test.js).
//
// Скалата е фиксиран речник в кода, не данни: не влиза в архива и не се настройва.
// Праговете са интервали от литературата за определени маси, не константи за всяка
// глина — затова всичко тук говори с „вероятно“. Минаването на праг не значи, че
// реакцията е приключила: степента зависи от време, задръжка, атмосфера, едрина и маса.

export const FIRE_SCALE = [
  { code: 'water', l: 'Свободна вода', lo: 20, hi: 200, clay: 'all', src: 'общо познание', how: 'парата излиза; бързо загряване може да пукне дебели стени' },
  { code: 'organics', l: 'Органика и въглерод', lo: 200, hi: 900, clay: 'all', src: 'Maggetti 2011', how: 'черно ядро в счупването, ако не е изгоряло' },
  { code: 'dehydrox', l: 'Дехидроксилация → керамизация', lo: 450, hi: 700, clay: 'all', src: 'общо познание', how: 'парче, което не се разкисва във вода' },
  { code: 'quartz', l: 'Кварцов скок', lo: 573, hi: 573, clay: 'all', src: 'общо познание', how: 'пукнатини при бързо минаване (нагряване и охлаждане)' },
  { code: 'carbonate', l: 'Разпад на карбонати (пукане на вар ~750–850)', lo: 650, hi: 900, clay: 'calc', src: 'Leicht 1977; Maggetti 2011', how: 'бели точки и отложено пукане след овлажняване' },
  { code: 'vitr-start', l: 'Начало на встъкляване', lo: 800, hi: 900, clay: 'all', red: -50, src: 'Maniatis & Tite 1981', how: 'по-звънък звук, по-малко водопопиваемост' },
  { code: 'ca-silicates', l: 'Ca-силикати, относително стабилен интервал', lo: 850, hi: 1050, clay: 'calc', src: 'Maniatis & Tite 1981', how: 'свиването и водопопиваемостта се менят слабо' },
  { code: 'vitr-ext', l: 'Разширено встъкляване', lo: 950, hi: 1100, clay: 'noncalc', src: 'Maniatis & Tite 1981', how: 'водопопиваемостта пада ясно' },
  { code: 'vitr-full', l: 'Напреднало встъкляване; при преизпичане — подуване', lo: 1100, hi: 1300, clay: 'all', red: -50, src: 'Maniatis & Tite 1981', how: 'стъкловидно счупване; мехури и деформация при преизпичане; зависи силно от флюсите и масата' }
];
// Открити методи: пикът е ориентир (в един съд разликата стига до стотици °C).
export const FIRE_OPEN = { pit: 1, barrel: 1, sawdust: 1, obvara: 1, other: 1 };
export const FIRE_OPEN_BAND = 100; // условна ивица, не измерена точност
const CALC = { strong: 1, weak: 1, possible: 1 };

function num(v) { if (v == null || v === '') return null; var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; }

// Етапите спрямо пика. atmosphere 'reduction' мести встъкляването с −50 °C.
// → {passed, active, ahead}: списъци с етапи {code, l, lo, hi, clay, partial?}
export function _fireStages(peak, atmosphere, method, holdMin) {
  var p = num(peak); if (p == null) return null;
  var red = atmosphere === 'reduction', out = { passed: [], active: [], ahead: [] };
  var hold = num(holdMin), shortOpen = !!FIRE_OPEN[method] && (hold == null || hold < 20);
  FIRE_SCALE.forEach(function (s) {
    var d = red && s.red ? s.red : 0, lo = s.lo + d, hi = s.hi + d;
    var x = { code: s.code, l: s.l, lo: lo, hi: hi, clay: s.clay };
    if (s.code === 'carbonate' && (red || shortOpen) && p >= lo) x.partial = true; // вероятно частичен
    if (p > hi) out.passed.push(x); else if (p >= lo) out.active.push(x); else out.ahead.push(x);
  });
  return out;
}

// Седемте правила. c = {level:'strong'|'weak'|'possible'|'none'|'unknown'|null, grain, share}.
// → [{id, kind:'warn'|'note', text, src}]. Нищо не блокира запис.
export function _fireWarnings(o) {
  o = o || {};
  var p = num(o.peak); if (p == null) return [];
  var atm = o.atmosphere || 'oxidation', open = !!FIRE_OPEN[o.method], hold = num(o.holdMin);
  var c = o.carb || {}, lv = c.level, calc = !!CALC[lv], out = [];
  var who = lv === 'possible' ? ' (в сместа има варовит компонент' + (c.share != null ? ' — около ' + Math.round(c.share) + ' %' : '') + '; не е доказано за цялата маса)' : '';
  var r3 = calc && p >= 650 && p <= 900 && (atm === 'reduction' || (open && (hold == null || hold < 20)));
  if (calc && p >= 650 && p <= 900 && !r3) {
    out.push({ id: 1, kind: lv === 'possible' && c.share != null && c.share < 50 ? 'note' : 'warn', text: (lv === 'possible' ? 'Възможен риск от пукане на вар' : 'Риск от пукане на вар') + who + '. Провери след 1 ден, 1 седмица и 1 месец.', src: 'Leicht 1977' });
    if (c.grain === 'coarse') out.push({ id: 2, kind: 'warn', text: 'Има карбонати над 1 mm: най-рисковият случай.', src: 'Leicht 1977' });
  }
  if (r3) out.push({ id: 3, kind: 'note', text: 'Карбонатите вероятно са се запазили частично' + who + '. По-нисък риск, но провери.', src: 'Leicht 1977; Maggetti 2011' });
  if (calc && p >= 850 && p <= 1050) out.push({ id: 4, kind: 'note', text: 'Вероятно в относително стабилния интервал на варовитите глини (Ca-силикати). Интервалът е различен за всяка маса.', src: 'Maniatis & Tite 1981' });
  if (calc && p > 1050) out.push({ id: 5, kind: lv === 'strong' ? 'warn' : 'note', text: 'Над интервала на Ca-силикатите при някои силно варовити маси встъкляването и омекването тръгват бързо — вероятен риск от деформация и подуване' + who + '. Зависи от CaO, флюсите и тестовете на масата.', src: 'Maniatis & Tite 1981' });
  if (lv === 'unknown' && p >= 650 && p <= 900) out.push({ id: 8, kind: 'note', text: 'Неизвестна варовитост — направи тест с оцет.', src: '' });
  if (p < 600) out.push({ id: 6, kind: 'note', text: 'Може да не е керамизирано. Направи тест с накисване.', src: 'общо познание' });
  if (open) out.push({ id: 7, kind: 'note', text: 'Пикът е ориентир, не измерване — в един съд разликата може да е стотици градуса.', src: 'Maggetti 2011' });
  return out;
}

// Варовитост на материал. get(id) → материал. Суровината носи своята; добавен
// калцит (формула CaCO3) е strong; масата — по компонентите, но един варовит
// компонент не прави цялата смес „силно варовита“: тя е „possible“ с дела му.
// Търговските глини без данни не се оценяват (null).
const RANK = { none: 0, unknown: 1, weak: 2, possible: 3, strong: 4 }, GR = { invisible: 1, small: 2, coarse: 3 };
export function _massCarbonate(mat, get, seen) {
  if (!mat) return null;
  seen = seen || {}; if (seen[mat.id]) return null; seen[mat.id] = 1;
  if (/CaCO\s*[3₃]/i.test(String(mat.formula || ''))) return { level: 'strong', grain: null, from: [{ id: mat.id, name: mat.name, level: 'strong' }], share: 100, added: true };
  if (mat.cat === 'raw') {
    var r = mat.raw || {}, lv = r.carbonate && RANK[r.carbonate] != null && r.carbonate !== 'possible' ? r.carbonate : 'unknown';
    return { level: lv, grain: r.carbonateGrain || null, note: r.carbonateNote || '', from: [{ id: mat.id, name: mat.name, level: lv }], share: lv === 'none' || lv === 'unknown' ? null : 100 };
  }
  var cs = mat.blend && Array.isArray(mat.blend.components) ? mat.blend.components : null;
  if (mat.cat !== 'mass' || !cs) return null;
  var parts = [];
  cs.forEach(function (c) {
    var ref = String(c && c.ref || ''); if (ref.indexOf('mat:') !== 0) return;
    var m = get(ref.slice(4)); if (!m) return;
    var x = _massCarbonate(m, get, Object.assign({}, seen)); if (!x) return;
    parts.push({ id: m.id, name: m.name, level: x.level, grain: x.grain, pct: num(c.pct), x: x });
  });
  if (!parts.length) return { level: 'unknown', grain: null, from: [], share: null };
  var total = cs.reduce(function (n, c) { var p = num(c && c.pct); return n + (p || 0); }, 0);
  var calc = parts.filter(function (p) { return CALC[p.level]; });
  var coarse = calc.reduce(function (g, p) { return GR[p.grain] > (GR[g] || 0) ? p.grain : g; }, null);
  var from = parts.map(function (p) { return { id: p.id, name: p.name, level: p.level, pct: p.pct }; });
  // една-единствена съставка (≈100 %) — масата е самата тя
  if (cs.length === 1 && parts.length === 1) return { level: parts[0].level, grain: parts[0].grain, from: from, share: parts[0].x.share, note: parts[0].x.note || '' };
  if (calc.length) {
    var known = calc.every(function (p) { return p.pct != null; }) && total > 0;
    var share = known ? calc.reduce(function (n, p) { return n + p.pct; }, 0) / total * 100 : null;
    return { level: 'possible', grain: coarse, from: from, share: share != null ? Math.round(share * 10) / 10 : null };
  }
  if (parts.some(function (p) { return p.level === 'unknown'; })) return { level: 'unknown', grain: null, from: from, share: null };
  return { level: 'none', grain: null, from: from, share: null };
}

// Температура от полето: „950-980“ → {lo, hi}; „980“ → {t}; остатъкът (напр.
// „задръжка 20 мин“) — в rest, без тълкуване; без число → {raw}; празно → null.
export function _fireRange(text) {
  if (text == null) return null;
  var s = String(text).trim(); if (!s) return null;
  var m = /^(\d{2,4}(?:[.,]\d+)?)\s*(?:-|–|—|до)\s*(\d{2,4}(?:[.,]\d+)?)\s*(?:°\s*C|°|C)?\s*(.*)$/i.exec(s);
  if (m) { var a = num(m[1]), b = num(m[2]); if (a > b) { var x = a; a = b; b = x; } return { lo: a, hi: b, rest: m[3].trim() || null, text: s }; }
  m = /^(\d{2,4}(?:[.,]\d+)?)\s*(?:°\s*C|°|C)?\s*(.*)$/i.exec(s);
  if (m) return { t: num(m[1]), rest: m[2].trim() || null, text: s };
  return { raw: s, text: s };
}
export const FIRE_KIND = { maker: 'препоръка на производителя', own: 'лично проверена', approx: 'ориентировъчна' };

// Сегменти на профил с начална температура (20 °C в началото).
function segs(ramps) {
  var from = 20, out = [];
  (ramps || []).forEach(function (r) { var to = num(r && r.to); if (to == null) return; out.push({ from: from, to: to, rate: num(r.rate), hold: num(r.hold) }); from = to; });
  return out;
}
// Документирани изисквания на една маса срещу профила. → [{what, res, text}]
export function _fireReqChecks(meta, ramps) {
  var out = []; if (!meta) return out;
  var S = segs(ramps), pk = S.reduce(function (m, s) { return s.to > m ? s.to : m; }, -1), iPk = S.findIndex(function (s) { return s.to === pk; });
  var R = meta.rateMax, H = num(meta.holdMin), C = meta.coolMax;
  if (R && num(R.max) != null) {
    var lo = num(R.from), hi = num(R.to), mx = num(R.max), hit = S.filter(function (s, i) { return i <= iPk && s.to > s.from && Math.max(s.from, lo == null ? -1e9 : lo) < Math.min(s.to, hi == null ? 1e9 : hi); });
    if (!S.length) out.push({ what: 'rate', res: 'unknown', text: 'Скорост до ' + mx + ' °C/h' + (lo != null ? ' в ' + lo + '–' + hi + ' °C' : '') + ' — няма профил за проверка' });
    else if (!hit.length) out.push({ what: 'rate', res: 'ok', text: 'Скорост до ' + mx + ' °C/h' + (lo != null ? ' в ' + lo + '–' + hi + ' °C' : '') + ' — профилът не минава през интервала' });
    else {
      var fast = hit.filter(function (s) { return s.rate != null && s.rate > mx; }), unk = hit.filter(function (s) { return s.rate == null; });
      out.push(fast.length ? { what: 'rate', res: 'conflict', text: 'Скорост до ' + mx + ' °C/h' + (lo != null ? ' в ' + lo + '–' + hi + ' °C' : '') + ' — профилът: ' + fast.map(function (s) { return s.rate + ' °C/h до ' + s.to; }).join(', ') }
        : unk.length ? { what: 'rate', res: 'unknown', text: 'Скорост до ' + mx + ' °C/h — сегмент до ' + unk[0].to + ' °C е без зададена скорост' }
          : { what: 'rate', res: 'ok', text: 'Скорост до ' + mx + ' °C/h — профилът е в границата' });
    }
  }
  if (H != null) {
    var h = iPk >= 0 ? S[iPk].hold : null;
    out.push(!S.length ? { what: 'hold', res: 'unknown', text: 'Задръжка поне ' + H + ' min — няма профил' }
      : (h || 0) >= H ? { what: 'hold', res: 'ok', text: 'Задръжка поне ' + H + ' min — профилът: ' + h + ' min' }
        : { what: 'hold', res: 'conflict', text: 'Задръжка поне ' + H + ' min — профилът: ' + (h ? h + ' min' : 'без задръжка') });
  }
  if (C && num(C.max) != null) {
    var cl = num(C.from), ch = num(C.to), cm = num(C.max), cd = S.filter(function (s, i) { return i > iPk && s.to < s.from && Math.max(s.to, cl == null ? -1e9 : cl) < Math.min(s.from, ch == null ? 1e9 : ch); });
    out.push(!S.length ? { what: 'cool', res: 'unknown', text: 'Охлаждане до ' + cm + ' °C/h — няма профил' }
      : !cd.length ? { what: 'cool', res: 'unknown', text: 'Охлаждане до ' + cm + ' °C/h' + (cl != null ? ' в ' + cl + '–' + ch + ' °C' : '') + ' — профилът няма управлявано охлаждане (свободното не се знае)' }
        : cd.some(function (s) { return s.rate == null; }) ? { what: 'cool', res: 'unknown', text: 'Охлаждане до ' + cm + ' °C/h — свободно охлаждане, скоростта не се знае' }
          : cd.some(function (s) { return s.rate > cm; }) ? { what: 'cool', res: 'conflict', text: 'Охлаждане до ' + cm + ' °C/h — профилът: ' + cd.map(function (s) { return s.rate + ' °C/h'; }).join(', ') }
            : { what: 'cool', res: 'ok', text: 'Охлаждане до ' + cm + ' °C/h — в границата' });
  }
  return out;
}

// Съвместимост на зареждането.
// o: {mode:'bisque'|'glaze', single, kiln, peak, peakSrc:'profile'|'run'|null, ramps,
//     clays:[{key, name, units, matId, text, meta}]}
// → {rows, inter, interAll, pair, verdict:{code, text}}
const ORDER = { ok: 0, orient: 1, unconf: 2, unknown: 3, conflict: 4 };
export function _loadCompat(o) {
  o = o || {};
  var p = num(o.peak), rows = [];
  (o.clays || []).forEach(function (c) {
    var r = c.text != null && c.text !== '' ? _fireRange(c.text) : null, meta = c.meta || {};
    var conf = meta.status === 'confirmed' && meta.kind !== 'approx', row = { key: c.key, name: c.name, units: c.units, matId: c.matId || null, text: c.text || '', range: r, kind: meta.kind || null, confirmed: conf, source: meta.source || '', note: meta.note || '', rest: r && r.rest || null, req: [] };
    if (!c.matId) { row.res = 'unknown'; row.why = 'без материал — няма данни'; }
    else if (!o.kiln) { row.res = 'unknown'; row.why = 'няма надеждно измерена температура'; }
    else if (!r || r.raw) { row.res = 'unknown'; row.why = r && r.raw ? 'стойността не се чете като температура' : 'няма ' + (o.mode === 'bisque' ? 'бисквитна' : 'температура за окончателно изпичане'); }
    else if (p == null) { row.res = 'unknown'; row.why = 'няма пик — избери профил или въведи пик'; }
    else {
      var lo = r.t != null ? r.t : r.lo, hi = r.t != null ? r.t : r.hi;
      if (p >= lo && p <= hi) { row.res = conf ? 'ok' : 'unconf'; row.edge = r.t == null && (p === lo || p === hi) ? (p === lo ? 'lo' : 'hi') : null; row.exact = r.t != null; }
      else { row.res = 'conflict'; row.diff = p < lo ? p - lo : p - hi; }
    }
    if (o.kiln && c.matId) { row.req = _fireReqChecks(meta, o.ramps); row.req.forEach(function (q) { if (ORDER[q.res] > ORDER[row.res]) row.res = q.res; }); }
    if (o.single && row.res === 'ok') row.res = 'orient';
    rows.push(row);
  });
  var span = function (list) {
    var lo = -1e9, hi = 1e9, a = null, b = null;
    list.forEach(function (x) { var l = x.range.t != null ? x.range.t : x.range.lo, h = x.range.t != null ? x.range.t : x.range.hi; if (l > lo) { lo = l; a = x; } if (h < hi) { hi = h; b = x; } });
    return list.length ? (lo <= hi ? { lo: lo, hi: hi } : { none: true, a: a, b: b }) : null;
  };
  var withR = rows.filter(function (x) { return x.range && !x.range.raw && x.matId; });
  var inter = span(withR.filter(function (x) { return x.confirmed; })), interAll = span(withR);
  var n = function (k) { return rows.filter(function (x) { return x.res === k; }).length; };
  var v;
  if (!rows.length) v = { code: 'empty', text: 'Няма изделия или тестове в изпичането.' };
  else if (!o.kiln) v = { code: 'alt', text: 'Алтернативно изпичане — няма надеждно измерена температура; съвместимостта не се оценява категорично.' };
  else if (p == null) v = { code: 'nopeak', text: 'Няма пик — избери профил или въведи пик.' };
  else if (n('conflict')) v = { code: 'conflict', text: 'Потенциален конфликт: ' + rows.filter(function (x) { return x.res === 'conflict'; }).map(function (x) { return x.name; }).join(', ') + '.' };
  else if (o.single) v = { code: 'orient', text: 'Само ориентир: данните са за окончателно изпичане, не доказват пригодност за еднократно.' };
  else if (n('ok') === rows.length) v = { code: 'ok', text: 'Потвърдено за всички ' + rows.length + '.' };
  else v = { code: 'partial', text: 'Непълни данни: ' + [n('unconf') ? n('unconf') + ' по непотвърдени данни' : '', n('unknown') ? n('unknown') + ' неизвестни' : ''].filter(Boolean).join(', ') + '.' };
  return { rows: rows, inter: inter, interAll: interAll, verdict: v, peak: p, peakSrc: o.peakSrc || null };
}

// Вероятен етап на тест на маса — тълкуване, не измерване; никога не се записва.
// o: {slake, poro, series:[poro на другите тестове на същата маса]} → {code, text, basis} или null
export function _testFireStage(o) {
  o = o || {};
  if (o.slake === 'falls') return { code: 'raw', text: 'вероятно некерамизирано', basis: 'парчето се разпада във вода' };
  var po = num(o.poro), all = (o.series || []).map(num).filter(function (x) { return x != null; });
  if (po != null && all.length >= 3) {
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    if (mx - mn < 1) return null; // разликите са твърде малки, за да се тълкуват
    var rel = (po - mn) / (mx - mn);
    var t = rel > 2 / 3 ? 'вероятно поресто' : rel < 1 / 3 ? 'вероятно напреднало синтероване' : 'вероятно синтероване';
    return { code: 'rel', text: t, basis: 'спрямо ' + all.length + ' теста на същата маса (' + mn.toFixed(1).replace('.', ',') + '–' + mx.toFixed(1).replace('.', ',') + ' %), не абсолютен праг' };
  }
  if (o.slake === 'ok' && po == null) return { code: 'ceram', text: 'вероятно керамизирано', basis: 'не се разкисва във вода — само това не доказва завършена керамизация' };
  return null;
}

// Проверки за пукане на вар: +1, +7, +30 дни от датата на теста. Изчислено.
export function _limeDue(testDate, checks, today) {
  if (!testDate) return [];
  var d0 = new Date(testDate + 'T00:00:00Z'); if (isNaN(d0)) return [];
  var iso = function (d) { return d.toISOString().slice(0, 10); };
  var have = (checks || []).map(function (c) { return c && c.date; }).filter(Boolean).sort();
  return [1, 7, 30].map(function (k) {
    var d = iso(new Date(d0.getTime() + k * 864e5));
    return { days: k, date: d, done: have.some(function (x) { return x >= d; }), due: !!today && today >= d };
  });
}
