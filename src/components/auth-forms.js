export class AuthForms {
    constructor(authService, scoreService, userService, notificationManager) {
        this.authService = authService;
        this.scoreService = scoreService;
        this.userService = userService;
        this.notificationManager = notificationManager;
        this.initializeForms();
        this.setupAuthStateListener();
    }

    initializeForms() {
        this.registerForm = document.getElementById('register-form');
        this.loginForm = document.getElementById('login-form');
        this.logoutButton = document.getElementById('logout-button');
        this.loginButton = document.getElementById('login-button');
        this.userInfo = document.getElementById('user-info');
        this.userEmail = document.getElementById('user-email');
        this.scoreSection = document.getElementById('score-section');
        this.showRegisterLink = document.getElementById('show-register');
        this.showLoginLink = document.getElementById('show-login');
        this.loginFormContainer = document.getElementById('login-form-container');
        this.registerFormContainer = document.getElementById('register-form-container');
        this.resetPasswordLink = document.getElementById('reset-password-link');
        this.resetPasswordForm = document.getElementById('reset-password-form');
        this.resetPasswordContainer = document.getElementById('reset-password-container');
        this.backToLoginLink = document.getElementById('back-to-login');
        this.landingPage = document.getElementById('landing-page');
        this.userDashboard = document.getElementById('user-dashboard');
        this.authSection = document.getElementById('auth-section');
        this.featuresSection = document.getElementById('features');
        this.aboutSection = document.getElementById('about');

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
                if (this.resetPasswordContainer) this.resetPasswordContainer.classList.add('hidden');
            });
        }

        if (this.showLoginLink) {
            this.showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.registerFormContainer) this.registerFormContainer.classList.add('hidden');
                if (this.loginFormContainer) this.loginFormContainer.classList.remove('hidden');
                if (this.resetPasswordContainer) this.resetPasswordContainer.classList.add('hidden');
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
        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => {
                if (this.authSection) {
                    this.authSection.classList.remove('hidden');
                    if (this.loginFormContainer) {
                        this.loginFormContainer.classList.remove('hidden');
                    }
                    if (this.registerFormContainer) {
                        this.registerFormContainer.classList.add('hidden');
                    }
                    if (this.resetPasswordContainer) {
                        this.resetPasswordContainer.classList.add('hidden');
                    }
                }
            });
        }
        if (this.resetPasswordLink) {
            this.resetPasswordLink.addEventListener('click', this.showResetPasswordForm.bind(this));
        }
        if (this.resetPasswordForm) {
            this.resetPasswordForm.addEventListener('submit', this.handleResetPassword.bind(this));
        }
        if (this.backToLoginLink) {
            this.backToLoginLink.addEventListener('click', this.showLoginForm.bind(this));
        }
    }

    setupAuthStateListener() {
        this.authService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userData = await this.userService.getUserData(user.uid);
                    this.authForms.showUserInfo(user.email, userData);
                    this.authForms.hideLoginButton();
                    
                    // Inicjalizuj i ładuj wyniki po zalogowaniu
                    if (!this.scoreDisplay) {
                        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService);
                    }
                    this.scoreDisplay.init();  // Dodaj to wywołanie
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    this.authForms.showUserInfo(user.email);
                    this.authForms.hideLoginButton();
                }
            } else {
                this.authForms.hideUserInfo();
                this.authForms.showLoginButton();
                this.scoreDisplay = null;  // Resetuj scoreDisplay przy wylogowaniu
            }
        });
    }

    showResetPasswordForm(e) {
        e.preventDefault();
        if (this.loginFormContainer) this.loginFormContainer.classList.add('hidden');
        if (this.registerFormContainer) this.registerFormContainer.classList.add('hidden');
        if (this.resetPasswordContainer) this.resetPasswordContainer.classList.remove('hidden');
    }

    showLoginForm(e) {
        e.preventDefault();
        if (this.resetPasswordContainer) this.resetPasswordContainer.classList.add('hidden');
        if (this.registerFormContainer) this.registerFormContainer.classList.add('hidden');
        if (this.loginFormContainer) this.loginFormContainer.classList.remove('hidden');
    }

    async handleResetPassword(e) {
        e.preventDefault();
        const email = this.resetPasswordForm['reset-email'].value;
        try {
            await this.authService.resetPassword(email);
            this.notificationManager.show('Link do resetowania hasła został wysłany na podany adres email.', 'success');
            this.resetPasswordForm.reset();
            this.showLoginForm(e);
        } catch (error) {
            this.notificationManager.show('Wystąpił błąd podczas wysyłania linku do resetowania hasła: ' + error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = this.registerForm['register-email'].value;
        const password = this.registerForm['register-password'].value;
        const nickname = this.registerForm['register-nickname'].value;
    
        try {
            const nicknameExists = await this.userService.checkNicknameExists(nickname);
            
            if (nicknameExists) {
                this.notificationManager.show('Ten nickname jest już zajęty. Wybierz inny.', 'error');
                return;
            }
    
            const userCredential = await this.authService.register(email, password);
            await this.userService.createUser(userCredential.user.uid, email, nickname);
            
            this.registerForm.reset();
            this.notificationManager.show('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.', 'success');
            this.showLoginForm(e);
        } catch (error) {
            console.error("Registration error:", error);
            this.notificationManager.show(error.message, 'error');
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        const email = this.loginForm['login-email'].value;
        const password = this.loginForm['login-password'].value;
    
        try {
            await this.authService.login(email, password);
            this.loginForm.reset();
            this.notificationManager.show('Zalogowano pomyślnie!', 'success');
            if (this.authSection) {
                this.authSection.classList.add('hidden');
            }
        } catch (error) {
            this.notificationManager.show('Błąd logowania: ' + error.message, 'error'); }
    }
    
    async handleLogout() {
        try {
            await this.authService.logout();
            this.notificationManager.show('Wylogowano pomyślnie!', 'success');
            if (this.authSection) {
                this.authSection.classList.remove('hidden');
            }
        } catch (error) {
            this.notificationManager.show('Błąd wylogowania: ' + error.message, 'error');
        }
    }

    showUserInfo(email, userData) {
        console.log("Showing user info with data:", email, userData);
        if (this.userInfo) {
            this.userInfo.classList.remove('hidden');
            const nicknameElement = document.getElementById('user-nickname');
            const emailElement = document.getElementById('user-email');
            
            if (nicknameElement) {
                if (userData && userData.nickname) {
                    console.log("Setting nickname to:", userData.nickname);
                    nicknameElement.textContent = userData.nickname;
                } else {
                    console.log("No nickname found in userData");
                    nicknameElement.textContent = 'Użytkownik';
                }
            } else {
                console.log("Nickname element not found in DOM");
            }
    
            if (emailElement) {
                emailElement.textContent = email;
            }
        } else {
            console.log("UserInfo element not found");
        }
        
        if (this.landingPage) {
            this.landingPage.classList.add('hidden');
        }
        if (this.userDashboard) {
            this.userDashboard.classList.remove('hidden');
        }
        if (this.featuresSection) {
            this.featuresSection.classList.add('hidden');
        }
        if (this.aboutSection) {
            this.aboutSection.classList.add('hidden');
        }
    }

    hideUserInfo() {
        if (this.userInfo) {
            this.userInfo.classList.add('hidden');
        }
        if (this.landingPage) {
            this.landingPage.classList.remove('hidden');
        }
        if (this.userDashboard) {
            this.userDashboard.classList.add('hidden');
        }
        if (this.featuresSection) {
            this.featuresSection.classList.remove('hidden');
        }
        if (this.aboutSection) {
            this.aboutSection.classList.remove('hidden');
        }
    }

    showLoginButton() {
        if (this.loginButton) {
            this.loginButton.classList.remove('hidden');
        }
    }

    hideLoginButton() {
        if (this.loginButton) {
            this.loginButton.classList.add('hidden');
        }
    }
}