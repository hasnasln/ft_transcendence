import { ConnectionHandler } from "./connection";
import { emitError } from "./errorHandling";
import { Game } from "./game";
import { GameBuilder } from "./gameBuilder";
import { RemotePlayerInput } from "./inputProviders";
import { MatchManager, Player } from "./matchManager";
import { joinMatchByCode } from "./tournament";

interface MatchPlayers {
    left: { socketId: string, username: string };
    right: { socketId: string, username: string };
    roundNo?: number;
    finalMatch?: boolean
}


type ApprovalAnswer = 'accept' | 'refuse' | 'timeout';

export class GameQueue {
    private static instance: GameQueue;
    private readonly queueTimeout: number = 20_000;

	private queuedPlayers: Player[] = [];

    public static getInstance(): GameQueue {
        if (!GameQueue.instance) {
            GameQueue.instance = new GameQueue();
        }
        return GameQueue.instance;
    }

    private constructor() {}
    
    public enqueue(player: Player) {
        if (this.queuedPlayers.some(p => p.username === player.username)) {
            console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} is already in the queue.`);
            return;
        }

        this.queuedPlayers.push(player);
        console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} enqueued for remote match.`);

        if (this.queuedPlayers.length < 2)
            return;

        const player1 = this.queuedPlayers.shift()!;
        const player2 = this.queuedPlayers.shift()!;

        this.createRemoteMatch(player1, player2);
    }

    public dequeue(player: Player) {
        this.queuedPlayers = this.queuedPlayers.filter(p => p !== player);
    }

    public createRemoteMatch(player1: Player, player2: Player, tournament?: { code: string, roundNo: number, finalMatch: boolean }) {
        const roomId = `room_${player1.username}_${player2.username}`;
        const builder = new GameBuilder()
            .withRoomId(roomId)
            .withPlayers(player1, player2)
            .withGameMode(tournament ? 'tournament' : 'remoteGame')
            .withLeftInput(() => new RemotePlayerInput(player1))
            .withRightInput(() => new RemotePlayerInput(player2));

        if (tournament) {
            builder.withTournament(tournament.code, tournament.roundNo, tournament.finalMatch);
        }

        const game = builder.build();

        MatchManager.getInstance().matchesByRoom.set(roomId, game);
        MatchManager.getInstance().roomsByUsername.set(player1.username, roomId);
        MatchManager.getInstance().roomsByUsername.set(player2.username, roomId);
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

        const answer = Promise.all([this.waitApproval(player1), this.waitApproval(player2)])
            .then(values => values.every(v => v) ? 'accept' : 'refuse');

        const timeout = new Promise<ApprovalAnswer>((resolve) => {
            setTimeout(() => resolve("timeout"), this.queueTimeout + 1000 /* 1 second buffer */);
        });

        Promise.race([answer, timeout]).then((answer: ApprovalAnswer) => {
            if (answer === 'accept') {
                this.onApprovalAgreed(game);
            } else {
                console.log(`[${new Date().toISOString()}] Match between ${player1.username.padStart(10)} and ${player2.username.padStart(10)} was ${answer}.`);
                ConnectionHandler.getInstance().getServer().to(roomId).emit("match-cancelled", { reason: answer });
                MatchManager.getInstance().cancelRemoteMatch(game, answer);
            }
        })
    }

    private async waitApproval(player: Player) : Promise<boolean> {
        return new Promise((resolve) => {
            player.socket.timeout(this.queueTimeout).once("ready", (payload) => {
                if (payload.approval === 'rejected') {
                    resolve(false);
                } else {
                    console.log(`[${new Date().toISOString()}] ${player.username.padStart(10)} sent 'ready' message.`);
                    player.socketReady = true;
                    resolve(true);
                }
            });
        });
    }

    private onApprovalAgreed(game: Game) {
        console.log(`[${new Date().toISOString()}] ${game.roomId.padStart(10)} match approved. Starting the game...`);

        const player1 = game.players[0];
        const player2 = game.players[1];
        
        if (game.gameMode === 'tournament') {
            try {
                joinMatchByCode(player1.token, game.tournament?.code as string, game.tournament?.roundNo as number, { uuid: player1.uuid, username: player1.username });
                joinMatchByCode(player2.token, game.tournament?.code as string, game.tournament?.roundNo as number, { uuid: player2.uuid, username: player2.username });
            } catch (err: any) {
                emitError(err.message, game.roomId);
            }
        }

        /**if (game.reMatch && game.gameMode === 'remoteGame' && !other.socketReady) {
            ConnectionHandler.getInstance().getServer().to(other.socket.id).emit("waitingRematch", other.username);
        }*/

        MatchManager.getInstance().startRemoteMatch(game);
    }
}