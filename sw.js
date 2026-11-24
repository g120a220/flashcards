// 離線快取：第一次打開時把頁面存起來，之後沒網路也能開。
// 改了 index.html 之後，把下面的版本號 +1，手機才會抓到新版。
const CACHE = 'flashbox-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './lib/jszip.min.js', './lib/sql-wasm.js', './lib/sql-wasm.wasm', './lib/fzstd.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
