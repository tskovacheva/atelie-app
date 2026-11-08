// v1.46.0 — Огнена скала и съвместимост на зареждането: чистите функции (domain/fire.js),
// екраните (изпичане, материал, маса, тест, библиотека) и реалният архив от 3.11.2026.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');
const REAL = path.join(__dirname, 'fixtures', 'private', 'real-2026-11-03.json');
let failed = 0, passed = 0;
const ok = (n, c, info) => { if (c) { passed++; console.log('  ok   ' + n); } else { failed++; console.log('  FAIL ' + n + (info !== undefined ? '\n       ' + JSON.stringify(info).slice(0, 800) : '')); } };
const load = f => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8')).toString('base64'));

(async () => {
  console.log('fire:');
  if (!fs.existsSync(path.join(ROOT, 'domain', 'fire.js'))) { console.log('  - not in this version'); process.exit(0); }
  const F = await load('domain/fire.js');
  // ── температурите като текст ──
  const R = F._fireRange;
  ok('„950-980“, „800 - 980“, „980–1050“ → ranges', JSON.stringify([R('950-980'), R('800 - 980'), R('980–1050')].map(x => [x.lo, x.hi])) === '[[950,980],[800,980],[980,1050]]');
  ok('„980“ → a single value, not a range', R('980').t === 980 && R('980').lo === undefined);
  ok('„1050 - 1080 задръжка 20 мин“ → range + the rest kept, not interpreted', R('1050 - 1080 задръжка 20 мин').lo === 1050 && R('1050 - 1080 задръжка 20 мин').rest === 'задръжка 20 мин');
  ok('text without numbers → raw; empty → null', R('по каталог').raw === 'по каталог' && R('') === null && R(null) === null);
  // ── етапи ──
  let st = F._fireStages(980, 'oxidation');
  const B = (st, c) => (st.body || []).find(x => x.code === c);
  ok('980 °C: carbonates probably passed, Ca-silicates in progress; vitrification only placed against the literature interval (never „passed“)', st.passed.some(x => x.code === 'carbonate') && st.active.some(x => x.code === 'ca-silicates') && !st.passed.concat(st.active, st.ahead).some(x => /^vitr/.test(x.code)) && B(st, 'vitr-start').pos === 'passed' && B(st, 'vitr-ext').pos === 'active' && B(st, 'vitr-full').pos === 'ahead', st);
  ok('reduction shifts vitrification by about −50 °C', B(F._fireStages(780, 'oxidation'), 'vitr-start').pos === 'ahead' && B(F._fireStages(780, 'reduction'), 'vitr-start').pos === 'active');
  // v1.48.1: общи процеси / при определен състав / встъкляване — зависи от масата
  const KS = Object.fromEntries(F.FIRE_SCALE.map(x => [x.code, x.kind]));
  ok('v1.48.1 kinds: water, dehydroxylation, quartz general; organics, carbonates, Ca-silicates conditional; the three vitrification stages body-dependent', JSON.stringify(KS) === JSON.stringify({ water: 'general', organics: 'cond', dehydrox: 'general', quartz: 'general', carbonate: 'cond', 'vitr-start': 'body', 'ca-silicates': 'cond', 'vitr-ext': 'body', 'vitr-full': 'body' }), KS);
  ok('v1.48.1 sources: Maniatis & Tite only where they describe it (low-fired clays, Ca-silicates); advanced vitrification is general knowledge, body-dependent', F.FIRE_SCALE.find(x => x.code === 'vitr-full').src === 'общо познание; зависи от масата' && /нискотемпературни/.test(F.FIRE_SCALE.find(x => x.code === 'vitr-start').src) && /Maniatis & Tite 1981/.test(F.FIRE_SCALE.find(x => x.code === 'ca-silicates').src) && /не са общи за всички маси/.test(F.FIRE_BODY_NOTE));
  ok('v1.48.1 intervals unchanged', F.FIRE_SCALE.map(x => x.lo + '-' + x.hi).join() === '20-200,200-900,450-700,573-573,650-900,800-900,850-1050,950-1100,1100-1300');
  ok('carbonate decomposition „probably partial“ in reduction or an open firing with a short hold', F._fireStages(800, 'reduction').active.find(x => x.code === 'carbonate').partial && F._fireStages(800, 'oxidation', 'pit', 10).active.find(x => x.code === 'carbonate').partial && !F._fireStages(800, 'oxidation', 'electric', 10).active.find(x => x.code === 'carbonate').partial);
  ok('no peak → no stages', F._fireStages(null) === null);
  // ── правила ──
  const W = o => F._fireWarnings(o).map(w => w.id + w.kind[0]).join();
  ok('rule 1: calcareous · oxidation · 650–900 → caution', W({ peak: 800, carb: { level: 'strong' } }) === '1w');
  ok('rule 2: + coarse carbonates', W({ peak: 800, carb: { level: 'strong', grain: 'coarse' } }) === '1w,2w');
  ok('rule 3 replaces 1: reduction; or an open method with a short hold (+ rule 7)', W({ peak: 800, atmosphere: 'reduction', carb: { level: 'weak' } }) === '3n' && W({ peak: 800, method: 'pit', carb: { level: 'strong' } }) === '3n,7n');
  ok('rule 4: 850–1050 (with rule 1 up to 900)', W({ peak: 950, carb: { level: 'strong' } }) === '4n' && W({ peak: 880, carb: { level: 'strong' } }) === '1w,4n');
  ok('rule 5: above 1050 — caution for strong, a note for weak', W({ peak: 1100, carb: { level: 'strong' } }) === '5w' && W({ peak: 1100, carb: { level: 'weak' } }) === '5n');
  ok('rule 6: below 600', W({ peak: 550, carb: { level: 'none' } }) === '6n');
  ok('unknown carbonate does not trigger 1–5, only „test with vinegar“ at 650–900', W({ peak: 800, carb: { level: 'unknown' } }) === '8n' && W({ peak: 1100, carb: { level: 'unknown' } }) === '');
  ok('non-calcareous at 800 → no warnings; atmosphere missing = oxidation', W({ peak: 800, carb: { level: 'none' } }) === '' && W({ peak: 800, carb: { level: 'strong' } }) === '1w');
  const pw = F._fireWarnings({ peak: 800, carb: { level: 'possible', share: 30 } })[0], pw2 = F._fireWarnings({ peak: 800, carb: { level: 'possible', share: 70 } })[0];
  ok('a mix with a calcareous component: „possible“ risk with its share, not proven for the whole mass; small share → a note', pw.kind === 'note' && /Възможен/.test(pw.text) && /около 30 %/.test(pw.text) && /не е доказано за цялата маса/.test(pw.text) && pw2.kind === 'warn', [pw, pw2]);
  // ── варовитост на маса ──
  const M = {
    raw: { id: 'raw', cat: 'raw', name: 'Дива', raw: { carbonate: 'strong', carbonateGrain: 'coarse' } }, rawU: { id: 'rawU', cat: 'raw', name: 'Дива 2', raw: {} }, rawN: { id: 'rawN', cat: 'raw', name: 'Чиста', raw: { carbonate: 'none' } },
    clay: { id: 'clay', cat: 'clays', name: 'Търговска' }, ca: { id: 'ca', cat: 'base', name: 'Whiting', formula: 'CaCO₃' }
  };
  const mass = (id, comps) => (M[id] = { id, cat: 'mass', name: id, blend: { components: comps.map(c => ({ ref: 'mat:' + c[0], pct: c[1] })) } });
  mass('m100', [['raw', 100]]); mass('m30', [['raw', 30], ['clay', 70]]); mass('mca', [['ca', 10], ['rawN', 90]]); mass('mu', [['rawU', 100]]); mass('mnn', [['rawN', 50], ['clay', 50]]); mass('mnested', [['m30', 50], ['clay', 50]]);
  mass('cyc1', [['cyc2', 50]]); mass('cyc2', [['cyc1', 50]]);
  const get = id => M[id], C = id => F._massCarbonate(M[id], get);
  ok('raw strong → strong, with its grain; a mass of 100 % of it inherits', C('raw').level === 'strong' && C('raw').grain === 'coarse' && C('m100').level === 'strong');
  ok('30 % strong raw + 70 % commercial clay → „possible“, share 30 %, not „strong“', C('m30').level === 'possible' && C('m30').share === 30, C('m30'));
  ok('added calcite (CaCO₃ by formula) 10 % → possible, share 10 %', C('mca').level === 'possible' && C('mca').share === 10, C('mca'));
  ok('raw without a test → unknown; none + commercial → none', C('mu').level === 'unknown' && C('mnn').level === 'none');
  ok('nested mass keeps „possible“; a cycle does not hang', C('mnested').level === 'possible' && ['none', 'unknown'].indexOf(C('cyc1').level) >= 0);
  ok('commercial clay without data → not evaluated', C('clay') === null);
  // ── съвместимост ──
  const L = F._loadCompat;
  const six = [['TOFFEE', '1100-1300'], ['Witgert', '950-980'], ['Кефалония', null], ['Bisbal', '950-980'], ['PC 04', '800 - 980'], ['SG60', '980']].map((x, i) => ({ key: 'k' + i, name: x[0], units: 1, matId: 'm' + i, text: x[1], meta: null }));
  let c = L({ mode: 'bisque', kiln: true, peak: 980, peakSrc: 'profile', clays: six });
  const res = c.rows.map(r => r.name + ':' + r.res + (r.edge ? '/' + r.edge : '') + (r.exact ? '/exact' : '') + (r.diff ? '/' + r.diff : '')).join(' ');
  ok('mixed bisque 980 °C: TOFFEE conflict (−120), Witgert/Bisbal/PC 04 on the upper edge (unconfirmed), SG60 equal to its single value, Kefalonia unknown', res === 'TOFFEE:conflict/-120 Witgert:unconf/hi Кефалония:unknown Bisbal:unconf/hi PC 04:unconf/hi SG60:unconf/exact', res);
  ok('… no confirmed intersection; with unconfirmed none either — TOFFEE (from 1100) vs one capped at 980; no average', c.inter === null && c.interAll.none && c.interAll.a.name === 'TOFFEE' && c.interAll.b.range.hi === 980 && c.verdict.code === 'conflict', c.interAll);
  c = L({ mode: 'bisque', kiln: true, peak: 980, clays: six.filter(x => x.name !== 'TOFFEE') });
  ok('… without TOFFEE: the unconfirmed values meet only at 980 °C; verdict „incomplete data“, never positive', c.interAll.lo === 980 && c.interAll.hi === 980 && c.verdict.code === 'partial', c.verdict);
  const conf = { kind: 'maker', status: 'confirmed', source: 'лист' };
  const glz = [['PRNF', '1000-1280'], ['TOFFEE', '1200-1300'], ['S&G', '1200-1280']].map((x, i) => ({ key: 'g' + i, name: x[0], units: 2, matId: 'g' + i, text: x[1], meta: conf }));
  c = L({ mode: 'glaze', kiln: true, peak: 1240, clays: glz });
  ok('final firing with a common confirmed range 1200–1280 at 1240 → confirmed for all', c.verdict.code === 'ok' && c.inter.lo === 1200 && c.inter.hi === 1280 && c.rows.every(r => r.res === 'ok'), c);
  c = L({ mode: 'glaze', kiln: true, peak: 1240, clays: glz.map((x, i) => i === 1 ? Object.assign({}, x, { meta: null }) : x) });
  ok('… one of them unconfirmed → incomplete data, not confirmed', c.verdict.code === 'partial' && c.rows[1].res === 'unconf');
  c = L({ mode: 'glaze', kiln: true, peak: 1100, clays: [{ key: 'a', name: 'SG60', units: 1, matId: 'a', text: '1080-1110', meta: conf }, { key: 'b', name: 'TOFFEE', units: 1, matId: 'b', text: '1200-1300', meta: conf }] });
  ok('no common range: the pair is named (TOFFEE from 1200 vs SG60 to 1110)', c.inter.none && c.inter.a.name === 'TOFFEE' && c.inter.b.name === 'SG60' && c.verdict.code === 'conflict', c.inter);
  c = L({ mode: 'bisque', kiln: true, peak: 1000, clays: [{ key: 'a', name: 'SG60', units: 1, matId: 'a', text: '980', meta: conf }] });
  ok('single bisque value 980 at 1000 → conflict +20, no range invented', c.rows[0].res === 'conflict' && c.rows[0].diff === 20);
  c = L({ mode: 'bisque', kiln: true, peak: 980, clays: [{ key: 'a', name: 'SG60', units: 1, matId: 'a', text: '980', meta: conf }] });
  ok('… at 980 → confirmed, exact', c.rows[0].res === 'ok' && c.rows[0].exact && c.verdict.code === 'ok');
  c = L({ mode: 'glaze', single: true, kiln: true, peak: 1240, clays: glz });
  ok('single-fire: final-firing data only as orientation — never positive', c.verdict.code === 'orient' && c.rows.every(r => r.res === 'orient'), c.verdict);
  c = L({ mode: 'bisque', kiln: true, peak: 980, clays: [{ key: 'a', name: 'X', units: 1, matId: 'a', text: '950-1000', meta: { kind: 'approx', status: 'confirmed' } }] });
  ok('an approximate value is never „confirmed“', c.rows[0].res === 'unconf');
  c = L({ mode: 'bisque', kiln: true, peak: null, clays: six });
  ok('no peak → everything unknown, „choose a profile“', c.verdict.code === 'nopeak' && c.rows.every(r => r.res === 'unknown'));
  c = L({ mode: 'bisque', kiln: false, peak: 800, clays: six });
  ok('alternative firing (no kiln) → no categorical verdict', c.verdict.code === 'alt' && c.rows.every(r => r.res === 'unknown'));
  c = L({ mode: 'bisque', kiln: true, peak: 980, clays: [{ key: 'n', name: 'старо име', units: 3, matId: null, text: null }] });
  ok('a legacy clay name without a material → unknown', c.rows[0].res === 'unknown' && /без материал/.test(c.rows[0].why));
  // профили: само документирани ограничения
  const ramps = [{ rate: 80, to: 600, hold: null }, { rate: 120, to: 980, hold: 20 }, { rate: null, to: 70, hold: null }];
  const Q = meta => F._fireReqChecks(meta, ramps).map(q => q.what + ':' + q.res).join();
  ok('no documented limits → nothing checked', Q(null) === '' && Q({ kind: 'maker' }) === '');
  ok('max 100 °C/h in 600–900 vs 120 °C/h → conflict; max 150 → ok; outside the profile → ok', Q({ rateMax: { from: 600, to: 900, max: 100 } }) === 'rate:conflict' && Q({ rateMax: { from: 600, to: 900, max: 150 } }) === 'rate:ok' && Q({ rateMax: { from: 1000, to: 1100, max: 50 } }) === 'rate:ok');
  ok('a segment without rate in the range → unknown, not „ok“', F._fireReqChecks({ rateMax: { from: 0, to: 600, max: 100 } }, [{ rate: null, to: 600 }, { rate: 100, to: 980, hold: 10 }]).map(q => q.res).join() === 'unknown');
  ok('hold 30 min required vs 20 → conflict; 15 → ok', Q({ holdMin: 30 }) === 'hold:conflict' && Q({ holdMin: 15 }) === 'hold:ok');
  ok('cooling limit with free cooling → unknown', Q({ coolMax: { from: 600, to: 500, max: 50 } }) === 'cool:unknown');
  // v1.46.1: управлявано охлаждане — интервалът се въвежда отгоре надолу (600 → 500)
  const CQ = (lim, rr) => F._fireReqChecks({ coolMax: lim }, rr).map(q => q.res).join();
  const ctl = [{ rate: 80, to: 600 }, { rate: 120, to: 980, hold: 20 }, { rate: 100, to: 400 }];
  ok('v1.46.1 controlled cooling 100 °C/h through 600→500, limit 50 → conflict (was unknown)', CQ({ from: 600, to: 500, max: 50 }, ctl) === 'conflict');
  ok('v1.46.1 controlled cooling 100 °C/h, limit 150 → ok', CQ({ from: 600, to: 500, max: 150 }, ctl) === 'ok');
  ok('v1.46.1 free cooling (no rate) through the interval → unknown', CQ({ from: 600, to: 500, max: 50 }, [{ rate: 120, to: 980, hold: 20 }, { rate: null, to: 70 }]) === 'unknown');
  ok('v1.46.1 a segment crossing only part of the interval (980→550 at 100) → conflict; at 40 → ok', CQ({ from: 600, to: 500, max: 50 }, [{ rate: 120, to: 980 }, { rate: 100, to: 550 }]) === 'conflict' && CQ({ from: 600, to: 500, max: 50 }, [{ rate: 120, to: 980 }, { rate: 40, to: 550 }]) === 'ok');
  ok('v1.46.1 controlled cooling ends above the interval, then free cooling → unknown (not ok)', CQ({ from: 600, to: 500, max: 50 }, [{ rate: 120, to: 980 }, { rate: 100, to: 700 }, { rate: null, to: 70 }]) === 'unknown');
  ok('v1.46.1 the interval in reverse order (500→600) gives the same result', CQ({ from: 500, to: 600, max: 50 }, ctl) === 'conflict' && CQ({ from: 500, to: 600, max: 150 }, ctl) === 'ok');
  ok('v1.46.1 heating segments are never counted as cooling', CQ({ from: 600, to: 500, max: 50 }, [{ rate: 300, to: 980 }]) === 'unknown');
  c = L({ mode: 'bisque', kiln: true, peak: 980, ramps, clays: [{ key: 'a', name: 'X', units: 1, matId: 'a', text: '950-980', meta: Object.assign({ rateMax: { from: 600, to: 900, max: 100 } }, conf) }] });
  ok('a temperature match with a documented rate conflict → the row is a conflict', c.rows[0].res === 'conflict' && c.rows[0].req[0].res === 'conflict');
  const sameA = L({ mode: 'bisque', kiln: true, peak: 980, ramps, clays: six }), sameB = L({ mode: 'bisque', kiln: true, peak: 980, ramps: [{ rate: 100, to: 600 }, { rate: null, to: 980, hold: 15 }], clays: six });
  ok('two profiles to the same peak, different rates/holds: same temperature result (no documented limits) — heat work is not claimed equal', JSON.stringify(sameA.rows.map(r => r.res)) === JSON.stringify(sameB.rows.map(r => r.res)));
  // тълкуване на тест
  ok('slake „falls“ → probably not ceramized', F._testFireStage({ slake: 'falls' }).code === 'raw');
  ok('slake „ok“ alone → probably ceramized, with the caveat', /не доказва/.test(F._testFireStage({ slake: 'ok' }).basis));
  ok('absorption relative to ≥3 tests of the same mass; < 3 or a < 1 % spread → no chip', F._testFireStage({ poro: 14, series: [14, 9, 4] }).code === 'rel' && F._testFireStage({ poro: 14, series: [14, 9] }) === null && F._testFireStage({ poro: 10, series: [10, 10.4, 10.2] }) === null && /вероятно/.test(F._testFireStage({ poro: 4, series: [14, 9, 4] }).text));
  const d = F._limeDue('2026-11-01', [], '2026-11-03'), d2 = F._limeDue('2026-11-01', [{ date: '2026-11-02' }], '2026-11-03');
  ok('lime checks: +1 / +7 / +30 days, computed; a check on day 2 satisfies +1', d.map(x => x.date).join() === '2026-11-02,2026-11-08,2026-12-01' && d[0].due && !d[0].done && d2[0].done && !d2[1].due);

  // ── в приложението ──
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
      // материал: произход и изисквания — формуляр ↔ запис
      s = await E(() => { show('materials'); const m = DB.materials.find(x => x.id === 'mat-toffee'); const b0 = JSON.stringify(m); openMatMo(m); saveMat(); const same = (() => { const a = JSON.parse(b0), b = JSON.parse(JSON.stringify(DB.materials.find(x => x.id === 'mat-toffee'))); delete a.updatedAt; delete b.updatedAt; const nv = v => v == null || v === '' || v === false ? '' : JSON.stringify(v); return [...new Set(Object.keys(a).concat(Object.keys(b)))].every(k => nv(a[k]) === nv(b[k])); })();
        openMatMo(DB.materials.find(x => x.id === 'mat-toffee')); const set = (id, v) => { document.getElementById(id).value = v; };
        set('mi-fire-bisque', '950-980'); set('mi-fmb-kind', 'maker'); set('mi-fmb-status', 'confirmed'); set('mi-fmb-src', 'лист 2025'); set('mi-fmb-rf', '600'); set('mi-fmb-rt', '900'); set('mi-fmb-rm', '100'); set('mi-fmb-hold', '15'); saveMat();
        const q = DB.materials.find(x => x.id === 'mat-toffee'); openMatDet(q.id); const det = document.getElementById('dmat-fire').innerText;
        openMatMo(q); const back = ['mi-fmb-kind', 'mi-fmb-status', 'mi-fmb-rm', 'mi-fmb-hold'].map(id => document.getElementById(id).value).join(); closeMo('mo-mat'); closeDet('det-mat');
        return { same, fm: q.fireMeta, det, back }; });
      ok(`${N} material: unchanged edit keeps the record; origin, status, source and limits saved and shown`, s.same && s.fm.bisque.kind === 'maker' && s.fm.bisque.status === 'confirmed' && s.fm.bisque.rateMax.max === 100 && s.fm.bisque.holdMin === 15 && !s.fm.glaze && /950–980 °C/.test(s.det) && /препоръка на производителя · потвърдено · лист 2025/.test(s.det) && s.back === 'maker,confirmed,100,15', s);
      // суровина и маса: варовитост
      s = await E(() => { const r = DB.materials.find(x => x.id === 'mat-xi'); openMatMo(r); document.getElementById('mi-raw-carb').value = 'strong'; document.getElementById('mi-raw-grain').value = 'coarse'; document.getElementById('mi-raw-carbnote').value = 'черупки'; saveMat();
        const rr = DB.materials.find(x => x.id === 'mat-xi'); openMatDet('mat-xi-mass'); const md = document.getElementById('dmat-fire').innerText; const mass = DB.materials.find(x => x.id === 'mat-xi-mass');
        openMassMo(mass); document.getElementById('ms-fire-bisque').value = '900-950'; saveMass(); closeDet('det-mat');
        return { raw: rr.raw, md, comps: mass.blend.components, mb: DB.materials.find(x => x.id === 'mat-xi-mass').fireBisqueTemp, ev: (rr.raw.events || []).length }; });
      ok(`${N} raw material: carbonate, grain and note saved (events kept); the mass shows the computed carbonate with its origin`, s.raw.carbonate === 'strong' && s.raw.carbonateGrain === 'coarse' && s.raw.carbonateNote === 'черупки' && /силно шумене|възможно/.test(s.md) && /Изчислено/.test(s.md) && s.mb === '900-950', s);
      // изпичане: глини по бройки, серия, тестове; нищо не се записва
      s = await E(() => { const b0 = JSON.stringify(DB); const r = DB.firingRuns.find(x => x.id === 'run-gl'); show('fp'); switchFP('runs'); openRunDet(r.id); rnTab('prep');
        const t = document.getElementById('drn-compat').innerText, f = document.getElementById('drn-fire').innerText; const d = document.getElementById('det-run');
        return { t, f, same: b0 === JSON.stringify(DB), over: d.scrollWidth > d.clientWidth + 1 }; });
      ok(`${N} run detail (Подготовка): „Съвместимост на зареждането“ and „Огнена скала“; opening writes nothing; no horizontal scroll`, /СЪВМЕСТИМОСТ НА ЗАРЕЖДАНЕТО/i.test(s.t) && /ОГНЕНА СКАЛА/i.test(s.f) && s.same && !s.over, s);
      // серия с 40 бройки от една маса в планирано изпичане
      s = await E(() => { DB.series.push({ id: 'se40', name: 'Висулки', code: 'GL-2026-990', count: 40, nextUnitNo: 41, retiredUnits: [], stage: 'bone-dry', clay: 'mat-xi-mass', events: [], createdAt: '2026-10-01T00:00:00Z' });
        DB.firingRuns.push({ id: 'rn40', name: 'Бисквит 40', date: '2026-11-10', method: 'electric', purpose: 'bisque', peakTemp: 850, atmosphere: 'oxidation', state: 'planned', plan: { members: Array.from({ length: 40 }, (_, i) => ({ id: 'pm' + i, ref: { kind: 'series', id: 'se40', unit: i + 1 }, name: 'Висулки' })) } });
        openRunDet('rn40'); rnTab('prep'); return { t: document.getElementById('drn-compat').innerText, f: document.getElementById('drn-fire').innerText }; });
      ok(`${N} series of 40 from one mass: one row „40 бр.“; peak entered (no profile) is labelled so`, /Xi Beach 100\s*40 бр\./.test(s.t) && /въведен, не е от профил/.test(s.t) && /900–950 °C/.test(s.t), s.t);
      ok(`${N} calcareous mass at 850 °C oxidation → lime-popping risk named for that mass (possible/strong), with the checks advice`, /Xi Beach 100/.test(s.f) && /пукане на вар/.test(s.f) && /1 ден, 1 седмица и 1 месец/.test(s.f), s.f);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rn40'); r.method = 'pit'; r.purpose = 'alternative'; openRunDet('rn40'); rnTab('prep'); const t = document.getElementById('drn-compat').innerText, f = document.getElementById('drn-fire').innerText; r.method = 'electric'; r.purpose = 'bisque'; return { t, f }; });
      ok(`${N} alternative (pit) firing: no categorical compatibility; the scale says the band is conditional`, /Алтернативно изпичане/.test(s.t) && /не се оценява категорично/.test(s.t) && /условна ивица ±100 °C, не измерена точност/.test(s.f), s);
      s = await E(() => { const r = DB.firingRuns.find(x => x.id === 'rn40'); delete r.peakTemp; openRunDet('rn40'); rnTab('prep'); return { t: document.getElementById('drn-compat').innerText, f: document.getElementById('drn-fire').innerText }; });
      ok(`${N} no peak: compatibility asks for a profile or a peak; the scale only notes „Запиши пика“ (calcareous clay present)`, /Няма пик/.test(s.t) && /Запиши пика/.test(s.f), s);
      // тест на маса: наблюдения, тълкуване, пукане на вар, крива
      s = await E(() => { show('tests'); const t = DB.tests.find(x => x.id === 't-body'); t.date = '2026-10-01'; t.temp = '950'; t.body = Object.assign({}, t.body, { poroDry: 20, poroWet: 22, shrMarked: 100, shrDry: 95, shrFired: 90 });
        [['t-b2', '850', 23.6, 92], ['t-b3', '1050', 20.4, 88]].forEach(x => DB.tests.push({ id: x[0], kind: 'body', bodyRef: 'mat:mat-xi-mass', date: '2026-10-01', temp: x[1], body: { poroDry: 20, poroWet: x[2], shrMarked: 100, shrDry: 95, shrFired: x[3] } }));
        editId = t.id; openTestMo(t); document.getElementById('ti-slake').value = 'ok'; document.getElementById('ti-core').value = 'grey'; document.getElementById('ti-rim').value = '1,5'; saveTest();
        const q = DB.tests.find(x => x.id === 't-body'); openTestDet(q.id); const d = document.getElementById('dtest-fire').innerText; return { b: q.body, d }; });
      ok(`${N} body test: soak, core and rim saved; shown as observations, separate from the interpretation`, s.b.slake === 'ok' && s.b.fractureCore === 'grey' && s.b.fractureRim === 1.5 && /НАБЛЮДЕНИЯ/i.test(s.d) && /не се разкисва/.test(s.d) && /ТЪЛКУВАНЕ/i.test(s.d) && /вероятно/.test(s.d) && /Тълкуване, не измерване/.test(s.d), s);
      ok(`${N} lime checks: +1/+7/+30 suggested for the calcareous mass, waiting ones marked`, /\+1 ден · 2026-10-02 — чака/.test(s.d) && /\+30 дни · 2026-10-31/.test(s.d), s.d);
      s = await E(() => { show('tests'); const before = document.getElementById('tests-list').querySelectorAll('[onclick]').length; TS.wait = true; renderTests(); const w = [...document.querySelectorAll('#tests-list [onclick]')].map(x => x.getAttribute('onclick'));
        openTestDet('t-body'); openLimeCheck(); document.getElementById('lm-date').value = '2026-11-02'; document.getElementById('lm-res').value = 'spots'; saveLimeCheck(); const d = document.getElementById('dtest-fire').innerText; renderTests(); const w2 = [...document.querySelectorAll('#tests-list [onclick]')].map(x => x.getAttribute('onclick'));
        TS.wait = false; renderTests(); return { w, w2, d, lc: DB.tests.find(x => x.id === 't-body').body.limeChecks }; });
      ok(`${N} filter „Чака проверка“; „+ Проверка“ records date/result; a check on 2.11 settles +1/+7/+30 → leaves the filter`, s.w.some(x => /t-body/.test(x)) && s.lc.length === 1 && s.lc[0].result === 'spots' && /2026-11-02 · петна/.test(s.d) && !s.w2.some(x => /t-body/.test(x)), s);
      s = await E(() => { openMatDet('mat-xi-mass'); return document.getElementById('dmat-fire').innerHTML; });
      ok(`${N} mass detail: water-absorption and shrinkage curves from its 3 tests`, /Водопопиваемост, %/.test(s) && /Свиване общо, %/.test(s) && /850 °C/.test(s) && /1050 °C/.test(s), s.slice(0, 300));
      s = await E(() => { closeDet('det-mat'); show('lib'); document.getElementById('lib-fire-scale').click(); const t = document.getElementById('fs-body').innerText; const mo = document.querySelector('#mo-fscale .mo-sh'); const over = mo.scrollWidth > mo.clientWidth + 1; fsCard('carbonate'); const on = document.querySelector('.fs-card.on') && document.querySelector('.fs-card.on').id; closeMo('mo-fscale'); return { t, on, over }; });
      ok(`${N} Library → Tools → „Огнена скала“: scale, stage cards, masses with curves; tapping a band opens its card`, /Разпад на карбонати/.test(s.t) && /Криви на масите/i.test(s.t) && /Xi Beach 100/.test(s.t) && s.on === 'fsc-carbonate' && !s.over, s);
      // v1.48.1: групите в скалата и встъкляването като ориентир
      s = await E(() => { show('lib'); openFireScale(); const g = [...document.querySelectorAll('#fs-body .fsx-g')].map(x => x.textContent); const vf = document.getElementById('fsc-vitr-full').innerText, b = document.querySelector('#fsr-vitr-full .fsx-b').className; closeMo('mo-fscale');
        DB.materials.find(x => x.id === 'mat-toffee').fireBisqueTemp = ''; DB.firingRuns.push({ id: 'rn-sw', name: 'Каменина', date: '2026-11-11', method: 'electric', purpose: 'bisque', peakTemp: 980, atmosphere: 'oxidation', state: 'planned', plan: { members: [{ id: 'sw1', ref: { kind: 'piece', id: 'p-ocarina' } }] } });
        openRunDet('rn-sw'); rnTab('prep'); const f = document.getElementById('drn-fire').innerText; DB.firingRuns = DB.firingRuns.filter(x => x.id !== 'rn-sw'); return { g, vf, b, f }; });
      ok(`${N} v1.48.1 the scale in groups „Общи процеси“, „При определен състав“, „Встъкляване — зависи от масата“; vitrification marked as a guide with the note`, s.g.join('|') === 'Общи процеси|При определен състав|Встъкляване — зависи от масата' && /ориентир, зависи от масата/.test(s.vf) && /не са общи за всички маси/.test(s.vf) && /общо познание; зависи от масата/.test(s.vf) && /body/.test(s.b), s);
      ok(`${N} v1.48.1 a firing to 980 °C: „Вероятно минати“ no longer lists vitrification; it is shown apart, against the literature interval, with the body note`, !/Вероятно минати[^\n]*встъкляване/i.test(s.f.split('Встъкляване')[0]) && /Встъкляване — зависи от масата — ориентир/i.test(s.f) && /Начало на встъкляване \(800–900 °C\): пикът е над интервала/.test(s.f) && /Напреднало встъкляване \(1100–1300 °C\): пикът е под интервала/.test(s.f) && /за всяка маса решават нейните тестове/.test(s.f), s.f);
      // v1.47.1: пълната скала — ред на етап, без хоризонтално превъртане, лентите по оста
      s = await E(() => { if (typeof _fireScaleHtml !== 'function') return null; show('lib'); openFireScale(); const rows = [...document.querySelectorAll('#fs-body .fsx-r')];
        const tr = document.querySelector('#fsr-carbonate .fsx-tr').getBoundingClientRect(), b = document.querySelector('#fsr-carbonate .fsx-b').getBoundingClientRect();
        document.querySelector('#fsr-carbonate').click(); const on = [...document.querySelectorAll('.fsx-r.on,.fs-card.on')].map(x => x.id).sort().join();
        const body = document.getElementById('fs-body'), mo = document.querySelector('#mo-fscale .mo-sh'); const r = { n: rows.length, svg: !!body.querySelector('svg'), lo: (b.left - tr.left) / tr.width, hi: (b.right - tr.left) / tr.width, h: b.height, on, over: mo.scrollWidth > mo.clientWidth + 1 || body.scrollWidth > body.clientWidth + 1, tag: document.querySelector('#fsr-carbonate em').textContent };
        closeMo('mo-fscale'); return r; });
      if (s) ok(`${N} v1.47.1 full scale: 9 stage rows on one 0–1300 °C axis, no horizontal scroll, bars ≥ 16 px; carbonates 650–900; tap marks row and card; type in words`, s.n === 9 && !s.svg && !s.over && s.h >= 16 && Math.abs(s.lo - 650 / 1300) < 0.01 && Math.abs(s.hi - 900 / 1300) < 0.01 && s.on === 'fsc-carbonate,fsr-carbonate' && s.tag === 'варовити', s);
      // самостоятелна стъпка: мини-скала
      s = await E(() => { const p = DB.pieces.find(x => x.id === 'p-old'); ensurePieceEvents(p); p.events.push({ id: 'evf', type: 'firing', date: '2026-10-05', note: '', photos: [], data: { temp: 1000, atmosphere: 'oxidation', method: 'electric' } }); openPieceDet(p.id); _pdOpen.piece.fire = true; openPieceDet(p.id); return document.querySelector('#dpi-secs .pd-fs') ? document.querySelector('#dpi-secs .pd-fs').innerText : null; });
      ok(`${N} a standalone firing step (no run) shows the same mini-scale from its own data`, s && /Вероятно минати/.test(s), s);
      ok(`${N} no page errors`, !app.log.errors.length, app.log.errors);
      await app.close();
    }
    // ── реалният архив от 3.11.2026 ──
    if (fs.existsSync(REAL)) {
      const raw = JSON.parse(fs.readFileSync(REAL, 'utf8'));
      console.log('  real-2026-11-03.json (schemaVersion ' + raw.schemaVersion + '):');
      const a2 = await h.open({ seed: { atelie_v6: JSON.stringify(raw.db) }, localStorage: { atelie_idb_active: '1' } });
      let s = await a2.eval(() => { document.getElementById('splash')?.remove(); const b0 = JSON.stringify(DB.materials); const r = DB.firingRuns.find(x => x.name === 'Бисквитно смес от глини 2.11.2026');
        const C = _rnCompat(r); show('fp'); openRunDet(r.id); rnTab('prep'); const t = document.getElementById('drn-compat').innerText;
        return { rows: C.rows.map(x => x.name.split(' ')[0] + ':' + x.res + (x.edge ? '/' + x.edge : '') + ':' + x.units), v: C.verdict.code, peak: C.peak, src: C.peakSrc, t, same: b0 === JSON.stringify(DB.materials) }; });
      ok('  the real loaded bisque (2.11, profile to 980): TOFFEE and Sibelco S 2505 conflict; Witgert, Bisbal, PC 04 on the upper edge; Kefalonia unknown; counts by unit', s.peak === 980 && s.src === 'profile' && s.v === 'conflict' && s.rows.join() === ['Sibelco:conflict:11', 'Червена:unconf/hi:1', 'Огнеупорна:unconf/hi:4', 'Дива:unknown:4', 'TOFFEE:conflict:3', 'Bisbal:unconf/hi:9'].join(), s.rows);
      ok('  shown with value, origin („не е посочен · непотвърдено“) and a link to complete; materials untouched', /произход не е посочен · непотвърдено/.test(s.t) && /Допълни/.test(s.t) && s.same, s.t.slice(0, 400));
      s = await a2.eval(() => { const by = n => DB.materials.find(m => m.name.indexOf(n) === 0);
        const clays = ['TOFFEE', 'Огнеупорна бяла widgert', 'Дива глина Кефалония - чиста', 'Bisbal CBH', 'Червена PC 04', 'Бяла каменина SG60'].map(by);
        const C = _loadCompat({ mode: 'bisque', kiln: true, peak: 980, peakSrc: 'profile', clays: clays.map(m => ({ key: m.id, name: m.name, units: 1, matId: m.id, text: m.fireBisqueTemp, meta: m.fireMeta ? m.fireMeta.bisque : null })) });
        const C2 = _loadCompat({ mode: 'bisque', kiln: true, peak: 980, clays: clays.slice(1).map(m => ({ key: m.id, name: m.name, units: 1, matId: m.id, text: m.fireBisqueTemp, meta: null })) });
        const kef = _matCarb(by('Дива глина Кефалония - чиста'));
        const W = _fireWarnings({ peak: 980, atmosphere: 'oxidation', method: 'electric', holdMin: 20, carb: kef });
        return { rows: C.rows.map(x => x.name.split(' ')[0] + ':' + x.res + (x.exact ? '/exact' : '')), v: C.verdict.code, inter: C.inter, all: C.interAll, all2: C2.interAll, v2: C2.verdict.code, kef: kef && kef.level, W: W.map(w => w.id) }; });
      ok('  the spec scenario (TOFFEE, Witgert 120.7, Kefalonia, Bisbal CBH, PC 04 W8, Montesa SG60 at 980): only TOFFEE conflicts; SG60 equals its single value; Kefalonia unknown', s.v === 'conflict' && s.rows.join() === 'TOFFEE:conflict,Огнеупорна:unconf,Дива:unknown,Bisbal:unconf,Червена:unconf,Бяла:unconf/exact', s.rows);
      ok('  … no confirmed intersection (no sources yet); without TOFFEE the entered values meet only at 980 °C — still „incomplete“, not positive', s.inter === null && s.all.none && s.all2.lo === 980 && s.all2.hi === 980 && s.v2 === 'partial', s);
      ok('  Kefalonia: carbonate not yet tested → unknown, no lime rules invented at 980', s.kef === 'unknown' && s.W.length === 0, s);
      s = await a2.eval(() => { const b0 = JSON.stringify(DB); ['materials', 'tests', 'fp'].forEach(show); DB.materials.forEach(m => openMatDet(m.id)); DB.tests.forEach(t => openTestDet(t.id)); DB.firingRuns.forEach(r => { openRunDet(r.id); rnTab('prep'); }); openFireScale(); closeMo('mo-fscale');
        DB.materials.filter(m => m.cat === 'clays' || m.cat === 'raw').forEach(m => { openMatMo(m); closeMo('mo-mat'); }); DB.materials.filter(m => m.cat === 'mass').forEach(m => { openMassMo(m); closeMo('mo-mass'); });
        return b0 === JSON.stringify(DB); });
      ok('  every material, test, firing and form opened — nothing written', s, s);
      s = await a2.eval(() => { const m = DB.materials.find(x => x.name === 'Бяла каменина SG60'); const b0 = JSON.stringify(m); openMatMo(m); saveMat(); const a = JSON.parse(b0), b = JSON.parse(JSON.stringify(DB.materials.find(x => x.id === m.id))); delete a.updatedAt; delete b.updatedAt; return JSON.stringify(a) === JSON.stringify(b); });
      ok('  an unchanged edit of a real clay keeps it exactly (no fireMeta invented)', s, s);
      ok('  no page errors', !a2.log.errors.length, a2.log.errors);
      await a2.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
