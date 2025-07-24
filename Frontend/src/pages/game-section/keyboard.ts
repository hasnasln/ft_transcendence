import { Router } from "../../router";
import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
import { GameInfo } from "./network";
import { WebSocketClient } from "./wsclient";

export class KeyboardInputHandler {
	private direction: "up" | "down" | "stop" = "stop";
	private side: "left" | "right" = "left";
	private mode: "local" | "remote" | "unset" = "unset";

	private static instance: KeyboardInputHandler;

	public static getInstance(): KeyboardInputHandler {
		if (!KeyboardInputHandler.instance) {
			KeyboardInputHandler.instance = new KeyboardInputHandler();
		}
		return KeyboardInputHandler.instance;
	}

	public setMode(mode: "local" | "remote"): void {
		this.mode = mode;
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
		
	/** returns should event cancelled */
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

	/** returns should event cancelled */
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

	public listen() {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	}
}

function onKeyDown(event: KeyboardEvent) {
	if (KeyboardInputHandler.getInstance().keyDown(event.key)) {
		event.preventDefault();
	}
}

function onKeyUp(event: KeyboardEvent) {
	if (KeyboardInputHandler.getInstance().keyUp(event.key)) {
		event.preventDefault();
	}
}

function listenPauseInputs(gameInfo: GameInfo) {
	const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
	document.addEventListener("keydown", (event) => {
		if (event.code === "Space" && gameInstance.uiManager.startButton!.classList.contains("hidden")) {
			
			gameInfo.state!.isPaused = !gameInfo.state!.isPaused;
			console.log("Game paused status: ", gameInfo.state!.isPaused);
			if (gameInfo.state!.isPaused) {
				GameEventBus.getInstance().emit({ type: 'GAME_PAUSED', payload: gameInfo });
				WebSocketClient.getInstance().emit("pause-resume", { status: "pause" });
				resumeButton.classList.remove("hidden");
				gameInstance.uiManager.newmatchButton!.classList.remove("hidden");
				gameInstance.uiManager.turnToHomePage!.classList.remove("hidden");
			} else {
				GameEventBus.getInstance().emit({ type: 'GAME_RESUMED', payload: gameInfo });
				WebSocketClient.getInstance().emit("pause-resume", { status: "resume" });
				resumeButton.classList.add("hidden");
				gameInstance.uiManager.newmatchButton!.classList.add("hidden");
				gameInstance.uiManager.turnToHomePage!.classList.add("hidden");
			}
		}
	});

	resumeButton?.addEventListener("click", () => {
		GameEventBus.getInstance().emit({ type: 'GAME_RESUMED', payload: gameInfo });
		gameInfo.state!.isPaused = false;
		WebSocketClient.getInstance().emit("pause-resume", { status: "resume" });
		resumeButton.classList.add("hidden");
		gameInstance.uiManager.newmatchButton!.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage!.classList.add("hidden");
	});
}

export function listenPlayerInputs(gameInfo: GameInfo) {
	if (gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI' || gameInfo.mode === 'tournament') {
		KeyboardInputHandler.getInstance().setMode("remote");
	} else if (gameInfo.mode === 'localGame') {
		KeyboardInputHandler.getInstance().setMode("local");
	}
	KeyboardInputHandler.getInstance().listen();

	const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
	if (gameInfo.mode !== 'remoteGame' && gameInfo.mode !== 'tournament') {
		listenPauseInputs(gameInfo);
	}

	gameInstance.uiManager.newmatchButton!.addEventListener("click", () => {
		console.log(`yeni maça başlaya tıklandı, içerik : ${gameInstance.uiManager.newmatchButton!.innerText}`);
		resumeButton.classList.add("hidden");
		gameInstance.uiManager.newmatchButton?.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage?.classList.add("hidden");
		gameInstance.uiManager.startButton?.classList.add("hidden");

		if (!gameInfo.state?.matchOver)
			WebSocketClient.getInstance().emit("reset-match");
		window.location.reload(); //todo bundan kaçın
	});

	gameInstance.uiManager.turnToHomePage!.addEventListener("click", () => {
		resumeButton.classList.add("hidden");
		gameInstance.uiManager.newmatchButton?.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage?.classList.add("hidden");
		gameInstance.uiManager.startButton?.classList.add("hidden");

		if (!gameInfo.state?.matchOver)
			WebSocketClient.getInstance().emit("reset-match");

		const toPage = gameInfo.mode === 'tournament' ? '/tournament' : '/';
		Router.getInstance().go(toPage);
		Router.getInstance().invalidatePage('/game');
	});
}

