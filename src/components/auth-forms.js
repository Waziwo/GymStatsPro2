export class AuthForms {
    constructor(authService) {
        this.authService = authService;
        this.initializeForms();
    }

    initializeForms() {
        this.registerForm = document.getElementById('register-form');
        this.loginForm = document.getElementById('login-form');
        this.logoutButton = document.getElementById('logout-button');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.registerForm.addEventListener('submit', this.handleRegister.bind(this));
        this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        this.logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }

    async handleRegister(e) {
        e.preventDefault();
        // Implementacja rejestracji
    }

    async handleLogin(e) {
        e.preventDefault();
        // Implementacja logowania
    }

    async handleLogout() {
        // Implementacja wylogowania
    }
}