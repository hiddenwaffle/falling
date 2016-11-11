declare const THREE: any;

export class Standee {

    readonly sprite: any;
    readonly npcId: number;

    constructor(npcId: number) {
        this.npcId = npcId;
        
        // TODO: Delete this temporary code
        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load('crono.png');
        let material = new THREE.SpriteMaterial({map: texture});
        this.sprite = new THREE.Sprite(material);
        this.sprite.position.set(-2, 0, 15);
        // this.sprite.scale.set(1, 1.35, 1);
    }

    start() {
        // this.dx = (Math.random() * 0.05) - 0.025;
        // this.dy = (Math.random() * 0.05) - 0.025;
        // this.dz = (Math.random() * 0.05) - 0.025;
    }

    /**
     * Called by StandeeManager, not individual tracks.
     */
    step(elapsed: number) {
        // let x = this.sprite.position.x += this.dx;
        // this.sprite.position.setX(x);
        // let y = this.sprite.position.y += this.dy;
        // this.sprite.position.setY(y);
        // let z = this.sprite.position.z += this.dz;
        // this.sprite.position.setZ(z);
    }
}