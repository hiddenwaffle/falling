import {EventType, AbstractEvent} from './event-bus';
import {Cell} from '../domain/cell';
import {Color} from '../domain/color';

export class CellChangeEvent extends AbstractEvent {
    readonly cell: Cell;
    readonly row: number;
    readonly col: number;

    constructor(cell: Cell, row: number, col: number) {
        super();
        this.cell = cell;
        this.row = row;
        this.col = col;
    }

    getType() {
        return EventType.CellChangeEventType;
    }
}