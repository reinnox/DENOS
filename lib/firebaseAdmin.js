const admin = require('firebase-admin');

if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use Application Default Credentials (set GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else if (process.env.FIREBASE_ADMIN_SDK_JSON) {
    // Or provide a JSON string in env FIREBASE_ADMIN_SDK_JSON
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON)) });
  } else {
    // Fall back to unauthenticated - will throw when used
    try {
      admin.initializeApp();
    } catch (e) {
      console.warn('Firebase Admin initialization failed: no credentials provided');
    }
  }
}

const db = admin.firestore();
const messaging = admin.messaging();
module.exports = { admin, db, messaging }; 
