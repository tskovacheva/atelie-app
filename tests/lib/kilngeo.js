// The kiln geometry, from the prototype (kiln-v0.html, <script id="kiln-geo">) or
// from Глина's module (domain/kilnplan.js, v1.33.0). Both are loaded as plain
// functions, without a browser. null when the version has neither.
const fs = require('fs');
const path = require('path');
module.exports = function (ROOT, which) {
  if (which === 'module') {
    const f = path.join(ROOT, 'domain', 'kilnplan.js');
    if (!fs.existsSync(f)) return null;
    let src = fs.readFileSync(f, 'utf8');
    const ex = src.match(/^export \{([^}]*)\};?\s*$/m);
    src = src.replace(ex[0], '') + '\nmodule.exports = {' + ex[1] + '};';
    const m = { exports: {} };
    new Function('module', src)(m);
    return m.exports;
  }
  const file = path.join(ROOT, 'kiln-v0.html');
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8').match(/<script id="kiln-geo">([\s\S]*?)<\/script>/)[1];
  const m = { exports: {} };
  new Function('module', src)(m);
  return m.exports;
};
