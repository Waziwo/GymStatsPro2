export class DashboardManager {
    constructor() {
        this.dashboard = document.getElementById('user-dashboard');
        this.navLinks = document.querySelectorAll('.dashboard-nav a');
        this.sections = document.querySelectorAll('.dashboard-section');
        this.init();
    }

    init() {
        this.setupNavigation();
        // Pokaż domyślną sekcję
        this.showSection('overview');
    }

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
                
                // Aktualizuj aktywny link
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        // Ukryj wszystkie sekcje
        this.sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Pokaż wybraną sekcję
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        }
    }

    // Metoda do pokazywania całego dashboardu
    show() {
        if (this.dashboard) {
            this.dashboard.classList.remove('hidden');
        }
    }

    // Metoda do ukrywania całego dashboardu
    hide() {
        if (this.dashboard) {
            this.dashboard.classList.add('hidden');
        }
    }
}