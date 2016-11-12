declare const THREE: any;

export class Standee {

    readonly sprite: any;
    readonly npcId: number;

    private dx: number;
    private dy: number;
    private dz: number;

    constructor(npcId: number) {
        this.npcId = npcId;
        
        // TODO: Delete this temporary code
        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load('crono.png');
        let material = new THREE.SpriteMaterial({map: texture});
        this.sprite = new THREE.Sprite(material);
    }

    start() {
        this.sprite.position.set(-200, -1.5, -200);
        // this.sprite.scale.set(1, 1.35, 1);
        // this.sprite.visible = false;

        // this.dx = (Math.random() * 0.05) - 0.025;
        // this.dy = (Math.random() * 0.05) - 0.025;
        // this.dz = (Math.random() * 0.05) - 0.025;
    }

    step(elapsed: number) {
        let x = this.sprite.position.x += this.dx;
        let y = this.sprite.position.y += this.dy;
        let z = this.sprite.position.z += this.dz;
        this.sprite.position.set(x, y, z);
    }

    /**
     * Immediately set standee on given position.
     */
    moveTo(x: number, y: number, z: number) {
        this.sprite.position.set(x, y, z);
    }

    /**
     * Set standee in motion towards given position.
     */
    walkTo(x: number, y: number, z: number, speed: number) {
        let dest = new THREE.Vector3(x, y, z);
        let vec = dest.sub(this.sprite.position);
        vec = vec.normalize();
        vec.multiplyScalar(speed);
        this.dx = vec.x;
        this.dy = vec.y;
        this.dz = vec.z;
        
        // TODO: How to calculate ttl from this?
    }
}