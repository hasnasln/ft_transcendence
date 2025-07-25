import { GameConstants, GameState, PaddleState, Game } from "./game";

export class GameEmitter {
  private static _instance: GameEmitter;

  private constructor() {
  }

  public static getInstance(): GameEmitter {
    if (!GameEmitter._instance) {
      GameEmitter._instance = new GameEmitter();
    }
    return GameEmitter._instance;
  }

  public emitGameConstants(game: Game): void {
    const gameConstants: GameConstants = {
      groundWidth: game.ground.width / game.unitConversionFactor,
      groundHeight: game.ground.height / game.unitConversionFactor,
      ballRadius: game.ball.radius / game.unitConversionFactor,
      paddleWidth: game.paddle1.width / game.unitConversionFactor,
      paddleHeight: game.paddle1.height / game.unitConversionFactor,
    };

    game.io.to(game.roomId).emit("init", gameConstants);
  }

  public emitGameState(game: Game): void {
    const gameState: GameState = {
      matchOver: game.matchOver,
      setOver: game.setOver,
      isPaused: game.isPaused,
      matchWinner: game.matchWinner,
      matchDisconnection: game.matchDisconnection,
      roundNumber: game.match.tournament?.roundNo,
    };

    game.io.to(game.roomId).emit("gameState", gameState);
  }

  public emitSetState(game: Game): void {
    const setState = {
      points: game.points,
      sets: game.sets,
      usernames: {
        left: game.leftInput.getUsername(),
        right: game.rightInput.getUsername(),
      },
    };

    game.io.to(game.roomId).emit("updateState", setState);
  }

  public emitBallState(game: Game): void {
    const x = game.ball.position.x / game.unitConversionFactor;
    const y = game.ball.position.y / game.unitConversionFactor;

    if (isNaN(x) || isNaN(y)) {
      console.error(`Invalid ball coordinates: x=${x}, y=${y}`);
      return;
    }

    game.io.to(game.roomId).emit("bu", `${x.toFixed(2)}:${y.toFixed(2)}`);
  }

  public emitPaddleState(game: Game): void {
    const paddleState: PaddleState = {
      p1y: game.paddle1.position.y / game.unitConversionFactor,
      p2y: game.paddle2.position.y / game.unitConversionFactor,
    };

    if (
      game.lastPaddleUpdate &&
      game.lastPaddleUpdate.p1y === paddleState.p1y &&
      game.lastPaddleUpdate.p2y === paddleState.p2y
    ) {
      return;
    }

    game.lastPaddleUpdate = paddleState;
    game.io.to(game.roomId).emit("paddleUpdate", paddleState);
  }
}
