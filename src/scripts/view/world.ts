declare const THREE: any;

import {building} from './building';
import {lightingGrid} from './lighting-grid';

class World {
    
    private group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        this.group.add(building.getGroup());
        this.group.add(lightingGrid.getGroup());

        building.start();
        lightingGrid.start();
    }

    step(elapsed: number) {
        building.step(elapsed);
        lightingGrid.step(elapsed);
    }

    getGroup() {
        return this.group;
    }
}
export const world = new World();