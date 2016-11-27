// Starting position counts used in initialization.
export const TOTAL_NPCS = 40;

const TIME_UNTIL_FULL_INTEREST = 2 * 60 * 1000;
const NPCS_PER_SECOND = TIME_UNTIL_FULL_INTEREST / TOTAL_NPCS;

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

        let expected = Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
        if (expected > TOTAL_NPCS) {
            expected = TOTAL_NPCS;
        }

        return expected;
    }
}
export const crowdTimer = new CrowdTimer();