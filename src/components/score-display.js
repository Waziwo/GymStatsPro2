export class ScoreDisplay {
    constructor(scoreService, authService) {
        this.scoreService = scoreService;
        this.authService = authService;
        this.initializeElements();
    }

    initializeElements() {
        this.scoreForm = document.getElementById('score-form');
        this.scoresList = document.getElementById('scores-list');
        
        if (this.scoreForm) {
            this.setupEventListeners();
        } else {
            console.error('Score form not found in the DOM');
        }
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
            const user = await this.authService.getCurrentUser();
            if (!user) return;
    
            await this.scoreService.addScore(user.uid, exerciseType, weight, reps);
            this.scoreForm.reset();
            this.scoreService.loadScores();
        } catch (error) {
            console.error('Error submitting score:', error);
            alert(error.message);
        }
    }
}