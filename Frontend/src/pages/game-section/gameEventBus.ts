import { gameInstance } from "../play";
import { listenPlayerInputs } from "./eventListeners";
import { startGameLoop } from "./gameLoop";
import { MatchPlayers } from "./network";
import { updateScoreBoard, updateSetBoard, showEndMessage, startNextSet } from "./ui";
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
	return startNextSet()
		.then(() => startGameLoop());
});

GameEventBus.getInstance().on('MATCH_ENDED', () => {
	updateScoreBoard();
	updateSetBoard();
	showEndMessage();
});

GameEventBus.getInstance().on('GAME_RESUMED', () => {
	startGameLoop();
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
	const rival: string = matchPlayers.left.socketId === gameInstance.socket!.id ? matchPlayers.right.username : matchPlayers.left.username;
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

GameEventBus.getInstance().on('ENTER_PLAYING_PHASE',  () => {
	gameInstance.uiManager.setupScene();
	listenPlayerInputs(gameInstance.gameInfo!);
	startGameLoop();
});

GameEventBus.getInstance().on('REMATCH_APPROVAL', (event) => {
	if (!event.payload.approval) {
		gameInstance.uiManager.show(gameInstance.uiManager.newmatchButton);
		gameInstance.uiManager.hide(gameInstance.uiManager.turnToHomePage);
	}
});

