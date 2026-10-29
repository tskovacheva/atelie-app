// Kiln-loading prototype (kiln-v0.html) in real Chromium at phone size.
// One model, three depths: levels + photo; a rough place on the map (tap, drag,
// or accept the page's suggestion); exact coordinates as an opt-in.
// Also: first-v0 data, settings, corrections, refire, file round trip with
// photos, Глина archive import. Optional screenshots: KILN_SHOTS=<dir>.
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const { chromium } = require('playwright');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(ROOT, 'kiln-v0.html'))) { console.log('kiln-ui: - no kiln-v0.html in this version'); process.exit(0); }
const SHOTS = process.env.KILN_SHOTS;

let failed = 0, passed = 0;
const ok = (name, cond, info) => { if (cond) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + (info ? '\n       ' + info : '')); } };

// A tiny real PNG (8×8, terracotta) for the photo tests.
function png() {
  const w = 8, h = 8, raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) raw.set([184, 111, 82], y * (w * 3 + 1) + 1 + x * 3); }
  const crc = b => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

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
  const errors = [];
  async function newPage() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(String(e.message || e)));
    page.on('dialog', d => { errors.push('dialog: ' + d.message()); d.dismiss(); });
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errors.push(m.text()); });
    return { ctx, page };
  }
  const tmpPng = path.join(os.tmpdir(), 'kiln-test.png'); fs.writeFileSync(tmpPng, png());
  console.log('kiln-ui:');

  // --- data from the first v0 (28.10) ---
  {
    const { ctx, page } = await newPage();
    await page.goto(url);
    const old = { v: 0, kiln: { name: 'Kittec CB 80 Double', shape: 'round', d: 50, h: 45, checked: false, ref: '' },
      shelves: [{ id: 'sh-47', name: 'Кръгла Ø47', shape: 'round', d: 47, t: 1.6, qty: 3 }], postSizes: [5, 10, 15], postD: 4, cur: 'run-a',
      runs: [{ id: 'run-a', name: 'стар', date: '2026-10-28', type: 'bisque', gap: 0, clear: 0.5, floorH: 5, state: 'planned', levels: [{ id: 'lv-a', shelf: 'sh-47', postH: 10, posts: [] }],
        pieces: [{ id: 'p1', no: 1, name: 'Купа', shape: 'round', d: 12, h: 8, level: 'lv-a', x: 5, y: 6 }, { id: 'p2', no: 2, name: 'Чаша', shape: 'round', d: 8, h: 9, level: null, x: 0, y: 0 }], nextNo: 3, corrections: [] }] };
    await page.evaluate(o => localStorage.setItem('glina.kiln.v0', JSON.stringify(o)), old);
    await page.reload();
    const S = await page.evaluate(() => window.__kiln.S());
    const r = S.runs[0];
    ok('first-v0 data: kiln guess 50×45 → official 51×38', S.kiln.d === 51 && S.kiln.h === 38 && S.kiln.checked);
    ok('first-v0 data: level shelf → shelves list, place kept', r.levels[0].shelves.length === 1 && r.levels[0].shelves[0].ref === 'sh-47' && r.pieces[0].x === 5);
    ok('first-v0 data: unplaced piece has no place (not 0,0)', r.pieces[1].x === null && r.pieces[1].y === null);
    ok('first-v0 data: opens in visual mode, gaps from settings exist', r.mode === 'visual' && S.gaps.glaze === 1);
    await ctx.close();
  }

  const { ctx, page } = await newPage();
  const st = () => page.evaluate(() => window.__kiln.S());
  const shot = async n => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: true }); };
  let S;
  const r = () => S.runs.find(x => x.id === S.cur);
  await page.goto(url);
  S = await st();
  ok('fresh: Kittec 51×38, 79 l, 3.6 kW, checked; opens on Изделия when empty', S.kiln.d === 51 && S.kiln.h === 38 && S.kiln.volume === 79 && S.kiln.power === 3.6 && S.kiln.checked && /^изделия/i.test(await page.locator('nav button.on').innerText()));
  ok('fresh: no "unchecked kiln" warning', await page.locator('text=не са проверени').count() === 0);

  // Pieces.
  await page.click('nav button[data-id=pieces]');
  const add = async (o) => {
    await page.fill('#np-name', o.name); await page.fill('#np-clay', o.clay);
    if (o.rect) { await page.selectOption('#np-shape', 'rect'); await page.fill('#np-w', String(o.w)); await page.fill('#np-depth', String(o.depth)); }
    else if (o.d) await page.fill('#np-d', String(o.d));
    if (o.h) await page.fill('#np-h', String(o.h));
    await page.fill('#np-qty', String(o.qty || 1));
    await page.click('[data-act=addPiece]');
  };
  await add({ name: 'Купа', clay: 'PRNF Black', d: 12, h: 8, qty: 4 });
  await add({ name: 'Ваза', clay: 'Xi Beach', d: 10, h: 18 });
  await add({ name: 'Плочка', clay: 'S&G 933', rect: true, w: 15, depth: 10, h: 1 });
  await add({ name: 'Без мерки', clay: 'MARTE Red' });
  S = await st();
  ok('7 pieces; new ones have no place', r().pieces.length === 7 && r().pieces.every(p => p.x === null && p.y === null));

  // ---- plan: levels first (quick), map always there ----
  await page.click('nav button[data-id=plan]');
  ok('tabs in working order: Пещ, Изделия, План, След, Файл', (await page.locator('nav button').allInnerTexts()).map(x => x.split(/\s|\(/)[0].toLowerCase()).join(',') === 'пещ,изделия,план,след,файл');
  await page.click('[data-act=addLevel]');
  S = await st();
  const L1 = r().levels[0].id, L2 = r().levels[1].id;
  await page.click('.tabs2 [data-act=lvl][data-id="' + L1 + '"]');
  const ph = 'input[data-b="level:' + L1 + '|postH|n"]';
  await page.fill(ph, '12.3'); await page.press(ph, 'Tab'); await page.waitForTimeout(80);
  ok('any height accepted; hint says it cannot be built from the posts', (await st()).runs[0].levels[0].postH === 12.3 && await page.locator('text=не се сглобява от наличните').count() === 1);
  await page.click('[data-act=addPostSize][data-id="12.3"]');
  S = await st();
  ok('"+ Имам подпора 12,3 см" adds it to the posts; hint becomes "една подпора"', S.postSizes.includes(12.3) && await page.locator('text=една подпора').count() >= 1);
  await page.fill(ph, '20'); await page.press(ph, 'Tab'); await page.waitForTimeout(80);
  ok('20 cm → "= 15 + 5"', await page.locator('text== 15 + 5').count() === 1);
  await page.fill(ph, '10'); await page.press(ph, 'Tab'); await page.waitForTimeout(80);
  const vase = () => r().pieces.find(p => p.name === 'Ваза');
  const vaseRow = page.locator('.it', { hasText: 'Ваза' });
  ok('the tall vase shows why it does not fit level 1', /по-високо от мястото на ниво 1: 18 \+ 0\.5 см > 10 см/.test(await vaseRow.innerText()));
  await page.click('.it:has-text("Ваза") button[data-act=assign]');
  S = await st();
  ok('tapping "→ 1" does not put it there', vase().level === null);
  for (const n of ['Купа /1', 'Купа /2', 'Без мерки']) await page.click('.it:has-text("' + n + '") button[data-act=assign]');
  S = await st();
  ok('one tap → on level 1, no place recorded', r().pieces.filter(p => p.level === L1).length === 3 && r().pieces.filter(p => p.level === L1).every(p => p.x === null));
  ok('map shows suggested places (dashed) for the pieces with a base', await page.locator('svg#top g[data-gx]').count() === 2);
  const cap = await page.locator('.cap').first().innerText();
  ok('level answer: height ✓, shelf ✓, one without sizes', /✓ Височина: място 10 см/.test(cap) && /✓ Плоча: основите заемат \d+ %/.test(cap) && /1 без височина/.test(cap), cap);
  await page.fill(ph, '7'); await page.press(ph, 'Tab'); await page.waitForTimeout(80);
  const cap2 = await page.locator('.cap').first().innerText();
  ok('too low: "не хваща с 1,5 см", side view marks +1,5', /✗ Височина[\s\S]*не хваща с 1,5 см/.test(cap2) && await page.locator('svg text', { hasText: '+1,5' }).count() >= 1, cap2);
  await page.fill(ph, '10'); await page.press(ph, 'Tab'); await page.waitForTimeout(80);
  { const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act=photo]')]); await fc.setFiles(tmpPng); }
  await page.waitForFunction(() => document.querySelector('img[data-photo]') && document.querySelector('img[data-photo]').src.startsWith('blob:'));
  S = await st();
  ok('photo of the level saved apart from the record', r().levels[0].photos.length === 1 && r().levels[0].photos[0].stage === 'loading' && !JSON.stringify(S).includes('data:image'));
  ok('no coordinate fields unless "Точни мерки" is on', await page.locator('input[data-b$="|x|n"]').count() === 0 && await page.locator('input[data-ch=shF]').count() === 0);
  await shot('1-levels');

  // ---- map: tap, drag a suggestion, accept suggestions ----
  await page.locator('svg#top').evaluate(e => e.scrollIntoView({ block: 'center' }));
  let sb = await page.locator('svg#top').boundingBox();
  const m = 25.5 + 4, cm = sb.width / (2 * m);
  const at = (x, y) => [sb.x + sb.width / 2 + x * cm, sb.y + sb.height / 2 - y * cm];
  const k1id = r().pieces.find(x => x.name === 'Купа /1').id;
  const g = page.locator('svg#top g[data-id="' + k1id + '"]');
  const gx = +(await g.getAttribute('data-gx')), gy = +(await g.getAttribute('data-gy'));
  let p = at(gx, gy);
  await page.mouse.move(p[0], p[1]); await page.mouse.down();
  await page.mouse.move(p[0] - 2 * cm, p[1], { steps: 3 }); await page.mouse.move(p[0] - 4 * cm, p[1], { steps: 3 }); await page.mouse.up();
  S = await st();
  const k1 = () => r().pieces.find(x => x.id === k1id);
  ok('dragging a suggestion records the place', Math.abs(k1().x - (gx - 4)) <= 0.6 && Math.abs(k1().y - gy) <= 0.6, JSON.stringify([gx, gy, k1().x, k1().y]));
  await page.click('[data-act=acceptSug]');
  S = await st();
  ok('"Запиши предложените места" records the rest', r().pieces.find(x => x.name === 'Купа /2').x !== null && r().pieces.find(x => x.name === 'Без мерки').x === null);
  await page.click('.tabs2 [data-act=lvl][data-id="' + L2 + '"]');
  await page.click('.it:has-text("Ваза") .b[data-act=sel]');
  await page.locator('svg#top').evaluate(e => e.scrollIntoView({ block: 'center' }));
  sb = await page.locator('svg#top').boundingBox();
  p = at(10, 10);
  await page.mouse.click(p[0], p[1]);
  S = await st();
  ok('select, then tap the map → on that level, about there', vase().level === L2 && Math.abs(vase().x - 10) <= 0.6 && Math.abs(vase().y - 10) <= 0.6, JSON.stringify([vase().level, vase().x, vase().y]));
  ok('place shown as a zone, not centimetres', await page.locator('text=ръб, 2 ч').count() + await page.locator('text=среда, 2 ч').count() > 0);
  await shot('2-map');
  // halves
  await page.click('.tabs2 [data-act=lvl][data-id="' + L1 + '"]');
  await page.click('[data-act=shPreset][data-id=halves]');
  S = await st();
  ok('two halves on a level', r().levels[0].shelves.length === 2);
  const chk = await page.evaluate(() => { const S = window.__kiln.S(); return window.__kiln.G.check(S, S.runs.find(x => x.id === S.cur)); });
  ok('pieces across the joint are warnings, not errors', Object.values(chk.byP).flat().every(x => x.kind !== 'out'), JSON.stringify(chk.byP));
  await page.click('[data-act=shPreset][data-id=full]');

  // ---- precise (opt-in) ----
  await page.check('input[data-ch=precise]');
  await page.waitForTimeout(80);
  await page.click('.it:has-text("Купа /1") .b[data-act=sel]');
  await page.fill('input[data-b="piece:' + k1id + '|x|n"]', '-12'); await page.press('input[data-b="piece:' + k1id + '|x|n"]', 'Tab'); await page.waitForTimeout(80);
  await page.fill('input[data-b="piece:' + k1id + '|y|n"]', '3'); await page.press('input[data-b="piece:' + k1id + '|y|n"]', 'Tab'); await page.waitForTimeout(80);
  await page.selectOption('select[data-ch=step]', '5');
  await page.click('[data-act=nudge][data-k=piece][data-dx="1"]');
  S = await st();
  ok('precise: typed x/y, then → by 5 cm', k1().x === -7 && k1().y === 3, JSON.stringify([k1().x, k1().y]));
  await page.click('[data-act=sel][data-id=""]');
  await page.locator('svg#top').evaluate(e => e.scrollIntoView({ block: 'center' }));
  sb = await page.locator('svg#top').boundingBox();
  await page.locator('svg#top g[data-drag=post][data-id="0"]').click();
  await page.waitForTimeout(100);
  await page.locator('svg#top').evaluate(e => e.scrollIntoView({ block: 'center' }));
  sb = await page.locator('svg#top').boundingBox();
  await page.waitForSelector('text=Подпора 1');
  // a spot no piece can be on: just outside the shelf, inside the chamber
  p = at(-24.5, 0); await page.mouse.click(p[0], p[1]);
  S = await st();
  const q0 = r().levels[0].posts[0];
  ok('precise: tap a post, tap a place → post moved', Math.abs(q0.x + 24.5) <= 0.6 && Math.abs(q0.y) <= 0.6, JSON.stringify(q0));
  await shot('3-precise');

  // ---- settings: gaps ----
  await page.click('nav button[data-id=kiln]');
  await page.fill('input[data-b="gaps|glaze|n"]', '2'); await page.press('input[data-b="gaps|glaze|n"]', 'Tab'); await page.waitForTimeout(80);
  await page.click('nav button[data-id=plan]');
  await page.selectOption('select[data-b="run|type"]', 'glaze');
  S = await st();
  ok('gaps are settings: type change takes the glaze gap from settings', r().gap === 2);
  await page.fill('input[data-b="run|gap|n"]', '0.7'); await page.press('input[data-b="run|gap|n"]', 'Tab'); await page.waitForTimeout(80);
  await page.selectOption('select[data-b="run|type"]', 'bisque');
  S = await st();
  ok('a gap changed by hand stays when the type changes', r().gap === 0.7);

  // ---- confirm, corrections, after ----
  await page.click('[data-act=state][data-id=loaded]');
  await page.click('.it:has-text("Купа /1") .b[data-act=sel]');
  await page.click('[data-act=nudge][data-k=piece][data-dy="1"]');
  S = await st();
  ok('after confirmation a move is logged', r().corrections.some(c => c.field === 'y'));
  await page.click('[data-act=state][data-id=completed]');
  await page.click('nav button[data-id=after]');
  await page.locator('select[data-b$="|result"]').first().selectOption('Пукнато');
  const cone = 'input[data-b^="level:"][data-b$="|cone"] >> nth=0';
  await page.fill(cone, '06'); await page.press(cone, 'Tab'); await page.waitForTimeout(80);
  // type into a field and tap "photo" straight away — the photo must not be lost
  await page.fill('input[data-b="run|notes"], textarea[data-b="run|notes"]', 'бележка');
  { const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-act=photo]').first().click()]); await fc.setFiles(tmpPng); }
  await page.waitForFunction(() => { const S = window.__kiln.S(), r = S.runs.find(x => x.id === S.cur); return r.levels[r.levels.length - 1].photos.length > 0; }, null, { timeout: 5000 }).catch(() => {});
  await page.fill('input[data-b="run|program"]', 'P2 бисквит'); await page.press('input[data-b="run|program"]', 'Tab'); await page.waitForTimeout(80);
  S = await st();
  const top = r().levels[r().levels.length - 1];
  ok('after: result, cone, photo marked "after" (taken right after typing)', r().pieces.some(x => x.result === 'Пукнато') && top.cone === '06' && top.photos.some(x => x.stage === 'after') && r().notes === 'бележка', JSON.stringify(top));
  await shot('4-after');
  { const n0 = top.photos.length; const btn = page.locator('[data-act=delPhoto]').first(); await btn.click(); await btn.click();
    S = await st(); const t2 = r().levels[r().levels.length - 1];
    ok('a photo is removed with two taps', t2.photos.length === n0 - 1);
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-act=photo]').first().click()]); await fc.setFiles(tmpPng);
    await page.waitForFunction(n => { const S = window.__kiln.S(), r = S.runs.find(x => x.id === S.cur); return r.levels[r.levels.length - 1].photos.length === n; }, n0);
    S = await st(); }

  // ---- summary ----
  await page.click('nav button[data-id=file]');
  const sum = await page.locator('#sum').innerText();
  ok('summary: levels top-down, zones, photos count', /НИВО 2 \(горе\)[\s\S]*Ваза[\s\S]*НИВО 1/.test(sum) && /ръб|среда|център/.test(sum) && /снимки: 1/.test(sum), sum.slice(0, 400));

  // ---- refire ----
  const orig = r();
  await page.click('[data-act=refire]');
  S = await st();
  const n = r();
  ok('refire: same configuration (levels, shelves, posts, places, program)', n.levels.length === orig.levels.length && JSON.stringify(n.levels.map(L => [L.shelves, L.posts, L.postH])) === JSON.stringify(orig.levels.map(L => [L.shelves, L.posts, L.postH])) &&
    JSON.stringify(n.pieces.map(x => [x.no, x.x, x.y])) === JSON.stringify(orig.pieces.map(x => [x.no, x.x, x.y])) && n.program === 'P2 бисквит');
  ok('refire: no observations carried over', n.state === 'planned' && !n.confirmedAt && !n.endedAt && !n.corrections.length && !n.peak && !n.notes &&
    n.pieces.every(x => !x.result && !x.note) && n.levels.every(L => !L.cone && !L.coneResult && !L.note && !L.photos.length) && n.refireOf === orig.id);

  // ---- file round trip with photos ----
  await page.click('nav button[data-id=file]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=export]')]);
  const tmp = path.join(os.tmpdir(), 'kiln-export.json');
  await dl.saveAs(tmp);
  const exp = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  ok('export: data and both photos', exp.kind === 'glina-kiln-v0' && exp.data.runs.length === 2 && Object.keys(exp.photos).length === 2);
  {
    const b = await newPage();
    await b.page.goto(url); await b.page.click('nav button[data-id=file]');
    await b.page.setInputFiles('input[data-ch=importFile]', tmp);
    await b.page.waitForFunction(() => window.__kiln.S().runs.length === 3);
    const ids = Object.keys(exp.photos);
    const got = await b.page.evaluate(ids => Promise.all(ids.map(id => window.__kiln.PH.get(id).then(x => !!x && x.size > 0))), ids);
    const S2 = await b.page.evaluate(() => window.__kiln.S());
    ok('import: runs added, photos restored, settings taken (empty device)', got.every(Boolean) && S2.gaps.glaze === 2, JSON.stringify(got));
    await b.ctx.close();
  }

  // ---- Глина archive ----
  const pdir = path.join(__dirname, 'fixtures', 'private');
  const reals = fs.existsSync(pdir) ? fs.readdirSync(pdir).filter(f => /^real.*\.json$/.test(f)).sort() : [];
  const priv = reals.length ? path.join(pdir, reals[reals.length - 1]) : '';
  const arch = priv ? priv : path.join(__dirname, 'fixtures', 'representative.json');
  await page.click('[data-act=newRun][data-id=bisque]');
  await page.click('nav button[data-id=pieces]');
  await page.setInputFiles('input[data-ch=glinaFile]', arch);
  await page.waitForSelector('[data-act=impAdd]');
  const checked = await page.locator('input[data-ch=impOn]:checked').count();
  ok('archive read: unfired pieces suggested (' + checked + ', ' + path.basename(arch) + ')', checked > 0);
  await page.click('[data-act=impAdd]');
  S = await st();
  ok('archive pieces added with a link back to Глина, no place', r().pieces.length >= checked && r().pieces.every(x => x.ref && x.ref.id && x.x === null));
  await page.click('nav button[data-id=plan]');
  await page.click('.it button[data-act=assign] >> nth=0');
  S = await st();
  ok('archive piece without sizes goes on a level', r().pieces.filter(x => x.level).length === 1);
  await shot('5-archive');

  // ---- a real plan from the studio (private, not committed) ----
  const her = path.join(__dirname, 'fixtures', 'private-kiln', 'pech-2026-10-28.json');
  if (fs.existsSync(her)) {
    const b = await newPage();
    await b.page.goto(url); await b.page.click('nav button[data-id=file]');
    await b.page.setInputFiles('input[data-ch=importFile]', her);
    await b.page.waitForFunction(() => window.__kiln.S().runs.length === 2);
    await b.page.click('nav button[data-id=plan]');
    const H = await b.page.evaluate(() => window.__kiln.S());
    const hr = H.runs.find(x => x.id === H.cur);
    await b.page.click('.tabs2 [data-act=lvl][data-id="' + hr.levels[2].id + '"]');
    const c3 = await b.page.locator('.cap').first().innerText();
    ok('studio plan: top level says the 22 cm vessel does not fit by 2,8 cm', /не хваща с 2,8 см/.test(c3), c3);
    ok('studio plan: kiln 51×38 counted as checked', H.kiln.checked === true);
    // „Предложи нива“ върху реалния план: при 4 см отстояние не стига височина
    // и го казва; при 0 см (бисквит) — всичко влиза и се прилага.
    await b.page.click('[data-act=planLevels]');
    const pp = await b.page.locator('.cap', { hasText: 'Предложение' }).innerText();
    ok('studio plan, gap 4: suggestion says how much height is missing', /липсват 2,8 см/.test(pp), pp.slice(0, 300));
    await b.page.click('[data-act=planCancel]');
    await b.page.fill('input[data-b="run|gap|n"]', '0'); await b.page.press('input[data-b="run|gap|n"]', 'Tab'); await b.page.waitForTimeout(80);
    await b.page.click('[data-act=planLevels]');
    const pp2 = await b.page.locator('.cap', { hasText: 'Предложение' }).innerText();
    ok('studio plan, gap 0: everything fits', /✓ Всичко се събира/.test(pp2), pp2.slice(0, 300));
    if (SHOTS) await b.page.screenshot({ path: path.join(SHOTS, '6-proposal.png'), fullPage: true });
    await b.page.click('[data-act=applyPlan]');
    const H2 = await b.page.evaluate(() => window.__kiln.S()), hr2 = H2.runs.find(x => x.id === H2.cur);
    const chk2 = await b.page.evaluate(() => { const S = window.__kiln.S(); return window.__kiln.G.check(S, S.runs.find(x => x.id === S.cur)); });
    ok('studio plan applied: every piece on a level, no height errors', hr2.pieces.every(p => p.level) && !Object.values(chk2.byP).flat().some(x => x.kind === 'tall'), JSON.stringify(hr2.levels.map(L => L.postH)));
    const caps = [];
    for (const L of hr2.levels) { await b.page.click('.tabs2 [data-act=lvl][data-id="' + L.id + '"]'); caps.push(await b.page.locator('.cap').first().innerText()); }
    ok('studio plan applied: every level ✓ on height and shelf', caps.every(c => !/✗/.test(c)), caps.join(' | '));
    if (SHOTS) await b.page.screenshot({ path: path.join(SHOTS, '7-applied.png'), fullPage: true });
    { const cur = hr2.levels[hr2.levels.length - 1]; await b.page.click('.tabs2 [data-act=lvl][data-id="' + cur.id + '"]');
      ok('studio plan: the level shows its pieces on the map', (await b.page.locator('svg#top g[data-drag=piece]').count()) === hr2.pieces.filter(p => p.level === cur.id && p.d).length); }
    await b.ctx.close();
  }

  // ---- two-tap delete ----
  await page.click('nav button[data-id=file]');
  const n0 = (await st()).runs.length;
  await page.click('[data-act=delRun]');
  ok('first tap does not delete', (await st()).runs.length === n0);
  await page.click('[data-act=delRun]');
  ok('second tap deletes', (await st()).runs.length === n0 - 1);
  await page.reload();
  ok('reload keeps everything', (await st()).runs.length === n0 - 1);

  ok('no page errors or dialogs', errors.length === 0, errors.join(' | '));
  await browser.close(); srv.close();
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
