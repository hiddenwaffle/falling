import {EventType, AbstractEvent} from './event-bus';
import {PlayerType} from '../domain/player-type';

export class FallingSequencerEvent extends AbstractEvent {

    readonly falling: boolean;
    readonly playerType: PlayerType;

    constructor(falling: boolean, playerType: PlayerType) {
        super();
        this.falling = falling;
        this.playerType = playerType;
    }

    getType() {
        return EventType.FallingSequencerEventType;
    }
}