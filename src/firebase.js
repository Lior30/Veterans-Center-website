import {initializeApp} from "firebase/app";
import {getFirestore, collection, addDoc} from "firebase/firestore";

// TODO: Replace with your project's config object
const firebaseConfig = {
    apiKey: "AIzaSyCekdORTWs1Pqajh9RifBTqMOLJG5NmFrc",
  authDomain: "veterans-center-website.firebaseapp.com",
  projectId: "veterans-center-website",
  storageBucket: "veterans-center-website.firebasestorage.app",
  messagingSenderId: "651479703538",
  appId: "1:651479703538:web:f9caf73990ac406a09556b",
  measurementId: "G-E84JMP1BW4"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  export const db = getFirestore(app);
