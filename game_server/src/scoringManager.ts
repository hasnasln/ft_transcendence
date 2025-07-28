import { Game, Side } from './game';
import { GameEmitter } from './gameEmitter';

export class ScoringManager {

	private scores: { [side in Side]: number } = { leftPlayer: 0, rightPlayer: 0 };
	private sets: { [side in Side]: number } = { leftPlayer: 0, rightPlayer: 0 };
	private setOver: boolean = false;
	private game: Game;

	public constructor(game: Game) {
		this.game = game;
	}

	public onScore(side: Side): void {
		this.scores[side]++;

		const leftScore = this.scores.leftPlayer;
		const rightScore = this.scores.rightPlayer;

		if ((leftScore >= 3 || rightScore >= 3) && Math.abs(leftScore - rightScore) >= 2) {
			const winner: Side = leftScore > rightScore ? 'leftPlayer' : 'rightPlayer';
			this.completeSet(winner);
		}
	}

	private completeSet(winner: Side): void {
		this.sets[winner]++;
		this.setOver = true;
		if (this.continueNewRound()) {
			this.startNextSet();
		}
	}

	private startNextSet(): void {
		this.game.lastUpdatedTime = undefined;
		setTimeout(() => {
			this.resetSet();
			GameEmitter.getInstance().emitGameState(this.game);
			GameEmitter.getInstance().emitSetState(this.game);
			this.game.lastUpdatedTime = Date.now();
		}, 3000);
	}

	public resetSet(): void {
		this.scores = { leftPlayer: 0, rightPlayer: 0 };
		this.setOver = false;
	}

	/** returns true if new round should start */
	public continueNewRound(): boolean {
		return this.sets.leftPlayer < 3 && this.sets.rightPlayer < 3;
	}

	public getMatchWinner(): Side | undefined {
		if (this.continueNewRound()) return undefined;
		return this.sets.leftPlayer > this.sets.rightPlayer ? 'leftPlayer' : 'rightPlayer';
	}

	public getScores(): { [side in Side]: number } {
		return this.scores;
	}

	public getSets(): { [side in Side]: number } {
		return this.sets;
	}

	public isSetOver(): boolean {
		return this.setOver;
	}

	public setSetOver(value: boolean): void {
		this.setOver = value;
	}
}
