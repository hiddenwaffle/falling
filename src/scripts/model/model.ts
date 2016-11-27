import {GameStateType, gameState} from '../game-state';
import {introActivity} from './intro-activity';
import {playingActivity} from './playing-activity';

class Model {

    start() {
        introActivity.start();
        playingActivity.start();
    }

    step(elapsed: number) {
        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                introActivity.step(elapsed);
                break;
            case GameStateType.Playing:
                playingActivity.step(elapsed);
                break;
            default:
                console.log('should not get here');
        }
    }
}
export const model = new Model();