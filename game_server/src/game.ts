import { InputProvider } from "./inputProviders";
import { GameMode } from "./server";
import { Player } from "./matchManager";
import { GameEmitter } from "./gameEmitter";
import { ScoringManager } from "./scoringManager";
import { GameOrchestrator } from "./orchestrator";
import { Ball, DEFAULT_GAME_ENTITY_CONFIG, GameEntityFactory, Ground, Paddle } from "./gameEntity";

export type Side = 'leftPlayer' | 'rightPlayer';

export interface GameConstants {
	groundWidth: number;
	groundHeight: number;
	ballRadius: number;
	paddleWidth: number;
	paddleHeight: number;
}

export interface GameState {
	matchOver: boolean;
	setOver: boolean;
	isPaused: boolean;
	matchWinner?: Side;
	matchDisconnection: boolean;
	roundNumber?: number;
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
	public matchDisconnection: boolean = false;
	public lastUpdatedTime: number | undefined = undefined;

	//  Meta
	public roomId: string;
	public gameMode: GameMode | undefined = undefined;
	public lastPaddleUpdate: PaddleState | undefined = undefined;

	public leftInput: InputProvider | undefined;
	public rightInput: InputProvider | undefined;
	
	public state: 'waiting' | 'in-progress' | 'paused' | 'completed' = 'waiting';
	public reMatch: boolean = false; //todo: this is a temporary solution to handle rematch requests. It should be handled in MatchManager.

	public players: [Player, Player];
	public tournament?: { code: string, roundNo: number, finalMatch: boolean }
	public readyTimeout: NodeJS.Timeout | null = null;

	constructor(roomId: string, player1: Player, player2: Player) {
		const config = DEFAULT_GAME_ENTITY_CONFIG;
		this.players = [player1, player2];
		this.ball = GameEntityFactory.getInstance().createDefaultBall(config);
		this.leftPaddle = GameEntityFactory.getInstance().createDefaultLeftPaddle(config);
		this.rightPaddle = GameEntityFactory.getInstance().createDefaultRightPaddle(config);
		this.ground = GameEntityFactory.getInstance().createDefaultGround(config);
		this.roomId = roomId;
	}

	public resetBall(lastScorer: "leftPlayer" | "rightPlayer") {
		this.lastUpdatedTime = undefined;
		this.ball.firstPedalHit = 0;
		this.ball.speedIncreaseFactor = 1.7;
		this.ball.minimumSpeed = this.ball.firstSpeedFactor;
		this.ball.velocity = { x: 0, y: 0 };
		this.ball.position = { x: 0, y: Math.random() * (0.8 * this.ground.height) - 0.4 * this.ground.height };

		setTimeout(() => {
			/* here some math of odtü */
			const angle = lastScorer == 'leftPlayer' ? (Math.random() * 2 - 1) * Math.PI / 6 : Math.PI - (Math.random() * 2 - 1) * Math.PI / 6;

			this.ball.velocity = { x: Math.cos(angle) * this.ball.firstSpeedFactor, y: Math.sin(angle) * this.ball.firstSpeedFactor };
			this.lastUpdatedTime = Date.now();
		}, 1000);
	}

	public scorePoint(winner: Side) {
		if (this.matchOver || this.isPaused) return;

		this.scoringManager.onScore(winner); 

		if (this.scoringManager.continueNewRound()) {
			this.resetBall(winner);
		} else {
			this.matchOver = true;
			this.matchWinner = this.scoringManager.getMatchWinner()!;
		}

		GameEmitter.getInstance().emitBallState(this);
		GameEmitter.getInstance().emitSetState(this);
		GameEmitter.getInstance().emitGameState(this);
	}

	public finishIncompleteMatch(username?: string) {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} finishes incomplete match.`);
		this.state = 'completed';
		let inCompleteWinner: Side | undefined = undefined;
		if (username)
			inCompleteWinner = (username === this.leftInput!.getUsername() ? 'leftPlayer' : 'rightPlayer') as Side;
		this.matchOver = true;
		this.matchWinner = inCompleteWinner;
		this.matchDisconnection = true;
		GameEmitter.getInstance().emitGameState(this);
	}

	public pauseGameLoop() {
		if (!this.matchOver)
			this.isPaused = true;
		this.lastUpdatedTime = undefined;
		GameOrchestrator.getInstance().remove(this);
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game paused.`);
	}

	public resumeGameLoop() {
		this.isPaused = false;
		
		GameOrchestrator.getInstance().add(this);
		this.lastUpdatedTime = Date.now();
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game resume now.`);
	}

	public startGameLoop() {
		GameEmitter.getInstance().emitGameConstants(this);
		GameEmitter.getInstance().emitSetState(this);

		this.matchOver = false;
		this.scoringManager.isSetOver();
		this.scoringManager.setSetOver(false); //todo not sure if needed
		this.isPaused = false;

		GameEmitter.getInstance().emitGameState(this);		

		const sides = [
			{ socket: typeof this.leftInput!.getSocket === 'function' ? this.leftInput!.getSocket()! : null },
			{ socket: typeof this.rightInput!.getSocket === 'function' ? this.rightInput!.getSocket()! : null }
		];

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

		if (!this.isPaused) {
			const initialPlayer = Math.random() < 0.5 ? 'leftPlayer' : 'rightPlayer';
			this.resetBall(initialPlayer);
		}

		GameOrchestrator.getInstance().add(this);
	}

	//--

	start() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} started.`);
		this.state = 'in-progress';
		this!.startGameLoop();
	}

	pause() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} paused.`);
		this.state = 'paused';
		this!.pauseGameLoop();
	}

	resume() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} resumes.`);
		this.state = 'in-progress';
		this!.resumeGameLoop();
	}

	end() {
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

	public getPaddle2() {
		return this.rightPaddle;
	}

}

