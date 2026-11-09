/*
 * JEMBEE PLAY does not use a service worker for ad injection or offline video.
 * This intentionally replaces the legacy third-party Monetag worker at /sw.js.
 * Do not load remote worker scripts or cache video files here.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
