#!/bin/sh
# Глина — всички проверки преди пускане. Всеки слой съществува, защото нещо е
# минавало без него. Нужни: Node 20+, Playwright с Chromium:
#   npm install --no-save playwright && npx playwright install chromium
set -e
cd "$(dirname "$0")/.."
echo "== 1. validate.js — синтаксис, DOM, функции, модули и офлайн кеш"; node validate.js index.html
echo "== 2. версии — APP_VERSION и CACHE_NAME"; node tests/versions.test.js
echo "== 3. unit — чистите функции в модулите"; node tests/unit.test.js
echo "== 3б. kiln — геометрията на подреждането (прототип v0)"; node tests/kiln.test.js
echo "== 3в. kiln-ui — прототипът в браузър"; node tests/kiln-ui.test.js
echo "== 3г. kilnplan — геометрията в Глина (v1.33.0): тестовете на прототипа и своите"; KILN_GEO=module node tests/kiln.test.js && node tests/kilnplan.test.js
echo "== 4. golden — еталонни архиви, повторно отваряне, архив, липсващи файлове"; node tests/golden.test.js
echo "== 4б. identity — кодове, бройки, серии, архив (v1.31.0)"; node tests/identity.test.js
echo "== 4в. traits — основни характеристики (v1.31.1)"; node tests/traits.test.js
echo "== 4г. kilns — регистър на пещите (v1.32.0)"; node tests/kilns.test.js
echo "== 4д. update — обновяване с service worker; остарели модули (v1.32.1)"; node tests/update.test.js
echo "== 4д2. updbar — известието за нова версия: Обнови / По-късно (v1.35.2)"; node tests/updbar.test.js
echo "== 4е. plan — планът на пещта в изпичането (v1.33.0)"; node tests/plan.test.js
echo "== 4ж. scheme — Схема и Точно: изглед отгоре, докосване и влачене (v1.34.0)"; node tests/scheme.test.js
echo "== 4з. plan-fixes — размери от изделията, честно предложение, планирани в изпичането (v1.34.1)"; node tests/plan-fixes.test.js
echo "== 4и. after — Заредено, Приключено, резултати, дневник, повторение (v1.35.0)"; node tests/after.test.js
echo "== 4й. piece-ui — преглед и формуляр на изделие и серия (v1.35.1)"; node tests/piece-ui.test.js
echo "== 4к. catalog — каталог Изделия, снимка в детайла, Моето ателие (v1.36.0)"; node tests/catalog.test.js
echo "== 4л. firing — Изпичания: регистър, раздели, Какво остава, До пещта (v1.37.0)"; node tests/firing.test.js
echo "== 4м. recipes — Рецепти: каталог, състав и партида, Приготви, формуляр, версии (v1.38.0)"; node tests/recipes.test.js
echo "== 4н. materials — Материали: групи, изгледи, наличност, В рецепти, формуляр (v1.39.0)"; node tests/materials.test.js
echo "== 4о. tests — Тестове: галерия, филтри, детайл, Сравни, формуляр, реални архиви (v1.40.0)"; node tests/tests.test.js
echo "== 4п. nav — навигация: видим само горният детайл, „Назад“ стъпка по стъпка, защита, връзки (v1.40.1)"; node tests/nav.test.js
echo "== 4р. fixes — счупена бройка от серия, дата на изваждане, изтриване на материал (v1.40.2)"; node tests/fixes.test.js
echo "== 4с. alt — алтернативни изпичания: резултат по бройка, без план на пещта, полета по метод, история (v1.40.3)"; node tests/alt.test.js
echo "== 4т. audit2 — задна дата към изпичане; връзки, кодове, тест в изпичане, действия от детайла (v1.40.4)"; node tests/audit2.test.js
echo "== 4у. ux — Ателие и лента, филтри, снимки на тестове, раздели във формулярите, ширина на лаптоп (v1.41.0)"; node tests/ux.test.js
echo "== 4ф. arcdraft — архив, един избор на глина/маса, чернови (v1.42.0)"; node tests/arcdraft.test.js
echo "== 4х. units — бройки в серия: избор по номер, отделяне, етап, счупено, архив, добив (v1.43.0)"; node tests/units.test.js
echo "== 4ц. groups — разделяне на отделена група по номера: история, изпичания, резултати, архив, добив (v1.44.0)"; node tests/groups.test.js
echo "== 4ч. calc — количество глина и свиване: геометрия, диапазон, двете посоки, тест на маса, изделие и серия (v1.45.0)"; node tests/calc.test.js
echo "== 4ш. fire — Огнена скала, варовитост, наблюдения на теста, криви, съвместимост на зареждането (v1.46.0)"; node tests/fire.test.js
echo "== 4щ. runprog — „Програма и съвместимост“ над разделите на изпичането, стартирана програма (v1.46.2)"; node tests/runprog.test.js
echo "== 4ъ. quick — бързо въвеждане на изделия (v1.47.0)"; node tests/quick.test.js
echo "== 4ю. i18n — двуезичен интерфейс, етап 1 (v1.48.0)"; node tests/i18n.test.js
echo "== 4я. glazy — внос и износ на рецепти, добавки над основата, други имена на материал (v1.52.0)"; node tests/glazy.test.js
echo "== 4я2. stock — стига ли наличното за партидата, само проверка (v1.53.0)"; node tests/stock.test.js
echo "== 5. edits — всяка редакция пази записа"; node tests/edits.test.js
echo "== 6. migrate — схема, миграции, връщане към предишната версия"; node tests/migrate.test.js
echo "== 6б. edits-real — празна редакция на всеки запис от частните архиви"; node tests/edits-real.test.js
echo "== 7. screens — същият текст на всеки екран като предишната версия"; node tests/screens.test.js
echo "== ВСИЧКО МИНА"
