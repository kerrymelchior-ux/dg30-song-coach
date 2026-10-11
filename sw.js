// DG30 Song Coach: keeps your song data (dg30-songdata) untouched, works offline after the first visit, and always picks up a new version as soon as it's on GitHub.
const CACHE = "dg30-song-coach-v3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache:"reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("dg30-song-coach-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;   // never touch Anthropic or CDN requests
  // always ask GitHub for the newest copy (skipping the browser's 10-minute cache); fall back to the saved copy offline
  e.respondWith(fetch(e.request, {cache:"no-cache"}).then(r => { if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html"))));
});
