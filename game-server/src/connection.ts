import { MatchManager, Player } from "./matchManager";
import { Server, Socket } from "socket.io";
import { GameStatus } from "./game";
import { emitError } from "./errorHandling";
import { createServer } from "http";
import { apiCall, HTTPMethod } from "./httpApiManager";

export class ConnectionHandler {

    private static _instance: ConnectionHandler;

    private connectedPlayersMap: Map<string, Player> = new Map();
    private io: Server = undefined as any;

    private constructor() {}

    public static getInstance(): ConnectionHandler {
        if (!ConnectionHandler._instance) {
            ConnectionHandler._instance = new ConnectionHandler();
        }
        return ConnectionHandler._instance;
    }

    public init() {
        const httpServer = createServer();
        this.io = new Server(httpServer, {
            cors: { origin: "*" },
            pingInterval: 1000,
            pingTimeout: 2000
        });
        
        const PORT = 3001;
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        this.io.use(async (socket, next) => {
            const error = await this.acceptInitialConnection(socket);
            if (error)
                return next(error);
            next();
        });

        this.io.on("connect", socket => this.handleConnectionRequest(socket));
    }

    public async acceptInitialConnection(socket: Socket): Promise<Error | null> {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return new Error("Authentication error: token missing");
        }
    
        const response = await apiCall('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined, token);
        if (response instanceof Error || response.statusCode !== 200) {
            return new Error("Token validation error: " + response.message);
        }
        
        const user: any = { uuid: response.data.uuid, username: response.data.username};
        (socket as any).user = user;

        if (ConnectionHandler.getInstance().connectedPlayersMap.has(user.username)) {
            return new Error("Existing session found.");
        }
        // note: do not assume player is connected here.
        return null;
    }

    public acceptConnection(socket: Socket, player: Player): boolean {
        if (this.connectedPlayersMap.has(player.username)) {
            emitError('gameServerError',"CONNECTION_DUPLICATED", socket.id);
        setTimeout(() => { player.socket.disconnect(); }, 1000);
        return false;
        }
        
        this.connectedPlayersMap.set(player.username, player);
        return true;
    }

    public handleConnectionRequest(socket: Socket): void {
        const user: any = (socket as any).user;
        let player: Player = { ...user, socket };

        if (!this.acceptConnection(socket, player)) {
            return;
        }

        console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} connected.`);
        socket.on("rejoin", () => {
            console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} 'rejoin' message received.`);
            const game = MatchManager.getInstance().getMatchByPlayer(player.username);
            if (!game || (game.gameMode !== 'remoteGame' && game.gameMode !== 'tournament') || game.state !== "playing") {
                socket.emit("rejoin-response", {status: "rejected"});
                return;
            }

            try {
                MatchManager.getInstance().handleReconnect(player, game);
            } catch (err: any) {
                emitError('gameServerError', "COULD_NOT_REJOIN", socket.id);
                setTimeout(() => { player.socket.disconnect(); }, 1000);
                console.log(err);
                return;
            }
        });

        socket.on("create", async (gameStatus: GameStatus) => {
            console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} 'create' message received.`);
            MatchManager.getInstance().handleMatchRequest(player, gameStatus);
        });

        socket.on("reset-match", () => {
            console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} 'reset-match' message received.`);
            const activeMatch = MatchManager.getInstance().getMatchByPlayer(player.username);
            if (activeMatch && (activeMatch.gameMode === 'localGame' || activeMatch.gameMode === 'vsAI')) {
                activeMatch.finalize(activeMatch.gameMode === 'vsAI' ? "Robot" : "Friend");
                MatchManager.getInstance().clearGame(activeMatch);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} 'disconnect' message received.`);
            MatchManager.getInstance().handleDisconnect(player);
            ConnectionHandler.getInstance().onDisconnection(player);
        });


        socket.on("pause-resume", (data: { status: string }) => {
            const match = MatchManager.getInstance().getMatchByPlayer(player.username);
            if (!match) return;

            if (data.status === "pause" && !match.isPaused)
                match.pause();
            else if (data.status === "resume" && match.isPaused)
                match.resume();
        });
    }

    public getServer(): Server {
        return this.io;
    }

    public onDisconnection(player: Player): void {
		this.connectedPlayersMap.delete(player.username);
    }
}