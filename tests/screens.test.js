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
      // v1.35.1: секциите на изделието и серията и разделите на формуляра — всички отворени, за да се сравни съдържанието.
      document.querySelectorAll('.pd-sec').forEach(x => x.classList.add('open'));
      // v1.37.0: the three tabs of a firing — all shown, to compare the content.
      document.querySelectorAll('.rn-pane').forEach(x => x.classList.add('on'));
      // v1.41.0: раздели във формулярите за изпичане и профил — всички, за да се сравни съдържанието
      document.querySelectorAll('#mo-run .pi-tab, #mo-fp .pi-tab').forEach(x => x.classList.add('on'));
      // v1.38.0: the sections of a recipe — all open.
      document.querySelectorAll('.rd-sec').forEach(x => x.classList.add('open')); document.querySelectorAll('#rc-side, #mt-side').forEach(x => x.classList.add('on'));
      document.querySelectorAll('#mo-piece .pi-tab').forEach(x => x.classList.add('on'));
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
      ,
      // v1.32.0: „Пещи“ tab first on the firings screen
      { since: 'v1.32.0', f: t => t.replace(/(^|\n)ПЕЩИ(\n|$)/i, '$1') }
      ,
      // v1.33.0: the run detail has a „План на пещта“ section before the tests
      { since: 'v1.33.0', f: t => t.replace(/\nПЛАН НА ПЕЩТА\n(\+ План|Отвори)\nОще няма план\.[^\n]*/i, '') }
      ,
      // v1.33.2: a line under the firing tabs; „Тип“ is „Вид изделие“; the run detail in
      // Подготовка / Зареждане / Резултати with the plan as a card; the piece editor in
      // four groups (those two are compared as sets of lines — same content, new order)
      { since: 'v1.33.2', f: t => t.replace(/\n(Изпичането|Профилът|Пещта) — [^\n]*/g, '').replace(/(^|\n)Вид изделие(\n)/g, '$1Тип$2')
        .replace(/\n(Подготовка|Зареждане|Резултати)(?=\n)/g, '').replace(/\nНаправи план(?=\n|$)/, '\n+ План')
        .replace(/\n(Основни данни|Материали и техника|Размери и физически характеристики)(?=\n)/g, '').replace(/\nДопълнителна информация(?=\n)/, '\nДопълнителни детайли')
        .replace(/\nСамото изделие — чаша, окарина\.[^\n]*/, '').replace(/\nВ сантиметри\. Височината и ширината[^\n]*/, '\nРАЗМЕРИ, СМ')
        .replace(/(^|\n)ВИД ИЗДЕЛИЕ(\n)/, '$1ТИП$2').replace(/\nПЕЩ\n[^\n]*/, '') }
          ,
      // v1.34.1: the plan card in the run (title in normal case, bigger button text);
      // the seven standard categories in the editor
      { since: 'v1.34.1', f: t => t.replace(/(^|\n)План на пещта(\n)/, '$1ПЛАН НА ПЕЩТА$2').replace(/\nНаправи план на пещта(?=\n|$)/, '\nНаправи план').replace(/\nОтвори плана на пещта(?=\n|$)/, '\nОтвори плана') }
      ,
      // v1.36.0: arrows and a counter on the detail photo when there are several
      { since: 'v1.36.0', f: t => t.replace(/(^|\n)‹\n\d+ \/ \d+\n›(?=\n)/, '$1') }
      ,
      // v1.52.0: „Внос“ in the recipes catalog, „Износ“ in the recipe detail
      { since: 'v1.52.0', f: t => t.replace(/(^|\n)Внос(?=\n|$)/, '$1').replace(/(^|\n)Износ(?=\n|$)/i, '$1') }
].filter(r => vnum(r.since) > PV).map(r => r.f);
    // v1.31.1: new form fields (size, wall, base, starting clay, category input)
    const NEW_FIELDS = vnum('v1.31.1') > PV ? /^(pi-h|pi-w|pi-depth|pi-size-at|pi-size-approx|pi-wall|pi-base|pi-start-mass|pi-cat-new)=/ : null;
    const clean = t => INTENDED.reduce((x, f) => f(x), t).split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    const flat = t => t.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
    for (const [name] of VIEWS) {
      const a = before[name], b = after[name];
      a.text = flat(a.text); b.text = clean(b.text);
      // v1.40.0: the brick icon for body tests and „Направи маса“ is gone
      if (vnum('v1.40.0') > PV) a.text = a.text.replace(/🧱\s*/gu, '');
      // v1.42.0: „Изтрий“ в детайлите е „Архивирай“ (окончателно — само от архива)
      if (vnum('v1.42.0') > PV && /^(detail (recipe|glaze test|body test|raw material|mass|run|pit run|legacy profile|material)|screen )/.test(name)) b.text = b.text.replace(/(^|\n)АРХИВИРАЙ(?=\n|$)/gi, '$1ИЗТРИЙ');
      // v1.40.1: в списъка за глазура във формуляра рецептите са с версията си
      if (vnum('v1.40.1') > PV && /^editor /.test(name)) b.text = b.text.replace(/ v\d+(?=\n|$)/g, '');
      // v1.33.2: regrouped screens — same lines, new order
      if (vnum('v1.34.1') > PV && /^(detail run|detail pit run|editor piece)$/.test(name)) {
        // v1.34.1: the standard category chips changed — compared without them
        if (name === 'editor piece') { const C = /^(Чаши|Купи|Чинии|Вази|Съдове за храна|Музикални инструменти|Окарини|Свирки|Декорация|Скулптура|Плочки|Тестови образци|Бижута|Друго)$/; const nc = t => t.split('\n').filter(l => !C.test(l)).join('\n'); a.text = nc(a.text); b.text = nc(b.text); } a.text = a.text.split('\n').sort().join('\n'); b.text = b.text.split('\n').sort().join('\n'); a.vals = a.vals.slice().sort(); b.vals = b.vals.slice().sort(); }
      // v1.31.1 also moved „Тегло“ before the description: same fields, order free
      if (NEW_FIELDS) { b.vals = b.vals.filter(v => !NEW_FIELDS.test(v)).sort(); a.vals = a.vals.slice().sort(); }
      // v1.35.1: the piece and series detail and the piece editor are redesigned —
      // everything the old screen said must still be there (by line), apart from
      // the listed labels that were replaced by the new layout.
      if (vnum('v1.35.1') > PV && /^(detail piece|detail split piece|detail broken piece|detail legacy piece|detail series|editor piece)$/.test(name)) {
        const GONE = /^(ИНФОРМАЦИЯ|СВЪРЗАНИ ТЕСТОВЕ|БЕЛЕЖКИ|ПРОЦЕС|СЕРИЯ|ПАРТИДА|ОТДЕЛЕНИ ПАРЧЕТА|ДОБИВ|Етап|Вид изделие|Глазура|Рецепта|Готова глазура|Няма свързани тестове|—|Процесът е приключен\. Записът остава\.|СМЕСЕН|Смесен|партидата е еднородна — нищо не е отделено|все още няма отбелязани стъпки|📷|Снимка от галерията|Допълнителни детайли|Допълнителна информация|▾|Основни данни|Материали и техника|Размери и физически характеристики|\d+ от \d+ бр\.|.*· \d{4}-\d\d-\d\d · .*)$/i;
        const nb = b.text.toLowerCase(), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').some(x => nb.indexOf(x.toLowerCase()) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 400)); continue;
      }
      // v1.48.1: vitrification is no longer counted as „passed“ — it is shown apart, as a guide that depends on the body
      if (vnum('v1.48.1') > PV && /^(detail legacy piece|detail run)$/.test(name)) {
        const V = s => s.replace(/, (Начало на встъкляване|Разширено встъкляване|Напреднало встъкляване[^,\n(]*)( \([^)]*\))?/g, '').replace(/ · встъкляването зависи от масата/g, '');
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(V(b.text)), miss = V(a.text).split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (vitrification shown apart as a body-dependent guide: all other content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.48.0: the language switch in the Library („Език · Language“) — additions only
      if (vnum('v1.48.0') > PV && /^(screen library)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (language switch added: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.47.0: quick entry lives in the same piece form (hidden fields; hidden in the full form) — additions only
      if (vnum('v1.47.0') > PV && /^(editor piece)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (quick entry added: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.46.2: „Програма и съвместимост“ above the tabs of the firing detail — additions only
      if (vnum('v1.46.2') > PV && /^(detail run|detail pit run)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (program and compatibility block added: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.46.0: Огнена скала and „Съвместимост на зареждането“ (run, material, mass, body test, library, standalone firing step) — additions only
      if (vnum('v1.46.0') > PV && /^(screen library|detail legacy piece|detail body test|detail raw material|detail mass|detail run|detail pit run)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text.replace(/🔥 Огнена скала\s*/i, '')), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (fire scale / compatibility added: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.45.0: „Количество глина и свиване“ in Tools and „Калкулатор“ in the piece editor — additions only
      if (vnum('v1.45.0') > PV && /^(screen library|editor piece)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (calculator added: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.43.0: series units are selectable (number picker, summary chips); „Неразграничени“ is „Неотделени“
      if (vnum('v1.44.0') > PV && /^(detail series)$/.test(name)) { // v1.44.0: the hint also says how groups are split
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(vnum('v1.43.0') > PV ? b.text.replace(/(^|\n)Неотделени(?=\n|$)/g, '$1Неразграничени') : b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (selectable units: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.42.0: one clay picker — Глини, Маси, „Стари имена“, „· wishlist“: every old line still there
      if (vnum('v1.42.0') > PV && /^(editor piece)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (one clay picker: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.41.0: „Готово“ in every filter panel, „‹ Ателие“ in the library, tabs in the
      // firing and profile forms (fields regrouped) — every old line must still be there
      if (vnum('v1.41.0') > PV && /^(screen materials|materials · raw tab|materials · mass tab|screen library|editor run|editor profile)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (regrouped / additions: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.40.4: only additions — links, codes next to names, „+ Тест на маса“, „Нова версия
      // на рецептата“, „Изпичания с този профил“: every old line must still be there
      if (vnum('v1.40.4') > PV && /^(detail glaze test|detail mass|detail run|detail pit run|detail legacy profile)$/.test(name)) {
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && nb.indexOf(sq(l)) < 0);
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (additions only: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.40.3: alternative firings documented per unit — old firings now ask for results,
      // without a kiln there is no hold/cones and the temperature is „measured, if any“
      if (vnum('v1.40.3') > PV && /^(screen firings|detail run|detail pit run|editor run)$/.test(name)) {
        // без пещ: няма „план на пещта“ — бройките са в „Подготовка по бройки“
        const GONE = /^(За документиране \d+|МОЖЕ ДА СЕ ДОПЪЛНИ|ИЗИСКВА ВНИМАНИЕ|ПИКОВА ТЕМП\. \(°C\)|ЗАДРЪЖКА \(МИН\)|КОНУСИ|Резултати|\d+ без резултат|✓|›|—|×|\d+|\d+ бр\.|\d+ издели[ея] · без план|План на пещта|Още няма план\. Планът казва.*|Направи план на пещта)$/;
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').some(x => nb.indexOf(sq(x)) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (documentation per unit: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.40.0: tests redesigned (gallery/list, filters, detail with the result tiles, links)
      if (vnum('v1.40.0') > PV && /^(screen tests|detail glaze test|detail body test)$/.test(name)) {
        // the old card/title lines: „Xi Beach 100 @ 980°C“ is now a title and a meta line,
        // a rating is stars, „порестост“ is „водопоглъщане“, decimals with a comma
        const GONE = /^(✨ Глазурни|На маси|★★★★\+|Без дефекти|С дефекти|ПАРАМЕТРИ|РЕЗУЛТАТИ|ИЗВОДИ|ИЗПИЧАНЕ|РЕЦЕПТА|ПРОФИЛ ИЗПИЧАНЕ|ПРОФИЛ НА ИЗПИЧАНЕ|ИЗДЕЛИЯ СЪС СЪЩАТА РЕЦЕПТА|★+ ★+|Глазурно · .*|пластичност: .*|›|—|×|\d+|К)$/;
        a.text = a.text.replace(/ @ /g, ' · ').replace(/★+ ★+/g, '').replace(/порестост/g, 'водопоглъщане').replace(/ · пластичност: [^\n]*/g, '');
        const sq = x => x.toLowerCase().replace(/\s+/g, '').replace(/[🧱✨]/gu, '').replace(/(\d)\.(\d)/g, '$1,$2');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').map(x => x.replace(/^· /, '').replace(/^[🧱✨]\s*/u, '')).filter(x => x && x !== '—').some(x => nb.indexOf(sq(x)) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.39.0: materials redesigned (groups, list/cards/stock, detail with „В рецепти“)
      if (vnum('v1.39.0') > PV && /^(screen materials|materials · raw tab|materials · mass tab|detail raw material|detail mass)$/.test(name)) {
        const GONE = /^(СОРТИРАЙ:|Сортирай:|А→Я|Ниски запаси|Само ниски|Характеристики|ХАРАКТЕРИСТИКИ|БЕЛЕЖКИ|СЪСТАВ|ПРОЦЕСНА БИОГРАФИЯ|ГЕОЛОЖКИ \/ ПРАВНИ БЕЛЕЖКИ|ИЗПОЛЗВАН В РЕЦЕПТИ|ИЗПОЛЗВАНА В ИЗДЕЛИЯ|ИЗПОЛЗВАНА В ТЕСТОВЕ|\+ СТЪПКА|›|—|✎|×|\d+|Глини|Глазури|Суровини|Базови|Оксиди|Ангоби|Подгл\. бои|Маси|Wishlist|К|ГЛИНИ|ГЛАЗУРИ|СУРОВИНИ)$/;
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').map(x => x.replace(/^· /, '')).filter(x => x && x !== '—').some(x => nb.indexOf(sq(x)) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.38.0: recipes redesigned (catalog cards, detail with the composition
      // always shown) — everything the old screens said must still be there.
      if (vnum('v1.38.0') > PV && /^(screen recipes|detail recipe)$/.test(name)) {
        // the old filter row had a chip for every type; now only types that have recipes (♥ for favourites)
        const GONE = /^(♡ Любими|Матова|Сортирай:|Последно|А→Я|Дата|ГРАМАЖ КАЛКУЛАТОР|СЪСТАВКИ|СНИМКА НА РЕЗУЛТАТА|ПРОФИЛ|ИЗПОЛЗВАНА В ИЗДЕЛИЯ|СВЪРЗАНИ ТЕСТОВЕ|ВЕРСИИ|БЕЛЕЖКИ|›|—|✓|✗|г|\+ НОВ ТЕСТ|\+ НОВО ИЗДЕЛИЕ|Няма свързани тестове|сегашна)$/i;
        // compared without spaces (tags and the version label used to be glued to the text);
        // „📷 тест“ is now the test count, a type tag next to the cone is two separate tags
        const sq = x => x.toLowerCase().replace(/\s+/g, '');
        const nb = sq(b.text), miss = a.text.split('\n').filter(l => l && !GONE.test(l) && !/^[А-Яа-яA-Za-z]+Конус \d+$/.test(l)).filter(l => l.split(' · ').filter(x => x !== '📷 тест').some(x => nb.indexOf(sq(x)) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 700)); continue;
      }
      // v1.37.0: firings redesigned (registry cards, the run in three tabs) —
      // everything the old screens said must still be there.
      if (vnum('v1.37.0') > PV && /^(screen firings|firings · profiles tab|detail run|detail pit run)$/.test(name)) {
        const GONE = /^(🕳|⚡|🔥|🔵|🪵|›|Подготовка|Зареждане|Резултати|—)$/;
        const nb = b.text.toLowerCase(), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').some(x => nb.indexOf(x.toLowerCase()) < 0));
        const vb = new Set(b.vals), vmiss = a.vals.filter(v => !vb.has(v));
        if (!b.errors.length && !miss.length && !vmiss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss.concat(vmiss)).slice(0, 600)); continue;
      }
      // v1.36.0: the catalog is redesigned (gallery/list, filter panel) — every
      // record's name, code, stage and size must still be there.
      if (vnum('v1.36.0') > PV && name === 'screen pieces') {
        // the split pieces of the series are now inside it (▾ отделени), the glaze name is not on the card
        const GONE = /^(Пепелна Б v1|Жълти|Счупена|СЧУПЕНО|GL-2026-006\/[\d–]+|Чинии 22 см · \d+ бр\.|\d+ бр\. · \d+ отделени|\d+ ИЗДЕЛИЯ · \d+ СЕРИИ|Филтри и сортиране|Размер|Глина|Глазура|Серия|От серия|—|\d{4}-\d\d-\d\d)$/i;
        const nb = b.text.toLowerCase(), miss = a.text.split('\n').filter(l => l && !GONE.test(l)).filter(l => l.split(' · ').some(x => nb.indexOf(x.toLowerCase()) < 0));
        if (!b.errors.length && !miss.length) { passed++; console.log('  ok   ' + name + ' (redesigned: all content kept)'); continue; }
        failed++; console.log('  FAIL ' + name + ' — missing: ' + JSON.stringify(miss).slice(0, 600)); continue;
      }
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
