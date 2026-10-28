// Golden tests: boot the real app in Chromium from fixed archives and compare
// everything derived (stages, merged timelines, run lists, yields, versions,
// shrinkage, profile curves, backup shape, rendered list) against a stored
// snapshot. A refactor that changes any of it fails here.
//
//   node tests/golden.test.js            compare
//   node tests/golden.test.js --update   rewrite the snapshots (only on purpose)
//
// A real archive can be added without committing it: put it at
// tests/fixtures/private/<name>.json (git-ignored) and it is run the same way.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');

const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const UPDATE = process.argv.includes('--update');
const GOLD = path.join(__dirname, 'golden');
const fix = n => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8');

let failed = 0, passed = 0;
const ok = (name) => { passed++; console.log('  ok   ' + name); };
const bad = (name, msg) => { failed++; console.log('  FAIL ' + name + '\n       ' + msg); };

function firstDiff(a, b, p) {
  p = p || '';
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = Array.from(new Set(Object.keys(a).concat(Object.keys(b))));
    for (const k of keys) { const d = firstDiff(a[k], b[k], p + '.' + k); if (d) return d; }
  }
  return p + ': expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a);
}
function golden(name, snap) {
  const f = path.join(GOLD, name + '.json');
  if (UPDATE || !fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(snap, null, 1)); console.log('  wrote golden/' + name + '.json'); return; }
  const d = firstDiff(snap, JSON.parse(fs.readFileSync(f, 'utf8')));
  d ? bad('golden ' + name, d) : ok('golden ' + name);
}
function clean(app, name) {
  const l = app.log;
  if (l.errors.length || l.console.length) bad(name + ' — no page errors', JSON.stringify(l.errors.concat(l.console)));
  else ok(name + ' — no page errors');
}

async function archiveCase(h, name, json) {
  const app = await h.open({ seed: { atelie_v6: json }, localStorage: { atelie_idb_active: '1' } });
  const snap = await app.snapshot();
  clean(app, name);
  if (snap.broken) bad(name + ' boots', 'storage reported broken'); else ok(name + ' boots');
  golden(name, snap);
  const keys = await app.idbKeys();
  (keys.atelie_layout && keys['rec:meta']) ? ok(name + ' — moved to per-record storage') : bad(name + ' — per-record storage', Object.keys(keys).join(','));
  await app.reload();
  const again = await app.snapshot();
  const d = firstDiff(again, snap);
  d ? bad(name + ' — reopen gives the same result', d) : ok(name + ' — reopen gives the same result');
  return { app, snap };
}

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('golden:');
    const rep = await archiveCase(h, 'representative', fix('representative.json'));
    await archiveCase(h, 'legacy', fix('legacy.json')).then(r => r.app.close());

    // Fresh install: no data at all.
    const fresh = await h.open();
    const fs0 = await fresh.snapshot();
    clean(fresh, 'fresh install');
    golden('fresh', fs0);

    // Backup round trip: export from the representative install, import into the
    // fresh one through the real file input. Everything derived must match.
    const payload = await rep.app.eval(() => JSON.stringify(_backupPayload().payload));
    await fresh.importFile(payload);
    const imported = await fresh.snapshot();
    const strip = s => Object.assign({}, s, { migrations: null });
    const d = firstDiff(strip(imported), strip(rep.snap));
    d ? bad('backup round trip', d) : ok('backup round trip');

    // Guides file unreachable on first open: the app must still boot, and must not
    // write an empty library — the next open (file reachable) seeds it normally.
    if (fs.existsSync(path.join(ROOT, 'seed', 'guides.json'))) {
    const off = await h.open({ block: ['/seed/guides.json'] });
    const offSnap = await off.snapshot();
    const offKeys = await off.idbKeys();
    (!offSnap.broken && offSnap.library.count === 0 && !offKeys.atelie_userlib) ? ok('guides unreachable — boots, library untouched')
      : bad('guides unreachable — boots, library untouched', JSON.stringify({ broken: offSnap.broken, lib: offSnap.library.count, key: !!offKeys.atelie_userlib }));
    await off.ctx.unrouteAll();
    await off.reload();
    const onSnap = await off.snapshot();
    const d2 = firstDiff(onSnap.library, fs0.library);
    d2 ? bad('guides reachable again — library seeded', d2) : ok('guides reachable again — library seeded');
    await off.close();
    }

    // app.js unreachable (a file forgotten at upload): the app must say so and
    // write nothing — the stored data has to stay exactly as it was.
    if (fs.existsSync(path.join(ROOT, 'app.js'))) {
    const seeded = { atelie_v6: fix('representative.json') };
    const nm = await h.open({ seed: seeded, localStorage: { atelie_idb_active: '1' }, block: ['/app.js'] });
    const nmKeys = await nm.idbKeys();
    const said = nm.log.dialogs.some(d => /не се зареди/.test(d));
    (said && Object.keys(nmKeys).length === 1 && nmKeys.atelie_v6 === seeded.atelie_v6) ? ok('modules missing — says so, writes nothing')
      : bad('modules missing — says so, writes nothing', JSON.stringify({ said, keys: Object.keys(nmKeys) }));
    await nm.close();
    }

    // Private archives (real data, never committed).
    const priv = path.join(__dirname, 'fixtures', 'private');
    if (fs.existsSync(priv)) for (const f of fs.readdirSync(priv).filter(f => f.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(priv, f), 'utf8'));
      // An export has no _migrations; a device that made it had them all done.
      const DONE = { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' };
      const v6 = JSON.stringify(raw.db ? Object.assign({ _migrations: DONE }, raw.db) : raw);
      const r = await archiveCase(h, 'private-' + f.replace(/\.json$/, ''), v6);
      await r.app.close();
    }
    await rep.app.close(); await fresh.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
