// Inicjalizacja Firebase
// Użyj danych konfiguracyjnych z Firebase konsoli
const firebaseConfig = {
    apiKey: "TWÓJ_API_KEY",
    authDomain: "TWÓJ_AUTH_DOMAIN",
    projectId: "TWÓJ_PROJECT_ID",
    storageBucket: "TWÓJ_STORAGE_BUCKET",
    messagingSenderId: "TWÓJ_MESSAGING_SENDER_ID",
    appId: "TWÓJ_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
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
