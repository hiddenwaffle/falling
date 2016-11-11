declare const THREE: any;

export class Standee {

    readonly sprite: any;

    private npcId: number;

    constructor(npcId: number) {
        this.npcId = npcId;
        
        // // TODO: Delete this temporary code
        // let textureLoader = new THREE.TextureLoader();
        // let texture = textureLoader.load('crono.png');
        // let material = new THREE.SpriteMaterial({map: texture});
        // this.sprite = new THREE.Sprite(material);
        // this.sprite.position.set(-2, 0, 15);
        // this.sprite.scale.set(1, 1.35, 1);
    }

    start() {
    }

    step(elapsed: number) {
        // let z = this.sprite.position.z -= 0.025;
        // this.sprite.position.setZ(z);
    }
}