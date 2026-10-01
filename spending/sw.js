// Pocket Ledger offline support. Bump VERSION whenever any file below changes.
const VERSION = 'ledger-2026-10-02b';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'vendor/xlsx.full.min.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Online: always fetch the latest copy (bypassing the browser's own cache) and keep it.
// Offline or very slow: fall back to the saved copy so the app still opens.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const saved = cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(url.href, { cache: 'no-cache' }).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    });
    const timeout = new Promise(r => setTimeout(r, 4000));
    try {
      const res = await Promise.race([fresh, timeout.then(() => saved)]);
      if (res) return res;
      return await fresh;
    } catch (err) {
      return (await saved) || Response.error();
    }
  })());
});
