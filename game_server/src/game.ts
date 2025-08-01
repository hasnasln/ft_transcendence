import { InputProvider } from "./inputProviders";
import {MatchManager, Player} from "./matchManager";
import { GameEmitter } from "./gameEmitter";
import { ScoringManager } from "./scoringManager";
import { GameOrchestrator } from "./orchestrator";
import { Ball, DEFAULT_GAME_ENTITY_CONFIG, GameEntityFactory, Ground, Paddle } from "./gameEntity";
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
	public ball: Ball;
	public leftPaddle: Paddle;
	public rightPaddle: Paddle;
	public ground: Ground;

	// Game Status
	public matchOver = true;
	public scoringManager: ScoringManager = new ScoringManager(this);

	public isPaused = true;
	public matchWinner: Side | undefined = undefined; //todo encapsulate this to scoring manager
	public aPlayerDisconnected: boolean = false;
	public lastUpdatedTime: number | undefined = undefined;

	//  Meta
	public roomId: string;
	public gameMode: GameMode;

	public leftInput: InputProvider | undefined;
	public rightInput: InputProvider | undefined;
	
	public state: GamePhase = 'waiting';

	public players: Player[];
	public tournament?: { code: string, roundNo: number, finalMatch: boolean }

	constructor(roomId: string, players: Player[], gameMode: GameMode) {
		if (players.length === 0) {
			throw new Error("Game constructor: players must be specified.");
		}
		const config = DEFAULT_GAME_ENTITY_CONFIG;
		this.players = players;
		this.ball = GameEntityFactory.getInstance().createDefaultBall(config);
		this.leftPaddle = GameEntityFactory.getInstance().createDefaultLeftPaddle(config);
		this.rightPaddle = GameEntityFactory.getInstance().createDefaultRightPaddle(config);
		this.ground = GameEntityFactory.getInstance().createDefaultGround(config);
		this.roomId = roomId;
		this.gameMode = gameMode;
	}

	public resetBall(lastScorer: "leftPlayer" | "rightPlayer") {
		this.lastUpdatedTime = undefined;
		this.ball.reset();

		setTimeout(() => {
			this.ball.shove(lastScorer);
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
			//todo extract here to a method
			this.matchOver = true;
			this.stopGameLoop();
			this.end();

			if (this.gameMode === 'tournament') {
				const winnerInput = this.matchWinner === 'leftPlayer' ? this.leftInput : this.rightInput;
				const uuid = winnerInput!.getUuid();
				const username = winnerInput!.getUsername();
				try {
					pushWinnerToTournament(this.tournament?.code as string, this.tournament?.roundNo as number, { uuid, username });
				} catch (err: any) {
					emitError(err.message, this.roomId);
				}
			}

			this.matchWinner = this.scoringManager.getMatchWinner()!;

			GameEmitter.getInstance().emitGameState(this);
			GameEmitter.getInstance().emitGameFinish(this);

			if (this.gameMode === 'localGame' || this.gameMode === 'vsAI')
				MatchManager.getInstance().clearGame(this);
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
		this.matchWinner = inCompleteWinner;
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
	}

	public getBall() {
		return this.ball;
	}

	public getGround() {
		return this.ground;
	}

	public getPaddleSpeed() {
		return DEFAULT_GAME_ENTITY_CONFIG.paddleSpeed * GameEntityFactory.UCF;
	}

	public getRightPaddle() {
		return this.rightPaddle;
	}

	public getLeftPaddle() {
		return this.leftPaddle;
	}
}

export { Ball };

