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
        } catch (error) {
            throw error;
        }
    }

    async loadScores() {
        try {
            const user = this.auth.currentUser ;
            if (!user) return [];
    
            const q = query(
                this.scoresCollection,
                where("userId", "==", user.uid)
            );
            
            const scoresSnapshot = await getDocs(q);
            return scoresSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Błąd podczas ładowania wyników:', error);
            return [];
        }
    }
}