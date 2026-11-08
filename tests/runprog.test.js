// v1.46.2 — „Програма и съвместимост“ над разделите на изпичането: планиран профил,
// стартирана програма (само потвърдена), отчетен пик и краткият резултат от _rnCompat().
// Телефон и лаптоп; частните архиви — само ако са налице (не влизат в пакетите).
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const PRIV = path.join(__dirname, 'fixtures', 'private');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 900) : '')); } };

(async () => {
  console.log('runprog:');
  if (!/_rnProgHtml/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))) { console.log('  - not in this version'); process.exit(0); }
  const h = await H.start(ROOT);
  try {
    for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
      const N = vp.n;
      const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
      await app.page.setViewportSize(vp);
      const E = (f, a) => app.eval(f, a);
      await E(() => document.getElementById('splash')?.remove());
      app.acceptConfirms = true;
      let s;
      // общ помощник в страницата
      await E(() => {
        window.__rp = id => { const r = DB.firingRuns.find(x => x.id === id); show('fp'); switchFP('runs'); openRunDet(id);
          const b = document.getElementById('drn-prog'), t = document.getElementById('drn-tabs'), d = document.getElementById('det-run');
          const br = b.getBoundingClientRect(), tr = t.getBoundingClientRect();
          return { text: b.innerText, html: b.innerHTML, vis: !!b.offsetParent && br.height > 0, above: br.bottom <= tr.top + 1, tab: rnTabSel || _rnDefTab(r), br: [br.top, br.bottom, tr.top], verdict: _rnCompat(r).verdict, over: d.scrollWidth > d.clientWidth + 1 }; };
        const xi = DB.materials.find(x => x.id === 'mat-xi-mass'), tf = DB.materials.find(x => x.id === 'mat-toffee');
        xi.fireBisqueTemp = '950-1000'; tf.fireBisqueTemp = '1100-1150';
        DB.series.push({ id: 'sx', name: 'Купички Xi', code: 'GL-2026-901', count: 6, nextUnitNo: 7, retiredUnits: [], stage: 'bone-dry', clay: 'mat-xi-mass', events: [], createdAt: '2026-10-01T00:00:00Z' });
        DB.series.push({ id: 'st', name: 'Чинийки TOFFEE', code: 'GL-2026-902', count: 4, nextUnitNo: 5, retiredUnits: [], stage: 'bone-dry', clay: 'mat-toffee', events: [], createdAt: '2026-10-01T00:00:00Z' });
        const mem = (sid, n, nm) => Array.from({ length: n }, (_, i) => ({ id: sid + i, ref: { kind: 'series', id: sid, unit: i + 1 }, name: nm }));
        DB.firingProfiles.push({ id: 'fp-cool', name: 'Бисквит с охлаждане', type: 'bisque', ramps: [{ rate: 80, to: 600, hold: null }, { rate: 120, to: 980, hold: 20 }, { rate: null, to: 70, hold: null }] });
        DB.firingRuns.push({ id: 'rmix', name: 'Смесено', date: '2026-11-03', method: 'electric', purpose: 'bisque', atmosphere: 'oxidation', firingProfileId: 'fp-cool', state: 'loaded', loadedAt: '2026-11-03T08:00:00Z', plan: { members: mem('sx', 6, 'Купички Xi').concat(mem('st', 4, 'Чинийки TOFFEE')) } });
        DB.firingRuns.push({ id: 'rnone', name: 'Без профил', date: '2026-11-12', method: 'electric', purpose: 'bisque', atmosphere: 'oxidation', state: 'planned', plan: { members: mem('sx', 2, 'Купички Xi') } });
        DB.firingRuns.push({ id: 'rdone', name: 'Приключено', date: '2026-10-20', method: 'electric', purpose: 'bisque', atmosphere: 'oxidation', firingProfileId: 'fp-bisque', state: 'completed', peakTemp: 1012, endedAt: '2026-10-21', plan: { members: mem('sx', 3, 'Купички Xi') } });
        DB.firingRuns.push({ id: 'rint', name: 'Прекъснато', date: '2026-10-25', method: 'electric', purpose: 'glaze', atmosphere: 'oxidation', firingProfileId: 'fp-glaze', state: 'interrupted', endedAt: '2026-10-25', plan: { members: [] } });
        save();
      });

      // 1. заредено с избран профил: блокът е над разделите, отворен е „Зареждане“
      s = await E(() => window.__rp('rmix'));
      ok(`${N} loaded firing with a profile: block above the tabs while „Зареждане“ is open — profile, set peak, type, short check`, s.vis && s.above && s.tab === 'load' && /ПРОГРАМА И СЪВМЕСТИМОСТ/i.test(s.text) && /Бисквит с охлаждане/.test(s.text) && /зададен пик 980 °C/.test(s.text) && /Бисквит/.test(s.text) && s.text.indexOf(s.verdict.text) >= 0 && !s.over, s);
      ok(`${N} mixed load with temperature conflicts → the short result is the conflict verdict of _rnCompat()`, s.verdict.code === 'conflict' && /rp-c lc-v conflict/.test(s.html), s.verdict);
      ok(`${N} loaded: started program is „not confirmed“ (not assumed), with a confirm button; no recorded peak line yet`, /Стартирана програма\s*не е потвърдена/.test(s.text) && /Потвърди коя е пусната/.test(s.text) && !/Отчетен пик/.test(s.text), s.text);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'); return !('ranProgram' in r); });
      ok(`${N} opening writes no started program`, s);

      // 2. преглед на програмата
      s = await E(() => { document.querySelector('#drn-prog .rp-prof').click(); const b = document.getElementById('rpp-body'), mo = document.querySelector('#mo-rprog .mo-sh');
        const rows = [...b.querySelectorAll('.rp-seg tr')].slice(1).map(tr => [...tr.cells].map(c => c.innerText).join('|'));
        return { on: document.getElementById('mo-rprog').classList.contains('on'), rows, svg: !!b.querySelector('svg path'), t: b.innerText, over: mo.scrollWidth > mo.clientWidth + 1 }; });
      ok(`${N} tapping the profile: real segments (rate, target, hold, free cooling), curve and estimated duration`, s.on && s.rows.join(';') === '1|80 °C/ч|600 °C|—;2|120 °C/ч|980 °C|20 мин;3|охлаждане (свободно)|70 °C|—' && s.svg && /Прогнозна продължителност: ~10 ч 45 мин/.test(s.t) && /свободно охлаждане/.test(s.t) && !s.over, s);
      s = await E(() => { const b = [...document.querySelectorAll('#rpp-body button')].find(x => /Отвори профила/.test(x.textContent)); b.click(); const on = document.getElementById('det-fp').classList.contains('on'); closeDet('det-fp'); return { on, mo: document.getElementById('mo-rprog').classList.contains('on'), ed: document.getElementById('mo-fp') ? document.getElementById('mo-fp').classList.contains('on') : false }; });
      ok(`${N} „Отвори профила“ opens the profile itself (no second editor)`, s.on && !s.mo && !s.ed, s);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rint'); window.__rp('rint'); rnProgView('plan'); const rows = [...document.querySelectorAll('#rpp-body .rp-seg tr')].slice(1).map(tr => [...tr.cells].map(c => c.innerText).join('|')); const t = document.getElementById('rpp-body').innerText; closeMo('mo-rprog'); return { rows, t }; });
      ok(`${N} legacy profile (ramp1/ramp2) shown with its migrated segments and an exact duration`, s.rows.join(';') === '1|150 °C/ч|1000 °C|—;2|80 °C/ч|1240 °C|15 мин' && /Прогнозна продължителност: 9 ч 47 мин/.test(s.t) && !/Смени профила/.test(s.t), s);

      // 3. подробности за съвместимостта — същият анализ
      s = await E(() => { window.__rp('rmix'); document.querySelector('#drn-prog .rp-c').click(); const t = document.getElementById('rpc-body').innerText; rnTab('prep'); const p = document.getElementById('drn-compat').innerText;
        const ids = document.querySelectorAll('[id="lc"]').length; closeMo('mo-rcompat'); return { t, p, ids }; });
      ok(`${N} tapping the summary: the existing detailed analysis of every clay, same as in „Подготовка“`, /СЪВМЕСТИМОСТ НА ЗАРЕЖДАНЕТО/i.test(s.t) && /Купички Xi|Xi Beach 100/.test(s.t) && /TOFFEE/.test(s.t) && /6 бр\./.test(s.t) && /4 бр\./.test(s.t) && s.t.replace(/\s+/g, ' ').indexOf(s.p.replace(/\s+/g, ' ').slice(0, 300)) >= 0 && s.ids === 1, s);

      // 4. планирано без профил
      s = await E(() => window.__rp('rnone'));
      ok(`${N} planned firing without a profile: „Няма избран профил“, type, „no peak“ result; no started-program line`, s.vis && s.above && /Няма избран профил/.test(s.text) && /Бисквит/.test(s.text) && s.verdict.code === 'nopeak' && s.text.indexOf(s.verdict.text) >= 0 && !/Стартирана програма/.test(s.text), s);
      s = await E(() => { document.querySelector('#drn-prog .rp-prof').click(); const on = document.getElementById('mo-rn-pick').classList.contains('on'); return on; });
      ok(`${N} … tapping it opens the existing profile picker`, s);

      // 5. смяна на профила → проверката се обновява
      s = await E(() => { rnSetProfile('fp-bisque'); const a = window.__rp('rnone'); rnSetProfile('fp-glaze'); const b = window.__rp('rnone'); return { a, b }; });
      ok(`${N} choosing / changing the profile updates the block and the check (980 → 1240)`, /Бисквит 980/.test(s.a.text) && /зададен пик 980 °C/.test(s.a.text) && s.a.text.indexOf(s.a.verdict.text) >= 0 && /зададен пик 1240 °C/.test(s.b.text) && s.b.text.indexOf(s.b.verdict.text) >= 0 && s.a.verdict.text !== s.b.verdict.text, [s.a.verdict, s.b.verdict]);
      // промяна на състава → проверката се обновява
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'); window.__rp('rmix'); const v0 = _rnCompat(r).verdict.code;
        openPlan('rmix'); r.plan.members.filter(m => m.ref.id === 'st').map(m => m.id).forEach(removePlanMember); closePlan();
        const t = document.getElementById('drn-prog').innerText; return { v0, v1: _rnCompat(r).verdict, t }; });
      ok(`${N} removing the TOFFEE units from the load updates the summary (conflict → another verdict)`, s.v0 === 'conflict' && s.v1.code !== 'conflict' && s.t.indexOf(s.v1.text) >= 0, s);

      // 6. потвърждение на стартираната програма — без да се пипа профилът
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'), fp0 = JSON.stringify(DB.firingProfiles.find(x => x.id === 'fp-cool')), c0 = (r.corrections || []).length;
        window.__rp('rmix'); document.getElementById('rp-ran-btn').click(); const on = document.getElementById('mo-rran').classList.contains('on');
        document.querySelector('#mo-rran input[value="planned"]').click(); document.getElementById('rran-ok').click();
        const t = document.getElementById('drn-prog').innerText; const p = JSON.parse(JSON.stringify(r.ranProgram));
        DB.firingProfiles.find(x => x.id === 'fp-cool').ramps[1].to = 1000; const after = JSON.parse(JSON.stringify(r.ranProgram)); DB.firingProfiles.find(x => x.id === 'fp-cool').ramps[1].to = 980;
        return { on, t, p, after, same: fp0 === JSON.stringify(DB.firingProfiles.find(x => x.id === 'fp-cool')), log: (r.corrections || []).slice(c0).map(c => c.what + ':' + c.to) }; });
      ok(`${N} at „Заредено“: one tap + „Същата като планираната“ records the started program as a snapshot`, s.on && s.p.as === 'planned' && s.p.profileId === 'fp-cool' && JSON.stringify(s.p.ramps) === JSON.stringify([{ rate: 80, to: 600, hold: null }, { rate: 120, to: 980, hold: 20 }, { rate: null, to: 70, hold: null }]) && /същата като планираната · пик 980 °C/.test(s.t) && /Промени/.test(s.t), s);
      ok(`${N} … the profile is not changed; a later profile edit does not rewrite the snapshot; logged in the history`, s.same && s.after.ramps[1].to === 980 && s.log.join() === 'Стартирана програма:същата като планираната · пик 980 °C', s);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'), id = r.firingProfileId;
        document.getElementById('rp-ran-btn').click(); document.querySelector('#mo-rran input[value="other"]').click(); const vis = document.getElementById('rran-pf').style.display !== 'none';
        document.getElementById('rran-fp').value = 'fp-glaze'; document.getElementById('rran-note').value = 'по грешка'; document.getElementById('rran-ok').click();
        const t = document.getElementById('drn-prog').innerText; rnProgView('ran'); const v = document.getElementById('rpp-body').innerText; closeMo('mo-rprog');
        return { p: r.ranProgram, keep: r.firingProfileId === id, t, v, log: r.corrections.slice(-1)[0] }; });
      ok(`${N} a different profile was started: documented separately, planned profile kept; history shows from → to`, s.p.as === 'other' && s.p.profileId === 'fp-glaze' && s.p.note === 'по грешка' && s.keep && /друг профил — „Глазурно 1240 \(стар формат\)“ · пик 1240 °C/.test(s.t) && /Проверка по планирания профил „Бисквит с охлаждане“ — не по стартираната програма/.test(s.t) && /По стартираната програма:/.test(s.t) && /Бисквит с охлаждане/.test(s.t) && s.log.from === 'същата като планираната · пик 980 °C' && /друг профил/.test(s.log.to), s);
      ok(`${N} … its segments viewable (from the snapshot)`, /Стартирана програма|Глазурно 1240/.test(s.v) && /1240 °C/.test(s.v) && /записани при потвърждението/.test(s.v), s.v);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix');
        document.getElementById('rp-ran-btn').click(); document.querySelector('#mo-rran input[value="manual"]').click(); document.getElementById('rran-name').value = ''; document.getElementById('rran-peak').value = ''; document.getElementById('rran-ok').click();
        const stay = document.getElementById('mo-rran').classList.contains('on'); document.getElementById('rran-name').value = 'ръчно на контролера'; document.getElementById('rran-peak').value = '960'; document.getElementById('rran-ok').click();
        return { stay, p: r.ranProgram, t: document.getElementById('drn-prog').innerText, pk: r.peakTemp }; });
      ok(`${N} a manual program (description + set peak); empty is refused; the recorded peak is not touched`, s.stay && s.p.as === 'manual' && s.p.name === 'ръчно на контролера' && s.p.peak === 960 && s.pk == null && /друга програма — „ръчно на контролера“ · пик 960 °C/.test(s.t), s);
      // v1.46.3: „Същата като планираната“ — сегментите от снимката; редакция на профила след това
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'), keep = r.ranProgram;
        window.__rp('rmix'); document.getElementById('rp-ran-btn').click(); document.querySelector('#mo-rran input[value="planned"]').click(); document.getElementById('rran-ok').click();
        const t0 = document.getElementById('drn-prog').innerText, seg0 = !!document.querySelector('#drn-prog button[onclick="rnProgView(\'ran\')"]');
        const fp = DB.firingProfiles.find(x => x.id === 'fp-cool'), fp0 = JSON.stringify(fp);
        fp.ramps[1].rate = 60; fp.ramps[1].hold = 45; save(); const t1 = window.__rp('rmix').text;
        rnProgView('ran'); const rows = [...document.querySelectorAll('#rpp-body .rp-seg tr')].slice(1).map(tr => [...tr.cells].map(c => c.innerText).join('|')); closeMo('mo-rprog');
        rnProgView('plan'); const rowsP = [...document.querySelectorAll('#rpp-body .rp-seg tr')].slice(1).map(tr => [...tr.cells].map(c => c.innerText).join('|')); closeMo('mo-rprog');
        fp.ramps = JSON.parse(fp0).ramps; save(); const t2 = window.__rp('rmix').text;
        return { t0, seg0, t1, rows, rowsP, t2, keep: !!keep }; });
      ok(`${N} v1.46.3 „same as planned“: „Сегменти“ is offered and opens the snapshot; no plan note while snapshot = profile`, s.seg0 && /същата като планираната · пик 980 °C/.test(s.t0) && !/Проверка по планирания профил/.test(s.t0) && !/По стартираната програма/.test(s.t0) && !/Проверка по планирания профил/.test(s.t2), s);
      ok(`${N} v1.46.3 profile edited after the confirmation (same peak 980, other rate/hold): the snapshot still shows 120 °C/h · 20 min; the plan shows the edit; the note appears`, s.rows.join(';') === '1|80 °C/ч|600 °C|—;2|120 °C/ч|980 °C|20 мин;3|охлаждане (свободно)|70 °C|—' && s.rowsP[1] === '2|60 °C/ч|980 °C|45 мин' && /Проверка по планирания профил „Бисквит с охлаждане“ — не по стартираната програма/.test(s.t1), s);
      // v1.46.3: друг профил със същия пик, но други скорости и задръжки
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix');
        DB.firingProfiles.push({ id: 'fp-same', name: 'Бисквит 980 бавен', type: 'bisque', ramps: [{ rate: 50, to: 600, hold: null }, { rate: 60, to: 980, hold: 40 }] });
        DB.materials.find(x => x.id === 'mat-xi-mass').fireMeta = { bisque: { kind: 'maker', status: 'confirmed', rateMax: { from: 600, to: 900, max: 100 } } };
        window.__rp('rmix'); document.getElementById('rp-ran-btn').click(); document.querySelector('#mo-rran input[value="other"]').click(); document.getElementById('rran-fp').value = 'fp-same'; document.getElementById('rran-ok').click();
        const b = window.__rp('rmix'), plan = _rnCompat(r), ran = _rnCompat(r, r.ranProgram);
        const rc = document.getElementById('rp-ran-c'); rc.click(); const mt = document.getElementById('rpc-t').textContent, mb = document.getElementById('rpc-body').innerText; closeMo('mo-rcompat');
        document.querySelector('#drn-prog .rp-c').click(); const pt = document.getElementById('rpc-t').textContent, pb = document.getElementById('rpc-body').innerText; closeMo('mo-rcompat');
        const xr = c => c.rows.find(x => /Xi/.test(x.name));
        delete DB.materials.find(x => x.id === 'mat-xi-mass').fireMeta;
        return { t: b.text, pv: plan.verdict.text, rv: ran.verdict.text, pp: plan.peak, rp: ran.peak, src: ran.peakSrc, xp: xr(plan).req.map(q => q.res).join(), xn: xr(ran).req.map(q => q.res).join(), mt, mb, pt, pb }; });
      ok(`${N} v1.46.3 another profile with the same peak (980), other rates/holds: „Проверка по планирания профил“ is shown anyway`, s.pp === 980 && s.rp === 980 && /Проверка по планирания профил „Бисквит с охлаждане“ — не по стартираната програма/.test(s.t), s.t);
      ok(`${N} v1.46.3 … plus a separate check by the confirmed program (same _rnCompat, its snapshot): the documented rate limit differs (120 vs 60 °C/h)`, s.src === 'ran' && s.xp === 'conflict' && s.xn === 'ok' && s.t.indexOf('По стартираната програма: ' + s.rv) >= 0 && s.t.indexOf(s.pv) >= 0, s);
      ok(`${N} v1.46.3 … each detail is labelled for what it checks (started program vs planned profile)`, /по стартираната програма/i.test(s.mt) && /по стартираната програма „Бисквит 980 бавен“ \(потвърдена\)/.test(s.mb) && /Планирането остава по планирания профил/.test(s.mb) && /програмата задържа 40 min/.test(s.mb) && s.pt === 'Съвместимост на зареждането' && /по профил „Бисквит с охлаждане“ \(зададен\)/.test(s.pb), s);
      // редакция на изпичането запазва потвърждението; повторението не го пренася
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rmix'); openRunMo('rmix'); saveRun(); const k = DB.firingRuns.find(x => x.id === 'rmix').ranProgram;
        const n0 = DB.firingRuns.length; refireRun('rmix'); const nr = DB.firingRuns[DB.firingRuns.length - 1]; return { k, rf: DB.firingRuns.length === n0 + 1 && !('ranProgram' in nr), t: window.__rp(nr.id).text }; });
      ok(`${N} editing the firing keeps the started program; a re-fire does not copy it`, s.k && s.k.as === 'other' && s.k.profileId === 'fp-same' && s.rf && /не е потвърдена|Стартирана/.test(s.t) === false, s);

      // 7. приключено: разлика зададен / реален пик; без потвърдена програма
      s = await E(() => { const b0 = JSON.stringify(DB.firingRuns.find(x => x.id === 'rdone')); const a = window.__rp('rdone'); return Object.assign(a, { same: b0 === JSON.stringify(DB.firingRuns.find(x => x.id === 'rdone')) }); });
      ok(`${N} completed with a different real peak: set 980, recorded 1012, „+32 °C спрямо 980 °C (планирания профил)“ highlighted`, s.vis && s.above && s.tab === 'res' && /Отчетен пик\s*1012 °C/.test(s.text) && /\+32 °C спрямо 980 °C \(планирания профил\)/.test(s.text) && /class="rp-dif"/.test(s.html), s.text);
      ok(`${N} completed without confirmation: „не е потвърдена“, nothing invented or written`, /Стартирана програма\s*не е потвърдена/.test(s.text) && s.same, s.text);
      s = await E(() => window.__rp('rint'));
      ok(`${N} interrupted without a recorded peak: block shown, „не е отчетен“`, s.vis && s.above && /Глазурно 1240/.test(s.text) && /Отчетен пик\s*не е отчетен/.test(s.text) && /Глазурно/.test(s.text), s.text);
      s = await E(() => window.__rp('run-pit'));
      ok(`${N} open (pit) firing: block shown without a profile, no categorical verdict`, s.vis && s.above && /Без температурен профил/.test(s.text) && s.verdict.code === 'alt' && s.text.indexOf(s.verdict.text) >= 0 && !/Стартирана програма/.test(s.text), s.text);
      s = await E(() => ['planned', 'loaded', 'completed', 'interrupted'].map(st => { const r = DB.firingRuns.find(x => x.id === 'run-bis'), o = r.state; r.state = st; const a = window.__rp('run-bis'); r.state = o; return st + ':' + (a.vis && a.above && /Бисквит 980/.test(a.text)); }).join());
      ok(`${N} the block is visible in all four states`, s === 'planned:true,loaded:true,completed:true,interrupted:true', s);
      ok(`${N} no page errors`, !app.log.errors.length, app.log.errors);
      await app.close();
    }

    // ── частните архиви (старите и текущият от 3.11.2026) ──
    if (fs.existsSync(PRIV)) for (const f of fs.readdirSync(PRIV).filter(x => x.endsWith('.json')).sort()) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const v6 = JSON.stringify(Object.assign({ _migrations: { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' } }, raw.db || raw));
      for (const vp of [{ width: 390, height: 844, n: 'phone' }, { width: 1366, height: 860, n: 'laptop' }]) {
        const a = await h.open({ seed: { atelie_v6: v6 }, localStorage: { atelie_idb_active: '1' } });
        await a.page.setViewportSize(vp);
        const s = await a.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB); show('fp');
          const out = DB.firingRuns.map(r => { openRunDet(r.id); const b = document.getElementById('drn-prog'), d = document.getElementById('det-run');
            const okk0 = 1, okk = !!b.offsetParent && b.getBoundingClientRect().bottom <= document.getElementById('drn-tabs').getBoundingClientRect().top + 1 && b.innerText.indexOf(_rnCompat(r).verdict.text) >= 0 && !(d.scrollWidth > d.clientWidth + 1);
            return { okk, name: r.name, st: _runState(r), t: b.innerText, tab: rnTabSel || _rnDefTab(r) }; });
          return { out, same: b0 === JSON.stringify(DB) }; });
        ok(`  ${f} ${vp.n}: ${s.out.length} firings — block above the tabs, verdict = _rnCompat(), no horizontal scroll; nothing written`, s.out.every(x => x.okk) && s.same, s.out.filter(x => !x.okk).map(x => x.name));
        if (f === 'real-2026-11-03.json') {
          const x = s.out.find(o => o.name === 'Бисквитно смес от глини 2.11.2026');
          ok(`  ${f} ${vp.n}: the loaded 2.11 bisque — profile „Бисквит за дива глина…“, set 980 °C, conflict, started program not confirmed, „Зареждане“ open`, x && x.st === 'loaded' && x.tab === 'load' && /Бисквит за дива глина/.test(x.t) && /зададен пик 980 °C/.test(x.t) && /Потенциален конфликт|конфликт/i.test(x.t) && /не е потвърдена/.test(x.t), x);
        }
        ok(`  ${f} ${vp.n}: no page errors`, !a.log.errors.length, a.log.errors);
        await a.close();
      }
    }
  } finally { await h.stop(); }
  console.log(`runprog: ${passed} ok, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
