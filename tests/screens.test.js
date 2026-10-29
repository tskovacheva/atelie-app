// Screen equivalence: the same archive opened in the previous release
// (tests/previous/) and in this tree must show the same text on every screen,
// tab and detail. This is the "no visible change" check for refactors.
// Fonts and pixels are not compared — only what a person reads.
const path = require('path');
const fs = require('fs');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const PREVS = H.previous();
const PREV = PREVS.length ? PREVS[PREVS.length - 1].root : '';
const FIX = fs.readFileSync(path.join(__dirname, 'fixtures', 'representative.json'), 'utf8');

const VIEWS = [
  ['screen pieces', "show('pieces')", '#sc-pieces'],
  ['screen recipes', "show('recipes')", '#sc-recipes'],
  ['screen materials', "show('materials')", '#sc-materials'],
  ['materials · raw tab', "show('materials');switchMat('raw')", '#sc-materials'],
  ['materials · mass tab', "show('materials');switchMat('mass')", '#sc-materials'],
  ['screen tests', "show('tests')", '#sc-tests'],
  ['screen firings', "show('fp')", '#sc-fp'],
  ['firings · profiles tab', "show('fp');switchFP('profiles')", '#sc-fp'],
  ['screen library', "show('lib')", '#sc-lib'],
  ['detail piece', "openPieceDet('p-ocarina')", '#det-piece'],
  ['detail split piece', "openPieceDet('p-yellow')", '#det-piece'],
  ['detail broken piece', "openPieceDet('p-broken')", '#det-piece'],
  ['detail legacy piece', "openPieceDet('p-old')", '#det-piece'],
  ['detail series', "openSeriesDet('se-plates')", '#det-series'],
  ['detail recipe', "openRecipeDet('rec-ash-2')", '#det-recipe'],
  ['detail glaze test', "openTestDet('t-glaze')", '#det-test'],
  ['detail body test', "openTestDet('t-body')", '#det-test'],
  ['detail raw material', "openMatDet('mat-xi')", '#det-mat'],
  ['detail mass', "openMatDet('mat-xi-mass')", '#det-mat'],
  ['detail run', "openRunDet('run-bis')", '#det-run'],
  ['detail pit run', "openRunDet('run-pit')", '#det-run'],
  ['detail legacy profile', "openFPDet('fp-glaze')", '#det-fp'],
  ['editor piece', "curPiece='p-ocarina';editPiece()", '#mo-piece'],
  ['editor run', "curRun='run-pit';openRunMo('run-pit')", '#mo-run'],
  ['editor profile', "curFP='fp-glaze';editFP()", '#mo-fp']
];

async function capture(h, root) {
  h.setRoot(root);
  const out = {};
  for (const [name, js, sel] of VIEWS) {
    const app = await h.open({ seed: { atelie_v6: FIX }, localStorage: { atelie_idb_active: '1' } });
    out[name] = await app.eval(async ({ js, sel }) => {
      (0, eval)(js);
      await new Promise(r => setTimeout(r, 150));
      const el = document.querySelector(sel);
      // Form fields carry their values, not text — read those too.
      const vals = Array.from(el.querySelectorAll('input,select,textarea')).filter(x => x.type !== 'file').map(x => x.id + '=' + (x.type === 'checkbox' ? x.checked : x.value));
      // The version label is expected to differ between releases.
      // Intentional differences are listed in INTENDED below, not hidden here.
      return { text: (el.innerText || '').replace(/[ \t]+/g, ' ').replace(/v\d+\.\d+\.\d+(\.\d+)?/g, 'vX').trim(), vals, errors: [] };
    }, { js, sel });
    out[name].errors = app.log.errors.slice();
    await app.close();
  }
  return out;
}

(async () => {
  if (!PREV) { console.log('screens: skip (no tests/previous)'); return; }
  const h = await H.start(ROOT);
  let failed = 0, passed = 0;
  try {
    console.log('screens (' + PREVS[PREVS.length - 1].version + ' vs this tree):');
    const before = await capture(h, PREV);
    const after = await capture(h, ROOT);
    // Intended, visible changes of this release against the previous one. Each is
    // removed from the new text before the comparison — anything else must match.
    // `since` = the release that made the change; a rule applies only when the
    // previous release is older than that.
    const vnum = v => v.replace(/^v/, '').split('.').map(Number).reduce((a, x) => a * 1000 + x, 0);
    const PV = vnum(PREVS[PREVS.length - 1].version);
    const INTENDED = [
      // v1.31.0: codes GL-2026-014 and GL-2026-014/3 on cards and in details
      { since: 'v1.31.0', f: t => t.replace(/GL-\d{4}-\d{3,}(\/\d+(?:[–,] ?\d+)*)?( · в архива)?( · )?/g, '') },
      // v1.31.0: the count field is shown when editing a standalone piece
      { since: 'v1.31.0', f: t => t.replace(/\nБРОЙ\n/i, '\n').replace(/\nПовече от 1 превръща изделието в серия[^\n]*/, '') },
      // v1.31.0: „Изтрий“ is „Архивирай“
      { since: 'v1.31.0', f: t => t.replace(/\nАРХИВИРАЙ(\n|$)/i, '\nИЗТРИЙ$1').replace(/\nАрхив\n/, '\n') }
      ,
      // v1.31.1: categories in the editor, and the structured size block where
      // the two old fields „Размери (см)“ and „Тегло (г)“ were
      { since: 'v1.31.1', f: t => t.replace(/\nКАТЕГОРИИ\n[\s\S]*?\n\+ ДОБАВИ\n/i, '\n')
        .replace(/\nРАЗМЕРИ, СМ\n[\s\S]*?\nТЕГЛО \(Г\)\nРАЗМЕРИ — ОПИСАНИЕ/i, '\nРАЗМЕРИ (СМ)\nТЕГЛО (Г)') }
    ].filter(r => vnum(r.since) > PV).map(r => r.f);
    // v1.31.1: new form fields (size, wall, base, starting clay, category input)
    const NEW_FIELDS = vnum('v1.31.1') > PV ? /^(pi-h|pi-w|pi-depth|pi-size-at|pi-size-approx|pi-wall|pi-base|pi-start-mass|pi-cat-new)=/ : null;
    const clean = t => INTENDED.reduce((x, f) => f(x), t).split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    const flat = t => t.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    for (const [name] of VIEWS) {
      const a = before[name], b = after[name];
      a.text = flat(a.text); b.text = clean(b.text);
      // v1.31.1 also moved „Тегло“ before the description: same fields, order free
      if (NEW_FIELDS) { b.vals = b.vals.filter(v => !NEW_FIELDS.test(v)).sort(); a.vals = a.vals.slice().sort(); }
      if (b.errors.length) { failed++; console.log('  FAIL ' + name + ' — page error: ' + b.errors.join(' | ')); continue; }
      if (a.text === b.text && JSON.stringify(a.vals) === JSON.stringify(b.vals)) { passed++; console.log('  ok   ' + name); continue; }
      failed++;
      const la = a.text.split('\n'), lb = b.text.split('\n');
      const i = la.findIndex((l, k) => l !== lb[k]);
      console.log('  FAIL ' + name + (i >= 0 ? '\n       line ' + i + ': ' + JSON.stringify(la[i]) + ' → ' + JSON.stringify(lb[i]) : '\n       field values differ'));
    }
  } finally { await h.stop(); }
  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
