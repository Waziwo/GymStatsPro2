import Chart from 'chart.js/auto';

export class StatisticsDisplay {
    constructor(scoreService) {
        this.scoreService = scoreService;
    }

    async init() {
        try {
            const scores = await this.scoreService.loadScores();
            this.displayAverages(scores);
            this.createProgressChart(scores);
            this.createExerciseDistributionChart(scores);
            this.createMaxWeightChart(scores);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    displayAverages(scores) {
        const averagesContainer = document.getElementById('averages');
        if (!averagesContainer) return;

        const stats = this.calculateAverages(scores);
        averagesContainer.innerHTML = `
            <div class="average-card">
                <h3>Średni ciężar</h3>
                <div class="average-value">${stats.avgWeight.toFixed(1)} kg</div>
            </div>
            <div class="average-card">
                <h3>Średnia liczba powtórzeń</h3>
                <div class="average-value">${stats.avgReps.toFixed(1)}</div>
            </div>
            <div class="average-card">
                <h3>Całkowita liczba serii</h3>
                <div class="average-value">${stats.totalSets}</div>
            </div>
        `;
    }

    calculateAverages(scores) {
        if (!scores.length) return { avgWeight: 0, avgReps: 0, totalSets: 0 };

        const totals = scores.reduce((acc, score) => {
            acc.weight += score.weight;
            acc.reps += score.reps;
            acc.sets += 1;
            return acc;
        }, { weight: 0, reps: 0, sets: 0 });

        return {
            avgWeight: totals.weight / scores.length,
            avgReps: totals.reps / scores.length,
            totalSets: totals.sets
        };
    }

    createProgressChart(scores) {
        const ctx = document.getElementById('progressChart');
        if (!ctx || !scores.length) return;

        // Grupowanie wyników według ćwiczenia i daty
        const groupedScores = {};
        scores.forEach(score => {
            if (!groupedScores[score.exerciseType]) {
                groupedScores[score.exerciseType] = [];
            }
            groupedScores[score.exerciseType].push({
                x: new Date(score.timestamp),
                y: score.weight
            });
        });

        // Tworzenie datasets dla każdego typu ćwiczenia
        const datasets = Object.entries(groupedScores).map(([exercise, data]) => ({
            label: exercise,
            data: data.sort((a, b) => a.x - b.x),
            fill: false,
            borderColor: this.getRandomColor(),
            tension: 0.1
        }));

        if (this.charts.progressChart) {
            this.charts.progressChart.destroy();
        }

        this.charts.progressChart = new Chart(ctx, {
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
                            unit: 'day',
                            displayFormats: {
                                day: 'dd/MM/yyyy'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: {
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
                        text: 'Postęp w czasie'
                    }
                }
            }
        });
    }

    createExerciseDistributionChart(scores) {
        const ctx = document.getElementById('exerciseDistributionChart');
        if (!ctx || !scores.length) return;

        const exerciseCounts = scores.reduce((acc, score) => {
            acc[score.exerciseType] = (acc[score.exerciseType] || 0) + 1;
            return acc;
        }, {});

        if (this.charts.distributionChart) {
            this.charts.distributionChart.destroy();
        }

        this.charts.distributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(exerciseCounts),
                datasets: [{
                    data: Object.values(exerciseCounts),
                    backgroundColor: Object.keys(exerciseCounts).map(() => this.getRandomColor())
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Rozkład ćwiczeń'
                    }
                }
            }
        });
    }

    createMaxWeightChart(scores) {
        const ctx = document.getElementById('maxWeightChart');
        if (!ctx || !scores.length) return;

        const maxWeights = {};
        scores.forEach(score => {
            if (!maxWeights[score.exerciseType] || score.weight > maxWeights[score.exerciseType]) {
                maxWeights[score.exerciseType] = score.weight;
            }
        });

        if (this.charts.maxWeightChart) {
            this.charts.maxWeightChart.destroy();
        }

        this.charts.maxWeightChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(maxWeights),
                datasets: [{
                    label: 'Maksymalny ciężar',
                    data: Object.values(maxWeights),
                    backgroundColor: Object.keys(maxWeights).map(() => this.getRandomColor())
                }]
            },
            options: {
                responsive: true,
                scales: {
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
                        text: 'Maksymalne ciężary'
                    }
                }
            }
        });
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}