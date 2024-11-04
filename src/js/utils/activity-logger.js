export class ActivityLogger {
    constructor() {
        this.activities = [];
        this.maxActivities = 50;
        this.loadFromLocalStorage();
    }

    logActivity(type, details) {
        const activity = {
            type,
            details,
            timestamp: new Date(),
            id: Date.now()
        };

        this.activities.unshift(activity);
        
        if (this.activities.length > this.maxActivities) {
            this.activities.pop();
        }

        this.saveToLocalStorage();
    }

    getActivities() {
        return this.activities;
    }

    saveToLocalStorage() {
        localStorage.setItem('userActivities', JSON.stringify(this.activities));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('userActivities');
        if (saved) {
            this.activities = JSON.parse(saved);
        }
    }

    clearActivities() {
        this.activities = [];
        localStorage.removeItem('userActivities');
    }
}