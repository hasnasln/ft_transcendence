import { gameInstance } from "../play";
import { GameInfo } from "./network";

export const newmatchButton = document.getElementById("newmatch-button") as HTMLButtonElement;


export function initializeEventListeners(gameInfo: GameInfo)
{
  if(gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI')
    {
      window.addEventListener("keydown", (event) =>
        {
          let moved = false;

          if (event.key === 'w')
            {
              gameInstance.socket!.emit("player-move", { direction: "up" });
              moved = true;
            }
            else if (event.key === 's')
              {
                gameInstance.socket!.emit("player-move", { direction: "down" });
                moved = true;
              }

          if (moved)
              event.preventDefault();
        });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
            gameInstance.socket!.emit("player-move", { direction: "stop" });
        });
    }


    else if(gameInfo.mode === 'localGame')
    {
      window.addEventListener("keydown", (event) => {
      let moved = false;

      if (event.key === 'w')
        {
          gameInstance.socket!.emit("local-input", { player_side: "left", direction: "up" });
           moved = true;
        }
        else if (event.key === 's')
          {
            gameInstance.socket!.emit("local-input", { player_side: "left", direction: "down" });
            moved = true;
          }


      if (event.key === 'ArrowUp')
        {
          gameInstance.socket!.emit("local-input", { player_side: "right", direction: "up" });
           moved = true;
        }
        else if (event.key === 'ArrowDown')
          {
            gameInstance.socket!.emit("local-input", { player_side: "right", direction: "down" });
            moved = true;
          }


       if (moved)
          event.preventDefault();
      });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
            gameInstance.socket!.emit("local-input", { player_side: "left", direction: "stop" });
          
          if (["ArrowUp", "ArrowDown"].includes(e.key))
              gameInstance.socket!.emit("local-input", { player_side: "right", direction: "stop" });
        });
    }


  // ******************************************************************************************************************************************************************************
  

  const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
 
  if(gameInfo.mode !== 'remoteGame')
  {
    document.addEventListener("keydown", (event) =>
    {
    if (event.code === "Space" && gameInstance.startButton!.classList.contains("hidden"))
      {
      gameInfo.state!.isPaused = !(gameInfo.state!.isPaused);
      
      if (gameInfo.state!.isPaused) {
        
        gameInstance.socket!.emit("pause-resume", {status: "pause"});
        // Duraklatıldığında "devam et" butonunu göster
        resumeButton.classList.remove("hidden");
        newmatchButton.classList.remove("hidden");;
      } else {
        gameInstance.socket!.emit("pause-resume", {status: "resume"});
        // Devam edildiğinde butonu gizle
        resumeButton.classList.add("hidden");
        newmatchButton.classList.add("hidden");
      }

      }
    });


    resumeButton?.addEventListener("click", () =>
    {
      gameInfo.state!.isPaused = false;
      gameInstance.socket!.emit("pause-resume", {status: "resume"});
      resumeButton.classList.add("hidden");
      newmatchButton.classList.add("hidden");
    });
  }



  newmatchButton?.addEventListener("click", () =>
    {console.log(`yeni maça başlaya tıklandı, içerik : ${newmatchButton.innerText}`);
    resumeButton.classList.add("hidden");
    newmatchButton.classList.add("hidden");
    if (gameInstance.startButton)
      gameInstance.startButton.classList.add("hidden");
    
    if(!gameInfo.state?.matchOver)
        gameInstance.socket!.emit("reset-match");
    window.location.reload();

    //document.getElementById("menu")!.classList.remove("hidden");
    
    //  endMsg.classList.add("hidden");
    //     gameInstance.startButton.classList.add("hidden");
    //     scoreBoard.style.display = "flex";
    //     setBoard.style.display = "flex";

        //  gameInfo.state!.matchOver = false;
        //   gameInfo.state!.isPaused = false;
        //   socket.emit("pause-resume", {state: gameInfo.state, status: "stable"});
         
          // updateScoreBoard(gameInfo);
          // updateSetBoard(gameInfo);
    });
}


