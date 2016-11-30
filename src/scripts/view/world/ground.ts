declare const THREE: any;

// 1) tree
const FILES_TO_PRELOAD = 1;

class Ground {

    readonly group: any;

    private grass: any;

    private treesSpawned: boolean;
    private treeTexture: any;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.PlaneGeometry(300, 300);
        let material = new THREE.MeshLambertMaterial({emissive: 0x021d03, emissiveIntensity: 1.0});
        this.grass = new THREE.Mesh(geometry, material);
        this.grass.rotation.x = (Math.PI * 3) / 2;
        this.grass.position.set(0, 0, 0);

        this.treesSpawned = false;
        this.treeTexture = null;
    }

    start() {
        this.group.add(this.grass);
    }

    step(elapsed: number) {
        if (this.treesSpawned === false && this.treeTexture != null) {
            this.spawnTree(-2, 1);
            this.spawnTree(9.5, 1);
            this.spawnTree(14, 7);
            this.treesSpawned = true;
        }
    }

    preload(signalThatTextureWasLoaded: (result: boolean) => any): number {
        let textureLoadedHandler = (texture: any) => {
            this.treeTexture = texture;
            signalThatTextureWasLoaded(true);
        };

        let errorHandler = () => {
            signalThatTextureWasLoaded(false);
        };

        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('tree.png', textureLoadedHandler, undefined, errorHandler);

        return FILES_TO_PRELOAD;
    }

    private spawnTree(x: number, z: number) {
        let material = new THREE.SpriteMaterial({map: this.treeTexture});
        let sprite = new THREE.Sprite(material);
        sprite.scale.set(2.5, 2.5, 2.5);
        sprite.position.set(x, 1.1, z);
        sprite.material.color.setRGB(0.5, 0.5, 0.5);
        this.group.add(sprite);
    }
}
export const ground = new Ground();