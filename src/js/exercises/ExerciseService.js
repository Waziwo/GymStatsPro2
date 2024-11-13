import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const db = getFirestore();

export class ExerciseService {
    constructor() {
        this.exercises = [];
    }

    async addExercise(exercise) {
        try {
            const exerciseRef = db.collection('exercises').doc(exercise.userId);
            await exerciseRef.set({
                exercises: firebase.firestore.FieldValue.arrayUnion(exercise)
            }, { merge: true });
        } catch (error) {
            console.error('Błąd podczas zapisywania ćwiczenia:', error);
            throw error;
        }
    }

    async getExercises(userId) {
        try {
            const exerciseRef = await db.collection('exercises').doc(userId).get();
            if (exerciseRef.exists) {
                this.exercises = exerciseRef.data().exercises || [];
            }
            return this.exercises;
        } catch (error) {
            console.error('Błąd podczas pobierania ćwiczeń:', error);
            throw error;
        }
    }
}