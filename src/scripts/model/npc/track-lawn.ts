import {eventBus, EventType} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {Npc} from './npc';

class LawnCart {

    readonly npc: Npc;

    constructor(npc: Npc) {
        this.npc = npc;
    }

    start() {
        //
    }

    step(elapsed: number) {
        //
    }
}

/**
 * Has NPCs walk on the left and right sidewalks, unless the game is going, then they
 * have a chance to stop and watch for a little while.
 */
class TrackLawn {

    private lawnCarts: LawnCart[];

    constructor() {
        this.lawnCarts = [];
    }

    start() {
        //
    }

    step(elapsed: number) {
        for (let lawnCart of this.lawnCarts) {
            lawnCart.step(elapsed);
        };
    }

    placeNpc(npc: Npc) {
        let lawnCart = new LawnCart(npc); 
        this.lawnCarts.push(lawnCart);
        eventBus.fire(new NpcPlacedEvent(npc.id, npc.getState()));
    }

    placeNpcDoor(npc: Npc) {
        // TODO: Like placeNpcRandom(), but at a specific coordinate.
    }
}
export const trackLawn = new TrackLawn();