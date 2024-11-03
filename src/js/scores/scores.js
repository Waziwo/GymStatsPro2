import { collection, addDoc, query, where, getDocs, orderBy, getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export class ScoreService {
    constructor() {
        this.db = getFirestore();
        this.scoresCollection = collection(this.db, 'scores');
        this.scoresList = document.getElementById('scores-list');
    }

    async loadScores() {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;
    
            const q = query(
                this.scoresCollection,
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
            );
            
            const querySnapshot = await getDocs(q);
            this.scoresList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const score = doc.data();
                const li = document.createElement('li');
                li.textContent = `Ćwiczenie: ${score.exerciseType}, Ciężar: ${score.weight} kg, Powtórzenia: ${score.reps}`;
                this.scoresList.appendChild(li);
            });
        } catch (error) {
            console.error("Błąd podczas ładowania wyników:", error);
        }
    }

    async addScore(userId, exerciseType, weight, reps) {
        try {
            return await addDoc(this.scoresCollection, {
                userId,
                exerciseType,
                weight: parseFloat(weight),
                reps: parseInt(reps),
                timestamp: new Date()
            });
        } catch (error) {
            throw new Error(`Error adding score: ${error.message}`);
        }
    }

    async getUserScores(userId) {
        try {
            const scoresQuery = query(
                this.scoresCollection, 
                where('userId', '==', userId),
                orderBy("timestamp", "desc")
            );
            return await getDocs(scoresQuery);
        } catch (error) {
            throw new Error(`Error fetching scores: ${error.message}`);
        }
    }
}