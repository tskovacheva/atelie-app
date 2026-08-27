# Глина — Functional Specification

**Version:** v1.22.0 · `atelie-v71`
**Last revised:** July 2026
**Live:** https://tskovacheva.github.io/atelie-app/
**Repo:** github.com/tskovacheva/atelie-app

> A description of what the application does, module by module. It describes the
> built state; planned work lives in [`ROADMAP.md`](ROADMAP.md).

---

## 1. Purpose and scope

**Глина** ("Clay") is a personal record-keeping application for a working ceramic
studio. It tracks the life of handmade ceramic work — from raw material through
forming, decoration, and firing, to the finished piece — plus the glaze recipes,
materials, and test results that feed into it.

**Audience.** One ceramicist, one studio (Crafty Place, Vlado Trichkov,
Bulgaria). Not a commercial product. Design decisions consistently favour what
this practice needs over what a general product would need.

**Kind of tool.** Closer to a studio notebook than to management software. It
records what happened. It does not schedule, cost, invoice, or optimise. There is
no sales, customer, order, or commission tracking, and none is planned.

**Distinguishing characteristics.**

- Most pottery software assumes an electric kiln and a linear bisque → glaze →
  done workflow. This application treats alternative firing (raku, pit, barrel,
  saggar, sawdust, soda, salt, obvara, чушкопек) as first-class.
- A piece's history is an event stream, not a status field.
- Raw dug clay is modelled as a material with a processing biography of its own,
  before it can be used.
- Custom clay bodies are compositions with a traceable lineage.
- A firing is a record in its own right — one event, many pieces.

**Language.** Bulgarian UI throughout. No i18n layer.

---

## 2. Technical architecture

| Aspect | Choice |
|---|---|
| Form factor | Progressive Web App, installed on Android via Chrome |
| Code | Single `index.html` (~6,700 lines): inline CSS + vanilla JS, no framework |
| Build step | None. Edit the file, commit, GitHub Pages serves it. |
| Supporting files | `sw.js` (service worker), `app.webmanifest`, icons |
| Hosting | GitHub Pages, static |
| Backend | None. No accounts, no server, no sync. |
| Offline | Full, and required. The application never depends on the network. |

### Storage

- **Store:** IndexedDB, key `atelie_idb`. Library articles live separately under
  `atelie_userlib`.
- **Access pattern:** an in-memory cache (`_storageCache`) is hydrated at boot by
  `bootStorage()`. Reads are synchronous against the cache; writes are async to
  IndexedDB. This keeps a synchronous API (`safeLoadJSON` / `safeSaveJSON`) over
  an async store, avoiding a full async refactor.
- **localStorage** is a fallback used only where IndexedDB is unavailable. It
  holds no live data on a device where IndexedDB works.

The migration from localStorage to IndexedDB (v1.5.0) was driven by a real
ceiling: photos are stored as base64 inside the DB object, and localStorage's
UTF-16 encoding doubled their cost. The database had reached 1.99 MB, of which
~98% was images, against a 5 MB limit. localStorage cannot serve as a mirror for
the same reason.

**Failure handling.** A flag (`atelie_idb_active`) records that IndexedDB is the
live store. If IndexedDB later fails to open on such a device, the application
reports that storage is unavailable and refuses to write, rather than presenting
an empty or stale database as current. Recovery is by restart, or by restoring a
backup.

**Persistence and eviction protection (v1.16.2).** Browser storage is
"best-effort" by default: the browser — Android especially, for an installed PWA —
may evict IndexedDB under memory pressure or after inactivity. This once wiped a
device between sessions (storage dropped from 2.40 MB to 0.42 MB), looking exactly
like a reverted backup. Two defences now exist:

- `navigator.storage.persist()` is requested at startup, asking the browser not to
  evict without permission. For an installed PWA this is almost always granted.
  It is best-effort itself, so it is backed by:
- A **data-shrink safety net.** A fingerprint of record counts (pieces, materials,
  recipes, tests, runs, profiles) is written to localStorage after every save —
  localStorage survives an IndexedDB eviction. On open, if the total has collapsed
  to under half of the last-seen count (and at least six records are gone), the app
  warns loudly and prompts a restore from backup **before** any new data is entered
  on top of the reverted state. The last-good fingerprint is kept, not overwritten,
  so the warning persists across reopens until data is restored.

Neither is a substitute for regular exported backups, which remain the real
guarantee.

### Photos

Stored inline as base64 JPEG data URLs, resized client-side to **max 800px** on
the long edge at **quality 0.75**. No external image hosting.

Capacity by entity:

| Entity | Photos |
|---|---|
| Piece, piece event, test, raw-material process event, firing run | up to 5 |
| Recipe, material (all categories) | 1 |

### Data root

```js
DB = { pieces, recipes, materials, tests, firingProfiles, firingRuns, _migrations }
```

Every entity is a plain array of plain objects. No state layer, ORM, or reactive
system. Schema changes are additive and backward-compatible — older records
simply lack newer fields and are read with defaults.

### Conventions

- IDs are opaque strings from `uid()`
- Cross-entity references are prefixed strings: `mat:<id>`, `rec:<id>`, resolved
  by `_resolveMaterialRef()`
- Stage values are normalised through `normalizeStageValue()` (legacy
  `greenware` → `wet`, `glaze-fired` → `finished`)
- Related-record lists are **derived, never stored** — no reverse foreign keys
- `APP_VERSION` and `CACHE_NAME` are bumped together on every deploy

### Single-owner rule

Where two mechanisms could write the same value, exactly one owns it at any
moment, and the owner is determined by the data rather than by the UI. This
applies in three places:

| Value | Owner |
|---|---|
| `piece.stage` | the Процес events (stage steps AND typed firings) when any exist; the Add/Edit dropdown when none do |
| `series.stage` | the same rule, applied to the series' own events |
| a step being written | the open detail decides — series if one is open, otherwise the piece (`_evSubject`) |
| firing method / temperature / atmosphere on an event | the linked firing run when `firingRunId` is set; the event itself when it isn't |
| a recipe's composition as a test saw it | the specific recipe version the test points to |

---

## 3. Изделия (Pieces)

The primary module.

### Entity

```
id, name*, photos[] (max 5), type, clay, technique,
recipe, material, bisqueTemp, glazeTemp, date, stage, notes, events[]
```

- `type` — free text with autocomplete from previously used values (vase, cup,
  musical instrument…). Deliberately not a fixed list.
- `technique` — fixed list: throwing, coiling, slabs, hand-building, mould,
  kurinuki, other
- `clay` — a material reference (clays or mass category) or a free-text legacy
  name
- Two temperatures rather than one — a piece is fired at least twice

### Stages

Seven ordered values, each describing the physical state of the clay:

| Stage | `value` | Meaning |
|---|---|---|
| Сурово | `wet` | wet, workable — just formed |
| Кожна влажност | `leather-hard` | firm but still damp — trimming, handles, burnishing |
| Сухо | `bone-dry` | fully dry, fragile — before the first firing |
| Бисквит | `bisque` | first firing done, porous — ready to glaze |
| Глазирано | `glazed` | glaze applied, **not yet fired** |
| Изпечено | `fired` | out of the kiln — **may still be worked on** |
| Готово | `finished` | she has decided the piece is done |

Shown as a seven-dot indicator with a stage label in the piece detail, and as a
badge in the list. The indicator is **display only**.

### Outcomes (v1.19.0)

`Готово` is not the only way a piece ends. Four **terminal states** sit alongside
the seven stages, stored in the same `piece.stage` field so the piece keeps one
owner for its state and one badge in the list:

| Outcome | `value` | Meaning |
|---|---|---|
| Счупено | `broken` | it broke — at any stage, from wet to fired |
| Бракувано | `scrapped` | it survived but was rejected |
| Подарено | `gifted` | it left the studio as a gift |
| Продадено | `sold` | it left the studio sold |

Failure is data: which body cracks, which glaze crawls. Gifted and sold are not
sales records — no buyer, no price, no date of sale. They are the fact that the
object is no longer in the studio, and nothing more. Anything beyond that label
is customer/order tracking, which is out of scope permanently.

`isTerminalStage(value)` answers whether a state closes the piece. A terminal
piece shows its outcome badge instead of the dot indicator, because the dots draw
a path and an outcome is a stop. The record stays in the list and stays
filterable. Outcomes are chosen from the same places a stage is — the Add/Edit
dropdown when it owns the stage, and a Процес stage step when the events do.

**Two principles govern the last stages:**

- **Fired ≠ finished.** A firing describes the clay (it came out of the kiln), not
  her decision (she is done). So `Изпечено` exists as a distinct state between
  `Глазирано` and `Готово` — after firing she may wax, lacquer, or re-glaze. A
  firing never lands a piece at `Готово`.
- **`Готово` is never automatic.** It is always a manual choice, recorded when she
  decides the piece is complete.

**Pieces may skip stages.** A pit firing on bare bisque goes
`Бисквит → Изпечено`, skipping `Глазирано`. The order is a scale, not a required
path.

## Series (v1.20.0)

Ten plates of the same kind move through one process — bisque together, decorated
together, glaze-fired together — yet they diverge: one is yellow, another blue, a
third cracks while drying. A series is therefore **a shared process over several
real pieces**, not a piece with a quantity.

```
series: id, name, type, clay, technique, dimensions, weight, notes, date,
        recipe, material, bisqueTemp, glazeTemp,
        count, photos[] (<=5), events[], stage, createdAt, updatedAt
```

`events[]` has exactly the same shape as `piece.events[]`, so
`recomputePieceStage`, `getTimelineEvents`, `getLatestPhoto` and `eventIcon` all
operate on a series unchanged. Its `photos[]` are the shots of the whole batch.

A piece gains three optional fields — `seriesId`, `qty` (default 1), `seriesNo`.
Absent, they mean today's behaviour exactly; nothing migrates.

**The member list is derived**, never stored: `_seriesMembers` scans `seriesId`,
`_seriesSplitCount` sums their `qty`, and `_seriesRemaining` is
`count - split`. The undifferentiated remainder is not a record at all. This is
the same policy by which a firing run finds its pieces.

**Entry is one field.** The Add Piece dialog has a Брой input. Left at 1 it makes
a piece; raised above 1 it makes a series. There is no second button and no second
flow — `savePiece` branches on `editKind` and the count.

**In the list** a series is one card carrying a Серия row with its count, opening
its own screen (`det-series`). That screen is deliberately narrower than a piece's:
a batch has no related tests and no per-piece divergence yet.

**Deleting a series does not cascade.** Members lose `seriesId` and survive as
standalone pieces, mirroring how deleting a firing run detaches rather than
destroys.

### Splitting and the merged timeline (v1.21.0)

A piece is split off the moment it becomes distinguishable, not before. The split
carries a **count**, because "4 yellow ones" is one decision, not four. Splitting
again from a member subdivides it — 4 yellow, one of which breaks, becomes 3 + 1.
One gesture, applied recursively.

The split inherits the series' identity (type, clay, technique, glaze,
temperatures, dimensions) but **not its events**. Copying the shared process would
create a second owner for it. Instead `_effectiveEvents(piece)` merges at read
time: shared events (shallow-copied and flagged `_fromSeries`) followed by the
piece's own. `recomputePieceStage`, `getTimelineEvents` and `getLatestPhoto` all
read through it, so a shared glaze firing moves the member's stage and a member
with no photos of its own shows the batch shot.

Shared rows appear in the member's Процес with an "от серията" tag and no edit or
delete buttons — they are edited only from the series screen, where they belong.

**The brake.** A piece with a terminal state stops absorbing shared events: shared
events dated after the *earliest* own terminal stage step are dropped from the
merge. Without it, the plate that broke at bisque would be glaze-fired along with
the rest. Undated shared events pass through — having no place in the order, they
cannot be "after" anything.

**Mixed stage.** `_seriesStageSummary` tallies every member by `qty` plus the
undifferentiated remainder at the series' own stage. One value means the normal dot
indicator; more than one shows the breakdown with counts, since "смесен" alone says
nothing. Outcomes sort last.

**Merging back is not offered.** Splitting records a decision already taken on the
clay. A data-entry mistake is removed by deleting the piece. "Извади от серията"
exists separately: it detaches a piece into a standalone record, keeping its own
events and dropping the shared ones.

### Firing a series, and yield (v1.22.0)

`_runPieces` scans series alongside pieces, so a batch in the kiln is **one row,
not ten**: the shared firing event carries `firingRunId` and speaks for the whole
series. A split member is not listed separately while its series is in the run —
it absorbs the shared event through the merge, so two rows would be the same
fact twice. The section header shows the physical count (`_runRowQty`), which is
the series' `count` for a series row and the member's `qty` for a member.

Attaching, detaching and deleting a run all treat a series exactly as they treat a
piece, including handing the method/temperature back to the event on detach. After
any of these, members are recomputed, since their stage is derived through the
merge but stored on the record.

**Yield** (`_seriesYield`) is derived from outcomes, not a separate field: alive is
whatever has not reached a terminal state. It returns `null` until something has
actually finished, because a batch still in progress has no yield to claim. When
the series itself carries a terminal state, the undifferentiated remainder counts
as finished that way.

### Reverse links (audit, v1.22.0)

- **Run → pieces / series:** attach picker, both in one list. Attaching only links
  *existing* records; a run cannot create a new piece.
- **Run → tests:** its own picker (`openRunTestAttach`), unchanged.
- **Test → pieces:** `t.pieces` is read but **nothing in the app ever wrote it**, so
  the piece's "Свързани тестове" section was permanently empty. It now derives the
  link from the shared recipe — the same relation the test screen already showed
  from its side — while still honouring `t.pieces` if an old record carries it.

### What moves the stage

The stage is derived by `recomputePieceStage()` from the events that move it —
the latest by date wins. Not every event type moves it:

| Event | Moves the stage? | To |
|---|---|---|
| Stage step | yes | the chosen value |
| Firing — bisque | yes | `bisque` |
| Firing — glaze | yes | `fired` |
| Firing — single-fire | yes | `fired` |
| Firing — alternative | yes | `fired` |
| Firing — untyped | no | (won't guess) |
| Decoration | no | — |
| Progress | no | — |

A firing's type comes from its own `firingPurpose`, or from the linked run's
`purpose` when it points at one. Decoration and progress events happen *within* a
state and carry an "at which stage" context — they do not change it; this is
correct, not a gap.

When a piece is at `fired`, the Add/Edit stage dropdown stays available (unlike
the general lock) specifically so `Готово` can be set by hand. Choosing it there
records a real stage step dated today, which then wins over the firing on the next
recompute — so the manual decision survives.

### Процес — the event timeline

Each piece has `events[]`. Event shape: `{ id, type, date, note, photos[], data{} }`

| Type | Meaning | `data` fields |
|---|---|---|
| `stage` | transition to a new stage | `stageValue` |
| `firing` | a firing | `firingRunId`, `wrapping`, or standalone: `method`, `atmosphere`, `firingPurpose`, `temp`, `duration`, `profileId` |
| `decoration` | decoration applied | `technique`, `materialIds[]`, `appliedAtStage` |
| `progress` | photo/note with no stage change | `atStage` |

**Firing methods (13):** electric, gas, wood, raku, чушкопек, pit, barrel,
saggar, sawdust, soda, salt, обвара, other
**Atmospheres (2):** oxidation, reduction
**Decoration techniques (12):** sgraffito, stamp, terra sigillata, engobe, slip,
oxide wash, underglaze, glaze, burnishing, carving, slip-trailing, other

Decoration and progress events carry an optional "at which stage" field, because
the same technique means different things at different moisture states
(sgraffito at leather-hard vs at bone-dry) — and, as noted above, they do not move
the stage. Stage steps and typed firings do (see "What moves the stage").

Firing events carry `wrapping` (bare / foil / saggar / other). This is per piece,
not per firing: bare and saggared work comes out of the same pit unrecognisably
different. It is a decision rather than an observation, which is why it is a
field and not a note.

`recomputePieceStage()` derives the current stage from the events. Pieces without
events get synthetic ones from their flat fields (`synthesizeLegacyEvents`).

Timeline sorting is reverse-chronological, with a tie-break: same-date events
sort by stage order descending, so a bisque firing appears above a leather-hard
decoration recorded the same day.

### Quick-final

When adding a piece that is already finished, the modal offers a collapsed
section for firing method / atmosphere / purpose and a decoration technique. On
save these become real events, unlinked to any firing run. This supports
retrospective entry — recording a piece whose history was never captured.

### Add-piece modal

Two-tier:

- **Always visible:** photo, name*, clay (+add new), stage, date
- **Collapsed under "Допълнителни детайли":** type, technique, glaze/recipe (+add
  new), bisque temp, glaze temp
- Auto-expands on edit if any secondary field has a value

The stage dropdown is disabled, with an explanatory hint, when the piece has
stage events — see the single-owner rule (§2).

### List

Collapsible filter panel with an active-filter count badge. Filter by stage
chips; sort by name or date. Search across name and type.

---

## 4. Рецепти (Recipes)

Glaze recipes — mixtures that get **applied** to a surface.

### Entity

```
id, name*, photo, temp, cone, glazeType, notes,
recommendedFiringProfileId, fav, ingredients[{matId, pct}],
lineageId, version, versionNote
```

### Versions

A version is a **separate recipe record with a lineage**, not a nested structure.
Because tests point at `recipeId` and every version has its own id, a test made
against v1 keeps describing v1 permanently. The test model needs no version
awareness at all.

- `lineageId` groups versions; `version` is 1, 2, 3…
- Legacy recipes have neither field and read as `lineage = own id`, `version = 1`.
  The fields are stamped in when a second version is first created.
- The list shows one row per lineage — the latest version, badged `v3`. A
  "Всички версии" filter chip reveals the rest. The recipe detail lists the whole
  lineage with dates, test counts, and version notes, each clickable.

**The guard.** On save, if the composition changed *and* tests point at this
recipe, a confirmation offers to save as a new version instead, so the existing
tests keep describing the mixture they were made with. It fires only when both
conditions hold: editing notes, name, or temperature is unaffected, as is
changing the composition of a recipe with no tests. Ingredient comparison is
order-insensitive and numeric.

A version can also be branched by hand from the recipe detail.

"Дублирай" remains distinct: an independent copy with a new lineage, for starting
from an existing recipe to make a different glaze.

### Other features

- **Batch calculator** — enter a batch size in grams, get each ingredient's
  weight. Read-only, non-destructive.
- Favourites flag with a favourites-only filter
- Links to a recommended firing profile
- Filter by temperature band; sort by name

---

## 5. Материали (Materials)

Nine tabs.

### Categories

| Value | Label | Icon | Notes |
|---|---|---|---|
| `clays` | Глина | 🏔 | commercial clay bodies |
| `base` | Базова суровина | 🧪 | kaolin, quartz, feldspar, grog… |
| `ox` | Оксид / Оцветител | 🎨 | |
| `glaze` | Готова глазура | ✨ | ready-made |
| `engobe` | Ангоба | 🎭 | |
| `underglaze` | Подглазурна боя | 🖌 | |
| `raw` | Суровина (дива глина) | ⛏ | wild-dug, unprocessed |
| `mass` | Маса | 🧱 | composed clay body |
| — | Wishlist | | a flag, not a category |

### Common entity

```
id, name*, cat, formula, brand, stock, alertAt,
notes, photo, wishlist, cost, costUnit, chem
```

- `stock` in grams, with an `alertAt` low-stock threshold and a ⚠️ badge. Stock is
  edited by hand only — nothing in the application changes it.
- `cost` + `costUnit` (g / kg / L / ml / бр / m / other), currency fixed to EUR
- Category-conditional fields: clays get `fireBisqueTemp` / `fireGlazeTemp`;
  glazes get their own block
- Search, filter (low stock, wishlist), sort

### 5.1 Суровина (raw material)

Models wild clay dug from a specific place, which is itself an experiment before
it can become a material.

**Identity** — `raw: { location, coords, date, weight, geonotes }`
Origin, coordinates, extraction date, initial dry weight, and free notes for
geology, legal status, and layer descriptions. Distinct layers from one dig are
recorded as one batch with notes, not as separate records, because they are
processed in parallel.

**Process biography** — `raw.events[]`, a simplified timeline distinct from piece
events; the fields are too specific to share.

| Type | Icon | `data` fields |
|---|---|---|
| Добиване | ⛏ | `weight` |
| Диагностика | 🔬 | `vinegar` (strong/weak/none — carbonate test) |
| Промивка | 💧 | `washNum`, `ratio`, `ppmBefore`, `ppmAfter`, `settleHours`, `waterTemp` |
| Пресяване | 🕸 | `mesh`, `weightBefore`, `weightAfter`, `observations` |
| Отлежаване | ⏳ | `method`, `duration`, `consistency` |

Each event also has date, note, and up to 5 photos. The timeline is reverse-
chronological with a compact per-row summary (e.g. "Промивка #3 · 7000→5020 ppm ·
1:3 · 24ч утаяване").

**A raw material is not selectable** as the clay of a piece or a test. It must
first become a маса (§5.2). The reason: one dug batch can feed several different
bodies, so it cannot simultaneously *be* the plain version and the version with
grog. A button on the raw-material detail opens the маса modal pre-filled at 100%,
making the plain case two clicks.

### 5.2 Маса (clay body)

A маса is a **material that knows what it is made of**. Because it is a material
with a category, it appears in clay pickers automatically; the only accommodation
anywhere is `cat==='clays' || cat==='mass'`.

```
blend: {
  components: [ { ref: 'mat:<id>' | 'rec:<id>', pct }, … ],
  mixDate, readyDate
}
```

- **Components** may be any material — raw, commercial, base, oxide, engobe,
  underglaze, ready glaze, another маса — or a recipe. Grouped by category in the
  picker.
- **Recursion is free.** A component may be another маса, because a маса is a
  material and components are material references. "Take T2 and add 5% oxide"
  needed no new code.
- **Cycle guard.** `_massContains()` walks the blend tree; anything that would
  create a cycle, directly or indirectly, is excluded from the picker, as is the
  маса itself.
- **Percentages are advisory.** The sum is displayed live (✓ at 100, ⚠
  otherwise) but never blocks saving — additions "on top" are real practice.
- **No stock.** A маса has composition and dates, not inventory.
- Component rows in the detail link through to the component's own detail, so a
  body links back to the wild clay's washing history.

### Naming rationale

The module is called **Маса**, not **Смес** ("mixture"), because Рецепти are
already mixtures. The split is clean and professionally accurate:

- **Рецепти** — mixtures you *apply* (glazes)
- **Маси** — mixtures you *form* (bodies)

Oxide-stained clay is a маса. There is no third module and no planned merge.

---

## 6. Тестове (Tests)

A test has a **kind**: `glaze` (the original) or `body`. Legacy tests have no
`kind` field and read as `glaze`.

### Common fields

```
id, kind, date*, temp, hold, firingProfileId, firingRunId,
rat, notes, photos[] (max 5), updatedAt
```

Temperature and hold are required for glaze tests. For body tests both are
optional — a plasticity test is a bent coil, not a fired tile.

### Glaze test

```
recipeId, materialId, clay, glazeLayers, flow, surf, def
```

- **Flow:** low / medium / strong / very strong
- **Surface:** matte / satin / gloss / crystalline / textured / raw-underfired
- **Defects:** none / pinholes / cracks / crawling (peeling) / crawling /
  unsettled quartz / blisters
- **Rating:** 1–5 stars

The recipe is named with its version wherever it appears (§4).

### Body test

```
bodyRef, body: {
  plasticity, plasticityNote,
  shrMarked, shrDry, shrFired,
  poroDry, poroWet,
  color, deformation, sound, limePopping, limeNote,
  longTerm, longTermDate
}
```

| Field | Entry | Derived |
|---|---|---|
| Plasticity | poor / fair / good / excellent + note | — |
| Shrinkage | marked / dry / fired lengths in mm | wet→dry %, dry→fired %, total % |
| Porosity | dry and 24h-soaked weights in g | water absorption % |
| Colour | text | — |
| Deformation | none / slight / moderate / severe | — |
| Sound | ringing (vitrified) / dull (porous) / cracked | — |
| Lime popping | none / slight / severe + note | — |
| Long-term | date + note (scumming, cracks) | — |

Percentages are computed live as the measurements are typed.

**Granularity:** one test record per specimen per condition. A body tested at four
temperatures is four records; plasticity, having no temperature, is its own.

### Filters

Kind (✨ Глазурни / 🧱 На маси, mutually exclusive), defect presence, rating,
temperature.

---

## 7. Изпичания (Firings)

Two tabs: **Изпичания** (runs) and **Профили** (profiles).

### Профил — the programme

A reusable template. It has not happened; it can happen many times.

```
id, name*, type (bisque/glaze/other),
ramps: [ { rate °C/h, to °C, hold min }, … ],
notes, updatedAt
```

The programme is an **arbitrary list of ramp segments** (v1.16.0). Each segment is
a climb rate, a target temperature, and an optional hold at that target. Legacy
profiles carried a fixed `ramp1Rate/ramp1To/ramp2Rate/ramp2To/holdMin` shape;
`_fpRamps()` reads them as a two-segment array on the fly, so old data works
unchanged and is rewritten to the array form on first save.

**Derived values.** `_fpPeak()` is the highest `to` across segments. `_fpDuration()`
computes the total programme time — each segment's climb time (`|to − from| / rate
× 60`, starting from 20 °C ambient) plus its hold — and marks the result
approximate when a segment lacks a rate.

**The curve.** Both the profile modal (live, while editing) and the profile detail
render an SVG of temperature against time, drawn from the segment array, with the
computed total duration beneath it. Only the *profile* is drawn — a firing run
stores just peak and hold, not a per-minute curve, so the run has no curve of its
own.

Referenced from recipes (recommended profile), tests, firing runs, and firing
events.

### Изпичане — the event

A firing that happened: once, on a date, with these pieces in it.

```
id, name, date*, method*, atmosphere, purpose,
firingProfileId,                    ← what was planned
peakTemp, holdMin, cones,           ← what actually happened
fuel, additives[], duration,        ← non-electric only
notes, photos[]
```

The profile records the intent; the run records the outcome.

**Additives** are either a material reference (`mat:<id>`, from stock) or free
text, in one list — the same shape decoration materials use. Copper carbonate
comes from the materials module; banana skins are typed. Fuel and free-text
additives autocomplete from previous runs.

**The run does not store its pieces.** `_runPieces()` scans pieces for firing
events carrying this `firingRunId`, following the derived-not-duplicated rule
(§2). Three consequences fall out of that choice:

- Attaching a piece is one field on an event that already exists, so a
  quick-added piece is adopted rather than copied
- There is no reverse direction to keep in sync, because nothing stores it
- Deleting a run detaches rather than cascades: events keep whatever they hold on
  their own

**Linking.** When a firing event has a `firingRunId`, the event's own method,
atmosphere, temperature, and purpose are deleted, not hidden — the run answers for
them (§2). Timelines read through. Unlinked events, including all legacy ones,
behave exactly as before.

Tests may also carry an optional `firingRunId`.

---

## 8. Библиотека (Library)

A personal knowledge base plus the settings drawer.

**Content.** Articles with `{ id, num, cat, title, sub, content }` where content is
HTML. Ships with built-in reference guides (ceramic technology, clay types, glaze
chemistry, raw materials, firing types, temperature curves, effects,
recipes/testing, ash glazes, Japanese ceramics). User articles can be added,
edited, and deleted. Built-ins are editable.

**Also housed here:**

- **Backup** — export the whole database as a JSON file (schemaVersion 3, since
  v1.17.0 including firingRuns, which earlier backups silently omitted); import to
  restore. Import **replaces**; it does not merge. A guard warns when the imported
  file is older than the latest local change. A staleness reminder (v1.17.0) shows
  in this panel when the last export is over a week old, or 25+ changes have
  accumulated, or the device has no backup yet.
- **Място на устройството** — storage diagnostics in plain language: space used,
  a semantic free-space verdict (plenty / medium / low), a breakdown by data type,
  and cleanup actions for pre-migration snapshots and oversized photos.

---

## 9. Cross-cutting behaviour

**Nested add.** From within a piece or event modal, a new clay / glaze material /
recipe / decoration material can be created without losing work in progress.
Implemented via `_nestedAddCallback` plus an edit-ID save/restore, and a z-index
boost so the nested modal renders above its parent.

**Android PWA photo handling.** Returning from the native file picker can suspend
the PWA and lose the read. Mitigated with a retry-once mechanism, an immediate
`e.target.value=''` to release the Android file lock, and a 50ms deferred
processing step.

**Android back button.** History API integration — back closes a modal or detail
rather than the app.

**Validation.** Name required on most entities; dates and positive numbers
validated with focus-on-error. Toast feedback throughout.

**Backward compatibility.** Every version reads data written by every previous
version. New fields are optional; legacy values are normalised on read.

**Deploy validation.** Two checks run before every deploy: JavaScript syntax, and
that every `getElementById` target exists in the HTML. The second exists because
a missing element is valid JavaScript that fails only at runtime — a class of
error the syntax check cannot see, and one that has caused a shipped bug.

---

## 10. Non-goals

Named so they are not mistaken for gaps:

- **No commerce** — no sales, customers, orders, commissions, pricing of finished
  work
- **No scheduling** — no kiln calendar, no reminders, no deadlines
- **No multi-user** — no accounts, sharing, or permissions
- **No cloud sync** — single device by design
- **No i18n** — Bulgarian only
- **No framework migration** — vanilla JS is a constraint, not an oversight
- **No general-purpose ambitions** — this is one studio's tool

---

## 11. Known trade-offs

- **Import replaces rather than merges.** Moving work between devices requires
  strict serial discipline: export from A, work on B, import back to A, with no
  edits to A in between. The staleness guard catches the obvious mistake but not
  the subtle one.
- **Photo limits are inconsistent** — 5 for some entities, 1 for others, with no
  principle behind the split.
- **Two ramp segments** may be the wrong abstraction. Real controllers support
  more, and alternative firings often aren't programmable at all.
- **Рецепти and Маси are structurally similar** — both are
  components-with-percentages. Kept separate deliberately; the duplication is
  conscious.
- **Library built-ins are editable**, so a user edit cannot be distinguished from
  shipped content or reverted.

For what is planned, deferred, or rejected, see [`ROADMAP.md`](ROADMAP.md).
