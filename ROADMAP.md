# Глина — План за развитие

Документ за планирано развитие на функционалностите за inventory, цени и себестойност.

**Текуща версия:** v1.2.3 · `atelie-v16`
**Последна ревизия:** април 2026

---

## Философия

Приложението „Глина" е направено за ателие-базирана керамична практика — ръчна работа, експериментални тестове, малки производства. НЕ цели да бъде общ керамичен CRM или да обслужва продажби/клиенти/партиди — това е различен продукт.

Развитието върви по **йерархия на реалните нужди**:

1. **Какво трябва да купя и откъде** ← текуща ежедневна болка
2. **История на покупките** ← за trend analysis след време
3. **Cost per ingredient в рецепта** ← за workshop planning в Crafty Place
4. **Разход за изпичане** ← ако някога стане важно
5. **Пълна себестойност на изделие** ← вероятно никога

Всеки етап се прави **само след** реална употреба на предишния и потвърдена нужда от следващия. Не се правят етапи превантивно.

---

## Принципи на работа

- **Без нов state layer.** Всички нови entity-та са масив в `DB`.
- **Без архитектурни промени.** Vanilla JS + localStorage остава.
- **Backward compatibility.** Всеки нов patch трябва да работи със стари localStorage данни.
- **Малки patch-ове.** Ако един етап е повече от 2-3 patch-а, разбий го.
- **Bump на APP_VERSION + CACHE_NAME** при всеки patch, който достига production.
- **Тествай 2 седмици между етапите.** Без real-world употреба, не се знае дали foundation-ът е стабилен.

---

## ЕТАП 1 — „Какво трябва да купя и откъде"

**Статус:** не започнат
**Приоритет:** висок
**Предварителни условия:** 2+ седмици реална употреба на v1.2.3

### Проблем

Когато материал свършва, няма лесен начин да си спомня откъде го поръчах последно, колко струваше и с какво количество. Ровя в имейли и сайтове.

### Решение

Разширяване на material model с полета за доставка.

### Нови полета в `material`

| Поле | Тип | Описание |
|---|---|---|
| `supplier` | string | Име на доставчик („glazura.bg", „Eurokeramiki") |
| `supplierUrl` | string | Директен линк към продукта (опционално) |
| `lastPrice` | number | Последна цена на единица в лв. |
| `lastPriceUnit` | string | „kg", „g", „L", „бр" (default: „kg") |
| `lastPriceDate` | ISO date | Кога е въведена цената |
| `packSize` | number | Стандартна опаковка (напр. 1, 5, 25) |
| `packUnit` | string | Единица на опаковката (kg, L, бр) |

### UX промени

- В Material modal: нова секция „Доставка" след „Наличност", преди „Бележки"
- В Material detail: нова секция „Доставка" с показване на всички полета + линк към supplier
- В Notifications panel („⚠ Ниски"): под името на материала показвай последната цена и supplier-а
- Нов filter chip в Материали: „За поръчка" — всички материали с `supplier` попълнен и `stock <= alertAt`

### Обем работа

- ~50 реда нов HTML (form fields)
- ~30 реда нов JS (save/load на новите полета)
- ~40 реда нов render логика (detail section, notification display, filter)
- 1 малък patch, 1 сесия

### Success criteria

- След 2 седмици употреба, попълнил съм `supplier` на поне 80% от активните материали
- Когато нещо свърши, отварям Notifications и веднага виждам откъде да поръчам
- Не ровя в имейли за последната цена

### Възможни рискове

- Ако не попълвам supplier/цена честно, полетата стоят празни и функцията губи смисъл
- Цените се променят — `lastPrice` може да стане заблуждаващо. Затова `lastPriceDate` е важно

---

## ЕТАП 2 — „История на покупките"

**Статус:** не започнат
**Приоритет:** среден
**Предварителни условия:** Етап 1 работи, имам поне 3-4 покупки, които искам да запомня

### Проблем

Цените се менят. Без история не знам дали Kaolin е поскъпнал с 20% или е едно и също. Няма начин да видя „колко хранителни разходи имах за 2026 Q1".

### Решение

Нов entity `purchases` — самостоятелен масив в `DB`.

### Нов entity schema

```javascript
{
  id: string,                // uuid
  materialId: string,        // FK към material.id
  date: ISO date,            // кога е направена покупката
  supplier: string,          // может да е различен от material.supplier (понякога поръчваш от друго място)
  quantity: number,          // колко е купено
  quantityUnit: string,      // "kg", "L", "бр"
  unitPrice: number,         // цена за единица
  totalPrice: number,        // calculated или manually overridden
  notes: string,             // партиден номер, наблюдения
  createdAt, updatedAt: ISO date
}
```

### UX промени

- В Material detail: нова секция „История на покупките" — list.li с дата, количество, сума, supplier
- Нов button в Material detail: „Регистрирай покупка" → отваря малък modal
- При save на нова покупка:
  - `material.stock` += `quantity` (автоматично добавяне към наличността)
  - `material.lastPrice` = `unitPrice`
  - `material.lastPriceDate` = `date`
  - `material.supplier` = `supplier` (ако е различен)
- Нов екран: глобален purchase log (опционално) — всички покупки сортирани по дата

### Обем работа

- Нов entity със CRUD — modal, save, delete, render в detail
- ~150 реда нов JS/HTML
- 2 patch-а: (1) entity + form, (2) integration в material detail

### Success criteria

- Всяка реална покупка се записва в app-а в деня, в който пристигне
- Мога да видя за избран материал как са се променяли цените му
- `stock`-ът остава точен без ръчно update

### Рискове

- Disordered data — ако покупка се запише с грешен `materialId`, stock се bloat-ва. Нужен е дропдаун с избор, не свободен текст
- Няма undo — ако се сгреши purchase, нужно е manual correction

---

## ЕТАП 3 — „Cost per ingredient в рецепта"

**Статус:** не започнат
**Приоритет:** среден
**Предварителни условия:** Етап 1 завършен, поне 70% от материалите в активните рецепти имат `lastPrice`

### Проблем

За workshop planning в Crafty Place трябва да знам колко струват материалите за да пресметна pricing на участник. Ръчно изчисление е трудоемко.

### Решение

Добавя се cost display в recipe detail и gram calculator.

### Няма data model промени

Използват се вече съществуващи полета: `recipe.ingredients` (с `matId`, `pct`) + `material.lastPrice` + `material.lastPriceUnit`.

### Нова функция

```javascript
function calcRecipeCost(recipe, batchGrams){
  // Returns {total: лв, breakdown: [{ingredient, cost, missingPrice: bool}]}
  // Обработва: material изтрит, material без lastPrice, unit conversion
}
```

### UX промени

- В Recipe detail, под gram calculator-а:
  - Нов ред „Приблизителна себестойност: ~X.XX лв"
  - Малък breakdown-toggle: per-ingredient cost
  - Ако някои съставки нямат цена, показвай warning („5 от 7 съставки имат цени, останалите не са включени в сметката")
- Ако в материалите масово липсват цени, display-ва се съобщение „Добави цени към материалите, за да видиш себестойност"

### Обем работа

- ~40 реда нов JS (calc функция + render)
- ~10 реда HTML
- 1 patch, половин сесия

### Success criteria

- Преди всеки workshop, отварям recipe-та и виждам material cost за X участници
- Знам кои рецепти са „евтини" (може да правя с много участници) vs „скъпи" (за индивидуални класове)

---

## ЕТАП 4 — „Разход за изпичане"

**Статус:** не започнат
**Приоритет:** нисък
**Предварителни условия:** Етапи 1-3 работят; имам данни за kWh разход от реални измервания

### Проблем

Ток за firing е значителен разход, но не се следи. Не знам дали един bisque firing ми струва 5 лв или 15 лв.

### Решение (Подход А — prag matic)

Ръчно въвеждане на estimated cost в firing profile. НЕ автоматично изчисление от физически модел (неточно без реални измервания).

### Нови полета в `firingProfile`

| Поле | Тип | Описание |
|---|---|---|
| `estimatedKwh` | number | Приблизителен kWh разход за пълен цикъл |
| `estimatedCost` | number | Приблизителна цена в лв (calculated или manually) |
| `kwhPrice` | number | Цена на kWh към датата на измерване |
| `measuredDate` | ISO date | Кога е било последното измерване |

### UX промени

- В Firing Profile modal: нова секция „Разход" с тези полета
- В Firing Profile detail: ред „Приблизителен разход: 8.50 лв (~4.2 kWh @ 2.00 лв/kWh)"
- В Test detail: ако тестът е свързан с profile, показвай inherited cost

### Обем работа

- ~30 реда нов HTML/JS
- 1 patch

### Success criteria

- Измерил съм с kWh meter реални разходи за поне 3 firing цикъла
- Имам попълнени `estimatedKwh` за bisque и glaze profile
- Знам приблизителната цена на всяко firing-а

### Важна бележка

**Не правя Подход Б** (автоматично изчисление от ramp rates + kiln mass + insulation). Това е физически модел, който без реални измервания е неточен. Фирмата prag matic е по-добра.

---

## ЕТАП 5 — „Пълна себестойност на изделие"

**Статус:** вероятно никога
**Приоритет:** много нисък
**Предварителни условия:** Всички предишни етапи завършени + реална необходимост (продажби на изделия, а не workshop-и)

### Защо „вероятно никога"

- Не продавам изделия в търговски мащаб
- Себестойността е любопитство, не бизнес нужда за мен
- Много data collection effort (weight на изделие, глазура usage, shared firing cost) за минимална стойност

### Ако все пак се направи

Нови полета в `piece`:
- `weightDry` (тегло в leather-hard)
- `clayUsed` (calculated от weight + shrinkage или manual)
- `glazeUsed` (manual estimation — много трудно за точна мярка)
- `firingCostShare` (1/capacity на firing-а)

Нова функция `calcPieceCost(piece)` — сумиране на clay cost + glaze cost + firing share.

**Очаквани проблеми:**
- Глазура usage е неточен — колко остана върху парчето vs в кофата?
- Shared firing cost — делиш по бройка, тегло или обем?
- Работно време — ако е добавено, manual entry е досадно

Решение ще има смисъл **само ако** в някой бъдещ момент регулярно продавам изделия и искам стабилна pricing система. Не за ателие-практика.

---

## Паралелни идеи (не етапи, възможни прибавки)

### SG (Specific Gravity) калкулатор за глазура

**Приоритет:** нисък-среден
**Контекст:** текущо в troubleshooting на ash glazes — целта е 1.40–1.45

- Ново поле в `test`: `sg` (number) — измерено specific gravity
- В Test detail: display на SG
- Evtl нов filter/sort в Тестове

Малък patch, но не е критичен. Мога да записвам в notes засега.

### Firing log с target vs actual

**Приоритет:** нисък
**Контекст:** целя 1240–1250°C, а реалният ход на kiln-а не винаги съвпада

- Нов entity `firingLogs` — запис за всяко реално firing
- `targetProfileId` + `actualMaxTemp` + `actualHoldTime` + deviation analysis

Полезно при systematic troubleshooting, но сега manual в notes е достатъчно.

### Image lightbox за снимки

**Приоритет:** среден
**Контекст:** в Тестове има до 6 снимки, но thumbnail-те са малки и не може да се види детайл

- Click на снимка → fullscreen overlay с swipe навигация
- Малка, self-contained feature

### Draft auto-save в modals

**Приоритет:** нисък
**Контекст:** ако случайно затворя modal, губя въведеното

- При промяна в modal → записване в localStorage `atelie_draft_<entity>`
- При повторно отваряне → питане „Възстанови чернова?"

Чисто UX подобрение, не засяга data model.

---

## Отхвърлени идеи (да не се правят)

- **Облачна синхронизация (Google Drive).** Риск > стойност при работа основно на едно устройство. Backup/restore workflow-ът е достатъчен.
- **Партиди/колекции/клиенти.** Това е product-centric jewelry flow, не ateliéно. Ако се добави, ще замъгли продукта.
- **Multi-user / sharing.** Няма нужда. App-ът е личен инструмент.
- **Публикуване / social features.** Не е продуктът.
- **AI асистент за препоръки.** Premature — няма достатъчно данни в един потребител за смислени препоръки.

---

## За следващ developer

Ако не работя с Claude по-нататък и trябва да обясня кода:

- **Един файл** (`atelie_v6.html`), ~2500 реда vanilla JS + HTML + inline CSS
- **localStorage** с два ключа: `atelie_v6` (main DB) и `atelie_userlib` (библиотека)
- **DB structure:** `{pieces, recipes, materials, tests, firingProfiles}` — всичко масиви
- **Service worker** в отделен `sw.js`. Bump `CACHE_NAME` при всеки deploy.
- **Icon/manifest** в `icons/` папка + `app.webmanifest`
- **Deploy:** GitHub Pages от https://tskovacheva.github.io/atelie-app/
- **CSS design system:** от v1.2.0. Нови vars (`--primary`, `--surface`, etc.) + legacy aliases (`--tx`, `--acc`) за backward compat
- **Derived relations** — никаква FK data не се пази; всички свързани записи се изчисляват при detail view open
- **Backup format:** JSON с `schemaVersion:2`, `exportedAt`, `device`, `db`, `userLibrary`. Schema v1 (без `firingProfiles`) все още поддържан при import

### Минимални patch принципи

- Inspect before modify — винаги виж текущия код
- No refactor — промяната се впише в съществуващата архитектура
- Safe guards — null checks, `|| ''` fallbacks за липсващи полета в стари records
- Test със старите localStorage данни преди deploy
- `APP_VERSION` + `CACHE_NAME` bump задължителен при всеки production patch

---

*Документът е жив — обновява се при всяко завършване на етап или промяна в плана.*
