// v1.36.0 — каталогът „Изделия“ (галерия и списък, филтри, серии), снимката в
// детайла (таван, две колони, голям преглед) и „Моето ателие“. Телефон и лаптоп,
// смесена серия, архив, връщане от детайла и частните архиви с реални данни.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };
// Малка снимка (SVG), за да има какво да се покаже и прелиства.
const PH = c => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="' + c + '"/></svg>');
const fix = JSON.parse(FIX);
const oc = fix.pieces.find(p => p.id === 'p-ocarina');
oc.photos = [PH('#8a9')];
(oc.events = oc.events || []).push({ id: 'ev-ph', type: 'photo', date: '2026-10-01', photos: [PH('#c96')] });
const SEED = JSON.stringify(fix);

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('catalog:');
    const app = await h.open({ seed: { atelie_v6: SEED }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof setPcView === 'function'))) { console.log('  - not in this version'); return; }
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('pieces'); });
    const noOverflow = () => E(() => { const m = document.getElementById('main'); return m.scrollWidth <= m.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; });
    const cols = sel => E(s => getComputedStyle(document.querySelector(s)).gridTemplateColumns.split(' ').length, sel);

    // --- телефон ---
    let s = await E(() => ({ n: document.querySelectorAll('#pieces-grid .pc').length, exp: DB.pieces.filter(p => !p.seriesId).length + DB.series.length, view: PC.view, side: getComputedStyle(document.getElementById('pc-side')).display }));
    ok('phone: gallery by default, one record per piece and per series (split pieces under their series)', s.view === 'gal' && s.n === s.exp && s.side === 'none', s);
    ok('phone: gallery has two columns', await cols('#pieces-grid') === 2);
    ok('phone: nothing wider than the screen (gallery)', await noOverflow());
    s = await E(() => { const c = [...document.querySelectorAll('#pieces-grid .pc')].find(x => /Чинии|серия/.test(x.textContent) && x.classList.contains('ser')); return c && c.textContent; });
    ok('mixed series: one card, „серия · 10 бр.“ and „смесен“', /серия · 10 бр\./.test(s) && /смесен/.test(s), s);
    s = await E(() => { pcToggleSer('se-plates'); const m = document.querySelector('.pc-mem'); return m ? [...m.querySelectorAll('.pc-mc')].map(x => x.textContent) : null; });
    ok('series expands to its parts: the 5 together and the 2 split pieces', s && s.length === 3 && /Неотделени/.test(s[0]) && /5 бр\. заедно/.test(s[0]), s);
    await E(() => pcToggleSer('se-plates'));

    // --- филтри ---
    s = await E(() => { setPieceStageFilter('broken'); const cards = [...document.querySelectorAll('#pieces-grid .pc')].map(x => x.textContent); pcToggleSer('se-plates');
      const mem = [...document.querySelectorAll('.pc-mem .pc-mc')].map(x => ({ t: x.querySelector('.t').textContent, hit: x.classList.contains('hit'), dim: x.classList.contains('dim') }));
      const chip = document.querySelector('#pc-side .pf-chip[data-stage="broken"]'); pcToggleSer('se-plates');
      return { cards, mem, chip: chip && chip.textContent, act: document.getElementById('pc-active').textContent }; });
    ok('stage „Счупено“: the mixed series matches through its broken split piece', s.cards.length === 1 && /Отговарят 1 от 10 бр\.: Счупено 1/.test(s.cards[0]), s.cards);
    ok('stage „Счупено“: expanded, the matching piece is marked and the rest dimmed', s.mem.filter(m => m.hit).length === 1 && s.mem.filter(m => m.dim).length === 2, s.mem);
    ok('stage chip counts and active chip shown', /Счупено1/.test(s.chip) && /Счупено ✕/.test(s.act), s);
    s = await E(() => { setPieceStageFilter('fired'); const a = document.querySelectorAll('#pieces-grid .pc').length; pcSet('kind', 'piece'); const b = [...document.querySelectorAll('#pieces-grid .pc')].map(x => x.querySelector('.nm').textContent); return { a, b, chips: [...document.querySelectorAll('#pc-active .pc-achip')].map(x => x.textContent) }; });
    ok('two stages combine (or), kind narrows (and)', s.a > s.b.length && s.b.length >= 1 && s.chips.length === 4, s);
    s = await E(() => { pcUnset('kind', ''); pcUnset('stages', 'broken'); pcUnset('stages', 'fired'); return { n: document.querySelectorAll('#pieces-grid .pc').length, chips: document.querySelectorAll('#pc-active .pc-achip').length }; });
    ok('removing the active chips brings everything back', s.chips === 0 && s.n === 7, s);
    s = await E(() => { const name = DB.pieces.find(p => p.id === 'p-yellow').name; document.getElementById('pc-search').value = name.slice(0, 5); renderPieces(); const r = [...document.querySelectorAll('#pieces-grid .pc')].map(x => x.classList.contains('ser')); document.getElementById('pc-search').value = ''; renderPieces(); return r; });
    ok('search finds a series by the name of its split piece', s.length >= 1 && s.some(Boolean), s);
    s = await E(() => { togglePcChip('hasph'); const n = document.querySelectorAll('#pieces-grid .pc').length; togglePcChip('hasph'); return { n, exp: DB.pieces.filter(p => !p.seriesId && (p.photos || []).length).length + DB.series.filter(x => (x.photos || []).length).length }; });
    ok('„Със снимка“ still works', s.n === s.exp && s.n >= 1, s);

    // --- архив ---
    s = await E(async () => { const p = DB.pieces.find(x => x.id === 'p-done'); p.archivedAt = new Date().toISOString(); renderPieces();
      const act = document.querySelectorAll('#pieces-grid .pc').length; pcSet('arch', 'arch'); const only = [...document.querySelectorAll('#pieces-grid .pc')].map(x => x.textContent);
      pcSet('arch', 'all'); const all = document.querySelectorAll('#pieces-grid .pc').length; pcSet('arch', 'active'); delete p.archivedAt; renderPieces(); return { act, only, all }; });
    ok('archive: hidden from active, alone in „Само архив“, included in „Всички“', s.act === 6 && s.only.length === 1 && /в архива/.test(s.only[0]) && s.all === 7, s);

    // --- списък на телефон, връщане от детайла ---
    s = await E(async () => { setPcView('list'); setPieceStageFilter('fired'); window.scrollTo(0, 0);
      openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 60)); closeDet('det-piece'); await new Promise(r => setTimeout(r, 60));
      return { view: PC.view, st: PC.stages.join(), rows: document.querySelectorAll('#pieces-grid .pcr.pc').length, head: getComputedStyle(document.querySelector('.pclh')).display, saved: JSON.parse(localStorage.getItem('glina.catalog')) }; });
    ok('back from a detail: still the list, still filtered', s.view === 'list' && s.st === 'fired' && s.rows >= 2, s);
    ok('view and filters remembered for the next start', s.saved.view === 'list' && s.saved.stages.join() === 'fired', s.saved);
    ok('phone list: compact rows, no table header', s.head === 'none', s);
    ok('phone: nothing wider than the screen (list)', await noOverflow());
    await E(() => resetPcFilters());

    // --- детайл: снимка на телефон ---
    await E(async () => { openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 80)); });
    s = await E(() => { const hr = document.getElementById('dpi-hero').getBoundingClientRect(), t = document.getElementById('dpi-t').getBoundingClientRect(), st = document.querySelector('#dpi-head .pd-stage').getBoundingClientRect();
      return { h: hr.height, w: hr.width, tTop: t.top, stBottom: st.bottom, vh: innerHeight, nav: document.querySelector('#dpi-hero .hn span').textContent, N: _detPhotos(DB.pieces.find(p => p.id === 'p-ocarina')).length }; });
    ok('phone detail: photo on top, height limited, name and stage on the first screen', s.h <= 262 && s.w > 300 && s.tTop > s.h - 5 && s.stBottom < s.vh, s);
    const N = s.N;
    ok('several photos: arrows and counter on the photo', N >= 2 && s.nav === '1 / ' + N, s);
    s = await E(async () => { heroStep(1); const a = document.querySelector('#dpi-hero .hn span').textContent; heroStep(-1);
      (document.querySelector('#dpi-hero img.hfg') || document.querySelector('#dpi-hero img')).click(); await new Promise(r => setTimeout(r, 30));
      const lb = { on: document.getElementById('lb').classList.contains('on'), ct: document.getElementById('lb-ct').textContent };
      lbStep(1); const ct2 = document.getElementById('lb-ct').textContent;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await new Promise(r => setTimeout(r, 30));
      return { a, lb, ct2, closed: !document.getElementById('lb').classList.contains('on'), det: document.getElementById('det-piece').classList.contains('on') }; });
    ok('hero arrows go through the photos', s.a === '2 / ' + N, s);
    ok('tap opens the large view; next; Escape closes it and keeps the detail', s.lb.on && s.lb.ct === '1 / ' + N && s.ct2 === '2 / ' + N && s.closed && s.det, s);
    await E(() => closeDet('det-piece'));

    // --- лаптоп ---
    for (const [w, hgt] of [[1280, 800], [1000, 760], [820, 900]]) {
      await page.setViewportSize({ width: w, height: hgt });
      await E(() => { setPcView('gal'); });
      // v1.41.0: филтрите — зад бутона на всяка ширина (един модел за всички каталози);
      // на широк екран се отварят като карта над списъка, на тесен — като лист
      const g = await E(() => { const side = document.getElementById('pc-side'), btn = document.getElementById('pc-filter-toggle'); const closed = getComputedStyle(side).display, b = getComputedStyle(btn).display;
        togglePcFilters(); const cs = getComputedStyle(side), open = { d: cs.display, pos: cs.position }; togglePcFilters();
        return { cols: getComputedStyle(document.getElementById('pieces-grid')).gridTemplateColumns.split(' ').length, closed, b, open, after: getComputedStyle(side).display }; });
      ok(w + 'px: gallery adapts (' + g.cols + ' columns), filters behind the button — ' + (w >= 960 ? 'a card above the list' : 'a sheet'), g.cols > 2 && g.closed === 'none' && g.b !== 'none' && g.open.d !== 'none' && g.open.pos === (w >= 960 ? 'static' : 'fixed') && g.after === 'none', g);
      await E(() => { setPcView('list'); pcToggleSer('se-plates'); });
      const l = await E(() => { const grid = document.getElementById('pieces-grid').getBoundingClientRect(); const rows = [...document.querySelectorAll('#pieces-grid .pcr')];
        return { head: getComputedStyle(document.querySelector('.pclh')).display, wide: rows.filter(r => r.getBoundingClientRect().right > grid.right + 1).length, mem: document.querySelectorAll('#pieces-grid .pcr.mem').length, cw: grid.width }; });
      ok(w + 'px: list ' + (l.head === 'grid' ? 'as a table' : 'compact') + ', no row wider than the list, series expands in place', l.wide === 0 && l.mem === 3 && (w >= 1000 ? l.head === 'grid' : true), l);
      ok(w + 'px: nothing wider than the screen', await noOverflow());
      await E(() => pcToggleSer('se-plates'));
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await E(async () => { openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 80)); });
    s = await E(() => { const hr = document.getElementById('dpi-hero').getBoundingClientRect(), hd = document.getElementById('dpi-head').getBoundingClientRect(), f = document.querySelector('#dpi-head .pd-facts').getBoundingClientRect();
      return { heroR: hr.right, heroH: hr.height, headL: hd.left, headTop: hd.top, factsBottom: f.bottom, vh: innerHeight }; });
    ok('laptop detail: photo left, name/stage/facts right, all on the first screen', s.heroR <= s.headL && s.heroH <= 441 && s.headTop < 120 && s.factsBottom < s.vh, s);
    await E(() => closeDet('det-piece'));
    await page.setViewportSize({ width: 390, height: 844 });

    // --- Моето ателие ---
    s = await E(() => { show('home'); const b = document.getElementById('home-body');
      return { on: document.getElementById('sc-home').classList.contains('on'), start: cur, h: [...b.querySelectorAll('h2')].map(x => x.textContent), wait: [...b.querySelectorAll('.hm-box')].find(x => /Чакат/.test(x.textContent)).textContent }; });
    ok('„Моето ателие“ opens from „Изделия“ with its five blocks', s.on && s.h.join('|') === 'Бързи действия|В работа|Планирани изпичания|Чакат изпичане|Последно променени', s.h);
    ok('waiting for a firing: the bone-dry piece', /→ бисквит/.test(s.wait), s.wait);
    s = await E(() => { DB.firingRuns.push({ id: 'run-plan-x', name: 'План Х', state: 'planned', purpose: 'bisque', date: '2026-11-06', plan: { members: [{ id: 'm1', ref: { kind: 'piece', id: 'p-untyped' }, name: 'x' }] } });
      renderHome(); const b = document.getElementById('home-body'); const box = t => [...b.querySelectorAll('.hm-box')].find(x => new RegExp(t).test(x.textContent)).textContent;
      const r = { plan: box('Планирани'), wait: box('Чакат') }; DB.firingRuns.pop(); renderHome(); return r; });
    ok('a piece already in an active plan is not offered as waiting; the plan is listed', /План Х/.test(s.plan) && /1 бр\. в плана/.test(s.plan) && !/→ бисквит/.test(s.wait), s);
    s = await E(() => { homeStage('fired'); return { cur, st: PC.stages.join(), n: document.querySelectorAll('#pieces-grid .pc').length }; });
    ok('a stage in „В работа“ opens the catalog filtered by it', s.cur === 'pieces' && s.st === 'fired' && s.n >= 2, s);
    await E(() => resetPcFilters());
    s = await E(() => ({ start: localStorage.getItem('glina.catalog') && cur, nb: document.getElementById('nb-pieces').classList.contains('on') }));
    ok('the start screen is still „Изделия“', await E(() => document.querySelector('.sc.on').id) === 'sc-pieces');
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- реални архиви (само локално, не в пакетите) ---
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
        const r = await a2.eval(async () => {
          const s = document.getElementById('splash'); if (s) s.remove(); show('pieces');
          const exp = DB.pieces.filter(p => !p.archivedAt && !_pcNested(p)).length + DB.series.filter(x => !x.archivedAt).length;
          setPcView('gal'); const g = document.querySelectorAll('#pieces-grid .pc').length;
          setPcView('list'); const l = document.querySelectorAll('#pieces-grid .pc').length;
          // етап по етап: всяка серия, която има бройка на етапа, се намира
          let miss = [];
          STAGES.concat(OUTCOMES).forEach(st => { PC.stages = [st.v]; renderPieces(); const shown = new Set([...document.querySelectorAll('#pieces-grid .pc')].length ? DB.series.filter(se => !se.archivedAt && _seriesStageSummary(se).parts.some(x => x.stage === st.v)).map(x => x.id) : []);
            DB.series.filter(se => !se.archivedAt && _seriesStageSummary(se).parts.some(x => x.stage === st.v)).forEach(se => { if (![...document.querySelectorAll('#pieces-grid .pc')].some(c => (c.getAttribute('onclick') || '').indexOf(se.id) >= 0)) miss.push(st.v + ':' + se.name); }); });
          resetPcFilters(); setPcView('gal');
          show('home'); const planned = _homePlanned(); const wait = _homeWaiting();
          const bad = wait.filter(x => (planned[x.rec.id] || 0) >= x.qty).map(x => x.rec.name);
          const inPlan = Object.keys(planned).length;
          const errs = [];
          return { exp, g, l, miss, bad, inPlan, wait: wait.length };
        });
        console.log('  ' + f + ':');
        ok('  all records once, gallery and list (' + r.g + ')', r.g === r.exp && r.l === r.exp, r);
        ok('  every series with a unit at a stage is found by that stage', !r.miss.length, r.miss);
        ok('  „Чакат изпичане“ leaves out what is already in an active plan (' + r.inPlan + ' planned, ' + r.wait + ' waiting)', !r.bad.length, r.bad);
        ok('  no page errors', !a2.log.errors.length, a2.log.errors);
        await a2.close();
      }
    } else console.log('  - no private archives');
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
