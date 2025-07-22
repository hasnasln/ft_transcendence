import { TournamentIcons } from './IconsHelper';

export class TournamentNotificationManager {
    private uiManager: any;

    constructor(uiManager: any) {
        this.uiManager = uiManager;
    }

    showCreateSuccess(tournamentData: any): void {
        const successOverlay = this.uiManager.createSuccessOverlay('create', tournamentData);
        document.body.appendChild(successOverlay);
        setTimeout(() => {
            const overlay = document.getElementById('create-success-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }, 3000);
    }

    showJoinSuccess(): void {
        const successOverlay = this.uiManager.createSuccessOverlay('join');
        document.body.appendChild(successOverlay);
        setTimeout(() => {
            const overlay = document.getElementById('join-success-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }, 2000);
    }

    showStartSuccess(successMessage: string, playerCount: number): void {
        const successOverlay = this.uiManager.createStartSuccessOverlay(successMessage, playerCount);
        document.body.appendChild(successOverlay);
        setTimeout(() => {
            const overlay = document.getElementById('start-success-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }, 3000);
    }

    showExitSuccess(message: string): void {
        const successOverlay = this.uiManager.createExitSuccessOverlay(message);
        document.body.appendChild(successOverlay);
        setTimeout(() => {
            const overlay = document.getElementById('exit-success-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }, 2000);
    }

    showCreateError(errorMessage: string): void {
        this.showInputError('create', errorMessage);
        alert(errorMessage);
    }

    showJoinError(errorMessage: string): void {
        this.showInputError('join', errorMessage);
        alert(errorMessage);
    }

    showStartError(errorMessage: string): void {
        alert(errorMessage);
    }

    showRefreshError(errorMessage: string): void {
        const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLElement;
        if (refreshButton) {
            refreshButton.innerHTML = TournamentIcons.getErrorIcon();
            setTimeout(() => {
                refreshButton.innerHTML = TournamentIcons.getRefreshIcon();
            }, 2000);
        }
        alert(errorMessage);
    }

    showExitError(errorMessage: string): void {
        alert(errorMessage);
    }

    showInputError(inputType: 'join' | 'create', message: string): void {
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

    showInputSuccess(inputType: string): void {
        const input = document.getElementById(`${inputType}Input`) as HTMLInputElement;
        if (input) {
            input.style.borderColor = '#10b981';
            input.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
        }
    }

    clearInputError(inputType: string): void {
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

    showRefreshSuccess(): void {
        const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLElement;
        if (refreshButton) {
            refreshButton.innerHTML = TournamentIcons.getSuccessCheckIcon();
            setTimeout(() => {
                refreshButton.innerHTML = TournamentIcons.getRefreshIcon();
            }, 1000);
        }
    }

    resetRefreshButton(): void {
        const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLElement;
        if (refreshButton) {
            refreshButton.innerHTML = TournamentIcons.getRefreshIcon();
            refreshButton.classList.remove('animate-spin');
        }
    }

    resetStartButton(canStart: boolean, uiManager: any): void {
        const startButton = document.getElementById('start-button');
        if (startButton && canStart) {
            startButton.innerHTML = uiManager.createActiveStartButtonHTML();
            (startButton as HTMLButtonElement).disabled = false;
        }
    }

    showRefreshLoading(loadingManager: any): void {
        const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLElement;
        if (refreshButton) {
            refreshButton.innerHTML = loadingManager.createRefreshLoadingHTML();
            refreshButton.classList.add('animate-spin');
        }
        const playersList = document.getElementById('list-player');
        if (playersList) {
            playersList.innerHTML = loadingManager.createPlayersLoadingHTML();
        }
    }

    performRealTimeValidation(input: HTMLInputElement): void {
        const value = input.value.trim();
        const inputType = input.id === 'createInput' ? 'create' : 'join';
        this.clearInputError(inputType);
        if (value.length > 0 && value.length < 3) {
            this.showInputError(inputType, 'En az 3 karakter gerekli');
            return;
        }
        if (inputType === 'create' && value.length > 50) {
            this.showInputError(inputType, 'En fazla 50 karakter olabilir');
            return;
        }
        if (value.length >= 3) {
            this.showInputSuccess(inputType);
        }
    }
}
