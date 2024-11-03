export class ScoreDisplay {
    constructor(scoreService) {
        this.scoreService = scoreService;
        this.initializeElements();
    }

    initializeElements() {
        this.scoreForm = document.getElementById('score-form');
        this.scoresList = document.getElementById('scores-list');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.scoreForm.addEventListener('submit', this.handleScoreSubmit.bind(this));
    }

    async handleScoreSubmit(e) {
        e.preventDefault();
        // Implementacja dodawania wyniku
    }

    displayScores(scores) {
        // Implementacja wyświetlania wyników
    }
}