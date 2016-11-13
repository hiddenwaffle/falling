import {EventType, AbstractEvent} from './event-bus';

export class StandeeMovementEndedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly x: number;
    readonly z: number;

    constructor(npcId: number, x: number, z: number) {
        super();
        this.npcId = npcId;
        this.x = x;
        this.z = z;
    }

    getType() {
        return EventType.StandeeMovementEndedEventType;
    }
}