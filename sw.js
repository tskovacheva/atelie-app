// sw.js — offline shell.
//
// With ES modules the worker caches a LIST, not a single file. Every release
// must keep this list correct; a file missing here is a file that silently
// stops updating. Bump CACHE on every deploy (§14.3).

const CACHE = 'bagra-v1.0.0-rc144';   // keep in step with version.js

const FILES = [
  './',
  './index.html',
  './app.js',
  './db.js',
  './guard.js',
  './autoarchive.js',
  './recipe-lines.js',
  './refs.js',
  './units.js',
  './migrate-photos.js',
  './migrations.js',
  './ecoprint-bundle.js',
  './i18n.js',
  './vocab.js',
  './ui.js',
  './backnav.js',
  './backup.js',
  './licence.js',
  './photo.js',
  './seed.js',
  './seed-ui.js',
  './stock-logic.js',
  './fabric-logic.js',
  './studio.js',
  './studio-ui.js',
  './label-sheet.js',
  './date-order.js',
  './migrate-actions.js',
  './dirty.js',
  './manifest.json',
  './version.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/favicon-64.png',
  // Typefaces, local so the app reads the same offline (design package 1).
  // Geist and Source Serif 4, OFL-1.1; latin, latin-ext, cyrillic, cyrillic-ext.
  './fonts/geist-cyrillic-ext-wght-normal.woff2',
  './fonts/geist-cyrillic-wght-normal.woff2',
  './fonts/geist-latin-ext-wght-normal.woff2',
  './fonts/geist-latin-wght-normal.woff2',
  './fonts/source-serif-4-cyrillic-ext-wght-italic.woff2',
  './fonts/source-serif-4-cyrillic-ext-wght-normal.woff2',
  './fonts/source-serif-4-cyrillic-wght-italic.woff2',
  './fonts/source-serif-4-cyrillic-wght-normal.woff2',
  './fonts/source-serif-4-latin-ext-wght-italic.woff2',
  './fonts/source-serif-4-latin-ext-wght-normal.woff2',
  './fonts/source-serif-4-latin-wght-italic.woff2',
  './fonts/source-serif-4-latin-wght-normal.woff2',
  './modules/dashboard.js',
  './modules/reference.js',
  './modules/plants.js',
  './modules/season.js',
  './modules/fabrics.js',
  './modules/materials.js',
  './modules/substances.js',
  './modules/recipes.js',
  './modules/chains.js',
  './modules/techniques.js',
  './modules/trials.js',
  './modules/tools.js',
  './calc/basic.js',
  './calc/scale.js',
  './calc/colour.js',
  './seed/substances.json',
  './seed/plants.json',
  './seed/manifest.json',
  './seed/plant-photos.json',
  './seed/techniques.json',
  './seed/combinations.json',
  './seed/chains.json',
  './seed/sources.json',
  './seed/glossary.json',
  './seed/recipes.json',
  './calc/alum-acetate.js',
  './modules/packs.js',
  './modules/library.js',
  './modules/about.js',
  './modules/licence.js',
  './modules/pigments.js',
  './modules/plans.js',
  './modules/batch.js',

  // The shipped plant photographs (§13cr). They left the plant record in rc28
  // and are static files now, so the worker has to carry them or an
  // offline library shows 57 broken pictures.
  './seed/images/plants/achillea_millefolium.jpg',
  './seed/images/plants/alkanna_tinctoria.jpg',
  './seed/images/plants/allium_cepa.jpg',
  './seed/images/plants/alnus_glutinosa.jpg',
  './seed/images/plants/anthemis_tinctoria.jpg',
  './seed/images/plants/betula_pendula.jpg',
  './seed/images/plants/calendula_officinalis.jpg',
  './seed/images/plants/carthamus_tinctorius.jpg',
  './seed/images/plants/castanea_sativa.jpg',
  './seed/images/plants/coreopsis_tinctoria.jpg',
  './seed/images/plants/cornus_mas.jpg',
  './seed/images/plants/cornus_sanguinea.jpg',
  './seed/images/plants/corylus_avellana.jpg',
  './seed/images/plants/cosmos_sulphureus.jpg',
  './seed/images/plants/cotinus_coggygria.jpg',
  './seed/images/plants/crataegus_monogyna.jpg',
  './seed/images/plants/dahlia_pinnata.jpg',
  './seed/images/plants/eucalyptus_spp.jpg',
  './seed/images/plants/frangula_alnus.jpg',
  './seed/images/plants/fraxinus_excelsior.jpg',
  './seed/images/plants/genista_tinctoria.jpg',
  './seed/images/plants/geranium_macrorrhizum.jpg',
  './seed/images/plants/hypericum_perforatum.jpg',
  './seed/images/plants/isatis_tinctoria.jpg',
  './seed/images/plants/juglans_regia.jpg',
  './seed/images/plants/lavandula_angustifolia.jpg',
  './seed/images/plants/lawsonia_inermis.jpg',
  './seed/images/plants/malus_domestica.jpg',
  './seed/images/plants/melissa_officinalis.jpg',
  './seed/images/plants/mentha_spp.jpg',
  './seed/images/plants/mespilus_germanica.jpg',
  './seed/images/plants/origanum_vulgare.jpg',
  './seed/images/plants/biancaea_sappan.jpg',
  // Kept: an installed copy may keep the old sappanwood record (§13es), and its
  // photoSrc names this file.
  './seed/images/plants/pelargonium_zonale.jpg',
  './seed/images/plants/persea_americana.jpg',
  './seed/images/plants/persicaria_tinctoria.jpg',
  './seed/images/plants/prunus_domestica.jpg',
  './seed/images/plants/punica_granatum.jpg',
  './seed/images/plants/quercus_robur.jpg',
  './seed/images/plants/reseda_luteola.jpg',
  './seed/images/plants/rhamnus_cathartica.jpg',
  './seed/images/plants/rhamnus_tinctoria.jpg',
  './seed/images/plants/rheum_rhabarbarum.jpg',
  './seed/images/plants/rhus_coriaria.jpg',
  './seed/images/plants/rosa_spp.jpg',
  './seed/images/plants/rosmarinus_officinalis.jpg',
  './seed/images/plants/rubia_tinctorum.jpg',
  './seed/images/plants/rubus_fruticosus.jpg',
  './seed/images/plants/salix_alba.jpg',
  './seed/images/plants/salvia_officinalis.jpg',
  './seed/images/plants/sambucus_nigra.jpg',
  './seed/images/plants/senegalia_catechu.jpg',
  './seed/images/plants/tagetes_erecta.jpg',
  './seed/images/plants/tanacetum_vulgare.jpg',
  './seed/images/plants/thymus_vulgaris.jpg',
  './seed/images/plants/tilia_cordata.jpg',
  './seed/images/plants/urtica_dioica.jpg',
];

// The new worker deliberately does NOT take over by itself. It waits until the
// page says so, which lets the app offer a visible "new version — reload"
// rather than swapping code under someone mid-form.
//
// `cache: 'reload'` (rc98): straight from the server. `addAll` went through the
// browser's HTTP cache, so a worker installing a new version stored whatever
// that cache still held — in the audit, rc96's version.js and batch.js under
// the name rc97. The fix never arrived, and offline the old code stayed.
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))));
});

// „Обнови" is a REQUEST, not an order (§13fv).
//
// rc120 activated on the word of the window that asked. Another window with
// unsaved work was then told rather than reloaded — but by that moment this
// worker was already active, the old release's cache was gone, and that window
// went on running the old code against the new release while a clean window
// could start the new release's migrations. One client on the old version after
// the new one is active is exactly what the release-is-the-cache rule forbids.
//
// So this worker, while still WAITING, asks every open Багра window whether it
// holds unsaved work, and activates only if every one of them answers „no".
// The list comes from the browser (`clients.matchAll`, uncontrolled windows
// included), not from whoever happens to reply — which is why this is not a
// BroadcastChannel: a broadcast cannot tell silence from absence. A window that
// does not answer within the wait (frozen in the background, or running a
// release too old to know the question) counts as NOT clean. Silence is never
// read as consent; the person is told to save or close the other window.
//
// The window that asked has already settled its own unsaved work (app.js) and
// is not asked again.
const ASK_MS = 4000;

function ask(client) {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    const timer = setTimeout(() => resolve('silent'), ASK_MS);
    ch.port1.onmessage = (m) => { clearTimeout(timer); resolve(m.data && m.data.dirty ? 'dirty' : 'clean'); };
    try { client.postMessage({ type: 'bagra-dirty?' }, [ch.port2]); }
    catch { clearTimeout(timer); resolve('silent'); }
  });
}

async function activateIfSafe(requester) {
  const others = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .filter(c => !requester || c.id !== requester.id);
  const answers = await Promise.all(others.map(ask));
  const dirty = answers.filter(a => a === 'dirty').length;
  const silent = answers.filter(a => a === 'silent').length;
  if (!dirty && !silent) { await self.skipWaiting(); return; }
  if (requester) requester.postMessage({ type: 'bagra-update-blocked', dirty, silent });
}

self.addEventListener('message', (e) => {
  // The plain string is what rc120's page sends; it is held to the same rule.
  if (e.data === 'skip-waiting' || (e.data && e.data.type === 'bagra-update')) {
    e.waitUntil(activateIfSafe(e.source));
  }
});

// Only THIS application's old caches go (§13fu). Cache Storage belongs to the
// ORIGIN, not to the worker's scope, and Багра has been served from an origin it
// shares with Глина (`tskovacheva.github.io`): deleting every name but our own
// deleted the other application's offline copy at each of our updates.
//
// Deleted at activation and not before. Activation happens only when no page is
// open (the browser's own rule), or when „Обнови" was pressed and EVERY other
// open window answered that it holds no unsaved work (§13fv). Those windows
// reload on `controllerchange` (app.js); none of them has anything to keep, so
// none needs the old release once this worker is active.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k.startsWith('bagra-') && k !== CACHE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// THE RELEASE IS THE CACHE (§13fu).
//
// Until rc120 every request went to the network first, file by file, and the
// answer was copied into the running version's cache. Each file was therefore
// whatever the server held at the moment it was asked for — so a page could
// boot with `app.js` from the new release and `ui.js` from the old one, and did
// whenever one request of fifty failed on a phone in the studio: the failed one
// came from the cache, the rest from the server. A missing export between two
// such files is a blank screen; a matching one is two releases writing to one
// database. And the copies polluted the old cache, so an update that never
// completed left an offline copy that was half of each.
//
// Now a release is one unit. `install` fills a cache named for the version with
// every file in FILES, all or nothing (`addAll` rejects the whole install if
// one file fails, and the old worker simply carries on). The running worker
// answers every file of the release from ITS OWN cache — never `caches.match`
// across all of them, which during an install would find the next version's
// half-filled one. A new version reaches a page only by a new worker being
// activated, which happens when the person presses „Обнови" or when no page of
// the old version is open.
//
// A file of the release missing from the cache (evicted, or a cache damaged by
// hand) is fetched from the network and NOT stored: storing it would put
// whatever the server holds today into yesterday's release. Anything outside
// the release is left to the network, with the cache as a fallback, and is
// never written either. Other origins are not touched.
const SCOPE = new URL('./', self.location).href;
const RELEASE = new Set(FILES.map(f => new URL(f, self.location).href));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // A navigation inside the scope is the application shell, whatever its query.
  //
  // The shell is the SCOPE ('./'), not './index.html' (§13gi). A host may answer
  // /index.html with a redirect to / — Cloudflare's static assets do by default
  // (307) — and `addAll` follows it and stores the redirected response under
  // index.html. A navigation is a request whose redirect mode is not 'follow',
  // and the browser refuses a redirected response for it: ERR_FAILED on every
  // start after the first, on staging, 13 October 2026. './' is answered 200 by
  // every host Bagra has run on.
  const isShell = req.mode === 'navigate' && req.url.startsWith(SCOPE);
  const key = isShell ? SCOPE : url.origin + url.pathname;

  e.respondWith(caches.open(CACHE).then(async (cache) => {
    if (isShell || RELEASE.has(key)) {
      const hit = await cache.match(key);
      // Second line: never hand a navigation a response marked redirected,
      // whichever host and whichever entry it came from. Rebuilt, it is the
      // same bytes without the flag the browser refuses.
      if (hit) return hit.redirected
        ? new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers: hit.headers })
        : hit;
      return fetch(req);
    }
    try { return await fetch(req); }
    catch (err) {
      const hit = await cache.match(req);
      if (hit) return hit;
      throw err;
    }
  }));
});
