import {
	GameInfo,
	listenStateUpdates,
	MatchPlayers,
	waitForMatchReady,
	waitForRematchApproval,
	waitGameStart
} from "./game-section/network";
import {GameUI} from "./game-section/ui";
import {GameEventBus} from "./game-section/gameEventBus";
import {Router} from '../router';
import { WebSocketClient} from './game-section/wsclient';
import {GamePage} from './game';
import {GameLoop} from './game-section/gameLoop';
import {GameInputHandler} from './game-section/keyboard';
import {BabylonJsWrapper} from "./game-section/3d";


export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
export type GamePhase = 'unset' | 'waiting' | 'ready' | 'playing' | 'completed';

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode?: GameMode;
	phase: GamePhase;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean;
}

export interface AIGameStatus extends GameStatus {
	level: string;
}

export interface TournamentGameStatus extends GameStatus {
	tournamentCode: string;
	roundNo: number;
	finalMatch: boolean;
}

export class GameManager {
	public uiManager: GameUI = new GameUI();
	public gameInfo: GameInfo | null = null;
	public gameStatus: GameStatus = {
		currentGameStarted: false,
		phase: 'unset',
	};
	public reMatch: boolean = false;
	public username: string | null = null;
	public tournamentMode: boolean = false;
	public tournamentCode?: string;
	public currentRival: string | null = null;
	public timers: NodeJS.Timeout[] = [];
	public abortHandler: AbortHandler | undefined = undefined;

	public constructor() {
		this.uiManager.resetCache();
	}

	private configureTournament(tournamentMode: boolean, tournamentCode?: string): void {
		this.tournamentMode = tournamentMode;
		if (tournamentMode) {
			this.tournamentCode = tournamentCode!;
			this.gameStatus = {
				currentGameStarted: false,
				phase: "unset",
				game_mode: 'tournament',
				tournamentCode: this.tournamentCode,
				finalMatch: false,
				roundNo: 0,
			} satisfies TournamentGameStatus;
		}
	}

	private async waitForModeSelection(): Promise<void> {
		return new Promise<void>((resolve) => {
			GameEventBus.getInstance().once('GAME_MODE_CHOSEN', (event) => {
				this.gameStatus = {
					currentGameStarted: false,
					phase: "unset",
					game_mode: event.payload.mode,
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
				}, 'game');
			}, 'game');
		});
	}

	private configure = async () => {
		if (this.gameStatus.game_mode === 'tournament')
			return;

		if (this.gameStatus.currentGameStarted)
			throw new Error("Game is already started: " + JSON.stringify(this.gameStatus));

		await this.waitForModeSelection();
	};

	private enterWaitingPhase = async (status: GameStatus): Promise<void> => {
		this.gameStatus = status;
		WebSocketClient.getInstance().once("match-cancelled", handleMatchCancellation, 20_000);
		WebSocketClient.getInstance().emit("create", this.gameStatus);

		if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament') {
			await GameEventBus.getInstance().emit({ type: 'WAITING_FOR_RIVAL' })
			const matchPlayers: MatchPlayers = await waitForMatchReady();
			this.abortHandler?.throwIfAborted();
			await GameEventBus.getInstance().emit({ type: 'RIVAL_FOUND', payload: { matchPlayers } });
			this.currentRival = matchPlayers.left.socketId === WebSocketClient.getInstance().getSocket()!.id ? matchPlayers.right.username : matchPlayers.left.username;
		}

		gameInstance.uiManager.showProgressBar();
		gameInstance.uiManager.updateProgressBar(100, 0);
		gameInstance.runAfter(() => {
			gameInstance.uiManager.updateProgressBar(0, 20_000);
		}, 50);
	};

	private enterReadyPhase = async () => {
		if (this.gameStatus.currentGameStarted) {
			this.reMatch = true;
			this.finalize();
		}

		if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
			let approval = await waitForRematchApproval()
			this.abortHandler?.throwIfAborted();
			await GameEventBus.getInstance().emit({ type: 'REMATCH_APPROVAL', payload: { approval } })
			if (!approval)
				return;
		}

		WebSocketClient.getInstance().emit("ready", {});
		this.gameInfo = new GameInfo(this.gameStatus.game_mode!);
		return;
	};

	public async preparePlayProcess(tournamentMode: boolean, tournamentCode?: string): Promise<unknown> {
		this.configureTournament(tournamentMode, tournamentCode);
		return Promise.all([BabylonJsWrapper.load(), this.configure()]);
	}


	public startPlayProcess(): void {
		this.abortHandler?.abort();
		this.abortHandler = new AbortHandler();
		this.abortHandler.onAbort = (error) => {
			console.log("GameManager aborted.");
			if (error) {
				console.error("GameManager aborted with error: ", error);
				this.uiManager.onInfoShown("Bir hata oluştu! Lütfen sayfayı yenileyin.");
				return;
			}
		};


		if (Router.getInstance().getCurrentPath() !== '/game') {
			throw new Error("GameManager should be started from /game path, but current path is: " + Router.getInstance().getCurrentPath());
		}

		this.uiManager.cacheDOMElements();
		GamePage.enablePage();
		GameEventBus.getInstance().emit({ type: 'CONNECTING_TO_SERVER' });
		WebSocketClient.getInstance().connect("localhost:3001")
			.catch(err => {
				GameEventBus.getInstance().emit({ type: 'CONNECTING_TO_SERVER_FAILED', payload: { error: err } });
				throw new Error("WebSocket connection failed.");
			})
			.then(() => {
				if (!this.abortHandler || this.abortHandler.isAborted())
					return;
				new AbortablePromise(this.abortHandler!)
				.then(() => GameEventBus.getInstance().emit({ type: 'CONNECTED_TO_SERVER' }))
				.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_WAITING_PHASE' }))
				.then(() => this.enterWaitingPhase(this.gameStatus)) // wait for rival finding
				.then(() => this.uiManager.onStartButtonShown())
				.then(() => new Promise<void>((resolve) => {
					GameEventBus.getInstance().once('READY_BUTTON_CLICK', () => resolve(), "game");
				})) // wait for start click
				.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_READY_PHASE' }))
				.then(() => this.enterReadyPhase())
				.then(() => listenStateUpdates(this.gameInfo!)) // start listening to the game server
				.then(() => waitGameStart(this.gameInfo!)) // wait game server for start the game
				.then(() => GameEventBus.getInstance().emit({ type: 'ENTER_PLAYING_PHASE' }));
			});
	}

	public finalize() {
		this.abortHandler?.abort();
		this.abortHandler = undefined;

		this.timers.forEach(timer => clearTimeout(timer)); /* assume timers are not async */
		this.timers = [];

		GameLoop.getInstance().stop();
		WebSocketClient.getInstance().reset();
		GameInputHandler.getInstance().reset();
		GameEventBus.getInstance().offAllByLabel("game");

		this.uiManager.finalizeUI();
		this.gameInfo = null;
		this.gameStatus = {
			currentGameStarted: false,
			finalMatch: false,
			phase: "unset"
		};
		
		this.uiManager.resetCache();
		GamePage.disablePage();
	}

	public handleNetworkPause(): void {
		if (this.gameInfo?.state?.phase !== 'playing' || !this.gameStatus.currentGameStarted)
			return;

		if (this.gameStatus.game_mode === 'localGame' || this.gameStatus.game_mode === 'vsAI') {
			this.uiManager.onInfoShown("Ağ bağlantısı koptu. Maçınız bitirilecek ...");
			gameInstance.runAfter(() => {
				this.uiManager.onInfoHidden();
				Router.getInstance().invalidatePage("/game");
				Router.getInstance().go('/play');
			}, 2000);
			return;
		}

		console.log("Network kopması algılandı, oyunu duraklatıyoruz.");
		this.uiManager.onInfoShown("Ağ bağlantısı koptu. 15 sn içerisinde bağlantı gelirse maçınız devam edecek...");
	}

	public requestRejoin() {
		if (!this.gameStatus.currentGameStarted || (this.gameStatus.game_mode !== 'tournament' && this.gameStatus.game_mode !== 'remoteGame')) {
			return;
		}
		console.log("Requesting rejoin to the game server.");
		gameInstance.uiManager.onInfoShown("Yeniden bağlandı. Oyuna katılma izni isteniyor...");
		WebSocketClient.getInstance().once("rejoin-response", (response: { status: string }) => {
			if (response.status === "approved") {
				console.log("Rejoin approved, resuming game.");
				gameInstance.uiManager.onInfoShown("Izin verildi. Oyuna katılınıyor...");
				gameInstance.runAfter(() => gameInstance.uiManager.onInfoHidden(), 1000);
			} else {
				console.log("Rejoin rejected, redirecting to play page.");
				gameInstance.uiManager.onInfoShown("Izin verilmedi. Ana sayfaya dönülüyor...");
				gameInstance.runAfter(() => {
					Router.getInstance().go('/');
					Router.getInstance().invalidatePage("/game");
				}, 1000);
			}
		});
		WebSocketClient.getInstance().emit("rejoin");
	}

	public runAfter(callback: () => void, delay: number): void {
		const id = setTimeout(() => {
			this.timers = this.timers.filter(t => t !== id);
			callback();
		}, delay);
		this.timers.push(id);
	}
}

function handleMatchCancellation() {
	gameInstance.uiManager.onInfoShown("Maç iptal edildi. Ana sayfaya yönlendiriliyor...");
	gameInstance.runAfter(() => {
		Router.getInstance().invalidatePage("/play");
		Router.getInstance().go('/play');
		Router.getInstance().invalidatePage("/game");
	}, 1000);
}

export class AbortHandler {
	private static ABORTED_ERROR = "Operation aborted";
	private aborted: boolean = false;
	public onAbort: ((error: any | null) => void) | null = null;

	public abort(err?: any): void {
		this.aborted = true;
		this.onAbort?.(err || null);
	}

	public isAborted(): boolean {
		return this.aborted;
	}

	public throwIfAborted(): void {
		if (this.aborted) {
			throw new Error(AbortHandler.ABORTED_ERROR);
		}
	}
}

export class AbortablePromise<C, P> implements PromiseLike<P> {
	
	private readonly abortHandler: AbortHandler;
	private readonly callback: ((value: C | undefined) => P) | undefined;
	private value!: P;
	private isFulfilled: boolean = false;
	private next: AbortablePromise<P, unknown> | null = null;

	public constructor(abortHandler: AbortHandler, callback: ((value: C | undefined) => P) | undefined = undefined, first: boolean = true) {
		this.callback = callback;
		this.abortHandler = abortHandler;
		if (first) {
			this.run(undefined as unknown as C);
			this.isFulfilled = true;
		}
	}

	private async run(val: C | undefined) {
		if (this.abortHandler.isAborted()) {
			return;
		}
		
		if (this.callback) {
			try {
				this.value = await this.callback(val);
				this.isFulfilled = true;
			} catch (error) {
				this.abortHandler.abort(error);
				return;
			}
		}

		if (this.next && this.isFulfilled) {
			this.next.run(this.value);
		}
	}

	public then<TResult1 = P>(cb: (value: P | undefined) => TResult1): AbortablePromise<P, any> {
		this.next = new AbortablePromise<P, any>(this.abortHandler, cb, false);

		if (this.isFulfilled) {
			this.next.run(this.value);
		}
		return this.next;
	}
	
}

export const gameInstance = new GameManager();	