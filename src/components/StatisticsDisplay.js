export class StatisticsDisplay {
    constructor(scoreService) {
        this.scoreService = scoreService;
        this.charts = {
            progressChart: null,
            distributionChart: null,
            maxWeightChart: null
        };
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
        if (!averagesContainer) {
            console.warn('Element "averages" nie został znaleziony');
            return;
        }

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
        if (!ctx || !scores.length) {
            console.warn('Element "progressChart" nie został znaleziony lub brak danych');
            return;
        }

        if (this.charts.progressChart) {
            this.charts.progressChart.destroy();
        }

        const groupedScores = this.groupScoresByExercise(scores);
        const datasets = this.createDatasets(groupedScores);

        this.charts.progressChart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: this.getProgressChartOptions()
        });
    }

    createExerciseDistributionChart(scores) {
        const ctx = document.getElementById('exerciseDistributionChart');
        if (!ctx || !scores.length) {
            console.warn('Element "exerciseDistributionChart" nie został znaleziony lub brak danych');
            return;
        }

        if (this.charts.distributionChart) {
            this.charts.distributionChart.destroy();
        }

        const exerciseCounts = this.countExercises(scores);

        this.charts.distributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(exerciseCounts),
                datasets: [{
                    data: Object.values(exerciseCounts),
                    backgroundColor: Object.keys(exerciseCounts).map(() => this.getRandomColor())
                }]
            },
            options: this.getDistributionChartOptions()
        });
    }

    createMaxWeightChart(scores) {
        const ctx = document.getElementById('maxWeightChart');
        if (!ctx || !scores.length) {
            console.warn('Element "maxWeightChart" nie został znaleziony lub brak danych');
            return;
        }

        if (this.charts.maxWeightChart) {
            this.charts.maxWeightChart.destroy();
        }

        const maxWeights = this.findMaxWeights(scores);

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
            options: this.getMaxWeightChartOptions()
        });
    }

    groupScoresByExercise(scores) {
        return scores.reduce((acc, score) => {
            if (!acc[score.exerciseType]) {
                acc[score.exerciseType] = [];
            }
            acc[score.exerciseType].push({
                x: new Date(score.timestamp),
                y: score.weight
            });
            return acc;
        }, {});
    }

    createDatasets(groupedScores) {
        return Object.entries(groupedScores).map(([exercise, data]) => ({
            label: exercise,
            data: data.sort((a, b) => a.x - b.x),
            fill: false,
            borderColor: this.getRandomColor(),
            tension: 0.1
        }));
    }

    countExercises(scores) {
        return scores.reduce((acc, score) => {
            acc[score.exerciseType] = (acc[score.exerciseType] || 0) + 1;
            return acc;
        }, {});
    }

    findMaxWeights(scores) {
        return scores.reduce((acc, score) => {
            if (!acc[score.exerciseType] || score.weight > acc[score.exerciseType]) {
                acc[score.exerciseType] = score.weight;
            }
            return acc;
        }, {});
    }

    getProgressChartOptions() {
        return {
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
        };
    }

    getDistributionChartOptions() {
        return {
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
        };
    }

    getMaxWeightChartOptions() {
        return {
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
        };
    }

    getRandomColor() {
        const letters = '0123456789ABC DEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}