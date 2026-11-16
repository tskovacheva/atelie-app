# Багра / Bagra

A record-keeping and **reference** application for natural dyeing and eco printing,
by [Crafty Place](https://crafty.place).

**Production (from 1.0): https://bagra.crafty.place** — deployed from `dist/` only (docs/PRODUCTION_RELEASE.md). Any GitHub Pages copy is development, never production.

Багра in Bulgarian, Bagra in English — one name in both languages since 1.0.0-rc126 (§13gb). *Rubia
tinctorum* stays what it always was: madder, a plant in the library.

---

## What it is

Most craft apps are diaries: they store what you did. Багра is built the other way round —
it is a **reference that answers questions**, with a personal experience layer on top:

- What can I expect from oak leaves on cotton with aluminium acetate?
- What colour will a given tannin give on this fabric?
- What result should I expect from a blanket soaked in 1% iron solution?

Knowledge (from literature and practice) and experience (your own trials) are not separate
modules. A **Combination** holds the expected outcome; the **placements** of your own trials
attach to it. Over time the reference stops being someone else's book and becomes a record of
your water, your fabrics and your local plants.

## Running a build locally, with a test database

For trying a build without touching the published app or real data. Nothing is published
and no GitHub Pages setting is involved.

Open a terminal in this folder and serve it:

```
python3 -m http.server 8799        # macOS, Linux
py -m http.server 8799             # Windows
```

Then open `http://localhost:8799` in the browser. Stop the server with Ctrl+C.

**The test database is separate because the address is.** A browser keeps IndexedDB, the
service worker and its cache per origin, so `http://localhost:8799` has its own, shared
with neither GitHub Pages nor any other port. It starts empty; do not import a real backup
into it.

For a stricter separation — one that keeps even this apart from the everyday browser —
start Chrome with a profile of its own:

```
chrome --user-data-dir="%LOCALAPPDATA%\bagra-test-profile" http://localhost:8799     # Windows
open -na "Google Chrome" --args --user-data-dir="$HOME/.bagra-test-profile" http://localhost:8799   # macOS
```

Deleting that profile folder starts again from empty.

(Scripts that did this with a double-click were removed in 1.0.0-rc104: Windows Defender
flagged the `.bat` files heuristically — a command file that starts a server and launches a
browser looks like something it watches for — and a false alarm on every download is worse
than typing one line.)

## Modules

The navigation is in two halves and a rule, along the line the data already draws. On a
laptop it is a bar of two rows at the top — the spaces, then the modules of the space one
is in — and on a phone a header with a drawer (editorial redesign, §14a).

**Reference part** — knowledge that is true whether or not this particular person owns
anything. It ships in seed packs and is read at the desk. Materials and the Library are
here because a substance and a source are the same for everyone; the jars inside a
material record are not, and are never distributed.

| Module | Nature |
|---|---|
| Reference | The reference engine — combinations, searched by key |
| Plants | 57 species, bilingual, each with a description, parts, chemistry and colours |
| Recipes | 16 seeded procedures with proportions; sequences inside. A line can be filled by another recipe — a binder solution is made, not bought (§13dy) |
| Materials | What a substance *is* — formula, ceiling, disposal — with the jars on the shelf |
| Techniques | Controlled vocabulary — 21 records |
| Calculators | %WOF, solutions, bath volume, drying, alum acetate, exhaust, reverse, timer |
| Library | Glossary (32 terms in eight groups), the pH scale drawn as one bar, and the attribution register — 57 sources |

**Diary** — her own work, never distributed. Pigments sits here rather than with the
reference: a batch of made pigment is a thing on a shelf, not a fact about the world.

| Module | Nature |
|---|---|
| My work | Trials, in five screens — dyeing, eco print and, since rc62, printing with a paste |
| Pigments | Batches of made pigment: source, pigment recipe, what was actually used, process notes, result |
| Fabrics | One record per physical piece, with a lifecycle and group actions |

**Beside the spaces, in a menu** — the backup and About, with the language and the units.
Housekeeping filed with one half for want of anywhere else is how a navigation stops
meaning anything.

On a phone the header names the screen and the drawer holds every entry, in the same
groups. (The bottom bar of *Home · My work · Plants · Fabrics* gave way to it in the
editorial redesign, package 1.)

**The phone's Back, installed (§13gm).** In the installed application Back goes one level up —
a record to its list, a list to Home — and Home asks „press Back again to exit" before the
application closes. An open dialog or the drawer closes first; unsaved work is asked about. In a
browser tab Back is the browser's history, as on any site.

**Where a screen opens (§13gn).** A screen opens at its top. Going back up to a list — by Back or by
the screen's own up button — returns to where one was in it; a language change or a filter keeps the
place.

## Four modes, kept apart

The app does four different things, and the interface says which one it is doing. Running them
together was the single biggest usability problem it has had.

| | |
|---|---|
| **Finding an answer** | Reference — partial search, with your own results beneath the expected one |
| **Following a procedure** | A recipe's working view: quantities in large figures beside the step |
| **Recording what happened** | A trial, leading with the result |
| **Editing library knowledge** | Behind an *Edit* button, never the default |

Records open for reading. The form is one click away, and Back from it returns to reading the same
record — one usually corrects a field and wants to see how it reads. The amount on a working view
recalculates the figures and never touches the record.

A record that came with the library says so when the library now holds a different version of
it, and names what differs. „Обнови от библиотеката" shows how many records it would change.
Nothing is updated without the preview.

## Principles

- **Offline-first.** IndexedDB is the only source of truth. No account, no server, no sync.
- **Bilingual in structure, not in obligation.** Interface labels and vocabularies are stored
  as stable codes and rendered per language. Authored reference prose is a `{bg, en}` pair
  whose second half may stay empty indefinitely. Personal notes are never translated.
- **Bands, not exact figures.** Combinations match on ranges — a 1% and a 1.5% iron blanket
  belong together. Exact numbers stay on the trial, where they belong.
- **The app never writes the conclusion.** It can notice that three trials share an input set
  and offer to create a reference record, pre-filled with the raw observations. Averaging
  "grey-green" and "grey-brown" produces nothing meaningful; the practitioner writes what it
  means.
- **Seed recipes are the studio's working recipes; the Library holds the research.** Since
  rc118 (§13fs) every recipe that ships is a practical working recipe curated and adapted in
  Crafty Place practice, credited to that practice, written in the app's own words and naming no
  person or book as its author. The books and articles consulted stay in the Library as research
  and comparison sources — a source listed there does not mean a recipe reproduces it verbatim —
  and the same statement is in About. A recipe shared privately by a practitioner is not
  distributed without explicit permission. Records default to `distributable: false` — legitimate
  to hold locally, not automatically ours to redistribute. Facts are free; wording and a compiled
  database are not, so no plant ships from a single source.
- **A mark accompanies a label, never replaces it.** Sixteen drawings nobody has seen before
  are sixteen guesses, and a picture cannot be read aloud or searched.
- **Safety is a level and a set of actions, not a word.** One flag reading "toxic" would put
  eucalyptus and madder in the same box. Three coded levels and eight coded precautions, so
  the colour renders the code and the translation is free.
- **Derived, not duplicated.** No stored back-references; related lists are computed on open.
- **Empty means unknown, not zero.** A blank pH is not a confirmed neutral bath; a lone quantity is
  an exact figure, not a range starting at nothing. This craft has too many unmeasured variables to
  let the app invent precision it does not have.
- **Confidence travels with the claim.** Every figure can be marked *from literature*, *my own
  trial*, *practitioner advice* or *needs testing* — per field, because a plant's dyeing temperature
  can be well established while its preferred leaf surface is a guess.
- **Backward compatible.** Migrations only ever add.

## Installing it

Багра is a PWA. Open the link in a browser and use *Install app* (desktop) or *Add to Home Screen*
(phone) and it runs in its own window, offline, with its own icon.

Everything stays on the device. There is no account and no server to sync with.

## Architecture

Native ES modules, no build step. What is edited is what runs — no compilation, no
dependencies, nothing to go stale. Vanilla JavaScript, no framework.

```
index.html            shell and styles
app.js                bootstrap, routing, navigation
db.js                 IndexedDB, schema, migrations
i18n.js               dictionary and language switching
vocab.js              controlled vocabularies and band definitions
ui.js                 shared rendering helpers
version.js            the single place a release number is written
backup.js             export, import
guard.js              persistent storage at start; the marker that notices a vanished database
autoarchive.js        the automatic archive — a folder, two files in turn
label-sheet.js        a sheet of studio labels on A4, filled or blank
date-order.js         a finishing dated before the work or its preparation — found, and moved when asked
fabric-logic.js       composition arithmetic and state lifecycle
modules/*.js          one file per module
photo.js              resizing images on the way in
calc/basic.js         % WOF, solutions, bath volume, drying, exhaust
calc/scale.js         generic recipe scaling — roles, ranges, conditionals
calc/alum-acetate.js  stoichiometry with substitution
seed.js               loading and merging reference packs
seed-ui.js            the merge preview
seed/*.json           substances, plants, techniques, combinations, sources
seed/en/*.json        the English of the plant library, kept as batches
screen-check.mjs      every address rendered at phone width, geometry asserted
icons/                app icons
sw.js                 service worker
check.sh              pre-deploy checks — six layers, and the language ratchets (§13eh)
docs/TERMINOLOGY_BG_EN.md  the approved Bulgarian and English terms
check-scope.js        undeclared assignments, doubled handlers, missing icons
check-boot.mjs        boots the real module graph, vocabulary and reachability
deep-check.mjs        opens every record, clicks through, asserts behaviour
```

## Protecting the data

Everything lives in IndexedDB in the browser. It survives deployments — code and data are
separate — but two things will destroy it, and both are avoidable:

1. **Private/incognito windows store nothing.** Anything entered there is gone when the window
   closes. Use a normal window and `Ctrl+Shift+R` to bypass the cache instead.
2. **Clearing site data** wipes the database. Necessary occasionally during development; make a
   backup first.

Калкулатори → Резервно копие downloads everything as a dated JSON file, and shows how many edits have happened
since the last one. The app asks the browser for persistent storage at **every start** (§13go), so
the database is not evicted when space runs short, and Home says so in one line when the browser has
not promised. That does not protect it from clearing site data, and on an iPhone Safari may still
remove storage for a site not used for a while; installing it to the home screen is safer
(DOCUMENTATION_DECISIONS_NEEDED §39).

**A database that vanished says so (§13go).** The app keeps a small note outside the database — how
many of your records this device held. If the database opens empty while the note says there was
work, the app does not pass it off as a first install: it opens on the backup screen with „The data
on this device is missing", and Home says the same, until a restore or *Start afresh* answers it. It
recovers nothing by itself — a backup file is still the only copy outside the browser — and a
browser that clears the note along with the database leaves nothing to compare.

**The automatic archive (§13gp).** On the backup screen, *Choose a folder* once — for example
`Documents/Bagra`. From then on Bagra writes a backup there by itself, half a minute after a change
and when you leave the app, into two files in turn (`bagra-auto-1.json`, `bagra-auto-2.json`): the
newer of the two is never the one being written, so an interrupted write cannot take the only copy.
Each is an ordinary backup and is restored with *Choose a backup*. If your records suddenly number
fewer than at the last write, and not because you deleted them, the archive is held rather than
written over, and Home says so. When the browser asks for permission again, Home shows a button. It
protects the device in your hands from the browser deleting its data; it does not protect a lost
phone. Desktop Chrome and Edge, and Chrome on Android; not iPhone or Firefox, where the screen says so.

**A finishing dated before what it finished (§13gr).** When a work's *Finished on* is earlier than the
work's own date or the preparation its pieces had for it — typically because those were written down,
and dated, days later — saving lists what is later and saves nothing until you answer: *Move them to
<date> and save* moves the work's date and the baths (and every piece in a shared bath, which the list
names), or *I will correct them myself* links each bath. The cloth's state date follows *Finished on*
while they were the same. A piece already recorded that way says so on its record.

**A plan's lines name pieces (§13gt).** Under each line of a plan: *Details*, free text for what a table
row would hold, and *Add a piece…* to name the pieces the line is about. The plan as read shows each
piece's stage now and the works that used it; the piece's record lists the plans that name it. A piece a
plan names cannot be deleted until it is taken off the line.

**A working solution is not a treatment (§13gs).** A recipe that prepares a solution for the next recipe
— „Приготвяне на работен разтвор алуминиев ацетат" — stays in the piece's history but not in its
treatment, trail or label: the aluminium acetate chain reads „AA + CaCO₃". An installed copy picks this
up from Recipes → „Обнови от библиотеката".

**A sheet of labels (§13gq).** In Fabrics, tick the pieces — *Select all shown* ticks everything the
chosen box and the search show — and choose *Print labels* (white, with each stage's edge and dot) or
*Print by stage* (black on white, one page per stage, for paper already the stage's colour). *Blank
labels* prints a full page to fill in by hand. 63.5 × 38.1 mm, 21 to an A4 page, cut on the dashed
lines. Each label: tag number and date, the stage, Treatment, Technique, Plants — a row the record
cannot fill is left as a line to write on.

**Restoring.** *Return the database to the file* is a snapshot: it asks first, naming the file's date
and how many of your records will go, and either restores everything or nothing. *Add only what is missing* adds what this device lacks; where a record of yours is on both
sides it keeps the newer one — the file's when it was edited later, this device's otherwise — and says how
many of each (§13gg). A file from a newer version of the app is refused — update first (§13ft).

## Running it locally

ES modules need a server; opening `index.html` by double-clicking will not work.

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying

**How a release is handed over.** Every version comes as two packages and a list, made by
`sh scripts/make-packages.sh <archive of the release in git> <out-dir>`: the whole tree
(`bagra-<v>.zip`, documents inside), only the files that differ from the release in git
(`bagra-<v>-changed.zip`, same paths), and `CHANGED_FILES-<v>.txt`, which also names any file to
delete by hand. GitHub's web upload takes at most 100 files per commit, and the tree is over 300, so
the changed files are what is uploaded — to `staging`, tested there when needed, then the pull
request into `main`. The base is the release that is IN git, not the last package handed over: a
version that was never uploaded is folded into the next one (rc139 into rc140).

Production is a Git-connected Cloudflare Pages project (§13gj): Cloudflare builds `dist/` with `node scripts/make-release.mjs` and serves only that, plus the licence Function in `functions/` (`/api/license/*`). Branch `staging` is the preview, `main` is production: Cloudflare deploys every merge to `main` by itself, and the pull request `staging` → `main` is the explicit step (§13gj, amended at rc137). Production uses live Polar since 14 October 2026. The repository is private and holds source only — no ZIPs, no secrets; Polar is configured with Cloudflare environment variables. The procedure, staging included, is docs/PRODUCTION_RELEASE.md (§13ga). Before every deploy:

```sh
sh check.sh
```

Six layers, each of which exists because something got through:

1. **Cache completeness** — a module missing from the service worker list silently
   stops updating.
2. **Scope, handlers and icons** — a variable assigned without being declared throws
   only when the line runs, usually on a click; a module assigning `root.onclick`
   twice loses the first one silently; a `<symbol>` named but absent renders as a
   hole rather than an error.
3. **No file input forces the camera.** `capture="environment"` does not prefer the
   camera, it removes the gallery — so a photograph already taken cannot be attached.
4. **Boot** — every module opens, every vocabulary term reaches the database, every
   module is reachable from the navigation.
5. **Deep check** — opens every record, clicks through the flows, and asserts
   behaviour: that collapsed steps survive a save, that search narrows and clears,
   that a record shows the colours its row promised. Events are sent as a browser
   sends them — a field is typed with `input` AND committed with `change`; a guard
   that sent only the first let the working view empty itself unseen (§13dt).
5b. **A pack update against an installed copy.** Every layer above reads the shipped
   files, where a record removed from a pack is simply not there; on a real
   installation it is. This one seeds the previous pack into a database, applies
   this one, and checks what actually left — and that an edited record and the
   user's own records did not.
6. **Screen rendering** — every address drawn in a real browser at a phone width,
   checking geometry: nothing overflowing sideways, no control smaller than a finger.
   **Which addresses it draws is itself checked**, statically, by
   `scripts/try-screen-coverage.mjs`: the route list is written by hand, and `#/pigments`
   was absent from it for several releases, so a module was measured at no width at all
   while the suite reported „all held". A module must be routed or named in
   `UNMEASURED_MODULES` with a reason (§13dm).
   **Every field a pack carries is named in words**, in both languages, by
   `scripts/try-pack-field-labels.mjs` — the preview and the record's library note
   print these names (§13du). **Every shipped recipe line names what goes in** — a
   plant or a library substance — or is listed with a reason, by
   `scripts/try-recipe-lines-named.mjs` (§13dv).

Anything timed in the deep check waits on a condition, never on a duration, and any
new guard is tested in both directions — a guard never seen to fail has not been tested.

Then bump `VERSION` in `version.js` and `CACHE` in `sw.js` to match.

### What the number means

`0.MINOR.PATCH` — the middle digit is the minor version.

- **Patch** — a fix, a wording change, a styling correction, **and any change to seed data**. New
  plants or corrected temperatures do not change what the app can do.
- **Minor** — a new module or a genuinely new capability: the reference engine, trials, the update
  flow.
- **1.0** — when the last planned module ships and the app is complete as specified.

The minor ran to 55 because early releases bumped it for seed-data updates as well. A version
number that increments for everything communicates nothing; from 0.55 onward the rule above holds.

Installed copies do not need to be closed and reopened: the app checks for a new worker whenever
it becomes visible, when the network returns, and every fifteen minutes, and offers a *new version
— update* bar rather than swapping code mid-edit. **A release is one cache (§13fu):** until *Update*
is pressed, or every window is closed, an installed copy runs the release it has — a plain reload
does not bring in the new one. That is what keeps a page from ever holding two releases.

**If a release is bad:** never roll the database back. With the same `DB_VERSION` in both releases,
go back at once — Cloudflare's rollback of the production deployment, or revert the pull request on
`main` — and ship the fix under a NEW version number. If the bad release raised `DB_VERSION`, fix
forward only. The runbook has both steps (docs/PRODUCTION_RELEASE.md §7). Serve over HTTPS only. Калкулатори → Резервно копие also has a manual check. A module missing from that list is a module that silently stops
updating — the one mistake this architecture invites.

## Documents

- `FUNCTIONAL_SPEC.md` — the source of truth. Every decision lives there, not in chat history.
- `ROADMAP.md` — what remains, in three lists: what a paid release needs, what comes
  after it, and what is deliberately not planned. History moved to `CHANGELOG.md`.

**A release is one cumulative ZIP of the whole application, and the documents travel
inside it.** Not patches, not diffs, and not the documents handed over separately
beside the archive — the owner should be able to open one file and have the code and the
reasoning for it in the same place, at the same version. A document delivered apart from
the build it describes is a document that will later be read against the wrong code.

`CHANGELOG.md` holds the history that used to sit at the bottom of the roadmap — what was
built, in what order, and what was got wrong first.

`DOCUMENTATION_DECISIONS_NEEDED.md` lists the places where the documents and the code do
not agree and the choice between them is the owner's, not the developer's. It is short by
design: if it grows, the documents have stopped being read.

## The reference library

57 plants, each carrying: a general description, what it gives, the parts used, the dye
constituent, sources, a colour palette with conditions, a safety level with precautions,
growth form and habitat, chemistry per part, and dosing, temperature and permitted
extraction methods per part.

Gathering months are recorded **per part**, because the leaf and the bark of one tree are
not gathered in the same weeks — 118 of 118 parts answer, seven of them saying they are
bought rather than gathered. The months are as observed in Bulgaria and the pack says so:
a gathering month is a fact about a plant in a place.

342 sections, in both languages. The English is a translation made by the developer, not a
second authorial voice, and is marked for the owner's review before public distribution.

**The combination engine holds 163 records over 55 of the 57 plants**, 55 of them eco print.
The two without one — lavender and medlar — are a documented absence rather than unfinished
work, and the reasons are in `DOCUMENTATION_DECISIONS_NEEDED.md`. Many records do not name the
fibre or the mordant strength, because the sources they came from do not; the screen says
„does not state" rather than passing silence off as agreement or as a difference. More
combinations per plant is post-1.0 enrichment.

All 57 plants say what colour they give — 176 swatches, each recording the process and the part
that produced it, because the same leaf gives yellow in a dye bath and near-black under iron in an
eco print. Colours drafted from literature are marked as such; a hex derived from a colour name is
an illustration, not a measurement. Confidence is recorded **per field**, not per record — a
dyeing temperature can be well established while a leaf surface is a guess.

Every photograph carries author, licence and source, shown under the picture. A photograph
with no recorded author is not shipped: the import script refuses it.

## Attribution

Reference material is credited to its sources, and the credit is a CODE that resolves in the
register — never a name in free text (§13ea). **57 sources are registered**; a source cited by
a record cannot be deleted.

Principal sources so far: Chandra Rice ([chandrarice.ca](https://www.chandrarice.ca)) —
*Ecoprinting 101*, *The Eco Printer's Field List*, *The Ecoprinter's Plant Guide*, and the
aluminium acetate calculator; Joy Boutrup and Catharine Ellis, *The Art and Science of Natural
Dyes*. For research and comparison the Library also lists Natalie Stopka, *From Plant to
Pigment*; Joanne Green, *Natural Watercolor Paint Making*; Nicola Cliffe, *Printing with Natural
Dyes*; Alison Kelly, *Printing from the Garden*; Michel Garcia; and the Maiwa School of Textiles.
The recipes themselves are the studio's working recipes (§13fs).

Until rc117 a recipe credited the books it drew on, sometimes more than one. Since rc118 a recipe
credits the studio's practice, and the relationship between a recipe and the books behind it is
the disclaimer's, not a field (§13fs).
