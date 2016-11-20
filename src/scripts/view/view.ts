declare const THREE: any;

import {cameraWrapper} from './camera-wrapper';
import {world} from './world/world';
import {LightingGrid} from './lighting/lighting-grid';
import {Switchboard} from './lighting/switchboard';
import {standeeManager} from './standee/standee-manager';
import {PlayerType} from '../domain/player-type';

class View {

    private canvas: HTMLCanvasElement;
    private scene: any;
    private renderer: any;

    private humanGrid: LightingGrid;
    private humanSwitchboard: Switchboard;
    private aiGrid: LightingGrid;
    private aiSwitchboard: Switchboard;

    constructor() {
        this.scene = new THREE.Scene();
        
        this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});

        this.humanGrid = new LightingGrid();
        this.humanSwitchboard = new Switchboard(this.humanGrid, PlayerType.Human);
        this.aiGrid = new LightingGrid();
        this.aiSwitchboard = new Switchboard(this.aiGrid, PlayerType.Ai);
    }

    start() {
        this.humanGrid.start();
        this.humanSwitchboard.start();
        this.aiGrid.start();
        this.aiSwitchboard.start();

        this.doStart();

        world.start();
        standeeManager.start();

        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
    }

    step(elapsed: number) {
        world.step(elapsed);

        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);

        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);

        standeeManager.step(elapsed);

        this.renderer.render(this.scene, cameraWrapper.camera);
    }

    private doStart() {
        this.scene.add(world.group);
        this.scene.add(standeeManager.group);

        this.scene.add(this.humanGrid.group);

        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(11);
        this.aiGrid.group.position.setZ(1);
        this.aiGrid.group.rotation.y = -Math.PI / 4;

        // TODO: Temporary for debugging?
        // this.scene.add(new THREE.AmbientLight(0x404040));

        // TODO: Temporary
        let spotLight = new THREE.SpotLight(0xbbbbff);
        spotLight.position.set(-3, 0.75, 15);
        spotLight.target = this.aiGrid.group;
        this.scene.add(spotLight);

        cameraWrapper.setPosition(-3, 0.75, 15); // More or less eye-level with the NPCs.
        cameraWrapper.lookAt(new THREE.Vector3(5, 8, 2));

        cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', () => {
            cameraWrapper.updateRendererSize(this.renderer);
        });
    }
}
export const view = new View();
