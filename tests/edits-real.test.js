// Every record of every private (real) archive: open its editor, save without
// changes, compare. Nothing may change but updatedAt, empty-vs-missing, and a
// number becoming its text (forms write text: the seeded recipes carry
// temp:1240, a saved one '1240' — both read the same everywhere).
// Old two-segment profiles are rewritten into `ramps` on save (since v1.16.0) —
// that is compared by meaning, not by keys.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const PRIV = path.join(__dirname, 'fixtures', 'private');
const DONE = { 'v1.3.2': 'x', 'v1.4.2.3': 'x', 'v1.15.0': 'x' };
const KINDS = [
  ['pieces', "curPiece=ID;editPiece()", 'savePiece()', r => !r.seriesId || true],
  ['series', "curSeries=ID;editSeries()", 'savePiece()'],
  ['recipes', "curRec=ID;editRecipe()", 'saveRecipe()'],
  ['tests', "curTest=ID;editTest()", 'saveTest()'],
  ['materials', "curMat=ID;editMat()", "(DB.materials.find(m=>m.id===ID).cat==='mass'?saveMass():saveMat())"],
  ['firingProfiles', "curFP=ID;editFP()", 'saveFP()'],
  ['firingRuns', "curRun=ID;openRunMo(ID)", 'saveRun()']
];
(async () => {
  if (!fs.existsSync(PRIV)) { console.log('edits-real: skip (no private archives)'); return; }
  const files = fs.readdirSync(PRIV).filter(f => f.endsWith('.json'));
  const h = await H.start(ROOT);
  let failed = 0, passed = 0;
  try {
    for (const f of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(PRIV, f), 'utf8'));
      const v6 = JSON.stringify(Object.assign({ _migrations: DONE }, raw.db || raw));
      console.log('edits-real (' + f + '):');
      const app = await h.open({ seed: { atelie_v6: v6 }, localStorage: { atelie_idb_active: '1' } });
      for (const [coll, open, save] of KINDS) {
        const res = await app.eval(async ({ coll, open, save }) => {
          const sleep = ms => new Promise(r => setTimeout(r, ms));
          const isEmpty = v => v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);
          const norm = o => { if (Array.isArray(o)) return o.map(norm); if (o && typeof o === 'object') { const c = {}; Object.keys(o).sort().forEach(k => { if (!isEmpty(o[k])) c[k] = norm(o[k]); }); return c; } return typeof o === 'number' ? String(o) : o; };
          const prep = (r) => { const c = norm(JSON.parse(JSON.stringify(r))); delete c.updatedAt;
            if (coll === 'firingProfiles') { c.ramps = _fpRamps(r); ['ramp1Rate', 'ramp1To', 'ramp2Rate', 'ramp2To', 'holdMin'].forEach(k => delete c[k]); c.ramps = norm(c.ramps); }
            return c; };
          const out = [];
          for (const r0 of DB[coll].slice()) {
            if (String(r0.id).indexOf('builtin') === 0) continue;
            const before = prep(r0);
            const ID = JSON.stringify(r0.id);
            try { (0, eval)(open.replace(/ID/g, ID)); await sleep(80); (0, eval)(save.replace(/ID/g, ID)); await sleep(80); }
            catch (e) { out.push([r0.name || r0.id, 'error: ' + e.message]); continue; }
            const openMo = Array.from(document.querySelectorAll('.mo.on')).map(m => m.id);
            if (openMo.length) { out.push([r0.name || r0.id, 'editor did not close: ' + openMo.join(',')]); document.querySelectorAll('.mo.on').forEach(m => closeMo(m.id)); continue; }
            const after = prep(DB[coll].find(x => x.id === r0.id));
            const diffs = [];
            (function d(a, b, p) { if (JSON.stringify(a) === JSON.stringify(b)) return; if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) { new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => d(a[k], b[k], p + '.' + k)); return; } diffs.push(p + ': ' + JSON.stringify(b).slice(0, 50) + ' → ' + JSON.stringify(a).slice(0, 50)); })(after, before, '');
            out.push([r0.name || r0.id, diffs.join('; ')]);
          }
          return out;
        }, { coll, open, save });
        const bad = res.filter(x => x[1]);
        if (bad.length) { failed++; console.log('  FAIL ' + coll + ' (' + bad.length + '/' + res.length + ')'); bad.slice(0, 8).forEach(b => console.log('       ' + b[0] + ': ' + b[1])); }
        else { passed++; console.log('  ok   ' + coll + ' — ' + res.length + ' records unchanged by an edit'); }
      }
      if (app.log.errors.length) { failed++; console.log('  FAIL page errors: ' + app.log.errors.slice(0, 3).join(' | ')); }
      await app.close();
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
