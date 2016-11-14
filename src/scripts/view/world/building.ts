declare const THREE: any;

class Building {

    readonly group: any;

    private slab: any;

    constructor() {
        this.group = new THREE.Object3D();

        // This is the old plain cube.
        // let geometry = new THREE.BoxGeometry(11, 20, 10);
        // let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        // this.slab = new THREE.Mesh(geometry, material);
        // this.slab.position.set(4.5, 10, -5.8);
    }

    start() {
        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', (materials: any) => {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', (obj: any) => {
                obj.scale.setScalar(0.25);
                obj.position.set(5, -1.01, 0);
                this.group.add(obj);
            }, () => { }, () => { console.log('error while loading :(') });
        });
    }

    step(elapsed: number) {
        //
    }
}
export const building = new Building();