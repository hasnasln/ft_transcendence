import { TournamentIcons } from './IconsHelper';

export class TournamentUIManager {
    createTournamentStartedInfoHTML(): string {
        return `
            <div class="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <p class="text-blue-400 font-semibold text-sm">Turnuva Başlatıldı!</p>
                </div>
                <div class="text-center">
                    <p class="text-blue-300 text-xs">Oyuncular maçlarına katılabilir</p>
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
                <span>TURNUVAYI BAŞLAT</span>
            </div>
        `;
    }
    createCannotStartButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2 opacity-50">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                </svg>
                <span>Başlatılamaz</span>
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
                    <p class="text-green-400 font-semibold text-sm">Turnuva Başlatılabilir</p>
                </div>
                <div class="text-center">
                    <p class="text-green-300 text-xs">${playerCount} oyuncu ile turnuva başlatabilirsiniz</p>
                </div>
            </div>
        `;
    }

    createCannotStartInfoHTML(playerCount: number, minPlayers: number, maxPlayers: number): string {
        const reason = playerCount < minPlayers ? 
            `En az ${minPlayers} oyuncu gerekli` : 
            `Maksimum ${maxPlayers} oyuncu olabilir`;
        return `
            <div class="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                    <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <p class="text-orange-400 font-semibold text-sm">Turnuva Başlatılamaz</p>
                </div>
                <div class="text-center">
                    <p class="text-orange-300 text-xs">${reason} (Şu an: ${playerCount})</p>
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

    createTreeModalHTML(treeData: any): string {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div class="relative bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto p-6">
                    ${this.createTreeModalHeader()}
                    ${this.createTreeInfoSection(treeData.playerCount)}
                    <div id="tree-container"> <!-- Tournament tree will be rendered here --></div>
                    ${this.createTreeModalFooter()}
                </div>
            </div>
        `;
    }

    createTreeModalHeader(): string {
        return `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800">🏆 Turnuva Ağacı</h2>
                <button id="close-tree-modal" class="p-2 hover:bg-gray-100 rounded-full transition-colors"title="Kapat">${TournamentIcons.getCloseIcon()}</button>
            </div>
        `;
    }

    createTreeInfoSection(playerCount: number): string {
        const { getTournamentFormat, getOptimalTournamentSize, calculateByes } = this.getTournamentUtils();
        return `
            <div class="bg-gray-100 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="text-center">
                        <div class="font-semibold text-gray-600 mb-1">Oyuncu Sayısı</div>
                        <div class="text-blue-600 font-bold text-lg">${playerCount}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold text-gray-600 mb-1">Format</div>
                        <div class="text-green-600 font-bold text-lg">${getTournamentFormat(playerCount)}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold text-gray-600 mb-1">Optimal Boyut</div>
                        <div class="text-purple-600 font-bold text-lg">${getOptimalTournamentSize(playerCount)}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold text-gray-600 mb-1">Bye Alan</div>
                        <div class="text-orange-600 font-bold text-lg">${calculateByes(playerCount)} oyuncu</div>
                    </div>
                </div>
            </div>
        `;
    }

    createTreeModalFooter(): string {
        return `
            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-500">💡 İpucu: Ağaçta maç sonuçlarını ve oyuncu eşleşmelerini görebilirsiniz
                    </div>
                    <button id="refresh-tree" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">${TournamentIcons.getRefreshIcon()}
                        <span>Yenile</span>
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
                        <h3 class="text-xl font-bold text-white mb-4">Turnuva Ağacı Oluşturuluyor...</h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4">Veriler hazırlanıyor...</p>
                    </div>
                </div>
            </div>
        `;
    }

    createTreeErrorHTML(): string {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Ağaç Oluşturulamadı</h3>
                <p class="text-gray-600 text-sm">Turnuva ağacı render edilirken bir hata oluştu.</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Sayfayı Yenile</button>
            </div>
        `;
    }

    createLoadingButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>OYUN BAŞLATILIYOR...</span>
            </div>
        `;
    }

    createNormalPlayButtonHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                ${TournamentIcons.getGameIcon()}
                <span>OYUNA BAŞLA</span>
            </div>
        `;
    }

    createTournamentStartedHTML(): string {
        return `
            <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/> </svg>
                <span>TURNUVA BAŞLATILDI</span>
            </div>
        `;
    }

    private getTournamentUtils() {
        return {
            getTournamentFormat: (playerCount: number) => {
                if (playerCount <= 2) return "Tek maç";
                if (playerCount <= 4) return "Yarı final + Final"; 
                if (playerCount <= 8) return "Çeyrek final + Yarı final + Final";
                if (playerCount <= 10) return "10 oyunculu eleme + Çeyrek + Yarı + Final";
                return `${playerCount} oyunculu eleme turnuvası`;
            },
            getOptimalTournamentSize: (playerCount: number) => {
                const sizes = [2, 4, 8, 16];
                return sizes.find(size => size >= playerCount) || 16;
            },
            calculateByes: (playerCount: number) => {
                const sizes = [2, 4, 8, 16];
                const optimalSize = sizes.find(size => size >= playerCount) || 16;
                return optimalSize - playerCount;
            }
        };
    }
}
