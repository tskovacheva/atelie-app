// v1.31.0 — identity: codes, unit numbers in series, piece → series, count
// changes, split, "take out of series" keeps history, archive instead of delete.
// Real Chromium, real storage, the representative archive; rollback to v1.30.0.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 400) : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('identity:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    const has = await app.eval(() => typeof _identityPlan === 'function');
    if (!has) { console.log('  - no identity layer in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, arg) => app.eval(fn, arg);

    // --- migration result ---
    let s = await E(() => ({
      codes: DB.pieces.filter(p => !p.seriesId).map(p => p.code), se: findSeries('se-plates'),
      yellow: DB.pieces.find(p => p.id === 'p-yellow'), broken: DB.pieces.find(p => p.id === 'p-broken'),
      label: [pieceCode(DB.pieces.find(p => p.id === 'p-yellow')), pieceCode(DB.pieces.find(p => p.id === 'p-broken'))],
      stages: DB.pieces.map(p => p.id + ':' + p.stage).join(',')
    }));
    ok('every standalone piece and series has a code', s.codes.every(c => /^GL-\d{4}-\d{3}$/.test(c)) && /^GL-\d{4}-\d{3}$/.test(s.se.code), s.codes);
    ok('codes are unique', new Set(s.codes.concat([s.se.code])).size === s.codes.length + 1);
    ok('series: next unit after the count (10 → 11)', s.se.nextUnitNo === 11, s.se);
    ok('members numbered in split order: yellow 1–4, broken 5', JSON.stringify(s.yellow.units) === '[1,2,3,4]' && JSON.stringify(s.broken.units) === '[5]');
    ok('member code = series code + numbers', s.label[0] === s.se.code + '/1–4' && s.label[1] === s.se.code + '/5', s.label);
    const stages0 = s.stages;

    // --- new piece gets the next code ---
    s = await E(async () => {
      const before = _allCodes().slice();
      editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 50));
      document.getElementById('pi-name').value = 'Нова купа'; document.getElementById('pi-date').value = '2026-10-29';
      savePiece(); await new Promise(r => setTimeout(r, 50));
      const p = DB.pieces.find(x => x.name === 'Нова купа');
      return { code: p.code, expected: _nextCode(before, 2026) };
    });
    ok('a new piece gets the next code of its year', s.code === s.expected, s);

    // --- split takes the lowest free numbers ---
    s = await E(async () => {
      curSeries = 'se-plates'; openSplitMo(); await new Promise(r => setTimeout(r, 30));
      document.getElementById('sp-count').value = 2; document.getElementById('sp-name').value = 'Сини';
      saveSplit(); await new Promise(r => setTimeout(r, 50));
      return DB.pieces.find(x => x.name === 'Сини').units;
    });
    ok('split of 2 → numbers 6 and 7', JSON.stringify(s) === '[6,7]', s);

    // --- count change: 10 → 9 retires the highest free; 9 → 11 adds new ones ---
    const setCount = n => E(async n => {
      curSeries = 'se-plates'; editSeries(); await new Promise(r => setTimeout(r, 50));
      document.getElementById('pi-count').value = n; savePiece(); await new Promise(r => setTimeout(r, 50));
      const se = findSeries('se-plates'); return { count: se.count, next: se.nextUnitNo, retired: (se.retiredUnits || []).map(x => x.no), free: _seriesFreeUnits(se, _seriesMembers('se-plates')) };
    }, n);
    s = await setCount(9);
    ok('count 10 → 9: number 10 retired, free 8–9', s.count === 9 && JSON.stringify(s.retired) === '[10]' && JSON.stringify(s.free) === '[8,9]', s);
    s = await setCount(11);
    ok('count 9 → 11: new numbers 11, 12 — 10 is never given again', s.count === 11 && s.next === 13 && JSON.stringify(s.free) === '[8,9,11,12]', s);
    s = await setCount(6);
    ok('count below the split pieces is refused', s.count === 11, s);

    // --- take out of the series: history copied, code kept, series shrinks ---
    s = await E(async () => {
      const pc = DB.pieces.find(x => x.id === 'p-broken');
      const sharedBefore = _effectiveEvents(pc).filter(e => e._fromSeries).length, ownBefore = pc.events.length, codeBefore = pieceCode(pc);
      const runsBefore = DB.firingRuns.map(r => r.id + ':' + _runPieces(r.id).map(x => x.piece.id).sort().join('|'));
      curPiece = 'p-broken'; detachFromSeries(); await new Promise(r => setTimeout(r, 50));
      const se = findSeries('se-plates');
      return { sharedBefore, ownBefore, after: pc.events.length, copied: pc.events.filter(e => e.copiedFrom).length, code: pc.code, codeBefore, seriesId: pc.seriesId,
        count: se.count, retired: se.retiredUnits.map(x => x.no + ':' + x.reason), stage: pc.stage,
        runsBefore, runsAfter: DB.firingRuns.map(r => r.id + ':' + _runPieces(r.id).map(x => x.piece.id).sort().join('|')) };
    });
    ok('take out: the shared steps are copied into the piece', s.copied === s.sharedBefore && s.after === s.ownBefore + s.sharedBefore && s.sharedBefore > 0, s);
    ok('take out: the piece keeps its code (…/5)', s.code === s.codeBefore && /\/5$/.test(s.code) && !s.seriesId, s);
    ok('take out: series 11 → 10, number 5 retired as "detached"', s.count === 10 && s.retired.includes('5:detached'), s);
    ok('take out: broken stays broken', s.stage === 'broken', s.stage);

    // --- piece → series ---
    s = await E(async () => {
      const p = DB.pieces.find(x => x.id === 'p-ocarina');
      const before = { code: p.code, events: JSON.stringify(p.events), photos: JSON.stringify(p.photos), runs: DB.firingRuns.map(r => r.id + ':' + _runPieces(r.id).map(x => x.piece.id + (x.isSeries ? '*' : '')).join('|')) };
      curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 50));
      const shown = document.getElementById('pi-count-wrap').style.display !== 'none';
      document.getElementById('pi-count').value = 3; savePiece(); await new Promise(r => setTimeout(r, 80));
      const se = findSeries('p-ocarina');
      return { shown, before, inPieces: !!DB.pieces.find(x => x.id === 'p-ocarina'), se: se && { code: se.code, count: se.count, next: se.nextUnitNo, events: JSON.stringify(se.events), photos: JSON.stringify(se.photos), stage: se.stage },
        runs: DB.firingRuns.map(r => r.id + ':' + _runPieces(r.id).map(x => x.piece.id + (x.isSeries ? '*' : '')).join('|')) };
    });
    ok('editing a standalone piece shows "Брой"', s.shown);
    ok('piece → series: same id and code, count 3, units 1–3', !s.inPieces && s.se && s.se.code === s.before.code && s.se.count === 3 && s.se.next === 4, s.se);
    ok('piece → series: history and photos kept as they were', s.se.events === s.before.events && s.se.photos === s.before.photos);
    const norm = a => a.map(x => { const [r, ps] = x.split(':'); return r + ':' + ps.split('|').sort().join('|'); }).join();
    ok('piece → series: still in its firings, now as a series row', norm(s.runs) === norm(s.before.runs.map(x => x.replace(/p-ocarina(?!\*)/g, 'p-ocarina*'))), [s.before.runs, s.runs]);
    s = await E(async () => { curPiece = 'p-yellow'; editPiece(); await new Promise(r => setTimeout(r, 50)); const v = document.getElementById('pi-count-wrap').style.display; closeMo('mo-piece'); return v; });
    ok('a piece inside a series has no "Брой"', s === 'none');

    // --- archive ---
    s = await E(async () => {
      renderPieces(); const n0 = document.querySelectorAll('#pieces-grid .pc').length;
      openPieceDet('p-done'); delPiece(); await new Promise(r => setTimeout(r, 30));
      const p = DB.pieces.find(x => x.id === 'p-done'), n1 = document.querySelectorAll('#pieces-grid .pc').length;
      const inRun = _runPieces('run-gl').some(x => x.piece.id === 'p-done');
      togglePcChip('arch'); const arch = Array.from(document.querySelectorAll('#pieces-grid .pc')).map(n => n.textContent); togglePcChip('arch');
      curPiece = 'p-done'; openPieceDet('p-done'); const btn = document.getElementById('dpi-del').textContent;
      restorePiece(); const n2 = document.querySelectorAll('#pieces-grid .pc').length;
      return { n0, n1, n2, archived: !!p.archivedAt, inRun, arch: arch.length, btn, stillThere: !!DB.pieces.find(x => x.id === 'p-done') };
    });
    ok('archive hides the piece, keeps the record', s.archived === false && s.n1 === s.n0 - 1 && s.stillThere, s);
    ok('archived piece stays in its firing', s.inRun);
    ok('"Архив" filter shows only archived; there the button is "Изтрий завинаги"', s.arch === 1 && s.btn === 'Изтрий завинаги', s);
    ok('restore brings it back', s.n2 === s.n0);
    s = await E(async () => {
      const m = DB.pieces.find(x => x.name === 'Сини'); openPieceDet(m.id); delPiece(); openPieceDet(m.id); delPiece(); await new Promise(r => setTimeout(r, 30));
      const se = findSeries('se-plates');
      return { gone: !DB.pieces.find(x => x.name === 'Сини'), retired: se.retiredUnits.map(x => x.no + ':' + x.reason), free: _seriesFreeUnits(se, _seriesMembers('se-plates')) };
    });
    ok('delete forever (from the archive): its numbers 6, 7 are retired, not free', s.gone && s.retired.includes('6:deleted') && s.retired.includes('7:deleted') && !s.free.includes(6), s);

    // --- archived series, delete forever keeps members' history ---
    s = await E(async () => {
      const y = DB.pieces.find(x => x.id === 'p-yellow'); const shared = _effectiveEvents(y).filter(e => e._fromSeries).length, own = y.events.length;
      openSeriesDet('se-plates'); delSeries(); const arch = !!findSeries('se-plates').archivedAt; openSeriesDet('se-plates'); delSeries(); await new Promise(r => setTimeout(r, 30));
      return { arch, gone: !findSeries('se-plates'), shared, after: y.events.length, own, code: y.code };
    });
    ok('series: archive first, then delete forever', s.arch && s.gone, s);
    ok('series deleted forever: members keep the shared history and their code', s.after === s.own + s.shared && /\/1–4$/.test(s.code), s);

    // --- stages of untouched pieces unchanged ---
    s = await E(() => DB.pieces.filter(p => ['p-standalone', 'p-gift', 'p-untyped', 'p-old', 'p-done'].includes(p.id)).map(p => p.id + ':' + p.stage).join(','));
    ok('stages of pieces not touched are unchanged', ['p-standalone', 'p-gift', 'p-untyped', 'p-old', 'p-done'].every(id => stages0.includes(s.split(',').find(x => x.startsWith(id + ':')))), s);

    // --- reopen: nothing re-numbered ---
    const codes1 = await E(() => JSON.stringify([DB.pieces.map(p => [p.id, p.code, p.units]), DB.series.map(x => [x.id, x.code, x.nextUnitNo, x.retiredUnits])]));
    await app.reload();
    const codes2 = await E(() => JSON.stringify([DB.pieces.map(p => [p.id, p.code, p.units]), DB.series.map(x => [x.id, x.code, x.nextUnitNo, x.retiredUnits])]));
    ok('reopen: codes and numbers unchanged', codes1 === codes2);

    // --- rollback to v1.30.0 and back ---
    const prev = H.previous().find(x => x.version === 'v1.30.0');
    if (prev) {
      h.setRoot(prev.root); await app.reload();
      const r = await E(() => ({ v: APP_VERSION, series: (DB.series || []).map(x => x.id), ocarina: !!findSeries('p-ocarina'), err: false }));
      ok('rollback to v1.30.0: opens, sees the converted series', r.v === 'v1.30.0' && r.ocarina && !app.log.errors.length, [r, app.log.errors]);
      // v1.30.0 creates a piece and a split while rolled back
      await E(async () => { editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 50)); document.getElementById('pi-name').value = 'От стара версия'; savePiece();
        curSeries = 'p-ocarina'; openSplitMo(); await new Promise(r => setTimeout(r, 30)); document.getElementById('sp-count').value = 1; document.getElementById('sp-name').value = 'Отделена в старата'; saveSplit(); await new Promise(r => setTimeout(r, 80)); });
      h.setRoot(ROOT); await app.reload();
      const b = await E(() => { const p = DB.pieces.find(x => x.name === 'От стара версия'), m = DB.pieces.find(x => x.name === 'Отделена в старата'), se = findSeries('p-ocarina');
        return { pcode: p && p.code, units: m && m.units, all: _allCodes(), next: se.nextUnitNo, codes: JSON.stringify([DB.pieces.filter(x => x.code && x.name !== 'От стара версия').map(x => [x.id, x.code]), DB.series.map(x => [x.id, x.code])]) }; });
      ok('back to v1.31.0: the piece made in v1.30.0 gets a fresh, unique code', /^GL-\d{4}-\d{3}$/.test(b.pcode) && b.all.filter(c => c === b.pcode).length === 1, b);
      ok('back to v1.31.0: the split made in v1.30.0 gets the lowest free number', JSON.stringify(b.units) === '[1]', b);
      ok('back to v1.31.0: nothing else re-numbered', b.codes === JSON.stringify(JSON.parse(codes2).map((x, i) => i === 0 ? x.filter(y => y[1]).map(y => [y[0], y[1]]) : x.map(y => [y[0], y[1]]))), b.codes.slice(0, 200));
    } else console.log('  - no tests/previous/v1.30.0: rollback skipped');
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- import of an old backup fills codes ---
    const imp = await h.open();
    imp.acceptConfirms = true;
    const old = JSON.parse(FIX); delete old._migrations;
    const payload = JSON.stringify({ schemaVersion: 4, exportedAt: '2026-10-01T10:00:00Z', db: old });
    await imp.importFile(payload);
    const ri = await imp.eval(() => ({ codes: DB.pieces.filter(p => !p.seriesId).every(p => /^GL-/.test(p.code)), se: DB.series.every(x => x.code && x.nextUnitNo), units: DB.pieces.filter(p => p.seriesId).every(p => Array.isArray(p.units) && p.units.length) }));
    ok('an old backup gets codes and numbers on import', ri.codes && ri.se && ri.units, ri);
    await imp.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
