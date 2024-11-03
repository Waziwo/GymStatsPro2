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
        const exerciseType = this.scoreForm['exercise-type'].value;
        const weight = parseFloat(this.scoreForm['weight'].value);
        const reps = parseInt(this.scoreForm['reps'].value);

        try {
            if (!this.authService.getCurrentUser()) {
                throw new Error('Musisz być zalogowany aby dodać wynik');
            }
            await this.scoreService.addScore(exerciseType, weight, reps);
            this.scoreForm.reset();
            this.loadScores(); // Odśwież listę wyników po dodaniu nowego
        } catch (error) {
            alert(error.message);
        }
    }

    loadScores() {
        this.scoreService.loadScores().then(scores => {
            this.displayScores(scores);
        }).catch(error => {
            console.error('Error loading scores:', error);
        });
    }

    displayScores(scores) {
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = '';
        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.exerciseType}: ${score.weight}kg x ${score.reps} reps`;
            scoresList.appendChild(li);
        });
    }
}