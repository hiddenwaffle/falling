declare const THREE: any;

class Ground {

    readonly group: any;

    private grass: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.PlaneGeometry(300, 300);
        let material = new THREE.MeshLambertMaterial({emissive: 0xd5b458, emissiveIntensity: 0.75});
        this.grass = new THREE.Mesh(geometry, material);
        this.grass.rotation.x = (Math.PI * 3) / 2;
        this.grass.position.set(0, -2, 0);
    }

    start() {
        this.group.add(this.grass);
    }

    step(elapsed: number) {
        //
    }
}
export const ground = new Ground();