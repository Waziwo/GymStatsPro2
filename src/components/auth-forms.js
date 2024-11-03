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
        const email = this.registerForm['register-email'].value;
        const password = this.registerForm['register-password'].value;

        try {
            await this.authService.register(email, password);
            alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
            this.registerForm.reset(); // Wyczyść formularz rejestracji
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = this.loginForm['login-email'].value;
        const password = this.loginForm['login-password'].value;

        try {
            await this.authService.login(email, password);
            document.getElementById('user-email').textContent = email;
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('score-section').style.display = 'block'; // Pokaż sekcję wyników
            this.loginForm.reset(); // Wyczyść formularz logowania
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogout() {
        await this.authService.logout();
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('score-section').style.display = 'none'; // Ukryj sekcję wyników
    }
}