import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-SLX59YpTXy1YKOobvL4G5wCdkQVrlmA",
  authDomain: "djikoe-af532.firebaseapp.com",
  projectId: "djikoe-af532",
  storageBucket: "djikoe-af532.firebasestorage.app",
  messagingSenderId: "604294951466",
  appId: "1:604294951466:web:3900fead3383d4712d0953",
  measurementId: "G-8KZ92W74B6"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };