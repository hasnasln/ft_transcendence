import { Socket } from "socket.io";
import { Game, Paddle } from "./game";
import { Server } from "socket.io";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameMode } from "./server";
import { getTournament, findMyMatch, joinMatchByCode } from "./tournament";
import { emitErrorToClient } from "./errorHandling";

export interface Player {
  socket: Socket;
  username: string;
  uuid: string;
  token: string;
  status: 'online' | 'offline';
  socketReady: boolean;
}

interface MatchPlayers {
  left: { socketId: string, username: string };
  right: { socketId: string, username: string };
  roundNo?: number;
  finalMatch?: boolean
}

export class Match {
  roomId: string;
  players: [Player, Player];
  state: 'waiting' | 'in-progress' | 'paused' | 'completed' = 'waiting';
  startTime: number | null = null;
  game: Game | null = null;
  gameMode: GameMode | null = null;
  level?: string;
  reMatch = false;
  readyTimeout: NodeJS.Timeout | null = null;
  tournament?: { code: string, roundNo: number, finalMatch: boolean }

  constructor(roomId: string, player1: Player, player2: Player) {
    this.roomId = roomId;
    this.players = [player1, player2];
  }

  start() {
    this.state = 'in-progress';
    this.startTime = Date.now();
    if (this.game) {
      this.game.startGameLoop();
    }
    // Oyun başlatma logic'i
  }

  pause() {
    this.state = 'paused';
    if (this.game)
      this.game.pauseGameLoop();
  }

  resume() {
    this.state = 'in-progress';
    if (this.game)
      this.game.resumeGameLoop();
  }

  finishIncompleteMatch(username?: string) {
    this.state = 'completed';
    if (this.game) {
      this.game.finishIncompleteMatch(username);
      this.game = null;
    }
  }

  end() {
    this.state = 'completed';
    if (this.game)
      this.game = null;
  }
}

export class MatchManager {
  public connectedPlayers: Map<string, Player> = new Map();
  public reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private matchesByRoom: Map<string, Match> = new Map();
  public roomsByUsername: Map<string, string> = new Map();
  private waitingRemotePlayers: Map<string, Player> = new Map();
  private waitingTournamentMatches: Map<string, Map<string, Player>> = new Map();
  private io: Server;

  constructor(io: Server) { this.io = io; }

  createMatchWithAI(human: Player, level: string) {
    const roomId = `room_${human.username}_vs_AI_${level}`;
    const match = new Match(roomId, human, human);
    match.gameMode = 'vsAI';
    match.level = level;
    this.matchesByRoom.set(roomId, match);
    this.roomsByUsername.set(human.username, roomId);
    human.socket.join(roomId);

    // Yeni bir oyun başlat
    human.socket.on("ready", () => {
      let getGame: () => Game;
      let getPaddle: () => Paddle;

      const leftInput = new RemotePlayerInput(human);
      const rightInput = new AIPlayerInput(() => getGame!(), () => getPaddle!(), "AI", level);

      match.game = new Game(leftInput, rightInput, this.io, roomId, 'vsAI', match);
      getGame = () => match.game!;
      getPaddle = () => match.game!.getPaddle2();
      match.start();
    });
  }

  createLocalMatch(player1: Player) {
    const roomId = `game_${player1.socket.id}_vs_friend`;
    const match = new Match(roomId, player1, player1);
    match.gameMode = 'localGame';
    this.matchesByRoom.set(roomId, match);
    this.roomsByUsername.set(player1.username, roomId);
    player1.socket.join(roomId);

    player1.socket.on("ready", () => {
      const leftInput = new LocalPlayerInput(player1, "left");
      const rightInput = new LocalPlayerInput(player1, "right");
      match.game = new Game(leftInput, rightInput, this.io, roomId, 'localGame', match);
      match.start();
    });
  }

  addPlayerToRemoteQueue(player: Player) {
    this.waitingRemotePlayers.set(player.username, player);
    console.log(`oyuncu waitingRemotePlayers a kaydedildi, player.socket.id = ${player.username}`);
    this.checkForRemoteMatch(this.waitingRemotePlayers);
  }

  removePlayerFromRemoteQueue(player: Player) {
    const checkPlayer = this.waitingRemotePlayers.get(player.username);
    if (typeof (checkPlayer) === 'undefined') {
      return;
    }
    this.waitingRemotePlayers.delete(player.username);
  }


  checkForRemoteMatch(waitingsMap: Map<string, Player>, tournament?: { code: string, roundNo: number, finalMatch: boolean }) {
    while (waitingsMap.size >= 2) {
      const player1 = mapShift(waitingsMap);
      const player2 = mapShift(waitingsMap);
      if (player1 && player2) {
        const roomId = `room_${player1.username}_${player2.username}`;
        const match = new Match(roomId, player1, player2);
        match.tournament = tournament;
        if (tournament)
          match.gameMode = 'tournament';
        else
          match.gameMode = 'remoteGame';
        this.matchesByRoom.set(roomId, match);
        this.roomsByUsername.set(player1.username, roomId);
        this.roomsByUsername.set(player2.username, roomId);
        player1.socket.join(roomId);
        player2.socket.join(roomId);

        const matchPlayers: MatchPlayers =
        {
          left: { socketId: player1.socket.id, username: player1.username },
          right: { socketId: player2.socket.id, username: player2.username },
          roundNo: tournament?.roundNo,
          finalMatch: tournament?.finalMatch
        };
        console.log(`matchPlayers.left.username = ${matchPlayers.left.username},  matchPlayers.right.username = ${matchPlayers.right.username},
          matchPlayers.roundNo = ${matchPlayers.roundNo}, matchPlayers.finalMatch = ${matchPlayers.finalMatch}`);

        this.io.to(roomId).emit("match-ready", matchPlayers);
        this.waitForRemoteMatchApproval(player1, false);
      }
    }
  }

  waitForRemoteMatchApproval(player: Player, secondCall: boolean) {
    const match = this.getMatchByPlayer(player.username);
    if (!match)
      return;
    const other = player.username === match.players[0].username ? match.players[1] : match.players[0];
    player.socket.on("ready", () => {
      if (match.state === 'completed' || match.state === 'waiting') {
        player.socketReady = true;
        console.log(`${player.username} hazır`);
        if (match.gameMode === 'tournament') {
          try {
            joinMatchByCode(player.token, match.tournament?.code as string, match.tournament?.roundNo as number, { uuid: player.uuid, username: player.username });
          }
          catch (err: any) {
            emitErrorToClient(err.message, match.roomId, this.io);
          }
        }

        if (match.reMatch && match.gameMode === 'remoteGame' && !other.socketReady) {
          this.io.to(other.socket.id).emit("waitingRematch", other.username);
          console.log(`${other.username} ye waitingRematch emiti gitti  other.socketReady = ${other.socketReady}`);
        }

        if (!match.readyTimeout) {
          match.readyTimeout = setTimeout(() => {
            console.log(`setTimeout ${player.username} tarafından başlatıldı, şimdi ${other.username}.socketReady = ${other.socketReady}`);
            this.cancelRemoteMatch(other.socket.id, match, "waiting approval");
          }, 20_000);
        }
        if (other.socketReady && player.socketReady)
          this.startRemoteMatch(match);
      }
    });

    player.socket.on("cancel", () => {
      clearTimeout(match.readyTimeout!);
      match.readyTimeout = null;
      this.cancelRemoteMatch(player.socket.id, match, 'refuse');
    });

    if (!secondCall)
      this.waitForRemoteMatchApproval(other, true);
  }

  startRemoteMatch(match: Match) {
    const player1 = match.players[0];
    const player2 = match.players[1]!;
    if (match.readyTimeout)
      clearTimeout(match.readyTimeout);
    match.readyTimeout = null;
    if (match.state === 'in-progress' || match.state === 'paused')
      return;
    if (!player1.socketReady || !player2.socketReady)
      return;
    console.log(`${player1.username} vs ${player2.username} maçı için her iki socket de hazır!`);
    this.io.to(match.roomId).emit("match-starting");

    const leftInput = new RemotePlayerInput(player1);
    const rightInput = new RemotePlayerInput(player2);

    if (match.tournament !== undefined) {
      match.game = new Game(leftInput, rightInput, this.io, match.roomId, 'tournament', match);
      match.start();
    }
    else {
      match.game = new Game(leftInput, rightInput, this.io, match.roomId, 'remoteGame', match);
      match.start();
    }
    match.reMatch = true;
    player1.socketReady = false;
    player2.socketReady = false;
  }

  cancelRemoteMatch(cancellerId: string, match: Match, cancelMode: string) {
    if (match.readyTimeout)
      clearTimeout(match.readyTimeout);
    match.readyTimeout = null;
    if (match.state === 'in-progress' || match.state === 'paused')
      return;
    console.log(`${match.players[0].username} vs ${match.players[1].username} maçı iptal edildi cancelMode = ${cancelMode}`);
    const data: { cancellerId: string, rematch: boolean, mode: string } = { cancellerId: cancellerId, rematch: match.reMatch, mode: cancelMode };
    if (this.io.to(match.roomId).emit("match-cancelled", data))
      this.clearMatch(match);

  }

  async handleTournamentMatch(player: Player, tournamentCode: string) {
    try {
      const response = await getTournament(tournamentCode!);
      if (!response.success)
        throw new Error(`Could not get the tournament with code : ${tournamentCode}`);

      const match_id = findMyMatch(response.data, player.uuid).match_id;
      if (!match_id) {
        this.io.to(player.socket.id).emit("goToNextRound");
        return;
      }

      if (!this.waitingTournamentMatches.has(match_id))
        this.waitingTournamentMatches.set(match_id, new Map<string, Player>());
      const myMatchMap = this.waitingTournamentMatches.get(match_id);
      if (!myMatchMap) {
        throw new Error(`Maç bulunamadı: match_id = ${match_id}`);
      }
      myMatchMap.set(player.username, player);
      myMatchMap.forEach((value, key) => {
        console.log(`Key: ${key}, Value: {${value.socket}, ${value.username}, ${value.uuid}`);
      });

      if (myMatchMap.size > 2)
        throw new Error(`Bir şeyler ters gitti ! myMatchMap.size 2 den büyük olamaz, şu an ${myMatchMap.size}`);
      const roundNumber = findMyMatch(response.data, player.uuid).roundNumber;
      const finalMatch = findMyMatch(response.data, player.uuid).finalMatch;
      const tournament = { code: tournamentCode, roundNo: roundNumber, finalMatch: finalMatch };
      this.checkForRemoteMatch(myMatchMap, tournament);
    }
    catch (err: any) {
      console.error("Hata kodu:", err.message);
      emitErrorToClient(err.message, player.socket.id, this.io);
    }
  }

  handleDisconnect(player: Player) {
    this.connectedPlayers.delete(player.username);
    player.status = 'offline';
    const myMatch = this.getMatchByPlayer(player.username);
    if (myMatch) {
      console.log(`handleDisconnect e geldik (${player.username}): myMatch var ve myMatch.roomId = ${myMatch.roomId},  myMatch.state = ${myMatch.state}, myMatch.gameMode = ${myMatch.gameMode}`);
      if (myMatch.gameMode === 'vsAI' || myMatch.gameMode === 'localGame') {
        myMatch.finishIncompleteMatch();
        this.clearMatch(myMatch);
        return;
      }
      else {
        const opponent = player.username === myMatch.players[0].username ? myMatch.players[1] : myMatch.players[0];
        switch (myMatch.state) {
          case 'waiting':
            this.cancelRemoteMatch(player.socket.id, myMatch, 'disconnect');
            break;
          case 'in-progress':
          case 'paused':
            myMatch.pause();
            const res = this.io.to(opponent.socket.id).emit("opponent-disconnected");
            console.log(`${opponent.username} e opponent-disconnect gitti, opponent.socket.id = ${opponent.socket.id} res = ${res}`);
            const cancelTimeout1 = setTimeout(() => {
              myMatch.finishIncompleteMatch(opponent.username);
              this.clearMatch(myMatch);
            }, 15000);
            this.reconnectTimers.set(player.username, cancelTimeout1);
            break;
          case 'completed':
            if (myMatch.gameMode === 'tournament')
              this.clearMatch(myMatch);
            else {
              const cancelTimeout2 = setTimeout(() => {
                this.clearMatch(myMatch);
              }, 15000);
              this.reconnectTimers.set(player.username, cancelTimeout2);
            }
            break;
        }
      }
    }
    else {
      this.removePlayerFromRemoteQueue(player);
      console.log(`handleDisconnect e geldik (${player.username}): myMatch yokmuş`);
    }
  }


  handleReconnect(player: Player) {
    player.status = 'online';
    const roomId = this.roomsByUsername.get(player.username);

    const myMatch = this.matchesByRoom.get(roomId!);
    console.log(`handleReconnect e geldik (${player.username}): roomId = ${roomId}, myMatch.state = ${myMatch?.state}`);

    if (myMatch) {
      const me = player.username === myMatch.players[0].username ? myMatch.players[0] : myMatch.players[1];
      const opponent = player.username === myMatch.players[0].username ? myMatch.players[1] : myMatch.players[0];
      // me.socket.leave(roomId!);
      me.socket = player.socket;
      me.socket.join(roomId!);

      // opponent.socket.removeAllListeners("ready");
      // opponent.socket.removeAllListeners("cancel");
      this.waitForRemoteMatchApproval(me, true);

      const input = new RemotePlayerInput(me);
      myMatch.game!.leftInput.getUsername() === me.username ? myMatch.game!.leftInput = input : myMatch.game!.rightInput = input;

      me.socket.on("reload-ready", () => {
        this.io.to(opponent.socket.id).emit("opponent-reconnected");
        myMatch.game?.exportGameConstants();
        myMatch.game?.exportBallState();
        myMatch.game?.exportPaddleState();
        myMatch.game?.exportGameState();
        const timeOut = this.reconnectTimers.get(me.username);
        if (timeOut) {
          clearTimeout(timeOut);
          this.reconnectTimers.delete(me.username);
        }

        setTimeout(() => {
          myMatch.resume();
        }, 1000);
      })
    }
    else {
      throw new Error("Yarım kalan maçınız bulunamadı, bitmiş veya silinmiş olabilir. Tekrar bağlanınız");
    }
  }

  clearMatch(match: Match) {
    const player1 = match.players[0];
    const player2 = match.players[1];
    this.matchesByRoom.delete(match.roomId);
    this.roomsByUsername.delete(player1.username);
    this.roomsByUsername.delete(player2.username);
    // player1.socket.leave(match.roomId);
    // player2.socket.leave(match.roomId);
    player1.socketReady = false;
    player2.socketReady = false;
  }

  getMatchByRoom(roomId: string): Match | undefined {
    return this.matchesByRoom.get(roomId);
  }

  // removeMatch(roomId: string)
  // {
  //   this.matchesByRoom.delete(roomId);
  // }

  getMatchByPlayer(username: string): Match | undefined {
    for (const match of this.matchesByRoom.values()) {
      if (match.players?.some(p => p?.username === username)) return match;
    }
    return undefined;
  }
}

function mapShift<K, V>(map: Map<K, V>): V | undefined {
  const firstKeyValuCouple = map.entries().next();
  if (firstKeyValuCouple.done) return undefined;
  const [key, val] = firstKeyValuCouple.value;
  map.delete(key);
  return val;
}

