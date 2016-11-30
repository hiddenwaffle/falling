import {PANEL_COUNT_PER_FLOOR} from '../domain/constants';

export const MAX_HP = PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.

class Vitals {
    humanHitPoints: number;
    aiHitPoints: number;

    constructor() {
        this.humanHitPoints = 4; // FIXME: Make 10 again
        this.aiHitPoints = MAX_HP;
    }
}
export const vitals = new Vitals();