declare const THREE: any;

import {Standee} from './standee';
import {Location} from '../../domain/location';
import {EventType, eventBus} from '../../event/event-bus';
import {NpcStartedEvent} from '../../event/npc-started-event';
import {NpcPlacedEvent} from '../../event/npc-placed-event';

class StandeeManager {

    readonly group: any;

    private standees: Map<number, Standee>;

    constructor() {
        this.group = new THREE.Object3D();

        // let geometry = new THREE.BoxGeometry(4, 3, 1);
        // let material = new THREE.MeshBasicMaterial({color: 0x00aa33, transparent: true, opacity: 0.5});
        // let cube = new THREE.Mesh(geometry, material);
        // cube.position.set(1, 0, 5);
        // this.group.add(cube);

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
        if (standee !== null && standee !== undefined) {
            switch (event.location) {
                case Location.Lawn:
                    this.moveToLawn(standee);
                    break;
                case Location.Door:
                    debugger;
                case Location.Building:
                    debugger;
                    break;
                case Location.Elevator:
                    debugger;
                    break;
                default:
                    console.error('Unknown location: ' + event.location);
            }
        }
    }

    private moveToLawn(standee: Standee) {
        let x = (Math.random() * 20) - 5;
        let y = 0.5;
        let z = (Math.random() * 20) + 5;
        standee.moveTo(x, y, z);

        // TODO: Walk to either side of building, or to a point somewhere right of camera
        standee.walkTo(0, 0.5, 0, 0.02);
    }
}
export const standeeManager = new StandeeManager();