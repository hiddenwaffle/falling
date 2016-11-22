import {EventType, eventBus} from '../../event/event-bus';
import {CellChangeEvent} from '../../event/cell-change-event';
import {ActiveShapeChangedEvent} from '../../event/active-shape-changed-event';
import {HpChangedEvent} from '../../event/hp-changed-event';
import {RowsFilledEvent} from '../../event/rows-filled-event';
import {RowsClearAnimationCompletedEvent} from '../../event/rows-clear-animation-completed-event';
import {LightingGrid, FLOOR_COUNT, PANEL_COUNT_PER_FLOOR} from './lighting-grid';
import {Color} from '../../domain/color';
import {CellOffset} from '../../domain/cell';
import {PlayerType} from '../../domain/player-type';

export class Switchboard {

    private lightingGrid: LightingGrid;
    private playerType: PlayerType;

    constructor(lightingGrid: LightingGrid, playerType: PlayerType) {
        this.lightingGrid = lightingGrid;
        this.playerType = playerType;
    }
    
    start() {
        eventBus.register(EventType.ActiveShapeChangedEventType, (event: ActiveShapeChangedEvent) => {
            if (this.playerType === event.playerType) {
                this.handleActiveShapeChangedEvent(event);
            }
        });

        eventBus.register(EventType.CellChangeEventType, (event: CellChangeEvent) => {
            if (this.playerType === event.playerType) {
                this.handleCellChangeEvent(event);
            }
        });

        eventBus.register(EventType.RowsFilledEventType, (event: RowsFilledEvent) => {
            if (this.playerType === event.playerType) {
                this.animateRowClearing(event.filledRowIdxs);
            } else {
                this.animateJunkRowAdding(event.filledRowIdxs.length);
            }
        });

        eventBus.register(EventType.HpChangedEventType, (event: HpChangedEvent) => {
            if (this.playerType === event.playerType) {
                this.handleHpChangedEvent(event);
            }
        });
    }

    step(elapsed: number) {
        //
    }

    private handleActiveShapeChangedEvent(event: ActiveShapeChangedEvent) {
        let floorIdx = this.convertRowToFloor(event.shape.getRow());
        let panelIdx = event.shape.getCol();
        let color = this.convertColor(event.shape.color);

        let yTotalOffset = 0;
        let xTotalOffset = 0;
        let offsets = event.shape.getOffsets();
        for (let offset of offsets) {
            let offsetFloorIdx = floorIdx - offset.y;
            let offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);

            yTotalOffset += offset.y;
            xTotalOffset += offset.x;
        }

        let yoff = (yTotalOffset / offsets.length) - 2;
        let xoff = xTotalOffset / offsets.length;
        this.lightingGrid.sendHighlighterTo(floorIdx + yoff, panelIdx + xoff, color);

        if (this.playerType === PlayerType.Human) {
            let activeShapeLightPosition = this.lightingGrid.getActiveShapeLightPosition();
            // TODO: Have the camera look at this?
        }
    }

    private handleCellChangeEvent(event: CellChangeEvent) {
        let floorIdx = this.convertRowToFloor(event.row);
        if (floorIdx >= FLOOR_COUNT) {
            return; // Skip obstructed floors
        }

        let panelIdx = event.col;
        if (event.cell.getColor() === Color.Empty) {
            this.lightingGrid.switchRoomOff(floorIdx, panelIdx);
        } else {
            let color = this.convertColor(event.cell.getColor());
            this.lightingGrid.switchRoomOn(floorIdx, panelIdx, color);
        }
    }

    private animateRowClearing(filledRowIdxs: number[]) {
        // TODO: Do it
        setTimeout(() => {
            eventBus.fire(new RowsClearAnimationCompletedEvent(filledRowIdxs, this.playerType));
        }, 1); // TODO: Actually do the animation.
    }

    private animateJunkRowAdding(junkRowCount: number) {
        // TODO: Do it
        // Do not need to fire an event at the end of this animation because the board
        // does not need to listen for it (it listens for the clearing animation instead).
    }

    private handleHpChangedEvent(event: HpChangedEvent) {
        this.lightingGrid.updateHp(event.hp);
    }

    /**
     * Convert cell row/col coordinates to floor/panel coordinates.
     * Account for the two floors that are obstructed from view. (?)
     */
    private convertRowToFloor(row: number) {
        let thing = (FLOOR_COUNT - row) + 1;
        return thing;
    }

    private convertColor(color: Color): number {
        let value: number;
        switch (color) {
            case Color.Cyan:
                value = 0x33cccc;
                break;
            case Color.Yellow:
                value = 0xffff55;
                break;
            case Color.Purple:
                value = 0xa020a0;
                break;
            case Color.Green:
                value = 0x20a020;
                break;
            case Color.Red:
                value = 0xff3333;
                break;
            case Color.Blue:
                value = 0x4444cc;
                break;
            case Color.Orange:
                value = 0xeed530;
                break;
            case Color.White:
                value = 0xffffff;
                break;
            // Default or missing case is black.
            case Color.Empty:
            default:
                value = 0x000000;
                break;
        }
        return value;
    }
}