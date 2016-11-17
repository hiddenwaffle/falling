/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {NpcState} from '../../domain/npc-state';
import {eventBus, EventType} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';

// Starting position counts used in initialization.
const TOTAL_NPCS = 1;

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
        eventBus.register(EventType.StandeeMovementEndedEventType, (event: StandeeMovementEndedEvent) => {
            this.handleStandeeMovementEndedEvent(event);
        });

        this.npcs.forEach((npc: Npc) => {
            {
                let x = 5 // (Math.random() * 10);
                let y = 5 // (Math.random() * 15);
                console.log("start: %f, %f", x, y);
                npc.start(x, y);
            }

            // TODO: Move this elsewhere:
            {
                let x = 5;
                let y = 8;
                console.log("end: %f, %f", x, y);
                npc.beginWalkingTo(x, y);
            }
        });
    }

    step(elapsed: number) {
        this.npcs.forEach((npc: Npc) => {
            npc.step(elapsed);
        });
    }

    private handleStandeeMovementEndedEvent(event: StandeeMovementEndedEvent) {
        let npc = this.npcs.get(event.npcId);
        if (npc != null) {
            let x = event.x;
            let y = event.z;
            npc.updatePosition(x, y);
        }
    }
}
export const npcManager = new NpcManager();