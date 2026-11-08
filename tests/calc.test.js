// v1.45.0 — фаза 3: калкулатор за количество глина (диапазон, допускания) и за свиване
// в двете посоки; изделие и серия; реално срещу прогноза; нищо не се презаписва само.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };
const near = (a, b, e) => Math.abs(a - b) < (e || 1e-6);
const load = f => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8')).toString('base64'));

(async () => {
  console.log('calc:');
  if (!fs.existsSync(path.join(ROOT, 'calc', 'clay.js'))) { console.log('  - not in this version'); process.exit(0); }
  const C = await load('calc/clay.js');
  const P = Math.PI;
  // ── геометрия: всяка форма, по ръчно сметнати стойности ──
  ok('cylinder Ø10 × в10, wall 5 mm, base 8 mm = π/4·(19·9,2 + 80) cm³', near(C._clayVol('cyl', { h: 10, w: 10, t: 0.5, b: 0.8 }), P / 4 * (19 * 9.2 + 80)));
  ok('box 10 × 20 × в5, wall and base 10 mm = 56·4 + 200 = 424 cm³', near(C._clayVol('box', { h: 5, w: 10, depth: 20, t: 1, b: 1 }), 424));
  ok('bowl Ø20 × в8, wall 6 mm = π(10² + 8²)·0,6 (no thicker base)', near(C._clayVol('bowl', { h: 8, w: 20, t: 0.6, b: 0.6 }), P * 164 * 0.6));
  ok('bowl: a thicker base adds a Ø⅓ disc', near(C._clayVol('bowl', { h: 8, w: 20, t: 0.6, b: 1 }) - C._clayVol('bowl', { h: 8, w: 20, t: 0.6, b: 0.6 }), P * (20 / 6) * (20 / 6) * 0.4));
  ok('plate Ø25 × в3: base Ø15 × 8 mm + frustum rim × 6 mm', near(C._clayVol('plate', { h: 3, w: 25, t: 0.6, b: 0.8 }), P * 7.5 * 7.5 * 0.8 + P * 20 * Math.sqrt(25 + 9) * 0.6));
  ok('slab 20 × 15, 10 mm = 300 cm³', near(C._clayVol('slab', { w: 20, depth: 15, t: 1 }), 300));
  ok('impossible geometry (wall thicker than the radius) → null', C._clayVol('cyl', { h: 10, w: 1, t: 0.6, b: 0.8 }) === null);
  // ── оценка: диапазон, дебелини, плътност, загуби ──
  let e = C._clayEstimate({ shape: 'cyl', h: '10', w: '10', wall: '5', base: '8', dens: '2' });
  ok('cylinder with wall, base, density: 420–480 g (density 2,0; losses +5–20 %)', e.lo === 420 && e.hi === 480 && e.mid === 450 && e.assume.some(x => /Загуби/.test(x)) && !e.assume.some(x => /Стена — не е/.test(x)), e);
  let e2 = C._clayEstimate({ shape: 'cyl', h: '10', w: '10' });
  ok('no wall/base/density → a wider range, with the assumptions said', e2.lo < e.lo && e2.hi > e.hi && e2.assume.some(x => /Стена — не е въведена; допуснато 5–8 мм/.test(x)) && e2.assume.some(x => /Дъно — не е въведено/.test(x)) && e2.assume.some(x => /Плътност/.test(x)), e2);
  ok('thicker wall → more clay', C._clayEstimate({ shape: 'cyl', h: 10, w: 10, wall: 8, base: 8, dens: 2 }).lo > e.lo);
  ok('thicker base alone → more clay', C._clayEstimate({ shape: 'cyl', h: 10, w: 10, wall: 5, base: 12, dens: 2 }).lo > e.lo);
  ok('decimal comma and point are the same', JSON.stringify(C._clayEstimate({ shape: 'bowl', h: '7,5', w: '18,5', wall: '6' })) === JSON.stringify(C._clayEstimate({ shape: 'bowl', h: '7.5', w: '18.5', wall: '6' })));
  ok('missing size → names what is missing', JSON.stringify(C._clayEstimate({ shape: 'box', h: 5, w: 10 }).miss) === '["depth"]');
  ok('invalid values refused: text, 0, negative, 500 cm, wall 0,5 mm, density 5', ['abc', '0', '-3', '500'].every(v => C._clayEstimate({ shape: 'cyl', h: v, w: 10 }).err === 'размер') && C._clayEstimate({ shape: 'cyl', h: 10, w: 10, wall: '0,5' }).err === 'стена' && C._clayEstimate({ shape: 'cyl', h: 10, w: 10, dens: 5 }).err === 'плътност');
  ok('a wall too thick for the size → refused, not a made-up number', C._clayEstimate({ shape: 'cyl', h: 3, w: 1.5, wall: 8 }).err === 'геометрия');
  ok('complex shape → manual amount, no estimate invented', (() => { const m = C._clayEstimate({ shape: 'manual', manual: '1200', count: 3 }); return m.manual && m.lo === 1200 && m.hi === 1200 && m.total.lo === 3600 && C._clayEstimate({ shape: 'manual' }).err === 'количество'; })());
  // серия от 40
  let s40 = C._clayEstimate({ shape: 'slab', w: 4, depth: 2, wall: 5, dens: 2, count: 40 });
  ok('series of 40 pendants: per piece and total (×40)', s40.per.lo === s40.lo && s40.total.lo === s40.lo * 40 && s40.total.hi === s40.hi * 40 && s40.count === 40, s40);
  ok('count must be a whole number ≥ 1', ['0', '2,5', 'x'].every(v => C._clayEstimate({ shape: 'cyl', h: 10, w: 10, count: v }).err === 'брой бройки'));
  // ── свиване: части, а не сбор ──
  let sh = C._shrinkCombine({ dry: '6', fire: '5' });
  ok('drying 6 % then firing 5 % → 10,7 % total, not 11 %', near(sh.k, 0.94 * 0.95) && near(sh.total, 10.7) && sh.from === 'parts', sh);
  let fw = C._shrinkForward('10', sh), bk = C._shrinkBack('8,93', sh);
  ok('forward: 10 cm → dry 9,4 → fired 8,93', near(fw.dry, 9.4) && near(fw.fired, 8.93), fw);
  ok('back: want 8,93 cm fired → dry 9,4 → make 10', near(bk.wet, 10, 1e-9) && near(bk.dry, 9.4, 1e-9), bk);
  ok('forward then back returns the start', near(C._shrinkBack(C._shrinkForward(23.7, sh).fired, sh).wet, 23.7));
  ok('only the total: 12 % → ×0,88', near(C._shrinkCombine({ total: '12' }).k, 0.88));
  ok('invalid shrinkage refused: 45 % total, 35 % firing, text', C._shrinkCombine({ total: 45 }).err && C._shrinkCombine({ fire: 35 }).err && C._shrinkCombine({ dry: 'a' }).err);
  ok('nothing entered → null', C._shrinkCombine({}) === null);
  // размери, измерени изпечени/сухи → пластични
  let ef = C._clayEstimate({ shape: 'cyl', h: 8.93, w: 8.93, wall: 5 * 0.893, base: 8 * 0.893, dens: 2, at: 'fired', shrink: sh });
  ok('fired sizes with known shrinkage → the same clay as the made sizes', ef.lo === C._clayEstimate({ shape: 'cyl', h: 10, w: 10, wall: 5, base: 8, dens: 2 }).lo, ef);
  ok('fired sizes, shrinkage unknown → assumed 10–14 % and said so', C._clayEstimate({ shape: 'cyl', h: 9, w: 9, wall: 5, base: 8, dens: 2, at: 'fired' }).assume.some(x => /Свиването не е известно/.test(x)));
  // калибриране
  let cmp = C._clayCompare({ lo: 400, hi: 500 }, '480');
  ok('real 480 g vs 400–500: +30 g, +6,7 %, in range', cmp.diff === 30 && cmp.pct === 6.7 && cmp.inRange, cmp);
  ok('real 380 g → out of range, −70 g', (() => { const c = C._clayCompare({ lo: 400, hi: 500 }, 380); return c.diff === -70 && !c.inRange; })());
  ok('no real amount → no comparison', C._clayCompare({ lo: 400, hi: 500 }, '') === null);

  // ── v1.45.1: частично известно свиване — липсващата съставка не е нула ──
  if (C._shrinkFill) {
    const inv = (d, f) => 1 / ((1 - d / 100) * (1 - f / 100));
    const onlyFire = C._shrinkCombine({ fire: '5' }), onlyDry = C._shrinkCombine({ dry: '6' }), parts = C._shrinkCombine({ dry: 6, fire: 5 }), tot = C._shrinkCombine({ total: 12 });
    let f = C._toWetFactor('bone-dry', onlyFire);
    ok('v1.45.1 dry sizes, only firing known → not ×1: drying assumed 4–8 %, not exact', !f.exact && f.missing === 'dry' && near(f.f[0], inv(4, 0)) && near(f.f[1], inv(8, 0)) && f.f[0] > 1, f);
    f = C._toWetFactor('bone-dry', onlyDry);
    ok('v1.45.1 dry sizes, drying measured → exact 1/(1−d)', f.exact && near(f.f[0], inv(6, 0)) && near(f.f[1], inv(6, 0)), f);
    f = C._toWetFactor('bone-dry', parts);
    ok('v1.45.1 dry sizes, both measured → exact, firing not used', f.exact && near(f.f[0], inv(6, 0)), f);
    f = C._toWetFactor('bone-dry', tot);
    ok('v1.45.1 dry sizes, only the total → the drying share as a range (≤ total), not exact', !f.exact && f.missing === 'split' && near(f.f[0], inv(4, 0)) && near(f.f[1], inv(8, 0)), f);
    f = C._toWetFactor('bisque', parts);
    ok('v1.45.1 bisque sizes, both measured → dry exact up to + 2 % bisque shrinkage; marked approximate', !f.exact && f.missing === 'bisque' && near(f.f[0], inv(6, 0)) && near(f.f[1], inv(6, 2)), f);
    f = C._toWetFactor('bisque', C._shrinkCombine({ dry: 6, fire: 1 }));
    ok('v1.45.1 bisque: the bisque allowance never exceeds the measured firing shrinkage', near(f.f[1], inv(6, 1)), f);
    f = C._toWetFactor('bisque', onlyFire);
    ok('v1.45.1 bisque sizes, only firing known → drying 4–8 % plus bisque allowance, a range', !f.exact && f.missing === 'dry' && near(f.f[0], inv(4, 0)) && near(f.f[1], inv(8, 2)), f);
    f = C._toWetFactor('fired', onlyDry);
    ok('v1.45.1 glaze-fired sizes, only drying known → firing assumed 4–8 %, range', !f.exact && f.missing === 'fire' && near(f.f[0], inv(6, 4)) && near(f.f[1], inv(6, 8)), f);
    f = C._toWetFactor('fired', onlyFire);
    ok('v1.45.1 glaze-fired sizes, only firing known → drying assumed 4–8 %, range (was ×1/(1−f))', !f.exact && f.missing === 'dry' && near(f.f[0], inv(4, 5)) && near(f.f[1], inv(8, 5)) && f.f[0] > inv(0, 5), f);
    ok('v1.45.1 glaze-fired sizes, both measured or the total → exact', C._toWetFactor('fired', parts).exact && near(C._toWetFactor('fired', parts).f[0], inv(6, 5)) && C._toWetFactor('fired', tot).exact);
    ok('v1.45.1 made sizes → ×1 exact; nothing known → null (the default range applies)', C._toWetFactor('wet', null).exact && C._toWetFactor('fired', null) === null);
    const base = { shape: 'cyl', h: 10, w: 10, wall: 5, base: 8, dens: 2 };
    const ew = C._clayEstimate(base), ed = C._clayEstimate(Object.assign({}, base, { at: 'bone-dry', atLabel: 'сухо', shrink: onlyFire }));
    ok('v1.45.1 estimate from dry sizes with only firing known: more clay than at made size, a wider range, said so, flagged approximate', ed.lo > ew.lo && (ed.hi - ed.lo) > (ew.hi - ew.lo) && ed.shrinkApprox && ed.assume.some(x => /сушене не е измерено/.test(x) && /ориентировъчно/.test(x)), ed);
    const edx = C._clayEstimate(Object.assign({}, base, { at: 'bone-dry', atLabel: 'сухо', shrink: parts }));
    ok('v1.45.1 estimate from dry sizes with drying measured: exact scale, not flagged', !edx.shrinkApprox && edx.assume.some(x => /измерено свиване/.test(x)), edx);
    const eb = C._clayEstimate(Object.assign({}, base, { at: 'bisque', atLabel: 'бисквит', shrink: parts }));
    ok('v1.45.1 estimate from bisque sizes: flagged approximate (bisque shrinkage)', eb.shrinkApprox && eb.assume.some(x => /бисквит/.test(x)), eb);
    const ef1 = C._clayEstimate(Object.assign({}, base, { at: 'fired', atLabel: 'изпечено', shrink: onlyDry })), ef2 = C._clayEstimate(Object.assign({}, base, { at: 'fired', atLabel: 'изпечено', shrink: parts }));
    ok('v1.45.1 estimate from glaze-fired sizes: partial → approximate range; both parts → not flagged', ef1.shrinkApprox && ef1.assume.some(x => /изпичане не е измерено/.test(x)) && !ef2.shrinkApprox, [ef1.assume, ef2.assume]);
    const F = C._shrinkFill(onlyDry);
    ok('v1.45.1 forward with only drying: the fired size is a range (firing 4–8 %), not the dry size', near(C._shrinkForward(10, F[0]).fired, 10 * 0.94 * 0.96) && near(C._shrinkForward(10, F[1]).fired, 10 * 0.94 * 0.92) && C._shrinkFill(parts) === null && C._shrinkFill(tot) === null);
  }

  // ── в приложението ──
  const h = await H.start(ROOT);
  try {
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const N = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      await app.page.setViewportSize(vp);
      const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 200);
      await E(() => document.getElementById('splash')?.remove());
      app.acceptConfirms = true;
      let s;
      // библиотека → инструменти
      s = await E(() => { show('lib'); document.getElementById('lib-clay-calc').click(); const on = document.getElementById('mo-clay').classList.contains('on');
        const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event(x.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
        set('cl-shape', 'cyl'); const empty = document.getElementById('cl-qty-out').innerText; set('cl-h', '10'); set('cl-w', '10'); set('cl-wall', '5'); set('cl-base', '8'); set('cl-dens', '2');
        const out = document.getElementById('cl-qty-out').innerText; set('cl-count', '40'); const tot = document.getElementById('cl-qty-out').innerText;
        const apply = document.getElementById('cl-apply-est').style.display; const sh = document.querySelector('#mo-clay .mo-sh').getBoundingClientRect(), over = document.querySelector('#mo-clay .mo-sh').scrollWidth > document.querySelector('#mo-clay .mo-sh').clientWidth + 1;
        return { on, empty, out, tot, apply, w: Math.round(sh.width), over }; });
      ok(`${N} Library → Tools opens the calculator; it computes as you type`, s.on && /Попълни височина/.test(s.empty) && /420–480 г/.test(s.out) && /Изчислено/i.test(s.out), s);
      ok(`${N} 40 pieces: per piece and total; outside a piece nothing to apply`, /на бройка/.test(s.tot) && /Общо за 40 бр\.: 16,8–19,2 кг/.test(s.tot) && s.apply === 'none' && !s.over, s);
      // свиване: ръчно и от тест на маса
      s = await E(() => { const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event(x.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
        moTab('mo-clay', 'shr'); set('cl-mass', ''); set('cl-dry', '6'); set('cl-fire', '5'); set('cl-sh', '10'); const fwd = document.getElementById('cl-shr-out').innerText, note = document.getElementById('cl-src-note').innerText;
        set('cl-dir', 'back'); set('cl-sh', '8,93'); const back = document.getElementById('cl-shr-out').innerText; closeMo('mo-clay'); return { fwd, note, back }; });
      ok(`${N} shrinkage forward: 10 → dry 9,4 → fired 8,9; manual value marked as approximate`, /10 см/.test(s.fwd) && /9,4 см/.test(s.fwd) && /8,9 см/.test(s.fwd) && /Ориентировъчно/i.test(s.note) && /не се събират/.test(s.note), s);
      ok(`${N} shrinkage back: want 8,93 → make 10`, /10 см/.test(s.back) && /Сухо/.test(s.back), s);
      // v1.45.1: частично свиване в инструмента — диапазон, „Частично“, без прилагане на точен размер
      s = await E(() => { openClayCalc(); const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event(x.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
        moTab('mo-clay', 'shr'); set('cl-mass', ''); set('cl-dry', '6'); set('cl-fire', ''); set('cl-total', ''); set('cl-sh', '10'); const out = document.getElementById('cl-shr-out').innerText, note = document.getElementById('cl-src-note').innerText;
        moTab('mo-clay', 'qty'); set('cl-shape', 'cyl'); set('cl-h', '10'); set('cl-w', '10'); set('cl-wall', '5'); set('cl-base', '8'); set('cl-dens', '2'); set('cl-at', 'fired'); const q = document.getElementById('cl-qty-out').innerText;
        moTab('mo-clay', 'shr'); set('cl-fire', '5'); const out2 = document.getElementById('cl-shr-out').innerText; moTab('mo-clay', 'qty'); const q2 = document.getElementById('cl-qty-out').innerText; closeMo('mo-clay'); return { out, note, q, out2, q2 }; });
      ok(`${N} v1.45.1 only drying entered: „Частично“, the fired size is a range (8,6–9 см), labelled approximate`, /Частично/.test(s.note) && /изпичането не е измерено/.test(s.note) && /8,6–9 см/.test(s.out) && /Ориентировъчно/i.test(s.out), s);
      ok(`${N} v1.45.1 fired sizes with only drying → the clay estimate says the shrinkage is approximate; with both — not`, /Ориентировъчно/i.test(s.q) && /изпичане не е измерено/.test(s.q) && !/Ориентировъчно/i.test(s.q2) && /8,9 см/.test(s.out2) && !/–/.test(s.out2.split('\n').find(l => /Изпечено/.test(l)) || ''), s);
      s = await E(() => { const t0 = DB.tests.find(t => t.id === 't-body'); const keep = JSON.stringify(t0.body); t0.body = { shrMarked: 100, shrDry: 94 }; t0.temp = '1220';
        openClayCalc(); const x = document.getElementById('cl-mass'); x.value = 'mat-xi-mass'; x.dispatchEvent(new Event('change', { bubbles: true })); const note = document.getElementById('cl-src-note').innerText; closeMo('mo-clay'); t0.body = JSON.parse(keep); return note; });
      ok(`${N} v1.45.1 a body test with only drying measured → „Частично измерено“, not „Измерено“`, /Частично измерено/i.test(s) && !/^Измерено/i.test(s.trim()), s);
      app.acceptConfirms = false;
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-yellow'); editId = p.id; editKind = 'piece'; openPieceMo(p); const h0 = document.getElementById('pi-h').value; document.getElementById('pi-calc').click();
        const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event(x.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
        moTab('mo-clay', 'shr'); set('cl-total', ''); set('cl-dry', ''); set('cl-fire', '5'); set('cl-dir', 'back'); set('cl-sh', '9'); document.getElementById('cl-apply-size').click();
        const open = document.getElementById('mo-clay').classList.contains('on'), h1 = document.getElementById('pi-h').value; closeMo('mo-clay'); closeMoAsk('mo-piece'); return { h0, h1, open }; });
      app.acceptConfirms = true;
      ok(`${N} v1.45.1 with only one component the start size is not applied (no exact factor invented)`, s.open && s.h0 === s.h1, s);
      // тест на маса при една температура → предложен; при две — избор, без смесване
      s = await E(() => { const t0 = DB.tests.find(t => t.id === 't-body'); t0.body = Object.assign({}, t0.body, { shrMarked: 100, shrDry: 94, shrFired: 89 }); t0.temp = '1220';
        openClayCalc(); const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event('change', { bubbles: true })); };
        set('cl-mass', 'mat-xi-mass'); const src1 = document.getElementById('cl-src').value, dry1 = document.getElementById('cl-dry').value, note1 = document.getElementById('cl-src-note').innerText;
        DB.tests.push(JSON.parse(JSON.stringify(Object.assign({}, t0, { id: 't-body2', temp: '1180', body: Object.assign({}, t0.body, { shrFired: 91 }) }))));
        set('cl-mass', ''); set('cl-mass', 'mat-xi-mass'); const src2 = document.getElementById('cl-src').value, opts = [...document.getElementById('cl-src').options].map(o => o.text), note2 = document.getElementById('cl-src-note').innerText;
        set('cl-src', 't:t-body2'); const dry2 = document.getElementById('cl-fire').value; closeMo('mo-clay'); DB.tests = DB.tests.filter(t => t.id !== 't-body2'); return { src1, dry1, note1, src2, opts, note2, dry2 }; });
      ok(`${N} a mass with a measured body test (one temperature) — offered, marked „измерено“ with date and °C`, s.src1 === 't:t-body' && s.dry1 === '6' && /Измерено/i.test(s.note1) && /1220 °C/.test(s.note1) && /общо 11/.test(s.note1.replace(/,\d/, '')) === false, s);
      ok(`${N} tests at two temperatures — nothing preselected, each listed with its °C; picking one uses only it`, s.src2 === '' && s.opts.some(x => /1180 °C/.test(x)) && s.opts.some(x => /1220 °C/.test(x)) && /различни температури/.test(s.note2) && s.dry2 === '3,2', s);
      // изделие: предложение, без автоматичен запис
      s = await E(() => { show('pieces'); const p = DB.pieces.find(x => x.id === 'p-yellow'); p.size = { h: 9, w: 8, at: 'fired' }; p.wall = 5; p.startMass = 400; p.weight = 330; save(); const before = JSON.stringify(p);
        editId = p.id; editKind = 'piece'; openPieceMo(p); piTab('size'); document.getElementById('pi-calc').click();
        const pre = ['cl-h', 'cl-w', 'cl-wall', 'cl-real', 'cl-at'].map(id => document.getElementById(id).value); const out = document.getElementById('cl-qty-out').innerText;
        const fields = ['pi-h', 'pi-w', 'pi-start-mass', 'pi-weight'].map(id => document.getElementById(id).value); closeMo('mo-clay');
        const same = ['pi-h', 'pi-w', 'pi-start-mass', 'pi-weight'].map(id => document.getElementById(id).value).join() === fields.join(); closeMoAsk('mo-piece');
        return { pre, out, same, unchanged: JSON.stringify(DB.pieces.find(x => x.id === 'p-yellow')) === before }; });
      ok(`${N} from the piece form: prefilled from its sizes (fired), wall and real clay; real vs estimate shown`, s.pre.join('|') === '9|8|5|400|fired' && /Реално/i.test(s.out) && /спрямо средата/.test(s.out), s);
      ok(`${N} opening and closing the calculator changes nothing — not the form, not the record`, s.same && s.unchanged, s);
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-yellow'); editId = p.id; editKind = 'piece'; openPieceMo(p); document.getElementById('pi-calc').click(); document.getElementById('cl-apply-est').click();
        const est = document.getElementById('pi-est').innerText, mid = JSON.stringify(DB.pieces.find(x => x.id === 'p-yellow').clayEst || null); savePiece(); const q = DB.pieces.find(x => x.id === 'p-yellow');
        openPieceDet(q.id); const det = document.getElementById('det-piece').textContent; closeDet('det-piece'); return { est, mid, ce: q.clayEst, sm: q.startMass, w: q.weight, size: q.size, det }; });
      ok(`${N} „Запази прогнозата“ only puts it in the form; „Запази“ stores it next to — not over — the real clay and the weight`, /Прогноза/.test(s.est) && s.mid === 'null' && s.ce && s.ce.lo > 0 && s.ce.shape && s.sm === 400 && s.w === 330 && s.size.h === 9, s);
      ok(`${N} the detail shows the estimate and the real amount with the difference`, /Прогноза глина/.test(s.det) && /Начална глина\s*400 г · [+−-]?\d/.test(s.det) && /спрямо средата/.test(s.det), s.det.slice(0, 400));
      // начални размери от желани крайни — само с бутон и с въпрос
      app.acceptConfirms = false;
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-yellow'); editId = p.id; editKind = 'piece'; openPieceMo(p); document.getElementById('pi-calc').click();
        const set = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event(x.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
        moTab('mo-clay', 'shr'); set('cl-total', '12'); set('cl-dir', 'back'); set('cl-sh', '9'); set('cl-sw', '8'); document.getElementById('cl-apply-size').click();
        const kept = [document.getElementById('pi-h').value, document.getElementById('pi-w').value]; return kept; });
      ok(`${N} applying start sizes over existing ones asks first — declined, the sizes stay`, s.join() === '9,8', s);
      app.acceptConfirms = true;
      s = await E(() => { document.getElementById('cl-apply-size').click(); const v = [document.getElementById('pi-h').value, document.getElementById('pi-w').value, document.getElementById('pi-size-at').value]; closeMoAsk('mo-piece'); return v; });
      ok(`${N} accepted → 9 / 0,88 = 10,2 and 8 / 0,88 = 9,1 cm at „Сурово“ (the form only, until „Запази“)`, s.join('|') === '10,2|9,1|wet', s);
      // серия: на бройка и общо; отделянето пренася прогнозата
      s = await E(() => { const se = findSeries('se-plates'); se.clayEst = { lo: 900, hi: 1100, shape: 'plate' }; se.startMass = 1000; save(); openSeriesDet('se-plates'); const t = document.getElementById('det-series').textContent;
        editId = se.id; editKind = 'series'; openPieceMo(se); document.getElementById('pi-calc').click(); const cnt = document.getElementById('cl-count').value; closeMo('mo-clay'); closeMoAsk('mo-piece');
        curSeries = 'se-plates'; openSplitMo([]); document.getElementById('sp-count').value = 1; document.getElementById('sp-name').value = 'С прогноза'; saveSplit(); const sp = DB.pieces.find(p => p.name === 'С прогноза');
        return { t, cnt, sp: sp && sp.clayEst, n: _seriesTotal(se) }; });
      ok(`${N} series: estimate per piece and total for the count; the calculator starts with the count`, /Прогноза глина \(бройка\)\s*900–1 100 г · общо за 10: 9–11 кг/.test(s.t) && s.cnt === String(s.n), s);
      ok(`${N} a split piece carries the series estimate (per piece)`, s.sp && s.sp.lo === 900, s);
      // чернова пази прогнозата; празна редакция пази всичко
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-yellow'); const b = JSON.stringify(p); editId = p.id; editKind = 'piece'; openPieceMo(p); savePiece(); const a = JSON.parse(JSON.stringify(DB.pieces.find(x => x.id === 'p-yellow'))), o = JSON.parse(b); delete a.updatedAt; delete o.updatedAt; return JSON.stringify(a) === JSON.stringify(o); });
      ok(`${N} an unchanged edit keeps the estimate and everything else`, s, s);
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-yellow'); editId = p.id; editKind = 'piece'; openPieceMo(p); document.querySelector('#pi-est .rd-link').click(); savePiece(); return 'clayEst' in DB.pieces.find(x => x.id === 'p-yellow'); });
      ok(`${N} „Махни прогнозата“ + „Запази“ removes only the estimate`, s === false, s);
      ok(`${N} no page errors`, !app.log.errors.length, app.log.errors);
      await app.close();
    }
    // ── реалните архиви: старите записи се отварят; калкулаторът тръгва от тях ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      console.log('  ' + f + ':');
      const s = await a2.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB); let n = 0, outs = 0;
        DB.pieces.concat(DB.series || []).forEach(p => { editId = p.id; editKind = (DB.series || []).indexOf(p) >= 0 ? 'series' : 'piece'; openPieceMo(p); document.getElementById('pi-calc').click(); n++; if (document.getElementById('cl-qty-out').innerText.trim()) outs++; closeMo('mo-clay'); closeMo('mo-piece'); });
        const ms = DB.materials.filter(m => m.cat === 'clays' || m.cat === 'mass').length; openClayCalc(); const opts = document.getElementById('cl-mass').options.length - 1; closeMo('mo-clay');
        return { n, outs, same: b0 === JSON.stringify(DB), ms, opts }; });
      ok('  every piece and series opens the calculator from its own fields (' + s.n + '); nothing written', s.same && s.n > 0 && s.outs === s.n, s);
      ok('  every clay and mass is offered for shrinkage', s.opts <= s.ms && s.opts > 0, s);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
