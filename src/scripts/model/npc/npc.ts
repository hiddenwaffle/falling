export class Npc {
    readonly id: number;

    constructor() {
        this.id = Math.random() * Number.MAX_SAFE_INTEGER;
    }

    start() {
        //
    }

    /**
     * This should be called by the NPC manager rather than tracks that reference them.
     */
    step(elapsed: number) {
        //
    }
}