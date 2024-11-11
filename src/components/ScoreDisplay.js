import { StatisticsDisplay } from './StatisticsDisplay.js';

export class ScoreDisplay {
    constructor(scoreService, authService, notificationManager) {
        this.scoreService = scoreService;
        this.authService = authService;
        this.notificationManager = notificationManager;
        this.statisticsDisplay = new StatisticsDisplay(scoreService);
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            console.log("Inicjalizacja ScoreDisplay");
            const user = await this.authService.getCurrentUser();
            if (!user) {
                console.log("Użytkownik nie jest zalogowany");
                return;
            }
            await this.updateOverview();
            this.setupEventListeners();
            this.initialized = true;
            console.log("Zakończono inicjalizację ScoreDisplay");
        } catch (error) {
            console.error("Błąd podczas inicjalizacji ScoreDisplay:", error);
            this.notificationManager.show('Wystąpił błąd podczas inicjalizacji wyświetlania wyników', 'error');
        }
    }
    formatWorkoutDetails(workout) {
        return `${this.translateExerciseType(workout.exerciseType)}: ${workout.weight}kg × ${workout.reps}`;
    }
    setupEventListeners() {
        // Tutaj dodaj nasłuchiwanie na zdarzenia formularza i innych elementów
        const scoreForm = document.getElementById('score-form');
        if (scoreForm) {
            scoreForm.addEventListener('submit', (e) => this.handleScoreSubmit(e));
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
                await this.applyFiltersAndSort();
            });
        }
    
        if (sortSelect) {
            sortSelect.addEventListener('change', async () => {
                await this.applyFiltersAndSort();
            });
        }
    }
    async applyFiltersAndSort() {
        try {
            const filterForm = document.getElementById('filter-form');
            const sortSelect = document.getElementById('sort-select');
            let scores = await this.scoreService.loadScores();
    
            // Zastosuj filtry
            if (filterForm) {
                const filters = {
                    exerciseType: filterForm['filter-exercise'].value,
                    dateFrom: filterForm['filter-date-from'].value,
                    dateTo: filterForm['filter-date-to'].value
                };
    
                if (filters.exerciseType || filters.dateFrom || filters.dateTo) {
                    scores = await this.scoreService.getFilteredScores(filters);
                }
            }
    
            // Zastosuj sortowanie
            if (sortSelect) {
                scores = this.sortScores(scores, sortSelect.value);
            }
    
            // Wyświetl wyniki
            this.displayScores(scores);
            
        } catch (error) {
            console.error('Error applying filters and sort:', error);
            this.notificationManager.show('Błąd podczas filtrowania i sortowania wyników', 'error');
        }
    }

    sortScores(scores, sortOption) {
        return [...scores].sort((a, b) => {
            const aTimestamp = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
            const bTimestamp = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
            
            switch (sortOption) {
                case 'date-desc':
                    return bTimestamp - aTimestamp;
                case 'date-asc':
                    return aTimestamp - bTimestamp;
                case 'weight-desc':
                    return b.weight - a.weight;
                case 'weight-asc':
                    return a.weight - b.weight;
                default:
                    return 0;
            }
        });
    }

    initializeElements() {
        if (this.initialized) return;
        this.initialized = true;
    
        this.scoreForm = document.getElementById('score-form');
        this.scoresList = document.getElementById('scores-list');
        if (this.scoreForm) {
            this.setupEventListeners();
        }
    }

    async handleScoreSubmit(e) {
        e.preventDefault();
        console.log("Obsługa formularza dodawania wyniku");
        
        try {
            const exerciseType = document.getElementById('exercise-type').value;
            const weight = parseFloat(document.getElementById('weight').value);
            const reps = parseInt(document.getElementById('reps').value);
    
            // Sprawdzenie czy dane są poprawne
            if (!exerciseType || isNaN(weight) || isNaN(reps)) {
                throw new Error('Proszę wypełnić wszystkie pola poprawnie');
            }
    
            await this.scoreService.addScore(exerciseType, weight, reps);
            document.getElementById('score-form').reset();
            await this.loadScores(); // Odśwież wyniki
            this.updateOverview(); // Dodane wywołanie
            this.notificationManager.show('Wynik został pomyślnie dodany.', 'success');
            
            // Odśwież statystyki i przegląd
            if (this.statisticsDisplay) {
                this.statisticsDisplay.init();
            }
        } catch (error) {
            console.error("Błąd podczas dodawania wyniku:", error);
            this.notificationManager.show(error.message, 'error');
        }
    }

    async loadScores() {
        try {
            console.log("[ScoreDisplay] Ładowanie wyników");
            const scores = await this.scoreService.loadScores();
            console.log("[ScoreDisplay] Załadowane wyniki:", scores);
            this.displayScores(scores);
        } catch (error) {
            console.error("[ScoreDisplay] Błąd podczas ładowania wyników:", error);
            this.notificationManager.show('Błąd podczas ładowania wyników', 'error');
        }
    }

    async handleDeleteScore(scoreId) {
        const dialog = document.getElementById('custom-confirm-dialog');
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
    
        dialog.classList.remove('hidden');
    
        return new Promise((resolve) => {
            const handleConfirm = async () => {
                dialog.classList.add('hidden');
                try {
                    await this.scoreService.deleteScore(scoreId);
                    await this.loadScores();
                    this.updateOverview(); // Dodane wywołanie
                    if (this.notificationManager) {
                        this.notificationManager.show('Wynik został pomyślnie usunięty.', 'success');
                    }
                } catch (error) {
                    console.error('Error deleting score:', error);
                    if (this.notificationManager) {
                        this.notificationManager.show('Wystąpił błąd podczas usuwania wyniku.', 'error');
                    }
                }
                cleanup();
                resolve();
            };
    
            const handleCancel = () => {
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
        const scoresContainer = document.querySelector('.scores-list-container');
        if (!scoresContainer) {
            console.error("Element scores-list-container nie został znaleziony!");
            return;
        }
        console.log("Wyświetlanie wyników:", scores);
        scoresContainer.innerHTML = '';
        
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

        // Sortuj daty od najnowszej do najstarszej
        const sortedDates = Object.keys(groupedScores).sort((a, b) => {
            return new Date(b) - new Date(a);
        });

        // Wyświetl wyniki zgrupowane według daty
        for (const date of sortedDates) {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = date;
            scoresContainer.appendChild(dateHeader);

            // Sortuj wyniki według godziny (od najnowszej do najstarszej)
            const sortedScores = groupedScores[date].sort((a, b) => {
                return b.timestamp - a.timestamp;
            });

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

                scoresContainer.appendChild(li);
            });
        }
    }
    async updateOverview() {
        try {
            console.log("Rozpoczęcie aktualizacji przeglądu");
            const scores = await this.scoreService.loadScores(); // Czekamy na załadowanie wyników
            
            // Sortuj wyniki od najnowszego do najstarszego
            const sortedScores = scores.sort((a, b) => b.timestamp - a.timestamp);

            // Aktualizacja ostatniego treningu
            const lastWorkoutDate = document.getElementById('last-workout-date');
            const lastWorkoutDetails = document.getElementById('last-workout-details');
            
            if (sortedScores.length > 0) {
                const lastWorkout = sortedScores[0];
                lastWorkoutDate.textContent = new Date(lastWorkout.timestamp).toLocaleDateString();
                lastWorkoutDetails.textContent = this.formatWorkoutDetails(lastWorkout);
            } else {
                lastWorkoutDate.textContent = 'Brak treningów';
                lastWorkoutDetails.textContent = 'Dodaj swój pierwszy trening!';
            }

            // Aktualizacja liczby treningów
            const totalWorkouts = document.getElementById('total-workouts');
            totalWorkouts.textContent = sortedScores.length.toString();

            // Aktualizacja ulubionych ćwiczeń
            const exerciseCounts = {};
            sortedScores.forEach(score => {
                exerciseCounts[score.exerciseType] = (exerciseCounts[score.exerciseType] || 0) + 1;
            });

            const favoriteExercise = document.getElementById('favorite-exercise');
            if (Object.keys(exerciseCounts).length > 0) {
                const mostCommon = Object.entries(exerciseCounts)
                    .sort((a, b) => b[1] - a[1])[0];
                favoriteExercise.textContent = this.translateExerciseType(mostCommon[0]);
            } else {
                favoriteExercise.textContent = 'Brak danych';
            }

            // Aktualizacja listy ostatnich treningów
            const recentWorkoutsList = document.getElementById('recent-workouts-list');
            recentWorkoutsList.innerHTML = ''; // Wyczyść listę

            if (sortedScores.length > 0) {
                sortedScores.slice(0, 5).forEach(score => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="workout-date">${new Date(score.timestamp).toLocaleDateString()}</span>
                        <span class="workout-type">${this.translateExerciseType(score.exerciseType)}</span>
                        <span class="workout-details">${score.weight}kg × ${score.reps}</span>
                    `;
                    recentWorkoutsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'Brak historii treningów';
                recentWorkoutsList.appendChild(li);
            }

            console.log("Zakończono aktualizację przeglądu");
        } catch (error) {
            console.error('Błąd podczas aktualizacji przeglądu:', error);
            this.notificationManager.show('Wystąpił błąd podczas ładowania danych przeglądu', 'error');
        }
    }

    translateExerciseType(exerciseType) {
        const translations = {
            'bench-press': 'Wyciskanie sztangi',
            'squat': 'Przysiad',
            'deadlift': 'Martwy ciąg'
        };
        return translations[exerciseType] || exerciseType;
    }
}    