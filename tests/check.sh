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
echo "== 4. golden — еталонни архиви, повторно отваряне, архив, липсващи файлове"; node tests/golden.test.js
echo "== 4б. identity — кодове, бройки, серии, архив (v1.31.0)"; node tests/identity.test.js
echo "== 4в. traits — основни характеристики (v1.31.1)"; node tests/traits.test.js
echo "== 5. edits — всяка редакция пази записа"; node tests/edits.test.js
echo "== 6. migrate — схема, миграции, връщане към предишната версия"; node tests/migrate.test.js
echo "== 6б. edits-real — празна редакция на всеки запис от частните архиви"; node tests/edits-real.test.js
echo "== 7. screens — същият текст на всеки екран като предишната версия"; node tests/screens.test.js
echo "== ВСИЧКО МИНА"
