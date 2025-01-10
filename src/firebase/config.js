import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// Replace these with your Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyAYyiJZKb-fQHIE7n6wiC5rKvY6YeWXHfk",
  authDomain: "space-scheduler.firebaseapp.com",
  projectId: "space-scheduler",
  storageBucket: "space-scheduler.appspot.com",
  messagingSenderId: "127918975822",
  appId: "1:127918975822:web:24ca3b5dcf0a95202d4c1f",
  measurementId: "G-V744VCPTJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Error enabling persistence:', err);
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser doesn\'t support persistence.');
    }
  });

export { db, analytics };
