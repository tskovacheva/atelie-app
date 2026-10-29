# Глина — Functional Specification

**Version:** v1.31.0 · `atelie-v85`
**Last revised:** October 2026
**Live:** https://tskovacheva.github.io/atelie-app/
**Repo:** github.com/tskovacheva/atelie-app

> A description of what the application does, module by module. It describes the
> built state; planned work lives in [`ROADMAP.md`](ROADMAP.md).

---

## 1. Purpose and scope

**Глина** ("Clay") is a record-keeping application for a working ceramic
studio. It tracks the life of handmade ceramic work — from raw material through
forming, decoration, and firing, to the finished piece — plus the glaze recipes,
materials, and test results that feed into it.

**Audience.** Built in and for one studio (Crafty Place, Vlado Trichkov,
Bulgaria). Since October 2026 it is being prepared as an application for other
ceramicists, planned at glina.crafty.place, without losing the depth of the
original tool; whether it will be free or paid is not decided. The preparation
plan (tests, migrations, modules, neutral starter data, safe import, privacy
policy, bilingual interface) is in [`ROADMAP.md`](ROADMAP.md), part Ж.

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

**Language.** Bulgarian UI. Interface text goes through a dictionary (`DICT`,
`t()`), prepared for a second language; author text (names, notes, articles) is
never translated.

---

## 2. Technical architecture

| Aspect | Choice |
|---|---|
| Form factor | Progressive Web App, installed on Android via Chrome |
| Code | `index.html` (~9,700 lines, 0.56 MB): inline CSS + vanilla JS, no framework; plus native ES modules (`app.js`, `core/`, `calc/`, `domain/`) — see *Modules* below |
| Build step | None. What is edited is what runs; GitHub Pages serves it. |
| Supporting files | `sw.js` (service worker), `app.webmanifest`, icons, `seed/guides.json` (built-in library), `validate.js` and `tests/` (not used at runtime) |
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

**Never overwrite on doubt (v1.27.1).** A data-loss incident in October 2026 showed
that the defences above could be defeated by the app itself. The whole database is
one large value (`atelie_v6`, several MB). When it could not be read — Chrome on
Android occasionally fails to read large IndexedDB values — the read error was
treated as "no data", `load()` seeded the starter set and saved it **over** the real
record. The safety net stayed silent because `load()` saved before the check ran,
and the save moved the fingerprint to the empty state. Since v1.27.1:

- Reads distinguish *absent* from *unreadable* (`_idbGetStrict`). An unreadable key
  is retried once; if it still fails the app enters the broken state (no writes at
  all, an explicit message), never the empty state. A boot failure does the same.
- A record that is present but not valid JSON is never overwritten: a copy is kept
  under `atelie_v6_unreadable_<timestamp>` and the app stops.
- The shrink check runs **before** the first save on open. It also fires when any
  single collection loses more than half (≥5 before), because the 45 starter
  materials and 5 recipes otherwise mask the loss of every piece, and whenever
  `atelie_v6` is missing on a device whose fingerprint shows data.
- While data looks collapsed (`_dataCollapsed`) the fingerprint and the auto-archive
  are frozen, and the starter set is not saved. The user either imports a backup or
  explicitly confirms starting over.
- The auto-archive never overwrites its file on its own with fewer than half the
  records it last wrote (`atelie_auto_total`); from a button press it asks first.
- IndexedDB writes count as done on `transaction.oncomplete`, not request success.
- The storage label shows whether persistent storage was granted.

**Per-record storage (v1.28.0).** The single large value is gone. Each record is
its own key in the same `kv` store: `rec:<collection>:<id>` (pieces, recipes,
materials, tests, firingProfiles, firingRuns, series), plus `rec:meta` holding
`_migrations` and the order of records in each collection, and `atelie_layout`, a
marker written only after a verified migration. The in-memory `DB` is unchanged,
so nothing outside the storage layer notices.

- A save serialises the DB, compares each key with what is confirmed on disk
  (`_recDisk`), and writes only the changed keys and deletions in one transaction.
  Editing a piece writes that piece's key alone.
- Photos stay inside their record (an image-heavy piece is still a large value),
  but a failed read now costs one record, not the database.
- A record that cannot be read on open is skipped, reported, never deleted or
  overwritten, and comes back on the next open if it reads again. A key that is not
  in the order list is appended, never dropped. Only shared keys (meta, marker,
  legacy) failing still put the app in the broken state.
- Migration on the first open of v1.28: write all records, read every key back and
  compare string for string, then write the marker. Any failure leaves the app on
  the old layout with `atelie_v6` intact; leftovers of an interrupted attempt are
  deleted in the next attempt's transaction, so deleted records cannot reappear.
- `atelie_v6` is kept untouched as a fallback for 7 days after migration, then
  removed automatically — unless some record was unreadable on that open, in which
  case it stays, as the only place that record could be recovered from.
- New installs start on the per-record layout directly. The localStorage fallback
  (no IndexedDB) still uses the single value.

### Schema version and migrations (v1.30.0)

`SCHEMA_VERSION` is the version of the data format. It is written into `rec:meta`
(`schema`) and into every backup (`schemaVersion`) — one number for both. It
changes only when a migration changes the format, not with every app version;
v1.30.0 was 4; v1.31.0 is 5 (identity: codes and unit numbers).

The three historical migrations (v1.3.2, v1.4.2.3, v1.15.0) stay in
`runMigrations()` as they were. New ones are registered in `_SCHEMA_MIGRATIONS` as
`{id, schema, about, select(db), apply(rec, db)}` and run by
`_runSchemaMigrations()` after `load()`, before the first render:

- **Only additive.** A migration adds; it never deletes or rewrites a value on a
  guess.
- **Snapshot first.** Before touching anything it writes a copy of exactly the
  records it selected (`snap:<id>:<collection>:<record id>`) in one transaction and
  waits for it to complete. No confirmed snapshot, no migration.
- **Once.** Applied migrations are logged in `DB._migrations[id]` with the time,
  the number of records changed and the snapshot expiry.
- **Fails safe.** If `apply` throws half-way, the touched records are restored
  from the snapshot and the chain stops; the app opens on the unmigrated data.
- **Reversible.** `_restoreMigrationSnapshot(id)` puts the snapshotted records
  back (from the console, if a migration turns out wrong). Snapshots expire after
  7 days (`_dropOldSnapshots`).
- **Rollback.** Because fields are only ever added, the previous release reads
  data written by this one. The test suite opens such data in the previous
  releases (`tests/previous/`) and back again.
- Data stamped with a newer schema than the app knows still opens, with a console
  warning.

The first migration is `2026-10-identity` (v1.31.0, schema 5): codes for pieces and
series by creation date, unit numbers for split pieces by split order; counts and
stages untouched. The same fill also runs on every open and after an import, for
records made by an older version after a rollback.

### Identity (v1.31.0)

- **Code** `GL-<year>-<n>` (`GL-2026-014`) on every standalone piece and series,
  given at creation in order, never reused. A split piece has no code of its own:
  it shows the series code + its unit numbers (`GL-2026-014/3`, `…/1–4`), derived.
- **Unit numbers.** A series keeps `nextUnitNo` and `retiredUnits`; a split piece
  keeps `units`. A split takes the lowest free numbers; lowering the count retires
  the highest unsplit ones; raising it adds new numbers after the last. A number is
  never given twice.
- **Piece → series.** A standalone piece's editor has „Брой“; more than 1 turns the
  record into a series with the same id and code; its steps, photos and firings
  become shared by all units.
- **Take out of the series** copies the shared steps into the piece (`copiedFrom`),
  keeps its code and numbers (`fromSeries`), and lowers the series count.
- **Archive.** Delete archives (`archivedAt`): hidden from the list, kept in firings,
  series and yield. The „Архив“ filter shows archived records with „Върни“ and
  „Изтрий завинаги“.

### Modules (v1.30.0)

Modularisation is gradual. New code is born as a native ES module; old code moves
when it is touched. `index.html` loads `app.js` as a module, which imports the
modules and, while the classic code still calls their functions by name, puts them
on `window` (the bridge). The bridge shrinks module by module as callers become
modules themselves.

| Module | Contents |
|---|---|
| `core/merge.js` | `_mergeEdit`, `_EDIT_OWNS` — edits merge into the stored record (see §9) |
| `calc/shrink.js` | `_shrinkPcts`, `_poroPct` — body-test shrinkage and absorption |
| `domain/profile.js` | `_fpRamps`, `_fpPeak`, `_fpDuration`, `_fmtDuration`, `_numOrNull` — firing programme |
| `domain/units.js` | codes and unit numbers: `_nextCode`, `_assignCodes`, `_seriesFreeUnits`, `_allocUnits`, `_countChange`, `_unitsLabel`, `_migrateSeriesUnits` (v1.31.0) |

Modules run after the page is parsed. Boot waits for the bridge before it loads any
data; if it does not arrive within 8 seconds (a file missing after an upload), the
app says so, enters the broken state and writes nothing. Every module and every
`seed/*.json` must be listed in `sw.js` `PRECACHE_URLS`, or it would silently stop
updating offline — `validate.js` checks this.

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
DB = { pieces, recipes, materials, tests, firingProfiles, firingRuns, series, _migrations }
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
edited, and deleted. Built-ins are locked (v1.25.0): they are copied to be edited,
and missing ones can be restored.

**Where the built-ins live (v1.30.0).** `seed/guides.json` — about half of what
used to be `index.html`. It is read at boot and cached by the service worker with
the rest of the app, so it works offline. It matters only for a new install (the
library is seeded once, into `atelie_userlib`) and for restoring missing guides. If
the file cannot be read (first open with no network), the library is left
untouched — nothing empty is saved — and the next open seeds it.

**Also housed here:**

- **Backup** — export the whole database as a JSON file (`schemaVersion`, now 4 —
  including firingRuns since v1.17.0 and series since v1.20.0); import to
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

**Edits merge, never rebuild (v1.29.0).** Every save function builds the record
from its form and then merges it into the stored one with `_mergeEdit`. `_EDIT_OWNS`
lists, per form, the fields that form owns. Owned fields come from the form —
including clearing: an owned field the form does not return is removed, exactly as
before. Every other field of the stored record survives. The same rule applies one
level down (`event.data`, `test.body`, `material.raw`, `material.chem`,
`mass.blend`). A new form field must be added to its owned list, or it cannot be
cleared. This is what lets new fields (kiln positions, piece codes) be added without
every older form erasing them.

**Deploy validation.** `sh tests/check.sh` runs every layer; each exists because
something got through without it:

1. `validate.js` — syntax; every `getElementById` target exists; every called
   function is defined (module exports count); geometry at phone width (44 px
   targets); modules exist, parse, and are in the offline cache.
2. Versions — `APP_VERSION` and `CACHE_NAME` are both ahead of the previous
   release, and the three documents name the current version.
3. Unit — the pure module functions against hand-worked values.
4. Golden — the real app in Chromium (Playwright, real IndexedDB) boots fixed
   archives (representative, legacy shape, fresh install, any private archive in
   `tests/fixtures/private/`, never committed) and everything derived — stages,
   merged timelines, run lists, yields, versions, shrinkage, curves, backup shape,
   the rendered list — must equal the stored snapshot; reopen gives the same;
   export → import round-trips; a missing guides file or module is handled safely.
5. Edits — for 13 kinds of record, an edit saved unchanged changes nothing; an
   unknown field (top-level and nested) survives; a cleared field is removed.
6. Migrate — schema stamp, snapshot, once-only, failure restores, expiry, rollback
   to each release in `tests/previous/` and forward again. Also: every record of a
   private archive survives an unchanged edit.
7. Screens — 25 screens, tabs, details and editors show the same text as the
   previous release.

---

## 10. Non-goals

Named so they are not mistaken for gaps:

- **No commerce** — no sales, customers, orders, commissions, pricing of finished
  work
- **No scheduling** — no kiln calendar, no reminders, no deadlines
- **No multi-user** — no accounts, sharing, or permissions
- **No cloud sync** — outside the current plan; data stays on the device, moved
  by export/import and the auto-archive file
- **No framework migration** — vanilla JS is a constraint, not an oversight

---

## 11. Known trade-offs

- **Import replaces rather than merges.** Moving work between devices requires
  strict serial discipline: export from A, work on B, import back to A, with no
  edits to A in between. The staleness guard catches the obvious mistake but not
  the subtle one.
- **Photo limits are inconsistent** — 5 for some entities, 1 for others, with no
  principle behind the split.
- **Рецепти and Маси are structurally similar** — both are
  components-with-percentages. Kept separate deliberately; the duplication is
  conscious.

For what is planned, deferred, or rejected, see [`ROADMAP.md`](ROADMAP.md).
