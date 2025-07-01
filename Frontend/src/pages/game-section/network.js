import { gameInstance } from "../play";
import { io } from "socket.io-client";
import { _apiManager } from '../../api/APIManeger';
export function createSocket(after) {
    // 1) Token’ı alın
    const token = _apiManager.getToken();
    if (!token) {
        throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    // 2) Socket.IO bağlantısını auth ile oluşturun
    const socket = io('http://game.transendence.com', {
        auth: { token }
    });
    socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
        after();
    });
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        // Örneğin token geçersizse server 401 dönebilir, burada logout ve redirect yapabilirsiniz
    });
    return socket;
}
export class GameInfo {
    constants = null;
    state = null;
    ballState = null;
    paddle = null;
    mode;
    nextSetStartedFlag = false;
    constructor(mode) {
        this.mode = mode;
    }
    /** Constants geldiğinde ata */
    setConstants(c) {
        this.constants = c;
    }
    /** State geldiğinde ata */
    setState(g) {
        this.state = g;
    }
    setBall(b) {
        this.ballState = b;
    }
    setPaddle(p) {
        this.paddle = p;
    }
    /** bilgiler hazır mı? */ // BUNA GÖRE GAME LOOP BAŞLATILACAK !!!!!!!!!!!!!!!!!!
    isReady() {
        return Boolean(this.constants && this.state && this.ballState && this.paddle);
    }
}
// interface Player
// {
//   socket: Socket;
//   username: string;
// }
export function waitForMatchReady(socket, tournamentMode) {
    return new Promise((resolve) => {
        socket.on("match-ready", (matchPlayers) => {
            console.log("match-ready emiti geldi");
            //const rival = matchPlayers.left.socketId === socket.id ? matchPlayers.right.username : matchPlayers.left.username; // unique olan bişeye göre ayarlanacak !!!
            // if (tournamentMode)
            //   gameInstance.info!.textContent = `Sıradaki maç :  round : ????  vs ${rival}`;
            // else
            gameInstance.info.textContent = `biriyle ile eşleştin`;
            gameInstance.startButton.innerHTML = `biriyle maçını oyna !`;
            gameInstance.startButton.classList.remove("hidden");
            resolve("anan");
        });
    });
}
export function waitForRematchApproval(socket, rival) {
    return new Promise((resolve) => {
        gameInstance.info.textContent = `Talebiniz ${rival} oyuncusuna iletildi.`;
        gameInstance.info.classList.remove("hidden");
        setTimeout(() => { gameInstance.info.textContent = `${rival} oyuncusunun onayı bekleniyor ...`; }, 1000);
        socket.on("rematch-ready", () => {
            console.log("rematch-ready emiti geldi");
            gameInstance.info.textContent = `Maç başlıyor`;
            setTimeout(() => {
                gameInstance.info.classList.add("hidden");
                resolve(true);
            }, 1000);
        });
        setTimeout(() => {
            gameInstance.info.textContent = `${rival} oyuncusundan onay gelmedi !`;
            setTimeout(() => {
                gameInstance.info.classList.add("hidden");
            }, 2000);
            resolve(false);
        }, 20000);
    });
}
export function waitForGameInfoReady(gameInfo, socket) {
    return new Promise((resolve) => {
        const tryResolve = () => {
            if (gameInfo.isReady()) {
                resolve();
            }
        };
        socket.on("gameConstants", (constants) => {
            console.log(`cliente  gameConstants geldi :
      groundWidth: ${constants.groundWidth},
       groundHeight: ${constants.groundHeight},
       ballRadius: ${constants.ballRadius},
       paddleWidth: ${constants.paddleWidth},
       paddleHeight: ${constants.paddleHeight}`);
            gameInfo.setConstants(constants);
            tryResolve();
        });
        socket.on("gameState", (state) => {
            console.log(`client e gameState geldi:
      matchOver: ${state.matchOver},
      setOver: ${state.setOver},
      isPaused: ${state.isPaused},
      inCompletWinner: ${state.inCompleteWinner}`);
            if (state.matchOver)
                console.log(`matchOver TRUE geldi..........`);
            gameInfo.setState(state);
            tryResolve();
        });
        socket.on("ballUpdate", (ballState) => {
            gameInfo.setBall(ballState);
            tryResolve();
        });
        socket.on("paddleUpdate", (data) => {
            const paddle = data;
            gameInfo.setPaddle(paddle);
            tryResolve();
        });
    });
}
export function prepareScoreBoards(gameInfo) {
    const blueTeam = document.getElementById("blue-team");
    const redTeam = document.getElementById("red-team");
    const blueTeam_s = document.getElementById("blue-team-s");
    const redTeam_s = document.getElementById("red-team-s");
    blueTeam.innerText = `${gameInfo.ballState?.usernames.left}`;
    redTeam.innerText = `${gameInfo.ballState?.usernames.right}`;
    blueTeam_s.innerText = `${gameInfo.ballState?.usernames.left}`;
    redTeam_s.innerText = `${gameInfo.ballState?.usernames.right}`;
}
