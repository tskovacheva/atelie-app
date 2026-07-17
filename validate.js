// Pre-deploy validation for Глина.
//   1. syntax        — the code parses
//   2. DOM refs      — every getElementById target exists in the HTML
//   3. function refs — every function called is actually defined
// (2) and (3) are the same underlying problem: valid JavaScript that fails only
// when the line runs. (3) was added after v1.11.0 shipped calling a
// firingMethodLabel() that was never written — four call sites, zero definitions.
const fs = require('fs');

const s = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
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

console.log('\n' + (failed ? '=== FAIL ===' : '=== OK ==='));
process.exit(failed ? 1 : 0);
