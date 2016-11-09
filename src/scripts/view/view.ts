declare const THREE: any;

import {switchboard} from './switchboard';
import {world} from './world';

class View {

    private scene: any;
    private camera: any;
    private renderer: any;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
    }

    start() {
        this.doStart();
        world.start();
        switchboard.start();
    }

    step(elapsed: number) {
        world.step(elapsed);
        this.renderer.render(this.scene, this.camera);
    }

    private doStart() {
        this.scene.add(world.getGroup());

        // TODO: Temporary for debugging?
        this.scene.add(new THREE.AmbientLight(0x404040));

        this.camera.position.set(-2, 1, 18);
        this.camera.lookAt(new THREE.Vector3(4, 7, 0));

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }
}
export const view = new View();