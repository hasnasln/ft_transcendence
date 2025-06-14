import { Socket } from "socket.io";
import { Game, Paddle } from "./game"; // Oyunun mantığını yöneten sınıf
import { Server } from "socket.io";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";
// import { request as unitRequest } from "undici";
// import { FastifyRequest } from "fastify";

let counter = 0;

export interface Player
{
	socket: Socket;
	username: string; // ya da id................................... 
}

const waitingPlayers = new Map<string, Player>();

export function addPlayerToQueue(player: Player, io: Server)
{
	waitingPlayers.set(player.socket.id, player);
	console.log(`oyuncu waitingP layers a kaydedildi, player.socket.id = ${player.socket.id}`);
	checkForMatch(io);
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
	const game = new Game(leftInput, rightInput, io, roomId);
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
	const game = new Game(leftInput, rightInput, io, roomId);
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

function checkForMatch(io: Server)
{
	while (waitingPlayers.size >= 2)
	{
		const player1 = mapShift(waitingPlayers);
		const player2 = mapShift(waitingPlayers);

		if (player1 && player2)
		{
			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			const matchPlayers = {left: player1.username, right: player2.username};

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
					if ((reMatchApproval1 === reMatchApproval2 && reMatch !== reMatchApproval1) || (reMatchApproval1 !== reMatchApproval2))  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						return;
					const game = new Game(leftInput, rightInput, io, roomId);
					game.startGameLoop();
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

// EKLEMEE /////////////////////////////////////////////////////////////////////////////////////////////////



// const tournamentPlayers = new Map<string, Player>();

// export function addPlayerToTournamentQueue(player: Player, io: Server)
// {
// 	tournamentPlayers.set(player.username, player);
// 	console.log(`oyuncu tournamentPlayers a kaydedildi, player.username = ${player.username}`);
// 	console.log(`şu anda tournamentPlayers size = ${tournamentPlayers.size}`);
// 	//checkForTournamentMatch(player,io);
// }

// export async function sendRequest(request: FastifyRequest) {
// 	const responseData = await unitRequest('http://localhost:8081/api/auth/validate', {
// 		method: "POST",
// 		headers: {
// 			'Authorization': request.headers.authorization as string,
// 		},
// 		//body: JSON.stringify(request.body)
// 	});
// }

// export async function checkForTournamentMatch(player: Player, io: Server)
// {
// 	 const id = match.player.id; //ama hangisi ??
// 	 const match_id = match.id;
// 	 const rival: Player = { socket, username };

// 	if (tournamentPlayers.size >= 2)
// 	{console.log(`checkForTournamentMatch içine girdi.`);
// 		const player1 = mapShift(tournamentPlayers);
// 		const player2 = mapShift(tournamentPlayers);

// 		if (player1 && player2)
// 		{
// 			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
// 			player1.socket.join(roomId);
// 			player2.socket.join(roomId);

// 			const matchPlayers = {left: player1.username, right: player2.username};

// 			io.to(roomId).emit("match-ready", matchPlayers);

// 			const leftInput = new RemotePlayerInput(player1);
// 			const rightInput = new RemotePlayerInput(player2);

// 			// Yeni bir oyun başlat


// 			let socket1Ready = false;
// 			let socket2Ready = false;
// 			let reMatchApproval1 = false;
// 			let reMatchApproval2 = false;
// 			let reMatch = false;

// 			function checkBothReady()
// 			{
// 			if (socket1Ready && socket2Ready)
// 				{
// 					console.log("Her iki socket de hazır!");
// 					if (reMatch)
// 						io.to(roomId).emit("rematch-ready");
// 					if ((reMatchApproval1 === reMatchApproval2 && reMatch !== reMatchApproval1) || (reMatchApproval1 !== reMatchApproval2))  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 						return;
// 					const game = new Game(leftInput, rightInput, io, roomId);
// 					game.startGameLoop();
// 					reMatch = true;
// 					reMatchApproval1 = false;
// 					reMatchApproval2 = false;
// 					socket1Ready = false;
// 					socket2Ready = false;
// 				}
// 			}

// 			player1.socket.on("ready", (data : boolean) => {
// 			reMatchApproval1 = data;
// 			socket1Ready = true;
// 			console.log(`player1 hazır, reMatchApproval = ${reMatchApproval1}`);
// 			checkBothReady();
// 			});

// 			player2.socket.on("ready", (data : boolean) => {
// 			reMatchApproval2 = data;
// 			socket2Ready = true;
// 			console.log(`player2 hazır, reMatchApproval = ${reMatchApproval2}`);
// 			checkBothReady();
// 			});

// 		}
// 	}
// }


// export function startTournamentGame(player: Player, io: Server)
// {
// 	// Daha önce böyle bir istek geldi mi ??? Maç mı bulacağız yoksa rakip mi ?????????????????????
// 	  const match = await getMatchFromBackend(player.username);
// 	  const rival = match.player; //ama hangisi ??
// 	  const match_id = match.id;
	
// 	  const rival: Player = { socket, username };
// //   if (!rival) {
// //     socket.emit("error", "No match found");
// //     return;
// //   }

// 	if (rival)
// 		{
// 			const roomId = `game_${match_id}`;
// 			player.socket.join(roomId);
// 			rival.socket.join(roomId);

// 			const matchPlayers = {left: player.username, right: rival.username};

// 			io.to(roomId).emit("match-ready", matchPlayers);

// 			const leftInput = new RemotePlayerInput(player);
// 			const rightInput = new RemotePlayerInput(rival);

// 			// Yeni bir oyun başlat


// 			let socket1Ready = false;
// 			let socket2Ready = false;
// 			let reMatchApproval1 = false;
// 			let reMatchApproval2 = false;
// 			let reMatch = false;

// 			function checkBothReady()
// 			{
// 			if (socket1Ready && socket2Ready)
// 				{
// 					console.log("Her iki socket de hazır!");
// 					if (reMatch)
// 						io.to(roomId).emit("rematch-ready");
// 					if ((reMatchApproval1 === reMatchApproval2 && reMatch !== reMatchApproval1) || (reMatchApproval1 !== reMatchApproval2))  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 						return;
// 					const game = new Game(leftInput, rightInput, io, roomId);
// 					game.startGameLoop();
// 					reMatch = true;
// 					reMatchApproval1 = false;
// 					reMatchApproval2 = false;
// 					socket1Ready = false;
// 					socket2Ready = false;
// 				}
// 			}

// 			player.socket.on("ready", (data : boolean) => {
// 			reMatchApproval1 = data;
// 			socket1Ready = true;
// 			console.log(`player hazır, reMatchApproval = ${reMatchApproval1}`);
// 			checkBothReady();
// 			});

// 			rival.socket.on("ready", (data : boolean) => {
// 			reMatchApproval2 = data;
// 			socket2Ready = true;
// 			console.log(`rival hazır, reMatchApproval = ${reMatchApproval2}`);
// 			checkBothReady();
// 			});

// 		}	

// }
