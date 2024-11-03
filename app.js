// Importy Firebase (dla Firebase 9 i nowszych)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
const db = getFirestore(app);

// Kod aplikacji
const form = document.getElementById('form');
const resultsDiv = document.getElementById('results');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value;
    const weight = document.getElementById('weight').value;

    // Sprawdzenie, czy dane są poprawne
    if (exercise.trim() === "" || isNaN(weight) || weight <= 0) {
        alert("Proszę wprowadzić poprawne dane.");
        return;
    }

    try {
        // Dodanie nowego dokumentu do kolekcji „wyniki”
        await addDoc(collection(db, "wyniki"), {
            exercise,
            weight: parseFloat(weight),
            timestamp: new Date()
        });
        displayResults();
        form.reset();
    } catch (error) {
        console.error("Błąd przy dodawaniu dokumentu: ", error);
    }
});

async function displayResults() {
    resultsDiv.innerHTML = "";
    const q = query(collection(db, "wyniki"), orderBy("timestamp", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            resultsDiv.innerHTML += `<p>${data.exercise}: ${data.weight} kg</p>`;
        });
    } catch (error) {
        console.error("Błąd przy pobieraniu wyników: ", error);
    }
}

// Wyświetlenie wyników przy uruchomieniu
displayResults();
