import {GameStateType} from '../game-state';

import {npcManager} from './npc/npc-manager';
import {playingActivity} from './playing-activity';
import {eventBus, EventType} from '../event/event-bus';
import {FallingSequencerEvent} from '../event/falling-sequencer-event';
import {PlayerType} from '../domain/player-type';
import {vitals} from './vitals';

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
        playingActivity.step(elapsed); // Ditto.

        if (this.endedStarted === false) {
            this.endedStarted = true;

            playingActivity.clearBoards();

            // Delay for 1 second (HP is blinking at this time)
            setTimeout(() => {
                this.displayWinner();
            }, 1000)
        }

        return GameStateType.Ended;
    }

    private displayWinner() {
        playingActivity.displayEnding();

        eventBus.fire(new FallingSequencerEvent(PlayerType.Ai));    // Quick hack to clear the lights
        eventBus.fire(new FallingSequencerEvent(PlayerType.Human)); // Quick hack to clear the lights

        setTimeout(() => {
            this.displayThanks();
        }, 2500);
    }

    private displayThanks() {
        let message = <HTMLDivElement> document.getElementById('message');
        message.textContent = 'THE END - Thanks for playing all the way through our GitHub Game Off 2016 entry.';
    }
}
export const endedActivity = new EndedActivity();