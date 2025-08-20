import { ModernOverlay } from '../../components/ModernOverlay';

export class TournamentEventHandler {
    private container: HTMLElement | null = null;

    setupEventDelegation(container: HTMLElement, clickHandler?: (event: Event) => void, inputHandler?: (event: Event) => void): void {
        this.container = container;
        container.addEventListener('click', (event) => {
            if (clickHandler) {
                clickHandler(event);
            } else {
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

    setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
            if (event.key === 'Enter') {
                this.handleEnterKey(event);
            }
        });
    }

    setupGlobalErrorHandling(): void {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        });
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        });
    }

    private handleClickEvent(event: Event): void {
        event.preventDefault();
        const target = (event.target as HTMLElement).closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        if (this.isButtonDisabled(target as HTMLElement)) {
            console.warn(`Action ${action} ignored - button is disabled`);
            return;
        }
    }

    public handleFormSubmission(event: Event): void {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const submitButton = form.querySelector('[data-action]') as HTMLElement;
        if (submitButton) {
            const action = submitButton.getAttribute('data-action');
        }
    }

    private handleEscapeKey(): void {
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

    private handleEnterKey(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT') {
            const form = target.closest('form');
            if (form) {
                const submitButton = form.querySelector('[data-action]') as HTMLElement;
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    }

    private isButtonDisabled(button: HTMLElement): boolean {
        return button.hasAttribute('disabled') || 
               button.classList.contains('disabled') ||
               (button as HTMLButtonElement).disabled;
    }
}
