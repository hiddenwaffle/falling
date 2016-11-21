import {Shape} from './shape';
import {Cell} from '../../domain/cell';
import {Color} from '../../domain/color';
import {PlayerType} from '../../domain/player-type';
import {ShapeFactory, deadShapeFactory} from './shape-factory';
import {EventBus, deadEventBus} from '../../event/event-bus';
import {CellChangeEvent} from '../../event/cell-change-event';
import {RowsFilledEvent} from '../../event/rows-filled-event';
import {ActiveShapeChangedEvent} from '../../event/active-shape-changed-event';
import {BoardFilledEvent} from '../../event/board-filled-event';

const MAX_ROWS = 19; // Top 2 rows are obstructed from view. Also, see lighting-grid.ts.
export const MAX_COLS = 10;

export class Board {
    private playerType: PlayerType;
    private shapeFactory: ShapeFactory;
    private eventBus: EventBus;

    currentShape: Shape;
    readonly matrix: Cell[][];

    private junkRowHoleColumn: number;
    private junkRowHoleDirection: number;
    private junkRowColor1: Color;
    private junkRowColor2: Color;
    private junkRowColorIdx: number;

    constructor(playerType: PlayerType, shapeFactory: ShapeFactory, eventBus: EventBus) {
        this.playerType = playerType;
        this.shapeFactory = shapeFactory;
        this.eventBus = eventBus;

        this.currentShape = null;
        this.matrix = [];
        for (let rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
            this.matrix[rowIdx] = [];
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                this.matrix[rowIdx][colIdx] = new Cell();
            }
        }

        if (playerType === PlayerType.Human) {
            this.junkRowHoleColumn = 0;
        } else {
            this.junkRowHoleColumn = MAX_COLS - 1;
        }
        this.junkRowHoleDirection = 1;
        this.junkRowColor1 = Color.White;
        this.junkRowColor2 = Color.White;
        this.junkRowColorIdx = 0;
    }

    start() {
        this.clear();
    }

    /**
     * This gives a high level view of the main game loop.
     * This shouldn't be called by the AI.
     */
    step() {
        if (this.tryGravity()) {
            this.moveShapeDown();
        } else {
            this.convertShapeToCells();
            if (this.isBoardFull()) {
                this.signalFullBoard();
                this.resetBoard();
            } else {
                this.handleAnyFilledLines();
                this.startShape(false);
            }
        }
    }

    resetBoard() {
        this.clear();
        this.startShape(true);
    }

    /**
     * Used by the AI.
     */
    getCurrentShapeColIdx(): number {
        return this.currentShape.getCol();
    }

    moveShapeLeft(): boolean {
        let success: boolean;
        this.currentShape.moveLeft();
        if (this.collisionDetected()) {
            this.currentShape.moveRight();
            success = false;
        } else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    }

    moveShapeRight(): boolean {
        let success: boolean;
        this.currentShape.moveRight();
        if (this.collisionDetected()) {
            this.currentShape.moveLeft();
            success = false;
        } else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    }

    moveShapeDown(): boolean {
        let success: boolean;
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
            this.currentShape.moveUp();
            success = false;
        } else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    }

    moveShapeDownAllTheWay() {
        do {
            this.currentShape.moveDown();
        } while (!this.collisionDetected());
        this.currentShape.moveUp();
        this.fireActiveShapeChangedEvent();
    }

    /**
     * Used by the AI.
     */
    moveToTop() {
        this.currentShape.moveToTop(); 
    }

    rotateShapeClockwise(): boolean {
        let success: boolean;
        this.currentShape.rotateClockwise();
        if (this.collisionDetected()) {
            this.currentShape.rotateCounterClockwise();
            success = false;
        } else {
            this.fireActiveShapeChangedEvent();
            success = true;
        }
        return success;
    }

    addJunkRows(numberOfRowsToAdd: number) {
        // Clear rows at the top to make room at the bottom.
        this.matrix.splice(0, numberOfRowsToAdd);

        // Add junk rows at the bottom.
        for (let idx = 0; idx < numberOfRowsToAdd; idx++) {
            // Set the row to completely filled.
            let color = this.getNextJunkRowColor();
            let row: Cell[] = [];
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                let cell = new Cell();
                cell.setColor(color);
                row.push(cell);
            }

            // Punch a hole in the line.
            let cell = row[this.junkRowHoleColumn];
            cell.setColor(Color.Empty);

            // Prepare for the next junk row line.
            this.junkRowHoleColumn += this.junkRowHoleDirection;
            if (this.junkRowHoleColumn < 0) {
                this.junkRowHoleColumn = 1;
                this.junkRowHoleDirection *= -1; // Flips the direction
            } else if (this.junkRowHoleColumn >= MAX_COLS) {
                this.junkRowHoleColumn = MAX_COLS - 2;
                this.junkRowHoleDirection *= -1; // Flips the direction
            }

            this.matrix.push(row);
        }
        
        // Notify for all cells because entire board has changed.
        // TODO: Move to own method?
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                let cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }
    }

    // getMatrixWithCurrentShapeAdded(): boolean[][] {
    //     let copy = [];
    //     for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
    //         let row = this.matrix[rowIdx];
    //         let rowCopy = [];
    //         for (let colIdx = 0; colIdx < row.length; colIdx++) {
    //             rowCopy.push(row[colIdx].getColor() !== Color.Empty);
    //         }
    //         copy.push(rowCopy);
    //     }
    //     return copy;
    // }

    /**
     * Very hacky method just so the AI has a temp copy of the board to experiment with.
     */
    cloneZombie(): Board {
        let copy = new Board(this.playerType, deadShapeFactory, deadEventBus);
        
        // Copy the current shape and the matrix. Shouldn't need anything else.
        copy.currentShape = this.currentShape.cloneSimple();
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                copy.matrix[rowIdx][colIdx].setColor(row[colIdx].getColor());
            }
        }

        return copy;
    }

    /**
     * Used by the AI.
     */
    calculateAggregateHeight(): number {
        let colHeights = this.calculateColumnHeights();
        return colHeights.reduce((a, b) => { return a + b; });
    }

    /**
     * Used by the AI.
     */
    calculateCompleteLines(): number {
        let completeLines = 0;

        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            let row = this.matrix[rowIdx];
            let count = 0;
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                if (row[colIdx].getColor() !== Color.Empty) {
                    count++;
                }
            }
            if (count >= row.length) {
                completeLines++;
            }
        }

        return completeLines;
    }

    /**
     * Used by the AI.
     * Determines holes by scanning each column, highest floor to lowest floor, and
     * seeing how many times it switches from colored to empty (but not the other way around).
     */
    calculateHoles(): number {
        let totalHoles = 0;
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            let holes = 0;
            let previousCellWasEmpty = true;
            for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
                let cell = this.matrix[rowIdx][colIdx];
                if (previousCellWasEmpty === false) {
                    if (cell.getColor() === Color.Empty) {
                        holes++;
                        previousCellWasEmpty = true;
                    } else {
                        previousCellWasEmpty = false;
                    }
                } else {
                    if (cell.getColor() === Color.Empty) {
                        previousCellWasEmpty = true;
                    } else {
                        previousCellWasEmpty = false;
                    }
                }
            }
            totalHoles += holes;
        }
        return totalHoles;
    }

    /**
     * Used by the AI.
     */
    calculateBumpiness(): number {
        let bumpiness = 0;
        let colHeights = this.calculateColumnHeights();
        for (let idx = 0; idx < colHeights.length - 2; idx++) {
            let val1 = colHeights[idx];
            let val2 = colHeights[idx + 1];
            bumpiness += Math.abs(val1 - val2);
        }
        return bumpiness;
    }

    private calculateColumnHeights(): number[] {
        let colHeights: number[] = [];
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            colHeights.push(0);
        }

        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
            let highest = 0;
            for (let rowIdx = MAX_ROWS - 1; rowIdx >= 0; rowIdx--) {
                let cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== Color.Empty) {
                    highest = MAX_ROWS - rowIdx;
                }
            }
            colHeights[colIdx] = highest;
        }
        return colHeights;
    }

    /**
     * The only reason this is not private is so the AI can experiment with it.
     * Work here should able to be be undone by undoConvertShapeToCells.
     */
    convertShapeToCells() {
        for (let offset of this.currentShape.getOffsets()) {
            let rowIdx = offset.y + this.currentShape.getRow();
            let colIdx = offset.x + this.currentShape.getCol();

            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }

            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }

            this.changeCellColor(rowIdx, colIdx, this.currentShape.color);
        }
    }

    /**
     * Used by the AI. Should undo convertShapeToCells().
     */
    undoConvertShapeToCells() {
        for (let offset of this.currentShape.getOffsets()) {
            let rowIdx = offset.y + this.currentShape.getRow();
            let colIdx = offset.x + this.currentShape.getCol();

            if (rowIdx < 0 || rowIdx >= this.matrix.length) {
                continue;
            }

            if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
                continue;
            }

            this.changeCellColor(rowIdx, colIdx, Color.Empty);
        }
    }

    private clear() {
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                this.changeCellColor(rowIdx, colIdx, Color.Empty);
            }
        }

        [this.junkRowColor1, this.junkRowColor2] = this.getRandomColors();
    }

    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    private changeCellColor(rowIdx: number, colIdx: number, color: Color) {
        // TODO: Maybe bounds check here.
        let cell = this.matrix[rowIdx][colIdx];
        cell.setColor(color);
        this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
    }

    private startShape(forceBagRefill: boolean) {
        this.currentShape = this.shapeFactory.nextShape(forceBagRefill);
        this.fireActiveShapeChangedEvent(true);
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

    /**
     * It is considered full if the two obscured rows at the top have colored cells in them.
     */
    private isBoardFull(): boolean {
        for (let rowIdx = 0; rowIdx < 2; rowIdx++) {
            for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
                let cell = this.matrix[rowIdx][colIdx];
                if (cell.getColor() !== Color.Empty) {
                    return true;
                }
            }
        }

        return false;
    }

    private signalFullBoard() {
        this.eventBus.fire(new BoardFilledEvent(this.playerType));
    }

    private handleAnyFilledLines() {
        let highestLineFilled = 0; // "highest" as in the highest in the array, which is the lowest visually to the player.

        // Traverse backwards to prevent row index from becoming out of sync when removing rows.
        let totalFilled = 0;
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
                totalFilled++;
                if (rowIdx > highestLineFilled) {
                    highestLineFilled = rowIdx;
                }
                this.removeAndCollapse(rowIdx);
                rowIdx = rowIdx + 1; // This is a really, really shaky workaround. It prevents the next row from getting skipped over on next loop.
            }
        }

        // Notify for all cells from 0 to the highestLineFilled, which could be 0 if no rows were filled.
        for (let rowIdx = 0; rowIdx <= highestLineFilled; rowIdx++) {
            let row = this.matrix[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                let cell = this.matrix[rowIdx][colIdx];
                this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
            }
        }

        if (totalFilled > 0) {
            this.eventBus.fire(new RowsFilledEvent(totalFilled, this.playerType));
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

    private fireActiveShapeChangedEvent(starting=false) {
        this.eventBus.fire(new ActiveShapeChangedEvent(this.currentShape, this.playerType, starting));
    }

    private getNextJunkRowColor(): Color {
        let color: Color;
        if (this.junkRowColorIdx <= 0) {
            color = this.junkRowColor1;
            this.junkRowColorIdx = 1;
        } else if (this.junkRowColorIdx >= 1) {
            color = this.junkRowColor2;
            this.junkRowColorIdx = 0;
        }
        return color;
    }

    private getRandomColors(): [Color, Color] {

        // Select two colors that are not equal to each other.
        let rand1 = Math.floor(Math.random() * 7);
        let rand2 = Math.floor(Math.random() * 7);
        if (rand1 === rand2) {
            rand2++;
            if (rand2 > 6) {
                rand2 = 0;
            }
        }
        return [this.colorByNumber(rand1), this.colorByNumber(rand2)];
    }
    
    private colorByNumber(value: number): Color {
        let color: Color;
        switch(value) {
            case 0:
                color = Color.Cyan;
                break;
            case 1:
                color = Color.Yellow;
                break;
            case 2:
                color = Color.Purple;
                break;
            case 3:
                color = Color.Green;
                break;
            case 4:
                color = Color.Red;
                break;
            case 5:
                color = Color.Blue;
                break;
            case 6:
                color = Color.Orange;
                break;
            default:
                color = Color.White; // Shouldn't get here
        }
        return color;
    }
}