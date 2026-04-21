# Глина — План за развитие

**Текуща версия:** v1.3.0 · `atelie-v20`
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

**Статус:** завършена април 2026

### Съдържание

- **A1** ✅ Bug fix: дублиран dropdown за глина в piece + test modal
- **A2** ✅ Piece може да избере глазура от рецепти ИЛИ готови глазури — grouped dropdown + prefix parsing (rec:/mat:) + ново поле `piece.material`
- **A3** ✅ Нови категории материали — ангоби (`engobe`) + подглазурни бои (`underglaze`) с нови tabs и иконки
- **A4** ✅ Две температури на piece — `bisqueTemp` + `glazeTemp` (миграция на стария `temp` → `glazeTemp`)
- **A5** ✅ Готови глазури с характеристики — `gcolor`, `surfaceType`, `foodsafe` (безопасна за храна)
- **A6** ✅ Тестове могат да тестват готови глазури — ново поле `test.materialId`, grouped dropdown с search, derived relations в Material detail „Използвана в тестове"
- **A7** ✅ Brand dropdown с autocomplete — HTML datalist с предишни стойности

### Бонус доработки през Фаза А

- ✅ **Searchable dropdown** за глазури (piece + test modal) — input филтър над dropdown-а
- ✅ **Photo compression** — всички снимки през canvas, 1000×1000 max, JPEG 0.75
- ✅ **Storage indicator** в Библиотека — „Памет: X.XX MB" с warning при >75% използване
- ✅ **Clear save fail feedback** — modal alert при QuotaExceededError (вместо тих toast)
- ✅ **Visible X бутон** за триене на photo thumbnails в modal-ите

### Критични bug fix-ове през Фаза А

- ✅ Дублиран dropdown за глина при избор в piece/test modal
- ✅ Невъзможно да тестваш готова глазура (само рецепти)
- ✅ Невъзможно да избереш готова глазура на piece (само рецепти)
- ✅ Photo thumbnails не можеха да се изтриват (locally-scoped arr var в onclick)
- ✅ Снимки под 1600px не се компресираха изобщо (водеше до quota exceeded)

## ФАЗА Б — Event-based piece model

**Статус:** планиран, след 2-3 седмици реална употреба на Фаза А
**Ефорт:** ~4 сесии + 1 седмица тест
**Риск:** висок — фундаментална архитектурна промяна

### Мотивация

Изделието не е **състояние** — то е **история**. Окарина за 3 седмици минава през 5-6 етапа, 2 изпичания, 20+ снимки.

### Data model промени

```
piece = {
  id, name, clay, recipe, material, notes,
  stage,          // computed от последен event, cached
  photos,         // общи thumbnails, за back-compat
  events: [       // НОВ масив
    { id, type, date, stage, note, photos, firing: {...} }
  ],
  createdAt, updatedAt
}
```

### Event types

- `progress` — междинна снимка/бележка
- `stage` — преход към нов етап
- `firing` — firing event с температура и method

### Firing event schema

```
firing: {
  method: 'electric' | 'gas' | 'wood' | 'raku' | 'pit' | 'sawdust' | 'salt' | 'saggar' | 'other',
  profileId: "...",    // само при electric + профил
  temp: 1240,
  fuel: "дъб",
  additives: "меден сулфат, медна тел",
  duration: 4,
  notes: "..."
}
```

### Open questions

1. Progress events без stage change — имат ли смисъл, или всяка снимка е етап?
2. Firing methods — dropdown или свободен текст?
3. Decoration additives — структурирано или свободен текст?
4. Timeline visualization — вертикална, horizontal scrollable, календарна?
5. Shared firing event — отделни events на всяко piece или shared entity?

## ФАЗА В — Advanced (по желание)

- Multiple decoration techniques per piece (array на decorations)
- Timeline visualization в detail view
- Aggregate reports („Колко изделия Q1", average firing cost)
- Calendar view
- Export на единично изделие като PDF

---

# ЧАСТ 2: Cost & Supplier Tracking

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** висок (следващо след Фаза А стабилизация)
**Предварителни условия:** 2+ седмици реална употреба на v1.3.x

### Нови полета в `material`

| Поле | Тип | Описание |
|---|---|---|
| `supplier` | string | Име на доставчик |
| `supplierUrl` | string | Директен линк |
| `lastPrice` | number | Последна цена на единица |
| `lastPriceUnit` | string | "kg", "g", "L", "бр" |
| `lastPriceDate` | ISO date | Кога е въведена цената |
| `packSize` | number | Стандартна опаковка |
| `packUnit` | string | Единица на опаковката |

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

### SG (Specific Gravity) калкулатор за глазура

**Приоритет:** нисък
Ново поле в `test` + display.

### Firing log с target vs actual

**Приоритет:** нисък-среден
Препокрива се с Фаза Б firing events.

### Image lightbox за снимки

**Приоритет:** среден
Click на снимка → fullscreen overlay с swipe.

### Draft auto-save в modals

**Приоритет:** нисък
При промяна → localStorage `atelie_draft_<entity>`.

### In-app update notification

**Приоритет:** среден
Когато SW засече нова версия → toast „Налична нова версия → Натисни за обнова". Решава Android PWA cache проблема.

### Compression на съществуващи снимки (one-time batch)

**Приоритет:** нисък
При upgrade, еднократно минава през всички съществуващи base64 снимки в materials/pieces/tests и ги recompress-ва до новата 1000×1000 JPEG 0.75 норма. Ще освободи паметта на съществуващи users.

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

- Един файл `atelie_v6.html`, ~2800 реда vanilla JS + HTML + inline CSS
- localStorage — `atelie_v6` (main DB) + `atelie_userlib` (библиотека)
- DB: `{pieces, recipes, materials, tests, firingProfiles}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc. + legacy aliases
- Derived relations — не се пази reverse FK data
- Backup format: JSON с `schemaVersion:2`, `exportedAt`, `device`, `db`, `userLibrary`

### Нови полета въведени във Фаза А (v1.3.0)

**piece:**
- `bisqueTemp` (string/number) — температура на бисквитно изпичане
- `glazeTemp` (string/number) — температура на глазурно изпичане (заменя `temp`)
- `material` (string) — FK към material.id ако е използвана готова глазура

**test:**
- `materialId` (string) — FK към material.id ако е тествана готова глазура

**material (cat='glaze'):**
- `gcolor` (string) — цвят на глазурата
- `surfaceType` (string) — matte/gloss/satin/crystal/textured
- `foodsafe` (string) — "yes"/"no" — безопасна за храна

**material categories:**
- `engobe` — ангоба
- `underglaze` — подглазурна боя

### Минимални patch принципи

- Inspect before modify
- No refactor
- Safe guards — null checks, `|| ''` fallbacks
- Test със стари localStorage данни преди deploy
- Bump на APP_VERSION + CACHE_NAME задължителен

---

# ЧАСТ 6: Открити въпроси

### От първа обратна връзка (окарина, април 2026)

- [ ] Reusable non-electric firing profiles — за раку/дърва
- [ ] Shared firing events — отделни или shared entity?
- [ ] Timeline visualization — кой тип UX?
- [ ] Transferни печати / декали — нова категория материали?

### Общи

- [ ] Multi-device sync — ако стане нужно
- [ ] Reports/analytics — какви metrics полезни?
- [ ] Android PWA cache management — in-app update notification

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
