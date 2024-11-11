

// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDNtXbYetm8aLRmomgBlVP6HXNZyhttFfQ",
    authDomain: "strona-do-zapisywania-wynikow.firebaseapp.com",
    projectId: "strona-do-zapisywania-wynikow",
    storageBucket: "strona-do-zapisywania-wynikow.firebasestorage.app",
    messagingSenderId: "30761717995",
    appId: "1:30761717995:web:ac03840376114c5fbdeeae",
    measurementId: "G-4F2LGNY193"
};

// Importowanie modułów Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Eksportowanie instancji
export { app, auth, db };