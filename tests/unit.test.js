// Unit tests for the ES modules — pure functions, checked against hand-worked
// values. Node loads each module as-is (they have no imports of their own).
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GLINA_ROOT || path.resolve(__dirname, '..');
if (!fs.existsSync(path.join(ROOT, 'app.js'))) { console.log('unit: - no modules in this version'); process.exit(0); }
const load = f => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8')).toString('base64'));

let failed = 0, passed = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { passed++; console.log('  ok   ' + name); } else { failed++; console.log('  FAIL ' + name + '\n       got ' + g + '\n       want ' + w); }
};
const near = (a, b) => Math.abs(a - b) < 1e-9;

(async () => {
  console.log('unit:');
  const shrink = await load('calc/shrink.js');
  // Tile marked 100 mm wet, 94 dry, 89 fired.
  const s = shrink._shrinkPcts({ shrMarked: 100, shrDry: 94, shrFired: 89 });
  eq('shrink wet→dry 6 %', s.wetDry, 6);
  eq('shrink dry→fired (94−89)/94', near(s.dryFired, 5 / 94 * 100), true);
  eq('shrink total 11 %', s.total, 11);
  eq('shrink: nothing measured → null', shrink._shrinkPcts({}), null);
  eq('shrink: no body → null', shrink._shrinkPcts(null), null);
  eq('shrink: only dry→fired', shrink._shrinkPcts({ shrDry: 50, shrFired: 45 }), { dryFired: 10 });
  eq('porosity 20 g → 23.1 g = 15.5 %', near(shrink._poroPct({ poroDry: 20, poroWet: 23.1 }), 15.5), true);
  eq('porosity: zero dry weight → null', shrink._poroPct({ poroDry: 0, poroWet: 5 }), null);

  const pr = await load('domain/profile.js');
  const bisque = { ramps: [{ rate: 60, to: 600, hold: 0 }, { rate: 120, to: 980, hold: 10 }] };
  // 20→600 at 60 °C/h = 580 min; 600→980 at 120 °C/h = 190 min; + 10 min hold.
  eq('duration bisque = 780 min', pr._fpDuration(bisque), { minutes: 780, complete: true });
  eq('peak 980', pr._fpPeak(bisque), 980);
  eq('legacy two-segment → array, hold on the last', pr._fpRamps({ ramp1Rate: 150, ramp1To: '1000', ramp2Rate: 80, ramp2To: 1240, holdMin: 15 }),
    [{ rate: 150, to: 1000, hold: null }, { rate: 80, to: 1240, hold: 15 }]);
  eq('legacy one segment keeps its hold', pr._fpRamps({ ramp1Rate: 100, ramp1To: 600, holdMin: 5 }), [{ rate: 100, to: 600, hold: 5 }]);
  eq('segment without rate → approximate', pr._fpDuration({ ramps: [{ rate: null, to: 600, hold: 0 }] }), { minutes: 0, complete: false });
  eq('no profile → no ramps', pr._fpRamps(null), []);
  eq('format 780 min', pr._fmtDuration(780), '13 ч');
  eq('format 125 min', pr._fmtDuration(125), '2 ч 5 мин');
  eq('format 45 min', pr._fmtDuration(45), '45 мин');
  eq('number from text', pr._numOrNull('12.5'), 12.5);
  eq('empty → null', pr._numOrNull(''), null);

  const m = await load('core/merge.js');
  const owned = ['id', 'name', 'notes', 'data'];
  eq('merge: unknown field kept', m._mergeEdit({ id: 1, name: 'a', code: 'GL-1' }, { id: 1, name: 'b' }, owned), { code: 'GL-1', id: 1, name: 'b' });
  eq('merge: owned field not returned → removed', m._mergeEdit({ id: 1, name: 'a', notes: 'x' }, { id: 1, name: 'a' }, owned), { id: 1, name: 'a' });
  eq('merge: nested unknown kept, nested owned cleared', m._mergeEdit({ id: 1, data: { temp: 980, place: 'L1' } }, { id: 1, data: {} }, owned, { data: ['temp'] }), { id: 1, data: { place: 'L1' } });
  eq('merge: nested object dropped when the form drops it', m._mergeEdit({ id: 1, data: { place: 'L1' } }, { id: 1 }, owned, { data: ['temp'] }), { id: 1 });
  eq('merge: no old record → the form as is', m._mergeEdit(null, { id: 2 }, owned), { id: 2 });
  eq('merge: old record not mutated', (() => { const o = { id: 1, name: 'a' }; m._mergeEdit(o, { id: 1, name: 'b' }, owned); return o; })(), { id: 1, name: 'a' });
  eq('owned lists have no duplicates', Object.keys(m._EDIT_OWNS).filter(k => new Set(m._EDIT_OWNS[k]).size !== m._EDIT_OWNS[k].length), []);

  if (fs.existsSync(path.join(ROOT, 'domain/units.js'))) {
  const u = await load('domain/units.js');
  // Codes.
  eq('code format', u._codeFormat(2026, 14), 'GL-2026-014');
  eq('code over 999', u._codeFormat(2026, 1234), 'GL-2026-1234');
  eq('next code in the year', u._nextCode(['GL-2026-001', 'GL-2026-007', 'GL-2025-040'], 2026), 'GL-2026-008');
  eq('first code of a new year', u._nextCode(['GL-2026-007'], 2027), 'GL-2027-001');
  eq('year from createdAt, then date', [u._codeYear({ createdAt: '2025-03-01T10:00:00Z', date: '2026-01-01' }, 2026), u._codeYear({ date: '2024-05-05' }, 2026), u._codeYear({}, 2026)], [2025, 2024, 2026]);
  eq('codes in creation order, existing kept', u._assignCodes([{ id: 'b', date: '2026-02-01' }, { id: 'a', date: '2026-01-01' }, { id: 'c', code: 'GL-2026-003' }, { id: 'd', date: '2025-12-31' }], ['GL-2026-003'], 2026),
    { d: 'GL-2025-001', a: 'GL-2026-004', b: 'GL-2026-005' });
  // Units.
  const se = { count: 10 }, m1 = { id: 'm1', seriesNo: 1, qty: 4 }, m2 = { id: 'm2', seriesNo: 2, qty: 1 };
  const mig = u._migrateSeriesUnits(se, [m2, m1]);
  eq('migration: members numbered in split order', mig.units, { m1: [1, 2, 3, 4], m2: [5] });
  eq('migration: next number after the count', mig.nextUnitNo, 11);
  const S1 = { count: 10, nextUnitNo: 11 }, M1 = [{ qty: 4, units: [1, 2, 3, 4] }, { qty: 1, units: [5] }];
  eq('free units = the rest', u._seriesFreeUnits(S1, M1), [6, 7, 8, 9, 10]);
  eq('split takes the lowest free', u._allocUnits(S1, M1, 2), [6, 7]);
  eq('split beyond the free → null', u._allocUnits(S1, M1, 6), null);
  eq('count 10 → 8: the two highest free retire', u._countChange(S1, M1, 8), { nextUnitNo: 11, retire: [9, 10], add: [] });
  eq('count 10 → 12: new numbers after the last', u._countChange(S1, M1, 12), { nextUnitNo: 13, retire: [], add: [11, 12] });
  eq('count below the split → error', u._countChange(S1, M1, 4).error, 'below-split');
  const S2 = { count: 8, nextUnitNo: 11, retiredUnits: [{ no: 9 }, { no: 10 }] };
  eq('retired numbers are never free again', u._seriesFreeUnits(S2, M1), [6, 7, 8]);
  eq('after retire, growing gives 11, not 9', u._countChange(S2, M1, 9).add, [11]);
  const S3 = { count: 5, nextUnitNo: 6 }, M3 = [{ qty: 1, units: [3] }];
  eq('a hole in the middle is used first', u._allocUnits(S3, M3, 2), [1, 2]);
  eq('series from before v1.31.0: next derived', u._seriesNextUnit({ count: 5 }, [{ qty: 7 }]), 8);
  eq('labels', [u._unitsLabel([3]), u._unitsLabel([3, 4, 5, 6]), u._unitsLabel([1, 4, 7]), u._unitsLabel([2, 3]), u._unitsLabel([])], ['/3', '/3–6', '/1, 4, 7', '/2, 3', '']);
  }

  if (fs.existsSync(path.join(ROOT, 'domain/traits.js'))) {
  const t = await load('domain/traits.js');
  eq('size from the form, comma decimals', t._readSize('12,5', '8', '', 'bone-dry', true), { h: 12.5, w: 8, at: 'bone-dry', approx: true });
  eq('size: nothing filled → null', t._readSize('', '', '', 'bone-dry', true), null);
  eq('size: zero and negative are not sizes', t._readSize('0', '-3', 'x', '', false), null);
  eq('label round', t._sizeLabel({ h: 12, w: 8 }), 'в12 × Ø8 см');
  eq('label rect', t._sizeLabel({ h: 2, w: 20, depth: 15 }), 'в2 × 20 × 15 см');
  eq('label only width', t._sizeLabel({ w: 22.5 }), 'Ø22,5 см');
  eq('label empty', t._sizeLabel(null), '');
  eq('parse "в8 × ⌀6"', t._parseDims('в8 × ⌀6'), { w: 6, h: 8 });
  eq('parse "20×15×8"', t._parseDims('20×15×8'), { w: 20, depth: 15, h: 8 });
  eq('categories: trimmed, no repeats (case), order kept', t._catsNorm([' Чаши ', 'чаши', '', 'Окарини', null]), ['Чаши', 'Окарини']);
  eq('kiln size from structured', t._kilnSize({ size: { h: 22, w: 18 }, dimensions: 'в1 × ⌀1' }), { h: 22, source: 'size', shape: 'round', d: 18 });
  eq('kiln size rect', t._kilnSize({ size: { h: 2, w: 20, depth: 15 } }), { h: 2, source: 'size', shape: 'rect', w: 20, depth: 15 });
  eq('kiln size from text when no structured', t._kilnSize({ dimensions: 'в8 × ⌀6' }), { h: 8, source: 'text', shape: 'round', d: 6 });
  eq('kiln size: nothing → null', t._kilnSize({ dimensions: 'голяма' }), null);
  eq('number: "450" → 450, "" → null', [t._numPos('450'), t._numPos('')], [450, null]);
  }

  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
