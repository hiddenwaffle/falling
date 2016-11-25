import {input, Key} from './input';
import {eventBus} from '../event/event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerType} from '../domain/player-type';
import {PlayerMovementEvent} from '../event/player-movement-event';

// TODO: Here determine if player is holding down one of the arrow keys; if so, fire rapid events after (TBD) amount of time.

class Controller {

    start() {
        input.start();
    }

    step(elapsed: number) {
        input.step(elapsed);

        if (input.isDownAndUnhandled(Key.Up)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise, PlayerType.Human));
        }

        if (input.isDownAndUnhandled(Key.Left)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left, PlayerType.Human));
        }

        if (input.isDownAndUnhandled(Key.Right)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right, PlayerType.Human));
        }

        if (input.isDownAndUnhandled(Key.Down)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down, PlayerType.Human));
        }

        if (input.isDownAndUnhandled(Key.Space)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop, PlayerType.Human));
        }
    }
}
export const controller = new Controller();