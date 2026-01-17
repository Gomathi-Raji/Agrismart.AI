// Service Worker for better caching, offline support, and push notifications
const CACHE_NAME = 'agrismart-v3';
const urlsToCache = [
  '/',
  '/static/css/',
  '/static/js/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Completely block and silence Mapbox telemetry calls
  if (event.request.url.includes('events.mapbox.com')) {
    console.log('🔒 Service Worker blocked Mapbox telemetry:', event.request.url);
    event.respondWith(new Response(null, { 
      status: 204, 
      statusText: 'No Content - Blocked by Service Worker'
    }));
    return;
  }

  // Only handle requests for our own domain
  const url = new URL(event.request.url);

  // Skip all external requests (let them pass through naturally)
  if (url.origin !== self.location.origin) {
    return; // Don't intercept external requests
  }

  // Handle navigation requests (SPA routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  // Default notification options
  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    dir: 'ltr',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  let notificationData = {};
  let options = { ...defaultOptions };

  // Parse push data if available
  if (event.data) {
    try {
      notificationData = event.data.json();
      options = { ...defaultOptions, ...notificationData.options };
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData = {
        title: 'AgriSmart Notification',
        body: event.data.text() || 'You have a new notification'
      };
    }
  } else {
    notificationData = {
      title: 'AgriSmart Notification',
      body: 'You have a new notification'
    };
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      ...options
    })
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Open/focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no existing window found
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || self.location.origin;
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      console.log('Background sync triggered')
    );
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  // Handle subscription change - re-subscribe if needed
});