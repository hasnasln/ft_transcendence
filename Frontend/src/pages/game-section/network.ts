import { gameInstance, GameMode, GameManager} from "../play";
import { _apiManager } from '../../api/APIManager';
import { GameEventBus } from "./gameEventBus";
import { WebSocketClient } from "./wsclient";

export interface MatchPlayers
{
	left: {socketId: string, username: string};
	right: {socketId: string, username: string};
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
}

interface GameState {
	matchOver: boolean;
	setOver: boolean;
	isPaused: boolean;
	matchWinner?: Side;
	matchDisconnection: boolean;
	roundNumber?: number;
}

interface SetState {
	points: { leftPlayer: number, rightPlayer: number };
	sets: { leftPlayer: number, rightPlayer: number };
	usernames: {left: string, right: string}
}

interface BallPosition {
	x: number;
	y: number;
}

interface PaddleState {
	p1y: number;
	p2y: number;
}

export class GameInfo {
	public constants: GameConstants | null = null;
	public state: GameState | null = null;
	public paddle: PaddleState | null = null;
	public mode: GameMode;
	public ballPosition: BallPosition | null = null;
	public setState: SetState | null = null;

	constructor(mode: GameMode){
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
			WebSocketClient.getInstance().once("match-ready", (matchPlayers : MatchPlayers) => resolve(matchPlayers));
		});
}

export function waitForRematchApproval(rival: string): Promise<boolean> {
	return new Promise((resolve) => {
		gameInstance.uiManager.onInfoShown(`Talebiniz ${rival} oyuncusuna iletildi.`);
		WebSocketClient.getInstance().on("rematch-ready", () => {
			gameInstance.uiManager.onInfoShown(`Maç başlıyor`);
			setTimeout(() => {
				gameInstance.uiManager.onInfoHidden();
				resolve(true);
				}, 1000);
			});

		setTimeout(() => {
			gameInstance.uiManager.onInfoShown(`${rival} oyuncusundan onay gelmedi !`);
			setTimeout(() => {
				gameInstance.uiManager.onInfoHidden();
			}, 2000);
			resolve(false);
		}, 20 * 1000);
	});
}

export function listenStateUpdates(gameInfo: GameInfo): void {
	WebSocketClient.getInstance().on("gameConstants", (constants: GameConstants) => gameInfo.constants = constants);
	WebSocketClient.getInstance().on("gameState", (state: GameState) => gameInfo.state = state);
	WebSocketClient.getInstance().on("bu", (raw: string) => {
  		const [x,y] = raw.split(':').map(Number);
		gameInfo.ballPosition = { x, y };
		if (Math.random() < 0.01) {
			console.log(`Ball position updated: ${x}, ${y}`);
		}
	});
	WebSocketClient.getInstance().on("updateState", (setState: SetState) => gameInfo.setState = setState);
	WebSocketClient.getInstance().on("paddleUpdate", (data) => gameInfo.paddle = data);
	WebSocketClient.getInstance().on("opponent-disconnected", () => {
		GameEventBus.getInstance().emit({ type: 'RIVAL_DISCONNECTED', payload: {} });
	});
	WebSocketClient.getInstance().on("opponent-reconnected", () => {
		GameEventBus.getInstance().emit({ type: 'RIVAL_RECONNECTED', payload: {} });
	});
}

export function onFirstStateUpdate(gameInfo: GameInfo): Promise<void> {
	return new Promise((resolve) => {
		const timerId = setInterval(() => {
			if (gameInfo.isReadyToStart()) {
				clearInterval(timerId);
				resolve();
			}
		}, 10);
	});
}
