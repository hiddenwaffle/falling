/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {NpcState} from '../../domain/npc-state';
import {eventBus, EventType} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {TOTAL_NPCS, crowdStats} from './crowd-stats';

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
            // Place them out of view.
            let x = -5
            let y = 15
            npc.start(x, y);
        });

        crowdStats.start();
    }

    step(elapsed: number) {
        crowdStats.step(elapsed);

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