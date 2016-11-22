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

    private skyScene: any;
    private leftScene: any;
    private rightScene: any;
    private groundScene: any;

    private renderer: any;

    private humanGrid: LightingGrid;
    private humanSwitchboard: Switchboard;
    private aiGrid: LightingGrid;
    private aiSwitchboard: Switchboard;

    constructor() {
        this.canvas = <HTMLCanvasElement> document.getElementById('canvas');

        this.skyScene = new THREE.Scene();
        this.leftScene = new THREE.Scene();
        this.rightScene = new THREE.Scene();
        this.groundScene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});
        this.renderer.autoClear = false;

        this.humanGrid = new LightingGrid(RowClearDirection.LeftToRight);
        this.humanSwitchboard = new Switchboard(this.humanGrid, PlayerType.Human);
        this.aiGrid = new LightingGrid(RowClearDirection.RightToLeft);
        this.aiSwitchboard = new Switchboard(this.aiGrid, PlayerType.Ai);
    }

    start() {
        this.humanGrid.start(HpOrientation.DecreasesRightToLeft);
        this.humanSwitchboard.start();
        this.aiGrid.start(HpOrientation.DecreasesLeftToRight);
        this.aiSwitchboard.start();

        this.doStart();

        sky.start();
        ground.start();
        standeeManager.start();

        // The canvas should have been hidden until setup is complete.
        this.canvas.style.display = 'inline';
    }

    step(elapsed: number) {
        sky.step(elapsed);
        ground.step(elapsed);

        this.humanSwitchboard.step(elapsed);
        this.humanGrid.step(elapsed);

        this.aiGrid.step(elapsed);
        this.humanSwitchboard.step(elapsed);

        standeeManager.step(elapsed);

        this.renderer.clear();
        this.renderer.render(this.skyScene, cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.leftScene, cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.rightScene, cameraWrapper.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.groundScene, cameraWrapper.camera);
    }

    private doStart() {
        this.skyScene.add(sky.group);

        this.groundScene.add(ground.group);
        this.groundScene.add(standeeManager.group);

        this.leftScene.add(this.humanGrid.group);

        this.rightScene.add(this.aiGrid.group);
        this.aiGrid.group.position.setX(11);
        this.aiGrid.group.position.setZ(1);
        this.aiGrid.group.rotation.y = -Math.PI / 4;

        // TODO: Temporary for debugging?
        // this.scene.add(new THREE.AmbientLight(0x404040));

        // TODO: Temporary?
        let spotLightColor = 0x9999ee;
        let leftSpotLight = new THREE.SpotLight(spotLightColor);
        leftSpotLight.position.set(-3, 0.75, 20);
        leftSpotLight.target = this.aiGrid.group;
        this.leftScene.add(leftSpotLight);
        let rightSpotLight = new THREE.SpotLight(spotLightColor);
        rightSpotLight.position.set(0, 0.75, 20);
        rightSpotLight.target = this.aiGrid.group;
        this.rightScene.add(rightSpotLight);

        cameraWrapper.setPosition(-3, 0.75, 15); // More or less eye-level with the NPCs.
        cameraWrapper.lookAt(new THREE.Vector3(5, 8, 2));

        cameraWrapper.updateRendererSize(this.renderer);
        window.addEventListener('resize', () => {
            cameraWrapper.updateRendererSize(this.renderer);
        });
    }
}
export const view = new View();
