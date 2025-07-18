import { Server } from "socket.io";
import { createServer } from "http";
import { Player, MatchManager } from "./matchManager";
import { emitErrorToClient } from "./errorHandling";

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

export interface User {
  uuid: string;
  username: string;
  token: string;
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
  pingInterval: 1000,
  pingTimeout: 2000
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


export const matchManager = new MatchManager(io);


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
    if (!response.ok)
    {
      console.log("getmedi", response);
    }
    const data = await response.json();
    console.log(`Token validation response: \n ${JSON.stringify(data, null, 2)}`);

    if(!response.ok)
      throw("Token validation error: " + data.error);

    const user : User = {uuid: data.data.uuid, username: data.data.username, token: token};
    (socket as any).user = user;
    
    next();
  }
  catch(err: any)
  {
    console.log("Authentication error: " + err.message)
    return next(new Error("Authentication error: " + err.message));
  }
});


io.on("connection", socket =>
{
  const username = (socket as any).user.username;
  const uuid = (socket as any).user.uuid;
  const token = (socket as any).user.token;
  let player : Player
 
  if (matchManager.connectedPlayers.has(username))
  {
    emitErrorToClient("Şu anda oyun sunucusuna başka bir oturumdan bağlısınız. Yalnızca bir oturumdan oynayabilirsiniz !", socket.id, io);
    socket.disconnect(true);
    console.log("connection is doubled");
    return;
  }
  else
  {
    player = {socket, username, uuid, token, status: 'online', socketReady: false};
    matchManager.connectedPlayers.set(username, player);
  }

  console.log(`✔ Oyuncu bağlandı: ${username} (ID: ${socket.id})`);

  const myMatch = matchManager.getMatchByPlayer(player.username);
  if (myMatch && (myMatch.gameMode === 'remoteGame' || myMatch.gameMode === 'tournament') && (myMatch.state === 'in-progress' || myMatch.state === 'paused'))
  {
    try {matchManager.handleReconnect(player);}
    catch (err: any)
    {
      emitErrorToClient(err.message, socket.id, io);
      socket.disconnect(true);
      console.log(err.message);
    return;
    }
  }
  else
  {
    socket.on("start", async (gameStatus : GameStatus) =>
    {
      console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
      if (gameStatus.game_mode === "vsAI")
        matchManager.createMatchWithAI(player, gameStatus.level!);
      else if (gameStatus.game_mode === "localGame")
        matchManager.createLocalMatch(player);
      else if (gameStatus.game_mode === "remoteGame")
        matchManager.addPlayerToRemoteQueue(player);
      else if (gameStatus.game_mode === 'tournament')
        matchManager.handleTournamentMatch(player, gameStatus.tournamentCode!);
    });
  }

    socket.on("reset-match", () =>
    {
      const activeMatch = matchManager.getMatchByPlayer(player.username);
      if(activeMatch)
      {console.log(`reset-match emiti geldi, activeMatch var ve room = ${activeMatch.roomId}`);
        activeMatch.finishIncompleteMatch();
        matchManager.clearMatch(activeMatch);
      }
    });

    socket.on("disconnect", () =>
    {
      console.log(`disconnect geldi, ${socket.id} ayrıldı`);
      setTimeout(() =>
      {
        matchManager.handleDisconnect(player);
      }, 50);
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
			// console.log("Fetch URL:", url);
			// console.log("Fetch Options:", options);
			return fetch(url, options)
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}








