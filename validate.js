// Pre-deploy validation for Глина.
//   1. syntax        — the code parses
//   2. DOM refs      — every getElementById target exists in the HTML
//   3. function refs — every function called is actually defined
//   4. geometry      — every screen renders at phone width with 44px touch targets
//   5. modules       — ES modules exist, parse, are bridged, and are in sw.js precache (v1.29.0)
// (2) and (3) are the same underlying problem: valid JavaScript that fails only
// when the line runs. (3) was added after v1.11.0 shipped calling a
// firingMethodLabel() that was never written — four call sites, zero definitions.
const fs = require('fs');
const path = require('path');

const FILE = process.argv[2] || 'index.html';
const DIR = path.dirname(path.resolve(FILE));
const s = fs.readFileSync(FILE, 'utf8');
const html = s.replace(/<script>[\s\S]*?<\/script>/g, '');
const js = (s.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(b => b.replace(/<\/?script>/g, '')).join('\n;\n');

let failed = false;
const fail = m => { console.log('  x ' + m); failed = true; };

try { new Function(js); console.log('SYNTAX: OK'); }
catch (e) { console.log('SYNTAX: FAIL - ' + e.message); process.exit(1); }

// Strip strings and comments, keeping line numbers. Without this the scan reads
// chemical formulas and Cyrillic escapes out of the library articles and reports
// them as undefined functions.
function stripLiterals(src) {
  let out = '', i = 0; const n = src.length;
  // Track the last meaningful character so a regex literal can be told from a
  // division. Without this, replace(/"/g, ...) opens a phantom string and every
  // string after it flips polarity — which is how 'transparent' + 'var(--x)'
  // became a call to transparentvar().
  let prev = '';
  const REGEX_OK_BEFORE = /[(,=:[!&|?{};+\-*%~^<>]$/;
  const KEYWORD_BEFORE = /\b(return|typeof|instanceof|in|of|new|delete|void|case|do|else)$/;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') out += '\n'; i++; }
      i += 2; continue;
    }
    if (c === '/') {
      const t = prev.trimEnd();
      const isRegex = t === '' || REGEX_OK_BEFORE.test(t) || KEYWORD_BEFORE.test(t);
      if (isRegex) {
        i++; let inClass = false;
        while (i < n) {
          const r = src[i];
          if (r === '\\') { i += 2; continue; }
          if (r === '[') inClass = true;
          else if (r === ']') inClass = false;
          else if (r === '/' && !inClass) { i++; break; }
          else if (r === '\n') break;
          i++;
        }
        while (i < n && /[gimsuy]/.test(src[i])) i++;
        prev += 'R'; continue;
      }
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') i++;
        else if (src[i] === '\n') out += '\n';
        i++;
      }
      i++; prev += 'S'; continue;
    }
    out += c;
    if (c === '\n') prev = '';
    else prev += c;
    if (prev.length > 24) prev = prev.slice(-24);
    i++;
  }
  return out;
}
const code = stripLiterals(js);

const ids = new Set(); let m;
let re1 = /id=["']([^"']+)["']/g;
while ((m = re1.exec(html)) !== null) ids.add(m[1]);
let re2 = /\.id\s*=\s*['"]([^'"]+)['"]/g;
while ((m = re2.exec(js)) !== null) ids.add(m[1]);
let re3 = /id=\\?["']([a-zA-Z0-9_-]+)\\?["']/g;
while ((m = re3.exec(js)) !== null) ids.add(m[1]);

const KNOWN_MISSING_IDS = new Set(['st-low']);

console.log('\nDOM REFS:');
const missingIds = new Set();
let re4 = /getElementById\(\s*['"]([^'"]+)['"]\s*\)/g;
while ((m = re4.exec(js)) !== null) {
  if (!ids.has(m[1]) && !KNOWN_MISSING_IDS.has(m[1])) missingIds.add(m[1]);
}
if (missingIds.size) fail('липсващи елементи: ' + [...missingIds].join(', '));
else console.log('  ok - всички getElementById таргети съществуват');

// Definitions come from the RAW source, not the stripped copy. The stripper is
// heuristic — it can't tell a regex literal from a string, so replace(/"/g,...)
// makes it swallow real code. Reading definitions from the raw text can only
// ever miss a bug, never invent one; that's the safe direction to be wrong in.
const defined = new Set(); let d;
let re5 = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
while ((d = re5.exec(js)) !== null) defined.add(d[1]);
let re6 = /(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g;
while ((d = re6.exec(js)) !== null) defined.add(d[1]);
let re7 = /function\s*[A-Za-z_$\w]*\s*\(([^)]*)\)/g;
while ((d = re7.exec(js)) !== null) {
  d[1].split(',').forEach(p => { p = p.trim().split('=')[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(p)) defined.add(p); });
}

// v1.29.0: функциите от ES модулите стигат до класическия код през моста в
// app.js. Броят се за дефинирани; модулите се проверяват отделно (MODULES).
const modFiles = [];
(function collect(file) {
  if (!file) return;
  const f = path.join(DIR, file);
  if (modFiles.includes(file)) return;
  if (!fs.existsSync(f)) { fail('липсва модул: ' + file); return; }
  modFiles.push(file);
  const src = fs.readFileSync(f, 'utf8');
  let im; const reI = /import\s+[^'"]*['"](\.\/[^'"]+)['"]/g;
  while ((im = reI.exec(src)) !== null) collect(path.normalize(path.join(path.dirname(file), im[1])));
  let ex; const reE = /export\s+(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  while ((ex = reE.exec(src)) !== null) defined.add(ex[1]);
})(fs.existsSync(path.join(DIR, 'app.js')) || /type=["']module["']/.test(s) ? 'app.js' : null);

const BUILTINS = new Set([
  'if','for','while','switch','catch','return','typeof','function','new','do','else','delete','void','in','of',
  'parseInt','parseFloat','isNaN','isFinite','String','Number','Boolean','Array','Object',
  'Date','Math','JSON','Promise','Set','Map','WeakMap','RegExp','Error','Symbol','BigInt',
  'setTimeout','setInterval','clearTimeout','clearInterval','requestAnimationFrame',
  'alert','confirm','prompt','fetch','encodeURIComponent','decodeURIComponent','escape','unescape',
  'btoa','atob','structuredClone','queueMicrotask','indexedDB','FileReader','Image','Audio',
  'Blob','URL','FormData','Intl','console','document','window','navigator','localStorage',
  'sessionStorage','caches','crypto','performance','history','location','CustomEvent','Event','Notification',
  // CSS functions that survive in style strings the stripper misses
  'var','rgba','rgb','url','calc','rotate','translate','scale','linear-gradient','hsl','hsla'
]);

console.log('\nFUNCTION REFS:');
const missingFns = new Map();
code.split('\n').forEach((line, i) => {
  const re = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g;
  let c;
  while ((c = re.exec(line)) !== null) {
    const name = c[2];
    if (BUILTINS.has(name) || defined.has(name)) continue;
    if (!missingFns.has(name)) missingFns.set(name, i + 1);
  }
});
if (missingFns.size) {
  fail('извикани, но недефинирани функции:');
  [...missingFns].forEach(([n, l]) => console.log('      ' + n + '()  - ред ~' + l));
} else console.log('  ok - всяка извикана функция е дефинирана');

const handlerFns = new Set();
let re8 = /\bon\w+\s*=\s*"([^"]*)"/g;
while ((m = re8.exec(html)) !== null) {
  let c; const re = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g;
  while ((c = re.exec(m[1])) !== null) handlerFns.add(c[2]);
}
const missingHandlers = [...handlerFns].filter(n => !defined.has(n) && !BUILTINS.has(n));
if (missingHandlers.length) fail('inline handler-и без функция: ' + missingHandlers.join(', '));
else console.log('  ok - всеки inline handler сочи към дефинирана функция (' + handlerFns.size + ' проверени)');

// ── 4. GEOMETRY ─────────────────────────────────────────────────────────────
// Глина е телефонно приложение и размерите на бутоните се откриват с око, на
// телефона, а после се развалят пак. Този слой рендерира разметката на телефонна
// ширина и мери: 44px минимална височина за всичко, което се натиска, и бутони от
// един ред на една линия. Открит така: седем реда Редактирай/Дублирай/Изтрий с
// пет различни разстояния и разминат margin-top вътре в реда (поправено v1.24.0).
//
// jsdom не е задължителен — липсва ли, слоят се пропуска с бележка, вместо
// проверката да спре да работи на машина без него.
const MIN_TOUCH = 44;
let JSDOM = null;
try { JSDOM = require('jsdom').JSDOM; } catch (e) { /* по избор */ }

if (!JSDOM) {
  console.log('\nGEOMETRY:');
  console.log('  - пропуснато (няма jsdom: npm install jsdom)');
} else {
  console.log('\nGEOMETRY:');
  const dom = new JSDOM(s, { runScripts: 'outside-only', pretendToBeVisual: true });
  const doc = dom.window.document;

  // jsdom не смята оформление, затова височината се извежда от декларациите:
  // padding + border + line-height на реалните класове.
  const css = (s.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
  function ruleFor(sel) {
    const re = new RegExp('(?:^|[};\\n])\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
    const m2 = css.match(re);
    return m2 ? m2[1] : '';
  }
  function px(decls, prop) {
    const m2 = decls.match(new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([0-9.]+)px'));
    return m2 ? parseFloat(m2[1]) : null;
  }
  const btn = ruleFor('.btn');
  const btnPad = px(btn, 'padding'), btnFont = px(btn, 'font-size');
  const btnH = btnPad !== null && btnFont !== null ? btnPad * 2 + btnFont * 1.2 : null;
  if (btnH === null) fail('не мога да отчета размерите на .btn от CSS-а');
  else if (btnH < MIN_TOUCH) fail('.btn е ~' + Math.round(btnH) + 'px висок, под ' + MIN_TOUCH + 'px');
  else console.log('  ok - .btn е ~' + Math.round(btnH) + 'px (минимум ' + MIN_TOUCH + 'px)');

  // .btn-sm са вторични хапчета („Обнови сега", „Изключи"). Мерят се и се
  // съобщават, но не са провал: 44px би ги направило неразличими от главните
  // бутони, а това е естетическо решение, което се взима на телефон (Е3).
  const bsm = ruleFor('.btn-sm');
  const bsmPadV = (bsm.match(/padding\s*:\s*([0-9.]+)px/) || [, null])[1];
  const bsmFont = px(bsm, 'font-size');
  if (bsmPadV !== null && bsmFont !== null) {
    const h = parseFloat(bsmPadV) * 2 + bsmFont * 1.2;
    console.log('  - .btn-sm е ~' + Math.round(h) + 'px' + (h < MIN_TOUCH ? ' (под ' + MIN_TOUCH + 'px — за преценка на телефон)' : ''));
  }

  // Редовете от бутони: един клас, никакви inline стилове по бутоните вътре.
  const rows = [...doc.querySelectorAll('.btn-row')];
  let rowProblems = [];
  rows.forEach((r, i) => {
    const bs = [...r.querySelectorAll('button')];
    bs.forEach(b => {
      const st = b.getAttribute('style') || '';
      if (/margin|flex|padding/.test(st)) {
        rowProblems.push('btn-row #' + (i + 1) + ': бутон „' + (b.textContent || '').trim() + '" носи собствено оформление (' + st + ')');
      }
    });
  });
  // Бутони Редактирай/Дублирай/Изтрий, които стоят ИЗВЪН .btn-row — значи още
  // някъде редът е сглобен на ръка и ще се разминава пак.
  [...doc.querySelectorAll('button.btn')].forEach(b => {
    const txt = (b.textContent || '').trim();
    if (!/^(Редактирай|Дублирай|Изтрий)$/.test(txt)) return;
    if (!b.closest('.btn-row')) rowProblems.push('бутон „' + txt + '" извън .btn-row');
  });
  if (rowProblems.length) { fail('редове от бутони:'); rowProblems.forEach(p2 => console.log('      ' + p2)); }
  else console.log('  ok - ' + rows.length + ' реда от бутони, без собствено оформление');

  // Всичко натискаемо с изрична височина под прага.
  const small = [];
  [...doc.querySelectorAll('button,[onclick]')].forEach(el => {
    const st = el.getAttribute('style') || '';
    const h = px(st, 'height');
    if (h !== null && h < MIN_TOUCH) {
      const label = (el.textContent || '').trim().slice(0, 24) || el.tagName.toLowerCase();
      small.push(label + ' (' + h + 'px)');
    }
  });
  // Проверява се само статичната разметка. Целите, които се сглобяват в JS
  // (× по снимките, ✎ в timeline-а), не минават оттук — те са вътре в по-голяма
  // натискаема област и се преценяват на телефона.
  const KNOWN_SMALL = 0;
  if (small.length > KNOWN_SMALL) {
    fail(small.length + ' натискаеми елемента под ' + MIN_TOUCH + 'px (праг ' + KNOWN_SMALL + '):');
    small.slice(0, 12).forEach(p2 => console.log('      ' + p2));
  } else console.log('  ok - ' + small.length + ' малки цели, под прага от ' + KNOWN_SMALL);
}

// v1.29.0: MODULES — всеки модул съществува, синтаксисът му е валиден, и е в
// офлайн кеша на sw.js. Файл, който липсва там, тихо спира да се обновява.
console.log('\nMODULES:');
const hasModules = fs.existsSync(path.join(DIR, 'app.js')) || /type=["']module["']/.test(s);
if (!hasModules) console.log('  - няма модули в тази версия');
else {
const tags = [...s.matchAll(/<script\s+type=["']module["']\s+src=["']\.\/([^"']+)["']/g)].map(x => x[1]);
if (!tags.includes('app.js')) fail('index.html не зарежда app.js като модул');
const swFile = path.join(DIR, 'sw.js');
const sw = fs.existsSync(swFile) ? fs.readFileSync(swFile, 'utf8') : '';
const need = modFiles.slice();
if (fs.existsSync(path.join(DIR, 'seed'))) fs.readdirSync(path.join(DIR, 'seed')).filter(f => f.endsWith('.json')).forEach(f => need.push('seed/' + f));
need.forEach(f => {
  if (!fs.existsSync(path.join(DIR, f))) { fail('липсва файл: ' + f); return; }
  if (sw.indexOf("'./" + f + "'") < 0) fail('не е в PRECACHE_URLS на sw.js: ' + f);
});
// Синтаксис на модулите: node --check ги чете като ES модули през .mjs копие.
const os = require('os'); const { execFileSync } = require('child_process');
modFiles.forEach(f => {
  const tmp = path.join(os.tmpdir(), 'glina-check-' + f.replace(/[\/]/g, '_') + '.mjs');
  fs.writeFileSync(tmp, fs.readFileSync(path.join(DIR, f), 'utf8'));
  try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); }
  catch (e) { fail('синтаксис ' + f + ': ' + String(e.stderr || e.message).split('\n').slice(0, 4).join(' ')); }
  finally { fs.unlinkSync(tmp); }
});
// Функция, дефинирана и в модул, и в index.html — мостът би я надписал тихо.
const classicDefs = new Set([...js.matchAll(/^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(x => x[1]));
modFiles.forEach(f => {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  [...src.matchAll(/export\s+(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].forEach(x => { if (classicDefs.has(x[1])) fail('дефинирана два пъти (модул и index.html): ' + x[1]); });
});
if (!failed) console.log('  ok - ' + modFiles.length + ' модула, ' + need.length + ' файла в кеша');
}

console.log('\n' + (failed ? '=== FAIL ===' : '=== OK ==='));
process.exit(failed ? 1 : 0);
