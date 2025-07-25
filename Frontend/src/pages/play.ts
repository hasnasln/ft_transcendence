import '@babylonjs/core/Rendering/edgesRenderer'
import { GameInfo, listenStateUpdates, waitForMatchReady, waitForRematchApproval, waitGameStart, MatchPlayers } from "./game-section/network";
import { GameUI } from "./game-section/ui";
import { GameEventBus } from "./game-section/gameEventBus";
import { Router } from '../router';
import { WebSocketClient } from './game-section/wsclient';
import { GamePage } from './game';
import { GameLoop } from './game-section/gameLoop';

export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament' | null;

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean
}

export class GameManager {
	public uiManager: GameUI = new GameUI();
	public gameInfo: GameInfo | null = null;
	public gameStatus: GameStatus = {
		currentGameStarted: false,
		game_mode: null,
		finalMatch: false
	};
	public reMatch: boolean = false;
	public username: string | null = null;
	public tournamentMode: boolean = false;
	public tournamentCode?: string;
	public currentRival: string | null = null;

	public constructor() {
		this.uiManager.resetCache();
	}

	private configureTournament(tournamentMode: boolean, tournamentCode?: string): void {
		this.tournamentMode = tournamentMode;
		if (tournamentMode) {
			this.tournamentCode = tournamentCode!;
			this.gameStatus = { currentGameStarted: false, game_mode: 'tournament', tournamentCode: this.tournamentCode, finalMatch: this.gameStatus.finalMatch };
		}
	}

	private async waitForModeSelection(): Promise<void> {
		return new Promise<void>((resolve) => {
			GameEventBus.getInstance().once('GAME_MODE_CHOSEN', (event) => {
				this.gameStatus = {
					currentGameStarted: false,
					game_mode: event.payload.mode,
					finalMatch: this.gameStatus.finalMatch
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
				});
			});
		});
	}

	private configure = async () => {
		if (this.gameStatus.game_mode === 'tournament') 
			return;

		if (this.gameStatus.currentGameStarted) 
			throw new Error("Game is already started: " + JSON.stringify(this.gameStatus));
		
		await this.waitForModeSelection();
	};

	private enterWaittingPhase = async (status: GameStatus): Promise<void> => {
		this.gameStatus = status;
		WebSocketClient.getInstance().emit("create", this.gameStatus);

		let rival: string | null = null;
		if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament') {
			await GameEventBus.getInstance().emit({ type: 'WAITING_FOR_RIVAL' });
			const matchPlayers: MatchPlayers = await waitForMatchReady();
			await GameEventBus.getInstance().emit({ type: 'RIVAL_FOUND', payload: { matchPlayers } });
		}
		this.currentRival = rival;
	};

	private enterReadyPhase = async () => {
		if (this.gameStatus.currentGameStarted) {
			this.reMatch = true;
			this.finalize();
		}

		if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
			const approval = await waitForRematchApproval(this.currentRival as string);
			GameEventBus.getInstance().emit({ type: 'REMATCH_APPROVAL', payload: { approval } });
			if (!approval)
				return;
		}

		WebSocketClient.getInstance().emit("ready", {}); //false or true doesnt matter here. server ignores.
		this.gameInfo = new GameInfo(this.gameStatus.game_mode);
		return;
	};


	public preparePlayProcess(tournamentMode: boolean, tournamentCode?: string): Promise<void> {
		this.configureTournament(tournamentMode, tournamentCode);
		return this.configure();
	}

	public startPlayProcess(): void {
		WebSocketClient.getInstance().connect("http://localhost:3001")
			.catch(err => 	console.error("WebSocket connection error:", err))
			.then(() => {
				if (Router.getInstance().getCurrentPath() !== '/game') {
					throw new Error("GameManager should be started from /game path, but current path is: " + Router.getInstance().getCurrentPath());
				}

				this.uiManager.cacheDOMElements();
				GamePage.enablePage();

				if (this.gameStatus.game_mode === 'localGame' || this.gameStatus.game_mode === 'vsAI')
					this.uiManager.onStartButtonShown();
				GameEventBus.getInstance().emit({ type: 'ENTER_WAITING_PHASE' })
				.then(() => this.enterWaittingPhase(this.gameStatus)) // wait for rival finding
				.then(() => onClickedTo(this.uiManager.startButton!)) // wait for start click
				.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_READY_PHASE' }))
				.then(() => this.enterReadyPhase())
				.then(() => listenStateUpdates(this.gameInfo!)) // start listening the game server
				.then(() => waitGameStart(this.gameInfo!)) // wait game server for start the game
				.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_PLAYING_PHASE' }));
			});
	}

	public handleMatchCancellation() {
		this.uiManager.onInfoShown("Maç iptal edildi. Ana sayfaya yönlendiriliyor...");
		this.finalize();
		setTimeout(() => {
			Router.getInstance().invalidatePage("/play");
			Router.getInstance().go('/play');
		}, 1000);
	}

	public finalize() {
		this.uiManager.scene?.dispose();
		this.uiManager.engine?.dispose();
		this.uiManager.scene = undefined;
		this.uiManager.engine = undefined;

		["init", "gameState", "bu", "paddleUpdate", "ready", "rematch-ready", "player-move", "local-input", "pause-resume", "reset-match"]
			.forEach(event => WebSocketClient.getInstance().off(event));

		this.gameInfo = null;
		this.gameStatus = {
			currentGameStarted: false,
			game_mode: null,
			finalMatch: false
		};
	}

	public handleNetworkPause(): void {
		if (this.gameInfo?.state?.matchOver || !this.gameStatus.currentGameStarted)
			return;

		if (this.gameStatus.game_mode === 'localGame' || this.gameStatus.game_mode === 'vsAI') {
			this.uiManager.onInfoShown("Ağ bağlantısı koptu. Maçınız bitirilecek ...");
			setTimeout(() => {
				this.uiManager.onInfoHidden();
				Router.getInstance().go('/play');
			}, 2000);
			return;
		}

		console.log("Network kopması algılandı, oyunu duraklatıyoruz.");
		this.uiManager.onInfoShown("Ağ bağlantısı koptu. 15 sn içerisinde bağlantı gelirse maçınız devam edecek...");
	}

	public requestRejoin() {
		gameInstance.uiManager.onInfoShown("Yeniden bağlandı. Oyuna katılma izni isteniyor...");
		WebSocketClient.getInstance().once("rejoin-response", (response: { status: string }) => {
			if (response.status === "approved") {
				console.log("Rejoin approved, resuming game.");
				gameInstance.uiManager.onInfoShown("Izin verildi. Oyuna katılınıyor...");
				setTimeout(() => gameInstance.uiManager.onInfoHidden(), 1000);
			} else {
				console.log("Rejoin rejected, redirecting to play page.");
				gameInstance.uiManager.onInfoShown("Izin verilmedi. Ana sayfaya dönülüyor...");
				GameLoop.getInstance().stop();
				gameInstance.uiManager.scene?.dispose();
				gameInstance.uiManager.engine?.dispose();
				gameInstance.uiManager.scene = undefined;
				gameInstance.uiManager.engine = undefined;
				gameInstance.gameInfo = null;
				gameInstance.gameStatus.currentGameStarted = false;
				gameInstance.uiManager.resetCache();
				setTimeout(() => Router.getInstance().go('/'), 1000);
			}
		});

		WebSocketClient.getInstance().emit("rejoin");
	}
}

function onClickedTo(element: HTMLElement): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!element) {
			reject(new Error("element not found: " + element));
			return;
		}

		const handler = () => {
			element.removeEventListener("click", handler);
			resolve();
		};

		element.addEventListener("click", handler);
	});
}

export const gameInstance = new GameManager();	