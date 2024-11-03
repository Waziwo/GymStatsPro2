export class ScoreDisplay {
    constructor(scoreService, authService) {
        this.scoreService = scoreService;
        this.authService = authService;
        this.initializeElements();
    }

    initializeElements() {
        this.scoreForm = document.getElementById('score-form');
        this.scoresList = document. getElementById('scores-list');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.scoreForm.addEventListener('submit', this.handleScoreSubmit.bind(this));
    }

    async handleScoreSubmit(e) {
        e.preventDefault();
        const exerciseType = this.scoreForm['exercise-type'].value;
        const weight = this.scoreForm['weight'].value;
        const reps = this.scoreForm['reps'].value;

        try {
            await this.scoreService.addScore(exerciseType, weight, reps);
            this.scoreForm.reset();
        } catch (error) {
            alert(error.message);
        }
    }
}