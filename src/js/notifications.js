export class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            ${message}
            <button class="notification-close">&times;</button>
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));

        this.container.appendChild(notification);

        setTimeout(() => this.close(notification), duration);
    }

    close(notification) {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        notification.addEventListener('animationend', () => {
            this.container.removeChild(notification);
        });
    }
}