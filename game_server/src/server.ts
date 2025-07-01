import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame, addPlayerToTournamentQueue} from "./matchmaking";
import { error } from "console";

export interface User {
  uuid: string;
  username: string;
  email?: string; 
  name?: string;
  surname?: string;
}


// Geliştirme amaçlı gizli anahtar (prod ortamında sunucuda saklanmalı)
const JWT_SECRET = 'DUMMY_SECRET_KEY_FOR_DEV_ONLY';
// TextEncoder ile Uint8Array olarak tutulacak anahtar
const secretKey = new TextEncoder().encode(JWT_SECRET);


const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
interface GameStatus {currentGameStarted: boolean; game_mode: GameMode, level?: string, tournamentCode?: string};

const players = new Map<string, Player>();

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
    return next(new Error("Authentication error: token missing"));
  }

  console.log(`game server a gelen token = ${token}`);

  try {
    const response = await myFetch('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined , token);

    if(!response.ok)
    {
      console.log("------------------------------");
      throw error;
    }

    console.log(response);
    const data = await response.json();

    console.log(data.data);
    console.log("uuid" + data.data.uuid);
    console.log("username" + data.data.username);
  
   const hasnasln : User = {uuid: data.data.uuid, username: data.data.username};
  (socket as any).user = hasnasln;

    next();
  }
   catch (err) {
    console.log(`[Server] Token doğrulanamadı. ID: ${socket.id}`);
    return next(new Error("Authentication error: invalid token"));
  }
});


io.on("connection", socket =>
{
  const username = (socket as any).user.username;
  const player: Player = { socket, username };
  players.set(username, player);

  console.log(`✔ Oyuncu bağlandı: ${username} (ID: ${socket.id})`);

   socket.on("start", async (gameStatus : GameStatus) =>
  {
    console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
    if (gameStatus.game_mode === "vsAI")
        startGameWithAI(player, gameStatus.level!, io, 'vsAI');
    else if (gameStatus.game_mode === "localGame")
        startLocalGame(player, io, 'localGame');
    else if (gameStatus.game_mode === "remoteGame" || gameStatus.game_mode === 'tournament')
        addPlayerToQueue(player, io);
  //   else if (gameStatus.game_mode === 'tournament')
  //   {
  //     console.log('---------------------');
  //     const response = await getTournament(gameStatus.tournamentCode!);
  //     if (!response.success)
  //   {
  //     console.log(response);
  //     throw error;
  //   }
  //     console.log(response);
  //     addPlayerToTournamentQueue(player, io, gameStatus.tournamentCode!);

  //  }
  });
  socket.on("disconnect", () => {
    console.log(`disconnect geldi, ${socket.id} ayrıldı`);
    removePlayerFromQueue(player);
    players.delete(player.socket.id);
  });
});


function myFetch(url: string, method: string, headers: HeadersInit, body?: BodyInit, token?: string): Promise<Response> {
		try{
			const options: RequestInit = {
				method,
				headers: {
					...headers,
          Authorization: token ? `Bearer ${token}` : '',
				},
			};
			if (body) {
				options.body = body;
			}
			console.log("Fetch URL:", url);
			console.log("Fetch Options:", options);
			return fetch(url, options)
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}
export interface IApiResponseWrapper {
	success: boolean;
	message?: string;
	data?: any; // Data can be of any type, depending on the API response
  }
 export class HTTPMethod extends String {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}
async function  getTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
  const result: IApiResponseWrapper = {success: false, message: '', data: null};
  try{
    const response = await myFetch(`http://tournament.transendence.com/api/tournament/${tournamentCode}`, HTTPMethod.GET, {
      'Content-Type': 'application/json',
      'bypass': 'bypassauth'
    });
    if (!response.ok)
    {
      console.log("getmedi");
    }
    const data = await response.json();
    console.log("gelen:", data);
    result.success = true;
    result.message = data.message;
    result.data = data.data;
    return result;
  } catch (error) {
    console.error('Error in getTournament:', error);
    throw error;
  }
}

