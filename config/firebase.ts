// Firebase configuration & initialization
// To use: 
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Enable Firestore Database
// 3. Add Web app to get firebaseConfig
// 4. Set Firestore security rules to allow read/write for testing:
//    rules_version = '2';
//    match /databases/{database}/documents {
//      match /{document=**} {
//        allow read, write: if true;
//      }
//    }
// 5. Paste your config below

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  // Try to get config from environment or URL params
  const urlParams = new URLSearchParams(window.location.search);
  const fbConfig = urlParams.get('fbConfig');

  if (fbConfig) {
    try {
      return JSON.parse(atob(fbConfig));
    } catch (e) {
      console.warn('Invalid fbConfig param:', e);
    }
  }

  // Try environment variables (if using Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env as Record<string, any>;
    if (env.VITE_FB_API_KEY) {
      return {
        apiKey: env.VITE_FB_API_KEY,
        authDomain: env.VITE_FB_AUTH_DOMAIN,
        projectId: env.VITE_FB_PROJECT_ID,
        storageBucket: env.VITE_FB_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID,
        appId: env.VITE_FB_APP_ID,
      };
    }
  }

  // Fallback: log instructions
  console.warn(
    'Firebase config not found. Pass via ?fbConfig=<base64-json> or set VITE_FB_* env vars. Example:\n',
    '?fbConfig=' + btoa(JSON.stringify({
      apiKey: 'YOUR_API_KEY',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '999999999999',
      appId: '1:999999999999:web:abcd1234efgh5678',
    }))
  );

  return null;
}
