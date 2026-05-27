import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, where, addDoc, deleteDoc, orderBy, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "chesspedia",
  appId: "1:183587407468:web:04fb80fe85c2d07c84fa49",
  apiKey: "AIzaSyBH1nYavu5Vioc-ukW61VK76A0pBVGRcsU",
  authDomain: "chesspedia.firebaseapp.com",
  storageBucket: "chesspedia.firebasestorage.app",
  messagingSenderId: "183587407468",
  measurementId: ""
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, "ai-studio-621f07e2-244a-4a60-98dc-126367fde3f2");
export { signInWithPopup, signOut, onAuthStateChanged, collection, doc, setDoc, getDoc, onSnapshot, query, where, addDoc, deleteDoc, orderBy, updateDoc };

