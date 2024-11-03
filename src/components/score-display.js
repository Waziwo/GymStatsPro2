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
        const score = this.scoreForm['score'].value;
        
        try {
            const user = this.authService.auth.currentUser;
            if (user) {
                await this.scoreService.addScore(user.uid, gameName, score);
                this.scoreForm.reset();
                this.displayScores();
            } else {
                throw new Error('User not logged in');
            }
        } catch (error) {
            alert('Error adding score: ' + error.message);
        }
    }

    async displayScores() {
        try {
            const user = this.authService.auth.currentUser;
            if (user) {
                const scoresSnapshot = await this.scoreService.getUserScores(user.uid);
                this.scoresList.innerHTML = '';
                scoresSnapshot.forEach(doc => {
                    const scoreData = doc.data();
                    const li = document.createElement('li');
                    li.textContent = `${scoreData.gameName}: ${scoreData.score}`;
                    this.scoresList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error displaying scores:', error);
        }
    }
}