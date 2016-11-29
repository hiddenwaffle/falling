import {keyboard} from './keyboard';
import {eventBus} from '../event/event-bus';
import {IntroKeyPressedEvent} from '../event/intro-key-pressed-event';

class IntroHandler {

    start() {
        //
    }

    step(elapsed: number) {
        keyboard.step(elapsed);

        if (keyboard.isAnyKeyDownAndUnhandled()) {
            eventBus.fire(new IntroKeyPressedEvent());
        }
    }
}
export const introHandler = new IntroHandler();