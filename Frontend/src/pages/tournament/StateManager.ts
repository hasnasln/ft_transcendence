import { _apiManager } from '../../api/APIManager';
import {Participant, Round, TournamentData, TournamentStatus } from './tournamentTypes';
import { ShowTournament } from './MainRenderer';
import { t_first_section } from './FormComponents';
import { ModernOverlay } from '../../components/ModernOverlay';
import { TournamentTreeManager } from './TreeManager';

export class TournamentStateManager {
    private data: TournamentData;
    private status: boolean;
    private uiManager: any;
    private loadingManager: any;

    constructor(data: TournamentData, status: boolean, uiManager: any, loadingManager: any) {
        this.data = data;
        this.status = status;
        this.uiManager = uiManager;
        this.loadingManager = loadingManager;
    }

    async handleRefreshSuccess(updatedData: TournamentData): Promise<void> {
        console.log("------------------------!------------------------");
        this.data.lobby_members = updatedData.lobby_members;
        return _apiManager.getTournament(this.data.code)
        .then(async (response) => {
            console.log("4");
            const tournamentStarted = response.data?.status === TournamentStatus.ONGOING;
            if (tournamentStarted) {
                this.status = true;
                this.data.status = TournamentStatus.ONGOING;
            }
            console.log("5");
            const uid = localStorage.getItem('uuid');
            this.updateRefreshUI(tournamentStarted, updatedData.participants!.some(p => p.uuid === uid ));

            console.log("6");
            await this.delay(500);
            this.completeRefresh(response.data!);
        })
        .catch((error) => {
            console.error("Error during tournament refresh:", error);
            ModernOverlay.show('global-error', 'error');
        })
    }

    async handleCreateSuccess(container: HTMLElement, tournamentData: TournamentData): Promise<void> {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('create');
        await this.delay(1500);
        this.renderCreatedTournamentPage(container, tournamentData);
    }

    async handleJoinSuccess(container: HTMLElement, tournamentData: TournamentData): Promise<void> {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('join');
        await this.delay(1000);
        this.renderTournamentPage(container, tournamentData);
    }

    async handleStartSuccess(): Promise<void> {
        this.status = true;
        this.data.status = TournamentStatus.ONGOING;
        this.loadingManager.removeLoadingOverlay('start');
        await this.delay(2000);
        this.updateUIAfterStart();
    }

    async handleExitSuccess(container: HTMLElement): Promise<void> {
        this.loadingManager.removeLoadingOverlay('exit');
        localStorage.removeItem('tdata');
        container.innerHTML = '';
        t_first_section(container);
    }

    public findLastRound(r: Round []): Round | undefined {
        for (let i = 0; i <= r.length; i++) {
            if (r[i].round_number === r.length) {
                return r[i];
            }
        }
        return undefined;
    }

    public updateRefreshUI(tournamentStarted: boolean, is_players: boolean): void {
        let byParticipant: Participant | undefined;
        let uid = localStorage.getItem('uuid');
        let flag = false;
        if (this.data.tournament_start)
        {
            flag = true;
            const byParticipant = TournamentTreeManager.findByeParticipant(this.findLastRound(this.data.tournament_start!.rounds)!);
        }
        if (tournamentStarted && is_players && (flag && !(uid === byParticipant?.uuid))) {
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.style.display = 'none';
            }
            const startInfo = document.querySelector('.tournament-start-info');
            if (startInfo) {
                startInfo.innerHTML = this.uiManager.createTournamentStartedInfoHTML();
            }
            setTimeout(() => {
                const playButton = document.getElementById('play-button');
                if (playButton) {
                    playButton.style.visibility = 'visible';
                }
            }, 1000);
        }
    }

    public completeRefresh(updatedData: TournamentData): void {
        this.reRenderTournamentPage(updatedData);
    }

    private renderCreatedTournamentPage(container: HTMLElement, tdata: TournamentData): void {    
        container.innerHTML = '';
        ShowTournament(container, tdata);
        this.updateTournamentInfo();
    }

    private renderTournamentPage(container: HTMLElement, tdata: TournamentData): void {
        container.innerHTML = '';
        ShowTournament(container, tdata);
        this.updateTournamentInfo();
    }

    private updateUIAfterStart(): void {
        this.updateTournamentInfo();
        setTimeout(() => {
            const playButton = document.getElementById('play-button');
            if (playButton) {
                playButton.style.visibility = 'visible';
            }
        }, 2000);
    }

    private reRenderTournamentPage(updatedData: TournamentData): void {
        const container = this.uiManager.findTournamentContainer();
        if (container) {
            container.innerHTML = '';
            ShowTournament(container, updatedData);
            this.updateTournamentInfo();
        }
    }

    forceExitToMainPage(container: HTMLElement): void {
        this.loadingManager.removeLoadingOverlay('exit');
        localStorage.removeItem('tdata');
        container.innerHTML = '';
        t_first_section(container);
    }

    updateTournamentInfo(): void {
        const startButton = document.getElementById('start-button');
        const startInfo = document.querySelector('.tournament-start-info');
        const playerCount = this.data.lobby_members.length;
        const minPlayers = 2;
        const maxPlayers = 10;
        
        const isTournamentOngoing = this.data.status === TournamentStatus.ONGOING || this.status;
        
        if (isTournamentOngoing) {
            if (startButton && startInfo) {
                this.renderTournamentStarted(startButton, startInfo);
            }
        } else {
            const canStart = playerCount >= minPlayers && playerCount <= maxPlayers;
            if (startButton && startInfo) {
                if (canStart) {
                    this.renderCanStartTournament(startButton, startInfo, playerCount);
                }
            }
        }
    }

    private renderTournamentStarted(startButton: HTMLElement, startInfo: Element): void {
        startButton.innerHTML = this.uiManager.createTournamentStartedHTML();
        startButton.className = 'bg-green-500/50 text-green-200 px-6 py-3 rounded-lg cursor-not-allowed opacity-75';
        (startButton as HTMLButtonElement).disabled = true;
        startInfo.innerHTML = this.uiManager.createTournamentStartedInfoHTML();
    }

    private renderCanStartTournament(startButton: HTMLElement, startInfo: Element, playerCount: number): void {
        startButton.innerHTML = this.uiManager.createActiveStartButtonHTML();
        startButton.className = 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl';
        (startButton as HTMLButtonElement).disabled = false;
        startInfo.innerHTML = this.uiManager.createCanStartInfoHTML(playerCount);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateData(newData: TournamentData): void {
        this.data = newData;
        if (newData.status === TournamentStatus.ONGOING) {
            this.status = true;
        } else if (newData.status === TournamentStatus.CREATED) {
            this.status = false;
        }
    }

    updateStatus(newStatus: boolean): void {
        this.status = newStatus;
    }
}
