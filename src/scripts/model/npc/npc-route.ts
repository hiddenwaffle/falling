import {NpcLocation} from './npc-location';

class Waypoint {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class NpcRoute {

    private waypoints: Waypoint[];

    constructor() {
        this.waypoints = [];
    }

    addWaypoint(x: number, y: number) {
        let waypoint = new Waypoint(x, y);
        this.waypoints.push(waypoint);
    }

    nextWaypoint(): Waypoint {
        return this.waypoints.shift();
    }
}