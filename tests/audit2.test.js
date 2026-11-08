// v1.40.4 — граничен случай „по-старо изпичане към запис с по-нов етап“ и следващите
// точки от функционалния одит: връзки (U4), кодове (U11), тест в изпичане (U12),
// действия „от тук“ (U13), потвърждения (U16).
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private', 'real-2026-10-30.json');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

// В страницата: добавя записи към изпичане през „+ Добави“ и връща етапи и стъпки.
const ADD = ([runId, keys]) => {
  show('fp'); openRunDet(runId); openRunAttach(); const a = document.getElementById('pla-all'); if (a) a.checked = true; _renderPlanAdd();
  keys.forEach(k => togglePlanAdd(k)); confirmPlanAdd();
};
const SNAP = ids => ids.map(id => { const p = DB.pieces.find(x => x.id === id) || findSeries(id);
  return { id, st: p.stage, ev: (p.events || []).map(e => [e.type, e.date, (e.data && (e.data.stageValue || e.data.firingRunId)) || ''].join(':')) }; });

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('audit2:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof _stageAnchorBefore === 'function'))) { console.log('  - not in this version'); return; }
    await app.page.setViewportSize({ width: 390, height: 844 });
    app.acceptConfirms = true;
    const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
    await E(() => { document.getElementById('splash')?.remove();
      const mk = (id, stage, events) => DB.pieces.push({ id, name: id, stage, events, photos: [] });
      mk('e-fin', 'finished', []);                                                       // етап без стъпки, по-напред
      mk('e-sold', 'sold', []);                                                          // изход без стъпки
      mk('e-dry', 'bone-dry', []);                                                       // етап без стъпки, по-назад
      mk('e-new', 'bone-dry', [{ id: 'n1', type: 'stage', date: '2026-10-26', note: '', photos: [], data: { stageValue: 'bone-dry' } }]); // по-нова стъпка
      mk('e-glz', 'fired', [{ id: 'g1', type: 'firing', date: '2026-10-01', note: '', photos: [], data: { method: 'electric', atmosphere: 'oxidation', firingPurpose: 'glaze' } }]); // по-ново изпичане
      mk('e-same', 'bisque', [{ id: 's1', type: 'firing', date: '2026-05-24', note: '', photos: [], data: { method: 'pit', atmosphere: 'reduction', firingPurpose: 'alternative' } }]); // самостоятелна стъпка на същата дата
      DB.firingRuns.push({ id: 'old-pit', name: 'Старо трапно', date: '2026-05-24', method: 'pit', purpose: 'alternative', state: 'completed', endedAt: '2026-05-25', photos: [] });
      save(); });

    // ── граничен случай ──
    const ids = ['e-fin', 'e-sold', 'e-dry', 'e-new', 'e-glz', 'e-same'];
    const before = await E(SNAP, ids);
    await E(ADD, ['old-pit', ids.map(i => 'piece:' + i)]); await W();
    const after = await E(SNAP, ids);
    const by = Object.fromEntries(after.map(x => [x.id, x]));
    const runEv = x => x.ev.filter(e => /old-pit/.test(e));
    ok('backdated: each piece gets exactly one step for the old firing, on its end date (25.05)', ids.every(i => runEv(by[i]).length === 1 && runEv(by[i])[0].indexOf('firing:2026-05-25:') === 0 || (i === 'e-same' && runEv(by[i]).length === 1)), after);
    ok('backdated: „Готово“ set without steps stays „Готово“ — kept as a dated step, not overwritten', by['e-fin'].st === 'finished' && by['e-fin'].ev.some(e => /^stage:\d{4}-\d\d-\d\d:finished$/.test(e)), by['e-fin']);
    ok('backdated: an outcome („Продадено“) stays', by['e-sold'].st === 'sold', by['e-sold']);
    ok('backdated: newer dated step wins (bone-dry from 26.10 stays)', by['e-new'].st === 'bone-dry' && by['e-new'].ev.length === 2, by['e-new']);
    ok('backdated: newer firing wins (glaze-fired from 01.10 stays)', by['e-glz'].st === 'fired' && by['e-glz'].ev.length === 2, by['e-glz']);
    ok('backdated: a stage behind the firing moves forward (bone-dry → fired, it was fired then)', by['e-dry'].st === 'fired' && by['e-dry'].ev.length === 1, by['e-dry']);
    ok('backdated: an own step for the same firing day is taken over, not doubled', by['e-same'].ev.length === 1 && /firing:2026-05-24:old-pit/.test(by['e-same'].ev[0]), by['e-same']);
    s = await E(() => _plCandidates(DB.firingRuns.find(r => r.id === 'old-pit')).filter(x => /^e-/.test(x.rec.id)).length);
    ok('backdated: added pieces are not offered again', s === 0, s);
    s = await E(() => { const p = DB.pieces.find(x => x.id === 'e-fin'); curPiece = p.id; curSeries = null; openEventMo('firing'); document.getElementById('ev-firing-run').value = 'old-pit'; onEvFiringRunChange(); document.getElementById('ev-date').value = '2026-05-24';
      const n = p.events.length; saveEvent(); const open = document.getElementById('mo-event').classList.contains('on'); if (open) closeMo('mo-event'); return { same: p.events.length === n, open }; });
    ok('backdated: linking the same firing again from the piece is refused (no duplicate step)', s.same && s.open, s);
    s = await E(() => { const p = DB.pieces.find(x => x.id === 'e-fin'); openPieceDet('e-fin'); const t = document.getElementById('det-piece').textContent; return { st: p.stage, has: /Старо трапно/.test(t) }; });
    ok('backdated: the piece history shows the old firing; the current stage is unchanged', s.st === 'finished' && s.has, s);
    // от изделието: „+ Ново изпичане“ със задна дата към изделие „Готово“ без стъпки
    s = await E(() => { DB.pieces.push({ id: 'e-fin2', name: 'e-fin2', stage: 'finished', events: [], photos: [] }); openPieceDet('e-fin2'); openEventMo('firing'); const g = id => document.getElementById(id);
      g('ev-date').value = '2026-04-10'; g('ev-firing-method').value = 'raku'; g('ev-firing-atmosphere').value = 'reduction'; g('ev-firing-purpose').value = 'alternative'; saveEvent();
      const p = DB.pieces.find(x => x.id === 'e-fin2'); return { st: p.stage, ev: p.events.map(e => e.type + ':' + e.date) }; });
    ok('backdated „+ Ново изпичане“ from a finished piece: firing on 10.04, stage stays „Готово“', s.st === 'finished' && s.ev.indexOf('firing:2026-04-10') >= 0, s);

    // ── U4: връзки ──
    s = await E(() => { openPieceDet('p-ocarina'); const c = [...document.querySelectorAll('#det-piece [onclick]')].find(x => /openMatDet\('mat-xi-mass'\)/.test(x.getAttribute('onclick'))); closeDet('det-piece');
      show('fp'); openRunDet('run-gl'); const f = [...document.querySelectorAll('#drn-rows [onclick]')].find(x => /openFPDet\('fp-glaze'\)/.test(x.getAttribute('onclick')));
      openFPDet('fp-glaze'); const r = [...document.querySelectorAll('#dfp-runs-val [onclick]')].map(x => x.getAttribute('onclick')); closeDet('det-fp'); closeDet('det-run');
      return { clay: !!c, fp: !!f, runs: r }; });
    ok('U4: piece → its mass is a link', s.clay, s);
    ok('U4: firing → its profile is a link; profile → the firings that used it', s.fp && s.runs.some(x => /run-gl/.test(x)), s);

    // ── U11: кодове при еднакви имена ──
    s = await E(() => { DB.pieces.push({ id: 'tw1', name: 'Чаша за чай', code: 'GL-2026-901', stage: 'bisque', events: [], photos: [] }, { id: 'tw2', name: 'Чаша за чай', code: 'GL-2026-902', stage: 'bisque', events: [], photos: [] });
      DB.firingRuns.push({ id: 'pit2', date: '2026-10-28', method: 'pit', purpose: 'alternative', photos: [] }); save(); return 1; });
    await E(ADD, ['pit2', ['piece:tw1', 'piece:tw2']]); await W();
    s = await E(() => { openRunDet('pit2'); rnTab('load'); return [...document.querySelectorAll('#drn-pieces .li-t')].map(x => x.innerText); });
    ok('U11: two „Чаша за чай“ in a firing are told apart by their codes', s.length === 2 && s[0] !== s[1] && s.every(x => /GL-/.test(x)), s);

    // ── U12: тест в изпичане ──
    s = await E(() => { closeDet('det-run'); openTestMo(null); const g = id => document.getElementById(id);
      const n0 = DB.tests.length; g('ti-date').value = '2026-10-30'; g('ti-temp').value = ''; g('ti-hold').value = ''; saveTest(); const savedPlain = DB.tests.length === n0 + 1;
      openTestMo(null); g('ti-run').value = 'run-gl'; testRunPick(); const fill = { d: g('ti-date').value, t: g('ti-temp').value, fp: g('ti-fp').value };
      closeMo('mo-test'); return { savedPlain, fill }; });
    ok('U12: a glaze test is saved without temperature (it was never required — audit corrected)', s.savedPlain, s);
    ok('U12: choosing the firing in the test fills empty date and profile from it', s.fill.d === '2026-09-20' && s.fill.fp === 'fp-glaze', s);
    s = await E(() => { const t = DB.tests[DB.tests.length - 1]; t.date = ''; t.temp = ''; t.firingProfileId = null; openRunDet('run-gl'); openRunTestAttach(); runTestSel = {}; runTestSel[t.id] = 1; confirmRunTestAttach();
      return { run: t.firingRunId, d: t.date, fp: t.firingProfileId }; });
    ok('U12: attaching a test to a firing fills only its empty fields from the firing', s.run === 'run-gl' && s.d === '2026-09-20' && s.fp === 'fp-glaze', s);

    // ── U13: действия от маса и от тест ──
    s = await E(() => { closeDet('det-run'); show('materials'); openMatDet('mat-xi-mass'); [...document.querySelectorAll('#dmat-acts button')].find(b => /Тест на маса/.test(b.textContent)).click();
      const a = { kind: document.getElementById('ti-kind').value, ref: document.getElementById('ti-body-ref').value, dirty: _moIsDirty('mo-test'), under: document.getElementById('det-mat').classList.contains('on') }; closeMo('mo-test');
      [...document.querySelectorAll('#dmat-acts button')].find(b => /Изделие/.test(b.textContent)).click(); a.clay = document.getElementById('pi-clay').value; closeMo('mo-piece'); return a; });
    ok('U13: mass → „+ Тест на маса“ with that mass, over the mass, not dirty', s.kind === 'body' && s.ref === 'mat:mat-xi-mass' && !s.dirty && s.under, s);
    ok('U13: mass → „+ Изделие“ with that mass as the clay', s.clay === 'mat-xi-mass' || s.clay === 'Xi Beach 100', s);
    s = await E(() => { closeDet('det-mat'); show('tests'); openTestDet('t-glaze'); const b = document.getElementById('dtest-newver'); const vis = b.style.display !== 'none'; b.click();
      const a = { vis, mo: document.getElementById('mo-recipe').classList.contains('on'), t: document.getElementById('mo-rec-t').textContent, under: document.getElementById('det-test').classList.contains('on') }; closeMo('mo-recipe');
      openTestDet('t-body'); a.bodyHidden = document.getElementById('dtest-newver').style.display === 'none'; return a; });
    ok('U13: glaze test → „Нова версия на рецептата“ (v3), over the test; not shown for a body test', s.vis && s.mo && /v3/.test(s.t) && s.under && s.bodyHidden, s);

    // ── U16: потвърждения ──
    s = await E(() => { closeDet('det-test'); show('fp'); const oc = window.confirm; let asked = 0; window.confirm = () => { asked++; return false; };
      openRunDet('run-gl'); const t = DB.tests.find(x => x.firingRunId === 'run-gl'); detachTestFromRun(t.id); const still = t.firingRunId === 'run-gl'; window.confirm = () => true; detachTestFromRun(t.id); window.confirm = oc;
      DB.firingRuns.push({ id: 'empty', date: '2026-10-29', method: 'pit', purpose: 'alternative', state: 'loaded', photos: [] }); openRunDet('empty'); _openRunEnd(DB.firingRuns.find(r => r.id === 'empty'), 'completed');
      const msg = document.getElementById('re-msg').textContent; closeMo('mo-run-end'); return { asked, still, gone: !t.firingRunId, msg }; });
    ok('U16: taking a test out of a firing asks; „no“ keeps it', s.asked >= 1 && s.still && s.gone, s);
    ok('U16: ending an empty firing warns', /няма изделия и тестове/.test(s.msg), s);
    ok('no page errors (incl. the detach-test toast)', !app.log.errors.length, app.log.errors);
    await app.close();

    // ── реалният архив: стари изделия към старото трапно изпичане ──
    if (fs.existsSync(PRIV)) {
      const raw = JSON.parse(fs.readFileSync(PRIV, 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db) }, localStorage: { atelie_idb_active: '1' } });
      a2.acceptConfirms = true;
      const r = await a2.eval(([ADDs, SNAPs]) => { document.getElementById('splash')?.remove(); const ADD = eval(ADDs), SNAP = eval(SNAPs);
        const PIT = '185e3e9a-b69d-4fc9-a58b-9c60b4077638', names = ['Барабан тигър', 'Куринуки чаша', 'Окарина кит', 'Чаша за чай'];
        const ps = names.map(n => DB.pieces.find(p => p.name === n)); const b = SNAP(ps.map(p => p.id));
        ADD([PIT, ps.map(p => 'piece:' + p.id)]);
        const a = SNAP(ps.map(p => p.id));
        return names.map((n, i) => ({ n, before: b[i].st, after: a[i].st, steps: a[i].ev.filter(e => e.indexOf(PIT) >= 0).length, newStage: a[i].ev.length - b[i].ev.length })); }, [ADD.toString(), SNAP.toString()]);
      const by = Object.fromEntries(r.map(x => [x.n, x]));
      ok('real 30.10 — „Барабан тигър“ (Готово, no steps) stays Готово', by['Барабан тигър'].after === 'finished' && by['Барабан тигър'].steps === 1, by['Барабан тигър']);
      ok('real 30.10 — „Куринуки чаша“ and „Окарина кит“ keep their stage; one step each', by['Куринуки чаша'].after === by['Куринуки чаша'].before && by['Окарина кит'].after === 'bone-dry' && by['Куринуки чаша'].steps === 1 && by['Окарина кит'].steps === 1, r);
      ok('real 30.10 — no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
var s;
