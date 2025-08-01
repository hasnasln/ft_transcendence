import { MatchManager } from "./matchManager";
import { ConnectionHandler } from "./connection";
import { GameOrchestrator } from "./orchestrator";

ConnectionHandler.getInstance().init();
GameOrchestrator.getInstance().start(60);

setInterval(() => {
	const now = Date.now();
	for (const [username, disconnectEvent] of MatchManager.getInstance().disconnectTimestamps) {
		if (now - disconnectEvent.timestamp > 15_000) {
			MatchManager.getInstance().disconnectTimestamps.delete(username);
			const {player,game} = disconnectEvent;
			if (game.state === 'playing') {
				const opponent = game.players.find(p => p.username !== player.username)!;
				game.finishIncompleteMatch(opponent.username);
			}
			MatchManager.getInstance().clearGame(game);
		}
	}
}, 1000);


