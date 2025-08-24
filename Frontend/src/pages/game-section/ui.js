import { gameInstance } from "../play";
import { Router } from "../../router";
import { BallController } from "./ball";
import { BabylonJsWrapper } from "./3d";
import { createPaddles, createGround, createWalls, createScene } from "./gameScene";
import { CameraController } from "./camera";
import { exmp } from "../../lang/languageManager";
const B = BabylonJsWrapper.getInstance();
export class GameUI {
    startButton = null;
    scoreBoard = null;
    roundDiv = null;
    tournamentIdDiv = null;
    scoreTable = null;
    roundNoTable = null;
    tournamentIDTable = null;
    endMsg = null;
    newMatchButton = null;
    turnToHomePage = null;
    info = null;
    resumeButton = null;
    canvas = null;
    progressContainer = null;
    progressBar = null;
    groundSize = null;
    ground = null;
    paddle1 = null;
    paddle2 = null;
    ball = null;
    engine;
    scene;
    cacheDOMElements() {
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
    finalizeUI() {
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
    resetCache() {
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
    showProgressBar() {
        this.progressContainer.classList.remove("hidden");
    }
    hideProgressBar() {
        this.progressContainer.classList.add("hidden");
    }
    updateProgressBar(percentage, duration) {
        if (this.progressBar) {
            percentage = Math.max(0, Math.min(100, percentage));
            this.progressBar.style.transitionDuration = `${duration}ms`;
            this.progressBar.style.width = `${percentage}%`;
        }
    }
    onMenuHidden() {
        document.getElementById("menu")?.classList.add("hidden");
    }
    onDifficultyShown() {
        document.getElementById("difficulty")?.classList.remove("hidden");
    }
    onDifficultyHidden() {
        document.getElementById("difficulty")?.classList.add("hidden");
    }
    onStartButtonShown() {
        this.startButton?.classList.remove("hidden");
    }
    onStartButtonHidden() {
        this.startButton?.classList.add("hidden");
    }
    onInfoShown(key, placeholders) {
        this.info.classList.remove("hidden");
        this.info.setAttribute('data-translate-key', key);
        if (placeholders) {
            placeholders.forEach((placeholder) => {
                this.info.setAttribute(`data-translate-placeholder-value-${placeholder.key}`, placeholder.value);
            });
            this.info.classList.remove("hidden");
        }
        exmp.applyLanguage2();
    }
    onInfoHidden() {
        this.info.classList.add("hidden");
    }
    hide(element) {
        element?.classList.add("hidden");
    }
    show(element) {
        element?.classList.remove("hidden");
    }
    onTurnHomeButtonText(text) {
        if (this.turnToHomePage) {
            this.turnToHomePage.setAttribute('data-translate-key', text);
        }
        exmp.applyLanguage2();
    }
    onTurnToTournamentButton() {
        this.onInfoShown("game.InfoMessage.round_advanced");
        this.onTurnHomeButtonText("game.go-tournament-page");
        this.turnToHomePage.addEventListener("click", () => {
            this.turnToHomePage.classList.add("hidden");
            Router.getInstance().go('/tournament');
        });
        exmp.applyLanguage2();
        this.show(this.turnToHomePage);
    }
    updateUIForRivalFound(matchPlayers, rival) {
        if (gameInstance.gameStatus.game_mode === 'tournament') {
            gameInstance.gameStatus.finalMatch = matchPlayers.finalMatch;
            gameInstance.gameStatus.roundNo = matchPlayers.roundNo;
            gameInstance.gameStatus.tournamentName = matchPlayers.tournamentName;
            if (matchPlayers.finalMatch)
                this.onInfoShown("game.InfoMessage.next_match_final_vs_rival", [{ key: "rival", value: rival }]);
            else
                this.onInfoShown("game.InfoMessage.matched_with_rival", [{ key: "rival", value: rival }, { key: "round", value: `${matchPlayers.roundNo}` }]);
        }
        else {
            this.onInfoShown("game.InfoMessage.matched_with_rival", [{ key: "rival", value: rival }]);
        }
        this.startButton.setAttribute("data-translate-key", "game.play-game");
        this.startButton.setAttribute("data-translate-placeholder-value-rival", rival);
        exmp.applyLanguage2();
    }
    async setupScene() {
        initializeGameUI();
        const sceneSetup = createScene();
        this.canvas = sceneSetup.canvas;
        this.engine = sceneSetup.engine;
        this.scene = sceneSetup.scene;
        new CameraController(this.scene);
        const { ground, groundSize } = createGround(this.scene, gameInstance.gameInfo);
        this.ground = ground;
        this.groundSize = groundSize;
        const paddles = createPaddles(this.scene, gameInstance.gameInfo);
        this.paddle1 = paddles.paddle1;
        this.paddle2 = paddles.paddle2;
        this.ball = new BallController(this.scene, gameInstance.gameInfo);
        createWalls(this.scene, gameInstance.gameInfo);
        this.canvas.focus();
        gameInstance.gameStatus.currentGameStarted = true;
        const glow = new (BabylonJsWrapper.getInstance().GlowLayer)("glow", this.scene);
        glow.intensity = 0.7;
    }
    isSceneReady() {
        return this.canvas !== null && this.engine !== undefined && this.scene !== undefined &&
            this.ground !== null && this.paddle1 !== null && this.paddle2 !== null && this.ball !== null;
    }
}
export function updateScoreBoard() {
    if (!gameInstance.gameInfo)
        return;
    if (gameInstance.gameInfo.state?.isPaused)
        return;
    const scoreHome = document.getElementById("score-home");
    const scoreAway = document.getElementById("score-away");
    if (scoreHome && scoreAway) {
        scoreHome.textContent = `${gameInstance.gameInfo.setState?.points.leftPlayer}`;
        scoreAway.textContent = `${gameInstance.gameInfo.setState?.points.rightPlayer}`;
    }
    if (gameInstance.uiManager.scoreTable) {
        gameInstance.uiManager.scoreTable.innerText = `${gameInstance.gameInfo.setState?.points.leftPlayer}  :  ${gameInstance.gameInfo.setState?.points.rightPlayer}`;
    }
    const setsHome = document.getElementById("sets-home");
    const setsAway = document.getElementById("sets-away");
    if (setsHome && setsAway) {
        setsHome.textContent = `${gameInstance.gameInfo.setState?.sets.leftPlayer}`;
        setsAway.textContent = `${gameInstance.gameInfo.setState?.sets.rightPlayer}`;
    }
    if (gameInstance.gameInfo.mode === 'tournament') {
        if (gameInstance.uiManager.roundNoTable) {
            if (gameInstance.gameStatus.finalMatch) {
                gameInstance.uiManager.roundNoTable.setAttribute("data-translate-key", "game.final_match_round_no");
            }
            else {
                const roundNumber = gameInstance.gameInfo.state?.roundNumber || 1;
                gameInstance.uiManager.roundNoTable.setAttribute("data-translate-key", "game.round_number");
                gameInstance.uiManager.roundNoTable.setAttribute("data-translate-placeholder-value-round", String(roundNumber));
            }
        }
        if (gameInstance.uiManager.tournamentIDTable) {
            gameInstance.uiManager.tournamentIDTable.setAttribute("data-translate-key", "game.tournament_name");
            gameInstance.uiManager.tournamentIDTable.setAttribute("data-translate-placeholder-value-tournament", gameInstance.gameInfo.state?.tournamentName || '');
        }
    }
    exmp.applyLanguage2();
}
export function initializeGameUI() {
    gameInstance.uiManager.endMsg.classList.add("hidden");
    gameInstance.uiManager.info.classList.add("hidden");
    gameInstance.uiManager.scoreBoard.classList.remove("hidden");
    if (gameInstance.gameInfo.mode === 'tournament') {
        gameInstance.uiManager.roundDiv.classList.remove("hidden");
        gameInstance.uiManager.tournamentIdDiv.classList.remove("hidden");
    }
    prepareScoreBoards();
    updateScoreBoard();
}
export function showSetToast(message) {
    return new Promise((resolve) => {
        const toast = document.getElementById("set-toast");
        toast.setAttribute("data-translate-key", "game.set_winner");
        toast.setAttribute("data-translate-placeholder-value-winner", message);
        toast.classList.remove("hidden");
        exmp.applyLanguage2();
        gameInstance.runAfter(() => {
            toast.classList.add("hidden");
            resolve();
        }, 3000);
    });
}
export async function startNextSet() {
    const winnerName = gameInstance.gameInfo.setState.points.leftPlayer > gameInstance.gameInfo.setState.points.rightPlayer ? gameInstance.gameInfo?.setState?.usernames.left : gameInstance.gameInfo?.setState?.usernames.right;
    await showSetToast(winnerName || ''); // 3 saniye bekler
}
export function showEndMessage() {
    if (!gameInstance.gameInfo)
        return;
    let winnerName = gameInstance.gameInfo.gameEndInfo?.matchWinner === 'leftPlayer' ? gameInstance.gameInfo.setState?.usernames.left : gameInstance.gameInfo.setState?.usernames.right;
    gameInstance.uiManager.endMsg.setAttribute("data-translate-key", "game.EndMessage.match_winner");
    gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
    if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true) {
        console.log(`gameInstance.gameStatus.tournamentName : ${gameInstance.gameStatus.tournamentName}`);
        gameInstance.uiManager.endMsg.setAttribute("data-translate-key", "game.EndMessage.tournament_winner");
        gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
        gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-tournament", gameInstance.gameInfo.state?.tournamentName || '');
    }
    if (gameInstance.gameInfo.gameEndInfo?.endReason === 'disconnection') {
        if (gameInstance.gameInfo.mode === 'localGame' || gameInstance.gameInfo.mode === 'vsAI')
            gameInstance.uiManager.endMsg.setAttribute("data-translate-key", "disconnected_match_ended");
        if (gameInstance.gameInfo.mode === 'remoteGame' || gameInstance.gameInfo.mode === 'tournament') {
            gameInstance.uiManager.endMsg.setAttribute("data-translate-key", "game.EndMessage.opponent_disconnected_match_winner");
            gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
        }
        if (gameInstance.gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true) {
            gameInstance.uiManager.endMsg.setAttribute("data-translate-key", "game.EndMessage.opponent_disconnected_tournament_winner");
            gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-winner", winnerName || '');
            gameInstance.uiManager.endMsg.setAttribute("data-translate-placeholder-value-tournament", gameInstance.gameInfo.state?.tournamentName || '');
        }
    }
    gameInstance.runAfter(() => {
        exmp.applyLanguage2();
        gameInstance.uiManager.endMsg.classList.remove("hidden");
        if (gameInstance.gameInfo.mode === 'tournament') {
            gameInstance.uiManager.turnToHomePage.setAttribute("data-translate-key", "game.EndMessage.back_to_tournament_page");
            gameInstance.uiManager.turnToHomePage.classList.remove("hidden");
        }
        else {
            gameInstance.uiManager.newMatchButton.classList.remove("hidden");
            gameInstance.uiManager.turnToHomePage.classList.remove("hidden");
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
