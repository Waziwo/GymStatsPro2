import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const initNavigation = () => {
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

    // Funkcja zarządzająca widocznością sekcji
    const manageSectionsVisibility = isLoggedIn => {
        const loginButton = document.getElementById('login-button');
        const dashboardLink = document.getElementById('dashboard-link');
        const featuresSection = document.getElementById('features');
        const aboutSection = document.getElementById('about');
        const authSection = document.getElementById('auth-section');
    
        if (isLoggedIn) {
            // Stan zalogowany
            loginButton.classList.add('hidden');
            dashboardLink.classList.remove('hidden'); // Pokaż link do dashboardu
            // Nie ukrywamy features i about, bo chcemy je pokazać na landing page
        } else {
            // Stan wylogowany
            loginButton.classList.remove('hidden');
            dashboardLink.classList.add('hidden');
        }
    
        // Zawsze pokazuj Features i About na landing page
        featuresSection.classList.remove('hidden');
        aboutSection.classList.remove('hidden');
        authSection.classList.add('hidden');
    };

    // Obsługa kliknięcia w logo
    logoLink.addEventListener('click', e => {
        e.preventDefault();
        const isLoggedIn = checkAuthState();

        // Zawsze pokazuj stronę główną po kliknięciu w logo
        landingPage.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        authSection.classList.add('hidden');
        featuresSection.classList.remove('hidden');
        aboutSection.classList.remove('hidden');

        // Aktualizuj widoczność sekcji, ale zachowaj stan logowania
        manageSectionsVisibility(isLoggedIn);

        // Przewiń na górę strony
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Obsługa kliknięcia w link do dashboardu
    dashboardLink.addEventListener('click', e => {
        e.preventDefault();
        landingPage.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        authSection.classList.add('hidden');
        manageSectionsVisibility(true);
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
                landingPage.classList.add('hidden');
                featuresSection.classList.add('hidden');
                aboutSection.classList.add('hidden');
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
        manageSectionsVisibility(isLoggedIn);
        
        if (isLoggedIn) {
            landingPage.classList.add('hidden');
            userDashboard.classList.remove('hidden');
            authSection.classList.add('hidden');
        } else {
            landingPage.classList.remove('hidden');
            userDashboard.classList.add('hidden');
        }
    });

    // Inicjalizacja stanu początkowego
    const initialAuthState = checkAuthState();
    manageSectionsVisibility(initialAuthState);
};
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinksContainer = document.querySelector('.nav-links');

hamburgerMenu.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active'); // Dodaj lub usuń klasę active
});

// Zamykanie menu po kliknięciu w link
document.querySelectorAll('.nav-link').forEach(item => {
    item.addEventListener('click', () => {
        navLinksContainer.classList.remove('active'); // Ukryj menu po kliknięciu
    });
});
// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', initNavigation);

export { initNavigation };