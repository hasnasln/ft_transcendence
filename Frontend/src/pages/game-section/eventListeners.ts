import { Game, gameInstance } from "../play";


export function initializeEventListeners(game: Game)
{
  if(!game.gameInfo)
    return;
  if(game.gameInfo.mode === 'remoteGame' || game.gameInfo.mode === 'vsAI' || game.gameInfo.mode === 'tournament')
    {
      window.addEventListener("keydown", (event) =>
        {
          let moved = false;

          if (event.key === 'w')
            {
              game.socket!.emit("player-move", { direction: "up" });
              moved = true;
            }
            else if (event.key === 's')
              {
                game.socket!.emit("player-move", { direction: "down" });
                moved = true;
              }

          if (moved)
              event.preventDefault();
        });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
            game.socket!.emit("player-move", { direction: "stop" });
        });
    }


    else if(game.gameInfo.mode === 'localGame')
    {
      window.addEventListener("keydown", (event) => {
      let moved = false;

      if (event.key === 'w')
        {
          game.socket!.emit("local-input", { player_side: "left", direction: "up" });
           moved = true;
        }
        else if (event.key === 's')
          {
            game.socket!.emit("local-input", { player_side: "left", direction: "down" });
            moved = true;
          }


      if (event.key === 'ArrowUp')
        {
          game.socket!.emit("local-input", { player_side: "right", direction: "up" });
           moved = true;
        }
        else if (event.key === 'ArrowDown')
          {
            game.socket!.emit("local-input", { player_side: "right", direction: "down" });
            moved = true;
          }


       if (moved)
          event.preventDefault();
      });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
            game.socket!.emit("local-input", { player_side: "left", direction: "stop" });
          
          if (["ArrowUp", "ArrowDown"].includes(e.key))
              game.socket!.emit("local-input", { player_side: "right", direction: "stop" });
        });
    }

 

  const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
 
  if(game.gameInfo.mode !== 'remoteGame' && game.gameInfo.mode !== 'tournament')
  {
    document.addEventListener("keydown", (event) =>
    {
        if(!game.gameInfo)
           return;
      if (event.code === "Space" && game.startButton!.classList.contains("hidden"))
      {
        game.gameInfo.state!.isPaused = !(game.gameInfo.state!.isPaused);
        
        if (game.gameInfo.state!.isPaused) {
          
          game.socket!.emit("pause-resume", {status: "pause"});
          resumeButton.classList.remove("hidden");
          game.newmatchButton!.classList.remove("hidden");
          game.turnToHomePage!.classList.remove("hidden");
        } 
        // else {
        //   game.socket!.emit("pause-resume", {status: "resume"});
        //   // Devam edildiğinde butonu gizle
        //   resumeButton.classList.add("hidden");
        //   game.newmatchButton!.classList.add("hidden");
        //   game.turnToHomePage!.classList.add("hidden");
        // }

      }
    });


    resumeButton?.addEventListener("click", () =>
    {
       if(!game.gameInfo)
         return;
      game.gameInfo.state!.isPaused = false;
      game.socket!.emit("pause-resume", {status: "resume"});
      resumeButton.classList.add("hidden");
       game.newmatchButton!.classList.add("hidden");
       game.turnToHomePage!.classList.add("hidden");
    });
  }



   game.newmatchButton!.addEventListener("click", () =>
    {
      if(!game.gameInfo)
        return;
      console.log(`yeni maça başlaya tıklandı, içerik : ${ game.newmatchButton!.innerText}`);
      resumeButton.classList.add("hidden");
      game.newmatchButton!.classList.add("hidden");
      game.turnToHomePage!.classList.add("hidden");
      if (game.startButton)
        game.startButton.classList.add("hidden");
      
      if(!game.gameInfo.state?.matchOver)
          game.socket!.emit("reset-match");
      setTimeout(() =>
      {
        window.location.reload();
      }, 100);
    });

    game.turnToHomePage!.addEventListener("click", () =>
    {
      if(!game.gameInfo)
        return;
      resumeButton.classList.add("hidden");
      game.newmatchButton!.classList.add("hidden");
      game.turnToHomePage!.classList.add("hidden");
      if (game.startButton)
        game.startButton.classList.add("hidden");
      
      if(!game.gameInfo.state?.matchOver)
          game.socket!.emit("reset-match");
      if (game.gameInfo.mode === 'tournament')
        window.history.pushState({}, '', '/tournament');
      else
        window.history.pushState({}, '', '/');
      setTimeout(() =>
      {
        window.location.reload();
      }, 100);
    });


  window.addEventListener("popstate", () =>
  {
    if(!game.gameInfo)
     return;
    if(!game.gameInfo.state?.matchOver)
          game.socket!.emit("reset-match");
  });

}

console.log('Geri tuşuna basma eventi dinleniyor!222');
window.addEventListener('popstate', () => {
  console.log('Geri tuşuna basıldı!23456');
  setTimeout(()=> {
    if (gameInstance.socket)
      gameInstance.socket.disconnect();
       window.location.reload();
  }, 50);
});
