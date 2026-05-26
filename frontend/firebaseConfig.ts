import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB95RVE_7LpVVewXceGI8wPzuuQdv7F21k",
  authDomain: "projectpap-608f1.firebaseapp.com",
  projectId: "projectpap-608f1",
  storageBucket: "projectpap-608f1.firebasestorage.app",
  messagingSenderId: "700334765505",
  appId: "1:700334765505:web:a8b77043f39e789e58ab40",
  measurementId: "G-C8462VW3QJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();