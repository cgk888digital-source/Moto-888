const CACHE_NAME = 'bikevzla-v4'
const OFFLINE_URL = '/offline'

// Assets a cachear inmediatamente (cache-first)
const PRECACHE_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) return

  // API routes: network-first, sin fallback (no cachear datos dinámicos)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'Sin conexión' }), { headers: { 'Content-Type': 'application/json' } })))
    return
  }

  // Páginas de navegación: network-first con fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const resClone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, resClone))
          return res
        })
        .catch(() => caches.match(request).then(cached => cached ?? caches.match(OFFLINE_URL)))
    )
    return
  }

  // Assets estáticos (JS, CSS, fuentes, imágenes): cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok) {
          const resClone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, resClone))
        }
        return res
      })
    })
  )
})

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Bikevzla 888', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/')
  )
})
