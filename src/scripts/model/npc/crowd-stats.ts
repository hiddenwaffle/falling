import {Npc} from './npc';
import {NpcLocation, FocusPoint} from './npc-location';
import {gameState} from '../../game-state';

class CrowdStats {

    constructor() {
        //
    }

    start() {
        //
    }

    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    giveNpcInitialDirection(npc: Npc) {
        {
            let offscreen = Math.floor(Math.random() * 2);
            if (offscreen == 0) {
                npc.teleportTo(NpcLocation.OffLeft);
            } else {
                npc.teleportTo(NpcLocation.OffRight);
            }
        }

        // TODO: Have it walk somewhere
        npc.addWaypoint(NpcLocation.BuildingMiddle);
    }

    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    giveNpcDirection(npc: Npc) {
        // TODO: Determine what the npc should do now.
        npc.standFacing(FocusPoint.BuildingRight, 20000);
    }
}
export const crowdStats = new CrowdStats();