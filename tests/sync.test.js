// v1.54.0 — синхронизация с Google Drive: по избор, „Изпрати“/„Вземи“ между две
// устройства, без тихо презаписване. Google е подменен: библиотеката за вход е
// заместител, а Drive (appDataFolder) е в паметта на теста — същите адреси и отговори.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8'));
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 800) : '')); } };

// ── Drive в паметта ──
const drive = { files: {}, seq: 0, calls: [] };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE', 'access-control-expose-headers': 'Location' };
const json = (route, obj, st) => route.fulfill({ status: st || 200, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: JSON.stringify(obj) });
const pub = f => ({ id: f.id, name: f.name, modifiedTime: f.modifiedTime, size: String(f.content.length), appProperties: f.appProperties });
const pending = {};
async function googleApis(route) {
  const req = route.request(), u = new URL(req.url()), m = req.method();
  if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
  drive.calls.push(m + ' ' + u.pathname);
  if (u.pathname === '/drive/v3/files' && m === 'GET') {
    const name = /name='([^']+)'/.exec(u.searchParams.get('q') || '')[1];
    return json(route, { files: Object.values(drive.files).filter(f => f.name === name).map(pub) });
  }
  let mm;
  if ((mm = /^\/drive\/v3\/files\/([^/]+)\/copy$/.exec(u.pathname)) && m === 'POST') {
    const src = drive.files[mm[1]], b = JSON.parse(req.postData()), id = 'f' + (++drive.seq);
    drive.files[id] = { id, name: b.name, appProperties: b.appProperties, content: src.content, modifiedTime: new Date().toISOString() };
    return json(route, { id });
  }
  if ((mm = /^\/drive\/v3\/files\/([^/]+)$/.exec(u.pathname))) {
    if (m === 'DELETE') { delete drive.files[mm[1]]; return route.fulfill({ status: 204, headers: CORS }); }
    if (m === 'GET' && u.searchParams.get('alt') === 'media') return route.fulfill({ status: 200, headers: Object.assign({ 'content-type': 'application/json' }, CORS), body: drive.files[mm[1]].content });
  }
  if (u.pathname.startsWith('/upload/drive/v3/files') && (m === 'POST' || m === 'PATCH')) {
    const meta = JSON.parse(req.postData()), id = m === 'PATCH' ? u.pathname.split('/').pop() : 'f' + (++drive.seq), tk = 'u' + (++drive.seq);
    pending[tk] = { id, meta };
    return route.fulfill({ status: 200, headers: Object.assign({ Location: 'https://www.googleapis.com/upload/session/' + tk }, CORS), body: '' });
  }
  if (u.pathname.startsWith('/upload/session/') && m === 'PUT') {
    const p = pending[u.pathname.split('/').pop()], f = drive.files[p.id] || { id: p.id, name: p.meta.name };
    f.content = req.postData(); f.appProperties = p.meta.appProperties; f.modifiedTime = new Date().toISOString();
    drive.files[p.id] = f;
    return json(route, { id: p.id });
  }
  return json(route, { error: 'unexpected ' + m + ' ' + u.pathname }, 400);
}
const GIS = `window.google={accounts:{oauth2:{initTokenClient:function(c){return {callback:c.callback,requestAccessToken:function(){var s=this;window.__gisAsked=(window.__gisAsked||0)+1;setTimeout(function(){s.callback({access_token:'tok',expires_in:3600});},0);}};},hasGrantedAllScopes:function(){return true;},revoke:function(t,cb){cb&&cb();}}}};`;
let gisLoads = 0;
async function device(h, data) {
  const a = await h.open();
  await a.ctx.route('https://accounts.google.com/gsi/client', r => { gisLoads++; r.fulfill({ status: 200, headers: { 'content-type': 'text/javascript' }, body: GIS }); });
  await a.ctx.route('https://www.googleapis.com/**', googleApis);
  if (data) await a.importFile(JSON.stringify({ exportedAt: '2026-01-01T00:00:00.000Z', db: data }));
  await a.eval(() => { show('lib'); });
  return a;
}
const setId = a => a.eval(() => { GDRIVE_CLIENT_ID = 'test.apps.googleusercontent.com'; _renderDriveSync(); });
async function press(a, sel, accept) {
  a.log.dialogs.length = 0; a.acceptConfirms = !!accept;
  await a.eval(() => { if (!document.getElementById('sc-lib') || !document.getElementById('sc-lib').classList.contains('on')) show('lib'); });
  await a.page.click(sel);
  await a.page.waitForFunction(() => !_syncBusy, null, { timeout: 15000 });
  await a.page.waitForTimeout(150);
  a.acceptConfirms = false;
  return a.log.dialogs.slice();
}
const count = a => a.eval(() => ({ p: DB.pieces.length, m: DB.materials.length, r: DB.recipes.length, t: DB.tests.length, ids: DB.materials.map(x => x.id).sort().join(',') }));
const box = a => a.eval(() => { const b = document.getElementById('drive-sync-box'); return { shown: b.style.display !== 'none', text: b.innerText }; });
const addMat = (a, name) => a.eval(n => { DB.materials.push({ id: 'x-' + n, name: n, cat: 'base', updatedAt: new Date().toISOString() }); save(); _renderDriveSync(); }, name);

(async () => {
  console.log('sync:');
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!/function syncSend\(/.test(src)) { console.log('  - not in this version'); process.exit(0); }
  const h = await H.start(ROOT);
  try {
    const older = JSON.parse(JSON.stringify(FIX)); older.materials = older.materials.slice(0, 3);
    const A = await device(h, FIX), B = await device(h, older);

    // ── по подразбиране: няма раздел, нищо не се тегли от Google ──
    await A.eval(() => { GDRIVE_CLIENT_ID = ''; _renderDriveSync(); }); await B.eval(() => { GDRIVE_CLIENT_ID = ''; _renderDriveSync(); });
    ok('no client id → sync box hidden', !(await box(A)).shown);
    ok('nothing loaded from Google at start', gisLoads === 0 && drive.calls.length === 0, { gisLoads, calls: drive.calls });
    await setId(A); await setId(B);
    ok('client id → box offers "turn on", off by default', /Включи синхронизацията/i.test((await box(A)).text) && !(await A.eval(() => _syncOn())));

    // ── лаптоп: включва и изпраща в празен Drive ──
    await press(A, '#sync-on');
    ok('connect loads Google sign-in only now', gisLoads >= 1 && await A.eval(() => _syncOn()));
    let d = await press(A, '#sync-send');
    const fA = Object.values(drive.files).find(f => f.name === 'glina-state.json');
    ok('first send: no question, file in appDataFolder', d.length === 0 && !!fA, { d, files: Object.keys(drive.files) });
    ok('file = same payload as the archive (db + appVersion)', fA && JSON.parse(fA.content).db.materials.length === FIX.materials.length && JSON.parse(fA.content).appVersion === 'v1.54.0');
    ok('meta: device, total, savedAt', fA && fA.appProperties.device && +fA.appProperties.total > 0 && !!fA.appProperties.savedAt, fA && fA.appProperties);
    ok('status: nothing to send', /Няма неизпратени промени/.test((await box(A)).text), (await box(A)).text);

    // ── телефон: включва, взима ──
    await press(B, '#sync-on');
    d = await press(B, '#sync-take', false);
    ok('take on a never-synced device warns its data is not compared; decline keeps it', d.length === 1 && /Вземи данните от Drive/.test(d[0]) && (await count(B)).m === 3, d);
    const qB = await B.eval(() => { var m = ''; var o = window.confirm; window.confirm = function (s) { m = s; return false; }; syncTake(); return new Promise(r => setTimeout(() => { window.confirm = o; r(m); }, 800)); });
    ok('…and the question says why', /не са сравнени с Drive/.test(qB), qB);
    d = await press(B, '#sync-take', true);
    ok('take: phone now has the laptop data', (await count(B)).ids === (await count(A)).ids, d);
    ok('after take: nothing to send', /Няма неизпратени промени/.test((await box(B)).text));
    d = await press(B, '#sync-take');
    ok('take again: "already have it", no question', d.length === 0);

    // ── телефон: промяна и изпращане (снимане в мазето) ──
    await addMat(B, 'Phone material');
    ok('a save counts as unsent', /1 промяна за изпращане/.test((await box(B)).text), (await box(B)).text);
    d = await press(B, '#sync-send');
    ok('phone sends without a question (it has the latest)', d.length === 0, d);
    ok('previous copy kept in Drive', Object.values(drive.files).some(f => f.name === 'glina-state.prev.json'));
    ok('only main + previous, no pile-up', Object.keys(drive.files).length === 2, Object.values(drive.files).map(f => f.name));

    // ── лаптоп: има своя неизпратена промяна ──
    await addMat(A, 'Laptop edit');
    d = await press(A, '#sync-take', false);
    const qA = await A.eval(() => { var m = ''; var o = window.confirm; window.confirm = function (s) { m = s; return false; }; syncTake(); return new Promise(r => setTimeout(() => { window.confirm = o; r(m); }, 800)); });
    ok('take with unsent change: warns it will be lost; decline keeps it', /1 промяна, която не е изпратена/.test(qA) && (await count(A)).ids.includes('x-Laptop edit'), qA);
    const before = JSON.stringify(drive.files);
    d = await press(A, '#sync-send', false);
    ok('send over a version not taken: asks; decline leaves Drive untouched', d.length === 1 && /не е взело/.test(d[0]) && JSON.stringify(drive.files) === before, d);
    d = await press(A, '#sync-take', true);
    const cA = await count(A);
    ok('take accepted: laptop has the phone material, its own edit replaced', cA.ids.includes('x-Phone material') && !cA.ids.includes('x-Laptop edit'));

    // ── защита от срив ──
    await B.eval(() => { DB.materials = DB.materials.slice(0, 1); DB.pieces = []; DB.recipes = []; DB.tests = []; save(); });
    const before2 = JSON.stringify(drive.files);
    d = await press(B, '#sync-send', false);
    ok('send with far fewer records: asks; decline → Drive untouched', d.length === 1 && JSON.stringify(drive.files) === before2, d);
    await B.eval(() => { _dataCollapsed = true; });
    d = await press(B, '#sync-send', true);
    ok('collapsed data is never sent', JSON.stringify(drive.files) === before2);
    await B.eval(() => { _dataCollapsed = false; });

    // ── изключване ──
    B.acceptConfirms = true;
    await B.eval(() => syncDisconnect());
    B.acceptConfirms = false;
    ok('turn off: back to "turn on", local data stays', /Включи синхронизацията/i.test((await box(B)).text) && (await count(B)).m === 1);

    // ── без мрежа ──
    const C = await device(h, null); await setId(C);
    await C.ctx.setOffline(true);
    await press(C, '#sync-on');
    ok('offline: friendly message, stays off', !(await C.eval(() => _syncOn())));
    await C.ctx.setOffline(false);

    // ── обикновеният импорт е същият ──
    const D = await device(h, FIX);
    ok('file import still restores', (await count(D)).m === FIX.materials.length);

    // ── английски ──
    await A.eval(() => { pickLanguage('en'); show('lib'); _renderDriveSync(); });
    const en = (await box(A)).text;
    ok('English: sync box has no Bulgarian', !/[А-Яа-я]/.test(en.replace(/(Phone material|Laptop edit)/g, '')), en);

    ok('no page errors', ![A, B, C, D].some(x => x.log.errors.length), [A, B, C, D].map(x => x.log.errors));
  } finally { await h.stop(); }
  console.log(failed ? `=== FAIL ${failed} (${passed} ok) ===` : `=== OK (${passed}) ===`);
  process.exit(failed ? 1 : 0);
})();
