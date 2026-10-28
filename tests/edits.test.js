// Edit-preservation tests: for every kind of record, open its edit form and save
// it without touching anything. Nothing may change except `updatedAt`.
//
// A probe field the form does not know about (`_probe`) is planted first. Before
// v1.29.0 every save rebuilt the record from the form, so any field the form did
// not show vanished on the first edit — that is how v1.24.1 lost series membership,
// and how a kiln position or a piece code would have been lost next.
//
// A second pass clears one field in the form and checks it is really gone: the
// merge must not resurrect what the person deliberately removed.
const path = require('path');
const fs = require('fs');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

let failed = 0, passed = 0;
const ok = n => { passed++; console.log('  ok   ' + n); };
const bad = (n, m) => { failed++; console.log('  FAIL ' + n + '\n       ' + m); };

// Each case: where the record lives, how to open its editor, how to save it, and
// optionally a field to clear (selector + the record field that must disappear).
const CASES = [
  { name: 'piece', coll: 'pieces', id: 'p-ocarina', open: "curPiece=ID;editPiece()", save: 'savePiece()', clear: ['#pi-notes', 'notes'] },
  { name: 'split piece', coll: 'pieces', id: 'p-yellow', open: "curPiece=ID;editPiece()", save: 'savePiece()' },
  { name: 'series', coll: 'series', id: 'se-plates', open: "curSeries=ID;editSeries()", save: 'savePiece()' },
  { name: 'recipe', coll: 'recipes', id: 'rec-ash-2', open: "curRec=ID;editRecipe()", save: 'saveRecipe()' },
  { name: 'glaze test', coll: 'tests', id: 't-glaze', open: "curTest=ID;editTest()", save: 'saveTest()' },
  { name: 'body test', coll: 'tests', id: 't-body', open: "curTest=ID;editTest()", save: 'saveTest()', deep: 'body', clear: ['#ti-shr-fired', 'body.shrFired'] },
  { name: 'material', coll: 'materials', id: 'mat-feldspar', open: "curMat=ID;editMat()", save: 'saveMat()', deep: 'chem', clear: ['#mi-sio2', 'chem.sio2'] },
  { name: 'material notes', coll: 'materials', id: 'mat-toffee', open: "curMat=ID;editMat()", save: 'saveMat()', clear: ['#mi-notes', 'notes'] },
  { name: 'raw material', coll: 'materials', id: 'mat-xi', open: "curMat=ID;editMat()", save: 'saveMat()', deep: 'raw' },
  { name: 'mass', coll: 'materials', id: 'mat-xi-mass', open: "curMat=ID;editMat()", save: 'saveMass()', deep: 'blend' },
  { name: 'firing profile', coll: 'firingProfiles', id: 'fp-bisque', open: "curFP=ID;editFP()", save: 'saveFP()' },
  { name: 'firing run', coll: 'firingRuns', id: 'run-bis', open: "curRun=ID;openRunMo(ID)", save: 'saveRun()', clear: ['#rn-cones', 'cones'] },
  { name: 'firing run peak', coll: 'firingRuns', id: 'run-gl', open: "curRun=ID;openRunMo(ID)", save: 'saveRun()', clear: ['#rn-peak', 'peakTemp'] },
  { name: 'process step', coll: 'pieces', id: 'p-ocarina', event: 'o-e5', open: "curPiece='p-ocarina';editKind='piece';openEventMo('firing',ID)", save: 'saveEvent()', deep: 'data', clear: ['#ev-note', 'note'] },
  { name: 'raw step', coll: 'materials', id: 'mat-xi', rawEvent: 'rx2', open: "curMat='mat-xi';openRawEventMo(ID)", save: 'saveRawEvent()', deep: 'data' }
];

// Empty is empty: a form writes '' for a field the record never had, and that is
// not a change. Everything else is compared exactly.
const isEmpty = v => v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && v.length === 0);
const norm = o => {
  if (Array.isArray(o)) return o.map(norm);
  if (o && typeof o === 'object') { const c = {}; Object.keys(o).sort().forEach(k => { if (!isEmpty(o[k])) c[k] = norm(o[k]); }); return c; }
  return o;
};
const strip = o => { const c = norm(JSON.parse(JSON.stringify(o))); delete c.updatedAt; return c; };
function diff(a, b, p) {
  p = p || '';
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    return Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).flatMap(k => diff(a[k], b[k], p + '.' + k));
  }
  return [p + ': ' + JSON.stringify(b === undefined ? '(missing)' : b).slice(0, 60) + ' → ' + JSON.stringify(a === undefined ? '(missing)' : a).slice(0, 60)];
}

async function run(app, c, mode) {
  return app.eval(async ({ c, mode }) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const coll = DB[c.coll];
    const rec = () => coll.find(x => x.id === c.id);
    const target = () => c.event ? rec().events.find(e => e.id === c.event)
      : c.rawEvent ? rec().raw.events.find(e => e.id === c.rawEvent) : rec();
    if (mode === 'probe') target()._probe = 'keep';
    if (mode === 'deep') target()[c.deep]._probe = 'keep';
    const before = JSON.parse(JSON.stringify(target()));
    const ID = JSON.stringify(c.event || c.rawEvent || c.id);
    (0, eval)(c.open.replace(/ID/g, ID));
    await sleep(120);
    if (mode === 'clear') { const el = document.querySelector(c.clear[0]); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
    (0, eval)(c.save);
    await sleep(120);
    const after = target();
    return { before, after: after ? JSON.parse(JSON.stringify(after)) : null, open: Array.from(document.querySelectorAll('.mo.on')).map(m => m.id) };
  }, { c, mode });
}

(async () => {
  const h = await H.start(ROOT);
  try {
    console.log('edits:');
    for (const mode of ['plain', 'probe', 'deep', 'clear']) {
      if (mode === 'deep') { /* only cases that declare a nested object */ }
      for (const c of CASES) {
        if (mode === 'clear' && !c.clear) continue;
        if (mode === 'deep' && !c.deep) continue;
        const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
        const r = await run(app, c, mode);
        const name = c.name + ' — ' + ({ plain: 'save without changes keeps the record', probe: 'unknown field survives an edit', deep: 'unknown field inside ' + c.deep + ' survives', clear: 'a field cleared in the form is removed' })[mode];
        if (!r.after) { bad(name, 'record disappeared'); await app.close(); continue; }
        if (r.open.length) { bad(name, 'editor did not close (save refused?): ' + r.open.join(',') + ' ' + app.log.dialogs.join(' | ')); await app.close(); continue; }
        if (mode === 'clear') {
          const get = (o, p) => p.split('.').reduce((x, k) => x == null ? x : x[k], o);
          const v = get(r.after, c.clear[1]);
          (v === undefined || v === '' || v === null) ? ok(name) : bad(name, c.clear[1] + ' is still ' + JSON.stringify(v));
          // Nothing else may move.
          const blank = o => { const x = JSON.parse(JSON.stringify(o)); const ks = c.clear[1].split('.'); let t = x; ks.slice(0, -1).forEach(k => t = t[k] || {}); delete t[ks[ks.length - 1]]; return strip(x); };
          const rest = diff(blank(r.after), blank(r.before));
          rest.length ? bad(name + ' (rest intact)', rest.join('; ')) : ok(name + ' (rest intact)');
        } else {
          const d = diff(strip(r.after), strip(r.before));
          d.length ? bad(name, d.join('; ')) : ok(name);
        }
        if (app.log.errors.length) bad(name + ' — page errors', app.log.errors.join(' | '));
        await app.close();
      }
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
