// v1.47.0 — бързо въвеждане на изделия: същият формуляр и същото записване (savePiece),
// два режима, бърз избор на глина, серии, „Запази и добави още“, контекст, чернови.
// Телефон и лаптоп; частните архиви — само ако са налице (не влизат в пакетите).
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 900) : '')); } };

const HELP = () => {
  window.__q = {
    st: () => { const mo = document.getElementById('mo-piece'); return { on: mo.classList.contains('on'), qk: mo.classList.contains('qk'), made: mo.classList.contains('qk-b'), mode: document.getElementById('pi-qk').value, t: document.getElementById('mo-piece-t').textContent, name: document.getElementById('pi-name').value, clay: document.getElementById('pi-clay').value, cur: document.getElementById('qk-clay-cur').innerText, list: document.getElementById('qk-clay-list').innerText }; },
    type: (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); },
    pick: q => { __q.type('qk-clay-srch', q); const b = document.querySelector('#qk-clay-list button:not(#qk-unk)'); if (b) b.click(); return document.getElementById('pi-clay').value; },
    vis: id => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); return !!e.offsetParent && r.height > 0; },
    n: () => DB.pieces.length + DB.series.length,
  };
};

(async () => {
  console.log('quick:');
  if (!/openQuickPiece/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))) { console.log('  - not in this version'); process.exit(0); }
  const h = await H.start(ROOT);
  try {
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const N = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      await app.page.setViewportSize(vp);
      const E = (f, a) => app.eval(f, a);
      await E(() => document.getElementById('splash')?.remove());
      await E(HELP);
      app.acceptConfirms = true;
      let s;

      // ── достъп ──
      s = await E(() => { show('pieces'); addNew(); const a = __q.st(); const tabs = __q.vis('pi-stage') || document.querySelector('#mo-piece .pi-tabs').offsetParent !== null;
        const sv = document.getElementById('pi-save').getBoundingClientRect(); const fits = sv.bottom <= innerHeight + 1 && sv.top >= 0;
        const shown = ['pi-name', 'qk-clay-srch', 'pi-count', 'pi-date', 'pi-pha'].map(__q.vis), hidden = ['pi-type', 'pi-tech', 'pi-h', 'pi-notes', 'pi-stage', 'pi-clay'].map(__q.vis);
        const mo = document.querySelector('#mo-piece .mo-sh'); const over = mo.scrollWidth > mo.clientWidth + 1; closeMoAsk('mo-piece'); return { a, tabs, fits, shown, hidden, over }; });
      ok(`${N} „+“ in Изделия opens the quick form: two modes, name / clay / count / date / photo; the rest hidden; „Запази“ visible`, s.a.on && s.a.qk && s.a.mode === 'new' && !s.tabs && s.fits && s.shown.every(Boolean) && !s.hidden.some(Boolean) && !s.over, s);
      s = await E(() => { show('home'); renderHome(); const b = [...document.querySelectorAll('.hm-qa button')].find(x => /Ново изделие/.test(x.textContent)); b.click(); const a = __q.st(); closeMoAsk('mo-piece'); return a; });
      ok(`${N} „Моето ателие“ → „+ Ново изделие“ opens the same quick form`, s.on && s.qk && s.mode === 'new', s);
      s = await E(() => { curMat = 'mat-toffee'; newPieceFromMat(); const a = __q.st(); const dirty = _moIsDirty('mo-piece'); closeMoAsk('mo-piece'); curRec = 'rec-ash'; newPieceFromRecipe(); const b = __q.st(); const ctx = document.getElementById('qk-ctx').innerText, rec = document.getElementById('pi-rec').value;
        __q.type('pi-name', 'Купа с пепелна'); document.getElementById('pi-save').click(); const p = DB.pieces[0]; return { a, dirty, b, ctx, rec, p: { name: p.name, recipe: p.recipe, clay: p.clay } }; });
      ok(`${N} from a material: the clay is prefilled (its id) and shown; not a „change“`, s.a.qk && s.a.clay === 'mat-toffee' && /TOFFEE Caramel/.test(s.a.cur) && !s.dirty, s.a);
      ok(`${N} from a recipe: the glaze is prefilled, named in the quick form and saved`, s.b.qk && s.rec === 'rec:rec-ash' && /Глазура: Пепелна Б/.test(s.ctx) && s.p.name === 'Купа с пепелна' && s.p.recipe === 'rec-ash' && s.p.clay === '', s);

      // ── А. ново изделие с име и глина ──
      s = await E(() => { const n0 = __q.n(); addNew(); __q.type('pi-name', 'Чаша бърза'); const v = __q.pick('toff'); const cur = __q.st().cur; document.getElementById('pi-save').click();
        const p = DB.pieces[0]; return { n: __q.n() - n0, v, cur, p: JSON.parse(JSON.stringify(p)), closed: !document.getElementById('mo-piece').classList.contains('on') }; });
      ok(`${N} A: name + clay found by search → one piece, the material id stored, stage „Сурово“, today, a code, no invented history`, s.n === 1 && s.closed && s.v === 'mat-toffee' && /Избрана: TOFFEE Caramel/.test(s.cur) && s.p.name === 'Чаша бърза' && s.p.clay === 'mat-toffee' && s.p.stage === 'wet' && /^\d{4}-\d\d-\d\d$/.test(s.p.date) && /^GL-\d{4}-\d+/.test(s.p.code) && s.p.events.length === 0 && !s.p.technique && !s.p.type && !s.p.notes, s.p);
      s = await E(() => { addNew(); const a = __q.st(); closeMoAsk('mo-piece'); return a; });
      ok(`${N} the last used clay is offered but never selected by itself`, s.clay === '' && /Не е избрана/.test(s.cur) && /Последно ползвани/.test(s.list) && /TOFFEE Caramel/.test(s.list), s);
      s = await E(() => { addNew(); __q.type('qk-clay-srch', 'xi beach'); const l = __q.st().list; closeMoAsk('mo-piece'); addNew(); __q.type('qk-clay-srch', 'zzzz'); const l2 = __q.st().list; closeMoAsk('mo-piece'); return { l, l2 }; });
      ok(`${N} search by name lists clays and masses; nothing found is said`, /Xi Beach 100/.test(s.l) && /маса/.test(s.l) && /Няма такава глина или маса/.test(s.l2), s);
      s = await E(() => { const m = DB.materials.find(x => x.id === 'mat-toffee'), b0 = m.brand; m.brand = 'Рациони ООД'; addNew(); __q.type('qk-clay-srch', 'рацион'); const l = __q.st().list; closeMoAsk('mo-piece'); m.brand = b0; return l; });
      ok(`${N} search by manufacturer`, /TOFFEE Caramel/.test(s) && /Рациони ООД/.test(s), s);
      // стари свободни имена — без миграция
      s = await E(() => { DB.pieces.push({ id: 'p-legacy-q', name: 'Старо', clay: 'Бяла от Тетевен', stage: 'wet', events: [], createdAt: '2099-01-01T00:00:00Z' }); addNew(); const l = __q.st().list; __q.type('pi-name', 'Пак старото'); __q.pick('тетевен'); document.getElementById('pi-save').click(); const p = DB.pieces[0]; const old = DB.pieces.find(x => x.id === 'p-legacy-q').clay; DB.pieces = DB.pieces.filter(x => x.id !== 'p-legacy-q'); return { l, c: p.clay, old }; });
      ok(`${N} a legacy free clay name stays selectable as is (no migration)`, /Бяла от Тетевен/.test(s.l) && /старо име/.test(s.l) && s.c === 'Бяла от Тетевен' && s.old === 'Бяла от Тетевен', s);

      // ── неизвестна ──
      s = await E(() => { addNew(); __q.type('pi-name', 'Без глина'); document.getElementById('qk-unk').click(); const cur = __q.st().cur; document.getElementById('pi-save').click(); const p = DB.pieces[0]; return { cur, clay: p.clay, name: p.name }; });
      ok(`${N} „Неизвестна“: explicit, the clay stays empty (nothing invented)`, /Неизвестна/.test(s.cur) && s.clay === '' && s.name === 'Без глина', s);

      // ── Б. вече изработено, задна дата, различни етапи ──
      s = await E(() => { const r0 = DB.firingRuns.length, out = [];
        for (const st of ['leather-hard', 'bone-dry', 'bisque', 'glazed', 'finished', 'sold']) {
          addNew(); piQkMode('made'); __q.type('pi-name', 'Минало ' + st); __q.pick('xi beach 100'); document.getElementById('pi-stage').value = st; _piQkFireSync(); document.getElementById('pi-date').value = '2026-09-15'; document.getElementById('pi-notes').value = 'намерено на рафта';
          document.getElementById('pi-save').click(); const p = DB.pieces[0]; out.push({ st, stage: p.stage, date: p.date, notes: p.notes, ev: p.events.map(e => e.type + ':' + e.date + ':' + (e.data.stageValue || e.data.firingPurpose)) }); }
        return { out, r: DB.firingRuns.length - r0 }; });
      ok(`${N} B: already made with a past date — the stage is set and recorded as one dated „Етап“ step; no firings invented`, s.out.every(x => x.stage === x.st && x.date === '2026-09-15' && x.notes === 'намерено на рафта' && x.ev.length === 1 && x.ev[0] === 'stage:2026-09-15:' + x.st) && s.r === 0, s);
      s = await E(() => { addNew(); piQkMode('made'); const t = __q.st().t, lab = document.getElementById('pi-date-l').textContent; __q.type('pi-name', 'Изпечена ваза'); document.getElementById('qk-unk').click(); document.getElementById('pi-stage').value = 'fired'; _piQkFireSync();
        const fw = __q.vis('qk-fire-wrap'), n0 = __q.n(); document.getElementById('pi-date').value = '2026-08-01'; document.getElementById('pi-save').click(); const stay = document.getElementById('mo-piece').classList.contains('on') && __q.n() === n0;
        document.getElementById('pi-qk-fp').value = 'glaze'; document.getElementById('pi-save').click(); const p = DB.pieces[0]; openPieceDet(p.id); const det = document.getElementById('det-piece').innerText; closeDet('det-piece');
        return { t, lab, fw, stay, stage: p.stage, ev: p.events.map(e => JSON.stringify(e.data) + '@' + e.date), run: p.events.some(e => e.runId || (e.data && e.data.runId)), det }; });
      ok(`${N} B „Изпечено“: asks the firing type; recorded as one firing step (type only, no kiln run, no method)`, /Вече изработено/.test(s.t) && s.lab === 'Дата на етапа' && s.fw && s.stay && s.stage === 'fired' && s.ev.join() === '{"firingPurpose":"glaze"}@2026-08-01' && !s.run, s);
      ok(`${N} … its detail opens without errors`, s.det.length > 0 && !app.log.errors.length, app.log.errors);
      s = await E(() => { addNew(); piQkMode('made'); document.getElementById('pi-stage').value = 'bisque'; piQkMode('new'); const a = document.getElementById('pi-stage').value, f = document.querySelector('#pi-stage option[value="fired"]').disabled; closeMoAsk('mo-piece'); return { a, f }; });
      ok(`${N} back to „Започвам ново“ → stage „Сурово“ again, „Изпечено“ not offered`, s.a === 'wet' && s.f, s);

      // ── серия от 25 ──
      s = await E(() => { const np = DB.pieces.length, ns = DB.series.length; addNew(); __q.type('pi-name', 'Висулки'); __q.pick('xi beach 100'); document.getElementById('pi-count').value = '25'; document.getElementById('pi-save').click();
        const se = DB.series[0]; openSeriesDet(se.id); seUnitTap(7); seUnitTap(8); openSplitMo(_seSel.u); document.getElementById('sp-name').value = 'Две висулки'; saveSplit();
        const m = _seriesMembers(se.id).map(x => (x.units || []).join('+')); return { np: DB.pieces.length - np, ns: DB.series.length - ns, se: { name: se.name, count: se.count, next: se.nextUnitNo, clay: se.clay, code: se.code, ev: se.events.length }, m }; });
      ok(`${N} series of 25: one series (not 25 pieces), units 1–25, a code; split /7+/8 works as before`, s.ns === 1 && s.np === 1 && s.se.count === 25 && s.se.next === 26 && s.se.clay === 'mat-xi-mass' && /^GL-\d{4}-\d+/.test(s.se.code) && s.se.ev === 0 && s.m.join() === '7+8', s);
      s = await E(() => { addNew(); piQkMode('made'); __q.type('pi-name', 'Купички 12'); __q.pick('toff'); document.getElementById('pi-count').value = '12'; document.getElementById('pi-stage').value = 'bone-dry'; document.getElementById('pi-date').value = '2026-10-20'; document.getElementById('pi-save').click();
        const se = DB.series[0]; return { c: se.count, st: se.stage, ev: se.events.map(e => e.type + ':' + e.date + ':' + e.data.stageValue) }; });
      ok(`${N} an already-made series of 12, bone-dry since 20.10 — one dated stage step`, s.c === 12 && s.st === 'bone-dry' && s.ev.join() === 'stage:2026-10-20:bone-dry', s);
      s = await E(() => { const codes = DB.pieces.concat(DB.series).map(x => x.code).filter(Boolean); return { n: codes.length, u: new Set(codes).size }; });
      ok(`${N} codes stay unique across the new pieces and series`, s.n === s.u && s.n > 10, s);

      // ── „Запази и добави още“ ──
      s = await E(() => { const n0 = __q.n(); addNew(); piQkMode('made'); __q.type('pi-name', 'Първа'); __q.pick('xi beach 100'); document.getElementById('pi-stage').value = 'bisque'; document.getElementById('qk-again').click();
        const a = __q.st(); const again = [...document.querySelectorAll('#qk-clay-list button')].find(b => /^Пак „/.test(b.textContent)); const at = again ? again.textContent : '';
        if (again) again.click(); const v = document.getElementById('pi-clay').value; __q.type('pi-name', 'Втора'); document.getElementById('pi-stage').value = 'bisque'; document.getElementById('pi-save').click();
        return { a, at, v, n: __q.n() - n0, p: DB.pieces.slice(0, 2).map(p => p.name + ':' + p.clay + ':' + p.stage) }; });
      ok(`${N} „Запази и добави още“: saved, the form reopens empty in the same mode; the clay is NOT carried over by itself`, s.a.on && s.a.qk && s.a.mode === 'made' && s.a.name === '' && s.a.clay === '' && /Не е избрана/.test(s.a.cur), s.a);
      ok(`${N} … „Пак „Xi Beach 100““ reuses it on an explicit tap; two pieces with that clay`, /Пак „Xi Beach 100/.test(s.at) && s.v === 'mat-xi-mass' && s.n === 2 && s.p.join() === 'Втора:mat-xi-mass:bisque,Първа:mat-xi-mass:bisque', s);
      s = await E(() => { addNew(); const l = __q.st().list; closeMoAsk('mo-piece'); return l; });
      ok(`${N} a later new form does not offer „Пак …“ any more`, !/Пак „/.test(s), s);

      // ── подробно въвеждане и допълване ──
      s = await E(() => { addNew(); __q.type('pi-name', 'Ваза подробно'); __q.pick('toff'); document.getElementById('qk-detail').click(); const a = __q.st(); const tabs = document.querySelector('#mo-piece .pi-tabs').offsetParent !== null;
        piTab('mat'); const clayVis = __q.vis('pi-clay'); document.getElementById('pi-tech').value = document.getElementById('pi-tech').options[1].value; piTab('size'); document.getElementById('pi-h').value = '24'; document.getElementById('pi-save').click();
        const p = DB.pieces[0]; return { a, tabs, clayVis, p: { name: p.name, clay: p.clay, tech: p.technique, h: p.size && p.size.h } }; });
      ok(`${N} „Подробно въвеждане“: all tabs and fields, nothing typed is lost; saved with technique and height`, !s.a.qk && s.a.name === 'Ваза подробно' && s.a.clay === 'mat-toffee' && s.tabs && s.clayVis && s.p.clay === 'mat-toffee' && !!s.p.tech && s.p.h === 24, s);
      s = await E(() => { const p = DB.pieces.find(x => x.name === 'Чаша бърза'), b0 = JSON.parse(JSON.stringify(p)); curPiece = p.id; editPiece(); const a = __q.st(), tabs = document.querySelector('#mo-piece .pi-tabs').offsetParent !== null;
        document.getElementById('pi-dimensions').value = 'в10 × ⌀8'; savePiece(); const q = DB.pieces.find(x => x.id === p.id); return { a, tabs, same: q.code === b0.code && q.clay === b0.clay && q.createdAt === b0.createdAt && q.dimensions === 'в10 × ⌀8', inCat: (renderPieces(), document.getElementById('sc-pieces').innerText.indexOf('Чаша бърза') >= 0) }; });
      ok(`${N} a quick piece is an ordinary piece: in the catalog, edited in the full form, completed without losing code/clay`, !s.a.qk && s.a.mode === '' && s.tabs && s.same && s.inCat, s);

      // ── двойно натискане ──
      s = await E(() => { const n0 = __q.n(); addNew(); __q.type('pi-name', 'Двойно'); document.getElementById('qk-unk').click(); const b = document.getElementById('pi-save'); b.click(); b.click(); savePiece();
        addNew(); __q.type('pi-name', 'Двойно още'); document.getElementById('qk-unk').click(); const g = document.getElementById('qk-again'); g.click(); g.click(); const on = document.getElementById('mo-piece').classList.contains('on'); closeMoAsk('mo-piece');
        return { n: __q.n() - n0, on, names: DB.pieces.filter(p => /^Двойно/.test(p.name)).map(p => p.name) }; });
      ok(`${N} double tap on „Запази“ / „Запази и добави още“ creates one record each`, s.n === 2 && s.names.sort().join() === 'Двойно,Двойно още', s);

      // ── отказ ──
      s = await E(() => { const n0 = __q.n(); addNew(); __q.type('pi-name', 'Отказана'); closeMoAsk('mo-piece'); return { n: __q.n() - n0, on: document.getElementById('mo-piece').classList.contains('on') }; });
      ok(`${N} cancel with changes asks; nothing is saved`, s.n === 0 && !s.on && app.log.dialogs.some(d => /незапазени промени/i.test(d)), [s, app.log.dialogs.slice(-2)]);
      ok(`${N} no page errors`, !app.log.errors.length, app.log.errors);
      await app.close();
    }

    // ── чернова: затваряне на раздела по средата на бързото въвеждане ──
    {
      let a = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      const reopen = async x => {
        await x.page.close({ runBeforeUnload: false });
        const page = await x.ctx.newPage(), log = x.log, w = { page, ctx: x.ctx, log, eval: (f, y) => page.evaluate(f, y), close: () => x.ctx.close() };
        page.on('dialog', d => { log.dialogs.push(d.type() + ': ' + d.message().split('\n')[0]); d.accept().catch(() => {}); });
        page.on('pageerror', e => log.errors.push(String(e && e.message || e)));
        await page.goto(h.base + '/index.html');
        await page.waitForFunction(() => { const el = document.getElementById('storage-label'); return el && /Заето|MB/.test(el.textContent || ''); }, null, { timeout: 15000 });
        await page.waitForTimeout(200); return w;
      };
      await a.eval(() => document.getElementById('splash')?.remove()); await a.eval(HELP);
      await a.eval(() => { show('pieces'); addNew(); }); await a.page.waitForTimeout(80);
      await a.eval(() => { piQkMode('made'); __q.type('pi-name', 'Чернова бърза'); __q.pick('xi beach 100'); const st = document.getElementById('pi-stage'); st.value = 'bisque'; st.dispatchEvent(new Event('change', { bubbles: true })); __q.type('pi-date', '2026-09-01'); });
      await a.page.waitForTimeout(800);
      const n0 = await a.eval(() => DB.pieces.length);
      a = await reopen(a);
      await a.eval(() => document.getElementById('splash')?.remove()); await a.eval(HELP);
      let s = await a.eval(() => { const box = (document.getElementById('hm-drafts') || {}).innerText || ''; const k = Object.keys(localStorage).find(k => k.indexOf('glina.draft.mo-piece') === 0); draftOpen(k); return { box }; });
      const BOX = s.box; await a.page.waitForTimeout(100);
      s = await a.eval(() => { const ban = !!document.querySelector('#mo-piece .dr-ban'); const y = document.getElementById('dr-yes'); if (y) y.click(); return Object.assign(__q.st(), { ban, stage: document.getElementById('pi-stage').value, date: document.getElementById('pi-date').value }); });
      ok('draft: after closing the tab mid-entry the home lists it; restoring brings back the quick „Вече изработено“ form with name, clay, stage, date', /Чернова бърза/.test(BOX), s);
      ok('… restored as it was', s.on && s.qk && s.mode === 'made' && s.name === 'Чернова бърза' && s.clay === 'mat-xi-mass' && s.stage === 'bisque' && s.date === '2026-09-01', s);
      s = await a.eval(() => { document.getElementById('pi-save').click(); const p = DB.pieces[0]; return { n: DB.pieces.length, p: p.name + ':' + p.stage + ':' + p.events.map(e => e.type + '@' + e.date).join(), k: Object.keys(localStorage).filter(k => k.indexOf('glina.draft.') === 0).length }; });
      ok('… saved once with its dated step; the draft is gone', s.n === n0 + 1 && s.p === 'Чернова бърза:bisque:stage@2026-09-01' && s.k === 0, s);
      ok('draft: no page errors', !a.log.errors.length, a.log.errors);
      await a.close();
    }

    // ── частните архиви ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json')).sort()) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const v6 = JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db || raw));
      for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
        const a = await h.open({ seed: { atelie_v6: v6 }, localStorage: { atelie_idb_active: '1' } });
        await a.page.setViewportSize(vp); a.acceptConfirms = true;
        await a.eval(() => document.getElementById('splash')?.remove()); await a.eval(HELP);
        const s = await a.eval(() => { const b0 = JSON.stringify({ p: DB.pieces, s: DB.series, r: DB.firingRuns, m: DB.materials });
          const clay = (DB.materials.find(m => m.cat === 'clays' && !m.archivedAt) || {}).name || '';
          show('pieces'); addNew(); __q.type('pi-name', 'Бърза проба'); const v = clay ? __q.pick(clay.slice(0, 5)) : ''; document.getElementById('pi-save').click();
          addNew(); piQkMode('made'); __q.type('pi-name', 'Бърза серия'); document.getElementById('qk-unk').click(); document.getElementById('pi-count').value = '12'; document.getElementById('pi-stage').value = 'bisque'; document.getElementById('pi-date').value = '2026-10-01'; document.getElementById('pi-save').click();
          const p = DB.pieces[0], se = DB.series[0], codes = DB.pieces.concat(DB.series).map(x => x.code).filter(Boolean);
          const old = JSON.stringify({ p: DB.pieces.slice(1), s: DB.series.slice(1), r: DB.firingRuns, m: DB.materials });
          return { v, p: p.name + ':' + (p.clay ? 'id' : '') , se: se.name + ':' + se.count + ':' + se.stage + ':' + se.events.length, uniq: codes.length === new Set(codes).size, same: old === b0, mo: document.getElementById('mo-piece').classList.contains('on') }; });
        ok(`  ${f} ${vp.n}: quick piece with a real clay and an already-made series of 12; codes unique; existing records untouched`, s.v && s.p === 'Бърза проба:id' && s.se === 'Бърза серия:12:bisque:1' && s.uniq && s.same && !s.mo, s);
        ok(`  ${f} ${vp.n}: no page errors`, !a.log.errors.length, a.log.errors);
        await a.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
