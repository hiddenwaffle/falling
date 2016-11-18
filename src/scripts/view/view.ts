declare const THREE: any;

import {cameraWrapper} from './camera-wrapper';
import {world} from './world/world';
import {lightingGrid} from './lighting/lighting-grid';
import {switchboard} from './lighting/switchboard';
import {standeeManager} from './standee/standee-manager';

class View {

    private canvas: HTMLCanvasElement;
    private scene: any;
    private renderer: any;

    constructor() {
        this.scene = new THREE.Scene();
        
        this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});
        // this.renderer.sortObjects = false; // FIXME: I'm not sure why I'm able to comment this out now...
    }

    start() {
        this.doStart();

        world.start();
        lightingGrid.start();
        switchboard.start();
        standeeManager.start();

        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
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

        cameraWrapper.setPosition(-1, 0.75, 17); // More or less eye-level with the NPCs.
        cameraWrapper.lookAt(new THREE.Vector3(4, 9, 1));

        cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', () => {
            cameraWrapper.updateRendererSize(this.renderer);
        });
    }
}
export const view = new View();
