// v1.53.0 — стига ли наличното за партидата: достатъчно / не стига / без количество /
// Wishlist / без материал; празното количество не е нула; добавките се броят над
// основата; най-голямата партида — само когато всичко е известно; нищо не се записва.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 900) : '')); } };
const load = f => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8')).toString('base64'));

const MATS = [
  { id: 'sm-neph', name: 'Nepheline syenite', cat: 'base', stock: 1000 },
  { id: 'sm-sil', name: 'Silica 325', cat: 'base', stock: '250' },
  { id: 'sm-kao', name: 'Каолин', cat: 'base', stock: null },
  { id: 'sm-talc', name: 'Talc', cat: 'base', wishlist: true },
  { id: 'sm-rut', name: 'Рутил', cat: 'base', stock: 100 },
  { id: 'sm-zero', name: 'Празен', cat: 'base', stock: 0 }
];
const ING = [
  { matId: 'sm-neph', name: 'Nepheline syenite', pct: 50 },
  { matId: 'sm-sil', name: 'Silica 325', pct: 25 },
  { matId: 'sm-kao', name: 'Каолин', pct: 10 },
  { matId: 'sm-talc', name: 'Talc', pct: 10 },
  { matId: '__c', name: 'Zinc Oxide', pct: 5 },
  { matId: 'sm-rut', name: 'Рутил', pct: 8, add: true }
];

(async () => {
  console.log('stock:');
  if (!fs.existsSync(path.join(ROOT, 'domain', 'stock.js'))) { console.log('  - not in this version'); return; }
  const S = await load('domain/stock.js');
  let st = S._recStock(ING, MATS, 1000);
  ok('states: enough / not enough / unknown / Wishlist / no material / additive', st.rows.map(r => r.state).join() === 'ok,ok,unknown,absent,unmatched,ok', st.rows);
  ok('grams of the batch; additive on top of the dry base', st.rows.map(r => r.need).join() === '500,250,100,100,50,80');
  ok('left over: 1000−500, 250−250, 100−80', st.rows[0].left === 500 && st.rows[1].left === 0 && st.rows[5].left === 20);
  ok('empty stock is unknown, not zero', st.rows[2].state === 'unknown' && st.rows[2].missing === undefined);
  ok('no largest batch while something is unknown', st.maxBase === null);
  st = S._recStock(ING, MATS, 1500);
  ok('1500 g: silica short by 125, rutile short by 20', st.rows[1].state === 'short' && st.rows[1].missing === 125 && st.rows[5].state === 'short' && st.rows[5].missing === 20 && st.counts.short === 2, st.rows);
  const known = [ING[0], ING[1], ING[5]];
  st = S._recStock(known, MATS, 100);
  ok('largest batch when all is known: silica 250/0.25 = 1000 g, limited by silica', st.maxBase === 1000 && st.limitId === 'sm-sil', st);
  st = S._recStock([{ matId: 'sm-zero', pct: 100 }], MATS, 10);
  ok('stock 0 is known: short, largest batch 0', st.rows[0].state === 'short' && st.rows[0].missing === 10 && st.maxBase === 0, st);
  st = S._recStock([{ matId: 'sm-neph', pct: 60 }, { matId: 'sm-neph', pct: 40 }], MATS, 1500);
  ok('the same material twice: the total need counts', st.rows.every(r => r.state === 'short') && st.rows[0].missing === 500, st.rows);

  const h = await H.start(ROOT);
  try {
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    const E = (fn, a) => app.eval(fn, a);
    await E(a => { const s = document.getElementById('splash'); if (s) s.remove(); const x = JSON.parse(a); DB.materials = DB.materials.concat(x.m);
      DB.recipes.push({ id: 'sr-1', name: 'Наличност', temp: '', cone: '6', notes: '', glazeType: '', fav: false, photo: null, ingredients: x.i }); save(); show('recipes'); }, JSON.stringify({ m: MATS, i: ING }));
    const before = await E(() => JSON.stringify(DB));
    let s = await E(() => { openRecipeDet('sr-1'); document.getElementById('drec-batch').value = '1000'; calcG();
      return { rows: [...document.querySelectorAll('#drec-ings .rd-ing .n small')].map(x => x.textContent), sum: document.getElementById('drec-grams').innerText.replace(/\s+/g, ' ') }; });
    ok('detail: each ingredient says how it stands', s.rows.join('|') === '✓ има 1000 г · остават 500 г|✓ има 250 г · остават 0 г|? количеството не е въведено|Wishlist — няма го в ателието|✗ няма го в материалите|✓ има 100 г · остават 20 г|+ добавка над основата', s.rows);
    ok('summary: counts by state, no largest batch, read-only note', /стигат: 3/.test(s.sum) && /без количество: 1/.test(s.sum) && /няма ги в ателието: 1/.test(s.sum) && /без материал: 1/.test(s.sum) && /не се смята/.test(s.sum) && /не се променят/.test(s.sum), s.sum);
    s = await E(() => { document.getElementById('drec-batch').value = '1500'; calcG(); return [...document.querySelectorAll('#drec-ings .rd-ing .n small.no')].map(x => x.textContent); });
    ok('larger batch: missing grams shown', s.join('|') === '⚠ липсват 125 г (има 250 г)|✗ няма го в материалите|⚠ липсват 20 г (има 100 г)', s);
    s = await E(() => { const r = DB.recipes.find(x => x.id === 'sr-1'); r.ingredients = r.ingredients.filter(i => ['sm-neph', 'sm-sil', 'sm-rut'].indexOf(i.matId) >= 0); openRecipeDet('sr-1'); calcG(); return document.getElementById('drec-grams').innerText.replace(/\s+/g, ' '); });
    ok('all known: the largest batch and what limits it', /Най-много от наличното: 1000 г основа — ограничава „Silica 325“/.test(s), s);
    s = await E(() => { openRecWork(); const t = document.getElementById('rec-work').innerText; closeDet('rec-work'); return /Наличност за тази партида/.test(t); });
    ok('„Приготви“ shows the same check', s);
    s = await E(() => { document.getElementById('drec-batch').value = ''; calcG(); return document.getElementById('drec-grams').innerHTML; });
    ok('no batch → no stock check', s === '');
    const after = await E(() => JSON.stringify(DB.materials.map(m => [m.id, m.stock, m.alertAt])));
    ok('stock never changes', after === JSON.stringify(JSON.parse(before).materials.map(m => [m.id, m.stock, m.alertAt])));
    s = await E(() => { setLanguage('en'); openRecipeDet('sr-1'); document.getElementById('drec-batch').value = '1000'; calcG(); const t = document.getElementById('drec-grams').innerText + document.getElementById('drec-ings').innerText; setLanguage('bg');
      const data = JSON.stringify(DB); return (t.match(/[А-Яа-я][А-Яа-я ]*/g) || []).filter(w => data.indexOf(w.trim()) < 0); });
    ok('English: no Bulgarian UI text in the check', s.length === 0, s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
  } finally { await h.stop(); }
  console.log(failed ? 'FAILED ' + passed + ' passed, ' + failed + ' failed' : 'OK ' + passed + ' passed, 0 failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
