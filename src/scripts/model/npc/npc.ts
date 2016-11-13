import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcState} from '../../domain/npc-state';

export class Npc {
    readonly id: number;
    private state: NpcState;
    private timeInState: number;

    constructor() {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.state = NpcState.Idle;
        this.timeInState = 0;
    }

    start() {
        // TODO: Set its coordinates?
        eventBus.fire(new NpcPlacedEvent(this.id, this.state));
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