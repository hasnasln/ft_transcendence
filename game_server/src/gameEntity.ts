import { Position } from "./game";

export interface Paddle {
    readonly width: number;
    readonly height: number;
    position: Position;
}

export interface Ground {
    readonly width: number;
    readonly height: number;
}

export interface GameEntityConfig {
    ballFirstSpeedFactor: number;
    ballAirResistanceFactor: number;
    ballMinimumSpeed: number;
    ballMaximumSpeed: number;
    ballRadius: number;
    ballSpeedIncreaseFactor: number;

    groundWidth: number;
    groundHeight: number;

    paddleWidth: number;
    paddleHeight: number;
    paddleSpeed: number;

    leftPaddleX: number;
    leftPaddleInitialY: number;
    rightPaddleX: number;
    rightPaddleInitialY: number;
}

export const DEFAULT_GAME_ENTITY_CONFIG: GameEntityConfig = {
    ballFirstSpeedFactor: 0.18,
    ballAirResistanceFactor: 0.998,
    ballMinimumSpeed: 0.18,
    ballMaximumSpeed: 0.4,
    ballRadius: 0.25,
    ballSpeedIncreaseFactor: 1.7,

    groundWidth: 20,
    groundHeight: 20 * 152.5 / 274, // aspect ratio

    paddleWidth: 0.2,
    paddleHeight: 20 * 152.5 * 0.3 / 274, // 30% of ground height
    paddleSpeed: 0.2,

    leftPaddleX: -10 + 0.2,
    leftPaddleInitialY: 0,
    rightPaddleX: 10 - 0.2,
    rightPaddleInitialY: 0,
}

export class GameEntityFactory {
    private static instance: GameEntityFactory;
    public static readonly UCF = 40; // Unit Conversion Factor

    public static getInstance(): GameEntityFactory {
        if (!GameEntityFactory.instance) {
            GameEntityFactory.instance = new GameEntityFactory();
        }
        return GameEntityFactory.instance;
    }

    public createDefaultBall(config: GameEntityConfig): Ball {
        return new Ball(config);
    }

    public createDefaultLeftPaddle(config: GameEntityConfig): Paddle {
        return this.createPaddle(
            config.paddleWidth * GameEntityFactory.UCF, // width
            config.paddleHeight * GameEntityFactory.UCF, // height
            config.leftPaddleX * GameEntityFactory.UCF, // x
            config.leftPaddleInitialY * GameEntityFactory.UCF, // y
        );
    }

    public createDefaultRightPaddle(config: GameEntityConfig): Paddle {
        return this.createPaddle(
            config.paddleWidth * GameEntityFactory.UCF, // width
            config.paddleHeight * GameEntityFactory.UCF, // height
            config.rightPaddleX * GameEntityFactory.UCF, // x
            config.rightPaddleInitialY * GameEntityFactory.UCF, // y
        );
    }

    public createPaddle(width: number, height: number, x: number, y: number): Paddle {
        return {
            width: width,
            height: height,
            position: { x: x, y: y }
        };
    }

    public createDefaultGround(config: GameEntityConfig): Ground {
        return {
            width: config.groundWidth * GameEntityFactory.UCF,
            height: config.groundHeight * GameEntityFactory.UCF
        }
    }
}

export class Ball {
    public readonly firstSpeedFactor: number;
    public readonly airResistanceFactor: number;
    public readonly radius: number;
    public minimumSpeed: number;
    public maximumSpeed: number;
    public speedIncreaseFactor: number;
    public firstPedalHit: number;
    public position: Position;
    public velocity: Position;
    private groundHeight: number;

    constructor(config: GameEntityConfig) {
        this.firstSpeedFactor = config.ballFirstSpeedFactor * GameEntityFactory.UCF;
        this.airResistanceFactor = config.ballAirResistanceFactor;
        this.radius = config.ballRadius * GameEntityFactory.UCF;
        this.minimumSpeed = config.ballMinimumSpeed * GameEntityFactory.UCF;
        this.maximumSpeed = config.ballMaximumSpeed * GameEntityFactory.UCF;
        this.speedIncreaseFactor = config.ballSpeedIncreaseFactor;
        this.firstPedalHit = 0;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.groundHeight = config.groundHeight;
    }

    public reset() {
        this.firstPedalHit = 0;
		this.speedIncreaseFactor = 1.7;
		this.minimumSpeed = this.firstSpeedFactor;
		this.velocity = { x: 0, y: 0 };
		this.position = { x: 0, y: Math.random() * (0.8 * this.groundHeight) - 0.4 * this.groundHeight };
    }

    public shove(lastScorer: "leftPlayer" | "rightPlayer") {
        const random = (Math.random() * 2 - 1) * Math.PI / 6;
        const angle = lastScorer == 'leftPlayer' ? random : Math.PI - random;

        this.velocity = { x: Math.cos(angle) * this.firstSpeedFactor, y: Math.sin(angle) * this.firstSpeedFactor };
	}
}