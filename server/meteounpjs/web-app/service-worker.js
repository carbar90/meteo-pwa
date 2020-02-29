'use strict';

const CACHE_NAME = 'static-cache-v1';

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            cache.addAll(['/', '/index.html', '/app.js', '/manifest.json', 'admin.html']);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate...', event);
    // CODELAB: Remove previous cached data from disk.
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            } else {
                return fetch(event.request).then(function (res) {
                    return caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request.url, res.clone());
                        return res;
                    });
                });
            }
        })
    );
});
