import {Shape} from './shape';
import {Cell} from '../domain/cell';
import {Color} from '../domain/color';
import {shapeFactory} from './shape-factory';
import {eventBus} from '../event/event-bus';
import {CellChangeEvent} from '../event/cell-change-event';
import {ActiveShapeChangedEvent} from '../event/active-shape-changed-event';
import {ActiveShapeEndedEvent} from '../event/active-shape-ended-event';

const MAX_ROWS = 22; // Top 2 rows are obstructed from view.
const MAX_COLS = 10;
const TEMP_DELAY_MS = 500;

export class Board {
    private currentShape: Shape;

    private matrix: Cell[][];
    private msTillGravityTick: number;

    constructor() {
        this.currentShape = null;

        this.matrix = [];
        for (let rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new Cell(rowIdx, colIdx);
            }
        }

        this.msTillGravityTick = TEMP_DELAY_MS;
    }

    start() {
        this.clear();
    }

    /**
     * This is a high level view of the main game loop.
     */
    step(elapsed: number) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
            this.msTillGravityTick = TEMP_DELAY_MS;
            if (this.tryGravity()) {
                this.moveShapeDown();
            } else {
                this.fireActiveShapeEndedEvent();
                this.convertShapeToCells();

                if (this.checkForGameOver()) {
                    // TODO: Fire game lose event
                } else {
                    if (this.checkForGameWin()) {
                        // TODO: Fire game win event
                    } else {
                        this.startShape();
                    }
                }
            }
        }
    }

    beginNewGame() {
        this.clear();
        // TODO: Other stuff
        this.startShape();
        // TODO: Fire active shape changed event here? Deprecate the active shape started event?
    }

    moveShapeLeft() {
        // TODO: Try first before doing
        this.currentShape.moveLeft();
        this.fireActiveShapeChangedEvent();
    }

    moveShapeRight() {
        // TODO: Try first before doing
        this.currentShape.moveRight();
        this.fireActiveShapeChangedEvent();
    }

    moveShapeDown() {
        // TODO: Try first before doing
        this.currentShape.moveDown();
        this.fireActiveShapeChangedEvent();
    }

    rotateShapeClockwise() {
        // TODO: Try first before doing
        this.currentShape.rotateClockwise();
        this.fireActiveShapeChangedEvent();
    }

    private clear() {
        for (let row of this.matrix) {
            for (let cell of row) {
                this.changeCellColor(cell, Color.Empty);
            }
        }
    }

    /**
     * Helper method to change cell color and notify subscribers at the same time.
     */
    private changeCellColor(cell: Cell, color: Color) {
        cell.setColor(color);
        eventBus.fire(new CellChangeEvent(cell));
    }

    private startShape() {
        this.currentShape = shapeFactory.nextShape();
        this.fireActiveShapeChangedEvent();
    }

    private tryGravity(): boolean {
        let canMoveDown = true;

        for (let offset of this.currentShape.getOffsets()) {
            let sourceRow = offset.y + this.currentShape.getRow();
            let sourceCol = offset.x + this.currentShape.getCol();

            // Directly below the current position.
            let destRow = sourceRow + 1;
            let destCol = sourceCol;

            if (destRow < 0 || destRow >= this.matrix.length) {
                canMoveDown = false;
                break;
            }

            if (destCol < 0 || destCol >= this.matrix[destRow].length) {
                canMoveDown = false;
                break;
            }

            if (this.matrix[destRow][destCol].getColor() !== Color.Empty) {
                canMoveDown = false;
                break;
            }
        }

        return canMoveDown;
    }

    private convertShapeToCells() {
        for (let offset of this.currentShape.getOffsets()) {
            let row = offset.y + this.currentShape.getRow();
            let col = offset.x + this.currentShape.getCol();

            if (row < 0 || row >= this.matrix.length) {
                continue;
            }

            if (col < 0 || col >= this.matrix[row].length) {
                continue;
            }

            this.changeCellColor(this.matrix[row][col], this.currentShape.color);
        }
    }

    private checkForGameOver(): boolean {
        return false; // TODO: Do it
    }

    private checkForGameWin(): boolean {
        return false; // TODO: Do it
    }

    private fireActiveShapeChangedEvent() {
        eventBus.fire(new ActiveShapeChangedEvent(this.currentShape));
    }

    private fireActiveShapeEndedEvent() {
        eventBus.fire(new ActiveShapeEndedEvent(this.currentShape));
    }
}
export const board = new Board();