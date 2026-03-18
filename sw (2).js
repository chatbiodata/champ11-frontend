// public/sw.js — Champ11 Service Worker
// Handles background push notifications for Playing XI alerts

self.addEventListener('install',  e => self.skipWaiting());
self.addEventListener('activate', e => clients.claim());

// ── PUSH EVENT (from backend via Web Push API) ───────
self.addEventListener('push', e => {
  let data = { title: '🔔 Playing XI Confirmed!', body: 'Your AI team is ready. Tap to view.', matchId: '' };
  try { data = e.data.json(); } catch(err) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:             data.body,
      icon:             '/favicon.ico',
      badge:            '/favicon.ico',
      tag:              data.matchId || 'champ11-xi',
      requireInteraction: true,
      vibrate:          [200, 100, 200],
      data:             { url: data.url || '/', matchId: data.matchId },
      actions: [
        { action: 'view', title: '🏏 View Team' },
        { action: 'dismiss', title: 'Dismiss' },
      ]
    })
  );
});

// ── NOTIFICATION CLICK ───────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;

  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Focus existing tab if open
      for (const c of list) {
        if (c.url.includes('champ11') && 'focus' in c) return c.focus();
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
