// Schema version and migration foundation (v1.29.0), and rollback.
//
//   • rec:meta carries the schema number, the backup carries the same one;
//   • a migration snapshots exactly the records it touches, applies once, logs;
//   • a migration that throws half-way leaves the data as it was;
//   • snapshots can be restored, and expire after 7 days;
//   • rollback: the previous release (v1.28.0, kept in tests/previous/) opens
//     data written by this one and derives the same results, and back again.
const path = require('path');
const fs = require('fs');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const GOLD = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', 'representative.json'), 'utf8'));

let failed = 0, passed = 0;
const check = (n, cond, info) => { if (cond) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 300) : '')); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const MIG = `({id:'test-add',schema:5,about:'test',
  select:function(db){return db.pieces.filter(function(p){return p.id==='p-ocarina'||p.id==='p-old';}).map(function(r){return {coll:'pieces',rec:r};});},
  apply:function(r){r.kilnNote='added';}})`;
const MIG_BAD = `({id:'test-bad',schema:5,
  select:function(db){return db.pieces.filter(function(p){return p.id==='p-ocarina'||p.id==='p-old';}).map(function(r){return {coll:'pieces',rec:r};});},
  apply:function(r){r.half='x';if(r.id==='p-old')throw new Error('boom');}})`;

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('migrate:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    const hasSchema = await app.eval(() => typeof _runSchemaMigrations === 'function');
    if (!hasSchema) console.log('  - no schema layer in this version: rollback only');
    if (hasSchema) {
    let keys = await app.idbKeys();
    const meta = JSON.parse(keys['rec:meta']);
    const SV = await app.eval(() => SCHEMA_VERSION);
    check('rec:meta carries schema ' + meta.schema, meta.schema === SV, meta);
    check('backup carries the same schema', (await app.eval(() => _backupPayload().payload.schemaVersion)) === meta.schema);

    const r1 = await app.eval(async m => { const mig = (0, eval)(m); const done = await _runSchemaMigrations([mig]); return { done, a: DB.pieces.find(p => p.id === 'p-ocarina').kilnNote, b: DB.pieces.find(p => p.id === 'p-old').kilnNote, log: DB._migrations['test-add'] }; }, MIG);
    check('migration applies to the selected records', r1.a === 'added' && r1.b === 'added', r1);
    check('migration is logged with its count', r1.log && r1.log.changed === 2 && r1.log.snapshotUntil, r1.log);
    keys = await app.idbKeys();
    const snaps = Object.keys(keys).filter(k => k.indexOf('snap:test-add:') === 0);
    check('snapshot kept for exactly the touched records', snaps.length === 2 && !JSON.parse(keys['snap:test-add:pieces:p-ocarina']).kilnNote, snaps);
    const r2 = await app.eval(async m => (await _runSchemaMigrations([(0, eval)(m)])).length, MIG);
    check('a migration runs once', r2 === 0);
    await app.reload();
    const r3 = await app.eval(() => ({ a: DB.pieces.find(p => p.id === 'p-ocarina').kilnNote, log: !!DB._migrations['test-add'] }));
    check('migrated data and log survive a reopen', r3.a === 'added' && r3.log, r3);

    const r4 = await app.eval(() => ({ n: _restoreMigrationSnapshot('test-add'), a: DB.pieces.find(p => p.id === 'p-ocarina').kilnNote, log: !!DB._migrations['test-add'] }));
    check('snapshot restore puts the records back', r4.n === 2 && r4.a === undefined && !r4.log, r4);
    await app.reload();
    const back = await app.snapshot();
    check('after restore everything derived matches the golden', same(back.dbHash, GOLD.dbHash), { got: back.dbHash, want: GOLD.dbHash });

    const r5 = await app.eval(async m => { let err = null; try { await _runSchemaMigrations([(0, eval)(m)]); } catch (e) { err = e; }
      return { err: err && err._migrationFailed, a: DB.pieces.find(p => p.id === 'p-ocarina').half, b: DB.pieces.find(p => p.id === 'p-old').half, log: !!DB._migrations['test-bad'] }; }, MIG_BAD);
    check('a migration that throws leaves the data as it was', r5.err === 'test-bad' && r5.a === undefined && r5.b === undefined && !r5.log, r5);

    const r6 = await app.eval(async m => { await _runSchemaMigrations([(0, eval)(m)]); DB._migrations['test-add'].snapshotUntil = '2000-01-01T00:00:00.000Z'; _dropOldSnapshots(); return Object.keys(_storageCache).filter(k => k.indexOf('snap:test-add:') === 0).length; }, MIG);
    check('snapshots expire', r6 === 0, r6);
    }
    await app.close();

    // Rollback: write with this version, open with the previous one, then return.
    for (const prevRel of H.previous()) {
      const PREV = prevRel.root, V = ' (' + prevRel.version + ')';
      const rb = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      // Edit something through the new code so the data really is "written by it".
      await rb.eval(async () => { curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 100)); savePiece(); await new Promise(r => setTimeout(r, 150)); });
      const mine = await rb.snapshot();
      h.setRoot(PREV);
      await rb.reload();
      const prev = await rb.snapshot();
      // What an older version legitimately does not show: the schema number it
      // writes, codes on the cards (v1.31.0), and the data hash (new fields kept).
      const strip = s => Object.assign({}, s, { dbHash: null, migrations: null, backup: Object.assign({}, s.backup, { schemaVersion: null }),
        ui: { cards: (s.ui.cards || []).map(c => c.replace(/GL-\d{4}-\d{3,}(\/\d+(?:[–,] ?\d+)*)?( · в архива)?/g, '').slice(0, 45)) } });
      check('rollback: previous version opens the data without errors' + V, !prev.broken && !rb.log.errors.length, rb.log);
      const fd = (a, b, p) => { p = p || ''; if (JSON.stringify(a) === JSON.stringify(b)) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set(Object.keys(a).concat(Object.keys(b)))) { const d = fd(a[k], b[k], p + '.' + k); if (d) return d; } } return p + ': ' + JSON.stringify(a).slice(0, 120) + ' vs ' + JSON.stringify(b).slice(0, 120); };
      check('rollback: previous version derives the same results' + V, same(strip(prev), strip(mine)), fd(strip(prev), strip(mine)));
      h.setRoot(ROOT);
      await rb.reload();
      const again = await rb.snapshot();
      check('roll forward again: same results' + V, same(again, mine));
      const metaAgain = JSON.parse((await rb.idbKeys())['rec:meta']);
      if (hasSchema) check('roll forward again: schema written back' + V, metaAgain.schema === (await rb.eval(() => SCHEMA_VERSION)), metaAgain);
      await rb.close();
    }

    // Data from a newer version (schema 99) still opens.
    if (hasSchema) {
    const nw = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    await nw.eval(() => new Promise(r => { const m = JSON.parse(_storageCache['rec:meta']); m.schema = 99; _idbSet('rec:meta', JSON.stringify(m)).then(r); }));
    await nw.reload();
    const ns = await nw.snapshot();
    check('data marked with a newer schema still opens', !ns.broken && same(ns.dbHash, GOLD.dbHash));
    await nw.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
