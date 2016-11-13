/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {eventBus, EventType} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';

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

        // Set NPCs into starting positions.
        this.npcs.forEach((npc: Npc) => {
            eventBus.fire(new NpcPlacedEvent(npc.id, npc.getState()));
        });
    }

    step(elapsed: number) {
        this.npcs.forEach((npc: Npc) => {
            npc.step(elapsed);
        });
    }
}
export const npcManager = new NpcManager();