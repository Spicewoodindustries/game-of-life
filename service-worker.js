/* ===== Service Worker for LifeQuest PWA ===== */
const CACHE_VERSION = "life-cache-v3"; // bump this when you ship new updates
const PRECACHE = [
  "Game_of_Life_v3.5.html",
  "manifest.json",
  "assets/avatar_1.png",
  "assets/avatar_2.png"
];

// --- Install: pre-cache core assets ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting(); // activate new SW immediately
});

// --- Activate: remove old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_VERSION ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

// --- Fetch: serve from cache, update in background ---
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// --- Allow in-page script to trigger immediate activation ---
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    await self.skipWaiting();
  }
});
