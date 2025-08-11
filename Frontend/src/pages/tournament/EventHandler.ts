import { TournamentResponseMessages } from '../../api/types';
import { exmp } from '../../languageManager';

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
            } else {
                this.handleInputChange(event);
            }
        });
    }

    setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
            }
            if (event.key === 'F5') {
                event.preventDefault();
            }
            if (event.key === 'Enter') {
                this.handleEnterKey(event);
            }
        });
    }

    setupGlobalErrorHandling(): void {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showGlobalError(exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_INTERNAL_SERVER}`));
        });
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showGlobalError(exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_INTERNAL_SERVER}`));
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

    private handleInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const inputId = input.id;
        if (inputId === 'createInput' || inputId === 'joinInput') {
            this.performRealTimeValidation(input);
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

    private performRealTimeValidation(input: HTMLInputElement): void {
        const inputType = input.id === 'createInput' ? 'create' : 'join';
        this.clearInputError(inputType);
        
        if (input.value.trim().length > 0) {
            this.showInputSuccess(inputType);
        }
    }

    private showInputSuccess(inputType: string): void {
        const input = document.getElementById(`${inputType}Input`) as HTMLInputElement;
        if (input) {
            input.style.borderColor = '#10b981';
            input.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
        }
    }

    private clearInputError(inputType: string): void {
        const input = document.getElementById(`${inputType}Input`) as HTMLInputElement;
        const errorElement = document.getElementById(`${inputType}_error_message`);
        if (input) {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
        if (errorElement) {
            errorElement.style.visibility = 'hidden';
            errorElement.textContent = '';
        }
    }

    private showInputError(inputType: 'join' | 'create', message: string): void {
        const errorElement = document.getElementById(`${inputType}_error_message`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.visibility = 'visible';
            setTimeout(() => {
                errorElement.style.visibility = 'hidden';
                errorElement.textContent = '';
            }, 5000);
        }
    }

    private showGlobalError(message: string): void {
        const toast = document.createElement('div');
        toast.className = 'global-error-toast';
        toast.innerHTML = `
            <div class="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span>${message}</span>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
}
