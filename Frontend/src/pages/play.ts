import '@babylonjs/core/Rendering/edgesRenderer'
import { GameInfo, listenStateUpdates, waitForMatchReady, waitForRematchApproval, onFirstStateUpdate, MatchPlayers } from "./game-section/network";
import { GameUI } from "./game-section/ui";
import { GameEventBus } from "./game-section/gameEventBus";
import { Router } from '../router';
import { WebSocketClient } from './game-section/wsclient';

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
		this.uiManager.removeCache();
	}

	private configureTournament(tournamentMode: boolean, tournamentCode?: string): void {
		this.tournamentMode = tournamentMode;
		if (tournamentMode) {
			this.tournamentCode = tournamentCode!;
			this.gameStatus = { currentGameStarted: false, game_mode: 'tournament', tournamentCode: this.tournamentCode, finalMatch: this.gameStatus.finalMatch };
		}
	}

	//todo listen once?
	private async listenModeSelectorButtons(): Promise<void> {
		let status: GameStatus = { currentGameStarted: false, game_mode: null, finalMatch: this.gameStatus.finalMatch };

		const btnVsComp = document.getElementById("btn-vs-computer")!;
		const btnFindRival = document.getElementById("btn-find-rival")!;
		const diffDiv = document.getElementById("difficulty")!;
		const btnLocal = document.getElementById("btn-local")!;

		return new Promise<void>((resolve) => {
			btnVsComp.addEventListener("click", () => {
				this.uiManager.onMenuHidden();
				this.uiManager.onDifficultyShown();
			});

			diffDiv.querySelectorAll("button").forEach(btn => {
				btn.addEventListener("click", async () => {
					const level = (btn as HTMLButtonElement).dataset.level!;
					this.uiManager.onDifficultyHidden();
					this.uiManager.onStartButtonShown();
					status.game_mode = 'vsAI';
					status.level = level;
					this.gameStatus = status;
					resolve();
				});
			});

			btnFindRival.addEventListener("click", async () => {
				this.uiManager.onMenuHidden();
				status.game_mode = 'remoteGame';
				this.gameStatus = status;
				resolve();
			});

			btnLocal.addEventListener("click", async () => {
				this.uiManager.onMenuHidden();
				this.uiManager.onStartButtonShown();
				status.game_mode = 'localGame';
				this.gameStatus = status;
				resolve();
			});
		});
	}

	private configure = async () => {
		if (this.gameStatus.game_mode === 'tournament') {
			return
		}

		if (!this.gameStatus.currentGameStarted) {
			await this.listenModeSelectorButtons();
			return
		}
		throw new Error("Mode could not selected: " + this.gameStatus);
	};

	private enterWaittingPhase = async (status: GameStatus): Promise<void> => {
		this.gameStatus = status;
		WebSocketClient.getInstance().emit("create", this.gameStatus);

		let rival: string | null = null;
		if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament') {
			//todo remove awaits
			await GameEventBus.getInstance().emit({ type: 'WAITING_FOR_RIVAL' });
			const matchPlayers: MatchPlayers = await waitForMatchReady(this);
			await GameEventBus.getInstance().emit({ type: 'RIVAL_FOUND', payload: { matchPlayers } });
		}
		this.currentRival = rival;
	};

	private enterReadyPhase = async () => {
		if (this.gameStatus.currentGameStarted) {
			this.reMatch = true;
			this.finalize();
		}

		WebSocketClient.getInstance().emit("ready", false); //false or true doesnt matter here. server ignores.
		if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
			const approval = await waitForRematchApproval(this.currentRival as string);
			GameEventBus.getInstance().emit({ type: 'REMATCH_APPROVAL', payload: { approval } });
			if (!approval) return;
			WebSocketClient.getInstance().emit("ready", true);
		}
		this.gameInfo = new GameInfo(this.gameStatus.game_mode);
		return;
	};

	public startPlayProcess(tournamentMode: boolean, tournamentCode?: string): void {
		this.configureTournament(tournamentMode, tournamentCode);
		this.uiManager.cacheDOMElements();

		WebSocketClient.getInstance().connect("http://localhost:3001")
			.catch(err => 	console.error("WebSocket connection error:", err))
			.then(() => this.configure()) // fill mode, difficulty, etc.
			.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_WAITING_PHASE' }))
			.then(() => this.enterWaittingPhase(this.gameStatus)) // wait for rival finding
			.then(() => onClickedTo(this.uiManager.startButton!)) // wait for start click
			.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_READY_PHASE' }))
			.then(() => this.enterReadyPhase()) 				  
			.then(() => listenStateUpdates(this.gameInfo!)) // start listening the game server
			.then(() => onFirstStateUpdate(this.gameInfo!))			// wait game server for start the game
			.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_PLAYING_PHASE' }))
	}

	public startRejoinProcess(tournamentMode: boolean, tournamentCode?: string): void {
		WebSocketClient.getInstance().connect("http://localhost:3001")
		this.configureTournament(tournamentMode, tournamentCode);
		this.uiManager.cacheDOMElements();

		listenStateUpdates(this.gameInfo!)
		onFirstStateUpdate(this.gameInfo!)
			.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_PLAYING_PHASE' }))
			.then(() => this.requestRejoin())
	}

	public finalize() {
		this.uiManager.scene!.dispose();
		this.uiManager.engine!.dispose();
		this.uiManager.scene = undefined;
		this.uiManager.engine = undefined;

		["gameConstants", "gameState", "bu", "paddleUpdate",
			"ready", "rematch-ready", "start", "username", "player-move",
			"local-input", "pause-resume", "reset-match"]
			.forEach(event => {
				WebSocketClient.getInstance().off(event);
			});

		this.gameInfo = null;
		this.gameStatus.currentGameStarted = false;
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
				gameInstance.uiManager.engine?.stopRenderLoop();
				gameInstance.uiManager.scene?.dispose();
				gameInstance.uiManager.engine?.dispose();
				gameInstance.uiManager.scene = undefined;
				gameInstance.uiManager.engine = undefined;
				gameInstance.gameInfo = null;
				gameInstance.gameStatus.currentGameStarted = false;
				gameInstance.uiManager.removeCache();
				setTimeout(() => Router.getInstance().go('/'), 1000);
			}
		});

		WebSocketClient.getInstance().emit("rejoin");
	}

	public saveUserInGame():void {
		localStorage.setItem("inGame", "true");
	}

	public removeUserInGame():void {
		localStorage.removeItem("inGame");
	}

	public wasUserInGame(): boolean {
		return localStorage.getItem("inGame") === "true";
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