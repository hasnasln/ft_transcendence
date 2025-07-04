import { Socket } from "socket.io";
import { Game, Paddle } from "./game"; 
import { Server } from "socket.io";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
import { GameMode } from "./server";

export interface Player
{
	socket: Socket;
	username: string;
	uuid: string;
}

interface MatchPlayers
{
  left: {socketId: string, username: string};
  right: {socketId: string, username: string};
  roundNo?: number;
  finalMatch?: boolean
}

const waitingPlayers = new Map<string, Player>();

export function addPlayerToQueue(player: Player, io: Server, gameMode: GameMode)
{
	waitingPlayers.set(player.socket.id, player);
	console.log(`oyuncu waitingP layers a kaydedildi, player.socket.id = ${player.socket.id}`);
	checkForRemoteMatch(io, waitingPlayers, gameMode);
}

export function removePlayerFromQueue(player: Player)
{
	const checkPlayer = waitingPlayers.get(player.socket.id);
  if (typeof(checkPlayer) === 'undefined') {
    return;
  }
	waitingPlayers.delete(player.socket.id);
}
  


  export function startGameWithAI(human: Player, level: string, io: Server)
  {
	const roomId = `game_${human.socket.id}_vs_AI_${level}`;
	human.socket.join(roomId);
	
	let getGame: () => Game;
	let getPaddle: () => Paddle;

  
	const leftInput = new RemotePlayerInput(human);
	const rightInput = new AIPlayerInput(() => getGame!(), () => getPaddle!(), "AI", level);


			// Yeni bir oyun başlat
	human.socket.on("ready", () => 
	{
	const game = new Game(leftInput, rightInput, io, roomId, 'vsAI');
	getGame = () => game;
	getPaddle = () => game.getPaddle2();
	game.startGameLoop();
	});
  }



  export function startLocalGame(player1: Player, io: Server)
  {
	const leftInput = new LocalPlayerInput(player1, "left");
	const rightInput = new LocalPlayerInput(player1, "right");


	const roomId = `game_${player1.socket.id}_vs_friend`;
	player1.socket.join(roomId);
	
	player1.socket.on("ready", () =>
	{
	const game = new Game(leftInput, rightInput, io, roomId, 'localGame');
	game.startGameLoop();
	});
  }

function mapShift<K, V>(map: Map<K, V>): V | undefined {
  const firstKeyValuCouple = map.entries().next();
  if (firstKeyValuCouple.done) return undefined;
  const [key, val] = firstKeyValuCouple.value;
  map.delete(key);
  return val;
}

export function checkForRemoteMatch(io: Server, waitingPlayersMap: Map<string, Player>, gameMode: GameMode, tournamentCode?: string, roundNumber?: number, finalMatch? :boolean)
{ 
	while (waitingPlayersMap.size >= 2)
	{
		const player1 = mapShift(waitingPlayersMap);
		const player2 = mapShift(waitingPlayersMap);

		if (player1 && player2)
		{
			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			const matchPlayers : MatchPlayers = 
			{left: {socketId: player1.socket.id, username: player1.username}, right: {socketId: player2.socket.id, username: player2.username}, roundNo : roundNumber, finalMatch: finalMatch};
			console.log(`matchPlayers.left.username = ${matchPlayers.left.username},  matchPlayers.right.username = ${matchPlayers.right.username},
          matchPlayers.roundNo = ${matchPlayers.roundNo}, matchPlayers.finalMatch = ${matchPlayers.finalMatch}`);

			io.to(roomId).emit("match-ready", matchPlayers);

			const leftInput = new RemotePlayerInput(player1);
			const rightInput = new RemotePlayerInput(player2);

			// Yeni bir oyun başlat


			let socket1Ready = false;
			let socket2Ready = false;
			let reMatchApproval1 = false;
			let reMatchApproval2 = false;
			let reMatch = false;

			function checkBothReady()
			{
			if (socket1Ready && socket2Ready)
				{
					console.log("Her iki socket de hazır!");
					if (reMatch)
						io.to(roomId).emit("rematch-ready");
					if ((reMatchApproval1 === reMatchApproval2 && reMatch !== reMatchApproval1) || (reMatchApproval1 !== reMatchApproval2))
						return;
					if(tournamentCode !== undefined)
						{
							const game = new Game(leftInput, rightInput, io, roomId, gameMode, tournamentCode, roundNumber);
							game.startGameLoop();
						}
					else
						{
							const game = new Game(leftInput, rightInput, io, roomId, gameMode);
							game.startGameLoop();
						}
					reMatch = true;
					reMatchApproval1 = false;
					reMatchApproval2 = false;
					socket1Ready = false;
					socket2Ready = false;
				}
			}

			player1.socket.on("ready", (data : boolean) => {
			reMatchApproval1 = data;
			socket1Ready = true;
			console.log(`player1 hazır, reMatchApproval = ${reMatchApproval1}`);
			checkBothReady();
			});

			player2.socket.on("ready", (data : boolean) => {
			reMatchApproval2 = data;
			socket2Ready = true;
			console.log(`player2 hazır, reMatchApproval = ${reMatchApproval2}`);
			checkBothReady();
			});

		}
	}
}

