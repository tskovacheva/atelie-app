// v1.38.0 — „Рецепти“ по прототипа recipes-v0: каталог (карти/списък, филтри),
// детайл с видим състав и партида (сбор ≠ 100% — предупреждение, без изравняване),
// „Приготви“ (отметките не се записват), формуляр в три раздела (непълен ред —
// грешка, не мълчаливо отпадане), версии и защитата на свързаните тестове.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('recipes:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof openRecWork === 'function'))) { console.log('  - not in this version'); return; }
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('recipes'); });
    const noOverflow = () => E(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.det.on, #main, .rw.on')].every(x => x.scrollWidth <= x.clientWidth + 1));
    const snap = () => E(() => JSON.stringify(DB));

    // --- каталог ---
    let s = await E(() => ({ n: document.querySelectorAll('#recipes-list .rc-c').length, exp: DB.recipes.filter(r => _recIsLatest(r)).length, cnt: document.getElementById('cnt-recipes').textContent }));
    ok('cards: one per recipe lineage (latest version)', s.n === s.exp && s.n > 0, s);
    s = await E(() => { setRecView('list'); const a = document.querySelectorAll('#recipes-list .rc-r').length; setRecView('cards'); return a; });
    ok('list view: the same recipes', s > 0);
    s = await E(() => { const all = DB.recipes.filter(r => _recIsLatest(r)); const ing = all[0].ingredients[0].name; rcTog('ing', ing); const a = document.querySelectorAll('#recipes-list .rc-c').length; rcSetTests('with'); const b = document.querySelectorAll('#recipes-list .rc-c').length;
      const chips = document.querySelectorAll('#rc-active .pc-achip').length; resetRecFilters(); return { a, b, chips, exp: all.filter(r => r.ingredients.some(i => i.name === ing)).length, expB: all.filter(r => r.ingredients.some(i => i.name === ing) && _testsForRecipe(r.id).length).length }; });
    ok('filters combine (contains ingredient + with tests), active chips shown', s.a === s.exp && s.b === s.expB && s.chips === 3, s);
    s = await E(() => { toggleFChip('rec', 'allver'); const n = document.querySelectorAll('#recipes-list .rc-c').length; toggleFChip('rec', 'allver'); return { n, all: DB.recipes.length }; });
    ok('„Всички версии“ shows every version', s.n === s.all, s);

    // --- детайл: състав и партида ---
    const before = await snap();
    s = await E(() => { const r = DB.recipes.find(x => x.id === 'rec-ash-2'); openRecipeDet(r.id); document.getElementById('drec-batch').value = '500'; calcG();
      const rows = [...document.querySelectorAll('#drec-ings .rd-ing')].map(x => ({ n: x.querySelector('.n').textContent, g: x.querySelector('.gv') && x.querySelector('.gv').textContent }));
      return { rows, sum: _recSum(r), ings: r.ingredients.map(i => [i.name, i.pct]), warn: document.getElementById('drec-warn').textContent, tot: document.querySelector('#drec-ings .rd-tot').textContent, sec: [...document.querySelectorAll('#drec-secs .rd-sec')].map(x => x.dataset.sec + ':' + x.classList.contains('open')) }; });
    const exp = s.ings.map(i => (Math.round(parseFloat(i[1]) / 100 * 500 * 10) / 10).toString().replace('.', ',') + ' г');
    ok('composition always shown; grams = % of the batch (existing calculator)', s.rows.length === s.ings.length && s.rows.every((r, i) => r.g === exp[i]), [s.rows, exp]);
    ok('sections: tests and notes open, the rest folded', s.sec.join() === 'tests:true,notes:true,ver:false,pcs:false', s.sec);
    s = await E(() => { const r = DB.recipes.find(x => x.id === 'rec-ash-2'); r.ingredients.push({ matId: '__c', name: 'Проба', pct: '3' }); openRecipeDet(r.id); document.getElementById('drec-batch').value = '1000'; calcG();
      const o = { warn: document.getElementById('drec-warn').textContent, tot: document.querySelector('#drec-ings .rd-tot').textContent, sum: _recSum(r), pcts: r.ingredients.map(i => i.pct) }; r.ingredients.pop(); openRecipeDet(r.id); return o; });
    ok('sum ≠ 100%: a clear warning with the real total weight; nothing normalized', /Сборът е 103%/.test(s.warn) && /1030 г/.test(s.warn) && /1030 г/.test(s.tot) && s.pcts[s.pcts.length - 1] === '3', s);
    s = await E(() => { const t = document.querySelector('#drec-tests .li'); const m = document.querySelector('#drec-ings .n button'); return { test: t && t.getAttribute('onclick'), mat: m && m.getAttribute('onclick'), fp: (document.querySelector('#drec-kv .rd-link') || {}).outerHTML || '' }; });
    ok('links open the real screens (test, material, profile)', /openTestDet\(/.test(s.test) && /openMatDet\(/.test(s.mat) && (/openFPDet\(/.test(s.fp) || !s.fp), s);

    // --- „Приготви“ ---
    s = await E(() => { openRecWork(); const items = () => [...document.querySelectorAll('#rec-work .rw-i')]; const a = items().map(x => x.className);
      items()[0].click(); const b = items().map(x => x.className); const big = getComputedStyle(items()[0].querySelector('.g')).fontSize;
      const on = document.getElementById('rec-work').classList.contains('on'); closeDet('rec-work'); return { a, b, big, on, closed: !document.getElementById('rec-work').classList.contains('on') }; });
    ok('„Приготви“: full screen, big grams, the next one marked, ticking moves the mark', s.on && /next/.test(s.a[0]) && /done/.test(s.b[0]) && /next/.test(s.b[1]) && parseFloat(s.big) >= 26 && s.closed, s);
    ok('looking, the batch and the ticks write nothing', before === await snap());

    // --- формуляр: три раздела, непълен ред ---
    s = await E(async () => { curRec = 'rec-ash-2'; editRecipe(); await new Promise(r => setTimeout(r, 30)); const tabs = [...document.querySelectorAll('#mo-recipe .pi-tabs button')].map(b => b.textContent.trim());
      recIngs.push({ matId: '', name: '', pct: '5' }); renderIngRows(); saveRecipe(); await new Promise(r => setTimeout(r, 30));
      const a = { tabs, open: document.getElementById('mo-recipe').classList.contains('on'), tab: document.querySelector('#mo-recipe .pi-tabs .on').dataset.tab, err: document.getElementById('ri-ing-err').textContent, row: document.querySelectorAll('#ri-ings .ri-row.bad').length };
      recIngs[recIngs.length - 1] = { matId: '__c', name: 'Проба', pct: '' }; renderIngRows(); saveRecipe(); await new Promise(r => setTimeout(r, 30)); a.err2 = document.getElementById('ri-ing-err').textContent;
      recIngs[recIngs.length - 1].pct = 'x'; saveRecipe(); await new Promise(r => setTimeout(r, 30)); a.err3 = document.getElementById('ri-ing-err').textContent;
      recIngs.pop(); recIngs.push({ matId: '', name: '', pct: '' }); renderIngRows(); return a; });
    ok('editor in three tabs', s.tabs.length === 3 && /Основни/.test(s.tabs[0]) && /Състав/.test(s.tabs[1]), s.tabs);
    ok('incomplete row: not dropped — stays open on „Състав“ with the row marked', s.open && s.tab === 'comp' && s.row === 1 && /Ред \d+: Избери материал/.test(s.err), s);
    ok('missing or invalid percent: a specific error', /Липсва процент за „Проба“/.test(s.err2) && /„Проба“ трябва да е положително число/.test(s.err3), s);
    s = await E(async () => { saveRecipe(); await new Promise(r => setTimeout(r, 30)); return { open: document.getElementById('mo-recipe').classList.contains('on') }; });
    ok('a completely empty row is ignored; the unchanged recipe saves', !s.open, s);
    ok('saving the unchanged recipe changed nothing but the date', await E(b => { const x = JSON.parse(b).recipes.find(r => r.id === 'rec-ash-2'), y = DB.recipes.find(r => r.id === 'rec-ash-2'); const n = o => { const c = Object.assign({}, o, { updatedAt: 0, ingredients: o.ingredients.map(i => Object.assign({}, i, { pct: String(i.pct) })) }); return JSON.stringify(c, Object.keys(c).concat(['matId', 'name', 'pct']).sort()); }; return n(x) === n(y); }, before));

    // --- версии и защита на тестовете ---
    app.acceptConfirms = true;
    s = await E(async () => { const r = DB.recipes.find(x => x.id === 'rec-ash-2'); const nt = _testsForRecipe(r.id).length, nv = DB.recipes.length;
      curRec = r.id; editRecipe(); await new Promise(x => setTimeout(x, 30)); recIngs[0].pct = String(parseFloat(recIngs[0].pct) + 1); saveRecipe(); await new Promise(x => setTimeout(x, 30));
      const nr = DB.recipes.find(x => x.lineageId === _recLineage(r) && x.version === Math.max(...DB.recipes.filter(y => _recLineage(y) === _recLineage(r)).map(y => y.version || 1)));
      return { nt, made: DB.recipes.length === nv + 1, testsStay: _testsForRecipe(r.id).length === nt, newTests: _testsForRecipe(nr.id).length, cur: curRec === nr.id, diff: document.getElementById('drec-ver-val').innerText, oldPct: r.ingredients[0].pct }; });
    ok('composition change with linked tests → new version; tests stay with the old one', s.nt > 0 && s.made && s.testsStay && s.newTests === 0 && s.cur, s);
    ok('versions list shows what changed', /спрямо предишната/.test(s.diff), s.diff);
    s = await E(() => { const n = DB.recipes.length; dupRecipe(); const c = DB.recipes[DB.recipes.length - 1]; return { made: DB.recipes.length === n + 1, name: c.name }; });
    ok('„Дублирай“ still makes a copy', s.made && /копие/.test(s.name), s);

    // --- лаптоп ---
    ok('phone: nothing wider than the screen', await noOverflow());
    await page.setViewportSize({ width: 1280, height: 800 });
    s = await E(() => { closeDet('det-recipe'); show('recipes'); const id = DB.recipes.find(r => _recIsLatest(r)).id; openRecipeDet(id); const d = document.getElementById('det-recipe'), l = document.getElementById('recipes-list').getBoundingClientRect();
      const a = { split: d.classList.contains('split'), left: d.getBoundingClientRect().left, listR: l.right, sel: !!document.querySelector('#recipes-list .sel') }; closeDet('det-recipe'); a.after = document.getElementById('sc-recipes').classList.contains('split'); return a; });
    ok('laptop: list left, recipe right; closing restores the list', s.split && s.left >= s.listR - 1 && s.sel && !s.after, s);
    ok('laptop: nothing wider than the screen', await noOverflow());
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- реални архиви ---
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
        const r = await a2.eval(async () => { const s = document.getElementById('splash'); if (s) s.remove(); show('recipes'); const b0 = JSON.stringify(DB);
          const n = document.querySelectorAll('#recipes-list .rc-c').length, exp = DB.recipes.filter(r => _recIsLatest(r)).length;
          for (const r of DB.recipes) { openRecipeDet(r.id); document.getElementById('drec-batch').value = '1000'; calcG(); openRecWork(); closeDet('rec-work'); }
          closeDet('det-recipe'); return { n, exp, same: b0 === JSON.stringify(DB) }; });
        console.log('  ' + f + ':');
        ok('  every recipe in the catalog (' + r.n + '), browsing and „Приготви“ write nothing', r.n === r.exp && r.same, r);
        ok('  no page errors', !a2.log.errors.length, a2.log.errors);
        await a2.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
