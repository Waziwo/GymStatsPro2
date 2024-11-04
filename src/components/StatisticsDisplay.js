export class StatisticsDisplay {
    constructor(scoreService) {
        this.scoreService = scoreService;
        this.chart = null;
    }

    async init() {
        await this.loadAndDisplayStatistics();
    }

    async loadAndDisplayStatistics() {
        try {
            const scores = await this.scoreService.loadScores();
            this.displayAverages(scores);
            this.createProgressChart(scores);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    displayAverages(scores) {
        const averagesContainer = document.getElementById('averages');
        if (!averagesContainer) return;

        const exercises = {
            'bench-press': 'Wyciskanie sztangi',
            'squat': 'Przysiad',
            'deadlift': 'Martwy ciąg'
        };

        averagesContainer.innerHTML = '';

        for (const [key, name] of Object.entries(exercises)) {
            const exerciseScores = scores.filter(score => score.exerciseType === key);
            if (exerciseScores.length === 0) continue;

            const avgWeight = this.calculateAverage(exerciseScores, 'weight');
            const avgReps = this.calculateAverage(exerciseScores, 'reps');

            const card = document.createElement('div');
            card.className = 'average-card';
            card.innerHTML = `
                <h3>${name}</h3>
                <div class="average-value">${avgWeight.toFixed(1)} kg</div>
                <div class="average-value">${avgReps.toFixed(1)} powtórzeń</div>
            `;
            averagesContainer.appendChild(card);
        }
    }

    calculateAverage(scores, property) {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + score[property], 0);
        return sum / scores.length;
    }

    createProgressChart(scores) {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        // Grupuj wyniki według ćwiczenia
        const exerciseData = {};
        scores.forEach(score => {
            if (!exerciseData[score.exerciseType]) {
                exerciseData[score.exerciseType] = [];
            }
            exerciseData[score.exerciseType].push({
                x: new Date(score.timestamp),
                y: score.weight
            });
        });

        // Sortuj daty dla każdego ćwiczenia
        Object.values(exerciseData).forEach(data => {
            data.sort((a, b) => a.x - b.x);
        });

        const colors = {
            'bench-press': 'rgb(255, 99, 132)',
            'squat': 'rgb(54, 162, 235)',
            'deadlift': 'rgb(75, 192, 192)'
        };

        const datasets = Object.entries(exerciseData).map(([exercise, data]) => ({
            label: this.getExerciseName(exercise),
            data: data,
            borderColor: colors[exercise],
            tension: 0.1
        }));

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ciężar (kg)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Postęp w ćwiczeniach'
                    }
                }
            }
        });
    }

    getExerciseName(exerciseType) {
        const exerciseNames = {
            'bench-press': 'Wyciskanie sztangi',
            'squat': 'Przysiad',
            'deadlift': 'Martwy ciąg'
        };
        return exerciseNames[exerciseType] || exerciseType;
    }
}