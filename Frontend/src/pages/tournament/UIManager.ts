import { TournamentIcons } from './IconsHelper';
import { exmp } from '../../languageManager';

export class TournamentUIManager {
    createTournamentStartedInfoHTML(): string {
        return `
            <div class="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <p class="text-blue-400 font-semibold text-sm" data-langm-key="tournament-ui.tournament-started">!_!</p>
                </div>
                <div class="text-center">
                    <p class="text-blue-300 text-xs" data-langm-key="tournament-ui.players-can-join-matches">!_!</p>
                </div>
            </div>
        `;
    }

    createActiveStartButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <span data-langm-key="tournament-ui.start-tournament">!_!</span>
            </div>
        `;
    }

    createCanStartInfoHTML(playerCount: number): string {
        return `
            <div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-green-400 font-semibold text-sm" data-langm-key="tournament-ui.tournament-can-start">!_!</p>
                </div>
                <div class="text-center">
                    <p class="text-green-300 text-xs" data-langm-key="tournament-ui.can-start-with-players" data-langm-tmp="${playerCount}">!_!</p>
                </div>
            </div>
        `;
    }

    showActionError(target: HTMLElement, message: string): void {
        const originalClass = target.className;
        target.className = originalClass + ' error-state';
        const tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        target.style.position = 'relative';
        target.appendChild(tooltip);
        setTimeout(() => {
            target.className = originalClass;
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }

    findTournamentContainer(): HTMLElement | null {
        let container = document.getElementById('tournament-main');
        if (!container) {
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                const tournamentContainer = contentContainer.querySelector('#tournament-main') as HTMLElement;
                if (tournamentContainer) {
                    container = tournamentContainer;
                } else {
                    const tournamentDiv = contentContainer.querySelector('[id*="tournament"]') as HTMLElement;
                    if (tournamentDiv) {
                        container = tournamentDiv;
                    } else {
                        container = contentContainer;
                    }
                }
            }
        }
        return container;
    }

    createTreeModalHTML(): string {
        const html = `
            <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div class="relative bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto p-6">
                    ${this.createTreeModalHeader()}
                    <div id="tree-container"> <!-- Tournament tree will be rendered here --></div>
                    ${this.createTreeModalFooter()}
                </div>
            </div>
        `;
        setTimeout(() => exmp.applyLanguage(), 1500);
        return html;
    }

    createTreeModalHeader(): string {
        return `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800" data-langm-key="tournament-ui.tournament-tree">!_!</h2>
                <button id="close-tree-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors" data-langm-key="tournament-ui.close" data-langm-path="title">${TournamentIcons.getCloseIcon()}</button>
            </div>
        `;
    }

    createTreeModalFooter(): string {
        return `
            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-500" data-langm-key="tournament-ui.tree-tip">!_!</div>
                    <button id="refresh-tree" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">${TournamentIcons.getRefreshIcon()}
                        <span data-langm-key="tournament-ui.refresh">!_!</span>
                    </button>
                </div>
            </div>
        `;
    }

    createTreeLoadingHTML(): string {
        return `
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">${TournamentIcons.getTreeLoadingIcon()}</div>
                        <h3 class="text-xl font-bold text-white mb-4" data-langm-key="tournament-ui.creating-tree">!_!</h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4" data-langm-key="tournament-ui.preparing-data">!_!</p>
                    </div>
                </div>
            </div>
        `;
    }

    createLoadingButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span data-langm-key="tournament-ui.starting-game">!_!</span>
            </div>
        `;
    }

    createNormalPlayButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                ${TournamentIcons.getGameIcon()}
                <span data-langm-key="tournament-ui.start-game">!_!</span>
            </div>
        `;
    }

    createTournamentStartedHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/> </svg>
                <span data-langm-key="tournament-ui.tournament-started-button">!_!</span>
            </div>
        `;
    }
}
