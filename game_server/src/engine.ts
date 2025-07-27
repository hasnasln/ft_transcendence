import { Game } from "./game";
import { matchManager } from "./server";
import { pushWinnerToTournament } from "./tournament";
import { emitError } from "./errorHandling";
import { GameEmitter } from "./gameEmitter";

type Middleware = (g: Game, dt: number) => boolean;

export class PhysicsEngine {
    private static instance: PhysicsEngine;
    private static readonly middlewareChain: Middleware[] = [
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

    public static getInstance(): PhysicsEngine {
        if (!PhysicsEngine.instance) {
            PhysicsEngine.instance = new PhysicsEngine();
        }
        return PhysicsEngine.instance;
    }

    public update(game: Game): void {
        let dt = 1;
        const now = Date.now();
        if (game.lastUpdatedTime !== undefined) {
            dt = ((now - game.lastUpdatedTime) * 60) / 1000;
        }

        game.lastUpdatedTime = now;

        for (const mw of PhysicsEngine.middlewareChain) {
            if (!mw(game, dt)) break;
        }
    }

}

function skipIfMatchOver(g: Game, _dt: number): boolean {
	if (g.matchOver) {
		if (g.gameMode === 'tournament') {
			const winnerInput = g.matchWinner === 'leftPlayer' ? g.leftInput : g.rightInput;
			const uuid = winnerInput.getUuid();
			const username = winnerInput.getUsername();
			try {
				pushWinnerToTournament(g.match.tournament?.code as string, g.match.tournament?.roundNo as number, { uuid, username });
			} catch (err: any) {
				emitError(err.message, g.roomId, g.io);
			}
		}
		g.pauseGameLoop();
        GameEmitter.getInstance().emitGameState(g);

		if (g.match.gameMode === 'localGame' || g.match.gameMode === 'vsAI')
			matchManager.clearMatch(g.match);
		g.match.end();
		return false;
	}
	return true;
}

function skipIfSetOrPausedOver(g: Game, _dt: number): boolean {
	return !(g.scoringManager.isSetOver() || g.isPaused);
}

function moveBall(g: Game, dt: number): boolean {
	g.ball.position.x += g.ball.velocity.x * dt;
	g.ball.position.y += g.ball.velocity.y * dt;
	return true;
}

function movePaddles(g: Game, _dt: number): boolean {
	const upperBound = g.ground.height / 2 - g.paddle1.height / 2 + (1.5 * g.paddle1.width);
	const d1 = g.leftInput.getPaddleDelta() * g.paddleSpeed * _dt;
	const d2 = g.rightInput.getPaddleDelta() * g.paddleSpeed * _dt;
	if (Math.abs(g.paddle1.position.y + d1) <= upperBound) g.paddle1.position.y += d1;
	if (Math.abs(g.paddle2.position.y + d2) <= upperBound) g.paddle2.position.y += d2;
	return true;
}

function handleWallBounce(g: Game, _dt: number): boolean {
	const hitTop = g.ball.position.y > (g.ground.height / 2 - g.ball.radius) && g.ball.velocity.y > 0;
	const hitBottom = g.ball.position.y < -(g.ground.height / 2 - g.ball.radius) && g.ball.velocity.y < 0;
	if ((hitTop || hitBottom) && Math.abs(g.ball.position.x) <= g.ground.width / 2 + g.ball.radius) {
		g.ball.velocity.y *= -1;
	}
	return true;
}

function handlePaddleBounce(g: Game, _dt: number): boolean {
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
					g.ball.minimumSpeed = 0.25 * g.UCF;
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
}

function applyAirResistance(g: Game, _dt: number): boolean {
	g.ball.velocity.x *= g.ball.airResistanceFactor;
	g.ball.velocity.y *= g.ball.airResistanceFactor;
	return true;
}

function enforceSpeedLimits(g: Game, _dt: number): boolean {
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
}

function isBallOutOfBounds(g: Game): number {
	if (g.ball.position.x > g.ground.width / 2 + 5 * g.UCF)
		return -1;
	if (g.ball.position.x < -g.ground.width / 2 - 5 * g.UCF)
		return 1;
	return 0;
}

function handleScoring(g: Game, _dt: number): boolean {
	const ballArea = isBallOutOfBounds(g);
	if (ballArea === 0) {
		return true;
	}

	if (ballArea === -1) {
		g.scorePoint('leftPlayer');
	} else {
		g.scorePoint('rightPlayer');
	}
    GameEmitter.getInstance().emitSetState(g);

	return false;
}

 function exportStates(g: Game, _dt: number): boolean {
    GameEmitter.getInstance().emitBallState(g);
    GameEmitter.getInstance().emitPaddleState(g);
	return true;
}
