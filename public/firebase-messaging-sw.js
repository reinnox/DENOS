// Firebase messaging service worker - copy your firebase config into client to initialize messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: self?.__FIREBASE_API_KEY || '',
  authDomain: self?.__FIREBASE_AUTH_DOMAIN || '',
  projectId: self?.__FIREBASE_PROJECT_ID || '',
};
if (!firebase.apps?.length) firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'DENOS';
  const options = { body: payload.notification?.body || '', icon: '/favicon.ico' };
  self.registration.showNotification(title, options);
});
