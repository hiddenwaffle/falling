import {EventType, AbstractEvent} from './event-bus';
import {Shape} from '../model/board/shape';
import {PlayerType} from '../domain/player-type';

export class ActiveShapeEndedEvent extends AbstractEvent {

    readonly shape: Shape;
    readonly playerType: PlayerType;

    constructor(shape: Shape, playerType: PlayerType) {
        super();
        this.shape = shape;
        this.playerType = playerType;
    }

    getType() {
        return EventType.ActiveShapeChangedEventType;
    }
}