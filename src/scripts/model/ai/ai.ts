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

interface ZombieBoard {
    // Ways to interact with it.
    moveShapeLeft(): boolean;
    moveShapeRight(): boolean;
    moveShapeDown(): boolean;
    moveShapeDownAllTheWay(): void;
    rotateShapeClockwise(): boolean;

    // Ways to derive information from it.
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

    constructor(realBoard: RealBoard) {
        this.realBoard = realBoard;
        this.timeUntilNextMove = TIME_BETWEEN_MOVES;
    }

    start() {
        //
    }

    step(elapsed: number) {
        this.timeUntilNextMove -= elapsed;
        if (this.timeUntilNextMove <= 0) {
            this.timeUntilNextMove = TIME_BETWEEN_MOVES;
            // TODO: Do something.
        }
    }

    strategize() {
        let zombie = this.realBoard.cloneZombie();

        // Iterate through all possible rotations and columns
        let bestFitness = Number.MIN_SAFE_INTEGER;
        let bestRotation = 0;
        let bestColIdx = 0;
        for (let rotation = 0; rotation < 4; rotation++) {
            while(zombie.moveShapeLeft());
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                zombie.moveShapeDownAllTheWay();
                let fitness = this.calculateFitness(zombie);
                if (fitness > bestFitness) {
                    bestFitness = fitness;
                    bestRotation = rotation;
                    bestColIdx = colIdx;
                }
                zombie.moveShapeRight();
            }
            zombie.rotateShapeClockwise();
        }

        console.log('bestFitness: %f, %d, %d', bestFitness, bestRotation, bestColIdx);
    }

    /**
     * Based on https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/
     */
    private calculateFitness(zombie: ZombieBoard) {
        let aggregateHeight = zombie.calculateAggregateHeight();
        let completeLines = zombie.calculateCompleteLines();
        let holes = zombie.calculateHoles();
        let bumpiness = zombie.calculateBumpiness();
        let fitness = -0.510066 * aggregateHeight + 0.760666 * completeLines + -0.35663 * holes + -0.184483 * bumpiness;
        return fitness;
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