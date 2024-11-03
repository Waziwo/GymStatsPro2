import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class ScoreService {
    constructor() {
        this.db = getFirestore();
        this.scoresCollection = collection(this.db, 'scores');
        this.auth = getAuth();
    }

    async addScore(exerciseType, weight, reps) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('Użytkownik nie jest zalogowany');

            await addDoc(this.scoresCollection, {
                userId: user.uid,
                userEmail: user.email,
                exerciseType,
                weight,
                reps,
                timestamp: Date.now(),
            });
            await this.loadScores(); // Odśwież listę po dodaniu
        } catch (error) {
            throw error;
        }
    }

    async loadScores() {
        try {
            const user = this.auth.currentUser;
            if (!user) return;

            const q = query(
                this.scoresCollection,
                where("userId", "==", user.uid)
            );
            
            const scoresSnapshot = await getDocs(q);
            const scores = scoresSnapshot.docs.map((doc) => doc.data());
            this.displayScores(scores);
        } catch (error) {
            console.error('Błąd podczas ładowania wyników:', error);
        }
    }

    displayScores(scores) {
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = '';

        // Sortuj wyniki według timestamp (od najnowszych)
        scores.sort((a, b) => b.timestamp - a.timestamp);

        scores.forEach((score) => {
            const scoreListItem = document.createElement('li');
            const date = new Date(score.timestamp);
            scoreListItem.textContent = `${score.exerciseType}: ${score.weight} kg x ${score.reps} powtórzeń (${date.toLocaleDateString()})`;
            scoresList.appendChild(scoreListItem);
        });
    }

    clearScores() {
        const scoresList = document.getElementById('scores-list');
        if (scoresList) {
            scoresList.innerHTML = '';
        }
    }
}