// Unit tests for the kiln-loading geometry in kiln-v0.html (prototype v0).
// The geometry lives in <script id="kiln-geo"> and is loaded here as-is.
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
const file = path.join(ROOT, 'kiln-v0.html');
if (!fs.existsSync(file)) { console.log('kiln: - no kiln-v0.html in this version'); process.exit(0); }
const src = fs.readFileSync(file, 'utf8').match(/<script id="kiln-geo">([\s\S]*?)<\/script>/)[1];
const m = { exports: {} };
new Function('module', src)(m);
const G = m.exports;

let failed = 0, passed = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + '\n       got ' + g + '\n       want ' + w); }
};
const near = (a, b, e) => Math.abs(a - b) < (e || 1e-6);

console.log('kiln:');
const shelf = { id: 'sh', shape: 'round', d: 47, t: 1.6 };
const S = { kiln: { shape: 'round', d: 50, h: 45 }, shelves: [shelf], postSizes: [5, 10, 15], postD: 4 };
const piece = (o) => Object.assign({ id: 'p' + Math.random(), no: 1, name: '', shape: 'round', rot: 0, x: 0, y: 0 }, o);

// Overhang: Ø10 at 18 cm from centre on Ø47 → 18 + 5 − 23.5 = −0.5 (inside).
eq('round piece inside round shelf', near(G.overhang(G.shapeOf(piece({ d: 10, x: 18 })), shelf), -0.5), true);
eq('round piece 1 cm out', near(G.overhang(G.shapeOf(piece({ d: 10, x: 19.5 })), shelf), 1), true);
// 20×10 rect at centre: corner at hypot(10,5)=11.18 → inside.
eq('rect piece corners count', near(G.overhang(G.shapeOf(piece({ shape: 'rect', w: 20, depth: 10 })), shelf), Math.hypot(10, 5) - 23.5), true);
// Same rect rotated 90° and moved to x=18: corners at (18±5, ±10) → hypot(23,10)=25.08 → 1.58 out.
eq('rotated rect overhang', near(G.overhang(G.shapeOf(piece({ shape: 'rect', w: 20, depth: 10, rot: 90, x: 18 })), shelf), Math.hypot(23, 10) - 23.5, 1e-6), true);
eq('no size → no shape', G.shapeOf(piece({})), null);
eq('rect shelf overhang', near(G.overhang(G.shapeOf(piece({ d: 10, x: 18 })), { shape: 'rect', w: 40, depth: 30 }), 3), true);

// Gaps.
eq('two circles 2 cm apart', near(G.gapBetween({ kind: 'circle', x: 0, y: 0, r: 5 }, { kind: 'circle', x: 12, y: 0, r: 5 }), 2), true);
eq('circles overlapping → negative', G.gapBetween({ kind: 'circle', x: 0, y: 0, r: 5 }, { kind: 'circle', x: 8, y: 0, r: 5 }) < 0, true);
eq('rect vs circle 3 cm', near(G.gapBetween(G.shapeOf(piece({ shape: 'rect', w: 10, depth: 10 })), { kind: 'circle', x: 13, y: 0, r: 5 }), 3, 0.01), true);
eq('rect vs rect overlapping', G.gapBetween(G.shapeOf(piece({ shape: 'rect', w: 10, depth: 10 })), G.shapeOf(piece({ shape: 'rect', w: 10, depth: 10, x: 8, rot: 45 }))) < 0, true);
eq('rects touching are not overlapping', near(G.gapBetween(G.shapeOf(piece({ shape: 'rect', w: 10, depth: 10 })), G.shapeOf(piece({ shape: 'rect', w: 10, depth: 10, x: 10 }))), 0), true);

// Stack: floor posts 5, shelf 1.6, posts 15 above level 1, top level to 45.
const run = { floorH: 5, gap: 0, clear: 0.5, pieces: [], levels: [
  { id: 'L1', shelf: 'sh', postH: 15, posts: [] },
  { id: 'L2', shelf: 'sh', postH: 10, posts: [] },
  { id: 'L3', shelf: 'sh', postH: 99, posts: [] } ] };
const st = G.stack(S, run);
eq('level 1 on the floor posts', [st[0].bottom, st[0].top, st[0].space], [5, 6.6, 15]);
eq('level 2 on 15 cm posts', [near(st[1].bottom, 21.6), st[1].space], [true, 10]);
eq('top level to the ceiling (postH ignored)', near(st[2].space, 45 - (21.6 + 1.6 + 10 + 1.6)), true);

// Checks.
const r2 = JSON.parse(JSON.stringify(run));
r2.pieces = [
  piece({ id: 'a', no: 1, d: 10, h: 14, level: 'L1', x: 0, y: 0 }),     // 14 + 0.5 ≤ 15 ok
  piece({ id: 'b', no: 2, d: 10, h: 15, level: 'L1', x: 9, y: 0 }),     // overlaps a, too tall
  piece({ id: 'c', no: 3, d: 10, h: 9, level: 'L2', x: 21, y: 0 }),     // 2.5 cm out
  piece({ id: 'd', no: 4, h: 5, level: 'L2', x: -10, y: 0 }),           // no base size
  piece({ id: 'e', no: 5, d: 8, h: 5, level: 'L1', x: 0, y: 18 })       // on post 1
];
r2.levels[0].posts = [{ x: 0, y: 19.5 }];
const c = G.check(S, r2);
const kinds = id => (c.byP[id] || []).map(x => x.kind).sort();
eq('fits → no issues', kinds('a').filter(k => k !== 'hit'), []);
eq('overlap reported on both', [kinds('a').includes('hit'), kinds('b').includes('hit')], [true, true]);
eq('too tall', kinds('b').includes('tall'), true);
eq('outside shelf', kinds('c'), ['out']);
eq('missing base → warning only', (c.byP.d || []).map(x => x.sev), ['warn']);
eq('piece on a post', kinds('e'), ['post']);
eq('top level has no posts to hit', G.check(S, Object.assign({}, r2, { pieces: [piece({ id: 'z', d: 8, h: 5, level: 'L3', x: 0, y: 18 })] })).byP.z, undefined);
const r3 = Object.assign({}, r2, { gap: 1, pieces: [piece({ id: 'a', no: 1, d: 10, h: 5, level: 'L1' }), piece({ id: 'b', no: 2, d: 10, h: 5, level: 'L1', x: 10.5 })] });
eq('glaze gap 1 cm: 0.5 cm apart is too close', kinds.call(null, 'a').length >= 0 && G.check(S, r3).byP.a[0].kind, 'hit');
eq('bisque gap 0: touching is fine', G.check(S, Object.assign({}, r3, { gap: 0 })).byP.a, undefined);
const sOver = Object.assign({}, S, { kiln: { shape: 'round', d: 45, h: 45 } });
eq('shelf bigger than chamber', (G.check(sOver, run).byL.L1 || []).map(x => x.kind), ['shelfbig']);

// Posts, clock, spots, combos, dims.
const posts = G.defaultPosts(shelf, 3, 4);
eq('3 posts, first at 12 o\'clock', [posts.length, posts[0].x, posts[0].y], [3, 0, 20]);
eq('clock 3 o\'clock', G.clock(15, 0), '3 ч, 15 см от центъра');
eq('clock 12', G.clock(0, 10), '12 ч, 10 см от центъра');
eq('clock 7–8 → 8', G.clock(-12, -7), '8 ч, 14 см от центъра');
eq('clock centre', G.clock(1, 1), 'в центъра');
const r4 = JSON.parse(JSON.stringify(run));
r4.pieces = [piece({ id: 'a', d: 20, h: 5, level: 'L1', x: 0, y: 0 })];
const np = piece({ id: 'n', d: 12, h: 5, level: 'L1' });
r4.pieces.push(np);
const spot = G.findSpot(S, r4, r4.levels[0], np);
const tmp = Object.assign({}, np, spot);
eq('a spot is found', !!spot, true);
eq('free spot does not overlap and stays on the shelf', [G.gapBetween(G.shapeOf(tmp), G.shapeOf(r4.pieces[0])) >= -0.05, G.overhang(G.shapeOf(tmp), shelf) <= 0.05], [true, true]);
eq('second Ø20 next to a centred Ø20 does not fit on Ø47', G.findSpot(S, r4, r4.levels[0], piece({ id: 'm', d: 20, level: 'L1' })), null);
eq('no spot for a piece wider than the shelf', G.findSpot(S, r4, r4.levels[0], piece({ id: 'w', d: 50, level: 'L1' })), null);
const combos = G.postCombos([5, 10, 15], 45);
eq('20 = 15+5', combos[20], [15, 5]);
eq('30 = 15+15', combos[30], [15, 15]);
eq('7 cannot be built', combos[7], undefined);
eq('dims "в8 × ⌀6"', G.parseDims('в8 × ⌀6'), { d: 6, h: 8 });
eq('dims "⌀22"', G.parseDims('⌀22'), { d: 22 });
eq('dims "20×15×8"', G.parseDims('20×15×8'), { w: 20, depth: 15, h: 8 });
eq('dims "12, 5 x 9"', G.parseDims('12 x 9'), { d: 12, h: 9 });
eq('dims empty', G.parseDims(''), {});

console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
