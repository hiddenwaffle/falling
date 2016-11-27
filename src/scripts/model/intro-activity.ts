import {GameStateType, gameState} from '../game-state';

class IntroActivity {
    
    start() {
        //
    }

    step(elapsed: number) {
        gameState.setCurrent(GameStateType.Playing);
    }
}
export const introActivity = new IntroActivity();