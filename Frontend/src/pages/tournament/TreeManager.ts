import { _apiManager } from '../../api/APIManager';
import { ITournament } from '../../api/types';
import { getTournamentTree } from './BracketRenderer';
import { TournamentIcons } from './IconsHelper';

export class TournamentTreeManager {
    private data: ITournament;
    private uiManager: any;

    constructor(data: ITournament, uiManager: any) {
        this.data = data;
        this.uiManager = uiManager;
    }

    async handleTree(): Promise<void> {
        try {
            this.removeExistingTreeModal();
            this.showTreeLoading();
            const treeResult = await this.performTreeGeneration();
            if (treeResult.success) {
                this.handleTreeSuccess(treeResult.data);
            } else {
                this.handleTreeError(treeResult.message);
            }
        } catch (error) {
            console.error('Error generating tournament tree:', error);
            this.handleTreeError('❌ Turnuva ağacı oluşturulurken hata oluştu!\n\nLütfen tekrar deneyin.');
        }
    }

    private removeExistingTreeModal(): void {
        const existingOverlay = document.getElementById('tree-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
    }

    private showTreeLoading(): void {
        const loadingOverlay = this.createTreeLoadingOverlay();
        document.body.appendChild(loadingOverlay);
    }

    private createTreeLoadingOverlay(): HTMLElement {
        const overlay = document.createElement('div');
        overlay.id = 'tree-loading-overlay';
        overlay.innerHTML = this.uiManager.createTreeLoadingHTML();
        return overlay;
    }

    private async performTreeGeneration(): Promise<{ success: boolean; data?: any; message: string }> {
        try {
            const participants = this.data.participants.map(user => user.username);
            const tournamentData = await _apiManager.getTournament(this.data.code);
            if (tournamentData.success && tournamentData.data) {
                const realTournamentData = {
                    matches: tournamentData.data.matches || [],
                    participants: participants,
                    currentRound: tournamentData.data.currentRound || 1,
                    status: tournamentData.data.status || 'pending'
                };
                return {
                    success: true,
                    data: {
                        participants,
                        tournamentData: realTournamentData,
                        playerCount: this.data.participants.length
                    },
                    message: '✅ Turnuva ağacı başarıyla oluşturuldu!'
                };
            } else {
                return {
                    success: true,
                    data: {
                        participants,
                        tournamentData: null,
                        playerCount: this.data.participants.length
                    },
                    message: '⚠️ Turnuva verisi alınamadı, standart ağaç gösteriliyor.'
                };
            }
        } catch (error) {
            console.error('Error fetching tournament data:', error);
            const participants = this.data.participants.map(user => user.username);
            return {
                success: true,
                data: {
                    participants,
                    tournamentData: null,
                    playerCount: this.data.participants.length
                },
                message: '⚠️ Bağlantı hatası, standart ağaç gösteriliyor.'
            };
        }
    }

    private handleTreeSuccess(treeData: any): void {
        this.removeTreeLoadingOverlay();
        this.showTreeModal(treeData);
    }

    private handleTreeError(errorMessage: string): void {
        this.removeTreeLoadingOverlay();
        this.showTreeError(errorMessage);
    }

    private removeTreeLoadingOverlay(): void {
        const overlay = document.getElementById('tree-loading-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    private showTreeModal(treeData: any): void {
        const treeOverlay = this.createTreeModalOverlay(treeData);
        document.body.appendChild(treeOverlay);
        this.setupTreeModalEventListeners();
    }

    private createTreeModalOverlay(treeData: any): HTMLElement {
        const overlay = document.createElement('div');
        overlay.id = 'tree-overlay';
        overlay.innerHTML = this.uiManager.createTreeModalHTML(treeData);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeTreeModal();
            }
        });
        return overlay;
    }

    private setupTreeModalEventListeners(): void {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.closeTreeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        const closeButton = document.getElementById('close-tree-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeTreeModal());
        }
        const refreshButton = document.getElementById('refresh-tree');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshTreeData());
        }
        requestAnimationFrame(() => {
            this.renderTournamentTree();
        });
    }

    private renderTournamentTree(): void {
        const treeContainer = document.getElementById('tree-container');
        if (!treeContainer) return;
        try {
            const participants = this.data.participants.map(user => user.username);
            getTournamentTree(treeContainer, participants);
        } catch (error) {
            console.error('Error rendering tournament tree:', error);
            treeContainer.innerHTML = this.uiManager.createTreeErrorHTML();
        }
    }

    private closeTreeModal(): void {
        const overlay = document.getElementById('tree-overlay');
        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }

    private async refreshTreeData(): Promise<void> {
        const refreshButton = document.getElementById('refresh-tree');
        if (refreshButton) {
            refreshButton.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Yenileniyor...</span>
                </div>
            `;
        }
        try {
            await this.delay(500); 
            this.renderTournamentTree();
            if (refreshButton) {
                refreshButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        ${TournamentIcons.getRefreshIcon()}
                        <span>Yenile</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error refreshing tree:', error);
            if (refreshButton) {
                refreshButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        ${TournamentIcons.getRefreshIcon()}
                        <span>Yenile</span>
                    </div>
                `;
            }
        }
    }

    private showTreeError(errorMessage: string): void {
        alert(errorMessage);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateData(newData: ITournament): void {
        this.data = newData;
    }
}
