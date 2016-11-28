import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';
import {NpcTeleportedEvent} from '../../event/npc-teleported-event';
import {NpcMovementType} from '../../domain/npc-movement-type';
import {NpcLocation} from './npc-location';

export class Npc {
    readonly id: number;

    private movementType: NpcMovementType;
    private standingElapsed: number;

    // "Last" as in the last known coordinate, because it could be currently in-motion.
    private xlast: number;
    private ylast: number;

    private waypoints: NpcLocation[];

    constructor() {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.movementType = NpcMovementType.WaitingForCommand;
        this.standingElapsed = 0;

        this.xlast = 0;
        this.ylast = 0;

        this.waypoints = [];
    }

    start(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        eventBus.fire(new NpcPlacedEvent(this.id, x, y));
    }

    step(elapsed: number) {
        if (this.movementType === NpcMovementType.WaitingForCommand && this.waypoints.length > 0) {
            let nextLocation = this.waypoints.shift();
            this.beginWalkingTo(nextLocation);
        }
        
        if (this.movementType === NpcMovementType.Standing) {
            this.standingElapsed += elapsed;
            // TODO: Do something if enough time has elapsed.
        }
    }

    addWaypoint(location: NpcLocation) {
        this.waypoints.push(location);
    }

    /**
     * Signifies the end of a walk. Does not send an event.
     */
    updatePosition(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;

        this.movementType = NpcMovementType.WaitingForCommand;
    }

    /**
     * Teleports the NPC to the given location.
     * Sends an event so the standee can be updated.
     */
    teleportTo(location: NpcLocation) {
        let x: number, y: number;
        [x, y] = this.generateRandomCoordinates(location);

        this.xlast = x;
        this.ylast = y;

        eventBus.fire(new NpcTeleportedEvent(this.id, x, y));
    }

    private beginWalkingTo(location: NpcLocation) {
        let x: number, y: number;
        [x, y] = this.generateRandomCoordinates(location);
        this.movementType = NpcMovementType.Walking;
        eventBus.fire(new NpcMovementChangedEvent(this.id, x, y));
    }

    private generateRandomCoordinates(location: NpcLocation): [number, number] {
        let x = 0;
        let y = 0;

        switch (location) {
            case NpcLocation.OffLeft:
                [x, y] = this.randomWithinRange(-5, 5, 2);
                break;
            case NpcLocation.OffRight:
                [x, y] = this.randomWithinRange(10, 15, 2);
                break;
            case NpcLocation.BuildingLeft:
                [x, y] = this.randomWithinRange(5, 4.5, 2);
                break;
            case NpcLocation.BuildingRight:
                [x, y] = this.randomWithinRange(9, 7.5, 2);
                break;
            case NpcLocation.BuildingMiddle:
                [x, y] = this.randomWithinRange(10, 1, 2);
                break;
            case NpcLocation.Middle:
                [x, y] = this.randomWithinRange(5, 11, 2);
                break;
            default:
                console.log('should not get here');
        }

        return [x, y];
    }

    private randomWithinRange(x: number, y: number, variance: number): [number, number] {
        let xresult = x - (variance / 2) + (Math.random() * variance);
        let yresult = y - (variance / 2) + (Math.random() * variance);
        return [xresult, yresult];
    }
}