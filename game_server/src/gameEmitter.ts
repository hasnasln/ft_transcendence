import { ConnectionHandler } from "./connection";
import { GameConstants, GameState, PaddleState, Game } from "./game";
import { GameEntityFactory } from "./gameEntity";


export class GameEmitter {
	private static _instance: GameEmitter;

	private constructor() {}

	public static getInstance(): GameEmitter {
		if (!GameEmitter._instance) {
			GameEmitter._instance = new GameEmitter();
		}
		return GameEmitter._instance;
	}

	public emitGameConstants(game: Game): void {
		const gameConstants: GameConstants = {
			groundWidth: game.ground.width / GameEntityFactory.UCF,
			groundHeight: game.ground.height / GameEntityFactory.UCF,
			ballRadius: game.ball.radius / GameEntityFactory.UCF,
			paddleWidth: game.leftPaddle.width / GameEntityFactory.UCF,
			paddleHeight: game.leftPaddle.height / GameEntityFactory.UCF,
		};

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("init", gameConstants);
	}

	public emitGameState(game: Game): void {
		const gameState: GameState = {
			matchOver: game.matchOver,
			setOver: game.scoringManager.isSetOver(),
			isPaused: game.isPaused,
			matchWinner: game.matchWinner,
			matchDisconnection: game.matchDisconnection,
			roundNumber: game.tournament?.roundNo,
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
		const x = game.ball.position.x / GameEntityFactory.UCF;
		const y = game.ball.position.y / GameEntityFactory.UCF;

		if (isNaN(x) || isNaN(y)) {
			console.error(`Invalid ball coordinates: x=${x}, y=${y}`);
			return;
		}

		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("bu", `${x.toFixed(2)}:${y.toFixed(2)}`);
	}

	public emitPaddleState(game: Game): void {
		const paddleState: PaddleState = {
			p1y: game.leftPaddle.position.y / GameEntityFactory.UCF,
			p2y: game.rightPaddle.position.y / GameEntityFactory.UCF,
		};

		if (
			game.lastPaddleUpdate &&
			game.lastPaddleUpdate.p1y === paddleState.p1y &&
			game.lastPaddleUpdate.p2y === paddleState.p2y
		) {
			return;
		}

		game.lastPaddleUpdate = paddleState;
		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("paddleUpdate", paddleState);
	}
}
