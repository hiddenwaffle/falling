import {EventType, AbstractEvent} from './event-bus';

export class NpcPlacedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly x: number;
    readonly y: number

    constructor(npcId: number, x: number, y: number) {
        super();
        this.npcId = npcId;
        this.x = x;
        this.y = y;
    }

    getType() {
        return EventType.NpcPlacedEventType;
    }
}