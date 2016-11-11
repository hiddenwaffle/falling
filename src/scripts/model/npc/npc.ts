export const enum NpcState {
    Moving,
    Idle,
    Alarmed,
    Watching,
    Cheering
    // TODO: Socializing? Might take too much time to implement.
}

export class Npc {
    readonly id: number;
    private state: NpcState;
    private timeInState: number;

    constructor() {
        this.id = Math.random() * Number.MAX_SAFE_INTEGER;
        this.state = NpcState.Idle;
        this.timeInState = 0;
    }

    start() {
        //
    }

    /**
     * This should be called by the NPC manager rather than tracks that reference them.
     */
    step(elapsed: number) {
        this.timeInState += elapsed;
    }

    transitionTo(state: NpcState) {
        this.state = state;
        this.timeInState = 0;
    }

    getState(): NpcState {
        return this.state;
    }
}