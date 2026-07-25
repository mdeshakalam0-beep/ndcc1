import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXBeHAFhS7vUB6RPuR9ZKfYs_x0oXMNA8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ndcc-acbde.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ndcc-acbde",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ndcc-acbde.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "584537452284",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:584537452284:web:915f3fadc1e47d78533179"
};

// Always enabled now since we have active credentials
const hasConfig = true;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, hasConfig };
