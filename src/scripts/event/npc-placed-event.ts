import {EventType, AbstractEvent} from './event-bus';
import {Location} from '../domain/location';

export class NpcPlacedEvent extends AbstractEvent {

    readonly npcId: number;
    readonly location: Location;

    constructor(npcId: number, location: Location) {
        super();
        this.npcId = npcId;
        this.location = location;
    }

    getType() {
        return EventType.NpcPlacedEventType;
    }
}