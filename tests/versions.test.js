// APP_VERSION (index.html) and CACHE_NAME (sw.js) move together, and both are
// ahead of the newest previous release. A code change without a cache bump never
// reaches an installed app; a forgotten APP_VERSION makes the update invisible.
const fs = require('fs');
const path = require('path');
const H = require('./lib/harness');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const app = f => (fs.readFileSync(path.join(f, 'index.html'), 'utf8').match(/const APP_VERSION = '([^']+)'/) || [])[1];
const cache = f => +((fs.readFileSync(path.join(f, 'sw.js'), 'utf8').match(/CACHE_NAME = 'atelie-v(\d+)'/) || [])[1]);
const v = s => s.replace(/^v/, '').split('.').map(Number);
const newer = (a, b) => { const x = v(a), y = v(b); for (let i = 0; i < 4; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
let failed = 0;
const cur = { app: app(ROOT), cache: cache(ROOT) };
console.log('  this tree: ' + cur.app + ' · atelie-v' + cur.cache);
const prev = H.previous();
if (prev.length) {
  const p = prev[prev.length - 1].root, pv = { app: app(p), cache: cache(p) };
  if (!newer(cur.app, pv.app)) { failed++; console.log('  FAIL APP_VERSION ' + cur.app + ' is not ahead of ' + pv.app); }
  if (!(cur.cache > pv.cache)) { failed++; console.log('  FAIL CACHE_NAME atelie-v' + cur.cache + ' is not ahead of atelie-v' + pv.cache); }
}
// v1.32.1: the modules carry the same version — index.html refuses stale ones.
const appJs = path.join(ROOT, 'app.js');
if (fs.existsSync(appJs) && /__glinaModulesVersion/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'))) {
  const mv = (fs.readFileSync(appJs, 'utf8').match(/__glinaModulesVersion = '([^']+)'/) || [])[1];
  if (mv !== cur.app) { failed++; console.log('  FAIL app.js says ' + mv + ', index.html ' + cur.app); }
}
['README.md', 'ROADMAP.md', 'FUNCTIONAL_SPEC.md'].forEach(d => {
  const f = path.join(ROOT, d);
  if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').indexOf(cur.app) < 0) { failed++; console.log('  FAIL ' + d + ' does not mention ' + cur.app); }
});
console.log(failed ? 'FAILED' : 'OK');
process.exit(failed ? 1 : 0);
