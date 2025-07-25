import { gameInstance } from "./../play";
import { GameInfo, MatchPlayers } from "./network";
import { Router } from "../../router";
import { moveButton } from "../../components/mov-button";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { BallController } from "./ball"; import { createPaddles, createGround, createWalls, createScene } from "../game-section/gameScene";
import { CameraController } from "../game-section/camera";

export class GameUI {
	public startButton: HTMLElement | null = null;
	public scoreBoard: HTMLElement | null = null;
	public roundDiv: HTMLElement | null = null;
	public tournamentIdDiv: HTMLElement | null = null;
	public scoreTable: HTMLElement | null = null;
	public roundNoTable: HTMLElement | null = null;
	public tournamentIDTable: HTMLElement | null = null;
	public endMsg: HTMLElement | null = null;
	public newmatchButton: HTMLElement | null = null;
	public turnToHomePage: HTMLElement | null = null;
	public info: HTMLElement | null = null;
	public canvas: HTMLCanvasElement | null = null;

	public groundSize: { width: number, height: number } | null = null;
	public ground: Mesh | null = null;
	public paddle1: Mesh | null = null;
	public paddle2: Mesh | null = null;
	public ball: BallController | null = null;
	public engine: Engine | undefined;
	public scene: Scene | undefined;

	public cacheDOMElements(): void {
		this.startButton = document.getElementById("ready-button");
		this.scoreBoard = document.getElementById("scoreboard");
		this.roundDiv = document.getElementById("roundDiv");
		this.tournamentIdDiv = document.getElementById("tournamentIdDiv");
		this.scoreTable = document.getElementById("score-table");
		this.roundNoTable = document.getElementById("roundNo");
		this.tournamentIDTable = document.getElementById("tournamentCode");
		this.endMsg = document.getElementById("end-message");
		this.newmatchButton = document.getElementById("newmatch-button");
		this.turnToHomePage = document.getElementById("turnHomePage-button");
		this.info = document.getElementById("info");
	}

	public resetCache(): void {
		this.startButton = null;
		this.scoreBoard = null;
		this.roundDiv = null;
		this.tournamentIdDiv = null;
		this.scoreTable = null;
		this.roundNoTable = null;
		this.tournamentIDTable = null;
		this.endMsg = null;
		this.newmatchButton = null;
		this.turnToHomePage = null;
		this.info = null;

		this.groundSize = { width: 0, height: 0 };
		this.engine = undefined;
		this.scene = undefined;
		this.ground = null;
		this.paddle1 = null;
		this.paddle2 = null;
		this.ball = null;
	}

	public onMenuHidden(): void {
		document.getElementById("menu")!.classList.add("hidden");
	}

	public onDifficultyShown(): void {
		document.getElementById("difficulty")!.classList.remove("hidden");
	}

	public onDifficultyHidden(): void {
		document.getElementById("difficulty")!.classList.add("hidden");
	}

	public onStartButtonShown(): void {
		this.startButton!.classList.remove("hidden");
	}

	public onStartButtonHidden(): void {
		this.startButton!.classList.add("hidden");
	}

	public onInfoShown(message: string): void {
		this.info!.textContent = message;
		this.info!.classList.remove("hidden");
	}

	public onInfoHidden(): void {
		this.info!.classList.add("hidden");
	}

	public hide(element: HTMLElement | null | undefined): void {
		element?.classList.add("hidden");
	}

	public show(element: HTMLElement | null | undefined): void {
		element?.classList.remove("hidden");
	}

	public onTurnHomeButtonText(text: string): void {
		if (this.turnToHomePage) {
			this.turnToHomePage.textContent = text;
		}
	}

	public onTurnToTournamentButton(): void {
		this.onInfoShown(`Bir üst tura yükseldiniz ! \nBir sonraki roundu bekleyiniz ...`);
		this.onTurnHomeButtonText("Turnuva sayfasına Dön");

		this.turnToHomePage!.addEventListener("click", () => {
			this.turnToHomePage!.classList.add("hidden");
			Router.getInstance().go('/tournament');
		});

		this.show(this.turnToHomePage);
	}

	public updateUIForRivalFound(matchPlayers: MatchPlayers, rival: string): void {
		if (gameInstance.gameStatus.game_mode === 'tournament') {
			gameInstance.gameStatus.finalMatch = matchPlayers.finalMatch!;
			gameInstance.gameStatus.roundNo = matchPlayers.roundNo;
			
			if (matchPlayers.finalMatch)
				this.onInfoShown(`Sıradaki maç: ${gameInstance.tournamentCode} final maçı : vs ${rival}`);
			else
				this.onInfoShown(`Sıradaki maç round : ${matchPlayers.roundNo} vs ${rival}`);
		} else {
			this.onInfoShown(`${rival} ile eşleştin`);
		}
		this.startButton!.innerHTML = `${rival} maçını oyna !`;
		setTimeout(() => this.startButton?.classList.remove("hidden"), 500);
	}

	public async setupScene(): Promise<void> {
		initializeGameUI();

		const sceneSetup = createScene();
		this.canvas = sceneSetup.canvas;
		this.engine = sceneSetup.engine;
		this.scene = sceneSetup.scene;
		new CameraController(this.scene);
		const { ground, groundSize } = createGround(this.scene, gameInstance.gameInfo!)
		this.ground = ground;
		this.groundSize = groundSize;
		const paddles = createPaddles(this.scene, gameInstance.gameInfo!);
		this.paddle1 = paddles.paddle1;
		this.paddle2 = paddles.paddle2;
		this.ball = new BallController(this.scene, gameInstance.gameInfo!);
		createWalls(this.scene, gameInstance.gameInfo!);
		this.canvas!.focus();
		gameInstance.gameStatus.currentGameStarted = true;
	}

	public isSceneReady(): boolean {
		return this.canvas !== null && this.engine !== undefined && this.scene !== undefined &&
			this.ground !== null && this.paddle1 !== null && this.paddle2 !== null && this.ball !== null;
	}
}

export function updateScoreBoard() {
	if (!gameInstance.gameInfo) return;
	if (gameInstance.gameInfo.state?.isPaused) return;

	const scoreHome = document.getElementById("score-home");
	const scoreAway = document.getElementById("score-away");
	
	if (scoreHome && scoreAway) {
		scoreHome.textContent = `${gameInstance.gameInfo.setState?.points.leftPlayer}`;
		scoreAway.textContent = `${gameInstance.gameInfo.setState?.points.rightPlayer}`;
	}
	
	if (gameInstance.uiManager.scoreTable) {
		gameInstance.uiManager.scoreTable.innerText = `${gameInstance.gameInfo.setState?.points.leftPlayer}  :  ${gameInstance.gameInfo.setState?.points.rightPlayer}`;
	}
	
	const roundDisplay = document.getElementById("roundNo");
	if (roundDisplay) {
		if (gameInstance.gameInfo.mode === 'tournament') {
			if (gameInstance.gameStatus.finalMatch) {
				roundDisplay.innerText = `Final`;
			} else {
				const roundNumber = gameInstance.gameInfo.state?.roundNumber || 1;
				const roundNoFromStatus = gameInstance.gameStatus.roundNo;
				
				const actualRound = roundNoFromStatus || roundNumber || 1;
				roundDisplay.innerText = `Round ${actualRound}`;
			}
		} else {
			const leftSets = gameInstance.gameInfo.setState?.sets.leftPlayer || 0;
			const rightSets = gameInstance.gameInfo.setState?.sets.rightPlayer || 0;
			const totalSets = leftSets + rightSets;
			const currentRound = totalSets + 1;
			
			roundDisplay.innerText = `Round ${currentRound}`;
		}
	}
	
	if (gameInstance.gameInfo.mode === 'tournament') {
		if (gameInstance.uiManager.roundNoTable) {
			if (gameInstance.gameStatus.finalMatch) {
				gameInstance.uiManager.roundNoTable.innerText = `Final`;
			} else {
				const roundNumber = gameInstance.gameInfo.state?.roundNumber || 1;
				const roundNoFromStatus = gameInstance.gameStatus.roundNo;
				const actualRound = roundNoFromStatus || roundNumber || 1;
				gameInstance.uiManager.roundNoTable.innerText = `Round ${actualRound}`;
			}
		}

		if (gameInstance.uiManager.tournamentIDTable) {
			gameInstance.uiManager.tournamentIDTable.innerText = `Turnuva ID : ${gameInstance.gameStatus.tournamentCode}`;
		}
	}
}

export function initializeGameUI() {
	gameInstance.uiManager.endMsg!.classList.add("hidden");
	gameInstance.uiManager.info!.classList.add("hidden");
	gameInstance.uiManager.scoreBoard!.classList.remove("hidden");
	if (gameInstance.gameInfo!.mode === 'tournament') {
		gameInstance.uiManager.roundDiv!.classList.remove("hidden");
		gameInstance.uiManager.tournamentIdDiv!.classList.remove("hidden");
	}

	prepareScoreBoards();
	updateScoreBoard();
	
	moveButton(document.getElementById("game-wrapper")!, 'left');
	if (gameInstance.gameStatus.game_mode === "localGame") {
		moveButton(document.getElementById("game-wrapper")!, 'right');
	}
}

export function showSetToast(gameInfo: GameInfo, message: string): Promise<void> {
	return new Promise((resolve) => {
		const toast = document.getElementById("set-toast")!;
		toast.textContent = message;
		toast.classList.remove("hidden");

		setTimeout(() => {
			toast.classList.add("hidden");
			resolve();
		}, 3000);
	});
}

export async function startNextSet() {
	const winnerName = gameInstance.gameInfo!.setState!.points.leftPlayer > gameInstance.gameInfo!.setState!.points.rightPlayer ? gameInstance.gameInfo?.setState?.usernames.left : gameInstance.gameInfo?.setState?.usernames.right;
	await showSetToast(gameInstance.gameInfo!, `Seti ${winnerName} kazandı !`);  // 3 saniye bekler
}

export function showEndMessage() {
	if (!gameInstance.gameInfo) return;
	let winnerName = gameInstance.gameInfo.state?.matchWinner === 'leftPlayer' ? gameInstance.gameInfo.setState?.usernames.left : gameInstance.gameInfo.setState?.usernames.right;
	gameInstance.uiManager.endMsg!.textContent = `${winnerName} maçı kazandı !`;
	if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
		gameInstance.uiManager.endMsg!.textContent = `${winnerName} ${gameInstance.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`;

	if (gameInstance.gameInfo.state?.matchDisconnection) {
		if (gameInstance.gameInfo.mode === 'localGame' || gameInstance.gameInfo.mode === 'vsAI')
			gameInstance.uiManager.endMsg!.textContent = `Bağlantısı kesildi. Maç bitti !`;
		if (gameInstance.gameInfo.mode === 'remoteGame' || gameInstance.gameInfo.mode === 'tournament')
			gameInstance.uiManager.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} maçı kazandı!`;
		if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
			gameInstance.uiManager.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} ${gameInstance.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`;
	}

	setTimeout(() => {
		gameInstance.uiManager.endMsg!.classList.remove("hidden");
		if (gameInstance.gameInfo!.mode === 'tournament') {
			gameInstance.uiManager.turnToHomePage!.textContent = "Turnuva sayfasına Dön";
			gameInstance.uiManager.turnToHomePage!.classList.remove("hidden");
		} else {
			if (gameInstance.uiManager.startButton && !gameInstance.gameInfo?.state?.matchDisconnection) {
				gameInstance.uiManager.startButton.textContent = "Aynı Maçı Tekrar Oyna";
				gameInstance.uiManager.startButton.classList.remove("hidden");
			}
			gameInstance.uiManager.newmatchButton!.classList.remove("hidden");
			gameInstance.uiManager.turnToHomePage!.classList.remove("hidden");
		}
	}, 500);
}

function prepareScoreBoards() {
	const blueTeam = document.getElementById("blue-team");
	const redTeam = document.getElementById("red-team");

	if (blueTeam && gameInstance.gameInfo?.setState?.usernames.left) {
		blueTeam.innerText = `${gameInstance.gameInfo.setState.usernames.left}`;
	}
	
	if (redTeam && gameInstance.gameInfo?.setState?.usernames.right) {
		redTeam.innerText = `${gameInstance.gameInfo.setState.usernames.right}`;
	}
}
