import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class RowsClearAnimationCompletedEvent extends AbstractEvent {
    
    readonly filledRowIdxs: number[];
    readonly playerType: PlayerType;

    constructor(filledRowIdxs: number[], playerType: PlayerType) {
        super();
        this.filledRowIdxs = filledRowIdxs.slice(0);
        this.playerType = playerType;
    }

    getType() {
        return EventType.RowsClearAnimationCompletedEventType;
    }
}