import { TournamentIcons } from './IconsHelper';
import { exmp } from '../../lang/languageManager';
export class TournamentLoadingManager {
    lastActionTimes = new Map();
    createGenericLoadingHTML() {
        return `
            <div class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span data-langm-key="tournament-loading.processing"> </span>
            </div>
        `;
    }
    createCreateLoadingHTML() {
        return `
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            ${TournamentIcons.getCreateIcon()}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-4" data-langm-key="tournament-loading.creating-tournament"> </h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4" data-langm-key="tournament-loading.please-wait"> </p>
                    </div>
                </div>
            </div>
        `;
    }
    createJoinLoadingHTML() {
        return `
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            ${TournamentIcons.getJoinIcon()}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-4" data-langm-key="tournament-loading.joining-tournament"> </h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4" data-langm-key="tournament-loading.please-wait"> </p>
                    </div>
                </div>
            </div>
        `;
    }
    createStartLoadingHTML() {
        return `
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            ${TournamentIcons.getStartIcon()}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-4" data-langm-key="tournament-loading.starting-tournament"> </h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4" data-langm-key="tournament-loading.preparing-system"> </p>
                    </div>
                </div>
            </div>
        `;
    }
    createRefreshLoadingHTML() {
        return `
            <div class="relative">
                <svg id="refresh-svg" class="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
            </div>
        `;
    }
    createPlayersLoadingHTML() {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                    <div class="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                </div>
                <h4 class="text-lg font-bold text-white mb-2" data-langm-key="tournament-loading.updating"> </h4>
                <p class="text-gray-400 text-sm" data-langm-key="tournament-loading.fetching-data"> </p>
                <div class="mt-4 flex space-x-2">
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                </div>
            </div>
        `;
    }
    createExitLoadingHTML(isAdmin) {
        const loadingTextKey = isAdmin ? 'tournament-loading.deleting-tournament' : 'tournament-loading.leaving-tournament';
        const loadingIcon = isAdmin ? TournamentIcons.getDeleteIcon() : TournamentIcons.getExitIcon();
        return `
            <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            ${loadingIcon}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-4" data-langm-key="${loadingTextKey}"> </h3>
                        <div class="flex items-center justify-center space-x-2">
                            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <div class="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-100"></div>
                            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                        <p class="text-gray-300 text-sm mt-4" data-langm-key="tournament-loading.please-wait"> </p>
                    </div>
                </div>
            </div>
        `;
    }
    setActionLoading(action, target) {
        if (target.tagName === 'BUTTON') {
            target.disabled = true;
        }
        target.classList.add('loading');
        const originalContent = target.innerHTML;
        target.setAttribute('data-original-content', originalContent);
        if (action !== 'refresh') {
            target.innerHTML = this.createGenericLoadingHTML();
            setTimeout(() => exmp.applyLanguage(), 0);
        }
    }
    clearActionLoading(action, target) {
        if (target.tagName === 'BUTTON') {
            target.disabled = false;
        }
        target.classList.remove('loading');
        const originalContent = target.getAttribute('data-original-content');
        if (originalContent && action !== 'refresh') {
            target.innerHTML = originalContent;
            target.removeAttribute('data-original-content');
        }
    }
    showCreateLoading() {
        const overlay = document.createElement('div');
        overlay.id = 'create-loading-overlay';
        overlay.innerHTML = this.createCreateLoadingHTML();
        document.body.appendChild(overlay);
        setTimeout(() => exmp.applyLanguage(), 0);
    }
    showJoinLoading() {
        const overlay = document.createElement('div');
        overlay.id = 'join-loading-overlay';
        overlay.innerHTML = this.createJoinLoadingHTML();
        document.body.appendChild(overlay);
        setTimeout(() => exmp.applyLanguage(), 0);
    }
    showStartLoading() {
        const overlay = document.createElement('div');
        overlay.id = 'start-loading-overlay';
        overlay.innerHTML = this.createStartLoadingHTML();
        document.body.appendChild(overlay);
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.innerHTML = this.createStartLoadingButtonHTML();
            startButton.disabled = true;
        }
        setTimeout(() => exmp.applyLanguage(), 0);
    }
    showExitLoading(isAdmin) {
        const overlay = document.createElement('div');
        overlay.id = 'exit-loading-overlay';
        overlay.innerHTML = this.createExitLoadingHTML(isAdmin);
        document.body.appendChild(overlay);
        setTimeout(() => exmp.applyLanguage(), 0);
    }
    removeLoadingOverlay(type) {
        const overlay = document.getElementById(`${type}-loading-overlay`);
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
    isRateLimited(action) {
        const now = Date.now();
        const lastAction = this.lastActionTimes.get(action) || 0;
        const rateLimitMs = action === 'tree' ? 200 : 1000;
        if (now - lastAction < rateLimitMs) {
            return true;
        }
        this.lastActionTimes.set(action, now);
        return false;
    }
    createStartLoadingButtonHTML() {
        return `
            <div class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span data-langm-key="tournament-loading.starting-button"> </span>
            </div>
        `;
    }
}
