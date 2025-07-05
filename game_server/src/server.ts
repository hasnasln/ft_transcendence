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

const players = new Map<string, Player>();

io.use(async (socket, next) =>
{
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
    return next(new Error("Authentication error: token missing"));
  }

  const response = await myFetch('http://auth.transendence.com/api/auth/validate', HTTPMethod.POST, {}, undefined , token);
  console.log(`Token validation response: \n ${response}`);
  const data = await response.json();

  if(!response.ok)
    return next(new Error("Token validation error: " + data.error));

  console.log("uuid " + data.data.uuid);
  console.log("username " + data.data.username);

  const user : User = {uuid: data.data.uuid, username: data.data.username};
  (socket as any).user = user;

  const username = (socket as any).user.username;
  const uuid = (socket as any).user.uuid;
  const player: Player = { socket, username, uuid };


  if (players.has(username)) {
    const existing = players.get(username);
    if (existing?.socket.connected) {
      return next(new Error("Game server error: You can not play two games at the same time"));
    } else {
      console.log("Önceki bağlantı kopmuş ama hala map'te. Güncelleniyor.");
      players.delete(username); // Güvenli temizlik
    }
  }
  players.set(username, player);
  
  next();
});


io.on("connection", socket =>
{
  const username = (socket as any).user.username;
  const player = players.get(username);
  if(!player)
    {
      console.log("Hata kodu : Oyuncu listede bulunamadı");
      emitErrorToClient("Hata kodu : Oyuncu listede bulunamadı", socket.id, io);
      socket.disconnect(); // Bu istemcinin bağlantısını keser
      return; 
    }

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
  // socket.on("disconnect", () => {
  //   console.log(`disconnect geldi, ${socket.id} ayrıldı`);
  //   removePlayerFromQueue(player);
  //   players.delete(player.username);
  // });

  socket.on("disconnect", () => {
    const username = (socket as any).user?.username;
    if (username && players.get(username)?.socket.id === socket.id) {
      removePlayerFromQueue(player);
      players.delete(username);
      console.log(`Oyuncu bağlantısı kapandı: ${username}`);
    }
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








