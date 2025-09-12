import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB_q-4y_flTDZiKqdje5f09dtxGyh1H5UY",
  authDomain: "ai-kids-2a061.firebaseapp.com",
  projectId: "ai-kids-2a061",
  storageBucket: "ai-kids-2a061.firebasestorage.app",
  messagingSenderId: "532649364077",
  appId: "1:532649364077:web:2c6924ea31dff664844d64",
  measurementId: "G-QHCTPJ6Q98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
