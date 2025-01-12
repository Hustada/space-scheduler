import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYyiJZKb-fQHIE7n6wiC5rKvY6YeWXHfk",
  authDomain: "space-scheduler.firebaseapp.com",
  projectId: "space-scheduler",
  storageBucket: "space-scheduler.appspot.com",
  messagingSenderId: "127918975822",
  appId: "1:127918975822:web:24ca3b5dcf0a95202d4c1f",
  measurementId: "G-V744VCPTJ9",
  actionCodeSettings: {
    url: 'http://localhost:5173', // Update this for production
    handleCodeInApp: true
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Set auth persistence to local
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db, analytics, auth };
