import {EventType, AbstractEvent} from './event-bus';

export class NpcStartedEvent extends AbstractEvent {

    readonly npcId: number;

    constructor(npcId: number) {
        super();
        this.npcId = npcId;
    }

    getType() {
        return EventType.NpcStartedEventType;
    }
}