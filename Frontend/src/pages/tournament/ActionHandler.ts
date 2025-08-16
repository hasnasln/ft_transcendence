import { ITournament, TournamentResponseMessages } from '../../api/types';
import { _apiManager } from '../../api/APIManager';
import { exmp } from '../../languageManager';

export class TournamentActionHandler {
    private data: ITournament;
    private status: boolean;

    constructor(data: ITournament, status: boolean) {
        this.data = data;
        this.status = status;
    }
    updateData(newData: ITournament, newStatus?: boolean): void {
        this.data = newData;
        if (newStatus !== undefined) {
            this.status = newStatus;
        }
    }
    async createTournament(tournamentName: string): Promise<{ success: boolean; data?: ITournament; message: string }> {
        try {
            const response = await _apiManager.createTournament(tournamentName);
            if (response.success === false) {
                const messageKey = response.message as TournamentResponseMessages;
                const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                return {
                    success: false,
                    message: translatedMessage || response.message || 'Turnuva oluşturulamadı'
                };
            }
            const tdata = this.mapToTournamentData(response.data);
            const successMessage = exmp.getLang(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_CREATED}`);
            return {
                success: true,
                data: tdata,
                message: successMessage
            };
        } catch (error) {
            console.error('Create tournament error:', error);
            return {
                success: false,
                message: exmp.getLang('tournament-messages.ERR_INTERNAL_SERVER')
            };
        }
    }
    async joinTournament(tournamentId: string): Promise<{ success: boolean; data?: ITournament; message: string }> {
        try {
            if (localStorage.getItem('tdata') === null) {
                const joinResponse = await _apiManager.joinTournament(tournamentId);
                if (joinResponse.success === false) {
                    const messageKey = joinResponse.message as TournamentResponseMessages;
                    const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                    return {
                        success: false,
                        message: translatedMessage || joinResponse.message || 'Turnuvaya katılım başarısız'
                    };
                }
                const tournamentResponse = await _apiManager.getTournament(tournamentId);
                if (tournamentResponse.success === false) {
                    const messageKey = tournamentResponse.message as TournamentResponseMessages;
                    const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                    return {
                        success: false,
                        message: translatedMessage || 'Turnuva bilgileri alınamadı'
                    };
                }
                const tdata = this.mapToTournamentData(tournamentResponse.data);
                tdata.participants = tdata.lobby_members; // Add participants field
                const successMessage = exmp.getLang(`tournament-messages.${TournamentResponseMessages.SUCCESS_PARTICIPANT_JOINED}`);
                return {
                    success: true,
                    data: tdata,
                    message: successMessage
                };
            } else {
                const existingData = JSON.parse(localStorage.getItem('tdata')!);
                return {
                    success: true,
                    data: existingData,
                    message: exmp.getLang(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_RETRIEVED_UUID}`)
                };
            }
        } catch (error) {
            console.error('Join tournament error:', error);
            return {
                success: false,
                message: exmp.getLang('tournament-messages.ERR_INTERNAL_SERVER')
            };
        }
    }

    async startTournament(): Promise<{ success: boolean; message: string }> {
        try {        
            const response = await _apiManager.startTournament(this.data.code);
            if (response.success === true) {
                const successMessage = exmp.getLang(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_STARTED}`);
                return {
                    success: true,
                    message: successMessage
                };
            } else {
                const messageKey = response.message as TournamentResponseMessages;
                const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                return {
                    success: false,
                    message: translatedMessage || response.message || 'Turnuva başlatılırken hata oluştu'
                };
            }
        } catch (error) {
            console.error('Start tournament API error:', error);
            return {
                success: false,
                message: exmp.getLang('tournament-messages.ERR_INTERNAL_SERVER')
            };
        }
    }

    async refreshTournament(): Promise<{ success: boolean; data?: ITournament; message: string }> {
        try {
            const response = await _apiManager.getTournament(this.data.code);
 
            if (response.success === false) {
                const messageKey = response.message as TournamentResponseMessages;
                const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                return {
                    success: false,
                    message: translatedMessage || response.message || 'Turnuva verileri alınamadı'
                };
            }
            if (!response.data) {
                return {
                    success: false,
                    message: exmp.getLang('tournament-messages.ERR_TOURNAMENT_NOT_FOUND')
                };
            }
            const updatedData: ITournament = {
                id: response.data.id || this.data.id,
                code: response.data.code || this.data.code,
                name: response.data.name || this.data.name,
                admin_id: response.data.admin_id || this.data.admin_id,
                lobby_members: response.data.participants || response.data.users || [],
                participants: response.data.participants || response.data.users || []
            };
            const successMessage = exmp.getLang(`tournament-messages.${TournamentResponseMessages.SUCCESS_PARTICIPANTS_RETRIEVED}`);
            return {
                success: true,
                data: updatedData,
                message: successMessage
            };
        } catch (error) {
            console.error('Refresh API error:', error);
            return {
                success: false,
                message: exmp.getLang('tournament-messages.ERR_INTERNAL_SERVER')
            };
        }
    }
    async exitTournament(): Promise<{ success: boolean; message: string }> {
        const isAdmin = this.data.admin_id === localStorage.getItem('uuid');
        try {
            let response;
            if (isAdmin && this.data.status === 'created') {
                response = await _apiManager.deleteTournament(this.data.code);
            } else {
                response = await _apiManager.leaveTournament(this.data.code);
            }

            if (response.code === 404) {
                response.success = true;
            }

            if (!response.success) {
                const messageKey = response.message as TournamentResponseMessages;
                const translatedMessage = exmp.getLang(`tournament-messages.${messageKey}`);
                return {
                    success: false,
                    message: translatedMessage || response.message || 'Turnuvadan çıkarken hata oluştu'
                };
            }

            const successMessageKey = isAdmin && this.data.status === 'ongoing' 
                ? TournamentResponseMessages.SUCCESS_TOURNAMENT_DELETED
                : TournamentResponseMessages.SUCCESS_PARTICIPANT_LEFT;
            
            const successMessage = exmp.getLang(`tournament-messages.${successMessageKey}`);

            return {
                success: response.success,
                message: successMessage || response.message || 'İşlem başarıyla tamamlandı'
            };

        } catch (error) {
            console.error('Exit action error:', error);
            return {
                success: false,
                message: exmp.getLang('tournament-messages.ERR_INTERNAL_SERVER')
            };
        }
    }

    private mapToTournamentData(data: any): ITournament {
        return {
            id: data.id,
            code: data.code,
            name: data.name,
            admin_id: data.admin_id,
            lobby_members: data.participants || data.users || []
        };
    }
}
