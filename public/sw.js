const CACHE_NAME = 'alertia-pwa-v1'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      )
    }),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Only cache same-origin requests
  if (url.origin !== self.location.origin) return

  // Ignore development assets and supabase backend calls
  if (
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('node_modules')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Stale-While-Revalidate strategy
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Fallback to index.html for SPA routing on offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })

      return cachedResponse || fetchPromise
    }),
  )
})
