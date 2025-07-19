import { Engine }   from "@babylonjs/core/Engines/engine";
import { Scene }    from "@babylonjs/core/scene";
import { Vector3 }  from "@babylonjs/core/Maths/math.vector";
import { updateScoreBoard, updateSetBoard } from "./ui";
import { GameInfo } from "./network";
import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";

function updateBallPosition(): void {
	gameInstance.uiManager.ball!.ball.position = new Vector3(
		gameInstance.gameInfo!.ballPosition?.x,
		gameInstance.gameInfo!.ballPosition?.y,
		-gameInstance.gameInfo!.constants?.ballRadius!);
}

function updatePaddlePositions(): void {
	gameInstance.uiManager.paddle1!.position.y = gameInstance.gameInfo!.paddle?.p1y!;
	gameInstance.uiManager.paddle2!.position.y = gameInstance.gameInfo!.paddle?.p2y!;
}

const handleGameTick = (engine: Engine, scene: Scene, gameInfo: GameInfo) => {
	if (gameInfo.state?.matchOver) {
		GameEventBus.getInstance().emit({ type: 'MATCH_ENDED', payload: gameInfo.state?.matchWinner });
		engine.stopRenderLoop();
		return;
	}
	
	if (gameInfo.state?.setOver) {
		GameEventBus.getInstance().emit({ type: 'SET_COMPLETED', payload: gameInfo.state?.matchWinner });
		engine.stopRenderLoop();
		return;
	}

	if (gameInfo.state?.isPaused) {
		engine.stopRenderLoop();
		return;
	}

	updateBallPosition();
	updatePaddlePositions();

	updateScoreBoard();
	updateSetBoard();
	scene.render();
}

export function startGameLoop(): void {
    gameInstance.uiManager.engine!.runRenderLoop(() => handleGameTick(gameInstance.uiManager.engine!, gameInstance.uiManager.scene!, gameInstance.gameInfo!));
}
  

