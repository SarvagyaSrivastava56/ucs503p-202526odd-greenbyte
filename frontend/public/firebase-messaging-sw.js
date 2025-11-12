// Firebase Cloud Messaging Service Worker
// This file handles background notifications

// Import Firebase scripts using importScripts (service worker compatible)
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Initialize Firebase app in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk",
    authDomain: "studio-827010330-91b76.firebaseapp.com",
    projectId: "studio-827010330-91b76",
    storageBucket: "studio-827010330-91b76.appspot.com",
    messagingSenderId: "271282670485",
    appId: "1:271282670485:web:49c4913d9655adfa55c49c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.eventId || 'default',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.', event.notification.data);
  
  event.notification.close();
  
  // Get URL from notification data (click_action, url, or eventId)
  let urlToOpen = '/';
  
  if (event.notification.data) {
    // Check for click_action first (from FCM data payload)
    if (event.notification.data.click_action) {
      urlToOpen = event.notification.data.click_action;
    } else if (event.notification.data.url) {
      urlToOpen = event.notification.data.url;
    } else if (event.notification.data.eventId) {
      // Construct event URL from eventId
      urlToOpen = `/events/${event.notification.data.eventId}`;
    }
  }
  
  // Make URL absolute if it's relative
  if (urlToOpen.startsWith('/')) {
    urlToOpen = self.location.origin + urlToOpen;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Check if there's already a window/tab open with this URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // Check if URL matches (accounting for origin)
        if (client.url.includes(urlToOpen) || urlToOpen.includes(new URL(client.url).pathname)) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
