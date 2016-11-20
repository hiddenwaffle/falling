import {EventType, AbstractEvent} from './event-bus';
import {Shape} from '../model/board/shape';
import {PlayerType} from '../domain/player-type';

export class ActiveShapeChangedEvent extends AbstractEvent {

    readonly shape: Shape;
    readonly playerType: PlayerType;
    readonly starting: boolean;

    constructor(shape: Shape, playerType: PlayerType, starting: boolean) {
        super();
        this.shape = shape;
        this.playerType = playerType;
        this.starting = starting;
    }

    getType() {
        return EventType.ActiveShapeChangedEventType;
    }
}