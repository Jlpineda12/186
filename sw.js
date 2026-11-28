/**
 * Caché de 186.
 * - Archivos con huella (código, CSS, tipografías), modelo 3D, laboratorio AR y librerías
 *   de jsDelivr: primero caché (repetir visita es casi instantáneo).
 * - Páginas: primero red (nunca se ve una versión vieja) y caché solo si no hay conexión.
 * - Videos: los maneja el navegador (piden rangos).
 * Cada publicación cambia VERSION y borra la caché anterior al activarse.
 */
const VERSION = 'mwznd5te';
const CACHE = `186-${VERSION}`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('186-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const isAsset = (url) =>
  (url.origin === self.location.origin && /\/(_astro|models|lab)\//.test(url.pathname)) ||
  /^https:\/\/cdn\.jsdelivr\.net\/npm\/(three|mind-ar)@/.test(url.href);

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.status === 200) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.status === 200) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || Response.error();
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' && url.origin === self.location.origin) return e.respondWith(networkFirst(req));
  if (isAsset(url)) e.respondWith(cacheFirst(req));
});
