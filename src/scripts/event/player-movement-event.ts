import {EventType, AbstractEvent} from './event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {Player} from '../domain/player';

export class PlayerMovementEvent extends AbstractEvent {

    readonly movement: PlayerMovement;
    readonly player: Player;

    constructor(movement: PlayerMovement, player: Player) {
        super();
        this.movement = movement;
        this.player = player;
    }

    getType() {
        return EventType.PlayerMovementEventType;
    }
}