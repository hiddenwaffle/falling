import {Shape} from '../board/shape';
import {MAX_COLS} from '../board/board';
import {Cell} from '../../domain/cell';
import {Color} from '../../domain/color';
import {eventBus, EventType} from '../../event/event-bus';
import {PlayerMovement} from '../../domain/player-movement';
import {PlayerType} from '../../domain/player-type';
import {PlayerMovementEvent} from '../../event/player-movement-event';

const TIME_BETWEEN_MOVES = 250;
const TIME_MAX_DEVIATION = 100;

interface Visual {
    readonly matrix: Cell[][];
    readonly currentShape: Shape;
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
        // TODO: Determine if new piece that is needing direction
        let aggregateHeight = this.calculateAggregateHeight();
        console.log('1: %d', aggregateHeight);
    }

    private calculateAggregateHeight() {
        let colHeights: number[] = [];
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            colHeights.push(0);
        }

        for (let rowIdx = 0; rowIdx < this.visual.matrix.length; rowIdx++) {
            let row = this.visual.matrix[rowIdx];
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                if (row[colIdx].getColor() !== Color.Empty) {
                    colHeights[colIdx]++;
                }
            }
        }

        let aggregateHeight = colHeights.reduce((a, b) => {
            return a + b;
        });
        return aggregateHeight;
    }

    // private performNewMovement() {
        // let matrix = this.visual.matrix;
        // let shape = this.visual.currentShape;

        // let rand = Math.floor(Math.random() * 5);

        // if (rand === 0) {
        //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise, PlayerType.Ai));
        // } else if (rand === 1) {
        //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left, PlayerType.Ai));
        // } else if (rand === 2) {
        //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right, PlayerType.Ai));
        // } else if (rand === 3) {
        //     eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down, PlayerType.Ai));
        // } else if (rand === 4) {
        //     let dropChance = Math.floor(Math.random() * 100); // Is this called Monte-Carlo?
        //     if (dropChance < 10) {
        //         eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop, PlayerType.Ai));
        //     } else {
        //         // Do nothing this round; maybe considered a hesitation.
        //     }
        // } else {
        //     console.log('should not get here');
        // }
    // }

    private calculateTimeUntilNextMove() {
        return Math.floor(TIME_BETWEEN_MOVES + ((Math.random() * TIME_MAX_DEVIATION) - (TIME_MAX_DEVIATION / 2)));
    }
}