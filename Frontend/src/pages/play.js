import { createPaddles, createGround, createWalls, createScene } from "./game-section/gameScene";
import { startGameLoop } from "./game-section/gameLoop";
import { BallController } from "./game-section/ball";
import { GameInfo, waitForGameInfoReady, waitForMatchReady, waitForRematchApproval } from "./game-section/network";
import { createGame } from "./game-section/ui";
import { CameraController } from "./game-section/camera";
import { createSocket } from "./game-section/network";
import { moveButton } from "../components/mov-button";
export class game {
    startButton = null;
    scoreBoard = null;
    roundDiv = null;
    tournamentIdDiv = null;
    setBoard = null;
    scoreTable = null;
    roundNoTable = null;
    tournamentIDTable = null;
    setTable = null;
    endMsg = null;
    socket = null;
    newmatchButton = null;
    turnToHomePage = null;
    info = null;
    engine;
    scene;
    gameInfo = null;
    canvas = null;
    groundSize = null;
    ground = null;
    paddle1 = null;
    paddle2 = null;
    ball = null;
    gameStatus = {
        currentGameStarted: false,
        game_mode: null,
        finalMatch: false
    };
    reMatch = false;
    username = null;
    tournamentMode = false;
    tournamentCode;
    constructor() {
        this.resetGame();
    }
    resetGame() {
        this.startButton = null;
        this.scoreBoard = null;
        this.setBoard = null;
        this.scoreTable = null;
        this.roundNoTable = null;
        this.tournamentIDTable = null;
        this.roundDiv = null;
        this.tournamentIdDiv = null;
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
            game_mode: null,
            finalMatch: false
        };
        this.username = null;
    }
    initGameSettings(tournamentMode, tournamentCode) {
        this.tournamentMode = tournamentMode;
        if (tournamentCode !== undefined)
            this.tournamentCode = tournamentCode;
        //this.cleanOldGame();       ????????????????????????????????????????????????????????????????????
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
        console.log("connecting to socket.io server...");
        const onSocketConnection = () => {
            if (!this.startButton || !this.scoreBoard || !this.roundDiv || !this.tournamentIdDiv || !this.setBoard ||
                !this.scoreTable || !this.roundNoTable || !this.tournamentIDTable || !this.setTable || !this.endMsg ||
                !this.socket || !this.newmatchButton || !this.turnToHomePage || !this.info) {
                console.log("Bir veya daha fazla HTML elementi bulunamadı. Lütfen HTML dosyasını kontrol edin.");
                return false;
            }
            else {
                console.log("Tüm HTML elementleri başarıyla yüklendi.");
                console.log("Oyun sayfası hazırlanıyor.");
                this.initializeGameSettings(async (status) => {
                    console.log("connected to socket.io server");
                    console.log(`status geldi, status = {${status.currentGameStarted}, ${status.game_mode}, ${status.level}, ${status.tournamentCode}}`);
                    this.gameStatus = status;
                    this.socket.emit("start", this.gameStatus);
                    let rival;
                    if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === 'tournament') {
                        if (this.gameStatus.game_mode === 'tournament') {
                            this.info.textContent = "Turnuva rakibi için bekleniyor	...";
                            this.info.classList.remove("hidden");
                        }
                        rival = await waitForMatchReady(this);
                        console.log(`${this.socket.id} ${rival} maçı için HAZIR`);
                    }
                    // Oyun başlatma butonuna tıklanınca:
                    this.startButton.addEventListener("click", async () => {
                        console.log(`START A TIKLANDI, içeriği : ${this.startButton.innerText}`);
                        this.startButton.classList.add("hidden");
                        if (!this.endMsg) {
                            const a = document.getElementById("end-message");
                            a.classList.add("hidden");
                        }
                        else
                            this.endMsg.classList.add("hidden");
                        if (this.gameStatus.game_mode === "remoteGame" || this.gameStatus.game_mode === "tournament") {
                            console.log(`İÇERDEYUK`);
                            this.info.textContent = `${rival} bekleniyor ...`;
                        }
                        else
                            this.info.classList.add("hidden");
                        this.newmatchButton.classList.add("hidden");
                        this.turnToHomePage.classList.add("hidden");
                        if (this.gameStatus.currentGameStarted) {
                            this.reMatch = true;
                            this.cleanOldGame();
                        }
                        this.socket.emit("ready", false);
                        if (this.gameStatus.game_mode === "remoteGame" && this.reMatch) {
                            const approval = await waitForRematchApproval(this.socket, rival);
                            if (approval)
                                this.socket.emit("ready", true);
                            else {
                                this.newmatchButton.classList.remove("hidden");
                                this.turnToHomePage.classList.add("hidden");
                                return;
                            }
                        }
                        this.gameInfo = new GameInfo(this.gameStatus.game_mode);
                        await waitForGameInfoReady(this.gameInfo, this.socket);
                        console.log(`${this.socket.id} için VERİLER HAZIR`);
                        createGame(this.gameInfo);
                        moveButton(document.getElementById("game-wrapper"), 'left'); // id= game-wrapper
                        if (this.gameStatus.game_mode === "localGame") {
                            moveButton(document.getElementById("game-wrapper"), 'right'); // id= game-wrapper
                        }
                        this.startGame();
                    });
                });
            }
        };
        this.socket = createSocket(onSocketConnection);
        this.socket.on('goToNextRound', () => {
            console.log('Bir üst tura yükseldiniz:');
            this.info.textContent = `Bir üst tura yükseldiniz ! \n
			Bir sonraki roundu bekleyiniz ...`;
            this.turnToHomePage.textContent = "Turnuva sayfasına Dön";
            gameInstance.turnToHomePage.addEventListener("click", () => {
                gameInstance.turnToHomePage.classList.add("hidden");
                window.history.pushState({}, '', '/tournament');
                window.location.reload();
            });
            this.info.classList.remove("hidden");
            this.turnToHomePage.classList.remove("hidden");
        });
        return true;
    }
    initializeGameSettings(onModeSelected) {
        if (this.tournamentMode) {
            this.info.textContent = "Turnuva rakibi için bekleniyor	...";
            this.info.classList.remove("hidden");
            this.gameStatus = { currentGameStarted: false, game_mode: 'tournament', tournamentCode: this.tournamentCode, finalMatch: this.gameStatus.finalMatch };
            onModeSelected(this.gameStatus);
            return;
        }
        if (this.gameStatus.currentGameStarted) {
            onModeSelected(this.gameStatus);
            return;
        }
        let status;
        status = { currentGameStarted: false, game_mode: null, finalMatch: this.gameStatus.finalMatch };
        const btnVsComp = document.getElementById("btn-vs-computer");
        const btnFindRival = document.getElementById("btn-find-rival");
        const diffDiv = document.getElementById("difficulty");
        const btnLocal = document.getElementById("btn-local");
        const tournament = document.getElementById("tournament");
        // 1) VS Computer’a basıldığında zorluk seçeneklerini göster
        btnVsComp.addEventListener("click", () => {
            document.getElementById("menu").classList.add("hidden");
            diffDiv.classList.remove("hidden");
        });
        // 2) Zorluk seçildiğinde server’a emit et
        diffDiv.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                const level = btn.dataset.level;
                status.game_mode = 'vsAI';
                status.level = level;
                diffDiv.classList.add("hidden");
                this.startButton.classList.remove("hidden");
                onModeSelected(status);
            });
        });
        // 3) Find Rival butonuna basıldığında normal matchmaking
        btnFindRival.addEventListener("click", () => {
            document.getElementById("menu").classList.add("hidden");
            this.info.textContent = "Online bir rakip için bekleniyor	...";
            this.info.classList.remove("hidden");
            status.game_mode = 'remoteGame';
            onModeSelected(status);
        });
        // 4) local game e tıklanırsa 
        btnLocal.addEventListener("click", () => {
            document.getElementById("menu").classList.add("hidden");
            //socket.emit("localGame");
            status.game_mode = 'localGame';
            this.startButton.classList.remove("hidden");
            onModeSelected(status);
        });
        //5) tournament
        tournament.addEventListener("click", () => {
            // 1️⃣ Mevcut menüyü gizle, bilgi metnini göster
            document.getElementById("menu").classList.add("hidden");
            // 2️⃣ Oyun modunu tournament olarak ayarla
            status.game_mode = 'tournament';
            this.tournamentMode = true;
            // 3️⃣ Dinamik olarak bir div ekle: içinde input + button olacak
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
            playDiv.appendChild(codeDiv); // Veya uygun bir container'a
            // 4️⃣ Butona tıklanınca kodu oku ve akışı devam ettir
            submitBtn.addEventListener('click', async () => {
                const enteredCode = codeInput.value.trim();
                if (!enteredCode) {
                    alert('Lütfen geçerli bir kod girin.');
                    return;
                }
                console.log(`enteredCode = ${enteredCode}`);
                // Örneğin this.tournamentCode'a atayabilirsiniz:
                this.tournamentCode = enteredCode;
                status.tournamentCode = this.tournamentCode;
                // Div’i kaldır
                codeDiv.remove();
                onModeSelected(status);
            });
        });
    }
    cleanOldGame() {
        this.scene.dispose();
        this.engine.dispose();
        this.scene = undefined;
        this.engine = undefined;
        this.socket.off("gameConstants");
        this.socket.off("gameState");
        this.socket.off("ballUpdate");
        this.socket.off("paddleUpdate");
        this.socket.off("ready");
        this.socket.off("rematch-ready");
        this.socket.off("start");
        this.socket.off("username");
        this.socket.off("player-move");
        this.socket.off("local-input");
        this.socket.off("pause-resume");
        this.socket.off("reset-match");
        this.gameInfo = null;
        this.gameStatus.currentGameStarted = false;
    }
    async startGame() {
        // 🎮 Canvas ve oyun motoru
        const sceneSetup = createScene();
        this.canvas = sceneSetup.canvas;
        this.engine = sceneSetup.engine;
        this.scene = sceneSetup.scene;
        // 🎮 Kamera & Işık
        new CameraController(this.scene);
        // 🎮 Zemin
        this.ground = createGround(this.scene, this.gameInfo).ground;
        this.groundSize = createGround(this.scene, this.gameInfo).groundSize;
        // 🎮 Paddle'lar ve top
        const paddles = createPaddles(this.scene, this.gameInfo);
        this.paddle1 = paddles.paddle1;
        this.paddle2 = paddles.paddle2;
        // 🎮 Top
        this.ball = new BallController(this.scene, this.gameInfo);
        // 🎮 Duvarlar
        createWalls(this.scene, this.gameInfo);
        startGameLoop(this.engine, this.scene, this.gameInfo);
        this.canvas.focus();
        this.gameStatus.currentGameStarted = true;
    }
}
export const gameInstance = new game();
