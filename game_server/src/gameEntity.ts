import { Position } from "./game";

export interface Ball {
    readonly firstSpeedFactor: number;
    readonly airResistanceFactor: number;
    readonly radius: number;
    minimumSpeed: number;
    maximumSpeed: number;
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
        return {
            firstSpeedFactor: config.ballFirstSpeedFactor * GameEntityFactory.UCF,
            airResistanceFactor: config.ballAirResistanceFactor,
            minimumSpeed: config.ballMinimumSpeed * GameEntityFactory.UCF,
            maximumSpeed: config.ballMaximumSpeed * GameEntityFactory.UCF,
            radius: config.ballRadius * GameEntityFactory.UCF,
            speedIncreaseFactor: config.ballSpeedIncreaseFactor,
            firstPedalHit: 0,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
        };
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
