import {Shape} from '../board/shape';
import {PANEL_COUNT_PER_FLOOR} from '../../domain/constants';
import {Cell} from '../../domain/cell';
import {Color} from '../../domain/color';
import {eventBus, EventType} from '../../event/event-bus';
import {ActiveShapeChangedEvent} from '../../event/active-shape-changed-event';
import {ActiveShapeEndedEvent} from '../../event/active-shape-ended-event';
import {PlayerMovement} from '../../domain/player-movement';
import {PlayerType} from '../../domain/player-type';
import {PlayerMovementEvent} from '../../event/player-movement-event';
import {vitals} from '../vitals';

const MAX_COLS = PANEL_COUNT_PER_FLOOR;

/**
 * How long to wait before manipulating a shape that has just come into play.
 */
const TIME_DELAY = 500;

/**
 * How long to wait before manipulating the shape that is in play.
 */
const TIME_BETWEEN_MOVES = 200;

// These constants are for timing how long to wait before dropping shape, since the start of the shape.
const TIME_FASTEST_TILL_DROP = 1700;
const TIME_SLOWEST_TILL_DROP = 4000;

/**
 * Adds some variation to TIME_BETWEEN_MOVES
 */
const TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES = 100;

interface ZombieBoard {
    // Ways to interact with it.
    moveShapeLeft(): boolean;
    moveShapeRight(): boolean;
    moveShapeDown(): boolean;
    moveShapeDownAllTheWay(): void;
    moveToTop(): void;
    rotateShapeClockwise(): boolean;
    convertShapeToCells(): void;
    undoConvertShapeToCells(): void;

    // Ways to derive information from it.
    getCurrentShapeColIdx(): number;
    calculateAggregateHeight(): number;
    calculateCompleteLines(): number;
    calculateHoles(): number;
    calculateBumpiness(): number;
}

interface RealBoard extends ZombieBoard {
    cloneZombie(): ZombieBoard;
}

export class Ai {

    private realBoard: RealBoard;
    private timeUntilNextMove: number;
    private delayTtl: number;

    // How long the current shape should last, if possible, till AI hits the space bar.
    private timeTillDrop: number;

    // 0 = no rotation, 1 = one rotation, 2 = two rotations, 3 = three rotations.
    private targetRotation: number;
    private currentRotation: number;
    private targetColIdx: number;
    // Prevent AI from doing anything while the piece is waiting to "lock" into the matrix.
    private moveCompleted: boolean;

    constructor(realBoard: RealBoard) {
        this.realBoard = realBoard;
        this.timeUntilNextMove = this.calculateTimeUntilNextMove();
        this.delayTtl = 0;

        this.timeTillDrop = TIME_SLOWEST_TILL_DROP;

        this.targetRotation = 0;
        this.currentRotation = 0;
        this.targetColIdx = 0;
        this.moveCompleted = false;
    }

    start() {
        eventBus.register(EventType.ActiveShapeChangedEventType, (event: ActiveShapeChangedEvent) => {
            this.handleActiveShapeChangedEvent(event);
        });
    }

    step(elapsed: number) {
        this.timeTillDrop -= elapsed;

        if (this.delayTtl > 0) {
            this.delayTtl -= elapsed;
        } else {
            this.timeUntilNextMove -= elapsed;
            if (this.timeUntilNextMove <= 0) {
                this.timeUntilNextMove = this.calculateTimeUntilNextMove();
                this.advanceTowardsTarget();
            }
        }
    }

    /**
     * This method provides a high-level view of the AI's thought process.
     */
    strategize() {
        // Part 1 - Determine how long this move should be, based on current score.
        {
            this.timeTillDrop = TIME_SLOWEST_TILL_DROP;
            // TODO: Do it
        }

        // Part 2 - Determine how to fit the given shape.
        {
            let zombie = this.realBoard.cloneZombie();

            // Iterate through all possible rotations and columns
            let bestFitness = Number.MIN_SAFE_INTEGER;
            let bestRotation = 0;
            let bestColIdx = 0;
            for (let rotation = 0; rotation < 4; rotation++) {
                while(zombie.moveShapeLeft());

                for (let idx = 0; idx < MAX_COLS; idx++) {
                    zombie.moveShapeDownAllTheWay();
                    zombie.convertShapeToCells();

                    let fitness = this.calculateFitness(zombie);
                    if (fitness > bestFitness) {
                        bestFitness = fitness;
                        bestRotation = rotation;
                        bestColIdx = zombie.getCurrentShapeColIdx(); // Use this rather than idx in case it was off because of whatever reason (obstruction, wall, etc...)
                    }

                    zombie.undoConvertShapeToCells();
                    zombie.moveToTop();
                    let canMoveRight = zombie.moveShapeRight();
                    if (canMoveRight === false) {
                        break;
                    }
                }
                zombie.rotateShapeClockwise();
            }

            // Finally, set the values that will let the AI advance towards the target.
            this.targetRotation = bestRotation;
            this.currentRotation = 0;
            this.targetColIdx = bestColIdx;
            this.moveCompleted = false;
        }
    }

    private handleActiveShapeChangedEvent(event: ActiveShapeChangedEvent) {
        if (event.playerType === PlayerType.Ai) {
            if (event.starting === true) {
                this.delayTtl = TIME_DELAY;
            }
        } else {
            // Do not need to react to human's shape movements.
        }
    }

    /**
     * Based on https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/
     */
    private calculateFitness(zombie: ZombieBoard) {
        let aggregateHeight = zombie.calculateAggregateHeight();
        let completeLines = zombie.calculateCompleteLines();
        let holes = zombie.calculateHoles();
        let bumpiness = zombie.calculateBumpiness();
        let fitness = (-0.510066 * aggregateHeight)
                    + ( 0.760666 * completeLines)
                    + (-0.35663  * holes)
                    + (-0.184483 * bumpiness);
        return fitness;
    }

    private advanceTowardsTarget() {
        if (this.moveCompleted === true) {
            return;
        }

        if (this.currentRotation === this.targetRotation && this.realBoard.getCurrentShapeColIdx() === this.targetColIdx) {
            if (this.timeTillDrop <= 0) {
                this.realBoard.moveShapeDownAllTheWay();
                this.currentRotation = 0;
                this.targetColIdx = 0;
                this.moveCompleted = true;
            } else {
                // Still have time to wait before dropping the shape.
                console.log('waiting: ' + this.timeTillDrop);
            }
        } else {
            if (this.currentRotation < this.targetRotation) {
                this.realBoard.rotateShapeClockwise();
                this.currentRotation++;
            }

            if (this.realBoard.getCurrentShapeColIdx() < this.targetColIdx) {
                this.realBoard.moveShapeRight();
            } else if (this.realBoard.getCurrentShapeColIdx() > this.targetColIdx) {
                this.realBoard.moveShapeLeft();
            }
        }
    }

    private calculateTimeUntilNextMove(): number {
        return Math.floor(TIME_BETWEEN_MOVES + (Math.random() * TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES));
    }
}