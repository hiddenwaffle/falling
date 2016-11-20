declare const THREE: any;

import {PANEL_COUNT_PER_FLOOR} from './lighting-grid';

export class HpPanels {

    readonly group: any;

    private panels: any[];

    constructor() {
        this.group = new THREE.Object3D();
        
        this.panels = [];
        for (let idx = 0; idx < PANEL_COUNT_PER_FLOOR; idx++) {
            let geometry = new THREE.PlaneGeometry(0.6, 0.6);
            let material = new THREE.MeshPhongMaterial();
            let panel = new THREE.Mesh(geometry, material);
            let x = idx;
            let y = 0;
            let z = 0;
            panel.position.set(x, y, z);

            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xffffff);
            panel.material.emissiveIntensity = 0.25;

            this.panels.push(panel);
        }
    }

    start() {
        for (let panel of this.panels) {
            this.group.add(panel);
        }

        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 0);
    }

    step(elapsed: number) {
        //
    }
}