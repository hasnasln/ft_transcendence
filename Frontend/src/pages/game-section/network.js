import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
import { WebSocketClient } from "./wsclient";
export class GameInfo {
    constants = null;
    state = null;
    gameEndInfo = null;
    paddle = null;
    mode;
    ballPosition = null;
    ballVelocity = { x: 0, y: 0 };
    setState = null;
    constructor(mode) {
        this.mode = mode;
    }
    isReadyToStart() {
        return this.constants != null &&
            this.state != null &&
            this.setState != null &&
            this.paddle != null &&
            this.ballPosition != null;
    }
}
export function waitForMatchReady() {
    return new Promise((resolve) => {
        WebSocketClient.getInstance().once("match-ready", (matchPlayers) => resolve(matchPlayers));
    });
}
export function waitForRematchApproval() {
    const rival = gameInstance.currentRival || "rakip";
    return new Promise((resolve) => {
        gameInstance.uiManager.onInfoShown("game.InfoMessage.request_sent_to_rival", [{ key: "rival", value: rival }]);
        WebSocketClient.getInstance().on("rematch-ready", () => {
            gameInstance.uiManager.onInfoShown("game.InfoMessage.match_starting");
            gameInstance.runAfter(() => {
                gameInstance.uiManager.onInfoHidden();
                resolve(true);
            }, 1000);
        });
        gameInstance.runAfter(() => {
            gameInstance.uiManager.onInfoShown("game.InfoMessage.rival_no_confirmation", [{ key: "rival", value: rival }]);
            gameInstance.runAfter(() => {
                gameInstance.uiManager.onInfoHidden();
            }, 2000);
            resolve(false);
        }, 20 * 1000);
    });
}
export function listenStateUpdates(gameInfo) {
    WebSocketClient.getInstance().on("init", (constants) => gameInfo.constants = constants);
    WebSocketClient.getInstance().on("gameState", (state) => gameInfo.state = state);
    WebSocketClient.getInstance().on("bu", (raw) => {
        const [x, y] = raw.split(':').map(Number);
        const prevX = gameInfo.ballPosition?.x || 0;
        const prevY = gameInfo.ballPosition?.y || 0;
        if (x == 0 && Math.hypot(prevX - x, prevY - y) >= 5) {
            GameEventBus.getInstance().emit({ type: 'BALL_POSITION_RESET', payload: { x, y } });
        }
        gameInfo.ballPosition = { x, y };
    });
    WebSocketClient.getInstance().on("bv", (raw) => {
        const [vx, vy] = raw.split(':').map(Number);
        const prevVx = gameInfo.ballVelocity.x;
        if ((prevVx > 0 && vx < 0) || (prevVx < 0 && vx > 0)) {
            const paddle = prevVx < 0 && vx > 0 ? gameInstance.uiManager.paddle1 : gameInstance.uiManager.paddle2;
            GameEventBus.getInstance().emit({ type: 'BALL_PADDLE_HIT', payload: { object: paddle } });
        }
        gameInfo.ballVelocity = { x: vx, y: vy };
    });
    WebSocketClient.getInstance().on("updateState", (setState) => gameInfo.setState = setState);
    WebSocketClient.getInstance().on("pu", (raw) => {
        const [y1, y2] = raw.split(':').map(Number);
        //console.log("got: ", y1);
        gameInfo.paddle = { p1y: y1, p2y: y2 };
    });
    WebSocketClient.getInstance().on("opponent-disconnected", () => {
        GameEventBus.getInstance().emit({ type: 'RIVAL_DISCONNECTED', payload: {} });
    });
    WebSocketClient.getInstance().on("opponent-reconnected", () => {
        GameEventBus.getInstance().emit({ type: 'RIVAL_RECONNECTED', payload: {} });
    });
    WebSocketClient.getInstance().on("gameEndInfo", (gameEndInfo) => {
        gameInfo.gameEndInfo = gameEndInfo;
        GameEventBus.getInstance().emit({ type: 'MATCH_ENDED', payload: gameEndInfo });
    });
}
export function waitGameStart(gameInfo) {
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
