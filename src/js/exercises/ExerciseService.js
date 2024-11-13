import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

   async getExercises(userId) {
    try {
        console.log('Getting exercises for user:', userId);
        const exercisesSnapshot = await getDocs(this.exercisesCollection);
        console.log('Exercises snapshot:', exercisesSnapshot);
        console.log('Number of exercises:', exercisesSnapshot.docs.length);
        const exercises = exercisesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(exercise => exercise.userId === userId); // Filtruj ćwiczenia dla konkretnego użytkownika
        console.log('Number of exercises for user:', exercises.length);
        console.log('Exercises for user:', exercises);
        return exercises;
    } catch (error) {
        console.error('Error getting exercises:', error);
        console.error('Error details:', error.message);
        throw error;
    }
}
}