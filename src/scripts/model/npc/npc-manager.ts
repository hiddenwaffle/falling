/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {trackBuilding} from './track-building';
import {trackElevator} from './track-elevator';
import {trackLawn} from './track-lawn';

// Starting position counts used in initialization.
const TOTAL_NPCS = 20;

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
        this.npcs.forEach((npc: Npc) => {
            trackLawn.placeNpc(npc);
        });
    }

    step(elapsed: number) {
        this.npcs.forEach((npc: Npc) => {
            npc.step(elapsed);
        });

        trackBuilding.step(elapsed);
        trackElevator.step(elapsed);
        trackLawn.step(elapsed);

        // TODO: Maybe here check for NPCs that need to change tracks.
    }
}
export const npcManager = new NpcManager();