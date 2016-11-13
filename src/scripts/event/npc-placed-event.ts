import {EventType, AbstractEvent} from './event-bus';
import {NpcState} from '../domain/npc-state';

export class NpcPlacedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly state: NpcState;
    readonly x: number;
    readonly y: number

    constructor(npcId: number, state: NpcState, x: number, y: number) {
        super();
        this.npcId = npcId;
        this.state = state;
        this.x = x;
        this.y = y;
    }

    getType() {
        return EventType.NpcPlacedEventType;
    }
}