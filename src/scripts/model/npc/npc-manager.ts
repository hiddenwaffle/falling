/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

import {Npc} from './npc'
import {NpcLocation} from './npc-location';
import {eventBus, EventType} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {TOTAL_NPCS, crowdTimer} from './crowd-timer';

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

        for (let npcIdx = 0; npcIdx < TOTAL_NPCS; npcIdx++) {
            let npc = new Npc();
            // Place out of view.
            let x = -5
            let y = 15
            npc.start(x, y);

            this.npcs.set(npc.id, npc);
            this.npcsOffscreen.push(npc);
        }

        crowdTimer.start();
    }

    step(elapsed: number) {
        let expectedInPlay = crowdTimer.step(elapsed);
        this.ensureInPlayNpcCount(expectedInPlay);

        this.npcsInPlay.forEach((npc: Npc) => {
            npc.step(elapsed);
        });

        // this.npcs.forEach((npc: Npc) => {
        //     npc.step(elapsed);
        // });
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

            // Move it to one of the off screen locations.
            {
                let offscreen = Math.floor(Math.random() * 2);
                let x: number, y: number;
                if (offscreen == 0) {
                    [x, y] = this.generateRandomCoordinates(NpcLocation.OffLeft);
                } else {
                    [x, y] = this.generateRandomCoordinates(NpcLocation.OffRight);
                }
                npc.teleportTo(x, y);
            }

            // TODO: Set its path
            npc.beginWalkingTo(10, 1);
        }
    }

    private generateRandomCoordinates(location: NpcLocation): [number, number] {
        let x = 0;
        let y = 0;

        switch (location) {
            case NpcLocation.OffLeft:
                x = -5;
                y = 5;
                break;
            case NpcLocation.OffRight:
                x = 10;
                y = 15;
                break;
            case NpcLocation.BuildingLeft:
                break;
            case NpcLocation.BuildingRight:
                break;
            case NpcLocation.BuildingMiddle:
                break;
            case NpcLocation.Middle:
                break;
            default:
                console.log('should not get here');
        }

        return [x, y];
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