# Глина — Functional Specification

**Version:** v1.7.0.1 · `atelie-v45`
**Last revised:** July 2026
**Live:** https://tskovacheva.github.io/atelie-app/
**Repo:** github.com/tskovacheva/atelie-app

> This document describes what the application currently does, module by module,
> at the level of detail needed to (a) compare it against other ceramics
> software, (b) audit it for over-engineering, and (c) identify missing
> activities from a working ceramicist's practice.
>
> It describes the **built state**, not aspirations. Planned work is confined to
> §10.

---

## 1. Purpose and context

**Глина** ("Clay") is a personal record-keeping application for a working
ceramic studio. It tracks the full life of handmade ceramic work — from raw
material through forming, decoration, and firing, to the finished piece — plus
the glaze recipes, materials, and test results that feed into it.

**Who it is for.** One ceramicist, in one studio (Crafty Place, Vlado Trichkov,
Bulgaria). It is not a commercial product and has no users other than its owner.
Design decisions consistently favour "what this practice actually needs" over
"what a general product would need."

**What kind of tool it is.** Closer to a studio notebook than to management
software. It records what happened. It does not schedule, cost, invoice, or
optimise. There is no sales, customer, order, or commission tracking, and none is
planned.

**Distinguishing characteristic.** Most pottery software assumes an electric
kiln and a linear bisque → glaze → done workflow. This application treats
alternative firing (raku, pit, barrel, saggar, sawdust, soda, salt, obvara,
чушкопек/"pepper roaster") as first-class, and models a piece's history as an
event stream rather than a status field. It also, as of v1.6–v1.7, models the
processing of wild-dug clay and the composition of custom clay bodies.

**Language.** Bulgarian UI throughout. No i18n layer. English is a possible
future addition, not a current gap the owner wants closed.

---

## 2. Technical architecture

| Aspect | Choice |
|---|---|
| Form factor | Progressive Web App, installed on Android via Chrome |
| Code | Single `index.html` (~5,500 lines): inline CSS + vanilla JS, no framework |
| Build step | None. Edit the file, commit, GitHub Pages serves it. |
| Supporting files | `sw.js` (service worker), `app.webmanifest`, icons |
| Hosting | GitHub Pages, static |
| Backend | None. No accounts, no server, no sync. |
| Offline | Full. Service worker caches the app shell. |

### Storage

- **Primary:** IndexedDB (key `atelie_idb`), practical ceiling ~1 GB+
- **Access pattern:** an in-memory cache (`_storageCache`) is hydrated at boot by
  `bootStorage()`; reads are synchronous against the cache, writes are async to
  IndexedDB. This keeps a synchronous API (`safeLoadJSON` / `safeSaveJSON`) over
  an async store, avoiding a full async refactor.
- **Secondary:** `localStorage` still written as a backup mirror. Slated for
  removal once IndexedDB proves stable.
- **Keys:** `atelie_v6` (main DB), `atelie_userlib` (library), `atelie_v6_pre_*`
  (pre-migration snapshots, removable via the storage tool)

Migration from localStorage to IndexedDB happened in v1.5.0 and was driven by a
real ceiling: photos are stored as base64 inside the DB object, and localStorage's
UTF-16 encoding doubled their cost. The main DB had reached 1.99 MB, of which
~98% was images, against a 5 MB limit.

### Photos

Stored inline as base64 JPEG data URLs. Client-side resized to **max 800px** on
the long edge at **quality 0.75** before storage. No external image hosting.

Photo capacity is **inconsistent by entity** and worth noting for the
over-engineering audit:

| Entity | Photos | Field |
|---|---|---|
| Piece | up to 5 | `photos[]` |
| Piece event | up to 5 | `photos[]` |
| Test | up to 5 | `photos[]` |
| Raw material process event | up to 5 | `photos[]` |
| Recipe | 1 | `photo` |
| Material (all categories incl. mass) | 1 | `photo` |

### Data root

```js
DB = { pieces: [], recipes: [], materials: [], tests: [], firingProfiles: [] }
```

Library articles live outside `DB` under their own key. Every entity is a plain
array of plain objects; there is no state layer, ORM, or reactive system. All
schema changes are additive and backward-compatible — old records simply lack
new fields.

### Conventions

- IDs are opaque strings from `uid()`
- Cross-entity references are prefixed strings: `mat:<id>`, `rec:<id>`, resolved
  by `_resolveMaterialRef()`
- Stage values are normalised through `normalizeStageValue()` (legacy
  `greenware` → `wet`, `glaze-fired` → `finished`)
- `APP_VERSION` and `CACHE_NAME` are bumped together on every deploy

---

## 3. Module: Изделия (Pieces)

The primary module and the reason the app exists.

### Purpose

Catalogue every piece made, and record its history from wet clay to finished
object.

### Entity

```
id, name*, photos[] (max 5), type, clay, technique,
recipe, material, bisqueTemp, glazeTemp, date, stage, notes, events[]
```

- `type` — free text with autocomplete from previously used values (vase, cup,
  musical instrument, …). Deliberately not a fixed list.
- `technique` — fixed list: throwing, coiling, slabs, hand-building, mould,
  kurinuki, other
- `clay` — either a material ID (clays or mass category) or a free-text legacy
  name
- `recipe` / `material` — the glaze, as either a recipe reference or a
  ready-made glaze material
- Two temperatures (`bisqueTemp`, `glazeTemp`) rather than one — a piece is
  fired at least twice

### Stages

Six ordered values: `wet` → `leather-hard` → `bone-dry` → `bisque` → `glazed` →
`finished`.

Displayed as a six-dot progress indicator with ‹ › arrows and a stage label.
This replaced two large stage-advance buttons in v1.5.2 after external UX review
found they read as primary calls to action and competed with the actual content.

**Note for the audit:** the slider updates `piece.stage` directly and does *not*
create an event. The owner reports not using it — stage is advanced by adding
process events instead. This is a candidate for removal.

### Process — the event timeline

Each piece has `events[]`. This is the app's most distinctive feature and its
largest single investment.

Event shape: `{ id, type, date, note, photos[], data{} }`

| Type | Meaning | `data` fields |
|---|---|---|
| `stage` | transition to a new stage | `stageValue` |
| `firing` | a firing | `method`, `atmosphere`, `firingPurpose`, `temp`, `firingProfileId` |
| `decoration` | decoration applied | `technique`, `materialIds[]`, `appliedAtStage` |
| `progress` | photo/note with no stage change | `atStage` |

**Firing methods (13):** electric, gas, wood, raku, чушкопек, pit, barrel,
saggar, sawdust, soda, salt, обвара, other
**Atmospheres (2):** oxidation, reduction
**Decoration techniques (12):** sgraffito, stamp, terra sigillata, engobe, slip,
oxide wash, underglaze, glaze, burnishing, carving, slip-trailing, other

Decoration and progress events carry an optional "at which stage" field, because
the same technique means different things at different moisture states (sgraffito
at leather-hard vs at bone-dry). Firing and stage events do not carry it — they
*are* stage transitions.

Decoration events can reference the materials used, as `mat:` or `rec:`
references, with an inline "add new material" flow that returns to the event
being edited.

`recomputePieceStage()` derives the current stage from the events; legacy pieces
without events get synthetic ones from their flat fields
(`synthesizeLegacyEvents`).

Timeline sorting is reverse-chronological, with a tie-break: same-date events
sort by stage order descending, so a bisque firing appears above a leather-hard
decoration recorded the same day.

### Quick-final

When adding a piece that is already finished, the modal offers a collapsed
section for firing method / atmosphere / purpose and a decoration technique. On
save, these become real events. This exists because the owner's current habit is
to enter pieces retrospectively, all at once — the intended future habit
(entering at the start and updating stage by stage) has not arrived yet.

**Note for the audit:** this is a second entry path for the same data. If the
habit shifts, it becomes dead weight.

### Add-piece modal structure

Two-tier, introduced in v1.5.3 after UX review found every field carried equal
visual weight:

- **Always visible:** photo, name*, clay (+add new), stage, date
- **Collapsed under "Допълнителни детайли":** type, technique, glaze/recipe
  (+add new), bisque temp, glaze temp
- Auto-expands on edit if the piece has any of the secondary fields filled

### List, filter, sort

Collapsible filter panel (v1.5.2) with an active-filter count badge. Filter by
stage chips; sort by name/date. Search across name and type.

---

## 4. Module: Рецепти (Recipes)

### Purpose

Glaze recipes — mixtures the ceramicist **applies** to a surface.

### Entity

```
id, name*, photo, temp, cone, glazeType, notes,
recommendedFiringProfileId, fav, ingredients[{matId, pct}]
```

### Features

- Ingredients as material references with percentages
- **Batch calculator** — enter a batch size in grams, get each ingredient's
  weight. Read-only, non-destructive.
- Favourites flag with a favourites-only filter
- Links to a recommended firing profile
- Filter by temperature band; sort by name
- Referenced from pieces (as the glaze), tests (as the subject), and — since
  v1.7.0 — from masses (as a component)

---

## 5. Module: Материали (Materials)

The widest module. Nine tabs.

### Categories

| Value | Label | Icon | Notes |
|---|---|---|---|
| `clays` | Глина | 🏔 | commercial clay bodies |
| `base` | Базова суровина | 🧪 | kaolin, quartz, feldspar, grog… |
| `ox` | Оксид / Оцветител | 🎨 | |
| `glaze` | Готова глазура | ✨ | ready-made |
| `engobe` | Ангоба | 🎭 | |
| `underglaze` | Подглазурна боя | 🖌 | |
| `raw` | Суровина (дива глина) | ⛏ | **v1.6.0** — wild-dug, unprocessed |
| `mass` | Маса | 🧱 | **v1.7.0** — composed clay body |
| — | Wishlist | | a flag, not a category |

### Common entity

```
id, name*, cat, formula, brand, stock, alertAt,
notes, photo, wishlist, cost, costUnit
```

- `stock` in grams, with `alertAt` low-stock threshold and a ⚠️ badge
- `cost` + `costUnit` (g / kg / L / ml / бр / m / other), currency fixed to EUR
- Category-conditional fields: clays get `fireBisqueTemp` / `fireGlazeTemp`;
  glazes get their own block
- Search, filter (low stock, wishlist), sort

### 5.1 Суровина (raw material) — v1.6.0

Models wild clay dug from a specific place, which is itself an experiment before
it can be a material.

**Identity fields** — `raw: { location, coords, date, weight, geonotes }`
Where it came from, coordinates, extraction date, initial dry weight, and free
notes for geology, legal status, and layer descriptions.

**Process biography** — `raw.events[]`, a simplified timeline distinct from
piece events (the fields are too specific to share: ppm, mesh, water ratio).

| Type | Icon | `data` fields |
|---|---|---|
| Добиване (extraction) | ⛏ | `weight` |
| Диагностика (diagnostic) | 🔬 | `vinegar` (strong/weak/none — carbonate test) |
| Промивка (wash) | 💧 | `washNum`, `ratio`, `ppmBefore`, `ppmAfter`, `settleHours`, `waterTemp` |
| Пресяване (sieve) | 🕸 | `mesh`, `weightBefore`, `weightAfter`, `observations` |
| Отлежаване (aging) | ⏳ | `method`, `duration`, `consistency` |

Each event also has date, note, and up to 5 photos. The timeline is reverse-
chronological and shows a compact summary per row
(e.g. "Промивка #3 · 7000→5020 ppm · 1:3 · 24ч утаяване").

**A raw material is deliberately NOT selectable** as the clay of a piece or a
test. It must first become a маса (§5.2). The reason: the same raw batch can
feed several different bodies, so it cannot simultaneously *be* the plain version
and the version with grog.

### 5.2 Маса (clay body) — v1.7.0

A маса is a **normal material that knows what it is made of**. Because it is a
material with a category, it appears in clay pickers automatically — no picker
special-casing beyond `cat==='clays' || cat==='mass'`.

```
blend: {
  components: [ { ref: 'mat:<id>' | 'rec:<id>', pct: <number> }, … ],
  mixDate, readyDate
}
```

- **Components** may be any material — raw, commercial, base, oxide, engobe,
  underglaze, ready glaze, another маса — or a recipe. Grouped by category in the
  picker.
- **Recursion is free.** A component may be another маса, because a маса is a
  material and components are material references. "Take T2 and add 5% oxide"
  needs no new code.
- **Cycle guard.** `_massContains()` walks the blend tree; anything that would
  create a cycle (including indirectly) is excluded from the picker, as is the
  маса itself.
- **Percentages are advisory.** The sum is displayed live (✓ at 100, ⚠
  otherwise) but never blocks saving — additions "on top" are a real practice.
- **No stock.** A маса has composition and dates, not inventory.
- Component rows in the detail view link through to the component's own detail,
  so a body links back to the wild clay's washing history.

Worked example — three parallel test bodies from one dug batch:

```
T1 Baseline    100% Xi Beach                             ✓ 100%
T2 Обогатена   70% Xi Beach · 15% kaolin · 15% grog      ✓ 100%
T3 С шамот     85% Xi Beach · 15% grog                   ✓ 100%
```

### Naming rationale

The module is called **Маса**, not **Смес** ("mixture"), because Рецепти are
already mixtures. This gives a clean, professionally accurate split:

- **Рецепти** — mixtures you *apply* (glazes)
- **Маси** — mixtures you *form* (bodies)

Oxide-stained clay is a маса. There is no third module and no planned merge.

---

## 6. Module: Тестове (Tests)

### Purpose

A log of glaze test outcomes — what a given glaze did on a given clay at a given
temperature.

### Entity

```
id, updatedAt, recipeId, materialId, firingProfileId, clay,
date*, temp*, hold*, flow, surf, def, rat, glazeLayers, notes, photos[] (max 5)
```

### Result vocabulary

- **Flow:** low / medium / strong / very strong
- **Surface:** matte / satin / gloss / crystalline / textured / raw-underfired
- **Defects:** none / pinholes / cracks / crawling (peeling) / crawling /
  unsettled quartz / blisters
- **Rating:** 1–5 stars

### Stock deduction

**This is the one place the app mutates inventory.** On test *creation* with a
batch size, each ingredient of the recipe is deducted from the corresponding
material's `stock`, pro-rata.

Deliberately limited:
- Runs on create only
- Edits never re-deduct
- Deletes never restore

The code carries an explicit TODO noting that a proper inventory ledger /
stock-movements table would be needed to make this auditable.

**Note for the audit:** this is a half-implemented feature. It is either worth
finishing (ledger) or worth removing (manual stock only). Its current state —
silent, one-directional, uncorrectable — is arguably the weakest point in the
data model.

### Filters

By defect presence (has defects / no defects), rating, temperature.

---

## 7. Module: Изпичания (Firing profiles)

### Purpose

Reusable kiln programs.

### Entity

```
id, name*, updatedAt, type, ramp1Rate, ramp1To,
ramp2Rate, ramp2To, holdMin, notes
```

- **Types:** Бисквит / Глазурно / Друго
- Two ramp segments (rate °C/h + target °C), then a hold in minutes
- List shows peak temperature (`ramp2To`, falling back to `ramp1To`)
- Referenced from recipes (recommended profile), tests, and firing events

**Note for the audit:** two ramps is a simplification. Real electric kiln
controllers support more segments, and alternative firings often aren't
programmable at all. Whether two is the right number is worth questioning in both
directions.

---

## 8. Module: Библиотека (Library)

### Purpose

A personal knowledge base plus the app's settings drawer.

### Content

Articles with `{ id, num, cat, title, sub, content }` where content is HTML.
Ships with built-in reference guides (ceramic technology, clay types, glaze
chemistry, raw materials, firing types, temperature curves, effects,
recipes/testing, ash glazes, Japanese ceramics). User articles can be added,
edited, and deleted. Built-ins are editable.

Stored separately from `DB` under `atelie_userlib`.

### Also housed here

- **Backup** — export the whole DB as a JSON file; import to restore
- **Място на устройството** ("Space on device") — storage diagnostics, rewritten
  in v1.5.3 to remove all technical vocabulary. Reports used space, a semantic
  free-space verdict (plenty / medium / low), a breakdown by data type, and two
  cleanup actions: remove pre-migration snapshots, and recompress oversized
  photos.

---

## 9. Cross-cutting behaviour

**Nested add.** From within a piece or event modal, a new clay / glaze material /
recipe / decoration material can be created without losing the work in progress.
Implemented via `_nestedAddCallback` plus an edit-ID save/restore, and a
z-index boost so the nested modal renders above its parent.

**Android PWA photo handling.** Returning from the native file picker can suspend
the PWA and lose the read. Mitigated with a retry-once mechanism, an immediate
`e.target.value=''` to release the Android file lock, and a 50ms deferred
processing step.

**Validation.** Name required on most entities; dates and positive numbers
validated with focus-on-error. Toast feedback throughout.

**Backward compatibility.** Every version reads data written by every previous
version. New fields are optional; legacy values are normalised on read.

---

## 10. Deliberate non-goals

Named here so a reviewer doesn't propose them as gaps:

- **No commerce** — no sales, customers, orders, commissions, pricing of finished
  work
- **No scheduling** — no kiln calendar, no reminders, no deadlines
- **No multi-user** — no accounts, sharing, or permissions
- **No cloud sync** — single device by design (Google Drive sync is a "maybe
  someday")
- **No i18n** — Bulgarian only, deliberately
- **No framework migration** — vanilla JS is a constraint, not an oversight
- **No general-purpose ambitions** — this is one studio's tool

---

## 11. Known trade-offs and open questions

Listed for the audit, in rough order of how much they bother the author:

1. **Stock deduction is half-built** (§6). Silent, one-way, uncorrectable.
   Finish it or cut it.
2. **The stage slider may be dead weight** (§3). The owner doesn't use it; events
   drive stage anyway.
3. **Quick-final is a second entry path** (§3). Justified by current habit; dead
   weight if the habit changes.
4. **Photo limits are inconsistent** (§2). 5 for some entities, 1 for others,
   with no principle behind the split.
5. **Two ramp segments may be the wrong abstraction** (§7).
6. **Рецепти and Маси are structurally similar** (§5.2) — both are
   components-with-percentages. Kept separate on purpose, but a reviewer should
   know the duplication is conscious.
7. **localStorage mirror is still written** (§2) alongside IndexedDB. Scheduled
   for removal.
8. **Library built-ins are editable**, which means a user edit can't be
   distinguished from shipped content or restored.

---

## 12. What a reviewer is being asked

1. **Positioning** — how does this compare to existing ceramics software
   (Glazy, Glaze Chem, Pottery Pal, ceramic-notes apps, or plain spreadsheets)?
   Where is it ahead, where behind, and where is it solving a problem nobody else
   is solving?
2. **Over-engineering** — what here is more machinery than a one-person studio
   needs? §11 lists the author's own suspicions; a fresh reading may find more,
   or may defend some of them.
3. **Gaps** — what does a working ceramicist actually do that this doesn't
   record? Bear §10 in mind: proposing commerce or scheduling is not useful.
   Proposing something about *making* is.
