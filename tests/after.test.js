// v1.35.0 — „След“: state of a firing (Планирано → Заредено → Приключено |
// Прекъснато), steps created from the plan, the stage moved only on completion,
// results per piece and unit, cones, after-photos, the corrections log, „Счупено“
// offering an outcome, refire, „+ Добави“ into the plan, old firings unchanged,
// rollback to v1.34.2 and back.
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
    console.log('after:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof setRunState === 'function'))) { console.log('  - not in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);
    const stages = () => E(() => Object.fromEntries(DB.pieces.map(p => [p.id, p.stage]).concat((DB.series || []).map(s => [s.id, s.stage]))));
    const st0 = await stages();
    const oldRuns = await E(() => JSON.stringify(DB.firingRuns));

    // old firings: no state → shown as before, no state block
    const old = await E(async () => { openRunDet('run-bis'); await new Promise(r => setTimeout(r, 30)); return document.getElementById('drn-state').innerText; });
    ok('an old firing has no state block', old === '', old);

    // a new firing for today starts as a plan
    const rid = await E(async () => {
      show('fp'); openRunMo(null); await new Promise(r => setTimeout(r, 30));
      document.getElementById('rn-name').value = 'Бисквит днес'; document.getElementById('rn-method').value = 'electric'; document.getElementById('rn-purpose').value = 'bisque';
      saveRun(); await new Promise(r => setTimeout(r, 30));
      return DB.firingRuns.find(r => r.name === 'Бисквит днес').id;
    });
    let run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    ok('new firing for today: „Планирано“', run.state === 'planned', run.state);
    const past = await E(async () => { openRunMo(null); await new Promise(r => setTimeout(r, 30)); document.getElementById('rn-date').value = '2026-01-05'; document.getElementById('rn-method').value = 'electric'; saveRun(); await new Promise(r => setTimeout(r, 30)); return DB.firingRuns.find(r => r.date === '2026-01-05').state; });
    ok('new firing with a past date: no state (finished, as before)', past === undefined, past);

    // „+ Добави“ in a planned firing goes to the plan
    await E(async id => {
      const k = _kilnNew('kittec-cb80-double', uid); k.clear = 1; KILNS = [k]; await _kilnsWrite(KILNS);
      openRunDet(id); openRunAttach(); await new Promise(r => setTimeout(r, 30));
      document.getElementById('pla-all').checked = true; _renderPlanAdd();
      ['piece:p-untyped', 'piece:p-old', 'series:se-plates'].forEach(x => { plSel[x] = 1; }); confirmPlanAdd(); await new Promise(r => setTimeout(r, 30));
    }, rid);
    run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    const det = await E(() => ({ open: document.getElementById('det-run').classList.contains('on'), planned: document.querySelectorAll('.drn-planned').length }));
    const units = run.plan.members.filter(m => m.ref.kind === 'series').map(m => m.ref.unit);
    ok('„+ Добави“ in a plan: members in the plan, back in the run with „Планирано“ rows, no steps', run.plan.members.length === 2 + units.length && det.open && det.planned === 3 && (await E(() => !(DB.pieces.find(p => p.id === 'p-untyped').events || []).some(e => e.data && e.data.firingRunId))), [run.plan.members.length, det]);
    // levels for the plan
    await E(id => { openPlan(id); setPlanKiln(KILNS[0].id); addPlanLevel(); const r = _plRun(); r.plan.members.forEach(m => { m.level = r.config.levels[0].id; }); _plTouch(r); closeDet('det-plan'); }, rid);

    // Заредено: steps, no stage move
    await E(id => { openRunDet(id); setRunState(id, 'loaded'); }, rid);
    run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    const ev = await E(id => ({
      p: DB.pieces.find(p => p.id === 'p-untyped').events.filter(e => e.data && e.data.firingRunId === id).length,
      s: (DB.series.find(s => s.id === 'se-plates').events.find(e => e.data && e.data.firingRunId === id) || {}).data,
      rows: _runPieces(id).length
    }), rid);
    ok('Заредено: state, a step on each piece, one on the series with its unit numbers', run.state === 'loaded' && ev.p === 1 && ev.s && JSON.stringify(ev.s.units) === JSON.stringify(units.slice().sort((a, b) => a - b)) && ev.rows === 3, [run.state, ev]);
    ok('Заредено: no stage moved', JSON.stringify(st0) === JSON.stringify(await stages()), [st0, await stages()]);
    const yellow = await E(id => _effectiveEvents(DB.pieces.find(p => p.id === 'p-yellow')).some(e => e.data && e.data.firingRunId === id), rid);
    ok('the series step for some units does not reach a split piece with other units', !yellow);
    const sb = await E(() => document.getElementById('drn-state').innerText);
    ok('state block: Заредено, with Приключено / Прекъснато / Върни в план', /Заредено/.test(sb) && /Приключено/.test(sb) && /Прекъснато/.test(sb) && /Върни в план/.test(sb), sb);

    // corrections: changing a level after loading is logged; the reason is optional
    await E(id => { openPlan(id); addPlanLevel(); const r = _plRun(); setPlanMember(r.plan.members[0].id, 'level', r.config.levels[1].id); }, rid);
    run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    ok('a level change after loading is logged (from → to)', (run.corrections || []).some(c => /ниво/.test(c.what) && c.from === 'ниво 1' && c.to === 'ниво 2'), run.corrections);

    // results, cone, after-photo place
    const res = await E(async () => {
      const r = _plRun(); setPlanLevelTab(r.config.levels[0].id); await new Promise(x => setTimeout(x, 20));
      const sel = document.querySelectorAll('.pl-res select').length, cone = !!document.querySelector('.pl-cone');
      const after = [...document.querySelectorAll('#pl-body button')].some(b => /Снимка след/.test(b.innerText));
      const ms = r.plan.members;
      setPlanResult(ms[1].id, 'Добре'); setPlanResultNote(ms[1].id, 'чисто'); setPlanResult(ms[2].id, 'Пукнато');
      setPlanCone(r.config.levels[0].id, 'cone', '06'); setPlanCone(r.config.levels[0].id, 'coneResult', 'Точно');
      return { sel, cone, after };
    });
    ok('after loading: a result per piece, cone per level, „+ Снимка след“', res.sel > 0 && res.cone && res.after, res);
    run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    ok('results and cone stored in the plan', run.plan.members[1].result === 'Добре' && run.plan.members[1].resultNote === 'чисто' && run.config.levels[0].cone === '06' && run.config.levels[0].coneResult === 'Точно');
    await E(id => { const r = _plRun(); setPlanResult(r.plan.members[1].id, 'Пукнато'); }, rid);
    run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    ok('changing a result is logged', run.corrections.some(c => /резултат/.test(c.what) && c.from === 'Добре' && c.to === 'Пукнато'));
    await E(id => { const r = DB.firingRuns.find(x => x.id === id); openRunDet(id); setCorrReason(id, r.corrections[0].id, 'преместих я'); }, rid);
    ok('a reason can be added to a correction', (await E(id => DB.firingRuns.find(r => r.id === id).corrections[0].reason, rid)) === 'преместих я');

    // Счупено offers the outcome for a single piece
    const broke = await E(async id => { openPlan(id); const r = _plRun(); const m = r.plan.members.find(x => x.ref.id === 'p-old'); setPlanResult(m.id, 'Счупено'); await new Promise(x => setTimeout(x, 20)); return DB.pieces.find(p => p.id === 'p-old').stage; }, rid);
    ok('„Счупено“ (confirmed) adds the outcome to the piece', broke === 'broken', broke);

    // Прекъснато: no stage move; reopen; Приключено moves the stage with the end date
    await E(id => { closeDet('det-plan'); (setRunState(id, 'interrupted'), confirmRunEnd()); }, rid);
    const s1 = await stages();
    ok('Прекъснато: the untyped piece did not become bisque', s1['p-untyped'] === st0['p-untyped'], [s1['p-untyped'], st0['p-untyped']]);
    await E(id => setRunState(id, 'loaded'), rid);
    await E(id => (setRunState(id, 'completed'), confirmRunEnd()), rid);
    const s2 = await stages(); run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
    const evDate = await E(id => DB.pieces.find(p => p.id === 'p-untyped').events.find(e => e.data && e.data.firingRunId === id).date, rid);
    ok('Приключено: the piece moves to Бисквит, its step dated with the end', s2['p-untyped'] === 'bisque' && run.state === 'completed' && evDate === run.endedAt, [s2['p-untyped'], evDate, run.endedAt]);
    const rs = await E(() => document.getElementById('drn-results').innerText);
    ok('run detail: results summary and the log', /Пукнато 1 · Счупено 1/.test(rs) && /Дневник на промените/i.test(rs), rs.slice(0, 300));

    // refire: config without observations
    await E(id => refireRun(id), rid);
    const rf = await E(id => { const r = DB.firingRuns.find(x => x.refireOf === id); return r && { st: r.state, lv: r.config.levels.length, m: r.plan.members.length, res: r.plan.members.some(m => m.result || m.resultNote), cone: r.config.levels.some(L => L.cone || L.coneResult || (L.photos || []).length), corr: r.corrections, kiln: r.kilnId, lvmap: r.plan.members.every(m => !m.level || r.config.levels.some(L => L.id === m.level)) }; }, rid);
    ok('refire: a new plan with the kiln, levels and pieces; no results, cones, photos or log', rf && rf.st === 'planned' && rf.lv === 2 && rf.m === run.plan.members.length && !rf.res && !rf.cone && !rf.corr && rf.kiln && rf.lvmap, rf);

    // back to plan from loaded removes the created steps
    const rid2 = await E(id => DB.firingRuns.find(x => x.refireOf === id).id, rid);
    await E(id => setRunState(id, 'loaded'), rid2);
    const n1 = await E(id => DB.pieces.concat(DB.series).reduce((a, r) => a + (r.events || []).filter(e => e.data && e.data.firingRunId === id).length, 0), rid2);
    await E(id => setRunState(id, 'planned'), rid2);
    const n2 = await E(id => DB.pieces.concat(DB.series).reduce((a, r) => a + (r.events || []).filter(e => e.data && e.data.firingRunId === id).length, 0), rid2);
    ok('„Върни в план“ removes the steps „Заредено“ made', n1 === 3 && n2 === 0, [n1, n2]);

    ok('old firings are untouched', oldRuns === await E(() => JSON.stringify(DB.firingRuns.filter(r => ['run-bis', 'run-gl', 'run-pit'].indexOf(r.id) >= 0))));

    // rollback to v1.34.2 and back
    const prev = H.previous().find(x => x.version === 'v1.34.2');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      await E(async id => { openRunMo(id); await new Promise(r => setTimeout(r, 50)); document.getElementById('rn-notes').value = 'в старата'; saveRun(); await new Promise(r => setTimeout(r, 50)); }, rid);
      const o = await E(id => ({ v: APP_VERSION, st: DB.firingRuns.find(r => r.id === id).state }), rid);
      ok('v1.34.2 opens and edits the finished firing', o.v === 'v1.34.2' && o.st === 'completed' && !app.log.errors.length, [o, app.log.errors]);
      h.setRoot(ROOT); await app.reload();
      run = await E(id => DB.firingRuns.find(r => r.id === id), rid);
      ok('back in v1.35.0: state, results and log survived', run.state === 'completed' && run.notes === 'в старата' && run.plan.members[1].result === 'Счупено' && run.corrections.length >= 3);
    } else console.log('  - no tests/previous/v1.34.2: rollback skipped');
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // the real export of 30.10 (local only): „Тест“ was planned in v1.34 — no state
    const priv = path.join(__dirname, 'fixtures', 'private', 'real-2026-10-30.json');
    if (fs.existsSync(priv)) {
      const raw = JSON.parse(fs.readFileSync(priv, 'utf8'));
      const ra = await h.open({ seed: { atelie_v6: JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db)) }, localStorage: { atelie_idb_active: '1' } });
      ra.acceptConfirms = true;
      await ra.eval(k => { KILNS = k; return _kilnsWrite(KILNS); }, raw.kilns || []);
      const r = await ra.eval(() => {
        const sg = () => JSON.stringify(DB.pieces.map(p => p.stage).concat(DB.series.map(s => s.stage)));
        const s0 = sg(), run = DB.firingRuns.find(x => x.name === 'Тест');
        const st = _runState(run), others = DB.firingRuns.filter(x => x !== run).every(x => _runState(x) === 'completed');
        setRunState(run.id, 'loaded'); const n = _runPieces(run.id).length, s1 = sg();
        (setRunState(run.id, 'completed'), confirmRunEnd());
        return { st, others, n, same: s0 === s1, bisque: DB.pieces.concat(DB.series).filter(p => p.stage === 'bisque').length };
      });
      ok('30.10 „Тест“ (planned in v1.34): Планирано; the other firings stay finished', r.st === 'planned' && r.others, r);
      ok('30.10: Заредено makes ' + r.n + ' rows and moves no stage; Приключено moves them to Бисквит', r.n === 15 && r.same && r.bisque >= 15, r);
      ok('30.10: no page errors', !ra.log.errors.length, ra.log.errors);
      await ra.close();
    } else console.log('  - no private export of 30.10: skipped');
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
