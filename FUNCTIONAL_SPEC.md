# Багра / Bagra — Functional Specification

*Natural dye and eco print notebook, by Crafty Place*

**Status:** 1.0.0-rc45 · 134 sections
**Scope:** Functional modules, data model, technical architecture, and the record of
decisions taken and faults found.

---

### How to read this

Six parts. **Section numbers are never reused and never renumbered** — the code cites them 443 times, and a number that moved would leave every one of those comments pointing at the wrong decision, plausibly and in silence.

The numbering is therefore historical rather than positional: §13cl follows §13ck because it was decided later, not because it sits below it. Read by part, or by the subject index.

#### Part I. The product

What this is for, what it is not, and what it looks like.

- 1. Purpose and positioning
- 2. Module overview
- 12. Deliberately out of scope (for now)
- 15. Visual identity and naming

#### Part II. The modules

One section per module, in the order the sidebar shows them.

- 3. Module A — Materials
- 4. Module B — Plant Library
- 5. Module C — Recipes
- 6. Module D — Techniques (decoration & manipulation)
- 7. Module E — Combinations (the reference engine)
- 8. Module F — Trials (activity log & gallery)
- 9. Module G — Library & Tools
- 10. Reference packs — separate export/import for knowledge
- 11. Cross-cutting requirements
- 11a. Navigation — two halves and a rule
- 11b. Stock, and why it is folding into Substances

#### Part III. The data model

Every store, every field, and what each one may hold.

- 13. Data model
- 13.2a Safety, as a level and a set of things to do

#### Part IV. Architecture

How it is built and how it is released.

- 14. Technical architecture

#### Part V. Decisions, and the faults that produced them

In the order they happened. This is the largest part of the document and the most useful: it records what was got wrong, how it was found, and what stops it coming back. Read chronologically — several faults recurred months apart, and grouping them by subject would hide that.

91 sections, §13a to §13cn. Listed by subject below rather than one by one.

#### Part VI. Open questions

Decisions not yet taken.

- 16. Open questions

---

### By subject

A section may appear under more than one heading; that is what the index is for. Several titles name the FAULT rather than the subject — „Работа, която сочи към никакъв плат" is a Trials section — so this is written by hand and is worth keeping so.

**Plants and the plant library** — §4 · §13g · §13h · §13i · §13m · §13at · §13aw · §13ay · §13az · §13ba · §13bp · §13cc · §13cd · §13ce · §13cg

**Combinations and the reference engine** — §7 · §13l · §13t · §13aj · §13bq · §13br · §13ck · §13cl

**Fabrics, and preparing the cloth** — §13al · §13am · §13an · §13av · §13bd · §13bj · §13bl · §13bm · §13bn

**Trials and the dyeing workflow** — §8 · §13ag · §13ao · §13ap · §13ar · §13au · §13y · §13bf · §13bi

**Group actions** — §13bd · §13bh

**Recipes and chains** — §5 · §13ak · §13aq · §13v · §13ca

**Techniques** — §6 · §13w

**Materials, substances and stock** — §3 · §11b · §13bs

**Pigments** — §13bv · §13bx · §13by · §13bz · §13dr · §13ds · §13fg
**Plans** — §13fj
**Eco-print bundle** — §13fl
**Reference: observations, Records search and sort** — §13fp

**The Library — glossary, pH, sources** — §9 · §13r · §13bt · §13bu · §13cb

**Calculators and tools** — §13af · §13ak · §13bs

**The home screen** — §13u · §13cd · §13cf · §13ch

**Navigation and addresses** — §11a · §13q · §13ad · §13ab

**The interface — rules that bind every screen** — §13s · §13k · §13ac · §13o · §13n · §13bg · §13bo · §13bb

**The phone** — §13aa · §13ae · §13cg

**Language, terminology and translation** — §13bc · §13cb · §13cj · §13eh · §13ei · §13ej · §13ek · §13el · §13em

**Backup, restore and the update path** — §13a · §13x · §13f

**Reference packs and distribution** — §10 · §13ab · §13bw · §13cb

**Checks, and faults that hid from them** — §13e · §13d · §13p · §13ci

**Search and filtering** — §13j · §13aj · §13cd

# Part I. The product

## 1. Purpose and positioning

A record-keeping and **reference** application for natural dyeing and eco printing.

The distinguishing goal is that the app must **answer questions**, not merely store history:

- What can I expect from oak leaves on cotton with aluminium acetate?
- What colour will I get if I pre-treat this fabric with a given tannin?
- What result should I expect from a blanket soaked in 1% iron solution?

This makes the app a **knowledge base with a personal experience layer on top**, rather than a diary
with search. Every design decision below follows from that.

### 1.1 Two kinds of information

| | Knowledge | Experience |
|---|---|---|
| Source | Literature, courses, other practitioners | The user's own work |
| Truth value | Generally accepted, not personally verified | Verified, but specific to one setup |
| Example | "Oak leaves + cotton + alum acetate → grey-brown print" | "12 May: oak on cotton, alum acetate — came out greener than expected" |

**Decision:** these are not two separate modules. They are one **Combination** record (knowledge) with
**Trials** (experience) attached to it. Over time the personal layer refines the general one — the value
compounds, because the resulting reference reflects the user's own water, fabrics and local plants.

### 1.2 Product ambition

Unlike Глина (an explicitly personal tool), this app is a **candidate for public release**, since no
comparable product exists. This changes several early decisions:

- **Bilingual (BG/EN) from the start** — not retrofitted. All user-facing strings go through a
  dictionary; all stored values use stable language-neutral codes.
- Reference data (plants, mordants, standard recipes) must be **seedable** — a new user should
  receive a useful starting library, not an empty app.
- Personal data and seeded reference data must be **distinguishable** in the model.
- Schema versioning and clean export/import matter more than they did for Глина.

Offline-first remains a hard requirement.

### 1.3 Seed-first, not empty-first

The app ships **loaded**, not blank. Plant data and the great majority of recipes already exist in
published literature and established practice; none of it needs to be reinvented. The user starts
from a working reference library and modifies it as her own experience accumulates.

This reverses the usual order of use:

1. **Day one** — the library is already useful. She can look up a plant, a mordant recipe, an
   aluminium acetate preparation, and start working.
2. **Later** — her own trials attach to the seeded combinations, refining and sometimes
   contradicting them.
3. **Ongoing** — newly discovered recipes arrive as reference packs (§10), or are entered by hand.

Consequences for the build:
- The reference library is a **deliverable in its own right**, not a by-product. Compiling it is
  real work and should be planned as such, in parallel with the code.
- Every seeded record needs a **source attribution** field. For a public release this matters
  beyond good manners: factual data about plants is not protected, but a recipe copied verbatim
  from a book is someone's text. Seeded recipes must be written as procedures in the app's own
  words with the source credited, not pasted.
- Seeded records must be marked as such and stay distinguishable from her own edits (§10).
- Seeded entries are authored in whichever language comes naturally; the paired field structure is
  present from the first record, but filling the second language is deferred to a bulk translation
  pass before publication, and only for records marked distributable (§13.1).

---

## 2. Module overview

| # | Module | Nature |
|---|---|---|
| A | Materials | Inventory + properties |
| B | Plant Library | Reference |
| C | Recipes | Procedures |
| D | Techniques (decoration) | Reference vocabulary |
| E | Combinations | **Knowledge core — the reference engine** |
| F | Trials | Experience log / gallery |
| G | Library & Tools | Calculators, backup, guides |

---

## 12. Deliberately out of scope (for now)

- Colour measurement from photographs (light conditions make this unreliable without calibration)
- Commercial/production features: orders, pricing, client records
- Multi-user accounts and cloud sync
- Automated colour matching against a standard system (Pantone/NCS)

---

## 15. Visual identity and naming

### 15.1 Names
- **Bulgarian:** Багра
- **English:** Bagra — **since 1.0.0-rc126 (§13gb)**. Until then the English name was Rubia, after *Rubia
  tinctorum*; the owner settled on one name in both languages before 1.0. The paragraph below is the
  reasoning of the earlier decision, kept as history.
- **Attribution:** *by Crafty Place*

A bilingual app may carry two names. Багра follows the same logic as Глина — an ordinary Bulgarian
noun naming the substance of the craft — so the two read as siblings. Rubia carries the same
register outward without being a literal translation.

### 15.2 Palette — indigo and madder

Grounded in real dyes, and deliberately away from Глина's sage and terracotta. The two apps should
look related — both earthen, muted, in a craft register — without being mistaken for each other.

| Role | Colour | Use |
|---|---|---|
| Ground | unbleached linen `#F7F4EC` | page background, working surface |
| Surface | near-white warm `#FFFDF8` | cards, panels |
| Ink | `#2A2724` | primary text |
| Muted | `#5C574E` | secondary text, labels |
| Line | `#DED8CA` | hairline borders |
| Primary — indigo | `#2C3B57` | navigation, active states, primary buttons |
| Accent — madder | `#A03D3B` | accents, emphasis, destructive actions |
| Highlight — weld | `#C9A227` | sparingly: warnings, unsaved state |
| Iron | `#3A3733` | dark neutral, chips |

**Discipline is the whole point.** Indigo is a strong colour: navigation and active states only.
Madder for accents only. The working surface stays neutral.

### 15.3 Why the interface must stay muted
This is an application about colour. Every screen carries swatches and photographs of results, and
the user judges from them whether a print came out grey-green or olive. A saturated interface
shifts that judgement — adjacent colour changes perception, which is physiology, not taste, and the
reason image-editing software is grey. The interface is the ground against which the work is read;
it must not compete.

### 15.4 Icons
Real SVG icons, not typographic glyphs. Dingbat flowers (✦ ❈ ✽ ❀ ❋) are indistinguishable from one
another at navigation size and defeat icon-based wayfinding entirely. Icons must differ in
silhouette, not only in detail.

### 15.5 Prototype review — outstanding gaps
Reviewed against the first two prototypes (July 2026). Correctly captured: sidebar plus bottom-nav
for the two form factors; partial-match reference search with an explanation of why a result is
partial; confidence indicators; the combination suggestion; the bilingual form with a 2/2 status
and collapsible translation; the pack import preview.

Still missing:

1. **Medium modification cannot be entered.** It appears as a search filter but has no field in the
   trial steps. Data that cannot be entered cannot be searched.
2. **Photographs are nearly absent.** Placements have no photo field, though the per-plant result is
   exactly what needs photographing.
3. **The fabric lifecycle is reduced to a table column.** The "what is in the mordanted box" view —
   the actual inventory — is missing.
4. **Recipe source attribution is not shown anywhere.** Seed badges exist; credit does not.
5. **Calculators are the three generic ones.** Recipe scaling to WOF and the aluminium acetate
   preparation — the two named as most useful — are absent.

---


# Part II. The modules

## 3. Module A — Materials

One module, several categories. Each category has shared fields plus its own.

### Shared fields
Name, category, supplier/source, acquisition date, quantity/stock, notes, photo.

### A.1 Fabrics / Fibres

A fabric record is **one physical piece**, not a fabric type. A reclaimed t-shirt is unique and
single-use; a bought roll of crepe is a length that gets consumed. The record must describe the
individual object, because two pieces of "cotton" can behave entirely differently.

#### Identity
- **Origin:** new (with supplier and purchase date) or reclaimed (what it was, condition, prior use)
- **Form:** garment / scarf / cut piece / roll — this determines the unit of quantity
- **Quantity:** count for garments and scarves, length or area for yardage; consumed as it is used
- **Dimensions and weight** — weight is needed for every % WOF calculation, so it is a real field,
  not a note

#### Composition — structured, not free text
A list of fibre shares totalling 100%: e.g. 99% cotton + 1% elastane, or 50% cotton + 50% linen.
Stored as pairs (fibre, percentage), never as a label.

This matters because synthetic content does not take natural dye. The app derives from the
composition:
- the **dye-receptive fraction**, used to qualify % WOF calculations and expected saturation
- the **fibre class** (cellulose / protein / mixed / part-synthetic), which decides the whole
  mordanting route and which reference results apply (§7)

A mixed cellulose-protein cloth is a case of its own: the two fractions take mordant and colour
differently, and the app should flag it rather than pretend one route fits.

#### Structure
Weave or knit type — plain weave, crepe, jersey/knit, twill, gauze, velvet — plus weight (g/m²).
Structure changes how sharply an eco print registers, so it belongs in the combination identity.

#### Treatment state — a lifecycle, not a field
The user physically sorts fabric into boxes by treatment state, and the app mirrors exactly that:

`unwashed → scoured → mordanted → dyed / printed → finished`

**Revised in §13bd.** There were six states and `tannin-treated` was one of them. It is not a box:
tannin on cellulose is a *route*, an alternative to aluminium acetate, and a tanned piece may go to
an eco print, to a paste print, wait for alum, or be finished as it is. It is now an action the
piece carries, shown as a label beside the box. Nothing had ever been written with the old state.

A transition is one of the **actions** in §13bd, and only four of the ten move a piece between
boxes. Each is an event with a date and a link to the recipe used. Dates matter: mordanted cloth
benefits from curing, and knowing when it was mordanted is part of reading the result.
Pieces may skip states (a mordant is not always preceded by tannin).

Filtering by state gives a live inventory of the boxes — "what is in the mordanted box" is a query,
not a memory exercise.

#### Physical labelling
Each piece gets a short human-writable code (e.g. `П-042`) generated by the app, intended to be
written on a tag and pinned to the cloth. **The number is reserved on save, never on opening the
form.** Opening the new-fabric form three times and saving once must yield one code, not a gap of
three. A sequence with holes in it is a small thing that quietly erodes trust in the record. The tag carries only the code; composition, treatment
history and dates stay in the app. No barcodes or QR — a pinned paper tag survives a steam bath
and a wash better than anything scannable.

#### Other fields
Colour (natural / bleached / already dyed / previously dyed by her), behaviour notes
(shrinkage, how it takes colour), photo.

### A.2 Dyestuffs
Three sub-forms of the same thing:
- **Extract** (concentrated, purchased) — concentration, manufacturer
- **Dried plant material** — part used, harvest date, storage
- **Fresh plant material** — part used, harvest date, seasonal state

All three link to a **Plant Library** entry (B) for the botanical background.

### A.3 Tannins
Tannin type (gallotannin, ellagitannin, condensed/catechol), source (gall nut, oak, myrobalan,
sumac, pomegranate…), colour cast (clear / yellowing / darkening). Tannins act both as mordant
assistants on cellulose and as dyes in their own right — the model must allow both roles.

### A.4 Mordants
Alum (potassium, aluminium acetate), iron, copper, tin, symplocos, etc.
Fields: standard working concentration (% WOF), which fibre classes it suits, colour effect
(brightening / saddening / darkening), safety notes.

### A.5 pH modifiers & assistants
Soda ash, vinegar, citric acid, lime, cream of tartar, calcium carbonate, etc.
Fields: acid/alkaline, typical use, effect on specific dye classes (anthocyanins shift dramatically;
tannins darken in alkali, etc.).

---

## 4. Module B — Plant Library

A large reference body, kept separate from Materials because a plant is knowledge, while a material
is a physical thing on a shelf. A single plant entry may back several material records
(fresh leaves, dried leaves, purchased extract).

### Fields
- Common name (BG/EN), botanical name
- **Parts used:** leaves, bark, roots, flowers, fruit, hulls, galls — each part may behave differently
- **Chemistry:** a **fixed vocabulary** of constituent classes, each with a level
  (trace / moderate / high / dominant) and an optional note.

  The vocabulary — tannins (with subtype: gallotannin, ellagitannin, condensed), anthocyanins,
  flavonoids, quinones, carotenoids, indigoids, betalains, alkaloids, and any further class added
  deliberately as a schema change, never ad hoc by the user.

  Fixed rather than free tags because the reference engine depends on it: only a controlled
  vocabulary supports queries such as *"all high-tannin plants that grow locally"* or *"which
  anthocyanin plants shift most under alkali"*. Free tags fragment on spelling and language and
  make such questions unanswerable. Since the app is bilingual, each class is stored as a stable
  code and rendered per language.
- **Role:** dye plant / eco print plant / both / mordant plant (accumulators)
- **Compositional role** — eco print specific, and absent from most references: is this plant a
  *shape printer* (a clear silhouette with vein detail), a *texture or background filler* (used in
  quantity behind stronger printers), or a *resist* (horsetail's silica leaves a ghost rather than
  a print). This is how a bundle is actually composed, and it is not derivable from tannin level
- **Preferred surface** — some plants print more crisply from the leaf underside than the upper
  side. Where known, the library records it, and the trial's `facing` field can be prefilled from it
- **Preparation before bundling** — plant-specific handling that materially changes the result:
  eucalyptus soaked for hours (sometimes with a splash of vinegar) before it will give colour, oak
  pressed flat if it curls, robinia bundled quickly before its edges dry. This is practical
  knowledge that exists nowhere in a chemistry field and is exactly what the user needs at the table
- **Steaming tendency** — some plants need markedly longer than the 60–120 minute norm; acacia and
  eucalyptus want 90 minutes or more. Recorded as a tendency, not a rule
- **Identification note** — what the plant looks like and where it is encountered. A reference the
  user consults while out walking has to help her recognise the plant, not only look it up
- **Distribution / native range**

#### Cultivation — a block the model originally lacked
The owner grows dye plants rather than only foraging them, and her own guide organises every
profile around growing as much as around dyeing. Reference material that stops at chemistry is
useless in the garden, so a plant carries:

- **Agronomy** — light, soil structure, watering, soil pH (madder wants alkaline, limey ground at
  pH 7–8; getting this wrong means no dye at all, three years later)
- **Propagation** — from seed, from rhizome division, when to sow
- **Care and maintenance**
- **Pests and diseases**, and any invasiveness warning — madder needs its own bed or a deep raised
  one, which is a planting decision, not a footnote
- **Years to maturity** — madder roots only begin accumulating dye after two or three years. A
  reference that omits this invites a wasted season

#### Harvest and processing
Distinct from *preparation before bundling*, which is an eco print concern. This is what happens
between the garden and the jar: when to lift or cut, washing, drying time and conditions, cutting
or crushing, storage.

- **Drying ratio** — drying reduces madder root roughly sixfold. Any recipe written for dry
  material must be rescaled when fresh material is used, so this is a number the calculators need,
  not a remark

#### Dosing and temperature — structured, because the calculators read them
- **% WOF guidance per part and per condition** — madder root at 50–100% WOF dried, 200–300%
  fresh. One figure per plant would be wrong twice over
- **Extraction temperature** and **dyeing temperature** as separate ranges (madder: 60–75 °C and
  60–70 °C)
- **Hard ceiling** — some dyes are destroyed by boiling. Recorded as `maxTempC` so a trial step
  above it can be flagged, in the same way as titanium oxalate on the mordant side
- Seasonality — when to harvest, how the season changes the result
- Substantivity — does it need a mordant, or is it substantive
- Lightfastness / washfastness notes
- Toxicity and handling warnings
- Local availability (grows at Crafty Place / foraged locally / must be bought)
- Free-text observations
- Photo

Plants can be seeded from established reference sources and extended by the user.

---

## 5. Module C — Recipes

A recipe is a **procedure with proportions**, reusable across trials. Recipe types:

1. **Scouring / preparation** — how the fibre is cleaned before anything else
2. **Tannin treatment** — % WOF, temperature, time, order relative to mordanting
3. **Mordanting** — substance, % WOF, temperature, time, fibre class it applies to
4. **Dyeing** — with a specific dye source; ratio of dyestuff to fibre, temperature, time, pH
5. **Eco print** — bundling method, blanket type, plant placement, steaming/boiling, time, pressure
6. **Pigment making** — precipitation/lake-making from a dye bath
7. **Dye paste** — thickener, binder, proportions, for printing
8. **Blanket** — the cloth laid against the bundle, prepared as either a *dye blanket* (soaked in a
   dye or extract) or a *mordant blanket* (soaked in a mordant solution, e.g. 1% iron). A blanket is
   a recipe, not a field on the trial: it has a formula, a concentration and a method, it is reused
   across many bundles, and its exact make-up is one of the strongest determinants of the result.
   A blanket may also be reused while still loaded from a previous bundle — the recipe therefore
   records whether it is freshly prepared or carried over, and how many uses it has had

### Shared fields
Name, type, ingredients (roles filled by substances, with quantity ranges), steps, temperature,
applicable fibre classes, source (own / book / course — with attribution), notes.

**Duration is two figures, not one.** `heldMinutes` is the time at temperature; `restMinutes` the
time steeping after the heat is switched off. A tannin bath heated to 60–70 °C and then left to
cool for one to two hours is not a ninety-minute bath, and collapsing the two loses the part that
most often decides the result. The same split already exists on trial steps (§8.3).

### 5.1 Ingredient roles and substitution

**A role may be filled by interchangeable substances, each with its own quantity.** A tannin bath
is one recipe, not three: gallnut at 8–10% WOF gives a colourless ground, myrobalan at 20% a yellow
one, cutch at 20% a red-brown one. Modelled as a list of options on the ingredient, the advice
"substitute sumac if you want a neutral ground" stops being a note the user must read and apply
mentally, and becomes a choice in the interface — and, later, the difference between two distinct
combinations in the reference (§7).

`RecipeIngredient.options: [ { id, substanceId, qtyMin, qtyMax, note {bg,en} } ]`

**Quantities are ranges.** Sources give ranges far more often than single figures — 8–10% tannin,
12–15% alum on wool, 50–100% dried madder root. A field holding one number forces the user to throw
away half of what the source said. A single figure is the degenerate case where min equals max.

**Two substances used together are two ingredients, not two options.** The distinction must be
unmistakable in the interface: options replace one another, ingredients accumulate.


Real recipes are written against roles, not against specific products. "Aluminium source" may be
potassium alum, ammonium alum, or aluminium sulfate in any of four hydration states — and the
choice changes the quantities of *other* ingredients: anhydrous aluminium sulfate needs roughly
twice the soda and acid of the 18-hydrate form, gram for gram.

This has three consequences:

1. **Materials need chemical identity, not just a name.** A mordant or assistant carries
   `formula`, `hydrationState`, `molarMass` and, for liquids, `concentrationPercent` (vinegar
   ranges from 5% to 25%). Without these the substitution arithmetic is impossible.
2. **Substitution can remove a line.** Choosing sodium acetate as the sodium source removes the
   acid step entirely — the conversion has already happened. A recipe is therefore not a fixed list
   of ingredients but a set of roles resolved at scaling time.
3. **A recipe may carry more than one method** with genuinely different arithmetic. A full
   immersion bath doses by weight of fibre; a saturated soak — fibre soaked, wrung and dried in one
   pass — doses by concentration in g/L, because there is no repeat dip to build up mordant. Same
   recipe, two methods, two bases. `RecipeMethod` = `{ code, basis, defaults, note {bg,en} }`.

### 5.2 Conditional ingredients

An ingredient may apply only to certain fibres. Cream of tartar is required when mordanting wool
with alum and pointless on cotton; a recipe that lists it unconditionally is wrong half the time,
and one that omits it is wrong the other half.

`RecipeIngredient` therefore carries `whenFibreClass: [code] | null`. When a recipe is scaled
against a specific fabric, ingredients whose condition does not match are dropped from the result
rather than shown greyed out — the output should be the list to weigh, not a list to filter mentally.

### 5.3 Recipe chains — the preparation sequence

Cellulose needs three separate processes before it can be dyed: scour, tannin, mordant. Each is its
own recipe, but they are always run as a sequence against **one** weight of goods, and doing the
arithmetic three times by hand is where errors enter.

A **Chain** is an ordered list of recipe references scaled together from a single weight:

```
Chain
  id, name {bg,en}, appliesTo [fibreClassCode]
  steps [ { order, recipeId, note } ]
  sourceRef, distributable
```

Entering one weight yields the full shopping list for the whole preparation, in order, with each
recipe's own ingredients scaled and conditional ones resolved against that fabric. This is the
"wizard" idea, but modelled as data rather than as a hard-coded screen — new chains can be added
without touching code, and a chain is itself shippable in a reference pack.

`requiredFollowOn` (§5.4) remains distinct: a chain is a plan the user assembles, a follow-on is a
step the recipe cannot be correct without.

### 5.4 Required follow-on steps

Some recipes are incomplete without a step that is not optional and not part of the main
procedure — an aluminium acetate mordant requires a chalk or bran finishing bath afterwards, which
binds the mordant to the fibre rather than merely adjusting pH. Modelled as
`requiredFollowOn: [recipeId]`, surfaced in the UI as part of the recipe rather than as advice, and
carried into a trial as a step when the parent recipe is applied.

### Versioning
As in Глина: changing proportions on a recipe that already has trials attached creates a **new
version** rather than overwriting — otherwise past results become unexplainable.

---

## 6. Module D — Techniques (decoration & manipulation)

A controlled vocabulary of what was physically done, orthogonal to the recipe:

- Resist: wax (batik), paste resist, clamp (itajime), stitch (nui shibori), bind, pole (arashi)
- Shibori variants
- Paste printing / screen printing / block printing
- Bundle types for eco printing
- Overdyeing, dip-dyeing, gradient
- Post-treatments: iron dip / afterbath, alkaline or acid modifier bath, soaping

Each entry: name, description, applicable to which processes, notes.

---

## 7. Module E — Combinations (the reference engine)

**This is the core of the app's value.** A Combination is a knowledge record describing an expected
outcome for a defined set of inputs.

### Identity of a combination
- **Dye source** — plant + part, or tannin, or extract
- **Fibre class + specific fibre** — cotton, silk, wool…
- **Mordant** (including "none") and its concentration band
- **Process type** — immersion dyeing / eco print / eco print with blanket / paste print
- **Blanket** (for eco print) — none / dye blanket / mordant blanket, and its concentration
  (e.g. 1% iron solution)
- **Medium modification** — none / acid / alkaline, and where it was applied (bath or steam);
  see §8.3

### Outcome fields
- Expected colour (swatch + name), and the range of variation
- Print quality (for eco print): sharpness of the leaf image, contrast
- Lightfastness / washfastness expectation
- What shifts the result: temperature, time, pH, iron
- Source of the knowledge, with attribution
- **Confidence:** literature-only / confirmed by own trials / contradicted by own trials

### Retrieval — the questions the app must answer
The reference engine must support both directions:

- **Forward:** "I have *these* inputs — what should I expect?"
  (choose dye source + fibre + mordant + process → outcome)
- **Reverse:** "I want *this* colour on *this* fabric — what do I need?"
  (choose target colour + fibre → list of routes)
- **Partial:** any subset of inputs, returning all matching combinations
  ("everything I know about aluminium acetate on cotton")

Partial matching matters most in practice. The user rarely has all five inputs fixed.

### Relationship to Trials
Every Trial (F) can be linked to one or more Combinations. The Combination detail shows:
expected outcome, then the user's own trials beneath it, with any divergence made visible.

### Matching on bands, not exact values
Trial inputs are never identical twice: one blanket is 1% iron, the next 1.5%; one steaming runs
90 minutes, the next 120. If combinations matched on exact values, nothing would ever match and the
reference would stay empty.

A combination is therefore identified by **bands**, not figures:
- Mordant and blanket concentration → trace / low (~1%) / medium (~2%) / high (3%+)
- Duration → short / medium / long, per process type
- Temperature → cold / warm / simmer / boil
- pH → acid / neutral / alkaline

Exact figures stay on the trial (§8.2), where they belong. The bands live only in the reference
layer. Band definitions are part of the seeded reference data and must be revisable, since they
encode judgement, not fact.

### Proposing a combination from accumulated trials
The app may notice that several placements share one input set while no combination record exists,
and offer to create one:

> Three placements share this input set (oak, leaf, dried → cotton, aluminium acetate, eco print,
> iron blanket ~1%) and there is no reference record. Create one?

The draft is pre-filled with the combination key, the three observed results quoted verbatim, a
confidence of *confirmed by own trials*, and links to the source trials.

**The expected outcome is a proposal, never a computed value.** Averaging "grey-green" and
"grey-brown" produces nothing meaningful; the user writes the conclusion herself from the raw
observations. The app supplies structure and evidence, not judgement — otherwise the reference
fills with mechanically generated statements that read like knowledge and are not.

Suggestions appear at a threshold (three or more matching placements), are dismissible, and never
recur once dismissed for that input set.

The reverse direction is automatic: a placement matching an existing combination is linked without
asking.

### Reference and search are one module
Combinations have no navigation entry of their own. They live inside **Reference**, as two tabs:
the search and the records behind it. The distinction the user cares about is *asking* versus
*curating*, not *engine* versus *store*, and an eleventh sidebar item would have cost more than it
explained.

### Partial matching is the default, not a fallback
Only the criteria actually filled in are compared; an unanswered field never counts against a
record. Results rank by agreement, exact matches are badged, and partial ones **name what differs**.
This last part is the useful one: shown "oak on cotton with alum", the neighbouring record "the same
but with iron" is frequently the answer being looked for, and hiding it would make the reference
narrower than the practice it describes.

### Multi-plant bundles — resolved
A single eco print bundle usually carries several plants at once. Such a trial links to several
Combinations through its **placements** (§8.5) — one per plant, each carrying its own observation
while inheriting the shared conditions of the bundle.

---

## 8. Module F — Trials (activity log & gallery)

A Trial is one actual piece of work, with photographs. It is deliberately **thin** at the top level —
it composes records from other modules rather than duplicating their fields. Its substance lives in
two nested lists: **steps** (what was done, in order, with timings) and **placements** (which plant
went where, and what each one gave).

### 8.0 Process is a set of enhancements, not a single type

The spec originally treated `processCode` as one value — immersion, eco print, eco print with
blanket, paste. Chandra Rice's *Ecoprinting 101* makes clear that this is wrong: a bundle is built
by **layering** independent enhancements, and in serious practice several are active at once. The
seven, as she sets them out:

1. Pre-soaking the **cloth** with a mordant
2. Pre-soaking the **botanicals** with a mordant — iron-dipping some leaves, titanium-dipping
   others, within one bundle
3. Pre-dyeing the cloth with a **substantive** dye (bonds without a mordant)
4. Concurrent dyeing with a **substantive carrier blanket**
5. Pre-dyeing with an **adjective** dye (requires a mordant)
6. Concurrent dyeing with an **adjective carrier blanket**
7. **pH modifiers**, applied before, during or after steaming

A trial therefore carries `processCode` (the base technique) plus `enhancements: [code]`. The
combination key (§7) includes the enhancement set, because "oak on cotton with alum" means
something different on a pre-dyed ground than on white cloth. Without this the reference engine
would silently merge results that are not comparable.

**Substantive vs adjective** is a property of the dye and belongs in the vocabulary: a substantive
dye bonds without a mordant, an adjective dye does not. It determines whether a mordant step is
required at all, and it splits carrier blankets into two kinds that behave differently in the bundle.

### 8.0a A trial is one story, told once

The single most costly mistake available here is to model *planning* and *recording* as two acts.
In practice they are one, often minutes apart: a plan is formed while the cloth is in hand, and the
work begins before the plan is finished. An application that asks for the plan and then asks again
for what happened has doubled the writing for no reference value — and writing is exactly what an
artist has least patience for.

**A trial therefore carries a status, not a twin.** `planned → in_progress → complete`. The record
is opened when the intention forms, holds whatever is known at that moment, and the *same fields*
are corrected as the work proceeds. Nothing is entered twice. Starting earlier costs nothing,
because starting earlier is not an extra step — it is the same step, taken sooner.

**Planned values are not preserved.** A step holds one figure and a `done` mark. If ninety minutes
became a hundred and twenty, the number is corrected and the ninety is gone. This is a deliberate
loss: the intended figure has no reference value — the reference is built from what happened — and
keeping both would double the fields on every step to record something consulted almost never.
Where a divergence is itself interesting, it belongs in the step note, in the user's own words, at
her discretion.

**Plans are not the twin this section refuses** (§13fj, rc109). A plan holds loose intent — a
comparison, a list of variants, what to try and why — *before* any trial exists. Once something
becomes a concrete trial, the trial is the single experimental record, opened as `planned` as above,
and the plan does not duplicate it. **Plan** = intention, comparison, checklist. **Trial** = what was
actually done. Nothing converts one into the other yet.

### 8.0b Stages, not step types

Entry is organised by **named stage** rather than by bath chemistry. The six, settled with the
owner:

| code | Bulgarian | what it holds |
|---|---|---|
| `raw` | сурова тъкан | *nothing — see below* |
| `prep` | предварителна обработка | scouring, tannin, mordanting, the chalk bath |
| `decorate` | декорация | shibori, resist, paste printing |
| `colour` | багрене и принт | dye baths, eco print, steaming, boiling |
| `after` | последваща обработка | iron bath, modifiers, soaping, rinsing, drying |
| `done` | готово | *nothing — see below* |

**Two of the six hold no steps, deliberately.** Raw cloth is the fabric record, which already exists
and already carries a photograph; finished is `status: complete` plus `resultPhotos`. Making either
a container would mean entering the same thing twice, which is the failure §8.0a exists to prevent.
They appear on the progress line as endpoints, read from the fabric and from the trial's own status.

**A stage is a label on a step, and it may recur.** This came from the owner and it is the part that
matters: dyeing before a print and again after it is *two passes* through colouring, not one stage
visited twice. So the screen groups steps into **consecutive runs** of the same stage, never into
one card per distinct stage — collapsing them would rewrite the order of the work. The progress line
is generated from the runs that exist. It is a record, not a template, and a trial with three
colouring passes shows three.

**Decoration needed step types that did not exist:** folding and binding, applying resist, paste
printing, and removing resist. Removing a resist is its own step because it usually happens much
later — after the dye bath, sometimes after the rinse. The existing `bundle` type is the eco-print
bundle and is a different act from binding for shibori.

**A decoration step points at a technique** from the Techniques module. The reference question is
"what does shibori on this cloth with this plant give", and that cannot be answered if the technique
is only recorded once at the level of the whole trial.

**Steps written before stages existed are grouped by inference from their type**, read at display
time and never written back. A record made before the question was asked is not wrong; a migration
that guessed would turn a guess into a fact.

**A photograph is offered at every stage and required at none.** Photo-first entry is right for
opening a bundle, where seeing precedes describing, and wrong at the scale, where there is nothing
to see. A stage may be nothing but a tick and a date. The rule from §8.5 is widened in *availability*,
never in *obligation*.

### 8.0c The piece is the entry point

The natural question is "what is happening with this garment", not "which trial was that". A fabric
record therefore offers **continue this story** directly, and a trial can be started from the cloth
without first choosing a module. The Trials gallery remains, for the times the question is visual or
chronological rather than about one piece.

**One button, two meanings, decided by the cloth.** If a trial on this piece is unfinished, the
button continues it; otherwise it starts a new one. This is what stops the app accumulating three
half-written trials on the same garment, which is what a plain "new trial" button would have done.

**The handoff travels in the address**, as `#/trials/<id>` or `#/trials/new/<fabricId>`. A hidden
channel was written first — the values stashed in `sessionStorage` — and replaced, because the
address costs nothing extra and makes the back button, a reload and a bookmark all behave. The new
trial then reads the cloth's own name and weight from the record rather than opening by asking what
it already knows.

**A route naming a record that no longer exists falls back to the gallery.** Deleting a trial and
then following an old link used to render nothing at all, and a blank screen with nothing on it to
explain itself is the worst outcome this application has.

**Assigning an unchanged hash fires no event**, so `navigate()` in `ui.js` dispatches the change
itself in that case. Without it, asking a piece to open a record it is already showing does nothing
at all, silently.

**One chronological photo strip.** Photographs about a single cloth are scattered across five
places: the fabric's own shot, a plan diagram, the placements, the steps, and the finished result.
Shown as separate blocks — which is how they were shown — they can state a before and an after but
never a middle, and the middle is where eco print happens. They are gathered into one strip so the
piece reads as it was lived: raw cloth, diagram, leaves laid out, rolled, rinsed, done.

**Sorted by date, then by rank within the day.** The rank is what does the real work: a trial's
plan, placements, steps and result almost always share one date, so date alone would leave the order
to chance and the roll could appear before the leaves were laid out. Plan first, then placements,
then steps in their own order, then the result.

`photoTimeline(fabric, trials)` lives in `fabric-logic.js` and is pure: it returns codes for what
each photograph is and leaves every word to the view. A step's photograph carries its `stageCode`,
so the strip names the stage rather than saying only "step".

### 8.0d Plans that are drawings

A worked-out plan is often a picture — a layering diagram, a folding sequence — and it should be
attachable as exactly that: an image on the trial, with no structured field asking to be filled from
it. What genuinely belongs in structured form is only the part that will later be searched: the
layers and their roles, which `BundleLayer` (§8.1) already holds, the barrier among them. The drawing
carries the rest, and carries it better than any form would.

### 8.0e The working flow — five screens

**Built in 0.73.0.** One field was added — see *the colour that came out* below —
and everything else is a rearrangement of fields that already existed.

The diagnosis first, because it explains the shape. The trial form is six panels
side by side — title, water, techniques, placements, steps, result — one per
corner of the `Trial` record. The stages added in 0.66.0 live *inside* the steps
panel, so the story is a subsection of a form. This inverts that: the story is
the screen, and the form's other corners become context folded above it.

**1 · My work.** The Trials module, reframed. Unfinished entries read as *how far
along* — a row with progress. Finished ones read as *what came out* — a card led
by a photograph and swatches. One list, two rhythms, because the question asked
of the two is not the same. Fabrics stays the wardrobe: what I own and what state
it is in. My work is what is happening.

**2 · New work.** One screen, one question: what are you working on?

**Revised in §13bd.** This screen sorted mordanted pieces to the top under *ready
to work*. Readiness turned out not to be a property of a piece but of the pair of
piece and intention: tanned cotton is ready for an eco print and never will be for
a madder bath, and under the old rule it sank to the bottom beside the raw wool.
One list now, every piece showing its box and the treatments it carries, ordered
by how much preparation stands behind it. Choosing goes straight into the trial — no intermediate form.
A new cloth can be added inline with name, composition and weight only; the tag
number is reserved on save as everywhere else. Intent is written afterwards, at
the top of the trial, if at all.

**3 · The active trial.** A single column: header, progress line, then the stages
open as cards. Three things move and nothing is added — placements become an
action inside *colouring and printing* rather than a separate panel (the data
stays in `trial.placements`); water, process and enhancements fold into a
collapsed *about this work* strip, because they are context and not work; and
every stage carries its own **+ add action**, which knows the stage it inserts
into.

**4 · Finishing.** Its own screen rather than a field at the bottom of a form:
photographs, the colour that came out, how it went and why, *would I do this
again*, and the cloth's change of state. All five already exist — `resultPhotos`,
`assessment`, `assessmentWhy`, `repeat`, `stateEvents` — gathered in one place
and put as questions.

**5 · Reviewing finished work.** The result is the screen: a large photograph,
the verdict, the swatches, whether it would be repeated. The process folds
underneath and opens as the same stepped story, read-only.

#### Chains are inserted expanded

Choosing a ready sequence of three inserts **three steps**, each carrying its
`recipeId` and the `chainId` of the sequence that brought it. Both fields already
exist on the step, so this costs no schema change.

The reason is what follows the insert: with one indivisible step the owner cannot
tick only the first two as done, cannot photograph the tannin separately from the
acetate, and cannot correct the temperature of one of them. Those three things
are the whole of working through a process.

There is a quieter reason. A trial records what *happened*, not what was
prescribed. A chain held as a single `chainId` would silently rewrite the history
of old work whenever the chain itself was edited. Expanded steps are a snapshot
and do not move.

What is lost is that the three no longer look like one thing, which a faint
*from "cellulose preparation"* above the group recovers — without the word
"chain" appearing anywhere. The owner should not have to hold that concept.

**One exception:** confirm before inserting into a trial already marked complete.
Adding three actions to finished work is almost always a mistake.

#### Two placements in one trial: a known limitation

Dyeing, then printing, then dyeing again with a *different* arrangement of leaves
cannot be recorded distinctly: `placements` is one flat list on the trial with no
link to a step. The owner reports this is rare, so it stays. Written down so it
is not rediscovered: if it ever becomes common the fix is a `stepId` on the
placement, not a new object.

#### Renaming Trials to "My work"

Done in 0.72.0, ahead of the flow, because the sidebar was what was being edited
at the time (§11a). The module id stays `trials`.

#### What building it changed

**Every screen has an address.** `editing` was a hidden flag, so the back button,
a reload and a bookmark all disagreed with what was on screen — the fault §8.0c
exists to prevent, still present in the one module that most needed it fixed:

```
#/trials                  1 · my work
#/trials/new              2 · new work
#/trials/new/<fabricId>   → 3, the cloth already chosen (the existing handoff)
#/trials/<id>             3 if unfinished, 5 if complete
#/trials/<id>/work        3 forced open on finished work
#/trials/<id>/finish      4 · finishing
```

Which screen a record gets is decided by the record plus the address, never by a
variable. Unfinished work opens ready to be worked on; the row is not a preview.

**The progress line is generated, never templated.** The prototype drew five
fixed stops with ticks on them, and its own screens showed why that is wrong: it
claimed decoration was reached on work with no decorative action, and the folded
process listed "decoration · no actions". A template also cannot express dyeing
before a print and again after it — two passes through colouring — which was the
owner's own correction when stages were introduced. Absence of a stage is not a
gap: work without decoration is not unfinished work.

**The colour that came out needed one field.** `resultColour` on the placement was
text only, so a finished card could only show what the reference *expected* while
being labelled with what came out. `resultHex` was added to the placement —
additive, optional, and the only route by which her own dyeing feeds the plant
swatches of §13g, which until now filled from literature and from 31 seeded
combinations covering ten plants.

**The colour is asked per placement, not per trial**, because that is where the
field lives, and it puts the reference's expectation on the same line as the
result — the comparison the whole library exists for.

**The cloth's state change applies to every piece.** `fabricIds` is a list and
twenty pieces in one alum bath is the case it exists for, so question five writes
one `stateEvent` per piece with `trialId` set. Fabrics remains the single owner of
a piece's state; the trial only says what it did.

**Composition is entered as fibre and percent**, not as prose. The prototype had a
free-text field; the fibre class, the dye-receptive fraction and the mixed
cellulose–protein warning are all derived from the structured form (§13.3) and
prose feeds none of them.

**Ready sequences are offered only in preparation**, from an add-action menu
opened in place, and are removed from the per-step dropdown entirely. Two
mechanisms for one thing is confusing, and it would let a single step "become" a
sequence. Records written before this keep rendering: a step carrying a `chainId`
alone shows the sequence name above its group as any other does.

**A step is one line, and opens in place.** Readable from a metre away over a
scale; everything the step carries is behind the line, one open at a time.

**The reader patches in place instead of rebuilding.** This is the fault the
change nearly shipped, and it is recorded in §13e.5.

### 8.1 Bundle construction

A bundle is layered, and the layers have roles. The trial's `fabricIds` list is insufficient — each
cloth in the bundle needs a role:

- **printing cloth** — the piece being made
- **receiving cloth** — a second cloth that picks up what transfers through
- **carrier blanket** — mordant or dye blanket (§5, recipe type 8)
- **barrier** — plastic, foil or old cloth, laid to stop adjacent layers printing each other

`BundleLayer` = `{ order, roleCode, fabricId | recipeId | materialCode, note }`.

The barrier matters more than it looks: whether a layer is separated or deliberately allowed to
print through is a design decision that changes the result, and it currently has nowhere to live.

### 8.2 Trial header
- Date, title
- Fabric(s) used → Materials (A.1), with weight of goods (WOF)
- Overall process type — immersion dyeing / eco print / eco print with blanket / paste print
- Technique(s) → Techniques (D)
- Water notes (source, hardness) — a real variable in natural dyeing
- Overall assessment: success / partial / failure, and why, in her own words
- Photographs of the finished work

### 8.3 Steps — the ordered process with timings
An ordered list. Each step records what was actually done, which may differ from the recipe it
came from. Recorded times are the real ones, not the intended ones.

Per step:
- **Type:** scour / tannin / mordant / dye bath / bundle & steam / bundle & boil / post-treatment
  (iron dip, alkaline or acid modifier, soaping) / rinse / dry / cure
- Recipe applied → Recipes (C), optional — a step may be improvised
- Materials used, with quantities (% WOF or grams)
- **Duration** — how long it actually stayed: in the mordant, in the bath, in the steamer
- **Temperature**, and whether it was held or allowed to cool in the bath
- **Post-bath rest** — many results come from leaving the goods in the cooling bath overnight;
  this is a separate figure from the heated time and must not be merged with it
- **Medium modification** (see 8.3)
- Step notes

Duration and temperature are the two variables the user most often changes deliberately, so they
are structured fields on every step — not free text.

### 8.4 Medium modification — a structured field, not a note
Anything added to the water, bath or steam that changes the chemistry is recorded as a small
structured group, present on any step:

- **Where:** dye bath / mordant bath / steam water / rinse / afterbath
- **Substance** → Materials (A.5): vinegar, citric acid, soda ash, lime, cream of tartar…
- **Amount / concentration**, and measured pH if taken
- **Intent:** free text — what she was trying to achieve

The vinegar-in-the-steaming-water trick is exactly this: a small acid addition to the steam medium
that shifts the outcome. Left in free-text notes it would be invisible to the reference engine
(§7), which means the app could never answer *"what does oak give on silk under acid steam?"* —
and that question is precisely why the trick is worth doing. Structured, it becomes part of the
combination identity and accumulates across trials.

Notes remain for the one-off observations that do not repeat and cannot be queried.

### 8.5 Placements — per-plant results
Because a bundle almost always carries several plants at once, observations must be attributable
per plant, not only per trial.

An eco print trial holds a list of placements. Each placement:
- Plant + part used → Plant Library (B) / Materials (A.2)
- Condition: fresh / dried / rehydrated; season of harvest
- Position on the cloth, and orientation (face down / face up) — free text or a sketch
- Any local treatment: dipped in iron, sprayed, folded onto itself
- **Result for this plant:** colour, print sharpness, contrast, bleed
- Observation notes for this plant

Everything in the header and steps (fabric, mordant, blanket, medium modification, timings) is
**inherited** by every placement — it applies to the whole bundle. Only what differs per plant is
recorded on the placement.

Each placement resolves to a Combination (§7) and contributes to it. This is what makes the
reference grow quickly: one five-plant bundle enriches five combination records at once.

When a trial has a single plant, the interface collapses this level and asks for the result
directly — the structure is present in the data, invisible in the UI.

### 8.6 Gallery view
The trials list is primarily **visual** — a photo grid, filterable by plant, fibre, mordant,
process type, medium modification, and resulting colour. This is how one actually recalls past work.

---

## 9. Module G — Library & Tools

Calculators are a primary feature, not an accessory — almost every recipe has to be rescaled
before it can be used, and doing that on paper each time is where errors enter.

- **% WOF calculator** — weight of fibre → grams of mordant/dyestuff at a chosen percentage
- **Recipe scaling** — open any recipe, enter the weight of goods, and every ingredient is
  recalculated in grams and millilitres. The scaled version can be carried into a trial as the
  step actually performed
- **Aluminium acetate preparation** — scaled to the fabric weight, since it is prepared rather
  than bought: proportions of alum and the acetate source, water volume, and the resulting bath
- **Solution calculator** — e.g. how much iron for a 1% solution in N litres of water; used for
  blankets and afterbaths
- **Reverse mode / limiting ingredient** — "I have 180 g of alum; scale everything else to it." In
  practice the cupboard, not the cloth, often sets the batch size. Any calculator that scales
  forward must also scale backward from whichever ingredient is the constraint
- **Dye-to-fibre ratio calculator**
- **Bath volume** — water needed for a given weight of goods at a chosen liquor ratio
- **Exhaust bath** — after the first dyeing the bath still holds pigment. A rule of thumb rather
  than a computation: roughly half the strength remains, so either a lighter shade on the same
  weight or a full shade on less. Presented as an estimate with its uncertainty stated, since the
  real figure depends on how thoroughly the first bath was exhausted

### 9.1 Where the boundary runs — calculator or recipe?

A **calculator** is a conversion with no author: % WOF, solution strength, bath volume, fresh-to-dried.
Nobody wrote these; they are arithmetic, and hard-coding them is right.

A **recipe** is a procedure with proportions that someone wrote: scouring cellulose at 2% soda ash,
a tannin bath at 7–10%, Michel Garcia's 1-2-3 indigo vat, a carrier blanket at 1–2% iron. These
look like calculators but are not: they have authorship, versions, sources, and steps. They belong
in Recipes and are served by **one** generic scaling engine, not by fifteen bespoke screens.

The aluminium acetate preparation is the deliberate exception. It is not proportions scaled by
weight but stoichiometry with substitution — changing the aluminium source changes the quantities
of the others — so it earns dedicated code.

**The blanket trap deserves naming:** a carrier blanket's iron solution is calculated against the
weight of *the blanket*, not of the art cloth. Same arithmetic, different weight of goods, and
getting it wrong is a common and expensive mistake. Blanket recipes therefore state their basis
explicitly rather than inheriting the trial's weight.
- Reference guides and glossary
- Backup: export / import, with a staleness reminder (the Глина lesson)
- Version info

---

## 10. Reference packs — separate export/import for knowledge

Reference content (plants, mordants, standard recipes, combinations) must be exportable and
importable **independently of personal data**. This is a distinct mechanism from the personal
backup in §9, not a variant of it.

### Why this matters
- The knowledge base grows slowly and by hand. Being able to ship an improved plant library to an
  existing installation without touching the user's own trials is the difference between a living
  reference and a frozen one.
- It allows knowledge to be shared between practitioners without sharing private work.
- It gives a clean route for the public version: the app ships with a base pack, and updated packs
  can be published later.

### Two independent channels

| | Personal backup | Reference pack |
|---|---|---|
| Contains | Materials in stock, trials, photos, own notes | Plants, techniques, standard recipes, combinations |
| Purpose | Data safety, device transfer | Knowledge distribution and update |
| Direction | Round-trip (own data out and back) | Mostly inbound (receive updates) |
| On import | Replaces / restores | **Merges** into the existing library |

### Requirements
- Every reference record carries a **pack identifier and a version**, plus a stable ID that survives
  re-import. Records are matched on that ID, never on name.
- Import is a **merge with a preview**: what is new, what is updated, what conflicts — shown before
  anything is written, never applied silently.
- **User edits win by default.** If she has edited a seeded plant entry, an incoming update must not
  overwrite it — it is flagged as a conflict and she decides. This is why the seed/personal
  distinction in §11.5 must live at the record level, and per field where feasible.
- Deletion never travels through a pack. A newer pack may add or revise, never remove her records.
- A user-authored subset must be exportable as a pack of her own, so her accumulated knowledge can
  be shared, published, or simply carried to another device.
- Packs are plain files (JSON), human-readable and diff-able. No server required.

### Bilingual implication
A published pack should carry both language variants, since the receiving installation may run in
either language. This is a requirement on *publishing*, not on authoring: the translation pass runs
over the records selected for the pack, immediately before it is built. A pack missing a language
for some records still imports — the receiving app falls back to the language present.

---

## 11. Cross-cutting requirements

1. **Offline-first, absolutely.** IndexedDB is the truth. No cloud dependency.
2. **Bilingual BG/EN** from day one in *structure*, not in obligation. Stored values are stable
   codes resolved through a dictionary; authored reference prose is stored as a `{bg, en}` pair
   whose second half may stay empty indefinitely. Free text stays in whatever language it was
   written. See §13.1.
3. **Two real form factors, laptop first.** Unlike Глина (a phone tool used at the wheel), this
   app is expected to be used more from a laptop — the reference library, recipe entry and
   bilingual authoring all want a keyboard and a wide screen. The phone matters for the studio and
   the garden: photographing results, checking a recipe mid-process, recording a plant on the spot.
   The layout must genuinely serve both — a wide reading and editing layout, and a narrow
   one-handed layout — not a phone design stretched across a laptop screen.
4. **Photographs are first-class.** Colour is the subject matter; a text description of colour is
   never sufficient. Multiple photos per trial, ideally with lighting notes.
5. **Seed data vs. personal data** must be distinguishable at record level (and per field where
   feasible), so seeded content can be updated without touching the user's own records. See §10.
6. **Backward compatibility** on every version, as in Глина.
7. **Derived, not duplicated** — no stored back-references; related lists computed on open.

---

## 11a. Navigation — two halves and a rule

Twelve flat sidebar entries told nobody what shape the application has. Grouped in 0.72.0 along the
line the data already draws:

**The reference part** — knowledge that is true whether or not this particular person owns anything.
It ships in seed packs, it is read at the desk, and another practitioner would recognise every word
of it: *Reference* (combinations), *Plants*, *Recipes*, *Substances*, *Stock*, *Techniques*,
*Calculators*, *Sources*.

**The diary** — her own work, never distributed: *My work* (trials) and *Fabrics*.

**Below a rule** — what belongs to neither: the backup and the packs. Housekeeping filed with one
half for want of anywhere else is how a sidebar stops meaning anything.

**Stock is parked, not placed.** By nature it belongs to the diary — `materials.js` opens with
"Personal, never distributed" — but it is listed beside Substances because that is where it is
going: folded into the substance record. Moving it to the diary first would move it twice. See §11b.

**The module under *Diary* is "My work", not "Trials".** The rename was agreed long before and held
back; it arrives here because the sidebar is what was being edited, and because "Trials" under a
heading reading "Diary" describes the schema rather than the act. The module id stays `trials` — it
is in every address and every backup, and renaming it would be a migration for nothing.

**Two addresses, one module.** The backup was the first of nine buttons in the calculator picker,
chosen from the same row as the WOF conversion — one module trying to be two things, the same fault
as the original "material" record (§13.4). Split in the navigation rather than in the code:
`#/tools` opens the calculators, `#/tools/backup` opens the backup. Which entry is lit is resolved
from the full address; a record address like `#/plants/<id>` matches no entry and falls back to its
module, which is what keeps a plant lit while it is open.

Giving the backup its own address is worth more than it sounds: it can be bookmarked, and it is the
one screen a person needs to reach in a hurry on a device they are about to replace.

**The phone bar carries the diary, not the reference.** It had held *Home · Reference · Plants ·
Recipes* — two of which are read at the desk — while *My work* and *Fabrics* sat behind "more", on
the one device where the work is actually recorded. Now *Home · My work · Plants · Fabrics · More*.
Plants stays: that one is read standing in front of the bed. Five is the maximum a narrow screen
carries, and the fifth is "more". The sheet behind it is grouped the same way as the sidebar, because
the phone is where a person is least able to hold twelve unlabelled tiles in their head.

**A heading is not a destination**, so it does not look like one — no hover, no cursor. And a heading
may not share a name with a module under it: the reference half is labelled *Reference library* while
the combinations module keeps *Reference*, for the same reason the diary is *Diary* and not *My work*.

**Guarded.** `check-boot.mjs` now counts the reverse direction: every module must be reachable from
the sidebar. There are more entries than modules, so a count alone proves nothing — a module with no
way in is a module that quietly stops being used.

---

## 11b. Stock, and why it is folding into Substances

Recorded because the owner asked what Stock was for and could not find the answer in her own
application — which is the finding, not the question.

**The record split stays.** §13.4 separated Substance from Stock for two reasons that have nothing
to do with navigation: a recipe points at a substance so it does not break when a jar runs out, and
a pack can ship substances without pretending the recipient owns anything. Both hold.

**The module does not.** Splitting records is not splitting screens. Глина models the same thing as
a field on the material plus a wishlist, with no separate module, and that is the better shape.

**Why the thread was lost.** Four things read the `stock` store: its own list, two counters, and the
Substances module — where it appears as a count in the list and a thin `<li>` *inside the edit form*.
Substances has no read view; §13c gave read mode to five modules and this was not one, so a substance
opens straight into a form and its jars are visible only while editing. **Stock is a ledger that is
only written to.** Nothing reads it back, and the field it exists for — this bottle's concentration,
vinegar at 5% or at 25% — reaches no calculator.

**The state is per substance, in four values.** *Have* (a jar with something left), *empty* (a jar at
zero), *wanted* (no jar, and it is wanted — titanium oxalate), and the silent fourth, *nothing said*,
which is most of the seeded library. The first two are derived from `remaining`; *wanted* cannot be
derived, because the absence of a jar does not describe itself.

**Wanted does not live on the Substance.** A substance is a reference record: seeded, distributed in
packs, subject to "restore base library". A personal flag on it would leak into an export and fight
the merge — exactly what §13.4 avoided. It lives in `stock`, which is already personal and already
never distributed, as a named `status` field rather than a boolean: with a boolean someone forgets to
filter, with a name they cannot miss it.

The honest cost: every reader of `stock` must then exclude wanted entries from jar counts and
low-stock logic. Four readers today, so it is affordable — but it is the kind of widening that
produces "the wishlist item showed up as an empty jar" six months later, hence the named field.

**Jars stay as records.** The tempting simplification — one checkbox on the substance and no jars at
all — loses this bottle's concentration, and that is the difference between a working aluminium
acetate and a wasted batch. Along with supplier, harvest date for foraged material, and batch.

What this needs, and why it is not a rearrangement: a read view on the substance, the jars as a real
block inside it, the state as a chip in the substances list, a filter for *don't have / running low /
wanted*, and the bottle's concentration reaching the calculator.

### Built in 0.92.0

**Substances is now Materials.** The shelf holds cochineal and bought indigo extract — neither a
plant nor a chemical — and "substance" pushed them out of the word. The owner named this: she buys
cochineal and wants to know whether she has it. The model already held them (category `dyestuff`
does not require a plant); only the label was wrong. **The stores keep their names** — `substances`
and `stock` — because migrations only ever add.

**The material opens for reading.** §13c gave read mode to five modules and this was not one of
them, which is why the jars were visible only while editing. The shelf sits **first**, before
chemistry and safety: every other fact on the record is true whether or not she owns any.

**A jar has its own address** — `#/substances/<id>/jar/<jarId>` — rather than a panel inside the
material, because a screen without an address cannot be returned to, reloaded or bookmarked (§13q).

**Stock has no module.** Its entry left the navigation; "what is running low" is a filter over the
materials list, the way Глина asks it. `#/materials/<jarId>` still resolves — it finds the jar's
material and opens the jar there — because addresses already saved must not become dead ends. The
module is declared in `HIDDEN_MODULES` so the orphan guard does not read it as a module someone
forgot to link.

**The four states live in `stock-logic.js`.** Four things ask the same question, and four copies of
"running low" is four thresholds that drift apart. `wanted` is not a fifth degree of having — it is
what is said when there is nothing — so a wanted entry beside a real jar is ignored rather than
shown. "Nothing said" returns null and stays silent: a chip on every row reading *unknown* is noise
on four hundred rows.

**The threshold is both.** A jar carries `lowBelow` in its own unit; left empty, the fallback
fraction of 15% applies. Five litres of vinegar and five hundred grams of powder do not run low at
the same fraction.

### Found while building

**An address naming a deleted record threw**, and a thrown render leaves the *previous* screen in
place — so the application appeared to ignore the address rather than to have failed. Present in
Plants, Recipes, Techniques, Sources, Fabrics and Materials. All six now return to their list.

**Fabrics cannot be addressed at all.** It has no `open()`, so `#/fabrics/<id>` names a record the
module never hears about; its open record lives in a module variable. This is the hidden state
channel §13q exists to forbid, still present in one module. Recorded, not worked around.

**A guard passed for the wrong reason.** The check that a jar with no material lands on the list
watched where the address *ended up* — and a redirect into a material that does not exist is itself
sent back to the list, so the final address was right whatever the module did. It now records the
**first** step. Likewise the unit guard set both fields to `g` and would have passed with the copy
removed; it now writes `ml`.

Still open from the list above: the bottle's concentration reaching the alum acetate calculator,
which asks for a vinegar percentage and offers 9 while the jar knows it is 5.

---


# Part III. The data model

## 13. Data model

Written as entities and fields, storage-agnostic. IndexedDB object stores map one-to-one onto the
top-level entities; nested lists are embedded, not separate stores, unless stated.

### 13.1 Conventions used throughout

**Identifiers.** Every record has a stable `id` (UUID) that never changes and survives export,
import and re-import. References are always by `id`, never by name — names are bilingual and
editable, and matching on them would break on the first translation or typo.

**Bilingual text — three kinds of text, only one of them costly.**

1. **Vocabulary and interface labels** — fibre classes, process types, chemistry classes, band
   names, every caption in the UI. Stored as codes, resolved to a language at render time. The user
   never writes them; they ship with the app. Bilingualism here is free, and it covers far more than
   it appears to: a plant record's tannin level, role, availability, seasonality and preferred leaf
   surface all display in both languages without a single word being translated.
2. **Personal free text** — trial notes, per-plant observations, assessments. Stored as a plain
   string in whatever language it was written, never translated. Unchanged.
3. **Authored reference prose** — a plant description, the wording of a recipe step. This is the
   only place where real double work exists.

For the third kind the storage shape is a pair:

```
{ bg: "дъб", en: "oak" }
```

**The second language is optional and never blocks.** A record saved with only `bg` is complete and
fully usable. The app renders whatever is present and shows a quiet indicator where a translation is
missing. Nothing in the application requires both halves to function.

**Translation is a step before publishing, not a step during entry.** A dedicated screen lists every
untranslated field, so the pass happens once, in bulk, with machine translation as a first draft —
and only for records that will actually travel. Since reference material defaults to
`distributable: false` (§13.1), the set needing translation is a small fraction of the library.

The pair shape is kept from the outset even while half of it stays empty, because converting a plain
string into a pair later is a migration of the entire database. The shape costs nothing; the
obligation would have cost a great deal.

**Controlled vocabularies.** Fixed lists — fibre classes, chemistry classes, process types, step
types, bands — are stored as **stable codes** (`tannin_gallo`, `fibre_cellulose`, `proc_ecoprint`).
The code is the data; the label is looked up per language at render time. Codes never change once
published, because they travel inside reference packs.

**Provenance.** Every record carries:

```
origin:        "seed" | "user"
packId:        string | null      // which reference pack it came from
packVersion:   string | null
editedByUser:  boolean            // a seeded record the user has modified
editedFields:  [string]           // which fields she changed — protected on pack update
distributable: boolean                       // may this record travel in a published pack?
```

There is no `sourceRef` and no `learnedFrom` — see §13r.

**Attribution belongs to the library, not to every record.** The original model put a source and a
`distributable` flag on each entry, defaulting to *not* redistributable. That was wrong on the
facts. Proportions and sequences are not authored works: "6% aluminium acetate, then a chalk bath"
is a fact, independently arrived at by many people. Boutrup and Ellis did not invent it — they
systematised it and cite their own sources. Chandra Rice learned it from them. The next
practitioner learns it from her. Nobody in that chain owns the recipe, and treating each link as
an owner misrepresents how the craft actually transmits knowledge.

What *is* protected is **text** — particular wording, order of exposition, and the selection and
arrangement of a whole collection. Fifty recipes transcribed from one book is a problem even
though each one alone is a fact. Recipes written in the app's own words are not.

The model therefore becomes:

1. **A general Sources section** — books, courses, people and sites the library rests on, listed
   with thanks and links. This is the honest form of credit, and the right scale for it.
2. ~~A free-text `learnedFrom` on the record.~~ **Removed in 0.87.0 — §13r.** The reasoning
   below was right and did not go far enough: a free-text field still holds one answer, and the
   usual case has several at once.
3. **Redistributable by default.** `distributable` inverts to an opt-*out*, marked only where there
   is a real reason.

Two cases still warrant asking rather than assuming, and both are courtesy and accuracy more than
law: **whole transcribed text**, and a **named authored system** — Michel Garcia's 1-2-3 vat is his
specific achievement and carries his name.

Practically: a record is opted out of distribution when it reproduces someone's wording verbatim,
or when it is a named system whose author has not been asked.

`editedFields` is what makes §10's merge policy possible: an incoming pack may update any field the
user has not touched, and must flag the rest as a conflict rather than overwrite it.

**Timestamps.** `createdAt`, `updatedAt` on everything.

**Favourites.** `favorite: boolean` on Plant, Recipe and Combination. Personal, never distributed
in a pack, and never a substitute for search: it marks the handful one reaches for constantly, or
the ones that have given the best results. It earns its place because a reference consulted daily
develops a working set far smaller than the library, and walking past forty plants to reach the same
six is friction with no purpose. Combinations carry it too — a trusted result is exactly the thing
worth pinning.

**No back-references.** Related lists are derived by scanning, never stored — the Глина principle.
A plant's trials are found by scanning placements, not kept on the plant.

---

### 13.2 Plant

Reference entity. The botanical background behind any number of dyestuff materials.

```
id
nameCommon      { bg, en }
nameBotanical   string                  // Latin, single language
family          string
parts           [ PlantPart ]
role            [ "dye" | "ecoprint" | "mordant_accumulator" ]
chemistry       [ { classCode, level, note } ]   // level: trace|moderate|high|dominant
substantive     boolean | null          // dyes without a mordant?
cultivation     {
                  light, soilStructure, watering, soilPh,
                  invasive: boolean, invasiveNote {bg,en},
                  yearsToMaturity: number | null
                } | null
                // `propagation`, `care` and `pests` were removed in 0.83.0 — §13m.
// character   { bg, en }              // ~~SUPERSEDED by §13cg (1.0.0-rc18).~~
//                                     // „Как се държи" was a field AND a section
//                                     // of the same name, and appeared twice on
//                                     // fourteen records. The section stays —
//                                     // filled on all 57 against the field's 14 —
//                                     // and the field folded into it.
description     { bg, en }              // The plant as a plant, before it is a dye — §13ce
harvest         {
                  whenNote {bg,en}, processing {bg,en},
                  dryingRatio: number | null   // fresh weight ÷ dried weight
                } | null
dosing          [ { partCode, condition, extractionMode | null, percentWofMin, percentWofMax } ]
                                        // extractionMode: which method this dose is FOR (§13cc)
                                        // null = recorded without saying which
extractionModes [code] | null           // on the PART: which methods are possible at all —
                                        // a constraint, never a choice. null = not stated,
                                        // which is NOT „the ordinary way". [] is never written.
tempExtractC    { min, max } | null
tempDyeC        { min, max } | null
maxTempC        number | null           // hard ceiling; flagged when a step exceeds it
// seasonality  { harvestMonths, note }  // ~~RETIRED in §13cn (1.0.0-rc25).~~
//                                     // Two things were wrong with it. It was
//                                     // never built nested — the code carried a
//                                     // flat `plant.harvestMonths` and no `note`,
//                                     // so the spec described a shape that never
//                                     // existed. And the months belong to the
//                                     // PART: the leaf and the bark of one tree
//                                     // are not gathered in the same weeks
//                                     // (§13ce). See `parts[].harvestMonths`,
//                                     // `parts[].harvestNote` and
//                                     // `parts[].sourcedNotGathered`, with
//                                     // `harvestRegion` on the pack saying where
//                                     // the months were observed.
lightfastness   code | null             // poor|moderate|good|excellent|unknown
washfastness    code | null
toxicity        { level: code, precautions: [code], note {bg,en} }   // §13.2a
availability    code                    // grows_here | forageable_local | purchased
notes           { bg, en }
photos          [ photoId ]
```

`PlantPart` = `{ partCode, note {bg,en}, chemistry: [...] | null }` — a part may override the
plant-level chemistry, because bark and leaf are frequently not the same dye at all.

### 13.3 Fabric

**A separate entity from Material**, despite living in the same UI module. Its lifecycle, its
composition arithmetic and its per-piece identity have nothing in common with a jar of alum.

```
id
label           string                  // short human code written on the pinned tag, e.g. "П-042"
name            string                  // free description: "стар чаршаф", "тениска"
origin          "new" | "reclaimed"
originDetail    { supplier, purchaseDate } | { wasA, condition, priorUse }
form            code                    // garment | scarf | cut_piece | roll
composition     [ { fibreCode, percent } ]        // must total 100
structure       code                    // plain | crepe | jersey | twill | gauze | velvet | other
weightGsm       number | null
dimensions      { text }                // free — "40×180 cm", "size M"
weightG         number                  // the actual weighed mass; required for every WOF sum
quantity        { value, unit }         // count for pieces, metres for roll
baseColour      code                    // natural | bleached | predyed | dyed_by_me
state           code                    // derived — see below
stateEvents     [ FabricStateEvent ]
notes           string
photos          [ photoId ]
```

**Derived fields.** `fibreClass` (cellulose / protein / mixed / part_synthetic) and
`dyeReceptiveFraction` are computed from `composition` — never stored. A 99% cotton + 1% elastane
cloth is cellulose with a 99% receptive fraction; a 50/50 cotton-linen is cellulose at 100%; a
cotton-silk mix is `mixed` and the app warns that one mordanting route will not serve both.

`FabricStateEvent` = `{ id, date, stateCode, recipeId | null, trialId | null, note }`.

**Superseded by `FabricAction` in §13bd**, which is what the application reads and writes from
0.98.0. The old list is left in place for a version rather than removed, so the mapping can be
checked against real records before the only copy of a piece's history depends on it.

`state` is derived from the latest **box-moving** action, following the Глина single-owner rule:
when actions exist they own the state; otherwise the field set at creation does. Only a box-moving
action counts, which is the correction §13bd makes — under the old rule an iron afterbath recorded
after dyeing would have moved the piece into a box named after the bath.

### 13.4 Substance and Stock — two entities, not one

The original model made "material" a single record, and the interface built from it was confusing
for a reason that was structural rather than cosmetic: one record was trying to be two things.

**Substance** — what aluminium acetate *is*. Formula, hydration state, standard % WOF, which fibre
classes it suits, temperature ceiling, safety and disposal. This is reference knowledge: true
whether or not a jar is on the shelf, identical for every practitioner, and shipped in seed packs.

**Stock** — *this jar*. Which supplier, bought when, how much is left, what concentration this
particular bottle of vinegar is. Personal, never distributed, meaningless as reference.

The separation matters beyond tidiness: **a recipe points at a substance, never at a jar**, so a
recipe does not break when the jar runs out. And a seed pack can ship substances without
pretending the recipient owns anything.

```
Substance
  id, category, name {bg,en}
  formula, hydrationState, molarMass
  notes {bg,en}
  — dyestuff: plantId, defaultPartCode, dyeClass
  — tannin:   tanninTypeCode, plantId, colourCast
  — mordant:  mordantTypeCode, standardPercentWof, suitableFibreClasses[],
              colourEffect, maxTempC, handling[], disposalNote, safetyNote
  — modifier: phDirection, typicalUse {bg,en}, effectNotes {bg,en}

Stock
  id, substanceId
  form              // extract | dried | fresh | powder | liquid | crystal
  supplier, acquiredDate, harvestDate
  quantity { value, unit }, remaining { value, unit }
  concentrationPercent      // this bottle: vinegar 5% vs 25%
  batchNote, notes
```

Entering something for the first time costs two records; buying it again costs one, because the
substance already exists.

Category-specific fields:

- **dyestuff** — `plantId`, `form` (extract | dried | fresh), `partCode`, `harvestDate`,
  `concentration` (for extracts), `manufacturer`
- **tannin** — `tanninTypeCode` (gallo | ellagi | condensed), `plantId | null`, `colourCast`
- **mordant** — `mordantTypeCode`, `standardPercentWof`, `maxPercentWof`,
  `suitableFibreClasses [code]`,
  `colourEffect` (brightening | saddening | darkening | warming), `maxTempC`, `handlingCode`

  `maxPercentWof` is a **damage ceiling**, not a preference. Iron above roughly 2% WOF embrittles
  fibre: the cloth looks right when it comes out of the pot and tears a year later. The app flags a
  recipe or trial step that exceeds it, in the same way it flags a temperature above `maxTempC`.
  This is why the arithmetic behind iron does not need its own calculator — it is ordinary % WOF —
  while the limit very much needs to live in the data.
  (gloves | mask | ventilation), `disposalNote {bg,en}`, `safetyNote {bg,en}`

  The vocabulary must include **titanium oxalate** alongside iron, alum and aluminium acetate — it
  gives a strong orange with tannin, and it carries hard constraints the app should enforce rather
  than bury in prose: never heated above 70 °C, powder handled with mask and gloves. `maxTempC`
  exists so a recipe or trial step above the ceiling can be flagged. Iron carries a different
  caution — high concentrations degrade protein fibres over time — which belongs in `safetyNote`.
  Disposal differs by mordant and is not interchangeable.
- **modifier** — `phDirection` (acid | alkaline), `typicalUse {bg,en}`, `effectNotes {bg,en}`

### 13.5 Recipe

```
id
lineageId, version                      // versioning as in Глина
type            code                    // scour | tannin | mordant | dye | ecoprint |
                                        // pigment | paste | blanket
name            { bg, en }
appliesTo       [ fibreClassCode ]
ingredients     [ RecipeIngredient ]
steps           [ RecipeStepTemplate ]
liquorRatio     number | null           // litres of water per kg of goods
tempC, durationMin, phTarget
sourceRef       { text, author, url }   // always credited, never claimed as her own
notes           { bg, en }
```

`RecipeIngredient` = `{ id, roleCode, materialId | plantId | freeText, quantity, unit, basis,
basisRefersTo }`

**`basis`** is `percent_wof | percent_of_bath | grams_per_litre | ratio_to_dyestuff | absolute` —
this is what makes scaling possible. An ingredient expressed as `percent_wof` rescales with the
weight of goods; one expressed as `absolute` does not.

**`basisRefersTo`** disambiguates what a percentage is a percentage *of*: `finished_product` or
`raw_input`. This is not pedantry. A mordant recipe dosed at 5–8% of finished aluminium acetate and
one dosed at 15–20% of raw alum before conversion describe the same practice at a threefold
difference in number. Without this field the two are indistinguishable in storage and the
calculator produces a confident wrong answer — the worst class of error in an app whose purpose is
to be trusted as a reference.

**`roleCode`** is the function the ingredient performs — `aluminium_source`, `sodium_source`,
`acid_source`, `dyestuff`, `assistant`. A recipe specifies a role; several different materials can
fill it, with different chemistry. See §5.1.

`RecipeStepTemplate` = `{ order, text {bg,en}, tempC, durationMin, note }`.

**Blanket recipes** additionally carry `blanketKind` (dye | mordant), `concentrationPercent`,
`freshOrCarriedOver`, `useCount`.

**Versioning.** Editing quantities on a recipe that already has trials attached creates a new
version sharing the `lineageId`. Past trials keep pointing at the version actually used — otherwise
old results become unexplainable.

### 13.6 Technique

```
id, name {bg,en}, category code, description {bg,en},
appliesTo [processCode], sourceRef
```

Categories: resist, shibori, printing, bundling, post-treatment.

### 13.7 Combination — the reference record

```
id
key             CombinationKey          // see below — the identity
expected        {
                  colourText   {bg,en},
                  swatchHex    string | null,
                  variation    {bg,en},        // the range, not a single value
                  printQuality code | null,    // ecoprint only: sharp|soft|diffuse|none
                  lightfastness, washfastness
                }
influences      [ { factorCode, effect {bg,en} } ]   // what shifts it: temp, time, pH, iron
confidence      "literature" | "confirmed" | "contradicted" | "unverified"
sourceRef
notes           { bg, en }
```

`CombinationKey` — the identity, all as codes and **bands**, never raw figures:

```
{
  dyeSource:   { plantId, partCode } | { tanninTypeCode } | { materialId },
  fibreClass:  code,
  fibreCode:   code | null,          // cotton, silk — optional narrowing
  mordantCode: code | "none",
  mordantBand: code,                 // trace | low | medium | high
  processCode: code,                 // immersion | ecoprint | ecoprint_blanket | paste
  blanket:     { kindCode, band } | null,
  medium:      { phCode, whereCode } | null
}
```

Two placements belong to the same combination when their keys are equal. Bands exist precisely so
that a 1% and a 1.5% iron blanket land together; the exact figures stay on the trial.

**Band definitions** are themselves data (`BandDefinition`: `{ dimension, code, min, max, label
{bg,en} }`), seeded and revisable — they encode judgement, not fact.

**Derived on open:** the list of placements matching this key, with their trial dates and photos.
Never stored on the combination.

### 13.8 Trial

```
id
status          "planned" | "in_progress" | "complete"   // one record, three ages — §8.0a
date, title
intent          string                  // what she set out to do; written early, never re-asked
planPhotos      [ photoId ]             // attached diagrams and sketches — §8.0d
fabricIds       [ fabricId ]
weightOfGoodsG  number                  // total, the basis for every percentage
processCode     code
techniqueIds    [ techniqueId ]
water           { sourceCode, hardness, note }
steps           [ TrialStep ]
placements      [ Placement ]
assessment      "success" | "partial" | "failure"
assessmentWhy   string
resultPhotos    [ photoId ]
notes           string
```

`TrialStep`:

```
{
  id, order,
  stageCode,                    // raw|preparation|colouring|after|result — grouping only, §8.0b
  typeCode,                     // scour|tannin|mordant|dye|bundle_steam|bundle_boil|
                                // post_iron|post_modifier|soap|rinse|dry|cure
  done      boolean,            // intended vs performed; the figures themselves are corrected
  date      | null,
  recipeId | null,              // null = improvised, which must stay allowed
  materials [ { materialId, quantity, unit } ],
  tempC,
  heldMinutes,                  // active, heated time
  restMinutes,                  // time left in the cooling bath — a separate figure, never merged
  mediumMod: MediumModification | null,
  photos    [ photoId ],        // offered at every stage, required at none
  note
}

**There is no `plannedTempC` or `plannedMinutes`, deliberately.** See §8.0a: one figure per field,
corrected in place. The intended value is not kept.

**Three photograph sizes, because they are looked at differently.** A finished
piece is studied for colour and keeps 1280px. A step photograph shows an
arrangement — how the layers stacked, how tightly it was rolled — and 800px is
legible without making the backup unusable when a trial carries a dozen. A
placement stays at 480px. A plan diagram (§8.0d) uses the *result* size despite
being neither: it has writing on it, and writing at 800px is writing that cannot
be read.

**A trap worth naming, since it has now been hit twice.** `data-step-photo` is a
different attribute from `data-step`, and `[data-step]` does not match it — CSS
matches a prefix of an attribute's *value*, never of its name. Here that is what
is wanted, and `readForm` correctly leaves photo inputs alone. In §13f the same
rule silently defeated the unsaved-work guard. Any code that finds fields by
attribute name has to be checked against the real markup, not the pattern.
```

`MediumModification` = `{ whereCode (dye_bath|mordant_bath|steam_water|rinse|afterbath),
materialId, amount, unit, phMeasured | null, intent }`. Structured, not a note — §8.4.

**Placement fields are conditional on the process.** The concept is universal — a placement exists
to attribute a result to one dye source, which is equally necessary when a single bath holds both
madder and walnut. What is eco-print-specific is only a few of its fields: `position`, `facing` and
`printQuality` are not rendered for immersion dyeing. The process is already chosen in the trial
header, so the form knows which fields apply.

**Only four fields are required:** plant, part, condition, result colour. Everything else stays
collapsed until asked for.

**`position` is optional and hidden by default.** The placement photograph already records where
the leaf lay, far more precisely than a text field could. The field remains for the cases where a
sketch reference or a verbal note genuinely helps.

**Entry is photo-first for eco print.** The real sequence is: open the bundle, photograph the
result, then say what it was. The form follows that order — add photo → name the plant → write the
observation — rather than asking for a filled form before a photo can be attached.

**"Placements" is now "Plants and prints".** The old name described the schema:
for anyone outside the model it reads as a coordinate. Internal names are
unchanged — this is a label.

**The card appears only where the leaves are the composition.** For immersion
dyeing the centre of the work is the bath and the batch of dye material, and a
card headed "plants and prints" under a dye bath asks a question that process
never poses. Records that already hold placements keep showing them whatever the
process now says: nothing is hidden away from a record that has it.

**Photo-first must never mean camera-only.** The three photo inputs in the diary — the plan or
sketch, a step, a placement — carried `capture="environment"` from the day they were written. The
intention was right: standing over an opened bundle, the camera is what one wants. The consequence
was not. The attribute does not *prefer* the camera, it removes the gallery and the file system as
options, so **a photograph already taken could not be attached at all** — a plan drawn in a notebook
and shot yesterday, a diagram made on the laptop, a photograph of the bundle taken with the good
camera rather than the phone. Reported by the owner from real use in 0.71.0, and it had been true
for as long as the trial form existed.

Removed. Without it the operating system's own sheet still puts the camera first, with the gallery
and the files beneath it — camera-first as a default rather than as a wall. Guarded in `check.sh`
from 0.71.1, because the attribute is exactly the kind of thing that returns by being copied from a
neighbouring input, and because the symptom appears only on a phone, which is not where the app is
usually tested.

The general rule: **photo-first is about the order of the questions, not about which device supplies
the image.** Any screen in Stage 11 that offers a photograph inherits this.

`Placement`:

```
{
  id,
  plantId, partCode,             // always a Plant — never a Material
  materialId      id | null,     // optional, only when a stocked extract was used
  condition       code,          // fresh | dried | rehydrated | frozen
  extractionMode  code | null,   // which way the colour was got out, this time (§13cc)
  harvestSeason   code | null,
  position        string | null, // optional, hidden by default — the photo records this
  facing          code | null,   // face_down | face_up — eco print only
  localTreatment  string | null, // dipped in iron, sprayed, folded
  resultColour    { text, swatchHex | null },
  printQuality    code | null,
  observation     string,
  combinationId   id | null,     // resolved automatically when a key matches
  photos          [ photoId ]
}
```

Everything in the header and steps is inherited by every placement. Only per-plant differences are
recorded here.

**A placement points at a Plant, not a Material.** A leaf picked off the tree that morning never
enters stock and creating a material record for it would be pure friction — the effect would be
that exactly the most spontaneous experiments stop being recorded. What matters about that leaf is
its `condition` (fresh, dried, rehydrated) and, where relevant, its season, both of which live on
the placement itself. `materialId` stays available for the case where a stocked extract or a
purchased dried plant was genuinely drawn from inventory, and is simply left empty otherwise.

### 13.9 Photo

```
id, blob, thumbnailBlob, takenAt, caption, lightingNote, ownerType, ownerId
```

Lighting note matters: the same cloth photographed in shade and in sun reads as two colours.

### 13.10 Vocabulary and settings

```
Vocabulary: { code, dimension, label {bg,en}, order, description {bg,en} }
BandDefinition: { dimension, code, min, max, unit, label {bg,en} }
Settings: { language, defaultLiquorRatio, lastExportAt, changeCounter, schemaVersion }
```

Vocabularies and bands ship as seed data and travel in reference packs, so adding a chemistry class
or renaming a label is a data change, not a code change.

### 13.11 Reference pack format

```
{
  packId, packVersion, createdAt, author, description {bg,en},
  schemaVersion,
  records: { plants: [], materials: [], recipes: [], techniques: [],
             combinations: [], vocabulary: [], bands: [] }
}
```

A pack never contains fabrics, trials or photos — those are personal. Import merges by `id`, shows
a preview, and never overwrites a field listed in the local record's `editedFields`.

### 13.12 Modelling questions — resolved

1. **Fabric and Material are separate stores.** A fabric is an object with a biography: it holds a
   composition, moves through states, carries a pinned label and ends as a finished piece. A jar of
   alum only decreases. Forcing both through one shape would fill the code with
   *if-this-is-a-fabric* branches and show through in the interface. The UI still presents a single
   Materials module with tabs; the separation is invisible to the user. The cost — supplier, photo,
   notes and stock declared in two places — is accepted.
2. **No per-placement quantity.** Recording "three leaves" or "a handful" adds nothing for eco
   printing; the placement's identity is the plant, its condition and its position.
3. **A placement points straight at a `Plant`**; condition is recorded on the placement, and
   `materialId` is optional for stocked items.

---

## 13.2a Safety, as a level and a set of things to do

**Built in 0.74.0**, across all forty-eight plants.

The library previously carried a sentence of prose per plant, filled on forty-one
of them, which had to be written and then translated. The owner asked for a
colour instead. The answer is a colour, but the colour is not the data.

**Three levels, not a toxic/not-toxic flag.** One word would put eucalyptus and
madder in the same box when their risk differs in kind rather than in degree.
`low` · `caution` · `elevated`, as vocabulary codes — so the label comes from the
term table in both languages and no sentence is written per plant.

**The precautions are codes too**, as a multiple choice: gloves, ventilation,
mask for dust, separate vessels, do not ingest, photosensitivity, possible
contact allergy, the concentrate is not the leaf. This collapses what a fuller
proposal had as four separate risk fields — skin, ingestion, inhalation,
photosensitivity — into the form that changes what happens at the bench.
"Inhalation risk: dust" and "wear a mask when grinding" are the same fact, and
only one of them is an instruction. Coded also means they can be filtered: *show
me everything that wants a mask* is a real question to ask before starting.

**The hybrid cases are `low`, not rounded up.** Seventeen of forty-nine
assessments came back as "low or caution", and they all meant one thing: *the
leaf is low risk and the essential oil or the concentrated extract is not*.
Rounding those up would have put a third of the library at `caution` and emptied
the word. The level stays low and the distinction is a precaution code.

**Prose survives only where it says something new** — five plants: G6PD deficiency
and henna, which chestnut, which brazilwood species, and why madder and tansy are
marked at all. On the other thirty-eight it repeated the level in a sentence.

**The colour renders the code and never carries the meaning alone.** Weld-yellow
for caution, madder for elevated, neutral for low — not green, since the whole
interface stays neutral. The label always stands beside the mark: a colour cannot
be read aloud, searched, filtered, or exported, and one in five men cannot
distinguish some of these pairs.

**The profile states its own scope**, once: *an assessment for the practice of
dyeing and eco print — not a food or medical judgement*. Without that line a
reader could take `elevated` on madder as "poisonous", when what it means is that
the dry root powder should not be inhaled. Madder is the plant the application is
named after, and normal dyeing with it is not dangerous.

**What is not verified.** The assessments were compiled with citations to EMA and
PMC where they exist, and most rows have none. `confidence` is per field, so the
level can honestly say `literature`. The four at `elevated` — madder, tansy,
buckthorn, henna — are worth checking against a primary source before the library
goes to anyone else; the other forty-four carry less weight.

---


# Part IV. Architecture

## 14. Technical architecture

### 14.1 The two failure modes being avoided

Глина is a single HTML file of some 7,700 lines. It works, and its one-file discipline is the reason
it still runs untouched years after it was written. But it is at the limit: every substantial change
now means navigating a file too large to hold in view, which is where quiet mistakes are made. Багра
is materially larger — seven modules, a bilingual dictionary, calculators with real chemistry,
reference packs, a seed library. A single file would not survive it.

The opposite failure is worse and more common: a modern toolchain. A project with npm, a bundler and
a framework is pleasant for six months and unmaintainable after three years, when the build no
longer runs and an application that otherwise works can no longer be changed. For a personal tool
expected to last a decade, the build step is the liability.

### 14.2 The decision: native ES modules, no build step

Multiple files, loaded directly by the browser as ES modules. What is edited is what runs. No
compilation, no dependencies, nothing to go stale.

```
index.html            shell, styles, module entry point
app.js                bootstrap, routing, shared render loop
db.js                 IndexedDB, schema, migrations
i18n.js               dictionary, language switching
vocab.js              controlled vocabularies and band definitions
modules/plants.js     one file per module
modules/fabrics.js
modules/materials.js
modules/recipes.js
modules/techniques.js
modules/combinations.js
modules/trials.js
modules/packs.js      reference pack import/export with merge preview
calc/                 calculators — pure functions, independently testable
seed/*.json           the reference library, versioned as packs
sw.js                 service worker
```

**No framework.** Vanilla JavaScript, as in Глина, for the same reason: there is nothing to break.
With seven modules, however, a single shared rendering pattern must be fixed at the outset —
otherwise each module ends up looking as though a different person wrote it.

**Calculators are pure functions in their own directory.** The aluminium acetate arithmetic, the
%WOF scaling and the reverse limiting-ingredient mode carry real chemistry and real consequences
when wrong. Isolated from the interface, they can be verified directly.

**Seed data ships as JSON, not as code.** Reference packs are already specified as JSON files
(§10), so the initial load is simply the import of a base pack — one mechanism rather than two, and
the library can be revised without touching the application.

### 14.3 The two costs, accepted knowingly

1. **The service worker caches a file list, not a file.** Every release must keep that list correct.
   This is where the first deployment mistakes will happen, and it needs a check before publishing.
2. **`file://` no longer works.** ES modules require a server, so local testing needs a one-line
   command. On GitHub Pages nothing changes.

### 14.4 Unchanged from Глина

Offline-first with IndexedDB as the sole source of truth. Backward compatibility on every release.
Migrations that only ever add. Export and import as the safety net. Deployment as static files.

---


# Part V. Decisions, and the faults that produced them

## 13a. Versioning and installation

**One place holds the release number.** `version.js` exports `VERSION`; the sidebar shows it and the
service worker cache name is kept in step with it. Two numbers that can drift apart is one number
too many — a stale cache is invisible until it is expensive.

**Багра installs as a PWA.** Icons in the app palette, a complete manifest, standalone display. On a
phone this matters more than it sounds: the studio and the garden are exactly where a browser tab
is inconvenient, and where the app must work without a signal.

---

## 13b. What real use changed

Four sessions of the owner working with the app in the studio produced corrections that no amount
of specification would have found. They are recorded here because each one marks a place where the
model was built around the theory rather than around the hand.

**A recipe ingredient may be a plant.** The original model had ingredients point at substances
only, which made an entire category — dyeing with a plant — impossible to write down. "Madder
root at 50% WOF" has no substance to reference. Ingredient options now carry `plantId`, `partCode`
and `condition` (dried / fresh / extract), because the same plant at three different forms takes
three different percentages, and suppliers sell all three.

**Figures are pulled from the library, not retyped.** A plant record already holds dosing per part
and condition, extraction and dyeing temperatures, and a liquor ratio. Copying them into a recipe by
hand is how the recipe and the reference drift apart, so the recipe form takes them directly.

**A trial is one sequence, not a sequence beside a list.** Bundle layers began as their own section,
parallel to the steps. In practice, laying the cloth on foil, arranging the leaves and laying the
blanket *are* steps, in order, among the chemistry. The separate list broke the order in which the
work is done and remembered. Layers folded into steps, with new step types for the physical actions
and a role on each.

**A step may follow a chain.** Preparation is usually scour → tannin → mordant, already modelled as
a chain (§5.3). The trial's step selector offers chains and recipes together, because from the bench
they answer one question: what did I follow here.

**Writing a recipe must not cost the trial.** A step can open a blank recipe: the trial is saved
first, where to return is remembered, and saving the recipe comes straight back. Otherwise the
choice is between recording the work and recording the method, and one of them loses.

**Vocabulary named after action, not theory.** The seven enhancements were named after the
chemistry — "adjective carrier blanket" is precise and unusable at the bench. They now read as what
one does: *blanket soaked in dye*, *leaves dipped in mordant*. Substantive and adjective remain, but
on the plant record where they are a property of the dye, not on the screen describing an afternoon.

**Unmodelled things say so.** Paste printing needs a thickener, a stencil and a fixing step none of
which exist here. Offered silently it promises more than it delivers, so it carries a plain warning
instead.

**A single figure is not a range.** Filling only the upper bound produced "0–165 g", which reads as
a claim about a lower bound nobody made. Whichever box a lone number lands in, it is an exact
quantity.

---

## 13c. Four modes, and why they must be kept apart

Three independent reviews of the working app — two by other models, one by the owner — arrived at
the same diagnosis, which is worth recording as a principle rather than as a fix: **the interface
had become a screen-by-screen translation of the data model.** Every record opened as a form, so
administering the record looked like the main thing one does with it.

The app does four things, and they want different shapes:

| Mode | Shape |
|---|---|
| Finding an answer | Reference search: few inputs, ranked results, own results beneath the expected |
| Following a procedure | One column, quantity beside the step, legible from a metre away |
| Recording what happened | Result first, then conditions, then process |
| Editing library knowledge | A form — behind a button, never the default |

**Read mode is the default on every record with substance**: plants, recipes, fabrics, trials,
combinations. Back from the editor returns to reading the *same* record rather than to the list,
because one usually corrects a field and wants to see how it now reads.

Consequences worth stating:

- **A plant leads with what is wanted at the bench** — part, dose, temperature, ceiling — not with
  its taxonomy. It is edited once and consulted a hundred times.
- **A recipe's working view** puts the quantity beside the step that uses it. Two parallel panels
  force the answer to be assembled from two places at every step over a hot pot.
- **A fabric reads as a biography**: composition, then a dated timeline of its states, then the
  trials it went through. Its history is the point.
- **A trial leads with the result.** The photograph and the outcome are why one opens a finished
  trial; the process is why one keeps it.
- **A combination shows the owner's placements beneath the expected outcome.** This is the premise
  of the whole application made visible, and everything else exists to make it possible.

**The correction was incomplete, and this is the second half.** Read mode fixed how a record is
*consulted*; entry was left following the model — process type, then steps typed by bath chemistry,
then placements. That is the vocabulary of the craft's theory, not of an afternoon's work. §8.0a–d
carry the same principle into recording: one record from intention to result, named stages instead
of step types, the cloth as the entry point, and photographs on a single timeline. The test is
whether the app asks the artist to write anything twice. It should not.

### Naming follows the work, not the model

`Placements` is a correct name inside the model and an opaque one on screen; it reads as a
coordinate. The section is called *Plants and prints*. The same applies throughout: an enhancement
is described as *blanket soaked in dye*, not as an *adjective carrier blanket*.

### Succeeded and worth repeating are different questions

A technically clean result can be dull; a failed piece can reveal an effect worth chasing. A trial
therefore carries both an assessment and a separate *would I do this again* — unchanged, with
changes, no, not sure yet — and, when changed, what would change.

---

## 13d. Empty means unknown

The craft has too many unmeasured variables for the app to invent precision. The plant variety is
often unknown, the water hardness approximate, the temperature not watched throughout, the blanket
carried over from a previous bundle at an unknowable strength, the cloth an old sheet of unknown
origin, and the quantity of leaves "one full layer" rather than 83 grams.

Three rules follow, each of which was violated once and corrected:

1. **A blank is not a value.** An unrecorded pH is not a confirmed neutral bath. Treating it as one
   manufactured knowledge no source had, and made records match searches they had no business
   matching.
2. **A lone figure is not a range.** Filling only an upper bound produced "0–165 g", which asserts
   a lower bound nobody stated. Whichever box a single number lands in, it is exact.
3. **Confidence is per claim, not per record.** A plant's dyeing temperature can be well established
   while its preferred leaf surface is a guess. One marker over both would flatten exactly the
   distinction that matters.

---

## 13e. Silent faults, and the checks that now catch them

Each belongs here rather than in a commit message, because each is a *class* of
mistake this codebase invites, and because every one of them was invisible until
something else went looking.

**1. A radio group reads as its last option.** `readForm` walked every element
carrying `data-f` and assigned its value. A segmented control renders one input
per option, all with the same `data-f`, so the loop overwrote the chosen value
with the final option every time — whatever was clicked. Four modules shared the
pattern. The visible consequence is that **plant lightfastness and washfastness
have been recorded wrongly for as long as the segmented control has existed**;
values entered by hand are worth re-checking. The fix is one line — skip an
unchecked radio — and the lesson is that a generic reader over a hand-rolled
form has to know about input types it did not anticipate.

**2. A counter that advanced on being looked at.** The fabric tag number was
taken when the blank form was *opened*, so opening it and thinking better of it
left a hole in the sequence. Reserving an identifier is a write, and a write
belongs at save. Split into `peekLabel` (shows what the code will be, changes
nothing) and `reserveLabel` (takes it), with the form displaying the peek as a
placeholder — a promise the app then keeps.

**The check that would have caught the third.** `check-boot.mjs` proves the app
starts and visits each module, but stops at the list view. Read views and forms
are where imports are actually exercised, and a missing one there gives a blank
screen with nothing on it to explain itself — which is exactly what happened
when `segmented` was used in the trial form without being imported.
`deep-check.mjs` now opens the first record in each module, opens its editor,
presses the star, and asserts the two rules above as behaviour rather than as
diffs. It dispatches real events: calling `root.onclick` directly skips handlers
registered with `addEventListener`, and a harness that does so reports green on
a screen that does not work.

**3. A check that failed at random (found in 0.71.0).** After a click the harness
slept a flat 30 ms and then read the screen. A click starts an asynchronous
re-render whose promise the event dispatcher drops, so nothing could be awaited —
and for a year 30 ms was enough. The moment the plant list grew, the suite began
failing **twice in twenty runs**, on the favourites star in recipes and in the
reference, neither of which had been touched. The application was correct; the
check was not.

It now waits for the screen to *stop changing* rather than for a fixed number of
milliseconds: poll the rendered length, and return once it has held steady twice,
with a ceiling. Twenty runs before: two failures. Twenty after: none.

**5. A reader that treated the screen as the whole truth (0.73.0).** `readWork`
collected every `[data-step]` and `[data-place]` element on screen and *replaced*
the record's arrays with what it found. Correct for as long as every step rendered
all of its fields — and data loss the instant steps began rendering collapsed: a
trial with five steps and one open would have been written back holding one step.

Caught by the deep check within a minute of the collapse landing, because adding a
step to a stage stopped working; the same bug on a real record would have quietly
deleted four steps on save. It now patches the existing rows in place and ignores
indices it cannot see, and there is a check that writes five steps, opens one,
saves, and demands five back with their notes intact.

The general shape, worth naming because this codebase invites it: **a form reader
is only correct while the form renders everything.** Any progressive disclosure —
collapsed rows, tabs, a wizard — turns a rebuilding reader into a deleting one,
and the failure is silent because saving is exactly when it happens.

**6. Globals the harness did not have (0.73.0).** `navigate` calls
`new Event('hashchange')` when the address is unchanged. `Event` was not among the
globals the check harnesses define, so that path threw only under test and never
in a browser — a check failing on code that works is as costly as the reverse.
`Event`, `MouseEvent` and `CustomEvent` are now defined in both harnesses.

**7. A dictionary that only ever loaded into an empty store (0.76.0).** The
vocabulary was written on start under `if (await count('vocabulary') === 0)`,
while the comment directly above it said the opposite — that a term already
present is left alone, which describes topping up. The gate meant **every term
added after a person's first install never reached their database.**

`label()` returns the raw code when a term is missing, and the codes are English.
So the symptom was not "a term is missing"; it was *"there is English text in the
Bulgarian version"*, which is what the owner reported, on the enhancement
checkboxes reading `cloth_mordant` instead of „платът е мордантиран“. A search of
the translation files found nothing, because nothing was wrong with them.

Every safety term added in 0.74.0 would have done the same on her installed copy:
`elevated`, `dust_mask`, `separate_vessels`.

Now topped up on every start, the rule the seed packs already followed for
records, with her own edits to terms left alone. `check-boot.mjs` asserts that all
227 terms reach the database.

The general shape: **a fallback that produces plausible output hides the fault it
is covering for.** Returning the code was a reasonable thing to do and it turned
missing data into what looked like a translation gap. A fallback should be
correct, or visibly wrong — not quietly almost right.

**8. Two handlers, one property (0.78.0).** `root.oninput` was assigned twice in
the recipes module: once by the search box and once, further down, by the scaling
panel. The second assignment wins. The search box rendered, held its text, kept
the caret in place — and filtered nothing, while the code that should have
filtered read as perfectly correct.

Found only because the deep check asserted that typing *narrows* a list rather
than that a search box exists.

`check-scope.js` now fails the build if a module assigns `onclick`, `oninput`,
`onchange` or `onsubmit` more than once.

**9. A check placed after `process.exit()` (0.78.0).** The first version of the
guard above never ran: it sat below the line that ends the script. It reported
success on the very file that would have failed it, and the failure mode of a
check that does not run is indistinguishable from a check that passes.

Both of the guards added that day were therefore tested in **both directions** —
break the thing, watch the check fail, restore it, watch it pass. That is now the
rule for any new check: a guard that has never been seen to fail has not been
tested.

**10. A missing icon is a hole, not an error (0.79.0).** A `<symbol>` named in
code but absent from the sprite renders as nothing: no console error, no broken
image, just a gap beside a label that still reads correctly. Invisible in a
headless check and easy to miss on screen. `check-scope.js` now verifies every
mark named in code exists in the sprite.

Worth stating as a rule, because the cost is not the wasted minute. **A check
that fails at random teaches people to run it again** — which is the exact
opposite of what a pre-deploy gate is for, and it degrades quietly: the first
re-run that passes is the moment the gate stopped working. Any timing in
`deep-check.mjs` must be a condition, never a duration.

**11. A cache name that never changed (0.83.0).** `sw.js` carried
`bagra-v0.70.0` while `version.js` read `0.82.1` — twelve releases during which
the service worker file itself never changed. A browser installs a new worker
only when `sw.js` differs byte for byte, so devices went on serving the files
they already had. Invisible on a desktop, where a hard reload hides it, and
exactly the shape of fault that only appears on somebody else's phone.
`check.sh` now reads the version out of `version.js` and refuses to pass unless
the cache name carries it.

**12. An ignore file git never read (0.83.0).** The file was named `gitignore`,
without the dot, so `node_modules/` was never ignored and a single `git add -A`
committed 2 198 files. Nothing broke; the repository simply stopped being a
description of the app. The lesson is narrower than it looks: a configuration
file that is silently *not in force* looks identical to one that is being
obeyed, so its effect has to be observed rather than assumed.

**13. A form that erased what it never showed (0.84.1).** `seed` and `shell`
were used as part codes in the seeded library and were absent from the
vocabulary, so avocado read "seed, обвивка" — an English code in the middle of a
Bulgarian row. The display was the smaller half. `options()` built its `<select>`
only from the vocabulary, so a code it did not know appeared as no option at
all and the control fell back to the empty one: opening the record and pressing
save, without editing anything, deleted the part. A form that silently rewrites
data is worse than one that displays it wrongly, because the display is at
least visible.

Two guards, because there are two faults. `deep-check.mjs` now cross-checks the
codes *used in the data* against the vocabulary — counting vocabulary terms,
which the boot check already did, says nothing about whether the codes in use
have one. And `options()` keeps an unknown value as an option showing itself, so
it survives a save and reads as something wrong rather than as nothing.

**14. A work view whose controls did nothing (0.86.1).** The weight and
bath-volume fields stand on both the recipe record and the recipe editor, and
the handler for them replaced `.scaleblock` — which only the editor has. On the
record, typing a bath volume updated the context and redrew nothing. A
volume-scaled recipe with no `defaultLitres` therefore showed a dash beside its
substance for as long as anyone cared to type at it.

The failure is the shape that matters: it read as **missing data**, not as a
broken control. The chalk bath carries 10 g per litre and always had; the dash
said otherwise, and the first reading of the screen was that the quantity had
never been entered. A dead input that looks like an empty field costs more than
a visibly broken one.

Two smaller faults sat inside it. `Number('')` is 0, so clearing the field set
the volume to zero rather than to unset, and every quantity computed to nothing.
And redrawing the record put the caret back to the start of the field, which
makes a number typed digit by digit unusable, so the caret is restored.

Guarded by setting the volume on a rendered record and asserting the figure
moves.

**15. Bands were terms nobody could read (0.88.0).** Bands — concentration, pH,
duration, temperature — are terms with a range attached, and they live in their
own store because of the range. `label()` and `terms()` read the vocabulary
store alone, so every band code rendered as its raw English self: a chip saying
"калиева стипца (medium)" in the middle of a Bulgarian row, and the band and pH
dropdowns in the reference search silently offering **nothing**, because
`options('concentration', …)` found no terms for a dimension that does not exist
there. One cause, two symptoms, neither obviously related to the other.

`vocab()` now reads the two stores as one list; nothing else needed to know.

Found by generalising the guard from §13e·13, which checked plant parts alone.
It now walks every place a stored code is looked up against a dimension —
plants, combinations and recipes — and it immediately turned up a second thing:
`confidence: 'practice'`, carried by all thirty-one seeded combinations, was
never in the vocabulary either. A guard narrower than its own principle is a
guard that will be needed again.

**16. A specification section deleted by an edit (0.88.1).** Large edits to this
document are made by replacing an anchor heading with new text *plus* the
heading, so the new section lands above the old one. One such edit did not put
the heading back, and §13l — how the reference ships full, and the workbook
round trip — disappeared. Nothing noticed, because nothing was watching. The
decisions live in this file rather than in chat precisely so they survive; a
lost section is a lost decision, recoverable only from git and only if someone
happens to look.

`check.sh` now records the section letters and fails if any that existed before
is missing, or if two share a letter. Recovered from `83e0e64`.

**17. A guard that passed on alternate runs (0.88.2).** The work-view guard
reported "the record has no bath volume field" from time to time, and passed
the rest of the time. The field was always there. Two causes, stacked:

The guard read the DOM immediately after `settle()`, which drains what is
already queued — a render that starts a fresh chain of awaits finishes after it.
It now waits for the control rather than assuming it.

That alone did not stop it. The guard *before* it ended with
`location.hash = '#/recipes'`, and in jsdom that fires the router, which starts
a render of its own; that render landed after the next guard had rendered and
replaced the screen underneath it. Guards do not reset the address any more.

A guard that fails sometimes is worse than no guard: it teaches everyone to run
the suite again instead of reading it. Run three times consecutively before
being accepted.

**And an application-level fragility it exposed, not yet fixed:** two renders of
the same module can be in flight at once and the later-finishing one wins,
whichever was asked for first. It has not bitten in the browser, where renders
are not started a millisecond apart, but the module has no generation check and
nothing stops it.

---

## 13f. Protecting unsaved work

The heaviest item to come out of real use: forms here are long, and one stray
click on the sidebar discards an afternoon. The protection is **one guard over
the whole application**, not a rule each module follows, because a rule the
eleventh module has to remember is a rule the eleventh module will forget.

**How it knows a form is open: a Save button is on screen.** The first attempt
matched the data attributes `readForm` uses — `[data-f]`, `[data-comp]` and the
rest — and was quietly wrong, because the real attributes are `data-comp-pct`,
`data-place-photo`, `data-step-del`, and CSS matches a prefix of an attribute's
*value*, never of its name. About half the fields went unwatched, and the half
it missed were the nested ones: composition rows, placements, steps. The long
parts. The parts worth protecting. A Save button is the better signal — present
exactly when a form is, and unable to fall out of step with the markup.

**What counts as leaving:** the sidebar, the phone bar, Back, opening another
record, starting a new one, and the browser's own back button. A list filter or
a tab does not count; a list is not on screen while a form is. This distinction
matters more than it sounds: a guard that asks on ordinary clicks is worse than
no guard, because it gets dismissed reflexively and then goes unread on the day
it matters.

**Saving clears the state only when the form is observed to have gone.** Modules
save asynchronously and then re-render into the read view, so the click itself
proves nothing. Clearing on the click and undoing it on a timer was tried and is
a race: whichever way it is tuned, one answer is sometimes wrong, and the wrong
answer is silently discarded work. A save can also be *refused* mid-way — a
composition that does not total 100 — and the person is then still in the form
with the same unsaved work, which must stay protected.

**The browser's back button is refused by putting the address back**, since by
the time `hashchange` fires the navigation has already happened. `beforeunload`
covers closing the tab and reloading; the browser shows its own wording there
and ignores ours, which is fine — what matters is that it asks.

---

## 13g. What a plant can give

The owner's words: for someone who dyes, this is the most important thing on
the screen. It was in the database and not on it — the plant list carried a
column of chemistry classes, and the colours lived one click away inside the
record.

**Two sources, derived at display time.** A plant's own `colours` are the
owner's palette, written by hand, and come first. Combinations fill in the
rest, because a combination *is* an expected colour and carries a `swatchHex`
for exactly this purpose. Nothing is stored: there are no back-references in
the data, and a swatch cached on the plant would drift the moment a combination
was edited. As the reference library grows, the column fills itself in.

This mattered more than it looked. **Not one of the 48 seeded plants has a
`colours` entry**, so a column reading only from the plant would have shipped
empty across the whole library and looked broken. Reading combinations too
lights up 31 swatches on the seeded data on the first run.

Duplicates are collapsed by hex and the row is capped at six, so one
well-documented plant cannot stretch the column past everything else.

**A related fault, found while testing this.** The favourites filter was not
cleared by `reset()`, so leaving a module and returning left the list filtered
with nothing on screen to say why. Fixed in plants, recipes and combinations.
Any state a module keeps between renders belongs in its `reset()`, and the test
for it is whether the list can look short for a reason the person cannot see.

---

## 13h. Two plants, and what adding them exposed

Rose (*Rosa spp.*) and hazel (*Corylus avellana*), the first additions to the
seeded library since it shipped. Hazel is the more valuable of the two: it is
locally foraged and works as a dye bath, as an eco print and as a tannin
source, which is the shape of plant a reference should show strongly.

Three things the research notes assumed that the model does not have, recorded
because the next addition will meet them again:

**There is no `tannin_mordant` role.** The library already marks oak, sumac and
pomegranate as `mordant_accumulator`, so hazel follows them. The label reads
"accumulator", which is not quite right for a tannin plant — an accumulator
takes up aluminium — but consistency across the library matters more than one
imprecise word. Worth renaming if the vocabulary is ever tidied.

**`shell` was missing and has been added.** A hazelnut's green husk and its hard
shell are worked separately and give different things, so folding the shell into
`hull` would have lost a real distinction. Shells are also a genuine
waste-stream dye material.

**`availability` holds one code, not a list**, and there is no `aliases` field.
"Лешник" therefore lives in the name — `леска (лешник)` — following the
library's own convention, as in "кромид лук — жълти люспи". A field for a single
record would not have earned its place in the export.

**Colours were left empty, deliberately.** All 50 plants have an empty `colours`
array and their colour ranges live in the profile prose. Inventing hex values
for the two new ones would have lit up swatches (§13g) for colours nobody has
seen, and a reference that asserts what it has not observed is worth less than
one that says nothing.

The pack version moves to 0.2.0. `seedPack` adds absent records on every start,
so both plants reach an existing database rather than only a fresh install.

---

## 13i. The plant profile — list and detail

**Built in 0.71.0.** No schema change; the edit form was not touched. What
follows is the specification as agreed, then what building it changed.

### The fault to fix first

`renderRead()` builds its colour section from `p.colours` alone, while the list
built in 0.69.0 uses `plantSwatches(p, combinations)`. The two disagree, and
because almost no seeded plant has its own `colours`, the disagreement is
visible on the most common path: the list shows four swatches for oak, the
record is opened, and the colour section is empty.

This was introduced with the swatch column and is the smallest and most valuable
change here — **the detail must derive from the same two sources as the list**.
In the detail there is room to show the combination's context alongside each
swatch, which the list has no space for.

### The list is too much of a table

Eight columns: star, plant, gives, botanical name, role, parts, chemistry,
availability. That is a spreadsheet, and the question actually being asked of
this screen is narrower — *I have oak, walnut, rose and eucalyptus; which do I
use?*

Reduced to four blocks: **plant · what it gives · what for · part used**.
Chemistry moves to the detail. Availability becomes a filter or a small mark,
not a standing column — it matters when sourcing, not when choosing.

Swatches get larger: five or six chips rather than the current 15px squares,
naming the colour on hover or tap. Conditions stay out of the list; they belong
to the detail.

### The detail should answer four questions in order

*What is this? What does it give me? How do I use it? What else should I know?*

The present order is title, photograph, taxonomy, "for work now", then two equal
columns holding colours, chemistry, growing, cautions and the free text
sections. Technically tidy, and it tells no story — two equal columns leave the
reading order undefined, which is most of the scattered feeling.

One vertical hierarchy instead:

1. **Identity** — name, botanical name, photograph, role chips
2. **What it gives** — the derived swatches, each with its context (part,
   mordant, process). The first real block, not a panel in a column.
3. **How it is used** — for dyeing: part, fresh and dried WOF, extraction and
   dye temperatures. For eco print: print quality, facing, preparation, steam.
   All of this is already structured on the record; it is only presented as
   procedure rather than as fields.
4. **Why it works** — the chemistry, after the result and the use, not before.
5. **Gathering and growing** — season, harvest, propagation.
6. **More about the plant** — the free text sections, kept together rather than
   distributed between two columns automatically.

Blocks may hold two columns internally on a wide screen. The page itself has one
column, because the order is the meaning.

### Scope

Deliberately small: lighten the list, enlarge the swatches, move *what it gives*
to the top of the detail, derive it from both sources, and order the detail
vertically. The edit form is not touched. This is not a rewrite of the module.

### What the data said, and the block that filled itself

Counted before building, because the six blocks were specified against fields
the records mostly do not carry: `facing`, `harvestMonths` and toxicity level
are **empty on all fifty** seeded plants, dosing is present on thirty, and
`liquorRatio` on one. Built as specified, *how it is used* would have been half
empty and *gathering and growing* empty across the whole library — the failure
§13g exists to prevent, arriving by a different door.

The knowledge is not missing. It is in `sections`, and **the sections are not
anonymous prose**: the same headings recur across the library, because they came
from one guide written to one shape. "Багрилни качества" on thirty-five plants,
"Източници" on forty-one, "Рецепта" on fourteen, the six cultivation headings on
seven each.

So **the blocks fill themselves from the headings.** A lookup read at display
time maps a normalised heading to a block; parentheses and punctuation are
stripped first, so "Агротехника (отглеждане)" and "Агротехника" are one heading.
Both languages are tried. Across the seeded library this routes 83 sections into
*how it is used*, 34 into *gathering*, 28 into *why it works* and 41 into the
source note, leaving 38 in *more*.

**An unrecognised heading falls to `more`,** which is where every section used to
go — so a heading the table does not know cannot lose its text. That property is
what makes routing by title safe, and it is checked (§13e): four sections in,
four out, each in its expected block. The table is a living list, extended when a
heading recurs; it is data, not structure, and adding to it costs nothing.

**No migration, no writing back.** A record made before the question was asked
is not wrong, and a migration that guessed would turn a guess into a fact — the
same rule as the stage inference in §8.0b.

### Three departures from the plan, and why

**Cautions are their own block, immediately after the use.** Not in the list of
six. A warning read after the pot is on the heat is a warning too late.

**Two internal columns only where the prose is short** — *gathering* and *more*.
A recipe runs to nineteen hundred characters on madder and reads badly at half
width, so *how it is used* stays single-column however wide the screen.

**Fastness moved into the working facts, not into a block of its own.** It had
been sitting under "in the garden", which had become a bucket for whatever was
left over; fastness has nothing to do with a plot of ground. Its first home in
the redesign was *what it gives*, beside the swatches it qualifies — and that
was wrong for a reason only the rendered screen showed: forty-five of the fifty
plants have no recorded colour, so on those the block appeared containing
nothing but "moderate lightfastness", a heading answering a question nobody
asked. **A block with no content is absent**, exactly as the list column is
blank for the same plants, and fastness reads with the temperatures and the
ceiling instead.

That third one is the lesson of the round: the routing table and the block order
were both decided correctly on paper, and the only fault that survived to the end
was one that required looking at three real profiles side by side — a full one, a
thin one, and one in between.

### What the list became

Five columns: star · plant · what it gives · what for · which part. The botanical
name is a subline under the common name rather than a column, because identity is
one block and not two. Chemistry moved to the detail. Availability became a row of
filter chips under the role tabs, and is cleared by `reset()` for the reason §13g
gives — a list that looks short for a reason nobody can see. Swatches went from
15px to 26px, and to 20px on a narrow screen.

---

## 13j. Search, and where a filter is still better

**Built in 0.78.0**, in plants, recipes, techniques, and the plant picker inside
a trial.

Typing beats a row of chips once a list is long enough that scanning costs more
than three letters. Forty-eight plants in a `<select>` is a list you scroll, not
one you choose from — and that select sits in the middle of recording work, where
the interruption is most expensive.

**Chips stay where they answer something typing cannot.** "Show me only the
mordant accumulators" is not a word anyone would search for, so the role tabs in
plants, the categories in substances and techniques, and the states in fabrics
all remain. The availability chips in plants were replaced, because availability
was already a weak filter and the search covers the common case.

**What is searched is names, not prose.** Common name, botanical name, family. A
search that reached into the body text would return half the library for "кора",
which is worse than no search.

**The picker keeps the id, not the typed text.** A native `datalist` avoids
writing a custom dropdown, and works with a phone keyboard. The visible input
holds the name and a hidden input holds the id, because the form reader reads
`value` from whatever carries the data attribute. **A name matching nothing
restores the previous selection** rather than clearing it — losing a plant to a
typo would be a poor trade for the convenience of typing.

**Search text is a filter, and is cleared by `reset()`** for the reason §13g
gives: a list that looks short for a reason nobody can see. Checked.

---

## 13k. Marks, and what they may not replace

**Built in 0.79.0.** Sixteen marks across three dimensions — the six fabric
states, the five substance categories, the five technique categories — plus eight
for the calculators.

**A mark stands above its label, never instead of it.** Sixteen drawings nobody
has seen before are sixteen guesses; "tanned" and "dyed" are not obvious as
pictures, and a person opening the application for the first time has no way to
learn them. A picture also cannot be read aloud or searched.

**One mark means one thing everywhere.** The crystal that marks a mordant in the
substance filter is the crystal on the mordanted fabric state; the leaf that
marks a tannin is the same leaf. The fabric state mark now appears in the filter
row, the list, the record and the history, through one helper — five copies would
have drifted.

**The tools screen is a menu, not a grid of labels.** Each calculator is a row
with a mark, its name, and one line saying when to use it — sentences that
already existed as `tools.when.*` and were only shown *after* the calculator had
been chosen, which is to say after they could help. `#/tools` is the menu and
`#/tools/<calc>` is the calculator, the shape the backup already had.

**Never green**, here as everywhere: the interface must not put a colour opinion
beside a photograph of dyed cloth.

---

## 13l. Loading the reference, for other people

The owner's intention: the library ships **already full**, from many sources, so
that a new person opens a tool rather than an empty notebook. Plants first,
substances and recipes after.

**§13.1 has to be revisited for this.** Attribution today works three ways — a
standalone Sources register that is deliberately *not* a field on every record, a
free-text `learnedFrom` on recipes and combinations, and a prose "Sources"
section on the plants. That was right while the library was hers and the sources
were two. It inverts for distribution: once a pack reaches someone who was not in
the room, the provenance of each claim is the only thing by which they can judge
whether to trust it. A structured link to `sources` is proposed, with free text
kept for the cases where the honest answer is "this is how it is done here".

**Facts are free; expression and compilation are not.** "Oak bark holds tannins"
belongs to nobody. The wording of a book does, and so — in the EU — does a
substantially extracted database. The risk is not one sentence; it is
*systematically working through a single source*. Hence a floor: **no plant ships
with fewer than two independent sources.** Own words remains absolute.

**Where the swatches come from.** Three routes, and they are not equal:

1. *The plant's own palette* — a colour, a free-text condition, no key. This is
   what the guide text supports: "yellow-green to brown; black with iron salts"
   is honest as a colour with a condition and would be a fabrication as a
   combination, which needs fibre, mordant, band and process. Forty of the fifty
   plants had no colour at all, and this is the route that lights them.
2. *Combinations* — only where a source actually names fibre, mordant and
   process. Most plants will yield none, and that is the correct answer.
3. *`resultHex` on a placement* — her own dyeing, and the only route that
   produces `confirmed` rather than `literature`.

**A hex derived from a colour name is an illustration, not a measurement**, and is
marked as such. Drafting the names, conditions and citations is compilable work;
choosing the swatch is a judgement about colour, which is her craft.

**Where the sources disagree, that is information.** "Dosing in the sources ranges
from 8% to 20%" is more useful than a number chosen by whoever was compiling.
`confidence` is per field, not per record, which the schema already supported
before anyone noticed.

**The division of labour.** A four-sheet workbook joined on `code` — plants,
parts, sections, colours — with a column naming what each record is missing. She
edits Bulgarian and fills gaps; the English columns stay empty and are translated
on the way back in. The sections sheet is **one row per plant, one column per
standard heading**: the first version was one row per section, which is how the
data is stored and not how a person reviews it. Wide also makes unification
happen by itself — moving text out of the OTHER column into a named one is
exactly the edit that retires an odd heading.

**Completed in 0.82.0.** Forty-eight plants, no gaps: 242 sections, 132 colours, 97 dosing rows,
80 parts. Confidence per field throughout — `practice` where it is hers, `literature` where it is
compiled.

**Nothing is merged without being shown first.** The load-back script reports
every change and only writes with an explicit flag. On the first return it found
2,894 characters fewer than the record held, across nine plants — some deliberate
shortening, some possibly lost in moving text between cells. The two are
indistinguishable from outside, and the consequences are not, so the difference
went back to her as a list rather than being resolved by guessing.

**A sheet is a snapshot, and merging against a moved target deletes things.** The
workbook was exported before the constituent texts existed. Rebuilding sections
purely from it would have removed twenty-one texts written in between; keeping
every absent section would have undone her editing of sixteen headings. Neither
rule is right, because absence means two different things. Told apart by the
library as it stood *at export*: present then and absent now is a removal;
absent then and present now is a later addition. Any future round trip needs the
same snapshot — §13e.5 in a second costume.

---

## 13m. Five sections, and no exceptions

Reviewing the seeded library at 0.82.1 showed it was not one library. Thirty-two
plants carried exactly four sections; seven carried ten. The seven were the ones
the owner grows. Two different books had been bound together, and the join was
visible to anyone opening two records in a row.

**The rule adopted: a section either stands on every plant, or it does not
exist.** A reference is judged by its thinnest entry, not its fullest, and a
heading present on seven of forty-eight is not a section but a leftover.

### What left, and why

**Cultivation, propagation, care, pests** — four headings on seven plants.
These answer a *gardening* question, not a dyeing one. The app exists to answer
"oak leaves on cotton with aluminium acetate — what should I expect"; how to
propagate coreopsis is a different book. Writing them for all forty-eight would
also be absurd: nobody propagates an oak for dye, and avocado comes from the
kitchen. The texts were written out to `scripts/removed-sections.md` before
deletion — they are the owner's own work and are not thrown away.

**"Рецепта"** — fourteen plants, averaging 1 474 characters. This was the harder
call, because it read as the most valuable section in the library. It was
removed because it was a **fifth copy**. Dosing per part and condition,
extraction temperature, dye temperature and the ceiling already live in
structured fields, and `useNowCard()` renders them **directly above** the prose:
the madder record showed `root, dried: 50–100% WOF · 70–75 °C` and then two
thousand characters restating it. Not duplication in another place —
duplication on the same screen, one line apart.

A copy in prose is a copy that drifts, and it already had. On four plants the
prose and the fields disagreed, and in every case the *prose* matched the
owner's own guide while the *field* did not. Two were resolved as corrections
rather than as a choice between sources:

- **Japanese indigo** — the field read `leaf, dried 100–200%` with no fresh row
  at all, while the guide is explicit that the leaves are worked fresh and that
  drying costs dye strength. Corrected to `fresh 300–500%`, dried retained
  second.
- **Sumac** — the field read `leaf, dried 10–20%`, which is a tannin dose, not a
  dye dose. Corrected to `50–80%`. The tannin figure went into the character
  text rather than becoming a second row, because `dosing` has no dimension for
  *purpose* and two rows both labelled "leaf, dried" would read worse than none.

### "How it behaves" — a field, not a section

What the recipe prose held that no field did was **timing and temperament**:
soak the bark overnight, stir gently or it blotches, the bath is spoiled above
55 °C, the cloth may stand in the madder for a day. Most of it was boilerplate
repeated plant to plant; the departures were the knowledge.

This became `character { bg, en }` — a field on the plant, rendered inside the
*How it is used* block **below** the derived figures. Below, because the text
leans on the numbers: "must not pass the ceiling" means nothing until the
ceiling is on screen.

A field rather than a section, for the reason the whole rule rests on: something
that must be present on every plant is not a section. Sections are what a plant
*happens* to have to say.

### The harvest, and where the duplication actually was

The reported overlap between "Беритба и отглеждане" and "Беритба и обработка"
was not two sections. It was the *block heading* in the record, which read
"Harvest and growing", against the *section inside it*, which read "Harvest and
processing". With growing gone the block is simply **Beritba / Harvest**.

Harvest survives as the fifth section because it is dyeing knowledge — which
stage to pick at, how often, and what must be done the same day — and because
`harvestMonths` carries the *when* as structured data on 44 of 48. The section
holds only what the months cannot say. Forty texts remain to be written.

### The end state

`Багрилни качества` · `Използвани части` · `Багрилна съставка` ·
`Беритба и обработка` · `Източници`, plus the `character` field.

Three guards in `deep-check.mjs` hold it: no heading outside the five; the four
complete sections stand on all forty-eight; and the character text reaches the
record without a section to carry it. Harvest is named rather than counted while
the forty texts are outstanding.

`scripts/trim-library.py` performs the migration and is **re-runnable** — it
works towards a described end state rather than applying a diff, so a second run
reports nothing to change.

---

## 13n. What the prototype was right about

An outside prototype (v0.app, React and Tailwind, deployed separately) was built
as a second opinion on the interface. None of its code enters the app — the
stack is incompatible by design — but three of its choices were measurably
better and were carried across by hand.

The owner's reading was that it was *more legible*, its icons *more finished*,
and its rounding *overdone*. All three were correct; two of the causes were not
where they appeared to be.

**Legibility was line length, not typeface.** The prototype caps prose at 672px.
`.view` is 1080px and body text was running the whole of it — roughly 115
characters a line against a comfortable 60–75, past which the eye starts losing
the return sweep. A `--measure` token now caps `.prose` and `.sub`. This was the
largest single difference and cost one declaration. Heading size (23px → 30px on
a desk, 26px on a phone) and label tracking (.05em → .12em at 11.5px) followed
it.

**Rejected: a serif for headings, and a downloaded body font.** The prototype
sets headings in Fraunces and body in Geist with a Cyrillic subset. Ours is
`system-ui`, which means Segoe UI, SF and Roboto on three platforms — three
different Cyrillics, so the owner does not see what a reader sees. Fixable, but
it puts ~80 KB of `woff2` into the offline cache for a problem that line length
had already solved, and a serif heading is an identity decision rather than a
legibility one. Both deferred rather than refused.

**The icons were stroke weight and a plate, not colour.** Lucide at
`strokeWidth 1.9` against our 1.5, and the glyph sitting on a 36px plate tinted
with the primary at 10% rather than bare on the ground. No new colour was
needed — indigo already exists. Weight raised across nav, bottom bar and tiles;
the plate applied to the dashboard tiles.

**The rounding was overdone, and the swatches prove why.** The prototype's cards
are 24.5px and its swatches 19px, against a flat 8px here. Cards moved to 10px —
one step, not five. Swatches went the other way, to 3px: a 26px chip at a large
radius loses about a fifth of its visible area to the corners, and a colour
sample is the one thing on screen whose area must not be distorted.

**Not taken: dark mode and the dark sidebar.** The prototype ships both. A dark
rail beside the swatches shifts the perceived colour of what sits next to it,
and §15.3 already says why the working surface stays neutral. The light sidebar
stands.

---

## 13o. The layer with eyes

`deep-check.mjs` renders in jsdom, which has no layout engine. Every element is
zero by zero: nothing overflows, nothing overlaps, nothing is clipped, and a
stylesheet that failed to apply is indistinguishable from one that did. Every
fault of *shape* has therefore had to be found by hand on a phone — which is why
the diary's faults are all phone faults.

`screen-check.mjs` drives real Chromium at 390 × 844 and 1280 × 900 and asserts
what only exists once boxes have sizes: nothing past the right edge, rules
actually in force, text not overrunning its box, content not clipped by a pane
that should scroll, and room reserved for the bottom bar.

It found three faults in its first run, two of them in the *reference* half that
was believed checked:

- **The plants list was cut off, not scrolled.** `.panel.flush` carries
  `overflow:hidden` to round its corners over a table. On a phone the table is
  561px inside a 360px panel, so the last two columns — *what for* and *which
  part* — were simply unreachable. Clipped content gives no sign that anything
  is missing. Now `overflow-x:auto` below 820px; stage 4 replaces the narrow
  table with stacked rows.
- The same in substances (736px) and techniques (509px).
- **The tile plate collided with the count** — "Справо31ик" — because the 146px
  track had been sized for a bare 19px glyph. Caught only after a guard for text
  overrunning its box was added, which the first version did not have: measuring
  what leaves the window cannot see a collision in the middle of it.

**What it does not cover, and must not be trusted for:** the camera, the photo
gallery, real touch, and how any of it feels in the hand. The `capture` fault
would have passed here, since a file input looks identical either way. A real
phone remains the last word; this only stops the geometric faults from reaching
it.

---

## 13p. A required step is a step (0.85.0)

§5.4 calls the chalk finishing bath after aluminium acetate **mandatory, not
advisory**. The screen said otherwise. `chainFollowOns()` returned the follow-on
*recipes* and the chain view printed their names in a warning strip at the foot
of the page; the recipe view did the same. Nothing scaled them, so the 40 g of
calcium carbonate the bath needs appeared **nowhere in the application at all**.

A name in a footnote is advice. A quantity that is never computed cannot be
weighed. The rendering contradicted the specification, which makes it a fault
rather than an improvement, and it is the first thing fixed.

`expandChain()` replaces `chainFollowOns()`. It returns the sequence as it must
actually be worked — every planned step, and after each one, any recipe it is
not correct without, each scaled like any other step. The chain view, the recipe
view, and later the weighing list all read from it.

**Derived, never stored.** Writing the required step into the chain would be
double entry: the same fact held as `requiredFollowOn` on the recipe *and* as a
step on every chain that uses it, free to drift apart. It is expanded at open,
as with every other derived list (§4.6).

**Not numbered.** The numbers belong to the plan the owner built. Giving the
chalk bath a "4" would renumber her chain every time a mordant changed, so it
carries a turned arrow and says plainly that it is not optional. Numbering is
assigned before the async map, not inside it — a counter incremented after an
`await` hands out numbers in whatever order the promises settle.

**Not doubled.** A follow-on the owner placed in the plan herself is hers. Only
steps at or after the requiring one count as already-placed: scouring before
mordanting is not the chalk bath that follows it.

**One thing deliberately not built.** An injected step is not stored, so a
choice made on it has nowhere to live, and it falls to each role's first option.
Every follow-on modelled so far has a single option per role, so the question is
theoretical — but a follow-on with a real alternative needs the choice kept on
the requiring step before this is honest.

Four guards, each seen to fail: the required step is in the sequence; it carries
its own figures; it appears exactly once; and — separately, because logic
passing does not prove a screen shows it — the rendered record contains the
40 g.

---

## 13q. The address is the state (0.86.0)

`recipes.render(root)` took no address. `openId` was set by a click handler and
`mode` — recipes against chains — was a module variable, so `#/recipes/<id>`
opened nothing, the chains tab could not be linked, and neither survived a
reload or the back button. The fault §8.0d describes and Stage 11 fixed for the
diary was still standing in the reference half, unconverted because the diary
was the visible sufferer.

### `reset()` and `open()` were one flag doing two jobs

Fixing the addresses exposed a second fault in the router itself.
`hashchange` called `route(true)`, so **every** address change reset the module.
The comment said reset meant "entering a module from the navigation"; the code
applied it to movement *within* a module too. Making recipes addressable would
therefore have thrown away the search that led to a record every time the person
came back from it — a regression introduced by the fix.

They are now two questions with two answers:

- **`reset()`** — "I have arrived from somewhere else." Start at the list, drop
  the search, drop the filters. Called only when the module id changes.
- **`open(...args)`** — "this is what the address says to show." Called on every
  route change, **including with no arguments**, which is how a module returns
  to its list.

Calling `open()` with nothing is the part that makes the address the state
rather than a copy of it: there is no path by which the module can be showing a
record the address does not name. `tools.open()` had to be corrected to match —
it set the active tool but never cleared it, so `#/tools` after `#/tools/backup`
left backup open.

### The scheme

```
#/recipes                 the list
#/recipes/new             a new recipe
#/recipes/<id>            the record
#/recipes/<id>/edit       editing it
#/recipes/chains          the chains tab
#/recipes/chains/<id>     a chain
#/recipes/chains/new      a new chain
```

Chains sit inside the recipes address rather than forming a module of their own,
because `activeNav()` lights a navigation entry by module id: at `#/chains`
nothing would be lit, while `#/recipes/chains` keeps Recipes lit while its second
tab is open. The cost is one reserved id — a recipe cannot be called `chains` —
and ids are generated, so nothing can collide.

Back is a direction, not a stack: leaving the editor goes to the record, leaving
the record goes to the list, and a new recipe has no record to return to.

Four guards, each seen to fail: a record opens from its address; the chains tab
has one; an address naming no record shows the list; and the search survives
opening a record and coming back.

### Still to convert

`open()` exists on `trials`, `tools`, `recipes` and `chains`. It does **not**
exist on `plants`, `substances`, `techniques`, `materials`, `sources`,
`reference` or `packs` — seven modules whose records still open only by click.
The handlers are near-identical across them, so the conversion is mechanical,
but it is seven modules of mechanical and belongs in its own release rather than
riding along with this one.

---

## 13r. Attribution has one home (0.87.0)

§13.1 already argued that proportions and sequences are facts rather than
authored works, and moved credit from the record to a general Sources section.
It kept a free-text `learnedFrom` on the record as a lighter form of the same
idea. That was the part that was wrong, and the owner's own example is what
settles it:

> The same recipe is in the book; Chandra read the book and teaches it at a
> workshop; I heard it from her; but I have also read the book myself and taken
> a Maiwa course where they teach it too.

The field holds **one** answer. Whatever is written in it is incomplete, and a
field that cannot be right is worse than one that is absent, because it presents
itself as traceability. `learnedFrom` and the older `sourceRef` are both gone —
from `newRecord`, from recipes, techniques, combinations and chains, from the
forms, the read views, the recipes list column, and the strings.

**Sources carries all of it.** Seeded rather than left empty, because removing
credit in one release and adding it in the next leaves a library that thanks
nobody: Boutrup and Ellis, Chandra Rice, Maiwa, and the studio's own guide. The
list is a start and is expected to grow. A section can hold "this arrived by
three routes at once" in a sentence; a field on a record cannot.

**One exception, and it is not the same thing.** Plants keep their *Източници*
section. It answers a different question — not where the knowledge was learned
but **where the claim can be checked**. "This colour is documented there" is
verifiable and belongs on the record.

**`distributable` is an opt-out and stays.** Not as a legal instrument but as a
practical one: the owner decides what travels at the moment of publishing —
a pack with no recipes, or three as examples — and the flag marks the narrow
case where a record reproduces someone's wording verbatim or is a named authored
system. Five of the studio's seven recipes were marked *not* distributable,
including the tannin and chalk baths, which are facts many people have reached
independently; those were flipped back.

### Also in this release

`check.sh` walked `*.js` only, so a new `seed/*.json` could ship absent from the
service worker's list and simply fail to load for anyone offline — which is
everyone. `seed/sources.json` was the first file to expose it. The first layer
now checks every seed file against the cache list.

---

## 13s. Six rules for the interface (0.88.0)

An outside prototype was compared screen by screen against the application —
fourteen pairs of screenshots. Rather than redesign ten screens one at a time,
which is how a set of screens comes to disagree with itself, the differences
were reduced to six rules. Every screen is then reworked *against the rules*.

**1. Cards or a table, by what the content is.** We use tables everywhere and
the prototype uses cards everywhere; both are wrong as habits. Techniques *are*
their descriptions, and a table truncates them mid-word — "при ант…", "нароч…".
They become cards. Plants, Substances and Recipes are read by comparing values
down a column, and an aligned `Al₂(SO₄)₃·14H₂O` beats a card. They stay tables.
**Prose or an image → cards. Figures to compare → a table.**

**2. The primary action is pinned to the bottom of a long form.** Save sits top
right and scrolls away on the first long form a person meets.

**3. A short closed choice is chips, not checkboxes and not a dropdown.** All the
options visible at once, the chosen one filled. A dropdown hides the
alternatives, which is the wrong default for a reference whose job is "what
could I use instead".

**4. Colour carries state, and nothing else.** Three levels, from the palette we
already have: **madder** — something will be lost; **weld** — pay attention;
**indigo** — this is going well. No fourth. The prototype's fresher feel is
mostly this, not a wider palette, and using our own three does not touch §15.3.

**5. The icons are one family.** Consistent in Calculators and drifting
elsewhere. An audit, not a design exercise: list them, mark the strangers,
redraw them at one weight.

**6. The answer appears while the question is being asked.** Not after a button.

And a corollary of 4: **a warning says what will actually be lost, with a
number.** "Losing this device now means losing 3 trials and 5 photographs" is a
prompt; "no backup for a while" is a notice.

### Where the application already wins, and keeps its way

Plants reads more cleanly than the prototype's, whose thumbnail eats the column
and leaves "бояд…", "евка…". Calculators has more of them and is more compact.
The fabric form has a photograph field; the prototype has none. Substances at
26 rows reads better as a table.

---

## 13t. The reference screen answers while it is asked (0.88.0)

The screen the whole application exists for — "oak leaves on cotton with
aluminium acetate, what should I expect". It already returned exact and near
matches; the faults were in how they were presented.

**Results take the full width.** They sat in one half of a two-column split
while the four selects occupied the other, so every card was squeezed into
about 500 px. The question is short and the answer is long: the form is a
compact band across the top, the results run the width beneath it.

**The card leads with the source, not the colour.** It read colour-first, with
"madder, root" as a small grey line underneath. When the query does not name a
plant — the common case, and the one the near-matches exist for — the plant is
exactly what distinguishes one card from another. The swatch already carries the
colour, so the words carry what the swatch cannot.

**Conditions become chips** rather than a line joined with middots, per rule 3.

**Confidence becomes visible.** `confidence` has been on every combination since
the beginning and appeared nowhere on the search screen. A dot on the card, by
rule 4: weld for literature only, madder for contradicted, indigo for confirmed
by trials, and a quiet grey for unverified. The reference is a compilation until
the owner's own trials make it hers, and the screen should say which is which
without being asked.

**Each field says what "any" means for it** — "any plant", "any fibre class" —
rather than four identical "doesn't matter" rows.

Not adopted from the prototype: its right-hand pane holding the selected record.
Records here have their own screen, and a preview pane would be a second place
for the same thing to be shown and to drift.

The owner's intention: the library ships **already full**, from many sources, so
that a new person opens a tool rather than an empty notebook. Plants first,
substances and recipes after.

**§13.1 has to be revisited for this.** Attribution today works three ways — a
standalone Sources register that is deliberately *not* a field on every record, a
free-text `learnedFrom` on recipes and combinations, and a prose "Sources"
section on the plants. That was right while the library was hers and the sources
were two. It inverts for distribution: once a pack reaches someone who was not in
the room, the provenance of each claim is the only thing by which they can judge
whether to trust it. A structured link to `sources` is proposed, with free text
kept for the cases where the honest answer is "this is how it is done here".

**Facts are free; expression and compilation are not.** "Oak bark holds tannins"
belongs to nobody. The wording of a book does, and so — in the EU — does a
substantially extracted database. The risk is not one sentence; it is
*systematically working through a single source*. Hence a floor: **no plant ships
with fewer than two independent sources.** Own words remains absolute.

**Where the swatches come from.** Three routes, and they are not equal:

1. *The plant's own palette* — a colour, a free-text condition, no key. This is
   what the guide text supports: "yellow-green to brown; black with iron salts"
   is honest as a colour with a condition and would be a fabrication as a
   combination, which needs fibre, mordant, band and process. Forty of the fifty
   plants had no colour at all, and this is the route that lights them.
2. *Combinations* — only where a source actually names fibre, mordant and
   process. Most plants will yield none, and that is the correct answer.
3. *`resultHex` on a placement* — her own dyeing, and the only route that
   produces `confirmed` rather than `literature`.

**A hex derived from a colour name is an illustration, not a measurement**, and is
marked as such. Drafting the names, conditions and citations is compilable work;
choosing the swatch is a judgement about colour, which is her craft.

**Where the sources disagree, that is information.** "Dosing in the sources ranges
from 8% to 20%" is more useful than a number chosen by whoever was compiling.
`confidence` is per field, not per record, which the schema already supported
before anyone noticed.

**The division of labour.** A four-sheet workbook joined on `code` — plants,
parts, sections, colours — with a column naming what each record is missing. She
edits Bulgarian and fills gaps; the English columns stay empty and are translated
on the way back in. The sections sheet is **one row per plant, one column per
standard heading**: the first version was one row per section, which is how the
data is stored and not how a person reviews it. Wide also makes unification
happen by itself — moving text out of the OTHER column into a named one is
exactly the edit that retires an odd heading.

**Completed in 0.82.0.** Forty-eight plants, no gaps: 242 sections, 132 colours, 97 dosing rows,
80 parts. Confidence per field throughout — `practice` where it is hers, `literature` where it is
compiled.

**Nothing is merged without being shown first.** The load-back script reports
every change and only writes with an explicit flag. On the first return it found
2,894 characters fewer than the record held, across nine plants — some deliberate
shortening, some possibly lost in moving text between cells. The two are
indistinguishable from outside, and the consequences are not, so the difference
went back to her as a list rather than being resolved by guessing.

**A sheet is a snapshot, and merging against a moved target deletes things.** The
workbook was exported before the constituent texts existed. Rebuilding sections
purely from it would have removed twenty-one texts written in between; keeping
every absent section would have undone her editing of sixteen headings. Neither
rule is right, because absence means two different things. Told apart by the
library as it stood *at export*: present then and absent now is a removal;
absent then and present now is a later addition. Any future round trip needs the
same snapshot — §13e.5 in a second costume.

---

## 13u. The home screen, in two halves (0.88.1)

Eleven tiles in one heap, while the navigation beside them had been in two
labelled halves since 0.72.0. The home screen now reads as the same two: the
reference is what you read, the diary is what you write.

**The diary counts states, not modules.** "Trials 3" is not a question anyone
asks; "how much have I got on the go" is. The diary half shows *in progress ·
planned · complete*, each a way into the same module, plus the fabrics count.

**The warning says what will be lost, with a number.** With no backup at all,
everything goes and the totals are exactly right: "losing this device now means
losing 2 trials · 1 fabric". With a stale backup only the work since is at risk,
and the change counter is all that is known about it, so that is all it claims.
It carries the madder mark and tint — §13s·4's "something will be lost" level,
which did not previously exist as a note kind at all: everything was weld.

**Counted nouns agree with their number.** `plural(n, one, many)` in `i18n.js`.
Bulgarian needs the counted form rather than the plural after a numeral — два
плата, never два платове — and "1 записани платове" in a warning meant to be
taken seriously reads as though nobody proofread it. Guarded, because it is the
kind of thing that returns every time a count is put into a sentence.

---

## 13v. Chains come out from behind their tab (0.88.2)

A chain is the more useful unit — nobody mordants without scouring first — and
it sat behind a tab, so a person who never pressed the tab did not know chains
existed. They stand at the head of the recipes list now, one card each, showing
the steps they are made of as numbered chips. The tab stays, for managing them.

Cards rather than rows, by §13s·1: the steps are the content, and a table cell
would truncate them.

**The list says the conditions, not the version.** The column read *Version*,
which is not a question anyone puts to a list. It reads `70 °C · 60 мин · +30
мин` — what the recipe will ask of you, which is what a list is scanned for.

**`appliesTo` has two shapes and both are read.** The model calls it a single
code on a chain and a list on a recipe; the studio's own chains carry a list.
Handed an array, `label()` finds no term and returns what it was given, so a
bare English "cellulose" appeared in the middle of a Bulgarian line. Rather than
correcting data to match the model or the model to match the data — a decision
that needs the owner — the renderer accepts both and the discrepancy is recorded
here.

---

## 13w. Techniques become cards (0.88.3)

The clearest case for §13s·1. A technique **is** its description — how the cloth
is folded, what the modifier does to the colour, when the wax will melt — and
the table cut it at 120 characters mid-word: "при ант…", "нароч…", "смачкани,
пасирани или като студена …". Truncating the content is not presenting it.

Cards, four to a row at desk width and one on a phone, each with the category
mark on a tinted plate, the processes it applies to, and the description. Where
a description will not fit, CSS clamps it — the whole text is in the markup and
the record has all of it, so nothing is thrown away before it reaches the page.

Guarded on the longest seeded description: the card must carry it complete, and
must not contain an ellipsis. The distinction matters, because the fix could be
undone by putting the truncation back and letting the clamp hide the evidence.

Plants, Substances and Recipes stay tables. They are read by comparing values
down a column, which is the other half of the same rule.

---

## 13x. Backup says what is at stake (0.88.4)

The screen listed what it could do; it did not say what it was for, and its
warning was a notice rather than a prompt.

**The banner names the loss, with a number** — the same sentence the home screen
uses, and now the same madder mark: "no backup has been made · losing this
device now means losing 2 trials · 1 fabric". Photographs were not counted at
all, and they are the part nobody can reconstruct.

**The channel is described by the questions a second channel would answer.**
The prototype's strength here was two columns — personal backup against
knowledge packs — with the same four rows down each, so the difference explained
itself. Packs are out of the 1.0 plan, so there is no second column to draw; but
the rows earn their place alone. *Contains · What it is for · On import · Last
backup* say plainly what the import dropdown only implies.

**Storage that is not guaranteed is a danger, not a caution.** It was weld; the
browser silently discarding everything belongs to the madder level.

**One thing, one name.** The navigation said *Резервно копие* and opened a
screen headed *Архив*; *Моята работа* opened *Тестове*. A person cannot tell
whether they are where they meant to be. Guarded in both languages, because it
is drift that arrives one screen at a time.

---

## 13y. The diary answers three questions (0.88.5)

Two were already answered: what is running, as rows with a stage rail, and what
is done, as photograph cards. The third was missing.

**What is waiting.** Mordanted cloth does not keep indefinitely, and a piece
prepared and then forgotten is the most avoidable waste in the studio. The list
of prepared pieces existed only inside the *new work* screen — reachable only by
someone who had already decided to start something. It is now a short row on the
diary itself: at most six, oldest preparation first, each one press from a new
trial through the handoff that already exists (§8.0c). Cloth already carrying
unfinished work is not offered — that belongs to the section above, and offering
it is how three half-written trials end up on one garment.

Six at most, deliberately. This is a prompt, not an inventory; the inventory is
one press away in Fabrics.

**The verdict is shown for every answer, not only for yes.** A finished card
carried a bare ↻ when the trial would be repeated and said nothing otherwise —
so *no* and *yes, with changes*, which are the more useful things to see at a
glance, were both silent. And one line of the reason goes on the card: the
verdict says what happened to this piece, the reason is what transfers to the
next.

**Not taken from the prototype: expanding the row in place.** It looks
immediate, but the record has an address and expanding gives it none — no back
button, no link, no reload. §13q settled that.

### A colour that contradicted its own rule

`success` wore madder and `failure` wore the quiet grey of a settled thing —
exactly inverted. By §13s·4 madder means something is about to be lost, and a
colour used against its own rule teaches the reader to ignore the rule. Success
is indigo, partial stays weld, failure is madder.

---

## 13z. The icon audit (0.88.6)

Asked for as a matter of style — the marks read as one family in Calculators and
drift elsewhere — the audit found something structural first.

**Three marks were serving seven places.** `i-tools` stood for both Substances
and Calculators, `i-recipe` for both Recipes and Sources, `i-packs` for Stock,
Backup and Packs. §13.4 says a mark accompanies a label and never replaces it;
a mark that does not distinguish accompanies nothing, and reads as noise beside
a label doing all the work alone.

Four new marks — `i-substance` (a flask with sediment), `i-source` (an open
book), `i-stock` (a lidded box), `i-backup` (an arrow into a tray) — all on the
same optical box, 3.5 to 20.5, at stroke 1.9 with round caps and joins. Thirteen
navigation entries, thirteen distinct marks.

Guarded by reading `app.js` rather than the DOM: the footer and the phone bar
are not always rendered, and a mark can only be shared by two entries that are
rarely on screen together — which is precisely when nobody notices.

The stylistic half of the request stands: the marks now share a weight and a
box, which was most of what read as drift.

---

## 13aa. The phone is the whole application (stage 4)

The roadmap's note on stage 4 narrowed it to the diary, on the reasoning that
*the diary's faults are on the phone* — the reference half is read at a desk and
had been checked there. **The owner has rejected that scope, and the
specification already agreed with her.** §13o records that the first run of
`screen-check.mjs` found three faults, two of them in the reference half that was
believed checked: the plants list 561 px inside a 360 px panel, substances at
736 px, techniques at 509 px, with the last columns simply unreachable. The fix
applied then was `overflow-x:auto` below 820 px, and §13o names it as a stopgap
in the same breath: *stage 4 replaces the narrow table with stacked rows*.

So the reference was inside stage 4 from the moment the sixth layer was written.
The roadmap note was wrong, not the plan. **Stage 4 covers every address the
application has.** Opening the reference on a phone and finding it unrendered is
the same fault as opening the diary and finding it unrendered; that one is read
in the studio and the other at a desk changes when it is noticed, not whether it
is broken.

### What that is, counted

Thirteen navigation addresses, plus the tabs inside Reference (search, records)
and Recipes (recipes, chains), plus the five screens of *My work*, plus an opened
record in every module. `screen-check.mjs` walks twelve routes today: backup, the
trial screens after `new`, and every opened record are outside its reach.

Eight modules render a `table.grid`: plants, substances, materials, sources,
recipes, chains, fabrics, reference. That is the bulk of the work, and it is
mechanical and identical across all eight, as §13q is.

### The order, and why the guard comes first

1. **Extend the sixth layer before changing any layout.** All addresses,
   including an opened record in each module and the five diary screens. A
   narrow layout corrected by eye and confirmed by eye is corrected once per
   person who looks.
2. **A control shorter than 44 px fails on the phone viewport.** Today
   `screen-check.mjs` prints "a control is 19 px tall" as a *note*, at both
   viewports. On a desk a 19 px target is a small mouse target; in a wet hand in
   a garden it is not a target at all. The threshold is a failure at 390 px and
   stays a note at 1280 px. Tested in both directions before anything is
   restyled.
3. **One shared narrow-list pattern, not eight fixes.** The table becomes stacked
   rows below the breakpoint, by one rule against `.grid`, so a ninth list
   inherits it instead of repeating the fault.
4. **The diary screens**, with a pass on a real phone after each step.
5. **Home, calculators and backup.**

### §13q moves ahead of the layout work

The seven modules without `open()` are heavier on a phone than at a desk. There
is no sidebar there: the system back button *is* the navigation. A record with no
address of its own cannot be left by it — back exits the module, or the
application, instead of returning to the list. Addressing the seven is therefore
part of making the phone usable rather than a separate tidy-up, and it lands
before the stacked rows.

### The narrow list, settled

**Below 640 px, not 820 px.** Between the two — a tablet, a half-width laptop
window — a table with horizontal scrolling is tolerable and keeps the comparison
down the column, which is what a table is for. Below 640 there is no column,
only a single view, and the question changes with it: at a desk *which of these
has the most tannin*, in the hand *is this the plant I am looking for*.

**Three levels to a row and no more.** What the record is recognised by; its
second identity beneath, in the secondary colour; up to three chips, the rest
counted. Figures that read only in comparison — weights, WOF doses, dates — drop.
The swatch never drops, because the application is about colour, and neither does
a state mark (§13s rule 4).

**A plant's row carries three miniature swatches, not one.** Forty-eight plants
hold 158 swatches between them; one would assert a single answer where the
record's honest answer is a range.

**All eight lists, one rule against `.grid`.** The question was asked whether
short lists — sources, materials — should stay tables, and the measurement
answered it: the narrowest grid has four columns, sources carries a URL column
wider than the whole viewport on its own, and fabrics has eight. None is short.
Two patterns to maintain would cost more than the exception saves, and a ninth
list built later inherits the rule rather than repeating the fault. Fabrics keeps
its selection column as a touch zone at the head of the stacked row: it is the
seed of the bulk actions still outstanding, and deleting it to make a row tidy
would have to be rebuilt.

### Step 1, built (unreleased)

`screen-check.mjs` walks 23 views instead of 12: every navigation address, both
tabs of Reference and of Recipes, the backup, `#/trials/new`, and an opened
record in each of the eight modules that has one. Records with no address of
their own are reached the only way a person can reach them — by pressing the
first row — which converts to an address once §13q lands.

**Three faults in the layer itself, found while widening it.** All three had the
same shape: the layer was measuring something other than what it claimed to.

- **It waited 280 ms and then measured.** The plants list draws 48 rows from
  IndexedDB and had not finished, so a good part of what four releases of this
  layer looked at was a half-drawn screen. It now empties the view, navigates,
  and waits for content to arrive and stop growing. The rewrite alone turned up
  faults on screens that had been reported clean.
- **It printed "12 views, nothing past the edge" underneath its own failures.**
  A summary line that does not know whether it is summarising success.
- **The small-control note counted, and did not name.** "A control is 19 px tall"
  was printed at every release since the layer was written and never told anyone
  which control. It now names up to four, with sizes.

### What it found, on the first widened run

- **A plant record made the page 459 px wide in a 390 px window.** One
  sciencedirect URL in the Sources block: an address has no spaces, so it sets
  the minimum width of everything above it. The record itself read correctly —
  what broke was the **bottom bar**, which is the width of the page rather than
  the width of the window, and carried its last button off the right edge. On
  that record, on a phone, the navigation was gone. Fixed with
  `overflow-wrap:anywhere`, applied to links generally rather than to this block,
  since the next long address will not be in a plant.
- **A button on the first screen of the diary read `common.cancel`.** The key had
  no translation, in either language, for as long as the screen has existed. A
  missing key returns the key, which renders, which is precisely the fault
  described in principle 3: a fallback that produces plausible output hides what
  it is covering for. A new layer now compares every literal `t('…')` in the code
  against **each dictionary separately** — the first version read the file as a
  whole and let a key present in English and missing in Bulgarian through, which
  is the wrong way round for an application used in Bulgarian.
- **Twenty-two views have controls a finger misses**, now that they are counted
  properly: 37 px buttons throughout, 34 px tabs and selects, and the favourite
  star at 19 px in a list and 22 px in a record. This is not a list of bugs so
  much as the shape of step 2, and it is deliberately left failing rather than
  silenced.

**The suite is red on purpose.** `check.sh` will not pass until the controls are
sized, and nothing is released from a red suite. Step 2 is what turns it green.

### Fixtures before measurement

Only two of the eight could be measured at 390 px — plants at 562 px, substances
at 721 px. Materials, recipes, fabrics and reference render an empty state in a
fresh install, so the sixth layer's "nothing past the edge" on those routes is a
statement about an empty screen. A guard that passes because there is nothing to
draw is the guard that has never been seen to fail. Step 1 seeds a fixture record
per module before it measures.

**Found while measuring:** `sources` is declared in `PACKS`, with a comment
saying it is seeded deliberately rather than left to the owner, but the boot loop
in `app.js` loads only substances, plants, techniques and combinations. The four
attested sources §13r depends on are never written. The specification says four
are seeded and the application ships none. Fixed in 0.88.7, below.

---

## 13ab. The pack that was declared and never loaded (0.88.7)

Found while measuring table widths for stage 4: four of the eight lists could not
be measured because they render an empty state, and Sources should not have been
one of them. The specification says four sources are seeded (§13r), the pack
exists, and the screen said the owner had not written anything yet. An empty
state is indistinguishable from a library nobody has filled, which is why four
releases passed without anyone noticing.

**The first half: a second list of the same thing.** `PACKS` declares five packs;
`app.js` looped over four names written by hand. Now it loops over
`Object.keys(PACKS)`, so declaring a pack is what loads it. A hand-written list
beside a declaration is a second thing to keep in step and the first thing to
forget.

**The second half, and the worse one: the pack broke the contract it was seeded
by.** `seedPack` identifies a row by `code`, forms `seed:` + that, and skips rows
already in the database. `seed/sources.json` carried `id` instead. The computed id
was therefore `seed:undefined` for all four rows, never matched anything in the
database, and the row's own `id` — spread in after — silently corrected the
record on the way to storage. So the records would have looked right, and **the
skip would have been defeated on every boot**: each start of the application would
rewrite all four sources over whatever was there, resetting `editedByUser` and
`editedFields` and discarding the owner's edits to a source she had adjusted.

That is a data-loss fault, and it was hidden behind a rendering fault. Had the
missing line simply been added, the application would have started overwriting
her sources at every launch and the check suite would have said nothing. The pack
is normalised to `code`, as the other four are. Nothing referenced the old ids,
and neither the seed nor the studio's own database held any source record, so
there is nothing to migrate.

**The guard.** `deep-check.mjs` now compares every declared pack against the
database after boot, counting rows rather than asking whether the store is
non-empty. Tested in three directions before commit: a hand-written boot list
that omits a pack (*sources: 4 of 4 never arrived*), a declared pack whose file is
missing (*seed/sources.json is not there*), and a pack that fails partway through
(*2 of 4 never arrived*).

---

## 13ac. A chip names, a box is pressed (0.88.8)

The widened layer left twenty-two views with controls under 44 px, and the
question it raised was whether a chip is a control. Rule 3 of §13s says *a short
closed choice is chips*, and a row of chips at 44 px each is tall.

**The question was wrongly put, and the application had already answered it.**
There are two things wearing one word:

- **`.chip` is a `<span>`** — the conditions under a reference result, a
  technique's category, a plant's precautions. It names something and does
  nothing when pressed. It is a **label**.
- **`.box` is a `<button>`** — the role filter in Plants, the state filter in
  Fabrics. Pressing it changes what the list shows. It is a **control**, and it
  is what rule 3 means.

So the principle is not a choice between them: **what changes the screen when
pressed is a control and is sized for a finger; what only names something is a
label and must not look pressable.** A row of labels at 44 px would be setting
prose for a finger; labels are outside the threshold entirely, which is why the
row of chips under a reference result stays as it is.

They look alike, which is how they get confused, and the confusion costs in both
directions: a `.box` that is not a button escapes the finger target, and a
`.chip` that is a button invites a press it is too small to receive. `check.sh`
now refuses either — tested with a chip made into a button and a box made into a
span.

### The 44 px rule

One block below 640 px, against `.btn`, `.tab`, `.box`, `.fav`, `.moreitem`, the
bottom bar, and text inputs and selects. Two things needed care:

- **The star is square.** A 44 px-tall target 22 px wide is still missed, so it
  takes `min-width` as well.
- **A checkbox cannot be stretched**, so the label around it carries the target —
  which every checkbox in the application already had except the fabric
  selection box, the seed of the bulk actions. It has one now. The layer measures
  the label rather than the input, because pressing a label toggles its input:
  measuring the box itself would report a fault that is not there and hide the
  one that is.

Twenty-three views, both viewports, clean. What remains on the desk is a note
rather than a failure: a 37 px button is a small mouse target and a fine one.

### A guard that fails at random

One run in a dozen reported *the fixture did not land* on a list that had
forty-eight rows a moment later. It asked once. It now polls for up to three
seconds — then failed again, on a different screen, once more in a dozen. The
cause is the service worker reloading the page mid-run, so three seconds does
not cover a whole boot. The budget is nine, and the address is asked for again
halfway through in case the reload landed elsewhere. A guard that fails
intermittently is worse than no guard: it teaches whoever runs it to run it
again rather than to read it. Ten consecutive clean runs before this was
written down.

---

## 13ad. The seven modules get their address (0.88.9)

§13q converted `trials`, `tools`, `recipes` and `chains` and left seven modules
whose records opened only by click: `plants`, `substances`, `techniques`,
`materials`, `sources`, `reference` and `packs`. It is mechanical work, which is
why it waited — and why it landed before the stacked rows rather than after. On
a phone there is no sidebar: **the system back button is the navigation**, and a
record with no address of its own cannot be left by it. Back exits the module, or
the application, instead of returning to the list.

Six are converted. `packs` is out of the 1.0 plan and has no records to address.

### The scheme, identical across all six

```
#/<module>              the list
#/<module>/new          a new record
#/<module>/<id>         the record
#/<module>/<id>/edit    editing it        (plants and reference)
#/reference/records     the records tab
```

**Editing is in the address, not in a variable.** It is a different screen:
leaving the editor with Back should reach the record, and a reload in the middle
of an edit should not silently drop into the read view.

**The reference tab sits inside the reference address**, as chains sit inside
recipes and for the same reason: `activeNav()` lights a navigation entry by
module id, so a separate address would light nothing. A record keeps whichever
tab it was opened from, because the two tabs are two ways in to the same records
and Back should return the way one came.

**Filters and search stay module state, deliberately.** They are how a list is
being looked at, not what is being looked at. §13q already established that they
survive opening a record and coming back.

### Three faults found on the way

**The conversion script reported success it had not achieved.** Written as a
script rather than typed six times, because a mechanical change made by hand is a
mechanical change made six slightly different ways. It printed *converted* for
`techniques` while inserting nothing: the pattern expected a comment above
`reset()` and that module has none. It had rewritten the click handlers, so the
module was left navigating to addresses that nothing obeyed. **A script that
reports what it intended rather than what it did is worse than no script — the
fault arrives wearing a success line.** It now asserts its own result and exits
rather than writing.

**`#/reference/records` resolved to the wrong screen, and had for as long as it
existed.** The sixth layer walked that address and reported it sound; without an
`open()` the module ignored it and rendered the search tab, so what was being
measured was the search screen under the records screen's name. Once the tab
worked, the screen appeared on a phone for the first time and overflowed: the
header actions ran 13 px past the edge and the tab switch clipped, leaving
"Записи" as half a word. The header actions now wrap below 640 px.

**Saving became leaving.** Every converted module changes the address after a
successful save, and the unsaved-work guard reads an address change as a
departure — so saving asked whether the person wanted to lose their work.
`dirty.js` cannot tell the two apart from outside; it infers a successful save by
watching the form leave the screen (§13f), which is right for a click and useless
for a hash change that happens first. Inside the module the answer is known, so
after a successful `put` the work is marked saved before the address moves.

### The guards

The six modules are checked mechanically, because six near-identical edits are
six chances to convert five of them. Each is asked three questions: does the
module have an `open()` at all, does an address open the record, and does an
address naming no record return to the list.

**The first question is not redundant.** The router calls `MODULES[id].open?.()`.
A module with no `open()` therefore fails *silently* — the address is ignored and
the list appears, which looks exactly like a working list. That is how seven
modules stayed unconverted through four releases without anything failing.

Tested in the failing direction, three ways: `open()` removed (*substances has no
open() — its address is ignored, not obeyed*), an `open()` that sets an id but
never clears it (*an address with no record left the last one open*), and a save
that does not clear the unsaved mark (*saving was treated as leaving*).

### And the guard for this had a blind spot

Inserting §13ad above §14 swallowed the `## 14. Technical architecture` heading:
the replacement matched the heading and did not put it back. That is §13l's
fault exactly, in the same way, with the guard written after §13l already
installed — and it said nothing, because it watched `^## 13[a-z]+\.` and the
section lost was §14. **A guard narrower than the fault it is named for is a
guard that will one day report clean over the thing it exists to catch.** It now
watches every numbered section, sub-numbers included, and was seen to fail on
both a lost §14 and a lost §13ad.

---

## 13ae. A list below 640px is not a table (0.89.0)

The last of the geometric work in stage 4. A table exists so that values can be
compared down a column; on a phone there is no column, there is one view, and
the question changes with it — at a desk *which of these has the most tannin*, in
the hand *is this the plant I am looking for*. Plants measured 562 px inside a
390 px window and substances 721 px, and the sideways scroll allowed in §13o was
always named a stopgap. It is removed here with its cause.

Each row becomes a card. Eight lists — plants, substances, materials, sources,
recipes, chains, fabrics, reference — under one rule against `.grid`.

### The heading has to reach the cell, and CSS cannot fetch it

`attr()` reads the element's own attributes; it cannot reach across the table to
the header row. So `labelCells()` in `ui.js` copies each column heading into its
cells at render. **Once, centrally, rather than written into the markup of eight
modules**: eight copies of one fact drift apart, and a ninth list built later
would inherit nothing.

**Watched, not called.** The first version ran after `render` in the router, and
that labels the first draw only — a module redraws its own list on every
keystroke of the search and every filter press without passing through the
router. The rows would have been unlabelled at exactly the moment someone was
narrowing a list to find something. A `MutationObserver` on the view now does it,
disconnecting around its own writes so it does not trigger itself.

### Three judgements, each made from a measurement

- **The lead cell is decided by position, not by a class.** The first cell whose
  column has a heading heads the card, at reading size and with no label over it:
  a card reading "ИМЕ  дъб" is a form, not a plant. The star and the selection
  box have no heading, so they are skipped automatically and sit in the corner of
  the card, keeping their 44 px target.
- **An empty cell is dropped.** In a table the empty cell is the shape of the
  column and must stay; in a stack it is a line spent saying "МОСТРА —".
- **Prose is clamped to four lines, by length rather than by class.** `.clip`
  exists on some tables and not others: the sources note carries none and came
  out 405 px per row, one record filling half the screen. Length is the fact that
  matters, and it is the same fact in every list. 405 px became 192.

Nothing else is dropped. Which columns a phone does not need is a judgement to
make with the lists in the hand, not one to guess at here.

### The guard

Every other assertion in the sixth layer would pass on a list that had quietly
gone back to being a table — it would simply scroll sideways inside its panel,
which is the arrangement the stopgap allowed. So the layer now asserts the shape
itself: below 640 px a row is `display:block`, some cell heads it, and a
non-leading cell renders its heading; above 640 px the row is still a
`table-row`, because a phone rule that reaches the desk is the same fault
mirrored. Seen to fail in both directions — the stacking rule removed, and the
lead cell removed.

**And a fault in the harness, not the app.** `watchLists()` broke both jsdom
layers with *MutationObserver is not defined*: jsdom has it, but the harness
hands globals over one at a time, so a gap in the harness reads as a throw during
start-up. The same case as `Event` in §13e.4, and fixed the same way.

---

## 13af. The calculators did not calculate (0.89.1)

Reported by the owner: *the calculators do not work — either a recompute button
is missing or something is not thought through, because if I change the default
values nothing happens.* Both halves of that guess were wrong and the diagnosis
was right. Nothing happened.

**There was no `input` handler on the calculators at all.** The `change` handler
returned early for anything that was not a `<select>`. So every number on every
one of the seven calculators — weight of goods, percentage, litres, ratio,
vinegar strength — could be retyped and the answer would not move. Only the two
dropdowns did anything.

**The comment above it said the opposite**, and had since the calculators were
written: *recompute on every keystroke: a calculator that needs a button pressed
is a calculator that gets used once and then done on paper again.* The intention
was recorded, the code never carried it out, and the comment is why it survived
four releases — the file was read and believed. A comment is not a guard, and
this is the second time in this stage that a stated intention has stood in for a
tested one (§13ad).

It is also rule 6 of §13s, in the module the rule most obviously describes.

**A second fault underneath it.** The timer's minutes field is written as
`data-calc="timer.minutes"`, but the timer keeps its own object rather than
living in `state`, so `state['timer']` was undefined and writing to it would
have thrown. It never threw, because nothing ever called `apply()` for a number
field. Fixing the first fault would therefore have replaced silence with an
exception on the timer screen. The group is now resolved by name.

**The caret has to be put back.** Recomputing redraws the panel, which replaces
the very input being typed into: without restoring focus and selection the field
is lost on the first keystroke, which is worse than not recomputing at all.

### The guards

Driven through the events a person actually generates, not by calling `apply()`
directly, because the entire fault was in what was listened for. Three, each
seen to fail: the reading on screen changes while a number is being typed; the
field being typed into keeps its focus; and the timer face takes the minutes it
is given.

### Calculators and backup on a phone

Checked at 390 px and sound as they stand — nothing past the edge, nothing
clipped, every control at 44 px since §13ac. The picker, the seven calculators
and the backup needed no narrow layout of their own, which is the answer stage 4
wanted from them rather than a lack of one.

---

## 13ag. The diary shows the work, not the plan (0.89.2)

Four things reported by the owner after real use, three of them one fault each
and the fourth held back as its own conversation.

### The picture that stands for a piece of work

The list led with `planPhotos[0]` while work was running and `resultPhotos[0]`
once it was finished — the plan, and the *first* result rather than the last. So
the diary was illustrated with what was intended instead of what happened, which
is the opposite of what a diary is for.

Her rule: the last photograph of the finished work, or the last in the sequence
if it is not finished, and the cloth's own shot before either exists.

**No new rule was needed.** `photoTimeline()` in `fabric-logic.js` already orders
every photograph of a piece — the cloth, the plan, the placements, the steps, the
result — by date with rank breaking ties, and it was used only by the fabric
record. The cover is its **last item**, and the fallback then falls out rather
than being written: work with nothing photographed yet has only the cloth's shot
in its timeline. One function, one call, no second branch to keep in step.

### Reading how a piece developed meant opening every step

The `.lifestrip` — the whole life of a piece in pictures, in the order it
happened — was built, styled and rendered **only on the cloth**. The trial, which
is where the pictures are taken, had none: the result photographs after the first
were shown as a loose grid with no order and no captions, and everything in
between was behind a step that had to be opened one at a time.

The trial now carries the same strip, from the raw cloth to the result, each
frame captioned with the stage it belongs to. The steps stay folded for what they
carry besides a photograph.

### Finishing, from the list

Closing a piece meant going round through the cloth. There is now a **Finish**
action on the running row, and it goes to screen 4 rather than setting `status`
where it stands: the five questions are what finishing *is* — the result, the
verdict, and the cloth's change of state. A row that marked work complete on its
own would leave all three unasked, and §8.0e's rule that Fabrics owns a piece's
state would be quietly broken by the diary.

It sits beside the row, not inside it, because the row is itself a button.

### The entry form was long because one rule was applied to half the screen

§8.0e says **a step is one line, and opens in place, one at a time**. Placements
were never given the same treatment, so seven of them rendered open at once —
each with plant, part, condition, facing, print quality, local treatment, a note
and a photograph. On the owner's own screenshot that was most of the length of
the form.

A placement is now one line: the photograph where a step has its number, then the
plant, the part, and what the reference expects of it. Opening one closes the
step that was open, and a newly added placement opens itself, since a placement
added closed is a placement nobody can fill in.

**This is not a redesign; it is a decision from 0.73.0 finally applied to the
thing beside the one it was written for.** Which is worth naming as a pattern:
both this and §13ad were rules that existed, were believed, and had never been
checked on every place they claimed to cover.

### Held back, deliberately

The larger observation — that the active trial reads as **a form to fill in**
where the prototype reads as **a story to follow** — is not a fault to be patched
and is not attempted here. Two modes of one screen, entering and reviewing, is a
design conversation the owner has asked to have separately.

---

## 13ah. Three from the open list (0.89.3)

### The render race

Two renders of one module could be in flight at once, and the one that finished
last won rather than the one that was asked for last. Every `render()` is
asynchronous — it reads the database, resolves vocabulary, waits on photographs
— and writes `innerHTML` only at the end. It never bit in a browser, where a
person cannot press twice that fast; it bit in the check suite, which can.

The router now carries a **generation**, so a render that has been overtaken
abandons rather than draws, and a **chain**, so the next starts only after the
previous has finished. Without the chain, "have I been overtaken" is asked
before the overtaking request exists.

**Reported honestly: the guard fails only when both are removed.** Each half
alone survives the test, because `parseRoute()` is read inside the draw rather
than captured when the render was asked for — so a slow render that arrives late
draws the *current* address, not the stale one. That is an accidental
protection, not a designed one, and it would disappear the moment the address is
captured earlier for any reason. The pair stays.

### The ceiling, where the iron is actually poured

`recipeWarnings()` has enforced substance ceilings since the calculators were
written. A trial enforced nothing, so the application was silent at the one
moment that costs cloth. A recipe is a plan and can be reconsidered; a step is
something being done to cloth that exists.

`trialStepWarnings()` sits beside it in `calc/scale.js`, pure and DOM-free, and
does three things and no more: the step's own temperature against the ceiling of
every substance in play; the step's recipe scaled to this cloth and passed to the
existing function rather than a second implementation of the same rule; and the
medium modification, **only when its amount is written as a plain percentage**.

That last restriction is the considered part. The amount is free text — "2 г",
"около лъжица", "1%" — and a parser that guesses would raise warnings against
numbers nobody wrote. Reading "8 г" as eight per cent is the specific failure,
and it is guarded. **Silence on an unparseable amount is honest; a wrong warning
teaches the person to dismiss the right one.**

The mark shows on the shut step as well as inside it, in madder, because the
step being worked is usually the one that is closed — and a warning that appears
only after opening is silent exactly when it matters. The fibre mismatch is
dropped inside a trial: by the time the cloth is in the bath it is not news, and
a warning that cannot be acted on is noise.

### Asking the reference backwards

"Oak on cotton with alum acetate, what should I expect" has worked since 0.88.0.
"I want this colour on this cloth, how do I get it" has been in the
specification from the first day and is the other reason the library exists.

**One form, not a second screen.** Colour is another criterion that narrows like
every other, and an empty one widens. What changes is what the answer *is*: when
a colour is asked for, the conditions are the answer rather than the question.

- **The colour never makes a record exact.** It orders what the other criteria
  have already allowed and says how far off each one is. A colour matches
  everything to some degree, and fifty records sorted by distance is not an
  answer.
- **Distance is measured in Lab**, in `calc/colour.js`. Arithmetic on the sRGB
  channels is not a distance the eye agrees with, and the palette proves it: two
  wells of weld come out *further apart* (40.9) than iron is from indigo (38.8),
  which is nonsense to anyone looking at them. In Lab it is 9.9 against 21.9.
  ΔE76 rather than ΔE2000 — the newer formula is better and does not change
  which three records come back first, and this is read by one person who will
  want to know why a number is what it is.
- **A record with no swatch is left out, not put last.** A record that cannot
  answer the question must not appear to have answered it badly.
- **A colour nothing comes near returns nothing.** A list ordered by distance
  always has a first item, and offering the least bad of fifty as an answer is
  the fallback-that-hides-the-fault in another costume.
- **The difference is put in words** — lighter, darker, stronger, greyer. "14.3"
  tells the person nothing they can act on.

---

## 13ai. "About" — the smallest useful part of a larger idea (0.89.4)

A number field has two states: empty, or a number. What is actually true has
four — **measured**, **about**, **unknown**, and **not applicable** — and the
field collapses two of them into "empty" and two into the number itself. So the
application cannot tell a thermometer reading from a good guess, or "nobody
knows" from "I have not got to it yet". The seeded library shows the second half
of this plainly: `liquorRatio` and `dryingRatio` are empty on all forty-eight
plants, and nothing on screen says whether that is unknown or unfinished.

The owner chose to build **only "about"** for now, and to leave the full
proposal recorded for later (§16). That is the right cut, because "about" is the
one of the four that changes what the application *says* rather than what it
merely stores.

### Where it lives

Beside the confidence, and stored the same way: a map keyed by field path, so a
field that is not marked is simply absent from it. The principle was already
accepted and already implemented on one half — `confField` has recorded *where a
claim came from* since the plant profile was built. It never recorded *how firm
the number itself is*. A record could say "from the literature" and still present
somebody's rough eighty as a measurement.

Six numbers in a plant carry the mark, through `confField` itself rather than
one at a time, and the step temperature in a trial carries it too.

### What changes because of it

- **Reading.** `≈ 80 °C` rather than `80 °C`.
- **The ceiling warning changes its tone, not its existence.** A temperature
  marked as an estimate produces a caution in weld — *about 78 °C against a
  ceiling of 80 °C, put a thermometer in* — instead of a verdict in madder. The
  warning written in §13ah would otherwise make a flat statement about a guess,
  which is the fault the mark exists to prevent, arriving through the door of
  the fix for a different one.

### Guards

The mark survives the round trip, an estimate does not read as a measurement,
and an empty value is not marked as "about nothing". Plus the tone change in the
ceiling check. All four seen to fail.

**One fault found while building it:** a checkbox cannot go through the loop
that reads a step's fields, because `el.value` on an unticked box is still
`"on"`. Read as a value, every step would have come back marked as an estimate.

---

## 13aj. A colour search answers in a table (0.89.5)

Reported with a screenshot: twelve results, each a full result card squeezed
into a column a few characters wide, one word per line, the whole answer a page
of scrolling.

Two faults, and the second is the interesting one.

**The wrapper.** `resultCard` has its own internal layout, and §13ah wrapped it
in a two-column grid to put a swatch and a difference beside it. The card was
crushed into the second column. That is simply a mistake.

**The form was wrong to begin with.** Rule 1 of §13s: *prose or an image →
cards; numbers to compare → a table.* A colour search returns the same few
values across a dozen records, looked at against one another — which is what a
table is for. Cards were reached for because the forward search uses cards, and
the forward search is right to: there one is reading a handful of matches, each
with its variation text and its caveats. Backwards, one is scanning for the one
to open.

So the answer is a table: swatch, how it differs, the colour in words, what it
comes from, the conditions, confidence. Sixty-five pixels a row rather than
three hundred. **And it becomes stacked rows on a phone with nothing further
written**, because §13ae's rule is against `.grid` rather than against any one
list — the first list built after that rule to inherit it for free.

Guarded: a colour search returns rows and no `.refcard`.

---

## 13ak. A recipe that is computed, not remembered (0.89.6)

The owner brought three things at once: does Chandra Rice's calculator cite
sources, why does hers change the soda and vinegar when the aluminium salt
changes while ours does not, and why does a recipe attached to 55 g of cloth
give different figures from the calculator for the same 55 g.

### What her calculator rests on

One citation, for one number: the 120 g/L saturated-soak concentration, from
Boutrup and Ellis. Everything that moves when the hydration changes is not
observation and not cited — **it is stoichiometry**, the same arithmetic done
here. Her own explanation page describes the mechanism in molar terms. So the
suspicion behind the question was right: nobody has run trials across six
hydration states of aluminium sulfate.

### Why hers moves and ours did not — both are correct

The basis. §5.1 already names this and calls it the threefold trap, and
`basis_refers_to` has been in the vocabulary since then with exactly two values.

- **Finished product.** The target is a fixed number of moles of acetate. Three
  acetate groups per aluminium, so the acetate equivalents are fixed, so the
  soda and the vinegar do not move. Only the weight of the salt changes — 2.8 g
  of anhydrous aluminium sulfate carries the aluminium of 7.8 g of potassium
  alum.
- **Raw input.** The weight of the salt is fixed, so the moles of aluminium in
  it move with the hydration, and everything downstream follows.

Ours offered only the first. Hers offers both, which is why hers appeared to
know something ours did not. **The calculator was not missing chemistry; it was
missing half of a distinction the specification had already made.** The third
time in this stretch that a rule was written and applied to one side only
(§13ad, §13ai).

### Checked against the book

The standard recipe the owner quoted — 18% alum, 10% soda ash, 240% of 5%
vinegar — was run through this stoichiometry. For 100 g of cloth it needs 9.6 g
of soda ash and 218 mL of vinegar **if the alum is aluminium sulfate at about
14-hydrate**: within roughly 10% of the published figures, a sensible working
excess to drive the reaction. For potassium alum the same 18% needs 6.0 g and
137 mL, so following the recipe with potassium alum means about 65% excess soda
and vinegar — and excess carbonate is not harmless, since it raises the pH and
can precipitate aluminium hydroxide instead of leaving acetate in solution.

That cross-check now sits on the calculator screen with the citation, rather
than in a conversation.

### The two answers that disagreed

The real fault, and ours. The calculator worked from molar masses; a recipe
stored percentages. **Two copies of one piece of chemistry, and they had already
drifted apart on screen** — the owner's own phrase for this class of fault, from
§13ab, is that a second list beside the declaration is a second thing to forget.

A recipe may now declare `computedBy` with a target instead of storing
quantities. "Eight per cent aluminium acetate, made from whatever is in the
cupboard" is a target and a set of roles; the numbers appear when the recipe
meets a cloth weight, and they are the calculator's numbers because they are the
calculator's function. Everything else about a recipe — alternatives within a
role, conditional ingredients, the steps for mixing — is untouched, because the
computation overwrites quantities rather than replacing the path.

Where sodium acetate is chosen the acid line is marked not needed rather than
set to zero: an ingredient reading "0 ml" is an instruction to add none of
something, which is not the same as an ingredient that has no place in this
version of the reaction.

### Guards

Three, each seen to fail: a computed recipe returns exactly the calculator's
figures; on the finished-product basis another hydrate changes the weight of the
salt and nothing else; on the raw basis the soda follows the hydration. The
second is the one worth having, because it encodes the thing that looked like a
bug and is not.

---

## 13al. Finishing a piece of work did not finish the cloth (0.89.7)

Reported with a screenshot: a garment appearing on the same screen under
**finished work** and under **ready to work**, still marked mordanted, after the
work on it had been closed.

§8.0e question five says the finishing screen changes the state of the cloth,
and Fabrics remains the only owner of that state. Two faults meant it never
happened, and the second one made the first invisible.

### The default was to do nothing

The state chooser offered *leave the state as it is* first and selected. So a
person who finished a piece of work and answered the four questions that matter
to them left the fifth alone, and the cloth stayed where it started. **A screen
whose stated purpose is to change something must not default to changing
nothing** — and doing nothing silently is worse than asking, because it produces
a record that looks complete.

Now the state the work implies is offered already chosen: `finished`, because
screen 4 is where work on a piece ends. A piece only part-way through — dyed
now, printed next week — is the case for choosing `dyed` deliberately. Leaving
the state alone is still possible and is now a choice rather than the absence of
one.

### And underneath it, the list was being rebuilt from the screen

Even with a state chosen, nothing would have been written. `readWork()` rebuilds
`fabricIds` from the checkboxes it finds, and screen 4 renders none — so
finishing emptied the list of pieces, and the loop that writes the state event
had nothing left to write to.

The file warns about exactly this, four lines below, about steps: *a reader that
treats the screen as the whole truth is only correct by accident.* The note was
written when steps began rendering collapsed, and the same reasoning was never
applied to the three lists above it. A list is now left alone when the screen
offers no control for it.

**Third time in this stretch that a rule was written down and applied to one
side of the thing it describes** (§13ad, §13ai, §13ak). It is worth naming as a
habit rather than three coincidences: the fix is written where the fault was
found, and the same sentence is not carried to its neighbours.

### The records already written

Fixing a default does not correct what is stored. A piece whose most recent
completed work is newer than anything its own state records is marked in the
ready list — in weld, as something to attend to — with the way to settle it. It
reopens the finishing screen of the work that left it stale rather than writing
a state event from a card: the five questions are where a piece is closed, and
answering them again is how the record becomes right.

### Guards

Finishing proposes a state rather than proposing nothing, and the cloth records
what the finished work did to it, with the trial named in the event. Both seen
to fail — the chooser reordered as it was, and the list rebuilt from the screen
as it was.

---

## 13am. A finished piece is not a finished cloth (0.89.8)

A shawl printed in June, then re-mordanted with aluminium acetate and a
carbonate bath and printed over in August. Nothing supported it: `finished` read
as the end of the piece rather than the end of a run.

Three decisions, taken with the owner.

### One card per piece, the runs inside it

Two cards side by side say two things exist. The card shows the piece as it
stands now — the most recent run leads — with the earlier runs listed beneath.
Work touching several pieces is filed under the first of them rather than
repeated under each, because repeating it would make one afternoon in the studio
look like five.

### The new work starts from the last photograph of the old

Not the plan, not the raw cloth: the last frame of the previous run is literally
what is in the hand when the next begins. It comes from `photoTimeline()` again,
which means no new rule and no second definition of "most recent".

### The ground is recorded, automatically

Oak on white silk and oak on a shawl already printed rust are not the same
question. A combination matched against the second while keyed on the first
answers the wrong one. So a repeat run carries `groundFrom` — which run, when,
its last photograph, its colours — written without being asked for, because the
person starting the second print already knows what it is standing on and the
application is the one that needs telling.

Working a piece again uses **the same address as starting from a ready piece**.
It is the same act; the handoff decides for itself whether the cloth arrives raw
or already carrying a print. A second path would have been a second thing to
keep in step.

### And a real fault the guard found

The fixture entered a cloth today and its June work afterwards — which is the
ordinary way past work gets recorded — and the ground came back as the *blank
cloth*. `photoTimeline()` dated the cloth's own shot by `createdAt`, when the
**record** was made, not when the cloth was acquired. So the raw shot sorted
last and "the most recent photograph" (§13ag) returned the piece before anything
had been done to it.

The cloth as it arrived is the beginning of the piece by definition, and it is
now sorted there rather than by a date that means something else. This would
have shown up as covers quietly reverting to blank cloth for any piece entered
after the fact — silently, and looking like nothing was wrong.

### Guards

A finished piece offers to be taken up again; the new work starts from the last
photograph of the old and names the run it came from; raw cloth is not given a
ground it does not have; and the strip leads with the cloth even when its record
was created last. All seen to fail.

---

## 13an. Three doors to "complete", one of them a trapdoor (0.89.9)

The owner went to correct the garment from §13al and came out with a *second*
finished record, an empty one, while the cloth still read mordanted. Neither
half was her mistake; both were doors this application left open.

### Pressing the piece started a new piece of work

The card under "ready to work" is a button that begins new work from that cloth
— which is right for a mordanted piece waiting to be used, and wrong for the
one case where the card is displaying a contradiction. The correction was a
quiet line *underneath* the button. Pressing what looks like the piece created
work titled after the cloth, dated today, illustrated with the cloth itself
because it had nothing else yet.

**The main action must be the one the card is there to offer.** When a piece
contradicts itself, settling it is the card; starting new work steps down to a
quiet line beneath. The same two actions, the other way round.

### The status chips reached "complete" without passing anything

Three doors led to complete: the Finish action on a running row (§13ag), the
button on the working screen, and the status chips. The chips went straight
there. So work could enter the finished column with no result, no verdict and no
change to the cloth — which is exactly how the garment came to appear under
"finished work" and "ready to work" at once, twice, by two different routes.

The chips now write the status and go to screen 4. The status is written first,
so nothing is lost if the person turns back.

**Work is not finished because a control says so.** It is finished when it is
known what it gave and what became of the cloth. Any path to `complete` that
does not ask those things produces a record that looks complete and is not —
the same fault as §13al's silent default, arriving through a different door.
Two versions in a row have now been spent on this, which suggests the useful
rule is not "fix this door" but **one screen owns finishing, and every route
leads to it.**

### Guards

Marking work complete from the chips reaches the finishing screen; a piece that
contradicts itself is settled by its own card rather than starting new work.
Both seen to fail.

---

## 13ao. Work that points at no cloth (0.90.0)

The owner's backup, sent while repairing the garment: a record dated 9 August
with five steps, seven placements and `fabricIds: []`. All the history and no
piece. It is the wreckage of §13al — `readWork()` emptied the list at the moment
that work was finished — and it explains everything that followed: the state
could not be written because there was nothing to write to, the record could not
be grouped under a piece, and a second, empty record ended up carrying the cloth
instead.

Told to attach the cloth, she could not find where. **The panel is inside a
folded strip called "about this work".** Folding it is right once the cloth is
chosen; on the one record where the question is unanswered it hides the answer.

So: work with no cloth opens that strip itself, marks it in weld, and says in
words why it matters — it cannot change a state, is filed under no piece, and
takes no part in the life of one. The diary marks it too, where it is listed,
with the way back.

**Ordinary work stays folded.** A mark that appears everywhere is not a mark,
and that is guarded in the same breath as the fault.

### The shape this keeps taking

Four versions now — §13al, §13an, this — have been one fault in different
clothes: **a record that looks complete and is not.** The empty state chooser,
the status chips, the emptied cloth list, the folded panel. None of them
announced anything; each produced a plausible record. That is the principle from
§4 stated the other way round: *a fallback that produces plausible output hides
the fault it is covering for* — and a screen that quietly omits is a fallback
too.

What follows from it, and is worth applying beyond the diary: **a record that
cannot do its job should say so where it is listed, not where it is opened.**

---

## 13ap. A dye bath had nowhere to put its colour (0.90.1)

Asked by the owner, and exactly right: *do we record a colour for the plant from
dyeing, or only from eco print?* Only from eco print. She had dyed with madder
and had no swatch to show for it.

`resultHex` lives on a **placement**, and placements were offered for eco print
alone — reasoning, in a comment, that a card headed "plants and prints" asks a
question a dye bath never poses. True of the heading, and wrong in what
followed: the bath was left with nowhere to say what went into it or what came
out. No swatch on the card, nothing reaching the plant, and nothing findable by
the colour search built in §13ah.

### No new carrier

A placement already holds what the bath needs: which plant, which part, in what
condition, what colour it gave, and the link to a combination. What is
particular to printing is only **where the leaf lay** — facing, print quality,
local treatment, the photograph of it in place — and that was already behind
`isEcoPrint`.

So **a bath result is a placement without a position.** The block is shown for
immersion under its own heading, *dyestuffs and what they gave*, and the
position questions stay where they were. A second carrier for colour would have
been a second thing saying one thing, and the two would have drifted — the fault
of §13ak, invited back in.

### And it had to be reachable before anything else exists

The placements card attaches under the first colouring step, with a fallback for
leaves recorded before any step is written. That fallback required a placement
to *already be there* — fine for leaves entered from a photograph, useless for a
bath, where there was then no way to add the first one. A record's first entry
cannot require a previous entry.

### Guards

A bath can say what went into it, is not asked where the leaf was facing, and is
asked at the finish what colour it gave; eco print keeps its position questions
— because a fix for one process that quietly takes something from another is not
a fix. All four seen to fail.

---

## 13aq. Saving a recipe threw, and had for as long as it has existed (0.90.2)

The owner reported something small: doing a dyeing with no recipe for that
plant, there is no way to write one from the step. Following it found three
things stacked on each other, and the bottom one was live in the application.

### The button did half of nothing

There is a `+` beside the recipe chooser on a step. It went to the recipes
**list** rather than to a new recipe, wrote a memo of where to return, and on
save came back to the trials **list** with nothing attached. So the person wrote
the recipe, returned, and then had to find the trial, find the step, and choose
the recipe by name — most of the work the button existed to save.

Now it opens a new recipe, remembers **the step by id rather than by index** —
coming back to a record that has gained or lost a step meanwhile would otherwise
attach the recipe to the wrong one — and on save attaches it and lands on the
work.

### The memo was written and never read

`returnTo` was declared in `recipes.js` and loaded from settings **nowhere**. The
variable held `null` for as long as it has existed. Every part of the round trip
downstream of it was therefore dead code that looked alive.

### And underneath: `flash` was never imported

`recipes.js` calls `flash(t('common.saved'))` after saving, and never imported
it. In a module that is a `ReferenceError` at the moment the line runs. So
**every save of a recipe has thrown** — after `put`, so the recipe was written,
and before everything else, so the screen did not move, the version did not
bump, and nothing was reported. From the outside: press Save, and the page sits
there.

It was found only because the round trip built on top of it silently did
nothing, and I went into a real browser to see why rather than assert that the
code was right. jsdom showed a click that did nothing; Chromium showed the
`ReferenceError`.

### The guard that should have caught it

`check-scope.js` exists for exactly this class — its own comment says the
symptom is *a screen that has simply stopped responding, with nothing obviously
wrong*. It catches an **assignment** to an undeclared name. A **call** to a name
that was never imported walked past it.

It now also reports a call to a function that a shared module exports and this
module has not imported. Deliberately narrow — only names some shared module
actually exports, and a local definition of the same name shadows it — so that
it cannot cry wolf. Two corrections while writing it, both in the direction of
quieter: method shorthand (`open(first) {`) is a declaration and not a call, and
declarations are read from the raw source rather than the stripped copy, because
stripping loses some and **a declaration missed becomes a false accusation**.
For a new guard, wrong-and-quiet is the safe way to be wrong.

Seen to fail: the import removed, it names the file, the function and where the
function comes from.

---

## 13ar. The dyestuff belongs to the step (0.90.3)

§13ap gave the bath somewhere to record what it gave, and hung it on the
**trial**. That is right for a trial that is only a bath, and wrong for the case
the owner actually has: an eco print whose steps include a dye bath, and — the
one that settles it — a trial with two baths, tagetes and then madder. A list
hanging off the trial knows both were used and cannot say which was in which
pot.

**"No recipe" has never meant "no dyestuff."** A recipe carries the proportions
and the method; the dyestuff is what went in. Until now the second was reachable
only through the first, so a bath written without a recipe had nowhere to name
what was in it — which is exactly what the owner ran into.

### One list, filtered — not a list per step

A placement now carries `stepId`. The same block renders it: called with a step,
it shows that step's dyestuffs inside the step; called with nothing, it shows
the ones belonging to no step, which is what a leaf laid on cloth is. **A second
store for the same thing would drift from the first** (§13ak), and the colour,
the combination matching and the plant's swatches keep working because it is
still the same record.

One detail that would have been a silent fault: the row is addressed by its
**real index** in `r.placements`. Filtering with `.filter()` renumbers, and the
second bath would then have edited the first one's plant.

### A guard I had to correct

The check that a dyestuff added from a step belongs to it first read the `data`
attribute off the markup. It passed with the handler deliberately broken —
because the attribute proves the markup carries the step id and says nothing
about what the handler does with it. It now presses the button and reads the
record back. **A guard that inspects rather than acts is testing the scenery.**

Guards: a dye step shows its own dyestuff, two baths in one trial are told
apart, what is added from a step belongs to it, and a leaf belonging to no step
is still listed on its own — because a change made for the bath must not take
anything from eco print. All seen to fail.

---

## 13as. Four from a morning's use (0.90.4)

### A label swallowed the press

A photograph in the plan could not be removed. The × was there, it highlighted,
and nothing happened — the record kept the photograph and only the screen
pretended otherwise until the next reload.

`field()` renders a `<label>`, and **a label forwards a press anywhere inside it
to the control it labels.** The plan photographs sat in one, so their buttons
were never pressed at all. `fieldGroup()` is the same caption built from a
`<div>`, and the rule is now: `field` for a single control, `fieldGroup` for
anything holding controls of its own.

Nine other places had the same shape — groups of checkboxes nested inside a
label, which is invalid HTML and steals presses in the same way. `check-scope.js`
now reports a `field()` containing a button or a label, and found a tenth I had
missed while converting the nine.

### The strip ended at the fifth photograph

The life of a piece scrolls sideways, deliberately: the sequence is the point
and a grid that reflows breaks the reading of it. But it scrolled with nothing
to say so, so as far as the reader was concerned it ended where the panel did.
The bar is now always shown rather than on hover, and the right edge fades while
there is more to come.

### The result could not be corrected

Screen 4 was reachable only on the way to finishing. Once a piece was finished,
the five questions — and the colour that carries the result to the plant and to
the reference — could not be edited at all. §13an established that one screen
owns finishing; it follows that it must be reachable **after** finishing, not
only before.

### The cloth's name did not follow the cloth

Renaming a piece in Fabrics left the diary calling it by its old name: the title
was copied off the cloth when the work began, and a copy taken once does not
follow the original.

Derived on read now, which is the rule the data model already states — no
back-references, related things worked out when the record is opened (§3). The
cloth names the work; a title of the person's own that says something else is
shown beneath it rather than lost. No flag, and no guessing whether a stored
title was typed or copied.

### And a fault of mine, which is the reason to write this section

I broke `recipes.js` — a malformed import — and reported the suite clean.
`check.sh` had in fact stopped at an earlier layer, on a duplicated §13ao that
two versions had both written, and never reached the syntax check. It said so.
I did not see it, because I was **counting matches of a grep pattern instead of
reading the exit code**, and the pattern did not include the words that layer
prints.

A guard that reports correctly and a reader who checks for the wrong words is a
suite that passes. The exit code is the answer; everything printed above it is
commentary. Both faults it was hiding are fixed: the duplicate section is gone
and the import is repaired.

---

## 13at. The plants get their photographs (0.91.0)

Forty-six of the forty-eight chosen photographs arrived with a workbook of
sources, authors and licences. Forty are in the pack.

### Attribution is a field, not a footnote

A plant carried `photoData` and nothing else. Several of these images are
CC BY-SA, which requires the author to be named **wherever the image appears** —
and this application is meant to be given away. So `photoCredit` holds the
author, the licence, the source and the taxon of the photograph, and the credit
is rendered under the picture rather than filed on a page elsewhere.

The licence line is shown even when the licence asks for nothing, because a
reader deciding whether they may reuse a picture needs telling, and a blank
tells them nothing.

### Eight are held back, and that is the feature

Six of the forty-six have no author recorded — the owner's own workbook flags
them in a sheet called *verify before release* — and one of those six is
CC BY-SA. **A photograph whose author is unknown does not travel.** Shipping it
is not an oversight to be tidied up later; it is the breach itself. The import
script refuses them, names them, and exits cleanly, so the six can be added the
moment the names are known.

The other two: number 24, sumac, whose approved source refused automated
download and which is NoDerivatives, so it must be added by hand and uncropped;
and number 5, coreopsis, whose file did not arrive.

### Size

Each is reduced to a long side of 560 px. These are photographs for recognising
a plant, not for printing, and the whole pack travels inside the application and
is cached for offline use. One 6.9 MB original would otherwise have cost more
than the entire rest of the library; forty come to 2.6 MB.

### Guards

Every photograph that needs an author has one, every photograph records its
licence, and the author is **on the screen** and not merely in the record. That
last one matters most: the record satisfying the licence is not the same as the
licence being satisfied. Both directions tested.

**And one guard corrected rather than obeyed.** The 44 px touch target flagged
the credit line, which is a link. It is prose that happens to link out — the
licence asks for the name to be readable, not pressable, and setting it at 44 px
would give the photographer a bigger claim on the page than the plant. The
exception is written into the layer with that reasoning, next to the others.

---

## 13au. The day the work finished (0.91.1)

The owner reported that the date she chooses when finishing a piece is not the
one that gets kept — the diary shows the day she made the record. Three faults
underneath it, and the third had already damaged stored data.

### There was no such date

A trial carried one date: its own. Screen 4 offered a date field, but that field
belongs to **the cloth's state event**, not to the work — so it went into the
piece's biography and never touched the record the diary was dating. She was
choosing a date and watching a different one being displayed, which is precisely
the fault class §4 warns about: a plausible outcome hiding the real one.

`finishedOn` now exists on the work, asked before the five questions. Finished
work is **shown and ordered by it**; work in hand is still dated by `date`. Two
fields rather than one, because her own diary has a piece begun on the 9th and
finished on the 13th, and a single date would have to lose one of them. When
they coincide — which is every retrospective entry — the second is invisible.

### The state date always opened at today

`value="${today()}"` regardless of what had been recorded. It now opens at the
mark already on the piece, or at the day the work finished. Still a separate
field: a bundle opened a week after the print is a real case.

### Finishing again stamped the cloth a second time

The save pushed a state event unconditionally. Combined with the previous fault,
**editing the result of an old piece of work stamped it again with today's
date.** Three pieces in the owner's live diary claim to have been finished
twice — a tunic on 12 May 2025 and again on 13 August 2026, from one work.

One work leaves **one** mark on a piece, found by the `trialId` the event has
carried from the start. Finishing again corrects it. Choosing *leave the state
alone* after a state was recorded withdraws it rather than silently keeping the
old one.

### Repairing what was already written

`healDoubleStateEvents()` runs at boot. Where one work left several marks on a
piece it keeps **the earliest**, because the later one is always the re-visit:
the first carries the day she chose, the second the day she happened to open the
record. That date then fills `finishedOn` where the work has none — which
recovers dates that were otherwise lost, including May 2025.

Events belonging to no work are not touched. The repair is idempotent, and the
guard runs it twice and compares, because **a repair that is not idempotent is a
repair that eats data on the second boot.**

### Guards

Seven, all seen to fail: the day chosen on screen 4 is recorded; the diary dates
finished work by when it finished; finishing again corrects the mark instead of
adding one; the doubled mark heals to the day that was chosen; an event
belonging to no work is left alone; the recovered day reaches the work; and the
repair changes nothing on a second run.

One correction while writing them: the diary check first read the whole screen
as one string and passed on **another fixture's** date. It now reads the card
belonging to the record under test. A check that reads the whole page is a check
that can be satisfied by something it was not asking about.

---

## 13av. One number, one piece — and the last hidden state channel (0.93.0)

Three things closed together, because they are the three the owner was carrying.

### The paper tag

Two pieces on her shelf both wore П-04. The counter was not out of step — it stood at 35, well
ahead of both. **Both numbers were typed by hand**, and `labelFor` said *a hand-typed code always
wins* without ever asking whether someone else was already wearing it.

A number is now compared the way it is read rather than the way it is stored: `П-04` and `П-004` are
one tag written twice, because the padding changed between versions. A typed number already in use
is **refused at save, naming the piece that has it** — "that number is taken" without saying by what
leaves her searching the shelf by hand. A reserved number now steps over what is worn instead of
trusting the counter to be ahead of it.

**The duplicate that already exists is not repaired.** One of those two pieces has П-04 written on a
paper tag in the studio, and only the person holding it can decide which tag to rewrite. Renaming a
record would make the application and the shelf disagree, which is worse than a duplicate that is
visible. The list says so, once, at the top.

### The bottle reaches the calculator

The last item of §11b. A jar has carried `concentrationPercent` since Stock existed and **nothing
ever read it**: the alum acetate calculator asked for a vinegar strength and offered 9 while the
bottle in the cupboard was 5. The field is now a picker of bottles she owns — acid modifiers and
auxiliaries with a recorded strength — and choosing one writes its percentage into the field beside
it, which stays editable, because a bottle not yet recorded must not become a bottle that cannot be
used. Typing a strength by hand clears the chosen jar: the label must not keep naming a bottle it no
longer matches. A *wanted* entry is not a bottle and is not offered.

### Fabrics finally has an address

Every module was converted in §13ad except this one, and nobody noticed because nothing looked
broken. `#/fabrics/<id>` named a record the module never heard about — it had no `open()` at all,
and the piece being looked at lived in a module variable. A piece could not be reloaded, bookmarked
or sent to anyone, and Back walked out of the module instead of returning to the list.

    #/fabrics · #/fabrics/new · #/fabrics/<id> · #/fabrics/<id>/edit

Saving now returns to reading the piece through the address, with a flash, like every other module
with a read view.

### Guards

Ten: the same number written two ways is one tag; a number already worn is refused; a reserved
number steps over one in use; two pieces wearing one number are reported; choosing a bottle puts its
strength into the calculator; a wanted bottle is not offered; and Fabrics joins both address
contracts — obeying its address, and surviving an address to a deleted record. All seen to fail.

---

## 13aw. The plant audit, merged (0.94.0)

The owner had the library audited against Nicola Cliffe's dye plant table, Maiwa
and Kew, and brought back a workbook of 188 recorded changes. Most of it is
gain. Three parts of it were held back, and the reasons are the interesting part.

### What went in

**Eight photographs were unblocked.** They had been held since §13at for want of
an author. All eight now have one, with a licence — sumac's is **CC BY-ND**, so
it goes in uncropped or not at all. The credits are recorded; **the image files
themselves are not in this release**, so the count stays at 40 of 48 and the
eight are visibly credited-without-an-image rather than quietly absent.

**Two taxonomic corrections that were real faults.** The brazilwood record mixed
*Paubrasilia echinata* with *Caesalpinia sappan* — two different plants, and the
photograph and dye material were sappanwood. „Руй (рустифина)" was not a name of
*Rhus coriaria*. Cosmos was pinned to *C. sulphureus*, the dye species.

**Renamed, never replaced.** The owner asked whether the brazilwood record could
be deleted and reloaded. It could not: everything that points at a plant —
placements, combinations, swatches — points at its id, and a new record means a
new id. The code stays `paubrasilia_echinata` for a plant now named *Biancaea
sappan*, which is ugly and invisible and much cheaper than an orphaned swatch.
Recorded here so nobody later "fixes" it.

**Fifteen plants gained a part**, and one new vocabulary term: `heartwood`.
Cutch and sappanwood are made from the wood at the centre of the trunk, which
the vocabulary could not express.

### What the audit found that the model already knew

The workbook listed 48 part corrections. Mapped onto codes, **fifteen** are real
— the rest are wording (`лист` → `листа` is the same `leaf`). Worth stating
plainly: a correction that disappears at the level of the data model was a
correction to the spreadsheet, not to the library.

### What was held back

**Tannin level and tannin function.** The plant already carries chemistry **per
part**, with a class and a level: oak bark is `tannin_ellagi: dominant`,
`tannin_gallo: high`, while oak leaf is `tannin_ellagi: high`. That is finer
than "very high (especially galls/bark)". A second field for the same knowledge
would drift from the first (§13ak). The levels belong in `parts[].chemistry`.

The tannin *function* sentence is boilerplate on **37 of 49** records — a field
that says the same thing on three quarters of the library answers no question.
The twelve where it is specific are worth keeping, as prose, where they apply.

**Temperatures.** The audit turned them into prose: *special process*,
*reduction indigo vat*, *cold 20–25 (primary extraction)*, *90 (yellow); not
applicable to the pink process*. These are **more true than the numbers they
replace** — and the fields are numeric, with `softMaxTempC` feeding the warning
that stops madder being boiled brown. Text there would make the warning fail
silently. This is the roadmap's "unknown and approximate as legitimate values",
arriving on its own; it must be decided before the data is merged, not after.

**Parts the audit removes.** A part carries chemistry and dosing, so dropping
one deletes knowledge. Four are reported and kept: safflower's leaf, apple's
hull, sappanwood's and cutch's bark.

### The accumulator, and a fault in a label

The owner asked whether `mordant_accumulator` should move into chemistry, saying
**she had not known what it meant** — and she is the domain expert. That is a
fault in the label, not in her.

It does not move: chemistry says what is inside a part, a role says what the
plant is FOR, and "you may be able to skip mordanting" is a use. What was wrong
is that a term carrying knowledge in the word explained itself nowhere. The
vocabulary has had a `description` field all along, filled on **4 of 231** terms
and rendered on none of them. `describe()` now reads it, and the plant record
shows it under the role.

**Open, and flagged to the owner:** eleven plants carry `mordant_accumulator` —
alder, smoke bush, geranium, apple, medlar, pomegranate, oak, sumac, willow,
eucalyptus, hazel. The classic aluminium accumulators in the literature are
*Symplocos*, hydrangea and tea. Oak and pomegranate are known as **tannin**
plants. The suspicion is that these eleven were marked for their tannins, which
would make the label wrong from the start — and "you may skip the mordant" is
advice that wastes work if it is wrong. To be checked against the owner's own
guide and Boutrup & Ellis before it is trusted.

### Guards

`scripts/merge-plant-audit.py` is idempotent — the second run reports nothing —
and refuses to write anything it was not asked to. Seven guards: a renamed plant
keeps its id; 48 plants carry an author; the eight awaiting an image are
credited and counted rather than hidden; a part added by the audit is on the
record; a term that needs explaining carries the explanation; and the
explanation reaches the screen.

One correction while writing them: the guard keyed its map on `p.code`, which
the pack **strips** when it loads — every lookup returned undefined, and a Map
keyed on undefined answers every question with the last record loaded. It would
have passed while proving nothing.

---

## 13ay. What a plant is, and where it grows (0.95.0)

The second audit pass: 468 recorded changes, nine new plants, and the two
categories the owner proposed — growth form and habitat.

### `availability` is gone

It held values like „сам го отглеждам" — **a sentence about the owner, on a
record that ships to other people in a seed pack.** The same fault „искам го"
had in §11b, and the owner named it herself: *моята дума „сам го отглеждам" не
трябва да се смесва с хабитата.*

In its place, two facts about the plant:

**`plantType`** — `tree · shrub · subshrub · herb`, **one value, never two.**
Twenty of fifty-seven rows arrived compound („Храст / малко дърво"), and a field
that accepts a slash is prose the filter cannot read. The first word is taken;
that a hazel sometimes grows tree-tall is a sentence in „Как се държи".

**`habitat`** — `wild · garden · imported`, and it may hold several: rue really
is both wild and grown, which is two truths rather than one hesitation. **Three
rather than the four proposed:** „градинско" and „култивирано" arrived together
on fifteen rows, and two values that never separate are one value with two
names. Anything a person tends — bed, pot, greenhouse, field — is `garden`.

„Кухненска суровина" was refused. It is not where a plant grows; it is how she
comes by it — the axis just deleted, returning by the back door.

### Six sections, not seven

The audit brought three prose columns. „Защо действа" is **not** a new heading —
it is „Багрилна съставка" asked in plainer words, and it was folded into it. Two
headings for one question is how the library once had plants with four sections
and plants with ten. „Как се държи" did join, as observed behaviour beside
„Багрилни качества", which is the recipe. All six now stand on all 57.

### Nine new plants

Elder, blackberry, dahlia, dyer's greenweed, alkanet, rhubarb, ash, alder
buckthorn — and geranium, which existed in the owner's own database claiming
`origin: seed` while no such seed record existed. The pack and her database now
agree.

They arrive with names, role, type, habitat, all six sections and a photograph,
and **without colours, dosing or fastness** — recorded as gaps rather than
filled with plausible numbers.

The code is built from the botanical name with authorities and brackets
stripped: a code is an identifier, not a citation, and it must not carry
anything that might later be revised.

### Held back

**The temperatures, again — and now the reason is sharper.** Elder arrived as
*листа/кора 70–85; плодове 40–65*. Blackberry the same. That is not bad
formatting: **extraction temperature belongs to the part, not to the plant**,
exactly as WOF dosing does — a correction the owner made herself long ago. The
field is per-plant, so the knowledge escapes into prose. Together with *special
process* for woad, Japanese indigo and alkanet, this settles what the next
change must be: temperature moves onto the part, and „unknown" and
„approximate" become sayable.

**Our own library, cited as evidence for itself.** The audit's source column
carried `raw.githubusercontent.com/tskovacheva/bagra/.../plants.json` on most
rows. Stripped: a reference that quotes itself proves nothing.

**The sumac photograph.** The workbook keeps *Rhus coriaria*; the photograph
supplied is *Rhus typhina*. Different species — the Mediterranean spice and the
ornamental that grows all over Sofia. Held until the owner says which she cuts.
A photograph of the wrong plant in a reference is worse than none.

**Twenty compound growth forms** are listed for review: the first word was
taken, but for sage, lavender, thyme, rosemary and geranium the second —
`subshrub` — is probably the truer one. No plant currently carries `subshrub`.

### Guards

Six: no personal field survives on a reference record; all 57 carry exactly one
growth form from the four; every plant says where it grows in the three agreed
values; all six sections stand on all 57; 57 authors; the eight still awaiting
an image are credited and counted. Both merge scripts are idempotent.

---

## 13az. A temperature belongs to the part (0.96.0)

The audit's temperature column could not be merged while the field sat on the
plant. Elder came back as *листа/кора 70–85; плодове 40–65* and blackberry the
same — **not bad formatting, a fact the model could not hold.** One plant, one
number, and the leaf's boil would have been handed to the fruit.

`tempExtractC`, `tempDyeC` and `softMaxTempC` now live on the **part**, exactly
as WOF dosing does — a correction the owner made herself long ago and which this
field never received. The plant keeps none of them: two homes for one number is
how they drift.

The migration copies each plant's value onto every one of its parts, because
that is precisely what the old field claimed — one temperature for whatever part
you happened to use. Nothing is invented; the same claim is re-attached where it
can now be corrected part by part. `approx` and `confidence` travel with the
numbers, so a value marked as an estimate does not quietly become exact.

**On screen it repeats only where the parts disagree.** A plant whose parts all
cook alike says it once, because the same figure under four headings reads as
four separate findings.

### „No temperature" is not „temperature unknown"

Woad, Japanese indigo, alkanet and safflower have no extraction temperature —
not an unknown one, **none**. The ordinary simmer-it-in-water schema does not
apply to them, and an empty field said *nobody has measured it yet*, which is a
different and false statement.

`extractionMode` on the part says which schema it is in: `decoction · cold ·
solvent · vat`. Each carries its own explanation, shown where the temperature
would otherwise stand — the mechanism §13aw built for the accumulator, earning
its keep a second time.

### What this unlocked

The audit's temperature column merged, 97 changes across the parts, including
the madder ceiling the owner accepted at 82 °C. The seven rows that were prose
rather than numbers are exactly the seven that are modes, and they are now
sayable. **The recipe reads the temperature of the part it is using**, not of
the plant.

### And the rest of the batch

All 57 plants carry a photograph. The sumac is resolved: the record keeps *Rhus
coriaria*, and the photograph is a real *R. coriaria* supplied by the owner with
its author — the *R. typhina* image was set aside rather than used, because a
photograph of the wrong species in a reference is worse than none.

Five plants moved to `subshrub` — sage, lavender, thyme, rosemary, geranium.
Taking the first word of a compound is the rule; these are the exceptions the
rule was always going to need, and they are listed rather than guessed at.

### Guards

Six: no temperature survives on a plant; two parts of one plant can want
different heat; a plant outside the ordinary schema says which schema it is in;
madder keeps the ceiling that protects the red; both figures are readable on the
record; the vat is named where a temperature would stand.

One correction, and it is the third of its kind: the screen check first read the
whole page for „40", which also occurs in a dosing percentage — **satisfied by
another row's number.** It now reads only the blocks that carry degrees. And the
first mutation written to test it was a no-op, so it proved nothing until the
mutation itself was corrected: **a guard is only tested by a change that
actually changes something.**

---

## 13ba. Tannins, on the part and without a claim (0.96.1)

The audit's tannin column, merged — and the reason it took three passes to
decide where it goes is the reason worth recording.

**It goes on the part.** The plant already carries chemistry per part, with a
class and a level, and a second home for the same knowledge drifts from the
first (§13ak). Where the audit's note names parts — *особено гали/кора*, *в
листа/стъбла* — those parts get it; where it names none, every part does.

**A new class: `tannin`, with no subtype.** The vocabulary had gallotannins,
ellagitannins and condensed tannins, and the audit reports *high tannins* — the
level, not the kind. Choosing one on its behalf would add a claim its sources
never made. Where the subtype is known the three specific classes still say it;
oak bark keeps `tannin_ellagi: dominant`, and oak **galls** now carry
`tannin: dominant` beside it, which is the practical distinction: a nearly
non-staining tannin for pre-treating cellulose, as against a bark that colours
as it goes.

**Only from `moderate` upward.** Thirty-two rows read *ниски / не е основна
характеристика*. That is the absence of a finding, and recording it would turn
thirty-two silences into thirty-two assertions.

Sixteen entries across eleven plants. Three guards, all seen to fail.

### What the library still lacks, and why it is not filled

The nine new plants carry **no colours, no dosing, no fastness**. These could be
drafted from literature and marked `literature`, and they are not, for two
different reasons:

* **Dosing and fastness** can be sourced and will be, in the ordinary way.
* **Colours cannot.** A colour in this library is a hex value beside a
  condition, and a hex chosen from a sentence in a book is a guess wearing the
  costume of a measurement. The owner has the samples and the eye; §4 says the
  application proposes structure and observations while the person writes the
  conclusion, and a swatch is a conclusion.

**English.** The library is Bulgarian throughout: 57 plants × 6 sections, and
the `en` side empty. This is the owner's published voice under her own brand,
so it is a translation to be reviewed rather than generated and shipped.

---

## 13bb. The caption that took the screen (0.96.2)

The owner sent a photograph of her phone: the plant record's headline showing a
picture, and beside it a column about thirty pixels wide with *Crataegus* and
*monogyna* and *laevigata* each on its own line, the facts beyond it cut off at
the edge.

**The figure took its width from the caption, not from the image.** A `<figure>`
in a flex row is sized by its widest content, and the widest content was the
credit — an author, a licence and a taxon on one line (§13at). Measured at 390px:
the figure 280, the body **28**, and the page 509px wide inside a 390px window.

The figure is now held to the width of the image, the caption wraps under it,
and below 820px the headline stacks: 96px of photograph beside a name, a
botanical name and five facts leaves the facts about forty characters of room.

**The screen check already had the right rule and could not see this.** It opens
"the first row" of the plants list, and that fixture has no photograph — so the
caption that causes the fault was never on screen. It now also opens a seeded
plant by address. Verified by putting the fault back: four failures, naming the
element and the overflow in pixels.

Three copies of the same stylesheet block had accumulated, each added by a
change that did not notice the other two. Two removed.

### Names begin with a capital

Both languages, always. „дъб" sat beside „Бял равнец" because each name was
typed as whoever wrote it felt at the time, and a list where half the rows shout
looks broken before it is read. Forty-eight corrected, and the merge script no
longer lower-cases them on the way in.

### Dosing for the nine new plants

Written, and marked `literature` — which is what it is. **Not** `practice`:
nobody in this studio has dyed with elder bark yet, and in a year the confidence
marker will be the only thing that says which figures came from a book and which
from a pot.

**Their colours are still absent, and that is the point.** A colour here is a
hex beside a condition. A hex chosen from a sentence in a book is a guess
wearing the costume of a measurement, and it would then sit in the swatch
library answering reverse searches beside colours that were actually obtained. A
guard now asserts the nine have none.

The owner disagrees, and reasonably: her colours came from sources compared with
each other, not from a single sentence. Those are welcome — as data she brings,
with a source recorded, the same as every other seeded colour.

### English

342 sections, 67,000 characters, none of it translated. Too much to do well
alongside anything else, and half of it shipped silently would be worse than
none. It is the whole of the next pass.

---

## 13bc. English (0.97.0)

The library was Bulgarian throughout and the English side empty — not a
half-finished translation but an application that claims two languages and
speaks one. 342 sections, 67,000 characters. Now complete.

### Two sections needed no translator

**Источници** is a list of citations and URLs. A citation is not translated: the
author's name and the page title are what they are. Copied across verbatim.

**Използвани части** is a list of part names, and the vocabulary already holds
each one in both languages. It is now **rendered from the part codes** rather
than translated from the prose, so the section and the `parts` array cannot
drift apart — add a part tomorrow and the English text follows by itself.

That left 228 to write by hand, in nine batches.

### The batches are kept

`seed/en/batch-01.json` … `batch-09.json`, and `scripts/apply-english.py`, which
**never overwrites**: a section that already carries English is skipped. So a
batch can be re-run without consequence, batches cannot clobber one another, and
an edit the owner makes inside the application survives every later import.

They live at the top of `seed/en/` and are deliberately **not** in the service
worker's cache list — they are build input, not data the application fetches.
The cache-coverage check walks `seed/*.json` and not deeper, which is now said
out loud in `check.sh` so nobody later "fixes" it into recursion.

### Eleven plants had no English name

Lavender, rosemary, geranium and the eight added in 0.95.0. A plant with no
English name shows a Bulgarian one on an English screen, which reads as a fault
rather than as a gap.

### Guards

Three, all seen to fail: every section that says something says it twice; no
section carries the Bulgarian on both sides — a copied string is not a
translation, and Sources is exempt because a citation is not translated; and all
57 plants are named in both languages.

**This is a translation, not the owner's second voice.** She writes and publishes
in Bulgarian under her own name; the English is faithful to what she wrote and
should be read by her before the library is distributed. The batch files exist
precisely so that correcting it is editing a file, not re-doing the work.

---

## 13bd. Preparation belongs to the cloth, and a bath is one event (0.98.0)

**Status: specified, not built.** This section settles the model. The screens follow it.

The question that started it was "how does group work divide" — five pieces scoured and mordanted
together, after which one goes to eco print, one to a madder bath, and three are dyed together with
tagetes and shibori. The answer turned out not to be a splitting operation at all.

### Preparation is not a trial

Asked plainly, the owner's answer was plain: **scouring is not a trial. Mordanting is a trial only
rarely** — the recipe is repeated and well trodden, and the one time it went wrong it was a failure
to follow the recipe, recorded as a note against the result. **Dyeing and eco printing are trials.**

So preparation does not belong inside a trial. It is the biography of the cloth, and the cloth
already has a place for it: `FabricStateEvent`, with a date and a link to the recipe used.

Today it is recorded in **two** places — as state events on the fabric, and as steps in the trial's
`prep` stage (§8.0b). Two carriers for one fact is why five pieces cannot be divided: their
preparation sits inside one trial, and a trial does not divide. Remove the duplication and there is
nothing left to divide. Three trials, each pointing at its own subset, is what `fabricIds` already
does.

**Where the trial does begin** is not "at the dye bath" but at the point where a hypothesis is being
tested. Usually that is dyeing or eco print. But alum acetate against alum, 5% tannin against 10%,
soy milk against a mordant, a longer mordanting time — there the preparation *is* the experimental
variable. This costs nothing extra: preparation is always an event on the cloth, whether or not it
is being tested, and a trial may **point at** that event as its experimental step. No second store
of preparation appears.

### A bath is one event, not five copies

Five pieces in one mordant bath is one real occurrence. Recording it as five identical events loses
the fact that the bath was shared — and that fact sometimes explains the result.

It also makes the arithmetic wrong. If five pieces weigh 730 g together and go into one bath, the
historical fact is *730 g of textile, one bath, X g of mordant*. There is no such thing as each
piece's share; inventing one would be the application manufacturing a number nobody measured.

So the group execution is **a first-class record**, not a convenience on a screen. It holds
everything that is shared. The pieces hold only what is theirs, and point at it.

**Every action goes through a group execution, including a single piece.** One mechanism, no special
case, no second path to maintain and no branch in the code that decides which of two writers to use.
On screen a single piece looks exactly as it does now; underneath, its group has one member.

### What an event carries, and what it does not

The recipe holds the standard: temperature, litres, concentrations, percentages. The event holds
only **what was specific to this execution**:

- the date (defaulting to today but editable — work is often typed in later, §13au)
- the action
- the recipe used
- the real combined weight of the goods
- the deviation from the recipe, if any — *"the bath only reached 42 °C"*
- a note
- an observation, if there is one

Temperature, water volume and concentration are entered **only when they differ from the recipe**.
A form that asks for all of them every time is a form nobody fills in, and the app would then hold
a hundred copies of a number that already lives on the recipe.

### The seven actions, and the three boxes

Settled with the owner. The actions:

| code | Bulgarian | moves the box |
|---|---|---|
| `wash` | изпиране | **yes** → изпран |
| `tannin` | танин | no |
| `mordant` | мордантиране | **yes** → мордантиран |
| `neutralise` | неутрализиране | no |
| `iron` | желязна баня | no |
| `soy` | соево мляко | no |
| `bleach` | избелване | no |

Plus `other`, with text, because a closed list that cannot be escaped becomes a list people work
around.

**The boxes are physical.** The owner sorts cloth into two boxes — washed and mordanted — and a new
piece is in neither. Three states, therefore: `unwashed`, `scoured`, `mordanted`. `dyed` and
`finished` remain as states of the piece, not as boxes.

**A state is where the piece is now; the actions are what it has been through.** The state is
derived from the latest box-moving action, as it already is (§13.3). The other five actions are
carried as labels on the piece and change nothing about where it lies.

**The list of boxes lives in one place.** The prototype showed three different sets of boxes on
three screens — the home screen, the fabrics list and the group action — which in a sketch is
carelessness with mock data and in the application would be three lists drifting apart. One
vocabulary, read everywhere.

**The treatment labels travel with the piece.** A piece carrying tannin shows it wherever the
piece is shown: in the fabrics list, in the tick-list of the group action, on its own record, and
in the picker for new work. The prototype showed the labels in two of those four, which is how a
piece silently loses the thing that decides what it is good for.

**`tanned` stops being a state.** This costs nothing: the live database holds three state events in
total — two `scoured`, one `mordanted` — and not one `tanned`. In a year it would have been a
migration.

### Why tannin is not a box, which took asking three times

Tannin is not an intermediate stop on the way to alum. On cellulose it is a **route**, an
alternative to aluminium acetate. A tanned piece may go to eco print with no further treatment, may
go to a paste print, may wait for alum, or may be finished as it is if the tannin colour was the
point.

That is not a stage in a pipeline. It is a piece **carrying a preparation**, with its destination
still open. It stays in the washed box — washed it is, alum it has not had — and carries the label.

### And so "ready to work" is not a property of the cloth

This is the correction that came out of the tannin question, and it applies to something already
built. Screen 2 of the working flow (§8.0e) sorts mordanted pieces to the top under **ready to
work**. By the reasoning above that is wrong: tanned cotton *is* ready to work if the work is an eco
print, and today it sinks to the bottom beside the raw wool.

Readiness is not a property of a piece. It is a property of **the pair of piece and intention**.
Mordanted linen is ready for a madder bath and tanned cotton is not; tanned cotton is ready for an
eco print and raw cotton is not.

So the list stops dividing into *ready* and *the rest*. Every piece shows **what it carries** — its
box, plus the labels of the treatments that did not move it — ordered by how much preparation stands
behind it. The owner decides whether that is enough for what she has in mind. The application knows
what has been done; it does not know what she intends, and guessing costs more than showing.

### The entities

```
Fabric
  … as today
  state            derived from the latest box-moving action

FabricAction        (what FabricStateEvent becomes)
  id
  fabricId
  batchId           always present — a single piece is a batch of one
  actionCode        one of the eight above
  date
  recipeId | null
  chainId | null
  trialId | null    set when this preparation is itself the experiment
  note
  observation

BatchAction
  id
  actionCode
  date
  recipeId | null
  chainId | null
  fabricIds         the pieces that were in the bath
  totalWeightG      what the recipe was scaled against
  deviation         free text — what differed from the recipe
  note
```

Shared facts live once, on the batch. Nothing is copied, so nothing can fall out of step. A piece
shows *"mordanted together with four other pieces"*, which opens the shared action.

### What is not migrated

Preparation steps already sitting inside trials stay where they are and are read as before. A
migration that guesses turns a guess into a fact (§8.0b). The cost is small now — 21 pieces, one
trial, three state events — and would not have been in a year.

### What the sketch showed

A prototype of the screen was drawn before any code. Four things came out of it that the
written specification above did not have.

**A chain is not one action.** The screen asks for one action and then one recipe. But
*Cellulose preparation* is a chain of three — wash, tannin, mordant — and if it is chosen here,
a single execution would carry three recipes and three action codes, which is the opposite of
everything decided above.

So a chain is not picked as a recipe. **Choosing a chain inserts three group executions at
once**, each with the same pieces and the same combined weight, each with its own date and its
own deviation, and any of them can be removed if it did not happen. This is the same rule
already settled for a chain inside a trial (§8.0e): chains are inserted expanded, because what
follows the insert is ticking one off, photographing one, correcting the temperature of one.
That the same answer arrived twice by different routes is a reason to trust it.

**The recipe picker is filtered by the action.** Choosing *mordanting* offers mordant recipes,
not all of them.

**Quantities are ranges, and ceilings still apply.** Recipes carry ranges — 8–10% tannin,
12–15% alum on wool (§5) — so the scaled block shows a range when the recipe holds one. And the
ceiling warning that exists elsewhere in the application must appear here too. This is the one
screen where real powder is being weighed out against the number on it; a warning that is
present in the calculator and absent here is worse than no warning at all.

**The screen says what it will do before it does it.** A line under the action chips: *moves the
chosen pieces into the "mordanted" box*, or, for the five that do not move a box, that nothing
moves. This was not asked for and is kept.

### A note, not a block

Mordanting cloth that has not been scoured usually gives a poor result. The application does not
prevent it — pieces may skip states, and that rule is older than this section — but it says so
quietly, next to the summary: *one of the pieces has not been washed*.

The shape is worth naming, because it will recur: **where an action has a usual precondition that
is not met, the app notes it and proceeds.** Not a confirmation dialogue, not a disabled
checkbox, not a warning colour. A line of text that can be read and ignored. A studio has good
reasons for exceptions, and an application that argues with them stops being used.

The remaining preconditions worth a note are to be listed by the owner; only the unwashed one is
settled here.

### What the build changed

**Preparation leaves the trial.** `prep` is gone from the stages a step can be added to. What
stands in its place on the active trial is a card that **shows and does not hold**: it reads the
pieces' own actions, groups them by batch so one bath is one line however many pieces were in it,
and its *add preparation* button leaves the trial for the group action with this work's pieces
already ticked. Steps already stored under `prep` still render — `STAGE_OF_TYPE` is read and never
written back — so no old record changes and nothing is migrated.

**The handoff is the one that already existed.** Leaving the trial writes the work, records
`returnTo`, and drops the draft, exactly as the new-recipe button does (§13aq). Saving the group
action returns to the work rather than to the fabrics list. Writing a second mechanism for the same
departure would have been the second carrier all over again, one level up.

**"Ready to work" is gone from screen 2.** One list, every piece showing its box and the
treatments it carries, ordered by how much preparation stands behind it. The ordering weights every
treatment the same on purpose: an application that ranked mordanting above tannin would be making
the very guess about intention that this list stopped making.

### Three guards that fired, and were right

Worth recording because each caught a fault in this section's own implementation rather than in
old code.

**The address is parsed in one place, and the query has to be too.** `#/batch?pieces=…` was first
implemented by appending the query to the module's arguments. Every `open(first, second)` in the
application reads its arguments by position, so `#/plants` — no arguments at all — received the
`URLSearchParams` object as `first`, which is truthy, and the module went to fetch a record whose
id was a `URLSearchParams`. A blank screen on every list in the application. `check-boot` caught it
on the first run. The query now reaches only a module that declares `takesQuery`.

**A chip names, a box is pressed (§13ac).** The action row and the box filter were written as
chips and both change the screen when pressed, so both are controls and both need a finger target.
The guard from 0.88.8 refused them.

**A stage card is a run of steps.** The preparation card was given `.stagecardhead`, and the deep
check counts those to prove that dyeing before a print and again after it stays two passes rather
than one. Six where five were expected. The card is not a run — it holds nothing of this work's own
— so it has its own class, and a real guard was kept honest rather than loosened.

### Left open, deliberately

**Can a piece be finished without a trial?** The owner's third tannin case — the tannin colour as
the intended result — means a piece can reach *finished* through a group action and nothing else.
Today `finished` is only reachable by completing a piece of work (§13an: one screen owns finishing
and every route leads to it). If this route is real, the photograph and the assessment that live on
the trial need somewhere else to go. Not solved here; recorded so it is not lost.

---

## 13be. A swatch says which process produced it (0.98.0)

**Status: built.** The data for the nine plants that prompted it is not.

The owner asked for the colours of nine plants that have none, and asked in the same breath
whether a plant that is used for both dyeing and eco printing gives *one* set of colours.

It does not. A leaf may give yellow or beige in an extraction bath and leave olive, grey or
almost black where it lay against iron in a print. That is not a shade of the same answer: eco
printing puts a locally high concentration of plant matter against the cloth with its own contact
chemistry, and is not the same bath in miniature. Pelargonium is the clearest case in the nine —
soft yellow through olive in a bath, grey to near-black in a print with iron.

Under one palette the reader sees a row of circles and cannot tell which process produced which.

### One array with a field, not two arrays

The proposal on the table was `colours.dyeing[]` and `colours.ecoprint[]`, with the general
palette derived as the union of the two.

That splits the record on one dimension and breaks at the next. **Discharge printing is already
planned** (Part B2) and a swatch from it belongs to neither array; a swatch from a pigment or a
watercolour belongs to neither again. Each new process would be another array, another union to
maintain, and another place for the same colour to be written twice.

So: **one array, and two optional fields on the swatch.**

```
{ hex, name, conditions, source, confidence,
  process,    // 'immersion' | 'ecoprint' | … — the existing `process` vocabulary
  partCode }  // 'leaf' | 'fruit' | … — the existing `plant_part` vocabulary
```

Both vocabularies already exist and are already used by trials and combinations. Grouping happens
**on the way to the screen**, in `groupSwatchesByProcess`, and never in storage. The combined
palette the list shows costs nothing to maintain, because it is simply the array.

A plant used only for dyeing has only `immersion` swatches. One used only for printing has only
`ecoprint`. One used for both shows both, under headings.

**Both fields are optional and default to empty.** All 48 plants that carry swatches today have
neither, and a select defaulting to *dyeing* would put a claim on 48 records that nobody made.
Swatches with no process are shown first and without a heading, exactly as they read today;
headings appear only when there is something to tell apart.

### The part comes with it

`partCode` on the swatch is the same decision already taken for temperature and extraction mode
(§13ba), one step further. Elder leaf and elder fruit are not one answer: the leaf gives
yellow-green and olive, the fruit a pink-violet that will not last. Blackberry and rhubarb are
the same shape. The part is now legible on the swatch instead of being buried in the prose
beneath it.

### What is deliberately NOT added

**No colour per mordant.** The swatch already carries `conditions` as free text — *with iron
salts*, *aluminium mordant* — and has done in 48 records for as long as they have existed.
Process × part × mordant × fibre is unreadable to fill in and unreadable to read. The mordant
stays described in the dyeing qualities.

**No fugitive mark on the swatch.** Eight purely anthocyanin plants were removed from the library
rather than kept as warnings, and the ones that remain are marked in the plant's prose. The
owner's decision: it stays there. A third new field on the swatch is not paid for by one case.

### The guard, seen to fail twice

Grouping is where things go missing, so `deep-check.mjs` §14 asserts that the count in equals the
count out, that a swatch with no process survives ungrouped rather than being filtered away, and
that a bath swatch and a print swatch land in different groups.

Broken deliberately in both directions. Dropping the ungrouped list reported *3 in, 2 out* — and
was also caught by the older guard comparing the list column against the record, which is the
right kind of redundancy. Defaulting an absent process to `immersion` reported a swatch under the
wrong process.

### On the colours themselves, before they are entered

The hex values proposed for the nine are **inferred from descriptions, not measured**. That is
the fault §13d names: a hex read out of a sentence is a guess wearing the costume of a
measurement. They may be entered, but as `literature`, never as `own_trial`.

More pressing: the sources named for them — CAMEO, Maiwa, Natures Rainbow — **are not in the
Sources register**. Every swatch on the 48 existing plants credits *НАТУРАЛНИ БАГРИЛА, Crafty
Place*. New sources enter the register with author and title before anything cites them, or the
library breaks its own rule (§13r, Part A2).

And two of the nine need care rather than completeness. Elder fruit and blackberry fruit give an
anthocyanin pink-violet that does not last. Entered without the plant's prose saying so, a violet
circle reads as a promise.

### The data, entered (0.98.1)

**Two sources added to the register**, with author and address: CAMEO, the materials encyclopedia
of the Museum of Fine Arts in Boston, and Nature's Rainbow, a British dye-plant growing project by
Ashley Walker and Susan Dye. Maiwa was already there. Six sources now.

**44 swatches across the nine**, written by `scripts/add-swatches.py` so the work is repeatable
rather than typed once into a file. Idempotent: a plant that already carries swatches is skipped.
Every one is `literature`, every one names a part the plant actually has — the script refuses to
write a part the record does not carry — and every one cites a source by its register code.

**The existing 132 were normalised in the same pass.** They carried the register's name as prose,
`НАТУРАЛНИ БАГРИЛА, Crafty Place`, where the new ones cite `crafty-place-guide`. One value mapped
to one code is not a guess. 176 swatches in all, and **57 of 57 plants now say what colour they
give** — the first time the library has been complete in the column that matters most to someone
who dyes (§13h).

Pelargonium is the case that justified the change on its own: soft yellow, yellow-green and olive
under *dyeing*; grey-green and near-black under *eco print*. Elder carries seven swatches across
three parts and both processes, which under one flat palette would have been an unreadable row.

### Four guards, each seen to fail

Read from the **seed files**, not from the database: the claim is about what ships, and earlier
sections of `deep-check.mjs` create scratch plants and edit real ones on purpose. The first version
read the database and reported an avocado an earlier section had emptied — a failure the library
did not have.

Every shipped plant gives a colour · every citation reaches the register · every swatch says how
well it is known · every part named on a swatch is a part of that plant. Broken one at a time:
emptying a plant, citing a book nobody has, deleting a confidence marker, and putting a gall on a
safflower. All four fired.

**And one older guard was rewritten rather than deleted.** It had insisted the nine carry *no*
colours, because a hex read out of a sentence would answer reverse searches beside colours
actually obtained off cloth. That decision was reversed deliberately here. What protects the
reverse search now is not absence but the confidence marker, so the guard checks that instead:
the nine must have colours, and every one must be `literature` and never `own_trial`. A guard
whose reasoning has expired is rewritten to the new reasoning, not removed.

---

## 13bf. What real use found in 0.98.0 (0.98.2)

Feedback from the owner after working with the release. The first item is a defect that made the
whole of §13bd unusable; the rest are language, order and one panel that should not greet a buyer.

### The tick that opened the record

**Ticking a piece in the fabrics list opened the piece instead of selecting it.** The checkbox sits
inside the row, and the row's `[data-open]` swallowed its click. So the bulk bar never appeared,
a second piece could never be added, and a group action could not be gathered at all.

The fix is three lines. The gap it exposes is the thing worth recording.

`deep-check.mjs` opened every record and asserted every screen rendered, and `screen-check.mjs`
asserted every address drew at phone width with usable touch targets. Both passed on 0.98.0, and
the feature shipped with its only entry point unusable. **A screen that draws is not a screen that
works.** The checks knew how to look at a page and did not know how to walk a path.

§16 of the deep check now walks the path a person walks — tick, tick, press — and asserts the
address that comes out of it. It was seen to fail: with the fix removed it reports the reported
symptom, the record opening and the bar never appearing.

### Language and order on the group action

- **Title**: *One bath, several pieces* → *One action across several fabrics*. The old one was
  written for the model rather than for the person: a bath is what the record is, not what she is
  doing.
- **Subtitle** now says when to reach for it — one scour or one mordant bath serving several
  pieces — rather than explaining the data model.
- **Section heading**: *The action itself* → *Action*.
- **The recipe comes before the date.** The recipe is the decision; the date is nearly always
  today and is edited only when work is typed in later.

### Elsewhere

- **The reference module's subtitle** now says what the module is for — *what to expect from a
  given set of inputs* — rather than describing the behaviour of its form.
- **The plants list column** *Gives* → *What it gives*.
- **The plant profile's** *Внимавай* → *Внимание*. An instruction became a heading, which is what
  it is.
- **Saving a piece of work now says so.** The trials screen redrew and stayed silent, so pressing
  Save read as pressing nothing. Every other module confirms; this one was the exception.
- **The fabrics list gained a search.** Filtering by box answers *what is in the mordanted box*;
  it does not answer *where is П-042*, which is the question asked with a piece already in hand.
  A tick survives a search that hides the row it was made on.

### The reliability panel leaves the home screen

The home screen carried a count of claims awaiting testing, headed *Confidence*, with the line
*the library rests on a compilation; your tests make it yours*.

That is addressed to the owner of a private notebook. To someone who has paid for the library, the
first thing the application says about itself is a number of things it is not sure of. Removed
(Part A6). The count is not wrong and is not deleted as an idea: it belongs inside the reference
module as a filter for finding what to test, which is a tool rather than a greeting.

**What the home screen should carry instead is still open.** Asked by the owner, not yet answered.

### Still open from this round

Icons, and the visual hierarchy of headings in the plant profile — *Why it works* is set smaller
than *Dye constituent*, which sits inside it, so the two levels are the wrong way round. Both need
the v0 prototype's drawings in front of us rather than a guess, and the heading levels want
settling once for the whole application rather than screen by screen.

Also raised and not yet acted on: a visual indication of how much of a constituent a plant carries
(tannin high/medium/low is a code and reads as a word); icons for recipe types, temperature and
time; the fibre-class field on a chain, whose purpose is not clear from the screen; and the layout
of the trial history, where the last two columns are too narrow and the notes are not set apart.

---

## 13bg. Two heading levels, settled once (0.98.3)

Reported from real use: in the plant profile, *Защо действа* is set smaller than *Багрилна
съставка*, which sits inside it.

It was true, and it was true everywhere. A section heading was **11.5px** and a subheading inside
it was **13px**. The inner level shouted over the outer across the whole application, and nobody
could see it from the code because the two numbers sat six hundred lines apart in one stylesheet.

### The scale

Two variables in one block, `--h-section: 13px` and `--h-sub: 12.5px`, and nothing sets a heading
size by hand. The outer is larger.

They also differ on a second axis, because a pixel and a half is not a difference anyone reads as
deliberate: **the outer is uppercase, letterspaced and muted; the inner is sentence case, tight and
in ink.** Uppercase muted reads as a label over a region; sentence-case ink reads as the name of
something within it. Two axes, so the hierarchy survives being seen at a glance.

`.subhead` and `.difhead h3` were separately set at 12px and 13px and now read from the same pair.
Four heading treatments had drifted apart; there is one scale now.

### The guard

Checked as numbers in `check-scope.js`, because a screenshot cannot fail a build: the section size
must be greater than the subheading size, and no heading rule may set a pixel value directly. Seen
to fail in both directions — inverting the pair reports the inversion, and hardcoding 14px on
`.sub h3` reports the hardcoding.

This is the check that would have caught the original fault on the day it was written.

### Language taken from the prototype

The prototype names two things better than the application did, and both names are now the
application's:

- **Изчисли за тегло** → **Мащабирай тази рецепта**.
- **План за конкретно тегло плат** → **Мащабирай тази верига**. A recipe and a chain now say the
  same thing in the same words, where before the two screens named one action differently.

### A labelling fault, not a model fault

*Клас влакно* on a chain: the owner could not tell what it was for. It is not decoration — it
decides **which ingredients drop out**, because some roles apply only to protein and some only to
cellulose, and the brightener disappears for cellulose entirely.

So the field stays and the label changes: **Върху какво влакно**, with the hint saying what it
does. The distinction the owner draws herself — *I did not know what that field meant* is a
labelling fault, not a data error — and the fix belongs on the label.

### Still not done: the icons

The prototype's icons cannot be read from its pages as text, so they are still unseen and are
deliberately not guessed at. They remain in Part B5b: the left-hand menu, recipe types, single
recipes, temperature and time, material kinds, and the trial screens.

---

## 13bh. Marks, and a quantity you can see (0.99.0)

The prototype's icons, read from screenshots because they do not come through its pages as text.
They are Lucide, and twelve of them are now in the sprite.

### Redrawn, not imported

Drawn into `index.html`'s sprite at its own stroke weight rather than pulled in as a dependency:
the application has no build step, and a network request for twelve paths would be a poor trade
for an offline-first tool.

`i-flask` mordanting and preparation · `i-bath` a dye bath · `i-drops` washing · `i-layers` tannin
· `i-finish` a binding or finishing step · `i-compound` a salt with a formula · `i-vial` a solution
· `i-temp` · `i-time` · `i-again` would do again · `i-alert` · `i-then` from intention to outcome.

### Not borrowed: the colour

In the prototype the icons sit in indigo discs and the scouring mark is red. Here indigo is
navigation and active states only, and madder is an accent. An icon that is neither is ink or
muted, so a row of marks cannot compete with a swatch of dyed cloth — which is the reason the whole
palette is quiet in the first place.

### A quantity, seen rather than read

*Trace*, *moderate*, *high* and *dominant* are four words of about the same length that read at the
same weight, so a plant's chemistry has to be read one line at a time. The prototype shows them as
filled segments, and it is right: four of four is taken in at a glance, and two rows can be
compared without reading either.

`levelBar(filled, of, word)` in `ui.js`. The bar is indigo rather than a ramp from green to red —
a coloured scale beside a photograph of dyed cloth is a second opinion about colour, and no screen
here may have one. The bar carries `aria-hidden`, because the word is right beside it and saying
it twice helps nobody.

### The rule that an icon set erodes

**A mark accompanies a label and never replaces it** (§13ac). This is the rule an icon set quietly
eats: one glyph stands in for a word, then two, and a screen becomes unreadable to anyone who does
not already know what the pictures mean.

So every mark added here sits beside its word: the stage cards keep their names, the recipe types
keep theirs, a temperature keeps its °C, and the level bar keeps its word.

`deep-check.mjs` §17 asserts exactly that, and both halves were seen to fail — emptying the level
bar's word reported two bars showing a quantity and no word; removing the recipe type's name
reported two types showing an icon and no name.

**And the guard caught itself first.** It looked for madder by `p.code`, which a seeded record does
not carry — the code lives in the id as `seed:<code>`. The check passed by not running, which is
the quietest way for a guard to be useless, and is worth remembering as a failure mode of its own:
a check that finds nothing to check must say so rather than say nothing.

### Still not done from this round

The trial history layout — the last two columns too narrow, the notes not set apart, and an arrow
between *what I meant to do* and what followed. `i-then` is drawn and waiting for it. The layout
wants deciding on a wide screen with real records in front of us rather than guessed at.

---

## 13bi. The review, read against two real records (0.99.1)

Two screenshots of finished work — a cotton tunic with four short facts, and a boiler suit with
seven plants, seven colours and three paragraphs. The second is what a full record looks like, and
it is where the screen came apart.

### The four facts were sized into equal columns

`repeat(auto-fit, minmax(130px, 1fr))` gives every fact the same width whatever it holds. So *eco
print* had the same room as seven plant names, and two cells wrapped into narrow ribbons while two
sat half empty. Reported as *the last two are in such narrow columns, it does not sit well*.

Now a flex row: each fact is based on its own content and shares what is left over. A long list
gets the room it needs from a short one that does not need it.

### Three treatments for four kinds of writing

In one panel: the intention in a headed box, **what happened as loose prose with no heading at
all**, and what she would change and the notes squeezed into a two-column fact grid, where a
paragraph got half the width of the page. Reported as *the notes are not set apart*, which was the
visible half of a larger fault.

Now four blocks with one heading treatment, and an order that is the shape of the record:

**Intention and outcome sit side by side, with an arrow between them** (`i-then`, drawn in
§13bh and waiting for this). The owner asked for exactly that arrow, and she was identifying the
point of the whole screen: a trial exists to answer what was meant against what came of it, and
stacking them loses that they answer each other. On a narrow screen the arrow turns and they stack,
because side by side in 380px is two ribbons again.

Below them, **set apart by a rule**: what she would change. Then the notes, quieter still — they
are the margin of the record rather than its argument.

### The stages carry their marks

The collapsed process list — raw cloth, preparation, decoration, colouring, finished — now carries
the stage marks from §13bh beside the tick, not instead of it. The tick says whether it happened;
the mark says what kind of thing it was.

### The guard

`deep-check.mjs` §18 builds a record with all four kinds of writing and asserts four blocks, a
heading on each, the arrow, the notes set apart, and — the one that matters most — **that every
word survives**. A layout change that silently drops a paragraph is the worst kind of fault,
because the screen still looks right.

Seen to fail: putting the notes back into a fact grid and removing the arrow reported three blocks
where four were expected, and no arrow.

### A flake worth naming

`check.sh` failed once with *the view rendered nothing* and passed on an identical re-run. It was
almost certainly contention with an `npm install` running beside it, but the principle here is that
**a check that fails at random is worse than no check** — anything timed waits on a condition and
never on a duration. If it recurs, `check-boot.mjs` is where to look, and it should be made to wait
for the first render rather than for a number of milliseconds.

---

## 13bj. Working a finished piece again (0.99.2)

Reported from real use, from one attempt: mark a silk scarf finished, press *work on this piece
again*, add preparation, choose a mordant recipe — and be stopped. Two faults, and the archive
shows both.

### The handoff asked to discard work it had just saved

*Add preparation* writes the record, remembers the way back, and leaves for the group action. What
it did not do is **tell the unsaved-work guard the record had been written.** So the guard asked
whether to discard unsaved changes over work already in the database, and neither answer was any
use: leaving discarded the draft, staying went nowhere.

The guard clears itself when it sees a form leave the screen after a click on Save (`dirty.js`). A
handoff saves without that click, so it has to say so.

Both handoffs — this one and *write a recipe from this step* — were written out separately, and the
second copy is where the omission was. **They are now one function, `handOff`, so a third cannot
forget.**

The group action itself worked throughout: the archive holds a real mordant batch, 28 g against the
scarf, recipe attached, dated 11.08. The record was never the problem; getting back out was.

### *Work on this piece again* made a rival record every time

It went to `#/trials/new/<id>` without looking. Pressed twice while working around the fault above,
it left the scarf with **two pieces of work in progress** — one holding the intention and no steps,
the other a step and no intention — and no sign on any screen that the first existed.

Screen 2's picker had this right all along: it excludes cloth that is busy. The finished card's own
button did not.

**A piece can only be in one bath at a time**, so if work on it is open, that *is* the work on it,
and the button opens it. Starting genuinely separate work on the same piece is still possible —
finish the first. That matches the cloth: there is one scarf.

Derived on open, never stored: no back-references (§13.1).

### Two tests that passed against code known to be broken

Worth writing down, because both are the same mistake in different clothes and both were caught
only by deliberately breaking the fix.

**Counting calls to `confirm` missed it.** The guard's question is an *injected* function so the
check suite can drive it, so the global `confirm` is never called and the count never moved.

**Reading `isDirty` afterwards missed it too.** The guard clears itself the moment the question is
answered, and the stub answers yes — so the broken version and the correct one ended in exactly the
same state. The only difference between them is whether the question was asked at all.

So `dirty.js` now counts its own questions and exports `askCount()`. The assertion is that leaving
after a save **asks nothing**, and with `markClean` removed it fails.

The general shape: **when an assertion cannot distinguish the fault it was written for, it is not a
weak test but a false one.** Break the fix and watch, every time.

### Not repaired automatically

The two records for the scarf are left as they are. One carries *Мордантиране с алуминиев ацетат и
нов еко принт* and no steps; the other a mordant step under after-treatment and no intention.
Merging them means choosing which intention and which step belong together, and a migration that
guesses turns a guess into a fact (§8.0b). The owner deletes the one she does not want and carries
on in the other; from 0.99.2 the button will take her back to it.

---

## 13bk. The readers moved and one writer stayed (0.99.3)

The owner asked whether re-working a finished piece carries through to the end — a second eco
print, which leaves went on, and finishing again. Rather than send her back to try it, the path was
walked in the checking harness against her own archive.

**The path is whole.** Open the work, add a colouring step, record the plant, press finish, and the
step and the placement are already stored by the time the finishing screen opens. Nothing was
missing from the route.

**The cloth was never told.** After the work went complete, the scarf's biography read *washing,
mordanting* and nothing else. It stayed in the mordanted box.

### The fault

§13bd converted every **reader** of a fabric's history to `actions` and left one **writer** on
`stateEvents`. So from 0.98.0 finishing a piece of work stamped a list that nothing read.

It survived four releases because it looks like nothing. The work completes, the diary lists it,
the screen is right. Only the cloth is silently wrong, and only for someone who goes looking at a
piece's own record days later.

And it was concealed by exactly the thing that is supposed to help: `currentState` falls back to
`stateEvents` for a record that has never been migrated. After the migration none has. **A fallback
that produces plausible output hides the fault it covers for** — written into this specification
long before this, and true again.

Three writers converted: finishing a piece of work, adding a state by hand on the fabric record,
and the empty history a piece cut from a batch starts with. The hand-entered one now writes a batch
of one, like everything else, so the invariant that an action belongs to a batch or to a trial
holds for it too.

### The check that would have caught it

`check-actions.mjs` now reads the source of the four files that touch a fabric's history and fails
if anything **writes** to `stateEvents`. Reading it is allowed — records predating the migration
still hold it — and resetting it to empty is allowed. Adding to it is not.

A line that repairs old records on purpose says so with a `legacy:` marker, of which there is
exactly one: the repair for records written before §13bd.

The first version of this check used a regular expression with a negative lookahead and reported
an empty-array reset as a write. It was rewritten as four readable lines. **A check nobody can read
is a check nobody can trust**, and one that cries wolf gets switched off.

Seen to fail: putting the old push back reports the file and the line.

### Two older checks had gone quiet

Both asserted things about `stateEvents` and both went on passing after §13bd moved the readers,
because the writer was still filling the list they read. They only spoke up once the writer moved
too.

That is worth stating plainly: **for four releases, two checks were watching a list the application
had stopped using.** A check pointed at the wrong thing is not neutral — it reads as coverage.
When a store or a field is replaced, every check that names it has to be walked, not just the code.

### And the whole path is now a check

`deep-check.mjs` §20 walks it: open work in progress, add a colouring step, lay a plant on it,
finish, and assert that the work completes, that **the cloth carries the finishing**, and that
nothing was written to the old list. The middle one is the assertion that four releases needed.

---

## 13bl. The preparation card, laid out (0.99.4)

The card that shows what the cloth has been through was three spans with dots between them:
`изпиране` `5.08.2026 г.` ` · ` `Мордантиране на целулоза с алуминиев ацетат`. Reported as *the
text is stuck together*, and it was — it read as one sentence broken in the wrong places.

Now four columns: a mark, what was done, when, and what with. The dates line up down the list, so
the eye runs the column instead of reading each line. On a phone the columns fold under the mark
rather than compressing into ribbons.

The marks are the same ones the group action offers, because that is where these lines are written.

### What the card is for, since it was asked

It shows the cloth's own preparation, read from the cloth. It holds nothing: preparation is the
biography of the piece and not part of any one trial (§13bd), which is why the button on it leaves
for the group action rather than opening a form.

It shows **everything the cloth has been through**, not only what happened since the last time it
was finished. For re-worked cloth that means the first scouring stays visible under a second print,
which is true of the cloth and is the point of a biography.

### Re-working a finished piece, as it is meant to go

Recorded because the owner asked and the answer is not obvious from the screens:

- **A new mordant is preparation**, so it goes through *add preparation* and the group action. It
  is something done to the cloth, not a step of this trial.
- **The new print** is a step in *colouring and printing*, with the placements on it.
- **An iron bath after the print** is after-treatment, and that is what that stage is for.
- Then finish, with the photograph and the assessment.

### A check that took the screen from another check

The new assertion was first written inside §18, the story check, and its fixture record became the
record §18 was reading — three of that check's assertions failed on evidence that was never theirs.

**A check that builds a fixture owns the screen while it does.** Moved to its own section, and the
lesson is worth more than the fix: a false failure costs the same trust as a false pass.

---

## 13bm. A record that could be made and not unmade (0.99.5)

Reported from real use, and the owner's judgement of it was right: *this is proof the feature is
not intuitive*. A scarf ended with two mordantings, the 11th and the 18th, one of them a mistake,
and **nothing on any screen could take either of them back**.

That is not a confusing screen. It is a hole. The group action wrote onto the cloth and then
offered nothing but reading — no correction, no removal. Anything that can be created must be
correctable and removable, and this was neither.

### Correcting and unmaking

The bath's own screen — already reachable by pressing a line in the preparation card — now carries
the date, the deviation and the note as fields, with **Save** and **Delete the action**.

**Deleting the bath deletes what it wrote on every piece in it**, because they are one fact.
Leaving the pieces' actions behind would produce exactly the orphans §13bd forbids: an action
belonging to nothing.

**Correcting the date corrects it on every piece too.** The date lives in two places on purpose —
on the bath, and on each piece's action, so a piece's biography can be read without fetching every
bath it was ever in. Two places can differ, so one write fixes both.

### Not making the mistake twice

A note, in the shape §13bd established: choosing an action for a piece that has been through **that
same action within the last thirty days** says so, names the piece, and says how long ago —
suggesting the earlier record be corrected rather than a second added.

A note and not a block. Mordanting twice is a real thing to do, and an application that refuses it
is wrong more often than the person is.

### Every button on that screen was dead

Found by the new check, not by reading. The read view returned **before** the handler wiring, and
the wiring sat behind a `root.dataset.wired` flag. So opening a recorded bath from a preparation
line wired nothing: back, the pieces, and later the new buttons, all inert.

The flag was wrong twice over. It sat after an early `return`, and `root` is shared between
modules — each assigns its own `onclick` on the way past, so a flag set here stays true while the
handler belongs to somebody else. Handlers are now assigned on every render, as every other module
in the application does it. Assignment replaces rather than adds, so re-wiring cannot double one.

**A screen with no handlers looks exactly like a screen with handlers.** Nothing renders wrong;
pressing simply does nothing, and there is no way to tell that from a click that missed.

### Two faults in the check, both mine

Worth recording because both made working code look broken, which costs the same trust as the
reverse.

**A node held across a redraw.** The delete button was captured before the save, the save redrew
the screen, and the captured node was detached — clicking it did nothing and the check reported the
deletion as broken.

**`get` on a missing key.** It returns `undefined` here, and the first version wrapped it in a
`.catch()` that never fired.

---

## 13bn. The strip shows the piece, not one trial (0.99.6)

A silk scarf printed twice. Its second record showed the raw cloth and the final result and
nothing between — and from the strip there was no way to tell the piece had been printed before,
which is the one thing a second print most needs to say.

The strip was built from **this trial alone**. For a piece worked once that is the same thing as
its life; for a piece worked twice it is a lie by omission. **The earlier print is how this one
started**, and leaving it out makes a second look like a first.

It now spans every piece of work on that cloth, and the cloth's own first photograph.

### Cut off after this work

Not everything the cloth ever became. Reading a finished record should not show what happened to
it afterwards, which had not happened when the record was written. A trial is a document of a
moment, and a document that keeps growing after it is signed is not one.

So: every work on this cloth up to and including this one, in date order.

### Marked, not merged

Shots from earlier work are set back — slightly faded, with a dashed rule down the left and the
work's own name under the caption — and a line beneath says which number this work is on the piece.

Said only when there is more than one work. On a piece worked once, a label naming the work is
noise; on a piece worked twice it is the entire point.

### Both directions, seen to fail

Narrowing the strip back to one trial reported that nothing marks the earlier shots. Widening it to
every trial on the cloth reported that the first piece of work shows work that came later. A scope
has two edges and a check that only holds one of them holds none.

---

## 13bo. One icon language, four action levels, four headers (1.0.0-rc1)

A limited consistency pass, audited before anything was changed. No data model, no workflow, no
information architecture: iconography, action hierarchy, page headers.

The audit's finding was the opposite of the expectation. The application was not inconsistent for
want of a system — it has one `page()`, one `.btn`, one sprite. It had **drifted inside its own
system**, and drift is invisible by reading because every screen looks reasonable on its own.

### A · Icons

Three faults, all found by counting rather than by looking:

- **`i-bath` was defined twice.** A sprite with two symbols of one id silently serves the first, so
  every use of the dye-bath mark since 0.99.0 had been drawing the calculators' bath-volume icon.
  Renamed to `i-beaker`.
- **`s-tanned` outlived its state**, which went in 0.98.0.
- **Fifty symbols, used in seven modules of fourteen** — and not one *semantic* action marked
  anywhere. Add, edit, delete, back, search, filter, photo, favourite, duplicate, more: all text.

`ACTION_ICONS` in `ui.js` is now the one place a semantic action is bound to a mark, and
`actionBtn(kind, text, attrs, level)` is how a button is written. Ten new symbols, silhouettes
deliberately unlike one another. `save` and `cancel` map to nothing on purpose: the primary button
already carries the weight and a mark on it is noise.

**The favourite star was two glyphs**, ★ and ☆, which differ in weight as well as in fill — so a
starred row read as heavier for reasons nothing to do with being starred. One outline symbol now,
filled or not.

### B · Action hierarchy

Counted: 83 quiet, 34 primary, 11 destructive, **11 with no level at all**. The eleven are the
drift — nobody decided, so they took the default and sat between the other two. Each was given a
level one at a time; none was a mechanical rename.

Two findings worth keeping:

- **The fabrics list header had two primaries** once the group action was promoted. Two primaries
  in one header is no primary at all. Adding cloth is what the list is for; a group action acts on
  pieces already chosen and has its own primary on the bulk bar.
- **One destructive action was not quiet** — `data-batch-del`, two hours old at the time. A delete
  that shouts is a delete that gets pressed.

A fourth level was added: **contextual**. `quiet` was doing duty for the second action of a screen
*and* for add-a-row inside a list, and they do not want the same weight.

The audit was also wrong about one thing, which is worth recording: it claimed *edit* was quiet on
read screens. It was already primary in five of six. Only `fabrics` had it quiet.

### C · Page headers

Four variants over the one `page()`: `pageList`, `pageRead`, `pageForm`, `pageWork`.

**"Back" became the module's own name.** Seventeen buttons reading *Назад* are now *← Тъкани*,
*← Рецепти*, *← Растения*. Two reasons, and the second matters more: it says where it goes, and it
is an **address** rather than a step through history — the address is the state (§13q), and a
bookmarked or shared record has no history to step back through. Handled once in `app.js` through
`navigate`, so the unsaved-work guard sees it like any other move; two modules' private back
handlers were deleted as dead.

### The checks

`check-scope.js` gained both: no symbol defined twice, no icon asked for that is not in the sprite,
no `actionBtn` naming an action the map does not own; and no button without a level, no destructive
action that is not quiet, no page header with two primaries. All seen to fail.

### And the pass moved what the checks held on to

Renaming *back* broke `deep-check.mjs` in three places at once: it walks out of a record by pressing
`[data-back]` until the list reappears, and that control no longer existed. It reported *no star
rendered in the list* — a true failure with a misleading name, because the walk had stopped one
screen earlier than it thought.

Worth stating: **a UI pass moves the handles the checks grip.** A check that walks a route is
exactly the kind that a rename breaks, and that is a reason to update it rather than to stop writing
them — a check that could not notice would have been no help here either.

### Deliberate exceptions

- **`dashboard`, `materials`, `packs`** — no page actions and no records; nothing in A/B/C applies.
  `materials` is a redirect and `packs` is parked.
- **`trials`' cancel** stays a cancel rather than becoming a way up. It abandons a form; it does not
  navigate out of a record, and dressing it as one would promise something else.
- **The calculators' `i-bath`** keeps the id it had first. It was there before the collision and
  renaming it would have moved the fault rather than fixing it.

---

## 13bp. The band numbers, checked against the library (1.0.0-rc2)

The bands decide which results merge into one reference record. They shipped as data precisely so
revising them would cost nothing, and were marked provisional from the start — but until now nobody
had held them up against the library they band.

Doing so found three things, one of them serious.

### One scale was being asked to band two incompatible quantities

`concentration` ran trace <0.5% · low 0.5–1.5 · medium 1.5–2.5 · high >2.5. It served the mordant
strength in a combination key **and** nominally the dyestuff quantity on a plant part — where the
library's values run from 15% to 500%. All 250 dosings landed in *high*. The scale distinguished
nothing at all on that side.

Dyestuff now has its own dimension, `dyestuff_ratio`, with boundaries drawn where the library's own
values cluster: sparing <50% · usual 50–150 · strong 150–300 · very strong >300. Against the real
data that divides 14 / 83 / 26 / 2 — a scale rather than a label.

### The numbers were drawn around iron and the data was written for alum

The standard doses the application already holds: **alum 15%, alum acetate 6%, iron 1%, copper 2%,
titanium 2%.**

On an absolute scale, every ordinary alum mordanting is *high* and every ordinary iron mordanting is
*low*. Yet sixteen of the thirty-one seeded combinations record alum as **medium** — because
whoever wrote them meant *the usual amount*. **The definitions and the data already disagreed**, and
had since both were written.

The cause is that mordant strength is not absolute. 2% iron is a great deal; 2% alum is nothing. No
single scale can serve both, and the one that tried was built around iron.

**So the band is now a multiple of that substance's own standard dose:** trace <0.25× · low
0.25–0.75 · medium 0.75–1.25 · high >1.25×. Medium alum is 11–19%, medium iron 0.75–1.25%, medium
acetate 4.5–7.5%. The sixteen combinations become correct without being touched.

`mordantBand(percentWof, substance)` returns null when the substance carries no standard dose. A
ratio against an unknown reference is not a weak answer but an invented one, and the caller has to
be able to tell (§13d).

The reference screen shows what the chosen band means in real percent for the chosen mordant —
because *medium* says nothing until the mordant is known, and someone reading only the word would
be out by a factor of fifteen. It shows nothing when no mordant is chosen: an example would read as
the answer.

### The temperature revision is modest, and the reason is in the data

The old four put 104 of 114 recorded dye temperatures into *simmer*. Redrawn on the library's own
figures — cold <40 · warm 40–65 · hot 65–85 · simmer 85–95 · boil >95 — it is 10 / 99 / 5.

**Better, and not much better, and this is worth stating plainly rather than dressing up.** The old
scale already separated the case that matters: madder, which must stay under about 60 °C or it
loses its red, from oak bark worked at 85–95. Both scales tell them apart.

The reason no scale does better is in the data, not in the numbers: **74 of the 114 values are
exactly 75 °C** — a default written across the library rather than a measured spread. A band cannot
divide what the records do not distinguish. The fix for that is a thermometer, not an edit.

A threshold was deliberately NOT added to make the old scale fail this check. 91% of the library in
one band against 87% is not a meaningful difference, and a boundary placed between them would be
fitted to the answer rather than to the craft.

### `bandFor` was never called

The bands existed as data and nothing turned a real figure into one. Every band in the seeded
combinations was written by hand. So a trial that produced an actual number had no way to find its
combination — which is the fixed decision *combinations match on bands* not being implemented at
all, only described.

The reference screen now reads the relative scale. Wiring the trial side — a recorded temperature
or dose finding its band on save — is the next step and is listed as such.

### The guard

`deep-check.mjs` §24 holds the bands against the seeded library rather than against itself: every
band a combination names must exist on the scale it is read against; **every mordant at its own
standard dose must band as medium**; iron and alum must not band alike at the same percentage; the
temperature scale must divide the library into more than one band; madder and oak bark must be told
apart; and no band may claim a range it has not got.

The second and third were seen to fail by restoring the absolute scale, which reported ordinary
alum as *high*, ordinary iron as *low*, and 4% of each as identical — the three faults that
prompted the change, in one line.

---

## 13bq. A placement finds its reference record (1.0.0-rc3)

The other half of §13bp, and the half that makes *combinations match on bands* true rather than
merely written down.

### The matcher read three dimensions of eight

`matchCombination` compared plant, part and process. Not fibre class, not mordant, not strength. So
**oak bark with iron and oak bark with alum attached to the same reference record** — two results
that look nothing alike, filed as one answer. The library has held separate records for both since
it was seeded; nothing was reading them.

It now compares every dimension of the key the trial actually knows, and a dimension the trial does
not know is not matched against: an unrecorded mordant is not the same as no mordant, and treating
it as one files a result under a condition nobody worked in. Where more than one record survives,
the one agreeing on **more** known dimensions wins — otherwise the order of the seed file would
decide the reference.

### The mordant is usually not on the trial

Since §13bd, preparation belongs to the cloth. So an ordinary piece of work names no mordant at all,
and a matcher reading only the trial's steps sees nothing on almost every real record.

`mordantOf` reads the trial's own mordant step first — when mordanting *is* the experiment, that is
where it lives and it is the more specific answer — and otherwise the last mordanting on the cloth
**on or before the day of the work**. Later mordantings belong to work that came after and must not
be read back into it (§13bn).

### Three faults found by writing the check

**A recipe's ingredient is a role, not a substance.** The first version looked for
`ingredient.substanceId`, which exists on no real recipe: an ingredient is a role filled by one of
several options, and the quantity is on the option (§5). It found nothing, everywhere, and matched
everything to one record — a fault that produces plausible output.

**`fibreClass` takes a composition, not a piece.** Passing the piece threw on every save.

**The check itself was naive.** It mordanted both fixtures at the standard dose and read the iron
non-match as a fault. It was not: the oak iron record names *low* iron, and the standard 1% is
*medium* — a different condition, and rightly a different record. The relative scale was working
and the test was asking the wrong question.

### And a finding in the data

Four questions in the seeded library have more than one answer — two records with an identical key,
where which one a trial reaches is decided by the order of the file.

One of the four is not a duplicate at all. The two tagetes records are named *acid* and *alkaline*,
and **the key has no pH slot** — the search asks about pH and the key cannot carry it. That is a gap
in the model, not a mistake in the data, and it is the same shape as the open question about season
(§16.0): a dimension that matters for some plants and not for most.

Reported by `deep-check.mjs` §24b and deliberately **not** failed. Repairing them means either
adding pH to the key or deciding two records are one, and that is the owner's decision; inferring
it from a code string would be a migration that guesses. A hard failure over outstanding data work
is a check that gets switched off, and a check that is off protects nothing.

---

## 13br. pH was already in the key (1.0.0-rc4)

The owner's judgement was right and the reason was the right one: **pH is not a condition of the
bath but a modifier of the colour.** Tagetes on cellulose, the same mordant at the same strength,
gives pale yellow in acid and bright canary in alkali. Madder needs alkaline water for red.

So it belongs in the key. And it has been in the key since the library was seeded, inside
`medium: { phCode, whereCode }`.

### The check invented the fault it reported

§24b flattened the key with `.join('|')`. `medium` and `blanket` are objects, so both became
`[object Object]`, and **every pair that differed only by pH looked identical**. That is how it
reported that the model had no pH slot when the model had carried one all along — and it nearly
bought a change to the key, a migration over every record, to add a field that was there.

**A check that flattens a structure it does not understand invents the fault it reports.** The
comparison is `JSON.stringify` now, which is uglier and true.

With it fixed, the four questions with two answers became three, and the tagetes pair — the one
that raised the whole question — was never one of them.

### What was actually missing

Not the field. The **matcher**, which compared fibre, mordant and strength and not pH. So an acid
bath and an alkaline bath on one plant still reached one record, for want of one line.

`phOf(trial)` reads the pH from the step that names one. Null means **not recorded**, which is not
neutral: an unmeasured bath is usually near neutral and sometimes not, and filing an unmeasured
result under *neutral* would put a guess into the reference.

Seen to fail: removing the comparison reports an acid and an alkaline bath matching the same record.

### Three questions still have two answers

Genuine, and data rather than model:

- oak bark with alum — *beige, ochre, light to medium brown* and *a clean golden tone*
- madder root in alkali — *bright red* and *raspberry*
- indigo leaf — *deep indigo* and *soft blue*

Each pair is one key and two colours. Either the key is missing a dimension that separates them —
concentration of dyestuff is the obvious candidate, and `dyestuff_ratio` now exists (§13bp) — or
they are one record whose expected result should say *from beige to golden*, which is what the
`variation` field is for. Both are the owner's call; neither can be inferred from what is written.

### Resolved: one record each, not a new key dimension (1.0.0-rc6)

The owner's call: dye strength, not a new dimension in the key. Wiring `dyestuff_ratio` into the
key would need a reader like `mordantOf`/`phOf` — and there is nothing to read yet. No placement
records a dye's percent WOF against the fibre, so the dimension would have entered the key with no
way for a real trial to reach it. That is a larger and separate piece of work, listed on its own
merit if it is ever wanted; it was not needed to close these three.

**`variation` already meant something, and it was not "the other colour."** Two of the three
records were not empty: madder carried *"At 70 °C with a pinch of soda"* and indigo carried *"With
more dips"* — the condition that produces the colour named in `expected`, not a second colour at a
different one. Writing the alternate outcome into the same field would have mixed two kinds of
fact under one label. So:

- **Oak bark** — `variation` was empty. It now names the alternate, without inventing a cause: *"Under
  an unrecorded condition the result leans toward a clean golden tone rather than beige-ochre-brown."*
- **Madder** and **indigo** — `variation` keeps the condition it already had. The alternate colour
  goes in `notes`, which was empty on both.

**A mistake made and corrected in the same pass, worth naming rather than quietly fixing.** The two
duplicates being removed — `rubia_root_alum_raspberry`, `indigo_leaf_soft_blue` — were not
themselves empty on `variation`: raspberry carried *"More alkalinity and longer"* and soft blue
carried *"At a lower temperature."* Real, specific, recorded causes. The first draft of this repair
discarded both and wrote *"at a weaker bath"* into `notes` for each instead — a plausible-sounding
mechanism invented to fill the field, and wrong in one case (more alkalinity is not a weaker bath)
and unverified in the other. Caught by checking the diff before presenting it, not before writing
it — the discipline that should have applied is the one already named in this document, that a
fallback producing plausible output hides the fault it covers for; an invented cause is that same
fault with better grammar. `notes` on both now carries the real condition that was already recorded
on the record being removed.

The three shorthand-named duplicates (`quercus_bark_alum_golden`, `rubia_root_alum_raspberry`,
`indigo_leaf_soft_blue`) are removed from the pack. `rubia_root_alum_pink` is untouched — its key
carries no pH, so it was never a duplicate of the alkaline record; it is the model this repair
followed, since its own `variation` already read as a condition rather than a range.

**Known gap, not fixed here:** `pl.combinationId` is written at trial save time
(`modules/trials.js`, "resolving the reference link at save time keeps it honest") and read back
by `modules/reference.js` to list which trials attach to a record. A trial saved *before* this pack
update, whose placement had matched one of the three removed ids, keeps that stale id until the
trial is next opened and saved — until then it is simply absent from the surviving record's
attached list, silently rather than visibly. `seedPack`/`applyDiff` only add and update; nothing
in the pack machinery removes or repoints an orphaned reference, by the same "migrations only add"
rule that keeps them from guessing. Cheap to live with while the library is this size and the app
is pre-release; worth a real fix — a reconciliation pass over stored `combinationId`s against the
current pack — before combinations acquire enough churn for it to happen unnoticed at scale.

Pack bumped to `packVersion` 0.2.0. 31 records became 28.

---

## 13bs. The figures you need over a pot (1.0.0-rc5)

From a prototype of the plant profile. Three things taken, one refused.

### The working strip

The best idea in it, and it answers what the application is for. The figures somebody standing at
the stove needs — which part and in what condition, how much, how hot to draw it out, how hot to
dye, the line not to cross — were spread through *how it is used* as a two-column list of label and
value, which scans as prose. They are now a strip of marked tiles, in the order they are used.

**Extraction and dyeing are separate tiles.** They were one line, and they are two acts done at
different moments; reading them as one sentence hides that.

Every value already existed in the model, including `liquorRatio` and `dryingRatio`, which were
present and empty. The prototype invented nothing and neither does this.

### A swatch carries its own temperature

*Red, root* leaves the reader to scroll for the number, and madder above 60 °C is not red at all. A
swatch now shows the dye temperature of the part it came from.

**Derived, never stored.** The heat belongs to the part; copying it onto the swatch would let the
two drift apart. It appears only on the nine plants swatched in 0.98.1, because only those record
which part a colour came from — and that is the honest behaviour rather than a gap to paper over.

### Refused: nothing that is not in the model

The prototype's tiles are drawn whether or not there is anything to put in them. Here a tile with
no value is not rendered, and a figure nobody has recorded is absent rather than dashed.

### Kept as ours: the caution stays third

The prototype runs *what it gives → use it now → why it works*. Ours puts **Внимание** between the
figures and the explanation, and it stays there. A warning about dust or about a ceiling belongs
before the work, not after it (§8.5). This is one of the places where the prototype's order is not
better, only different.

### Two checks that had gone quiet, and one that nearly did

The temperature check for elder read `.fact` rows and the figures had become `.usetile`. It reported
*zero temperature rows* — a true failure with a misleading name, because it was asking a part of the
page that no longer held the answer.

And the new swatch-temperature check was first pointed at madder, which is one of the 48 older
plants whose swatches carry no part. It passed by not testing. Pointed at pelargonium — one of the
nine that do — it fails when the temperature is removed.

**That is now three times in this project that a check has passed by not running.** The pattern is
always the same: the fixture does not have the property the assertion is about. Worth a habit — when
a new check passes first time, break the thing it watches before believing it.

---

## 13bt. The Library: glossary, pH, sources (1.0.0-rc7)

`modules/sources.js` became `modules/library.js`, and attribution became one of three tabs rather
than a place in the navigation of its own. Attribution deserves a screen but is opened rarely, to
check where something came from. What is opened often — and had nowhere to live — is the meaning of
a word met on another screen.

**Three tabs, not two.** The owner proposed Glossary and Sources. A pH scale is not a term with a
definition, it is a table, and forcing it into a glossary entry makes it a paragraph about a
picture. `#/library/glossary` (the default), `#/library/ph`, `#/library/sources`.

**The tab is in the address.** `#/library/sources/<id>` opens the record. A tab kept in a variable
the address does not mention looks like it works and breaks the back button, reload and bookmarks
at once (§13q) — the same fault a sessionStorage handoff has, in different clothes.

### The glossary does not restate the vocabulary

Five codes in `vocab.js` already carry an explanation and show it where the code is shown (§13aw):
`mordant_accumulator` and the four extraction modes. A glossary term repeating one of those is one
thing defined in two files, and the two drift at the first edit. `modules/library.js` reads those
five out of `VOCABULARY` at render time and merges them into the list, marked as explaining a term
the application uses. No copy; no stored link (§13.6).

Guard 24d fails the build if a glossary term ever names a code `vocab.js` explains. It caught one
on its first run: `vat` had been written into the glossary while `extraction_mode:vat` already
explained it. The glossary term was removed, and the two `seeAlso` entries pointing at it with it.

`seed/glossary.json`, pack `bagra-glossary` 0.1.0, thirty terms in six groups — chemistry, process,
fabric, pH, eco print, fastness. Written in our own words with a cited source, per §13r. Terms that
warranted the space and are easy to get wrong: **WOF and WOA as separate entries**, because Stopka
measures against the weight of the ALUM and everyone else against the weight of the CLOTH, and
reading one as the other is wrong by an order of magnitude; **the three tannins**, because the
library already distinguishes `tannin_gallo`, `tannin_ellagi` and `tannin_cond` and the glossary
should be at least as precise as the model; **discharge**, because true discharge destroys the dye
and a pH shift only moves it, and the two look alike.

### The pH tab is ours, not a photograph

The reference photograph offered was a test-strip colour chart. That is one maker's paper — another
maker's reads differently — and it is a page from a book. What a dyer needs is not what the paper
looks like but which jar moves the bath which way. The tab carries a five-band scale in the
application's own palette, saying only where a reading falls, and two lists: what moves pH up and
what moves it down.

### Two faults found on the way, both older than this work

**A seeded `kind` that rendered as its own key.** `cameo-mfa` shipped with `kind: 'reference'` and
`natures-rainbow` with `kind: 'website'`; neither was in `KINDS` and neither had a translation, so
the Sources screen printed the literal string `sources.kind.reference` where a word belonged, in
both languages, for as long as both records have existed. Layer 3b of `check.sh` reads literal
`t('...')` keys and this one is built at run time as `t('sources.kind.' + sx.kind)` — that layer's
own comment says a constructed key cannot be checked there. The check therefore comes from the DATA
end: guard 24c asks whether every code a seed pack actually uses resolves to a word, and whether
every kind in `KINDS` has one in both languages. `website` was `site` under another name and the
data was corrected; `reference` is a real distinct kind and was added to the vocabulary.

**A record-address check that could not fail.** The address layer asserted that a record's own
words appear on screen when its address is opened. A record's name appears in the LIST as well, so
a module that ignored the address entirely and fell back to its list still contained the marker and
still passed. Found by deliberately breaking the Library's record address and watching the layer
stay green. It now requires the marker AND a Back button, which every record screen carries and no
list does. The marker stays, because Back alone would not notice a module opening the wrong record.

`DB_VERSION` 7 → 8 for the `glossary` store. The pack loader derives its work from `PACKS`, so the
new pack needed no second list — the fault §13aa records, where `sources` was declared and never
loaded, does not repeat.

### Not done here

A term met on another screen does not yet link to its glossary entry. That is the more valuable
half and it touches every screen that shows a term; the glossary has to exist and have content
first. Recorded, not started.

---

## 13bu. The second chemistry audit (1.0.0-rc8)

A second pass over plant chemistry, prepared by the owner with ChatGPT and delivered as a workbook
whose `За merge` sheet is a replacing set. 153 entries became 171.

**It was checked before it was trusted, and it held.** Across the 134 rows the audit and the library
share it overwrites nothing and blanks nothing; all 19 entries it removes or reclasses carry an
empty level in the library. Nothing already judged was touched. That is the opposite of the usual
failure of a bulk merge and is worth recording as the reason this one was accepted.

Added 37, filled 29, removed 19, marked 5 as unknown. Every part now has either a strength or an
explicit statement that none can be given: **zero blank levels without a mark**.

### `merge-chemistry-audit-2.py`, and why it is a second script

The first audit script refuses to create an entry, remove one, or change a compound's class —
those are domain decisions and it has no standing to make them. This audit asks for all three. They
are done explicitly in a script that declares them, rather than smuggled through the old one by
loosening it.

What it still refuses, each seen to fail before it was trusted:

- overwriting a level that is already set
- blanking one
- removing an entry that is neither named in `Корекции вещества` nor already empty — a replacing
  set read literally makes a row dropped by accident indistinguishable from one dropped on purpose
- a compound name that is not a class in the vocabulary

### Three things found on the way

**`антоциани` → `антоцианини`.** The audit is right on IUPAC grounds — anthocyanins are the
glycosides, anthocyanidins their aglycones — and the application was already inconsistent with
itself: `seed/plants.json`, the glossary and the techniques all wrote „антоцианини" while `vocab.js`
alone wrote „антоциани". The code (`anthocyanin`) is unchanged; only the label. It also had a
practical edge: until the label was corrected, the six audit rows spelled „антоцианини" resolved to
no code and would have been skipped in silence.

**`levelUnknown`, not `confidence: 'unknown'`.** The first draft of the merge script wrote the mark
into `confidence`. But `confidence` is already a dimension in vocab.js with five values —
unverified, literature, practice, confirmed, contradicted — and `unknown` is not one of them. That
would have put an unknown code into a controlled vocabulary, which renders as its own key on
screen: exactly the fault guard 24c was written for, reintroduced one section later. A separate
boolean says the separate thing.

**A blank level was two statements wearing one face.** *Not recorded yet* and *no honest
quantitative estimate exists* both rendered as bare text. The second is a finding — the plant is
strongly seasonal or cultivar-dependent — and now reads „степен неизвестна". Only marked entries
say it; an ordinary blank still means simply not recorded. Guard 24e holds both halves: nothing may
claim a strength and no strength at once, and the words must exist for the screen to show.

### Open, recorded and not decided

**Should the chemistry vocabulary hold technologically important non-pigments?** Rhubarb leaf is
the case: its oxalates matter to a dyer and are not a colourant, so the dimension has no place for
them. Deciding this changes what the whole dimension means and was not settled in passing.

Eight parts now carry no chemistry, where the audit counted seven. The extra is
`prunus_domestica/bark`, whose two entries were both marked for removal — a consequence of the
audit's own instructions rather than an omission, but noted so the number is not a surprise later.

---

## 13bv. Pigment: a second kind of work, decided and not yet built (1.0.0-rc8)

The question arrived as "a new module for pigments, or a screen in the Diary?" — and the answer
turned out to be neither, because most of what it needs already exists and one thing that looked
like it existed does not.

### What is already there

`recipe_type` already holds `pigment` and `paste`. `basis` already holds `absolute` and
`ratio_to_dyestuff` alongside `percent_wof`. Chains already model an ordered preparation. The
owner's own reading — "this looks to me like recipes and chains of recipes" — is not an
approximation; it is what the model was shaped for.

### What is missing, and it is three things

1. **A chain scales against one weight of goods.** `modules/chains.js` says so as its whole
   purpose. A pigment chain has no cloth: it scales against 20 g of root, or against 10 g of alum.
   Chains need a second kind of base.
2. **A recipe declares no output.** The pigment chain is solution → PIGMENT → watercolour. The
   middle link is a thing that is stored and then used as input to the next recipe, and no field
   says a recipe produces a substance.
3. **A made pigment is not a material.** "I have some quantity on hand" is stock, but stock holds
   bought substances; nothing connects a substance to the batch that made it.

### `extractionMode` is on the wrong record

Found while answering this. The field sits on a part, holds one value, and is filled for 5 parts of
118. But Stopka's chart gives madder root 500% by decoction, 300% by fermentation, 50% by alkaline
extraction — one plant, one part, three methods, three doses. One value cannot hold that, in the
same way one temperature per plant could not hold two parts wanting different heat (§13az).

Two different things share the name:

- **A constraint, belonging to the plant.** Woad and Japanese indigo are `vat`; alkanet is
  `solvent`. Not a choice — the ordinary "simmer it in water" schema does not apply, and
  deep-check already guards this explicitly.
- **A choice, belonging to the work.** Madder by decoction versus by fermentation. The part does
  not change; what is done with it changes, and the dose and the hue change with it.

The constraint stays on the part. The choice belongs with the extraction. Recorded; not migrated —
a migration that guesses turns an assumption into a fact.

### The shape agreed

A pigment batch is work on a SUBSTANCE, where a trial is work on CLOTH. A trial has pieces, each
with its own placement and outcome; a batch has one output, one quantity, one quality, one colour.
Same skeleton — input, stages, observations, output — different subject, and not to be forced into
one another.

    pigmentBatches
      date
      input     plant × part, weight of raw material
      via       recipe or chain
      stages    extraction · laking · washing · filtering · drying · grinding, each with notes
      output    grams · quality · colour hex · swatch
      notes     for the next time

Which answers the owner's own sentence: *"I made a red pigment from madder by this recipe. I got
20 grams of good quality and the red I expected."*

**A separate screen, visually apart, in the same language.** The Diary stays cloth. Pigments are
their own section — the owner asked for this and it is right: the process is long, laborious and
infrequent, and interleaving it with dye trials would bury it. But the stages behave like a
trial's stages, because that pattern is already learned.

**"What pigments do I have" is a view, not a second store.** The batch list filtered to those with
quantity remaining, ordered by colour. Derived on opening; no back-link stored (§13.6).

### Scope, deliberately cut in half

The owner: *"I don't need to keep track of how many watercolours or pastels I made."* Taken as a
decision, and it halves the work:

- **The pigment is recorded** — it has a quantity, it gets used later, it earns a record.
- **Watercolour, pastels and print paste are recipes but not records** — made, not counted.

So the chain ends at the pigment. What follows are recipes to READ. The application must say so
rather than imply it, or someone will hunt for where to log a watercolour they just made. Seeded:
pigment, watercolour and pastel recipes, with the last two marked as reference rather than work.

### Not built in this session

A new store, a new screen, three model changes and seed recipes — as much work as everything else
this session together. Recorded as decided so the next session does not rediscover it.

The reason for the order is not fatigue: `combinations` cover 10 plants of 57, and a second engine
standing empty beside the first one does not move the application closer to a paid release. The
reference engine being filled does.

---

## 13bw. A corrected vocabulary term must reach an installed copy (1.0.0-rc9)

Reported from a running screen: the plant page still read „антоциани" after §13bu renamed the term
to „антоцианини" in `vocab.js`. The version was right — the same screen showed „степен неизвестна",
which only exists from 1.0.0-rc8 — so the correction had shipped and not arrived.

`seedIfEmpty()` wrote a term only when its key was ABSENT. That gate was itself a fix: it used to
be `count === 0`, which meant no term added after a person's first install ever reached them
(§13aa). But adding-only leaves the other half open — a label shipped WRONG can never be corrected,
because "already there" was taken to mean "leave alone".

The safety that reasoning protected does not exist. Nothing in the application writes to
`vocabulary` except the seeder; there is no vocabulary editor and never has been. So a seeded term
is now updated in place, gated on `origin === 'seed'`, and only when something actually differs.
When an editor is built it must mark what it touches, or the next start will undo the edit.

**Six more places carried the old spelling in free text** — four plant sections, one technique, one
glossary entry. Corrected with the definite article handled („антоцианите" → „антоцианините"),
since a blind substitution would have produced „антоцианинте".

### The guard was written wrong first, and it passed

Guard 24f began by searching `app.js` for the string `JSON.stringify(mine.label)` and for the
`origin` test. Both were found, both reported green — and the behaviour was broken in the test:
commenting the comparison out as `if (false && ...)` leaves the searched-for text exactly where it
was, and deleting one of the two `origin` tests leaves the other for the regex to find.

A guard that reads source for a phrase tests spelling, not conduct. It now imports `seedIfEmpty`,
writes a term with an old label and `origin: 'seed'`, runs it, and checks the label changed — then
writes one with `origin: 'user'`, runs it, and checks the label did NOT. Both were seen to fail
with the source text left intact, which is the only way to know either is real.

---

## 13bx. The pigment batch, fully specified (1.0.0-rc9)

> **Superseded in part at rc105 by §13fg.** The stages, the chain, `finishedOn` and `quality`
> are no longer on the batch screen or written into a new batch. The list decisions stand.

§13bv agreed the shape. Writing the screen brief against it found seven places where the shape was
not a specification — five fields it did not name and two questions only the owner could answer.
Both answers simplified the model rather than enlarging it.

### "No remainder — only how much I made"

This removes one of the three model changes §13bv listed. There is no pigment stock: nothing
decrements, nothing links a batch to `materials`, no consumption is recorded. **Two changes remain,
not three** — a chain that scales against raw material, and a recipe that can declare an output.

The consequence has to be said out loud on the screen rather than left to be discovered: the list
answers *what have I made*, not *what do I have*. Read a year later by someone expecting quantities
on hand, an unlabelled list of grams is a quiet lie. The heading says which question it answers.

### "One row for madder, batches underneath"

The list groups by source — plant × part — with batches nested. A view, derived on opening; no
grouping is stored (§13.6).

### The record

    pigmentBatches
      status        planned · done · failed
      date          when the making began
      finishedOn    when it ended, null until it has — a batch runs over days:
                    three hours of simmering, a night settling, days drying.
                    The same pair a trial carries (§13au), for the same reason.
      plantId       the source
      partCode
      rawWeightG    weight of plant material started from. Named because
                    "I got 20 g" is meaningless without it: 20 g from 100 g of
                    root is a different result from 20 g from 500 g.
      viaRecipeId   a recipe OR a chain, never both — `viaKind` says which,
      viaChainId    the same way a trial reaches its preparation
      stages        extraction · laking · washing · filtering · drying · grinding
                    each: note, optional date, optional photo
      yieldG        grams of pigment obtained
      quality       good · acceptable · poor
      swatchHex     the colour, as a hex — the same shape a plant's swatch has
      swatchName    {bg, en}
      photos        of the powder itself, optional
      notes         {bg, en} — for the next time

`status: 'failed'` is a real state, not an absence. A batch that yielded nothing is worth keeping —
it is the most useful note there is for the next attempt — and without the state it would have to
be recorded as a batch of zero grams, which reads as unfinished rather than as instructive. A
failed batch shows in the list, marked, with no swatch.

`quality` is three words, not five stars. A star rating implies a scale that was measured; three
words admit a judgement.

### Not on the screen, and why it must be visible

Watercolour, pastels and print paste are recipes to READ, not work to LOG (§13bv). If nothing
distinguishes them from the pigment recipe, someone will look for where to record a watercolour
they just made and find nothing. The distinction has to be visible in the recipe list itself, not
inferred from the absence of a button.

### Prototyping with v0

`prototype/BRIEF-for-v0.md` carries the fixed part — palette, the no-green rule and why it exists,
the §13s layout decisions, the tone, and an explicit "do not invent fields". Per screen, a second
file describes what is on it.

The brief exists because the two prototypes already in `prototype/` came back with `--sage:#1ba39c`
and `--leaf:#63b86a` — turquoise, pink, lavender, gradients, and green in two places. The one rule
with the clearest reason behind it, broken in the first twenty lines. Not an argument against the
tool; an argument against using it unbriefed.

**A v0 prototype is a picture, not code.** It returns React and Tailwind; this application is
vanilla ES modules with no build step. Nothing from it is pasted in — the layout is read and built
again.

---

## 13by. Pigments built, and what one field settled (1.0.0-rc10)

Built from the v0 prototype at `bagra-ten.vercel.app/pigments`, which came back close to the brief:
grouping by source with batches nested, the failed batch visible and unswatched, both dates, the
raw weight, recipe-or-chain in both its forms, six stages marked „без отметки", quality as three
words. Most importantly the list said what it was — „тук не се следи оставащо количество" — which
was the thing most likely to be lost.

Three things it did not do, corrected here: `theme-color: #2a2f34` is not a colour in the palette;
`color-scheme: light dark` announces a dark theme the brief ruled out; and the one question the
brief asked it to answer — how a worked recipe should look different from one that is only read —
was silently skipped. That last is the real hazard of prototypes: they answer what was drawn and
say nothing about what was not, and the silence looks like agreement.

### `recipe_output` settles two problems with one field

§13bv listed "a recipe cannot declare an output" as a model gap, and §13bx listed "a read-only
recipe must be distinguishable" as an open UI question. They are the same question.

    recipe_output:  none · pigment · extract

`none` is a recipe that is read and followed and keeps no record — watercolour, pastels, print
paste. `pigment` and `extract` produce something, so they can be worked, and only they appear when
a batch chooses what it was made by. The middle link of a pigment chain now has a name.

### The store and the screen

`pigmentBatches`, `DB_VERSION` 8 → 9. `modules/pigments.js` renders a list grouped by plant × part
— derived on opening, no grouping stored (§13.6) — and a batch screen following the trial's stage
pattern, since that arrangement is already learned.

A group's swatch is its most recent SUCCESSFUL batch: a failed one has no colour and must not lend
the group a blank square. A failed batch keeps its stages and its note and shows no result panel —
recording it as zero grams would read as unfinished rather than as instructive.

`i-mortar` was drawn for the navigation. The id first written, `i-flask`, does not exist; nothing
would have rendered.

### Guards

24g holds three things: nothing in the module tracks a remainder (checked by name — `remaining`,
`consumed`, `inStock` — because this is a decision one well-meaning commit can undo), the list says
which question it answers, and a failed batch gets its own panel. 24h holds that `recipe_output`
keeps its distinguishing values and that the batch screen offers only recipes which produce
something. All five seen to fail.

### Still open

Seed recipes — pigment, watercolour, pastel — are not written. The pigment one must ship with
`output: 'pigment'` and the other two with `output: 'none'`, or the distinction this section is
built on has nothing to demonstrate itself on.

---

## 13bz. What the first pigment screen got wrong (1.0.0-rc11)

Reviewed on a running screen, and most of the findings were mine rather than the prototype's.

**The layout ignored the prototype, which was the reason for using it.** The v0 arrangement was
read for its structure — grouping, stages, fields — and then the screen was built with the two
equal columns every other screen here has, out of habit. But the arrangement was the point: the
prototype put the work wide and its context down the side, and folded the context sections. Both
are better here, because the stages are what is looked at while working and the dates and the
recipe are answered once and referred to. Rebuilt as `pigmentcols` with an `aside`, reusing
`contextstrip` (§13ab) rather than inventing a second folding pattern.

**Part never filled.** Its options are read off the chosen plant, and nothing re-read them when the
plant changed — `viaKind` had a redraw and `plantId` did not. A select that never fills reads as
broken rather than as empty, which is exactly what it was. Both redraw now.

**Fifty-seven plants in source order.** Sorted by name in the reader's language.

**The recipe list was empty, and empty read as broken.** It was not: nothing had `output: 'pigment'`
because no recipes were seeded at all — `seed/recipes.json` did not exist. Two fixes. The pack now
ships three recipes, chosen to demonstrate the distinction they rest on: a lake pigment recipe with
`output: 'pigment'`, which is worked, and watercolour and pastels with `output: 'none'`, which are
read and followed and keep no record. And when the list is empty the screen says why and offers the
way out — writing a recipe — instead of leaving an unexplained empty dropdown.

**A panel whose whole content was one line of hint text.** „ПРОЦЕС · Шест етапа — бележки, не
задачи." A heading, a note, and nothing else, above the stages it was describing. Folded into the
stage panel itself.

Three ingredient roles a pigment recipe needs and dyeing does not: `pigment`, `binder`, `filler`.
`pigment` is the finished powder used as an INPUT — a watercolour starts where a lake recipe
ended, which is what a chain means here. Caught by the vocabulary guard on the first run, which is
what it is for.

### Still open

**The recipe screen is shaped for dyeing.** WOF, liquor ratio, fibre class, follow-on requirements —
a pigment recipe needs almost none of them, and a watercolour recipe needs none at all. `type`
already says which kind a recipe is; the screen does not yet read it. Fields should follow the
type rather than every recipe carrying every field. Recorded, not built.

---

## 13ca. Recipe fields follow the recipe's type (1.0.0-rc12)

The recipe screen was built for dyeing and never revisited, so every recipe carried every field. A
pigment recipe offered weight-of-fibre, liquor ratio, fibre class and required follow-ons; a
watercolour recipe offered all of them and needs none.

An empty field is not neutral. It reads as one nobody has filled in yet, not as one that does not
apply — and on a pigment recipe there were more of the second than of the first, which makes the
screen look unfinished rather than the record.

The pattern already existed and had been applied exactly once: `blanket` was drawn as
`r.type === 'blanket' ? panel(...) : ''`. That is how a screen ends up shaped for whichever case
was built first — the general fix gets written as a special case and never generalised.

Now a table, so "why is this not on screen" is one lookup:

    MAKES_SUBSTANCE = ['pigment', 'paste']

    appliesTo    cloth only   — a pigment suits no fibre
    computed     cloth only   — the aluminium-acetate calculator works from weight of fibre
    liquorRatio  cloth only   — bath volume against cloth weight
    followOn     cloth only   — ordering a pigment chain is the chain's job, not this field's
    scale        cloth only   — the scaling block computes against a weight of goods
    blanket      blanket only
    conditions   always       — a lake wants a temperature ceiling and laking is a pH event

Where the scaling block is hidden, a short panel takes its place saying the quantities sit on the
ingredients instead — against the raw material or against the alum. Removing the block without
saying anything would leave a person looking for where the amounts went.

Ingredients and steps stay on both kinds. A recipe without them is not a recipe, whatever it makes.

### The guard renders

Guard 24i draws both a cloth recipe and a pigment recipe and inspects the markup for the field
names themselves. Grepping `modules/recipes.js` for `SHOWS.scale` would test that the words are
present; only drawing tests that they do anything — the lesson from §13bw, applied without having
to relearn it.

It failed on its first run for a reason worth keeping: it called `open(id)`, which shows the READ
view, and the fields live in the edit form. A guard pointed at the wrong screen reports absence
correctly and means nothing.

**And then it was left pointed at only one of the two screens.** The work view — where a recipe is
actually followed — kept asking for a weight of cloth on a watercolour recipe until 1.0.0-rc38
(§13de). This section reported the work finished because the guard covered the half it had been
written for.

---

## 13cb. The glossary edited down, and a pack that can withdraw (1.0.0-rc13)

The owner reviewed the thirty glossary terms against a principle she stated for the first time
here: a word earns a place if a person will meet it in a book, a recipe or a community, its
meaning is not obvious from the word itself, misreading it leads to the wrong process, or the
application uses it in the visible interface. **A term does not earn a place by existing as a
chemical concept or as a category in the model.** Thirty terms became thirty-two —
`scripts/edit-glossary.py`, pack `bagra-glossary` 0.2.0.

### Five left, and only two of them for the same reason

`affinity` and `buffer` are valid chemistry and too low-level for the use they get; neither is
attached to any workflow the application has.

`hapa_zome` left because it is a technique and not a word. The Techniques module did not have it,
so removing it from the glossary alone would have deleted it from the application — which is why
`edit-techniques.py` runs in the same session and adds it under `printing`, not `bundling`:
nothing is rolled and nothing is bound, the plant is struck through the cloth and its own sap
makes the mark. Its description states plainly that the result is usually fugitive, which is the
kind of thing a reference exists to say about a technique that photographs well.

`bundling` left for the same reason: `bundle_roll`, `bundle_fold` and `barrier_layer` are already
techniques carrying their own descriptions.

`discharge` left because **the method does not exist yet**. §13bt argued it had earned the space —
true discharge destroys the dye and a pH shift only moves it, and the two look alike — and that
argument still holds. It is a glossary entry for a practice no screen can record, which is a
promise the application does not keep. It returns with the method; ROADMAP.md carries it.

### Three terms looked removable because their titles were bad

The review listed `afterbath`, `bundling` and `discharge` as essential in one section and as
removable in another. Two of the three are one code each, and the contradiction resolves the same
way both times: the entry had earned its place and the Bulgarian title had not. „Дообработка" can
mean anything done after dyeing; „Кроки" is an English technical term transliterated into a
Bulgarian word carrying no sense; „Одеяло" alone does not say which cloth. That is the distinction
the owner draws between a labelling fault and a data error, arriving from her own review.

Five Bulgarian titles changed. The English name stays in the title where it is the word actually
met in practice and Bulgarian has no settled equivalent — the aliases already carry it for the
search, but aliases cannot be seen on the card, and a reader who knows a word from a book has to
recognise the card as the right one.

### Where the review was not followed

**The four chemistry classes stay.** The review suspected that `anthocyanin`, `flavonoid`,
`anthraquinone`, `indigoid`, `tannin` and `resist` duplicated `vocab.js`, on the strength of the
architectural note in §13bt. They do not: in `vocab.js` these carry a code and a LABEL and no
explanation, so the screen shows „антрахинони" and nothing says what that is. The glossary is
their only explanation, and removing it would open a hole directly under the pending work §13bt
records — a term met on another screen leading to its entry. The one real duplicate was `tannin`,
and it was a bug rather than an editorial judgement; see below.

**`washfastness` stays.** The review removed it and, two paragraphs later, asked for
`colourfastness` as a parent over the three kinds. The middle child cannot be missing. Its text
already said the non-obvious thing — the first washes always carry off unbound dye, and loss past
the third is the warning sign — and it was rewritten rather than removed.

### „Марена" is not a Bulgarian word

Madder is „брош". „Марена" is a loan from the Russian „марена красильная". The plant record was
always right — `rubia_tinctorum` is „Бояджийски брош" — but the prose written around it had
drifted, in the glossary, in a recipe note, in a technique description and in the pH tab.
`rename-madder-bg.py` corrects a fixed list of phrases rather than a pattern over „марен-":
Bulgarian inflects, the substituted grammar would have to be guessed, and `марля` is one character
away. English is untouched; `madder` is correct English and is also a palette colour in the code.

### Eight groups, and the field that nothing drew

`GROUPS` was declared in `modules/library.js` and read nowhere. `group` was a field on every term
and rendered nowhere. The screen was one flat alphabetical run of thirty cards, which is not a
reference shelf, and a field nothing renders is a field nobody maintains. The six groups were also
named after the model — chemistry, process, fabric, ph, ecoprint, fastness — which says where a
term came FROM rather than where a person would look for it.

Eight groups, in the order a reader is walked through the craft: **basics · textile\_prep · dyeing ·
ecoprint · indigo · pigment · colour\_chemistry · fastness**. A heading appears only above cards
that are there, because during a search most groups are empty and a column of headings over
nothing reads as an application that has lost its content.

### Membership in the glossary is stated, not deduced

`modules/library.js` merged in every `vocab.js` code carrying a `description`. That inferred a
decision from a side effect: the glossary grew silently as `vocab.js` grew, and by rc12 the three
`recipe_output` notes — „нищо за записване", „пигмент", „извлек" — were sitting among the terms as
though somebody had put them there. Nobody had. A seventh argument to `V()`, `glossaryGroup`, now
says it, and says which group.

### A guard that read the source and missed the one case there was

Guard 24d refuses a glossary term that names a code `vocab.js` explains. It read `vocab.js` as
TEXT, with a pattern requiring `\d+` for the order argument — and `chemistry_class:tannin` carries
the order `0.5`, so that it sorts above its three subtypes. The pattern did not match, the code
never entered the list, and **the Library drew two cards titled „Танини", in both languages, for as
long as both records have existed.** A guard that reads source text for a shape is testing
spelling; this one was passing on a decimal point.

The pattern is fixed, but what holds the line now is importing the module and asking it. The rule
was also narrowed to the condition that actually produces two cards: a code the Library MERGES IN
may not also be a seeded term. `chemistry_class:tannin` keeps its description and gets no group —
what it explains is which CODE to pick when the subtype is unknown, which is a note about the model
and not about dyeing. That overlap is named in the guard with its reason, so that a second one
stops the build and has to be argued for rather than absorbed by a rule stated loosely enough to
cover it.

Three further checks, each shown failing before it was accepted: every group a term names is one
the screen draws (a term in an unknown group is never rendered — no error, no empty state, the
term simply is not there); every heading has words in both languages; and nothing is marked for the
glossary with no definition to show, which is the cost of separating the flag from the description.

### A pack could not withdraw a record

`diffPack` walked the PACK. A seeded record that had LEFT the pack was therefore never looked at
and stayed on an installed copy for ever — so a fresh install and an updated one become two
different applications, silently and permanently. No pack had ever removed a row before, so the gap
had never shown; removing five glossary terms showed it at once. It is the same shape as the fault
§13bt records, where a corrected term never reached an installed copy.

`diffPack` now walks the store as well and reports a fourth group, `withdrawn`: seeded records of
this pack that the pack no longer carries. Only `origin: 'seed'` with this `packId` — what the user
wrote herself is not the pack's to withdraw, and another pack's records in the same store are not
its business either.

It is offered, not performed. Removal is the one direction that running the update again cannot
undo, so it goes through the same tick-box as everything else. A withdrawal she has not edited
arrives ticked, because leaving it behind is precisely what makes her copy differ; one she HAS
edited arrives unticked, like any other edited record.

`applyDiff` acts on an explicit `remove` flag on the entry rather than inferring a deletion from a
missing `row`, because inferring it would let a malformed entry delete a record.

**`scripts/try-pack-withdrawal.mjs`, layer 5b of `check.sh`.** No layer above it sees a pack update:
they all read the shipped files, where a withdrawn record is simply not there. This seeds the
previous pack into a database — including one term marked as edited by the user and one the user
wrote herself — applies this pack, and checks what actually left. Twelve assertions. Against the
rc12 `seed.js` nine of them fail, which is what makes the other three worth reading.

### A glossary card was two columns

The card borrowed `.refcard`, which is `display:flex` because everywhere else its left column is a
52px colour swatch. A term name is not a swatch: as a flex child it took a column as wide as the
longest name in the list, wrapped „Целулозни и протеинови влакна" down four lines while the
paragraph beside it started at the top, and pushed the cross-references and the source out to the
right edge, away from the text they belong to. Its own class, `.glossterm`: the term, the
definition under it, the references and the attribution below that, in the order they are read.
`.refcard` also carries a pointer cursor, which said "press me" about something that does nothing
when pressed (§13ac).

The group heading is an `h2` and takes the one heading scale. It was written with a size of its own
first and `check-scope` refused it — correctly, since two places holding one size is how the
inversion that guard exists for came about.

### Open

`overdye` is „Повторно багрене" in both the glossary and Techniques, where it was „Наслагване". The
code is untouched, so nothing referencing the technique is orphaned. What the old name carried and
the new one does not is that the second colour LAYERS OVER the first, as against running the same
bath again for depth; the description now carries that distinction in its first sentences. If it is
seen to be confused in use, the label changes without touching data.

---

## 13cc. Extraction: a constraint on the plant, a choice on the work (1.0.0-rc14)

§13bv found the fault and recorded it without migrating, because a migration that guesses turns an
assumption into a fact. This is the migration, once it was clear what the field had actually been
holding.

### The field was already doing the other job

`extractionMode` sat on the part, held one value, and was filled for 5 parts of 118:

    safflower        flower, leaf   cold
    woad             leaf           vat
    Japanese indigo  leaf           vat
    alkanet          root           solvent

**Not one of them is `decoction`,** and that is not chance. The field was only ever filled when the
answer was "the ordinary way does not apply here". Nobody records "I boiled it", because boiling is
what happens unless something prevents it. So in practice the field already held a CONSTRAINT while
being named and shaped as a mode — and the label said so out loud: the placeholder read
„гореща отвара (по подразбиране)", asserting that an empty field meant boiling.

Meanwhile the thing it was named for could not be recorded at all. Stopka gives madder root **500%
by decoction, 300% by fermentation, 50% by alkaline extraction** — one plant, one part, three
methods, three doses an order of magnitude apart. A single value on the part holds one of the three
and makes the other two unsayable.

### One vocabulary, three fields

    part.extractionModes      [code] | null    which ways are possible      — a constraint
    placement.extractionMode  code | null      which way was used this time — a choice
    dosing[].extractionMode   code | null      which way this dose is FOR

**The constraint is a list**, because a constraint names a set. Alkanet is `['solvent']` — only
that. Madder is decoction, fermentation and alkaline — three, all real. One value can say neither.
On the form it is a row of checkboxes rather than a select, for the same reason.

**The choice is on the placement**, where `condition` already is, and for the same reasons: it is a
fact about the raw material in this piece of work, it differs plant by plant inside one bundle, and
it is what the dose hangs on. It is offered from the part's permitted set where the plant states
one — a list that lets alkanet be recorded as a decoction is a list that will be used that way —
and from the whole vocabulary where nothing is stated, since "not stated" is not "nothing is
allowed" and refusing every choice would make 113 of 118 parts unrecordable. **Never pre-selected.**
The plant record says which methods exist; only the person at the pot knows which she used, and
filling it in for her would put a guess into the one record that is meant to be evidence.

**The dose gains the dimension**, which is the point of the whole change. `null` on the 125
existing rows means "the dose as recorded, without saying by which method" — precisely what they
claim today. Nothing is asserted that was not asserted before.

Two methods joined the vocabulary for it: **fermentation** and **alkaline extraction**, both with
definitions and both in the glossary by the rule of §13cb — membership is stated, not deduced.

### The migration's refusal, and a guard that keeps it

`cold` became `['cold']` and so on for all five: the same statement, moved where it can be added to.

**The 113 parts with no value keep no value.** The temptation is `['decoction']`, since most parts
are simply boiled, and it looks like completeness. It would turn "nobody has got to this yet" into
"it has been checked, and only boiling works" on 113 records in one stroke. `null` and `[]` are
likewise kept apart and `[]` is never written — "not stated" against "no method is possible", and
the second is not true of any part, but an empty list renders exactly like an absent one.

Four guards, each shown failing first: an empty list; a method outside the vocabulary; a dose
recorded for a method its own part forbids; and the count of unstated parts dropping below fifty,
which is the tidying-up above arriving later under a different name.

### The recipe auto-fill was handing over the wrong figure

`modules/recipes.js` looked up a dose by part, then condition, then took whichever row came first.
With three doses on one part that is a ten-fold error arriving as a helpful auto-fill: a recipe
written for an alkaline extraction handed the decoction figure. The chain now narrows part →
condition → method, each step falling back to the looser match rather than to nothing, because a
dose recorded without a method is still the best figure there is. What it must not do is claim to
be the figure for a method it never named.

### On screen

The plant record names the methods **only where the part is restricted**, by the rule of §13az —
repeat only where the parts disagree. Writing „гореща отвара" across all 113 would restate the
claim the migration refused to make, and in the place a reader is most likely to believe it.

"Use now" gives the dose per method where more than one exists, and names the method beside the
figure only when the record says which; a dose recorded without one is not a decoction dose, it is
a dose whose method nobody wrote down.

### Not done, deliberately

**The extraction method does not enter the combination key.** It goes in `variation`, exactly as
dye strength does. Putting it in the key turns 28 records into a possible 84, of which 56 would be
empty. The key widens when there is something to fill it with — and the prior condition is the same
one already recorded: dye-to-fibre ratios on real trial placements.

---

## 13cd. „Какво можеш да събираш сега“ — the seasonal panel (1.0.0-rc15)

The home screen's answer to "what should I do today", and the replacement for the reliability panel
removed in Part A6. That one counted claims awaiting testing: it addressed the owner of a private
notebook, and to someone who had paid for a library the first thing the application said about
itself was a number of things it was unsure of. This one says something true on the day it is
opened, to either reader.

**A query, not an engine.** Plants whose parts have a gathering window containing this month. No new
store, no derived record, nothing to keep in step. `modules/season.js`, kept out of `dashboard.js`
because the month is the one input that cannot be clicked — everything takes it as an argument, so
that the panel is not only ever tested in August.

### Four cards

Five fit the wide column. Four is what stays legible on the phone, which is where this panel is
actually read — standing in a garden — and one layout for both is worth more than one extra card.
On a narrow screen the row scrolls horizontally with the second card cut, so it is visible that
there is more.

Three lines under the photograph, in the order they are read: the plant; **which parts are in season
this month**, not all its parts (if the bark is a winter job it has no business on an August card);
and at most two colours with the plant's own recorded hex as a swatch. Nothing else — no dose, no
temperature, no fastness. It is a card that says *go and look*, and one press opens the record.

Ordered by **how soon the window closes**. Not alphabetical, which puts walnut last for no reason,
and not random, which makes the panel look broken when it changes on reload. Green husks ending this
month come before leaves that run to October; that is the ordering that makes the panel worth
opening twice in a season, and it needs no data that is not already there. Ties break on the
library's own order, so it does not reshuffle between reloads on the same day.

### The safety mark is on the card

Of the plants that appear in August, eleven carry a warning and tansy and alder buckthorn are
`elevated`. A home screen saying "gather this now" under a photograph, with no mark, is the
application sending someone out to pick tansy. **This panel is an invitation in a way that a library
listing is not**, so the mark is on the card and not one press away.

It **accompanies and never replaces** (§13ac): the name and the part stay exactly as they are,
nothing is hidden, greyed or reordered. It says *read before you pick*, not *do not pick*. `low` and
unmarked show nothing — a mark on everything is a mark on nothing. The filtered list carries the
line the card has no room for: a plant with no recorded level of care is unrated, not safe.

### `imported` is not „bought“

The panel decides what to leave out from `part.sourcedNotGathered`, **not** from
`habitat: 'imported'`. That vocabulary is wild | garden | imported and answers where a plant GROWS.
Sumac is native here and also arrives in a bag; both are true at once, and reading the origin field
as a sourcing field was a misreading, not a contradiction in the data. Two facts had been sharing
one field, which is the same class of fault as §13cc.

### The migration is half done, and the panel says so

`harvestMonths` is moving from the plant to the part, because walnut leaf is May–September and the
green husks are August–October — one list per plant cannot say that, and where a plant has three
parts today's single list is the months of whichever part was in mind when it was typed, with no way
to know which. This is the third of the same fault: the temperature on the plant (§13az), the
extraction mode on the part (§13cc), and now the months. The workbook out for filling collects them
per part, 118 rows.

Until it comes back, most plants have only the plant-level list. **Falling back to it silently would
be the worst of both**: a walnut with three parts would show all three as in season in August —
plausible, wrong, and indistinguishable from a real answer. So the fallback is carried in the open
as `viaPlant`, and a card built on it **names no part at all** rather than naming all of them.

### Two empties, which must not share words

„Nothing is recorded as gathered in January“ is a fact about January. „No gathering months have been
recorded yet“ is a fact about the library. Not-yet-filled must never read as nothing-to-pick.

And the panel does **not** disappear when there is nothing. A panel that vanishes reads as something
broken, and January is a real month rather than an edge case.

### The month is in the address

„Виж всички“ opens `#/plants?month=8` — the same list, the same cards, a filter chip that can be
taken off. Not a second plant list: two lists of plants are two lists that eventually disagree, and
the filtered list runs the same `inSeason` from the same module as the panel.

Bookmarkable, survives a reload, comes back correctly with the browser's back button (§13q).

### Months are a fact about a place

A gathering month is not a property of the plant; it is a property of the plant HERE. Walnut husks
in Sofia and in Andalusia are not the same week, and the library is a candidate for distribution.
Not climate zones — one line on the pack, `harvestRegion: 'BG'`, said by the panel and the filtered
list: „Месеците са наблюдавани в България.“ The cost now is nothing; the cost of not doing it is 118
rows nobody labelled whose conditions have to be guessed at later.

### Two faults the guards found

**A plant with months and no parts vanished.** Membership was decided inside a loop over parts,
which made a plant's own months depend on it having some. The first fix was written loosely and put
cutch back on the panel; the test is `parts.length === 0`, not "no part matched", because a plant
whose every part is bought also matches nothing and must stay out.

**The query was read by position.** The router calls `open(...args, query)` and `args` varies in
length — none for `#/plants`, one for `#/plants/<id>`, two for `.../edit`. `open(first, second, q)`
therefore put the query into `first` on the bare address, `openId` became a `URLSearchParams`, and
the database was handed an object for a key. It failed loudly, which was luck: had `openId` been
merely wrong rather than unusable, the list would have shown an empty record with no error at all.
The query is now taken by type from the end of the arguments. **Any module with optional path
segments has this trap.**

### Guards 24e and 24f, eight checks

Rendered and inspected, never grepped: a check that finds `seasonwarn` in the source is testing
spelling, and in this project a string has twice sat in place while the behaviour was broken. Each
was shown failing before it was accepted — the mark dropped, the mark on everything, bought plants
let through, the panel vanishing when empty, the order reversed, a plant-level month passed off as
the part's own, the query read by position again, and the list narrowed with nothing on screen
saying so.

### Not in this

Seasons as a filter („лято“ puts elder flower in June and walnut husks in September in one bucket).
Anything predictive. Notifications. And the rest of the mock-up — the „Продължи“ carousel, the quick
actions, the bottom navigation — which is a separate conversation.

---

## 13ce. The plant library completed: a description, and gathering per part (1.0.0-rc16)

The workbook of §13cd came back filled. `scripts/merge-plant-gaps.py`, same discipline as the
chemistry merge: it does not overwrite what is already there, it does not invent, and it stops at
anything it cannot read rather than choosing an interpretation. Re-runnable, and shown refusing
three ways — an unreadable month, a Bulgarian description with no English, and a part marked as
bought that also carries months — writing nothing in each case.

### `description`: the plant as a plant

All 57, both languages. Not `character`, and not the „Как се държи“ section: both of those describe
dye behaviour — the temperament of the bath, what spoils it, the order of work (§13m). A botanical
opening is a seventh thing, and by the rule the library rests on, **what must be present on every
plant is a field, not a section.**

It opens the record and is deliberately **not headed**. A heading over two sentences of orientation
makes them look like a section to be skipped, and this is the paragraph that should simply be read.

### Gathering moved to the part, and finished

118 of 118 parts now answer. **The plant-level fallback is used nowhere** — the count of plants
reaching the seasonal panel through it is zero in every month.

Seven parts are `sourcedNotGathered`: avocado stone and skin, cutch bark and heartwood, henna leaf,
brazilwood bark and heartwood. A positive statement, distinct from an empty field — a month of
harvest for cutch would have been invented.

**Safflower, sumac, pomegranate, Persian buckthorn and eucalyptus came back WITH months**, settling
the question §13cd raised. They are marked `habitat: imported`, and that vocabulary is
wild | garden | imported: it answers where a plant GROWS. Sumac is native here and also arrives in a
bag; both are true at once. Reading the origin field as a sourcing field was a misreading, not a
contradiction in the data — two facts had been sharing one field, as in §13cc.

`plant.harvestMonths` is superseded, not deleted, and retires one version later as
`FabricStateEvent` did (§13bd).

`harvestRegion: 'BG'` on the pack. A gathering month is a property of the plant HERE, and the label
is what lets a second region be added later instead of 118 rows having to be guessed at.

### Guard 24g, five checks, each shown failing

Nothing is both bought and gathered, nor carries an empty list; every month is 1–12; **every part
says when it is gathered or that it is bought** — silence is now a failure, not a gap; every
description reads in both languages; and the pack that carries months says where they were observed.

### Still open

`character` and the „Как се държи“ section carry the same heading and appear twice on fourteen
records. Merging a third prose block was not the moment to take that decision, and it is still to be
taken: the recommendation is that the section stays (filled on all 57 against the field's 14), the
field folds into it, and `character` retires.

---

## 13cf. The home screen: what you came back for (1.0.0-rc17)

The screen was eleven tiles with counts — navigation wearing the clothes of a summary. It answered
"where can I go", which is not what anyone asks on opening an application they were in yesterday. It
now answers "what was I doing".

Order, fixed: **attention → Продължи → the season and the shelf → quick actions and the reference.**
The season is outside and the shelf is inside; they read as a pair. The reference goes last because
it is where you go deliberately and does not need to be greeted. Counts stay on its tiles, since
„Растения 57“ is worth reading on the way past.

### „Следващо“ exists for a trial and cannot exist for a piece of cloth

This is the line the mock-up made attractive and the model has to be checked against before it can
be written.

For a **trial** it is a fact the record states: the steps are a written plan and each carries `done`,
so the next thing is the first step not yet done.

For a **piece of cloth** there is no such thing. The shelf is unwashed → scoured → mordanted → dyed
→ finished, and §13bd says plainly that **pieces may skip states**, because the process is a base
type plus a set of enhancements rather than a sequence. A card naming "the next state" of a piece
would be inventing — on the first screen, where it is likeliest to be believed.

**So the carousel is built from trials, not from cloth.** Duplicating the shelf boxes is accepted as
convenience; inventing a value to fill a card is not.

When every step is done there is **no** next line: not „—“, not the last step repeated. A trial in
progress with all steps done is a trial waiting to be assessed, which is a different sentence and a
different button. The card says that instead.

„Продължи“ lands on the first undone step, not at the top of the record — the word is a promise
about where you arrive. The photograph is the work's own most recent step photograph, never a stock
image. Four cards, matching the seasonal panel below so the two rows agree; two-by-two on a laptop
column, four across on a wide screen, a scrolling row on a phone.

### The waiting piece joins the attention block

Cloth prepared and then forgotten is the most avoidable waste in the studio: mordanted cloth does
not keep. The trials module had computed this for some time and the home screen never said it.

It sits **with** the backup warning rather than in a panel of its own — both are "this costs you
something if you do not look", and a third panel competing for the top of the screen weakens both.
Fourteen days, so that the line is not always there; a warning always present stops being read.

The attention block stays above everything and is absent when there is nothing to say. It is the
only thing here that can cost work which cannot be got back, so it is never below the fold.

### Three things from the mock-up that were not built

**The hero photograph** — a third of the first screen, the same picture every day, pushing the work
below the fold on a laptop. The first thing you see should be your own work, and the card images
already are.

**The global search bar with its suggestion chips.** There is no cross-module search; „жълто“ would
have to reach plants, combinations, recipes and swatches, each with its own idea of a match. Worth
building, with its own brief. An empty box that searches less than it appears to is worse than no
box.

**The central `+`.** A phone pattern on a screen whose primary form is a laptop with a sidebar, and
it does not say what it makes. Giving it a menu turns it into the quick-action row from the same
mock-up, twice. The row stays; three named actions beat one unnamed one. „Еко принт“ and „Нова
записка“ are not among them: the first is a technique inside a trial, the second is not a record —
notes live on the things they are about.

### The first launch

No trials, no cloth, and until the packs are installed no plants: every block would be a heading
over nothing, and this is the first impression of a paid library. It gets its own arrangement —
what the library holds, in numbers, and one way in.

**No warnings on that screen.** „Няма архив“ is true of an empty installation and means nothing to
someone who has not yet written anything; showing it makes the application open by complaining about
work that does not exist.

### Guard 24h, and a check that could not fail

Six checks, each shown failing: the next step is the first undone one; a trial with nothing left
shows no next line; completed work stays out; the button lands on the step; attention renders above
the work; and nothing on this screen is green.

**The fifth could not fail as first written.** It compared the two positions only when both were
found, and in the test database neither was — with no work recorded the dashboard renders the
first-launch screen — so it reported a clean result while testing nothing. That is the third time in
this project a check has passed by examining nothing. Both markers must now be found, and the
absence of either is itself the failure.

The second check had the mirror fault in miniature: it searched for „—“ and failed on the em dash
inside the very sentence it was meant to be looking for. It now tests whether the next-step wording
is used at all. A check that reads punctuation is a check testing spelling.

---

## 13cg. „Как се държи" existed twice, and the phone had a widened page (1.0.0-rc18)

### One heading, two homes

`character` was a FIELD from §13m — dye temperament — on the grounds that what must be present on
every plant is a field. §13ay then admitted a SECTION headed „Как се държи", on the grounds that
observed behaviour reads as prose.

Both arguments were sound and **neither mentioned the other's name.** Fourteen records showed the
heading twice, and the field looked almost empty — 14 of 57 — because the section had quietly taken
over its work on all of them. The general description of §13ce put a third prose block on the record,
two of them identically titled, which is what forced the decision.

**The section stays**, filled on all 57 against the field's 14. `scripts/merge-character-into-section.py`
appends the field's text to the section with a blank line between — never merged into a sentence,
because a script does not compose prose — and where a plant had the field and no section the field
becomes one, inserted where the other records keep it rather than at the end. `character` is then
removed from the data, the read view, the form and the wording, in both languages.

The guard **counts the heading** rather than looking for the words. The fault was never a missing
text; it was a doubled one, and a check that only looked for the words would have passed throughout.

### A negative margin widened the whole page

Reported from a real phone: the shelf boxes and the quick actions were cut off. Neither was at
fault. The horizontally scrolling rows introduced in §13cd and §13cf used `margin: 0 -14px` to bleed
to the screen edge, and a negative horizontal margin inside a padded page **widens the document** —
everything else was pushed, not broken.

The rows are gone with it. **Two cards per row and the rest underneath**, because a sideways row
hides its own contents behind a gesture nobody makes on a screen that already scrolls downwards; the
cards past the second were effectively absent.

`jsdom` has no layout engine and cannot measure this, so guard 24i refuses the construct instead: a
negative value in a horizontal position in any `margin` rule. It reads the stylesheet with comments
stripped — the first version found its own explanation, since the paragraph above names the rule it
forbids — and it accepts `;` or `}` as the terminator, because the first version required the
semicolon and the last declaration in a block usually has none, so re-introducing the exact rule that
caused the fault did not trip it. Both faults were found by breaking the check before accepting it.

### A card that looked pressable and was not

The seasonal card carried `data-plant`. The router listens for `data-go`. It looked exactly like a
button and did nothing at all when pressed — the opposite of §13ac, and invisible to every check,
because the markup was present and correct-looking.

It now opens the plant. The second half of guard 24i walks every module for a `<button>` carrying
only `data-` names that nothing in its own file reads.

---

## 13ch. Home screen, second pass: words, marks, and one refusal (1.0.0-rc19)

From a review of the built screen.

**„Кутии с тъкани" → „Тъкани по етап".** „Кутии" is how the model thinks — a shelf a piece sits on
— and it read as a storage structure rather than as help. The block shows where the work has got to,
so it says that.

**A mark beside each stage.** Five bare words and a number was dry. The marks come from the icon set
already in the page, not from emoji: emoji render differently on every platform and would arrive in
a bilingual offline application as a third typeface nobody chose.

**„Ново растение" leaves the quick actions.** A quick action earns its place by being done OFTEN,
not by being possible. The library gains a plant a few times a year and the button was competing
with two things done every week. „Нова рецепта" takes the place: a recipe is written once and used
many times, so writing one is a real beginning. Pigments were considered and left out for the same
reason plants were.

**The empty state offers both beginnings** and says what they are for, rather than „Нямаш текуща
работа."

### The refusal: no colour coding, and no green panel

The review asked for a soft green ground on the seasonal block and a colour per fabric stage.

**This is the one change the screen cannot take.** A person judging „is this the ochre I wanted"
must not have five invented colours in the corner of the eye, and the seasonal block sits directly
beside the plant swatches. The palette rule is not a style preference; it is the reason the
workspace is neutral at all.

The concern behind the request is fair — the screen was close to being too even, everything a beige
box of equal weight. The answer is hierarchy by **spacing, heading weight and the marks**, which is
what this pass does, and not by colour. The one colour on this screen stays what it has always been:
a plant's own recorded hex, which is data.

---

## 13ci. Stopka's ratios are WOA, and the merge refused (1.0.0-rc20)

The owner confirmed twelve rows of Natalie Stopka's dyestuff ratios chart, and `merge-stopka-ratios.py`
was written to put them onto the `extractionMode` dimension §13cc had added and left empty.

**It stopped, and it was right to.** Every existing dose disagreed by roughly a factor of ten:

    madder root    recorded  50% WOF     chart  500%
    onion skin     recorded  50% WOF     chart  120%
    tagetes        recorded  30% WOF     chart  200%

These are not two opinions about one dose. `seed/sources.json` already records, in the owner's own
words, that the chart gives **plant material as a percentage of the weight of the ALUM — WOA, not
WOF** — and the glossary term `woa` states the consequence outright: read as WOF, the calculation
comes out ten times wrong.

`dosing` is WOF. Writing 500% into it would have made every madder recipe call for ten times the
root. **The fixed decision that a percentage always carries what it is relative to is what caught
this**, and it caught it in the merge rather than in a dye pot.

The script writes nothing while anything disagrees, so no partial state exists.

### The decision this leaves open

Either `dosing` gains a base — `WOF` | `WOA` — and the chart's figures sit honestly beside the
present ones; or the chart belongs only to the pigment module, where the base IS the alum, and never
touches `dosing`. The second reads as the truer one: the book is about lake pigments and the owner's
own source note describes it that way.

Not decided here. Recorded so that the next session does not rediscover it by writing the numbers in.

### Two of the chart's five columns are out, on the owner's call

`TINCTURE` is alcohol — our `solvent` — and matters only for pigment work. `ICE MACERATION` is not a
method Багра records, and adding a vocabulary term to hold two numbers would be the tail wagging the
dog.

**Buckthorn is deliberately absent** from the twelve. The chart says „Rhamnus spp." for berry, leaf
and bark; Багра holds three different buckthorns and „spp." does not say which. They are not the
same dye, and a dose is a thing someone weighs out.

### Scope

Only rows for plants Багра already holds. A published chart is a compilation, and its selection and
arrangement are the author's work even where the individual figures are facts. The intersection is
the natural boundary, not a way round one.

---

## 13cj. „Декокция" is not a Bulgarian word (1.0.0-rc20)

Corrected to „гореща отвара", which is what the `extraction_mode` label already said — so the fix
introduced nothing new.

**„Екстракт" was considered and rejected.** The root already carries three jobs: `recipe_output:
extract` is „извлек", the glossary term is „Извличане / екстракция", and one of the methods is
„алкална екстракция". A fourth sense would empty the word.

### One record had three Bulgarian names

Found while making the change. The module is „Моята работа", `trials.new` said „Нова работа",
`trials.one` said „Тест", and §13cf added „Ново изпитание". Each was written in a different session
and each was reasonable alone.

Settled on **„опит"** for the record. „Моята работа" stays as the name of the module that holds
them: a collection and a record are different things and may fairly have different words.

The wider pass — terms that sound like the model rather than the craft, and an editorial pass on the
English as a second original rather than a translation — is ROADMAP B4d and gets a session of its
own.

---

## 13ck. „Не се знае" is not „различно" (1.0.0-rc21)

The reference engine had two outcomes where the data has three. A record could agree, or it could
disagree — and a record that **did not say** was counted as disagreeing.

Found by filling the combination grid. 177 swatches came back with the fibre answered on three of
them and the mordant strength on none, honestly: the guide records colour and conditions, not the
fibre, because to someone writing a dyeing book that is obvious from context. Under the old
comparison, all 174 of the rest would have entered the reference as records **contradicting** a
question about cotton.

The distinction was already made elsewhere in the same file — the comment above the medium says an
unrecorded pH is unknown, not neutral — and had simply never been carried into the comparison.

### Three outcomes

    matches          the record states it, and it agrees
    does not say     the record is silent on it
    says something else

`silent` joins `differs`. Silence is **not** agreement either: a record that does not name the fibre
is not an exact answer to a question about cotton, so `exact` now requires both lists empty, and
`open` marks a record that agrees as far as it goes.

Open records sit **with the exact answers, not with the neighbours** — nothing in them contradicts
the question — sorted after those that answer in full, fewest blanks first.

### The wording is the point

„Записът не уточнява: влакно" is a different sentence from „различава се по: влакно", on its own
line, in the muted ink and never in the accent colour. Silence is not an objection to the record,
and a mark that shouted would make it read as one.

The guard checks that the two strings are not equal. That looks trivial and is not: the fault this
whole section corrects was one concept wearing another's words.

### Whose mistake

Recorded because the cost was three rounds of someone else's work. The first grid was generated with
four of the key's eight columns — a fault in the export script. The second corrected that and was
sent out **without checking what the matcher did with a blank**, which was one grep and would have
turned the whole exercise around: the fibre was never going to come from the text, and the right
question to the owner was always „you made these swatches, what were they on".

The order was backwards. The engine has to be able to hold a blank before anyone is asked to write
one down.

---

## 13cl. The combination library, 28 to 102 (1.0.0-rc22)

The filled grid merged. **102 records over 35 of the 57 plants**, up from 28 over 10.

### What became a record, and what did not

Two things are required and are not negotiable: **the part and the process.** Without the part a
record does not say what was in the pot, and a colour from oak bark and one from oak leaf are
different answers. 84 rows lack it and **stay swatches on the plant**, where they already do useful
work; they are reported, not forced in.

Everything else may be blank, and most of it is: `mordantBand` on 93 rows, `fibreClass` on 91,
`medium` on 90, `mordantCode` on 64. That is only usable because §13ck taught the engine that a
blank is a blank.

### Several swatches, one key, one record

Eucalyptus leaf by immersion appears three times — керемидено, прасковено, ръждиво — differing by
the strength of the bath, which is deliberately not a dimension (§13br). They are not three answers
to one question but **one answer with a range**, which is how the original 28 were already written:
„бежово, охра, светъл до среден кафяв" is a span. 93 rows became 74 records.

The colours are joined, never rewritten — a script does not compose prose — and each row's own
conditions stay verbatim in the notes, which is where bath strength was always supposed to live.

### But not every difference is bath strength

Woad leaf appears as „многократно потапяне" and as „**редукционна вана**". A reduction vat is not a
weak bath; it is a different way of getting the colour out. Alkanet the same, with „алкохолен
извлек". The key does not carry the extraction method — it lives on the dose (§13cc) — so collapsing
these would have said woad by immersion gives „средно синьо, светло синьо" and lost that one of them
was a vat.

Those two groups are **set aside, not refused**: a known and recorded limit of the model, named
precisely, which should not hold back the other 74. They stay swatches until the key can carry the
method.

### The notes were carrying instructions to whoever filled the grid

„Влакно: не е посочено в източника", „не записвай едновременно iron + alkaline" — written for the
merge and not for the reader, and the reference now says „не уточнява" for itself. Stripped, on the
separator and on the sentence, since the reasons had been written as running prose and a filter that
cut only on „·" left half of them in.

### Four records were disappearing between the pack and the database

`code` becomes the record's id. The first code generator left out `blanket` and `medium`, so two
different keys produced one code and the second **silently overwrote the first on install**. Among
the four: madder root in an alkaline bath („винено") lost to madder root with no recorded pH („ярко
розово, керемидено"). Two real and different answers, one of them simply not there, with nothing
anywhere to say so.

The code now carries every dimension the key does. Guard 24k counts the pack against the database,
which is the only thing that would have found this — nothing in the pack itself is wrong.

### Guard 24k, seven checks, each shown failing

Every record names a real plant, a part and a process; no band without a mordant, which would be the
strength of nothing; every pH says where it was measured, since an alkaline extraction is not an
alkaline bath; no key answered twice, which §13br had to clean up once already; and every record in
the pack reaches the database.

---

## 13cm. The specification put in order, and nothing renumbered (1.0.0-rc24)

The document had grown by appending for a year and three things had drifted. Not the numbering —
the arrangement.

**§14, §15 and §16 had ended up in the middle**, at line 6135, with twenty-seven later sections
after them. Anyone reading to the end passed the closing chapters two-thirds of the way through and
then carried on through another thousand lines. §13j and §13k sat before §13a; §13u sat after §13z;
§13.2a sat between the data model and the decision record, belonging to neither.

### Nothing is renumbered, and that is not tidiness

The code cites section numbers **443 times across 93 sections** — `§13bd` alone 49 times, `§11b` 32,
`§13q` 28. Renumbering would invalidate every one of them at once and in silence: the comments would
still read plausibly and point at the wrong decision.

**The identifiers are part of the interface between the code and this document.** The numbering is
therefore historical rather than positional, and the document now says so at the top: §13cl follows
§13ck because it was decided later, not because it sits below it.

### Six parts, and an index by subject

    I    The product          §1, §2, §12, §15
    II   The modules          §3 – §11b
    III  The data model       §13, §13.2a
    IV   Architecture         §14
    V    Decisions and faults §13a – §13cl, 89 sections, in sequence
    VI   Open questions       §16

Part V stays chronological because that is what it is — a record. Reading it by theme would hide
that several of the same fault recurred months apart, which is the most useful thing it has to say.

So the subject index is separate, and **written by hand**: half the titles in Part V name the FAULT
rather than the subject („Работа, която сочи към никакъв плат" is a Trials section), so an index
generated from the headings would file them under nothing. A section appears under as many headings
as it belongs to.

### `scripts/order-spec.py`, and what it refuses

It moves sections and never edits one. After writing, it re-splits its own output and compares every
section against the original, character for character; if any differs it exits without writing.

That check earned its place three times in one sitting:

- the contents list used `##` headings, and **entered the document as two new sections** called
  „How" and „By";
- the `---` rule before each part heading landed *inside* the previous section's text;
- `# Part …` is one hash, so the section pattern does not see it, and it did the same.

Each was found by the verification refusing, not by reading the result. A script that reorganises
seventy thousand words has to be able to prove it changed none of them.

### §13ax does not exist

Noticed in passing: the sequence runs §13aw, §13ay. Nothing is missing — the letter was skipped when
the section was numbered. Recorded here so the next person to notice does not go looking for it.

---

## 13cn. Six corrections from the audit (1.0.0-rc25)

Worked from `DOCUMENTATION_DECISIONS_NEEDED.md` and the owner's answers.

### A button that did nothing, for as long as the Library has existed

The home screen's „Източници" tile rendered `data-go="sources"`. There is no module with
that id — the register moved into the Library's third tab at §13bt and the tile stayed
behind, looking exactly like the seven around it that work.

„Наличности" went with it: it pointed at `materials`, which is in `HIDDEN_MODULES` — the
old Stock address kept alive so saved links resolve (§11b) — and so offered a destination
deliberately taken out of the sidebar. The Library takes the place of both, which is where
someone pressing either was trying to arrive.

### `plant.harvestMonths` retired, and a default that outlived the field

§13ce superseded it and said it would go **one version later**, as `FabricStateEvent` did
(§13bd). That was rc16; it was still on 44 plants at rc24. The condition had been met long
since: all 118 parts answer, and the fallback was reached zero times in every month.

`scripts/retire-plant-harvest-months.py` checks that condition rather than assuming it, and
refuses if any part answers neither way.

**Removing it from the pack was not enough.** The guard went red on 57 records — because
`seed.js` carried `defaults: { harvestMonths: [], … }`, which put the field back on every
plant at install time. The field was absent from the file and present in the database. **A
default outlives the field it defaults**, and nothing else would have found it: the pack was
clean, and every check that read the pack agreed.

The form was resurrecting it too — `blank()` created it, twelve checkboxes wrote it, and
the record read it. The plant record now shows the months **per part**, which is the answer
the data has, with „не се бере — купува се" where a part is bought.

`windowOf` no longer reads the plant. `viaPlant` stays in the shape and is now produced only
by a plant that records no parts at all — a plant entered before its parts, which the
library expansion will create.

### A guard whose subject was removed

Check 6 of guard 24e tested that a plant-level month was not passed off as the part's own
answer. With the fallback gone it had nothing to test and would have passed for ever.
Replaced by what is now true: a plant with no parts recorded cannot be in season.

### `character` and `seasonality` marked in the model block

§13's data model still listed both. `character` was retired at §13cg; `seasonality` is
stranger — it was specified as `{ harvestMonths: [int], note {bg,en} }` and **was never
built that way.** The code carried a flat `plant.harvestMonths` and no `note` at all, so the
specification described a shape that never existed, for a year.

Both are struck through in place rather than deleted. The model block is read as a whole and
a silently missing field looks like an omission; a crossed-out one says a decision was taken.

### ROADMAP B1 was written from the specification, not from the code

It claimed the diary had no way to record a second trial on a finished piece. **It has had
one since 0.99.2** — `trials.workAgain` on the finished card, a picker that excludes busy
cloth, and the earlier runs listed with dates. §13bj records both faults found on the way.

That is the failure the rc23 audit existed to prevent, appearing inside the audit's own
output. What is genuinely open is smaller and was kept: a re-working and a first dyeing look
identical in the diary list, and a trial read on its own does not know it was one.

### Two items left the blocking set, by decision

**Imperial units** and **library expansion** were in Part A as though they were conditions
of taking money. Neither is, unless it is decided that they are. Metric-only is defensible
for a European buyer, and 57 plants is a library. Both remain listed — the point is that the
decision is now taken deliberately rather than inherited from a list.

## 13co. Restoring a backup, and what a write means (1.0.0-rc26, amended rc27)

An independent technical audit of 1.0.0-rc25 found four faults in one place: the
path a record takes into the database. They are recorded together because they
are one fault seen four times — a single `put` doing three jobs at once, two of
which were wrong for most of its callers.

### `replace` did not replace

The backup module offers two restore modes (§11): **merge**, which adds records
whose id is not present and touches nothing else, and **replace**, offered for
moving to a new device or recovering from real loss.

What `replace` did was overwrite every record whose id matched, add every record
that was missing, and remove nothing. A record that existed in the database and
not in the file simply stayed.

So restoring last week's backup did not return the database to last week. It
returned last week's records and kept everything written since, mixed together
with nothing to tell the two apart. The mode was a merge with overwriting,
offered under a label promising a snapshot, to a person who had reached for it
*because something had already gone wrong*.

**`replace` now restores a snapshot.** For each store the file carries: the
store is cleared and the file's records are written. Afterwards the database
holds what the file holds, and nothing newer.

Three things follow, and each is a decision rather than an implementation
detail.

**One transaction.** `clear()` and every `put()` ride a single IndexedDB
transaction across every store involved. IndexedDB aborts a transaction whole,
so the failure this is arranged around — clear, write half the records, hit an
error — cannot leave a person with less than she started with and a message on
the screen saying the restore failed. Either the whole restore lands or the
database is exactly as it was.

**Validated before anything is destroyed.** Format, schema version, and that
every row carries its key, all checked against the object in memory before the
transaction opens. A file that cannot be restored is refused rather than
discovered halfway through.

**Only the stores the file carries.** A backup written by an older schema does
not hold the newer stores. Clearing those would read a gap in the file as an
instruction to delete — a migration that guesses (§13.1), in the other
direction. A store absent from the file is left alone.

**Compatibility runs forward, not back** (rc110). A backup restores into the version that wrote it
and into any later one: an older file into a newer application is the case this section guards. The
reverse is not guaranteed. An application older than the backup does not know the stores or fields
added after it, and `validateBackup` skips a list whose store it does not know — so the restore
completes and quietly leaves those out. rc109's `plans` is the first such store; `schemaVersion`
stays 3, and nothing is done to support restoring a newer backup into an older application
(`DOCUMENTATION_DECISIONS_NEEDED.md` item 35).

`merge` is unchanged in what it does: it can still only ever add. It is checked
in that direction too, because the correction is exactly the kind that turns the
safe mode into the destructive one by accident.

### A write says three things, and they are not the same thing

`put` stamped `updatedAt` with the current time and counted the write against
the backup reminder. Both are right for a person saving a trial and wrong for a
seed pack, a migration, a repair and a restore, all of which went through it.

Two independent questions, so two independent flags, and three named paths:

| | stamps `updatedAt` | counts as her work | used by |
|---|---|---|---|
| `put` | yes | yes | a person editing a record |
| `putSystem` | yes | no | seeding, pack updates, migrations, repairs |
| `putRaw` | no | no | restoring a record from a file |

The fourth combination — counted but not stamped — has no caller and is not
offered.

**Why a restore must not stamp.** The file records when the work was last
touched. Restoring it and writing today's date over that destroys the only
evidence of when the work happened, permanently, as a side effect of recovering
it. Both modes now write raw: `merge` too, since a record merged back in is
being restored just as much as one in a snapshot.

`createdAt` was already safe — `put` never touched it — and the provenance
fields (`origin`, `packId`, `editedByUser`, `editedFields`) travel in the file
and are restored with the record.

### What the backup counter counts

The counter answers one question on the home screen and in the backup panel:
*how much of my own work is not in a backup file?* Every write reached it, so
the answer it gave was not merely imprecise, it was about something else.

The worst case is the first: a new installation seeds 57 plants, 102
combinations, 32 glossary terms, the substances, the techniques, the sources,
the recipes, and 258 vocabulary terms — several hundred writes, every one of
them counted. The threshold for the warning is forty. A person opened the
application for the first time and was told she had hundreds of unsaved changes
before she had typed anything.

**The counter now moves for `put` and `remove` and for nothing else.** Seeding,
pack updates, migrations, repairs and restores are deliberately invisible to it:
none of them is work that would be lost, because every one can be performed
again from a file that already exists.

`remove` was not counted at all, which meant the surest way to have no unsaved
changes was to spend the afternoon deleting things. It counts now. `removeSystem`
exists for the one deletion that is not hers — a record withdrawn by a pack
update (§13cb).

### The file's own counter is stale, by construction

`downloadBackup` exports and then resets the counter, so what travels inside the
file is the count from *before* the export, alongside the previous
`lastExportAt`. This never showed while `replace` was a merge, because merge does
not touch a key that already exists. The moment `replace` became a snapshot it
would have restored both — telling her she had unsaved work at the exact moment
the database equalled a file on her disk.

After a snapshot restore: `changeCounter` is set to 0, and `lastExportAt` to the
file's own `exportedAt`. Both are the truthful answers. `returnTo` is cleared —
it is a handoff address (§13bo) that may now point at a record the restore has
removed.

**Settled:** `settings` is restored as part of the snapshot, but the *language*
is not. It is a property of the **device**, not of the work. Nobody reaches for a
restore in order to change the language, and a person recovering from data loss
should not be met with an interface in the other one; restoring a phone's backup
onto the laptop leaves the laptop as it was.

Absence is preserved as carefully as a value. No `language` row means the
application default — English since rc108 (`DEFAULT_LANG` in `i18n.js`, §13fi;
Bulgarian until then) — so writing one where there was none would change the
language just as surely as overwriting one.

`fabricLabelCounter` **stays in the snapshot**. It is state rather than
preference: losing it means the next piece takes a number that is already on a
label in the studio.

### The removal count is a set difference, not a subtraction

`removed` was first written as the count before minus the count after. That is
right only when the file is a subset of the database. Current `{A, B}` against a
backup of `{B, C}` is two records before and two after — so the arithmetic
reported nothing removed, while A had gone.

The number after a snapshot restore is the one thing telling a person what the
file did not carry, and it is a set difference: the ids present in the database
and absent from the file, read before the transaction opens.

### The label promised the fault

`backup.confirmReplace` read „записите с еднакъв идентификатор ще бъдат
презаписани" — an accurate description of the merge-with-overwriting it was
attached to. Correcting the code and leaving the sentence would have had a
person press *yes* against a promise that was no longer true, and lose newer
records without having been told. Both languages now say the database is
returned to exactly what the file holds and that anything entered since is lost.
The report after a snapshot restore is its own sentence (`backup.restored`) and
names how many newer records went.

---

## 13cp. A run that may skip, and a run that may not (1.0.0-rc26, amended rc27)

`check.sh` has six layers and three of them need something installed. When the
shim was absent the run printed a line saying so and carried on with status 0.
An independent run of 1.0.0-rc25 in a clean environment ended:

```
boot check skipped (npm install --no-save jsdom fake-indexeddb)
all held
```

Three of six layers had not started, the pipeline reported success, and nothing
in the output distinguished that from a run in which they had. This is §1 of
`check.sh` again — the layer that printed fourteen NOT CACHED lines and left
with status 0 — and it is the same lesson: **a guard that reports and does not
stop is not a guard.**

On a laptop mid-afternoon skipping is right. The static layers are fast and the
runtime ones are not always worth the wait. So the two runs are named apart
rather than one being made to serve both:

```
sh check.sh              development — a runtime layer whose dependency is
                         absent is skipped, and the run says so
sh check.sh --release    release     — an absent dependency is a FAILURE
BAGRA_RELEASE=1 sh check.sh
```

The invariant, in one line:

> A candidate cannot be called checked if a layer of its release policy never
> started.

`check-deps.mjs` is the gate. Three exit codes, because a shell `||` must be
able to tell *cannot run here* from *must not ship*: `0` everything present,
`2` missing on a development run, `1` missing on a release run. The failure
message names what is missing and the command that installs it — a release that
stops without saying what to install is a release that stops twice.

**The second door.** `screen-check.mjs` had a silent skip of its own: with
`puppeteer-core` installed and no Chromium on disk it printed „screen check
skipped (no chromium found)" and exited 0. Gating only the driver in the shell
would have closed one door of two, so the gate checks the browser as well.
`BAGRA_CHROME` names one, for an installation the list does not know about — and
for the test below, which cannot create a missing browser by deleting one.

**The gate has a guard of its own**, and it is asked in both directions
(`scripts/try-release-gate.sh`, run among the static layers because it needs
nothing installed). Stuck open it lets an unchecked candidate through, which is
the fault it was built for. Stuck shut it stops every development run and gets
pulled out within a week, which is how a suite loses a layer for good.

### What the gate found on its first release run

Six failures in the screen layer, all present in 1.0.0-rc25 byte for byte, none
ever seen, because that layer had never run. Reading them turned out to be a
second lesson: **four of the six were one stale line in the harness.**

`screen-check.mjs` listed `#/sources`, and there has been no module of that name
since attribution folded into the Library (§13bt) — Sources lives at
`#/library/sources`, with the tab in the address (§13q). An unknown module id
falls back to the dashboard, so the layer rendered the HOME SCREEN and reported
its faults under the name of Sources, including „there is no record to open",
which was true of the dashboard and said nothing whatever about the Sources
table. The Sources screen had never been measured at all, at either width.

This is the failure mode this project has named three times — a check that is
not testing what it says it is testing — in its most expensive form: not silent,
but failing loudly about the wrong screen, which would have sent somebody
hunting a layout fault on a page that was never drawn. The route is corrected
here, along with `#/library` and `#/library/ph`, which had no coverage either.
The correction belongs in this release because it is the test pipeline, which is
what this release is about.

**Two real faults remain**, and they are deferred on purpose:

- `#/dashboard`, phone — „Виж всички →" is 23px, under the 44px finger target
  (§13ac). Also a note at desk width, with three buttons at 37px.
- `#/plants` opened, phone — the *use now* tiles overflow, 337px of content in
  322px. A grid track of `minmax(108px,1fr)` cannot hold a tile whose value will
  not wrap.

Neither is mechanical. Growing the link to 44px moves the heading row it sits
in; letting a tile shrink means letting a figure wrap, and these are the figures
meant to be read at a glance over a pot (§13bs). Both are layout decisions and
both wanted the owner's eye. Corrected in 1.0.0-rc31 (§13cz).

Both were corrected in 1.0.0-rc31 and nothing else was in that release (§13cz).
`sh check.sh --release` passes all six layers.

For the six releases in between, the gate refused the candidate — which is the
gate doing exactly what it was built to do. Each of those was a candidate that
passed five of its six layers and said so, rather than one that passed six by
not running one.

## 13cq. The history cannot be orphaned by a delete (1.0.0-rc28)

Six modules offered a plain physical delete — recipes, plants, techniques,
fabrics, combinations, chains — while other records held their ids, and nothing
checked.

Delete the tannin recipe and every trial that used it still says it used
*something*: the step is there, the id is there, the lookup that resolves it
returns nothing, and the screen renders „—". The history survives in shape and
loses its meaning, silently, at the moment least likely to be noticed.

It is worst on recipes, because the model already carries versioning for exactly
this reason (§13ab): a past trial goes on pointing at the version actually used,
so improving a recipe never rewrites what happened. Physical deletion of that
version defeats the whole mechanism.

### One checker, written out by hand

`refs.js` holds the map of every incoming reference. It is written out rather
than discovered, because a path the file does not know about is a path that
silently permits a delete — and a checker returning zero for a path it cannot
see looks exactly like a record nobody uses. That is the failure mode this
project has named three times.

**No back-references are stored** (§13.1 is unchanged). The record does not know
who points at it; the answer is derived by reading the pointing stores at the
moment somebody presses delete, which is the only moment it is needed.

| Deleting | Is pointed at by |
|---|---|
| Recipe | a trial step · an action on cloth · a group action · **a chain step** |
| Chain | a trial step · an action on cloth · a group action |
| Plant | a placement · a reference record · a pigment batch · **a recipe ingredient** |
| Technique | a trial |
| Combination | a placement |
| Fabric | a trial · a group action |
| **Substance** | a recipe ingredient · a jar on the shelf |
| **Trial** | an action it wrote onto cloth |

The last two were not in the audit's list and are real. A substance is the same
fault one level down: delete it and a recipe has an ingredient with no
substance. A trial WRITES actions onto cloth (§13an) and those actions carry its
id, so deleting it leaves a piece of cloth saying it was dyed by something that
does not exist.

### The policy

**Refuse, with a count.** One policy for every entity, not five.

`archive` was not introduced. The audit allows it and it is the better answer in
the long run, but a new model concept in an iteration whose point is a
measurable, easily regression-tested change would have made it neither. Blocking
with a plain explanation is the whole of the behaviour:

> This recipe is used in 7 trials and 2 group actions. It cannot be deleted.

Counted by RECORDS, not by pointers: a trial naming the same recipe at three
steps is one trial, because „7 trials" is a thing a person can go and look at.

**No cascade, ever.** `delete recipe → delete the steps that used it` and
`delete plant → blank every plantId` both turn one explicit act into silent loss
of the history the record was part of. The refusal is the feature.

`deleteGuarded` in `ui.js` is the only route, because six copies of this
decision would become five copies and an exception. A `remove()` left in a
module against a checked store fails the build.

**Open, for the owner:** a piece of cloth that has been used cannot now be
deleted at all, and cloth is the one entity a person genuinely disposes of.
Recorded in `DOCUMENTATION_DECISIONS_NEEDED.md`.

---

## 13cr. The shipped photographs leave the plant record (1.0.0-rc28)

`seed/plants.json` was 3.97 MB and 3.49 MB of it was `photoData` — base64 JPEG
inside the records, for 57 plants. Almost the whole plant pack was pictures.

Download size was the smaller half of it. The photograph lived INSIDE the
record, so every `all('plants')` cloned all of it out of IndexedDB into JS to
answer questions about names and parts — and plants are read by Reference,
Recipes, Trials, the seasonal panel and the plant screens. A routine read of 57
records moved nearly four megabytes.

The photographs are now files:

```
seed/images/plants/<code>.jpg      57 files, 2.62 MB
photoSrc: 'seed/images/plants/quercus_robur.jpg'
```

The browser fetches one when an `<img>` is actually on screen, and not before.

| | rc27 | rc28 |
|---|---|---|
| `seed/plants.json` | 3 973 057 B | 486 387 B |
| shipped images | — | 2 619 187 B in 57 files |
| one plant record | ~65 KB | 7 561 B |
| `all('plants')` | ~3 730 KB | 326 KB |

### Telling her photograph from the shipped one

The one thing this migration must not do is replace a photograph the owner put
there herself. On an installed rc27 copy `photoData` is one of two things and
the record does not say which. `editedByUser` cannot decide it — it is set by
saving the record at all, for any reason.

So it is not inferred. **The pack records the SHA-256 of the exact string it
shipped**, and the migration compares. Equal means this is the shipped
photograph and the file now holds it. Anything else is hers and is left exactly
where it is.

That is an equality test, not a judgement. Where there is no comparison table —
offline and uncached — nothing is touched and the migration is not marked done,
because comparing nothing would be guessing (§13.1).

Rendering is `photoData || photoSrc`. Her photograph wins, always, and a pack
update can never displace it because the pack no longer carries `photoData` at
all.

`photoCredit` never moves. Attribution is a condition of shipping (§13at) and
neither half of this touches it. The two guards that check it were reading
`photoData` and now read `photoOf` — they failed loudly on the change, which is
the right way round.

### The form

„Remove the photograph" appears only against a photograph of hers, and undoes
it — the shipped one comes back. Against a shipped photograph the offer is
„Replace the photograph". Hiding a shipped photograph is a different idea and
would need a field to remember the hiding; it is not built. Settled with the
owner.

### Offline

All 57 images are in the worker's cache list, and a new layer of `check.sh`
checks it in both directions: a file on disk and absent from the list is a
picture that works at the desk and is broken in the garden; a name in the list
with no file behind it fails the whole `addAll` and takes the worker down.

---

## 13cs. A normal start no longer reads the library (1.0.0-rc28)

Every boot fetched and parsed EVERY pack, in full, to find out whether there was
anything to add. For plants in rc27 that was 3.97 MB read, parsed and thrown
away on every single opening of the application, so that `seedPack` could
discover that all 57 records were already there. The first render waited for it.

### What the gate must not break

`seedPack` does not only seed a fresh install. It also puts back a seeded record
that has gone missing — deleted by hand, lost after a deploy — and that is a
real recovery path, not an accident of the implementation. A gate that says

> same version → skip

would change that silently: delete a plant, restart, and it would no longer come
back.

So the gate asks TWO questions and skips only when both agree:

1. **Is the shipped version the one installed?** — from `seed/manifest.json`,
   534 bytes.
2. **Is the SET of seeded ids still the set that was installed?** — a
   fingerprint over the ids, read with the new `keys()`, which uses
   `getAllKeys` and clones no records at all.

A record deleted by hand changes the fingerprint, the gate opens, the pack is
fetched, the record comes back. Behaviour preserved exactly, and the guard
checks it in that direction as well as the other.

### What the gate is not

It is never a reason to overwrite anything. It can only decide whether to run
`seedPack`, which adds absent records and touches nothing else. Pack UPDATES go
through `diffPack` and the preview (§10) as before, and the explicit „check the
library" button calls `diffPack` directly — so a person asking to be shown the
pack is always shown it, whatever the gate decided. `packsWithNewVersion()`
answers „is there a newer library" from the manifest alone, without opening a
pack.

A pack that fails to load records nothing, so the next start tries again rather
than deciding it is installed.

### Measured

Development measurements, under Node with `fake-indexeddb` and a filesystem
`fetch` — no network, no disk cache, no service worker, an in-memory database.
The absolute numbers mean nothing outside `scripts/time-boot.mjs`. The shape is
what transfers.

| Second start, library unchanged | rc27 | rc28 |
|---|---|---|
| packs phase | 138 ms, 7 files, 4 059 KB | **1 ms, 1 file, 1 KB** |
| `all('plants')` | 16 ms | 3 ms |
| first start, packs phase | 90 ms, 4 059 KB | 50 ms, 655 KB |

The structural claim is the one that matters and it is checked rather than
timed: **an unchanged boot does not fetch `seed/plants.json` at all.** The guard
counts the fetches and names them, and the whole start reads one file.

## 13ct. Attribution is part of the history (1.0.0-rc29)

`refs.js` closed the delete hole for workflow records (§13cq) and left the
sources register open: `modules/library.js` still deleted a source outright,
while other records went on crediting it.

It is the same fault, and for a library meant to be given away it is also a
licence problem rather than only an integrity one. The claim stays on the
screen; the credit it rests on is gone.

### The paths

| Credits a source through | Where |
|---|---|
| `sourceCode` | glossary terms |
| `sourceCode` | recipes |
| **`colours[].source`** | every colour swatch on a plant |

The third was not in the audit's list and is the largest: 57 plants carry
swatches, and **four of the ten sources are named nowhere else**. Checking only
the two obvious fields would have left those four freely deletable while
reporting that the register was protected.

### A target key that is not the id

A source reference does not name an id. A seeded source has the id
`seed:boutrup-ellis`; the records that credit it write
`sourceCode: 'boutrup-ellis'` — the code, unprefixed. That was deliberate
(§13bt): a credit survives its source record being reseeded.

So the checker takes the key from the target instead of assuming `id`:

```js
const TARGET_KEY = {
  sources: (row) => row.code ?? String(row.id || '').replace(/^seed:/, ''),
};
```

Every other entity keeps the identity function and behaves exactly as before,
which is checked — an alternate key that quietly broke id matching would trade
one hole for a worse one. The source references are NOT migrated to ids; that
would be a model migration with nothing to show for it.

### The false positive worth naming

`trials.water.sourceCode` holds a `water_source` vocabulary code — rain, tap,
well — and has nothing whatever to do with the sources register. A checker that
matched on field name would refuse to delete a source because somebody had
written down where the water came from. The paths are enumerated by hand for
exactly this reason, and the guard asserts the water case explicitly.

Policy is unchanged from §13cq: an uncited source deletes, a cited one is
refused with an honest count per kind, no cascade, no blanking of `sourceCode`.

---

## 13cu. A fast start is not a reviewed library (1.0.0-rc29)

The boot gate (§13cs) recorded one `version` per pack and used it to answer two
different questions.

Booting against a newer pack, `ensurePacks` fetched it, `seedPack` added the
genuinely new records, and the changed ones were correctly left alone — and then
the shipped version was written down as installed. `packsWithNewVersion()`
compared the manifest against that same field and answered: **nothing new.**

So opening the application could silently retire an update the owner had never
been shown. The changed records were still the old ones. The withdrawn ones were
still there. The notice that would have told her had been switched off by the
act of starting up. A fast start had come to mean „the library is up to date",
which it never was — and the failure is invisible, because everything on the
screen looks settled.

### Two fields

```js
packState[name] = {
  seededVersion,    // what the boot gate has handled well enough not to refetch
  appliedVersion,   // what the owner has been shown and has applied
  fingerprint,
}
```

The gate reads `seededVersion`. „Is there something new" reads `appliedVersion`.
A boot moves the first and **never** touches the second.

`recordApplied()` writes `appliedVersion`, and is called from the preview and
from nowhere else. A version becomes applied by being reviewed, never by being
booted past.

**A fresh install is the one case where seeding IS applying** — there was
nothing to review, because there was nothing there. A pack installed from empty
counts as applied; anything else keeps whatever the owner has actually reviewed,
which may be nothing.

**A partial apply leaves the pack pending.** If she ticked some entries and left
others, those others are precisely what the notice exists to keep offering — a
withdrawal above all, which is never performed except by a choice (§13cb).

### The lifecycle, in order

1. **Fresh install** — pack loaded; both fields set to the shipped version.
2. **Unchanged start** — versions match, fingerprint matches, nothing fetched.
   The whole start reads one file, the 534-byte manifest.
3. **A seeded record deleted by hand** — the fingerprint differs, the gate
   opens, `seedPack` puts it back. Unchanged from §13cs.
4. **A newer pack ships** — the gate opens once. Truly new records are seeded;
   changed, edited and withdrawn records are untouched. `seededVersion` moves,
   `appliedVersion` does not, and the pack **stays pending**.
5. **The preview applies** — `recordApplied` moves `appliedVersion` if she
   applied all of it. The pack stops being pending.

### What the gate still does not detect

A pack whose CONTENT changes while its VERSION stays the same. That is a
packaging error rather than a case to guess at, and guessing would mean fetching
every pack on every start, which is the thing §13cs removed. Noted because a
regression test found it while being written, not while failing.

## 13cv. A write says what kind of write it is (1.0.0-rc30)

Three write paths became four. `putSystem` was doing two jobs that look alike
and are not: revising the CONTENT of a record, and reshaping its STRUCTURE.

| | stamps `updatedAt` | counts as her work | for |
|---|---|---|---|
| `put` | yes | yes | she edited it |
| `putSystem` | yes | no | a pack revised the content; a library correction |
| `putMigration` | **no** | no | a structural conversion or repair |
| `putRaw` | no | no | restored verbatim from a file |

**Why a structural write must not stamp.** Converting a piece of cloth's old
state list into actions (§13bd), or moving a photograph out of a record and into
a file (§13cr), is the application tidying up after itself. It is not something
that happened to the cloth. Stamping it moves a piece last touched two summers
ago to the top of every list ordered by recency — and it does it to whichever
records happened to need converting, so the order of her work is rearranged by
the shape of a migration.

The call sites, and why each is where it is:

- **`seedPack`, `applyDiff`, vocabulary and bands** — `putSystem`. A shipped
  revision genuinely changes what the record says; that the change came from a
  pack rather than from her hand does not make it not a change.
- **`healDoubleStateEvents`** — `putMigration`. Removing a duplicate event and
  recovering a date the record had lost are repairs of a fault, not edits.
- **`migrateFabricActions`** — `putMigration`. A batch reconstructed from an
  event dated two summers ago takes the time of what it was built from; where
  the source carried no date there is nothing to inherit and the conversion is
  the only time it can honestly claim.
- **`migratePlantPhotos`** — `putMigration`. Nothing she would recognise as
  content changes, so the plant does not become a plant edited today.

`putMigration` and `putRaw` carry the same flags today and are separate names on
purpose. A call site should say what it is doing; a restore and a migration are
not the same act, and code in which they are indistinguishable is code in which
the next change to one silently changes the other.

---

## 13cw. A repair runs once for a database (1.0.0-rc30)

`healDoubleStateEvents` and `migrateFabricActions` walked every piece of cloth on
every single opening of the application, for ever, to establish that there was
nothing left to do. Both were written to be safe to re-run and both were — but
safe is not free, and a pass that can only ever do nothing is a pass that should
not be made.

```js
settings.migrations = { doubleStateEvents: 1, fabricActions: 1, plantPhotos: 1 }
```

Order still matters and is why these are not three independent passes run in any
order: migrating first would copy the duplicates into the new list.

**The marker is a control, not a crutch.** Every pass remains safe to run twice
by hand, and the guard checks that it is, because a marker that has become
load-bearing is a marker one bad restore away from corrupting a database.

**Written only after the pass returns.** A pass that throws leaves no marker and
will be tried again. That is the whole reason it is written at the end.

### Why `if (marker) return` is enough here

A snapshot restore brings back a whole database as it was (§11.4), and that
includes `settings`. So restoring a backup taken before a migration restores the
state before it AND the absence of its marker, together. The marker is data and
it travels with the data it describes.

Nothing was built for this — it falls out of a snapshot being a snapshot, which
is exactly why the guard asserts it instead of assuming it. Restore a modern
backup and no redundant pass runs; restore an old one and the migration becomes
eligible again and runs.

The passes moved to `migrations.js`, for the reason `migrate-actions` and
`migrate-photos` already give: a migration that can only be exercised by
starting the whole program is a migration nobody exercises.

---

## 13cx. The backup warning counts the photographs that exist (1.0.0-rc30)

The warning read `count('photos')`.

**Nothing has ever written to the `photos` store.** Not once, by anything. So
the sentence that tells a person what she stands to lose said „0 photographs" to
somebody with two hundred of them — and said it in the one place designed to
make her take a backup seriously.

`countUserPhotos()` counts every image that exists nowhere else:

| Where | Counted |
|---|---|
| `fabric.photoData` | one per piece |
| `trial.resultPhotos[]` | each |
| `trial.steps[].photos[]` | each |
| `pigmentBatch.photos[]` and `stages[].photos[]` | each |
| a plant's personal `photoData` override | one per plant |
| the `photos` store | each, and it is empty |

**Images, not records.** A trial with five result photographs is five.

**A shipped plant photograph is not counted.** `photoSrc` names a file the
application carries and can lay down again from the pack (§13cr). It is not at
risk, and counting it would inflate the warning — which is its own kind of lie.
A warning that overstates gets ignored at exactly the speed it deserves.

One helper, used by both screens that warn, because the reason this drifted is
that each of them counted for itself. The `photos` store is still added in, last
and deliberately: if photographs are ever moved into it, the warning follows them
instead of quietly going back to zero.

---

## 13cy. The release gate runs where it can be run (1.0.0-rc30)

`check.sh --release` refuses to pass when a mandatory layer cannot start
(§13cp), and three of the six layers need Node packages and a browser. The owner
works through the GitHub web interface and has no terminal — so in practice the
release run could only happen inside a development session, which meant the one
check deciding whether a candidate may ship depended on somebody remembering to
ask for it.

`.github/workflows/release-check.yml` runs it on push to main, on every pull
request, and on demand.

**It does not deploy.** A gate and a deployment are separate decisions, and
joining them would mean a green check pushing code to the owner's phone without
her asking.

**Pinned, in `test/`.** Багра ships as vanilla ES modules with no build step and
no runtime packages, and that is fixed. The test dependencies live in `test/`
so the root of the repository stays free of a manifest that would suggest
otherwise, and CI copies them up only because Node resolves `node_modules` by
walking upwards. `npm ci`, not `npm install`: it installs the lockfile exactly
and fails if the two disagree. The point of pinning is that this environment in
six months is this environment today.

**The browser is named, not hoped for.** The workflow searches known paths and
sets `BAGRA_CHROME` — the same variable `check-deps.mjs` reads, so the gate and
the layer it gates cannot disagree about which browser they mean. `screen-check`
reads it too now. A runner with no browser stops the job at that step rather
than three layers later.

**The workflow is checked, lightly.** `try-release-gate.sh` asserts four things
about it: that it runs the release command and not the development one, that it
names its browser, that it installs from the lockfile, and that it carries no
`continue-on-error`. A permanent allow-failure would turn the gate into
decoration. Nothing else is checked — a test asserting YAML indentation would be
a test written to raise a number.

**It will be red at first**, on the two known screen defects, and that is
honest. They are the next piece of work and the gate turns green when they are
fixed, which is the correct order: the gate reports the state of the code rather
than being shaped to fit it.

## 13cz. The two screen defects (1.0.0-rc31)

The two faults the release gate found on its first run (§13cp), corrected on
their own and with nothing else in the release. Both are layout, both wanted the
owner's eye, and both are now green — `check.sh --release` passes all six layers
for the first time.

### „Виж всички →" — a finger target, not a bigger button

23px tall, against the 44px rule (§13ac).

The place is right and stays: to the right of the heading, on the same line. It
is a way out of the block, not an action of its own, and turning it into a
button would give it the weight of one.

So the LINK stays 13px and light, and the BOX around it becomes 44px. The rule
is about the area a thumb has to hit, not about how loud the thing looks.

```css
.seasonall{ display:inline-flex; align-items:center;
            min-height:44px; margin-block:-10px; }
```

The negative block margin gives the height back to the layout: the extra is
padding for a finger, not space in the design. Without it every heading row
carrying one of these would grow by twenty pixels. Measured at four widths — the
box is 44px everywhere and the heading row is unchanged at 41px on the desk.

**Wrapping is the fallback and only that.** `flex-wrap` on `.seasonhead` lets
the link drop to its own line where the two cannot share one honestly. Driven by
whether they fit and not by a breakpoint: a number would be wrong for one
heading or another, and there is no reason to have two mechanisms deciding the
same thing. Side by side stays the layout everywhere there is room.

### The *use now* tiles — and why the obvious fix did nothing

337px of content in 322px, clipped rather than scrollable.

The obvious reading is that a grid item would not shrink, so `min-width:0` on
`.usetile` should fix it. **It changed nothing**, and the measurement is why the
guess was not trusted: the tracks were already fine at 146.5px each, and the
overflow was inside the tile.

The label was a bare text node in a flex row — which makes it an **anonymous
flex item**, and an anonymous item's `min-width:auto` cannot be reached by any
selector. It could not shrink below its longest word, and one Bulgarian compound
(„Светлоустойчивост", 163px in a 121px tile) pushed the whole strip past the
viewport.

Wrapped in a span it is a real item and can be told to wrap:

```css
.uselabel{ min-width:0; overflow-wrap:break-word; hyphens:auto; }
```

`hyphens:auto` first, so a break lands where the language allows one — it
follows `documentElement.lang`, which i18n already keeps current, so the
hyphenation follows the interface language. `break-word` is the last resort for
a word with nowhere good to break. The mark still accompanies the label and does
not replace it (§13ac).

**The figures are unchanged and stay strong.** No smaller typeface, no
horizontal scroll, no clipped value, no tile wider than the viewport. The track
minimum stays at 108px, because it was never the problem.

A long value may take a second line. A figure may not be split across one: unit
and number are joined with non-breaking spaces where they are built, so
`80–90 °C`, `20% WOF` and `1 : 20` wrap around themselves rather than through
themselves. `80–90` and a lonely `°C` on the next line read as two facts.

### No new guard

The screen layer is the regression test here. It found both, it fails on both if
they return, and it is part of release policy — a second check asserting the
same CSS would be a test written to raise a number.

## 13da. Phase 1 of the library: 130 facts, 16 held (1.0.0-rc32)

The first return of the data workbook: sheets 4 and 5, plant-level fields and
part-level fields. Merged by `scripts/merge-phase1.py`, which is idempotent and
run again reports nothing to do.

```
FILLED   130   empty → value
ALREADY  399   the workbook agrees with the pack
TIDIED     3   80–80 written as 80
HELD      16   would change or contradict a recorded value — NOT applied
```

`dyeClass` went from 6 of 57 to **57 of 57**, and all **118 parts** now carry
chemistry, dosing and temperatures. Fifteen new sources joined the register,
which is where the provenance for this phase lives (§13bt).

### Fills only

The workbook is a draft to be checked against the model, never a decision. A
cell that would change something already recorded is held and printed. Sixteen
were: eight safety and fastness values where the pack and the workbook disagree,
two on alkanet's ceiling, and six on safflower.

### The rule that was not enough

„Only fill what is empty" caught twelve of them and missed four, and the four it
missed are the instructive ones.

Safflower's DYEING temperature was empty. So 70–75 °C arrived as a fill, passed
the vocabulary check, passed the fills-only rule, and was written. And the same
record's `extractionModes` says `cold`, and its own colour note says the red
comes from an alkaline extraction — carthamin is drawn out cold and heat
destroys it. Every value legal, every code known, and the record no longer
agreeing with itself.

This is the shape of fault a data merge produces that a vocabulary check cannot
see. A new guard in `deep-check` asks the one question the model can state:

> does a part restricted to COLD extraction carry a hot temperature?

It found the four immediately, in the merge that had just been run. The same
test is repeated inside the merge script, because a merge that writes a fault
and leaves a later layer to notice is a merge that has to be undone by hand.

**Deliberately narrow.** It is not a plausibility check on temperatures in
general. Inventing a range and failing the build against it would be the guard
manufacturing the knowledge it exists to protect (§13ax).

### 80–80 is not a range

Three degenerate spans were already in the pack and one arrived in the workbook.
On screen „80–80 °C" reads as a range somebody measured twice rather than as one
figure. Written as `{min: 80}` it says what it means. Not a change of meaning,
and the merge no longer reports it as a disagreement — a merge that cries wolf
gets its warnings skimmed.

### Two other things the return recorded

`article` was used as a source kind and the application does not have one — its
kinds are book, course, person, site, reference, other. The eight papers are
`reference`. Caught by the existing guard, which is what it is for.

The workbook left the per-row source column empty by decision, and that is
consistent with the model: attribution lives in the Sources register rather than
on each field (§13bt). The fifteen sources are the provenance for the phase as a
whole, which is a weaker claim than a citation per figure, and it is the claim
actually being made.

### Held, awaiting the owner

Recorded in `DOCUMENTATION_DECISIONS_NEEDED.md`. None is applied.

## 13db. Plant Library v1 — done, by a definition that can be re-run (1.0.0-rc36)

The owner wrote a Definition of Done for the plant library. `audit-library.mjs`
runs it, and `check.sh` runs that — because a definition of done which cannot be
re-run is a claim made once about a moment that has passed.

### The distinction the whole thing turns on

**An intentional null is a finished field.** Fifty-four eco print records do not
name a fibre, because the review they came from described the print and the
colour and never mentioned the cloth. That is the completed state of that field,
not a blank waiting to be filled.

Counting those as work outstanding does two kinds of damage. A library that is
finished goes on looking unfinished for ever; and the twenty-eight real gaps —
immersion records that could still be answered — get lost among fifty-four that
never will be. So the audit counts them apart and reports only the second as
outstanding. Clause 6 of the Definition says this in the owner's own words.

The same distinction, met again: seven parts carry no harvest months, and the
first version of this audit failed all seven. Brazilwood, cutch and henna are
BOUGHT — `sourcedNotGathered` says so on the record — and there is no month to
name because the question does not apply. „Unknown" and „not applicable" are
different states (§16.00), and an audit that conflates them manufactures work.

### Two documented absences

Lavender and medlar have no combination and will not get one. For lavender the
accounts do not resolve into a clean key: they disagree on the part, and where a
colour is reported the fibre and the mordant are usually left out. For medlar
the only historical combination uses **bismuth**, which is not in the vocabulary
and will not be added to close a gap — the vocabulary describes what the studio
does, and adding a code to make a number look better is the tail wagging the
dog.

Both keep a full plant profile. What is absent is the reference answer, and the
application says so rather than guessing.

**The audit reads their reasons out of `DOCUMENTATION_DECISIONS_NEEDED.md`
rather than holding a list of its own.** An exemption whose reason lives
somewhere else is an exemption nobody can check: remove either name from that
file and the audit fails the same day. Seen failing, in that direction and two
others.

### What it checks

| clause | asked as |
|---|---|
| 1 | every plant carries all nine profile fields and a risk level |
| 2 | every GATHERED part has a known code and a season |
| 3 | no `mixed` fibre class, no combination without an expected colour |
| 4 | every plant has a combination or a written reason |
| 5 | iron blanket ≠ iron mordant · no pH in the mordant field · no two records with one key |
| 6 | eco print silence counted apart from a real gap |
| 7 | every cited code resolves in the register |
| 10 | no code outside the vocabulary |

Clause 5 is the one worth naming: an iron BLANKET is a cloth soaked in iron
water and laid against the work; an iron MORDANT is iron the fibre took up
beforehand. They give different results, and a record confusing them tells
somebody to do the wrong thing in a studio.

### The tally

```
plants with a full basic profile      57/57
plants with at least one combination   55/57
combination records                    163
  of them eco print                     55
intentional nulls (eco print fibre)     54
unresolved gaps (other fibre)           28
sources registered                      45
invalid codes                            0
```

### Moved to post-v1

By clause 8 and the owner's own list: the compositional role for the remaining
24 plants, `printingSide` (§13 of the decisions file), a bibliography per row, a
swatch for every literature combination, and more combinations per plant. None
of them is foundation; all of them are enrichment.

**The library is no longer what stands between the application and 1.0.** What
does is `A6` — the legal and safety texts, units, and the numerical tests on the
calculators — and the interface, which is now where the value is.

## 13dc. One system stored, another shown (1.0.0-rc37)

Every figure in the database is in one system and one only — grams,
millilitres, degrees Celsius, grams per square metre. The field names have
always said so: `weightG`, `tempC`, `weightGsm`. Nothing about this release
changes what is written.

**Why canonical, and not a unit on each record.** A record carrying its own
unit is a record that must be read twice: once for the number and once to find
out what the number means. Two trials become incomparable. An export becomes
ambiguous. And a backup taken on a device set to ounces restores onto one set
to grams and is quietly wrong by a factor of twenty-eight — quietly, because
every figure still looks like a figure. Storing canonically makes that
impossible rather than unlikely.

So `units.js` is a DISPLAY layer, and it is symmetrical: what it renders on the
way out it parses on the way back in. A person working in ounces types ounces
and the database still holds grams.

### The round trip has to close, and at first it did not

`mass()` used a fixed two decimal places. One gram of iron — a real quantity in
a real recipe — came out as „0.04 oz", and reading that back gave 1.13 g. A
thirteen per cent error, produced by somebody opening a record and saving it
without touching the weight.

Places now follow the size of the number, three significant figures, capped at
four: `0.0353`, `3.53`, `27.2`, `250`. The guard walks six magnitudes from one
gram to twelve kilograms and requires every one to close within half a per cent.

Temperature stays whole degrees. Nobody sets a pot to 176.4 °F, and the extra
figure would claim a precision the thermometer does not have.

### What never converts, said out loud

A ratio is not a measurement. Percent WOF, a liquor ratio of 1 : 20, a
percentage solution strength — the same number in every system. Converting one
would be the worst kind of bug in this file, because the output would look
entirely plausible.

`wof()`, `ratio()` and `percent()` exist for that reason. A call site could
print the number directly; going through a named function says out loud that it
knows better, and silence would be indistinguishable from having forgotten. The
guard asserts each of them in both systems.

### A property of the device

Like the language (§13co): it travels with the person, not with the work. A
snapshot restore leaves it alone, so a phone's backup does not put the laptop
into ounces. `units` joins `language` in the short list of settings that survive
a restore, and `fabricLabelCounter` stays on the other side of that line because
it is state rather than preference.

The switch sits beside the language switch, in both places the language switch
appears, and changing it redraws every open screen — the change is entirely in
what is displayed.

---

## 13dd. The calculators, checked against somebody else (1.0.0-rc37)

The calculators had no numerical test. Every other layer of the suite asks
whether the application still WORKS; none asked whether it is CORRECT. A
disclaimer does not cover a formula nobody has checked, and the aluminium
acetate calculator tells a person how much of a chemical to weigh out.

The module's own comment had said so since it was written: *„the stoichiometry
below is stated openly so it can be checked rather than trusted. Verify against
a known-good source before relying on it."* That verification is this section.

### Two kinds of check, and the second is the point

**Against first principles.** Every molar mass in the substance pack is
recomputed here from IUPAC atomic weights, with each formula's composition
written out by hand — a parser for „KAl(SO₄)₂·12H₂O" would be a second thing to
get wrong. All twelve agree to within 0.05%.

**Against published recipes**, which is the check that cannot be passed by being
consistently wrong. Three independent sources each give an alum quantity AND a
sodium acetate quantity. Ours must reproduce the second from the first.

| source | given | we compute | |
|---|---|---|---|
| Earth Guild | 120 g alum → 100 g sodium acetate | 103.3 g | **3.3% off** |
| Maiwa / naturaldyes.ca | 150 g alum → 150 g sodium acetate | 129.1 g | 16% excess |
| Maiwa, vinegar route | 20 g alum → 10 g soda ash, 200 ml vinegar | 6.7 g, 152 ml | 49% / 32% excess |

The Earth Guild figure is the striking one: 103.3 against 100, from a recipe
written by somebody who has never seen this code.

**Two things the comparison established that were not known before.**

First, the published recipes only agree with the stoichiometry when their sodium
acetate is read as the **trihydrate**. Read as anhydrous, Earth Guild's 100 g
would be a 60% excess. Neither recipe says which — and this application makes
hydration a field, which is exactly the difference between a recipe and a
calculation.

Second, published recipes run 16–49% ABOVE the stoichiometric floor, deliberately,
to drive the reaction to completion. What the calculator returns is the minimum.
That is the honest number to compute and it is not the number to weigh out, and
the tolerances in the guard are one-sided to say so.

### And that the chemistry behaves as chemistry

- Aluminium sulfate carries two aluminium atoms per formula unit, so half the
  moles are needed. Getting `alPerUnit` backwards would double every dose and
  the number would still look plausible.
- The acetate requirement does not change with the aluminium source: it follows
  the aluminium, not its salt.
- Sodium acetate needs no acid step; soda ash does. The role, not the material
  (§5.1).
- Trihydrate against anhydrous comes out as the ratio of their molar masses —
  the „hydration alone can double it" claim, checked rather than asserted.
- Reverse mode round-trips: 60 g of alum in the cupboard, back to 60 g.

Every one was watched failing. Breaking the 3:1 acetate ratio fails against all
three published recipes at once, which is what having three of them is for.

## 13de. A recipe that is not measured against cloth (1.0.0-rc38)

The owner asked whether anything about Pigments was unfinished, and said she
still saw a weight-of-cloth calculation on a pigment recipe. She was right, and
§13ca said otherwise.

### A section that reported the work done, about the wrong screen

`SHOWS` — the table saying which fields each kind of recipe has — was applied to
the EDIT FORM and to nothing else. The WORK VIEW, which is the screen a recipe
is opened on to be followed at the bench, went on asking „for how many grams of
cloth?" and „which fibre?" of a watercolour recipe.

Guard 24i drew the form and only the form, so it reported the half it covered
and said nothing about the other. That is worse than no guard at all: it
produced a section in this specification saying the work was finished.

### A third way to scale, which the data already used

`seed/recipes.json` carried `scaleBy: "raw"` on the watercolour recipe. The code
knew `weight` and `volume` and nothing else, so `raw` was silently treated as
weight-of-cloth — the dropdown did not offer it, the work view did not read it,
and the scaling engine did not implement it.

Three questions now, because there are three kinds of answer:

| | asks for |
|---|---|
| `weight` | cloth, and the fibre it is made of |
| `volume` | a standing bath, in litres |
| `raw` | how much raw material is in front of you — gum arabic, or pigment |

A recipe of type `pigment` or `paste` falls to `raw` whatever its `scaleBy`
says, because a substance recipe never means cloth.

**`ratio_to_dyestuff` had nowhere to look.** It resolved against a cloth weight
and a `dyestuff` ingredient, and a watercolour has neither — its roles are
`pigment` and `binder`. „One to one with the pigment" is the whole of the
recipe, and it showed nothing. On a raw-scaled recipe the thing everything is
measured against IS the raw amount.

**And the unit was forced to grams.** A basis computed against cloth yields
grams, always, so the default was written that way. A basis computed against raw
material is a plain multiplication and keeps the ingredient's own unit —
otherwise 15 ml of glycerine becomes 15 g, which is a 26% error on a liquid.

### Three roles a binder needs

`solvent`, `humectant`, `preservative`. They could all have gone under
`assistant`, and then four things doing four different jobs would read as one
thing: the water dissolves, the glycerine keeps the cake from drying hard, the
honey wakes it under a wet brush, and the clove oil is the only one actually
preserving anything. Approved by the owner before they were added, because the
vocabulary describes what the studio does.

`drop` joins the units for the same reason. Clove oil is counted in drops and
always has been; writing it as 0.25 ml would claim a precision nobody has.

### A recipe may rest on more than one source

The watercolour binder cites Joanne Green's book AND the studio's own practice,
and they are not the same claim: the book supplies the figures and the practice
confirms they work. `sourceCode` accepts a list.

**This is the trap it opened, and it is the fault §13ct exists to prevent
returning by the back door.** `refs.js` compared `sourceCode === code`, which
matches nothing against a list — so a source cited only by a two-source record
would have read as uncited and been freely deletable. Both the reference check
and the dangling-reference check read the list now.

`crafty-place-practice` is registered as a source of kind `person`, and its note
says what distinguishes it from the published guide: the guide is written, this
is done.

**Attribution on a recipe was stored and never shown.** Every seeded recipe
carried `sourceCode` and no screen displayed it. For a library meant to be given
away that is not a display gap; it is the condition of shipping (§13at) going
unmet on a screen. The read view shows it now, one code or several.

### Found on the way and not fixed

`pigment-lake-master` states its quantities in prose — „10 г стипца" inside an
ingredient's note — rather than in the quantity field. So the calculator shows
nothing for it, correctly, because nothing was entered. That is data rather than
code and it belongs to the owner.

## 13df. The reference, rebuilt around the question (1.0.0-rc39)

Reworked from a v0 prototype used as a reference for arrangement, not copied.
The search model, the ranking and every search semantic are unchanged: nothing
below adds a filter, a field or a way of matching.

### Colour families are a shortcut to a hex

The model holds one `colourHex` and `rankByColour` orders records by distance
from it. A family chip sets that same hex to a representative nuance, so
pressing „Розово" is exactly pressing pink in the picker with the picker's
difficulty removed. Nothing about the ranking changes.

The nine hexes sit where a dyer means the word, not at the centre of the sRGB
region: yellow from a dye pot is nearer to ochre than to a screen's pure yellow,
and ranking against the pure one would put every real result at a distance.

**„+ Точен нюанс" is an action, not a tenth family**, so it carries no swatch of
its own — a coloured square beside it would read as one more colour to choose
from. The picker is still there for when the answer IS a nuance: a thread to
match, a swatch on the bench.

**No „any colour" chip.** Nothing chosen already means nothing asked, and a chip
whose job is to be pressed by default teaches people to press things that change
nothing. What is needed after a choice is a way out, and there are two: the
clear button, and pressing the chosen chip again.

### A panel that starts with an answer

Results on the left, the chosen one on the right, one column below 820px. The
FIRST result is shown rather than the panel waiting to be clicked — a panel that
starts empty asks to be clicked before it says anything, and the first result is
the one the ranking already put first. A new question resets the selection: a
panel still showing the answer to a question nobody is asking is worse than an
empty one.

Twelve results, which is what `rankByColour` already returns. The prototype
shows five because it is a mock.

**„Влияния" is not on the panel.** `influences` is declared on all 163 records
and populated on none (decision 12). A section standing empty on every record
reads as a screen that is broken rather than as a field nobody has filled.
Absent until there is something to put in it. Settled with the owner.

### Nobody has measured this

Sixty-one of the 163 records carry no `swatchHex`: their source described the
colour in words and gave no figure, and inventing one would be the application
manufacturing a measurement (§13ax).

Every one of them drew `#8C7B6B` — a default brown, on six code paths — which
looks exactly like a colour somebody measured. **An outlined empty square
instead.** „Nobody has measured this" is a state the screen can show, and
showing it is the difference between a reference and a decoration.

Three places the same fault was hiding:

- **A new record started at that brown.** Every record ever created carried a
  figure nobody chose. It starts empty now.
- **The edit form showed the brown in the picker**, and saving without touching
  it stamped it on as a measurement. A colour input cannot hold nothing, so the
  form carries a „no measured colour" checkbox, which is what that state looks
  like in a form. The checkbox wins over the picker.
- **Both pickers opened on that brown**, which leans on a colour judgement
  before one has been made (§13n). They open neutral.

**A record with no measured colour cannot appear in a colour search at all** —
`rankByColour` cannot order a colour that is not there. That is correct and it
is worth knowing: the colour question reaches 102 records, and the other 61 are
found by their conditions. Found while writing the guard below, which is the
only reason it is written down.

### The guard, and why its first two versions proved nothing

`#/reference` carries no query — the question lives in the module, not in the
address — so the screen layer only ever draws the search with nothing asked and
has never seen a result. Guard 24j drives the module directly.

**Version one broke the swatch helper deliberately and passed.** The record it
was watching had no colour, so it was not in the colour results at all: the
guard was inspecting a screen the fault could not appear on. The same shape as
the harness that measured the dashboard under the name of Sources.

**Version two cleared the tab and not the question**, so the screen stayed on
the colour path and the record was still not on it. `reset()` puts the tab back
and leaves the query alone.

**Version three matched the raw HTML for the old brown** and caught the colour
picker's starting value, which is a legitimate thing for a picker to hold. It
inspects elements now.

Three ways for a guard to look like it is working. The fourth version is asked
in four directions and fails in all four.

### Not changed

The ranking, `compare()`, the exact/open/near distinction (§13ck), the record
list, the read view, the form's fields. Typography, spacing, the sidebar and the
CSS system are the existing ones; nothing from v0 or shadcn came across.

A heading in the new panel set its own font size and the static guard caught it
on the first run. It reuses `.headlinebody h2` — the record title in the panel
is the same thing as the record title on the read view, and a second size would
be a second answer to a settled question, which is how a scale stops being one.

## 13dg. What moves the result, and who says so (1.0.0-rc40)

Three rounds of the data workbook came back with two kinds of thing the model
could not hold, and both were HELD at import rather than dropped: an explanation
of what changes a result, and a second source for a record that already had one.
Thirty-nine texts, every one with a citation. They are in now.

This is not new research. Every sentence below was written by the owner into a
workbook; the only judgement added here is which FACTOR each is about, and that
was made by reading the sentence, thirty-nine times.

### A record may rest on more than one source

`learnedFrom` held one value and a combination accumulates claims from different
places: the guide taught the COLOUR, the paper taught which fibre and mordant it
was got on. Those are not the same claim and one is not a correction of the
other.

```js
sourceCodes: ['crafty-place-guide', 'ellis-natural-dye']
```

**`learnedFrom` is unchanged**, on every record, and still read. Rewriting 163
records to tidy a new field would be a migration performed for the field's
benefit. Records that carry only the old value go on working: the audit checks
that none was left citing nothing.

**105 records held prose where the register holds a code.** „Ръководство
НАТУРАЛНИ БАГРИЛА, Crafty Place" appeared on 102 of them and `crafty-place-guide`
has been in the register throughout. Left as prose, `sourceCodes` would be a list
of sentences resolving to nothing, and the integrity guard would be checking
punctuation. The prose is mapped to its code in `sourceCodes` and left alone in
`learnedFrom`.

### Influences, with a closed list of factors

```js
influences: [{ factor, text: { bg, en }, sourceCode }]
```

The field has been declared on every record since the model was written and
populated on none of them (decision 12). Six factors, and the list is closed:

| factor | records |
|---|---|
| the mordant | 16 |
| the fibre | 10 |
| the medium | 5 |
| the species | 3 |
| dose and time | 2 |
| preparation | 1 |

A free-text factor would be a second `notes` field wearing a label, and `notes`
is the field this material was kept out of because it was already occupied by
two different kinds of thing.

**An influence cites its own source.** The paper that says what moves a result
is not always the one that gave the colour, and `refs.js` counts it — otherwise
the one record citing Catharine Ellis would have read as citing nobody and been
freely deletable, which is §13ct's fault arriving for the third time by a new
door.

### The eucalyptus case

Set by the owner as the test of whether the collected knowledge survived, and
asserted by name in the audit:

- unmordanted, protein fibre
- the species is what decides — *E. cinerea* towards red-orange, *E. globulus*
  browner
- Catharine Ellis cited as the evidence
- and the original colour source **kept**, not replaced

Each of the four fails on its own if broken.

### On the screen

The detail panel draws „Какво влияе на резултата" — factor, sentence, source —
and a sources line whose names resolve through the register and link out where
the register holds a URL. A name on the screen is a record somebody can open.

### The guards

Six integrity checks in `audit-library.mjs`: every combination names a plant
that exists and a part that plant has; every source code cited by a record or by
an influence resolves; every factor is in the closed list and no influence is
empty; the eucalyptus case in four parts; and no record left citing nothing. All
six seen failing.

And one in `deep-check`, which draws the panel and reads it. It needed
`selectForTest` on the module: which record the panel shows is module state
rather than an address, so a guard wanting a PARTICULAR record could otherwise
only get there by clicking whichever row a question happened to rank first —
which is testing the ranking by accident.

### Found while writing that guard

**The detail panel only exists on the colour path.** A question asked by
conditions alone produces cards, not rows, and no panel. So a record with no
measured colour — which cannot be ranked by colour at all (§13df) — can never
have its influences read in the panel. It has them; there is no way to see them.

Closed at 1.0.0-rc43 (§13dj): both questions draw the same rows with the same
panel. Recorded here rather than left to be rediscovered, which is why it was
closed three releases later instead of found again by somebody on a screen.

## 13dh. What the plant screen was losing (1.0.0-rc41)

The owner said the plant page held less than it should, having compared it
against a prototype. She was right, and the cause was not the one either of us
expected: the fields were all rendering. What the screen was dropping was
COMBINATION knowledge, and it was dropping it in three ways.

### Four probes that lied before one told the truth

Worth recording, because the same mistake was made four times in one sitting and
each time it looked like a finding.

1. A probe searched the rendered text for „адективно" and reported `dyeClass`
   missing. It was on the screen.
2. The next probe printed the markup and found `shape_printer`, `tree`, `dye`
   where labels should be — apparently a rendering fault. It was the probe:
   `label()` reads the vocabulary from the DATABASE, which `app.js` seeds at
   boot and the probe never did, so every label fell back to its code.
3. The third searched for „Пералноустойчивост". The screen says „Устойчивост при
   пране". Reported missing; present.
4. The fourth searched for „Източник" in the text. The provenance block had no
   heading, so the words were there and the label was not.

**A check that invents the string it looks for measures the author's memory.**
Guard 24k reads every label from `i18n` by key. It cannot be wrong about a word
without being wrong about the screen.

### A combination with no measured colour was not on the page at all

`plantColourSources` required a hex. Sixty-one records have none — their sources
describe the colour in words and give no figure (§13ax) — and every one of them
was silently absent from the plant it belongs to.

| plant | combinations | on the screen before |
|---|---|---|
| Дъб | 5 | 2 |
| Евкалипт | 3 | 2 |
| Роза | 4 | 2 |
| Багрилна лайка | 3 | **0** |

The colour NAME is the knowledge — „ярко до слънчево жълто" is what somebody
wants to read. The swatch is what is missing, not the answer. They draw now,
with the outlined empty square §13df introduced, and every one is on the screen.

This is the same fault as the default brown, in the other direction: the
Reference invented a colour it did not have, and Plants dropped the record for
not having one. Both came from treating the swatch as the record.

A plant's OWN swatch still requires a hex: `p.colours` is a list of measured
colours, and an entry there with none is an empty row rather than a record
described in prose.

### The explanations were on the wrong screen

The 37 texts imported at rc40 live on combination records and were reaching the
Reference panel only. A plant's combinations are its answers, so they belong on
its page too — read from the canonical record at render, never copied into the
plant seed, which is what stops the two screens disagreeing.

Grouped by FACTOR across the whole plant rather than repeated per record: „the
mordant", said by three of oak's combinations, is one thing being explained
about oak, and three identical headings would read as three findings.

### Provenance

The plant page showed the sections that name a source and not the register codes
its combinations cite — so the Reference credited Catharine Ellis for eucalyptus
and the eucalyptus page did not. Both now, resolved through the register and
linked where the register holds a URL, under a heading: an unlabelled row of
names at the foot of a page reads as a footer rather than as provenance, and
provenance is the condition of giving the library away (§13at).

### One layout, three densities

Guard 24k draws oak (a full profile, 5 combinations), eucalyptus (middling, and
the eco print case) and rose (short) and compares each against its record. The
colour cards are a `minmax(240px, 1fr)` grid, so 2, 4 and 8 results all fill the
row rather than a fixed count breaking at one of them. The swatch is 64px on
this screen against 52 in a search result: here the colour IS the answer, where
in a result the words are what is being scanned.

### The guard needed a guard's discipline of its own

24k passed alone and failed beside its neighbour. `reset()` on the Reference
module puts the tab back and leaves the QUERY alone, so guard 24j was inheriting
whatever state the guard before it had left — and which of them was at fault
depended on the order they had been written in. 24j clears the query itself now.

A guard that depends on the one before it is testing the order they were written
in.

## 13di. A square with no colour in it (1.0.0-rc42)

Two faults the owner saw on a real screen, and both were introduced by the
release before them.

### The mark that says „nobody measured this" has never once been visible

`.unmeasured` — the dashed outline introduced in §13df — sits at line 475 of the
stylesheet. `.refswatch` sits at 1162 and sets `border:1px solid`. The later
rule simply won.

So for two releases the rule was in the file, described in the specification,
asserted by a guard that read the class name, and **absent from every screen**.
What appeared instead was a plain empty box, which reads as a picture that
failed to load.

It is written after the rules it has to beat now, and it names every place a
swatch is drawn — `.thumb` in the records table was missed by a rule written for
`.refswatch`, which is how a mark meant to be unmissable was absent from a whole
screen while looking present in the CSS. A faint diagonal was added: an outline
alone still reads as an empty container, and a line through it reads as
deliberate.

**No layer could see this.** A class-name check passes on a class name. Only a
real browser resolves a cascade, so the assertion is in `screen-check`, which
compares the computed border and background of every `.unmeasured` element
against the ones beside it. It found 61 on a screen this release had not thought
to look at.

### The list drew fifty colourless squares

§13dh let records with no measured colour reach the plant screen, which was
right. The LIST writes `background:${hex}` with no test, and `hex` is now an
empty string for sixty-one of them — `background:` followed by nothing.

A row of swatches in a list is a glance at what a plant gives. An unmeasured
record contributes its name to the tooltip and no square at all: an empty box in
a row of colours is noise, where on the detail screen — one card, one answer —
the absence is the answer and is worth drawing.

Guard 24k drew the detail view and not the list, and passed against a
deliberately broken list. It draws both now. **A screen that is not drawn is a
screen that is not checked**, which is §13df's own lesson arriving in the module
that had just been given it.

### Prose has a measure, and the measure was a number

`--measure: 672px` did two wrong things at once: on a narrow column it could
overflow, and on a wide one it left four hundred empty pixels beside a strip of
text.

```css
--measure: min(100%, 74ch);
```

`ch` tracks the typeface and the size, so the measure is stated as what it
actually is — about seventy-four characters — and `min()` lets it give way when
there is less room than that.

**The ceiling stays, because the ceiling is the point.** Text is not more
readable for being wider: at 1080px and 14.5px a line runs to about 130
characters and the eye loses the return sweep. „Use the available width" cannot
mean „set body text in 130-character lines".

The way a wide screen is used for prose is a second column of SECTIONS, not a
longer line. Above 1100px the narrative sub-blocks — „Багрилни качества",
„Багрилна съставка", „Как се държи" — flow into two columns, each still at its
own measure. Sections, never paragraphs: splitting one passage into columns
makes it read bottom-left to top-right, which is a newspaper trick and wrong for
something consulted rather than read through.

## 13dj. One answer, however the question was asked (1.0.0-rc43)

The Reference had two presentations and which one you got depended on which
field you had filled in.

**A colour question** drew rows with a detail panel beside them. **A conditions
question** drew a gallery of cards with nothing beside them at all.

So a record with no measured colour — which cannot be ranked by colour, because
there is no colour to rank (§13df) — carried influences and sources that could
be read on no screen. Sixty-one records, every eco print one among them, and the
knowledge imported at rc40 was reachable for some of them and not others
depending on a field they did not have. Recorded as a finding at rc40; closed
here.

### One row builder, one panel

```
swatch · colour name and where it came from · conditions · badge and confidence
```

Four columns instead of six. „Difference" and „source" had columns of their own;
the difference is a secondary thing — it qualifies the answer rather than being
it — and belongs as a badge at the end, and the source belongs under the colour
it produced.

**The badge changes with the question, because the question changes what „how
close is this" means.** By colour it is the difference in nuance; by conditions
it is whether the record matched exactly, kept the plant, or kept the
conditions. Nothing else about the row changes.

**Exact and near stay apart.** That distinction is the whole of §13ck and a
badge cannot carry it — a record that says something else and a record that says
nothing are not degrees of the same thing. They are two tables under two
headings, with one panel beside the first.

`resultCard` is kept: the records tab is a browse rather than an answer, and a
browse reads better as cards.

### Four widths, and the third one found something

The screen layer checked a phone and a 1280px desk. The owner asked for four,
and a tablet at 834px failed immediately on eight views.

The sidebar disappears at ≤820px. `.panel.flush{overflow-x:auto}` also ended at
≤820px. So just above the breakpoint the sidebar was present, taking its width,
and a wide table had no way out — it simply ran past the edge, and the content
was clipped rather than scrollable.

Neither of the two widths being tested could ever show it: below the breakpoint
the table scrolls, above it there is room. **The fault lived exactly in the gap
between the two things being measured.**

The rule applies at every width now. A table that fits does not scroll, so it
costs nothing where it is not needed, and there is no breakpoint left to be on
the wrong side of.

`screen-check` runs phone (390), tablet (834), desk (1280) and wide (1680). The
tablet is where a two-column split has to give way and the wide is where prose
stops being a strip — neither of which the two original widths could show, and
both of which had changed the release before.

## 13dk. A square that argued with the words beside it (1.0.0-rc44)

### The mark was right in one place and wrong in the other

§13df introduced an outlined square for a record whose colour was never
measured, and §13di made it visible. On the plant screen the owner saw it beside
„ярко до слънчево жълто" and said what should have been obvious: **the colour is
not missing.** It is right there, in words.

The reasoning had been that an absence should be shown rather than hidden. That
is true where a swatch is EXPECTED and cannot be supplied — a row in the
Reference table, where every other cell holds a colour and this one has none, so
the reader needs to know the cell is not broken.

On a card it is the opposite. The card's job is to say what the plant gives, the
words say it, and an empty crossed box beside them reads as a hole where the
answer should be. It argues with its own caption.

So: no box. The words take the width the swatch would have had. The mark stays
in the table, where the column makes the promise.

Three places, three right answers, and they are not the same answer:

| where | a record with no measured colour |
|---|---|
| the plants LIST | no square at all — a row of swatches is a glance, and a gap in it is noise |
| the Reference TABLE | the outlined mark — the column promises a colour and must say why there is none |
| a colour CARD | no square — the words are the answer and the box contradicts them |

### The specification strip had come apart

Part-and-condition and its dose were pushed as two separate tiles into an
auto-fitting grid. A plant with three dosings produced „ЧАСТ И СЪСТОЯНИЕ ·
ПРЕПОРЪЧИТЕЛНА ДОЗА" three times across one row — the same two headings
repeating, reading as a table that had lost its structure. Worse, the wrapping
could put a part in one row and its dose in the next.

A part's figures are read together: which part, in what state, how much, how hot
to draw it, how hot to dye, and the ceiling not to cross. That is a
specification line, so it is drawn as one — one row per part and condition.

The figures that belong to the PLANT rather than to a part stay tiles: they are
single values with no row to sit in, and a one-row table of five unrelated
numbers is worse than five tiles.

### The panel names every condition the ranking uses

A record is ordered by seven dimensions. The panel showed three of them, because
`fact()` renders nothing for an empty value — so a record silent about its fibre
simply had no fibre line, and a reader could not tell „cotton" from „nobody
wrote it down". That is the §13ck distinction disappearing on the one screen
built to show it.

`CRITERIA` is exported from `reference.js`; `compare()` builds its criteria from
it and the guard reads it. The two cannot come apart, and every condition is
named even where the record says nothing — as „не е уточнено", which is an
answer.

### Two guards were chasing a class name, again

Both broke on this change and neither had found a fault:

- The elder-temperature guard asked `.usetile, .fact`. The temperatures had
  moved into a specification row. It reported „0 temperature rows", which is
  indistinguishable from the temperatures being gone. **It had already been
  moved once**, from `.fact` to `.usetile`, for the same reason at §13bs.
- The working-figures guard asked whether `.usenow` contained „WOF". The dose
  had left the strip. Also true, also not the question.

Both ask the PAGE now. What is being checked is whether somebody standing over a
pot can read the figures, and that question has nothing to do with which
container they are in. A check written against a container is a check that has
to be rewritten every time the layout improves, and that reports a false failure
each time until somebody does.

## 13dl. An indicative colour, and three releases spent on the wrong question (1.0.0-rc45)

### What went wrong, first

Forty-seven eco print combinations were written at rc35 from a review that
describes colour in words and gives no figure, so they carry no `swatchHex`.
Refusing to invent one was right and stays right.

What followed was not. §13df drew an outlined square for the absence, §13di made
it visible, §13dk removed it from cards — **three releases arranging a hole**,
each one a reasonable answer to „how should an absence be drawn" and none of
them asking the question that mattered: *does this absence have to exist?*

For half of them it does not, and the data said so all along. Тансy's plant
record holds four measured colours with their conditions — „алуминиев мордант"
`#D6B03E`, „с желязо" `#5F6238`. Its combinations describe the same plant under
the same mordants and carried nothing.

The lesson is not about swatches. **When a rendering decision has been revisited
three times, the fault is in the data or the model, not in the rendering.**

### The rule

A combination with no measured colour takes the colour its own plant measured
under the same mordant. Not invention: same plant, same mordant, the owner's own
figure.

It is also not a measurement OF THAT COMBINATION, and that difference is kept in
the DATA rather than in the drawing:

```js
swatchHex:    '#5F6238'
swatchApprox: true
swatchFrom:   'маслинено зелено'
```

The model already had this shape for numbers — `approx` on a temperature,
§13ai, „a number somebody estimated reads as an estimate". A colour is the same
kind of claim and gets the same treatment.

| | |
|---|---|
| measured | 102 |
| **indicative** | **33** — 21 under alum, 12 under iron |
| still nothing | 28 |

**The 28 stay empty.** Their plant never measured that mordant, so there is
nothing to take, and a near-enough colour would be exactly the invention this
refuses. Mostly eco print under iron, where the plant record has no iron colour
of its own.

### On the screen

A soft inset edge: the colour reads at full strength, and the block does not
read as solid fact. The panel says in words where it came from — „цветът идва от
собственото измерване на растението при същия мордант (маслинено зелено)".

The outlined empty square stays for the 28, in the Reference table only, where
the column promises a colour and owes an explanation (§13dk).

### The guard

Three questions, each failing on its own: every borrowed colour is marked as
indicative; every marked one names the measurement it came from; and the plant
it cites still holds that colour. The third matters most — a borrowed hex whose
provenance no longer checks out is worse than none, because it is a figure that
looks sourced.

### What would close it properly

The owner measuring the 61. This is an interim that is honest about being one,
and the field name says so on every record that uses it.

---

## 13dm. Two buttons that arrived elsewhere, one destination with three names, and the module nobody measured (1.0.0-rc46)

Three faults reported in one sitting, and they turned out to be one shape:
**a name or an address written in a second place, where nothing held the two
against each other.**

### The backup button did not go to the backup

The home screen's attention block is the only thing in the application that can
cost work which cannot be got back. It warns that no backup exists, names what
would be lost, and offers „Направи архив".

That button carried `data-go="tools"`. The backup has its own address —
`#/tools/backup`, given to it deliberately at §11 so it can be bookmarked and
linked to, which for a backup is worth more than for anything else here. The
button used the module instead, so pressing it landed on the list of
calculators, with no backup in sight and no explanation.

The button beside it, „Инсталирай пакетите" on a first launch, had the same
form of the fault and a worse target: **there has never been a packs screen in
the calculators at all.** „Провери библиотеката" is a button inside each
reference module (§10). It now goes to Plants, which is the module the branch
is about — it only fires when there are no plants.

Neither is a rendering fault, and neither could be seen by reading the screen:
both buttons draw correctly, sit in the right place, say the right words and
go somewhere real. **A link that arrives at a real wrong screen is invisible to
every check that asks whether the screen is real.**

### One destination, four places, three words

| where | what it said |
|---|---|
| dashboard tile | Инструменти |
| sidebar and the phone sheet | Калкулатори |
| the screen's own title | Инструменти |
| the browser tab | Инструменти |
| the back button inside a calculator | Калкулатори |

Press „Инструменти", arrive at a screen the navigation calls „Калкулатори",
and nothing in the bar carries the word that was pressed. Reported from the
phone as „Инструменти stands there pointing nowhere", which is exactly what it
is to a reader: the destination it names does not exist under that name.

The cause is two keys holding one word. `nav.tools` and `nav.calculators` were
both live, and `t('nav.' + id)` is built at run time, so layer 3b — which reads
literal keys — could not see that two of them meant the same thing.

**One key now: `nav.tools`, which says „Калкулатори".** The sidebar entry has no
`label` of its own, the dashboard tile reads the same key, `tools.title` matches
it, and `nav.calculators` is gone. The module id stays `tools`, because that is
code and not a word anybody reads.

`tools.sub` also promised „справки", which moved into the Library at rc25. A
subtitle listing what a screen holds is a second inventory of that screen, and
this one had been wrong for twenty releases.

The browser tab is now named after the navigation ENTRY rather than the module,
reusing `activeNav()`, so `#/tools/backup` no longer says „Калкулатори" while
showing the backup.

### The module nobody measured

`screen-check.mjs` renders every address at four widths. Its route list is
written by hand, and **nothing had ever compared that list to the application.**

`#/pigments` was not in it. Not disabled, not skipped, not reported — absent.
The pigment batch screen puts a wide column of six stages beside a folding
aside, which is the arrangement most likely to break at 390px, and it had been
drawn at no width at all since it was written, while the suite said „all held"
every release.

This is the fourth way a guard lies, and the worst of the four. A guard aimed
at the wrong screen at least reports something that can be read and doubted
(§13cz). A guard aimed at no screen reports nothing, and the absence looks
exactly like a pass.

**Adding two lines to the list would have fixed the pigments and left the
hole.** `scripts/try-screen-coverage.mjs` asks the general question instead:
which module does nobody measure. It reads the `MODULES` registry in `app.js`
and the route list in `screen-check.mjs` as text, and fails on any module in
neither that list nor a declared `UNMEASURED_MODULES`.

Run before anything was fixed, it named **three**:

- `pigments` — the reported one
- `batch` — a second hole nobody knew about, exempt by accident because it is
  reached from the fabrics list rather than the sidebar. How a screen is
  reached is a fact about the navigation and not a reason its layout is
  unchecked. Now measured.
- `packs` — fourteen lines and unbuilt, out of the 1.0 plan. The only
  exemption, and its reason is written beside it.

It is **static** on purpose: it reads two files and needs no browser and no
shim, so it runs on a laptop with nothing installed — which is precisely when a
new module is written and the sixth layer is being skipped for a missing
Chrome.

It fails in four directions, each seen to fail before it was accepted: no
exemption list declared, a module in neither list, an exemption naming a module
that is also routed (an unpruned excuse is permission), and an exemption naming
something that is no longer a module.

### What this costs, stated

`#/pigments` and `#/batch` have never been rendered at any width. Bringing them
under the sixth layer may turn up geometry faults that have been shipping for
several releases. **That is the guard working, not a regression**, and the
faults were there before the guard could see them.

---

## 13dn. The vocabulary earns its categories, and three lists that had drifted (1.0.0-rc47)

First release of the pigment model agreed in `DOCUMENTATION_DECISIONS_NEEDED.md` item 17.
Declared scope: the vocabulary, the two migrations of seeded records, and the lake recipe's
alum line. It grew by two guards and one check, each dragged in by the scope rather than
chosen beside it, and each is named below with what dragged it.

### The category follows from what a substance does

The first plan was a single new category for „pigment-making materials". It was wrong, and
the owner said why: **the category has to be earned by understanding what the substance is
for.** One category for seven substances groups them by the book they appear in — a bucket
by context, which is exactly what the five existing categories are not.

Applying the rule gives two, not one:

- **`binder`** — gum arabic, gum tragacanth, methylcellulose. One job: hold the grain onto
  the paper.
- **`filler`** — kaolin, and **chalk, which was already in the library** under `auxiliary`.
  So it is six new substances to come, not seven.

Glycerine, honey and clove oil earn nothing new. They neither bind nor fill; they improve
how the paint handles and keeps, which is what neutral soap and Synthrapol are already in
`auxiliary` for.

**Slaked lime moves to `modifier`.** It sat in `auxiliary` and is a strong alkali that raises
pH in an indigo vat and in safflower's alkaline extraction. The rule is retrospective: it
governs the twenty-six substances already seeded as much as the ones arriving.

### Two roles, because two jobs were reading as one

`plasticiser` for glycerine. The comment above the role block already argued that four
different jobs must not read as one thing on screen — and then glycerine and honey were both
given `humectant`, so the working view drew „задържа влага" twice, one line under the other,
for two substances doing two things. The reasoning was right and the data did not follow it.

`carrier` for what a lake precipitates onto. The lake recipe called its alum line `mordant`,
which is true of nothing there: the alum mordants no fibre, the pigment forms on it. Stopka's
carrier is alum and Nabil Ali's is chalk — 6 g of dye to 3 g of chalk, no alum anywhere — so
the role cannot be named after the alum without refusing the second recipe.

### The three lists that had drifted

Everything below is the same fault in three places: **a second copy of a fact, with nothing
holding the two together.** All three were found while trying to deliver the change above,
and all three were static and cheap once asked as a general question.

**1. A pack no screen can update.** A pack reaches an installed copy two ways and only one
is automatic. `loadPack` ADDS an absent record at boot; a CHANGE travels solely through
`diffPack`, which is the „Обнови от библиотеката" button. **Four packs had that button and
three did not** — `recipes`, `sources`, `glossary`.

So the alum-to-carrier correction, the whole point of this release, would have gone out in
the ZIP and reached nobody who already had the application. Visible only on a fresh install.
That is §13cb word for word, with the mechanism built at rc13 and three of the seven packs
left outside it, which nothing noticed because nothing asked.

Recipes gets the button. `sources` and `glossary` are excused **with the reason written**:
both live inside the Library, a reading screen with tabs and no list of records to stand a
button beside, and where that button goes is a layout decision nobody has taken. It is an
excuse, not a verdict — a correction to a source or a glossary term still reaches nobody
today, and that is on the roadmap. `scripts/try-pack-reachability.mjs` holds the excuse
list against PACKS and against the modules.

**2. A manifest that disagrees with its packs.** `seed/manifest.json` restates each pack's
own version, and `ensurePacks` reads **only the manifest** to decide whether to load:

    if (shipped && known && known.seededVersion === shipped.version) skip

A manifest left behind makes an installed copy conclude it already has the new pack and skip
it. Nothing logged, nothing failed, the records never arrive — **a bumped pack that ships to
nobody.** This release bumps three packs by hand, so the guard protects the very change it
travels with. `scripts/try-manifest-agrees.mjs` checks version and packId, in both
directions.

Noted and not enforced: six packs carry semver strings and `sources` carries a bare number.
Harmless, because manifest versions are only ever compared with each other. A guard that
fails on something it was not written to police is a guard that gets switched off.

**3. A coded field nothing read.** A recipe's `roleCode` was checked against the vocabulary
and a substance's own `category` was not. Found by typing a category that exists nowhere
while making the two moves above — **and the suite passed.** Both moves could have shipped a
code nothing could read, and since the Materials screen filters by category, the record
would have vanished from every tab without ever being deleted. Now walked in `deep-check`.

### On the scope growing

Three additions beyond the declared scope, and the test applied to each was whether the
declared change could be delivered without it. The button: no — the correction reaches
nobody. The manifest guard: no — three hand edits in this release, any of which silently
voids it. The category check: no — the two moves are exactly the edit it validates. None of
them is a feature and none was chosen because it was nearby.

### Seen to fail

Every guard here was watched failing before it was accepted, each with its own message:
no exemption list declared · a pack in neither list · an excuse for a pack that is reachable
· an excuse for a pack that does not exist · a button pointing at a pack that is not declared
· a manifest version behind its pack · a manifest entry missing · a manifest entry orphaned ·
a wrong packId · an invented substance category · an invented ingredient role.

---

## 13do. How much plant for how much carrier, and a comment in the wrong basis (1.0.0-rc48)

Second release of the pigment model (item 17). Declared scope: the basis, its arithmetic,
its guards, and Stopka's figures turned from prose into data.

### The numbers were not forgotten

All three pigment recipes shipped with `quantity: null` on every ingredient, and their
working view was a column of dashes. The reading „somebody entered these records and did not
finish" is wrong. **There was no basis that could hold the figures.**

The five bases are per cent of cloth, per cent of bath, grams per litre, ratio to the
dyestuff, and absolute. A lake pigment is measured against none of them. It is measured
against the thing it precipitates ONTO, and Stopka's table gives that as a percentage —
madder root at 500% of the weight of the alum.

So the figures stayed in the note as prose, where they were correct and could not be
computed. This is the third time in this project that an absence has turned out to be a
missing field rather than an unfinished record, and it is the same lesson as §13dl: when a
gap has been arranged three times, ask whether the gap has to exist.

### Named after the carrier, not after the alum

`percent_of_carrier`, „% от носителя". Nabil Ali's second madder recipe precipitates onto
**chalk** — 6 g of dye to 3 g of chalk, with no alum anywhere. A basis called „per cent of
the alum" would have been true of Stopka's recipe by accident, refused Ali's, and invited a
second field measuring the same thing — the two-mechanisms fault this project has removed
before.

The `carrier` role added at rc47 exists for this: the basis has to point at a line.

### Refusal, not a plausible number

`convert` returns nothing in three shapes, and none of them is a fallback:

- no carrier line in the recipe — nothing to be a per cent OF;
- a carrier that is itself a per cent of the carrier — a circle, refused rather than followed
  one step and rounded off;
- a carrier with no amount — nothing, not a confident zero.

A figure invented here is a figure somebody weighs out. `deep-check` refuses the first two
outright so such a recipe cannot reach a screen at all, and `try-calculators.mjs` asserts all
three at the arithmetic.

### One plant, and the reason written down

Stopka's note lists three: madder 500%, „жълтениче" 180%, logwood 50%. **Only madder is
entered.**

- **Logwood is not in the library** — `Haematoxylum campechianum` is not among the 57, and
  the owner's instruction is that no new plants are added. `Biancaea sappan` is present and
  is a different species.
- **„Жълтениче" is ambiguous.** The library holds `Reseda luteola` under „Жълта резеда", and
  in Bulgarian „жълтениче" is used both for that and for *Chelidonium majus*, which is not
  in the library. The owner's own reading is that it is more likely the second. A figure
  entered against the wrong plant does not look like a doubt afterwards; it looks like data.

The line therefore has one option — madder root at 500% — and its note says why the others
are absent and what would bring them in. **An empty option list is not the same as a
finished one**, and the record says which it is.

### The comment that was in the wrong basis

`modules/plants.js` carried, beside the plant's own dosing column: *„Stopka gives madder root
500% by decoction and 50% by alkaline extraction."*

That describes 500 as a **dose** — a per cent of the cloth, which is what every figure in
that column is. It is not. The source register records what the table actually is: plant
material as a per cent of the weight of the alum, for making a lake, with no cloth anywhere
in it. Beside 50–100% dried madder, behind the same „%", it would have been read as ten times
the dose.

**The data was never wrong** — 500 never reached a plant record. The comment was, and a
comment is followed. Two statements about one table existed in the repository, in different
bases, and the register was right.

### Still open, and deliberately not touched

The lake recipe remains `scaleBy: 'raw'`, so the working view still offers a „Количество
суровина" field. Every line is now computed without it: the carrier and the alkali are
absolute and the plant is a per cent of the carrier. The field does nothing.

That is the fourth scale mode's business (rc49) and expanding into it here was refused.

---

## 13dp. A guard that could not tell the two models apart (1.0.0-rc49)

Third release of the pigment model (item 17). Declared scope: the fourth scale mode.
**The fourth scale mode is not in it**, and the reason is the first section below.

### The mode has no recipe that can use it

`scaleBy: 'output'` needs a recipe to declare what it yields. **None of the three declares
one, and no source gives one for the recipes we actually ship.** Stopka's watercolour medium
makes „roughly 20 pans" — but that is 60 g of gum, 140 ml of water, 25 ml of honey, clove
oil and optional ox gall, and ours is the owner's: 42 g of gum, 240 ml of water, 15 ml of
glycerine, 15 ml of honey, five drops of clove oil. Two recipes differing by two substances.
Stopka's yield is not ours.

A yield could have been arrived at by adding the volumes up. Volumes are not additive when a
gum dissolves, and the figure would have been an invention wearing a data field.

So the mode waits on one line of a workbook, and building it now would have shipped a
mechanism with no user — a thing that cannot be watched working on real data.

### What was actually wrong, and it needed no new number

The binder's gum line was `absolute: 42` while the water, glycerine and honey were ratios
against the raw amount, and the raw amount IS the gum. Enter 84 and the water and glycerine
doubled while the gum still said 42. One line did not move with the recipe it belonged to.

The gum line is now `ratio_to_dyestuff: 1` against the raw amount, so the whole recipe scales
together. This is the owner's own sentence about this recipe, in the model: *you decide how
much binder to make, and how much gum you need follows from it.*

The clove oil stays absolute and is asserted to stay absolute. Five drops preserve a jar of
this, not a proportion of it, and a change that swept every line onto a ratio would have
looked right and been wrong there.

The watercolour recipe's own note already said „1:1 to the pigment" and both its lines
carried `quantity: null`. The figure was in the prose beside the empty field it belonged in.

### The guard that passed under both models

`scripts/try-calculators.mjs` asserted, of the binder:

> the gum itself is absolute and unchanged — 42

It was cited in §17d and in rc46's own notes as evidence that the fixed gum was a decision
taken deliberately rather than an oversight. It was expected to fail here, and it did not.

**At 42 g of raw material both models return 42.** `absolute: 42` returns 42. A ratio of 1
against a raw amount of 42 returns 42. The assertion measured a number that is identical
under the model it was defending and the model that replaced it, so it passed before the
change and after it, unmoved — having verified neither that the gum was absolute nor that it
was unchanged.

This is a **fifth way for a guard to lie**, and it is not any of the four already recorded
(§13cz). It is not aimed at the wrong screen, it does not invent the string it looks for, it
does not ask for a class name, and it inherits nothing from a neighbour. It is aimed at the
right value, reads it correctly, and reports truthfully — at the single point where the two
possibilities agree. **A guard that cannot distinguish the model it asserts from its
opposite is not testing the thing it names**, however precisely it is worded and however
green it stays.

The general form: an assertion made at one sample of a function that differs elsewhere. The
defence is to assert at a point where the models must disagree — here, at any amount other
than the one the recipe is written for. Rewritten to check that twice the gum is twice the
gum, twice the water, twice the glycerine, and still five drops of clove oil. Watched failing
by putting the line back to `absolute: 42`: 42 against 84, which is what should have been
visible all along.

### Deliberate emptiness, said in words

The pastel recipe's filler and binder keep `quantity: null`, and their notes now say so
outright: the filler proportion is the choice that makes a pastel soft or hard and is made at
the slab, and the binder goes in drop by drop until the mix is claylike. **Empty here means
„decided at the slab", not „not yet entered."**

Nothing counts empty quantities as outstanding work, so no total goes wrong today. The note
is for the reader, who otherwise meets a blank and supplies the wrong reason for it — the
same lesson as the 54 eco print records that name no fibre (§13db).

---

## 13dq. Two recipes that differ in kind, and a field that could hold one end (1.0.0-rc50)

Fourth release of the pigment model (item 17). The owner supplied two full recipes from her
own shelf — Natalie Stopka's madder root fermentation extraction and Joanne Green's madder
root (red) — with every figure on the page.

### They are two recipes, not a master and a departure

The decision at rc46 was one master lake recipe, departed from in the batch. These two are
not that.

**Stopka** ferments the root for one to two weeks with sauerkraut juice, discards the
fermentation liquid, then extracts hot at 66–76 °C and precipitates with 10 g of alum and a
soda ash solution, metering pH to 7 with leeway of 6 to 8.

**Green** has no fermentation at all: hot extraction at 50–80 °C for at least three hours,
filtering, then 10 ml of dissolved alum and 5 ml of dissolved chalk per jar.

They differ **in kind, not in degree** — one has a two-week biological stage and one does
not; one precipitates with a strong alkali and one with a mild one. A departure recorded on
a batch cannot carry that. Both ship as recipes of their own, cited, beside the master, which
stays what it is: a skeleton rather than a process.

The owner's own practice — Green's route with a 24-hour presoak — is not a third recipe. It
is a batch of Green's with one departure, which is precisely the case rc51 is for.

**And a confirmation that rc47 was right to separate them.** Chalk is the CARRIER in Green's
recipe and a mild alkali in the same breath; alum is the carrier in Stopka's and chalk does
not appear. One substance, different roles in different recipes. The category says what a
substance is; the role says what it does here. Had those been one field, this would have
snagged on the first real pair.

### A temperature is a range

`tempC` held one number. Both sources give two, and for madder the CEILING is the half that
matters: above it the red goes brown, which is why Green's instruction is a band and why the
library already carries `softMaxTempC` of 82 on madder root.

Three things had been true at once and none of them noticed the fourth:

- the plant record has carried `tempDyeC.min` and `.max` all along;
- `tempSpan(min, max)` was written in `units.js` for that range and **was never called from
  the recipes module**;
- pre-filling a recipe from a plant part took `.min` and dropped the ceiling — three lines
  below a comment arguing that a single number hands the elder fruit the elder leaf's boil.

So the recipe was flat in the middle of a model that knew better, and the display had the
tool to draw both ends already.

`tempMinC` and `tempMaxC`, drawn through the existing `tempSpan` in the three places that
each carried their own copy of `r.tempC != null ? ... : ''`.

**`tempC` is not removed.** The same reasoning as `stateEvents` at §13bd: a migration adds,
the application reads and writes only the new pair, and the old field remains the way back
if the mapping proves wrong. It comes out in a later version on purpose rather than by drift.

### The migration, and what it refuses to do

A single figure is not wrong, it is a range whose ends agree, so 70 becomes 70 to 70 and
`tempSpan` renders it „70 °C" exactly as before.

What it does **not** do matters more, and each is asserted:

- a recipe with no temperature is given none. No ceiling is invented for a recipe that never
  had one;
- a range already entered by hand is left alone, so a band the owner widened is not narrowed
  back to a legacy single figure;
- „never above 80" — a ceiling with no floor — keeps its ceiling and gains no invented floor;
- `updatedAt` does not move. Reshaping a field is not the owner touching a record (§13cv),
  and stamping it would carry a recipe untouched since spring to the top of every list
  ordered by recency.

Watched failing four ways before being accepted: a version that invents 20–100 for a recipe
with no temperature, one that overwrites a hand-entered range, one that overwrites a
hand-entered ceiling, and one that uses `put` instead of `putMigration` and restamps the
record. Four breaks, four distinct messages.

### What the recipes now say that they could not before

Green's line „maintain 50–80 °C" is in the field rather than in the prose. Stopka's pH target
of 7 is in `phTarget`. Her digestion of 30 to 60 minutes is in `heldMinutes`. The 2.4 litres
of „tea", the 720–840 ml a jar, the two grades of filter and the amber supernatant are in the
steps, because they are instructions and not quantities.

One thing is deliberately left as a question rather than answered: **which of chalk and soda
ash gives the better result.** The owner has used both and does not remember which she
preferred, and they behave differently. That is not a fact about a recipe. It is what a batch
is for, and it is the clearest argument yet for rc51.

---

## 13dr. What actually went in, and what it departed from (1.0.0-rc51)

> **Superseded in part at rc105 by §13fg.** A pigment batch no longer displays departures or
> strikes a line out. The lines, `was`, and `departureOf` remain — the paste print reads them.

Fifth release of the pigment model (item 17). A batch holds the lines that were really used,
may hold lines the recipe never had, and remembers which of them departed.

### The gap this closes

The batch named a recipe in a dropdown and showed none of its amounts. Standing over the
pot, the screen told you *which* recipe and not *how much of anything*; the figures were on
another screen. §17e recorded this and rc51 is where it is paid.

The second half matters more. The owner's own open question about her madder — whether chalk
or soda ash served her better, having used both and not remembered which — is a **departure
she made and had nowhere to write down.** A recipe cannot answer it. Only a record of what
was actually put in can.

### Amounts, not a reference

The lines resolve when they are taken: 50 g of root against 10 g of carrier, computed once
and stored. Not a pointer to the recipe's percentage.

Because 50 g is what went in the pot. If the recipe's figure is revised next year, last
summer's batch must still say 50 g — a batch that recomputes itself is a batch that changes
its own history.

### `was` freezes what the recipe said on the day

Every taken line carries what the recipe stated at the moment of taking, and the departure is
measured against **that**, never against the recipe as it stands now.

Written the other way, a pack update would silently rewrite what a batch departed from: a
faithful batch would become a departure, or a real departure would vanish, without anybody
touching the batch. This is the same fault family caught in five consecutive releases — a
second copy of a fact with nothing holding the two together — and here the copy is
deliberate, frozen, and the freezing is the point.

The recipe's NAME is copied into `linesFrom` for the same reason: the departure must stay
readable if the recipe is later renamed or withdrawn.

### Four departures, and one of them is not a deletion

`added` · `changed` · `swapped` · `removed`, computed and never stored (§13.6) — storing a
comparison the data already answers gives two things that disagree the first time an amount
is edited.

**A line taken from the recipe and left out is STRUCK, not deleted.** „I did not put the soda
in" is knowledge, and deleting the row makes it indistinguishable from never having followed
a recipe at all. A line the owner added herself has no such history, so hers is simply
removed — there is nothing for it to be a departure from.

### Taking happens once

The button is not drawn once lines exist, and the handler asks the same question again rather
than trusting that it was not drawn. Both call one exported `canTakeLines`, because a
condition written twice is how a control that looks disabled turns out to be clickable.

One click must not be able to replace an evening's entries.

### The migration reconstructs nothing

An existing batch gets an **empty** list and no `linesFrom`.

Filling the rows in from the recipe it names would have been easy — read `viaId`, scale it,
write the lines. It would also have been an invention with a data field around it. **The
whole reason the list exists is that what was done differs from the recipe**, so a
reconstructed row claims she followed it exactly, which is the one thing the record cannot
know. A batch made last summer has no lines because there was nowhere to write them, not
because nothing went into the pot, and the panel's wording carries that: it invites the lines
to be taken rather than reporting that there are none.

### A guard that asks the module rather than the source

`scripts/try-pigment-lines.mjs` imports `departureOf` and `canTakeLines` instead of restating
them. A restated copy passes while the screen does something else, and a source-text search
for the rule is the guard that invents the string it looks for (§13cz). Both were watched
failing by breaking the rule in place.

One of those breaks did not produce a readable failure: with the „no history" test removed,
`departureOf` read an amount off nothing and **threw**, stopping the suite with a stack trace
instead of a sentence. Exit 1 either way, but a guard that crashes reports that something is
wrong without reporting what. The order of the checks was changed so the function answers
rather than trips, and a line with no `was` key at all — a record written before the field
existed — is now asserted to answer „added".

### What is not here

The application does not judge a departure. It does not say more, or less, or unwise. It
shows what the recipe said and what was done; the conclusion is written by the owner. That
was fixed at the outset and holds here.

---

## 13ds. Three colours from one batch (1.0.0-rc52)

> **Superseded in part at rc105 by §13fg.** A swatch is now a colour, a name and a note; `kind`,
> `substrate` and `viaId` are shown read-only on older swatches and no longer asked for.

Sixth and last release of the pigment model agreed in item 17. A batch's colour becomes a
list of swatches, each saying what it is, what it is on, and by which recipe.

### One field held one of three things

A batch carried `swatchHex` and `swatchName`. One colour.

One batch of madder becomes powder, and watercolour made from that powder, and pastel made
from the same powder, and **the three are different colours.** The field could hold one of
them and made the other two things that cannot be said.

Nabil Ali's chart is the shape of the answer: madder appears as three swatches, and safflower
as „potash on cotton" and again as „potash on leather" — two colours from one recipe on two
substrates. A swatch is named by three things at once, not one.

So a swatch carries what it is, what it is on when there is a substrate, and **a recipe of
its own**: the pigment came from this batch's recipe, the watercolour from the watercolour
recipe, the pastel from the pastel one. The batch's own dropdown filters to recipes that
output a pigment (§13by) and the swatch's does not — naming a recipe beside a swatch is not
logging a making, it is saying what the swatch is of.

### The hex is optional, and the absence draws as one

A colour described in words has no hex (§13dl). „Прашно розово — не съм го мерила" is a
**finished** record.

A colour input cannot be empty: it always holds something, and it opens on a grey. So a
„no measured colour" box is read AFTER the picker and clears it, because otherwise a swatch
the owner described in words would be handed whatever grey the control happened to open on —
an invented measurement wearing a data field. The swatch then draws with a dashed outline: an
absence that says it is one.

### The list is closed, and says why

`swatch_kind`: dye · pigment · watercolour · pastel · ink · glaze.

The owner asked for an open list and was right to — people make paints for other purposes
entirely, down to building paint. **The application cannot keep one today.** There is no
screen that writes to the `vocabulary` store, and `backup.js` skips it, so a term added by
any means does not survive a restore — at exactly the moment a person believes they have
everything back. The editor that would open it is ROADMAP B6c, and the reason is written
beside the terms so a later reader does not conclude that a closed list was the design.

### The migration reads the pair honestly

The existing colour becomes one swatch of kind `pigment`, which is the true reading: what a
batch recorded was the colour of the ground pigment, because there was nowhere to record
anything else. **No watercolour row is added on the grounds that one might exist.**

Half a pair is still a swatch. A name with no hex is kept and given no invented colour; a hex
with no name is a measurement. Only a batch that recorded neither gets an empty list. Watched
failing three ways: a version that hands the unmeasured swatch a default grey, one that drops
it for having no hex, and one that gives every batch a blank swatch.

`swatchHex` and `swatchName` survive, as `tempC` and `stateEvents` do — the way back if the
mapping proves wrong, out in a later version on purpose.

### A helper that could not be reused, and the silent failure it would have caused

The swatch name wanted `pairField`, and the field's control name would have had to be a PATH
— `0.name` — rather than a name. `readPairs` splits on the first dot and would have written
every swatch's name to one key called „name", on the batch itself, for all swatches at once,
without error. Caught by reading the helper rather than by running it. The swatch fields use
the same `data-w` path handling the lines already use.

### What this closes

Item 17 is finished. Six releases: the vocabulary and two migrations of seeded records
(§13dn), the carrier basis (§13do), the scaling that was already wrong and the guard that
could not see it (§13dp), two real recipes and a temperature that is a range (§13dq), the
lines a batch actually used (§13dr), and the colours that came out.

What remains of the model is the six new substances, which are content rather than code: a
substance record carries hazard, handling and purpose, and writing those is making claims
that need a source. They start as a workbook, the way the plants did.

## 13dt. The amount field emptied the record it stood on (1.0.0-rc53)

Item 18a, and one line of CSS the release gate could not pass without. Nothing else.

### What happened

The working view of a recipe has an amount field — „Количество суровина", „За колко грама
плат", „За колко литра". It stands on the RECORD, outside the editor. Typing in it fires
`input`, which takes the figure and redraws the work view. That half worked.

Committing it — Enter, Tab, a click elsewhere, the spinner arrows — fires `change`, and the
last branch of `root.onchange` called `readForm(root)` before checking for anything.
`readForm` reads the editor into `draft`. On the record there is no editor, and `readForm`
answers an absent form without complaint: `ings.filter(Boolean)` of nothing is an empty
list, and the same for the steps. It also cleared `appliesTo` and set `distributable` back to
true, because the checkbox it reads was not there either.

So the owner typed 20 and the weigh list and every step disappeared at once.

### How far it went — and the first account was wrong

Item 18a said an Edit-then-Save after this would write the emptied recipe to disk. **It
would not, and the code shows why.** Edit is a change of address; every change of address
calls `open()`, and `open()` sets `draft = null`, so the editor reads the recipe afresh from
the database. Checked, not reasoned: after the emptying, the editor showed both ingredients
and every step. Nothing on this path writes.

So this was a screen that destroyed itself in front of the person using it, and not a route
to losing data. Serious enough — the working view is the screen meant to be read over a pot,
and it could not be used — but the claim in 18a was made from the code's shape rather than
from running it. Corrected there and in the roadmap.

### The fix, in two places

**The caller.** The `change` branch returns at once on the record: the `input` handler has
already taken the figure and redrawn, and a commit there has nothing left to do. In the
editor it goes on as before, reading the form and redrawing the scaling block.

**The helper.** `readForm` now throws when called outside the editor — `editing` false and
not a new recipe — with a message that says what it would have done. A quiet early return
was the alternative and was refused: it would have hidden the caller that should not have
been there, and the next such caller would have been found the way this one was, by the
owner. A named error fails the deep check as a rejection the first time it happens.

### Why the existing guard did not see it

The work-view guard written for §13de sends `input` and never `change`. A browser sends
both. A harness that sends half of what the browser sends checks half of what the person
does — and the half it skipped is the half that was broken.

The new guard, `workview-commit` in `deep-check.mjs`, draws a recipe with two ingredients and
two steps, checks that premise first so a pass cannot come from a record never drawn in full,
types 20, sends `input`, then sends `change` to the element now on screen, redraws from the
module's own copy, and asserts at the screen: both ingredients named in the weigh list, both
steps numbered. Then that the stored record is untouched.

Watched failing both ways: on the old code, `2 lines, 2 steps → 0, 0`; with only the refusal
in `readForm` and the caller unchanged, a rejection naming `readForm`. Passes with both.

### The one line of CSS

Run with Chrome present, the screen layer failed on the **untouched rc52**: the action row on
the batch screen measured 40px on a phone against 44px (§13ac). The cause is specificity, not
fonts. `.box.flat{min-height:38px}` is two classes; the phone rule `.box{min-height:44px}` is
one, so the flat box kept its 38px at every width. The phone block now names `.box.flat` on
its own, at equal specificity and later in the sheet.

It is in this release because the release gate cannot pass without it — the exception to
declared scope that is said out loud rather than slipped in. Seen failing on rc52 with the
four boxes named; passes at all four widths now.

### What this leaves

18b–18g are unchanged by this release. 18c and 18d live in the same field, and 18d — the
caret thrown to the front after the first digit — is still there: this release stops the
record being emptied, it does not make a two-digit number typeable.

## 13du. A record says when the library holds a different version of it (1.0.0-rc54)

Item 18e. A seeded record now says, on its own screen, when the shipped library holds a
different version of it, and each module's „Обнови от библиотеката" button says how many
records it would change. Five modules: Plants, Substances, Techniques, Recipes and the
Reference records. Sources and Glossary have no button (`UNREACHABLE_PACKS`) and are not
touched.

### What went wrong

The owner spent a day looking at the lake recipe as it stood at rc47. rc48, rc49 and rc50
had corrected it and never reached her copy. A NEW record arrives by itself — `loadPack`
adds what is absent at boot — but a CHANGE to an existing one travels only through the
button, and nothing said there was anything to press. A stale record looked exactly like a
broken feature (§13dn working as designed, and still a fault).

### Asked by content, not by version

Item 18e suggested comparing the record's `packVersion` with the shipped one. **That is the
wrong question.** A record's version is written only when that record is added or updated;
the pack's version moves with every change to ANY record in it. So a recipe at 0.3.0 inside
a 0.7.0 pack may be exactly current, and a version test would flag it for ever — a notice
that never goes away and is soon not read.

The question is whether the record differs from its row in the pack, which is what
`diffPack` already computes for the preview. So there is one comparison —
`differingFields` — and `recordStatus` calls `diffPack` itself rather than comparing on its
own. The note and the preview cannot disagree about whether a record is out of date,
because they are the same computation.

### What the record says

Nothing, when it matches the pack, and nothing on the person's own records. Otherwise one of
four sentences, beside the same button the list has (one destination, one name — §13dm):

- the library has a different version; it differs in: *the fields, in words*;
- the same, and the record has been edited, so the preview leaves it unticked and it stays
  as it is unless ticked;
- the library no longer carries this record, and the update will offer to remove it;
- the same, and the record has been edited, so the update will not remove it unless ticked.

The button opens the whole pack's preview, as it does from the list. After an update the
module draws the record again from the database — its own copy was the old one, and without
this the note went away while the screen went on showing what had been replaced.

On Techniques the record opens as its form, so the note stands on the form, and
`[data-sync]` joined the ways out that `dirty.js` guards: pressing it with unsaved typing
asks, like every other way out of a form.

### What the button counts

The count is **what the preview ticks when it opens** — what „Apply" would do if nobody
touched a box: new records, changed records, and withdrawals of records nobody edited. The
rule moved from `seed-ui.js` into `seed.js` as `defaultChosen`, used by both, so the button
cannot say 3 in front of a preview offering 4.

An edited record is never counted. The preview leaves it unticked, and a record the person
edited on purpose would otherwise keep the number up for ever. Her record still says so when
she opens it.

No number when there is nothing to do.

### Drawn first, filled after

Working out a count is a whole `diffPack` — the pack fetched and parsed, half a megabyte for
the plants, and every record of the store compared. The first version did it inside the
render, and every render waits for the one before it (`renderView` in `app.js`), so a list
with a count delayed whatever was asked for next.

The deep check found this as two unrelated sections — `rework` and `prep` — failing one run
in four or five, with rc53 failing none of nine. A slow render shows itself to a harness
that waits for the screen to stop changing exactly that way, and that is the reason the
harness was left alone: the fault was the load, not the waiting.

So a module draws only a mark — the button with `data-sync-pack`, and an empty slot on the
record — and one watcher, installed once in `app.js` after the packs load, fills them in:

- **a moment late** (150 ms), and only for a mark still on screen. A render follows every
  keystroke in a search box; filling each button at once started a comparison per keystroke
  for buttons already thrown away;
- **installed once**, for `dirty.js`'s reason: a rule five modules each have to remember is
  a rule the sixth forgets. No module calls anything after drawing;
- **stating when it is done** — `data-counted`, `data-checked` — so a check waits for the
  answer rather than for a length of time. A failure is stated as `failed` and logged. The
  button works without its number; what must not happen is a zero that was never counted.

Twelve runs of the deep check after the change, no failures.

The boot is untouched: §13cs still holds, and a normal start fetches no pack. The cost
moved to opening a list, once per list actually left on screen.

### The field names, which were wrong before this

The preview names the fields a pack would change. Its dictionary covered plants and
substances and printed the raw field name for everything else, so a recipe update read
„ingredients, steps" in the middle of a Bulgarian screen. The note names fields too, so the
gap would have shown twice.

`FIELD_LABELS` in `seed-ui.js` is now keyed by pack — `name`, `category` and `description`
mean different things in different packs — and repeated labels are shown once (three
temperature fields read „Температура", not three times). Three new strings:
`seed.field.output`, `seed.field.temperature`, `seed.field.maxPercentWof`.

### The guards

**`scripts/try-pack-field-labels.mjs`**, static, layer 3h. Every field any of the five
packs carries has a name; every name resolves in both languages; and no entry names a field
no row carries, so the dictionary is pruned rather than accumulating. Seen failing on each:
the recipes' `steps` removed, and an invented `tempExtractC` pointing at a missing key.

**Deep check, the premise**, run straight after boot: on a fresh install every count is
zero. If a default, a migration or the boot rewrites a seeded field, every new user opens a
list to „· 1" that nothing they do will clear. Seen failing with the boot made to empty the
recipes' steps.

**Deep check, `libdiffers`**, at the end of the file because applying writes every ticked
record in a pack. Five modules, four states each:

1. **stale version, same content → no note.** This is the state that decides between the
   two models, and so the one the guard stands on (§13dp). Seen failing, in all five
   modules, against a note that decided by `packVersion`;
2. content differs → the note names the field, read from i18n by the dictionary's own key,
   and the list count rises by exactly one;
3. edited and differs → the note says so, and the count does not rise. Seen failing, in all
   five, with edited records added to the default set;
4. applied from the note's own button → the stored value is the pack's, the note is gone,
   and the screen shows the new value. Seen failing, in Recipes, with the module keeping its
   old copy.

Plus, on Techniques, typing in the form and pressing the note's button asks first. Seen
failing with `[data-sync]` taken out of `dirty.js`.

### What this does not do

It does not open the preview on the one record — the preview is the pack's, as before. And
it does not reach Sources or the Glossary, which still have no button (ROADMAP B6d).

## 13dv. Lines that named their substance only in prose (1.0.0-rc55)

Item 18f. Seed data, a merge script and a guard. No code in the application changed.

### What was wrong

The owner asked why the fermentation recipe's lines read „носител", „алкали", „помощно".
The alum, the soda ash and the chalk had been in the library all along, with full records.
When the two madder recipes were written at rc50 — and the lake master before them — each
line got a NOTE in prose, „10 г стипца", and no `substanceId`. The work view names a line by
its option; with no option it falls back to the role. That is exactly what it shows for a
substance that is genuinely missing, so two very different states looked the same.

### What changed

Six lines, in the recipes pack, now 0.8.0:

| recipe | line | now names |
|---|---|---|
| pigment-lake-master (Stopka) | carrier · alkali | potassium alum · soda ash |
| madder-lake-hot (Green) | carrier · alkali | potassium alum · chalk |
| madder-lake-fermentation (Stopka) | carrier · alkali | potassium alum · soda ash |

Through `scripts/merge-18f-substance-links.py`, which fills only, holds and prints a line
that already names something, and stops if a line's role is not the one expected. A second
run changes nothing. The option carries no quantity: `quantityRange` falls back to the
line's own `quantity`, which is where the figure always was, so the lake master still
computes 50 g of madder at 500% of 10 g of carrier.

The notes are untouched. They carry what a link cannot: that Stopka accepts aluminium
sulphate as well, and that Green's figures are per jar, of a dissolved solution.

**Chalk as an alkali.** Calcium carbonate's category is `filler` (§13dn) and its role in the
hot lake is `alkali`. That is the model working as intended: the category says what the
substance IS, the role what it does in THIS recipe.

### What was deliberately not added

**An aluminium sulphate option on the Stopka line.** The library holds it in four hydrates,
which differ in aluminium by weight, and the book does not say which. Choosing one would be
inventing a figure. The note keeps the alternative in words.

**Green's „alum" is read as potassium alum.** Unqualified, the chemical name means potassium
aluminium sulphate. Recorded here so the reading can be corrected if her book says
otherwise.

### Lines that name nothing on purpose

The owner decided on 11 September 2026 that the **sauerkraut juice is not a substance**: it is
food, not a dye material, and the vocabulary does not grow to hold one recipe. It stays in
the description. The same reasoning is applied to the two lines of **water**.

Two more lines name nothing because the thing is **made elsewhere**: the pigment a
watercolour or pastel is made from comes out of a batch, and a substance record for it would
be a second copy of something the application already makes.

Seven lines name nothing because they **await item 18g**, the six new substances.

### The guard

`scripts/try-recipe-lines-named.mjs`, static, layer 3i. It asks not „do the pigment recipes
point at alum" but „which shipped line names nothing, and has anybody said why". A line
passes when an option names a plant or substance that exists in the shipped packs;
otherwise it must be in `NAMED_IN_PROSE` with one of three reasons — `not-a-substance`,
`made-elsewhere`, `awaits-18g`. Keyed by position, so a line moved or removed fails rather
than excusing the wrong one.

Seen failing four ways: on the rc54 data, naming exactly the six lines above and nothing
else; an exemption for a line that now resolves; an exemption for a line that does not
exist; and a link to a substance the library does not have.

The `awaits-18g` entries are temporary by construction: when 18g lands those lines resolve,
the exemptions go stale, and the guard fails until they are removed.

### What this leaves

The fermentation recipe's weigh list still reads „помощно 7.5 ml", and the hot lake's
„разтворител 2900 ml". Correct by the decision above, and still a role where a person expects
a name. And „Калиева стипца 10 ml" on the hot lake is a volume of dissolved alum, which the
weigh list does not say and the note does. Both are the same question — whether the work
view shows a line's note — and that is a layout decision, raised rather than taken here.

## 13dw. The seven pigment substances (1.0.0-rc56)

Item 18g. Seed data only.

Gum arabic, gum tragacanth, methylcellulose, kaolin, glycerine, honey, clove oil.
**Seven, not six** — item 18g says „chalk was already there, so six, not seven" after
subtracting chalk from a list that never contained it. The entry's arithmetic was wrong; the
list of names in it was right.

Substances pack 0.3.0, recipes pack 0.9.0, both by idempotent merge scripts that fill only.

### Categories

`binder` for the three gums and methylcellulose's group — gum arabic, gum tragacanth,
methylcellulose. `filler` for kaolin. **`auxiliary` for glycerine, honey and clove oil**,
which is what `vocab.js` says when it explains why only two categories were earned at rc47:
these three neither bind nor fill, they improve how the paint handles and keeps, which is
what neutral soap and Synthrapol are already in `auxiliary` for.

Note that `plasticiser`, `humectant` and `preservative` exist as ingredient ROLES and not as
categories, which is the model working: the category says what the substance IS, the role
what it does in this recipe (§13dn). Honey is an auxiliary; in the watercolour binder it is
a humectant.

### What was written, and what was not

Three fields are required — code, category, name — and all seven carry `typicalUse` as well.
`safetyNote` and `handling` are empty on all seven, which is the normal state: thirteen of
the twenty-six records already shipped carry neither.

**Deliberately not written:** a `safetyNote` for clove oil as a skin sensitiser, and
`handling` for kaolin dust. Both are true and neither is on a page in hand. They go in when
a source says so, with the citation.

### The attribution problem this surfaced

The substance schema has **no source field**. So „Stopka gives gum arabic as the commonest
binder" is written into `typicalUse` as words — which is what §13ct and the sources register
exist to avoid. It is not wrong here (the prose is ours, the source is named) but it is
attribution in free text, and every other reference entity has outgrown that. Raised as
item 18i; nothing invented.

### The seven recipe lines

With the substances in, the lines that named them only in prose now point at them:
the watercolour binder's gum, glycerine, honey and clove oil; the pastel filler (chalk OR
kaolin) and binder (tragacanth OR methylcellulose), each a real choice offered by the recipe,
so each gets two options; and the watercolour's binder line.

The `awaits-18g` exemptions in `try-recipe-lines-named.mjs` then went stale and the guard
failed on all seven as „still excused" — which is the temporary exemption working as
designed. It removed itself by failing rather than by being remembered. The reason is gone
from the guard; two remain, `not-a-substance` and `made-elsewhere`.

## 13dx. The weigh list carries the first sentence of a line's note (1.0.0-rc56)

Item 18h, raised by rc55.

### The line that mattered

„Калиева стипца 10 ml" on Green's hot lake is ten millilitres of a DISSOLVED solution, per
jar. The weigh list showed a name and a figure, and the note that said so sat on the record
below. Somebody over a pot could measure ten millilitres of powder.

### What it does

Under each weigh line, **the first sentence of that line's note**, small and muted. A line
that names no substance shows its note INSTEAD of the role, because „помощно" tells a person
nothing and the note is the only place the sauerkraut juice is named at all (§13dv).

**The first sentence only.** These notes run to three and four sentences — why the powder and
not the liquid gum, what happens if the clove oil is left out — and the whole of that under
every line turns the weigh list back into prose. The rest stays on the record below,
unchanged.

A sentence ends at a full stop, exclamation or question mark, or is the whole note if it has
none. Deliberately simple: an abbreviation would split a note early, and a note cut a few
words short is a smaller fault than a paragraph in the weigh list. If it shows up in real
notes it wants a rule, not a longer regular expression.

### What this does not fix

Several notes **restate the name and the figure** — „20 г смлян корен от брош." under
„Бояджийски брош, корен · 20 g". Read on screen, that is mild noise on a line that needed
nothing, while „разтворена" was a real fault on a line that did. The notes are the seed
data's, written before anything read them at a glance; rewriting them is a data pass and not
this release's. Named here so the next data pass has it.

### The guard

`weighnote` in `deep-check.mjs`, held at the shipped recipes and at the WORDS, not at a class
name (the third way a guard lies, §13dp): the weigh list must carry „разтворена" and „БУРКАН"
for Green's lake, „кисело зеле" for the fermentation's unnamed line, and „на прах" for the
gum. Then, that the gum arabic line carries ONE sentence — anchored at a note that has a
second sentence, or a version printing the whole note would pass.

Seen failing both ways: with the note suppressed (the rc55 behaviour), and with the whole
note printed.

## 13dy. A recipe can be an ingredient of a recipe (1.0.0-rc57)

A model change, asked for by the owner on 11 September 2026 while reading Stopka's pastel
recipe, and agreed before it was built.

### What she saw

Stopka's pastel is two operations, not one. First a binder SOLUTION — 7.5 g of oat groats in
240 ml of water — and then about 3.5 ml of that solution dripped onto roughly two spoons of
pigment. The shipped recipe held only the second half, which is why it had no quantities at
all: the figures that exist belong to the solution, and the solution was not a record.

Her own reading: this is the same shape as the watercolour, which already ships as a pair —
`watercolour-binder` makes the solution, `watercolour-from-pigment` uses it one to one.

### The gap that exposed

An ingredient option could name a **plant** or a **substance** and nothing else. So a line
whose content is made by another recipe had no way to say so. At rc56 I linked the
watercolour's binder line to `gum_arabic` (§13dw) — which is the powder IN the solution, not
the solution. That was wrong, it was mine, and it is corrected here.

### The change

`option.recipeId`, beside `plantId` and `substanceId`. A line filled by a recipe names that
recipe; several options on one line are several VARIANTS of it, which is the existing meaning
of options and needed no new concept. The owner's decision: the oat solution and the gum
solution are variants of one binder, not two separate pastel recipes.

It is a forward pointer, like every other id in this model — no back-reference is stored, and
„which recipes use this one" is derived when the record opens (fixed decision).

Touched: `nameOf` in both render paths; the editor's source selector, which gains a „Made by
a recipe" group; the write-back; and `refs.js` in both of its inventories — the delete policy
and the dangling-reference scan. **The delete policy is the part a new pointer usually slips
past.** §13cq refuses any record the history points at, and a recipe named by another
recipe's line is exactly that.

A recipe cannot name ITSELF: the editor leaves the open recipe out of the list, and the
static guard refuses it in seed data. The work view would otherwise follow the circle.

### The data

Substances pack 0.4.0 — **oat groats**, category `binder`. Recipes pack 0.10.0:

- **`pastel-binder-oat`** (Stopka) — 7.5 g oats to 240 ml water, a real ratio, so it scales;
- **`pastel-binder-gum`** (Crafty Place) — tragacanth or methylcellulose, **no quantities**,
  because „a weak solution" is what the recipe says and all it says;
- **`pastels-from-pigment`** — its binder line now names both binder recipes, at 3.5 ml;
- **`watercolour-from-pigment`** — its binder line names `watercolour-binder`, correcting rc56.

### What was refused

**A weight in grams for „two spoons of pigment".** A spoon is a volume of powder, and a
madder lake and an ochre do not weigh the same. Converting would be inventing a measurement.
So the pastel keeps the book's figures, absolute, and does not scale — which is consistent
with 18c: the amount field should not be offered where nothing moves.

A `tbsp` unit in the vocabulary was the alternative and was not taken: a unit added for one
recipe, when the recipe can say the same thing in its own note.

### The guard

`recipe-as-ingredient` in `deep-check.mjs`. At the SCREEN: the pastel's weigh list names the
oat solution and no longer names gum arabic; the watercolour's names its binder recipe. At
the POLICY: `findReferences` sees the pointer, so a binder cannot be deleted from under the
recipe using it — and, the other way, a recipe nothing names is still deletable, or the first
half would pass against a policy that refuses everything.

Seen failing on each: with the `refs.js` path removed, and with the name resolution removed
in both render paths.

`try-recipe-lines-named.mjs` also now accepts a recipe as naming, and refuses one that is not
in the pack or is the line's own recipe.

### Still open

18b, 18c and 18d — the amount field — are next, and this release does not touch them. The
pastel is now correct data that will stop offering a field the moment 18c lands.

## 13dz. The amount field on a recipe (1.0.0-rc58)

Items 18b, 18c and 18d, which are three faults in one field and had to be taken together.

### 18b, the decision first

The field sits on the record, outside edit mode, and changes what is shown as you type. Two
readings were possible and the screen committed to neither. **Settled: the record scales, and
says so.** It is a question asked OF a recipe — how much am I making today — and not a
property of it, so nothing is stored and nothing is written to the record.

Two consequences, which are 18b's actual content:

**The figure belongs to the recipe it was typed on.** `scaleCtx` was one object shared by
every recipe, so „За колко грама плат: 250" stood in the field of a recipe the person had
never scaled. Now kept per recipe id, for the session.

**The fibre class stays global**, deliberately. It is a fact about the cloth in front of her,
not about the recipe, and asking it again for every recipe would be the same fault the other
way round.

### 18c. The field was offered where nothing moves

The owner typed 10, then 100, and concluded the scaling was broken. It was not: those
recipes have nothing to scale by.

**Four of the six shipped at rc55** were like this — both madder lakes, the pastel, and the
lake master. The last is why this is not a list: the lake master's dyestuff is a percentage
of a CARRIER, and the carrier line is absolute, so whether it scales depends on what the
other lines say. A whitelist of bases would have caught three and missed it.

So `scalingMatters(recipe)` in `calc/scale.js` **computes the answer**: scale the recipe at
two values that are neither zero, one, nor multiples of each other, and see whether any
figure differs. If `convert` changes, this changes with it and nobody has to remember. A
second copy of a fact is the most common cause of a fault in this project, and a list of
which recipes scale would have been exactly that.

Where it does not scale, the head says so — „фиксирани количества, така са дадени в
източника" — rather than showing nothing, which reads as a missing feature.

Of the sixteen recipes shipped now, eight offer the field: the watercolour from pigment, the
watercolour binder, the oat pastel binder, both compound mordants, the fixing bath, the soy
milk bath and the iron bath. The eight that do not are the pigment recipes and the print
pastes, every one of which the source gives as a fixed batch.

### 18d. Two-digit numbers could not be typed

The redraw restored the caret with `setSelectionRange`, inside a `try` that swallowed the
failure, and **Chrome throws for that call on `input type="number"`**. So the caret went to
the front after the first digit and „42" came out „24".

The field is now `type="text" inputmode="decimal"`: the caret restore is defined for it, the
`try` is gone, and a phone still shows a numeric keypad. **And a comma now works** — it is
how a number is written here, and a number input had been silently refusing it all along.
Something that is not a number at all leaves the last figure standing rather than blanking
the weigh list mid-keystroke: „1." on the way to „1.5" is not an instruction to forget the 1.

### Which layer sees which fault

This is the point worth keeping. **jsdom does not throw** on `setSelectionRange` for a number
input, so `deep-check` types „42" happily on the broken code and reports nothing. 18d is only
provable in a real browser.

So the guards are split:

- **`amount-field` in `deep-check.mjs`**: the field is drawn on a recipe that scales and
  absent on one that does not, with a line saying why; the weigh list follows the figure; a
  comma is accepted; and a figure typed on one recipe is not in the next one's field, while
  the recipe it was typed on still has it on return. Seen failing on each: the field forced
  on always, the per-recipe store made shared, and the caret restore made wrong.
- **`screen-check.mjs`**, in Chrome, typing „42" on a real keyboard one key at a time. Put
  back to `type="number"`, it reports „typing 4 then 2 left „24" in the field" — the owner's
  fault, reproduced by a machine.

Two fixtures in `deep-check` had to gain a line that scales, because since this change a
recipe whose every quantity is absolute is not offered the field at all, and both sections
were about the field.

## 13ea. One list for what a record credits (1.0.0-rc59)

Item 18i, widened. Raised by the owner reading Kelly's compound mordant: the recipe is
Garcia's, adapted by Kelly, and Flint teaches something close to it. Her words — it is rarely
clear who a recipe belongs to. The model could record one name.

### Three faults, one of them old

**Two shapes.** `sourceCode` was a string on five seeded recipes and a LIST on the sixth, the
watercolour binder, which credits a book and the studio's own practice. Every reader had to
remember both. Two copies of one fact in two shapes is the fault this project meets most.

**No field at all on a substance.** So the seven pigment substances of rc56 credited Stopka
inside the prose of `typicalUse` — attribution in free text, which every other reference
entity has outgrown (§13ct).

**Nothing checked a recipe's codes.** `audit-library.mjs` validated the combinations only. A
recipe could cite a source that does not exist and the whole set passed.

### What changed

`sourceCodes`, a list, on recipes and substances. Recipes pack 0.11.0, substances 0.5.0, and
the eight pigment substances now name their source in the register rather than in a sentence.

`codesOf` in `refs.js` is exported and is the ONE reader: the recipe screen, the substance
screen, the audit and the delete policy all ask it. It still reads the old single field, so
nothing is lost in either direction.

`migrateRecipeSourceList` gives every stored recipe a list. It does not remove `sourceCode` —
migrations add, and the old field is the way back. A recipe crediting nobody gets an empty
list, which is the finished state rather than the unfinished one (§13dl). `putMigration`, so
a reshaping does not move a recipe to the top of a list ordered by recency (§13cv).

### A fault the guard found on the way

**Every source on the recipe screen was printed as a raw code.** The lookup was
`new Map(sources.map(s => [s.code, s]))`, and `s.code` is EMPTY on a seeded source: `loadPack`
strips `code` from every row before storing it, and the code survives only inside the id. So
the map missed all 53 of them and the fallback printed „joanne-green-watercolour" where a
book's title belongs. It had been doing that since the screen was written.

`sourceCodeOf` is exported from `refs.js` — `row.code ?? id without the seed prefix` — and
both screens use it. One answer to „which record is this code".

### What this does NOT do

A list says these sources stand behind this record. It does not say **who came first**.
„Garcia's, adapted by Kelly" is a claim about the relationship between two sources, and the
register has no edge between them. It stays in the recipe's note, in the owner's words.
Making it data would turn the register into a graph and is not for 1.0.

### The guards

**`audit-library.mjs`** now validates recipe and substance codes against the register. Seen
failing on each: a recipe pointed at a code that does not exist, and a substance.

**`source-list` in `deep-check.mjs`** — the migration first, because it touches records the
owner already has: the string is carried into the list, the old field survives, a recipe
crediting nobody gets an empty list, `updatedAt` does not move, and a second run changes
nothing. Then both screens, at the NAME a person reads.

The substance half is anchored at the sources ROW, not at the word „Стопка" anywhere on the
page: her name is also in the record's prose, so a check on the page text passed with the row
deleted. The second way a guard lies — right screen, wrong thing (§13dp).

**`try-pack-field-labels.mjs`**, written at rc56, failed on this release before the labels
were added: two packs carrying `sourceCodes` with no name, and `recipes.sourceCode` named and
no longer carried. Both directions, working as built.

## 13eb. The three print pastes (1.0.0-rc60)

Seed data, two vocabulary codes and two substances. The owner chose the recipes on
14 September 2026, having read both sources side by side.

### Cliffe, and why

For the **mordant paste** the two sources give the SAME recipe with the same figures —
200 ml vinegar, 20 g alum, 10 g soda ash, 2 g gum. So nothing is lost by taking Cliffe, who
carries the sequence through to the dye bath: dry it hard, neutralise in the chalk bath ten
to twenty minutes, wash the thickener out BEFORE dyeing. Maiwa's mixing warnings are folded
into the steps — a vessel four to five times the liquid, the soda ash a little at a time
because of the froth, fifteen minutes for the gum. Both sources are credited, which §13ea
made possible.

For the **dye paste with no mordant**, Maiwa has two sentences and no quantities; Cliffe has
both thickeners with figures and says which is for a block and which for a screen.

For the **ready-to-use paste** the two are NOT the same recipe. Maiwa's is potassium alum
held in solution with vinegar; Cliffe's is aluminium acetate with no acid. The owner chose
aluminium acetate, and Cliffe's times with it: steam fifteen to thirty minutes, chalk bath,
pH-neutral soap. Maiwa's remains a real alternative and is not in this release.

### Two roles

`thickener` and `marker`. Both would have gone under `assistant`, which already means
something else — the sauerkraut juice that starts a fermentation. A thickener is why a paste
is a paste: it decides whether the print has an edge or bleeds.

A **marker is not an ingredient of the result.** The mordant paste is colourless, so Cliffe
adds a little extract purely to see where the block has printed. Filed as its own role rather
than as `dyestuff`, which would say the paste dyes — the opposite of what a mordant paste
does.

### Two substances, and two sources

Guar gum and cornflour, both `binder`. And the register gains Cliffe's book and Maiwa's
course, so the pastes cite records rather than names in prose.

### Batches, not ratios — found by the guard

Written first with the figures as ratios, so the pastes would scale. On screen every quantity
read „—" until something was typed into the amount field. The book gives a BATCH: „makes
about 200 ml". So the quantities are absolute, exactly as printed, the amount field is not
offered (§13dz), and the figures are there the moment the recipe opens.

A thickener whose amount depends on WHICH thickener carries its range on the OPTION — starch
5–10 g, gum 2–4 g — which the model already supports and which keeps one line for one job.

### The marker's note, and §13dx again

The note first said what the drop is for in one sentence and that the colour washes out in
the second. The weigh list shows the FIRST sentence only, so the fact that matters never
reached the screen the line exists for. One sentence now, carrying both.

### `dyer-chooses` — a fourth reason a line names nothing

Three lines name no substance because the recipe deliberately leaves the choice open: any dye
extract will do, and how much depends on which. Naming a plant would turn an open recipe into
a madder recipe. Added to `try-recipe-lines-named.mjs` beside `not-a-substance` and
`made-elsewhere`.

### What this does NOT do

**The diary still cannot record a paste print.** `process:paste` says „скоро" and that is
still true: a trial cannot choose it, and nothing here changes that. The library knowing the
recipes and the diary being able to use them are two pieces of work, and this is the first.
The owner has it as the next thing to plan.

### The guard

`print-pastes` in `deep-check.mjs`, at the weigh list: no amount field on any of the three,
every figure from the book on screen, the starch's range shown, the marker line saying its
colour washes out, and the ready-to-use paste naming aluminium acetate with no vinegar
anywhere — Cliffe's recipe and not the one set aside.

Seen failing with the figures turned back into ratios, and with the per-option ranges removed.

## 13ec. The compound mordant, and three baths beside it (1.0.0-rc61)

> **Superseded in part at rc118 by §13fs.** The recipes no longer credit the books this section
> names — they credit the studio's practice, and the books stay in the Library. Recipes named
> here that left the distributed library are the owner's own.

From Alison Kelly's book, crediting Michel Garcia's recipe — the attribution the owner asked
for, and no commentary in the record about the book disagreeing with itself.

### Which figures, and why it had to be asked

The book gives the compound mordant TWICE and the two do not agree: a fixed batch for up to
250 g of fibre, and a page of percentages. The soda is exactly double in the batch, 10% against
5%, and the iron is higher too.

A third reading, from an unattributable source the owner found, put the soda-to-alum ratio at
2.1 to 1. The batch is 2.24 to 1 and the percentage page is 1.12 to 1 — half. Two readings
agree and one is the odd one out. **That third text is not cited anywhere**: it is an AI
answer over social media posts, with no author, title or year, and it cannot be checked.

The owner chose the batch, **recalculated to 100 g of cloth**. Filed as percentages of the
weight of fibre rather than as a fixed batch, so the recipe answers for any weight; at 100 g
the work view shows the batch's own figures — 20 g alum, 200 ml vinegar, 10 g soda, 0.4–0.8 g
iron.

### Five records

**Two mordants.** Bright and dark are separate records: they differ in the soda as well as the
iron, so they are not one recipe with a choice on one line.

**The oatmeal or bran bath is a recipe, not a step.** It happens after the cloth has dried
completely, which is the method's whole point, and it is attached as `requiredFollowOn` so
both mordants draw it under their own figures (§5.4).

**Soy milk** and **the iron bath** stand alone. Soy is another route for cellulose; the iron
bath is done immediately before printing, because iron oxidises in water and yellows cloth.

The owner's reading, and it is the right one: this is aluminium acetate made in place, with
iron added — which is why it sits beside her own aluminium acetate recipe rather than
replacing it. That record is hers, marked not for distribution, and was never in the shipped
pack.

### Two accidents, and what they left

A merge script ran twice from two different drafts. The pack ended with **two fixing baths**:
the mordants pointed at one, and the other was reachable from nothing. Worse, four records
kept an earlier draft's numbers — the dark mordant carried the bright one's soda — because the
second run held them as „already there". All five were removed and rewritten from one script.

The same doubling put a stale draft of this release's guard into `deep-check.mjs` and a label
for `liquorRatio`, a field no recipe carries, into `seed-ui.js`. The field-label guard from
rc56 caught the second one on the release run.

### The guard the accident exposed

**Nothing had ever checked `requiredFollowOn`.** A dangling id is not a broken link in a
document: §5.4 makes the follow-on a step the work view draws and scales, so a bath that does
not resolve simply does not appear on the screen of somebody mordanting cloth, with nothing
said.

`scripts/try-recipe-followons.mjs`, layer 3j, asks both directions: every follow-on resolves,
and a recipe that is only ever done after another one — stated in the file, not guessed — is
pointed at by something. Seen failing on each.

**`kelly-mordants` in `deep-check.mjs`** types 100 g and reads the weigh list. 100 g is the
state that decides: it is where the batch and the percentage page differ, and a guard that
used the field's default of 250 g would have agreed with both. Then that bright and dark carry
different soda, and that the bath is drawn under the mordant. Seen failing with the dark soda
set to the bright figure, and with the follow-on removed.

---
## 13ed. A paste print can be recorded (1.0.0-rc62)

The first of two releases on the diary side. The library held three paste recipes and the
diary could not record work against any of them: `process:paste` said „скоро" and a trial
could not choose it.

Settled with the owner on 14 September 2026: a print and the dye bath that follows it are
ONE work; the ground is worth recording when it was dyed; and an extract is the plant it was
made from, the same as a pigment.

### The mordant was read from the wrong place

A mordant print paste leaves the cloth bare and puts the mordant only under the print. The
resolver reads the cloth (§13bd) unless the trial has a step that mordants — and it looked for
a step TYPED `mordant`. A paste step is typed `print_paste`, so a paste work read as
**unmordanted** and matched the wrong reference record.

The fix is the general question, not a second case: **any step with a recipe** is asked, and
`fromRecipe` already answers by walking the recipe's options. A recipe with no mordant returns
nothing and the walk goes on to the cloth.

A second thing hid behind that. `fromRecipe` skipped every line that was not `percent_wof`, and
every line of a print paste is absolute — „20 g of alum in 200 ml of paste" is not a percentage
of any cloth. Now any line answers WHICH mordant, while HOW STRONG stays null: a band is a
share of the cloth's weight, and a paste covers only what was printed. Null is „unknown", which
is not „none" (§13dl). A percentage line is still preferred, so nothing changes for recipes
that have one.

### What the diary gained

**A paste work names its dyestuff.** Placements were offered for eco print and for a bath; a
paste work now asks too, and the dyestuff hangs on the printing step, the way a bath's hangs on
the dye step. Without it the work cannot say which plant the colour came from and the reference
half is blind to it.

**`extract` as a placement condition**, beside fresh, dried, rehydrated and frozen. The owner's
reading: an extract is still the plant it was made from. Bought or made in the studio, the
record is the same.

**How it was laid on** — block, screen, brush, stamp — a dimension of its own, asked only on a
printing step. Not a detail: Cliffe's two thickeners are chosen by it, so the edge of the print
follows from it.

**Two step types.** `steam_flat`, because a bundle is steamed rolled up and a printed cloth is
steamed flat; and `neutralise`, because `post_modifier` is a bath meant to CHANGE the colour and
neutralising is the opposite — it stops the acid and leaves the colour alone.

**`loadTables`.** The module read its tables at the top of `render`, so anything asked of it
without a render worked from empty maps and answered confidently with nothing. One path now,
used by the render and by the resolver.

### The guard

`paste-work` in `deep-check.mjs`, on a cloth with **no mordanting at all** — the state where
the two readings must disagree. That the work is asked for its dyestuff, that the block is
recorded, and that the mordant is found in the paste. Then the other way: a paste whose recipe
holds no mordant stays unmordanted, or the first half would pass on a resolver that says „alum"
to everything.

The placements half is asked on a work with NO placement yet. The first version of the check
used the fixture that already had one — and the block is drawn for any work that has one, so it
passed with the gate removed. Corrected, and it is the second way a guard lies: the right
screen, the wrong thing (§13dp).

### What is still missing

**What actually went into the paste.** The recipe leaves the dye open on purpose
(`dyer-chooses`, §13eb) and the step records which recipe, not which extract and how much. The
pigment batch already solved this shape — it records what was really put in and remembers the
deviations (§13dr) — and that is the second release.

**The reference key does not know that a paste covers only part of the cloth.** „Cotton, alum,
paste" reads the same as a fully mordanted piece, and the results are nothing alike. Three ways
out were put to the owner — leave it to the work's own words, split the process in two, or give
the combination a coverage field — and it does not have to be decided until the reference half
is taken up.

---
## 13ee. What actually went into the paste (1.0.0-rc63)

The second of the two diary releases, and the one that makes a paste work answerable by the
reference half.

### Why it is needed more here than on a batch

A print paste recipe leaves the dye OPEN on purpose — „any dye extract will do, and how much
depends on which" (`dyer-chooses`, §13eb). So the recipe cannot say what was printed with and
the step said only WHICH recipe. Which extract, and how much, had nowhere to go.

### The same code, not a second copy

The pigment batch answered this in §13dr: a list of lines, each keeping what the recipe said
on the day, with the standing computed rather than stored. `departureOf` and `linesFromRecipe`
moved out of `modules/pigments.js` into **`recipe-lines.js`**, and both modules call them.
Copying them would have been a second copy of one fact, which is this project's commonest
fault.

`canTakeLines` stayed with the batch: it asks about a batch's own state. The trial has its own
one-line answer, `canTakeStepLines`, exported for the same reason the batch's is — it decides
where the button is DRAWN and again where it is CLICKED, and those two drifting apart is how a
hidden control turns out to be clickable (§13cz).

### What the screen does

On a printing step: „Какво наистина сложих", with a button that takes the recipe's lines once.
After that they are the work's — editable, strikeable, and never replaced by a second click.
Amounts are resolved at the moment of taking rather than referenced, so the record still says
20 g next year if the recipe is revised. A line left out is struck through, not deleted: „I
left the soda out" is a fact about the work, and a line that vanishes says nothing.

A changed amount is marked, with the recipe's own figure readable beside it.

Offered on a printing step only. A dye bath would take the same block and it is outside the
declared scope of this release.

### The guard

`went-in` in `deep-check.mjs`, three things:

- the lines come across with their figures, and reach the RECORD — taking fills the draft, as
  every edit here does, and the check saves the way a person would. The first version did not
  save, and read a record with no lines at all;
- 17 g where the recipe said 20 is marked as a departure, with the 20 still on screen;
- **and the one that would lose work:** only one step is open at a time, so a reader that
  rebuilt the lines from the screen would empty every step that is shut. That is the fault
  §8.0e already fixed once for the steps themselves. The check opens another step, saves, and
  reads the paste's lines back.

Taking-once is asked of `canTakeStepLines` rather than of the button, because a check that only
looked for the button would pass on a handler that takes them anyway — and the handler is the
half that would overwrite an evening's entries. Asked both ways: a step with lines is refused,
a step without them is not.

### Found by the release gate

`recipe-lines.js` was not in the service worker's cache list, so the application would have
worked online and broken offline — on an offline-first application, for a file created the
same hour. The cache-list layer caught it before the release.

---
## 13ef. The pH scale, drawn (1.0.0-rc65)

Item 5 of A7, and the owner's own idea.

### What it was

Five rows, each a colour swatch, a range and a name. That answers „what is band three called".
A dyer's question is „where does the 9 I just measured fall", and a table answers it by being
read across rather than by being looked at. It was also the only screen in the reference half
where a figure is described in words where a picture would say it.

### What it is

One bar, fourteen places, each carrying its own number and coloured by the band it belongs to.
The numbers sit ON the bar: a number under a stripe has to be counted across to.

The five names stay, as a legend under it. A bar on its own is pretty and unreadable to anyone
who has not learnt the colours.

**The colours are the five already declared**, unchanged: where a reading falls, never what a
dye turns. A bath at pH 11 is not black. No green, as everywhere.

`bandOf` is one function, so the bar and the legend cannot disagree about where 7 stops being
neutral. `inkOn` chooses the ink from the band's own luminance rather than from a list of
„this one is dark", because the palette is a fixed decision that may yet be re-tuned and such
a list would be a second copy of what the colour already says.

On a phone the bar keeps its fourteen columns and loses two pixels of padding; the legend
wraps, because five names in one row at 322px would be four letters each.

### The guard

`ph-scale` in `deep-check.mjs`: fourteen places numbered 1 to 14 in order; every colour one of
the five the module declares — `PH_BANDS` is exported so the check asks rather than repeats,
since a second copy of the palette is how a stray colour survives; 7 drawn as neutral and 8
not; and the five names still under it.

Seen failing three ways: a bar of ten places, a green cell, and the bands shifted by one.

---
## 13eg. About, Help, Safety and the legal texts (1.0.0-rc66)

ROADMAP A6, item 1. „None of these exist" stood there for fourteen releases.

### Four tabs, not seven screens

A6 lists seven documents. Seven sidebar entries for seven pages each read once would be a
navigation built from the developer's list. They are `#/about` with four tabs — about, help,
safety, legal — sitting under the rule with the backup, where things that belong to neither
half go.

### What each says, and what was refused

**About** — what the application is, the split between the reference half and the diary, that
it works offline with no account, and the version. The version comes from `version.js`: a
number typed into a text would be wrong the first time it was not updated, and this is the
figure a person quotes when reporting a fault.

**Help** — how to start, from something real rather than from the settings, and where the
parts are. It ends on the backup, because data that exists and cannot be reached is not
available (A5).

**Safety** — the one document here that is not paperwork. It opens with what to do rather than
with what the developer is not liable for: masks and gloves for powders, soda ash added slowly,
dyeing vessels never used for food, how little iron it takes, that a plant is not safe because
it is a plant, disposal, children not working with powders, and that the calculators compute
what they were given. The supplier's safety data sheet takes precedence over anything the
application says.

**Legal** — terms, privacy, licence.

- The **terms** say what was settled long ago: the purchase is of the functionality that
  exists at the time, support covers defects, suggestions are read and are not commitments.
- **Privacy** is short because the architecture made it short: no account, nothing sent
  anywhere, no analytics, no third-party service.
- The **licence** is a DRAFT and says so on the screen, in a warning note. It grants personal
  use including work that is sold, forbids redistributing the library, claims nothing over the
  owner's own records, and promises no particular colour. **It is not mine to settle**, and a
  legal text that looks settled because nobody said otherwise is the failure mode here.

**The address for reports is not set.** `CONTACT` in `modules/about.js` is empty, and the
screen says plainly that the address is not yet determined rather than showing an invented one.
Recorded in A7.

### The texts are in i18n.js

Where every other word is. Keeping them in the module as template literals would read better
while writing them and would put half the application's Bulgarian in one file and its English
in another — and the English of these is exactly what the owner still has to read (A7, item 3).

### The guard

`about` in `deep-check.mjs` asks for the SENTENCES, because a check that only asked whether the
screen draws would pass on four empty panels: the real version on the About tab, a Help text
long enough to be help and mentioning the backup, the three safety lines that are not
paperwork, all three legal sections, and the licence still calling itself a draft.

Two of them are claims about the CODE and are checked against it rather than trusted:

- privacy says the application fetches only its own files, so the check reads `sw.js` — the one
  place that lists what is fetched — and fails if any external URL appears there;
- the address is honest either way: shown when set, and „not set yet" when not.

Seen failing four ways: the safety list cut short, the draft notice removed, an external URL
added to `sw.js`, and an address set.

The four screens joined `screen-check.mjs`, which now measures 34 views at each of four widths.
Long prose is where a line runs past the edge, and a route that was never in that list is the
sixth way a guard lies.

---


# Part VI. Open questions

## 16. Open questions

00. **The other three states of a number.** "About" is built (§13ai); **unknown**
   and **not applicable** are not, and "empty" still carries both of them plus
   "not got to it yet". The open question is not whether the distinction is real
   — the seeded library proves it is, with `liquorRatio` blank on all forty-eight
   plants for at least two different reasons — but whether the cost is worth it.

   Against building it: three more states on every numeric field is a form that
   asks four questions where the person wanted to type a number, and the
   application would then have to decide what an unknown means everywhere a
   number is used — the scaling calculators, the ceiling checks, the reference
   matcher. A field that can be "unknown" is a field every consumer of it must
   handle, and there are many.

   For: the application's whole claim is to say what is known and how firmly.
   "Not applicable" in particular is not a gap but a fact — cold dyeing has no
   temperature, and showing an empty temperature suggests one was never
   recorded. Export makes this sharper: a pack sent to someone else carries
   blanks with no way to read them.

   A middle path worth considering before the full four: only **"not
   applicable"** as a second mark, since it is the one that is a positive
   statement rather than an absence, and it needs no new handling downstream —
   a field that does not apply is simply not shown.

0. ~~**Does season belong in the combination key?**~~ — **CLOSED at 1.0.0-rc46: no.** Season is
   not part of the combination key and will not become part of it. The 163 records already written
   are therefore complete rather than missing a dimension, and the doubling this would have cost
   the library is not paid.

   **What this leaves without a home, stated rather than glossed.** „Autumn oak is loaded with
   tannin and prints boldly, spring oak is thin and prints softly" is a true and useful sentence
   and there is now no field for it. `influences` (§13dg) is the mechanism for „what moves this
   result", but its factor list is closed and holds six — fibre, mordant, medium, species, dose
   and time, preparation. **Season is not among them.** So the knowledge lives in a
   combination's `notes`, in the owner's own words, exactly as `printingSide` does until §13
   is settled. Whether `season` becomes a seventh influence factor is a smaller question than
   the one just closed and is not asked here.

   *Kept rather than deleted, because it was the one open question with teeth in a library that is
   otherwise frozen, and a reader of §13db is entitled to know it was asked and answered.*

1. ~~Per-plant observations inside a multi-plant eco print bundle~~ — **resolved**: placements (§8.4).
2. ~~Blanket as recipe or field~~ — **resolved**: a recipe type (§5, type 8).
3. ~~Plant-chemistry granularity~~ — **resolved**: fixed vocabulary with levels (§4).
4. ~~Combination creation~~ — **resolved**: user-created, with app suggestions from accumulated
   placements; outcome always authored by the user, matching on bands (§7).
5. ~~Fabric identity~~ — **resolved**: one record is one physical piece, with a treatment lifecycle
   mirroring the storage boxes (§3, A.1).

6. **Does attribution move onto the record?** §13.1 keeps the Sources register separate on purpose:
   proportions and sequences pass from hand to hand and their origin is usually unknown, so
   pretending every record has an owner misrepresents how the craft travels. That reasoning holds
   for a private library and inverts for a distributed one (§13l). Asked of the owner, not yet
   answered.

7. **Do literature colours carry a swatch?** A hex derived from a colour name is an illustration.
   The owner has asked for them to be loaded, marked as literature-sourced — the alternative, a
   colour with text and no swatch until she has dyed it herself, is stricter and slower and leaves
   the column that makes people open the list empty. Proceeding as she asked; noted here because it
   is the one place the reference asserts something nobody has seen.

8. **Pigment extraction and watercolour.** The recipe model is a percentage of the weight of goods,
   and a pigment has no cloth: it has a binder, a filler, ratios by mass, and its output is a
   *substance* rather than a dyed textile. Neither recipes nor substances covers this today.

9. **"Unknown" and "approximate" as legitimate values.** From the review, and the most principled
   item in it: the application should not make someone invent a number because there is a number
   field. Affects the composition of recycled cloth, quantities of leaves, water hardness, the
   concentration of an old blanket. Not a field — a stance, and it would touch many.

10. **Does "Рецепта" survive as a plant section?** Fourteen plants, real content, and the only one
    of five doubtful headings with substance. The owner is still thinking about it.

---

---

## 13eh. The language package, step 1: guards before words (1.0.0-rc67)

The owner commissioned a language and terminology package for 1.0 in five steps, each its own
release: guards; the interface dictionary and the vocabulary; English for plants; English for
combinations; the language of the recipes. This is step 1. **No user-visible text changed.**

### What rc66 was found to ship

Checked against the code, not taken from the audit that raised it:

- **603 reference fields with Bulgarian and no English** — 296 on plants (132 colour names, 132
  colour conditions, 27 harvest notes, 5 toxicity notes), 307 on combinations (135 expected
  colours, 121 notes, 37 influences, 14 variations). Recipes, glossary, techniques, substances
  and sources: none. **Every one of them is drawn in Bulgarian on the English screen**, because
  `text()` falls back to `bg` when `en` is empty.
- **Ten dictionary keys defined twice**, in both languages; seven with two different texts.
  An object literal keeps the last, so the first is dead text one deletion from being live.
- „адјективно" twice in `seed/recipes.json`, with the Serbian ј.
- „Багра" in one English string; Bulgarian „ quotes in 2 dictionary strings and 8 seed fields.
- Bulgarian written into code: a weight unit „г" in `modules/batch.js` (twice), „г/м²" in
  `units.js`, the default label prefix „П" in `modules/fabrics.js`, an error in `backup.js`,
  and `aria-label="Основна навигация"` on the main navigation.
- **Found only on the screen:** three `nameBotanical` values carry Bulgarian commentary inside
  a Latin field („Rubus fruticosus L. (в практиката често …)"); the batch screen draws recipe
  names in Bulgarian although the recipes have English; three source names are Bulgarian.

### The guards

**`scripts/try-language.mjs`** reads the files: duplicate and one-sided dictionary keys,
Cyrillic in English, letters Bulgarian does not use (ѝ is Bulgarian and is allowed — the first
version refused it), Bulgarian quotes in English, unambiguous American spellings (British
English is the standard), malformed `{bg, en}` pairs, Cyrillic written into code, and
untranslated pairs across all seed packs and the vocabulary.

It also holds a **fingerprint of every seed record with its words blanked out**. Figures,
codes, ids, order and shape are in it; the text of a pair is not. Language work that moves a
recipe's quantity, or turns a pair into a plain string, fails and names the record. A data
change that is meant is accepted with `--accept-data`, which lists what moved.

**`scripts/try-language-screens.mjs`** switches a real browser to English, opens 321 screens —
every view and every shipped library record, with English-only diary fixtures — and collects
every line, placeholder, title and aria-label with a Cyrillic letter. 531 lines on rc66.

**Both are ratchets.** The faults known today are listed by name in `test/language/`. A fault
not on the list fails; a listed fault that is gone fails until it is crossed off, so the list
always says what is left; `--strict` fails on the list itself, and **1.0 ships with the lists
empty**. A finding that is right — a journal title spelled as published, the Bulgarian headings
`plants.js` matches old records against — is an exception with its reason written beside it,
and an exception that no longer matches anything fails.

**Seen failing** on copies broken on purpose: Cyrillic into English; a gap filled and not
crossed off; one figure in one recipe; a pair made a string; a new duplicate key; a stale
exception; ј in a live and in a shadowed Bulgarian string; a Bulgarian word reaching the English
screen; a translated line not crossed off. The screen list is kept by text, not by place: a word
still drawn elsewhere stays listed, and the per-record account is the file check's.

**A fault in the guard itself, found while testing it:** `process.exit()` after a piped
`console.log` cut the strict listing at 399 of 641 lines. The verdict was right and the evidence
was not all there. Both scripts set `process.exitCode`.

**Not checked, and said so:** whether the English is good. `bg === en` is not an error. The
guards find English that is absent, not English, or the wrong English — never English that is
merely poor. That is the editorial review the owner has scheduled at the end of the package.

### Terminology decided by the owner, applied from step 2

Recorded here because the decision is made now; nothing below is on screen yet.

- **The box `mordanted`** reads **„С мордант"**. The internal code does not change.
- A fuller description uses „Обработен със закрепващо средство (мордант)" where it is needed.
- The glossary defines **мордант** as an agent that helps the dye bond with the fibre.
- The action is „Обработка със закрепващо средство"; with the substance known, „Обработка с
  [вещество]". English: *mordanting*, *mordanting with [substance]*.
- **No mechanical replacement** of the roughly 245 occurrences. Each is judged in context, and
  a text is not lengthened where it need not be. „Фиксиране", „байцване", „фиксатор" are not
  substitutes for mordanting.
- „In hand" (`trials.working`, bg „На работа") is replaced by a label that does not collide:
  „In progress" already names a planned pigment batch and an unfinished trial.
- The home screen subtitle is considered as „Your fabrics, next steps and gaps in the reference
  library", checked against what the screen actually shows.
- **Duplicate keys:** keep the value the screen uses, but first check whether the other one was
  the right text for a different screen; if the two mean different things, they become two keys.
- **The 121 combination notes are classified before any are translated** — real notes, text in
  the wrong field, duplicates, and records with no use — and the result is shown to the owner
  before anything is moved or removed (see DOCUMENTATION_DECISIONS_NEEDED §12a).

---

## 13ei. The language package, step 2: the dictionary, the vocabulary and the terms (1.0.0-rc68)

Every changed text, with its value before and after, is in `docs/language/rc68-text-changes.md`,
generated from the edit rather than written afterwards.

### How the owner's terminology was applied

> **Superseded at rc69 by §13ej.** The rule below kept „мордант" in compact labels; the owner
> decided that the Bulgarian interface does not use it as a name at all.

The owner approved a table (substance: „закрепващо средство"; process: „обработка със закрепващо
средство"; the box: „С мордант") and two limits: no mechanical replacement, and no short label made
longer than it needs to be. The two pull against each other on a one-word chip, so the rule used is:

- **Compact labels** — box and state names, table headers, filters, selects, recipe and step types,
  chips: the noun **мордант** stays. The state is **„с мордант"**, the action **„обработка с
  мордант"**, the bath **„баня с мордант"**. This is the same choice the owner made for the box.
- **Prose** — hints, warnings, descriptions, help: **„закрепващо средство"**, and the process as
  **„обработка със закрепващо средство"**; „мордант" may follow once the sentence has named it.
- **Nowhere in the interface:** „мордантиране", „мордантиран", „мордансиран", „байцване",
  „мордантна". They remain as search aliases and as named synonyms in the glossary.
- **English is unchanged in kind:** mordant, mordanting, mordanted.

Labels that KEPT „мордант" on this rule, so the owner can see the line: `ref.mordant`,
`ref.mordantBand`, `ref.band`, `ref.anyMordant`, `ref.none` („без мордант"), `ref.bandBetween`,
`ref.bandOver`, `ref.emptyHint`, `recipes.sub`, `recipes.emptyHint`, `materials.mordant`,
`materials.mordantType`, and the vocabulary labels `material_category:mordant`,
`recipe_type:mordant`, `ingredient_role:mordant`, `step_type:mordant`,
`influence_factor:mordant`, `enhancement:botanical_mordant`, `enhancement:blanket_mordant`.
`ref.none` is the one the approved table named differently („Без закрепващо средство"); it is a
filter option and a fact line, and it was kept short on the second limit.

### Duplicate keys

Ten, each read against its use before anything was removed. None of the shadowed copies belonged
to a different screen: every key has one caller, or two callers showing the same thing. So the
live value stays and the shadowed copy goes — with two exceptions:

- **`fabrics.photoHint`** — the shadowed copy was the better text („or garment", „for
  comparison") and the live one a filler („more useful than it sounds"). The shadowed text is now
  live.
- **`fabrics.photo`** — both copies were unused by any code. Both removed.

Not changed and worth the owner's eye: `stock.one` is „Stock entry" / „Наличност" while its
neighbour `stock.newJar` is „New jar" / „Нов буркан" — the removed copy „Jar" / „Буркан" was the
consistent pair. Keeping the live value was the rule; whether a jar is still the word after §11b
folded stock into substances is a naming decision.

### The owner's three decisions

- **Botanical names.** The Bulgarian commentary left `nameBotanical` on three plants. Rubus's went
  into its `description`, Dahlia's into its section „Как се държи", both in both languages.
  Rheum's was NOT moved: its „Как се държи" already says that Asian Rheum species are richer in dye
  anthraquinones. **`photoCredit.taxon` carried the same commentary** and was hidden only because
  the caption prints the taxon when it differs from the name; cleaning the name alone would have
  put the comment under the photograph. Both were cleaned.
- **Source names — NOT done, proposed instead.** `name` on a source is a plain string, not a
  pair. Giving „Практиката на ателието" an English name is a change of structure, which the
  owner asked to see proposed first. DOCUMENTATION_DECISIONS_NEEDED §20.
- **The label prefix „П"** is an identifier on physical labels and stays in either language. It is
  a documented exception in `test/language/exceptions.json`, with the owner's reason.

### Faults in code found by step 1 and fixed

Recipe and chain names drawn from `name.bg` on the batch screen (six places) and ingredient notes
from `note.bg` in the recipe and chain editors; the weight unit „г" in `batch.js`; the gsm unit in
`units.js`, now from the dictionary; the navigation's `aria-label`, written into `index.html` in
Bulgarian; an error message naming „Багра" appended to the English alert.

### The data fingerprint, accepted by name

Five entries moved, and each was shown and matched against the approved edits before
`--accept-data` was run: the three plants (`nameBotanical` and `photoCredit.taxon` only), the
glossary term `mordant` (one alias added, „закрепващо средство", so a search for the new word finds
the term), and the manifest (plants 0.12.1, glossary 0.2.1). No figure moved.

### Where the meaning may have moved

Listed in the changes document with a reason each: the home screen subtitle (narrowed to what
the screen shows), „In hand" → „Work under way", the substantive/adjective hint and glossary
definition (both now say „lastingly" — a claim for the scientific audit), the photo hint, the
mixed-fibre warning, „изваряване" → „изпиране" in the batch subtitle, and the combination
example in About.

### What the lists say now

File check: 613 known (603 untranslated reference fields, 8 Bulgarian quotes in seed English, 2
„адјективно"), 15 exceptions. Screen check: 518 Bulgarian lines on the English screen, all of them
reference data for steps 3 to 5 or the source names of §20.

---

## 13ej. „Закрепител": the Bulgarian term for mordant (1.0.0-rc69)

**The owner's final product decision, 16 September 2026.** „Мордант" is not accepted as a name on its
own in the Bulgarian interface, although the specialist literature uses it. Багра speaks consistent,
natural Bulgarian. This replaces both rc68 choices — „мордант" in compact labels and „закрепващо
средство" in prose — with one word.

| English | Български |
|---|---|
| mordant | закрепител |
| mordanting | обработка със закрепител |
| mordanted | със закрепител · обработен/-а/-о/-и със закрепител, by grammatical context |
| mordant bath | баня със закрепител |
| without mordant | без закрепител |

- The glossary term is **„Закрепител (мордант)"**, with the meaning explained.
- In specialist reference prose „мордант" is allowed **only as an explanation of the Bulgarian
  term**, in brackets after it.
- In a specific recipe, the substance is named rather than the class: „Обработка с алуминиев
  ацетат", „Обработка със стипца".
- „Фиксиране" and „фиксатор" are not substitutes: they name other processes.
- Internal identifiers and the English terminology do not change.

The standard, with forms and the words not used, is `docs/TERMINOLOGY_BG_EN.md`.

### Applied

34 dictionary strings, 12 vocabulary labels and one description, 15 edits in 10 glossary terms, five
recipe names — each rewritten for its own grammar, none by global replacement. The full before and
after is `docs/language/rc69-text-changes.md`. The places that decide agreement: the box is „със
закрепител" (a state, no agreement); „{name}: обработка със закрепител преди {n} дни" uses the noun
because {name} may be masculine, feminine or a label; a piece split from a batch is „изпрано,
обработено със закрепител", agreeing with „парче".

**Recipe names are labels** and were corrected now; the rest of the recipe prose waits for step 5.

### The guard

`scripts/try-language.mjs` reads the interface dictionary, the vocabulary and every glossary term and
definition, and fails on:

- **`term.mordantInInterface`** — any form of „мордант" (морданта, мордантът, морданти, мордантен,
  мордантиран, мордансиран) that is not inside brackets straight after a form of „закрепител";
- **`term.retiredInInterface`** — „закрепващо средство" or „байцване" in the same places.

Search aliases are plain strings and are not read, so „мордант" still finds the term. Reference prose
is ratcheted: **204** findings of `seed.mordantInProse` and **3** of `seed.retiredTermInProse` are
listed by record and corrected in steps 3 to 5.

**Seen failing:** a filter label back to „без мордант"; the box back to „мордантиран"; the glossary
term as plain „Мордант"; „закрепващо средство" returned to a label; brackets the wrong way round —
„Сила на морданта (закрепител)". **Seen passing** on the allowed form „без закрепител (мордант)".

### Phone width

19 affected screens in Bulgarian at 360 and 390 px — the home screen with a cloth in the box, the cloth
record, the work list, the new-work form, the batch screen, the reference ask form, the records list, a
reference record, the substance list and a mordant substance, recipes, two recipe records, chains,
the library and glossary, techniques and tools: 132 elements drawing „закрепител", **no sideways
overflow, and no standalone „мордант" in any label, header, option, chip, button or heading.** The
release gate's own screen layer measures its 34 views at four widths on top of that.

### Data fingerprint

Two entries moved, each shown before acceptance: the glossary term `mordant` (aliases: „закрепващо
средство" out, „закрепител" and „мордант" in) and the manifest (glossary 0.2.2, recipes 0.16.1).
Recipe names are pairs, so no recipe figure, code or shape moved.

---

## 13ek. The language package, step 3: the plants (1.0.0-rc70)

The full before-and-after is `docs/language/rc70-plants.md`; the claims marked for the scientific audit
are `docs/language/science-audit-flags.md`.

**The interim dye-class wording** is the owner's text, word for word. „Трайно" / *lastingly*, which rc68
had introduced, is gone from the hint and from the glossary definition. No claim about fastness was
added anywhere; the existing ones are marked for the audit.

**296 English fields filled** — 132 colour names, 132 colour conditions, 27 harvest notes, 5 toxicity
notes — from a table reviewed entry by entry, reusing an existing English rendering where the same
Bulgarian was already translated on another plant. English follows the pack's established style
(„leaves, aluminium mordant", „a stronger bath").

**Bulgarian corrected in 168 fields.** 117 fields of „мордант" in the plant prose, rewritten to the
§13ej standard by grammatical pattern and read back; „екстракция" to „извличане" (and „извлек" where an
extract is meant), with the adjective agreeing; three loanwords. **„Вана" is kept for the indigo vat**:
„редукционна вана" is the established term and names a different thing from a bath.

**The existing English reviewed.** Every description and every „How it behaves", „Dye constituent" and
„Dye qualities" section of all 57 plants was read, and the rest checked by rule — British spelling,
quotation marks, attributive hyphens, sentence and line parity with the Bulgarian, length ratio, and
template sentences on the wrong kind of plant. The prose was found sound; 73 fields were edited:

- **„Parts used" (57) had never been translated.** Its English was generated from the part codes and
  disagreed with the Bulgarian („hull" for onion skins, a hull on apple the Bulgarian does not name, a
  lost note on alder buckthorn). It is now a translation of the Bulgarian. The disagreements between
  the Bulgarian and the part list are not resolved here: they are data, and they are marked.
- Colloquial calques of the Bulgarian („the bath wants to stand", „the berries do not like a long
  boil", „schema", „the colour is born from the air"), attributive hyphens, „sulfur" → „sulphur",
  Bulgarian quotation marks.

**Not read line by line:** the „Harvest and processing" sections, which are largely formulaic and were
checked by rule only — that is how the template sentence „For flowering herbs…" was found on eight plants
whose dye part is a leaf or a root. The „Sources" sections are citations and are not edited.

**Marked for the scientific audit, not corrected:** woad's „above 55 °C it is spoiled" against its
recorded ceiling of 85 °C; three toxicity statements; part lists that disagree with the plant's own
prose (apple, safflower, brazilwood, cutch); fastness claims without a rating; a dose figure in prose.

**No data moved.** The fingerprint of every plant record is unchanged — only the text of `{bg, en}`
pairs was edited. The manifest moved with the pack versions (plants 0.12.2, glossary 0.2.3).

**What the guards say now.** File check: 403 known, down from 820 — the plants have no untranslated field,
no „мордант" and no Bulgarian quotation mark left. English screens: 351 lines, down from 518. The 58 left
on plant screens are the combination notes drawn on a plant — mixed-language text such as „Bramble leaves
са тествани върху вълна" — which is step 4.

**A deep-check failure that did not repeat — recorded, not rerun away.** The first release run of rc70
failed twice in `deep-check.mjs`: `match: a pH-modified bath found no record (alkaline=undefined)`, caused
by `TypeError: Cannot set properties of null (setting 'title')` in `readWork` (`modules/trials.js`),
reached from the `[data-save]` click. Three runs of deep-check alone and a second full release run passed.
`readWork` writes into `draft`; the harness calls `trialsMod.reset?.()`, changes the address and clicks
Save after `settle()`, so the likely cause is a click that lands before the module has rebuilt `draft`
— a race in the harness rather than in the screen, but that is a hypothesis, not a finding. It is the
second intermittent failure in this harness (the first was `stages`, noted at rc66) and it touches no
text this step changed. ROADMAP A7 carries it.

---

## 13el. The language package, step 4: the combinations (1.0.0-rc71)

Before and after: `docs/language/rc71-combinations.md`. Claims marked: `docs/language/science-audit-flags.md`.

**The 121 notes, classified and acted on** (DECISIONS §12a): 47 real notes translated; 23 condition labels
that add to the key translated; 12 trimmed of the words that only restated the key; 39 emptied because they
said nothing the key does not — „алуминиев мордант" on an alum record, „от кора" on a bark record. A label
with several „ | " conditions was left whole whenever trimming would have emptied a segment, so the order
still lines up with the colours. Three notes carried an import-workbook remark about a spreadsheet column;
it is gone from the data and kept in the changes document.

**307 English fields filled** — 135 expected colours, 121 notes (82 now non-empty), 37 influences, 14
variations. Colours reuse the plant pack's English where the Bulgarian matches.

**Bulgarian corrected.** No „мордант" left in any combination; the three „Байц" went with the workbook remark.
The influences had English inside Bulgarian sentences („Bramble leaves са тествани", „alum-мордантирана
вълна", „post-mordanting") and were rewritten in Bulgarian. „Ватът" became „ваната".

**Existing English edited** where it did not match its Bulgarian: „olive" for „маслинено зелено", a missing
„palette", „toward" → „towards", „holds" → „binds".

**No data moved.** The fingerprint of all 163 records is unchanged. The manifest moved with the pack
(combinations 0.9.1).

**Guards.** File check: 50 known, down from 403, and none in the combinations. English screens: **6 lines
left, down from 351** — all of them source names and one author's name, which wait on DECISIONS §20.

---

## 13em. The language package, step 5: the last packs, and bilingual source names (1.0.0-rc72)

Every change: `docs/language/rc72-final.md`. Claims marked: `docs/language/science-audit-flags.md`.

**The last 50 findings are fixed** — 44 places of „мордант" in recipes, substances, techniques and
sources rewritten sentence by sentence, four Bulgarian quotation marks in English, two „адјективно".
Both known lists are empty: the file check has **0 findings** and the English screen scan **0 lines of
Bulgarian** over 321 screens. **From rc72 the release gate runs both strictly**, so a language fault
can no longer be listed and shipped.

**Editorial review.** Recipes, substances, techniques and source notes were read in both languages.
Corrections: „Гram" (Latin letters inside a Cyrillic word — a new check, `seed.mixedScriptWord`, now
catches that class and was seen failing on rc71), „тривхидрат", „каца" → „вана", „очистване" →
„изпиране", „екстракция" → „извличане"; calques in English („wants", „any powder is breathed"),
„an inch or two" where the Bulgarian says 2–5 cm, „Well, rain or distilled" where it says spring
water, American spellings; a spec reference („§13dn") that had reached a substance's text on screen;
23 source notes that described how the register was imported rather than the source.

**Source names and authors are `{bg, en}`** (owner's decision). No migration: every reader takes a
plain string or a pair through `text()`, so a person's own sources, restored archives, and the seeded
sources of an installed copy — which Sources cannot update — keep working as they are. The editor
opens a string as the same text in both languages and writes a pair only on save. **Seen:** a
string-named source listed and opened in both languages, saved with an English name added, stored as a
pair with nothing lost; the three older archives restored with their string-named sources (rc45 and
rc56 whole; rc6 only the known §19 fault).

The owner's names: „Практиката на ателието" / „Crafty Place studio practice"; „Еко принт библиотека —
преглед на 25 растения" / „Eco-print reference: a review of 25 plants"; author „Цветелина Ковачева" /
„Tsvetelina Kovacheva". Published titles stay as published in both languages — six carry American
spelling and are documented exceptions. **Names written for the register** („Tagetes erecta on
cotton") were descriptive and are now translated. The guide's English name is „NATURALNI BAGRILA
[Natural Dyes] — guide": the title transliterated, so the English screen carries no Cyrillic.

**Data.** Recipes, substances and techniques: fingerprint unchanged. Sources: all 57 moved, and only
in the shape of `name` and `author` — checked field by field before acceptance.

**Found and not fixed (outside language):** the glossary's source line maps sources by `s.code`, which
is empty on seeded sources (§13ea), so a glossary term never shows its source. The reader now uses
`text()`; the lookup key is untouched.

**A check that assumed the old shape.** The first release run of rc72 failed in `deep-check.mjs`
(`source-list`): it compared the screen against `String(source.name)`, which for a pair is „[object
Object]". It now reads the name through `text()`, as the screens do, and was seen failing again when
the substance reader was put back to printing the raw field.

---

## 13en. Scientific audit, package 1: safety and chemical correctness (1.0.0-rc73)

A bounded package of corrections after an independent preliminary review. Every change and its source:
`docs/science/rc73-package-1.md`. **Only confirmed errors and unsupported categorical claims were changed;
no figure, identifier or structure moved** — the data fingerprint of every record is unchanged.

- **Cream of tartar.** The alum record's Bulgarian said tartaric acid, its English cream of tartar; the
  practice sources pair alum with cream of tartar, and the library's own `cream_of_tartar` record says so.
  Bulgarian corrected to „винен камък (калиев хидроген тартарат)". No other occurrence exists: the other
  „винено" in the library is a colour.
- **Metal-salt waste.** The iron recipe's permission to pour the used bath down the drain is gone; iron and
  copper now say to collect spent solutions separately and follow local requirements and the product's SDS.
  Titanium and aluminium records carry no disposal statement, so nothing contradicts this.
- **Iron concentration.** Categorical „above 2% WOF it embrittles" and „it tears a year later" replaced by a
  conditional statement. The numbers stay; the disagreement is DECISIONS §22.
- **Soy milk** is described as a protein binder, not a metal mordant; the universal claims about fastness
  and safety with children are removed. Its category was already `binder`, so no calculator is affected.
- **Madder, henna, tansy** safety notes corrected: lucidin's genotoxicity and precautions for powder and
  extracts; henna's documented cases are skin application, not washed textiles; tansy's thujone and contact
  dermatitis, with „the leaves are not a problem in eco print" removed.
- **Madder fermentation:** boiling is no longer called sterilisation, and a mouldy ferment is discarded, not
  scraped and continued. Withdrawal of the recipe is proposed, not done (§23).
- **Oat or bran bath:** the bonding mechanism replaced by what the bath is used for; the storage attributed to
  the recipe (§24). **Woad:** documented with a proposal (§21).

**Reaching installed copies.** Checked in a real browser: rc72 installed and seeded in a profile, a personal
note written on copper sulfate, then rc73 opened over it with the old service worker gone. The library offers
the update for every corrected record — 3 plants, 6 recipes, 4 substances, 1 technique — and lists copper
sulfate separately as edited by the person, so her note is not overwritten. Nothing is applied until she
accepts it.

---

## 13eo. Scientific audit, package 1: the owner's decisions applied (1.0.0-rc74)

Before and after: `docs/science/rc74-refinements.md`.

- **Soy milk.** The universal claim of lower lightfastness is gone from the substance and the recipe; what
  stays is that washfastness may be limited (Botanical Colors: not washfast enough alone for washable items).
- **Woad.** The leaf part's `tempDyeC` is 45–50 °C and `softMaxTempC` 55 °C for the vat method the prose
  describes; `tempExtractC` stays 70–80 °C. **Seen on a phone (390 px) on a fresh install:** the *use now*
  tiles read 70–80 °C · 45–50 °C · 55 °C for both the fresh and the dried leaf, and nothing overflows.
- **Iron.** `maxPercentWof` stays 2. The recipe `iron-bath-dark` keeps its published 1–2.5% and now says, in
  the ingredient line and the notes, that 2.5% is over the library's conservative 2% and that wool and silk
  should stay at or below it. **The calculator:** `recipeWarnings` returns `over_max_wof` (limit 2, value 2.5)
  for this recipe — checked directly. That warning is drawn in the recipe editor's preview, on the batch screen
  and on a trial's step. **It is not drawn on the recipe's read view**, which is where a person follows the
  recipe at the pot; there the warning is the text of the ingredient line. Not changed — raised.
- **The madder fermentation recipe is withdrawn** from the pack (recipes 0.17.0) through the existing path: a
  record the pack no longer carries is offered for removal in the library update. The record is kept whole in
  `archive/withdrawn/`. Two checks that used it were moved to a recipe still in the pack.
- **A fault in that path, fixed.** A withdrawal removed the record with `removeSystem`, which bypasses the
  delete policy (§13cq): a person who had made a pigment batch by this recipe and accepted the update would
  have lost the recipe her batch points at. Now a withdrawn record that her records reference is counted in
  the diff, shown as „kept — your records using it: n", left unticked with its box disabled, and **refused
  again at the moment of removal** whatever was ticked. **And a gap under it:** `refs.js` did not count
  pigment batches as references to a recipe or chain at all — not `viaId`, not `linesFrom`, not a swatch's
  recipe — so a lake recipe could also be deleted from under a batch. All three are counted now.
  **Seen in a browser:** rc73 installed, then rc74 over it — with a batch made by the recipe, the withdrawal is
  offered unticked with `inUse: 1` and a forced removal leaves the recipe and the batch in place; with no work
  using it, it is ticked and removed. A fresh rc74 install does not have the recipe.
- **Oat or bran bath.** The three-day period is gone; reuse is described as not guaranteed safe, with the
  signs to discard.

The data fingerprint moved in exactly four entries, each shown before acceptance: the manifest, woad's part,
the withdrawn recipe, and the recipe pack's order.

---

## 13ep. Ceilings on the read view, and a permanent check for withdrawals (1.0.0-rc75)

**The recipe's read view draws `recipeWarnings()`** inside the weigh box, directly under the calculated
quantities — the same function and the same texts as the editor's preview, the batch screen and a trial
step. The iron bath reads „Железен сулфат: 2.5% надхвърля тавана от 2%." A recipe inside its ceilings draws
no block. At 360 px the warning sits inside the screen and nothing overflows. No data changed.

**A withdrawn record kept because her work uses it** now says so on its own read view: „The library no
longer carries this record. It stays in your copy because your records use it (n), and the update will not
remove it." Before, it said the update would offer to remove it, which for this record is untrue.

**`scripts/try-withdrawal-in-use.mjs`**, in the release gate. In a real browser, with the withdrawn madder
fermentation recipe put back from `archive/withdrawn/` as an installed seeded record: a pigment batch that
uses it — by `viaId`, by `linesFrom`, or by a swatch — makes it count as in use, unticked, with a disabled
box in the preview and the note above on the record; a removal forced through `applyDiff` leaves the recipe
and the batch. With no work using it, it is ticked, and leaving it ticked and pressing Apply removes it and
nothing else (16 → 15 recipes). The iron bath's read-view warning is held in the same script.

**Seen failing** on three broken copies: the removal guard and the default tick taken out; pigment batches
not counted as references; the read-view warning not drawn.

---

## 13eq. Scientific audit, package 2: plant parts, dye properties and fastness (1.0.0-rc76)

Before and after, with sources: `docs/science/rc76-package-2.md`. Open questions: DECISIONS §25.

**Four plant parts removed** — apple `hull`, safflower `leaf`, brazilwood `bark`, cutch `bark`. Each carried
dosing, temperatures and harvest months, and none has a source as a dye part: catechu comes from the heartwood
(and leaves, pods, twigs — CAMEO), brazilwood's dye from the heartwood (CAMEO; Oxford), safflower's from the
florets, and the apple's own prose names leaves and bark. **Before removing:** nothing in the shipped
combinations or recipes points at any of the four; the parts are kept whole in `archive/withdrawn/`. **After,
in a real browser:** rc75 installed with a trial placement on apple `hull`, updated to rc76 — the library
offers the corrected plants, the apple keeps `leaf` and `bark`, and the trial keeps its `hull` placement and
opens without error, because a trial's part selector is the whole vocabulary, not the plant's list. `hull`
itself is unchanged: seven plants use it as a general outer covering (onion skins, walnut hulls, pomegranate
rind, chestnut and hazel husks, avocado peel).

**Claims corrected:** the „flowering herbs" harvest template removed from geranium, eucalyptus and henna;
eucalyptus prints from both sides „in practice", without the unsourced cause; the cotinus superlative;
avocado and iron scoped to the one study that reports better lightfastness (Üren 2022), not stated as a rule.

**Checked and kept:** cutch's durable browns and brazilwood's weaker lightfastness (CAMEO); avocado seed and
peel as dye parts (Üren 2022). No fastness rating was changed.

---

## 13er. Scientific package 2, refinements (1.0.0-rc77)

- **Unsourced fastness ratings** on walnut, cutch, pomegranate and eucalyptus are marked with the existing
  confidence `unverified`. The rating is unchanged. **The plant screen now shows it**: a rating whose confidence
  is `unverified` reads „отлична · нуждае се от тест" — the confidence was drawn only in the editor, so an
  unsourced rating looked like a measured one. Seen at 1280 and 390 px; a rating without the mark (madder)
  reads as before.
- **Glossary, substantive and adjective dyes:** one definition in both languages. Indigo is described
  separately as a vat dye; the claims that most plant dyes are adjective and that adjective dyes are often
  more lasting are gone; the terms describe how a dye binds, not its quality or fastness.
- **Sumac:** the 10–20% dose removed from the prose, kept in the scientific register.
- **Brazilwood:** `tannin: high` kept; a labelling is proposed, not applied (register, DECISIONS §25.4).

**Reaching installed copies.** rc76 installed, rc77 over it: the library offers walnut, pomegranate, sumac,
cutch and eucalyptus. **The glossary change does not reach an installed copy**: the glossary is one of the two
packs with no update button (`UNREACHABLE_PACKS`, DECISIONS §19). A fresh install has it.

---

## 13es. Scientific audit, closing package: sappanwood's id, and four corrections (1.0.0-rc78)

Before and after, with sources: `docs/science/rc78-closing.md`. Supersedes the earlier decision to keep the code
`paubrasilia_echinata` for sappanwood.

**Sappanwood takes its own id**, `seed:biancaea_sappan`, with „Сапаново дърво (източно бразилско дърво)" /
„Sappanwood (Eastern Brazilwood)". **No migration rewrites a person's data**: which wood she used cannot be told
from a record, so her trials, batches, recipes and combinations keep pointing at `seed:paubrasilia_echinata`.
The old seeded plant and combination go through the withdrawal path (§13eo): kept while anything of hers uses
them, with the note that says so, and offered for removal when nothing does. Archives restore with the old records
and the new one beside them. The old photograph file stays, because a kept record's `photoSrc` names it.

**Seen, on a real rc77 install** with a pigment batch on the old id, updated to rc78: the new plant is added, the
old one is withdrawn with `inUse: 2` and unticked, the batch still names the old id, and an rc77 backup restored
into rc78 brings both. **Held by `scripts/try-plant-id-change.mjs`** in the release gate — fresh install, in use
(forced removal refused, nothing reclassified, the kept record's note), and not in use (combination then plant
removed, the new records untouched); seen failing without the in-use guard.

**Chemistry:** the heartwood's `tannin: high` had no source and is now `levelUnknown`; the plant's chemistry
confidence is `unverified`. Two deep-check guards were written before either marking was in use and were
corrected: a tannin entry marked `levelUnknown` is a finding, not silence; the hot madder recipe's alum is „разтвор
на стипца".

**Corrections:** chalk is a suspension and the hot madder recipe is marked incomplete (withdrawal proposed,
DECISIONS §26); titanium oxalate's 70 °C is a conservative limit, not a chemical one; the watercolour binder no
longer promises that clove oil alone preserves it or that it keeps two months.

**Closing review:** the one concrete contradiction left is titanium oxalate's 2% WOF against the 8–10% its
suppliers give (DECISIONS §27).

---

## 13et. Scientific audit closed: three last refinements (1.0.0-rc79)

Before and after: `docs/science/rc79-final-notes.md`.

- **Titanium oxalate** keeps `standardPercentWof: 2`. Its safety note now says, in both languages, that the 2%
  follows one source (Natural Dye Store, *Mordants: an overview*, already in the register) and is not a universal
  standard dose, and gives the figures other suppliers publish: 1–5% (Blotz), 8–10% (Maiwa), 5–15% (Wild Colours).
  No number and no calculator changed.
- **`madder-lake-hot` is withdrawn** from the pack (recipes 0.18.0) through the existing path and archived whole.
  **Seen on an installed rc78:** with a pigment batch made by it, the withdrawal is offered unticked with
  `inUse: 1` and the recipe stays; with nothing using it, it is ticked and removed, 15 → 14 recipes, and the
  library also offers the corrected titanium record and sappanwood.
- **Sappanwood's sources:** the Kew link that could not be resolved to this species is replaced by POWO's record
  for *Caesalpinia sappan* L., a synonym of *Biancaea sappan* (482900-1). Identity, id and migration untouched.

**Two checks were rewritten rather than weakened.** `try-pack-field-labels` pruned the names of six recipe fields
the moment the pack stopped carrying the only row that used them — which would have printed `tempMaxC` on the
recipe a person keeps; archived withdrawn records now count as carrying their fields. The weigh-list check
(§13dx) and the absolute-quantity case in deep-check exist for that recipe's own words, so they load it from
`archive/withdrawn/` for the length of the check. `try-withdrawal-in-use` uses `compound-mordant-bright` as its
no-warning recipe, and `try-recipe-lines-named` keeps its excused line as a comment.


## 13eu. Attribution audit, package 1: eight recipes and their sources (1.0.0-rc80)

> **Superseded in part at rc118 by §13fs.** The recipes no longer credit the books this section
> names — they credit the studio's practice, and the books stay in the Library. Recipes named
> here that left the distributed library are the owner's own.

Stage 3 of the 1.0 audit — provenance, sources, and whether the texts stand on their own. Scope fixed by
the owner: the three Cliffe print pastes, the five Kelly recipes, and the register entries they cite.
Before and after: `docs/attribution/rc80-eight-recipes.md`.

### Four things kept apart

The comparison of Kelly, Cliffe, Maiwa and Boutrup & Ellis found the same aluminium-acetate, fixing-bath and
paste formulas in several publications with the same or close figures. That settles nothing about who first
wrote them. Bagra therefore separates:

- **a source of information** — a publication the library drew on; this is what `sourceCodes` lists (§13ea);
- **the version used** — the publication the chosen figures come from;
- **authorship of a formula** — stated only where established, and never inferred from a book's author;
- **Bagra's text** — written in the library's own words.

A recipe may have several sources and needs no „principal author". Recalculating or editing a formula does
not make it Crafty Place's.

### Garcia and Kelly

Kelly states that her compound mordant adapts a formula of Michel Garcia's, with soda ash in place of calcium
hydroxide. Garcia's own formula was not examined. So `michel-garcia` **leaves `sourceCodes`** on
`compound-mordant-bright`, `compound-mordant-dark` and `oatmeal-fixing-bath`: Bagra did not draw on him, and
a code in that list says it did. The statement is carried in the recipe's own words, marked as Kelly's —
where §13ea already said this relationship belongs. The bath says only that it is Kelly's, as part of the
same procedure; whether her attribution covers the bath is not known here, and nothing is claimed.

This revises §13ec, where the rc61 records credited Garcia by code. **His register entry stays**: the register
thanks the people the library rests on, and §13.1 names his 1-2-3 vat. Its note no longer says „the compound
mordant here is his recipe".

### What changed

Recipes pack 0.18.1, sources pack 14. No quantity, range, unit, role, substance, step id, follow-on or
`distributable` moved; `scripts/attribution-stage3.py` asserts that and refuses to write otherwise.

- **Dye paste without a mordant (Cliffe 6.2).** A clear ground is a result that depends on the dye, the cloth
  and its preparation, not a promise. The two-week keeping time is Cliffe's figure, said to be hers and not a
  verified guarantee.
- **Ready-to-use paste (6.4).** The passage on how much extract to use, which followed the book's exposition,
  rewritten; 1–10% kept.
- **Mordant paste (6.5).** Cliffe and Maiwa both kept — the same 20 g alum, 10 g soda ash, 200 ml vinegar and
  2 g guar gum, and the mixing warnings are Maiwa's. Two English steps rephrased; „calcium carbonate bath"
  made „chalk bath" as in the other paste.
- **Kelly's five.** Provenance sentences on the two mordants and the bath; one idiom in the iron bath and one
  doubled verb in the soy bath rephrased. The rc73–rc79 corrections — iron limits and disposal, the soy milk
  wording, the removed claims about the bath — untouched.
- **The register.** Kelly: publisher and year, and her attribution to Garcia as hers. Cliffe: the three
  method numbers. Crafty Place studio practice: no longer says every formula was checked by hand — practical
  notes and adaptations, with published sources listed separately where a formula comes from one.

Short standard steps — dissolve, stir, rinse — were not rewritten for the sake of it. The wording was judged
without the source pages at hand; the owner, who has them, is the check on what closeness remains.

### What this does NOT do

- **`distributable`.** Three of the eight — the three pastes — carry no value, which the pack reads as `true`
  (the default, §13.1). Nothing was set: editing a text or citing a source is not a decision to distribute.
  The two pastel binders are the same case and outside this package. DECISIONS §28.
- **Boutrup & Ellis** are linked to no recipe: nothing in this package ties a particular recipe to their book
  closely enough to cite it.
- **Installed copies keep the old register notes.** Sources is one of the two packs with no update path
  (DECISIONS §19, B6d), so the corrected Garcia and studio-practice notes reach new installs only. The recipes
  pack does update.

### The guards

No new layer: the language layer's data fingerprint already holds the data still. It failed on exactly three
recipes — the ones whose `sourceCodes` changed — and on the manifest, and was accepted for those four. The
manifest check (`try-manifest-agrees`) caught the pack versions raised without the manifest, as built. The
edit script was seen refusing both a second run and a quantity changed alongside the text.

## 13ev. Attribution audit, closing package: the six remaining recipes (1.0.0-rc81)

> **Superseded in part at rc118 by §13fs.** The recipes no longer credit the books this section
> names — they credit the studio's practice, and the books stay in the Library. Recipes named
> here that left the distributed library are the owner's own.

Stage 3 closes. Same four-way distinction as §13eu — source, version used, authorship, Bagra's text — applied
to the pigment, watercolour and pastel recipes. Before and after: `docs/attribution/rc81-six-recipes.md`.
Recipes pack 0.18.2, sources pack 14 → 15. No quantity, range, unit, role, source code, step, follow-on or
`distributable` moved; `scripts/attribution-stage3b.py` asserts it. No source page was consulted in this
package, and no comparison with one is claimed.

### What changed

- **`pigment-lake-master`** — nothing. Stopka is credited for the table and nowhere as the inventor of lakes.
- **`pastels-from-pigment`** — contradicted itself: more filler made the pastel SOFTER in the filler's note and
  HARDER in the recipe's. Neither was sourced, so both lose the hardness claim, and „crumbly" for pure pigment
  goes with them. Paler with more filler stays. The ratio stays deliberately empty.
- **`pastel-binder-oat`** — „Stopka's binder" becomes an oat binder after a formula presented by Stopka.
- **`watercolour-from-pigment`** — the English said a couple of teaspoons, the Bulgarian several; aligned.
- **`watercolour-binder`** — three absolutes made accurate: the formula is for powdered gum because liquid gum
  has another concentration, not because liquid gum „does not work"; honey and glycerine usually help, by an
  amount that depends on pigment and quantity. **Thinning with alcohol removed** — advice no source in the
  record supports. The rc74/rc78 corrections on clove oil and storage untouched.
- **`pastel-binder-gum`** — named as practical guidance, not a precise recipe; no concentration invented.
- **Deferred from §13eu:** „варова баня" (a lime bath) becomes „баня с креда (калциев карбонат)" in the two
  paste steps; Garcia's register note loses the unsourced sentence about his influence and keeps Kelly's
  attribution. Stopka's note loses „more scientific than most"; Green's loses a claim — „a second voice that
  makes a step surer" — that describes a comparison the library does not make.

### What an installed copy is offered

Measured with `diffPack` against a database seeded from rc79 and from rc80. From rc79: 13 recipes and 6 register
entries differ; from rc80: 7 and 3. **Only the recipes can arrive** — Sources has no update button (DECISIONS §19,
B6d), so the register corrections of both packages reach new installs only.

### Not decided

`distributable` on five records, the oat substance's name, and three smaller questions — DECISIONS §29.

## 13ew. Attribution audit: the owner's decisions, and five recipes for approval (1.0.0-rc82)

> **Superseded in part at rc118 by §13fs.** The recipes no longer credit the books this section
> names — they credit the studio's practice, and the books stay in the Library. Recipes named
> here that left the distributed library are the owner's own.

Recipes pack 0.18.3, substances 0.7.6. `scripts/attribution-stage3c.py`, run once from the rc81 data; it refuses a
second run and any change to a figure, step, follow-on or `distributable`.

### What changed

- **`watercolour-binder`** — the owner has made this formula with changes of her own that are not written down.
  Until they are, the studio's code comes off: a code says the studio stands behind the version shown, and the
  version shown is Green's. Green stays. Nothing in the record was a documented studio note; the text is
  unchanged. What would put the code back is in DECISIONS §30b.
- **`pastel-binder-gum`** — not tried in the studio (owner, 18 September 2026). The studio's code was the only
  thing presenting it as the studio's, and comes off; the list is now empty, which §13dl makes a finished state.
  „Practical guidance" becomes „general guidance", and the note says it is untried. No source added, no figure.
- **`pastel-binder-oat`** — which form of oat Stopka means is marked unconfirmed, on this recipe only; its English
  says „oats" rather than „groats". `seed:oats` is not touched: for Kelly's bath, oatmeal or bran, the Bulgarian
  name is right (owner).
- **Aluminium acetate's note** — „варова баня" becomes „баня с креда (калциев карбонат)".

### The guard that moved

`source-list` in `deep-check` held the two-source recipe screen at the watercolour binder, and failed the moment
the binder credited one. It now reads the mordant paste — Cliffe and Maiwa — which is the same claim on a recipe
that still makes it. Seen failing before the move, passing after, and failing again with Maiwa taken off the
paste.

### What `distributable` controls — measured, not assumed

Nothing that ships. There is no pack builder in 1.0 (pack export is B5). The published pack IS `seed/*.json` in
the release ZIP, and every row in it reaches every installation whatever the field says. The field is read in
two places: the recipe screen marks a record whose value is `false`, and the editor offers the opt-out. A row
with no value is stored as `true` (`PACKS.recipes.defaults`, and techniques the same). So „not set" already means
„published", and so would `false`. The safe control is therefore at the release, not in the app — proposed in
DECISIONS §30a and not built, because today it would fail on exactly the five records the owner is reading.

### For the owner

`docs/attribution/rc82-five-for-approval.md` — the five recipes in both languages, generated from the seed by
`scripts/export-approval.py`, so it cannot drift from the data. Regenerate it after any correction.

## 13ex. Stage 3 closed: the marker, and four recipes approved (1.0.0-rc83)

> **Superseded in part at rc118 by §13fs.** The recipes no longer credit the books this section
> names — they credit the studio's practice, and the books stay in the Library. Recipes named
> here that left the distributed library are the owner's own.

Recipes pack 0.18.4, `scripts/attribution-stage3d.py`. Targeted checks only, by the owner's instruction — not a
full release run.

- **The marker in `mordant-print-paste`** is optional and tried first on a scrap of the same cloth; the note no
  longer promises its colour washes out, which depends on the dye and the cloth. The `print-pastes` block of
  `deep-check` required that promise; it now requires „По избор" and refuses „не остава в плата". Seen failing on
  the new text before the change, passing after, and failing with the old promise put back.
- **`distributable: true`, explicitly**, on the four the owner approved: the three pastes and the oat binder.
- **The oat binder's English line still reads „Oat groats".** An option's name is always its substance's name
  (`nameOfOption` in `modules/recipes.js`); there is no local label. The recipe's own note and steps already say
  „oats". Changing what the line shows means renaming `seed:oats`, which the owner has kept global.
- **`pastel-binder-gum` is not approved and stays in the seed** — see DECISIONS §31. `pastels-from-pigment`,
  approved and published, names it as one of its two binders (option `past-b-gum`), so it cannot leave the seed
  without editing that recipe, which this task excluded. No check catches that link:
  `try-referential-integrity` passed with the gum binder removed, because it guards her records, not options
  between seeded recipes.

## 13ey. `pastel-binder-gum` withdrawn from the published pack (1.0.0-rc84)

Approved by the owner under DECISIONS §31. Recipes pack 0.18.5, thirteen recipes, every one `distributable: true`.
Option `past-b-gum` removed from `pastels-from-pigment` (the oat binder stays); the record moved whole, id and
content, to `archive/withdrawn/recipes-pastel-binder-gum.json`, which says how to restore both; its excused line
in `try-recipe-lines-named` removed. Nothing else changed.

Checked, targeted: no `recipeId` option or follow-on in the seed points outside it. From an installed rc83: the
pastel recipe's change is offered; the gum binder's withdrawal is offered UNTICKED while anything points at it —
her batch, or, on the first update, the not-yet-updated pastel recipe — and her records and her own recipes are
kept. With nothing of hers pointing at it, the second update offers it ticked.

## 13ez. Recipe categories and „утаен пигмент" (1.0.0-rc85)

- **`ecoprint` and `blanket` are no longer offered** as recipe categories — neither as list tabs nor in the editor
  (`TYPES` in `modules/recipes.js`, and `typeOptions`). No shipped recipe used either. Their terms stay in `vocab.js`
  so a recipe of hers carrying one keeps its name, keeps its type through an untouched save, and a blanket recipe
  keeps its panel; no migration. Checked in jsdom with her own recipe of each kind.
- **„Лаков пигмент" → „Утаен пигмент"** in Bulgarian: the recipe `pigment-lake-master`, the glossary term and the
  WOA definition, Stopka's register note. English „lake pigment", codes and data unchanged; „лак" and „лаков" stay
  as glossary search aliases, so the old name still finds the term. Glossary and Sources have no update path
  (DECISIONS §19): installed copies get the recipe's new name, new installs get all three.
- **Not done: the paste category.** DECISIONS §32.

## 13fa. Sources and Glossary can be updated from the Library (1.0.0-rc87)

DECISIONS §19. The Library's Sources and Glossary tabs carry „Обнови от библиотеката" with its count, and open the
same preview as every other pack (`diffPack` / `applyDiff`, `seed-ui.js`); nothing is applied without her choice.
`UNREACHABLE_PACKS` is empty. Three things the change needed: saving a source now calls `markEdited`, which it never
had to while nothing could update a source — without it her correction to a seeded source would arrive ticked and be
overwritten; a glossary term is named by `term` in the preview; and the two packs' fields are named in both
languages (`FIELD_LABELS`, five `seed.field.*` keys). A stored `kind: "website"` reads as `site` on screen and in the
editor, and becomes `site` only when she saves that source; nothing is migrated.

Checked on a database seeded from rc79, with a source of her own and a seeded source corrected through the form:
both tabs offer the rc86 corrections (glossary 2, sources 5), applying shows them, her corrected source is offered
unticked and survives, her own source is untouched and reads „сайт". Restoring an archive of the old state puts
the update on offer again. `try-pack-reachability` and `try-pack-field-labels` pass with no exemption. Without
`markEdited` the check fails three ways.

## 13fb. A work records the preparation it used (1.0.0-rc95)

Owner's decision, variant B. Which preparation belongs to a work is RECORDED, never worked out from dates.

- **`trial.prepActionIds`** — ids of actions on the cloth. Nothing copied. Absent = not marked; `[]` = none. Chosen
  per cloth by a tick on each line of the work form's preparation card; the first tick creates the list. Ticked
  for her only when the action was written from this work's „Добави подготовка" (the group form sees the work in
  its `returnTo` and appends the ids it wrote).
- **`fabric.inheritedActionIds`** — written once, at a cut: the parent's action ids at that moment, plus what the
  parent had itself inherited. The parent's later actions, however dated, are not inherited. A piece cut before
  rc95 has no such list: its parent's actions are offered as POSSIBLE, with a warning, never ticked for her.
- **The review** („Покажи процеса") shows only the chosen actions, per cloth, with date, action, recipe, the
  batch's weight, deviation and note, and where an inherited one came from. Nothing for a work that marked
  nothing. An id that resolves to nothing is counted and said, kept, never redirected.
- **Deleting a batch** a work names is refused, naming the work — the whole batch, since it is one fact across its
  cloths.
- **Ids.** `migrate-actions` gives an event without an id `evt-<fabric>-<n>`, so no action is unaddressable and no
  two batches share `batch-undefined`; `healActionIds` (migration `actionIds`) does the same, as `act-<fabric>-<n>`,
  for actions migrated before. Existing ids are never touched.

Rules in `fabric-logic.js`: `isPrepAction`, `actionIndex`, `prepCandidates`, `worksUsingActions`.

**Limits.** A choice is by action id, so a parent's action ticked in a work on two pieces cut from it applies to
both. Only the direct parent is offered as possible for an old cut. Deleting a whole cloth that another's
inheritance points at is not guarded here (a cloth with batches is already refused). Checked in Chromium in an
isolated profile, 32 checks; no permanent guard was added to `check.sh` in this package.

## 14a. Editorial redesign, package 1 — the visual foundation (1.1.0-design.1)

> **§14a–§14e were written on `design/editorial-redesign`, a temporary branch off rc98.
> The `1.1.0-design.*` numbers in them identify redesign PACKAGES, not releases of the
> application. All five are merged into 1.0.0-rc99, which is where the work landed; the
> application's line runs rc98 → rc99, towards 1.0.**

Branch `design/editorial-redesign`, from rc98; rc98 itself untouched. The v0 exploration
(„Bagra — Editorial Design Exploration") is authoritative for the look; this
specification stays authoritative for function, data, routes, fields and calculations.
Nothing in the model, IndexedDB, seed data, calculations or the service worker's logic
changed.

**Owner's decisions (21 September 2026).**

- **Colour: Bagra's palette, not the prototype's green.** The prototype's working accent
  was `--leaf` (green) on buttons, active navigation and filters. The fixed rule stands —
  no green anywhere; the interface must not put a colour opinion beside dyed cloth.
  Indigo marks where one is and what is chosen; controls are neutral, the primary action
  **iron** (`#3A3733`) — which also ends primary buttons being indigo, against the rule
  that indigo is navigation and active states only. Colour specimens sit on a neutral
  mat (`--specimen #FBFBF9`, ring `--specimen-line #E7E6E0`), not on the cream surface.
  Neutrals added are derived, not new hues: `--sunk #ECE7DD` (ground toward line).
- **Type: local, with real Bulgarian Cyrillic.** Fraunces and Newsreader, the prototype's
  serifs, ship Latin only (checked in the font packages). **Geist** for working text;
  **Source Serif 4** for headings, the page lede and reading prose — the only candidate
  with Bulgarian letterforms (`locl` BGR), so т, п, в, д take their Bulgarian shapes in
  it. Geist has every Bulgarian letter but not the localised forms. Geist Mono is not
  added; labels are Geist. Files in `fonts/` (latin, latin-ext, cyrillic, cyrillic-ext;
  serif also italic), OFL-1.1 with licences beside them, cached by `sw.js` — the list
  only. Rendering checked in Chrome with `CSS.getPlatformFontsForNode`: every text node in
  BG and EN draws from the intended face, none from a fallback.

**Navigation.** Laptop: two rows. Row 1 — the brand, the three spaces (Home, the
reference, the diary) and a „⋯" menu with the backup, About, language, units and
version. Row 2 — the modules of the space the address is in. Spaces and modules are read
from `NAV`, unchanged; modules without an entry belong to a space by `SPACE_OF_HIDDEN`
(`batch` → diary, `materials` and `packs` → reference). Phone (≤ 820px): a header with the
menu button and the screen's name, and a drawer with every entry in the same groups; it
closes on a choice, on Escape and on any change of address, and stays open while the
language or units change. **The bottom bar is gone** — the prototype's header and drawer
replace it; restoring it is a decision for the owner. No global „+": every „New…" is
already in its page's header.

**Controls and surfaces.** Radii 8px (controls), 14px (cards), 18px (panels, dialogs);
buttons 9×16; fields on the surface with an indigo focus ring. The page is 1280px,
centred, under the bar. The view's focus ring (it takes focus on every screen change) is
no longer drawn on a mouse click.

**Registers.** Serif for reading — page title, lede, `.prose`, botanical names; Geist for
work — controls, tables, recipe steps read over a pot (`.workstep .prose`). `p.sub` only
for the lede: the plant profile's sections are also `.sub` (rc89).

**Checked.** Every space, module and menu entry reachable on the laptop; all 13 drawer
entries at 390 and 320px, each ≥ 44px; 19 screens at 390 and 320px with no horizontal
overflow or overlap; data byte for byte unchanged; `deep-check` and `screen-check` pass.

**Left for later packages.** The reference modules and the diary themselves — cards,
tables, record views, work cards (a work card's name still wraps in a narrow column at
390px, as it did in rc98). Found and not fixed here, for the main line: on an empty
database the home screen says „undefined" sources — the count is read from a tile removed
long ago.

## 14b. Editorial redesign, package 2 — the reference part (1.1.0-design.2)

The reference modules — Reference, Plants, Recipes and chains, Materials, Techniques,
Calculators, Library — in the prototype's visual language. Visual only: every control,
field, filter, calculation, editor, source, warning and link is the one the module
already draws; the Reference stays the search tool by colour and conditions, recipes keep
the working view, scaling and chains. Diary and pigments untouched (package 3).

**Scope.** The router sets `data-module` and `data-space` on `#view` before each draw, and
the package's CSS is scoped to `#view[data-space="reference"]` or to one module. The page
header takes a **kicker** — the space's name, from `nav.group.*`, passed through
`setPageKicker()` in `ui.js` — shown in the reference space only for now.

**What changed on screen.** A kicker and a rule under every reference page header; tables
in a rounded panel with a sunk header row (above 640px — below it a table is stacked
records, §13ae); filter boxes as pills, the chosen one indigo; the tab switch and the
Library's three tabs as segmented pills (44px on a phone); result, colour and technique
cards at 14px radius, technique names in the serif; **the glossary as a definition list**
— the term in the serif beside its definition, in one panel, one column on a phone;
**the calculators as a grid of cards**; the plant's photograph larger, on the specimen mat
inside its figure. On a phone a chain step's line wraps: it ran the chain's working view
past the edge (11px here, 25px in rc98) — the one overflow the package found.

**Headings stay on the scale.** check-scope refused two sizes package 1 had set by hand —
`h2` at 11.5px and the dialog title at 19px. `h2` is back on `--h-section`; the dialog
title and a glossary term's name read `--h-dialog` and `--h-term`, steps in the scale.

**Checked.** Filters, search, rows opening records, recipe scaling (400 g → 800 ml of
vinegar), the recipes/chains switch, a chain's working view, the calculators, the
glossary search and Library tabs, techniques, materials, the Reference answering a changed
condition; BG and EN; 16 reference screens at 390 and 320px with no horizontal overflow;
data byte for byte unchanged; deep-check, screen-check and check-scope pass (check-scope's
UNDECLARED lines are rc98's own).

## 14c. Editorial redesign, package 3 — the diary (1.1.0-design.3)

My work, Fabrics, preparation, group actions, the work form, the result, the history and
their editors and dialogs, in the same visual language. Visual only: the model,
`prepActionIds`, `inheritedActionIds` at a cut, group batches, recipes, photographs, the
history and the delete guards are exactly rc98's. The pigments' model is untouched; that
module takes the shared surfaces and nothing else.

**Scope.** The kicker now shows in the diary too (`data-space="diary"`), and the package's
CSS is scoped to that space or to one module. The header, tables, filter pills, search and
tab switch are the rules package 2 already wrote — extended to the diary rather than
repeated.

**What changed on screen.** Work cards at 14px radius with their title in the serif and a
64px photograph; stage cards with their head on the sunk surface; roomier step lines; the
preparation card's head in the serif; the finishing questions with indigo numbers and
serif questions; the group action's quantities on the sunk surface with indigo step
numbers; a piece's history with more room between events and 48px photographs; on a wide
screen a piece's editor keeps its measure rail beside the fields.

**Tried and reverted.** Dropping a work card's progress line below its name on a phone, so
the name stops wrapping mid-phrase: the compact progress line's own content is wider than a
320px screen, so the card then ran off the edge. The name wraps as it did in rc98; the
line itself wants redrawing, which is more than a visual package.

**Checked.** The real flows in Chromium: a new piece with a photograph → a mordant bath
with its recipe → its history names it → a work started from the piece, its preparation
ticked, two steps with temperature and notes → finished with an assessment and a result
photograph → the result edited, then the steps edited → reload, both kept, the preparation
link kept, the review showing preparation and steps; a group action over two pieces (one
batch, an action of its own on each, and the finished work's own mark beside them); a cut
piece inheriting all three recorded actions by reference while its work is offered only the
two preparations; the delete guard still refusing a piece its history points at; BG and EN;
10 diary screens at 390 and 320px with no horizontal overflow. deep-check, screen-check,
check-scope and the language check pass.

## 14d. Editorial redesign, package 4 — integration and finishing (1.1.0-design.4)

The pigments' surfaces, the screens the exploration never drew, the edge states, Home
beside the two finished spaces, and the phone. Visual only: no model, no calculation, no
behaviour; the pigments keep their own model.

**The work card's progress strip — the one real fault this package found.** A work card is
a grid, and the compact strip is 150px that cannot shrink: in one row with the text it
left the name 68px at 390px and **nothing at all** at 320px. On a phone the strip now
takes a row of its own under the text. Nothing is dropped — every stage still shows — and
the name has 232px at 390px and 162px at 320px, with no overflow. (Package 3 tried this
with flex properties, which a grid ignores, saw the card overflow and reverted; the idea
was right and the mechanism was wrong.)

**What else changed.** The page header's rule reaches every screen, not only the two
spaces. Edge states — empty, and the panels that stand in for them — read as one card with
a dashed edge. Home takes the shared card radius and the serif for a card's name, and its
continue cards go to one column on a phone. Pigments: colours on the neutral mat, the six
stages numbered in indigo, the two columns collapsing at 900px, the context strip on the
surface. About's four sections (За · Помощ · Безопасност · Условия) as the Library's pills,
44px on a phone. The pack preview — the one screen that writes over her library — reads as
a table: a sunk head, the record's name in the serif, room in the rows. The backup and the
stubs keep the shared surfaces.

**Text.** One sentence pointed at the old navigation: the backup „at the foot of the menu"
now says the ⋯ menu at the top right, and the menu on a phone. Nothing else in About or
Help describes where things are, so nothing else changed; no new functionality is claimed.

**Checked.** Pigments end to end (list → new batch with its plant → saved with its six
stages → its record); Home, About and its sections, the backup, the stub; BG and EN; 10
screens at 390 and 320px with no horizontal overflow and every control a finger target;
data byte for byte unchanged; deep-check, screen-check, check-scope and the language check
pass (the language check caught a Bulgarian quotation mark in the English sentence).

## 14e. Editorial redesign, package 5 — the composition on real data (1.1.0-design.5)

No new design: the approved v0 screens applied more closely, on the width a laptop
actually has, against a preview loaded with a real backup. No model, data, seed content,
field or action changed.

**A finished work.** The review left its 820px working column, so a 1440px screen read at
half width. The photograph is now large (16:10) with the **parameters in a panel beside
it**; the result colours are a section of their own; „Как се разви" lays its stages across
the width (a grid of stage cards above 1100px) instead of stacking them; the story, the
life strip and the process take the whole section. Every field and both edit actions are
the ones that were there. Two labels were added: „Параметри" and „Цветове от резултата".

**A plant.** The inner measures are gone: `--measure` held a paragraph to 74/120 characters
inside sections that were already half a screen wide, so lines broke twice over. Width is
decided by the section now. (The opening description ran in two columns above 1280px for a
day; the owner's final adjustment put it back in ONE column, with an editorial line length
of 78ch, in a section that still uses the wide page.)

**The Reference.** The results are ResultCards — the colour first and large on the
specimen mat (the shared `swatch()` helper, so an unmeasured colour still draws its empty
swatch), then plant, part, fibre, mordant, process and pH, each named rather than joined
with middots — in a responsive grid with the chosen record's panel beside them. The
search, the ranking, the exact/near split and the picking are untouched.

**My work.** The finished records keep their photographic cards: fewer and wider (from
190px to 290px minimum), a 4:3 photograph, equal height, every action inside the card; the
work in hand keeps its own wide row.

**Techniques.** The flow is list → read → Edit → Save, as everywhere else in the reference:
opening a technique used to land straight in the editor. `…/edit` is the editor's address;
`deep-check`'s library-note guard now opens it there, with the same claim.

**Checked.** 23 targeted checks: the trial detail's proportions at 1440 (column 1240 of
1280, hero 881, parameters 343 beside it) and its stages on one line; the plant's text
filling its section; 13 result cards with a big swatch and six named fields, picking and
filters intact; the finished cards 300px wide and of equal height beside a 1240px current
work row; the techniques flow end to end; BG and EN; 1600, 1440, 390 and 320px with no
horizontal overflow and no screen filling less than 90% of its page; data unchanged.
deep-check, screen-check, check-scope and the language check pass — deep-check caught all
three shape changes (the colour search's rows, the empty swatch, the technique form) and
each was corrected rather than waived.

## 13fc. Seed recipes for the preparation baths, and the aluminium acetate workflow (1.0.0-rc100)

Nine recipes and two chains become bundled content, and the aluminium acetate path is
settled end to end. No architecture, no UI model, no other data.

**The recipes.** `silk-scour`, `cellulose-scour`, `tannin-bath`, `silk-mordant`,
`cellulose-alum-soda-mordant`, `madder-dye`, `aluminium-acetate-prep`,
`aluminium-acetate-mordant`, `chalk-bath` — stable seed ids, `origin: "seed"`,
`distributable: true`, BG and EN throughout, no empty English step, no new substance (every
line points at one that was already in the library), and the Bulgarian keeps the
application's own words: закрепване, закрепител.

- **Madder** is 25–50% WOF of dried root, the lower end lighter and the upper deeper. The
  old flat claim that madder „loses its dye above 70 °C" is replaced by what actually
  holds: it is sensitive to temperature, pH, the water and the mordant; lower temperatures
  favour clearer reds and corals, higher ones move towards brick and brown.
- **Silk mordanting** no longer says vinegar „softens the fibre and brightens red and
  orange". The claim is simply not in the seed text.
- **Aluminium acetate, prepared** is fixed to potassium alum because that is what most
  people can buy: 18% WOF alum, 10% WOF soda ash, 240% WOF of 5% vinegar, scaling with the
  cloth. Its note says plainly that alum and aluminium sulfate are NOT interchangeable gram
  for gram, and sends the reader to the calculator for another reagent or strength.
- **Aluminium acetate, used** is a cold bath at 5–8% WOF with 8% the default, for cellulose
  and for silk — protein here means silk, not automatically wool — with a tannin
  pre-treatment described as optional rather than part of the default chain, and a
  `requiredFollowOn` to the chalk bath.
- **The chalk bath** is 10 g of calcium carbonate per litre for about ten minutes; wheat
  bran stays a traditional alternative in words, not an ingredient.

**The calculator** keeps its stoichiometry and its freedom; only what it starts with
changed: 8% WOF of finished acetate, 6% vinegar, anhydrous aluminium sulfate, soda ash.
Potassium alum with 5% vinegar remains selectable and computes.

**Chains are a pack now.** `seed/chains.json`, declared in `PACKS` beside the others, in
the manifest and in the worker's list — and with its own „Обнови от библиотеката" button on
the chains screen, because `try-pack-reachability` refuses a pack whose records could never
be corrected on an installed copy. Two chains: the cellulose preparation (scour → tannin →
alum and soda), and the aluminium acetate preparation (scour → prepare the acetate →
mordant → chalk bath).

**What the model could not express.** A chain cannot choose a step by fibre, so the
acetate chain cannot say „cellulose scouring for cotton, silk scouring for silk". The
cleanest available representation was used: cellulose scouring stands as the first step and
the chain's note, in both languages, says to replace it with silk scouring for silk. The
same note says the preparing step is only for making the acetate oneself. No data model was
changed for either.

**Sources.** Boutrup & Ellis (Recipe 11B) for the three aluminium acetate recipes; the
studio's own guide for the six preparation and dye recipes. No duplicate source record was
created. The studio guide is an attribution the owner should confirm or replace for the six
— see the report.

**Checked.** 26 targeted checks: the nine recipes installed with origin, distributable,
BG/EN and sources; 18 g / 10 g / 240 ml at 100 g and 45 / 25 / 600 at 250 g; madder 25–50 g;
the two removed claims absent; the follow-on to the chalk bath; the calculator's defaults
and the potassium alum + 5% path; both chains pointing at recipes that exist and the pack's
button present; a user fabric and a user recipe untouched by the new pack and still the
user's; the plant description one column with no width of its own at 1600, 1440, 390 and
320px, with no overflow. deep-check, screen-check, check-scope, the language check,
referential integrity, recipe lines, pack reachability, pack lifecycle, older-backup restore
and the cache list pass; two guards that assumed chains were never seeded and that the
recipes list held only their fixtures were narrowed to their own records.

## 13fd. The aluminium acetate workflow: one calculation, not two (1.0.0-rc101)

rc100 read the workflow as „prepare a solution, then dose 5–8% WOF of finished acetate".
That is two calculations for one bath, and it assumes a powder most people do not have.
The workflow is: **fibre weight → reagents for that weight → the working solution → the
whole solution IS the mordant bath for that cloth → chalk bath.**

**How the double scaling was removed.** `aluminium-acetate-mordant` had one ingredient line
on `percent_wof`, 5–8, whose options were the acetate substance and the preparing recipe,
plus `target: { percentWof: 8 }`. That line is now a single line on **`absolute`** with no
quantity at all, whose one option is `seed:aluminium-acetate-prep`, and the `target` is
gone. So nothing in the mordant scales with the cloth: there is nothing left to scale. The
only figures in the workflow are the preparation's — 18% WOF potassium alum, 10% WOF soda
ash, 240% WOF of 5% vinegar — which scale with the cloth as they always did (250 g → 45 g,
25 g, 600 ml). The preparation now carries `requiredFollowOn: ['seed:aluminium-acetate-mordant']`,
so the two read as one path, and the mordant keeps its own follow-on to the chalk bath.

**How the attribution is modelled.** `sourceCodes` is a list, so both stand: the underlying
reference `boutrup-ellis` (The Art and Science of Natural Dyes, Recipe 11B) and
`crafty-place-practice` as the adaptation, on all three recipes of the workflow. The
sentence a reader sees is in each recipe's notes, in both languages: „Crafty Place —
адаптирано по Boutrup & Ellis, The Art and Science of Natural Dyes, Recipe 11B." No new
source record was created and none was renamed; the workflow is not presented as identical
to 11B.

**The fixed variant stays convenient.** Potassium alum with 5% vinegar, in the figures
above. For another form of the aluminium reagent or another vinegar, the note sends the
reader to the calculator rather than to a gram-for-gram swap. The calculator is unchanged.

**Silk mordanting is potassium alum.** The aluminium sulfate option is removed rather than
kept beside it: the two carry different amounts of aluminium and are not a swap. The dose
stays 10–15% WOF, the steps name the alum, and both notes say why a sulfate recipe would be
a recipe of its own.

**Also corrected.** The chalk bath's basis was written `per_litre` in rc100; the
vocabulary's code is `grams_per_litre`. The acetate chain's note no longer calls the
preparation optional.

**Checked.** 15 targeted checks: the preparation's three figures at 250 g; „the whole
solution" as the mordant's only line, with no 5–8% anywhere on its screen and no second
figure when the cloth's weight changes; the record's shape (one `absolute` line pointing at
the preparation, no target, both sources); the chalk follow-on; potassium alum alone on the
silk mordant and 10–15 g at 100 g; 22 seed recipes and 2 chains still there. deep-check,
screen-check, the language check, recipe lines, referential integrity, manifest, pack
reachability and pack lifecycle pass.

## 13fe. About and Getting started: the texts the owner wrote (1.0.0-rc102)

Content only. No route, no module, no data, no navigation; the one visual change is what
the longer texts need in order to be read.

**Where each block went.** The About screen already had the four tabs §13eg gave it, so
nothing new was created.

- **„Какво е Багра" / „What Bagra is"** — the About tab. Two opening paragraphs, then three
  sections with headings: Справочникът, Дневникът, Данните ти.
- **„Справочник или дневник?" / „Reference or Journal?"** — a panel of its own directly
  under it, on the same tab. It explains the split the whole application rests on, so it
  reads where the split is described rather than on a screen of its own.
- **„Как се започва" / „Getting started"** — the Help tab, with the two ways to begin as a
  list and the five numbered sections as headings, and the workflow line
  (тъкан → изпиране → танин/закрепване → опит → резултат) set as a figure.

**Structural adaptation.** Only presentation: `about.js` gained a `section()` helper (a
heading and its paragraphs) because the texts went from four paragraphs to five sections,
and a wall of paragraphs with no headings is not read. The module's CSS scope gained
heading spacing, paragraph rhythm, list indents and the figure for the workflow line. The
panel keeps the page's width; the reading text keeps the shared measure. Nothing was
shortened.

**Terminology.** Справочник / Reference and Дневник / Journal stay distinct and stay the
application's own words; no „Наръчник / Guide" section was invented.

**Checked.** 14 targeted checks: 43 keys complete in BG and EN; every heading renders on
both tabs; the „Reference or Journal?" block sits on the About tab; the workflow line, the
group action, the inherited history and the calculator-not-gram-for-gram warning all
present in both languages; the four tabs read at 390 and 320px with no horizontal overflow
and tabs that are finger targets; no page errors. The language check, screen-check and
deep-check pass — deep-check asked About to say „офлайн" and Help to say „архив", and the
new texts say „offline-first" and „Резервно копие"; the guard now accepts either wording,
with its claim unchanged.

## 13ff. The aluminium acetate calculator reads WOF two ways (1.0.0-rc103)

The calculator knew one question — how much of everything for a target of FINISHED
aluminium acetate — and practical recipes ask the other: „18% WOF of potassium alum, then
what?" It now asks which, with a selector („Процентът се отнася за:" / „WOF refers to:")
and an explanation under it that the two are different sums and may give different
quantities.

**Mode 1 — finished aluminium acetate.** Unchanged, formula and all. The regression the
owner supplied holds: 311 g of cloth at 8%, anhydrous aluminium sulfate, anhydrous sodium
carbonate, 6% vinegar → 24.9 g of Al(CH₃COO)₃, 20.9 g of Al₂(SO₄)₃, 19.4 g of Na₂CO₃ and
366 ml of vinegar.

**Mode 2 — aluminium source.** The percentage is read against the chosen SALT: 100 g of
cloth at 18% potassium alum starts from exactly 18 g of alum, and the soda and the vinegar
follow from the aluminium that 18 g actually carries — 7.7 g of acetate, 6.0 g of soda,
136.7 ml of 5% vinegar. The same 18% of anhydrous aluminium sulfate carries nearly three
times the aluminium (21.5 g of acetate), which is the point: no salt is a gram-for-gram
substitute for another, and neither is a hydrate for its anhydrous form.

**One path, read from either end.** `aluminiumAcetate()` takes `mode` ('finished' |
'source'); in 'source' mode it derives the moles of aluminium from the salt's own molar
mass and `alPerUnit` and rejoins the existing stoichiometry, so there is one chemistry and
two entry points rather than two formulas. `targetG`, the way a chain states what the next
step needs, still overrides both. The field's label follows the mode — „Цел (% WOF готов
ацетат)" or „Алуминиев източник (% WOF)" — and the aluminium source, sodium source and
vinegar strength stay visible in both.

**The fixed recipe stays a recipe.** 18% alum, 10% soda ash, 240% of 5% vinegar is the
Crafty Place method adapted from Boutrup & Ellis 11B; the stoichiometry for those 18 g
returns 6 g of soda and 137 ml, and the calculator says nowhere that the two „match". A
guard holds that too. Vinegar strength moves the volume and not the acid: the same acetic
acid is 240 ml at 5% and 200 ml at 6%.

**The guard.** `scripts/try-alum-acetate-modes.mjs`, wired into `check.sh`: eleven
regressions across both modes, four aluminium salts, two vinegar strengths, sodium acetate
(which needs no acid), and the claim that the modes differ. Seen failing — three cases —
with mode 2 deliberately broken.

**Checked.** The eleven regressions, and sixteen on the screen: the selector and its two
options, the explanation, the label following the mode, the owner's 311 g case computed in
the interface, mode 2 starting from exactly 18 g, the different answer when switching back,
both languages, and the selector at 390 and 320px with no overflow. Nothing else moved: no
seed recipe, no chain, no substance record, no journal data.

---

## 13fg. A pigment batch is a journal entry, not a workflow (1.0.0-rc105)

Pigment-making in this studio is occasional. The batch had grown past what that needs: six
fixed stages each with a note, a date and photographs (§13bx); a choice between a recipe and a
chain; every line of what went in classified against the recipe as same, added, changed,
swapped or removed (§13dr); a quality rating; and swatches that each said what product they
were — dye, pigment, watercolour, pastel, ink, glaze — on what surface and by which recipe
(§13ds). That is a workflow engine for something done a few times a year. The owner's
decision: a batch says what it was made from, which recipe it followed, what actually went
in, what happened, and what came out. The recipe already describes the method; the batch
records this time.

**This section supersedes, for the batch screen and for every batch written from rc105:** the
`stages` of §13bx, `viaKind: chain` and `finishedOn` of §13bx, `quality` of §13bx, the
departure display and the struck line of §13dr, and the swatch's `kind`, `substrate` and
`viaId` of §13ds. The decisions those sections record about the list — grouped by plant ×
part, the most recent successful batch's colour on the group, no remainder tracked and the
list saying so — stand unchanged.

### The shape from rc105

    pigmentBatches
      status        done · failed           — one box, „Не се получи" / „It did not work"
      date          one date
      plantId, partCode, rawWeightG         — the source
      viaKind       'recipe' for every new batch
      viaId         a recipe with output 'pigment'
      lines[]       { id, name, amount, unit, note, roleCode, substanceId, was }
      linesFrom     { recipeId, recipeName, takenOn }
      process       { bg, en }              — NEW: „Процес / бележки" / „Process / notes"
      yieldG        optional
      swatches[]    { id, hex, name{bg,en}, note{bg,en}, photos[] }   — note is new
      photos[]      now reachable from the screen; it never was before
      notes         { bg, en }              — relabelled „Резултат и извод" / „Result and conclusion"

**Lines keep `was` and `roleCode`.** `linesFromRecipe` and `departureOf` are shared with the
paste print in a trial (§13ee), which still reads departures, and changing what they write
would change that screen. The batch screen writes them and never reads them. A line is now
removed outright with ×; a line an older batch struck out is still drawn struck, with „marked
as left out (older record)", because that is what was written.

**One recipe, modified by what was done.** The batch still starts from a single master pigment
recipe and takes its lines once, while the list is empty (`canTakeLines`, §13dr). No
per-plant recipes. Choosing a recipe now redraws the screen, so the „take the lines" button
appears at once instead of after saving and reopening — a small fault found while building this.

### Three calls made in the plan and not objected to

1. **`planned` leaves the screen; `failed` stays**, as a box. A failed batch is the most
   useful note for the next attempt and must not read as zero grams (§13bx). The box writes
   `failed` when ticked and `done` when a failed batch is unticked; a batch that says
   `planned` and is never ticked keeps saying it — saving must not rewrite a state nobody
   chose. New batches are `done`.
2. **Quality is not entered and not listed.** Kept optional it stays half-central: an empty
   column on every new batch reads as work left undone.
3. **Only `output: 'pigment'`.** `extract` recipes were offered too. None ships. A batch that
   already names some other recipe keeps it in the dropdown, so opening and saving it changes
   nothing.

### Older records: nothing deleted, nothing hidden

The migration `pigmentProcessNotes` (`migrations.js`) gives every batch without `process`
one, built DETERMINISTICALLY from its stages: each stage with a note or a date becomes a line
in the fixed stage order, under the stage's own name in that language —
`Извличане (2026-05-02): три часа на слаб огън`. An empty stage is left out. The Bulgarian
half is written from the Bulgarian notes and the English half from the English ones; nothing
is translated; a stage with only a date goes into the Bulgarian half alone. A bare-string note
from before the language pair is read as Bulgarian. An unknown stage code keeps its code as
its name. The stage names are written into the migration, not read from `i18n.js`, so the
result does not depend on the interface language when it ran.

**`stages` is not removed** — migrations add (§13cv). It stays on the record as the way back,
as `swatchHex` did at §13ds. Structural write, so `updatedAt` does not move; idempotent, so a
batch that has `process` is never touched again.

Everything else an older batch recorded is shown read-only, never edited, never
reinterpreted:

| Older field | On the screen from rc105 |
|---|---|
| `viaKind: 'chain'` | „Older record — made by the chain X", no recipe dropdown, no lines to take. Converting it to a recipe would be a guess about which step made the pigment. `refs.js` still counts the chain as used, so it cannot be deleted from under the batch. |
| `finishedOn`, `quality` | In a small aside panel, „Fields from an older version. They are kept, and no longer filled in." |
| photographs on a stage | Beside the batch's photographs, labelled as from the stages. Shown where they are, not copied — no image stored twice. `countUserPhotos` already counts them. |
| a swatch's `kind`, `substrate`, `viaId` | One read-only line under that swatch. `refs.js` still protects the swatch's recipe. |
| `swatchHex`, `swatchName` | Untouched, as since §13ds. |

No real pigment batch was available to migrate against: the three older-backup fixtures carry
none. The migration is proven on synthetic batches covering every older shape listed above.

### Guards

- **24h' in `deep-check.mjs`, on the rendered screen.** An older batch with stages, a chain,
  quality, a second date and a typed swatch is written, migrated and opened: no stage field,
  no recipe-or-chain choice, no departure chips, no quality, no second date, no swatch kind /
  surface / recipe control; its stage note is in Process / notes word for word; its chain,
  its finishing date and its swatch's kind are still shown; its `stages` still stored. A new
  batch offers only pigment recipes, and saved, carries no `stages`, `quality` or
  `finishedOn`, `viaKind: 'recipe'`, and the process text. Recipes and chains are compared
  byte for byte before and after. Seen failing against the rc104 screen (twelve findings), and
  with the migration deleting stages, the older date hidden, and one recipe altered — each
  caught.
- **`scripts/try-pigment-lines.mjs`**, ten new assertions on the migration. Seen failing under
  six mutations: overwriting a written process, deleting stages, keeping empty stages,
  repeating a date-only stage in English, dropping an unknown stage, stamping `updatedAt`.
- **`screen-check.mjs`** fixture moved to the new shape, keeping one struck older line and two
  older swatches so the read-only lines are measured at every width.
- **`scripts/try-restore-older.mjs`** expects the new marker.

### Not changed

Trials, the paste print's departures, fabrics, batches of cloth, the calculators, the
aluminium acetate work, every seed recipe and chain, the recipe screen, the vocabulary
(`swatch_kind` stays — older swatches name their kind through it). Twenty-four dictionary keys
the old screen alone used were removed from both languages; `pigments.dep.*`, `wasLabel`,
`lineOut`, `lineBack`, `linesTitle`, `linesHint` and `takeLines` stay, because the paste print
in a trial uses them.

### The release gate was already red at rc104

Found before any change was made, and left alone because none of it is the pigments. Recorded
in `DOCUMENTATION_DECISIONS_NEEDED.md` item 33. rc105 passes every layer that rc104 passed,
run one by one.

---

## 13fh. The release gate repaired, and nothing else (1.0.0-rc107)

`sh check.sh --release` had stopped on four faults since rc100 at the latest, none of them in
the application's behaviour (`DOCUMENTATION_DECISIONS_NEEDED.md` item 33). This package repairs
those four and changes nothing a person using the application would notice.

**1. Two sections called §15.** „Visual identity and naming" is §15 and stays §15:
`scripts/order-spec.py` places §15 in Part I, and §15.1–§15.5 are cited from the
specification and from `index.html`. The sections written from rc100 to rc105 are decision
records, which belong to Part V, and are renumbered into its sequence after §13fb:

    §15  (rc100) Seed recipes for the preparation baths …   →  §13fc
    §15a (rc101) The aluminium acetate workflow …           →  §13fd
    §15b (rc102) About and Getting started …                →  §13fe
    §15c (rc103) The calculator reads WOF two ways          →  §13ff
    §15d (rc105) A pigment batch is a journal entry …       →  §13fg

Section content is unchanged. Every citation was updated — 34 of `§15a`–`§15d` across
comments, checks and documents, and one bare `§15` in `CHANGELOG.md` that meant the rc100
section. The bare `§15` and `§15.x` citations that remain all mean visual identity, and were
checked one by one. Item 33 keeps its original wording, because it describes the state before
this repair. `.spec-sections` was regenerated from the headings.

**2. `check-scope.js` and a regex literal.** The literal in `typeOptions` (`modules/recipes.js`)
contains double quotes; the checker removes string literals by their quotes and does not know
regex syntax, so it read the rest of the file as one string and reported five declared names
as undeclared. The literal is now `new RegExp('…', 'g')`. `String()` of the old and new regex
is identical — same source, same flags — and both give the same matches and the same
replacement on a sample list of options. The checker itself is unchanged.

**3. Pack field labels.** `chains` had become a pack at rc100 with no field dictionary, and four
recipe fields had no label, so the pack preview would print the raw key. `seed-ui.js`
`FIELD_LABELS` gains `recipes.origin`, `liquorRatio`, `vinegarPercent`, `defaultLitres`, and a
`chains` dictionary for its six fields — `name`, `appliesTo`, `steps`, `notes`,
`distributable`, `origin`. Every label is an existing i18n key present in both languages, so
no text was written; the only visible effect is that the preview now names these fields in
words.

**4. `check-boot.mjs` and the old sidebar.** The redesign (§14a) moved navigation into
`#topbar`: row 1 carries the three spaces and an overflow menu, row 2 the modules of the
current space. The check still looked for `#sidebar .navitem` and reported „navigation is
empty". It now asks for three space buttons and a non-empty overflow menu in `#topbar`.

The orphan check had to change in kind, not only in selector. The sidebar showed every entry
at once; row 2 shows one space's modules, so a single reading of the bar would call the other
space's modules orphans. The check now walks the bar from Home — opens every address the bar
offers, reads the bar again there, until nothing new appears — and a module is reachable if
that walk reaches it. `HIDDEN_MODULES` stays the declared exception list.

Seen failing three ways, each against a temporary edit of `app.js` that was then restored: a
module removed from `NAV` („no way in from the navigation bar: pigments"), an empty bar (no
space buttons, empty overflow), and an emptied `HIDDEN_MODULES` („materials, packs, batch").
The navigation itself was not touched: the test follows the application.

**Nothing else.** No behaviour, model, seed record, recipe, chain, pigment code, calculator or
screen changed. `modules/pigments.js`, `migrations.js` and the check scripts appear among the
changed files only because their comments cite section numbers.

---

## 13fi. English on a first opening, and references that resolve (1.0.0-rc108)

Two release-readiness decisions, and nothing else.

### The language a device opens in

**Decided by the owner for the commercial 1.0:** a device that has never chosen a language opens in
**English**. The rule, in full:

    no stored `language` setting  →  English (`DEFAULT_LANG`)
    a stored `language` setting   →  that language, on every launch

`i18n.js` holds `DEFAULT_LANG = 'en'`, and both the in-memory starting value and the fallback of
`initLang` read it, so no Bulgarian state exists between the page loading and the setting being
read. The page shell says `<html lang="en">` for the same reason; `renderNav` already writes the
bar's accessible name in the chosen language.

- **Nothing is written because the default applied.** Absence goes on meaning „the application
  default", so a later change of default would still reach a device that never chose.
- **A choice is stored through `setLang`**, as before — Bulgarian or English, including English
  after Bulgarian. A stored `en` is kept, not dropped as equal to the default.
- **The browser's and the system's language are not consulted.** The choice is made once, in the
  interface, by the person.
- **Language is a device preference, not backup data** (§13co): a restore neither imports nor
  removes it, whichever language the backup carries.
- Translations are unchanged.

**The checks that read the Bulgarian interface now say so.** `deep-check.mjs` asserts Bulgarian
labels and `screen-check.mjs` measures the Bulgarian screens — the longer language, the one a phone
breaks on. Both booted a fresh database and got Bulgarian by default; under the new default
`deep-check` failed five assertions and `screen-check` silently measured English instead. Each now
stores `bg` through the same setting before anything is asserted or measured, which is exactly the
state of a device whose user chose Bulgarian. English layout is not measured at four widths; the
English screens are covered for stray Bulgarian by `try-language-screens.mjs` (§13eh).

**Guard: `scripts/try-language-default.mjs`.** Three launches, each a separate process over an
empty database — the application reads the setting once at start-up, and a module graph cannot be
booted twice in one process:

- nothing stored: the shell and the application are English, `<html lang>` is `en`, the bar has no
  Cyrillic and its English button is pressed, and still no setting is written; a click on
  Bulgarian switches the interface and stores `bg`, a click on English switches back and stores
  `en`;
- `bg` stored: opens in Bulgarian, bar included; `en` stored: opens in English, still stored.

Seen failing five ways against rc107's Bulgarian default, and once against a variant that wrote
the default into the setting. `try-backup-restore.mjs` gains the reverse case — an English device
is not switched by a backup that carries Bulgarian, and a device with no choice gets none from it.

### A reference that is filled is not a reference that resolves

`check-actions.mjs` run against the owner's backup reported every action „in a batch or a trial" —
and one of them names trial `dc0cbc30-…`, which the backup does not contain. Guard 4 proved the
field was filled; nothing proved it pointed at anything. The application does not break over it:
the piece's history draws the row without its link.

**The invariant (guard 4b):** every migrated fabric action that names a `trialId` names a trial in
the backup's `trials`; every one that names a `batchId` names a batch the application would hold —
the backup's `batchActions` store, plus the batches `migrateFabricActions` would create for pieces
not yet migrated. The two are the application's own representation, not a second reading of the
model. A backup older than the batch store may carry no `batchActions`; then the migrated batches
alone are what a restore would hold.

**Detection only.** Nothing is deleted, nulled, invented or rewritten; the file is only read. The
report names the piece, the action and the missing id:

    DANGLING 1 reference(s) to a record that is not in the backup:
      fabric П-01 / finish → missing trial dc0cbc30-e2b2-4b03-8baa-c0de85946480

**Two kinds of result, two exit codes.** `1` is structural — a check could not run, the data has
the wrong shape (no `trials` list; a `batchActions` that is not a list), ids collide, the migration
is not idempotent, an action names nothing. `2` is a sound backup with a dangling reference. The
second is not `0`: a dangling reference is shown and never accepted quietly, and no id is
special-cased anywhere. The release gate never passes a backup, so exit 2 belongs to a person
running the check by hand; a caller that wants to tolerate a known historical finding can read the
listed ids and decide.

**The gate runs the self-test.** `check.sh` layer 2a now runs `check-actions.mjs --selftest`. Guard
4b's self-test builds one piece with four actions — a missing trial, a missing batch, a present
trial, a present batch — and requires exactly the two missing ones, then silence when both records
are present. Unlike the three older self-test lines, a blind 4b **fails** the run; seen failing with
each half of the guard disabled. `--selftest` on its own had never run: the first argument was read
as the backup's file name, and it stopped on ENOENT. The backup is now the first argument that is
not a flag.

Nothing else was widened into a referential-integrity framework; `try-referential-integrity.mjs`
remains the application-level check.

**Against the owner's backup of 27 September 2026:** exit 2, fourteen actions, every batch
reference resolved, one dangling reference — `fabric П-01 / finish → missing trial
dc0cbc30-e2b2-4b03-8baa-c0de85946480`, the known one. The file's checksum was the same before and
after.

---

## 13fj. Plans v1 — what she means to try, before it is work (1.0.0-rc109)

The diary records what was done. A plan records intent: what to try, why, which variants, and
which of them are already done. „Compare four mordants for eco print on cotton", „test fig
leaves", „the same bath with less iron". It is useful on its own, without a trial behind it.

### The record

    plans
      id, title, createdAt, updatedAt
      status    idea · planned · active · done
      notes     free text
      items[]   { id, text, checked }

Nothing else — no provenance fields (a plan is never seeded, packed or distributed), no dates to
meet, no priority, no tags, no links. `title` and `notes` are personal free text (§13.1, kind 2):
stored as written, never a `{bg, en}` pair. Status labels are interface strings
(`plans.status.*`), not vocabulary: nothing else in the model reads them.

A line is text and a tick. „N5 — with 5 g Fe" is written the way it would be on paper; it is not
a structured experiment. A line saved with no words is dropped — nobody wrote it.

### The screens

**List** — title, status chip, progress as „3 / 8", and the date last changed. Open plans first,
newest touched first; finished ones after. No filters: the list is short, and the order already
puts finished plans out of the way.

**One plan** — two columns on a laptop, one on a phone, in the order title · status · notes ·
checklist. The checklist adds, edits, ticks and removes lines. **No reordering in v1**: the one
existing pattern is the chain editor's ↑ ↓ buttons, and two more buttons per line would crowd a
320px row for a feature nobody has asked for yet.

Everything follows the conventions already in the application: an explicit Save, the
unsaved-work guard, `deleteGuarded` and its shared dialog, the trial's `statuschip` (`idea` takes
the plain chip; planned, active and done take the planned, in-progress and complete colours), and
the `.grid` table that becomes cards on a phone. `refs.js` declares `plans` with no incoming paths —
nothing points at a plan, so a delete is always allowed — and the first full release run
required the declaration: `try-referential-integrity.mjs` refuses a guarded delete on a store the
policy does not know. The only new CSS is the checklist row: tick,
words, ×, where the words may shrink rather than push the row past the edge and the tick and ×
keep 44px.

### Where it sits

The diary row, second — **My work · Plans · Pigments · Fabrics**. Beside the work it leads to.
Not first, because the diary's space button opens the first entry of its row and that stays My
work: a plan is the lighter layer before it, not the diary's front door.

### Storage, backup, restore

A store of its own, `plans` (IndexedDB version 10), created by the upgrade loop that only ever
adds. Backup and restore iterate the stores, so plans travel with no code of their own; the backup
format is unchanged apart from carrying one more list, and `schemaVersion` stays 3.

- A backup from before Plans has no `plans` list. Restored onto a device, it gives an empty
  Plans list; restored onto a device that already has plans, it leaves them — the documented rule
  for a store a file does not carry (§13co), which clears nothing on the strength of a gap.
- An application OLDER than rc109 restoring a newer backup skips the `plans` list silently (the
  general rule is in §13co),
  because it does not know the store. Raising `schemaVersion` would make it refuse the whole file
  instead. Left as it is; recorded as a question (`DOCUMENTATION_DECISIONS_NEEDED.md` item 35).

### Checks

- `scripts/try-plans.mjs` (jsdom, the real screen): create with three lines, one empty; the saved
  record has exactly its seven fields and each line exactly three; edit title, notes, status, a
  line's text, tick and untick; remove a line; progress on the list; backup carries the plans;
  replace and merge restores bring them back unchanged; the rc56 fixture restores to an empty
  list and does not delete a plan written since; delete through the shared dialog; every key the
  screen uses is in both languages, and no Bulgarian is written into the module. Seen failing
  when empty lines are kept, when a line's text is not read, and with one English key removed.
- `scripts/try-plans-screens.mjs` (Chromium): list, empty form and a plan with long lines, at 390
  and 320px, in Bulgarian and English — no sideways scroll, nothing past the edge, every tick and
  × at least 44 × 44, a line's words at least 150px wide. It waits for the view to stop changing
  rather than for a fixed time (item 34). Seen failing with a fixed-width text field and with the
  tick's label at its natural 13px — the second of which `screen-check` does not see, because it
  measures height only.
- `screen-check.mjs` measures `#/plans`, the empty form and an opened plan at its four widths;
  `try-screen-coverage.mjs` required it. `try-restore-older.mjs` counts `plans` as her work and
  opens `#/plans` after each restore.

### Not in v1, and how the next step fits

Not built: scheduling, reminders, priorities, deadlines, dependencies, subtasks, kanban, tags,
filters, links to plants, recipes, fabrics or trials, sharing, a format of its own.

The intended next step is **a line → a trial**. It needs one optional field on a line — the id of
the trial made from it — and a button; nothing in the v1 shape has to change for it.

---

## 13fk. A tick on a plan is saved at once (1.0.0-rc110)

A tick is a finished act; pressing Save after it was one step too many, and a tick forgotten
unsaved is a line done twice. **Only the tick** is written at once. Title, notes, status and the
words of a line still wait for Save — this is not autosave.

**What is written is the stored plan with one line's `checked` changed, never the draft.** The
draft can hold notes typed a minute ago and not saved: writing it would save them without her
asking, and writing a stale copy over the stored plan could undo an earlier save. So the change
handler reads the stored plan, finds the line **by its id** — a line removed in the form and not
yet saved shifts every index after it, and the stored plan still has it — sets `checked`, and
writes it through `put`, which stamps `updatedAt` and counts toward the backup reminder like any
edit. The draft's line takes the same value, so a later Save carries the tick and cannot revert
it. Ticks are written one after another through a queue, so two quick ones cannot both read the
plan before either has written.

- **Nothing stored to patch** — a plan never saved, or a line added and not saved: the tick stays
  in the draft, goes with Save, and the form is marked as holding unsaved work.
- **The write fails:** the shared `flash` says the tick was not saved and to press Save; the form
  is marked unsaved; the draft still carries the tick, so Save stores it.
- **The unsaved-work guard.** `dirty.js` marked a form dirty on any control. A control marked
  `data-saves-itself` no longer does: a tick leaves nothing unsaved behind it, and a prompt on
  leaving would claim otherwise. Unsaved typing elsewhere still counts. The attribute is on the
  tick alone.

**Checks** (`scripts/try-plans.mjs`, fifteen new): ticking and unticking are stored without Save;
`updatedAt` moves; the plan stays open and is not left dirty by a tick alone; reopened, the tick is
there; with title, notes and status typed and unsaved, a tick stores none of them, the form still
shows them and is still unsaved, and Save then keeps both the words and the tick; after an unsaved
removal the tick reaches its own line and the removal is not stored; a tick on a never-saved plan
writes nothing and Save carries it; a failed write is shown, stores nothing, leaves the form unsaved,
and Save then stores the tick. Seen failing when the whole form is read and saved on a tick, when
the line is found by position, without the `dirty.js` exemption, and with no write at all.

No change to the plan's shape, the IndexedDB version or `schemaVersion`.

---

## 13fl. The eco-print trial as it is actually built (1.0.0-rc111)

Found in one real record — the owner's silk scarf of 25 September 2026: foil, a cotton blanket dipped
in iron, leaves, the silk laid on top, rolled round a rod, steamed ninety minutes at about 100 °C.
The screen could not say it without contradicting itself. The fixes, each small, and no new workflow.

### Dates

The completion date lives on the finishing screen, and the trial date on the working screen; both are
shown, so both are kept. The record had `date 2026-09-25` and `finishedOn 2026-09-18` — a finish a
week before the start, left behind when the date was moved. **Rule** (`alignFinishedOn`): when the
working screen saves a completed trial whose `date` was changed in that edit, a `finishedOn` earlier
than the new `date` becomes `date`; one on or after it is kept.

**Narrower than first agreed, and why.** The rule as agreed — any `finishedOn` earlier than `date` is
brought up — failed an existing guard (§13au): past work is recorded with today's `date` and its real
finishing day chosen on the finishing screen, which is earlier on purpose. Applying the rule on every
save would overwrite that chosen day. So it applies only when the trial date itself moves, and never
on the finishing screen. Consequence: the owner's record as it stands (date already moved, not
re-edited) is not changed by an ordinary save; its completion date is corrected on the finishing
screen, or by touching the date.

### The unsaved-work warning after Save

The working screen stays open after Save, and `dirty.js` clears its mark only when the form leaves the
screen — so the next step away warned about work already written. The save path now calls
`markClean()` after a successful `put`. Only there: unsaved typing still warns.

### The bundle, bottom to top

    trial.bundle = {
      layers: [ { id, kind, what, note, stepId, prep } ],   // from the bottom up
      roll: text                                             // „around a wooden rod"
    }
    kind (vocabulary `bundle_layer`): barrier · carrier_blanket · printing_cloth · plants ·
                                      receiving_cloth · other
    prep (carrier_blanket, printing_cloth): { washed, treatment, duration, bath, note } — words

No layer is assumed to be first or last. Rows are moved with ↑ ↓ and removed with ×; no dragging.
The blanket's preparation is a mini-block of text fields — „1–2 min", „3 g iron salt / ~3 L water,
shared by five" are what was known — not a second fabric workflow. The cloth kinds reuse
`bundle_role`'s codes, so an older step's role carries over unchanged.

**On an eco-print trial the four construction step types — `lay_base`, `arrange`, `lay_blanket`,
`bundle` — are shown by the bundle and not again as steps**, and the step-type list no longer offers
them there. The steps stay in the record with their indices; other processes are unchanged. The
colour stage then holds the plants and the heat treatment, so the working screen reads: main fabric and
preparation, bundle, plants, heat, result.

### Older records

Migration `ecoprintBundleLayers` (add-only, structural, idempotent) gives every eco-print trial
without a bundle one built by `bundleFromSteps`: each construction step one layer in step order,
`arrange` → plants, a laying step → the kind its `roleCode` names, no role → `other` with its words
kept; the `bundle` step's words become `roll`. A layer keeps its step's id, so the step's photographs
are shown beside it, not copied. A trial switched to eco print later, or restored, gets the same
bundle in memory when opened, written only on Save. The owner's record becomes foil → blanket →
plants → silk.

### Which side of the leaf

A placement gains `printSide` (vocabulary `print_side`): **printing/vein side toward receiving
fabric** or **face side toward receiving fabric**, or not specified. The old `facing` —
`face_up` / `face_down` — is kept and never rewritten. `printSideOf` reads it only when the bundle
settles it: exactly one plants layer and exactly one receiving cloth. „Face down" with the receiving
cloth above the leaves is the vein side toward it; below them, the face. Otherwise the old words are
shown as written, marked as an older record, with nothing added. The owner's walnut reads as vein
side toward the silk (older record: face down) — which is also what her note says.

The plant part's own `facing` (plants screen, item 13) is not touched.

### A whole sprig

`plant_part` gains `aerial` — „стрък / надземна част" / „whole sprig / aerial part": stem, leaves and
flower, no root. Not `whole`, which is the whole plant.

### Heat treatment

The temperature field was labelled „°C" and the time field „При температура (мин)" — the word
„temperature" sat on the minutes. 90 and 100 were entered the wrong way round. Now **Duration (min)**
first, then **Temperature (°C)** with its approximate mark, the same order in both languages, on every
step. The owner's record still holds 90/100 swapped and the yarrow as `flower`: her data, corrected by
her.

### Checks

- `scripts/try-ecoprint.mjs` — her record as the fixture (photographs replaced): the migration's four
  layers, steps and facing untouched, updatedAt still, a dye bath untouched, idempotent, no role →
  `other`; `printSideOf` both ways round, two receiving cloths and no bundle left as written, a chosen
  side winning; the working screen shows four layers once, one step, one preparation block, the old
  step photographs; Duration then Temperature, stored 90 / 100 with approximate kept; the completion
  date following a moved date, a later one kept, an earlier one for past work kept when the date is
  untouched; edit → save → leave with no warning, edit → leave with one; the
  whole scenario typed in the wrong order and reordered, the blanket's preparation, the rod, a leaf
  vein-side to the silk, yarrow as a sprig, nothing written into `facing`; the read view's layers and
  the older walnut's reading. Seen failing without `markClean`, without the date rule, with the rule applied on every save, with the
  construction steps shown again, and with `facing` read absolutely.
- `scripts/try-ecoprint-screens.mjs` — the bundle card at 390 and 320px in both languages: nothing
  past the edge, ↑ ↓ × at 44px, text fields not squeezed. Seen failing with an unwrapping row and with
  20px buttons.
- The language layer fingerprints the data; the vocabulary gained nine terms, so its entry count moved.
  Accepted with `--accept-data`, which reported that one line and nothing else.

---

## 13fm. Washing a group of pieces, with or without a recipe (1.0.0-rc112)

The owner's case: thirteen silk scarves entered as unwashed, all washed on 28 September, to be
recorded together — select, „Изпиране", date, apply.

### Why it looked as if a recipe were required

Nothing in the code required one. Run against her own database the same afternoon, the group
action wrote thirteen `wash` actions with `recipeId: null`. What asked for a recipe was the screen:
the first field of „Действие" was „Рецепта" with the placeholder „избери…", the list under it held
both washing recipes and three preparation chains, the next field was „Отклонение от рецептата",
and the line above the button named a recipe where there was one. Everything said a recipe was the
next step; only a grey hint said otherwise.

**The field is now „Рецепта (по желание)" / „Recipe (optional)", its empty choice reads „без
рецепта" / „no recipe"**, and the screen states the outcome before the button:

    13 ще бъдат отбелязани като „изпран".
    28.09.2026 · без рецепта

No action's validation changed: none required a recipe before, and none does now. The recipe list
per action (`RECIPE_TYPES_FOR`) is unchanged.

### Washing is written only to pieces before „washed"

A piece's box is read from its latest box-moving action (`currentState`), so a `wash` added to a
finished piece moved it BACK to „изпран". A group wash is now written only to pieces in a box before
„изпран" by `STATE_ORDER` (`eligibleFor`) — today that is `unwashed`; a piece washed, mordanted, dyed
or finished is named and left alone:

    2 ще бъдат отбелязани като „изпран".
    2 вече са след това състояние и няма да се променят: П-043, П-042.

The batch record and the per-piece actions cover only the pieces written to, and the confirmation
says how many were left. If none are eligible, the button is disabled. **Only washing.** Every other
action keeps its behaviour — mordanting a finished shawl again is how a piece is reworked (§13am) —
and a chain chosen in the recipe field decides its own actions as before.

**Settled at rc113 (§13fn):** the single-piece screen follows the same rule.

### Also fixed on the way

Clicking an action or a box filter redrew the form without reading it first, so a note or a
deviation typed a moment earlier was lost. Both now read the form before redrawing.

### Checks

`scripts/try-batch-wash.mjs`: thirteen unwashed scarves, washing, no recipe, 28 September, a note —
the outcome sentence, no recipe selected, the button enabled; afterwards all thirteen washed, one
`wash` action each with `recipeId: null` and the date, one batch holding thirteen pieces with the
date and the note, the confirmation, the fabrics list, nothing left marked unsaved. A mixed group of
two unwashed, one washed and one finished: two named as left, two advance, the other two unchanged
and without a new action, the confirmation saying so. A wash with only a finished piece cannot be
recorded; mordanting it can. Seen failing without the eligibility rule and with the note dropped by a
filter click.

---

## 13fn. Washing one piece follows the group's rule (1.0.0-rc113)

**Decided by the owner:** `wash` is the lifecycle step unwashed → washed, and never moves a piece
backwards. rc112 applied that to the group action; the change-of-box field on a piece's own form did
not. Choosing „изпран" there on a finished piece wrote a `wash` action, and because the box follows
the latest box-moving action, the piece went back to „изпран".

**One function.** `eligibleFor(action, fabric)` moved from `modules/batch.js` to `fabric-logic.js`,
and both screens import it. For `wash` it asks whether the piece's box is before the box washing
leads to, by `STATE_ORDER` and `boxAfter('wash')` — no list of states is written out. Every other
action answers yes.

**On the piece's form.** For a piece already washed, mordanted, dyed or finished, „изпран" is shown
**disabled** in the list of boxes, with the reason under the field: the piece is already past it, and
a rinse or a re-wash is recorded as a group action „друго" with a note. A disabled option says why
it is not there; a missing one would only puzzle. The button that records the change checks the same
rule, so no route around the disabled option writes the event.

**History.** A valid wash writes what it always wrote: one `wash` action, `recipeId: null`, in a batch
of one. An ineligible one writes nothing. Wash events already in a piece's history are not touched.

**A later rinse is a different event.** Rinsing after dyeing, washing out excess dye, washing after a
modifier, washing a finished piece before rework: real, and not the lifecycle step. No new state and
no new action in rc113; `other` with a note records it and moves nothing. A `rinse` action that moves
no box may be added later.

**Rework is unchanged.** Mordanting, dyeing or finishing a later piece again is allowed as before
(§13am).

**Checks** — `scripts/try-fabric-wash.mjs`: an unwashed piece washed from its form with no recipe —
washed, one action, a batch of one; a washed, a mordanted, a dyed and a finished piece — „washed"
disabled with its reason, and with the choice forced past the disabled option, no event and the same
box; a finished piece mordanted again; `eligibleFor` for all five boxes, the group action importing
it with no copy of its own, and no other action refused. Seen failing without the check behind the
option, and with the option not disabled.

---

## 13fo. A change of box on a piece's form is its own act (1.0.0-rc114)

Two faults found while writing §13fn, both in the „change of box" field on a piece's edit form.

**„Неизпран" was offered as a change and wrote `other`.** `ACTION_FOR_STATE.unwashed` is `null` — it
is where cloth starts, not something done to it — and the handler fell back to `'other'`, so choosing
it wrote a meaningless event that moved nothing. It is now **not in the list** on an existing piece,
and the handler refuses any box with no action behind it, with a message saying so. It remains the
initial box for a new piece, which is a different field. Events of this kind already in a history are
left as they are.

**Adding a change saved the whole form.** The handler read the form into the draft and wrote the
draft: a name or a note typed and not saved was saved with it. Now the change is written the way a
plan's tick is (§13fk):

1. the SAVED piece is read, and eligibility is judged on its history (§13fn);
2. the batch of one and the action pointing at it are written **in one transaction**, to the saved
   piece with the action appended (`putTogether` in `db.js` — one transaction across stores, each
   record stamped, the edit counted once; made for this path);
3. the draft takes the saved history, so a later Save writes `[A, B]` rather than the stale `[A]` the
   form was opened with; the draft's other fields keep what was typed, unsaved.

**The unsaved mark.** The box and date fields of the change carry `data-saves-itself` (§13fk), so
choosing them marks nothing. A form with nothing else typed is not left dirty by a change; one with
typing beside it stays dirty, warns on leaving, and Save writes the typing and keeps the change.

**Failure.** If the write fails, the transaction is aborted — the batch and the action exist together
or not at all — the screen says the change was not recorded, and the typing is still in the form,
still unsaved.

Unchanged: the rc113 washing rule, rework, `other` on the group action, the group action itself.

**Checks** — `scripts/try-fabric-transition.mjs`: „unwashed" absent on an existing piece and, forced,
writing no action and no batch; still offered as a new piece's initial box; a change on a clean form
written at once, the form not dirty, leaving without a question; a change with name and notes typed —
the saved piece keeps the old name and notes and gains the action and its batch, the form shows the
typing and stays dirty, leaving warns, Save then writes the typing and keeps all three actions once
each; a write failing on its second store leaves neither record, says so, and keeps the typing; a
finished piece not washed back and still mordanted again. Seen failing against the rc113 handler
(twelve findings), without the draft taking the saved history, and without the dirty exemption.

**Also, to make the gate run:** `try-withdrawal-in-use.mjs` failed on this release — and, run alone,
on rc113 too — with the view empty at its first navigation: the service worker's first-load reload
landing after the check had moved on. The check now removes the worker before the page loads, as
`try-plans-screens.mjs` does. Passed three runs in three. Under artificial CPU load it still fails on
its fixed 400 ms waits; that part of item 34 is unchanged.

---

## 13fp. Reference shows her observations; Records can be searched and sorted (1.0.0-rc115)

### Reference knowledge and a journal observation

- **A reference combination** is expected, accumulated knowledge: what this plant and part, on this
  fibre, with this mordant, by this process, is known to give.
- **A journal observation** is one real result from one trial: a placement's colour, swatch, print
  quality and note.
- **`placement.combinationId`** is the explicit link between the two, set in the trial.

The trial stays the source of truth for the observation. Reference reads it and copies nothing: no
new combination is made from a trial, and no colour, note, quality or date is written into a
combination. Edit the trial and Reference shows the new value.

### „Мои наблюдения" / „My observations"

`placementsFor(record)` — which existed — collects every placement in every trial whose
`combinationId` is the record's id, newest trial first. One renderer, `observationItem`, now draws
each in both places a record is shown (the search pane, up to four with a count of the rest; the full
record, all of them): the swatch from `resultHex`, the colour words, the trial date, the print
quality, the observation, and the trial's title as a link to `#/trials/<id>` — the trial's own
screen, not a copy of it. A field the placement lacks is left out; a placement with no colour reads
„без описан цвят" rather than a dash. The section and its strings were renamed from „Мои позиции" to
„Мои наблюдения"; the heading line no longer says „Потвърдено от n" — an observation can disagree
with what was expected, so it says „n твои наблюдения под този запис".

**Unlinked placements are not guessed.** No match on plant, part, mordant, process or colour: a
placement without `combinationId` appears under no record, even one with the same plant and part.
Linking an observation to a record from Reference is a possible later step, not built.

**Robustness.** A link to a record that does not exist shows nowhere and breaks nothing. Opening the
address of a missing record — which used to throw in `renderRead` and leave the last screen up — now
returns to the list (§11b). Nothing is repaired or deleted.

### Records: search

A search box above the table (the shared `searchBox`), filtering as she types, over the words each row
SHOWS in the reader's language: the result colour, the dye source (plant and part), the conditions
(mordant and strength, fibre, process, pH) and the reliability label. Case- and accent-insensitive
through the shared `matches`; no query language. „n of m" beside it; „Нищо не отговаря на …" when
nothing does; × clears it.

### Records: sort

The four headings — Result, Dye source, Conditions, Reliability — are buttons: first press ascending,
second descending, one column at a time, the arrow drawn by CSS (so it is not in the text `labelCells`
gives each phone card). Text columns sort with `Intl.Collator` in the reader's language; Reliability
sorts in its vocabulary's order (literature, own trial, practice, needs testing), not by the alphabet
of a label. Equal rows keep the library's order. On a phone the table head is hidden and rows become
cards, so the same sort is offered there as one select.

**Order of operations:** favourites filter → search → sort. Each control leaves the others as they
were.

About 160 records: everything is computed on render, no index, no cache.

### Checks

- `scripts/try-reference-observations.mjs` (jsdom): the walnut record shows its own expected result and
  one observation from the silk scarf — топло кафяво, 25.09.2026, ясен, the note, the title, a swatch in
  #9c846d, a link to the trial; an unlinked yarrow and an unlinked walnut leaf are not shown; an empty
  placement shows no dashes; the combination is byte-for-byte unchanged and carries nothing of the
  observation; after the trial is edited Reference shows the new colour and the combination is still
  unchanged; a link to a missing record and the address of one break nothing. Records: search by plant,
  colour, process, mordant; no match; clearing; sort by source both ways, result both ways, reliability;
  the sort kept while searching and mirrored in the phone select; favourites then search. Seen failing
  without descending, without the search, without the missing-record guard, and with links guessed from
  plant and part.
- `scripts/try-reference-screens.mjs` (Chromium): Records and the walnut record at 390 and 320px in both
  languages — no sideways scroll, nothing past the edge, the phone's sort select and the trial link at
  44px, the search not squeezed. Seen failing with the sort select hidden on a phone.

---

## 13fq. Two recipes: the AA working solution reworded, and a concentrated Al/Fe impregnation (1.0.0-rc116)

Content only. No recipe screen, calculator, scaling rule, trial or fabric behaviour changed.

### `seed:aluminium-acetate-prep` — how it is made, reworded

**The id is kept** — every trial and batch that names it still resolves to it. Its ingredients (18 %
potassium alum, 10 % soda ash, 240 % 5 % vinegar, all WOF), type, scaling, fibres, follow-on to
`seed:aluminium-acetate-mordant` and `vinegarPercent` are unchanged; scaled for 28, 100, 364 and 1000 g
it gives exactly what rc115 gave. Only `steps` and `notes` changed.

The old second step read „mix the alum, the sodium carbonate and the vinegar", which reads as all at
once. The five steps now: dissolve the alum in warm water; add the vinegar and the rest of the water;
add the sodium carbonate slowly, in small portions, stirring; let the CO₂ foaming subside between
portions; when it has settled, use the working solution. The notes open with the helper sentence
(quantities for this cloth, made just before use) and the safety note (soda slowly — CO₂, strong
foaming); the vessel-size advice from the old first step moved into that note rather than being lost;
and the result is named a *working aluminium acetate solution*, not pure aluminium acetate. The
attribution paragraph is as it was.

### `seed:nicoleta-al-fe-impregnation` — new

„Концентрирана Al/Fe импрегнираща система за еко принт" / „Concentrated Al/Fe impregnation system for
eco-print". A practitioner recipe shared by Nicoleta, for eco print on cellulose — **not** an aluminium
acetate and not a replacement for one.

**A 1/4 batch, not WOF.** 25 g potassium alum, 250 ml apple cider vinegar (about 6 %), 2.5 g FeSO₄·7H₂O,
13.75 g Ca(OH)₂, each with basis `absolute`, so the quantities never move with the cloth. No `target`,
no liquor ratio, no fabric weight anywhere: the original method does not say how much cloth the
mixture treats, and the recipe says so rather than inventing a capacity.

**Not an aluminium acetate.** Roles aluminium source, acid, modifier (iron) and alkali (lime) — no
`sodium_source`, so the aluminium acetate calculation (`applyAluminiumAcetate`, which needs both an
aluminium and a sodium source and a WOF target) cannot take it. Type `mordant`, so the group action
offers it for mordanting; `appliesTo: ['cellulose']`.

**Steps:** scour hot with sodium carbonate and soap (no quantities — the method gives none); alum into
the vinegar with the least water that helps; iron, stirred 2–3 minutes; lime, stirred — cloudy,
suspended or settling is expected, stir during use; the cloth in for about five minutes; wring and dry;
the chalk bath; rinse with water, no detergent.

**The chalk bath is the library's own.** `requiredFollowOn: ['seed:chalk-bath']` (10 g/L CaCO₃). The
original „a tablespoon in a basin" is not encoded as a figure, and no second calcium carbonate bath was
made. The chalk bath's own second step still speaks of „the cloth that came out of the aluminium
acetate"; it was not edited, being outside this package — see item 37.

**Provenance.** A new source, `nicoleta-practice` (kind `person`, author Николета / Nicoleta). The note,
in both languages, as the owner wrote it: practitioner recipe; the attribution to India Flint not
confirmed in *Eco Colour*; no WOF or capacity in the original; the 1/4 batch keeps its proportions. Not
credited to India Flint or Michel Garcia. **Safety** — lime strongly alkaline (gloves, eyes); ferrous
sulfate dust (gloves, eyes); the concentrated mixture — in the notes and at the steps where each goes in.

### What the schema could and could not say

| Wanted | Fits? | How |
|---|---|---|
| batch without WOF | yes | basis `absolute` on every ingredient; the amount field hides itself (§13dz) |
| fibre: cellulose | yes | `appliesTo: ['cellulose']` |
| source note | yes | `notes` + a `sources` register entry |
| not an ordinary AA | yes | no `sodium_source`; its own code and name |
| `recommendedUses: ['eco-print']` | **no** | said in the name and notes only |
| `applicationType: concentrated_impregnation` | **no** | said in the name and notes only |
| `status: experimental / practitioner` | **no** | said in the notes; the source's kind is `person` |

Recipes have no field for any of the last three, and none was added (item 37). The smallest change that
would carry them: one optional `recipe.usedFor` list over the `process` vocabulary (`ecoprint`), and one
optional `recipe.standardised: false`. Neither is read by anything today.

### Data movement

Pack versions: recipes 0.19.1 → 0.20.0, sources 16 → 17, in the files and `manifest.json`. The language
layer's data fingerprint was accepted with `--accept-data`, which listed exactly: the two packs in the
manifest, the AA recipe (its step count), the new recipe and source, and the order lists they join.
Compared record by record with rc115, no other recipe, source or seed file changed.

### Check

`scripts/try-recipe-content.mjs`: the AA recipe's id, three ingredients, type, scaling, fibres,
follow-on and vinegar strength; its scaled figures at 100 and 364 g; five steps in the right order, in
both languages; the notes' opening. Nicoleta's recipe: one record, the four exact quantities, the
vinegar's kind and strength, `absolute` everywhere and identical at 100 and 500 g, no target or fabric
weight, no sodium source, type and fibre and name, the chalk bath as follow-on and still the only
calcium carbonate bath, the provenance and safety notes, the source record, not credited to Flint or
Garcia, eight steps. In the application: the old AA id resolves, the new recipe opens, and shows no
„% WOF" outside the note that says it has none. Seen failing with an alum line at % WOF, with the old
AA steps, with a sodium source on the lime, and with the AA alum at 20 %.

---

## 13fr. Three corrections: the pH colours, the chalk bath's words, the order of reliability (1.0.0-rc117)

No data model, schema, recipe id, quantity or scaling changed.

### The pH scale (Library → pH)

**Defined in `modules/library.js`:** `PH_STEPS`, fourteen colours, one per place on the bar, and
`PH_BANDS`, the five named bands with the swatch each shows in the legend.

    1 #A94442  2 #B75545  3 #C96A45  │ 4 #D8913F  5 #D9AA3B  6 #C9B84A │ 7 #7E8B63 │
    8 #5F8F86  9 #4C8090 10 #466E8C  │ 11 #566487 12 #665B82 13 #75527A 14 #7C496D
    legend: 1–3 #B75545 · 4–6 #D9AA3B · 7 #7E8B63 · 8–10 #4C8090 · 11–14 #665B82

The old bar was five flat bands — madder, weld, grey at 7, indigo and iron above it — which read as
interface colours rather than as a progression, and ended in graphite. Now: muted reds, ochre and yellow,
an olive at 7, teal and blue, violet; nothing near black.

**The olive at 7 is the application's one green**, by the owner's decision at this release. The rule
„no green" (§13ef, the palette) is about the working surface a swatch is judged against; this is a scale
to be read. Recorded here so the exception is not later taken for a slip.

**The number on each place** is written in whichever of the two inks (`--ink`, `--surface`) contrasts
more, by the WCAG formula (`inkFor`). The old rule — a threshold on raw luminance — put light ink on 3, 7
and 8, where dark reads better. With either ink, four mid-tones stay below 4.5:1 — 3 at 3.98, 7 and 8 at
4.07, 9 at 4.31 — which is the most two inks from the palette can do on these colours without changing
the palette or the type. Recorded, not hidden.

**Visual only.** The band edges, the names, the texts, what moves pH which way — unchanged.

### The chalk bath's words

`seed:chalk-bath` is now the follow-on of two systems — the aluminium acetate working solution and
Nicoleta's Al/Fe impregnation (§13fq) — and its wording assumed the first. Changed: the second step,
from „the cloth that came out of the aluminium acetate" to **„Потопи обработената тъкан в банята с
калциев карбонат за около 10 минути и я движи периодично." / „Immerse the treated fabric in the calcium
carbonate bath for about 10 minutes, moving it periodically."**, and the notes' opening, from „the bath
after aluminium acetate" to „the bath after the mordant treatment". Same id, same 10 g/L, 5 L and ten
minutes, same three steps, same follow-on links. Recipes pack 0.20.1.

### Reliability, in the owner's order

Reliability means how far she can rely on a statement in practice: **own trial > literature > practice >
needs testing** (`own_trial` 1, `literature` 2, `practice` 3, `unverified` 4; the older `confirmed` and
`contradicted` after). The first press on the heading (▲) puts the strongest first; the second (▼) the
weakest. Codes and labels unchanged.

### Checks

- deep-check `ph-scale`, rewritten: the fourteen places in `PH_STEPS` order; 7 alone neutral; no step
  darker than 3:1 against black and none of the three old interface colours; every number in the ink
  that reads better, and at least 3.3:1; the legend's five swatches, each one of the steps its band
  spans. Seen failing with the old ink rule (3, 7 and 8) and with graphite at 14.
- `try-recipe-content.mjs`: the chalk bath's id, 10 g/L, 5 L, ten minutes, three steps, the new second
  step in both languages, and nothing in its steps or opening that assumes aluminium acetate.
- `try-reference-observations.mjs`: the rank table itself, and with one record marked „own trial", ▲
  reading own trial → literature → practice → needs testing and ▼ the reverse.

---

## 13fs. The commercial recipe library, and the owner's own (1.0.0-rc118)

**The policy — for every recipe added from now on.**

- Seed recipes are **practical working recipes curated through Crafty Place practice**, developed with
  reference to several sources, practical experience and comparison of methods. Some are adapted or
  modified. They are credited to `crafty-place-practice` and to nothing else, and their text names no
  person, book or numbered recipe as their origin. This does not claim the chemistry for the studio.
- The **Library** holds books, articles and other sources used for research and comparison. A source
  there does not mean a recipe reproduces it verbatim. Useful sources stay, cited by no recipe.
- A recipe **shared privately by a practitioner** is not distributed without explicit permission.
- **Personal recipes stay separate** from the commercial seed, and leaving the seed never deletes them.
- The full statement is in About („За рецептите в Багра" / „About the recipes in Bagra"); a short one
  sits under the recipe list. Neither says that every recipe has been personally tested.

### Sixteen recipes ship (23 at rc117)

`silk-scour`, `cellulose-scour`, `tannin-bath`, `silk-mordant`, `cellulose-alum-soda-mordant`,
`madder-dye`, `aluminium-acetate-prep`, `aluminium-acetate-mordant`, `chalk-bath`, `pigment-lake-master`,
`watercolour-from-pigment`, `watercolour-binder`, `mordant-print-paste`, `dye-mordant-print-paste`,
`compound-mordant-bright`, `oatmeal-fixing-bath` — all `seed:`. IDs, quantities, WOF and scaling
unchanged.

**Personal only (7):** `nicoleta-al-fe-impregnation`, `pastels-from-pigment`, `pastel-binder-oat`,
`dye-print-paste`, `compound-mordant-dark`, `soy-milk-bath`, `iron-bath-dark`.

**The aluminium–iron mordant.** `compound-mordant-bright` keeps its id and the figures the owner has
tested — 20 % alum, 200 % vinegar, 0.4–0.8 % ferrous sulfate, 10 % soda, all WOF, followed by the oatmeal
bath — and is renamed „Алуминиево-железен закрепител за еко принт" / „Aluminium–iron mordant for
eco-print". The owner decided against carrying the darker formula (2–4 % iron, 12 % soda): untested by
her, and above the library's conservative 2 % iron ceiling. The recipe says only that more iron gives
darker, greyer results and is increased gradually, within Bagra's limits, on a sample first.
`compound-mordant-dark` itself is personal, not merged or removed.

**Text removed:** „Crafty Place — adapted from Boutrup & Ellis, …, Recipe 11B" on both aluminium
acetate recipes (now „Practical working recipe used in Crafty Place practice."); Stopka's table in the
lake pigment's carrier line; „Cliffe's figures and Maiwa's agree" on the mordant paste (now „similar
proportions appear across several sources"); Kelly's batch, Kelly as the version used and Garcia as
her source on the aluminium–iron mordant; Kelly as the version used on the oatmeal bath, which also now
says it can stand in for the chalk bath and that the two are not chemically equivalent.

**Sources.** `nicoleta-practice` leaves the pack: it existed only for the withdrawn recipe. Every other
source stays — Boutrup & Ellis, Stopka, Green, Cliffe, Maiwa, Kelly, Garcia and the rest — in the
Library, now cited by no recipe. `crafty-place-practice`'s own note states the policy. Packs: recipes
0.21.0, sources 18.

### Handing a recipe over instead of withdrawing it

The ordinary withdrawal (§13cb, §13eo) offers a record the pack no longer carries for removal, ticked
unless edited or in use — and on the owner's database that would have removed six of her recipes at the
next Apply. The recipe pack now declares **`retiredToPersonal: true`**:

- a seeded record the pack no longer carries is listed as „Стават твои" / „Becoming yours", ticked —
  handing over removes nothing;
- applying it rewrites the record with every field as it was, `origin: 'user'`, no `packId` or
  `packVersion`, and `retiredFrom: 'bagra-recipes'`; the id stays, so nothing that points at it dangles;
- a fresh install never receives it, since the pack does not carry it;
- the record's own screen says the library no longer distributes it and that it will stay, unchanged.

A flag rather than a list of codes, because a list would write the names of the withdrawn recipes —
Nicoleta's among them — back into the commercial pack. It applies to the recipe pack only; every other
pack keeps the ordinary withdrawal unchanged.

**The owner's database** (backup of 28 September 2026, recipes at pack 0.18.7): 23 recipes before —
22 seeded, one her own; after the update as offered, 23 — the 16, the six of the seven she had (Nicoleta's
recipe was not yet installed there; on a copy that has it, it is handed over the same way), and her own
madder pigment, untouched. 19 recipe references in trials, fabrics and pigment batches, none dangling.

### Checks

- `scripts/try-recipe-provenance.mjs`: the sixteen codes in order; the flag; no seed file naming
  Nicoleta; every recipe crediting the studio alone; no person, book or numbered recipe in any recipe's
  text; the books still in the Library; `nicoleta-practice` gone; the aluminium–iron mordant renamed, same
  id, same four figures, the general note, no trace of 2–4 % or 12 %, the oatmeal bath after it; a fresh
  install holding exactly the sixteen; the two notes on screen. An rc117 library simulated — seven records,
  one edited, two used by a trial and a pigment batch, and a recipe of her own — updated as offered: all
  seven handed over, none offered for removal, each intact with its id, the edit kept, the references
  resolving, a second update finding nothing, and 16 + 8 at the end. Seen failing without the flag, with a
  handover that deletes, and with „Adapted from Boutrup & Ellis" put back into a recipe.
- Guards that read the withdrawn recipes now use records of their own: deep-check's paste without a
  mordant, its source list (a recipe of hers crediting two books), its amount field (madder dye), its
  recipe-as-ingredient (the watercolour and its binder); the iron-ceiling warning in
  `try-withdrawal-in-use.mjs` reads an iron bath written by the check. That script's withdrawal half runs
  against the recipe pack with `retiredToPersonal` taken off, because the ordinary withdrawal it holds is
  still every other pack's. `try-recipe-lines-named.mjs` lost three excuses for lines that no longer ship;
  `try-pack-lifecycle.mjs` finds a recipe's credit through `crafty-place-practice`. deep-check's amount
  field now asks that the OTHER recipe's typed figure is absent, since the madder dye opens at its own
  default weight rather than empty.
- The first full run failed once in deep-check's pH match — the timing fault of item 34, independent of
  the recipes (it writes its own). Two runs of deep-check alone and the next full run passed.

---

## 13ft. Commercial data safety, package 1 — what a restore promises (1.0.0-rc119)

An audit, not a feature. The question: are the local data of a paying customer protected well
enough for a commercial 1.0? The principle agreed for it: **loss, corruption or unexpected
overwriting of a long-kept journal is a launch blocker.** Only what the audit showed to be a
defect was changed; no cloud, no account, no new function.

### What was found sound

- **Coverage.** A backup carries every store except `vocabulary` and `bands`, which hold seed
  data only and are regenerated at every start (nothing writes to them but the start itself).
  Photographs are data URLs inside their records, so they travel in the JSON. Nothing of the
  user's lives outside IndexedDB — no localStorage, no cookie, no cache entry.
- **Replace is a snapshot and is atomic** (§13co): one transaction over every store the file
  carries; a refused row aborts all of it. Now asserted across TWO stores, the cleared one
  included.
- **Ids and timestamps survive** both modes (`putRaw`); relationships are ids, so they survive
  with them. Seed records are laid down again by the next start; the file never turns a
  record of hers into a seed record.
- **The seven personal recipes** (§13fs) and **`seed:aluminium-acetate-prep`** survive upgrade →
  export → restore onto a clean installation, in both modes, whether the owner had applied the
  recipe update before exporting or not; the update never offers the seven for removal.
- **An IndexedDB opened at an older version** only gains stores; `vocabulary`/`bands` are
  recreated below v7 by design.

### The defect — a merge left its records unrepaired (P0)

§13cw made each historical repair run once and put its marker in `settings`, so a snapshot of
a database from before a repair restores the absence of the marker with the records that need
it. That covered `replace` and nothing else. A **merge** adds old records into a database whose
markers say every repair has run, so the added records were never repaired: on the rc56
fixture, five eco-print trials without a `bundle` and four recipes without `sourceCodes`, for
ever. Worse, the eco-print screen renders the roll field for every eco-print trial, so saving
such a trial wrote `bundle: { roll: '' }`; the repair then skipped it for having a bundle, and
its construction steps — still in the record — disappeared from the screen for good. The same
happened to a `replace` from a file with no `settings` in it.

**The rule now.** After any restore, the database's `migrations` marker is the **lower of its
own and the file's, repair by repair** (`reopenMigrations` in backup.js). A file written by a
build that had run a repair carries records already in its shape and reopens nothing; a file
that had not reopens exactly the repairs its records need, and the reload that follows the
restore runs them. Every repair is idempotent — the guard holds that — so a reopened one costs
one walk over its store. A merge that added nothing reopens nothing.

### Four smaller defects, fixed because they sit on the same path

- **The replace question names the file.** The confirmation came before validation and said
  „everything after this backup is lost", which is true of every file and so could not tell
  last month's from last week's. Now the file is validated first, and the question says the
  file's date and how many records of hers will go (`planReplace`). „Hers" is a record not
  from the pack, or a pack record she edited; settings are not counted.
- **A file from a newer database is refused.** `schemaVersion` describes the file and stood at 3
  while the database went from 7 to 10, so it could not say the file came from a newer build.
  A backup now carries `appVersion` and `dbVersion`; `dbVersion` above this build's is refused,
  because restoring it would drop a store this build does not know. Files without the field
  are read as before. **`schemaVersion` must still be raised when a record shape changes
  incompatibly** — that part is discipline, not code.
- **A merge says what it left out.** The policy is unchanged — what is already here wins, the
  file never overwrites — but a record of hers that differed in the file was counted as
  „skipped" together with identical ones. It is counted apart (`differ`) and the screen says
  how many.
- **The download survives Safari.** The link was clicked detached and its address revoked on
  the next line, which Safari cannot take: the download fails while the screen says it was
  made and the counter is reset. The link is now in the document when clicked and its address
  lives a minute. **Not verified on a real Safari** — a manual release step.

### Known and not fixed here (recorded in DOCUMENTATION_DECISIONS_NEEDED §39)

- **„Downloaded" is not „saved".** `lastExportAt` and the counter move when the file is
  handed to the browser; a cancelled save dialog cannot be seen from a web page.
- **Persistent storage is asked only on the backup screen**, and „the browser keeps the data
  permanently" overstates what `persist()` grants: it protects against eviction under
  pressure, not against clearing site data, removing the home-screen app, or Safari's
  deletion of script-written storage for a site not used for a while (installed home-screen
  apps are treated differently). Commercial risk; the wording and the moment are UX work.
- **`migrateFabricActions` writes cloth before its batches**, in separate transactions; an
  interrupted run leaves an action pointing at a batch that was never written. Old databases
  only (stateEvents), no content lost — the action carries the date, recipe and note.
- P2: the plant-photo repair is marked run even when it bailed offline (the photograph stays
  in the record); a replace from an older file leaves stores it does not carry (`plans`)
  untouched; a merge brings in absent session settings (`returnTo`, `language`); a pack that
  ever reused a handed-over code would offer to overwrite it as unedited; rows are checked for
  a key, not for shape; a merge and a pack apply are not one transaction but are safe to rerun.

### The migration matrix

| | scenario | where |
|---|---|---|
| A | fresh install → current | `try-recipe-provenance`, check-boot, deep-check; the start in `try-data-safety` |
| B | old populated DB → current | `try-restore-older` (rc6, rc45, rc56, each written by its own version); IndexedDB v6 → v10 in `try-data-safety` |
| C | recent pre-commercial DB → current | rc56 fixture, replace and merge; the rc117 library in `try-data-safety` |
| D | seeded recipe she edited | `try-data-safety`: kept through the update, replace keeps it, merge keeps the local one and counts the file's |
| E | the seven personal recipes | `try-data-safety`, before and after Apply, both modes |
| F | Plans + Trials + eco-print | `try-data-safety`: bundle, placements, `combinationId`, shared bath, all references |
| G | failure | a repair that throws leaves no marker (`try-hardening`); a restore that fails leaves every store as it was (`try-backup-restore`, `try-data-safety`) |

Invariants, for every scenario: every record of hers is present by id, field for field,
`createdAt` and `updatedAt` included; every reference resolves; every repair is marked and its
effect visible; the seven stay hers; the counter reads zero after a restore and the last backup
is dated to the file.

### Checks

- **`scripts/try-data-safety.mjs`** (new, in `check.sh`): DB A built as an installation that
  has lived, upgraded and exported; each restore runs in a **new process over an empty
  database**, then the start sequence, then a record-by-record comparison. Seen failing on
  rc118 at every fix above: five eco-print trials without a bundle after a merge and a start,
  the same after a settings-less replace, a newer database accepted, no plan, no `differ`, the
  link detached and revoked at once.
- **`scripts/try-restore-older.mjs`** joins `check.sh --release` — in the tree since rc67, never
  gated. It timed out on the second fixture in one browser while each passed alone; it now
  opens a browser per fixture.
- **Manual, before each release:** export in Safari on macOS and on an iPhone, open the file,
  compare the counts with the backup screen.

---

## 13fu. Production update & release safety, package 2 — the release is the cache (1.0.0-rc120)

An audit of how an installed copy is updated. The risk it was asked about: an installed
customer getting mixed or stale application files, a broken worker, an update loop or a
version mismatch that makes the application unusable or dangerous to her data.

### How an update worked in rc119, and the defect (P0)

The worker **did** wait to be told before taking over (`skip-waiting` from the „Обнови" bar),
installed with `cache: 'reload'`, and named its cache for the version. But its `fetch` handler
was **network-first, file by file**, and copied every answer into the running version's cache.
So a release was never a unit:

- after a deploy, an open page's next load took every file from the server as it stood — the
  new release, under the old worker, before anyone pressed anything;
- when one request of fifty failed (a phone in the garden), that file came from the cache and
  the rest from the server — **one page, two releases**. A missing export between two such files
  is a blank screen; a matching one is two releases writing to one database;
- the copies polluted the old cache, so an update whose install failed left an offline copy
  that was **half of each**, and booted that way;
- the fallback read `caches.match` across every cache, including the next version's half-filled
  one during its install.

`try-update.mjs` showed all four on rc119: U2, U4, U5 with two labels in one page, and U3 booting
a mixed cache offline.

### The rule now

**A release is one cache, installed all or nothing, and the running worker answers every file of
its release from its own cache and nowhere else.**

- `install` stores exactly `FILES`, from the server (`cache: 'reload'`), with `addAll` — one
  failure abandons the install and the old worker simply carries on.
- `fetch`: a navigation in scope is the cached `index.html`; a file of the release is answered
  from `caches.open(CACHE)` — never `caches.match` across caches. A file of the release missing
  from its cache is fetched and **not stored**: storing it would put today's server into
  yesterday's release. Anything outside the release goes to the network with this cache as a
  fallback, never written. Other origins are not touched.
- A new version reaches a page only when a new worker is activated: the person presses
  „Обнови", or no page of the old version is open (the browser then activates it by itself on
  the next start).
- `activate` deletes only caches named `bagra-*` other than its own. Cache Storage belongs to the
  origin, and Багра has shared `tskovacheva.github.io` with Глина, whose offline copy it deleted
  at every update.

The price is deliberate: an online person with an open copy sees the new release when she
presses „Обнови" or restarts the application — not on a plain reload.

### Update activation and unsaved work (P1, fixed)

- **First install does not reload.** A page that started without a worker was reloaded when the
  worker first took control — throwing away anything typed in the first seconds, and failing the
  browser checks at random (§13ft).
- **„Обнови" with unsaved work asks first**, in the application's words, before the worker is
  activated for every window.
- **Another window with unsaved work is not reloaded.** When a different window activates the new
  version, a window whose form is dirty gets the bar „new version started in another window —
  save, then Update" instead of a reload. A clean window reloads at once.
- **An older page lets go of the database** (`onversionchange` closes it) when a newer release
  opens it at a higher version, so the new page is not left blank; the old page's next write then
  fails loudly rather than writing old shapes. `onblocked` logs the wait. Both matter from the
  next `DB_VERSION` bump, for every page running rc120 or later.

### Found and not changed

- **Version sources.** `version.js` is the one authority; `sw.js`'s `CACHE` is a second copy by
  necessity (a classic worker cannot import the module), held equal by `check.sh`; the
  changelog's newest entry is now held equal too. The manifest carries no version. Comments
  naming old rc numbers are history, not version sources.
- **Recovery without developer tools.** A broken `sw.js` fails its update and the old worker
  goes on; a failed install leaves the old release whole; a damaged cache entry is fetched from
  the network. A cache deleted by the person means offline fails until the next online start.
  No case found that needs clearing site data.
- **Paths.** Everything is relative (`sw.js`, `./`, `manifest.json`, `start_url` and `scope`
  `./`); no host is named. Works at the root of `bagra.crafty.place` and under a sub-path.
- **Secure context.** Required for the worker (registration is guarded; without it the
  application runs online with no offline copy) — and for `crypto.subtle`, which the plant-photo
  repair calls unguarded: served over plain HTTP the start would stop there. HTTPS is a hosting
  requirement, not a degradation path (DOCUMENTATION_DECISIONS §40).
- **The transition from rc119.** A copy running rc119's worker stays network-first until it
  takes rc120; the one crossing is exposed as before. Pre-commercial copies only.
- **Manifest.** Relative, standalone, 192 and 512 icons in `any` and `maskable`. `lang: "bg"`
  against an English default (§13fi) and no `id` — content decisions, §40.

### Rollback — the operational rule

1. **Never roll a database back.** No release downgrades IndexedDB; migrations only add.
2. **Code may be rolled back only to a release with the same `DB_VERSION`.** An older build
   cannot open a database a newer one upgraded (`VersionError` — every read fails), and it
   refuses the newer build's backups (§13ft).
3. **A rollback ships as a NEW version number**: the good release's files under the next rc, with
   its own `CACHE` name, through the ordinary gate. Re-serving an old `sw.js` byte for byte is
   ignored by every copy that already has it; a new name installs, is announced, and replaces the
   bad release the same way any update does.
4. **When the bad release raised `DB_VERSION`, fix forward** — a new release on the new schema.

### The update matrix, automated

`scripts/try-update.mjs`, real Chromium with the worker on, one origin serving release A or B
(a label in five files, so a mixed page answers with two), able to fail one file (404 or dropped
connection) or go offline: **U1** fresh install, no reload, offline launch; **U2** found, held
across a reload, taken, her work unchanged, the old cache gone; **U3** B's install fails on one
file, two ways — A whole online and offline; **U4** B deployed, one file of it failing on reload —
the page is A, whole; **U5** offline then online — found, not forced; **U6** a repair on the first
start after an update, record not restamped; **U7** three windows — the one pressing is B, the
clean one reloads, the dirty one is told and keeps its work. Seen failing on rc119's worker and
start code in U1–U5 and U7.

`scripts/try-release-files.mjs`, static: `sw.js` parses; every entry exists and none twice; every
file `index.html` loads is in the release; the cache name and the changelog's newest entry carry
the version; the manifest is relative with its icons present. Seen failing on each.

**Not automatable here:** Safari/iOS worker behaviour (update timing, eviction of a home-screen
app), a real host's HTTP headers, and a deploy that is not atomic on the host.

---

## 13fv. „Обнови" activates nothing while another window holds unsaved work (1.0.0-rc121)

A remaining finding on §13fu, raised by the owner. The cache-per-release architecture stands.

### The fault

In rc120 the window that pressed „Обнови" sent `skip-waiting` and the new worker activated at
once. A second window with unsaved work was then shown a notice instead of being reloaded — but
by then the new worker was active, the old release's cache was deleted, that window was running
the old code with its requests answered by the new release, and a clean window could already be
running the new release's migrations. One client on the old version after activation is what
§13fu exists to forbid; `onversionchange` covers only a schema bump, and there it leaves the
draft visible and unsaveable.

### The rule

**The waiting worker activates only when every open Багра window has answered that it holds no
unsaved work.**

- „Обнови" settles the pressing window's own unsaved work (the confirmation of §13fu) and then
  sends `{ type: 'bagra-update' }` to the WAITING worker. It is a request.
- The worker lists every open window in its scope from the browser — `clients.matchAll`,
  uncontrolled windows included — and asks each, other than the one that pressed, over its own
  `MessageChannel`: „do you hold unsaved work?". A window answers from `dirty.js`.
- **All answer „no"** → `skipWaiting()`, activation, the old `bagra-*` caches deleted, every window
  reloaded on `controllerchange` as before.
- **Any answers „yes"** → nothing is activated. The pressing window is told, in both languages,
  that another window has unsaved changes and must be saved or closed first. It can press again.
- **Any does not answer within 4 s** — frozen in the background, or running a release that does not
  know the question — is treated as NOT clean, and the pressing window is told to close the other
  windows. Silence is never read as consent.

**Why not BroadcastChannel.** A broadcast is answered by whoever is listening, so it cannot tell
„nobody is dirty" from „somebody did not hear". The worker's client list comes from the browser,
so every window is asked by name and a missing answer is visible. The Clients API and
`MessageChannel` exist wherever a service worker does, so there is no separate fallback to design:
without a worker there is no waiting release and no update.

**The old cache.** It is deleted at activation, and activation now happens only when no window is
open (the browser's own rule) or when every open window has declared it has nothing to keep and
reloads on `controllerchange`. No window needs the old release after that moment. The
`update.activeElsewhere` notice of §13fu stays as a second line, for the milliseconds between the
last answer and activation.

**Transition.** rc120's page sends the plain `'skip-waiting'`; rc121's worker holds it to the same
rule. rc120 pages do not answer the question, so an update from rc120 with two windows open is
refused until the other is closed — safe, and pre-commercial only.

### The manifest's identity (§40.3)

`"id": "/bagra"`, added before any commercial installation. A browser knows an installed PWA by
`id`, resolved against the origin of `start_url`; without one it is `start_url` itself, so any
later change of start page would make installed copies a different application. `/bagra` is
path-only and names no host, and `try-release-files.mjs` pins it: changing it becomes a decision.

It cannot survive a change of ORIGIN, and nothing can: a browser binds an installed application —
and its IndexedDB, and its caches — to the origin. Moving from `tskovacheva.github.io` or Vercel to
`bagra.crafty.place` is a new installation with an empty database, reached by backup and restore
(§11.4), whatever the `id`. This is why the production origin should be settled before the first
customer installs.

**`lang` is not the interface language.** It declares the language of the manifest's own text —
`name`, `short_name`, `description`. The description is Bulgarian and the name mixed, so `"bg"`
describes the manifest correctly. It does not contradict the English first opening (§13fi), which
is the application's, not the manifest's. Left as it is; a translated manifest would be a
branding decision.

### Checks

`try-update.mjs`: **U7a** three clean windows — one presses, all three are B, one cache. **U7b** a
dirty second window — refused and told; B still waiting, A active with its cache, both windows A
whole, the work kept; after a save, Update goes through and only then is A's cache gone. **U7c** B
raises `DB_VERSION` (10 → 11, a transformation of the served `db.js`) — while B waits, a new window
is A, the database stays at 10 and the dirty window can still save; after the save, 11, both
records there. **U7d** a window that cannot answer — refused with its own message; once it is
closed, Update goes through. U7b, U7c and U7d seen failing on rc120's worker and page at the
refusal they expect. `try-release-files.mjs` pins the manifest `id`, seen failing on rc120's
manifest.

---

## 13fw. deep-check waits for what the application is doing, not for a quiet moment (1.0.0-rc121)

A fault in the release gate, not in the application. rc121's first release runs failed in
`deep-check.mjs` at a different place each time — a step photograph, a reference match, a pH bath,
a `null.title` rejection — and the same happened on rc120's files. Nothing in the application was
changed.

### Two causes, each reproduced on purpose

`BAGRA_DC_LATENCY=<ms>` (diagnostic, off unless set, never set by `check.sh`) makes every
IndexedDB step in the harness take at least that long: fake-indexeddb schedules its steps through
`globalThis.setImmediate`, which the harness wraps. It stands for a busy machine and lets the
waiting be tested deliberately.

1. **The start was a fixed 1.5 s sleep.** The start (packs, repairs, first route) takes 0.4–0.6 s
   on an idle machine; at 4 ms per step it does not finish in 1.5 s, and the first check read a
   library still being written („a fresh install already differs from its own packs").
2. **`settle()` took 30 ms without a change for „finished".** That is also true between a click and
   the first write of its render, while the handler is still reading the database. With the start
   fixed and the old `settle()`, 4 ms per step gave 18 failures, among them the step photograph
   the gate had shown. rc53 had met the same fault and delayed PRODUCTION code by 150 ms
   (`seed-ui.js`, `LATE_MS`) to stay clear of it.

Handler promises alone did not close it: `app.js`'s `hashchange` listener calls `route()` and drops
the promise — ordinary browser code — so a navigation's render is invisible to handler tracking.
With tracking only, 4 ms still gave 13 failures.

### What the harness waits for now

- **The end of the start**, observed: its last statement is `registerWorker()`, whose first line is
  the application's only `'serviceWorker' in navigator`; a `has` trap on `navigator` marks that
  moment. 60 s without it is a FAIL.
- **`settle()` waits for idle**, which means all of: no promise returned by an event handler still
  outstanding (every listener and `on<event>` property is wrapped before the application loads);
  no fake-indexeddb step scheduled; no address waiting for its `hashchange`; no library mark in
  `data-counted/checked="pending"` — and, with all of that true, the view's content identical on
  two polls in a row. Not settling in 20 s is a FAIL with its reason; it used to return silently
  after 1.5 s.

Deterministic because the harness polls from timers, and a render's database reads chain through
microtasks that complete before any timer runs: between two polls there is either a next step
already scheduled or none because the chain is done. Every term is something the application is
doing, observed; none is an estimate of how long it takes.

### Evidence

At 4 ms per step: the original harness failed at the start; fixed start with the old `settle()`, 18
failures; handler tracking only, 13; the final harness passed, and passed again at 10 ms per step
with a second deep-check competing for the processor. Ten consecutive normal runs on one tree:
10/10, 58–68 s each. No retry, no longer sleep, no assertion removed.

`LATE_MS` in `seed-ui.js` stays: it also stops a search from starting a comparison per keystroke,
which is a reason of the application's own.

---

## 13fx. Commercial seed, asset and provenance hygiene (1.0.0-rc122)

Package 3 of the commercial readiness audit: whether what a customer receives is clean of private
material, wrong attribution and assets of unknown licence.

### Found sound

The recipe pack holds exactly the sixteen of §13fs, each credited to `crafty-place-practice` alone,
with no person, book or numbered recipe in its text; the seven personal recipes are in no seed file;
`seed:aluminium-acetate-prep` is there once. 57 sources, no code twice; every source code in every
pack resolves (an empty `sourceCode` is the application's own „no source", `library.js`). Fonts:
Geist and Source Serif 4, OFL-1.1, bundled with their licences, no remote dependency. No third-party
runtime code; npm packages are test-only. App icons are first-party (Stage 7a). No NC asset.

### Fixed

- **The release is an artifact, not the repository (P0).** A static host serving the repository
  would have published the owner's journal backups (`test/older-backups`), withdrawn records
  (`archive/`), the attribution working notes (`docs/`), this specification and the decision log.
  `scripts/make-release.mjs` builds `dist/` from an ALLOWLIST — the worker's `FILES`, `sw.js`, and the
  licence texts named in `assets.json` — and checks it: exactly that set, no forbidden path, every
  file the worker installs and every file `index.html` loads present. 133 files at rc122. **Only
  `dist/` is deployed.** The source repository must ALSO be private before launch — the artifact
  and a private repository protect different things, and both are needed.
- **Two Library notes said a shipped recipe came from them (P0).** rc118 took the attribution out of
  the recipes and left it in the Library: Maiwa's course note said the mordant paste's mixing
  warnings were „taken from here", and Garcia's that he „reaches Bagra only through Alison Kelly" for
  the compound mordant. Both are now research bibliography — what the source covers, that it is in
  the Library for research and comparison — and Garcia's says Bagra attributes no recipe to him. Both
  entries stay. Sources pack 19.
- **A photograph shipped that nothing showed (P1).** `paubrasilia_echinata.jpg`, withdrawn with its
  plant at rc77, was still cached and shipped with no visible credit; moved to
  `archive/withdrawn/images/`.
  **Corrected at rc128 (§13gd): that judgement was wrong.** The file was unused by the PACK, but §13es
  had kept it on purpose — a withdrawn record kept because her work points at it still names it, on
  every copy installed before rc78. Those copies lost the picture. §13gd points such records at the
  shipped file with the same picture.
- **The icon sprite's licence did not ship (P1).** The 62 marks in `index.html` are redrawn from
  Lucide (§13bh documents twelve; the rest are not recorded, so the sprite is treated as
  Lucide-derived as a whole). Lucide is ISC, with an MIT notice for icons derived from Feather; both
  allow commercial use and require the notice in all copies. `licences/LICENSE-lucide.txt` ships.
- **The GFDL text did not ship (P1).** Two photographs are GFDL only (`prunus_domestica`,
  `biancaea_sappan`) and one more dual-licensed with it; the GFDL requires its text with every copy.
  `licences/GFDL-1.2.txt` ships (SPDX text).

### The asset registry

`assets.json` (development file, not shipped): every distributed non-code file by path prefix —
creator, licence, attribution, notes — and the licence texts to ship. Plant photographs are licensed
per photograph in `photoCredit` and the registry points there. A shipped file matching no entry, or
with an unknown or non-commercial licence, fails the gate.

### Checks

- **`scripts/make-release.mjs`** builds and verifies `dist/` (layer 3g'').
- **`scripts/try-commercial-content.mjs`**: the sixteen by code, credited alone; no code twice;
  `retiredToPersonal`; aluminium acetate once; sources unique and resolving; no Library note with the
  provenance phrases rc121 carried (eight, BG and EN, narrow on purpose); the artifact built to a
  temporary directory; none of the seven nor Nicoleta named in anything shipped; every shipped asset
  under a known commercial licence; the GFDL text present when a GFDL photograph ships; the sprite
  registered with its notice. Seen failing on: rc121's notes, a photograph set to CC BY-NC, a
  document added to the worker's list, a personal recipe put back, an unregistered font.
- **`try-update.mjs` runs against `dist/`** in the release gate, so the update matrix boots, installs,
  goes offline and updates from the files that ship.

### Left for the owner (DOCUMENTATION_DECISIONS §41)

The warning text of `mordant-print-paste` (no Maiwa material in the repository to compare it
against); whether the sumac photograph (CC BY-ND, 560×372, 3:2) was cropped; the exact GFDL version
of the two photographs and whether Commons offers them under CC as well; a Credits page with licence
links and „resized" notes (CC BY 4.0 asks for both where practicable); the repository made private;
deploying `dist/` only.

---

## 13fy. Photograph licences: the CC alternatives, the deed, the change (1.0.0-rc123)

A last licence-compliance pass on §13fx, asked by the owner.

**The two GFDL photographs use the CC licence their source also offers.** Checked on Commons:
`prunus_domestica` (YAMAMAYA) is offered under GFDL 1.2+ and CC BY-SA 3.0 / 2.5 / 2.0 / 1.0 —
Bagra distributes it under **CC BY-SA 3.0**; `biancaea_sappan` (J.M.Garg) under GFDL 1.2+ or CC BY
3.0, „you may select the license of your choice" — **CC BY 3.0**. Nothing ships under the GFDL, so
its text left the release. The other choices recorded as dual are made the same way, the first
named: CC0 over „Public Domain / CC0", CC BY-SA 3.0 over its GFDL and CC BY 2.5 alternatives, CC BY-SA
4.0 over 2.5. What the source also offers is kept in `licenceAlternatives`.

**The sumac photograph is withdrawn.** It was the one CC BY-ND image, and it was added by hand
outside the import scripts (§13at), so nothing could show it was not cropped, and ND allows no
adaptation. It is in `archive/withdrawn/images/` with its credit in `archive/README.md`; the plant
ships without a photograph until a CC0, CC BY or CC BY-SA one replaces it (a file cannot be fetched
from this build environment). `try-boot-and-photos.mjs` names it as withheld with its reason, and
fails if it regains a photograph without leaving the list, or another plant loses one.

**Every photograph says what was done to it.** Both import scripts scale both axes by one factor and
re-encode — no crop in code — and the two checked against Commons agree: 1280×960 became 560×420,
701×600 became 560×479. So every shipped photograph records `modified: 'resized'`, shown as
„Преоразмерено за Багра" / „Resized for Bagra".

**The credit beside the picture is the full attribution.** `photoCredit` gains `licenceUrl`, derived
from the licence by one rule (CC licences to their deed on creativecommons.org, CC0 to the
dedication, Public Domain to the Public Domain Mark). The plant screen shows: author · licence,
linked to its deed · „source", linked to the original · the modification note. No credits page is
needed for the photographs: everything the licences ask for is where the image appears.

**Shipped photographs by licence (56):** CC BY-SA 3.0 21, CC BY-SA 4.0 13, CC0 6, CC BY 4.0 5,
Public Domain 4, CC BY 3.0 3, CC BY 3.0 US 1, CC BY-SA 2.0 1, CC BY-SA 2.5 1, CC BY 2.0 1. No ND,
no NC, no GFDL.

**Checks.** `try-commercial-content.mjs` judges each shipped photograph: a recognised licence; the
`licenceUrl` equal to that licence's deed, derived independently; author and source for an
attribution licence; a modification status; NoDerivatives only with an audited no-adaptation record
(the list is empty); GFDL refused; the GFDL text shipped if and only if a GFDL asset is. Seen failing
on six broken copies, one per rule.

---

## 13fz. The sumac has a photograph again, cropped and said so (1.0.0-rc124)

A corrective pass on §13fy, asked by the owner: the plant was not to ship without a photograph.

**The photograph.** *Rhus coriaria* at Shio-mgvime by **Lazaregagnidze**, Wikimedia Commons, **CC BY-SA
3.0 Unported** — checked on the Commons page; original 4288×2848. The file used is Commons' own
960×638 rendition of it, supplied by the owner (this environment cannot fetch from Commons); its
proportions are the original's.

**Cropped, because the licence allows it and the screen needs it.** The plant screen shows a
photograph as a 96 px square cut from the centre, and so do the season panel and the thumbnails. The
crop (600×450 at 340,20 of the 960 px file, 4:3) puts the fruiting panicle — what makes this plant
recognisable and what dyes — in the middle, with the serrated pinnate leaflets either side, so the
square shows the fruit and the full frame shows the leaf. Then the import scripts' own resize and
compression: 560×420, quality 72, progressive.

**Said so.** `modified` gains a second value, `'cropped-resized'`, shown as „Изрязано и преоразмерено за
Багра" / „Cropped and resized for Bagra". The other 56 stay `'resized'`. The commercial check accepts
the two values and refuses a crop under any NoDerivatives licence.

**In the current model.** `scripts/add-plant-photo.py` adds one plant's photograph as a file in
`seed/images/plants/` with its hash in `seed/plant-photos.json` (SHA-256 of the JPEG as a data URL,
what `migrate-photos.js` compares), with the import scripts' size and quality and an optional crop.
It refuses a crop for an ND licence and writes `licenceUrl` and `modified` itself. The two import
scripts of §13at/§13ay predate the file model and still write data URLs; this is the one to use now.

**Invariants.** The withheld list in `try-boot-and-photos.mjs` is empty again: every plant ships a
photograph. 57 photographs; `dist/` 132 files (77 non-code). Plants pack 0.14.4. Shipped photographs by
licence: CC BY-SA 3.0 22, CC BY-SA 4.0 13, CC0 6, CC BY 4.0 5, Public Domain 4, CC BY 3.0 3, and one
each of CC BY 3.0 US, CC BY-SA 2.0, CC BY-SA 2.5, CC BY 2.0. No ND, NC or GFDL.

---

## 13ga. Production architecture and deployment (1.0.0-rc125)

Package 4 of the commercial readiness audit. What Bagra needs from a host, which host, and what the
repository can settle before anyone touches an account. The runbook is `docs/PRODUCTION_RELEASE.md`.

### What Bagra needs from a host

Static files, a custom subdomain with automatic HTTPS, response headers set per path, deployments that
switch atomically and are kept as history, and a way to upload a directory that is not a repository.
No server code, no rendering, no build on the host.

### The decision

**Cloudflare Pages, Direct Upload, two projects.** `bagra` serves `https://bagra.crafty.place`; `bagra-staging`
serves its own `*.pages.dev` origin. Chosen over the alternatives for one property more than any other:
with Direct Upload the provider never sees the repository — `wrangler pages deploy dist` uploads a
named directory — so deploying the repository root is not a mistake anyone can make. It reads the
`_headers` format, switches deployments atomically, keeps them as history, and attaches a subdomain by
CNAME from DNS held elsewhere, so `crafty.place` can stay with Wix. Netlify is the equivalent fallback
(same `_headers` format, `netlify deploy --dir=dist`). Vercel would do it with its own header format.
GitHub Pages cannot set response headers and serves a repository; it stays a development copy only.
Prices and free-tier limits change and are to be checked by the owner at signup; none is assumed here.

### The origin

`https://bagra.crafty.place` is final, and it must exist before the first customer installs: an
installed application, its IndexedDB, its caches and its storage belong to the origin, and a move is a
new installation with an empty database reached only by backup and restore. Everything in `dist/` is
relative (`./`, `sw.js`, `manifest.json`, `start_url` and `scope` `./`), so it runs at the root of that
host with nothing changed. **The manifest `id` stays `/bagra`**: it resolves to
`https://bagra.crafty.place/bagra`, an identifier and not a page, path-only so it names no host, and
pinned by the gate (§13fv). `/` would serve equally; there is no reason to trade a pinned value for
another before anyone has installed, nor any after.

**Staging is another origin.** `*.pages.dev` of a separate project: its installs, database and caches
can never be mistaken for production's, and search engines do not index `pages.dev` previews of a
non-production project as the product. The same `dist/` goes to staging and then to production —
promoted, not rebuilt — so the artifact carries no environment marker; the address says which it is.

### Caching — every path revalidates

No file name in Bagra is content-hashed: `app.js` is `app.js` in every release. So **nothing is
`immutable` and nothing has a long lifetime**; every path is `Cache-Control: no-cache` — stored, but
checked before use, a 304 when unchanged. The service worker is the offline cache: it installs each
release with `cache: 'reload'`, past the HTTP cache (§13fu), and serves from its own. HTTP caching
therefore serves only a first visit and a browser without a worker, and those must receive one
release, not yesterday's `ui.js` beside today's `app.js`. `sw.js` in particular is `no-cache` and
registered with `updateViaCache: 'none'`, so every start asks the server for it. Bagra is a few MB
and a 304 costs nothing; a long lifetime would buy nothing and risk a mixed first load.

### Security headers

- **Content-Security-Policy:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self';
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`. Bagra has no inline
  script, no inline handler, no `eval` and no remote resource, so script is locked to the origin with no
  change. Styles keep `'unsafe-inline'` — one `<style>` block and 46 style attributes in templates;
  removing them is a refactor with nothing to show for it, since inline style cannot run code.
  Photographs of hers are `data:` URLs; the backup download is a `blob:` URL.
- **`X-Content-Type-Options: nosniff`**, **`Referrer-Policy: strict-origin-when-cross-origin`** (links to
  sources and licences send the origin only), **`Permissions-Policy`** turning off camera, microphone,
  geolocation, payment and USB — none is used; photographs come through a file input.
- **HTTPS:** the host's certificate, renewed automatically, and its HTTP → HTTPS redirect. **HSTS waits:**
  a long max-age, and preload above all, are hard to undo on a domain that also carries the Wix site;
  add a short max-age once production has run cleanly for a while.

### Proven, not assumed

`try-update.mjs`, run by the release gate against `dist/`, now applies `dist/_headers` to every response
(the CSP above all) and reports a CSP refusal as a failure. U1 walks every route the navigation offers
(18) and opens a plant showing a photograph of hers as a `data:` URL. Seen failing with a policy that
refused `data:` images. Cache-Control alone is kept at the test server's five minutes, on purpose, so a
worker reading through the HTTP cache would still be caught.

`try-production.mjs`: two builds byte-identical (133 files); no host and no repository prefix in what
runs (comments excepted); nothing loaded from another origin; manifest `./`, `./`, `/bagra`, standalone;
the worker registered relatively at the root; version.js, the worker's cache name and the changelog
agree; every path revalidates and nothing is immutable; script locked to the origin, no framing, no
plugins; nosniff; no credential pattern. Seen failing on each.

### The future entitlement boundary — not built

A small API on its own origin, `api.bagra.crafty.place` (or a serverless function behind it). It holds
commercial entitlement and nothing else — never a trial, a cloth, a journal or a photograph; those stay
in the browser. The browser asks it whether a licence is valid; the Merchant of Record's webhook tells
it about purchases and refunds, with a signing secret that lives there. A secret the customer must not
know never enters `dist/`: the PWA can hold only what anyone can read. The CSP will need `connect-src`
to name that origin when it exists; that is the one change to `_headers` it implies.

### Monitoring

An external uptime check on `https://bagra.crafty.place/`, alerting by e-mail; optionally a keyword check
that `/version.js` holds the released version. No analytics, no crash reporting.

---

## 13gb. Pre-1.0 polish: one name, Plans v1.1, the pigment colour in the list (1.0.0-rc126)

### Bagra in both languages

The English interface said „Rubia" in three places: the application's name — and so every window
title, `<page> · Rubia` — the backup-file error and the welcome. All three say Bagra; §15.1 records the
change of decision. The Bulgarian was always Багра and the manifest always named Багра. *Rubia
tinctorum*, Rubiaceae and the file names after them are the plant and untouched.
`try-commercial-content.mjs` now refuses the product name „Rubia" anywhere in what ships while letting
the genus stand, and requires `app.name` Багра / Bagra; seen failing on rc125's strings.

### Plans v1.1

**Plans list → the plan, to read → Edit.** `#/plans/<id>` now shows the plan as it stands — its status,
its notes as text, the source, the picture, the checklist — with Edit at the top right and „Планове"
back. Not a form with its fields disabled: no input, no select, no textarea. One thing works without
Edit: a tick. §13fk made a tick a finished act written at once, and that holds here; the words of a line
are text. `#/plans/<id>/edit` is the editor of v1, unchanged in behaviour; its back leads to the plan,
and Save returns to the plan, read — as a cloth and a plant already do. `#/plans/new` is the editor.

**Three optional fields**, absent on every plan written before and meaning nothing when absent:
- `sourceLabel` — what the source is, in her words („Printing with Botanicals — Laura Mead");
- `sourceUrl` — where it is. `http(s)` as typed; a bare `facebook.com/…` gains `https://`; any other
  scheme (`javascript:`, `data:`, `file:`) is refused at Save and again when drawn, since a restored
  backup can carry anything. Shown as „Отвори източника", `target="_blank"`, `rel="noopener noreferrer"`.
  No embedding, no preview, no fetching: the address is followed by a person or not at all;
- `referenceImage` — one picture, a screenshot or a photograph of where the idea came from.

**The picture uses what Bagra already does with a person's pictures.** `photo.js` → `shrinkResult`:
1280 px on the long side, JPEG quality 0.82, as a trial's result photograph — enough to read a
screenshot of a post, a fraction of a phone camera's 12–20 MB. A data URL in the plan record, as trial
and fabric photographs are: so it is in every backup without a change to the backup, restored with
the plan in either mode, and gone when the plan is deleted — there is no second store to leave an
orphan in. One picture: add, replace, remove. No gallery, no upload, no remote image.

**No migration and no DB_VERSION change.** The fields are optional members of a record whose store
already exists; an rc125 plan opens, reads, ticks and saves with its status, checklist and notes as
they were (`try-plans.mjs`). The plan's guard of „exactly its seven fields" now names ten — the seven
and the three.

### The pigment colour in the list

The colour is `swatches[].hex` on a batch, the field the batch screen edits with its colour picker. The
list already drew it — into a `<span class="swatch sm">` that no rule gave a size: `.swatch` is sized
only inside `.phband` and `.swatchrow`, so the colour was recorded and drawn 0×0. Now `.swatch.sm` is
14 px in a row and `.swatchline .swatch` 28 px above a group's table, each with an inset outline so a
near-white is still seen. The name and the colour come from the same swatch (the one with a colour,
else the first; it used to be the first swatch's name beside another swatch's colour). The swatch is
`aria-hidden`: the name beside it carries the information and is always shown. A batch without a
colour draws its name alone. No field added.

### Checks

- `try-plans.mjs`: the read view (Edit, no Save, no field, tickable checklist, lines as text); Edit →
  editor; a `javascript:` address refused and nothing saved; a bare address normalised; Save → the plan;
  the link's target and rel; the picture shown and kept by a save; an rc125 plan without the fields.
- `try-plans-screens.mjs` (Chromium): the read view and the editor at 390 and 320 px in both languages,
  with a long source and a wide picture; a 2400×1600 picture given to the editor's file input becomes a
  1280×853 JPEG, Save shows it on the plan, the record holds it. The pigment list at 1280 and 390 px:
  the colour drawn 14×14 in its own colour, outlined, `aria-hidden`, beside its name; colour and name from
  one swatch; no empty swatch; the group's colour above its table. Seen failing on rc125 (0 px wide).
- `try-data-safety.mjs`: the plan in DB A carries a source and a picture, compared field for field after
  replace and merge onto a clean installation.

### Release impact

Data safety: one plan field holds a picture, inside a record the backup already carries — covered by
the round-trip above, nothing in backup.js changed. Update safety: no change to the worker or the
start. Commercial content: a person's picture is her data, never a shipped asset. `dist/`: the same
files, rebuilt.

---

## 13gc. Studio System v1 — status colours, the working label, the code dictionary (1.0.0-rc127)

A paper tag pinned to a piece of cloth, in the colour of the stage it has reached; the same colour in
the app. From across the studio the colour says how far along a piece is; in the hand, the tag says
which piece and what was done to it. **Labels render the history; they never store another one.**

### The audit, and three decisions the owner took

The model has five boxes (`STATE_ORDER`), each the result of the latest box-moving action: `unwashed`,
`scoured` (wash), `mordanted` (mordant), `dyed` (dye, also from work), `finished` (finish). Tannin is
not a box (§13bd): it is a treatment a piece carries, because from tannin a piece may go to an eco
print, to a paste print, wait for alum or be finished as it is. `finished` is not „dyed": a piece can
be finished washed and tanned and never dyed. The tag number is `fabric.label` (`П-028`) — reserved
on save, stepping over numbers in use, a hand-typed duplicate refused, its prefix a setting because
the tag does not change language: the permanent identifier, reused. Every action keeps its
`recipeId`, date, bath and work, so the whole history is derivable; the chemistry is not — a recipe
offers alternatives, and an action records the recipe, not the choice.

1. **T is derived, not a box.** A washed piece carrying tannin applied since it was washed shows as T.
   §13bd stands; tannin before the wash does not count; a mordant afterwards makes it M.
2. **`finished` stays its own state.** The tag's colour is the last processing stage reached; a
   finished piece is shown as that stage with „завършен" beside it, and the filter keeps an
   uncoloured „Завършен". The five studio chips count pieces still in work.
3. **Recipes gain an optional `shortCode`**, naming the WHOLE treatment the recipe applies; a recipe
   without one is shown by its name.

### The five

| Code | BG | EN | Colour | Icon |
|---|---|---|---|---|
| RAW | Неизпран | Raw / Unwashed | `#9DB08E` sage | `s-unwashed` |
| W | Изпран | Washed | `#8FAAC4` muted blue | `s-scoured` |
| T | Таниниран | Tannin treated | `#BD8450` warm ochre | `c-tannin` |
| M | Мордантиран | Mordanted | `#D8C35A` mustard | `s-mordanted` |
| D | Обагрен / отпечатан | Dyed / Printed | `#E08A73` coral | `s-dyed` |

Dark text (#2A2724) reads on each at 4.7:1 or more; the closest two are 50 apart in RGB; none is
saturated beyond 0.6 or red. A first choice of ochre and mustard was only 37 apart and was moved.
These are status tokens beside the palette, not part of it: the working surface stays neutral and
colour appears only where it is the information — always with its icon, code and name. The
interface's own green rule is about the working surface; sage here is a status, at the owner's word.
The icons are the sprite's own.

### One derivation each, in studio.js

`deriveStudioStatus(fabric)` → `{ code, status, finished, box }` — behind the filter chips, the list,
the record and the label. `deriveStudioTreatmentSummary(fabric, { recipes, trials }, lang)` →
`{ text, date }`: M — the latest mordant's code and every treatment after it („AA + CaCO₃"); T — the
tannin since the wash; W — the wash's recipe; D — the technique of the colouring work (`EP` for an eco
print, `DYE` for a bath, `MP` or `DMP` for a paste). `deriveProcessTrail(...)` → every stage reached,
in order, with what did it: `W → M (AA + CaCO₃) → D (EP)`; finishing ends the trail without becoming
a stage. All pure; studio-ui.js draws them.

### On screen

**Fabrics:** the five chips carry their colour as an edge and a tint, with icon, code, name and count;
„Завършен" beside them, uncoloured. Every row's badge is the same token as its chip. **The record:**
the badge beside the name; a Studio label card — the working label as it prints, the trail, and two
Print buttons. **The label:** 70 × 40 mm, the tag number, `M · МОРДАНТИРАН`, the summary, the date.
Print shows that label and nothing else (`@page` 70 × 40 mm); „for coloured paper" prints it black on
white, for paper already the stage's colour. „Мордантиран" is the stage's name in the Studio System;
„закрепител" stays the word for mordant everywhere else (193 times in the seed) — no global replace.

**Library → Система за ателието / Studio System:** the five as a legend, from the same tokens; how to
read a tag, drawn by the same function from a made-up piece numbered with her own prefix; the trail
explained; the code dictionary, searchable, each code with its BG and EN names, group, formula, kind
of code and use; and the note that codes are an identification aid and do not replace the complete
record.

### The code dictionary

35 codes in five groups. Each says what kind of code it is and claims no more: **formula** (as
chemistry writes it — Fe, Na₂CO₃, CaCO₃, Ca(OH)₂, NaOH, K₂CO₃, NaHCO₃, AcOH, Na₂S₂O₄), **practical**
(dyers' abbreviations — AA, PAS, AS, ATF, COT, CA, TA), **studio** (Bagra's own, not a standard —
the five stages, TAN, SOY, VINEGAR, FRU, GLU, MOL, AAc, DYE, EP, MP, DMP, PIG, BLK, IND).
Collision rules, held by the gate: one code one meaning; COT is cream of tartar, never cotton; AA
aluminium acetate and AAc ascorbic acid; CA citric acid, never calcium; vinegar is VINEGAR with its
strength, not AcOH; a formula wins an ambiguity; fibres and plants are not coded.

**Recipe codes (recipes pack 0.21.1)**, each the whole of what the recipe applies, read from its
ingredients: `silk-mordant` PAS · `cellulose-alum-soda-mordant` PAS/AS + Na₂CO₃ (either alum) ·
`aluminium-acetate-mordant` AA · `chalk-bath` CaCO₃ · `tannin-bath` TAN · `compound-mordant-bright`
PAS + Fe + Na₂CO₃ + VINEGAR · `mordant-print-paste` MP · `dye-mordant-print-paste` DMP. No code where
the dictionary has no honest one: the scours, the oat bath, the aluminium acetate preparation (not a
treatment of cloth), madder and the pigment recipes. Installed copies receive the codes through the
usual recipe update; a recipe she edited is not offered them and shows its name.

### Data

No store, no `DB_VERSION`, no migration. `finished` untouched. The only data change is the optional
`shortCode`; it travels with a recipe in every backup (`try-data-safety`: a recipe of hers carries
„PAS + COT" through replace and merge onto a clean installation). A backup from before restores as
it was and its pieces read by recipe name.

### Checks

- `try-studio.mjs`: the five unique in code, colour, icon and both names; icons in the sprite;
  contrast, distance, saturation, not red; 35 codes none twice nor twice by case; the collision rules;
  the eight recipe codes, every token in the dictionary; eleven status fixtures (T before and after the
  wash, finished from dyed and from tanned, unmigrated, state-only); nine summaries (AA + CaCO₃ dated by
  the chalk, PAS + COT, the name fallback in both languages, TAN, EP, DMP, DYE, RAW); four trails; every
  cloth in an rc56 backup read without change.
- `try-studio-screens.mjs` (Chromium, 1280 and 390 px): each chip's colour, code and count; each row's
  badge in its chip's token; badge text at 11.7:1 or better on its tint; no sideways scroll; T and
  Finished filter to their pieces; the record's badge, label and trail; Print alone, 70 × 40 mm, coral
  in colour and white in ink, cleaned up after; the Library tab in both languages with the legend in
  the same tokens, all 35 codes, the example tag and trail, the note, and search.

---

## 13gd. A kept record's photograph, pointed at the same picture (1.0.0-rc128)

**The fault, found by the owner on her own copy.** Sappanwood took its own id at rc78 (§13es); the old
record `seed:paubrasilia_echinata` stays in any copy where her work points at it, and still names the
file it shipped with, `seed/images/plants/paubrasilia_echinata.jpg`. §13es said that file stays for
that reason. Package 3 (§13fx, rc122) judged it unused by looking at the PACK, where no record names it,
and stopped shipping it: on her copy the kept plant lost its photograph. And `seed/plant-photos.json`
kept the file's entry, so the table of shipped photographs named a file that did not ship — no check
compared the two.

**The same picture ships.** `paubrasilia_echinata.jpg` and `biancaea_sappan.jpg` are the same file, byte
for byte (SHA-256 `fa856059…`), and the kept record carries that hash.

**The repair — cleaner than shipping the file twice.**
- `repointPlantPhotos()` (migrate-photos.js), at every start: a plant record whose `photoSrc` is not a
  shipped file is pointed at the shipped file with the SAME hash, and given the credit that file ships
  with (taken from the library record that shows it, so a normal start still does not fetch the plant
  pack). A record whose hash no shipped file has is left exactly as it is — nothing is guessed. Only
  the picture's address and credit of a library record change; her trials, batches and recipes keep
  the old id as §13es decided. Structural (§13cv): not restamped.
- **Not a marked pass.** A marker would be written even when the table could not be read offline (the
  P2 of §13ft), and a later release that stops shipping another file is covered without a new marker.
  Once done it does nothing; its cost is one file from the worker's cache and the plant store.
- `seed/plant-photos.json` loses the stale entry: the table names shipped files only.

**Checks.**
- `try-release-files.mjs`: every photograph in `plant-photos.json` is on disk and in the release. Would
  have failed at rc122.
- `try-boot-and-photos.mjs`: one record pointed, its hash and the CC BY 3.0 credit, not restamped; a hash
  no file has left alone; a record whose file ships untouched; a second run does nothing — and the
  unchanged start still fetches no plant pack.
- `try-plant-id-change.mjs` (Chromium, the real rc77 record): the kept record's file answers 404; the start
  points it at `biancaea_sappan.jpg` with its credit; another plant and her trial on the old id untouched;
  run again, nothing; the plant's screen shows the photograph.

---

## 13ge. Studio Process Summary v1 (1.0.0-rc129)

On a piece's record, under the studio label: what was done to it, in rows that can be copied onto a tag
by hand. A projection of what is recorded; nothing is stored. „Derive first; store only what cannot be
recovered" — and nothing in this package needed storing.

### What the record knows

| Detail | | From |
|---|---|---|
| Stage | reliable | `deriveStudioStatus` (§13gc) |
| Preparation | reliable to the recipe | the actions' recipes, their `shortCode` or name |
| Technique | reliable | the colouring work's `processCode`; a paste work → MP / DMP |
| Plants (eco print) | reliable | the work's placements → plant names in the language shown |
| Dyestuff (bath, paste) | reliable | the work's placements (§13ed) |
| Modifier | reliable when recorded | a `post_iron` step (Fe); a `post_modifier` step's recipe or words |
| Blanket material, treatment, bath | as written | the carrier-blanket layer's `what` and `prep` — free text, shown in her words |
| Date, the work | reliable | the colouring action's date and `trialId` |
| Which alternative a recipe was made with | **not knowable** | the action records the recipe, not the choice |
| The blanket as a cloth of her own | **not knowable** | a bundle layer has no `fabricId` |

**Where a choice is lost (a v1.1 candidate, not built).** Five recipes offer alternatives for one role:
`silk-scour` and `cellulose-scour` (soap or Synthrapol), `tannin-bath` (gallnut, myrobalan or oak),
`cellulose-alum-soda-mordant` (PAS or AS), `dye-mordant-print-paste` (guar or cornflour). An action
records `recipeId` only, so the summary says what the recipe says — „PAS/AS + Na₂CO₃", never „PAS".
Two places already keep a choice and could feed it later: a chain's steps (`choices`, so a group
action run through a chain knows its option), and a paste step's own `lines` (§13ee).

### The card

**Обобщение на обработката / Process summary**, only the rows the record can fill, in this order:
Етап / Status (the studio badge) · Подготовка / Preparation · Техника / Technique (code with its name,
„EP · Еко принт") · Паста / Paste (a paste recipe's code when it is not already the technique) · Одеяло
(BLK) / Blanket (BLK) · Обработка на одеялото / Blanket treatment · Баня на одеялото / Blanket bath ·
Багрило / Dye · Модификатор / Modifier („Fe · Желязо / железен сулфат") · Растения / Plants · Дата /
Date — and „Отвори опита / Open Trial" when the colouring was part of a work. A raw piece shows its
stage and nothing else.

`deriveProcessSummary(fabric, { recipes, trials, plants }, lang)` in studio.js. Preparation is the
trail's own stages before the colouring — „AA + CaCO₃", „TAN → PAS + COT" — so there is no second
reading of the history. An eco print's plants are its placements; a bath's and a paste's are its
dyestuff, shown as Dye. A plant is always named, never coded; cotton is never COT.

### The trail

D now carries a short, recorded rider: a bath's dyestuff (`D (DYE · madder)`, two names at most), an
eco print's blanket (`D (EP · BLK памук)`, in its own words). No plant list, no treatment text: the trail
stays one line. The summary carries the rest.

### Data

No field added to any store, no `DB_VERSION`, no backup change, no lifecycle change. `try-studio.mjs`
holds that deriving writes nothing and that no module assigns a stored summary field;
`try-studio-screens.mjs` holds that a piece's record in the database is byte for byte the same after its
summary is drawn.

### Checks

- `try-studio.mjs`: the eco-print fixture (silk; AA, chalk; EP; a cotton blanket with Fe and a madder
  bath written on it; two plants, one placed twice) gives exactly its fields — no Dye, no Modifier; its
  trail `W → M (AA + CaCO₃) → D (EP · BLK памук)`; plants and technique in English; a madder bath
  `DYE · Потапящо багрене` with Dye брош and trail `D (DYE · madder)`; an iron afterbath recorded → Fe,
  none recorded → none; a mordant print; `TAN → PAS + COT`; `PAS/AS + Na₂CO₃` not narrowed; a washed
  piece with only its status and date; a raw piece with its status alone.
- `try-studio-screens.mjs` (Chromium): the card's rows and their order for a real eco-print work with a
  blanket and two library plants; each value; Open Trial opens the work; English labels and plant
  names; a raw piece's single row; the stored record unchanged.

---

## 13gf. Legacy finished pieces read their work; the label is neutral (1.0.0-rc130)

### Why old finished pieces showed RAW, W or M

`deriveStudioStatus` read a piece's ACTIONS. Pieces finished before the action model was whole carry
„finish" and little else — sometimes a wash or a mordant before it — while the colouring they went
through is recorded on the WORK: the piece is one of its pieces (`fabricIds`) in a completed eco print
or dye bath. No dye action, so no D. `finished ⇒ D` would be wrong the other way: a piece can be
finished washed and never coloured (§13gc).

### The rule — in the one derivation everything uses

`studioHistory(fabric, ctx)` (studio.js) is the piece's actions and, **only when they hold no dye
action**, the colouring its work proves, added as a `dye` marked `derived` and placed before the
finishing. `deriveStudioStatus`, the treatment summary, the trail and the process summary all read it, so
the filter chips, the row, the record, the label and the summary cannot disagree. Priority: the piece's
own actions; then the tannin projection; then the work's evidence; otherwise what the actions give.

**Evidence is structured, and only this:** a work whose process colours cloth (`immersion`, `ecoprint`,
`paste`), in which this piece is one of the pieces worked (`fabricIds` — the list a work's change
applies to, §8.0) or which one of its own actions names (`trialId`); and the work is `complete` — or, for
a finished piece, at least begun (a finished piece in a work never closed was worked; a planned work
proves nothing). A box-moving action dated after the work wins. Photographs, captions, notes, names and
guessed dates are not read.

**A blanket cannot be made D by mistake.** §8.1 planned layers that point at a cloth; as built, a bundle
layer is described in words and has no `fabricId`. A cloth used as a blanket is therefore never a piece
of the work unless it was ticked as one — and then the model itself says it was worked.

**Not stored.** Nothing is written to the piece; no migration; the backup is unchanged. `finished` stays
its own state, shown beside the stage.

**What stays unknowable.** A finished piece whose work does not list it in `fabricIds`, and none of whose
actions names the work, has no structured link: its photographs may show a print, but nothing the
application may read says so. Such a piece keeps the stage its actions give and needs a correction by
hand — a dye action, or the piece ticked in its work.

### The label, neutral

The working label is linen on screen and white on paper, with dark text: Bagra does not print coloured
labels; colour comes from the paper, if wanted. The stage is a mark — a 1.5 mm edge and a dot in the
stage's token, with the stage's icon before `M · МОРДАНТИРАН` — and its code and name carry it in black
and white. One Print; the colour-paper variant, its string and its style are gone.

### Checks

- `try-studio.mjs`: L1 finished, receiving piece of a completed eco print → D; L2 washed and mordanted, a
  completed dye bath → D; L3 tanned, no work → T; L4 washed → W; L5 nothing → RAW; L6 a piece named only in
  a blanket layer's words → not D; a finished piece in a work in progress → D, an active one → W; a planned
  work → nothing; a later mordant wins; without the works passed in, nothing inferred; the trail
  `W → M (AA) → D (DYE · madder)`; the summary reads the work (EP, the plants, the blanket, the date); the
  colouring marked derived; nothing written.
- `try-studio-screens.mjs`: L7 — a legacy piece is D in its row, the D chip excludes it and Finished
  counts it, and its header, label and summary say D; its trail starts from the work; the stored record
  unchanged. The label linen, the edge and dot in the chip's token, the icon present; exactly one Print;
  printed black on white at 70 × 40 mm with the stage in code and words; the colour-paper string gone.

---

## 13gg. Merge keeps the newer version of a record of hers (1.0.0-rc131)

**Reported:** a plan made on the laptop with a source, a label and a picture came back on the phone, after
a backup and a restore, without any of them — in the read view and in the editor — while a new plan on the
phone had the fields. Data safety, not layout.

**Root cause — the merge policy, not the backup.** The picture is a JPEG data URL inside the plan record
(`referenceImage`, §13gb); `sourceLabel` and `sourceUrl` are fields of the same record. The export
carries every store whole, so the file holds all three byte for byte; replace writes the file's records
as they are; merge onto a device without the plan adds it whole. All of that was right and is now proved
end to end. What was wrong: merge onto a device that ALREADY held the plan — from an earlier backup,
before the source and the picture were added — applied the rule of §13ft, „what is already here wins,
the file never overwrites". The phone kept its older copy, the file's newer plan was dropped, and the
only sign was „differ: 1" at the end of the message. Nothing was lost from the file; it was lost from the
merge.

**The rule now.** For a record of hers (`isWork`) present on both sides and different, the later
`updatedAt` wins: the file's replaces this one when it is newer (`updated`), this one stays when it is
newer, as new, or when either time cannot be read (`differ`). Every edit stamps `updatedAt` (`db.put`),
so newer means edited later. Library records she never edited and settings are decided as before. The
message says both counts: „Обновени от файла, защото там са по-нови: N" and the kept ones.
Replaced records count as added for the migration reopening of §13ft.

**Backups made before rc131 are whole.** The defect was in the merge, never in the export: a file
written by any version since Plans v1.1 holds the source, the label and the picture. Merging it again
with rc131 updates the older copy; a replace restores it too.

**Checks.**
- `scripts/try-plan-backup.mjs` (new, release gate; Chromium, each device its own empty browser
  profile): a plan with title, notes, checklist, source, label and a 640-px picture, exported; the file
  holds all of it byte for byte; onto a clean phone by replace, onto a clean phone by merge, and onto a
  phone holding an older copy by merge — each reloaded, the plan opened, its source and link shown, its
  picture DECODED at 640 px, its id, checklist, picture and `updatedAt` the same. Seen failing on rc130's
  backup.js in exactly the older-copy case, and passing in the clean ones — which is why the round trips
  of §13ft did not catch it: they restored onto devices that did not hold the plan.
- `try-data-safety.mjs` gains `mergeOverOlder`: the file's newer plan replaces an older copy with its
  source, label and picture, and the merge reports it; a trial edited on the device after the backup is
  kept and reported; work only on the device untouched; every other record of hers identical.

---

## 13gh. Recipe cards keep their words inside (1.0.0-rc132)

**Reported:** on a phone, Reference → Recipes, „Акварелна боя от пигмент" — ТИП „бои, пасти и свързващи
вещества" ran past the card and was cut off at the edge.

**Root cause, two things together.** `.typecell` and `.cond` are `inline-flex` with `white-space:nowrap`,
which is right for the desktop table — the type sits on one line in its column — and was left in force in
the phone's cards. And below 640 px a cell is a flex row, label beside value, where a flex item's minimum
width is its content's: an unbreakable line of 31 characters could not shrink below its length, so it
widened past the card — 114 px at 320 px, 89 at 360, 71 at 390. `dye-mordant-print-paste`, of the same
type, did the same. **Why no check saw it:** the panel is `overflow:hidden`, so the page never scrolled
sideways, and the nowrap check compares an element with itself — a span exactly as wide as its words.

**The change, phone only (`max-width:640px`).** A card cell's children may shrink (`min-width:0`), the
type and the conditions wrap (`white-space:normal`), and a cell breaks a string that has no break in it
(`overflow-wrap:anywhere`) rather than widen the card. Two columns stay — the label beside the value is
still readable at 320 px; the value simply takes two or three lines. No truncation, no ellipsis, no
smaller type. The desktop table is unchanged.

**Check.** `scripts/try-recipe-cards.mjs` (release gate, Chromium) measures every run of text in every
card against the card, and every card against the window, at 320, 360, 390 and 412 px in Bulgarian and
English, with the seeded recipes and one of hers made awkward (a name with no spaces, every fibre class);
names the watercolour card's type in both languages; and at 1280 px holds that the table keeps its header
row, its cells and the type on one line. Seen failing on rc131's stylesheet at every phone width.

---

## 13gi. The shell is the scope; production on Cloudflare Workers (1.0.0-rc133)

**Reported:** on staging (`bagra-staging.*.workers.dev`), 13 October 2026, the first visit worked and
the next start showed the browser's own page: „This site can't be reached", `ERR_FAILED`.

**Root cause.** The worker served the application shell from its cache under `./index.html` (§13fu).
Cloudflare's static assets, with the default `html_handling` (`auto-trailing-slash`), answer
`/index.html` with **307 → `/`**. `addAll` follows a redirect and stores the final response, which
carries `redirected: true`. A navigation is a request whose redirect mode is `manual`, and the browser
refuses a redirected response for it — so once the worker took control, every start of the
application failed, online and offline. **Why no check saw it:** every browser check serves the tree
with python's `http.server`, which answers `/index.html` with 200. GitHub Pages does the same, which is
why it never appeared there.

**The change (`sw.js`).**
- The shell's cache key is the **scope** (`./`), which is already in `FILES` and which every host Bagra
  has run on answers with 200 — not `./index.html`.
- A second line: a cached response marked `redirected` is never handed out as it is; it is rebuilt as a
  new `Response` from the same body, status and headers, without the flag the browser refuses.
- `./index.html` stays in `FILES`: `make-release.mjs` builds `dist/` from that list, and a direct
  request for `/index.html` is a navigation and gets the shell.

Nothing about the database, the release-is-the-cache rule (§13fu) or the update flow changes.

**Check.** `scripts/try-host-redirect.mjs` (release gate, Chromium, against `dist/`) serves the artifact
two ways — as Cloudflare does by default (`/index.html` → 307 `/`) and plainly — and on each opens the
app, waits until the worker controls the page, then reloads, opens `/index.html`, reloads again and
starts offline; every step must boot the application. **Seen failing** on rc132's `dist/`: under the
Cloudflare style, reload timed out and the next three starts were `ERR_FAILED`; the plain style passed
throughout, which is exactly why nothing caught it before.

**Host decision, amending §13ga.** Production and staging run on **Cloudflare Workers with Static
Assets**, not Pages — Cloudflare's current path for new projects, and the place where the licence
endpoint `/api/license/*` will live beside the files (a Worker of its own code, no database). Staging
is the Worker `bagra-staging` on its `*.workers.dev` origin; production is the Worker `bagra` with the
custom domain `bagra.crafty.place`. Everything else in §13ga stands: only `dist/` is uploaded, the same
`dist/` is promoted from staging to production, `_headers` is read by the host (Workers static assets
read the same format). Until the Worker has code, `dist/` is uploaded from the dashboard; when it does,
deployment moves to `wrangler deploy` with the assets directory set to `dist`. Setting
`html_handling: "none"` there would also avoid the redirect — the worker does not rely on it.

**Staging installs of rc132.** A browser that installed rc132 on staging cannot start it; clear the
site's data for the staging origin once (DevTools → Application → Clear site data). Staging holds no
data of hers; no production install of rc132 ever existed.

**Amended by §13gj (rc134).** Production did not end up on Workers: a Workers custom domain needs the
domain's zone in Cloudflare, and crafty.place's DNS stays at GoDaddy. rc133 went live as a **Pages**
project (`bagra`, Direct Upload) with `bagra.crafty.place` as a CNAME at GoDaddy to `bagra.pages.dev`.
From rc134 deployment is a **Git-connected Pages project** and the licence endpoint is a Pages Function
(§13gj). The shell fix above is host-independent and stands.

## 13gj. The licence; Git-connected Pages (1.0.0-rc134)

**Decided** 13 October 2026 (plan approved by the owner the same day, with the menu and screen
decisions below). Bagra 1.0 is sold as a one-time, perpetual licence (€59, up to 3 active devices)
through Polar, which is merchant of record and the source of truth for every key.

**Without a licence** only the licence screen opens, plus two things that are always hers: **Backup /
export** (`#/tools/backup`) and **About** (terms, privacy, safety). No free or reference-only mode in
1.0. **After activation** Bagra works offline indefinitely. Her data is never hidden, changed or deleted
by anything in the licence logic: it decides which screen opens, nothing more.

### The one rule

Only an authoritative answer from Polar that the key or the activation is no longer valid can lock a
device. No network, a timeout, a server error, a 429, a broken deployment, missing configuration or an
answer that cannot be read never locks. On doubt: `unavailable`, never `invalid`.

### Architecture

The app stays a static, offline PWA. One Pages Function on the same origin,
`functions/api/license/[action].js`, is the only thing that talks to Polar. Same origin: no CORS, CSP
unchanged (`connect-src 'self'`). The worker ignores POST, so the API is never cached. The app never
knows Polar's addresses; a change of provider changes the Function, not the app.

### API contract

POST, JSON, answered `Cache-Control: no-store`. The app reads only `status`; every answer also carries
`env` and, when configured, `portalUrl`.

| Endpoint | Request | Answers |
|---|---|---|
| `/api/license/activate` | `{ key, label }` | `active` + `activationId` (200) · `limit` (409) · `invalid` + reason (422) · `unavailable` (503) |
| `/api/license/validate` | `{ key, activationId }` | `valid` · `invalid` + reason · `unavailable` |
| `/api/license/deactivate` | `{ key, activationId }` | `released` · `unavailable` |

Reasons: `revoked`, `disabled`, `unknown_key`, `activation_gone`, `wrong_product`. The Function forwards
to Polar's public customer-portal licence endpoints (`/v1/customer-portal/license-keys/*`, no token);
adds `organization_id` from the environment (a request cannot set it); checks the key's `benefit_id`
against the environment's (another product's key is `wrong_product`, and a seat it took is given back);
times out Polar after 8 s; refuses a foreign or missing `Origin`, a body over 2 KB, an implausible key or
activation id, a label over 100 characters, any method but POST. It logs nothing — there is no console
call in the file. A release (`deactivate`) is `released` on Polar's 204 or 404 (an activation Polar no
longer holds is not counted); any other "success" is not readable and the device stays activated.

**Not yet measured** (first thing on staging): Polar's exact answer when the activation limit is reached
(mapped today as 403 with "limit" in the detail; any other 403 at activation is `invalid`/`disabled`);
whether the portal lists activations with a release button; that `_headers` still applies with a
`functions/` directory; how production deploys with automatic production deployments off; `benefit_id`
in the validate answer. If the activate answer lacks the key object, the Function validates once to
learn its benefit.

### The record on the device

`localStorage['bagra.licence']`, not IndexedDB: the backup exports the database and a restore replaces
its settings, so a record there would travel to another device or be erased by a restore; and it is read
synchronously before the database opens. Fields: `v` (1), `key`, `activationId`, `label`, `env`,
`portalUrl`, `activatedAt`, `lastValidatedAt`, `lastCheckAt`, `state` (`active` | `revoked`), `reason`.
**Never in a backup, never touched by a restore** (checked). Clearing site data removes it; the key is
entered again and the old seat freed in the portal. It is not a secret and not DRM: it keeps honest
people honest.

### States

**No licence** (no record) → activate → **Active**. **Active** → silent check → `valid` stays Active;
`unavailable` stays Active and asks again tomorrow; `invalid` → **Revoked**. **Active** → Release this
device → **No licence**, but only after the server confirms `released`; otherwise it stays Active.
**Revoked** → a key entered → Active. No licence and Revoked show the same screen; Revoked adds the
reason.

### Revalidation

Due when `lastValidatedAt` is more than 7 days old and `lastCheckAt` more than a day old. Runs after the
first screen, in the background, when online — at start, on `online`, and when the app becomes visible.
Never delays the first screen; never shows anything unless the result is Revoked, and then does not
pull a form with unsaved work from under her (the next move goes to the licence screen). **No time
limit:** a device that has not reached the server for months keeps working. **Refund:** Polar revokes
the key; the next successful check reads `revoked`. **Rotated key:** the old key reads `unknown_key`;
entering the new one activates again.

**Environment.** Every answer names the licence world: `BAGRA_ENV` and whether `POLAR_API` is the
sandbox — `staging/sandbox`, `production/sandbox`, `production/live`. The device stores it at activation.
If a later check reports a different one, the device is asked for its key (`reason: environment`), so a
sandbox activation can never pass as a purchase once production points at live Polar.

### The licence screen (decided 13 October 2026)

- **Menu.** Licence is its **own item in the overflow menu, directly under Backup and before About**,
  with a key icon (`i-key`). Backup keeps its name; it is not „Backup & licence". The phone drawer has
  the same order.
- **Screen** (`#/licence`, `modules/licence.js`), separate and plain:
  - Status: **Active / Revoked / No licence**
  - Licence key, masked: `•••• •••• •••• 4F2A`
  - Activated on · Last checked (the last authoritative valid) · This device: browser + OS
  - Actions: **Release this device** (with a confirmation) · **Open customer portal**
  - Revoked or none: the reason in plain words, a field for a key, **Backup / Export my data**, the portal;
    for none also „Buy a licence" (crafty.place/bagra)
  - Activation answers in words: a key that does not look like one (no call is made), not recognised,
    another product, disabled, revoked, 3 devices in use (with the portal), offline, temporarily
    unavailable, storage blocked
- **No environment or staging information** anywhere in the interface (checked).
- Without a licence the bar shows no spaces or module row, and the drawer only the footer group.

The device label sent to Polar is `browser · OS · date` (`Chrome · Android · 13 Oct 2026`): what the
portal shows, no fingerprint, no identifier.

### Device replacement

The old device at hand: Release this device, then activate the new one. Lost or cleared: activation on
the new device answers `limit`; the screen sends her to the customer portal (purchase email) to release
one, then Activate again. Whether the portal lists activations is measured on staging; if it does not,
a list inside the licence screen is an rc135 candidate.

### Environments and deployment

One codebase, a **Git-connected Cloudflare Pages project** (`bagra-app`), build command
`node scripts/make-release.mjs`, output directory `dist`, root `/`. Cloudflare compiles `functions/`
itself; `dist/` never contains it (allowlist, §13fx unchanged; the cache-list check excludes `functions/`).
Branch `staging` → preview (staging); `main` → production. **As run since rc136 (amended at rc137,
§13gm):** automatic production deployments are **on**, and the explicit step is the pull request
`staging` → `main` — Cloudflare offers no „deploy latest main" button while automatic deployment is off,
which is the fallback this section foresaw. The domain `bagra.crafty.place` moved from the old Direct
Upload project `bagra` to `bagra-app` (GoDaddy CNAME `bagra` → `bagra-app.pages.dev`); the old project
is kept briefly and then deleted.

| Variable | Preview (staging) | Production (main) |
|---|---|---|
| `BAGRA_ENV` | `staging` | `production` |
| `POLAR_API` | `https://sandbox-api.polar.sh` | `https://api.polar.sh` (live since 14 October 2026) |
| `POLAR_ORG_ID` | the sandbox organization | production's |
| `POLAR_BENEFIT_ID` | the sandbox licence benefit | production's „Bagra licence" benefit |
| `POLAR_PORTAL_URL` (optional) | the sandbox portal | the production portal |

None is a secret and none is in the repository. A missing variable fails closed for activation and open
for running: everything answers `unavailable`. **Production points at production Polar before the first
outside tester gets a key.** Beta: internal tests use sandbox keys; external beta uses production keys
via a 100% discount code, after Polar approves the production account. Production is never tested with
a real card.

**Flow.** Claude: change, `check.sh --release` green, a list of changed files, the cumulative ZIP (an
archive, never the deployment mechanism; no ZIP in GitHub). Owner: upload the changed files to `staging`
in one commit named after the version → preview build → staging smoke test (runbook §4, plus
activation, check, release) → pull request `staging` → `main`, merge → Cloudflare deploys production by
itself → production smoke test. Nothing is ever uploaded to `main` directly: doing so once made the next
merge conflict. The GitHub workflow runs the release gate on `staging`, `main` and every
pull request; it does not deploy.

**Rollback** (amended at rc137). Two ways back, both restoring frontend and Function together:
- **Cloudflare**: `bagra-app` → Deployments → the previous production deployment → Rollback. Immediate;
  nothing in GitHub changes, so the next merge to `main` deploys over it.
- **GitHub**: revert the pull request on `main`. The revert is a commit, so Cloudflare deploys it like
  any other; `main` and production agree afterwards.

Either one serves an earlier `sw.js`, and a browser installs any `sw.js` that differs from its own, so
installed copies do go back to the earlier code. That is safe only while `DB_VERSION` is unchanged
between the two releases: with it raised, older code cannot open the upgraded database, and the only
way is forward (runbook §7, case B). The fix itself then follows as the next rc number.

### Failure modes

| What fails | Activated device | New activation |
|---|---|---|
| No internet | works; check postponed | „needs the internet once" |
| `/api/license` down, deployment broken | works | „temporarily unavailable" |
| Polar down or slower than 8 s | works | as above |
| Variables missing or wrong | works | as above |
| Polar answers an unexpected shape | works | as above |
| Key refunded, disabled, rotated | licence screen at the next successful check; backup and export open | — |
| localStorage blocked or cleared | asks for the key; her data untouched | „storage blocked" if it cannot be kept |
| Wrong clock | a check earlier or later; nothing locks by date | — |

The licence screen is part of the release (cached by the worker) and opens offline.

### Checks

- `scripts/try-license-function.mjs` (release gate): the Function against a fake Polar — every answer
  to its status; network refused, timeout, 5xx, 429, malformed JSON, HTML, unexpected shape and each
  missing variable → `unavailable`, never `invalid`; organization from the environment only; refusals;
  nothing logged. **Seen failing** on rc133 (no Function) and on a copy where a 5xx became `invalid`.
- `scripts/try-license-app.mjs` (release gate, Chromium, against `dist/` with the worker on and a fake
  `/api/license`): fresh install → only the licence screen, no module reachable, backup and About
  reachable, menu order Backup · Licence · About with the key icon; activation (typo, unknown,
  unavailable, good key trimmed); offline restart; 8 days on with the server unavailable, a 502 HTML
  page and valid; revoked with the reason, backup and an export holding her records and no licence;
  re-activation keeps her data; limit with the portal; release unavailable and confirmed; environment
  changed; restore on a second device carries data, not the licence; English and Bulgarian; phone width
  and the phone drawer; no environment named on screen. **Seen failing** on rc133 at the first step.
- Every check that boots the app for another purpose starts from an activated device
  (`scripts/licence-fixture.mjs`).

## 13gk. The work is called by its cloth, on every screen (1.0.0-rc135)

**Reported** by the owner on 14 October 2026: the cloth „Памучна туника" renamed „Cotton tunic" in
Fabrics; its trial still opened as „Памучна туника", and the cloth's own page listed the trial under the
old name.

**Root cause.** §13as decided that a piece of work is named by its cloth, derived on read, because a copy
of the name taken when the work began does not follow a rename. It was applied to the list of work and the
home screen only. Seven other places still read the copy in `trial.title`: the work's read view (its
heading), the work form's heading, the finish screen, „starts from" (a snapshot `groundFrom.title`), the
earlier runs under a cloth, the cloth's „used in trials", and the Reference's link from an observation to
its trial. And every new piece of work kept making the copy: opening work on a cloth wrote the cloth's
name into `title`.

**The change.**
- `workTitle(r, fabrics)` and `workSubtitle(r, fabrics)` move to `fabric-logic.js`, so Fabrics and the
  Reference use them without importing the trials module (which imports Fabrics). `trials.js` re-exports
  `workTitle` for the dashboard.
- Every place that names a piece of work uses them: the heading is the cloth's current name; the
  person's own words, when they say something the cloth's name does not, are shown beneath (the read view's
  sub-line) or instead, where the cloth is already known (the cloth's „used in trials", the earlier runs
  under a cloth, „starts from").
- „Starts from" reads the earlier work itself when it still exists; the snapshot keeps the date and the
  picture and is the fallback only.
- **New work takes no copy.** `title` starts empty; the cloth names the work, and what she writes in the
  title field is her own.
- **A rename takes back the copies.** Saving a cloth whose name changed empties the `title` of its work
  that is *exactly* the old name, in the same transaction as the cloth. A title with any word of her own
  is not touched. This is not a migration and guesses nothing: it is the consequence of her rename, by
  exact equality, at the moment she makes it.
- Work renamed **before** rc135 keeps its stale copy, shown as her own words beneath the cloth's name,
  because nothing records that it was a copy. Emptying the title field removes it.

**Also in rc135: the welcome line counted no sources.** On an empty diary the home screen said „…163
combinations and undefined sources": the line reads `counts.sources`, and no tile counts the `sources`
store (the Library tile counts the glossary). The dashboard now counts `sources` for the line.

**Check.** `scripts/try-work-title.mjs` (jsdom, release gate): the welcome line has no „undefined"; a cloth
with a finished work whose title is the copied name and a work under way with words of her own is renamed
through its form; the copy is emptied and her words kept; the new name heads both works, is in „starts
from", in the cloth's „used in trials" and in the list, and the old name is nowhere; new work on the cloth
starts with an empty title. **Seen failing** on rc134 (eight of twelve).

**From the staging test of §13gj (13 October 2026).** Measured against Polar sandbox: activation answers
as mapped; the app starts offline once activated; „Release this device" frees the seat (the portal's list
empties); **the customer portal lists each activation by its label (`Chrome · Windows · 13 Oct 2026`) with
a ✕ to release it**, so a list of activations inside the app is not needed (the rc135 candidate in §13gj
is dropped). Still to measure: the answer at the activation limit, and a check (`validate`) against a key
disabled in Polar.

## 13gl. "Not found" covers more than one reason (1.0.0-rc136)

**Measured** on staging, 14 October 2026, against Polar sandbox (completing the open points of §13gj):
- The weekly check works end to end: a forced check reached Polar (the key's "Validations" rose to 1,
  "Validated at" today) and stored `lastValidatedAt`.
- A key **disabled** in Polar answers the check with **404 "not found"**, not with a key whose status is
  `disabled`. The Function mapped it, as designed, to `invalid` / `unknown_key`; the device locked and the
  licence screen opened with Backup / export available. Correct behaviour, wrong words: the screen said the
  key had been replaced.
- Polar **drops the key's activations** when it is disabled: after Enable and a fresh activation the portal
  listed one activation, not two.
- Re-entering the key on the revoked screen activated the device again; her data was untouched.

**The change.** No logic changes. The two reasons that come from a 404, `unknown_key` and
`activation_gone`, cannot be told apart reliably and cannot tell disabled from replaced or refunded, so
their text now names every case that produces them and sends her to the customer portal:
- unknown_key: "This key is no longer valid. It may have been replaced in the customer portal, disabled,
  or refunded. Check the portal, or enter a new key."
- activation_gone: "This device's activation is no longer valid. It may have been released from the
  customer portal, or the key disabled. Enter the key again, or check the portal."

(Bulgarian alongside in i18n.js.) `disabled` and `revoked` keep their own words for the case where Polar
does answer with a status.

**Still unmeasured:** the activation limit (a fourth device). Not needed before production: whatever Polar
answers, a fourth activation is refused; only the words could be less precise.


## 13gm. Back goes up, then asks before leaving; the Library's own words (1.0.0-rc137)

### The phone's Back button, in the installed application

**The fault.** Every move inside Bagra added a page to the browser's history, so the phone's Back button
walked through everything visited — twenty screens in, twenty presses out. An installed application is
expected to behave otherwise.

**The decision** (owner, 15 October 2026). **Only in the installed application** (display mode
`standalone`, `fullscreen` or `minimal-ui`, or iOS `navigator.standalone`). In a browser tab Back keeps
the browser's own meaning, which is what a person expects there; on a laptop the same rule applies.
iPhone has no Back button, so in practice this is Android.

- **Back goes one level up**, not to the last screen seen:
  - a screen with its own way up (the „← Plants" button, §13bo) goes where that button goes — the
    application already says what is above every record, and Back says the same thing;
  - otherwise an address loses its last part: `#/trials/<id>/<step>` → `#/trials/<id>` → `#/trials`;
  - a module's own list, or a navigation entry such as `#/tools/backup`, goes to Home;
  - **Home asks before leaving**: „Натисни „Назад" още веднъж за изход" / „Press Back again to exit".
    A second Back within two seconds closes the application; otherwise nothing happens and the next Back
    asks again.
- **Something open on the screen closes first**: an open dialog is cancelled, the drawer and the
  overflow menu close. Back does not move while any of them is open.
- **Unsaved work is asked about first**, as today (dirty.js). Refused, the screen stays.
- **Without a licence** (§13gj) the licence screen is Home: everything goes up to it, and from it Back
  asks before leaving. Going „up" to Home would only be sent back to the licence screen by the gate, and
  Back would never leave.

From anywhere, Back reaches the exit in at most four presses.

**How it holds.** The history is kept at two entries: a **floor**, which is Home, and **the current
screen** above it. Every move inside the application replaces the current screen rather than adding a
page — links, `navigate()`, the navigation bar, the handoffs. Back therefore always lands on the floor,
and from there the application decides: it puts back the screen one level up (Back went up), or stays
on Home and says „once more" (Back from Home). A Back from the floor itself has nothing behind it, and
the system closes the application — which is the exit. Two seconds after the warning the current screen
is put back above the floor, silently, so that the next Back asks again.

- One place decides where „up" is (`backnav.js`, `upFrom`), from the address and the screen's own up
  button; app.js only applies it.
- The floor carries a marker in its history state; every other entry carries none. The marker, not a
  count, is what is read, since a reload keeps the history and a count kept in a variable does not.
- A move while standing on the floor (inside the two seconds) adds the current screen back above it
  rather than replacing the floor, so the floor is never lost.

**Checks** (`scripts/try-back-button.mjs`, in the browser, installed mode emulated): eight screens deep,
Back walks up — the step, the trial, the list, Home — then asks, then leaves; a record goes to the list
its up button names; a dialog closes on Back and the screen stays; the drawer the same; unsaved work
refused keeps the form; in a browser tab Back is the browser's history, unchanged; without a licence
the licence screen asks before leaving. Seen failing with the push left in place of the replace, and
with the marker left off the floor.

### The licence screen, the device label, the print check

- **An activation message does not outlive the activation** (§13gj). Each message on the licence screen
  records which action it answers. The active state shows only a release's outcome. Seen on 14 October
  with two incognito windows, which share storage: one failed at the device limit, the other activated,
  and the first then drew „Active" under its own stale limit warning.
- **The device label carries the time**: „Chrome · Windows · 14 Oct 2026, 10:48" — local time, 24-hour,
  in English because it is read in Polar's portal. Two activations from one day were indistinguishable
  there, and the portal is where she chooses which one to release.
- **The print check presses the button itself** (`scripts/try-studio-screens.mjs`). `page.click` presses
  a point on the screen; in CI the sticky top bar sometimes covered that point, and „Print prints" failed
  with nothing wrong in the application. Every press in that check is now `el.click()` on the element,
  a selector that matches nothing is a failure, and the print counter is waited for on a condition.

### The Library's sources (sources pack 20)

- **Chandra Rice**, in the owner's own words:
  - bg: „Художник и преподавател, работи с керамика, еко принт и натурално багрене в Тоскана.
    Технически ръководства онлайн, работилници на място. Някои от практиките в приложението идват
    оттам — при нея, както и при всички, знанието е предадено, а не измислено."
  - en: "Artist and teacher working in ceramics, eco print and natural dyeing in Tuscany. Technical
    guides online, workshops in person. Some of the practice here comes by that route — with her, as
    with everyone, the knowledge is passed on rather than invented."
- **One shape**: four entries added at rc117 (Cliffe, Maiwa print & paint, Kelly, Garcia) had no `url`
  field at all; they carry `url: ""` like every other entry without an address. No content changes.
- **Nicoleta**: not in the pack since §13fs, and nothing that ships names her (already guarded). Her
  source survives on the owner's own database only because her personal copy of the withdrawn recipe
  still credits it, and a withdrawn record her own work points at is not removed (§13eo). The owner
  deletes that recipe herself; the next Library update then offers the source for removal, ticked. No
  code change, by decision.
- On the owner's database (backup of 15 October 2026, sources applied at 16) the update changes one
  record — Chandra Rice — besides that withdrawal.
- **Guarded** (`scripts/try-commercial-content.mjs`): every entry has the same six fields; every name and
  note in both languages; Chandra Rice's note exactly as approved. Seen failing before the change.
- **Deferred to a separate version** (owner's decision): twenty-five notes that are working shorthand
  („Cited for one fibre-and-mordant pairing, never for colour." — some of those sources are cited four
  or six times) rewritten as a reader's description; nine scientific sources without an author, each
  filled only after checking the paper itself.

### Deployment, as it runs (documents only)

§13gj and `docs/PRODUCTION_RELEASE.md` now describe what is actually running: automatic production
deployments on, the pull request `staging` → `main` as the explicit step; production on live Polar since
14 October 2026; the domain on `bagra-app`, moved from the old Direct Upload project `bagra`. Rollback is
two ways — Cloudflare's rollback of the production deployment, or reverting the pull request — and the
runbook no longer says that an earlier `sw.js` reaches nobody who updated: a browser installs any
`sw.js` that differs from its own, so both ways do take installed copies back, which is safe only while
`DB_VERSION` is unchanged between the two releases. rc137 does not change `DB_VERSION`.

## 13gn. A screen opens at its top; going back up returns to the place in the list (1.0.0-rc138)

**The fault.** Reported by the owner, 15 October 2026, while recording the phone screens: a screen
opened wherever the previous one had been scrolled to — a record opened from the bottom of a long list
opened half-way down, and reaching its title meant scrolling up. The application never set the scroll
position when it changed screen; the window simply kept the previous screen's. Every screen, on every
device; most visible on the phone, where nearly every screen scrolls.

**The decision** (owner, 15 October 2026):
- **Opening a screen** — a record, a list, a section, from a link, a button, the navigation, a handoff
  — starts at its top.
- **Going back up** to the screen above returns to where one was on it. „Up" is exactly what §13gm
  calls up, decided by the same function (`upFrom`): the screen's own up button („← Plants", §13bo),
  else the address minus its last part (`#/plants` from `#/plants/<id>`), and a list or section goes up
  to Home. Reached either way — the phone's Back, the up
  button, the browser's Back in a tab — the list is where it was left, so the next plant does not mean
  scrolling down again. Only positions from this session are remembered, in memory, never stored.
- **The same screen drawn again** — a language or units change, a filter, a search — keeps its place.
- Pressing the navigation entry of the screen one is already on draws it again from its top.

**How it holds.** One place decides (app.js): a move records the position of the screen being left
under its address, and tells the draw how to land — `top`, or `restore` when the move goes up and a
position is recorded. The draw applies it after the screen is drawn, never before (a list scrolled to
before its rows exist lands at the top). A redraw that is not a move carries no instruction and does
not touch the position. The browser's own scroll restoration is turned off (`history.scrollRestoration
= 'manual'`): it acted on history steps only and would have fought the rule on the browser's Back.

**Checks** (`scripts/try-scroll-position.mjs`, at 390 px): scrolled down a list, a record opens at its
top; back up by the phone's Back (installed), by the up button and by the browser's Back (tab), the list
is where it was; a language change keeps the place; a move to another module starts at the top, and so
does the current module's navigation entry. Seen failing with the reset removed and with the
restore removed.

## 13go. Persistent storage is asked for at every start; a database that vanished says so (1.0.0-rc139)

**The incident.** 16 October 2026. Багра on the owner's phone (Samsung, Chrome, installed from
bagra.crafty.place, the production of 13 October) opened with none of her work. Глина lost its data on
the same phone the same day. The phone was 98 % full. She restored the previous day's backup; a day of
entries was gone.

**The audit** (rc138, read end to end: `db.js`, `backup.js`, `app.js`, `seed.js`, `migrations.js`).
- *Can a failed open or read be taken for an empty database?* No. Every record is its own row — there
  is no single large value to fail to read, which is Глина's fault — and every read rejects on error;
  nothing turns an error into an empty list. A pack whose read fails is skipped by `ensurePacks` and
  writes nothing.
- *Can a seed, a migration or an upgrade write over her work?* No. Seeding adds only `seed:` ids that
  are absent; the upgrade deletes only `vocabulary` and `bands`, regenerated from code; migrations add;
  a snapshot restore is one transaction (§11.4).
- *Is `navigator.storage.persist()` asked for?* Only when the backup screen was opened. Never at start.
  On a new origin three days old, nothing had necessarily ever asked.
- *Is the state visible?* Only on the backup screen, under „Storage".
- *Is a vanished database noticed?* No. An evicted origin opened as a first install: the library was
  laid down, the screen looked normal, and nothing said that work had been here.
- *A start that cannot open the database* had no handler and left a blank screen.

Conclusion: no mechanism by which Багра overwrites itself was found; the probable cause is eviction of
an origin whose storage was not persistent. Not proven: the state of the permission before the loss is
not recorded anywhere, which is itself one of the faults below.

**What this release is and is not** (owner, 16 October 2026). Persistent storage prevents the browser
evicting the site under storage pressure, when the browser grants it. It does nothing against a person
clearing the browser's data, a reinstall, a lost phone, or a fault in the application. Loss detection
recovers nothing; it stops the application presenting a loss as a first install. Neither is the durable
answer, which is a copy outside the browser written without the person remembering — recorded as open in
ROADMAP, to be decided separately. These two are done first because production needs them now.

**A. Persistent storage.**
- Asked for at **every start**, after the database opens, without waiting on the answer. A browser that
  decides by heuristics (Chrome) may grant it later than it refused it; asking once would freeze the
  first answer.
- **Shown on the home screen when it is not granted**: one danger line with the backup button. Absent
  when granted, and absent where the browser has no such API (nothing can be done there, and a warning
  that cannot be acted on stops being read). The backup screen keeps its line, now with the browser's
  usage beside it as before.
- The backup screen no longer asks on its own; it shows the state the start obtained, re-read.

**B. A vanished database says so.**
- **The marker.** `localStorage['bagra.guard']` holds `{ v: 1, work, at }`: how many of HER records the
  database held (`isWork`, §13cx — a seeded record she never edited is not hers) and when that was
  counted. Written after every start and, debounced, after every edit she makes (`put`, `putTogether`,
  `remove`). Not in IndexedDB, because it must survive exactly the event it describes; not in the
  backup, because it describes this device.
- **The test, at start, before anything is seeded.** The database is *lost* when the marker says work was
  here (`work > 0`) and either the database was created by this very start (`oldVersion === 0`) or it now
  holds none of her records. Deliberately deleting everything does not trip it: each delete recounts.
- **When lost**, a second key, `bagra.guard.lost`, records `{ expected, lastSeenAt, detectedAt }` and the
  marker is frozen — not refreshed — until the loss is resolved, so a seeded library cannot overwrite the
  evidence. The library is still laid down; the application is usable.
- **Both notices come before Home's first-launch branch.** An evicted database is, to Home, exactly
  a first launch (no trials, no cloth), and the welcome panel drawn over it was the silence of 16
  October. The persistence line is not one of the warnings that branch keeps quiet (§13s): it concerns
  what she is about to write, not work that does not exist.
- **What she sees.** The start goes to the backup screen (the licence gate still comes first: the backup
  is reachable while locked, §13gj). At its top, and at the top of the home screen: „The data on this
  device is missing. When Багра was last opened here it held N of your records (date); now it holds
  none. Restore them from a backup." The restore controls are below it. A second button, „Start
  afresh", asks once and clears the notice.
- **Resolved** by any successful restore (`importBackup`, either mode) or by „Start afresh". Both clear
  `bagra.guard.lost` and recount.
- **Not covered, and said so:** a browser that clears localStorage along with IndexedDB leaves no marker.
  That case is a first install and is indistinguishable from one; the durable copy is the answer to it.

**C. A start that cannot open the database** shows a plain, bilingual message — the database could not
be opened, nothing has been written, close and open again — and writes nothing. It never falls through to
a first install.

**Checks** (`scripts/try-storage-guard.mjs`, fake-indexeddb, a child process per installation): persist
is asked at start and its answer reaches the home screen both ways; a marker is written at start and after
an edit; an evicted database (deleted between two starts) is detected, the notice is shown, the marker is
not overwritten by the seeded library; a restore resolves it; deleting every record by hand does not trip
it; a first install with no marker does not trip it; a failed open writes nothing and shows the message.
Each seen failing against rc138.

## 13gp. The automatic archive: a folder, two files in turn (1.0.0-rc140)

**Why.** §13go stops a vanished database being silent and keeps the browser from evicting the site,
when it agrees to. It recovers nothing. The owner, 16 October 2026: a person forgets to make a backup —
that is normal, not negligence — and an application people pay for must not depend on remembering.
Глина's automatic archive is the model. It does not protect a lost or stolen phone; it protects the
working phone in her hands from a silent deletion, which is what happened.

**The decision** (owner, 16 October 2026).
- **A folder, chosen once, holding two files written in turn** — `bagra-auto-1.json` and
  `bagra-auto-2.json`. Each write goes to the OLDER of the two, so the newest copy is never the one being
  written. On Android a write to a file is not atomic (content URIs, §13go's source): an interrupted
  write leaves a half file, and with one file that would be the only copy. Two files cost the person
  nothing more than one — she picks a folder instead of a file, once.
- **Each file is an ordinary Bagra backup** (`format: 'bagra-backup'`, §11.4) with `auto: true` and
  `workCount`. It is restored through the same „Choose a backup" as any other file. No second format.
- **When it writes:** 30 seconds after the last edit she makes, and when the application is left
  (hidden). At start, if an edit is still unwritten. Not on every keystroke.
- **What a write checks.** The size of what was written is compared with what was meant to be written;
  a mismatch is an error, not a success.

**The guard against writing a crashed database over the archive.**
1. The folder's handle lives in the database, in a new store `device` (DB version 11). If the browser
   deletes the database, the handle goes with it and an empty Bagra has nowhere to write: the files are
   untouched by construction. `device` holds what belongs to this device only; it is never exported, never
   restored, and is not her work (§13go's count leaves it out).
2. Before writing, her records are counted (§13go). If there are fewer than at the last automatic write,
   and the difference is not accounted for by deletions she made since (each `remove` is counted), the
   write is HELD: nothing is written, Home says so with the two numbers, and offers „Write anyway". A
   deliberate deletion of one trial does not stop it; an unexplained fall does.

**Permission.** The browser may ask again after a restart (desktop Chrome keeps it for an installed
application; Android is untested). When it does, Home shows „The automatic archive is waiting for
permission" with a button; one tap answers it and the pending write goes out. A permission the browser
can only ask for on a tap is never asked for at start.

**What she sees.**
- Backup screen, a section „Automatic archive": the folder's name, when it last wrote and how many of her
  records it holds; „Choose a folder" / „Change folder" / „Stop". Where the browser has no folder access
  (iPhone, Firefox), the section says so instead of being absent.
- Home, a danger line only when the archive is configured and NOT working: waiting for permission, held,
  or a write failed. Nothing when it works.
- While it works and has written within the last day, the „no backup / old backup" lines (§13s) stay
  quiet: the work is in a file outside the browser, which is what those lines exist to ask for. The
  manual export is unchanged and still counts as before.
- After a loss (§13go), when the device had an automatic archive, the notice names the folder and says to
  choose the newer of the two files. The folder's name is kept beside the marker in localStorage
  (`bagra.guard.auto`), because the handle is gone with the database.

**Not in this release, recorded in ROADMAP:** Google Drive as a destination. It appears in Android's
folder picker, but a write there with no connection is untested — it may fail or queue. The local folder
always works offline and stays the primary; Drive would be a second copy and the way to carry a backup
between devices, as its own piece of work.

**Concurrency.** Every change to the archive's state goes through one queue: an edit's bookkeeping and
the end of a write both change the same record, and interleaved, one would write back what the other had
just changed. The write on leaving waits for bookkeeping still in flight — without that, an edit saved a
moment before the page was hidden was not yet pending, and the write found nothing to do (found by the
checks). An edit that lands during a write stays pending and goes in the next one.

**Checks** (`scripts/try-auto-archive.mjs`, a fake folder in jsdom): unsupported is said; choosing writes
file 1, then 2, then 1; an edit is written after the delay and on hide; a pending edit is written at start;
permission „prompt" at start shows the line and one tap writes; a permission taken back during the session
waits for a tap instead of failing; a fall in her records holds the write, a
deletion she made does not, „Write anyway" writes; a failed write keeps the other file and says so; the
backup file carries no `device` store and a restore leaves it alone; the loss notice names the folder.

## 13gq. A sheet of labels: filled for chosen pieces, or blank to write by hand (1.0.0-rc141)

**Asked for** (owner, 12 November 2026). The working label (§13gc, neutral since §13gf) prints one at a
time, on a page of its own size. She wants to print many at once on plain A4 and cut them: the labels of
the pieces she has chosen, written from the record; or a whole page of blank labels in the same system,
to fill in by hand in the studio.

**Decided** (owner, 12 November 2026).
- **63.5 × 38.1 mm, three across and seven down: 21 to an A4 page.** The size of the common label sheet
  (L7160 and its kind), inside her 6–7 × 3–4 cm. Plain paper, cut by hand: no „start from label N".
  Margins 9.75 mm at the sides and 15.15 mm top and bottom, inside what a home printer prints.
- **Cut lines:** thin dashed lines on every edge, the outer ones included. A line drawn once between
  two labels, not twice.
- **One layout, filled or blank.** The sheet label is the blank template with the record written in:
  1. the tag number (`П-028`), and on the right the date;
  2. the stage — RAW · W · T · M · D. Filled: the stage's dot, icon, code and name, and „завършен" when
     finished. Blank: five boxes to tick, each with its code;
  3. **Обработка / Treatment** — the preparation in codes (§13ge: „AA + CaCO₃", „TAN → PAS + COT");
  4. **Техника / Technique** — the colouring's code (EP, DYE, MP, DMP);
  5. **Растения / Plants** — an eco print's plants or a bath's dyestuff (§13ge's Plants and Dye).
  A field the record cannot fill stays an empty line, so the piece can be finished in pen. Nothing is
  stored; it is §13ge's derivation, drawn smaller.
  Blank: the tag number line carries her prefix (`П-____`), from the same setting as the numbering.
- **Colour: the stage as a mark, as §13gf decided.** Not a filled label: §13gf took the coloured label
  out on purpose, and the owner confirmed it stands (12 November 2026). Two prints:
  - **Print labels** — every chosen piece, in tag-number order, white with the stage's edge and dot in
    its token (shown in colour on a colour printer);
  - **Print by stage, for coloured paper** — black on white with no colour at all, the chosen pieces
    grouped RAW, W, T, M, D, each stage starting a new page, with the stage named in the top margin
    so the right paper goes in.
  A finished piece prints under the stage it reached, with „завършен".
- **Choosing which.** The Fabrics list already has a tick on every row (the group action, §13bd). The
  bar that appears with a selection gains the two prints, and a „Select all shown" — which follows the
  box chosen and the search, so „all M" is one box and one tick. The page's actions gain **Blank
  labels**: one full page of 21; more copies are the print dialog's business.
- **Printing** follows §13gc's mechanism: the sheet is placed in a container of its own at the end of
  the document, every other child of `<body>` is hidden while `printing-sheet` is set, `@page` is A4
  with no margin, and the container goes after printing. The single label's print is unchanged.

**Checks** (`scripts/try-label-sheet.mjs`, jsdom; the page size is asserted in Chromium by
`try-studio-screens.mjs`): 21 to a page and a 22nd on a second page; tag-number order; a filled label's
five rows from §13ge for an eco print, a bath, a mordanted and a raw piece; an unfillable row is an empty
line, not a dash or a guess; blank: 21 labels, her prefix, five boxes in stage order, the five rows;
grouped: one page per stage present, in stage order, each named, no colour; the colour print carries the
stage's token; finished prints under its stage with „завършен"; „Select all shown" ticks exactly the rows
the box and the search show; nothing is written to any store.

## 13gr. A finishing date earlier than the preparation: offered to move it, never left silent (1.0.0-rc142)

**Found** (owner, 12 November 2026, her backup of rc140). П-023, a silk scarf printed in the work
„копринен шал", showed as M — mordanted — although the work was finished. The record: the work and the
scarf's finishing on **18 September**, the day it happened; the work's own date and the scarf's whole
preparation — the wash, two mordants, the chalk bath, four baths of the aluminium acetate chain — on
**25 September**, the day they were written down. She corrected the finishing date to the true one and
had no way to correct the rest: the preparation is dated on its baths, the work's date on the work.

**Why M.** The history is read in date order (§13gf). Finished on the 18th, then washed and mordanted on
the 25th: the last stage is the mordant, so M; and the finishing is not last, so „finished" was not shown
in the header — while the trail, which counted any finishing anywhere, said „завършен". Two readings of
one record (point 4 below). The derivation was right about what it was given; what it was given is
impossible, and nothing said so.

**Decided** (owner, 12 November 2026).
1. **The check, when the finishing is saved.** The finishing screen (`#/trials/<id>/finish`, which is also
   where a result is edited) compares the date the work finished with
   - the preparation the work used (`prepActionIds`, §13fb) on each of its pieces — a piece cannot be
     washed or mordanted after the work it was prepared for ended. A work that recorded no preparation
     (before rc95) is compared with its pieces' own actions dated after the finishing and on or before
     the work's date; they are offered, never moved unasked.
   **The work's own date is not compared.** A finishing earlier than the work's date is how past work is
   written down — today, finished last May — and §13au keeps it on purpose; finished work is shown and
   ordered by its finishing, so the later date is not what she sees. (Found by `deep-check`, whose
   retrospective entry would otherwise have been stopped.) Her work keeps its 25th; nothing reads it.
   Anything later than the finishing is listed — the piece, what was done, the recipe, the date — and
   **nothing is saved** until she answers:
   - **„Move them to <date> and save"** — every listed date becomes the finishing date. A preparation
     action that came from a bath moves by moving the bath, which moves every piece's copy of that
     action (the mechanism of `#/batch/<id>`, §13bd: a bath is one record); a bath shared with a piece
     outside this work is named in the list so the consequence is seen before it happens. Moved and saved
     in one transaction, with the result.
   - **„I will correct them myself"** — nothing is saved; each bath is a link to its own page, where its
     date is corrected.
2. **The piece's mark follows the finishing.** The second date on the finishing screen — the day the
   cloth changed state (§13au) — follows „Finished on" while the two were the same when the screen
   opened. A different mark date (a bundle opened a week later) is left alone.
3. **On the piece's record**, when its finishing is dated before anything else done to it: a note — the
   finishing is dated before the treatment; check the date in the work — with a link to that work's
   finishing screen. Not a repair: shown, so it can be answered.
4. **One reading of „finished".** The trail's `finished` is `deriveStudioStatus`'s (§13gc), so the
   header, the label and the trail cannot disagree.
5. **On one day, the finishing comes last.** Moving the preparation onto the finishing date puts both on
   one day, and the order within a day was the order of writing. Finishing is the last thing that
   happens to a piece, so on the same date it sorts after every other action — in `actionHistory`
   (fabric-logic.js), which every reading of a piece's history goes through, studio.js's included.
   studio.js's own `byDate` orders actions already in that order, and old `stateEvents`, which carry no
   `actionCode`; it is left as it was.

**Her record.** After rc142 she opens the work, Edit result, and saves: the panel lists the scarf's four
preparation actions on the 25th; „Move them to 18.09.2026 and save" — and П-023 is
D · finished, printed on the 18th. Only П-023 in her backup is affected.

**Checks** (`scripts/try-finish-dates.mjs`): her П-023 as recorded is listed (four actions, four baths)
and nothing is saved; the work's own later date is not listed; moving makes the four baths and the four
actions 18.09 and leaves the work's date, the
scarf D and finished, in one transaction; a bath shared with a piece outside the work names it and moves
it; „myself" saves nothing and links each bath; a finishing on or after everything is saved with no panel;
a work without `prepActionIds` offers the piece's later actions; the mark date follows „Finished on" when
equal at open and not otherwise; the record's note appears for the contradiction and not after the move;
the trail's finished equals the status's; on one date the finishing sorts last though written first.

## 13gs. Making the working solution is not a treatment of the cloth (1.0.0-rc143)

**Found** (owner, 12 November 2026, the sheet of §13gq). Six pieces put through the aluminium acetate
chain (П-036 … П-041) printed „Обработка: Приготвяне на работен …" — cut off — where the Studio System in
the Library promises „AA + CaCO₃". The chain was right: it records its four steps on every piece. Two
things were not.

1. **The preparation of the solution was read as a mordant on the cloth.** „Приготвяне на работен разтвор
   алуминиев ацетат" mixes alum, soda and vinegar; the cloth goes in at the next step, „Закрепване с
   алуминиев ацетат" (AA). The chain records it on each piece, as a mordant, and the recipe has no short
   code, so by §13gc decision 3 its whole name led every summary and trail.
2. **The single label said „CaCO₃" alone.** The chain records its chalk bath as a mordant too, and the M
   summary was „the latest mordant and every treatment after it" — the chalk, and nothing before it.

**Decided** (owner, 12 November 2026, option b).
- **`recipe_output` gains `solution`** — „работен разтвор" / „working solution": a recipe that prepares a
  solution the next recipe applies to the cloth. `aluminium-acetate-prep` carries it (recipes pack
  0.21.2). A recipe with `output` `solution` or `extract` (§13by) is **not a treatment of the cloth**: its
  action stays in the piece's history, where it says when the solution was made, and is left out of
  everything that reads the cloth's treatment — the box, the summary, the trail, the label, the sheet.
  Read through `treatsCloth()` in studio.js, at the one place every one of them starts
  (`studioHistory`). Nothing stored changes.
- **M is the mordanting since the cloth was last washed or tanned**: every mordant, and every treatment
  after the first of them — „AA + CaCO₃".
- **An installed copy gets the field from the library:** Recipes → „Обнови от библиотеката" offers the
  changed recipe (the pack is compared by content, §13du). Until then the recipe is read as before; the
  M summary is already right.
- **Her own recipes** cannot yet be marked: the recipe form does not offer `output` (it never has —
  §13by set it on seed records). Recorded in ROADMAP.

**On her backup of 12 November**, after the update: П-036 … П-041 read M · „AA + CaCO₃" on the label,
the sheet, the summary and the trail (`W → M (AA + CaCO₃)`); П-023 reads `W → M (AA + CaCO₃) → D (EP ·
BLK железен разтвор)`. The other 18 pieces read exactly as before.

**Checks** (`scripts/try-solution-step.mjs`): the chain's four actions as recorded give M, „AA + CaCO₃" in
the summary, the preparation, the trail, the working label and the sheet label; the piece's actions are
untouched and the preparing action is still among them; only the preparing step recorded → W, not M; the
same piece with the recipe as it was (`output: none`) → the old reading, so the field is what decides;
an `extract` is left out alike; the seed recipe carries `solution` and the vocabulary has the term in both
languages.

## 13gt. A plan's line names its pieces, and carries its details (1.0.0-rc144)

**Asked for** (owner, 16 November 2026). A six-piece test plan — eucalyptus and a green ground on cotton,
from a reel by Jane Goodall — written as a table: per piece its aim, ground, eco print, bundle layers,
processing, modifier and which pieces to compare it with; then a sequence by day. A plan (§13fj) holds
plain lines and nothing else, so the table had nowhere to go, and the six pieces she had already entered
could not be named from the plan.

**Decided** (owner, 16 November 2026: A and B; C later).
- **A. A line names pieces.** `item.fabricIds` — optional, absent on every line written before. In the
  editor, under each line, the pieces chosen are shown as small buttons that remove them, and a select
  „Add a piece…" lists her pieces by tag number and name, those already on the line left out. In the
  plan as read, each piece is a link to its record with its studio badge (§13gc: its stage, read now),
  and beneath it every work that used it — title, date, unfinished when it is — each a link. Nothing is
  written to the piece or the work: the work is found by reading which works name the piece, on open.
  - **On the piece's record**, a block „In plans" lists the plans whose lines name it, derived on open.
  - **The reference policy (§13cq):** a plan's line naming a piece is a pointer out of the plan, so it is
    declared under `fabrics` in refs.js (`refs.plans`). A piece a plan names is refused deletion until it
    is taken off the line — the same answer as every other pointer, no cascade.
- **B. A line carries details.** `item.details` — optional free text under the line, several lines, for
  what a table row would hold („Фон: баня евкалипт · Обработка: 2 ч / 90 °C · Сравни с 2, 4"). Shown under
  the line, line breaks kept. **No table:** a plan records intent, and what was done is recorded on the
  work, in its model; a table of columns in the plan would be a second model of the work, and the two
  would come to disagree.
- **C. Later:** „Start a work from this line" — a work with the line's pieces and its text as „What I
  meant to do". The step §13fj named.
- **Halves.** She would make 3S and 6S by cutting pieces 3 and 6 in half. Bagra cannot yet cut one piece
  into two records (the split of §13bd is for a batch of several). Until it can, a line „3S" names the same
  piece as line 3, and a treatment of half the piece recorded on it describes the whole. Recorded in
  ROADMAP, not built.

**Checks** (`scripts/try-plan-pieces.mjs`, jsdom, the real screens): a plan from before rc144 opens and
saves unchanged; a piece is added to a line and removed; the select leaves out pieces already on the line;
details are saved and shown with their line breaks; the plan as read shows each piece's stage and the works
that used it, with links; the piece's record lists the plan; deleting a piece a plan names is refused, and
allowed once it is off the line; a line with no words is dropped with its pieces; the backup carries both
fields; a piece that is gone shows as gone, not as an error.
