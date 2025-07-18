import { Router } from "../../router";
import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
import { GameInfo } from "./network";

function listenNonLocalInputs() {
	window.addEventListener("keydown", (event) => {
		let moved = false;

		if (event.key.toLowerCase() === 'w') {
			gameInstance.socket!.emit("player-move", { direction: "up" });
			moved = true;
		}
		else if (event.key.toLowerCase() === 's') {
			gameInstance.socket!.emit("player-move", { direction: "down" });
			moved = true;
		}

		if (moved)
			event.preventDefault();
		});

		window.addEventListener("keyup", (e) => {
		if (["w", "s"].includes(e.key.toLowerCase()))
			gameInstance.socket!.emit("player-move", { direction: "stop" });
		});
}

function listenLocalInputs() {
	window.addEventListener("keydown", (event) => {
	let moved = false;

	if (event.key.toLowerCase() === 'w') {
		gameInstance.socket!.emit("local-input", { player_side: "left", direction: "up" });
		moved = true;
	} else if (event.key.toLowerCase() === 's') {
		gameInstance.socket!.emit("local-input", { player_side: "left", direction: "down" });
		moved = true;
	}

	if (event.key === 'ArrowUp') {
		gameInstance.socket!.emit("local-input", { player_side: "right", direction: "up" });
		moved = true;
	} else if (event.key === 'ArrowDown') {
		gameInstance.socket!.emit("local-input", { player_side: "right", direction: "down" });
		moved = true;
	}

	if (moved)
		event.preventDefault();
	});

	window.addEventListener("keyup", (e) => {
	if (["w", "s"].includes(e.key.toLowerCase()))
		gameInstance.socket!.emit("local-input", { player_side: "left", direction: "stop" });

	if (["ArrowUp", "ArrowDown"].includes(e.key))
		gameInstance.socket!.emit("local-input", { player_side: "right", direction: "stop" });
	});
}

function listenPauseInputs(gameInfo: GameInfo) {
	const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
	document.addEventListener("keydown", (event) => {
		if (event.code === "Space" && gameInstance.uiManager.startButton!.classList.contains("hidden")) {
			
			gameInfo.state!.isPaused = !gameInfo.state!.isPaused;
			if (gameInfo.state!.isPaused) {
				GameEventBus.getInstance().emit({ type: 'GAME_PAUSED', payload: gameInfo });
				gameInstance.socket!.emit("pause-resume", { status: "pause" });
				resumeButton.classList.remove("hidden");
				gameInstance.uiManager.newmatchButton!.classList.remove("hidden");
				gameInstance.uiManager.turnToHomePage!.classList.remove("hidden");
			} else {
				GameEventBus.getInstance().emit({ type: 'GAME_RESUMED', payload: gameInfo });
				gameInstance.socket!.emit("pause-resume", { status: "resume" });
				resumeButton.classList.add("hidden");
				gameInstance.uiManager.newmatchButton!.classList.add("hidden");
				gameInstance.uiManager.turnToHomePage!.classList.add("hidden");
			}
		}
	});

	resumeButton?.addEventListener("click", () => {
		gameInfo.state!.isPaused = false;
		gameInstance.socket!.emit("pause-resume", { status: "resume" });
		resumeButton.classList.add("hidden");
		gameInstance.uiManager.newmatchButton!.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage!.classList.add("hidden");
	});
}

export function listenPlayerInputs(gameInfo: GameInfo) {
	if (gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI' || gameInfo.mode === 'tournament') {
		listenNonLocalInputs();
	} else if (gameInfo.mode === 'localGame') {
		listenLocalInputs();
	}

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
			gameInstance.socket!.emit("reset-match");
		window.location.reload(); //todo bundan kaçın
	});

	gameInstance.uiManager.turnToHomePage!.addEventListener("click", () => {
		resumeButton.classList.add("hidden");
		gameInstance.uiManager.newmatchButton?.classList.add("hidden");
		gameInstance.uiManager.turnToHomePage?.classList.add("hidden");
		gameInstance.uiManager.startButton?.classList.add("hidden");

		if (!gameInfo.state?.matchOver)
			gameInstance.socket!.emit("reset-match");

		const toPage = gameInfo.mode === 'tournament' ? '/tournament' : '/';
		Router.getInstance().go(toPage);
	});
}

