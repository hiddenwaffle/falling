import {keyboard, Key} from './keyboard';
import {GameStateType, gameState} from '../game-state';
import {introHandler} from './intro-handler';
import {playingHandler} from './playing-handler';

class Controller {

    start() {
        keyboard.start();
        playingHandler.start();
    }

    step(elapsed: number) {
        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                introHandler.step(elapsed);
                break;
            case GameStateType.Playing:
                playingHandler.step(elapsed);
                break;
            case GameStateType.Ended:
                // NOTE: End of game, no more input necessary.
                break;
            default:
                console.log('should not get here');
        }
    }
}
export const controller = new Controller();