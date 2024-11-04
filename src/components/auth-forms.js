import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { ScoreDisplay } from './score-display.js';

export class AuthForms {
    constructor(authService, scoreService, userService, notificationManager, activityLogger) {
        console.log("Inicjalizacja AuthForms");
        this.authService = authService;
        this.scoreService = scoreService;
        this.userService = userService;
        this.notificationManager = notificationManager;
        this.activityLogger = activityLogger;
        this.auth = getAuth();
        
        console.log("Rozpoczęcie inicjalizacji formularzy");
        this.initializeForms();
        console.log("Rozpoczęcie konfiguracji nasłuchiwania stanu autoryzacji");
        this.setupAuthStateListener();
        this.hamburgerMenu = document.querySelector('.hamburger-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.setupMobileMenu();
        console.log("Inicjalizacja formularzy logowania");
        console.log("Login button:", this.loginButton);
        console.log("Auth section:", this.authSection);
        console.log("Login form container:", this.loginFormContainer);
    }
    setupMobileMenu() {
        if (this.hamburgerMenu && this.navLinks) {
            this.hamburgerMenu.addEventListener('click', () => {
                this.navLinks.classList.toggle('active');
            });
        }
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
        this.navLinks = document.querySelectorAll('.nav-link');

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
                    this.showUserInfo(user.email, userData);
                    this.hideLoginButton();
                    
                    // Inicjalizuj i ładuj wyniki po zalogowaniu
                    if (!this.scoreDisplay) {
                        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService);
                    }
                    this.scoreDisplay.init();  // Dodaj to wywołanie
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    this.showUserInfo(user.email);
                    this.hideLoginButton();
                }
            } else {
                this.hideUserInfo();
                this.showLoginButton();
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

    async handleLogin(e) {
        e.preventDefault();
        const email = this.loginForm['login-email'].value;
        const password = this.loginForm['login-password'].value;
        
        console.log("Próba logowania z email:", email);
        
        try {
            console.log("Wywołanie authService.login");
            await this.authService.login(email, password);
            console.log("Logowanie udane");
            this.loginForm.reset();
            this.notificationManager.show('Zalogowano pomyślnie!', 'success');
            if (this.authSection) {
                this.authSection.classList.add('hidden');
            }
        } catch (error) {
            console.error("Błąd logowania:", error);
            this.notificationManager.show('Błąd logowania: ' + error.message, 'error');
        }
    }
    
    async handleLogout() {
        try {
            await this.authService.logout();
            this.notificationManager.show('Wylogowano pomyślnie!', 'success');
            this.activityLogger.logActivity('logout', {});
            if (this.authSection) {
                this.authSection.classList.remove('hidden');
            }
        } catch (error) {
            this.notificationManager.show('Błąd wylogowania: ' + error.message, 'error');
            this.activityLogger.logActivity('logout_error', { error: error.message });
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
            this.activityLogger.logActivity('register', { email: email, nickname: nickname });
            this.showLoginForm(e);
        } catch (error) {
            console.error("Registration error:", error);
            this.notificationManager.show(error.message, 'error');
            this.activityLogger.logActivity('register_error', { error: error.message });
        }
    }

    showUserInfo(email, userData) {
        if (this.userInfo) {
            this.userInfo.classList.remove('hidden');
            const nicknameElement = document.getElementById('user-nickname');
            const emailElement = document.getElementById('user-email');
            
            if (nicknameElement) {
                nicknameElement.textContent = userData?.nickname || 'Użytkownik';
            }
            if (emailElement) {
                emailElement.textContent = email;
            }
        }
        
        // Pokazuj/ukrywaj sekcje w zależności od stanu
        if (this.landingPage) {
            this.landingPage.classList.add('hidden');
        }
        if (this.userDashboard) {
            this.userDashboard.classList.remove('hidden');
        }
        
        // Zawsze ukrywaj linki Features i About gdy użytkownik jest zalogowany
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                if (link.getAttribute('href') === '#features' || link.getAttribute('href') === '#about') {
                    link.classList.add('hidden');
                }
            });
        }
        
        if (this.featuresSection) {
            this.featuresSection.classList.add('hidden');
        }
        if (this.aboutSection) {
            this.aboutSection.classList.add('hidden');
        }
    }
    
    // Dodaj nową metodę do wyświetlania historii aktywności
    displayUserActivities() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) {
            console.log("Element activity-list nie został znaleziony");
            return;
        }
    
        const activities = this.activityLogger.getActivities();
        activityList.innerHTML = '';
    
        activities.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            const date = new Date(activity.timestamp);
            activityItem.innerHTML = `
                <span class="activity-type">${activity.type}</span>
                <span class="activity-time">${date.toLocaleString()}</span>
                ${activity.details ? `<span class="activity-details">${JSON.stringify(activity.details)}</span>` : ''}
            `;
            activityList.appendChild(activityItem);
        });
    }
    
    hideUserInfo() {
        if (this.userInfo) {
            this.userInfo.classList.add('hidden');
        }
        
        // Pokazuj sekcje gdy użytkownik jest wylogowany
        if (this.landingPage) {
            this.landingPage.classList.remove('hidden');
        }
        if (this.userDashboard) {
            this.userDashboard.classList.add('hidden');
        }
        
        // Pokazuj linki Features i About gdy użytkownik jest wylogowany
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                if (link.getAttribute('href') === '#features' || link.getAttribute('href') === '#about') {
                    link.classList.remove('hidden');
                }
            });
        }
        
        if (this.featuresSection) {
            this.featuresSection.classList.remove('hidden');
        }
        if (this.aboutSection) {
            this.aboutSection.classList.remove('hidden');
        }
    }
    
    setupAuthStateListener() {
        console.log("Ustawianie nasłuchiwania na zmiany stanu autoryzacji");
        this.authService.onAuthStateChanged(async (user) => {
            console.log("Stan autoryzacji zmieniony:", user);
            if (user) {
                try {
                    console.log("Próba pobrania danych użytkownika:", user.uid);
                    const userData = await this.userService.getUserData(user.uid);
                    console.log("Pobrane dane użytkownika:", userData);
                    this.showUserInfo(user.email, userData);
                    this.hideLoginButton();
                    
                    console.log("Inicjalizacja wyświetlania wyników");
                    if (!this.scoreDisplay) {
                        console.log("Tworzenie nowej instancji ScoreDisplay");
                        this.scoreDisplay = new ScoreDisplay(this.scoreService, this.authService);
                    }
                    this.scoreDisplay.init();
                } catch (error) {
                    console.error('Błąd podczas pobierania danych użytkownika:', error);
                    this.showUserInfo(user.email);
                    this.hideLoginButton();
                }
            } else {
                console.log("Użytkownik wylogowany - resetowanie widoku");
                this.hideUserInfo();
                this.showLoginButton();
                this.scoreDisplay = null;
            }
        });
    }
    
    showLoginButton() {
        console.log("Próba pokazania przycisku logowania");
        if (this.loginButton) {
            console.log("Pokazywanie przycisku logowania");
            this.loginButton.classList.remove('hidden');
        } else {
            console.log("Nie znaleziono przycisku logowania");
        }
    }
    
    hideLoginButton() {
        console.log("Próba ukrycia przycisku logowania");
        if (this.loginButton) {
            console.log("Ukrywanie przycisku logowania");
            this.loginButton.classList.add('hidden');
        } else {
            console.log("Nie znaleziono przycisku logowania");
        }
    }
    // W klasie AuthForms dodaj metodę handleError:
    handleError(error, context) {
        console.error(`Błąd w ${context}:`, error);
        let message = 'Wystąpił nieoczekiwany błąd';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Nie znaleziono użytkownika o podanym adresie email';
                break;
            case 'auth/wrong-password':
                message = 'Nieprawidłowe hasło';
                break;
            case 'auth/email-already-in-use':
                message = 'Ten adres email jest już zajęty';
                break;
            case 'auth/weak-password':
                message = 'Hasło jest za słabe. Powinno mieć co najmniej 6 znaków';
                break;
            case 'auth/invalid-email':
                message = 'Nieprawidłowy format adresu email';
                break;
        }
        
        this.notificationManager.show(message, 'error');
    }
    setupFormValidation() {
        const passwordInput = document.getElementById('register-password');
        const emailInput = document.getElementById('register-email');
        const nicknameInput = document.getElementById('register-nickname');
    
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                let strength = 0;
                
                // Sprawdź długość
                if (password.length >= 8) strength++;
                // Sprawdź wielkie litery
                if (/[A-Z]/.test(password)) strength++;
                // Sprawdź małe litery
                if (/[a-z]/.test(password)) strength++;
                // Sprawdź cyfry
                if (/[0-9]/.test(password)) strength++;
                // Sprawdź znaki specjalne
                if (/[^A-Za-z0-9]/.test(password)) strength++;
    
                const strengthMeter = document.getElementById('password-strength');
                if (strengthMeter) {
                    strengthMeter.className = `strength-${strength}`;
                    strengthMeter.textContent = ['Bardzo słabe', 'Słabe', 'Średnie', 'Silne', 'Bardzo silne'][strength - 1];
                }
            });
        }
    
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const email = e.target.value;
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                emailInput.classList.toggle('invalid', !isValid);
            });
        }
    
        if (nicknameInput) {
            nicknameInput.addEventListener('input', (e) => {
                const nickname = e.target.value;
                const isValid = /^[a-zA-Z0-9_-]{3,20}$/.test(nickname);
                nicknameInput.classList.toggle('invalid', !isValid);
            });
        }
    }
}