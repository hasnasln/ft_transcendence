import { Socket } from "socket.io";
import { Game, Paddle } from "./game";
import { Server } from "socket.io";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameMode, GameStatus } from "./server";
import { getTournament, findMyMatch, joinMatchByCode } from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";

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
	match: Match;
	timestamp: number;
}

export class Match {
	roomId: string;
	players: [Player, Player];
	state: 'waiting' | 'in-progress' | 'paused' | 'completed' = 'waiting';
	game: Game | null = null;
	gameMode: GameMode | null = null;
	reMatch = false;
	readyTimeout: NodeJS.Timeout | null = null;
	tournament?: { code: string, roundNo: number, finalMatch: boolean }

	constructor(roomId: string, player1: Player, player2: Player) {
		this.roomId = roomId;
		this.players = [player1, player2];
	}

	start() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} started.`);
		this.state = 'in-progress';
		this.game!.startGameLoop();
	}

	pause() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} paused.`);
		this.state = 'paused';
		this.game!.pauseGameLoop();
	}

	resume() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} resumes.`);
		this.state = 'in-progress';
		this.game!.resumeGameLoop();
	}

	finishIncompleteMatch(username?: string) {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} finishes incomplete match.`);
		this.state = 'completed';
		if (this.game) {
			this.game.finishIncompleteMatch(username);
			this.game = null;
		}
	}

	end() {
		console.log(`[${new Date().toISOString()}] ${this.roomId.padStart(10)} ended.`);
		this.state = 'completed';
		this.game = null;
	}
}

export class MatchManager {
	public static instance: MatchManager;

	public connectedPlayers: Map<string, Player> = new Map();
	public disconnectTimestamps: Map<string, DisconnectionEvent> = new Map();
	private matchesByRoom: Map<string, Match> = new Map();
	public roomsByUsername: Map<string, string> = new Map();
	private queuedPlayers: Player[] = [];
	private waitingTournamentMatches: Map<string, Map<string, Player>> = new Map();
	private io: Server;

	constructor(io: Server) {
		this.io = io;
		MatchManager.instance = this;
	}

	public static getInstance(): MatchManager {
		return MatchManager.instance!;
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
		const match = new Match(roomId, human, human);
		match.gameMode = 'vsAI';
		this.matchesByRoom.set(roomId, match);
		this.roomsByUsername.set(human.username, roomId);
		human.socket.join(roomId);

		human.socket.on("ready", () => {
			let getGame: () => Game;
			let getPaddle: () => Paddle;

			const leftInput = new RemotePlayerInput(human);
			const rightInput = new AIPlayerInput(() => getGame(), () => getPaddle(), level);

			match.game = new Game(leftInput, rightInput, this.io, roomId, 'vsAI', match);
			getGame = () => match.game!;
			getPaddle = () => match.game!.getPaddle2();
			match.start();
		});
	}

	private createLocalMatch(player1: Player) {
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
		const match = new Match(roomId, player1, player2);
		match.tournament = tournament;
		match.gameMode = tournament ? 'tournament' : 'remoteGame';
		this.matchesByRoom.set(roomId, match);
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
		this.io.to(roomId).emit("match-ready", matchPlayers);
		this.waitForRemoteMatchApproval(player1);
		this.waitForRemoteMatchApproval(player2);
	}

	waitForRemoteMatchApproval(player: Player) {
		const match = this.getMatchByPlayer(player.username);
		if (!match)
			return;
		const other = player.username === match.players[0].username ? match.players[1] : match.players[0];
		player.socket.on("ready", () => {
			if (match.state !== 'completed' && match.state !== 'waiting') {
				return;
			}
			
			console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'ready' message.`);
			player.socketReady = true;
			if (match.gameMode === 'tournament') {
				try {
					joinMatchByCode(player.token, match.tournament?.code as string, match.tournament?.roundNo as number, { uuid: player.uuid, username: player.username });
				} catch (err: any) {
					emitError(err.message, match.roomId, this.io);
				}
			}

			if (match.reMatch && match.gameMode === 'remoteGame' && !other.socketReady) {
				this.io.to(other.socket.id).emit("waitingRematch", other.username);
			}

			if (!match.readyTimeout) {
				match.readyTimeout = setTimeout(() => {
					this.cancelRemoteMatch(other.socket.id, match, "waiting approval");
				}, 20_000);
			}

			if (other.socketReady && player.socketReady)
				this.startRemoteMatch(match);
		});

		player.socket.on("cancel", () => {
			clearTimeout(match.readyTimeout!);
			match.readyTimeout = null;
			this.cancelRemoteMatch(player.socket.id, match, 'refuse');
		});
	}

	startRemoteMatch(match: Match) {
		console.log(`[${new Date().toISOString()}] ${match.roomId.padStart(10)} starting...`);
		const player1 = match.players[0];
		const player2 = match.players[1]!;
		if (match.readyTimeout) {
			clearTimeout(match.readyTimeout);
			match.readyTimeout = null;
		}
		if (match.state === 'in-progress' || match.state === 'paused' || !player1.socketReady || !player2.socketReady)
			return;

		const leftInput = new RemotePlayerInput(player1);
		const rightInput = new RemotePlayerInput(player2);

		if (match.tournament !== undefined) {
			match.game = new Game(leftInput, rightInput, this.io, match.roomId, 'tournament', match);
		} else {
			match.game = new Game(leftInput, rightInput, this.io, match.roomId, 'remoteGame', match);
		}
		match.start();
		match.reMatch = true;
		player1.socketReady = false;
		player2.socketReady = false;
	}

	cancelRemoteMatch(cancellerId: string, match: Match, cancelMode: string) {
		console.log(`[${new Date().toISOString()}] ${match.roomId.padStart(10)} thought to cancel the match.`);
		if (!match.readyTimeout) {
			return;
		}
		clearTimeout(match.readyTimeout);
		match.readyTimeout = null;
		if (match.state !== 'waiting')
			return;
		const data: { cancellerId: string, rematch: boolean, mode: string } = { cancellerId: cancellerId, rematch: match.reMatch, mode: cancelMode };
		this.io.to(match.roomId).emit("match-cancelled", data);
		this.clearMatch(match);
		console.log(`[${new Date().toISOString()}] ${match.roomId.padStart(10)} cancelled: mode: ${cancelMode}, cancellerId: ${cancellerId}`);
	}

	private async handleTournamentMatch(player: Player, tournamentCode: string) {
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
			emitError(err.message, player.socket.id, this.io);
		}
	}

	handleDisconnect(player: Player) {
		this.connectedPlayers.delete(player.username);
		const match = this.getMatchByPlayer(player.username);
		if (!match) {
			this.dequeue(player);
			return;
		}

		if (match.gameMode === 'vsAI' || match.gameMode === 'localGame') {
			match.finishIncompleteMatch();
			this.clearMatch(match);
			return;
		}

		const opponent = player.username === match.players[0].username ? match.players[1] : match.players[0];
		switch (match.state) {
			case 'waiting':
				this.cancelRemoteMatch(player.socket.id, match, 'disconnect');
				break;
			case 'in-progress':
			case 'paused':
				match.pause();
				const res = this.io.to(opponent.socket.id).emit("opponent-disconnected");
				this.disconnectTimestamps.set(player.username, { player, match, timestamp: Date.now() });
				break;
			case 'completed':
				if (match.gameMode === 'tournament') {
					this.clearMatch(match);
				} else {
					this.disconnectTimestamps.set(player.username, { player, match, timestamp: Date.now() });
				}
				break;
		}
	}

	handleReconnect(player: Player, match: Match) {
		const roomId = this.roomsByUsername.get(player.username);

		const playersIndex = player.username === match.players[0].username ? 0 : 1;
		match.players[playersIndex] = player;
		player.socket = player.socket;
		player.socket.join(roomId!);

		if (!match.game) {
			throw new Error(`Match game is not initialized for player ${player.username} in room ${roomId}`);
		}
		if (!this.disconnectTimestamps.has(player.username)) {
			throw new Error(`Disconnection event not found for player ${player.username}`);
		}
		this.disconnectTimestamps.delete(player.username);
		player.socket.emit("rejoin-response", {status: "approved"});

		const input = new RemotePlayerInput(player);
		if (match.game.leftInput.getUsername() === player.username) {
			match.game.leftInput = input;
		} else {
			match.game.rightInput = input;
		}

		match.players.find(p => p.username !== player.username)!.socket.emit("opponent-reconnected");
		match.resume();

		GameEmitter.getInstance().emitGameConstants(match.game);
		GameEmitter.getInstance().emitBallState(match.game);
		GameEmitter.getInstance().emitPaddleState(match.game);
		GameEmitter.getInstance().emitGameState(match.game);
		GameEmitter.getInstance().emitSetState(match.game);
	}

	clearMatch(match: Match) {
		const player1 = match.players[0];
		const player2 = match.players[1];
		this.matchesByRoom.delete(match.roomId);
		this.roomsByUsername.delete(player1.username);
		this.roomsByUsername.delete(player2.username);
		player1.socketReady = false;
		player2.socketReady = false;
	}

	getMatchByRoom(roomId: string): Match | undefined {
		return this.matchesByRoom.get(roomId);
	}

	public getMatchByPlayer(username: string): Match | undefined {
		for (const match of this.matchesByRoom.values()) {
			if (match.players?.some(p => p?.username === username)) {
				return match;
			}
		}
		return undefined;
	}
}
