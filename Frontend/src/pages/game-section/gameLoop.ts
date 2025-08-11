import {BabylonJsWrapper} from "./3d";
import {updateScoreBoard} from "./ui";
import {gameInstance} from "../play";
import {GameEventBus} from "./gameEventBus";

export class GameLoop {
	private static instance: GameLoop;
	private gameLoopRunning: boolean = false;
	private lastUpdateTime: number = 0;

	private constructor() { }

	public static getInstance(): GameLoop {
		if (!GameLoop.instance) {
			GameLoop.instance = new GameLoop();
		}
		return GameLoop.instance;
	}

	private updateBallPosition(): void {
		const Vector3 = BabylonJsWrapper.getInstance().Vector3;

		if (!gameInstance.gameInfo!.ballPosition) {
			return
		}

		const curX = gameInstance.gameInfo!.ballPosition.x;
		const curY = gameInstance.gameInfo!.ballPosition.y;
		const dt = ((Date.now() - this.lastUpdateTime) * 60) / 1000;

		let x = curX + gameInstance.gameInfo!.ballVelocity.x * dt;
		let y = curY + gameInstance.gameInfo!.ballVelocity.y * dt;
		if (x < -gameInstance.gameInfo!.constants!.groundWidth / 2 + gameInstance.gameInfo!.constants!.ballRadius || x > gameInstance.gameInfo!.constants!.groundWidth / 2 - gameInstance.gameInfo!.constants!.ballRadius) {
			x = curX;
			y = curY;
		}

		gameInstance.gameInfo!.ballPosition.x = x;
		gameInstance.gameInfo!.ballPosition.y = y;

		gameInstance.uiManager.ball!.ball.position = new Vector3(x, y, -gameInstance.gameInfo!.constants?.ballRadius!);

		this.lastUpdateTime = Date.now();
	}

	private updatePaddlePositions(): void {
		gameInstance.uiManager.paddle1!.position.y = gameInstance.gameInfo!.paddle?.p1y!;
		gameInstance.uiManager.paddle2!.position.y = gameInstance.gameInfo!.paddle?.p2y!;
	}

	private handleGameTick = (): void => {
		const gameInfo = gameInstance.gameInfo!;

		if (gameInfo.state?.setOver) {
			console.log("Set is over, loop stop.");
			this.stop();
			GameEventBus.getInstance().emit({ type: 'SET_COMPLETED', payload: gameInfo.gameEndInfo?.matchWinner });
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
