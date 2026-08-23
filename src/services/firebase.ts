import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'recruitment-cebef.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'recruitment-cebef',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'recruitment-cebef.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '398833030288',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:398833030288:web:demo',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let isFirebaseConnected = false

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  auth = getAuth(app)
  db = getFirestore(app)
  isFirebaseConnected = true
} catch (error) {
  console.warn('Firebase initialization note: Running with local hybrid fallback', error)
  isFirebaseConnected = false
}

export { app, auth, db, isFirebaseConnected, firebaseConfig }
