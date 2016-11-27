declare const THREE: any;

import {cameraWrapper} from './camera-wrapper';
import {sky} from './world/sky';
import {ground} from './world/ground';
import {LightingGrid} from './lighting/lighting-grid';
import {Switchboard} from './lighting/switchboard';
import {standeeManager} from './standee/standee-manager';
import {PlayerType} from '../domain/player-type';
import {HpOrientation} from '../domain/hp-orientation';
import {RowClearDirection} from '../domain/row-clear-direction';

class View {

    private canvas: HTMLCanvasElement;

    private scene: any;

    private renderer: any;

    private humanGrid: LightingGrid;
    private humanSwitchboard: Switchboard;
    private aiGrid: LightingGrid;
    private aiSwitchboard: Switchboard;

    constructor() {
        this.canvas = <HTMLCanvasElement> document.getElementById('canvas');

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});

        this.humanGrid = new LightingGrid(HpOrientation.DecreasesRightToLeft, RowClearDirection.RightToLeft);
        this.humanSwitchboard = new Switchboard(this.humanGrid, PlayerType.Human);
        this.aiGrid = new LightingGrid(HpOrientation.DecreasesLeftToRight, RowClearDirection.LeftToRight);
        this.aiSwitchboard = new Switchboard(this.aiGrid, PlayerType.Ai);
    }

    start() {
        this.humanGrid.start();
        this.humanSwitchboard.start();
        this.aiGrid.start();
        this.aiSwitchboard.start();

        this.doStart();

        sky.start();
        ground.start();
        standeeManager.start();

        // The canvas should have been hidden until setup is complete.
        this.canvas.style.opacity = '1';      
        this.canvas.style.transition = 'opacity 2s';
    }

    step(elapsed: number) {
        sky.step(elapsed);
        ground.step(elapsed);

        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);

        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);

        standeeManager.step(elapsed);

        this.renderer.render(this.scene, cameraWrapper.camera);
    }

    private doStart() {
        this.scene.add(sky.group);

        this.scene.add(ground.group);
        this.scene.add(standeeManager.group);

        this.scene.add(this.humanGrid.group);

        this.scene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(12);
        this.aiGrid.group.position.setZ(-2);
        this.aiGrid.group.rotation.y = -Math.PI / 3.5;

        let spotLightColor = 0x9999ee;
        let spotLight = new THREE.SpotLight(spotLightColor);
        spotLight.position.set(-3, 0.75, 20);
        spotLight.target = this.aiGrid.group;
        this.scene.add(spotLight);

        cameraWrapper.camera.position.set(5, 0.4, 15);
        cameraWrapper.camera.lookAt(new THREE.Vector3(6, 7, 2));

        cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', () => {
            cameraWrapper.updateRendererSize(this.renderer);
        });
    }
}
export const view = new View();
