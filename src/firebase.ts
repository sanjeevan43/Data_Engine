import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCussdIu8sMoZfaIqnG_7R8TfKHhSoCCWg",
  authDomain: "omniflow-8665a.firebaseapp.com",
  projectId: "omniflow-8665a",
  storageBucket: "omniflow-8665a.firebasestorage.app",
  messagingSenderId: "338804216293",
  appId: "1:338804216293:web:73a07b86752c1b55d79f0c",
  measurementId: "G-XP0TY2T74P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig, "FirebaseAuthApp");
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
