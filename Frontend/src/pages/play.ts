import { createCamera, createPaddles, createGround, createWalls, createScene, createPredictedBall} from "./game-section/gameScene";
import {Mesh, Engine, Scene} from "@babylonjs/core";
import { startGameLoop} from "./game-section/gameLoop"
import { BallController } from "./game-section/ball";
import { GameInfo } from "./game-section/network";


/*********************************** */
import { Socket } from "socket.io-client";

// 🎮 WebSocket bağlantısı
import {createSocket } from "./game-section/network";

//tip tanımlama için sınıf dışarısında olmak lazım
export	type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | null;

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
}

export class game
{
	public	startButton: HTMLElement | null;
	public	scoreBoard: HTMLElement | null;
	public	setBoard: HTMLElement | null;
	public	scoreTable: HTMLElement | null;
	public	setTable: HTMLElement | null;
	public	endMsg: HTMLElement | null;
	public	socket: Socket | null;
	public	newmatchButton: HTMLElement | null;;
	public	info: HTMLElement | null;
	public engine: Engine | undefined = undefined;
	public scene: Scene | undefined = undefined;
	public gameInfo: GameInfo | null = null;
	public canvas: HTMLCanvasElement | null;
	public groundSize: {width: number, height: number} | null;
	public ground: Mesh | null;
	public paddle1: Mesh | null = null;
	public paddle2: Mesh | null = null;
	public ball: BallController | null = null;
	public gameStatus : GameStatus = {
		currentGameStarted: false,	
		game_mode: null
	};
	public reMatch: boolean = false;

	public constructor()
	{
		this.startButton = null;
		this.scoreBoard = null;
		this.setBoard = null;
		this.scoreTable = null;
		this.setTable = null;
		this.endMsg = null;
		this.socket = null;
		this.newmatchButton = null;
		this.info = null;
		this.gameInfo = null;
		this.canvas = null;
		this.groundSize = {width: 0, height: 0};
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

	public initButtons(): boolean {
		this.startButton = document.getElementById("start-button");
		this.scoreBoard = document.getElementById("scoreboard");
		this.setBoard = document.getElementById("setboard");
		this.scoreTable = document.getElementById("score-table");
		this.setTable = document.getElementById("set-table");
		this.endMsg = document.getElementById("end-message");
		this.socket = createSocket();
		this.newmatchButton = document.getElementById("newmatch-button") as HTMLButtonElement;
		this.info = document.getElementById("info");

		if (!this.startButton || !this.scoreBoard || !this.setBoard ||
			!this.scoreTable || !this.setTable || !this.endMsg ||
			!this.socket || !this.newmatchButton || !this.info) {
			console.log("Bir veya daha fazla HTML elementi bulunamadı. Lütfen HTML dosyasını kontrol edin.");
			return false;
		} else {
			console.log("Tüm HTML elementleri başarıyla yüklendi.");
			return true;
		}
	}

	public initializeGameSettings(onModeSelected: (status: GameStatus) => void)
	{
		console.log(`initializeGame settings içindeyiz, gameStatus.currentGameStarted = ${this.gameStatus.currentGameStarted}`);
		if(this.gameStatus.currentGameStarted) {
			onModeSelected(this.gameStatus);
			return;
		}

		let status : {currentGameStarted: boolean, game_mode: GameMode, level?: string};
		status = {currentGameStarted: false, game_mode: null};

		const btnVsComp = document.getElementById("btn-vs-computer")!;
		const btnFindRival = document.getElementById("btn-find-rival")!;
		const diffDiv = document.getElementById("difficulty")!;
		const btnLocal = document.getElementById("btn-local")!;
	
		// 1) VS Computer’a basıldığında zorluk seçeneklerini göster
		btnVsComp.addEventListener("click", () =>
		{
			document.getElementById("menu")!.classList.add("hidden");
			diffDiv.classList.remove("hidden");
		});
	
		// 2) Zorluk seçildiğinde server’a emit et
		diffDiv.querySelectorAll("button").forEach(btn => {
			btn.addEventListener("click", () => {
			const level = (btn as HTMLElement).dataset.level!;
			//socket.emit("startWithAI", { level });
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

	public cleanOldGame()
	{
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

	public startGame(gameInfo: GameInfo){
		
		// 🎮 Canvas ve oyun motoru
		const sceneSetup = createScene();
		this.canvas = sceneSetup.canvas;
		this.engine = sceneSetup.engine;
		this.scene = sceneSetup.scene;
	
		// 🎮 Kamera & Işık
		createCamera(this.scene);
	
	
		// 🎮 Zemin
		this.ground = createGround(this.scene, gameInfo).ground;
		this.groundSize = createGround(this.scene, gameInfo).groundSize;
	
		// 🎮 Paddle'lar ve top
		this.paddle1 = createPaddles(this.scene, gameInfo).paddle1;
		this.paddle2 = createPaddles(this.scene, gameInfo).paddle2;
		
		// 🎮 Top
		this.ball = new BallController(this.scene, gameInfo);
	
	
		// 🎮 Duvarlar
		createWalls(this.scene);
	
	
		const predictedBall = createPredictedBall(this.scene, this.groundSize.width/2);
		//predictedBallRef = predictedBall;export function ayhan()
		{
			// 🎮 Oyun motoru döngüsü
			startGameLoop(this.engine, this.scene, gameInfo, predictedBall);
		
			this.canvas.focus();
			console.log("gamestatus true oldu");
			this.gameStatus.currentGameStarted = true;
		}
	}
}


export const gameInstance = new game();