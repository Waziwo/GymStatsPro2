export class AuthForms {
    constructor(authService, scoreService) {
        this.authService = authService;
        this.scoreService = scoreService;
        this.initializeForms();
        this.setupAuthStateListener();
    }

    initializeForms() {
        // Pobieranie elementów DOM
        this.registerForm = document.getElementById('register-form');
        this.loginForm = document.getElementById('login-form');
        this.logoutButton = document.getElementById('logout-button');
        this.userInfo = document.getElementById('user-info');
        this.userEmail = document.getElementById('user-email');
        this.scoreSection = document.getElementById('score-section');
        this.showRegisterLink = document.getElementById('show-register');
        this.showLoginLink = document.getElementById('show-login');
        this.loginFormContainer = document.getElementById('login-form-container');
        this.registerFormContainer = document.getElementById('register-form-container');

        if (this.showRegisterLink && this.showLoginLink) {
            this.setupFormToggle();
        }

        this.setupEventListeners();
    }

    setupFormToggle() {
        if (this.showRegisterLink) {
            this.showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.loginFormContainer) this.loginFormContainer.classList.add('hidden');
                if (this.registerFormContainer) this.registerFormContainer.classList.remove('hidden');
            });
        }

        if (this.showLoginLink) {
            this.showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.registerFormContainer) this.registerFormContainer.classList.add('hidden');
                if (this.loginFormContainer) this.loginFormContainer.classList.remove('hidden');
            });
        }
    }

    setupEventListeners() {
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    setupAuthStateListener() {
        this.authService.onAuthStateChanged((user) => {
            if (user) {
                this.showUserInfo(user.email);
            } else {
                this.hideUserInfo();
            }
        });
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = this.registerForm['register-email'].value;
        const password = this.registerForm['register-password'].value;

        try {
            await this.authService.register(email, password);
            this.registerForm.reset();
            alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
            if (this.registerFormContainer) this.registerFormContainer.classList.add('hidden');
            if (this.loginFormContainer) this.loginFormContainer.classList.remove('hidden');
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
            this.loginForm.reset();
        } catch (error) {
            alert(error.message);
         }
    }

    async handleLogout() {
        try {
            await this.authService.logout();
        } catch (error) {
            alert(error.message);
        }
    }

    showUserInfo(email) {
        if (this.userInfo) this.userInfo.classList.remove('hidden');
        if (this.userEmail) this.userEmail.textContent = email;
        if (this.scoreSection) this.scoreSection.classList.remove('hidden');
    }

    hideUserInfo() {
        if (this.userInfo) this.userInfo.classList.add('hidden');
        if (this.scoreSection) this.scoreSection.classList.add('hidden');
    }
}