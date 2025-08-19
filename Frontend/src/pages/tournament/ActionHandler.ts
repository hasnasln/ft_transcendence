import { ITournament, TournamentResponseMessages } from '../../api/types';
import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from '../../components/ModernOverlay';

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
    async createTournament(tournamentName: string): Promise<{ success: boolean; data?: ITournament; message?: string }> {
        try {
            const response = await _apiManager.createTournament(tournamentName);
            if (response.success === false) {
                const messageKey = response.message as TournamentResponseMessages;
                ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                
                return {
                    success: false
                };
            }
            const tdata = this.mapToTournamentData(response.data);
            ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_CREATED}`, 'success');
            return {
                success: true,
                data: tdata
            };
        } catch (error) {
            console.error('Create tournament error:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            return {
                success: false
            };
        }
    }
    async joinTournament(tournamentId: string): Promise<{ success: boolean; data?: ITournament; message?: string }> {
        try {
            if (localStorage.getItem('tdata') === null) {
                const joinResponse = await _apiManager.joinTournament(tournamentId);
                if (joinResponse.success === false) {
                    const messageKey = joinResponse.message as TournamentResponseMessages;
                    ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                    
                    return {
                        success: false
                    };
                }
                const tournamentResponse = await _apiManager.getTournament(tournamentId);
                if (tournamentResponse.success === false) {
                    const messageKey = tournamentResponse.message as TournamentResponseMessages;
                    ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                    
                    return {
                        success: false
                    };
                }
                const tdata = this.mapToTournamentData(tournamentResponse.data);
                tdata.participants = tdata.lobby_members;
                ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.SUCCESS_PARTICIPANT_JOINED}`, 'success');
                return {
                    success: true,
                    data: tdata
                };
            } else {
                const existingData = JSON.parse(localStorage.getItem('tdata')!);
                ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_RETRIEVED_UUID}`, 'success');
                return {
                    success: true,
                    data: existingData
                };
            }
        } catch (error) {
            console.error('Join tournament error:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            return {
                success: false
            };
        }
    }

    async startTournament(): Promise<{ success: boolean; message?: string }> {
        try {        
            const response = await _apiManager.startTournament(this.data.code);
            if (response.success === true) {
                ModernOverlay.show(`tournament-messages.${TournamentResponseMessages.SUCCESS_TOURNAMENT_STARTED}`, 'success');
                return {
                    success: true
                };
            } else {
                const messageKey = response.message as TournamentResponseMessages;
                ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                
                return {
                    success: false
                };
            }
        } catch (error) {
            console.error('Start tournament API error:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            return {
                success: false
            };
        }
    }

    async refreshTournament(): Promise<{ success: boolean; data?: ITournament; message?: string }> {
        try {
            const response = await _apiManager.getTournament(this.data.code);
 
            if (response.success === false) {
                const messageKey = response.message as TournamentResponseMessages;
                ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                
                return {
                    success: false
                };
            }
            if (!response.data) {
                ModernOverlay.show('tournament-messages.ERR_TOURNAMENT_NOT_FOUND', 'error');
                return {
                    success: false
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
            return {
                success: true,
                data: updatedData
            };
        } catch (error) {
            console.error('Refresh API error:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            return {
                success: false
            };
        }
    }
    async exitTournament(): Promise<{ success: boolean; message?: string }> {
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
                ModernOverlay.show(`tournament-messages.${messageKey}`, 'error');
                
                return {
                    success: false
                };
            }

            const successMessageKey = isAdmin && this.data.status === 'ongoing' 
                ? TournamentResponseMessages.SUCCESS_TOURNAMENT_DELETED
                : TournamentResponseMessages.SUCCESS_PARTICIPANT_LEFT;
            
            ModernOverlay.show(`tournament-messages.${successMessageKey}`, 'success');

            return {
                success: response.success
            };

        } catch (error) {
            console.error('Exit action error:', error);
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            return {
                success: false
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
