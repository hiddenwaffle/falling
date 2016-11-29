import {EventType, AbstractEvent} from './event-bus';

export class IntroKeyPressedEvent extends AbstractEvent {

    getType() {
        return EventType.IntroKeyPressedEventType;
    }
}