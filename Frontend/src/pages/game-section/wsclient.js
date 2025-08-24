import { GameEventBus } from "./gameEventBus";
import { Router } from "../../router";
import { gameInstance } from "../play";
import { _apiManager } from "../../api/APIManager";
export class SocketIOWrapper {
    static instance;
    static loaded = false;
    Socket;
    io;
    static getInstance() {
        if (!SocketIOWrapper.instance) {
            SocketIOWrapper.instance = new SocketIOWrapper();
        }
        return SocketIOWrapper.instance;
    }
    static async load() {
        if (SocketIOWrapper.loaded)
            return;
        SocketIOWrapper.loaded = true;
        console.log("loading Socket.IO modules...");
        const { Socket } = await import("socket.io-client");
        const { io } = await import("socket.io-client");
        const instance = SocketIOWrapper.getInstance();
        instance.Socket = Socket;
        instance.io = io;
        console.log("Socket.IO modules loaded.");
    }
}
export class WebSocketClient {
    static instance;
    socket = null;
    hasConnectedOnce = false;
    static getInstance() {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }
    getSocket() {
        return this.socket;
    }
    reset() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.hasConnectedOnce = false;
    }
    emit(event, data) {
        if (!this.socket) {
            console.error("Event could not emitted. Socket is not initialized: event: '" + event + "' data: '", data + "'");
            return;
        }
        this.socket.emit(event, data);
    }
    on(event, callback, timeout) {
        if (!this.socket) {
            console.error("Event could not listened. Socket is not initialized: event: '" + event + "'");
            return;
        }
        if (timeout) {
            this.socket.timeout(timeout).on(event, callback);
        }
        else {
            this.socket.on(event, callback);
        }
    }
    once(event, callback, timeout) {
        if (!this.socket) {
            console.error("Once event could not listened. Socket is not initialized: event: '" + event + "'");
            return;
        }
        if (timeout) {
            this.socket.timeout(timeout).once(event, callback);
        }
        else {
            this.socket.once(event, callback);
        }
    }
    off(event) {
        this.socket?.off(event);
    }
    async connect(url) {
        await SocketIOWrapper.load();
        console.log("Connecting to WebSocket server at:", url);
        this.reset();
        const io = SocketIOWrapper.getInstance().io;
        return new Promise((resolve, reject) => {
            if (this.socket) {
                reject("socket already exists");
            }
            const token = _apiManager.getToken();
            if (!token) {
                reject("No token found. Try logging in again.");
                return;
            }
            this.socket = io(url, {
                auth: { token },
                autoConnect: true,
                rememberUpgrade: true,
                reconnection: true,
                reconnectionAttempts: 15,
                reconnectionDelay: 200,
                randomizationFactor: 0,
                timeout: 20_000,
            });
            const onConnectError = () => {
                this.reset();
                reject("Server could not be reached.");
            };
            this.socket.io.once('reconnect_failed', onConnectError);
            this.socket.once('connect', () => {
                this.socket?.io.off('reconnect_failed', onConnectError);
                resolve();
            });
            this.listenEvents();
        });
    }
    async listenEvents() {
        if (!this.socket) {
            throw new Error("Socket is not initialized. Call connect() first.");
        }
        this.socket.on('connect', () => {
            console.log("socket.on 'connect'");
            if (!this.socket) {
                console.error("socket could not find.");
                return;
            }
            if (!this.hasConnectedOnce) {
                GameEventBus.getInstance().emit({ type: 'INITIALLY_CONNECTED' });
                this.hasConnectedOnce = true;
            }
        });
        this.socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                this.reset();
            }
            GameEventBus.getInstance().emit({ type: 'DISCONNECTED', payload: {
                    reason,
                    willTryReconnect: this.socket !== null
                } });
        });
        this.socket.io.on("reconnect_attempt", (n) => GameEventBus.getInstance().emit({ type: 'RECONNECTION_ATTEMPT', payload: { attempts: n } }));
        this.socket.io.on("reconnect_error", (err) => GameEventBus.getInstance().emit({ type: 'RECONNECTION_ATTEMPT_FAILED', payload: { reason: err.message } }));
        this.socket.io.on("reconnect", (n) => GameEventBus.getInstance().emit({ type: 'RECONNECTED', payload: { attempts: n } }));
        this.socket.io.on("reconnect_failed", () => GameEventBus.getInstance().emit({ type: 'RECONNECTION_GAVE_UP' }));
        this.socket.on("connect_error", (err) => GameEventBus.getInstance().emit({ type: 'CONNECTION_ERROR', payload: { reason: err.message } }));
        this.socket.on('gameServerError', (errorMessage) => {
            console.error('gameServerError', errorMessage);
            gameInstance.uiManager.onInfoShown(`game.Errors.${errorMessage}`);
            setTimeout(() => {
                gameInstance.uiManager.onInfoHidden();
                Router.getInstance().go('/play');
            }, 5000);
        });
        this.socket.on('tournamentError', (errorMessage) => {
            console.error('Tournament error:', errorMessage);
            gameInstance.uiManager.onInfoShown(`game.Errors.${errorMessage}`);
            setTimeout(() => {
                gameInstance.uiManager.onInfoHidden();
                Router.getInstance().go('/tournament');
            }, 5000);
        });
    }
}
