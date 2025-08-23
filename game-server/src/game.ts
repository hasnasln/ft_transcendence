import {InputProvider} from "./inputProviders";
import {MatchManager, Player} from "./matchManager";
import {GameEmitter} from "./gameEmitter";
import {ScoringManager} from "./scoringManager";
import {GameOrchestrator} from "./orchestrator";
import {Ball, DEFAULT_GAME_ENTITY_CONFIG, GameEntityFactory, GameEnvironment} from "./gameEntity";
import {patchWinnersToTournament} from "./tournament";
import {emitError} from "./errorHandling";
import { ConnectionHandler } from "./connection";

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
	paddleSpeed: number;
}

export interface GameState {
	setOver: boolean;
	isPaused: boolean;
	roundNumber?: number;
	tournamentName?: string;
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

	public isPaused = false;
	public winner: Side | undefined = undefined;
	public aPlayerDisconnected: boolean = false;
	public lastUpdatedTime: number | undefined = undefined;
	public lastBallNotifiedTime: number= 0;
	public lastPaddleNotifiedTime: number= 0;
	public tournament?: { code: string, roundNo: number, finalMatch: boolean, name: string };

	public leftInput: InputProvider | undefined;
	public rightInput: InputProvider | undefined;
	public players: Player[];

	public roomId: string;
	public gameMode: GameMode;
	public state: GamePhase = 'waiting';

	constructor(roomId: string, players: Player[], gameMode: GameMode, environment: GameEnvironment) {
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
			GameEmitter.getInstance().emitBallState(this, true);
		}, 1000);
	}

	private startNewRound(lastScorer?: Side) {
		if (!lastScorer) {
			lastScorer = Math.random() < 0.5 ? 'leftPlayer' : 'rightPlayer';
		}
		this.resetBall(lastScorer);
		GameEmitter.getInstance().emitGameConstants(this);
		GameEmitter.getInstance().emitBallState(this, true);
		GameEmitter.getInstance().emitSetState(this);
		GameEmitter.getInstance().emitGameState(this);
	}

	public scorePoint(scorer: Side) {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} scored point for ${scorer}.`);
		if (this.state === 'completed' || this.isPaused) return;

		this.scoringManager.onScore(scorer);
		if (this.scoringManager.continueNewRound()) {
			this.startNewRound(scorer);
		} else {
			this.finalize();
		}
	}

	public finalize(winner?: string) {
		this.end();
		if (winner) {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} finishes incomplete match.`);
			this.winner = (winner === this.leftInput!.getUsername() ? 'leftPlayer' : 'rightPlayer') as Side;
			this.aPlayerDisconnected = true;
		} else {
			this.winner = this.scoringManager.getMatchWinner()!
			this.aPlayerDisconnected = false;
		}

		if (this.gameMode === 'tournament') {
			const winnerInput = this.winner === 'leftPlayer' ? this.leftInput : this.rightInput;
			const uuid = winnerInput!.getUuid();
			const username = winnerInput!.getUsername();
			try {
				patchWinnersToTournament(this.tournament?.code as string, this.tournament?.roundNo as number, { uuid, username });
			} catch (err: any) {
				emitError('tournamentError', "TOURNAMENT_WINNER_COULD_NOT_BE_UPDATED", this.roomId);
			}
			
		}

		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} finalized with winner: ${this.winner}.`);

		GameEmitter.getInstance().emitGameState(this);
		GameEmitter.getInstance().emitSetState(this); // oyun sonunda set kısmını da güncellemek için
		GameEmitter.getInstance().emitGameFinish(this);

		if (this.gameMode === 'localGame' || this.gameMode === 'vsAI')
			MatchManager.getInstance().clearGame(this);
	}

	public start() {
		if (this.state !== "waiting") {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game cannot be started.`);
			return;
		}
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} started.`);

		this.leftInput?.init?.();
		this.rightInput?.init?.();

		this.state = 'playing';
		this.startNewRound()
		GameOrchestrator.getInstance().add(this);
	}

	public pause() {
		if (this.state === 'completed') {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game cannot be paused, it is either over or already in progress.`);
			return;
		}
		if (this.isPaused) {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game is already paused.`);
			return;
		}

		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} paused.`);
		this.isPaused = true;
		this.lastUpdatedTime = undefined;
		GameOrchestrator.getInstance().remove(this);
	}

	public resume() {
		if (this.state === 'completed') {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game cannot be resumed, it is either over or already in progress.`);
			return;
		}
		if (!this.isPaused) {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game is already running.`);
			return;
		}

		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} resumes.`);
		this.isPaused = false;
		this.lastUpdatedTime = Date.now();
		GameOrchestrator.getInstance().add(this);
	}

	public end() {
		if (this.state === 'completed') {
			console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game is already ended.`);
			return;
		}
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} ended.`);
		this.state = 'completed';
		GameEmitter.getInstance().invalidateCache(this.roomId);
		GameOrchestrator.getInstance().remove(this);
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

