const CACHE_VERSION = "v2";
const APP_SHELL_CACHE = `promolocation-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `promolocation-runtime-${CACHE_VERSION}`;
const TILE_CACHE = `promolocation-tiles-${CACHE_VERSION}`;
const CACHEABLE_DESTINATIONS = new Set(["document", "font", "image", "script", "style", "worker"]);
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/favicon-32.png",
  "/pwa-icon-192.png",
  "/pwa-icon-512.png",
  "/pwa-icon-maskable-512.png",
];

function isCacheableResponse(response) {
  return response && (response.ok || response.type === "opaque");
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const networkResponsePromise = fetch(request)
    .then((response) => {
      if (isCacheableResponse(response)) {
        const responseClone = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseClone);
        });
      }

      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkResponsePromise;
}

async function navigationResponse(request) {
  try {
    const networkResponse = await fetch(request);

    if (isCacheableResponse(networkResponse)) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/")) ||
      (await caches.match("/offline.html"))
    );
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) =>
            ![APP_SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE].includes(key),
          )
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }

  if (requestUrl.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(staleWhileRevalidate(event.request, TILE_CACHE));
    return;
  }

  if (
    requestUrl.origin !== self.location.origin ||
    !CACHEABLE_DESTINATIONS.has(event.request.destination)
  ) {
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
});
