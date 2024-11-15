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
        this.setupEventListenersDashboard();
        this.showSection('overview'); // Pokazuje domyślną sekcję
    }

    setupEventListenersDashboard() {
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