// v1.52.0 — внос и износ на рецепти: YAML от Glazy (истинският файл 131996 и файл с
// няколко рецепти), разпознаване на материалите (точно / запомнено / кандидати / няма),
// добавките над основата, повторен внос (пропусни / нова версия), износ и обратен внос
// без загуба; наличностите не се пипат; редакцията пази източника и добавките.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const GLAZY = fs.readFileSync(path.join(__dirname, 'fixtures', 'glazy-131996.yaml'), 'utf8');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 900) : '')); } };
const load = f => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8')).toString('base64'));

// Материали като в едно истинско ателие: двама кандидати за Silica, два рутила,
// фрита (не е Gerstley), пясък (не е силициево брашно), готова глазура с „Rutile“.
const MATS = [
  { id: 'gm-neph', name: 'Nepheline syenite', cat: 'base', stock: 1000 },
  { id: 'gm-sil', name: 'Silica микронизирана (325 меш)', cat: 'base', stock: 1000 },
  { id: 'gm-qf', name: 'Кварцово брашно W10', cat: 'base', stock: 1000 },
  { id: 'gm-sand', name: 'Кварцов пясък', cat: 'base', stock: null },
  { id: 'gm-frit', name: 'Калциево-боратна фрита RF3021', cat: 'base', stock: 1000 },
  { id: 'gm-kao', name: 'Каолин', cat: 'base', stock: 1000 },
  { id: 'gm-whit', name: 'Whiting (CaCO₃)', cat: 'base', wishlist: true, stock: null },
  { id: 'gm-talc', name: 'Talc', cat: 'base', wishlist: true },
  { id: 'gm-rut', name: 'Рутил - TiO₂ (Титаниев двуокис)', cat: 'base', stock: 100 },
  { id: 'gm-rut2', name: 'Рутил (Rutile)', cat: 'ox', wishlist: true },
  { id: 'gm-amaco', name: 'AMACO PC-20 Blue Rutile', cat: 'glaze', wishlist: true },
  { id: 'gm-bent', name: 'Бентонитена глина', cat: 'base', stock: 1000 }
];

(async () => {
  console.log('glazy:');
  if (!fs.existsSync(path.join(ROOT, 'domain', 'glazy.js'))) { console.log('  - not in this version'); return; }
  const G = await load('domain/glazy.js');

  // ── четене ──
  const p = G._glazyParseFile(GLAZY, 'Glazy_ID_131996_YAML.yaml');
  const d = p.drafts[0];
  ok('real Glazy file: one recipe, no errors', p.drafts.length === 1 && !p.errors.length, p.errors);
  ok('name, cone, source id/author/url/dates', d.name === "Lynette's Opal" && d.cone === '6' && d.temp === '' && d.source.id === '131996' && d.source.author === 'Olivier Hermia'
    && d.source.url === 'https://glazy.org/recipes/131996' && d.source.created === '2021-03-15' && d.source.modified === '2026-11-03', d.source);
  ok('atmosphere, surface, transparency, subtype, description, analysis kept', d.source.atmospheres.join() === 'Oxidation' && d.source.surface === 'Glossy' && d.source.transparency === 'Translucent'
    && d.source.subtype === 'Glaze - Blue - Rutile' && /personal favourite/.test(d.source.description) && d.source.analysis.TiO2 === 6.5824 && d.source.analysis.LOI === 7.1994);
  const base = d.ings.filter(i => !i.add).reduce((a, i) => a + i.pct, 0), add = d.ings.filter(i => i.add);
  ok('additives stay above the base (base 100 %, Rutile +8, Bentonite +2)', base === 100 && add.map(i => i.name + i.pct).join() === 'Rutile8,Bentonite2', { base, add });

  const multi = "# два рецепти\n- ID: 1\n  Name: 'Base ''A'''\n  Cone: '04'\n  Description: 'first line\n    continues here\n\n    second paragraph'\n  Ingredients:\n    - Name: Silica\n      Percentage: 60\n    - Name: \"Kaolin\"\n      Percentage: 40.5\n-\n  ID: 2\n  Name: B\n  Ingredients:\n    -\n      Name: 'Zinc Oxide'\n      Percentage: 100\n";
  const pm = G._glazyParseFile(multi, 'x.yml');
  ok('several recipes per file; quotes, multi-line text, both list styles', pm.drafts.length === 2 && pm.drafts[0].name === "Base 'A'" && pm.drafts[0].cone === '04'
    && pm.drafts[0].source.description === 'first line continues here\nsecond paragraph' && pm.drafts[0].ings[1].pct === 40.5 && pm.drafts[1].ings[0].name === 'Zinc Oxide', pm);
  const bad = G._glazyParseFile("- Name: X\n  Ingredients:\n    - Name: 'open\n", 'b.yaml');
  ok('broken file → a readable error, nothing imported', !bad.drafts.length && bad.errors.length === 1 && /YAML/.test(bad.errors[0]), bad);
  ok('recipe with no ingredients is reported, not imported', G._glazyParseFile('- Name: Empty\n', 'e.yaml').errors.length === 1);

  // ── разпознаване ──
  const M = n => G._glazyMatch(n, MATS);
  ok('exact name (case-insensitive)', M('Nepheline Syenite').kind === 'exact' && M('Nepheline Syenite').matId === 'gm-neph');
  ok('exact name ignoring the bracket: Whiting → Whiting (CaCO₃) (Wishlist)', M('Whiting').matId === 'gm-whit');
  ok('Silica: two candidates, sand is not offered', M('Silica').kind === 'candidates' && M('Silica').ids.join() === 'gm-sil,gm-qf', M('Silica'));
  ok('EP Kaolin: candidate, never automatic', M('EP Kaolin').kind === 'candidates' && !M('EP Kaolin').matId && M('EP Kaolin').ids.join() === 'gm-kao');
  ok('Rutile: both rutiles, not the ready-made glaze', M('Rutile').ids.join() === 'gm-rut,gm-rut2', M('Rutile'));
  ok('Gerstley Borate: nothing — the frit is a different material', M('Gerstley Borate').kind === 'none');
  ok('Zinc Oxide, Wollastonite: nothing', M('Zinc Oxide').kind === 'none' && M('Wollastonite').kind === 'none');
  const withAlias = MATS.map(m => m.id === 'gm-kao' ? Object.assign({}, m, { aliases: ['EP Kaolin'] }) : m);
  ok('remembered name → automatic', G._glazyMatch('EP Kaolin', withAlias).kind === 'alias' && G._glazyMatch('ep kaolin', withAlias).matId === 'gm-kao');
  ok('archived material is not offered', G._glazyMatch('Talc', MATS.map(m => m.id === 'gm-talc' ? Object.assign({}, m, { archivedAt: 'x' }) : m)).kind === 'none');

  // ── повторен внос ──
  const imported = Object.assign({ id: 'r-imp', version: 1 }, G._glazyRecipe(d, null));
  ok('duplicate by Glazy ID', G._glazyDuplicate(d, [imported]).recipe.id === 'r-imp' && G._glazyDuplicate(d, [imported]).newer === false);
  const d2 = JSON.parse(JSON.stringify(d)); d2.source.modified = '2026-12-01';
  ok('changed in Glazy since → offered as a new version', G._glazyDuplicate(d2, [imported]).newer === true);
  ok('no duplicate among unrelated recipes', G._glazyDuplicate(d, [{ id: 'x', name: "Lynette's Opal", ingredients: [] }]) === null);

  // ── износ и обратен внос ──
  const links = d.ings.map((i, k) => k === 3 ? { matId: 'gm-kao', name: 'Каолин' } : { matId: '__c', name: i.name });
  const rec = Object.assign({ id: 'r1', version: 2, lineageId: 'L', fav: true, temp: '1222', glazeType: 'gloss', notes: 'ред 1\nред „2“ — 50% \\ ok', versionNote: 'v2' }, G._glazyRecipe(d, links));
  rec.temp = '1222'; rec.glazeType = 'gloss'; rec.notes = 'ред 1\nред „2“ — 50% \\ ok'; rec.versionNote = 'v2'; rec.source.importedAt = '2026-11-08T10:00:00.000Z';
  const keep = r => JSON.stringify({ name: r.name, temp: r.temp, cone: r.cone, glazeType: r.glazeType, notes: r.notes, versionNote: r.versionNote, source: r.source,
    ings: r.ingredients.map(i => [i.name, Number(i.pct), !!i.add, i.srcName || i.name, i.srcId || ''] ) });
  const back = (text, fn) => { const q = G._glazyParseFile(text, fn); const x = q.drafts[0]; return { q, r: G._glazyRecipe(x, x.ings.map(i => ({ matId: '__c', name: i.name }))) }; };
  const meta = { appVersion: 'v1.52.0', now: '2026-11-08T12:00:00.000Z' };
  const y = G._recipeExportYaml([rec], meta), by = back(y, 'r.yaml');
  ok('YAML export → import: no loss (metadata, %, additives, source, Glazy names)', keep(by.r) === keep(rec), [keep(by.r), keep(rec)]);
  ok('YAML export keeps Glazy keys at the top', /^ID: 131996$/m.test(y.replace(/^-\n  /m, '').replace(/\n  /g, '\n')) && /Additional: true/.test(y) && /Percent Analysis:/.test(y));
  ok('YAML re-import is recognised as the same Glazy recipe', G._glazyDuplicate(by.q.drafts[0], [rec]).recipe.id === 'r1');
  const j = JSON.stringify(G._recipeExportJson([Object.assign({}, rec, { photo: 'data:image/png;base64,AAA' })], meta)), bj = back(j, 'r.json');
  ok('JSON export → import: no loss, photo kept', keep(bj.r) === keep(rec) && bj.r.photo === 'data:image/png;base64,AAA', [keep(bj.r), keep(rec)]);
  const own = { id: 'r-own', name: 'Моя', temp: '1240', cone: '', notes: '', glazeType: 'ash', ingredients: [{ matId: 'm1', name: 'Пепел', pct: 80 }, { matId: 'm3', name: 'Каолин', pct: 20 }] };
  const yo = back(G._recipeExportYaml([own], meta), 'o.yaml');
  ok('own recipe (no source): YAML round trip, duplicate by Glina id', keep(yo.r) === keep(own) && !yo.r.source && G._glazyDuplicate(yo.q.drafts[0], [own]).recipe.id === 'r-own', [keep(yo.r), keep(own)]);

  // ── в приложението ──
  const h = await H.start(ROOT);
  try {
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    const E = (fn, a) => app.eval(fn, a);
    // стартовите материали по подразбиране носят същите имена — тук остават само тези на теста
    await E(m => { const s = document.getElementById('splash'); if (s) s.remove(); DB.materials = DB.materials.filter(x => /^mat-/.test(x.id) && x.id !== 'mat-wish').concat(JSON.parse(m)); save(); show('recipes'); }, JSON.stringify(MATS));
    const stock0 = await E(() => JSON.stringify(DB.materials.map(m => [m.id, m.stock, m.alertAt])));
    let s = await E(t => { openRecImport(); _rimpLoad(t, 'Glazy_ID_131996_YAML.yaml'); const x = RIMP.drafts[0];
      return { n: RIMP.drafts.length, vals: x.links.map(l => l.val), kinds: x.links.map(l => l.m.kind), rows: document.querySelectorAll('#rimp-prev .rimp-i').length, btn: document.getElementById('rimp-go').textContent, dis: document.getElementById('rimp-go').disabled }; }, GLAZY);
    ok('preview: every ingredient with its status; unresolved default to name only', s.n === 1 && s.rows === 10 && s.vals.join() === 'gm-neph,__c,__c,__c,gm-whit,gm-talc,__c,__c,__c,__c' && s.kinds.join() === 'exact,candidates,none,candidates,exact,exact,none,none,candidates,candidates' && !s.dis, s);
    ok('nothing saved by the preview', (await E(() => DB.recipes.some(r => r.source))) === false);
    s = await E(() => { rimpSet(0, 1, 'gm-sil'); rimpSet(0, 2, '__new'); rimpSet(0, 3, 'gm-kao'); rimpSet(0, 8, 'gm-rut'); rimpSet(0, 9, 'gm-bent'); rimpRem(0, 9, false);
      const lbl = document.querySelectorAll('#rimp-prev .rimp-i label').length; rimpDo();
      const r = DB.recipes.find(x => x.source && x.source.id === '131996');
      return { lbl, r, kao: DB.materials.find(m => m.id === 'gm-kao').aliases, bent: DB.materials.find(m => m.id === 'gm-bent').aliases, sil: DB.materials.find(m => m.id === 'gm-sil').aliases,
        gb: DB.materials.filter(m => m.name === 'Gerstley Borate').map(m => [m.wishlist, m.stock, m.cat]), open: curRec === (r && r.id) };
    });
    const r = s.r;
    ok('imported: name, cone, empty temp and notes, source kept', r && r.name === "Lynette's Opal" && r.cone === '6' && r.temp === '' && r.notes === '' && r.source.analysis.ZnO === 4.5455 && !!r.source.importedAt && s.open, r);
    ok('ingredients linked as chosen; additives flagged', r && r.ingredients.map(i => i.matId === '__c' ? 'c:' + i.name : i.matId).join() === 'gm-neph,gm-sil,' + (r.ingredients[2].matId) + ',gm-kao,gm-whit,gm-talc,c:Zinc Oxide,c:Wollastonite,gm-rut,gm-bent'
      && r.ingredients.filter(i => i.add).map(i => i.matId).join() === 'gm-rut,gm-bent' && r.ingredients[3].srcName === 'EP Kaolin', r && r.ingredients);
    ok('„remember“ adds the Glazy name to the material only when asked', JSON.stringify(s.kao) === '["EP Kaolin"]' && JSON.stringify(s.sil) === '["Silica"]' && s.bent == null && s.lbl === 4, s);
    ok('missing material created once, as Wishlist without stock', JSON.stringify(s.gb) === '[[true,null,"base"]]', s.gb);
    const stock1 = await E(() => JSON.stringify(DB.materials.filter(m => m.name !== 'Gerstley Borate').map(m => [m.id, m.stock, m.alertAt])));
    ok('stock untouched by the import', stock1 === stock0);

    s = await E(() => { const r = DB.recipes.find(x => x.source && x.source.id === '131996'); openRecipeDet(r.id); document.getElementById('drec-batch').value = '1000'; calcG();
      const g = [...document.querySelectorAll('#drec-ings .rd-ing')].map(x => x.querySelector('.gv').textContent), tot = [...document.querySelectorAll('#drec-ings .rd-tot')].map(x => x.innerText.replace(/\s+/g, ' '));
      return { g, tot, sum: document.getElementById('drec-sum').textContent, warn: document.getElementById('drec-warn').textContent, src: (rdSec('src'), document.getElementById('drec-src').innerText), link: (document.querySelector('#drec-src a') || {}).href };
    });
    ok('calculator: additives as grams of the dry base, total 1100 g', s.g[8] === '80 г' && s.g[9] === '20 г' && s.tot.join('|') === 'Основа 100% 1000 г|Добавки +10% 100 г|Общо 110% 1100 г' && s.sum === 'Σ 100%' && !s.warn, s);
    ok('detail: „Източник“ with the link to Glazy', /Olivier Hermia/.test(s.src) && s.link === 'https://glazy.org/recipes/131996', s);

    // повторен внос: пропуска се; с по-нова дата — нова версия
    s = await E(t => { openRecImport(); _rimpLoad(t, 'x.yaml'); const x = RIMP.drafts[0]; return { act: x.act, newer: x.dup && x.dup.newer, dis: document.getElementById('rimp-go').disabled, kao: x.links[3].m.kind, opts: [...document.querySelectorAll('#rimp-prev .rimp-rec > select option')].map(o => o.value) }; }, GLAZY);
    ok('same file again: recognised, skipped, nothing to import', s.act === 'skip' && s.newer === false && s.dis && s.opts.join() === 'skip', s);
    ok('next import: the remembered name matches by itself', s.kao === 'alias', s);
    s = await E(t => { closeMo('mo-rimp'); const n = DB.recipes.length, old = JSON.stringify(DB.recipes.find(x => x.source && x.source.id === '131996'));
      openRecImport(); _rimpLoad(t.replace("Date Modified: '2026-11-03'", "Date Modified: '2026-12-01'"), 'x.yaml'); rimpAct(0, 'ver'); rimpDo();
      const all = DB.recipes.filter(x => x.source && x.source.id === '131996');
      return { n: DB.recipes.length - n, vers: all.map(x => x.version), same: all.every(x => _recLineage(x) === _recLineage(all[0])), oldSame: JSON.stringify(all.find(x => x.version === 1) && Object.assign({}, all.find(x => x.version === 1), { lineageId: undefined })) , oldWas: old };
    }, GLAZY);
    ok('changed in Glazy: imported as a new version of the same recipe, old one kept', s.n === 1 && s.vers.sort().join() === '1,2' && s.same, s);

    // редакцията пази източника и добавките; материалът пази другите имена
    s = await E(() => { const r = DB.recipes.find(x => x.source && x.source.id === '131996' && x.version === 2); openRecipeDet(r.id); editRecipe(); saveRecipe(); closeMo('mo-recipe');
      const r2 = DB.recipes.find(x => x.id === r.id); const m = DB.materials.find(x => x.id === 'gm-kao'); openMatMo(m); const f = document.getElementById('mi-aliases').value; saveMat();
      return { src: !!(r2.source && r2.source.analysis), add: r2.ingredients.filter(i => i.add).length, srcName: r2.ingredients[3].srcName, f, al: DB.materials.find(x => x.id === 'gm-kao').aliases };
    });
    ok('editing a recipe keeps source, additives and Glazy names', s.src && s.add === 2 && s.srcName === 'EP Kaolin', s);
    ok('material form shows and keeps the other names', s.f === 'EP Kaolin' && JSON.stringify(s.al) === '["EP Kaolin"]', s);
    s = await E(() => { const m = DB.materials.find(x => x.id === 'gm-kao'); openMatMo(m); document.getElementById('mi-aliases').value = ''; saveMat(); return DB.materials.find(x => x.id === 'gm-kao').aliases; });
    ok('clearing the other names removes them', s === undefined, s);

    // формулярът: добавка с бутона „+%“
    s = await E(() => { openRecipeMo(null); document.getElementById('ri-name').value = 'Тест добавки'; recIngs = [{ matId: 'gm-sil', name: 'x', pct: '60' }, { matId: 'gm-kao', name: 'y', pct: '40' }, { matId: 'gm-rut', name: 'z', pct: '5' }];
      renderIngRows(); document.querySelectorAll('#ri-ings .ri-add')[2].click(); const sum = document.getElementById('ri-sum').innerText.replace(/\s+/g, ' '); saveRecipe();
      const r = DB.recipes.find(x => x.name === 'Тест добавки'); return { sum, add: r && r.ingredients.map(i => !!i.add) };
    });
    ok('form: „+%“ marks an additive; Σ is the base, additives shown apart', /Σ 100%/.test(s.sum) && /\+5%/.test(s.sum) && s.add.join() === 'false,false,true', s);

    // износ: файлът се сваля, вносът му е същата рецепта (повторение → пропуска се)
    s = await E(() => { const r = DB.recipes.find(x => x.source && x.source.id === '131996' && x.version === 2); openRecipeDet(r.id); let got = null;
      const oc = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { got = this.download; }; recExport('yaml'); HTMLAnchorElement.prototype.click = oc;
      const y = _recipeExportYaml([r], { appVersion: APP_VERSION, now: 'x' }); openRecImport(); _rimpLoad(y, got); const x = RIMP.drafts[0];
      return { got, act: x.act, dupId: x.dup && x.dup.recipe.id === r.id, linked: r.ingredients.map((i, k) => i.matId === '__c' || (x.links[k].m.kind === 'exact' && x.links[k].m.matId === i.matId)) };
    });
    ok('export downloads a .yaml; re-import finds the same recipe and every linked material by exact name', /^glina_Lynette_s_Opal\.yaml$/.test(s.got) && s.act === 'skip' && s.dupId && s.linked.every(Boolean), s);

    // английски: прегледът няма български текст освен данните
    s = await E(t => { closeMo('mo-rimp'); setLanguage('en'); openRecImport(); _rimpLoad(t, 'x.yaml'); const txt = document.getElementById('mo-rimp').innerText; setLanguage('bg'); closeMo('mo-rimp');
      const data = JSON.stringify(DB); return (txt.match(/[А-Яа-я][А-Яа-я ]*/g) || []).filter(w => data.indexOf(w.trim()) < 0); }, GLAZY);
    ok('English: the import preview has no Bulgarian UI text', s.length === 0, s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
  } finally { await h.stop(); }
  console.log(failed ? 'FAILED ' + passed + ' passed, ' + failed + ' failed' : 'OK ' + passed + ' passed, 0 failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
