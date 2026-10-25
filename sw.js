/**
 * Monetag Web Push & Impression Service Worker (Zone: 12117252)
 */
self.options = {
    "domain": "5gvci.com",
    "zoneId": 12117252
};
self.lary = "";
try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  console.warn('Monetag service worker load error:', e);
}

/**
 * Service Worker para Aura Clima
 * Cache de arquivos estáticos e suporte a uso offline (PWA)
 */
const CACHE_NAME = 'aura-clima-v11';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/weather-codes.js',
  './js/api.js',
  './js/app.js',
  './js/route-planner.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Para requisições de mapas, rotas (OSRM), redes de anúncios CPM (Monetag / 5gvci) e APIs meteorológicas, sempre busca na rede
  if (
    event.request.url.includes('open-meteo.com') ||
    event.request.url.includes('bigdatacloud.net') ||
    event.request.url.includes('geojs.io') ||
    event.request.url.includes('openstreetmap.org') ||
    event.request.url.includes('arcgisonline.com') ||
    event.request.url.includes('project-osrm.org') ||
    event.request.url.includes('unpkg.com') ||
    event.request.url.includes('5gvci.com') ||
    event.request.url.includes('monetag.com') ||
    event.request.url.includes('alwingulla.com') ||
    event.request.url.includes('adsterra.com') ||
    event.request.url.includes('topcreativeformat.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Para arquivos locais (HTML, CSS, JS), busca na rede primeiro para sempre ter a versão mais recente
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
