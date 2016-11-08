import {EventType, AbstractEvent} from './event-bus';
import {Shape} from '../model/shape';

export class ActiveShapeChangedEvent extends AbstractEvent {

    readonly shape: Shape;

    constructor(shape: Shape) {
        super();
        this.shape = shape;
    }

    getType() {
        return EventType.ActiveShapeChangedEventType;
    }
}