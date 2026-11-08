// Глина · domain/stock.js — стига ли материалът за партидата (v1.53.0)
// Чиста функция — без DOM и без глобално състояние. Само чете: нищо не се вади от
// наличността (това може да е само изрично действие „изразходвано“ в бъдеще).
//
// Състояния на съставка:
//   ok       — има достатъчно (left = колко остава)
//   short    — не стига (missing = колко липсва)
//   unknown  — материалът няма въведено количество; празното НЕ е нула
//   absent   — материалът е в Wishlist — няма го в ателието
//   unmatched — съставката не е свързана с материал (само име или изтрит)
// Наличността е в грамове (полето „Наличност (г)“ на материала).

function _n(v) { if (v == null || v === '') return null; var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : null; }

// ings — съставките на рецептата; mats — DB.materials; base — сухата основа в г.
// Връща {rows:[…по реда на съставките], counts:{…}, maxBase, limitId}.
// maxBase е най-голямата основа, която наличното позволява — само когато всяка
// съставка е свързана и количеството на всяка е известно; иначе null.
export function _recStock(ings, mats, base) {
  var b = _n(base) || 0, byId = {}, need = {};
  (mats || []).forEach(function (m) { if (m && m.id) byId[m.id] = m; });
  var list = Array.isArray(ings) ? ings : [];
  // Един материал на два реда — нуждата е общата (формулярът не позволява, но
  // старите записи може да го имат).
  list.forEach(function (i) {
    var m = i && i.matId && i.matId !== '__c' ? byId[i.matId] : null;
    if (m) need[m.id] = (need[m.id] || 0) + (_n(i.pct) || 0);
  });
  var counts = { ok: 0, short: 0, unknown: 0, absent: 0, unmatched: 0 };
  var rows = list.map(function (i) {
    var pct = _n(i && i.pct) || 0, g = pct / 100 * b;
    var m = i && i.matId && i.matId !== '__c' ? byId[i.matId] : null;
    var r = { need: g, matId: m ? m.id : null };
    if (!m) r.state = 'unmatched';
    else if (m.wishlist === true) r.state = 'absent';
    else if (m.cat === 'mass' || _n(m.stock) == null) r.state = 'unknown';
    else {
      var have = _n(m.stock), tot = need[m.id] / 100 * b;
      r.have = have;
      if (have + 1e-9 >= tot) { r.state = 'ok'; r.left = have - tot; }
      else { r.state = 'short'; r.missing = tot - have; }
    }
    counts[r.state]++;
    return r;
  });
  var maxBase = null, limitId = null;
  if (list.length && !counts.unknown && !counts.absent && !counts.unmatched) {
    Object.keys(need).forEach(function (id) {
      if (!(need[id] > 0)) return;
      var cap = _n(byId[id].stock) / (need[id] / 100);
      if (maxBase == null || cap < maxBase) { maxBase = cap; limitId = id; }
    });
  }
  return { rows: rows, counts: counts, maxBase: maxBase, limitId: limitId };
}
