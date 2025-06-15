import { gameInstance, GameMode} from "../play";
import { io, Socket } from "socket.io-client";
import { _apiManager } from '../../api/APIManeger';
import { verifyDevToken } from '../../tokenUtils'; // mock verify fonksiyonunuzun yolu


export async function createSocket(): Promise<Socket>
{
  // 1) Token’ı alın
  const token = _apiManager.getToken();
  if (!token) {
    throw new Error('Token bulunamadı. Lütfen giriş yapın.');
  }

  // (Opsiyonel) client-side’da da kısmi bir doğrulama yapmak isterseniz:
  const payload = await verifyDevToken(token);
  if (!payload) {
    throw new Error('Token geçersiz veya süresi dolmuş.');
  }

  // 2) Socket.IO bağlantısını auth ile oluşturun
  const socket = io('http://localhost:3001', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);

  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    // Örneğin token geçersizse server 401 dönebilir, burada logout ve redirect yapabilirsiniz
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

interface GameState {
  matchOver: boolean;
  setOver: boolean;
  isPaused: boolean;
  inCompleteWinner?: Side;
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


export function waitForMatchReady(socket: Socket, username: string): Promise<string>
{
   return new Promise((resolve) =>
    {
    	socket.on("match-ready", (matchPlayers : {left: string, right: string}) =>
        {console.log("match-ready emiti geldi");
          const rival = matchPlayers.left === username ? matchPlayers.right : matchPlayers.left;
          gameInstance.info!.textContent = `${rival} ile eşleştin`;
          gameInstance.startButton!.innerHTML = `${rival} ile oyna !`;
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
      inCompletWinner: ${state.inCompleteWinner}`);
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
