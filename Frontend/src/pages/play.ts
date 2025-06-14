import { createPaddles, createGround, createWalls, createScene, createPredictedBall } from "./game-section/gameScene";
import { Mesh, Engine, Scene, FreeCamera, Vector3 } from "@babylonjs/core";
import { startGameLoop } from "./game-section/gameLoop"
import { BallController } from "./game-section/ball";
import { GameInfo, waitForGameInfoReady, waitForMatchReady, waitForRematchApproval } from "./game-section/network";
import { createGame } from "./game-section/ui";
import { CameraController } from "./game-section/camera";
/*********************************** */
import { Socket } from "socket.io-client";

// 🎮 WebSocket bağlantısı
import { createSocket } from "./game-section/network";
//import { FreeCamera } from "babylonjs";

//tip tanımlama için sınıf dışarısında olmak lazım
export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | null;

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
}

export class game {
	public startButton: HTMLElement | null;
	public scoreBoard: HTMLElement | null;
	public setBoard: HTMLElement | null;
	public scoreTable: HTMLElement | null;
	public setTable: HTMLElement | null;
	public endMsg: HTMLElement | null;
	public socket: Socket | null;
	public newmatchButton: HTMLElement | null;
	public turnToHomePage: HTMLElement | null;
	public info: HTMLElement | null;
	public engine: Engine | undefined = undefined;
	public scene: Scene | undefined = undefined;
	public gameInfo: GameInfo | null = null;
	public canvas: HTMLCanvasElement | null;
	public groundSize: { width: number, height: number } | null;
	public ground: Mesh | null;
	public paddle1: Mesh | null = null;
	public paddle2: Mesh | null = null;
	public ball: BallController | null = null;
	public gameStatus: GameStatus = {
		currentGameStarted: false,
		game_mode: null
	};
	public reMatch: boolean = false;

	public constructor() {
		this.resetGame();
	}


	public resetGame() {
		this.startButton = null;
		this.scoreBoard = null;
		this.setBoard = null;
		this.scoreTable = null;
		this.setTable = null;
		this.endMsg = null;
		this.socket = null;
		this.newmatchButton = null;
		this.turnToHomePage = null;
		this.info = null;
		this.gameInfo = null;
		this.canvas = null;
		this.groundSize = { width: 0, height: 0 };
		this.engine = undefined;
		this.scene = undefined;
		this.ground = null;
		this.paddle1 = null;
		this.paddle2 = null;
		this.ball = null;
		this.gameStatus = {
			currentGameStarted: false,
			game_mode: null
		};
	}

	public initGameSettings(): boolean {
		this.startButton = document.getElementById("start-button");
		this.scoreBoard = document.getElementById("scoreboard");
		this.setBoard = document.getElementById("setboard");
		this.scoreTable = document.getElementById("score-table");
		this.setTable = document.getElementById("set-table");
		this.endMsg = document.getElementById("end-message");
		this.socket = createSocket();
		this.newmatchButton = document.getElementById("newmatch-button");
		this.turnToHomePage = document.getElementById("turnHomePage-button");
		this.info = document.getElementById("info");

		if (!this.startButton || !this.scoreBoard || !this.setBoard ||
			!this.scoreTable || !this.setTable || !this.endMsg ||
			!this.socket || !this.newmatchButton || !this.turnToHomePage || !this.info) {
			console.log("Bir veya daha fazla HTML elementi bulunamadı. Lütfen HTML dosyasını kontrol edin.");
			return false;
		} else {
			console.log("Tüm HTML elementleri başarıyla yüklendi.");
			console.log("Oyun sayfası hazırlanıyor.");


			this.initializeGameSettings(async (status) => {
				console.log(`status geldi, status = {${status.currentGameStarted}, ${status.game_mode}}`);
				this.gameStatus = status;
				this.socket!.emit("start", this.gameStatus);

				let rival: string;
				if (this.gameStatus.game_mode === "remoteGame") {
					rival = await waitForMatchReady(this.socket!);
					console.log(`${this.socket!.id} ${rival} maçı için HAZIR`);
				}

				// Oyun başlatma butonuna tıklanınca:
				this.startButton!.addEventListener("click", async () => {
					console.log(`START A TIKLANDI, içeriği : ${this.startButton!.innerText}`);
					this.startButton!.classList.add("hidden");
					if (!this.endMsg) {
						const a = document.getElementById("end-message")!;
						a.classList.add("hidden");
					}
					else {
						this.endMsg.classList.add("hidden");
					}

					if (this.gameStatus.game_mode === "remoteGame")
						this.info!.textContent = `${rival} bekleniyor ...`;
					else
						this.info!.classList.add("hidden");
					this.newmatchButton!.classList.add("hidden");
					this.turnToHomePage!.classList.add("hidden");

					if (this.gameStatus.currentGameStarted) {
						this.reMatch = true;
						this.cleanOldGame();
					}
					this.socket!.emit("ready", false);
					if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
						const approval = await waitForRematchApproval(this.socket!, rival);
						if (approval)
							this.socket!.emit("ready", true);
						else {
							this.newmatchButton!.classList.remove("hidden");
							this.turnToHomePage!.classList.add("hidden");
							return;
						}
					}
					this.gameInfo = new GameInfo(this.gameStatus.game_mode);
					await waitForGameInfoReady(this.gameInfo, this.socket!);
					console.log(`${this.socket!.id} için VERİLER HAZIR`);
					createGame(this.gameInfo);
					this.startGame(this.gameInfo!);				
				});

			});



			return true;
		}

	}

	public initializeGameSettings(onModeSelected: (status: GameStatus) => void) {
		if (this.gameStatus.currentGameStarted) {
			onModeSelected(this.gameStatus);
			return;
		}

		let status: { currentGameStarted: boolean, game_mode: GameMode, level?: string };
		status = { currentGameStarted: false, game_mode: null };

		const btnVsComp = document.getElementById("btn-vs-computer")!;
		const btnFindRival = document.getElementById("btn-find-rival")!;
		const diffDiv = document.getElementById("difficulty")!;
		const btnLocal = document.getElementById("btn-local")!;

		// 1) VS Computer’a basıldığında zorluk seçeneklerini göster
		btnVsComp.addEventListener("click", () => {
			document.getElementById("menu")!.classList.add("hidden");
			diffDiv.classList.remove("hidden");
		});

		// 2) Zorluk seçildiğinde server’a emit et
		diffDiv.querySelectorAll("button").forEach(btn => {
			btn.addEventListener("click", () => {
				const level = (btn as HTMLElement).dataset.level!;
				status.game_mode = 'vsAI';
				status.level = level;
				diffDiv.classList.add("hidden");
				this.startButton!.classList.remove("hidden");
				onModeSelected(status);
			});
		});

		// 3) Find Rival butonuna basıldığında normal matchmaking
		btnFindRival.addEventListener("click", () => {
			document.getElementById("menu")!.classList.add("hidden");
			this.info!.textContent = "Online bir rakip için bekleniyor	...";
			this.info!.classList.remove("hidden");
			status.game_mode = 'remoteGame';
			onModeSelected(status);
		});

		// 4) local game e tıklanırsa 

		btnLocal.addEventListener("click", () => {
			document.getElementById("menu")!.classList.add("hidden");
			//socket.emit("localGame");
			status.game_mode = 'localGame';
			this.startButton!.classList.remove("hidden");
			onModeSelected(status);

		});
	}


	public cleanOldGame() {
		this.scene!.dispose();
		this.engine!.dispose();

		this.scene = undefined;
		this.engine = undefined;

		this.socket!.off("gameConstants");
		this.socket!.off("gameState");
		this.socket!.off("ballUpdate");
		this.socket!.off("paddleUpdate");
		this.socket!.off("ready");
		this.socket!.off("rematch-ready");
		this.socket!.off("start");
		this.socket!.off("username");
		this.socket!.off("player-move");
		this.socket!.off("local-input");
		this.socket!.off("pause-resume");
		this.socket!.off("reset-match");

		this.gameInfo = null;
		this.gameStatus.currentGameStarted = false;
	}

	public async startGame(gameInfo: GameInfo)
		{
			// 🎮 Canvas ve oyun motoru
			const sceneSetup = createScene();
			this.canvas = sceneSetup.canvas;
			this.engine = sceneSetup.engine;
			this.scene = sceneSetup.scene;

			// 🎮 Kamera & Işık
			new CameraController(this.scene);

			// 🎮 Zemin
			this.ground = createGround(this.scene, gameInfo).ground;
			this.groundSize = createGround(this.scene, gameInfo).groundSize; 

			// 🎮 Paddle'lar ve top
			const paddles = createPaddles(this.scene, gameInfo);
			this.paddle1 = paddles.paddle1;
			this.paddle2 = paddles.paddle2;

			// 🎮 Top
			this.ball = new BallController(this.scene, gameInfo);

			// 🎮 Duvarlar
			createWalls(this.scene);

			const predictedBall = createPredictedBall(this.scene!, this.groundSize!.width / 2);
			startGameLoop(this.engine!, this.scene!, this.gameInfo!, predictedBall);
			this.canvas!.focus();
			this.gameStatus.currentGameStarted = true;
	}
}


export const gameInstance = new game();