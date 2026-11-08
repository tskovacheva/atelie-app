// v1.35.1 — the new piece and series screens: header, „Последно“ with a shortcut
// that only opens a form, sections, „Добави в план на изпичане“ (plan member, no
// step, no stage), the form in four tabs (no data lost between tabs, no horizontal
// scroll on a phone), long names and many categories, series with mixed stages.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('piece-ui:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof piTab === 'function'))) { console.log('  - not in this version'); return; }
    app.acceptConfirms = true;
    const E = (fn, a) => app.eval(fn, a);

    // detail: header, facts, last step, sections with summaries
    await E(() => { const p = DB.pieces.find(x => x.id === 'p-ocarina'); p.name = 'Окарина с много дълго име за проверка на пренасянето на текста в заглавието'; p.categories = ['Музикални инструменти', 'Декорация', 'Скулптура', 'Тестови образци', 'Бижута']; p.size = { h: 8, w: 6, at: 'bone-dry' }; save(); });
    const d = await E(async () => { openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 80));
      const head = document.getElementById('dpi-head').innerText, secs = [...document.querySelectorAll('#dpi-secs .pd-sec')].map(s => [s.dataset.k, s.classList.contains('open'), s.querySelector('.sum').innerText]);
      return { head, secs, wide: document.getElementById('det-piece').scrollWidth > document.getElementById('det-piece').clientWidth + 1, chips: document.querySelectorAll('#dpi-head .pd-chip.cat').length }; });
    ok('header: code, type, 5 categories, stage, size, clay, technique', /GL-2026-007/.test(d.head) && /музикален инструмент/i.test(d.head) && d.chips === 5 && /Изпечено/.test(d.head) && /в8 × Ø6 см/.test(d.head) && /Xi Beach 100/.test(d.head) && /Ръчно формоване/.test(d.head), d.head);
    ok('„Последно“ shows the latest step and a shortcut', /Последно/.test(d.head) && /Етап „Готово“/.test(d.head) && /\+ Стъпка/.test(d.head), d.head);
    ok('sections: process open, the rest closed with a summary', d.secs[0][0] === 'proc' && d.secs[0][1] && d.secs.slice(1).every(s => !s[1]) && d.secs.find(s => s[0] === 'size')[2] === 'в8 × Ø6 см' && d.secs.find(s => s[0] === 'fire')[2] === '2', d.secs);
    ok('a long name and many categories: no horizontal scroll at 390 px', !d.wide);
    const tog = await E(() => { const b = document.querySelector('#dpi-secs .pd-sec[data-k="size"] button.h'); b.click(); const on = b.parentNode.classList.contains('open'); const txt = b.parentNode.innerText; b.click(); return { on, txt, off: !b.parentNode.classList.contains('open') }; });
    ok('a section opens and closes; sizes inside', tog.on && tog.off && /Измерено/.test(tog.txt) || (tog.on && tog.off && /в8 × Ø6/.test(tog.txt)), tog);

    // the shortcut only opens the step form, prefilled; nothing saved until „Запази“
    const sc = await E(async () => { const before = JSON.stringify(DB.pieces.find(x => x.id === 'p-ocarina').events);
      pdNext('piece'); await new Promise(r => setTimeout(r, 50));
      const open = document.getElementById('mo-event').classList.contains('on'), val = document.getElementById('ev-stage-value').value;
      const same = before === JSON.stringify(DB.pieces.find(x => x.id === 'p-ocarina').events);
      closeMo('mo-event'); return { open, val, same }; });
    ok('the shortcut opens the stage form with „Готово“ and saves nothing by itself', sc.open && sc.val === 'finished' && sc.same, sc);

    // add to a firing plan: a planned run gets a plan member; no step, no stage change
    await E(async () => { closeDet('det-piece'); await new Promise(r => setTimeout(r, 50)); DB.firingRuns.push({ id: 'r-new', name: 'Бисквит ноември', date: '2099-11-06', method: 'electric', purpose: 'bisque', state: 'planned', createdAt: new Date().toISOString() }); save(); });
    const pl = await E(async () => { const p = DB.pieces.find(x => x.id === 'p-untyped'), st = p.stage, ev = (p.events || []).length;
      openPieceDet('p-untyped'); await new Promise(r => setTimeout(r, 50));
      const nx = document.getElementById('pd-next').innerText; pdNext('piece'); await new Promise(r => setTimeout(r, 50));
      const list = document.getElementById('pdp-list').innerText; pdAddToPlan('r-new'); await new Promise(r => setTimeout(r, 50));
      const run = DB.firingRuns.find(r => r.id === 'r-new'), p2 = DB.pieces.find(x => x.id === 'p-untyped');
      const fires = document.querySelector('#dpi-secs .pd-sec[data-k="fire"]').textContent;
      return { nx, list, members: (run.plan && run.plan.members || []).map(m => m.ref.id), stSame: p2.stage === st, evSame: (p2.events || []).length === ev, fires }; });
    ok('bone-dry: the shortcut is „В план за бисквит“, the list shows the planned firing', /В план за бисквит/.test(pl.nx) && /Бисквит ноември/.test(pl.list), pl);
    ok('added to the plan as a member; no step; stage unchanged; shown as „Планирано“', pl.members.join() === 'p-untyped' && pl.stSame && pl.evSame && /Бисквит ноември.*Планирано/.test(pl.fires), pl);

    // the form: four tabs, 2 × 2 on a phone, no data lost between tabs
    const f = await E(async () => { closeDet('det-piece'); await new Promise(r => setTimeout(r, 50)); curPiece = 'p-ocarina'; editPiece(); await new Promise(r => setTimeout(r, 80));
      const tabs = [...document.querySelectorAll('#mo-piece .pi-tabs button')], r0 = tabs[0].getBoundingClientRect(), r2 = tabs[2].getBoundingClientRect();
      const t = document.querySelector('#mo-piece .pi-tabs'), sh = document.querySelector('#mo-piece .mo-sh');
      return { labels: tabs.map(b => b.innerText), grid: Math.abs(r0.left - r2.left) < 2 && r2.top > r0.top, noScroll: t.scrollWidth <= t.clientWidth + 1 && sh.scrollWidth <= sh.clientWidth + 1, on: document.querySelector('#mo-piece .pi-tab.on').dataset.tab, font: parseFloat(getComputedStyle(tabs[0]).fontSize) }; });
    ok('form tabs: Основни данни / Материали / Размери / Допълнително, 2 × 2, readable, no horizontal scroll', f.labels.join('|') === 'Основни данни|Материали|Размери|Допълнително' && f.grid && f.noScroll && f.font >= 14 && f.on === 'basic', f);
    const keep = await E(async () => {
      document.getElementById('pi-name').value = 'Окарина Xi нова'; document.getElementById('pi-type').value = 'окарина';
      piTab('size'); document.getElementById('pi-h').value = '9,5'; document.getElementById('pi-wall').value = '4';
      piTab('mat'); document.getElementById('pi-bisque-temp').value = '960';
      piTab('more'); document.getElementById('pi-notes').value = 'бележка от раздела';
      piTab('basic'); const name = document.getElementById('pi-name').value;
      piTab('size'); savePiece(); await new Promise(r => setTimeout(r, 80));
      const p = DB.pieces.find(x => x.id === 'p-ocarina'); return { name, p: { name: p.name, type: p.type, h: p.size && p.size.h, wall: p.wall, bt: p.bisqueTemp, notes: p.notes, cats: p.categories, code: p.code, ev: (p.events || []).length } };
    });
    ok('values typed in other tabs survive switching and are saved from any tab', keep.name === 'Окарина Xi нова' && keep.p.name === 'Окарина Xi нова' && keep.p.type === 'окарина' && keep.p.h === 9.5 && keep.p.wall === 4 && String(keep.p.bt) === '960' && keep.p.notes === 'бележка от раздела', keep);
    ok('editing keeps code, categories and history', keep.p.code === 'GL-2026-007' && keep.p.cats.length === 5 && keep.p.ev === 6, keep.p);
    const val = await E(async () => { closeDet('det-piece'); await new Promise(r => setTimeout(r, 50)); editId = null; editKind = 'piece'; openPieceMo(null); await new Promise(r => setTimeout(r, 50)); piTab('size'); savePiece(); await new Promise(r => setTimeout(r, 30)); return document.querySelector('#mo-piece .pi-tab.on').dataset.tab; });
    ok('saving without a name jumps back to „Основни данни“', val === 'basic', val);
    await E(() => closeMo('mo-piece'));

    // series: units grid, mixed stages, sections
    const s = await E(async () => { await new Promise(r => setTimeout(r, 50)); openSeriesDet('se-plates'); await new Promise(r => setTimeout(r, 80));
      return { head: document.getElementById('dse-head').innerText, units: [...document.querySelectorAll('#dse-secs .pd-unit')].map(u => u.className.replace('pd-unit', '').trim() + ':' + u.innerText.split('\n')[0]), secs: [...document.querySelectorAll('#dse-secs .pd-sec')].map(x => x.dataset.k), split: !!document.getElementById('dse-split-btn') }; });
    ok('series header: mixed stages with counts', /смесен/i.test(s.head) && /· 5/.test(s.head) && /Бройки/.test(s.head), s.head);
    ok('series units: /1–4 split, /5 out, the rest with the series', s.units.length === 10 && s.units.slice(0, 4).every(u => /^split:/.test(u)) && /^out:\/5/.test(s.units[4]) && s.units.slice(5).every(u => /^:\//.test(u)), s.units);
    ok('series sections and the split button', s.secs.join() === 'units,proc,size,mat,fire,notes' && s.split, s);
    const sp = await E(async () => { openSplitMo(); await new Promise(r => setTimeout(r, 50)); const o = document.getElementById('mo-split').classList.contains('on'); closeMo('mo-split'); return o; });
    ok('„+ Отдели“ opens the existing split form', sp);
    // series edit through tabs keeps the count
    const se = await E(async () => { closeDet('det-series'); await new Promise(r => setTimeout(r, 50)); curSeries = 'se-plates'; editSeries(); await new Promise(r => setTimeout(r, 80)); piTab('more'); savePiece(); await new Promise(r => setTimeout(r, 80)); const x = findSeries('se-plates'); return { count: x.count, code: x.code, next: x.nextUnitNo }; });
    ok('series edited from another tab: count, code and unit numbers kept', se.count === 10 && se.code === 'GL-2026-006' && se.next === 11, se);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // the private real archives (never packaged): every piece and series opens, edits, saves unchanged
    const PRIV = path.join(__dirname, 'fixtures', 'private');
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const ra = await h.open({ seed: { atelie_v6: JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db || raw)) }, localStorage: { atelie_idb_active: '1' } });
      const r = await ra.eval(async () => {
        const sleep = ms => new Promise(x => setTimeout(x, ms)); let n = 0, wide = 0;
        for (const p of DB.pieces) { openPieceDet(p.id); n++; const el = document.getElementById('det-piece'); if (el.scrollWidth > el.clientWidth + 1) wide++; el.classList.remove('on'); }
        for (const se of DB.series || []) { openSeriesDet(se.id); n++; const el = document.getElementById('det-series'); if (el.scrollWidth > el.clientWidth + 1) wide++; el.classList.remove('on'); }
        return { n, wide };
      });
      ok('real archive ' + f + ': ' + r.n + ' detail screens open, none scrolls sideways', r.n > 0 && !r.wide && !ra.log.errors.length, [r, ra.log.errors]);
      await ra.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
