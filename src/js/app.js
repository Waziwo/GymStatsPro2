import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { AuthService } from "./auth/auth.js";
import { ScoreService } from "./scores/scores.js";
import { AuthForms } from "../components/auth-forms.js";
import { ScoreDisplay } from "../components/score-display.js";

class App {
    constructor() {
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);

        // Initialize services
        this.authService = new AuthService();
        this.scoreService = new ScoreService();

        // Initialize components
        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService);
        this.authForms = new AuthForms(this.authService, this.scoreService);

        // DOM elements
        this.loginButton = document.getElementById('login-button');
        this.landingPage = document.getElementById('landing-page');
        this.authSection = document.getElementById('auth-section');
        this.userDashboard = document.getElementById('user-dashboard');

        this.setupEventListeners();
        this.setupAuthStateListener();
    }

    setupEventListeners() {
        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => {
                this.landingPage.classList.add('hidden');
                this.authSection.classList.remove('hidden');
            });
        }

        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');

        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                loginFormContainer.classList.add('hidden');
                registerFormContainer.classList.remove('hidden');
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerFormContainer.classList.add('hidden');
                loginFormContainer.classList.remove('hidden');
            });
        }
    }

    setupAuthStateListener() {
        this.authService.onAuthStateChanged((user) => {
            if (user) {
                this.landingPage.classList.add('hidden');
                this.authSection.classList.add('hidden');
                this.userDashboard.classList.remove('hidden');
                if (this.scoreDisplay) {
                    this.scoreDisplay.loadScores();
                }
            } else {
                this.userDashboard.classList.add('hidden');
                this.landingPage.classList.remove('hidden');
            }
        });
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});