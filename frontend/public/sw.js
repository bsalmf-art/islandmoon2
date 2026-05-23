// Service worker لتطبيق "بخبراتنا نسمو" - v3
// Strategy: network-first for HTML/JS to always get fresh content; cache-first for static assets.
const CACHE_NAME = "namu56-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/school-logo.jpg",
  "/moe-logo.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  const isHTML = e.request.mode === "navigate" || (e.request.headers.get("accept") || "").includes("text/html");
  const isJS = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  // Network-first for HTML, JS, CSS so updates are always picked up
  if (isHTML || isJS) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Cache-first for images/static
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
