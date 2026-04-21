import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdYN2E058CsFCd6KnGQzkjmSl5nLB-QvI",
    authDomain: "lista-de-productos-f70e8.firebaseapp.com",
    projectId: "lista-de-productos-f70e8",
    storageBucket: "lista-de-productos-f70e8.firebasestorage.app",
    messagingSenderId: "311871049077",
    appId: "1:311871049077:web:10e6a1b4710b0ebb77973c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
