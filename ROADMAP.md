# Глина — План за развитие

Документ за планирано развитие на функционалностите. Обновява се при всяко завършване на етап или промяна в плана.

**Текуща версия:** v1.2.4 · `atelie-v17`
**В процес:** v1.3.0 (Фаза А — Bugs + функционални gap-и)
**Последна ревизия:** април 2026

---

## Философия

Приложението „Глина" е направено за ателие-базирана керамична практика — ръчна работа, експериментални тестове, малки производства. НЕ цели да бъде общ керамичен CRM или да обслужва продажби/клиенти/партиди — това е различен продукт.

Целта е **относително универсално приложение за керамици** (не само за конкретен workflow), без комерсиална част.

Развитието върви по **йерархия на реалните нужди** — всеки етап се прави **само след** реална употреба на предишния и потвърдена нужда от следващия.

---

## Принципи на работа

- Без нов state layer — всички нови entity-та са масив в `DB`
- Без архитектурни промени без реална нужда — vanilla JS + localStorage остава
- Backward compatibility — всеки нов patch работи със стари localStorage данни
- Малки patch-ове — ако етап е повече от 2-3 patch-а, разбий го
- Bump на APP_VERSION + CACHE_NAME при всеки production patch
- Тествай между фази — без real-world употреба не се знае дали основата е стабилна

---

# ЧАСТ 1: Piece Model Evolution

След първа обратна връзка от реална употреба (окарина проект), стана ясно че:

- Текущият piece model с едно `stage`, едно `temp`, една `date` е твърде наивен за реалния керамичен workflow
- Реалният workflow е **исторически** — изделието има живот през множество етапи, снимки, температури, firing методи
- Някои ограничения са истински bugs или функционални gap-и, не нужни от архитектурна промяна

Разделяме на 3 фази от прости корекции към дълбок architectural shift.

## ФАЗА А — Bugs + функционални gap-и (v1.3.0)

**Статус:** в процес
**Ефорт:** ~7 малки patch-а в една сесия
**Риск:** нисък — без архитектурни промени

### Съдържание (по реда на работа)

**А1. Bug fix — дублиран dropdown за глина в piece modal.**
Регресионен bug. Един-редов fix.

**А2. Piece може да избере глазура от рецепти ИЛИ от готови глазури.**
В момента `piece.recipe` е FK само към recipes. Ако ползваш готова Botz/Mayco — няма къде да се запише. Решение: един dropdown със groups (optgroup) „Рецепти" и „Готови глазури". Ново поле `piece.material` (FK към material.id за готови). Backward compat: старите pieces с `recipe` продължават да работят.

**А3. Нови категории материали: ангоби + подглазурни бои.**
В момента: clays, base, ox, glaze. Добавят се: `engobe`, `underglaze`. Нови tabs в Материали, нови иконки, нови характеристики (цвят).

**А4. Две температури на piece: bisque temp + glaze temp.**
Плоски полета `bisqueTemp` и `glazeTemp` (без event migration засега). Миграция: старото `temp` → `glazeTemp` по default. Показват се conditionally в detail. В редакция — ясни labels („Бисквит °C", „Глазурно °C").

**А5. Готови глазури с специфични характеристики.**
За `cat==='glaze'` — нови полета:
- `color` (свободен текст)
- `foodsafe` (boolean — важно за съдове)
- `surfaceType` (матова/гланцова/сатенирана/кристална/текстурирана)

Показват се conditionally в modal и detail.

**А6. Тестове могат да тестват готови глазури.**
Grouped dropdown в test modal, ново `test.materialId`. Backward compat: стари тестове с `recipeId` работят. В detail показва правилно името независимо от източника.

**А7. Brand dropdown с предишни стойности.**
В material modal, brand вече не е свободен текст, а dropdown с `+ Нов` опция. Autocomplete от предишно въведените brand-ове.

### Success criteria

- Не се допускат bugs от документа (дублиран dropdown, тест с готова глазура)
- Мога да създам окарина с: две температури, готова глазура, engobe
- Backward compatibility — старите данни работят
- UI не се е претоварил

### Success look like

След завършване на Фаза А, могат да се правят:
- Bisque-only изделия (само bisqueTemp, без glaze)
- Изделия с готови глазури (без да се налага рецепта-обвивка)
- Тестове на готови глазури (директно на материала)
- Ангобиране като отделна категория материали

## ФАЗА Б — Event-based piece model

**Статус:** планиран, след 2-3 седмици реална употреба на Фаза А
**Ефорт:** ~4 сесии + 1 седмица тест
**Риск:** висок — фундаментална архитектурна промяна

### Мотивация

Изделието не е **състояние** — то е **история**. Окарина за 3 седмици минава през 5-6 етапа, 2 изпичания, 20+ снимки на различни моменти.

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

- `progress` — междинна снимка/бележка в рамките на текущ етап
- `stage` — преход към нов етап (greenware → leather-hard), не-firing
- `firing` — firing event с температура и method

### Firing event schema

```
firing: {
  method: 'electric' | 'gas' | 'wood' | 'raku' | 'pit' | 'sawdust' | 'salt' | 'saggar' | 'other',
  profileId: "...",    // само при electric + профил
  temp: 1240,
  fuel: "дъб",         // за wood/gas
  additives: "меден сулфат, медна тел",
  duration: 4,         // часове за non-electric
  notes: "..."
}
```

### UX промени

- Piece detail — timeline на events
- „Добави събитие" бутон с type switcher
- List view — последна снимка от последния event
- Backward compat: стари pieces с flat fields → synthesized legacy event

### Open questions

1. Progress events без stage change — имат ли смисъл, или всяка снимка е етап?
2. Firing methods — dropdown или свободен текст?
3. Decoration additives — структурирано поле или свободен текст?
4. Timeline visualization — вертикална, horizontal scrollable, календарна?
5. Shared firing event — ако 5 piece-а в едно firing, shared entity или отделни events?

## ФАЗА В — Advanced (по желание)

**Статус:** не започнат, може никога
**Ефорт:** среден

### Примерни идеи

- Multiple decoration techniques per piece (array на decorations с date, type, materials)
- Timeline visualization в detail view
- Aggregate reports („Колко изделия Q1", average firing cost, most used clay)
- Calendar view
- Export на единично изделие като PDF

---

# ЧАСТ 2: Cost & Supplier Tracking

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** висок (след Фаза А на Piece evolution)
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
**Предварителни условия:** Етап 1 работи

Нов entity `purchases` — {id, materialId, date, supplier, quantity, unitPrice, totalPrice, notes}.

## ЕТАП 3 — „Cost per ingredient в рецепта"

**Статус:** не започнат
**Приоритет:** среден
**Предварителни условия:** Етап 1 завършен

Няма data model промени. Показва cost breakdown в recipe detail + gram calculator.

## ЕТАП 4 — „Разход за изпичане"

**Статус:** не започнат
**Приоритет:** нисък
**Подход:** Manual entry на estimatedKwh в firing profile. Не физически модел.

## ЕТАП 5 — „Пълна себестойност на изделие"

**Статус:** вероятно никога
**Забележка:** След Фаза Б на piece evolution може да стане по-feasible (точна история на firings и decorations). Но стойност остава ниска ако не се продават изделия.

---

# ЧАСТ 3: Паралелни идеи

### SG (Specific Gravity) калкулатор за глазура

**Приоритет:** нисък
Ново поле в `test` + display. Малък patch.

### Firing log с target vs actual

**Приоритет:** нисък-среден
Препокрива се с Фаза Б firing events. Вероятно като част от нея.

### Image lightbox за снимки

**Приоритет:** среден
Click на снимка → fullscreen overlay с swipe навигация.

### Draft auto-save в modals

**Приоритет:** нисък
При промяна → localStorage `atelie_draft_<entity>`. При re-open → питане „Възстанови чернова?"

---

# ЧАСТ 4: Отхвърлени идеи

- **Облачна синхронизация (Google Drive).** Риск > стойност при работа основно на едно устройство. Backup/restore е достатъчен.
- **Партиди/колекции/клиенти.** Product-centric flow, различно приложение.
- **Multi-user / sharing.** App е личен инструмент.
- **Публикуване / social features.** Не е продуктът.
- **AI асистент за препоръки.** Premature без достатъчно данни.
- **Автоматично изчисление на firing kWh от физически модел.** Неточно без измервания.

---

# ЧАСТ 5: За следващ developer

Ако не работя с Claude по-нататък:

- Един файл `atelie_v6.html`, ~2500 реда vanilla JS + HTML + inline CSS
- localStorage — `atelie_v6` (main DB) + `atelie_userlib` (библиотека)
- DB: `{pieces, recipes, materials, tests, firingProfiles}` — всичко масиви
- Service worker `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- Icons в `icons/` + `app.webmanifest`
- Deploy: GitHub Pages от https://tskovacheva.github.io/atelie-app/
- CSS design system от v1.2.0: `--primary`, `--surface`, etc. + legacy aliases
- Derived relations — не се пази reverse FK data; свързаните записи се изчисляват при detail open
- Backup format: JSON с `schemaVersion:2`, `exportedAt`, `device`, `db`, `userLibrary`. Schema v1 (без firingProfiles) поддържан при import.

### Минимални patch принципи

- Inspect before modify — виж текущия код
- No refactor
- Safe guards — null checks, `|| ''` fallbacks
- Test със стари localStorage данни преди deploy
- Bump на APP_VERSION + CACHE_NAME задължителен

---

# ЧАСТ 6: Открити въпроси

Отбелязани за да не се загубят. Ще се разглеждат поетапно.

### От първа обратна връзка (окарина, април 2026)

- [ ] Reusable non-electric firing profiles — за раку/дърва, ако се използват често. Засега ad-hoc в note.
- [ ] Shared firing events — на всяко piece отделен event или shared entity?
- [ ] Timeline visualization — кой тип UX е най-добър?
- [ ] Transferни печати / декали — нова категория материали?

### Общи

- [ ] Multi-device sync — ако стане нужно, как? Google Drive с manual merge? Backend?
- [ ] Reports/analytics — какви metrics ще са полезни?

---

*Документът е жив — обновява се при всяко завършване на фаза или промяна в плана.*
