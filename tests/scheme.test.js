// v1.34.0 — the kiln plan, depths „Схема“ and „Точно“: top view, suggested spots,
// tap and drag (mouse here, the same pointer events as a finger), several shelves
// per level, the check by place: the joint of two halves is a warning, the outer
// edge an error; a piece without a place is checked by height only. Back to „Нива“
// keeps the places; rollback to v1.33.2 and back.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('scheme:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof setPlanMode === 'function'))) { console.log('  - no scheme in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);
    const page = app.page;
    const pieces = await E(() => JSON.stringify({ p: DB.pieces, s: DB.series }));

    // kiln with a round shelf and a half; three pieces; two levels
    const ids = await E(async () => {
      document.getElementById('splash') && document.getElementById('splash').remove();
      const k = _kilnNew('kittec-cb80-double', uid); k.clear = 1; k.gaps.bisque = 0;
      k.shelves.push({ id: uid(), name: 'Половинка Ø47', shape: 'half', d: 47, t: 1.6, qty: 2 });
      KILNS = [k]; await _kilnsWrite(KILNS);
      show('fp'); openRunDet('run-bis'); openPlan('run-bis'); setPlanKiln(k.id);
      ['piece:p-ocarina', 'piece:p-old', 'piece:p-untyped'].forEach(x => { plSel[x] = 1; }); confirmPlanAdd();
      const r = DB.firingRuns.find(x => x.id === 'run-bis'), m = r.plan.members;
      setPlanMember(m[0].id, 'h', '6'); setPlanMember(m[0].id, 'd', '10');
      setPlanMember(m[1].id, 'h', '4'); setPlanMember(m[1].id, 'd', '12');
      setPlanMember(m[2].id, 'h', '3'); setPlanMember(m[2].id, 'shape', ''); m[2].shape = 'rect'; m[2].w = 14; m[2].depth = 8;
      addPlanLevel(); addPlanLevel();
      const L = r.config.levels;
      setPlanLevel(L[0].id, 'postH', '10');
      m.forEach(x => setPlanMember(x.id, 'level', L[0].id));
      setPlanLevelTab(L[0].id);
      return { m: m.map(x => x.id), L: L.map(x => x.id) };
    });

    // level tabs: one level at a time, with count and status
    const tabs = await E(L => { const t = [...document.querySelectorAll('.pl-tab')].map(b => b.innerText.replace(/\s+/g, ' ')); setPlanLevelTab(L[1]); const shown = [...document.querySelectorAll('.pl-lv')].map(e => e.dataset.id); setPlanLevelTab(L[0]); return { t, shown }; }, ids.L);
    ok('level tabs „Ниво 1 (3) …“ / „Ниво 2 · горе (0)“; only the chosen level is shown', /^Ниво 1 \(3\)/.test(tabs.t[0]) && /^Ниво 2 · горе \(0\)/.test(tabs.t[1]) && tabs.shown.length === 1 && tabs.shown[0] === ids.L[1], tabs);
    const side = await E(() => !!document.querySelector('#pl-body svg[aria-label="Пещта отстрани"]'));
    ok('the side view of the whole kiln stays', side);
    // the switch
    let sw = await E(() => ({ b: [...document.querySelectorAll('.pl-mode')].map(b => b.innerText + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')), hint: document.getElementById('pl-mode-hint').innerText, svg: document.querySelectorAll('svg.pl-top:not(.pl-view)').length, view: document.querySelectorAll('svg.pl-top.pl-view').length }));
    ok('depth switch: Нива / Схема / Точно, a new plan starts on Нива; top view only to look', sw.b.join() === 'Нива*,Схема,Точно' && /кое изделие на кое ниво/.test(sw.hint) && sw.svg === 0 && sw.view === 1, sw);
    await E(() => setPlanMode('scheme'));
    let run = await E(() => DB.firingRuns.find(x => x.id === 'run-bis'));
    ok('Схема: stored as config.mode, posts under the level above filled in', run.config.mode === 'scheme' && run.config.levels[0].posts.length === 3 && !(run.config.levels[1].posts || []).length, run.config);
    sw = await E(() => ({ svg: document.querySelectorAll('svg.pl-top').length, ghosts: document.querySelectorAll('svg.pl-top g[data-gx]').length, hint: document.getElementById('pl-mode-hint').innerText }));
    ok('top view of the chosen level; the pieces without a place are suggested (dashed)', sw.svg === 1 && sw.ghosts === 3 && /докосни схемата/.test(sw.hint), sw);
    ok('no coordinates stored yet', run.plan.members.every(m => m.x === undefined));

    // accept the suggested spots
    await E(lid => acceptPlanSpots(lid), ids.L[0]);
    run = await E(() => DB.firingRuns.find(x => x.id === 'run-bis'));
    ok('„Запиши предложените места“ stores x/y for all three', run.plan.members.every(m => typeof m.x === 'number' && typeof m.y === 'number'), run.plan.members.map(m => [m.x, m.y]));
    let room = await E(lid => document.querySelector('.pl-lv[data-id="' + lid + '"] .pl-room').innerText, ids.L[0]);
    ok('room line by place: all three have a place', /✓ Плоча: всички 3 имат място/.test(room), room);

    // two halves: the joint is a warning, the outer edge an error
    await E(lid => planShelves(lid, 'halves'), ids.L[0]);
    await E(([a, lid]) => { const m = _plMember(a); m.x = 0; m.y = 0; m.level = lid; _plTouch(_plRun()); renderPlan(); }, [ids.m[0], ids.L[0]]);
    let iss = await E(id => [...document.querySelectorAll('.pl-m[data-id="' + id + '"] .pl-iss')].map(x => x.innerText).join(' | '), ids.m[0]);
    ok('on the joint of two halves: a warning, not an error', /⚠ Лежи върху фугата между плочите/.test(iss) && !/✗/.test(iss), iss);
    await E(a => { const m = _plMember(a); m.x = 21; m.y = 0; _plTouch(_plRun()); renderPlan(); }, ids.m[0]);
    iss = await E(id => [...document.querySelectorAll('.pl-m[data-id="' + id + '"] .pl-iss')].map(x => x.innerText).join(' | '), ids.m[0]);
    ok('over the outer edge: an error with the amount', /✗ Излиза от плочата с 2,5 см/.test(iss), iss);
    room = await E(lid => document.querySelector('.pl-lv[data-id="' + lid + '"] .pl-room').innerText, ids.L[0]);
    ok('the level says which piece has a place problem', /✗ Проблем с мястото: #1/.test(room), room);
    const sum = await E(() => _plSummary(_plRun()));
    ok('run summary counts it', /✗ \d+ проблем/.test(sum), sum);

    // tap: select in the list, tap the top view
    await E(a => selPlanMember(a), ids.m[0]);
    const pt = await E(lid => { const svg = document.querySelector('svg.pl-top[data-lv="' + lid + '"]'); svg.scrollIntoView({ block: 'center' }); const q = svg.createSVGPoint(); q.x = -8; q.y = -12; const s = q.matrixTransform(svg.getScreenCTM()); return { x: s.x, y: s.y }; }, ids.L[0]);
    await page.mouse.click(pt.x, pt.y);
    await page.waitForTimeout(100);
    let m0 = await E(a => _plMember(a), ids.m[0]);
    ok('tap on an empty spot puts the selected piece there (x −8, y 12)', m0.x === -8 && m0.y === 12, [m0.x, m0.y]);
    iss = await E(id => [...document.querySelectorAll('.pl-m[data-id="' + id + '"] .pl-iss')].map(x => x.innerText).join(' | '), ids.m[0]);
    ok('then it is checked there: on one half, no problem', !iss || !/Излиза|фугата/.test(iss), iss);

    // drag: the piece moves by the pointer
    const g = await E(([lid, id]) => { const svg = document.querySelector('svg.pl-top[data-lv="' + lid + '"]'); const q = svg.createSVGPoint(); q.x = -8; q.y = -12; const a = q.matrixTransform(svg.getScreenCTM()); q.x = -8 + 6; q.y = -12 - 4; const b = q.matrixTransform(svg.getScreenCTM()); return { a: [a.x, a.y], b: [b.x, b.y] }; }, [ids.L[0], ids.m[0]]);
    await page.mouse.move(g.a[0], g.a[1]); await page.mouse.down(); await page.mouse.move((g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2, { steps: 4 }); await page.mouse.move(g.b[0], g.b[1], { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(100);
    m0 = await E(a => _plMember(a), ids.m[0]);
    ok('drag moves it (by 6 cm right, 4 cm up)', m0.x === -2 && m0.y === 16, [m0.x, m0.y]);

    // a piece without a place: height only
    await E(a => planUnplace(a), ids.m[1]);
    await E(a => { const m = _plMember(a); m.h = 12; _plTouch(_plRun()); renderPlan(); }, ids.m[1]);
    iss = await E(id => [...document.querySelectorAll('.pl-m[data-id="' + id + '"] .pl-iss')].map(x => x.innerText).join(' | '), ids.m[1]);
    ok('no place: checked by height only (12 + 1 > 10)', /По-високо от мястото: 12 см, място 10 см/.test(iss) && !/плоча|фуга|Застъпва|подпора/i.test(iss), iss);

    // Точно: numbers, rotate, nudge, post editing
    await E(() => setPlanMode('exact'));
    await E(a => { selPlanMember(a); }, ids.m[2]);
    const ex = await E(a => { const box = document.querySelector('.pl-selp'); return { inputs: [...box.querySelectorAll('[data-pf]')].map(x => x.dataset.pf), btns: [...box.querySelectorAll('button')].map(b => b.innerText) }; }, ids.m[2]);
    ok('Точно: x, y and rotation for a rectangular piece; rotate buttons', ex.inputs.join() === 'x,y,rot' && ex.btns.some(b => /⟳ 15°/.test(b)), ex);
    await E(a => { setPlanMember(a, 'x', '-5,5'); setPlanMember(a, 'y', '-3'); planRotate(a, 15); planRotate(a, -30); plStep = 2; planNudge('piece', a, 0, 1, 0); }, ids.m[2]);
    const m2 = await E(a => _plMember(a), ids.m[2]);
    ok('negative coordinates, rotation wraps to 345°, nudge by 2 cm', m2.x === -3.5 && m2.y === -3 && m2.rot === 345, [m2.x, m2.y, m2.rot]);
    const shelfIn = await E(lid => document.querySelectorAll('.pl-lv[data-id="' + lid + '"] .pl-shelf input[data-sf]').length, ids.L[0]);
    ok('Точно: shelves have x, y, rotation', shelfIn === 6, shelfIn);
    await E(lid => { planPosts(lid, 'add'); }, ids.L[0]);
    run = await E(() => DB.firingRuns.find(x => x.id === 'run-bis'));
    ok('+ подпора adds a fourth post and selects it', run.config.levels[0].posts.length === 4, run.config.levels[0].posts);

    // back to Нива: the places stay, no top view
    await E(() => setPlanMode('levels'));
    run = await E(() => DB.firingRuns.find(x => x.id === 'run-bis'));
    sw = await E(() => document.querySelectorAll('svg.pl-top:not(.pl-view)').length);
    ok('Нива again: top view only to look, places kept, mode field removed', sw === 0 && run.config.mode === undefined && run.plan.members.filter(m => typeof m.x === 'number').length === 2, run.config.mode);
    ok('the plan changed no piece or series', pieces === await E(() => JSON.stringify({ p: DB.pieces, s: DB.series })));

    // reopen
    await E(() => setPlanMode('scheme'));
    // the write to IndexedDB is asynchronous — let it land before reloading
    await app.page.waitForTimeout(500);
    await app.reload();
    const re = await E(async () => { openPlan('run-bis'); await new Promise(r => setTimeout(r, 50)); return { svg: document.querySelectorAll('svg.pl-top').length, tabs: document.querySelectorAll('.pl-tab').length, mode: _plMode(_plRun()) }; });
    ok('reopen: Схема, two level tabs, the chosen level with its top view', re.svg === 1 && re.tabs === 2 && re.mode === 'scheme', re);

    // rollback to v1.33.2 and back
    const prev = H.previous().find(x => x.version === 'v1.33.2');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      await E(async () => { openPlan('run-bis'); await new Promise(r => setTimeout(r, 50)); const r = DB.firingRuns.find(x => x.id === 'run-bis'); setPlanMember(r.plan.members[1].id, 'h', '5'); });
      const o = await E(() => ({ v: APP_VERSION, n: document.querySelectorAll('.pl-lv').length }));
      ok('v1.33.2 opens the plan (levels only) and edits it', o.v === 'v1.33.2' && o.n === 2 && !app.log.errors.length, [o, app.log.errors]);
      h.setRoot(ROOT); await app.reload();
      run = await E(() => DB.firingRuns.find(x => x.id === 'run-bis'));
      ok('back in v1.34.0: mode, places and shelves survived', run.config.mode === 'scheme' && run.plan.members.filter(m => typeof m.x === 'number').length === 2 && run.config.levels[0].shelves.length === 2 && run.plan.members[1].h === 5);
    } else console.log('  - no tests/previous/v1.33.2: rollback skipped');
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
