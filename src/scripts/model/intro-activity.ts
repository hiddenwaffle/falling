import {GameStateType} from '../game-state';
import {GameStateChangedEvent} from '../event/game-state-changed-event';
import {IntroKeyPressedEvent} from '../event/intro-key-pressed-event';
import {EventType, eventBus} from '../event/event-bus';
import {npcManager} from './npc/npc-manager';
import {playingActivity} from './playing-activity';
import {PlayerType} from '../domain/player-type';
import {HpChangedEvent} from '../event/hp-changed-event';

/**
 * Wraps playing activity to be able to show the initial office lights. 
 */
class IntroActivity {
    
    private timeInIntro: number;
    private playerHasHitAKey: boolean;
    private introIsComplete: boolean;

    start() {
        this.timeInIntro = 0;
        this.playerHasHitAKey = false;
        this.introIsComplete = false;

        eventBus.register(EventType.GameStateChangedType, (event: GameStateChangedEvent) => {
            if (event.gameStateType === GameStateType.Intro) {
                this.handleGameStateChangedEventIntro();
            }
        });

        eventBus.register(EventType.IntroKeyPressedEventType, (event: IntroKeyPressedEvent) => {
            if (this.playerHasHitAKey === false) {
                this.playerHasHitAKey = true;
                this.transitionIntroToPlaying();
            }
        });
    }

    step(elapsed: number): GameStateType {
        this.timeInIntro += elapsed;

        npcManager.step(elapsed); // This is at the point of a game jam where I just cross my fingers and hope some things just work.

        if (this.introIsComplete) {
            return GameStateType.Playing;
        } else {
            return GameStateType.Intro;
        }
    }

    /**
     * Set up the board in a way that makes the building look like a normal building.
     */
    private handleGameStateChangedEventIntro() {
        playingActivity.generateRandomWhiteCells();
        eventBus.fire(new HpChangedEvent(0, PlayerType.Human, false));
        eventBus.fire(new HpChangedEvent(0, PlayerType.Ai, false));
    }

    private transitionIntroToPlaying() {
        this.removeWhiteCell();
        // TODO: Light up the HP bars.
    }

    private removeWhiteCell() {
        let cellsLeft = playingActivity.clearWhiteCell();
        if (cellsLeft) {
            setTimeout(() => this.removeWhiteCell(), 100);
        } else {
            this.introIsComplete = true;
        }
    }
}
export const introActivity = new IntroActivity();