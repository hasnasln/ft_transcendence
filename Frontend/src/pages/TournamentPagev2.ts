import { exmp } from '../languageMeneger';
import { _apiManager } from '../api/APIManager';
import { ITournament } from '../api/types';
import { PlayPage } from './play-page';
import { Page } from '../router';
import { t_first_section } from './tournament/FormComponents';
import { ShowTournament, getTournamentFormat, getOptimalTournamentSize, calculateByes, listPlayers} from './tournament/MainRenderer';
import { TournamentActionHandler } from './tournament/ActionHandler';
import { TournamentLoadingManager } from './tournament/LoadingManager';
import { TournamentEventHandler } from './tournament/EventHandler';
import { TournamentValidation } from './tournament/ValidationHelper';
import { TournamentUIManager } from './tournament/UIManager';
import { TournamentTreeManager } from './tournament/TreeManager';
import { TournamentGameManager } from './tournament/GameManager';
import { TournamentStateManager } from './tournament/StateManager';
import { TournamentNotificationManager } from './tournament/NotificationManager';

export class TournamentPage implements Page {
    private data: ITournament;
    private status: boolean = false;
    private actionHandler: TournamentActionHandler;
    private loadingManager: TournamentLoadingManager;
    private eventHandler: TournamentEventHandler;
    private validation: TournamentValidation;
    private uiManager: TournamentUIManager;
    private treeManager: TournamentTreeManager;
    private gameManager: TournamentGameManager;
    private stateManager: TournamentStateManager;
    private notificationManager: TournamentNotificationManager;
    private performanceObserver: PerformanceObserver | null = null;

    constructor() {
        const defaultData: ITournament = {
            id: -1,
            code: '',
            name: '',
            admin_id: '',
            users: [],
        };
        
        this.data = this.loadTournamentData(defaultData);
        
        this.actionHandler = new TournamentActionHandler(this.data, this.status);
        this.loadingManager = new TournamentLoadingManager();
        this.eventHandler = new TournamentEventHandler();
        this.validation = new TournamentValidation();
        this.uiManager = new TournamentUIManager();
        this.treeManager = new TournamentTreeManager(this.data, this.uiManager);
        this.gameManager = new TournamentGameManager(this.data, this.status, this.validation, this.uiManager);
        this.stateManager = new TournamentStateManager(this.data, this.status, this.uiManager, this.loadingManager);
        this.notificationManager = new TournamentNotificationManager(this.uiManager);
    }

    private loadTournamentData(defaultData: ITournament): ITournament {
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
        } catch (error) {
            console.error('Error parsing localStorage tournament data:', error);
            localStorage.removeItem('tdata');
            return defaultData;
        }
    }

    evaluate(): string {
        if (localStorage.getItem('tdata') === null) {
            return this.renderFirstSection();
        } else {
            const tdata: ITournament = JSON.parse(localStorage.getItem('tdata')!);
            return this.renderTournament(tdata);
        }
    }

    private renderFirstSection(): string {
        const tempDiv = document.createElement('div');
        tempDiv.id = "tournament-main";
        tempDiv.className = "flex flex-col items-center justify-center min-h-screen w-full absolute top-0 left-0 z-0 bg-gradient-to-br bg-gray-300";
        t_first_section(tempDiv);
        return tempDiv.outerHTML;
    }

    private renderTournament(tdata: ITournament): string {
        const tempDiv = document.createElement('div');
        tempDiv.id = "tournament-main";
        tempDiv.className = "flex flex-col items-center justify-center min-h-screen w-full absolute top-0 left-0 z-0 bg-gradient-to-br bg-gray-300";
        ShowTournament(tempDiv, tdata);
        return tempDiv.outerHTML;
    }

    public onLoad(): void {
        document.removeEventListener('click', this.handleClick);
        document.addEventListener('click', this.handleClick);
        setTimeout(() => {
            this.init();
        }, 100);
        exmp.applyLanguage()
    }

    public onUnload(): void {
        document.removeEventListener('click', this.handleClick);
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
    }

    private handleClick = (event: MouseEvent) => {
        this.handleClickEvent(event);
    }

    private init(): void {
        const container = this.uiManager.findTournamentContainer();
        if (!container) {
            console.error('Container not found');
            return;
        }
        this.setupEventDelegation(container);
        this.eventHandler.setupKeyboardShortcuts();
        this.eventHandler.setupGlobalErrorHandling();
        this.setupPerformanceMonitoring();
    }

    private setupEventDelegation(container: HTMLElement): void {
        container.addEventListener('click', (event) => {
            this.handleClickEvent(event);
        });
        container.addEventListener('submit', (event) => {
            this.eventHandler.handleFormSubmission(event);
        });
        container.addEventListener('input', (event) => {
            this.handleInputChange(event);
        });
    }

    private handleClickEvent(event: Event): void {
        event.preventDefault();
        const target = (event.target as HTMLElement).closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');
        if (!action) return;
        
        if (action !== 'refresh' && this.isButtonDisabled(target as HTMLElement)) {
            console.warn(`Action ${action} ignored - button is disabled`);
            return;
        }
        if (this.loadingManager.isRateLimited(action)) {
            console.warn(`Action ${action} ignored - rate limited`);
            return;
        }
        this.executeAction(action, target as HTMLElement);
    }
    private handleInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const inputId = input.id;
        if (inputId === 'createInput' || inputId === 'joinInput') {
            this.notificationManager.performRealTimeValidation(input);
        }
    }
    private executeAction(action: string, target: HTMLElement): void {
        this.loadingManager.setActionLoading(action, target);
        this.performAction(action, target)
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
    private async performAction(action: string, target: HTMLElement): Promise<void> {
        const container = this.uiManager.findTournamentContainer();
        if (!container) throw new Error('Container not found');

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
                await this.handleRefresh();
                break;
            case 'start-tournament':
                await this.handleStartTournament();
                break;
            case 'play-game':
                await this.gameManager.handlePlay();
                break;
            case 'tree':
                await this.treeManager.handleTree();
                break;
            case 'show-create':
                this.handleShowCreate(container);
                break;
            case 'show-join':
                this.handleShowJoin(container);
                break;
            default:
                console.warn(`Unknown action: ${action}`);
                break;
        }
        exmp.applyLanguage();
    }
    private async createTournament(container: HTMLElement): Promise<void> {
        try {
            const input = document.querySelector('#createInput') as HTMLInputElement;
            const validationResult = this.validation.validateCreateInput(input);
            if (!validationResult.isValid) {
                this.notificationManager.showCreateError(validationResult.message);
                return;
            }
            
            const tournamentName = validationResult.tournamentName;
            this.loadingManager.showCreateLoading();
            
            const createResult = await this.actionHandler.createTournament(tournamentName);
            if (createResult.success && createResult.data) {
                this.notificationManager.showCreateSuccess(createResult.data);
                await this.stateManager.handleCreateSuccess(container, createResult.data);
                this.updateManagersData(createResult.data);
            } else {
                this.handleCreateError(createResult.message || '❌ Turnuva verisi alınamadı! Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            this.handleCreateError('❌ Turnuva oluşturulurken beklenmeyen bir hata oluştu!\n\nLütfen tekrar deneyin.');
        }
    }
    private async joinRoom(container: HTMLElement): Promise<void> {
        try {
            const input = document.querySelector('#joinInput') as HTMLInputElement;
            const validationResult = this.validation.validateJoinInput(input);
            if (!validationResult.isValid) {
                this.notificationManager.showJoinError(validationResult.message);
                return;
            }
            
            const tournamentId = validationResult.tournamentId;
            this.loadingManager.showJoinLoading();
            
            const joinResult = await this.actionHandler.joinTournament(tournamentId);
            if (joinResult.success) {
                if (joinResult.data) {
                    this.notificationManager.showJoinSuccess();
                    await this.stateManager.handleJoinSuccess(container, joinResult.data);
                    this.updateManagersData(joinResult.data);
                } else {
                    this.handleJoinError('❌ Turnuva verisi alınamadı! Lütfen tekrar deneyin.');
                }
            } else {
                this.handleJoinError(joinResult.message);
            }
        } catch (error) {
            console.error('Error joining tournament:', error);
            this.handleJoinError('❌ Turnuvaya katılırken beklenmeyen bir hata oluştu!\n\nLütfen tekrar deneyin.');
        }
    }

    private async handleStartTournament(): Promise<void> {
        try {
            const validationResult = this.validation.validateTournamentStart(this.data.users.length);
            if (!validationResult.isValid) {
                this.notificationManager.showStartError(validationResult.message);
                return;
            }
            
            const confirmation = await this.getStartConfirmation();
            if (!confirmation) {
                return;
            }
            
            this.loadingManager.showStartLoading();
            const startResult = await this.actionHandler.startTournament();
            
            if (startResult.success) {
                this.notificationManager.showStartSuccess(startResult.message, this.data.users.length);
                await this.stateManager.handleStartSuccess(startResult.message);
                this.updateManagersStatus(true);
            } else {
                this.handleStartError(startResult.message);
            }
        } catch (error) {
            console.error('Error starting tournament:', error);
            this.handleStartError('❌ Turnuva başlatılırken beklenmeyen bir hata oluştu!\n\nLütfen tekrar deneyin.');
        }
    }
    private async handleRefresh(): Promise<void> {
        try {
            this.notificationManager.showRefreshLoading(this.loadingManager);
            const refreshResult = await this.actionHandler.refreshTournament();

            if (refreshResult.success) {
                if (refreshResult.data) {
                    await this.stateManager.handleRefreshSuccess(refreshResult.data);
                    this.updateManagersData(refreshResult.data);
                } else {
                    this.handleRefreshError('❌ Turnuva verisi alınamadı!');
                }
            } else {
                this.handleRefreshError(refreshResult.message);
            }
        } catch (error) {
            console.error('Refresh error:', error);
            this.handleRefreshError('❌ Veriler güncellenirken hata oluştu!\n\nLütfen tekrar deneyin.');
        }
    }
    private async exitTournament(container: HTMLElement): Promise<void> {
        try {
            const confirmation = await this.getExitConfirmation();
            if (!confirmation.confirmed) {
                return;
            }
            
            this.loadingManager.showExitLoading(confirmation.isAdmin);
            const exitResult = await this.actionHandler.exitTournament();
            
            if (exitResult.success) {
                this.notificationManager.showExitSuccess(exitResult.message);
                await this.stateManager.handleExitSuccess(container, exitResult.message);
            } else {
                this.handleExitError(exitResult.message);
            }
        } catch (error) {
            console.error('Exit tournament error:', error);
            this.handleExitError('❌ Turnuvadan çıkılırken bir hata oluştu!\n\nLütfen tekrar deneyin.');
            this.stateManager.forceExitToMainPage(container);
        }
    }
    private setupPerformanceMonitoring(): void {
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
            } catch (error) {
                console.warn('Performance monitoring not supported:', error);
                this.performanceObserver = null;
            }
        }
    }
    private isButtonDisabled(button: HTMLElement): boolean {
        return button.hasAttribute('disabled') || 
               button.classList.contains('disabled') ||
               (button as HTMLButtonElement).disabled;
    }
    private handleActionError(action: string, target: HTMLElement, error: any): void {
        console.error(`Action ${action} failed:`, error);
        this.uiManager.showActionError(target, `${action} işlemi başarısız oldu!`);
    }
    private handleShowCreate(container: HTMLElement): void {
        const toggleContainer = container.querySelector('#toggleContainer') as HTMLElement;
        const createDiv = container.querySelector('#fatma123') as HTMLElement;
        const joinDiv = container.querySelector('#fatma1234') as HTMLElement;
        if (toggleContainer) {
            this.animateToggle(toggleContainer, 1, 0);
        }
        if (createDiv) createDiv.classList.remove('hidden');
        if (joinDiv) joinDiv.classList.add('hidden');
    }
    private handleShowJoin(container: HTMLElement): void {
        const toggleContainer = container.querySelector('#toggleContainer') as HTMLElement;
        const joinDiv = container.querySelector('#fatma1234') as HTMLElement;
        const createDiv = container.querySelector('#fatma123') as HTMLElement;
        if (toggleContainer) {
            this.animateToggle(toggleContainer, -1, toggleContainer.offsetWidth);
        }
        if (joinDiv) joinDiv.classList.remove('hidden');
        if (createDiv) createDiv.classList.add('hidden');
    }
    private animateToggle(element: HTMLElement, direction: number, startPosition: number): void {
        let currentPosition = 0;
        let animationId: number;
        
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
    private async getStartConfirmation(): Promise<boolean> {
        const playerCount = this.data.users.length;
        const confirmationMessage = this.validation.createStartConfirmationMessage(playerCount);
        return confirm(confirmationMessage);
    }
    private async getExitConfirmation(): Promise<{ confirmed: boolean; isAdmin: boolean }> {
        const isAdmin = this.data.admin_id === localStorage.getItem('uuid');
        const confirmationMessage = this.validation.createExitConfirmationMessage(isAdmin);
        const confirmed = confirm(confirmationMessage);
        return { confirmed, isAdmin };
    }
    private handleCreateError(errorMessage: string): void {
        this.loadingManager.removeLoadingOverlay('create');
        this.notificationManager.showCreateError(errorMessage);
    }
    private handleJoinError(errorMessage: string): void {
        this.loadingManager.removeLoadingOverlay('join');
        this.notificationManager.showJoinError(errorMessage);
    }
    private handleStartError(errorMessage: string): void {
        this.loadingManager.removeLoadingOverlay('start');
        const playerCount = this.data.users.length;
        const canStart = playerCount >= 2 && playerCount <= 10;
        this.notificationManager.resetStartButton(canStart, this.uiManager);
        this.notificationManager.showStartError(errorMessage);
    }
    private handleRefreshError(errorMessage: string): void {
        this.notificationManager.resetRefreshButton();
        this.notificationManager.showRefreshError(errorMessage);
        exmp.applyLanguage();
    }
    private handleExitError(errorMessage: string): void {
        this.loadingManager.removeLoadingOverlay('exit');
        this.notificationManager.showExitError(errorMessage);
    }
    private updateManagersData(newData: ITournament): void {
        this.data = newData;
        this.actionHandler.updateData(newData, this.status);
        this.treeManager.updateData(newData);
        this.gameManager.updateData(newData, this.status);
        this.stateManager.updateData(newData);
    }
    private updateManagersStatus(newStatus: boolean): void {
        this.status = newStatus;
        this.actionHandler.updateData(this.data, newStatus);
        this.gameManager.updateData(this.data, newStatus);
        this.stateManager.updateStatus(newStatus);
    }
}
