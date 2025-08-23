import {gameInstance, GameMode, GamePhase} from "../play";
import {GameEventBus} from "./gameEventBus";
import {WebSocketClient} from "./wsclient";

export interface MatchPlayers {
    left: { socketId: string, username: string };
    right: { socketId: string, username: string };
    roundNo?: number;
    finalMatch?: boolean
}

type Side = 'leftPlayer' | 'rightPlayer'

interface GameConstants {
    groundWidth: number;
    groundHeight: number;
    ballRadius: number;
    paddleWidth: number;
    paddleHeight: number;
    paddleSpeed: number;
}

export interface GameState {
    setOver: boolean;
    isPaused: boolean;
    roundNumber?: number;
    tournamentName?: string;
    phase: GamePhase;
}

interface SetState {
    points: { leftPlayer: number, rightPlayer: number };
    sets: { leftPlayer: number, rightPlayer: number };
    usernames: { left: string, right: string }
}

export interface Vector {
    x: number;
    y: number;
}

interface PaddleState {
    p1y: number;
    p2y: number;
}

export interface GameEndInfo {
    matchWinner?: Side;
    endReason: 'normal' | 'disconnection' | 'unknown';
}

export class GameInfo {
    public constants: GameConstants | null = null;
    public state: GameState | null = null;
    public gameEndInfo: GameEndInfo | null = null;
    public paddle: PaddleState | null = null;
    public mode: GameMode;
    public ballPosition: Vector | null = null;
    public ballVelocity: Vector = {x:0, y:0}
    public setState: SetState | null = null;

    constructor(mode: GameMode) {
        this.mode = mode;
    }

    public isReadyToStart(): boolean {
        return this.constants != null &&
            this.state != null &&
            this.setState != null &&
            this.paddle != null &&
            this.ballPosition != null;
    }
}

export function waitForMatchReady(): Promise<MatchPlayers> {
    return new Promise((resolve) => {
        WebSocketClient.getInstance().once("match-ready", (matchPlayers: MatchPlayers) => resolve(matchPlayers));
    });
}

export function waitForRematchApproval(): Promise<boolean> {
    const rival = gameInstance.currentRival || "rakip";
    return new Promise((resolve) => {
        gameInstance.uiManager.onInfoShown("game.InfoMessage.request_sent_to_rival", [{key:"rival", value: rival}]);
        WebSocketClient.getInstance().on("rematch-ready", () => {
            gameInstance.uiManager.onInfoShown("game.InfoMessage.match_starting");
            gameInstance.runAfter(() => {
                gameInstance.uiManager.onInfoHidden();
                resolve(true);
            }, 1000);
        });

        gameInstance.runAfter(() => {
            gameInstance.uiManager.onInfoShown("game.InfoMessage.rival_no_confirmation", [{key:"rival", value:rival}]);
            gameInstance.runAfter(() => {
                gameInstance.uiManager.onInfoHidden();
            }, 2000);
            resolve(false);
        }, 20 * 1000);
    });
}

export function listenStateUpdates(gameInfo: GameInfo): void {
    WebSocketClient.getInstance().on("init", (constants: GameConstants) => gameInfo.constants = constants);
    WebSocketClient.getInstance().on("gameState", (state: GameState) => gameInfo.state = state);
    WebSocketClient.getInstance().on("bu", (raw: string) => {
        const [x, y] = raw.split(':').map(Number);
        const prevX = gameInfo.ballPosition?.x || 0;
        const prevY = gameInfo.ballPosition?.y || 0;
        if (x == 0 && Math.hypot(prevX - x, prevY - y) >= 5) {
            GameEventBus.getInstance().emit({type: 'BALL_POSITION_RESET', payload: {x, y}});
        }
        gameInfo.ballPosition = {x, y};
    });

    WebSocketClient.getInstance().on("bv", (raw: string) => {
        const [vx, vy] = raw.split(':').map(Number);
        const prevVx = gameInfo.ballVelocity.x;
        if ((prevVx > 0 && vx < 0) || (prevVx < 0 && vx > 0)) {
            const paddle = prevVx < 0 && vx > 0 ? gameInstance.uiManager.paddle1 : gameInstance.uiManager.paddle2;
            GameEventBus.getInstance().emit({type: 'BALL_PADDLE_HIT', payload: {object: paddle}});
        }
        gameInfo.ballVelocity = {x: vx, y: vy};
    });

    WebSocketClient.getInstance().on("updateState", (setState: SetState) => gameInfo.setState = setState);
    WebSocketClient.getInstance().on("pu", (raw: string) => {
        const [y1, y2] = raw.split(':').map(Number);
        //console.log("got: ", y1);
        gameInfo.paddle = {p1y: y1, p2y: y2};
    });
    WebSocketClient.getInstance().on("opponent-disconnected", () => {
        GameEventBus.getInstance().emit({type: 'RIVAL_DISCONNECTED', payload: {}});
    });
    WebSocketClient.getInstance().on("opponent-reconnected", () => {
        GameEventBus.getInstance().emit({type: 'RIVAL_RECONNECTED', payload: {}});
    });

    WebSocketClient.getInstance().on("gameEndInfo", (gameEndInfo: GameEndInfo) => {
        gameInfo.gameEndInfo = gameEndInfo;
        GameEventBus.getInstance().emit({type: 'MATCH_ENDED', payload: gameEndInfo});
    })
}

export function waitGameStart(gameInfo: GameInfo): Promise<void> {
    return new Promise((resolve) => {
        const timerId = setInterval(() => {
            if (gameInfo.isReadyToStart()) {
                clearInterval(timerId);
                resolve();
            }
        }, 10);
        gameInstance.timers.push(timerId);
    });
}
