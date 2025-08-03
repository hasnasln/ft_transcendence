import { ITournament } from '../../api/types';
import { _apiManager } from '../../api/APIManager';

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
            // if (localStorage.getItem('tdata') !== null) {
            //     const existingData = JSON.parse(localStorage.getItem('tdata')!);
            //     existingData.name = tournamentName;
            //     return {
            //         success: true,
            //         data: existingData,
            //         message: '✅ Turnuva adı güncellendi!'
            //     };
            // }
            const response = await _apiManager.createTournament(tournamentName);
            if (response.success === false) {
                return {
                    success: false,
                    message: response.message || '❌ Turnuva oluşturulamadı!\n\nLütfen tekrar deneyin.'
                };
            }
            const tdata: ITournament = {
                id: response.data.id,
                code: response.data.code,
                name: response.data.name,
                admin_id: response.data.admin_id,
                lobby_members: response.data.participants || []
            };
            return {
                success: true,
                data: tdata,
                message: '✅ Turnuva başarıyla oluşturuldu!'
            };
        } catch (error) {
            console.error('Create tournament error:', error);
            return {
                success: false,
                message: '❌ Bağlantı hatası!\n\nİnternet bağlantınızı kontrol edin.'
            };
        }
    }
    async joinTournament(tournamentId: string): Promise<{ success: boolean; data?: ITournament; message: string }> {
        try {
            if (localStorage.getItem('tdata') === null) {
                const joinResponse = await _apiManager.joinTournament(tournamentId);
                if (joinResponse.success === false) {
                    return {
                        success: false,
                        message: joinResponse.message || '❌ Turnuvaya katılım başarısız!\n\nLütfen tekrar deneyin.'
                    };
                }
                const tournamentResponse = await _apiManager.getTournament(tournamentId);
                if (tournamentResponse.success === false) {
                    return {
                        success: false,
                        message: '❌ Turnuva bilgileri alınamadı!\n\nLütfen tekrar deneyin.'
                    };
                }
                const tdata: ITournament = {
                    id: tournamentResponse.data.id,
                    code: tournamentResponse.data.code,
                    name: tournamentResponse.data.name,
                    admin_id: tournamentResponse.data.admin_id,
                    lobby_members: tournamentResponse.data.participants
                };
                return {
                    success: true,
                    data: tdata,
                    message: '✅ Turnuvaya başarıyla katıldınız!'
                };
            } else {
                const existingData = JSON.parse(localStorage.getItem('tdata')!);
                return {
                    success: true,
                    data: existingData,
                    message: '✅ Turnuva sayfasına yönlendiriliyorsunuz...'
                };
            }
        } catch (error) {
            console.error('Join tournament error:', error);
            return {
                success: false,
                message: '❌ Bağlantı hatası!\n\nİnternet bağlantınızı kontrol edin.'
            };
        }
    }

    async startTournament(): Promise<{ success: boolean; message: string }> {
        try {        
            const response = await _apiManager.startTournament(this.data.code);
            console.log('Tournament start response:', response);
            if (response.success === true) {
                return {
                    success: true,
                    message: '🎉 Turnuva başarıyla başlatıldı!\n\nOyuncular artık maçlarına katılabilir.'
                };
            } else {
                return {
                    success: false,
                    message: response.message || '❌ Turnuva başlatılırken hata oluştu!\n\nLütfen tekrar deneyin.'
                };
            }
        } catch (error) {
            console.error('Start tournament API error:', error);
            return {
                success: false,
                message: '❌ Bağlantı hatası!\n\nİnternet bağlantınızı kontrol edin.'
            };
        }
    }

    async refreshTournament(): Promise<{ success: boolean; data?: ITournament; message: string }> {
        try {
            console.log('ActionHandler refreshTournament called with code:', this.data.code);
            console.log('Current tournament data:', this.data);
            
            const response = await _apiManager.getTournament(this.data.code);
            console.log('API response:', response);
            
            if (response.success === false) {
                return {
                    success: false,
                    message: response.message || '❌ Turnuva verileri alınamadı!'
                };
            }
            if (!response.data) {
                return {
                    success: false,
                    message: '❌ Turnuva verisi bulunamadı!'
                };
            }
            console.log("refresh-->>>>", response);
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
                data: updatedData,
                message: '✅ Veriler başarıyla güncellendi!'
            };
        } catch (error) {
            console.error('Refresh API error:', error);
            return {
                success: false,
                message: '❌ Bağlantı hatası!\n\nİnternet bağlantınızı kontrol edin.'
            };
        }
    }
    async exitTournament(): Promise<{ success: boolean; message: string }> {
        const isAdmin = this.data.admin_id === localStorage.getItem('uuid');
        try {
            let response;
            if (isAdmin && this.data.status === 'ongoing') {
                response = await _apiManager.deleteTournament(this.data.code);
            } else {
                response = await _apiManager.leaveTournament(this.data.code);
            }

            if (response.code === 404) {
                response.success = true; // accept not found is a success of not existence
            }

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || '❌ Turnuvadan çıkarken hata oluştu!'
                };
            }

            return {
                success: response.success,
                message: response.message || '✅ Turnuvadan başarıyla ayrıldınız!'
            };

        } catch (error) {
            console.error('Exit action error:', error);
            return {
                success: false,
                message: '❌ İşlem sırasında bir hata oluştu!'
            };
        }
    }
}
