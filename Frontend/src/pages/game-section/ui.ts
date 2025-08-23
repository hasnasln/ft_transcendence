import { gameInstance } from "../play";
import { GameInfo, MatchPlayers } from "./network";
import { Router } from "../../router";
import { BallController } from "./ball";

import { BabylonJsWrapper } from "./3d";
import { createPaddles, createGround, createWalls, createScene } from "./gameScene";
import { CameraController } from "./camera";
import { exmp } from "../../lang/languageManager";
const B = BabylonJsWrapper.getInstance();

export class GameUI {
	public startButton: HTMLElement | null = null;
	public scoreBoard: HTMLElement | null = null;
	public roundDiv: HTMLElement | null = null;
	public tournamentIdDiv: HTMLElement | null = null;
	public scoreTable: HTMLElement | null = null;
	public roundNoTable: HTMLElement | null = null;
	public tournamentIDTable: HTMLElement | null = null;
	public endMsg: HTMLElement | null = null;
	public newMatchButton: HTMLElement | null = null;
	public turnToHomePage: HTMLElement | null = null;
	public info: HTMLElement | null = null;
	public resumeButton: HTMLElement | null = null;
	public canvas: HTMLCanvasElement | null = null;

	public progressContainer: HTMLElement | null = null;
	public progressBar: HTMLElement | null = null;

	public groundSize: { width: number, height: number } | null = null;
	public ground: any | null = null;
	public paddle1: any | null = null;
	public paddle2: any | null = null;
	public ball: BallController | null = null;
	public engine: any | undefined;
	public scene: any | undefined;

	public cacheDOMElements(): void {
		this.startButton = document.getElementById("ready-button");
		this.scoreBoard = document.getElementById("scoreboard");
		this.roundDiv = document.getElementById("roundDiv");
		this.tournamentIdDiv = document.getElementById("tournamentIdDiv");
		this.scoreTable = document.getElementById("score-table");
		this.roundNoTable = document.getElementById("roundNo");
		this.tournamentIDTable = document.getElementById("tournamentCode");
		this.endMsg = document.getElementById("end-message");
		this.newMatchButton = document.getElementById("newmatch-button");
		this.turnToHomePage = document.getElementById("turnHomePage-button");
		this.info = document.getElementById("info");
		this.progressContainer = document.getElementById("progress-container");
		this.progressBar = document.getElementById("progress-bar");
		this.resumeButton = document.getElementById("resume-button");
	}

	public finalizeUI(): void {
		[
			this.startButton, this.scoreBoard, this.roundDiv, this.tournamentIdDiv,
			this.scoreTable, this.roundNoTable,
			this.endMsg, this.newMatchButton, this.turnToHomePage, this.info,
			this.progressContainer, this.resumeButton
		].filter(el => el != null)
		.forEach(el => this.hide(el));
		this.engine?.clear(new B.Color4(0, 0, 0, 0), true, true);
		this.scene?.dispose();
		this.engine?.dispose();
		this.scene = undefined;
		this.engine = undefined;
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
		this.newMatchButton = null;
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

	public showProgressBar(): void {
		this.progressContainer!.classList.remove("hidden");
	}

	public hideProgressBar(): void {
		this.progressContainer!.classList.add("hidden");
	}

	public updateProgressBar(percentage: number, duration: number): void {
		if (this.progressBar) {
			percentage = Math.max(0, Math.min(100, percentage));
			this.progressBar.style.transitionDuration = `${duration}ms`;
			this.progressBar.style.width = `${percentage}%`;
		}
	}

	public onMenuHidden(): void {
		document.getElementById("menu")?.classList.add("hidden");
	}

	public onDifficultyShown(): void {
		document.getElementById("difficulty")?.classList.remove("hidden");
	}

	public onDifficultyHidden(): void {
		document.getElementById("difficulty")?.classList.add("hidden");
	}

	public onStartButtonShown(): void {
		this.startButton?.classList.remove("hidden");
	}

	public onStartButtonHidden(): void {
		this.startButton?.classList.add("hidden");
	}

	public onInfoShown(key: string, placeholders?: {key:string, value:string} [] ): void {
		this.info!.classList.remove("hidden");
		this.info!.setAttribute('data-translate-key', key)
		if (placeholders){
			placeholders.forEach((placeholder) => {
				this.info!.setAttribute(`data-translate-placeholder-value-${placeholder.key}`, placeholder.value);
			});
			this.info!.classList.remove("hidden");
		}
		exmp.applyLanguage2();
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
			this.turnToHomePage.setAttribute('data-translate-key', text);
		}
		exmp.applyLanguage2();
	}

	public onTurnToTournamentButton(): void {
		this.onInfoShown("game.InfoMessage.round_advanced");
		this.onTurnHomeButtonText("game.go-tournament-page");

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
				this.onInfoShown("game.InfoMessage.next_match_final_vs_rival", [{key:"rival", value: rival}]);
			else
				this.onInfoShown("game.InfoMessage.next_match_final_vs_rival", [{key:"rival", value: rival}, {key:"round", value: `${matchPlayers.roundNo}`}]);
		} else {
			this.onInfoShown("game.InfoMessage.matched_with_rival", [{key:"rival", value: rival}]);
		}
		this.startButton!.setAttribute("data-translate-key", "game.play-game");
		this.startButton!.setAttribute("data-translate-placeholder-value-rival", rival);
		exmp.applyLanguage2();
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
		const glow = new (BabylonJsWrapper.getInstance().GlowLayer)("glow", this.scene);
		glow.intensity = 0.7;
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
	
	// maç bitiminde 3 yazması gereken yerde 2 yazıp bitiriyor, maç bitiminde, son 
	// sayı emit olarak gönderiliyor, bu yüzden burada 2 yazıyor.
	// emitleri kontrol ettim geliyor
	const setsHome = document.getElementById("sets-home");
	const setsAway = document.getElementById("sets-away");
	if (setsHome && setsAway) {
		setsHome.textContent = `${gameInstance.gameInfo.setState?.sets.leftPlayer}`;
		setsAway.textContent = `${gameInstance.gameInfo.setState?.sets.rightPlayer}`;
	}
	
	if (gameInstance.gameInfo.mode === 'tournament') {
		if (gameInstance.uiManager.roundNoTable) {
			if (gameInstance.gameStatus.finalMatch) {
				gameInstance.uiManager.roundNoTable.innerText = `Final maçı`;
			} else {
				const roundNumber = gameInstance.gameInfo.state?.roundNumber || 1;
				gameInstance.uiManager.roundNoTable.innerText = `Round ${roundNumber}`;
			}
		}

		if (gameInstance.uiManager.tournamentIDTable) {
			gameInstance.uiManager.tournamentIDTable.innerText = `Turnuva Adı : ${gameInstance.gameInfo.state?.tournamentName}`;
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
}

export function showSetToast(gameInfo: GameInfo, message: string): Promise<void> {
	return new Promise((resolve) => {
		const toast = document.getElementById("set-toast")!;
		toast.textContent = message;
		toast.classList.remove("hidden");

		gameInstance.runAfter(() => {
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
	let winnerName = gameInstance.gameInfo.gameEndInfo?.matchWinner === 'leftPlayer' ? gameInstance.gameInfo.setState?.usernames.left : gameInstance.gameInfo.setState?.usernames.right;
	gameInstance.uiManager.endMsg!.setAttribute("data-translate-key", "game.EndMessage.match_winner");
	gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-winner", winnerName || '');

	if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
		{
			gameInstance.uiManager.endMsg!.setAttribute("data-translate-key", "game.EndMessage.tournament_winner");
			gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
			gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-tournamnet", gameInstance.gameStatus.tournamentCode || '');
		}
	if (gameInstance.gameInfo.gameEndInfo?.endReason === 'disconnection') {
		if (gameInstance.gameInfo.mode === 'localGame' || gameInstance.gameInfo.mode === 'vsAI')
			gameInstance.uiManager.endMsg!.setAttribute("data-translate-key", "disconnected_match_ended");
		if (gameInstance.gameInfo.mode === 'remoteGame' || gameInstance.gameInfo.mode === 'tournament')
			{
				gameInstance.uiManager.endMsg!.setAttribute("data-translate-key", "game.EndMessage.opponent_disconnected_match_winner");
				gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
			}
		if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
			{
				gameInstance.uiManager.endMsg!.setAttribute("data-translate-key", "game.EndMessage.opponent_disconnected_tournament_winner");
				gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
				gameInstance.uiManager.endMsg!.setAttribute("data-translate-placeholder-value-tournament", gameInstance.gameStatus.tournamentCode || '');
			}
	}

	gameInstance.runAfter(() => {
		exmp.applyLanguage2();
		gameInstance.uiManager.endMsg!.classList.remove("hidden");
		if (gameInstance.gameInfo!.mode === 'tournament') {
			gameInstance.uiManager.turnToHomePage!.setAttribute("data-translate-key", "game.EndMessage.back_to_tournament_page");
			gameInstance.uiManager.turnToHomePage!.classList.remove("hidden");
		} else {
			gameInstance.uiManager.newMatchButton!.classList.remove("hidden");
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
