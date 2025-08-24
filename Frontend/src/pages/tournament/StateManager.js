import { TournamentStatus } from './tournamentTypes';
import { ShowTournament } from './MainRenderer';
import { t_first_section } from './FormComponents';
export class TournamentStateManager {
    data;
    status;
    uiManager;
    loadingManager;
    constructor(data, status, uiManager, loadingManager) {
        this.data = data;
        this.status = status;
        this.uiManager = uiManager;
        this.loadingManager = loadingManager;
    }
    async handleRefreshSuccess(updatedData) {
        this.data = updatedData;
        const tournamentStarted = this.data.status === TournamentStatus.ONGOING;
        if (tournamentStarted) {
            this.status = true;
        }
        const uid = localStorage.getItem('uuid');
        this.updateRefreshUI(tournamentStarted, updatedData.participants.some(p => p.uuid === uid));
        await this.delay(500);
        if (updatedData.participants.some(p => p.uuid === uid))
            this.completeRefresh(this.data);
    }
    async handleCreateSuccess(container, tournamentData) {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('create');
        await this.delay(1500);
        this.renderCreatedTournamentPage(container, tournamentData);
    }
    async handleJoinSuccess(container, tournamentData) {
        localStorage.setItem('tdata', JSON.stringify(tournamentData));
        this.data = tournamentData;
        this.loadingManager.removeLoadingOverlay('join');
        await this.delay(1000);
        this.renderTournamentPage(container, tournamentData);
    }
    async handleStartSuccess() {
        this.status = true;
        this.data.status = TournamentStatus.ONGOING;
        this.loadingManager.removeLoadingOverlay('start');
        await this.delay(2000);
        this.updateUIAfterStart();
    }
    async handleExitSuccess(container) {
        this.loadingManager.removeLoadingOverlay('exit');
        localStorage.removeItem('tdata');
        container.innerHTML = '';
        t_first_section(container);
    }
    findLastRound(r) {
        for (let i = 0; i <= r.length; i++) {
            if (r[i].round_number === r.length) {
                return r[i];
            }
        }
        return undefined;
    }
    updateRefreshUI(tournamentStarted, is_players) {
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.style.display = 'none';
        }
        const startInfo = document.querySelector('.tournament-start-info');
        if (startInfo) {
            startInfo.innerHTML = this.uiManager.createTournamentStartedInfoHTML();
        }
        if (tournamentStarted && is_players) {
            setTimeout(() => {
                const playButton = document.getElementById('play-button');
                if (playButton) {
                    playButton.style.visibility = 'visible';
                }
            }, 1000);
        }
    }
    completeRefresh(updatedData) {
        this.reRenderTournamentPage(updatedData);
    }
    renderCreatedTournamentPage(container, tdata) {
        container.innerHTML = '';
        ShowTournament(container, tdata);
        this.updateTournamentInfo();
    }
    renderTournamentPage(container, tdata) {
        container.innerHTML = '';
        ShowTournament(container, tdata);
        this.updateTournamentInfo();
    }
    updateUIAfterStart() {
        this.updateTournamentInfo();
        setTimeout(() => {
            const playButton = document.getElementById('play-button');
            if (playButton) {
                playButton.style.visibility = 'visible';
            }
        }, 2000);
    }
    reRenderTournamentPage(updatedData) {
        const container = this.uiManager.findTournamentContainer();
        if (container) {
            container.innerHTML = '';
            ShowTournament(container, updatedData);
            this.updateTournamentInfo();
        }
    }
    forceExitToMainPage(container) {
        this.loadingManager.removeLoadingOverlay('exit');
        localStorage.removeItem('tdata');
        container.innerHTML = '';
        t_first_section(container);
    }
    updateTournamentInfo() {
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
        }
        else {
            const canStart = playerCount >= minPlayers && playerCount <= maxPlayers;
            if (startButton && startInfo) {
                if (canStart) {
                    this.renderCanStartTournament(startButton, startInfo, playerCount);
                }
            }
        }
    }
    renderTournamentStarted(startButton, startInfo) {
        startButton.innerHTML = this.uiManager.createTournamentStartedHTML();
        startButton.className = 'bg-green-500/50 text-green-200 px-6 py-3 rounded-lg cursor-not-allowed opacity-75';
        startButton.disabled = true;
        startInfo.innerHTML = this.uiManager.createTournamentStartedInfoHTML();
    }
    renderCanStartTournament(startButton, startInfo, playerCount) {
        startButton.innerHTML = this.uiManager.createActiveStartButtonHTML();
        startButton.className = 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl';
        startButton.disabled = false;
        startInfo.innerHTML = this.uiManager.createCanStartInfoHTML(playerCount);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    updateData(newData) {
        this.data = newData;
        if (newData.status === TournamentStatus.ONGOING) {
            this.status = true;
        }
        else if (newData.status === TournamentStatus.CREATED) {
            this.status = false;
        }
    }
    updateStatus(newStatus) {
        this.status = newStatus;
    }
}
