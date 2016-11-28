/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {NpcLocation, FocusPoint} from './npc-location';
import {eventBus, EventType} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {TOTAL_NPCS, releaseTimer} from './release-timer';
import {crowdStats} from './crowd-stats';

class NpcManager {

    private npcs: Map<number, Npc>;

    private npcsOffscreen: Npc[];
    private npcsInPlay: Npc[];

    constructor() {
        this.npcs = new Map<number, Npc>();

        this.npcsOffscreen = [];
        this.npcsInPlay = [];
    }

    start() {
        eventBus.register(EventType.StandeeMovementEndedEventType, (event: StandeeMovementEndedEvent) => {
            this.handleStandeeMovementEndedEvent(event);
        });

        // TODO: Register listeners for game events, like board collapse or if a shape caused holes.

        for (let npcIdx = 0; npcIdx < TOTAL_NPCS; npcIdx++) {
            let npc = new Npc(() => {
                crowdStats.giveDirection(npc);
            });

            npc.start();
            this.npcs.set(npc.id, npc);
            this.npcsOffscreen.push(npc);
        }

        releaseTimer.start();
        crowdStats.start();
    }

    step(elapsed: number) {
        let expectedInPlay = releaseTimer.step(elapsed);
        this.ensureInPlayNpcCount(expectedInPlay);

        this.npcsInPlay.forEach((npc: Npc) => {
            npc.step(elapsed);
        });
    }

    private ensureInPlayNpcCount(expectedInPlay: number) {
        if (this.npcsInPlay.length < expectedInPlay) {
            let diff = expectedInPlay - this.npcsInPlay.length;
            for (let count = 0; count < diff; count++) {
                this.sendAnOffscreenNpcIntoPlay();
            }
        }
    }

    private sendAnOffscreenNpcIntoPlay() {
        let npc = this.npcsOffscreen.pop();
        if (npc != null) {
            this.npcsInPlay.push(npc);
            crowdStats.giveInitialDirection(npc);
        }
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