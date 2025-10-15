const assets = [
  "/",
  "static/css/style.css",
  "static/js/app.js",
  "static/images/logo.avif",
  "static/images/favicon.avif",
  "static/icons/icon-128x128.avif",
  "static/icons/icon-192x192.avif",
  "static/icons/icon-384x384.avif",
  "static/icons/icon-512x512.avif",
  "static/icons/desktop_screenshot.avif",
  "static/icons/mobile_screenshot.avif",
];

const CACHE_NAME = "catalogue-assets-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});


