import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { AuthService } from "./auth/auth.js";
import { ScoreService } from "./scores/scores.js";
import { UserService } from "./services/user-service.js";
import { AuthForms } from "../components/auth-forms.js";
import { ScoreDisplay } from "../components/score-display.js";

class App {
    constructor() {
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);

        // Initialize services
        this.authService = new AuthService();
        this.scoreService = new ScoreService();
        this.userService = new UserService();

        // Initialize components
        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService);
        this.authForms = new AuthForms(this.authService, this.scoreService, this.userService);

        // DOM elements
        this.initializeElements();
        this.setupEventListeners();
        this.setupAuthStateListener();
    }

    initializeElements() {
        this.loginButton = document.getElementById('login-button');
        this.landingPage = document.getElementById('landing-page');
        this.authSection = document.getElementById('auth-section');
        this.userDashboard = document.getElementById('user-dashboard');
        this.featuresSection = document.getElementById('features');
        this.aboutSection = document.getElementById('about');
        this.getStartedBtn = document.getElementById('get-started-btn');
    }

    setupEventListeners() {
        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => {
                this.landingPage.classList.add('hidden');
                this.authSection.classList.remove('hidden');
                this.featuresSection.classList.add('hidden');
                this.aboutSection.classList.add('hidden');
            });
        }

        if (this.getStartedBtn) {
            this.getStartedBtn.addEventListener('click', () => {
                this.landingPage.classList.add('hidden');
                this.authSection.classList.remove('hidden');
                this.featuresSection.classList.add('hidden');
                this.aboutSection.classList.add('hidden');
            });
        }

        // Dodanie obsługi linków nawigacyjnych
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
                // Użytkownik zalogowany
                try {
                    const userData = await this.userService.getUserData(user.uid);
                    this.landingPage.classList.add('hidden');
                    this.authSection.classList.add('hidden');
                    this.userDashboard.classList.remove('hidden');
                    this.featuresSection.classList.add('hidden');
                    this.aboutSection.classList.add('hidden');
                    
                    // Ukryj przyciski nawigacyjne dla sekcji Funkcje i O nas
                    const navLinks = document.querySelectorAll('.nav-link');
                    navLinks.forEach(link => {
                        link.style.display = 'none';
                    });

                    if (this.scoreDisplay) {
                        this.scoreDisplay.loadScores();
                    }

                    // Aktualizuj informacje o użytkowniku
                    const userInfoElement = document.getElementById('user-info');
                    if (userInfoElement) {
                        userInfoElement.textContent = `Witaj, ${userData?.nickname || user.email}!`;
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                // Użytkownik wylogowany
                this.userDashboard.classList.add('hidden');
                this.landingPage.classList.remove('hidden');
                this.featuresSection.classList.remove('hidden');
                this.aboutSection.classList.remove('hidden');
                
                // Pokaż przyciski nawigacyjne
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.style.display = 'block';
                });
            }
        });
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});