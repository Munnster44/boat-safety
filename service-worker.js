/* Boat Safety (v1) - simple offline cache */
const CACHE = "boat-safety-v1-cache-1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k === CACHE) ? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // Cache same-origin GET responses
      try {
        const url = new URL(req.url);
        if (req.method === "GET" && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
      } catch(_) {}
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});