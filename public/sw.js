/* =========================================================
   TopStyle App — Service Worker (Paso 12, PWA)
   Cachea el "app shell" para que la app abra sin internet (con la última
   versión visitada). Estrategia: cache-first con fallback a la red.

   IMPORTANTE: subí el número de versión de CACHE en cada deploy que cambie
   archivos cacheados, así el navegador descarta el caché viejo.
   ========================================================= */

const CACHE = 'topstyle-v16';

// Archivos del mismo origen que SÍ o SÍ deben quedar cacheados.
const CORE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/app.js',
  './js/color-modal.js',
  './data/catalogo.json',
  './data/paletas.json',
  './data/promos.json',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
];

// Alpine viene de un CDN externo: lo cacheamos aparte y sin que rompa la
// instalación si falla (CORS, red, etc.).
const ALPINE = 'https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    try { await cache.add(ALPINE); } catch (e) { /* sin Alpine cacheado, no es fatal */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Borro cachés de versiones anteriores.
    const claves = await caches.keys();
    await Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cacheado = await caches.match(req);
    if (cacheado) return cacheado;
    try {
      return await fetch(req);
    } catch (e) {
      // Sin red: si es una navegación, devuelvo el index cacheado.
      if (req.mode === 'navigate') {
        return (await caches.match('./index.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
