import {EventType, eventBus} from '../event/event-bus';
import {CellChangeEvent} from '../event/cell-change-event';
import {ActiveShapeChangedEvent} from '../event/active-shape-changed-event';
import {lightingGrid, FLOOR_COUNT, PANEL_COUNT_PER_FLOOR} from './lighting-grid';
import {Color} from '../domain/color';
import {CellOffset} from '../domain/cell';

// TODO: Maybe handles the glass and lights
// TODO: Configure the lights to how the board says it should look
class Switchboard {
    
    start() {
        eventBus.register(EventType.CellChangeEventType, (event: CellChangeEvent) => {
            this.handleCellChangeEvent(event);
        });

        eventBus.register(EventType.ActiveShapeChangedEventType, (event: ActiveShapeChangedEvent) => {
            this.handleActiveShapeChangedEvent(event);
        });

        lightingGrid.start();
    }

    private handleCellChangeEvent(event: CellChangeEvent) {
        // let floorIdx = this.convertRowToFloor(event.cell.row);
        // if (floorIdx >= FLOOR_COUNT) {
        //     return; // Skip obstructed floors
        // }

        // let panelIdx = event.cell.col;
        // let color = this.convertColor(event.cell.getColor());
        // lightingGrid.switchRoomLight(floorIdx, panelIdx, color);
    }

    private handleActiveShapeChangedEvent(event: ActiveShapeChangedEvent) {
        let floorIdx = this.convertRowToFloor(event.shape.getRow());
        let panelIdx = event.shape.getCol();
        let color = this.convertColor(event.shape.color);

        for (let offset of event.shape.getOffsets()) {
            let offsetFloorIdx = floorIdx - offset.y;
            // if (offsetFloorIdx >= FLOOR_COUNT) {
                // continue; // Skip obstructed floors
            // }
            let offsetPanelIdx = panelIdx + offset.x;
            lightingGrid.sendBrightLightTo(offsetFloorIdx, offsetPanelIdx, color);
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
        switch (color) {
            case Color.Empty:
                return 0x000000;
            case Color.Cyan:
                return 0x00ffff;
            case Color.Yellow:
                return 0xffff00;
            case Color.Purple:
                return 0x800080;
            case Color.Green:
                return 0x008000;
            case Color.Red:
                return 0xff0000;
            case Color.Blue:
                return 0x0000ff;
            case Color.Orange:
                return 0xffa500;
        }
        // Shouldn't get here
        return 0x000000;
    }
}
export const switchboard = new Switchboard();