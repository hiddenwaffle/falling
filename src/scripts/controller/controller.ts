import {GameStateType, gameState} from '../game-state';
import {playingHandler} from './playing-handler';

interface Handler {
    start(): void;
    step(elapsed: number): void;
}

class Controller {

    start() {
        playingHandler.start();
    }

    step(elapsed: number) {
        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                // TODO: Do stuff
                break;
            case GameStateType.Playing:
                playingHandler.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }
    }
}
export const controller = new Controller();