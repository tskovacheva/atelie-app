// v1.37.0 — „Изпичания“ по прототипа firing-v0: регистър, детайл в три раздела,
// „Какво остава“ (внимание / допълни, според метода), избор на пещ и профил,
// „До пещта“ с бройките на серия, две колони на лаптоп. Само интерфейс: нищо не
// се пише при разглеждане, резултатите отиват в същите полета на плана.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 500) : '')); } };
// Разглеждане: всяко изпичане, всеки раздел, листовете за пещ и профил — данните остават същите.
const BROWSE = async () => {
  const snap = () => JSON.stringify(DB) + (localStorage.getItem('atelie_kilns') || '');
  const before = snap();
  for (const r of DB.firingRuns.slice()) {
    openRunDet(r.id); for (const t of ['prep', 'load', 'res']) rnTab(t);
    rnPickKiln(); closeMo('mo-rn-pick'); rnPickProfile(); closeMo('mo-rn-pick');
    await new Promise(x => setTimeout(x, 10)); closeDet('det-run');
  }
  renderFiringRuns();
  return before === snap();
};

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('firing:');
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    if (!(await app.eval(() => typeof rnKm === 'function'))) { console.log('  - not in this version'); return; }
    const E = (fn, a) => app.eval(fn, a), page = app.page;
    await E(() => { const s = document.getElementById('splash'); if (s) s.remove(); show('fp'); });
    const noOverflow = () => E(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.det.on, #main')].every(x => x.scrollWidth <= x.clientWidth + 1));

    // --- регистър; старите изпичания без план ---
    let s = await E(() => ({ cards: [...document.querySelectorAll('#run-list .rn-c')].map(x => x.textContent), grp: [...document.querySelectorAll('#run-list .rn-grp')].map(x => x.textContent), chips: [...document.querySelectorAll('#run-list .rn-chips .fchip')].map(x => x.textContent) }));
    ok('registry: the three old firings, as „Минали“, with state chips and counts', s.cards.length === 3 && s.grp.join() === 'Минали' && /Всички 3/.test(s.chips[0]) && s.cards.every(c => /Приключено/.test(c)), s);
    // v1.40.3: без пещ няма „план“ — показват се бройките и че чакат резултат
    ok('old pit firing without a plan: its attached pieces as units, waiting for results', s.cards.some(c => /Pit|трап/i.test(c) && /1 бр\./.test(c) && /за документиране/.test(c) && !/без план/.test(c)), s.cards);
    ok('old electric firing without a plan: still „без план“', s.cards.some(c => /Електрическа/.test(c) && /без план/.test(c)), s.cards);
    ok('just looking (every firing, every tab, kiln/profile sheets) changes nothing', await E(BROWSE));

    // --- план с бройки от серия ---
    app.acceptConfirms = true;
    const rid = await E(async () => {
      const k = _kilnNew('kittec-cb80-double', uid); k.clear = 1; KILNS = [k]; await _kilnsWrite(KILNS);
      const r = { id: uid(), name: 'Бисквит план', date: '2026-11-06', method: 'electric', purpose: 'bisque', state: 'planned', firingProfileId: DB.firingProfiles[0] && DB.firingProfiles[0].id, createdAt: new Date().toISOString() };
      DB.firingRuns.push(r); curPlanRun = r.id; setPlanKiln(k.id); addPlanLevel(); addPlanLevel();
      const c = _plCandidates(r).filter(x => x.key === 'series:se-plates' || x.key === 'piece:p-untyped');
      c.forEach(x => { r.plan.members = r.plan.members.concat(_plMembersFrom(x)); });
      r.plan.members.forEach((m, i) => { if (i < r.plan.members.length - 1) m.level = r.config.levels[i % 2].id; });
      save(); renderFiringRuns(); return r.id;
    });
    s = await E(id => { const c = [...document.querySelectorAll('#run-list .rn-c')].find(x => /Бисквит план/.test(x.textContent)); openRunDet(id);
      return { card: c && c.textContent, grp: [...document.querySelectorAll('#run-list .rn-grp')].map(x => x.textContent), tab: document.querySelector('#drn-tabs .on').dataset.tab, todo: document.getElementById('drn-todo').innerText, side: !!document.querySelector('#drn-side svg'), flow: document.getElementById('drn-flow').innerText }; }, rid);
    ok('planned firing: in „Предстоящи“, card with date, type, kiln, profile and plan', s.grp[0] === 'Предстоящи' && /2026-11-06/.test(s.card) && /Бисквит/.test(s.card) && /Kittec/.test(s.card) && /план: 2 нива/.test(s.card) && /1 без ниво/.test(s.card), s);
    ok('detail opens on „Зареждане“ with the real side view of the plan', s.tab === 'load' && s.side, s);
    ok('„Какво остава“: the piece without a level needs attention; next step named', /ИЗИСКВА ВНИМАНИЕ/i.test(s.todo) && /1 изделие е без ниво/.test(s.todo) && /Заредено — потвърди/.test(s.todo), s.todo);
    ok('state path: Планирано is current', /Планирано\s*›\s*Заредено\s*›\s*Приключено/.test(s.flow), s.flow);
    s = await E(() => ({ lock: document.getElementById('drn-res-lock').innerText, btns: document.querySelectorAll('#drn-mres button').length }));
    ok('„Резултати“ before loading: explains, no result buttons', /след „Заредено“/.test(s.lock) && s.btns === 0, s);

    // --- преходи (същата логика) ---
    s = await E(id => { setRunState(id, 'loaded'); const r = DB.firingRuns.find(x => x.id === id); const evs = DB.series.find(x => x.id === 'se-plates').events.filter(e => e.data && e.data.firingRunId === id);
      return { st: r.state, pill: document.getElementById('drn-pill').innerText, evs: evs.length, card: [...document.querySelectorAll('#run-list .rn-grp')].map(x => x.textContent) }; }, rid);
    ok('„Заредено“: steps created as before, „Заредени — в пещта“ group', s.st === 'loaded' && s.evs === 1 && /Заредено/.test(s.pill) && s.card.some(g => /Заредени/.test(g)), s);
    s = await E(id => { (setRunState(id, 'completed'), confirmRunEnd()); const r = DB.firingRuns.find(x => x.id === id); return { st: r.state, tab: document.querySelector('#drn-tabs .on').dataset.tab, todo: document.getElementById('drn-todo').innerText, n: r.plan.members.length, km: !!document.getElementById('drn-km-btn') }; }, rid);
    ok('„Приключено“: results tab, „без резултат“ needs attention, cones/photos/notes only optional', s.st === 'completed' && s.tab === 'res' && s.km && new RegExp(s.n + ' бройки са без резултат').test(s.todo) && /МОЖЕ ДА СЕ ДОПЪЛНИ[\s\S]*Конус/i.test(s.todo) && !/ИЗИСКВА ВНИМАНИЕ[\s\S]*Конус[\s\S]*МОЖЕ/i.test(s.todo), s.todo);

    // --- „До пещта“ ---
    s = await E(id => { rnKm(); const r = DB.firingRuns.find(x => x.id === id); const j = KM.ids.findIndex(mid => { const m = r.plan.members.find(x => x.id === mid); return m.ref.kind === 'series'; });
      const a = KM.i; KM.i = j; _rnKmDraw(); const nm = document.getElementById('km-nm').textContent; KM.i = a; _rnKmDraw();
      return { on: document.getElementById('rn-km').classList.contains('on'), nm, cnt: document.querySelectorAll('.km-prog i').length }; }, rid);
    ok('„До пещта“: one unit per screen, the series unit with its number', s.on && /\/\d+$/.test(s.nm) && s.cnt >= 3, s);
    s = await E(id => { KM.auto = false; const a = KM.i; rnKmSet('Добре'); const stay = KM.i === a; KM.auto = true; rnKmSet('Пукнато'); rnKmSet('Добре'); const moved = KM.i === a + 1; const undo = document.querySelector('.km-undo') && document.querySelector('.km-undo').textContent;
      rnKmUndo(); const r = DB.firingRuns.find(x => x.id === id); const m = r.plan.members.find(x => x.id === KM.ids[a]);
      return { stay, moved, undo, back: KM.i === a, res: m.result, log: (r.corrections || []).map(c => c.what + ':' + c.from + '→' + c.to) }; }, rid);
    ok('without auto: stays after „Добре“; with auto: moves on and offers „Отмени“', s.stay && s.moved && /Отмени/.test(s.undo), s);
    ok('„Отмени“ goes back to the unit and restores its result; corrections in the existing log', s.back && s.res === 'Пукнато' && s.log.some(x => /Добре→Пукнато/.test(x)), s);
    s = await E(id => { KM.auto = false; const a = KM.i; rnKmSkip(); const skipped = KM.i !== a; KM.i = a; _rnKmDraw(); rnKmSet('Друго'); rnKmSet(''); const r = DB.firingRuns.find(x => x.id === id);
      document.getElementById('km-note').value = 'косъмче'; document.getElementById('km-note').dispatchEvent(new Event('change'));
      const m = r.plan.members.find(x => x.id === KM.ids[a]); closeDet('rn-km');
      return { skipped, res: m.result || '', note: m.resultNote, keys: Object.keys(r).sort().join(), extra: r.plan.members.some(x => Object.keys(x).some(k => !/^(id|ref|name|code|unitLabel|level|h|shape|d|w|depth|s|src|x|y|rot|result|resultNote)$/.test(k))) }; }, rid);
    ok('skip moves to the next unit without a result; a wrong result can be cleared', s.skipped && s.res === '', s);
    ok('note saved in the member\'s „resultNote“; no new fields on the plan members', s.note === 'косъмче' && !s.extra, s);
    s = await E(id => { rnCone(DB.firingRuns.find(x => x.id === id).config.levels[0].id, 'coneResult', 'Точно'); rnSetField('peakTemp', '962'); const r = DB.firingRuns.find(x => x.id === id); return { cone: r.config.levels[0].coneResult, peak: r.peakTemp, pva: document.getElementById('drn-pva').innerText }; }, rid);
    ok('cones and real peak in the existing fields; planned vs real shown', s.cone === 'Точно' && s.peak === 962 && /962/.test(s.pva), s);
    s = await E(id => { const r0 = DB.firingRuns.find(x => x.id === id); rnRes(r0.plan.members[0].id, 'Добре'); setRunState(id, 'loaded'); setRunState(id, 'planned'); const r = DB.firingRuns.find(x => x.id === id); const evs = DB.series.find(x => x.id === 'se-plates').events.filter(e => e.data && e.data.firingRunId === id).length; return { st: r.state, evs, res: r.plan.members.filter(m => m.result).length }; }, rid);
    ok('„Отвори отново“ and „Върни в план“: steps removed, results kept (as before)', s.st === 'planned' && s.evs === 0 && s.res > 0, s);

    // --- пещ и профил в лист; алтернативен метод ---
    s = await E(id => { openRunDet(id); rnTab('prep'); rnPickProfile(); const t = document.getElementById('rnp-body').innerText; closeMo('mo-rn-pick'); return { t, pick: document.getElementById('drn-pick').innerText }; }, rid);
    ok('profile sheet: ramps and choose, without leaving the firing', /Избран|Избери/.test(s.t) && /Kittec/.test(s.pick), s);
    s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'run-pit'); r.state = 'completed'; r.config = { levels: [{ id: 'Lp' }] }; r.plan = { members: [{ id: 'mp', ref: { kind: 'piece', id: 'p-old' }, name: 'x', level: 'Lp' }] }; openRunDet('run-pit'); const t = document.getElementById('drn-todo').innerText; const cones = document.getElementById('drn-cones').innerText; delete r.state; delete r.config; delete r.plan; closeDet('det-run'); return { t, cones }; });
    ok('pit firing: no cones asked or shown', !/Конус/.test(s.t) && !s.cones, s);

    // --- лаптоп: две колони; телефон: отделни екрани ---
    ok('phone: detail is its own screen, nothing wider than the screen', await E(id => { openRunDet(id); const d = document.getElementById('det-run').getBoundingClientRect(); return d.left === 0 && !document.getElementById('det-run').classList.contains('split'); }, rid) && await noOverflow());
    await E(() => closeDet('det-run'));
    await page.setViewportSize({ width: 1280, height: 800 });
    s = await E(id => { openRunDet(id); const d = document.getElementById('det-run'), l = document.getElementById('run-list').getBoundingClientRect(); const a = { split: d.classList.contains('split'), left: d.getBoundingClientRect().left, listR: l.right, sel: !!document.querySelector('.rn-c.sel') };
      document.querySelector('.rn-c[onclick*="run-gl"]').click(); /* v1.40.1: изборът от списъка заменя, не добавя стъпка */ a.second = document.getElementById('drn-t').textContent; a.stack = _overlayStack.filter(x => x.id === 'det-run').length; closeDet('det-run'); a.after = document.getElementById('sc-fp').classList.contains('split'); return a; }, rid);
    ok('laptop: list left, firing right; another card replaces it (one history step); closing restores the list', s.split && s.left >= s.listR - 1 && s.sel && s.stack === 1 && !s.after, s);
    ok('laptop: nothing wider than the screen', await noOverflow());
    await page.setViewportSize({ width: 390, height: 844 });

    // --- снимката в детайла на изделие: цялото изделие ---
    s = await E(async () => { const p = DB.pieces.find(x => x.id === 'p-ocarina'); p.photos = ['data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="900"><rect width="300" height="900" fill="#8a9"/></svg>')];
      show('pieces'); openPieceDet('p-ocarina'); await new Promise(r => setTimeout(r, 60)); const fg = document.querySelector('#dpi-hero img.hfg'); return { fit: fg && getComputedStyle(fg).objectFit, h: document.getElementById('dpi-hero').getBoundingClientRect().height }; });
    ok('piece photo: whole piece (contain) on a blurred fill, height still limited', s.fit === 'contain' && s.h <= 262, s);
    ok('no page errors', !app.log.errors.length, app.log.errors);
    await app.close();

    // --- реални архиви ---
    if (fs.existsSync(PRIV)) {
      for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json'))) {
        const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
        const seed = { atelie_v6: JSON.stringify(raw.db || raw) };
        if (raw.kilns) seed.atelie_kilns = JSON.stringify(raw.kilns);
        const a2 = await h.open({ seed, localStorage: Object.assign({ atelie_idb_active: '1' }, raw.kilns ? { atelie_kilns: JSON.stringify(raw.kilns) } : {}) });
        const r = await a2.eval(async (browse) => { const s = document.getElementById('splash'); if (s) s.remove(); show('fp');
          const n = document.querySelectorAll('#run-list .rn-c').length; const same = await (0, eval)('(' + browse + ')')(); return { n, runs: DB.firingRuns.length, same }; }, BROWSE.toString());
        console.log('  ' + f + ':');
        ok('  every firing in the registry (' + r.n + ')', r.n === r.runs, r);
        ok('  browsing every firing and tab changes nothing', r.same, r);
        ok('  no page errors', !a2.log.errors.length, a2.log.errors);
        await a2.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
