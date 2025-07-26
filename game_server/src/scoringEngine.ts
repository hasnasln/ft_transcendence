export class ScoringEngine {

	private scores: { [teamId: number]: number } = { 0: 0, 1: 0 };
	private sets: { [teamId: number]: number } = { 0: 0, 1: 0 };

	public constructor() {

	}

	public onScore(teamId: 0 | 1): void {
		this.scores[teamId]++;
	}

	/** returns true if new round should start */
	public continueNewRound(): boolean {
		
		return false;
	}
}
