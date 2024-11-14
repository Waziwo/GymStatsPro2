import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export class ExerciseService {
    constructor() {
        this.db = getFirestore();
        this.exercisesCollection = collection(this.db, 'exercises');
        console.log('ExerciseService initialized');
    }

    async addExercise(exerciseData) {
        try {
            console.log('Adding exercise:', exerciseData);
            await addDoc(this.exercisesCollection, exerciseData);
            console.log('Exercise added successfully:', exerciseData);
        } catch (error) {
            console.error('Error adding exercise:', error);
            throw error;
        }
    }
    async updateExercise(exerciseId, updatedData) {
        try {
            const exerciseRef = doc(this.db, 'exercises', exerciseId);
            await setDoc(exerciseRef, updatedData, { merge: true });
            this.notificationManager.show('Ćwiczenie zaktualizowane pomyślnie!', 'success');
        } catch (error) {
            console.error('Błąd podczas edytowania ćwiczenia:', error);
            this.notificationManager.show('Błąd podczas edytowania ćwiczenia: ' + error.message, 'error');
            throw error;
        }
    }
    async deleteExercise(exerciseId) {
        try {
            const exerciseRef = doc(this.db, 'exercises', exerciseId);
            await deleteDoc(exerciseRef);
            this.notificationManager.show('Ćwiczenie usunięte pomyślnie!', 'success');
        } catch (error) {
            console.error('Błąd podczas usuwania ćwiczenia:', error);
            this.notificationManager.show('Błąd podczas usuwania ćwiczenia: ' + error.message, 'error');
            throw error;
        }
    }
    async getExercises(userId) {
        try {
            const exercisesSnapshot = await getDocs(this.exercisesCollection);
            const exercises = exercisesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(exercise => exercise.userId === userId);
    
            // Upewnij się, że zawsze zwracasz tablicę
            return exercises || [];
        } catch (error) {
            console.error('Błąd podczas wczytywania ćwiczeń:', error);
            throw error;
        }
    }
    async getExercise(exerciseId) {
        try {
            const exerciseRef = doc(this.db, 'exercises', exerciseId);
            const exerciseSnap = await getDoc(exerciseRef);
            if (exerciseSnap.exists()) {
                return { id: exerciseSnap.id, ...exerciseSnap.data() };
            } else {
                console.error('Ćwiczenie nie istnieje!');
                return null;
            }
        } catch (error) {
            console.error('Błąd podczas pobierania ćwiczenia:', error);
            throw error;
        }
    }
    
}