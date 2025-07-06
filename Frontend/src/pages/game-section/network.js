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
        if (err.message.includes("token missing")) {
            alert("Token eksik. Lütfen tekrar giriş yapın.");
            window.history.pushState({}, '', '/singin');
            window.location.reload();
        }
        else if (err.message.includes("Token validation error")) {
            alert("Token doğrulama hatası :" + err.message);
            window.history.pushState({}, '', '/singin');
            window.location.reload();
        }
        else if (err.message.includes("Game server error")) {
            alert("Aynı anda birden fazla oyuna katılamazsınız.");
            window.history.pushState({}, '', '/');
            window.location.reload();
        }
        else {
            alert("Bağlantı reddedildi: " + err.message);
            window.history.pushState({}, '', '/');
            window.location.reload();
        }
    });
    socket.on('tournamentError', (errorMessage) => {
        console.error('Tournament error:', errorMessage);
        gameInstance.info.textContent = `Tournament error:, ${errorMessage}`;
        gameInstance.info.classList.remove("hidden");
        setTimeout(() => {
            gameInstance.info.classList.add("hidden");
            window.history.pushState({}, '', '/tournament');
            window.location.reload();
        }, 5000);
    });
    // socket.on('waitingRematch', (rival: string) =>
    // {
    //     const answer = window.confirm(`${rival} oyuncusundan tekrar maç isteği geldi. Oynamak istermisin ?`);
    //   if (answer) {
    //   } else {
    //     console.log("Kullanıcı reddetti (No)");
    //   }
    // });
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
export function waitForMatchReady(gameInstance) {
    return new Promise((resolve) => {
        gameInstance.socket.on("match-ready", (matchPlayers) => {
            console.log(`match-ready emiti geldi: matchPlayers.left.username = ${matchPlayers.left.username},  matchPlayers.right.username = ${matchPlayers.right.username},
          matchPlayers.roundNo = ${matchPlayers.roundNo}, matchPlayers.finalMatch = ${matchPlayers.finalMatch}`);
            const rival = matchPlayers.left.socketId === gameInstance.socket.id ? matchPlayers.right.username : matchPlayers.left.username;
            if (gameInstance.tournamentMode) {
                gameInstance.gameStatus.finalMatch = matchPlayers.finalMatch;
                gameInstance.gameStatus.roundNo = matchPlayers.roundNo;
                if (matchPlayers.finalMatch === true)
                    gameInstance.info.textContent = `Sıradaki maç: ${gameInstance.tournamentCode} final maçı : vs ${rival}`;
                else
                    gameInstance.info.textContent = `Sıradaki maç round : ${matchPlayers.roundNo} vs ${rival}`;
            }
            else
                gameInstance.info.textContent = `${rival} ile eşleştin`;
            gameInstance.startButton.innerHTML = `${rival} maçını oyna !`;
            gameInstance.startButton.classList.remove("hidden");
            resolve(rival);
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
      matchWinner: ${state.matchWinner},
      matchDisconnection: ${state.matchDisconnection},
      roundNumber: ${state.roundNumber}`);
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
