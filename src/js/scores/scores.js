import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class ScoreService {
    constructor(db) {
        this.db = db;
    }

    async addScore(userId, gameName, score) {
        try {
            return await addDoc(collection(this.db, 'scores'), {
                userId,
                gameName,
                score: parseInt(score),
                timestamp: new Date()
            });
        } catch (error) {
            throw new Error(`Error adding score: ${error.message}`);
        }
    }

    async getUserScores(userId) {
        try {
            const scoresQuery = query(
                collection(this.db, 'scores'), 
                where('userId', '==', userId)
            );
            return await getDocs(scoresQuery);
        } catch (error) {
            throw new Error(`Error fetching scores: ${error.message}`);
        }
    }
}