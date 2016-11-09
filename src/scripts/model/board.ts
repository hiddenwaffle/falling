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
                this.matrix[rowIdx][colIdx] = new Cell();
            }
        }

        this.msTillGravityTick = TEMP_DELAY_MS;
    }

    start() {
        this.clear();
    }

    step(elapsed: number) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
            this.msTillGravityTick = TEMP_DELAY_MS;
            this.stepNow();
        }
    }

    /**
     * This gives high level view of the main game loop.
     */
    stepNow() {
        if (this.tryGravity()) {
            this.moveShapeDown();
        } else {
            this.fireActiveShapeEndedEvent();
            this.convertShapeToCells();

            if (this.checkForGameOver()) {
                // TODO: Fire game lose event
            } else {
                this.handleAnyFilledLines();
                if (this.checkForGameWin()) {
                    // TODO: Fire game win event
                } else {
                    this.startShape();
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
        this.currentShape.moveLeft();
        if (this.collisionDetected()) {
            this.currentShape.moveRight();
        } else {
            this.fireActiveShapeChangedEvent();
        }
    }

    moveShapeRight() {
        this.currentShape.moveRight();
        if (this.collisionDetected()) {
            this.currentShape.moveLeft();
        } else {
            this.fireActiveShapeChangedEvent();
        }
    }

    moveShapeDown() {
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            this.currentShape.moveUp();
        } else {
            this.fireActiveShapeChangedEvent();
        }
    }

    moveShapeDownAllTheWay() {
        do {
            this.currentShape.moveDown();
        } while (!this.collisionDetected());
        this.currentShape.moveUp();
        this.fireActiveShapeChangedEvent();
    }

    rotateShapeClockwise() {
        this.currentShape.rotateClockwise();
        if (this.collisionDetected()) {
            this.currentShape.rotateCounterClockwise();
        } else {
            this.fireActiveShapeChangedEvent();
        }
    }

    private clear() {
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                let cell = row[colIdx];
                this.changeCellColor(cell, rowIdx, colIdx, Color.Empty);
            }
        }
    }

    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    private changeCellColor(cell: Cell, rowIdx: number, colIdx: number, color: Color) {
        cell.setColor(color);
        eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx));
    }

    private startShape() {
        this.currentShape = shapeFactory.nextShape();
        this.fireActiveShapeChangedEvent();
    }

    private tryGravity(): boolean {
        let canMoveDown = true;

        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            canMoveDown = false;
        }
        this.currentShape.moveUp();

        return canMoveDown;
    }

    /**
     * Intended for checking of the current position of the current
     * shape has any overlap with existing cells that have color.
     */
    private collisionDetected(): boolean {
        let collision = false;

        for (let offset of this.currentShape.getOffsets()) {
            let row = offset.y + this.currentShape.getRow();
            let col = offset.x + this.currentShape.getCol();

            if (row < 0 || row >= this.matrix.length) {
                collision = true;
                break;
            }

            if (col < 0 || col >= this.matrix[row].length) {
                collision = true;
                break;
            }

            if (this.matrix[row][col].getColor() !== Color.Empty) {
                collision = true;
                break;
            }
        }

        return collision;
    }

    private convertShapeToCells() {
        for (let offset of this.currentShape.getOffsets()) {
            let rowIdx = offset.y + this.currentShape.getRow();
            let colIdx = offset.x + this.currentShape.getCol();

            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }

            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }

            let cell = this.matrix[rowIdx][colIdx];
            this.changeCellColor(cell, rowIdx, colIdx, this.currentShape.color);
        }
    }

    private checkForGameOver(): boolean {
        return false; // TODO: Do it
    }

    private handleAnyFilledLines() {
        let highestLineFilled = 0; // "highest" as in the highest in the array, which is the lowest visually to the player.
        for (let rowIdx = this.matrix.length - 1; rowIdx >= 0; rowIdx--) {
            let row = this.matrix[rowIdx];
            let filled = true;
            for (let cell of row) {
                if (cell.getColor() === Color.Empty) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                if (rowIdx > highestLineFilled) {
                    highestLineFilled = rowIdx;
                }
                this.removeAndCollapse(rowIdx);
            }
        }

        // Notify for all cells from 0 to the highestLineFilled, which could be 0 if no rows were filled.
        for (let rowIdx = 0; rowIdx <= highestLineFilled; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                let cell = this.matrix[rowIdx][colIdx];
                eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx));
            }
        }
    }

    /**
     * This removes the old row and puts a new row in its place at position 0, which is the highest visually to the player.
     * Delegates cell notification to the calling method.
     */
    private removeAndCollapse(rowIdx: number) {
        this.matrix.splice(rowIdx, 1);
        this.matrix.splice(0, 0, []);
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            this.matrix[0][colIdx] = new Cell();
        }
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