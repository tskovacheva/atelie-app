// v1.33.0 — domain/kilnplan.js: what Глина adds on top of the prototype geometry
// (which tests/kiln.test.js checks with KILN_GEO=module): the height table from
// the plan of 29.10, the substrate under a piece, the adapters from a kiln and a
// firing. With the private export of 28.10 (tests/fixtures/private-kiln/, never
// packaged): „Предложи нива“ gives the agreed answers.
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const G = require('./lib/kilngeo')(ROOT, 'module');
if (!G) { console.log('kilnplan: - no domain/kilnplan.js in this version'); process.exit(0); }

let failed = 0, passed = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + '\n       got ' + g + '\n       want ' + w); }
};
console.log('kilnplan:');

// A kiln as Глина stores it (v1.32.0) → the equipment the geometry reads.
const kiln = { id: 'k1', name: 'Kittec CB 80 Double', shape: 'round', d: 51, h: 38,
  shelves: [{ id: 'sh', name: 'Кръгла Ø47', shape: 'round', d: 47, t: 1.6, qty: 3 }],
  posts: { sizes: [5, 8, 10, 15], d: 4 }, gaps: { bisque: 0, glaze: 1, other: 0.5 }, clear: 0.5 };
const S = G._planSetup(kiln);
eq('setup: chamber, shelves, posts', [S.kiln.d, S.kiln.h, S.shelves[0].t, S.postSizes, S.postD], [51, 38, 1.6, [5, 8, 10, 15], 4]);
eq('setup: no kiln → empty equipment, no crash', G._planSetup(null).shelves, []);
eq('gap by firing type', [G._planGap(kiln, 'bisque'), G._planGap(kiln, 'glaze'), G._planGap(kiln, 'single-fire'), G._planGap({}, 'glaze')], [0, 1, 0.5, 0]);

// The height table of 29.10: p0 = 0, t = 1.6, posts 5 and 8, H = 38.
const lv = (id, postH) => ({ id, shelves: [{ ref: 'sh', x: 0, y: 0, rot: 0 }], postH, posts: [] });
const run = { config: { floorH: 0, gap: 0, clear: 1, levels: [lv('L1', 5), lv('L2', 8), lv('L3')] }, plan: { members: [] } };
const M = G._planMeasures(S, G._planRun(run));
eq('heights: level 1 — shelf at 0 + 1.6, room 5', [M.levels[0].bottom, M.levels[0].top, M.levels[0].space], [0, 1.6, 5]);
eq('heights: level 2 — 6.6 + 1.6 = 8.2, room 8', [M.levels[1].bottom, M.levels[1].top, M.levels[1].space], [6.6, 8.2, 8]);
eq('heights: level 3 — 16.2 + 1.6 = 17.8, room to the lid 20.2', [M.levels[2].bottom, M.levels[2].top, M.levels[2].space], [16.2, 17.8, 20.2]);

// Pieces of the table: 22 on top needs 23 > 20.2; 6 on level 2 needs 7 ≤ 8; 4 on level 1 needs 5 = 5.
const mem = (id, h, d, level, s) => ({ id, ref: { kind: 'piece', id }, name: id, h, d, shape: 'round', level, s });
run.plan.members = [mem('vase', 22, 18, 'L3'), mem('cup', 6, 8, 'L2'), mem('tile', 4, 10, 'L1')];
const r = G._planRun(run), C = G.check(S, r);
eq('check: 22 cm on top is 2.8 cm short', /По-високо от мястото: 22 см, място 20.2 см/.test((C.byP.vase || []).map(x => x.msg).join()), true);
eq('check: 6 and 4 fit (4 + 1 = 5 exactly)', [!!C.byP.cup, !!C.byP.tile], [false, false]);
eq('run adapter: no coordinates → nothing positioned', r.pieces.every(p => !G.positioned(p)), true);

// The substrate: a 3.5 cm piece on a 1 cm stand needs 4.5 + 1.
run.plan.members = [mem('tile', 3.5, 10, 'L1', 1)];
eq('substrate counts: 3.5 + 1 + 1 > 5 → too tall', (G.check(S, G._planRun(run)).byP.tile || [])[0].kind, 'tall');
run.plan.members = [mem('tile', 3, 10, 'L1', 1)];
eq('substrate counts: 3 + 1 + 1 = 5 → fits', G.check(S, G._planRun(run)).byP.tile, undefined);
eq('effective height', [G.effH({ h: 4, s: 1.5 }), G.effH({ h: 4 }), G.effH({ s: 2 })], [5.5, 4, null]);
eq('quick reason uses the substrate', G.quickReason(S, G._planRun(Object.assign({}, run, { plan: { members: [mem('t', 3.5, 10, 'L1', 1)] } })), run.config.levels[0], mem('t', 3.5, 10, 'L1', 1)).kind, 'tall');

// Room on a shelf, by real placement, without saving coordinates.
const cups = []; for (let i = 0; i < 6; i++) cups.push(mem('c' + i, 3, 20, 'L1'));
run.plan.members = cups;
const room = G._planRoom(S, G._planRun(run), 'L1');
eq('room: Ø20 on a Ø47 shelf — some fit, the rest are named', room.placed.length > 0 && room.failed.length > 0 && room.placed.length + room.failed.length === 6, true);
eq('room: reasons say there is no free place', room.failed.every(f => f.kind === 'room'), true);
eq('room: the run is not changed', run.plan.members.every(m => m.x === undefined), true);

// Suggest levels with a substrate: the stand goes into the level height.
const sug = G.planLevels(S, { floorH: 0, gap: 0, clear: 1, levels: [], pieces: [mem('a', 6, 8, null, 2), mem('b', 1, 4, null)] });
eq('suggest: needs 6 + 2 + 1', sug.levels.some(l => l.need === 9), true);

// The private export of 28.10 — only here, never packaged.
const priv = path.join(__dirname, 'fixtures', 'private-kiln', 'pech-2026-10-28.json');
if (fs.existsSync(priv)) {
  const d = JSON.parse(fs.readFileSync(priv, 'utf8')), D = d.data || d;
  const SP = { kiln: D.kiln, shelves: D.shelves, postSizes: D.postSizes, postD: D.postD };
  const P4 = G.planLevels(SP, Object.assign({}, D.runs[0], { gap: 4, levels: [] }));
  eq('28.10, gap 4 cm: „липсват 2,8 см“', /липсват 2,8 см/.test(P4.problems.join(' ')) && P4.fits === false, true);
  const P0 = G.planLevels(SP, Object.assign({}, D.runs[0], { gap: 0, levels: [] }));
  eq('28.10, gap 0: two levels, all fits', [P0.levels.length, P0.fits, P0.problems.length, P0.skipped.length], [2, true, 0, 0]);
  eq('28.10: every piece in exactly one level', P0.levels.reduce((a, l) => a + l.ids.length, 0), D.runs[0].pieces.length);
} else console.log('  - no private 28.10 export: skipped');

console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
