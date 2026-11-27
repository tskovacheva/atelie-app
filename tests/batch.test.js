// v1.55.0 — партиди на рецептата: „Приготви“ с реални грамове → „Запиши партидата“,
// изваждане от наличностите, останало, редакция, изтриване с връщане, каталог.
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

(async () => {
  console.log('batch:');
  // ── чистите функции ──
  const B = await import(path.join(ROOT, 'domain', 'batch.js'));
  const its = B.batchItems([{ matId: 'a', name: 'A', pct: 60 }, { matId: 'b', name: 'B', pct: 40 }, { matId: 'c', name: 'C', pct: 8, add: true }], 200, { 0: 125 });
  ok('items: plan from %, real from input, deviation marked', its[0].plan === 120 && its[0].g === 125 && its[0].dev && its[1].g === 80 && !its[1].dev && its[2].add);
  const tt = B.batchTotals(its);
  ok('totals: dry = real sum; base/additives split', tt.dry === 221 && tt.base === 205 && tt.add === 16 && tt.devs === 1, tt);
  const ded = B.batchDeduct(its, [{ id: 'a', name: 'A', stock: 1000 }, { id: 'b', name: 'B', stock: null }, { id: 'c', name: 'C', stock: '10' }]);
  ok('deduct: known stock, unknown skipped, short takes what is there', ded.rows[0].after === 875 && ded.rows[1].state === 'unknown' && ded.rows[2].state === 'short' && ded.apply.length === 2 && ded.apply[1].g === 10, ded);
  ok('wishlist is never touched', B.batchDeduct(its, [{ id: 'a', wishlist: true, stock: 5 }]).rows[0].state === 'absent');
  ok('check: SG range, numbers, date, left', !B.batchCheck({ date: '2026-11-27', sg: '5', left: 'full' }).ok && !B.batchCheck({ date: '2026-11-27', water: 'x', left: 'full' }).ok && !B.batchCheck({ date: '', left: 'full' }).ok && B.batchCheck({ date: '2026-11-27', sg: '1,45', water: '180', left: 'half' }).ok);
  ok('in stock = any batch not empty', B.batchInStock({ batches: [{ left: 'empty' }, { left: 'low' }] }) && !B.batchInStock({ batches: [{ left: 'empty' }] }) && !B.batchInStock({}));

  const h = await H.start(ROOT);
  try {
    const a = await h.open();
    await a.eval(() => {
      const now = new Date().toISOString();
      DB.materials.push({ id: 'bt-a', name: 'BT Nepheline', cat: 'base', stock: 1000, updatedAt: now },
        { id: 'bt-b', name: 'BT Silica', cat: 'base', stock: null, updatedAt: now },
        { id: 'bt-c', name: 'BT Kaolin', cat: 'base', stock: 5, updatedAt: now },
        { id: 'bt-d', name: 'BT Rutile', cat: 'ox', wishlist: true, updatedAt: now });
      DB.recipes.push({ id: 'bt-r', name: 'BT Opal', temp: '1230', updatedAt: now, ingredients: [
        { matId: 'bt-a', name: 'BT Nepheline', pct: 60 }, { matId: 'bt-b', name: 'BT Silica', pct: 30 }, { matId: 'bt-c', name: 'BT Kaolin', pct: 10 }, { matId: 'bt-d', name: 'BT Rutile', pct: 2, add: true }] });
      save(); show('recipes'); openRecipeDet('bt-r');
      document.getElementById('drec-batch').value = '100'; calcG(); openRecWork();
    });
    const rows = await a.eval(() => [...document.querySelectorAll('#rec-work .rw-i .rw-gb')].map(x => x.innerText.replace(/\s+/g, ' ')));
    ok('Приготви: planned grams 60/30/10/2', rows.length === 4 && /^60/.test(rows[0]) && /^2/.test(rows[3]), rows);

    // реално количество на първата съставка
    await a.page.locator('#rec-work .rw-gb').nth(0).click();
    ok('tap on grams → input for the real amount', await a.eval(() => !!document.getElementById('rw-gin')));
    await a.page.fill('#rw-gin', '65'); await a.page.press('#rw-gin', 'Enter');
    const after = await a.eval(() => ({ dev: document.querySelectorAll('#rec-work .rw-i.dev').length, done: RW.done[0], txt: document.getElementById('rec-work').innerText }));
    ok('real 65 g: row marked, ticked, plan shown, total 107', after.dev === 1 && after.done && /план 60 г/.test(after.txt) && /107 г/.test(after.txt), after);
    await a.page.locator('#rec-work .rw-i .n').nth(1).click();
    ok('tap on the row still ticks', await a.eval(() => !!RW.done[1]));

    // запис
    await a.page.click('#rw-save');
    const mo = await a.eval(() => ({ on: document.getElementById('mo-batch').classList.contains('on'), sum: document.getElementById('bt-sum').innerText, ded: document.getElementById('bt-ded').innerText, chk: document.getElementById('bt-deduct').checked, date: document.getElementById('bt-date').value }));
    ok('modal over Приготви: sum shows deviation, deduct on by default, today', mo.on && /BT Nepheline 65 г \(план 60\)/.test(mo.sum) && mo.chk && /^\d{4}-\d\d-\d\d$/.test(mo.date), mo);
    ok('deduct preview: 1000→935, unknown kept, short, wishlist', /1000 → 935/.test(mo.ded) && /не е въведено/.test(mo.ded) && /липсват 5 г/.test(mo.ded) && /Wishlist/.test(mo.ded), mo.ded);
    await a.eval(() => { document.getElementById('bt-sg').value = '5'; });
    await a.page.click('#bt-save');
    ok('SG out of range: not saved', await a.eval(() => !(DB.recipes.find(r => r.id === 'bt-r').batches || []).length));
    await a.eval(() => { document.getElementById('bt-sg').value = '1,45'; document.getElementById('bt-water').value = '80'; document.getElementById('bt-extras').value = 'CMC 0,2 %'; });
    await a.page.locator('#bt-left button').nth(1).click();
    await a.page.click('#bt-save');
    const st = await a.eval(() => { const r = DB.recipes.find(x => x.id === 'bt-r'), m = id => DB.materials.find(x => x.id === id).stock;
      return { b: r.batches, a: m('bt-a'), bb: m('bt-b'), c: m('bt-c'), work: document.getElementById('rec-work').classList.contains('on'), sec: document.getElementById('drec-bat').innerText, n: document.getElementById('drec-bat-n').textContent }; });
    const b0 = st.b && st.b[0];
    ok('batch saved with real grams, dry 107, water, SG, left ~½', b0 && b0.items[0].g === 65 && b0.items[0].dev && b0.dry === 107 && b0.water === 80 && b0.sg === 1.45 && b0.left === 'half' && b0.extras === 'CMC 0,2 %', b0);
    ok('stock: 1000→935, unknown untouched, short → 0', st.a === 935 && st.bb === null && st.c === 0, st);
    ok('deducted recorded on the batch', b0 && b0.deducted.length === 2 && b0.deducted[1].g === 5);
    ok('Приготви closed; section shows the batch', !st.work && /107 г сухо/.test(st.sec) && /1 в наличност/.test(st.n), st);
    ok('catalog: "in stock" badge', await a.eval(() => { renderRecipes(); return [...document.querySelectorAll('#recipes-list .rc-stk')].length >= 1; }));

    // оцелява след презареждане
    await a.reload();
    ok('batch survives reload', await a.eval(() => (DB.recipes.find(x => x.id === 'bt-r').batches || []).length === 1));
    await a.eval(() => { show('recipes'); openRecipeDet('bt-r'); });

    // останало с едно докосване
    await a.page.locator('#drec-bat .bt-left').first().click(); await a.page.locator('#drec-bat .bt-left').first().click();
    const lf = await a.eval(() => ({ l: DB.recipes.find(x => x.id === 'bt-r').batches[0].left, n: document.getElementById('drec-bat-n').textContent }));
    ok('left cycles ~½ → Малко → Свършило; no longer in stock', lf.l === 'empty' && /свършили/.test(lf.n), lf);
    ok('catalog: badge gone, filter "В наличност" hides it', await a.eval(() => { renderRecipes(); const no = !document.querySelector('#recipes-list .rc-stk'); toggleFChip('rec', 'stk'); const hidden = ![...document.querySelectorAll('#recipes-list .li')].some(e => /BT Opal/.test(e.innerText)); toggleFChip('rec', 'stk'); return no && hidden; }));

    // редакция — без ново изваждане
    await a.eval(() => { openRecipeDet('bt-r'); openBatchEdit(DB.recipes.find(x => x.id === 'bt-r').batches[0].id); });
    const ed = await a.eval(() => ({ ded: document.getElementById('bt-ded-box').style.display, done: document.getElementById('bt-ded-done').innerText, del: document.getElementById('bt-del').style.display }));
    ok('edit: no deduct option, shows what was taken, delete offered', ed.ded === 'none' && /BT Nepheline 65 г/.test(ed.done) && ed.del === '', ed);
    await a.eval(() => { document.getElementById('bt-notes').value = 'бележка'; });
    await a.page.click('#bt-save');
    ok('edit saved, stock unchanged', await a.eval(() => DB.recipes.find(x => x.id === 'bt-r').batches[0].notes === 'бележка' && DB.materials.find(x => x.id === 'bt-a').stock === 935));

    // редакция на рецептата пази партидите; „Дублирай“ не ги копира; износът ги няма
    await a.eval(() => { openRecipeDet('bt-r'); editRecipe(); document.getElementById('ri-notes').value = 'x'; saveRecipe(); });
    ok('recipe edit keeps batches', await a.eval(() => (DB.recipes.find(x => x.id === 'bt-r').batches || []).length === 1));
    ok('Дублирай: copy without batches', await a.eval(() => { openRecipeDet('bt-r'); dupRecipe(); const c = DB.recipes.find(x => /BT Opal \(копие\)/.test(x.name)); return !!c && !c.batches; }));
    ok('recipe export drops batches', await a.eval(() => !('batches' in _recipeExportJson([DB.recipes.find(x => x.id === 'bt-r')], {}).recipes[0])));

    // изтриване с връщане
    a.acceptConfirms = true;
    await a.eval(() => { openRecipeDet('bt-r'); openBatchEdit(DB.recipes.find(x => x.id === 'bt-r').batches[0].id); });
    await a.page.click('#bt-del');
    a.acceptConfirms = false;
    const dl = await a.eval(() => ({ n: (DB.recipes.find(x => x.id === 'bt-r').batches || []).length, a: DB.materials.find(x => x.id === 'bt-a').stock, c: DB.materials.find(x => x.id === 'bt-c').stock }));
    ok('delete + return: 935→1000, 0→5', dl.n === 0 && dl.a === 1000 && dl.c === 5, dl);

    // английски
    await a.eval(() => { pickLanguage('en'); openRecipeDet('bt-r'); document.getElementById('drec-batch').value = '100'; calcG(); openRecWork(); });
    const en = await a.eval(() => document.getElementById('rw-save').innerText + ' | ' + document.getElementById('drec-bat').innerText);
    ok('English: save button and empty section', /save the batch/i.test(en) && /No batches yet/.test(en), en);
    ok('no page errors', !a.log.errors.length, a.log.errors);
  } finally { await h.stop(); }
  console.log(failed ? `=== FAIL ${failed} (${passed} ok) ===` : `=== OK (${passed}) ===`);
  process.exit(failed ? 1 : 0);
})();
