// v1.32.1 — updating an installed app. The previous release runs with its service
// worker and has data; the server switches to this tree; the page reloads.
// v1.31.1 broke here: the old worker served the new index.html with the old
// app.js from its cache, the list of pieces crashed and the app said
// „Хранилището не се отваря“. Also: modules stuck on an old version are refused
// with a clear message and nothing is written.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');

let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 400) : '')); } };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

(async () => {
  console.log('update:');
  if (!/__glinaModulesVersion/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))) { console.log('  - no module version check in this version'); return; }
  const prev = H.previous().find(x => x.version === 'v1.31.1') || H.previous().pop();
  let root = prev.root;
  // Files missing from a previous-release folder (icons, manifest) come from this tree.
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html';
    let f = path.join(root, u); if (!fs.existsSync(f)) f = path.join(ROOT, u);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch();
  try {
    // --- 1. real update through the previous release's service worker ---
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const dialogs = [], errors = [];
    page.on('dialog', d => { dialogs.push(d.message().split('\n')[0]); d.dismiss().catch(() => {}); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url); await page.waitForTimeout(2500); await page.reload(); await page.waitForTimeout(1500);
    const pv = await page.evaluate(async () => {
      editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 100));
      document.getElementById('pi-name').value = 'Преди обновяването'; savePiece(); await new Promise(r => setTimeout(r, 400));
      return { v: APP_VERSION, sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller), n: DB.pieces.length };
    });
    ok('previous release runs under its service worker, with a piece (' + pv.v + ')', pv.sw && pv.n === 1, pv);
    root = ROOT;
    await page.reload(); await page.waitForTimeout(5000);
    const after = await page.evaluate(() => ({ v: APP_VERSION, mods: window.__glinaModulesVersion, broken: _storageBroken, cards: document.querySelectorAll('#pieces-grid .pc').length, names: DB.pieces.map(p => p.name) }));
    ok('after the update: new version, its own modules', after.v === after.mods && after.v !== pv.v, after);
    ok('after the update: the piece is listed, nothing reported broken', !after.broken && after.cards === 1 && after.names[0] === 'Преди обновяването', after);
    ok('no alert on the way', dialogs.length === 0, dialogs);
    ok('no page errors', errors.length === 0, errors);
    await ctx.close();

    // --- 2. modules stuck on an old version: refused, nothing written ---
    root = ROOT;
    const ctx2 = await browser.newContext({ serviceWorkers: 'block' });
    const old = fs.readFileSync(path.join(prev.root, 'app.js'), 'utf8');
    const p2 = await ctx2.newPage();
    const d2 = [];
    p2.on('dialog', d => { d2.push(d.message().split('\n')[0]); d.dismiss().catch(() => {}); });
    await p2.goto(url); await p2.waitForTimeout(1500);
    await p2.evaluate(async () => { editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 100)); document.getElementById('pi-name').value = 'Пазено'; savePiece(); await new Promise(r => setTimeout(r, 400)); });
    const dump = () => p2.evaluate(() => new Promise(res => { const q = indexedDB.open('atelie_idb', 1); q.onsuccess = e => { const st = e.target.result.transaction(['kv']).objectStore('kv'), o = {}; const c = st.openCursor(); c.onsuccess = ev => { const cur = ev.target.result; if (!cur) { e.target.result.close(); res(o); return; } o[cur.key] = String(cur.value).length; cur.continue(); }; }; }));
    const before = await dump();
    await ctx2.route('**/app.js', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: old }));
    await p2.reload(); await p2.waitForTimeout(3000);
    const st = await p2.evaluate(() => ({ broken: _storageBroken, why: _storageBrokenReason, url: location.href }));
    ok('stale app.js: one automatic reload, then a clear message', d2.length === 1 && /не се зареди изцяло/.test(d2[0]) && st.broken && st.why === 'modules', { d2, st });
    ok('stale app.js: nothing written', JSON.stringify(await dump()) === JSON.stringify(before));
    await ctx2.unroute('**/app.js');
    await p2.reload(); await p2.waitForTimeout(2000);
    const back = await p2.evaluate(() => ({ broken: _storageBroken, cards: document.querySelectorAll('#pieces-grid .pc').length }));
    ok('with the right app.js it opens normally again', !back.broken && back.cards === 1, back);
    await ctx2.close();
  } finally { await browser.close(); srv.close(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
