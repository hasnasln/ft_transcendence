import { Server } from "socket.io";
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
	console.log(`Server listening on port ${PORT}`);
});

export const matchManager = new MatchManager(io);

io.use(async (socket, next) => {
	const token = socket.handshake.auth?.token;
	if (!token) {
		console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
		next(new Error("Authentication error: token missing"));
		return;
	}

	const response = await apiCall('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined, token);
	const body = await response.json();
	console.log(`Token validation response: \n ${JSON.stringify(body, null, 2)}`);

	if (!response.ok) {
		next(new Error("Token validation error: " + body.error));
		return;
	}

	const user: User = { uuid: body.data.uuid, username: body.data.username, token: token };
	(socket as any).user = user;

	next();
});


io.on("connection", socket => {
	const user = (socket as any).user;
	const username = user.username;
	const uuid = user.uuid;
	const token = user.token;
	let player: Player

	if (matchManager.connectedPlayers.has(username)) {
		emitError("Şu anda oyun sunucusuna başka bir oturumdan bağlısınız. Yalnızca bir oturumdan oynayabilirsiniz !", socket.id, io);
		socket.disconnect(true);
		console.log("connection is doubled");
		return;
	} 
	
	player = { socket, username, uuid, token, status: 'online', socketReady: false };
	matchManager.connectedPlayers.set(username, player);
	console.log(`✔ Oyuncu bağlandı: ${username} (ID: ${socket.id})`);

	const match = matchManager.getMatchByPlayer(player.username);
	if (match && (match.gameMode === 'remoteGame' || match.gameMode === 'tournament') && (match.state === 'in-progress' || match.state === 'paused')) {
		try {
			matchManager.handleReconnect(player);
		} catch (err: any) {
			emitError(err.message, socket.id, io);
			socket.disconnect(true);
			console.log(err.message);
			return;
		}
	} else {
		socket.on("start", async (gameStatus: GameStatus) => {
			console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
			if (gameStatus.game_mode === "vsAI")
				matchManager.createMatchWithAI(player, gameStatus.level!);
			else if (gameStatus.game_mode === "localGame")
				matchManager.createLocalMatch(player);
			else if (gameStatus.game_mode === "remoteGame")
				matchManager.addPlayerToRemoteQueue(player);
			else if (gameStatus.game_mode === 'tournament')
				matchManager.handleTournamentMatch(player, gameStatus.tournamentCode!);
		});
	}

	socket.on("reset-match", () => {
		const activeMatch = matchManager.getMatchByPlayer(player.username);
		if (activeMatch) {
			console.log(`reset-match emiti geldi, activeMatch var ve room = ${activeMatch.roomId}`);
			activeMatch.finishIncompleteMatch();
			matchManager.clearMatch(activeMatch);
		}
	});

	socket.on("disconnect", () => {
		console.log(`disconnect geldi, ${socket.id} ayrıldı`);
		setTimeout(() => {
			matchManager.handleDisconnect(player);
		}, 50);
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








