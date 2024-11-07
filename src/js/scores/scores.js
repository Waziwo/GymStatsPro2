import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    deleteDoc,
    doc,
    getFirestore 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class ScoreCache {
    constructor(maxAge = 5 * 60 * 1000) { // 5 minut domyślnie
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    clear() {
        this.cache.clear();
    }
}

export class ScoreService {
    constructor() {
        this.initialized = false;
        this.db = getFirestore();
        this.scoresCollection = collection(this.db, 'scores');
        this.auth = getAuth();
        this.cache = new ScoreCache();
        this.pendingAdd = false; 
    }

    async addScore(exerciseType, weight, reps) {
        if (this.pendingAdd) return; // Zabezpieczenie przed wielokrotnym dodaniem
        this.pendingAdd = true;
        
        try {
            console.log("[ScoreService] Rozpoczęcie dodawania wyniku", { exerciseType, weight, reps });
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
            console.log("[ScoreService] Wynik dodany pomyślnie");
            this.clearCache();
            return true;
        } catch (error) {
            console.error("[ScoreService] Błąd podczas dodawania wyniku:", error);
            throw error;
        } finally {
            this.pendingAdd = false;
        }
    }
    async loadScores() {
        try {
            const user = this.auth.currentUser;
            console.log("LoadScores - Current user:", user);
            
            if (!user) {
                console.log("ScoreService: Brak zalogowanego użytkownika");
                return [];
            }
    
            const q = query(
                this.scoresCollection,
                where("userId", "==", user.uid)
            );
            
            const scoresSnapshot = await getDocs(q);
            console.log("LoadScores - Query snapshot:", scoresSnapshot);
            
            const scores = scoresSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("ScoreService: Załadowane wyniki z bazy:", scores);
            
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
            this.clearCache();
            return true;
        } catch (error) {
            console.error("Błąd podczas usuwania wyniku:", error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }

    async exportScores(format = 'csv') {
        const scores = await this.loadScores();
        
        if (format === 'csv') {
            const csvContent = [
                ['Data', 'Ćwiczenie', 'Ciężar (kg)', 'Powtórzenia'].join(','),
                ...scores.map(score => [
                    new Date(score.timestamp).toLocaleDateString(),
                    score.exerciseType,
                    score.weight,
                    score.reps
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `wyniki_${new Date().toLocaleDateString()}.csv`;
            link.click();
        } else if (format === 'json') {
            const jsonContent = JSON.stringify(scores, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `wyniki_${new Date().toLocaleDateString()}.json`;
            link.click();
        }
    }

    async getFilteredScores(filters) {
        try {
            let scores = await this.loadScores();
            
            if (filters.exerciseType) {
                scores = scores.filter(score => score.exerciseType === filters.exerciseType);
            }
            
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                scores = scores.filter(score => new Date(score.timestamp) >= fromDate);
            }
            
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // Ustawia koniec dnia
                scores = scores.filter(score => new Date(score.timestamp) <= toDate);
            }
            
            return scores;
        } catch (error) {
            console.error('Error filtering scores:', error);
            throw error;
        }
    }

    sortScores(scores, sortBy, sortOrder) {
        return scores.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'asc' 
                    ? new Date(a.timestamp) - new Date(b.timestamp)
                    : new Date(b.timestamp) - new Date(a.timestamp);
            } else if (sortBy === 'weight') {
                return sortOrder === 'asc' 
                    ? a.weight - b.weight 
                    : b.weight - a.weight;
            }
        });
    }

    async exportStatistics() {
        const scores = await this.loadScores();
        const stats = this.calculateStatistics(scores);
        
        const jsonContent = JSON.stringify(stats, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `statystyki_${new Date().toLocaleDateString()}.json`;
        link.click();
    }

    calculateStatistics(scores) {
        const stats = {
            totalWorkouts: scores.length,
            exerciseStats: {}
        };

        scores.forEach(score => {
            if (!stats.exerciseStats[score.exerciseType]) {
                stats.exerciseStats[score.exerciseType] = {
                    totalSets: 0,
                    totalReps: 0,
                    totalWeight: 0,
                    maxWeight: 0
                };
            }

            const exerciseStats = stats.exerciseStats[score.exerciseType];
            exerciseStats.totalSets++;
            exerciseStats.totalReps += score.reps;
            exerciseStats.totalWeight += score.weight * score.reps;
            exerciseStats.maxWeight = Math.max(exerciseStats.maxWeight, score.weight);
        });

        return stats;
    }
}