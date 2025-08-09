import { GameEventBus } from "./gameEventBus";
import { Router } from "../../router";
import { gameInstance } from "../play";
import { _apiManager } from "../../api/APIManager";

export class SocketIOWrapper {
    private static instance: SocketIOWrapper;
    private static loaded = false;

    Socket!: typeof import("socket.io-client").Socket;
    io!: typeof import("socket.io-client").io;

    public static getInstance(): SocketIOWrapper {
        if (!SocketIOWrapper.instance) {
            SocketIOWrapper.instance = new SocketIOWrapper();
        }
        return SocketIOWrapper.instance;
    }

    public static async load(): Promise<void> {
        if (SocketIOWrapper.loaded) return;
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
    private static instance: WebSocketClient;
    private socket: any | null = null;
    private hasConnectedOnce: boolean = false;

    public static getInstance(): WebSocketClient {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient();
        }
        return WebSocketClient.instance;
    }

    public getSocket(): any | null {
        return this.socket;
    }

    public reset() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.hasConnectedOnce = false;
    }

    public emit(event: string, data?: any): void {
        if (!this.socket) {
            console.error("Event could not emitted. Socket is not initialized: event: '" + event + "' data: '", data + "'");
            return;
        }
        this.socket.emit(event, data);
    }

    public on(event: string, callback: (...args: any[]) => void, timeout?: number): void {
        if (!this.socket) {
            console.error("Event could not listened. Socket is not initialized: event: '" + event + "'");
            return;
        }

        if (timeout) {
            this.socket.timeout(timeout).on(event, callback);
        } else {
            this.socket.on(event, callback);
        }
    }

    public once(event: string, callback: (...args: any[]) => void, timeout?: number): void {
        if (!this.socket) {
            console.error("Once event could not listened. Socket is not initialized: event: '" + event + "'");
            return;
        }

        if (timeout) {
            this.socket.timeout(timeout).once(event, callback);
        } else {
            this.socket.once(event, callback);
        }
    }

    public off(event: string): void {
        this.socket?.off(event);
    }

    public async connect(url: string): Promise<void> {
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
                reconnectionDelay: 200, // 200ms
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

    public async listenEvents() {
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

        this.socket.on('disconnect', (reason: string) => {
            if (reason === 'io server disconnect') {
                this.reset();
            }

            GameEventBus.getInstance().emit({ type: 'DISCONNECTED', payload: {
                reason,
                willTryReconnect: this.socket !== null
            }});
        });
        
        this.socket.io.on("reconnect_attempt", (n:any) => GameEventBus.getInstance().emit({ type: 'RECONNECTION_ATTEMPT', payload: { attempts: n } }));
        this.socket.io.on("reconnect_error", (err:any) => GameEventBus.getInstance().emit({ type: 'RECONNECTION_ATTEMPT_FAILED', payload: { reason: err.message } }));
        this.socket.io.on("reconnect", (n:any) => GameEventBus.getInstance().emit({ type: 'RECONNECTED', payload: { attempts: n } }));
        this.socket.io.on("reconnect_failed", () => GameEventBus.getInstance().emit({ type: 'RECONNECTION_GAVE_UP' }));
        this.socket.on("connect_error", (err:any) => GameEventBus.getInstance().emit({ type: 'CONNECTION_ERROR', payload: { reason: err.message } }));

        this.socket.on('gameServerError', (errorMessage: string) => {
            console.error("Game server error:", errorMessage);
        });

        this.socket.on('tournamentError', (errorMessage: string) => {
            console.error('Tournament error:', errorMessage);
            gameInstance.uiManager.onInfoShown(`Turnuvaya katılma hatası: ${errorMessage}`);
            setTimeout(() => {
                gameInstance.uiManager.onInfoHidden();
                Router.getInstance().go('/tournament')
            }, 5000);
        });

        this.socket.on('goToNextRound', () => {
            console.log('Bir üst tura yükseldiniz:');
            gameInstance.uiManager.onTurnToTournamentButton();
        });


    }
} 