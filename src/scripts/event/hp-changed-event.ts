import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class HpChangedEvent extends AbstractEvent {

    readonly hp: number;
    readonly playerType: PlayerType;
    readonly blinkLost: boolean;

    constructor(hp: number, playerType: PlayerType, blinkLost=false) {
        super();
        this.hp = hp;
        this.playerType = playerType;
        this.blinkLost = blinkLost;
    }

    getType() {
        return EventType.HpChangedEventType;
    }
}