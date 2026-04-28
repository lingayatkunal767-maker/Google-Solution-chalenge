// config/firebase.js
const admin = require('firebase-admin');

let db, auth, messaging, storage;

function initFirebase() {
  if (admin.apps.length === 0) {
    // In production: use Application Default Credentials (ADC)
    // In development: use service account key from env
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    const appConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'volunteermatch-ai',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'volunteermatch-ai.appspot.com',
    };

    if (serviceAccount) {
      appConfig.credential = admin.credential.cert(serviceAccount);
    } else {
      appConfig.credential = admin.credential.applicationDefault();
    }

    admin.initializeApp(appConfig);
  }

  db = admin.firestore();
  auth = admin.auth();
  messaging = admin.messaging();
  storage = admin.storage();

  // Use emulator in development
  if (process.env.NODE_ENV === 'development' || process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('🔧 Using Firestore Emulator');
  }

  return { db, auth, messaging, storage, admin };
}

module.exports = { initFirebase, getDb: () => db, getAuth: () => auth, getMessaging: () => messaging, getStorage: () => storage };
