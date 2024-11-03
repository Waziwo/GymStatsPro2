import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { firebaseConfig } from './config/firebase-config.js';
import { AuthService } from './auth/auth.js';
import { ScoreService } from './scores/scores.js';
import { AuthForms } from '../components/auth-forms.js';
import { ScoreDisplay } from '../components/score-display.js';

class App {
    constructor() {
        this.initializeFirebase();
        this.initializeServices();
        this.initializeComponents();
    }

    initializeFirebase() {
        const app = initializeApp(firebaseConfig);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }

    initializeServices() {
        this.authService = new AuthService(this.auth);
        this.scoreService = new ScoreService(this.db);
    }

    initializeComponents() {
        this.authForms = new AuthForms(this.authService);
        this.scoreDisplay = new ScoreDisplay(this.scoreService);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});