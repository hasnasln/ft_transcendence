import { gameInstance, GameMode, GameManager} from "../play";
import { io, Socket } from "socket.io-client";
import { _apiManager } from '../../api/APIManager';
import { Router } from "../../router";

export interface MatchPlayers
{
	left: {socketId: string, username: string};
	right: {socketId: string, username: string};
	roundNo?: number;
	finalMatch?: boolean
}

export async function createSocket(): Promise<Socket> {
	return new Promise<Socket>((resolve, reject) => {
		console.log("connecting to socket.io server...");
		const token = _apiManager.getToken();
		if (!token) {
		reject("No token found. Try login again.");
		return;
		}

		const socket = io('http://localhost:3001', {
			auth: { token }
		});

		socket.on('connect', () => {
			console.log('Socket connected with ID:', socket.id);
			resolve(socket);
		});

		socket.on('connect_error', (err) => {
			console.error('Socket connection error:', err.message);
			if (err.message.includes("token missing")) {
				alert("Token eksik. Lütfen tekrar giriş yapın.");
				Router.getInstance().go('/login');
			} else if (err.message.includes("Token validation error")) {
				alert("Token doğrulama hatası :" + err.message);
				Router.getInstance().go('/login');
			} else if (err.message.includes("Game server error")) {
				alert("Aynı anda birden fazla oyuna katılamazsınız.");
				Router.getInstance().go('/');
			} else {
				alert("Bağlantı reddedildi: " + err.message);
				Router.getInstance().go('/');
			}
		});

		socket.on('tournamentError', (errorMessage : string) => {
			console.error('Tournament error:', errorMessage);
			gameInstance.uiManager.info!.textContent = `Tournament error:, ${errorMessage}`;
			gameInstance.uiManager.info!.classList.remove("hidden");
			setTimeout(() => {
				gameInstance.uiManager.info!.classList.add("hidden");
				Router.getInstance().go('/tournament')
			}, 5000);
			});

			socket.on('goToNextRound', () => {
			console.log('Bir üst tura yükseldiniz:');
			gameInstance.uiManager.onTurnToTournamentButton();
		});
	})
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

export class GameInfo
{
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

export function waitForMatchReady(gameInstance: GameManager): Promise<MatchPlayers> {
	return new Promise((resolve) => {
			gameInstance.socket!.on("match-ready", (matchPlayers : MatchPlayers) => resolve(matchPlayers));
		});
}

export function waitForRematchApproval(socket: Socket, rival: string): Promise<boolean> {
	return new Promise((resolve) => {
		gameInstance.uiManager.onInfoShown(`Talebiniz ${rival} oyuncusuna iletildi.`);
		socket.on("rematch-ready", () => {
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

export function listenStateUpdates(gameInfo: GameInfo, socket: Socket): void {
	socket.on("gameConstants", (constants: GameConstants) => gameInfo.constants = constants);
	socket.on("gameState", (state: GameState) => gameInfo.state = state);
	socket.on("bu", (raw: string) => {
  		const [x,y] = raw.split(':').map(Number);
		gameInfo.ballPosition = { x, y };
	});
	socket.on("updateState", (setState: SetState) => gameInfo.setState = setState);
	socket.on("paddleUpdate", (data) => gameInfo.paddle = data);
}

export function onFirstStateUpdate(gameInfo: GameInfo): Promise<void> {
	return new Promise((resolve) => {
		const timerId = setInterval(() => {
			console.log("gameinfo:", gameInfo);
			if (gameInfo.isReadyToStart()) {
				clearInterval(timerId);
				resolve();
			}
		}, 10);
	});
}
