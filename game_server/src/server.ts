import { MatchManager } from "./matchManager";
import { ConnectionHandler } from "./connection";
import { GameOrchestrator } from "./orchestrator";

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

ConnectionHandler.getInstance().init();
GameOrchestrator.getInstance().start(60);

export const matchManager = new MatchManager();

setInterval(() => {
	const now = Date.now();
	for (const [username, disconnectEvent] of matchManager.disconnectTimestamps) {
		if (now - disconnectEvent.timestamp > 15_000) {
			matchManager.disconnectTimestamps.delete(username);
			const {player,game} = disconnectEvent;
			if (game.state === 'in-progress' || game.state === 'paused') {
				const opponent = game.players.find(p => p.username !== player.username)!;
				game.finishIncompleteMatch(opponent.username);
			}
			matchManager.clearMatch(game);
		}
	}
}, 1000);

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

		console.log("options", options);
		console.log("url", url);
		return fetch(url, options);
	} catch (error) {
		console.error('Error in fetch:', error);
		throw error;
	}
}
