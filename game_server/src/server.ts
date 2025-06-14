import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// io.use((socket, next) => {
//   // Look for the token in either place:
//   //  1) Socket.IO auth payload   io("url", { auth: { token } })
//   //  2) Standard HTTP header     Authorization: Bearer <token>
//   const authHeader = socket.handshake.headers["authorization"] as
//     | string
//     | undefined;
//   const tokenFromHeader =
//     authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
//   const token = socket.handshake.auth?.token || tokenFromHeader;

//   if (!token) {
//     return next(new Error("Authentication error: token missing"));
//   }

//   try {
//     const payload = fetch(
//     "https://example.com/verify-token",
//   {
//       method: "POST", body: JSON.stringify({ token }),
//       headers: { "Content-Type": "application/json" },
//     }).then(res => res.json());

//     // Make the decoded payload available to future handlers.
//     (socket as any).user = payload;
//     next();
//   } catch (err) {
//     next(new Error("Authentication error: invalid token"));
//   }
// });

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | 'tournament';
interface GameStatus {currentGameStarted: boolean; game_mode: GameMode, level?: string};

const players = new Map<string, Player>();

io.on("connection", socket =>
{
  socket.once("username", ({ username }) =>
  {
   
    const player: Player = { socket, username };
    players.set(socket.id, player);
    console.log(`oyuncu players a kaydedildi, player.socket.id = ${player.socket.id}`);

    socket.on("start", (gameStatus : GameStatus) =>
      {
        console.log(`gameStatus = {game_mode = ${gameStatus.game_mode}, level = ${gameStatus.level}}`);
        if (gameStatus.game_mode === "vsAI")
            startGameWithAI(player, gameStatus.level!, io);
        else if (gameStatus.game_mode === "localGame")
            startLocalGame(player, io);
        else if (gameStatus.game_mode === "remoteGame")
            addPlayerToQueue(player, io);
          //EKLEMEEE ////////////////////////////////////////////////////////
        //else if (gameStatus.game_mode === "tournament")
           //addPlayerToTournamentQueue(player, io);
      });

    socket.on("disconnect", () => {
    console.log(`disconnect geldi, ${socket.id} ayrıldı`);
    //cancelOngoingMatch(socket);
    removePlayerFromQueue(player);
    players.delete(player.socket.id);
    });

  });

  socket.on("disconnect", () =>
    {
    if (players.has(socket.id)) return; // Zaten yukarıda temizlenecek
    console.log(`[Server] Unregistered socket disconnected: ${socket.id}`);
    });
});
