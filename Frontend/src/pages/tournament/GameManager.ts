import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from '../../components/ModernOverlay';
import { ITournament, TournamentResponseMessages } from '../../api/types';
import { gameInstance } from '../play';
import { Router } from '../../router';

export class TournamentGameManager {
    private data: ITournament;
    private status: boolean;
    private validation: any;
    private uiManager: any;

    constructor(data: ITournament, status: boolean, validation: any, uiManager: any) {
        this.data = data;
        this.status = status;
        this.validation = validation;
        this.uiManager = uiManager;
    }

    async handlePlay(): Promise<void> {
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
        } catch (error) {
            console.error('Error starting game:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            this.handleGameError();
        }
    }

    setPlayButtonLoading(): void {
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.innerHTML = this.uiManager.createLoadingButtonHTML();
            (playButton as HTMLButtonElement).disabled = true;
        }
    }

    private async performFinalTournamentCheck(): Promise<{ isValid: boolean; message: string }> {
        const response = await _apiManager.getTournament(this.data.code);
        if (!response.data?.tournament_start) {
            return {
                isValid: false,
                message: `tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`
            };
        }
        return { isValid: true, message: '' };
    }

    private async initializeGame(): Promise<void> {
        console.log('Initializing game with tournament data:', this.data.code);
        gameInstance.preparePlayProcess(true, this.data.code)
            .then(() => {
                Router.getInstance().go("/game");
                requestAnimationFrame(() => {
                    gameInstance.startPlayProcess();
                });
         });
    }


    private handleGameError(): void {
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

    private resetPlayButton(): void {
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.innerHTML = this.uiManager.createNormalPlayButtonHTML();
            (playButton as HTMLButtonElement).disabled = false;
        }
    }

    updateData(newData: ITournament, newStatus: boolean): void {
        this.data = newData;
        this.status = newStatus;
    }
}
