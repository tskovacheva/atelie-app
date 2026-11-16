# Roadmap

**What remains.** History was moved to `CHANGELOG.md` in the 1.0.0-rc23 documentation
audit; completed items are not repeated here. For the reasoning behind any decision,
`FUNCTIONAL_SPEC.md` is the source of truth.

## Editorial redesign — merged into 1.0.0-rc99, branch closed

- **Package 1 — done (1.1.0-design.1, §14a):** palette roles, local Geist and Source
  Serif 4, the two-row bar and the phone drawer, controls, fields, dialogs.
- **Package 2 — done (1.1.0-design.2, §14b):** the reference modules in the prototype's
  composition; the kicker; glossary as a definition list; calculators as cards.
- **Package 3 — done (1.1.0-design.3, §14c):** the diary — My work, Fabrics, preparation,
  group actions, the work form, the result and the history.
- **Package 4 — done (1.1.0-design.4, §14d):** the pigments' surfaces, the screens without
  a mockup, the edge states, Home, and the phone — including the work card's progress
  strip, which had squeezed the card's name to nothing at 320px.
- **Package 5 — done (1.1.0-design.5, §14e):** the approved composition applied on real
  data — the trial detail, the plant, the Reference's result cards, the work list, and the
  technique's read-before-edit flow.
- **Merged.** rc99 is rc98 plus the five packages; `design/editorial-redesign` is closed and
  main is the only line again. The `1.1.0-design.*` numbers were package identifiers.
- **rc100:** the preparation baths, madder and the aluminium acetate workflow are seeded, and
  chains are a pack. Open from it: the source for the six preparation recipes is the studio's
  own guide and wants the owner's confirmation; a chain still cannot choose its first step by
  fibre.
- **rc105:** the pigment batch simplified to a journal entry (§13fg) — the pigments' own model,
  which the design packages never covered, is done for 1.0.
- **rc144:** a plan's line names its pieces (their stage and the works that used them shown, the piece lists the plan) and carries free-text details (§13gt). Next: „Start a work from this line". Open: cutting one piece into two records (her 3S/6S halves) — the split of §13bd is for batches only.
- **rc143:** preparing a working solution is not a treatment of the cloth — `recipe_output: solution`, the aluminium acetate preparation marked; M reads every mordant since the last wash, „AA + CaCO₃" on label, sheet, summary and trail (§13gs). Open: her own recipes cannot be marked yet — the recipe form does not offer `output`.
- **rc142:** a finishing dated before the work's date or its pieces' preparation is caught on saving and offered a move (bath by bath) or a manual correction; the mark's date follows the finishing; the piece's record says so; one reading of „finished" (§13gr). Found on П-023.
- **rc141:** a sheet of studio labels on A4 — 21 of 63.5 × 38.1 mm, filled for the pieces ticked in Fabrics (in tag order, or one page per stage for coloured paper) or blank to write by hand (§13gq).
- **rc140:** the automatic archive — a folder chosen once, two files written in turn, held rather than written when her records fall unexplained; to be tried on the owner's Samsung (staging first) for whether the permission survives a restart (§13gp).
- **rc139:** persistent storage asked at every start and shown on Home when refused; a database that vanished is reported and offered a restore; a database that will not open writes nothing (§13go). After the production data loss of 16 October 2026.
- **rc138:** a screen opens at its top; going back up returns to the place in the list (§13gn).
- **rc137:** the phone's Back in the installed app goes up and asks before leaving; the licence screen drops a stale activation message; the device label carries the time; the print check presses the button itself; Chandra Rice's Library entry in the owner's words (§13gm). Next, a separate version: the Library's shorthand notes rewritten and the missing authors of nine papers, each checked against the paper.
- **rc136:** the licence screen's reason covers every case Polar answers "not found" for (§13gl).
- **rc135:** a piece of work is called by its cloth on every screen; a rename takes back copies of the old name; welcome line counts the sources (§13gk).
- **rc134:** the licence — activation screen, Licence in the menu under Backup, silent weekly check that never locks on failure, Pages Function for /api/license; Git-connected Pages (§13gj).
- **rc133:** the installed app starts on Cloudflare — shell cached as ./, redirected responses never served; hosting is Workers + Static Assets (§13gi).
- **rc132:** recipe cards on a phone keep long values inside the card (§13gh).
- **rc131:** merge keeps the newer version of her records — a plan's source and picture no longer lost to an older copy (§13gg).
- **rc130:** legacy finished pieces show the stage their work proves; neutral studio label, one Print (§13gf).
- **rc129:** Studio Process Summary v1 — derived, never stored (§13ge). v1.1 candidate: keep a recipe's chosen alternative.
- **rc128:** kept sappanwood record shows its photograph again — repointed by hash; plant-photos table checked against the release (§13gd).
- **rc127:** Studio System v1 — stage colours, working label, process trail, code dictionary (§13gc).
- **rc126:** Bagra in English; Plans v1.1 (read view, source, one picture); pigment colour in the list (§13gb).
- **rc125:** production readiness — `_headers` in the artifact (revalidate everything, CSP), update matrix under production headers, try-production.mjs, runbook (§13ga). Open: §42.
- **rc124:** sumac photograph restored — CC BY-SA 3.0, cropped and credited as such; 57 photographs (§13fz).
- **rc123:** photograph licences — CC alternatives for the two GFDL, sumac withdrawn, deed link and „resized" on every credit (§13fy).
- **rc122:** Commercial content package 3 — release artifact `dist/` from an allowlist; Library provenance notes neutral; asset licences registered and gated (§13fx). Open: §41.
- **rc121:** no activation while any window holds unsaved work; manifest `id` pinned (§13fv); deep-check's waiting made deterministic (§13fw).
- **rc120:** Production Update & Release Safety package 2 — the release is one cache, no mixed pages; update matrix U1–U7 in the gate; rollback rule (§13fu). Open: §40.
- **rc119:** Commercial Data Safety package 1 — the merge-migration P0 fixed; round-trip test onto a clean install; older-backup restore in the release gate (§13ft). Open: §39.
- **rc118:** the commercial recipe library — 16 recipes, studio-credited; 7 handed to the owner (§13fs).
- **rc117:**- **rc117:** pH colours, the chalk bath's wording, reliability order (§13fr).
- **rc116:**- **rc116:** the AA working solution reworded; Nicoleta's Al/Fe impregnation added (§13fq). Open: recipe `usedFor` / `standardised` (item 37).
- **rc115:**- **rc115:** Reference shows linked observations; Records search and sort (§13fp). Later, perhaps: link an observation to a record from Reference.
- **rc114:**- **rc114:** a change of box saves only itself; „unwashed" is not a change (§13fo).
- **rc113:**- **rc113:** one washing rule for a piece and a group (§13fn).
- **rc112:**- **rc112:** group washing without a recipe; nothing moved back to washed (§13fm).
- **rc111:**- **rc111:** eco-print bundle bottom to top, blanket preparation, relative leaf side, whole sprig, heat labels, two bug fixes (§13fl).
- **rc110:**- **rc110:** a plan's tick saves itself; Plans vs Trials and backup direction written down (§13fk).
- **rc109:** Plans v1- **rc109:** Plans v1 (§13fj) — intent before work, a checklist per plan. Next, when wanted: a line → a trial.
- **rc108:** English on a first opening; the backup check sees references that no longer resolve
  (§13fi). The owner's backup has one — a finished action naming a trial that is gone — reported,
  not repaired.
- **rc107:** the release gate passes again (§13fh). It had been red since rc100 at the latest
  for four reasons unrelated to the application (`DOCUMENTATION_DECISIONS_NEEDED.md` item 33).
- **Still open, for the main line:** the packs screen is still the stub it was; „undefined" sources on an empty home
  screen (found in package 1, left for main).
- **Decided:** the phone's bottom bar stays gone (owner, package 2).
- **For the main line, not this branch:** „undefined" sources on an empty home screen.

Three lists, kept apart on purpose:

- **A — required before a paid v1.0.** Only what actually remains. Mostly not features:
  completeness of the shipped data, attribution, translation, units, legal and safety
  text, and where the data lives.
- **B — after v1.0.** Sensible, and not blocking a release.
- **C — deliberately not planned.** Kept only where recording the decision stops it being
  proposed again.

An item moves from B to A by decision, never by drift. Anything listed here is
outstanding unless a line says otherwise.

---

# Part A — required before a paid v1.0

## A1. The library — **DONE at rc36**

Plant Library v1 meets every clause of the Definition of Done, and
`scripts/audit-library.mjs` runs it as a layer of the check suite so it stays met (§13db).

```
plants with a full basic profile      57/57
plants with at least one combination   55/57   (lavender and medlar documented)
combination records                    163     (55 eco print)
intentional nulls                       54     eco print records with no fibre named
unresolved gaps                         28     immersion records with no fibre named
sources registered                      45
invalid codes                            0
```

**Post-v1, continuous enrichment** — none of it foundation: the compositional role for the
remaining 24 plants, `printingSide`, a bibliography per row, a swatch for every literature
combination, more combinations per plant.

## A2. Sources and attribution

- ~~**The register is thin.**~~ **57 sources are seeded** (it said ten). Recipes and
  substances carry a list of codes that resolve in the register, checked by the audit —
  settled at rc59, §13ea.
- **Traceability of a claim.** When a buyer reads *lightfastness 4/5* it must be visible
  whether that came from literature, from a compilation, from the owner's own trial, or is
  unverified. The confidence model exists per field; what is missing is that every
  significant claim reaches a named source with title, author, year and page.
- ~~**Does attribution move onto the record?**~~ **Settled at rc59 (§13ea):** the record
  carries a LIST of source codes — recipes and substances as combinations already did — and
  the register stays the one place a source is described. What is deliberately NOT modelled
  is which source came first: „Garcia's, as Kelly gives it" is a relationship between
  sources, not a field, and it lives in the recipe's own words.
- **rc80 (§13eu): source, version used and authorship are kept apart.** A code in
  `sourceCodes` means the library drew on that source; a formula's author is named only where
  established, and a relationship between sources („Kelly states she adapted Garcia") is written
  in the recipe's words. All fourteen recipes done at rc81.
- **Still open under this heading:** every significant claim reaching a named source with
  page. The plant library's own figures are the gap — a bibliography per row is post-1.0
  enrichment (A1, clause 8).
- **Photographs are settled** — 57 of 57 carry author, licence and source, and the import
  script refuses one without an author. This is the standard the rest should meet.

## A3. Language and terminology

- **The English of the plant library is a translation, not a second voice.** 342 sections,
  made by the developer and kept in `seed/en/` so corrections survive later imports. **The
  owner reads it before anything is distributed.**
- **One name per thing, in both languages.** Found in use: one record carried three
  Bulgarian names („Нова работа", „Тест", „Ново изпитание"), settled on „опит" in rc20.
  Others reported and not yet looked at: „Справочна част", „Моята работа", and vocabulary
  labels written as codes first and translated afterwards.
  - **„Екстракт" was rejected deliberately.** The root already carries three jobs —
    `recipe_output: extract` is „извлек", the glossary term is „Извличане / екстракция",
    and one method is „алкална екстракция". A fourth sense would empty the word.
  - The English needs an editorial pass **as a second original**, not a synchronisation
    phrase by phrase. §13cb did this for the glossary; nothing else has had it.
- Personal notes are never translated.

## A4. Units — **DONE at rc37**

Built, having been moved out of the blocking set at rc25 so the decision could be taken
deliberately rather than inherited from a list — and then taken.

- **Metric / imperial, stored canonically** in grams, millilitres, degrees Celsius and
  grams per square metre, rendered per preference (§13dc). Two switches beside the two
  language switches, not a preferences system.
- **The choice belongs to the device**, like the language, and survives a snapshot restore.
- **A ratio never converts** — percent WOF, liquor ratio, solution strength — and the code
  says so through named functions rather than by staying silent.
- The round trip closes at every magnitude from one gram to twelve kilograms, which it did
  not at first: a fixed two decimal places turned 1 g into „0.04 oz" and back into 1.13 g.

## A5. Where the data lives

The one item that is a decision rather than work.

- **Today: local only.** IndexedDB is the source of truth; no account, no server. This is
  the strongest position the product has — *no account, no cloud, your studio data stays on
  your device* — and it removes authentication, password recovery, cloud bills, account
  deletion, sync conflicts and much of GDPR at a stroke.
- **The two problems it leaves**, to be solved without a cloud if possible:
  1. **Data loss.** Clearing site data wipes everything; a private window stores nothing.
     Backup exists and reports how stale it is. Consider making a backup a condition of an
     update.
  2. **Two devices.** Work is recorded on the phone in the studio and read on the laptop.
     Today that is a JSON file carried by hand — honest, and tedious.
- **The decision:** whether 1.0 ships local-only with file transfer, or whether an optional
  sync is worth becoming a data controller for. **Recommended: local-only for 1.0**, sync
  considered only if buyers ask. Sync should not be a prerequisite for selling anything.

### What happened on 16 October 2026, and what it reopens

Production lost a day of the owner's work on her phone (98 % full): the site's storage was evicted
and the app opened as a first install. rc139 (§13go) asks for persistent storage at every start and
reports a vanished database instead of hiding it. **Neither is the durable answer.** Persistence does
nothing against a person clearing the browser, a reinstall, a lost phone or a fault; detection
recovers nothing. The owner's position: an application people pay for must not depend on them
remembering a backup. Open, to be decided as its own piece of work:

- **An automatic copy outside the browser.** File System Access (one file, rewritten, two
  alternating files so an interrupted write cannot take the only copy; never overwritten with fewer
  of her records without asking). Works on desktop Chrome and Edge; on Android Chrome since 132,
  untested here — writes are not atomic and whether the permission survives a restart is unknown;
  absent on iPhone and in Firefox.
- **An encrypted copy on our server, tied to the licence.** Encrypted in the browser, one direction,
  no sync and no conflicts, restorable on any device with the key and a passphrase. The only option
  that covers every browser. Costs: „no cloud" becomes „optional, encrypted"; privacy texts; storage
  (photographs are stored as base64 in the database); a lost passphrase is an unreadable copy.
- **The decision:** whether the second is a condition of selling 1.0. Recommended: yes.

**Decided, 16 October 2026:** the automatic archive first — the first option, built in rc140 (§13gp),
as a folder with two files in turn. Still open:
- **Google Drive as a destination.** It appears in Android's folder picker. A write there with no
  connection is untested: it may fail, or Drive may hold it and upload later. The local folder works
  offline and stays the primary; Drive would be a second copy, and the way to carry a backup from the
  laptop to the phone. Its own piece of work, after the Samsung trial of rc140.
- **The encrypted server copy** — still the only answer for iPhone and Firefox, and for a lost phone.

### What happened on 10 September 2026, and what it settles

The owner's employer's proxy classified `tskovacheva.github.io` as **Newly Seen Domains** and
blocked it. Глина would not open from the work laptop. Багра, on `bagra-ten.vercel.app`, kept
working — a different origin, not yet caught by the same filter.

The block lifted by itself on the 11th and everything was found intact. What it cost was a
day, and what it proved is not what the list above assumes.

**The two problems in this section are the wrong two.** They are about losing data and about
carrying it between devices. Neither happened. The data sat whole on the disk the entire
time — 10.7 MB, counted and seen — and could not be reached.

**Availability, not integrity.** The owner put it plainly and the point is hers: data that
exists and cannot be reached is not available, and a record you cannot open when you need it
is no better than one you do not have. Everything else — the features, the interface, the
library — rests on the application opening when it is wanted.

**What this does NOT settle.** It is not an argument for a cloud. A server behind the same
proxy fails the same way and takes the application AND the data with it; at least a local
copy can be carried to another machine. The choice is not local versus cloud. It is whether
a second copy exists **by design rather than by remembering**.

**A third problem, found the same day and worse than either.** Chrome's storage listing
showed Багра on **three origins**: `tskovacheva.github.io`, `bagra-ten.vercel.app`, and two
Vercel preview addresses. Each origin is its own database. The github.io one held 23 fabrics,
6 trials, 2 chains, 14 recipes and 4 batch actions — real work, invisible from the other.
Nothing warned her. A link opened from history on a preview URL is an afternoon of records
written into a database nobody will look in again. **This has nothing to do with the proxy
and was there all along.**

### What A5 becomes

Four items. The first three are the work; the fourth is the decision that no longer needs
taking.

1. **A backup that does not depend on remembering.** Not a stronger warning — a file that
   leaves the browser profile on its own, after N changes or once a day. Google Drive is
   already permitted on the work laptop and already connected; falling back to Downloads when
   it is not reachable. This breaks „no runtime dependencies", which is a fixed decision, and
   that is the trade to be argued rather than assumed.
2. **The backup file must be usable WITHOUT the application.** If Багра cannot open, a file
   only Багра can read leaves you exactly where you started. Plain JSON with legible names
   and a short header saying what it is and how to put it back. *Stated as a requirement by
   the owner, and it is the right one.*
3. **One declared origin.** The application knows which address it is meant to be served
   from and says so, loudly, when it is opened from another. Silent divergence across three
   databases is the fault that cost most and was noticed least.
4. **Restore must merge, not overwrite.** Today a restore replaces. With records on a phone
   and on a laptop, that makes combining them impossible and makes restoring dangerous. This
   is independent of everything above and is wanted regardless of what is decided about
   copies.

**Audited at rc119 (§13ft).** Backup covers every store of hers, replace is an atomic snapshot,
merge now repairs what it brings in, and both are tested onto a clean installation. What is
left of A5 for 1.0 is in DOCUMENTATION_DECISIONS_NEEDED §39: when persistent storage is asked
and what the screen promises, and a manual Safari check of the download.

Not decided here: whether any of the four ships before 1.0. Item 4 is the cheapest and the
most clearly correct; item 1 is the largest and touches a fixed decision.

## A6. Release hygiene

None of this is a feature; all of it is a condition of taking money.

- ~~**About and version · Help or a short onboarding · Terms · Privacy · Licence · a safety
  and chemical-handling disclaimer · a way to report a bug.**~~ **Written at rc66** (§13eg).
  The licence ships as a draft and the report address is not set; both are in A7.
- **Migration tests as a release blocker.** Before each release: a backup from the previous
  version, update, open, verify. The expensive bug is not a crooked button — it is eighty
  trials and six hundred photographs gone after an update. **Partly done at rc26**: the
  restore path itself is now covered by `scripts/try-backup-restore.mjs`, which runs a real
  export, real work on top of it and a real restore, in both directions (§13co). What is
  still missing is the other half — a backup written by an OLDER version, opened by this
  one.
- **Referential integrity — done at rc28.** A record the history points at can no longer be
  deleted (§13cq). What is NOT done, and is now a decision rather than a task: whether cloth
  gets a *retired* state, and whether reference entities get archiving at all. Both are in
  `DOCUMENTATION_DECISIONS_NEEDED.md`.
- **Attribution is protected like the rest of the history — done at rc29.** A source that
  glossary terms, recipes or colour swatches credit cannot be deleted (§13ct). Four of the
  ten sources are named only by colour swatches, which the review had not listed.
- **A release run can be made by a machine — done at rc30.** `check.sh --release` runs on
  push to main, on pull requests and on demand (§13cy). It does not deploy; a gate and a
  deployment are separate decisions. The two screen defects that kept it red were fixed at
  rc31, and the gate has passed at every release since.
- **Numerical tests on the calculators — DONE at rc37.** The aluminium acetate
  stoichiometry is verified against three independently published recipes, and every molar
  mass recomputed from atomic weights (§13dd). `scripts/try-calculators.mjs` runs it.

- **Release process:** `main` plus short-lived branches, release tags, semantic versioning.
  Never release from the working copy — development, then a candidate the owner uses for a
  while, then production.
- **The documents ship inside the release ZIP**, at the same version as the code.
- **The screen check runs, and the code passes it — done at rc31.** It needed
  `puppeteer-core`, which was never installed, so every layout decision from rc13 to rc25
  was verified by reading rather than by rendering and `check.sh` left with status 0
  regardless. The release gate (§13cp) closed that; the first release run turned up six
  failures present in rc25 byte for byte, four of them one stale route in the harness. The
  remaining two — the finger target on „Виж всички →" and the overflowing *use now* tiles —
  were corrected in rc31 (§13cz). **`sh check.sh --release` now passes all six layers.**
- **A release run is now a different run.** `sh check.sh --release` fails where a
  development run skips a layer for a missing dependency. The invariant: a candidate cannot
  be called checked if a layer of its release policy never started. §13cp
- **README and ROADMAP are read before each release.** README claimed 48 plants and a Stock
  module long after both had changed. Audited at rc23; the habit is the point.

## A7. What is left before 1.0 — the whole list, 14 September 2026

Written after an audit of all five documents against the code, because „what is left" was
spread across A2, A3, A6 and the decisions file and could not be read in one place.

**Nothing may be added to this list without saying so.** It is the release's scope.

1. ~~**A6's texts.**~~ **WRITTEN at rc66** (§13eg), at `#/about` in four tabs. Two things are
   still the owner's:
   - **the licence**, which ships marked as a draft and is hers to accept, change or replace;
   - **the address a fault is reported to**, which is not set — `CONTACT` in
     `modules/about.js` is empty and the screen says so rather than inventing one.
   Both, and the English of all seven texts, fall under her reading (item 3).
2. **The other half of the migration tests** — a backup written by an OLDER version, opened by
   this one. The restore path itself was covered at rc26.
   **Built after rc66; the files ship in rc67, NOT yet wired into `check.sh`.** The §19 fix waits for
   a version of the language package, by the owner's decision.
   `scripts/try-restore-older.mjs` and three fixtures in `test/older-backups/` (rc6, rc45,
   rc56). Each fixture was written by that version's own code: checked out of git, its own
   deep-check run, its own `exportAll()`. rc45 and rc56 pass whole. **rc6 found one fault** —
   see DOCUMENTATION_DECISIONS_NEEDED §19. What remains, in order:
   - the fix for §19 (`website` read as `site` when drawn, the record left as it is);
   - the harness wired into `check.sh --release` — NOT before the fix, because a release
     layer that fails on a known fault teaches people to walk past it;
   - a line in the specification (§11.4) and in CHANGELOG;
   - **known limit, say it in the release notes:** the three fixtures are thin on work —
     3 cloths, 6 trials, no cloth actions, no batches, no photographs, no pigment batches.
     They prove the old FORMAT is read; they do not prove a large studio database is. A rich
     fixture means driving an old version's screens, and is separate work.
3. **The owner's reading of the English.** 342 plant sections, the recipes and the vocabulary
   labels: a translation by the developer, not a second authorial voice, and marked for her
   review before anything is distributed (A3). **This has not started**, and it is the one
   item on this list nobody but the owner can do.
4. **The recipe pack, reviewed as a whole.** Fourteen recipes now (it said sixteen). The owner
   decides which ship in 1.0 and which are hers alone — `distributable` is the field and it has
   never been gone through record by record.
   **rc80 (§13eu):** the audit's stage 3 went through eight of them — Cliffe's three pastes and
   Kelly's five — for provenance and wording. **rc81 (§13ev):** the remaining six likewise; all
   fourteen are through stage 3. Five still carry no `distributable` value — a proposal for each
   is in DECISIONS §29a, waiting on the owner. **rc82 (§13ew):** the five are laid out for her in
   `docs/attribution/rc82-five-for-approval.md`; the field turned out to control nothing that ships,
   and a release check is proposed (DECISIONS §30a).
5. ~~**The pH scale, drawn rather than listed.**~~ **DONE at rc65** (§13ef): one bar from 1 to
   14, with the band names kept as a legend under it.
6. **A last read of README and ROADMAP**, which is the habit A6 already names.
7. **ADDED 16 September 2026, by the owner: the language and terminology package.** Five steps,
   each its own release, none started before the previous one is accepted:
   1. ~~guards~~ **DONE at rc67** (§13eh) — two ratchets with 641 file findings and 531 lines of
      Bulgarian on the English screen listed by name; 1.0 needs both lists empty (`--strict`);
   2. ~~the interface dictionary and the vocabulary~~ **DONE at rc68** (§13ei) — terminology,
      the ten duplicate keys, the audit's English edits checked against their screens, the
      botanical names; the source names wait on a structure decision (DECISIONS §20);
      **corrected at rc69** (§13ej): „закрепител" replaces „мордант" in the Bulgarian interface,
      and 204 places in reference prose join steps 3 to 5, which now also cover the prose of
      substances, techniques and sources;
   3. ~~English for the plants (296 fields)~~ **DONE at rc70** (§13ek) — filled, the existing English
      reviewed, „мордант" out of the plant prose, doubtful claims in `docs/language/science-audit-flags.md`;
   **Intermittent deep-check failure seen at rc70** (§13ek, last paragraph): `readWork` with a null
   `draft` after the harness's `reset` in the pH match test, once in five runs. Not fixed; investigate
   before 1.0 together with the `stages` flake from rc66. **A third, seen at rc82:** `strip` — „a twice-printed
   piece shows 0 shots" — once in five runs, with nothing in the release touching photographs.
   4. ~~English for the combinations (307)~~ **DONE at rc71** (§13el) — the 121 notes classified and
      acted on, English filled, „мордант" out; 6 lines of Bulgarian left on the English screen, all §20;
   5. ~~the language of the recipes~~ **DONE at rc72** (§13em) — and substances, techniques, sources;
      source names bilingual; both language lists empty and strict on release. **The package is complete
      pending the independent check and the owner's editorial read of the English (item 3).**
   An independent check of the implementation and an editorial read of the English follow the
   whole package. This does not close item 3: the English stays a translation by the developer
   until the owner has read it.

Deliberately NOT in 1.0, and each recorded where it belongs: cloud sync (A5, Part C), pack
export (B5), a vocabulary editor (B6c), an update button for Sources and the Glossary (B6d),
the visual pass and global search (B7), and the open model questions (B4).

**Open with the owner, from the paste work (§13ed):** a paste covers only part of the cloth
and the combination key does not know it. „Cotton, alum, paste" reads the same as a fully
mordanted piece. Three ways out — leave it to the work's own words, split the process in two,
or give the combination a coverage field. It blocks nothing in the diary; it matters when the
reference half is taken up.

---

# Part B — after v1.0

## B1. Re-working a finished piece — **built, and this entry was wrong**

Checked against the code at rc25 and corrected. `trials.workAgain` — „Работи пак върху това
парче" — is on the finished card, the picker excludes cloth that is already busy, and the
record shows the earlier runs on the same piece with dates. It shipped in 0.99.2 and §13bj
records both faults found on the way: a handoff that asked to discard work it had just
saved, and a button that made a rival record every time it was pressed.

This entry claimed the diary had no way to say a second trial happened to a finished piece.
It has had one for six versions. **The roadmap was being written from the specification
rather than from the code**, which is exactly what the rc23 audit was supposed to stop.

What is genuinely still open is smaller and worth keeping:

- **The second trial does not point at the first.** The earlier runs are found by looking
  up the cloth, not by a link on the trial. That is the no-reverse-links rule working as
  intended, and it is fine — but it means a trial read on its own does not know it was a
  re-working.
- **There is no word for it on the trial.** A re-working and a first dyeing look identical
  in the diary list.

## B2. Discharge printing

A third kind of record, keyed by plant × dyestuff, distinguishing true discharge — the dye
destroyed — from a pH shift that only moves the colour. The two look alike on cloth and are
not the same thing. Heat alone discharges madder above 60 °C, so steaming onto a madder
ground always shifts it; `softMaxTempC` is the field, and whether it is filled for madder
wants checking.

**The glossary term went with it in rc13** (§13cb): „Изтегляне" was a definition for a
practice no screen can record, which is a promise the application does not keep. It returns
with the method, under a title that says what it is — **„Печат чрез отнемане на цвят"**.
The rc12 text is in git history and already drew the distinction this section asks for.

## B3. The phone, and the diary screens

An active trial reads as a form and should read as a story. Wants walking through on a real
phone rather than in jsdom, which has no camera and no narrow viewport. Two such walks have
already found faults no check caught.

## B4. Model questions still open

- **Can a piece be finished without a trial?** Tannin as a final colour is the case.
- **Does the season belong in the combination key?**
- **Should the chemistry vocabulary include technologically important non-pigments?**
  Oxalates in rhubarb leaf are the case. §13bu
- **Does the extraction method belong in the combination key?** Deferred in rc14 on the
  same grounds as dye strength: the key widens when there is something to fill it with. Two
  groups are already set aside because of this. §13cc, §13cl
- **Does `dosing` need a base — WOF or WOA?** Stopka's chart is WOA and the doses are WOF, a
  factor of ten. Either the field gains a base and both sit honestly side by side, or the
  chart belongs only to the pigment module, where the base *is* the alum. The second reads
  as the truer one. §13ci
- **A term met on another screen should reach its glossary entry.** The more valuable half
  of the Library, and it touches every screen. §13bt

## B5. Packs — export

Installing a pack works. Making one does not: no export, no versioned publication, no way
for the owner to ship a library update to someone who has bought the application. Parked
rather than deferred — needed the moment a second person owns a copy.

## B6. Home screen and navigation tidying — **the tiles are done (rc25)**

The „Източници" tile was a button that did nothing: `data-go="sources"` with no module of
that id, the register having moved into the Library (§13bt). The „Наличности" tile pointed
at a hidden module — the old Stock address kept alive so saved links resolve (§11b). Both
are gone and the Library takes their place, which is where a person pressing either was
trying to arrive.

**Two more of the same shape, found at rc46 and fixed (§13dm).** „Направи архив" in the
attention block carried `data-go="tools"` and landed on the calculators; the backup has its
own address and the button did not use it. „Инсталирай пакетите" on a first launch had a
worse target — there has never been a packs screen in the calculators at all — and now goes
to Plants. Neither was a rendering fault: both buttons drew correctly and arrived at a real
wrong screen, which no layer that asks whether a screen is real can see.

**„Инструменти" versus „Калкулатори" is settled (§13dm).** One destination had three words
across four places, because `nav.tools` and `nav.calculators` were both live and
`t('nav.' + id)` is built at run time, so layer 3b could not see the duplication. One key
now, saying „Калкулатори" everywhere. This was the terminology pass reaching one word;
the rest of A3 stands.

What remains here is the wider question, and it belongs with the terminology pass (A3): the
screen still speaks the shape the model had two versions ago, in more places than these.

## B6a. Requested at rc46, after 1.0

Four items, none of which loses knowledge by waiting.

- **A pH scale that is a scale.** The Library's pH tab draws five rows, each a small square
  beside a range. It is a list wearing the words of a table. The colours are fixed in
  `PH_BANDS` and are **ours, from the palette** — deliberately not the colours a test strip
  prints, which belong to whoever printed it, and deliberately not the colours a dye turns,
  which belong to the plant. Any prototype for this must keep those nine values; they are
  the one place the interface is allowed to be coloured and they are argued (§13bt).
- **Sorting the columns in Fabrics.** Eight columns, fixed on last-changed. The sort has to
  survive the tick boxes for a group action (§13bd) — selecting five pieces and then
  re-sorting must not silently change which five are selected.
- **Cleaning the combination notes.** Twenty-two condition labels — „с железни соли",
  „кора, алуминиев мордант" — landed in the prose field from an old import. The text is
  correct; it is in the wrong field.
- **The eco print block on the plant screen.** Waits on the `printingSide` decision
  (`DOCUMENTATION_DECISIONS_NEEDED.md`, item 13).

## B6b. The pigment module, finished — agreed at rc46, after A6

The model is written out in full in `DOCUMENTATION_DECISIONS_NEEDED.md` item 17 and is
agreed. It is not built. In rough order of dependency:

- ~~**Two substance categories**~~ — **DONE at rc47.** `binder` and `filler`, chalk moved out
  of `auxiliary` into `filler`, slaked lime into `modifier`. The six new substances are NOT
  done and are deliberately not in that release: a substance record carries hazard, handling
  and purpose, and writing those is making claims that need a source. They start as a
  workbook, the way the plants did.
- ~~**Two ingredient roles**~~ — **DONE at rc47.** `plasticiser` and `carrier`.
- ~~**A basis of per cent of the carrier's weight**~~ — **DONE at rc48.** The lake recipe
  computes: 10 g of alum, 5 g of soda, madder root at 500% of the carrier. Only madder of
  Stopka's three figures — logwood is not in the library and „жълтениче" is ambiguous
  between two species. The remaining figures wait on a workbook.
- **A fourth scale mode, by output** — attempted at rc49 and **deferred, blocked on data**.
  It needs a recipe to declare what it yields and none of the three does; Stopka's „roughly
  20 pans" is for her recipe, not the one shipped. One workbook line unblocks it: how much
  the owner's binder makes, in her own measure. The scaling defect it was meant to fix was
  fixed without it — the gum is now the amount the recipe is measured against.

  The assertion expected to fail here did not, and that is recorded as a fifth way for a
  guard to lie (§13dp): at 42 g both models agree, so it had never tested what it named.
- ~~**The batch holds the lines actually used**~~ — **DONE at rc51.** Lines resolve to
  amounts, carry what the recipe said on the day, and report four departures. A line left
  out is struck rather than deleted.
- ~~**Swatches on the batch become a list**~~ — **DONE at rc52.** Kind, substrate, recipe,
  colour, name. The hex is optional and an unmeasured swatch says so.

**Simplified at rc105 (§13fg).** The stages, the chain, quality, the departure display and the
swatch's kind, surface and recipe left the batch screen. The lines and the swatch list stay, in
the simpler form; older batches keep and show what they recorded.

**B6b is complete except for the six substances** — and they do NOT wait on a workbook; see
B6e and item 18g. Three fields are required of a substance record and the sources already on
hand support what each of the six is and does. Only the safety fields stay empty, which is
the normal state for thirteen of the twenty-six records already shipped.

## B6c. A vocabulary editor

`vocab.js` says adding a term is a data change and that the seeded terms are editable in the
`vocabulary` store. There is no screen that writes to that store, and `backup.js` skips it,
so a term added by any means is lost on restore.

This is the preferred answer to the open swatch-kind list and was deferred at rc46 only
because it needs the backup to change as well. Recorded so that a later reader meets the
reason rather than concluding that a closed list was the design.

## B6d. An update button for Sources and the Glossary

Both packs can gain a record at boot and can never have one corrected: nothing calls
`seedUI.open` for them, so a fixed source or a reworded glossary term goes out in the ZIP and
reaches nobody who already has the application. `scripts/try-pack-reachability.mjs` excuses
them by name at rc47 and the excuse says exactly this.

Deferred rather than done because both live inside the Library, a reading screen with tabs
and no list of records to stand a button beside. Where it goes — a tab, the Library's own
head, somewhere else — is a layout decision nobody has taken, and inventing a place for it
inside a guard's exemption list would have been taking it quietly.

## B6e. The working view — five defects found 11 September 2026

Written up in `DOCUMENTATION_DECISIONS_NEEDED.md` item 18, with the code confirmed for each.

~~**18a**~~ — **DONE at rc53** (§13dt). Changing the amount on the record emptied its
ingredients and steps in memory. This entry used to say an Edit-then-Save would then write the
emptied recipe to disk; it would not — Edit reloads the record from the database — and the
claim is withdrawn. A screen fault, not a data-loss route.

The rest — what the amount field IS, a scaling control on recipes that cannot scale, the
caret jumping after the first digit, and a record that cannot say the library has a newer
version of it — are ordinary work, but 18b is a decision before it is a fix.

~~**18e**~~ — **DONE at rc54** (§13du). A seeded record says when the library holds a
different version of it, compared by content rather than by version, in all five modules
with a button; the button counts what the preview would tick.

~~**18f**~~ — **DONE at rc55** (§13dv). The pigment recipes' carrier and alkali lines point at
the library's alum, soda ash and chalk. Raised by it: **18h**, whether the weigh list shows a
line's note.

~~**18g**~~, ~~**18h**~~ — **DONE at rc56** (§13dw, §13dx). Seven pigment substances, the
seven recipe lines that named them in prose, and the first sentence of a line's note under
each weigh line. Raised by them: **18i**, that a substance record has no source field.

**rc63** finished the diary side of paste printing (§13ee): a printing step records what
actually went in. Still open, and only when the reference half is taken up: a paste covers
only part of the cloth, and the combination key does not know it. Three ways out were put to
the owner — leave it to the work's own words, split the process in two, or give the
combination a coverage field.

**rc62** opened the diary to paste printing (§13ed).

**rc61** added Kelly's four mordant recipes (§13ec). Open from it: whether the library should
be able to carry a CHAIN — the compound mordant, drying and the bran bath are one sequence,
and `seed/chains.json` does not exist.

**rc60** added the three Cliffe print pastes (§13eb). **Next, and agreed with the owner: the
DIARY side of paste printing** — `process:paste` still says „скоро" and a trial cannot choose
it, so the library now holds recipes the diary cannot record work against. To be planned
before it is built.

**rc59** settled 18i (§13ea): `sourceCodes` is a list on recipes and substances, checked by the
audit. Next: the three print pastes from Nicola Cliffe, chosen by the owner on 14 September —
mordant paste, dye paste without a mordant, ready-to-use dye paste with aluminium acetate.

**rc57** settled the model question the pastel recipe raised: a recipe can be an ingredient of
a recipe (§13dy). The owner is preparing more recipes; the seed pack is reviewed as a whole
before 1.0, to decide what ships.

~~**18b, 18c, 18d**~~ — **DONE at rc58** (§13dz). The amount field: offered only where it moves
something, typeable, comma-tolerant, and its own per recipe. **Item 18 is closed.** 18i — a
substance record has no source field — is the one open item left from it.

**18g corrects this roadmap.** Entries above said the six substances were content rather than
code because „a substance record carries hazard, handling and purpose". The schema says
otherwise: three fields are required, and `safetyNote` appears on three records out of
twenty-six. The claim was made from memory and deferred work that nothing was blocking.

## B7. Smaller, accepted, not built

- **The visual pass deferred at 0.98.2.** Density, rhythm, the weight of headings. The
  screen was noted at rc19 as close to too even — everything a beige box of equal weight.
  The answer is hierarchy by spacing and heading weight, **not** by colour.
- **Global search.** Cross-module: „жълто" reaching plants, combinations, recipes and
  swatches, each with its own idea of a match. Worth building, with its own brief. An empty
  box that searches less than it appears to is worse than none.

---

# Part C — deliberately not planned

Recorded so they are not proposed again.

- **No cloud account for 1.0.** See A5. Local-only is a feature, not a limitation.
- **No colour coding anywhere in the interface, and no green.** Asked for at rc19 — a soft
  green ground on the seasonal block, a colour per fabric stage — and refused. A person
  judging „is this the ochre I wanted" must not have five invented colours in the corner of
  the eye. Not a style preference: it is the reason the workspace is neutral at all. The
  single exception is a plant's own recorded hex, which is data.
- **No emoji.** They render differently on every platform and would arrive in a bilingual
  offline application as a third typeface nobody chose.
- **No hero image on the home screen.** A third of the first screen, the same picture every
  day, pushing the work below the fold. The first thing you see should be your own work.
- **Seasons as a filter.** „Лято" puts elder flower in June and walnut husks in September
  in one bucket. Months only. §13cd
- **Bath strength as a key dimension.** „Слаба баня", „концентрирана баня" are notes on the
  record. §13br
- **Reverse links in the data.** Related lists are derived on opening, never stored.
- **A second plant list for the seasonal filter.** The same list with a month filter in the
  address. Two lists of plants are two lists that eventually disagree.
