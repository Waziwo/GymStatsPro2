import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class ScoreService {
    constructor() {
        this.db = getFirestore();
        this.scoresCollection = collection(this.db, 'scores');
    }

    async addScore(exerciseType, weight, reps) {
        try {
            await addDoc(this.scoresCollection, {
                exerciseType,
                weight,
                reps,
                timestamp: Date.now(),
            });
        } catch (error) {
            throw error;
        }
    }

    async loadScores() {
        try {
            const scoresSnapshot = await getDocs(this.scoresCollection);
            const scores = scoresSnapshot.docs.map((doc) => doc.data());
            this.displayScores(scores);
        } catch (error) {
            console.error('Błąd podczas ładowania wyników:', error);
        }
    }

    displayScores(scores) {
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = '';

        scores.forEach((score) => {
            const scoreListItem = document.createElement('li');
            scoreListItem.textContent = `${score.exerciseType}: ${score.weight} kg x ${score.reps} powtórzeń`;
            scoresList.appendChild(scoreListItem);
        });
    }

    clearScores() {
        if (this.scoresList) {
            this.scoresList.innerHTML = '';
        }
    }
}