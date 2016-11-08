import {input, Key} from './input';
import {eventBus} from '../event/event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';

class Controller {

    start() {
        input.start();
    }

    step(elapsed: number) {
        if (input.isDownAndUnhandled(Key.Up)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise));
        }
    }
}
export const controller = new Controller();