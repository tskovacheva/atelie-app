# Глина — План за развитие

**Текуща версия:** v1.4.2.3 · `atelie-v28`
**Последна ревизия:** май 2026

---

## Философия

Приложението „Глина" е направено за ателие-базирана керамична практика. НЕ цели общ керамичен CRM или комерсиална част (продажби/клиенти/партиди). Целта: **относително универсално приложение за керамици**.

Развитие по **йерархия на реалните нужди** — всеки етап се прави **само след** реална употреба на предишния.

---

## Принципи на работа

- Без нов state layer — всички нови entity-та са масив в `DB`
- Без архитектурни промени без реална нужда — vanilla JS + localStorage
- Backward compatibility — всеки нов patch работи със стари localStorage данни
- Малки patch-ове
- Bump на APP_VERSION + CACHE_NAME при всеки production patch
- Тествай между фази
- **Two-phase removal** — миграция в една версия, премахване на legacy code в следващата (за safety net)
- **Винаги deploy-аеми междинни версии** — всяка фаза разделена на 3-5 малки версии, всяка функционална самостоятелно
- **Pre-design през хартиен мокъп или дискусия** преди големи UI промени (научен урок от v1.4.1)

---

# ЧАСТ 1: Piece Model Evolution

## ФАЗА А — Bugs + функционални gap-и ✅ ЗАВЪРШЕНА (v1.3.0)
## ФАЗА А.1 — Post-launch bug fixes ✅ ЗАВЪРШЕНА (v1.3.1)
## ФАЗА А.2 — Hardening преди Фаза Б ✅ ЗАВЪРШЕНА (v1.3.2)

## ФАЗА Б — Event-based piece model + decoration

**Статус:** в процес — Стъпки Б1, Б2 завършени; Б3 предстояща
**Документация:** Виж `EVENT_SCHEMA.md` за пълна спецификация на event типове

### UX решения (фиксирани от обратна връзка)

**List view-то на Изделия НЕ се променя.** Изделието е едно и също — окарина, ваза, чаша. Видими: име, тип, последна снимка (от последен event), текущ етап.

**Фазите живеят в детайлите.** В piece detail има секция „Процес" — timeline на events. Може да създадеш изделие само на финален етап (без история) — стандартен use case. Може да добавиш етапи назад във времето — ако искаш документация.

**Slider и Процес — едностранна синхронизация (v1.4.2.3):**
- Slider (← →) — само променя текущ статус, без писане в Процес
- Процес — записва историята; piece.stage се преизчислява от последния stage event при add/edit/delete
- Двете системи паралелно, не пречат една на друга

### UX параметри (фиксирани)

- **Workflow при create:** modal-ът остава както е сега. Timeline се добавя после в detail-а.
- **Сортиране на timeline:** най-нов отгоре (reverse chronological)
- **Първи поглед:** без снимки в timeline — само мета (дата, тип, бележка). Снимки при tap.
- **Бутон „+ Добави стъпка от процеса":** широк, видим, под timeline-а (sage dashed border)
- **Очакван брой events:** 2-4 средно, рядко повече
- **Свито/разгънато:** не нужно при този мащаб
- **Terminology:** „стъпка" (не „event/събитие")

### Deploy-аеми итерации — статус

**v1.4.0 ✅ Schema only**
- events[] масив на piece (празен по default)
- Helpers: ensurePieceEvents, _normalizeEvent
- Future event shape като коментар

**v1.4.1 ✅ Read-only timeline**
- Timeline в piece detail
- Reverse chronological sort
- Synthesized events за legacy pieces (от flat fields)
- Без UI за добавяне

**v1.4.2 ✅ Add/edit/delete за stage + progress + decoration events**
- Modal за добавяне на event с type chooser popup
- 12 decoration techniques с conditional полета
- Multi-material selector (grouped recipes + materials за глазура)
- Edit и delete на real events (synthesized — read-only)

**v1.4.2.1 ✅ UX polish**
- „История" → „Процес"
- Видим бутон „+ Добави стъпка от процеса" вместо малък „+"
- Premахнат technical hint „извлечена от полета"
- Thumbnail в list view + hero снимка — последна снимка от последен event

**v1.4.2.2 ✅ Stage slider хармонизация (initial — съдържаше bug)**
- Slider преведен на български
- Quick stage actions добавиха auto-events в Процес (по-късно отмененo в v1.4.2.3)
- Bug: дублирани events при многократно цъкане на slider

**v1.4.2.3 ✅ Slider revision + dedup migration**
- Slider връща се към „само статус", не пише в Процес
- Едностранна синхронизация: Процес → Slider (не обратно)
- Cleanup миграция за дубликати от v1.4.2.2

**v1.4.3 — Firing events (следващо)**
- Firing event тип през „+ Добави стъпка"
- 3 dropdown-а: method, atmosphere, firingPurpose
- Conditional полета: profileId само за electric, optional temp/duration/details
- **ВАЖНО:** включва пълен списък алтернативни firing методи:
  - Електрическа, газова, дървена, чушкопек, раку
  - Pit / barrel / sagar / sawdust / опушване
  - Soda / salt / обвара / друго
- Хармонизация на `bisqueTemp`/`glazeTemp` flat полета:
  - Решение: остават като quick-entry в piece modal, но създават реален firing event (не само synthesized)
  - ИЛИ: премахват се от modal, единствен начин = firing event
  - Ще се реши преди старт на v1.4.3

**v1.4.4 (опционално) — Polish + cleanup**
- Material detail: „Използвана в декорации" нова секция
- Filter в Изделия по firing method или decoration technique
- Search в timeline по technique

**Всяка версия е напълно функционална.** Ако спреш на v1.4.2.3, приложението работи стабилно.

### Open questions (за обсъждане преди v1.4.3)

1. **Reusable non-electric firing profiles** — за раку/дърва, ако се използват често. Засега решение: ad-hoc, profile-ите остават само за electric.
2. **Shared firing event** — на всяко piece отделен event (не shared entity). Решено.
3. **Хармонизация bisqueTemp/glazeTemp с firing events** — да се реши преди v1.4.3.

## ФАЗА В — Advanced (по желание)

- Multiple decoration techniques per piece (вече е възможно през множество decoration events)
- Aggregate reports („Колко изделия Q1", average firing cost)
- Calendar view
- Export на единично изделие като PDF
- Idea wishlist — техники „искам да пробвам"
- Обединение на Тестове с piece events (ако реално възникне нужда)

---

# ЧАСТ 2: Универсални подобрения

Тези не са свързани с Piece Model Evolution, могат да се правят паралелно или след нея.

## Двуезичност (Български / Английски)

**Статус:** планиран, ще се обсъжда след стабилизиране на Фаза Б
**Ефорт:** среден — изисква refactor за i18n система
**Контекст:** Целият UI текст е hardcoded в HTML/JS. Двуезичност изисква:
- Извличане на всички string-ове в speakable резерв (i18n keys)
- Toggle между езици (или auto-detect)
- Запазване на предпочитан език в localStorage

**Не-блокиращ за Фаза Б.** Може да се направи преди или след.

## Android back button — нежелан close на app

**Статус:** UX bug — потребител очаква „назад", получава close
**Ефорт:** нисък
**Опции:**
- **A:** History API integration — back button затваря modal/detail вместо PWA
- **B:** Минимално решение — toast „Натисни пак за изход" при back button
- **C:** beforeunload prompt — confirm dialog

Препоръчва се А или B. C е дразнещ.

## Облачна база данни (вместо локална)

**Статус:** дългосрочна идея, не блокира нищо
**Контекст:** Сега всички данни са в localStorage. Облачна синхронизация би позволила работа на няколко устройства.
**Опции:**
- Firebase / Supabase backend
- Optional sync — потребител решава дали да включи
- Auth — Google OAuth най-вероятно

**Не приоритет** преди Фаза Б да е стабилна.

## Подобрение на UI (ClayLab style)

**Статус:** дългосрочна идея
**Контекст:** ClayLab app има чист, иконичен UI. Глина може да заимства някои patterns.
**Може да се прави инкрементално** — не на един път.

## Параметризация (потребителски настройки)

**Статус:** малка отделна функция
**Контекст:** Потребителят сам да въвежда категории, които сега са hardcoded. Например custom firing methods, custom decoration techniques, custom stage values.

---

# ЧАСТ 3: Cost & Supplier Tracking

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** среден (след Фаза Б стабилизация)

### Нови полета в `material`

| Поле | Тип | Описание |
|---|---|---|
| `supplier` | string | Име на доставчик |
| `supplierUrl` | string | Директен линк |
| `lastPrice` | number | Последна цена на единица |
| `lastPriceUnit` | string | "kg", "g", "L", "бр" |
| `lastPriceDate` | ISO date | Кога е въведена цената |
| `packSize` | number | Стандартна опаковка |
| `packUnit` | string | Единица |

### UX

- Нова секция „Доставка" в material modal/detail
- Notifications: supplier + последна цена
- Нов filter chip „За поръчка"

## ЕТАП 2 — „История на покупките"

Нов entity `purchases` — {id, materialId, date, supplier, quantity, unitPrice, totalPrice, notes}.

## ЕТАП 3 — „Cost per ingredient в рецепта"

Няма data model промени. Показва cost breakdown в recipe detail + gram calculator.

## ЕТАП 4 — „Разход за изпичане"

Manual entry на estimatedKwh в firing profile.

## ЕТАП 5 — „Пълна себестойност на изделие"

Вероятно никога. След Фаза Б може да е по-feasible.

---

# ЧАСТ 4: Паралелни идеи

### SG (Specific Gravity) калкулатор за глазура

**Приоритет:** нисък
Ново поле в `test` + display.

### Image lightbox за снимки

**Приоритет:** среден
Click на снимка → fullscreen overlay с swipe.

### Draft auto-save в modals

**Приоритет:** нисък
При промяна → localStorage `atelie_draft_<entity>`.

### In-app update notification

**Приоритет:** среден-висок
Когато SW засече нова версия → toast „Налична нова версия → Натисни за обнова". Решава Android PWA cache проблема.

### Compression на съществуващи снимки (one-time batch)

**Приоритет:** нисък
При upgrade, еднократно компресиране до новата 1000×1000 JPEG 0.75 норма.

---

# ЧАСТ 5: Отхвърлени идеи

- **Партиди/колекции/клиенти.** Product-centric flow.
- **Multi-user / sharing.** Личен инструмент.
- **Публикуване / social features.** Не е продуктът.
- **AI асистент за препоръки.** Premature.
- **Автоматично изчисление на firing kWh от физически модел.** Неточно.

---

# ЧАСТ 6: За следващ developer

- Един файл `index.html`, ~3600+ реда vanilla JS + HTML + inline CSS
- localStorage — `atelie_v6` (main DB) + `atelie_userlib` (библиотека)
- DB: `{pieces, recipes, materials, tests, firingProfiles, _migrations}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc.

### Migration system

`runMigrations()` се извиква в `load()`. Всяка миграция:
- Проверява `DB._migrations[name]` flag — skip ако вече е изпълнена
- Backup-ва raw localStorage в `atelie_v6_pre_<name>` преди мутация
- Сетва flag-а и запазва при успех
- Idempotent

Текущи миграции:
- `v1.3.2`: pieces.temp → glazeTemp; clays.fireTemp → fireGlazeTemp
- `v1.4.2.3`: премахване на дубликати stage events (от v1.4.2.2 slider bug)

### Piece event helpers

- `ensurePieceEvents(piece)` — гарантира events array
- `_normalizeEvent(e)` — генерира id ако липсва
- `recomputePieceStage(piece)` — преизчислява piece.stage от последен stage event в events
- `getTimelineEvents(piece)` — за read display, връща real или synthesized
- `synthesizeLegacyEvents(piece)` — създава virtual events от flat fields за legacy display
- `getLatestPhoto(piece)` — последна снимка от последен event с photos, fallback piece.photos[0]
- `normalizeStageValue(v)` — мапва legacy English → BG ('greenware'→'wet', 'glaze-fired'→'finished')

### Всички полета на data model (към v1.4.2.3)

**piece:**
- Базови: `id`, `name`, `type`, `clay`, `technique`, `notes`, `date`, `stage`, `photos`, `createdAt`, `updatedAt`
- Температури: `bisqueTemp`, `glazeTemp`
- Глазура: `recipe` (FK), `material` (FK към готова глазура)
- Events: `events[]` (виж EVENT_SCHEMA.md)

**event** (в piece.events[]):
- `id`, `type`, `date` (опц.), `note`, `photos[]`, `data{}`
- type: stage / progress / firing / decoration

**recipe:** `id`, `name`, `ingredients`, `temp`, `cone`, `type`, `notes`, `photo`, `fav`, `createdAt`, `updatedAt`, `recommendedFiringProfileId`

**material:**
- Базови: `id`, `name`, `cat`, `wishlist`, `brand`, `formula`, `stock`, `alertAt`, `notes`, `photo`, `chem`, `createdAt`, `updatedAt`
- Категории: `clays`, `base`, `ox`, `glaze`, `engobe`, `underglaze`
- Clay-specific: `fireBisqueTemp`, `fireGlazeTemp`, `grog`, `shrink`, `color`
- Glaze-specific: `gfire`, `gcolor`, `surfaceType`, `foodsafe`

**test:** `id`, `clay`, `date`, `temp`, `hold`, `flow`, `surf`, `def`, `rat`, `notes`, `glazeLayers`, `photos`, `createdAt`, `updatedAt`, `recipeId` (FK), `materialId` (FK), `firingProfileId` (FK)

**firingProfile:** `id`, `name`, `type`, `holdMin`, `ramps`, `notes`, `createdAt`, `updatedAt`

### Минимални patch принципи

- Inspect before modify
- No refactor
- Safe guards — null checks, `|| ''` fallbacks
- Test със стари localStorage данни преди deploy
- Bump на APP_VERSION + CACHE_NAME задължителен

---

# ЧАСТ 7: Открити въпроси

### За v1.4.3 (firing events)

- [ ] Хармонизация на flat `bisqueTemp`/`glazeTemp` с firing events — решение преди старт
- [ ] Reusable non-electric firing profiles — за раку/дърва (засега ad-hoc)

### За UX подобрения

- [ ] Двуезичност — кога да започнем?
- [ ] Android back button — кое решение (A/B/C от ЧАСТ 2)?
- [ ] Параметризация — какви категории първо да станат потребителски?

### Общи

- [ ] Multi-device sync — кога ще стане необходимо?
- [ ] Облачна база — Firebase / Supabase / друго?
- [ ] In-app update notification

---

# ЧАСТ 8: История на релийзите

## v1.4.2.3 (май 2026) — Slider revision + cleanup migration

### Контекст
v1.4.2.2 имаше bug: slider при quick action добавяше events в Процес, което създаваше дубликати при многократно цъкане. Потребителска обратна връзка: slider се възприема като статус, не като действие.

### Промени
- **Reverted** автоматичното добавяне на events от slider — slider само променя статуса
- Едностранна синхронизация: Процес → Slider (не обратно)
- Cleanup migration: премахва поредни stage events с същата дата + stage value (от v1.4.2.2 bug)
- Безопасна — не премахва истински multiple firings на различни дати

### Мисловен модел
| | Slider (бърз) | Процес (детайлен) |
|---|---|---|
| Какво прави | Сменя текущо състояние | Записва момент с дата, бележка, снимка |
| Влияние | piece.stage | events array + piece.stage (computed) |
| За кого | Бърз update | Документация на процеса |

## v1.4.2.2 (май 2026) — Stage slider хармонизация (revised in v1.4.2.3)

### Промени
- Stage slider преведен на български
- 6 етапа вместо 7 (премахнат „Glaze fired" — слива се с „Готово")
- Legacy English values се нормализират (greenware→wet, glaze-fired→finished)
- **Известен bug:** slider auto-events причиняват дубликати → fixed in v1.4.2.3

## v1.4.2.1 (май 2026) — UX polish на Процес

### Промени
- „История" → „Процес"
- Видим бутон „+ Добави стъпка от процеса" (sage dashed) вместо малък „+"
- Премахнат technical hint „извлечена от полета"
- Empty state: „все още няма отбелязани стъпки"
- Popup: „Каква стъпка добавяш?" с подзаглавие „от процеса на изработка"
- Modal: „Нова стъпка" / „Редактирай стъпка"
- Thumbnail в list view и hero снимка — последна снимка от последен event със снимки
- Helper: `getLatestPhoto(piece)`

## v1.4.2 (май 2026) — Event modal с add/edit/delete

### Промени
- Modal `mo-event` с type chooser popup
- Stage event: dropdown с 6 етапа
- Progress event: само бележка + снимки
- Decoration event: 12 techniques с conditional полета
- Multi-material picker (chips + add/remove)
- Grouped dropdown за глазура (recipes + materials)
- Material category filter според technique
- Edit/delete за real events; synthesized = read-only
- 3 нови dropdown-а: technique, application, coverage

## v1.4.1 (май 2026) — Read-only timeline

### Промени
- Нова секция „История" в piece detail
- Reverse chronological sort
- Synthesized events за legacy pieces (от flat fields)
- Helpers: synthesizeLegacyEvents, getTimelineEvents, eventLabel, eventIcon
- 4 BG label mappings (stage, firing purpose, firing method, decoration)

## v1.4.0 (април 2026) — Schema only

### Промени
- events[] поле на piece schema (празен по default)
- Helpers: ensurePieceEvents, _normalizeEvent
- Future event shape като коментар
- Зерез visible промени

## v1.3.2 (април 2026) — Hardening преди Фаза Б

Cleanup на data debt: pieces.temp → glazeTemp; clays.fireTemp → fireGlazeTemp. Migration infrastructure (runMigrations + _migrations flag + atelie_v6_pre_<name> backup).

## v1.3.1 (април 2026) — Post-launch bug fixes

clayName helper за резолване на ID-та; filter „С/Без глазура" улавя готови глазури; азбучно сортиране default; глини с две температури; тип на изделие с autocomplete.

## v1.3.0 (април 2026) — Фаза А

Готови глазури в piece/test; нови категории материали (ангоби, подглазурни бои); две температури на piece; характеристики на глазури (color, surfaceType, foodsafe); тестове с готови глазури; brand autocomplete; photo compression; storage indicator.

## v1.2.x — Design system + features

- v1.2.4: Stats Glini/Glazures/Suvorini
- v1.2.3: „Уреди" → „Редактирай"
- v1.2.2: Focus rings, splash polish
- v1.2.1: Cards + filters + buttons unified
- v1.2.0: Rebrand „Ателие" → „Глина", нов design system

## v1.0.x — v1.1.x (март 2026)

Foundation: search, filters, sort, quick stage actions, related records, duplicate, backup/import.

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
