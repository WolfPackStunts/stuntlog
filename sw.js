// StuntLog Service Worker — auto-updates silently
const CACHE = 'stuntlog-v4';
const FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  // Take over immediately — don't wait for old version to close
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE) return caches.delete(key);
      }));
    })
  );
  // Control all open tabs immediately
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    // Network first — always try to get fresh version
    fetch(e.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // Offline fallback to cache
      return caches.match(e.request);
    })
  );
});
