import { Socket } from "socket.io";
import { Game } from "./game";
import { Paddle } from "./gameEntity";
import { predictBallY } from "./aiPlayer";
import { Player } from "./matchManager";

export interface InputProvider {
	//Returns +1 for move up, -1 for move down, or 0 for no movement
	getPaddleDelta(): -1 | 0 | 1;
	getUsername(): string;
	getSocket?(): Socket;
	getUuid(): string;
	init?(): void;
}

//RemotePlayerInput listens to socket events for keydown/keyup
export class RemotePlayerInput implements InputProvider {
	private delta: -1 | 0 | 1 = 0;
	private player: Player;
	constructor(player: Player) {
		this.player = player;
	}

	init(): void {
		this.player.socket.on("player-move", (data: { direction: "up" | "down" | "stop" }) => {
			if (data.direction === "up") {
				this.delta = 1;
			} else if (data.direction === "down") {
				this.delta = -1;
			} else {
				this.delta = 0;
			}
		});
	}

	getPaddleDelta() { return this.delta; }
	getUsername() { return this.player.username; }
	getSocket() { return this.player.socket; }
	getUuid() { return this.player.uuid; }
}

export class AIPlayerInput implements InputProvider {
	private readonly username: string;
	private readonly refreshTime: number = 1500; //ms
	private lastDecisionTime = 0;
	private targetY = 0;
	public game: Game;
	public paddle: Paddle;


	constructor(game: Game, paddle: Paddle, level: string) {
		this.game = game;
		this.paddle = paddle;
		const aiNames = ["Hamza (AI)", "Hasan (AI)", "Fatma (AI)", "Ayhan (AI)", "Batuhan (AI)"];
		this.username = aiNames[Math.floor(Math.random() * aiNames.length)];

		if (level === 'easy')
			this.refreshTime = 2000;
		else if (level === 'medium')
			this.refreshTime = 1500;
		else if (level === 'hard')
			this.refreshTime = 1000;
	}

	getPaddleDelta(): -1 | 0 | 1 {
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
		return diff > 0 ? 1 : -1;
	}

	public getGame(): Game {
		return this.game;
	}

	public getPaddle(): Paddle {
		return this.paddle;
	}

	getUsername() { return this.username; }
	getUuid() { return (''); }
}


export class LocalPlayerInput implements InputProvider {
	private delta: -1 | 0 | 1 = 0;
	private player: Player;
	private side: string;

	constructor(player: Player, side: string) {
		this.player = player;
		this.side = side;
	}

	init(): void {
		this.player.socket.on("local-input", ({ player_side, direction }: { player_side: "left" | "right", direction: "up" | "down" | "stop" }) => {
			if ((player_side === "left" && this.side === "left")
			|| (player_side === "right" && this.side === "right"))
				this.delta = direction === "up" ? + 1 : direction === "down" ? -1 : 0;

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
