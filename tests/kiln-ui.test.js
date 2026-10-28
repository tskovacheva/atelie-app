// Kiln-loading prototype (kiln-v0.html) in real Chromium at phone size:
// add pieces, place them, drag, confirm, corrections, Глина archive import,
// export/import, reload. Optional screenshots: KILN_SHOTS=<dir>.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(ROOT, 'kiln-v0.html'))) { console.log('kiln-ui: - no kiln-v0.html in this version'); process.exit(0); }
const SHOTS = process.env.KILN_SHOTS;

let failed = 0, passed = 0;
const ok = (name, cond, info) => { if (cond) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + (info ? '\n       ' + info : '')); } };

(async () => {
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const url = 'http://127.0.0.1:' + srv.address().port + '/kiln-v0.html';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: false, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('dialog', d => { errors.push('dialog: ' + d.message()); d.dismiss(); });
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errors.push(m.text()); });
  const st = () => page.evaluate(() => window.__kiln.S());
  const shot = async n => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: true }); };

  console.log('kiln-ui:');
  await page.goto(url);
  let S = await st();
  ok('opens with one bisque run and one level', S.runs.length === 1 && S.runs[0].levels.length === 1 && S.runs[0].type === 'bisque');
  ok('opens on the plan with the kiln warning', await page.locator('text=предполагаеми').count() === 1);

  // Pieces.
  await page.click('nav button[data-id=pieces]');
  const add = async (o) => {
    await page.fill('#np-name', o.name); await page.fill('#np-clay', o.clay);
    if (o.rect) { await page.selectOption('#np-shape', 'rect'); await page.fill('#np-w', String(o.w)); await page.fill('#np-depth', String(o.depth)); }
    else await page.fill('#np-d', String(o.d));
    await page.fill('#np-h', String(o.h)); await page.fill('#np-qty', String(o.qty || 1));
    await page.click('[data-act=addPiece]');
  };
  await add({ name: 'Купа', clay: 'PRNF Black', d: 12, h: 8, qty: 4 });
  await add({ name: 'Ваза', clay: 'Xi Beach', d: 10, h: 18 });
  await add({ name: 'Плочка', clay: 'S&G 933', rect: true, w: 15, depth: 10, h: 1 });
  S = await st();
  const r = () => S.runs.find(x => x.id === S.cur);
  ok('6 pieces, numbered 1–6', r().pieces.map(p => p.no).join() === '1,2,3,4,5,6', r().pieces.map(p => p.no).join());
  ok('qty 4 → names /1../4', r().pieces.slice(0, 4).every((p, i) => p.name === 'Купа /' + (i + 1)));
  ok('rect piece kept its shape', r().pieces[5].shape === 'rect' && r().pieces[5].w === 15);
  await shot('1-pieces');

  // Place on level 1 (posts 10 cm above → space 10): the 18 cm vase must stay out.
  await page.click('nav button[data-id=plan]');
  ok('a single level has no posts above (room to the ceiling)', await page.locator('select[data-b$="|postH|n"]').count() === 0);
  await page.click('[data-act=addLevel]');
  S = await st();
  await page.click('.tabs2 [data-act=lvl][data-id="' + r().levels[0].id + '"]');
  await page.selectOption('select[data-b$="|postH|n"]', '10');
  await page.click('[data-act=placeAll]');
  S = await st();
  const L1 = r().levels[0].id;
  ok('placeAll puts the 5 low pieces on level 1', r().pieces.filter(p => p.level === L1).length === 5, JSON.stringify(r().pieces.map(p => p.level)));
  ok('the tall vase is left unplaced', r().pieces.find(p => p.name === 'Ваза').level === null);
  const chk = await page.evaluate(() => { const S = window.__kiln.S(); return window.__kiln.G.check(S, S.runs.find(x => x.id === S.cur)); });
  ok('placed pieces have no errors', Object.values(chk.byP).flat().filter(x => x.sev === 'err').length === 0, JSON.stringify(chk.byP));

  // Second level for the vase.
  ok('two levels', r().levels.length === 2);
  await page.click('.tabs2 [data-act=lvl][data-id="' + r().levels[1].id + '"]');
  await page.click('.tray [data-act=place]');
  S = await st();
  const L2 = r().levels[1].id;
  const vase = r().pieces.find(p => p.name === 'Ваза');
  ok('vase placed on the top level', vase.level === L2);
  const chk2 = await page.evaluate(() => { const S = window.__kiln.S(); return window.__kiln.G.check(S, S.runs.find(x => x.id === S.cur)); });
  // stack: 5 + 1.6 + 10 + 1.6 = 18.2 → space 45 − 18.2 = 26.8
  ok('top level space 26.8 cm', Math.abs(chk2.stack[1].space - 26.8) < 1e-9, String(chk2.stack[1].space));
  await shot('2-level2');

  // Drag the vase 5 cm to the right.
  const before = { x: vase.x, y: vase.y };
  const g = page.locator('#top g[data-drag=piece]').first();
  await page.locator('#top').scrollIntoViewIfNeeded();
  const box = await g.boundingBox();
  const svgBox = await page.locator('#top').boundingBox();
  const cmPx = svgBox.width / (2 * (25 + 4));
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + cmPx * 2.5, box.y + box.height / 2, { steps: 4 });
  await page.mouse.move(box.x + box.width / 2 + cmPx * 5, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  S = await st();
  const v2 = r().pieces.find(p => p.name === 'Ваза');
  ok('drag moves the piece ~5 cm right', Math.abs(v2.x - before.x - 5) <= 0.5 && Math.abs(v2.y - before.y) <= 0.5, JSON.stringify([before, { x: v2.x, y: v2.y }]));
  ok('no correction logged while planning', r().corrections.length === 0);

  // Confirm, then a move is logged.
  await page.click('[data-act=state][data-id=loaded]');
  S = await st();
  ok('state loaded with confirmedAt', r().state === 'loaded' && !!r().confirmedAt);
  const g2 = page.locator('#top g[data-drag=piece]').first();
  await page.locator('#top').scrollIntoViewIfNeeded();
  const b2 = await g2.boundingBox();
  await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2); await page.mouse.down();
  await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2 + cmPx * 3, { steps: 5 }); await page.mouse.up();
  S = await st();
  ok('move after confirmation → correction with old and new', r().corrections.some(c => c.field === 'y' && c.old !== c.new), JSON.stringify(r().corrections));

  // After the firing.
  await page.click('nav button[data-id=after]');
  await page.locator('select[data-b$="|result"]').first().selectOption('Пукнато');
  await page.fill('input[data-b^="level:"][data-b$="|cone"] >> nth=0', '06');
  await page.press('input[data-b^="level:"][data-b$="|cone"] >> nth=0', 'Tab');
  ok('focus moves on to the next field after a re-render', await page.evaluate(() => (document.activeElement.dataset.b || '').endsWith('|coneResult')));
  S = await st();
  ok('result and cone saved', r().pieces.some(p => p.result === 'Пукнато') && r().levels.some(L => L.cone === '06'));
  ok('cone change after confirmation is logged', r().corrections.some(c => c.field === 'cone'));
  await shot('3-after');

  // Summary.
  await page.click('nav button[data-id=file]');
  const sum = await page.locator('#sum').innerText();
  ok('summary lists levels top-down with positions', /НИВО 2 \(горе\)[\s\S]*#5 Ваза[\s\S]*НИВО 1/.test(sum) && /ч, \d+ см от центъра|в центъра/.test(sum), sum.slice(0, 300));

  // Export → import into a fresh browser profile.
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=export]')]);
  const tmp = path.join(require('os').tmpdir(), 'kiln-export.json');
  await dl.saveAs(tmp);
  const exp = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  ok('export has kind and data', exp.kind === 'glina-kiln-v0' && exp.data.runs.length === 1);
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push('p2: ' + e.message));
  await p2.goto(url); await p2.click('nav button[data-id=file]');
  await p2.setInputFiles('input[data-ch=importFile]', tmp);
  await p2.waitForTimeout(300);
  const S2 = await p2.evaluate(() => window.__kiln.S());
  ok('import adds the run next to the empty one and opens it', S2.runs.length === 2 && S2.runs.find(x => x.id === S2.cur).pieces.length === 6);
  await ctx2.close();

  // Reload keeps everything.
  await page.reload();
  const S3 = await st();
  ok('reload keeps the run', S3.runs[0].pieces.length === 6 && S3.runs[0].state === 'loaded');

  // Refire copies the layout, clears results.
  await page.click('nav button[data-id=file]');
  await page.click('[data-act=refire]');
  S = await st();
  ok('refire: new planned run with the same layout, no results', S.runs.length === 2 && r().state === 'planned' && r().refireOf && r().pieces.filter(p => p.level).length === 6 && r().pieces.every(p => !p.result));

  // Глина archive import (real archive if present, else the representative fixture).
  const priv = path.join(__dirname, 'fixtures', 'private', 'real.json');
  const arch = fs.existsSync(priv) ? priv : path.join(__dirname, 'fixtures', 'representative.json');
  await page.click('nav button[data-id=file]');
  await page.click('[data-act=newRun][data-id=bisque]');
  await page.click('nav button[data-id=pieces]');
  await page.setInputFiles('input[data-ch=glinaFile]', arch);
  await page.waitForSelector('[data-act=impAdd]');
  const shown = await page.locator('input[data-ch=impOn]').count();
  const checked = await page.locator('input[data-ch=impOn]:checked').count();
  ok('archive read: unfired pieces suggested (' + checked + ' of ' + shown + ' shown, ' + path.basename(arch) + ')', shown > 0 && checked > 0);
  await shot('4-import');
  await page.click('[data-act=impAdd]');
  S = await st();
  ok('selected archive pieces added with a link back to Глина', r().pieces.length >= checked && r().pieces.every(p => p.ref && p.ref.id));
  await page.click('nav button[data-id=plan]');
  await shot('5-plan-import');

  // Two-tap delete.
  await page.click('nav button[data-id=file]');
  const n0 = (await st()).runs.length;
  await page.click('[data-act=delRun]');
  ok('first tap does not delete', (await st()).runs.length === n0);
  await page.click('[data-act=delRun]');
  ok('second tap deletes', (await st()).runs.length === n0 - 1);

  ok('no page errors or dialogs', errors.length === 0, errors.join(' | '));
  await browser.close(); srv.close();
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
