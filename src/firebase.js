
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC9ZB6dhTCeCrfCiayDzYri5D52tUP5IY",
  authDomain: "project-task-management-31978.firebaseapp.com",
  projectId: "project-task-management-31978",
  storageBucket: "project-task-management-31978.firebasestorage.app",
  messagingSenderId: "485299551625",
  appId: "1:485299551625:web:c63a8715ed4178a4a9f558",
  measurementId: "G-L6R7Q3HJBE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const isFirebaseConfigured =
  firebaseConfig.apiKey.trim() !== "";