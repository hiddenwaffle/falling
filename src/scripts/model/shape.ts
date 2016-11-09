import {CellOffset} from '../domain/cell';
import {Color} from '../domain/color';

const SPAWN_COL = 3; // Left side of matrix should correspond to this.

export abstract class Shape {
    abstract readonly color: Color;
    abstract readonly valuesPerRow: number;
    protected abstract matrices: ReadonlyArray<ReadonlyArray<number>>;

    private currentMatrixIndex: number;
    private row: number;
    private col: number;

    constructor() {
        this.currentMatrixIndex = 0; // TODO: Ensure position 0 is the spawn position
        this.row = 0;
        this.col = SPAWN_COL;
    }

    moveLeft() {
        this.col--;
    }

    moveRight() {
        this.col++;
    }

    moveUp() {
        this.row--;
    }

    moveDown() {
        this.row++;
    }

    rotateCounterClockwise() {
        this.currentMatrixIndex -= 1;
        this.ensureArrayBounds();
    }

    rotateClockwise() {
        this.currentMatrixIndex += 1;
        this.ensureArrayBounds();
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    getRowCount() {
        return Math.ceil(this.getCurrentMatrix().length / this.valuesPerRow);
    }

    getOffsets(): CellOffset[] {
        let matrix = this.getCurrentMatrix();
        let offsets: CellOffset[] = [];
        for (let idx = 0; idx < matrix.length; idx++) {
            let value = matrix[idx];
            if (value === 1) {
                let x = idx % this.valuesPerRow;
                let y = Math.floor(idx / this.valuesPerRow);
                let offset = new CellOffset(x, y);
                offsets.push(offset);
            }
        }
        return offsets;
    }

    private getCurrentMatrix() {
        return this.matrices[this.currentMatrixIndex];
    }

    private ensureArrayBounds() {
        if (this.currentMatrixIndex < 0) {
            this.currentMatrixIndex = this.matrices.length - 1;
        } else if (this.currentMatrixIndex >= this.matrices.length) {
            this.currentMatrixIndex = 0;
        }
    }
}