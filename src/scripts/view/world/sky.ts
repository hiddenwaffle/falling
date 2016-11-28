declare const THREE: any;

const START_Z_ANGLE = -(Math.PI / 30);
const END_Z_ANGLE   =   Math.PI / 30;
const ROTATION_SPEED = 0.0005;

class Sky {

    readonly group: any;

    private dome: any;
    private rdz: number;

    constructor() {
        this.group = new THREE.Object3D();

        let geometry = new THREE.SphereGeometry(50, 32, 32); // new THREE.BoxGeometry(150, 150, 150);
        let texture = new THREE.Texture(this.generateTexture());
        texture.needsUpdate = true;
        let material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
        this.dome = new THREE.Mesh(geometry, material);
        this.dome.material.side = THREE.BackSide;
        this.dome.position.set(10, 10, 0);
        this.group.add(this.dome);

        this.rdz = -ROTATION_SPEED;
    }

    start() {
        this.dome.rotation.set(0, 0, START_Z_ANGLE);
    }

    step(elapsed: number) {
        this.dome.rotation.set(0, 0, this.dome.rotation.z + this.rdz);
        if (this.dome.rotation.z >= END_Z_ANGLE) {
            this.rdz = -ROTATION_SPEED;
        } else if (this.dome.rotation.z <= START_Z_ANGLE) {
            this.rdz = ROTATION_SPEED;
        }
    }

    /**
     * Based on: http://stackoverflow.com/a/19992505
     */
    private generateTexture(): any {
        let size = 512;
        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        let ctx = canvas.getContext('2d');
        ctx.rect(0, 0, size, size);
        let gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0.00, '#000000');
        gradient.addColorStop(0.40, '#131c45');
        gradient.addColorStop(0.75, '#ff9544');
        gradient.addColorStop(0.85, '#131c45');
        gradient.addColorStop(1.00, '#131c45');
        ctx.fillStyle = gradient;
        ctx.fill();
        return canvas;
    }
}
export const sky = new Sky();