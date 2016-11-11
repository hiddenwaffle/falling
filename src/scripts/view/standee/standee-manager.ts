declare const THREE: any;

import {Standee} from './standee';

class StandeeManager {

    readonly group: any;

    private standees: Standee[];

    constructor() {
        this.group = new THREE.Object3D();

        this.standees = [];
    }

    start() {
        //
    }

    step(elapsed: number) {
        for (let standee of this.standees) {
            standee.step(elapsed);
        }
    }
}
export const standeeManager = new StandeeManager();