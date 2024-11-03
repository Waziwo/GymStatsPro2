export class ScoreDisplay {
    constructor(scoreService, authService) {
        this.scoreService = scoreService;
        this.authService = authService;
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
        const gameName = this.scoreForm['game-name'].value;
        const score = this. scoreForm['score'].value;

        try {
            const user = await this.authService.getCurrentUser();
            if (!user) return;

            await this.scoreService.addScore(user.uid, gameName, score);
            this.scoreForm.reset();
            this.scoreService.loadScores();
        } catch (error) {
            alert(error.message);
        }
    }
}