// v1.41.0 — одит U3, U5, U7, U9, U10: „Ателие“ като начало и в лентата, библиотеката
// от него; един модел за филтрите; по-голяма резолюция на снимките на тестовете;
// раздели във формулярите за изпичане и профил; формуляри до ~720 px на широк екран.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

// Голяма снимка като файл (3000 × 2000), за да се види докъде се свива.
const BIGFILE = async () => { const c = document.createElement('canvas'); c.width = 3000; c.height = 2000; const x = c.getContext('2d');
  for (let i = 0; i < 300; i++) { x.fillStyle = 'hsl(' + (i * 7 % 360) + ',60%,50%)'; x.fillRect((i * 97) % 3000, (i * 53) % 2000, 120, 80); }
  const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9)); return new File([b], 'big.jpg', { type: 'image/jpeg' }); };
const DIMS = src => new Promise(r => { const i = new Image(); i.onload = () => r([i.width, i.height]); i.src = src; });

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('ux:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof moTab === 'function'))) { console.log('  - not in this version'); return; }
    await app.page.setViewportSize({ width: 390, height: 844 });
    const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
    await E(() => document.getElementById('splash')?.remove());

    // ── U3: начало и лента ──
    let s = await E(() => ({ cur, on: document.querySelector('.sc.on').id, nav: [...document.querySelectorAll('#nav .nb')].map(b => b.id), lit: document.querySelector('#nav .nb.on').id, fab: getComputedStyle(document.getElementById('fab')).display, body: document.getElementById('home-body').innerText.length }));
    ok('U3: the app opens on „Моето ателие“ (rendered), first in the bar and lit; no FAB there', s.cur === 'home' && s.on === 'sc-home' && s.nav[0] === 'nb-home' && s.lit === 'nb-home' && s.fab === 'none' && s.body > 50, s);
    ok('U3: bar — Ателие, Изделия, Материали, Изпичания, Рецепти, Тестове (no separate Библиотека)', s.nav.join() === 'nb-home,nb-pieces,nb-materials,nb-fp,nb-recipes,nb-tests', s.nav);
    s = await E(() => { document.getElementById('hm-lib').click(); const a = { cur, lit: document.querySelector('#nav .nb.on').id, backup: /Backup/i.test(document.getElementById('sc-lib').innerText) };
      document.querySelector('#sc-lib .lib-back').click(); a.back = cur; return a; });
    ok('U3: „Библиотека“ from the home screen — with Backup; the bar keeps „Ателие“ lit; „‹ Ателие“ returns', s.cur === 'lib' && s.lit === 'nb-home' && s.backup && s.back === 'home', s);
    s = await E(() => ['pieces', 'materials', 'fp', 'recipes', 'tests', 'home'].map(n => { document.getElementById('nb-' + n).click(); return cur === n && document.getElementById('sc-' + n).classList.contains('on'); }));
    ok('U3: every bar button opens its screen', s.every(Boolean), s);

    // ── U5: един модел за филтрите ──
    const CATS = [['pieces', 'pc-side', 'togglePcFilters', 'pc-filter-toggle'], ['recipes', 'rc-side', 'toggleRecFilters', 'rc-filter-toggle'], ['materials', 'mt-side', 'toggleMatFilters', 'mt-filter-toggle'], ['tests', 'ts-side', 'toggleTestFilters', 'ts-filter-toggle']];
    for (const vp of [{ width: 390, height: 844 }, { width: 1366, height: 860 }]) {
      await app.page.setViewportSize(vp);
      const wide = vp.width >= 960;
      for (const [scr, side, fn, btn] of CATS) {
        await E(s => show(s), scr); await W(120);
        s = await E(([side, fn, btn]) => { const el = document.getElementById(side), b = document.getElementById(btn), closed = getComputedStyle(el).display;
          window[fn](); const cs = getComputedStyle(el), r = el.getBoundingClientRect();
          return { btn: !!b && getComputedStyle(b).display !== 'none', closed, d: cs.display, pos: cs.position, full: r.width >= innerWidth - 1 && r.height >= innerHeight - 1, done: [...el.querySelectorAll('button')].some(x => /Готово/.test(x.textContent)), clr: [...el.querySelectorAll('button')].some(x => /Изчисти/.test(x.textContent)), stack: _overlayStack.map(e => e.id) }; }, [side, fn, btn]);
        const good = s.btn && s.closed === 'none' && s.d !== 'none' && s.done && s.clr && (wide ? s.pos === 'static' && !s.full && s.stack.indexOf(side) < 0 : s.pos === 'fixed' && s.full && s.stack.indexOf(side) >= 0);
        ok(`U5 ${wide ? 'laptop' : 'phone'} ${scr}: „Филтри“ opens ${wide ? 'a card above the list' : 'a full sheet'} with „Готово“ and „Изчисти“`, good, s);
        if (!wide) {
          await app.page.goBack({ waitUntil: 'commit' }); await W(350);
          s = await E(([side, scr]) => ({ d: getComputedStyle(document.getElementById(side)).display, cur, app: true, flag: side === 'rc-side' ? RC.side : side === 'mt-side' ? MT.side : side === 'ts-side' ? TS.side : null }), [side, scr]);
          ok(`U5 phone ${scr}: back closes the sheet, stays on the screen`, s.d === 'none' && s.cur === scr && s.flag !== true, s);
        } else await E(fn => window[fn](), fn);
      }
    }
    await app.page.setViewportSize({ width: 390, height: 844 });
    s = await E(() => { show('recipes'); rcTog && typeof rcTog === 'function'; const b0 = document.getElementById('rc-filter-badge').textContent;
      show('tests'); tsKind('glaze'); const tb = document.getElementById('ts-filter-badge').textContent, ta = document.querySelectorAll('#ts-active .pc-achip').length; resetTestFilters();
      show('pieces'); return { b0, tb, ta }; });
    ok('U5: active filters show as chips with „изчисти“; the button carries the count', s.ta >= 2, s);

    // ── U7: снимки на тестовете ──
    s = await E(async ([BIG, DIM]) => { const big = await (new Function('return (' + BIG + ')()'))(), dims = new Function('return ' + DIM)();
      const t = [], p = []; resizeAndAdd(big, t, 6, 'ti-prev'); resizeAndAdd(big, p, 5, 'pi-prev');
      for (let i = 0; i < 60 && (!t.length || !p.length); i++) await new Promise(r => setTimeout(r, 100));
      const dt = await dims(t[0]), dp = await dims(p[0]); return { dt, dp, kbT: Math.round(t[0].length * 0.75 / 1024), kbP: Math.round(p[0].length * 0.75 / 1024) }; }, [BIGFILE.toString(), DIMS.toString()]);
    ok('U7: a test photo is kept at 1600 px (was 800)', Math.max(...s.dt) === 1600, s);
    ok('U7: … in a reasonable size (≤ 700 KB); piece photos stay at 800 px', s.kbT <= 700 && Math.max(...s.dp) === 800, s);
    s = await E(async ([BIG]) => { const big = await (new Function('return (' + BIG + ')()'))(); const t = DB.tests.find(x => x.id === 't-glaze'); const arr = []; resizeAndAdd(big, arr, 6, 'ti-prev');
      for (let i = 0; i < 60 && !arr.length; i++) await new Promise(r => setTimeout(r, 100));
      t.photos = [arr[0]]; const old = DB.pieces.find(x => x.photos && x.photos.length); const before = { t: t.photos[0], p: old ? old.photos[0] : null };
      const oc = window.confirm; window.confirm = () => true; recompressOldPhotos(); window.confirm = oc; await new Promise(r => setTimeout(r, 1500));
      return { tSame: t.photos[0] === before.t, kb: Math.round(before.t.length * 0.75 / 1024) }; }, [BIGFILE.toString()]);
    ok('U7: „Прекомпресирай“ does not shrink new test photos back to 800 px', s.tSame, s);

    // ── U9: раздели във формулярите ──
    s = await E(() => { show('fp'); openRunMo('run-pit'); const mo = document.getElementById('mo-run');
      const tabs = [...mo.querySelectorAll('.pi-tabs button')].map(b => b.textContent), on = mo.querySelector('.pi-tab.on').dataset.tab;
      document.getElementById('rn-notes').value = 'бележка'; moTab('mo-run', 'basic'); const dirty = _moIsDirty('mo-run');
      document.getElementById('rn-notes').value = ''; document.getElementById('rn-date').value = ''; saveRun();
      const tab = mo.querySelector('.pi-tab.on').dataset.tab, open = mo.classList.contains('on'); closeMo('mo-run');
      return { tabs, on, dirty, tab, open, foot: !!mo.querySelector('.pi-foot .bp') }; });
    ok('U9 firing form: three tabs (Основни / Реално и метод / Бележки и снимки), opens on the first, sticky save bar', s.tabs.length === 3 && s.on === 'basic' && s.foot, s);
    ok('U9 firing form: a change in another tab still counts as unsaved; a missing date brings you back to „Основни“', s.dirty && s.open && s.tab === 'basic', s);
    s = await E(() => { const r0 = JSON.parse(JSON.stringify(DB.firingRuns.find(r => r.id === 'run-pit'))); openRunMo('run-pit'); ['real', 'more', 'basic'].forEach(k => moTab('mo-run', k)); saveRun(); const r1 = JSON.parse(JSON.stringify(DB.firingRuns.find(r => r.id === 'run-pit')));
      // празно, null и липсващо са едно и също (така пише формулярът и преди v1.41.0)
      const nv = v => v == null || v === '' ? '' : JSON.stringify(v); delete r0.updatedAt; delete r1.updatedAt;
      const d = [...new Set(Object.keys(r0).concat(Object.keys(r1)))].filter(k => nv(r0[k]) !== nv(r1[k])); return { same: !d.length, d }; });
    ok('U9 firing form: open, flip through all tabs, save → the firing is unchanged', s.same, s);
    // профил в сегашния формат (старият „ramp1…“ се превръща в сегменти при запис — така е и преди)
    s = await E(() => { closeDet('det-run'); if (!DB.firingProfiles.some(x => x.id === 'fp-new')) DB.firingProfiles.push({ id: 'fp-new', name: 'Нов профил', type: 'glaze', ramps: [{ rate: 100, to: 600, hold: null }, { rate: 150, to: 1240, hold: 10 }], notes: 'n' }); openFPMo(DB.firingProfiles.find(x => x.id === 'fp-new')); const mo = document.getElementById('mo-fp'); const tabs = [...mo.querySelectorAll('.pi-tabs button')].map(b => b.textContent);
      moTab('mo-fp', 'ramps'); const ramps = mo.querySelector('.pi-tab.on #fp-ramps') !== null; const f0 = JSON.stringify(DB.firingProfiles.find(x => x.id === 'fp-new')); saveFP();
      const f1 = DB.firingProfiles.find(x => x.id === 'fp-new'); const a = JSON.parse(f0), b = JSON.parse(JSON.stringify(f1)); delete a.updatedAt; delete b.updatedAt;
      const nv = v => v == null || v === '' ? '' : JSON.stringify(v); const d = [...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k => nv(a[k]) !== nv(b[k])); return { tabs, ramps, same: !d.length, d, a: d.map(k => [a[k], b[k]]) }; });
    ok('U9 profile form: „Основни“ and „Сегменти и крива“; saving unchanged keeps the profile', s.tabs.length === 2 && s.ramps && s.same, s);
    s = await E(() => { show('pieces'); openPieceDet('p-old'); openEventMo('firing'); const h = [...document.querySelectorAll('#mo-event .ev-sh')].filter(x => x.offsetParent !== null).map(x => x.textContent); closeMo('mo-event'); closeDet('det-piece'); return h; });
    ok('U9 process step „изпичане“: grouped (Общо изпичане / Метод и параметри / За това изделие)', s.join('|') === 'Общо изпичане|Метод и параметри|За това изделие', s);

    // ── U10: ширина на формулярите ──
    for (const vp of [{ width: 1366, height: 860 }, { width: 390, height: 844 }]) {
      await app.page.setViewportSize(vp);
      s = await E(() => { const out = {}; const m = (id, open) => { open(); const r = document.querySelector('#' + id + ' .mo-sh').getBoundingClientRect(); out[id] = [Math.round(r.width), Math.round(r.left)]; closeMo(id); };
        m('mo-run', () => openRunMo(null)); m('mo-test', () => openTestMo(null)); m('mo-piece', () => { editId = null; openPieceMo(); }); m('mo-fp', () => openFPMo(null)); return out; });
      const wide = vp.width >= 900, vals = Object.values(s);
      ok(`U10 ${wide ? 'laptop: forms 680–760 px, centred' : 'phone: forms full width, as before'}`, wide ? vals.every(([w, l]) => w >= 680 && w <= 760 && Math.abs(l - (1366 - w) / 2) < 2) : vals.every(([w]) => w === 390), s);
    }
    await app.page.setViewportSize({ width: 1366, height: 860 });
    s = await E(() => { show('tests'); document.querySelector('#tests-list .ts-c').click(); const d = document.getElementById('det-test'); return { split: d.classList.contains('split'), list: document.elementFromPoint(150, 400).closest('.sc') && document.elementFromPoint(150, 400).closest('.sc').id }; });
    ok('U10: two-panel details on the laptop kept', s.split && s.list === 'sc-tests', s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // ── реалните архиви: старите снимки не се пипат, всичко се отваря ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      const r = await a2.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB);
        const home = cur === 'home' && document.getElementById('home-body').innerText.length > 50;
        ['pieces', 'materials', 'fp', 'recipes', 'tests', 'home'].forEach(show);
        DB.tests.forEach(t => { openTestDet(t.id); }); DB.firingRuns.forEach(x => { openRunDet(x.id); openRunMo(x.id); ['real', 'more'].forEach(k => moTab('mo-run', k)); closeMo('mo-run'); });
        return { home, same: b0 === JSON.stringify(DB), photos: DB.tests.reduce((n, t) => n + (t.photos || []).length, 0) }; });
      console.log('  ' + f + ':');
      ok('  opens on the home screen; every screen, test and firing form opened — nothing changed, old photos (' + r.photos + ') untouched', r.home && r.same, r);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
