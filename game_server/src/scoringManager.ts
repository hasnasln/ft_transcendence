import { Side } from './game';

export class ScoringManager {

	private scores: { [side in Side]: number } = { leftPlayer: 0, rightPlayer: 0 };
	private sets: { [side in Side]: number } = { leftPlayer: 0, rightPlayer: 0 };
	private setOver: boolean = true;

	public constructor() {

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
	}

	public resetSet(): void {
		this.scores = { leftPlayer: 0, rightPlayer: 0 };
		this.setOver = false;
	}

	/** returns true if new round should start */
	public continueNewRound(): boolean {
		return this.sets.leftPlayer >= 3 || this.sets.rightPlayer >= 3;
	}

	public getScores(): { [side in Side]: number } {
		return this.scores;
	}

	public getSets(): { [side in Side]: number } {
		return this.sets;
	}
}
