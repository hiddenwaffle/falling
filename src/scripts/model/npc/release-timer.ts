import {GameStateType, gameState} from '../../game-state';
import {TIME_UNTIL_EVERYONE_ON_SCREEN} from '../../domain/constants';

// Starting position counts used in initialization.
export const TOTAL_NPCS = 40;

const NPCS_PER_SECOND = TIME_UNTIL_EVERYONE_ON_SCREEN / TOTAL_NPCS;
const TIME_TO_REACT_TO_LEAVE_MS = 5 * 1000;
const INTRO_STARTING_COUNT = 5;

class ReleaseTimer {

    private introTimeElapsed: number;
    private playTimeElapsed: number;
    private endTimeElapsed: number;

    constructor() {
        this.introTimeElapsed = 0;
        this.playTimeElapsed = 0;
        this.endTimeElapsed = 0;
    }

    start() {
    }

    step(elapsed: number): number {
        let expectedInPlay = 0;

        switch (gameState.getCurrent()) {
            case GameStateType.Intro:
                expectedInPlay = this.stepIntro(elapsed);
                break;
            case GameStateType.Playing:
                expectedInPlay = this.stepPlaying(elapsed);
                break;
            case GameStateType.Ended:
                expectedInPlay = this.stepEnded(elapsed);
                break;
            default:
                console.log('should not get here');
        }

        return expectedInPlay;
    }

    stepIntro(elapsed: number): number {
        this.introTimeElapsed += elapsed;
        return INTRO_STARTING_COUNT;
    }

    stepPlaying(elapsed: number): number {
        this.playTimeElapsed += elapsed;

        let expectedInPlay = INTRO_STARTING_COUNT + Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
        if (expectedInPlay > TOTAL_NPCS) {
            expectedInPlay = TOTAL_NPCS;
        }

        return expectedInPlay;
    }

    stepEnded(elapsed: number): number {
        return 0; // Just don't add more
    }
}
export const releaseTimer = new ReleaseTimer();