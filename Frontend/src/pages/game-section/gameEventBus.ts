import { gameInstance } from "../play";
import { listenPlayerInputs } from "./keyboard";
import { startGameLoop } from "./gameLoop";
import { MatchPlayers } from "./network";
import { updateScoreBoard, showEndMessage, startNextSet } from "./ui";
import { WebSocketClient } from "./wsclient";
export type GameEventType =
	| 'SET_COMPLETED'
	| 'MATCH_ENDED'
	| 'GAME_PAUSED'
	| 'GAME_RESUMED'
	| 'RIVAL_FOUND'
	| 'WAITING_FOR_RIVAL'
	| 'MODE_SELECTED'
	| 'PLAYER_DISCONNECTED'
	| 'GAME_STARTED'
	| 'GAME_CONFIGURED' 
	| 'ENTER_WAITING_PHASE'
	| 'ENTER_READY_PHASE'
	| 'ENTER_PLAYING_PHASE'
	| 'REMATCH_APPROVAL'
	| 'RIVAL_DISCONNECTED'
	| 'RIVAL_RECONNECTED'
	| 'INITIALLY_CONNECTED'
	| 'DISCONNECTED'
	| 'CONNECTION_ERROR'
	| 'RECONNECTION_ATTEMPT_FAILED'
	| 'RECONNECTION_ATTEMPT'
	| 'RECONNECTION_GAVE_UP'
	| 'RECONNECTED'
;

export interface GameEvent {
	type: GameEventType;
	payload?: any;
}

export type EventHandler = (event: GameEvent) => void | Promise<void>;


export class GameEventBus {
	private listeners: { [eventType: string]: EventHandler[] } = {};

	private static instance: GameEventBus;
	private constructor() {
	}

	public static getInstance(): GameEventBus {
		if (!GameEventBus.instance) {
			GameEventBus.instance = new GameEventBus();
		}
		return GameEventBus.instance;
	}

	// concurrent. ensure enqueued.
	public async emit(event: GameEvent): Promise<void> {
		console.log(`Event emitted: ${event.type}`, event.payload);
		const handlers = this.listeners[event.type] || [];
		await Promise.all(handlers.map(handler => handler(event)));
	}

	public on(eventType: GameEventType, handler: EventHandler): void {
		if (!this.listeners[eventType]) {
			this.listeners[eventType] = [];
		}
		this.listeners[eventType].push(handler);
	}

	public off(eventType: GameEventType, handler: EventHandler): void {
		if (!this.listeners[eventType]) return;
		this.listeners[eventType] = this.listeners[eventType].filter(h => h !== handler);
	}
}

GameEventBus.getInstance().on('SET_COMPLETED', async () => {
	updateScoreBoard();
	return startNextSet().then(() => startGameLoop());
});

GameEventBus.getInstance().on('MATCH_ENDED', () => {
	updateScoreBoard();
	showEndMessage();
});

GameEventBus.getInstance().on('GAME_RESUMED', () => {
	//startGameLoop();
});

GameEventBus.getInstance().on('WAITING_FOR_RIVAL', () => {
	if (gameInstance.gameStatus.game_mode === 'tournament') {
		gameInstance.uiManager.onInfoShown("Turnuva rakibi için bekleniyor...");
	} else {
		gameInstance.uiManager.onInfoShown("Online bir rakip için bekleniyor...");
	}
});

GameEventBus.getInstance().on('RIVAL_FOUND', (event) => {
	const matchPlayers: MatchPlayers = event.payload.matchPlayers;
	const rival: string = matchPlayers.left.socketId === WebSocketClient.getInstance().getSocket()!.id ? matchPlayers.right.username : matchPlayers.left.username;
	gameInstance.uiManager.updateUIForRivalFound(matchPlayers, rival);
});

GameEventBus.getInstance().on('ENTER_READY_PHASE', () => {
	gameInstance.uiManager.onStartButtonHidden();
	gameInstance.uiManager.hide(gameInstance.uiManager.endMsg ?? document.getElementById("end-message"));

	if (gameInstance.gameStatus.game_mode === "remoteGame" || gameInstance.gameStatus.game_mode === "tournament") {
		gameInstance.uiManager.onInfoShown(`${gameInstance.currentRival ?? ''} bekleniyor ...`);
	} else {
		gameInstance.uiManager.onInfoHidden();
	}

	gameInstance.uiManager.hide(gameInstance.uiManager.newmatchButton);
	gameInstance.uiManager.hide(gameInstance.uiManager.turnToHomePage);
});

GameEventBus.getInstance().on('ENTER_PLAYING_PHASE',  async () => {
	await gameInstance.uiManager.setupScene();
	listenPlayerInputs(gameInstance.gameInfo!);
	startGameLoop();
});

GameEventBus.getInstance().on('REMATCH_APPROVAL', (event) => {
	if (!event.payload.approval) {
		gameInstance.uiManager.show(gameInstance.uiManager.newmatchButton);
		gameInstance.uiManager.hide(gameInstance.uiManager.turnToHomePage);
	}
});

GameEventBus.getInstance().on('RIVAL_DISCONNECTED', () => {
	gameInstance.uiManager.onInfoShown("Rakip bağlantısı kesildi. Bekleniyor...");
});

GameEventBus.getInstance().on('RIVAL_RECONNECTED', () => {
	gameInstance.uiManager.onInfoShown("Rakip yeniden bağlandı.");
	setTimeout(() => {
		gameInstance.uiManager.onInfoHidden();
	}, 1000);
});

GameEventBus.getInstance().on('INITIALLY_CONNECTED', () => {
});

GameEventBus.getInstance().on('DISCONNECTED', (event) => {
	if (gameInstance.gameStatus.currentGameStarted)
		gameInstance.handleNetworkPause();
	if (event.payload.reason === 'io server disconnect') {
		gameInstance.uiManager.onInfoShown("Oyun sunucusu bağlantınızı reddetti. Başka bir oturum açık.");
	}
});

GameEventBus.getInstance().on('RECONNECTED', () => {
	if (!gameInstance.gameStatus.currentGameStarted || !gameInstance.uiManager.isSceneReady()) return;
	console.log("Reconnected to the game server.");
	gameInstance.requestRejoin();
});

GameEventBus.getInstance().on('CONNECTION_ERROR', (event) => {
	const err = event.payload.reason;
	if (err === "Existing session found.") {
		gameInstance.uiManager.onInfoShown("Oyun sunucusu bağlantınızı reddetti. Başka bir oturum açık.");
	}
	/*console.error('Socket connection error:', err);
	if (err.includes("token missing")) {
		alert("Token eksik. Lütfen tekrar giriş yapın.");
		Router.getInstance().go('/login');
	} else if (err.includes("Token validation error")) {
		alert("Token doğrulama hatası :" + err);
		Router.getInstance().go('/login');
	} else if (err.includes("Game server error")) {
		alert("Aynı anda birden fazla oyuna katılamazsınız.");
		Router.getInstance().go('/');
	}*/
});