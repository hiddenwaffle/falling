import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class RowsClearAnimationCompletedEvent extends AbstractEvent {
    
    readonly playerType: PlayerType;

    constructor(playerType: PlayerType) {
        super();
        this.playerType = playerType;
    }

    getType() {
        return EventType.RowsClearAnimationCompletedEventType;
    }
}