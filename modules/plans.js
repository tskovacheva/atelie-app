// modules/plans.js — Plans (§13fj).
//
// What she means to try, why, and which variants — before any of it is a
// trial. The rest of the diary records what was done; a plan records intent.
// Deliberately small: a title, a status, notes, and a checklist of plain lines.
// A line is text and a tick, never a structured experiment — „N5 — Nikolleta
// with 5 g Fe" is written the way she would write it on paper.
//
// v1 had no links. Since rc144 (§13gt) a line may NAME PIECES of cloth
// (`item.fabricIds`) and carry DETAILS (`item.details`, free text) — both
// optional, absent on every line written before. The works that used a named
// piece are found on open, never stored. „This line → a work" is still to come.

import { all, get, put, uid } from '../db.js';
import { t } from '../i18n.js';
import { markClean, markDirty } from '../dirty.js';
import { shrinkResult } from '../photo.js';
import { page, panel, field, esc, empty, navigate, backTo, actionBtn, fmtDate,
         deleteGuarded, flash } from '../ui.js';
import { studioBadge } from '../studio-ui.js';
import { workTitle } from '../fabric-logic.js';

// The four states, in the order a plan moves through them. Interface labels
// only (i18n.js, `plans.status.*`) — not vocabulary: nothing else in the model
// reads them, and they are not reference data.
export const PLAN_STATUSES = ['idea', 'planned', 'active', 'done'];

// Drawn with the trial's status chip rather than a new one. `idea` takes the
// plain chip: it has not been committed to yet, which is what an unaccented
// chip says.
const CHIP = { idea: '', planned: 'planned', active: 'in_progress', done: 'complete' };

let openId = null;
let mode = 'list';     // 'list' | 'view' | 'edit' (§13gb)
let draft = null;

// A source is an address someone can follow, and nothing else (§13gb). http(s)
// as typed; a bare „facebook.com/…" gains https://; any other scheme —
// javascript:, data:, file: — is refused, at Save and again when drawn, since a
// restored backup can carry anything.
export function normaliseUrl(raw) {
  const v = String(raw || '').trim();
  if (!v) return { ok: true, url: '' };
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : (/^[^\s/]+\.[^\s]+/.test(v) ? 'https://' + v : v);
  try {
    const u = new URL(withScheme);
    return /^https?:$/.test(u.protocol) && u.hostname ? { ok: true, url: u.href } : { ok: false, url: v };
  } catch { return { ok: false, url: v }; }
}

// The whole record. Nothing else is added to it — no provenance fields: a plan
// is never seeded, never packed, never distributed.
//
// v1.1 (§13gb) adds three OPTIONAL fields, absent on every plan written before:
// `sourceLabel` and `sourceUrl` — where the idea came from — and
// `referenceImage`, one picture of it, a JPEG data URL made by photo.js exactly
// as a trial's result photograph is. In the record, so it is in every backup
// and goes when the plan goes. A plan without them is a complete plan.
export function blankPlan() {
  const now = new Date().toISOString();
  return { id: uid(), title: '', createdAt: now, updatedAt: now,
           status: 'idea', notes: '', items: [],
           sourceLabel: '', sourceUrl: '', referenceImage: '' };
}

export const progressOf = (p) => {
  const items = Array.isArray(p?.items) ? p.items : [];
  return { done: items.filter(i => i.checked).length, of: items.length };
};

const statusOf = (p) => PLAN_STATUSES.includes(p?.status) ? p.status : 'idea';
const chip = (p) =>
  `<span class="statuschip ${CHIP[statusOf(p)]}">${esc(t('plans.status.' + statusOf(p)))}</span>`;

// ---- list -----------------------------------------------------------------

async function renderList(root) {
  const plans = await all('plans');
  // Open plans first, newest touched first; finished ones after them. The list
  // is a working surface, and a done plan is reference rather than work.
  const rank = (p) => statusOf(p) === 'done' ? 1 : 0;
  plans.sort((a, b) => rank(a) - rank(b)
    || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));

  const rows = plans.map(p => {
    const { done, of } = progressOf(p);
    return `
      <tr data-open="${esc(p.id)}">
        <td class="leadcell">${esc(p.title || t('plans.untitled'))}</td>
        <td>${chip(p)}</td>
        <td class="num">${of ? `${done} / ${of}` : '—'}</td>
        <td>${esc(fmtDate(p.updatedAt || p.createdAt))}</td>
      </tr>`;
  }).join('');

  root.innerHTML = page({
    title: t('plans.title'),
    sub: t('plans.sub'),
    actions: actionBtn('add', t('plans.new'), 'data-new', 'primary'),
    body: plans.length
      ? panel(`
          <table class="grid">
            <thead><tr>
              <th>${t('plans.titleLabel')}</th>
              <th>${t('plans.statusLabel')}</th>
              <th class="num">${t('plans.progress')}</th>
              <th>${t('plans.updated')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>`, 'flush')
      : empty(t('plans.empty'), t('plans.emptyHint')),
  });
}

// ---- one plan, to read -------------------------------------------------------
//
// What opening a plan shows (§13gb): the plan as it stands, not a form. The
// checklist's ticks still work here — a tick is a finished act and is written
// at once (§13fk), which is the one change a plan takes without „Edit"; the
// words of a line, the title, the notes and the source are changed in the
// editor. Nothing here is a disabled form control.

function sourceBlock(p) {
  const { ok, url } = normaliseUrl(p.sourceUrl);
  const label = String(p.sourceLabel || '').trim();
  if (!label && !(ok && url)) return '';
  const link = ok && url
    ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(t('plans.openSource'))}</a>` : '';
  return `
    <h2>${t('plans.source')}</h2>
    ${label ? `<p>${esc(label)}</p>` : ''}
    ${link ? `<p>${link}</p>` : ''}
    ${!label && link ? `<p class="hint">${esc(new URL(url).hostname)}</p>` : ''}`;
}

// What a line names and says, as read (§13gt): its details, and each piece
// with its stage now and the works that used it — found by reading the works,
// on open. A piece that is gone is said to be gone.
const piecesOf = (it) => Array.isArray(it?.fabricIds) ? it.fabricIds.filter(Boolean) : [];
const detailsOf = (it) => String(it?.details || '').trim();

async function lineContext() {
  const fabrics = await all('fabrics');
  const trials = await all('trials');
  return {
    fabrics: new Map(fabrics.map(f => [f.id, f])),
    trials,
    ctx: {
      trials: new Map(trials.map(x => [x.id, x])),
      recipes: new Map((await all('recipes')).map(x => [x.id, x])),
      plants: new Map((await all('plants')).map(x => [x.id, x])),
    },
  };
}

function lineBody(it, lc) {
  const details = detailsOf(it);
  const pieces = piecesOf(it).map(id => {
    const f = lc.fabrics.get(id);
    if (!f) return `<li class="planpiece gone"><span class="hint">${esc(t('plans.pieceGone'))}</span></li>`;
    const works = lc.trials.filter(x => (x.fabricIds || []).includes(id))
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    return `<li class="planpiece">
      <a href="#/fabrics/${esc(id)}"><b class="mono">${esc(f.label || '—')}</b> ${esc(f.name || '')}</a>
      ${studioBadge(f, { ctx: lc.ctx })}
      ${works.length ? `<ul class="planworks">${works.map(x => `<li><a href="#/trials/${esc(x.id)}">${
        esc(String(x.title || '').trim() || workTitle(x, [f]) || t('trials.one'))}</a> <span class="hint">${esc(fmtDate(x.finishedOn || x.date))}</span>${
        (x.status || 'complete') !== 'complete' ? ` <span class="statuschip ${esc(x.status)}">${esc(t('trials.notFinished'))}</span>` : ''}</li>`).join('')}</ul>`
        : `<div class="hint">${esc(t('plans.pieceNoWork'))}</div>`}
    </li>`;
  }).join('');
  if (!details && !pieces) return '';
  return `<div class="planline">
    ${details ? `<div class="plandetails">${esc(details).replace(/\n/g, '<br>')}</div>` : ''}
    ${pieces ? `<ul class="planpieces">${pieces}</ul>` : ''}
  </div>`;
}

function renderView(root, p, lc) {
  const { done, of } = progressOf(p);
  const items = p.items.map((it, i) => `
    <div class="checkitem${it.checked ? ' ticked' : ''}">
      <label class="check"><input type="checkbox" data-i="${i}.checked" data-saves-itself${it.checked ? ' checked' : ''}
        aria-label="${esc(t('plans.itemDone'))}"></label>
      <span class="checktext">${esc(it.text)}</span>
    </div>${lineBody(it, lc)}`).join('');
  const notes = String(p.notes || '').trim();
  const source = sourceBlock(p);

  root.innerHTML = page({
    title: p.title || t('plans.untitled'),
    sub: '',
    actions: `${backTo('#/plans', t('plans.title'))}
              <button class="btn primary" data-edit>${t('plans.edit')}</button>`,
    body: `
      <div class="cols">
        <div class="col">
          ${panel(`
            <p>${chip(p)}</p>
            ${notes ? `<div class="plannotes">${esc(notes).replace(/\n/g, '<br>')}</div>`
                    : `<p class="hint">${t('plans.noNotes')}</p>`}
            <p class="hint">${esc(t('plans.updated'))}: ${esc(fmtDate(p.updatedAt || p.createdAt))}</p>
          `)}
          ${source ? `<div style="height:16px"></div>${panel(source)}` : ''}
          ${p.referenceImage ? `<div style="height:16px"></div>${panel(`
            <h2>${t('plans.referenceImage')}</h2>
            <img class="planref" src="${esc(p.referenceImage)}" alt="${esc(t('plans.referenceImageAlt'))}">`)}` : ''}
        </div>
        <div class="col">
          ${panel(`
            <h2>${t('plans.checklist')}${of ? ` <span class="hint">${done} / ${of}</span>` : ''}</h2>
            ${of ? `<div class="checklist">${items}</div>` : `<p class="hint">${t('plans.checklistEmpty')}</p>`}
          `)}
        </div>
      </div>`,
  });
}

// ---- one plan, to edit -------------------------------------------------------

function renderPlan(root, p, lc) {
  const isNew = openId === 'new';
  const { done, of } = progressOf(p);
  // Her pieces, by tag number, for the select under each line (§13gt).
  const choosable = [...lc.fabrics.values()].sort((a, b) =>
    String(a.label || '').localeCompare(String(b.label || ''), undefined, { numeric: true }));

  const items = p.items.map((it, i) => {
    const mine = piecesOf(it);
    const chosen = mine.map(id => {
      const f = lc.fabrics.get(id);
      return `<button class="btn quiet planpick" data-piece-del="${i}.${esc(id)}"
        aria-label="${esc(t('plans.pieceRemove', { label: f?.label || '—' }))}">${esc(f ? f.label : t('plans.pieceGone'))} ×</button>`;
    }).join('');
    const offer = choosable.filter(f => !mine.includes(f.id));
    return `
    <div class="checkitem${it.checked ? ' ticked' : ''}">
      <label class="check"><input type="checkbox" data-i="${i}.checked" data-saves-itself${it.checked ? ' checked' : ''}
        aria-label="${esc(t('plans.itemDone'))}"></label>
      <input type="text" data-i="${i}.text" value="${esc(it.text)}"
        aria-label="${esc(t('plans.itemText'))}" placeholder="${esc(t('plans.itemPlaceholder'))}">
      <button class="btn quiet" data-item-del="${i}" aria-label="${esc(t('plans.itemDelete'))}">×</button>
    </div>
    <div class="planline edit">
      <textarea data-i="${i}.details" rows="3" aria-label="${esc(t('plans.details'))}"
        placeholder="${esc(t('plans.detailsPlaceholder'))}">${esc(it.details || '')}</textarea>
      <div class="planpicks">${chosen}${offer.length ? `<select data-piece-add="${i}" aria-label="${esc(t('plans.pieceAdd'))}">
        <option value="">${esc(t('plans.pieceAdd'))}</option>
        ${offer.map(f => `<option value="${esc(f.id)}">${esc(f.label || '—')} · ${esc(f.name || '')}</option>`).join('')}
      </select>` : ''}</div>
    </div>`;
  }).join('');

  root.innerHTML = page({
    title: isNew ? t('plans.new') : (p.title || t('plans.untitled')),
    sub: isNew ? t('plans.sub') : '',
    actions: `${isNew ? backTo('#/plans', t('plans.title')) : backTo(`#/plans/${p.id}`, p.title || t('plans.untitled'))}
              <button class="btn primary" data-save>${t('common.save')}</button>`,
    body: `
      <div class="cols">
        <div class="col">
          ${panel(`
            ${field(t('plans.titleLabel'), `<input type="text" data-f="title" value="${esc(p.title)}"
              placeholder="${esc(t('plans.titlePlaceholder'))}">`)}
            ${field(t('plans.statusLabel'), `<select data-f="status">${PLAN_STATUSES.map(s =>
              `<option value="${s}"${statusOf(p) === s ? ' selected' : ''}>${esc(t('plans.status.' + s))}</option>`).join('')}</select>`)}
            ${field(t('plans.notes'), `<textarea data-f="notes" rows="6"
              placeholder="${esc(t('plans.notesPlaceholder'))}">${esc(p.notes)}</textarea>`)}
          `)}
          <div style="height:16px"></div>
          ${panel(`
            <h2>${t('plans.source')}</h2>
            ${field(t('plans.sourceLabel'), `<input type="text" data-f="sourceLabel" value="${esc(p.sourceLabel || '')}"
              placeholder="${esc(t('plans.sourceLabelPlaceholder'))}">`)}
            ${field(t('plans.sourceUrl'), `<input type="text" inputmode="url" autocomplete="off" data-f="sourceUrl"
              value="${esc(p.sourceUrl || '')}" placeholder="https://">`, t('plans.sourceUrlHint'))}
          `)}
          <div style="height:16px"></div>
          ${panel(`
            <h2>${t('plans.referenceImage')}</h2>
            ${p.referenceImage
              ? `<img class="planref" src="${esc(p.referenceImage)}" alt="${esc(t('plans.referenceImageAlt'))}">
                 <div style="height:8px"></div>
                 <label class="btn">${t('plans.referenceImageReplace')}<input type="file" accept="image/*" data-refimg hidden></label>
                 <button class="btn quiet" data-refimg-remove>${t('plans.referenceImageRemove')}</button>`
              : `<p class="hint">${t('plans.referenceImageHint')}</p>
                 <label class="btn">${t('plans.referenceImageAdd')}<input type="file" accept="image/*" data-refimg hidden></label>`}
          `)}
          ${!isNew ? `<div style="height:16px"></div>${panel(
            actionBtn('delete', t('plans.delete'), 'data-delete', 'destructive'))}` : ''}
        </div>
        <div class="col">
          ${panel(`
            <h2>${t('plans.checklist')}${of ? ` <span class="hint">${done} / ${of}</span>` : ''}</h2>
            ${of ? `<div class="checklist">${items}</div>` : `<p class="hint">${t('plans.checklistEmpty')}</p>`}
            <div style="height:10px"></div>
            ${actionBtn('add', t('plans.addItem'), 'data-item-add')}
          `)}
        </div>
      </div>`,
  });
}

let tickQueue = Promise.resolve();

// Writes one line's tick into the stored plan. Returns true when written.
export async function persistTick(planId, itemId, checked) {
  try {
    const stored = await get('plans', planId);
    const line = stored?.items?.find(i => i.id === itemId);
    if (!line) { markDirty(); return false; }   // nothing stored yet: it goes with Save
    line.checked = checked;
    const written = await put('plans', stored);   // stamps updatedAt
    if (draft?.id === planId) draft.updatedAt = written?.updatedAt ?? stored.updatedAt;
    return true;
  } catch (err) {
    // The tick is still in the draft, so Save will carry it; say so rather
    // than let a tick look saved that is not.
    markDirty();
    flash(t('plans.tickFailed'));
    return false;
  }
}

function readForm(root) {
  for (const el of root.querySelectorAll('[data-f]')) draft[el.dataset.f] = el.value;
  if (!PLAN_STATUSES.includes(draft.status)) draft.status = 'idea';
  for (const el of root.querySelectorAll('[data-i]')) {
    const [i, key] = el.dataset.i.split('.');
    const it = draft.items[Number(i)];
    if (!it) continue;
    if (key === 'checked') it.checked = el.checked;
    else if (key === 'details') { if (el.value.trim() || it.details) it.details = el.value; }
    else it.text = el.value;
  }
}

export default {
  id: 'plans',
  title: () => t('plans.title'),
  sub: () => t('plans.sub'),

  // `#/plans` the list; `#/plans/<id>` the plan to read; `#/plans/<id>/edit`
  // and `#/plans/new` the editor (§13gb).
  open(first, second) {
    draft = null; openId = first || null;
    mode = !openId ? 'list' : (openId === 'new' || second === 'edit') ? 'edit' : 'view';
  },
  reset() { openId = null; draft = null; mode = 'list'; },

  async render(root) {
    if (openId) {
      if (!draft || (openId !== 'new' && draft.id !== openId)) {
        draft = openId === 'new' ? blankPlan() : structuredClone(await get('plans', openId));
      }
      // An address naming a plan that is gone: back to the list rather than a
      // throw that leaves the previous screen up (§11b).
      if (!draft) return navigate('#/plans');
      draft.items = Array.isArray(draft.items) ? draft.items : [];
      const lc = await lineContext();
      if (mode === 'view') renderView(root, draft, lc); else renderPlan(root, draft, lc);
    } else {
      draft = null;
      await renderList(root);
    }

    root.onclick = async (e) => {
      if (e.target.closest('a')) return;
      if (e.target.closest('[data-new]')) return navigate('#/plans/new');
      const row = e.target.closest('[data-open]');
      if (row) return navigate(`#/plans/${row.dataset.open}`);
      if (!draft) return;
      if (e.target.closest('[data-edit]')) return navigate(`#/plans/${draft.id}/edit`);
      if (mode === 'view') return;
      if (e.target.closest('[data-refimg-remove]')) {
        readForm(root);
        draft.referenceImage = '';
        markDirty();
        return this.render(root);
      }
      if (e.target.closest('[data-save]')) {
        readForm(root);
        draft.title = draft.title.trim();
        draft.sourceLabel = String(draft.sourceLabel || '').trim();
        const src = normaliseUrl(draft.sourceUrl);
        if (!src.ok) { flash(t('plans.sourceUrlInvalid')); root.querySelector('[data-f="sourceUrl"]')?.focus(); return; }
        draft.sourceUrl = src.url;
        // A line with no words is a line nobody wrote; it is not kept.
        draft.items = draft.items.filter(it => String(it.text || '').trim());
        await put('plans', draft);
        markClean();   // the put succeeded; leaving is not a departure from unsaved work (§13ad)
        // Back to the plan just saved, as it now reads (§13gb).
        return navigate(`#/plans/${draft.id}`);
      }
      if (e.target.closest('[data-item-add]')) {
        readForm(root);
        draft.items.push({ id: uid(), text: '', checked: false });
        this.render(root);
        const inputs = root.querySelectorAll('.checkitem input[type=text]');
        inputs[inputs.length - 1]?.focus();
        return;
      }
      const pdel = e.target.closest('[data-piece-del]');
      if (pdel) {
        readForm(root);
        const [i, id] = [pdel.dataset.pieceDel.slice(0, pdel.dataset.pieceDel.indexOf('.')),
                         pdel.dataset.pieceDel.slice(pdel.dataset.pieceDel.indexOf('.') + 1)];
        const it = draft.items[Number(i)];
        if (it) it.fabricIds = piecesOf(it).filter(x => x !== id);
        markDirty();
        return this.render(root);
      }
      const del = e.target.closest('[data-item-del]');
      if (del) {
        readForm(root);
        draft.items.splice(Number(del.dataset.itemDel), 1);
        return this.render(root);
      }
      if (e.target.closest('[data-delete]')) {
        if (!await deleteGuarded('plans', draft.id, t('plans.confirmDelete'))) return;
        markClean();
        return navigate('#/plans');
      }
    };

    // A tick is a finished act and is written at once (§13fk). Only the tick:
    // the title, notes, status and the words of a line wait for Save.
    //
    // WHAT IS WRITTEN is the STORED plan with one line's `checked` changed —
    // never the draft. The draft may hold notes typed a minute ago and not
    // saved; writing it would save them behind her back, and writing a stale
    // copy over the stored one could undo a save. The draft is updated too, so
    // a Save later carries the same tick and cannot revert it.
    //
    // The line is found by its id, not its position: a line removed in the
    // form and not yet saved moves every index after it, and the stored plan
    // still has it.
    //
    // A new plan not yet saved, or a line added and not yet saved, has nothing
    // stored to patch; the tick stays in the draft and goes with Save, and the
    // form is marked as holding unsaved work. Ticks are written one after
    // another, never interleaved, so two quick ones cannot each read the plan
    // before the other has written it.
    root.onchange = async (e) => {
      // One reference picture, made the way a trial's result photograph is
      // (photo.js: 1280 px long side, JPEG 0.82) — a screen's worth, not a
      // phone camera's 12 MB (§13gb).
      if (draft && mode === 'edit' && e.target.matches?.('[data-refimg]')) {
        const file = e.target.files?.[0];
        if (!file) return;
        readForm(root);
        try { draft.referenceImage = await shrinkResult(file); markDirty(); }
        catch { flash(t('plans.referenceImageFailed')); }
        return this.render(root);
      }
      // A piece chosen for a line (§13gt). Waits for Save, as the line's words do.
      if (draft && mode === 'edit' && e.target.matches?.('[data-piece-add]')) {
        const id = e.target.value;
        if (!id) return;
        readForm(root);
        const it = draft.items[Number(e.target.dataset.pieceAdd)];
        if (it && !piecesOf(it).includes(id)) it.fabricIds = [...piecesOf(it), id];
        markDirty();
        return this.render(root);
      }
      if (!draft || e.target.type !== 'checkbox' || !e.target.dataset.i) return;
      e.target.closest('.checkitem')?.classList.toggle('ticked', e.target.checked);
      const it = draft.items[Number(e.target.dataset.i.split('.')[0])];
      if (!it) return;
      it.checked = e.target.checked;
      const planId = draft.id, itemId = it.id, checked = it.checked;
      tickQueue = tickQueue.then(() => persistTick(planId, itemId, checked)).catch(() => {});
    };
  },
};
