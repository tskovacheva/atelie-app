// v1.40.0 — „Тестове“ по прототипа tests-v0: галерия/списък, филтри, детайл с ясен
// резултат, връзка към точната версия на рецептата, „Сравни“ (само изглед), формуляр в
// четири раздела. Празно поле е „не е отбелязано“, а не „Няма“. Свиване и
// водопоглъщане — само през _shrinkPcts / _poroPct.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

// Празна редакция на всеки тест: нищо освен updatedAt не се променя.
const EMPTY_EDITS = async () => {
  const out = [];
  for (const t0 of DB.tests.slice()) {
    const before = JSON.parse(JSON.stringify(t0)); delete before.updatedAt;
    curTest = t0.id; editTest(); await new Promise(r => setTimeout(r, 20)); saveTest(); await new Promise(r => setTimeout(r, 20));
    const after = JSON.parse(JSON.stringify(DB.tests.find(x => x.id === t0.id))); delete after.updatedAt;
    // липсващо поле, записано като празно, е същото (така е и преди v1.40.0)
    const nv = v => (v == null ? '' : JSON.stringify(v));
    const ks = [...new Set(Object.keys(before).concat(Object.keys(after)))].filter(k => nv(before[k]) !== nv(after[k]) && !(before[k] == null && (after[k] === '' || after[k] === null)));
    if (ks.length || document.getElementById('mo-test').classList.contains('on')) out.push({ id: t0.id, ks, open: document.getElementById('mo-test').classList.contains('on'), b: ks.map(k => [before[k], after[k]]) });
    if (document.getElementById('mo-test').classList.contains('on')) closeMo('mo-test');
  }
  return out;
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('tests:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof openTestCmp === 'function'))) { console.log('  - not in this version'); return; }
    app.acceptConfirms && app.acceptConfirms();
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await page.setViewportSize({ width: 390, height: 844 });
    // Допълнителни глазурни тестове: „Няма“, дефект, празно; по-стара версия; нулеви измервания.
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove();
      const g = DB.tests.find(t => t.id === 't-glaze');
      DB.tests.push(Object.assign({}, g, { id: 't-none', def: 'Няма', recipeId: 'rec-ash', rat: '5 ★★★★★', date: '2026-08-01', photos: [] }));
      DB.tests.push(Object.assign({}, g, { id: 't-crk', def: 'Напукване', rat: '2 ★★', surf: 'Матова', date: '2026-07-01', temp: '1220' }));
      DB.tests.push({ id: 't-zero', kind: 'body', date: '2026-06-01', bodyRef: 'mat:mat-xi-mass', body: { shrMarked: 0, shrDry: 94, poroDry: 0, poroWet: 5 }, photos: [] });
      show('tests'); });
    const noOverflow = () => E(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.det.on, #main')].every(x => x.scrollWidth <= x.clientWidth + 1));
    const snap = () => E(() => JSON.stringify(DB));
    const before = await snap();

    // --- каталог ---
    let s = await E(() => ({ view: TS.view, cards: document.querySelectorAll('#tests-list .ts-c').length, n: DB.tests.length, noph: document.querySelectorAll('#tests-list .noph').length, fit: getComputedStyle(document.querySelector('#tests-list .ts-c img')).objectFit }));
    ok('gallery by default, every test once, uncropped photo, clear „без снимка“', s.view === 'gal' && s.cards === s.n && s.noph === 3 && s.fit === 'contain', s);
    ok('no horizontal scroll on the phone', await noOverflow());
    s = await E(() => { setTestView('list'); const r = document.querySelectorAll('#tests-list .ts-r').length; tsKind('body'); const b = document.querySelectorAll('#tests-list .ts-r').length; tsKind(''); setTestView('gal'); return { r, b }; });
    ok('compact list; kind filter', s.r === 5 && s.b === 2, s);
    s = await E(() => { const n = () => [...document.querySelectorAll('#tests-list .ts-c')].length; tsSet('def', 'none'); const a = n(); tsSet('def', 'has'); const b = n(); tsSet('def', 'unk'); const c = n(); tsSet('def', 'unk');
      tsSet('rat', '4'); tsTog('temps', '1240'); const d = n(); const chips = document.querySelectorAll('#ts-active .pc-achip').length; resetTestFilters(); return { a, b, c, d, chips }; });
    ok('„Без дефекти“ is only „Няма“; an empty field is „не са отбелязани“, never „без дефекти“', s.a === 1 && s.b === 1 && s.c === 1, s);
    ok('filters combine (rating + temperature), active chips', s.d === 2 && s.chips === 3, s);
    s = await E(() => { setSort('test', 'rat'); const r = [...document.querySelectorAll('#tests-list .ts-c')].map(x => x.getAttribute('onclick')); setSort('test', 'date'); return r[0]; });
    ok('sort by rating', /t-none/.test(s), s);
    s = await E(() => { document.getElementById('test-search').value = 'напукване'; renderTests(); const n = document.querySelectorAll('#tests-list .ts-c').length; document.getElementById('test-search').value = ''; renderTests(); return n; });
    ok('search by defect', s === 1, s);

    // --- детайл ---
    s = await E(() => { openTestDet('t-glaze'); const tl = [...document.querySelectorAll('#dtest-tiles div')].map(d => d.textContent);
      const links = [...document.querySelectorAll('#dtest-links .li')].map(x => x.getAttribute('onclick'));
      return { tl, tag: document.getElementById('dtest-tags').textContent, hero: getComputedStyle(document.querySelector('#dtest-hero img')).objectFit, links, warns: document.getElementById('dtest-warns').textContent }; });
    ok('glaze detail: empty defects are „не е отбелязано“, not „Няма“', s.tl.some(x => /Дефекти/.test(x) && /не е отбелязано/.test(x)) && !s.tl.some(x => /Дефекти/.test(x) && /Няма/.test(x)), s.tl);
    ok('large uncropped photo; version tag „сегашна“', s.hero === 'contain' && /v2 · сегашна/.test(s.tag), s);
    ok('links: exact recipe version, profile, run', s.links.some(x => /openRecipeDet\('rec-ash-2'\)/.test(x)) && s.links.some(x => /openFPDet\('fp-glaze'\)/.test(x)) && s.links.some(x => /openRunDet\('run-gl'\)/.test(x)), s.links);
    s = await E(() => { openTestDet('t-none'); return { tag: document.getElementById('dtest-tags').textContent, w: document.getElementById('dtest-warns').textContent, link: [...document.querySelectorAll('#dtest-links .li')].map(x => x.getAttribute('onclick'))[0], def: [...document.querySelectorAll('#dtest-tiles div')].find(d => /Дефекти/.test(d.textContent)).querySelector('b').className }; });
    ok('older version: stays linked to v1, says so, offers v2', /v1 · по-стара/.test(s.tag) && /v2/.test(s.w) && /openRecipeDet\('rec-ash'\)/.test(s.link), s);
    ok('„Няма“ is shown as a real result', s.def === 'good', s);
    s = await E(() => { openTestDet('t-body'); const b = DB.tests.find(t => t.id === 't-body').body, sh = _shrinkPcts(b), po = _poroPct(b);
      return { res: document.getElementById('dtest-res').textContent, tiles: document.getElementById('dtest-tiles').textContent, exp: [_tF(sh.wetDry), _tF(sh.dryFired), _tF(sh.total), _tF(po)], link: document.getElementById('dtest-links').innerHTML, def: document.getElementById('dtest-tiles').textContent }; });
    ok('body detail: shrinkage and absorption from _shrinkPcts / _poroPct', s.exp.every(v => s.res.indexOf(v + '%') >= 0) && s.tiles.indexOf(s.exp[2] + '%') >= 0, s);
    ok('body: mass link; missing deformation is „не е отбелязано“', /openMatDet\('mat-xi-mass'\)/.test(s.link) && /Деформацияне е отбелязано/.test(s.def), s.def);
    s = await E(() => { openTestDet('t-zero'); return { w: document.getElementById('dtest-warns').textContent, t: document.getElementById('dtest-tiles').textContent }; });
    ok('zero measurements: explained, no number made up', /маркираната дължина е 0/.test(s.w) && /сухото тегло е 0/.test(s.w) && /Свиване общоне е отбелязано/.test(s.t) && /Водопоглъщанене е отбелязано/.test(s.t), s);
    ok('no horizontal scroll in the detail', await noOverflow());
    await E(() => closeDet('det-test'));
    ok('just looking changes nothing', before === await snap());

    // --- сравнение ---
    s = await E(() => { toggleTestCmp(); ['t-glaze', 't-none', 't-crk'].forEach(tsTap); openTestCmp(); const el = document.getElementById('ts-cmp');
      const g = el.querySelectorAll('.tc-grid').length, rows = el.querySelectorAll('.tc-v').length, diff = el.querySelectorAll('.tc-v.diff').length;
      const lab = [...el.querySelectorAll('.tc-v')].map(v => v.textContent);
      TS.onlyDiff = true; _tCmpDraw(); const rows2 = el.querySelectorAll('.tc-v').length; TS.onlyDiff = false; _tCmpDraw();
      return { on: el.classList.contains('on'), g, rows, diff, rows2, unk: lab.filter(x => /не е отбелязано/.test(x)).length, picked: TS.picked.length }; });
    ok('3 tests on the phone: groups of two, aligned rows', s.on && s.g === 2 && s.rows > 0, s);
    ok('differences highlighted; „Само разликите“ drops the rest', s.diff > 0 && s.rows2 < s.rows, s);
    ok('empty values are „не е отбелязано“ in the comparison', s.unk > 0, s);
    ok('no horizontal scroll in the comparison (phone)', await noOverflow());
    await page.setViewportSize({ width: 1280, height: 800 });
    s = await E(() => { _tCmpDraw(); return document.querySelectorAll('#ts-cmp .tc-grid').length; });
    ok('laptop: one grid, a column per test', s === 1, s);
    ok('no horizontal scroll in the comparison (laptop)', await noOverflow());
    s = await E(() => { closeDet('ts-cmp'); toggleTestCmp(); TS.picked = ['t-glaze', 't-body']; TS.cmp = true; openTestCmp(); const k = [...document.querySelectorAll('#ts-cmp .tc-k')].map(x => x.textContent); closeDet('ts-cmp'); TS.cmp = false; TS.picked = []; renderTests(); return k; });
    ok('mixed kinds: only the common fields', s.length === 4 && s.indexOf('Вид') >= 0, s);
    s = await E(() => { openTestDet('t-glaze'); cmpSimilar(); const r = TS.picked.slice(); closeDet('ts-cmp'); TS.cmp = false; TS.picked = []; renderTests(); return r; });
    ok('„Сравни с подобни“ — same recipe, all its versions', s[0] === 't-glaze' && s.indexOf('t-none') > 0 && s.indexOf('t-crk') > 0 && s.indexOf('t-body') < 0, s);
    ok('comparison writes nothing', before === await snap());

    // --- лаптоп: детайлът до списъка ---
    s = await E(() => { show('tests'); openTestDet('t-glaze'); const r = { split: document.getElementById('det-test').classList.contains('split'), sel: document.querySelectorAll('#tests-list .sel').length }; closeDet('det-test'); return r; });
    ok('laptop: detail beside the gallery, current test marked', s.split && s.sel === 1, s);
    await page.setViewportSize({ width: 390, height: 844 });

    // --- формуляр ---
    s = await E(async () => { curTest = 't-body'; editTest(); await new Promise(r => setTimeout(r, 30)); const mo = document.getElementById('mo-test');
      const tabs = [...mo.querySelectorAll('.pi-tabs button')].map(b => b.textContent), on = mo.querySelector('.pi-tab.on').getAttribute('data-tab');
      const opts = { def: document.querySelector('#ti-def option').textContent, deform: document.querySelector('#ti-deform option').textContent, lime: document.querySelector('#ti-lime option').textContent };
      document.getElementById('ti-shr-dry').value = 'abc'; saveTest(); await new Promise(r => setTimeout(r, 20));
      const err = document.getElementById('ti-meas-err').textContent, tab = mo.querySelector('.pi-tab.on').getAttribute('data-tab'), stillOpen = mo.classList.contains('on'), stored = DB.tests.find(t => t.id === 't-body').body.shrDry;
      document.getElementById('ti-shr-dry').value = '-3'; saveTest(); await new Promise(r => setTimeout(r, 20)); const neg = mo.classList.contains('on');
      document.getElementById('ti-shr-dry').value = '94,5'; _calcShrink(); const live = document.getElementById('ti-shrink-out').textContent;
      saveTest(); await new Promise(r => setTimeout(r, 20));
      return { tabs, on, opts, err, tab, stillOpen, stored, neg, live, after: DB.tests.find(t => t.id === 't-body').body.shrDry, closed: !mo.classList.contains('on') }; });
    ok('four tabs, opens on the first', s.tabs.length === 4 && s.on === 'what', s);
    ok('defects / deformation / lime popping start as „не е отбелязано“', Object.values(s.opts).every(x => /не е отбелязано/.test(x)), s.opts);
    ok('text in a measurement: error on the field, „Резултат“ tab, nothing saved', /число/.test(s.err) && s.tab === 'res' && s.stillOpen && s.stored === 94, s);
    ok('negative measurement rejected', s.neg, s);
    ok('comma accepted (94,5), live result from _shrinkPcts', s.after === 94.5 && s.closed && /мокро→сухо 5,5%/.test(s.live), s);
    await E(() => { DB.tests.find(t => t.id === 't-body').body.shrDry = 94; });
    s = await E(EMPTY_EDITS);
    ok('edit without changes keeps every test exactly (empty stays empty, „Няма“ stays „Няма“)', !s.length, s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- реални архиви ---
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
        await a2.page.setViewportSize({ width: 390, height: 844 });
        const r = await a2.eval(async () => { const s = document.getElementById('splash'); if (s) s.remove(); show('tests'); const b0 = JSON.stringify(DB);
          const n = document.querySelectorAll('#tests-list .ts-c').length; const kinds = {}; let photos = 0, unk = 0;
          for (const t of DB.tests) { openTestDet(t.id); kinds[testKind(t)] = (kinds[testKind(t)] || 0) + 1; photos += document.querySelectorAll('#dtest-hero img').length; unk += (document.getElementById('det-test').textContent.match(/не е отбелязано/g) || []).length; }
          closeDet('det-test'); setTestView('list'); setTestView('gal');
          if (DB.tests.length > 1) { toggleTestCmp(); DB.tests.slice(0, 4).forEach(t => tsTap(t.id)); openTestCmp(); closeDet('ts-cmp'); toggleTestCmp(); }
          const ov = document.documentElement.scrollWidth <= innerWidth + 1;
          return { n, all: DB.tests.length, same: b0 === JSON.stringify(DB), kinds, photos, unk, ov }; });
        const ed = await a2.eval(EMPTY_EDITS);
        console.log('  ' + f + ':');
        ok('  every test listed, opened and compared (' + r.n + '; ' + Object.keys(r.kinds).map(k => k + ' ' + r.kinds[k]).join(', ') + '; ' + r.photos + ' with photo), nothing written', r.n === r.all && r.same && r.ov, r);
        ok('  empty edit keeps every test', !ed.length, ed);
        ok('  no page errors', !a2.log.errors.length, a2.log.errors);
        await a2.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
