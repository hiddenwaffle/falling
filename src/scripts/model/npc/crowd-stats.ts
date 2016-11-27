// Starting position counts used in initialization.
export const TOTAL_NPCS = 40;

// Estimating 5 minute total game time
// 5 * 60 = 300, 300 / 40 = have a new NPC be interested every 7500 milliseconds (7.5 seconds)
// Have multiple (5?) in a row during board collapse.

class CrowdStats {

    private playTimeElapsed: number;

    constructor() {
        this.playTimeElapsed = 0;
    }

    start() {
        //
    }

    step(elapsed: number) {
        this.playTimeElapsed += elapsed;
    }
}
export const crowdStats = new CrowdStats();