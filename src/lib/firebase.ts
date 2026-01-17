// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Export a flag to check if Firebase is configured
export const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_actual_firebase_api_key_here';

// Initialize Firebase only if properly configured
let app;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed. Please check your Firebase configuration.');
    console.warn('Get your config from: https://console.firebase.google.com/');
    // Set to undefined on error
    app = undefined;
    auth = undefined;
    googleProvider = undefined;
  }
} else {
  console.warn('Firebase is not configured. Please add your Firebase credentials to .env file.');
  console.warn('Get your config from: https://console.firebase.google.com/');
  // Explicitly set to undefined when not configured
  app = undefined;
  auth = undefined;
  googleProvider = undefined;
}

// Authentication functions - only work if Firebase is configured
export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase authentication is not configured. Please check your Firebase credentials.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Export auth instance (will be undefined if not configured)
export { auth };
export default app;