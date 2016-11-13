declare const THREE: any;

import {Standee} from './standee';
import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';

class StandeeManager {

    readonly group: any;

    private standees: Map<number, Standee>;

    constructor() {
        this.group = new THREE.Object3D();

        this.standees = new Map<number, Standee>();
    }

    start() {
        eventBus.register(EventType.NpcPlacedEventType, (event: NpcPlacedEvent) => {
            this.handleNpcPlacedEvent(event);
        });

        eventBus.register(EventType.NpcMovementChangedEventType, (event: NpcMovementChangedEvent) => {
            this.handleNpcMovementChangedEvent(event);
        });
    }

    step(elapsed: number) {
        this.standees.forEach((standee: Standee) => {
            standee.step(elapsed);
        });
    }

    private handleNpcPlacedEvent(event: NpcPlacedEvent) {
        let standee = new Standee(event.npcId);
        standee.start();
        this.group.add(standee.sprite);
        this.standees.set(standee.npcId, standee);
        this.moveToInitialPosition(standee);
    }

    private moveToInitialPosition(standee: Standee) {
        // TODO: Use event.x, event.y to calculate
        let x = (Math.random() * 20) - 5;
        let y = 0.5;
        let z = (Math.random() * 20) + 5;
        standee.moveTo(x, y, z);
    }

    private handleNpcMovementChangedEvent(event: NpcMovementChangedEvent) {
        let standee = this.standees.get(event.npcId);
        if (standee != null) {
            // TODO: Use event.x, event.y to calculate
            standee.walkTo(0, 0.5, 0, 5000);
        }
    }
}
export const standeeManager = new StandeeManager();