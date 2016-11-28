declare const THREE: any;

import {Standee} from './standee';
import {EventType, eventBus} from '../../event/event-bus';
import {NpcPlacedEvent} from '../../event/npc-placed-event';
import {NpcTeleportedEvent} from '../../event/npc-teleported-event';
import {NpcMovementChangedEvent} from '../../event/npc-movement-changed-event';
import {NpcFacingEvent} from '../../event/npc-facing-event';

const Y_OFFSET = 0.75; // Sets their feet on the ground plane.
const STANDEE_SPEED = 0.5;

class StandeeManager {

    readonly group: any;

    private standees: Map<number, Standee>;

    constructor() {
        this.group = new THREE.Object3D();

        this.standees = new Map<number, Standee>();
    }

    start() {
        this.group.position.setY(Y_OFFSET);

        eventBus.register(EventType.NpcPlacedEventType, (event: NpcPlacedEvent) => {
            this.handleNpcPlacedEvent(event);
        });

        eventBus.register(EventType.NpcTeleportedEventType, (event: NpcTeleportedEvent) => {
            this.handleNpcTeleportedEvent(event);
        });

        eventBus.register(EventType.NpcMovementChangedEventType, (event: NpcMovementChangedEvent) => {
            this.handleNpcMovementChangedEvent(event);
        });

        eventBus.register(EventType.NpcFacingEventType, (event: NpcFacingEvent) => {
            this.handleNpcFacingEvent(event);
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
        this.group.add(standee.group);
        this.standees.set(standee.npcId, standee);

        let x = event.x;
        let z = event.y;
        this.moveToPosition(standee, x, z);
    }

    private handleNpcTeleportedEvent(event: NpcTeleportedEvent) {
        let standee = this.standees.get(event.npcId);
        if (standee != null) {
            let x = event.x;
            let z = event.y;
            this.moveToPosition(standee, x, z);
        }
    }

    private moveToPosition(standee: Standee, x: number, z: number) {
        standee.moveTo(x,z);
    }

    private handleNpcMovementChangedEvent(event: NpcMovementChangedEvent) {
        let standee = this.standees.get(event.npcId);
        if (standee != null) {
            let x = event.x;
            let z = event.y;
            standee.walkTo(x, z, STANDEE_SPEED);
        }
    }

    private handleNpcFacingEvent(event: NpcFacingEvent) {
        let standee = this.standees.get(event.npcId);
        if (standee != null) {
            let x = event.x;
            let z = event.y;
            standee.lookAt(x, z);
        }
    }
}
export const standeeManager = new StandeeManager();