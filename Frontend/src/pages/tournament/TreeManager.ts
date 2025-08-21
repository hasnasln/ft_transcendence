import { _apiManager } from '../../api/APIManager';
import { ModernOverlay } from '../../components/ModernOverlay';
import { TournamentIcons } from './IconsHelper';
import { tournament10, tournament5 } from './tournamentTypes';
import {Participant, MatchStatus, TournamentData,  Round} from './tournamentTypes';
import { exmp } from '../../lang/languageManager';

export class TournamentTreeManager {
    private data: TournamentData;
    private uiManager: any;

    constructor(data: TournamentData, uiManager: any) {
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
            exmp.applyLanguage();
            return response;
        })
        .then((response) => {
            this.removeTreeLoadingOverlay();
            if (response.success) {
                if (response.data.status != 'created')
                {
                    const treeContainer = document.getElementById('tree-container');
                    if (!treeContainer) return;
                    treeContainer.innerHTML = this.renderTournamentTree(response.data?.tournament_start?.rounds!);
                    exmp.applyLanguage();
                }
                else {
                    const treeContainer = document.getElementById('tree-container');
                    if (!treeContainer) return;
                    treeContainer.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-12 text-center">
                            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                            </div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Ağaç Oluşturulamadı</h3>
                            <p class="text-gray-600 text-sm">Turnuva henüz başlatılmadığı için bla bla lba</p>
                            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Sayfayı Yenile</button>
                        </div>
                    `;
                    exmp.applyLanguage();
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
        overlay.innerHTML = this.uiManager.createTreeModalHTML();
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

    // private  renderTournamentTree(rounds: Round[]): string {
    //     console.log('Rendering tournament tree with rounds:', rounds);
    //     const roundsHtml = rounds.map((round) => `
    //         <div class="tournament-round">
    //             <div class="round-title">
    //                   <span class="round-no">${round.round_number}</span>
    //                     <span data-langm-key="tournament-tree.round">TUR</span>
    //             </div>
    //             <div class="matches-container">
    //                 ${round.matches.map(match => `
    //                     <div class="match-card">
    //                         <div class="match-status status-${match.status}">
    //                             ${match.status === MatchStatus.CREATED ? '⏱' : 
    //                             match.status === MatchStatus.ONGOING ? '🎮' :
    //                             match.status === MatchStatus.CANCELLED ? 'X' : '✓'
    //                         }
    //                         </div>
    //                         <div class="player ${
    //                             match.status === MatchStatus.CREATED ? '' : 
    //                             round.winners && this.thisisWinner(round.winners, match.participant1) ? 'winner' : 'loser'
    //                         }">
    //                             <span>${match.participant1.username}</span>
    //                             <div class="player-status">
    //                                 ${round.winners && this.thisisWinner(round.winners, match.participant1) ? '<span class="trophy">🏆</span>' : ''}
    //                             </div>
    //                         </div>
    //                         <div class="vs-divider" data-langm-key="tournament-tree.vs">VS</div>
    //                         <div class="player ${
    //                             match.status === MatchStatus.CREATED ? '' : 
    //                             round.winners && this.thisisWinner(round.winners, match.participant2) ? 'winner' : 'loser'
    //                         }">
    //                             <span>${match.participant2.username}</span>
    //                             <div class="player-status">
    //                                 ${round.winners && this.thisisWinner(round.winners, match.participant2) ? '<span class="trophy">🏆</span>' : ''}
    //                             </div>
    //                         </div>
    //                     </div>
    //                 `).join('')}
    //             </div>
    //         </div>
    //     `).join('');
        
    //     return `
    //         <div class="tournament-container">
    //             <div class="tournament-bracket">
    //                 ${roundsHtml}
    //             </div>
    //         </div>
    //     `;
    // }


    // private renderTournamentTree(rounds: Round[]): string
    // {
    //     console.log('Rendering tournament tree with rounds:', rounds);

    //     const roundsHtml = rounds.map((round) => {
    //     const isFinal =
    //     round.expected_winner_count === 1 &&
    //     (
    //         (round.is_completed && round.winners?.length === 1) ||
    //         (!round.is_completed && (!round.winners || round.winners.length === 0))
    //     );

    //         const roundTitleHtml = isFinal
    //             ? `
    //                 <div class="round-title">
    //                     <span> Final</span>
    //                 </div>
    //             `
    //             : `
    //                 <div class="round-title">
    //                     <span class="round-no">${round.round_number}</span>
    //                     <span data-langm-key="tournament-tree.round">TUR</span>
    //                 </div>
    //             `;

    //         const matchesHtml = round.matches.map(match => `
    //             <div class="match-card">
    //                 <div class="match-status status-${match.status}">
    //                     ${
    //                         match.status === MatchStatus.CREATED   ? '⏱' :
    //                         match.status === MatchStatus.ONGOING   ? '🎮' :
    //                         match.status === MatchStatus.CANCELLED ? 'X'   : '✓'
    //                     }
    //                 </div>

    //                 <div class="player ${
    //                     match.status === MatchStatus.CREATED
    //                         ? ''
    //                         : (round.winners && this.thisisWinner(round.winners, match.participant1) ? 'winner' : 'loser')
    //                 }">
    //                     <span>${match.participant1.username}</span>
    //                     <div class="player-status">
    //                         ${round.winners && this.thisisWinner(round.winners, match.participant1) ? '<span class="trophy">🏆</span>' : ''}
    //                     </div>
    //                 </div>

    //                 <div class="vs-divider" data-langm-key="tournament-tree.vs">VS</div>

    //                 <div class="player ${
    //                     match.status === MatchStatus.CREATED
    //                         ? ''
    //                         : (round.winners && this.thisisWinner(round.winners, match.participant2) ? 'winner' : 'loser')
    //                 }">
    //                     <span>${match.participant2.username}</span>
    //                     <div class="player-status">
    //                         ${round.winners && this.thisisWinner(round.winners, match.participant2) ? '<span class="trophy">🏆</span>' : ''}
    //                     </div>
    //                 </div>
    //             </div>
    //         `).join('');

    //         return `
    //             <div class="tournament-round">
    //                 ${roundTitleHtml}
    //                 <div class="matches-container">
    //                     ${matchesHtml}
    //                 </div>
    //             </div>
    //         `;
    //     }).join('');

    //     return `
    //         <div class="tournament-container">
    //             <div class="tournament-bracket">
    //                 ${roundsHtml}
    //             </div>
    //         </div>
    //     `;
    // }




    private renderTournamentTree(rounds: Round[]): string
{
    console.log('Rendering tournament tree with rounds:', rounds);

    const roundsHtml = rounds.map((round) => {
        const isFinal =
            round.expected_winner_count === 1 &&
            (
                (round.is_completed && round.winners?.length === 1) ||
                (!round.is_completed && (!round.winners || round.winners.length === 0))
            );

        const roundTitleHtml = isFinal
            ? `
                <div class="round-title">
                    <span data-langm-key="tournament-tree.final">Final</span>
                </div>
              `
            : `
                <div class="round-title">
                    <span class="round-no">${round.round_number}</span>
                    <span data-langm-key="tournament-tree.round">TUR</span>
                </div>
              `;

        const matchesHtml = round.matches.map(match => `
            <div class="match-card">
                <div class="match-status status-${match.status}">
                    ${
                        match.status === MatchStatus.CREATED   ? '⏱' :
                        match.status === MatchStatus.ONGOING   ? '🎮' :
                        match.status === MatchStatus.CANCELLED ? 'X'   : '✓'
                    }
                </div>

                <div class="player ${
                    match.status === MatchStatus.CREATED
                        ? ''
                        : (round.winners && this.thisisWinner(round.winners, match.participant1) ? 'winner' : 'loser')
                }">
                    <span>${match.participant1.username}</span>
                    <div class="player-status">
                        ${round.winners && this.thisisWinner(round.winners, match.participant1) ? '<span class="trophy">🏆</span>' : ''}
                    </div>
                </div>

                <div class="vs-divider" data-langm-key="tournament-tree.vs">VS</div>

                <div class="player ${
                    match.status === MatchStatus.CREATED
                        ? ''
                        : (round.winners && this.thisisWinner(round.winners, match.participant2) ? 'winner' : 'loser')
                }">
                    <span>${match.participant2.username}</span>
                    <div class="player-status">
                        ${round.winners && this.thisisWinner(round.winners, match.participant2) ? '<span class="trophy">🏆</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="tournament-round">
                ${roundTitleHtml}
                <div class="matches-container">
                    ${matchesHtml}
                </div>
            </div>
        `;
    }).join('');

    // --- ŞAMPİYON BLOĞU ---

    const finalRound = rounds.find(r =>
        r.is_completed && r.expected_winner_count === 1 && r.winners?.length === 1
    );

    const champion = finalRound?.winners?.[0];

    const championHtml = champion ? `
        <div class="tournament-round">
            <div class="round-title">
                <span data-langm-key="tournament-tree.winner">Kazanan</span>
            </div>
            <div class="matches-container">
                <div class="match-card">
                    <div class="match-status status-COMPLETED">🏆</div>
                    <div class="player winner">
                        <span>${champion.username}</span>
                        <div class="player-status">
                            <span class="trophy">🏆</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ` : '';

    return `
        <div class="tournament-container">
            <div class="tournament-bracket">
                ${roundsHtml}
                ${championHtml}
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
                    <span data-langm-key="tournament-tree.refreshing">Yenileniyor...</span>
                    </div>
                    `;
        }
        exmp.applyLanguage();
        try {
            await this.delay(500); 
            if (refreshButton) {
                refreshButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        ${TournamentIcons.getRefreshIcon()}
                        <span data-langm-key="tournament-tree.refresh">Yenile</span>
                    </div>
                `;
                this.handleTree(false); 
            }
        } catch (error) {
            console.error('Error refreshing tree:', error);
            if (refreshButton) {
                refreshButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        ${TournamentIcons.getRefreshIcon()}
                        <span data-langm-key="tournament-tree.refresh">Yenile</span>
                    </div>
                `;
                exmp.applyLanguage();
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateData(newData: TournamentData): void {
        this.data = newData;
    }
}
