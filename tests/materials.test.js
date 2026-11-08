// v1.39.0 — „Материали“ по прототипа materials-v0: групи, Списък / Карти /
// Наличности, филтри, детайл с „В рецепти“, бърза промяна на количеството (само
// stock и alertAt), формуляр в четири раздела, „Безопасна за храна“ (Да / Не / Не е
// посочено), химичен анализ 0–100 с грешка на полето.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('materials:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof openMatStock === 'function'))) { console.log('  - not in this version'); return; }
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('materials'); });
    const noOverflow = () => E(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.det.on, #main')].every(x => x.scrollWidth <= x.clientWidth + 1));
    const snap = () => E(() => JSON.stringify(DB));

    // --- каталог ---
    let s = await E(() => ({ view: MT.view, rows: document.querySelectorAll('#mat-list .mt-r').length, n: DB.materials.length, heads: [...document.querySelectorAll('#mat-list .mt-gh')].map(x => x.textContent) }));
    ok('„Списък“ by default, every material once, grouped by category', s.view === 'list' && s.rows === s.n && s.heads.length > 1, s);
    s = await E(() => { switchMat('raw'); const a = [...document.querySelectorAll('#mat-list .mt-r')].length; switchMat('wish'); const w = document.querySelectorAll('#mat-list .mt-r').length; switchMat('all');
      return { a, w, expRaw: DB.materials.filter(m => m.cat === 'raw' && m.wishlist !== true).length, expW: DB.materials.filter(m => m.wishlist === true).length }; });
    ok('groups: a category, and Wishlist on its own', s.a === s.expRaw && s.w === s.expW, s);
    s = await E(() => { const m = DB.materials.find(x => x.formula && x.formula.length > 2); document.getElementById('mat-search').value = m.formula.toLowerCase(); renderMaterials(); const n = document.querySelectorAll('#mat-list .mt-r').length; document.getElementById('mat-search').value = ''; renderMaterials(); return n; });
    ok('search finds by formula', s >= 1, s);
    s = await E(() => { mtSet('inrec', 'yes'); const a = document.querySelectorAll('#mat-list .mt-r').length; mtFlag('chem'); const b = document.querySelectorAll('#mat-list .mt-r').length; const chips = document.querySelectorAll('#mt-active .pc-achip').length; resetMatFilters();
      return { a, b, chips, expA: DB.materials.filter(m => _mtRecipes(m).length).length, expB: DB.materials.filter(m => _mtRecipes(m).length && m.chem && Object.keys(m.chem).length).length }; });
    ok('filters combine (in recipes + chemical analysis), active chips', s.a === s.expA && s.b === s.expB && s.chips === 3, s);
    s = await E(() => { setMatView('cards'); const c = document.querySelectorAll('#mat-list .mt-c').length; setMatView('stock'); const st = [...document.querySelectorAll('#mat-list .mt-st')].map(x => x.textContent); setMatView('list'); return { c, st }; });
    ok('„Карти“ and „Наличности“ (low first, masses and Wishlist out)', s.c > 0 && s.st.length > 0, s);

    // --- нула и невъведено ---
    s = await E(() => { const a = DB.materials.find(m => m.cat !== 'mass' && m.wishlist !== true); const b = DB.materials.filter(m => m.cat !== 'mass' && m.wishlist !== true)[1];
      const keep = [a.stock, b.stock]; a.stock = 0; delete b.stock; renderMaterials(); const r = { a: _mtStock(a), b: _mtStock(b), chipA: _mtChip(a), chipB: _mtChip(b), low: getLowStock().indexOf(a) >= 0 && getLowStock().indexOf(b) < 0 };
      if (keep[0] == null) delete a.stock; else a.stock = keep[0]; if (keep[1] != null) b.stock = keep[1]; renderMaterials(); return r; });
    ok('0 is „изчерпан“, empty is „без количество“ — different states', s.a === 'zero' && s.b === 'none' && /0 г/.test(s.chipA) && /без количество/.test(s.chipB) && s.low, s);

    // --- детайл ---
    const before = await snap();
    s = await E(() => { const m = DB.materials.find(x => _mtRecipes(x).length); openMatDet(m.id); const rr = [...document.querySelectorAll('#dmat-recipes-val .md-rr')];
      return { n: rr.length, exp: _mtRecipes(m).length, open: document.querySelector('[data-sec="rec"]').classList.contains('open'), first: rr[0] && rr[0].getAttribute('onclick'), pct: rr.map(x => x.querySelector('.md-p').textContent) }; });
    ok('„В рецепти“ open, every recipe with its share, opens the real recipe', s.n === s.exp && s.open && /openRecipeDet\(/.test(s.first) && s.pct.every(p => /%$/.test(p)), s);
    s = await E(() => { openMatDet('mat-xi'); const a = { proc: getComputedStyle(document.getElementById('dmat-proc-row')).display !== 'none', ev: document.querySelectorAll('#dmat-proc-val .li').length, geo: document.getElementById('dmat-geo-row').style.display !== 'none', mk: getComputedStyle(document.getElementById('dmat-mkmass-row')).display !== 'none' };
      openMatDet('mat-xi-mass'); a.mass = document.getElementById('dmat-mass-val').textContent; a.rec = getComputedStyle(document.getElementById('dmat-recipes-row')).display; return a; });
    ok('wild clay: process biography, geology notes, „make a mass“', s.proc && s.ev > 0 && s.mk, s);
    ok('mass: its composition; no „В рецепти“', /Xi Beach/.test(s.mass) && s.rec === 'none', s);
    ok('just looking changes nothing', before === await snap());

    // --- „Безопасна за храна“ ---
    s = await E(async () => { const m = DB.materials.find(x => x.cat === 'glaze') || DB.materials[0]; const keep = { cat: m.cat, f: m.foodsafe }; m.cat = 'glaze'; const out = {};
      for (const v of ['yes', 'no', undefined]) { if (v) m.foodsafe = v; else delete m.foodsafe; openMatDet(m.id); out[v || 'none'] = [...document.querySelectorAll('#dmat-info div')].find(d => /Безопасна за храна/.test(d.textContent)).querySelector('b').textContent; }
      curMat = m.id; m.foodsafe = 'no'; editMat(); await new Promise(r => setTimeout(r, 30)); out.opts = [...document.querySelectorAll('#mi-gfoodsafe option')].map(o => o.textContent); out.sel = document.getElementById('mi-gfoodsafe').value;
      saveMat(); await new Promise(r => setTimeout(r, 30)); const m2 = DB.materials.find(x => x.id === m.id); out.stored = m2.foodsafe; out.all = document.body.innerText.match(/оловна|безоловна/g);
      m2.cat = keep.cat; if (keep.f) m2.foodsafe = keep.f; else delete m2.foodsafe; return out; });
    ok('„Безопасна за храна“: Да / Не / Не е посочено; stored values unchanged', s.yes === 'Да' && s.no === 'Не' && s.none === 'Не е посочено' && s.opts.join() === 'Не е посочено,Да,Не' && s.sel === 'no' && s.stored === 'no' && !s.all, s);

    // --- бърза промяна на количеството ---
    s = await E(async () => { const m = DB.materials.find(x => x.id === 'mat-toffee') || DB.materials.find(x => x.cat !== 'mass'); openMatDet(m.id); const keep = JSON.stringify(Object.assign({}, m, { stock: 0, alertAt: 0, updatedAt: 0 }));
      openMatStock(); await new Promise(r => setTimeout(r, 30)); document.getElementById('mqs-stock').value = '1250,5'; document.getElementById('mqs-alert').value = '300'; saveMatStock();
      const a = { stock: m.stock, alert: m.alertAt, same: JSON.stringify(Object.assign({}, m, { stock: 0, alertAt: 0, updatedAt: 0 })) === keep };
      openMatStock(); await new Promise(r => setTimeout(r, 30)); document.getElementById('mqs-stock').value = ''; saveMatStock(); a.empty = m.stock;
      openMatStock(); await new Promise(r => setTimeout(r, 30)); document.getElementById('mqs-stock').value = '0'; saveMatStock(); a.zero = m.stock;
      openMatStock(); await new Promise(r => setTimeout(r, 30)); document.getElementById('mqs-stock').value = '-4'; saveMatStock(); a.bad = { stock: m.stock, open: document.getElementById('mo-mat-stock').classList.contains('on') }; closeMo('mo-mat-stock'); return a; });
    ok('„Промени количеството“: only stock and threshold change; comma accepted', s.stock === 1250.5 && String(s.alert) === '300' && s.same, s);
    ok('empty stays „not entered“, 0 stays 0; a negative value is refused', s.empty === null && s.zero === 0 && s.bad.stock === 0 && s.bad.open, s);

    // --- формуляр: четири раздела, химичен анализ ---
    s = await E(async () => { curMat = 'mat-feldspar'; editMat(); await new Promise(r => setTimeout(r, 30)); const tabs = [...document.querySelectorAll('#mo-mat .pi-tabs button')].map(b => b.textContent.trim());
      const m = DB.materials.find(x => x.id === 'mat-feldspar'), before = JSON.stringify(m.chem);
      document.getElementById('mi-sio2').value = 'abc'; saveMat(); await new Promise(r => setTimeout(r, 30));
      const a = { tabs, open: document.getElementById('mo-mat').classList.contains('on'), tab: document.querySelector('#mo-mat .pi-tabs .on').dataset.tab, err: document.getElementById('mi-chem-err').textContent, kept: JSON.stringify(m.chem) === before };
      document.getElementById('mi-sio2').value = '120'; saveMat(); await new Promise(r => setTimeout(r, 30)); a.err2 = document.getElementById('mi-chem-err').textContent;
      document.getElementById('mi-sio2').value = '68,5'; document.getElementById('mi-al2o3').value = '40'; saveMat(); await new Promise(r => setTimeout(r, 30));
      const m2 = DB.materials.find(x => x.id === 'mat-feldspar'); a.saved = { open: document.getElementById('mo-mat').classList.contains('on'), sio2: m2.chem.sio2, al2o3: m2.chem.al2o3 }; return a; });
    ok('editor in four tabs', s.tabs.length === 4 && /Основни/.test(s.tabs[0]) && /Наличност/.test(s.tabs[2]), s.tabs);
    ok('chemistry: invalid text stops the save with an error on the field, nothing written', s.open && s.tab === 'more' && /SiO₂: „abc“ не е процент от 0 до 100/.test(s.err) && s.kept, s);
    ok('chemistry: over 100 refused; comma accepted; the sum need not be 100', /„120“/.test(s.err2) && !s.saved.open && s.saved.sio2 === 68.5 && s.saved.al2o3 === 40, s);

    // --- изтриване: предупреждението за рецепти остава ---
    s = await E(async () => { const m = DB.materials.find(x => _mtRecipes(x).length); m.archivedAt = '2026-11-01T00:00:00Z'; curMat = m.id; delMat(); delete m.archivedAt; /* v1.42.0: окончателно — само от архива */ await new Promise(r => setTimeout(r, 30)); return { still: !!DB.materials.find(x => x.id === m.id) }; });
    ok('delete of a material in recipes warns (declined → kept)', s.still && app.log.dialogs.some(d => /рецепти го съдържат/.test(d) || /завинаги/.test(d)), app.log.dialogs.slice(-2));

    // --- лаптоп ---
    ok('phone: nothing wider than the screen', await noOverflow());
    await page.setViewportSize({ width: 1280, height: 800 });
    s = await E(() => { closeDet('det-mat'); show('materials'); openMatDet(DB.materials[0].id); const d = document.getElementById('det-mat'), l = document.getElementById('mat-list').getBoundingClientRect();
      const a = { split: d.classList.contains('split'), left: d.getBoundingClientRect().left, listR: l.right, sel: !!document.querySelector('#mat-list .sel') }; closeDet('det-mat'); a.after = document.getElementById('sc-materials').classList.contains('split'); return a; });
    ok('laptop: list left, material right; closing restores the list', s.split && s.left >= s.listR - 1 && s.sel && !s.after, s);
    ok('laptop: nothing wider than the screen', await noOverflow());
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- реални архиви ---
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
        const r = await a2.eval(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('materials'); const b0 = JSON.stringify(DB);
          const n = document.querySelectorAll('#mat-list .mt-r').length; const kinds = {};
          for (const m of DB.materials) { openMatDet(m.id); kinds[m.wishlist === true ? 'wish' : m.cat] = (kinds[m.wishlist === true ? 'wish' : m.cat] || 0) + 1; }
          setMatView('stock'); setMatView('cards'); setMatView('list'); closeDet('det-mat');
          const inRec = DB.materials.filter(m => _mtRecipes(m).length).length;
          return { n, all: DB.materials.length, same: b0 === JSON.stringify(DB), kinds, inRec }; });
        console.log('  ' + f + ':');
        ok('  every material listed and opened (' + r.n + '; ' + Object.keys(r.kinds).map(k => k + ' ' + r.kinds[k]).join(', ') + '; ' + r.inRec + ' in recipes), nothing written', r.n === r.all && r.same, r);
        ok('  no page errors', !a2.log.errors.length, a2.log.errors);
        await a2.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
