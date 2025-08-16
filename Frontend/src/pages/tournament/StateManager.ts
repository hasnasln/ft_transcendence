import { _apiManager } from '../../api/APIManager';
import { ITournament } from '../../api/types';
import { ShowTournament } from './MainRenderer';
import { t_first_section } from './FormComponents';

export class TournamentStateManager {
    private data: ITournament;
    private status: boolean;
    private uiManager: any;
    private loadingManager: any;

    constructor(data: ITournament, status: boolean, uiManager: any, loadingManager: any) {
        this.data = data;
        this.status = status;
        this.uiManager = uiManager;
        this.loadingManager = loadingManager;
    }

    async handleRefreshSuccess(updatedData: ITournament): Promise<void> {
        this.data.lobby_members = updatedData.lobby_members;
        const response = await _apiManager.getTournament(this.data.code);
        const tournamentStarted = response.data?.tournament_start || false;
        if (tournamentStarted) {
            this.status = true;
        }
        const uid = localStorage.getItem('uuid');
        this.updateRefreshUI(tournamentStarted, updatedData.participants!.some(p => p.uuid === uid));
        await this.delay(500);
        this.completeRefresh(updatedData);
    }

    async handleCreateSuccess(container: HTMLElement, tournamentData: ITournament): Promise<void> {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('create');
        await this.delay(1500);
        this.renderCreatedTournamentPage(container, tournamentData);
    }

    async handleJoinSuccess(container: HTMLElement, tournamentData: ITournament): Promise<void> {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('join');
        await this.delay(1000);
        this.renderTournamentPage(container, tournamentData);
    }

    async handleStartSuccess(): Promise<void> {
        this.status = true;
        this.loadingManager.removeLoadingOverlay('start');
        await this.delay(2000);
        this.updateUIAfterStart();
    }

    async handleExitSuccess(container: HTMLElement): Promise<void> {
        this.loadingManager.removeLoadingOverlay('exit');
        await this.delay(1500);
        localStorage.removeItem('tdata');
        container.innerHTML = '';
        t_first_section(container);
    }

    public updateRefreshUI(tournamentStarted: boolean, is_players: boolean): void {
        if (tournamentStarted && is_players) {
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

    private completeRefresh(updatedData: ITournament): void {
        this.reRenderTournamentPage(updatedData);
    }

    private renderCreatedTournamentPage(container: HTMLElement, tdata: ITournament): void {    
        container.innerHTML = '';
        ShowTournament(container, tdata);
        this.updateTournamentInfo();
    }

    private renderTournamentPage(container: HTMLElement, tdata: ITournament): void {
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

    private reRenderTournamentPage(updatedData: ITournament): void {
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
        
        if (this.status) {
            if (startButton && startInfo) {
                this.renderTournamentStarted(startButton, startInfo);
            }
        } else {
            const canStart = playerCount >= minPlayers && playerCount <= maxPlayers;
            if (startButton && startInfo) {
                if (canStart) {
                    this.renderCanStartTournament(startButton, startInfo, playerCount);
                } else {
                    this.renderCannotStartTournament(startButton, startInfo, playerCount, minPlayers, maxPlayers);
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

    private renderCannotStartTournament(startButton: HTMLElement, startInfo: Element, playerCount: number, minPlayers: number, maxPlayers: number): void {
        startButton.innerHTML = this.uiManager.createCannotStartButtonHTML();
        startButton.className = 'bg-red-500/50 text-red-200 px-6 py-3 rounded-lg cursor-not-allowed opacity-75';
        (startButton as HTMLButtonElement).disabled = true;
        startInfo.innerHTML = this.uiManager.createCannotStartInfoHTML(playerCount, minPlayers, maxPlayers);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateData(newData: ITournament): void {
        this.data = newData;
    }

    updateStatus(newStatus: boolean): void {
        this.status = newStatus;
    }
}
