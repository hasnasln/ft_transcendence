import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
import { GameInfo } from "./network";
import { WebSocketClient } from "./wsclient";

export class GameInputHandler {
	private direction: "up" | "down" | "stop" = "stop";
	private side: "left" | "right" = "left";
	private mode: "local" | "remote" | "unset" = "unset";

	private static instance: GameInputHandler;

	public static getInstance(): GameInputHandler {
		if (!GameInputHandler.instance) {
			GameInputHandler.instance = new GameInputHandler();
		}
		return GameInputHandler.instance;
	}

	public setMode(mode: "local" | "remote"): void {
		this.mode = mode;
	}

	public getDirectionSign(): 1 | -1 | 0 {
		switch (this.direction) {
			case "up":
				return 1;
			case "down":
				return -1;
			default:
				return 0;
		}
	}

	public keyToDirectionAndSide(key: string): { direction: "up" | "down" | "stop", side: "left" | "right" } | null {
		if (key == null)
			return null;
		switch (key.toLowerCase()) {
			case 'w':
				return { direction: "up", side: "left" };
			case 'arrowup':
				return { direction: "up", side: "right" };
			case 's':
				return { direction: "down", side: "left" };
			case 'arrowdown':
				return { direction: "down", side: "right" };
			default:
				return null;
		}
	}

	private sendStateUpdate(): void {
		if (this.mode == "local") {
			WebSocketClient.getInstance().emit("local-input", { direction: this.direction, player_side: this.side });
		} else if (this.mode == "remote") {
			WebSocketClient.getInstance().emit("player-move", { direction: this.direction });
		} else {
			throw new Error("KeyboardInputHandler mode is not set. Please set it to 'local' or 'remote'.");
		}
	}
		
	/** returns 'should event cancelled' */
	public keyDown(key: string): boolean {
		const event = this.keyToDirectionAndSide(key);
		if (!event) return false;

		const { direction, side } = event;
		if (this.direction === direction && (this.side === side || this.mode === "remote"))
			return true;

		this.direction = direction;
		this.side = side;
		this.sendStateUpdate();
		return true;
	}

	/** returns 'should event cancelled' */
	public keyUp(key: string): boolean {
		const event = this.keyToDirectionAndSide(key);
		if (!event) return false;

		const { direction, side } = event;
		if (this.direction !== direction && (this.side === side || this.mode === "remote")) // old direction is not the same as current, it means there is override.
			return true;

		this.direction = "stop";
		this.sendStateUpdate();
		return true;
	}

	public reset(): void {
		this.direction = "stop";
		this.side = "left";
		this.mode = "unset";
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.removeEventListener("keydown", onSpaceKeyDown);
	}

	public listen() {
		this.reset();
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("keydown", onSpaceKeyDown);
	}
}

function onKeyDown(event: KeyboardEvent) {
	if (GameInputHandler.getInstance().keyDown(event.key)) {
		event.preventDefault();
	}
}

function onKeyUp(event: KeyboardEvent) {
	if (GameInputHandler.getInstance().keyUp(event.key)) {
		event.preventDefault();
	}
}

function onSpaceKeyDown(event: KeyboardEvent) {
	const gameInfo = gameInstance.gameInfo;
	if (!gameInfo) return;
	if (gameInfo.mode !== 'vsAI' && gameInfo.mode !== 'localGame') return;
	if (event.code !== "Space") return;
	if (!gameInstance.uiManager.startButton!.classList.contains("hidden")) return; //hmm
	event.preventDefault();

	gameInfo.state!.isPaused = !gameInfo.state!.isPaused;
	console.log("Game paused status: ", gameInfo.state!.isPaused);
	if (gameInfo.state!.isPaused) {
		GameEventBus.getInstance().emit({ type: 'GAME_PAUSED', payload: gameInfo });
	} else {
		GameEventBus.getInstance().emit({ type: 'GAME_RESUMED', payload: gameInfo });
	}
}


function listenTouchButtons() {
	let up_buttons = document.getElementById("up_touch_buttons");
	let down_buttons = document.getElementById("down_touch_buttons");

	up_buttons?.addEventListener("touchstart", (event) => {
		GameInputHandler.getInstance().keyDown("w");
	});

	up_buttons?.addEventListener("touchend", (event) => {
		GameInputHandler.getInstance().keyUp("w");
	});

	down_buttons?.addEventListener("touchstart", (event) => {
		GameInputHandler.getInstance().keyDown("s");
	});

	down_buttons?.addEventListener("touchend", (event) => {
		GameInputHandler.getInstance().keyUp("s");
	});
}

export function listenPlayerInputs(gameInfo: GameInfo) {
	GameInputHandler.getInstance().listen();
	listenTouchButtons();
	if (gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI' || gameInfo.mode === 'tournament') {
		GameInputHandler.getInstance().setMode("remote");
	} else if (gameInfo.mode === 'localGame') {
		GameInputHandler.getInstance().setMode("local");
	} else {
		throw new Error("Game mode is not set or invalid. Please set it to 'localGame', 'remoteGame', 'vsAI' or 'tournament': " + gameInfo.mode);
	}
}
