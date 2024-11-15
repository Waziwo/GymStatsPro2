// src/js/utils/navigation.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Funkcja zarządzająca widocznością sekcji
export const manageSectionsVisibility = (isLoggedIn, isLandingPage = false) => {
    const loginButton = document.getElementById('login-button');
    const dashboardLink = document.getElementById('dashboard-link');
    const featuresSection = document.getElementById('features');
    const aboutSection = document.getElementById('about');
    const authSection = document.getElementById('auth-section');
    const landingPage = document.getElementById('landing-page');
    const userDashboard = document.getElementById('user-dashboard');

    if (isLoggedIn) {
        // Stan zalogowany
        loginButton.classList.add('hidden');
        dashboardLink.classList.remove('hidden');
        
        if (isLandingPage) {
            // Pokaż Features i About tylko na stronie głównej
            landingPage.classList.remove('hidden');
            userDashboard.classList.add('hidden');
            featuresSection.classList.remove('hidden');
            aboutSection.classList.remove('hidden');
        } else {
            // Ukryj Features i About w dashboardzie
            landingPage.classList.add('hidden');
            userDashboard.classList.remove('hidden');
            featuresSection.classList.add('hidden');
            aboutSection.classList.add('hidden');
        }
    } else {
        // Stan wylogowany
        loginButton.classList.remove('hidden');
        dashboardLink.classList.add('hidden');
        landingPage.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        featuresSection.classList.remove('hidden');
        aboutSection.classList.remove('hidden');
    }

    authSection.classList.add('hidden');
};

export class DashboardNavigation {
    constructor() {
        console.log("DashboardNavigation constructor called");
        this.navLinks = document.querySelectorAll('.dashboard-nav a');
        this.sections = document.querySelectorAll('.dashboard-section');
        console.log("Nav links:", this.navLinks.length);
        console.log("Sections:", this.sections.length);
        this.init();
    }

    init() {
        console.log("Initializing dashboard navigation");
        this.setupEventListeners();
        this.showSection('overview'); // Pokazuje domyślną sekcję
    }

    setupEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                console.log("Link clicked:", sectionId);
                this.showSection(sectionId);
            });
        });
    }

    showSection(sectionId) {
        console.log("Showing section:", sectionId);
        // Ukryj wszystkie sekcje
        this.sections.forEach(section => {
            section.classList.remove('active');
            console.log("Removing active from:", section.id);
        });

        // Usuń klasę active ze wszystkich linków
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            console.log("Removing active from link:", link.getAttribute('href'));
        });

        // Pokaż wybraną sekcję
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log("Adding active to:", sectionId);
        } else {
            console.log("Target section not found:", sectionId);
        }

        // Dodaj klasę active do klikniętego linku
        const activeLink = document.querySelector(`.dashboard-nav a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            console.log("Adding active to link:", sectionId);
        } else {
            console.log("Active link not found:", sectionId);
        }
    }
}

export const initNavigation = () => {
    const auth = getAuth();
    
    // Pobieranie wszystkich potrzebnych elementów
    const logoLink = document.getElementById('logo-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const loginButton = document.getElementById('login-button');
    const landingPage = document.getElementById('landing-page');
    const userDashboard = document.getElementById('user-dashboard');
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    const sections = document.querySelectorAll('.dashboard-section');
    const featuresSection = document.getElementById('features');
    const aboutSection = document.getElementById('about');
    const navLinksContainer = document.querySelector('.nav-links');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const authSection = document.getElementById('auth-section');

    // Funkcja do płynnego przewijania do sekcji
    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Funkcja sprawdzająca stan autoryzacji
    const checkAuthState = () => {
        return auth.currentUser !== null;
    };

    // Obsługa kliknięcia w logo
    logoLink.addEventListener('click', e => {
        e.preventDefault();
        const isLoggedIn = checkAuthState();

        // Zawsze pokazuj stronę główną po kliknięciu w logo
        manageSectionsVisibility(isLoggedIn, true);

        // Przewiń na górę strony
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Obsługa kliknięcia w link do dashboardu
    dashboardLink.addEventListener('click', e => {
        e.preventDefault();
        manageSectionsVisibility(true, false);
    });

    // Obsługa nawigacji w dashboardzie
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);

            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Obsługa menu hamburgerowego
    hamburgerMenu.addEventListener('click', e => {
        e.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Zamykanie menu po kliknięciu w link
    document.querySelectorAll('.nav-link, .btn-primary').forEach(item => {
        item.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // Zamykanie menu po kliknięciu poza menu
    document.addEventListener('click', event => {
        if (!event.target.closest('.nav-container')) {
            hamburgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    // Obsługa przycisku "Rozpocznij za darmo"
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const isLoggedIn = checkAuthState();
            if (!isLoggedIn) {
                authSection.classList.remove('hidden');
                manageSectionsVisibility(false, false);
            }
        });
    }

    // Obsługa kliknięć w linki nawigacyjne
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const isLoggedIn = checkAuthState();

            if (!isLoggedIn) {
                scrollToSection(targetId);
            }
        });
    });

    // Nasłuchiwanie zmian stanu autoryzacji
    onAuthStateChanged(auth, user => {
        const isLoggedIn = user !== null;
        manageSectionsVisibility(isLoggedIn, !isLoggedIn);
    });

    // Inicjalizacja stanu początkowego
    const initialAuthState = checkAuthState();
    manageSectionsVisibility(initialAuthState, true);
};

// Obsługa menu hamburgerowego
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinksContainer = document.querySelector('.nav-links');

if (hamburgerMenu && navLinksContainer) {
    hamburgerMenu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
    });

    // Zamykanie menu po kliknięciu w link
    document.querySelectorAll('.nav-link').forEach(item => {
        item.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
        });
    });
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', initNavigation);
