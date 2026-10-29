// Unit tests for the kiln-loading geometry in kiln-v0.html (prototype v0).
// Levels are written both in the first v0 shape ({shelf}) and the current one
// ({shelves:[{ref,x,y,rot}]}) — both must read the same.
// The geometry lives in <script id="kiln-geo"> and is loaded here as-is.
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
// KILN_GEO=module: the same tests against domain/kilnplan.js (v1.33.0), the copy in Глина.
const G = require('./lib/kilngeo')(ROOT, process.env.KILN_GEO);
if (!G) { console.log('kiln: - no geometry in this version'); process.exit(0); }

let failed = 0, passed = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + '\n       got ' + g + '\n       want ' + w); }
};
const near = (a, b, e) => Math.abs(a - b) < (e || 1e-6);

console.log('kiln' + (process.env.KILN_GEO === 'module' ? ' (domain/kilnplan.js)' : '') + ':');
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
const posts = G.defaultPosts(G.levelShelves(S, { shelf: 'sh' }), 3, 4);
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

// --- 29.10: several shelves per level, optional positions, arbitrary heights ---
const half = { id: 'hf', shape: 'half', d: 47, t: 1.6 };
const S2 = Object.assign({}, S, { kiln: { shape: 'round', d: 51, h: 38 }, shelves: [shelf, half] });
const halves = { id: 'H', shelves: [{ ref: 'hf', x: 0, y: 0.5, rot: 0 }, { ref: 'hf', x: 0, y: -0.5, rot: 180 }], postH: 10, posts: [] };
const hs = G.levelShelves(S2, halves).map(x => x.shape);
eq('half shelf: arc towards 12, straight edge through its point', [near(G.pointOut([0, 24.5], hs[0]), 0.5, 0.01), G.pointOut([0, 0], hs[0]) > 0, G.pointOut([0, -10], hs[1]) < 0], [true, true, true]);
eq('piece on one half → fine', G.overhangOn(G.shapeOf(piece({ d: 10, x: 0, y: 10 })), hs).over <= 0, true);
const br = G.overhangOn(G.shapeOf(piece({ d: 10, x: 0, y: 0 })), hs);
eq('piece across the 1 cm joint → bridge, not "outside"', [br.over > 0.05, br.bridge], [true, true]);
const outH = G.overhangOn(G.shapeOf(piece({ d: 10, x: 21, y: 5 })), hs);
eq('piece over the outer edge of a half → outside', [outH.over > 0.05, outH.bridge], [true, false]);
const rH = { floorH: 5, gap: 0, clear: 0.5, levels: [halves, { id: 'T', shelves: [{ ref: 'sh' }], posts: [] }], pieces: [
  piece({ id: 'j', no: 1, d: 10, h: 5, level: 'H', x: 0, y: 0 }), piece({ id: 'k', no: 2, d: 10, h: 5, level: 'H', x: 21, y: 5 }) ] };
const cH = G.check(S2, rH);
eq('check: joint is a warning, outer edge an error', [(cH.byP.j || []).map(x => x.sev + ':' + x.kind), (cH.byP.k || []).map(x => x.sev + ':' + x.kind)], [['warn:bridge'], ['err:out']]);
eq('levels with halves: thickness of the thickest shelf', near(G.stack(S2, rH)[1].bottom, 5 + 1.6 + 10), true);
const twoRound = { id: 'X', shelves: [{ ref: 'sh', x: -5 }, { ref: 'sh', x: 5 }], posts: [] };
eq('two overlapping shelves on one level → error', (G.check(S2, { floorH: 0, levels: [twoRound], pieces: [] }).byL.X || []).map(x => x.kind).includes('shelfhit'), true);
eq('shelf out of the chamber → error', (G.check(S2, { floorH: 0, levels: [{ id: 'Y', shelves: [{ ref: 'sh', x: 3 }], posts: [] }], pieces: [] }).byL.Y || []).map(x => x.kind), ['shelfbig']);
const hp = G.defaultPosts(G.levelShelves(S2, halves), 3, 4);
eq('default posts for two halves: 3 each, all on their half', [hp.length, hp.every(q => Math.min(...hs.map(h => G.pointOut([q.x, q.y], h))) <= 0)], [6, true]);
const rP = { floorH: 5, levels: [{ id: 'A', shelves: [{ ref: 'sh' }], postH: 10, posts: [{ x: 0, y: 26 }, { x: 0, y: 10 }] }, { id: 'B', shelves: [{ ref: 'hf', x: 0, y: 0.5 }], posts: [] }], pieces: [] };
eq('post off the shelf → error; post not under the shelf above → warning', (G.check(S2, rP).byL.A || []).map(x => x.sev + ':' + x.kind), ['err:postoff']);
rP.levels[0].posts = [{ x: 0, y: -10 }];
eq('post under no shelf of the level above → warning', (G.check(S2, rP).byL.A || []).map(x => x.sev + ':' + x.kind), ['warn:postoff']);

// Positions are optional: a piece on a level without a place is checked by height only.
const rN = { floorH: 5, gap: 0, clear: 0.5, levels: [{ id: 'A', shelves: [{ ref: 'sh' }], postH: 10, posts: [{ x: 0, y: 20 }] }, { id: 'B', shelves: [{ ref: 'sh' }], posts: [] }],
  pieces: [piece({ id: 'u', d: 30, h: 12, level: 'A', x: null, y: null }), piece({ id: 'v', d: 30, h: 5, level: 'A', x: null, y: null }), piece({ id: 'w', h: 5, level: 'A', x: null, y: null })] };
const cN = G.check(S2, rN);
eq('no place → only height is checked', [(cN.byP.u || []).map(x => x.kind), cN.byP.v, cN.byP.w], [['tall'], undefined, undefined]);
eq('no place → not in overlaps of placed pieces', G.check(S2, Object.assign({}, rN, { pieces: rN.pieces.concat([piece({ id: 'z', d: 10, h: 5, level: 'A', x: 0, y: 0 })]) })).byP.z, undefined);
eq('zone: centre / middle / edge with clock', [G.zone(1, 2, 25.5), G.zone(12, 0, 25.5), G.zone(0, 20, 25.5), G.zone(null, 3, 25)], ['център', 'среда, 3 ч', 'ръб, 12 ч', '']);

// Arbitrary heights.
const cb = G.postCombos([2.5, 5, 7.5, 15], 40);
eq('12.5 = 7.5+5', cb[12.5], [7.5, 5]);
eq('22.5 = 15+7.5', cb[22.5], [15, 7.5]);
eq('3.2 cm posts work too', G.postCombos([3.2, 10], 20)[13.2], [10, 3.2]);
eq('any height is accepted as level height', G.stack(S2, { floorH: 3.3, levels: [{ id: 'A', shelves: [{ ref: 'sh' }], postH: 13.7 }, { id: 'B', shelves: [{ ref: 'sh' }] }] })[1].bottom, 3.3 + 1.6 + 13.7);

// Simple placement and its reasons.
const rA = { floorH: 5, gap: 0, clear: 0.5, levels: [{ id: 'A', shelves: [{ ref: 'sh' }], postH: 10, posts: [] }, { id: 'B', shelves: [{ ref: 'sh' }], posts: [] }], pieces: [
  piece({ id: 'p1', d: 22, h: 8, level: null, x: null, y: null }), piece({ id: 'p2', d: 22, h: 8, level: null, x: null, y: null }),
  piece({ id: 'p3', d: 22, h: 8, level: null, x: null, y: null }), piece({ id: 'p4', d: 20, h: 9.7, level: null, x: null, y: null }),
  piece({ id: 'p5', d: 10, h: 40, level: null, x: null, y: null }), piece({ id: 'p6', h: 5, level: null, x: null, y: null }), piece({ id: 'p7', d: 6, level: null, x: null, y: null }) ] };
const res = G.autoArrange(S2, rA, rA.pieces.map(p => p.id), ['A']);
const fk = Object.fromEntries(res.failed.map(f => [f.id, f.kind]));
eq('auto (one level): two Ø22 fit on Ø47, the third has no room', [res.placed.length, fk.p3 || fk.p2 || fk.p1], [2, 'room']);
eq('auto: reasons — too tall, no base, no height', [fk.p4, fk.p5, fk.p6, fk.p7], ['tall', 'tall', 'size', 'noh']);
eq('auto: the input run is not changed', rA.pieces.every(p => p.level === null), true);
eq('auto: tall message says how much room there is', /9\.7 \+ 0\.5 см, най-много 10 см/.test(res.failed.find(f => f.id === 'p4').msg), true);
const res2 = G.autoArrange(S2, rA, ['p4'], ['A', 'B']);
eq('auto (all levels): the 9.7 cm piece goes to the level with room', res2.placed[0] && res2.placed[0].level, 'B');
eq('quick reason: tall on this level', G.quickReason(S2, rA, rA.levels[0], rA.pieces[3]).kind, 'tall');
eq('quick reason: none when it may fit', G.quickReason(S2, rA, rA.levels[1], rA.pieces[3]), null);

// Suggested levels.
const SP = { kiln: { shape: 'round', d: 51, h: 38 }, shelves: [Object.assign({}, shelf, { qty: 3 })], postSizes: [5, 10, 15], postD: 4 };
const mk = (id, d, h) => piece({ id, no: id, d, h, level: null, x: null, y: null });
const rP1 = { floorH: 0, gap: 0, clear: 1, levels: [], pieces: [mk('v', 18, 22), mk('a', 8, 12), mk('b', 8, 10), mk('c', 10, 1), mk('e', 4, 1)] };
const P1 = G.planLevels(SP, rP1);
eq('plan: few pieces → one level, no problems', [P1.levels.length, P1.problems.length, P1.fits], [1, 0, true]);
const many = []; for (let i = 0; i < 12; i++) many.push(mk('t' + i, 14, 20)); for (let i = 0; i < 12; i++) many.push(mk('s' + i, 14, 4));
const P2 = G.planLevels(SP, { floorH: 0, gap: 0, clear: 1, levels: [], pieces: many });
eq('plan: posts are buildable and cover the need', P2.levels.slice(0, -1).every(l => l.postH >= l.need && l.combo), true);
eq('plan: every piece placed exactly once', P2.levels.reduce((a, l) => a + l.ids.length, 0), 24);
eq('plan: each level is as high as its tallest piece needs', P2.levels.every(l => l.ids.every(id => (many.find(p => p.id === id).h + 1) <= l.need + 1e-9)), true);
const P3 = G.planLevels(Object.assign({}, SP, { kiln: { shape: 'round', d: 51, h: 20 } }), { floorH: 0, gap: 0, clear: 1, levels: [], pieces: many });
eq('plan: not enough height → says by how much', P3.fits === false && /липсват \d/.test(P3.problems.join(' ')), true);
eq('plan: piece wider than the shelf is reported, not lost', G.planLevels(SP, { floorH: 0, gap: 0, clear: 1, levels: [], pieces: [mk('w', 50, 5)] }).skipped.map(x => x.id), ['w']);
eq('plan: more levels than shelves → says so', /плочи/.test(G.planLevels(Object.assign({}, SP, { shelves: [Object.assign({}, shelf, { qty: 1 })] }), { floorH: 0, gap: 0, clear: 1, levels: [], pieces: many }).problems.join(' ')), true);
eq('plan: does not change the run', rP1.pieces.every(p => p.level === null && p.x === null), true);

console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
