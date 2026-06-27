import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration keys
// NOTE: Replace these dummy/placeholder config properties with your actual 
// Firebase project configuration values from the Firebase Console (Console -> Project Settings -> General -> Web Apps)
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyHere-ReplaceWithYourActualKey",
  authDomain: "aifagen-intelligence-task.firebaseapp.com",
  projectId: "aifagen-intelligence-task",
  storageBucket: "aifagen-intelligence-task.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234efgh5678"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Check if config has been customized
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "AIzaSyDummyKeyHere-ReplaceWithYourActualKey" && 
  firebaseConfig.apiKey.trim() !== "";

