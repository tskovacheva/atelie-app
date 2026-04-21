# Глина — План за развитие

**Текуща версия:** v1.3.1 · `atelie-v21`
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

---

# ЧАСТ 1: Piece Model Evolution

## ФАЗА А — Bugs + функционални gap-и ✅ ЗАВЪРШЕНА (v1.3.0)

Завършена април 2026. Детайли в ЧАСТ 7 (история на релийзите).

## ФАЗА А.1 — Post-launch bug fixes + малки enhancements ✅ ЗАВЪРШЕНА (v1.3.1)

Завършена април 2026. Детайли в ЧАСТ 7 (история на релийзите).

## ФАЗА Б — Event-based piece model + decoration

**Статус:** предстояща
**Ефорт:** ~4-5 сесии + 1 седмица тест между итерациите
**Риск:** висок — фундаментална архитектурна промяна
**Предварителни условия:** 2-3 седмици реална употреба на v1.3.1

### Мотивация

Изделието **не е състояние, а история**. Окарина за 3 седмици минава през 5-6 етапа, 2 изпичания, 20+ снимки. Декорации (сграфито, ангоба, подглазурни бои) се случват в определен момент от живота — не са „атрибут". Настоящият flat model не може да моделира това.

### Подфази

**Б1 — Data model + migration (сесия 1)**
- Нов масив `piece.events` с stages, progresses, firings, decorations
- Backward compat — синтезиране на legacy event от flat fields
- Validation че старите изделия продължават да се отварят и редактират

**Б2 — Timeline UI в piece detail (сесия 2)**
- Вертикална timeline на events в хронологичен ред
- Миниатюри на снимки, дати, stage badges
- Copy от предишно за бърз input

**Б3 — Add/edit event modal (сесия 3)**
- Модал за добавяне на event с type switcher
- Специфични полета според type (stage/progress/firing/decoration)
- Ред на events се sort-ва по дата

**Б4 — Decoration events с material linkage (сесия 4)**
- Decoration event type-ове: сграфито, ангобиране, подглазурни бои, burnishing, трансферен печат, други
- Linked material reference (engobe, underglaze) — clickable към material detail
- В material detail нова секция „Използвана в декорации"

**Б5 — Firing methods + polish (сесия 5, опционална)**
- Firing event с non-electric methods (wood, raku, pit, sawdust, salt, saggar, чушкопек)
- Method-специфични полета (fuel, additives, duration)
- Polish на timeline UI

### Data model промени

```javascript
piece = {
  id, name, type, clay, recipe, material, notes,
  stage,          // computed от последен event, cached
  photos,         // общи thumbnails, за back-compat
  events: [       // НОВ масив
    {
      id,
      type: 'stage' | 'progress' | 'firing' | 'decoration',
      date: ISO,
      note,
      photos: [],
      // type-specific:
      stageValue,    // за type='stage'
      firing: {...}, // за type='firing'
      decoration: {...} // за type='decoration'
    }
  ],
  createdAt, updatedAt
}

firing event schema:
{
  method: 'electric' | 'gas' | 'wood' | 'raku' | 'pit' | 'sawdust' | 'salt' | 'saggar' | 'chushkopek' | 'other',
  profileId,     // при electric + профил
  temp,
  fuel,          // за wood/gas
  additives,     // медна тел, оксиди и т.н.
  duration,      // часове
  notes
}

decoration event schema:
{
  technique: 'sgraffito' | 'engobe' | 'underglaze' | 'burnishing' | 'transfer' | 'carving' | 'slip_trailing' | 'other',
  materialIds: [], // FK към ангоби/подглазурни бои
  notes
}
```

### Open questions (за обсъждане преди Б1)

1. **Progress events без stage change — имат ли смисъл?** Или всяка снимка е stage event?
2. **Firing methods — dropdown или свободен текст?**
3. **Decoration — FK към material (array) или просто list от имена?**
4. **Timeline visualization — вертикална, horizontal scrollable, календарна?**
5. **Shared firing event — ако 5 piece-а в едно firing, shared entity или отделни events?**
6. **Multi-clay изделие** (от обратна връзка на v1.3.1) — естествено място в event model или отделен field?

## ФАЗА В — Advanced (по желание)

- Multiple decoration techniques per piece (вече частично решено в Б4)
- Aggregate reports („Колко изделия Q1", average firing cost)
- Calendar view
- Export на единично изделие като PDF
- Timeline visualization подобрения (horizontal, zoom, filters)

---

# ЧАСТ 2: Cost & Supplier Tracking

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** висок (след Фаза Б стабилизация)

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
**Забележка:** след Фаза Б може да е по-feasible (има точна история на firings и decorations).

---

# ЧАСТ 3: Паралелни идеи

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

- Един файл `atelie_v6.html`, ~2850 реда vanilla JS + HTML + inline CSS
- localStorage — `atelie_v6` (main DB) + `atelie_userlib` (библиотека)
- DB: `{pieces, recipes, materials, tests, firingProfiles}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc. + legacy aliases
- Derived relations — не се пази reverse FK data
- Backup format: JSON с `schemaVersion:2`, `exportedAt`, `device`, `db`, `userLibrary`

### Всички полета на data model (към v1.3.1)

**piece:**
- Базови: `id`, `name`, `type` (v1.3.1), `clay`, `technique`, `notes`, `date`, `stage`, `photos`, `createdAt`, `updatedAt`
- Температури: `bisqueTemp` (v1.3.0), `glazeTemp` (v1.3.0), `temp` (legacy, replaced by glazeTemp)
- Глазура: `recipe` (FK към recipes), `material` (v1.3.0, FK към готова глазура в materials)

**recipe:**
- `id`, `name`, `ingredients`, `temp`, `cone`, `type`, `notes`, `photo`, `fav`, `createdAt`, `updatedAt`, `recommendedFiringProfileId`

**material:**
- Базови: `id`, `name`, `cat`, `wishlist`, `brand`, `formula`, `stock`, `alertAt`, `notes`, `photo`, `chem`, `createdAt`, `updatedAt`
- Категории: `clays`, `base`, `ox`, `glaze`, `engobe` (v1.3.0), `underglaze` (v1.3.0)
- Clay-specific: `fireBisqueTemp` (v1.3.1), `fireGlazeTemp` (v1.3.1), `fireTemp` (legacy), `grog`, `shrink`, `color`
- Glaze-specific: `gfire`, `gcolor` (v1.3.0), `surfaceType` (v1.3.0), `foodsafe` (v1.3.0)

**test:**
- Базови: `id`, `clay`, `date`, `temp`, `hold`, `flow`, `surf`, `def`, `rat`, `notes`, `glazeLayers`, `photos`, `createdAt`, `updatedAt`
- Глазура: `recipeId` (FK), `materialId` (v1.3.0, FK към готова глазура)
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

### От първа обратна връзка (окарина, април 2026)

- [x] Piece със няколко глини → засега в бележки (реалистично решение в Фаза Б като decoration/stage event)
- [ ] Reusable non-electric firing profiles — за раку/дърва
- [ ] Shared firing events — отделни или shared entity?
- [ ] Timeline visualization — кой тип UX?
- [ ] Transferни печати / декали — нова категория материали или decoration technique?

### Общи

- [ ] Multi-device sync — ако стане нужно
- [ ] Reports/analytics — какви metrics полезни?
- [ ] Android PWA cache management — in-app update notification (високо препоръчителен преди следваща major)

---

# ЧАСТ 7: История на релийзите

## v1.3.1 (април 2026) — Post-launch bug fixes + малки enhancements

**Контекст:** Първа обратна връзка след v1.3.0 deploy от реална употреба.

### Bug fixes

- **B1** Имена на глини: „c1" → истинско име на всички места (list, detail, search). Нов helper `clayName()` resolve-ва material ID към име.
- **B2** Филтър „С глазура" вече включва и готови глазури (не само рецепти).
- **B3** Филтър „Без глазура" правилно изключва изделия с готови глазури.

### Features

- **B4** Азбучно сортиране по default за всички списъци (Изделия, Рецепти, Материали, Тестове).
- **B5** Глини с две температури range (bisque + glaze), напр. „900–1000" и „1220–1280". Миграция на стария `fireTemp` → `fireGlazeTemp`.
- **B6** Тип на изделие (`piece.type`) с autocomplete datalist. Показва се в list (italic), detail, search.

## v1.3.0 (април 2026) — Фаза А: Bugs + функционални gap-и

**Контекст:** След първа реална употреба (окарина), въвеждане на множество подобрения в piece/material data models.

### Съдържание

- **A1** Bug fix: дублиран dropdown за глина (piece + test modal)
- **A2** Piece може да ползва готова глазура ИЛИ рецепта (grouped dropdown + prefix parsing)
- **A3** Нови категории материали: ангоби (🎭) + подглазурни бои (🖌)
- **A4** Две температури на piece: `bisqueTemp` + `glazeTemp` с миграция
- **A5** Готови глазури с характеристики: `gcolor`, `surfaceType`, `foodsafe`
- **A6** Тестове могат да тестват готови глазури (ново поле `test.materialId`)
- **A7** Brand dropdown с autocomplete (HTML datalist)

### Бонус подобрения

- Searchable dropdown за глазури
- Photo compression (1000×1000, JPEG 0.75) — решава quota exceeded bug
- Storage indicator в Библиотека с warning при >75% използване
- Clear alert при save fail (QuotaExceededError)
- Visible X бутон за триене на photo thumbnails

### Критични bugs, открити и оправени

- Photo thumbnails не можеха да се изтриват (locally-scoped `arr` var в onclick)
- Снимки под 1600px не се компресираха (quota exceeded)
- Невъзможно тестване/избор на готови глазури на piece
- Дублирани имена на глини в dropdown-ите

## v1.2.x (по-ранни) — Design system + features

- v1.2.4: Stats боксове реорганизирани (Глини/Глазури/Суровини), Wishlist изнесен от stats
- v1.2.3: „Уреди" → „Редактирай" UX consistency
- v1.2.2: Focus rings, splash polish, chiniichka icon consistency
- v1.2.1: Cards + filters + buttons унифицирани
- v1.2.0: Rebrand „Ателие" → „Глина", нов design system (sage + terra cotta)

## v1.0.x — v1.1.x (март 2026) — Foundation

- Search, filters, sort за Pieces
- Quick stage actions
- Materials UX refinements
- Duplicate functionality (recipe/test/firing profile)
- Related records между всички 5 entity
- Backup/import с age warning

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
