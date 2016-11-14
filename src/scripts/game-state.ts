export const enum GameStateType {
    /**
     * This is the state after program starts and before before objects start().
     */
    Initializing,

    /**
     * This is after initial objects start() and likely where the game is waiting on the player's first input.
     */
    Started,

    /**
     * This is the main game loop of controlling pieces.
     */
    Playing,

    /**
     * End of game, score is showing, nothing left to do.
     */
    Ended
}

class GameState {
    private current: GameStateType;

    constructor() {
        this.current = GameStateType.Initializing; // Default state.
    }

    getCurrent(): GameStateType {
        return this.current;
    }

    setCurrent(current: GameStateType) {
        this.current = current;
    }
}
export const gameState = new GameState();