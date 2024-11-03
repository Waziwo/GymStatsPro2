export class ScoreDisplay {
    constructor(scoreService, authService) {
        this.scoreService = scoreService;
        this.authService = authService;
        this.scoreForm = null;
        this.scoresList = null;
        this.initializeElements();
    }

    initializeElements() {
        this.scoreForm = document.getElementById('score-form');
        this.scoresList = document.getElementById('scores-list');
        if (this.scoreForm) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.scoreForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleScoreSubmit(e);
        });
    }

    async handleScoreSubmit(e) {
        const exerciseType = this.scoreForm['exercise-type'].value;
        const weight = parseFloat(this.scoreForm['weight'].value);
        const reps = parseInt(this.scoreForm['reps'].value);

        try {
            const user = await this.authService.getCurrentUser();
            if (!user) {
                throw new Error('Musisz być zalogowany aby dodać wynik');
            }
            await this.scoreService.addScore(exerciseType, weight, reps);
            this.scoreForm.reset();
            await this.loadScores();
        } catch (error) {
            alert(error.message);
        }
    }

    async loadScores() {
        try {
            const scores = await this.scoreService.loadScores();
            this.displayScores(scores);
        } catch (error) {
            console.error('Error loading scores:', error);
        }
    }

    displayScores(scores) {
        if (!this.scoresList) return;
        
        this.scoresList.innerHTML = '';
        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.exerciseType}: ${score.weight}kg x ${score.reps} reps`;
            this.scoresList.appendChild(li);
        });
    }
}