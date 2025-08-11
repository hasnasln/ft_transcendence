import { ConnectionHandler } from "./connection";
import {GameConstants, GameState, PaddleState, Game, GameEndInfo} from "./game";
import { GameEntityFactory } from "./gameEntity";

interface GameEmitCache {
	cache: Map<string, any>;
}

export class GameEmitter {
	private static _instance: GameEmitter;
	private readonly ucf: number = GameEntityFactory.UCF;
	private readonly caches: Map<string, GameEmitCache> = new Map();

	private constructor() {}

	public static getInstance(): GameEmitter {
		if (!GameEmitter._instance) {
			GameEmitter._instance = new GameEmitter();
		}
		return GameEmitter._instance;
	}

	private emitWithCache(event: string, data: any, roomId: string): void {
		let cache = this.caches.get(roomId);
		if (!cache) {
			cache = { cache: new Map() };
			this.caches.set(roomId, cache);
		}
		const cachedData = cache.cache.get(event);
		if (cachedData && JSON.stringify(cachedData) === JSON.stringify(data)) {
			return;
		}
		cache.cache.set(event, data);
		ConnectionHandler.getInstance().getServer().to(roomId).emit(event, data);
	}

	public emitGameConstants(game: Game): void {
		const gameConstants: GameConstants = {
			groundWidth: game.environment.ground.width / this.ucf,
			groundHeight: game.environment.ground.height / this.ucf,
			ballRadius: game.environment.ball.radius / this.ucf,
			paddleWidth: game.environment.leftPaddle.width / this.ucf,
			paddleHeight: game.environment.leftPaddle.height / this.ucf,
		};

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("init", gameConstants);
	}

	public emitGameState(game: Game): void {
		const gameState: GameState = {
			setOver: game.scoringManager.isSetOver(),
			isPaused: game.isPaused,
			roundNumber: game.tournament?.roundNo,
			phase: game.state
		};

		this.emitWithCache("gameState", gameState, game.roomId);
	}

	public emitSetState(game: Game): void {
		const setState = {
			points: game.scoringManager.getScores(),
			sets: game.scoringManager.getSets(),
			usernames: {
				left: game.leftInput!.getUsername(),
				right: game.rightInput!.getUsername(),
			},
		};

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("updateState", setState);
	}

	public emitBallState(game: Game, force=false): void {
		const x = game.environment.ball.position.x / this.ucf;
		const y = game.environment.ball.position.y / this.ucf;

		if (isNaN(x) || isNaN(y)) {
			console.error(`Invalid ball coordinates: x=${x}, y=${y}`);
			return;
		}

		if (force || Date.now() - game.lastNotifiedBallPositionTime > 1000) {
			this.emitWithCache("bu", `${x.toFixed(2)}:${y.toFixed(2)}`, game.roomId);
			game.lastNotifiedBallPositionTime = Date.now();
		}
		this.emitBallVelocity(game);
	}

	public emitBallVelocity(game: Game): void {
		const vx = game.environment.ball.velocity.x / this.ucf;
		const vy = game.environment.ball.velocity.y / this.ucf;

		if (isNaN(vx) || isNaN(vy)) {
			console.error(`Invalid ball coordinates: vx=${vx}, vy=${vy}`);
			return;
		}

		this.emitWithCache("bv", `${vx}:${vy}`, game.roomId);
	}

	public emitPaddleState(game: Game): void {
		const p1y= game.environment.leftPaddle.position.y / this.ucf;
		const p2y= game.environment.rightPaddle.position.y / this.ucf;

		if (isNaN(p1y) || isNaN(p2y)) {
			console.error(`Invalid ball coordinates: vx=${p1y}, vy=${p2y}`);
			return;
		}

		this.emitWithCache("pu", `${p1y.toFixed(2)}:${p2y.toFixed(2)}`, game.roomId);
	}

	public emitGameFinish(game: Game): void {
		const gameEndInfo: GameEndInfo = {
			matchWinner: game.winner,
			endReason: game.aPlayerDisconnected ? 'disconnection' : 'normal',
		};

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("gameEndInfo", gameEndInfo);
	}

	public invalidateCache(roomId: string) {
		this.caches.delete(roomId);
	}
}
