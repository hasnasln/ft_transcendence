import {Game, Position} from "./game";
import {GameEntityFactory} from "./gameEntity";
import {GameEmitter} from "./gameEmitter";

type Middleware = (g: Game, dt: number) => boolean;

export class PhysicsEngine {
    private static instance: PhysicsEngine;
    private static readonly middlewareChain: Middleware[] = [
        skipIfMatchOver,
        skipIfSetPausedOrOver,
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

//todo it is not engine's responsibility 
function skipIfMatchOver(g: Game, _dt: number): boolean {
	return g.state === 'playing';
}

function skipIfSetPausedOrOver(g: Game, _dt: number): boolean {
	return !(g.scoringManager.isSetOver() || g.isPaused);
}

function moveBall(g: Game, dt: number): boolean {
	g.environment.ball.position.x += g.environment.ball.velocity.x * dt;
	g.environment.ball.position.y += g.environment.ball.velocity.y * dt;
	return true;
}

function movePaddles(g: Game, dt: number): boolean {
	const upperBound = g.environment.ground.height / 2 - g.environment.leftPaddle.height / 2 + (1.5 * g.environment.leftPaddle.width);
	const d1 = g.leftInput!.getPaddleDelta() * g.getPaddleSpeed() * dt;
	const d2 = g.rightInput!.getPaddleDelta() * g.getPaddleSpeed() * dt;
	if (Math.abs(g.environment.leftPaddle.position.y + d1) <= upperBound) g.environment.leftPaddle.position.y += d1;
	if (Math.abs(g.environment.rightPaddle.position.y + d2) <= upperBound) g.environment.rightPaddle.position.y += d2;
	return true;
}

function handleWallBounce(g: Game, _dt: number): boolean {
	const hitTop = g.environment.ball.position.y > (g.environment.ground.height / 2 - g.environment.ball.radius) && g.environment.ball.velocity.y > 0;
	const hitBottom = g.environment.ball.position.y < -(g.environment.ground.height / 2 - g.environment.ball.radius) && g.environment.ball.velocity.y < 0;
	if ((hitTop || hitBottom) && Math.abs(g.environment.ball.position.x) <= g.environment.ground.width / 2 + g.environment.ball.radius) {
		g.environment.ball.velocity.y *= -1;
	}
	g.environment.ball.position.y = Math.max(-(g.environment.ground.height / 2 - g.environment.ball.radius), Math.min(g.environment.ball.position.y, g.environment.ground.height / 2 - g.environment.ball.radius));
	return true;
}

function handlePaddleBounce(g: Game, dt: number): boolean {
	const paddles = [
		{ paddle: g.environment.leftPaddle, direction: 1 },
		{ paddle: g.environment.rightPaddle, direction: -1 }
	];

	const current = g.environment.ball.position;
	const previous = {
		x: g.environment.ball.position.x - g.environment.ball.velocity.x * dt,
		y: g.environment.ball.position.y - g.environment.ball.velocity.y * dt
	};

	paddles.forEach(({ paddle, direction }) => {
		const relativeX = g.environment.ball.position.x - paddle.position.x;
		const xThreshold = g.environment.ball.radius + paddle.width + 1;

		const paddleTop = {x: paddle.position.x, y: paddle.position.y - paddle.height / 2};
		const paddleBottom = {x: paddle.position.x, y: paddle.position.y + paddle.height / 2};
		const tunnelled = intersectSegments(previous, current, paddleTop, paddleBottom);

		let distanceToTravel = 0;
		if (tunnelled) {
			// teleport to the edge of the paddle to override suggested position by moveBall().
			const norm = {x: tunnelled.x - g.environment.ball.position.x, y: tunnelled.y - g.environment.ball.position.y}
			const distance =  g.environment.ball.radius / Math.hypot(norm.x, norm.y);
			distanceToTravel = Math.hypot(g.environment.ball.velocity.x, g.environment.ball.velocity.y) - distance;
			g.environment.ball.position = {x: tunnelled.x + norm.x * distance, y: tunnelled.y + norm.y * distance};
		}

		if (tunnelled ||
			(Math.abs(relativeX) < xThreshold &&  // pedala yeteri kadar yakında mı ?
			g.environment.ball.velocity.x * direction < 0 && // pedala doğru hareket ediyor mu ?
			relativeX * direction > 0))           // pedalın önünde mi ?
		{
			const relativeY = g.environment.ball.position.y - paddle.position.y;
			const yThreshold = (paddle.height + g.environment.ball.radius) / 2 + 1;
			const cornerLimit = paddle.height / 2 + g.environment.ball.radius + 1;

			// Face hit
			if (Math.abs(relativeY) < yThreshold) {
				g.environment.ball.velocity.x *= -1;
				g.environment.ball.velocity.y += relativeY * 0.05;
				if (g.environment.ball.firstPedalHit++) {
					g.environment.ball.speedIncreaseFactor = 1.2;
					g.environment.ball.minimumSpeed = 0.25 * GameEntityFactory.UCF;
				}
				g.environment.ball.velocity.x *= g.environment.ball.speedIncreaseFactor;
				g.environment.ball.velocity.y *= g.environment.ball.speedIncreaseFactor;
			}
			// Corner hit
			else if (Math.abs(relativeY) <= cornerLimit && relativeY * g.environment.ball.velocity.y < 0) {
				g.environment.ball.velocity.y *= -1;
			}
		}

		/* the tunnel case's position overriding removes actual distance to travel
		* so we move the ball for remaining distance. however, this time we ignore
		* tunneling because getting double tunneling is extreme and practically
		* indicates parallel paddle movement which causes infinite loops.
		*
		* also, this behavior is really exceptional case and can cause client side
		* visualization glitches because the ball is never seen on the paddle.
		*  */
		if (distanceToTravel !== 0) {
			const len = Math.hypot(g.environment.ball.velocity.x, g.environment.ball.velocity.y);
			const delta = {x: g.environment.ball.velocity.x / len * distanceToTravel, y: g.environment.ball.velocity.y / len * distanceToTravel};
			g.environment.ball.position.x += delta.x;
			g.environment.ball.position.y += delta.y;
		}
	});


	return true;
}

function applyAirResistance(g: Game, dt: number): boolean {
	g.environment.ball.velocity.x *= g.environment.ball.airResistanceFactor;
	g.environment.ball.velocity.y *= g.environment.ball.airResistanceFactor;
	return true;
}

function enforceSpeedLimits(g: Game, dt: number): boolean {
	const speed = Math.hypot(g.environment.ball.velocity.x, g.environment.ball.velocity.y);
	if (speed < g.environment.ball.minimumSpeed) {
		g.environment.ball.velocity.x *= 1.02;
		g.environment.ball.velocity.y *= 1.02;
	} else if (speed > g.environment.ball.maximumSpeed) {
		g.environment.ball.velocity.x /= 1.02;
		g.environment.ball.velocity.y /= 1.02;
	}
	//Oyun zig-zag a dönmesin kontrolü
	if (g.environment.ball.velocity.x !== 0 && Math.abs(g.environment.ball.velocity.y / g.environment.ball.velocity.x) > 2)
		g.environment.ball.velocity.y /= 1.02;
	return true;
}

function isBallOutOfBounds(g: Game): number {
	if (g.environment.ball.position.x > g.environment.ground.width / 2 + 5 * GameEntityFactory.UCF)
		return -1;
	if (g.environment.ball.position.x < -g.environment.ground.width / 2 - 5 * GameEntityFactory.UCF)
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

function intersectSegments(a: Position, b: Position, c: Position, d: Position): Position | null {
	const ab = { x: b.x - a.x, y: b.y - a.y };
	const dc = { x: d.x - c.x, y: d.y - c.y };
	const ca = { x: c.x - a.x, y: c.y - a.y };

	const det = ab.x * dc.y - ab.y * dc.x;
	if (det === 0) {
		return null;
	}

	const t = (ca.x * dc.y - ca.y * dc.x) / det;
	const u = (ca.x * ab.y - ca.y * ab.x) / det;

	if (t < 0 || t > 1 || u < 0 || u > 1) {
		return null;
	}

	return {
		x: a.x + t * ab.x,
		y: a.y + t * ab.y
	};
}

function exportStates(g: Game, _dt: number): boolean {
    GameEmitter.getInstance().emitBallState(g);
    GameEmitter.getInstance().emitPaddleState(g);
	return true;
}


