import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { firebaseConfig } from "./config/firebase-config.js";
import { AuthService } from "./auth/auth-service.js";
import { ScoreService } from "./scores/scores.js";
import { AuthForms } from "../components/auth-forms.js";
import { ScoreDisplay } from "../components/score-display.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const authService = new AuthService();
const scoreService = new ScoreService();

// Initialize components
const authForms = new AuthForms(authService, scoreService);
const scoreDisplay = new ScoreDisplay(scoreService, authService);

// DOM elements
const loginButton = document.getElementById('login-button');
const landingPage = document.getElementById('landing-page ');
const authSection = document.getElementById('auth-section');
const userDashboard = document.getElementById('user-dashboard');

// Event listeners
loginButton.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    authSection.classList.remove('hidden');
});

authService.onAuthStateChanged((user) => {
    if (user) {
        authSection.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        scoreDisplay.loadScores();
    } else {
        userDashboard.classList.add('hidden');
        authSection.classList.remove('hidden');
    }
});