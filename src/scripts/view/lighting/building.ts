declare const THREE: any;

import {buildingPreloader} from './building-preloader';

export class Building {

    readonly group: any;

    private slab: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        let obj = buildingPreloader.getInstance();
        obj.scale.setScalar(0.25);
        obj.position.set(5, -0.01, 0);
        this.group.add(obj);
    }

    step(elapsed: number) {
        //
    }
}