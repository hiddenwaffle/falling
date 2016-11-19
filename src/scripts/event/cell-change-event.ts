import {EventType, AbstractEvent} from './event-bus';
import {Cell} from '../domain/cell';
import {Color} from '../domain/color';
import {PlayerType} from '../domain/player-type';

export class CellChangeEvent extends AbstractEvent {
    readonly cell: Cell;
    readonly row: number;
    readonly col: number;
    readonly playerType: PlayerType;

    constructor(cell: Cell, row: number, col: number, playerType: PlayerType) {
        super();
        this.cell = cell;
        this.row = row;
        this.col = col;
        this.playerType = playerType;
    }

    getType() {
        return EventType.CellChangeEventType;
    }
}