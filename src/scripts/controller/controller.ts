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

        if (input.isDownAndUnhandled(Key.Left)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left));
        }

        if (input.isDownAndUnhandled(Key.Right)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right));
        }

        if (input.isDownAndUnhandled(Key.Down)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down));
        }

        if (input.isDownAndUnhandled(Key.Space)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop));
        }
    }
}
export const controller = new Controller();