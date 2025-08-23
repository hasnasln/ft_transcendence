import { _apiManager } from '../../api/APIManager';
import { getTournamentFormat, getOptimalTournamentSize, calculateByes } from './MainRenderer';
import { TournamentResponseMessages } from '../../api/types';
import { ModernOverlay } from '../../components/ModernOverlay';
import { askUser } from '../../router';
import { exmp } from '../../lang/languageManager';

export class TournamentValidation {
        validateTournamentStatus(data: any, status: boolean): Promise<{ isValid: boolean; message: string }> {
        return _apiManager.getTournament(data.code)
        .then((response) => {
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
            }
            return { isValid: true, message: '' };
        })
        .catch((error) => {
            ModernOverlay.show('global-error', 'error');
            return Promise.reject();
        })
        
    }

    async askTournamentConfirmation(title: string, message: string, acceptText: string = "", cancelText: string = ""): Promise<boolean> {
        const defaultAcceptText = acceptText || exmp.getLang('tournament-confirmation.exit-participant-accept');
        const defaultCancelText = cancelText || exmp.getLang('tournament-confirmation.cancel');
        const fullMessage = `${title}\n\n${message}`;
        return await askUser(fullMessage, defaultAcceptText, defaultCancelText);
    }

    async confirmTournamentStart(playerCount: number): Promise<boolean> {
        const format = getTournamentFormat(playerCount);
        const optimalSize = getOptimalTournamentSize(playerCount);
        const byes = calculateByes(playerCount);
        
        const title = exmp.getLang('tournament-confirmation.start-title');
        const messagePart = exmp.getLang('tournament-confirmation.start-message-with-players');
        const warning = exmp.getLang('tournament-confirmation.start-warning');
        const acceptText = exmp.getLang('tournament-confirmation.start-accept');
        const cancelText = exmp.getLang('tournament-confirmation.cancel');
        
        let message = `${playerCount} ${messagePart}\n\n${warning}`;

        return this.askTournamentConfirmation(title, message, acceptText, cancelText);
    }

    async confirmTournamentExit(isAdmin: boolean): Promise<boolean> {
        let title: string;
        let message: string;
        let confirmText: string;
        
        const cancelText = exmp.getLang('tournament-confirmation.cancel');

        if (isAdmin) {
            title = exmp.getLang('tournament-confirmation.exit-admin-title');
            const adminMessage = exmp.getLang('tournament-confirmation.exit-admin-message');
            const adminWarning = exmp.getLang('tournament-confirmation.exit-admin-warning');
            message = `${adminMessage}\n\n${adminWarning}`;
            confirmText = exmp.getLang('tournament-confirmation.exit-admin-accept');
        } else {
            title = exmp.getLang('tournament-confirmation.exit-participant-title');
            message = exmp.getLang('tournament-confirmation.exit-participant-message');
            confirmText = exmp.getLang('tournament-confirmation.exit-participant-accept');
        }

        return this.askTournamentConfirmation(title, message, confirmText, cancelText);
    }
}