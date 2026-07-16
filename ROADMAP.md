# Глина — План за развитие

**Текуща версия:** v1.7.0.1 · `atelie-v45`
**Последна ревизия:** юли 2026

---

## Философия

Приложението „Глина" е направено за ателие-базирана керамична практика. НЕ цели общ керамичен CRM или комерсиална част (продажби/клиенти/партиди). Целта: **относително универсално приложение за керамици**.

Развитие по **йерархия на реалните нужди** — всеки етап се прави **само след** реална употреба на предишния.

---

## Принципи на работа

- Без нов state layer — всички нови entity-та са масив в `DB`
- Без архитектурни промени без реална нужда
- Backward compatibility — всеки нов patch работи със стари данни
- Малки patch-ове
- Bump на APP_VERSION + CACHE_NAME при всеки production patch
- Тествай между фази
- **Two-phase removal** — миграция в една версия, премахване на legacy code в следващата
- **Винаги deploy-аеми междинни версии** — всяка фаза разделена на 3-5 малки версии
- **Pre-design през хартиен мокъп или дискусия** преди големи UI промени (урок от v1.4.1)
- **Валидация преди deploy** — JS синтаксис + DOM reference check (урок от v1.6.0)

---

# ЧАСТ 1: Piece Model Evolution ✅ ЗАВЪРШЕНА

## ФАЗА А — Bugs + функционални gap-и ✅ (v1.3.0)
## ФАЗА А.1 — Post-launch bug fixes ✅ (v1.3.1)
## ФАЗА А.2 — Hardening преди Фаза Б ✅ (v1.3.2)
## ФАЗА Б — Event-based piece model ✅ (v1.4.0 → v1.4.3)

**Документация:** Виж `EVENT_SCHEMA.md` за пълна спецификация на event типове.

Всички стъпки завършени: schema (v1.4.0), read-only timeline (v1.4.1), add/edit/delete за stage/progress/decoration (v1.4.2.x), firing events с 13 метода и 2 атмосфери (v1.4.3).

### UX решения (фиксирани)

**List view-то на Изделия не се променя.** Видими: име, тип, последна снимка, текущ етап.

**Фазите живеят в детайлите.** В piece detail има секция „Процес" — timeline на events.

**Slider и Процес — едностранна синхронизация:**
- Slider — само променя текущ статус, без писане в Процес
- Процес — записва историята; `piece.stage` се преизчислява от последния stage event
- ⚠️ **Виж ЧАСТ 6** — slider-ът е кандидат за премахване

**Terminology:** „стъпка" (не „event/събитие")

## ФАЗА В — Advanced (по желание, не започната)

- Aggregate reports („Колко изделия Q1")
- Calendar view
- Export на единично изделие като PDF
- Idea wishlist — техники „искам да пробвам"
- Обединение на Тестове с piece events (ако реално възникне нужда)

---

# ЧАСТ 2: Material Model Evolution ✅ ЗАВЪРШЕНА (v1.6–v1.7)

Втората голяма арка. Контекст: ~4-5 кг морска глина от Xi Beach, Кефалония. Съществуващият модул „Материали" приемаше **готови** материали. Дивата глина обаче сама е експеримент — има биография преди изобщо да стигне до тестов замес.

## v1.6.0 ✅ Суровина — процесна биография

Нова категория `raw`. Identity полета (`raw.{location, coords, date, weight, geonotes}`) + опростен timeline `raw.events[]` с 5 типа: добиване, диагностика, промивка, пресяване, отлежаване.

**Решение:** отделен, опростен engine — не споделен с piece events. Полетата са твърде специфични (ppm, mesh, вода/глина), за да пасват на изделийни типове.

**Решение:** пластовете (сив + кафяв при Xi Beach) са **един запис с бележки**, не две партиди — обработката тече паралелно.

## v1.7.0 ✅ Маса — собствени замеси

**Централна идея:** масата не е нов вид обект. Тя е **материал, който знае от какво е направен**.

```
blend: { components: [{ref, pct}], mixDate, readyDate }
```

Понеже е материал с категория, се появява в picker-ите автоматично. Единствената промяна: `cat==='clays' || cat==='mass'` на две места.

**Решение:** суровината **не е директно избираема**. За да я ползваш → маса от 100% нея. Причина: същата партида може да влезе в няколко тела; ако беше сама избираема, нямаше да може да е едновременно чистата версия и версията с шамот. Плюс — T1 при потребителя *е* замес: има дата на замесване и отлежава в найлон като другите.

**Решение (име):** „Маса", не „Смес" — защото Рецепти вече са смеси. Чисто разделение:
- **Рецепти** — смеси, които *нанасяш* (глазури)
- **Маси** — смеси, които *формуваш* (тела)

Това премахва бъдещ рефакторинг: двата модула са различни по същество, не само по данни.

**Решение:** процентите са **съвещателни** — показва се сборът (✓ при 100, ⚠ иначе), но не блокира запис. Добавки „отгоре" са реална практика.

**Решение:** масата няма наличност. Само състав и дати.

**Рекурсията идва безплатно.** Компонент може да е друга маса, защото масата е материал, а компонентите са материални референции. Пази се само срещу цикъл (`_massContains` обхожда цялото дърво).

## Следващ етап — не започнат

Нищо конкретно планирано. Модулът чака реална употреба.

---

# ЧАСТ 3: Универсални подобрения

## ✅ Android back button — ЗАВЪРШЕНО

Решено по **Опция A** — History API integration. `history.pushState` при отваряне на overlay, `popstate` handler затваря modal/detail вместо да затвори PWA-то.

## ✅ In-app update notification — ЗАВЪРШЕНО

SW праща `SW_UPDATED` postMessage → toast „Налична нова версия". Решава Android PWA cache проблема.

## ✅ Compression на съществуващи снимки — ЗАВЪРШЕНО

В „Място на устройството" — бутон „📐 Намали N снимки", еднократно компресиране до 800px.

## ⏳ Двуезичност (Български / Английски)

**Статус:** отложена след UX review (v1.5.x). Не беше приоритет за потребителя.
**Ефорт:** среден — изисква i18n refactor. Целият UI текст е hardcoded.

## ⏳ Облачна база / sync

**Статус:** дългосрочна идея, не блокира нищо.
**Контекст:** Google Drive sync за няколко устройства. Не приоритет.

## ⏳ Параметризация (потребителски настройки)

**Статус:** малка отделна функция, не започната.
**Контекст:** custom firing methods, decoration techniques, stage values вместо hardcoded.

---

# ЧАСТ 4: Cost & Supplier Tracking

## ⚠️ ЕТАП 1 — частично направен (v1.5.4)

**Направено:** `cost` + `costUnit` (g/kg/L/ml/бр/m/other), валута EUR фиксирана. Показва се в material detail и list.

**Не направено:** `supplier`, `supplierUrl`, `lastPriceDate`, `packSize`, `packUnit`, filter chip „За поръчка".

## ЕТАП 2 — „История на покупките"

Нов entity `purchases` — {id, materialId, date, supplier, quantity, unitPrice, totalPrice, notes}. Не започнат.

## ЕТАП 3 — „Cost per ingredient в рецепта"

Няма data model промени. Cost breakdown в recipe detail + gram calculator. Не започнат.

## ЕТАП 4 — „Разход за изпичане"

Manual entry на `estimatedKwh` в firing profile. Не започнат.

## ЕТАП 5 — „Пълна себестойност на изделие"

Вероятно никога.

---

# ЧАСТ 5: Паралелни идеи

### Image lightbox за снимки
**Приоритет:** среден. Click на снимка → fullscreen overlay със swipe.

### SG (Specific Gravity) калкулатор за глазура
**Приоритет:** нисък. Ново поле в `test` + display.

### Draft auto-save в modals
**Приоритет:** нисък. При промяна → `atelie_draft_<entity>`.

---

# ЧАСТ 6: Дългове и кандидати за опростяване

Списък от функционалната спецификация (`FUNCTIONAL_SPEC.md` §11), подреден по тежест.

1. **Приспадането от склада е половинчато.** При създаване на тест съставките на рецептата се вадят от `stock` — но само при create, редакция не преизчислява, изтриване не връща. В кода стои TODO за ledger. Или се довършва (stock movements table), или се маха (ръчен склад). Сегашното състояние — тихо, еднопосочно, непоправимо — е най-слабото място в модела.

2. **Stage slider-ът вероятно е мъртъв товар.** Потребителят не го използва; етапът се движи през events. Кандидат за премахване.

3. **Quick-final е втори път за въвеждане на същите данни.** Оправдан от текущия навик (изделията се въвеждат ретроспективно, наведнъж). Ако навикът се смени към „въвеждам в началото и обновявам" — става мъртъв товар.

4. **Лимитите за снимки са непоследователни.** 5 за изделие/event/тест/raw event, 1 за рецепта и материал (вкл. маса). Няма принцип зад разделението.

5. **Двата ramp сегмента може да са грешна абстракция.** Реалните контролери поддържат повече; алтернативните изпичания често не се програмират изобщо.

6. **localStorage mirror още се пише** успоредно с IndexedDB. Предстои премахване (two-phase removal — миграцията беше v1.5.0).

7. **Вградените наръчници в Библиотеката са редактируеми.** Не се различават от потребителско съдържание и не могат да се възстановят.

---

# ЧАСТ 7: Отхвърлени идеи

- **Партиди/колекции/клиенти.** Product-centric flow.
- **Multi-user / sharing.** Личен инструмент.
- **Публикуване / social features.** Не е продуктът.
- **AI асистент за препоръки.** Premature.
- **Автоматично изчисление на firing kWh от физически модел.** Неточно.
- **Framework migration.** Vanilla JS е ограничение по избор, не пропуск.

---

# ЧАСТ 8: За следващ developer

- Един файл `index.html`, ~5500 реда vanilla JS + HTML + inline CSS
- **Storage: IndexedDB** под `atelie_idb`; библиотеката отделно под `atelie_userlib`; localStorage още се пише като mirror
- DB: `{pieces, recipes, materials, tests, firingProfiles, _migrations}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc.

### Storage layer (v1.5.0+)

Sync wrapper над async store:
- `bootStorage()` — извиква се преди `load()`; пълни `_storageCache` от IndexedDB
- `safeLoadJSON` / `safeSaveJSON` — синхронен интерфейс, чете/пише кеша
- `_idbGet/Set/Delete/GetAllKeys`, `_openIDB`, `_idbReady`
- `_migrateLocalStorageToIDB()` — еднократна миграция

**Защо:** снимките са base64 вътре в DB обекта. localStorage кодира в UTF-16 → двойна цена. Базата беше стигнала 1.99 MB, от които ~98% изображения, при лимит 5 MB.

### Migration system

`runMigrations()` се извиква в `load()`. Всяка миграция проверява `DB._migrations[name]` flag, backup-ва в `atelie_v6_pre_<name>`, сетва flag при успех. Idempotent.

Текущи миграции:
- `v1.3.2`: pieces.temp → glazeTemp; clays.fireTemp → fireGlazeTemp
- `v1.4.2.3`: премахване на дубликати stage events (от v1.4.2.2 slider bug)

### Референции между entity-та

Префиксирани стрингове, резолвени от `_resolveMaterialRef(ref)`:
- `mat:<id>` → материал
- `rec:<id>` → рецепта
- fallback: raw ID без префикс (за legacy events)

### Piece event helpers

- `ensurePieceEvents(piece)` — гарантира events array
- `recomputePieceStage(piece)` — преизчислява `piece.stage` от последен stage event
- `getTimelineEvents(piece)` — real или synthesized; sort с tie-break по stage order
- `synthesizeLegacyEvents(piece)` — virtual events от flat fields
- `getLatestPhoto(piece)` — последна снимка от последен event, fallback `piece.photos[0]`
- `normalizeStageValue(v)` — legacy mapping ('greenware'→'wet', 'glaze-fired'→'finished')

### Raw material helpers (v1.6.0)

`openRawEventMo`, `saveRawEvent`, `deleteRawEvent`, `onRawTypeChange`, `_renderRawSection`, `_renderRawTimeline`, `_rawEventIcon/Label/Sub`

### Маса helpers (v1.7.0)

`openMassMo`, `saveMass`, `_massContains` (цикъл guard), `_populateMassCompPicker`, `addMassComp`, `removeMassComp`, `onMassPctChange`, `_renderMassComps`, `_massSum`, `_updateMassSum`, `_massSummary`, `_renderMassSection`

### Data model (към v1.7.0.1)

**piece:** `id`, `name`, `type`, `clay`, `technique`, `notes`, `date`, `stage`, `photos[]` (5), `createdAt`, `updatedAt`, `bisqueTemp`, `glazeTemp`, `recipe` (FK), `material` (FK), `events[]`

**event** (в `piece.events[]`): `id`, `type`, `date`, `note`, `photos[]` (5), `data{}`
- `stage` → `stageValue`
- `firing` → `method`, `atmosphere`, `firingPurpose`, `temp`, `firingProfileId`
- `decoration` → `technique`, `materialIds[]`, `appliedAtStage`
- `progress` → `atStage`

**recipe:** `id`, `name`, `ingredients[{matId,pct}]`, `temp`, `cone`, `glazeType`, `notes`, `photo` (1), `fav`, `createdAt`, `updatedAt`, `recommendedFiringProfileId`

**material:**
- Базови: `id`, `name`, `cat`, `wishlist`, `brand`, `formula`, `stock`, `alertAt`, `notes`, `photo` (1), `chem`, `cost`, `costUnit`, `createdAt`, `updatedAt`
- Категории: `clays`, `base`, `ox`, `glaze`, `engobe`, `underglaze`, `raw`, `mass`
- Clay-specific: `fireBisqueTemp`, `fireGlazeTemp`, `grog`, `shrink`, `color`
- Glaze-specific: `gfire`, `gcolor`, `surfaceType`, `foodsafe`
- **Raw-specific (v1.6.0):** `raw{location, coords, date, weight, geonotes, events[]}`
  - raw event: `{id, type, date, note, photos[] (5), data{}}`
  - типове: `extraction` (weight) · `diagnostic` (vinegar) · `wash` (washNum, ratio, ppmBefore, ppmAfter, settleHours, waterTemp) · `sieve` (mesh, weightBefore, weightAfter, observations) · `aging` (method, duration, consistency)
- **Mass-specific (v1.7.0):** `blend{components[{ref,pct}], mixDate, readyDate}`

**test:** `id`, `clay`, `date`, `temp`, `hold`, `flow`, `surf`, `def`, `rat`, `notes`, `glazeLayers`, `photos[]` (5), `createdAt`, `updatedAt`, `recipeId` (FK), `materialId` (FK), `firingProfileId` (FK)

**firingProfile:** `id`, `name`, `type`, `ramp1Rate`, `ramp1To`, `ramp2Rate`, `ramp2To`, `holdMin`, `notes`, `updatedAt`

### Минимални patch принципи

- Inspect before modify
- No refactor
- Safe guards — null checks, `|| ''` fallbacks
- Test със стари данни преди deploy
- Bump на APP_VERSION + CACHE_NAME задължителен
- **DOM reference check** — всеки `getElementById` трябва да има съответен `id` в HTML-а. JS синтактичната проверка не хваща липсващ елемент (валиден код, runtime грешка). Това причини v1.6.0 bug-а, при който material modal-ът не се отваряше изобщо.

---

# ЧАСТ 9: Открити въпроси

### Приоритетни

- [ ] **Складът** — довършваме ли ledger или махаме приспадането? (ЧАСТ 6, т.1)
- [ ] **Stage slider** — махаме ли го? (ЧАСТ 6, т.2)
- [ ] **localStorage mirror** — кога го махаме?

### Средни

- [ ] Лимити за снимки — уеднаквяваме ли? (ЧАСТ 6, т.4)
- [ ] Ramp сегменти — два достатъчни ли са? (ЧАСТ 6, т.5)
- [ ] Вградени наръчници — заключваме ли ги? (ЧАСТ 6, т.7)

### Дългосрочни

- [ ] Двуезичност — кога?
- [ ] Multi-device sync — кога ще стане необходимо?
- [ ] Параметризация — какви категории първо да станат потребителски?

---

# ЧАСТ 10: История на релийзите

## v1.7.0.1 (юли 2026) — Consistency fix
Снимката на масата се пазеше като масив `photos`, който никой не чете — материалите ползват `photo` (единствено число). Изравнено: една снимка, поле `photo`. Открито при инвентаризация за `FUNCTIONAL_SPEC.md`.

## v1.7.0 (юли 2026) — Маса (blend)
Нова категория `mass` + таб „Маси". Компоненти с проценти (материали, суровини, рецепти, други маси), дата на замесване/готовност, сбор с предупреждение при ≠100 (не блокира), цикъл guard, кликаеми компоненти → биография. Clay picker-ите включват `mass`. Без наличност.

## v1.6.0.1 (юли 2026) — Критичен fix
При вмъкването на raw блока в material modal-а беше **изтрит блокът „Статус"** (`mi-status-val`, `mi-btn-have`, `mi-btn-wish`). JS-ът продължаваше да ги вика → TypeError → modal-ът не се отваряше изобщо, нито за добавяне, нито за редакция. Възстановен. Добавена DOM reference валидация.

## v1.6.0 (юли 2026) — Суровина
Нова категория `raw` + таб „Суровини". Identity полета (локация, координати, дата, начално тегло, геобележки) + процесен timeline с 5 типа събития.

## v1.5.4.2 (юли 2026) — Bug fixes
Nested-add на материал в декорация push-ваше raw ID без префикс `mat:` → chip-ът показваше код. Firing profiles списъкът показваше `ramp1To` (междинна) вместо peak. FP_TYPES преведени на кирилица.

## v1.5.4.1 (юли 2026) — Bug fixes
Decoration material picker с auto-add при `onchange`. Nested modal z-index — `_boostNestedModal`.

## v1.5.4 (юли 2026) — Цена на материал
`cost` + `costUnit` (7 единици), EUR. Бутон „+ Добави нов материал" под decoration material picker.

## v1.5.3 (юли 2026) — Add Piece two-mode + Storage rebrand
Двустепенен Add Piece modal (primary винаги видими, secondary в „Допълнителни детайли"). Storage екранът пренаписан без технически жаргон — семантично свободно място, човешки етикети.

## v1.5.2 (юли 2026) — Slider redesign + свиваеми филтри
Stage slider → 6 точки + ‹ › стрелки (от UX review: изглеждаше като CTA). Филтрите в Изделия → свиваеми с брояч. Етапите на кирилица.

## v1.5.1 (юли 2026) — Stage context
Decoration и progress events получиха опционално „на етап". Timeline sort tie-break по stage order.

## v1.5.0.1 (юли 2026) — Photo upload fix
Android PWA suspension race при връщане от file picker. Retry-once + immediate `e.target.value=''` + deferred processing.

## v1.5.0 (юли 2026) — IndexedDB миграция
localStorage → IndexedDB. Sync wrapper над async store. PH_MAX_DIM 1000→800.
**Контекст:** базата беше 1.99 MB, ~98% снимки, при 5 MB лимит. base64 в localStorage струва ~2× заради UTF-16.

## v1.4.7 (юни 2026) — Storage диагностика
Инструмент за анализ на паметта: migration backups, едри снимки, recompress.

## v1.4.3 (юни 2026) — Firing events
13 метода (електрическа, газова, дървена, раку, чушкопек, pit, barrel, сагар, стърготини, сода, солно, обвара, друго), 2 атмосфери. Flat `bisqueTemp`/`glazeTemp` остават за бърз create.

## v1.4.2.3 (май 2026) — Slider revision + dedup
Slider се връща към „само статус". Едностранна синхронизация: Процес → Slider.

## v1.4.2.x (май 2026) — Event modal + UX polish
Add/edit/delete за stage/progress/decoration. 12 техники. Multi-material picker. „История" → „Процес".

## v1.4.1 (май 2026) — Read-only timeline
Timeline в piece detail. Synthesized events за legacy pieces.

## v1.4.0 (април 2026) — Schema only
`events[]` на piece (празен по default). Без visible промени.

## v1.3.2 (април 2026) — Hardening
Data debt cleanup + migration infrastructure.

## v1.3.1 (април 2026) — Post-launch fixes
clayName helper, filter fixes, азбучно сортиране, тип с autocomplete.

## v1.3.0 (април 2026) — Фаза А
Готови глазури, ангоби, подглазурни бои, две температури, photo compression, storage indicator.

## v1.2.x — Design system
Rebrand „Ателие" → „Глина", sage + terra cotta палитра.

## v1.0.x — v1.1.x (март 2026)
Foundation: search, filters, sort, quick stage actions, related records, duplicate, backup/import.

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
