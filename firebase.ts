// Importa las funciones que necesitas del SDK que acabas de instalar
import { initializeApp } from "firebase/app";
// (Opcional) Si vas a usar base de datos o autenticación, impórtalas aquí:
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// TODO: Remplaza este objeto con la configuración de TU proyecto de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdYN2E058CsFCd6KnGQzkjmSl5nLB-QvI",
    authDomain: "lista-de-productos-f70e8.firebaseapp.com",
    projectId: "lista-de-productos-f70e8",
    storageBucket: "lista-de-productos-f70e8.firebasestorage.app",
    messagingSenderId: "311871049077",
    appId: "1:311871049077:web:10e6a1b4710b0ebb77973c"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// (Opcional) Exporta los servicios que usarás en tu app
export const db = getFirestore(app);
// export const auth = getAuth(app);
