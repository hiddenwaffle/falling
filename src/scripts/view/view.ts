declare const THREE: any;

import {cameraWrapper} from './camera-wrapper';
import {world} from './world/world';
import {lightingGrid} from './lighting/lighting-grid';
import {switchboard} from './lighting/switchboard';
import {standeeManager} from './standee/standee-manager';

class View {

    private scene: any;
    private renderer: any;

    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        // this.renderer.sortObjects = false; // FIXME: I'm not sure why I'm able to comment this out now...
    }

    start() {
        this.doStart();

        world.start();
        lightingGrid.start();
        switchboard.start();
        standeeManager.start();
    }

    step(elapsed: number) {
        world.step(elapsed);
        lightingGrid.step(elapsed);
        switchboard.step(elapsed);
        standeeManager.step(elapsed);

        // FIXME: I'm not really sure why it is sorting these correctly without this:
        // for (let obj of standeeManager.group.children) {
        //     let distance = this.camera.position.distanceTo(obj.position);
        //     obj.renderOrder = distance * -1;
        // }

        this.renderer.render(this.scene, cameraWrapper.camera);
    }

    private doStart() {
        this.scene.add(world.group);
        this.scene.add(standeeManager.group);
        this.scene.add(lightingGrid.group);

        // TODO: Temporary for debugging?
        this.scene.add(new THREE.AmbientLight(0x404040));

        cameraWrapper.camera.position.set(3, 0.75, 15); // A little higher than eye-level with the NPCs.
        cameraWrapper.camera.lookAt(new THREE.Vector3(5, 2, 1));

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            cameraWrapper.camera.aspect = window.innerWidth / window.innerHeight;
            cameraWrapper.camera.updateProjectionMatrix();
        });
    }
}
export const view = new View();
