// Inicjalizacja Firebase
// Użyj danych konfiguracyjnych z Firebase konsoli
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
firebase.initializeApp(firebaseConfig);

// Inicjalizacja Firestore
const db = firebase.firestore();

// Kod aplikacji
const form = document.getElementById('form');
const resultsDiv = document.getElementById('results');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const exercise = document.getElementById('exercise').value;
    const weight = document.getElementById('weight').value;

    db.collection("wyniki").add({
        exercise,
        weight: parseFloat(weight),
        timestamp: new Date()
    }).then(() => {
        displayResults();
        form.reset();
    });
});

function displayResults() {
    resultsDiv.innerHTML = "";
    db.collection("wyniki").orderBy("timestamp", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            resultsDiv.innerHTML += `<p>${data.exercise}: ${data.weight} kg</p>`;
        });
    });
}

displayResults();