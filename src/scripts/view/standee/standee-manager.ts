declare const THREE: any;

import {Standee} from './standee';
import {EventType, eventBus} from '../../event/event-bus';
import {NpcStartedEvent} from '../../event/npc-started-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';

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

        eventBus.register(EventType.NpcPlacedEventType, (event: NpcPlacedEvent) => {
            this.handleNpcPlacedEvent(event);
        });
    }

    step(elapsed: number) {
        this.standees.forEach((standee: Standee) => {
            standee.step(elapsed);
        });
    }

    private handleNpcStartedEvent(event: NpcStartedEvent) {
        let standee = new Standee(event.npcId);
        standee.start();
        this.group.add(standee.sprite);
        this.standees.set(standee.npcId, standee);
    }

    private handleNpcPlacedEvent(event: NpcPlacedEvent) {
        let standee = this.standees.get(event.npcId);
        if (standee != null) {
            this.moveToLawn(standee);
        }
    }

    private moveToLawn(standee: Standee) {
        let x = (Math.random() * 20) - 5;
        let y = 0.5;
        let z = (Math.random() * 20) + 5;
        standee.moveTo(x, y, z);

        // TODO: Walk to either side of building, or to a point somewhere right of camera
        if (z > 12) {
            standee.walkTo(0, 0.5, 0, 5000);
        } else {
            standee.walkTo(20, 0.5, 20, 5000);
        }
    }
}
export const standeeManager = new StandeeManager();