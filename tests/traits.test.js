// v1.31.1 — basic characteristics: size (h, width/Ø, depth, stage, approx),
// starting clay, wall and base, several categories. Through the real form,
// reopen, clear, series and split, piece → series, rollback to v1.31.0.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 400) : '')); } };

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('traits:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof _readSize === 'function'))) { console.log('  - no traits in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);
    const fill = vals => E(async v => {
      for (const k of Object.keys(v)) { const el = document.getElementById(k); if (el.type === 'checkbox') el.checked = v[k]; else el.value = v[k]; }
    }, vals);

    // --- fill through the form ---
    const before = await E(() => { const p = DB.pieces.find(x => x.id === 'p-ocarina'); return { dimensions: p.dimensions, weight: p.weight, events: p.events.length, code: p.code }; });
    await E(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 60)); });
    await fill({ 'pi-h': '12,5', 'pi-w': '8', 'pi-depth': '', 'pi-size-at': 'bone-dry', 'pi-size-approx': true, 'pi-wall': '6', 'pi-base': '8', 'pi-start-mass': '450' });
    await E(() => { togglePiCat('Окарини'); togglePiCat('Музикални инструменти'); document.getElementById('pi-cat-new').value = 'За концерт'; addPiCat(); savePiece(); });
    let p = await E(() => DB.pieces.find(x => x.id === 'p-ocarina'));
    ok('size saved: h 12.5, Ø 8, dry, approximate', JSON.stringify(p.size) === JSON.stringify({ h: 12.5, w: 8, at: 'bone-dry', approx: true }), p.size);
    ok('wall 6, base 8, starting clay 450 g', p.wall === 6 && p.base === 8 && p.startMass === 450, [p.wall, p.base, p.startMass]);
    ok('three categories, own one included', JSON.stringify(p.categories) === JSON.stringify(['Окарини', 'Музикални инструменти', 'За концерт']), p.categories);
    ok('old fields untouched: description, weight, history, code', p.dimensions === before.dimensions && p.weight === before.weight && p.events.length === before.events && p.code === before.code, p);

    // --- shown in the detail and the card; searchable by category ---
    const det = await E(async () => { openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 50)); return document.getElementById('dpi-info').innerText; });
    ok('detail shows size with stage and "approximate"', /в12,5 × Ø8 см \(Сухо, приблизително\)/.test(det) && /Начална глина\s*450 г/.test(det) && /Стена \/ дъно\s*6 \/ 8 мм/.test(det) && /За концерт/.test(det), det);
    ok('detail still shows the free description', /Размери — описание/.test(det), det);
    const found = await E(async () => { closeDet('det-piece'); document.getElementById('pc-search').value = 'концерт'; renderPieces(); const n = Array.from(document.querySelectorAll('#pieces-grid .pc')).map(x => x.textContent); document.getElementById('pc-search').value = ''; renderPieces(); return n; });
    ok('search finds by category', found.length === 1 && /Окарина/.test(found[0]), found);
    ok('card shows the structured size', /в12,5 × Ø8 см/.test(found[0]), found[0]);

    // --- reopen keeps; the form shows what is stored ---
    await app.reload();
    const form = await E(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 60));
      const g = id => document.getElementById(id); return { h: g('pi-h').value, w: g('pi-w').value, at: g('pi-size-at').value, ap: g('pi-size-approx').checked, sm: g('pi-start-mass').value, cats: Array.from(document.querySelectorAll('#pi-cats .fchip.on')).map(x => x.textContent) }; });
    ok('after reopen the form shows the stored values', form.h === '12,5' && form.w === '8' && form.at === 'bone-dry' && form.ap && form.sm === '450' && form.cats.length === 3, form);

    // --- clearing removes the fields ---
    await fill({ 'pi-h': '', 'pi-w': '', 'pi-wall': '', 'pi-start-mass': '' });
    await E(() => { togglePiCat('Окарини'); savePiece(); });
    p = await E(() => DB.pieces.find(x => x.id === 'p-ocarina'));
    ok('cleared size and fields are removed; the rest stays', p.size === undefined && p.wall === undefined && p.startMass === undefined && p.base === 8 && p.categories.length === 2, p);

    // --- "fill from the text" only on request ---
    const fillText = await E(async () => { curPiece = 'p-old'; editPiece(); await new Promise(r => setTimeout(r, 60));
      document.getElementById('pi-dimensions').value = 'в18 × ⌀12'; _piDimFillHint(); const shown = document.getElementById('pi-dim-fill').style.display !== 'none', before = document.getElementById('pi-h').value;
      fillPiSizeFromText(); const r = [document.getElementById('pi-h').value, document.getElementById('pi-w').value]; closeMo('mo-piece'); return { shown, before, r }; });
    ok('"Попълни от текста" appears and fills only when pressed', fillText.shown && fillText.before === '' && fillText.r.join() === '18,12', fillText);

    // --- series: per piece, copied to a split part; kept on piece → series ---
    await E(async () => { curSeries = 'se-plates'; editSeries(); await new Promise(r => setTimeout(r, 60)); });
    const lbl = await E(() => document.getElementById('pi-start-mass-l').textContent);
    await fill({ 'pi-h': '2', 'pi-w': '22', 'pi-start-mass': '600' });
    await E(async () => { togglePiCat('Чинии'); savePiece(); await new Promise(r => setTimeout(r, 50));
      curSeries = 'se-plates'; openSplitMo(); await new Promise(r => setTimeout(r, 30)); document.getElementById('sp-count').value = 1; document.getElementById('sp-name').value = 'Зелена'; saveSplit(); });
    const sp = await E(() => ({ se: findSeries('se-plates'), m: DB.pieces.find(x => x.name === 'Зелена') }));
    ok('series: starting clay is per piece', /на бройка/.test(lbl) && sp.se.startMass === 600, lbl);
    ok('split part gets the series characteristics', JSON.stringify(sp.m.size) === JSON.stringify(sp.se.size) && sp.m.startMass === 600 && sp.m.categories[0] === 'Чинии', sp.m);
    await E(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 60)); document.getElementById('pi-count').value = 2; savePiece(); await new Promise(r => setTimeout(r, 60)); });
    const conv = await E(() => findSeries('p-ocarina'));
    ok('piece → series keeps the characteristics', conv && conv.base === 8 && conv.categories.length === 2, conv && { base: conv.base, cats: conv.categories });

    // --- rollback to v1.31.0: an edit there keeps the new fields ---
    const prev = H.previous().find(x => x.version === 'v1.31.0');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      await E(async () => { curSeries = 'se-plates'; editSeries(); await new Promise(r => setTimeout(r, 60)); document.getElementById('pi-notes').value = 'бележка от старата'; savePiece(); await new Promise(r => setTimeout(r, 60)); });
      const old = await E(() => ({ v: APP_VERSION, se: findSeries('se-plates') }));
      ok('v1.31.0 edits the series and keeps size, clay, categories', old.v === 'v1.31.0' && old.se.notes === 'бележка от старата' && old.se.startMass === 600 && old.se.size && old.se.size.w === 22 && old.se.categories[0] === 'Чинии', old.se);
      h.setRoot(ROOT); await app.reload();
      const back = await E(() => findSeries('se-plates'));
      ok('back in v1.31.1: all there', back.startMass === 600 && back.notes === 'бележка от старата', back);
    } else console.log('  - no tests/previous/v1.31.0: rollback skipped');
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
