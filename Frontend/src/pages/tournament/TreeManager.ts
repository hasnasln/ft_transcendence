import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from '../../components/ModernOverlay';
import { ITournament } from '../../api/types';
import { TournamentIcons } from './IconsHelper';
import { tournament10, tournament5 } from './10and5';
import {ParticipantStatus, Participant, TournamentStatus, MatchStatus, TournamentData, TournamentStart, Round, Match} from './10and5';

export class TournamentTreeManager {
    private data: ITournament;
    private uiManager: any;

    constructor(data: ITournament, uiManager: any) {
        this.data = data;
        this.uiManager = uiManager;
    }

    async handleTree(flag: boolean = true): Promise<void> {
        if (flag) // reflesh de de aynı fonsiyonu kullanmak için yaptım
        {
            this.removeExistingTreeModal(); // inerhtml kullandığımız için buna gerek olmayabilir
            this.createTreeLoadingOverlay();
        }
        _apiManager.getTournament(this.data.code)
        .then((response) => {
            if(flag) {
                this.createTreeModalOverlay(response.data);
                console.log('Tournament data:', response.data);
            }
            return response;
        })
        .then((response) => {
            this.removeTreeLoadingOverlay();
            if (response.success) {
                if (response.data.status != 'created')
                {
                    // const x = this.renderTournamentTree(response.data?.tournament_start?.rounds!);
                    const x = this.renderTournamentTree(response.data?.tournament_start?.rounds!);
                    const treeContainer = document.getElementById('tree-container');
                    if (!treeContainer) return;
                    treeContainer.innerHTML = x;
                }
                else {
                    const treeContainer = document.getElementById('tree-container');
                    if (!treeContainer) return;
                    ModernOverlay.show('tournament-messages.ERR_TOURNAMENT_NOT_STARTED', 'error');
                }
            } else {
                ModernOverlay.show(`tournament-messages.${response.messageKey}`, 'error');
            }
        })
        .then(() => {
            if (!flag) return; // sadece ilk çağrıda event listener ekle
            this.setupTreeModalEventListeners();
        });
    }

    private removeExistingTreeModal(): void {
        const existingOverlay = document.getElementById('tree-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
    }

    private createTreeLoadingOverlay(): void {
        const overlay = document.createElement('div');
        overlay.id = 'tree-loading-overlay';
        overlay.innerHTML = this.uiManager.createTreeLoadingHTML();
        document.body.appendChild(overlay);
    }

    private removeTreeLoadingOverlay(): void {
        const overlay = document.getElementById('tree-loading-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    private createTreeModalOverlay(treeData: any): void {
        const overlay = document.createElement('div');
        overlay.id = 'tree-overlay';
        overlay.innerHTML = this.uiManager.createTreeModalHTML(treeData);
        document.body.appendChild(overlay);
    }

    private setupTreeModalEventListeners(): void {
        const closeButton = document.getElementById('close-tree-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeTreeModal());
        }
        const refreshButton = document.getElementById('refresh-tree');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshTreeData());
        }

        const overlay = document.getElementById('tree-overlay');
        if( overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeTreeModal();
                }
            });
        }
    }

    private thisisWinner(winner: Participant[], participant: Participant): boolean {
        return winner.some(p => p.uuid === participant.uuid);
    }

    private  renderTournamentTree(rounds: Round[]): string {
        console.log('Rendering tournament tree with rounds:', rounds);
        const roundsHtml = rounds.map((round) => `
            <div class="tournament-round">
                <div class="round-title">
                    ${round.round_number}. TUR
                </div>
                <div class="matches-container">
                    ${round.matches.map(match => `
                        <div class="match-card">
                            <div class="match-status status-${match.status}">
                                ${match.status === MatchStatus.CREATED ? '⏱' : 
                                match.status === MatchStatus.ONGOING ? '🎮' :
                                match.status === MatchStatus.CANCELLED ? 'X' : '✓'
                            }
                            </div>
                            <div class="player ${
                                match.status === MatchStatus.CREATED ? '' : 
                                round.winners && this.thisisWinner(round.winners, match.participant1) ? 'winner' : 'loser'
                            }">
                                <span>${match.participant1.username}</span>
                                <div class="player-status">
                                    ${round.winners && this.thisisWinner(round.winners, match.participant1) ? '<span class="trophy">🏆</span>' : ''}
                                </div>
                            </div>
                            <div class="vs-divider">VS</div>
                            <div class="player ${
                                match.status === MatchStatus.CREATED ? '' : 
                                round.winners && this.thisisWinner(round.winners, match.participant2) ? 'winner' : 'loser'
                            }">
                                <span>${match.participant2.username}</span>
                                <div class="player-status">
                                    ${round.winners && this.thisisWinner(round.winners, match.participant2) ? '<span class="trophy">🏆</span>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="tournament-container">
                <div class="tournament-bracket">
                    ${roundsHtml}
                </div>
            </div>
        `;
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
            if (refreshButton) {
                refreshButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        ${TournamentIcons.getRefreshIcon()}
                        <span>Yenile</span>
                    </div>
                `;
                this.handleTree(false); // Refresh the tree data
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateData(newData: ITournament): void {
        this.data = newData;
    }
}
