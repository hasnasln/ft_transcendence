import { InputProvider } from "./inputProviders";
import { GameMode } from "./server";
import { Player } from "./matchManager";
import { GameEmitter } from "./gameEmitter";
import { ScoringManager } from "./scoringManager";
import { GameOrchestrator } from "./orchestrator";

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

export interface Ball {
	readonly firstSpeedFactor: number;
	readonly airResistanceFactor: number;
	readonly radius: number;
	minimumSpeed: number;
	maximumSpeed: number;
	speedIncreaseFactor: number;
	firstPedalHit: number;
	position: Position;
	velocity: Position;
}

export interface Paddle {
	readonly width: number;
	readonly height: number;
	position: Position;
}

export class Game {
	// Constants
	public UCF = 40; // Unit Conversion Factor
	public groundWidth = 20 * this.UCF;
	public paddleSpeed: number;

	// Entities
	public ball: Ball;
	public paddle1: Paddle;
	public paddle2: Paddle;
	public ground: { width: number; height: number };

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
		this.players = [player1, player2];
		this.ball = {
			firstSpeedFactor: 0.18 * this.UCF,
			airResistanceFactor: 0.998,
			minimumSpeed: 0.18 * this.UCF,
			maximumSpeed: 0.4 * this.UCF,
			radius: 0.25 * this.UCF,
			speedIncreaseFactor: 1.7,
			firstPedalHit: 0,
			position: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
		};

		this.ground = {
			width: this.groundWidth,
			height: this.groundWidth * (152.5) / 274,
		};

		const w = 0.2 * this.UCF;
		this.paddle1 = {
			width: w,
			height: this.ground.height * (0.3),
			position: {
				x: -this.groundWidth / 2 + w,
				y: 0
			}
		};

		this.paddle2 = {
			width: 0.2 * this.UCF,
			height: this.ground.height * (0.3),
			position: {
				x: this.groundWidth / 2 - this.paddle1.width,
				y: 0
			}
		};

		this.paddleSpeed = 0.2 * this.UCF;

		this.roomId = roomId;
	}

	public getBall() {
		return this.ball;
	}

	public getGround() {
		return this.ground;
	}

	public getPaddleSpeed() {
		return this.paddleSpeed;
	}

	public getPaddle2() {
		return this.paddle2;
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
}

