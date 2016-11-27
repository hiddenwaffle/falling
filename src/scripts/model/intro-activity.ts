import {GameStateType} from '../game-state';

class IntroActivity {
    
    start() {
        //
    }

    step(elapsed: number): GameStateType {
        return GameStateType.Playing; // TODO: Return this only after intro has completed.
    }
}
export const introActivity = new IntroActivity();