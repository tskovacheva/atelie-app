// ── Ателие Service Worker ────────────────────────────────────
// Cache strategy:
//   Navigation (HTML): network-first → cache fallback
//   Everything else:   cache-first  → network fallback
// Bump CACHE_NAME on every deploy to trigger cache refresh.
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'atelie-v14';

const PRECACHE_URLS = [
  './',
  './index.html',
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
    })
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Skip non-GET and non-http(s) requests (e.g. chrome-extension)
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // Skip cross-origin requests (e.g. Google Fonts)
  var isSameOrigin = req.url.startsWith(self.location.origin);
  if (!isSameOrigin) return;

  if (req.mode === 'navigate') {
    // Navigation → network-first, cache fallback
    event.respondWith(
      fetch(req)
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
