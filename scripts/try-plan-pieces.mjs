// try-plan-pieces.mjs — a plan's line names its pieces and carries details
// (§13gt), on the real screens in jsdom.
//
// Her plan of 16 November: six pieces of cotton, eucalyptus and a green ground.
// Two of the pieces here, a work that used one of them, and a plan from before
// rc144 that must open and save as it was.
//
// Run on its own:  node scripts/try-plan-pieces.mjs

import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
process.chdir(ROOT);

const { JSDOM } = await import('jsdom');
await import('fake-indexeddb/auto');
const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { url: 'https://example.org/bagra/', runScripts: 'outside-only' });
const define = (name, value) => Object.defineProperty(global, name, { value, configurable: true, writable: true });
for (const k of ['window', 'document', 'location', 'navigator', 'HTMLElement', 'Image', 'FileReader', 'Blob', 'URL',
  'Event', 'MouseEvent', 'CustomEvent', 'MutationObserver', 'history'])
  define(k, k === 'window' ? dom.window : dom.window[k]);
define('alert', () => {});
let confirmed = 0;
define('confirm', () => { confirmed++; return true; });
define('crypto', { randomUUID: () => 'id-' + Math.random().toString(36).slice(2) });
define('fetch', async (u) => {
  const p = String(u).replace(/^.*\/bagra\//, '');
  if (!fs.existsSync(p)) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(p, 'utf8')) };
});
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const until = async (test, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await test()) return true; await wait(40); } return false; };

let failed = false;
const is = (got, want, m) => {
  const okk = JSON.stringify(got) === JSON.stringify(want);
  if (!okk) failed = true;
  console.log((okk ? '  ok   ' : '  FAIL ') + m + (okk ? '' : ` — expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`));
};

const db = await import('../db.js');
(await import('./licence-fixture.mjs')).seedJsdom();
const cotton = (id, label, name, actions = []) => ({ id, origin: 'user', label, name, composition: [{ fibreCode: 'cotton', percent: 100 }], actions });
await db.putRaw('fabrics', cotton('p1', 'П-044', 'памучна кърпа 1', [
  { id: 'a1', actionCode: 'wash', date: '2026-11-14', createdAt: '2026-11-14T10:00:00Z' },
  { id: 'a2', actionCode: 'mordant', date: '2026-11-14', createdAt: '2026-11-14T10:00:01Z' }]));
await db.putRaw('fabrics', cotton('p3', 'П-046', 'памучна кърпа 3'));
await db.putRaw('fabrics', cotton('p9', 'П-099', 'неизползвана'));
await db.putRaw('trials', { id: 'w1', origin: 'user', title: 'баня евкалипт', status: 'in_progress', date: '2026-11-17',
  processCode: 'immersion', fabricIds: ['p1'], steps: [], placements: [], bundle: { layers: [] } });
// A plan as rc143 wrote it: lines with words and ticks and nothing else.
const OLD = { id: 'old', title: 'стар план', status: 'idea', notes: 'бележка', createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z', sourceLabel: '', sourceUrl: '', referenceImage: '',
  items: [{ id: 'i1', text: 'ред едно', checked: true }, { id: 'i2', text: 'ред две', checked: false }] };
await db.putRaw('plans', structuredClone(OLD));

const i18n = await import('../i18n.js');
await i18n.setLang('bg');
await import('../app.js');
await until(() => document.querySelector('#view')?.children.length);
await wait(400);
const go = async (hash) => { location.hash = hash; await wait(700); };
const click = async (sel) => { const b = document.querySelector(sel); if (!b) return false; b.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); await wait(400); return true; };
const choose = async (sel, value) => { const s = document.querySelector(sel); if (!s) return false; s.value = value; s.dispatchEvent(new dom.window.Event('change', { bubbles: true })); await wait(400); return true; };
const view = () => document.querySelector('#view').innerHTML;

console.log('a plan from before');
await go('#/plans/old');
is(document.querySelectorAll('.checkitem').length, 2, 'it opens, its two lines');
await go('#/plans/old/edit');
await click('[data-save]');
const old = await db.get('plans', 'old');
is(old.items.map(it => Object.keys(it).sort()), [['checked', 'id', 'text'], ['checked', 'id', 'text']], 'and saves with no field added to its lines');

console.log('a line names pieces');
await go('#/plans/new');
document.querySelector('[data-f="title"]').value = 'План за тестове: евкалипт и зелен фон';
await click('[data-item-add]');
document.querySelector('[data-i="0.text"]').value = '1 — Чист фон';
document.querySelector('[data-i="0.details"]').value = 'Фон: баня евкалипт (сушени)\nОбработка: 2 ч / 90 °C\nСравни с 2, 4';
is([...document.querySelectorAll('[data-piece-add="0"] option')].map(o => o.textContent.split(' ·')[0]).slice(1), ['П-044', 'П-046', 'П-099'],
   'the select offers her pieces by tag number');
await choose('[data-piece-add="0"]', 'p1');
is(document.querySelector('[data-i="0.details"]')?.value.startsWith('Фон: баня евкалипт'), true, 'choosing a piece keeps the details typed');
is([...document.querySelectorAll('[data-piece-add="0"] option')].map(o => o.value).includes('p1'), false, 'and leaves that piece out of the select');
await choose('[data-piece-add="0"]', 'p9');
await click('[data-piece-del="0.p9"]');
is(!!document.querySelector('[data-piece-del="0.p9"]'), false, 'a piece is taken off the line');
await click('[data-item-add]');
document.querySelector('[data-i="1.text"]').value = '3 — Чист отпечатък';
await choose('[data-piece-add="1"]', 'p3');
await click('[data-item-add]');
await choose('[data-piece-add="2"]', 'p9');   // a line with no words, but a piece
await click('[data-save]');
const plans = (await db.all('plans')).filter(p => p.id !== 'old');
const p = plans[0];
is(p.items.map(it => [it.text, it.fabricIds]), [['1 — Чист фон', ['p1']], ['3 — Чист отпечатък', ['p3']]],
   'saved: each line with its pieces; the line with no words is dropped with its piece');
is(p.items[0].details, 'Фон: баня евкалипт (сушени)\nОбработка: 2 ч / 90 °C\nСравни с 2, 4', 'the details saved as typed');
is('details' in p.items[1], false, 'a line with no details carries no empty field');

console.log('the plan as read');
await go('#/plans/' + p.id);
const det = document.querySelector('.plandetails');
is(det?.innerHTML.split('<br>').length, 3, 'the details shown with their line breaks');
const piece1 = [...document.querySelectorAll('.planpiece')].find(li => /П-044/.test(li.textContent));
is(!!piece1?.querySelector('a[href="#/fabrics/p1"]'), true, 'each piece a link to its record');
is(piece1?.querySelector('[data-studio]')?.dataset.studio, 'M', 'with its stage now — M');
is(piece1?.querySelector('a[href="#/trials/w1"]')?.textContent, 'баня евкалипт', 'and the work that used it, a link, by its own title');
is(/още не е в работа/.test([...document.querySelectorAll('.planpiece')].find(li => /П-046/.test(li.textContent))?.textContent || ''), true,
   'a piece no work has used says so');

console.log('the piece, and deleting it');
await go('#/fabrics/p3');
is(!!document.querySelector(`#view a[href="#/plans/${p.id}"]`), true, 'the piece\'s record lists the plan');
const refs = await import('../refs.js');
is((await refs.findReferences('fabrics', 'p3')).byStore.map(b => b.store), ['plans'], 'a piece a plan names is pointed at — by the plan');
const stored = await db.get('plans', p.id);
stored.items[1].fabricIds = [];
await db.put('plans', stored);
is((await refs.findReferences('fabrics', 'p3')).total, 0, 'and free once it is off the line');

console.log('backup, and a piece that is gone');
const backup = await import('../backup.js');
const exp = await backup.exportAll();
const inFile = exp.data.plans.find(x => x.id === p.id);
is([inFile.items[0].fabricIds, inFile.items[0].details.length > 0], [['p1'], true], 'the backup carries both fields');
const gone = await db.get('plans', p.id);
gone.items[0].fabricIds = ['p1', 'no-such-piece'];
await db.putRaw('plans', gone);
await go('#/plans');
await go('#/plans/' + p.id);
is(/парчето вече го няма/.test(view()), true, 'a piece that is gone is said to be gone');

if (failed) { console.log('plan pieces: FAILED'); process.exit(1); }
console.log('plan pieces: all checks pass.');
process.exit(0);
