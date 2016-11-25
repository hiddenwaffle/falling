declare const THREE: any;

import {buildingPreloader} from './building-preloader';

export class Building {

    readonly group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        let obj = buildingPreloader.getInstance();
        obj.scale.setScalar(0.25);
        obj.position.set(5, -0.01, 0);
        this.group.add(obj);

        // Quick hack to prevent building from being see-through.
        let geometry = new THREE.PlaneGeometry(9, 3);
        let material = new THREE.MeshLambertMaterial({color: 0x343330});
        let wall = new THREE.Mesh(geometry, material);
        wall.position.set(5, 2, -2.5);

        this.group.add(wall);
    }

    step(elapsed: number) {
        //
    }
}