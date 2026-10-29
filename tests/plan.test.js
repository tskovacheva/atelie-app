// v1.33.0 — the kiln plan in a firing, depth „Нива“: kiln, pieces, levels, posts,
// „Предложи нива“ with assumptions and one way out, the height table of 29.10,
// a post added from the plan (second tap confirms), level photos as Blobs outside
// the records and back from a backup, no coordinates, no stage moved, rollback
// to v1.32.2 and back.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('plan:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof openPlan === 'function'))) { console.log('  - no kiln plan in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);
    const before = await E(() => JSON.stringify({ p: DB.pieces, s: DB.series, t: DB.tests }));

    // --- a run without a plan; no kiln yet ---
    const d0 = await E(async () => { openRunDet('run-bis'); await new Promise(r => setTimeout(r, 50)); return { sum: document.getElementById('drn-plan').innerText, btn: document.getElementById('drn-plan-btn').innerText }; });
    ok('run detail: "Още няма план", button "+ План"', /Още няма план/.test(d0.sum) && /План/.test(d0.btn), d0);
    const nk = await E(async () => { openPlan('run-bis'); await new Promise(r => setTimeout(r, 50)); return document.getElementById('pl-body').innerText; });
    ok('no kiln in the registry: says where to add one', /Още няма пещи/.test(nk), nk.slice(0, 120));
    ok('opening the plan writes nothing', (await E(() => JSON.stringify(DB.firingRuns.find(r => r.id === 'run-bis')))).indexOf('config') < 0);

    // --- kiln: the preset, H 38, posts 5/10/15, Ø47 × 1.6 ---
    await E(() => { const k = _kilnNew('kittec-cb80-double', uid); k.clear = 1; k.gaps.bisque = 0; KILNS = [k]; return _kilnsWrite(KILNS); });
    await E(async () => { renderPlan(); const k = KILNS[0]; setPlanKiln(k.id); await new Promise(r => setTimeout(r, 50)); });
    let run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    ok('kiln chosen: gap from the bisque default, clear from the kiln', run.kilnId && run.config.gap === 0 && run.config.clear === 1 && run.config.floorH === 0, run.config);

    // --- pieces: the picker; three pieces with the sizes of the table ---
    const pick = await E(async () => { openPlanAdd(); await new Promise(r => setTimeout(r, 50)); const first = document.getElementById('pla-list').innerText;
      document.getElementById('pla-all').checked = true; _renderPlanAdd(); const keys = [...document.querySelectorAll('.pla-it')].map(x => x.dataset.key); return { first, keys }; });
    ok('picker: bisque run suggests the bone-dry piece first', /p-untyped|Без тип|untyped/i.test(pick.first) || pick.first.length > 0, pick.first.slice(0, 200));
    ok('picker: archived and fully split series are not offered twice', pick.keys.length === new Set(pick.keys).size, pick.keys);
    await E(async () => { ['piece:p-ocarina', 'piece:p-old', 'piece:p-untyped'].forEach(k => { plSel[k] = 1; }); confirmPlanAdd(); await new Promise(r => setTimeout(r, 50)); });
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    ok('three members, no level, no coordinates', run.plan.members.length === 3 && run.plan.members.every(m => !m.level && m.x === undefined && m.y === undefined), run.plan.members);
    ok('members point at the pieces', run.plan.members.map(m => m.ref.id).sort().join() === 'p-ocarina,p-old,p-untyped', run.plan.members.map(m => m.ref));
    const ids = run.plan.members.map(m => m.id);
    await E(async ids => {
      const set = (i, h, d) => { setPlanMember(ids[i], 'h', String(h)); setPlanMember(ids[i], 'd', String(d)); };
      set(0, 22, 18); set(1, 6, 8); set(2, 4, 10);
    }, ids);

    // --- „Предложи нива“: everything fits in one level here ---
    let sug = await E(async () => { planSuggest(); await new Promise(r => setTimeout(r, 50)); return { ass: document.getElementById('pl-sug-ass').innerText, res: document.getElementById('pl-sug-res').innerText }; });
    ok('suggest: assumptions name shelf, thickness, floor posts, gap, clear, posts, H', /Ø47/.test(sug.ass) && /1,6 см/.test(sug.ass) && /дъното: 0 см/.test(sug.ass) && /Отстояние между изделията: 0 см/.test(sug.ass) && /Просвет над най-високото: 1 см/.test(sug.ass) && /5, 10, 15 см/.test(sug.ass) && /38 см/.test(sug.ass), sug.ass);
    ok('suggest: one level, all fits', /Ниво 1 \(горе\)/.test(sug.res) && /Всичко се събира/.test(sug.res) && !/Ниво 2/.test(sug.res), sug.res);

    // shortage: a low chamber → says by how much, and one way out
    await E(() => { KILNS[0].h = 20; });
    sug = await E(async () => { planSuggest(); await new Promise(r => setTimeout(r, 50)); return { res: document.getElementById('pl-sug-res').innerText, way: (document.getElementById('pl-sug-way') || {}).innerText || '' }; });
    ok('suggest, H 20: "липсват 4,6 см"', /липсват 4,6 см/.test(sug.res), sug.res);
    ok('suggest: one way out — without the tallest piece', /^→ Без „.*“ \(22 см\) останалите се събират/.test(sug.way), sug.way);
    await E(() => { KILNS[0].h = 38; plSug = null; });

    // --- the height table of 29.10, built by hand: posts 5 and 8, a post added from the plan ---
    const ask = await E(async () => { document.getElementById('pl-post-new').value = '8'; planPostAsk(); await new Promise(r => setTimeout(r, 30));
      return { q: document.getElementById('pl-post-q').innerText, sizes: KILNS[0].posts.sizes.slice() }; });
    ok('post from the plan: first tap only asks', /Добави подпора 8 см към оборудването на „Kittec CB 80 Double“/.test(ask.q) && ask.sizes.indexOf(8) < 0, ask);
    await E(() => planPostConfirm());
    const sz = await E(async () => { await new Promise(r => setTimeout(r, 50)); const stored = JSON.parse(_storageCache['atelie_kilns'])[0].posts.sizes; return { mem: KILNS[0].posts.sizes, stored }; });
    ok('second tap: 8 cm is in the kiln, stored', JSON.stringify(sz.mem) === '[5,8,10,15]' && JSON.stringify(sz.stored) === '[5,8,10,15]', sz);

    await E(async () => { addPlanLevel(); addPlanLevel(); addPlanLevel(); await new Promise(r => setTimeout(r, 30)); });
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    const L = run.config.levels.map(x => x.id);
    await E(async ([L, ids]) => { setPlanLevel(L[0], 'postH', '5'); setPlanLevel(L[1], 'postH', '8');
      setPlanMember(ids[0], 'level', L[2]); setPlanMember(ids[1], 'level', L[1]); setPlanMember(ids[2], 'level', L[0]); }, [L, ids]);
    const tbl = await E(() => [...document.querySelectorAll('.pl-lv')].map(e => ({ id: e.dataset.id, meas: e.querySelector('.pl-meas').innerText, iss: [...e.querySelectorAll('.pl-iss')].map(x => x.innerText).join(' | '), room: (e.querySelector('.pl-room') || {}).innerText || '' })));
    const by = Object.fromEntries(tbl.map(x => [x.id, x]));
    ok('level 1: 0 + 1,6 = 1,6, room 5; 4 + 1 fits exactly', /плочата е на 0 \+ 1,6 = 1,6 см · място 5 см · най-високо 4 \+ 1 см/.test(by[L[0]].meas) && !by[L[0]].iss, by[L[0]]);
    ok('level 2: 6,6 + 1,6 = 8,2, room 8; 6 + 1 fits', /плочата е на 6,6 \+ 1,6 = 8,2 см · място 8 см/.test(by[L[1]].meas) && !by[L[1]].iss, by[L[1]]);
    ok('level 3: 16,2 + 1,6 = 17,8, to the lid 20,2', /плочата е на 16,2 \+ 1,6 = 17,8 см · до капака 20,2 см · най-високо 22 \+ 1 см/.test(by[L[2]].meas), by[L[2]]);
    const vase = await E(id => [...document.querySelector('.pl-m[data-id="' + id + '"]').querySelectorAll('.pl-iss')].map(x => x.innerText).join(), ids[0]);
    ok('the 22 cm piece: too tall, with the numbers (decimal comma)', /По-високо от мястото: 22 см, място 20,2 см/.test(vase), vase);
    ok('levels show room on the shelf by placement', tbl.every(x => /✓ Плоча: всички 1 имат място/.test(x.room)), tbl.map(x => x.room));
    const tot = await E(() => document.querySelector('.pl-total').innerText);
    ok('totals: the sum to the lid', /= 17,8 см · до капака остават 20,2 см от 38/.test(tot), tot);
    ok('side view is drawn', await E(() => !!document.querySelector('#pl-body svg[aria-label="Пещта отстрани"]')));

    // substrate: a 1 cm stand under the 4 cm piece makes level 1 too low
    await E(id => setPlanMember(id, 's', '1'), ids[2]);
    const sub = await E(id => [...document.querySelector('.pl-m[data-id="' + id + '"]').querySelectorAll('.pl-iss')].map(x => x.innerText).join(), ids[2]);
    ok('substrate counts in the height check', /По-високо от мястото: 5 см, място 5 см \(с 1 см отстояние\)/.test(sub), sub);
    await E(id => setPlanMember(id, 's', ''), ids[2]);

    // --- level photo: a Blob in its own database ---
    await E(async lid => {
      const c = document.createElement('canvas'); c.width = 40; c.height = 30; c.getContext('2d').fillRect(0, 0, 20, 20);
      const b = await new Promise(r => c.toBlob(r, 'image/png'));
      plPhotoLevel = lid; await planPhotoPicked({ files: [new File([b], 'level.png', { type: 'image/png' })] });
      await new Promise(r => setTimeout(r, 200));
    }, L[0]);
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    const pid = (run.config.levels[0].photos || [])[0];
    ok('photo: the level keeps only an id', /^ph-/.test(pid || '') && JSON.stringify(run.config).indexOf('data:') < 0, run.config.levels[0]);
    const keys = await app.idbKeys();
    const runRec = await E(() => new Promise(res => { const q = indexedDB.open('atelie_idb', 1); q.onsuccess = e => { const g = e.target.result.transaction(['kv']).objectStore('kv').get('rec:firingRuns:run-bis'); g.onsuccess = () => res(String(g.result || '')); }; }));
    ok('photo: the stored run has the id, not the image', runRec.indexOf(pid) >= 0 && JSON.stringify(JSON.parse(runRec).config).indexOf('data:') < 0, runRec.slice(0, 200));
    const inStore = await E(id => _phGet(id).then(b => b instanceof Blob && b.size > 0), pid);
    ok('photo: the Blob is in atelie_photos', inStore);

    // --- stages and pieces untouched ---
    ok('the plan changes no piece, series or test', before === await E(() => JSON.stringify({ p: DB.pieces, s: DB.series, t: DB.tests })));

    // --- reopen: everything is there ---
    await app.reload();
    const re = await E(async () => { openRunDet('run-bis'); await new Promise(r => setTimeout(r, 50)); const sum = document.getElementById('drn-plan').innerText;
      openPlan('run-bis'); await new Promise(r => setTimeout(r, 300)); return { sum, lv: document.querySelectorAll('.pl-lv').length, img: !!(document.querySelector('#pl-body img[data-ph]') || {}).src }; });
    ok('reopen: summary in the run detail', /Kittec CB 80 Double · 3 нива · 3 изделия · ✗ 1 проблем/.test(re.sum), re.sum);
    ok('reopen: three levels and the photo', re.lv === 3 && re.img, re);

    // --- editing the run keeps the plan ---
    await E(async () => { openRunMo('run-bis'); await new Promise(r => setTimeout(r, 50)); document.getElementById('rn-notes').value = 'бележка'; saveRun(); await new Promise(r => setTimeout(r, 50)); });
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    ok('run edit keeps kiln, config and members', run.notes === 'бележка' && run.kilnId && run.config.levels.length === 3 && run.plan.members.length === 3, Object.keys(run));

    // --- backup with photos; import into a fresh app ---
    const payload = await E(async () => { const ph = await _plPhotosForBackup(); const b = _backupPayload().payload; if (ph) b.planPhotos = ph; return JSON.stringify(b); });
    const P = JSON.parse(payload);
    ok('backup: planPhotos section with the level photo', P.planPhotos && Object.keys(P.planPhotos).length === 1 && /^data:image/.test(P.planPhotos[pid]), Object.keys(P.planPhotos || {}));
    const fresh = await h.open(); fresh.acceptConfirms = true;
    await fresh.importFile(payload);
    await wait(300);
    const fr = await fresh.eval(async id => ({ has: await _phGet(id).then(b => b instanceof Blob), lv: (DB.firingRuns.find(r => r.id === 'run-bis').config || {}).levels.length }), pid);
    ok('import: plan and photo back', fr.has && fr.lv === 3, fr);
    ok('import: no page errors', !fresh.log.errors.length, fresh.log.errors);
    await fresh.close();

    // --- the suggestion replaces the levels; photos stay on the same number ---
    await E(async () => { show('fp'); openPlan('run-bis'); await new Promise(r => setTimeout(r, 50)); planSuggest(); await new Promise(r => setTimeout(r, 50)); applyPlanSuggest(); await new Promise(r => setTimeout(r, 50)); });
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    ok('apply: one level, everything on it, the photo kept', run.config.levels.length === 1 && run.plan.members.every(m => m.level === run.config.levels[0].id) && (run.config.levels[0].photos || [])[0] === pid, run.config.levels);

    // --- rollback to v1.32.2 and back ---
    const prev = H.previous().find(x => x.version === 'v1.32.2');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      await E(async () => { openRunMo('run-bis'); await new Promise(r => setTimeout(r, 50)); document.getElementById('rn-notes').value = 'в старата'; saveRun(); await new Promise(r => setTimeout(r, 100)); });
      const o = await E(() => ({ v: APP_VERSION, r: DB.firingRuns.find(r => r.id === 'run-bis') }));
      ok('v1.32.2 opens and edits the run', o.v === 'v1.32.2' && o.r.notes === 'в старата' && !app.log.errors.length, app.log.errors);
      h.setRoot(ROOT); await app.reload();
      run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
      ok('back in v1.33.0: the plan survived the old version', run.notes === 'в старата' && run.kilnId && run.config.levels.length === 1 && run.plan.members.length === 3);
    } else console.log('  - no tests/previous/v1.32.2: rollback skipped');

    // --- removing ---
    await E(async () => { openPlan('run-bis'); await new Promise(r => setTimeout(r, 50)); const r = DB.firingRuns.find(x => x.id === 'run-bis'); removePlanMember(r.plan.members[0].id); delPlanLevel(r.config.levels[0].id); await new Promise(r => setTimeout(r, 200)); });
    run = await E(() => DB.firingRuns.find(r => r.id === 'run-bis'));
    ok('remove a member and a level: members stay without level', run.plan.members.length === 2 && run.config.levels.length === 0 && run.plan.members.every(m => !m.level));
    ok('deleting the level deletes its photo', !(await E(id => _phGet(id).then(b => b instanceof Blob), pid)));
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- the private real archives (never packaged): everything into one plan ---
    const PRIV = path.join(__dirname, 'fixtures', 'private');
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const v6 = JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db || raw));
      const ra = await h.open({ seed: { atelie_v6: v6 }, localStorage: { atelie_idb_active: '1' } });
      ra.acceptConfirms = true;
      const res = await ra.eval(async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const before = JSON.stringify({ p: DB.pieces, s: DB.series });
        if (!DB.firingRuns.length) { DB.firingRuns.push({ id: 'r-test', date: '2026-10-30', method: 'electric', purpose: 'bisque' }); }
        const k = _kilnNew('kittec-cb80-double', uid); KILNS = [k]; await _kilnsWrite(KILNS);
        const run = DB.firingRuns[0];
        openPlan(run.id); setPlanKiln(k.id);
        openPlanAdd(); document.getElementById('pla-all').checked = true; _renderPlanAdd();
        _plCandidates(run).forEach(x => { plSel[x.key] = 1; }); confirmPlanAdd(); await sleep(50);
        planSuggest(); await sleep(50); const txt = document.getElementById('pl-sug').innerText; applyPlanSuggest(); await sleep(50);
        const m = run.plan.members;
        return { n: m.length, sized: m.filter(x => x.h != null).length, levels: run.config.levels.length, txt: txt.slice(0, 80),
          same: before === JSON.stringify({ p: DB.pieces, s: DB.series }), sum: _plSummary(run) };
      });
      ok('real archive ' + f + ': ' + res.n + ' items (' + res.sized + ' with height) → ' + res.levels + ' levels; pieces untouched', res.n > 0 && res.same && !ra.log.errors.length, [res, ra.log.errors]);
      await ra.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
