import { gameInstance } from "../play";
export function initializeEventListeners(gameInfo) {
    if (gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI' || gameInfo.mode === 'tournament') {
        window.addEventListener("keydown", (event) => {
            let moved = false;
            if (event.key === 'w') {
                gameInstance.socket.emit("player-move", { direction: "up" });
                moved = true;
            }
            else if (event.key === 's') {
                gameInstance.socket.emit("player-move", { direction: "down" });
                moved = true;
            }
            if (moved)
                event.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            if (["w", "s"].includes(e.key))
                gameInstance.socket.emit("player-move", { direction: "stop" });
        });
    }
    else if (gameInfo.mode === 'localGame') {
        window.addEventListener("keydown", (event) => {
            let moved = false;
            if (event.key === 'w') {
                gameInstance.socket.emit("local-input", { player_side: "left", direction: "up" });
                moved = true;
            }
            else if (event.key === 's') {
                gameInstance.socket.emit("local-input", { player_side: "left", direction: "down" });
                moved = true;
            }
            if (event.key === 'ArrowUp') {
                gameInstance.socket.emit("local-input", { player_side: "right", direction: "up" });
                moved = true;
            }
            else if (event.key === 'ArrowDown') {
                gameInstance.socket.emit("local-input", { player_side: "right", direction: "down" });
                moved = true;
            }
            if (moved)
                event.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            if (["w", "s"].includes(e.key))
                gameInstance.socket.emit("local-input", { player_side: "left", direction: "stop" });
            if (["ArrowUp", "ArrowDown"].includes(e.key))
                gameInstance.socket.emit("local-input", { player_side: "right", direction: "stop" });
        });
    }
    const resumeButton = document.getElementById("resume-button");
    if (gameInfo.mode !== 'remoteGame' && gameInfo.mode !== 'tournament') {
        document.addEventListener("keydown", (event) => {
            if (event.code === "Space" && gameInstance.startButton.classList.contains("hidden")) {
                gameInfo.state.isPaused = !(gameInfo.state.isPaused);
                if (gameInfo.state.isPaused) {
                    gameInstance.socket.emit("pause-resume", { status: "pause" });
                    // Duraklatıldığında "devam et" butonunu göster
                    resumeButton.classList.remove("hidden");
                    gameInstance.newmatchButton.classList.remove("hidden");
                    gameInstance.turnToHomePage.classList.remove("hidden");
                }
                else {
                    gameInstance.socket.emit("pause-resume", { status: "resume" });
                    // Devam edildiğinde butonu gizle
                    resumeButton.classList.add("hidden");
                    gameInstance.newmatchButton.classList.add("hidden");
                    gameInstance.turnToHomePage.classList.add("hidden");
                }
            }
        });
        resumeButton?.addEventListener("click", () => {
            gameInfo.state.isPaused = false;
            gameInstance.socket.emit("pause-resume", { status: "resume" });
            resumeButton.classList.add("hidden");
            gameInstance.newmatchButton.classList.add("hidden");
            gameInstance.turnToHomePage.classList.add("hidden");
        });
    }
    gameInstance.newmatchButton.addEventListener("click", () => {
        console.log(`yeni maça başlaya tıklandı, içerik : ${gameInstance.newmatchButton.innerText}`);
        resumeButton.classList.add("hidden");
        gameInstance.newmatchButton.classList.add("hidden");
        gameInstance.turnToHomePage.classList.add("hidden");
        if (gameInstance.startButton)
            gameInstance.startButton.classList.add("hidden");
        if (!gameInfo.state?.matchOver)
            gameInstance.socket.emit("reset-match");
        window.location.reload();
    });
    gameInstance.turnToHomePage.addEventListener("click", () => {
        resumeButton.classList.add("hidden");
        gameInstance.newmatchButton.classList.add("hidden");
        gameInstance.turnToHomePage.classList.add("hidden");
        if (gameInstance.startButton)
            gameInstance.startButton.classList.add("hidden");
        if (!gameInfo.state?.matchOver)
            gameInstance.socket.emit("reset-match");
        if (gameInfo.mode === 'tournament')
            window.history.pushState({}, '', '/tournament'); ///////////////////////////////////////////// Burası değişecek ! /////////////////////////////////////////
        else
            window.history.pushState({}, '', '/');
        window.location.reload();
    });
    console.log('Geri tuşuna basma eventi dinleiyor!');
    window.addEventListener('popstate', (event) => {
        console.log('Geri tuşuna basıldı!');
        if (!gameInfo.state?.matchOver)
            gameInstance.socket.emit("reset-match");
        window.location.reload();
    });
}
console.log('Geri tuşuna basma eventi dinleniyor!222');
window.addEventListener('popstate', (event) => {
    console.log('Geri tuşuna basıldı!23456');
    setTimeout(() => {
        gameInstance.socket.disconnect();
    }, 50);
    window.location.reload();
});
