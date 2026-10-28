// Builds the representative archives the golden tests run against.
//
//   representative.json — a current-shape database (migrations already done) that
//     touches every entity and every rule that has broken before: series with
//     split members, an outcome that triggers the brake, runs (electric + pit),
//     legacy and array ramps, recipe versions, raw → mass, body and glaze tests,
//     a piece with no events, a standalone firing, an untyped firing.
//   legacy.json — an old-shape database (no _migrations): v1.3.x fields, legacy
//     stage names, legacy two-segment profile. Exercises runMigrations().
//
// Both are written in the `atelie_v6` shape: what an existing install holds before
// v1.28.0 splits it into per-record keys. Booting from it exercises that migration
// too. Re-run with `node tests/fixtures/make-fixtures.js` — output is deterministic.
const fs = require('fs');
const path = require('path');

// A tiny but valid JPEG data URL; the app never decodes photos at load.
const PH = n => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/' + 'A'.repeat(20) + n;

const DONE = { 'v1.3.2': '2026-04-01T10:00:00.000Z', 'v1.4.2.3': '2026-06-01T10:00:00.000Z', 'v1.15.0': '2026-07-20T10:00:00.000Z' };

const materials = [
  { id: 'mat-toffee', name: 'TOFFEE Caramel', cat: 'clays', brand: 'Goerg & Schneider', stock: 10, alertAt: '2', cost: 1.4, costUnit: 'kg', notes: 'стонуер', photo: PH('mt') },
  { id: 'mat-xi', name: 'Xi Beach', cat: 'raw', raw: { location: 'Xi Beach, Кефалония', coords: '38.17,20.43', date: '2026-06-10', weight: 4.5, geonotes: 'морска',
    events: [
      { id: 'rx1', type: 'extraction', date: '2026-06-10', note: '', photos: [], data: { weight: 4.5 } },
      { id: 'rx2', type: 'wash', date: '2026-07-01', note: 'първо', photos: [PH('rw')], data: { washNum: 1, ppmBefore: 4200, ppmAfter: 900 } },
      { id: 'rx3', type: 'sieve', date: '2026-08-01', note: '', photos: [], data: { mesh: '80', weightBefore: 3.9, weightAfter: 3.2 } }
    ] } },
  { id: 'mat-xi-mass', name: 'Xi Beach 100', cat: 'mass', blend: { components: [{ ref: 'mat:mat-xi', pct: 100 }], mixDate: '2026-09-01' } },
  { id: 'mat-xi-grog', name: 'Xi Beach + шамот', cat: 'mass', blend: { components: [{ ref: 'mat:mat-xi-mass', pct: 85 }, { ref: 'mat:c1', pct: 15 }] } },
  { id: 'mat-engobe', name: 'Бяла ангоба', cat: 'engobe', notes: '' },
  { id: 'mat-wish', name: 'Rutile', cat: 'ox', wishlist: true },
  { id: 'mat-feldspar', name: 'Фелдшпат K', cat: 'base', chem: { sio2: 65.5, al2o3: 18.3, k2o: 12.1 }, cost: 3, costUnit: 'kg' }
];

const recipes = [
  { id: 'rec-ash', name: 'Пепелна Б', temp: '1240', cone: '6', glazeType: 'gloss', fav: true, lineageId: 'rec-ash', version: 1,
    ingredients: [{ matId: 'm1', name: 'Пепел бук+дъб', pct: 50 }, { matId: 'mat-feldspar', name: 'Фелдшпат K', pct: 30 }, { matId: 'm3', name: 'Каолин', pct: 20 }], notes: 'v1' },
  { id: 'rec-ash-2', name: 'Пепелна Б', temp: '1240', cone: '6', glazeType: 'gloss', fav: false, lineageId: 'rec-ash', version: 2, versionNote: 'повече фелдшпат', notes: '',
    ingredients: [{ matId: 'm1', name: 'Пепел бук+дъб', pct: 45 }, { matId: 'mat-feldspar', name: 'Фелдшпат K', pct: 35 }, { matId: 'm3', name: 'Каолин', pct: 20 }], recommendedFiringProfileId: 'fp-glaze', photo: PH('rc') }
];

const firingProfiles = [
  { id: 'fp-bisque', name: 'Бисквит 980', type: 'bisque', ramps: [{ rate: 60, to: 600, hold: 0 }, { rate: 120, to: 980, hold: 10 }], updatedAt: '2026-07-01T10:00:00.000Z' },
  { id: 'fp-glaze', name: 'Глазурно 1240 (стар формат)', type: 'glaze', ramp1Rate: 150, ramp1To: 1000, ramp2Rate: 80, ramp2To: 1240, holdMin: 15 }
];

const firingRuns = [
  { id: 'run-bis', name: 'Бисквит октомври', date: '2026-09-10', method: 'electric', atmosphere: 'oxidation', purpose: 'bisque', firingProfileId: 'fp-bisque', peakTemp: 980, holdMin: 10, cones: '06', notes: '', photos: [PH('rb')], createdAt: '2026-09-10T08:00:00.000Z' },
  { id: 'run-gl', name: '', date: '2026-09-20', method: 'electric', atmosphere: 'oxidation', purpose: 'glaze', firingProfileId: 'fp-glaze', peakTemp: 1240, photos: [] },
  { id: 'run-pit', name: 'Трап на терасата', date: '2026-09-25', method: 'pit', purpose: 'alternative', fuel: 'дърва, стърготини', duration: 6,
    additives: ['mat:mat-engobe', 'мед сулфат'], photos: [] }
];

const ev = (id, type, date, data, extra) => Object.assign({ id, type, date, note: '', photos: [], data: data || {} }, extra || {});

const series = [
  { id: 'se-plates', name: 'Чинии 22 см', type: 'чиния', clay: 'mat-toffee', count: 10, date: '2026-08-20', stage: 'fired', dimensions: '⌀22', photos: [PH('se')],
    events: [
      ev('se1', 'stage', '2026-08-20', { stageValue: 'wet' }),
      ev('se2', 'firing', '2026-09-10', { firingRunId: 'run-bis' }),
      ev('se3', 'decoration', '2026-09-15', { technique: 'glaze', materialIds: ['rec:rec-ash-2'], appliedAtStage: 'bisque' }),
      ev('se4', 'firing', '2026-09-20', { firingRunId: 'run-gl' })
    ], createdAt: '2026-08-20T10:00:00.000Z' }
];

const pieces = [
  { id: 'p-ocarina', name: 'Окарина Xi', type: 'музикален инструмент', clay: 'mat-xi-mass', technique: 'Ръчно формоване', date: '2026-09-01', stage: 'fired', recipe: '', dimensions: 'в8 × ⌀6', weight: 120,
    photos: [PH('o1')], notes: 'пробна',
    events: [
      ev('o-e1', 'stage', '2026-09-01', { stageValue: 'wet' }),
      ev('o-e2', 'decoration', '2026-09-01', { technique: 'stamp', appliedAtStage: 'wet' }),
      ev('o-e3', 'stage', '2026-09-05', { stageValue: 'bone-dry' }),
      ev('o-e4', 'progress', '2026-09-06', { atStage: 'bone-dry' }, { photos: [PH('o2')] }),
      ev('o-e5', 'firing', '2026-09-10', { firingRunId: 'run-bis', wrapping: 'bare' }),
      ev('o-e6', 'firing', '2026-09-25', { firingRunId: 'run-pit', wrapping: 'foil' })
    ], createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-25T10:00:00.000Z' },
  { id: 'p-yellow', name: 'Жълти', seriesId: 'se-plates', qty: 4, seriesNo: 1, stage: 'fired', clay: 'mat-toffee', type: 'чиния', date: '2026-08-20', photos: [], notes: '', dimensions: '⌀22',
    events: [ev('y-e1', 'decoration', '2026-09-15', { technique: 'underglaze', appliedAtStage: 'bisque' })], createdAt: '2026-09-15T10:00:00.000Z' },
  { id: 'p-broken', name: 'Счупена', seriesId: 'se-plates', qty: 1, seriesNo: 2, stage: 'broken',
    events: [ev('b-e1', 'stage', '2026-09-12', { stageValue: 'broken' })], createdAt: '2026-09-12T10:00:00.000Z' },
  { id: 'p-old', name: 'Стара купа', type: 'купа', clay: 'PRNF Black', stage: 'bisque', bisqueTemp: 950, date: '2026-03-01', photos: [PH('ol')] },
  { id: 'p-standalone', name: 'Ваза', type: 'ваза', clay: 'c1', recipe: 'rec-ash', stage: 'fired',
    events: [ev('s-e1', 'firing', '2026-05-02', { method: 'electric', atmosphere: 'oxidation', firingPurpose: 'glaze', temp: 1240, profileId: 'fp-glaze' })] },
  { id: 'p-done', name: 'Чаша', type: 'чаша', clay: 'mat-toffee', stage: 'finished',
    events: [ev('d-e1', 'firing', '2026-09-20', { firingRunId: 'run-gl' }), ev('d-e2', 'stage', '2026-09-22', { stageValue: 'finished' })] },
  { id: 'p-gift', name: 'Подарък', stage: 'gifted', events: [ev('g-e1', 'stage', '2026-07-01', { stageValue: 'gifted' })] },
  { id: 'p-untyped', name: 'Без тип', stage: 'bone-dry',
    events: [ev('u-e1', 'stage', '2026-08-01', { stageValue: 'bone-dry' }), ev('u-e2', 'firing', '2026-08-10', { method: 'electric' })] }
];

const tests = [
  { id: 't-glaze', kind: 'glaze', date: '2026-09-20', temp: '1240', hold: '15', recipeId: 'rec-ash-2', firingRunId: 'run-gl', firingProfileId: 'fp-glaze', clay: 'TOFFEE Caramel',
    rat: '4 ★★★★', glazeLayers: '2', flow: 'Ниско', surf: 'Гланцова', def: '', notes: '', photos: [PH('tg')] },
  { id: 't-body', kind: 'body', date: '2026-09-10', temp: '980', hold: '10', firingRunId: 'run-bis', clay: '', notes: '', bodyRef: 'mat:mat-xi-mass',
    body: { plasticity: 'добра', shrMarked: 100, shrDry: 94, shrFired: 89, poroDry: 20, poroWet: 23.1, limePopping: 'няма' }, photos: [] }
];

const representative = { pieces, recipes, materials, tests, firingProfiles, firingRuns, series, _migrations: DONE };

const legacy = {
  pieces: [
    { id: 'l1', name: 'Старо сурово', stage: 'greenware', temp: 1200, clay: 'PRNF Black' },
    { id: 'l2', name: 'Старо готово', stage: 'glaze-fired', bisqueTemp: 950, glazeTemp: 1230 },
    { id: 'l3', name: 'Двойна стъпка', events: [
      { id: 'l3a', type: 'stage', date: '2026-05-01', data: { stageValue: 'wet' } },
      { id: 'l3b', type: 'stage', date: '2026-05-01', data: { stageValue: 'wet' } },
      { id: 'l3c', type: 'firing', date: '2026-05-10', data: { method: 'pit', firingPurpose: 'alternative' } }] }
  ],
  recipes: [], tests: [],
  materials: [{ id: 'lc', name: 'Стара глина', cat: 'clays', fireTemp: '1200' }],
  firingProfiles: [{ id: 'lfp', name: 'Стар', ramp1Rate: 100, ramp1To: 600, holdMin: 5 }]
};

const out = path.join(__dirname);
fs.writeFileSync(path.join(out, 'representative.json'), JSON.stringify(representative, null, 1));
fs.writeFileSync(path.join(out, 'legacy.json'), JSON.stringify(legacy, null, 1));
console.log('fixtures written');
