// v1.40.1 — единен модел на навигацията (одит Г1–Г3).
// Всеки преход към свързан запис се прави с истинско докосване на връзката и се
// проверява: новият детайл е видим и е единственият видим; предишният не го покрива;
// на лаптоп нищо не се застъпва със списъка; „Назад“ (браузърът) връща точно към
// предишния екран със същия запис; незапазеното е защитено; новите записи имат
// правилната рецепта и версия. Накрая — дълга верига от 20 прехода и обратно.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

const DET = { openPieceDet: 'det-piece', openSeriesDet: 'det-series', openRecipeDet: 'det-recipe', openTestDet: 'det-test', openMatDet: 'det-mat', openRunDet: 'det-run', openFPDet: 'det-fp' };
const CUR = { 'det-piece': 'curPiece', 'det-series': 'curSeries', 'det-recipe': 'curRec', 'det-test': 'curTest', 'det-mat': 'curMat', 'det-run': 'curRun', 'det-fp': 'curFP' };

// Състояние в страницата: кои детайли се виждат и какво е под точка вдясно.
const STATE = () => {
  const vis = [...document.querySelectorAll('.det.on')].filter(d => getComputedStyle(d).visibility !== 'hidden' && getComputedStyle(d).display !== 'none');
  const x = innerWidth - 80, y = Math.round(innerHeight / 2);
  const e = document.elementFromPoint(x, y), c = e && e.closest('.mo.on,.det.on,.sc');
  const t = vis[0], tr = t && t.getBoundingClientRect();
  const list = document.querySelector('.sc.on'), lr = list && list.getBoundingClientRect();
  const cur = { 'det-piece': curPiece, 'det-series': curSeries, 'det-recipe': curRec, 'det-test': curTest, 'det-mat': curMat, 'det-run': curRun, 'det-fp': curFP };
  const lx = 60, le = document.elementFromPoint(lx, y), lc = le && le.closest('.mo.on,.det.on,.sc');
  return { vis: vis.map(d => d.id), hit: c ? c.id : null, left: lc ? lc.id : null, rec: t ? cur[t.id] : null, dl: tr ? Math.round(tr.left) : null,
    stack: _overlayStack.length, mo: [...document.querySelectorAll('.mo.on')].map(m => m.id), scr: cur, sc: (document.querySelector('.sc.on') || {}).id };
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('nav:');
    const run = async (label, seed, vp, body) => {
      const app = await h.open({ seed: { atelie_v6: seed }, localStorage: { atelie_idb_active: '1' } });
      if (!(await app.eval(() => typeof _navLayer === 'function'))) { console.log('  - not in this version'); await app.close(); return; }
      await app.page.setViewportSize(vp);
      await app.eval(() => { const s = document.getElementById('splash'); if (s) s.remove(); });
      const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
      const st = () => E(STATE);
      const inApp = () => !/__blank/.test(app.page.url());
      const back = async () => { await app.page.goBack({ waitUntil: 'commit' }).catch(() => {}); await W(400); };
      // Докосване на връзка в горния видим детайл (или в списъка), чийто onclick съвпада.
      const tap = async (scope, re) => {
        const r = await E(([sc, src]) => { const rx = new RegExp(src); const root = sc === 'top' ? [...document.querySelectorAll('.det.on')].find(d => getComputedStyle(d).visibility !== 'hidden') : document.querySelector(sc);
          if (!root) return null; const el = [...root.querySelectorAll('[onclick]')].find(x => rx.test(x.getAttribute('onclick')) && x.offsetParent !== null) || [...root.querySelectorAll('[onclick]')].find(x => rx.test(x.getAttribute('onclick')));
          if (!el) return null; const o = el.getAttribute('onclick'); el.scrollIntoView({ block: 'center' }); el.click(); return o; }, [scope, re.source]);
        await W(300); return r;
      };
      const expect = (s, det, rec) => s.vis.length === 1 && s.vis[0] === det && s.hit === det && (rec == null || s.rec === rec);
      console.log('  ' + label + ':');
      await body({ app, E, W, st, back, tap, inApp, expect });
      ok('    no page errors', !app.log.errors.length, app.log.errors);
      await app.close();
    };

    // ── отделните преходи от одита, на телефон и на лаптоп ──
    for (const vp of [{ width: 390, height: 844 }, { width: 1366, height: 860 }]) {
      const wide = vp.width >= 1100;
      await run(wide ? 'laptop — преходите от Г1/Г2' : 'phone — преходите от Г1/Г2', FIX, vp, async ({ app, E, W, st, back, tap, inApp, expect }) => {
        await E(() => { const p = DB.pieces.find(x => x.id === 'p-done'); p.material = 'mat-engobe'; });
        const CASES = [
          // [екран, отваряне от списъка (selector), детайл/запис, връзка, очакван детайл/запис]
          ['tests', "openTestDet('t-glaze')", 'det-test', 't-glaze', /openRecipeDet\('rec-ash-2'\)/, 'det-recipe', 'rec-ash-2'],
          ['tests', "openTestDet('t-glaze')", 'det-test', 't-glaze', /openFPDet\('fp-glaze'\)/, 'det-fp', 'fp-glaze'],
          ['tests', "openTestDet('t-glaze')", 'det-test', 't-glaze', /openRunDet\('run-gl'\)/, 'det-run', 'run-gl'],
          ['tests', "openTestDet('t-body')", 'det-test', 't-body', /openMatDet\('mat-xi-mass'\)/, 'det-mat', 'mat-xi-mass'],
          ['materials', "openMatDet('mat-feldspar')", 'det-mat', 'mat-feldspar', /openRecipeDet\('rec-ash/, 'det-recipe', null],
          ['materials', "openMatDet('mat-xi-mass')", 'det-mat', 'mat-xi-mass', /openPieceDet\('p-ocarina'\)/, 'det-piece', 'p-ocarina'],
          ['materials', "openMatDet('mat-xi-mass')", 'det-mat', 'mat-xi-mass', /openTestDet\('t-body'\)/, 'det-test', 't-body'],
          ['materials', "openMatDet('mat-xi')", 'det-mat', 'mat-xi', /openMatDet\('mat-xi-mass'\)/, 'det-mat', 'mat-xi-mass'],
          ['recipes', "openRecipeDet('rec-ash')", 'det-recipe', 'rec-ash', /openPieceDet\('p-standalone'\)/, 'det-piece', 'p-standalone'],
          ['recipes', "openRecipeDet('rec-ash-2')", 'det-recipe', 'rec-ash-2', /openMatDet\('mat-feldspar'\)/, 'det-mat', 'mat-feldspar'],
          ['recipes', "openRecipeDet('rec-ash-2')", 'det-recipe', 'rec-ash-2', /openTestDet\('t-glaze'\)/, 'det-test', 't-glaze'],
          ['pieces', "openPieceDet('p-ocarina')", 'det-piece', 'p-ocarina', /open(?:RunDet|RunResult)\('run-bis'/, 'det-run', 'run-bis'],
          ['pieces', "openPieceDet('p-standalone')", 'det-piece', 'p-standalone', /openRecipeDet\('rec-ash'\)/, 'det-recipe', 'rec-ash'],
          ['pieces', "openPieceDet('p-done')", 'det-piece', 'p-done', /openMatDet\('mat-engobe'\)/, 'det-mat', 'mat-engobe'],
          ['pieces', "openPieceDet('p-yellow')", 'det-piece', 'p-yellow', /openSeriesDet\('se-plates'\)/, 'det-series', 'se-plates'],
          ['pieces', "openSeriesDet('se-plates')", 'det-series', 'se-plates', /openPieceDet\('p-yellow'\)/, 'det-piece', 'p-yellow'],
          ['pieces', "openSeriesDet('se-plates')", 'det-series', 'se-plates', /open(?:RunDet|RunResult)\('run-gl'/, 'det-run', 'run-gl'],
          ['fp', "openRunDet('run-bis')", 'det-run', 'run-bis', /openPieceDet\('p-ocarina'\)/, 'det-piece', 'p-ocarina'],
          ['fp', "openRunDet('run-bis')", 'det-run', 'run-bis', /openSeriesDet\('se-plates'\)/, 'det-series', 'se-plates'],
          ['fp', "openRunDet('run-gl')", 'det-run', 'run-gl', /openTestDet\('t-glaze'\)/, 'det-test', 't-glaze'],
          ['fp', "openFPDet('fp-glaze')", 'det-fp', 'fp-glaze', /openTestDet\('t-glaze'\)/, 'det-test', 't-glaze'],
        ];
        for (const [scr, open, d0, r0, link, d1, r1] of CASES) {
          await E(([s, o]) => { show(s); if (s === 'fp' && /FPDet/.test(o)) switchFP('profiles'); if (s === 'fp' && /RunDet/.test(o)) switchFP('runs'); }, [scr, open]); await W(150);
          // от списъка — с докосване, ако го има; иначе направо
          const fromList = await tap('.sc.on', new RegExp(open.replace(/[()]/g, '\\$&')));
          if (!fromList) await E(o => eval(o), open);
          await W(200);
          const s0 = await st();
          const o = await tap('top', link);
          const s1 = await st();
          const panel = !wide || (s1.dl >= 400 && s1.left !== d1) || s1.dl === 0;
          ok(`    ${d0}(${r0}) → ${d1}${r1 ? '(' + r1 + ')' : ''}: visible, alone, on top${wide ? ', no overlap' : ''}`, !!o && expect(s0, d0, r0) && expect(s1, d1, r1) && panel, { o, s0, s1 });
          await back();
          const s2 = await st();
          ok(`      back → ${d0}(${r0})`, inApp() && expect(s2, d0, r0), s2);
          await back();
          const s3 = await st();
          ok(`      back → ${scr} list`, inApp() && s3.vis.length === 0 && s3.stack === 0 && s3.sc === 'sc-' + scr, s3);
        }
        // „Сравни“ → „Отвори“ → назад към сравнението → назад към списъка
        await E(() => { show('tests'); TS.cmp = false; toggleTestCmp(); });
        await W(150);
        await tap('#tests-list', /tsTap\('t-glaze'\)/); await tap('#tests-list', /tsTap\('t-body'\)/);
        await tap('#ts-cbar', /openTestCmp/);
        let s = await st();
        const o = await tap('top', /openTestDet\('t-body'\)/);
        const s1 = await st();
        ok('    „Сравни“ → „Отвори“: the test is visible, the comparison under it', expect(s, 'ts-cmp') && !!o && expect(s1, 'det-test', 't-body'), { s, s1 });
        await back(); s = await st();
        ok('      back → the comparison, same tests', inApp() && expect(s, 'ts-cmp') && (await E(() => TS.picked.join(','))) === 't-glaze,t-body', s);
        await back(); s = await st();
        ok('      back → tests list', inApp() && s.vis.length === 0 && s.sc === 'sc-tests', s);
        await E(() => { TS.cmp = false; TS.picked = []; renderTests(); });

        if (wide) {
          // лаптоп: верига в десния панел; нов избор от списъка я сменя изцяло
          await E(() => show('tests')); await W(150);
          await tap('#tests-list', /tsTap\('t-glaze'\)/);
          s = await st();
          const sp = await E(() => document.getElementById('det-test').classList.contains('split'));
          await tap('top', /openRecipeDet\('rec-ash-2'\)/);
          const s1 = await st();
          ok('    laptop: test beside the list; recipe takes the same panel, list stays visible', sp && expect(s, 'det-test', 't-glaze') && expect(s1, 'det-recipe', 'rec-ash-2') && s1.left === 'sc-tests' && s1.dl === s.dl, { s, s1 });
          await tap('#tests-list', /tsTap\('t-body'\)/);
          s = await st();
          ok('    laptop: picking another test in the list replaces the chain (one step)', expect(s, 'det-test', 't-body') && s.stack === 1 && s.left === 'sc-tests', s);
          await back(); s = await st();
          ok('      back → list', inApp() && s.vis.length === 0 && s.stack === 0, s);
        }
      });
    }

    // ── формуляри от рецептата: правилна връзка, защита на незапазеното ──
    await run('phone — формуляри и защита', FIX, { width: 390, height: 844 }, async ({ app, E, W, st, back, tap, inApp, expect }) => {
      await E(() => show('recipes')); await W(150);
      await tap('.sc.on', /openRecipeDet\('rec-ash-2'\)/);
      // + Тест
      await tap('top', /newTestFromRecipe/);
      let f = await E(() => ({ v: document.getElementById('ti-rec').value, txt: document.getElementById('ti-rec').selectedOptions[0].textContent, dirty: _moIsDirty('mo-test'), mo: [...document.querySelectorAll('.mo.on')].map(m => m.id) }));
      ok('    „+ Тест“: the exact version is selected (rec:rec-ash-2, shown with v2), form not dirty', f.v === 'rec:rec-ash-2' && /v2/.test(f.txt) && !f.dirty && f.mo[0] === 'mo-test', f);
      await back();
      let s = await st();
      ok('      untouched form, back → the recipe again (not out of the app)', inApp() && s.mo.length === 0 && expect(s, 'det-recipe', 'rec-ash-2'), s);
      await tap('top', /newTestFromRecipe/);
      await E(() => { document.getElementById('ti-notes').value = 'важно наблюдение'; });
      const d0 = app.log.dialogs.length;
      await back(); await back();
      s = await st();
      const asked = app.log.dialogs.slice(d0).filter(x => /незапазени/.test(x)).length;
      ok('    typed text + back, back: asked both times, form still open, still in the app', inApp() && asked === 2 && s.mo[0] === 'mo-test' && (await E(() => document.getElementById('ti-notes').value)) === 'важно наблюдение', { asked, s });
      await E(() => { document.getElementById('ti-temp').value = '1240'; document.getElementById('ti-hold').value = '10'; document.getElementById('ti-date').value = '2026-11-01'; saveTest(); });
      await W(400);
      s = await st();
      const nt = await E(() => { const t = DB.tests.find(x => x.notes === 'важно наблюдение'); return t && { rec: t.recipeId, mat: t.materialId, kind: testKind(t) }; });
      ok('    saved test is linked to rec-ash-2 (not the base version), kind glaze', nt && nt.rec === 'rec-ash-2' && !nt.mat && nt.kind === 'glaze', nt);
      ok('      after saving, the recipe is shown again and lists the new test', expect(s, 'det-recipe', 'rec-ash-2') && (await E(() => (document.getElementById('det-recipe').innerText.match(/2026-11-01/g) || []).length)) >= 1, s);
      // + Изделие
      await tap('top', /newPieceFromRecipe/);
      f = await E(() => ({ v: document.getElementById('pi-rec').value, dirty: _moIsDirty('mo-piece') }));
      ok('    „+ Изделие“: the exact version is selected, form not dirty', f.v === 'rec:rec-ash-2' && !f.dirty, f);
      await E(() => { document.getElementById('pi-name').value = 'Купа от рецептата'; savePiece(); }); await W(400);
      const np = await E(() => { const p = DB.pieces.find(x => x.name === 'Купа от рецептата'); return p && { rec: p.recipe, mat: p.material || '' }; });
      s = await st();
      ok('    saved piece is linked to rec-ash-2; back on the recipe', np && np.rec === 'rec-ash-2' && !np.mat && expect(s, 'det-recipe', 'rec-ash-2'), { np, s });
      // Нова версия
      await tap('top', /newRecipeVersion/);
      s = await st();
      await back();
      const s2 = await st();
      ok('    „Нова версия“ + back → the recipe (not out of the app)', s.mo[0] === 'mo-recipe' && inApp() && s2.mo.length === 0 && expect(s2, 'det-recipe', 'rec-ash-2'), { s, s2 });
      // Редакция: формулярът над детайла, назад и запазване връщат в детайла
      await tap('top', /editRecipe/);
      await back(); s = await st();
      ok('    „Редактирай“ + back → the recipe', inApp() && s.mo.length === 0 && expect(s, 'det-recipe', 'rec-ash-2'), s);
      await back(); s = await st();
      ok('      back → recipes list', inApp() && s.vis.length === 0 && s.stack === 0, s);
      // Дива глина → „Направи маса“
      await E(() => show('materials')); await W(150);
      await tap('.sc.on', /openMatDet\('mat-xi'\)/);
      await tap('top', /openMassFromRaw/);
      f = await E(() => ({ mo: [...document.querySelectorAll('.mo.on')].map(m => m.id), dirty: _moIsDirty('mo-mass') }));
      await back(); s = await st();
      ok('    raw clay → „Направи маса“ (prefilled, not dirty) + back → the raw clay', f.mo[0] === 'mo-mass' && !f.dirty && inApp() && s.mo.length === 0 && expect(s, 'det-mat', 'mat-xi'), { f, s });
      await tap('top', /openMassFromRaw/);
      await E(() => { document.getElementById('ms-name').value = 'Xi чиста 2'; });
      const d1 = app.log.dialogs.length;
      await E(() => { [...document.querySelectorAll('#mo-mass .mo-x, #mo-mass button')].find(b => /closeMoAsk/.test(b.getAttribute('onclick') || '')).click(); }); await W(300);
      s = await st();
      ok('    the × button asks too, form stays', app.log.dialogs.length === d1 + 1 && s.mo[0] === 'mo-mass', s);
      app.acceptConfirms = true;
      await back(); s = await st();
      ok('      confirmed discard → back on the raw clay, nothing saved', inApp() && s.mo.length === 0 && expect(s, 'det-mat', 'mat-xi') && !(await E(() => DB.materials.some(m => m.name === 'Xi чиста 2'))), s);
      app.acceptConfirms = false;
      // Тест → редакция → запазване → детайлът със същия запис
      await E(() => show('tests')); await W(150);
      await tap('.sc.on', /tsTap\('t-body'\)/);
      await tap('top', /editTest/);
      await E(() => { document.getElementById('ti-notes').value = 'ново'; saveTest(); }); await W(400);
      s = await st();
      ok('    edit test + save → the test detail with the change', expect(s, 'det-test', 't-body') && /ново/.test(await E(() => document.getElementById('dtest-notes').textContent)), s);
      await back(); s = await st();
      ok('      back → tests list', inApp() && s.vis.length === 0 && s.stack === 0, s);
    });

    // ── дълга верига: 20 прехода напред, 20 назад; изгледът и филтрите остават ──
    const chain = async (label, seed, vp, steps) => run(label, seed, vp, async ({ app, E, W, st, back, tap, inApp, expect }) => {
      await E(() => { show('materials'); for (let i = 0; i < 40; i++) DB.materials.push({ id: 'navfill' + i, cat: 'base', name: 'Пълнеж ' + i }); setMatView('list'); renderMaterials(); });
      await W(200);
      // позицията в списъка: записът се докосва там, където си е — без превъртане от теста
      const scroll0 = await E(() => { const m = document.getElementById('main'); const r = [...document.querySelectorAll('#mat-list [onclick*="openMatDet"]')].find(x => { const id = x.getAttribute('onclick').match(/openMatDet\('([^']+)'/)[1]; const mm = DB.materials.find(y => y.id === id); return mm && !/^navfill/.test(id) && _mtRecipes(mm).length; });
        r.scrollIntoView({ block: 'center' }); const sc = m.scrollTop; r.click(); return sc; });
      await W(300);
      const path = [await st()];
      const seen = new Set();
      for (let i = 0; i < steps; i++) {
        const pick = await E(seenArr => { const d = [...document.querySelectorAll('.det.on')].find(x => getComputedStyle(x).visibility !== 'hidden'); if (!d) return null;
          const ls = [...d.querySelectorAll('[onclick]')].map(x => x.getAttribute('onclick')).map(o => (o.replace(/^openRunResult\('([^']+)','[^']*'\)$/, "openRunDet('$1')").match(/^(?:event\.stopPropagation\(\);)?(open(?:Piece|Series|Recipe|Test|Mat|Run|FP)Det)\('([^']+)'\)$/) || [])).filter(m => m[1]);
          const curOf = { 'det-piece': curPiece, 'det-series': curSeries, 'det-recipe': curRec, 'det-test': curTest, 'det-mat': curMat, 'det-run': curRun, 'det-fp': curFP };
          const DT = { openPieceDet: 'det-piece', openSeriesDet: 'det-series', openRecipeDet: 'det-recipe', openTestDet: 'det-test', openMatDet: 'det-mat', openRunDet: 'det-run', openFPDet: 'det-fp' };
          const other = ls.filter(m => !(DT[m[1]] === d.id && curOf[d.id] === m[2])); // връзка към самия него не е преход
          const fresh = other.find(m => seenArr.indexOf(m[1] + m[2]) < 0) || other[0]; return fresh ? [fresh[1], fresh[2]] : null; }, [...seen]);
        if (!pick) break;
        seen.add(pick[0] + pick[1]);
        await tap('top', new RegExp('^(event\\.stopPropagation\\(\\);)?' + (pick[0] === 'openRunDet' ? 'open(?:RunDet|RunResult)' : pick[0]) + "\\('" + pick[1].replace(/[-]/g, '\\-') + "'(,'[^']*')?\\)$"));
        const s = await st();
        const good = expect(s, DET[pick[0]], pick[1]);
        if (!good) { ok(`    step ${i + 1}: ${pick[0]}(${pick[1]})`, false, s); break; }
        path.push(s);
      }
      ok(`    ${path.length - 1} transitions forward, each visible, alone, with its record`, path.length - 1 >= Math.min(steps, 15), path.map(p => p.vis[0] + ':' + p.rec));
      let okBack = true, where = null;
      for (let i = path.length - 2; i >= 0; i--) {
        await back();
        const s = await st();
        if (!(inApp() && expect(s, path[i].vis[0], path[i].rec))) { okBack = false; where = { i, want: path[i].vis[0] + ':' + path[i].rec, got: s }; break; }
      }
      ok('    back through every step, in reverse, same records', okBack, where);
      await back();
      const s = await st();
      const keep = await E(() => ({ view: MT.view, scroll: document.getElementById('main').scrollTop, sc: (document.querySelector('.sc.on') || {}).id }));
      ok('    and back to the materials list: same view, scroll kept, still in the app', inApp() && s.stack === 0 && s.vis.length === 0 && keep.sc === 'sc-materials' && keep.view === 'list' && Math.abs(keep.scroll - scroll0) < 40, { s, keep, scroll0 });
    });
    await chain('phone — дълга верига', FIX, { width: 390, height: 844 }, 20);
    await chain('laptop — дълга верига', FIX, { width: 1366, height: 860 }, 20);
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        await chain('phone — дълга верига, ' + f, JSON.stringify(raw.db || raw), { width: 390, height: 844 }, 20);
        if (/10-30/.test(f)) await chain('laptop — дълга верига, ' + f, JSON.stringify(raw.db || raw), { width: 1366, height: 860 }, 20);
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
