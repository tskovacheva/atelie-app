// Test harness: serves the app tree over HTTP and drives it in real Chromium
// (Playwright). Real IndexedDB, real ES modules, real fetch — jsdom has neither
// modules nor a faithful IndexedDB, and the storage layer is exactly what these
// tests exist to protect.
//
//   const h = await harness.start(rootDir);
//   const app = await h.open({ seed: { atelie_v6: jsonString } });  // fresh profile
//   const snap = await app.snapshot();
//   await app.reload();                                              // same profile
//   await h.stop();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.css': 'text/css' };

function serve(state) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      if (u === '/__blank') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><title>blank</title>'); return; }
      const root = state.root;
      const f = path.join(root, u === '/' ? 'index.html' : u);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function start(root) {
  const state = { root: path.resolve(root) };
  const srv = await serve(state);
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch();

  async function open(opts) {
    opts = opts || {};
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    // Simulate a missing/unreachable file (e.g. first open offline).
    for (const b of (opts.block || [])) await ctx.route('**' + b, r => r.abort());
    const page = await ctx.newPage();
    const log = { dialogs: [], errors: [], console: [] };
    // Confirms are declined unless a test opts in (app.acceptConfirms = true).
    page.on('dialog', d => {
      log.dialogs.push(d.type() + ': ' + d.message().split('\n')[0]);
      (d.type() === 'confirm' && app.acceptConfirms ? d.accept() : d.dismiss()).catch(() => {});
    });
    page.on('pageerror', e => log.errors.push(String(e && e.message || e)));
    // Fonts come from Google and the sandbox has no network — that one is expected.
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|fonts\.g/.test(m.text())) log.console.push(m.text()); });
    let app;
    if (opts.seed || opts.localStorage) {
      await page.goto(base + '/__blank');
      await page.evaluate(({ seed, ls }) => new Promise((resolve, reject) => {
        Object.keys(ls || {}).forEach(k => localStorage.setItem(k, ls[k]));
        const req = indexedDB.open('atelie_idb', 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('kv');
        req.onsuccess = e => {
          const db = e.target.result;
          const tx = db.transaction(['kv'], 'readwrite');
          Object.keys(seed || {}).forEach(k => tx.objectStore('kv').put(seed[k], k));
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      }), { seed: opts.seed || {}, ls: opts.localStorage || {} });
    }
    app = {
      page, ctx, log, acceptConfirms: false,
      // Imports a backup through the real file input, as a person would.
      async importFile(json) {
        app.acceptConfirms = true;
        await page.setInputFiles('input[type=file][accept=".json"]', { name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(json) });
        await page.waitForTimeout(400);
        app.acceptConfirms = false;
      },
      async goto() { await page.goto(base + '/index.html'); await ready(page); },
      async reload() { await page.reload(); await ready(page); },
      snapshot: () => page.evaluate(SNAPSHOT),
      idbKeys: () => page.evaluate(IDB_DUMP),
      eval: (fn, arg) => page.evaluate(fn, arg),
      close: () => ctx.close()
    };
    await app.goto();
    return app;
  }
  // Same origin, different code: how a rollback to an older version is tested.
  const setRoot = r => { state.root = path.resolve(r); };
  return { base, open, setRoot, stop: async () => { await browser.close(); srv.close(); } };
}

// Ready = boot finished: the storage label is written after load() and render().
async function ready(page) {
  await page.waitForFunction(() => {
    if (typeof _storageBroken !== 'undefined' && _storageBroken) return true;
    const el = document.getElementById('storage-label');
    return el && /Заето|MB/.test(el.textContent || '');
  }, null, { timeout: 15000 });
  // Pending IDB writes from the boot-time save() and migration.
  await page.waitForTimeout(150);
}

// Everything derived that a refactor must not change. Runs inside the page against
// the app's own functions — the point is to pin their results, not to re-derive them.
const SNAPSHOT = () => {
  const h = s => { s = typeof s === 'string' ? s : JSON.stringify(s); let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return (x >>> 0).toString(36); };
  const clone = o => JSON.parse(JSON.stringify(o));
  const tl = o => { const r = getTimelineEvents(o); return { synthetic: !!r.isSynthetic, ev: (r.events || []).map(e => [e.type, e.date || '', e._fromSeries ? 'S' : '', (e.data && (e.data.stageValue || e.data.firingPurpose || e.data.firingRunId || e.data.technique)) || '']) }; };
  const out = { broken: (typeof _storageBroken !== 'undefined') && _storageBroken, counts: {}, pieces: {}, series: {}, runs: {}, recipes: {}, masses: {}, tests: {}, profiles: {} };
  ['pieces', 'recipes', 'materials', 'tests', 'firingProfiles', 'firingRuns', 'series'].forEach(c => out.counts[c] = (DB[c] || []).length);
  DB.pieces.forEach(p => {
    const c = clone(p); recomputePieceStage(c);
    out.pieces[p.id] = { stage: p.stage, recomputed: c.stage, timeline: tl(p), photo: h(getLatestPhoto(p) || '') };
  });
  (DB.series || []).forEach(se => {
    out.series[se.id] = { members: _seriesMembers(se.id).map(m => m.id), remaining: _seriesRemaining(se), summary: _seriesStageSummary(se), yield: _seriesYield(se), timeline: tl(se) };
  });
  DB.firingRuns.forEach(r => { out.runs[r.id] = { pieces: _runPieces(r.id).map(x => x.piece.id + (x.isSeries ? '*' : '')), tests: _runTests(r.id).map(t => t.id) }; });
  DB.recipes.forEach(r => { out.recipes[r.id] = { name: _recDisplayName(r), latest: _recIsLatest(r) }; });
  DB.materials.filter(m => m.cat === 'mass').forEach(m => { out.masses[m.id] = _massSummary(m); });
  DB.tests.forEach(t => { out.tests[t.id] = { shrink: _shrinkPcts(t.body), poro: _poroPct(t.body) }; });
  DB.firingProfiles.forEach(f => { out.profiles[f.id] = { ramps: _fpRamps(f), peak: _fpPeak(f), duration: _fpDuration(f) }; });
  const bp = _backupPayload().payload;
  out.backup = { schemaVersion: bp.schemaVersion, db: Object.keys(bp.db).map(k => k + ':' + bp.db[k].length), library: (bp.userLibrary || []).length };
  out.library = { count: getAllLib().length, builtin: getAllLib().filter(a => String(a.id).indexOf('builtin_') === 0).map(a => a.id + ':' + h(a.content || '')) };
  // The data itself, minus what legitimately differs between runs (migration dates).
  const db = clone({ pieces: DB.pieces, recipes: DB.recipes, materials: DB.materials, tests: DB.tests, firingProfiles: DB.firingProfiles, firingRuns: DB.firingRuns, series: DB.series });
  out.dbHash = h(db);
  out.migrations = Object.keys(DB._migrations || {}).sort();
  out.ui = { cards: Array.from(document.querySelectorAll('#sc-pieces .pc, #sc-pieces .li')).map(n => (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)) };
  return out;
};

const IDB_DUMP = () => new Promise(resolve => {
  const req = indexedDB.open('atelie_idb', 1);
  req.onsuccess = e => {
    const db = e.target.result, st = db.transaction(['kv']).objectStore('kv'), out = {};
    const c = st.openCursor();
    c.onsuccess = ev => { const cur = ev.target.result; if (!cur) { db.close(); resolve(out); return; } out[cur.key] = typeof cur.value === 'string' ? cur.value : '[non-string]'; cur.continue(); };
  };
});

// Previous releases kept for rollback and screen comparison: tests/previous/vX.Y.Z/.
// Sorted oldest → newest.
function previous() {
  const dir = path.join(__dirname, '..', 'previous');
  if (!fs.existsSync(dir)) return [];
  const v = s => s.replace(/^v/, '').split('.').map(Number);
  return fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'index.html')))
    .sort((a, b) => { const x = v(a), y = v(b); for (let i = 0; i < 4; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; })
    .map(d => ({ version: d, root: path.join(dir, d) }));
}

module.exports = { start, previous };
