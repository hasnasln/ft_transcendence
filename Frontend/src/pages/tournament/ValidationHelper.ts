import { _apiManager } from '../../api/APIManager';
import { getTournamentFormat, getOptimalTournamentSize, calculateByes } from './MainRenderer';

export class TournamentValidation {
    validateCreateInput(input: HTMLInputElement): { isValid: boolean; tournamentName: string; message: string } {
        const tournamentName = input?.value?.trim() || '';
        if (!tournamentName) {
            return {
                isValid: false,
                tournamentName: '',
                message: '⚠️ Lütfen turnuva adını girin!'
            };
        }
        if (tournamentName.length < 3) {
            return {
                isValid: false,
                tournamentName: '',
                message: '⚠️ Turnuva adı en az 3 karakter olmalıdır!'
            };
        }
        if (tournamentName.length > 50) {
            return {
                isValid: false,
                tournamentName: '',
                message: '⚠️ Turnuva adı en fazla 50 karakter olabilir!'
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
                message: '⚠️ Lütfen turnuva ID\'sini girin!'
            };
        }
        if (tournamentId.length < 3) {
            return {
                isValid: false,
                tournamentId: '',
                message: '⚠️ Turnuva ID en az 3 karakter olmalıdır!'
            };
        }
        return {
            isValid: true,
            tournamentId,
            message: ''
        };
    }

    validateTournamentStart(playerCount: number): { isValid: boolean; message: string } {
        const minPlayers = 2;
        const maxPlayers = 10;
        if (playerCount < minPlayers) {
            return {
                isValid: false,
                message: `⚠️ Turnuva başlatmak için en az ${minPlayers} oyuncu gerekli!\n\nŞu an: ${playerCount} oyuncu`
            };
        }
        if (playerCount > maxPlayers) {
            return {
                isValid: false,
                message: `⚠️ Turnuva maksimum ${maxPlayers} oyuncu ile sınırlıdır!\n\nŞu an: ${playerCount} oyuncu`
            };
        }
        return { isValid: true, message: '' };
    }

    async validateTournamentStatus(data: any, status: boolean): Promise<{ isValid: boolean; message: string }> {
        const response = await _apiManager.getTournament(data.code);
        if (!response.data.tournament_start && !status) {
            return {
                isValid: false,
                message: '⚠️ Turnuva henüz başlatılmamış!\n\nAdmin tarafından turnuva başlatılmasını bekleyin.'
            };
        }
        const playButton = document.getElementById('play-button');
        if (playButton && playButton.style.visibility === 'hidden') {
            return {
                isValid: false,
                message: '🎮 Oyun zaten başlatılmış!\n\nLütfen bekleyin...'
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
