import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCChz1r8ZHux5CvNHsJvlO9AW-ZPtRDnjg",
  authDomain: "projectpap-608f1.firebaseapp.com",
  projectId: "projectpap-608f1",
  storageBucket: "projectpap-608f1.firebasestorage.app",
  messagingSenderId: "700334765505",
  appId: "1:700334765505:web:30fc25ca1cf556e558ab40",
  measurementId: "G-5BGNYR2W0E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();