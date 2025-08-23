import { PhysicsEngine } from './engine';
import { Game } from './game';

export class GameOrchestrator {
	private engine = PhysicsEngine.getInstance();
	private games = new Set<Game>();
	private gameLoop: NodeJS.Timeout | undefined;
	private static _instance: GameOrchestrator;

	public static getInstance(): GameOrchestrator {
		if (!GameOrchestrator._instance) {
			GameOrchestrator._instance = new GameOrchestrator();
		}
		return GameOrchestrator._instance;
	}

	public add(game: Game): void {
		this.games.add(game);
	}

	public remove(game: Game): void {
		this.games.delete(game);
	}

	public start(fps: number): void {
		const interval = 1000 / fps;
		this.gameLoop = setInterval(() => {
			for (const game of this.games) {
				this.engine.update(game);
			}
		}, interval);
	}

	public stop(): void {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}
	}
}