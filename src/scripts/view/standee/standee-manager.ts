declare const THREE: any;

import {Standee} from './standee';
import {EventType, eventBus} from '../../event/event-bus';
import {NpcStartedEvent} from '../../event/npc-started-event';

class StandeeManager {

    readonly group: any;

    private standees: Map<number, Standee>;

    constructor() {
        this.group = new THREE.Object3D();

        this.standees = new Map<number, Standee>();
    }

    start() {
        eventBus.register(EventType.NpcStartedEventType, (event: NpcStartedEvent) => {
            this.handleNpcStartedEvent(event);
        });
    }

    step(elapsed: number) {
        this.standees.forEach((standee: Standee) => {
            standee.step(elapsed);
        });
    }

    private handleNpcStartedEvent(event: NpcStartedEvent) {
        let standee = new Standee(event.npcId);
        this.group.add(standee.sprite);
        this.standees.set(standee.npcId, standee);
        standee.start();
    }
}
export const standeeManager = new StandeeManager();