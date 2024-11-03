import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
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

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userEmailSpan.textContent = user.email;
            userInfo.style.display = 'block';
            loginForm.style.display = 'none';
            registerForm.style.display = 'none';
        } else {
            userInfo.style.display = 'none';
            loginForm.style.display = 'block';
            registerForm.style.display = 'block';
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            console.log("Attempting to register with:", email, password);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered successfully:", userCredential.user);
            alert("Rejestracja zakończona sukcesem!");
            registerForm.reset();
        } catch (error) {
            console.error("Registration error:", error.code, error.message);
            alert(`Błąd rejestracji: ${error.message}`);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in successfully");
            alert("Zalogowano pomyślnie!");
            loginForm.reset();
        } catch (error) {
            console.error("Login error:", error);
            alert(`Błąd logowania: ${error.message}`);
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
            alert("Wylogowano pomyślnie!");
        } catch (error) {
            console.error("Logout error:", error);
            alert(`Błąd wylogowania: ${error.message}`);
        }
    });
});