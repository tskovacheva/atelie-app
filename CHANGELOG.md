# Changelog

The history that used to live at the bottom of `ROADMAP.md`. It was moved here in the
1.0.0-rc23 documentation audit so that the roadmap could be what remains rather than
what has happened.

It is kept because the reasoning is worth more than the list of versions. Most entries
say why a thing was built the way it was, and several say what was got wrong first.

For the decision behind a change, `FUNCTIONAL_SPEC.md` is the source of truth: it is
numbered by section and every entry from §13bq onward cites the version it shipped in.

---

## 1.0.0-rc144 — 16 November 2026

A plan's line names its pieces and carries details (§13gt). Her six-piece plan for eucalyptus and a green ground
on cotton was a table, and its pieces were already entered; a plan held plain lines and could name nothing. Now
each line has optional *Details* (free text, line breaks kept — no table: what was done is recorded on the work)
and optional pieces, chosen from her cloth by tag number. Read, the plan shows each piece's stage now and every
work that used it; the piece's record lists the plans that name it. Both derived on open; the piece and the work
are not written to. A plan naming a piece is a pointer in refs.js, so such a piece is refused deletion until it is
taken off the line. Old plans open and save with nothing added to their lines. New check
`scripts/try-plan-pieces.mjs`; each guard seen failing with its line changed.

## 1.0.0-rc143 — 12 November 2026

Making the working solution is not a treatment of the cloth (§13gs). Six pieces through the aluminium acetate
chain printed „Обработка: Приготвяне на работен …" on the sheet, and „CaCO₃" alone on the single label, where the
Studio System promises „AA + CaCO₃". The chain records its four steps faithfully; the preparation of the solution
— alum, soda and vinegar mixed, the cloth not yet in it — was read as a mordant on the cloth and, having no short
code, led with its whole name; and the M summary took „the latest mordant", which the chain's chalk bath is. Now
`recipe_output` has `solution` (the preparation carries it; recipes pack 0.21.2), and an action whose recipe makes
a solution or an extract stays in the piece's history but out of its box, summary, trail, label and sheet; and M is
the mordanting since the last wash or tannin. On her backup the seven AA pieces read „AA + CaCO₃"; the other
eighteen are unchanged. An installed copy takes the field from Recipes → „Обнови от библиотеката". New check
`scripts/try-solution-step.mjs`; each guard seen failing with its line changed.

## 1.0.0-rc142 — 12 November 2026

A finishing dated before what it finished (§13gr). Found by the owner on П-023, a silk scarf printed and finished
on 18 September and shown as M: its preparation — four baths of the aluminium acetate chain — and the work's own
date said the 25th, the day they were written down. Read in date order, the mordant came after the finishing.
Nothing in the derivation was wrong; nothing said the record was impossible, and she had no way to correct it.
Now the finishing screen compares *Finished on* with the work's date and the preparation the work used, and when
anything is later lists it and saves nothing until she answers: move them to the finishing date (bath by bath,
every piece's copy with it, a shared bath named first; in one transaction with the result), or correct them
herself from links to each bath. The cloth's state date follows *Finished on* while the two were equal. A piece
already recorded so says it on its record, with a link. The trail's „finished" is now the status's, so the header
and the trail cannot disagree; and on one date the finishing sorts last. On her backup only П-023 reads
differently, and after the move it is D · finished. New check `scripts/try-finish-dates.mjs`; each guard seen
failing with its line changed.

## 1.0.0-rc141 — 12 November 2026

A sheet of studio labels on A4 (§13gq), at the owner's request. 63.5 × 38.1 mm, three across and seven down —
21 to a page on plain paper, cut along dashed lines drawn once between labels. One layout, filled or blank: the
tag number and date, the stage, and three rows — Treatment, Technique, Plants — written from §13ge's derivation
for a chosen piece, or left as lines with five stage boxes and her prefix for a blank page. A row the record
cannot fill stays a line, never a dash or a guess. In Fabrics the selection bar gains *Print labels* (white,
each stage's edge and dot, tag order) and *Print by stage* (black on white, a page per stage, named in the
margin, for coloured paper); the filter row gains *Select all shown*, which follows the box and the search; the
page gains *Blank labels*. Colour stays a mark as §13gf decided — the owner confirmed it. The A4 page rule is a
style added for the print and removed after, so the single 70 × 40 label is unchanged. Nothing is stored. New
check `scripts/try-label-sheet.mjs`; each guard seen failing with its line changed.

## 1.0.0-rc140 — 16 October 2026

rc139 was not deployed on its own; rc140 carries it, and its packages are made against rc138. From this
version every release is handed over as two packages and a list (`scripts/make-packages.sh`): the whole
tree, the changed files only, and the list of what changed.

The automatic archive (§13gp). The owner's decision after the loss of 16 October: a person forgets to make a
backup, and a paid application must not depend on remembering. A folder is chosen once on the backup screen;
Bagra writes an ordinary backup there half a minute after an edit, when the application is left, and at start
if an edit never reached it. Two files in turn, each write to the older, because on Android a write is not
atomic and a single file would be the only copy being written. The folder's handle lives in a new store
`device` (DB version 11) — never exported, never restored, gone with the database, so an evicted Bagra has
nowhere to write. Before writing, her records are counted: fewer than at the last write and not explained by
deletions she made, and the write is held and Home says so, with „Write anyway". A permission the browser
takes back waits for a tap; a failed write keeps the newer file and says so. While it works, the „no backup"
lines stay quiet. The loss notice names the folder. New check `scripts/try-auto-archive.mjs` against a fake
folder; each guard seen failing with its line removed — one of them found a real fault on the way: an edit
saved a moment before the page was hidden was not yet marked pending, and the write on leaving found nothing.

## 1.0.0-rc139 — 16 October 2026

After the production data loss of 16 October 2026 (§13go). The owner's phone, 98 % full, opened Bagra with
none of her work; a day was lost. An audit of `db.js`, `backup.js`, `app.js`, `seed.js` and `migrations.js`
found no way for Bagra to overwrite itself — every record is its own row, every failed read rejects, seeding
only adds — and three gaps: persistent storage was asked for only when the backup screen was opened; an
evicted database opened as a first install, the welcome panel drawn over the loss; a database that would not
open left a blank screen. Now persistence is asked at every start and Home says, in one line, when the
browser has not promised; a marker outside the database (`localStorage['bagra.guard']`, how many of her
records this device held) lets the start tell a vanished database from a first install, land on the backup
screen and say so until a restore or *Start afresh* answers it; and a failed open shows a message in both
languages and writes nothing. The durable answer — a copy outside the browser — is open in ROADMAP A5. New
check `scripts/try-storage-guard.mjs`, ten launches; each guard seen failing with its line removed.

## 1.0.0-rc138 — 15 October 2026

A screen opens at its top, and going back up returns to the place in the list (§13gn). Reported by the
owner while recording the phone screens: a record opened from the bottom of a long list opened half-way
down, because nothing ever set the scroll position when the screen changed — the window kept the previous
screen's. A move now records the position of the screen it leaves and tells the draw how to land: at the
top, or — when the move goes up, as the phone's Back means up (`upFrom`, §13gm) — where that screen was
left this session. A redraw that is not a move (language, units, a filter) keeps the place; the current
module's navigation entry draws it again from the top. The browser's own scroll restoration is turned off,
since it would fight the rule on the browser's Back. New check `scripts/try-scroll-position.mjs`, seen
failing with the reset removed (the plant opened at 1800 px, as reported) and with the restore removed.

## 1.0.0-rc137 — 15 October 2026

The phone's Back button in the installed application goes up, and Home asks before leaving (§13gm). Every
move inside Bagra used to add a page to the history, so Back walked through everything visited. Installed,
a move now replaces the current history entry above a fixed floor (Home); Back lands on the floor and the
application puts back the screen one level up — where the screen's own up button points, else the address
minus its last part — or, on Home, stays and says „press Back again to exit"; a second Back within two
seconds closes the application. A dialog or the drawer closes first; unsaved work is asked about; without a
licence the licence screen is Home. In a browser tab nothing changes. One new file, `backnav.js`; the five
places that set `location.hash` directly now go through `navigate`, and a check refuses a new one. New check
`scripts/try-back-button.mjs`, seen failing with a push in place of the replace, without the floor's marker,
and with a direct `location.hash =` in a module.

The licence screen no longer shows an activation message under „Active": seen with two incognito windows,
one at the device limit and the other activated. Each message records which action it answers, and the
active state shows only a release's. The device label sent to Polar carries the time („Chrome · Windows ·
14 Oct 2026, 10:48"), so two activations from one day can be told apart in the portal. The print check
presses the button itself (`el.click()`) instead of a point the sticky top bar could cover in CI — the
application was not at fault. Library sources pack 20: Chandra Rice's entry in the owner's own words; four
entries given the `url` field every other entry has. The runbook and §13gj describe deployment as it runs
— automatic from `main`, the pull request as the explicit step, live Polar, the domain on `bagra-app` —
and rollback as two ways back, Cloudflare's or a reverted pull request, safe only while `DB_VERSION` is
unchanged.

## 1.0.0-rc136 — 14 October 2026

The licence screen's reason, in words that are true whatever Polar meant (§13gl). Measured on staging: a key
disabled in Polar answers the weekly check with "not found", the same answer as a replaced key, and Polar
drops the key's activations when it disables it. The screen said "the key no longer exists... replaced in
the customer portal" for a disabled key. The two "not found" reasons now name every case that produces them
(replaced, disabled, refunded; released from the portal) and point to the portal. The locking itself was
right and is unchanged.

## 1.0.0-rc135 — 14 October 2026

A piece of work is called by its cloth on every screen (§13gk, finishing §13as). Reported by the owner: a
cloth renamed in Fabrics kept its old name on the trial's own screen. The list of work and the home screen
already took the name from the cloth; the work's read view, its form, the finish screen, „starts from",
the earlier runs, the cloth's „used in trials" and the Reference's observation link still read a copy taken
when the work began. They now all derive it. New work takes no copy; renaming a cloth empties the titles of
its work that are exactly the old name, and leaves any title with words of her own. The home screen's
welcome line printed „undefined sources": the sources are now counted. New release check
try-work-title.mjs; seen failing on rc134. Staging confirmed the licence end to end against Polar sandbox:
activation, offline start, release from the app, and the portal lists activations with a release button.

## 1.0.0-rc134 — 13 October 2026

The licence (§13gj). Bagra opens only its licence screen until the device is activated with a Polar key;
Backup / export and About stay open without one. After activation it works offline indefinitely; a
silent check runs in the background after 7 days, at most once a day, and only Polar saying „not valid"
can lock — no network, a timeout, a server error or a broken deployment never does. Licence is its own
item in the menu under Backup, with a key; the screen shows the status, the masked key, when it was
activated and last checked, this device, Release this device and the customer portal. The licence lives
in localStorage, never in a backup. New Pages Function `functions/api/license/[action].js` is the only
thing that talks to Polar, configured by Cloudflare variables; nothing in the repository. New release
checks try-license-function.mjs (fake Polar: every failure is `unavailable`, never `invalid`) and
try-license-app.mjs (Chromium: gate, activation, offline, revalidation, revoked, limit, release,
environment change, restore); both seen failing on rc133. Deployment moves to a Git-connected Pages
project — `staging` previews, `main` production by an explicit step; §13gi amended (production is Pages
behind a GoDaddy CNAME, not Workers).

## 1.0.0-rc133 — 13 October 2026

The installed app starts again on Cloudflare (§13gi). On staging the first visit worked and every start
after it was ERR_FAILED: Cloudflare answers /index.html with a redirect to /, the worker had stored that
redirected answer as the shell, and a browser refuses a redirected response for a page load. The shell
is now cached and served as ./, and a response marked redirected is never handed out as it is. New
release check try-host-redirect.mjs serves dist/ as Cloudflare does and plainly, and starts the
installed app online and offline on both; seen failing on rc132. Hosting: Cloudflare Workers with
Static Assets, not Pages — staging `bagra-staging`, production `bagra` on bagra.crafty.place.

## 1.0.0-rc132 — 2 October 2026

Recipe cards on a phone keep their words inside (§13gh). A long type — „бои, пасти и свързващи вещества"
— ran up to 114 px past its card: the desktop's one-line rule for the type stayed on in the cards, and a
flex item cannot shrink below its content. Below 640 px the values now shrink and wrap, and an unbroken
string breaks rather than widen the card; the desktop table is unchanged. New release check
try-recipe-cards.mjs measures text against its card at 320–412 px in both languages.

## 1.0.0-rc131 — 2 October 2026

Data safety (§13gg). A plan's source, label and picture vanished on the phone after a backup and a
restore. The backup held them; the MERGE dropped them: the phone already had an older copy of the plan,
and merge kept what was there. Merge now keeps the newer version of a record of hers by `updatedAt` —
the file's when it was edited later, this device's otherwise — and says how many of each. Backups made
before are whole: merging them again restores what was missing. New release check try-plan-backup.mjs:
a plan with a picture across clean and older-copy devices, the picture decoded on screen.

## 1.0.0-rc130 — 2 October 2026

Legacy finished pieces read their work (§13gf). A piece finished before the action model was whole
showed RAW, W or M although a completed eco print or dye bath lists it as one of its pieces. The studio
now adds the colouring that work proves — only when the piece has no dye action, only from structured
links (`fabricIds`, an action's `trialId`), never from photographs or notes — in the one history every
screen reads; a later mordant wins, a planned work proves nothing, a blanket layer cannot make a cloth D.
Nothing is stored. The studio label is neutral — linen, dark text, the stage as an edge and a dot with
its icon — with a single Print; the colour-paper variant is gone.

## 1.0.0-rc129 — 2 October 2026

Studio Process Summary v1 (§13ge). A piece's record shows what was done to it, row by row, to copy onto
a tag: stage, preparation (`AA + CaCO₃`, `TAN → PAS + COT`), technique with its name (`EP · Еко
принт`), the eco print's blanket in its own words, the dyestuff, a recorded modifier, the plants by name,
the date, and Open Trial — only the rows the record can fill. Derived from the actions, recipes and work,
never stored. The trail's D carries a short recorded rider (`D (EP · BLK памук)`, `D (DYE · madder)`). A
recipe that offers alternatives is shown as it is (`PAS/AS + Na₂CO₃`); five such recipes are listed as a
v1.1 candidate.

## 1.0.0-rc128 — 2 October 2026

The sappanwood record kept from rc77 has its photograph again (§13gd). rc122 stopped shipping
`paubrasilia_echinata.jpg` as unused, but a copy whose work points at the old id keeps that record, and
it named the file (§13es had said so). The same picture ships as `biancaea_sappan.jpg`, byte for byte:
every start now points a record whose file no longer ships at the shipped file with the same hash, and
its credit. Nothing is guessed, nothing of hers changes. `plant-photos.json` drops the stale entry, and
the gate checks that it names shipped files only.

## 1.0.0-rc127 — 2 October 2026

Studio System v1 (§13gc). Five stage colours with icon, code and name — RAW sage, W blue, T ochre,
M mustard, D coral — on the fabric filter chips, every row and the record, from one derivation:
`deriveStudioStatus`. T is derived (a washed piece carrying tannin; §13bd stands); `finished` stays
its own uncoloured state and a finished piece keeps the colour of its last stage. The record gains a
working label — tag number, stage, what did it, date, 70 × 40 mm, Print in colour or in ink for
coloured paper — and its process trail, `W → M (AA + CaCO₃) → D (EP)`, both derived, nothing stored.
Recipes gain an optional `shortCode` naming the whole treatment (eight seeded; recipes pack 0.21.1);
a recipe without one shows its name. Library → Studio System: the legend, how to read a tag, the
trail, and a 35-code dictionary with its collision rules. New checks try-studio and try-studio-screens.

## 1.0.0-rc126 — 30 September 2026

Pre-1.0 polish (§13gb). **Bagra** in English too: the window title, the welcome and the backup error no
longer say Rubia; *Rubia tinctorum* is untouched and the gate tells the two apart. **Plans v1.1:**
opening a plan shows it to read — status, notes, source, picture, a tickable checklist — with Edit
leading to the editor, and Save returning to the plan; optional `sourceLabel` and `sourceUrl` (http(s)
only, opened in a new tab, never embedded) and one `referenceImage`, resized as a result photograph is
and kept in the record, so it travels with every backup. **Pigments:** the colour recorded on a batch
now shows in the list — it was drawn 0×0 — outlined, beside its name, from the same swatch.

## 1.0.0-rc125 — 30 September 2026

Production architecture and deployment readiness, package 4 (§13ga). The artifact carries the host's
configuration: `deploy/_headers` → `dist/_headers` — every path revalidates (`no-cache`, nothing
immutable, since no file name is content-hashed), a Content-Security-Policy allowing script only from
the origin, nosniff, a referrer policy, no framing. The update matrix now runs under those headers,
with a walk through every route and a photograph of hers as a data: URL; a policy that refused
anything the application does fails it. New try-production.mjs: reproducible build, root deployment,
manifest and worker scope, one visible version, header policy, no credential pattern. README's
production text no longer names GitHub Pages; runbook in docs/PRODUCTION_RELEASE.md. The owner's
confirmation of the mordant-paste wording is recorded (DECISIONS §41.2).

## 1.0.0-rc124 — 30 September 2026

The sumac has a photograph again (§13fz): Lazaregagnidze's *Rhus coriaria*, CC BY-SA 3.0, cropped to
the fruiting panicle with the leaflets either side so the square thumbnail shows the fruit, then
resized as every plant photograph is. Its credit says „Cropped and resized for Bagra". Every plant
ships a photograph again — 57. New `scripts/add-plant-photo.py` adds one photograph in the current
file model, with an optional crop it refuses under ND. Plants pack 0.14.4.

## 1.0.0-rc123 — 30 September 2026

Photograph licences (§13fy). The two GFDL photographs use the CC licence their Commons source also
offers — plum CC BY-SA 3.0, sappanwood CC BY 3.0 — and the GFDL text leaves the release. The sumac
photograph (CC BY-ND, added by hand, a crop not provable) is withdrawn to the archive; the plant
ships without one until a free replacement is added. Every photograph's credit gains a link to its
licence deed and „Resized for Bagra", from `licenceUrl` and `modified` in the plant pack (0.14.3).
try-commercial-content checks deed, author, source, modification and refuses ND and GFDL.

## 1.0.0-rc122 — 30 September 2026

Commercial seed, asset and provenance hygiene, package 3 (§13fx). **P0:** the release was the
repository, which a static host would publish whole — journal backups, withdrawn records, working
notes, the specification. `scripts/make-release.mjs` now builds `dist/` from an allowlist (the
worker's files, sw.js, licence texts) and checks it; only `dist/` is deployed. **P0:** two Library
notes still said shipped recipe content came from them (Maiwa, Garcia); both are research
bibliography now, entries kept (sources pack 19). An unshown withdrawn photograph left the release;
the Lucide notice for the icon sprite and the GFDL text for two photographs ship in `licences/`.
`assets.json` registers every shipped asset's licence. New check try-commercial-content.mjs; the
update matrix runs against `dist/`. Open for the owner: DOCUMENTATION_DECISIONS_NEEDED §41.

## 1.0.0-rc121 — 30 September 2026

„Обнови" activates nothing while another window holds unsaved work (§13fv). The waiting worker
asks every open Багра window, by the browser's own list, over a MessageChannel; it activates only
if all answer that they are clean. A dirty window, or one that does not answer in 4 s, refuses the
update, and the window that pressed is told why — rc120 activated first and told the dirty window
afterwards, leaving old code running against the new release. The manifest gains a pinned
`"id": "/bagra"`. try-update.mjs: U7 becomes U7a–U7d (clean windows; a dirty window; a waiting
release that raises DB_VERSION; a silent window), seen failing on rc120.

deep-check.mjs waits for what the application is doing (§13fw). Its failures moved from place to
place, on rc120 as on rc121: the start was a fixed 1.5 s sleep, and `settle()` read 30 ms without a
change as finished — also true before a render has begun. It now waits for the end of the start
(observed), and for idle: no handler promise, no database step, no undispatched navigation, no mark
still counting, then a stable view. A diagnostic `BAGRA_DC_LATENCY` reproduces both causes; ten
consecutive runs pass. No application code changed.

## 1.0.0-rc120 — 30 September 2026

Production update & release safety, package 2 (§13fu). **P0:** the worker was network-first file
by file and copied every answer into the running release's cache, so one page could boot half the
old release and half the new — whenever one request failed — and a failed update left an offline
copy that was half of each. Now a release is one cache, installed all or nothing, and the running
worker answers its files from its own cache only; a new version arrives when „Обнови" is pressed
or no old window is open. Only `bagra-*` caches are cleaned (Глина shared an origin). The first
install no longer reloads; „Обнови" asks about unsaved work; another window with unsaved work is
told instead of reloaded; an older page lets go of the database for a newer one. New checks
try-update.mjs (U1–U7, worker on, seen failing on rc119) and try-release-files.mjs. A rollback
rule in §13fu. Open for the owner: DOCUMENTATION_DECISIONS_NEEDED §40.

## 1.0.0-rc119 — 30 September 2026

Commercial Data Safety, package 1 (§13ft). An audit of backup, restore and migration, and only
what it found. **P0:** a merge of an older backup left the added records unrepaired for ever,
because the database's markers said every repair had run — eco-print trials without a bundle,
whose construction steps then vanished from the screen once saved; the same after a replace
from a file with no settings. After any restore the marker is now the lower of the database's
and the file's, repair by repair. Also: the replace question is asked after validation and
names the file's date and how many of her records go; a backup carries `appVersion` and
`dbVersion` and a file from a newer database is refused; a merge counts the records of hers it
kept in place of a different version in the file; the backup link is attached when clicked and
its address kept alive (Safari). New check try-data-safety.mjs — each restore onto a clean
installation in its own process, compared record by record. try-restore-older.mjs, in the tree
since rc67, joins the release gate with one browser per fixture. Open for the owner:
DOCUMENTATION_DECISIONS_NEEDED §39.

## 1.0.0-rc118 — 28 September 2026

The commercial recipe library (§13fs). Sixteen recipes ship, each credited to Crafty Place practice and naming no
person or book; the books stay in the Library. Seven recipes are the owner's alone — Nicoleta's Al/Fe impregnation,
the pastels and their oat binder, the dye paste without mordant, the dark compound mordant, the soy milk bath, the
dark iron bath — and the recipe pack hands them over instead of removing them (`retiredToPersonal`): same id, same
content, origin user. The light compound mordant becomes the „Aluminium–iron mordant for eco-print", tested figures
unchanged, with a general note on more iron. `nicoleta-practice` leaves the Library. A statement on the recipes in
About and a short one under the recipe list. Packs: recipes 0.21.0, sources 18. New check try-recipe-provenance.mjs.

## 1.0.0-rc117 — 28 September 2026

Three corrections (§13fr). The pH bar in the Library in fourteen muted steps from red through ochre, olive at 7, teal
and blue to violet — no graphite; each number in the ink that reads better on it; the legend's swatches to match.
The chalk bath says „the treated fabric" instead of assuming aluminium acetate — same id, 10 g/L. Reliability in
Reference sorts own trial > literature > practice > needs testing. Recipes pack 0.20.1.

## 1.0.0-rc116 — 28 September 2026

Recipe content (§13fq). `seed:aluminium-acetate-prep` keeps its id and figures; its steps now read alum in warm water,
then vinegar and water, then soda slowly in portions, and its notes lead with preparing it just before use and the
CO₂ foaming. New `seed:nicoleta-al-fe-impregnation` — a concentrated Al/Fe impregnation for eco print on cellulose: a
fixed 1/4 batch (25 g alum, 250 ml ~6 % cider vinegar, 2.5 g FeSO₄·7H₂O, 13.75 g Ca(OH)₂), no WOF, not an aluminium
acetate, followed by the existing chalk bath, credited to Nicoleta with her India Flint attribution marked
unconfirmed. New source `nicoleta-practice`. Packs: recipes 0.20.0, sources 17. New check try-recipe-content.mjs.

## 1.0.0-rc115 — 28 September 2026

Reference (§13fp). „Мои наблюдения" under a record: each trial placement linked by `combinationId`, read from the
trial — swatch, colour, date, print quality, note, and a link to the trial; nothing copied into the combination and no
link guessed. A missing record's address returns to the list instead of throwing. The Records table gains a search
over its visible words and sortable columns (Result, Dye source, Conditions, Reliability; a select on phones), after
the favourites filter. New checks try-reference-observations.mjs and try-reference-screens.mjs.

## 1.0.0-rc114 — 28 September 2026

A change of box on a piece's form is its own act (§13fo). „Unwashed" is no longer offered as a change on an existing
piece and writes nothing if forced (it used to write `other`). The change is written to the saved piece — batch and
action in one transaction (`putTogether`) — without the form's unsaved typing; the form keeps the typing and its
unsaved mark, and a later Save keeps the new action. A failed write leaves neither record. New check
try-fabric-transition.mjs.

## 1.0.0-rc113 — 28 September 2026

Washing one piece follows the group's rule (§13fn). On a piece's form, „washed" is disabled — with the reason — for a
piece already washed or further on, and the record button checks the same rule, so nothing is washed back. One
function, `eligibleFor` in fabric-logic.js, for both screens. Rework and existing history unchanged. A later rinse is
recorded as „other" with a note. New check try-fabric-wash.mjs.

## 1.0.0-rc112 — 28 September 2026

Group action: washing (§13fm). The recipe field reads „Recipe (optional)" with „no recipe" as its empty choice, and
the screen states the outcome before the button — how many will be marked washed, which are left, the date, the
recipe or none. A group wash is written only to pieces before „washed"; washed, mordanted, dyed and finished pieces
are named and not moved back. A note typed before clicking an action or a filter is no longer lost. New check
try-batch-wash.mjs.

## 1.0.0-rc111 — 28 September 2026

Eco-print usability and correctness (§13fl), from the owner's silk-scarf trial. A bundle listed bottom to top
(foil, blanket, plants, receiving cloth — any order), with ↑ ↓ ×, a rolling note, and a small preparation block for a
blanket; built for older trials from their steps by an add-only migration, the steps kept and no longer listed twice.
A placement records which side faced the receiving cloth; older face up/down kept and read only when the bundle
settles it. `aerial` — a whole sprig — as a plant part. Duration before Temperature, both labelled with their units.
A completed trial's finishing date is never earlier than its date. No unsaved-work warning after Save. New checks
try-ecoprint.mjs and try-ecoprint-screens.mjs.

## 1.0.0-rc110 — 28 September 2026

Plans polish (§13fk). A tick on a plan's line is saved at once — only the tick, patched into the stored plan by the
line's id, never the unsaved draft; title, notes, status and line text still wait for Save. A failed write is flashed
and left to Save; a tick no longer marks the form unsaved (`data-saves-itself` in dirty.js). §8.0a now says plans
hold intent before a trial exists and never duplicate one; §13co says backup compatibility runs forward, not back.
Fifteen new assertions in try-plans.mjs.

## 1.0.0-rc109 — 27 September 2026

Plans v1 (§13fj). A new diary entry, second in the row: title, status (idea · planned · in progress · done), notes, and
a checklist of plain lines that are added, edited, ticked and removed. The list shows status, progress („3 / 8") and
the date last changed. A store of its own (IndexedDB 10), carried by backup and restore like every other; a backup
from before Plans restores to an empty list. No links, dates or filters. New checks `try-plans.mjs` and
`try-plans-screens.mjs` (390 and 320px, both languages); `screen-check` measures the new screens. No trial, fabric,
recipe, pigment, calculator or seed change.

## 1.0.0-rc108 — 27 September 2026

English on a first opening, and references that resolve (§13fi). A device with no stored language opens in English
(`DEFAULT_LANG` in i18n.js, `<html lang="en">`); a stored choice wins on every launch; nothing is written merely
because the default applied; the browser language is not consulted; a restore still leaves the device's language
alone. `deep-check.mjs` and `screen-check.mjs` now choose Bulgarian explicitly, since they assert and measure the
Bulgarian interface. New layer `try-language-default.mjs`. `check-actions.mjs` gains guard 4b: every action's
`trialId` and `batchId` must name a record the backup holds; a dangling one is listed and exits 2, a structural
failure exits 1, nothing is repaired. `--selftest` runs on its own again and is now part of the gate. No
translation, backup format, seed, pigment or calculator change.

## 1.0.0-rc107 — 26 September 2026

The release gate repaired, and nothing else (§13fh). The rc100–rc105 specification sections are renumbered from
§15–§15d to §13fc–§13fg, so „Visual identity" is the only §15; every citation follows. The one regex literal
`check-scope.js` could not read is built with `new RegExp`, same pattern and flags. The pack preview gains the
`chains` field dictionary and four recipe labels, all existing i18n keys. `check-boot.mjs` reads the navigation from
`#topbar` and checks reachability by walking the bar from Home. `sh check.sh --release` runs start to finish.
No behaviour, data, seed, pigment or calculator change.

## 1.0.0-rc106 — 26 September 2026

Wording only, two strings in both languages. `recipes.refersToHint` no longer calls 5–8% finished acetate and 15–20%
raw alum the same thing: they are different calculation bases. `tools.verify` no longer says the fixed 18% / 10% /
240% recipe matches the stoichiometry for 14-hydrate aluminium sulfate; it says the calculator is a separate tool and
the fixed Crafty Place recipe a separate practical one (Boutrup & Ellis 11B, potassium alum), not expected to equal
it, with salts and hydrates not substituted gram for gram (§13ff). No logic, test, seed, model or layout changed.

## 1.0.0-rc105 — 26 September 2026

The pigment batch is a journal entry, not a workflow (§13fg). Gone from the screen: the six fixed stages, the
recipe-or-chain choice, the departure chips and struck lines, quality, the second date, and a swatch's kind, surface
and recipe. In their place one „Процес / бележки" field; the result keeps yield, simple swatches (colour, name, note),
photographs — reachable from the screen for the first time — and „Резултат и извод". A batch starts from a recipe
with `output: 'pigment'` only. Migration `pigmentProcessNotes` joins each older batch's stage notes and dates into
`process`, deterministically, and keeps `stages`; older chains, dates, quality, stage photographs and swatch kinds
are shown read-only. New guard 24h' on the rendered screen, ten new migration assertions, screen fixture moved to the
new shape. No recipe, chain, trial, fabric, calculator or seed data changed. The release gate was already red at
rc104 for four unrelated reasons, recorded as decision item 33 and left alone.

## 1.0.0-rc104 — 23 September 2026

`scripts/local/` removed — the four double-click helpers for running a build locally. Windows Defender flagged the
`.bat` files heuristically (a command file that starts a Python server and launches Chrome with arguments is a
shape it watches for); there was nothing in them but those two commands, and a virus warning on every download is
worse than a line typed in a terminal. README now gives the commands instead. No application file changed: the
scripts were never part of the app, never cached by the worker and never ran in the browser.

## 1.0.0-rc103 — 23 September 2026

The aluminium acetate calculator reads WOF two ways (§13ff): as the finished acetate, as before, or as the chosen
aluminium source, the way practical recipes state it. A selector says which, with an explanation that the two are
different sums. Mode 1's formula and numbers are unchanged (311 g at 8% → 24.9 / 20.9 / 19.4 g and 366 ml); mode 2
starts from the salt (100 g at 18% potassium alum → 18 g of alum, 7.7 g of acetate, 6 g of soda, 137 ml of 5%
vinegar) and derives the rest from the aluminium that salt carries. New guard `try-alum-acetate-modes.mjs` in
check.sh, eleven regressions across four salts and two vinegar strengths. No seed recipe, chain, substance or
journal data changed.

## 1.0.0-rc102 — 23 September 2026

About and Getting started carry the owner's own texts (§13fe). „Какво е Багра" with its three sections, the
„Справочник или дневник?" block beside it, and „Как се започва" with two ways to begin and five numbered
sections — all in BG and EN, in the tabs that already existed. `about.js` gained a section helper and the module
its own heading and paragraph rhythm; nothing was shortened. No route, module, data or navigation changed.

## 1.0.0-rc101 — 23 September 2026

The aluminium acetate workflow calculates once (§13fd). The mordant no longer doses 5–8% WOF of finished acetate on
top of a solution that was already made for the cloth: its single line is the whole working solution, on `absolute`
with no quantity, pointing at the preparation, and its `target` is gone. The preparation keeps the figures — 18%
alum, 10% soda, 240% vinegar — and now names the mordant as its required follow-on. Attribution is modelled as two
source codes, Boutrup & Ellis 11B underneath and Crafty Place as the adaptation, with the sentence in both
languages in the notes. Silk mordanting is potassium alum alone; aluminium sulfate is not an option beside it.
Chalk bath basis corrected to `grams_per_litre`. The other 18 seed recipes, both chains and the calculator are
untouched.

## 1.0.0-rc100 — 23 September 2026

Seed recipes for the preparation baths and the aluminium acetate workflow (§13fc). Nine recipes become bundled
content — silk and cellulose scouring, the tannin bath, silk mordanting, cellulose alum-and-soda mordanting,
madder, preparing aluminium acetate, mordanting with it, and the chalk bath — with stable seed ids, BG and EN
throughout and sources named. Two unproven claims are gone: madder „loses its dye above 70 °C" and vinegar
„softens silk and brightens red". Chains are a pack now (`seed/chains.json`), with the update button a pack must
have; two preparation chains ship. The aluminium acetate calculator starts from 8% WOF, 6% vinegar, anhydrous
aluminium sulfate and soda ash — starting values only, the stoichiometry untouched. A plant's description is one
column with no width of its own. No architecture, no user data.

## 1.0.0-rc99 — 23 September 2026

The editorial redesign, integrated onto rc98. `design/editorial-redesign` is merged and closed; main is again the
only line, and the release it is working towards is still 1.0.

What arrived, in one piece: local Geist and Source Serif 4 with real Bulgarian letterforms, Bagra's own palette in
the exploration's composition (indigo for where one is, neutral controls, no green), a two-row bar on a laptop and
a header with a drawer on a phone, the reference modules and the diary in one visual language, the pigments'
surfaces and the screens that never had a mockup, and the composition applied on real data — a finished work that
uses the page, a plant's text bounded by its section, the Reference answering with result cards, wider cards for
finished work, and a technique that opens for reading with Edit beside it. §14a–§14e carry the decisions and the
checks; the five packages are recorded below under their branch identifiers.

Nothing in the model, the data, the seed content, the calculations or the service worker's logic changed. Two
sentences of interface text changed: the help line about the backup, and two new labels on a finished work.

**The `1.1.0-design.*` numbers below are identifiers of redesign packages on that branch, not releases of the
application.** The application's line continues rc98 → rc99.

## 1.1.0-design.5 — design package 5 (branch design/editorial-redesign, merged into 1.0.0-rc99)

Editorial redesign, package 5 — the approved composition on real data (§14e). A finished work uses the page: a
large photograph with its parameters beside it, the colours as their own section, „Как се разви" across the
width. A plant's text is bounded by its section, not by an inner measure. The Reference answers with result
cards — big swatch, then plant, part, fibre, mordant, process, pH — in a responsive grid, the search untouched.
Fewer, wider, equal-height cards for finished work. A technique opens for reading, with Edit beside it. No model,
data or seed content changed.

## 1.1.0-design.4 — design package 4 (branch design/editorial-redesign, merged into 1.0.0-rc99)

Editorial redesign, package 4 — integration and finishing (§14d). The work card's progress strip takes its own row
on a phone (it had left the name 68px at 390px and nothing at 320px); the pigments' surfaces; the screens without a
mockup — group actions, the backup, the pack preview, About, the stubs; one card for the edge states; Home on the
shared cards and radii; About's sections as pills. The help sentence about the backup points at the ⋯ menu instead
of the old menu's foot. No change to the model, calculations or behaviour.

## 1.1.0-design.3 — design package 3 (branch design/editorial-redesign, merged into 1.0.0-rc99)

Editorial redesign, package 3 — the diary (§14c). My work, Fabrics, preparation, group actions, the work form,
the result, the history and their editors and dialogs in the same language, scoped to `data-space="diary"`; the
kicker reaches the diary. Work and stage cards, the finishing questions, the group action's quantities, a piece's
history and the editor's rail. No change to the model, `prepActionIds`, inherited actions, batches, recipes,
photographs or the delete guards; the pigments' model untouched. A phone tweak to the work card was tried and
reverted (it pushed the card past a 320px screen).

## 1.1.0-design.2 — design package 2 (branch design/editorial-redesign, merged into 1.0.0-rc99)

Editorial redesign, package 2 — the reference part (§14b). Reference, Plants, Recipes and chains, Materials,
Techniques, Calculators and Library in the prototype's visual language, scoped by `data-space`/`data-module`: a
kicker and rule under the page header, rounded tables with a sunk header row, pill filters and tabs, cards for
techniques and calculators, the glossary as a definition list, the plant's photograph on the specimen mat. A chain
step's line wraps on a phone (the chain view overflowed at 390px, already in rc98). Headings back on the one scale
(check-scope: two sizes set by hand in package 1). No change to data, model, calculations or architecture.

## 1.1.0-design.1 — design package 1 (branch design/editorial-redesign, from 1.0.0-rc98, merged into 1.0.0-rc99)

Editorial redesign, package 1 — the visual foundation (§14a). Bagra's palette in the prototype's composition:
indigo for where one is, neutral controls, the primary action in iron, no green; colour specimens on a neutral
mat. Local Geist and Source Serif 4 (OFL-1.1) with real Bulgarian Cyrillic, cached by the worker (list only).
A two-row top bar on a laptop, a header and drawer on a phone (the bottom bar gave way to it). Buttons, fields,
panels and dialogs restyled. No change to model, data, routes, calculations or worker logic.

Local testing (same build, no app change): `scripts/local/` starts the redesign at localhost:8799 with a
separate Chrome test profile — its own database, apart from GitHub Pages and real data — and resets it.

## 1.0.0-rc98 — 21 September 2026

Technical audit: protection of user data — backup, restore, merge, update — in isolated profiles.

- Fixed: an update could install the OLD code under the new name. The service worker filled its new cache with
  `addAll`, and fetched with default caching, both through the browser's HTTP cache — in a real rc96 → rc97 update
  the cache „bagra-v1.0.0-rc97" held rc96's version.js and batch.js, so rc97's fix never arrived, the interface kept
  saying rc96 in a new tab, after reloads and offline. Installing now asks the server (`cache: 'reload'`) and the
  network-first fetch revalidates (`cache: 'no-cache'`). Re-tested rc96 → rc98: new code in the cache, rc98 shown
  online, in a new tab and offline; every record and photo identical. User data was never affected.
- Confirmed without change: `replace` restores every user record, photo, id and link exactly (only backup
  bookkeeping in settings differs — the change counter resets, as it should); `merge` adds new records, never
  duplicates or overwrites, keeps a missing preparation reference as it is and says so; merging twice adds nothing;
  the % WOF and temperature ceiling warnings in the group form name the substance, the value and the unit.
- Known behaviour, not changed: `merge` skips a record whose id exists, whole — a file's newer edit of an existing
  record is not taken.

## 1.0.0-rc97 — 19 September 2026

Functional package 3: group preparation of several cloths, with a recipe and works, end to end in an isolated profile.

- Fixed: the group form's quantities. It read `substanceName`, `amountMin` and `amountMax`, which `scaleRecipe` no
  longer returns, and labelled every line in grams — a group mordanting of 200 g showed „acid_source — г" instead of
  400 ml of vinegar, 40 g alum, 0.8–1.6 g iron sulfate and 20 g soda ash. It now reads the scaler's result as the
  chain plan does: the chosen substance's name, the amount or range, the scaler's unit. The chain branch and the
  ceiling warnings use the same reader. No guard read these numbers.
- Confirmed without change: one action per cloth, one batch, own `fabricId`, recipe on actions and batch, the third
  cloth untouched; each work points only at its own cloth's action; a date correction keeps ids and references;
  the used batch is refused, naming both works; all of it survives a reload.

## 1.0.0-rc96 — 19 September 2026

Deleting a cloth whose actions are pointed at is refused (§13fb follow-up). A cloth's actions are referenced by the
pieces cut from it (`inheritedActionIds`) and by works that chose them (`prepActionIds`); `refs.js` knew neither, and
the cloth was protected only through its batch record — not at all for an action without one. Both paths are now in
the reference table, with their own words in the refusal (BG/EN). No cascade, no reference removed, no model change.

## 1.0.0-rc95 — 19 September 2026

A work records the preparation it used (§13fb). `prepActionIds` on the work, `inheritedActionIds` on a cut piece —
references, never copies, never inferred from dates. Ticks in the work form, the chosen preparation in the finished
work's process, a used batch refused on delete, missing references said and kept, id-less actions given ids.

## 1.0.0-rc94 — 19 September 2026

Functional package 2: the life of a cloth and a work, run end to end in Chromium in an empty profile.

- Fixed: a cloth's history showed only dates. Both history views read `stateCode`, which only the old
  `stateEvents` carry; since §13bd the history is the piece's actions. Each entry now names its action and its
  recipe, as the preparation card does; a piece with only old state events still shows its state.
- Confirmed without change: preparation is written to the cloth and read by the work, not copied; step order,
  parameters and notes, both stages, finishing, both edits and every photo survive a reload.
- Not decided: the finished work's review does not show the cloth's preparation.

## 1.0.0-rc93 — 19 September 2026

Functional package 1.

- Deleting a work: the confirmation dialog had no styles at all, so it was added below the page, out of sight;
  each press that seemed to do nothing added another — three presses, three dialogs (one handler, reproduced in
  Chromium). The dialog now stands centred in front of the page, a second call while one is open adds nothing, and
  it names the work and says its fabrics stay. rc92 was checked too: confirming deleted only the chosen work.
- Home, „Продължи": a work with no photograph of its own shows its cloth's; with neither, the neutral ground.

## 1.0.0-rc92 — 18 September 2026

Responsive width, as a rule rather than per screen. CSS in `index.html`, one option on `fact()`.

- `--measure` 74ch → 120ch. Every running text reads it (`.prose`, the plant's opening, page subtitles), and at
  74ch held each paragraph to two thirds of its panel on every screen.
- `.termdef` had its own hard 74ch; it now reads `--measure`.
- `.view` 1080px → 1280px and centred: at 80% zoom the page no longer sits in the left two thirds.
- `.factgrid` auto-fill → auto-fit, so a short row of facts fills its row; a fact can take the whole row
  (`fact(..., { wide: true })`), used for a recipe's source.
- Checked in Chromium at 1440, 80% zoom and 390 on Alkanna tinctoria, the Glossary and „Багрилна паста без
  закрепител"; substances, pigments and techniques as representatives; `screen-check` passes.

## 1.0.0-rc91 — 18 September 2026

Stage 4, closing UX package. Labels and one scoped mark; no behaviour, route or data changed.

- A stage card's „+ действие" and the buttons under the stages were not duplicates: the first continues that stage,
  the second adds at the end of the work and so starts a new pass. Labels now say so: „+ действие в този етап" and,
  once there are stages, „+ нов етап: …".
- Finished work: „Редактирай резултата" opens the finishing form and „Редактирай историята" the work form — two
  forms, both kept; the second now reads „Редактирай стъпките на работата".
- The process view's stage rows carry the same turning mark as the process fold, so the rows that open are told
  apart from the raw-cloth and finished rows that do not.

## 1.0.0-rc90 — 18 September 2026

Stage 4, UX package 3: a chain is read before it is edited.

- `#/recipes/chains/<id>` is a working view: title, description, numbered steps with each recipe and the chosen
  options, and the plan from the same `planBlock`. „Редактирай веригата" opens the unchanged editor at
  `…/<id>/edit`; a new chain opens in the editor. „Create a trial from this chain" stays in the editor only.
- „Отвори рецептата" on a step leaves a way back through the existing `returnTo` memo; the recipe's read view now
  shows it.
- Checked on one chain of three recipes: order and numbering, the plan identical to the editor's at 500 g, recipe
  and back, editor save as before, and the record byte-identical after reading.

## 1.0.0-rc89 — 18 September 2026

Stage 4, UX package 2: the plant profile uses the width. CSS only, in `index.html`, scoped to the profile.

- `section.sub` no longer inherits the page subtitle's 74ch measure; prose inside keeps its own `.prose` limit.
- `.subone` above 1100px is a two-column grid instead of `column-count`, which left both sections in the left
  column; one section alone takes the row, in `.subcols` too.
- Colour cards: minimum 300px, so a swatch name stays on one line (three columns wide, two at 1024, one on a phone).
- The usage table on a phone: the label stands above its figure instead of running over it.
- Checked at 1440, 1024 and 390 on Alkanna tinctoria; the Materials screen is pixel-identical before and after.

## 1.0.0-rc88 — 18 September 2026

Stage 4, UX package 1. Targeted checks only; no data, id or save logic changed.

- New work: search by number or name over the fabric cards, and „Нова тъкан" above the list, which takes the
  cursor to the existing new-fabric form. Picking and creating follow the same path as before.
- Home: with nothing running, the „Продължи" panel is not drawn; „Започни" carries the actions.
- Texts: Recipes' description without eco print and blankets; the step select says „Действие"; the two time
  fields say „При температура" and „Киснене след спиране на огъня"; „Добави подготовка" says it opens the shared
  form, where other fabrics can be chosen. Both languages.

## 1.0.0-rc87 — 18 September 2026

§13fa, DECISIONS §19. Sources and Glossary get „Обнови от библиотеката" on their Library tabs; `UNREACHABLE_PACKS`
is empty. A saved source is marked as hers; a stored „website" kind reads as „сайт". Targeted checks only.

## 1.0.0-rc86 — 18 September 2026

DECISIONS §32, option A: the `paste` category reads „бои, пасти и свързващи вещества" / „paints, pastes & binders";
`mordant-print-paste` moves from `mordant` to `paste`. No code, quantity or text of a recipe changed. Targeted check only.

## 1.0.0-rc85 — 18 September 2026

§13ez. Targeted checks only.

- Recipe categories „еко принт" and „одеяло" no longer offered; her records keep theirs.
- „Лаков пигмент" → „Утаен пигмент" in Bulgarian (recipe name, glossary, WOA definition, Stopka's note).
- Paste category not changed — it holds watercolour and pastel recipes too (DECISIONS §32).

## 1.0.0-rc84 — 18 September 2026

`pastel-binder-gum` withdrawn from the published pack, its option off `pastels-from-pigment`, kept in
`archive/withdrawn/`. §13ey. Targeted checks only.

## 1.0.0-rc83 — 18 September 2026

Stage 3 closed. §13ex. Targeted checks only.

- `mordant-print-paste`: the marker is optional and tried first; no promise that it washes out. `deep-check`
  print-pastes follows.
- `distributable: true` on the three pastes and the oat binder.
- `pastel-binder-gum` not approved and still in the seed: the published pastel recipe names it as a binder.
  Exclusion proposed in DECISIONS §31.

## 1.0.0-rc82 — 18 September 2026

Attribution audit: the owner's decisions, and five recipes for approval. §13ew.

- The studio's code off `watercolour-binder` (changes not yet written down) and off `pastel-binder-gum` (not tried);
  the gum binder is „general guidance" and says it is untried.
- `pastel-binder-oat`: the form of oat marked unconfirmed at Stopka. `seed:oats` unchanged.
- Aluminium acetate: the chalk bath, not a lime bath.
- `deep-check source-list` reads the mordant paste, which still credits two sources.
- `docs/attribution/rc82-five-for-approval.md`, generated by `scripts/export-approval.py`.
- Measured: `distributable` controls nothing that ships; a release check is proposed (DECISIONS §30a).

## 1.0.0-rc81 — 18 September 2026

Attribution audit, closing package: the six remaining recipes. §13ev. Before and after:
`docs/attribution/rc81-six-recipes.md`. Stage 3 closes pending the owner's decisions.

- Pastels: the filler no longer makes a pastel both softer and harder; the hardness claim is gone from both notes.
- Watercolour binder: liquid gum, honey and glycerine described without absolutes; thinning with alcohol removed.
- Oat binder credited as a formula Stopka presents; the gum binder named as guidance.
- „Варова баня" becomes a chalk bath in two paste steps; Garcia's note loses the unsourced sentence.
- Measured: from rc79 an installed copy is offered 13 recipes; the 6 register changes cannot reach it.
- Open: `distributable` on five records (proposal in DECISIONS §29a) and five smaller questions.

## 1.0.0-rc80 — 18 September 2026

Attribution audit, package 1: eight recipes and their sources. §13eu. Before and after:
`docs/attribution/rc80-eight-recipes.md`.

- Kelly is the source of the compound mordant's version used; Garcia appears only as Kelly's own attribution,
  in the recipe's words, and leaves `sourceCodes` on the two mordants and the bath. His register entry stays.
- Cliffe's dye paste no longer promises a clear ground; the two-week keeping time is marked as hers. Two
  passages that followed the books' exposition rewritten; no figure changed.
- Register: Kelly's publisher and year, Cliffe's method numbers, the studio-practice entry made neutral.
- Open: `distributable` on the three pastes, and three smaller questions (DECISIONS §28).

## 1.0.0-rc79 — 16 September 2026

The scientific audit's last three refinements. §13et.

- Titanium oxalate keeps 2% WOF; the record now names the source it follows and the ranges other suppliers give.
- `madder-lake-hot` withdrawn from the pack, archived whole, kept for anyone whose work uses it.
- Sappanwood's sources carry the verified POWO record for *Caesalpinia sappan* / *Biancaea sappan*.
- Field-label check: an archived withdrawn record still counts as carrying its fields.

## 1.0.0-rc78 — 16 September 2026

Scientific audit, closing package. §13es. Before and after: `docs/science/rc78-closing.md`.

- **Sappanwood has its own id, `seed:biancaea_sappan`**, and the name „Sappanwood (Eastern Brazilwood)". Records of
  hers on the old id are kept, not reclassified; new release check `try-plant-id-change.mjs`.
- Sappanwood's tannin level marked unknown; its combination's species marked unverified.
- `madder-lake-hot`: chalk is a suspension; the recipe is marked incomplete.
- Titanium oxalate: 70 °C is a conservative limit, not a chemical boundary.
- Watercolour binder: no guarantee from clove oil, no untested storage life.
- Open: titanium oxalate's 2% WOF against 8–10% (DECISIONS §27); whether to withdraw `madder-lake-hot` (§26).

## 1.0.0-rc77 — 16 September 2026

Scientific package 2, refinements. §13er.

- Walnut, cutch, pomegranate and eucalyptus fastness marked `unverified`; the plant screen shows „needs testing"
  beside such a rating.
- The substantive/adjective glossary definition made identical in both languages, with indigo as a vat dye and
  no fastness generalisation. (Installed copies do not receive glossary changes — DECISIONS §19.)
- Sumac's 10–20% removed from the prose, kept in the register. Brazilwood chemistry: proposal only.

## 1.0.0-rc76 — 16 September 2026

Scientific audit, package 2: plant parts, dye properties and fastness. §13eq. Before and after with sources:
`docs/science/rc76-package-2.md`.

- **Four unsupported dye parts removed** (apple hull, safflower leaf, brazilwood bark, cutch bark), archived
  whole. Nothing in the library used them; a person's trial on a removed part keeps it.
- Harvest template for flowering herbs removed from geranium, eucalyptus and henna.
- Eucalyptus' unsourced cause, the cotinus superlative, and avocado's iron claim corrected.
- No fastness rating changed; four questions open (DECISIONS §25).

## 1.0.0-rc75 — 16 September 2026

Two technical tasks before scientific package 2. §13ep.

- **The recipe's read view shows the calculator's ceilings** beside the quantities — the iron bath at 2.5%
  against 2%. Same function and texts as the editor.
- A withdrawn recipe kept because her work uses it says so on its record.
- **New release check, `try-withdrawal-in-use.mjs`:** a withdrawal cannot remove a recipe a pigment batch
  uses (three kinds of reference); an unused one is removed after Apply. Seen failing on three broken copies.
- No scientific data changed.

## 1.0.0-rc74 — 16 September 2026

The owner's decisions on the first scientific package. §13eo. Before and after: `docs/science/rc74-refinements.md`.

- Woad's dyeing temperature 45–50 °C with a ceiling of 55 °C; extraction unchanged.
- Iron: 2% stays the conservative ceiling; the recipe's published 2.5% now carries an explicit warning.
- Soy milk: lightfastness claim removed; washfastness may be limited.
- **The madder fermentation recipe is withdrawn** from the pack and kept in `archive/withdrawn/`.
- **Fixed:** a pack withdrawal could remove a recipe the person's own work uses, and pigment batches were not
  counted as references to recipes or chains at all. Both are closed.
- Oat or bran bath: no three-day period; reuse not presented as safe.
- Found, not changed: the ceiling warning is not drawn on a recipe's read view.

## 1.0.0-rc73 — 16 September 2026

Scientific audit, package 1: safety and chemical correctness. §13en. Every change and its source:
`docs/science/rc73-package-1.md`.

- Alum is paired with cream of tartar in Bulgarian too („винен камък").
- No metal-salt solution is to be poured down the drain; iron and copper say to collect and dispose by local
  rules and the SDS.
- Categorical claims replaced: iron „above 2% embrittles", soy milk as a „safe mordant", madder „ordinary
  dyeing is not dangerous", tansy „leaves are not a problem", boiling as sterilisation, scraping mould and
  continuing a ferment, the oat bath „strengthening the bond".
- Proposed, not applied: woad's temperatures, the iron ceiling, withdrawing the fermentation recipe, the oat
  bath's storage (DECISIONS §21–§24).
- No figure moved. Installed copies are offered the 14 corrected records through the library update.

## 1.0.0-rc72 — 16 September 2026

Step 5 of the language package: recipes, substances, techniques, sources. §13em. Every change:
`docs/language/rc72-final.md`.

- **The last 50 language findings fixed.** File check: 0 findings. English screens: 0 lines of Bulgarian.
  The release gate now runs both checks strictly.
- **Source `name` and `author` are bilingual** on all 57; older string records and archives read unchanged.
  The owner's names and „Цветелина Ковачева" / „Tsvetelina Kovacheva".
- Editorial review of four packs in both languages; a new check for words mixing Cyrillic and Latin letters.
- 13 claims added to the scientific audit list, among them an iron dose of 2.5% against a 2% limit stated
  elsewhere, and alum paired with tartaric acid in Bulgarian and cream of tartar in English.
- No recipe, substance or technique figure moved.

## 1.0.0-rc71 — 16 September 2026

Step 4 of the language package: the combinations. §13el. Every change: `docs/language/rc71-combinations.md`.

- **The 121 notes:** 47 real notes and 23 informative labels translated, 12 trimmed of words that restated
  the key, 39 emptied because the key already said everything they said. An import-workbook remark removed.
- **307 English fields filled**; English words inside Bulgarian influences rewritten in Bulgarian.
- „Закрепител" throughout; no „мордант" or „байц" left in any combination.
- No key, figure or source changed: the fingerprint of all 163 records is unchanged.
- English screens: 6 lines of Bulgarian left, all source names (DECISIONS §20).

## 1.0.0-rc70 — 16 September 2026

Step 3 of the language package: the plants. §13ek. Every change: `docs/language/rc70-plants.md`.

- The owner's interim wording for substantive and adjective dyes; „трайно" / *lastingly* removed from the
  hint and the glossary.
- **296 English fields filled**: colour names and conditions, harvest notes, toxicity notes.
- **„Parts used" translated for the first time** — its English had been generated from part codes and
  disagreed with the Bulgarian.
- 73 English fields edited (calques, hyphens, spelling, quotation marks); 168 Bulgarian fields corrected
  („закрепител", „извличане", loanwords).
- **Claims marked, not changed:** `docs/language/science-audit-flags.md` — among them woad's 55 °C
  against a recorded ceiling of 85 °C, and part lists that disagree with the plant's prose.
- No figure moved: the plant records' fingerprint is unchanged.

## 1.0.0-rc69 — 16 September 2026

Step 2 corrected by the owner's final decision: **„закрепител", not „мордант", in the Bulgarian
interface.** §13ej. Every text changed: `docs/language/rc69-text-changes.md`. The standard:
`docs/TERMINOLOGY_BG_EN.md`.

- 34 dictionary strings, 12 vocabulary labels, 10 glossary terms and 5 recipe names, each by its own
  grammar. The glossary term is „Закрепител (мордант)".
- **A new guard** fails on „мордант" in any form in the interface unless it stands in brackets after
  „закрепител", and on the retired „закрепващо средство" and „байцване". Search aliases are not read.
- Reference prose (204 places) is listed by record and corrected in steps 3 to 5.
- Checked at 360 and 390 px on 19 affected screens: no overflow, no standalone „мордант" in a label.
- English and every internal identifier unchanged.

## 1.0.0-rc68 — 16 September 2026

Step 2 of the language package: the interface dictionary, the vocabulary and the terms. §13ei.
Every text changed, before and after: `docs/language/rc68-text-changes.md`.

- **Mordant terminology, by the owner's rule:** „с мордант" for the box and in compact labels,
  „закрепващо средство" in prose, and no „мордантиран", „мордансиран" or „байцване" left on screen.
- **Ten duplicate keys resolved** after reading each one's use. One shadowed text was the better one
  and is now live; one key was unused in both copies and is gone.
- **The audit's English edits, checked against their screens:** „In hand" is „Work under way", not
  „In progress", which already named two other things; the home screen subtitle now says what the
  screen shows.
- **Bulgarian on the English screen, from code:** recipe names and ingredient notes read from `.bg`,
  the gram and gsm units, the navigation's aria-label, an error naming „Багра".
- **Three botanical names cleaned**, the commentary moved into the plant's own prose — and the
  photograph's taxon, which carried the same commentary and would have surfaced under the picture.
- **Five fingerprint entries accepted by name**, each shown first: three plants, one glossary term,
  the manifest. No figure moved.
- **Not done:** English names for three sources need `name` to become bilingual (DECISIONS §20).

## 1.0.0-rc67 — 16 September 2026

Step 1 of the language package: guards before words. **No user-visible text changed.** §13eh

- **`scripts/try-language.mjs`** — dictionary duplicates and one-sided keys, Cyrillic in English,
  letters Bulgarian does not use, Bulgarian quotes in English, American spellings, malformed
  pairs, Bulgarian written into code, and untranslated pairs in every pack and the vocabulary.
- **A fingerprint of every seed record with the words blanked out.** Language work that moves a
  figure, a code or the shape of a record fails and names it.
- **`scripts/try-language-screens.mjs`** — the English interface in a real browser, 321 screens,
  every line and attribute with a Cyrillic letter.
- **Both are ratchets:** the faults rc66 shipped with are listed in `test/language/`; a new one
  fails, a fixed one fails until crossed off, and `--strict` — the 1.0 run — fails on the lists.
- On rc66: 603 untranslated reference fields, 10 duplicate keys (7 with two different texts),
  ј in „адјективно" twice, a weight unit and an aria-label in Bulgarian, Bulgarian commentary in
  three botanical names, recipe names drawn in Bulgarian on the batch screen.
- The guard lost its own evidence: `process.exit()` cut a piped listing at 399 of 641 lines.
  Both scripts set `exitCode`.
- **Also in the tree, not wired in:** `scripts/try-restore-older.mjs` and three backups written by
  rc6, rc45 and rc56. It finds one fault (DOCUMENTATION_DECISIONS_NEEDED §19) and joins the
  release gate with its fix.

## 1.0.0-rc66 — 14 September 2026

A6's documents, which had not existed for fourteen releases. §13eg

- **`#/about` with four tabs:** About and version, Help, Safety, and Legal (terms, privacy,
  licence). Under the rule with the backup, not seven sidebar entries.
- **The safety text is the real one** — masks for powders, soda ash added slowly, no dyeing
  vessel used for food, how little iron it takes, plants that are not safe for being plants,
  disposal, children, and that a calculator computes what it was given.
- **Privacy is short because the architecture made it short:** no account, nothing sent
  anywhere, no analytics.
- **The licence is a draft and says so on the screen.** It is not the developer's to settle.
- **The address for reports is not set**, and the screen says so rather than inventing one.
- **Guard `about`** asks for the sentences, not for the panels, and checks two claims against
  the code — the privacy sentence against `sw.js`, and the address either way. The four screens
  are measured at four widths.

## 1.0.0-rc65 — 14 September 2026

The pH scale is drawn instead of listed. §13ef

- **One bar, 1 to 14**, each place carrying its own number and coloured by its band, with the
  five names kept as a legend below. It was five rows with a swatch each.
- The colours are the five already declared — where a reading falls, never what a dye turns.
- **Guard `ph-scale`**, seen failing on a bar of ten places, on a green cell, and on bands
  shifted by one.

## 1.0.0-rc64 — 14 September 2026

A documentation audit. No code changed.

- **Stale figures corrected.** The README said the combination engine holds 102 records over
  35 plants; it holds 163 over 55. The ROADMAP said ten sources are seeded; there are 57.
  §13dz said eight recipes ship and three offer the amount field; sixteen ship and eight do.
- **Attribution rewritten** in the README: six principal sources now, credited by code rather
  than by name, and what the register deliberately does not record — which source came first.
- **ROADMAP A7 is new:** the whole list of what is left before 1.0, in one place. It was
  spread across A2, A3, A6 and the decisions file and could not be read as one thing.
- **Two decisions closed:** the phone navigation bar, checked against `PHONE_NAV` in the code
  (the README's sentence was right); and „which recipes ship", which moved to A7 because it is
  now about sixteen recipes from six sources.

## 1.0.0-rc63 — 14 September 2026

What actually went into the paste. §13ee

- **A printing step records its lines** — which extract, how much, which thickener. The paste
  recipe leaves the dye open on purpose, so only the work can say.
- **The same code as the pigment batch**, not a copy of it: `departureOf` and
  `linesFromRecipe` moved to `recipe-lines.js` and both modules call them.
- Lines are taken from the recipe **once**, with the figures resolved at that moment; a change
  is marked and the recipe's own figure stays readable beside it; a line left out is struck
  through, not deleted.
- **Guard `went-in`**, including the case that would lose work: saving with another step open
  must not empty a shut step's lines.
- **Caught by the release gate:** the new module was missing from the service worker's cache
  list, which would have broken the application offline.

## 1.0.0-rc62 — 14 September 2026

Paste printing can be recorded in the diary. §13ed

- **`process:paste` is unlocked.** It said „скоро" and blocked work against three shipped
  recipes.
- **The mordant is found in the paste.** A mordant print paste leaves the cloth bare, and the
  resolver looked for a step typed `mordant` — so a paste work read as unmordanted. Any step
  with a recipe is now asked. It also skipped every line that was not a percentage, which is
  every line of a paste; those now answer which mordant, with the band left unknown rather
  than computed from a figure that does not mean that.
- **A paste work names its dyestuff**, on the printing step, as a bath does on the dye step.
- **`extract`** joins fresh, dried, rehydrated and frozen — an extract is the plant it was
  made from.
- **How it was laid on:** block, screen, brush, stamp.
- **Two step types:** steaming flat (a bundle is steamed rolled up) and neutralising (a
  modifier bath changes the colour; this one stops the acid).
- **Guard `paste-work`**, on a cloth with no mordanting at all, seen failing both ways.
- **Still missing:** what actually went into the paste — which extract, how much. Next.

## 1.0.0-rc61 — 14 September 2026

Four mordant recipes from Alison Kelly's book. §13ec

- **Compound mordant**, bright and dark, crediting Kelly's book and Garcia. Figures from the
  book's batch, recalculated to 100 g of cloth: alum 20%, soda ash 10%, vinegar 200%, iron
  0.4–0.8% or 2–4%. The book's percentage page gives half the soda and is not recorded — the
  ratio of soda to alum is what decided it.
- **Bran or oatmeal bath**, carried as the mordant's required next step, with its quantity.
- **Soy milk bath** and **iron bath** as recipes of their own. Soy milk and wheat bran added
  as substances.
- **A liquid measured against cloth keeps its unit.** The vinegar is 200% of the cloth's
  weight and 200 millilitres; every weight-scaled line had been drawn in grams, because until
  now every one was a powder.
- **Chains still do not ship.** A chain of these is assembled in your own copy.
- **Asked and answered:** the aluminium acetate recipe was never in the shipped library. The
  one on screen is the owner's own record, marked do-not-distribute.
- **A guard for required follow-ons** (layer 3j): every one must resolve, and a bath that is
  only ever done after another recipe must be pointed at. Nothing had ever checked this.
- **Cleaned up:** a merge script ran twice from two drafts and left a duplicate fixing bath and
  four records with an earlier draft's numbers. All five were rewritten from one script.

## 1.0.0-rc60 — 14 September 2026

Three print pastes from Nicola Cliffe. §13eb

- **Mordant print paste**, **dye paste with no mordant**, and **ready-to-use paste with a
  mordant** — the last with aluminium acetate, Cliffe's times, steam fifteen to thirty minutes.
- **The mordant paste credits both sources**: Cliffe's figures are Maiwa's, and Maiwa's mixing
  warnings are in the steps. Cliffe's book and Maiwa's course are now in the register.
- **Two roles:** `thickener` and `marker`. A marker is not an ingredient of the result — the
  drop of extract that shows where the block printed washes out.
- **Two substances:** guar gum and cornflour.
- **Fixed batches, not ratios.** As ratios every figure read „—" until something was typed.
  The book says „makes about 200 ml", so the quantities are absolute and no amount field is
  offered. A thickener's range lives on the option: starch 5–10 g, gum 2–4 g.
- **`dyer-chooses`**, a fourth reason a line names nothing: which dye is the dyer's to pick.
- **Not done:** the diary still cannot record a paste print. `process:paste` still says „скоро".

## 1.0.0-rc59 — 14 September 2026

Item 18i: one list for what a record credits. §13ea

- **`sourceCodes` is a list**, on recipes and on substances. It was a string on five seeded
  recipes and a list on the sixth, and a substance had no source field at all — so the seven
  pigment substances credited Stopka inside their prose.
- **One reader**, `codesOf`, used by both screens, the audit and the delete policy.
- **The audit now checks recipe and substance codes.** It had only ever checked the
  combinations, so a recipe could cite a source that does not exist and the set passed.
- **A migration** gives every stored recipe a list, keeps the old field, and does not move
  `updatedAt`.
- **Found on the way, and old:** every source on the recipe screen was printed as a raw code.
  A seeded source keeps its code only in its id, and the lookup asked for a `code` field that
  is stripped at install. Both screens now use one answer, `sourceCodeOf`.
- **Not built:** who came first. „Garcia's, adapted by Kelly" is a relationship between
  sources, not a field, and stays in the recipe's note.

## 1.0.0-rc58 — 11 September 2026

Items 18b, 18c and 18d — the amount field on a recipe. Item 18 is closed. §13dz

- **The field is offered only where it changes something.** Four of the six recipes shipped at
  rc55 accepted a number and moved nothing, the lake master among them. The answer is computed
  — scale at two values and compare — not listed by type or basis, so it follows `convert`
  rather than repeating it. Where it does not scale, the head says the quantities are fixed.
- **A two-digit number can be typed.** The field was `type="number"`, and Chrome throws on the
  caret restore for those, inside a `try` that hid it: „42" came out „24". It is a text field
  with a decimal keypad now, and a comma works.
- **The figure belongs to its recipe**, not to every recipe. The fibre class stays global,
  because it describes the cloth.
- **Guarded in two layers, because one cannot see it all:** jsdom does not throw where Chrome
  does, so `deep-check` holds the rest and `screen-check` types „42" on a real keyboard. Put
  back to a number input, it reports the owner's fault verbatim.

## 1.0.0-rc57 — 11 September 2026

A recipe can be an ingredient of a recipe. §13dy

- **`option.recipeId`**, beside `plantId` and `substanceId`. A line whose content is made by
  another recipe now names that recipe; several options on the line are variants of it.
- **The pastel is a pair**, as the watercolour already was: `pastel-binder-oat` (Stopka,
  7.5 g oats to 240 ml water) and `pastel-binder-gum` (tragacanth or methylcellulose, no
  quantities recorded), with the pastel taking 3.5 ml of either.
- **Corrected from rc56:** the watercolour's binder line named gum arabic, which is the powder
  in the solution rather than the solution. It names `watercolour-binder` now.
- **Oat groats** added as a substance, category `binder`. Substances 0.4.0, recipes 0.10.0.
- **Refused:** a weight in grams for „two spoons of pigment", and a spoon unit in the
  vocabulary. The pastel keeps the book's figures and does not scale.
- **Delete protection follows the new pointer** — a binder recipe used by another recipe
  cannot be deleted. Guard seen failing with the `refs.js` path removed and with the name
  resolution removed.

## 1.0.0-rc56 — 11 September 2026

Items 18g and 18h. §13dw, §13dx

- **Seven pigment substances** — gum arabic, gum tragacanth, methylcellulose, kaolin,
  glycerine, honey, clove oil. Seven, not six: item 18g subtracted chalk from a list that
  never held it. Substances pack 0.3.0.
- **Categories:** `binder` for the gums, `filler` for kaolin, `auxiliary` for glycerine,
  honey and clove oil — they neither bind nor fill. Safety fields left empty, which is the
  state of thirteen of the twenty-six records already shipped.
- **The seven recipe lines** that named these in prose now point at them; the pastel filler
  and binder each carry two options, because the recipe offers a real choice. Recipes pack
  0.9.0. The `awaits-18g` exemptions went stale and the guard failed on all seven, which is
  how a temporary exemption is supposed to end.
- **The weigh list carries the first sentence of each line's note.** „Калиева стипца 10 ml"
  now says the alum is dissolved and the figure is per jar. A line that names no substance
  shows its note instead of its role, so the fermentation recipe reads sauerkraut juice
  rather than „помощно".
- **Guard `weighnote`**, held at the words rather than a class name, seen failing with the
  note suppressed and with the whole note printed.
- **Raised: 18i** — a substance record has no source field, so „Stopka says" sits in prose.

## 1.0.0-rc55 — 11 September 2026

Item 18f: the pigment recipes' lines name the substances the library already has. §13dv

- **Six lines linked**, recipes pack 0.8.0: potassium alum and soda ash in Stopka's lake
  master and fermentation recipe, potassium alum and chalk in Green's hot lake. The work view
  read „носител", „алкали" — the same thing it shows for a missing substance.
- **By an idempotent merge script** that fills only and stops if a line's role is not the
  expected one. Notes untouched: they say what the link cannot.
- **Not added: aluminium sulphate on Stopka's line.** Four hydrates in the library, none
  stated in the book.
- **The sauerkraut juice is not a substance** — the owner's decision. Water likewise.
- **A guard, layer 3i**: every shipped recipe line names a plant or substance that exists, or
  is listed with a reason. Seen failing on the rc54 data (the six lines and nothing else), on
  a stale exemption, on an exemption for a line that does not exist, and on a dangling link.
- **Raised: 18h** — the weigh list does not show a line's note, so „Калиева стипца 10 ml"
  does not say the alum is dissolved.

## 1.0.0-rc54 — 11 September 2026

Item 18e: a record says when the library holds a different version of it. §13du

- **The note on the record.** Plants, Substances, Techniques, Recipes and Reference records.
  Nothing when the record matches its pack; otherwise which fields differ, in words, and
  whether the record was edited or withdrawn — beside the same „Обнови от библиотеката"
  button the list has. After an update the record is drawn again from the database.
- **Compared by content, not by version.** The version on a record moves only when that
  record is updated; the pack's moves with any change in it. A version test would flag
  current records for ever. One comparison, `differingFields`, shared with the preview.
- **The list button counts** what the preview ticks when it opens. Edited records are not
  counted — the preview does not tick them. The rule is one function, `defaultChosen`,
  used by both. No number when there is nothing to do.
- **Drawn first, filled after.** The first version counted inside the render and delayed
  every screen after it; the deep check showed it as `rework` and `prep` failing one run in
  four or five. Marks are now filled by one watcher, 150 ms late and only while still on
  screen, and each says when it is done. Twelve clean runs after.
- **Field names in words for every pack.** The preview printed „ingredients, steps" for a
  recipe update; the dictionary covered two packs of five. Now keyed by pack, with a static
  guard (layer 3h) that every carried field is named, in both languages, and none is stale.
- **Techniques:** the note stands on the form, and `[data-sync]` joined the ways out that
  `dirty.js` guards.
- **Guards**, each seen failing: a fresh install differs from its own packs (the boot
  made to rewrite a field); a note that decides by version (all five modules); edited
  records counted (all five); the module keeping its old copy after an update; the
  library button leaving an unsaved technique form without asking.

## 1.0.0-rc53 — 11 September 2026

Item 18a, and one line of CSS the release gate could not pass without. §13dt

- **The amount field no longer empties the recipe it stands on.** Committing the field on
  the working view — Enter, Tab, a click away, the spinner — fired `change`, which called
  `readForm` on a screen with no form; an absent form reads as empty ingredients and empty
  steps. The weigh list and every step vanished the moment a figure was entered.
- **`readForm` refuses to run outside the editor**, with an error that says what it would
  have done. A quiet return would hide the next caller that should not be there.
- **The damage was in memory only.** Item 18a said Edit-then-Save would write the emptied
  recipe; Edit reloads from the database, and that was checked by running it. The claim is
  withdrawn in the decisions document and the roadmap.
- **A new deep-check guard, `workview-commit`**, sends `input` AND `change`, as a browser
  does. The old one sent only `input`, which is why it passed. Seen failing on the old code
  (2 lines, 2 steps → 0, 0) and on a half-fix (a named rejection).
- **The batch screen's action row is 44px on a phone.** `.box.flat{min-height:38px}` out-
  ranked the one-class phone rule at every width. Found by the screen layer on the untouched
  rc52, in a run with Chrome present.

## 1.0.0-rc52 — 10 September 2026

Sixth and last release of the pigment model (item 17): three colours from one batch. §13ds

- **A batch's colour becomes a list of swatches.** One batch of madder becomes powder, and
  watercolour made from it, and pastel made from the same powder — three different colours,
  where `swatchHex` could hold one and made the other two things that cannot be said.
- **A swatch names three things at once**: what it is, what it is on, and by which recipe.
  Nabil Ali's chart is the shape of it — madder as three swatches, safflower as „potash on
  cotton" and again as „potash on leather". The swatch's recipe dropdown is unfiltered while
  the batch's is not: naming a recipe beside a swatch is saying what the swatch is of, not
  logging a making.
- **The hex is optional and the absence draws as one.** „Dusty pink — I did not measure it"
  is a finished record. A colour input can never be empty, so the „no measured colour" box is
  read after the picker and clears it — otherwise a swatch described in words gets whatever
  grey the control opened on, which is an invented measurement wearing a data field. Such a
  swatch draws with a dashed outline.
- **`swatch_kind` is closed: dye, pigment, watercolour, pastel, ink, glaze.** The owner asked
  for an open list and was right to; the application cannot keep one today, because nothing
  writes to the `vocabulary` store and `backup.js` skips it, so an added term is lost on
  restore. The reason is written beside the terms and the editor is ROADMAP B6c.
- **The migration reads the old pair honestly.** It becomes one swatch of kind `pigment`,
  which is what a batch was actually recording. No watercolour row is invented on the grounds
  that one might exist. A name with no hex is kept and given no colour; only a batch that
  recorded neither gets an empty list. Watched failing three ways — a default grey for the
  unmeasured swatch, dropping it for having no hex, and a blank swatch on every batch.
- **A helper that could not be reused, and the silent failure avoided.** The swatch name
  wanted `pairField`, whose control name would have had to be a path rather than a name;
  `readPairs` splits on the first dot and would have written every swatch's name to one key
  on the batch, for all swatches at once, without error. Caught by reading the helper rather
  than by running it.
- **The screen fixture carries three swatches, one of them unmeasured**, so the row and its
  dashed absence are drawn at all four widths rather than only reasoned about.

**Item 17 is finished.** What remains of the pigment model is the six new substances, which
are content and not code — a substance record carries hazard, handling and purpose, and
writing those is making claims that need a source. They start as a workbook, as the plants did.

## 1.0.0-rc51 — 10 September 2026

Fifth release of the pigment model (item 17): the batch records what actually went in. §13dr

- **A batch holds the lines that were really used.** Take them from the recipe and they
  resolve to amounts — 50 g of root against 10 g of carrier — then correct them at the pot.
  The batch named a recipe and showed none of its figures, so over the pot the screen told
  you which recipe and not how much of anything.
- **Amounts, not a reference.** If the recipe's percentage is revised next year, last
  summer's batch still says 50 g, because 50 g is what went in. A batch that recomputes
  itself is a batch that changes its own history.
- **Every taken line remembers what the recipe said ON THE DAY.** The departure is measured
  against that and never against the recipe as it stands now — otherwise a pack update
  quietly turns a faithful batch into a departure, or hides a real one, without anybody
  touching the record. The recipe's name is copied too, so the departure stays readable if
  it is later renamed or withdrawn.
- **Four departures: added, changed, swapped, left out.** Computed, never stored. A line
  taken from the recipe and left out is struck through rather than deleted — „I did not put
  the soda in" is knowledge, and deleting the row makes it indistinguishable from never
  having followed a recipe. A line the owner added herself simply goes; there is nothing for
  it to depart from.
- **This is what answers the chalk-or-soda question.** The owner has used both and does not
  remember which served her better. A recipe cannot hold that. A record of what was actually
  put in can.
- **Taking happens once.** The button is not drawn while lines exist and the handler asks
  again rather than trusting that, both through one exported `canTakeLines` — a condition
  written twice is how a control that looks disabled turns out to be clickable. One click
  must not replace an evening's entries.
- **The migration reconstructs nothing.** An existing batch gets an empty list and no
  `linesFrom`. Filling the rows in from `viaId` would have been easy and would have claimed
  she followed the recipe exactly, which is the one thing the record cannot know.
- **The guard imports the rule rather than restating it**, so a copy cannot pass while the
  screen does something else. Watched failing by breaking the rule in place — and one of
  those breaks threw instead of reporting, stopping the suite with a stack trace rather than
  a sentence. The checks were reordered so the function answers, and a line with no history
  field at all is now asserted to answer „added" rather than crash.
- **The screen fixture carries one line of each kind**, so the panel is measured at all four
  widths with its chips and its struck row drawn rather than empty.

## 1.0.0-rc50 — 10 September 2026

Fourth release of the pigment model (item 17): two real recipes, and a temperature that is a
range. §13dq

- **Two madder lake recipes ship, cited, with every figure from the page.** Natalie Stopka's
  fermentation extraction — sauerkraut juice, one to two weeks, 66–76 °C digestion, alum and
  a soda ash solution metered to pH 7 — and Joanne Green's hot extraction, 50–80 °C for at
  least three hours, then 10 ml of alum and 5 ml of chalk per jar. `seed/recipes.json` to
  0.7.0.
- **They are recipes, not departures from the master.** They differ in kind: one has a
  two-week biological stage and one does not, one precipitates with a strong alkali and one
  with a mild one. A batch's departures are for the smaller differences inside one route —
  the owner's own practice, Green's with a 24-hour presoak, is exactly that.
- **A recipe's temperature is a range: `tempMinC` and `tempMaxC`.** Both sources give two
  figures, and for madder the ceiling is the half that matters — above it the red goes brown,
  which is why the plant already carries a `softMaxTempC` of 82. The plant record had held a
  range all along, `tempSpan(min, max)` was already written in `units.js` and never called
  from the recipes module, and pre-filling a recipe from a plant part took `.min` and dropped
  the ceiling three lines under a comment arguing that one number hands the elder fruit the
  elder leaf's boil. All three now read the same helper.
- **`tempC` survives, deliberately.** Migrations add; the old field is the way back if the
  mapping proves wrong, and it comes out later on purpose rather than by drift — the same
  reasoning as `stateEvents` at §13bd.
- **The migration refuses four things, and each is asserted.** It invents no ceiling for a
  recipe that had no temperature, does not narrow a range entered by hand, leaves „never
  above 80" without an invented floor, and does not move `updatedAt` — reshaping a field is
  not the owner touching a record. Watched failing all four ways before being accepted.
- **One thing left as a question rather than answered:** which of chalk and soda ash gives
  the better result. The owner has used both, they behave differently, and she does not
  remember which she preferred. That is not a fact about a recipe — it is what a batch is
  for, and it is the clearest argument yet for rc51.

## 1.0.0-rc49 — 9 September 2026

Third release of the pigment model (item 17). §13dp

- **The fourth scale mode is NOT in this release.** `scaleBy: 'output'` needs a recipe to
  declare what it yields, and none of the three does. Stopka's medium makes „roughly 20
  pans", but that is her recipe — 60 g of gum, honey, optional ox gall — and ours is the
  owner's, with glycerine and no ox gall. Adding the volumes up would have produced a figure
  that is an invention wearing a data field, since volumes are not additive when a gum
  dissolves. It waits on one line of a workbook rather than shipping a mechanism with no user.
- **The binder scales as one recipe now.** The gum line was `absolute: 42` while the water,
  glycerine and honey were ratios against the raw amount — and the raw amount is the gum. At
  84 g the water doubled and the gum still said 42. The gum is now the thing everything is
  measured against, which is the owner's own sentence: you decide how much binder to make,
  and the gum follows. The clove oil stays absolute and is asserted to stay absolute — five
  drops preserve a jar, not a proportion of one.
- **The watercolour recipe has its 1:1.** Its own note said „1:1 to the pigment" and both
  lines carried `quantity: null`. `seed/recipes.json` to 0.6.0.
- **A fifth way for a guard to lie, and it was one of ours.** The suite asserted „the gum
  itself is absolute and unchanged — 42", cited twice as evidence the fixed gum was a
  deliberate decision. It was expected to fail here and it did not: at 42 g both models
  return 42, so it passed before the change and after it, having verified neither half of
  what it claimed. It is none of the four already recorded — right screen, right value,
  truthful report, taken at the single point where the two possibilities agree. Rewritten to
  assert at 84, where they must disagree, and watched failing at 42 against 84.
- **Deliberate emptiness said in words.** The pastel recipe's filler and binder keep no
  figure, and their notes now say why: the filler proportion is the choice that makes a
  pastel soft or hard and is made at the slab; the binder goes in drop by drop until the mix
  is claylike. Empty there means „decided at the slab", not „not yet entered".

## 1.0.0-rc48 — 9 September 2026

Second release of the pigment model (item 17): how much plant for how much carrier. §13do

- **A new basis, `percent_of_carrier` — „% от носителя".** A lake pigment is measured
  against none of the five existing bases: not cloth, not bath, not the dyestuff. It is
  measured against what it precipitates ONTO. Named after the carrier rather than the alum
  because Nabil Ali's madder precipitates onto chalk with no alum anywhere, and a basis
  called „per cent of the alum" would have refused that recipe.
- **The lake recipe has numbers instead of dashes.** 10 g of alum as the carrier, 5 g of
  soda, and madder root at 500% of the carrier, which computes to 50 g. All three lines had
  `quantity: null` and the working view was a column of dashes — not because someone had
  not finished the record, but because no basis could hold the figures, so they stayed in
  the note as prose. `seed/recipes.json` to 0.4.0.
- **Only madder is entered, of the three plants in Stopka's table.** Logwood is not in the
  library and no new plants are being added; „жълтениче" is ambiguous in Bulgarian between
  the `Reseda luteola` that is in the library and the *Chelidonium majus* that is not. A
  figure against the wrong plant does not look like a doubt afterwards, it looks like data.
  The line's note says why the others are missing and what would bring them in.
- **Refusal rather than a plausible number, in three shapes** — no carrier line, a carrier
  that is a per cent of itself, a carrier with no amount. Each returns nothing. A figure
  invented here is a figure somebody weighs out. `deep-check` refuses the first two outright
  so such a recipe cannot reach a screen; `try-calculators.mjs` asserts all three at the
  arithmetic, plus that doubling the carrier doubles the plant and leaves the soda alone.
  Verified by putting the line back to `absolute 50 g`: the everyday figure stays 50 and
  three behaviour assertions fail, which is the point of asserting behaviour and not output.
- **A comment in `modules/plants.js` was in the wrong basis.** It read „Stopka gives madder
  root 500% by decoction", describing 500 as a dose — a per cent of cloth, which is what
  every figure in that column is. The source register says what the table actually is: per
  cent of the weight of the alum, with no cloth in it. Beside 50–100% dried madder, behind
  the same „%", it would have been read as ten times the dose. The data was never wrong; 500
  never reached a plant record. The comment was, and a comment is followed.
- **Not touched, deliberately:** the lake recipe is still `scaleBy: 'raw'`, so the working
  view offers a raw-amount field that now changes nothing, every line being computed without
  it. That is rc49's scope.

## 1.0.0-rc47 — 9 September 2026

First release of the pigment model agreed in `DOCUMENTATION_DECISIONS_NEEDED.md` item 17.
The vocabulary and the seeded records; no screen behaviour changes except one button. §13dn

- **Two substance categories, earned rather than convenient.** `binder` and `filler`. The
  first plan was one category for „pigment-making materials" and it grouped substances by
  the book they appear in rather than by their job. Glycerine, honey and clove oil earn
  nothing new — they belong in `auxiliary` beside neutral soap and Synthrapol.
- **Chalk moves from `auxiliary` to `filler`**, and it turns out to have been in the library
  all along, so six substances are still to come and not seven.
- **Slaked lime moves from `auxiliary` to `modifier`.** A strong alkali that raises pH in an
  indigo vat and in safflower's alkaline extraction. The rule is retrospective: it governs
  the twenty-six already seeded.
- **Two ingredient roles.** `plasticiser` for glycerine, which had been sharing `humectant`
  with honey so the working view drew „задържа влага" twice for two different jobs — the
  exact collapse the role block's own comment was written to prevent. And `carrier` for what
  a lake precipitates onto: Stopka's is alum, Nabil Ali's is chalk, and the lake recipe's
  alum line said `mordant`, which mordants nothing.
- **The lake recipe's alum line is `carrier`.** `seed/recipes.json` to 0.3.0,
  `seed/substances.json` to 0.2.0.
- **„Обнови от библиотеката" in Recipes, and a guard asking which pack no screen can
  update.** A pack ADDS an absent record by itself at boot and can only CHANGE one through
  that button. Four packs had it; `recipes`, `sources` and `glossary` did not — so this
  release's own correction would have gone out in the ZIP and reached nobody who already had
  the application. `sources` and `glossary` are excused with the reason written down: both
  live inside the Library, which has no list of records to stand a button beside, and where
  it goes has not been decided. `scripts/try-pack-reachability.mjs`.
- **A guard that the manifest still says what the packs say.** `ensurePacks` reads only
  `seed/manifest.json` to decide whether to load, so a manifest left behind makes an
  installed copy skip a pack it does not have — silently, shipping the records to nobody.
  Three packs are bumped by hand in this release, so the guard travels with the change it
  protects. `scripts/try-manifest-agrees.mjs`.
- **`deep-check` now walks a substance's `category`.** A recipe's `roleCode` was checked
  against the vocabulary and the substance's own category was not. Found by typing one that
  exists nowhere while making the two moves above, and the whole suite passed. The Materials
  screen filters by category, so such a record would have vanished from every tab without
  ever being deleted.
- **Scope grew by three, each dragged in by the declared change rather than chosen beside
  it** — the test being whether the change could be delivered without it. Every guard was
  watched failing first, eleven distinct failures across the three.

## 1.0.0-rc46 — 9 September 2026

Three faults reported in one sitting, and they were one shape: a name or an address
written in a second place, with nothing holding the two against each other. §13dm

- **„Направи архив" now goes to the backup.** It carried `data-go="tools"` and landed on
  the list of calculators. The backup has had its own address since §11 — `#/tools/backup`,
  given to it so it could be bookmarked — and the one warning on the home screen that can
  cost work which cannot be got back was the one that did not arrive where it promised.
- **„Инсталирай пакетите" now goes to Plants.** Same fault, worse target: there has never
  been a packs screen in the calculators. „Провери библиотеката" is a button inside each
  reference module (§10), and this branch only fires when there are no plants.
- **One word for one destination.** „Инструменти" on the dashboard tile, „Калкулатори" in
  the sidebar, „Инструменти" in the screen title and the browser tab, „Калкулатори" on the
  back button inside a calculator. Two keys held one word — `nav.tools` and
  `nav.calculators` — and `t('nav.' + id)` is built at run time, so layer 3b could not see
  the duplication. `nav.calculators` is gone; `nav.tools` says „Калкулатори" and everything
  reads it. The module id stays `tools`, which is code.
- **The subtitle stopped promising справки**, which moved into the Library at rc25 and had
  been listed on this screen for twenty releases.
- **The browser tab is named after the navigation entry, not the module**, reusing
  `activeNav()`. `#/tools/backup` no longer says „Калкулатори" while showing the backup.
- **A new static layer, 3e: which module does nobody measure.**
  `scripts/try-screen-coverage.mjs` holds the `MODULES` registry in `app.js` against the
  route list in `screen-check.mjs` and a declared `UNMEASURED_MODULES`.
  - Why it is general rather than two lines added by hand: `#/pigments` was **absent** from
    the route list — not disabled, not skipped, not reported — so the pigment batch screen
    had been rendered at no width at all since it was written, while the suite said „all
    held" every release. A guard aimed at the wrong screen at least reports something that
    can be doubted; a guard aimed at no screen looks exactly like a pass. Adding the two
    lines would have fixed the pigments and left the hole.
  - Run before anything was fixed it named **three**: `pigments`, `batch` — exempt by
    accident because it is reached from the fabrics list rather than the sidebar, which is
    a fact about navigation and not a reason its layout is unchecked — and `packs`,
    fourteen lines and unbuilt, now the only exemption and with its reason written beside
    it.
  - Static on purpose: two files read as text, no browser, no shim, so it runs on a laptop
    with nothing installed — which is when a new module is written and the sixth layer is
    being skipped for a missing Chrome.
  - Seen to fail in four directions before being accepted: no exemption list declared, a
    module in neither list, an exemption naming a module that is also routed, and an
    exemption naming something that is no longer a module.
- **`#/pigments`, `#/pigments/new` and `#/batch` are now measured at all four widths**, with
  a fixture for a finished madder batch so the list has a row to open. These screens have
  never been checked at any width, so the sixth layer may turn up geometry faults that have
  been shipping for several releases. That is the guard working, not a regression.
- **A fifty-third source: Nabil Ali, *Gold from Newton's Apple Tree*.** Historical recipes
  read out of manuscripts and then carried out, each printed beside a swatch the author
  painted from it. `seed/sources.json` goes to packVersion 10. Cited by nothing yet, which
  is the normal order — the register is filled before the records that lean on it.
- **The pigment findings are recorded, and the model that answers them is agreed and NOT
  built** — `DOCUMENTATION_DECISIONS_NEEDED.md` item 17, with the work listed in ROADMAP
  B6b and B6c. Two substance categories, two ingredient roles, a basis of per cent of the
  carrier's weight, a fourth scale mode by output, batch lines that may depart from the
  master and say so, and swatches as a list. Nothing is in the code. It is written in the
  decisions document rather than as a §13 section because those sections describe how the
  application works, and a specification that describes something unbuilt is one that lies.
  Three things the sources corrected along the way, one of them this document's own earlier
  proposal, are recorded in the same item.

## 1.0.0-rc45 — 25 August 2026

- **Thirty-three combinations gained an indicative colour**, taken from their own plant's
  measurement under the same mordant. Not invention — same plant, same mordant, the owner's
  own figure — and not a measurement of that combination either, which is kept in the data
  as `swatchApprox` and `swatchFrom`, the shape the model already uses for an estimated
  number (§13ai). Measured 102, indicative 33, still nothing 28. §13dl
- **The 28 stay empty.** Their plant never measured that mordant, so there is nothing to
  take and a near-enough colour would be the invention this refuses.
- **Three releases were spent on the wrong question.** rc39 drew an outlined square for the
  absence, rc42 made it visible, rc44 removed it from cards — each a reasonable answer to
  „how should an absence be drawn", none of them asking whether the absence had to exist. It
  did not, and the data had said so since rc35. When a rendering decision has been revisited
  three times, the fault is in the data or the model. §13dl
- **A soft inset edge** on an indicative swatch: the colour reads at full strength and the
  block does not read as solid fact. The panel says in words where it came from.
- **Three new guards**, each failing on its own: every borrowed colour is marked, every
  marked one names its origin, and the plant it cites still holds that colour — a borrowed
  hex whose provenance does not check out is worse than none, because it looks sourced.

---

## 1.0.0-rc44 — 25 August 2026

- **The empty square argued with the words beside it.** rc42 drew an outlined, crossed box
  for a record whose colour was never measured. On a card that is wrong: „ярко до слънчево
  жълто" is written next to it, so the colour is not missing and the box reads as a hole
  where the answer should be. No box on a card; the words take the width. The mark stays in
  the Reference table, where the column promises a colour and has to say why there is none —
  three places, three different right answers. §13dk
- **The specification strip had come apart.** Part-and-condition and its dose were separate
  tiles in an auto-fitting grid, so three dosings printed the same two headings three times
  across a row, and wrapping could separate a part from its own dose. One row per part and
  condition now: which part, how much, how hot to draw it, how hot to dye, the ceiling.
  Plant-wide figures stay tiles — a one-row table of five unrelated numbers is worse.
- **The panel names all seven conditions the ranking uses**, and names them even where the
  record is silent. It showed three, because `fact()` renders nothing for an empty value — so
  a reader could not tell cotton from nobody-wrote-it-down, which is §13ck disappearing on
  the screen built to show it. `CRITERIA` is exported and the guard reads it, so the two
  cannot come apart.
- **Two guards were chasing a class name again.** The elder-temperature guard asked
  `.usetile, .fact` and had already been moved once for the same reason at §13bs; the
  working-figures guard asked whether `.usenow` held „WOF". Both reported a failure that was
  true and was not the question. Both ask the page now.

---

## 1.0.0-rc43 — 25 August 2026

The Reference gives one answer however the question was asked, and the screen layer checks
four widths instead of two.

- **Two presentations became one.** A colour question drew rows with a detail panel; a
  conditions question drew cards with nothing beside them. So a record with no measured
  colour — which cannot be ranked by colour at all — carried influences and sources readable
  on no screen. Sixty-one records, every eco print one among them. Recorded as a finding at
  rc40, closed here. §13dj
- **Four columns instead of six.** Difference and source had columns of their own; the
  difference qualifies an answer rather than being one and is a badge at the end, and the
  source belongs under the colour it produced. The badge changes with the question, because
  the question changes what „how close is this" means. Nothing else does.
- **Exact and near stay apart** — that is the whole of §13ck and a badge cannot carry it. Two
  tables, two headings, one panel beside the first.
- **A tablet at 834px failed on eight views immediately.** The sidebar disappears at ≤820px
  and the table's scroll rule ALSO ended at ≤820px, so just above the breakpoint the sidebar
  took its width and a wide table simply ran past the edge. Neither of the two widths being
  tested could show it: the fault lived exactly in the gap between them. The rule applies at
  every width now, and there is no breakpoint left to be on the wrong side of. §13dj
- **`screen-check` runs phone (390), tablet (834), desk (1280) and wide (1680).** The tablet
  is where a two-column split gives way and the wide is where prose stops being a strip —
  neither visible to the two original widths, and both changed the release before.

---

## 1.0.0-rc42 — 25 August 2026

Two faults the owner saw on a real screen, both introduced by the release before them.

- **The dashed „no measured colour" mark has never once been visible.** The rule sat 700
  lines above `.refswatch`, whose `border:1px solid` simply won — so for two releases it was
  in the file, in the specification, asserted by a guard that read the class name, and on no
  screen at all. What appeared was a plain empty box, which reads as an image that failed to
  load. Written after the rules it has to beat now, naming every place a swatch is drawn, and
  with a faint diagonal so it reads as deliberate. §13di
- **No layer could see that.** A class-name check passes on a class name; only a real browser
  resolves a cascade. `screen-check` now compares the computed border of every `.unmeasured`
  element — and found 61 on a screen this release had not thought to look at.
- **The list drew fifty colourless squares.** rc41 let unmeasured records reach the plant
  screen, which was right; the list writes `background:${hex}` with no test. In a list a row
  of swatches is a glance, so an unmeasured record gives its name to the tooltip and no square
  — an empty box among colours is noise. On the detail screen the absence is the answer and
  is drawn.
- **Guard 24k drew the detail view and not the list**, and passed against a deliberately
  broken list. It draws both now. A screen that is not drawn is a screen that is not checked.
- **`--measure` was a number and is now a measure**: `min(100%, 74ch)`, which tracks the
  typeface and gives way on a narrow column. The ceiling stays — a 130-character line is not
  more readable for being wider. Above 1100px the narrative sections flow into two columns,
  each at its own measure: sections, never paragraphs. §13di

---

## 1.0.0-rc41 — 25 August 2026

What the plant screen was losing. The owner said the page held less than it should; the
fields were all rendering, and what was being dropped was combination knowledge.

- **A combination with no measured colour was not on the page at all.** `plantColourSources`
  required a hex, and 61 records have none — dyer's chamomile has three combinations and
  showed zero, oak has five and showed two. The colour NAME is the knowledge; the swatch is
  what is missing, not the answer. All of them draw now, with the outlined empty square. This
  is the default-brown fault in the other direction: the Reference invented a colour it did
  not have, Plants dropped the record for not having one. §13dh
- **The 37 explanations were reaching the Reference panel only.** A plant's combinations are
  its answers, so they are on its page too — read from the canonical record at render, never
  copied into the plant seed, which is what stops the two screens disagreeing. Grouped by
  factor across the plant: „the mordant" said by three of oak's records is one thing being
  explained about oak.
- **Provenance.** The Reference credited Catharine Ellis for eucalyptus and the eucalyptus
  page did not. Both now, resolved through the register, linked, and under a heading.
- **One layout, three densities.** Guard 24k draws oak, eucalyptus and rose and compares each
  against its record. Colour cards are a `minmax(240px,1fr)` grid, so 2, 4 and 8 results all
  fill the row; the swatch is 64px here against 52 in a search result, because on this screen
  the colour is the answer.
- **Four probes lied before one told the truth**, and each looked like a finding: a searched
  word that was never on the screen, labels falling back to codes because the probe had not
  seeded the vocabulary, a remembered label where the screen says another, and a heading that
  did not exist. Guard 24k reads every label from i18n by key — it cannot be wrong about a
  word without being wrong about the screen. §13dh
- **The new guard passed alone and failed beside its neighbour.** `reset()` leaves the query
  alone, so guard 24j was inheriting state from whatever ran before it. It clears its own
  query now. A guard that depends on the one before it is testing the order they were
  written in.

---

## 1.0.0-rc40 — 25 August 2026

The knowledge three rounds of the data workbook returned and the model could not hold. Data
and integrity only; the Reference and Plants presentation is the next two releases.

- **37 explanatory texts imported**, each with its source — what the fibre, the mordant, the
  medium, the species, the dose or the preparation does to a result. They had been held at
  every previous import because `influences` was declared and never filled and `notes` was
  already occupied by two different kinds of thing. Not new research: every sentence came out
  of a workbook the owner filled. §13dg
- **A closed list of six factors.** A free-text factor would be a second notes field wearing
  a label.
- **`sourceCodes` — a record may rest on more than one source.** The guide taught the colour,
  the paper taught which fibre and mordant. Not the same claim, and one is not a correction
  of the other. `learnedFrom` is unchanged on all 163 records and still read; records with
  only the old value go on working, and the audit checks none was left citing nothing.
- **105 records held prose where the register holds a code** — the guide on 102 of them.
  Mapped to codes in `sourceCodes`, left alone in `learnedFrom`: rewriting 163 records to
  tidy a new field would be a migration performed for the field's benefit.
- **An influence cites its own source, and `refs.js` counts it.** Otherwise the single record
  citing Catharine Ellis would have read as uncited and been freely deletable — §13ct's fault
  arriving a third time by a new door.
- **Eucalyptus, the case the owner set**: unmordanted protein, the species deciding, Ellis
  cited, the colour source kept. Asserted by name in four parts, each failing on its own.
- **Six new integrity guards** and one that draws the panel and reads it. All seen failing.
- **Found and not fixed**: the detail panel exists only on the colour path, so a record with
  no measured colour has influences that cannot be seen. Recorded rather than rediscovered.

---

## 1.0.0-rc39 — 25 August 2026

The Reference rebuilt around the question, from a v0 prototype used for arrangement and not
copied. **No new filter, no new field, no change to the ranking or to any search semantic.**

- **Colour families replace the picker as the way in.** A chip sets the same `colourHex` the
  picker sets, so the ranking is untouched — pressing „Розово" is pressing pink with the
  picker's difficulty removed. „+ Точен нюанс" is an action and carries no swatch of its own;
  the picker is still there for when the answer really is a nuance. §13df
- **A detail panel that starts with an answer.** First result shown rather than the panel
  waiting to be clicked; one column below 820px; the selection resets when the question
  changes. Twelve results, which is what the ranking already returns.
- **„Влияния" is not on the panel.** `influences` is declared on all 163 records and
  populated on none. A section standing empty on every record reads as a broken screen.
- **Sixty-one records drew a colour nobody measured.** Their sources describe the colour in
  words and give no figure, and every one of them painted a default brown on six code paths.
  An outlined empty square instead. §13df
- **And the same fault in three more places**: a new record started at that brown; the edit
  form showed it in the picker, so saving without touching it stamped it on as a measurement;
  and both pickers opened on it, leaning on a colour judgement before one was made. New
  records start empty, the form carries a „no measured colour" checkbox that wins over the
  picker, and the pickers open neutral.
- **A record with no measured colour cannot appear in a colour search at all** —
  `rankByColour` cannot order a colour that is not there. Correct, and worth knowing: the
  colour question reaches 102 records and the other 61 are found by their conditions.
- **New guard 24j**, and its first three versions each proved nothing: one broke the swatch
  helper and passed because the record it watched was not on the screen; one cleared the tab
  and not the question; one matched raw HTML and caught a colour picker's starting value. The
  fourth is asked in four directions and fails in all four.
- A heading in the new panel set its own font size; the static guard caught it on the first
  run. It reuses the existing one.

Release check and screen check pass at both widths.

---

## 1.0.0-rc38 — 25 August 2026

The owner asked whether anything about Pigments was unfinished, and said she still saw a
weight-of-cloth calculation on a pigment recipe. She was right; §13ca said otherwise.

- **`SHOWS` was applied to the edit form and to nothing else.** The work view — the screen a
  recipe is opened on to be followed — went on asking „for how many grams of cloth?" and
  „which fibre?" of a watercolour recipe. Guard 24i drew the form and only the form, so it
  reported the half it covered and produced a specification section saying the work was
  done. §13de
- **`scaleBy: 'raw'` was in the seed data before it was in the code**, and was silently
  treated as weight-of-cloth. Three scaling questions now: cloth, bath volume, or the amount
  of raw material in front of you. A `pigment` or `paste` recipe falls to `raw` whatever its
  field says. §13de
- **`ratio_to_dyestuff` had nowhere to look** on a watercolour: it resolved against a cloth
  weight and a `dyestuff` ingredient, and the recipe has neither. „One to one with the
  pigment" showed nothing. On a raw-scaled recipe the raw amount is what everything is
  measured against.
- **The unit was forced to grams** for any non-absolute basis, which turned 15 ml of
  glycerine into 15 g — a 26% error on a liquid, from a default written for dye powders.
- **New vocabulary, approved first**: roles `solvent`, `humectant`, `preservative`, and the
  unit `drop`. Four things doing four different jobs would have read as one under
  `assistant`, and clove oil written as 0.25 ml would claim a precision nobody has.
- **A recipe may cite more than one source.** The watercolour binder rests on Joanne Green's
  book and on the studio's own practice — the book supplies the figures, the practice
  confirms they work. `sourceCode` accepts a list, and `refs.js` reads it: compared with
  `===` a list matches nothing, so a source cited only by a two-source record would have been
  freely deletable. That is §13ct's fault returning by the back door.
- **Attribution on a recipe was stored and never shown.** Every seeded recipe carried
  `sourceCode`; no screen displayed it. The read view shows it now.
- **New recipe**: the watercolour binder, written in Claude's words from the book's figures
  and the owner's practice.
- Guard 24i now draws the work view too; `try-calculators.mjs` scales the binder end to end.

---

## 1.0.0-rc37 — 24 August 2026

Two of the remaining release-hygiene items: units, and the first numerical test the
calculators have ever had.

- **Metric or imperial, chosen on the device, stored canonically.** Every figure stays in
  grams, millilitres and degrees Celsius; `units.js` converts on the way out and parses on
  the way back in. A record carrying its own unit has to be read twice, and a backup taken in
  ounces restoring onto a device set to grams would be quietly wrong by a factor of
  twenty-eight. §13dc
- **The round trip did not close and now does.** A fixed two decimal places turned one gram
  of iron into „0.04 oz", which read back as 1.13 g — a 13% error produced by opening a
  record and saving it without touching the weight. Places now follow the size of the number.
  §13dc
- **A ratio never converts, and the code says so out loud.** Percent WOF, a liquor ratio, a
  solution strength — the same number in every system. `wof()`, `ratio()` and `percent()`
  exist so a call site cannot be silently confused with one that forgot. §13dc
- **The unit system survives a snapshot restore**, like the language: it belongs to the
  device, not to the work.
- **The aluminium acetate stoichiometry is verified against three independent published
  recipes.** Earth Guild give 120 g alum → 100 g sodium acetate; we compute 103.3 g. Maiwa's
  two recipes agree within their deliberate excess. A calculation can be consistently wrong
  and pass any test written from the same source as itself — three outside recipes cannot all
  be wrong the same way. §13dd
- **Two things the comparison established.** The published recipes only agree when their
  sodium acetate is read as the trihydrate, and neither says which — hydration is a field
  here, which is the difference between a recipe and a calculation. And published recipes run
  16–49% above the stoichiometric floor to drive the reaction; what the calculator returns is
  the minimum, and the tolerances are one-sided to say so.
- **Every molar mass recomputed** from IUPAC atomic weights, each formula written out by
  hand. Twelve substances, all within 0.05%.
- **New layer**: `scripts/try-calculators.mjs`. Breaking the 3:1 acetate ratio fails against
  all three published recipes at once, which is what having three of them is for.

---

## 1.0.0-rc36 — 24 August 2026

**Plant Library v1 — done.** Phase 4 merged and the owner's Definition of Done turned into a
layer of the check suite.

- **21 fills and 4 new records.** Twenty of the fills restore a mordant the record's own code
  had been claiming all along: `nomordant` in the code, nothing in the key. Not a new
  assumption — recorded information the key had never carried.
- **Avocado, thyme, oregano and rosemary** each gained a first working combination.
- **`scripts/audit-library.mjs`** runs all ten clauses. It holds the distinction the whole
  thing turns on: an intentional null is a FINISHED field. 54 eco print records do not name a
  fibre because the review never mentioned cloth, and counting those as outstanding is how a
  finished library looks unfinished for ever — and how the 28 real gaps get lost among them.
  §13db
- **The audit's own first version was wrong** in the same way, and failed seven parts for
  having no harvest season. Brazilwood, cutch and henna are bought, `sourcedNotGathered` says
  so, and there is no month to name. „Unknown" and „not applicable" are different states.
- **Lavender and medlar have no combination and will not get one.** For lavender the accounts
  never resolve into one key; for medlar the only historical combination uses bismuth, which
  will not be added to the vocabulary to close a gap. Both keep a full plant profile. The
  audit reads their reasons out of `DOCUMENTATION_DECISIONS_NEEDED.md`, so an exemption
  cannot outlive its explanation.
- **Clause 5 checks four semantic traps**: an iron blanket recorded as an iron mordant, a pH
  modifier in the mordant field, `mixed` used to mean „works on both", and two records
  answering one question. All clear; all seen failing first.

The library is no longer what stands between the application and 1.0.

---

## 1.0.0-rc35 — 24 August 2026

Phase 3 of the library, and the eco print half of the reference finally has something in it.

- **Combinations: 102 → 159.** Fifty-seven new records, forty-seven of them eco print.
- **Eco print records: 8 → 55.** Twenty-four of the twenty-five plants in the owner's eco
  print review are now in the reference, each with what the print looks like, what it gives
  with alum and what it gives with iron. This is the half no book could supply — it comes
  from bundles — and it is the half the application exists for.
- **The review was read by hand, not parsed.** Twenty-five entries is few enough to read,
  and each needed a decision no regular expression makes: which part the source means,
  whether a colour belongs to alum or to no mordant, which sentences describe the PRINT
  rather than the colour. A parser would have produced fifty records and no judgement.
- **No swatch colours.** The review describes colour in words. Turning „наситено златисто
  жълто" into a hex value would be the application inventing a measurement nobody made
  (§13ax), so the swatch does not draw — which is the honest rendering of „nobody measured
  this".
- **„The back of the leaf prints better" was NOT written down.** It has no field — `facing`
  is a dimension of a placement in a trial, not a property of a leaf — and the existing word
  is ambiguous in a way that would invert the advice: `face_down` means the leaf's face
  toward the cloth, so „the back prints" is `face_up`. A rule recorded backwards is worse
  than a rule not recorded, because it would be followed. The print behaviour is in the
  record's notes in the owner's own words. §13 of the decisions file.
- **One of twenty-five skipped**: alder buckthorn prints from a leaf its record does not
  have, and the library holds three buckthorns of which a different one has the leaf.
- 23 fills on existing records; 28 held, all of them the same two model questions raised at
  rc34 — `learnedFrom` is one string, and `notes` is occupied.

---

## 1.0.0-rc34 — 24 August 2026

Phase 2, group 2 of the library merged: the fibre and mordant a recorded result was got on.

- **32 fills across 26 combination records.** Records without a fibre class went from 72 to
  50; records without a mordant from 46 to 36. Thirteen citations registered as sources.
- **`none` is an answer, not a blank.** Ten records carried a code saying `nomordant` and a
  key that had never said so. Writing `none` turns „does not say" into „says: no mordant" —
  the §13ck distinction, now recorded where the engine can read it.
- **The owner corrected five of her own earlier rows before sending**, and one of the
  corrections is the same class of fault as safflower: `none` written against a record whose
  key already said `alum_potassium`. She caught it; the merge would have held it.
- **46 held, and they are two model questions rather than 46 disagreements.**
  `learnedFrom` is one string and a combination accumulates claims from different sources —
  the guide taught the colour, the paper taught the fibre pairing, and there is room for one.
  `notes` is occupied on all 22 rows that carry a sentence, and occupied by two different
  things: real prose on some records, condition labels on others. `influences` is declared
  everywhere and populated nowhere. Three candidate homes, no clear one, so nothing was
  guessed. Both in `DOCUMENTATION_DECISIONS_NEEDED.md`.

---

## 1.0.0-rc33 — 24 August 2026

Three of the sixteen held values decided, and one of them turned out not to be a value at all.

- **Alkanet stays at 60 °C** — no data was offered for a higher ceiling, and a ceiling is the
  field where a wrong claim costs a dye pot.
- **Chestnut keeps `gloves` and gains `dust_mask`.** The workbook replaced one with the other,
  which reads as a swap and is a loss; dried bark ground to powder wants both. The risk level
  stays `caution`: nothing was offered to justify lowering it.
- **Safflower is a model fault, not a disagreement about a number.** Its petals give yellow by
  hot water and red by cold alkaline extraction, and the two routes differ in temperature, pH,
  mordant requirement, chemistry AND `dyeClass` — which is a field on the plant. Safflower is
  adjective one way and substantive the other. The routes are also sequential rather than
  alternative: the yellow must be washed out before the red can be got. No code written; two
  shapes for the fix are in `DOCUMENTATION_DECISIONS_NEEDED.md` §10, awaiting the owner.
- The record still says `cold, 20–25 °C` — the red route only. Incomplete rather than wrong,
  and left alone rather than half-corrected.

---

## 1.0.0-rc32 — 24 August 2026

The first return of the data workbook: plant-level and part-level fields. 130 fills, 16
held, no other change to the application.

- **`dyeClass` went from 6 of 57 to 57 of 57**, and all 118 parts now carry chemistry,
  dosing and temperatures. Fifteen new sources joined the register. §13da
- **Fills only.** A cell that would change a recorded value is held and printed, never
  applied. Sixteen were.
- **A fill can contradict a record too, and „only fill what is empty" did not see it.**
  Safflower's dyeing temperature was empty, so 70–75 °C arrived as a fill and was written —
  while the same record says its extraction is COLD and its red comes from an alkaline
  extraction. Every value legal, every code known, the record no longer agreeing with
  itself. A new deep-check guard asks whether a part restricted to cold extraction carries
  a hot temperature; it found all four at once, in the merge just run. §13da
- **`80–80` is written as `80`** — three were already in the pack. A degenerate span reads
  as a range somebody measured twice.
- **`article` is not a source kind** the application has; the eight papers are `reference`.
  Caught by the existing guard.

---

## 1.0.0-rc31 — 24 August 2026

The two screen defects, on their own. Nothing else is in this release, deliberately: they
are the only thing standing between the code and a green release gate, and a package that
also moved something else would not prove that.

**`check.sh --release` passes all six layers for the first time.**

- **„Виж всички →" reaches the finger target without becoming a button.** It was 23px
  against the 44px rule. The link stays 13px and light and the box around it becomes 44px,
  with a negative block margin giving the height back to the layout — the extra is padding
  for a finger, not space in the design. It keeps its place beside the heading, and drops
  to its own line only where the two cannot share one honestly, driven by whether they fit
  rather than by a breakpoint. §13cz
- **The *use now* tiles no longer overflow, and the obvious fix was not the fix.**
  `min-width:0` on the tile changed nothing: the tracks were already right and the overflow
  was inside. The label was a bare text node in a flex row — an anonymous flex item, whose
  `min-width:auto` no selector can reach — so it could not shrink below its longest word,
  and one Bulgarian compound pushed the whole strip past the viewport. Wrapped in a span it
  can wrap. §13cz
- **The figures are unchanged.** No smaller typeface, no horizontal scroll, no clipped
  value. A long value may take a second line; a figure may not be split across one, so unit
  and number are joined with non-breaking spaces where they are built. §13cz
- **No new guard.** The screen layer found both, fails on both if they return, and is part
  of release policy. A second check asserting the same CSS would be a test written to raise
  a number.

---

## 1.0.0-rc30 — 24 August 2026

Production hardening before a commercial 1.0. Four subjects from the third independent
audit, no new features and no further performance work — the startup is where rc29 left it.

- **A historical repair no longer runs at every start.** Two passes walked every piece of
  cloth on every single opening, for ever, to establish there was nothing left to do. Each
  now records a marker, written only after the pass returns, so a failure is retried rather
  than forgotten. The marker is a control and not a crutch: every pass is still safe to run
  twice, and the guard checks it. §13cw
- **An old backup makes a migration eligible again**, and nothing was built for it: the
  marker lives in `settings`, so a snapshot restore brings back the absence of the marker
  along with the state that needs it. Asserted rather than assumed. §13cw
- **A structural migration no longer restamps records she has not touched.** `putSystem`
  was doing two jobs that look alike — revising a record's content, and reshaping its
  structure — and stamping the second moved a piece last touched two summers ago to the top
  of every list ordered by recency, according to whichever records a migration happened to
  convert. New `putMigration` for structural writes; `putSystem` keeps stamping shipped
  content revisions, which genuinely are changes. §13cv
- **The backup warning said „0 photographs" to everybody.** It counted the `photos` store,
  and nothing has ever written to that store — so the one sentence designed to make a person
  take a backup seriously told her she had nothing to lose. `countUserPhotos()` counts
  images rather than records, across cloth, trials, steps, pigment batches and personal
  plant overrides. A shipped plant photograph is deliberately not counted: it can be laid
  down again from the pack, and overstating a warning is its own kind of lie. §13cx
- **The release gate runs in CI.** `check.sh --release` needs Node packages and a browser,
  and the owner has no terminal — so the check deciding whether a candidate may ship
  depended on somebody remembering to ask for it. A workflow now runs it on push to main,
  on pull requests and on demand, with pinned dependencies in `test/` and the browser named
  rather than hoped for. It does not deploy. It will be red until the two known screen
  defects are fixed, which is the correct order. §13cy
- **New file `migrations.js`** — the passes left app.js, because a migration that can only
  be exercised by starting the whole program is a migration nobody exercises.
- **New layer**: `scripts/try-hardening.mjs`. Every guard was watched failing against rc29 —
  including the photo count, which returned zero for every case.

---

## 1.0.0-rc29 — 24 August 2026

Two corrections closing the rc28 optimisation, from the independent re-review. Nothing
else touched — the two known screen defects are still open and still deferred.

- **A fast start had come to mean „the library is up to date", and it never was.** The boot
  gate kept one version per pack and answered two questions with it: after booting past a
  newer pack, the shipped version was recorded as installed, and the „is there something
  new" notice compared against that same field and said no. So opening the application
  silently retired an update the owner had never been shown — the changed records still the
  old ones, the withdrawn ones still there, everything on screen looking settled. Two
  fields now: `seededVersion`, moved by the boot, and `appliedVersion`, written only by the
  preview. A version becomes applied by being reviewed, never by being booted past. A
  partial apply leaves the pack pending, because the entries she left unticked are exactly
  what the notice exists to keep offering. §13cu
- **Sources could still be deleted while the library credited them.** `refs.js` closed the
  hole for workflow records in rc28 and left the attribution register open. Same fault, and
  for a library meant to be given away it is a licence problem as well as an integrity one.
  §13ct
- **A third source path the review had not listed** — `colours[].source`, on every colour
  swatch of every plant. It is the largest: four of the ten sources are named nowhere else,
  so checking only `glossary.sourceCode` and `recipes.sourceCode` would have left those
  four freely deletable while reporting the register protected. §13ct
- **The checker takes a target key rather than assuming `id`.** A source is credited by its
  code, unprefixed, and always was (§13bt) — migrating those references to ids would be a
  model change with nothing to show for it. Every other entity keeps id matching, and that
  is asserted, because an alternate key that quietly broke it would trade one hole for a
  worse one. §13ct
- **`trials.water.sourceCode` is not a citation** — it holds a `water_source` vocabulary
  code, rain or tap or well. A checker matching on field name would have refused to delete
  a source because somebody wrote down where the water came from. The guard asserts it.
- **New layer**: `scripts/try-pack-lifecycle.mjs`, covering the update lifecycle end to end
  and the source paths. Every guard was watched failing against the rc28 state model.

---

## 1.0.0-rc28 — 24 August 2026

An integrity and weight iteration, from the second independent audit. Three subjects and
nothing else: what a delete may destroy, what a plant record carries, and what a start
reads. **No features, no service-worker change, no `getAll()` rewriting, no UX work** —
the two known screen defects are still open and still deferred.

- **The history can no longer be orphaned by a delete.** Six modules offered a physical
  delete while other records held their ids and nothing checked, so deleting a recipe left
  every trial that used it pointing at nothing and rendering „—" — worst on recipes, whose
  whole versioning exists so a past trial keeps pointing at the version actually used.
  `refs.js` now holds the map of every incoming reference, written out by hand rather than
  discovered, and a referenced record is refused with an honest count: „used in 7 trials
  and 2 group actions". No cascade, no blanking, no `archive` concept invented mid-flight.
  Two paths the audit had not listed turned out to be real — a substance named by a recipe
  or held in a jar, and a trial that wrote actions onto cloth. §13cq
- **The shipped plant photographs left the record.** `seed/plants.json` was 3.97 MB and
  3.49 MB of it was base64 inside the records, so every `all('plants')` in the application
  cloned four megabytes of picture to answer a question about names. They are files now;
  the pack is 486 KB and a plant record is 7.5 KB. §13cr
- **A personal photograph is told from a shipped one by comparison, not inference.**
  `editedByUser` cannot decide it — it is set by saving the record for any reason — so the
  pack records the SHA-256 of the exact string it shipped and the migration compares.
  Anything that does not match is hers and is left alone. With no comparison table
  available nothing is touched, because comparing nothing would be guessing. §13cr
- **A normal start no longer reads the library from the files.** Every boot fetched and
  parsed every pack in full to discover that nothing needed adding. The gate now asks two
  questions — is the version the one installed, and is the set of seeded ids still the set
  that was installed — and skips only when both agree, so a record deleted by hand still
  comes back. Second start, unchanged library: 138 ms and 4 059 KB became 1 ms and 1 KB.
  §13cs
- **New: `keys()`** — `getAllKeys` rather than `getAll`, so a store can be asked about its
  ids without cloning its records.
- **Three new layers**: `try-referential-integrity.mjs`, `try-boot-and-photos.mjs`, and a
  cache guard for the 57 shipped images, checked in both directions. Every new guard was
  watched failing against the restored old behaviour.
- **Two existing guards were reading `photoData`** and failed loudly on the change,
  reporting all 57 plants as credited-with-no-image. That is the right alarm and the wrong
  question; they read `photoOf` now. A guard that names a field which has moved fails here
  rather than passing silently, which is the way round it should be.

---

## 1.0.0-rc27 — 24 August 2026

A reliability patch, from an independent technical audit of rc25, with the two
corrections from her first reading of it folded in (the removal count, and the
language) rather than left for a further candidate. Four faults in one
place — the path a record takes into the database — and the discipline that should
have caught them. **No features, no performance work, no change to start-up, seeding,
the service worker or the module graph**, deliberately: the release changes how every
record is written, and a package that also moved other things would not be testable
against the thing it was made for.

- **`replace` did not replace.** It overwrote what matched, added what was missing and
  removed nothing, so restoring last week's backup returned last week's records and
  kept everything written since, mixed together. A merge with overwriting, offered
  under a label promising a snapshot, to a person who had reached for it because
  something had already gone wrong. It now clears and restores, in **one** IndexedDB
  transaction across every store involved, so `clear → half the records → error`
  cannot leave a person with less than she started with. Validated before anything is
  destroyed; a store the file does not carry is left alone rather than emptied. §13co
- **A restored record kept the time the file gives it.** Every write stamped
  `updatedAt` with the current time, so recovering a record destroyed the only record
  of when the work happened. Three named write paths now: `put` stamps and counts,
  `putSystem` stamps and does not count, `putRaw` does neither. §13co
- **The backup counter counts her work.** It counted every write, including the several
  hundred a first install performs — so a person opening the app for the first time was
  told she had hundreds of unsaved changes before typing anything, against a warning
  threshold of forty. Seeding, pack updates, migrations, repairs and restores are now
  invisible to it. `remove` counts, which it never did: the surest way to have no
  unsaved changes had been to spend the afternoon deleting things. §13co
- **The language belongs to the device.** `settings` is restored as part of the snapshot,
  but `language` is not: restoring a phone's backup onto the laptop leaves the laptop in
  the language it was in. Absence is preserved too — no row means Bulgarian by default, so
  writing one where there was none changes the language just as surely.
  `fabricLabelCounter` stays in the snapshot: it is state, not preference. §13co
- **The removal count is a set difference.** It was first written as the count before minus
  the count after, which is right only when the file is a subset of the database. Current
  `{A,B}` against a backup of `{B,C}` is two before and two after, so it reported nothing
  removed while A had gone. §13co
- **The file's own counter is stale by construction** — `downloadBackup` exports and
  then resets, so the count travelling inside the file predates the export. Harmless
  while `replace` was a merge; a new fault the moment it became a snapshot. After a
  restore the counter is zero and the last-backup date is the file's own. §13co
- **The confirmation described the fault.** „Записите с еднакъв идентификатор ще бъдат
  презаписани" was an accurate account of the broken behaviour. Corrected in both
  languages, with the snapshot restore reporting in its own sentence and naming how
  many newer records went. §13co
- **A run that may skip, and a run that may not.** `check.sh` ended with status 0 after
  skipping three of its six layers for a missing shim, so a candidate could be declared
  checked while its runtime tests had never started — the same fault as §1 of the script
  itself. `sh check.sh --release` now fails where a development run skips.
  `screen-check.mjs` had a second silent skip inside it, for a missing Chromium; that
  is closed too. The gate has a guard of its own, asked in both directions. §13cp
- **Two new layers**: `scripts/try-backup-restore.mjs` (a real export, real work on top
  of it, a real restore, asked in both directions) and `scripts/try-release-gate.sh`.
  Every one of the new guards was watched failing against the restored old behaviour
  before it was accepted.
- **The screen layer had been measuring the wrong screen.** Its route list still said
  `#/sources`, and there has been no module of that name since attribution folded into
  the Library. An unknown id falls back to the dashboard, so the layer rendered the home
  screen and reported its faults under the name of Sources — four of the six failures on
  the first release run were that one line, and the Sources screen had never been
  measured at all. Corrected here, with `#/library` and `#/library/ph` added; it is the
  test pipeline, which is what this release is about. §13cp
- **Two real screen faults remain and are NOT fixed here**: „Виж всички →" at 23px on the
  home screen, and the *use now* tiles overflowing on an opened plant. Neither is
  mechanical — one moves a heading row, the other lets a figure wrap — so both want the
  owner's eye and both are the first work of rc28. Until then `check.sh --release`
  refuses the candidate, and rc27 is a candidate that passes five of six layers and says
  so, rather than one that passes six by not running one. §13cp

---

## 1.0.0-rc13 … rc22 — August 2026

The release-candidate run. In order:

- **rc13** — the glossary edited down from 30 terms to 32 (five out, seven in, eight
  reader-facing groups); membership in the glossary stated on the vocabulary entry
  rather than inferred from having a description; guard 24d fixed, having missed the
  one duplicate it existed to catch because the order number was a decimal; a pack
  update taught to withdraw a record, which no pack had ever needed before. §13cb
- **rc14** — `extractionMode` split into a constraint on the part, a choice on the
  placement and a dimension on the dose. The recipe auto-fill had been handing over
  the decoction figure for an alkaline extraction — a ten-fold error arriving as a
  convenience. §13cc
- **rc15** — the seasonal panel, „Какво можеш да събираш сега". §13cd
- **rc16** — a general description for all 57 plants; gathering months moved to the
  part and completed, 118 of 118. §13ce
- **rc17** — the home screen rebuilt around the work in hand. §13cf
- **rc18** — „Как се държи" had been both a field and a section and appeared twice on
  fourteen records; a negative horizontal margin had been widening the whole page on
  a phone; a card carried an attribute the router does not listen for. §13cg
- **rc19** — home screen second pass: „Тъкани по етап", marks on the stages, quick
  actions reduced to what is done often. A request for colour-coded stages and a green
  panel was refused, and the refusal recorded. §13ch
- **rc20** — Stopka's ratios were confirmed and then **not** written: they are WOA and
  `dosing` is WOF, a factor of ten. „Декокция" corrected to „гореща отвара"; one
  record had been carrying three Bulgarian names. §13ci, §13cj
- **rc21** — the reference engine taught that „does not say" is not „says something
  else". §13ck
- **rc22** — the combination library merged: 28 records over 10 plants became 102 over
  35. Four records had been disappearing between the pack and the database because two
  keys shared a code. §13cl

---

# History

What follows is the record of what was built. It is not a to-do list; where an old section
says something is outstanding, the two lists above are what holds.

Build order matters here: each stage stands on the one before it. Trials come last not because
they are least important — they are the point — but because a trial composes records from every
other module, and building it first would mean building it twice.

---

## Stage 0 — Foundation · **done**

- `index.html` shell, palette, dual-form-factor navigation with real SVG icons
- `db.js` — IndexedDB, all stores from §13, migrations that only add
- `i18n.js` — dictionary, language switching, `{bg, en}` resolution with fallback
- `vocab.js` — controlled vocabularies and band definitions, seeded on first run
- `ui.js` — the shared rendering vocabulary, fixed once for all modules
- `sw.js` + `check.sh` — offline shell and the cache-list guard

## Stage 1 — Fabrics · **done**

- One record is one physical piece, with a generated tag code (`П-001`)
- Composition as fibre/percentage pairs; fibre class and dye-receptive fraction derived live
- Warnings: composition not totalling 100, mixed cellulose–protein, majority synthetic
- Treatment lifecycle as dated events; the box inventory as a filter
- Days since mordanting, because cured cloth reads differently

## Stage 2 — Substances and Stock · **done**

Built as **two** modules, not one. The first attempt made "material" a single record and the
interface was confusing for a structural reason: one record was trying to be both what aluminium
acetate *is* and *which jar is on the shelf*.

- **Substances** — reference knowledge: formula, hydration state, molar mass, standard and maximum
  % WOF, temperature ceiling, handling, disposal, what it is for. Chemistry shown only where a
  substance is a defined compound; a tannin extract is a mixture, not a molecule.
- **Stock** — supplier, date, quantity, remaining, the concentration of *this* bottle.
- A recipe points at a substance, never at a jar, so it does not break when the jar runs out.
- **Base library seeded from `seed/substances.json`** — 26 substances with real chemistry: six
  aluminium salts, iron with its 2% damage ceiling, titanium oxalate with its 70 °C limit, five
  tannins, the sodas and acetates, chalk, lime, cream of tartar, Synthrapol.
- A *Restore base library* button adds only what is missing and can never overwrite her records.

## Stage 3 — Calculators · **done**

Reached early because they are self-contained, immediately useful on their own, and because
the aluminium acetate preparation will prove whether ingredient roles are modelled correctly.

- % WOF calculator
- Recipe scaling to weight of goods, carried into a trial as the step performed
- Aluminium acetate preparation, scaled to fabric weight
- Solution calculator (1% iron in N litres) for blankets and afterbaths
- Bath volume at a chosen liquor ratio
- **Reverse mode** — renamed *Planning a purchase* and moved last: it belongs to stock, not to a
  dye session
- **Exhaust bath** — a rule of thumb, presented as one

Presented one at a time rather than stacked: seven calculators for seven different moments in the
process, listed together, is a wall. The picker reuses the same chip row as the fabric boxes —
with seven modules, one thing looking the same everywhere matters more than each screen being
locally optimal.

The aluminium acetate calculator keeps **no table of its own**. Formulas and molar masses are read
from Substances; a second copy would guarantee the two drift apart.

## Stage 4 — Plants · **done** (library still filling)

The reference library's backbone, and the module the whole app exists for.

Built as **a few structured fields plus free sections**: structured where the reference needs to be
queried — chemistry classes and levels, dosing per part and per condition, extraction and dyeing
temperatures, water ratio, drying ratio, fastness, harvest months, compositional role — and
book-like sections for everything that is prose. Ten fixed textareas per plant would have made
entry a chore.

Also: a colour range with swatches and conditions; a reference photograph, resized on the way in;
fastness as a visible scale rather than a dropdown; the eight profile headings offered as a nudge,
never as a schema.

**Seeded with 41 Bulgarian dye plants** generated from the owner's own guide — the plants table for
all of them, the full eight-section profiles for the seven garden plants, and dosing, temperatures
and recipes for the fourteen that have recipes in sections III and IV.

Seven anthocyanin plants are marked as fugitive with an explanation. A reference earns its keep by
saying *this one does not work, and here is why* as much as by saying what does.

**Pack sync with a preview** (§10) is implemented here: added, changed and edited records shown in
groups with checkboxes, the ones she has edited unticked by default, nothing written until she says
so, and personal fields — photographs, hand-filled doses — never touched by an update.

### Library coverage

Four workbooks of research later, the library held **48 plants**; it now holds **57** — the Bulgarian table, the seven
garden profiles, and the standard trade dyes an eco printer meets anywhere: dyer's chamomile,
Persian berries, brazilwood, cutch, chestnut, henna, eucalyptus, avocado.

Eight purely anthocyanin plants were removed rather than kept as warnings. The library is for
knowledge worth having, not a catalogue of everything green.

| Field | Covered |
|---|---|
| Role, parts, chemistry classes | 46–48 |
| Lightfastness | 51 |
| Washfastness, English names, family, availability | 47–48 |
| Dyeing temperature, soft ceiling | 44–45 |
| Toxicity, sources | 40–41 |
| Dosing (by part) | 29 |
| Compositional role | 33 |
| Chemistry *levels* | 12 |
| Substantive/adjective | 6 |
| Drying ratio, harvest months, years to maturity, colour range, preferred leaf surface, photos | 0 |

**The six at zero will not come from reading.** A drying ratio needs a scale — weigh fresh, dry,
weigh again. A preferred leaf surface needs one leaf placed both ways in one bundle. They are empty
because no source can supply them honestly.

**The real gap is eco print.** Twenty-five plants are marked for it and *none* records which leaf
surface prints better; eighteen have a compositional role marked *needs testing*. Here the reference
still does not answer the question it exists for.

**And a number worth stating plainly:** of some 280 marked claims, none is from literature and none
from an own trial. The whole library is a compilation — useful, unverified. Ten real bundles,
recorded, would turn more amber dots to indigo than another workbook would.

### Earlier snapshot, of 41 plants:

| Field | Covered |
|---|---|
| Latin name, parts, chemistry classes | 39–41 |
| Lightfastness | 28 |
| Recipe text | 14 |
| Dosing % WOF, dyeing temperature | 12 |
| Washfastness, availability | 7 |
| Extraction temperature | 6 |
| Water ratio | 1 |
| English names, family, chemistry *levels*, drying ratio, harvest months, colour range, compositional role, substantive/adjective | 0 |

The empty columns are not oversights — the guide does not contain them, and inventing them would
be worse than leaving them blank. Filling them is a research task in its own right, best done
plant by plant against several sources, and it improves the guide as much as the app.

Most complete today: birch, coreopsis, St John's wort, apple, weld, rosemary, tagetes.
Emptiest: safflower, cornelian cherry, medlar, plum, buckthorn, willow, tomato, nettle.

## Stage 5 — Recipes · **done**

Built ahead of Plants, because plants need content as much as code and that is separate work.

- Ingredients are **roles** filled by substances, with interchangeable alternatives: one "tannin"
  line holding gallnut 8–10%, myrobalan 20%, cutch 20%. The picker sits next to the number it
  changes, not in the definition above.
- **Quantities are ranges**, because sources give ranges — 8–10% tannin, 12–15% alum on wool.
- `basisRefersTo` shown only for aluminium and sodium sources, where the ambiguity is real.
- **Conditional ingredients** — cream of tartar with wool, dropped entirely for cotton.
- **Two durations**: held while heated, and steeped after the heat goes off. Often the second is
  what makes the result.
- Required follow-on recipes, surfaced with the scaled quantities rather than as advice.
- Live scaling with ceiling warnings read from the substances.
- Versioning by `lineageId`, source attribution, `distributable`.

**Chains are built** (§5.3) — scour → tannin → mordant scaled together from one weight, and
selectable as a trial step. Two of them exist in the studio database; none ships in the seed,
which is Part A1.

## Stage 5a — Backup · **done** (brought forward from Stage 9)

Brought forward deliberately: data entered now is worth protecting now.

- Export of everything entered, as a dated JSON file
- Import in two modes — *add only what is missing* (cannot harm) and *replace from file*
- Days since the last backup and edits since then, shown plainly
- `navigator.storage.persist()` requested, so the browser will not evict the database
- A clear warning that **nothing persists in a private window** — the lesson learned the hard way

## Stage 6 — Techniques · **done**

Twenty seeded techniques across five categories: four shibori, three resists, three bundling
methods including the barrier layer, three printing methods, and six post-treatments. Each carries
not just a description but the trap: why an iron afterbath is weak and short, why wax fails in a
hot bath, why soaping now is better than soaping on someone's garment.

Fresh-leaf indigo is here rather than among the recipes, because it is not a reduction vat and
saying so plainly saves a wasted harvest.

## Stage 7 — Combinations · **done** (trial links pending)

The reference engine, living inside the Reference module with two tabs: *Search* and *Records*.

**Partial matching is the whole point.** Fill in any subset — plant, part, fibre, mordant, process,
medium — and empty fields widen rather than narrow. Results rank by how many criteria agree; exact
matches carry a badge, partial ones name what differs. Seeing "the same but with iron" beside the
exact answer is usually more useful than the exact answer alone.

**Seeded with 31 combinations transferred by hand** from the owner's guide: oak in five variants,
birch in four, madder's four shades, plus smoke bush, walnut, St John's wort, yarrow, tagetes,
indigo and sumac. Transferred by hand deliberately — an automated pass over the guide's arrow
notation produced nonsense, and a reference holding nonsense is worse than one holding nothing.

**Still to build:** the link to trials. A combination should show the owner's own placements
beneath the expected outcome, with divergence visible. That waits on Stage 8.

## Stage 7a — PWA and versioning · **done**

- Icons drawn in the app palette — a printed leaf in madder on unbleached linen, in plain and
  maskable variants
- `manifest.json` complete, so the app installs to a phone home screen or a desktop dock
- `version.js` as the single place a release number is written; shown in the sidebar

## Stage 8 — Trials · **done** (reverse link pending)

The largest screen, built last because it composes records from every other module.

- **Gallery first** — a photo grid filterable by plant and process, with a list view for when the
  question is chronological rather than visual
- **Placements lead the form**, and each opens with its photograph. The real order of work is:
  open the bundle, photograph it, then say what it was
- Placement fields follow the process: leaf surface, print quality and local treatment appear for
  eco print and vanish for immersion dyeing
- **Steps carry both durations** — held at temperature, and resting after the heat goes off — and
  a structured medium modification that records *where* the vinegar went
- Bundle layers with roles, the barrier among them
- A step without a recipe is allowed; improvised ones are the interesting ones
- Each placement resolves to a reference record at save time and says so, or says there is none

**Still to build:** the reverse view — a combination showing the owner's own placements beneath the
expected outcome, with divergence visible. The data is there; only the view is missing.

## Stage 9 — Read modes and studio use · **done**

After the first sessions of real work, three audits — two from other models, one from the owner —
agreed on the same diagnosis: the interface had become a screen-by-screen translation of the data
model. Everything opened as a form, which made *administering the record* look like the main thing
one does with it.

The correction was structural rather than cosmetic. Four modes were being run together and are now
separated: **finding an answer**, **following a procedure**, **recording what happened**, and
**editing library knowledge**.

- **Read mode on five modules** — plants, recipes, fabrics, trials, combinations. A record opens
  for reading; the form is behind an *Edit* button, and Back from the editor returns to reading the
  same record rather than to the list.
- **Plants lead with a "To use now" card**: which part, how much, how hot, what the ceiling is —
  the answers wanted standing in front of the bed, not fifty controls.
- **Recipes have a working view**: one column, quantities in large figures beside the step that
  uses them, readable from a metre away over a scale.
- **Fabrics read as a biography** — composition, then a dated timeline of every state change, then
  the trials the piece went through.
- **Combinations show the owner's own placements** beneath the expected outcome, with photographs.
  This closes the promise made in the very first conversation: general knowledge on top, personal
  experience beneath, divergence visible. Search results carry the count too.
- **Trials lead with the result** — photograph, assessment, whether it is worth repeating — because
  that is why one opens a finished trial. Secondary sections fold away, their summaries showing
  what is inside so collapsing is not hiding.

Smaller things from the same audits: a timer, a running-low signal on stock, plants as recipe
ingredients, chains selectable as a trial step, writing a recipe from within a trial without losing
the trial, "would I do this again" separate from "did it succeed", and vocabulary renamed from the
theory to the action — *blanket soaked in dye* rather than *adjective carrier blanket*.

## Stage 10 — The story of a piece · **complete (0.68.0)**

All five steps are done, across 0.63.0 to 0.68.0. The stage began as a note in
a feedback document — that the interface still followed the data model rather
than the way an artist works — and ends with a record that runs from an
intention to a finished piece without asking for anything twice.

What was learned along the way is in §13e and §13f: three silent faults, one of
which had been recording plant fastness wrongly for as long as the segmented
control existed, and a deep render harness that opens records instead of
stopping at the list.

The largest remaining piece of work, and the one that came out of real use rather than out of the
model. Specified in §8.0a–d; the reasoning is there and is not repeated here.

Order of work, because the parts depend on one another:

1. ~~**Trial status**~~ — **done**. `planned → in_progress → complete` and `intent` on the header.
   Records written before it existed read as complete and are never written back to; a trial with
   a verdict but no status is *offered* completion on save, never given it silently.
2. ~~**Stages**~~ — **done in 0.66.0**. Six named stages, of which four hold steps; raw cloth and
   finished are read from the fabric and from the trial's status rather than entered again. A stage
   may recur, so steps group into consecutive runs and the progress line is generated from what
   happened. Four new step types for decoration, and a technique on the decoration step. §8.0b.
3. ~~**Photographs on steps**~~ — **done in 0.65.0**. A strip on every step, offered and never
   required, plus `planPhotos` on the trial for a diagram attached whole. The middle of the process
   now has somewhere to live; the fabric's story no longer has a hole between the placement and the
   result. Step photographs are stored at 800px, plan diagrams at the result size so writing on them
   stays readable.
4. ~~**One chronological photo strip**~~ — **done in 0.67.0**. Five sources gathered into one
   sequence on the fabric record, sorted by date and then by rank within the day. §8.0c.
5. ~~**The cloth as the entry point**~~ — **done in 0.68.0**. One button that continues unfinished
   work or starts new, decided by the cloth; the handoff travels in the address. §8.0c.

Two smaller ones ride along because they are cheap and were asked for in the same round:

- ~~**Favourites** on plants, recipes and combinations~~ — **done**. Star in the list, star on the
  record, and a filter chip that appears only once there is something to filter.
- ~~**The label number reserved on save**~~ — **done**. The form shows the code it will get.

Deliberately *not* built: planned-versus-actual figures. Agreed and recorded in §8.0a — one figure
per field, corrected in place.

## Library additions

- **Rose and hazel** — added in 0.70.0, plants pack 0.2.0. §13h.
- Gaps the owner notices go here as they come up. Adding a plant is cheap; what
  is not cheap is discovering mid-way that a part code or a role does not exist,
  so §13h lists the three that were missing this time.

## From the owner's review of the prototype

Recorded here so they are not lost between stages. Numbering follows her notes.

- ~~**3.1 colour swatches in the plant list**~~ — **done in 0.69.0**. §13g.
- **3.4 icons on the calculators** — not built. The calculator picker is nine
  text buttons; the app has real SVG icons in the navigation but `tools.js` uses
  none. Wants a scale, a drop, a thermometer, a clock drawn in the palette —
  more drawing than code.
- **3.2 a photograph on a recipe** — deferred by the owner: not missed now,
  worth having if the app is released publicly.
- **3.5 swatch library and inspiration** — left open; the owner is not sure it
  is needed.
- **Reverse colour lookup** — now the obvious next step, since the swatches are
  in the list: ask for a colour range and get the plants that reach it.

## The plant profile · **done (0.71.0)**

Specified in §13i, built without a schema change and without touching the edit
form. The fault it carried — the detail reading colours from `p.colours` while
the list derived them from combinations too, so opening a plant lost what the
list had just shown — is fixed: both now read one function, and in the detail
each swatch carries the part, fibre, mordant and process it was reached by.

The list went from eight columns to five. Availability became a filter rather
than a standing column; chemistry moved into the detail; the botanical name
became a subline; the swatches roughly doubled.

The detail is one vertical column of six blocks. The part that was not in the
plan: the blocks fill themselves from the **section headings**, because the
structured fields they were specified against are largely empty — `facing`,
`harvestMonths` and toxicity level on all fifty plants — while the prose that
carries the same knowledge uses recurring headings. A display-time lookup routes
83 sections into *how it is used* and 34 into *gathering*; an unknown heading
falls to *more* and so cannot be lost. Three departures from the specified
layout, all recorded in §13i, the last of which was only visible once three real
profiles were rendered side by side.

Also fixed on the way: `deep-check.mjs` slept a flat 30 ms after a click and had
begun failing two runs in twenty as soon as the plant list grew. It now waits on
a condition. §13e.3 — a check that fails at random is worse than no check.

## Navigation · **done (0.72.0)**

Specified in §11a. The sidebar is two halves and a rule: the reference part, the
diary, and the housekeeping that belongs to neither. The module under *Diary* is
*My work*, the rename held back from Stage 11 and arriving here because the
sidebar was what was being edited. The backup left the calculator picker and got
its own address. The phone bar was inverted — it had carried the reference, which
is read at the desk, while the diary sat behind "more" on the one device the work
is recorded on.

`check-boot.mjs` now checks that every module is reachable from the sidebar.
There are more entries than modules, so a count proves nothing.

Stock stays beside Substances rather than moving to the diary, because that is
where it is going. §11b.

## Interface, third pass · **done (0.74.0 – 0.79.0)**

Step 3 of the agreed order, from the prototype, from ChatGPT's review and from
the owner's own three feedback documents.

**Safety** became a level plus coded precautions across all forty-eight plants,
replacing a sentence of prose per plant. §13.2a.

**The library shrank to forty-eight and got tidier.** Tomato leaves out. Rosemary
was recorded twice — `Rosmarinus officinalis` and `Salvia rosmarinus`, one plant
under the name it had before 2017 and the name it has now, from two sources; no
duplicate check catches that, because the botanical names genuinely differ. Two
dead fields dropped: `liquorRatio`, recorded on one plant of fifty and a property
of the bath rather than the plant, and `facing` on the plant part, empty on all
eighty-two and already meaningful on the placement, where it says how this leaf
was laid this time.

**Harvest months filled** for forty-four, from several sources, for the Bulgarian
climate — the window for the *dye-bearing part*, which is not always the showy
season. Four are deliberately empty: brazilwood, cutch, henna and avocado are not
gathered in a garden. All at `confidence: literature`.

**Fixes:** the batch had two mechanisms and the form offered both; the recipe
ingredient's own dropdown had 150px on an eight-column row; saving showed no
confirmation, which the owner read as "Save does not return to the list, even
though it saves"; "Delete trial" became "Delete this record"; Packs left the
sidebar, declared in `HIDDEN_MODULES` so the reachability check stays a real
guard; the calculators were reordered by how often they are reached for.

**Search** in plants, recipes, techniques and the plant picker. §13j.
**Marks** across the three filter dimensions and the calculators. §13k.

Four silent faults found on the way, all in §13e: a vocabulary that only ever
loaded into an empty store — which the owner saw as English text in the Bulgarian
version — two handlers assigned to one property, a check placed after
`process.exit()`, and a missing icon rendering as a hole rather than an error.

`check.sh` now has five layers. Three of them were added this pass, and each one
exists because something got through.

## The reference library · **complete (0.82.0)**

Forty-eight plants with no gaps against the agreed floor. The owner reviewed every
record in a workbook; what follows is what changed and what was learned.

**What she did:** filled dye qualities on all forty-eight — thirteen of them with
*different text per part and condition*, since sage gives ochre dried and pale
lemon fresh; filled dosing on every part; named the eight parts that arrived from
the second source with no code; retired sixteen odd headings by moving their text
into named columns.

**What was compiled:** harvest months for forty-four (four are bought, not
gathered); chemistry for thirty-two parts; the constituent text for twenty-one
plants, written *after* the chemistry so the prose and the structured field cannot
contradict each other; and 132 colours drafted from her own guide text.

**Corrections found on the way.** Rosemary was two records, one plant under the
name it had before 2017 and the name it has now. Brazilwood's dye was recorded as
a quinone — brazilin is a neoflavonoid. Apple's part was `fruit` where she doses
the peel: a renamed part, not a second one. The vocabulary had no anthraquinone
class at all, which is the chemistry of madder, buckthorn and henna — three of the
four plants marked at heightened care, marked for exactly that reason.

**A merge that would have deleted twenty-one texts.** The workbook was exported
before the constituent texts were written, and the loader rebuilt sections from
the sheet. Keeping everything would have undone her editing; keeping nothing would
have deleted work merged in between. Resolved with a snapshot from the moment of
export: present at export and absent now means she removed it, absent at export
and present now means it was added since. The same shape as §13e.5.

**Not resolved.** Fourteen short texts were dropped by her sheet, four of which
are protective: which buckthorn is which, both ways; madder above 75 °C; which
fibres henna holds on. Offered back for approval, not restored unilaterally.

## Open, after the prototype pass (0.88.6)

Ordered by weight rather than by when they arrived.

**Contradicts the specification, or loses data**
- ~~**Sources are never seeded.**~~ — **fixed in 0.88.7** (§13ab). Two faults, not
  one: the boot list was written by hand and omitted the pack, and the pack
  itself carried `id` where `seedPack` expects `code`, which would have defeated
  the already-seeded check and rewritten all four sources over the owner's edits
  at every launch. The boot list now derives from `PACKS`; the pack is
  normalised; a guard counts every declared pack into the database.

**Blocks work already agreed**
- ~~**Seven modules have no `open()`**~~ — **done in 0.88.9** (§13ad). Six
  converted; `packs` is out of the 1.0 plan and has no records to address. Found
  on the way: `#/reference/records` had been resolving to the search screen, and
  a save had become a departure as far as the unsaved-work guard was concerned.
- ~~**Two renders of one module can be in flight at once**~~ — **fixed in
  0.89.3** (§13ah). A generation and a chain in the router. Worth reading the
  section: the guard fails only when both halves are removed, because
  `parseRoute()` is read at draw time and accidentally covers for either one
  alone.

**Content, waiting on the owner**
- **Forty *Beritba i obrabotka* texts** — the workbook is with her.
- **The list of sources** — four are seeded; she will give the rest.
- **Combinations**: thirty-one cover ten plants, so the swatches of the other
  thirty-eight are empty.
- **Seed recipes**: the studio has seven recipes and two chains in its own
  database; the shipped seed has none. A corrected backup exists.

## From real use, August 2026

The owner's own working notes, after using the application for real work. Taken one at
a time, each discussed before it is built.

- ~~**A finished piece of work left the cloth unfinished.**~~ — **fixed in 0.89.7**
  (§13al) and again in **0.89.9** (§13an). Four faults over two versions, one shape: the
  state chooser defaulted to changing nothing; `readWork()` emptied `fabricIds` on a
  screen with no cloth checkboxes; the status chips reached `complete` without passing
  the five questions; and the card offering to settle the contradiction was a button that
  started new work instead. **One screen owns finishing, and every route leads to it** —
  that is the rule the four of them were each a local exception to. The damage those
  faults already did to stored records is now visible rather than silent (§13ao): work
  that points at no cloth says so, on the card, with the way to attach one.
- **Group work that then divides.** Five pieces scoured and mordanted together, after
  which one goes to eco print, one to a madder bath, and three are dyed together with
  tagetes and shibori. So a bulk action is not a property of the bath — it is **a shared
  stretch of history across several pieces that then branches**. `fabricIds` already lets
  one trial span pieces; there is no way to divide. Open question underneath it: whether
  preparation is a trial at all, or something before one.
- ~~**Working again on a finished piece.**~~ — **done in 0.89.8** (§13am). One card per
  piece with the runs inside; the new work starts from the last photograph of the old and
  carries the ground it stands on, recorded automatically. Found on the way: the cloth's
  own photograph was dated by when its *record* was created, so a piece entered after the
  work was done showed the blank cloth as its most recent picture.
- **Discharge printing** — see below (B2).

- ~~**A dye bath had nowhere to record its colour.**~~ — **done in 0.90.1** (§13ap). A bath
  result is a placement without a position; no second carrier for colour.
- ~~**No way to write a recipe from the step that needs it.**~~ — **done in 0.90.2**
  (§13aq). Found underneath it: `returnTo` was never read, and `flash` was never imported
  in `recipes.js`, so **every save of a recipe had been throwing** — the record written,
  the screen frozen, nothing reported. `check-scope.js` now catches a call to a shared
  helper that was not imported.
- ~~**A dyestuff belongs to a step, not to a process.**~~ — **done in 0.90.3** (§13ar).
  One list carrying `stepId`, not a list per step. The reasoning that settled it: §13ap keyed the
  dyestuff block on the trial's process, which is right for a trial that is only a bath
  and wrong for the ordinary case the owner actually has: an eco print whose steps include
  a dye bath. The bath step then has no dyestuff of its own unless a recipe names one.
  a trial with two baths, tagetes and then madder, cannot say which was in which pot.

- ~~**Photographs of plants have no attribution.**~~ — **done in 0.91.0** (§13at). 40 of 48
  plants carry a photograph with author, licence and source, shown under the picture.
  **Eight are held back:** six with no author recorded (one of them CC BY-SA), sumac —
  NoDerivatives, must be added by hand and uncropped — and coreopsis, whose file did not
  arrive. Rerun `scripts/import-plant-photos.py` when the names and the files are there.
  48 seeded plants, with author, licence and source in a spreadsheet. A plant carries
  `photoData` and nothing else. CC BY-SA requires the author to be named, and this
  application is meant for public distribution — so the three fields must exist and be
  shown before any of those photographs is imported. Waiting on the image files themselves.

- ~~**Four from a morning's use**~~ — **done in 0.90.4** (§13as): a plan photograph that
  could not be removed (a `<label>` was swallowing the press, in ten places), a life strip
  that appeared to end at its fifth photograph, a finished result that could not be
  corrected, and a cloth whose new name did not reach the diary.

- ~~**The day a piece was finished was not recorded**~~ — **done in 0.91.1** (§13au).
  A work had only its own date; the date offered on screen 4 belonged to the cloth's
  state event, so the diary dated finished work by the day it was typed in. `finishedOn`
  now exists and is what finished work is shown and ordered by. Two faults underneath:
  the state date always opened at today, and finishing again **stamped the cloth a second
  time** — three pieces in the live diary claimed to be finished twice. Repaired at boot,
  keeping the earlier stamp and recovering the lost dates onto the work.

- ~~**Stock was a ledger only ever written to**~~ — **done in 0.92.0** (§11b). Substances is now
  **Materials**, opens for reading with its jars on it, and carries the shelf state as a chip and a
  filter. Stock left the navigation; its old addresses redirect into the jar. Found on the way: an
  address to a deleted record threw in six modules, and **Fabrics has no `open()` at all** — its open
  record lives in a variable, which is the hidden state channel §13q forbids. Still open: the jar's
  concentration reaching the alum acetate calculator.

- ~~**Two pieces wearing one number · the bottle not reaching the calculator · Fabrics without an
  address**~~ — **done in 0.93.0** (§13av). Both П-04s were typed by hand and never checked against
  the shelf; the alum acetate calculator now offers the bottles she owns and takes their strength;
  and Fabrics has `open()` at last, so a piece can be reloaded, bookmarked and sent. The existing
  duplicate is reported rather than renamed — the tag is on paper in the studio.

- ~~**The plant audit**~~ — **merged in 0.94.0** (§13aw). Eight photograph authors, two
  taxonomic corrections, fifteen plants gained a part, `heartwood` added to the vocabulary, and
  the accumulator role now explains itself. Held back: tannin levels (they belong in
  `parts[].chemistry`), the boilerplate tannin sentence, the prose temperatures, and four part
  removals. **Open:** whether the eleven plants marked `mordant_accumulator` were marked for
  aluminium or for tannins — to check against the owner's guide and Boutrup & Ellis.
- **Still needed for the eight credited photographs**: the image files themselves, and a re-run of
  `scripts/import-plant-photos.py`.

- ~~**Growth form and habitat · nine new plants · the second audit pass**~~ — **done in 0.95.0**
  (§13ay). `availability` removed as personal; `plantType` and `habitat` added as facts; six
  sections on all 57 plants; 49 of 57 carry a photograph.
- **Next, and now unavoidable**: temperature belongs to the **part**, not the plant, and „unknown"
  and „approximate" must become sayable. Until then the audit's temperature column cannot be merged.
- **Waiting on the owner**: which sumac (the photograph is *R. typhina*, the record *R. coriaria*);
  the twenty compound growth forms, where `subshrub` is likely truer for five; seven more photograph
  files; English throughout.

- ~~**Temperature on the part · „no temperature" as distinct from „unknown"**~~ — **done in
  0.96.0** (§13az). The audit's temperature column is merged, 57 of 57 plants carry a photograph,
  five plants moved to `subshrub`, and the sumac is resolved with a real *R. coriaria* image.
- ~~**Tannin levels into `parts[].chemistry`**~~ — **done in 0.96.1** (§13ba), with a new
  subtype-free `tannin` class so the level can be recorded without inventing which kind.
- ~~**Dosing and fastness for the nine new plants · names capitalised · the phone headline**~~ —
  **done in 0.96.2** (§13bb).
- ~~**English for the library**~~ — **done in 0.97.0** (§13bc). 342 of 342 sections, in nine batch
  files kept in `seed/en/` so the owner's corrections survive every later import. To be read by her
  before distribution: it is a translation, not her second voice.
- **Still open**: their colours (**not** derivable here — a hex from a sentence is a guess wearing the
  costume of a measurement); group work that branches; discharge printing.

## Measured against the course material

The owner's course guide from Chandra Rice, read against what is built.

**Already modelled, and closely:** the seven enhancements, named after the action rather
than the chemistry. The bundle roles — printing cloth, receiving cloth, carrier blanket,
barrier. The physical steps of the standard bundle method: laying on a base, arranging
the plants, laying the blanket, bundling, steaming, rinsing. pH modifiers as the seventh
enhancement.

**Missing entirely: discharge printing** — a leaf that *removes* colour from a pre-dyed
ground. The hard part is not the effect but the shape of the knowledge: discharge
behaviour belongs to **a pair**, a specific plant against a specific dye. A leaf that
strips logwood cleanly may do nothing to madder. That is a third kind of record, neither
a plant fact nor a combination as currently keyed. The guide also insists on a
distinction the community blurs — **true discharge** (the dye bond is broken, a pale
shape) against **a pH shift** (the dye is still there and has changed colour). Neither is
expressible today.

**Missing: madder above 60 °C.** The guide notes that heat itself discharges madder, so
steaming onto a madder ground always shifts it. `softMaxTempC` is the field for this;
whether it is filled for madder needs checking.

**Missing: how the bundle was built** — a second cloth on top, rolled onto a dowel, how
tightly tied. The roles exist; the construction does not. Already deferred.

**Available and not yet used:** the guide's reference list, fifteen sources, which is
what the Sources module has been waiting for.

## Still open from the third pass

- ~~**Stock folding into Substances**~~ — **done in 0.92.0** (§11b). The module is Materials
  and opens for reading with its jars on it.
- **Two photo fields**, reported by the owner and not reproducible: every module
  has one file input except trials, which has three for three different things.
  Waiting on which screen.
- **Pigment extraction and watercolour** — the recipe model is "percent of the
  weight of goods", and a pigment has no cloth. A separate conversation.
- **Unknown and approximate as legitimate values** — ~~"about"~~ **done in
  0.89.4** (§13ai): a mark beside the confidence on the six numbers in a plant
  and on a step's temperature, which also softens the ceiling warning from a
  verdict to a caution. **Unknown and not applicable are deliberately not
  built** — the reasoning, and a middle path worth considering first, are in
  §16.00.
- Five deferred additions from the review: the plant's role in the composition,
  bundle construction, two levels of assessment, series of related trials, and
  the result after drying and washing.

## The agreed order of work (superseded)

Settled with the owner after 0.71.1 and kept for the record. **The two lists at the top of
this document replace it.** What remains live from it is point 4, the phone's diary screens,
which is now B3.

1. ~~**Navigation**~~ — done in 0.72.0.
2. **Stage 11** — the five screens of *My work*.
3. ~~**The rest of the interface**~~ — largely done in 0.74.0–0.79.0; stock
   folding into Substances (§11b) is what remains.
3b. ~~**The prototype pass**~~ — done in 0.88.0–0.88.6. An outside prototype was
   compared screen by screen, fourteen pairs of screenshots, and the differences
   reduced to six rules (§13s) rather than ten separate redesigns. Reference
   (§13t), Home (§13u), Recipes (§13v), Techniques (§13w), Backup (§13x), My
   work (§13y), icons (§13z).

4. **The phone** — *next*. Screens that render badly and parts that cannot be
   reached. Deliberately after 3, because fixing the narrow layout before the
   other interface changes means fixing it twice.

   **The whole application, not the diary.** An earlier version of this entry
   scoped the stage to the diary, on the grounds that the reference is read at a
   desk. The owner rejected that, and §13o had already contradicted it: two of
   the three faults the sixth layer found on its first run were in the reference
   half, and the `overflow-x:auto` applied then was named a stopgap for stacked
   rows in this stage. Every address is in scope. §13aa.

   Known so far, from the owner: the home screen has not been reworked for a
   narrow viewport, and the trial form and read view need horizontal scrolling.
   The "More" sheet is fine.

   The order, from §13aa: ~~the sixth layer first, widened to every address and
   with a 44 px touch target as a phone failure~~ (done, §13aa); ~~then the
   controls sized for a finger~~ (done, §13ac); ~~then §13q~~ (done in
   0.88.9, §13ad — six modules converted; `packs` has no records to address);
   ~~then one shared stacked-row pattern for the eight `table.grid` lists~~ (done
   in 0.89.0, §13ae); ~~then home, calculators and backup~~ (done in 0.89.1,
   §13af — and the calculators turned out not to be calculating at all). **The
   diary screens are held back at the owner's request:** the work there is not
   only about the phone, and will be taken as its own conversation. Four points
   from real use were taken out of it and fixed in 0.89.2 (§13ag): the cover
   photograph, the trial's photo strip, finishing from the list, and placements
   collapsing to one line. What remains for that conversation is the larger one —
   the active trial reads as a form to fill in where it should read as a story to
   follow.

   Worth stating before it starts: **the diary's faults are the ones that only a
   real phone finds.** `deep-check.mjs` renders in jsdom, which has no camera, no
   gallery and no narrow viewport — it could not have caught the `capture` fault
   and will not catch the next one of that kind. `screen-check.mjs` catches
   geometry and nothing else. This stage needs a pass on a real phone after each
   step, or something invented to replace it.

Running alongside, not a stage: **filling the reference**. Recipes and plant
profiles both need content. The plant colour swatches are the case worth naming —
the mechanism shipped in 0.69.0 and is right, but 31 combinations cover ten
plants, so forty of fifty show nothing. **That gap closes by writing
combinations, not by filling `colours` on plants**, which is the same work as
making the reference engine useful rather than polish beside it.

Literature can supply prose, dose ranges and temperatures with a citation and
`confidence: 'literature'`. It cannot supply a hex: sources disagree, and one
book's "brown" is another's "ochre". A swatch wants her own dyeing, or a source
that shows the sample. §13h refused to invent them and that holds.

**Packs are out of the 1.0 plan.** The owner has no clear picture of what she
wants to import, and an import module built without one gets rewritten.

## Stage 11 — The working flow · **done (0.73.0)**

Specified in §8.0e; five screens, one column, every screen with its own address.
`editing` is gone — which screen a record gets is decided by the record plus the
address, so the back button, a reload and a bookmark finally agree with what is
on the screen.

**Fixed on the way in, in 0.71.1:** adding a photograph to a plan, a step or a
placement opened the camera and offered nothing else. `capture="environment"` does
not prefer the camera — it removes the gallery and the file system, so an
already-taken photograph could not be attached at all. Guarded in `check.sh`. §8.5.

What the build changed against the specification and the prototype:

- **The progress line is generated from the runs that exist**, not drawn as five
  fixed stops. The prototype's own screens showed why: it claimed decoration was
  reached on work that had none.
- **One field added** — `resultHex` on the placement. The only route by which her
  own dyeing feeds the plant swatches, which until now filled from literature.
- **Ready sequences insert expanded** and left the per-step dropdown. Two
  mechanisms for one thing is confusing and would let a step become a sequence.
- **Composition is fibre plus percent**, not prose: the fibre class and the mixed
  cellulose–protein warning are derived from the structured form.
- **The palette is ours.** The prototype was green throughout — active states,
  primary buttons, the "success" chip. A success chip is madder now: the interface
  must not put a colour opinion beside a photograph of dyed cloth.

Two faults found and fixed while building, both in §13e: a form reader that
rebuilt its arrays from the screen and would have deleted every collapsed step on
save, and missing `Event` globals that made the harness fail on working code.

Two long-standing faults disappeared with the rewrite rather than being fixed: the
list table had five headers over six cells, and the form carried an empty panel.
`panel()` now returns nothing for empty content, so that class cannot recur.

## Stage 12 — Packs · *parked, not deferred*

Removed from the 1.0 plan by the owner: no clear picture yet of what an import
should actually bring in, and a module built without one gets rewritten. The
reference fills faster by hand in the meantime.

Import with merge preview is done (§10, used by substances, plants, techniques and combinations).
What remains is **export**: writing a user-authored pack of records marked `distributable`, so
knowledge can be shared without sharing private work.

That is the last module. After it the app is complete as specified, which is what 1.0 means here.

---

## Still outstanding, by weight

Accepted from the audits and not yet built:

~~**Protecting unsaved work.**~~ — **done in 0.64.0**. One guard over the whole application rather
than a rule each module follows; §13f. It covers the sidebar, Back, opening another record, the
browser's back button and closing the tab, and stays silent on filters and tabs.

~~**Ceiling warnings inside a trial.**~~ — **done in 0.89.3** (§13ah). `trialStepWarnings()` beside
the recipe one, checking the step's temperature, its scaled recipe, and the medium modification —
that last only when its amount is written as a plain percentage, because reading "8 г" as eight per
cent would raise warnings against numbers nobody wrote. The mark shows on the shut step, since the
step being worked is usually the one that is closed.

**Stock visible on the substance.** The split between what a substance *is* and which jar is on the
shelf is right, but the substance record shows only a thin list, so "do I have it, and how much"
still goes unanswered.

~~**Reverse search**~~ — **done in 0.89.3** (§13ah). One form, not a second screen: colour is another
criterion that narrows, and when it is given the conditions become the answer rather than the
question. Distance is measured in Lab (`calc/colour.js`), because on the sRGB channels two shades of
weld come out further apart than iron is from indigo. The results are a table rather than cards
(0.89.5, §13aj): backwards one is scanning for the record to open, not reading matches.

**Bulk actions.** Twenty pieces go into one alum bath; opening twenty records to record it is how
people stop recording.

**Four small ones:** repeat a trial as a variant, a photograph's context (wet or dry, before or
after washing, daylight or lamp), a follow-up observation after the first wash and after a season,
and a thumbnail strip on trial photographs. The last two are now partly absorbed into Stage 10.

**Not needed for now:** a produced pigment as tracked stock — batch and quantity. Recipe type 6
(pigment making) covers writing the procedure down, which is what is actually wanted; tracking how
many grams remain is not.

**Considered and deferred:** extraction as its own reusable object — one extraction serves several
baths and several trials, and recording it as a step loses that. The strongest idea in the last
round of feedback, and worth a proper design rather than a quick field.

## Parallel workstream — the seed library

Not a stage, because it does not wait for the code. This is the long pole: the application is
weeks of work, a reference library of hundreds of entries is months. If it does not start
early, the result is a finished app with an empty heart.

Order of compilation:
1. Vocabularies and band definitions (done; **band numbers still provisional** — they decide which
   results merge into one reference record and want checking before trials accumulate)
2. Mordants and tannins with real chemical identity (done — `seed/substances.json`)
3. Standard recipes — scour, tannin, mordant, aluminium acetate (in progress, entered by hand)
4. Plants — 41 seeded from the guide; structure complete, many fields still empty (see Stage 4)
5. **Gap-filling research** — the columns at zero above, plant by plant, against several sources.
   The output improves the printed guide as much as the app, so the two can be written together
6. Combinations, drawn from the plant × mordant tables in the source guides

Every entry: written in the app's own words, source credited, `distributable` set deliberately.

---

## Open decisions

1. **Does season belong in the combination key?** Autumn oak is loaded with tannin and prints
   boldly; spring oak is thin and soft. Excluded, the reference merges two different results
   and reports an unhelpfully wide variation. Included, combinations roughly double and each
   fills more slowly. Provisional: an optional dimension, set when it is known to matter for
   that plant.
2. **Band numbers are provisional.** The values in `vocab.js` are a first guess and need
   checking against practice before combinations start accumulating — they decide which results
   merge into one reference record.
3. **The aluminium acetate stoichiometry has not been checked against an independent source.**
   It is written out openly in `calc/alum-acetate.js` for exactly that purpose. Compare against
   Chandra Rice's calculator before trusting it with a large batch.

## Deliberately not doing

- Colour measurement from photographs — unreliable without calibration
- Orders, pricing, client records
- Multi-user accounts and cloud sync
- Automated matching against Pantone or NCS
