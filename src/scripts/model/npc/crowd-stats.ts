import {Npc} from './npc';
import {NpcLocation, FocusPoint} from './npc-location';

class CrowdStats {

    constructor() {
        //
    }

    start() {
        //
    }

    /**
     * Tell a waiting NPC what to do.
     */
    giveNpcDirection(npc: Npc, first=false) {
        if (first) {
            // TODO: NPC is offscreen at this point
            npc.addWaypoint(NpcLocation.BuildingMiddle);
        } else {
            // TODO: Determine what the npc should do now.
            npc.standFacing(FocusPoint.BuildingRight, 20000);
        }
    }
}
export const crowdStats = new CrowdStats();