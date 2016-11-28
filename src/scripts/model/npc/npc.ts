import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';
import {NpcTeleportedEvent} from '../../event/npc-teleported-event';
import {NpcMovementType} from '../../domain/npc-movement-type';
import {NpcLocation} from './npc-location';

export class Npc {
    readonly id: number;

    private movementType: NpcMovementType;

    private currentLocation: NpcLocation;
    private nextLocation: NpcLocation;
    private timeInLocation: number;

    // "Last" as in the last known coordinate, because it could be currently in-motion.
    private xlast: number;
    private ylast: number;

    constructor() {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.movementType = NpcMovementType.Idle;

        this.currentLocation = NpcLocation.None;
        this.nextLocation = NpcLocation.None;
        this.timeInLocation = 0;

        this.xlast = 0;
        this.ylast = 0;
    }

    start(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        eventBus.fire(new NpcPlacedEvent(this.id, x, y));
    }

    step(elapsed: number) {
        //
    }

    beginWalkingTo(x: number, y: number) {
        this.movementType = NpcMovementType.Walking;
        eventBus.fire(new NpcMovementChangedEvent(this.id, x, y));
    }

    /**
     * Signifies the end of a walk. Does not send an event.
     */
    updatePosition(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        this.movementType = NpcMovementType.Idle;
    }

    /**
     * Teleports the NPC to the given location.
     * Sends an event so the standee can be updated.
     */
    teleportTo(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        eventBus.fire(new NpcTeleportedEvent(this.id, x, y));
    }
}