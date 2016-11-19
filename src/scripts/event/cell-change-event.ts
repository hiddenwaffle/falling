import {EventType, AbstractEvent} from './event-bus';
import {Cell} from '../domain/cell';
import {Color} from '../domain/color';
import {Player} from '../domain/player';

export class CellChangeEvent extends AbstractEvent {
    readonly cell: Cell;
    readonly row: number;
    readonly col: number;
    readonly player: Player;

    constructor(cell: Cell, row: number, col: number, player: Player) {
        super();
        this.cell = cell;
        this.row = row;
        this.col = col;
        this.player = player;
    }

    getType() {
        return EventType.CellChangeEventType;
    }
}