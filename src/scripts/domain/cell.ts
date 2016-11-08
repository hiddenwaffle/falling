import {Color} from './color';

export class Cell {
    private color: Color;
    readonly row: number;
    readonly col: number;

    constructor(row: number, col: number) {
        this.color = Color.Empty;
        this.row = row;
        this.col = col;
    }

    setColor(color: Color) {
        this.color = color;
    }

    getColor(): Color {
        return this.color;
    }
}

/**
 * Offset calculated from top-left corner being 0, 0.
 */
export class CellOffset {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}