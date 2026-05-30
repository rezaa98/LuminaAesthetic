import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup as fbSignInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection as fbCollection, 
  doc as fbDoc, 
  setDoc as fbSetDoc, 
  getDoc as fbGetDoc, 
  onSnapshot as fbOnSnapshot, 
  query as fbQuery, 
  where as fbWhere, 
  addDoc as fbAddDoc, 
  deleteDoc as fbDeleteDoc, 
  orderBy as fbOrderBy, 
  updateDoc as fbUpdateDoc,
  increment as fbIncrement,
  getCountFromServer as fbGetCountFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Detect whether we are using a dummy or incomplete config
const isDummyConfig = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('Dummy') || 
  firebaseConfig.apiKey === '';

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let isFirebaseActive = false;

if (!isDummyConfig) {
  try {
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    isFirebaseActive = true;
    console.log("Firebase initialized successfully in cloud persistent mode.");
  } catch (err) {
    console.error("Firebase failed to initialize due to configuration error:", err);
  }
} else {
  console.warn("LuminaAesthetic is running in offline-ready Sandbox Mode due to unconfigured Firebase credentials.");
}

export const app = appInstance;
export const auth = authInstance || { currentUser: null };
export const db = dbInstance || { type: 'firestore' };
export { isFirebaseActive };

export const googleProvider = new GoogleAuthProvider();

export const onAuthStateChanged = (authInstanceArg: any, callback: (user: any) => void) => {
  if (isFirebaseActive && authInstance) {
    try {
      return fbOnAuthStateChanged(authInstance, callback);
    } catch (e) {
      console.error("onAuthStateChanged failed:", e);
    }
  }
  // Synchronous callback with null if Firebase is inactive or fails
  callback(null);
  return () => {};
};

export const signInWithPopup = async (authInstanceArg: any, provider: any) => {
  if (isFirebaseActive && authInstance) {
    return fbSignInWithPopup(authInstance, provider);
  } else {
    throw new Error(
      "Firebase Auth is offline. Please initialize or configure Firebase setup in the AI Studio Settings menu to connect a live database."
    );
  }
};

export const signOut = async (authInstanceArg: any) => {
  if (isFirebaseActive && authInstance) {
    return fbSignOut(authInstance);
  }
  return Promise.resolve();
};

export const collection = (dbInstanceArg: any, path: string, ...pathSegments: string[]) => {
  if (isFirebaseActive && dbInstanceArg && typeof dbInstanceArg.type === 'string') {
    try {
      return fbCollection(dbInstanceArg, path, ...pathSegments);
    } catch (e) {
      console.error("fbCollection failed, falling back:", e);
    }
  }
  return { _isDummy: true, path, type: 'collection' } as any;
};

export const doc = (dbInstanceArg: any, path: string, ...pathSegments: string[]) => {
  if (isFirebaseActive && dbInstanceArg && typeof dbInstanceArg.type === 'string') {
    try {
      return fbDoc(dbInstanceArg, path, ...pathSegments);
    } catch (e) {
      console.error("fbDoc failed, falling back:", e);
    }
  }
  return { 
    _isDummy: true, 
    path, 
    type: 'document', 
    id: pathSegments[pathSegments.length - 1] || 'dummy-id' 
  } as any;
};

export const query = (queryInstance: any, ...queryConstraints: any[]) => {
  if (isFirebaseActive && queryInstance && !queryInstance._isDummy) {
    try {
      return fbQuery(queryInstance, ...queryConstraints);
    } catch (e) {
      console.error("fbQuery failed, falling back:", e);
    }
  }
  return { _isDummy: true, type: 'query' } as any;
};

export const where = (fieldPath: string, opStr: any, value: any) => {
  if (isFirebaseActive) {
    try {
      return fbWhere(fieldPath, opStr, value);
    } catch (e) {
      console.error("fbWhere failed:", e);
    }
  }
  return { _isDummy: true, type: 'where', fieldPath, opStr, value } as any;
};

export const orderBy = (fieldPath: string, directionStr?: any) => {
  if (isFirebaseActive) {
    try {
      return fbOrderBy(fieldPath, directionStr);
    } catch (e) {
      console.error("fbOrderBy failed:", e);
    }
  }
  return { _isDummy: true, type: 'orderBy', fieldPath, directionStr } as any;
};

export const getDoc = async (docRef: any) => {
  if (isFirebaseActive && docRef && !docRef._isDummy) {
    try {
      return await fbGetDoc(docRef);
    } catch (e) {
      console.error("fbGetDoc failed, falling back:", e);
    }
  }
  return {
    exists: () => false,
    data: () => null,
    id: docRef?.id || 'dummy-id'
  } as any;
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  if (isFirebaseActive && docRef && !docRef._isDummy) {
    try {
      return await fbSetDoc(docRef, data, options);
    } catch (e) {
      console.error("fbSetDoc failed, falling back:", e);
    }
  }
  console.log("Offline Mode: Simulated setDoc for:", docRef?.path, data);
  return Promise.resolve();
};

export const updateDoc = async (docRef: any, data: any) => {
  if (isFirebaseActive && docRef && !docRef._isDummy) {
    try {
      return await fbUpdateDoc(docRef, data);
    } catch (e) {
      console.error("fbUpdateDoc failed, falling back:", e);
    }
  }
  console.log("Offline Mode: Simulated updateDoc for:", docRef?.path, data);
  return Promise.resolve();
};

export const addDoc = async (collRef: any, data: any) => {
  if (isFirebaseActive && collRef && !collRef._isDummy) {
    try {
      return await fbAddDoc(collRef, data);
    } catch (e) {
      console.error("fbAddDoc failed, falling back:", e);
    }
  }
  console.log("Offline Mode: Simulated addDoc for:", collRef?.path, data);
  return { id: 'dummy-id-' + Math.random().toString(36).substring(2, 11) } as any;
};

export const deleteDoc = async (docRef: any) => {
  if (isFirebaseActive && docRef && !docRef._isDummy) {
    try {
      return await fbDeleteDoc(docRef);
    } catch (e) {
      console.error("fbDeleteDoc failed, falling back:", e);
    }
  }
  console.log("Offline Mode: Simulated deleteDoc for:", docRef?.path);
  return Promise.resolve();
};

export const onSnapshot = (
  reference: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) => {
  if (isFirebaseActive && reference && !reference._isDummy) {
    try {
      return fbOnSnapshot(reference, onNext, onError);
    } catch (e) {
      console.error("fbOnSnapshot failed, falling back:", e);
      if (onError) onError(e);
    }
  }
  
  // Immediately call with empty state if Firebase is inactive
  const timer = setTimeout(() => {
    onNext({
      empty: true,
      size: 0,
      docs: [],
      forEach: (_callback: any) => {}
    });
  }, 0);
  
  return () => clearTimeout(timer);
};

export const increment = (n: number) => {
  if (isFirebaseActive) return fbIncrement(n);
  return n; // Dummy pass-through for offline
};

export const getCountFromServer = async (queryInstance: any) => {
  if (isFirebaseActive && queryInstance && !queryInstance._isDummy) {
    try {
      return await fbGetCountFromServer(queryInstance);
    } catch (e) {
      console.error("fbGetCountFromServer failed, falling back:", e);
    }
  }
  return { data: () => ({ count: 0 }) };
};

