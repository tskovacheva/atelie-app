// v1.43.0 — физическите бройки в серия: избор по номер, отделяне на точни номера,
// групови действия (етап, счупено, архив, изпичане), обобщение и добив.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

// в страницата: нова серия и ново изпичане
const MK = () => {
  window.mkSe = (id, n, stage, name) => { DB.series = DB.series || []; DB.series.push({ id, name: name || 'Серия', code: 'GL-2026-9' + String(DB.series.length).padStart(2, '0'), type: 'чиния', count: n, nextUnitNo: n + 1, retiredUnits: [], stage, date: '2026-10-01', events: [{ id: id + '-e1', type: 'stage', date: '2026-10-01', note: '', photos: [], data: { stageValue: stage } }], createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z' }); save(); return findSeries(id); };
  window.mkRun = (id, purpose) => { DB.firingRuns.push({ id, name: 'Изпичане ' + id, date: '2026-11-10', method: 'electric', purpose, state: 'planned', createdAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T10:00:00Z' }); save(); return DB.firingRuns.find(r => r.id === id); };
  window.mem = sid => _seriesMembers(sid).map(m => ({ id: m.id, u: (m.units || []).map(Number), st: m.stage, a: !!m.archivedAt, n: m.name, ev: (m.events || []).length }));
  window.planU = (rid, sid) => (DB.firingRuns.find(r => r.id === rid).plan || { members: [] }).members.filter(m => m.ref && m.ref.id === sid).map(m => m.ref.unit).sort((a, b) => a - b);
  window.grid = () => [...document.querySelectorAll('#dse-secs .pd-unit')].map(b => b.dataset.u + ':' + b.dataset.st + (b.classList.contains('sel') ? '*' : ''));
  window.openUnitsSec = () => { _pdOpen.series.units = true; };
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('units:');
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const P = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      if (!(await app.eval(() => typeof seUnitTap === 'function'))) { console.log('  - not in this version'); await app.close(); break; }
      await app.page.setViewportSize(vp);
      const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 200);
      await E(() => document.getElementById('splash')?.remove());
      await E(MK);
      app.acceptConfirms = true;
      let s;

      // ── 1. две чинии, /2 се чупи след планиране, преди зареждане ──
      s = await E(() => { mkSe('se-two', 2, 'bisque', 'Две чинии'); mkRun('run-g', 'glaze'); openUnitsSec(); show('pieces'); openSeriesDet('se-two');
        seUnitTap(1); seUnitTap(2); seUnitsToPlan(); pdAddToPlan('run-g'); return { plan: planU('run-g', 'se-two'), g: grid(), ev: JSON.stringify(findSeries('se-two').events) }; });
      ok(`${P} 2 plates: both planned by number (/1, /2), the grid shows „в план“`, s.plan.join() === '1,2' && s.g.join() === '1:planned,2:planned', s);
      const ev0 = s.ev;
      s = await E(() => { seUnitTap(2); openUnitsMo('broken'); const cb = document.getElementById('un-rm-run-g'), st = document.getElementById('un-stage').value, prev = document.getElementById('un-prev').innerText;
        document.getElementById('un-date').value = '2026-11-09'; document.getElementById('un-note').value = 'пукна при зареждане'; document.getElementById('un-arch').checked = true; _unPreview();
        const prev2 = document.getElementById('un-prev').innerText; saveUnits();
        const se = findSeries('se-two'); return { cb: !!cb && cb.checked, st, prev, prev2, m: mem('se-two'), plan: planU('run-g', 'se-two'), cnt: se.count, next: se.nextUnitNo, free: _seriesFreeUnits(se, _seriesMembers('se-two')), ev: JSON.stringify(se.events), g: grid(), state: _runState(DB.firingRuns.find(r => r.id === 'run-g')),
          e: (_seriesMembers('se-two')[0].events || []).map(e => [e.type, e.date, e.note, e.data && e.data.stageValue]) }; });
      ok(`${P} 2 plates: /2 → „Счупено“ — preview offers removal from the not-yet-loaded plan`, s.cb && s.st === 'broken' && /\/2 се отделя/.test(s.prev) && /Извади \/2 от плана/.test(s.prev) && /архивират/.test(s.prev2), s);
      ok(`${P} 2 plates: /2 is its own record — broken (dated step with the note), archived; /1 stays undivided and planned`, s.m.length === 1 && s.m[0].u.join() === '2' && s.m[0].st === 'broken' && s.m[0].a && s.e.some(x => x[0] === 'stage' && x[1] === '2026-11-09' && x[2] === 'пукна при зареждане' && x[3] === 'broken') && s.free.join() === '1' && s.plan.join() === '1', s);
      ok(`${P} 2 plates: no renumbering, series history and the firing state untouched`, s.cnt === 2 && s.next === 3 && s.ev === ev0 && s.state === 'planned' && s.g.join() === '1:planned,2:arch', s);
      s = await E(() => { const y = _seriesYield(findSeries('se-two')); const t = document.querySelector('#dse-secs .pd-sec[data-k="units"]').innerText; return { y, t }; });
      ok(`${P} 2 plates: yield — 1 broken of 2, 1 still in process; summary without double counting`, s.y && s.y.total === 2 && s.y.alive === 1 && s.y.parts.some(x => x.stage === 'broken' && x.count === 1) && /Общо\s*2 бр\./.test(s.t) && /Отделени\s*1 бр\./.test(s.t) && /Неотделени\s*1 бр\./.test(s.t) && /1\s*в процес/.test(s.t) && /1\s*счупени/.test(s.t) && /1\s*архивирани/.test(s.t), s);
      // възстановяване
      s = await E(() => { seUnitTap(2); const b = !!document.getElementById('se-a-restore'); seUnitsRestore(); return { b, m: mem('se-two'), g: grid() }; });
      ok(`${P} restore: the archived /2 is back in the series, still broken and still /2`, s.b && s.m.length === 1 && !s.m[0].a && s.m[0].st === 'broken' && s.m[0].u.join() === '2' && s.g.join() === '1:planned,2:broken', s);

      // ── 2. заредено изпичане: не се пипа ──
      s = await E(() => { mkSe('se-three', 3, 'bisque', 'Три купи'); mkRun('run-l', 'glaze'); openSeriesDet('se-three'); sePickFree(); seUnitsToPlan(); pdAddToPlan('run-l');
        const r = DB.firingRuns.find(x => x.id === 'run-l'); r.state = 'loaded'; r.loadedAt = '2026-11-10'; save(); openSeriesDet('se-three'); const g0 = grid();
        seUnitTap(3); openUnitsMo('broken'); const cb = document.getElementById('un-rm-run-l'), warn = document.getElementById('un-prev').innerText; saveUnits();
        return { g0, cb: !!cb, warn, plan: planU('run-l', 'se-three'), st: _runState(r), m: mem('se-three') }; });
      ok(`${P} loaded firing: no silent removal — a notice instead; the firing keeps all three`, s.g0.join() === '1:loaded,2:loaded,3:loaded' && !s.cb && /зареденото изпичане/.test(s.warn) && /не се променя/.test(s.warn) && s.plan.join() === '1,2,3' && s.st === 'loaded', s);
      ok(`${P} loaded firing: /3 is marked broken as its own record anyway`, s.m.length === 1 && s.m[0].u.join() === '3' && s.m[0].st === 'broken', s.m);

      // ── 3. /7 от 20 неотделени; непоследователни; без двойно отделяне ──
      s = await E(() => { mkSe('se-20', 20, 'bone-dry', 'Чашки'); openSeriesDet('se-20'); seUnitTap(7); openSplitMo(_seSel.u);
        const v = document.getElementById('sp-units').value, c = document.getElementById('sp-count').value; document.getElementById('sp-name').value = 'Седма'; saveSplit();
        const se = findSeries('se-20'); return { v, c, m: mem('se-20'), free: _seriesFreeUnits(se, _seriesMembers('se-20')) }; });
      ok(`${P} split /7 out of 20: exactly /7 — /1 stays undivided`, s.v === '7' && s.c === '1' && s.m.length === 1 && s.m[0].u.join() === '7' && s.free.length === 19 && s.free[0] === 1 && s.free.indexOf(7) < 0, s);
      s = await E(() => { const el = document.getElementById('se-pick-in'); el.value = '3, 9, 14-15'; sePickRange(); const sel = _seSel.u.slice(); openSplitMo(_seSel.u); const v = document.getElementById('sp-units').value;
        document.getElementById('sp-mode').value = 'each'; spUnitsChange(); saveSplit(); return { sel, v, m: mem('se-20').map(x => x.u.join()).sort() }; });
      ok(`${P} non-consecutive /3, 9, 14, 15 — picked by typing; split as separate records`, s.sel.join() === '3,9,14,15' && /3, 9, 14, 15|3, 9, 14–15/.test(s.v) && s.m.join('|') === ['14', '15', '3', '7', '9'].join('|'), s);
      s = await E(() => { openSplitMo([7, 9]); const v = document.getElementById('sp-units').value; document.getElementById('sp-units').value = '9'; spUnitsChange(); saveSplit(); const open = document.getElementById('mo-split').classList.contains('on'); closeMo('mo-split'); return { v, open, n: mem('se-20').length }; });
      ok(`${P} an already split number is never split again (not offered, refused when typed)`, s.v === '' && s.open && s.n === 5, s);
      s = await E(() => { openSplitMo([]); document.getElementById('sp-count').value = 2; document.getElementById('sp-name').value = 'Две'; saveSplit(); return mem('se-20').find(x => x.n === 'Две'); });
      ok(`${P} quick split of N (no numbers) still takes the lowest free`, s && s.u.join() === '1,2', s);

      // ── 4. 40 висулки: 15 + 12 с глазури, 8 неглазирани, 5 счупени ──
      s = await E(() => { mkSe('se-40', 40, 'bisque', 'Висулки'); openSeriesDet('se-40'); const many = document.querySelector('#dse-secs .pd-units').classList.contains('many');
        const pick = t => { _seSel.u = []; document.getElementById('se-pick-in').value = t; sePickRange(); };
        pick('1-15'); openUnitsMo('stage'); document.getElementById('un-stage').value = 'glazed'; document.getElementById('un-mode').value = 'group'; _unPreview(); document.getElementById('un-name').value = 'Висулки — синя'; saveUnits();
        pick('16-27'); openUnitsMo('stage'); document.getElementById('un-stage').value = 'glazed'; document.getElementById('un-mode').value = 'group'; _unPreview(); document.getElementById('un-name').value = 'Висулки — зелена'; saveUnits();
        pick('36-40'); openUnitsMo('broken'); saveUnits();
        const se = findSeries('se-40'), y = _seriesYield(se), t = document.querySelector('#dse-secs .pd-sec[data-k="units"]').innerText;
        return { many, m: mem('se-40'), y, t, free: _seriesFreeUnits(se, _seriesMembers('se-40')).length, recs: DB.pieces.filter(p => p.seriesId === 'se-40').length }; });
      ok(`${P} 40 pendants: two glazed groups (one record each), 5 broken (one each), 8 left undivided — 7 records, not 40`, s.many && s.recs === 7 && s.free === 8 && s.m.filter(x => x.st === 'glazed').map(x => x.u.length).sort().join() === '12,15' && s.m.filter(x => x.st === 'broken').length === 5, s);
      ok(`${P} 40 pendants: yield — 35 in process, 5 broken, loss 13 %`, s.y.total === 40 && s.y.alive === 35 && s.y.parts.find(x => x.stage === 'broken').count === 5 && /Загуба 13%/.test(s.t) && /35\s*в процес/.test(s.t) && /5\s*счупени/.test(s.t), s);
      s = await E(() => { _seSel.u = []; seUnitTap(3); const one = _seSel.u.length, g = DB.pieces.find(p => p.seriesId === 'se-40' && (p.units || []).length === 15); sePickGroup(g.id); return [one, _seSel.u.length]; });
      ok(`${P} v1.44: tapping /3 of the 15-piece group selects just /3; „Цялата група“ selects all 15`, s[0] === 1 && s[1] === 15, s);
      s = await E(() => { _seSel.u = []; document.getElementById('se-pick-in').value = '36-40'; sePickRange(); openUnitsMo('archive'); const st = document.getElementById('un-stage').value, dis = document.getElementById('un-arch').disabled; saveUnits();
        const se = findSeries('se-40'), y = _seriesYield(se), t = document.querySelector('#dse-secs .pd-sec[data-k="units"]').innerText; return { st, dis, a: mem('se-40').filter(x => x.a).length, y, t, g: grid().filter(x => /:arch/.test(x)).length }; });
      ok(`${P} group archive of /36–40: only those, stage unchanged; still counted as broken, shown in the series`, s.st === '' && s.dis && s.a === 5 && s.y.parts.find(x => x.stage === 'broken').count === 5 && s.y.alive === 35 && /5\s*архивирани/.test(s.t) && s.g === 5, s);
      s = await E(() => { _seSel.u = []; seUnitTap(36); seUnitsRestore(); return mem('se-40').filter(x => x.a).map(x => x.u.join()).sort(); });
      ok(`${P} restore one (/36) — the other four stay archived`, s.join() === '37,38,39,40', s);
      s = await E(() => { _seSel.u = []; document.getElementById('se-pick-in').value = '28, 41, 99'; sePickRange(); return _seSel.u; });
      ok(`${P} unknown numbers are reported, the valid ones picked`, s.join() === '28', s);
      // телефон: компактно, без хоризонтално превъртане; лентата с действия се вижда
      s = await E(() => { const d = document.getElementById('det-series'), b = document.querySelector('#dse-secs .pd-unit').getBoundingClientRect(), act = document.querySelector('.se-act');
        return { over: d.scrollWidth > d.clientWidth + 1, h: Math.round(b.height), w: Math.round(b.width), act: !!act && act.getBoundingClientRect().height > 0, rows: Math.ceil(40 / Math.max(1, Math.floor(document.querySelector('#dse-secs .pd-units').clientWidth / (b.width + 6)))) }; });
      ok(`${P} 40 units fit without horizontal scroll; chips stay tappable (≥ 40 px); the action bar is visible`, !s.over && s.h >= 40 && s.w >= 44 && s.act, s);

      // ── 5. вече отделени и изпечени бройки (фикстурата) ──
      s = await E(() => { const se = findSeries('se-plates'); const ev = JSON.stringify(se.events), m0 = mem('se-plates'); openSeriesDet('se-plates'); const g = grid();
        const y = m0.find(x => x.u.length > 1); _seSel.u = []; sePickGroup(y.id); openUnitsMo('stage'); document.getElementById('un-stage').value = 'finished'; _unPreview(); saveUnits();
        const m1 = mem('se-plates'); return { g, ev0: ev, ev1: JSON.stringify(findSeries('se-plates').events), y: m1.find(x => x.id === y.id), others: JSON.stringify(m0.filter(x => x.id !== y.id)) === JSON.stringify(m1.filter(x => x.id !== y.id)), n: m1.length === m0.length }; });
      ok(`${P} fired series with split pieces: a whole split piece gets the step; no new record; the others and the series history untouched`, s.y.st === 'finished' && s.others && s.n && s.ev0 === s.ev1, s);
      // изпичанията от фикстурата — същото състояние
      s = await E(() => DB.firingRuns.filter(r => /^run-(bis|gl|pit)$/.test(r.id)).map(r => r.id + ':' + _runState(r)).join());
      ok(`${P} planned/loaded/completed firings keep their state`, /run-bis:completed/.test(s) && /run-gl:completed/.test(s), s);
      // навигация: „Отвори“ отваря парчето; назад — пак серията
      s = await E(() => { openSeriesDet('se-two'); _seSel.u = []; seUnitTap(2); document.getElementById('se-a-open').click(); const a = curPiece && document.getElementById('det-piece').classList.contains('on'); closeDet('det-piece'); return { a, back: curSeries === 'se-two' && document.getElementById('det-series').classList.contains('on') }; });
      ok(`${P} a split unit opens its own record; back returns to the series`, s.a && s.back, s);
      // защита на незапазени промени в прегледа
      app.acceptConfirms = false;
      s = await E(() => { _seSel.u = []; seUnitTap(1); openUnitsMo('stage'); document.getElementById('un-note').value = 'x'; closeMoAsk('mo-units'); const open = document.getElementById('mo-units').classList.contains('on'); closeMo('mo-units'); return { open, m: mem('se-two').length }; });
      ok(`${P} the unsaved-changes guard covers the units dialog; cancel changes nothing`, s.open && s.m === 1, s);
      ok(`${P} no page errors`, !app.log.errors.length, app.log.errors);
      // запис и повторно отваряне — същото
      await W(400); await app.reload(); await E(MK);
      s = await E(() => ({ two: mem('se-two').map(x => x.u.join() + ':' + x.st).join(), forty: mem('se-40').length, n: _seriesFreeUnits(findSeries('se-40'), _seriesMembers('se-40')).length }));
      ok(`${P} after reopening: the same records and numbers`, s.two === '2:broken' && s.forty === 7 && s.n === 8, s);
      await app.close();
    }

    // ── реалните архиви: номерацията не се пипа; „Чиния“ от 2 — /2 счупена ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      console.log('  ' + f + ':');
      a2.acceptConfirms = true;
      let s = await a2.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB); _pdOpen.series.units = true;
        const out = (DB.series || []).map(se => { openSeriesDet(se.id); const g = [...document.querySelectorAll('#dse-secs .pd-unit')].map(b => +b.dataset.u); seUnitTap(g[0]); sePickClear(); return [se.name, g.length, _seriesTotal(se), g.join()]; });
        return { out, same: b0 === JSON.stringify(DB) }; });
      ok('  every series shows one chip per unit (= count), in order; looking and selecting writes nothing', s.same && s.out.every(x => x[1] === x[2]), s);
      s = await a2.eval(() => { const se = (DB.series || []).find(x => _seriesTotal(x) === 2 && !_seriesMembers(x.id).length); if (!se) return null;
        const ev = JSON.stringify(se.events), others = JSON.stringify(DB.pieces.filter(p => p.seriesId !== se.id)), is2 = m => m.ref && m.ref.kind === 'series' && m.ref.id === se.id && Number(m.ref.unit) === 2;
        const strip = () => JSON.stringify(DB.firingRuns.map(r => [r.id, _runState(r), ((r.plan && r.plan.members) || []).filter(m => !is2(m)).map(m => m.id)])), runs = strip(), had2 = DB.firingRuns.filter(r => _runState(r) === 'planned' && ((r.plan && r.plan.members) || []).some(is2)).length;
        openSeriesDet(se.id); seUnitTap(2); openUnitsMo('broken'); document.getElementById('un-arch').checked = true; saveUnits();
        const m = _seriesMembers(se.id); return { name: se.name, m: m.map(x => [(x.units || []).join(), x.stage, !!x.archivedAt]), free: _seriesFreeUnits(se, m), cnt: se.count, ev: ev === JSON.stringify(se.events), others: others === JSON.stringify(DB.pieces.filter(p => p.seriesId !== se.id)), runs: runs === strip(), had2, left2: DB.firingRuns.filter(r => _runState(r) === 'planned' && ((r.plan && r.plan.members) || []).some(is2)).length, y: _seriesYield(se) }; });
      if (s) ok('  „' + s.name + '“ (2): /2 broken and archived' + (s.had2 ? ', out of the planned firing' : '') + '; /1, the series history, other pieces and every other plan entry untouched', s.m.length === 1 && s.m[0].join() === '2,broken,true' && s.free.join() === '1' && s.cnt === 2 && s.ev && s.others && s.runs && !s.left2 && s.y.alive === 1, s);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
