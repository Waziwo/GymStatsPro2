// src/js/scores/scores.js
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { NotificationManager } from '../notifications.js'; // Importuj NotificationManager

class ScoreCache {
    constructor() {
        this.cache = new Map();
        this.maxAge = 5 * 60 * 1000; // 5 minut
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
    constructor(notificationManager, db) {
        this.db = db; // Upewnij się, że to jest ustawione poprawnie
        this.scoresCollection = collection(this.db, 'scores');
        this.scoresCollection = collection(this.db, 'scores');
        this.auth = getAuth();
        this.cache = new ScoreCache();
        this.scoresCollection = collection(this.db, 'scores'); // Użyj db do utworzenia kolekcji
        this.notificationManager = notificationManager; // Przechowuj instancję NotificationManager
    }
    

    async loadScores() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                console.log("ScoreService: Brak zalogowanego użytkownika");
                return [];
            }
    
            const cacheKey = `scores_${user.uid}`;
            const cachedScores = this.cache.get(cacheKey);
            if (cachedScores) {
                console.log("ScoreService: Zwracam wyniki z cache'a");
                return cachedScores;
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
            console.log("ScoreService: Załadowane wyniki z bazy:", scores);
            
            this.cache.set(cacheKey, scores);
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
            this.clearCache(); // Czyścimy cache po usunięciu wyniku
            return true; // Zwracamy true, jeśli usunięcie się powiodło
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
        let scores = await this.loadScores();
        
        if (filters.exerciseType) {
            scores = scores.filter(score => score.exerciseType === filters.exerciseType);
        }
        if (filters.dateFrom) {
            scores = scores.filter(score => score.timestamp >= new Date(filters.dateFrom).getTime());
        }
        if (filters.dateTo) {
            scores = scores.filter(score => score.timestamp <= new Date(filters.dateTo).getTime());
        }
        
        return scores;
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