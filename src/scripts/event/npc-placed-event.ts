import {EventType, AbstractEvent} from './event-bus';
import {NpcState} from '../domain/npc-state';

export class NpcPlacedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly state: NpcState;

    constructor(npcId: number, state: NpcState) {
        super();
        this.npcId = npcId;
        this.state = state;
    }

    getType() {
        return EventType.NpcPlacedEventType;
    }
}