import { GameMode, Game} from "../play";
import { io, Socket } from "socket.io-client";
import { _apiManager } from '../../api/APIManeger';

interface MatchPlayers
{
  left: {socketId: string, username: string};
  right: {socketId: string, username: string};
  roundNo?: number;
  finalMatch?: boolean
}

export  function createSocket(game: Game, after: any): Socket
{
    // 1) Token’ı alın
    const token = _apiManager.getToken();
    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }


    // 2) Socket.IO bağlantısını auth ile oluşturun
  const socket = io('http://localhost:3001', {
      auth: { token }
    });

  let firstConnect = true;

    socket.on('connect', () =>
    {
      if (firstConnect)
      {
        console.info("🎉 İlk bağlantı kuruldu:", socket.id);
        firstConnect = false;
        after();
      }
      else
      {
        console.info("🔄 Yeniden bağlanıldı:", socket.id);
        game.socket = socket;
        game.resumeAfterReconnect();
      }
    });

    socket.on('connect_error', (err) =>
    {
      console.error('Socket connection error:', err.message);

      if (err.message.includes("token missing"))
        {
          alert("Token eksik. Lütfen tekrar giriş yapın.");
          window.history.pushState({}, '', '/singin');
          window.location.reload();
        }
      else if (err.message.includes("Token validation error"))
        {
          alert("Token doğrulama hatası :" + err.message);
          window.history.pushState({}, '', '/singin');
          window.location.reload();
        }
      else
        {
            alert("Oyun sunucusu bağlantısı reddedildi: " + err.message);
            window.history.pushState({}, '', '/');
            window.location.reload();
        }
    });
  
    window.addEventListener("offline", () =>
    {
      socket.disconnect();
      console.warn("🔌 Tarayıcı offline oldu");
      game.handleNetworkPause();
    });

    window.addEventListener("online", () =>
    {
      console.info("🔌 Tarayıcı tekrar online");
      socket.connect();
      game.info!.textContent = "Tekrar bağlanılıyor…";
      game.info!.classList.remove("hidden");
    });

    // 5️⃣ Socket.IO disconnect: heartbeat veya manuel disconnect
    socket.on("disconnect", (reason: string) =>
    {
      console.warn("🔌 disconnect:", reason);
      // Eğer sunucu kaynaklıysa (örn. io server disconnect), direkt yönlendir
      if (reason === "io server disconnect") {
        alert("Sunucu tarafından bağlantı kesildi. Ana sayfaya dönülüyor.");
        window.history.pushState({}, '', '/');
        window.location.reload();
        return;
      }
      // Aksi halde (ping timeout, transport close vb.) pause
      game.handleNetworkPause();
    });

    socket.on('gameServerError', (errorMessage : string) =>
    {
      console.error(errorMessage);
      alert("HATA : " + errorMessage);
          window.history.pushState({}, '', '/');
          window.location.reload();
    });

    return socket;
}


type Side = 'leftPlayer' | 'rightPlayer'

interface GameConstants {
  groundWidth: number;
  groundHeight: number;
  ballRadius: number;
  paddleWidth: number;
  paddleHeight: number;
}

export interface GameState {
  matchOver: boolean;
  setOver: boolean;
  isPaused: boolean;
  matchWinner?: Side;
  matchDisconnection: boolean;
  roundNumber?: number;
}


interface BallState {
  bp: {x: number, y: number};
  bv: {x: number, y: number};
  points: { leftPlayer: number, rightPlayer: number };
  sets: { leftPlayer: number, rightPlayer: number };
  usernames: {left: String, right: String}
  py: number;
}

interface PaddleState {
  p1y: number;
  p2y: number;
}

export class GameInfo
{
  constants: GameConstants | null = null;
  state: GameState | null = null;
  ballState: BallState | null = null;
  paddle: PaddleState | null = null;
  mode: GameMode;
  nextSetStartedFlag: boolean = false;

  constructor(mode: GameMode)
  {
    this.mode = mode;
  }
  /** Constants geldiğinde ata */
  setConstants(c: GameConstants)
  {
    this.constants = c;
  }

  /** State geldiğinde ata */
  setState(g: GameState)
  {
    this.state = g;
  }

  setBall(b: BallState)
  {
    this.ballState = b;
  }

  setPaddle(p: PaddleState)
  {
    this.paddle = p;
  }

  /** bilgiler hazır mı? */ // BUNA GÖRE GAME LOOP BAŞLATILACAK !!!!!!!!!!!!!!!!!!
  isReady() {
    return Boolean(this.constants && this.state && this.ballState && this.paddle);
  }
}

export function waitForMatchReady(game: Game): Promise<string>
{
   return new Promise((resolve) =>
    {
      game.socket!.on("match-ready", (matchPlayers : MatchPlayers) =>
        {console.log(`match-ready emiti geldi: matchPlayers.left.username = ${matchPlayers.left.username},  matchPlayers.right.username = ${matchPlayers.right.username},
          matchPlayers.roundNo = ${matchPlayers.roundNo}, matchPlayers.finalMatch = ${matchPlayers.finalMatch}`);
          const rival = matchPlayers.left.socketId === game.socket!.id ? matchPlayers.right.username : matchPlayers.left.username;
          if (game.tournamentMode)
            {
              game.gameStatus.finalMatch = matchPlayers.finalMatch!;
              game.gameStatus.roundNo = matchPlayers.roundNo;
              
              if(matchPlayers.finalMatch === true)
                game.info!.textContent = `Sıradaki maç: ${game.tournamentCode} final maçı : vs ${rival}`;
                
              else
                game.info!.textContent = `Sıradaki maç round : ${matchPlayers.roundNo} vs ${rival}`;
              }
               
          else
            game.info!.textContent = `${rival} ile eşleştin`;
          game.startButton!.innerHTML = `${rival} maçını oyna !`;
          game.startButton!.classList.remove("hidden");
          resolve(rival);
        });
    });
}


export function waitForMatchApproval(game : Game): Promise<void>
{
  return new Promise((resolve) =>
    {
      game.info!.textContent = `Talebiniz ${game.rival} oyuncusuna iletildi.`;
      game.info!.classList.remove("hidden");
      setTimeout(() => { game.info!.textContent = `${game.rival} oyuncusunun onayı bekleniyor ...`; }, 1000);
      
      game.socket!.on("match-starting", () =>
        {console.log("match-starting emiti geldi");
          game.info!.textContent = `Maç başlıyor`;
          setTimeout(() =>
            {
              game.info!.classList.add("hidden");
            }, 1000);
            resolve();
        });
    });
}


export function waitForGameInfoReady(game: Game): Promise<void>
{
	return new Promise((resolve) => {
		const tryResolve = () => {
			if (game.gameInfo!.isReady()) {
				resolve();
			}
		};

		game.socket!.on("gameConstants", (constants: GameConstants) => {
			game.gameInfo!.setConstants(constants);
			tryResolve();
		});

		game.socket!.on("gameState", (state: GameState) => {
      if (state.matchOver)
        console.log(`matchOver TRUE geldi..........`);
			game.gameInfo!.setState(state);
			tryResolve();
		});

		game.socket!.on("ballUpdate", (ballState: BallState) => {
			game.gameInfo!.setBall(ballState);
			tryResolve();
		});

		game.socket!.on("paddleUpdate", (data) => {
      const paddle:PaddleState = data;
			game.gameInfo!.setPaddle(paddle);
			tryResolve();
		});
	});
}


export function prepareScoreBoards(game: Game)
{
  if (!game.gameInfo) return;
  const blueTeam = document.getElementById("blue-team")!;
  const redTeam = document.getElementById("red-team")!;

  const blueTeam_s = document.getElementById("blue-team-s")!;
  const redTeam_s = document.getElementById("red-team-s")!;

  blueTeam.innerText = `${game.gameInfo.ballState?.usernames.left}`;
  redTeam.innerText = `${game.gameInfo.ballState?.usernames.right}`;

  blueTeam_s.innerText = `${game.gameInfo.ballState?.usernames.left}`;
  redTeam_s.innerText = `${game.gameInfo.ballState?.usernames.right}`;
}
