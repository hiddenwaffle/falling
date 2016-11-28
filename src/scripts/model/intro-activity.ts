import {GameStateType} from '../game-state';
import {npcManager} from './npc/npc-manager';

class IntroActivity {
    
    private timeInIntro: number;

    start() {
        this.timeInIntro = 0;
    }

    step(elapsed: number): GameStateType {
        this.timeInIntro += elapsed;

        npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.

        // TODO: Do more in intro.
        if (this.timeInIntro >= 1000) {
            return GameStateType.Playing;
        } else {
            return GameStateType.Intro;
        }
    }
}
export const introActivity = new IntroActivity();