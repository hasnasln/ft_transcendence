import { ConnectionHandler } from "./connection";
import {GameConstants, GameState, PaddleState, Game, GameEndInfo} from "./game";
import { GameEntityFactory } from "./gameEntity";

export class GameEmitter {
	private static _instance: GameEmitter;
	private readonly ucf: number = GameEntityFactory.UCF;

	private constructor() {}

	public static getInstance(): GameEmitter {
		if (!GameEmitter._instance) {
			GameEmitter._instance = new GameEmitter();
		}
		return GameEmitter._instance;
	}

	public emitGameConstants(game: Game): void {
		const gameConstants: GameConstants = {
			groundWidth: game.ground.width / this.ucf,
			groundHeight: game.ground.height / this.ucf,
			ballRadius: game.ball.radius / this.ucf,
			paddleWidth: game.leftPaddle.width / this.ucf,
			paddleHeight: game.leftPaddle.height / this.ucf,
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

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("gameState", gameState);
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

	public emitBallState(game: Game): void {
		const x = game.ball.position.x / this.ucf;
		const y = game.ball.position.y / this.ucf;

		if (isNaN(x) || isNaN(y)) {
			console.error(`Invalid ball coordinates: x=${x}, y=${y}`);
			return;
		}

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("bu", `${x.toFixed(2)}:${y.toFixed(2)}`);
	}

	public emitPaddleState(game: Game): void {
		const paddleState: PaddleState = {
			p1y: game.leftPaddle.position.y / this.ucf,
			p2y: game.rightPaddle.position.y / this.ucf,
		};

		if (game.lastPaddleUpdate &&
			game.lastPaddleUpdate.p1y === paddleState.p1y &&
			game.lastPaddleUpdate.p2y === paddleState.p2y
		) {
			return;
		}

		game.lastPaddleUpdate = paddleState;
		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("paddleUpdate", paddleState);
	}

	public emitGameFinish(game: Game): void {
		const gameEndInfo: GameEndInfo = {
			matchWinner: game.matchWinner,
			endReason: game.aPlayerDisconnected ? 'disconnection' : 'normal',
		};

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("gameEndInfo", gameEndInfo);
	}
}
