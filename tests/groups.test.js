// v1.44.0 — разделяне на вече отделена група по точни физически номера: история,
// изпичания и резултати по номер, архив, добив, отказ без промяна, всичко-или-нищо.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

const MK = () => {
  window.mkSe = (id, n, stage, name) => { DB.series = DB.series || []; DB.series.push({ id, name: name || 'Серия', code: 'GL-2026-8' + String(DB.series.length).padStart(2, '0'), type: 'висулка', clay: 'mat-toffee', count: n, nextUnitNo: n + 1, retiredUnits: [], stage, date: '2026-10-01', events: [{ id: id + '-e1', type: 'stage', date: '2026-10-01', note: '', photos: [], data: { stageValue: stage } }], createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z' }); save(); return findSeries(id); };
  window.mkRun = (id, purpose, date) => { DB.firingRuns.push({ id, name: 'Изпичане ' + id, date: date || '2026-10-20', method: 'electric', purpose, state: 'planned', createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z' }); save(); return DB.firingRuns.find(r => r.id === id); };
  // група от номерата nos (точно отделяне, „една група“)
  window.mkGrp = (sid, nos, name) => { curSeries = sid; openSplitMo(nos); document.getElementById('sp-mode').value = 'group'; document.getElementById('sp-name').value = name; spUnitsChange(); saveSplit(); return _seriesMembers(sid).find(m => m.name === name); };
  window.byU = (sid, u) => _seriesMembers(sid).find(m => (m.units || []).map(Number).indexOf(u) >= 0);
  window.allU = sid => _seriesMembers(sid).reduce((a, m) => a.concat((m.units || []).map(Number)), []).sort((a, b) => a - b);
  window.pick = (sid, nos) => { openSeriesDet(sid); _seSel.u = nos.slice(); _seRedraw(); };
  window.divide = (sid, nos, mode) => { pick(sid, nos); openUnitsMo('divide'); document.getElementById('un-mode').value = mode || 'each'; _unPreview(); const prev = document.getElementById('un-prev').innerText, dis = document.getElementById('un-ok').disabled; saveUnits(); const open = document.getElementById('mo-units').classList.contains('on'); if (open) closeMo('mo-units'); return { prev, dis, open }; };
  // план → заредено → приключено, по реалния път на плана
  window.fire = (rid, sid, nos, endDate) => { const r = DB.firingRuns.find(x => x.id === rid); pick(sid, nos); seUnitsToPlan(); pdAddToPlan(rid); r.state = 'loaded'; r.loadedAt = r.date; _runSync(r); r.state = 'completed'; r.endedAt = endDate || r.date; _runSync(r); save(); return r; };
  window.pm = (rid, pid) => (DB.firingRuns.find(r => r.id === rid).plan || { members: [] }).members.filter(m => m.ref && m.ref.id === pid).map(m => Number(m.ref.unit) + (m.result ? ':' + m.result : '')).sort();
  window.runQty = rid => _runPieces(rid).filter(x => !x.isSeries).reduce((n, x) => n + _runRowQty(x), 0);
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('groups:');
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const P = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      if (!(await app.eval(() => typeof _grpSplit === 'function'))) { console.log('  - not in this version'); await app.close(); break; }
      await app.page.setViewportSize(vp);
      const E = (f, a) => app.eval(f, a);
      await E(() => document.getElementById('splash')?.remove());
      await E(MK);
      app.acceptConfirms = true;
      let s;

      // ── 1. /1–15 → /7 и /12 ──
      s = await E(() => { const se = mkSe('se-p', 40, 'bisque', 'Висулки'); const g = mkGrp('se-p', Array.from({ length: 15 }, (_, i) => i + 1), 'Синя'); const ev0 = JSON.stringify(g.events), next0 = se.nextUnitNo;
        pick('se-p', [7]); const one = _seSel.u.join(), grid = [...document.querySelectorAll('#dse-secs .pd-unit')].filter(b => b.querySelector('.g')).length, grp = document.querySelector('.se-grp').innerText, btn = !!document.getElementById('se-a-divide');
        const r = divide('se-p', [7, 12], 'each'); const g2 = _seriesMembers('se-p').find(m => m.id === g.id);
        return { one, grid, grp, btn, r, g: g2.units.join(), q: g2.qty, ev: JSON.stringify(g2.events) === ev0, n7: byU('se-p', 7), n12: byU('se-p', 12), all: allU('se-p'), next: se.nextUnitNo === next0, cnt: se.count, free: _seriesFreeUnits(se, _seriesMembers('se-p')).length }; });
      ok(`${P} picking /7 marks only /7; the chip and the bar say which group it belongs to; „Раздели групата“ is offered`, s.one === '7' && s.grid === 15 && /\/7 от „Синя“ \/1–15/.test(s.grp) && /Цялата група/.test(s.grp) && s.btn, s);
      ok(`${P} preview: which numbers leave, which stay (13), what is inherited`, /\/7, 12 — 2 нови записа/.test(s.r.prev) && /остават \/1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15 \(13 бр\.\)/.test(s.r.prev) && /Наследява се/.test(s.r.prev) && !s.r.dis, s.r);
      ok(`${P} /1–15 → /7 and /12 on their own; the group keeps 13 and its history unchanged`, s.g === '1,2,3,4,5,6,8,9,10,11,13,14,15' && s.q === 13 && s.ev && s.n7.units.join() === '7' && s.n12.units.join() === '12' && s.n7.id !== s.n12.id, s);
      ok(`${P} no renumbering, no duplicates: 15 numbers across the records, the rest free, count and next number unchanged`, s.all.join() === Array.from({ length: 15 }, (_, i) => i + 1).join() && s.next && s.cnt === 40 && s.free === 25, s);
      s = await E(() => { const n = byU('se-p', 7), g = byU('se-p', 1); return { inh: ['clay', 'type', 'seriesId', 'stage'].every(k => n[k] === g[k]), photos: (n.photos || []).length === (g.photos || []).length, from: n.splitFrom && n.splitFrom.piece === g.id && n.splitFrom.units.join() === '7', copies: (n.events || []).every(e => e.copiedFrom && e.copiedFrom.piece === g.id), nev: (n.events || []).length, gev: (g.events || []).length, tl: getTimelineEvents(n).events.length === getTimelineEvents(g).events.length, name: n.name }; });
      ok(`${P} the new /7 inherits fields, photos and steps (marked as copies from the group), traceable to the group`, s.inh && s.photos && s.from && s.copies && s.nev === s.gev && s.tl && /\/7$/.test(s.name), s);

      // ── 2. една, няколко непоследователни като една група, цялата група на отделни ──
      s = await E(() => { const g = mkGrp('se-p', [16, 17, 18, 19, 20, 21, 22, 23, 24], 'Зелена'); divide('se-p', [18]); const a = byU('se-p', 18).units.join();
        divide('se-p', [16, 20, 23], 'group'); const b = byU('se-p', 20); const g2 = _seriesMembers('se-p').find(m => m.id === g.id);
        const h = mkGrp('se-p', [25, 26, 27, 28], 'Бяла'); divide('se-p', [25, 26, 27, 28], 'each'); const hs = [25, 26, 27, 28].map(u => byU('se-p', u)), h2 = _seriesMembers('se-p').find(m => m.id === h.id);
        return { a, b: b.units.join(), bq: b.qty, g: g2.units.join(), hs: hs.map(x => x.units.join()), hsame: hs[0].id === h.id, hid: new Set(hs.map(x => x.id)).size, all: allU('se-p').length }; });
      ok(`${P} one unit (/18); non-consecutive /16, 20, 23 as one new group; the group keeps /17, 19, 21, 22, 24`, s.a === '18' && s.b === '16,20,23' && s.bq === 3 && s.g === '17,19,21,22,24', s);
      ok(`${P} a whole group into single records: the old record keeps /25, three new — four records, no duplicates`, s.hs.join('|') === '25|26|27|28' && s.hsame && s.hid === 4 && s.all === 28, s);

      // ── 3–5. изпичания: бисквитно, глазурно с различни резултати, две изпичания ──
      s = await E(() => { const se = mkSe('se-f', 10, 'bone-dry', 'Купички'); const g = mkGrp('se-f', [1, 2, 3, 4, 5, 6], 'Купички група'); mkRun('rb', 'bisque', '2026-10-10');
        fire('rb', 'se-f', [1, 2, 3, 4, 5, 6], '2026-10-11'); const q0 = runQty('rb'), st0 = byU('se-f', 1).stage;
        const r = divide('se-f', [2]); const n = byU('se-f', 2), g2 = byU('se-f', 1);
        const rb = DB.firingRuns.find(x => x.id === 'rb'); _runSync(rb); const nAfter = (byU('se-f', 2).events || []).filter(e => e.data && e.data.firingRunId === 'rb').length, gAfter = (g2.events || []).filter(e => e.data && e.data.firingRunId === 'rb').length;
        return { q0, q1: runQty('rb'), st0, nst: n.stage, prev: r.prev, pmN: pm('rb', n.id), pmG: pm('rb', g.id), nAfter, gAfter, state: _runState(rb) }; });
      ok(`${P} after a bisque firing: /2 keeps the firing step and its plan entry (by number); the firing still counts 6`, s.q0 === 6 && s.q1 === 6 && s.pmN.join() === '2' && s.pmG.join() === '1,3,4,5,6' && s.nst === s.st0 && /Изпичане „Изпичане rb“/.test(s.prev) && /\/2 остават в него с номера/.test(s.prev), s);
      ok(`${P} re-syncing that firing later neither drops nor duplicates the step; the firing stays completed`, s.nAfter === 1 && s.gAfter === 1 && s.state === 'completed', s);
      s = await E(() => { mkRun('rg', 'glaze', '2026-10-20'); const r = fire('rg', 'se-f', [1, 3, 4, 5, 6], '2026-10-21'); const g = byU('se-f', 1);
        r.plan.members.forEach(m => { if (m.ref.id === g.id) m.result = Number(m.ref.unit) === 4 ? 'Счупено' : 'Добре'; }); save();
        const before = _rnResFor(r, g); const st = g.stage; const pv = divide('se-f', [4]).prev; const n = byU('se-f', 4), g2 = byU('se-f', 1);
        return { before, pv, n4: pm('rg', n.id), g: pm('rg', g2.id), resN: _rnResFor(r, n), resG: _rnResFor(r, g2), nst: n.stage, st, q: runQty('rg'), bis: pm('rb', g2.id), evN: (n.events || []).filter(e => e.type === 'firing').map(e => e.data.firingRunId).sort().join() }; });
      ok(`${P} glaze firing with different results: /4 keeps „Счупено“ under its number; the group keeps 4 × „Добре“`, s.n4.join() === '4:Счупено' && s.g.join() === '1:Добре,3:Добре,5:Добре,6:Добре' && /Счупено/.test(s.resN) && !/Счупено/.test(s.resG) && /резултата си/.test(s.pv), s);
      ok(`${P} no invented individual outcome (the stage stays as recorded); no double counting (glaze 5, bisque entries intact)`, s.nst === s.st && s.q === 5 && s.bis.join() === '1,3,5,6', s);
      ok(`${P} a group from two firings: the new /4 carries both firing steps`, s.evN === 'rb,rg', s);

      // ── 6–7. счупване и архив само на избраните; възстановяване ──
      s = await E(() => { const g = byU('se-p', 1); pick('se-p', [8, 9]); openUnitsMo('broken'); document.getElementById('un-arch').checked = true; _unPreview(); const pv = document.getElementById('un-prev').innerText; saveUnits();
        const a = byU('se-p', 8), b = byU('se-p', 9), g2 = byU('se-p', 1); return { pv, a: [a.units.join(), a.stage, !!a.archivedAt], b: [b.units.join(), b.stage, !!b.archivedAt], g: [g2.units.join(), g2.stage, !!g2.archivedAt], same: g2.id === g.id }; });
      ok(`${P} „Счупено“ on /8, /9 from the group: split as part of the action, broken and archived — the rest untouched`, /Разделяне на „Синя“/.test(s.pv) && s.a.join() === '8,broken,true' && s.b.join() === '9,broken,true' && s.g.join() === '1,2,3,4,5,6,10,11,13,14,15,bisque,false' && s.same, s);
      s = await E(() => { pick('se-p', [9]); seUnitsRestore(); return [byU('se-p', 8).archivedAt ? 1 : 0, byU('se-p', 9).archivedAt ? 1 : 0, byU('se-p', 9).stage]; });
      ok(`${P} restore /9 only — still broken, still /9; /8 stays archived`, s.join() === '1,0,broken', s);
      s = await E(() => { const y = _seriesYield(findSeries('se-p')); return { total: y.total, alive: y.alive, br: (y.parts.find(x => x.stage === 'broken') || {}).count, all: allU('se-p').length }; });
      ok(`${P} yield after the split and the breaks: 40 total, 2 broken, 38 in process; numbers intact`, s.total === 40 && s.br === 2 && s.alive === 38 && s.all === 28, s);

      // ── 8. отделена бройка от резултат в изпичане: само тя ──
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rg'); const g = byU('se-f', 1); const m = r.plan.members.find(x => x.ref.id === g.id && Number(x.ref.unit) === 5);
        openRunDet('rg'); rnRes(m.id, 'Счупено'); const n = byU('se-f', 5), g2 = byU('se-f', 1); closeDet('det-run');
        return { n: [n.units.join(), n.stage], g: [g2.units.join(), g2.stage], ref: m.ref.id === n.id, res: m.result }; });
      ok(`${P} „Счупено“ as a firing result for /5 of a group: only /5 is split and broken; the plan entry follows it`, s.n.join() === '5,broken' && s.g[0] === '1,3,6' && s.g[1] !== 'broken' && s.ref && s.res === 'Счупено', s);

      // ── 9. повторно разделяне, двусмислен план, всичко-или-нищо ──
      s = await E(() => { pick('se-p', [7]); const btn = !!document.getElementById('se-a-divide'); const n0 = DB.pieces.length; openUnitsMo('divide'); const open = document.getElementById('mo-units').classList.contains('on'); if (open) closeMo('mo-units'); return { btn, open, same: DB.pieces.length === n0 }; });
      ok(`${P} a number already on its own cannot be split again (no button, refused)`, !s.btn && !s.open && s.same, s);
      s = await E(() => { const g = byU('se-p', 1); const r = mkRun('rx', 'glaze', '2026-11-20'); r.plan = { members: [{ id: 'old1', ref: { kind: 'piece', id: g.id }, name: g.name }] }; save(); const b0 = JSON.stringify(DB);
        const x = divide('se-p', [3]); const same = JSON.stringify(DB) === b0; DB.firingRuns = DB.firingRuns.filter(r => r.id !== 'rx'); save(); return { x, same }; });
      ok(`${P} a firing that holds the group without numbers → stopped with a clear reason, nothing changed`, s.x.dis && /Не може/.test(s.x.prev) && /без номера на бройките/.test(s.x.prev) && s.same, s);
      s = await E(() => { const b0 = JSON.stringify({ p: DB.pieces, s: DB.series, r: DB.firingRuns }); const orig = window.recomputePieceStage; window.recomputePieceStage = () => { throw new Error('boom'); };
        let x; try { x = divide('se-p', [10]); } finally { window.recomputePieceStage = orig; } return { same: JSON.stringify({ p: DB.pieces, s: DB.series, r: DB.firingRuns }) === b0, open: x.open }; });
      ok(`${P} atomic: an error in the middle leaves everything exactly as before`, s.same, s);
      // телефон: без хоризонтално превъртане; лентата се вижда
      s = await E(() => { pick('se-p', [3, 11]); const d = document.getElementById('det-series'); return { over: d.scrollWidth > d.clientWidth + 1, act: document.querySelector('.se-act').getBoundingClientRect().height > 0 }; });
      ok(`${P} 40 units with groups: no horizontal scroll, the action bar visible`, !s.over && s.act, s);
      ok(`${P} no page errors`, !app.log.errors.length, app.log.errors);
      await app.page.waitForTimeout(400); await app.reload(); await E(MK);
      s = await E(() => ({ all: allU('se-p').length, g: byU('se-p', 1).units.join(), n7: byU('se-p', 7).units.join() }));
      ok(`${P} after reopening: the same records and numbers`, s.all === 28 && s.g === '1,2,3,4,5,6,10,11,13,14,15' && s.n7 === '7', s);
      await app.close();
    }
    // ── реалните архиви: серии с отделени и изпечени парчета ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      console.log('  ' + f + ':');
      a2.acceptConfirms = true;
      const s = await a2.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB); const out = [];
        (DB.series || []).forEach(se => { openSeriesDet(se.id); (_seriesMembers(se.id)).forEach(m => { if ((m.units || []).length > 1) { _seSel.u = [Number(m.units[0])]; _seRedraw(); openUnitsMo('divide'); out.push([se.name, m.name, document.getElementById('un-ok').disabled]); closeMo('mo-units'); } }); });
        const same = b0 === JSON.stringify(DB);
        // разделяне на всяка група с номера — бройките и изпичанията се пазят
        const qty = {}; DB.firingRuns.forEach(r => { qty[r.id] = _runPieces(r.id).reduce((n, x) => n + _runRowQty(x), 0); });
        const units = JSON.stringify((DB.series || []).map(se => [se.id, _seriesMembers(se.id).reduce((a, m) => a.concat((m.units || []).map(Number)), []).sort((a, b) => a - b), _seriesFreeUnits(se, _seriesMembers(se.id))]));
        let done = 0, made = 0;
        // реалните архиви още нямат групи — правят се от свободните номера на всяка серия (точно отделяне)
        (DB.series || []).forEach(se => { const fr = _seriesFreeUnits(se, _seriesMembers(se.id)); if (fr.length >= 2) { curSeries = se.id; openSplitMo(fr); document.getElementById('sp-mode').value = 'group'; document.getElementById('sp-name').value = 'Тест група'; spUnitsChange(); saveSplit(); made++; } });
        const unitsMid = JSON.stringify((DB.series || []).map(se => [se.id, _seriesMembers(se.id).reduce((a, m) => a.concat((m.units || []).map(Number)), []).sort((a, b) => a - b).length + _seriesFreeUnits(se, _seriesMembers(se.id)).length]));
        (DB.series || []).forEach(se => _seriesMembers(se.id).slice().forEach(m => { if ((m.units || []).length > 1 && !_grpCheck(m, [Number(m.units[1])])) { curSeries = se.id; _seSel = { sid: se.id, u: [Number(m.units[1])] }; openUnitsMo('divide'); saveUnits(); done++; } }));
        const qty2 = {}; DB.firingRuns.forEach(r => { qty2[r.id] = _runPieces(r.id).reduce((n, x) => n + _runRowQty(x), 0); });
        const units2 = JSON.stringify((DB.series || []).map(se => [se.id, _seriesMembers(se.id).reduce((a, m) => a.concat((m.units || []).map(Number)), []).sort((a, b) => a - b), _seriesFreeUnits(se, _seriesMembers(se.id))]));
        const unitsN = JSON.stringify((DB.series || []).map(se => [se.id, _seriesMembers(se.id).reduce((a, m) => a.concat((m.units || []).map(Number)), []).sort((a, b) => a - b).length + _seriesFreeUnits(se, _seriesMembers(se.id)).length]));
        const tot = JSON.stringify((DB.series || []).map(se => [se.id, _seriesTotal(se)]));
        return { out, same, done, made, qty: JSON.stringify(qty) === JSON.stringify(qty2), units: unitsMid === unitsN && tot === JSON.stringify((DB.series || []).map(se => [se.id, _seriesTotal(se)])), dup: (DB.series || []).every(se => { const a = _seriesMembers(se.id).reduce((x, m) => x.concat((m.units || []).map(Number)), []); return a.length === new Set(a).size; }) }; });
      ok('  looking at every group and opening the split preview writes nothing', s.same, s);
      ok('  groups made from free numbers (' + s.made + '), then one unit split off each (' + s.done + '): every number exactly once, totals and firing quantities unchanged', s.done === s.made && s.made > 0 && s.qty && s.units && s.dup, s);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
