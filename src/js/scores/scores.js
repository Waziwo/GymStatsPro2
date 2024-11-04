import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
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
        } catch (error) {
            throw error;
        }
    }

    async loadScores() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                console.log("ScoreService: Brak zalogowanego użytkownika");
                return [];
            }
    
            const q = query(
                this.scoresCollection,
                where("userId", "==", user.uid)
            );
            
            const scoresSnapshot = await getDocs(q);
            const scores = scoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("ScoreService: Załadowane wyniki:", scores);
            return scores;
        } catch (error) {
            console.error("ScoreService: Błąd podczas ładowania wyników:", error);
            return [];
        }
    }
    async deleteScore(scoreId) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('Użytkownik nie jest zalogowany');

            const scoreRef = doc(this.db, 'scores', scoreId);
            await deleteDoc(scoreRef);
        } catch (error) {
            throw error;
        }
    }
}