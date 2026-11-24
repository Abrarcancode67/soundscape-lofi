// SoundScape Lo-Fi Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // If deployed in a preview / dev domain, unregister immediately
      if (self.registration.scope.includes('.run.app') || self.registration.scope.includes('localhost')) {
        return self.registration.unregister();
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Pass through all requests in dev/preview environments or Vite internals
  if (url.hostname.includes('.run.app') || url.hostname === 'localhost' || url.port || url.pathname.startsWith('/@')) {
    return;
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
