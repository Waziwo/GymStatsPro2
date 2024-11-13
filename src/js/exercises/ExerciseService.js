import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class ExerciseService {
    constructor() {
        this.db = getFirestore();
        this.exercisesCollection = collection(this.db, 'exercises');
    }

    async addExercise(exerciseData) {
        try {
            await addDoc(this.exercisesCollection, exerciseData);
            console.log('Ćwiczenie dodane pomyślnie:', exerciseData);
        } catch (error) {
            console.error('Błąd podczas dodawania ćwiczenia:', error);
            throw error;
        }
    }

    async getExercises(userId) {
        try {
            const exercisesSnapshot = await getDocs(this.exercisesCollection);
            const exercises = exercisesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(exercise => exercise.userId === userId); // Filtruj ćwiczenia dla konkretnego użytkownika

            return exercises;
        } catch (error) {
            console.error('Błąd podczas wczytywania ćwiczeń:', error);
            throw error;
        }
    }
}