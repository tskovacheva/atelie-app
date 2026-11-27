// Глина · domain/batch.js — партиди на рецептата (v1.55.0).
//
// Партидата е едно реално забъркване: какво точно е претеглено (реалните грамове,
// не само процентите), вода, гъстота, колко е останало. Пази се в самата рецепта
// (`recipe.batches`), затова влиза в архива, синхронизацията и защитите без
// отделна колекция. Партидата помни своя състав — по-късна промяна на рецептата
// не я пренаписва, затова повторното забъркване не иска нова версия.
//
// Тук са само чисти функции: без DOM, без DB. Изваждането от наличностите се
// решава тук, записва се в index.html.

export const BATCH_LEFT = ['full', 'half', 'low', 'empty'];
export const BATCH_USE = ['', 'dip', 'brush', 'spray'];

const r1 = x => Math.round(x * 10) / 10;
export function batchNum(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return isFinite(n) ? n : NaN;
}

// Съставките на партидата: планирано от процента, реално — ако е въведено.
// ings: recipe.ingredients; base: грамове основа; act: {индекс: реални грамове}
export function batchItems(ings, base, act) {
  act = act || {};
  return (ings || []).map(function (i, k) {
    const pct = parseFloat(i && i.pct) || 0, plan = r1(pct / 100 * (base || 0));
    const a = act[k], has = a != null && isFinite(a) && a >= 0;
    const g = has ? r1(a) : plan;
    const x = { matId: i && i.matId || '', name: i && i.name || '', pct: pct, plan: plan, g: g };
    if (i && i.add) x.add = true;
    if (has && Math.abs(g - plan) >= 0.05) x.dev = true;
    return x;
  });
}

// Сборове: сухо (всичко претеглено), основа, добавки, брой отклонения.
export function batchTotals(items) {
  let base = 0, add = 0, devs = 0;
  (items || []).forEach(function (x) { if (x.add) add += x.g; else base += x.g; if (x.dev) devs++; });
  return { dry: r1(base + add), base: r1(base), add: r1(add), devs: devs };
}

// Какво ще се извади от наличностите. Материал без въведено количество, от Wishlist
// или без връзка се пропуска (остава както е). При недостиг се изважда наличното.
// → { rows:[{k, matId, name, take, have, after, state}], apply:[{matId, g}] }
//   state: ok | short | unknown | absent | nomat
export function batchDeduct(items, materials) {
  const rows = [], apply = [];
  (items || []).forEach(function (x, k) {
    const row = { k: k, matId: x.matId || '', name: x.name, take: x.g, have: null, after: null, state: 'nomat' };
    const m = x.matId && x.matId !== '__c' ? (materials || []).find(function (mm) { return mm && mm.id === x.matId; }) : null;
    if (!m) { rows.push(row); return; }
    row.name = m.name || x.name;
    if (m.wishlist) { row.state = 'absent'; rows.push(row); return; }
    const have = batchNum(m.stock);
    if (have == null || isNaN(have)) { row.state = 'unknown'; rows.push(row); return; }
    row.have = have;
    if (!(x.g > 0)) { row.state = 'ok'; row.after = have; rows.push(row); return; }
    const g = Math.min(x.g, have);
    row.after = r1(have - g);
    row.state = x.g <= have + 1e-9 ? 'ok' : 'short';
    if (g > 0) apply.push({ matId: m.id, g: r1(g) });
    rows.push(row);
  });
  return { rows: rows, apply: apply };
}

// Какво да се върне при изтриване: само извадено от материали, които още съществуват.
export function batchReturn(batch, materials) {
  return ((batch && batch.deducted) || []).filter(function (d) {
    return d && d.g > 0 && (materials || []).some(function (m) { return m && m.id === d.matId; });
  });
}

// Има ли от рецептата забъркано и несвършило.
export function batchesLive(recipe) {
  return ((recipe && recipe.batches) || []).filter(function (b) { return b && b.left !== 'empty'; });
}
export function batchInStock(recipe) { return batchesLive(recipe).length > 0; }

// Най-новите първо (по дата, после по създаване).
export function batchesSorted(recipe) {
  return ((recipe && recipe.batches) || []).slice().sort(function (a, b) {
    return String(b.date || '').localeCompare(String(a.date || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

// Проверка на полетата от формуляра. → {ok, field?, code?}
export function batchCheck(f) {
  const chk = [['water', 0, 1e6], ['sg', 1, 3], ['leftG', 0, 1e6]];
  for (let i = 0; i < chk.length; i++) {
    const v = batchNum(f[chk[i][0]]);
    if (v == null) continue;
    if (isNaN(v) || v < chk[i][1] || v > chk[i][2]) return { ok: false, field: chk[i][0], code: chk[i][0] === 'sg' ? 'sg-range' : 'not-number' };
  }
  if (!f.date || !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return { ok: false, field: 'date', code: 'date' };
  if (BATCH_LEFT.indexOf(f.left) < 0) return { ok: false, field: 'left', code: 'left' };
  return { ok: true };
}
