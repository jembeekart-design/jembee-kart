// public/service-worker.js

const CACHE_NAME = "jembee-cache-v1";

// 🔥 Files to cache
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 📦 Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 🔄 Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🌐 Fetch (cache first)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 🔔 Future Push Notification (ready)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const title = data.title || "JembeeKart";
  const options = {
    body: data.body || "New update available",
    icon: "/icons/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 🔔 Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
