// v1.40.2 — одит Г4–Г7: счупена бройка от серия, дата на изваждане, изтриване на
// материал с тестове, дублиран прозорец. Плюс сценарият „серия през бисквит и
// глазурно“ върху реалния архив, ако го има.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private', 'real-2026-10-30.json');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 600) : '')); } };

// Нов план за серия (свободните ѝ бройки) — както „+ Добави“ в изпичането.
const MKRUN = ([sid, id, date, purpose]) => {
  const run = { id, name: id, date, method: 'electric', purpose, state: 'planned', plan: { members: [] }, createdAt: date, updatedAt: date };
  DB.firingRuns.push(run);
  const c = _plCandidates(run).find(x => x.kind === 'series' && x.rec.id === sid);
  if (c) _plMembersFrom(c).forEach(m => run.plan.members.push(m));
  save(); return c ? c.refs.map(r => r.unit) : [];
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('fixes:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof confirmRunEnd === 'function'))) { console.log('  - not in this version'); return; }
    await app.page.setViewportSize({ width: 390, height: 844 });
    const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('fp'); });
    await E(() => { window._conf = []; window.confirm = m => { window._conf.push(m); return window._yes !== false; }; });

    // ── Г7 ──
    ok('Г7: one „Добави изделия“ window (no duplicate ids inside it)', await E(() => document.querySelectorAll('#mo-run-attach').length === 1 && document.querySelectorAll('#ra-list').length === 1 && document.querySelectorAll('#ra-srch').length === 1));

    // ── Г5: дата на изваждане ──
    const sid = 'se-plates';
    const units = await E(MKRUN, [sid, 'run-x', '2026-10-20', 'bisque']);
    await E(() => { openRunDet('run-x'); setRunState('run-x', 'loaded'); }); await W();
    let s = await E(() => { document.querySelector('.run-st[data-to="completed"]').click(); const d = document.getElementById('re-date');
      return { on: document.getElementById('mo-run-end').classList.contains('on'), v: d.value, min: d.min, max: d.max, dirty: _moIsDirty('mo-run-end'), st: DB.firingRuns.find(r => r.id === 'run-x').state }; });
    ok('Г5: „Приключено“ asks for the date; default is the firing date, not today; nothing changed yet', s.on && s.v === '2026-10-20' && s.min === '2026-10-20' && s.max === _today() && !s.dirty && s.st === 'loaded', s);
    function _today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    s = await E(() => { const d = document.getElementById('re-date'); d.value = '2026-10-19'; confirmRunEnd(); const a = document.getElementById('mo-run-end').classList.contains('on'); d.value = '2099-01-01'; confirmRunEnd(); const b = document.getElementById('mo-run-end').classList.contains('on'); return { a, b, st: DB.firingRuns.find(r => r.id === 'run-x').state }; });
    ok('Г5: a date before the firing or in the future is refused, state unchanged', s.a && s.b && s.st === 'loaded', s);
    await app.page.goBack({ waitUntil: 'commit' }); await W(400);
    s = await E(() => ({ mo: document.getElementById('mo-run-end').classList.contains('on'), st: DB.firingRuns.find(r => r.id === 'run-x').state, det: document.getElementById('det-run').classList.contains('on') }));
    ok('Г5: back cancels — still „Заредено“, back on the firing', !s.mo && s.st === 'loaded' && s.det, s);
    s = await E(() => { document.querySelector('.run-st[data-to="completed"]').click(); document.getElementById('re-date').value = '2026-10-22'; confirmRunEnd();
      const r = DB.firingRuns.find(x => x.id === 'run-x'), se = findSeries('se-plates'), ev = se.events.find(e => e.type === 'firing' && e.data && e.data.firingRunId === 'run-x');
      return { st: r.state, end: r.endedAt, ev: ev && ev.date, stage: se.stage }; });
    ok('Г5: confirmed with 22.10 → firing ended 22.10, the step in the series has 22.10, stage moved', s.st === 'completed' && s.end === '2026-10-22' && s.ev === '2026-10-22' && s.stage === 'bisque', s);

    // ── Г4: счупена бройка от серия ──
    const free = units;
    s = await E(u => { const r = DB.firingRuns.find(x => x.id === 'run-x'); const m = r.plan.members.find(x => x.ref.unit === u); _conf = []; rnRes(m.id, 'Счупено');
      const se = findSeries('se-plates'), p = _seriesMembers('se-plates').find(x => (x.units || []).indexOf(u) >= 0);
      return { asked: _conf.length, msg: _conf[0], piece: p && { stage: p.stage, units: p.units, qty: p.qty, name: p.name, ev: (p.events || []).filter(e => e.type === 'stage').map(e => e.date + ':' + e.data.stageValue) }, free: _seriesFreeUnits(se, _seriesMembers(se.id)), res: m.result }; }, free[0]);
    ok('Г4: „Счупено“ on a series unit offers to separate it', s.asked === 1 && /Бройка \/\d+/.test(s.msg) && s.res === 'Счупено', s);
    ok('Г4: … the unit becomes its own piece, same number, stage „Счупено“ on the end date', s.piece && s.piece.stage === 'broken' && s.piece.units.length === 1 && s.piece.units[0] === free[0] && s.piece.qty === 1 && s.piece.ev.indexOf('2026-10-22:broken') >= 0 && s.free.indexOf(free[0]) < 0, s);
    s = await E(MKRUN, [sid, 'run-g', '2026-10-25', 'glaze']);
    ok('Г4: the next (glaze) firing offers only the remaining units', s.length === free.length - 1 && s.indexOf(free[0]) < 0, { s, free });
    s = await E(u => { window._yes = false; const r = DB.firingRuns.find(x => x.id === 'run-x'); const m = r.plan.members.find(x => x.ref.unit === u); const n = DB.pieces.length; rnRes(m.id, 'Добре'); rnRes(m.id, 'Счупено'); window._yes = true;
      return { same: DB.pieces.length === n, res: m.result }; }, free[1]);
    ok('Г4: declined → result recorded, nothing separated', s.same && s.res === 'Счупено', s);
    s = await E(u => { const r = DB.firingRuns.find(x => x.id === 'run-x'); const m = r.plan.members.find(x => x.ref.unit === u); _conf = []; rnRes(m.id, 'Добре'); rnRes(m.id, 'Счупено'); return { asked: _conf.length, n: DB.pieces.filter(p => p.seriesId === 'se-plates' && p.stage === 'broken' && (p.units || [])[0] === u).length }; }, free[0]);
    ok('Г4: already separated and broken → not asked again, no second piece', s.asked === 0 && s.n === 1, s);

    // ── Г6: изтриване на материал, ползван от тестове ──
    s = await E(() => { window._yes = false; _conf = []; curMat = 'mat-xi-mass'; DB.materials.forEach(x => x.archivedAt = '2026-11-01T00:00:00Z'); delMat(); const a = _conf[0]; _conf = []; const m = DB.materials.find(x => x.cat === 'glaze') || DB.materials[0]; DB.tests[0].materialId = m.id; curMat = m.id; delMat(); window._yes = true; DB.materials.forEach(x => delete x.archivedAt); return { a, b: _conf[0], still: DB.materials.some(x => x.id === 'mat-xi-mass') }; });
    ok('Г6: deleting a mass used by a body test warns about the test', /1 тест го ползва/.test(s.a) && s.still, s);
    ok('Г6: deleting a ready glaze used by a glaze test warns too', /тест/.test(s.b), s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // ── реалният архив: серия през бисквит и глазурно ──
    if (fs.existsSync(PRIV)) {
      const raw = JSON.parse(fs.readFileSync(PRIV, 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db) }, localStorage: { atelie_idb_active: '1' } });
      const E2 = (f, a) => a2.eval(f, a);
      await E2(() => { document.getElementById('splash')?.remove(); window.confirm = () => true; show('fp'); });
      const SID = '515924d1-b244-4a5d-b671-cbeb7100e7eb', RUN = '1d832fa7-67bc-4821-a965-5bfe12289183';
      const r = await E2(([SID, RUN]) => {
        openRunDet(RUN); setRunState(RUN, 'loaded'); document.querySelector('.run-st[data-to="completed"]').click();
        const def = document.getElementById('re-date').value; confirmRunEnd();
        const run = DB.firingRuns.find(x => x.id === RUN), m = run.plan.members.find(x => x.ref.id === SID && x.ref.unit === 2);
        rnRes(m.id, 'Счупено');
        const se = findSeries(SID), sum1 = _seriesStageSummary(se).parts.map(p => p.stage + ':' + p.count).join(',');
        const g = { id: 'glz', date: run.date, method: 'electric', purpose: 'glaze', state: 'planned', plan: { members: [] } }; DB.firingRuns.push(g);
        const c = _plCandidates(g).find(x => x.kind === 'series' && x.rec.id === SID); _plMembersFrom(c).forEach(mm => g.plan.members.push(mm));
        openRunDet('glz'); setRunState('glz', 'loaded'); document.querySelector('.run-st[data-to="completed"]').click(); confirmRunEnd();
        const sum2 = _seriesStageSummary(findSeries(SID)).parts.map(p => p.stage + ':' + p.count).join(',');
        const br = _seriesMembers(SID).find(p => (p.units || [])[0] === 2);
        return { def, rdate: run.date, end: run.endedAt, sum1, glazeUnits: c.refs.map(x => x.unit), sum2, broken: br && br.stage };
      }, [SID, RUN]);
      ok('real 30.10 — bisque: default end date = firing date (' + r.rdate + ')', r.def === r.rdate && r.end === r.rdate, r);
      ok('real 30.10 — broken /2 separated; glaze firing gets /1 and /3 only', r.broken === 'broken' && r.glazeUnits.join(',') === '1,3', r);
      ok('real 30.10 — after glaze: 2 fired, the broken one stays broken', /fired:2/.test(r.sum2) && r.broken === 'broken', r);
      ok('real 30.10 — no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
