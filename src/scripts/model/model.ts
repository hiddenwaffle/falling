import {GameStateType, gameState} from '../game-state';
import {playingActivity} from './playing-activity';

interface Activity {
    start(): void;
    step(elapsed: number): void;
}

class Model {

    start() {
        playingActivity.start();
    }

    step(elapsed: number) {
        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                // TODO: Do stuff
                gameState.setCurrent(GameStateType.Playing);
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