import { Game, GameMode } from "./game";
import { InputProvider } from "./inputProviders";
import { Player } from "./matchManager";
import {DEFAULT_GAME_ENTITY_CONFIG, GameEnvironment} from "./gameEntity";

export class GameBuilder {
    private _roomId!: string;
    private _players!: Player[];
    private _gameMode?: GameMode;
    private _tournament?: { code: string; roundNo: number; finalMatch: boolean, name: string };
    private _leftInput?: (g: Game) => InputProvider;
    private _rightInput?: (g: Game) => InputProvider;

    withRoomId(roomId: string): this {
        this._roomId = roomId;
        return this;
    }

    withPlayers(...players: Player[]): this {
        this._players = players;
        return this;
    }

    withGameMode(mode: GameMode): this {
        this._gameMode = mode;
        return this;
    }

    withTournament(code: string, roundNo: number, finalMatch: boolean, name: string): this {
        this._tournament = { code, roundNo, finalMatch, name };
        return this;
    }

    withLeftInput(leftInputFactory: (g: Game) => InputProvider): this {
        this._leftInput = leftInputFactory;
        return this;
    }

    withRightInput(rightInputFactory: (g: Game) => InputProvider): this {
        this._rightInput = rightInputFactory;
        return this;
    }

    build(): Game {
        if (!this._roomId) {
            throw new Error("GameBuilder: roomId must be specified.");
        }
        if (!this._players || this._players.length === 0) {
            throw new Error("GameBuilder: players must be specified.");
        }
        if (!this._gameMode) {
            throw new Error("GameBuilder: game mode must be specified.");
        }
        if (!this._leftInput || !this._rightInput) {
            throw new Error("GameBuilder: both input providers must be specified.");
        }

        const game = new Game(this._roomId, this._players, this._gameMode, new GameEnvironment(DEFAULT_GAME_ENTITY_CONFIG));

        if (this._tournament) {
            game.tournament = this._tournament;
        }

        game.leftInput = this._leftInput(game);
        game.rightInput = this._rightInput(game);

        return game;
    }
}