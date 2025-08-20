import { ITournament} from '../../api/types';
import { TournamentIcons } from './IconsHelper';

export function ShowTournament(container: HTMLElement, tdata: ITournament): void {
    container.innerHTML = createTournamentPageHTML(tdata);
    const playersList = container.querySelector('#list-player');
    if (playersList) {
        listPlayers(playersList as HTMLElement, tdata);
    }
}
function createTournamentPageHTML(tdata: ITournament): string {
    return `
        <div id="tournament-div02" class="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            <div class="max-w-7xl mx-auto space-y-8 relative z-10">
                ${createHeaderSection(tdata)}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    ${createInfoPanel(tdata)}
                    ${createPlayersPanel(tdata)}
                </div>
            </div>
        </div>
    `;
}

function createHeaderSection(tdata: ITournament): string {
    return `
        <div class="text-center mb-8">
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl border border-white/10">
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text mb-4">
                    ${tdata.name}
                </h1>
                <p
                data-langm-key="tournament-second-page.title"
                class="text-base sm:text-lg text-gray-300 mb-6">!_!</p>
            </div>
        </div>
    `;
}

// eklenen satır turnuva başlatıldıktan sonra admine ihtiyac olmadığı için admin paneli hiç oluşturmuyuruz.
function createInfoPanel(tdata: ITournament): string {
    return `
        <div class="lg:col-span-2 space-y-6">
            ${createDetailsCard(tdata)}
            ${tdata.status == "created" ? createAdminPanel(tdata) : ''}
        </div>
    `;
}
function createDetailsCard(tdata: ITournament): string {
    return `
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 shadow-xl">
            ${createCardHeader()}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${createInfoCard('IdCard', tdata.code, TournamentIcons.getTournamentIdIcon(), 'from-purple-500 to-indigo-500')}
                ${createInfoCard('Creater', getAdminUsername(tdata) || 'Unknown', TournamentIcons.getUserIcon(), 'from-blue-500 to-cyan-500')}
                ${createInfoCard('ActivePlayer', `${tdata.lobby_members.length} / 10`, TournamentIcons.getPlayersIcon(), 'from-green-500 to-emerald-500')}
                ${createInfoCard('Status', 'Aktif', TournamentIcons.getStatusIcon(), 'from-pink-500 to-rose-500')}
            </div>
        </div>
    `;
}
function getAdminUsername(tdata: ITournament): string
{
    for(let i = 0; i < tdata.lobby_members.length; i++)
        if(tdata.lobby_members[i].uuid === tdata.admin_id)
            return tdata.lobby_members[i].username;
    return "fatma bulamadi"
}
function createCardHeader(): string {
    return `
        <div class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <div class="flex items-center space-x-3 sm:space-x-4">
                <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    ${TournamentIcons.getTrophyIcon()}
                </div>
                <div>
                    <h2
                        data-langm-key="tournament-second-page.DetailsCard.header"
                        class="text-xl sm:text-2xl font-bold text-white mb-1">!_!
                    </h2>
                    <p
                    data-langm-key="tournament-second-page.DetailsCard.header2"
                        class="text-gray-300 text-sm sm:text-base">!_!
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3">
                ${createActionButton('refresh', TournamentIcons.getRefreshIcon(), 'from-blue-500 to-cyan-500', 'refresh')}
                ${createActionButton('tree', TournamentIcons.getTreeIcon(), 'from-green-500 to-emerald-500', 'tree')}
                ${createActionButton('exit-tournament', TournamentIcons.getExitIcon(), 'from-red-500 to-pink-500', 'exit')}
            </div>
        </div>
    `;
}
function createActionButton(action: string, icon: string, color: string, tooltip: string): string {
    return `
        <button
            data-langm-key="tournament-second-page.DetailsCard.button.${tooltip}"
            data-langm-path="title"
            data-action="${action}"
            class="p-2 sm:p-3 bg-gradient-to-br ${color} rounded-xl transition-all duration-300 hover:scale-105 shadow-md">
                <div class="relative">
                    ${icon}
                </div>
        </button>
    `;
}
function createInfoCard(title_key: string, value_key: string, icon: string, gradient: string): string {
    return `
        <div class="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        ${icon}
                    </div>
                    <div class="text-right">
                        <p
                            data-langm-key="tournament-second-page.DetailsCard.${title_key}"
                            class="text-gray-400 text-sm font-medium">!_!
                        </p>
                        <p class="text-white text-2xl font-bold">${value_key}
                        </p>
                    </div>
                </div>
                <div class="h-1 bg-gradient-to-r ${gradient} rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                <p
                data-langm-key="tournament-second-page.DetailsCard.${title_key}-description"
                    class="text-gray-400 text-xs mt-3 leading-relaxed">!_!
                </p>
            </div>
        </div>
    `;
}
function createAdminPanel(tdata: ITournament): string {
    if (tdata.admin_id !== localStorage.getItem('uuid')) {
        return '';
    }
    const playerCount = tdata.lobby_members.length;
    const minPlayers = 2;
    const maxPlayers = 10;
    const canStart = playerCount >= minPlayers && playerCount <= maxPlayers;
    return `
        <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl mt-4">
            <div class="text-center mb-4">
                <h3
                    data-langm-key="tournament-second-page.AdminPanel.title"
                    class="text-lg sm:text-xl font-bold text-white mb-2">!_!
                </h3>
            </div>
            ${createStartButton(canStart, playerCount, minPlayers)}
            ${createStartInfo(canStart, playerCount)}
        </div>
    `;
}
function createStartButton(canStart: boolean, playerCount: number, minPlayers: number): string {
    const buttonClass = canStart 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25' 
        : 'bg-gray-600 text-gray-300 cursor-not-allowed';
    const buttonContent = canStart 
        ? `<div class="flex items-center justify-center space-x-2">
                ${TournamentIcons.getRocketIcon()}
                <span
                    data-langm-key="tournament-second-page.AdminPanel.Button.avtive">!_!
                </span>
           </div>`
        : `<div class="flex items-center justify-center space-x-2">
               ${TournamentIcons.getLockIcon()}
               <span 
                    data-langm-key="tournament-second-page.AdminPanel.Button.${playerCount < minPlayers 
                        ? `deactive-1`
                        : `deactive-2`
                    }"
                    class="text-xs sm:text-sm">!_!
               </span>
           </div>`;
    const dataAction = canStart ? 'start-tournament' : '';
    return `
        <button id="start-button" data-action="${dataAction}" class="w-full py-3 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${buttonClass}">
            ${buttonContent}
        </button>
    `;
}

function createStartInfo(canStart: boolean, playerCount: number): string {
    if (canStart) {
        return `
            <div class="tournament-start-info mt-4">
                <div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div class="flex items-center justify-center space-x-2 mb-2">
                        ${TournamentIcons.getCheckIcon()}
                        <p
                            data-langm-key="tournament-second-page.AdminPanel.Button2.active"
                            class="text-green-400 font-semibold text-sm">!_!
                        </p>
                    </div>
                    <div class="text-center">
                        <p class="text-green-300 text-xs">
                            ${getTournamentFormat(playerCount)}${calculateByes(playerCount) > 0 ? ` • ${calculateByes(playerCount)} bye` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="tournament-start-info mt-4">
                <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div class="flex items-center justify-center space-x-2 mb-2">
                        ${TournamentIcons.getWarningIcon()}
                        <p 
                            data-langm-key="tournament-second-page.AdminPanel.Button2.deactive-1"
                            class="text-yellow-400 font-semibold text-sm">!_!
                        </p>
                    </div>
                    <div class="text-center">
                        <p
                            data-langm-key="tournament-second-page.AdminPanel.Button2.description-1"
                            class="text-yellow-300 text-xs">!_!
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}
function createPlayersPanel(tdata: ITournament): string {
    return `
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl sticky top-4">
                ${createPlayersHeader()}
                <div id="list-player" class="space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
                    <!-- Players will be dynamically loaded here -->
                </div>
                ${tdata.status == "ongoing" ? createPlayButton(): ''}
            </div>
        </div>
    `;
}
function createPlayersHeader(): string {
    return `
        <div class="text-center mb-6">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                ${TournamentIcons.getPlayersIcon()}
            </div>
            <h3
                data-langm-key="tournament-second-page.PlayersPanel.title"
                class="text-lg sm:text-xl font-bold text-white mb-2">!_!
            </h3>
            <p
                data-langm-key="tournament-second-page.PlayersPanel.title2"
                class="text-gray-300 text-sm">!_!
            </p>
        </div>
    `;
}
function createPlayButton(): string {
    return `
        <button id="play-button" data-action="play-game" class="w-full py-3 sm:py-4 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mt-6" style="visibility: hidden;">
            <div class="flex items-center justify-center space-x-2">
                ${TournamentIcons.getGameIcon()}
                <span
                    data-langm-key="tournament-second-page.PlayersPanel.PlayButton">!_!
                </span>
            </div>
        </button>
    `;
}
export function getOptimalTournamentSize(playerCount: number): number {
    const sizes = [2, 4, 8, 16];
    return sizes.find(size => size >= playerCount) || 16;
}
export function calculateByes(playerCount: number): number {
    return getOptimalTournamentSize(playerCount) - playerCount;
}
export function getTournamentFormat(playerCount: number): string {
    const formats = {
        2: "Tek maç",
        4: "Yarı final + Final", 
        8: "Çeyrek final + Yarı final + Final",
        10: "10 oyunculu eleme + Çeyrek + Yarı + Final"
    };
    if (playerCount <= 2) return formats[2];
    if (playerCount <= 4) return formats[4];
    if (playerCount <= 8) return formats[8];
    if (playerCount <= 10) return formats[10];
    return `${playerCount} oyunculu eleme turnuvası`;
}

export function listPlayers(container: HTMLElement, tdata: ITournament): void {
    container.innerHTML = createPlayersListHTML(tdata);
}
function createPlayersListHTML(tdata: ITournament): string {
    const playersHTML = tdata.lobby_members.map((player, index) => 
        createPlayerCard(player, index, tdata.admin_id)
    ).join('');
    return `
        ${playersHTML}
        ${createCapacityIndicator(tdata.lobby_members.length)}
    `;
}

function createPlayerCard(player: any, index: number, adminId: string): string {
    const isAdmin = player.user_id === adminId;
    const playerInitial = player.username.charAt(0).toUpperCase();
    return `
        <div class="bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 border border-white/10 hover:border-white/20">
            <div class="flex items-center space-x-3 sm:space-x-4">
                ${createPlayerAvatar(playerInitial)}
                ${createPlayerInfo(player.username, isAdmin)}
                ${createPlayerStats(index + 1)}
            </div>
        </div>
    `;
}
function createPlayerAvatar(initial: string): string {
    return `
        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-lg">
            <span>${initial}</span>
        </div>
    `;
}
function createPlayerInfo(username: string, isAdmin: boolean): string {
    const roleIcon = isAdmin 
        ? `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12c0-2.043-.777-3.908-2.071-5.657a1 1 0 010-1.414z"/>
           </svg>`
        : `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
           </svg>`;
    const roleText = isAdmin ? 'Admin' : 'Player';
    const roleColor = isAdmin ? 'text-yellow-400' : 'text-blue-400';
    return `
        <div class="flex-1 min-w-0">
            <h4 class="text-white font-semibold text-sm sm:text-base truncate">${username}</h4>
            <p class="text-gray-400 text-xs sm:text-sm flex items-center space-x-1">
                ${roleIcon}
                <span
                data-langm-key="tournament-second-page.PlayersPanel.PlayerCard.Role.${roleText}"
                class="${roleColor}"></span>
            </p>
        </div>
    `;
}
function createPlayerStats(playerNumber: number): string {
    return `
        <div class="flex items-center space-x-2">
            <div class="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                ${playerNumber}
            </div>
            <div class="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" title="Online"></div>
        </div>
    `;
}
function createCapacityIndicator(currentCapacity: number): string {
    const maxCapacity = 10;
    const percentage = (currentCapacity / maxCapacity) * 100;
    return `
        <div class="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div class="flex justify-between items-center mb-3">
                <span
                    data-langm-key="tournament-second-page.PlayersPanel.CapacityIndicator.capacity"
                    class="text-gray-300 text-sm font-medium">!_!
                </span>
                <span class="text-white font-bold">${currentCapacity} / ${maxCapacity}</span>
            </div>
            <div class="w-full bg-gray-700/50 rounded-full h-2">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span
                    data-langm-key="tournament-second-page.PlayersPanel.CapacityIndicator.min">!_!
                </span>
                <span
                    data-langm-key="tournament-second-page.PlayersPanel.CapacityIndicator.max">!_!
                </span>
            </div>
        </div>
    `;
}