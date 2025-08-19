import { _apiManager } from '../../api/APIManager';
import { getTournamentFormat, getOptimalTournamentSize, calculateByes } from './MainRenderer';
import { TournamentResponseMessages } from '../../api/types';
import { exmp } from '../../languageManager';
import { ModernOverlay } from '../../components/ModernOverlay';

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
