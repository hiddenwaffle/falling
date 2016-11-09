declare const THREE: any;

import {sky} from './sky';
import {building} from './building';
import {lightingGrid} from './lighting-grid';

class World {
    
    private group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        this.group.add(sky.group);
        this.group.add(building.group);
        this.group.add(lightingGrid.getGroup());

        sky.start();
        building.start();
        lightingGrid.start();
    }

    step(elapsed: number) {
        sky.step(elapsed);
        building.step(elapsed);
        lightingGrid.step(elapsed);
    }

    getGroup() {
        return this.group;
    }
}
export const world = new World();