import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { StatisticsDisplay } from './StatisticsDisplay.js'; // Upewnij się, że importujesz tę klasę

export class ScoreDisplay {
    constructor(scoreService, authService, notificationManager, exerciseService) {
        this.scoreService = scoreService;
        this.authService = authService;
        this.exerciseService = exerciseService; // Upewnij się, że to jest poprawnie przypisane
        this.notificationManager = notificationManager; 
        this.statisticsDisplay = new StatisticsDisplay(scoreService);
        this.scoreForm = null;
        this.isSubmitting = false; // Dodaj tę linię
        this.scoresList = null;
        this.auth = getAuth();
        this.scoresList = document.querySelector('.scores-list');
        this.scoreFormListenerAdded = false;
    }

    init() {
        console.log("init called");
        try {
            this.initializeScoreFormElements();
            this.loadExercises();
            this.loadScores();
            this.setupFilteringAndSorting();
            this.updateOverview();
            this.initializeFiltering(); 
        } catch (error) {
            console.error("Błąd podczas inicjalizacji ScoreDisplay:", error);
            this.notificationManager.show('Wystąpił błąd podczas ładowania danych.', 'error');
        }
    }

    initializeFiltering() {
        // Tutaj możesz dodać logikę do inicjalizacji filtrów
        const filterForm = document.getElementById('filter-form');
        const sortSelect = document.getElementById('sort-select');
    
        if (filterForm) {
            filterForm.reset(); // Resetuje formularz filtrów
        }
    
        if (sortSelect) {
            sortSelect.selectedIndex = 0; // Ustawia domyślną opcję sortowania
        }
    }
    setupFilteringAndSorting() {
        const filterForm = document.getElementById('filter-form');
        const sortSelect = document.getElementById('sort-select');
    
        if (filterForm) {
            filterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const filters = {
                    exerciseType: filterForm['filter-exercise'].value,
                    dateFrom: filterForm['filter-date-from'].value,
                    dateTo: filterForm['filter-date-to'].value
                };
                const filteredScores = await this.scoreService.getFilteredScores(filters);
                this.displayScores(filteredScores);
            });
        } else {
            console.warn('Element filter-form not found');
        }
    
        if (sortSelect) {
            sortSelect.addEventListener('change', async () => {
                const [sortBy, sortOrder] = sortSelect.value.split('-');
                const scores = await this.scoreService.loadScores();
                const sortedScores = this.scoreService.sortScores(scores, sortBy, sortOrder);
                this.displayScores(sortedScores);
            });
        } else {
            console.warn('Element sort-select not found');
        }
    }

    initializeScoreFormElements() {
        console.log("initializeElements called");
        this.scoreForm = document.getElementById('score-form');
        console.log("Score form:", this.scoreForm); // Sprawdź, czy element został znaleziony
    
        if (this.scoreForm) {
            // Upewnij się, że nie rejestrujesz zdarzenia wielokrotnie
            if (!this.scoreFormListenerAdded) {
                const handleScoreSubmitBound = this.handleScoreSubmit.bind(this);
                this.scoreForm.removeEventListener('submit', handleScoreSubmitBound);
                this.scoreForm.addEventListener('submit', handleScoreSubmitBound);
                this.scoreFormListenerAdded = true;
                console.log("Event listener added for scoreForm");
            } else {
                console.log("Event listener already added for scoreForm");
            }
        } else {
            console.error("Score form not found in DOM");
        }
    }
    async loadExercises() {
        if (!this.exerciseService) {
            console.error('ExerciseService is not initialized');
            return; // Zatrzymaj wykonanie, jeśli exerciseService jest niezainicjalizowane
        }
        try {
            const user = await this.authService.getCurrentUser ();
            if (!user) throw new Error('Musisz być zalogowany, aby wczytać ćwiczenia');
            const exercises = await this.exerciseService.getExercises(user.uid);
            
            // Sortuj ćwiczenia alfabetycznie od A do Z
            exercises.sort((a, b) => a.name.localeCompare(b.name));
    
            const exerciseSelect = this.scoreForm['exercise-type'];
            exerciseSelect.innerHTML = ''; // Wyczyść istniejące opcje
    
            exercises.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name; // Zakładam, że masz pole 'name' w ćwiczeniach
                option.textContent = exercise.name;
                exerciseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Błąd podczas ładowania ćwiczeń:', error);
            this.notificationManager.show('Błąd podczas ładowania ćwiczeń: ' + error.message, 'error');
        }
    }
    
    async handleScoreSubmit(e) {
        console.log("handleScoreSubmit called");
        e.preventDefault();
        if (this.isSubmitting) {
            console.log("Form is already submitting, preventing double submission.");
            return; // Zablokuj ponowne wysyłanie
        }
        
        this.isSubmitting = true; // Ustaw flagę na true
    
        const exerciseType = this.scoreForm['exercise-type'].value;
        const weight = parseFloat(this.scoreForm['weight'].value);
        const reps = parseInt(this.scoreForm['reps'].value);
    
        try {
            const user = await this.authService.getCurrentUser ();
            if (!user) throw new Error('Musisz być zalogowany aby dodać wynik');
            
            await this.scoreService.addScore(exerciseType, weight, reps);
            this.scoreForm.reset();
            await this.loadScores();
            this.updateOverview();
            await this.statisticsDisplay.updateStatistics();
            this.isSubmitting = false; // Zresetuj flagę po zakończeniu
        } catch (error) {
            console.error("Error adding score:", error);
            alert(error.message);
        } finally {
            this.isSubmitting = false; // Zresetuj flagę po zakończeniu
            console.log("Score submission finished.");
        }
    }
    async loadScores() {
        console.log("ScoreDisplay: Rozpoczęto ładowanie wyników");
        try {
            const scores = await this.scoreService.loadScores();
            console.log("ScoreDisplay: Załadowane wyniki:", scores);
            this.displayScores(scores);
        } catch (error) {
            console.error("ScoreDisplay: Błąd podczas ładowania wyników:", error);
            this.notificationManager.show('Wystąpił błąd podczas ładowania wyników.', 'error');
        }
    }
    async handleDeleteScore(scoreId) {
        console.log('handleDeleteScore: Rozpoczęto usuwanie wyniku');
        const dialog = document.getElementById('custom-confirm-dialog');
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');

        dialog.classList.remove('hidden');

        return new Promise((resolve) => {
            const handleConfirm = async () => {
                console.log('handleDeleteScore: Potwierdzono usunięcie wyniku');
                dialog.classList.add('hidden');
                try {
                    await this.scoreService.deleteScore(scoreId);
                    console.log('handleDeleteScore: Wynik został usunięty');
                    await this.loadScores();
                    console.log('handleDeleteScore: Załadowano wyniki po usunięciu');
                    if (this.notificationManager) {
                        this.notificationManager.show('Wynik został pomyślnie usunięty.', 'success');
                    }
                    this.updateOverview(); 
                    await this.statisticsDisplay.updateStatistics(); // Zaktualizuj statystyki po dodaniu wyniku
                } catch (error) {
                    console.error('handleDeleteScore: Błąd podczas usuwania wyniku:', error);
                    if (this.notificationManager) {
                        this.notificationManager.show('Wystąpił błąd podczas usuwania wyniku.', 'error');
                    }
                }
                cleanup();
                resolve();
            };

            const handleCancel = () => {
                console.log('handleDeleteScore: Anulowano usunięcie wyniku');
                dialog.classList.add('hidden');
                cleanup();
                resolve();
            };

            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
        });
    }

    displayScores(scores) {
        console.log('displayScores: Rozpoczęto wyświetlanie wyników');
        if (!this.scoresList) return;
        this.scoresList.innerHTML = '';
        
        // Grupa wyników według daty
        const groupedScores = scores.reduce((acc, score) => {
            const date = new Date(score.timestamp);
            const dateString = date.toLocaleDateString();
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
            if (!acc[dateString]) {
                acc[dateString] = [];
            }
            acc[dateString].push({ ...score, time: timeString });
            return acc;
        }, {});
        console.log('displayScores: Zgrupowane wyniki:', groupedScores);
        
        // Sortuj daty od najnowszej do najstarszej
        const sortedDates = Object.keys(groupedScores).sort((a, b) => {
            return new Date(b) - new Date(a);
        });
        console.log('displayScores: Posortowane daty:', sortedDates);
        
        // Wyświetl wyniki zgrupowane według daty
        for (const date of sortedDates) {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date;
            this.scoresList.appendChild(dateHeader);
        
            // Sortuj wyniki według godziny (od najnowszej do najstarszej)
            const sortedScores = groupedScores[date].sort((a, b) => {
                return b.timestamp - a.timestamp;
            });
            console.log('displayScores: Posortowane wyniki:', sortedScores);
        
            sortedScores.forEach(score => {
                const li = document.createElement('li');
                
                // Kontener na treść wyniku
                const scoreContent = document.createElement('span');
                scoreContent.textContent = `${score.exerciseType}: ${score.weight}kg x ${score.reps} reps (dodano o ${score.time})`;
                li.appendChild(scoreContent);
        
                // Przycisk usuwania
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Usuń';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => this.handleDeleteScore(score.id));
                li.appendChild(deleteButton);
        
                this.scoresList.appendChild(li);
            });
        }
        console.log('displayScores: Zakończono wyświetlanie wyników');
    }
    updateStatistics() {
        console.log('updateStatistics: Rozpoczęto aktualizację statystyk');
        this.scoreService.loadScores().then(scores => {
            console.log('updateStatistics: Załadowane wyniki:', scores);
            const totalScores = scores.length;
            const totalWeight = scores.reduce((acc, score) => acc + score.weight, 0);
            const averageWeight = totalScores > 0 ? (totalWeight / totalScores).toFixed(2) : 0;
            
            console.log('updateStatistics: Obliczono statystyki:', totalScores, totalWeight, averageWeight);
            
            // Sprawdź, czy elementy istnieją przed próbą ustawienia ich wartości
            const totalScoresElement = document.getElementById('total-scores');
            const averageWeightElement = document.getElementById('average-weight');
            
            if (totalScoresElement) {
                totalScoresElement.textContent = totalScores;
                console.log('updateStatistics: Ustawiono liczbę wyników:', totalScores);
            } else {
                console.warn('updateStatistics: Element total-scores nie został znaleziony');
            }
            
            if (averageWeightElement) {
                averageWeightElement.textContent = averageWeight;
                console.log('updateStatistics: Ustawiono średnią wagę:', averageWeight);
            } else {
                console.warn('updateStatistics: Element average-weight nie został znaleziony');
            }
            console.log('updateStatistics: Zakończono aktualizację statystyk');
        }).catch(error => {
            console.error('updateStatistics: Błąd podczas aktualizacji statystyk:', error);
        });
    }
    updateOverview() {
        console.log('updateOverview: Rozpoczęto aktualizację przeglądu');
        this.scoreService.loadScores().then(scores => {
            console.log('updateOverview: Załadowane wyniki:', scores);
            // Sortuj wyniki od najnowszego do najstarszego
            const sortedScores = scores.sort((a, b) => b.timestamp - a.timestamp);
            console.log('updateOverview: Posortowane wyniki:', sortedScores);

            // Ostatni trening
            if (sortedScores.length > 0) {
                const lastWorkout = sortedScores[0];
                console.log('updateOverview: Ostatni trening:', lastWorkout);
                document.getElementById('last-workout-date').textContent = new Date(lastWorkout.timestamp).toLocaleDateString();
                document.getElementById('last-workout-details').textContent = `${lastWorkout.exerciseType}: ${lastWorkout.weight}kg x ${lastWorkout.reps}`;
            } else {
                console.log('updateOverview: Brak treningów');
                document.getElementById('last-workout-date').textContent = 'Brak treningów';
                document.getElementById('last-workout-details').textContent = '';
            }

            // Liczba treningów
            console.log('updateOverview: Liczba treningów:', sortedScores.length);
            document.getElementById('total-workouts').textContent = sortedScores.length;

            // Ulubione ćwiczenie
            const exerciseCounts = {};
            sortedScores.forEach(score => {
                exerciseCounts[score.exerciseType] = (exerciseCounts[score.exerciseType] || 0) + 1;
            });
            console.log('updateOverview: Liczba ćwiczeń:', exerciseCounts);
            const favoriteExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];
            console.log('updateOverview: Ulubione ćwiczenie:', favoriteExercise);
            document.getElementById('favorite-exercise').textContent = favoriteExercise ? favoriteExercise[0] : 'Brak danych';

            // Ostatnie treningi - tylko 5 ostatnich
            const recentWorkoutsList = document.getElementById('recent-workouts-list');
            recentWorkoutsList.innerHTML = '';
            sortedScores.slice(0, 5).forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${new Date(score.timestamp).toLocaleDateString()} - ${score.exerciseType}: ${score.weight}kg x ${score.reps}`;
                recentWorkoutsList.appendChild(li);
            });
            console.log('updateOverview: Zaktualizowano przegląd');
        }).catch(error => {
            console.error('updateOverview: Błąd podczas aktualizacji przeglądu:', error);
        });
    }
}