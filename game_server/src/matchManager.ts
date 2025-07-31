import { Socket } from "socket.io";
import { Game } from "./game";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameStatus } from "./game";
import { getTournament, findMyMatch } from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";
import { ConnectionHandler } from "./connection";
import { GameBuilder } from "./gameBuilder";
import { GameQueue } from "./queueManager";

export interface Player {
	socket: Socket;
	username: string;
	uuid: string;
}

export interface DisconnectionEvent {
	player: Player;
	game: Game;
	timestamp: number;
}

export class MatchManager {
	private static instance: MatchManager;

	public disconnectTimestamps: Map<string, DisconnectionEvent> = new Map();
	public playersGamesMap: Map<string, Game> = new Map();
	private waitingTournamentMatches: Map<string, Map<string, Player>> = new Map();

	private constructor() {}

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
			GameQueue.getInstance().enqueue(player);
		else if (status.game_mode === 'tournament')
			this.handleTournamentMatch(player, status.tournamentCode!);
		else
			console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} requested for game mode ${status.game_mode}, but it is not supported.`);
	}

	private createMatchWithAI(player1: Player, level: string) {
		const roomId = `room_${player1.username}_vs_AI_${level}`;
		const game = new GameBuilder()
			.withRoomId(roomId)
			.withPlayers(player1, player1)
			.withGameMode("vsAI")
			.withLeftInput(() => new RemotePlayerInput(player1))
			.withRightInput((g) => new AIPlayerInput(g, g.getRightPaddle(), level))
			.build();

		this.playersGamesMap.set(player1.username, game);
		player1.socket.join(game.roomId);
		player1.socket.on("ready", () => game.start());
	}

	private createLocalMatch(player1: Player) {
		const roomId = `game_${player1.socket.id}_vs_friend`;
		const game = new GameBuilder()
			.withRoomId(roomId)
			.withPlayers(player1, player1)
			.withGameMode("localGame")
			.withLeftInput(() => new LocalPlayerInput(player1, "left"))
			.withRightInput(() => new LocalPlayerInput(player1, "right"))
			.build();

		this.playersGamesMap.set(player1.username, game);
		player1.socket.join(game.roomId);
		player1.socket.on("ready", () => game.start());
	}

	public cancelRemoteMatch(game: Game, cancelMode?: string) {
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} thought to cancel the match: ${cancelMode}`);
		if (game.state !== 'waiting')
			return;
		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-cancelled", {});
		game.players.forEach(player => player.socket.leave(game.roomId));
		this.clearMatch(game);
	}

	private async handleTournamentMatch(player: Player, tournamentCode: string) {
		try {
			const response = await getTournament(tournamentCode!);
			if (!response.success)
				throw new Error(`Could not get the tournament with code : ${tournamentCode}`);

			const match = findMyMatch(response.data, player.uuid);

			const match_id = match.match_id;
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
			if (myMatchMap.size < 2) {
				throw new Error(`Bir şeyler ters gitti ! myMatchMap.size 2 den küçük olamaz, şu an ${myMatchMap.size}`);
			}
			const roundNumber = match.roundNumber;
			const finalMatch = match.finalMatch;
			const tournament = { code: tournamentCode, roundNo: roundNumber, finalMatch: finalMatch };

			const iter = myMatchMap.values();
			const player1 = iter.next().value!;
			const player2 = iter.next().value!;

			GameQueue.getInstance().createRemoteMatch(player1, player2, tournament);
		} catch (err: any) {
			console.error("Tournament match error:", err);
			emitError(err.message, player.socket.id);
		}
	}

	public handleDisconnect(player: Player) {
		const game = this.getMatchByPlayer(player.username);
		if (!game) {
			GameQueue.getInstance().dequeue(player);
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
				this.cancelRemoteMatch(game, 'disconnect');
				break;
			case 'in-progress':
				game.pause();
				/* fall through */
			case 'paused':
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
		const roomId = game.roomId;
		const playersIndex = player.username === game.players[0].username ? 0 : 1;
		game.players[playersIndex] = player;
		player.socket.join(roomId);

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

		game.players
			.filter(p => p.username !== player.username)
			.forEach(p => p.socket.emit("opponent-reconnected"));
		game.resume();

		GameEmitter.getInstance().emitGameConstants(game);
		GameEmitter.getInstance().emitBallState(game);
		GameEmitter.getInstance().emitPaddleState(game);
		GameEmitter.getInstance().emitGameState(game);
		GameEmitter.getInstance().emitSetState(game);
	}

	public clearMatch(game: Game) {
		for (const player of new Set(game.players)) {
			this.playersGamesMap.delete(player.username);
			player.socket.leave(game.roomId);
		}
	}

	public getMatchByPlayer(username: string): Game | undefined {
		return this.playersGamesMap.get(username);
	}
}
