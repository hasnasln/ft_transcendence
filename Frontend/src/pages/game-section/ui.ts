import { gameInstance } from "./../play";
import { GameInfo, prepareScoreBoards} from "./network";
import { initializeEventListeners} from "./eventListeners";


export function updateScoreBoard(gameInfo: GameInfo)
{if (gameInfo.state?.isPaused) return;
   gameInstance.scoreTable!.innerText = `${gameInfo.ballState!.points.leftPlayer}  :  ${gameInfo.ballState!.points.rightPlayer}`;
   if(gameInfo.mode === 'tournament')
   {
     if (gameInstance.gameStatus.finalMatch)
        gameInstance.roundNoTable!.innerText = `Final Maçı`;
      else
        gameInstance.roundNoTable!.innerText = `Round : ${gameInfo.state?.roundNumber}`;

    gameInstance.tournamentIDTable!.innerText = `Turnuva ID : ${gameInstance.gameStatus.tournamentCode}`;
   }
}

export function updateSetBoard(gameInfo: GameInfo)
{if (gameInfo.state?.isPaused) return;
    gameInstance.setTable!.innerText = `${gameInfo.ballState!.sets.leftPlayer}  :  ${gameInfo.ballState!.sets.rightPlayer}`;
}


// OYUN FONKSİYONLARI

export function createGame(gameInfo: GameInfo)
{
  gameInstance.endMsg!.classList.add("hidden");
  gameInstance.info!.classList.add("hidden");
  gameInstance.scoreBoard!.classList.remove("hidden");
  if(gameInfo.mode === 'tournament')
  {
    gameInstance.roundDiv!.classList.remove("hidden");
    gameInstance.tournamentIdDiv!.classList.remove("hidden");
  }
  gameInstance.setBoard!.classList.remove("hidden");

  prepareScoreBoards(gameInfo);
  initializeEventListeners(gameInfo);
  updateScoreBoard(gameInfo);
  updateSetBoard(gameInfo);
}


export function showSetToast(gameInfo: GameInfo, message: string): Promise<void>
{
  return new Promise((resolve) => {
    const toast = document.getElementById("set-toast")!;
    toast.textContent = message;
    toast.classList.remove("hidden");
    

    setTimeout(() => {
      toast.classList.add("hidden");
     gameInfo.nextSetStartedFlag = false;
      resolve();
    }, 3000);
  });
}


export async function startNextSet(gameInfo: GameInfo)
{
  const winnerName = gameInfo.ballState!.points.leftPlayer > gameInfo.ballState!.points.rightPlayer ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
  await showSetToast(gameInfo, `Seti ${winnerName} kazandı !`);  // 3 saniye bekler
}


export function showEndMessage(gameInfo: GameInfo)
{
  let winnerName = gameInfo.state?.matchWinner === 'leftPlayer' ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
  gameInstance.endMsg!.textContent = `${winnerName} maçı kazandı !`;
  if (gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
      gameInstance.endMsg!.textContent = `${winnerName} ${gameInstance.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`; 

  if (gameInfo.state?.matchDisconnection)
    {
      gameInstance.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} maçı kazandı!`;
        if (gameInfo.mode === 'tournament' && gameInstance.gameStatus.finalMatch == true)
          gameInstance.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} ${gameInstance.gameStatus.tournamentCode} turnuvasını kazandı !   Tebrikler !`;
    }
  gameInstance.endMsg!.classList.remove("hidden");
  if (gameInfo.mode === 'tournament')
  {
    gameInstance.turnToHomePage!.textContent = "Turnuva sayfasına Dön";
    gameInstance.turnToHomePage!.classList.remove("hidden");
  }
  else
  {
    if (gameInstance.startButton) {
      gameInstance.startButton.textContent = "Aynı Maçı Tekrar Oyna";
      gameInstance.startButton.classList.remove("hidden");
    }
    gameInstance.newmatchButton!.classList.remove("hidden");
    gameInstance.turnToHomePage!.classList.remove("hidden");
  }
}