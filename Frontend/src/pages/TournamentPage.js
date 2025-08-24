import { exmp } from '../lang/languageManager';
import { _apiManager } from '../api/APIManager';
import { Router } from '../router';
import { ModernOverlay } from '../components/ModernOverlay';
import { t_first_section } from './tournament/FormComponents';
import { ShowTournament } from './tournament/MainRenderer';
import { TournamentActionHandler } from './tournament/ActionHandler';
import { TournamentLoadingManager } from './tournament/LoadingManager';
import { TournamentEventHandler } from './tournament/EventHandler';
import { TournamentValidation } from './tournament/ValidationHelper';
import { TournamentUIManager } from './tournament/UIManager';
import { TournamentTreeManager } from './tournament/TreeManager';
import { TournamentGameManager } from './tournament/GameManager';
import { TournamentStateManager } from './tournament/StateManager';
import { TournamentNotificationManager } from './tournament/NotificationManager';
import { ToastManager } from '../ToastManager';
export class TournamentPage {
    flag = false;
    data = null;
    status = false;
    actionHandler;
    loadingManager;
    eventHandler;
    validation;
    uiManager;
    treeManager;
    gameManager;
    stateManager;
    notificationManager;
    performanceObserver = null;
    constructor() {
    }
    onUnHide() {
        _apiManager.haveTournament()
            .then((resposeWraper) => {
            console.log('Tournament data fetched from server:', resposeWraper);
            if (resposeWraper.success === false)
                localStorage.removeItem('tdata');
            else if (resposeWraper.success === true)
                localStorage.setItem('tdata', JSON.stringify(resposeWraper.data));
            return resposeWraper;
        })
            .then((responseWraper) => {
            if (responseWraper.success)
                return this.handleRefresh(false);
        })
            .catch(() => {
            ToastManager.ShowToast('error', "global-error");
        }).finally(() => {
            exmp.applyLanguage();
        });
    }
    loadTournamentData(defaultData) {
        try {
            const storedData = localStorage.getItem('tdata');
            if (!storedData || storedData === '{}' || storedData === 'null') {
                return defaultData;
            }
            const parsedData = JSON.parse(storedData);
            if (!parsedData || typeof parsedData !== 'object' || !parsedData.code) {
                console.warn('Invalid tournament data in localStorage, using defaults');
                return defaultData;
            }
            return parsedData;
        }
        catch (error) {
            console.error('Error parsing localStorage tournament data:', error);
            localStorage.removeItem('tdata');
            return defaultData;
        }
    }
    evaluate() {
        return ``;
    }
    renderFirstSection() {
        const tempDiv = document.createElement('div');
        tempDiv.id = "tournament-main";
        t_first_section(tempDiv);
        return tempDiv.outerHTML;
    }
    renderTournament(tdata) {
        const tempDiv = document.createElement('div');
        tempDiv.id = "tournament-main";
        tempDiv.className = "flex flex-col items-center justify-center min-h-screen w-full absolute top-0 left-0 z-0 bg-gradient-to-br bg-gray-300";
        ShowTournament(tempDiv, tdata);
        return tempDiv.outerHTML;
    }
    onLoad() {
        _apiManager.haveTournament()
            .then((resposeWraper) => {
            console.log('Tournament data fetched from server:', resposeWraper);
            if (resposeWraper.success === false)
                localStorage.removeItem('tdata');
            else if (resposeWraper.success === true)
                localStorage.setItem('tdata', JSON.stringify(resposeWraper.data));
            return resposeWraper;
        })
            .then((responseWraper) => {
            this.data = this.loadTournamentData(responseWraper.data);
            this.actionHandler = new TournamentActionHandler(this.data, this.status);
            this.loadingManager = new TournamentLoadingManager();
            this.eventHandler = new TournamentEventHandler();
            this.validation = new TournamentValidation();
            this.uiManager = new TournamentUIManager();
            this.treeManager = new TournamentTreeManager(this.data, this.uiManager);
            this.gameManager = new TournamentGameManager(this.data, this.status, this.validation, this.uiManager);
            this.stateManager = new TournamentStateManager(this.data, this.status, this.uiManager, this.loadingManager);
            this.notificationManager = new TournamentNotificationManager();
            return responseWraper;
        })
            .then((responseWraper) => {
            let htmlcontent;
            if (localStorage.getItem('tdata') === null) {
                htmlcontent = this.renderFirstSection();
            }
            else {
                const tdata = JSON.parse(localStorage.getItem('tdata'));
                htmlcontent = this.renderTournament(tdata);
                this.flag = true;
            }
            return htmlcontent;
        })
            .then((htmlcontent) => {
            Router.getInstance().rootContainer().innerHTML = htmlcontent;
        })
            .then(() => {
            document.removeEventListener('click', this.handleClick);
            document.addEventListener('click', this.handleClick);
            this.init();
            if (this.flag && this.data && this.data.status === "ongoing")
                this.stateManager.updateRefreshUI(this.flag, this.amIPlaying(this.data.participants));
            exmp.applyLanguage();
        })
            .catch(() => {
            ToastManager.ShowToast('error', "global-error");
        });
    }
    amIPlaying(players) {
        const uuid = localStorage.getItem('uuid');
        if (!uuid)
            return false;
        return players.some(player => player.uuid === uuid);
    }
    onUnload() {
        document.removeEventListener('click', this.handleClick);
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
    }
    handleClick = (event) => {
        this.handleClickEvent(event);
    };
    init() {
        const container = this.uiManager.findTournamentContainer();
        if (!container) {
            console.error('Container not found');
            return;
        }
        this.eventHandler.setupEventDelegation(container, (event) => this.handleClickEvent(event), (event) => this.handleInputChange(event));
        this.eventHandler.setupKeyboardShortcuts();
        this.eventHandler.setupGlobalErrorHandling();
        this.setupPerformanceMonitoring();
    }
    handleClickEvent(event) {
        event.preventDefault();
        const target = event.target.closest('[data-action]');
        if (!target)
            return;
        const action = target.getAttribute('data-action');
        if (!action)
            return;
        if (action !== 'refresh' && this.isButtonDisabled(target)) {
            console.warn(`Action ${action} ignored - button is disabled`);
            return;
        }
        if (this.loadingManager.isRateLimited(action)) {
            console.warn(`Action ${action} ignored - rate limited`);
            return;
        }
        this.executeAction(action, target);
    }
    handleInputChange(event) {
        const input = event.target;
        const inputId = input.id;
        if (inputId === 'createInput' || inputId === 'joinInput') {
            this.notificationManager.performRealTimeValidation(input);
        }
    }
    executeAction(action, target) {
        this.loadingManager.setActionLoading(action, target);
        this.performAction(action)
            .catch(error => {
            console.error(`Error executing action ${action}:`, error);
            this.handleActionError(action, target, error);
        })
            .finally(() => {
            setTimeout(() => {
                this.loadingManager.clearActionLoading(action, target);
            }, 500);
        });
    }
    async performAction(action) {
        const container = this.uiManager.findTournamentContainer();
        if (!container)
            throw new Error('Container not found');
        switch (action) {
            case 'create-tournament':
                await this.createTournament(container);
                break;
            case 'join-room':
                await this.joinRoom(container);
                break;
            case 'exit-tournament':
                await this.exitTournament(container);
                break;
            case 'refresh':
                await this.handleRefresh(true);
                break;
            case 'start-tournament':
                await this.handleStartTournament();
                break;
            case 'play-game':
                await this.gameManager.handlePlay();
                break;
            case 'tree':
                await this.treeManager.handleTree()
                    .then(() => { exmp.applyLanguage; });
                break;
            case 'show-create':
                this.handleShowCreate(container);
                break;
            case 'show-join':
                this.handleShowJoin(container);
                break;
            case 'go-home':
                Router.getInstance().go('/');
                break;
            default:
                console.warn(`Unknown action: ${action}`);
                break;
        }
        exmp.applyLanguage();
    }
    async createTournament(container) {
        try {
            const input = document.querySelector('#createInput');
            const tournamentName = input.value.trim();
            this.loadingManager.showCreateLoading();
            const createResult = await this.actionHandler.createTournament(tournamentName);
            this.loadingManager.removeLoadingOverlay('create');
            if (createResult.success && createResult.data) {
                await this.stateManager.handleCreateSuccess(container, createResult.data);
                this.updateManagersData(createResult.data);
            }
        }
        catch (error) {
            console.error('Create tournament error:', error);
            this.loadingManager.removeLoadingOverlay('create');
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        }
    }
    async joinRoom(container) {
        try {
            const input = document.querySelector('#joinInput');
            const tournamentId = input.value.trim();
            this.loadingManager.showJoinLoading();
            const joinResult = await this.actionHandler.joinTournament(tournamentId);
            this.loadingManager.removeLoadingOverlay('join');
            if (joinResult.success && joinResult.data) {
                await this.stateManager.handleJoinSuccess(container, joinResult.data);
                this.updateManagersData(joinResult.data);
            }
        }
        catch (error) {
            this.loadingManager.removeLoadingOverlay('join');
            ModernOverlay.show('global-error', 'error');
        }
    }
    async handleStartTournament() {
        try {
            const confirmation = await this.getStartConfirmation();
            if (!confirmation) {
                return;
            }
            this.loadingManager.showStartLoading();
            const startResult = await this.actionHandler.startTournament();
            this.loadingManager.removeLoadingOverlay('start');
            if (startResult.success) {
                await this.handleRefresh(false);
                this.updateManagersStatus(true);
            }
        }
        catch (error) {
            console.error('Error starting tournament:', error);
            this.loadingManager.removeLoadingOverlay('start');
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
        }
    }
    async handleRefresh(flag) {
        if (flag) {
            this.onLoad();
        }
    }
    async exitTournament(container) {
        try {
            this.getExitConfirmation()
                .then((confirmation) => {
                if (!confirmation.confirmed)
                    return Promise.reject();
                return confirmation;
            })
                .then((confirmation) => {
                this.loadingManager.showExitLoading(confirmation.isAdmin);
                this.actionHandler.exitTournament()
                    .then((rvalue) => {
                    this.loadingManager.removeLoadingOverlay('exit');
                    return rvalue;
                })
                    .then((rvalue) => {
                    if (rvalue.success)
                        this.stateManager.handleExitSuccess(container);
                });
            });
        }
        catch (error) {
            console.error('Exit tournament error:', error);
            this.loadingManager.removeLoadingOverlay('exit');
            ModernOverlay.show('tournament-messages.ERR_INTERNAL_SERVER', 'error');
            this.stateManager.forceExitToMainPage(container);
        }
    }
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window && !this.performanceObserver) {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 1000) {
                        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                    }
                });
            });
            try {
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            }
            catch (error) {
                console.warn('Performance monitoring not supported:', error);
                this.performanceObserver = null;
            }
        }
    }
    isButtonDisabled(button) {
        return button.hasAttribute('disabled') ||
            button.classList.contains('disabled') ||
            button.disabled;
    }
    handleActionError(action, target, error) {
        console.error(`Action ${action} failed:`, error);
        this.uiManager.showActionError(target, `${action} işlemi başarısız oldu!`);
    }
    handleShowCreate(container) {
        const toggleContainer = container.querySelector('#toggleContainer');
        const createDiv = container.querySelector('#createSection');
        const joinDiv = container.querySelector('#joinSection');
        if (toggleContainer) {
            this.animateToggle(toggleContainer, 1, 0);
        }
        if (createDiv)
            createDiv.classList.remove('hidden');
        if (joinDiv)
            joinDiv.classList.add('hidden');
    }
    handleShowJoin(container) {
        const toggleContainer = container.querySelector('#toggleContainer');
        const joinDiv = container.querySelector('#joinSection');
        const createDiv = container.querySelector('#createSection');
        if (toggleContainer) {
            this.animateToggle(toggleContainer, -1, toggleContainer.offsetWidth);
        }
        if (joinDiv)
            joinDiv.classList.remove('hidden');
        if (createDiv)
            createDiv.classList.add('hidden');
    }
    animateToggle(element, direction, startPosition) {
        let currentPosition = 0;
        let animationId;
        const animate = () => {
            currentPosition += direction * 20;
            element.style.transform = `translateX(${startPosition + currentPosition}px)`;
            const shouldContinue = direction > 0
                ? currentPosition < element.offsetWidth
                : currentPosition > -element.offsetWidth;
            if (shouldContinue) {
                animationId = requestAnimationFrame(animate);
            }
        };
        if (element.dataset.animationId) {
            cancelAnimationFrame(parseInt(element.dataset.animationId));
        }
        animationId = requestAnimationFrame(animate);
        element.dataset.animationId = animationId.toString();
    }
    async getStartConfirmation() {
        const playerCount = this.data.lobby_members.length;
        return await this.validation.confirmTournamentStart(playerCount);
    }
    async getExitConfirmation() {
        const isAdmin = this.data.admin_id === localStorage.getItem('uuid');
        const confirmed = await this.validation.confirmTournamentExit(isAdmin);
        return { confirmed, isAdmin };
    }
    updateManagersData(newData) {
        this.data = newData;
        this.actionHandler.updateData(newData, this.status);
        this.treeManager.updateData(newData);
        this.gameManager.updateData(newData, this.status);
        this.stateManager.updateData(newData);
    }
    updateManagersStatus(newStatus) {
        this.status = newStatus;
        this.actionHandler.updateData(this.data, newStatus);
        this.gameManager.updateData(this.data, newStatus);
        this.stateManager.updateStatus(newStatus);
    }
}
