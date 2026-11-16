// modules/fabrics.js — one record is one physical piece (§3, A.1).

import { all, get, put, putTogether, newRecord, getSetting, setSetting, uid } from '../db.js';
import { t, text, getLang } from '../i18n.js';
import { STUDIO_STATUSES, deriveStudioStatus, deriveProcessTrail, deriveProcessSummary, codeWithName, studioLabel } from '../studio.js';
import { studioBadge, studioStyle, workingLabel, printWorkingLabel } from '../studio-ui.js';
import { sheetPages, blankPages, sheetHtml, printSheet } from '../label-sheet.js';
import { finishedBeforeTreatment } from '../date-order.js';
import { massWith, gsmWith } from '../units.js';
import { shrinkThumb } from '../photo.js';
import { page, panel, field, options, label, esc, empty, note, today, fmtDate,
         fact, facts, readBlock, navigate, icon, flash, searchBox, matches, backTo, actionBtn, deleteGuarded } from '../ui.js';
import { markClean } from '../dirty.js';
import { ACTION_FOR_STATE } from '../migrate-actions.js';
import {
  compositionTotal, dyeReceptiveFraction, fibreClass, compositionWarnings,
  currentState, stateHistory, daysSinceMordanted, STATE_ORDER, photoTimeline,
  treatmentsOf, eligibleFor,
  workTitle, workSubtitle,
} from '../fabric-logic.js';

// The boxes a hand-entered change may move a piece to. „Washed" is shown and
// disabled on a piece already past it (§13fn): the same rule as the group
// action, and a disabled option says why it is not there where a missing one
// would only puzzle. Built from a string — a regex literal with quotes in it is
// what check-scope.js cannot read (§13fh).
//
// „Неизпран" is not in the list at all (§13fo). It is where a piece begins, not
// something done to it: there is no action that returns cloth to it, and
// choosing it used to write a meaningless `other`. It stays a choice for a NEW
// piece's initial box, which is a different field.
async function transitionOptions(record) {
  let html = await options('fabric_state', '', t('common.choose'));
  html = html.replace(new RegExp('<option value="unwashed"[^>]*>[^<]*</option>'), '');
  return eligibleFor('wash', record) ? html
    : html.replace(new RegExp('<option value="scoured"'), '<option value="scoured" disabled');
}

const STATE_ICONS = {
  unwashed: 's-unwashed',
  scoured: 's-scoured',
  mordanted: 's-mordanted',
  dyed: 's-dyed',
  finished: 's-finished',
};

// One mark per state, used wherever a state is named — the filter row, the list,
// the record, the history. Learned once rather than five times.
// What one history entry says was done. `stateHistory` returns the piece's
// ACTIONS since §13bd, and both history views still read `stateCode` — a field
// only the old `stateEvents` carry — so every entry showed a date and nothing
// else (found by the lifecycle test, rc94). The action is named as the
// preparation card and the group action name it, with its recipe; a piece that
// still has only old state events keeps showing its state.
async function historyWhat(e) {
  if (!e.actionCode) return e.stateCode ? stateChip(e.stateCode) : '';
  const recipe = e.recipeId ? await get('recipes', e.recipeId) : null;
  return `${esc(await label('fabric_action', e.actionCode))}${
    recipe ? ` <span class="hint">· ${esc(text(recipe.name))}</span>` : ''}`;
}

const stateChip = async (code) => code
  ? `<span class="chip withmark">${icon(STATE_ICONS[code] || 's-unwashed')}${esc(await label('fabric_state', code))}</span>`
  : '';

// The treatments a piece carries that did not move it between boxes (§13bd).
//
// Written once and used in all four places a piece is shown — the list, the
// record, the group action and the picker for new work. The prototype showed
// them in two of the four, which is how a piece silently loses the very thing
// that decides what it is good for: a tanned cotton is ready for an eco print
// and will never be ready for a madder bath, and the box alone cannot say so.
export async function treatmentTags(fabric) {
  const codes = treatmentsOf(fabric);
  if (!codes.length) return '';
  return (await Promise.all(codes.map(async code =>
    `<span class="tag">${esc(await label('fabric_action', code))}</span>`))).join('');
}

let filterState = null;   // null = all; a studio code (RAW, W, T, M, D), or 'finished' (§13gc)
let studioRead = null;    // the record on screen and what its label is drawn from, for Print
let openId = null;        // null = list, 'new' = blank form, id = that record
let draft = null;
// Reading is the default; the form opens only when asked for.
let editing = false;
let selected = new Set();
// The rows the list shows now — the box chosen and the search — so „Select all
// shown" ticks exactly what is on screen (§13gq). Rebuilt on every draw.
let shownIds = [];
// Twenty-three pieces and growing. Filtering by box answers "what is in the
// mordanted box"; it does not answer "where is П-042", which is the question
// asked with a piece already in hand.
let query = '';

// The code written on the pinned paper tag. Short enough to write by hand;
// everything else lives in the app.
//
// Split in two deliberately. The counter used to advance when the blank form
// was OPENED, so opening it three times and saving once left a sequence with
// two holes in it. A number is reserved on save and only on save; before that
// the form shows what the code WILL be, which is a promise the app can keep.
async function peekLabel() {
  const n = (await getSetting('fabricLabelCounter', 0)) + 1;
  // The prefix is written by hand on a paper tag, so it stays a setting
  // rather than a translated string — the tag does not change language.
  const prefix = await getSetting('fabricLabelPrefix', 'П');
  return prefix + '-' + String(n).padStart(3, '0');
}

// The paper tag, compared the way it is read rather than the way it is stored.
//
// „П-04“ and „П-004“ are one number written twice — the padding changed between
// versions, so a comparison on the stored string sees two different tags and a
// person holding the two pieces sees one. The prefix is compared case- and
// space-insensitively for the same reason.
export function labelKey(label) {
  const s = String(label || '').trim();
  if (!s) return '';
  const m = s.match(/^(.*?)[-\s]*(\d+)$/);
  return m ? `${m[1].trim().toLowerCase()}-${Number(m[2])}` : s.toLowerCase();
}

// Every number already worn, by the piece wearing it.
async function wornLabels(exceptId = null) {
  const worn = new Map();
  for (const f of await all('fabrics')) {
    if (f.id === exceptId) continue;
    const key = labelKey(f.label);
    if (key && !worn.has(key)) worn.set(key, f);
  }
  return worn;
}

// Exported because screen 2 of the working flow adds a piece inline (§8.0e).
// The counter keeps a single owner here: two places incrementing it is how a
// sequence grows holes.
//
// The counter alone was trusted to be ahead of every label in use, and it is
// not: a hand-typed number does not move it, so the next reservation could hand
// out a tag already pinned to a piece. It now steps over what is worn.
export async function reserveLabel() {
  const worn = await wornLabels();
  for (let guard = 0; guard < 1000; guard++) {
    const code = await peekLabel();
    await setSetting('fabricLabelCounter', (await getSetting('fabricLabelCounter', 0)) + 1);
    if (!worn.has(labelKey(code))) return code;
  }
  // A thousand consecutive collisions is not a full shelf, it is a broken
  // counter — and silently returning a duplicate would be worse than stopping.
  throw new Error('no free label after 1000 attempts');
}

// Used everywhere a record is actually written. A hand-typed code still wins —
// but two pieces cannot wear one number, and this is where that was never
// checked: both П-04s in the owner's own shelf were typed by hand (§13av).
async function labelFor(record) {
  const typed = (record.label || '').trim();
  if (!typed) return await reserveLabel();
  const clash = (await wornLabels(record.id)).get(labelKey(typed));
  if (clash) {
    const err = new Error('label in use');
    err.clash = clash;
    throw err;
  }
  return typed;
}

function blank() {
  return newRecord({
    label: '',
    name: '',
    origin: 'new',
    originDetail: {},
    form: 'cut_piece',
    composition: [{ fibreCode: 'cotton', percent: 100 }],
    structure: 'plain',
    weightGsm: null,
    dimensions: '',
    weightG: null,
    quantity: { value: 1, unit: 'pcs' },
    baseColour: 'natural',
    state: 'unwashed',
    actions: [],
    stateEvents: [],
    notes: '',
    photoData: null,
    count: 1,
  });
}

// ---------------------------------------------------------------- list view

async function renderList(root) {
  const fabrics = await all('fabrics');

  // The box inventory: "what is in the mordanted box" is a query, not a
  // memory exercise (§3, A.1).
  //
  // The studio's five colours, read through the one derivation (§13gc), and
  // `finished` beside them, uncoloured: a finished piece has left the working
  // shelves, and its tag keeps the colour of the last stage it reached. So the
  // five count the pieces still in work, and „Завършен" counts the rest.
  const studioCtx = { trials: new Map((await all('trials')).map(x => [x.id, x])) };
  const studio = new Map(fabrics.map(f => [f.id, deriveStudioStatus(f, studioCtx)]));
  const counts = { finished: 0 };
  for (const f of fabrics) {
    const s = studio.get(f.id);
    if (s.finished) counts.finished++;
    else counts[s.code] = (counts[s.code] || 0) + 1;
  }
  const lang = getLang();
  const boxes = [
    ...STUDIO_STATUSES.map(st => `
    <button class="box studio${filterState === st.code ? ' active' : ''}" data-box="${st.code}" style="${studioStyle(st.hex)}">
      <span class="boxicon">${icon(st.icon)}</span>
      <span class="boxname"><b>${esc(st.code)}</b> ${esc(studioLabel(st, lang))}</span>
      <span class="boxcount">${counts[st.code] || 0}</span>
    </button>`),
    `
    <button class="box${filterState === 'finished' ? ' active' : ''}" data-box="finished">
      <span class="boxicon">${icon(STATE_ICONS.finished)}</span>
      <span class="boxname">${esc(await label('fabric_state', 'finished'))}</span>
      <span class="boxcount">${counts.finished}</span>
    </button>`];

  const inBox = (f) => {
    const s = studio.get(f.id);
    return filterState === 'finished' ? s.finished : (!s.finished && s.code === filterState);
  };
  const shown = (filterState
    ? fabrics.filter(inBox)
    : fabrics
  ).filter(f => matches(query, f.label, f.name, f.notes))
   .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  shownIds = shown.map(f => f.id);

  const rows = await Promise.all(shown.map(async f => {
    const compNames = await Promise.all((f.composition || []).map(async c =>
      `${c.percent}% ${await label('fibre', c.fibreCode)}`));
    const cured = daysSinceMordanted(f);
    return `<tr data-open="${f.id}">
      <td class="pick"><label class="pickbox"><input type="checkbox" data-pick="${f.id}"${selected.has(f.id) ? ' checked' : ''}></label></td>
      <td class="withthumb">${f.photoData ? `<img class="thumb" src="${f.photoData}" alt="">` : ''}
        <span class="mono">${esc(f.label || '')}</span></td>
      <td>${esc(f.name || '—')}</td>
      <td>${esc(compNames.join(' + '))}</td>
      <td>${esc(await label('fibre_class', fibreClass(f.composition)))}</td>
      <td>${esc(await label('fabric_structure', f.structure))}</td>
      <td class="num">${f.weightG ? f.weightG + ' ' + t('fabrics.grams') : '—'}</td>
      <td>${studioBadge(f, { ctx: studioCtx })}${await treatmentTags(f)}${
        cured != null ? `<span class="hint"> · ${t('common.days', { n: cured })}</span>` : ''}</td>
    </tr>`;
  }));

  const table = shown.length ? `
    <table class="grid">
      <thead><tr>
        <th class="pick"></th><th>${t('fabrics.col.label')}</th><th>${t('fabrics.col.name')}</th><th>${t('fabrics.col.composition')}</th><th>${t('fabrics.col.class')}</th>
        <th>${t('fabrics.col.structure')}</th><th class="num">${t('fabrics.col.weight')}</th><th>${t('fabrics.col.box')}</th>
      </tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>`
    : empty(
        filterState ? t('fabrics.emptyBox') : t('fabrics.empty'),
        t('fabrics.emptyHint'));

  // Two pieces already wearing one number cannot be fixed by the application:
  // one of them has that number written on a paper tag in the studio, and only
  // the person holding it can decide which tag to rewrite. Saying so is the
  // whole remedy — silently renaming a record would make the app and the shelf
  // disagree, which is worse than a duplicate that is visible (§13av).
  const byKey = new Map();
  for (const f of fabrics) {
    const key = labelKey(f.label);
    if (!key) continue;
    byKey.set(key, [...(byKey.get(key) || []), f]);
  }
  const clashes = [...byKey.values()].filter(g => g.length > 1);
  const clashNote = clashes.length ? `
    <p class="notice">${esc(t('fabrics.duplicateLabels', {
      list: clashes.map(g => `${g[0].label} (${g.map(f => f.name || '—').join(', ')})`).join(' · '),
    }))}</p>` : '';

  root.innerHTML = page({
    title: t('fabrics.title'),
    sub: t('fabrics.sub'),
    actions: `<button class="btn quiet" data-print-blank>${t('fabrics.printBlank')}</button>
              <button class="btn quiet" data-batch>${t('fabrics.groupAction')}</button>
              ${actionBtn('add', t('fabrics.new'), 'data-new', 'primary')}`,
    body: `
      ${clashNote}
      <div class="boxes">
        <button class="box${filterState === null ? ' active' : ''}" data-box="">
          <span class="boxname">${t('common.all')}</span>
          <span class="boxcount">${fabrics.length}</span>
        </button>
        ${boxes.join('')}
      </div>
      <div class="filterrow">${searchBox(query, t('fabrics.search'))}${
        shown.length ? `<button class="btn quiet" data-pick-all>${t('fabrics.pickAllShown')}</button>` : ''}</div>
      ${selected.size ? `
        <div class="bulkbar">
          <span>${t('fabrics.selected', { n: selected.size })}</span>
          <button class="btn primary" data-batch>${t('fabrics.groupAction')}</button>
          <button class="btn quiet" data-print-sheet="colour">${t('fabrics.printSheet')}</button>
          <button class="btn quiet" data-print-sheet="stage">${t('fabrics.printSheetStage')}</button>
          <button class="btn quiet" data-bulk-clear>${t('fabrics.clearSelection')}</button>
        </div>` : ''}
      ${panel(table, 'flush')}`,
  });
}

// ---------------------------------------------------------------- read view
//
// A fabric record is consulted far more than it is written: which box is it in,
// what is it made of, how long since it was mordanted, what has already been
// done to it. Its history is the point, so it reads as a biography rather than
// as a list of fields.

// The studio card on the record (§13gc): the working label as it will print,
// the way the piece has come in codes, and Print — in colour, or in ink for
// paper already the stage's colour. All of it read from the piece's actions.
// What §13ge's derivation reads, for the record's card and for a sheet.
async function sheetCtx() {
  return {
    recipes: new Map((await all('recipes')).map(x => [x.id, x])),
    trials: new Map((await all('trials')).map(x => [x.id, x])),
    plants: new Map((await all('plants')).map(x => [x.id, x])),
  };
}

async function studioCard(r) {
  const ctx = await sheetCtx();
  studioRead = { fabric: r, ctx };
  const trail = deriveProcessTrail(r, ctx, getLang());
  // The finishing is dated before something else done to the piece (§13gr):
  // the record is impossible and the stage read from it is not the piece's.
  // Said, with the way to the date that answers it — not repaired from here.
  const early = finishedBeforeTreatment(r);
  const earlyNote = early ? `<div class="note danger" role="note">
      <p>${esc(t('fabrics.finishedBefore'))}${early.trialId
        ? ` <a href="#/trials/${esc(early.trialId)}/finish">${esc(t('fabrics.finishedBeforeOpen'))}</a>` : ''}</p></div>` : '';
  return panel(`
    <h2>${t('fabrics.studio.label')}</h2>
    ${earlyNote}
    <div class="studiocard">
      ${workingLabel(r, ctx)}
      <div class="studioside">
        <p class="hint">${t('fabrics.studio.labelHint')}</p>
        <p><button class="btn quiet" data-print-label>${t('fabrics.studio.print')}</button></p>
        <h3>${t('fabrics.studio.trail')}</h3>
        <p class="mono studiotrail">${trail.text ? esc(trail.text) : `<span class="hint">${t('fabrics.studio.noTrail')}</span>`}${
          trail.finished ? ` <span class="chip">${esc(t('fabrics.studio.finished'))}</span>` : ''}</p>
      </div>
    </div>`) + processSummaryCard(r, ctx);
}

// The process summary (§13ge): what was done to this piece, in rows that can
// be copied onto a tag — only the rows the record can fill, in the order a
// person reads a piece: stage, preparation, technique, what coloured it, the
// plants, when. Derived on every draw; nothing of it is stored on the piece.
function processSummaryCard(r, ctx) {
  const lang = getLang();
  const p = deriveProcessSummary(r, ctx, lang);
  const row = (key, value) => value ? `<tr><th scope="row">${t('fabrics.summary.' + key)}</th><td>${value}</td></tr>` : '';
  const list = (xs) => xs && xs.length ? esc(xs.join(', ')) : '';
  const rows = [
    row('status', studioBadge(r, { ctx })),
    row('preparation', p.preparation ? `<span class="mono">${esc(p.preparation)}</span>` : ''),
    row('technique', p.technique ? esc(p.technique.label) : ''),
    row('paste', p.pasteCode ? `<span class="mono">${esc(p.pasteCode)}</span>` : ''),
    row('blanket', p.blanket?.material ? esc(p.blanket.material) : ''),
    row('blanketTreatment', p.blanket?.treatment ? esc(p.blanket.treatment) : ''),
    row('blanketBath', p.blanket?.bath ? esc(p.blanket.bath) : ''),
    row('dye', list(p.dye)),
    row('modifiers', p.modifiers ? esc(p.modifiers.map(m => codeWithName(m, lang)).join(', ')) : ''),
    row('plants', list(p.plants)),
    row('date', p.date ? esc(fmtDate(p.date)) : ''),
  ].join('');
  return `<div style="height:16px"></div>${panel(`
    <h2>${t('fabrics.summary.title')}</h2>
    <table class="facts processsummary"><tbody>${rows}</tbody></table>
    ${p.trialId ? `<p><button class="btn quiet" data-trial="${esc(p.trialId)}">${t('fabrics.summary.openTrial')}</button></p>` : ''}`)}`;
}

async function renderRead(root, r) {
  const qty = Number(r.quantity?.value) || 1;
  const children = (await all('fabrics')).filter(x => x.fromBatchId === r.id);
  const parent = r.fromBatchId ? await get('fabrics', r.fromBatchId) : null;
  const compNames = (await Promise.all((r.composition || []).map(async c =>
    `${c.percent}% ${await label('fibre', c.fibreCode)}`))).join(' + ');
  const cls = fibreClass(r.composition);
  const cured = daysSinceMordanted(r);

  const history = stateHistory(r);
  const timeline = history.length
    ? (await Promise.all(history.map(async e => `
        <li class="tl">
          <span class="tldot"></span>
          <div>
            <b>${await historyWhat(e)}</b>
            <span class="hint"> ${fmtDate(e.date)}</span>
            ${e.note ? `<div class="hint">${esc(e.note)}</div>` : ''}
          </div>
        </li>`))).join('')
    : '';

  const trials = (await all('trials')).filter(x => (x.fabricIds || []).includes(r.id));
  // The plans whose lines name this piece (§13gt) — read on open, never stored.
  const plansNaming = (await all('plans')).filter(p => (p.items || []).some(it =>
    Array.isArray(it?.fabricIds) && it.fabricIds.includes(r.id)));
  const planList = plansNaming.length
    ? `<ul class="history">${plansNaming.map(p => `<li><a href="#/plans/${esc(p.id)}"><b>${esc(p.title || t('plans.untitled'))}</b></a></li>`).join('')}</ul>`
    : '';
  const trialList = trials.length
    ? `<ul class="history">${trials.map(x =>
        `<li data-trial="${x.id}" style="cursor:pointer">
           <b>${esc(workSubtitle(x, [r]) || workTitle(x, [r]) || t('trials.one'))}</b>
           <span class="hint">${fmtDate(x.date)}</span>
           ${(x.status || 'complete') !== 'complete'
             ? `<span class="statuschip ${x.status}">${esc(t('trials.notFinished'))}</span>` : ''}
         </li>`).join('')}</ul>`
    : `<p class="hint">${t('fabrics.notUsed')}</p>`;

  // The whole life of the piece in pictures, in the order it happened. Not
  // three blocks that can show a before and an after but never a middle.
  const shots = photoTimeline(r, trials);
  const strip = shots.length > 1 ? `
    <div class="lifestrip">
      ${(await Promise.all(shots.map(async (p) => `
        <figure class="lifeshot">
          <img src="${p.src}" alt="">
          <figcaption>
            <span>${esc(p.stageCode
              ? await label('trial_stage', p.stageCode)
              : t('fabrics.shot.' + p.kind))}</span>
            <span class="hint">${fmtDate(p.date)}</span>
          </figcaption>
        </figure>`))).join('')}
    </div>` : '';

  // The cloth is the entry point (§8.0c). The natural question is "what is
  // happening with this garment", not "which trial was that" — so the piece
  // offers to continue its own story rather than sending the person to a
  // module to find it. An unfinished trial is continued; otherwise a new one
  // is started from what the cloth already knows about itself.
  const open = trials.find(x => (x.status || 'complete') !== 'complete');
  const continueBtn = open
    ? `<button class="btn primary" data-continue="${open.id}">${t('fabrics.continueStory')}</button>`
    : `<button class="btn primary" data-startstory>${t('fabrics.startStory')}</button>`;

  root.innerHTML = page({
    title: r.name || r.label || t('fabrics.one'),
    sub: r.label,
    actions: `${backTo('#/fabrics', t('nav.fabrics'))}
              ${actionBtn('edit', t('common.edit'), 'data-edit', 'primary')}
              ${continueBtn}`,
    body: `
      <div class="headline">
        ${r.photoData ? `<img src="${r.photoData}" alt="">` : ''}
        <div class="headlinebody">
          <h2>${esc(r.name || '—')} ${studioBadge(r, { ctx: { trials: new Map((await all('trials')).map(x => [x.id, x])) } })}</h2>
          <div class="latin">${esc(r.label || '')}</div>
          ${cured != null ? `<p class="hint">${t('fabrics.curedFor', { n: cured })}</p>` : ''}
          ${qty > 1 ? `<p class="hint">${t('fabrics.pieces', { n: qty })}</p>` : ''}
          ${parent ? `<p class="hint" data-open="${parent.id}" style="cursor:pointer">${t('fabrics.fromBatch', { label: esc(parent.label) })}</p>` : ''}
        </div>
      </div>

      ${await studioCard(r)}

      <div class="cols">
        <div class="col">
          ${readBlock(t('fabrics.readIdentity'), facts([
            fact(t('fabrics.readComposition'), `<b>${esc(compNames)}</b>`),
            fact(t('fabrics.col.class'), esc(await label('fibre_class', cls))),
            fact(t('fabrics.structure'), esc(await label('fabric_structure', r.structure))),
            fact(t('fabrics.form'), esc(await label('fabric_form', r.form))),
            fact(t('fabrics.weightG'), r.weightG ? `<b>${massWith(r.weightG)}</b>` : ''),
            fact(t('fabrics.dimensions'), esc(r.dimensions || '')),
            fact(t('fabrics.gsm'), r.weightGsm ? gsmWith(r.weightGsm) : ''),
            fact(t('fabrics.origin'), esc(r.origin === 'reclaimed'
              ? [t('fabrics.origin.reclaimed'), r.originDetail?.wasA, r.originDetail?.condition].filter(Boolean).join(' · ')
              : [t('fabrics.origin.new'), r.originDetail?.supplier].filter(Boolean).join(' · '))),
          ]))}
          ${readBlock(t('common.notes'), r.notes ? `<div class="prose"><p>${esc(r.notes)}</p></div>` : '')}
        </div>

        <div class="col">
          ${strip ? readBlock(t('fabrics.lifeInPhotos'), strip) : ''}
          ${readBlock(t('fabrics.biography'), timeline ? `<ul class="timeline">${timeline}</ul>` : '')}
          ${readBlock(t('fabrics.usedIn'), trialList)}
          ${planList ? readBlock(t('fabrics.inPlans'), planList) : ''}

          ${qty > 1 ? panel(`
            <h2>${t('fabrics.batch')} — ${t('fabrics.pieces', { n: qty })}</h2>
            <p class="note">${t('fabrics.splitLegacy')}</p>
            <p class="note">${t('fabrics.splitHint')}</p>
            <div class="mediumrow">
              <input type="number" min="1" max="${qty - 1}" value="1" data-splitcount>
              <button class="btn quiet" data-split>${t('fabrics.splitDo')}</button>
            </div>
          `) : ''}

          ${children.length ? readBlock(t('fabrics.splitOff'), `<ul class="history">${children.map(c =>
            `<li data-open="${c.id}" style="cursor:pointer"><b>${esc(c.label)}</b> <span class="hint">${esc(c.name || '')}</span></li>`).join('')}</ul>`) : ''}
        </div>
      </div>`,
  });
}

// ---------------------------------------------------------------- form view

async function compositionRows(composition) {
  const rows = await Promise.all(composition.map(async (c, i) => `
    <div class="comprow">
      <select data-comp-fibre="${i}">${await options('fibre', c.fibreCode, '—')}</select>
      <input type="number" min="0" max="100" step="0.5" value="${c.percent ?? ''}"
             data-comp-pct="${i}" aria-label="${t('fabrics.percent')}">
      <span class="pct">%</span>
      <button class="btn quiet" data-comp-del="${i}" aria-label="${t('fabrics.removeFibre')}">×</button>
    </div>`));
  return rows.join('');
}

async function derivedBlock(composition) {
  const cls = fibreClass(composition);
  const receptive = dyeReceptiveFraction(composition);
  const lines = [];

  if (cls) {
    lines.push(note(t('fabrics.derived', { cls: esc(await label('fibre_class', cls)), pct: receptive })));
  }
  for (const w of compositionWarnings(composition)) {
    if (w.code === 'total') {
      lines.push(note(t('fabrics.warn.total', { total: w.total }), 'error'));
    }
    if (w.code === 'mixed') {
      lines.push(note(t('fabrics.warn.mixed'), 'warn'));
    }
    if (w.code === 'synthetic_major') {
      lines.push(note(t('fabrics.warn.synthetic', { pct: w.percent }), 'warn'));
    }
  }
  return lines.join('');
}

async function renderForm(root, record) {
  const isNew = openId === 'new';

  const originFields = record.origin === 'reclaimed'
    ? field(t('fabrics.wasA'), `<input type="text" data-f="originDetail.wasA" value="${esc(record.originDetail?.wasA || '')}" placeholder="${t('fabrics.wasAPlaceholder')}">`) +
      field(t('fabrics.condition'), `<input type="text" data-f="originDetail.condition" value="${esc(record.originDetail?.condition || '')}">`)
    : field(t('fabrics.supplier'), `<input type="text" data-f="originDetail.supplier" value="${esc(record.originDetail?.supplier || '')}">`) +
      field(t('fabrics.purchaseDate'), `<input type="date" data-f="originDetail.purchaseDate" value="${esc(record.originDetail?.purchaseDate || '')}">`);

  const history = stateHistory(record);
  const historyRows = history.length
    ? (await Promise.all(history.map(async e => `
        <li><b>${await historyWhat(e)}</b>
        <span class="hint">${fmtDate(e.date)}</span></li>`))).join('')
    : `<li class="hint">${t('fabrics.noTransitions')}</li>`;

  root.innerHTML = page({
    title: isNew ? t('fabrics.new') : (record.name || record.label || t('fabrics.one')),
    sub: isNew ? t('fabrics.newSub') : record.label,
    actions: `${backTo('#/fabrics', t('nav.fabrics'))}
              <button class="btn primary" data-save>${t('common.save')}</button>`,
    body: `
      <div class="cols">
        <div class="col">
          ${panel(`
            <h2>${t('fabrics.identity')}</h2>
            <div class="photobox">
              ${record.photoData
                ? `<img class="plantphoto" src="${record.photoData}" alt="">
                   <button class="btn quiet" data-photo-del>${t('fabrics.removePhoto')}</button>`
                : `<label class="btn quiet" for="fabricphoto">${t('fabrics.addPhoto')}</label>`}
              <input type="file" id="fabricphoto" accept="image/*" hidden>
              <p class="hint">${t('fabrics.photoHint')}</p>
            </div>
            ${field(t('fabrics.label'), `<input type="text" data-f="label" class="mono"
                value="${esc(record.label || '')}" placeholder="${esc(await peekLabel())}">`,
              record.label ? t('fabrics.labelHint') : t('fabrics.labelPending'))}
            ${field(t('fabrics.name'), `<input type="text" data-f="name" value="${esc(record.name || '')}" placeholder="${t('fabrics.namePlaceholder')}">`)}
            ${field(t('fabrics.origin'), `<select data-f="origin">
                <option value="new"${record.origin === 'new' ? ' selected' : ''}>${t('fabrics.origin.new')}</option>
                <option value="reclaimed"${record.origin === 'reclaimed' ? ' selected' : ''}>${t('fabrics.origin.reclaimed')}</option>
              </select>`)}
            ${originFields}
            ${field(t('fabrics.form'), `<select data-f="form">${await options('fabric_form', record.form)}</select>`)}
            ${field(t('fabrics.structure'), `<select data-f="structure">${await options('fabric_structure', record.structure)}</select>`)}
            ${field(t('fabrics.baseColour'), `<select data-f="baseColour">
                <option value="natural"${record.baseColour === 'natural' ? ' selected' : ''}>${t('fabrics.colour.natural')}</option>
                <option value="bleached"${record.baseColour === 'bleached' ? ' selected' : ''}>${t('fabrics.colour.bleached')}</option>
                <option value="predyed"${record.baseColour === 'predyed' ? ' selected' : ''}>${t('fabrics.colour.predyed')}</option>
                <option value="dyed_by_me"${record.baseColour === 'dyed_by_me' ? ' selected' : ''}>${t('fabrics.colour.dyed_by_me')}</option>
              </select>`)}
          `)}

          ${panel(`
            <h2>${t('fabrics.composition')}</h2>
            <div class="complist">${await compositionRows(record.composition || [])}</div>
            ${actionBtn('add', t('fabrics.addFibre'), 'data-comp-add', 'contextual')}
            <div class="derived">${await derivedBlock(record.composition || [])}</div>
          `)}
        </div>

        <div class="col">
          ${panel(`
            <h2>${t('fabrics.measure')}</h2>
            ${field(t('fabrics.weightG'), `<input type="number" step="1" min="0" data-f="weightG" value="${record.weightG ?? ''}">`,
              t('fabrics.weightHint'))}
            ${field(t('fabrics.dimensions'), `<input type="text" data-f="dimensions" value="${esc(record.dimensions || '')}" placeholder="${t('fabrics.dimensionsPlaceholder')}">`)}
            ${field(t('fabrics.gsm'), `<input type="number" step="1" min="0" data-f="weightGsm" value="${record.weightGsm ?? ''}">`)}
            ${(Number(record.quantity?.value) || 1) > 1
              ? field(t('fabrics.quantity'),
                  `<input type="number" step="1" min="1" data-f="quantity.value" value="${record.quantity?.value ?? 1}">`,
                  t('fabrics.quantityLegacy'))
              : ''}
            ${isNew ? field(t('fabrics.count'), `<input type="number" step="1" min="1" max="50" data-f="count" value="${record.count ?? 1}">`, t('fabrics.countHint')) : ''}
          `)}

          ${panel(`
            <h2>${t('fabrics.boxHistory')}</h2>
            ${isNew
              ? field(t('fabrics.initialState'), `<select data-f="state">${await options('fabric_state', record.state, '')}</select>`,
                  t('fabrics.initialStateHint'))
              : `<p class="note">${t('fabrics.nowIn', { state: esc(await label('fabric_state', currentState(record))) })}</p>
                 <ul class="history">${historyRows}</ul>
                 <div class="addstate">
                   ${field(t('fabrics.newTransition'), `<select data-newstate data-saves-itself>${await transitionOptions(record)}</select>`,
                     eligibleFor('wash', record) ? '' : t('fabrics.washNotOffered'))}
                   ${field(t('common.date'), `<input type="date" data-newstate-date data-saves-itself value="${today()}">`)}
                   <button class="btn quiet" data-add-state>${t('fabrics.addTransition')}</button>
                 </div>`}
          `)}

          ${panel(`
            <h2>${t('common.notes')}</h2>
            ${field('', `<textarea data-f="notes" rows="4" placeholder="${t('fabrics.notesPlaceholder')}">${esc(record.notes || '')}</textarea>`)}
            ${!isNew ? `${actionBtn('delete', t('fabrics.delete'), 'data-delete', 'destructive')}` : ''}
          `)}
        </div>
      </div>`,
  });
}

// ------------------------------------------------------------------ wiring

function readForm(root) {
  for (const el of root.querySelectorAll('[data-f]')) {
    // A radio group renders one element per option, all carrying the same
    // `data-f`. Reading them all meant the LAST option always won, whichever
    // was actually chosen — segmented controls have been silently wrong.
    if (el.type === 'radio' && !el.checked) continue;
    const path = el.dataset.f.split('.');
    let target = draft;
    for (let i = 0; i < path.length - 1; i++) {
      target[path[i]] = target[path[i]] || {};
      target = target[path[i]];
    }
    const key = path[path.length - 1];
    let value = el.value;
    if (el.type === 'number') value = value === '' ? null : Number(value);
    target[key] = value;
  }
  const comp = [];
  for (const sel of root.querySelectorAll('[data-comp-fibre]')) {
    const i = sel.dataset.compFibre;
    const pct = root.querySelector(`[data-comp-pct="${i}"]`);
    if (sel.value) comp.push({ fibreCode: sel.value, percent: Number(pct.value) || 0 });
  }
  draft.composition = comp;
}

async function refreshDerived(root) {
  readForm(root);
  const box = root.querySelector('.derived');
  if (box) box.innerHTML = await derivedBlock(draft.composition);
}

export default {
  id: 'fabrics',
  title: () => t('fabrics.title'),
  sub: () => t('fabrics.sub'),

  // The address decides what is on screen (§13q). This module had no `open()`
  // at all: `#/fabrics/<id>` named a record it never heard about, and the piece
  // being looked at lived in a module variable instead. Every other module was
  // converted in §13ad; this one was missed, so a piece could not be reloaded,
  // bookmarked or sent to anyone, and the back button walked out of the module
  // rather than back to the list (§13av).
  //
  //   #/fabrics                the list
  //   #/fabrics/new            a new piece
  //   #/fabrics/<id>           the piece, read
  //   #/fabrics/<id>/edit      the piece, editable
  open(first, second) {
    draft = null;
    openId = first || null;
    editing = first === 'new' || second === 'edit';
  },

  // Choosing a module in the navigation means "take me to this module", not
  // "show me whatever I last had open in it". Called by the router on entry.
  reset() {
    openId = null;
    draft = null;
    editing = false;
    filterState = null;
    query = '';
    selected.clear();
  },

  async render(root) {
    if (openId) {
      if (!draft || (openId !== 'new' && draft.id !== openId)) {
        draft = openId === 'new' ? blank() : structuredClone(await get('fabrics', openId));
      }
      // An address naming a record that is gone — a bookmark to something
      // deleted, or the back button after deleting it. Drawing it throws, and a
      // thrown render leaves the previous screen in place, which reads as the
      // address being ignored (§11b). The list is the honest answer.
      if (!draft) return navigate('#/fabrics');
      if (editing || openId === 'new') await renderForm(root, draft);
      else await renderRead(root, draft);
    } else {
      draft = null;
      await renderList(root);
    }

    root.onclick = async (e) => {
      const box = e.target.closest('[data-box]');
      if (box) { filterState = box.dataset.box || null; return this.render(root); }

      if (e.target.closest('[data-new]')) return navigate('#/fabrics/new');
      if (e.target.closest('[data-edit]')) return navigate(`#/fabrics/${openId}/edit`);
      const pr = e.target.closest('[data-print-label]');
      if (pr && studioRead) return printWorkingLabel(studioRead.fabric, studioRead.ctx);

      // Handing off to the trial. Everything needed travels in the address —
      // no hidden channel — so the back button, a reload and a bookmark all
      // behave, and the new trial can read the cloth's own name and weight
      // rather than opening by asking what it already knows.
      const cont = e.target.closest('[data-trial], [data-continue]');
      if (cont) {
        navigate('#/trials/' + (cont.dataset.continue || cont.dataset.trial));
        return;
      }
      if (e.target.closest('[data-startstory]')) {
        // Open work on this piece wins over starting new work on it (§13bj).
        // Derived here rather than stored: no back-references in the data.
        const open = (await all('trials'))
          .filter(tr => (tr.fabricIds || []).includes(draft.id) && tr.status !== 'complete')
          .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        navigate(open.length ? '#/trials/' + open[0].id : '#/trials/new/' + draft.id);
        return;
      }

      // A tick is not an open. The checkbox sits inside the row, so its click
      // bubbled up to the row's `[data-open]` and the record opened instead of
      // the piece being selected — which meant the bulk bar never appeared and
      // a group action could not be gathered at all. Reported from real use and
      // reproduced before it was touched.
      if (e.target.closest('[data-pick], .pickbox')) return;

      const row = e.target.closest('[data-open]');
      if (row) return navigate(`#/fabrics/${row.dataset.open}`);

      if (e.target.closest('[data-back]')) {
        // From the form back to reading the piece; from the piece back to the
        // list. Both are addresses now, so the browser's own back button walks
        // the same path.
        return navigate(editing && openId !== 'new' ? `#/fabrics/${openId}` : '#/fabrics');
      }

      if (e.target.closest('[data-comp-add]')) {
        readForm(root);
        draft.composition.push({ fibreCode: '', percent: 0 });
        return renderForm(root, draft);
      }

      const del = e.target.closest('[data-comp-del]');
      if (del) {
        readForm(root);
        draft.composition.splice(Number(del.dataset.compDel), 1);
        return renderForm(root, draft);
      }

      if (e.target.closest('[data-add-state]')) {
        const code = root.querySelector('[data-newstate]').value;
        const date = root.querySelector('[data-newstate-date]').value;
        if (!code) return;
        // A box with no action behind it — `unwashed` — is not a change that
        // can be made (§13fo). It is no longer offered; this refuses it if
        // chosen anyway, instead of writing `other` as it used to.
        const action = ACTION_FOR_STATE[code];
        if (!action) return flash(t('fabrics.notATransition'));
        // The saved piece, not the form. The change of box is its own act and
        // is written at once; what is typed in the form and not saved stays
        // unsaved (§13fo). Eligibility is judged on the saved history too.
        const saved = await get('fabrics', draft.id);
        if (!saved) return flash(t('fabrics.notATransition'));
        // The same rule as the group action (§13fn): a piece already past
        // „washed" is not washed back into it.
        if (!eligibleFor(action, saved)) return flash(t('fabrics.washNotOffered'));
        // The form is read into the draft — only so the redraw below shows
        // what she typed. Nothing of it is written here.
        readForm(root);
        // Written to `actions` like everything else (§13bd). A hand-entered
        // change of state is still one action on one piece, so it gets a batch
        // of one — and the batch and the action are written in one
        // transaction, so neither exists without the other.
        const batch = newRecord({
          actionCode: action, date, recipeId: null, chainId: null,
          fabricIds: [saved.id], totalWeightG: saved.weightG ?? null,
          deviation: '', note: '',
        });
        const entry = {
          id: uid(), fabricId: saved.id, actionCode: action,
          fromStateCode: code, date,
          recipeId: null, chainId: null, trialId: null, batchId: batch.id,
          note: '', deviation: '', observation: '',
          createdAt: new Date().toISOString(),
        };
        const patched = { ...saved, actions: [...(saved.actions || []), entry] };
        try {
          await putTogether([['batchActions', batch], ['fabrics', patched]]);
        } catch (err) {
          return flash(t('fabrics.transitionFailed'));
        }
        // The draft takes the saved history, so a later Save writes [A, B] and
        // not the stale [A] it was opened with. Its other fields — the unsaved
        // ones — are left exactly as typed, and so is the unsaved mark.
        draft.actions = patched.actions;
        return renderForm(root, draft);
      }

      if (e.target.closest('[data-photo-del]')) {
        readForm(root);
        draft.photoData = null;
        return renderForm(root, draft);
      }

      if (e.target.closest('[data-bulk-clear]')) { selected.clear(); return this.render(root); }

      // A sheet of labels (§13gq). Selection survives the print: she may want
      // the other variant of the same pieces next.
      if (e.target.closest('[data-pick-all]')) {
        for (const id of shownIds) selected.add(id);
        return this.render(root);
      }
      const sheet = e.target.closest('[data-print-sheet]');
      if (sheet && selected.size) {
        const ctx = await sheetCtx();
        const chosen = (await all('fabrics')).filter(f => selected.has(f.id));
        const mode = sheet.dataset.printSheet === 'stage' ? 'stage' : 'colour';
        return printSheet(sheetHtml(sheetPages(chosen, ctx, mode, getLang()), { ink: mode === 'stage' }));
      }
      if (e.target.closest('[data-print-blank]')) {
        const prefix = await getSetting('fabricLabelPrefix', 'П');
        return printSheet(sheetHtml(blankPages(prefix, getLang())));
      }

      // Fifteen pieces into one mordant bath is one action, not fifteen. Doing
      // it record by record is where the habit of recording dies.
      // The bulk bar used to write one state event per piece from a dropdown,
      // with no recipe, no weight and no record that the bath was shared. That
      // is the copying §13bd exists to end: it goes to the group action, which
      // writes one batch the pieces point at. The ticks travel in the address
      // rather than in a module variable, so the screen can be reloaded.
      if (e.target.closest('[data-batch]')) {
        const ids = [...selected].join(',');
        selected.clear();
        return navigate('#/batch' + (ids ? '?pieces=' + ids : ''));
      }

      // Ten identical scarves stay one record until one of them stops being
      // identical. Splitting a piece off — rather than creating ten records up
      // front — matches when the divergence actually happens.
      if (e.target.closest('[data-split]')) {
        const n = Math.max(1, Math.min(
          (Number(draft.quantity?.value) || 1) - 1,
          Number(root.querySelector('[data-splitcount]')?.value) || 1));

        for (let i = 0; i < n; i++) {
          const piece = structuredClone(draft);
          piece.id = uid();
          piece.label = await reserveLabel();
          piece.quantity = { value: 1, unit: draft.quantity?.unit || 'pcs' };
          piece.fromBatchId = draft.id;
          // A piece cut from a batch starts its own biography empty.
          piece.actions = [];
          // …and remembers what had been done to the whole before the cut
          // (rc95): the ids of the parent's actions recorded at this moment,
          // plus what the parent had itself inherited. References, not copies;
          // written once, so the parent's later work is never inherited.
          piece.inheritedActionIds = [...new Set([
            ...(draft.inheritedActionIds || []),
            ...(draft.actions || []).map(a => a.id).filter(Boolean),
          ])];
          piece.stateEvents = [];
          piece.createdAt = new Date().toISOString();
          await put('fabrics', piece);
        }

        draft.quantity = { ...draft.quantity, value: (Number(draft.quantity?.value) || 1) - n };
        await put('fabrics', draft);
        alert(t('fabrics.splitDone', { n, left: draft.quantity.value }));
        return this.render(root);
      }

      if (e.target.closest('[data-save]')) {
        readForm(root);
        // The number is taken here and nowhere earlier, so opening the form
        // and thinking better of it costs nothing and leaves no gap.
        try {
          draft.label = await labelFor(draft);
        } catch (err) {
          if (!err.clash) throw err;
          // Naming the other piece, because "that number is taken" without
          // saying by what leaves her to search for it by hand.
          alert(t('fabrics.labelTaken', {
            label: (draft.label || '').trim(),
            name: err.clash.name || t('fabrics.one'),
          }));
          return;
        }
        const total = compositionTotal(draft.composition);
        if (draft.composition.length && Math.round(total) !== 100 &&
            !confirm(t('fabrics.confirmTotal', { total }))) return;
        // Ten identical scarves really are ten pieces: each gets washed,
        // mordanted and used on its own schedule. What was missing was not a
        // quantity field but a way to create them in one go.
        const count = Math.max(1, Math.min(50, Number(draft.count) || 1));
        delete draft.count;

        if (openId === 'new' && count > 1) {
          // Ten separate records ARE the ten pieces, so each holds one. Copying
          // the entered quantity onto every copy made all ten look like batches
          // of ten, and the split panel appeared on each — two mechanisms for
          // one idea, contradicting each other.
          draft.quantity = { ...(draft.quantity || {}), value: 1 };
          const labels = [draft.label];
          await put('fabrics', draft);
          for (let i = 1; i < count; i++) {
            const copy = structuredClone(draft);
            copy.id = uid();
            copy.label = await reserveLabel();
            copy.createdAt = new Date().toISOString();
            labels.push(copy.label);
            await put('fabrics', copy);
          }
          alert(t('fabrics.created', { n: count, from: labels[0], to: labels[labels.length - 1] }));
          markClean();
          return navigate('#/fabrics');
        }

        // A rename takes back the copies of the old name (§13gk). Until rc135
        // a new piece of work copied the cloth's name into its own title, and
        // a copy does not follow the original: the work then showed the old
        // name beside the new one. Work on THIS cloth whose title is exactly
        // the old name has its title emptied, so it is called by the cloth
        // again. Exactly equal only — a title with any word of her own is hers
        // and is not touched. One act, one transaction.
        const before = openId !== 'new' ? await get('fabrics', draft.id) : null;
        const oldName = (before?.name || before?.label || '').trim();
        const newName = (draft.name || draft.label || '').trim();
        const copies = before && oldName && oldName !== newName
          ? (await all('trials')).filter(tr => (tr.fabricIds || []).includes(draft.id)
              && (tr.title || '').trim() === oldName)
          : [];
        if (copies.length) {
          await putTogether([['fabrics', draft], ...copies.map(tr => ['trials', { ...tr, title: '' }])]);
        } else {
          await put('fabrics', draft);
        }
        markClean();
        // Saving returns to reading the record, not to the form it was just
        // written in — otherwise a new piece leaves one staring at empty fields.
        if (openId !== 'new') flash(t('common.saved'));
        return navigate(`#/fabrics/${draft.id}`);
      }

      if (e.target.closest('[data-delete]')) {
        // Guarded (§13cq): a record the history points at is refused, with a
        // count of what points at it. No cascade — see refs.js.
        if (!await deleteGuarded('fabrics', draft.id, t('fabrics.confirmDelete'))) return;
        return navigate('#/fabrics');
      }
    };

    root.onchange = async (e) => {
      const pick = e.target.closest('[data-pick]');
      if (pick) {
        pick.checked ? selected.add(pick.dataset.pick) : selected.delete(pick.dataset.pick);
        return this.render(root);
      }

      if (e.target.id === 'fabricphoto' && e.target.files?.[0]) {
        readForm(root);
        draft.photoData = await shrinkThumb(e.target.files[0]);
        return renderForm(root, draft);
      }

      if (e.target.matches('[data-f="origin"]')) {
        readForm(root);
        return renderForm(root, draft);
      }
      if (e.target.matches('[data-comp-fibre]')) await refreshDerived(root);
    };

    root.oninput = async (e) => {
      // The list's search. Not part of the record form, so it is read here and
      // not by `readForm` — and `selected` is untouched by it, because a tick
      // must survive a search that hides the row it was made on.
      const find = e.target.closest('[data-search]');
      if (find && !openId) { query = find.value; return this.render(root); }

      if (e.target.matches('[data-comp-pct]')) await refreshDerived(root);
    };

  },
};
