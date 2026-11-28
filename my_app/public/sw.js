// Arbo Service Worker
// - アプリ本体（HTML・manifest・アイコン）: ネット優先。つながらないときは保存済みのものを使う
//   → push した更新はオンラインなら次回起動時にすぐ反映される
// - Google Fonts・Firebase SDK: 保存済みを優先して返し、裏で最新に更新する
const VERSION = 'v2';
const APP_CACHE = `app-${VERSION}`;
const FONT_CACHE = `fonts-${VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './firebase-config.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== APP_CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    if (request.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      if (shell) return shell;
    }
    throw e;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(request);
  const update = fetch(request)
    .then((res) => { if (res.ok || res.type === 'opaque') cache.put(request, res.clone()); return res; })
    .catch(() => hit);
  return hit || update;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' ||
      (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});
