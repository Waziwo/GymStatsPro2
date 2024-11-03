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
        this.loginButton.addEventListener('click', () => {
            this.landingPage.classList.add('hidden');
            this.authSection.classList.remove('hidden');
        });

        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form-container').classList.add('hidden');
            document.getElementById('register-form-container').classList.remove('hidden');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form-container').classList.add('hidden');
            document.getElementById('login-form-container').classList.remove('hidden');
        });
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

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});