import {EventType, AbstractEvent} from './event-bus';
import {Cell} from '../domain/cell';
import {Color} from '../domain/color';

export class CellChangeEvent extends AbstractEvent {
    readonly cell: Cell;

    constructor(cell: Cell) {
        super();
        this.cell = cell;
    }

    getType() {
        return EventType.CellChangeEventType;
    }
}