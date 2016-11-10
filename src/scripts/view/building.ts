declare const THREE: any;

class Building {

    readonly group: any;

    private slab: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.BoxGeometry(11, 19, 10);
        let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        this.slab = new THREE.Mesh(geometry, material);
        this.slab.position.set(4.5, 8.5, -5.8);
    }

    start() {
        this.group.add(this.slab);
    }

    step(elapsed: number) {
        //
    }
}
export const building = new Building();