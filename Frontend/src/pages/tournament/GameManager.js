import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from '../../components/ModernOverlay';
import { TournamentResponseMessages } from '../../api/types';
import { gameInstance } from '../play';
import { Router } from '../../router';
export class TournamentGameManager {
    data;
    status;
    validation;
    uiManager;
    constructor(data, status, validation, uiManager) {
        this.data = data;
        this.status = status;
        this.validation = validation;
        this.uiManager = uiManager;
    }
    async handlePlay() {
        try {
            const validationResult = await this.validation.validateTournamentStatus(this.data, this.status);
            if (!validationResult.isValid) {
                ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`, 'error');
                return;
            }
            this.setPlayButtonLoading();
            const finalCheck = await this.performFinalTournamentCheck();
            if (!finalCheck.isValid) {
                ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`, 'error');
                return;
            }
            await this.initializeGame();
        }
        catch (error) {
            console.error('Error starting game:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            this.handleGameError();
        }
    }
    setPlayButtonLoading() {
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.innerHTML = this.uiManager.createLoadingButtonHTML();
            playButton.disabled = true;
        }
    }
    async performFinalTournamentCheck() {
        try {
            const response = await _apiManager.getTournament(this.data.code);
            if (!response.data?.tournament_start) {
                return {
                    isValid: false,
                    message: `tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`
                };
            }
            return { isValid: true, message: '' };
        }
        catch (error) {
            ModernOverlay.show('global-error', 'error');
            return { isValid: false, message: 'global-error' };
        }
    }
    async initializeGame() {
        console.log('Initializing game with tournament data:', this.data.code);
        gameInstance.preparePlayProcess(true, this.data.code)
            .then(async () => {
            await Router.getInstance().go("/game");
            requestAnimationFrame(() => {
                gameInstance.startPlayProcess();
            });
        });
    }
    handleGameError() {
        const tournamentContainer = this.uiManager.findTournamentContainer();
        if (tournamentContainer) {
            tournamentContainer.style.display = 'block';
        }
        const gameWrapper = document.getElementById('game-wrapper');
        if (gameWrapper) {
            gameWrapper.remove();
        }
        this.resetPlayButton();
    }
    resetPlayButton() {
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.innerHTML = this.uiManager.createNormalPlayButtonHTML();
            playButton.disabled = false;
        }
    }
    updateData(newData, newStatus) {
        this.data = newData;
        this.status = newStatus;
    }
}
