/* Arya PWA service worker.
 *
 * Privacy rule: only immutable app assets and the static offline page are
 * cached. Supabase, API, RSC, HTML pages and anything else are never cached.
 */

const CACHE_PREFIX = "arya-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const OFFLINE_FALLBACK = `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>آفلاین | آریا</title>
    <style>
      body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #08080a; color: #f5f5f6; font-family: system-ui, sans-serif; }
      main { max-width: 28rem; padding: 2rem; text-align: center; }
      h1 { margin: 0; color: #fb7185; font-size: 1.5rem; }
      p { margin: 0.75rem 0 0; color: #9a9aa5; line-height: 1.8; }
    </style>
  </head>
  <body>
    <main>
      <h1>آفلاین هستید</h1>
      <p>اتصال اینترنت برقرار نیست. وقتی دوباره آنلاین شدید، صفحه را باز کنید.</p>
      <p>You're offline. Open the page again when you're back online.</p>
    </main>
  </body>
</html>`;

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) {
    return false;
  }

  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    url.pathname.startsWith("/icons/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never intercept Supabase, other origins, APIs or RSC requests.
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Pages can contain private financial data. Always use the network and
  // never put navigation responses into Cache Storage.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const offline = await cache.match(OFFLINE_URL, { ignoreVary: true });

        return (
          offline ||
          new Response(OFFLINE_FALLBACK, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        );
      }),
    );
    return;
  }

  // Only immutable Next.js build assets and local icons are cached.
  if (!isStaticAsset(url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request, { ignoreVary: true });

      if (cached) {
        return cached;
      }

      const response = await fetch(request);

      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    }),
  );
});
