// v1.35.2 — the „new version“ notice: a bar you can tap (the old toast ignored taps
// and stayed until the next start), „По-късно“ hides it, „Обнови“ reloads — but
// not over an open form with unsaved changes without asking.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 400) : '')); } };
(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('updbar:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof updNow === 'function'))) { console.log('  - not in this version'); return; }
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); showUpdateToast(null); });
    const b = await E(() => { const e = document.getElementById('upd-bar'), r = e.getBoundingClientRect(); return { vis: getComputedStyle(e).display !== 'none', pe: getComputedStyle(e).pointerEvents, w: r.width, vw: innerWidth, btns: [...e.querySelectorAll('button')].map(x => x.innerText) }; });
    ok('the bar shows, takes taps, fits the phone width, „По-късно“ and „Обнови“', b.vis && b.pe !== 'none' && b.w <= b.vw && b.btns.join() === 'По-късно,Обнови', b);
    await page.click('#upd-bar button:has-text("По-късно")');
    ok('„По-късно“ hides it', await E(() => getComputedStyle(document.getElementById('upd-bar')).display === 'none'));
    await E(() => { showUpdateToast(null); });
    ok('shown once per session (not again after „По-късно“)', await E(() => getComputedStyle(document.getElementById('upd-bar')).display === 'none'));
    // an open form with a change: asks, and declining keeps everything
    await E(async () => { _updShown = false; showUpdateToast(null); editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 50)); document.getElementById('pi-name').value = 'Недовършено'; });
    app.acceptConfirms = false;
    const navs = []; page.on('load', () => navs.push('load'));
    await page.click('#upd-now', { force: true });
    await page.waitForTimeout(700);
    const kept = await E(() => ({ v: document.getElementById('pi-name').value, open: document.getElementById('mo-piece').classList.contains('on'), bar: getComputedStyle(document.getElementById('upd-bar')).display !== 'none' }));
    ok('unsaved form: asks; „Cancel“ keeps the form and the text, no reload', kept.v === 'Недовършено' && kept.open && kept.bar && !navs.length && app.log.dialogs.some(d => /незапазени промени/.test(d)), [kept, navs, app.log.dialogs]);
    await E(() => closeMo('mo-piece'));
    await page.click('#upd-now', { force: true });
    await page.waitForTimeout(1500);
    ok('„Обнови“ with nothing open reloads the page', navs.length === 1, navs);
    const after = await E(() => ({ bar: getComputedStyle(document.getElementById('upd-bar')).display, ok: !_storageBroken }));
    ok('after the reload: no bar, app fine', after.bar === 'none' && after.ok, after);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
