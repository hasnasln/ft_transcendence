import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";
import { error } from "console";
import { handleTournamentMatch } from "./tournament";

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

const players = new Map<string, Player>();

io.use(async (socket, next) =>
{
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
    return next(new Error("Authentication error: token missing"));

  }

  try
  {
      const response = await myFetch('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined , token);

      if(!response.ok)
        throw error;
      console.log(`Token validation response: \n ${response}`);
      const data = await response.json();

      console.log("uuid " + data.data.uuid);
      console.log("username " + data.data.username);
    
      const user : User = {uuid: data.data.uuid, username: data.data.username};
      (socket as any).user = user;
      next();
  }
   catch (err)
  {
    console.log(`[Server] Token doğrulanamadı. ID: ${socket.id}`);
    return next(new Error("Authentication error: invalid token"));
  }
});


io.on("connection", socket =>
{
  const username = (socket as any).user.username;
  const uuid = (socket as any).user.uuid;
  const player: Player = { socket, username, uuid };
  players.set(username, player);

  console.log(`✔ Oyuncu bağlandı: ${username} (ID: ${socket.id})`);

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
    players.delete(player.socket.id);
  });
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








