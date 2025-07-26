import { Server } from "socket.io";
import { InputProvider } from "./inputProviders";
import { GameMode } from "./server";
import { Match } from "./matchManager";
import { PhysicsEngine } from "./engine";
import { GameEmitter } from "./gameEmitter";

const FPS = 60; 
type Side = 'leftPlayer' | 'rightPlayer';

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
	public setOver = true;
	public isPaused = true;
	public matchWinner: Side | undefined = undefined;
	public matchDisconnection: boolean = false;
	public lastUpdatedTime: number | undefined = undefined;

	// Score
	public points: { leftPlayer: number; rightPlayer: number };
	public sets: { leftPlayer: number; rightPlayer: number };

	//  Meta
	public io: Server;
	public roomId: string;
	public gameMode: GameMode;
	public match: Match;
	public interval!: NodeJS.Timeout | undefined;
	public lastPaddleUpdate: PaddleState | undefined = undefined;

	constructor(public leftInput: InputProvider, public rightInput: InputProvider, io: Server, roomId: string, gameMode: GameMode, match: Match) {
		this.gameMode = gameMode;
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

		this.points = { leftPlayer: 0, rightPlayer: 0 };
		this.sets = { leftPlayer: 0, rightPlayer: 0 };

		this.io = io;
		this.roomId = roomId;
		this.match = match;
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

	public resetScores() {
		this.points.leftPlayer = 0;
		this.points.rightPlayer = 0;
	}

	public startNextSet() {
		this.lastUpdatedTime = undefined;
		this.setOver = true;

		GameEmitter.getInstance().emitBallState(this);
		GameEmitter.getInstance().emitSetState(this);
		GameEmitter.getInstance().emitGameState(this);

		setTimeout(() => {
			this.resetScores();
			this.setOver = false;
			GameEmitter.getInstance().emitGameState(this);
			GameEmitter.getInstance().emitSetState(this);
			this.lastUpdatedTime = Date.now();
		}, 3000);
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

	public isSetOver(): boolean {
		const p1 = this.points.leftPlayer;
		const p2 = this.points.rightPlayer;
		return (p1 >= 3 || p2 >= 3) && Math.abs(p1 - p2) >= 2;
	}

	public scorePoint(winner: Side) {
		if (this.matchOver || this.isPaused) return;

		this.points[winner]++;

		if (!this.isSetOver()) {
			this.resetBall(winner);
			return;
		}

		if (this.points.leftPlayer > this.points.rightPlayer) {
			this.sets.leftPlayer++;
		} else {
			this.sets.rightPlayer++;
		}

		const shouldMatchEnded = (this.sets.leftPlayer === 3 || this.sets.rightPlayer === 3);
		if (!shouldMatchEnded){
			this.startNextSet();
			this.resetBall(winner);
			return;
		}
		
		this.resetBall(winner);
		this.matchOver = true;
		this.matchWinner = winner;
		GameEmitter.getInstance().emitBallState(this);
		GameEmitter.getInstance().emitGameState(this);
	}

	public pauseGameLoop() {
		if (!this.matchOver)
			this.isPaused = true;
		this.lastUpdatedTime = undefined;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game paused.`);
	}

	public resumeGameLoop() {
		this.isPaused = false;
		if (!this.interval) {
			this.interval = setInterval(() => PhysicsEngine.getInstance().update(this), 1000 / 120);
		}

		this.lastUpdatedTime = Date.now();
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} game resume now.`);
	}

	public finishIncompleteMatch(username?: string) {
		let inCompleteWinner: Side | undefined = undefined;
		if (username)
			inCompleteWinner = (username === this.leftInput.getUsername() ? 'leftPlayer' : 'rightPlayer') as Side;
		this.matchOver = true;
		this.matchWinner = inCompleteWinner;
		this.matchDisconnection = true;
		GameEmitter.getInstance().emitGameState(this);
	}

	public startGameLoop() {
		GameEmitter.getInstance().emitGameConstants(this);
		GameEmitter.getInstance().emitSetState(this);

		this.matchOver = false;
		this.setOver = false;
		this.isPaused = false;

		GameEmitter.getInstance().emitGameState(this);		

		const sides = [
			{ socket: typeof this.leftInput.getSocket === 'function' ? this.leftInput.getSocket()! : null },
			{ socket: typeof this.rightInput.getSocket === 'function' ? this.rightInput.getSocket()! : null }
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

		this.interval = setInterval(() => PhysicsEngine.getInstance().update(this), 1000 / FPS); // 60 FPS
	}
}

