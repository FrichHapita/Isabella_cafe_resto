import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKPnr4s0jt8qwbaW6vr2XILjOxKPrVsEg",
  authDomain: "joint-code-solutions.firebaseapp.com",
  projectId: "joint-code-solutions",
  storageBucket: "joint-code-solutions.firebasestorage.app",
  messagingSenderId: "710038657822",
  appId: "1:710038657822:web:8e09f6834e475025dcc70f",
  measurementId: "G-QHFKVDEQ26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed-precondition: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence unimplemented: Browser does not support persistence');
    }
});

export default app;
