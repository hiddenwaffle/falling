import {EventType, AbstractEvent} from './event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerType} from '../domain/player-type';

export class PlayerMovementEvent extends AbstractEvent {

    readonly movement: PlayerMovement;
    readonly playerType: PlayerType;

    constructor(movement: PlayerMovement, playerType: PlayerType) {
        super();
        this.movement = movement;
        this.playerType = playerType;
    }

    getType() {
        return EventType.PlayerMovementEventType;
    }
}