export class TournamentNotificationManager {
    constructor() {
    }
    showInputSuccess(inputType) {
        const input = document.getElementById(`${inputType}Input`);
        if (input) {
            input.style.borderColor = '#10b981';
            input.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
        }
    }
    clearInputError(inputType) {
        const input = document.getElementById(`${inputType}Input`);
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
    showRefreshLoading(loadingManager) {
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.innerHTML = loadingManager.createRefreshLoadingHTML();
            refreshButton.classList.add('animate-spin');
        }
        const playersList = document.getElementById('list-player');
        if (playersList) {
            playersList.innerHTML = loadingManager.createPlayersLoadingHTML();
        }
    }
    performRealTimeValidation(input) {
        const inputType = input.id === 'createInput' ? 'create' : 'join';
        this.clearInputError(inputType);
        if (input.value.trim().length > 0) {
            this.showInputSuccess(inputType);
        }
    }
}
