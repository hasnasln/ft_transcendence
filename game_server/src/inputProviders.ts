import { Socket } from "socket.io";
import { Game, Paddle } from "./game";
import { predictBallY } from "./aiPlayer";
import { Player } from "./matchManager";

export interface InputProvider {
	//Returns +1 for move up, -1 for move down, or 0 for no movement
	getPaddleDelta(): number;
	getUsername(): string;
	getSocket?(): Socket;
	getUuid(): string;
}

//RemotePlayerInput listens to socket events for keydown/keyup
export class RemotePlayerInput implements InputProvider {
	private delta = 0;
	private player: Player;
	constructor(player: Player) {
		this.player = player;
		player.socket.on("player-move", ({ direction }: { direction: "up" | "down" | "stop" }) => {
			this.delta = direction === "up" ? +1 : direction === "down" ? -1 : 0;

		});
	}
	getPaddleDelta() { return this.delta; }
	getUsername() { return this.player.username; }
	getSocket() { return this.player.socket; }
	getUuid() { return this.player.uuid; }
}


export class AIPlayerInput implements InputProvider {
	private username: string;
	private level: string = "medium";
	private lastDecisionTime = 0;
	private targetY = 0;
	private refreshTime: number = 1500; //ms

	constructor(private readonly getGame: () => Game, private readonly getPaddle: () => Paddle, username: string, level: string) {
		this.username = username;
		this.level = level;

		if (level === 'easy')
			this.refreshTime = 2000; //ms
		else if (level === 'hard')
			this.refreshTime = 1000; //ms
	}

	getPaddleDelta(): number {
		const ball = this.getGame().getBall();
		const groundWidth = this.getGame().getGround().width;
		const groundHeight = this.getGame().getGround().height;

		const paddle = this.getPaddle();
		const paddleSpeed = this.getGame().getPaddleSpeed();

		const now = Date.now();

		if (now - this.lastDecisionTime >= this.refreshTime) {
			this.lastDecisionTime = now;
			this.targetY = predictBallY(ball, groundWidth / 2, groundHeight / 2);
		}

		const diff = this.targetY - paddle.position.y;
		if (Math.abs(diff) < paddleSpeed)
			return 0;
		else
			return diff > 0 ? 1 : -1;
	}

	getUsername() { return this.username; }
	getUuid() { return (''); }
}


export class LocalPlayerInput implements InputProvider {
	private delta = 0;
	private player: Player;
	private side: string;

	constructor(player: Player, side: string) {
		this.player = player;
		this.side = side;
		player.socket.on("local-input", ({ player_side, direction }: { player_side: "left" | "right", direction: "up" | "down" | "stop" }) => {

			if ((player_side === "left" && this.side === "left") || (player_side === "right" && this.side === "right"))
				this.delta = direction === "up" ? +1 : direction === "down" ? -1 : 0;

		});
	}

	getPaddleDelta() {
		return this.delta;
	}

	getUsername() {
		if (this.side === "left")
			return this.player.username;
		else
			return ("friend");
	}
	getSocket() { return this.player.socket; }
	getUuid() { return this.player.uuid; }
}
