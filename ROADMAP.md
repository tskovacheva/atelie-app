# Глина — План за развитие

**Текуща версия:** v1.3.2 · `atelie-v22`
**Последна ревизия:** април 2026

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

---

# ЧАСТ 1: Piece Model Evolution

## ФАЗА А — Bugs + функционални gap-и ✅ ЗАВЪРШЕНА (v1.3.0)
## ФАЗА А.1 — Post-launch bug fixes ✅ ЗАВЪРШЕНА (v1.3.1)
## ФАЗА А.2 — Hardening преди Фаза Б ✅ ЗАВЪРШЕНА (v1.3.2)

Тиха версия преди major change. Без нови features — само cleanup на data debt от двете температури saga-та (v1.3.0 + v1.3.1). Виж ЧАСТ 7 за подробности.

## ФАЗА А.3 — Cleanup на legacy fallbacks (планирано, v1.3.3)

**Статус:** не започнат
**Ефорт:** малък patch (15 минути)
**Кога:** след 1-2 седмици реална употреба на v1.3.2 — да сме сигурни, че миграцията е работила

След като v1.3.2 е била deploy-ната и имаме потвърждение, че няма да се появи стара localStorage:

- Премахване на `m.fireGlazeTemp||m.fireTemp` fallback в openMatDet (ред 1738)
- Премахване на същия в openMatMo (ред 2222)
- Премахване на `p.glazeTemp||p.temp` fallback в openPieceDet
- Премахване на самата `runMigrations()` функция (тя е вършила работата си)

Това чисти ~10 реда conditional logic. Гарантира, че Фаза Б започва от чиста основа.

## ФАЗА Б — Event-based piece model + decoration

**Статус:** предстояща
**Ефорт:** ~4-5 deploy-аеми итерации, 2-3 седмици тест между всяка
**Риск:** висок — фундаментална архитектурна промяна

### Основен принцип на UX (от обратна връзка април 2026)

**List view-то на Изделия НЕ се променя.** Изделието е едно и също — окарина, ваза, чаша. Единственото видимо нещо е името, тип, последна снимка и текущ етап.

**Фазите живеят в детайлите.** Когато потребителят отвори изделие, вижда timeline на events (опционално):
- Може да създаде изделие само на финален етап (без история) — стандартен use case
- Може да добави етапи назад във времето или хронологично — ако иска документация
- Етапите включват: формоване, decoration преди бисквит (сграфито/ангоба), бисквитно изпичане, decoration след бисквит (подглазурни бои), глазиране, глазурно изпичане, post-firing techniques (раку, опушване, сагар)

### Мотивация

Изделието **не е състояние, а опционална история**. Окарина за 3 седмици може да минава през 5-6 етапа, 2 изпичания, 20+ снимки. Декорации (сграфито, ангоба, подглазурни бои) се случват в определен момент — не са „атрибут".

### Deploy-аеми итерации (важна промяна на стратегията)

Вместо „завърши всичко преди deploy", всяка итерация е напълно функционална и се deploy-ва:

**v1.4.0 — Schema only**
- Добавя се `events[]` поле на piece, празно по default
- Никакъв нов UI
- Backward compat verification

**v1.4.1 — Read-only timeline**
- Когато piece има events → показва ги в detail
- За legacy pieces без events → синтезира един „legacy" event от flat fields
- Все още не позволява добавяне на нов event

**v1.4.2 — Add/edit events**
- Modal за добавяне на event с type switcher
- Specific полета според type
- Flat fields на piece остават master, events са derived

**v1.4.3 — Events стават master**
- Flat fields (`stage`, `bisqueTemp`, `glazeTemp`) стават derived от events
- Save logic пише в events array, не в flat fields
- Финална миграция на legacy

**v1.4.4 (опционално) — Non-electric firing methods + decoration linkage**
- Раку, опушване, сагар, дърва, чушкопек като firing methods
- Decoration events linked към ангоби/подглазурни бои
- Material detail: „Използвана в декорации"

**Всяка версия е напълно функционална.** Ако спреш на v1.4.1, приложението работи.

### Data model промени (финал)

```javascript
piece = {
  id, name, type, clay, recipe, material, notes,
  stage,          // computed от последен event (cached)
  photos,         // общи thumbnails (cached)
  events: [
    {
      id, type, date, note, photos: [],
      // type-specific fields
    }
  ],
  createdAt, updatedAt
}
```

Event types:
- `stage` — преход към нов етап (greenware → leather-hard → bisque → ...)
- `progress` — междинна снимка/бележка без stage change
- `firing` — firing event (бисквит, глазурно, раку, друго)
- `decoration` — сграфито, ангобиране, подглазурни бои, burnishing, transfer

### Open questions (за обсъждане преди v1.4.0)

1. **Multiple decoration techniques на един event** — масив или отделни events? (Препоръчвам отделни events за clean timeline)
2. **Shared firing event** — ако 5 piece-а в едно firing, shared entity или отделни на всяко piece? (Препоръчвам отделни — по-проста архитектура)
3. **Reusable non-electric firing profiles** — extra entity тип или ad-hoc? (Препоръчвам ad-hoc засега)
4. **Multi-clay изделие** — естествено решение като decoration event („добавена втора глина"?)
5. **Тестове vs piece events** — да остане ли Тестовете отделен entity? (Препоръчвам ДА, не обединявай във Фаза Б)

### Pre-work преди v1.4.0 (TODO от теб)

- [ ] **Хартиен мокъп на timeline** за окарина — реално с молив, на хартия. Тествай вертикална, horizontal scroll, или calendar view. Това е **ЕДИН ЧАС работа**, спестява половин сесия refactor.
- [ ] Преоцена на отговорите на open questions

## ФАЗА В — Advanced (по желание)

- Aggregate reports („Колко изделия Q1", average firing cost)
- Calendar view
- Export на единично изделие като PDF
- Обединяване на Тестове с piece events (ако има смисъл)
- Idea wishlist — техники/идеи „искам да пробвам" (от външна обратна връзка април 2026)

---

# ЧАСТ 2: Cost & Supplier Tracking

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** среден-висок
**Може да се направи паралелно с Фаза Б** — независим от нея, малък scope

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

**Статус:** не започнат
**Приоритет:** среден

Нов entity `purchases` — {id, materialId, date, supplier, quantity, unitPrice, totalPrice, notes}.

## ЕТАП 3 — „Cost per ingredient в рецепта"

**Статус:** не започнат
**Приоритет:** среден

Няма data model промени. Показва cost breakdown в recipe detail + gram calculator.

## ЕТАП 4 — „Разход за изпичане"

**Статус:** не започнат
**Приоритет:** нисък
**Подход:** Manual entry на estimatedKwh в firing profile.

## ЕТАП 5 — „Пълна себестойност на изделие"

**Статус:** вероятно никога

---

# ЧАСТ 3: Паралелни идеи

### Idea wishlist (нова идея, април 2026)

**Приоритет:** среден
**Контекст:** „Тази техника от Instagram искам да пробвам" — отделно от material wishlist (за купуване) и от tests (вече направени).

Просто entity или таб с: idea name, source link, photos, related techniques, notes. Може и да е tab в Библиотека.

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
Когато SW засече нова версия → toast „Налична нова версия → Натисни за обнова". **Решава Android PWA cache проблема**, който се прояви при v1.2.4 → v1.3.0 deploy. Силно препоръчително преди следваща major версия.

### Compression на съществуващи снимки (one-time batch)

**Приоритет:** нисък
При upgrade, еднократно компресиране на всички съществуващи base64 снимки до новата 1000×1000 JPEG 0.75 норма.

---

# ЧАСТ 4: Отхвърлени идеи

- **Облачна синхронизация (Google Drive).** Риск > стойност.
- **Партиди/колекции/клиенти.** Product-centric flow.
- **Multi-user / sharing.** Личен инструмент.
- **Публикуване / social features.** Не е продуктът.
- **AI асистент за препоръки.** Premature.
- **Автоматично изчисление на firing kWh от физически модел.** Неточно.

---

# ЧАСТ 5: За следващ developer

- Един файл `index.html`, ~2900 реда vanilla JS + HTML + inline CSS
- localStorage — `atelie_v6` (main DB) + `atelie_userlib` (библиотека)
- DB: `{pieces, recipes, materials, tests, firingProfiles, _migrations}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc. + legacy aliases
- Derived relations — не се пази reverse FK data
- Backup format: JSON с `schemaVersion:2`, `exportedAt`, `device`, `db`, `userLibrary`

### Migration system

`runMigrations()` се извиква в `load()`. Всяка миграция:
- Проверява `DB._migrations[name]` flag — skip ако вече е изпълнена
- Backup-ва raw localStorage в `atelie_v6_pre_<name>` преди мутация
- Сетва flag-а и запазва при успех
- Idempotent — може да се извика многократно безопасно

Текущи миграции:
- `v1.3.2`: pieces.temp → glazeTemp; clays.fireTemp → fireGlazeTemp

### Всички полета на data model (към v1.3.2)

**piece:**
- Базови: `id`, `name`, `type`, `clay`, `technique`, `notes`, `date`, `stage`, `photos`, `createdAt`, `updatedAt`
- Температури: `bisqueTemp`, `glazeTemp` (~~`temp`~~ migrated)
- Глазура: `recipe` (FK към recipes), `material` (FK към готова глазура в materials)

**recipe:**
- `id`, `name`, `ingredients`, `temp`, `cone`, `type`, `notes`, `photo`, `fav`, `createdAt`, `updatedAt`, `recommendedFiringProfileId`

**material:**
- Базови: `id`, `name`, `cat`, `wishlist`, `brand`, `formula`, `stock`, `alertAt`, `notes`, `photo`, `chem`, `createdAt`, `updatedAt`
- Категории: `clays`, `base`, `ox`, `glaze`, `engobe`, `underglaze`
- Clay-specific: `fireBisqueTemp`, `fireGlazeTemp` (~~`fireTemp`~~ migrated), `grog`, `shrink`, `color`
- Glaze-specific: `gfire`, `gcolor`, `surfaceType`, `foodsafe`

**test:**
- Базови: `id`, `clay`, `date`, `temp`, `hold`, `flow`, `surf`, `def`, `rat`, `notes`, `glazeLayers`, `photos`, `createdAt`, `updatedAt`
- Глазура: `recipeId` (FK), `materialId` (FK към готова глазура)
- Firing: `firingProfileId` (FK)

**firingProfile:**
- `id`, `name`, `type`, `holdMin`, `ramps`, `notes`, `createdAt`, `updatedAt`

### Минимални patch принципи

- Inspect before modify
- No refactor
- Safe guards — null checks, `|| ''` fallbacks
- Test със стари localStorage данни преди deploy
- Bump на APP_VERSION + CACHE_NAME задължителен

---

# ЧАСТ 6: Открити въпроси

### От обратна връзка (окарина, април 2026)

- [x] Piece със няколко глини → засега в бележки (бъдещо в Фаза Б като decoration event)
- [ ] Reusable non-electric firing profiles — за раку/дърва
- [ ] Shared firing events — отделни или shared entity?
- [ ] Timeline visualization — кой тип UX? **TODO: хартиен мокъп преди v1.4.0**
- [ ] Transferни печати / декали — нова категория материали или decoration technique?

### Нови от външна оценка (април 2026)

- [ ] Idea wishlist — техники „искам да пробвам" (отделно от material wishlist)
- [ ] Тестове vs piece events — обединение в Phase В? (засега не)

### Общи

- [ ] Multi-device sync — ако стане нужно
- [ ] Reports/analytics — какви metrics полезни?
- [ ] Android PWA cache management — in-app update notification (силно препоръчителен преди следваща major)

---

# ЧАСТ 7: История на релийзите

## v1.3.2 (април 2026) — Hardening преди Фаза Б

**Контекст:** Cleanup на data debt от двете „две температури" миграции (v1.3.0 piece + v1.3.1 clay). Без нови features — само чисти данни и infrastructure за future миграции.

### Промени

- Нова `runMigrations()` функция в `load()` — idempotent, със safety backup в `atelie_v6_pre_<name>`
- Migration v1.3.2: `piece.temp` → `piece.glazeTemp` (legacy field изтрита)
- Migration v1.3.2: `material.fireTemp` → `material.fireGlazeTemp` за clays (legacy field изтрита)
- DEF_MATS глини обновени да използват `fireGlazeTemp` директно
- Legacy fallbacks в кода (`p.glazeTemp||p.temp`, `m.fireGlazeTemp||m.fireTemp`) **запазени умишлено** до v1.3.3 като safety net

### Защо важно

Преди Фаза Б Б1 (която ще добави events[]), data model-ът трябваше да е чист. Inflight миграции + нови архитектурни промени = bugs. Сега данните в localStorage имат канонична форма.

## v1.3.1 (април 2026) — Post-launch bug fixes + малки enhancements

### Bug fixes

- **B1** Имена на глини: „c1" → истинско име на всички места. Нов helper `clayName()`.
- **B2** Филтър „С глазура" вече включва и готови глазури.
- **B3** Филтър „Без глазура" правилно изключва изделия с готови глазури.

### Features

- **B4** Азбучно сортиране по default за всички списъци.
- **B5** Глини с две температури range (bisque + glaze).
- **B6** Тип на изделие (`piece.type`) с autocomplete datalist.

## v1.3.0 (април 2026) — Фаза А: Bugs + функционални gap-и

### Съдържание

- **A1** Bug fix: дублиран dropdown за глина
- **A2** Piece може да ползва готова глазура ИЛИ рецепта
- **A3** Нови категории материали: ангоби + подглазурни бои
- **A4** Две температури на piece: `bisqueTemp` + `glazeTemp`
- **A5** Готови глазури с характеристики: `gcolor`, `surfaceType`, `foodsafe`
- **A6** Тестове могат да тестват готови глазури
- **A7** Brand dropdown с autocomplete

### Бонус подобрения

- Searchable dropdown за глазури
- Photo compression (1000×1000, JPEG 0.75)
- Storage indicator в Библиотека
- Clear alert при save fail
- Visible X бутон за триене на photo thumbnails

## v1.2.x (по-ранни) — Design system + features

- v1.2.4: Stats боксове реорганизирани (Глини/Глазури/Суровини)
- v1.2.3: „Уреди" → „Редактирай" UX consistency
- v1.2.2: Focus rings, splash polish, chiniichka icon consistency
- v1.2.1: Cards + filters + buttons унифицирани
- v1.2.0: Rebrand „Ателие" → „Глина", нов design system (sage + terra cotta)

## v1.0.x — v1.1.x (март 2026) — Foundation

- Search, filters, sort за Pieces
- Quick stage actions
- Materials UX refinements
- Duplicate functionality
- Related records между всички 5 entity
- Backup/import с age warning

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
