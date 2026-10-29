// ── Ателие Service Worker ────────────────────────────────────
// Cache strategy:
//   Navigation (HTML): network-first → cache fallback
//   .js / .json / .webmanifest: network-first → cache fallback (v1.32.1)
//   Both ask the server every time (cache: 'no-cache', v1.33.1): GitHub Pages lets
//   the browser keep files for 10 minutes, and a new index.html with a kept
//   app.js is the half-loaded update. The server answers 304 when nothing changed.
//   Everything else:   cache-first  → network fallback
// Bump CACHE_NAME on every deploy to trigger cache refresh.
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'atelie-v92';

const PRECACHE_URLS = [
  './',
  './index.html',
  // v1.29.0: вградените наръчници — извън index.html, но част от офлайн пакета.
  './seed/guides.json',
  // v1.29.0: ES модулите. Всеки .js тук — иначе спира да се обновява офлайн
  // (проверява се от tests/validate.js).
  './app.js',
  './core/merge.js',
  './calc/shrink.js',
  './domain/profile.js',
  './domain/units.js',
  './domain/traits.js',
  './domain/kilnplan.js',
  './domain/kiln.js',
  './app.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // Cache what we can; ignore failures for optional assets
      return Promise.allSettled(
        PRECACHE_URLS.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.warn('[SW] Could not precache:', url, err.message);
          });
        })
      );
    }).then(function () {
      // Activate immediately — don't wait for old tabs to close
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(function () {
      // Take control of all open clients immediately
      return self.clients.claim();
    }).then(function () {
      // v1.4.4: Notify all clients that a new SW has activated
      return self.clients.matchAll({ type: 'window' }).then(function (clients) {
        clients.forEach(function (client) {
          client.postMessage({ type: 'SW_UPDATED', cacheName: CACHE_NAME });
        });
      });
    })
  );
});

// v1.4.4: Listen for skipWaiting requests from clients
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Skip non-GET and non-http(s) requests (e.g. chrome-extension)
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // v1.18.2: Google Fonts are cross-origin but we want them offline (Cormorant
  // titles). Cache-first for the font CSS and font files specifically; everything
  // else cross-origin is still skipped.
  var isFonts = req.url.indexOf('fonts.googleapis.com')>-1 || req.url.indexOf('fonts.gstatic.com')>-1;
  if (isFonts) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (netRes) {
          var clone = netRes.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, clone); });
          return netRes;
        }).catch(function(){ return cached; });
      })
    );
    return;
  }

  // Skip other cross-origin requests
  var isSameOrigin = req.url.startsWith(self.location.origin);
  if (!isSameOrigin) return;

  if (req.mode === 'navigate') {
    // Navigation → network-first, cache fallback
    event.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then(function (networkRes) {
          // Update cache with fresh response
          var clone = networkRes.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, clone);
          });
          return networkRes;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match('./index.html');
          });
        })
    );
  } else if (/\.(js|json|webmanifest)(\?|$)/.test(new URL(req.url).pathname)) {
    // v1.32.1: кодът и данните (app.js, модулите, наръчниците) — network-first,
    // както index.html. Иначе при обновяване нов index.html тръгва със стар
    // модул от кеша. Без връзка — от кеша.
    event.respondWith(
      fetch(req, { cache: req.cache === 'reload' ? 'reload' : 'no-cache' })
        .then(function (networkRes) {
          if (networkRes && networkRes.ok) {
            var clone = networkRes.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(req, clone); });
          }
          return networkRes;
        })
        .catch(function () { return caches.match(req); })
    );
  } else {
    // Assets → cache-first, network fallback
    event.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (networkRes) {
          var clone = networkRes.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, clone);
          });
          return networkRes;
        });
      })
    );
  }
});
