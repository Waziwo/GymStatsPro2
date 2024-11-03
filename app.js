import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
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

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Kod aplikacji
const form = document.getElementById('form');
const resultsDiv = document.getElementById('results');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authButton = document.getElementById('authButton');
const toggleAuth = document.getElementById('toggleAuth');

// Uwierzytelnianie
let isRegistering = false;

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
    } else {
        await signInWithEmailAndPassword(auth, email, password);
    }
});

toggleAuth.addEventListener('click', () => {
    isRegistering = !isRegistering;
    authTitle.textContent = isRegistering ? "Zarejestruj się" : "Zaloguj się";
    authButton.textContent = isRegistering ? "Zarejestruj się" : "Zaloguj się";
    toggleAuth.textContent = isRegistering ? "Masz konto? Zaloguj się" : "Nie masz konta? Zarejestruj się";
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        form.classList.remove('hidden');
        displayResults();
    } else {
        form.classList.add('hidden');
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value;
    const weight = document.getElementById('weight').value;

    // Dodanie nowego dokumentu do kolekcji „wyniki”
    await addDoc(collection(db, "wyniki"), {
        exercise,
        weight: parseFloat(weight),
        timestamp: new Date()
    });
    displayResults();
    form.reset();
});

async function displayResults() {
    resultsDiv.innerHTML = "";
    const q = query(collection(db, "wyniki"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        resultsDiv.innerHTML += `<p>${data.exercise}: ${data.weight} kg</p>`;
    });
}

// Wyświetlenie wyników przy uruchomieniu
displayResults();
