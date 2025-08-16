import {BabylonJsWrapper} from "./3d";
import {updateScoreBoard} from "./ui";
import {gameInstance} from "../play";
import {GameEventBus} from "./gameEventBus";
import {GameInputHandler} from "./keyboard";

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

	private updateEnvironment(): void {
		const Vector3 = BabylonJsWrapper.getInstance().Vector3;
		const dt = ((Date.now() - this.lastUpdateTime) * 60) / 1000;

		{
			if (!gameInstance.gameInfo!.ballPosition) {
				return
			}

			const curX = gameInstance.gameInfo!.ballPosition.x;
			const curY = gameInstance.gameInfo!.ballPosition.y;

			let x = curX + gameInstance.gameInfo!.ballVelocity.x * dt;
			let y = curY + gameInstance.gameInfo!.ballVelocity.y * dt;
			const allowedHorizontalRange = gameInstance.gameInfo!.constants!.groundWidth / 2 - gameInstance.gameInfo!.constants!.ballRadius;
			if (x < -allowedHorizontalRange || x > allowedHorizontalRange) {
				x = curX; /* client-side prediction */
			}

			const allowedVerticalRange = gameInstance.gameInfo!.constants!.groundHeight / 2 - gameInstance.gameInfo!.constants!.ballRadius;
			if (y < -allowedVerticalRange || y > allowedVerticalRange) {
				y = curY; /* client-side prediction */
			}

			gameInstance.gameInfo!.ballPosition.x = x;
			gameInstance.gameInfo!.ballPosition.y = y;

			gameInstance.uiManager.ball!.ball.position = new Vector3(x, y, -gameInstance.gameInfo!.constants?.ballRadius!);
		}

		{
			const localPaddles = [gameInstance.uiManager.paddle1];
			localPaddles.forEach(paddle => {
				const unit = GameInputHandler.getInstance().getDirectionSign() * gameInstance.gameInfo!.constants!.paddleSpeed;
				const prevPadPos: number = gameInstance.gameInfo!.paddle!.p1y;
				const nextPadPos: number = prevPadPos + unit * dt;
				const allowedRange = gameInstance.gameInfo!.constants!.groundHeight / 2 - gameInstance.gameInfo!.constants!.paddleHeight / 2;
				if (nextPadPos < allowedRange && nextPadPos > -allowedRange) {
					paddle.position.y = nextPadPos; /* client-side prediction */
					//console.log("eva: ", nextPadPos);
				}
				gameInstance.gameInfo!.paddle!.p1y = nextPadPos;
			})

			const remotePaddles = [gameInstance.uiManager.paddle2];
			remotePaddles.forEach(paddle => {
				paddle.position.y = gameInstance.gameInfo!.paddle?.p2y!;
			})
		}

		this.lastUpdateTime = Date.now();
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

		this.updateEnvironment();

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
