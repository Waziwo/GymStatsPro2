// src/js/exercises/ExerciseService.js
export class ExerciseService {
    constructor() {
        this.exercises = [
            { name: 'Wyciskanie sztangi', description: 'Ćwiczenie na klatkę piersiową' },
            { name: 'Przysiad', description: 'Ćwiczenie na nogi' },
            { name: 'Martwy ciąg', description: 'Ćwiczenie na plecy' },
            { name: 'Wyciskanie na barki', description: 'Ćwiczenie na barki' },
            { name: 'Podciąganie', description: 'Ćwiczenie na plecy i ramiona' },
            // Dodaj więcej ćwiczeń według potrzeby
        ];
    }

    getExercises() {
        return this.exercises;
    }
}