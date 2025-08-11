import { _apiManager } from '../../api/APIManager';
import { getTournamentFormat, getOptimalTournamentSize, calculateByes } from './MainRenderer';
import { TournamentResponseMessages } from '../../api/types';
import { exmp } from '../../languageManager';

export class TournamentValidation {
    validateCreateInput(input: HTMLInputElement): { isValid: boolean; tournamentName: string; message: string } {
        const tournamentName = input?.value?.trim() || '';
        if (!tournamentName) {
            return {
                isValid: false,
                tournamentName: '',
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NAME_REQUIRED}`)
            };
        }
        if (tournamentName.length < 3) {
            return {
                isValid: false,
                tournamentName: '',
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NAME_EMPTY}`)
            };
        }
        if (tournamentName.length > 50) {
            return {
                isValid: false,
                tournamentName: '',
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NAME_TOO_LONG}`)
            };
        }
        return {
            isValid: true,
            tournamentName,
            message: ''
        };
    }

    validateJoinInput(input: HTMLInputElement): { isValid: boolean; tournamentId: string; message: string } {
        const tournamentId = input?.value?.trim() || '';
        if (!tournamentId) {
            return {
                isValid: false,
                tournamentId: '',
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_FOUND}`)
            };
        }
        return {
            isValid: true,
            tournamentId,
            message: ''
        };
    }

    validateTournamentStart(playerCount: number): { isValid: boolean; message: string } {
        if (playerCount < 2) {
            return {
                isValid: false,
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_NOT_ENOUGH_PARTICIPANTS}`)
            };
        }
        return { isValid: true, message: '' };
    }

    async validateTournamentStatus(data: any, status: boolean): Promise<{ isValid: boolean; message: string }> {
        const response = await _apiManager.getTournament(data.code);
        if (!response.data.tournament_start && !status) {
            return {
                isValid: false,
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_STARTABLE}`)
            };
        }
        const playButton = document.getElementById('play-button');
        if (playButton && playButton.style.visibility === 'hidden') {
            return {
                isValid: false,
                message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.ERR_TOURNAMENT_NOT_MATCH_JOINABLE}`)
            };
        }
        return { isValid: true, message: '' };
    }

    createStartConfirmationMessage(playerCount: number): string {
        const format = getTournamentFormat(playerCount);
        const optimalSize = getOptimalTournamentSize(playerCount);
        const byes = calculateByes(playerCount);
        let message = `🏆 Turnuva Başlatma Onayı\n\n`;
        message += `📊 Oyuncu Sayısı: ${playerCount}\n`;
        message += `⚡ Format: ${format}\n`;
        message += `🎯 Optimal Boyut: ${optimalSize}\n`;
        if (byes > 0) {
            message += `🎭 Bye Alan: ${byes} oyuncu\n`;
        }
        message += `\n⚠️ Dikkat:\n`;
        message += `• Turnuva başladıktan sonra yeni oyuncu katılamaz\n`;
        message += `• Tüm oyuncular maçlarına katılabilir\n`;
        message += `• Bu işlem geri alınamaz\n`;
        message += `\n🎮 Turnuva başlatılsın mı?`;
        return message;
    }

    createExitConfirmationMessage(isAdmin: boolean): string {
        if (isAdmin) {
            return `🚨 Turnuva Silme Onayı\n\n` +
                   `Turnuva admin'i olarak çıkış yapmak turnuvayı tamamen silecektir!\n\n` +
                   `⚠️ Bu işlem geri alınamaz!\n` +
                   `• Tüm katılımcılar turnuvadan çıkarılacak\n` +
                   `• Turnuva verileri silinecek\n` +
                   `• Devam eden maçlar sonlandırılacak\n\n` +
                   `Turnuvayı silmek istediğinizden emin misiniz?`;
        } else {
            return `👋 Turnuvadan Ayrılma Onayı\n\n` +
                   `Turnuvadan ayrılmak istediğinizden emin misiniz?\n\n` +
                   `⚠️ Dikkat:\n` +
                   `• Turnuvadaki yeriniz kaybolacak\n` +
                   `• Tekrar katılmak için admin onayı gerekebilir\n` +
                   `• Devam eden maçlarınız iptal edilecek\n\n` +
                   `Ayrılmak istiyor musunuz?`;
        }
    }
}
