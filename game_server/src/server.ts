import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";
import { error } from "console";
import { handleTournamentMatch } from "./tournament";
import { emitErrorToClient } from "./errorHandling";

export interface User {
  uuid: string;
  username: string;
  email?: string; 
  name?: string;
  surname?: string;
}

export interface IApiResponseWrapper
{
	success: boolean;
	message?: string;
	data?: any; // Data can be of any type, depending on the API response
}

 export class HTTPMethod extends String
 {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
export interface GameStatus {
	currentGameStarted: boolean;
	game_mode: GameMode;
	level?: string;
	tournamentCode?: string;
	tournamentName?: string;
	roundNo?: number;
	finalMatch?: boolean
};

export const players = new Map<string, Player>();

io.use(async (socket, next) =>
{
  try
  {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
      throw("Authentication error: token missing");
    }

    const response = await myFetch('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined , token);
    const data = await response.json();
    console.log(`Token validation response: \n ${JSON.stringify(data, null, 2)}`);

    if(!response.ok)
      throw("Token validation error: " + data.error);
 // 
    // console.log("uuid " + data.data.uuid);
    // console.log("username " + data.data.username);

    const user : User = {uuid: data.data.uuid, username: data.data.username};
    (socket as any).user = user;
    
    next();
  }
  catch(err: any)
  {
    console.log()
    return next(new Error("Authentication error: " + err.message));
  }
});


io.on("connection", socket =>
{
  const username = (socket as any).user.username;
  const uuid = (socket as any).user.uuid;
  let player : Player
 
  console.log("p ", players);
  console.log("u ", username);
  if (players.has(username))
  {
    socket.disconnect(true);
    console.log("connection is doubled");
    return
  }
  else
  {
    player = {socket, username, uuid}; //isPlaying : false};
    players.set(username, player);
  }

  console.log(`✔ Oyuncu bağlaasdndı: ${username} (ID: ${socket.id})`);

  socket.on("start", async (gameStatus : GameStatus) =>
  {
    console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
    if (gameStatus.game_mode === "vsAI")
      startGameWithAI(player, gameStatus.level!, io);
    else if (gameStatus.game_mode === "localGame")
      startLocalGame(player, io);
    else if (gameStatus.game_mode === "remoteGame")
      addPlayerToQueue(player, io, "remoteGame");
    else if (gameStatus.game_mode === 'tournament')
      handleTournamentMatch(player, io, gameStatus.tournamentCode!);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect geldi, ${socket.id} ayrıldı`);
    removePlayerFromQueue(player);
    players.delete(player.username);
  });

  // socket.on("disconnect", () => {
  //   removePlayerFromQueue(player);
  //   const username = (socket as any).user?.username;
  //   if (username && players.get(username)?.socket.id === socket.id) {
  //     players.delete(username);
  //     console.log(`Oyuncu bağlantısı kapandı: ${username}`);
  //   }
  //   });
  
});


export function myFetch(url: string, method: string, headers: HeadersInit, body?: BodyInit, token?: string): Promise<Response> {
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








