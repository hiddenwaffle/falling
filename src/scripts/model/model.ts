import {GameStateType, gameState} from '../game-state';
import {introActivity} from './intro-activity';
import {playingActivity} from './playing-activity';
import {endedActivity} from './ended-activity';

class Model {

    start() {
        introActivity.start();
        playingActivity.start();
        endedActivity.start();
    }

    /**
     * Delegate step() to activities.
     * Determine next state from activities.
     */
    step(elapsed: number) {
        let oldState = gameState.getCurrent();
        let newState: GameStateType;

        switch (oldState) {
            case GameStateType.Intro:
                newState = introActivity.step(elapsed);
                break;
            case GameStateType.Playing:
                newState = playingActivity.step(elapsed);
                break;
            case GameStateType.Ended:
                newState = endedActivity.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }

        if (newState !== oldState) {
            gameState.setCurrent(newState);
        }
    }
}
export const model = new Model();