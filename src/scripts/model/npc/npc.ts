import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';
import {NpcTeleportedEvent} from '../../event/npc-teleported-event';
import {NpcState} from '../../domain/npc-movement-type';
import {NpcLocation, FocusPoint} from './npc-location';

export class Npc {
    readonly id: number;

    private state: NpcState;
    private standingTtl: number;

    private waypoints: NpcLocation[];

    // "Last" as in the last known coordinate, because it could be currently in-motion.
    private xlast: number;
    private ylast: number;

    private readyForCommandCallback: () => void;

    constructor(readyForCommandCallback: () => void) {
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.state = NpcState.WaitingForCommand;
        this.standingTtl = 0;

        this.waypoints = [];

        this.xlast = 0;
        this.ylast = 0;

        this.readyForCommandCallback = readyForCommandCallback;
    }

    start(x: number, y: number) {
        this.xlast = x;
        this.ylast = y;
        eventBus.fire(new NpcPlacedEvent(this.id, x, y));
    }

    step(elapsed: number) {
        switch (this.state) {
            case NpcState.Walking:
                this.stepWalking();
                break;
            case NpcState.Standing:
                this.stepStanding(elapsed);
                break;
            case NpcState.WaitingForCommand:
                this.stepWaitingForCommand();
                break;
            default:
                console.log('should not get here');
        }
    }

    private stepWalking() {
        // Maybe nothing here.
    }

    private stepStanding(elapsed: number) {
        this.standingTtl -= elapsed;

        if (this.standingTtl <= 0) {
            this.readyForCommandCallback();
        }
    }

    private stepWaitingForCommand() {
        if (this.waypoints.length > 0) {
            let nextLocation = this.waypoints.shift();
            this.beginWalkingTo(nextLocation);
        } else {
            this.readyForCommandCallback();
        }
    }

    standFacing(focusPoint: FocusPoint, standingTtl: number) {
        this.state = NpcState.Standing;
        this.standingTtl = standingTtl;

        // TODO: Move NPC slightly in the direction of focusPoint to get it to look at it.
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

        this.state = NpcState.WaitingForCommand;
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
        this.state = NpcState.Walking;
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