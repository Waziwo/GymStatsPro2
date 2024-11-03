export class AuthForms {
    constructor(authService, scoreService) {
        this.authService = authService;
        this.scoreService = scoreService;
        this.initializeForms();
        this.setupAuthStateListener();
        this.initializeUserState();
    }

    async initializeUserState() {
        const user = await this.authService.getCurrentUser();
        if (user) {
            this.showUserInfo(user.email);
            this.scoreService.loadScores();
        } else {
            this.hideUserInfo();
        }
    }

    setupAuthStateListener() {
        this.authService.onAuthStateChanged((user) => {
            if (user) {
                this.showUserInfo(user.email);
                this.scoreService.loadScores();
            } else {
                this.hideUserInfo();
            }
        });
    }

    initializeForms() {
        this.registerForm = document.getElementById('register-form');
        this.loginForm = document.getElementById('login-form');
        this.logoutButton = document.getElementById('logout-button');
        this.userInfo = document.getElementById('user-info');
        this.userEmail = document.getElementById('user-email');
        this.scoreSection = document.getElementById('score-section');

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
            this.registerForm.reset();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = this.loginForm['login-email'].value;
        const password = this.loginForm['login-password'].value;

        try {
            const userCredential = await this.authService.login(email, password);
            this.showUserInfo(userCredential.user.email);
            this.loginForm.reset();
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogout() {
        try {
            await this.authService.logout();
            this.hideUserInfo();
        } catch (error) {
            alert(error.message);
        }
    }

    showUserInfo(email) {
        this.userEmail.textContent = email;
        this.userInfo.style.display = 'block';
        this.scoreSection.style.display = 'block';
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'none';
    }

    hideUserInfo() {
        this.userInfo.style.display = 'none';
        this.scoreSection.style.display = 'none';
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'block';
    }
}