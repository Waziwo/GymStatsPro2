// src/js/dashboard-navigation.js
export class DashboardNavigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.dashboard-nav a');
        this.sections = document.querySelectorAll('.dashboard-section');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showSection('overview'); // Pokazuje domyślną sekcję
    }

    setupEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
            });
        });
    }

    showSection(sectionId) {
        // Ukryj wszystkie sekcje
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        // Usuń klasę active ze wszystkich linków
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Pokaż wybraną sekcję
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Dodaj klasę active do klikniętego linku
        const activeLink = document.querySelector(`.dashboard-nav a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}