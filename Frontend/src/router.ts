import { HomePage } from './pages/home';
import { SinginPage } from './pages/singin';
import { RegisterPage } from './pages/register';
import { TournamentPage } from './pages/TournamentPage';
import { PlayPage } from './pages/play-page';
import {gameInstance } from './pages/play';
import { GameInfo, waitForGameInfoReady, waitForMatchReady, waitForRematchApproval} from "./pages/game-section/network";
import { createGame } from "./pages/game-section/ui";

export function router()
{
	const app = document.getElementById('app') as HTMLElement;
	if (!app) {
		console.error('App element not found');
		return;
	}
	// önceki içeriği temizle 
	const oldContent = app.querySelector('#content-container');
	if (oldContent) {
		oldContent.remove();
	}

	// burada sayfa açıldığında ilk karşılaşılacak sayfaı setliyoruz
	// içeriği koyacağın div oluştur ve id sini belirle

	const path = window.location.pathname;
	const contentContainer = document.createElement('div');
	contentContainer.id = 'content-container';
	contentContainer.classList.add(
		'relative',
		'w-full',
		'h-[100vh]',
		'bg-gray-300',
	)
	contentContainer.id = 'content-container';
	switch (path) {
		case '/':
			const homePage = new HomePage();
			homePage.render(contentContainer);
			break;
		case '/singin':
			const singinpage = new SinginPage();
			singinpage.render(contentContainer);
			break;
		case '/register':
			const registerPage = new RegisterPage();
			registerPage.render(contentContainer);
			break;
		case '/play':
			const playPage = new PlayPage();
			playPage.render(contentContainer);
			// 3 sanite bekle

			setTimeout(() => {
				gameInstance.initButtons();
				gameInstance.initializeGameSettings( async (status) => 
					{
						console.log(`status geldi, status = {${status.currentGameStarted}, ${status.game_mode}}`);
						gameInstance.gameStatus = status;
						gameInstance.socket!.emit("start", gameInstance.gameStatus);
					
						let rival : string;
						if (gameInstance.gameStatus.game_mode === "remoteGame")
						{
							rival = await waitForMatchReady(gameInstance.socket!);
							console.log(`${gameInstance.socket!.id} ${rival} maçı için HAZIR`);
						}
					
						// Oyun başlatma butonuna tıklanınca:
						gameInstance.startButton!.addEventListener("click", async () =>
						{
							console.log(`START A TIKLANDI, içeriği : ${gameInstance.startButton!.innerText}`);
							gameInstance.startButton!.classList.add("hidden");
							if (!gameInstance.endMsg)
							{
								const a = document.getElementById("end-message")!;
								a.classList.add("hidden");
							}
							else 
							{
								gameInstance.endMsg.classList.add("hidden");
							}
					
							 if (gameInstance.gameStatus.game_mode === "remoteGame")
							gameInstance.info!.textContent = `${rival} bekleniyor ...`;
							 else
							gameInstance.info!.classList.add("hidden");
							 gameInstance.newmatchButton!.classList.add("hidden");
		
							if (gameInstance.gameStatus.currentGameStarted)
							{
								gameInstance.reMatch = true;
								gameInstance.cleanOldGame();
							}
							gameInstance.socket!.emit("ready", false);
							if (gameInstance.gameStatus.game_mode === "remoteGame" && gameInstance.reMatch)
							{
								const approval = await waitForRematchApproval(gameInstance.socket!, rival);
								if (approval)
								gameInstance.socket!.emit("ready", true);
								else
								{
								gameInstance.newmatchButton!.classList.remove("hidden");
								return;
								}
							}
							gameInstance.gameInfo = new GameInfo(gameInstance.gameStatus.game_mode);
							await waitForGameInfoReady(gameInstance.gameInfo, gameInstance.socket!);
							console.log(`${gameInstance.socket!.id} için VERİLER HAZIR`);
								createGame(gameInstance.gameInfo);
								gameInstance.startGame(gameInstance.gameInfo!); // oyun kurulumuna geç
							});
					});
			}, 3000);

			break;
		case '/tournament':
			const tournamentPage = new TournamentPage();
			tournamentPage.render(contentContainer);
			break;
		default:
			const hsn = new HomePage();
			hsn.render(contentContainer);
			break;
	}
	app.appendChild(contentContainer);
}