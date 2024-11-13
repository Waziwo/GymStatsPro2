
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
        console.log('Initializing statistics...');
        const scores = await this.scoreService.loadScores();
        console.log('Scores loaded:', scores);
        if (!scores.length) {
            console.log('No scores available');
            return;
        }
        console.log('Displaying averages...');
        this.displayAverages(scores);
        console.log('Averages displayed');
        console.log('Creating progress chart...');
        this.createProgressChart(scores);
        console.log('Progress chart created');
        console.log('Creating exercise distribution chart...');
        this.createExerciseDistributionChart(scores);
        console.log('Exercise distribution chart created');
        console.log('Creating max weight chart...');
        this.createMaxWeightChart(scores);
        console.log('Max weight chart created');
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
        const averageCards = [
            { title: 'Średni ciężar', value: `${stats.avgWeight.toFixed(1)} kg`, unit: 'kg' },
            { title: 'Średnia liczba powtórzeń', value: stats.avgReps.toFixed(1), unit: '' },
            { title: 'Całkowita liczba serii', value: stats.totalSets, unit: '' }
        ];

        averagesContainer.innerHTML = averageCards.map((card) => `
            <div class="average-card">
                <h3>${card.title}</h3>
                <div class="average-value">${card.value} ${card.unit}</div>
            </div>
        `).join('');
    }
    async updateStatistics() {
    try {
        console.log('Updating statistics...');
        const scores = await this.scoreService.loadScores();
        console.log('Scores loaded:', scores);
        console.log('Number of scores:', scores.length);
        console.log('First score:', scores[0]);
        console.log('Last score:', scores[scores.length - 1]);

        // Sprawdź, czy są dostępne wyniki
        if (scores.length === 0) {
            console.log('No scores available to update statistics.');
            console.warn('No scores available to update statistics.');
            return;
        }

        // Wyświetl średnie
        console.log('Displaying averages...');
        this.displayAverages(scores);
        console.log('Averages displayed');

        // Uaktualnij statystyki w elementach DOM
        console.log('Updating statistics in DOM elements...');
        const totalScoresElement = document.getElementById('total-scores');
        const averageWeightElement = document.getElementById('average-weight');

        if (totalScoresElement) {
            console.log('Updating total scores element...');
            totalScoresElement.textContent = scores.length; // Ustaw liczbę wyników
            console.log('Updated total scores element');
        } else {
            console.log('Element total-scores not found');
            console.warn('Element total-scores not found');
        }

        if (averageWeightElement) {
            console.log('Updating average weight element...');
            const totalWeight = scores.reduce((acc, score) => acc + score.weight, 0);
            const averageWeight = scores.length > 0 ? (totalWeight / scores.length).toFixed(2) : 0;
            averageWeightElement.textContent = averageWeight; // Ustaw średni ciężar
            console.log('Updated average weight element');
        } else {
            console.log('Element average-weight not found');
            console.warn('Element average-weight not found');
        }
        console.log('Creating progress chart...');
        this.createProgressChart(scores);
        console.log('Progress chart created');
        console.log('Creating exercise distribution chart...');
        this.createExerciseDistributionChart(scores);
        console.log('Exercise distribution chart created');
        console.log('Creating max weight chart...');
        this.createMaxWeightChart(scores);
        console.log('Max weight chart created');
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
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
        console.log('Creating progress chart...');
        const ctx = document.getElementById('progressChart');
        if (!ctx || !scores.length) {
            console.warn('Element "progressChart" nie został znaleziony lub brak danych');
            return;
        }

        if (this.charts.progressChart) {
            console.log('Destroying existing progress chart...');
            this.charts.progressChart.destroy();
        }

        const groupedScores = this.groupScoresByExercise(scores);
        console.log('Grouped scores:', groupedScores);
        const datasets = this.createDatasets(groupedScores);
        console.log('Datasets:', datasets);

        this.charts.progressChart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: this.getProgressChartOptions()
        });
        console.log('Progress chart created');
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