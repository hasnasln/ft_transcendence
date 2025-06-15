import { gameInstance } from "./../play";
import { GameInfo, prepareScoreBoards} from "./network";
import { initializeEventListeners} from "./eventListeners";


export function updateScoreBoard(gameInfo: GameInfo)
{if (gameInfo.state?.isPaused) return;
   gameInstance.scoreTable!.innerText = `${gameInfo.ballState!.points.leftPlayer}  :  ${gameInfo.ballState!.points.rightPlayer}`;
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
  console.log(`startNextSet fonksiyonuna geldik, winnerName = ${winnerName}`);
  await showSetToast(gameInfo, `Seti ${winnerName} kazandı !`);  // 3 saniye bekler
}


export function showEndMessage(gameInfo: GameInfo)
{
  let winnerName = gameInfo.ballState!.points.leftPlayer > gameInfo.ballState!.points.rightPlayer ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
  console.log(`showEndMsg fonksiyonuna geldik, gameInfo.state?.matchOver = ${gameInfo.state?.matchOver}`);
  gameInstance.endMsg!.textContent = `${winnerName} maçı kazandı !`;
  if (gameInfo.state?.inCompleteWinner !== undefined)
    {
      winnerName = gameInfo.state?.inCompleteWinner === 'leftPlayer' ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
      gameInstance.endMsg!.textContent = `Rakibin bağlantısı kesildi. ${winnerName} maçı kazandı!`;
    }
  gameInstance.endMsg!.classList.remove("hidden");
  if (gameInstance.startButton) {
    gameInstance.startButton.textContent = "Aynı Maçı Tekrar Oyna";
    gameInstance.startButton.classList.remove("hidden");
  }
  gameInstance.newmatchButton!.classList.remove("hidden");
  gameInstance.turnToHomePage!.classList.remove("hidden");
}