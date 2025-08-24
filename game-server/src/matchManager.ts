import { Socket } from "socket.io";
import { Game } from "./game";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameStatus } from "./game";
import {
	getTournament,
	extractMatch,
	joinMatch,
	leaveMatch,
	generateMatchId,
	TournamentStatus
} from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";
import { ConnectionHandler } from "./connection";
import { GameBuilder } from "./gameBuilder";
import { GameQueue } from "./queueManager";

type ApprovalAnswer = {player: Player, answer: 'accept' | 'refuse' | 'timeout'};

interface MatchPlayers {
    left: { socketId: string, username: string };
    right: { socketId: string, username: string };
    roundNo?: number;
    finalMatch?: boolean
}

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

    private readonly readyTimeout: number = 20_000;
	public disconnectTimestamps: Map<string, DisconnectionEvent> = new Map();
	public playersGamesMap: Map<string, Game> = new Map();
	private waitingTournamentMatches: Map<string, Player[]> = new Map();

	private constructor() {}

	public static getInstance(): MatchManager {
		if (!MatchManager.instance) {
			MatchManager.instance = new MatchManager();
		}
		return MatchManager.instance;
	}

	public handleMatchRequest(player: Player, status: GameStatus) {
		if (status.game_mode === "vsAI")
			this.createGameWithAI(player, status.level!);
		else if (status.game_mode === "localGame")
			this.createLocalGame(player);
		else if (status.game_mode === "remoteGame")
			GameQueue.getInstance().enqueue(player);
		else if (status.game_mode === 'tournament')
			this.handleTournamentGame(player, status.tournamentCode!);
		else
			console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} requested for game mode ${status.game_mode}, but it is not supported.`);
	}

	private buildGamePlayersInfo(game: Game): MatchPlayers {
		return {
			left: { socketId: game.players[0].socket.id, username: game.players[0].username },
			right: { socketId: game.players[1].socket.id, username: game.players[1].username },
			roundNo: game.tournament?.roundNo,
			finalMatch: game.tournament?.finalMatch
		};
	}

	private createGameWithAI(player: Player, level: string) {
		const game = new GameBuilder()
			.withRoomId(`room_${player.username}_vs_AI_${level}`)
			.withPlayers(player)
			.withGameMode("vsAI")
			.withLeftInput(() => new RemotePlayerInput(player))
			.withRightInput((g) => new AIPlayerInput(g, g.getRightPaddle(), level))
			.build();

		this.startPlayProcess(game);
	}

	private createLocalGame(player: Player) {
		const game = new GameBuilder()
			.withRoomId(`room_${player.socket.id}_vs_friend`)
			.withPlayers(player)
			.withGameMode("localGame")
			.withLeftInput(() => new LocalPlayerInput(player, "left"))
			.withRightInput(() => new LocalPlayerInput(player, "right"))
			.build();

		this.startPlayProcess(game);
	}

	public createRemoteGame(player1: Player, player2: Player, tournament?: { code: string, roundNo: number, finalMatch: boolean, name: string }) {
        const builder = new GameBuilder()
            .withRoomId(`room_${player1.username}_${player2.username}`)
            .withPlayers(player1, player2)
            .withGameMode(tournament ? 'tournament' : 'remoteGame')
            .withLeftInput(() => new RemotePlayerInput(player1))
            .withRightInput(() => new RemotePlayerInput(player2));

        if (tournament)
            builder.withTournament(tournament.code, tournament.roundNo, tournament.finalMatch, tournament.name);
        const game = builder.build();

		this.startPlayProcess(game);
	}

	public cancelGame(game: Game, cancelMode?: string) {
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} thought to cancel the match: ${cancelMode}`);
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} game.state: ${game.state}`);
		if (game.state !== 'waiting' && game.state !== 'ready')
			return;
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} cancelled: ${cancelMode}`);
		ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-cancelled", {});
		game.players.forEach(player => player.socket.leave(game.roomId));
		this.clearGame(game);
	}

	private async handleTournamentGame(player: Player, tournamentCode: string) {
		try 
		{
			const tournament = await getTournament(tournamentCode!);
			if (!tournament)
				throw new Error(`not_found`);
			else if (tournament.status === TournamentStatus.COMPLETED)
				throw new Error(`tournament_completed`);

			if(tournament.lobby_members.find(m => m.uuid === player.uuid) === undefined)
				throw new Error(`not_registered`);
			else if (tournament.participants.find(p => p.uuid === player.uuid) === undefined)
				throw new Error(`eliminated`);

			const match = extractMatch(tournament, player.uuid);

			if (match instanceof Error) {
				emitError('tournamentError', match.message, player.socket.id);
				setTimeout(() => { player.socket.disconnect(); }, 1000);
				return;
			}

			let matchedPlayers: Player[] | undefined = this.waitingTournamentMatches.get(match.match_id);
			if (!matchedPlayers) {
				matchedPlayers = []
				this.waitingTournamentMatches.set(match.match_id, matchedPlayers);
			}
			matchedPlayers.push(player);

			console.log(`${new Date().toISOString()}] ${player.username.padStart(10)} is connected for opponent in tournament match: ${match.match_id}`);
			await joinMatch(tournamentCode, match.roundNumber, {uuid:player.uuid, username:player.username});

			if (matchedPlayers.length == 1)
				return;

			this.createRemoteGame(matchedPlayers[0], matchedPlayers[1], { code: tournamentCode, roundNo: match.roundNumber, finalMatch: match.finalMatch, name: tournament.name });
		}
		catch (err: any) {
			console.error("Tournament match error:", err);
			emitError('tournamentError', err.message, player.socket.id);
			setTimeout(() => { player.socket.disconnect(); }, 1000);
			return;
		}
	}

	public handleDisconnect(player: Player) {
		const game = this.getMatchByPlayer(player.username);
		if (!game) {
			GameQueue.getInstance().dequeue(player);
			return;
		}

		if (game.tournament && game.state === 'waiting') {
			const matchId = generateMatchId(game.tournament.code, game.tournament.roundNo, game.players[0], game.players[1]);
			const matchedPlayers = this.waitingTournamentMatches.get(matchId);
			try {
				leaveMatch(game.tournament.code, game.tournament.roundNo, {uuid: player.uuid, username: player.username});
			} catch (error) {
				console.error("Error leaving match:", error);
				emitError('tournamentError', (error as Error).message, player.socket.id);
			}
			if (matchedPlayers) {
				this.waitingTournamentMatches.delete(matchId);
				matchedPlayers.forEach(p => p.socket.leave(game.roomId));
			}
			return;
		}

		if (game.gameMode === 'vsAI' || game.gameMode === 'localGame') {
			game.finalize(game.gameMode === 'vsAI' ? "Robot" : "Friend");
			this.clearGame(game);
			return;
		}

		switch (game.state) {
			case 'waiting':
				this.cancelGame(game, 'disconnect');
				break;
			case 'playing':
				game.pause();
				const opponent = player.username === game.players[0].username ? game.players[1] : game.players[0];
				ConnectionHandler.getInstance().getServer().to(opponent.socket.id).emit("opponent-disconnected");
				this.disconnectTimestamps.set(player.username, { player, game, timestamp: Date.now() });
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

		GameEmitter.getInstance().invalidateCache(game.roomId);
		GameEmitter.getInstance().emitGameConstants(game);
		GameEmitter.getInstance().emitBallState(game, true);
		GameEmitter.getInstance().emitPaddleState(game);
		GameEmitter.getInstance().emitGameState(game);
		GameEmitter.getInstance().emitSetState(game);
	}

	public clearGame(game: Game) {
		for (const player of new Set(game.players)) {
			this.playersGamesMap.delete(player.username);
			player.socket.leave(game.roomId);
		}
	}

	private startPlayProcess(game: Game) {
		console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} is in waitting state`);
		game.players.forEach(player => {
			this.playersGamesMap.set(player.username, game);
			player.socket.join(game.roomId);
		});

		this.waitForApprovals(game)
			.then(answers => {
				if (game.tournament)
				{
					if (answers.every(answer => answer.answer === 'accept'))
					{
						this.onGameApproved(game);
						return;
					}

					let winner;
					let winnerPlayer;
					if (answers.some(answer => answer.answer === 'accept'))
						winnerPlayer = answers.filter(a => a.answer === 'accept').pop()!.player
					else
						winnerPlayer = answers[Math.random() > 0.5 ? 0 : 1].player;

					winner = {uuid : winnerPlayer.uuid, username: winnerPlayer.username};

					console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} tournament match cannot start. Winner by default is ${winner.username}.`);
					
					game.finalize(winner.username);
					ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-cancelled", {});
					game.players.forEach(p => p.socket.leave(game.roomId));

					if (!game.tournament)
						console.error("Tournament info missing in a tournament game.");
				}
				else
				{
					if (answers.every(answer => answer.answer === 'accept')) {
						this.onGameApproved(game);
					} else {
						this.cancelGame(game, 'approval refused');
					}
				}
			});

		if (game.gameMode === 'tournament' || game.gameMode === 'remoteGame') {
			ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-ready", this.buildGamePlayersInfo(game));
		}
	}

	public async waitForApprovals(game: Game): Promise<ApprovalAnswer[]> {
		const approvalPromises = game.players.map(player => this.waitForSingleApproval(player));
		return Promise.all(approvalPromises);
	}

	private waitForSingleApproval(player: Player): Promise<ApprovalAnswer> {
		const answer = new Promise<ApprovalAnswer>((resolve) => {
            player.socket.timeout(this.readyTimeout).once("ready", (payload) => {
                if (payload.approval === 'rejected') {
                    console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'not ready' message.`);
                    resolve({player ,answer: 'refuse'});
                } else {
                    console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'ready' message.`);
                    resolve({player, answer: 'accept'});
                }
            });
        });

		const timeout = new Promise<ApprovalAnswer>((resolve) => {
			setTimeout(() => {
				resolve({player, answer: 'timeout'});
			}, this.readyTimeout + 100 /* 100ms buffer */);
		});

		return Promise.race([answer, timeout]);
	}

    private onGameApproved(game: Game) {
        console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} match approved. Starting the game...`);



        game.start();
    }

	public getMatchByPlayer(username: string): Game | undefined {
		return this.playersGamesMap.get(username);
	}
}
