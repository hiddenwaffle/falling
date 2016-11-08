declare const THREE: any;

class Building {

    private group: any;

    constructor() {
        this.group = new THREE.Object3D();
    }

    start() {
        //
    }

    step(elapsed: number) {
        //
    }

    getGroup() {
        return this.group;
    }
}
export const building = new Building();