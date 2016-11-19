import {Cell} from '../../domain/cell';
import {eventBus, EventType} from '../../event/event-bus';
import {PlayerMovement} from '../../domain/player-movement';
import {Player} from '../../domain/player';
import {PlayerMovementEvent} from '../../event/player-movement-event';

const TIME_BETWEEN_MOVES = 250;
const TIME_MAX_DEVIATION = 100;

interface Visual {
    readonly matrix: Cell[][];
}

export class Ai {

    private visual: Visual;
    private timeUntilNextMove: number;

    constructor(visual: Visual) {
        this.visual = visual;
        this.timeUntilNextMove = TIME_BETWEEN_MOVES;
    }

    start() {
        //
    }

    step(elapsed: number) {
        this.timeUntilNextMove -= elapsed;
        if (this.timeUntilNextMove <= 0) {
            this.timeUntilNextMove = TIME_BETWEEN_MOVES;
            this.performNewMovement();
        }
    }

    private performNewMovement() {
        let matrix = this.visual.matrix;

        let rand = Math.floor(Math.random() * 5);

        if (rand === 0) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise, Player.Ai));
        } else if (rand === 1) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left, Player.Ai));
        } else if (rand === 2) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right, Player.Ai));
        } else if (rand === 3) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down, Player.Ai));
        } else if (rand === 4) {
            let dropChance = Math.floor(Math.random() * 100); // Is this called Monte-Carlo?
            if (dropChance < 10) {
                eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop, Player.Ai));
            } else {
                // Do nothing this round; maybe considered a hesitation.
            }
        } else {
            console.log('should not get here');
        }
    }

    private calculateTimeUntilNextMove() {
        return Math.floor(TIME_BETWEEN_MOVES + ((Math.random() * TIME_MAX_DEVIATION) - (TIME_MAX_DEVIATION / 2)));
    }
}