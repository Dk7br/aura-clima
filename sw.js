/**
 * Service Worker para Aura Clima
 * Cache de arquivos estáticos e suporte a uso offline
 */

const CACHE_NAME = 'aura-clima-v4';
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
  // Para requisições da API de previsão, sempre tenta a rede primeiro
  if (event.request.url.includes('open-meteo.com') || event.request.url.includes('bigdatacloud.net') || event.request.url.includes('geojs.io')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Para arquivos locais (HTML, CSS, JS), busca em cache com fallback para rede
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
