import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class HpChangedEvent extends AbstractEvent {

    readonly hp: number;
    readonly playerType: PlayerType;
    readonly blinkPlusOne: boolean;

    constructor(hp: number, playerType: PlayerType, blinkPlusOne=false) {
        super();
        this.hp = hp;
        this.playerType = playerType;
        this.blinkPlusOne = blinkPlusOne;
    }

    getType() {
        return EventType.HpChangedEventType;
    }
}