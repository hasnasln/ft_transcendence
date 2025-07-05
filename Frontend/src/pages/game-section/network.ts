import { gameInstance, GameMode, game} from "../play";
import { io, Socket } from "socket.io-client";
import { _apiManager } from '../../api/APIManeger';

interface MatchPlayers
{
  left: {socketId: string, username: string};
  right: {socketId: string, username: string};
  roundNo?: number;
  finalMatch?: boolean
}

export  function createSocket(after: any): Socket
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

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      after();
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
      else if (err.message.includes("Game server error"))
          {
            alert("Aynı anda birden fazla oyuna katılamazsınız.");
            window.history.pushState({}, '', '/');
            window.location.reload();
          }
        else
      {
          alert("Bağlantı reddedildi: " + err.message);
          window.history.pushState({}, '', '/');
          window.location.reload();
      }
    });


    socket.on('tournamentError', (errorMessage : string) => {
      console.error('Tournament error:', errorMessage);
      gameInstance.info!.textContent = `Tournament error:, ${errorMessage}`;
      gameInstance.info!.classList.remove("hidden");
        setTimeout(() =>
        {
          gameInstance.info!.classList.add("hidden");
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


type Side = 'leftPlayer' | 'rightPlayer'

interface GameConstants {
  groundWidth: number;
  groundHeight: number;
  ballRadius: number;
  paddleWidth: number;
  paddleHeight: number;
}

interface GameState {
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


// interface Player
// {
//   socket: Socket;
//   username: string;
// }

export function waitForMatchReady(gameInstance: game): Promise<string>
{
   return new Promise((resolve) =>
    {
      gameInstance.socket!.on("match-ready", (matchPlayers : MatchPlayers) =>
        {console.log(`match-ready emiti geldi: matchPlayers.left.username = ${matchPlayers.left.username},  matchPlayers.right.username = ${matchPlayers.right.username},
          matchPlayers.roundNo = ${matchPlayers.roundNo}, matchPlayers.finalMatch = ${matchPlayers.finalMatch}`);
          const rival = matchPlayers.left.socketId === gameInstance.socket!.id ? matchPlayers.right.username : matchPlayers.left.username;
          if (gameInstance.tournamentMode)
            {
              gameInstance.gameStatus.finalMatch = matchPlayers.finalMatch!;
              gameInstance.gameStatus.roundNo = matchPlayers.roundNo;
              
              if(matchPlayers.finalMatch === true)
                gameInstance.info!.textContent = `Sıradaki maç: ${gameInstance.tournamentCode} final maçı : vs ${rival}`;
                
              else
                gameInstance.info!.textContent = `Sıradaki maç round : ${matchPlayers.roundNo} vs ${rival}`;
              }
               
          else
            gameInstance.info!.textContent = `${rival} ile eşleştin`;
          gameInstance.startButton!.innerHTML = `${rival} maçını oyna !`;
          gameInstance.startButton!.classList.remove("hidden");
          resolve(rival);
        });
    });
}


export function waitForRematchApproval(socket: Socket, rival: string): Promise<boolean>
{
  return new Promise((resolve) =>
    {
      gameInstance.info!.textContent = `Talebiniz ${rival} oyuncusuna iletildi.`;
      gameInstance.info!.classList.remove("hidden");
      setTimeout(() => { gameInstance.info!.textContent = `${rival} oyuncusunun onayı bekleniyor ...`; }, 1000);
      
      socket.on("rematch-ready", () =>
        {console.log("rematch-ready emiti geldi");
          gameInstance.info!.textContent = `Maç başlıyor`;
          setTimeout(() =>
            {
              gameInstance.info!.classList.add("hidden");
              resolve(true);
            }, 1000);
        });

      setTimeout(() =>
      {
        gameInstance.info!.textContent = `${rival} oyuncusundan onay gelmedi !`;
        setTimeout(() =>
        {
          gameInstance.info!.classList.add("hidden");
        }, 2000);
        resolve(false);
      }, 20000);   
  });
}


export function waitForGameInfoReady(gameInfo: GameInfo, socket: Socket): Promise<void>
{
	return new Promise((resolve) => {
		const tryResolve = () => {
			if (gameInfo.isReady()) {
				resolve();
			}
		};

		socket.on("gameConstants", (constants: GameConstants) => {
      console.log(`cliente  gameConstants geldi :
      groundWidth: ${constants.groundWidth},
       groundHeight: ${constants.groundHeight},
       ballRadius: ${constants.ballRadius},
       paddleWidth: ${constants.paddleWidth},
       paddleHeight: ${constants.paddleHeight}`);
			gameInfo.setConstants(constants);
			tryResolve();
		});

		socket.on("gameState", (state: GameState) => {
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

		socket.on("ballUpdate", (ballState: BallState) => {
			gameInfo.setBall(ballState);
			tryResolve();
		});

		socket.on("paddleUpdate", (data) => {
      const paddle:PaddleState = data;
			gameInfo.setPaddle(paddle);
			tryResolve();
		});
	});
}


export function prepareScoreBoards(gameInfo: GameInfo)
{
const blueTeam = document.getElementById("blue-team")!;
const redTeam = document.getElementById("red-team")!;

const blueTeam_s = document.getElementById("blue-team-s")!;
const redTeam_s = document.getElementById("red-team-s")!;

blueTeam.innerText = `${gameInfo.ballState?.usernames.left}`;
redTeam.innerText = `${gameInfo.ballState?.usernames.right}`;

blueTeam_s.innerText = `${gameInfo.ballState?.usernames.left}`;
redTeam_s.innerText = `${gameInfo.ballState?.usernames.right}`;
}
