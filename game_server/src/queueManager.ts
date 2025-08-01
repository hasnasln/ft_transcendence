import { MatchManager, Player } from "./matchManager";

export class GameQueue {
    private static instance: GameQueue;

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

        MatchManager.getInstance().createRemoteGame(player1, player2);
    }

    public dequeue(player: Player) {
        this.queuedPlayers = this.queuedPlayers.filter(p => p !== player);
    }

}