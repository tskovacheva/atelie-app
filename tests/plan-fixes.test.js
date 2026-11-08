// v1.34.1 — fixes from the real test of 30.10: sizes entered after a piece was put
// in the plan (and a split unit taking its series' size), „Предложи нива“ never
// pretending without sizes, planned pieces shown in the run, the shorter list of
// categories. With the private export of 30.10 (never packaged): the run „Тест“.
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
    console.log('plan-fixes:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof planRefreshSizes === 'function'))) { console.log('  - not in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);

    // pieces go into the plan without sizes; sizes are entered afterwards
    const r0 = await E(async () => {
      const k = _kilnNew('kittec-cb80-double', uid); k.clear = 1; k.gaps.bisque = 0; KILNS = [k]; await _kilnsWrite(KILNS);
      ['p-ocarina', 'p-old', 'p-untyped', 'p-yellow'].forEach(id => { const p = DB.pieces.find(x => x.id === id); delete p.size; p.dimensions = ''; });
      DB.series.forEach(s => { delete s.size; s.dimensions = ''; });
      openRunDet('run-bis'); openPlan('run-bis'); setPlanKiln(k.id);
      ['piece:p-ocarina', 'piece:p-old', 'piece:p-untyped', 'piece:p-yellow'].forEach(x => { plSel[x] = 1; }); confirmPlanAdd();
      const run = _plRun();
      return { n: run.plan.members.length, sized: run.plan.members.filter(m => m.h != null).length, stale: _plStaleSizes(run).length };
    });
    ok('members added without sizes; nothing is stale yet', r0.n > 3 && r0.sized === 0 && r0.stale === 0, r0);

    // „Предложи нива“ with no sizes at all: no success, reasons for each
    let sug = await E(async () => { planSuggest(); await new Promise(r => setTimeout(r, 30)); const e = document.getElementById('pl-sug'); return { t: e.innerText, apply: !!document.getElementById('pl-sug-apply') }; });
    ok('no sizes: „Няма достатъчно данни“, no levels to accept, no „Всичко се събира“', /Няма достатъчно данни/.test(sug.t) && !sug.apply && !/Всичко се събира/.test(sug.t), sug.t.slice(0, 300));
    ok('no sizes: every piece listed with its reason', (sug.t.match(/✗ .* — няма размери/g) || []).length === r0.n, sug.t);

    // sizes entered in the pieces now; the yellow plate is a split unit of a series with a size
    await E(() => {
      const set = (id, z) => { DB.pieces.find(x => x.id === id).size = z; };
      set('p-ocarina', { h: 8, w: 6 }); set('p-old', { h: 6, w: 22 });
      DB.series.find(s => s.id === 'se-plates').size = { h: 2, w: 22 };
      save(); renderPlan();
    });
    let st = await E(() => ({ stale: _plStaleSizes(_plRun()).length, banner: (document.getElementById('pl-stale') || {}).innerText || '', sum: _plSummary(_plRun()) }));
    ok('stale sizes (ocarina, old bowl, 4 yellow units): a banner with a button, and the run summary says so', st.stale === 6 && /6 изделия имат други размери/.test(st.banner) && /размерите на 6 изостават/.test(st.sum), st);
    // a manual correction in the plan stays
    await E(() => { const m = _plRun().plan.members.find(x => x.ref.id === 'p-old'); setPlanMember(m.id, 'h', '7'); });
    await E(() => planRefreshSizes());
    const ms = await E(() => _plRun().plan.members.map(m => [m.ref.id, m.h, m.d, m.src]));
    const by = Object.fromEntries(ms.map(x => [x[0], x]));
    ok('refresh: sizes from the pieces', by['p-ocarina'][1] === 8 && by['p-ocarina'][2] === 6, ms);
    ok('refresh: a split unit gets its series size', by['p-yellow'][1] === 2 && by['p-yellow'][2] === 22, ms);
    ok('refresh: the size corrected in the plan is not overwritten', by['p-old'][1] === 7 && by['p-old'][3] === 'plan', ms);
    ok('after refresh nothing is stale', (await E(() => _plStaleSizes(_plRun()).length)) === 0);

    // suggestion with one piece still without size: planned for the rest, reason for it
    sug = await E(async () => { planSuggest(); await new Promise(r => setTimeout(r, 30)); return { t: document.getElementById('pl-sug').innerText, apply: !!document.getElementById('pl-sug-apply') }; });
    ok('partly sized: levels for the sized ones; the unsized and the one with a height only (kept manual) named with its reason, no „Всичко се събира“', sug.apply && /Не са разположени \(2\)/.test(sug.t) && /Без тип — няма размери/.test(sug.t) && /Стара купа — няма размер на основата/.test(sug.t) && !/Всичко се събира/.test(sug.t), sug.t.slice(-400));

    // the run detail shows the planned pieces
    const det = await E(async () => { closeDet('det-plan'); openRunDet('run-bis'); await new Promise(r => setTimeout(r, 30)); return { rows: [...document.querySelectorAll('.drn-planned')].map(x => x.innerText.replace(/\n/g, ' | ')), hdr: document.getElementById('drn-pieces-count').innerText, all: document.getElementById('drn-pieces').innerText }; });
    ok('run detail: planned pieces with „Планирано“ and count', det.rows.length >= 3 && det.rows.every(r => /Планирано · \d+ бр\./.test(r)) && /планирани/i.test(det.hdr) && !/Няма закачени/.test(det.all), det);
    ok('a piece already in the run is not listed twice', !det.rows.some(r => /^Окарина/.test(r)) || !/Окарина/.test(det.all.split('Планирано')[0]), det.rows);
    ok('the plan moved no stage and made no step', await E(() => DB.pieces.every(p => !(p.events || []).some(e => e.type === 'firing' && e.data && e.data.planned))));

    // level order: one post rather than two stacked; the tall group on top; ↑↓ to swap
    const ord = await E(async () => {
      const run = _plRun(); const m = run.plan.members;
      m.forEach((x, i) => { x.src = 'plan'; x.shape = 'round'; x.h = i === 0 ? 21 : 2; x.d = i === 0 ? 18 : 8; });
      run.config.clear = 0.5; _plTouch(run);
      // more flat pieces than one shelf holds next to the tall one
      for (let i = 0; i < 16; i++) m.push({ id: uid(), ref: { kind: 'piece', id: 'p-gift', idx: i + 1 }, name: 'Плочка', shape: 'round', h: 3, d: 9, src: 'plan', level: null });
      planSuggest(); await new Promise(r => setTimeout(r, 30));
      const P = plSug.res, a = P.levels.map(l => [l.tall, l.postH || null, (l.combo || []).length]);
      planSugMove(0, 1); await new Promise(r => setTimeout(r, 30));
      const b = plSug.res.levels.map(l => [l.tall, l.postH || null, (l.combo || []).join('+')]);
      const t = document.getElementById('pl-sug').innerText;
      return { a, b, fits: P.fits, t: t.slice(-300), btn: document.querySelectorAll('.pl-up,.pl-down').length };
    });
    ok('suggestion: two levels, single posts, the 21 cm piece on top', ord.a.length === 2 && ord.a[1][0] === 21 && ord.a[0][2] === 1 && ord.fits, ord);
    ok('↑/↓ swaps the levels and recomputes: 21 cm below needs 15 + 10', ord.b[0][0] === 21 && ord.b[0][2] === '15+10' && ord.btn >= 2, ord);

    // categories
    const cats = await E(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 50)); return [...document.querySelectorAll('#pi-cats .fchip')].map(b => b.innerText); });
    ok('categories: the seven standard ones offered', ['Съдове за храна', 'Музикални инструменти', 'Декорация', 'Скулптура', 'Бижута', 'Тестови образци', 'Друго'].every(c => cats.indexOf(c) >= 0) && cats.indexOf('Чаши') < 0, cats);
    await E(() => closeMo('mo-piece'));
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // the real export of 30.10 — local only
    const priv = path.join(__dirname, 'fixtures', 'private', 'real-2026-10-30.json');
    if (fs.existsSync(priv)) {
      const raw = JSON.parse(fs.readFileSync(priv, 'utf8'));
      const ra = await h.open({ seed: { atelie_v6: JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db)) }, localStorage: { atelie_idb_active: '1', atelie_kilns: JSON.stringify(raw.kilns || []) } });
      ra.acceptConfirms = true;
      await ra.eval(k => { KILNS = k; return _kilnsWrite(KILNS); }, raw.kilns || []);
      const res = await ra.eval(async () => {
        const run = DB.firingRuns.find(r => r.name === 'Тест');
        openRunDet(run.id); const planned = document.querySelectorAll('.drn-planned').length;
        openPlan(run.id);
        const stale = _plStaleSizes(run).length; planRefreshSizes();
        const sized = run.plan.members.filter(m => m.h != null && (m.d != null || m.w != null)).length;
        planSuggest(); const t = document.getElementById('pl-sug').innerText; const P = plSug.res;
        return { planned, stale, sized, stacked: P.levels.reduce((a, l) => a + Math.max(0, (l.combo || [1]).length - 1), 0), topTall: P.levels[P.levels.length - 1].tall, n: run.plan.members.length, levels: P.levels.length, fits: P.fits, skipped: P.skipped.map(x => x.msg), t: t.slice(-500) };
      });
      ok('30.10 „Тест“: planned pieces visible in the run (' + res.planned + ' rows)', res.planned > 0, res);
      ok('30.10: sizes entered after planning are found (' + res.stale + ') and taken (' + res.sized + ' of ' + res.n + ' sized)', res.stale >= 28 && res.sized >= 29, res);
      ok('30.10: no stacked posts in the suggestion, the tallest level on top', res.stacked === 0 && res.topTall === 21, res);
      ok('30.10: suggestion — levels for the sized, the 4 sauce bowls without sizes named', res.levels >= 1 && res.skipped.length === 4 && res.skipped.every(m => /няма размери/.test(m)) && !/Всичко се събира/.test(res.t), res);
      ok('30.10: no page errors', !ra.log.errors.length, ra.log.errors);
      await ra.close();
    } else console.log('  - no private export of 30.10: skipped');
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
