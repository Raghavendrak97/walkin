/**
 * WALKIN Service Worker
 * Caches public static assets only. Strictly bypasses private files, resumes, and dynamic endpoints.
 */

const CACHE_NAME = 'walkin-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
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
  const url = new URL(event.request.url);

  // Exclude non-GET requests, private documents, API calls, and resume downloads
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/resumes/') ||
    url.pathname.includes('/private/') ||
    url.pathname.includes('/messages/')
  ) {
    return;
  }

  // Network-first strategy for pages, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid responses for static assets only
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2|woff)$/) || url.pathname === '/')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
