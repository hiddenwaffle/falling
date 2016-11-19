import {EventType, eventBus} from '../../event/event-bus';
import {CellChangeEvent} from '../../event/cell-change-event';
import {ActiveShapeChangedEvent} from '../../event/active-shape-changed-event';
import {ActiveShapeEndedEvent} from '../../event/active-shape-ended-event';
import {LightingGrid, FLOOR_COUNT, PANEL_COUNT_PER_FLOOR} from './lighting-grid';
import {Color} from '../../domain/color';
import {CellOffset} from '../../domain/cell';
import {Player} from '../../domain/player';

export class Switchboard {

    private lightingGrid: LightingGrid;
    private player: Player;

    constructor(lightingGrid: LightingGrid, player: Player) {
        this.lightingGrid = lightingGrid;
        this.player = player;
    }
    
    start() {
        eventBus.register(EventType.ActiveShapeChangedEventType, (event: ActiveShapeChangedEvent) => {
            if (this.player === event.player) {
                this.handleActiveShapeChangedEvent(event);
            }
        });

        eventBus.register(EventType.ActiveShapeEndedEventType, (event: ActiveShapeEndedEvent) => {
            if (this.player === event.player) {
                this.handleActiveShapeEndedEvent(event);
            }
        });
        
        eventBus.register(EventType.CellChangeEventType, (event: CellChangeEvent) => {
            if (this.player === event.player) {
                this.handleCellChangeEvent(event);
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

        for (let offset of event.shape.getOffsets()) {
            let offsetFloorIdx = floorIdx - offset.y;
            if (offsetFloorIdx >= FLOOR_COUNT) {
                continue; // Skip obstructed floors
            }
            let offsetPanelIdx = panelIdx + offset.x;
            this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
        }
    }

    private handleActiveShapeEndedEvent(event: ActiveShapeEndedEvent) {
        // TODO: Maybe set some sort of animation in motion
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
                value = 0x00ffff;
                break;
            case Color.Yellow:
                value = 0xffff00;
                break;
            case Color.Purple:
                value = 0x800080;
                break;
            case Color.Green:
                value = 0x008000;
                break;
            case Color.Red:
                value = 0xff0000;
                break;
            case Color.Blue:
                value = 0x0000ff;
                break;
            case Color.Orange:
                value = 0xffa500;
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