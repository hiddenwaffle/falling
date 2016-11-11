/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {trackBuilding} from './track-building';
import {trackElevator} from './track-elevator';
import {trackLawn} from './track-lawn';

// Starting position counts used in initialization.
const LAWN_NPCS = 10;
const BUILDING_NPCS = 40;
const TOTAL_NPCS = LAWN_NPCS + BUILDING_NPCS;

class NpcManager {

    private npcs: Map<number, Npc>;

    constructor() {
        this.npcs = new Map<number, Npc>();
        for (let npcIdx = 0; npcIdx < TOTAL_NPCS; npcIdx++) {
            let npc = new Npc();
            this.npcs.set(npc.id, npc);
        }
    }

    start() {
        this.npcs.forEach((npc: Npc) => {
            npc.start();
        });

        trackBuilding.start();
        trackElevator.start();
        trackLawn.start();

        // Set NPCs into starting positions.
        let idx = 0;
        this.npcs.forEach((npc: Npc) => {
            if (idx >= 0 && idx < LAWN_NPCS) {
                trackLawn.placeNpc(npc);
            } else if (idx >= LAWN_NPCS && idx < TOTAL_NPCS) {
                trackBuilding.placeNpc(npc);
            }
            idx++;
        });
    }

    step(elapsed: number) {
        this.npcs.forEach((npc: Npc) => {
            npc.step(elapsed);
        });

        trackBuilding.step(elapsed);
        trackElevator.step(elapsed);
        trackLawn.step(elapsed);
    }
}
export const npcManager = new NpcManager();