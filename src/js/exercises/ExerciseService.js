import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
}