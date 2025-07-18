import { Game } from "./../play";
import { prepareScoreBoards} from "./network";
import { initializeEventListeners} from "./eventListeners";


export function updateScoreBoard(game: Game)
{
  if (!game.gameInfo) return;
  if (game.gameInfo.state?.isPaused) return;
   game.scoreTable!.innerText = `${game.gameInfo.ballState?.points.leftPlayer}  :  ${game.gameInfo.ballState?.points.rightPlayer}`;
   if(game.gameInfo.mode === 'tournament')
   {
     if (game.gameStatus.finalMatch)
        game.roundNoTable!.innerText = `Final Maçı`;
      else
        game.roundNoTable!.innerText = `Round : ${game.gameInfo.state?.roundNumber}`;

    game.tournamentIDTable!.innerText = `Turnuva ID : ${game.gameStatus.tournamentCode}`;
   }
}

export function updateSetBoard(game: Game)
{
  if (!game.gameInfo) return;
  if (game.gameInfo.state?.isPaused) return;
    game.setTable!.innerText = `${game.gameInfo.ballState?.sets.leftPlayer}  :  ${game.gameInfo.ballState?.sets.rightPlayer}`;
}


// OYUN FONKSİYONLARI

export function createGame(game: Game)
{
  if (!game.gameInfo) return;
  game.endMsg!.classList.add("hidden");
  game.info!.classList.add("hidden");
  game.scoreBoard!.classList.remove("hidden");
  if(game.gameInfo.mode === 'tournament')
  {
    game.roundDiv!.classList.remove("hidden");
    game.tournamentIdDiv!.classList.remove("hidden");
  }
  game.setBoard!.classList.remove("hidden");

  prepareScoreBoards(game);
  initializeEventListeners(game);
  updateScoreBoard(game);
  updateSetBoard(game);
}


export function showSetToast(game: Game, message: string): Promise<void>
{
  return new Promise((resolve) => {
    const toast = document.getElementById("set-toast")!;
    toast.textContent = message;
    toast.classList.remove("hidden");
    

    setTimeout(() => {
      toast.classList.add("hidden");
     game.gameInfo!.nextSetStartedFlag = false;
      resolve();
    }, 3000);
  });
}


export async function startNextSet(game: Game)
{
  if (!game.gameInfo) return;
  const winnerName = game.gameInfo.ballState!.points.leftPlayer > game.gameInfo.ballState!.points.rightPlayer ? game.gameInfo.ballState?.usernames.left : game.gameInfo.ballState?.usernames.right;
  await showSetToast(game, `Seti ${winnerName} kazandı !`);  // 3 saniye bekler
}


export function showEndMessage(game: Game)
{
  if (!game.gameInfo) return;
  let winnerName = game.gameInfo.state?.matchWinner === 'leftPlayer' ? game.gameInfo.ballState?.usernames.left : game.gameInfo.ballState?.usernames.right;
  game.endMsg!.textContent = `${winnerName} maçı kazandı !`;
  if (game.gameInfo.mode === 'tournament' && game.gameStatus.finalMatch == true)
      game.endMsg!.textContent = `${winnerName} ${game.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`; 

  if (game.gameInfo.state?.matchDisconnection)
    {
      if(game.gameInfo.mode === 'localGame' || game.gameInfo.mode === 'vsAI')
          game.endMsg!.textContent = `Bağlantısı kesildi. Maç bitti !`;
      if(game.gameInfo.mode === 'remoteGame' || game.gameInfo.mode === 'tournament')
          game.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} maçı kazandı!`;
      if (game.gameInfo.mode === 'tournament' && game.gameStatus.finalMatch == true)
          game.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} ${game.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`;
    }
  setTimeout(() =>
  {
    game.endMsg!.classList.remove("hidden");
    if (game.gameInfo!.mode === 'tournament')
    {
      game.turnToHomePage!.textContent = "Turnuva sayfasına Dön";
      game.turnToHomePage!.classList.remove("hidden");
    }
    else
    {
      if (game.startButton && !game.gameInfo?.state?.matchDisconnection) {
        game.startButton.textContent = "Aynı Maçı Tekrar Oyna";
        game.startButton.classList.remove("hidden");
      }
      game.newmatchButton!.classList.remove("hidden");
      game.turnToHomePage!.classList.remove("hidden");
    }
  }, 500);
}

