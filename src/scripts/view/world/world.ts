declare const THREE: any;

import {sky} from './sky';
import {building} from './building';
import {ground} from './ground';

class World {
    
    readonly group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        this.group.add(sky.group);
        this.group.add(building.group);
        this.group.add(ground.group);

        sky.start();
        building.start();
        ground.start();
    }

    step(elapsed: number) {
        sky.step(elapsed);
        building.step(elapsed);
        ground.step(elapsed);
    }
}
export const world = new World();