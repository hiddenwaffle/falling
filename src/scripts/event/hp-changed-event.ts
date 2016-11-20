import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class HpChangedEvent extends AbstractEvent {

    readonly hp: number;
    readonly playerType: PlayerType;

    constructor(hp: number, playerType: PlayerType) {
        super();
        this.hp = hp;
        this.playerType = playerType;
    }

    getType() {
        return EventType.HpChangedEventType;
    }
}