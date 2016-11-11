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
        // this.tempThing(); // TODO: Temporary, remove this
    }

    step(elapsed: number) {
        for (let standee of this.standees) {
            standee.step(elapsed);
        }
    }

    // private tempThing() {
    //     let standee = new Standee(123);
    //     this.group.add(standee.sprite);
    //     this.standees.push(standee);
    // }
}
export const standeeManager = new StandeeManager();