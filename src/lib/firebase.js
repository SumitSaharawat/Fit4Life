import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let db = null;
let auth = null;

if (config.apiKey && config.projectId) {
  try {
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.warn("Firebase init failed, using localStorage:", e.message);
  }
}

export { app, db, auth };
export const isFirebaseEnabled = () => !!db;
