import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from './ModernOverlay';
import { ITournament } from '../../api/types';
import { PlayPage } from '../play-page';
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
                this.showValidationError(validationResult.message);
                return;
            }
            
            this.setPlayButtonLoading();
            const finalCheck = await this.performFinalTournamentCheck();
            if (!finalCheck.isValid) {
                this.showValidationError(finalCheck.message);
                return;
            }
            
            await this.initializeGame();
        } catch (error) {
            console.error('Error starting game:', error);
            this.showGameError('❌ Oyun başlatılırken hata oluştu!\n\nLütfen tekrar deneyin.');
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
                message: '⚠️ Turnuva durumu değişti! Admin tarafından henüz başlatılmamış.'
            };
        }
        return { isValid: true, message: '' };
    }

    private async initializeGame(): Promise<void> {
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

    private showValidationError(message: string): void {
        ModernOverlay.show(message, 'error');
    }

    private showGameError(message: string): void {
        ModernOverlay.show(message, 'error');
    }

    updateData(newData: ITournament, newStatus: boolean): void {
        this.data = newData;
        this.status = newStatus;
    }
}
