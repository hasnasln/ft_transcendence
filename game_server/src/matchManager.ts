import { Socket } from "socket.io";
import { Game } from "./game";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameStatus } from "./game";
import { getTournament, findMyMatch, joinMatchByCode as notifyTournamentService } from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";
import { ConnectionHandler } from "./connection";
import { GameBuilder } from "./gameBuilder";
import { GameQueue } from "./queueManager";

type ApprovalAnswer = 'accept' | 'refuse' | 'timeout';

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

	private buildMatchPlayersInfo(game: Game): MatchPlayers {
		return {
			left: { socketId: game.players[0].socket.id, username: game.players[0].username },
			right: { socketId: game.players[1].socket.id, username: game.players[1].username },
			roundNo: game.tournament?.roundNo,
			finalMatch: game.tournament?.finalMatch
		};
	}

	private startPlayProcess(game: Game) {
		game.players.forEach(player => {
			this.playersGamesMap.set(player.username, game);
			player.socket.join(game.roomId);
		});

		this.waitForApprovals(game)
			.then(approved => {
				if (!approved){
					this.cancelMatch(game, 'approval refused');
					return;
				}
				this.onGameApproved(game);		
			});

		if (game.gameMode === 'tournament' || game.gameMode === 'localGame') {
			ConnectionHandler.getInstance().getServer().to(game.roomId).emit("match-ready", this.buildMatchPlayersInfo(game));
		}
	}

	private createMatchWithAI(player: Player, level: string) {
		const game = new GameBuilder()
			.withRoomId(`room_${player.username}_vs_AI_${level}`)
			.withPlayers(player)
			.withGameMode("vsAI")
			.withLeftInput(() => new RemotePlayerInput(player))
			.withRightInput((g) => new AIPlayerInput(g, g.getRightPaddle(), level))
			.build();

		this.startPlayProcess(game);
	}

	private createLocalMatch(player: Player) {
		const game = new GameBuilder()
			.withRoomId(`game_${player.socket.id}_vs_friend`)
			.withPlayers(player)
			.withGameMode("localGame")
			.withLeftInput(() => new LocalPlayerInput(player, "left"))
			.withRightInput(() => new LocalPlayerInput(player, "right"))
			.build();

		this.startPlayProcess(game);
	}

	public createRemoteMatch(player1: Player, player2: Player, tournament?: { code: string, roundNo: number, finalMatch: boolean }) {
        const builder = new GameBuilder()
            .withRoomId(`room_${player1.username}_${player2.username}`)
            .withPlayers(player1, player2)
            .withGameMode(tournament ? 'tournament' : 'remoteGame')
            .withLeftInput(() => new RemotePlayerInput(player1))
            .withRightInput(() => new RemotePlayerInput(player2));

        if (tournament)
            builder.withTournament(tournament.code, tournament.roundNo, tournament.finalMatch);
        const game = builder.build();

        console.log(`[${new Date().toISOString()}] ${player1.username.padStart(10)} and ${player2.username.padStart(10)} matched. Waiting for approval...`);
		this.startPlayProcess(game);
        
	}

	public async waitForApprovals(game: Game): Promise<boolean> {
		const approvalPromises = game.players.map(player => this.getApproval(player));
		return Promise.all(approvalPromises).then((answers: ApprovalAnswer[]) => {
            if (answers.every(answer => answer === 'accept')) {
                return true;
            } else {
 				return false;
            }
        });
	}

	public cancelMatch(game: Game, cancelMode?: string) {
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
			if (!match.match_id) {
				ConnectionHandler.getInstance().getServer().to(player.socket.id).emit("goToNextRound");
				return;
			}

			if (!this.waitingTournamentMatches.has(match.match_id))
				this.waitingTournamentMatches.set(match.match_id, new Map<string, Player>());

			const matchedPlayers = this.waitingTournamentMatches.get(match.match_id);
			if (!matchedPlayers) {
				throw new Error(`Maç bulunamadı: match_id = ${match.match_id}`);
			}
			matchedPlayers.set(player.username, player);

			if (matchedPlayers.size !== 2)
				throw new Error(`an incomplete match found: match_id = ${match.match_id}, players = ${Array.from(matchedPlayers.keys()).join(', ')}`);

			const roundNumber = match.roundNumber;
			const finalMatch = match.finalMatch;
			const tournament = { code: tournamentCode, roundNo: roundNumber, finalMatch: finalMatch };

			const iter = matchedPlayers.values();
			const player1 = iter.next().value!;
			const player2 = iter.next().value!;

			this.createRemoteMatch(player1, player2, tournament);
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

		/* game.players == 1 */
		if (game.gameMode === 'vsAI' || game.gameMode === 'localGame') {
			game.finishIncompleteMatch();
			this.clearMatch(game);
			return;
		}
		

		const opponent = player.username === game.players[0].username ? game.players[1] : game.players[0];
		switch (game.state) {
			case 'waiting':
				this.cancelMatch(game, 'disconnect');
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

	private getApproval(player: Player): Promise<ApprovalAnswer> {
		const answer = new Promise<ApprovalAnswer>((resolve) => {
            player.socket.timeout(this.readyTimeout).once("ready", (payload) => {
                if (payload.approval === 'rejected') {
                    console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'not ready' message.`);
                    resolve('refuse');
                } else {
                    console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'ready' message.`);
                    resolve('accept');
                }
            });
        });

		const timeout = new Promise<ApprovalAnswer>((resolve) => {
			setTimeout(() => {
				console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} did not respond in time.`);
				resolve('timeout');
			}, this.readyTimeout + 100 /* 100ms buffer */);
		});

		return Promise.race([answer, timeout]);
	}

    private onGameApproved(game: Game) {
        console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} match approved. Starting the game...`);

        if (game.gameMode === 'tournament') {
            try {
				game.players.forEach(p => {
					notifyTournamentService(game.tournament?.code as string, game.tournament?.roundNo as number, { uuid: p.uuid, username: p.username });
				});
            } catch (err: any) {
                emitError(err.message, game.roomId);
            }
        }

        game.start();
    }
}
