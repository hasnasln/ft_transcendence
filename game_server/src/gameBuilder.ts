import { Game, GameMode } from "./game";
import { InputProvider } from "./inputProviders";
import { Player } from "./matchManager";

/**
 * Fluent builder for constructing fully-configured `Game` instances.
 *
 * Example:
 *   const game = new GameBuilder()
 *                 .withRoomId("room_alice_bob")
 *                 .withPlayers(alice, bob)
 *                 .withGameMode("remoteGame")
 *                 .withTournament("ABC123", 2, false)
 *                 .build();
 */
export class GameBuilder {
    private _roomId!: string;
    private _player1!: Player;
    private _player2!: Player;
    private _gameMode?: GameMode;
    private _tournament?: { code: string; roundNo: number; finalMatch: boolean };
    private _leftInput?: (g: Game) => InputProvider;
    private _rightInput?: (g: Game) => InputProvider;

    withRoomId(roomId: string): this {
        this._roomId = roomId;
        return this;
    }

    withPlayers(player1: Player, player2: Player): this {
        this._player1 = player1;
        this._player2 = player2;
        return this;
    }

    withGameMode(mode: GameMode): this {
        this._gameMode = mode;
        return this;
    }

    withTournament(code: string, roundNo: number, finalMatch: boolean): this {
        this._tournament = { code, roundNo, finalMatch };
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
        if (!this._player1 || !this._player2) {
            throw new Error("GameBuilder: both players must be specified.");
        }
        if (!this._gameMode) {
            throw new Error("GameBuilder: game mode must be specified.");
        }
        if (!this._leftInput || !this._rightInput) {
            throw new Error("GameBuilder: both input providers must be specified.");
        }

        const game = new Game(this._roomId, this._player1, this._player2, this._gameMode);

        if (this._tournament) {
            game.tournament = this._tournament;
        }

        game.leftInput = this._leftInput(game);
        game.rightInput = this._rightInput(game);

        return game;
    }
}