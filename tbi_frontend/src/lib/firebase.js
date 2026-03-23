import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBpu5O5kHdY2SSXx85thDfZfJMNAIVE-0E",
    authDomain: "tbi-system.firebaseapp.com",
    projectId: "tbi-system",
    storageBucket: "tbi-system.firebasestorage.app",
    messagingSenderId: "663924471383",
    appId: "1:663924471383:web:6b86bac69fd4833a1f9512",
    measurementId: "G-TQ2B2ZHZ99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

// I'v now added my own Firebase Credentials, Authentications, and my own set of configurations. Now all i want you to do is rewrote back all the login and signup  connection logics to each of the following:
// Login.js, Dashboard.js, Evaluation.js and StudentLogin.jsx.