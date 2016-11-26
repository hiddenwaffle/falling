import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class ActiveShapeEndedEvent extends AbstractEvent {

    readonly playerType: PlayerType;
    readonly rowIdx: number;

    constructor(playerType: PlayerType, rowIdx: number) {
        super();
        this.playerType = playerType;
        this.rowIdx = rowIdx;
    }

    getType() {
        return EventType.ActiveShapeEndedEventType;
    }
}