import {EventType, AbstractEvent} from './event-bus';
import {Shape} from '../model/board/shape';
import {Player} from '../domain/player';

export class ActiveShapeEndedEvent extends AbstractEvent {

    readonly shape: Shape;
    readonly player: Player;

    constructor(shape: Shape, player: Player) {
        super();
        this.shape = shape;
        this.player = player;
    }

    getType() {
        return EventType.ActiveShapeChangedEventType;
    }
}