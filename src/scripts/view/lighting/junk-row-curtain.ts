declare const THREE: any;
declare const TWEEN: any;

import {PANEL_COUNT_PER_FLOOR} from './lighting-grid';
import {RowClearDirection} from '../../domain/row-clear-direction';

export class JunkRowCurtain {

    readonly group: any;

    private curtain: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.PlaneGeometry(PANEL_COUNT_PER_FLOOR, 1);
        let material = new THREE.MeshPhongMaterial({color: 0x101030}); // Midnight Blue
        this.curtain = new THREE.Mesh(geometry, material);
    }

    start() {
        this.group.add(this.curtain);

        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);

        this.curtain.visible = false;
    }

    step(elapsed: number) {
        //
    }

    startAnimation(rowCount: number) {
        this.dropCurtain(rowCount);
        // console.log('vertices 1 and 3 x: ' + this.curtain.geometry.vertices[1].x, this.curtain.geometry.vertices[3].x);
        // console.log('vertices 0 and 2 x: ' + this.curtain.geometry.vertices[0].x, this.curtain.geometry.vertices[2].x);
        // console.log('---');

        // TODO: Move this to completeAnimation() once the rest is implemented.
        this.curtain.visible = false;
    }

    /**
     * Position and scale the curtain so that it covers X floors at the bottom.
     */
    private dropCurtain(rowCount: number) {
        if (rowCount === 1) {
            this.curtain.position.set(0, 0, 0);
            this.curtain.scale.set(1, 1, 1);
        } else if (rowCount === 2) {
            this.curtain.position.set(0, 0.5, 0);
            this.curtain.scale.set(1, 2, 1);
        } else if (rowCount === 3) {
            this.curtain.position.set(0, 1, 0);
            this.curtain.scale.set(1, 3, 1);
        } else if (rowCount === 4) {
            this.curtain.position.set(0, 1.5, 0);
            this.curtain.scale.set(1, 4, 1);
        }

        this.curtain.visible = true;
    }
}