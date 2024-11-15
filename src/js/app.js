// src/js/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { AuthService } from "./auth/auth.js";
import { ScoreService } from "./scores/scores.js";
import { UserService } from "./services/user-service.js";
import { AuthForms } from '../components/auth-forms.js';
import { ScoreDisplay } from '../components/score-display.js';
import { NotificationManager } from './notifications.js'; // Importuj NotificationManager
import { ActivityLogger } from './utils/activity-logger.js';
import { StatisticsDisplay } from '../components/StatisticsDisplay.js';
import { initNavigation, manageSectionsVisibility } from './utils/navigation.js';
import { ExerciseService } from './exercises/ExerciseService.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class App {
    constructor() {
        try {
            // Initialize Firebase (if not already initialized)
            if (!window.firebaseApp) {
                this.app = initializeApp(firebaseConfig);
            } else {
                this.app = window.firebaseApp;
            }
            
            const auth = getAuth(this.app);

            // Initialize services
            this.initializeServices();
            
            // // Initialize components
            this.initializeComponents();

            // Setup event listeners and auth state
            this.initializeElementsApp();
            this.setupEventListenersApp();
            this.setupAuthStateListener();
            this.setupDashboardNavigation(); // Dodana nowa metoda

        } catch (error) {
            console.error("Błąd podczas inicjalizacji aplikacji:", error);
        }
    }

    initializeServices() {
        this.notificationManager = new NotificationManager();
        this.authService = new AuthService();
        this.scoreService = new ScoreService(this.notificationManager, db); // Przekaż instancję Firestore
        this.userService = new UserService();
        this.activityLogger = new ActivityLogger();
        this.exerciseService = new ExerciseService(this.notificationManager); // Inicjalizacja ExerciseService
        
        // Teraz możesz utworzyć ScoreDisplay
        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService, this.notificationManager, this.exerciseService);
    }

    initializeComponents() {
        this.statisticsDisplay = new StatisticsDisplay(this.scoreService);
        this.authForms = new AuthForms(
            this.authService, 
            this.scoreService, 
            this.userService, 
            this.notificationManager,
            this.activityLogger
        );
    }

    initializeElementsApp() {
        this.loginButton = document.getElementById('login-button');
        this.landingPage = document.getElementById('landing-page');
        this.authSection = document.getElementById('auth-section');
        this.userDashboard = document.getElementById('user-dashboard');
        this.featuresSection = document.getElementById('features');
        this.aboutSection = document.getElementById('about');
        this.getStartedBtn = document.getElementById('get-started-btn');
        this.dashboardLink = document.getElementById('dashboard-link');
    
        // Dodane nowe elementy
        this.dashboardNavLinks = document.querySelectorAll('.dashboard-nav a');
        this.dashboardSections = document.querySelectorAll('.dashboard-section');
    
        // Elementy do dodawania ćwiczeń
        this.addExerciseButton = document.getElementById('add-exercise-button');
        this.addExerciseDialog = document.getElementById('add-exercise-dialog');
        this.addExerciseForm = document.getElementById('add-exercise-form');
        this.cancelAddExerciseButton = document.getElementById('cancel-add-exercise');
    
        // Inicjalizacja nasłuchiwaczy zdarzeń
        this.setupAddExerciseListeners();
    }
    setupAddExerciseListeners() {
        this.addExerciseButton.addEventListener('click', () => {
            this.addExerciseDialog.classList.remove('hidden');
        });
    
        this.cancelAddExerciseButton.addEventListener('click', () => {
            this.addExerciseDialog.classList.add('hidden');
        });
    
        this.addExerciseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const exerciseName = document.getElementById('exercise-name').value;
            const exerciseDescription = document.getElementById('exercise-description').value;
            const hasWeight = document.getElementById('weight-checkbox').checked;
            const hasReps = document.getElementById('reps-checkbox').checked;
            const hasTime = document.getElementById('time-checkbox').checked;
    
            // Zapisz ćwiczenie w Firebase
            try {
                const user = await this.authService.getCurrentUser (); // Upewnij się, że masz metodę do pobrania aktualnego użytkownika
                if (!user) throw new Error('Musisz być zalogowany, aby dodać ćwiczenie');
    
                const exerciseData = {
                    userId: user.uid,
                    name: exerciseName,
                    description: exerciseDescription,
                    options: {
                        weight: hasWeight,
                        reps: hasReps,
                        time: hasTime
                    },
                    timestamp: Date.now()
                };
    
                await this.exerciseService.addExercise(exerciseData); // Upewnij się, że masz metodę do dodawania ćwiczeń w ExerciseService
    
                // Resetuj formularz i ukryj dialog
                this.addExerciseForm.reset();
                this.addExerciseDialog.classList.add('hidden');
                this.notificationManager.show('Ćwiczenie dodane pomyślnie!', 'success'); // Pokaż powiadomienie
                this.loadExercises();
            } catch (error) {
                console.error('Błąd podczas dodawania ćwiczenia:', error);
                this.notificationManager.show('Błąd podczas dodawania ćwiczenia: ' + error.message, 'error');
            }
        });
    }
    async loadExercises() {
        const exercisesList = document.getElementById('exercises-list');
        if (exercisesList) {
            try {
                const user = await this.authService.getCurrentUser ();
                if (!user) {
                    console.error('Użytkownik nie jest zalogowany.');
                    exercisesList.innerHTML = '<li>Musisz być zalogowany, aby zobaczyć ćwiczenia.</li>';
                    return;
                }
    
                const exercises = await this.exerciseService.getExercises(user.uid);
                if (Array.isArray(exercises)) {
                    // Sortuj ćwiczenia alfabetycznie od A do Z
                    exercises.sort((a, b) => a.name.localeCompare(b.name));
    
                    exercisesList.innerHTML = exercises.map(exercise => `
                        <li>
                            <div class="exercise-content">
                                <strong>${exercise.name}</strong>
                                <span>${exercise.description}</span>
                            </div>
                            <div class="button-group">
                                <button class="edit-button" data-id="${exercise.id}">Edytuj</button>
                                <button class="delete-button" data-id="${exercise.id}">Usuń</button>
                            </div>
                        </li>
                    `).join('');
    
                    // Dodaj nasłuchiwacze zdarzeń do przycisków edycji
                    exercisesList.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', () => this.handleEditExercise(button.dataset.id));
                    });
    
                    exercisesList.querySelectorAll('.delete-button').forEach(button => {
                        button.addEventListener('click', () => this.handleDeleteExercise(button.dataset.id));
                    });
                } else {
                    console.error('Oczekiwano tablicy ćwiczeń, ale otrzymano:', exercises);
                    exercisesList.innerHTML = '<li>Brak ćwiczeń do wyświetlenia.</li>';
                }
            } catch (error) {
                console.error('Błąd podczas ładowania ćwiczeń:', error);
                exercisesList.innerHTML = '<li>Wystąpił błąd podczas ładowania ćwiczeń.</li>';
            }
        }
    }

    async handleEditExercise(exerciseId) {
        const exercise = await this.exerciseService.getExercise(exerciseId); // Pobierz dane ćwiczenia
        if (exercise) {
            // Wypełnij formularz danymi ćwiczenia
            document.getElementById('edit-exercise-name').value = exercise.name;
            document.getElementById('edit-exercise-description').value = exercise.description;
            document.getElementById('edit-weight-checkbox').checked = exercise.options.weight;
            document.getElementById('edit-reps-checkbox').checked = exercise.options.reps;
            document.getElementById('edit-time-checkbox').checked = exercise.options.time;

            // Pokaż dialog edytowania
            document.getElementById('edit-exercise-dialog').classList.remove('hidden');

            // Obsługa wysłania formularza
            const editExerciseForm = document.getElementById('edit-exercise-form');
            editExerciseForm.onsubmit = async (e) => {
                e.preventDefault();
                const updatedData = {
                    name: document.getElementById('edit-exercise-name').value,
                    description: document.getElementById('edit-exercise-description').value,
                    options: {
                        weight: document.getElementById('edit-weight-checkbox').checked,
                        reps: document.getElementById('edit-reps-checkbox').checked,
                        time: document.getElementById('edit-time-checkbox').checked
                    }
                };
                await this.exerciseService.updateExercise(exerciseId, updatedData);
                this.loadExercises(); // Odśwież listę ćwiczeń
                document.getElementById('edit-exercise-dialog').classList.add('hidden'); // Ukryj dialog
            };

            // Obsługa anulowania
            document.getElementById('cancel-edit-exercise').onclick = () => {
                document.getElementById('edit-exercise-dialog').classList.add('hidden'); // Ukryj dialog
            };
        }
    }
    async handleDeleteExercise(exerciseId) {
        const confirmation = await this.showDeleteConfirmationDialog();
        if (confirmation) {
            try {
                await this.exerciseService.deleteExercise(exerciseId); // Upewnij się, że masz tę metodę w ExerciseService
                this.loadExercises(); // Odśwież listę ćwiczeń
            } catch (error) {
                console.error('Błąd podczas usuwania ćwiczenia:', error);
            }
        }
    }
    showDeleteConfirmationDialog() {
        return new Promise((resolve) => {
            const dialog = document.getElementById('custom-confirm-dialog-exercise');
            const confirmBtn = document.getElementById('confirm-delete-exercise');
            const cancelBtn = document.getElementById('cancel-delete-exercise');
    
            dialog.classList.remove('hidden');
    
            const handleConfirm = () => {
                dialog.classList.add('hidden');
                resolve(true);
            };
    
            const handleCancel = () => {
                dialog.classList.add('hidden');
                resolve(false);
            };
    
            confirmBtn.addEventListener('click', handleConfirm, { once: true });
            cancelBtn.addEventListener('click', handleCancel, { once: true });
        });
    }
    // Nowa metoda do obsługi nawigacji w dashboardzie
    setupDashboardNavigation() {
        this.dashboardNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Usuń klasę active ze wszystkich linków
                this.dashboardNavLinks.forEach(l => l.classList.remove('active'));
                
                // Dodaj klasę active do klikniętego linku
                link.classList.add('active');
                
                // Pobierz ID sekcji z atrybutu href
                const sectionId = link.getAttribute('href').substring(1);
                
                // Ukryj wszystkie sekcje
                this.dashboardSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Pokaż wybraną sekcję
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });

        // Domyślnie pokaż pierwszą sekcję
        if (this.dashboardNavLinks[0]) {
            this.dashboardNavLinks[0].classList.add('active');
            const firstSectionId = this.dashboardNavLinks[0].getAttribute('href').substring(1);
            const firstSection = document.getElementById(firstSectionId);
            if (firstSection) {
                firstSection.classList.add('active');
            }
        }
    }

    setupEventListenersApp() {
        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => this.showAuthSection());
        }

        if (this.getStartedBtn) {
            this.getStartedBtn.addEventListener('click', () => this.showAuthSection());
        }

        if (this.dashboardLink) {
            this.dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }

        this.setupNavLinks();
    }

    showAuthSection() {
        this.landingPage.classList.add('hidden');
        this.authSection.classList.remove('hidden');
        this.featuresSection.classList.add('hidden');
        this.aboutSection.classList.add('hidden');
        this.userDashboard.classList.add('hidden'); // Dodane
    }

    showDashboard() {
        this.landingPage.classList.add('hidden');
        this.userDashboard.classList.remove('hidden');
        this.authSection.classList.add('hidden'); // Dodane
        this.featuresSection.classList.add('hidden');
        this.aboutSection.classList.add('hidden');
    }

    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    async setupAuthStateListener() {
        this.authService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userData = await this.userService.getUserData(user.uid);
                    if (userData) {
                        if (!this.scoreDisplay) {
                            this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService, this.notificationManager, this.exerciseService);
                            await this.scoreDisplay.init();
                        } else {
                            console.log("ScoreDisplay already initialized");
                        }
                        this.updateNavigation(true);
                        this.statisticsDisplay.init();
                        this.updateUserInfo(userData, user.email);
    
                        // Wczytaj ćwiczenia po zalogowaniu
                        const exercises = await this.exerciseService.getExercises(user.uid);
                        this.displayExercises(exercises); // Wywołaj metodę do wyświetlania ćwiczeń
    
                        // Pokaż dashboard po zalogowaniu
                        this.landingPage.classList.add('hidden');
                        this.userDashboard.classList.remove('hidden');
                        this.authSection.classList.add('hidden');
                        manageSectionsVisibility(true, false); // Dodaj false jako drugi argument
                        this.loadExercises();

                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    this.notificationManager.show('Wystąpił błąd podczas pobierania danych użytkownika', 'error');
                }
            } else {
                this.scoreDisplay = null;
                this.updateNavigation(false);
                manageSectionsVisibility(false, true); // Dodaj true jako drugi argument
            }
        });
    }
    
    // Dodaj nową metodę do wyświetlania ćwiczeń
    displayExercises(exercises) {
        const exercisesList = document.getElementById('exercises-list');
        if (exercisesList) {
            exercisesList.innerHTML = exercises.map(exercise => `
                <li>
                    <strong>${exercise.name}</strong>: ${exercise.description}
                </li>
            `).join('');
        }
    }

    updateUserInfo(userData, email) {
        const userNicknameElement = document.getElementById('user-nickname');
        const userEmailElement = document.getElementById('user-email');
        if (userNicknameElement) {
            userNicknameElement.textContent = userData.nickname;
        }
        if (userEmailElement) {
            userEmailElement.textContent = email;
        }
    }

    updateNavigation(isLoggedIn) {
        if (isLoggedIn) {
            this.loginButton.classList.add('hidden');
            this.dashboardLink.classList.add('hidden');
            this.landingPage.classList.add('hidden');
            this.userDashboard.classList.remove('hidden');
            this.featuresSection.classList.add('hidden');
            this.aboutSection.classList.add('hidden');
            this.authSection.classList.add('hidden');
        } else {
            this.loginButton.classList.remove('hidden');
            this.dashboardLink.classList.add('hidden');
            this.userDashboard.classList.add('hidden');
            this.landingPage.classList.remove('hidden');
            this.featuresSection.classList.remove('hidden');
            this.aboutSection.classList.remove('hidden');
            this.authSection.classList.add('hidden');
            
            this.showNavLinks();
        }
    }

    showNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.display = 'block';
        });
    }
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    new App();
    initNavigation();
});
// Po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    // Obsługa kliknięcia w hamburger menu
    hamburgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active'); // Przełącz klasę active
    });
});