declare const THREE: any;

class Building {

    readonly group: any;

    private slab: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.BoxGeometry(11, 20, 10);
        let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        this.slab = new THREE.Mesh(geometry, material);
        this.slab.position.set(4.5, 10, -5.8);

        // TODO: Delete this temporary code
        // {
        //     let textureLoader = new THREE.TextureLoader();
        //     let texture = textureLoader.load('crono.png');
        //     let material = new THREE.SpriteMaterial({map: texture}); // FIXME: Why isn't this needed - depthWrite: true
        //     let sprite = new THREE.Sprite(material);
        //     sprite.position.set(5, 10, 0);
        //     this.group.add(sprite);
        // }
    }

    start() {
        this.group.add(this.slab);
    }

    step(elapsed: number) {
        //
    }
}
export const building = new Building();