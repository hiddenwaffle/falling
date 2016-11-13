import {EventType, AbstractEvent} from './event-bus';
import {NpcState} from '../domain/npc-state';

export class NpcStateChangedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly state: NpcState;

    getType() {
        return EventType.NpcStateChagedEventType;
    }
}