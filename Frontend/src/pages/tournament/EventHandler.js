import { ModernOverlay } from '../../components/ModernOverlay';
export class TournamentEventHandler {
    container = null;
    setupEventDelegation(container, clickHandler, inputHandler) {
        this.container = container;
        container.addEventListener('click', (event) => {
            if (clickHandler) {
                clickHandler(event);
            }
            else {
                this.handleClickEvent(event);
            }
        });
        container.addEventListener('submit', (event) => {
            this.handleFormSubmission(event);
        });
        container.addEventListener('input', (event) => {
            if (inputHandler) {
                inputHandler(event);
            }
        });
    }
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
            if (event.key === 'Enter') {
                this.handleEnterKey(event);
            }
        });
    }
    setupGlobalErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        });
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        });
    }
    handleClickEvent(event) {
        event.preventDefault();
        const target = event.target.closest('[data-action]');
        if (!target)
            return;
        const action = target.getAttribute('data-action');
        if (!action)
            return;
        if (this.isButtonDisabled(target)) {
            console.warn(`Action ${action} ignored - button is disabled`);
            return;
        }
    }
    handleFormSubmission(event) {
        event.preventDefault();
        const form = event.target;
        const submitButton = form.querySelector('[data-action]');
        if (submitButton) {
            const action = submitButton.getAttribute('data-action');
        }
    }
    handleEscapeKey() {
        const modals = [
            'tree-overlay',
            'create-loading-overlay',
            'join-loading-overlay',
            'start-loading-overlay',
            'exit-loading-overlay'
        ];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                document.body.removeChild(modal);
            }
        });
    }
    handleEnterKey(event) {
        const target = event.target;
        if (target.tagName === 'INPUT') {
            const form = target.closest('form');
            if (form) {
                const submitButton = form.querySelector('[data-action]');
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    }
    isButtonDisabled(button) {
        return button.hasAttribute('disabled') ||
            button.classList.contains('disabled') ||
            button.disabled;
    }
}
