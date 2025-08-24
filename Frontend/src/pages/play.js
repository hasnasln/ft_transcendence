import { GameInfo, listenStateUpdates, waitForMatchReady, waitForRematchApproval, waitGameStart } from "./game-section/network";
import { GameUI } from "./game-section/ui";
import { GameEventBus } from "./game-section/gameEventBus";
import { Router } from '../router';
import { WebSocketClient } from './game-section/wsclient';
import { GamePage } from './game';
import { GameLoop } from './game-section/gameLoop';
import { GameInputHandler } from './game-section/keyboard';
import { BabylonJsWrapper } from "./game-section/3d";
export class GameManager {
    uiManager = new GameUI();
    gameInfo = null;
    gameStatus = {
        currentGameStarted: false,
        phase: 'unset',
    };
    reMatch = false;
    username = null;
    tournamentMode = false;
    tournamentCode;
    currentRival = null;
    timers = [];
    abortHandler = undefined;
    constructor() {
        this.uiManager.resetCache();
    }
    configureTournament(tournamentMode, tournamentCode) {
        this.tournamentMode = tournamentMode;
        if (tournamentMode) {
            this.tournamentCode = tournamentCode;
            this.gameStatus = {
                currentGameStarted: false,
                phase: "unset",
                game_mode: 'tournament',
                tournamentCode: this.tournamentCode,
                finalMatch: false,
                roundNo: 0,
            };
        }
    }
    async waitForModeSelection() {
        return new Promise((resolve) => {
            GameEventBus.getInstance().once('GAME_MODE_CHOSEN', (event) => {
                this.gameStatus = {
                    currentGameStarted: false,
                    phase: "unset",
                    game_mode: event.payload.mode,
                };
                if (event.payload.mode !== 'vsAI') {
                    resolve();
                    return;
                }
                this.uiManager.onDifficultyShown();
                this.uiManager.onMenuHidden();
                GameEventBus.getInstance().once('AI_DIFFICULTY_CHOSEN', (event) => {
                    this.gameStatus.level = event.payload.level;
                    resolve();
                }, 'game');
            }, 'game');
        });
    }
    configure = async () => {
        if (this.gameStatus.game_mode === 'tournament')
            return;
        if (this.gameStatus.currentGameStarted)
            throw new Error("Game is already started: " + JSON.stringify(this.gameStatus));
        await this.waitForModeSelection();
    };
    enterWaitingPhase = async (status) => {
        this.gameStatus = status;
        WebSocketClient.getInstance().once("match-cancelled", handleMatchCancellation, 20_000);
        WebSocketClient.getInstance().emit("create", this.gameStatus);
        if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament') {
            await GameEventBus.getInstance().emit({ type: 'WAITING_FOR_RIVAL' });
            const matchPlayers = await waitForMatchReady();
            this.abortHandler?.throwIfAborted();
            await GameEventBus.getInstance().emit({ type: 'RIVAL_FOUND', payload: { matchPlayers } });
            this.currentRival = matchPlayers.left.socketId === WebSocketClient.getInstance().getSocket().id ? matchPlayers.right.username : matchPlayers.left.username;
        }
        gameInstance.uiManager.showProgressBar();
        gameInstance.uiManager.updateProgressBar(100, 0);
        gameInstance.runAfter(() => {
            gameInstance.uiManager.updateProgressBar(0, 20_000);
        }, 50);
    };
    enterReadyPhase = async () => {
        if (this.gameStatus.currentGameStarted) {
            this.reMatch = true;
            this.finalize();
        }
        if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
            let approval = await waitForRematchApproval();
            this.abortHandler?.throwIfAborted();
            await GameEventBus.getInstance().emit({ type: 'REMATCH_APPROVAL', payload: { approval } });
            if (!approval)
                return;
        }
        WebSocketClient.getInstance().emit("ready", {});
        this.gameInfo = new GameInfo(this.gameStatus.game_mode);
        return;
    };
    async preparePlayProcess(tournamentMode, tournamentCode) {
        this.configureTournament(tournamentMode, tournamentCode);
        return Promise.all([BabylonJsWrapper.load(), this.configure()]);
    }
    startPlayProcess() {
        this.abortHandler?.abort();
        this.abortHandler = new AbortHandler();
        this.abortHandler.onAbort = (error) => {
            console.log("GameManager aborted.");
            if (error) {
                console.error("GameManager aborted with error: ", error);
                this.uiManager.onInfoShown("game.InfoMessage.unexpected_try_refresh");
                return;
            }
        };
        if (Router.getInstance().getCurrentPath() !== '/game') {
            throw new Error("GameManager should be started from /game path, but current path is: " + Router.getInstance().getCurrentPath());
        }
        this.uiManager.cacheDOMElements();
        GamePage.enablePage();
        GameEventBus.getInstance().emit({ type: 'CONNECTING_TO_SERVER' });
        WebSocketClient.getInstance().connect("game.transendence.com")
            .catch(err => {
            GameEventBus.getInstance().emit({ type: 'CONNECTING_TO_SERVER_FAILED', payload: { error: err } });
            throw new Error("WebSocket connection failed.");
        })
            .then(() => {
            if (!this.abortHandler || this.abortHandler.isAborted())
                return;
            new AbortablePromise(this.abortHandler)
                .then(() => GameEventBus.getInstance().emit({ type: 'CONNECTED_TO_SERVER' }))
                .then(() => GameEventBus.getInstance().emit({ type: 'ENTER_WAITING_PHASE' }))
                .then(() => this.enterWaitingPhase(this.gameStatus)) // wait for rival finding
                .then(() => this.uiManager.onStartButtonShown())
                .then(() => new Promise((resolve) => {
                GameEventBus.getInstance().once('READY_BUTTON_CLICK', () => resolve(), "game");
            })) // wait for start click
                .then(() => GameEventBus.getInstance().emit({ type: 'ENTER_READY_PHASE' }))
                .then(() => this.enterReadyPhase())
                .then(() => listenStateUpdates(this.gameInfo)) // start listening to the game server
                .then(() => waitGameStart(this.gameInfo)) // wait game server for start the game
                .then(() => GameEventBus.getInstance().emit({ type: 'ENTER_PLAYING_PHASE' }));
        });
    }
    finalize() {
        this.abortHandler?.abort();
        this.abortHandler = undefined;
        this.timers.forEach(timer => clearTimeout(timer)); /* assume timers are not async */
        this.timers = [];
        GameLoop.getInstance().stop();
        WebSocketClient.getInstance().reset();
        GameInputHandler.getInstance().reset();
        GameEventBus.getInstance().offAllByLabel("game");
        this.uiManager.finalizeUI();
        this.gameInfo = null;
        this.gameStatus = {
            currentGameStarted: false,
            finalMatch: false,
            phase: "unset"
        };
        this.uiManager.resetCache();
        GamePage.disablePage();
    }
    handleNetworkPause() {
        if (this.gameInfo?.state?.phase !== 'playing' || !this.gameStatus.currentGameStarted)
            return;
        if (this.gameStatus.game_mode === 'localGame' || this.gameStatus.game_mode === 'vsAI') {
            this.uiManager.onInfoShown("game.InfoMessage.connetion_lost");
            gameInstance.runAfter(() => {
                this.uiManager.onInfoHidden();
                Router.getInstance().invalidatePage("/game");
                Router.getInstance().go('/play');
            }, 2000);
            return;
        }
        console.log("Network kopması algılandı, oyunu duraklatıyoruz.");
        this.uiManager.onInfoShown("game.InfoMessage.network_lost_reconnect_countdown", [{ key: "s", value: "15" }]);
    }
    requestRejoin() {
        if (!this.gameStatus.currentGameStarted || (this.gameStatus.game_mode !== 'tournament' && this.gameStatus.game_mode !== 'remoteGame')) {
            return;
        }
        console.log("Requesting rejoin to the game server.");
        gameInstance.uiManager.onInfoShown("game.InfoMessage.reconnected_request_permission");
        WebSocketClient.getInstance().once("rejoin-response", (response) => {
            if (response.status === "approved") {
                console.log("Rejoin approved, resuming game.");
                gameInstance.uiManager.onInfoShown("game.InfoMessage.permission_granted_joining");
                gameInstance.runAfter(() => gameInstance.uiManager.onInfoHidden(), 1000);
            }
            else {
                console.log("Rejoin rejected, redirecting to play page.");
                gameInstance.uiManager.onInfoShown("game.InfoMessage.permission_denied_redirect_home");
                gameInstance.runAfter(() => {
                    Router.getInstance().go('/');
                    Router.getInstance().invalidatePage("/game");
                }, 1000);
            }
        });
        WebSocketClient.getInstance().emit("rejoin");
    }
    runAfter(callback, delay) {
        const id = setTimeout(() => {
            this.timers = this.timers.filter(t => t !== id);
            callback();
        }, delay);
        this.timers.push(id);
    }
}
function handleMatchCancellation() {
    gameInstance.uiManager.onInfoShown("game.InfoMessage.match_cancelled_redirect_home");
    gameInstance.runAfter(() => {
        Router.getInstance().invalidatePage("/play");
        Router.getInstance().go('/play');
        Router.getInstance().invalidatePage("/game");
    }, 1000);
}
export class AbortHandler {
    static ABORTED_ERROR = "Operation aborted";
    aborted = false;
    onAbort = null;
    abort(err) {
        this.aborted = true;
        this.onAbort?.(err || null);
    }
    isAborted() {
        return this.aborted;
    }
    throwIfAborted() {
        if (this.aborted) {
            throw new Error(AbortHandler.ABORTED_ERROR);
        }
    }
}
export class AbortablePromise {
    abortHandler;
    callback;
    value;
    isFulfilled = false;
    next = null;
    constructor(abortHandler, callback = undefined, first = true) {
        this.callback = callback;
        this.abortHandler = abortHandler;
        if (first) {
            this.run(undefined);
            this.isFulfilled = true;
        }
    }
    async run(val) {
        if (this.abortHandler.isAborted()) {
            return;
        }
        if (this.callback) {
            try {
                this.value = await this.callback(val);
                this.isFulfilled = true;
            }
            catch (error) {
                this.abortHandler.abort(error);
                return;
            }
        }
        if (this.next && this.isFulfilled) {
            this.next.run(this.value);
        }
    }
    then(cb) {
        this.next = new AbortablePromise(this.abortHandler, cb, false);
        if (this.isFulfilled) {
            this.next.run(this.value);
        }
        return this.next;
    }
}
export const gameInstance = new GameManager();
