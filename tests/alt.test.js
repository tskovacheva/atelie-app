// v1.40.3 — одит A1–A4: алтернативни изпичания (трап, варел, раку, обвара, сагар).
// Резултат по бройка във всяко изпичане без план на пещта; зареждане без нива; един
// запис за изпичането, видим и от историята на изделието; полета според метода.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

// Снимка като файл — минава през същото свиване като всяка снимка.
const PHOTO = async () => { const c = document.createElement('canvas'); c.width = 40; c.height = 30; const x = c.getContext('2d'); x.fillStyle = '#a63'; x.fillRect(0, 0, 40, 30);
  const b = await new Promise(r => c.toBlob(r, 'image/jpeg')); return new File([b], 'r.jpg', { type: 'image/jpeg' }); };

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('alt:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof _rnDocEnsure === 'function'))) { console.log('  - not in this version'); return; }
    await app.page.setViewportSize({ width: 390, height: 844 });
    app.acceptConfirms = true;
    const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
    await E(() => { document.getElementById('splash')?.remove(); show('fp');
      for (let i = 1; i <= 4; i++) DB.pieces.push({ id: 'pp' + i, name: 'Топка ' + i, stage: 'bisque', events: [{ id: 'pe' + i, type: 'stage', date: '2026-10-01', note: '', photos: [], data: { stageValue: 'bisque' } }], photos: [] });
      save(); });

    // ── A4: формулярът според метода ──
    let s = await E(() => { openRunMo(null); const sel = document.getElementById('rn-method'), vis = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null; };
      const one = m => { sel.value = m; document.getElementById('rn-purpose').value = ''; onRunMethodChange(); const pur = document.getElementById('rn-purpose').value, prof = vis('rn-profile'); moTab('mo-run', 'real'); const o = { hold: vis('rn-hold'), cones: vis('rn-cones'), fuel: vis('rn-fuel'), prof: vis('rn-profile'), raku: vis('rn-raku-medium'), obv: vis('rn-obv-mix'), sag: vis('rn-sag-contents'), peak: document.getElementById('rn-peak-l').textContent, pur }; o.prof = prof; moTab('mo-run', 'basic'); return o; };
      const r = { pit: one('pit'), raku: one('raku'), obvara: one('obvara'), sagar: one('sagar'), electric: one('electric') }; closeMo('mo-run'); return r; });
    ok('A4 pit: fuel/additives/time, no hold, no cones, no profile; temperature only „if measured“; type → Алтернативно', s.pit.fuel && !s.pit.hold && !s.pit.cones && !s.pit.prof && /ако има/.test(s.pit.peak) && s.pit.pur === 'alternative' && !s.pit.raku, s.pit);
    ok('A4 raku: reduction medium, time, cooling — and only those', s.raku.raku && !s.raku.obv && !s.raku.sag && !s.raku.cones, s.raku);
    ok('A4 obvara: mixture, dipping, after-treatment', s.obvara.obv && !s.obvara.raku && !s.obvara.sag, s.obvara);
    ok('A4 sagar: contents and wrapping', s.sagar.sag && !s.sagar.obv && !s.sagar.raku, s.sagar);
    ok('A4 electric: profile, hold and cones as before; no alternative fields', s.electric.hold && s.electric.cones && s.electric.prof && !s.electric.fuel && !s.electric.raku && /Пикова/.test(s.electric.peak), s.electric);
    s = await E(() => { const out = {};
      for (const [m, f] of [['raku', { 'rn-raku-medium': 'стърготини', 'rn-raku-min': '15', 'rn-raku-quench': 'вода' }], ['obvara', { 'rn-obv-mix': 'брашно, мая, вода', 'rn-obv-dip': '3 сек', 'rn-obv-after': 'вода' }], ['sagar', { 'rn-sag-contents': 'мед, сол, кори', 'rn-sag-wrap': 'фолио' }]]) {
        openRunMo(null); document.getElementById('rn-date').value = '2026-10-15'; document.getElementById('rn-method').value = m; onRunMethodChange(); Object.keys(f).forEach(k => document.getElementById(k).value = f[k]); saveRun();
        const r = DB.firingRuns.find(x => x.id === curRun); out[m] = { alt: r.alt, pur: r.purpose, prep: document.getElementById('drn-alt').innerText.replace(/\n/g, ' | ') };
        openRunMo(r.id); out[m].reload = Object.keys(f).every(k => document.getElementById(k).value === f[k]); closeMo('mo-run'); closeDet('det-run'); }
      return out; });
    ok('A4 raku saved: medium, 15 min, cooling; shown in the detail; reopened in the form', s.raku.alt.rakuMedium === 'стърготини' && s.raku.alt.rakuMin === 15 && /Среда за редукция/.test(s.raku.prep) && s.raku.reload && s.raku.pur === 'alternative', s.raku);
    ok('A4 obvara saved: mixture, dipping, after-treatment', s.obvara.alt.obvMix === 'брашно, мая, вода' && /Състав на разтвора/.test(s.obvara.prep) && s.obvara.reload, s.obvara);
    ok('A4 sagar saved: contents, wrapping', s.sagar.alt.sagContents === 'мед, сол, кори' && s.sagar.alt.sagWrap === 'фолио' && s.sagar.reload, s.sagar);

    // ── A1/A2: трапно изпичане с 4 изделия ──
    s = await E(() => { openRunMo(null); document.getElementById('rn-date').value = '2026-10-20'; document.getElementById('rn-method').value = 'pit'; onRunMethodChange(); document.getElementById('rn-fuel').value = 'дърва'; saveRun();
      const id = curRun; rnTab('load');
      return { id, plan: getComputedStyle(document.getElementById('drn-plan-sec')).display, st: _runState(DB.firingRuns.find(x => x.id === id)) }; });
    const PIT = s.id;
    ok('A2 pit, load tab: no kiln plan (levels, shelves, posts)', s.plan === 'none', s);
    s = await E(() => { openRunAttach(); const mo = document.getElementById('mo-plan-add').classList.contains('on');
      document.getElementById('pla-all').checked = true; _renderPlanAdd(); ['pp1', 'pp2', 'pp3', 'pp4'].forEach(id => togglePlanAdd('piece:' + id)); confirmPlanAdd();
      const r = DB.firingRuns.find(x => x.id === curRun);
      return { mo, n: r.plan.members.length, cfg: !!r.config, ev: ['pp1', 'pp2', 'pp3', 'pp4'].map(id => DB.pieces.find(p => p.id === id).events.filter(e => e.type === 'firing' && e.data.firingRunId === r.id).length),
        prep: document.querySelectorAll('#drn-prep .rn-prow').length, stage: DB.pieces.find(p => p.id === 'pp1').stage }; });
    ok('A1 „+ Добави“ in a past pit firing: list of pieces, 4 units, no kiln config', s.mo && s.n === 4 && !s.cfg, s);
    ok('A3 each piece gets one firing step pointing to the firing; stage moves (fired)', s.ev.every(x => x === 1) && s.stage === 'fired', s);
    ok('A2 load tab: preparation row per piece', s.prep === 4, s);
    s = await E(async () => { const r = DB.firingRuns.find(x => x.id === curRun), M = r.plan.members;
      rnMemSet(M[0].id, 'wrap', 'saggar'); rnMemSet(M[0].id, 'prep', 'мед, сол, бананови кори');
      rnRes(M[0].id, 'Добре'); rnRes(M[1].id, 'Пукнато'); rnRes(M[2].id, 'Добре'); rnRes(M[3].id, 'Друго');
      rnMemSet(M[0].id, 'resultNote', 'медни отблясъци, черно-сиво опушване');
      rnTab('res'); return { res: M.map(m => m.result), note: M[0].resultNote, wrap: M[0].wrap, prep: M[0].prep, rows: document.querySelectorAll('#drn-mres .rn-rrow').length, shown: /обвиване: сагар/.test(document.getElementById('drn-mres').innerText) }; });
    ok('A1 results per piece: result, note on colours/marks, wrapping and saggar contents', s.res.join() === 'Добре,Пукнато,Добре,Друго' && /медни/.test(s.note) && s.wrap === 'saggar' && /бананови/.test(s.prep) && s.rows === 4 && s.shown, s);
    s = await E(async (PHOTO) => { const f = await (new Function('return (' + PHOTO + ')()'))(); const r = DB.firingRuns.find(x => x.id === curRun), m = r.plan.members[0];
      rnMemPhPick(m.id); rnMemPh({ files: [f], value: '' }); rnMemPhPick(m.id); rnMemPh({ files: [f], value: '' });
      await new Promise(x => setTimeout(x, 900)); const m2 = r.plan.members[0];
      return { n: (m2.photos || []).length, img: document.querySelectorAll('#drn-mres .rn-rrow')[0].querySelectorAll('.rn-mph img').length, general: (r.photos || []).length }; }, PHOTO.toString());
    ok('A1 photos of the result for one piece (2), the general photos stay separate', s.n === 2 && s.img === 2 && s.general === 0, s);

    // ── A3: историята на изделието ──
    await E(() => { closeDet('det-run'); show('pieces'); }); await W(400);
    s = await E(async () => { openPieceDet('pp1'); document.querySelectorAll('#det-piece details, #det-piece .pd-sec').forEach(x => x.classList && x.classList.add('open'));
      const row = [...document.querySelectorAll('#det-piece .pd-li')].find(x => /openRunResult/.test(x.getAttribute('onclick') || ''));
      const txt = row && row.innerText; row && row.click(); await new Promise(r => setTimeout(r, 150));
      const d = document.getElementById('det-run'), on = d.classList.contains('on') && getComputedStyle(d).visibility !== 'hidden';
      return { txt, on, tab: document.querySelector('#drn-tabs .on') && document.querySelector('#drn-tabs .on').dataset.tab, flash: !!document.querySelector('#drn-mres .rn-rrow.flash[data-mref="pp1"]') }; });
    ok('A3 piece history shows the result from the firing (one record)', /Добре/.test(s.txt || '') && /медни/.test(s.txt) && /2 сн\./.test(s.txt), s);
    ok('A3 tapping it opens the firing on „Резултати“, at this piece', s.on && s.tab === 'res' && s.flash, s);
    await W(400); await app.page.goBack({ waitUntil: 'commit' }); await W(400);
    ok('A3 back → the piece again', await E(() => document.getElementById('det-piece').classList.contains('on') && getComputedStyle(document.getElementById('det-piece')).visibility !== 'hidden' && curPiece === 'pp1'));
    // редакция без дублиране
    s = await E(() => { const r = DB.firingRuns.find(x => x.id === curRun), before = r.plan.members.length; openRunDet(r.id);
      for (let i = 0; i < 3; i++) { rnRes(r.plan.members[1].id, 'Добре'); rnRes(r.plan.members[1].id, 'Пукнато'); rnMemSet(r.plan.members[1].id, 'resultNote', 'пукнатина ' + i); }
      return { before, after: r.plan.members.length, ev: DB.pieces.find(p => p.id === 'pp2').events.filter(e => e.type === 'firing').length, note: r.plan.members[1].resultNote }; });
    ok('editing a result again and again: same units, one step in the piece', s.before === 4 && s.after === 4 && s.ev === 1 && s.note === 'пукнатина 2', s);

    // ── варелно с бройки от серия; счупена бройка ──
    s = await E(() => { closeDet('det-run'); show('fp'); openRunMo(null); document.getElementById('rn-date').value = '2026-10-21'; document.getElementById('rn-method').value = 'barrel'; onRunMethodChange(); saveRun();
      const r = DB.firingRuns.find(x => x.id === curRun); const se = findSeries('se-plates'); se.stage = 'bisque';
      openRunAttach(); document.getElementById('pla-all').checked = true; _renderPlanAdd(); togglePlanAdd('series:se-plates'); confirmPlanAdd();
      const units = r.plan.members.map(m => m.ref.unit), ev = se.events.filter(e => e.type === 'firing' && e.data.firingRunId === r.id);
      const m2 = r.plan.members[1]; rnRes(m2.id, 'Счупено');
      const sp = _seriesMembers('se-plates').find(p => (p.units || [])[0] === m2.ref.unit);
      return { units, ev: ev.length, evUnits: ev[0] && ev[0].data.units, split: sp && { stage: sp.stage, units: sp.units } }; });
    ok('barrel firing with units from a series: one member per free unit, one series step with those units', s.units.length >= 2 && s.ev === 1 && JSON.stringify(s.evUnits) === JSON.stringify(s.units), s);
    ok('a broken unit in the barrel firing is separated as broken (v1.40.2 kept)', s.split && s.split.stage === 'broken' && s.split.units.length === 1, s);

    // ── A3: нова стъпка „изпичане“ в изделие ──
    s = await E(() => { closeDet('det-run'); show('pieces'); openPieceDet('pp4'); openEventMo('firing'); const def = document.getElementById('ev-firing-run').value;
      const g = id => document.getElementById(id); g('ev-date').value = '2026-10-25'; g('ev-firing-method').value = 'sagar'; g('ev-firing-atmosphere').value = 'reduction'; g('ev-firing-purpose').value = 'alternative';
      g('ev-firing-wrapping').value = 'foil'; g('ev-firing-details').value = 'мед, сол'; g('ev-firing-result').value = 'розово-сиви петна'; const n0 = DB.firingRuns.length; saveEvent();
      const p = DB.pieces.find(x => x.id === 'pp4'), ev = p.events.filter(e => e.type === 'firing' && e.date === '2026-10-25')[0], r = DB.firingRuns.find(x => x.id === ev.data.firingRunId);
      return { def, runs: DB.firingRuns.length - n0, evData: ev.data, r: r && { method: r.method, state: r.state, end: r.endedAt, m: r.plan.members.map(m => [m.ref.id, m.wrap, m.prep, m.resultNote]) }, hist: [...document.querySelectorAll('#det-piece .pd-li')].map(x => x.innerText).join(' || ') }; });
    ok('A3 a new firing step offers „+ Ново изпичане“ by default', s.def === '__new', s);
    ok('A3 … it creates the firing; wrapping, details and result go to the unit, not twice into the step', s.runs === 1 && Object.keys(s.evData).join() === 'firingRunId' && s.r.method === 'sagar' && s.r.state === 'completed' && s.r.end === '2026-10-25' && JSON.stringify(s.r.m) === JSON.stringify([['pp4', 'foil', 'мед, сол', 'розово-сиви петна']]), s);
    ok('A3 … and the piece history shows that result', /розово-сиви/.test(s.hist), s.hist);
    s = await E(() => { const p = DB.pieces.find(x => x.id === 'pp4'), ev = p.events.find(e => e.type === 'firing' && e.date === '2026-10-25'); openEventMo('firing', ev.id);
      const vis = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null; }; const r = { own: vis('ev-firing-method'), pp: vis('ev-firing-result'), link: vis('ev-firing-linked') }; closeMo('mo-event'); return r; });
    ok('A3 the linked step in the piece: result fields hidden, „Отвори резултата“ instead', !s.own && !s.pp && s.link, s);

    // ── стари изпичания без план и стари самостоятелни стъпки ──
    s = await E(() => { closeDet('det-piece'); show('fp'); const b0 = JSON.stringify(DB); openRunDet('run-pit'); rnTab('res'); rnTab('load');
      const r = DB.firingRuns.find(x => x.id === 'run-pit'), rows = document.querySelectorAll('#drn-mres .rn-rrow').length, M = _rnMembers(r);
      const viewSame = b0 === JSON.stringify(DB);
      rnRes(M[0].id, 'Добре'); rnRes(M[0].id, 'Друго');
      const ev = DB.pieces.find(p => p.id === 'p-ocarina').events.find(e => e.data && e.data.firingRunId === 'run-pit');
      return { rows, synth: M.length, wrap: M[0].wrap, viewSame, planN: r.plan.members.length, res: r.plan.members[0].result, evWrap: ev.data.wrapping, evN: DB.pieces.find(p => p.id === 'p-ocarina').events.length }; });
    ok('old pit firing without a plan: its piece as a unit with the old wrapping, just looking writes nothing', s.rows === 1 && s.synth === 1 && s.wrap === 'foil' && s.viewSame, s);
    ok('… first result: the unit is written once, the old step keeps its data', s.planN === 1 && s.res === 'Друго' && s.evWrap === 'foil', s);
    s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-untyped'), ev = p.events.find(e => e.type === 'firing'); const before = JSON.stringify(ev);
      openPieceDet('p-untyped'); openEventMo('firing', ev.id); const sel = document.getElementById('ev-firing-run').value; saveEvent(); const after = JSON.stringify(p.events.find(e => e.id === ev.id));
      return { sel, same: before === after.replace(/,"updatedAt":"[^"]*"/, ''), runs: DB.firingRuns.length }; });
    ok('old standalone firing step: opens as standalone, saved unchanged, no firing created', s.sel === '' && s.same, s);

    // ── регресия: електрическо изпичане с план на пещта ──
    s = await E(() => { closeDet('det-piece'); show('fp'); openRunDet('run-bis'); rnTab('load');
      return { plan: getComputedStyle(document.getElementById('drn-plan-sec')).display, prep: document.getElementById('drn-prep').innerHTML, btn: document.getElementById('drn-plan-btn').textContent }; });
    ok('electric firing: kiln plan in „Зареждане“ as before, no preparation-by-unit block', s.plan !== 'none' && s.prep === '' && /план/.test(s.btn), s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // ── реалните архиви ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      a2.acceptConfirms = true;
      const r = await a2.eval(() => { document.getElementById('splash')?.remove(); show('fp'); const b0 = JSON.stringify(DB);
        DB.firingRuns.slice().forEach(x => { openRunDet(x.id); ['prep', 'load', 'res'].forEach(rnTab); });
        const view = b0 === JSON.stringify(DB);
        const pit = DB.firingRuns.find(x => x.method === 'pit'); if (!pit) return { view };
        openRunDet(pit.id); rnTab('res'); const M = _rnMembers(pit);
        const notes = M.filter(m => m.resultNote || m.prep || m.wrap).length;
        const evB = JSON.stringify(DB.pieces.map(p => p.events));
        rnRes(M[0].id, 'Добре');
        const evA = JSON.stringify(DB.pieces.map(p => p.events));
        const others = JSON.stringify(DB.firingRuns.filter(x => x.id !== pit.id)) === JSON.stringify(JSON.parse(b0).firingRuns.filter(x => x.id !== pit.id));
        closeDet('det-run'); show('pieces');
        const pc = DB.pieces.find(p => p.events.some(e => e.data && e.data.firingRunId === pit.id && e.data.result));
        let hist = ''; if (pc) { openPieceDet(pc.id); hist = [...document.querySelectorAll('#det-piece .pd-li')].map(x => x.innerText).join(' | '); }
        return { view, n: M.length, notes, plan: pit.plan.members.length, evSame: evB === evA, others, hist: hist.slice(0, 200) }; });
      console.log('  ' + f + ':');
      ok('  viewing every firing and tab writes nothing', r.view, r);
      if (r.n != null) {
        ok('  old pit firing: ' + r.n + ' attached pieces as units, ' + r.notes + ' with their old notes; first result writes the units once, steps untouched, other firings untouched', r.n >= 1 && r.plan === r.n && r.evSame && r.others && r.notes >= 1, r);
        ok('  piece history shows the old result text from the firing', !r.hist || /Преливане|Опушен|„/.test(r.hist), r.hist);
      }
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
