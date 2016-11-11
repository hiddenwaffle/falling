import {LawnSide} from '../../domain/lawn-side';
import {Npc} from './npc';

class NpcWrap {

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

    private npcWraps: NpcWrap[];

    constructor() {
        this.npcWraps = [];
    }

    start() {
        //
    }

    step(elapsed: number) {
        for (let npcWrap of this.npcWraps) {
            npcWrap.step(elapsed);
        };
    }

    placeNpc(npc: Npc, random: boolean) {
        if (random) {
            // TODO: Random coordinates.
        } else {
            // TODO: Where front of building would be.
        }
        let npcWrap = new NpcWrap(npc); 
        this.npcWraps.push(npcWrap);
    }
}
export const trackLawn = new TrackLawn();