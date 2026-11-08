// Глина · domain/glazy.js — внос и износ на рецепти (v1.52.0)
// Чисти функции — без DOM и без глобално състояние; тестват се директно
// (tests/unit.test.js, tests/glazy.test.js). Класическият код ги вижда през моста.
//
// Правилата (решения от 8.11.2026):
//   • YAML от Glazy (един или много рецепти във файла) и файл, изнесен от Глина
//     (JSON или YAML). Нищо не се записва без преглед и потвърждение.
//   • Добавките (Additional: true) остават над основата — не влизат в 100 %.
//   • Материал се свързва сам само при точно име или запомнено друго име.
//     Сродните кандидати чакат избор; химически различен материал не се предлага.
//   • Повторен внос се разпознава по номера в Glazy (или по id на Глина) и не
//     презаписва нищо.

// ── YAML: подмножеството, което пишат Glazy и Глина ─────────────────────────
// Блокови списъци и речници с отстъп, скалари в '…' или "…" (и на няколко реда),
// [списък, на, един, ред], числа, true/false/null, # коментари. Котви, тагове и
// блокови скалари (| >) не се поддържат — Glazy не ги ползва.
function _yLines(text) {
  return String(text || '').replace(/^﻿/, '').split(/\r?\n/).map(function (raw, n) {
    var ind = raw.match(/^ */)[0].length;
    return { ind: ind, t: raw.slice(ind).replace(/\s+$/, ''), raw: raw, n: n + 1 };
  });
}
function _yQuoteEnd(s, q) { // индексът на затварящата кавичка или -1
  for (var i = 1; i < s.length; i++) {
    if (q === "'") { if (s[i] === "'") { if (s[i + 1] === "'") { i++; continue; } return i; } }
    else { if (s[i] === '\\') { i++; continue; } if (s[i] === '"') return i; }
  }
  return -1;
}
function _yErr(line, msg) { var e = new Error('YAML, ред ' + line + ': ' + msg); e.yamlLine = line; return e; }
function _yScalarText(s, line) {
  s = s.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s[0] === "'") { var e = _yQuoteEnd(s, "'"); if (e < 0) throw _yErr(line, 'незатворена кавичка'); return s.slice(1, e).replace(/''/g, "'"); }
  if (s[0] === '"') { var e2 = _yQuoteEnd(s, '"'); if (e2 < 0) throw _yErr(line, 'незатворена кавичка'); try { return JSON.parse(s.slice(0, e2 + 1)); } catch (x) { throw _yErr(line, 'неразчетим низ'); } }
  if (s[0] === '[') {
    if (s[s.length - 1] !== ']') throw _yErr(line, 'незатворен списък');
    var body = s.slice(1, -1), out = [], cur = '', q = '';
    for (var i = 0; i < body.length; i++) {
      var c = body[i];
      if (q) { cur += c; if (c === q) { if (q === "'" && body[i + 1] === "'") { cur += "'"; i++; } else q = ''; } else if (q === '"' && c === '\\') { cur += body[++i]; } continue; }
      if (c === "'" || c === '"') { q = c; cur += c; continue; }
      if (c === ',') { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim() !== '' || out.length) out.push(cur);
    return out.map(function (x) { return _yScalarText(x, line); });
  }
  if (s[0] === '{') throw _yErr(line, 'речник на един ред не се поддържа');
  var h = s.indexOf(' #'); if (h >= 0) s = s.slice(0, h).trim();
  if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s)) return Number(s);
  return s;
}
// Скалар, който може да продължи на следващите редове (кавичка, незатворена на реда).
function _yScalar(L, i, s) {
  var t = s.trim(), q = t[0];
  if ((q === "'" || q === '"') && _yQuoteEnd(t, q) < 0) {
    var acc = t, j = i + 1, blank = false;
    while (j < L.length) {
      var x = L[j].raw.trim();
      if (x === '') { acc += '\n'; blank = true; j++; continue; }
      acc += (blank || /\n$/.test(acc) ? '' : ' ') + x; blank = false; j++;
      if (_yQuoteEnd(acc, q) >= 0) break;
    }
    return [_yScalarText(acc, L[i].n), j];
  }
  return [_yScalarText(t, L[i].n), i + 1];
}
function _yIsDash(t) { return t === '-' || t.slice(0, 2) === '- '; }
function _yKey(t) { // 'Ключ: стойност' → [ключ, стойност] или null
  var q = '', i;
  for (i = 0; i < t.length; i++) {
    var c = t[i];
    if (q) { if (c === q) q = ''; continue; }
    if ((c === "'" || c === '"') && i === 0) { q = c; continue; }
    if (c === ':' && (i === t.length - 1 || t[i + 1] === ' ')) {
      var k = t.slice(0, i).trim();
      if (k[0] === "'" || k[0] === '"') k = _yScalarText(k, 0);
      return [String(k), t.slice(i + 1).trim()];
    }
  }
  return null;
}
function _ySkip(L, i) { while (i < L.length && (L[i].t === '' || L[i].t[0] === '#')) i++; return i; }
function _yBlock(L, i, ind) {
  i = _ySkip(L, i);
  if (i >= L.length) return [null, i];
  return _yIsDash(L[i].t) ? _ySeq(L, i, ind) : _yMap(L, i, ind);
}
function _ySeq(L, i, ind) {
  var out = [];
  while ((i = _ySkip(L, i)) < L.length && L[i].ind === ind && _yIsDash(L[i].t)) {
    var rest = L[i].t.slice(1).replace(/^ +/, '');
    if (rest === '') {
      var j = _ySkip(L, i + 1);
      if (j < L.length && L[j].ind > ind) { var r = _yBlock(L, j, L[j].ind); out.push(r[0]); i = r[1]; }
      else { out.push(null); i = i + 1; }
    } else if (_yKey(rest) && rest[0] !== "'" && rest[0] !== '"' && rest[0] !== '[') {
      // „- Ключ: стойност“ — речник, който започва на реда на тирето
      var sub = ind + (L[i].t.length - rest.length);
      var saved = L[i]; L[i] = { ind: sub, t: rest, raw: ' '.repeat(sub) + rest, n: saved.n };
      var rm = _yMap(L, i, sub); L[i] = saved; out.push(rm[0]); i = rm[1];
    } else {
      var rs = _yScalar(L, i, rest); out.push(rs[0]); i = rs[1];
    }
  }
  return [out, i];
}
function _yMap(L, i, ind) {
  var out = {};
  while ((i = _ySkip(L, i)) < L.length && L[i].ind === ind && !_yIsDash(L[i].t)) {
    var kv = _yKey(L[i].t);
    if (!kv) throw _yErr(L[i].n, 'очаква се „ключ: стойност“');
    if (kv[1] === '') {
      var j = _ySkip(L, i + 1);
      if (j < L.length && (L[j].ind > ind || (L[j].ind === ind && _yIsDash(L[j].t)))) { var r = _yBlock(L, j, L[j].ind); out[kv[0]] = r[0]; i = r[1]; }
      else { out[kv[0]] = null; i = i + 1; }
    } else {
      var rs = _yScalar(L, i, kv[1]); out[kv[0]] = rs[0]; i = rs[1];
    }
  }
  if (i < L.length && L[i].ind > ind) throw _yErr(L[i].n, 'неочакван отстъп');
  return [out, i];
}
export function _yamlParse(text) {
  var L = _yLines(text), i = _ySkip(L, 0);
  if (i >= L.length) return null;
  var r = _yBlock(L, i, L[i].ind), j = _ySkip(L, r[1]);
  if (j < L.length) throw _yErr(L[j].n, 'неочакван отстъп');
  return r[0];
}
function _yStr(v) { return JSON.stringify(String(v)); } // двойни кавички — валиден YAML
function _yVal(v) {
  if (v == null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return '[' + v.map(_yVal).join(', ') + ']';
  return _yStr(v);
}
function _yEmit(v, ind, out) { // само обекти с ключове, масиви от обекти и скалари
  var pad = ' '.repeat(ind);
  if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null) {
    v.forEach(function (x) { out.push(pad + '-'); _yEmit(x, ind + 2, out); });
    return;
  }
  Object.keys(v).forEach(function (k) {
    var x = v[k];
    if (x === undefined) return;
    if (x && typeof x === 'object' && (!Array.isArray(x) || (x.length && typeof x[0] === 'object'))) {
      out.push(pad + k + ':'); _yEmit(x, ind + 2, out);
    } else out.push(pad + k + ': ' + _yVal(x));
  });
}

// ── Четене на файла ─────────────────────────────────────────────────────────
// Връща {drafts:[…], errors:[…]}. Черновата е всичко, което файлът казва за една
// рецепта, още без връзки към материалите.
export function _glazyParseFile(text, fileName) {
  var t = String(text || '').trim(), data, errors = [];
  if (!t) return { drafts: [], errors: ['Файлът е празен.'] };
  var isJson = /\.json$/i.test(fileName || '') || t[0] === '{' || (t[0] === '[' && /^\[\s*[{\]]/.test(t));
  try { data = isJson ? JSON.parse(t) : _yamlParse(t); }
  catch (e) { return { drafts: [], errors: [(isJson ? 'JSON: ' : '') + (e && e.message || String(e))] }; }
  var list;
  if (data && !Array.isArray(data) && data.format === 'glina-recipes' && Array.isArray(data.recipes)) list = data.recipes.map(function (r) { return { __glina: r }; });
  else if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object') list = [data];
  else return { drafts: [], errors: ['Във файла няма рецепти.'] };
  var drafts = [];
  list.forEach(function (o, k) {
    try {
      var d = o && o.__glina ? _draftFromGlina(o.__glina) : _draftFromGlazy(o);
      if (!d.name) throw new Error('няма име');
      if (!d.ings.length) throw new Error('няма съставки');
      drafts.push(d);
    } catch (e) { errors.push('Рецепта ' + (k + 1) + ': ' + (e && e.message || e)); }
  });
  return { drafts: drafts, errors: errors };
}
function _num(v) { var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : null; }
function _s(v) { return v == null ? '' : String(v); }
function _draftFromGlazy(o) {
  if (!o || typeof o !== 'object') throw new Error('не е рецепта');
  var g = o.Glina && typeof o.Glina === 'object' ? o.Glina : null;
  var ings = (Array.isArray(o.Ingredients) ? o.Ingredients : []).map(function (i) {
    if (!i || typeof i !== 'object') return null;
    var pct = _num(i.Percentage);
    var name = _s(i['Glina Material'] || i.Name).trim();
    if (!name || pct == null) return null;
    var x = { name: name, srcName: _s(i.Name).trim() || name, pct: pct, add: i.Additional === true || i.Additional === 'true' };
    if (i.ID != null) x.srcId = _s(i.ID);
    return x;
  }).filter(Boolean);
  var source = null;
  if (o.ID != null || (o['Created By'] && !g)) {
    var by = o['Created By'] || {};
    source = { kind: 'glazy', id: _s(o.ID) };
    if (o.ID != null) source.url = 'https://glazy.org/recipes/' + encodeURIComponent(_s(o.ID));
    [['author', by.Name], ['authorId', by.ID], ['created', o['Date Created']], ['modified', o['Date Modified']], ['type', o.Type], ['state', o.State],
      ['subtype', o.Subtype], ['cone', o.Cone], ['surface', o.Surface], ['transparency', o.Transparency], ['country', o.Country], ['description', o.Description]]
      .forEach(function (p) { if (p[1] != null && p[1] !== '') source[p[0]] = _s(p[1]); });
    if (Array.isArray(o.Atmospheres) && o.Atmospheres.length) source.atmospheres = o.Atmospheres.map(_s);
    var an = o['Percent Analysis'];
    if (an && typeof an === 'object' && !Array.isArray(an)) {
      var a = {}; Object.keys(an).forEach(function (k) { var n = _num(an[k]); if (n != null) a[k] = n; });
      if (Object.keys(a).length) source.analysis = a;
    }
  }
  // Изнесено от Глина: блокът Glina носи полетата, които Glazy няма.
  if (g && g.Source && typeof g.Source === 'object') source = g.Source;
  var d = {
    name: _s(g && g.Name != null ? g.Name : o.Name).trim(),
    cone: _s(g && g.Cone != null ? g.Cone : o.Cone),
    temp: g && g.Temp != null ? _s(g.Temp) : '',
    glazeType: g ? _s(g['Glaze Type']) : '',
    notes: g ? _s(g.Notes) : '',
    source: source,
    ings: ings
  };
  if (g && g['Version Note']) d.versionNote = _s(g['Version Note']);
  if (g && g.ID != null) d.glinaId = _s(g.ID);
  return d;
}
function _draftFromGlina(r) {
  if (!r || typeof r !== 'object') throw new Error('не е рецепта');
  var d = {
    name: _s(r.name).trim(), cone: _s(r.cone), temp: _s(r.temp), glazeType: _s(r.glazeType), notes: _s(r.notes),
    source: r.source && typeof r.source === 'object' ? JSON.parse(JSON.stringify(r.source)) : null,
    ings: (Array.isArray(r.ingredients) ? r.ingredients : []).map(function (i) {
      var pct = _num(i && i.pct), name = _s(i && i.name).trim();
      if (!name || pct == null) return null;
      var x = { name: name, srcName: _s(i.srcName).trim() || name, pct: pct, add: i.add === true };
      if (i.srcId != null) x.srcId = _s(i.srcId);
      return x;
    }).filter(Boolean)
  };
  if (r.versionNote) d.versionNote = _s(r.versionNote);
  if (r.photo) d.photo = r.photo;
  if (r.id != null) d.glinaId = _s(r.id);
  return d;
}

// ── Разпознаване на материалите ─────────────────────────────────────────────
// Сродни имена: дават само КАНДИДАТИ, които чакат избор. neg — думи, при които
// материалът не се предлага (кварцовият пясък не е силициево брашно; фрита не е
// Gerstley Borate — затова фрити изобщо не са в групата на борa).
var SYN = [
  { k: ['silica', 'flint', 'quartz', 'sio2', 'кварц', 'силиц'], neg: ['пясък', 'sand', 'шамот', 'grog'] },
  { k: ['kaolin', 'china clay', 'каолин'] },
  { k: ['bentonite', 'бентонит'] },
  { k: ['ball clay', 'пластична глина'] },
  { k: ['rutile', 'рутил'] },
  { k: ['titanium dioxide', 'tio2', 'титан'] },
  { k: ['whiting', 'calcium carbonate', 'caco3', 'калциев карбонат', 'креда'] },
  { k: ['wollastonite', 'воластонит'] },
  { k: ['dolomite', 'доломит'] },
  { k: ['talc', 'талк'] },
  { k: ['zinc', 'zno', 'цинк'] },
  { k: ['nepheline', 'нефелин'] },
  { k: ['potash feldspar', 'custer', 'k-feldspar', 'калиев фелдшпат', 'калиев полев'] },
  { k: ['soda feldspar', 'minspar', 'na-feldspar', 'натриев фелдшпат', 'натриев полев'] },
  { k: ['gerstley', 'colemanite', 'колеманит'] },
  { k: ['alumina', 'al2o3', 'глинозем', 'алуминиев оксид', 'двуалуминиев'] },
  { k: ['zircopax', 'zirconium silicate', 'zrsio4', 'циркон'] },
  { k: ['tin oxide', 'sno2', 'калаен', 'калаен оксид'] },
  { k: ['bone ash', 'костна пепел'] },
  { k: ['lithium carbonate', 'li2co3', 'литиев карбонат'] },
  { k: ['strontium carbonate', 'srco3', 'стронциев'] },
  { k: ['barium carbonate', 'baco3', 'бариев'] },
  { k: ['magnesium carbonate', 'mgco3', 'магнезиев карбонат'] },
  { k: ['red iron oxide', 'iron oxide', 'fe2o3', 'железен оксид', 'железен окис', 'двужелезен'] },
  { k: ['black iron oxide', 'fe3o4', 'черен железен'] },
  { k: ['cobalt carbonate', 'cobalt oxide', 'coo', 'coco3', 'кобалт'] },
  { k: ['copper carbonate', 'cuco3', 'меден карбонат'] },
  { k: ['copper oxide', 'cuo', 'меден окис', 'меден оксид'] },
  { k: ['manganese', 'mno2', 'манган'] },
  { k: ['chrome', 'chromium', 'cr2o3', 'хром'] },
  { k: ['nickel', 'nio', 'никел'] },
  { k: ['wood ash', 'ash', 'пепел'] }
];
var SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
export function _matNorm(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[₀-₉]/g, function (c) { return SUB[c]; })
    .replace(/[‐-―]/g, '-').replace(/[^0-9a-zа-яё\s-]/gi, ' ').replace(/\s+-\s+|\s+/g, ' ').trim();
}
function _matCore(s) { return _matNorm(String(s == null ? '' : s).replace(/\([^)]*\)/g, ' ')); }
function _hasTok(hay, tok) { // думата или началото на дума
  var i = hay.indexOf(tok);
  while (i >= 0) { if (i === 0 || hay[i - 1] === ' ' || hay[i - 1] === '-') return true; i = hay.indexOf(tok, i + 1); }
  return false;
}
// {kind:'exact'|'alias'|'candidates'|'none', matId?, ids:[…]}
export function _glazyMatch(name, materials) {
  var mats = (materials || []).filter(function (m) { return m && m.id && !m.archivedAt && m.cat !== 'mass' && m.cat !== 'raw'; });
  var n = _matNorm(name), c = _matCore(name);
  if (!n) return { kind: 'none', ids: [] };
  var ex = mats.filter(function (m) { var mn = _matNorm(m.name), mc = _matCore(m.name); return mn === n || mc === n || (c && (mn === c || mc === c)); });
  if (ex.length === 1) return { kind: 'exact', matId: ex[0].id, ids: [ex[0].id] };
  var al = mats.filter(function (m) { return Array.isArray(m.aliases) && m.aliases.some(function (a) { return _matNorm(a) === n; }); });
  if (!ex.length && al.length === 1) return { kind: 'alias', matId: al[0].id, ids: [al[0].id] };
  var ids = ex.concat(al).map(function (m) { return m.id; });
  SYN.forEach(function (g) {
    if (!g.k.some(function (t) { return _hasTok(n, t); })) return;
    mats.forEach(function (m) {
      if (m.cat === 'glaze' || m.cat === 'engobe' || m.cat === 'clays') return; // готова глазура с „Rutile“ в името не е рутил
      var hay = _matNorm(m.name) + ' ' + (Array.isArray(m.aliases) ? m.aliases.map(_matNorm).join(' ') : '');
      if (g.k.some(function (t) { return _hasTok(hay, t); }) && !(g.neg || []).some(function (t) { return hay.indexOf(t) >= 0; }) && ids.indexOf(m.id) < 0) ids.push(m.id);
    });
  });
  return ids.length ? { kind: 'candidates', ids: ids } : { kind: 'none', ids: [] };
}

// ── Повторен внос ───────────────────────────────────────────────────────────
// {recipe, newer} — най-новата версия на вече внесената рецепта; newer = в Glazy
// е променяна след вноса. null — няма такава.
export function _glazyDuplicate(draft, recipes) {
  var all = (recipes || []).filter(Boolean), hit = [];
  var gid = draft && draft.source && draft.source.kind === 'glazy' && draft.source.id ? String(draft.source.id) : '';
  if (gid) hit = all.filter(function (r) { return r.source && r.source.kind === 'glazy' && String(r.source.id) === gid; });
  if (!hit.length && draft && draft.glinaId) hit = all.filter(function (r) { return String(r.id) === draft.glinaId; });
  if (!hit.length) return null;
  hit.sort(function (a, b) { return (parseFloat(b.version) || 1) - (parseFloat(a.version) || 1) || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')); });
  var r = hit[0], was = r.source && r.source.modified || '', now = draft.source && draft.source.modified || '';
  return { recipe: r, newer: !!(gid && now && was && now > was) };
}

// ── Записът ─────────────────────────────────────────────────────────────────
// links[k] = {matId, name} за всяка съставка; matId '__c' — само име, без материал.
// Връща полетата на рецептата без id/дати (тях ги слага приложението).
export function _glazyRecipe(draft, links) {
  var r = {
    name: draft.name, temp: draft.temp || '', notes: draft.notes || '', glazeType: draft.glazeType || '', cone: draft.cone || '',
    recommendedFiringProfileId: null, fav: false, photo: draft.photo || null,
    ingredients: draft.ings.map(function (i, k) {
      var l = links && links[k] || { matId: '__c', name: i.name };
      var x = { matId: l.matId || '__c', name: l.name || i.name, pct: i.pct };
      if (i.add) x.add = true;
      if (i.srcName && i.srcName !== x.name) x.srcName = i.srcName;
      if (i.srcId) x.srcId = i.srcId;
      return x;
    })
  };
  if (draft.source) r.source = JSON.parse(JSON.stringify(draft.source));
  if (draft.versionNote) r.versionNote = draft.versionNote;
  return r;
}

// ── Износ ───────────────────────────────────────────────────────────────────
var _EXPORT_DROP = ['lineageId', 'version', 'fav', 'recommendedFiringProfileId', 'archivedAt'];
export function _recipeExportJson(recipes, meta) {
  return {
    format: 'glina-recipes', formatVersion: 1, appVersion: meta && meta.appVersion || '', exportedAt: meta && meta.now || '',
    recipes: (recipes || []).map(function (r) {
      var c = JSON.parse(JSON.stringify(r));
      _EXPORT_DROP.forEach(function (k) { delete c[k]; });
      return c;
    })
  };
}
export function _recipeExportYaml(recipes, meta) {
  var list = (recipes || []).map(function (r) {
    var s = r.source || null, gz = s && s.kind === 'glazy', o = {};
    if (gz && s.id) o.ID = /^\d+$/.test(s.id) ? Number(s.id) : s.id;
    o.Name = r.name || '';
    if (gz && (s.author || s.authorId)) { o['Created By'] = {}; if (s.author) o['Created By'].Name = s.author; if (s.authorId) o['Created By'].ID = /^\d+$/.test(s.authorId) ? Number(s.authorId) : s.authorId; }
    if (gz) [['Date Created', 'created'], ['Date Modified', 'modified'], ['Type', 'type'], ['State', 'state'], ['Subtype', 'subtype']].forEach(function (p) { if (s[p[1]]) o[p[0]] = s[p[1]]; });
    if (r.cone) o.Cone = String(r.cone);
    if (gz) [['Surface', 'surface'], ['Transparency', 'transparency'], ['Country', 'country']].forEach(function (p) { if (s[p[1]]) o[p[0]] = s[p[1]]; });
    if (gz && s.atmospheres && s.atmospheres.length) o.Atmospheres = s.atmospheres.slice();
    if (gz && s.description) o.Description = s.description;
    o.Ingredients = (r.ingredients || []).map(function (i) {
      var x = {};
      if (i.srcId) x.ID = /^\d+$/.test(i.srcId) ? Number(i.srcId) : i.srcId;
      x.Name = i.srcName || i.name || '';
      x.Percentage = _num(i.pct);
      if (i.add) x.Additional = true;
      x['Glina Material'] = i.name || '';
      return x;
    });
    if (gz && s.analysis) o['Percent Analysis'] = s.analysis;
    var g = { ID: r.id, Name: r.name || '' };
    if (r.temp) g.Temp = String(r.temp);
    if (r.cone) g.Cone = String(r.cone);
    if (r.glazeType) g['Glaze Type'] = r.glazeType;
    if (r.notes) g.Notes = r.notes;
    if (r.versionNote) g['Version Note'] = r.versionNote;
    if (s) g.Source = s;
    if (meta && meta.appVersion) g['App Version'] = meta.appVersion;
    if (meta && meta.now) g['Exported At'] = meta.now;
    o.Glina = g;
    return o;
  });
  var out = ['# Глина — рецепти. Ключовете са като в Glazy; „Glina“ пази полетата на Глина.'];
  _yEmit(list, 0, out);
  return out.join('\n') + '\n';
}
