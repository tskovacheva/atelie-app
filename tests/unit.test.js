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

  console.log((failed ? 'FAILED ' : 'OK ') + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
