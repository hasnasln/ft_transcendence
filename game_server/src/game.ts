import { InputProvider } from "./inputProviders";
import {MatchManager, Player} from "./matchManager";
import { GameEmitter } from "./gameEmitter";
import { ScoringManager } from "./scoringManager";
import { GameOrchestrator } from "./orchestrator";
import { Ball, DEFAULT_GAME_ENTITY_CONFIG, GameEntityFactory, GameEnvironment } from "./gameEntity";
import {pushWinnerToTournament} from "./tournament";
import {emitError} from "./errorHandling";

export type Side = 'leftPlayer' | 'rightPlayer';
export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
export type GamePhase = 'unset' | 'waiting' | 'ready' | 'playing' | 'completed';

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean
}

export interface GameConstants {
	groundWidth: number;
	groundHeight: number;
	ballRadius: number;
	paddleWidth: number;
	paddleHeight: number;
}

export interface GameState {
	setOver: boolean;
	isPaused: boolean;
	roundNumber?: number;
	phase: GamePhase;
}

export interface GameEndInfo {
	matchWinner?: Side;
	endReason: 'normal' | 'disconnection' | 'unknown';
}

export interface PaddleState {
	p1y: number;
	p2y: number;
}

export interface Position {
	x: number;
	y: number;
}

export class Game {
	public environment: GameEnvironment;
	public scoringManager: ScoringManager = new ScoringManager(this);

	public isPaused = true;
	public winner: Side | undefined = undefined;
	public aPlayerDisconnected: boolean = false;
	public lastUpdatedTime: number | undefined = undefined;
	public tournament?: { code: string, roundNo: number, finalMatch: boolean }

	public leftInput: InputProvider | undefined;
	public rightInput: InputProvider | undefined;
	public players: Player[];

	public roomId: string;
	public gameMode: GameMode;
	public state: GamePhase = 'waiting';

	constructor(roomId: string, players: Player[], gameMode: GameMode, environment: GameEnvironment) {
		if (players.length === 0) {
			throw new Error("Game constructor: players must be specified.");
		}
		this.players = players;
		this.roomId = roomId;
		this.gameMode = gameMode;
		this.environment = environment;
	}

	public resetBall(lastScorer: "leftPlayer" | "rightPlayer") {
		this.lastUpdatedTime = undefined;
		this.environment.ball.reset();

		setTimeout(() => {
			this.environment.ball.shove(lastScorer);
			this.lastUpdatedTime = Date.now();
		}, 1000);
	}

	public scorePoint(winner: Side) {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} scored point for ${winner}.`);
		if (this.state === 'completed' || this.isPaused) return;

		this.scoringManager.onScore(winner); 

		if (this.scoringManager.continueNewRound()) {
			this.resetBall(winner);
		} else {
			this.finalize();
		}

		GameEmitter.getInstance().emitBallState(this);
		GameEmitter.getInstance().emitSetState(this);
		GameEmitter.getInstance().emitGameState(this);
	}

	public finishIncompleteMatch(username?: string) {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} finishes incomplete match.`);
		let inCompleteWinner: Side | undefined = undefined;
		if (username)
			inCompleteWinner = (username === this.leftInput!.getUsername() ? 'leftPlayer' : 'rightPlayer') as Side;
		this.end();
		this.winner = inCompleteWinner;
		this.aPlayerDisconnected = true;
		GameEmitter.getInstance().emitGameState(this);
		GameEmitter.getInstance().emitGameFinish(this);
	}

	public pauseGameLoop() {
		if (this.state === 'completed') {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game cannot be paused, it is either over or already in progress.`);
			return;
		}
		this.isPaused = true;
		this.lastUpdatedTime = undefined;
		GameOrchestrator.getInstance().remove(this);
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game paused.`);
	}

	public stopGameLoop() {
		GameOrchestrator.getInstance().remove(this);
	}

	public resumeGameLoop() {
		if (this.state === 'completed') {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game cannot be resumed, it is either over or already in progress.`);
			return;
		}
		this.isPaused = false;
		
		GameOrchestrator.getInstance().add(this);
		this.lastUpdatedTime = Date.now();
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game resume now.`);
	}

	public startGameLoop() {
		GameEmitter.getInstance().emitGameConstants(this);
		GameEmitter.getInstance().emitSetState(this);

		this.scoringManager.isSetOver();
		this.scoringManager.setSetOver(false); //todo not sure if needed
		this.isPaused = false;

		this.leftInput?.init?.();
		this.rightInput?.init?.();

		GameEmitter.getInstance().emitGameState(this);

		const sides = [
			{ socket: typeof this.leftInput!.getSocket === 'function' ? this.leftInput!.getSocket()! : null },
			{ socket: typeof this.rightInput!.getSocket === 'function' ? this.rightInput!.getSocket()! : null }
		];

		if (this.gameMode === 'vsAI' || this.gameMode === 'localGame') {
			//todo handle this in a global way. and gracefully off it.
			sides.forEach(({ socket }) => {
				if (!socket) return;
				socket.on("pause-resume", (data: { status: string }) => {
					if (data.status === "pause" && !this.isPaused)
						this.pauseGameLoop();
					else if (data.status === "resume" && this.isPaused)
						this.resumeGameLoop();
				});
			});
		}

		if (!this.isPaused) {
			const initialPlayer = Math.random() < 0.5 ? 'leftPlayer' : 'rightPlayer';
			this.resetBall(initialPlayer);
		}

		GameOrchestrator.getInstance().add(this);
	}

	private finalize() {
		this.stopGameLoop();
		this.end();

		if (this.gameMode === 'tournament') {
			const winnerInput = this.winner === 'leftPlayer' ? this.leftInput : this.rightInput;
			const uuid = winnerInput!.getUuid();
			const username = winnerInput!.getUsername();
			try {
				pushWinnerToTournament(this.tournament?.code as string, this.tournament?.roundNo as number, { uuid, username });
			} catch (err: any) {
				emitError(err.message, this.roomId);
			}
		}

		this.winner = this.scoringManager.getMatchWinner()!;

		GameEmitter.getInstance().emitGameState(this);
		GameEmitter.getInstance().emitGameFinish(this);

		if (this.gameMode === 'localGame' || this.gameMode === 'vsAI')
			MatchManager.getInstance().clearGame(this);
	}

	public start() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} started.`);
		this.state = 'playing';
		this!.startGameLoop();
	}

	public pause() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} paused.`);
		this!.pauseGameLoop();
	}

	public resume() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} resumes.`);
		this!.resumeGameLoop();
	}

	public end() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} ended.`);
		this.state = 'completed';
		GameEmitter.getInstance().invalidateCache(this.roomId);
	}

	public getBall() {
		return this.environment.ball;
	}

	public getGround() {
		return this.environment.ground;
	}

	public getPaddleSpeed() {
		return DEFAULT_GAME_ENTITY_CONFIG.paddleSpeed * GameEntityFactory.UCF;
	}

	public getRightPaddle() {
		return this.environment.rightPaddle;
	}

	public getLeftPaddle() {
		return this.environment.leftPaddle;
	}
}

export { Ball };

