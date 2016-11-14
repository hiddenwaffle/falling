export const enum GameStateType {
    /**
     * This is the state after program starts and before before objects start().
     */
    Initializing,

    /**
     * This is after initial objects start() and likely where the game is waiting on player input.
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
    //
}
