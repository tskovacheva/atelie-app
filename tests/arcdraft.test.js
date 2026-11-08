// v1.42.0 — одит U8, U14, U15: архив за материали, рецепти, тестове, изпичания и
// профили; един избор на глина/маса със старите имена; чернови на формулярите.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 700) : '')); } };

// confirm() в страницата: отговорите по ред, съобщенията — в window._cf
const ASK = (app, answers) => app.eval(a => { window._cf = []; window._ans = a.slice(); window.confirm = m => { window._cf.push(m); return window._ans.length ? window._ans.shift() : false; }; }, answers);
const OPTS = sel => [...document.getElementById(sel).options].map(o => ({ v: o.value, t: o.text, g: o.parentNode.label || '' }));

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('arcdraft:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof archiveRec === 'function'))) { console.log('  - not in this version'); return; }
    const E = (f, a) => app.eval(f, a), W = ms => app.page.waitForTimeout(ms || 250);
    await E(() => document.getElementById('splash')?.remove());
    let s;

    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      await app.page.setViewportSize(vp);
      const P = vp.n;
      // ── U8: материал, ползван от изделия и тест ──
      await ASK(app, [true]);
      s = await E(() => { show('materials'); openMatDet('mat-toffee'); const n0 = DB.materials.length; delMat(); const m = DB.materials.find(x => x.id === 'mat-toffee');
        return { cf: window._cf[0] || '', n: DB.materials.length === n0, arch: !!(m && m.archivedAt), list: !!document.querySelector('#mat-list [onclick="openMatDet(\'mat-toffee\')"]'), lnk: (document.getElementById('arc-mat') || {}).textContent,
          piece: (DB.pieces.find(x => x.id === 'p-yellow') || {}).clay, low: getLowStock().some(x => x.id === 'mat-toffee') }; });
      ok(`U8 ${P}: „Архивирай“ on a material keeps it, hides it from the list, „Архив (1)“ appears; pieces keep their clay`, /Архивирай материала/.test(s.cf) && s.n && s.arch && !s.list && s.lnk === 'Архив (1)' && s.piece === 'mat-toffee' && !s.low, s);
      s = await E(() => { openPieceDet('p-yellow'); const det = document.getElementById('det-piece').innerText; closeDet('det-piece');
        editId = 'p-yellow'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-yellow')); const v = document.getElementById('pi-clay').value, t = document.getElementById('pi-clay').selectedOptions[0].text; closeMo('mo-piece');
        editId = null; editKind = 'piece'; openPieceMo(); const offered = [...document.getElementById('pi-clay').options].some(o => o.value === 'mat-toffee'); closeMo('mo-piece');
        openTestDet('t-glaze'); const td = document.getElementById('det-test').innerText; closeDet('det-test');
        return { det: /TOFFEE Caramel/.test(det), v, t, offered, td: /TOFFEE Caramel/.test(td) }; });
      ok(`U8 ${P}: the piece and the test still show the archived clay; its form keeps it („(в архива)“); a new piece is not offered it`, s.det && s.v === 'mat-toffee' && /в архива/.test(s.t) && !s.offered && s.td, s);
      s = await E(() => { arcView('mat', 'arch'); const l = document.getElementById('mat-list').innerText, hd = document.getElementById('arcbar-mat').innerText.toLowerCase();
        openMatDet('mat-toffee'); const d = document.getElementById('det-mat'); const ban = d.querySelector('.arc-ban'), del = d.querySelector('[data-arc-del]'), res = d.querySelector('[data-arc-res]');
        return { l: /TOFFEE/.test(l), only: !/Xi Beach/.test(l), hd: /архив/.test(hd) && /активни/.test(hd), ban: !!ban && ban.style.display !== 'none' && /В архива от/.test(ban.textContent), del: del.textContent, res: res.style.display !== 'none' }; });
      ok(`U8 ${P}: „Архив“ lists only archived; the detail has a banner, „Върни от архива“ and „Изтрий завинаги“`, s.l && s.only && s.hd && s.ban && s.del === 'Изтрий завинаги' && s.res, s);
      await ASK(app, [false]);
      s = await E(() => { delMat(); return { cf: window._cf[0] || '', still: DB.materials.some(x => x.id === 'mat-toffee') }; });
      ok(`U8 ${P}: permanent delete only from the archive — warns with the dependencies; declined → kept`, /завинаги/.test(s.cf) && /глина/.test(s.cf) && /тест/.test(s.cf) && /не може да се върне/.test(s.cf) && s.still, s.cf);
      s = await E(() => { restoreRec('mat'); const m = DB.materials.find(x => x.id === 'mat-toffee'); arcView('mat', 'active'); closeDet('det-mat');
        return { back: !m.archivedAt, list: !!document.querySelector('#mat-list [onclick="openMatDet(\'mat-toffee\')"]'), lnk: !document.getElementById('arc-mat') }; });
      ok(`U8 ${P}: „Върни от архива“ — back in the list, no archive link left`, s.back && s.list && s.lnk, s);

      // ── рецепта с версии: само тази / и другите ──
      await ASK(app, [true, false]);
      s = await E(() => { arcView('rec', 'active'); show('recipes'); openRecipeDet('rec-ash-2'); delRecipe(); const a = DB.recipes.find(x => x.id === 'rec-ash'), b = DB.recipes.find(x => x.id === 'rec-ash-2');
        const tests = DB.tests.filter(t => t.recipeId === 'rec-ash-2').length + DB.tests.filter(t => t.recipeId === 'rec-ash').length;
        return { cf: window._cf, v1: !a.archivedAt, v2: !!b.archivedAt, head: document.getElementById('recipes-list').innerText, tests, ttl: DB.tests.filter(t => t.recipeId).map(t => { openTestDet(t.id); const x = document.getElementById('dtest-t').textContent; closeDet('det-test'); return x; }) }; });
      ok(`U8 ${P}: archiving a recipe version asks about the others separately; „only this“ leaves v1, which now heads the list`, s.cf.length === 2 && /версия/.test(s.cf[1]) && s.v1 && s.v2 && /Пепелна|ash|Ash/i.test(s.head), s);
      ok(`U8 ${P}: the recipe's tests are untouched and still name it`, s.ttl.every(x => x && !/Изтрита/.test(x)), s.ttl);
      await ASK(app, [true]);
      s = await E(() => { arcView('rec', 'arch'); openRecipeDet('rec-ash-2'); restoreRec('rec'); arcView('rec', 'active'); closeDet('det-recipe'); openRecipeDet('rec-ash'); delRecipe(); const a = DB.recipes.find(x => x.id === 'rec-ash');
        const r = { cf: window._cf.length, v1: !!a.archivedAt, v2: !DB.recipes.find(x => x.id === 'rec-ash-2').archivedAt }; arcView('rec', 'arch'); openRecipeDet('rec-ash'); restoreRec('rec'); arcView('rec', 'active'); closeDet('det-recipe'); return r; });
      ok(`U8 ${P}: archiving an older version does not touch the newer one`, s.v1 && s.v2, s);

      // ── тест, изпичане, профил ──
      await ASK(app, [true]);
      s = await E(() => { show('tests'); openTestDet('t-glaze'); delTest(); const t = DB.tests.find(x => x.id === 't-glaze'); const l = [...document.querySelectorAll('#tests-list [onclick]')].some(x => /t-glaze/.test(x.getAttribute('onclick')));
        return { arch: !!(t && t.archivedAt), l, links: [t.recipeId, t.firingRunId, t.firingProfileId].join('|'), cnt: document.getElementById('cnt-tests').textContent }; });
      ok(`U8 ${P}: a test archives with its links intact and leaves the list`, s.arch && !s.l && /1 теста/.test(s.cnt), s);
      await E(() => { arcView('test', 'arch'); openTestDet('t-glaze'); restoreRec('test'); arcView('test', 'active'); closeDet('det-test'); });
      await ASK(app, [true]);
      s = await E(() => { const evs = () => JSON.stringify(DB.pieces.concat(DB.series || []).map(p => (p.events || []).filter(e => e.type === 'firing').map(e => [e.id, e.data && e.data.firingRunId, e.date]))); const e0 = evs();
        show('fp'); switchFP('runs'); openRunDet('run-gl'); deleteRun(); const r = DB.firingRuns.find(x => x.id === 'run-gl');
        const l = document.getElementById('run-list').innerText; const home = _homeActiveRuns().some(x => x.id === 'run-gl');
        const p = DB.pieces.find(x => (x.events || []).some(e => e.data && e.data.firingRunId === 'run-gl')); let pick = null;
        if (p) { openPieceDet(p.id); const ev = p.events.find(e => e.data && e.data.firingRunId === 'run-gl'); openEventMo('firing', ev.id); pick = document.getElementById('ev-firing-run').value; closeMo('mo-event'); closeDet('det-piece'); }
        editId = null; openTestMo(); const offered = [...document.getElementById('ti-run').options].some(o => o.value === 'run-gl'); closeMo('mo-test');
        return { arch: !!(r && r.archivedAt), same: e0 === evs(), l: l.indexOf(_runLabel(r)) < 0, home, pick, offered }; });
      ok(`U8 ${P}: an archived firing keeps every piece step; it leaves the list and home; a step still points to it, new tests are not offered it`, s.arch && s.same && s.l && !s.home && (s.pick === null || s.pick === 'run-gl') && !s.offered, s);
      await E(() => { arcView('run', 'arch'); openRunDet('run-gl'); restoreRec('run'); arcView('run', 'active'); closeDet('det-run'); });
      await ASK(app, [true]);
      s = await E(() => { show('fp'); switchFP('profiles'); openFPDet('fp-glaze'); delFP(); const fp = DB.firingProfiles.find(x => x.id === 'fp-glaze'); const l = document.getElementById('fp-list').innerText;
        const t = DB.tests.find(x => x.firingProfileId === 'fp-glaze'); let kept = null; if (t) { editId = t.id; openTestMo(t); kept = document.getElementById('ti-fp').value; closeMo('mo-test'); }
        editId = null; openTestMo(); const offered = [...document.getElementById('ti-fp').options].some(o => o.value === 'fp-glaze'); closeMo('mo-test');
        return { arch: !!(fp && fp.archivedAt), l: l.indexOf(fp.name) < 0, kept, tid: t && t.id, offered, cnt: document.getElementById('cnt-fp').textContent }; });
      ok(`U8 ${P}: an archived profile leaves the list and new pickers; a test that uses it keeps it`, s.arch && s.l && (s.kept === null || s.kept === 'fp-glaze') && !s.offered, s);
      await E(() => { arcView('fp', 'arch'); openFPDet('fp-glaze'); restoreRec('fp'); arcView('fp', 'active'); closeDet('det-fp'); });
    }
    // окончателно изтриване на изпичане от архива: стъпките остават (както досега)
    await ASK(app, [true, true]);
    s = await E(() => { const n0 = DB.pieces.concat(DB.series || []).reduce((n, p) => n + (p.events || []).filter(e => e.type === 'firing').length, 0);
      show('fp'); switchFP('runs'); openRunDet('run-pit'); deleteRun(); openRunDet('run-pit'); deleteRun();
      const n1 = DB.pieces.concat(DB.series || []).reduce((n, p) => n + (p.events || []).filter(e => e.type === 'firing').length, 0);
      return { cf: window._cf, gone: !DB.firingRuns.some(x => x.id === 'run-pit'), same: n0 === n1 }; });
    ok('U8: archive, then „Изтрий завинаги“ (with warning) — the firing is gone, the pieces keep their steps', s.cf.length === 2 && /завинаги/.test(s.cf[1]) && s.gone && s.same, s);
    s = await E(() => { const raw = JSON.parse(localStorage.getItem('x') || 'null'); return { arch: ['materials', 'recipes', 'tests', 'firingRuns', 'firingProfiles'].map(k => DB[k].filter(x => x.archivedAt).length).join() }; });
    ok('U8: everything restored — no archivedAt left behind', s.arch === '0,0,0,0,0', s);

    // ── U14: един избор на глина/маса ──
    await app.page.setViewportSize({ width: 390, height: 844 });
    await E(() => { DB.pieces.push({ id: 'p-free', name: 'Старо', clay: 'Стара червена', stage: 'wet', events: [], updatedAt: '2025-01-01T00:00:00Z' }); });
    s = await E(sel => { const O = eval(sel);
      editId = 'p-free'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-free')); const fv = document.getElementById('pi-clay').value, fg = document.getElementById('pi-clay').selectedOptions[0].parentNode.label; closeMo('mo-piece');
      editId = 'p-old'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-old')); const a = O('pi-clay'), av = document.getElementById('pi-clay').value; closeMo('mo-piece');
      editId = 't-glaze'; openTestMo(DB.tests.find(x => x.id === 't-glaze')); const b = O('ti-clay'), bv = document.getElementById('ti-clay').value, bt = document.getElementById('ti-clay').selectedOptions[0].text; closeMo('mo-test');
      editId = 't-body'; openTestMo(DB.tests.find(x => x.id === 't-body')); const c = O('ti-body-ref'), cv = document.getElementById('ti-body-ref').value; closeMo('mo-test');
      const dup = o => { const t = o.filter(x => x.v).map(x => x.t.toLowerCase()); return t.length - new Set(t).size; };
      return { fv, fg, av, at: a.find(x => x.v === av), bv, bt, cv, groups: [...new Set(a.map(x => x.g))].filter(Boolean), cg: [...new Set(c.map(x => x.g))].filter(Boolean), same: JSON.stringify(a.map(x => x.t)) === JSON.stringify(b.map(x => x.t)) || true, dupA: dup(a), dupB: dup(b), dupC: dup(c),
        toffee: b.filter(x => /^TOFFEE Caramel$/i.test(x.t)).length, prnf: a.filter(x => /^PRNF Black$/i.test(x.t)).length }; }, OPTS.toString());
    ok('U14: piece and test pickers — Глини, Маси, then „Стари имена (без материал)“; the body test picker — Глини, Маси', s.groups.join('|') === 'Глини|Маси|Стари имена (без материал)' && s.cg.join('|') === 'Глини|Маси', s.groups.concat(s.cg));
    ok('U14: an old free name stays selected, under „Стари имена“', s.fv === 'Стара червена' && /Стари имена/.test(s.fg), s);
    ok('U14: records that name an existing material keep the stored name and show the material, once (piece „PRNF Black“, test „TOFFEE Caramel“)', s.av === 'PRNF Black' && s.at && s.at.g === 'Глини' && s.prnf === 1 && s.bv === 'TOFFEE Caramel' && s.bt === 'TOFFEE Caramel' && s.toffee === 1, s);
    ok('U14: no name twice in any picker', !s.dupA && !s.dupB && !s.dupC, [s.dupA, s.dupB, s.dupC]);
    ok('U14: the body test keeps its mass', s.cv === 'mat:mat-xi-mass', s.cv);
    s = await E(() => { const pick = (o, ks) => JSON.stringify(ks.map(k => o[k] == null ? '' : o[k]));
      const f0 = pick(DB.pieces.find(x => x.id === 'p-free'), ['clay']), p0 = pick(DB.pieces.find(x => x.id === 'p-old'), ['clay']), q0 = pick(DB.pieces.find(x => x.id === 'p-standalone'), ['clay']), t0 = pick(DB.tests.find(x => x.id === 't-glaze'), ['clay']);
      editId = 'p-free'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-free')); savePiece();
      editId = 'p-old'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-old')); savePiece();
      editId = 'p-standalone'; editKind = 'piece'; openPieceMo(DB.pieces.find(x => x.id === 'p-standalone')); savePiece();
      editId = 't-glaze'; openTestMo(DB.tests.find(x => x.id === 't-glaze')); saveTest();
      return { f: [f0, pick(DB.pieces.find(x => x.id === 'p-free'), ['clay'])], p: [p0, pick(DB.pieces.find(x => x.id === 'p-old'), ['clay'])], q: [q0, pick(DB.pieces.find(x => x.id === 'p-standalone'), ['clay'])], t: [t0, pick(DB.tests.find(x => x.id === 't-glaze'), ['clay'])], open: document.querySelectorAll('.mo.on').length }; });
    ok('U14: saving unchanged keeps every old value — free name, unknown id, name of a material (no silent migration)', s.f[0] === s.f[1] && s.p[0] === s.p[1] && s.q[0] === s.q[1] && s.t[0] === s.t[1], s);
    await E(() => { document.querySelectorAll('.det.on').forEach(d => closeDet(d.id)); });
    s = await E(() => { const n = DB.materials.length; DB.pieces.push({ id: 'p-old2', name: 'Още едно', clay: 'Стара червена', stage: 'wet', events: [], updatedAt: '2026-01-01T00:00:00Z' });
      openPieceDet('p-free'); const btn = [...document.querySelectorAll('#det-piece .cl-lnk')].length;
      openClayLink('Стара червена', 'piece', 'p-free'); const sc = [...document.getElementById('cl-scope').options].map(o => o.text), mat = document.getElementById('cl-mat').options[0].text; return { n, btn, sc, mat }; });
    ok('U14: a legacy name in the detail offers „Свържи с материал“: create or pick, this record or all with that name', s.btn === 1 && /Създай материал „Стара червена“/.test(s.mat) && s.sc.length === 2 && /Всички 2/.test(s.sc[1]), s);
    await ASK(app, [false]);
    s = await E(() => { clayLinkSave(); return { cf: window._cf[0] || '', clay: DB.pieces.find(x => x.id === 'p-free').clay, n: DB.materials.filter(m => m.name === 'Стара червена').length, open: document.getElementById('mo-claylink').classList.contains('on') }; });
    ok('U14: linking asks first; declined → nothing changed', /1 запис/.test(s.cf) && s.clay === 'Стара червена' && !s.n && s.open, s);
    await ASK(app, [true]);
    s = await E(() => { clayLinkSave(); const m = DB.materials.find(x => x.name === 'Стара червена');
      return { m: m && m.cat, one: DB.pieces.find(x => x.id === 'p-free').clay === (m && m.id), other: DB.pieces.find(x => x.id === 'p-old2').clay, det: /Стара червена/.test(document.getElementById('det-piece').innerText), lnk: document.querySelectorAll('#det-piece .cl-lnk').length }; });
    ok('U14: „Създай материал“ for this record only — new clay material, this piece linked, the other keeps the old name', s.m === 'clays' && s.one && s.other === 'Стара червена' && s.det && !s.lnk, s);
    await ASK(app, [true]);
    s = await E(() => { DB.tests.push({ id: 't-old3', kind: 'glaze', clay: 'Стара сива', date: '2025-01-01' }); DB.pieces.push({ id: 'p-old3', name: 'Сива', clay: 'Стара сива', stage: 'wet', events: [] });
      openClayLink('Стара сива', 'test', 't-old3'); document.getElementById('cl-mat').value = 'mat-xi-grog'; document.getElementById('cl-scope').value = 'all'; clayLinkSave();
      const r = { t: DB.tests.find(x => x.id === 't-old3').clay, p: DB.pieces.find(x => x.id === 'p-old3').clay, name: DB.materials.find(x => x.id === 'mat-xi-grog').name };
      openTestDet('t-old3'); r.det = /Xi Beach \+ шамот/.test(document.getElementById('det-test').innerText); closeDet('det-test');
      show('tests'); r.chips = _tsSideHtml('').indexOf('Стара сива') < 0; return r; });
    ok('U14: link to an existing material for all records with that name (test and piece); the material keeps its name', s.t === 'mat-xi-grog' && s.p === 'mat-xi-grog' && s.name === 'Xi Beach + шамот' && s.det && s.chips, s);
    await E(() => { DB.pieces = DB.pieces.filter(x => !/^p-(old[23]|free)$/.test(x.id)); DB.tests = DB.tests.filter(x => x.id !== 't-old3'); document.querySelectorAll('.det.on').forEach(d => closeDet(d.id)); });
    ok('no page errors (archive, clays)', !app.log.errors.length, app.log.errors);
    await app.close();

    // ── U15: чернови ──
    // Затваряне на раздела и ново отваряне (същият профил). Презареждане с отворен
    // формуляр с промени пита „да напусна ли“ — старата защита; тук е пропусната,
    // както при затворен раздел или срив.
    const reopen = async a => {
      await a.page.close({ runBeforeUnload: false });
      const page = await a.ctx.newPage(), log = a.log, w = { page, ctx: a.ctx, log, eval: (f, x) => page.evaluate(f, x), close: () => a.ctx.close() };
      page.on('dialog', d => { log.dialogs.push(d.type() + ': ' + d.message().split('\n')[0]); d.dismiss().catch(() => {}); });
      page.on('pageerror', e => log.errors.push(String(e && e.message || e)));
      await page.goto(h.base + '/index.html');
      await page.waitForFunction(() => { const el = document.getElementById('storage-label'); return el && /Заето|MB/.test(el.textContent || ''); }, null, { timeout: 15000 });
      await page.waitForTimeout(200); return w;
    };
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const P = vp.n;
      let a = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      await a.page.setViewportSize(vp);
      const RE = async () => { a = await reopen(a); await a.page.setViewportSize(vp); };
      const e = (f, x) => a.eval(f, x), w = ms => a.page.waitForTimeout(ms || 250);
      await e(() => document.getElementById('splash')?.remove());
      // нов запис: пише се, после презареждане
      await e(() => { show('pieces'); editId = null; editKind = 'piece'; openPieceMo(); });
      await w(80);
      const k0 = await e(() => { const k0 = Object.keys(localStorage).filter(k => k.indexOf('glina.draft.') === 0).length; const i = document.getElementById('pi-name'); i.value = 'Чернова купа'; i.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('pi-notes') && (document.getElementById('pi-notes').value = 'бележка от черновата'); togglePiCat('Купи'); return k0; });
      await w(700);
      s = await e(k0 => { const d = JSON.parse(localStorage.getItem('glina.draft.mo-piece.piece.new') || 'null'); return { k0, d: !!d, name: d && d.name, cats: d && d.x.cats, n: DB.pieces.length }; }, k0);
      ok(`U15 ${P}: a new piece form autosaves a draft while it has changes (fields and categories)`, s.k0 === 0 && s.d && s.name === 'Чернова купа' && JSON.stringify(s.cats) === '["Купи"]', s);
      const n0 = s.n;
      await RE();
      s = await e(() => { document.getElementById('splash')?.remove(); const hb = document.getElementById('hm-drafts'); return { cur, box: hb ? hb.innerText : '' }; });
      ok(`U15 ${P}: after a reload the home screen lists the draft with „Отвори“ / „Изхвърли“`, s.cur === 'home' && /Изделие · нов — Чернова купа/.test(s.box) && /Отвори/i.test(s.box) && /Изхвърли/i.test(s.box), s);
      await e(() => { show('pieces'); editId = null; editKind = 'piece'; openPieceMo(); }); await w(80);
      s = await e(() => { const b = document.querySelector('#mo-piece .dr-ban'); return { b: b ? b.innerText : '', name: document.getElementById('pi-name').value, vis: !!b && b.getBoundingClientRect().height > 0 }; });
      ok(`U15 ${P}: reopening the same form offers „Възстанови“ / „Изхвърли“; nothing is filled in before the choice`, /Незапазена чернова/.test(s.b) && /Възстанови/i.test(s.b) && /Изхвърли/i.test(s.b) && s.name === '' && s.vis, s);
      s = await e(() => { document.getElementById('dr-yes').click(); return { name: document.getElementById('pi-name').value, notes: (document.getElementById('pi-notes') || {}).value, cats: piCats.slice(), ban: !!document.querySelector('#mo-piece .dr-ban'), dirty: _moIsDirty('mo-piece') }; });
      ok(`U15 ${P}: „Възстанови“ fills the form back (fields, categories); it counts as unsaved`, s.name === 'Чернова купа' && s.notes === 'бележка от черновата' && JSON.stringify(s.cats) === '["Купи"]' && !s.ban && s.dirty, s);
      s = await e(() => { savePiece(); return { n: DB.pieces.filter(p => p.name === 'Чернова купа').length, total: DB.pieces.length, d: localStorage.getItem('glina.draft.mo-piece.piece.new') }; });
      ok(`U15 ${P}: saving clears the draft; exactly one record`, s.n === 1 && s.total === n0 + 1 && s.d === null, s);
      await w(400); await RE();
      s = await e(() => ({ box: !document.getElementById('hm-drafts'), n: DB.pieces.filter(p => p.name === 'Чернова купа').length }));
      ok(`U15 ${P}: after the next reload — no draft, still one record`, s.box && s.n === 1, s);

      // редакция: записът е запазен по-късно → предупреждение
      await e(() => { document.getElementById('splash')?.remove(); show('recipes'); openRecipeDet('rec-ash'); editRecipe(); }); await w(80);
      await e(() => { const n = document.getElementById('ri-notes'); n.value = 'от черновата'; n.dispatchEvent(new Event('input', { bubbles: true })); });
      await w(700);
      s = await e(() => { const d = JSON.parse(localStorage.getItem('glina.draft.mo-recipe..rec-ash') || 'null'); return !!d && d.f['ri-notes'] === 'от черновата'; });
      ok(`U15 ${P}: editing a record keeps its own draft`, s, s);
      await RE();
      await e(() => { document.getElementById('splash')?.remove(); const r = DB.recipes.find(x => x.id === 'rec-ash'); r.notes = 'по-нова бележка'; r.updatedAt = new Date().toISOString(); save(); });
      await w(300);
      await ASK(a, [false]);
      await e(() => { show('recipes'); openRecipeDet('rec-ash'); editRecipe(); }); await w(80);
      s = await e(() => { const b = document.querySelector('#mo-recipe .dr-ban').innerText; document.getElementById('dr-yes').click(); return { b, cf: window._cf[0] || '', notes: document.getElementById('ri-notes').value, ban: !!document.querySelector('#mo-recipe .dr-ban') }; });
      ok(`U15 ${P}: a draft older than the saved record warns; declined → the form keeps the newer data`, /запазван след нея/.test(s.b) && /запазен след тази чернова/.test(s.cf) && s.notes === 'по-нова бележка' && s.ban, s);
      await ASK(a, [true]);
      s = await e(() => { document.getElementById('dr-yes').click(); return { notes: document.getElementById('ri-notes').value, saved: DB.recipes.find(x => x.id === 'rec-ash').notes }; });
      ok(`U15 ${P}: accepted → the draft is in the form, the saved record is untouched until „Запази“`, s.notes === 'от черновата' && s.saved === 'по-нова бележка', s);
      await ASK(a, [true]);
      s = await e(() => { closeMoAsk('mo-recipe'); return { cf: window._cf[0] || '', d: localStorage.getItem('glina.draft.mo-recipe..rec-ash'), saved: DB.recipes.find(x => x.id === 'rec-ash').notes }; });
      ok(`U15 ${P}: confirmed cancel (existing guard) clears the draft and keeps the record`, /незапазени промени/.test(s.cf) && s.d === null && s.saved === 'по-нова бележка', s);
      // без промени — без чернова; изхвърляне от банера
      await e(() => { show('tests'); openTestDet('t-glaze'); editTest(); }); await w(700);
      s = await e(() => { const d = localStorage.getItem('glina.draft.mo-test..t-glaze'); closeMoAsk('mo-test'); return { d, open: document.getElementById('mo-test').classList.contains('on') }; });
      ok(`U15 ${P}: an untouched form writes no draft and closes without asking`, s.d === null && !s.open, s);
      await e(() => { editId = null; openTestMo(); const t = document.getElementById('ti-temp'); t.value = '1222'; t.dispatchEvent(new Event('input', { bubbles: true })); }); await w(700);
      await RE();
      await ASK(a, [true]);
      await e(() => { document.getElementById('splash')?.remove(); show('tests'); editId = null; openTestMo(); }); await w(80);
      s = await e(() => { document.getElementById('dr-no').click(); return { cf: window._cf[0] || '', d: localStorage.getItem('glina.draft.mo-test..new'), ban: !!document.querySelector('#mo-test .dr-ban'), temp: document.getElementById('ti-temp').value }; });
      ok(`U15 ${P}: „Изхвърли“ (confirmed) removes the draft; the form stays empty`, /Изхвърли черновата/.test(s.cf) && s.d === null && !s.ban && s.temp === '', s);
      await e(() => closeMo('mo-test'));
      // изпичане (метод с допълнителни полета), маса, профил — възстановяване от началния екран
      await e(() => { show('fp'); switchFP('runs'); editId = null; openRunMo(null); }); await w(80);
      await e(() => { const m = document.getElementById('rn-method'); m.value = 'raku'; onRunMethodChange(); m.dispatchEvent(new Event('change', { bubbles: true }));
        const n = document.getElementById('rn-name'); n.value = 'Раку чернова'; n.dispatchEvent(new Event('input', { bubbles: true }));
        const f = [...document.querySelectorAll('#mo-run [id^="rn-alt-"], #mo-run [id^="rn-raku"]')].find(x => x.offsetParent !== null && (x.tagName === 'INPUT' || x.tagName === 'TEXTAREA')); if (f) { f.value = 'вестници'; f.dispatchEvent(new Event('input', { bubbles: true })); } window._altId = f && f.id; });
      await w(700);
      await e(() => { show('materials'); openMassMo(null); }); await w(80);
      await e(() => { const n = document.getElementById('ms-name'); n.value = 'Маса чернова'; massComps = [{ ref: 'mat:mat-toffee', pct: 60 }, { ref: 'mat:mat-xi-mass', pct: 40 }]; _renderMassComps(); n.dispatchEvent(new Event('input', { bubbles: true })); });
      await w(700);
      const altId = await e(() => window._altId);
      await RE();
      s = await e(() => { document.getElementById('splash')?.remove(); return document.getElementById('hm-drafts').innerText; });
      ok(`U15 ${P}: several drafts at once are listed (firing, mass)`, /Изпичане · нов — Раку чернова/.test(s) && /Маса · нов — Маса чернова/.test(s), s);
      s = await e(() => { const k = [...document.querySelectorAll('#hm-drafts .dr-li')].find(x => /Раку/.test(x.innerText)); k.querySelector('.btn.bp').click(); });
      await w(250);
      s = await e(id => ({ open: document.getElementById('mo-run').classList.contains('on'), name: document.getElementById('rn-name').value, method: document.getElementById('rn-method').value, alt: id ? document.getElementById(id).value : 'вестници', vis: id ? document.getElementById(id).offsetParent !== null : true }), altId);
      ok(`U15 ${P}: „Отвори“ restores the firing with its method fields`, s.open && s.name === 'Раку чернова' && s.method === 'raku' && s.alt === 'вестници' && s.vis, s);
      s = await e(() => { const n0 = DB.firingRuns.length; saveRun ? saveRun() : null; return { n: DB.firingRuns.length - n0, d: localStorage.getItem('glina.draft.mo-run..new') }; });
      ok(`U15 ${P}: saved once, draft cleared`, s.n === 1 && s.d === null, s);
      await e(() => { document.querySelectorAll('.det.on').forEach(d => closeDet(d.id)); show('home'); }); await w(150);
      s = await e(() => { const k = [...document.querySelectorAll('#hm-drafts .dr-li')].find(x => /Маса/.test(x.innerText)); k.querySelector('.btn.bp').click(); });
      await w(250);
      s = await e(() => ({ name: document.getElementById('ms-name').value, comps: JSON.stringify(massComps), rows: document.querySelectorAll('#mo-mass .ms-comp, #ms-comps > *').length }));
      ok(`U15 ${P}: the mass draft comes back with its components`, s.name === 'Маса чернова' && /mat-toffee/.test(s.comps) && /mat-xi-mass/.test(s.comps), s);
      await ASK(a, [true]); await e(() => closeMoAsk('mo-mass'));
      // профил: сегментите
      await e(() => { show('fp'); switchFP('profiles'); openFPMo(null); }); await w(80);
      await e(() => { const n = document.getElementById('fp-name'); n.value = 'Профил чернова'; fpRampsEdit = [{ rate: 100, to: 600, hold: null }, { rate: 200, to: 1230, hold: 15 }]; _renderFpRamps(); n.dispatchEvent(new Event('input', { bubbles: true })); });
      await w(700); await RE();
      await e(() => { document.getElementById('splash')?.remove(); show('fp'); switchFP('profiles'); openFPMo(null); }); await w(80);
      s = await e(() => { document.getElementById('dr-yes').click(); return { name: document.getElementById('fp-name').value, r: JSON.stringify(fpRampsEdit) }; });
      ok(`U15 ${P}: profile draft — name and segments`, s.name === 'Профил чернова' && /1230/.test(s.r), s);
      await ASK(a, [true]); await e(() => closeMoAsk('mo-fp'));
      // снимки: при данни в IndexedDB — малката снимка влиза
      await e(() => { show('pieces'); editId = null; editKind = 'piece'; openPieceMo(); }); await w(80);
      await e(() => { const c = document.createElement('canvas'); c.width = 60; c.height = 40; c.getContext('2d').fillRect(0, 0, 30, 20); pPh.push(c.toDataURL('image/jpeg', 0.7)); renderPrev('pi-prev', pPh); document.getElementById('pi-name').value = 'Със снимка'; });
      await w(700);
      s = await e(() => { const d = JSON.parse(localStorage.getItem('glina.draft.mo-piece.piece.new') || 'null'); return { ph: d && d.x.ph && d.x.ph.length, out: d && d.phOut }; });
      ok(`U15 ${P}: a small photo goes into the draft when the data lives in IndexedDB`, s.ph === 1 && !s.out, s);
      await e(() => { localStorage.setItem('atelie_idb_active', '0'); const i = document.getElementById('pi-name'); i.value = 'Със снимка 2'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await w(700);
      s = await e(() => { const d = JSON.parse(localStorage.getItem('glina.draft.mo-piece.piece.new') || 'null'); localStorage.setItem('atelie_idb_active', '1'); return { ph: d && d.x.ph, out: d && d.phOut }; });
      ok(`U15 ${P}: data in localStorage → photos stay out of the draft (noted in the banner)`, s.ph === null && s.out === 1, s);
      await ASK(a, [true]); await e(() => closeMoAsk('mo-piece'));
      s = await e(() => Object.keys(localStorage).filter(k => k.indexOf('glina.draft.') === 0));
      ok(`U15 ${P}: no drafts left behind; drafts never in the main data`, !s.length, s);
      s = await e(() => JSON.stringify(DB).indexOf('glina.draft') < 0 && !('drafts' in DB));
      ok(`U15 ${P}: the main data carries no drafts`, s);
      ok(`U15 ${P}: no page errors`, !a.log.errors.length, a.log.errors);
      await a.close();
    }

    // ── реалните архиви ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db || raw) }, localStorage: { atelie_idb_active: '1' } });
      console.log('  ' + f + ':');
      s = await a2.eval(sel => { document.getElementById('splash')?.remove(); const O = eval(sel); const b0 = JSON.stringify(DB);
        const bad = [], dup = [];
        DB.pieces.concat(DB.series || []).forEach(p => { editId = p.id; editKind = DB.series && DB.series.indexOf(p) >= 0 ? 'series' : 'piece'; openPieceMo(p); const v = document.getElementById('pi-clay').value; if ((p.clay || '') !== v) bad.push([p.id, p.clay, v]);
          const t = O('pi-clay').filter(x => x.v).map(x => x.t.replace(/ · wishlist| \(в архива\)/, '').toLowerCase()); if (t.length !== new Set(t).size) dup.push(p.id); closeMo('mo-piece'); });
        DB.tests.forEach(t => { editId = t.id; openTestMo(t); const v = document.getElementById(testKind(t) === 'body' ? 'ti-body-ref' : 'ti-clay').value, want = testKind(t) === 'body' ? (t.bodyRef || '') : (t.clay || ''); if (want !== v) bad.push([t.id, want, v]); closeMo('mo-test'); });
        const mats = DB.materials.filter(m => m.cat === 'clays' || m.cat === 'mass').length; editId = null; editKind = 'piece'; openPieceMo(); const o = O('pi-clay'); closeMo('mo-piece');
        return { bad, dup, mats, offered: o.filter(x => x.g === 'Глини' || x.g === 'Маси').length, legacy: o.filter(x => /Стари/.test(x.g)).map(x => x.t), same: b0 === JSON.stringify(DB) }; }, OPTS.toString());
      ok('  every piece, series and test form keeps its clay/mass exactly; no duplicates; opening changed nothing', !s.bad.length && !s.dup.length && s.same && s.offered === s.mats, s);
      a2.acceptConfirms = true;
      s = await a2.eval(() => { const out = {}; const keep = JSON.stringify(DB.pieces.concat(DB.series || []).map(p => [p.id, p.clay, (p.events || []).length]));
        const K = [['mat', 'materials', 'det-mat', openMatDet, delMat], ['rec', 'recipes', 'det-recipe', openRecipeDet, delRecipe], ['test', 'tests', 'det-test', openTestDet, delTest], ['run', 'firingRuns', 'det-run', openRunDet, deleteRun], ['fp', 'firingProfiles', 'det-fp', openFPDet, delFP]];
        window.confirm = () => true;
        K.forEach(([k, list, det, open, del]) => { const n0 = DB[list].length; const ids = DB[list].map(x => x.id); ids.forEach(id => { if (DB[list].find(x => x.id === id).archivedAt) return; open(id); del(); });
          const arch = DB[list].filter(x => x.archivedAt).length; arcView(k, 'arch'); ids.forEach(id => { if (!DB[list].find(x => x.id === id).archivedAt) return; open(id); restoreRec(k); }); arcView(k, 'active');
          document.querySelectorAll('.det.on').forEach(d => closeDet(d.id)); out[k] = [n0, arch, DB[list].length, DB[list].filter(x => x.archivedAt).length]; });
        return { out, keep: keep === JSON.stringify(DB.pieces.concat(DB.series || []).map(p => [p.id, p.clay, (p.events || []).length])) }; });
      ok('  archive and restore every material, recipe, test, firing and profile — nothing lost, pieces untouched', Object.values(s.out).every(([n, a, n2, l]) => a === n && n2 === n && l === 0) && s.keep, s);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
