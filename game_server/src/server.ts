import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';


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
interface GameStatus {currentGameStarted: boolean; game_mode: GameMode, level?: string};

const players = new Map<string, Player>();

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log(`[Server] Token gönderilmedi. ID: ${socket.id}`);
    return next(new Error("Authentication error: token missing"));
  }

  try {
    const {payload} = await jwtVerify(token, secretKey);
    (socket as any).user = payload.user as User; // Socket'e custom bilgi ekliyoruz
    next();
  } catch (err) {
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

  socket.on("start", (gameStatus : GameStatus) =>
  {
    console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
    if (gameStatus.game_mode === "vsAI")
        startGameWithAI(player, gameStatus.level!, io, 'vsAI');
    else if (gameStatus.game_mode === "localGame")
        startLocalGame(player, io, 'localGame');
    else if (gameStatus.game_mode === "remoteGame")
        addPlayerToQueue(player, io);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect geldi, ${socket.id} ayrıldı`);
    removePlayerFromQueue(player);
    players.delete(player.socket.id);
  });
});



// const PORT = 3001;
// httpServer.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
// interface GameStatus {currentGameStarted: boolean; game_mode: GameMode, level?: string};

// const players = new Map<string, Player>();

// io.on("connection", socket =>
// {
//   socket.once("username", ({ username }) =>
//   {
   
//     const player: Player = { socket, username };
//     players.set(socket.id, player);
//     console.log(`oyuncu players a kaydedildi, player.socket.id = ${player.socket.id}  username = ${player.username}`);

//     socket.on("start", (gameStatus : GameStatus) =>
//       {
//         console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
//         if (gameStatus.game_mode === "vsAI")
//             startGameWithAI(player, gameStatus.level!, io, 'vsAI');
//         else if (gameStatus.game_mode === "localGame")
//             startLocalGame(player, io, 'localGame');
//         else if (gameStatus.game_mode === "remoteGame")
//             addPlayerToQueue(player, io);
//           //EKLEMEEE ////////////////////////////////////////////////////////
//         //else if (gameStatus.game_mode === "tournament")
//            //addPlayerToTournamentQueue(player, io);
//       });

//     socket.on("disconnect", () => {
//     console.log(`disconnect geldi, ${socket.id} ayrıldı`);
//     //cancelOngoingMatch(socket);
//     removePlayerFromQueue(player);
//     players.delete(player.socket.id);
//     });

//   });

//   socket.on("disconnect", () =>
//     {
//     if (players.has(socket.id)) return; // Zaten yukarıda temizlenecek
//     console.log(`[Server] Unregistered socket disconnected: ${socket.id}`);
//     });
// });
