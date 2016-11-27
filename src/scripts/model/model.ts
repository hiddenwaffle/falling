import {GameStateType, gameState} from '../game-state';
import {introActivity} from './intro-activity';
import {playingActivity} from './playing-activity';

class Model {

    start() {
        introActivity.start();
        playingActivity.start();
    }

    /**
     * Delegate step() to activities.
     * Determine next state from activities.
     */
    step(elapsed: number) {
        let current = gameState.getCurrent();

        switch (current) {
            case GameStateType.Intro:
                current = introActivity.step(elapsed);
                break;
            case GameStateType.Playing:
                current = playingActivity.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }

        gameState.setCurrent(current);
    }
}
export const model = new Model();