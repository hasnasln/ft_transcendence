import { gameInstance } from "../play";
import { GameEventBus } from "./gameEventBus";
import { GameInfo } from "./network";
import { WebSocketClient } from "./wsclient";

type Direction = "up" | "down" | "stop";
type Side = "left" | "right";
type Mode = "local" | "remote" | "unset";

type KeysState = { up: boolean; down: boolean };

export class GameInputHandler {
  private static instance: GameInputHandler;
  static getInstance(): GameInputHandler {
    if (!GameInputHandler.instance) {
      GameInputHandler.instance = new GameInputHandler();
    }
    return GameInputHandler.instance;
  }

  private mode: Mode = "unset";

  // Her taraf için ayrı yön ve basılı tuş bayrakları
  private directions: Record<Side, Direction> = { left: "stop", right: "stop" };
  private keysDown: Record<Side, KeysState> = {
    left: { up: false, down: false },
    right: { up: false, down: false },
  };

  public setMode(mode: "local" | "remote"): void {
    this.mode = mode;
  }

  // Geriye dönük uyumluluk için varsayılan side = "left"
  public getDirectionSign(side: Side): 1 | -1 | 0 {
    const d = this.directions[side];
    return d === "up" ? 1 : d === "down" ? -1 : 0;
  }

  private mapKey(key: string): { side: Side; dir: Exclude<Direction, "stop"> } | null {
    if (!key) return null;

    if (this.mode === "local")
    {
      switch (key.toLowerCase()) {
        case "w": return { side: "left", dir: "up" };
        case "s": return { side: "left", dir: "down" };
        case "arrowup": return { side: "right", dir: "up" };
        case "arrowdown": return { side: "right", dir: "down" };
        default: return null;
      }
    }
    else
    {
        switch (key.toLowerCase()) {
        case "arrowup":
        case "w": return { side: "left", dir: "up" };
        case "arrowdown":
        case "s": return { side: "left", dir: "down" };
        default: return null;
      }
    }
  }

  private recomputeDirection(side: Side): Direction {
    const { up, down } = this.keysDown[side];
    // kural: ikisi aynıysa (ikisi true veya ikisi false) => stop
    if (up === down) return "stop";
    return up ? "up" : "down";
  }

  private sendStateUpdate(side: Side): void {
    const direction = this.directions[side];
    if (this.mode === "local") {
      WebSocketClient.getInstance().emit("local-input", {
        direction: direction,
        player_side: side,
      });
    } else if (this.mode === "remote") {
      // remote modda server hangi oyuncu olduğunu bilir
      WebSocketClient.getInstance().emit("player-move", { direction: direction });
    } else {
      throw new Error("KeyboardInputHandler mode is not set. Set to 'local' or 'remote'.");
    }
  }

  /** returns 'should event be cancelled' */
  public keyDown(key: string): boolean {
    const m = this.mapKey(key);
    if (!m) return false;

    const { side, dir } = m;
    // idempotent: zaten true ise gereksiz güncelleme yapmayız
    if (!this.keysDown[side][dir]) {
      this.keysDown[side][dir] = true;
      const next = this.recomputeDirection(side);
      if (next !== this.directions[side]) {
        this.directions[side] = next;
        this.sendStateUpdate(side);
      }
    }
    return true;
  }

  /** returns 'should event be cancelled' */
  public keyUp(key: string): boolean {
    const m = this.mapKey(key);
    if (!m) return false;

    const { side, dir } = m;
    if (this.keysDown[side][dir]) {
      this.keysDown[side][dir] = false;
      const next = this.recomputeDirection(side);
      if (next !== this.directions[side]) {
        this.directions[side] = next;
        this.sendStateUpdate(side);
      }
    }
    return true;
  }

  public reset(): void {
    this.mode = "unset";
    this.directions.left = "stop";
    this.directions.right = "stop";
    this.keysDown.left = { up: false, down: false };
    this.keysDown.right = { up: false, down: false };
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("keydown", onSpaceKeyDown);
  }

  public listen() {
    this.reset();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onSpaceKeyDown);
  }
}

// Global handler'lar
function onKeyDown(event: KeyboardEvent) {
  // auto-repeat spam’ini azalt (opsiyonel)
  if (event.repeat) return;
  if (GameInputHandler.getInstance().keyDown(event.key)) {
    event.preventDefault();
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (GameInputHandler.getInstance().keyUp(event.key)) {
    event.preventDefault();
  }
}

// Space auto-repeat spam’ini engelle
function onSpaceKeyDown(event: KeyboardEvent) {
  if (event.code !== "Space" || event.repeat) return; // <= önemli
  const gameInfo = gameInstance.gameInfo;
  if (!gameInfo) return;
  if (gameInfo.mode !== "vsAI" && gameInfo.mode !== "localGame") return;
  if (!gameInstance.uiManager.startButton!.classList.contains("hidden")) return;

  event.preventDefault();
  gameInfo.state!.isPaused = !gameInfo.state!.isPaused;
  console.log("Game paused status: ", gameInfo.state!.isPaused);
  if (gameInfo.state!.isPaused) {
    GameEventBus.getInstance().emit({ type: "GAME_PAUSED", payload: gameInfo });
  } else {
    GameEventBus.getInstance().emit({ type: "GAME_RESUMED", payload: gameInfo });
  }
}

function listenTouchButtons() {
  let up_buttons = document.getElementById("up_touch_buttons_left");
  let down_buttons = document.getElementById("down_touch_buttons_left");

  up_buttons?.addEventListener("touchstart", () => {
    GameInputHandler.getInstance().keyDown("w");
  });

  up_buttons?.addEventListener("touchend", () => {
    GameInputHandler.getInstance().keyUp("w");
  });

  down_buttons?.addEventListener("touchstart", () => {
    GameInputHandler.getInstance().keyDown("s");
  });

  down_buttons?.addEventListener("touchend", () => {
    GameInputHandler.getInstance().keyUp("s");
  });
}

export function listenPlayerInputs(gameInfo: GameInfo) {
  GameInputHandler.getInstance().listen();
  listenTouchButtons();
  if (gameInfo.mode === "remoteGame" || gameInfo.mode === "vsAI" || gameInfo.mode === "tournament") {
    GameInputHandler.getInstance().setMode("remote");
  } else if (gameInfo.mode === "localGame") {
    GameInputHandler.getInstance().setMode("local");
  } else {
    throw new Error(
      "Game mode is not set or invalid. Please set it to 'localGame', 'remoteGame', 'vsAI' or 'tournament': " +
        gameInfo.mode
    );
  }
}
