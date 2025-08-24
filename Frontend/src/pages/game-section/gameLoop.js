import { BabylonJsWrapper } from "./3d";
import { updateScoreBoard } from "./ui";
import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
export class GameLoop {
    static instance;
    gameLoopRunning = false;
    lastUpdateTime = 0;
    constructor() { }
    static getInstance() {
        if (!GameLoop.instance) {
            GameLoop.instance = new GameLoop();
        }
        return GameLoop.instance;
    }
    updateEnvironment() {
        const Vector3 = BabylonJsWrapper.getInstance().Vector3;
        const dt = ((Date.now() - this.lastUpdateTime) * 60) / 1000;
        {
            if (!gameInstance.gameInfo.ballPosition) {
                return;
            }
            const curX = gameInstance.gameInfo.ballPosition.x;
            const curY = gameInstance.gameInfo.ballPosition.y;
            let x = curX + gameInstance.gameInfo.ballVelocity.x * dt;
            let y = curY + gameInstance.gameInfo.ballVelocity.y * dt;
            const allowedHorizontalRange = gameInstance.gameInfo.constants.groundWidth / 2 - gameInstance.gameInfo.constants.ballRadius;
            if (x < -allowedHorizontalRange || x > allowedHorizontalRange) {
                x = curX;
            }
            const allowedVerticalRange = gameInstance.gameInfo.constants.groundHeight / 2 - gameInstance.gameInfo.constants.ballRadius;
            if (y < -allowedVerticalRange || y > allowedVerticalRange) {
                y = curY;
            }
            gameInstance.gameInfo.ballPosition.x = x;
            gameInstance.gameInfo.ballPosition.y = y;
            gameInstance.uiManager.ball.ball.position = new Vector3(x, y, -gameInstance.gameInfo.constants?.ballRadius);
        }
        gameInstance.uiManager.paddle1.position.y = gameInstance.gameInfo.paddle?.p1y;
        gameInstance.uiManager.paddle2.position.y = gameInstance.gameInfo.paddle?.p2y;
        this.lastUpdateTime = Date.now();
    }
    handleGameTick = () => {
        const gameInfo = gameInstance.gameInfo;
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
        gameInstance.uiManager.scene.render();
    };
    start() {
        if (this.gameLoopRunning) {
            console.warn("Game loop is already running, skipping start.");
            return;
        }
        this.gameLoopRunning = true;
        gameInstance.uiManager.engine.runRenderLoop(this.handleGameTick);
    }
    stop() {
        gameInstance.uiManager.engine?.stopRenderLoop();
        this.gameLoopRunning = false;
    }
}
