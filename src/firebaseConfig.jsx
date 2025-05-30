// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAA2ao1c2aV0jCbWgxPH4KnZS5iERHPgIM",
  authDomain: "chatapp-63161.firebaseapp.com",
  projectId: "chatapp-63161",
  storageBucket: "chatapp-63161.firebasestorage.app",
  messagingSenderId: "806714716302",
  appId: "1:806714716302:web:6687f088d887f0a5d599df",
  measurementId: "G-N8C00BBH50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);