import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from "./config/firebase-config.js";
import { AuthService } from "./auth/auth.js";
import { ScoreService } from "./scores/scores.js";
import { UserService } from "./services/user-service.js";
import { AuthForms } from '../components/auth-forms.js';
import { ScoreDisplay } from '../components/score-display.js';
import { NotificationManager } from './notifications.js';
import { ActivityLogger } from './utils/activity-logger.js';
import { StatisticsDisplay } from '../components/StatisticsDisplay.js';
import { initNavigation, manageSectionsVisibility } from './utils/navigation.js';

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
            
            // Initialize components
            this.initializeComponents();

            // Setup event listeners and auth state
            this.initializeElements();
            this.setupEventListeners();
            this.setupAuthStateListener();
            this.setupDashboardNavigation(); // Dodana nowa metoda

        } catch (error) {
            console.error("Błąd podczas inicjalizacji aplikacji:", error);
        }
    }

    initializeServices() {
        this.authService = new AuthService();
        this.scoreService = new ScoreService();
        this.userService = new UserService();
        this.notificationManager = new NotificationManager();
        this.activityLogger = new ActivityLogger();
    }

    initializeComponents() {
        this.statisticsDisplay = new StatisticsDisplay(this.scoreService);
        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService, this.notificationManager); // Dodaj notificationManager
        this.authForms = new AuthForms(
            this.authService, 
            this.scoreService, 
            this.userService, 
            this.notificationManager,
            this.activityLogger
        );
    }

    initializeElements() {
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

    setupEventListeners() {
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

    setupAuthStateListener() {
        this.authService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userData = await this.userService.getUserData(user.uid);
                    if (userData) {
                        this.updateNavigation(true);
                        this.statisticsDisplay.init();
                        this.updateUserInfo(userData, user.email);
                        // Pokaż dashboard po zalogowaniu
                        this.landingPage.classList.add('hidden');
                        this.userDashboard.classList.remove('hidden');
                        this.authSection.classList.add('hidden');
                        manageSectionsVisibility(true, false); // Dodaj false jako drugi argument
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    this.notificationManager.show('Wystąpił błąd podczas pobierania danych użytkownika', 'error');
                }
            } else {
                this.updateNavigation(false);
                manageSectionsVisibility(false, true); // Dodaj true jako drugi argument
            }
        });
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