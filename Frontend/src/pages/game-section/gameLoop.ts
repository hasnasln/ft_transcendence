import {updateScoreBoard} from "./ui";
import {gameInstance} from "../play";
import {GameEventBus} from "./gameEventBus";
import {destroyTrailFor} from "./gameScene";

export class GameLoop {
	private static instance: GameLoop;
	private gameLoopRunning: boolean = false;
	public lastUpdateTime: number | undefined = 0;

	private constructor() { }

	public static getInstance(): GameLoop {
		if (!GameLoop.instance) {
			GameLoop.instance = new GameLoop();
		}
		return GameLoop.instance;
	}

	private updateEnvironment(): void {
		const gi = gameInstance.gameInfo!;
		const ui = gameInstance.uiManager;
		const dt = this.lastUpdateTime ? ( ((Date.now() - this.lastUpdateTime) * 60) / 1000) : 0;

		{
			if (!gi.ballPosition) {
				return;
			}

			const curX = gi.ballPosition.x;
			const curY = gi.ballPosition.y;

			let x = curX + gi.ballVelocity.x * dt;
			let y = curY + gi.ballVelocity.y * dt;

			const r = gi.constants!.ballRadius;
			const halfW = gi.constants!.groundWidth / 2 - r;
			if (x < -halfW || x > halfW) {
				x = curX;
			}

			const halfH = gi.constants!.groundHeight / 2 - r;
			if (y < -halfH || y > halfH) {
				y = curY;
			}

			if (Math.hypot(gi.ballPosition.x - x, gi.ballPosition.y - y) >= 5) {
				destroyTrailFor(100);
			}

			gi.ballPosition.x = x;
			gi.ballPosition.y = y;

			ui.ball!.ball.position.set(x, y, -r);
		}

		ui.paddle1.position.y = gi.paddle!.p1y!;
		ui.paddle2.position.y = gi.paddle!.p2y!;

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
