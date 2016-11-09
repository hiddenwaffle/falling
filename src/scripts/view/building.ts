declare const THREE: any;

class Building {

    readonly group: any;

    private slab: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.BoxGeometry(12, 25, 10);
        let material = new THREE.MeshLambertMaterial({ambient: 0xffffff, color: 0xffffff});
        this.slab = new THREE.Mesh(geometry, material);
        this.slab.position.set(5, 10, -5.8);
    }

    start() {
        this.group.add(this.slab);
    }

    step(elapsed: number) {
        //
    }
}
export const building = new Building();