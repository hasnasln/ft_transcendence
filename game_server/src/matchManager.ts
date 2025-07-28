import { Socket } from "socket.io";
import { Game } from "./game";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameStatus } from "./game";
import { getTournament, findMyMatch, joinMatchByCode, Match } from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";
import { ConnectionHandler } from "./connection";

export interface Player {
	socket: Socket;
	username: string;
	uuid: string;
	token: string;
	socketReady: boolean;
}

interface MatchPlayers {
	left: { socketId: string, username: string };
	right: { socketId: string, username: string };
	roundNo?: number;
	finalMatch?: boolean
}

export interface DisconnectionEvent {
	player: Player;
	game: Game;
	timestamp: number;
}

export class MatchManager {
	private static instance: MatchManager;

	public connectedPlayers: Map<string, Player> = new Map();
	public disconnectTimestamps: Map<string, DisconnectionEvent> = new Map();
	private matchesByRoom: Map<string, Game> = new Map();
	public roomsByUsername: Map<string, string> = new Map();
	private queuedPlayers: Player[] = [];
	private waitingTournamentMatches: Map<string, Map<string, Player>> = new Map();

	private constructor() {
	}

	public static getInstance(): MatchManager {
		if (!MatchManager.instance) {
			MatchManager.instance = new MatchManager();
		}
		return MatchManager.instance;
	}

	public handleMatchRequest(player: Player, status: GameStatus) {
		if (status.game_mode === "vsAI")
			this.createMatchWithAI(player, status.level!);
		else if (status.game_mode === "localGame")
			this.createLocalMatch(player);
		else if (status.game_mode === "remoteGame")
			this.enqueue(player);
		else if (status.game_mode === 'tournament')
			this.handleTournamentMatch(player, status.tournamentCode!);
		else
			console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} requested for game mode ${status.game_mode}, but it is not supported.`);
	}

	private createMatchWithAI(human: Player, level: string) {
		const roomId = `room_${human.username}_vs_AI_${level}`;
		const game = new Game(roomId, human, human);
		this.matchesByRoom.set(roomId, game);
		this.roomsByUsername.set(human.username, roomId);
		human.socket.join(roomId);

		human.socket.on("ready", () => {
			const leftInput = new RemotePlayerInput(human);
			const rightInput = new AIPlayerInput(game, game.getPaddle2(), level);

			game.leftInput = leftInput;
			game.rightInput = rightInput;
			game.gameMode = 'vsAI';
			game.start();
		});
	}

	private createLocalMatch(player1: Player) {
		const roomId = `game_${player1.socket.id}_vs_friend`;
		const game = new Game(roomId, player1, player1);
		this.matchesByRoom.set(roomId, game);
		this.roomsByUsername.set(player1.username, roomId);
		player1.socket.join(roomId);

		player1.socket.on("ready", () => {
			const leftInput = new LocalPlayerInput(player1, "left");
			const rightInput = new LocalPlayerInput(player1, "right");
			game.leftInput = leftInput;
			game.rightInput = rightInput;
			game.gameMode = 'localGame';
			game.start();
		});
	}

	private enqueue(player: Player) {
		this.queuedPlayers.push(player);
		console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} enqueued for remote match.`);
		this.tryCreatingRemoteMatches(this.queuedPlayers);
	}

	private dequeue(player: Player) {
		this.queuedPlayers = this.queuedPlayers.filter(p => p !== player);
	}

	private tryCreatingRemoteMatches(queuedPlayers: Player[], tournament?: { code: string, roundNo: number, finalMatch: boolean }) {
		if (queuedPlayers.length < 2)
			return;

		const player1 = queuedPlayers.shift();
		const player2 = queuedPlayers.shift();
		if (!player1 || !player2 || player1 === player2) {
			console.log(`[${new Date().toISOString()}] Player1 and Player2 can't play together: ${JSON.stringify({ player1, player2 })}`);
			return;
		}

		const roomId = `room_${player1.username}_${player2.username}`;
		const game = new Game(roomId, player1, player2);
		game.tournament = tournament;
		game.gameMode = tournament ? 'tournament' : 'remoteGame';
		this.matchesByRoom.set(roomId, game);
		this.roomsByUsername.set(player1.username, roomId);
		this.roomsByUsername.set(player2.username, roomId);
		console.log(`[${new Date().toISOString()}] ${player1.username.padStart(10)} and ${player2.username.padStart(10)} matched. Waiting for approval...`);

		const matchPlayers: MatchPlayers = {
			left: { socketId: player1.socket.id, username: player1.username },
			right: { socketId: player2.socket.id, username: player2.username },
			roundNo: tournament?.roundNo,
			finalMatch: tournament?.finalMatch
		};

		player1.socket.join(roomId);
		player2.socket.join(roomId);
		ConnectionHandler.getInstance().getServer().to(roomId).emit("match-ready", matchPlayers);
		this.waitForRemoteMatchApproval(player1);
		this.waitForRemoteMatchApproval(player2);
	}

	public waitForRemoteMatchApproval(player: Player) {
		const game = this.getMatchByPlayer(player.username);
		if (!game)
			return;
		const other = player.username === game.players[0].username ? game.players[1] : game.players[0];
		player.socket.on("ready", () => {
			if (game.state !== 'completed' && game.state !== 'waiting') {
				return;
			}
			
			console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'ready' message.`);
			player.socketReady = true;
			if (game.gameMode === 'tournament') {
				try {
					joinMatchByCode(player.token, game.tournament?.code as string, game.tournament?.roundNo as number, { uuid: player.uuid, username: player.username });
				} catch (err: any) {
					emitError(err.message, game.roomId);
				}
			}

			if (game.reMatch && game.gameMode === 'remoteGame' && !other.socketReady) {
				ConnectionHandler.getInstance().getServer().to(other.socket.id).emit("waitingRematch", other.username);
			}

			if (!game.readyTimeout) {
				game.readyTimeout = setTimeout(() => {
					this.cancelRemoteMatch(other.socket.id, game, "waiting approval");
				}, 20_000);
			}

			if (other.socketReady && player.socketReady)
				this.startRemoteMatch(game);
		});

		player.socket.on("cancel", () => {
			clearTimeout(game.readyTimeout!);
			game.readyTimeout = null;
			this.cancelRemoteMatch(player.socket.id, game, 'refuse');
		});
	}

	public startRemoteMatch(game: Game) {
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} starting...`);
		const player1 = game.players[0];
		const player2 = game.players[1]!;
		if (game.readyTimeout) {
			clearTimeout(game.readyTimeout);
			game.readyTimeout = null;
		}
		if (game.state === 'in-progress' || game.state === 'paused' || !player1.socketReady || !player2.socketReady)
			return;

		const leftInput = new RemotePlayerInput(player1);
		const rightInput = new RemotePlayerInput(player2);

		game.leftInput = leftInput;
		game.rightInput = rightInput;
		game.gameMode = game.tournament ? 'tournament' : 'remoteGame';

		game.start();
		game.reMatch = true;
		player1.socketReady = false;
		player2.socketReady = false;
	}

	public cancelRemoteMatch(cancellerId: string, game: Game, cancelMode: string) {
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} thought to cancel the match.`);
		if (!game.readyTimeout) {
			return;
		}
		clearTimeout(game.readyTimeout);
		game.readyTimeout = null;
		if (game.state !== 'waiting')
			return;
		const data: { cancellerId: string, rematch: boolean, mode: string } = { cancellerId: cancellerId, rematch: game.reMatch, mode: cancelMode };
		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-cancelled", data);
		this.clearMatch(game);
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} cancelled: mode: ${cancelMode}, cancellerId: ${cancellerId}`);
	}

	private async handleTournamentMatch(player: Player, tournamentCode: string) {
		try {
			const response = await getTournament(tournamentCode!);
			if (!response.success)
				throw new Error(`Could not get the tournament with code : ${tournamentCode}`);

			const match_id = findMyMatch(response.data, player.uuid).match_id;
			if (!match_id) {
				ConnectionHandler.getInstance().getServer().to(player.socket.id).emit("goToNextRound");
				return;
			}

			if (!this.waitingTournamentMatches.has(match_id))
				this.waitingTournamentMatches.set(match_id, new Map<string, Player>());
			const myMatchMap = this.waitingTournamentMatches.get(match_id);
			if (!myMatchMap) {
				throw new Error(`Maç bulunamadı: match_id = ${match_id}`);
			}
			myMatchMap.set(player.username, player);

			if (myMatchMap.size > 2)
				throw new Error(`Bir şeyler ters gitti ! myMatchMap.size 2 den büyük olamaz, şu an ${myMatchMap.size}`);
			const roundNumber = findMyMatch(response.data, player.uuid).roundNumber;
			const finalMatch = findMyMatch(response.data, player.uuid).finalMatch;
			const tournament = { code: tournamentCode, roundNo: roundNumber, finalMatch: finalMatch };

			this.tryCreatingRemoteMatches(Array.from(myMatchMap.values()), tournament);
		}
		catch (err: any) {
			// print stack trace
			console.error("Hata kodu:", err);
			emitError(err.message, player.socket.id);
		}
	}

	public handleDisconnect(player: Player) {
		this.connectedPlayers.delete(player.username);
		const game = this.getMatchByPlayer(player.username);
		if (!game) {
			this.dequeue(player);
			return;
		}

		if (game.gameMode === 'vsAI' || game.gameMode === 'localGame') {
			game.finishIncompleteMatch();
			this.clearMatch(game);
			return;
		}

		const opponent = player.username === game.players[0].username ? game.players[1] : game.players[0];
		switch (game.state) {
			case 'waiting':
				this.cancelRemoteMatch(player.socket.id, game, 'disconnect');
				break;
			case 'in-progress':
			case 'paused':
				game.pause();
				ConnectionHandler.getInstance().getServer().to(opponent.socket.id).emit("opponent-disconnected");
				this.disconnectTimestamps.set(player.username, { player, game, timestamp: Date.now() });
				break;
			case 'completed':
				if (game.gameMode === 'tournament') {
					this.clearMatch(game);
				} else {
					this.disconnectTimestamps.set(player.username, { player, game, timestamp: Date.now() });
				}
				break;
		}
	}

	public handleReconnect(player: Player, game: Game) {
		const roomId = this.roomsByUsername.get(player.username);

		const playersIndex = player.username === game.players[0].username ? 0 : 1;
		game.players[playersIndex] = player;
		player.socket = player.socket;
		player.socket.join(roomId!);

		if (!game) {
			throw new Error(`Match game is not initialized for player ${player.username} in room ${roomId}`);
		}
		if (!this.disconnectTimestamps.has(player.username)) {
			throw new Error(`Disconnection event not found for player ${player.username}`);
		}
		this.disconnectTimestamps.delete(player.username);
		player.socket.emit("rejoin-response", {status: "approved"});

		const input = new RemotePlayerInput(player);
		if (game.leftInput!.getUsername() === player.username) {
			game.leftInput = input;
		} else {
			game.rightInput = input;
		}

		game.players.find(p => p.username !== player.username)!.socket.emit("opponent-reconnected");
		game.resume();

		GameEmitter.getInstance().emitGameConstants(game);
		GameEmitter.getInstance().emitBallState(game);
		GameEmitter.getInstance().emitPaddleState(game);
		GameEmitter.getInstance().emitGameState(game);
		GameEmitter.getInstance().emitSetState(game);
	}

	public clearMatch(game: Game) {
		const player1 = game.players[0];
		const player2 = game.players[1];
		this.matchesByRoom.delete(game.roomId);
		this.roomsByUsername.delete(player1.username);
		this.roomsByUsername.delete(player2.username);
		player1.socketReady = false;
		player2.socketReady = false;
	}

	public getMatchByRoom(roomId: string): Game | undefined {
		return this.matchesByRoom.get(roomId);
	}

	public getMatchByPlayer(username: string): Game | undefined {
		for (const match of this.matchesByRoom.values()) {
			if (match.players?.some(p => p?.username === username)) {
				return match;
			}
		}
		return undefined;
	}
}
