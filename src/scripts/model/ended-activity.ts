import {GameStateType} from '../game-state';

import {npcManager} from './npc/npc-manager';
import {playingActivity} from './playing-activity';

const enum EndingState {
    ClearingBoards,
    DelayingOneSecond,
    ScrollWinnerUp
}

class EndedActivity {

    private endedStarted: boolean;

    start() {
        this.endedStarted = false;
    }

    step(elapsed: number): GameStateType {
        npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.

        if (this.endedStarted === false) {
            this.endedStarted = true;

            playingActivity.clearBoards();
            // TODO: Delay for 1 second (HP is blinking at this time)
            // TODO: Scroll up 'WINNER' on winning building
        }

        return GameStateType.Ended;
    }
}
export const endedActivity = new EndedActivity();