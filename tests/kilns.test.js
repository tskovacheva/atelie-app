// v1.32.0 — kiln registry: preset, edit, shelves, posts, gaps; storage apart from
// the records; backup and import; rollback to v1.31.1 and back keeps the kilns.
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
    console.log('kilns:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof openKilnMo === 'function'))) { console.log('  - no kilns in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);
    const runsBefore = await E(() => JSON.stringify(DB.firingRuns));

    // --- the tab ---
    const tab = await E(async () => { show('fp'); await new Promise(r => setTimeout(r, 50)); const b = document.querySelector('#sc-fp .tabs').innerText.split('\n').map(x => x.trim()).filter(Boolean); const def = document.getElementById('fptab-runs').classList.contains('on');
      switchFP('kilns'); return { b, def, empty: document.getElementById('kiln-list').innerText }; });
    ok('"Пещи" is the first tab; the screen still opens on runs', tab.b[0].toLowerCase() === 'пещи' && tab.def, tab.b);
    ok('empty registry explains what a kiln is', /Още няма пещи/.test(tab.empty));

    // --- preset ---
    await E(async () => { openKilnMo(null); await new Promise(r => setTimeout(r, 50)); const ps = document.getElementById('kl-preset'); ps.value = 'kittec-cb80-double'; applyKilnPreset(ps.value); });
    let f = await E(() => ({ name: document.getElementById('kl-name').value, d: document.getElementById('kl-d').value, h: document.getElementById('kl-h').value, warn: document.getElementById('kl-warn').innerText, shelves: klShelves.length, posts: klPosts }));
    ok('preset fills the form: Ø51 × 38, one shelf type, posts 5/10/15, no warnings', f.name === 'Kittec CB 80 Double' && f.d === '51' && f.h === '38' && f.shelves === 1 && JSON.stringify(f.posts) === '[5,10,15]' && !f.warn, f);
    // add a post size and a half shelf, change a gap
    await E(() => { document.getElementById('kl-post-new').value = '8'; addKilnPost(); addKilnShelf(); });
    await E(() => { const inputs = document.querySelectorAll('#kl-shelves > div:last-child input'); inputs[0].value = 'Половинка'; inputs[0].dispatchEvent(new Event('input')); });
    await E(() => { const sel = document.querySelector('#kl-shelves > div:last-child select'); sel.value = 'half'; sel.dispatchEvent(new Event('change')); });
    await E(() => { const inputs = document.querySelectorAll('#kl-shelves > div:last-child input'); inputs[1].value = '47'; inputs[1].dispatchEvent(new Event('input')); inputs[2].value = '1,6'; inputs[2].dispatchEvent(new Event('input')); inputs[3].value = '2'; inputs[3].dispatchEvent(new Event('input'));
      document.getElementById('kl-gap-glaze').value = '1,5'; document.getElementById('kl-ref').value = 'пантата'; saveKiln(); });
    let K = await E(() => KILNS);
    ok('saved: one kiln, posts 5/8/10/15, two shelf types', K.length === 1 && JSON.stringify(K[0].posts.sizes) === '[5,8,10,15]' && K[0].shelves.length === 2, K);
    ok('half shelf saved with diameter, thickness, count', K[0].shelves[1].shape === 'half' && K[0].shelves[1].d === 47 && K[0].shelves[1].t === 1.6 && K[0].shelves[1].qty === 2, K[0].shelves[1]);
    ok('gaps and 12 o\'clock reference saved', K[0].gaps.glaze === 1.5 && K[0].gaps.bisque === 0 && K[0].ref === 'пантата', K[0]);
    const list = await E(() => document.getElementById('kiln-list').innerText);
    ok('list shows size, shelves and posts', /Ø51 × 38 см · 79 л · 3,6 kW/.test(list) && /подпори 5, 8, 10, 15 см/.test(list), list);

    // --- edit keeps unknown fields; warnings for odd values ---
    await E(() => { KILNS[0].futureField = 'x'; saveKilns(); });
    await E(async () => { openKilnMo(KILNS[0].id); await new Promise(r => setTimeout(r, 50)); document.getElementById('kl-d').value = '45'; _kilnWarnUi(); });
    const warn = await E(() => document.getElementById('kl-warn').innerText);
    ok('warning: shelf larger than the chamber', /по-голяма от камерата/.test(warn), warn);
    await E(() => { document.getElementById('kl-d').value = '51'; document.getElementById('kl-notes').value = 'бележка'; saveKiln(); });
    K = await E(() => KILNS);
    ok('edit merges: a field the form does not show survives', K[0].futureField === 'x' && K[0].notes === 'бележка' && K[0].d === 51, K[0]);

    // --- storage: apart from the records; nothing else changed ---
    const keys = await app.idbKeys();
    ok('kilns live in their own key, not as rec: records', !!keys.atelie_kilns && !Object.keys(keys).some(k => k.indexOf('rec:kilns') === 0));
    ok('firings untouched', runsBefore === await E(() => JSON.stringify(DB.firingRuns)));
    await app.reload();
    ok('reopen: the kiln is there', (await E(() => { loadKilns(); return KILNS.length; })) === 1);

    // --- backup and import ---
    const payload = await E(() => JSON.stringify(_backupPayload().payload));
    const P = JSON.parse(payload);
    ok('backup: schema 6 and a kilns section', P.schemaVersion === 6 && Array.isArray(P.kilns) && P.kilns.length === 1, P.schemaVersion);
    const fresh = await h.open(); fresh.acceptConfirms = true;
    await fresh.importFile(payload);
    ok('import restores the kilns', (await fresh.eval(() => KILNS.length)) === 1);
    const oldBackup = JSON.stringify(Object.assign({}, P, { kilns: undefined, schemaVersion: 5 }));
    await fresh.importFile(oldBackup);
    ok('an older backup without kilns keeps the current ones', (await fresh.eval(() => KILNS.length)) === 1);
    await fresh.close();

    // --- rollback to v1.31.1 and back ---
    const prev = H.previous().find(x => x.version === 'v1.31.1');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      await E(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 60)); document.getElementById('pi-notes').value = 'в старата'; savePiece(); await new Promise(r => setTimeout(r, 100)); });
      const r1 = await E(() => ({ v: APP_VERSION, note: DB.pieces.find(p => p.id === 'p-ocarina').notes }));
      ok('v1.31.1 opens and edits the data', r1.v === 'v1.31.1' && r1.note === 'в старата' && !app.log.errors.length, [r1, app.log.errors]);
      h.setRoot(ROOT); await app.reload();
      const r2 = await E(() => ({ k: KILNS.length, note: DB.pieces.find(p => p.id === 'p-ocarina').notes }));
      ok('back in v1.32.0: the kilns survived the old version', r2.k === 1 && r2.note === 'в старата', r2);
      // a v1.32.0 backup imported into v1.31.1 works (kilns ignored there)
      h.setRoot(prev.root);
      const old = await h.open(); old.acceptConfirms = true;
      await old.importFile(payload);
      ok('a v1.32.0 backup imports into v1.31.1 without errors', !old.log.errors.length && (await old.eval(() => DB.pieces.length)) > 0, old.log.errors);
      await old.close(); h.setRoot(ROOT);
    } else console.log('  - no tests/previous/v1.31.1: rollback skipped');

    // --- delete ---
    await E(async () => { show('fp'); switchFP('kilns'); openKilnMo(KILNS[0].id); await new Promise(r => setTimeout(r, 50)); delKiln(); });
    ok('delete removes the kiln', (await E(() => KILNS.length)) === 0);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
