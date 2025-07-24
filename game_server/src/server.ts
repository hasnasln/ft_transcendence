import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { Player, MatchManager } from "./matchManager";
import { emitError } from "./errorHandling";

export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean
};

export interface User {
	uuid: string;
	username: string;
	token: string;
	email?: string;
	name?: string;
	surname?: string;
}

export interface IApiResponseWrapper {
	success: boolean;
	message?: string;
	data?: any; // Data can be of any type, depending on the API response
}

export class HTTPMethod extends String {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: { origin: "*" },
	pingInterval: 1000,
	pingTimeout: 2000
});

const PORT = 3001;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export const matchManager = new MatchManager(io);

setInterval(() => {
	const now = Date.now();
	for (const [username, disconnectEvent] of matchManager.disconnectTimestamps) {
		if (now - disconnectEvent.timestamp > 15_000) {
			matchManager.disconnectTimestamps.delete(username);
			const {player,match} = disconnectEvent;
			if (match.state === 'in-progress' || match.state === 'paused') {
				const opponent = match.players.find(p => p.username !== player.username)!;
				match.finishIncompleteMatch(opponent.username);
			}
			matchManager.clearMatch(match);
		}
	}
}, 1000);

io.use(async (socket, next) => {
	const token = socket.handshake.auth?.token;
	if (!token) {
		//console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
		next(new Error("Authentication error: token missing"));
		return;
	}

	const response = await apiCall('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined, token);
	const body = await response.json();

	if (!response.ok) {
		next(new Error("Token validation error: " + body.error));
		return;
	}

	const user: User = { uuid: body.data.uuid, username: body.data.username, token: token };
	(socket as any).user = user;

	if (matchManager.connectedPlayers.has(user.username)) {
		return next(new Error("Existing session found."));
	}
	// note: do not assume player is connected here.

	next();
});

io.on("connect", socket => {
	const user = (socket as any).user;
	const username = user.username;
	const uuid = user.uuid;
	const token = user.token;
	let player: Player = { socket, username, uuid, token, socketReady: false };

	if (!acceptConnection(socket, player)) {
		return;
	}

	console.log(`[${new Date().toISOString()}] ${username.padStart(10)} connected.`);
	socket.on("rejoin", () => {
		console.log(`[${new Date().toISOString()}] ${username.padStart(10)} 'rejoin' message received.`);
		const match = matchManager.getMatchByPlayer(player.username);
		if (!match || (match.gameMode !== 'remoteGame' && match.gameMode !== 'tournament') || (match.state !== 'in-progress' && match.state !== 'paused')) {
			socket.emit("rejoin-response", {status: "rejected"});
			return;
		}

		try {
			matchManager.handleReconnect(player, match);
		} catch (err: any) {
			emitError(err.message, socket.id, io);
			socket.disconnect(true);
			console.log(err);
			return;
		}
	});

	socket.on("create", async (gameStatus: GameStatus) => {
		console.log(`[${new Date().toISOString()}] ${username.padStart(10)} 'create' message received.`);
		matchManager.handleMatchRequest(player, gameStatus);
	});

	socket.on("reset-match", () => {
		console.log(`[${new Date().toISOString()}] ${username.padStart(10)} 'reset-match' message received.`);
		const activeMatch = matchManager.getMatchByPlayer(player.username);
		if (activeMatch) {
			activeMatch.finishIncompleteMatch();
			matchManager.clearMatch(activeMatch);
		}
	});

	socket.on("disconnect", () => {
		console.log(`[${new Date().toISOString()}] ${username.padStart(10)} 'disconnect' message received.`);
		matchManager.handleDisconnect(player);
	});
});

export function apiCall(url: string, method: string, headers: HeadersInit, body?: BodyInit, token?: string): Promise<Response> {
	try {
		const options: RequestInit = {
			method,
			headers: {
				...headers,
				Authorization: token ? `Bearer ${token}` : '',
			},
		};
		if (body) {
			options.body = body;
		}
		return fetch(url, options)
	} catch (error) {
		console.error('Error in fetch:', error);
		throw error;
	}
}

function acceptConnection(socket: Socket, player: Player): boolean {
	if (matchManager.connectedPlayers.has(player.username)) {
		emitError("Şu anda oyun sunucusuna başka bir oturumdan bağlandınız. Yalnızca bir oturumdan oynayabilirsiniz!", socket.id, io);
		socket.disconnect(true);
		//console.log("new connection is rejected due to existing session.");
		return false;
	}
	
	matchManager.connectedPlayers.set(player.username, player);
	//console.log(`✔ Oyuncu bağlandı: ${player.username} (ID: ${socket.id})`);
	return true;
}
