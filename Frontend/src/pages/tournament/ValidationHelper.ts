import { _apiManager } from '../../api/APIManager';
import { getTournamentFormat, getOptimalTournamentSize, calculateByes } from './MainRenderer';
import { TournamentResponseMessages } from '../../api/types';
import { ModernOverlay } from '../../components/ModernOverlay';
import { askUser } from '../../router';

export class TournamentValidation {
    async validateTournamentStatus(data: any, status: boolean): Promise<{ isValid: boolean; message: string }> {
        const response = await _apiManager.getTournament(data.code);
        if (!response.data.tournament_start && !status) {
            ModernOverlay.show('tournament-messages.ERR_TOURNAMENT_NOT_STARTABLE', 'error');
            return {
                isValid: false,
                message: `tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`
            };
        }
        const playButton = document.getElementById('play-button');
        if (playButton && playButton.style.visibility === 'hidden') {
            ModernOverlay.show('tournament-messages.ERR_TOURNAMENT_NOT_MATCH_JOINABLE', 'error');
            return {
                isValid: false,
                message: `tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_MATCH_JOINABLE}`
            };
        }
        return { isValid: true, message: '' };
    }

    async askTournamentConfirmation(title: string, message: string): Promise<boolean> {
        const fullMessage = `${title}\n\n\n${message}`;
        return await askUser(fullMessage);
    }

    async confirmTournamentStart(playerCount: number): Promise<boolean> {
        const format = getTournamentFormat(playerCount);
        const optimalSize = getOptimalTournamentSize(playerCount);
        const byes = calculateByes(playerCount);
        
        let message = `${playerCount} oyuncu ile turnuva başlatılacak.\n\n`;
        message += `⚠️ Bu işlem geri alınamaz!`;

        return this.askTournamentConfirmation(
            '🏆 Turnuva Başlatma Onayı',
            message
        );
    }

    async confirmTournamentExit(isAdmin: boolean): Promise<boolean> {
        let title: string;
        let message: string;
        let confirmText: string;

        if (isAdmin) {
            title = '🚨 Turnuva Silme Onayı';
            message = `Admin olarak çıkarsanız turnuva silinecek!\n\n`;
            message += `⚠️ Bu işlem geri alınamaz!`;
            confirmText = 'Sil';
        } else {
            title = '👋 Turnuvadan Ayrıl';
            message = `Turnuvadan ayrılmak istediğinizden emin misiniz?`;
            confirmText = 'Ayrıl';
        }

        return this.askTournamentConfirmation(title, message);
    }
}