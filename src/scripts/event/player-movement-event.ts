import {EventType, AbstractEvent} from './event-bus';
import {PlayerMovement} from '../domain/player-movement';

export class PlayerMovementEvent extends AbstractEvent {

    readonly movement: PlayerMovement;

    constructor(movement: PlayerMovement) {
        super();
        this.movement = movement;
    }

    getType() {
        return EventType.PlayerMovementEventType;
    }
}