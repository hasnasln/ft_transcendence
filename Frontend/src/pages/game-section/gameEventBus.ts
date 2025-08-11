import { gameInstance } from "../play";
import { listenPlayerInputs } from "./keyboard";
import { GameLoop } from "./gameLoop";
import { MatchPlayers } from "./network";
import { updateScoreBoard, showEndMessage, startNextSet } from "./ui";
import { WebSocketClient } from "./wsclient";
import { Router } from "../../router";
import {BabylonJsWrapper} from "./3d";

export const gameEventTypes = [
    'SET_COMPLETED',
    'MATCH_ENDED',
    'GAME_PAUSED',
    'GAME_RESUMED',
	'BALL_POSITION_RESET',
	'BALL_PADDLE_HIT',
    'RIVAL_FOUND',
    'WAITING_FOR_RIVAL',
    'MODE_SELECTED',
    'PLAYER_DISCONNECTED',
    'GAME_STARTED',
    'GAME_CONFIGURED',
    'ENTER_WAITING_PHASE',
    'ENTER_READY_PHASE',
    'ENTER_PLAYING_PHASE',
    'REMATCH_APPROVAL',
    'RIVAL_DISCONNECTED',
    'RIVAL_RECONNECTED',
    'INITIALLY_CONNECTED',
    'DISCONNECTED',
    'CONNECTION_ERROR',
    'RECONNECTION_ATTEMPT_FAILED',
    'RECONNECTION_ATTEMPT',
    'RECONNECTION_GAVE_UP',
    'RECONNECTED',
	'READY_BUTTON_CLICK',
    'GAME_MODE_CHOSEN',
    'AI_DIFFICULTY_CHOSEN',
    'CONNECTING_TO_SERVER',
    'CONNECTING_TO_SERVER_FAILED',
    'CONNECTED_TO_SERVER',
] as const;

export type GameEventType = typeof gameEventTypes[number];

export interface GameEvent {
	type: GameEventType;
	payload?: any;
}

export type EventHandler = (event: GameEvent) => void | Promise<void>;

export interface LabelledEventHandler {
	labels: string[];
	handler: EventHandler;
}

export class GameEventBus {
	private listeners: { [eventType: string]: LabelledEventHandler[] } = {};
	private onceListeners: { [eventType: string]: LabelledEventHandler[] } = {};

	private static instance: GameEventBus;
	private constructor() {
	}

	public static getInstance(): GameEventBus {
		if (!GameEventBus.instance) {
			GameEventBus.instance = new GameEventBus();
		}
		return GameEventBus.instance;
	}

	public reset(): void {
		this.listeners = {};
		this.onceListeners = {};
	}

	// concurrent. ensure enqueued.
	public async emit(event: GameEvent): Promise<void> {
		console.log(`Event emitted: ${event.type}`, event.payload);
		const handlers = this.listeners[event.type] || [];
		await Promise.all(handlers.map(handler => handler.handler(event)));

		const onceHandlers = this.onceListeners[event.type] || [];
		if (onceHandlers.length === 0) return;
		await Promise.all(onceHandlers.map(handler => handler.handler(event)));
		this.onceListeners[event.type] = [];
	}

	public once(eventType: GameEventType, handler: EventHandler, ...labels: string[]): void {
		if (!this.onceListeners[eventType]) {
			this.onceListeners[eventType] = [];
		}
		this.onceListeners[eventType].push({ labels, handler });
	}

	public on(eventType: GameEventType, handler: EventHandler, ...labels: string[]): void {
		if (!this.listeners[eventType]) {
			this.listeners[eventType] = [];
		}
		this.listeners[eventType].push({ labels, handler });
	}

	public off(eventType: GameEventType, handler: EventHandler): void {
		this.offByFilter(eventType, h => h.handler === handler);
	}

	public offAllByLabel(label: string): void {
		for (const eventType of gameEventTypes) {
			this.offByFilter(eventType as GameEventType, h => h.labels.includes(label));
		}
	}

	public offByFilter(eventType: GameEventType, filter: (h: LabelledEventHandler) => boolean): void {
		if (this.listeners[eventType]) {
			this.listeners[eventType] = this.listeners[eventType].filter(h => !filter(h));
		}
		if (this.onceListeners[eventType]) {
			this.onceListeners[eventType] = this.onceListeners[eventType].filter(h => !filter(h));
		}
	}
}

let listenersLoaded = false;
export function listenGameBusEvents() {
	if (listenersLoaded) return;
	listenersLoaded = true;
	GameEventBus.getInstance().on('CONNECTING_TO_SERVER', async (event) => {
		gameInstance.uiManager.onInfoShown("...");
	});

	GameEventBus.getInstance().on('CONNECTING_TO_SERVER_FAILED', async (event) => {
		gameInstance.uiManager.onInfoShown("Sunucuya bağlanma başarısız oldu: " + event.payload.error);
	});

	GameEventBus.getInstance().on('CONNECTED_TO_SERVER', async () => {
		gameInstance.uiManager.onInfoShown("Bağlantı hazır.");
	});

	GameEventBus.getInstance().on('SET_COMPLETED', async () => {
		updateScoreBoard();
		return startNextSet().then(() => {
			console.log("Game Loop started due to set completion.");
			GameLoop.getInstance().start();
		});
	});

	GameEventBus.getInstance().on('MATCH_ENDED', () => {
		console.log("Match is over, loop stop.");
		GameLoop.getInstance().stop();
		if (!gameInstance.gameInfo || !gameInstance.gameInfo.state)
			throw new Error("Game state is not initialized.");

		console.log(`game phase: ${gameInstance.gameStatus.phase} => completed`);
		gameInstance.gameStatus.phase = "completed";
		gameInstance.uiManager.onInfoHidden();
		updateScoreBoard();
		showEndMessage();
	});

	GameEventBus.getInstance().on('GAME_RESUMED', () => {
		WebSocketClient.getInstance().emit("pause-resume", { status: "resume" });
		gameInstance.uiManager.resumeButton?.classList.add("hidden");
		gameInstance.uiManager.newMatchButton?.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage?.classList.add("hidden");
	});

	GameEventBus.getInstance().on('GAME_PAUSED', () => {
		WebSocketClient.getInstance().emit("pause-resume", { status: "pause" });
		gameInstance.uiManager.resumeButton?.classList.remove("hidden");
		gameInstance.uiManager.newMatchButton?.classList.remove("hidden");
		gameInstance.uiManager.turnToHomePage?.classList.remove("hidden");
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

	GameEventBus.getInstance().on('ENTER_WAITING_PHASE', () => {
		console.log(`game phase: ${gameInstance.gameStatus.phase} => waiting`);
		gameInstance.gameStatus.phase = "waiting";
	})

	GameEventBus.getInstance().on('ENTER_READY_PHASE', () => {
		console.log(`game phase: ${gameInstance.gameStatus.phase} => ready`);
		gameInstance.gameStatus.phase = "ready";

		gameInstance.uiManager.onStartButtonHidden();
		gameInstance.uiManager.hide(gameInstance.uiManager.endMsg ?? document.getElementById("end-message"));

		if (gameInstance.gameStatus.game_mode === "remoteGame" || gameInstance.gameStatus.game_mode === "tournament") {
			gameInstance.uiManager.onInfoShown(`${gameInstance.currentRival ?? ''} bekleniyor ...`);
		} else {
			gameInstance.uiManager.onInfoHidden();
		}

		gameInstance.uiManager.hide(gameInstance.uiManager.newMatchButton);
		gameInstance.uiManager.hide(gameInstance.uiManager.turnToHomePage);
		gameInstance.uiManager.hideProgressBar();
	});

	GameEventBus.getInstance().on('ENTER_PLAYING_PHASE',  async () => {
		console.log(`game phase: ${gameInstance.gameStatus.phase} => playing`);
		gameInstance.gameStatus.phase = "playing";
		await gameInstance.uiManager.setupScene();
		listenPlayerInputs(gameInstance.gameInfo!);
		console.log("Game Loop started due to playing phase entry.");

		GameLoop.getInstance().start();
	});

	GameEventBus.getInstance().on('REMATCH_APPROVAL', (event) => {
		if (!event.payload.approval) {
			gameInstance.uiManager.show(gameInstance.uiManager.newMatchButton);
			gameInstance.uiManager.hide(gameInstance.uiManager.turnToHomePage);
		}
	});

	GameEventBus.getInstance().on('RIVAL_DISCONNECTED', () => {
		gameInstance.uiManager.onInfoShown("Rakip bağlantısı kesildi. Bekleniyor...");
	});

	GameEventBus.getInstance().on('RIVAL_RECONNECTED', () => {
		gameInstance.uiManager.onInfoShown("Rakip yeniden bağlandı.");
		gameInstance.runAfter(() => {
			gameInstance.uiManager.onInfoHidden();
		}, 1000);
	});

	GameEventBus.getInstance().on('INITIALLY_CONNECTED', () => {
	});

	GameEventBus.getInstance().on('DISCONNECTED', (event) => {
		if (gameInstance.gameStatus.currentGameStarted)
			gameInstance.handleNetworkPause();
		else {
			gameInstance.finalize();
			Router.getInstance().invalidatePage("/game");
			Router.getInstance().invalidatePage("/play");
			Router.getInstance().go('/play');
		}
		if (event.payload.reason === 'io server disconnect') {
			gameInstance.uiManager.onInfoShown("Oyun sunucusu bağlantınızı reddetti. Başka bir oturum açık.");
		}
	});

	GameEventBus.getInstance().on('RECONNECTED', () => {
		if (!gameInstance.gameStatus.currentGameStarted || !gameInstance.uiManager.isSceneReady()) return;
		console.log("Reconnected to the game server.");
		gameInstance.requestRejoin();
	});

	GameEventBus.getInstance().on('RECONNECTION_GAVE_UP', (event) => {
		if (gameInstance.gameStatus.currentGameStarted) {
			gameInstance.uiManager.onInfoShown("Oyun sunucusuna yeniden bağlanma başarısız oldu.");
			WebSocketClient.getInstance().reset();
			gameInstance.runAfter(() => {
				Router.getInstance().invalidatePage("/game");
				Router.getInstance().go('/');
			}, 1000);
		}
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

	GameEventBus.getInstance().on('BALL_POSITION_RESET', event => {
		const tr = gameInstance.uiManager.ball!.trail;
		tr.stop();
		tr.setEnabled(false);

		requestAnimationFrame(() => {
			tr.reset();
			tr.setEnabled(true);
			tr.start();
		});
	});

	GameEventBus.getInstance().on('BALL_PADDLE_HIT', event => {
		if (!gameInstance.uiManager.ball) return;
		const mat = event.payload.object.material;
		const oldColor = mat.emissiveColor;
		mat.emissiveColor = new (BabylonJsWrapper.getInstance().Color3)(mat.emissiveColor.r+0.4, mat.emissiveColor.g+0.4, mat.emissiveColor.b+0.4);
		setTimeout(() => mat.emissiveColor = oldColor, 100);
	});
}

