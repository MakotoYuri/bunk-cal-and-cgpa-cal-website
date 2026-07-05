const CACHE_NAME = 'toolkit-v3';
const ASSETS = [
  '/', '/index.html', '/manifest.json', '/favicon.ico',
  '/robots.txt',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache ad requests
  if (e.request.url.includes('googlesyndication') ||
      e.request.url.includes('googleads') ||
      e.request.url.includes('doubleclick')) {
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});