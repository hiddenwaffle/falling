// Starting position counts used in initialization.
export const TOTAL_NPCS = 40;

const TIME_UNTIL_EVERYONE_ON_SCREEN = 3 * 60 * 1000;
const NPCS_PER_SECOND = TIME_UNTIL_EVERYONE_ON_SCREEN / TOTAL_NPCS;
const STARTING_COUNT = 2;

class CrowdTimer {

    private playTimeElapsed: number;

    constructor() {
        this.playTimeElapsed = 0;
    }

    start() {
        this.playTimeElapsed = 0;
    }

    step(elapsed: number): number {
        this.playTimeElapsed += elapsed;

        let expectedInPlay = STARTING_COUNT + Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
        if (expectedInPlay > TOTAL_NPCS) {
            expectedInPlay = TOTAL_NPCS;
        }

        return expectedInPlay;
    }
}
export const crowdTimer = new CrowdTimer();