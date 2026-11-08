// v1.48.0 — двуезичен интерфейс, етап 1 (Е7 + Е8): речникът и надписите имат превод;
// на английски екраните от етап 1 нямат български текст освен данните; връщането към
// български дава същия текст; записите не зависят от езика; изборът се помни.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 1200) : '')); } };

// български текст на екрана, който не е част от данните
const LEAK = () => {
  window.__leak = (root) => {
    // данните + текстовете на Огнената скала (остават на български засега — решение от 3.11)
    const data = JSON.stringify(DB) + JSON.stringify(typeof KILNS !== 'undefined' ? KILNS : []) + FIRE_SCALE.map(x => x.l).join('|') + '|' + Object.values(typeof FIRE_KINDS !== 'undefined' ? FIRE_KINDS : {}).join('|') + '|' + (typeof FIRE_BODY_NOTE !== 'undefined' ? FIRE_BODY_NOTE : '') + JSON.stringify(FIRE_SCALE) + (typeof getAllLib === 'function' ? JSON.stringify(getAllLib()) : ''); // наръчниците и текстовете на скалата остават на български
    const txt = (root || document.body).innerText || '';
    const runs0 = (txt.match(/[А-Яа-яЁё][А-Яа-яЁё0-9 .,:;!?()\-–—„“"'/+%№×⌀]*/g) || []).map(x => x.trim().replace(/[\s.,:;!?\-–—(„“"']+$/, '').replace(/^[„“"']+/, '').replace(/\s+\/\d+$/, '').replace(/\s+\d+$/, '').replace(/\s*\([\d–\-\s°C]*$/, '').trim()).filter(Boolean);
    const dl = data.toLowerCase(), inData = r => dl.indexOf(r.toLowerCase()) >= 0 || dl.indexOf(JSON.stringify(r).slice(1, -1).toLowerCase()) >= 0;
    return [...new Set(runs0.filter(r => !inData(r) && !r.split(/\s*,\s*/).every(x => !x || inData(x))))];
  };
};

(async () => {
  console.log('i18n:');
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if (!/var EN_TX=/.test(src)) { console.log('  - not in this version'); process.exit(0); }

  // ── статично: Е7 ──
  const unq = x => x.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');
  const lits = [...src.matchAll(/(?<![\w$.])txf?\(\s*'((?:[^'\\\n]|\\.)*)'\s*[,)]|(?<![\w$.])txf?\(\s*"((?:[^"\\\n]|\\.)*)"\s*[,)]/g)].map(m => unq(m[1] != null ? m[1] : m[2]));
  const h = await H.start(ROOT);
  try {
    const a0 = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    let s = await a0.eval(lits => {
      const kb = Object.keys(DICT.bg), ke = Object.keys(DICT.en);
      const noEn = kb.filter(k => DICT.en[k] == null || DICT.en[k] === ''), noBg = ke.filter(k => DICT.bg[k] == null);
      const used = [...document.querySelectorAll('[data-t],[data-tp],[data-tt]')].flatMap(e => ['data-t', 'data-tp', 'data-tt'].map(a => e.getAttribute(a)).filter(Boolean));
      const noKey = [...new Set(used.filter(k => DICT.bg[k] == null))];
      const norm = x => x.replace(/\s+/g, ' ').trim();
      const stat = [...document.querySelectorAll('[data-tx]')].map(e => norm(e.getAttribute('data-bg') || e.textContent))
        .concat([...document.querySelectorAll('[data-txp]')].map(e => norm(e.getAttribute('data-txp-bg') || e.getAttribute('placeholder') || '')))
        .concat([...document.querySelectorAll('[data-txt]')].map(e => norm(e.getAttribute('data-txt-bg') || e.getAttribute('title') || '')))
        .concat([...document.querySelectorAll('[data-txa]')].map(e => norm(e.getAttribute('data-txa-bg') || e.getAttribute('aria-label') || '')));
      const noStat = [...new Set(stat.filter(x => x && EN_TX[x] == null))];
      const noLit = [...new Set(lits.filter(x => /[А-Яа-я]/.test(x) && EN_TX[x] == null))];
      const enCy = Object.entries(EN_TX).filter(([k, v]) => /[А-Яа-я]/.test(String(v).replace(/<[^>]*>/g, ''))).map(x => x[0]);
      const dictCy = Object.entries(DICT.en).filter(([k, v]) => /[А-Яа-я]/.test(v)).map(x => x[0]);
      const optNoVal = [...document.querySelectorAll('option[data-t],option[data-tx]')].filter(o => !o.hasAttribute('value')).length;
      return { nb: kb.length, noEn, noBg, noKey, noStat, noLit, enCy, dictCy, nlit: lits.length, nstat: stat.length, optNoVal };
    }, lits);
    ok(`E7: every dictionary key (${s.nb}) has English and nothing extra`, !s.noEn.length && !s.noBg.length, s);
    ok('E7: every data-t / data-tp / data-tt in the page has a key', !s.noKey.length, s.noKey);
    ok(`E7: every static label without a key (${s.nstat}) and every tx() text in the code (${s.nlit}) has English`, !s.noStat.length && !s.noLit.length, { stat: s.noStat, lit: s.noLit });
    ok('E7: no English entry is still Bulgarian', !s.enCy.length && !s.dictCy.length, { en: s.enCy, dict: s.dictCy });
    ok('translated <option>s keep a value of their own (the saved value never depends on the language)', s.optNoVal === 0, s.optNoVal);
    await a0.close();

    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const N = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      await app.page.setViewportSize(vp);
      const E = (f, x) => app.eval(f, x);
      await E(() => document.getElementById('splash')?.remove());
      await E(LEAK);
      app.acceptConfirms = true;
      // български отпечатък на екраните от етап 1 — за сравнението след връщане
      const SNAP = () => {
        const out = {};
        show('home'); out.home = document.getElementById('sc-home').innerText;
        show('pieces'); setPcView('gal'); out.gal = document.getElementById('sc-pieces').innerText; setPcView('list'); out.list = document.getElementById('sc-pieces').innerText; setPcView('gal');
        openPieceDet('p-ocarina'); out.piece = document.getElementById('det-piece').innerText; closeDet('det-piece');
        const se = DB.series[0]; openSeriesDet(se.id); out.series = document.getElementById('det-series').innerText; closeDet('det-series');
        show('fp'); switchFP('runs'); out.runs = document.getElementById('sc-fp').innerText; openRunDet('run-gl'); out.run = document.getElementById('det-run').innerText; closeDet('det-run');
        switchFP('profiles'); openFPDet('fp-bisque'); out.fp = document.getElementById('det-fp').innerText; closeDet('det-fp'); switchFP('runs');
        return out;
      };
      const bg0 = await E(SNAP);
      // превключвателят в Библиотеката
      s = await E(() => { show('lib'); const b = document.getElementById('lang-box'); const t0 = b.innerText; document.querySelector('#lang-box button[data-lang="en"]').click();
        return { t0, on: document.querySelector('#lang-box button.on').getAttribute('data-lang'), lang: LANG, html: document.documentElement.lang, ls: localStorage.getItem('atelie_lang'), lib: document.querySelector('#sc-lib .pt').textContent }; });
      ok(`${N} Library: „Език · Language“ switch; English applies at once and is remembered on the device`, /Език · Language/.test(s.t0) && s.on === 'en' && s.lang === 'en' && s.html === 'en' && s.ls === 'en' && s.lib === 'Library', s);

      // ── английски: етап 1 без български извън данните ──
      const L = await E(() => {
        const r = {};
        const chk = (k, el) => { r[k] = __leak(el); };
        show('home'); chk('home', document.getElementById('sc-home'));
        chk('nav', document.getElementById('nav'));
        show('pieces'); setPcView('gal'); chk('gallery', document.getElementById('sc-pieces')); setPcView('list'); chk('list', document.getElementById('sc-pieces')); setPcView('gal');
        togglePcFilters(); const side = document.getElementById('pc-side'); if (side) chk('filters', side); togglePcFilters();
        for (const id of DB.pieces.filter(p => !p.archivedAt).slice(0, 6).map(p => p.id)) { openPieceDet(id); document.querySelectorAll('#det-piece .pd-sec').forEach(x => x.classList.add('open')); chk('piece ' + id, document.getElementById('det-piece')); closeDet('det-piece'); }
        const se = DB.series[0]; openSeriesDet(se.id); chk('series', document.getElementById('det-series'));
        seUnitTap(7); chk('series selection', document.getElementById('det-series'));
        openUnitsMo('stage'); chk('units stage', document.getElementById('mo-units')); closeMo('mo-units');
        openUnitsMo('broken'); chk('units broken', document.getElementById('mo-units')); closeMo('mo-units');
        openSplitMo(_seSel.u); chk('split', document.getElementById('mo-split')); closeMo('mo-split'); sePickClear(); closeDet('det-series');
        addNew(); chk('quick new', document.getElementById('mo-piece')); piQkMode('made'); document.getElementById('pi-stage').value = 'fired'; _piQkFireSync(); chk('quick made', document.getElementById('mo-piece'));
        piQkDetail(); ['basic', 'mat', 'size', 'more'].forEach(t => { piTab(t); chk('full ' + t, document.getElementById('mo-piece')); }); closeMoAsk('mo-piece');
        openPieceDet('p-ocarina'); for (const ty of ['stage', 'progress', 'firing', 'decoration']) { openEventMo(ty); chk('step ' + ty, document.getElementById('mo-event')); closeMoAsk('mo-event'); }
        showEventTypePopup(); chk('step chooser', document.getElementById('ev-type-popup')); closeEvTypePopup(); closeDet('det-piece');
        // ── етап 2 (v1.49.0): изпичания, пещи, профили, план ──
        show('fp'); switchFP('runs'); chk('runs list', document.getElementById('sc-fp')); switchFP('kilns'); chk('kilns list', document.getElementById('sc-fp')); switchFP('profiles'); chk('profiles list', document.getElementById('sc-fp')); switchFP('runs');
        for (const fp of DB.firingProfiles) { openFPDet(fp.id); chk('profile ' + fp.id, document.getElementById('det-fp')); closeDet('det-fp'); }
        openFPMo(null); chk('profile form', document.getElementById('mo-fp')); closeMo('mo-fp');
        openRunMo(null); chk('run form', document.getElementById('mo-run')); closeMo('mo-run');
        openKilnMo(null); chk('kiln form', document.getElementById('mo-kiln')); closeMo('mo-kiln');
        const k = _kilnNew('kittec-cb80-double', uid); KILNS = [k];
        for (const st of ['planned', 'loaded', 'completed', 'interrupted']) for (const id of DB.firingRuns.map(r => r.id)) {
          const r = DB.firingRuns.find(x => x.id === id), o = r.state; r.state = st; if (st !== 'planned') { r.loadedAt = r.loadedAt || r.date; } if (!r.kilnId && _rnKilnMethod(r)) r.kilnId = k.id;
          openRunDet(id); ['prep', 'load', 'res'].forEach(t => { rnTab(t); chk('run ' + id + ' ' + st + ' ' + t, document.getElementById('det-run')); });
          r.state = o; closeDet('det-run'); }
        const rb = DB.firingRuns.find(x => x.id === 'run-bis'); rb.kilnId = k.id; openRunDet('run-bis');
        rnPickKiln(); chk('kiln picker', document.getElementById('mo-rn-pick')); closeMo('mo-rn-pick'); rnPickProfile(); chk('profile picker', document.getElementById('mo-rn-pick')); closeMo('mo-rn-pick');
        rnProgView('plan'); chk('program view', document.getElementById('mo-rprog')); closeMo('mo-rprog'); rnCompatView(); chk('compat view', document.getElementById('mo-rcompat')); closeMo('mo-rcompat');
        rb.state = 'loaded'; openRunDet('run-bis'); rnRanOpen(); chk('ran form', document.getElementById('mo-rran')); closeMoAsk('mo-rran');
        openRunAttach(); chk('attach pieces', document.getElementById('mo-run-attach')); closeMo('mo-run-attach'); openRunTestAttach(); chk('attach tests', document.getElementById('mo-run-tests')); closeMo('mo-run-tests');
        _openRunEnd(rb, 'completed'); chk('end form', document.getElementById('mo-run-end')); closeMo('mo-run-end'); rb.state = undefined;
        openPlan('run-bis'); setPlanKiln(k.id); addPlanLevel(); addPlanLevel(); chk('plan', document.getElementById('det-plan')); openPlanAdd(); chk('plan add', document.getElementById('mo-plan-add')); closeMo('mo-plan-add');
        ['scheme', 'exact'].forEach(m => { try { setPlanMode(m); chk('plan ' + m, document.getElementById('det-plan')); } catch (e) {} }); closePlan();
        // ── етап 3 (v1.50.0): материали, рецепти, тестове ──
        show('recipes'); chk('recipes list', document.getElementById('sc-recipes')); toggleRecFilters(); chk('recipes filters', document.getElementById('sc-recipes')); toggleRecFilters();
        for (const rc of DB.recipes) { openRecipeDet(rc.id); document.querySelectorAll('#det-recipe details').forEach(x => x.open = true); chk('recipe ' + rc.id, document.getElementById('det-recipe')); curRec = rc.id; openRecWork(); chk('recipe work', document.getElementById('rec-work')); closeDet('rec-work'); closeDet('det-recipe'); }
        openRecipeMo(null); chk('recipe form', document.getElementById('mo-recipe')); closeMo('mo-recipe');
        show('materials'); for (const tab of ['clays', 'base', 'ox', 'glaze', 'raw', 'mass', 'stock']) { try { switchMat(tab); chk('materials ' + tab, document.getElementById('sc-materials')); } catch (e) {} }
        toggleMatFilters(); chk('materials filters', document.getElementById('sc-materials')); toggleMatFilters();
        for (const m of DB.materials) { openMatDet(m.id); document.querySelectorAll('#det-mat details').forEach(x => x.open = true); chk('material ' + m.id, document.getElementById('det-mat')); closeDet('det-mat'); }
        curMat = DB.materials[0].id; openMatDet(curMat); openMatStock(); chk('stock form', document.getElementById('mo-mat-stock')); closeMo('mo-mat-stock'); closeDet('det-mat');
        editId = null; openMatMo(); chk('material form', document.getElementById('mo-mat')); closeMoAsk('mo-mat');
        const mass = DB.materials.find(x => x.cat === 'mass'); openMassMo(mass); chk('mass form', document.getElementById('mo-mass')); closeMoAsk('mo-mass');
        const raw = DB.materials.find(x => x.cat === 'raw'); if (raw) { curMat = raw.id; openMatDet(raw.id); openRawEventMo(); chk('raw event form', document.getElementById('mo-raw-event')); closeMoAsk('mo-raw-event'); closeDet('det-mat'); }
        openNotif(); chk('alerts', document.getElementById('notif-panel')); closeNotif();
        show('tests'); chk('tests list', document.getElementById('sc-tests')); toggleTestFilters(); chk('tests filters', document.getElementById('sc-tests')); toggleTestFilters();
        for (const t of DB.tests) { openTestDet(t.id); document.querySelectorAll('#det-test details').forEach(x => x.open = true); chk('test ' + t.id, document.getElementById('det-test')); closeDet('det-test'); }
        editId = null; openTestMo(); chk('test form', document.getElementById('mo-test')); closeMoAsk('mo-test');
        const tb = DB.tests.find(x => testKind(x) === 'body'); if (tb) { openTestDet(tb.id); openLimeCheck(); chk('lime check', document.getElementById('mo-lime')); closeMoAsk('mo-lime'); closeDet('det-test'); }
        TS.cmp = DB.tests.slice(0, 3).map(x => x.id); try { openTestCmp(); chk('compare', document.getElementById('ts-cmp')); closeDet('ts-cmp'); } catch (e) {}
        // ── етап 4 (v1.51.0): инструменти, Библиотека, помощ, обновяване ──
        show('lib'); const lb = document.getElementById('lang-box'); lb.style.display = 'none'; chk('library', document.getElementById('sc-lib')); lb.style.display = '';
        openHelp(); chk('help', document.getElementById('det-help')); closeDet('det-help');
        openSgCalc(); chk('sg', document.getElementById('mo-sg')); closeMo('mo-sg');
        openClayCalc(); chk('clay calc', document.getElementById('mo-clay')); closeMo('mo-clay');
        openFireScale(); chk('fire scale', document.getElementById('mo-fscale')); closeMo('mo-fscale');
        openLibAdd(); chk('article form', document.getElementById('mo-lib')); closeMoAsk('mo-lib');
        showUpdateToast(); chk('update bar', document.getElementById('upd-bar')); document.getElementById('upd-bar').style.display = 'none';
        return r;
      });
      const bad = Object.entries(L).filter(([k, v]) => v.length);
      if (process.env.I18N_DUMP) fs.writeFileSync(process.env.I18N_DUMP, JSON.stringify(L, null, 1));
      ok(`${N} English: home, navigation, catalog (gallery, list, filters), piece and series detail, units, split, quick and full form, steps — no Bulgarian outside the data`, !bad.length, Object.fromEntries(bad));

      // ── обратно на български: същият текст ──
      await E(() => setLanguage('bg'));
      const bg1 = await E(SNAP);
      const diff = Object.keys(bg0).filter(k => bg0[k] !== bg1[k]);
      ok(`${N} back to Bulgarian: home, catalog, piece and series detail read exactly as before`, !diff.length, diff.map(k => [k, bg0[k].slice(0, 200), bg1[k].slice(0, 200)]));
      await E(() => setLanguage('en'));
      // ── записите не зависят от езика ──
      s = await E(() => {
        const nv = o => { const a = JSON.parse(JSON.stringify(o)); delete a.updatedAt; Object.keys(a).forEach(k => { if (a[k] === '' || a[k] == null) delete a[k]; }); return JSON.stringify(Object.keys(a).sort().map(k => [k, a[k]])); };
        const b0 = JSON.stringify(DB.pieces.find(x => x.id === 'p-ocarina'));
        curPiece = 'p-ocarina'; editPiece(); savePiece(); const same = nv(JSON.parse(b0)) === nv(DB.pieces.find(x => x.id === 'p-ocarina'));
        show('pieces'); addNew(); piQkDetail(); document.getElementById('pi-name').value = 'EN piece'; document.getElementById('pi-tech').value = document.getElementById('pi-tech').options[1].value;
        const lab = document.getElementById('pi-tech').options[1].textContent; renderPiCats(); const cb = [...document.querySelectorAll('#pi-cats .fchip')].find(x => x.getAttribute('data-c') === 'Скулптура'); const cl = cb.textContent; cb.click();
        document.getElementById('pi-stage').value = 'bone-dry'; savePiece(); const p = DB.pieces[0];
        return { same, d: same ? '' : (() => { const A = Object.fromEntries(JSON.parse(nv(JSON.parse(b0)))), B = Object.fromEntries(JSON.parse(nv(DB.pieces.find(x => x.id === 'p-ocarina')))); return [...new Set(Object.keys(A).concat(Object.keys(B)))].filter(k => JSON.stringify(A[k]) !== JSON.stringify(B[k])).map(k => k + ':' + JSON.stringify(A[k]).slice(0, 200) + ' => ' + JSON.stringify(B[k]).slice(0, 200)); })(), lab, cl, tech: p.technique, cats: p.categories, stage: p.stage };
      });
      ok(`${N} editing in English and saving unchanged keeps the record; technique, category and stage are stored as before (Bulgarian value / code)`, s.same && s.lab === 'Throwing' && s.cl === 'Sculpture' && s.tech === 'Точене' && JSON.stringify(s.cats) === '["Скулптура"]' && s.stage === 'bone-dry', s);

      ok(`${N} no page errors`, !app.log.errors.length, app.log.errors);
      await app.close();
    }

    // ── изборът оцелява презареждане ──
    {
      const a = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1', atelie_lang: 'en' } });
      s = await a.eval(() => { document.getElementById('splash')?.remove(); show('home'); return { lang: LANG, nav: document.getElementById('nav').innerText, home: document.querySelector('#sc-home .pt') ? document.querySelector('#sc-home .pt').textContent : '' }; });
      ok('a remembered English opens in English (navigation, home)', s.lang === 'en' && /Pieces/i.test(s.nav) && /Materials/i.test(s.nav) && !/Изделия/i.test(s.nav), s);
      ok('no page errors (remembered language)', !a.log.errors.length, a.log.errors);
      await a.close();
    }

    // ── реалните архиви на английски ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json')).sort()) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const v6 = JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db || raw));
      const a = await h.open({ seed: { atelie_v6: v6 }, localStorage: { atelie_idb_active: '1', atelie_lang: 'en' } });
      await a.eval(() => document.getElementById('splash')?.remove()); await a.eval(LEAK);
      s = await a.eval(() => { const b0 = JSON.stringify(DB), r = {};
        show('home'); r.home = __leak(document.getElementById('sc-home')); show('pieces'); r.gal = __leak(document.getElementById('sc-pieces'));
        DB.pieces.forEach(p => { openPieceDet(p.id); const l = __leak(document.getElementById('det-piece')); if (l.length) r['p ' + p.name] = l; closeDet('det-piece'); });
        (DB.series || []).forEach(x => { openSeriesDet(x.id); const l = __leak(document.getElementById('det-series')); if (l.length) r['s ' + x.name] = l; closeDet('det-series'); });
        const bad = Object.fromEntries(Object.entries(r).filter(([k, v]) => v.length)); return { bad, same: b0 === JSON.stringify(DB) }; });
      ok(`  ${f}: English — home, catalog, every piece and series detail without Bulgarian outside the data; nothing written`, !Object.keys(s.bad).length && s.same, s);
      ok(`  ${f}: no page errors`, !a.log.errors.length, a.log.errors);
      await a.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
