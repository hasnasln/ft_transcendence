import { createPaddles, createGround, createWalls, createScene } from "./game-section/gameScene";
import { Mesh, Engine, Scene, Vector3} from "@babylonjs/core";
import { BallController } from "./game-section/ball";
import { GameInfo, waitForGameInfoReady, waitForMatchReady, waitForMatchApproval } from "./game-section/network";
import { createGame, startNextSet, updateScoreBoard, updateSetBoard, showEndMessage } from "./game-section/ui";
import { CameraController } from "./game-section/camera";
import { Socket } from "socket.io-client";
import { createSocket} from "./game-section/network";
import { moveButton } from "../components/mov-button";
import Swal, { SweetAlertResult}  from 'sweetalert2';

export async function showConfirm(message: string): Promise<SweetAlertResult<any>> {
  const result = await Swal.fire({
    title: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Evet',
    cancelButtonText: 'Hayır'
  });
  return result;
}

export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament' | null;

export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean
}

export class Game
{
	public startButton: HTMLElement | null = null;
	public scoreBoard: HTMLElement | null = null;
	public roundDiv: HTMLElement | null = null;
	public tournamentIdDiv: HTMLElement | null = null;
	public setBoard: HTMLElement | null = null;
	public scoreTable: HTMLElement | null = null;
	public roundNoTable: HTMLElement | null = null;
	public tournamentIDTable: HTMLElement | null = null;
	public setTable: HTMLElement | null = null;
	public endMsg: HTMLElement | null = null;
	public socket: Socket | null = null;
	public newmatchButton: HTMLElement | null = null;
	public turnToHomePage: HTMLElement | null = null;
	public info: HTMLElement | null = null;
	public countdown: HTMLElement | null = null;
	public countdownIntervalId: number | null = null;
	public engine: Engine | undefined;
	public scene: Scene | undefined;
	public gameInfo: GameInfo | null = null;
	public canvas: HTMLCanvasElement | null = null;
	public groundSize: { width: number, height: number } | null = null;
	public ground: Mesh | null = null;
	public paddle1: Mesh | null = null;
	public paddle2: Mesh | null = null;
	public ball: BallController | null = null;
	public gameStatus: GameStatus = {
		currentGameStarted: false,
		game_mode: null,
		finalMatch: false
	};
	public reMatch: boolean = false;
	public username: string | null = null;
	public tournamentMode : boolean = false;
	public tournamentCode?: string;
	public remoteGameApproval:boolean | null = null;
	public rival: string  = 'rakip';
	public reload: boolean = false;

	public constructor() {
		this.resetGame();
	}


	public resetGame() {
		this.startButton = null;
		this.scoreBoard = null;
		this.setBoard = null;
		this.scoreTable = null;
		this.roundNoTable = null;
		this.tournamentIDTable = null;
		this.roundDiv = null;
		this.tournamentIdDiv=null;
		this.setTable = null;
		this.endMsg = null;
		this.newmatchButton = null;
		this.turnToHomePage = null;
		this.info = null;
		this.countdown = null;
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
			game_mode: null,
			finalMatch : false
		};
		this.username = null;
	}

	public initGameSettings(tournamentMode: boolean, reload : boolean, tournamentCode?: string): boolean
	{
		this.tournamentMode = tournamentMode;
		this.reload = reload;
		if (tournamentCode !== undefined)
			this.tournamentCode = tournamentCode;
		if (!this.reload)
			this.resetGame();
		this.startButton = document.getElementById("start-button");
		this.scoreBoard = document.getElementById("scoreboard");
		this.roundDiv = document.getElementById("roundDiv");
		this.tournamentIdDiv = document.getElementById("tournamentIdDiv");
		this.setBoard = document.getElementById("setboard");
		this.scoreTable = document.getElementById("score-table");
		this.roundNoTable = document.getElementById("roundNo");
		this.tournamentIDTable = document.getElementById("tournamentCode");
		this.setTable = document.getElementById("set-table");
		this.endMsg = document.getElementById("end-message");
		this.newmatchButton = document.getElementById("newmatch-button");
		this.turnToHomePage = document.getElementById("turnHomePage-button");
		this.info = document.getElementById("info");
		this.countdown = document.getElementById("countdown");


		if (!this.reload)
			console.log("connecting to socket.io server...");


			if (!this.startButton || !this.scoreBoard || !this.roundDiv || !this.tournamentIdDiv || !this.setBoard ||
					!this.scoreTable || !this.roundNoTable || !this.tournamentIDTable || !this.setTable || !this.endMsg
					 || !this.newmatchButton || !this.turnToHomePage || !this.info || !this.countdown)
			{
				console.log("Bir veya daha fazla HTML elementi bulunamadı. Lütfen HTML dosyasını kontrol edin.");
				return false;
			}
			else
			{
				console.log("Tüm HTML elementleri başarıyla yüklendi.");
				console.log("Oyun sayfası hazırlanıyor.");


				this.initializeGameSettings(async (status) =>
				{
					const onSocketConnection = async () =>
					{
						if (!this.reload)
						{
							console.log("connected to socket.io server");
							console.log(`status geldi, status = {${status.currentGameStarted}, ${status.game_mode}, ${status.level}, ${status.tournamentCode}}`);
							this.gameStatus = status;
							this.socket!.emit("start", this.gameStatus);

							if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament')
							{
								if (this.gameStatus.game_mode === 'tournament')
								{
									this.info!.textContent = "Turnuva rakibi için bekleniyor	...";
									this.info!.classList.remove("hidden");
								}
								this.rival = await waitForMatchReady(this);
								console.log(`${this.socket!.id} ${this.rival} maçı için HAZIR`);
							}
						}
						else
						{
							this.startButton!.innerText = 'Maça devam et';
							this.startButton!.classList.remove("hidden");
						}

						// Oyun başlatma butonuna tıklanınca:
						this.startButton!.addEventListener("click", async () =>
							{
								console.log(`START A TIKLANDI, içeriği : ${this.startButton!.innerText}, this.reload = ${this.reload}`);
								this.startButton!.classList.add("hidden");
								this.endMsg!.classList.add("hidden");
								this.newmatchButton!.classList.add("hidden");
								this.turnToHomePage!.classList.add("hidden");

								if (this.gameStatus.game_mode === "remoteGame"  || this.gameStatus.game_mode === "tournament")
									this.info!.textContent = `${this.rival} bekleniyor ...`;
								else
									this.info!.classList.add("hidden");

								if (this.gameStatus.currentGameStarted)
								{
									this.reMatch = true;
									this.cleanOldGame();
								}
								if (this.reload)
									this.socket!.emit("reload-ready");
									
								else
								{
									this.socket!.emit("ready");
									if (this.gameStatus.game_mode === "remoteGame"  || this.gameStatus.game_mode === "tournament")
										await waitForMatchApproval(this);
								}
									
								this.gameInfo = new GameInfo(this.gameStatus.game_mode);
								await waitForGameInfoReady(this);
								console.log(`${this.socket!.id} için VERİLER HAZIR`);
								createGame(this);
								moveButton(document.getElementById("game-wrapper")!, 'left');	// id= game-wrapper
								if (this.gameStatus.game_mode === "localGame")
								{
									moveButton(document.getElementById("game-wrapper")!, 'right');	// id= game-wrapper
								}
								this.startGame();			
							});
					}

						if(!this.reload)
							this.socket = createSocket(this, onSocketConnection);
						else
							onSocketConnection();

						this.socket!.on('waitingRematch', async (rival: string) =>
						{console.log(`waitingRematch emiti geldi rival ${rival}`);
							const result = await showConfirm(`${rival} oyuncusundan tekrar maç isteği geldi. Oynamak istermisin ?`);
							if (result.isConfirmed)
								{console.log("evet cevabı ?");
									this.startButton!.click();}
							else if (result.dismiss === Swal.DismissReason.cancel)
							{console.log("hayır cevabı ???")
								this.endMsg!.classList.add("hidden");
								this.turnToHomePage!.classList.add("hidden");
								this.socket!.emit("cancel");
								this.newmatchButton!.classList.remove("hidden");
							}
						});


						this.socket!.on("match-cancelled", (data: {cancellerId: string, rematch: boolean, mode: string}) =>
						{console.log("match-cancelled emiti geldi"  + ` data.rematch = ${data.rematch}`+ ` mode = ${data.mode}`);
							const isSelf = data.cancellerId === this.socket!.id;

							let message: string;

							switch (data.mode)
							{
								case "waiting approval":
								if (!data.rematch) {
									message = isSelf
									? `Geçerli süre içerisinde cevap vermediniz, maç iptal edildi !`
									: `Rakibiniz geçerli süre içerisinde cevap vermedi, maç iptal edildi !`;
								} else {
									message = isSelf
									? "Maç iptal edildi !."
									: "Rövanş talebine onay gelmedi, maç iptal edildi.";
								}
								break;

								case "refuse":
								if (!data.rematch) {
									message = isSelf
									? "Maç iptal edildi !"
									: "Rakibin maçı oynamayı reddetti.";
								} else {
									message = isSelf
									? "Maç iptal edildi"
									: "Rakibin rövanşı reddetti.";
								}
								break;

								case "disconnect":
								if (!data.rematch) {
									message = isSelf
									? "Maç iptal edildi !"
									: "Rakibinin bağlantısı kesildi, maç iptal edildi.";
								} else {
									message = isSelf
									? "Maç iptal edildi !"
									: "Rakibinin bağlantısı kesildi, maç iptal edildi.";
								}
								break;

								default:
								message = "Maç iptal edildi !";
							}
							this.info!.innerText = message;
							this.endMsg!.classList.add("hidden");
							this.info!.classList.remove("hidden");
							this.newmatchButton!.classList.remove("hidden");
							this.startButton!.classList.add("hidden");
							this.turnToHomePage!.classList.add("hidden");
							this.newmatchButton!.addEventListener("click", () =>
							{
								this.newmatchButton!.classList.add("hidden");
								window.history.pushState({}, '', '/play');
								window.location.reload();
							});									
						});

						this.socket!.on("opponent-disconnected", () =>
						{
							console.log('opponent-disconnected geldi');
							this.info!.textContent = `Rakibin bağlantısı kesildi. Tekrar bağlanması bekleniyor ...`;
							this.startCountdown(15, true);
							this.info!.classList.remove("hidden");
						});

						this.socket!.on("opponent-reconnected", () =>
						{
							console.log('opponent-reconnected geldi');
							this.stopCountdown();
							this.info!.textContent = `Rakibin tekrar bağlandı, maç devam ediyor ...`;
							this.info!.classList.remove("hidden");
							setTimeout(() =>
							{
								this.info!.classList.add("hidden");
							}, 1000);
						});

						this.socket!.on('goToNextRound', () =>
						{
							console.log('Bir üst tura yükseldiniz:');
							this.info!.textContent = `Bir üst tura yükseldiniz ! \n
							Bir sonraki roundu bekleyiniz ...`;
							this.turnToHomePage!.textContent = "Turnuva sayfasına Dön";

							this.turnToHomePage!.addEventListener("click", () =>
							{
								this.turnToHomePage!.classList.add("hidden");
								window.history.pushState({}, '', '/tournament');
								window.location.reload();
							});
							
							this.info!.classList.remove("hidden");
							this.turnToHomePage!.classList.remove("hidden");
						});
				});
			}
		return true;
	}

	public initializeGameSettings(onModeSelected: (status: GameStatus) => void)
	{ 
		if (this.reload)
		{
			onModeSelected(this.gameStatus);
			return;
		}

		if (this.tournamentMode)
		{
			this.info!.textContent = "Turnuva rakibi için bekleniyor	...";
			this.info!.classList.remove("hidden");
			this.gameStatus = { currentGameStarted: false, game_mode: 'tournament', tournamentCode : this.tournamentCode, finalMatch: this.gameStatus.finalMatch };
			onModeSelected(this.gameStatus);
			return;
		}
		if (this.gameStatus.currentGameStarted) {
			onModeSelected(this.gameStatus);
			return;
		}

		let status: GameStatus;
		status = { currentGameStarted: false, game_mode: null, finalMatch: this.gameStatus.finalMatch };

		const btnVsComp = document.getElementById("btn-vs-computer")!;
		const btnFindRival = document.getElementById("btn-find-rival")!;
		const diffDiv = document.getElementById("difficulty")!;
		const btnLocal = document.getElementById("btn-local")!;
		const tournament = document.getElementById("tournament")!;


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

		//5) tournament

			tournament.addEventListener("click", () => {
		document.getElementById("menu")!.classList.add("hidden");

		status.game_mode = 'tournament';
		this.tournamentMode = true;

		const codeDiv = document.createElement('div');
		codeDiv.id = 'tournament-code-div';
		codeDiv.className = 'absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 \
		flex flex-col justify-center items-center gap-12 mt-4 z-10';

		const codeInput = document.createElement('input');
		codeInput.type = 'text';
		codeInput.placeholder = 'Turnuva Kodunu Giriniz';
		codeInput.className = 'border border-gray-400 rounded px-5 py-2 text-[1.5vw]';

		const submitBtn = document.createElement('button');
		submitBtn.textContent = 'Oyna';
		submitBtn.className = 'bg-blue-500 text-white px-5 py-2 rounded text-[1.5vw]';
		
		
		codeDiv.appendChild(codeInput);
		codeDiv.appendChild(submitBtn);
		const playDiv = document.getElementById('game-wrapper');
		playDiv!.appendChild(codeDiv);

		submitBtn.addEventListener('click', async () => {
			const enteredCode = codeInput.value.trim();
			if (!enteredCode) {
			alert('Lütfen geçerli bir kod girin.');
			return;
			}

			console.log(`enteredCode = ${enteredCode}`);
			this.tournamentCode = enteredCode;
			status.tournamentCode = this.tournamentCode;
			codeDiv.remove();
			onModeSelected(status);
		});
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
		this.socket!.off("player-move");
		this.socket!.off("local-input");
		this.socket!.off("pause-resume");
		this.socket!.off("reset-match");

		this.gameInfo = null;
		this.gameStatus.currentGameStarted = false;
	}

	public async startGame()
	{
		// 🎮 Canvas ve oyun motoru
		const sceneSetup = createScene();
		this.canvas = sceneSetup.canvas;
		this.engine = sceneSetup.engine;
		this.scene = sceneSetup.scene;

		// 🎮 Kamera & Işık
		new CameraController(this.scene);

		// 🎮 Zemin
		this.ground = createGround(this)!.ground;
		this.groundSize = createGround(this)!.groundSize; 

		// 🎮 Paddle'lar ve top
		const paddles = createPaddles(this)!;
		this.paddle1 = paddles.paddle1;
		this.paddle2 = paddles.paddle2;

		// 🎮 Top
		this.ball = new BallController(this);

		// 🎮 Duvarlar
		createWalls(this);

		this.startGameLoop();
		this.canvas!.focus();
		this.gameStatus.currentGameStarted = true;
	}


	public startGameLoop(): void
	{
		if (!this.gameInfo) return;
		this.engine!.runRenderLoop(() =>
		  {
			if (!this.gameInfo) return;
			if (!this.gameInfo.state) return;
			if (this.gameInfo!.state.matchOver)
			  {
				this.reload = false;
				updateScoreBoard(this);
				updateSetBoard(this);
				showEndMessage(this);
				this.engine!.stopRenderLoop();
				return;
			  }
			if (this.gameInfo!.state.setOver)
			  {
				if (!this.gameInfo!.nextSetStartedFlag)
				{
				  updateScoreBoard(this);
				  startNextSet(this);
				  this.gameInfo!.nextSetStartedFlag = true;
				}
				return;
			  }
			if (this.gameInfo!.state.isPaused) return;
		 
			// Topu hareket ettir
			gameInstance.ball!.ball.position = new Vector3(this.gameInfo!.ballState?.bp!.x, this.gameInfo!.ballState?.bp!.y, -this.gameInfo!.constants?.ballRadius!);
			gameInstance.ball!.velocity = new Vector3(this.gameInfo!.ballState?.bv.x, this.gameInfo!.ballState?.bv.y, 0);
			gameInstance.ball!.ball.position.addInPlace(gameInstance.ball!.velocity);
			// pedalları hareket ettir
			gameInstance.paddle1!.position.y = this.gameInfo!.paddle?.p1y!;
			gameInstance.paddle2!.position.y = this.gameInfo!.paddle?.p2y!;
	
	
			//skor ve set güncellemesi
			updateScoreBoard(this);
			updateSetBoard(this);
	   
			this.scene?.render();
		  });
	}


	public startCountdown(duration: number, winnerSide: boolean)
	{
		let remaining = duration;
		if (!this.countdown) return;

		this.countdown.textContent = remaining.toString();
		this.countdown.classList.remove("hidden");

		// Önce varsa eski interval'i temizle
		if (this.countdownIntervalId !== null)
			clearInterval(this.countdownIntervalId);

		this.countdownIntervalId = window.setInterval(() =>
		{
			remaining--;
			if (!this.countdown) return;

			this.countdown.textContent = remaining.toString();

			if (remaining <= 0)
			{
				if(!winnerSide)
				{
					this.info!.classList.add("hidden");
					setTimeout(() => 
					{
						this.info!.textContent = "Maçı kaybettiniz ...";
						this.info!.classList.remove("hidden");
						this.newmatchButton!.classList.remove("hidden");
						this.turnToHomePage!.classList.remove("hidden");
					},10);
				}
				this.stopCountdown();
				this.reload = false;
			}
    	}, 1000);
  	}

	public stopCountdown()
	{
		if (this.countdownIntervalId !== null)
		{
			clearInterval(this.countdownIntervalId);
			this.countdownIntervalId = null;
		}
		if (this.countdown)
			this.countdown.classList.add("hidden");
		this.info!.classList.add('hidden');
  	}

	public handleNetworkPause(): void
	{
		if(this.gameInfo?.state?.matchOver || ! this.gameStatus.currentGameStarted)
			return;
		if(this.gameStatus.game_mode === 'localGame' || this.gameStatus.game_mode === 'vsAI')
		{
			this.info!.textContent = "Ağ bağlantısı koptu. Maçınız bitirilecek ...";
			this.info!.classList.remove("hidden");
			setTimeout(() =>
			{
				this.info!.classList.add("hidden");
				window.history.pushState({}, '', '/play');
				window.location.reload();
				return;
			}, 2000);
		}
		console.log("Network kopması algılandı, oyunu duraklatıyoruz.");

		// a) Anlık durumu alıp sakla
		const state = this.captureState();
		if (state) {
			sessionStorage.setItem("pausedGame", JSON.stringify(state));
		}

		// b) Render loop'u durdur
		if (this.engine) {
			this.engine.stopRenderLoop();
		}

		// c) Uyarı metnini göster, sayaç başlat
		this.info!.textContent = "Ağ bağlantısı koptu. 15 sn içerisinde bağlantı gelirse maçınız devam edecek...";
		this.info!.classList.remove("hidden");
		this.reload = true;
		setTimeout(() => { this.startCountdown(15, false); }, 1000);
		
	}

	private captureState(): GameStatus | null
	{
		if (!this.ball || !this.paddle1 || !this.paddle2 ) return null;
		if (this.gameInfo?.state?.isPaused) {
			sessionStorage.setItem("matchOver", JSON.stringify(this.gameInfo?.state?.isPaused));
		}
		return this.gameStatus;
	}

	public loadState(status: GameStatus)
	{
		this.gameStatus = status; 
	}

	public resumeAfterReconnect()
	{
		this.stopCountdown();
		if(!this.reload)
			return;
		const raw = sessionStorage.getItem("pausedGame");
		if (raw)
		{
			const status: GameStatus = JSON.parse(raw);
			this.loadState(status);
			sessionStorage.removeItem("pausedGame");

			if(status.game_mode === 'localGame' || status.game_mode === 'vsAI')
			{
				window.history.pushState({}, '', '/play');
				window.location.reload();
				return;
			}

			const raw2 = sessionStorage.getItem("matchOver");
			if(raw2)
			{
				const matchOver: boolean = JSON.parse(raw2);
				sessionStorage.removeItem("pausedGame");
				if (matchOver)
				{
					window.history.pushState({}, '', '/play');
					window.location.reload();
					return;
				}
			}

			let tournamentMode = status.game_mode === 'tournament' ? true : false;
			this.initGameSettings(tournamentMode, true, status.tournamentCode);
		}
		else
		{
			window.history.pushState({}, '', '/play');
			window.location.reload();
		}

	}
}

export const gameInstance = new Game();