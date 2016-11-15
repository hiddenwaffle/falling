import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';
import {NpcState} from '../../domain/npc-state';

export class Npc {
    readonly id: number;

    private state: NpcState;
    private timeInState: number;

    // "Last" as in the last known coordinate, because it could be currently in-motion.
    private xlast: number;
    private ylast: number;

    constructor() {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.state = NpcState.Idle;
        this.timeInState = 0;

        this.xlast = 0;
        this.ylast = 0;
    }

    start(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        eventBus.fire(new NpcPlacedEvent(this.id, this.state, x, y));
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

    beginWalkingTo(x: number, y: number) {
        eventBus.fire(new NpcMovementChangedEvent(this.id, x, y));
    }

    /**
     * Signifies the end of a walk.
     */
    updatePosition(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        this.transitionTo(NpcState.Idle);
        console.log('ended ' + this.id);
    }

    getState(): NpcState {
        return this.state;
    }
}