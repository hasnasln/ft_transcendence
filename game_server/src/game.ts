import { Server } from "socket.io";
import { InputProvider } from "./inputProviders";
import { GameMode, matchManager } from "./server";
import { pushWinnerToTournament } from "./tournament";
import { Match } from "./matchManager";
import { emitErrorToClient } from "./errorHandling";

type Side = 'leftPlayer' | 'rightPlayer';

interface GameConstants {
	groundWidth: number;
	groundHeight: number;
	ballRadius: number;
	paddleWidth: number;
	paddleHeight: number;
}

interface GameState {
	matchOver: boolean;
	setOver: boolean;
	isPaused: boolean;
	matchWinner?: Side;
	matchDisconnection: boolean;
	roundNumber?: number;
}

interface PaddleState {
	p1y: number;
	p2y: number;
}

interface Position {
	x: number;
	y: number;
}

export interface Ball {
	readonly firstSpeedFactor: number;
	readonly airResistanceFactor: number;
	minimumSpeed: number;
	maximumSpeed: number;
	readonly radius: number;
	speedIncreaseFactor: number;
	firstPedalHit: number;
	position: Position;
	velocity: Position;
}

export interface Paddle {
	readonly width: number;
	readonly height: number;
	position: Position;
}


export class Game {
	public ball: Ball;
	public paddle1: Paddle;
	public paddle2: Paddle;
	public lastPaddleUpdate: PaddleState | undefined = undefined;
	public paddleSpeed: number;
	public ground: { width: number; height: number };
	public points: { leftPlayer: number, rightPlayer: number };
	public sets: { leftPlayer: number, rightPlayer: number };
	public unitConversionFactor = 40;
	public groundWidth = 20 * this.unitConversionFactor;
	public matchOver = true;
	public setOver = true;
	public isPaused = true;
	public lastUpdatedTime: number | undefined = undefined; /* ms */
	public gameMode: GameMode;
	public roomId: string;
	public io: Server;
	public interval!: NodeJS.Timeout | undefined;
	public matchWinner: Side | undefined = undefined;
	public matchDisconnection: boolean = false;
	public match: Match;


	constructor(public leftInput: InputProvider, public rightInput: InputProvider, io: Server, roomId: string, gameMode: GameMode, match: Match) {
		this.gameMode = gameMode;
		this.ball =
		{
			firstSpeedFactor: 0.18 * this.unitConversionFactor,
			airResistanceFactor: 0.998,
			minimumSpeed: 0.18 * this.unitConversionFactor,
			maximumSpeed: 0.4 * this.unitConversionFactor,
			radius: 0.25 * this.unitConversionFactor,
			speedIncreaseFactor: 1.7,
			firstPedalHit: 0,
			position: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
		};

		this.ground =
		{
			width: this.groundWidth,
			height: this.groundWidth * (152.5) / 274,
		};

		const w = 0.2 * this.unitConversionFactor;
		this.paddle1 =
		{
			width: w,
			height: this.ground.height * (0.3),
			position: {
				x: -this.groundWidth / 2 + w,
				y: 0
			}
		};

		this.paddle2 =
		{
			width: 0.2 * this.unitConversionFactor,
			height: this.ground.height * (0.3),
			position: {
				x: this.groundWidth / 2 - this.paddle1.width,
				y: 0
			}
		};

		this.paddleSpeed = 0.2 * this.unitConversionFactor;

		this.points = { leftPlayer: 0, rightPlayer: 0 };
		this.sets = { leftPlayer: 0, rightPlayer: 0 };

		this.io = io;
		this.roomId = roomId;
		this.match = match;
	}

	public getBall() {
		return this.ball;
	}

	public getGround() {
		return this.ground;
	}

	public getPaddleSpeed() {
		return this.paddleSpeed;
	}

	public getPaddle2() {
		return this.paddle2;
	}


	public resetScores() {
		this.points.leftPlayer = 0;
		this.points.rightPlayer = 0;
	}



	public startNextSet() {
		this.lastUpdatedTime = undefined;
		this.setOver = true;

		this.exportBallState();
		this.exportSetState();
		this.exportGameState();

		setTimeout(() => {
			this.resetScores();
			this.setOver = false;
			this.exportGameState();
			this.lastUpdatedTime = Date.now();
		}, 3000);
	}


	public resetBall(lastScorer: "leftPlayer" | "rightPlayer") {
		this.lastUpdatedTime = undefined;
		this.ball.firstPedalHit = 0;
		this.ball.speedIncreaseFactor = 1.7;
		this.ball.minimumSpeed = this.ball.firstSpeedFactor;
		// 🎯 Önce topu durdur
		this.ball.velocity = { x: 0, y: 0 };

		// 🎯 Topu ortada sabitle
		this.ball.position = { x: 0, y: Math.random() * (0.8 * this.ground.height) - 0.4 * this.ground.height };

		// 🎯 Belirli bir süre bekle ( 1 saniye)
		setTimeout(() => {
			const angle = lastScorer == 'leftPlayer' ? (Math.random() * 2 - 1) * Math.PI / 6 : Math.PI - (Math.random() * 2 - 1) * Math.PI / 6;

			this.ball.velocity = { x: Math.cos(angle) * this.ball.firstSpeedFactor, y: Math.sin(angle) * this.ball.firstSpeedFactor };
			this.lastUpdatedTime = Date.now();
		}, 1000); // 1000ms = 1 saniye
	}


	public scorePoint(winner: Side) {
		if (this.matchOver || this.isPaused) return;

		this.points[winner]++;

		const p1 = this.points.leftPlayer;
		const p2 = this.points.rightPlayer;

		// Kontrol: Set bitti mi?
		if ((p1 >= 3 || p2 >= 3) && Math.abs(p1 - p2) >= 2) {
			if (p1 > p2) {
				this.sets.leftPlayer++;
			} else {
				this.sets.rightPlayer++;
			}

			const matchControl = (this.sets.leftPlayer === 3 || this.sets.rightPlayer === 3);
			if (!matchControl)
				this.startNextSet();

			this.resetBall(winner);

			// Kontrol: Maç bitti mi?
			if (matchControl) {
				this.matchOver = true;
				this.matchWinner = winner;
				this.exportBallState();
				this.exportGameState();
			}
		}
		else   //set bitmedi
		{
			this.resetBall(winner);
		}
	}

	public pauseGameLoop() {
		if (!this.matchOver)
			this.isPaused = true;
		this.lastUpdatedTime = undefined;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
		console.log(`maç pause edildi: ${this.leftInput.getUsername()}_vs_${this.rightInput.getUsername()}`);
	}

	public resumeGameLoop() {
		this.isPaused = false;
		if (!this.interval) {
			this.interval = setInterval(() => update(this), 1000 / 120);
		}

		this.lastUpdatedTime = Date.now();
		console.log(`durdurulmuş maç resume edildi: ${this.leftInput.getUsername()}_vs_${this.rightInput.getUsername()}`);
	}


	public exportGameConstants() {
		const gameConstants: GameConstants =
		{
			groundWidth: this.ground.width / this.unitConversionFactor,
			groundHeight: this.ground.height / this.unitConversionFactor,
			ballRadius: this.ball.radius / this.unitConversionFactor,
			paddleWidth: this.paddle1.width / this.unitConversionFactor,
			paddleHeight: this.paddle1.height / this.unitConversionFactor
		};

		this.io.to(this.roomId).emit("gameConstants", gameConstants);
	}

	public exportGameState() {
		const gameState: GameState =
		{
			matchOver: this.matchOver,
			setOver: this.setOver,
			isPaused: this.isPaused,
			matchWinner: this.matchWinner,
			matchDisconnection: this.matchDisconnection,
			roundNumber: this.match.tournament?.roundNo,
		};

		this.io.to(this.roomId).emit("gameState", gameState);
	}

	public exportSetState() {
		const setState = {
			points: this.points,
			sets: this.sets,
			usernames: { left: this.leftInput.getUsername(), right: this.rightInput.getUsername() }
		};

		this.io.to(this.roomId).emit("updateState", setState);
	}

	public exportBallState() {

		const actualX = this.ball.position.x / this.unitConversionFactor;
		const actualY = this.ball.position.y / this.unitConversionFactor;

		if (isNaN(actualX) || isNaN(actualY)) {
			console.error(`Invalid ball coordinates: x=${actualX}, y=${actualY}`);
			return;
		}

		//+05.91:-21.33
		const absX = Math.abs(actualX).toFixed(2).padStart(5, '0');
		const absY = Math.abs(actualY).toFixed(2).padStart(5, '0');
		const signX = actualX < 0 ? '-' : '+';
		const signY = actualY < 0 ? '-' : '+';

		const message = `${signX}${absX}:${signY}${absY}`;
		if (message.length !== 13) {
			console.error(`Invalid message length: ${message.length}`);
			return;
		}

		this.io.to(this.roomId).emit("bu", message);
	}

	public finishIncompleteMatch(username?: string) {
		let inCompleteWinner;
		if (username)
			inCompleteWinner = username === this.leftInput.getUsername() ? 'leftPlayer' : 'rightPlayer' as Side;
		else
			inCompleteWinner = undefined;
		this.matchOver = true;
		this.matchWinner = inCompleteWinner;
		this.matchDisconnection = true;
		this.exportGameState();
		console.log(`incomplete maç bitti : inCompleteWinner = ${inCompleteWinner}`);
	}


	public exportPaddleState() {
		const paddleState: PaddleState =
		{
			p1y: this.paddle1.position.y / this.unitConversionFactor,
			p2y: this.paddle2.position.y / this.unitConversionFactor
		}

		if (this.lastPaddleUpdate && this.lastPaddleUpdate.p1y === paddleState.p1y && this.lastPaddleUpdate.p2y === paddleState.p2y) {
			return; // No change in paddle positions, skip emitting
		}
		this.lastPaddleUpdate = paddleState;
		this.io.to(this.roomId).emit("paddleUpdate", paddleState);
	}


	public startGameLoop() {
		this.exportGameConstants();
		this.exportSetState();

		this.matchOver = false;
		this.setOver = false;
		this.isPaused = false;

		this.exportGameState();

		const sides = [{ socket: typeof this.leftInput.getSocket === 'function' ? this.leftInput.getSocket()! : null },
		{ socket: typeof this.rightInput.getSocket === 'function' ? this.rightInput.getSocket()! : null }];

		sides.forEach(({ socket }) => {
			if (socket) {
				socket.on("pause-resume", (data: { status: string }) => {
					if (data.status === "pause" && !this.isPaused)
						this.pauseGameLoop();
					else if (data.status === "resume" && this.isPaused)
						this.resumeGameLoop();
				});
			}
		});
		if (this.isPaused === false) {
			Math.random() <= 0.5 ? this.resetBall('leftPlayer') : this.resetBall('rightPlayer');
		}

		this.interval = setInterval(() => update(this), 1000 / 120); // 120 FPS

	}

}


type Middleware = (g: Game, dt: number) => boolean;

const skipIfMatchOver: Middleware = (g, _dt) => {
	if (g.matchOver) {
		if (g.gameMode === 'tournament') {
			const winnerInput = g.matchWinner === 'leftPlayer' ? g.leftInput : g.rightInput;
			const uuid = winnerInput.getUuid();
			const username = winnerInput.getUsername();
			try {
				pushWinnerToTournament(g.match.tournament?.code as string, g.match.tournament?.roundNo as number, { uuid, username });
			}
			catch (err: any) {
				emitErrorToClient(err.message, g.roomId, g.io);
			}
		}
		g.pauseGameLoop();
		g.exportGameState();

		if (g.match.gameMode === 'localGame' || g.match.gameMode === 'vsAI')
			matchManager.clearMatch(g.match);
		console.log(`maç bitirildi: ${g.leftInput.getUsername()}_vs_${g.rightInput.getUsername()}`);
		g.match.end();
		return false;
	}
	return true;
};

const skipIfSetOrPausedOver: Middleware = (g, _dt) => !(g.setOver || g.isPaused);

const moveBall: Middleware = (g, dt) => {
	g.ball.position.x += g.ball.velocity.x * dt;
	g.ball.position.y += g.ball.velocity.y * dt;
	return true;
};

const movePaddles: Middleware = (g, _dt) => {
	const upperBound = g.ground.height / 2 - g.paddle1.height / 2 + (1.5 * g.paddle1.width);
	const d1 = g.leftInput.getPaddleDelta() * g.paddleSpeed;
	const d2 = g.rightInput.getPaddleDelta() * g.paddleSpeed;
	if (Math.abs(g.paddle1.position.y + d1) <= upperBound) g.paddle1.position.y += d1;
	if (Math.abs(g.paddle2.position.y + d2) <= upperBound) g.paddle2.position.y += d2;
	return true;
};

const handleWallBounce: Middleware = (g, _dt) => {
	const hitTop = g.ball.position.y > (g.ground.height / 2 - g.ball.radius) && g.ball.velocity.y > 0;
	const hitBottom = g.ball.position.y < -(g.ground.height / 2 - g.ball.radius) && g.ball.velocity.y < 0;
	if ((hitTop || hitBottom) && Math.abs(g.ball.position.x) <= g.ground.width / 2 + g.ball.radius) {
		g.ball.velocity.y *= -1;
	}
	return true;
};

const handlePaddleBounce: Middleware = (g, _dt) => {
	const paddles = [
		{ paddle: g.paddle1, direction: 1 },
		{ paddle: g.paddle2, direction: -1 }
	];

	paddles.forEach(({ paddle, direction }) => {
		const relativeX = g.ball.position.x - paddle.position.x;
		const xThreshold = g.ball.radius + paddle.width + 1;
		if (Math.abs(relativeX) < xThreshold &&  // pedala yeteri kadar yakında mı ?
			g.ball.velocity.x * direction < 0 && // pedala doğru hareket ediyor mu ?
			relativeX * direction > 0)           // pedalın önünde mi ?
		{
			const relativeY = g.ball.position.y - paddle.position.y;
			const yThreshold = (paddle.height + g.ball.radius) / 2 + 1;
			const cornerLimit = paddle.height / 2 + g.ball.radius + 1;

			// Face hit
			if (Math.abs(relativeY) < yThreshold) {
				g.ball.velocity.x *= -1;
				g.ball.velocity.y += relativeY * 0.05;
				if (g.ball.firstPedalHit++) {
					g.ball.speedIncreaseFactor = 1.2;
					g.ball.minimumSpeed = 0.25 * g.unitConversionFactor;
				}
				g.ball.velocity.x *= g.ball.speedIncreaseFactor;
				g.ball.velocity.y *= g.ball.speedIncreaseFactor;
			}
			// Corner hit
			else if (Math.abs(relativeY) <= cornerLimit && relativeY * g.ball.velocity.y < 0) {
				g.ball.velocity.y *= -1;
			}
		}
	});

	return true;
};

const applyAirResistance: Middleware = (g, _dt) => {
	g.ball.velocity.x *= g.ball.airResistanceFactor;
	g.ball.velocity.y *= g.ball.airResistanceFactor;
	return true;
};

const enforceSpeedLimits: Middleware = (g, _dt) => {
	const speed = Math.hypot(g.ball.velocity.x, g.ball.velocity.y);
	if (speed < g.ball.minimumSpeed) {
		g.ball.velocity.x *= 1.02;
		g.ball.velocity.y *= 1.02;
	} else if (speed > g.ball.maximumSpeed) {
		g.ball.velocity.x /= 1.02;
		g.ball.velocity.y /= 1.02;
	}
	//Oyun zig-zag a dönmesin kontrolü
	if (g.ball.velocity.x !== 0 && Math.abs(g.ball.velocity.y / g.ball.velocity.x) > 2)
		g.ball.velocity.y /= 1.02;
	return true;
};

const isBallOutOfBounds = (g: Game): number => {
	if (g.ball.position.x > g.ground.width / 2 + 5 * g.unitConversionFactor)
		return -1;
	if (g.ball.position.x < -g.ground.width / 2 - 5 * g.unitConversionFactor)
		return 1;
	return 0;
}

const handleScoring: Middleware = (g, _dt) => {
	const ballArea = isBallOutOfBounds(g);
	if (ballArea === 0) {
		return true;
	}

	if (ballArea === -1) {
		g.scorePoint('leftPlayer');
	} else {
		g.scorePoint('rightPlayer');
	}
	g.exportSetState();

	return false;
};

const exportStates: Middleware = (g, _dt) => {
	g.exportBallState();
	g.exportPaddleState();
	return true;
};

const middlewareChain: Middleware[] = [
	skipIfMatchOver,
	skipIfSetOrPausedOver,
	moveBall,
	movePaddles,
	handleWallBounce,
	handlePaddleBounce,
	applyAirResistance,
	enforceSpeedLimits,
	handleScoring,
	exportStates
];

function update(game: Game): void {

	let dt = 1;
	const now = Date.now();
	if (game.lastUpdatedTime !== undefined) {
		dt = ((now - game.lastUpdatedTime) * 60) / 1000;
	}

	game.lastUpdatedTime = now;

	for (const mw of middlewareChain) {
		if (!mw(game, dt)) break;
	}
}

