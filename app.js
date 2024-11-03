import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Rejestracja zakończona sukcesem!");
        registerForm.reset();
    } catch (error) {
        alert(error.message);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        userEmailSpan.textContent = email;
        userInfo.style.display = 'block';
        alert("Zalogowano pomyślnie!");
        loginForm.reset();
    } catch (error) {
        alert(error.message);
    }
});

logoutButton.addEventListener('click', async () => {
    await signOut(auth);
    userInfo.style.display = 'none';
    alert("Wylogowano pomyślnie!");
});
