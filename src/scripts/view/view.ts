declare const THREE: any;

import {world} from './world/world';
import {standeeManager} from './standee/standee-manager';

class View {

    private scene: any;
    private camera: any;
    private renderer: any;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        // this.renderer.sortObjects = false;
    }

    start() {
        this.doStart();
        world.start();
        standeeManager.start();
    }

    step(elapsed: number) {
        world.step(elapsed);
        standeeManager.step(elapsed);

        // NOTE: I'm not really sure why it is sorting these correctly without this:
        // for (let obj of standeeManager.group.children) {
        //     let distance = this.camera.position.distanceTo(obj.position);
        //     obj.renderOrder = distance * -1;
        // }

        this.renderer.render(this.scene, this.camera);
    }

    private doStart() {
        this.scene.add(world.group);
        this.scene.add(standeeManager.group);

        // TODO: Temporary for debugging?
        this.scene.add(new THREE.AmbientLight(0x404040));

        // These two lines set the camera near the "ideal" camera position.
        // this.camera.position.set(-2, 1, 18);
        // this.camera.lookAt(new THREE.Vector3(4, 7, 0));
        this.camera.position.set(-3, 1.5, 20);
        this.camera.lookAt(new THREE.Vector3(4, 9, 0));

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
