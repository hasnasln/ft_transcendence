import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { updateScoreBoard } from "./ui";
import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";

export class GameLoop {
	private static instance: GameLoop;
	private gameLoopRunning: boolean = false;

	private constructor() { }

	public static getInstance(): GameLoop {
		if (!GameLoop.instance) {
			GameLoop.instance = new GameLoop();
		}
		return GameLoop.instance;
	}

	private updateBallPosition(): void {
		const vector = new Vector3(
			gameInstance.gameInfo!.ballPosition?.x,
			gameInstance.gameInfo!.ballPosition?.y,
			-gameInstance.gameInfo!.constants?.ballRadius!
		);
		gameInstance.uiManager.ball!.ball.position = vector;
	}

	private updatePaddlePositions(): void {
		gameInstance.uiManager.paddle1!.position.y = gameInstance.gameInfo!.paddle?.p1y!;
		gameInstance.uiManager.paddle2!.position.y = gameInstance.gameInfo!.paddle?.p2y!;
	}

	private handleGameTick = (): void => {
		const gameInfo = gameInstance.gameInfo!;
		if (gameInfo.state?.matchOver) {
			console.log("Match is over, loop stop.");
			this.stop();
			GameEventBus.getInstance().emit({ type: 'MATCH_ENDED', payload: gameInfo.state?.matchWinner });
			return;
		}

		if (gameInfo.state?.setOver) {
			console.log("Set is over, loop stop.");
			this.stop();
			GameEventBus.getInstance().emit({ type: 'SET_COMPLETED', payload: gameInfo.state?.matchWinner });
			return;
		}

		if (gameInfo.state?.isPaused) {
			return;
		}

		this.updateBallPosition();
		this.updatePaddlePositions();

		updateScoreBoard();
		gameInstance.uiManager.scene!.render();
	};

	public start(): void {
		if (this.gameLoopRunning) {
			console.warn("Game loop is already running, skipping start.");
			return;
		}

		this.gameLoopRunning = true;
		gameInstance.uiManager.engine!.runRenderLoop(this.handleGameTick);
	}

	public stop(): void {
		gameInstance.uiManager.engine?.stopRenderLoop();
		this.gameLoopRunning = false;
	}
}

export const gameLoop = GameLoop.getInstance();