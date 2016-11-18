declare const THREE: any;

import {sky} from './sky';
import {ground} from './ground';

class World {
    
    readonly group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        this.group.add(sky.group);
        this.group.add(ground.group);

        sky.start();
        ground.start();
    }

    step(elapsed: number) {
        sky.step(elapsed);
        ground.step(elapsed);
    }
}
export const world = new World();