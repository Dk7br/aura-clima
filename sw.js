/**
 * Service Worker para Aura Clima
 * Cache de arquivos estáticos e suporte a uso offline
 */

const CACHE_NAME = 'aura-clima-v6';
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
  // Para requisições de mapas, rotas (OSRM) e APIs meteorológicas, sempre busca na rede
  if (
    event.request.url.includes('open-meteo.com') ||
    event.request.url.includes('bigdatacloud.net') ||
    event.request.url.includes('geojs.io') ||
    event.request.url.includes('openstreetmap.org') ||
    event.request.url.includes('arcgisonline.com') ||
    event.request.url.includes('project-osrm.org') ||
    event.request.url.includes('unpkg.com')
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
