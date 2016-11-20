import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class RowsFilledEvent extends AbstractEvent {
    
    readonly totalFilled: number;
    readonly playerType: PlayerType;

    constructor(totalFilled: number, playerType: PlayerType) {
        super();
        this.totalFilled = totalFilled;
        this.playerType = playerType;
    }

    getType() {
        return EventType.RowsFilledEventType;
    }
}