# Глина — Event Schema

**Статус:** v1.4.1 — schema готова, чака implementation
**Последна ревизия:** април 2026

Този документ дефинира пълната schema на event-ите за piece-овете. Базиран е на реалния керамичен workflow и обхваща електрически и алтернативни firing методи.

---

## Контекст

В v1.4.0 беше добавено поле `events[]` на piece schema-та (празно по default). Този документ дефинира **какво съдържат тези events**, така че следващите версии (v1.4.1 read-only timeline, v1.4.2 add/edit, v1.4.3 events stават master) да имат ясна спецификация.

Документът е резултат от детайлно обсъждане на реалния workflow — какви етапи минава едно изделие, какви decoration techniques има и кога са приложими, какви firing методи и атмосфери съществуват.

---

## Общи принципи

### Какво е event

Един event е **събитие в живота на изделието**. Има четири вида:

- `stage` — преход към нов етап (greenware → bisque и т.н.)
- `progress` — междинна снимка/бележка без stage change
- `firing` — изпичане (бисквит, глазурно, алтернативно)
- `decoration` — нанасяне на decoration technique (ангоба, сграфито, глазура и т.н.)

### Времева логика

Events живеят в **timeline-а на piece-а**, подредени по дата. Decoration и firing events **не са привързани към фиксиран stage** — те имат само дата, и timeline-ът ги ситуира хронологично.

Валидността на decoration technique спрямо stage е **property на самата technique**, не на event-а. Например „сграфито" има свойство „валидно на wet и leather-hard" — това е metadata на типа, а не на конкретния event.

### Общи полета (за всички event типове)

```javascript
{
  id,            // uuid, генерира се при create
  type,          // 'stage' | 'progress' | 'firing' | 'decoration'
  date,          // ISO date, ОПЦИОНАЛНО — позволено е да липсва
  note,          // свободен текст, опционално
  photos: [],    // base64 array, max 3, опционално
  data: {}       // type-specific полета (виж по-долу)
}
```

**Бележка за `date`:**
- Незадължително поле — потребителят може да добавя events без точна дата
- Когато липсва, event-ът отива в края на timeline-а (или с placeholder „без дата")
- Препоръчително да се добавя, но не блокиращо

---

## Event тип 1: `stage`

Преход към нов етап в живота на изделието.

### Stage values (6 етапа)

```
wet           — сурово / мокро (току-що изградено)
leather-hard  — кожна влажност (decoration window)
bone-dry      — сухо (готово за бисквит)
bisque        — бисквит (след първо изпичане)
glazed        — глазирано (нанесена глазура, преди финално изпичане)
finished      — готово (след финално изпичане)
```

**Бележки:**
- `glazed` е stage, не decoration. Decoration „нанасяне на глазура" е отделен event, който променя stage-а на piece-а към `glazed`.
- За piece, който минава през алтернативно firing (раку, обвара, pit), `finished` идва директно от `bone-dry` или `bisque` — пропуска се `glazed`.
- Stage events маркират **граници**. Между две stage events може да има много decoration или progress events.

### Schema

```javascript
{
  id, type: 'stage', date, note, photos: [],
  data: {
    stageValue: 'wet' | 'leather-hard' | 'bone-dry' | 'bisque' | 'glazed' | 'finished'
  }
}
```

### Примери

```javascript
// Току-що изградена окарина
{ type: 'stage', date: '2026-04-01', data: { stageValue: 'wet' }, note: 'Изградена с pinch pot техника' }

// Сушенето е готово
{ type: 'stage', date: '2026-04-05', data: { stageValue: 'bone-dry' } }
```

---

## Event тип 2: `progress`

Междинна снимка/бележка без stage change. Например: „виж как изглежда окарината на ден 3 от сушенето, текстурата стана както исках".

### Schema

```javascript
{
  id, type: 'progress', date, note, photos: [],
  data: {}  // няма type-specific полета
}
```

### Пример

```javascript
{
  type: 'progress',
  date: '2026-04-03',
  note: 'Сушене ден 3 — повърхността изглежда стабилна, без пукнатини',
  photos: ['data:image/jpeg;base64,...']
}
```

---

## Event тип 3: `firing`

Изпичане. **Най-сложният event тип** заради разнообразието на методи и атмосфери.

### Концептуални оси

Три **независими** оси характеризират едно изпичане:

**1. Метод (физическата конструкция):**

| Стойност | Описание |
|---|---|
| `electric` | Електрическа пещ |
| `gas` | Газова пещ |
| `wood` | Дървена пещ |
| `raku` | Раку пещ |
| `chushkopek` | Чушкопек (домашен, за малки тестове) |
| `pit` | Pit firing (трап) |
| `barrel` | Barrel firing (варел) |
| `sagar` | Сагар (с обвивка/контейнер) |
| `sawdust` | Опушване със стърготини |
| `soda` | Soda firing (сода) |
| `salt` | Salt firing (солно) |
| `obvara` | Обвара (ферментирали продукти) |
| `other` | Друго |

**2. Атмосфера (химически контекст):**

| Стойност | Описание |
|---|---|
| `oxidation` | Окислително (кислородна среда) |
| `reduction` | Редукционно (нисък кислород) |
| `neutral` | Неутрално |
| `na` | Не приложимо (например обвара) |

**3. Цел / тип (място в живота на изделието):**

| Стойност | Описание |
|---|---|
| `bisque` | Бисквитно (първо изпичане) |
| `glaze` | Глазурно (след глазиране) |
| `single-fire` | Еднопек (глазура върху сурово + едно изпичане) |
| `alternative` | Алтернативно (раку, обвара, pit като самостоятелна цел) |

**Защо тези три са независими:**
- Електрическа + окислително + бисквит — стандартен сценарий
- Газова + редукционно + глазурно — традиционна стoneware техника
- Раку + редукционно + алтернативно — раку с post-firing reduction
- Чушкопек + окислително + бисквит — за малки тестови парчета

### Schema

```javascript
{
  id, type: 'firing', date, note, photos: [],
  data: {
    method,         // от списъка по-горе (задължително)
    atmosphere,     // oxidation | reduction | neutral | na (задължително)
    firingPurpose,  // bisque | glaze | single-fire | alternative (задължително)
    temp,           // числово °C, опционално (може да е празно за алтернативни)
    duration,       // часове, опционално
    profileId,      // FK към firingProfile — само ако method='electric' и има профил
    details,        // свободен текст за горива, добавки, материали
    result          // кратък текст: какъв ефект се получи
  }
}
```

### Полето `details` (обединено)

Преди беше предложено да имаме отделни `fuel` и `additives` полета. Решено е да се обединят в едно поле `details` (свободен текст) за по-проста форма. Примери за съдържание:

- „Дъбови дърва, без добавки"
- „Меден сулфат + морска сол"
- „Медна тел около парчето + стърготини от черен бор"
- „Хляб + кисело мляко + копър за обвара"

### Полето `profileId`

- Показва се само когато `method === 'electric'`
- Опционално — потребителят може да въведе custom temp/duration вместо да избере профил
- FK към съществуващия `firingProfile` entity (не се променя — този entity остава както е)

### Примери

```javascript
// Стандартно бисквитно изпичане
{
  type: 'firing',
  date: '2026-04-08',
  data: {
    method: 'electric',
    atmosphere: 'oxidation',
    firingPurpose: 'bisque',
    temp: 1000,
    profileId: 'fp1',
    details: '',
    result: 'OK, нормален цвят'
  }
}

// Раку
{
  type: 'firing',
  date: '2026-05-15',
  data: {
    method: 'raku',
    atmosphere: 'reduction',
    firingPurpose: 'alternative',
    temp: 950,
    duration: 1,
    details: 'Раку глазура с медни оксиди, post-firing reduction в стърготини 10 мин',
    result: 'Великолепни медни искри, малко крекелюри в глазурата'
  },
  note: 'Първи опит за раку, общо взето добре'
}

// Обвара
{
  type: 'firing',
  date: '2026-06-02',
  data: {
    method: 'obvara',
    atmosphere: 'na',
    firingPurpose: 'alternative',
    temp: 850,
    details: 'Натапяне в смес от ферментирало брашно и кисело мляко след изваждане при ~850°C',
    result: 'Тъмни петна и кафяви ефекти, повърхността е суха матова'
  }
}
```

---

## Event тип 4: `decoration`

Нанасяне на decoration technique. Включва всичко от полиране и сграфито до глазура и подглазурни бои.

### Decoration techniques

Всяка technique има metadata за **валидни stage-ове** — UI може да филтрира опциите според текущия stage на piece-а.

| Technique | Описание | Валидни stage-ове |
|---|---|---|
| `sgraffito` | Сграфито (изрязване на рисунка) | wet, leather-hard |
| `stamp` | Печат / отпечатък (растения, печати, изображения) | wet, leather-hard |
| `terra-sigillata` | Тера сигилата (полиране с фини частици) | leather-hard, bone-dry, bisque |
| `engobe` | Ангоба (цветна керамична слип) | leather-hard, bone-dry, bisque |
| `slip` | Slip (керамична каша) | leather-hard, bone-dry, bisque |
| `oxide-wash` | Окис с претриване (меден, железен) | bone-dry, bisque |
| `underglaze` | Подглазурни бои | bisque |
| `glaze` | Глазура | bone-dry (single-fire), bisque |
| `burnishing` | Полиране с камък или лъжица | leather-hard |
| `carving` | Изрязване / релеф | leather-hard |
| `slip-trailing` | Slip-trailing (рисуване с slip) | leather-hard |
| `other` | Друго | всеки |

### Schema

```javascript
{
  id, type: 'decoration', date, note, photos: [],
  data: {
    technique,       // от списъка по-горе (задължително)
    materialIds: [], // array от FK към materials (опционално — например кои ангоби, окиси, глазури)
    application,     // метод на нанасяне (виж по-долу)
    coverage,        // обхват (виж по-долу)
    layers,          // число — само за glaze, underglaze, engobe (опционално)
    details          // свободен текст
  }
}
```

### Полето `application` (dropdown)

Метод на нанасяне:

| Стойност | Описание |
|---|---|
| `brush` | С четка |
| `dip` | Потапяне |
| `spray` | Впръскване / спрей |
| `pour` | Поливане |
| `rub` | Претриване (за окиси) |
| `stamp` | Печат |
| `imprint` | Отпечатък |
| `other` | Друго |

### Полето `coverage` (dropdown, опционално)

Какъв обхват има decoration-ът:

| Стойност | Описание |
|---|---|
| `full` | Цялостно покритие |
| `partial` | На участъци |
| `pattern` | Рисунка / мотив |

### Полето `layers` (число)

Показва се **само** когато `technique` е `glaze`, `underglaze`, или `engobe`. За други техники не е приложимо.

### Полето `materialIds` (array от FK)

- За techniques, които използват материали от inventory (ангоба, подглазурна боя, готова глазура, окис) — array от material IDs
- Допуска **множество материали** в един event — например „две глазури в слой"
- За techniques, които не използват inventory материали (сграфито, печат, burnishing) — празен array

### Многоматериални decoration events

Когато една decoration сесия използва няколко материала (например слагане на две глазури), това е **един event** с array от `materialIds`. Не отделни events.

Примери:
```javascript
// Една глазура, 3 слоя
{ technique: 'glaze', materialIds: ['g1'], layers: 3, application: 'brush' }

// Две глазури в слой
{ technique: 'glaze', materialIds: ['g1', 'g2'], layers: 2,
  details: 'g1 като база 1 слой, g2 на връх 1 слой' }

// Три глазури на нива
{ technique: 'glaze', materialIds: ['g1', 'g2', 'g3'], layers: 3,
  application: 'dip',
  details: 'Долна трета g1, средна g2, горна g3' }
```

### Примери

```javascript
// Сграфито
{
  type: 'decoration',
  date: '2026-04-02',
  data: {
    technique: 'sgraffito',
    materialIds: [],
    application: 'other',
    coverage: 'pattern',
    details: 'Спирали и точки около тялото'
  }
}

// Ангоба на leather-hard
{
  type: 'decoration',
  date: '2026-04-02',
  data: {
    technique: 'engobe',
    materialIds: ['m_engobe_white'],
    application: 'brush',
    coverage: 'partial',
    layers: 2,
    details: 'На горната половина'
  }
}

// Окис меден претрит
{
  type: 'decoration',
  date: '2026-04-09',
  data: {
    technique: 'oxide-wash',
    materialIds: ['m_copper_oxide'],
    application: 'rub',
    coverage: 'full',
    details: 'Меден окис, претрит върху сграфитото, отпечатъци остават във вдлъбнатините'
  }
}

// Подглазурни бои + прозрачна глазура (две decoration events)
// Event 1:
{
  type: 'decoration',
  date: '2026-04-10',
  data: {
    technique: 'underglaze',
    materialIds: ['m_underglaze_blue', 'm_underglaze_green'],
    application: 'brush',
    coverage: 'pattern',
    details: 'Рисунка на птица'
  }
}
// Event 2 (следващия ден):
{
  type: 'decoration',
  date: '2026-04-11',
  data: {
    technique: 'glaze',
    materialIds: ['m_clear_glaze'],
    application: 'dip',
    layers: 1,
    coverage: 'full'
  }
}

// Печат с растение върху сурова глина
{
  type: 'decoration',
  date: '2026-04-01',
  data: {
    technique: 'stamp',
    materialIds: [],
    application: 'imprint',
    coverage: 'partial',
    details: 'Листо от папрат, отпечатано на едната страна'
  }
}
```

---

## Cross-references и derived data

След като event-ите станат master (v1.4.3), няколко неща ще се извличат **derivedly** от тях:

### Текущ stage на piece

Computed: най-новият `stage` event по дата дава текущия stage. Ако няма stage events, fallback към `wet`.

### Cover photo

Computed: последната снимка от последен event с photos. Ако events нямат снимки, fallback към `piece.photos[0]` (legacy).

### Свързани материали

Computed: всички material IDs от `decoration.data.materialIds` и `firing.data.profileId` events.

Material detail вече показва „Използвана в изделия" — във v1.4.3+ ще се разшири, за да включва и decoration events.

---

## Workflow примери

### Пример 1: Прост use case — въвеждам готова окарина

Потребителят прави окарина за 3 дни, не въвежда нищо в app-а, и накрая иска да я регистрира.

```javascript
piece = {
  id, name: 'Окарина', clay: 'PRNF Black', stage: 'finished',
  events: [
    // Може просто да остане празно — finished stage е достатъчно
  ]
}
```

### Пример 2: Детайлна документация на сложен workflow

Окарина с тера сигилата + сграфито + меден окис + еднопек:

```javascript
piece = {
  id, name: 'Окарина Spirale', clay: 'PRNF Black',
  events: [
    { type: 'stage', date: '2026-04-01', data: { stageValue: 'wet' },
      note: 'Pinch pot, после смесих с шамота за устата' },

    { type: 'decoration', date: '2026-04-02',
      data: { technique: 'burnishing', application: 'rub',
              coverage: 'full', details: 'С лъжица' } },

    { type: 'decoration', date: '2026-04-02',
      data: { technique: 'sgraffito', application: 'other',
              coverage: 'pattern', details: 'Спирали' } },

    { type: 'stage', date: '2026-04-04', data: { stageValue: 'leather-hard' } },

    { type: 'decoration', date: '2026-04-05',
      data: { technique: 'terra-sigillata', materialIds: ['m_ts_red'],
              application: 'brush', layers: 3, coverage: 'full' } },

    { type: 'stage', date: '2026-04-07', data: { stageValue: 'bone-dry' } },

    { type: 'decoration', date: '2026-04-08',
      data: { technique: 'oxide-wash', materialIds: ['m_copper_oxide'],
              application: 'rub', coverage: 'partial',
              details: 'Претрит, остава във вдлъбнатините' } },

    { type: 'firing', date: '2026-04-10',
      data: { method: 'electric', atmosphere: 'oxidation',
              firingPurpose: 'bisque', temp: 1000, profileId: 'fp1' } },

    { type: 'stage', date: '2026-04-10', data: { stageValue: 'bisque' } },

    { type: 'stage', date: '2026-04-15', data: { stageValue: 'finished' },
      note: 'Реших, че е достатъчно — без глазурно изпичане' }
  ]
}
```

### Пример 3: Раку workflow

```javascript
piece = {
  id, name: 'Раку купа', clay: 'PRGF Golden Brown',
  events: [
    { type: 'stage', date: '2026-05-01', data: { stageValue: 'wet' } },
    { type: 'stage', date: '2026-05-05', data: { stageValue: 'bone-dry' } },

    { type: 'firing', date: '2026-05-08',
      data: { method: 'electric', atmosphere: 'oxidation',
              firingPurpose: 'bisque', temp: 1000 } },

    { type: 'stage', date: '2026-05-08', data: { stageValue: 'bisque' } },

    { type: 'decoration', date: '2026-05-15',
      data: { technique: 'glaze', materialIds: ['g_raku_copper'],
              application: 'dip', layers: 1, coverage: 'full' } },

    { type: 'stage', date: '2026-05-15', data: { stageValue: 'glazed' } },

    { type: 'firing', date: '2026-05-15',
      data: { method: 'raku', atmosphere: 'reduction',
              firingPurpose: 'alternative', temp: 950, duration: 1,
              details: 'Post-firing reduction в стърготини 10 мин',
              result: 'Медни искри, малко крекелюри' } },

    { type: 'stage', date: '2026-05-15', data: { stageValue: 'finished' } }
  ]
}
```

---

## Implementation бележки

### За v1.4.1 (read-only timeline)

- Reverse chronological sort (най-нов отгоре)
- Events с празна `date` отиват в края или маркирани като „без дата"
- Display показва: иконка по type, дата, кратка summary, бележка
- За legacy pieces без events — синтезира един „legacy" event от flat fields само за preview

### За v1.4.2 (add/edit events)

- Type switcher: stage / progress / firing / decoration
- За firing: dropdown за method, atmosphere, purpose; conditional показване на profileId за electric
- За decoration: dropdown за technique; conditional показване на layers за glaze/underglaze/engobe
- Multi-select за materialIds в decoration events

### За v1.4.3 (events стават master)

- Flat fields stage, bisqueTemp, glazeTemp стават derived
- Save logic пише в events array
- Финална миграция: за всеки piece с flat fields, генерирай съответните events

### За v1.4.4 (опционално polish)

- Material detail: „Използвана в декорации" нова секция
- Filter в Изделия по firing method
- Search в timeline по technique

---

## Open questions (за бъдещо обсъждане)

- Auto-generation на stage events от firing events. Например `firing` с `purpose: 'bisque'` автоматично добавя ли stage event `bisque`? Или потребителят винаги ги добавя ръчно? **Препоръчвам:** не автоматично, защото firing може да fail-не и да не promote piece-а.
- Default дата за нов event. Препоръчвам днешна дата като default.
- Брой decoration events на едно изделие. Тестово ограничение или unlimited? Препоръчвам unlimited.

---

*Документът е жив — обновява се при всяко съществено решение за event model.*
